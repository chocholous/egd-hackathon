#!/usr/bin/env node
// pripravenost.mjs - kontrola pripravenosti pocitace na vibecoding workshop EG.D.
// Bez zavislosti, Node 18+ (kontroly), CLI chce 20+, SPFx 22.14+; Windows / macOS / Linux. Vysledky sbira do .pripravenost/vysledky.json
// v aktualni slozce a prikaz `zprava` z nich slozi pripravenost-<jmeno>.md.
// Nikdy neuklada tokeny ani hesla. Zapisuje do SharePointu jen prikaz `zkouska` s volbou --ano.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// ---- konstanty (na jednom miste, at se daji zmenit) ----
const EON_TENANT_ID = 'b914a242-e718-443b-a47c-6b4c649d8c0a'; // z verejneho OIDC endpointu pro egd.cz (overeno 22. 11. 2026)
const EON_SP_HOST = 'eonos.sharepoint.com';
const SPFX_NODE_MAJORS = [22, 24, 26];           // SPFx 1.24.x podle Microsoft docs (compatibility, 2. 11. 2026)
const SPFX_NODE_22_MIN = [22, 14, 0];            // engines sablony 1.24.1: >=22.14.0
const SPFX_GENERATOR = '@microsoft/generator-sharepoint@1.24.1';
const YO = 'yo@7.0.1';
const CLI_PKG = '@pnp/cli-microsoft365';
const CLI_DEFAULT_MAJOR = '12';
const CLI_MIN_NODE_MAJOR = 20;                  // zmereno: CLI 11 i 12 padaji na Node 18 (yargs-parser chce Node 20+)
const EON_SHAREPOINT_MAIL = 'sharepoint@eon.com'; // zakladani site collection app catalogu a custom scriptu (mail E.ON 12. 11. 2026)
const TIMEOUT_SHORT_MS = 30_000;                 // jednoduchy prikaz / sitovy dotaz
const TIMEOUT_VIEW_MS = 90_000;                  // npm view generatoru SPFx (velke metadata; 30 s dalo jednou falesnou cervenou)
const TIMEOUT_INSTALL_MS = 600_000;              // npm install
const TEST_LIST = 'EGD-pripravenost';
const STATE_DIR = '.pripravenost';
const STATE_FILE = path.join(STATE_DIR, 'vysledky.json');
const IS_WIN = process.platform === 'win32';

// ---- vystup a stav ----
const ICON = { zelena: '[ZELENA]', zluta: '[ZLUTA] ', cervena: '[CERVENA]', info: '[INFO]  ' };
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return { vysledky: {} }; }
}
function saveState(s) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2), 'utf8');
}
const state = loadState();
function record(oblast, klic, stav, hodnota, dalsi = {}) {
  // dalsi: { it: 'veta pro ServiceNow', oprava: 'co udela uzivatel', zdroj: 'odkud' }
  state.vysledky[klic] = { oblast, stav, hodnota: String(hodnota ?? ''), ...dalsi, kdy: new Date().toISOString() };
  console.log(`${ICON[stav] || stav} ${klic}: ${hodnota}`);
  if (dalsi.oprava) console.log(`          co dal: ${dalsi.oprava}`);
  if (dalsi.it) console.log(`          veta pro IT: ${dalsi.it}`);
}

// ---- spousteni programu ----
function run(cmd, args = [], { timeout = TIMEOUT_SHORT_MS, shell = false, cwd } = {}) {
  // Na Windows jsou npm/code/copilot/claude .cmd soubory: bez shellu je Node nespusti (EINVAL).
  const useShell = shell || (IS_WIN && !/\.exe$/i.test(cmd) && !path.isAbsolute(cmd));
  const r = spawnSync(cmd, args, { encoding: 'buffer', timeout, shell: useShell, cwd, windowsHide: true });
  const dec = (b) => {
    if (!b) return '';
    // wsl.exe pise UTF-16LE
    const zeros = b.filter((x) => x === 0).length;
    return (zeros > b.length / 4 ? b.toString('utf16le') : b.toString('utf8')).replace(/\0/g, '').trim();
  };
  return {
    ok: r.status === 0 && !r.error,
    status: r.status,
    timedOut: r.error?.code === 'ETIMEDOUT' || r.signal === 'SIGTERM',
    missing: r.error?.code === 'ENOENT' || (useShell && (r.status === 127 || /not recognized|nebyl rozpozn|not found/i.test(dec(r.stderr)))),
    out: dec(r.stdout),
    err: dec(r.stderr) || (r.error ? String(r.error.message) : ''),
  };
}
const firstLine = (s) => (s || '').split(/\r?\n/).find((l) => l.trim()) || '';

