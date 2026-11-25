#!/usr/bin/env node
// office-web-kroky.mjs — otevře soubor z knihovny v Office pro web (Word/Excel/PowerPoint) pod uloženým Chrome profilem
// lab uživatele a spustí kroky ze skriptu (psaní textu, klikání, snímky). Na ruční tvorbu vstupních souborů „jako člověk“.
import { createRequire } from 'node:module'; import path from 'node:path';
const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log(`Použití: office-web-kroky.mjs <profil> <url> <kroky.mjs>
  profil    podadresář ~/.config/ppf-rooms-lab/profily/ (musí mít přístup na web; profil nesmí být otevřený jinde)
  url       {web}/_layouts/15/Doc.aspx?sourcedoc={UniqueId}&action=edit (nebo action=view)
  kroky.mjs  export default async (page, { shot }) => { … }; shot('jmeno') uloží jmeno.png vedle skriptu
Pasti (ověřeno 24. 11. 2026, sondy/dokumenty/uprava/README.md):
  - Word: fokus jen kliknutím do textu v #WACViewPanel_EditingElement rámce WacFrame_Word_Inline a page.bringToFront().
  - Excel: první znak s diakritikou na začátku buňky (Č, Á) se ztratí; česká lokalizace chce =SUMA(), ne =SUM().
  - Excel: innerText rámce může viset, čti s časovým limitem.
Vzory kroků: sondy/dokumenty/uprava/office-web/k-*.mjs`); process.exit(0);
}
const [profil, url, kroky] = args;
const { chromium } = createRequire(path.join(process.env.HOME, '/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1400, height: 950 }, locale: 'cs-CZ' });
const p = ctx.pages()[0] ?? await ctx.newPage();
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
const shot = (n) => p.screenshot({ path: path.join(path.dirname(path.resolve(kroky)), `${n}.png`) });
try { const mod = await import(path.resolve(kroky)); await mod.default(p, { shot }); }
catch (e) { console.log('CHYBA', e.message.split('\n')[0]); await shot('chyba'); process.exitCode = 1; }
await ctx.close();
