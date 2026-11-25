// POST /api/pdf: tělo = soubor docx/xlsx/pptx (raw), přípona z ?ext= nebo hlavičky X-Filename; výstup application/pdf.
// Token Entra (v2, aud = API_CLIENT_ID, scp obsahuje REQUIRED_SCOPE). Konfigurace jen z prostředí, viz README v libreoffice.md.
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const need = (k) => { if (!process.env[k]) throw new Error(`chybí ${k}`); return process.env[k]; };
const TENANT = need('TENANT_ID'), AUD = need('API_CLIENT_ID');
const SCOPE = process.env.REQUIRED_SCOPE || 'access_as_user';
const ROLE = process.env.REQUIRED_ROLE || 'Dokumenty.App'; // aplikační volající (Job, jiný server) přes managed identitu
const MAX_BYTES = Number(need('MAX_BYTES'));
const TIMEOUT_MS = Number(need('CONVERT_TIMEOUT_MS'));
const ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
const EXTS = new Set(['docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt', 'odt', 'ods', 'odp', 'rtf']);
const jwks = createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${TENANT}/discovery/v2.0/keys`));
const started = Date.now();
let converts = 0;

const cors = (req, res) => {
  const o = req.headers.origin;
  if (o && ORIGINS.includes(o)) {
    res.setHeader('access-control-allow-origin', o);
    res.setHeader('vary', 'origin');
    res.setHeader('access-control-allow-headers', 'authorization,content-type,x-filename');
    res.setHeader('access-control-allow-methods', 'POST,GET,OPTIONS');
    res.setHeader('access-control-expose-headers', 'x-convert-ms,x-process-uptime-ms,x-convert-count');
  }
};
const send = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); };
// Při překročení limitu tělo dočteme a zahodíme, jinak klient místo 413 dostane reset spojení (ingress pak hlásí 503).
const readBody = (req) => new Promise((ok, ko) => {
  const parts = []; let n = 0;
  req.on('data', (c) => { n += c.length; if (n <= MAX_BYTES) parts.push(c); });
  req.on('end', () => (n > MAX_BYTES ? ko(Object.assign(new Error(`soubor je větší než ${MAX_BYTES} B`), { code: 413 })) : ok(Buffer.concat(parts))));
  req.on('error', ko);
});
const OOXML = new Set(['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp']); // ZIP kontejnery: musí začínat PK\x03\x04
const soffice = (dir, file) => new Promise((ok, ko) => {
  // vlastní profil pro každý běh = souběžné převody se navzájem nezamknou
  const p = spawn('soffice', [`-env:UserInstallation=file://${dir}/profile`, '--headless', '--norestore', '--convert-to', 'pdf', '--outdir', dir, file], { stdio: ['ignore', 'pipe', 'pipe'] });
  let err = ''; p.stdout.on('data', (d) => (err += d)); p.stderr.on('data', (d) => (err += d));
  const t = setTimeout(() => { p.kill('SIGKILL'); ko(new Error('převod vypršel')); }, TIMEOUT_MS);
  p.on('close', (code) => { clearTimeout(t); code === 0 ? ok(err) : ko(new Error(`soffice ${code}: ${err.slice(0, 400)}`)); });
});

http.createServer(async (req, res) => {
  cors(req, res);
  try {
    const url = new URL(req.url, 'http://x');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (url.pathname === '/healthz') return send(res, 200, { ok: true, uptimeMs: Date.now() - started });
    const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
    if (!m) return send(res, 401, { error: 'chybí token' });
    let c;
    try { c = (await jwtVerify(m[1], jwks, { issuer: `https://login.microsoftonline.com/${TENANT}/v2.0`, audience: AUD })).payload; }
    catch (e) { return send(res, 401, { error: 'neplatný token', detail: e.code || e.message }); }
    const roles = Array.isArray(c.roles) ? c.roles : [];
    if (!String(c.scp || '').split(' ').includes(SCOPE) && !roles.includes(ROLE)) return send(res, 403, { error: `token nemá scope ${SCOPE} ani roli ${ROLE}` });
    const who = c.preferred_username || `app:${c.azp || c.appid}`;
    if (url.pathname === '/api/me') return send(res, 200, { upn: c.preferred_username, oid: c.oid, scp: c.scp, roles, azp: c.azp });
    if (url.pathname !== '/api/pdf' || req.method !== 'POST') return send(res, 404, { error: 'nenalezeno' });
    const name = url.searchParams.get('ext') ? `vstup.${url.searchParams.get('ext')}` : decodeURIComponent(req.headers['x-filename'] || '');
    const ext = (name.split('.').pop() || '').toLowerCase();
    if (!EXTS.has(ext)) return send(res, 400, { error: 'neznámá přípona (?ext=docx|xlsx|pptx…)' });
    if (Number(req.headers['content-length'] || 0) > MAX_BYTES) { req.resume(); return send(res, 413, { error: `soubor je větší než ${MAX_BYTES} B` }); }
    const body = await readBody(req);
    if (!body.length) return send(res, 400, { error: 'prázdné tělo' });
    if (OOXML.has(ext) && (body.length < 4 || body.readUInt32LE(0) !== 0x04034b50)) return send(res, 400, { error: `soubor .${ext} není ZIP (Office Open XML / ODF)` });
    const dir = await mkdtemp(join(tmpdir(), 'pdf-'));
    try {
      const t0 = Date.now();
      await writeFile(join(dir, `vstup.${ext}`), body);
      await soffice(dir, join(dir, `vstup.${ext}`));
      const pdf = await readFile(join(dir, 'vstup.pdf'));
      const ms = Date.now() - t0; converts++;
      console.log(JSON.stringify({ ev: 'pdf', who, ext, inBytes: body.length, outBytes: pdf.length, ms, n: converts }));
      res.writeHead(200, { 'content-type': 'application/pdf', 'x-convert-ms': ms, 'x-process-uptime-ms': Date.now() - started, 'x-convert-count': converts });
      res.end(pdf);
    } finally { await rm(dir, { recursive: true, force: true }); }
  } catch (e) { console.error(e); if (!res.headersSent) send(res, e.code === 413 ? 413 : 500, { error: String(e.message || e) }); }
}).listen(process.env.PORT || 8080, () => console.log('ready'));