function npmCli() {
  // npm volame pres node + npm-cli.js, kdyz to jde (bez .cmd a bez PowerShell execution policy)
  const cands = [
    path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(path.dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
  const f = cands.find((c) => fs.existsSync(c));
  return f ? { cmd: process.execPath, pre: [f] } : { cmd: 'npm', pre: [] };
}
function npm(args, opts) { const n = npmCli(); return run(n.cmd, [...n.pre, ...args], opts); }

function cliPath(opts) {
  const p = opts.cli || process.env.PRIPRAVENOST_M365_CLI || path.join(process.cwd(), 'node_modules', '@pnp', 'cli-microsoft365', 'dist', 'index.js');
  return fs.existsSync(p) ? p : null;
}
function m365(opts, args, { timeout = TIMEOUT_SHORT_MS } = {}) {
  const p = cliPath(opts);
  if (!p) return { ok: false, json: null, err: 'CLI for Microsoft 365 neni v teto slozce nainstalovane (spust: cli-instalace)' };
  const r = run(process.execPath, [p, ...args, '--output', 'json'], { timeout });
  let json = null;
  try { json = JSON.parse(r.out); } catch { /* text */ }
  const errText = (json && typeof json === 'object' && json.error) ? (typeof json.error === 'string' ? json.error : JSON.stringify(json.error)) : '';
  // pozor: CLI umi vratit {"error": ...} i s rc 0 -> rozhoduje tvar vystupu
  return { ok: r.ok && !errText, json, err: errText || r.err || (r.ok ? '' : r.out), raw: r.out, timedOut: r.timedOut };
}

// ---- prava SharePointu (SP.PermissionKind) ----
const KINDS = {
  1: 'ViewListItems', 2: 'AddListItems', 3: 'EditListItems', 4: 'DeleteListItems', 5: 'ApproveItems', 6: 'OpenItems',
  7: 'ViewVersions', 8: 'DeleteVersions', 9: 'CancelCheckout', 10: 'ManagePersonalViews', 12: 'ManageLists',
  13: 'ViewFormPages', 14: 'AnonymousSearchAccessList', 17: 'Open', 18: 'ViewPages', 19: 'AddAndCustomizePages',
  20: 'ApplyThemeAndBorder', 21: 'ApplyStyleSheets', 22: 'ViewUsageData', 23: 'CreateSSCSite', 24: 'ManageSubwebs',
  25: 'CreateGroups', 26: 'ManagePermissions', 27: 'BrowseDirectories', 28: 'BrowseUserInfo', 29: 'AddDelPrivateWebParts',
  30: 'UpdatePersonalWebParts', 31: 'ManageWeb', 32: 'AnonymousSearchAccessWebLists', 37: 'UseClientIntegration',
  38: 'UseRemoteAPIs', 39: 'ManageAlerts', 40: 'CreateAlerts', 41: 'EditMyUserInfo', 63: 'EnumeratePermissions',
};
function decodeMask(high, low) {
  const H = BigInt(high || 0), L = BigInt(low || 0);
  const names = [];
  for (let k = 1; k <= 64; k++) {
    const set = k <= 32 ? ((L >> BigInt(k - 1)) & 1n) : ((H >> BigInt(k - 33)) & 1n);
    if (set) names.push(KINDS[k] || `kind${k}`);
  }
  return names;
}
function roleGuess(names) {
  const has = (n) => names.includes(n);
  if (has('ManageWeb') && has('ManagePermissions')) return 'Vlastnik (Full Control)';
  if (has('AddListItems') && has('EditListItems') && has('ManageLists')) return 'Clen (Edit)';
  if (has('AddListItems') && has('EditListItems')) return 'Prispevatel (Contribute)';
  if (has('ViewListItems')) return 'Ctenar (Read)';
  return 'zadny pristup';
}

// ---- prikazy ----
function cmdNastroje() {
  const oblast = 'Nastroje';
  record(oblast, 'system', 'info', `${os.type()} ${os.release()} ${os.version ? os.version() : ''} (${process.arch})`.trim());
  if (IS_WIN) {
    const ps5 = run('powershell.exe', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']);
    record(oblast, 'powershell-5', ps5.ok ? 'info' : 'zluta', ps5.ok ? ps5.out : 'nenalezen');
    const ps7 = run('pwsh.exe', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']);
    record(oblast, 'powershell-7', ps7.ok ? 'zelena' : 'zluta', ps7.ok ? ps7.out : 'neni (nevadi; agentum pomuze, viz README)',
      ps7.ok ? {} : { oprava: 'nepovinne: PowerShell 7 jako portable zip bez admin prav, nebo Git Bash' });
    const pol = run('powershell.exe', ['-NoProfile', '-Command', 'Get-ExecutionPolicy']);
    const blocked = pol.ok && /Restricted|AllSigned/i.test(pol.out);
    record(oblast, 'powershell-execution-policy', blocked ? 'zluta' : 'info', pol.ok ? pol.out : 'nezjisteno',
      blocked ? { oprava: 'npm/npx v PowerShellu muzou koncit "running scripts is disabled"; volej pres node ... nebo cmd' } : {});
  }
  const git = run('git', ['--version']);
  record(oblast, 'git', git.ok ? 'zelena' : 'zluta', git.ok ? git.out : 'neni',
    git.ok ? {} : { oprava: 'Git for Windows (portable verze jde bez admina); na prvni zkousku neni nutny', it: 'Prosim o instalaci Git for Windows na muj pocitac (potrebuji ho pro vyvoj SharePoint aplikaci s GitHub Copilotem).' });

  const nodeV = process.versions.node;
  const major = Number(nodeV.split('.')[0]);
  const portable = IS_WIN ? !/Program Files/i.test(process.execPath) : null;
  const spfxOk = SPFX_NODE_MAJORS.includes(major) && (major !== 22 || cmpVer(nodeV, SPFX_NODE_22_MIN) >= 0);
  record(oblast, 'node', spfxOk ? 'zelena' : 'zluta', `v${nodeV} (${process.execPath}${portable === null ? '' : portable ? ', vypada jako portable' : ', instalovany'})`,
    spfxOk ? {} : { oprava: `pro SPFx 1.24 je potreba Node ${SPFX_NODE_MAJORS.join(' / ')} (22 aspon 22.14). Portable zip z nodejs.org jde bez admin prav; staci ho rozbalit a dat na zacatek PATH`, zdroj: 'Microsoft docs SPFx compatibility' });
  const npmV = npm(['--version']);
  record(oblast, 'npm', npmV.ok ? 'zelena' : 'cervena', npmV.ok ? npmV.out : (npmV.err || 'neni'));

  const code = run('code', ['--version']);
  record(oblast, 'vscode', code.ok ? 'zelena' : 'zluta', code.ok ? `VS Code ${firstLine(code.out)}` : 'prikaz "code" nenalezen (VS Code chybi nebo neni v PATH)');
  if (code.ok) {
    const ext = run('code', ['--list-extensions']);
    const list = ext.ok ? ext.out.toLowerCase().split(/\r?\n/) : [];
    const chat = list.includes('github.copilot-chat'), base = list.includes('github.copilot');
    record(oblast, 'vscode-copilot', chat ? 'zelena' : 'zluta', chat ? `rozsireni GitHub Copilot Chat${base ? ' + GitHub Copilot' : ''}` : 'rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene)',
      chat ? { oprava: 'licenci over ve VS Code: ikona Copilota dole -> musi byt prihlaseno a bez "no access"' } : { oprava: 'otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> "GitHub Copilot Chat" (kdyz je Marketplace blokovany, IT)' });
  }
  const cop = run('copilot', ['--version']);
  record(oblast, 'copilot-cli', cop.ok ? 'zelena' : 'info', cop.ok ? `Copilot CLI ${firstLine(cop.out)}` : 'neni (nepovinne)');
  const gh = run('gh', ['--version']);
  record(oblast, 'gh', gh.ok ? 'info' : 'info', gh.ok ? firstLine(gh.out) : 'neni (nepovinne)');
  const cl = run('claude', ['--version']);
  record(oblast, 'claude-code', cl.ok ? 'zelena' : 'info', cl.ok ? `Claude Code ${firstLine(cl.out)}` : 'neni');
  const desk = claudeDesktopPath();
  record(oblast, 'claude-desktop', desk ? 'zelena' : 'info', desk ? `nalezeno: ${desk}` : 'nenalezeno (hledano ve vychozich cestach)');
  if (IS_WIN) {
    const w = run('wsl.exe', ['-l', '-q']);
    record(oblast, 'wsl', w.ok && w.out ? 'info' : 'info', w.ok && w.out ? `distribuce: ${w.out.split(/\r?\n/).join(', ')}` : 'neni / bez distribuce (nepovinne)');
  }
  const who = process.env.CLAUDECODE ? 'Claude Code' : process.env.TERM_PROGRAM === 'vscode' ? 'terminal VS Code (Copilot agent mode nebo rucne)' : 'jiny terminal';
  record(oblast, 'spusteno-z', 'info', who);
  saveState(state);
}
function claudeDesktopPath() {
  const c = [];
  if (IS_WIN) {
    const la = process.env.LOCALAPPDATA || '';
    c.push(path.join(la, 'AnthropicClaude', 'claude.exe'), path.join(la, 'Programs', 'Claude', 'Claude.exe'));
  } else if (process.platform === 'darwin') c.push('/Applications/Claude.app');
  return c.find((p) => p && fs.existsSync(p)) || null;
}
function cmpVer(v, min) {
  const a = v.split('.').map(Number);
  for (let i = 0; i < 3; i++) { if ((a[i] || 0) !== min[i]) return (a[i] || 0) - min[i]; }
  return 0;
}

function cmdNpm() {
  const oblast = 'Sit a npm';
  const cfg = (k) => { const r = npm(['config', 'get', k]); return r.ok ? r.out : '?'; };
  const registry = cfg('registry');
  record(oblast, 'npm-registry', registry.includes('registry.npmjs.org') ? 'info' : 'zluta', registry,
    registry.includes('registry.npmjs.org') ? {} : { oprava: 'firemni zrcadlo npm - to je v poradku, jen ho zapis do zpravy' });
  const proxy = cfg('proxy'), hproxy = cfg('https-proxy'), ssl = cfg('strict-ssl'), cafile = cfg('cafile');
  record(oblast, 'npm-proxy', 'info', `proxy=${proxy} https-proxy=${hproxy} strict-ssl=${ssl} cafile=${cafile} HTTPS_PROXY=${process.env.HTTPS_PROXY || process.env.https_proxy ? 'nastaveno' : 'ne'} NODE_EXTRA_CA_CERTS=${process.env.NODE_EXTRA_CA_CERTS ? 'nastaveno' : 'ne'}`);
  const ping = npm(['ping'], { timeout: TIMEOUT_SHORT_MS });
  const txt = `${ping.out}\n${ping.err}`;
  if (ping.ok) record(oblast, 'npm-ping', 'zelena', 'registry odpovida (PONG)');
  else record(oblast, 'npm-ping', 'cervena', diagnoseNet(txt, ping.timedOut), npmFix(txt, ping.timedOut));
  const view = npm(['view', CLI_PKG, 'version'], { timeout: TIMEOUT_SHORT_MS });
  record(oblast, 'npm-stazeni-metadat', view.ok ? 'zelena' : 'cervena', view.ok ? `${CLI_PKG} ${view.out} je dostupny` : diagnoseNet(`${view.out}\n${view.err}`, view.timedOut),
    view.ok ? {} : npmFix(`${view.out}\n${view.err}`, view.timedOut));
  saveState(state);
}
function diagnoseNet(t, timedOut) {
  if (timedOut) return 'vyprsel cas - nejspis proxy nebo firewall';
  if (/SELF_SIGNED_CERT_IN_CHAIN|UNABLE_TO_GET_ISSUER_CERT|UNABLE_TO_VERIFY_LEAF|CERT_/i.test(t)) return 'SSL inspekce: firemni proxy podepisuje HTTPS vlastnim certifikatem';
  if (/E407|Proxy Authentication/i.test(t)) return 'proxy chce prihlaseni (407)';
  if (/ENOTFOUND|EAI_AGAIN/i.test(t)) return 'DNS nezna adresu registry (bez proxy nebo blokovano)';
  if (/ECONNREFUSED|ECONNRESET|ETIMEDOUT/i.test(t)) return 'spojeni odmitnuto nebo preruseno (firewall/proxy)';
  if (/E403|403 Forbidden/i.test(t)) return 'registry vraci 403 (blokovano politikou)';
  return firstLine(t) || 'neznama chyba';
}
function npmFix(t, timedOut) {
  if (/SELF_SIGNED|ISSUER_CERT|VERIFY_LEAF|CERT_/i.test(t)) return {
    oprava: 'firemni proxy podepisuje HTTPS vlastnim certifikatem; reseni je u IT (veta nize), kontrolu certifikatu nevypinej',
    it: 'Prosim o korenovy certifikat firemni HTTPS inspekce (PEM) a postup, jak ho nastavit pro Node.js/npm (npm cafile, NODE_EXTRA_CA_CERTS) - potrebuji instalovat balicky z registry.npmjs.org.' };
  return {
    oprava: 'bez npm nepujde CLI ani SPFx; zkus to z jine site, a zatim pokracuj kroky v prohlizeci (prikaz prohlizec)',
    it: 'Prosim o pristup k npm registry (https://registry.npmjs.org) pres firemni proxy, nebo o adresu firemniho zrcadla npm. Potrebuji ho pro nastroje SharePoint Framework a CLI for Microsoft 365 (vyvoj SharePoint aplikaci, workshop EG.D).' + (timedOut ? ' Pozadavky aktualne konci vyprsenim casu.' : '') };
}

async function cmdSit(opts) {
  const oblast = 'Sit a npm';
  // tenant: --tenant (GUID nebo domena; OIDC bere obojí) > --domena > egd.cz (E.ON). --tenant se ulozi do stavu (state.tenantId), takze dalsi prikazy miri na stejny tenant.
  const domain = (typeof opts.tenant === 'string' && opts.tenant) || opts.domena || 'egd.cz';
  try {
    const r = await fetchT(`https://login.microsoftonline.com/${encodeURIComponent(domain)}/v2.0/.well-known/openid-configuration`);
    const j = await r.json();
    const tid = (j.issuer || '').split('/')[3] || '?';
    record(oblast, 'entra-dosazitelne', 'zelena', `login.microsoftonline.com odpovida, tenant ${domain} = ${tid}`);
    state.tenantId = tid; // vlastni --tenant se ulozi, dalsi prikaz bez --tenant ho pouzije
  } catch (e) {
    const certErr = /CERT|SELF_SIGNED/i.test(String(e.cause?.code || e.message));
    record(oblast, 'entra-dosazitelne', certErr ? 'cervena' : 'zluta', `Node se nedostane na login.microsoftonline.com: ${e.cause?.code || e.message}`,
      certErr ? npmFix('CERT', false) : { oprava: 'zkontroluj proxy (promenna HTTPS_PROXY Node fetch nepouziva) - prihlaseni CLI se muze chovat jinak, zkus ho i tak' });
  }
  // SharePoint host: --host > host z --web > host z ulozeneho webu > E.ON
  const hostZWebu = (w) => { try { return new URL(w).host; } catch { return undefined; } };
  const host = (typeof opts.host === 'string' && opts.host) || hostZWebu(opts.web) || hostZWebu(state.web) || EON_SP_HOST;
  try {
    const r = await fetchT(`https://${host}/_api/web?$select=Title`, { headers: { Accept: 'application/json' } });
    record(oblast, 'sharepoint-dosazitelny', 'zelena', `${host} odpovida (HTTP ${r.status}; 401/403 bez prihlaseni je spravne)`);
  } catch (e) {
    record(oblast, 'sharepoint-dosazitelny', 'zluta', `${host} nedosazitelny z Node: ${e.cause?.code || e.message} (Node fetch nepouziva proxy; neni to nutne chyba, rozhodne prihlaseni)`);
  }
  saveState(state);
}
async function fetchT(url, init = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_SHORT_MS);
  try { return await fetch(url, { ...init, signal: ac.signal }); } finally { clearTimeout(t); }
}

// ---- zebrik variant: co v prostredi funguje (jen cteni, nic se neinstaluje) ----
async function cmdVarianty(opts) {
  const oblast = 'Varianty (zebrik)';
  const ladder = (klic, polozky, doporuceni) => {
    // polozky: [{ n: 'nazev', ok: true|false|null, proc }]; ok null = neumim zmerit
    const f = polozky.filter((x) => x.ok === true).map((x) => x.n);
    const n = polozky.filter((x) => x.ok === false).map((x) => `${x.n} (${x.proc})`);
    const q = polozky.filter((x) => x.ok === null).map((x) => `${x.n} (${x.proc})`);
    record(oblast, klic, f.length ? 'zelena' : 'zluta',
      `funguje: ${f.join(', ') || 'nic'}${n.length ? `; nefunguje: ${n.join(', ')}` : ''}${q.length ? `; nezmereno: ${q.join(', ')}` : ''}. Pouzij prvni funkcni: ${f[0] || 'zadna - viz references/zebrik.md'}`,
      f.length ? {} : { oprava: doporuceni });
  };
  const major = Number(process.versions.node.split('.')[0]);
  const nodeOk = SPFX_NODE_MAJORS.includes(major) && (major !== 22 || cmpVer(process.versions.node, SPFX_NODE_22_MIN) >= 0);
  // Node
  let dist = null;
  try { const r = await fetchT('https://nodejs.org/dist/index.json', { method: 'HEAD' }); dist = r.ok; } catch { dist = false; }
  const winget = IS_WIN ? run('winget', ['--version']) : null;
  ladder('varianta-node', [
    { n: '1 uz je (Node 22.14+/24/26 v PATH)', ok: nodeOk, proc: `je v${process.versions.node}` },
    ...(IS_WIN ? [{ n: '2 winget (winget install OpenJS.NodeJS.LTS --scope user)', ok: winget.ok, proc: 'winget neni nebo je blokovany' }] : [{ n: '2 winget', ok: null, proc: 'jen Windows; na macOS brew nebo portable' }]),
    { n: '3 portable archiv z nodejs.org (bez admina)', ok: dist, proc: 'nodejs.org z tohoto pocitace nedostupny' },
  ], 'Node 22+ pres IT (veta ve spfx), nebo si portable archiv stahni z jineho pocitace a prenes ho');
  // CLI for Microsoft 365
  const globalCli = run('m365', ['--version']);
  const npmv = npm(['--version']);
  ladder('varianta-cli', [
    { n: '1 npm lokalne v pracovni slozce (cli-instalace)', ok: npmv.ok && major >= CLI_MIN_NODE_MAJOR, proc: !npmv.ok ? 'npm nejde' : `Node v${process.versions.node} je pod ${CLI_MIN_NODE_MAJOR}` },
    { n: '2 npx (bez instalace, stahuje pri kazdem behu)', ok: npmv.ok && major >= CLI_MIN_NODE_MAJOR ? null : false, proc: 'nezkouseno, jen zaloha; pozor na cizi balicek m365 na npm' },
    { n: '3 globalni m365 uz v PATH', ok: globalCli.ok && !globalCli.missing, proc: 'm365 v PATH neni' },
    { n: '4 bez CLI: prohlizec (prikaz prohlizec)', ok: true, proc: '' },
  ], 'cesta bez CLI: prikaz prohlizec');
  // prihlaseni
  let dc = null;
  try {
    const r = await fetchT(`https://login.microsoftonline.com/${encodeURIComponent(opts.tenant || state.tenantId || EON_TENANT_ID)}/oauth2/v2.0/devicecode`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'client_id=00000000-0000-0000-0000-000000000000&scope=openid' });
    const j = await r.json(); dc = /AADSTS/.test(j.error_description || '') ; // ocekavame AADSTS700016 (appId neexistuje) = endpoint odpovida
  } catch { dc = false; }
  let loop = null;
  try { const net = await import('node:net'); loop = await new Promise((res) => { const s = net.createServer(); s.once('error', () => res(false)); s.listen(0, '127.0.0.1', () => { s.close(); res(true); }); }); } catch { loop = false; }
  ladder('varianta-prihlaseni', [
    { n: '1 device code (--authType deviceCode)', ok: dc, proc: 'endpoint devicecode se nedostupny; muze byt i Conditional Access, to ukaze az prihlaseni' },
    { n: '2 prohlizec (--authType browser, redirect na localhost)', ok: loop, proc: 'nejde otevrit lokalni port' },
    { n: '3 appId od IT / souhlas spravce', ok: state.prihlasen ? true : null, proc: 'zatim se nikdo neprihlasil' },
  ], 'veta pro IT z references/prihlaseni.md');
  record(oblast, 'varianta-pouzita', 'info', `uz prihlaseny pres CLI: ${state.prihlasen ? 'ano' : 'ne'}; spusteno z: ${process.env.CLAUDECODE ? 'Claude Code' : process.env.TERM_PROGRAM === 'vscode' ? 'terminal VS Code' : 'jiny terminal'}. Co z toho skutecne pouzijes, dopis: zapis --klic varianta-pouzita-<oblast> --stav info --hodnota "<cislo varianty>"`);
  saveState(state);
}

function cmdCliInstalace(opts) {
  const oblast = 'Pripojeni k SharePointu';
  const ver = opts.verze || CLI_DEFAULT_MAJOR;
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor < CLI_MIN_NODE_MAJOR) {
    record(oblast, 'cli-instalace', 'cervena', `Node v${process.versions.node} je moc stary: CLI for Microsoft 365 (verze 11 i 12) chce Node ${CLI_MIN_NODE_MAJOR}+; instalaci jsem nespoustel`,
      { oprava: 'nejdriv portable Node 22 (zip z nodejs.org, bez admina, viz references/windows.md), dat ho na zacatek PATH, zavrit a znovu otevrit terminal, a pak cli-instalace; --verze 11 na Node 18 NEPOMUZE',
        it: 'Prosim o povoleni portable Node.js 22 LTS (zip z nodejs.org, bez admin prav), nebo o jeho instalaci - CLI for Microsoft 365 i SharePoint Framework 1.24 nefunguji na Node 18.' });
    saveState(state); return;
  }
  if (!fs.existsSync('package.json')) {
    fs.writeFileSync('package.json', JSON.stringify({ name: 'egd-pracovni-slozka', private: true, version: '0.0.0' }, null, 2), 'utf8');
    console.log('Zalozen package.json v teto slozce (jen pro lokalni instalaci nastroju).');
  }
  console.log(`Instaluji ${CLI_PKG}@${ver} do ${path.join(process.cwd(), 'node_modules')} (bez admin prav, muze trvat par minut)...`);
  const r = npm(['install', `${CLI_PKG}@${ver}`, '--save-exact', '--no-audit', '--no-fund'], { timeout: TIMEOUT_INSTALL_MS });
  if (!r.ok) {
    const t = `${r.out}\n${r.err}`;
    record(oblast, 'cli-instalace', 'cervena', `${CLI_PKG}@${ver}: ${diagnoseNet(t, r.timedOut)}`, ver === '12' ? { oprava: 'zkus starsi verzi bez nativnich doplnku: cli-instalace --verze 11', ...npmFix(t, r.timedOut) } : npmFix(t, r.timedOut));
    saveState(state); return;
  }
  const p = cliPath(opts);
  const v = p ? run(process.execPath, [p, 'version', '--output', 'text']) : { ok: false };
  record(oblast, 'cli-instalace', v.ok ? 'zelena' : 'cervena', v.ok ? `CLI for Microsoft 365 ${v.out} (spusteno z ${p})` : 'nainstalovano, ale nejde spustit',
    v.ok ? {} : { oprava: 'zkus cli-instalace --verze 11 (kdyz je Node 20+; na Node 18 nepomuze)' });
  if (v.ok) {
    const s = run(process.execPath, [p, 'setup', '--scripting', '--skipApp']);
    record(oblast, 'cli-setup', s.ok ? 'zelena' : 'zluta', s.ok ? 'CLI nastaveno pro skripty (bez interaktivnich dotazu)' : `setup selhal: ${firstLine(s.err || s.out)}`);
  }
  saveState(state);
}

function cmdPrihlaseniPrikaz(opts) {
  const appId = opts.appId || '<APP_ID_OD_IT>';
  const tid = opts.tenant || state.tenantId || EON_TENANT_ID;
  console.log(`
Prihlaseni dela CLOVEK ve svem terminalu (agent ho neudela, kod z prohlizece musis zadat ty).
Otevri terminal v teto slozce (${process.cwd()}) a spust:

  node node_modules/@pnp/cli-microsoft365/dist/index.js login --authType deviceCode --appId ${appId} --tenant ${tid}

Vypise adresu https://microsoft.com/devicelogin a kod. Otevri adresu, zadej kod, prihlas se firemnim uctem.
Kdyz device code firma blokuje (chyba AADSTS53003 nebo AADSTS50097), zkus misto deviceCode: --authType browser
Kdyz nemas appId: viz references/prihlaseni.md (veta pro IT). Pak agentovi napis "hotovo".`);
}

function cmdPrihlaseni(opts) {
  const oblast = 'Pripojeni k SharePointu';
  const s = m365(opts, ['status']);
  if (!s.ok || !s.json || !s.json.connectedAs) {
    const t = `${s.err} ${s.raw || ''}`;
    record(oblast, 'prihlaseni', 'cervena', loginDiag(t) || 'neprihlaseno', loginFix(t));
    saveState(state); return false;
  }
  const tid = opts.tenant || state.tenantId || EON_TENANT_ID;
  const same = s.json.appTenant === tid;
  record(oblast, 'prihlaseni', same ? 'zelena' : 'zluta', `prihlasen ${s.json.connectedAs}, appId ${s.json.appId}, tenant ${s.json.appTenant}`,
    same ? {} : { oprava: `tenant neni ${tid} - prihlasen jinam? odhlas se (logout) a prihlas znovu s --tenant ${tid}` });
  state.prihlasen = { ucet: s.json.connectedAs, appId: s.json.appId, tenant: s.json.appTenant };
  saveState(state); return true;
}
function loginDiag(t) {
  const m = /AADSTS\d+/.exec(t || '');
  const map = {
    AADSTS65001: 'chybi souhlas (consent) pro aplikaci, pres kterou se CLI prihlasuje',
    AADSTS90094: 'aplikace potrebuje souhlas spravce (admin consent)',
    AADSTS90095: 'aplikace potrebuje souhlas spravce - pozadavek jde schvalit spravci',
    AADSTS700016: 'aplikace (appId) v tenantu neexistuje - spatne appId nebo jiny tenant',
    AADSTS7000218: 'aplikace nema povolene "public client flows" (device code)',
    AADSTS53003: 'prihlaseni zablokovala politika podmineneho pristupu (Conditional Access)',
    AADSTS50097: 'prihlaseni chce spravovane zarizeni (device code z tohoto zarizeni neprojde)',
    AADSTS50105: 'nejsi prirazen k aplikaci',
  };
  if (m) return `${m[0]}: ${map[m[0]] || 'viz Microsoft Entra error codes'}`;
  if (/not logged|Log in to Microsoft 365 first|Logged out/i.test(t)) return 'neprihlaseno';
  return '';
}
function loginFix(t) {
  const code = (/AADSTS\d+/.exec(t || '') || [''])[0];
  const app = state.prihlasen?.appId || '<appId>';
  if (['AADSTS65001', 'AADSTS90094', 'AADSTS90095'].includes(code)) return {
    oprava: 'neni to tvoje chyba, rozhoduje spravce Entra ID',
    it: `Prosim o udeleni souhlasu spravce (admin consent) pro aplikaci CLI for Microsoft 365 s appId ${app} v tenantu E.ON, s delegovanymi opravnenimi, ktera aplikace pro CLI for Microsoft 365 potrebuje pro SharePoint a Microsoft Graph (presny seznam urcite u IT), nebo o appId jiz schvalene aplikace, pres kterou se smim prihlasovat k SharePointu z CLI for Microsoft 365 (device code).` };
  if (code === 'AADSTS7000218') return { it: `Prosim o povoleni "Allow public client flows" u registrace aplikace ${app} (prihlaseni CLI for Microsoft 365 metodou device code).` };
  if (code === 'AADSTS53003' || code === 'AADSTS50097') return { oprava: 'zkus --authType browser; kdyz neprojde, IT', it: 'Prosim o vyjimku nebo postup pro prihlaseni nastroje CLI for Microsoft 365 k SharePointu z meho firemniho pocitace (device code / interaktivni prihlaseni blokuje Conditional Access).' };
  if (code === 'AADSTS700016') return { oprava: 'zkontroluj appId a tenant (preklep?)' };
  return { oprava: 'spust prihlaseni-prikaz a prihlas se ve svem terminalu' };
}

function cmdSharepoint(opts) {
  const oblast = 'Ovladani SharePointu';
  const web = (opts.web || '').replace(/\/+$/, '');
  if (!/^https:\/\/[^/]+\.sharepoint\.com\//i.test(web + '/')) { console.error('Chybi --web https://<tenant>.sharepoint.com/sites/<web>'); process.exit(2); }
  if (!cmdPrihlaseni(opts)) return;
  state.web = web;
  const w = m365(opts, ['spo', 'web', 'get', '--url', web]);
  record(oblast, 'web-cteni', w.ok ? 'zelena' : 'cervena', w.ok ? `"${w.json.Title}" (${w.json.Url})` : `nejde precist: ${firstLine(w.err)}`,
    w.ok ? {} : accessFix(w.err, web, 'web'));
  if (!w.ok) { saveState(state); return; }
  const p = m365(opts, ['request', '--url', `${web}/_api/web/EffectiveBasePermissions`]);
  if (p.ok && p.json) {
    const names = decodeMask(p.json.High, p.json.Low);
    const role = roleGuess(names);
    state.rolaWeb = role;
    const canWrite = names.includes('AddListItems');
    record(oblast, 'role-na-webu', role.startsWith('Vlastnik') || role.startsWith('Clen') ? 'zelena' : canWrite ? 'zluta' : 'cervena',
      `${role} (odhad z EffectiveBasePermissions High ${p.json.High} / Low ${p.json.Low}; zapis polozek ${canWrite ? 'ano' : 'ne'}, sprava seznamu ${names.includes('ManageLists') ? 'ano' : 'ne'})`,
      role.startsWith('Vlastnik') || role.startsWith('Clen') ? {} : { it: `Prosim o pridani uctu ${state.prihlasen?.ucet || '<muj ucet>'} jako Member (Clen) na web ${web}.` });
  } else record(oblast, 'role-na-webu', 'zluta', `nezjisteno: ${firstLine(p.err)}`);
  const l = m365(opts, ['spo', 'list', 'list', '--webUrl', web, '--properties', 'Title,BaseTemplate,ItemCount,Hidden', '--filter', 'Hidden eq false']);
  if (l.ok && Array.isArray(l.json)) {
    const names = l.json.map((x) => `${x.Title} (${x.ItemCount})`);
    record(oblast, 'seznamy', 'zelena', `${l.json.length} viditelnych seznamu/knihoven: ${names.slice(0, 12).join(', ')}${names.length > 12 ? ', ...' : ''}`);
  } else record(oblast, 'seznamy', 'zluta', `nejde vypsat: ${firstLine(l.err)}`);

  const t = m365(opts, ['spo', 'tenant', 'appcatalogurl', 'get']);
  const tUrl = t.ok && typeof t.json === 'string' ? t.json : (t.ok ? (t.raw || '').replace(/"/g, '') : '');
  record(oblast, 'tenant-app-catalog', tUrl ? 'info' : 'info', tUrl ? `${tUrl} (pro workshop ho nepotrebujeme; zapisujeme jen do katalogu na vlastnim webu)` : `nezjisteno: ${firstLine(t.err)}`);
  const c = m365(opts, ['spo', 'list', 'get', '--webUrl', web, '--url', 'AppCatalog', '--properties', 'Title,ItemCount,BaseTemplate,EffectiveBasePermissions']);
  if (c.ok && c.json && c.json.Title) {
    const names = decodeMask(c.json.EffectiveBasePermissions?.High, c.json.EffectiveBasePermissions?.Low);
    const canAdd = names.includes('AddListItems') && names.includes('EditListItems');
    record(oblast, 'site-app-catalog', 'zelena', `web ma vlastni katalog aplikaci "${c.json.Title}" (${c.json.ItemCount} balicku)`);
    record(oblast, 'role-v-katalogu', canAdd ? 'zelena' : 'cervena', canAdd ? 'muzes nahrat balicek (.sppkg) do katalogu' : `do katalogu nesmis zapisovat (${roleGuess(names)})`,
      canAdd ? {} : { it: `Prosim o pridani uctu ${state.prihlasen?.ucet || '<muj ucet>'} jako Member (Clen) na web ${web}, ktery ma katalog aplikaci (site collection app catalog). Bez toho nemohu nahrat SharePoint aplikaci (.sppkg).` });
  } else {
    const notFound = /not found|File Not Found|neexistuje|404/i.test(c.err);
    record(oblast, 'site-app-catalog', notFound ? 'cervena' : 'zluta', notFound ? 'web nema vlastni katalog aplikaci (site collection app catalog)' : `nezjisteno: ${firstLine(c.err)}`,
      notFound ? { oprava: `katalog zaklada rucne Product Team E.ON; napis jako vlastnik webu na ${EON_SHAREPOINT_MAIL} (ne pres ITSM), lhuta je nejista`, it: `E-mail na ${EON_SHAREPOINT_MAIL}: Jako vlastnik webu ${web} zadam o zalozeni katalogu aplikaci (site collection app catalog). Potrebuji na nem nasazovat vlastni SharePoint Framework web party (bez Custom Script, requiresCustomScript: false). Workshop EG.D 25. 11.` } : {});
  }
  const lic = m365(opts, ['request', '--url', 'https://graph.microsoft.com/v1.0/me/licenseDetails?$select=skuPartNumber,servicePlans', '--resource', 'https://graph.microsoft.com']);
  if (lic.ok && lic.json?.value) {
    const skus = lic.json.value.map((x) => x.skuPartNumber);
    const plans = lic.json.value.flatMap((x) => (x.servicePlans || []).filter((s) => s.provisioningStatus === 'Success').map((s) => s.servicePlanName));
    const pa = plans.filter((n) => /POWERAPPS|FLOW|POWER_AUTOMATE/i.test(n));
    state.licence = { skus, powerPlatform: pa };
    record('Zalozni cesty', 'licence-m365', 'info', `licence: ${skus.join(', ')}`);
    record('Zalozni cesty', 'power-platform-licence', pa.length ? 'zelena' : 'zluta', pa.length ? `Power Apps / Power Automate v licenci: ${pa.join(', ')}` : 'v licenci jsem nenasel Power Apps / Power Automate');
  } else record('Zalozni cesty', 'licence-m365', 'info', `licence nejdou precist pres CLI (${firstLine(lic.err) || 'bez opravneni User.Read'}); over v prohlizeci (prikaz prohlizec)`);
  saveState(state);
}
function accessFix(err, web, what) {
  if (/403|Access denied|unauthorized|E_ACCESSDENIED/i.test(err || '')) return {
    oprava: 'bud nemas roli na webu, nebo aplikace CLI nema opravneni na SharePoint (zjisti v prohlizeci: otevri web - kdyz ho vidis, je to aplikace)',
    it: `Prosim o pridani uctu ${state.prihlasen?.ucet || '<muj ucet>'} jako Member (Clen) na web ${web}.` };
  if (/AADSTS/.test(err || '')) return loginFix(err);
  return { oprava: `zkontroluj adresu ${what}u (preklep, /sites/...)` };
}

function cmdZkouska(opts) {
  const oblast = 'Ovladani SharePointu';
  const web = (opts.web || state.web || '').replace(/\/+$/, '');
  if (!web) { console.error('Chybi --web'); process.exit(2); }
  const nazev = `Zkouska ${opts.jmeno || os.userInfo().username} ${new Date().toLocaleString('cs-CZ')}`;
  if (!opts.ano) {
    console.log(`PLAN ZAPISU (nic se zatim nezapsalo):
  1. na webu ${web} zalozit seznam "${TEST_LIST}" (jen kdyz jeste neexistuje)
  2. pridat do nej JEDNU polozku s nazvem "${nazev}"
  3. precist ji zpatky
Nic se nemaze. Seznam si muzes pozdeji smazat sam v prohlizeci (Obsah webu).
Kdyz s tim clovek souhlasi, spust znovu s volbou --ano.`);
    process.exit(10);
  }
  if (!cmdPrihlaseni(opts)) return;
  const st = m365(opts, ['status']);
  const tid = opts.tenant || state.tenantId || EON_TENANT_ID;
  if (st.json?.appTenant !== tid && !opts.jinyTenant) { console.error(`Prihlaseny tenant ${st.json?.appTenant} neni ${tid}. Zapis zastaven.`); process.exit(1); }
  let ex = m365(opts, ['spo', 'list', 'get', '--webUrl', web, '--title', TEST_LIST, '--properties', 'Title,Id']);
  if (!ex.ok) {
    const add = m365(opts, ['spo', 'list', 'add', '--webUrl', web, '--title', TEST_LIST, '--baseTemplate', 'GenericList', '--description', 'Zkusebni seznam z kontroly pripravenosti na workshop. Muzete smazat.']);
    record(oblast, 'zalozeni-seznamu', add.ok ? 'zelena' : 'cervena', add.ok ? `seznam "${TEST_LIST}" zalozen` : `seznam nejde zalozit: ${firstLine(add.err)}`,
      add.ok ? {} : { oprava: 'na zalozeni seznamu je potreba role Clen nebo Vlastnik', it: `Prosim o pridani uctu ${state.prihlasen?.ucet || '<muj ucet>'} jako Member (Clen) na web ${web}.` });
    if (!add.ok) { saveState(state); return; }
  } else record(oblast, 'zalozeni-seznamu', 'zelena', `seznam "${TEST_LIST}" uz existuje, pouzivam ho`);
  const item = m365(opts, ['spo', 'listitem', 'add', '--webUrl', web, '--listTitle', TEST_LIST, '--Title', nazev]);
  const id = item.json?.Id ?? item.json?.ID;
  record(oblast, 'zapis-polozky', item.ok && id ? 'zelena' : 'cervena', item.ok && id ? `polozka ${id} zapsana` : `zapis selhal: ${firstLine(item.err)}`);
  if (item.ok && id) {
    const back = m365(opts, ['spo', 'listitem', 'list', '--webUrl', web, '--listTitle', TEST_LIST, '--fields', 'Id,Title', '--filter', `Id eq ${id}`]);
    const okBack = back.ok && Array.isArray(back.json) && back.json.some((x) => x.Title === nazev);
    record(oblast, 'cteni-zpet', okBack ? 'zelena' : 'zluta', okBack ? `precteno zpatky: "${nazev}"` : `zpetne cteni nesedi: ${firstLine(back.err || back.raw)}`);
    state.odkazSeznam = `${web}/Lists/${TEST_LIST}`;
  }
  saveState(state);
}

function cmdGithub(opts) {
  // jen cteni: gh auth status + git credential helper; tokeny se nikam nezapisuji (vypis gh se parsuje jen na host a login)
  const oblast = 'GitHub';
  const gh = run('gh', ['auth', 'status', ...(typeof opts.host === 'string' ? ['--hostname', opts.host] : [])]);
  const text = `${gh.out}\n${gh.err}`;
  if (gh.missing) {
    record(oblast, 'github-gh', 'info', 'gh (GitHub CLI) neni nainstalovane; pro workshop nepovinne. Copilot ve VS Code se prihlasuje v editoru, viz references/github.md');
  } else {
    const hosts = [];
    for (const m of text.matchAll(/Logged in to (\S+) (?:account|as) (\S+)/g)) hosts.push({ host: m[1], login: m[2].replace(/[()]/g, '') });
    const kind = (h) => (h === 'github.com' ? 'github.com' : /\.ghe\.com$/i.test(h) ? 'GHE.com' : 'jiny host (GitHub Enterprise Server?)');
    if (hosts.length) {
      record(oblast, 'github-hosty', 'zelena', hosts.map((x) => `${x.host} [${kind(x.host)}], ucet ${x.login}`).join('; '));
      state.githubHosty = hosts.map((x) => x.host);
    } else {
      record(oblast, 'github-hosty', 'zluta', 'gh neni k zadnemu hostu prihlasen (nebo vypis nejde precist)',
        { oprava: 'postup v references/github.md krok 4: gh auth login --hostname <adresa firemniho GitHubu>' });
    }
    if (/failed|invalid|expired|authentication issues/i.test(text) && hosts.length) record(oblast, 'github-gh-token', 'zluta', 'gh hlasi problem s prihlasenim u nektereho hostu', { oprava: 'gh auth login --hostname <host> znovu' });
  }
  const gcm = run('git', ['config', '--get', 'credential.helper']);
  record(oblast, 'git-credential-helper', 'info', gcm.ok && gcm.out ? firstLine(gcm.out) : 'nenastaven (na Windows s Git for Windows bývá "manager")');
  saveState(state);
}

function cmdSpfx(opts) {
  const oblast = 'SPFx pripravenost';
  const nodeV = process.versions.node, major = Number(nodeV.split('.')[0]);
  const ok = SPFX_NODE_MAJORS.includes(major) && (major !== 22 || cmpVer(nodeV, SPFX_NODE_22_MIN) >= 0);
  record(oblast, 'node-pro-spfx-1.24', ok ? 'zelena' : 'cervena', `Node v${nodeV}; SPFx 1.24 chce ${SPFX_NODE_MAJORS.join(' / ')} (22 aspon 22.14). Gulp uz neni, build je Heft.`,
    ok ? {} : { oprava: 'stahni portable Node 22 (aspon 22.14), 24 nebo 26 LTS (zip z nodejs.org, bez admina), rozbal a dej na zacatek PATH; Node 18 uz SPFx 1.24 nepostavi', it: 'Prosim o instalaci Node.js 22 LTS (nebo novejsi LTS) nebo povoleni portable verze - SharePoint Framework 1.24 Node 18 nepodporuje.' });
  const v = npm(['view', SPFX_GENERATOR, 'version'], { timeout: TIMEOUT_VIEW_MS });
  record(oblast, 'generator-dostupny', v.ok ? 'zelena' : 'cervena', v.ok ? `${SPFX_GENERATOR} je v registry` : diagnoseNet(`${v.out}\n${v.err}`, v.timedOut), v.ok ? {} : npmFix(`${v.out}\n${v.err}`, v.timedOut));
  if (opts.instalovat) {
    const dir = path.resolve(STATE_DIR, 'spfx-test');
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(path.join(dir, 'package.json'))) fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'spfx-test', private: true }, null, 2));
    console.log(`Instaluji ${YO} a ${SPFX_GENERATOR} do ${dir} (lokalne, par minut)...`);
    const r = npm(['install', YO, SPFX_GENERATOR, '--no-audit', '--no-fund'], { timeout: TIMEOUT_INSTALL_MS, cwd: dir });
    const yo = path.join(dir, 'node_modules', 'yo', 'lib', 'cli.js');
    const h = r.ok && fs.existsSync(yo) ? run(process.execPath, [yo, '@microsoft/sharepoint', '--help'], { cwd: dir, timeout: 120_000 }) : { ok: false };
    record(oblast, 'generator-instalace', h.ok ? 'zelena' : 'cervena', h.ok ? 'yo + generator SharePoint jdou nainstalovat lokalne a spustit' : `nejde: ${r.ok ? firstLine(h.err || h.out) : diagnoseNet(`${r.out}\n${r.err}`, r.timedOut)}`,
      h.ok ? {} : (r.ok ? {} : npmFix(`${r.out}\n${r.err}`, r.timedOut)));
  } else console.log('Zkusebni instalaci generatoru spustis volbou --instalovat (stahne cca stovky MB do .pripravenost/spfx-test).');
  saveState(state);
}

