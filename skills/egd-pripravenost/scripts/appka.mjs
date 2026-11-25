#!/usr/bin/env node
// appka.mjs - appka "Spokojenost s prostredim kancelare" z workshopu EG.D: zalozeni projektu ze sablony,
// build, seznam na SharePointu a nasazeni do katalogu aplikaci JEDNOHO webu (nikdy tenant).
// Odvozeno ze skriptu appka.mjs skillu egd-prvni-appka (stejny postup nasazeni, jina sablona a seznam).
// Bez zavislosti, Node 22.14+ (SPFx 1.24), Windows / macOS / Linux. Vsechny programy spousti pres `node`
// s polem argumentu (bez shellu), takze nevadi PowerShell execution policy ani uvozovky.
// Kazdy zapis do SharePointu nejdriv vypise plan (kod 10) a provede se az s volbou --ano.

import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---- konstanty (na jednom miste) ----
const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE_DIR = path.join(SKILL_DIR, 'templates', 'spokojenost');
const TEMPLATE_SOLUTION = 'spokojenost-appka';                       // jmeno v sablone, prepise se
const TEMPLATE_IDS = {                                        // GUIDy v sablone, kazdy projekt dostane nove
  solution: 'ef7a3151-dda2-463e-8d7c-90fd8180633a',
  feature: 'c24d1d2f-9c6d-4dd7-a58a-66b89358a7cd',
  component: 'c64c9aa4-39ba-428f-ba39-74edfacd09b0',
};
const DEFAULT_LIST = 'SpokojenostHodnoceni';
const DEFAULT_PAGE = 'spokojenost.aspx';
const DEFAULT_FOLDER = 'spokojenost-appka';
const DEFAULT_TITLE = 'Spokojenost s prostředím kanceláře dnes';
const SPFX_NODE_MAJORS = [22, 24, 26];                         // SPFx 1.24.x (engines sablony)
const SPFX_NODE_22_MIN = [22, 14, 0];
const TIMEOUT_CLI_MS = 120_000;                                // jeden prikaz CLI for Microsoft 365
const TIMEOUT_INSTALL_MS = 1_200_000;                          // npm ci (stovky MB)
const TIMEOUT_BUILD_MS = 600_000;                              // npm run build (Heft)
const PROPAGACE_POKUSU = 12;                                   // web part po instalaci: zkus znovu ...
const PROPAGACE_CEKANI_MS = 15_000;                            // ... po 15 s (mereno 20 s az 1 min)

