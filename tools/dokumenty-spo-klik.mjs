#!/usr/bin/env node
// dokumenty-spo-klik.mjs — otevře stránku v labu pod uloženým Chrome profilem lab uživatele (bez zadávání hesla)
// a klikne na tlačítka web partu "Generování dokumentů" (data-k=docx|docxtpl|xlsx|pptx|pdf|graphpdf).
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log(`Použití: dokumenty-spo-klik.mjs <profil> <url> [klíč ...] [--out adresář] [--shot soubor.png]
  profil  podadresář ~/.config/ppf-rooms-lab/profily/ (např. petra.novakova); musí mít přístup na web
  url     celá URL stránky (doporučeno s ?env=WebView)
  klíč    tlačítka k odkliknutí; staženým souborům se uloží kopie do --out (default ./out-spo)
Vyžaduje playwright-core (bere se z ~/Projects/egd-workshop/sondy/dokumenty/node_modules) a Google Chrome.
Vypíše text #info a #log z web partu. Profil nesmí být otevřený v jiném Chrome.`); process.exit(0);
}
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'out-spo';
const shot = args.includes('--shot') ? args[args.indexOf('--shot') + 1] : null;
const pos = args.filter((a, i) => !a.startsWith('--') && !['--out', '--shot'].includes(args[i - 1]));
const [profile, url, ...clicks] = pos; fs.mkdirSync(out, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profile}`, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, acceptDownloads: true, viewport: { width: 1300, height: 900 } });
const p = ctx.pages()[0] ?? await ctx.newPage();
await p.goto(url, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#log', { timeout: 60000 }).catch(() => console.log('web part nenalezen, url=', p.url()));
await p.waitForTimeout(3000); console.log('INFO:', await p.locator('#info').innerText().catch(() => '-'));
for (const k of clicks) { const dl = p.waitForEvent('download', { timeout: 60000 }).catch(() => null); await p.locator(`button[data-k="${k}"]`).click(); const d = await dl; if (d) { await d.saveAs(`${out}/${d.suggestedFilename()}`); console.log('stazeno', d.suggestedFilename()); } await p.waitForTimeout(k === 'graphpdf' ? 8000 : 1500); }
console.log('LOG:\n' + await p.locator('#log').innerText().catch(() => '-'));
if (shot) await p.screenshot({ path: shot }); await ctx.close();
