#!/usr/bin/env node
// foto-maska.mjs - snimek karty s URL obsahujici <cast-url>, s cernou maskou pres hodnotu hesla na vydejni strance
// (radek "Heslo"). Pouziti: node foto-maska.mjs <profil> <cast-url> <soubor.png>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [profil, cast, out] = process.argv.slice(2);
if (!out) { console.log('Pouziti: node foto-maska.mjs <profil> <cast-url> <soubor.png>'); process.exit(2); }
const dir = path.join(process.env.HOME, '.config/ppf-rooms-lab/profily', profil);
const port = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim();
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const b = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const p = b.contexts()[0].pages().find(x => x.url().includes(cast));
// oznacit kazdy list element, jehoz cely text vypada jako heslo z vydeje (Egd-...), a vsechny jeho predky s jedinym textem
await p.evaluate(() => {
  for (const el of document.querySelectorAll('body *')) {
    if (el.children.length === 0 && /^Egd-\S+$/.test((el.textContent || '').trim())) el.setAttribute('data-e2e-maska', '1');
  }
});
const n = await p.locator('[data-e2e-maska]').count();
if (!n) { console.log('NENALEZENO pole hesla, snimek nedelam'); process.exit(1); }
await p.screenshot({ path: out, mask: [p.locator('[data-e2e-maska]')], maskColor: '#000' });
console.log('snimek', out, 'maskovano poli:', n);
await b.close().catch(() => {});
