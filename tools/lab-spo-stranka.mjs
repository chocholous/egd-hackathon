#!/usr/bin/env node
// lab-spo-stranka.mjs — otevře stránku SharePointu v labu pod uloženým Chrome profilem lab uživatele
// (bez hesla), volitelně provede kroky (klik / výběr / vyplnění) a vypíše text stránky, prvky formulářů
// a screenshot. Na zkoumání a ověřování klikacích cest ve skillech.
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log(`Použití: lab-spo-stranka.mjs <profil> <url> [krok ...] [--shot soubor.png] [--formy] [--text N]
  profil  podadresář ~/.config/ppf-rooms-lab/profily/ (např. petra.novakova); musí mít přístup na web
  url     celá URL stránky
  krok    click:<text nebo css>   kliknutí (text = viditelný text odkazu/tlačítka)
          select:<css>=<hodnota>   výběr v <select> podle textu volby
          fill:<css>=<text>        vyplnění pole
          wait:<ms>                čekání
  --formy vypíše selecty (id, volby) a tlačítka/inputy typu submit
  --text N vypíše prvních N znaků textu stránky (default 3000)
Příklad: node tools/lab-spo-stranka.mjs petra.novakova "https://.../_layouts/15/IndexedColumns.aspx?List={id}" "click:Vytvořit nový index" --formy
Vyžaduje playwright-core (z ~/Projects/egd-workshop/sondy/dokumenty/node_modules) a Google Chrome. Profil nesmí být otevřený jinde.`);
  process.exit(0);
}
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const shot = opt('--shot', null); const nText = Number(opt('--text', 3000)); const formy = args.includes('--formy');
const pos = args.filter((a, i) => !a.startsWith('--') && !['--shot', '--text'].includes(args[i - 1]));
const [profile, url, ...kroky] = pos;
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profile}`,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1300, height: 900 } });
const p = ctx.pages()[0] ?? await ctx.newPage();
const t0 = Date.now(); const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);
await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch((e) => log('goto:', e.message));
log('URL', p.url());
for (const k of kroky) {
  const [typ, ...rest] = k.split(':'); const v = rest.join(':');
  try {
    if (typ === 'click') {
      const loc = /^[#.\[]/.test(v) ? p.locator(v).first() : p.getByText(v, { exact: false }).first();
      await loc.click({ timeout: 20000 }); await p.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
    } else if (typ === 'select') { const [css, val] = v.split('='); await p.locator(css).selectOption({ label: val }); }
    else if (typ === 'fill') { const [css, val] = v.split('='); await p.locator(css).fill(val); }
    else if (typ === 'wait') await p.waitForTimeout(Number(v));
    log('OK', k, '->', p.url());
  } catch (e) { log('CHYBA', k, e.message.split('\n')[0]); }
}
console.log('TEXT:\n' + (await p.locator('body').innerText().catch(() => '')).slice(0, nText));
if (formy) {
  const f = await p.evaluate(() => ({
    selects: [...document.querySelectorAll('select')].map((s) => ({ id: s.id, name: s.name, options: [...s.options].map((o) => o.text).slice(0, 40) })),
    buttons: [...document.querySelectorAll('input[type=submit],input[type=button],button')].map((b) => `${b.id} | ${b.value || b.innerText}`.trim()).slice(0, 40),
    inputs: [...document.querySelectorAll('input[type=checkbox],input[type=radio],input[type=text]')].map((i) => `${i.type} ${i.id} checked=${i.checked}`).slice(0, 40),
    links: [...document.querySelectorAll('#contentBox a, #DeltaPlaceHolderMain a')].map((a) => `${a.innerText.trim()} -> ${a.getAttribute('href')}`).slice(0, 40),
  }));
  console.log('FORMY:', JSON.stringify(f, null, 1));
}
if (shot) { fs.mkdirSync(path.dirname(path.resolve(shot)), { recursive: true }); await p.screenshot({ path: shot, fullPage: true }); log('shot', shot); }
await ctx.close();
