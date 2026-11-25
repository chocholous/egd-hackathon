#!/usr/bin/env node
// ca-obo-klik.mjs — otevře stránku s web partem „OBO pošta“ pod uloženým Chrome profilem lab uživatele
// (APFS klon profilu, nekoliduje s jinou session), klikne whoami / Pošta přes OBO / Pošta přímo z SPFx
// a uloží log (výstup web partu, konzole, síťová volání na API) + screenshoty.
// Použití: tools/ca-obo-klik.mjs <profil> <url-stránky> <výstupní-adresář> [tlačítka]
//   tlačítka  čárkami oddělená id (výchozí who,posta,primo; Copilot: retr,chat,odp,pretr,pchat)
//   profil  podadresář ~/.config/ppf-rooms-lab/profily/ (např. tomas.prochazka)
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs, { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [profil, url, out, tl = 'who,posta,primo'] = process.argv.slice(2);
if (!profil || !url || !out || profil === '--help' || profil === '-h') {
  console.log('Použití: tools/ca-obo-klik.mjs <profil> <url-stránky> <výstupní-adresář> [tlačítka]\nKlikne tlačítka web partu (výchozí who,posta,primo; Copilot: retr,chat,odp,pretr,pchat), uloží <profil>.json a <profil>-*.png.');
  process.exit(profil ? 0 : 2);
}
mkdirSync(out, { recursive: true });
const kopie = path.join(mkdtempSync(path.join(os.tmpdir(), 'ca-obo-')), profil);
execFileSync('cp', ['-cR', path.join(process.env.HOME, '.config/ppf-rooms-lab/profily', profil), kopie]);
// profil může právě držet jiná session: klon pak nese její zámky Chromu (SingletonLock/Cookie/Socket) → odstranit jen v klonu
for (const f of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) { try { fs.lstatSync(path.join(kopie, f)); execFileSync('/usr/bin/trash', [path.join(kopie, f)]); } catch {} }
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(kopie,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1200, height: 1100 } });
const p = ctx.pages()[0] ?? await ctx.newPage();
const log = { profil, url, ts: new Date().toISOString(), kroky: [], konzole: [], sit: [] };
p.on('console', (m) => { if (m.text().includes('[obo-sonda]')) log.konzole.push(m.text()); });
p.on('response', (r) => {
  const u = r.url();
  if (u.includes('azurecontainerapps.io') || u.includes('graph.microsoft.com/v1.0/me/messages') || u.includes('graph.microsoft.com/beta/copilot'))
    log.sit.push({ metoda: r.request().method(), url: u.split('?')[0], http: r.status(), authorization: r.request().headers().authorization ? 'Bearer …' : null });
});
await p.goto(url, { waitUntil: 'domcontentloaded' });
await p.waitForSelector('#who', { timeout: 120000 }).catch(() => log.kroky.push({ chyba: 'web part nenalezen', url: p.url() }));
const POPIS = { who: 'whoami', posta: 'pošta přes OBO', primo: 'pošta přímo z SPFx', retr: 'Copilot Retrieval přes OBO', chat: 'Copilot Chat přes OBO',
  odp: 'Retrieval + gateway LLM přes OBO', pretr: 'Copilot Retrieval přímo z SPFx', pchat: 'Copilot Chat přímo z SPFx' };
for (const [id, popis] of tl.split(',').map((x) => [x, POPIS[x] ?? x])) {
  if (!(await p.locator('#' + id).count())) break;
  const t0 = Date.now();
  await p.locator('#' + id).click();
  await p.waitForFunction(() => { const t = document.querySelector('#o')?.textContent || ''; return t && t !== 'volám…' && t !== '…'; }, null, { timeout: 90000 }).catch(() => {});
  const text = await p.locator('#o').innerText();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  log.kroky.push({ popis, wallMs: Date.now() - t0, vystup: json });
  await p.locator('#o').scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(out, `${profil}-${id}.png`), fullPage: true });
  console.log(`--- ${popis} (${Date.now() - t0} ms)\n${text.slice(0, 600)}`);
}
writeFileSync(path.join(out, `${profil}.json`), JSON.stringify(log, null, 2));
await ctx.close();
execFileSync('/usr/bin/trash', [path.dirname(kopie)]);