function cmdProhlizec(opts) {
  const web = (opts.web || state.web || 'https://eonos.sharepoint.com/sites/<tvuj-web>').replace(/\/+$/, '');
  console.log(`Kdyz CLI nebo npm nejde, over aspon prohlizecem (Edge, firemni ucet). Otevri postupne a vysledek rekni agentovi:

  1. Web:                     ${web}
  2. Tvoje prava (REST):      ${web}/_api/web/EffectiveBasePermissions
     -> v XML najdi <d:High> a <d:Low>, cisla posli agentovi (prikaz: maska --high X --low Y)
  3. Seznamy (REST):          ${web}/_api/web/lists?$select=Title,ItemCount&$filter=Hidden eq false
  4. Katalog aplikaci webu:   ${web}/AppCatalog
     -> kdyz se otevre knihovna "Apps for SharePoint", web katalog ma
  5. Power Apps:              https://make.powerapps.com   (vidis prostredi a muzes "Vytvorit"?)
  6. Power Automate:          https://make.powerautomate.com
  7. Licence Microsoft 365:   https://myaccount.microsoft.com  -> Predplatne / Subscriptions
  8. GitHub Copilot licence:  https://github.com/settings/copilot  (nebo ve VS Code ikona Copilota)

Vysledek zapise agent prikazem: zapis --klic <nazev> --stav zelena|zluta|cervena --hodnota "<co jsi videl>"`);
}

