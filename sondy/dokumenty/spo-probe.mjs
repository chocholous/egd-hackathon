// Otevře stránku v labu pod uloženým Chrome profilem lab uživatele a klikne na tlačítka web partu
import { chromium } from 'playwright-core';
const [profile, url, ...clicks] = process.argv.slice(2);
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profile}`, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, acceptDownloads: true, viewport: { width: 1300, height: 900 } });
const p = ctx.pages()[0] ?? await ctx.newPage();
p.on('console', (m) => { if (m.type() === 'error') console.log('console.error:', m.text().slice(0, 200)); });
await p.goto(url, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('#log', { timeout: 60000 }).catch(() => console.log('web part nenalezen, url=', p.url()));
await p.waitForTimeout(3000); console.log('INFO:', await p.locator('#info').innerText().catch(() => '-'));
for (const k of clicks) { const dl = p.waitForEvent('download', { timeout: 60000 }).catch(() => null); await p.locator(`button[data-k="${k}"]`).click(); const d = await dl; if (d) { await d.saveAs(`out-spo/${d.suggestedFilename()}`); console.log('stazeno', d.suggestedFilename()); } await p.waitForTimeout(k === "graphpdf" ? 8000 : 1500); }
console.log('LOG:\n' + await p.locator('#log').innerText().catch(() => '-'));
await p.screenshot({ path: 'shots/spo.png' }); await ctx.close();
