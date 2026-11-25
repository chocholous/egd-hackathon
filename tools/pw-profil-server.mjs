#!/usr/bin/env node
// Krokové ovládání prohlížeče pod uloženým Chrome profilem lab uživatele (SSO bez zadávání hesla).
// Spustí persistentní Chrome a na 127.0.0.1:<port> přijímá POST s kusem JS (async tělo funkce s proměnnými
// page, ctx); vrátí výsledek jako JSON. Hodí se na klikání v portálech (make.powerautomate.com), kde se cesta
// hledá postupně podle screenshotů.
import { createRequire } from 'node:module'; import path from 'node:path'; import http from 'node:http';
const args = process.argv.slice(2);
if (!args.length || args.includes('--help')) {
  console.log(`Použití: tools/pw-profil-server.mjs <profil> [--port 9333] [--headful] [--url URL]
  profil   podadresář ~/.config/ppf-rooms-lab/profily/ (např. tomas.prochazka); nesmí být otevřený jinde
  Pak:  curl -s localhost:9333 --data-binary 'await page.goto("https://make.powerautomate.com"); return page.url()'
        curl -s localhost:9333 --data-binary 'await page.screenshot({path:"/tmp/x.png"}); return "ok"'
        curl -s localhost:9333 --data-binary 'process.exit(0)'     (ukončí prohlížeč)
  Kód běží v Node s proměnnými page (aktivní stránka), ctx (BrowserContext), pages() (všechny stránky).
  Jen 127.0.0.1. Vyžaduje playwright-core z ~/Projects/egd-workshop/sondy/dokumenty/node_modules a Google Chrome.`);
  process.exit(0);
}
const profile = args[0];
const port = Number(args[args.indexOf('--port') + 1] || 0) || 9333;
const headful = args.includes('--headful');
const startUrl = args.includes('--url') ? args[args.indexOf('--url') + 1] : '';
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profile}`,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: !headful, viewport: { width: 1500, height: 1000 } });
let page = ctx.pages()[0] ?? await ctx.newPage();
ctx.on('page', (p) => { console.log('[nová stránka]', p.url()); });
if (startUrl) await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
http.createServer((req, res) => {
  let body = ''; req.on('data', (c) => { body += c; });
  req.on('end', async () => {
    try {
      const fn = new AsyncFunction('page', 'ctx', 'pages', 'setPage', body);
      const out = await fn(page, ctx, () => ctx.pages(), (p) => { page = p; });
      res.end(JSON.stringify(out ?? null, null, 1) + '\n');
    } catch (e) { res.statusCode = 500; res.end('CHYBA ' + (e && e.message ? e.message : String(e)) + '\n'); }
  });
}).listen(port, '127.0.0.1', () => console.log(`pw-profil-server: ${profile} na 127.0.0.1:${port}`));
