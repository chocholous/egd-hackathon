#!/usr/bin/env node
// appka.mjs - prvni appka z workshopu EG.D (Spokojenost s prostredim kancelare dnes):
// zalozeni projektu ze sablony, build,
// seznam na SharePointu a nasazeni do katalogu aplikaci JEDNOHO webu (nikdy tenant).
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
const TEMPLATE_SOLUTION = 'prvni-appka';                       // jmeno v sablone, prepise se
const TEMPLATE_IDS = {                                        // GUIDy v sablone, kazdy projekt dostane nove
  solution: '5385b1dc-f1c4-4f13-a082-8db54fde074a',
  feature: '6d8d18a0-c544-4895-a10e-1d0df0b07bc8',
  component: 'c44510bd-4c1b-40ba-8160-a87ad02611cf',
};
const DEFAULT_LIST = 'MojeAppka';                             // jiny nazev nez egd-pripravenost (Spokojenost/SpokojenostHodnoceni)
const DEFAULT_PAGE = 'prvni-appka.aspx';
const DEFAULT_TITLE = 'Spokojenost s prostředím kanceláře dnes';
const WP_DIR = path.join('src', 'webparts', 'spokojenost');
const WP_MANIFEST = 'SpokojenostWebPart.manifest.json';
const DEFAULT_FOLDER = 'prvni-appka';
const ZNACKY = ['eon', 'egd'];                                 // vzhled appky; agent se VZDY zepta uzivatele
const ZNACKA_SOUBOR = '_znacka.scss';                          // jediny prepinac vzhledu v projektu
const REZIMY = ['single', 'open'];                             // kdo appku pouzije; agent se VZDY zepta uzivatele
const PROJEKT_CFG = path.join('config', 'appka.json');         // rezim appky v projektu ({ "rezim": "open" })
const ROLE_CTENI = 2;                                          // RoleTypeKind Reader (nazev role je v jazyce webu)
const ROLE_PRISPIVANI = 3;                                     // RoleTypeKind Contributor
const WRITE_JEN_VLASTNI = 2;                                   // List.WriteSecurity: upravit jen vlastni polozky
const WRITE_VSECHNY = 1;                                       // List.WriteSecurity: vychozi
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

