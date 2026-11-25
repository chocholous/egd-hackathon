#!/usr/bin/env node
// Cte (jen cteni) prava prihlaseneho uzivatele v katalogu aplikaci webu z prohlizece a dekoduje je stejnou maskou jako recon.mjs.
// Pro ucty, ktere se do CLI neprihlasi (AADSTS65001). Pouziti: node prava-z-prohlizece.mjs <profil> <web-url>
import os from 'node:os'; import path from 'node:path'; import { createRequire } from 'node:module';
const { chromium } = createRequire('/opt/homebrew/lib/node_modules/@playwright/cli/package.json')('playwright-core');
const [profil, web0] = process.argv.slice(2); const web = web0.replace(/\/+$/, ''); const rel = new URL(web).pathname;
const ctx = await chromium.launchPersistentContext(path.join(os.homedir(), '.config/ppf-rooms-lab/profily', profil), { channel: 'chrome', headless: true });
const p = ctx.pages()[0] || await ctx.newPage();
await p.goto(web + '/SitePages/Home.aspx', { waitUntil: 'domcontentloaded' }).catch(() => {}); await p.waitForTimeout(4000);
const r = await p.evaluate(async ({ web, rel }) => {
  const g = async (u) => { const x = await fetch(web + u, { credentials: 'include', headers: { Accept: 'application/json;odata=nometadata' } }); return { s: x.status, j: await x.json().catch(() => ({})) }; };
  return { me: await g('/_api/web/currentuser?$select=Title,IsSiteAdmin'), kat: await g(`/_api/web/GetList('${rel}/AppCatalog')?$select=Title,EffectiveBasePermissions`), web: await g('/_api/web/EffectiveBasePermissions') };
}, { web, rel });
await ctx.close();
const PRAVA = { viewListItems: 0x1n, addListItems: 0x2n, editListItems: 0x4n, manageLists: 0x800n, addAndCustomizePages: 0x40000n };
const dek = (e) => { if (!e || e.High === undefined) return 'bez udaje (403 = na web nemas pristup, 404 = seznam/katalog neexistuje)'; const m = (BigInt(e.High) << 32n) | BigInt(e.Low); return `High ${e.High} / Low ${e.Low} -> ` + Object.entries(PRAVA).map(([k, b]) => `${k}=${(m & b) === b ? 'ANO' : 'ne'}`).join(' '); };
console.log(`uzivatel: ${r.me.j.Title} (IsSiteAdmin ${r.me.j.IsSiteAdmin}) na ${web}`);
console.log(`katalog "${r.kat.j.Title}" HTTP ${r.kat.s}: ${dek(r.kat.j.EffectiveBasePermissions)}`);
console.log(`web HTTP ${r.web.s}: ${dek(r.web.j)}`);