function cmdMaska(opts) {
  const names = decodeMask(opts.high, opts.low);
  console.log(`Role (odhad): ${roleGuess(names)}\nPrava: ${names.join(', ') || '(zadna)'}`);
  if (opts.zapsat) { record('Ovladani SharePointu', opts.klic || 'role-z-prohlizece', 'info', `${roleGuess(names)} (High ${opts.high} / Low ${opts.low}, z prohlizece)`); saveState(state); }
}

function cmdZapis(opts) {
  if (!opts.klic || !opts.stav) { console.error('Pouziti: zapis --klic <nazev> --stav zelena|zluta|cervena|info --hodnota "<text>" [--oblast "<oblast>"] [--it "<veta>"]'); process.exit(2); }
  if (/eyJ[A-Za-z0-9_-]{10,}|password|heslo\s*[:=]/i.test(opts.hodnota || '')) { console.error('Text vypada jako token nebo heslo - nezapisuji.'); process.exit(2); }
  record(opts.oblast || 'Rucne overeno', opts.klic, opts.stav, opts.hodnota || '', opts.it ? { it: opts.it } : {});
  saveState(state);
}

function doporuceni() {
  const v = state.vysledky;
  const g = (k) => v[k]?.stav === 'zelena';
  let nastroj;
  if (g('claude-code')) nastroj = 'Claude Code (je nainstalovany a funguje)';
  else if (g('vscode-copilot')) nastroj = 'VS Code + GitHub Copilot Chat v rezimu Agent (over licenci)';
  else if (g('copilot-cli')) nastroj = 'GitHub Copilot CLI';
  else if (g('claude-desktop')) nastroj = 'Claude Desktop (kod v zalozce Code)';
  else nastroj = 'zatim zadny agentni nastroj - pozadej o licenci GitHub Copilot pres E.ON ITSM (my IT order)';
  if (g('claude-code') && g('copilot-cli')) nastroj += '; je i Copilot CLI (jen kdyz mas licenci Copilot)';
  let cesta;
  if (g('npm-ping') && g('prihlaseni') && g('site-app-catalog') && g('role-v-katalogu') && g('node-pro-spfx-1.24')) cesta = 'A: vlastni SPFx aplikace na webu (vse potrebne funguje)';
  else if (g('npm-ping') && g('node-pro-spfx-1.24') && g('site-app-catalog') && g('role-v-katalogu')) cesta = 'A2: SPFx aplikace postavena lokalne, nahrana do katalogu rucne v prohlizeci (CLI prihlaseni zatim nejde)';
  else if (g('web-cteni') || v['role-z-prohlizece']) cesta = 'B: aplikace bez nasazovani kodu - SharePoint seznam + formatovani (JSON), pripadne Power Apps';
  else cesta = 'zatim zadna - chybi web nebo pristup k nemu (viz Objednavky predem)';
  return { nastroj, cesta };
}

