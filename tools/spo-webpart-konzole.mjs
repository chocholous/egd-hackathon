#!/usr/bin/env node
// spo-webpart-konzole.mjs — otevře stránku pod uloženým Chrome profilem lab uživatele, klikne tlačítka web partu
// (button[data-k=…]) a vypíše, co by uživatel viděl v F12: chyby a varování konzole a neúspěšné síťové požadavky.
// Na důkaz chybových hlášek (např. „blocked by CORS policy“). Jen čtení stránky; klikání dělá, co dělají tlačítka.
import { createRequire } from 'node:module'; import path from 'node:path';
const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log(`Použití: spo-webpart-konzole.mjs <profil> <url> [klíč ...] [--shot soubor.png] [--cekej ms]
  profil  podadresář ~/.config/ppf-rooms-lab/profily/ (např. petra.novakova); profil nesmí být otevřený jinde
  url     celá URL stránky (doporučeno s ?env=WebView)
  klíč    hodnoty data-k tlačítek k odkliknutí (v pořadí)
  --cekej ms  pauza po každém kliku (výchozí 3000)
  --pred JS   před klikáním vyhodnotí v konzoli stránky výraz (např. klik na jiné tlačítko); opakovat lze
  --eval JS   po klikání vyhodnotí v konzoli stránky výraz (jako uživatel v F12) a vypíše výsledek (opakovat lze)
Vypíše: KONZOLE <typ>: text, SIT FAIL <url>: důvod, a nakonec text #log web partu (je-li).
Vyžaduje playwright-core z ~/Projects/egd-workshop/sondy/dokumenty/node_modules a Google Chrome.`); process.exit(0);
}
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const evals = args.flatMap((a, i) => (a === '--eval' ? [args[i + 1]] : []));
const predy = args.flatMap((a, i) => (a === '--pred' ? [args[i + 1]] : []));
const shot = opt('--shot', null); const cekej = Number(opt('--cekej', 3000));
const pos = args.filter((a, i) => !a.startsWith('--') && !['--shot', '--cekej', '--eval', '--pred'].includes(args[i - 1]));
const [profil, url, ...klice] = pos;
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1300, height: 900 } });
const p = ctx.pages()[0] ?? await ctx.newPage();
let zaznam = false;   // konzoli a síť vypisuj až od prvního kliku (načtení SharePointu je hlučné)
p.on('console', (m) => { if (zaznam && ['error', 'warning'].includes(m.type())) console.log(`KONZOLE ${m.type()}: ${m.text()}`); });
p.on('requestfailed', (r) => { if (zaznam) console.log(`SIT FAIL ${r.url()}: ${r.failure()?.errorText}`); });
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await p.waitForSelector('#log', { state: 'attached', timeout: evals.length && !klice.length ? 5000 : 60000 }).catch(() => console.log('web part (#log) nenalezen, url=', p.url()));
await p.waitForTimeout(3000);
zaznam = true;
for (const js of predy) { console.log(`--- pred ${js}`); console.log('VYSLEDEK:', await p.evaluate(`(async () => { try { return String(await (${js})); } catch (e) { return 'VYJIMKA ' + e; } })()`)); await p.waitForTimeout(cekej); }
for (const k of klice) {
  console.log(`--- klik ${k}`); await p.locator(`button[data-k="${k}"]`).click();
  // čekej na HOTOVO/CHYBA v #log (nejdéle --cekej × 10), pak vypiš řádek: každé tlačítko ho přepisuje
  await p.waitForFunction((kk) => /^(HOTOVO|CHYBA) /.test(document.querySelector('#log')?.textContent || '') && (document.querySelector('#log')?.textContent || '').includes(kk), k, { timeout: cekej * 10 }).catch(() => {});
  console.log('LOG po kliku:', await p.locator('#log').innerText().catch(() => '-'));
  await p.evaluate(() => { const l = document.querySelector('#log'); if (l) l.textContent = ''; });
}
for (const js of evals) { console.log(`--- eval ${js}`); console.log('VYSLEDEK:', await p.evaluate(`(async () => { try { return String(await (${js})); } catch (e) { return 'VYJIMKA ' + e; } })()`)); await p.waitForTimeout(1000); }
console.log('LOG:\n' + await p.locator('#log').innerText().catch(() => '-'));
if (shot) await p.screenshot({ path: shot, fullPage: true });
await ctx.close();
