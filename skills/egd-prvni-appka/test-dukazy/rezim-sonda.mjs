// Režim appky single/open: co uvidí a smí DRUHÝ účet (ne autor). Profil lab uživatele bez hesla.
// Použití: node rezim-sonda.mjs <web> <profil> <stranka.aspx> <seznam> <slozka> [hlas 1-5] [id cizi polozky]
//   1. otevře appku (?env=WebView): vykreslila se / AccessDenied
//   2. REST GET položek seznamu (status, počet)
//   3. když je zadán hlas: klik v appce, zpráva appky
//   4. když je zadáno id cizí položky: REST MERGE (změna Hodnocení) a DELETE recycle - čekáme odmítnutí
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [web, profil, stranka, seznam, slozka, hlas, cizi] = process.argv.slice(2);
if (!slozka) { console.log('Pouziti: node rezim-sonda.mjs <web> <profil> <stranka> <seznam> <slozka> [hlas] [id cizi]'); process.exit(2); }
fs.mkdirSync(slozka, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1280, height: 1000 }, locale: 'cs-CZ' });
const p = ctx.pages()[0] ?? await ctx.newPage();
const v = { profil, web };
await p.goto(`${web}/SitePages/${stranka}?env=WebView`, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
const g = p.locator('[role=group][aria-label^="Hodnocení"]');
await g.waitFor({ timeout: 45000 }).catch(() => {});
v.url = p.url().split('?')[0];
v.appka = (await g.count()) > 0;
await p.screenshot({ path: `${slozka}/${profil}-1-appka.png` });
if (!p.url().startsWith(web)) await p.goto(`${web}/_api/web/title`).catch(() => {});
const rest = (metoda, u, telo, hlavicky = {}) => p.evaluate(async ([w, metoda, u, telo, hlavicky]) => {
  let digest = '';
  if (metoda !== 'GET') { const c = await fetch(w + '/_api/contextinfo', { method: 'POST', headers: { Accept: 'application/json;odata=nometadata' } }); digest = c.ok ? (await c.json()).FormDigestValue : ''; }
  const r = await fetch(w + u, { method: metoda === 'GET' ? 'GET' : 'POST', headers: { Accept: 'application/json;odata=nometadata', 'Content-Type': 'application/json;odata=nometadata', 'X-RequestDigest': digest, ...hlavicky }, body: telo ? JSON.stringify(telo) : undefined });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch { /* text */ }
  return { status: r.status, pocet: j?.value?.length, chyba: j?.['odata.error']?.message?.value || j?.error?.message?.value || (r.ok ? undefined : t.slice(0, 120)) };
}, [web, metoda, u, telo, hlavicky]);
const L = `/_api/web/lists/getbytitle('${seznam}')`;
v.restCteni = await rest('GET', `${L}/items?$select=Id,Hodnoceni,Den,AuthorId`);
v.ja = (await rest('GET', '/_api/web/currentuser?$select=Id')).status;
if (hlas && v.appka) {
  await p.goto(`${web}/SitePages/${stranka}?env=WebView`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await g.waitFor({ timeout: 45000 }).catch(() => {});
  await p.locator(`button[aria-label^="${hlas} "]`).click().catch((e) => { v.klikChyba = e.message.split('\n')[0]; });
  const st = p.locator('[role=status], [role=alert]');
  await st.first().waitFor({ timeout: 30000 }).catch(() => {});
  v.zprava = await st.allTextContents();
  await p.screenshot({ path: `${slozka}/${profil}-2-hlas.png` });
  v.restPoHlasu = await rest('GET', `${L}/items?$select=Id,Hodnoceni,Den,Author/Title&$expand=Author&$orderby=Id desc&$top=3`);
}
if (cizi) {
  v.ciziUprava = await rest('MERGE', `${L}/items(${cizi})`, { Hodnoceni: 1 }, { 'IF-MATCH': '*', 'X-HTTP-Method': 'MERGE' });
  v.ciziSmazani = await rest('POST', `${L}/items(${cizi})/recycle()`);
}
await ctx.close();
console.log(JSON.stringify(v, null, 1));