function cmdZprava(opts) {
  const jmeno = (opts.jmeno || os.userInfo().username).replace(/[^\p{L}\p{N}_-]+/gu, '-');
  const v = state.vysledky;
  const order = ['Nastroje', 'Sit a npm', 'Pripojeni k SharePointu', 'Ovladani SharePointu', 'Varianty (zebrik)', 'SPFx pripravenost', 'GitHub', 'Zalozni cesty', 'Rucne overeno'];
  const label = { zelena: 'zelena', zluta: 'zluta', cervena: 'CERVENA', info: 'info' };
  const { nastroj, cesta } = doporuceni();
  const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  let md = `# Pripravenost na workshop - ${jmeno}\n\nVytvoreno ${new Date().toLocaleString('cs-CZ')} skriptem egd-pripravenost. Bez tokenu a hesel.\n\n`;
  md += `## Doporuceni\n\n- **Nastroj na stredu:** ${nastroj}\n- **Nejjednodussi cesta k prvni appce:** ${cesta}\n`;
  if (state.web) md += `- **Web:** ${state.web}\n`;
  if (state.prihlasen) md += `- **Prihlaseni CLI:** ${state.prihlasen.ucet}, appId ${state.prihlasen.appId}\n`;
  const counts = Object.values(v).reduce((a, x) => { a[x.stav] = (a[x.stav] || 0) + 1; return a; }, {});
  md += `\nSoucty: zelena ${counts.zelena || 0}, zluta ${counts.zluta || 0}, cervena ${counts.cervena || 0}.\n`;
  for (const o of order.concat([...new Set(Object.values(v).map((x) => x.oblast))].filter((x) => !order.includes(x)))) {
    const rows = Object.entries(v).filter(([, x]) => x.oblast === o);
    if (!rows.length) continue;
    md += `\n## ${o}\n\n| Kontrola | Stav | Vysledek |\n|---|---|---|\n`;
    for (const [k, x] of rows) md += `| ${k} | ${label[x.stav] || x.stav} | ${esc(x.hodnota)}${x.oprava ? ` - *co dal:* ${esc(x.oprava)}` : ''} |\n`;
  }
  const lic = v['copilot-licence']?.stav;
  const stavTxt = (ok, bad) => (ok ? 'hotovo' : bad ? 'CHYBI' : 'neoverene');
  md += `\n## Objednávky předem (E.ON ITSM)\n\nÚčastníci mají předem zařídit tři věci. Stav podle této kontroly:\n\n| Co | Stav | Jak |\n|---|---|---|\n`;
  md += `| Licence GitHub Copilot | ${stavTxt(lic === 'zelena', lic === 'cervena')} | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |\n`;
  md += `| 3 weby DEV / TEST / PROD | ${stavTxt(!!state.web && v['web-cteni']?.stav === 'zelena', !state.web)} | ITSM „SharePoint Online \\| New Site Creation“, ostatní účastníci jako site members. |\n`;
  const ac = v['site-app-catalog']?.stav;
  md += `| Katalog aplikací (site collection app catalog) na webu | ${stavTxt(ac === 'zelena', ac === 'cervena')} | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na ${EON_SHAREPOINT_MAIL} (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |\n`;
  if (lic === 'cervena' && !v['copilot-licence'].it) v['copilot-licence'].it = 'Prosim o prideleni licence GitHub Copilot (Business) pro muj ucet - workshop vibecodingu EG.D 25. 11.';
  const itAll = Object.entries(v).filter(([, x]) => x.it && (x.stav === 'cervena' || x.stav === 'zluta'));
  md += `\n## Vety pro ServiceNow\n\n`;
  md += itAll.length ? itAll.map(([k, x]) => `- **${k}:** ${x.it}`).join('\n') + '\n' : 'Nic neni potreba.\n';
  const out = `pripravenost-${jmeno}.md`;
  fs.writeFileSync(out, md, 'utf8');
  console.log(`\nZprava ulozena: ${path.resolve(out)}\nNastroj: ${nastroj}\nCesta: ${cesta}\nZelena ${counts.zelena || 0} / zluta ${counts.zluta || 0} / cervena ${counts.cervena || 0}`);
}

