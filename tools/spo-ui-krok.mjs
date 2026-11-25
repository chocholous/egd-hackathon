#!/usr/bin/env node
// spo-ui-krok.mjs — projde kroky v UI SharePointu pod uloženým Chrome profilem lab uživatele
// a vypíše, co UI skutečně ukazuje (texty odkazů, tlačítek, položek menu). Na ověření klikacích cest ve skillech.
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log(`Použití: spo-ui-krok.mjs <profil> <url> [kroky ...] [--shot soubor.png] [--dump] [--headed]
  profil   podadresář ~/.config/ppf-rooms-lab/profily/ (např. petra.novakova)
           jiný adresář profilů: SPO_UI_PROFILY=<adresář> (kopie přes cp -cR, když profil drží jiná session)
  url      stránka, kde začít
  kroky    postupně: "klik:<text>"      klikne na první viditelný prvek s přesně tímto textem (odkaz/tlačítko/menu)
                     "klikobs:<text>"   totéž, ale stačí, když text obsahuje <text>
                     "css:<selektor>"   klikne na CSS/Playwright selektor (hledá i v iframe dialozích)
                     "type:<selektor>=<text>" píše po znacích (people picker), "key:<klávesa>" stiskne klávesu (Enter, Tab)
                     "fill:<selektor>=<hodnota>"  vyplní pole
                     "check:<selektor>" / "uncheck:<selektor>"  zaškrtne / odškrtne
                     "radio:<label text>" zaškrtne přepínač podle popisku
                     "filllabel:<popisek>=<hodnota>", "checklabel:<část popisku>", "unchecklabel:<část popisku>"
                     "select:<selektor>=<text volby>" vybere volbu v <select>
                     "wait:<ms>"        počká
                     "goto:<url>"       přejde jinam
  --dump   po posledním kroku vypíše viditelné odkazy, tlačítka a položky menu (i v iframe)
  --text   po posledním kroku vypíše viditelný text stránky (zkrácený)
  --shot   screenshot po posledním kroku
Vyžaduje playwright-core (z ~/Projects/egd-workshop/sondy/dokumenty/node_modules) a Google Chrome.
Profil nesmí být otevřený v jiném Chrome. Každý krok se vypíše; při chybě vypíše dump a skončí kódem 1.`); process.exit(0);
}
const flag = (f) => args.includes(f);
const val = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : null);
const pos = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--shot');
const [profile, url, ...steps] = pos;
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.SPO_UI_PROFILY || process.env.HOME + '/.config/ppf-rooms-lab/profily'}/${profile}`,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: !flag('--headed'), viewport: { width: 1400, height: 1000 }, locale: 'cs-CZ' });
const p = ctx.pages()[0] ?? await ctx.newPage();
p.on('dialog', (d) => { console.log('DIALOG:', d.message()); d.accept(); });

async function dump() {
  for (const fr of p.frames()) {
    const items = await fr.evaluate(() => {
      const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
      return [...document.querySelectorAll('a,button,[role=menuitem],[role=menuitemcheckbox],[role=tab],[role=link],input[type=submit],input[type=button],label')]
        .filter(vis).map((e) => `${e.tagName.toLowerCase()}${e.getAttribute('role') ? '[' + e.getAttribute('role') + ']' : ''}: ${(e.innerText || e.value || e.getAttribute('aria-label') || e.title || '').trim().replace(/\s+/g, ' ').slice(0, 90)}`)
        .filter((s) => !s.endsWith(': '))
        .concat([...document.querySelectorAll('input[type=text],input:not([type]),input[type=checkbox],input[type=radio],textarea,select')].filter(vis).map((e) => `pole ${e.tagName.toLowerCase()}${e.type ? '[' + e.type + ']' : ''} #${e.id} title="${e.title || ''}" aria="${e.getAttribute('aria-label') || ''}" label="${(e.labels && e.labels[0] ? e.labels[0].innerText : '').trim().slice(0, 60)}"`));
    }).catch(() => []);
    if (items.length) { console.log(`--- frame ${fr.url().slice(0, 120)}`); console.log([...new Set(items)].join('\n')); }
  }
}
async function clickText(t, exact) {
  for (const fr of p.frames()) {
    const loc = fr.getByText(t, { exact }).filter({ visible: true });
    if (await loc.count().catch(() => 0)) { await loc.first().click(); return true; }
    const role = fr.getByRole('menuitem', { name: t, exact }).or(fr.getByRole('button', { name: t, exact })).or(fr.getByRole('link', { name: t, exact })).filter({ visible: true });
    if (await role.count().catch(() => 0)) { await role.first().click(); return true; }
  }
  return false;
}
async function inFrames(sel) {
  for (const fr of p.frames()) { const l = fr.locator(sel).filter({ visible: true }); if (await l.count().catch(() => 0)) return l.first(); }
  throw new Error(`selektor ${sel} nenalezen v žádném rámu`);
}
async function labelInFrames(t) {
  for (const fr of p.frames()) { const l = fr.getByLabel(t).filter({ visible: true }); if (await l.count().catch(() => 0)) return l.first(); }
  throw new Error(`pole s popiskem ${t} nenalezeno v žádném rámu`);
}
try {
  await p.goto(url, { waitUntil: 'commit', timeout: 90000 }); await p.waitForLoadState('domcontentloaded', { timeout: 90000 }).catch(() => {}); await p.waitForTimeout(6000);
  console.log('URL:', p.url());
  for (const s of steps) {
    const [k, ...rest] = s.split(':'); const v = rest.join(':');
    console.log('KROK', s);
    if (k === 'klik' || k === 'klikobs') { if (!(await clickText(v, k === 'klik'))) throw new Error(`prvek s textem "${v}" nenalezen`); }
    else if (k === 'css') await (await inFrames(v)).click();
    else if (k === 'fill') { const [sel, ...h] = v.split('='); await (await inFrames(sel)).fill(h.join('=')); }
    else if (k === 'type') { const [sel, ...h] = v.split('='); const l = await inFrames(sel); await l.click({ force: true }).catch(() => l.focus()); await l.pressSequentially(h.join('='), { delay: 60 }); }
    else if (k === 'key') await p.keyboard.press(v);
    else if (k === 'check') await (await inFrames(v)).check({ force: true });
    else if (k === 'uncheck') await (await inFrames(v)).uncheck();
    else if (k === 'filllabel') { const [l, ...h] = v.split('='); await p.getByLabel(l).first().fill(h.join('=')); }
    else if (k === 'checklabel') await (await labelInFrames(v)).check();
    else if (k === 'unchecklabel') await (await labelInFrames(v)).uncheck();
    else if (k === 'select') { const [sel, ...h] = v.split('='); await (await inFrames(sel)).selectOption({ label: h.join('=') }); }
    else if (k === 'radio') await p.getByLabel(v, { exact: true }).first().check();
    else if (k === 'wait') await p.waitForTimeout(Number(v));
    else if (k === 'goto') await p.goto(v, { waitUntil: 'domcontentloaded' });
    else throw new Error('neznámý krok ' + k);
    await p.waitForTimeout(2500); console.log('  -> URL:', p.url());
  }
  if (flag('--dump')) await dump();
  if (flag('--text')) console.log('TEXT:\n' + (await p.locator('body').innerText()).replace(/\n{2,}/g, '\n').slice(0, 6000));
  if (val('--shot')) await p.screenshot({ path: val('--shot'), fullPage: false });
  await ctx.close();
} catch (e) {
  console.log('CHYBA:', e.message); await dump();
  if (val('--shot')) await p.screenshot({ path: val('--shot') }).catch(() => {});
  await ctx.close(); process.exit(1);
}
