#!/usr/bin/env node
// Sonda: NOVA appka (nove GUIDy) cela cesta jen pres REST z prihlasene stranky v prohlizeci:
// upload .sppkg -> Deploy -> Install -> cekani na web part -> stranka (Article -> SingleWebPartAppPage) -> publikace -> vykresleni v prohlizeci.
// Pouziti: node sonda-rest-prohlizec-nova-appka.mjs <profil> <web> <sppkg> <solutionId> <webPartId> <stranka.aspx> <seznam>
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import crypto from 'node:crypto'; import { createRequire } from 'node:module';
const { chromium } = createRequire('/opt/homebrew/lib/node_modules/@playwright/cli/package.json')('playwright-core');
const [profil, web0, sppkg, solId, wpId, stranka, seznam] = process.argv.slice(2);
if (!seznam) { console.log('node sonda-rest-prohlizec-nova-appka.mjs <profil> <web> <sppkg> <solutionId> <webPartId> <stranka.aspx> <seznam>'); process.exit(1); }
const web = web0.replace(/\/+$/, ''); const rel = new URL(web).pathname;
const ctx = await chromium.launchPersistentContext(path.join(os.homedir(), '.config/ppf-rooms-lab/profily', profil), { channel: 'chrome', headless: true });
const p = ctx.pages()[0] || await ctx.newPage();
await p.goto(web + '/SitePages/Home.aspx', { waitUntil: 'domcontentloaded' }).catch(() => {}); await p.waitForTimeout(4000);
if (!p.url().startsWith(new URL(web).origin)) { console.log('NEPRIHLASEN'); await ctx.close(); process.exit(3); }
const out = await p.evaluate(async ({ web, rel, b64, solId, wpId, stranka, seznam, guid }) => {
  const res = []; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let dig; const call = async (k, m, u, body, hdr = {}) => { const r = await fetch(web + u, { method: m, credentials: 'include', headers: { Accept: 'application/json;odata=nometadata', 'X-RequestDigest': dig, ...hdr }, body }); const t = await r.text(); res.push(`${r.ok ? 'OK ' : 'ERR'} ${k}: HTTP ${r.status}${r.ok ? '' : ' ' + t.slice(0, 220)}`); try { return { ok: r.ok, j: JSON.parse(t) }; } catch { return { ok: r.ok, j: {} }; } };
  dig = (await (await fetch(web + '/_api/contextinfo', { method: 'POST', credentials: 'include', headers: { Accept: 'application/json;odata=nometadata' } })).json()).FormDigestValue;
  const J = { 'Content-Type': 'application/json;odata=nometadata' };
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  await call('upload sppkg', 'POST', `/_api/web/getfolderbyserverrelativeurl('${rel}/AppCatalog')/files/add(url='spokojenost-nova-sonda.sppkg',overwrite=true)`, bin, { 'Content-Type': 'application/octet-stream' });
  await sleep(3000);
  const av = await call('AvailableApps(ID)', 'GET', `/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${solId}')?$select=ID,Title,Deployed`); res.push('app: ' + JSON.stringify(av.j));
  await call('deploy', 'POST', `/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${solId}')/Deploy`, JSON.stringify({ skipFeatureDeployment: false }), J);
  await call('install', 'POST', `/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${solId}')/Install`, '{}', J);
  let nalezen = false; for (let i = 0; i < 20 && !nalezen; i++) { const r = await fetch(web + '/_api/web/GetClientSideWebParts', { credentials: 'include', headers: { Accept: 'application/json;odata=nometadata' } }); const t = await r.text(); nalezen = t.includes(wpId); if (!nalezen) await sleep(6000); }
  res.push(`web part ${wpId} v GetClientSideWebParts: ${nalezen}`);
  // stranka
  const cp = await call('stranka create', 'POST', '/_api/sitepages/pages', JSON.stringify({ PageLayoutType: 'Article', Title: 'Spokojenost B', Name: stranka }), J);
  const pid = cp.j.Id; res.push('stranka id/name: ' + pid + ' ' + cp.j.Name);
  const canvas = JSON.stringify([{ controlType: 3, id: guid, webPartId: wpId, position: { zoneIndex: 1, sectionIndex: 1, controlIndex: 1, layoutIndex: 1 }, webPartData: { id: wpId, instanceId: guid, title: 'Spokojenost', dataVersion: '1.0', properties: { nadpis: 'Spokojenost s prostředím kanceláře dnes', seznam, dnu: 14 } } }, { position: { zoneIndex: 1, sectionIndex: 1, controlIndex: 1, layoutIndex: 1 }, controlType: 0, id: '1', emphasis: {}, displayMode: 2 }].slice(0, 1));
  await call('stranka savepage', 'POST', `/_api/sitepages/pages(${pid})/savepage`, JSON.stringify({ CanvasContent1: canvas, PageLayoutType: 'Article' }), J);
  await call('stranka checkoutpage', 'POST', `/_api/sitepages/pages(${pid})/checkoutpage`, '', J);
  await call('stranka layout -> SingleWebPartAppPage (ValidateUpdateListItem)', 'POST', `/_api/web/GetList('${rel}/SitePages')/items(${pid})/ValidateUpdateListItem`, JSON.stringify({ formValues: [{ FieldName: 'PageLayoutType', FieldValue: 'SingleWebPartAppPage' }], bNewDocumentUpdate: true }), J);
  await call('stranka publish', 'POST', `/_api/sitepages/pages(${pid})/publish`, '', J);
  const lay = await call('layout zpet', 'GET', `/_api/web/GetList('${rel}/SitePages')/items(${pid})?$select=Id,PageLayoutType`); res.push('stranka: ' + JSON.stringify(lay.j));
  return res;
}, { web, rel, b64: fs.readFileSync(sppkg).toString('base64'), solId, wpId, stranka, seznam, guid: crypto.randomUUID() });
console.log(out.join('\n'));
await p.goto(`${web}/SitePages/${stranka}?env=WebView`, { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(8000);
const txt = (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 300);
console.log('RENDER:', txt); console.log('otazka v DOM:', /spokojen/i.test(txt));
await ctx.close();
