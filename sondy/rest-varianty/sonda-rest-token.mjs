#!/usr/bin/env node
// Sonda: nasazeni appky BEZ CLI prikazu `spo ...`, jen REST (_api) s bearer tokenem na SharePoint.
// Token bere z `m365 util accesstoken get` (slouzi jen jako zdroj tokenu; stejne by sel z MSAL / az / mgc).
// Zapisuje jen na zadany web, vlastni nazvy (--seznam), nic nemaze. Kroky: seznam+indexy, nahrani .sppkg, deploy, install.
// Pouziti: node sonda-rest-token.mjs --web <url> --sppkg <cesta> --cli <dist/index.js> [--seznam SpokojenostRest] [--ano]
// Bez --ano jen cte (GET /web). HOME musi mirit na adresar s prihlasenim CLI.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const a = process.argv.slice(2); const o = (n, d) => { const i = a.indexOf(`--${n}`); return i >= 0 ? a[i + 1] : d; };
const web = o('web').replace(/\/+$/, ''); const origin = new URL(web).origin; const rel = new URL(web).pathname;
const ano = a.includes('--ano'); const seznam = o('seznam', 'SpokojenostRest');
const tok = spawnSync(process.execPath, [o('cli'), 'util', 'accesstoken', 'get', '--resource', origin], { encoding: 'utf8' }).stdout.trim().replace(/^"|"$/g, '');
if (!tok.includes('.')) { console.log('token nelze ziskat'); process.exit(1); }
const H = { Authorization: `Bearer ${tok}`, Accept: 'application/json;odata=nometadata', 'Content-Type': 'application/json;odata=nometadata' };
const req = async (m, p, body, extra = {}) => { const r = await fetch(web + p, { method: m, headers: { ...H, ...extra }, body }); const t = await r.text(); let j; try { j = JSON.parse(t); } catch {} return { s: r.status, j, t: t.slice(0, 200) }; };
const log = (k, r) => console.log(`${r.s >= 200 && r.s < 300 ? 'OK ' : 'ERR'} ${k}: HTTP ${r.s} ${r.s >= 300 ? r.t : ''}`);

log('GET /web', await req('GET', '/_api/web?$select=Title,Url'));
if (!ano) { console.log('plan: bez --ano nic nezapisuji'); process.exit(10); }

// 1. seznam + sloupce + indexy + unikatni
let r = await req('POST', '/_api/web/lists', JSON.stringify({ Title: seznam, BaseTemplate: 100, Description: 'sonda rest' })); log('seznam', r);
const f = (xml) => req('POST', `/_api/web/lists/getbytitle('${seznam}')/fields/createfieldasxml`, JSON.stringify({ parameters: { SchemaXml: xml, Options: 8 } }));
log('pole Hodnoceni', await f('<Field Type="Number" DisplayName="Hodnoceni" Name="Hodnoceni" Decimals="0" Min="1" Max="5" Required="TRUE" />'));
log('pole DenCislo', await f('<Field Type="Number" DisplayName="DenCislo" Name="DenCislo" Decimals="0" Required="TRUE" Indexed="TRUE" />'));
log('pole Klic', await f('<Field Type="Text" DisplayName="Klic" Name="Klic" Required="TRUE" Indexed="TRUE" EnforceUniqueValues="TRUE" />'));
r = await req('GET', `/_api/web/lists/getbytitle('${seznam}')/fields?$filter=InternalName eq 'Klic' or InternalName eq 'DenCislo'&$select=InternalName,Indexed,EnforceUniqueValues`); console.log('zpet:', JSON.stringify(r.j?.value));

// 2. upload .sppkg do katalogu webu
const buf = fs.readFileSync(o('sppkg')); const nazev = 'spokojenost-rest-sonda.sppkg';
r = await req('POST', `/_api/web/getfolderbyserverrelativeurl('${rel}/AppCatalog')/files/add(url='${nazev}',overwrite=true)`, buf, { 'Content-Type': 'application/octet-stream' }); log('upload sppkg', r);
// 3. najit app a deploy + install
r = await req('GET', `/_api/web/sitecollectionappcatalog/AvailableApps?$select=ID,Title,Deployed,IsClientSideSolution`); log('AvailableApps', r);
const app = (r.j?.value || []).find((x) => /spokojenost/i.test(x.Title)); console.log('app:', JSON.stringify(app));
if (app) {
  log('deploy', await req('POST', `/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${app.ID}')/Deploy`, JSON.stringify({ skipFeatureDeployment: false })));
  log('install', await req('POST', `/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${app.ID}')/Install`, '{}'));
}
