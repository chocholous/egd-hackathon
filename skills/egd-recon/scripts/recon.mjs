#!/usr/bin/env node
// recon.mjs - jen CTENI: co v tomto tenantu a na tomto webu smis (zachranny skill k egd-pripravenost).
// Vypise tri seznamy: funguje / blokovano / zadost pro IT. Nic nezapisuje, nic nemaze.
// Bez zavislosti, Node 20+, Windows / macOS / Linux. Programy spousti pres `node` s polem argumentu (bez shellu).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const TIMEOUT_CLI_MS = 120_000;
// bity prav v EffectiveBasePermissions (SharePoint, 📘 dokumentace PermissionKind)
const PRAVA = { viewListItems: 0x1n, addListItems: 0x2n, editListItems: 0x4n, manageLists: 0x800n, addAndCustomizePages: 0x40000n };

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
if (args.includes('--help') || !opt('web')) {
  console.log(`recon.mjs - co tu smis (jen cteni)
Pouziti (v pracovni slozce, kde je node_modules s CLI for Microsoft 365, tj. tam, kde bezela pripravenost):
  node "<cesta>/recon.mjs" --web https://<tenant>.sharepoint.com/sites/<web> [--out recon.md] [--cli <cesta k dist/index.js>]
Prihlaseni musi byt hotove (dela clovek). Skript nic nezapisuje.`);
  process.exit(opt('web') ? 0 : 1);
}
const web = opt('web').replace(/\/+$/, '');
const origin = new URL(web).origin;

function cliPath() {
  const c = [opt('cli'), process.env.PRIPRAVENOST_M365_CLI,
    path.join(process.cwd(), 'node_modules', '@pnp', 'cli-microsoft365', 'dist', 'index.js'),
    path.join(process.cwd(), '..', 'node_modules', '@pnp', 'cli-microsoft365', 'dist', 'index.js')].filter(Boolean);
  return c.find((p) => fs.existsSync(p));
}
function m365(a, json = true) {
  const cli = cliPath();
  if (!cli) return { ok: false, err: 'CLI for Microsoft 365 nenalezeno (spust ve slozce z pripravenosti, nebo --cli).' };
  const r = spawnSync(process.execPath, [cli, ...a, ...(json ? ['--output', 'json'] : [])], { encoding: 'utf8', timeout: TIMEOUT_CLI_MS });
  const out = (r.stdout || '').trim();
  let j; try { j = JSON.parse(out); } catch { /* neni JSON */ }
  const err = j && typeof j === 'object' && !Array.isArray(j) && j.error ? String(j.error) : (r.status ? (r.stderr || out) : '');
  return err ? { ok: false, err: err.split('\n')[0] } : { ok: true, out, json: j };
}
function scopes(resource) {
  const t = m365(['util', 'accesstoken', 'get', '--resource', resource], false);
  if (!t.ok || !t.out.includes('.')) return { err: t.err || 'token nelze ziskat' };
  try { const p = JSON.parse(Buffer.from(t.out.split('.')[1], 'base64url').toString('utf8')); return { appid: p.appid, scp: p.scp || '', upn: p.upn }; }
  catch { return { err: 'token nelze rozlozit' }; }
}

const funguje = [], blokovano = [], zadost = [];
const st = m365(['status']);
if (!st.ok || !st.json?.connectedAs) {
  const chybiCli = !cliPath();
  const t = (chybiCli
    ? `CLI for Microsoft 365 tu neni (ani v node_modules pracovni slozky, ani v --cli), recon proto nema z ceho cist.
Instalace: egd-pripravenost, krok cli-instalace. Nejde-li CLI nainstalovat ani prihlasit, pokracuj cestou A3 (REST z prohlizece) nebo A2 (rucne).
Prava v katalogu zjistis i bez CLI: v prohlizeci, kde jsi prihlaseny, otevri
  ${web}/_api/web/GetList('${new URL(web).pathname}/AppCatalog')/EffectiveBasePermissions
  a cisla <d:High> a <d:Low> preloz: node "<S>" maska --high H --low L (S = scripts/pripravenost.mjs skillu egd-pripravenost).
  Chybi-li addListItems / editListItems, potrebujes roli Clen nebo Vlastnik; 404 = web nema katalog; 403 = na web nemas pristup.
`
    : '') + `CLI neni prihlasene, recon proto nema z ceho cist. Prihlaseni dela clovek ve svem terminalu (skill egd-pripravenost, krok 5).
Konci-li prihlaseni obrazovkou "Need admin approval" / "Vyzaduje se schvaleni spravcem": aplikaci CLI si sam schvalit nesmis (opravneni SharePointu chce souhlas spravce).
Konci-li prihlaseni chybou AADSTS65001 (nebo 700016 / 7000218): aplikace CLI nema v tenantu souhlas spravce, nebo je tenant jinak omezuje.
Zadost pro IT: Prosim o souhlas spravce (admin consent) s delegovanym opravnenim SharePointu (AllSites.Manage / AllSites.FullControl) pro aplikaci CLI for Microsoft 365 (appId od IT) a o roli Clen (Member) nebo Vlastnik na webu ${web}.
Mezitim jde appku nasadit bez CLI: cesta A3 (REST z prohlizece) nebo A2 (rucne), viz egd-pripravenost/references/appka.md.`;
  console.log(t); if (opt('out')) fs.writeFileSync(opt('out'), `# Recon: CLI ${chybiCli ? 'chybi' : 'neni prihlasene'}\n\n${t}\n`, 'utf8');
  process.exit(1);
}
funguje.push(`prihlasen jako ${st.json.connectedAs}, appId ${st.json.appId || '?'}`);

