// Klikne 4 tlačítka panelu „Úprava dokumentů“ (appka z Copilot běhu) pod lab profilem a vypíše role=status po každém kliku.
// Použití: node klik-uprava.mjs <profil> <url> [--shot soubor]
import { createRequire } from 'node:module'; import path from 'node:path';
const [profil, url] = process.argv.slice(2);
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1300, height: 1000 } });
const p = ctx.pages()[0] ?? await ctx.newPage();
await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
for (const t of ['Vyplnit šablonu', 'Smlouva', 'Rozpočet', 'Prezentace']) {
  const b = p.getByRole('button', { name: t });
  await b.click({ timeout: 60000 });
  await p.waitForTimeout(8000);
  console.log(t, '=>', (await p.locator('[role=status],[role=alert]').allInnerTexts()).join(' | ').replace(/\s+/g, ' '));
}
await p.screenshot({ path: process.argv[5] ?? 'uprava.png' }); await ctx.close();
