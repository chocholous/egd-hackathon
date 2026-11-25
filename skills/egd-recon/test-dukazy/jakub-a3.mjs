// Cesta A3 (REST z prohlížeče) pod účtem s omezenou rolí: kam se dostane a s jakou hláškou skončí.
// Použití: node jakub-a3.mjs <profil> <web-url> <cesta k .sppkg>
// Zapisuje jen to, co povolí práva přihlášeného uživatele (u Návštěvníka nic). Výstup: JSON řádky.
import os from 'node:os'; import path from 'node:path'; import fs from 'node:fs'; import { createRequire } from 'node:module';
const { chromium } = createRequire('/opt/homebrew/lib/node_modules/@playwright/cli/package.json')('playwright-core');
const [profil, web0, sppkg] = process.argv.slice(2); const web = web0.replace(/\/+$/, ''); const rel = new URL(web).pathname;
const ctx = await chromium.launchPersistentContext(path.join(os.homedir(), '.config/ppf-rooms-lab/profily', profil), { channel: 'chrome', headless: true });
const p = ctx.pages()[0] || await ctx.newPage();
await p.goto(web + '/SitePages/Home.aspx', { waitUntil: 'domcontentloaded' }).catch(() => {}); await p.waitForTimeout(4000);
console.log(JSON.stringify({ krok: 'stránka', url: p.url().slice(0, 100) }));
const bajty = [...fs.readFileSync(sppkg)];
const r = await p.evaluate(async ({ web, rel, bajty }) => {
  const H = { Accept: 'application/json;odata=nometadata' };
  const x = async (krok, u, o = {}) => {
    const res = await fetch(web + u, { credentials: 'include', ...o, headers: { ...H, ...(o.headers || {}) } });
    const t = await res.text(); let msg = ''; try { const j = JSON.parse(t); msg = j['odata.error']?.message?.value || j.error?.message || ''; } catch { msg = t.slice(0, 150); }
    return { krok, status: res.status, msg };
  };
  const out = [];
  const ci = await fetch(web + '/_api/contextinfo', { method: 'POST', credentials: 'include', headers: H });
  const digest = (await ci.json()).FormDigestValue; out.push({ krok: 'contextinfo (digest)', status: ci.status, msg: digest ? 'digest ok' : 'bez digestu' });
  const W = { 'X-RequestDigest': digest, 'Content-Type': 'application/json;odata=nometadata' };
  out.push(await x('kdo jsem', '/_api/web/currentuser?$select=Title,IsSiteAdmin'));
  out.push(await x('A3 krok 1: založit seznam', '/_api/web/lists', { method: 'POST', headers: W, body: JSON.stringify({ Title: 'ReconA3Test', BaseTemplate: 100 }) }));
  out.push(await x('A3 krok 3: nahrát balíček do katalogu', `/_api/web/getfolderbyserverrelativeurl('${rel}/AppCatalog')/files/add(url='recon-a3-test.sppkg',overwrite=true)`,
    { method: 'POST', headers: { 'X-RequestDigest': digest, 'Content-Type': 'application/octet-stream' }, body: new Uint8Array(bajty) }));
  out.push(await x('A3: číst nabídku appek webu', '/_api/web/sitecollectionappcatalog/AvailableApps?$select=Title,Deployed'));
  return out;
}, { web, rel, bajty });
for (const o of r) console.log(JSON.stringify(o));
await ctx.close();
