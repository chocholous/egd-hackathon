#!/usr/bin/env node
// Vision z prohlížeče jako web part: stránka dostane origin SharePointu (route.fulfill, nic se tam nepíše) a fetch() z ní
// pošle fotku do gateway /api/chat s Authorization (vyvolá CORS preflight). Token: env GW_TOKEN (nevypisuje se).
// Použití: GW_TOKEN=… GW_FQDN=… overeni-vision-prohlizec.mjs <foto.jpg> [origin]
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const [foto, origin = 'https://pavelchocholousgmail.sharepoint.com'] = process.argv.slice(2);
if (!foto || !process.env.GW_TOKEN || !process.env.GW_FQDN) { console.log('Použití: GW_TOKEN=… GW_FQDN=… overeni-vision-prohlizec.mjs <foto> [origin]'); process.exit(1); }
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage();
await p.route(origin + '/**', (r) => r.fulfill({ contentType: 'text/html', body: '<html><body>web part</body></html>' }));
await p.goto(origin + '/sites/test/stranka.aspx');
const b64 = fs.readFileSync(foto).toString('base64');
const out = await p.evaluate(async ({ b64, fqdn, tok }) => {
  const t0 = performance.now();
  try {
    const r = await fetch(`https://${fqdn}/api/chat`, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: [{ type: 'text', text: 'Co je na fotce? Odpověz česky jednou větou.' }, { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + b64 } }] }], max_tokens: 100 }) });
    const j = await r.json(); return { ok: r.ok, status: r.status, ms: Math.round(performance.now() - t0), text: j.text ?? j.error, bodyBytes: b64.length };
  } catch (e) { return { ok: false, err: String(e), ms: Math.round(performance.now() - t0) }; }
}, { b64, fqdn: process.env.GW_FQDN, tok: process.env.GW_TOKEN });
console.log(JSON.stringify({ origin, foto: path.basename(foto), ...out }, null, 1));
await b.close();
