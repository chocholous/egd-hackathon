// UI test appky "Spokojenost s prostredim kancelare dnes" pod ulozenymi Chrome profily lab uzivatelu
// (bez zadavani hesla; profil vyrobi clovek: tools/lab-profil-prihlaseni.mjs <profil>).
// Pouziti: node ui-test.mjs <url stranky s ?env=WebView> <slozka na snimky> <profil>:<hodnoceni> [<profil>:<hodnoceni> ...]
// Kazdy profil klikne na sve hodnoceni; test kontroluje potvrzeni, zvyrazneny hlas a dashboard.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [url, outDir, ...hlasy] = process.argv.slice(2);
if (!url || !outDir || !hlasy.length) { console.log('Pouziti: node ui-test.mjs <url> <slozka> <profil>:<1-5> ...'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let selhalo = 0;
let i = 0;
for (const h of hlasy) {
  const [profil, hodnota] = h.split(':');
  i++;
  const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`, { executablePath: CHROME, headless: true, viewport: { width: 1300, height: 900 } });
  const p = ctx.pages()[0] ?? await ctx.newPage();
  const errs = [];
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  p.on('request', (r) => { if (r.url().includes('/items?')) console.log(`[${profil}] dotaz: ${decodeURIComponent(r.url()).replace(/.*\$orderby/, '$orderby')}`); });
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }));
  const ok = await p.getByText('Jak jste dnes spokojeni s prostředím kanceláře?').waitFor({ timeout: 90000 }).then(() => true).catch(() => false);
  console.log(`[${profil}] url=${p.url().slice(0, 110)} appka=${ok}`);
  if (!ok) { selhalo++; await p.screenshot({ path: `${outDir}/${i}-${profil}-chyba.png` }); await ctx.close(); continue; }
  await p.screenshot({ path: `${outDir}/${i}a-${profil}-start.png` });
  const pred = await p.locator('h1 ~ div').nth(1).innerText().catch(() => '');
  await p.getByRole('button', { name: new RegExp(`^${hodnota}\\b`) }).click();
  const potvrzeno = await p.getByText(/^(Zapsáno:|Změněno na) \d\. Díky!$/).waitFor({ timeout: 30000 }).then(() => true).catch(() => false);
  const zprava = await p.getByRole('status').innerText().catch(() => '-');
  const vybrany = await p.locator('button[aria-pressed="true"]').innerText().catch(() => '-');
  // na bezne strance (ne app page) ma svuj h1 i banner s nazvem stranky: bereme jen h1 appky
  const dash = (await p.locator('h1', { hasText: /Spokojenost s prostředím kanceláře/ }).first().locator('xpath=..').innerText()).replace(/\s+/g, ' ');
  console.log(`[${profil}] klik ${hodnota}: potvrzeno=${potvrzeno} zprava="${zprava}" vybrany="${vybrany.replace(/\s+/g, ' ')}"`);
  console.log(`[${profil}] dashboard: ${dash.slice(dash.indexOf('hlasů dnes') - 4, dash.indexOf('hlasů dnes') + 140)}`);
  if (!potvrzeno || !vybrany.startsWith(hodnota)) selhalo++;
  await p.screenshot({ path: `${outDir}/${i}b-${profil}-po-hlasu.png`, fullPage: true });
  console.log(`[${profil}] chyby konzole: ${errs.length} ${errs.slice(0, 3).join(' | ')}`);
  void pred;
  await ctx.close();
}
console.log(selhalo ? `SELHALO: ${selhalo}` : 'VSE OK');
process.exit(selhalo ? 1 : 0);
