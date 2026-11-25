// Souběh: Jakub má rozpocet-graph.xlsx otevřený k úpravám v Excelu Online a píše do buněk,
// Petra mezitím z web partu volá Graph Excel API (PATCH range, tabulka, POST rows, relace).
// Výstup: časy a výsledky z #log web partu + snímky Excelu Online před/po (vidí Jakub změny živě?).
import { createRequire } from 'node:module'; import path from 'node:path';
const { chromium } = createRequire(path.join(process.env.HOME, '/'))('playwright-core');
const OUT = process.argv[2];
const W = 'https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-dokumenty';
const XLSX = process.argv[3];   // UniqueId rozpocet-graph.xlsx
const prof = (u) => chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${u}`,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1400, height: 950 }, locale: 'cs-CZ' });
const cas = () => new Date().toTimeString().slice(0, 8);
const [ja, pe] = await Promise.all([prof('jakub.kucera'), prof('petra.novakova')]);
const ex = ja.pages()[0] ?? await ja.newPage();
const wp = pe.pages()[0] ?? await pe.newPage();
await Promise.all([
  ex.goto(`${W}/_layouts/15/Doc.aspx?sourcedoc={${XLSX}}&action=edit`, { waitUntil: 'domcontentloaded', timeout: 90000 }),
  wp.goto(`${W}/SitePages/uprava.aspx?env=WebView`, { waitUntil: 'domcontentloaded', timeout: 90000 })]);
await ex.waitForTimeout(25000); await wp.waitForSelector('#log', { state: 'attached', timeout: 60000 });
await ex.screenshot({ path: `${OUT}/soubeh-0-excel-otevreno.png` });
const klik = async (k) => {
  await wp.evaluate(() => { document.querySelector('#log').textContent = ''; });
  const t0 = Date.now(); await wp.locator(`button[data-k="${k}"]`).click();
  await wp.waitForFunction((kk) => /^(HOTOVO|CHYBA) /.test(document.querySelector('#log')?.textContent || '') && document.querySelector('#log').textContent.includes(kk), k, { timeout: 90000 }).catch(() => {});
  console.log(`${cas()} [${k}] ${Date.now() - t0} ms: ${await wp.locator('#log').innerText()}`);
};
// Jakub píše do C6 (buňka mimo oblast API) a nechá ji v režimu úprav (neodeslaná)
await ex.mouse.click(191, 239); await ex.waitForTimeout(400); await ex.keyboard.type('Jakub rucne', { delay: 60 });
console.log(`${cas()} Jakub píše do C6 (neodesláno)`);
await klik('e-range');
await ex.keyboard.press('Enter'); console.log(`${cas()} Jakub odeslal C6`);
await klik('e-tabulka');
await klik('e-radek');
await klik('e-range-relace');
// Jakub přepíše B2 ručně, hned potom API znovu PATCH B2:C3 → kdo vyhraje
await ex.mouse.click(125, 171); await ex.waitForTimeout(400); await ex.keyboard.type('999', { delay: 60 }); await ex.keyboard.press('Enter');
console.log(`${cas()} Jakub zapsal B2=999`);
await klik('e-range');
await ex.waitForTimeout(12000);
await ex.screenshot({ path: `${OUT}/soubeh-1-excel-po-api.png` });
console.log(`${cas()} snímek Excelu po API`);
await klik('e-range');   // poslední čtení A1:C6 přes API po všem
await Promise.all([ja.close(), pe.close()]);