function znackaZVolby(o) {
  const z = String(o.znacka || '').toLowerCase();
  return ZNACKY.includes(z) ? z : null;
}
function znackaProjektu(slozka) {
  const p = path.join(slozka, WP_DIR, ZNACKA_SOUBOR);
  if (!fs.existsSync(p)) return null;
  const m = fs.readFileSync(p, 'utf8').match(/^\$znacka:\s*([a-z]+)\s*;/m);
  return m && ZNACKY.includes(m[1]) ? m[1] : null;
}
function rezimZVolby(o) {
  const r = String(o.rezim || '').toLowerCase();
  return REZIMY.includes(r) ? r : null;
}
function rezimProjektu(slozka) {
  try { const r = readJson(path.join(slozka, PROJEKT_CFG)).rezim; return REZIMY.includes(r) ? r : null; } catch { return null; }
}
function zapisRezim(slozka, r) {
  const p = path.join(slozka, PROJEKT_CFG);
  let cfg = {};
  try { cfg = readJson(p); } catch { cfg = {}; }
  cfg.rezim = r;
  fs.writeFileSync(p, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
}
function zapisZnacku(slozka, z) {
  const p = path.join(slozka, WP_DIR, ZNACKA_SOUBOR);
  const t = fs.readFileSync(p, 'utf8');
  const n = t.replace(/^\$znacka:\s*[a-z]+\s*;/m, `$znacka: ${z};`);
  if (n === t && !t.includes(`$znacka: ${z};`)) { fail(`v ${p} chybi radek $znacka`, 'zkopiruj soubor znovu ze sablony'); process.exit(1); }
  fs.writeFileSync(p, n, 'utf8');
}

function cmdNovy(o) {
  const slozka = path.resolve(o.slozka || DEFAULT_FOLDER);
  const znacka = znackaZVolby(o);
  const rezim = rezimZVolby(o);
  if (!rezim) {
    fail(o.rezim ? `neznamy rezim "${o.rezim}"` : 'chybi --rezim',
      'zeptej se uzivatele, kdo ma appku pouzivat: jen on sam (single) nebo vsichni v organizaci, kdo maji odkaz (open); pak spust znovu s --rezim single nebo --rezim open');
    process.exit(2);
  }
  if (!znacka) {
    fail(o.znacka ? `neznama znacka "${o.znacka}"` : 'chybi --znacka',
      'zeptej se uzivatele, jaky vzhled chce: E.ON (cervena jen na hlavni akci, hranate rohy) nebo EG.D (indigo, oble tvary); pak spust znovu s --znacka eon nebo --znacka egd');
    process.exit(2);
  }
  const jmeno = path.basename(slozka).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || DEFAULT_FOLDER;
  if (!nodeOk()) {
    fail(`Node v${process.versions.node} SPFx 1.24 nepostavi (chce 22.14+, 24 nebo 26).`,
      'stahni portable Node 22 (aspon 22.14), 24 nebo 26 LTS (zip z nodejs.org, bez admina) a dej ho na zacatek PATH; nebo jdi cestou B (bez kodu)',
      'Prosim o instalaci Node.js 22 LTS (nebo novejsi LTS) nebo povoleni portable verze - SharePoint Framework 1.24 Node 18 nepodporuje.');
    process.exit(1);
  }
  const existoval = fs.existsSync(path.join(slozka, 'package.json'));
  const predtim = existoval ? znackaProjektu(slozka) : null;
  if (existoval) {
    info(`projekt uz existuje: ${slozka} - nekopiruji znovu.`);
  } else {
    copyDir(TEMPLATE_DIR, slozka);
    const ids = { solution: crypto.randomUUID(), feature: crypto.randomUUID(), component: crypto.randomUUID() };
    const pairs = [[TEMPLATE_IDS.solution, ids.solution], [TEMPLATE_IDS.feature, ids.feature], [TEMPLATE_IDS.component, ids.component], [TEMPLATE_SOLUTION, jmeno]];
    for (const f of ['package.json', 'package-lock.json', 'config/package-solution.json', path.join(WP_DIR, WP_MANIFEST), '.yo-rc.json']) {
      const p = path.join(slozka, f);
      if (fs.existsSync(p)) replaceInFile(p, pairs);
    }
    ok(`projekt zalozen: ${slozka} (reseni ${jmeno}, web part ${ids.component})`);
  }
  zapisZnacku(slozka, znacka);
  zapisRezim(slozka, rezim);
  ok(`rezim ${rezim} zapsan do ${PROJEKT_CFG} (prava na webu nastavi krok nasadit, prepnout jde kdykoli prikazem rezim)`);
  ok(`znacka ${znacka === 'eon' ? 'E.ON' : 'EG.D'} zapsana do ${path.join(WP_DIR, ZNACKA_SOUBOR)}${predtim && predtim !== znacka ? ` (predtim ${predtim}; po zmene znovu build)` : ''}`);
  if (o['bez-instalace']) { info('instalaci balicku jsi vynechal (--bez-instalace).'); return; }
  out('Instaluji balicky SharePoint Frameworku (npm ci, lokalne, bez admina; stovky MB, par minut)...');
  const hasLock = fs.existsSync(path.join(slozka, 'package-lock.json'));
  const r = npm([hasLock ? 'ci' : 'install', '--no-audit', '--no-fund'], { cwd: slozka, timeout: TIMEOUT_INSTALL_MS });
  if (!r.ok) {
    const t = `${r.out}\n${r.err}`;
    if (/SELF_SIGNED|UNABLE_TO_GET_ISSUER|CERT_/i.test(t)) fail('npm narazil na certifikat firemni proxy', 'nevypinej strict-ssl; pozadej IT o korenovy certifikat a nastav npm config set cafile <cesta>', 'Prosim o korenovy certifikat proxy (soubor .cer/.pem) pro npm a Node.js (NODE_EXTRA_CA_CERTS), abych mohl instalovat balicky z registry.npmjs.org.');
    else if (/E40[37]|ETIMEDOUT|ENOTFOUND|ECONNRESET|EAI_AGAIN/i.test(t)) fail('npm se nedostane k registry (proxy / firewall)', 'cesta B (bez kodu) jde i tak', 'Prosim o pristup k registry.npmjs.org (nebo firemni npm mirror) pro npm na mem pocitaci - potrebuji instalovat SharePoint Framework.');
    else if (r.timedOut) fail('instalace vyprsela', 'zkus to znovu, pomala sit');
    else fail(`npm ci selhal: ${firstLine(r.err || r.out)}`, 'posli agentovi/Pavlovi celou chybu');
    process.exit(1);
  }
  ok('balicky nainstalovane. Dalsi krok: build');
}

// ---- prikaz: build ----
function projectInfo(slozka) {
  const ps = readJson(path.join(slozka, 'config', 'package-solution.json'));
  const manRaw = fs.readFileSync(path.join(slozka, WP_DIR, WP_MANIFEST), 'utf8');
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

// ---- rezim appky: single (jen autor) / open (vsichni v organizaci) ----
// Prava jdou primo pres REST (m365 request): `spo web roleassignment add/remove` v CLI 11.11.0 skonci
// "DONE" bez jedineho pozadavku na SharePoint (zmereno 24. 11.).
const JSON_NM = 'application/json;odata=nometadata';
function rest(o, metoda, url, body, hlavicky = {}) {
  const args = ['request', '--url', url, '--method', metoda === 'GET' ? 'get' : 'post', '--accept', JSON_NM];
  if (body !== undefined) args.push('--content-type', JSON_NM, '--body', JSON.stringify(body));
  for (const [k, v] of Object.entries(hlavicky)) args.push(`--${k}`, v);
  return m365(o, args);
}
const vsichniLogin = (tid) => `c:0-.f|rolemanager|spo-grid-all-users/${tid}`;

function stavRezimu(o, web, seznam) {
  const tid = m365(o, ['tenant', 'id', 'get']);
  if (!tid.ok) return { chyba: `ID tenantu: ${firstLine(tid.err)}` };
  const login = vsichniLogin(tid.json);
  const L = `${web}/_api/web/lists/getbytitle('${seznam}')`;
  const role = (typ) => rest(o, 'GET', `${web}/_api/web/roledefinitions/getbytype(${typ})?$select=Id,Name`);
  const cteni = role(ROLE_CTENI); const prisp = role(ROLE_PRISPIVANI);
  const wra = rest(o, 'GET', `${web}/_api/web/roleassignments?$expand=Member,RoleDefinitionBindings`);
  const lst = rest(o, 'GET', `${L}?$select=HasUniqueRoleAssignments,WriteSecurity`);
  for (const [n, r] of [['role Cteni', cteni], ['role Prispivani', prisp], ['prava webu', wra], [`seznam ${seznam}`, lst]]) if (!r.ok) return { chyba: `${n}: ${firstLine(r.err)}` };
  const najdi = (ra) => (ra.json.value || []).find((x) => x.Member && x.Member.LoginName === login);
  const naWebu = najdi(wra);
  const lra = rest(o, 'GET', `${L}/roleassignments?$expand=Member,RoleDefinitionBindings`);
  if (!lra.ok) return { chyba: `prava seznamu: ${firstLine(lra.err)}` };
  const naSeznamu = najdi(lra);
  const ma = (ra, id) => !!ra && ra.RoleDefinitionBindings.some((b) => b.Id === id);
  // Sdileni webu v prohlizeci (Sdilet web -> Cist/Upravit) prida skupinu do Navstevniku/Clenu webu, ne primo na web.
  const sg = rest(o, 'GET', `${web}/_api/web/sitegroups?$select=Id,Title,Users/Id,Users/LoginName&$expand=Users`);
  if (!sg.ok) return { chyba: `skupiny webu: ${firstLine(sg.err)}` };
  const veSkupinach = (sg.json.value || []).filter((g) => (g.Users || []).some((u) => u.LoginName === login)).map((g) => ({ id: g.Id, nazev: g.Title }));
  const vsichniVeSkupine = (sg.json.value || []).flatMap((g) => g.Users || []).find((u) => u.LoginName === login);
  return {
    login, cteniId: cteni.json.Id, prispId: prisp.json.Id, cteniNazev: cteni.json.Name, prispNazev: prisp.json.Name,
    vsichniId: naWebu?.PrincipalId ?? naSeznamu?.PrincipalId ?? vsichniVeSkupine?.Id,
    webPrimo: !!naWebu, webRole: naWebu ? naWebu.RoleDefinitionBindings.map((b) => b.Name) : [], veSkupinach,
    webCteni: ma(naWebu, cteni.json.Id) || veSkupinach.length > 0,
    seznamVlastni: lst.json.HasUniqueRoleAssignments, seznamPrisp: lst.json.HasUniqueRoleAssignments && ma(naSeznamu, prisp.json.Id),
    writeSecurity: lst.json.WriteSecurity,
    jeOpen() { return this.webCteni && this.seznamPrisp && this.writeSecurity === WRITE_JEN_VLASTNI; },
    // "Omezeny pristup" (RoleTypeKind 1) po zrusenych pravech seznamu sam nic neotevre
    webPlne: !!naWebu && naWebu.RoleDefinitionBindings.some((b) => b.RoleTypeKind !== 1),
    jeSingle() { return !this.webPlne && !this.veSkupinach.length && !this.seznamVlastni; },
  };
}

function planRezimu(s, rezim, seznam) {
  const kroky = [];
  if (rezim === 'open') {
    if (!s.webCteni) kroky.push(`web: skupine "Vsichni krome externich uzivatelu" dat roli ${s.cteniNazev} (otevre stranku s appkou)`);
    if (!s.seznamVlastni) kroky.push(`seznam ${seznam}: zrusit dedeni prav z webu (stavajici prava se zkopiruji)`);
    if (!s.seznamPrisp) kroky.push(`seznam ${seznam}: skupine "Vsichni krome externich uzivatelu" dat roli ${s.prispNazev} (muze hlasovat)`);
    if (s.writeSecurity !== WRITE_JEN_VLASTNI) kroky.push(`seznam ${seznam}: upravovat a mazat jen vlastni polozky (cizi hlas nikdo nezmeni)`);
  } else {
    if (s.seznamVlastni) kroky.push(`seznam ${seznam}: vratit dedeni prav z webu (zrusi zvlastni prava seznamu)`);
    if (s.webPrimo) kroky.push(`web: odebrat skupinu "Vsichni krome externich uzivatelu" (ma ${s.webRole.join(', ')})`);
    for (const g of s.veSkupinach) kroky.push(`web: vyradit "Vsichni krome externich uzivatelu" ze skupiny ${g.nazev}`);
    if (s.writeSecurity !== WRITE_VSECHNY) kroky.push(`seznam ${seznam}: vratit vychozi upravy polozek`);
  }
  return kroky;
}

// Provede rezim; vraci true, kdyz cteni zpet sedi.
function provedRezim(o, web, seznam, rezim) {
  let s = stavRezimu(o, web, seznam);
  if (s.chyba) { fail(s.chyba, 'over prihlaseni (m365 status), adresu webu a ze seznam existuje (prikaz seznam)'); return false; }
  const L = `${web}/_api/web/lists/getbytitle('${seznam}')`;
  const krok = (popis, r) => { if (r.ok) ok(popis); else fail(`${popis}: ${firstLine(r.err)}`, /denied|odepřen|403|unauthorized/i.test(r.err) ? 'prava na webu meni jen vlastnik webu (role Vlastnik / Uplne rizeni)' : ''); return r.ok; };
  if (rezim === 'open') {
    let id = s.vsichniId;
    if (!id) {
      const e = m365(o, ['spo', 'user', 'ensure', '--webUrl', web, '--loginName', s.login]);
      if (!e.ok) {
        fail(`skupinu "Vsichni krome externich uzivatelu" nejde na web pridat: ${firstLine(e.err)}`,
          'v organizaci muze byt sdileni se vsemi vypnute. Nahrada: nasdilej web konkretnim lidem nebo skupine (SKILL.md, sekce Kdyz maji hlasovat i ostatni)',
          `Prosim o povoleni skupiny "Everyone except external users" pro web ${web}, nebo o skupinu zabezpeceni s lidmi, kteri maji appku pouzivat.`);
        return false;
      }
      id = e.json.Id;
    }
    if (!s.webCteni && !krok('web: Vsichni krome externich uzivatelu -> ' + s.cteniNazev, rest(o, 'POST', `${web}/_api/web/roleassignments/addroleassignment(principalid=${id},roledefid=${s.cteniId})`))) return false;
    if (!s.seznamVlastni && !krok(`seznam ${seznam}: vlastni prava (kopie z webu)`, rest(o, 'POST', `${L}/breakroleinheritance(copyRoleAssignments=true,clearSubscopes=true)`))) return false;
    if (!s.seznamPrisp && !krok(`seznam ${seznam}: Vsichni krome externich uzivatelu -> ${s.prispNazev}`, rest(o, 'POST', `${L}/roleassignments/addroleassignment(principalid=${id},roledefid=${s.prispId})`))) return false;
    if (s.writeSecurity !== WRITE_JEN_VLASTNI && !krok(`seznam ${seznam}: upravy jen vlastnich polozek`, rest(o, 'POST', L, { WriteSecurity: WRITE_JEN_VLASTNI }, { 'x-http-method': 'MERGE', 'if-match': '*' }))) return false;
  } else {
    if (s.seznamVlastni && !krok(`seznam ${seznam}: prava zase z webu`, rest(o, 'POST', `${L}/resetroleinheritance`))) return false;
    if (s.webPrimo && !krok('web: Vsichni krome externich uzivatelu odebrani', rest(o, 'POST', `${web}/_api/web/roleassignments/getbyprincipalid(${s.vsichniId})/deleteobject()`))) return false;
    for (const g of s.veSkupinach) if (!krok(`web: Vsichni krome externich uzivatelu vyrazeni ze skupiny ${g.nazev}`, rest(o, 'POST', `${web}/_api/web/sitegroups/getbyid(${g.id})/users/removebyid(${s.vsichniId})`))) return false;
    if (s.writeSecurity !== WRITE_VSECHNY && !krok(`seznam ${seznam}: vychozi upravy polozek`, rest(o, 'POST', L, { WriteSecurity: WRITE_VSECHNY }, { 'x-http-method': 'MERGE', 'if-match': '*' }))) return false;
  }
  s = stavRezimu(o, web, seznam);
  const sedi = !s.chyba && (rezim === 'open' ? s.jeOpen() : s.jeSingle());
  if (sedi) ok(`precteno zpet: rezim ${rezim} (web ${s.webCteni ? 'Vsichni: ' + [...s.webRole, ...s.veSkupinach.map((g) => 've skupine ' + g.nazev)].join(', ') : 'bez skupiny Vsichni'}, seznam ${s.seznamVlastni ? 'vlastni prava' : 'dedi z webu'}, WriteSecurity ${s.writeSecurity})`);
  else fail(`cteni zpet nesedi s rezimem ${rezim}: ${s.chyba || JSON.stringify({ web: s.webCteni, seznamVlastni: s.seznamVlastni, prisp: s.seznamPrisp, ws: s.writeSecurity })}`);
  return sedi;
}

function cmdRezim(o) {
  const web = needWeb(o);
  const seznam = o.seznam || DEFAULT_LIST;
  const slozka = path.resolve(o.slozka || DEFAULT_FOLDER);
  const rezim = rezimZVolby(o) || rezimProjektu(slozka);
  if (!rezim) { fail('nevim rezim', 'pridej --rezim single|open (zeptej se uzivatele), nebo --slozka <projekt> s config/appka.json'); process.exit(2); }
  const s = stavRezimu(o, web, seznam);
  if (s.chyba) { fail(s.chyba, 'over prihlaseni (m365 status), adresu webu a ze seznam existuje (prikaz seznam)'); process.exit(1); }
  const kroky = planRezimu(s, rezim, seznam);
  out(`PLAN rezimu ${rezim} na webu ${web}:`);
  out(rezim === 'open' ? '  (appku otevre a hlasovat muze kazdy v organizaci, kdo ma odkaz; cizi hlasy nikdo nezmeni)' : '  (appku pouzije jen autor a lide, se kterymi web sdilel jednotlive)');
  for (const k of kroky) out(`  - ${k}`);
  if (!kroky.length) { ok(`web uz je v rezimu ${rezim}, neni co menit`); if (fs.existsSync(path.join(slozka, 'package.json'))) zapisRezim(slozka, rezim); return; }
  if (!o.ano) { out('\nNic jsem nezapsal. Ukaz plan uzivateli a po jeho "ano" spust znovu s --ano.'); process.exit(10); }
  if (!provedRezim(o, web, seznam, rezim)) process.exit(1);
  if (fs.existsSync(path.join(slozka, 'package.json'))) zapisRezim(slozka, rezim);
}

// ---- prikaz: seznam ----
const FIELDS = [
  { name: 'Hodnoceni', xml: '<Field Type="Number" DisplayName="Hodnocení" Name="Hodnoceni" StaticName="Hodnoceni" Min="1" Max="5" Decimals="0" Required="TRUE" />' },
  { name: 'Den', xml: '<Field Type="Text" DisplayName="Den" Name="Den" StaticName="Den" MaxLength="10" Required="TRUE" />' },
];
// Formatovani sloupce Hodnoceni jako barevny stitek (JSON column formatting, bez kodu).
// EG.D: semafor (zelena 4-5, cervena 1-2). E.ON: jedna cervena skala (5 = nejsvetlejsi Red 100, 1 = Red 500),
// cislo je videt vzdy - barva sama nic nerika (nevidi ji kazdy).
// Zdroj: E.ON brand tokens, EPL export 10. 11. (prepsano rucne); kontrast textu vsude >= 4,5 : 1.
const EON_SKALA = { 5: '#F6E5DC', 4: '#F6C1B0', 3: '#F59A86', 2: '#F05B48', 1: '#EA1B0A' }; // Red 100, 200, 300, 400, 500
const EON_TEXT = { 5: '#750E05', 4: '#750E05', 3: '#4E0903', 2: '#4E0903', 1: '#FFFFFF' };  // Red 800, 800, 900, 900, bila
const skalaVyraz = (m) => `=if(@currentField >= 5, '${m[5]}', if(@currentField >= 4, '${m[4]}', if(@currentField >= 3, '${m[3]}', if(@currentField >= 2, '${m[2]}', '${m[1]}'))))`;
// Stitek je span uvnitr flex obalu: bunka seznamu je vysoka, sam div by se roztahl na celou vysku
// a cislo by bylo nahore (nalez Z6 z E2E testu 24. 11.).
const stitek = (styl) => ({
  $schema: 'https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json',
  elmType: 'div',
  style: { display: 'flex', 'align-items': 'center', height: '100%' },
  children: [{ elmType: 'span', txtContent: '@currentField',
    style: { padding: '2px 10px', display: 'inline-block', 'line-height': '20px', 'font-weight': '600', 'min-width': '12px', 'text-align': 'center', ...styl } }],
});
const HODNOCENI_FORMAT_EON = stitek({ 'border-radius': '0', 'background-color': skalaVyraz(EON_SKALA), color: skalaVyraz(EON_TEXT) });
const HODNOCENI_FORMAT_EGD = stitek({ 'border-radius': '12px',
  'background-color': "=if(@currentField >= 4, '#DDF4E4', if(@currentField <= 2, '#FBE1E0', '#F0F1F5'))",
  color: "=if(@currentField >= 4, '#0B5A2A', if(@currentField <= 2, '#8A1C14', '#261B62'))" });

function cmdSeznam(o) {
  const web = needWeb(o);
  const title = o.seznam || DEFAULT_LIST;
  const znacka = znackaZVolby(o) || znackaProjektu(path.resolve(o.slozka || DEFAULT_FOLDER));
  if (!znacka) { fail('nevim znacku pro barvy sloupce Hodnoceni', 'pridej --znacka eon|egd nebo --slozka <projekt> (precte se z _znacka.scss)'); process.exit(2); }
  const format = znacka === 'eon' ? HODNOCENI_FORMAT_EON : HODNOCENI_FORMAT_EGD;
  const existing = m365(o, ['spo', 'list', 'get', '--webUrl', web, '--title', title]);
  const fields = existing.ok ? m365(o, ['spo', 'field', 'list', '--webUrl', web, '--listTitle', title]) : { ok: true, json: [] };
  const have = new Set((fields.json || []).map((f) => f.InternalName));
  const missing = FIELDS.filter((f) => !have.has(f.name));
  out(`PLAN na webu ${web}:`);
  out(existing.ok ? `  - seznam "${title}" uz existuje` : `  - zalozit seznam "${title}" (bezny seznam, v navigaci webu)`);
  for (const f of missing) out(`  - pridat sloupec ${f.name}`);
  out(`  - sloupec Hodnoceni naformatovat jako barevny stitek (${znacka === 'eon' ? 'E.ON: cervena skala + cislo' : 'EG.D: semafor + cislo'})`);
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
  const s = m365(o, ['spo', 'field', 'set', '--webUrl', web, '--listTitle', title, '--internalName', 'Hodnoceni', '--CustomFormatter', JSON.stringify(format)]);
  if (s.ok) ok('sloupec Hodnoceni naformatovan'); else warn(`formatovani Hodnoceni: ${firstLine(s.err)}`);
  const back = m365(o, ['spo', 'field', 'list', '--webUrl', web, '--listTitle', title]);
  const names = new Set((back.json || []).map((f) => f.InternalName));
  const chybi = FIELDS.filter((f) => !names.has(f.name)).map((f) => f.name);
  if (chybi.length) { fail(`po zapisu chybi sloupce: ${chybi.join(', ')}`); process.exit(1); }
  ok(`precteno zpet: seznam "${title}" ma sloupce ${FIELDS.map((f) => f.name).join(', ')}`);
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
    if (/sitecollectionappcatalog|neexistuje|nedá najít|does not exist|not exist|cannot be found|no app catalog/i.test(kat.err)) fail('web nema vlastni katalog aplikaci', 'bez nej SPFx nenasadis; mezitim cesta B (bez kodu)', `Prosim o zalozeni katalogu aplikaci pro kolekci webu (site collection app catalog) na webu ${web} a o roli Clen (Member) nebo Vlastnik na tomto webu.`);
    else if (/denied|odepřen|403|unauthorized/i.test(kat.err)) fail(`do katalogu webu nevidis: ${firstLine(kat.err)}`, 'role na webu (ne Custom Script)', `Prosim o roli Clen (Member) nebo Vlastnik na webu ${web} (potrebuji nahravat aplikace do jeho katalogu aplikaci).`);
    else fail(`katalog nejde precist: ${firstLine(kat.err)}`);
    process.exit(1);
  }
  const lst = m365(o, ['spo', 'list', 'get', '--webUrl', web, '--title', seznam]);
  if (!lst.ok) warn(`seznam "${seznam}" na webu neni - appka ho bude hlasit; zaloz ho prikazem seznam`);
  const pg = m365(o, ['spo', 'page', 'get', '--webUrl', web, '--name', page]);
  const pageExists = pg.ok;
  const rezim = rezimProjektu(slozka);
  let rezimKroky = [];
  if (rezim && lst.ok) {
    const s = stavRezimu(o, web, seznam);
    if (s.chyba) warn(`stav rezimu nejde precist: ${s.chyba}`); else rezimKroky = planRezimu(s, rezim, seznam);
  } else if (!rezim) warn(`v projektu neni rezim (${PROJEKT_CFG}); prava webu nemenim. Nastav je prikazem rezim --rezim single|open`);

  out(`\nPLAN (vse jen na webu ${web}, katalog tohoto webu, nic tenant-wide):`);
  out(`  1. nahrat ${p.sppkgName} (verze ${p.version}) do katalogu aplikaci webu (prepsat starsi)`);
  out('  2. nasadit (deploy) v katalogu webu');
  out('  3. nainstalovat appku na web, nebo aktualizovat, kdyz uz tam je');
  out(pageExists ? `  4. stranka ${page} uz existuje - jen overim, ze na ni web part je` : `  4. zalozit stranku ${page} ("${title}"), vlozit web part, prepnout na celostrankovou appku a publikovat`);
  if (rezim) out(rezimKroky.length ? `  5. rezim ${rezim}:\n${rezimKroky.map((k) => `     - ${k}`).join('\n')}` : `  5. rezim ${rezim}: prava webu a seznamu uz sedi`);
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
    const props = JSON.stringify({ nadpis: title, seznam });
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
  if (rezim && rezimKroky.length && !provedRezim(o, web, seznam, rezim)) process.exit(1);
  out(`\nOtevri v prohlizeci (bez ramu SharePointu):\n  ${web}/SitePages/${page}?env=WebView\nS ramem SharePointu (na upravy):\n  ${web}/SitePages/${page}`);
  out('Hotovo je az to, co uzivatel uvidi v prohlizeci: appka se nacte, po kliknuti na cislo se hlas propise do dashboardu.');
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
  const it = m365(o, ['spo', 'listitem', 'list', '--webUrl', web, '--listTitle', seznam, '--fields', 'Id,Den,Hodnoceni']);
  if (it.ok) ok(`seznam ${seznam}: ${it.json.length} hlasu${it.json.length ? ' (posledni: ' + it.json.slice(-5).map((x) => `${x.Den} -> ${x.Hodnoceni}`).join('; ') + ')' : ''}`); else { vse = false; fail(`seznam ${seznam}: ${firstLine(it.err)}`); }
  out(`\n${vse ? 'Na SharePointu je vse na miste.' : 'Neco chybi (viz vyse).'} Ze se appka vykresli a funguje, ukaze jen prohlizec:\n  ${web}/SitePages/${page}?env=WebView`);
  process.exit(vse ? 0 : 1);
}

// ---- help ----
function help() {
  out(`appka.mjs - prvni appka EG.D (Spokojenost s prostredim kancelare dnes, 1-5 + dashboard)

Spoustej v pracovni slozce z egd-pripravenost:  node "<cesta>/appka.mjs" <prikaz> [volby]

Prikazy:
  cesta                         precte .pripravenost/vysledky.json a doporuci cestu A / A2 / B
  novy   --znacka eon|egd --rezim single|open [--slozka prvni-appka]
                                zalozi projekt ze sablony (nove GUIDy), zapise znacku do _znacka.scss
                                a rezim do config/appka.json, nainstaluje balicky (npm ci).
                                Znacku i rezim VZDY zjisti od uzivatele.
         [--bez-instalace]      jen zkopiruje sablonu (a zapise znacku)
  build  [--slozka prvni-appka] postavi .sppkg (npm run build), chyby i do build.log
  seznam --web <url> [--seznam MojeAppka] [--znacka eon|egd | --slozka prvni-appka] [--ano]
                                zalozi seznam MojeAppka a sloupce Hodnoceni, Den (bez --ano jen plan);
                                barvy Hodnoceni podle znacky (bez --znacka se cte z projektu)
  nasadit --web <url> [--slozka prvni-appka] [--stranka prvni-appka] [--nadpis "..."] [--seznam MojeAppka] [--ano]
                                nahraje do katalogu TOHOTO webu, deploy, install/upgrade, stranka
                                (Article -> sekce -> web part -> SingleWebPartAppPage), cteni zpet
  rezim  --web <url> [--rezim single|open | --slozka prvni-appka] [--seznam MojeAppka] [--ano]
                                single = appku pouzije jen autor; open = vsichni v organizaci otevrou
                                a hlasuji (kazdy meni jen svuj hlas). Prepnout jde kdykoli; bez --ano plan
  over   --web <url> [--slozka prvni-appka] [--stranka prvni-appka] [--seznam MojeAppka]
                                jen cteni: appka v katalogu, stranka s web partem, polozky seznamu

Spolecne volby: --cli <cesta k @pnp/cli-microsoft365/dist/index.js> (jinak ./node_modules nebo
PRVNI_APPKA_M365_CLI / PRIPRAVENOST_M365_CLI).
Kody: 0 hotovo, 1 chyba, 2 spatne pouziti, 10 plan bez zapisu (neni chyba).`);
}

const o = parseArgs(process.argv.slice(2));
const cmd = o._[0];
if (!cmd || o.help || cmd === 'help') { help(); process.exit(cmd ? 0 : 2); }
const cmds = { cesta: cmdCesta, novy: cmdNovy, build: cmdBuild, seznam: cmdSeznam, nasadit: cmdNasadit, rezim: cmdRezim, over: cmdOver };
if (!cmds[cmd]) { fail(`neznamy prikaz ${cmd}`); help(); process.exit(2); }
await cmds[cmd](o);
