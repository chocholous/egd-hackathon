// Test vzhledu značky v prohlížeči: snímek, kontrast (getComputedStyle + vzorec WCAG 2.x), písmo nadpisu
// a průchod klávesnicí (Tab na tlačítko, barva fokusu, Enter = hlas). Profil lab uživatele bez hesla.
// Použití: node znacky-test.mjs <url stránky ?env=WebView> <složka na snímky> <profil> <číslo k hlasu 1-5>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [url, outDir, profil, hlas] = process.argv.slice(2);
if (!url || !outDir || !profil || !hlas) { console.log('Pouziti: node znacky-test.mjs <url> <slozka> <profil> <cislo 1-5>'); process.exit(2); }
const profDir = `${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`;
if (!fs.existsSync(profDir)) { console.log(`chybi profil ${profDir}`); process.exit(3); }
fs.mkdirSync(outDir, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(profDir, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1280, height: 1100 }, locale: 'cs-CZ' });
const p = ctx.pages()[0] ?? await ctx.newPage();
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
const skupina = p.locator('[role=group][aria-label^="Hodnocení"]');
await skupina.waitFor({ timeout: 60000 }).catch(() => {});
if (!await skupina.count()) { console.log('APPKA SE NEVYKRESLILA', p.url().split('?')[0]); await p.screenshot({ path: `${outDir}/0-chyba.png` }); await ctx.close(); process.exit(1); }
await p.waitForTimeout(3000);
const koren = p.locator('section').filter({ has: skupina }).first();
await koren.screenshot({ path: `${outDir}/1-appka.png` });

// měření v prohlížeči: barvy se přepočtou na RGB, kontrast podle relativní luminance WCAG
const mer = () => p.evaluate(() => {
  const rgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 4).map(Number);
  const lum = ([r, g, b]) => { const c = [r, g, b].map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const k = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100; };
  // skutečné pozadí = první neprůhledné pozadí směrem ke kořeni
  const pozadi = (el) => { for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c.length === 3 || c[3] > 0) return c.slice(0, 3); } return [255, 255, 255]; };
  const g = document.querySelector('[role=group][aria-label^="Hodnocení"]');
  const sekce = g.closest('section');
  const h1 = sekce.querySelector('h1');
  const tl = [...g.querySelectorAll('button')];
  const vyb = tl.find((b) => b.getAttribute('aria-pressed') === 'true');
  const neb = tl.find((b) => b.getAttribute('aria-pressed') !== 'true');
  const karta = g.parentElement;
  const text = (el, nazev) => { if (!el) return null; const s = getComputedStyle(el); return { nazev, barva: s.color, pozadi: `rgb(${pozadi(el).join(',')})`, kontrast: k(rgb(s.color), pozadi(el)), velikost: s.fontSize, tucnost: s.fontWeight }; };
  const vedlejsi = sekce.querySelector('p:not([role])') && [...sekce.querySelectorAll('p,div,span')].find((e) => e.children.length === 0 && /Jeden hlas|Dnes jste dali/.test(e.textContent));
  const nazevDlazdice = [...sekce.querySelectorAll('div')].find((e) => e.children.length === 0 && e.textContent === 'hlasů dnes');
  const ramecek = (el, nazev) => { const s = getComputedStyle(el); return { nazev, okraj: s.borderTopColor, pozadi: `rgb(${pozadi(el.parentElement).join(',')})`, kontrast: k(rgb(s.borderTopColor), pozadi(el.parentElement)), roh: s.borderTopLeftRadius }; };
  return {
    h1: { text: h1.textContent, pismo: getComputedStyle(h1).fontFamily, transform: getComputedStyle(h1).textTransform, eonHeadNacteno: document.fonts.check('28px "E.ON Head"'), fonty: [...document.fonts].filter((f) => /E\.ON/.test(f.family)).map((f) => `${f.family}:${f.status}`) },
    karta: { pozadi: getComputedStyle(karta).backgroundColor, roh: getComputedStyle(karta).borderTopLeftRadius, stin: getComputedStyle(karta).boxShadow },
    texty: [text(h1, 'nadpis'), text(sekce.querySelector('p'), 'otázka na kartě'), text(vedlejsi, 'poznámka na kartě (vedlejší text)'), text(nazevDlazdice, 'popis dlaždice'), text(neb, 'nevybrané tlačítko'), text(vyb, 'vybrané tlačítko'), text(vyb?.querySelector('span:last-child'), 'popisek vybraného (12 px)')].filter(Boolean),
    ramecky: [neb && ramecek(neb, 'rámeček tlačítka'), ramecek(sekce.querySelector('h2').parentElement, 'rámeček panelu')].filter(Boolean),
    vybrany: vyb ? { pozadi: getComputedStyle(vyb).backgroundColor, text: vyb.textContent } : null,
  };
});
const pred = await mer();
console.log('1 mereni:', JSON.stringify(pred, null, 1));

// klávesnice: od začátku stránky Tabem k tlačítku s číslem hlas
await p.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
let nalezeno = false; let tabu = 0;
for (; tabu < 80 && !nalezeno; tabu++) {
  await p.keyboard.press('Tab');
  nalezeno = await p.evaluate((n) => { const a = document.activeElement; return !!a && a.closest('[role=group][aria-label^="Hodnocení"]') && a.getAttribute('aria-label')?.startsWith(`${n} `); }, hlas);
}
const fokus = await p.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return { prvek: a.getAttribute('aria-label'), outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, offset: s.outlineOffset, focusVisible: a.matches(':focus-visible') }; });
console.log(`2 fokus po ${tabu} Tab:`, nalezeno, JSON.stringify(fokus));
await koren.screenshot({ path: `${outDir}/2-fokus.png` });
await p.keyboard.press('Enter');
const stav = p.locator('[role=status], [role=alert]');
await stav.first().waitFor({ timeout: 30000 }).catch(() => {});
await p.waitForTimeout(2000);
const zprava = await stav.allTextContents().catch(() => []);
console.log('3 po Enter:', JSON.stringify(zprava));
await koren.screenshot({ path: `${outDir}/3-po-hlasu.png` });
const po = await mer();
console.log('4 mereni po hlasu:', JSON.stringify({ vybrany: po.vybrany, texty: po.texty.filter((t) => /vybran|popisek/.test(t.nazev)) }, null, 1));
// mezerník na jiném tlačítku (o jedno doleva) - druhý způsob ovládání
await p.keyboard.press('Shift+Tab');
const druhy = await p.evaluate(() => document.activeElement?.getAttribute('aria-label'));
await p.keyboard.press('Space');
await p.waitForTimeout(4000);
const zprava2 = await stav.allTextContents().catch(() => []);
console.log('5 Shift+Tab na', druhy, 'a mezerník:', JSON.stringify(zprava2));
await koren.screenshot({ path: `${outDir}/4-po-mezerniku.png` });
await ctx.close();
const kontrastOk = [...po.texty.map((t) => t.kontrast >= 4.5 || (parseFloat(t.velikost) >= 24 && t.kontrast >= 3)), ...po.ramecky.map((r) => r.kontrast >= 3)];
// po hlasu musí fokus zůstat na tlačítku (render staví DOM znovu) a mezerník musí hlas změnit
const ok = nalezeno && fokus.focusVisible && zprava.length > 0 && !!druhy && JSON.stringify(zprava2) !== JSON.stringify(zprava);
console.log('6 kontrast vse >= WCAG AA:', kontrastOk.every(Boolean), '| klavesnice:', ok ? 'OK' : 'SELHALO');
process.exit(ok ? 0 : 1);
