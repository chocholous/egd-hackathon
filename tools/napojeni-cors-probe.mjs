#!/usr/bin/env node
// Změří CORS ve skutečném prohlížeči (headless Chromium přes playwright-core): stránka dostane origin
// SharePointu (route.fulfill na URL tenantu, nic se tam nepíše) a z ní se zavolá fetch() na cizí API,
// jednou jako "simple" GET a jednou s hlavičkou Authorization (vyvolá preflight, jako HttpClient v SPFx).
// Použití: napojeni-cors-probe.mjs [--origin https://x.sharepoint.com] [--url URL ...] [--json]
//          env PLAYWRIGHT_CORE=/cesta/k/playwright-core (výchozí: globální @playwright/cli)
import { createRequire } from 'node:module';
const a = process.argv.slice(2);
if (a.includes('--help') || a.includes('-h')) {
  console.log(`napojeni-cors-probe.mjs [--origin URL] [--url URL ...] [--json]
  Změří, zda cizí API pustí fetch z origin SharePointu (CORS). Bez --url použije vestavěný seznam (ČNB, OTE, ARES, Open-Meteo, jsonplaceholder, ...).
  --origin  výchozí https://pavelchocholousgmail.sharepoint.com
  CHROMIUM_PATH  cesta ke spustitelnému chromiu (když nesedí verze v cache)
  PLAYWRIGHT_CORE  cesta k modulu playwright-core (výchozí globální @playwright/cli)`);
  process.exit(0);
}
const opt = (n, d) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : d; };
const origin = opt('--origin', 'https://pavelchocholousgmail.sharepoint.com');
const urls = a.flatMap((x, i) => (x === '--url' ? [a[i + 1]] : []));
const defaults = [
  'https://api.cnb.cz/cnbapi/exrates/daily?lang=EN',
  'https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt',
  'https://www.ote-cr.cz/cs/kratkodobe-trhy/elektrina/denni-trh',
  'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/27082440',
  'https://api.open-meteo.com/v1/forecast?latitude=50.08&longitude=14.43&current=temperature_2m',
  'https://jsonplaceholder.typicode.com/todos/1',
  'https://www.chmi.cz/files/portal/docs/meteo/ote/ote_pocasi.html',
  'https://example.com/',
];
const req = createRequire(import.meta.url);
const pw = req(process.env.PLAYWRIGHT_CORE || '/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core');
const browser = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
await page.route(origin + '/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>cors probe</body></html>' }));
await page.goto(origin + '/sites/cors-probe');
const out = [];
for (const url of (urls.length ? urls : defaults)) {
  const res = await page.evaluate(async (u) => {
    const t = async (init) => { try { const r = await fetch(u, init); const b = await r.text(); return { ok: true, status: r.status, bytes: b.length }; } catch (e) { return { ok: false, err: String(e.message) }; } };
    return { simple: await t({ mode: 'cors' }), withAuthHeader: await t({ mode: 'cors', headers: { Authorization: 'Bearer x', 'Content-Type': 'application/json' } }) };
  }, url);
  // hlavičky stejně vidí i curl; v prohlížeči rozhoduje výsledek výše
  out.push({ url, origin, ...res });
}
await browser.close();
if (a.includes('--json')) console.log(JSON.stringify(out, null, 1));
else for (const o of out) console.log(o.url + '\n   simple GET: ' + JSON.stringify(o.simple) + '\n   s Authorization (preflight): ' + JSON.stringify(o.withAuthHeader));
