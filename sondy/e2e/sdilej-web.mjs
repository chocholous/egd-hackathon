#!/usr/bin/env node
// sdilej-web.mjs - v okne z okno.sh (profil vlastnika webu) projde v otevrenem panelu "Site access / Sdilet web"
// krok 2-5 ze skillu egd-prvni-appka (sekce "Kdyz maji hlasovat i ostatni"): napise jmeno, vybere navrh,
// roli nechá nebo prepne, "Poslat e-mail" nechá nezaskrtnute, a klikne Pridat. Snimky do slozky.
// Pouziti: node sondy/e2e/sdilej-web.mjs <profil> <cast-url-webu> "<jmeno nebo e-mail>" <slozka> [--pridat]
//   bez --pridat jen vybere osobu a vyfoti panel (nic neuklada)
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const [profil, cast, kdo, out] = process.argv.slice(2); const pridat = process.argv.includes('--pridat');
if (!out) { console.log('Pouziti: node sdilej-web.mjs <profil> <cast-url> "<jmeno>" <slozka> [--pridat]'); process.exit(2); }
const port = fs.readFileSync(path.join(process.env.HOME, '.config/ppf-rooms-lab/profily', profil, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim();
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const b = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const p = b.contexts()[0].pages().find(x => x.url().includes(cast));
const panel = p.locator('text=Add users, Microsoft 365 Groups').locator('xpath=ancestor::div[.//input][1]');
const inp = panel.locator('input:visible').first();
await inp.click(); await p.keyboard.type(kdo, { delay: 60 }); await p.waitForTimeout(3000);
await p.screenshot({ path: `${out}/44-sdileni-4-navrh.png` });
await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/45-sdileni-5-vybrano.png` });
console.log('text panelu:', (await panel.innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 400));
if (pridat) {
  await p.getByRole('button', { name: /^(Add|Přidat)$/ }).click(); await p.waitForTimeout(4000);
  await p.screenshot({ path: `${out}/46-sdileni-6-pridano.png` }); console.log('kliknuto Pridat');
}
await b.close();
