import { build } from 'esbuild'; import { chromium } from 'playwright-core'; import fs from 'node:fs';
const out = process.argv[2] ?? 'out-browser'; fs.mkdirSync(out, { recursive: true });
await build({ entryPoints: ['src/browser-entry.mjs'], bundle: true, minify: true, format: 'iife', platform: 'browser', outfile: 'dist/browser-all.js', define: { global: 'globalThis' }, logLevel: 'error' });
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage(); p.on('console', (m) => console.log('console:', m.text())); p.on('pageerror', (e) => console.log('pageerror:', e.message));
await p.setContent('<html><body>x</body></html>'); await p.addScriptTag({ path: 'dist/browser-all.js' });
const r = await p.evaluate(([a, c]) => window.runAll(a, c), [fs.readFileSync('src/Roboto-Regular.ttf').toString('base64'), fs.readFileSync('src/Roboto-Medium.ttf').toString('base64')]);
for (const [n, v] of Object.entries(r)) { if (v.error) console.log('FAIL', n, v.error); else { const buf = Buffer.from(v.b64, 'base64'); fs.writeFileSync(`${out}/${n}`, buf); console.log('OK', n, buf.length, 'B', v.ms, 'ms'); } }
await b.close();
