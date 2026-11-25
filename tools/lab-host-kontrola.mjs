#!/usr/bin/env node
// lab-host-kontrola.mjs - jen cteni: overi, ze ulozeny profil (host nebo lab ucet) se dostane na SharePoint labu.
// Profil zkopiruje (APFS clone) do docasne slozky, aby nekolidoval s jinou session, a headless zavola
// /_api/web/currentuser na kazde zadane URL webu. Heslo ani MFA nezadava; profil musi byt predem prihlaseny
// pres tools/lab-profil-prihlaseni.mjs.
// Pouziti: tools/lab-host-kontrola.mjs <profil> [web ...]
//   profil  podadresar ~/.config/ppf-rooms-lab/profily/ (napr. host-ppf, egd01)
//   web     relativni cesty webu (vychozi: / a /sites/apps)
// Vystup: radek na web: HTTP status a LoginName (200 = pristup, 403 = bez prav, 401/presmerovani = neprihlaseno).
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log('Pouziti: tools/lab-host-kontrola.mjs <profil> [web ...]\nJen cteni: overi pristup ulozeneho profilu na weby labu (vychozi / a /sites/apps).');
  process.exit(args.length ? 0 : 2);
}
const SP = process.env.EGD_LAB_SP_HOST || 'https://pavelchocholousgmail.sharepoint.com';
const [profil, ...weby] = args;
const zdroj = path.join(process.env.HOME, '.config/ppf-rooms-lab/profily', profil);
const kopie = path.join(mkdtempSync(path.join(os.tmpdir(), 'lab-host-')), profil);
execFileSync('cp', ['-cR', zdroj, kopie]);
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(kopie,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = ctx.pages()[0] ?? await ctx.newPage();
await p.goto(SP + '/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(4000);
for (const w of (weby.length ? weby : ['/', '/sites/apps'])) {
  const api = SP + w.replace(/\/$/, '') + '/_api/web/currentuser?$select=LoginName';
  const r = await p.evaluate(async a => {
    const x = await fetch(a, { headers: { Accept: 'application/json;odata=nometadata' } });
    const t = await x.text();
    let login = '';
    try { login = JSON.parse(t).LoginName ?? ''; } catch { login = t.slice(0, 80); }
    return `${x.status} ${login}`;
  }, api).catch(e => `chyba ${e.message.slice(0, 80)}`);
  console.log(`${w}\t${r}`);
}
await ctx.close();
console.log(`(kopie profilu: ${kopie}; smazat: /usr/bin/trash "${path.dirname(kopie)}")`);
