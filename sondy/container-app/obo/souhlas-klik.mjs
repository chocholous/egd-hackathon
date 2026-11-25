#!/usr/bin/env node
// Uživatelský souhlas (user consent) s delegovanými oprávněními API v prohlížeči pod profilem lab uživatele.
// Otevře /authorize s prompt=consent pro API registraci, uloží screenshot obrazovky souhlasu a volitelně klikne „Přijmout“.
// Použití: node souhlas-klik.mjs <profil> <apiAppId> <redirectUri> <výstupní-adresář> [--prijmout]
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [profil, app, redirect, out, flag] = process.argv.slice(2);
if (!out) { console.log('Použití: node souhlas-klik.mjs <profil> <apiAppId> <redirectUri> <výstup> [--prijmout]'); process.exit(2); }
const TENANT = process.env.TENANT_ID || '972a674c-7b85-4e56-a31f-b2f95b42fd1e';
mkdirSync(out, { recursive: true });
const kopie = path.join(mkdtempSync(path.join(os.tmpdir(), 'ca-obo-souhlas-')), profil);
execFileSync('cp', ['-cR', path.join(process.env.HOME, '.config/ppf-rooms-lab/profily', profil), kopie]);
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(kopie, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1000, height: 900 } });
const p = ctx.pages()[0] ?? await ctx.newPage();
const u = new URL(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`);
Object.entries({ client_id: app, response_type: 'code', redirect_uri: redirect, response_mode: 'query', prompt: 'consent',
  scope: 'https://graph.microsoft.com/User.Read https://graph.microsoft.com/Mail.ReadBasic' })
  .forEach(([k, v]) => u.searchParams.set(k, v));
const log = { profil, ts: new Date().toISOString(), kroky: [] };
await p.goto(u.toString(), { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
const tile = p.locator(`[data-test-id="${profil}@pavelchocholousgmail.onmicrosoft.com"], div.table:has-text("${profil}@")`).first();
if (await tile.count()) { await tile.click(); await p.waitForTimeout(6000); log.kroky.push({ krok: 'výběr účtu (Pick an account) kliknut' }); }
log.kroky.push({ krok: 'obrazovka', url: p.url().split('?')[0], text: (await p.locator('body').innerText()).slice(0, 1500) });
await p.screenshot({ path: path.join(out, `${profil}-souhlas.png`), fullPage: true });
if (flag === '--prijmout') {
  const b = p.locator('input[type=submit][value="Accept"], input#idSIButton9, button:has-text("Accept"), button:has-text("Přijmout"), input[value="Přijmout"]').first();
  if (await b.count()) {
    await b.click();
    await p.waitForURL((x) => x.toString().startsWith(redirect), { timeout: 30000 }).catch(() => {});
    const fin = new URL(p.url());
    log.kroky.push({ krok: 'po kliknutí', url: fin.origin + fin.pathname, code: fin.searchParams.has('code') ? '(vydán, nevypisuje se)' : null, error: fin.searchParams.get('error'), error_description: fin.searchParams.get('error_description') });
    await p.screenshot({ path: path.join(out, `${profil}-souhlas-po.png`), fullPage: true });
  } else log.kroky.push({ krok: 'tlačítko Přijmout nenalezeno' });
}
writeFileSync(path.join(out, `${profil}-souhlas.json`), JSON.stringify(log, null, 2));
console.log(JSON.stringify(log, null, 2).slice(0, 2500));
await ctx.close();
execFileSync('/usr/bin/trash', [path.dirname(kopie)]);
