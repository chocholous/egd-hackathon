// Klikne v web partu uprava.aspx na tlačítka z argv a vypíše #log. Čeká, než se nová verze bundlu objeví (tlačítko existuje).
import { createRequire } from 'node:module'; import path from 'node:path';
const { chromium } = createRequire(path.join(process.env.HOME, '/'))('playwright-core');
const W = 'https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-dokumenty';
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${process.env.PROFIL || "tomas.prochazka"}`,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1400, height: 950 }, locale: 'cs-CZ' });
const p = ctx.pages()[0] ?? await ctx.newPage();
const ks = process.argv.slice(2);
for (let pokus = 1; pokus <= 12; pokus++) {
  await p.goto(`${W}/SitePages/uprava.aspx?env=WebView&r=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch((e) => console.log('goto: ' + e.message.split('\n')[0]));
  await p.waitForSelector('#log', { state: 'attached', timeout: 60000 }).catch(() => {});
  if (await p.locator(`button[data-k="${ks[0]}"]`).count()) break;
  console.log(`pokus ${pokus}: tlačítko ${ks[0]} ještě není (starý bundle), čekám 30 s`); await p.waitForTimeout(30000);
}
for (const k of ks) {
  console.log(`--- klik ${k}`);
  await p.evaluate(() => { document.querySelector('#log').textContent = ''; });
  await p.locator(`button[data-k="${k}"]`).click();
  await p.waitForFunction((kk) => /^(HOTOVO|CHYBA) /.test(document.querySelector('#log')?.textContent || '') && document.querySelector('#log').textContent.includes(kk), k, { timeout: 90000 }).catch(() => {});
  console.log('LOG po kliku: ' + await p.locator('#log').innerText());
}
await ctx.close();