// 1. vrstva Entra: co smi aplikace (scopes na SharePoint resource)
const sp = scopes(origin);
if (sp.err) blokovano.push(`Entra: token na ${origin}: ${sp.err}`);
else if (/AllSites\.(FullControl|Manage|Write)/.test(sp.scp)) funguje.push(`Entra: aplikace ma na SharePointu scope ${sp.scp}`);
else { blokovano.push(`Entra: aplikace nema na SharePointu dost prav (scope: "${sp.scp}")`); zadost.push(`Prosim o souhlas spravce (admin consent) s delegovanym opravnenim SharePointu (AllSites.Manage / AllSites.FullControl) pro aplikaci ${st.json.appId || '(appId z "m365 status")'}.`); }

// 2. vrstva SharePoint: role na webu a v jeho katalogu aplikaci
const kat = m365(['spo', 'app', 'list', '--appCatalogScope', 'sitecollection', '--appCatalogUrl', web]);
if (!kat.ok) {
  if (/sitecollectionappcatalog|neexistuje|nedá najít|does not exist|cannot be found/i.test(kat.err)) {
    blokovano.push('SharePoint: web nema vlastni katalog aplikaci (u cerstve zalozeneho webu pockej 5 minut a zkus znovu)');
    zadost.push(`Prosim o zalozeni katalogu aplikaci pro kolekci webu (site collection app catalog) na webu ${web} (E-mail sharepoint@eon.com).`);
  } else if (/denied|odepřen|403|unauthorized/i.test(kat.err)) {
    blokovano.push(`SharePoint: do katalogu webu nevidis (${kat.err})`);
    zadost.push(`Prosim o roli Clen (Member) nebo Vlastnik na webu ${web}.`);
  } else blokovano.push(`SharePoint: katalog nejde precist: ${kat.err}`);
} else {
  funguje.push(`SharePoint: katalog aplikaci webu jde cist (${Array.isArray(kat.json) ? kat.json.length : '?'} balicku)`);
  const l = m365(['spo', 'list', 'get', '--webUrl', web, '--url', 'AppCatalog', '--properties', 'Title,EffectiveBasePermissions']);
  const ebp = l.json?.EffectiveBasePermissions;
  if (!l.ok || !ebp) blokovano.push(`SharePoint: prava v katalogu nejdou zjistit (${l.err || 'bez udaje'})`);
  else {
    const mask = (BigInt(ebp.High) << 32n) | BigInt(ebp.Low);
    const ma = (b) => (mask & b) === b;
    const chybi = ['addListItems', 'editListItems'].filter((k) => !ma(PRAVA[k]));
    if (chybi.length) { blokovano.push(`SharePoint: v katalogu aplikaci chybi prava ${chybi.join(', ')} (jen cteni)`); zadost.push(`Prosim o roli Clen (Member) nebo Vlastnik na webu ${web} (potrebuji nahrat balicek aplikace do jeho katalogu).`); }
    else funguje.push('SharePoint: do katalogu aplikaci muzes nahravat balicky');
  }
}

// 3. katalog celeho tenantu (jen informativne; zapisovat do nej nebudeme)
const tc = m365(['spo', 'tenant', 'appcatalogurl', 'get']);
funguje.push(tc.ok ? `informace: katalog tenantu ${tc.out.replace(/"/g, '')}` : `informace: katalog tenantu nejde zjistit (${tc.err}); pro tuto appku ho nepotrebujes`);

const radky = (a) => (a.length ? a.map((x) => `- ${x}`).join('\n') : '- nic');
const text = `# Recon: co tu smis (jen cteni)\n\nWeb: ${web}\n\n## Funguje\n${radky(funguje)}\n\n## Blokovano\n${radky(blokovano)}\n\n## Zadost pro IT\n${radky(zadost)}\n`;
console.log(text);
if (opt('out')) fs.writeFileSync(opt('out'), text, 'utf8');