// ---- vystup ----
const out = (s = '') => console.log(s);
const ok = (s) => out(`[OK]      ${s}`);
const info = (s) => out(`[INFO]    ${s}`);
const warn = (s) => out(`[POZOR]   ${s}`);
const fail = (s, dal, it) => {
  out(`[CHYBA]   ${s}`);
  if (dal) out(`          co dal: ${dal}`);
  if (it) out(`          veta pro IT: ${it}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- argumenty ----
function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const n = argv[i + 1];
      if (n === undefined || n.startsWith('--')) o[k] = true; else { o[k] = n; i++; }
    } else o._.push(a);
  }
  return o;
}

// ---- spousteni ----
function run(cmd, args, { timeout = TIMEOUT_CLI_MS, cwd } = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout, cwd, windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0 && !r.error, status: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim(), timedOut: r.error?.code === 'ETIMEDOUT' };
}

function npmCli() {
  const c = [
    path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(path.dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
  return c.find((p) => fs.existsSync(p));
}
function npm(args, opts) {
  const cli = npmCli();
  if (!cli) return { ok: false, out: '', err: 'npm-cli.js nenalezen vedle node' };
  return run(process.execPath, [cli, ...args], opts);
}

function m365Path(opts) {
  const c = [opts.cli, process.env.PRVNI_APPKA_M365_CLI, process.env.PRIPRAVENOST_M365_CLI,
    path.join(process.cwd(), 'node_modules', '@pnp', 'cli-microsoft365', 'dist', 'index.js'),
    path.join(process.cwd(), '..', 'node_modules', '@pnp', 'cli-microsoft365', 'dist', 'index.js')].filter(Boolean);
  return c.find((p) => fs.existsSync(p));
}

// CLI for Microsoft 365 hlasi chyby i s navratovym kodem 0, proto rozhoduje tvar vystupu.
function m365(opts, args) {
  const cli = m365Path(opts);
  if (!cli) return { ok: false, err: 'CLI for Microsoft 365 nenalezeno. Spust v pracovni slozce z egd-pripravenost, nebo zadej --cli <cesta k dist/index.js>.' };
  const r = run(process.execPath, [cli, ...args, '--output', 'json']);
  let json;
  try { json = r.out ? JSON.parse(r.out) : undefined; } catch { json = undefined; }
  const errText = (json && typeof json === 'object' && !Array.isArray(json) && json.error) ? String(json.error) : (/^Error:/m.test(r.err) ? r.err : '');
  if (r.timedOut) return { ok: false, err: 'prikaz vyprsel (casovy limit)', json };
  if (errText || !r.ok) return { ok: false, err: errText || r.err || r.out || `navratovy kod ${r.status}`, json };
  return { ok: true, json, raw: r.out };
}

const firstLine = (s) => String(s || '').split(/\r?\n/).find((x) => x.trim()) || '';
const cleanWeb = (w) => String(w || '').replace(/\/+$/, '').replace(/\/SitePages\/.*$/i, '');

function needWeb(o) {
  const web = cleanWeb(o.web);
  if (!/^https:\/\/[^/]+\.sharepoint\.com\/(sites|teams)\/[^/]+$/i.test(web)) {
    fail('chybi nebo nesedi --web', 'zadej adresu webu ve tvaru https://<tenant>.sharepoint.com/sites/<web> (ne tenant katalog, ne koren)');
    process.exit(2);
  }
  return web;
}

function cmpVer(a, b) { const x = a.split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== b[i]) return (x[i] || 0) - b[i]; } return 0; }
function nodeOk() {
  const v = process.versions.node, major = Number(v.split('.')[0]);
  return SPFX_NODE_MAJORS.includes(major) && (major !== 22 || cmpVer(v, SPFX_NODE_22_MIN) >= 0);
}

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

// ---- prikaz: cesta (prevezme vysledek egd-pripravenost) ----
function cmdCesta() {
  const kandidati = [path.join(process.cwd(), '.pripravenost', 'vysledky.json'), path.join(process.cwd(), '..', '.pripravenost', 'vysledky.json')];
  const f = kandidati.find((p) => fs.existsSync(p));
  const zpravy = fs.readdirSync(process.cwd()).filter((x) => /^pripravenost-.*\.md$/i.test(x));
  if (!f) {
    warn('vysledek kontroly pripravenosti tu neni (.pripravenost/vysledky.json).');
    out('          co dal: spust nejdriv skill egd-pripravenost ve stejne pracovni slozce, nebo se uzivatele zeptej na jeho zpravu pripravenost-<jmeno>.md.');
    if (zpravy.length) info(`nalezena zprava: ${zpravy.join(', ')} - precti radek "Nejjednodussi cesta".`);
    process.exit(1);
  }
  const s = readJson(f), v = s.vysledky || {};
  const g = (k) => v[k]?.stav === 'zelena';
  const stav = (k) => (v[k] ? `${v[k].stav} (${firstLine(v[k].hodnota)})` : 'neovereno');
  info(`vysledky: ${f}`);
  if (s.web) info(`web z kontroly: ${s.web}`);
  for (const k of ['npm-ping', 'node-pro-spfx-1.24', 'prihlaseni', 'web-cteni', 'site-app-catalog', 'role-v-katalogu']) out(`          ${k}: ${stav(k)}`);
  let c;
  if (g('npm-ping') && g('node-pro-spfx-1.24') && g('prihlaseni') && g('site-app-catalog') && g('role-v-katalogu')) c = 'A';
  else if (g('npm-ping') && g('node-pro-spfx-1.24') && g('site-app-catalog') && g('role-v-katalogu')) c = 'A2';
  else if (g('web-cteni') || v['role-z-prohlizece']) c = 'B';
  else c = '-';
  const popis = {
    A: 'A: SPFx web part, nasazeni skriptem (prikazy novy -> build -> seznam -> nasadit)',
    A2: 'A2: SPFx web part postaveny lokalne, nahrany do katalogu webu rucne v prohlizeci (references/rucne-v-prohlizeci.md)',
    B: 'B: bez kodu - SharePoint seznam + formatovani, pripadne Power Apps formular (references/bez-kodu.md)',
    '-': 'zadna - chybi pristup k webu; s uzivatelem otevrete web v prohlizeci a poslete vetu pro IT',
  };
  out(`\nDOPORUCENA CESTA: ${popis[c]}`);
  process.exitCode = 0;
}

// ---- prikaz: novy (projekt ze sablony) ----
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name === 'gitignore' ? '.gitignore' : e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}
function replaceInFile(p, pairs) {
  let t = fs.readFileSync(p, 'utf8');
  for (const [a, b] of pairs) t = t.split(a).join(b);
  fs.writeFileSync(p, t, 'utf8');
}

function cmdNovy(o) {
  const slozka = path.resolve(o.slozka || DEFAULT_FOLDER);
  const jmeno = path.basename(slozka).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || DEFAULT_FOLDER;
  if (!nodeOk()) {
    fail(`Node v${process.versions.node} SPFx 1.24 nepostavi (chce 22.14+, 24 nebo 26).`,
      'stahni portable Node 22 (aspon 22.14), 24 nebo 26 LTS (zip z nodejs.org, bez admina) a dej ho na zacatek PATH; nebo jdi cestou B (bez kodu)',
      'Prosim o instalaci Node.js 22 LTS (nebo novejsi LTS) nebo povoleni portable verze - SharePoint Framework 1.24 Node 18 nepodporuje.');
    process.exit(1);
  }
  if (fs.existsSync(path.join(slozka, 'package.json'))) {
    info(`projekt uz existuje: ${slozka} - nekopiruji znovu.`);
  } else {
    copyDir(TEMPLATE_DIR, slozka);
    const ids = { solution: crypto.randomUUID(), feature: crypto.randomUUID(), component: crypto.randomUUID() };
    const pairs = [[TEMPLATE_IDS.solution, ids.solution], [TEMPLATE_IDS.feature, ids.feature], [TEMPLATE_IDS.component, ids.component], [TEMPLATE_SOLUTION, jmeno]];
    for (const f of ['package.json', 'package-lock.json', 'config/package-solution.json', 'src/webparts/spokojenost/SpokojenostWebPart.manifest.json', '.yo-rc.json']) {
      const p = path.join(slozka, f);
      if (fs.existsSync(p)) replaceInFile(p, pairs);
    }
    ok(`projekt zalozen: ${slozka} (reseni ${jmeno}, web part ${ids.component})`);
  }
  if (o['bez-instalace']) { info('instalaci balicku jsi vynechal (--bez-instalace).'); return; }
  out('Instaluji balicky SharePoint Frameworku (npm ci, lokalne, bez admina; stovky MB, par minut)...');
  const hasLock = fs.existsSync(path.join(slozka, 'package-lock.json'));
  const r = npm([hasLock ? 'ci' : 'install', '--no-audit', '--no-fund'], { cwd: slozka, timeout: TIMEOUT_INSTALL_MS });
  if (!r.ok) {
    const t = `${r.out}\n${r.err}`;
    if (/SELF_SIGNED|UNABLE_TO_GET_ISSUER|CERT_/i.test(t)) fail('npm narazil na certifikat firemni proxy', 'firemni proxy podepisuje HTTPS vlastnim certifikatem; reseni je u IT (veta nize), kontrolu certifikatu nevypinej', 'Prosim o korenovy certifikat proxy (soubor .cer/.pem) pro npm a Node.js (NODE_EXTRA_CA_CERTS), abych mohl instalovat balicky z registry.npmjs.org.');
    else if (/E40[37]|ETIMEDOUT|ENOTFOUND|ECONNRESET|EAI_AGAIN/i.test(t)) fail('npm se nedostane k registry (proxy / firewall)', 'cesta B (bez kodu) jde i tak', 'Prosim o pristup k registry.npmjs.org (nebo firemni npm mirror) pro npm na mem pocitaci - potrebuji instalovat SharePoint Framework.');
    else if (r.timedOut) fail('instalace vyprsela', 'zkus to znovu, pomala sit');
    else fail(`npm ci selhal: ${firstLine(r.err || r.out)}`, 'posli agentovi/lektorovi celou chybu');
    process.exit(1);
  }
  ok('balicky nainstalovane. Dalsi krok: build');
}

// ---- prikaz: build ----
function projectInfo(slozka) {
  const ps = readJson(path.join(slozka, 'config', 'package-solution.json'));
  const manRaw = fs.readFileSync(path.join(slozka, 'src', 'webparts', 'spokojenost', 'SpokojenostWebPart.manifest.json'), 'utf8');
  const componentId = (manRaw.match(/"id"\s*:\s*"([0-9a-f-]{36})"/i) || [])[1];
  const sppkg = path.join(slozka, 'sharepoint', ps.paths.zippedPackage);
  return { solutionId: ps.solution.id, solutionName: ps.solution.name, version: ps.solution.version, componentId, sppkg, sppkgName: path.basename(sppkg) };
}

function cmdBuild(o) {
  const slozka = path.resolve(o.slozka || DEFAULT_FOLDER);
  if (!fs.existsSync(path.join(slozka, 'node_modules'))) { fail(`v ${slozka} chybi node_modules`, 'nejdriv prikaz novy'); process.exit(1); }
  out('Stavim balicek (npm run build, Heft; minuta az dve)...');
  const r = npm(['run', 'build'], { cwd: slozka, timeout: TIMEOUT_BUILD_MS });
  const log = path.join(slozka, 'build.log');
  fs.writeFileSync(log, `${r.out}\n${r.err}`, 'utf8');
  const errs = `${r.out}\n${r.err}`.split(/\r?\n/).filter((l) => /\bError\b|error TS\d+|\(TS\d+\)/.test(l)).slice(0, 8);
  const p = projectInfo(slozka);
  if (!r.ok || !fs.existsSync(p.sppkg)) {
    fail('build neprosel', `chyby (cely vystup v ${log}):\n            ${errs.join('\n            ') || firstLine(r.err)}`);
    process.exit(1);
  }
  ok(`balicek: ${p.sppkg} (${fs.statSync(p.sppkg).size} B, verze ${p.version})`);
}

// ---- prikaz: seznam ----
const FIELDS = [
  { name: 'Hodnoceni', xml: '<Field Type="Number" DisplayName="Hodnocení" Name="Hodnoceni" StaticName="Hodnoceni" Decimals="0" Min="1" Max="5" Required="TRUE" />' },
  // indexovane sloupce: dashboard filtruje a radi jen podle DenCislo, Klic je unikatni (1 hodnoceni na uzivatele a den)
  { name: 'DenCislo', xml: '<Field Type="Number" DisplayName="Den (RRRRMMDD)" Name="DenCislo" StaticName="DenCislo" Decimals="0" Required="TRUE" Indexed="TRUE" />' },
  { name: 'Klic', xml: '<Field Type="Text" DisplayName="Klíč (uživatel|den)" Name="Klic" StaticName="Klic" Required="TRUE" Indexed="TRUE" EnforceUniqueValues="TRUE" />' },
];

function cmdSeznam(o) {
  const web = needWeb(o);
  const title = o.seznam || DEFAULT_LIST;
  const existing = m365(o, ['spo', 'list', 'get', '--webUrl', web, '--title', title]);
  const fields = existing.ok ? m365(o, ['spo', 'field', 'list', '--webUrl', web, '--listTitle', title]) : { ok: true, json: [] };
  const have = new Set((fields.json || []).map((f) => f.InternalName));
  const missing = FIELDS.filter((f) => !have.has(f.name));
  out(`PLAN na webu ${web}:`);
  out(existing.ok ? `  - seznam "${title}" uz existuje` : `  - zalozit seznam "${title}" (bezny seznam, v navigaci webu)`);
  for (const f of missing) out(`  - pridat sloupec ${f.name}`);
  out('  - sloupce DenCislo a Klic budou indexovane (limit 5000 polozek), Klic unikatni = 1 hodnoceni na uzivatele a den');
  if (!o.ano) { out('\nNic jsem nezapsal. Ukaz plan uzivateli a po jeho "ano" spust znovu s --ano.'); process.exit(10); }
  if (!existing.ok) {
    if (!/not exist|neexistuje|404/i.test(existing.err)) { fail(`nejde precist web: ${firstLine(existing.err)}`, 'over prihlaseni (m365 status) a adresu webu'); process.exit(1); }
    const c = m365(o, ['spo', 'list', 'add', '--webUrl', web, '--title', title, '--baseTemplate', 'GenericList', '--onQuickLaunch', 'true']);
    if (!c.ok) { fail(`seznam nejde zalozit: ${firstLine(c.err)}`, /denied|odepřen|403/i.test(c.err) ? 'na webu nemas roli Clen/Vlastnik' : '', /denied|odepřen|403/i.test(c.err) ? `Prosim o roli Clen (Member) na webu ${web}.` : ''); process.exit(1); }
    ok(`seznam "${title}" zalozen`);
  }
  for (const f of missing) {
    const r = m365(o, ['spo', 'field', 'add', '--webUrl', web, '--listTitle', title, '--xml', f.xml, '--options', 'AddFieldInternalNameHint,AddFieldToDefaultView']);
    if (r.ok) ok(`sloupec ${f.name}`); else { fail(`sloupec ${f.name}: ${firstLine(r.err)}`); process.exit(1); }
  }
  const t = m365(o, ['spo', 'field', 'set', '--webUrl', web, '--listTitle', title, '--internalName', 'Title', '--Title', 'Den']);
  if (t.ok) ok('sloupec Title -> "Den"'); else warn(`prejmenovani Title: ${firstLine(t.err)}`);
  const back = m365(o, ['spo', 'field', 'list', '--webUrl', web, '--listTitle', title]);
  const names = new Set((back.json || []).map((f) => f.InternalName));
  const chybi = FIELDS.filter((f) => !names.has(f.name)).map((f) => f.name);
  if (chybi.length) { fail(`po zapisu chybi sloupce: ${chybi.join(', ')}`); process.exit(1); }
  ok(`precteno zpet: seznam "${title}" ma sloupce ${FIELDS.map((f) => f.name).join(', ')}`);
  const neidx = (back.json || []).filter((f) => ['DenCislo', 'Klic'].includes(f.InternalName) && !f.Indexed).map((f) => f.InternalName);
  if (neidx.length) { fail(`sloupce nejsou indexovane: ${neidx.join(', ')}`, 'dashboard by nad 5000 polozkami spadl; zapni index v prohlizeci: Nastaveni seznamu > Indexovane sloupce'); process.exit(1); }
  ok('indexy: DenCislo a Klic jsou indexovane');
  out(`\nSeznam v prohlizeci: ${web}/Lists/${title}`);
}

// ---- prikaz: nasadit ----
async function cmdNasadit(o) {
  const web = needWeb(o);
  const slozka = path.resolve(o.slozka || DEFAULT_FOLDER);
  const page = (o.stranka || DEFAULT_PAGE).replace(/\.aspx$/i, '') + '.aspx';
  const title = o.nadpis || DEFAULT_TITLE;
  const seznam = o.seznam || DEFAULT_LIST;
  if (!fs.existsSync(path.join(slozka, 'config', 'package-solution.json'))) { fail(`${slozka} neni projekt`, 'nejdriv prikazy novy a build'); process.exit(1); }
  const p = projectInfo(slozka);
  if (!fs.existsSync(p.sppkg)) { fail(`chybi balicek ${p.sppkg}`, 'nejdriv prikaz build'); process.exit(1); }

  // kontroly pred zapisem (jen cteni)
  const st = m365(o, ['status']);
  if (!st.ok || !st.json?.connectedAs) { fail('CLI for Microsoft 365 neni prihlasene', 'prihlaseni dela clovek ve svem terminalu (skill egd-pripravenost, krok 5)'); process.exit(1); }
  info(`prihlasen: ${st.json.connectedAs}`);
  const kat = m365(o, ['spo', 'app', 'list', '--appCatalogScope', 'sitecollection', '--appCatalogUrl', web]);
  if (!kat.ok) {
    if (/sitecollectionappcatalog|neexistuje|nedá najít|does not exist|not exist|cannot be found|no app catalog/i.test(kat.err)) fail('web nema vlastni katalog aplikaci', 'u cerstve zalozeneho webu se katalog muze objevit az za par minut: zkus to znovu za 5 minut; kdyz hlaska zustane, bez katalogu SPFx nenasadis (mezitim cesta B, bez kodu)', `Prosim o zalozeni katalogu aplikaci pro kolekci webu (site collection app catalog) na webu ${web} a o roli Clen (Member) nebo Vlastnik na tomto webu.`);
    else if (/denied|odepřen|403|unauthorized/i.test(kat.err)) fail(`do katalogu webu nevidis: ${firstLine(kat.err)}`, 'role na webu (ne Custom Script)', `Prosim o roli Clen (Member) nebo Vlastnik na webu ${web} (potrebuji nahravat aplikace do jeho katalogu aplikaci).`);
    else fail(`katalog nejde precist: ${firstLine(kat.err)}`);
    process.exit(1);
  }
  const lst = m365(o, ['spo', 'list', 'get', '--webUrl', web, '--title', seznam]);
  if (!lst.ok) warn(`seznam "${seznam}" na webu neni - appka ho bude hlasit; zaloz ho prikazem seznam`);
  const pg = m365(o, ['spo', 'page', 'get', '--webUrl', web, '--name', page]);
  const pageExists = pg.ok;

  out(`\nPLAN (vse jen na webu ${web}, katalog tohoto webu, nic tenant-wide):`);
  out(`  1. nahrat ${p.sppkgName} (verze ${p.version}) do katalogu aplikaci webu (prepsat starsi)`);
  out('  2. nasadit (deploy) v katalogu webu');
  out('  3. nainstalovat appku na web, nebo aktualizovat, kdyz uz tam je');
  out(pageExists ? `  4. stranka ${page} uz existuje - jen overim, ze na ni web part je` : `  4. zalozit stranku ${page} ("${title}"), vlozit web part, prepnout na celostrankovou appku a publikovat`);
  if (!o.ano) { out('\nNic jsem nezapsal. Ukaz plan uzivateli a po jeho "ano" spust znovu s --ano.'); process.exit(10); }

  const add = m365(o, ['spo', 'app', 'add', '--filePath', p.sppkg, '--appCatalogScope', 'sitecollection', '--appCatalogUrl', web, '--overwrite']);
  if (!add.ok) {
    const denied = /denied|odepřen|403|unauthorized/i.test(add.err);
    fail(`nahrani do katalogu: ${firstLine(add.err)}`, denied ? 'nemas pravo zapisovat do katalogu webu - role na webu, ne Custom Script' : '', denied ? `Prosim o roli Clen (Member) nebo Vlastnik na webu ${web} (nahravani aplikaci do katalogu aplikaci webu).` : '');
    process.exit(1);
  }
  const appId = add.json?.UniqueId || add.json?.uniqueId;
  ok(`nahrano do katalogu (appId ${appId})`);
  const dep = m365(o, ['spo', 'app', 'deploy', '--id', appId, '--appCatalogScope', 'sitecollection', '--appCatalogUrl', web]);
  if (!dep.ok) { fail(`deploy: ${firstLine(dep.err)}`); process.exit(1); }
  ok('nasazeno (deploy)');

  const inst = m365(o, ['spo', 'app', 'instance', 'list', '--siteUrl', web]);
  const installed = Array.isArray(inst.json) && inst.json.some((x) => (x.ProductId || '').toLowerCase() === p.solutionId.toLowerCase());
  const step = installed ? 'upgrade' : 'install';
  const ins = m365(o, ['spo', 'app', step, '--id', appId, '--siteUrl', web, '--appCatalogScope', 'sitecollection']);
  if (!ins.ok && !/already|již|uz je/i.test(ins.err)) { fail(`${step}: ${firstLine(ins.err)}`); process.exit(1); }
  ok(installed ? 'appka na webu aktualizovana (upgrade)' : 'appka nainstalovana na web');

  if (!pageExists) {
    const a = m365(o, ['spo', 'page', 'add', '--webUrl', web, '--name', page, '--title', title, '--layoutType', 'Article']);
    if (!a.ok) { fail(`stranka: ${firstLine(a.err)}`); process.exit(1); }
    const s = m365(o, ['spo', 'page', 'section', 'add', '--webUrl', web, '--pageName', page, '--sectionTemplate', 'OneColumn', '--order', '1']);
    if (!s.ok) { fail(`sekce stranky: ${firstLine(s.err)}`); process.exit(1); }
    ok(`stranka ${page} zalozena (Article + sekce)`);
  }
  const hasWp = (j) => JSON.stringify(j || {}).toLowerCase().includes(p.componentId.toLowerCase());
  const pg2 = m365(o, ['spo', 'page', 'get', '--webUrl', web, '--name', page]);
  if (!hasWp(pg2.json)) {
    const props = JSON.stringify({ nadpis: title, seznam, dnu: 14 });
    let added = false;
    for (let i = 1; i <= PROPAGACE_POKUSU && !added; i++) {
      const w = m365(o, ['spo', 'page', 'clientsidewebpart', 'add', '--webUrl', web, '--pageName', page, '--webPartId', p.componentId, '--section', '1', '--column', '1', '--webPartProperties', props]);
      if (w.ok) { added = true; break; }
      if (/no available WebPart|není k dispozici|neni k dispozici/i.test(w.err)) {
        info(`web part se jeste propaguje (pokus ${i}/${PROPAGACE_POKUSU}), cekam ${PROPAGACE_CEKANI_MS / 1000} s - to je normalni, ne chyba prav`);
        await sleep(PROPAGACE_CEKANI_MS);
      } else if (/Invalid (column|section)/i.test(w.err)) {
        fail(`web part: ${firstLine(w.err)}`, 'stranka nema sekci nebo uz je prepnuta na app page; smaz ji v prohlizeci (Obsah webu > Stranky) a spust nasadit znovu');
        process.exit(1);
      } else { fail(`web part: ${firstLine(w.err)}`); process.exit(1); }
    }
    if (!added) { fail('web part se ani po cekani neobjevil', 'pockej par minut a spust nasadit --ano znovu (nahrani se jen zopakuje)'); process.exit(1); }
    ok('web part vlozen na stranku');
    const set = m365(o, ['spo', 'page', 'set', '--webUrl', web, '--name', page, '--layoutType', 'SingleWebPartAppPage', '--publish']);
    if (!set.ok) { fail(`prepnuti na app page: ${firstLine(set.err)}`); process.exit(1); }
    ok('stranka prepnuta na celostrankovou appku a publikovana');
  } else ok('web part na strance uz je');

  const fin = m365(o, ['spo', 'page', 'get', '--webUrl', web, '--name', page]);
  const layout = fin.json?.layoutType || fin.json?.PageLayoutType;
  if (!fin.ok || !hasWp(fin.json)) { fail('zpetne cteni stranky nesedi (web part na ni neni)'); process.exit(1); }
  ok(`precteno zpet: stranka ${page}, rozlozeni ${layout}, web part ${p.componentId} na ni je`);
  out(`\nOtevri v prohlizeci (bez ramu SharePointu):\n  ${web}/SitePages/${page}?env=WebView\nS ramem SharePointu (na upravy):\n  ${web}/SitePages/${page}`);
  out('Hotovo je az to, co uzivatel uvidi v prohlizeci: appka se nacte, po kliknuti na 1-5 se hlas ukaze v dashboardu.');
}

// ---- prikaz: over (kontrola bez prohlizece, jen cteni) ----
function cmdOver(o) {
  const web = needWeb(o);
  const slozka = path.resolve(o.slozka || DEFAULT_FOLDER);
  const page = (o.stranka || DEFAULT_PAGE).replace(/\.aspx$/i, '') + '.aspx';
  const seznam = o.seznam || DEFAULT_LIST;
  const p = fs.existsSync(path.join(slozka, 'config', 'package-solution.json')) ? projectInfo(slozka) : null;
  let vse = true;
  const kat = m365(o, ['spo', 'app', 'list', '--appCatalogScope', 'sitecollection', '--appCatalogUrl', web]);
  const app = p && Array.isArray(kat.json) ? kat.json.find((a) => (a.ProductId || '').toLowerCase() === p.solutionId.toLowerCase()) : null;
  if (app) ok(`katalog webu: ${app.Title} verze ${app.AppCatalogVersion || '?'}, nasazeno ${app.Deployed}`); else { vse = false; fail(`v katalogu webu appka neni${kat.ok ? '' : ': ' + firstLine(kat.err)}`); }
  const pg = m365(o, ['spo', 'page', 'get', '--webUrl', web, '--name', page]);
  const wp = p && JSON.stringify(pg.json || {}).toLowerCase().includes(p.componentId.toLowerCase());
  if (pg.ok && wp) ok(`stranka ${page}: rozlozeni ${pg.json.layoutType}, web part na ni je`); else { vse = false; fail(`stranka ${page}: ${pg.ok ? 'web part na ni neni' : firstLine(pg.err)}`); }
  const it = m365(o, ['spo', 'listitem', 'list', '--webUrl', web, '--listTitle', seznam, '--fields', 'Id,Title,Hodnoceni,DenCislo']);
  if (it.ok) ok(`seznam ${seznam}: ${it.json.length} polozek${it.json.length ? ' (' + it.json.slice(0, 5).map((x) => `${x.Title}: ${x.Hodnoceni}`).join('; ') + ')' : ''}`); else { vse = false; fail(`seznam ${seznam}: ${firstLine(it.err)}`); }
  out(`\n${vse ? 'Na SharePointu je vse na miste.' : 'Neco chybi (viz vyse).'} Ze se appka vykresli a funguje, ukaze jen prohlizec:\n  ${web}/SitePages/${page}?env=WebView`);
  process.exit(vse ? 0 : 1);
}

// ---- help ----
function help() {
  out(`appka.mjs - appka Spokojenost s prostredim kancelare (SharePoint seznam + dashboard)

Spoustej v pracovni slozce z egd-pripravenost:  node "<cesta>/appka.mjs" <prikaz> [volby]

Prikazy:
  cesta                         precte .pripravenost/vysledky.json a doporuci cestu A / A2 / B
  novy   [--slozka spokojenost-appka] zalozi projekt ze sablony (nove GUIDy) a nainstaluje balicky (npm ci)
         [--bez-instalace]      jen zkopiruje sablonu
  build  [--slozka spokojenost-appka] postavi .sppkg (npm run build), chyby i do build.log
  seznam --web <url> [--seznam SpokojenostHodnoceni] [--ano]
                                zalozi seznam a sloupce Hodnoceni, DenCislo (index), Klic (index, unikatni) (bez --ano jen plan)
  nasadit --web <url> [--slozka spokojenost-appka] [--stranka spokojenost] [--nadpis "..."] [--seznam SpokojenostHodnoceni] [--ano]
                                nahraje do katalogu TOHOTO webu, deploy, install/upgrade, stranka
                                (Article -> sekce -> web part -> SingleWebPartAppPage), cteni zpet
  over   --web <url> [--slozka spokojenost-appka] [--stranka spokojenost] [--seznam SpokojenostHodnoceni]
                                jen cteni: appka v katalogu, stranka s web partem, polozky seznamu

Spolecne volby: --cli <cesta k @pnp/cli-microsoft365/dist/index.js> (jinak ./node_modules nebo
PRVNI_APPKA_M365_CLI / PRIPRAVENOST_M365_CLI).
Kody: 0 hotovo, 1 chyba, 2 spatne pouziti, 10 plan bez zapisu (neni chyba).`);
}

const o = parseArgs(process.argv.slice(2));
const cmd = o._[0];
if (!cmd || o.help || cmd === 'help') { help(); process.exit(cmd ? 0 : 2); }
const cmds = { cesta: cmdCesta, novy: cmdNovy, build: cmdBuild, seznam: cmdSeznam, nasadit: cmdNasadit, over: cmdOver };
if (!cmds[cmd]) { fail(`neznamy prikaz ${cmd}`); help(); process.exit(2); }
await cmds[cmd](o);