function cmdPassthrough(rest, opts) {
  const p = cliPath(opts);
  if (!p) { console.error('CLI neni nainstalovane v teto slozce (cli-instalace).'); process.exit(1); }
  const r = spawnSync(process.execPath, [p, ...rest], { stdio: 'inherit' });
  process.exit(r.status ?? 1);
}

const HELP = `pripravenost.mjs - kontrola pripravenosti na workshop EG.D (Node 20+ kvuli CLI, SPFx 22.14+; bez zavislosti)

Spoustej v pracovni slozce (vysledky v .pripravenost/vysledky.json):
  node pripravenost.mjs <prikaz> [volby]

Prikazy (jen cteni, pokud neni uvedeno jinak):
  nastroje                       Windows, PowerShell, git, Node/npm, VS Code + Copilot, Copilot CLI, Claude, WSL
  npm                            npm registry, proxy, SSL inspekce (npm ping, npm view)
  sit [--tenant <id|domena>] [--web <url>|--host <host>]  dosazitelnost prihlaseni Microsoft a SharePointu z Node, tenant ID
                                 (vychozi E.ON: domena egd.cz, host eonos.sharepoint.com; --domena je starsi zkratka pro tenant)
  cli-instalace [--verze 12|11]  ZAPISUJE LOKALNE: npm install @pnp/cli-microsoft365 do teto slozky
  prihlaseni-prikaz [--appId ID] vypise prikaz pro prihlaseni, ktery spusti clovek ve svem terminalu
  prihlaseni                     overi prihlaseni CLI (m365 status) a tenant
  sharepoint --web <url>         nazev webu, tvoje role, seznamy, katalog aplikaci, licence
  zkouska --web <url> [--ano]    bez --ano jen plan; s --ano ZAPISE 1 seznam "${TEST_LIST}" + 1 polozku a precte ji
  github [--host <host>]         gh auth status: ke kterym GitHub hostum je gh prihlasen + git credential helper (jen cteni)
  varianty                       zebrik variant: co funguje pro Node, CLI a prihlaseni (jen cteni, nic neinstaluje)
  spfx [--instalovat]            Node vs SPFx 1.24; s --instalovat zkusi lokalne yo + generator (stovky MB)
  prohlizec [--web <url>]        adresy k overeni v prohlizeci, kdyz CLI/npm nejde
  maska --high H --low L [--zapsat]  prelozi EffectiveBasePermissions na prava a roli
  zapis --klic K --stav S --hodnota T [--it "veta"]  zapise rucne overeny vysledek
  zprava --jmeno <jmeno>         slozi pripravenost-<jmeno>.md (tabulka + vety pro ServiceNow)
  m365 <argumenty...>            spusti lokalni CLI (napr. login) primo v terminalu

Spolecne volby: --cli <cesta k dist/index.js>, --tenant <tenantId> (vychozi E.ON ${EON_TENANT_ID})
Navratove kody: 0 hotovo, 1 chyba, 2 spatne pouziti, 10 plan bez zapisu.`;

function parse(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const n = argv[i + 1];
      if (n === undefined || n.startsWith('--')) o[k] = true; else { o[k] = n; i++; }
    } else o._.push(a);
  }
  return o;
}

const argv = process.argv.slice(2);
const cmd = argv[0];
if (!cmd || cmd === '--help' || cmd === '-h' || cmd === 'help') { console.log(HELP); process.exit(0); }
if (cmd === 'm365') cmdPassthrough(argv.slice(1), {});
const opts = parse(argv.slice(1));
if (opts.help) { console.log(HELP); process.exit(0); }
const table = {
  nastroje: cmdNastroje, npm: cmdNpm, sit: cmdSit, 'cli-instalace': cmdCliInstalace, 'prihlaseni-prikaz': cmdPrihlaseniPrikaz,
  prihlaseni: cmdPrihlaseni, sharepoint: cmdSharepoint, zkouska: cmdZkouska, spfx: cmdSpfx, github: cmdGithub, varianty: cmdVarianty, prohlizec: cmdProhlizec,
  maska: cmdMaska, zapis: cmdZapis, zprava: cmdZprava,
};
if (!table[cmd]) { console.error(`Neznamy prikaz "${cmd}".\n\n${HELP}`); process.exit(2); }
await table[cmd](opts);
