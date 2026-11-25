#!/usr/bin/env node
// lab-profil-prihlaseni.mjs - otevre VIDITELNY Chrome s trvalym profilem lab uzivatele, aby se do nej
// clovek jednou sam prihlasil (jmeno, heslo, pripadne MFA). Agenti pak profil pouzivaji headless
// bez zadavani hesla (napr. tools/dokumenty-spo-klik.mjs, skills/egd-prvni-appka/test-dukazy/ui-test.mjs).
// Pouziti: tools/lab-profil-prihlaseni.mjs <profil> [url]
//   profil  nazev podadresare v ~/.config/ppf-rooms-lab/profily/ (napr. egd01)
//   url     kam jit (vychozi https://pavelchocholousgmail.sharepoint.com/sites/<profil>-dev)
// Skonci sam, az je okno na SharePointu (prihlaseno), nebo po zavreni okna. Heslo nikam neuklada mimo profil Chrome.
import { createRequire } from 'node:module';
import path from 'node:path';

const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log('Pouziti: tools/lab-profil-prihlaseni.mjs <profil> [url]\nOtevre viditelny Chrome s profilem ~/.config/ppf-rooms-lab/profily/<profil>; prihlas se v nem rucne.');
  process.exit(args.length ? 0 : 2);
}
const SP = process.env.EGD_LAB_SP_HOST || 'https://pavelchocholousgmail.sharepoint.com';
const [profil, url = `${SP}/sites/${args[0]}-dev`] = args;
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(path.join(process.env.HOME, '.config/ppf-rooms-lab/profily', profil),
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: false, viewport: null });
const p = ctx.pages()[0] ?? await ctx.newPage();
await p.goto(url);
console.log(`Prihlas se v otevrenem okne jako ${profil}. Az uvidis SharePoint web, okno se samo zavre.`);
const host = new URL(SP).host;
for (;;) {
  if (p.isClosed()) break;
  const u = p.url();
  if (u.includes(host) && !u.includes('/_forms/') && await p.locator('#SuiteNavWrapper, #O365_NavHeader, [data-automationid="SiteHeader"]').count().catch(() => 0)) {
    await p.waitForTimeout(3000);
    console.log('Prihlaseno, profil ulozen.');
    break;
  }
  await p.waitForTimeout(1500).catch(() => {});
}
await ctx.close().catch(() => {});
