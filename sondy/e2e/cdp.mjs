#!/usr/bin/env node
// cdp.mjs - pripoji se k Chromu otevrenemu pres sondy/e2e/okno.sh (port z DevToolsActivePort) a provede kroky
// v aktivni (posledni) karte. Hesla nezadava, jen cte, klika a fotí.
// Pouziti: node sondy/e2e/cdp.mjs <profil> krok [krok...]
//   tab:<cast-url>      prepne na kartu, jejiz adresa obsahuje text
//   goto:<url>          otevre adresu
//   shot:<soubor.png>   snimek okna
//   text                vypise viditelny text stranky (max 4000 znaku)
//   url                 vypise adresu
//   click:<text>        klikne na prvni viditelny prvek s timto textem (role button/link, pak text)
//   fill:<css>=<hodnota>  vyplni pole (jen NEtajne hodnoty, napr. jmeno)
//   wait:<ms>           pocka
//   eval:<js>           vyhodnoti vyraz v karte a vypise JSON
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const [profil, ...kroky] = process.argv.slice(2);
if (!profil || profil === '--help') { console.log(fs.readFileSync(new URL(import.meta.url)).toString().split('\n').slice(1, 13).join('\n')); process.exit(2); }
const dir = path.join(process.env.HOME, '.config/ppf-rooms-lab/profily', profil);
const port = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim();
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const b = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const ctx = b.contexts()[0];
let p = ctx.pages().filter(x => !x.url().startsWith('devtools:')).at(-1) ?? await ctx.newPage();
for (const k of kroky) {
  const i = k.indexOf(':'); const cmd = i < 0 ? k : k.slice(0, i); const arg = i < 0 ? '' : k.slice(i + 1);
  if (cmd === "tab") { p = ctx.pages().find(x => x.url().includes(arg)) ?? p; console.log("karta", p.url()); }
  else if (cmd === "goto") await p.goto(arg, { waitUntil: 'domcontentloaded' });
  else if (cmd === 'shot') { await p.screenshot({ path: arg }); console.log('snimek', arg); }
  else if (cmd === 'text') console.log((await p.evaluate(() => document.body.innerText)).slice(0, 4000));
  else if (cmd === 'url') console.log(p.url());
  else if (cmd === 'wait') await p.waitForTimeout(Number(arg));
  else if (cmd === 'click') {
    const cands = [p.getByRole('button', { name: arg }), p.getByRole('link', { name: arg }), p.getByText(arg, { exact: false })];
    let ok = false;
    for (const c of cands) { const f = c.first(); if (await f.isVisible().catch(() => false)) { await f.click(); ok = true; break; } }
    console.log(ok ? `klik ${arg}` : `NENALEZENO ${arg}`);
  }
  else if (cmd === 'fill') { const j = arg.indexOf('='); await p.fill(arg.slice(0, j), arg.slice(j + 1)); console.log('vyplneno', arg.slice(0, j)); }
  else if (cmd === 'eval') console.log(JSON.stringify(await p.evaluate(arg)));
  else console.log('neznamy krok', k);
}
await b.close().catch(() => {}); // u CDP jen odpoji, okno zustane
