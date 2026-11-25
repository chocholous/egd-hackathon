#!/usr/bin/env node
// Sonda: prepnuti stranky na SingleWebPartAppPage pres REST z prihlasene stranky (stejne jako CLI `spo page set --layoutType`):
// checkoutpage -> ValidateUpdateListItem(PageLayoutType, bNewDocumentUpdate=true) na polozce knihovny SitePages -> savepage -> publish.
// Pouziti: node sonda-rest-layout.mjs <profil> <web> <stranka.aspx>
import os from 'node:os'; import path from 'node:path'; import { createRequire } from 'node:module';
const { chromium } = createRequire('/opt/homebrew/lib/node_modules/@playwright/cli/package.json')('playwright-core');
const [profil, web0, stranka] = process.argv.slice(2); const web = web0.replace(/\/+$/, ''); const rel = new URL(web).pathname;
const ctx = await chromium.launchPersistentContext(path.join(os.homedir(), '.config/ppf-rooms-lab/profily', profil), { channel: 'chrome', headless: true });
const p = ctx.pages()[0] || await ctx.newPage();
await p.goto(web + '/SitePages/Home.aspx', { waitUntil: 'domcontentloaded' }).catch(() => {}); await p.waitForTimeout(4000);
const out = await p.evaluate(async ({ web, rel, stranka }) => {
  const res = []; let dig;
  const call = async (k, m, u, body, hdr = {}) => { const r = await fetch(web + u, { method: m, credentials: 'include', headers: { Accept: 'application/json;odata=nometadata', 'X-RequestDigest': dig, ...hdr }, body }); const t = await r.text(); res.push(`${r.ok ? 'OK ' : 'ERR'} ${k}: HTTP ${r.status}${r.ok ? '' : ' ' + t.slice(0, 200)}`); try { return JSON.parse(t); } catch { return {}; } };
  dig = (await (await fetch(web + '/_api/contextinfo', { method: 'POST', credentials: 'include', headers: { Accept: 'application/json;odata=nometadata' } })).json()).FormDigestValue;
  const J = { 'Content-Type': 'application/json;odata=nometadata' };
  const it = await call('polozka stranky', 'GET', `/_api/web/GetFileByServerRelativeUrl('${rel}/SitePages/${stranka}')/ListItemAllFields?$select=Id,PageLayoutType,CanvasContent1`);
  res.push(`pred: id=${it.Id} layout=${it.PageLayoutType}`);
  await call('checkoutpage', 'POST', `/_api/sitepages/pages(${it.Id})/checkoutpage`, '', J);
  await call('ValidateUpdateListItem PageLayoutType', 'POST', `/_api/web/GetList('${rel}/SitePages')/items(${it.Id})/ValidateUpdateListItem`, JSON.stringify({ formValues: [{ FieldName: 'PageLayoutType', FieldValue: 'SingleWebPartAppPage' }], bNewDocumentUpdate: true }), J);
  await call('savepage', 'POST', `/_api/sitepages/pages(${it.Id})/savepage`, JSON.stringify({ CanvasContent1: it.CanvasContent1 }), J);
  await call('publish', 'POST', `/_api/sitepages/pages(${it.Id})/publish`, '', J);
  const po = await call('polozka po', 'GET', `/_api/web/GetFileByServerRelativeUrl('${rel}/SitePages/${stranka}')/ListItemAllFields?$select=Id,PageLayoutType`);
  res.push(`po: layout=${po.PageLayoutType}`);
  return res;
}, { web, rel, stranka });
console.log(out.join('\n'));
await p.goto(`${web}/SitePages/${stranka}?env=WebView`, { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(8000);
console.log('RENDER:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 160));
console.log('rám SharePointu (Skip to main content / titulek stranky):', await p.evaluate(() => !!document.querySelector('[data-automation-id="pageHeader"], #spPageCanvasContent')));
await ctx.close();
