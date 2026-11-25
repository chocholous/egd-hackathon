// Galík 1.3 v běžící appce: dva schvalovatelé (dva profily prohlížeče) mají otevřenou stejnou žádost.
// A schválí, B (se starým stavem stránky) zamítne. Appka s ETagem musí B odmítnout hláškou a nechat Schváleno.
// Použití: node etag-prohlizece.mjs <profilA> <profilB> <url stránky> "<název žádosti>" <složka snímků>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const [pa, pb, url, nazev, out] = process.argv.slice(2);
const { chromium } = createRequire('/opt/homebrew/lib/node_modules/@playwright/cli/')('playwright-core');
const prof = (p) => `${process.env.HOME}/.config/ppf-rooms-lab/profily/${p}`;
const opt = { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1300, height: 900 } };
const t0 = Date.now(); const log = (...a) => console.log(JSON.stringify({ t: ((Date.now() - t0) / 1000).toFixed(1), ...Object.fromEntries(a) }));
fs.mkdirSync(out, { recursive: true });
const [ca, cb] = await Promise.all([chromium.launchPersistentContext(prof(pa), opt), chromium.launchPersistentContext(prof(pb), opt)]);
const strana = async (ctx, kdo) => {
  const p = ctx.pages()[0] ?? await ctx.newPage();
  await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await p.getByRole('button', { name: /Ke schválení/ }).click({ timeout: 30000 });
  const radek = p.locator('tr', { hasText: nazev });
  await radek.waitFor({ timeout: 30000 });
  log(['kdo', kdo], ['krok', 'otevřeno, žádost vidí'], ['radek', (await radek.innerText()).replace(/\s+/g, ' ').slice(0, 120)]);
  return { p, radek };
};
const A = await strana(ca, pa); const B = await strana(cb, pb);
await A.p.screenshot({ path: `${out}/1-A-pred.png` }); await B.p.screenshot({ path: `${out}/1-B-pred.png` });
await A.radek.getByRole('button', { name: 'Schválit' }).click();
await A.p.waitForLoadState('networkidle'); await A.p.waitForTimeout(2000);
log(['kdo', pa], ['krok', 'Schválit'], ['hlaska', (await A.p.locator('[role=status],[role=alert]').allInnerTexts()).join(' | ')]);
await A.p.screenshot({ path: `${out}/2-A-schvaleno.png` });
await B.radek.getByRole('textbox').fill('zamítá B se starým stavem');
await B.radek.getByRole('button', { name: 'Zamítnout' }).click();
await B.p.waitForLoadState('networkidle'); await B.p.waitForTimeout(3000);
log(['kdo', pb], ['krok', 'Zamítnout (starý stav)'], ['hlaska', (await B.p.locator('[role=status],[role=alert]').allInnerTexts()).join(' | ')],
  ['radek_po', (await B.p.locator('tr', { hasText: nazev }).count())]);
await B.p.screenshot({ path: `${out}/3-B-po-zamitnuti.png` });
await Promise.all([ca.close(), cb.close()]);
