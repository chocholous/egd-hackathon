#!/usr/bin/env node
// Sonda: REST (_api) z PRIHLASENE STRANKY v prohlizeci (cookie + X-RequestDigest), bez tokenu a bez registrace aplikace.
// Pouzije existujici Chrome profil (~/.config/ppf-rooms-lab/profily/<profil>), do ktereho se clovek predtim prihlasil.
// Pouziti: node sonda-rest-prohlizec.mjs <profil> <web-url> <sppkg> [--ano]  (bez --ano jen cteni)
// Heslo se nezadava; kdyz neni prihlaseno, skript to ohlasi a skonci (rc 3).
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { createRequire } from 'node:module';
const req = createRequire('/opt/homebrew/lib/node_modules/@playwright/cli/package.json');
const { chromium } = req('playwright-core');
const [profil, web0, sppkg] = process.argv.slice(2); const ano = process.argv.includes('--ano');
if (!profil || !web0) { console.log('node sonda-rest-prohlizec.mjs <profil> <web-url> <sppkg> [--ano]'); process.exit(1); }
const web = web0.replace(/\/+$/, ''); const rel = new URL(web).pathname;
const ctx = await chromium.launchPersistentContext(path.join(os.homedir(), '.config/ppf-rooms-lab/profily', profil), { channel: 'chrome', headless: true });
const p = ctx.pages()[0] || await ctx.newPage();
await p.goto(web + '/SitePages/Home.aspx', { waitUntil: 'domcontentloaded' }).catch(() => {});
await p.waitForTimeout(4000);
if (!p.url().startsWith(web.split('/sites/')[0])) { console.log('NEPRIHLASEN:', p.url().slice(0, 80)); await ctx.close(); process.exit(3); }
const out = await p.evaluate(async ({ web, rel, ano, b64 }) => {
  const res = [];
  const call = async (k, m, u, body, hdr = {}) => { const r = await fetch(web + u, { method: m, credentials: 'include', headers: { Accept: 'application/json;odata=nometadata', ...hdr }, body }); const t = await r.text(); res.push(`${r.ok ? 'OK ' : 'ERR'} ${k}: HTTP ${r.status}${r.ok ? '' : ' ' + t.slice(0, 160)}`); try { return JSON.parse(t); } catch { return {}; } };
  const ci = await call('contextinfo', 'POST', '/_api/contextinfo', '', {}); const dig = ci.FormDigestValue;
  const J = { 'X-RequestDigest': dig, 'Content-Type': 'application/json;odata=nometadata' };
  const me = await call('currentuser', 'GET', '/_api/web/currentuser?$select=Title,IsSiteAdmin'); res.push('uzivatel: ' + JSON.stringify(me));
  if (!ano) return res;
  const seznam = 'SpokojenostBrowser';
  await call('seznam', 'POST', '/_api/web/lists', JSON.stringify({ Title: seznam, BaseTemplate: 100 }), J);
  const f = (xml) => call('pole', 'POST', `/_api/web/lists/getbytitle('${seznam}')/fields/createfieldasxml`, JSON.stringify({ parameters: { SchemaXml: xml, Options: 8 } }), J);
  await f('<Field Type="Number" DisplayName="Hodnoceni" Name="Hodnoceni" Decimals="0" Min="1" Max="5" Required="TRUE" />');
  await f('<Field Type="Number" DisplayName="DenCislo" Name="DenCislo" Decimals="0" Required="TRUE" Indexed="TRUE" />');
  await f('<Field Type="Text" DisplayName="Klic" Name="Klic" Required="TRUE" Indexed="TRUE" EnforceUniqueValues="TRUE" />');
  const z = await call('zpet', 'GET', `/_api/web/lists/getbytitle('${seznam}')/fields?$filter=InternalName eq 'Klic' or InternalName eq 'DenCislo'&$select=InternalName,Indexed,EnforceUniqueValues`); res.push('zpet: ' + JSON.stringify(z.value));
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  await call('upload sppkg', 'POST', `/_api/web/getfolderbyserverrelativeurl('${rel}/AppCatalog')/files/add(url='spokojenost-browser-sonda.sppkg',overwrite=true)`, bin, { ...J, 'Content-Type': 'application/octet-stream' });
  const av = await call('AvailableApps', 'GET', '/_api/web/sitecollectionappcatalog/AvailableApps?$select=ID,Title,Deployed');
  const app = (av.value || []).find((x) => /spokojenost/i.test(x.Title)); res.push('app: ' + JSON.stringify(app));
  if (app) await call('deploy', 'POST', `/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${app.ID}')/Deploy`, JSON.stringify({ skipFeatureDeployment: false }), J);
  return res;
}, { web, rel, ano, b64: ano ? fs.readFileSync(sppkg).toString('base64') : '' });
console.log(out.join('\n'));
await ctx.close();
