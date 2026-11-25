// Test: dve appky Spokojenost (egd-prvni-appka a egd-pripravenost) na jednom webu, pod jednim
// ulozenym Chrome profilem lab uzivatele (bez hesla). Kazda appka: nacte se, klik na hodnoceni,
// potvrzeni, zvyrazneny hlas. Pak znovu prvni appka - jeji hlas tam porad je (appky si neprepisuji data).
// Pouziti: node vedle-sebe-test.mjs <web url> <slozka na snimky> <profil>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [web, outDir, profil] = process.argv.slice(2);
if (!web || !outDir || !profil) { console.log('Pouziti: node vedle-sebe-test.mjs <web> <slozka> <profil>'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const APPKY = [
  { jmeno: 'prvni-appka', url: `${web}/SitePages/prvni-appka.aspx?env=WebView`, otazka: 'Jak jste dnes spokojeni s prostředím kanceláře?', tlacitko: /^4\b/, hodnota: '4', potvrzeni: /^(Zapsáno:|Změněno na) \d\. Díky!$/ },
  { jmeno: 'pripravenost', url: `${web}/SitePages/spokojenost.aspx?env=WebView`, otazka: 'Jak jste dnes spokojení s prostředím kanceláře?', tlacitko: /^Hodnocení 2 z 5$/, hodnota: '2', potvrzeni: /^Děkujeme, vaše hodnocení je uložené\.$/ },
];
let selhalo = 0;
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`, { executablePath: CHROME, headless: true, viewport: { width: 1300, height: 900 } });
const p = ctx.pages()[0] ?? await ctx.newPage();
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
p.on('request', (r) => { if (r.url().includes('/_api/web/lists/')) console.log(`  dotaz: ${decodeURIComponent(r.url()).replace(/.*\/_api\/web\/lists\//, '')} `.slice(0, 160)); });
async function otevri(a) {
  await p.goto(a.url, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => p.goto(a.url, { waitUntil: 'domcontentloaded', timeout: 90000 }));
  return p.getByText(a.otazka).waitFor({ timeout: 90000 }).then(() => true).catch(() => false);
}
// kdo test dela: profil, UPN, skupiny a prava na webu (stejne jako kdo-jsem.mjs)
await p.goto(`${web}/_layouts/15/viewlsts.aspx`, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
const kdo = await p.evaluate(async (w) => {
  const g = async (u) => { const r = await fetch(w + u, { headers: { Accept: 'application/json;odata=nometadata' } }); return r.ok ? r.json() : { chyba: r.status }; };
  const u = await g('/_api/web/currentuser?$select=UserPrincipalName');
  const s = await g('/_api/web/currentuser/groups?$select=Title');
  const perm = await g('/_api/web/EffectiveBasePermissions');
  return { upn: u.UserPrincipalName, skupiny: (s.value || []).map((x) => x.Title), permHigh: perm.High, permLow: perm.Low };
}, web).catch((e) => ({ chyba: String(e).slice(0, 200) }));
console.log(`[${new Date().toISOString()}] profil=${profil} ${JSON.stringify(kdo)}`);
let i = 0;
for (const a of APPKY) {
  i++;
  errs.length = 0;
  console.log(`[${a.jmeno}] ${a.url}`);
  if (!(await otevri(a))) { console.log(`[${a.jmeno}] appka se nenacetla`); selhalo++; await p.screenshot({ path: `${outDir}/${i}-${a.jmeno}-chyba.png` }); continue; }
  await p.getByRole('button', { name: a.tlacitko }).click();
  const ok = await p.getByText(a.potvrzeni).waitFor({ timeout: 30000 }).then(() => true).catch(() => false);
  const zprava = await p.getByRole('status').innerText().catch(() => '-');
  const vybrany = (await p.locator('button[aria-pressed="true"]').innerText().catch(() => '-')).replace(/\s+/g, ' ');
  console.log(`[${a.jmeno}] klik ${a.hodnota}: potvrzeno=${ok} zprava="${zprava}" vybrany="${vybrany}" chyby konzole=${errs.length} ${errs.slice(0, 2).join(' | ')}`);
  if (!ok || !vybrany.startsWith(a.hodnota)) selhalo++;
  await p.screenshot({ path: `${outDir}/${i}-${a.jmeno}-po-hlasu.png`, fullPage: true });
}
// zpet na prvni appku: jeji hlas (4) musi zustat vybrany
const a = APPKY[0];
if (await otevri(a)) {
  await p.locator('button[aria-pressed="true"]').waitFor({ timeout: 30000 }).catch(() => {});
  const vybrany = (await p.locator('button[aria-pressed="true"]').innerText().catch(() => '-')).replace(/\s+/g, ' ');
  console.log(`[${a.jmeno}] po navratu vybrany="${vybrany}"`);
  if (!vybrany.startsWith(a.hodnota)) selhalo++;
  await p.screenshot({ path: `${outDir}/3-${a.jmeno}-po-navratu.png`, fullPage: true });
} else selhalo++;
await ctx.close();
console.log(selhalo ? `SELHALO: ${selhalo}` : 'VSE OK');
process.exit(selhalo ? 1 : 0);
