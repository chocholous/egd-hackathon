#!/usr/bin/env node
// Spustí JS v kontextu přihlášeného prohlížeče (profil lab uživatele, výchozí egd01) na stránce SharePointu
// a vypíše výsledek. Na měření „co zvládne site owner“ pomocí REST z prohlížeče (cookie relace, žádné heslo).
// Použití: overeni-site-owner.mjs <profil> <web-url> <soubor-s-telem.js> [argumenty-json]
//   tělo souboru = asynchronní funkce `async ({ web, SP, args, cesta }) => {...}`; vrací JSON. Soubor smí číst
//   binární přílohy přes args.soubory = { jmeno: cesta } (načtou se jako base64 do args.b64[jmeno]).
// Profil nesmí být otevřený v jiném Chrome. Vyžaduje playwright-core (sondy/dokumenty/node_modules).
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const [profil, web, telo, argsJson = '{}'] = process.argv.slice(2);
if (!profil || !web || !telo) { console.log('Použití: overeni-site-owner.mjs <profil> <web-url> <telo.js> [args-json]'); process.exit(profil ? 1 : 0); }
const args = JSON.parse(argsJson); args.b64 = {};
for (const [j, c] of Object.entries(args.soubory || {})) args.b64[j] = fs.readFileSync(c).toString('base64');
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, locale: 'en-US' });
const p = ctx.pages()[0] ?? await ctx.newPage();
try {
  await p.goto(web, { waitUntil: 'load' }); await p.waitForTimeout(3000);
  const host = new URL(web).origin;
  if (!p.url().startsWith(host)) { console.log(JSON.stringify({ chyba: 'profil není přihlášený', url: new URL(p.url()).host })); process.exitCode = 2; }
  else {
    const kod = fs.readFileSync(telo, 'utf8');
    const out = await p.evaluate(async ({ kod, web, SP, args }) => { const f = eval(kod); return await f({ web, SP, args }); }, { kod: `(${kod})`, web: web.replace(/\/$/, ''), SP: host, args });
    console.log(JSON.stringify(out, null, 1));
  }
} finally { await ctx.close(); }
