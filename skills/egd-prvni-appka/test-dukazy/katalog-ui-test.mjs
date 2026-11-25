// Test: rucni nahrani .sppkg do katalogu aplikaci webu v prohlizeci (AppCatalog -> Nahrat -> soubor -> OK
// -> Nasadit) pod ulozenym Chrome profilem lab uzivatele (bez hesla; profil prihlasuje clovek pres
// tools/lab-profil-prihlaseni.mjs <profil>). Na zacatku vypise, kdo test dela (UPN, skupiny, prava),
// na konci stav katalogu pres REST. Klikaci cesta je stejna jako tools/lab-ucty-ui-nasazeni.mjs.
// Pouziti: node katalog-ui-test.mjs <web url> <slozka na snimky> <profil> <cesta.sppkg>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [web, outDir, profil, pkg] = process.argv.slice(2);
if (!web || !outDir || !profil || !pkg) { console.log('Pouziti: node katalog-ui-test.mjs <web> <slozka> <profil> <cesta.sppkg>'); process.exit(2); }
const profDir = `${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`;
if (!fs.existsSync(profDir)) { console.log(`chybi profil ${profDir}: prihlasi clovek prikazem tools/lab-profil-prihlaseni.mjs ${profil}`); process.exit(3); }
fs.mkdirSync(outDir, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(profDir, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1400, height: 900 }, locale: 'cs-CZ' });
const p = ctx.pages()[0] ?? await ctx.newPage();
const shot = (n) => p.screenshot({ path: `${outDir}/${n}.png` });
const texty = async () => { const all = []; for (const f of p.frames()) all.push(...await f.evaluate(() => [...document.querySelectorAll('button,input[type=button],input[type=submit],a.ms-Button,[role=button]')].filter((e) => e.offsetParent).map((e) => (e.innerText || e.value || '').trim()).filter(Boolean)).catch(() => [])); return all; };
const katalog = () => p.evaluate(async (w) => { const r = await fetch(w + '/_api/web/sitecollectionappcatalog/AvailableApps', { headers: { Accept: 'application/json;odata=nometadata' } }); if (!r.ok) return { chyba: r.status }; return (await r.json()).value.map((x) => ({ t: x.Title, id: x.ID, produkt: x.ProductId, nasazena: x.Deployed, verze: x.AppCatalogVersion })); }, web);
console.log(`[${new Date().toISOString()}] web=${web} profil=${profil} balicek=${path.basename(pkg)}`);
await p.goto(`${web}/AppCatalog/Forms/AllItems.aspx`, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
await p.waitForTimeout(6000);
if (!p.url().startsWith(web)) { console.log('NEPRIHLASEN:', p.url().split('?')[0]); await shot('0-neprihlasen'); await ctx.close(); process.exit(3); }
const kdo = await p.evaluate(async (w) => {
  const g = async (u) => { const r = await fetch(w + u, { headers: { Accept: 'application/json;odata=nometadata' } }); return r.ok ? r.json() : { chyba: r.status }; };
  const u = await g('/_api/web/currentuser?$select=UserPrincipalName,IsSiteAdmin');
  const s = await g('/_api/web/currentuser/groups?$select=Title');
  const perm = await g('/_api/web/EffectiveBasePermissions');
  return { upn: u.UserPrincipalName, adminKolekce: u.IsSiteAdmin, skupiny: (s.value || []).map((x) => x.Title), permHigh: perm.High, permLow: perm.Low };
}, web);
console.log('0 kdo:', JSON.stringify(kdo));
const pred = await katalog();
console.log('1 katalog pred:', JSON.stringify(pred));
await shot('1-katalog');
await p.click('text=Nahrát'); await p.waitForTimeout(4000);
await shot('2-nahrat');
let nahrano = false;
for (const f of p.frames()) { const inp = await f.$('input[type=file]'); if (inp) { await inp.setInputFiles(pkg); await p.waitForTimeout(500); await f.click('input[value="OK"], button:has-text("OK")'); nahrano = true; break; } }
console.log('2 soubor vybran a OK:', nahrano);
await p.waitForTimeout(12000); await shot('3-duvera');
console.log('3 tlacitka po nahrani:', JSON.stringify(await texty()));
let klik = null;
for (const f of p.frames()) for (const sel of ['button:has-text("Nasadit")', 'input[value="Nasadit"]', 'button:has-text("Povolit")', 'button:has-text("Deploy")', 'button:has-text("Enable")']) { if (!klik && await f.$(sel)) { await f.click(sel); klik = sel; } }
console.log('4 kliknuto:', klik);
await p.waitForTimeout(10000); await shot('4-po-nasazeni');
const po = await katalog();
console.log('5 katalog po:', JSON.stringify(po));
await ctx.close();
// uspech = v katalogu je po testu nova nebo zmenena polozka a ta je nasazena (drive nasazene appky se nepocitaji)
const predKlic = new Set((Array.isArray(pred) ? pred : []).map((x) => `${x.id}|${x.produkt}|${x.verze}|${x.nasazena}`));
const nove = (Array.isArray(po) ? po : []).filter((x) => !predKlic.has(`${x.id}|${x.produkt}|${x.verze}|${x.nasazena}`));
console.log('6 nove nebo zmenene v katalogu:', JSON.stringify(nove));
const ok = nahrano && !!klik && nove.some((x) => x.nasazena);
console.log(ok ? 'VSE OK' : 'SELHALO');
process.exit(ok ? 0 : 1);
