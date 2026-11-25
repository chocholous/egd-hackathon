#!/usr/bin/env node
// Otevře stránku s web partem „Převod do PDF“ pod uloženým Chrome profilem lab uživatele, klikne „Kdo jsem“, nahraje soubor,
// klikne „Převést do PDF“, stáhne PDF a uloží screenshot. Použití: spfx-klik.mjs <profil> <url-stránky> <soubor> <výstup-dir>
import { createRequire } from 'node:module'; import path from 'node:path'; import fs from 'node:fs';
const [profile, url, file, out] = process.argv.slice(2);
if (!profile || !url || !file || !out || profile === '--help') { console.log('Použití: spfx-klik.mjs <profil> <url-stránky> <soubor> <výstup-dir>  (profil z ~/.config/ppf-rooms-lab/profily/)'); process.exit(0); }
fs.mkdirSync(out, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profile}`, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1300, height: 1000 }, acceptDownloads: true });
const p = ctx.pages()[0] ?? await ctx.newPage();
const log = (...a) => console.log(new Date().toISOString(), ...a);
p.on('console', (m) => { if (m.type() === 'error') log('console.error', m.text().slice(0, 300)); });
p.on('response', (r) => { if (r.url().includes('azurecontainerapps.io')) log('net', r.request().method(), r.status(), r.url()); });
await p.goto(url, { waitUntil: 'domcontentloaded' });
log('url', p.url());
await p.waitForSelector('#go', { timeout: 90000 });
const done = () => p.waitForFunction(() => !/^(volám|převádím)/.test(document.querySelector('#o')?.textContent || ''), null, { timeout: 180000 });
let t = Date.now(); await p.locator('#me').click(); await p.waitForTimeout(300); await done(); log('kdo jsem', Date.now() - t, 'ms\n' + await p.locator('#o').innerText());
await p.locator('#f').setInputFiles(file);
t = Date.now(); await p.locator('#go').click(); await p.waitForTimeout(300); await done(); log('převod', Date.now() - t, 'ms\n' + await p.locator('#o').innerText());
if (await p.locator('#pdf').count()) {
  const [dl] = await Promise.all([p.waitForEvent('download'), p.locator('#pdf').click()]);
  const target = path.join(out, 'z-prohlizece-' + dl.suggestedFilename()); await dl.saveAs(target); log('stažené PDF', target, fs.statSync(target).size, 'B');
}
await p.screenshot({ path: path.join(out, 'webpart.png') }); log('screenshot', path.join(out, 'webpart.png'));
await ctx.close();
