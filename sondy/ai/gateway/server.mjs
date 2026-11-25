// LLM gateway pro SPFx (sonda ai). Bez npm závislostí, Node 22.
// Easy Auth (Entra) před kontejnerem ověří token a pošle X-MS-CLIENT-PRINCIPAL.
// Model a Document Intelligence se volají managed identitou (žádný klíč), kvóta a audit v Table Storage + stdout.
//
// Endpointy: GET /healthz (bez přihlášení), GET /api/whoami, GET /api/kvota,
//            POST /api/chat, POST /api/ocr, POST /api/image
// Konfigurace (proměnné prostředí, žádné výchozí hodnoty kromě PORT):
//   AOAI_ENDPOINT, AOAI_CHAT_DEPLOYMENT, AOAI_IMAGE_DEPLOYMENT (volitelné), DI_ENDPOINT, DI_API_VERSION,
//   TABLE_ENDPOINT, TABLE_NAME, APPS_JSON (registr appek: {"<X-App-Id>":{"tokensPerDay":N}}),
//   DEFAULT_TOKENS_PER_DAY, PRICES_JSON ({"chatInPerM":..,"chatOutPerM":..,"ocrPer1000Pages":..,"prebuiltPer1000Pages":..}), REQUIRED_SCOPE, REQUIRED_ROLE
import http from 'node:http';

const env = (k, req = true) => { const v = process.env[k]; if (req && !v) throw new Error(`Chybí proměnná ${k}`); return v; };
const PORT = Number(process.env.PORT ?? 8080);
const C = {
  aoai: env('AOAI_ENDPOINT').replace(/\/$/, ''), chat: env('AOAI_CHAT_DEPLOYMENT'), image: env('AOAI_IMAGE_DEPLOYMENT', false),
  di: env('DI_ENDPOINT').replace(/\/$/, ''), diVer: env('DI_API_VERSION'),
  table: env('TABLE_ENDPOINT').replace(/\/$/, ''), tableName: env('TABLE_NAME'),
  apps: JSON.parse(env('APPS_JSON')), defQuota: Number(env('DEFAULT_TOKENS_PER_DAY')),
  prices: JSON.parse(env('PRICES_JSON')), scope: env('REQUIRED_SCOPE'), role: env('REQUIRED_ROLE'),
  quotaRetries: Number(env('QUOTA_MAX_RETRIES')), quotaBackoffMs: Number(env('QUOTA_RETRY_BACKOFF_MS')),
};

// ---- managed identity token (Container Apps: IDENTITY_ENDPOINT + IDENTITY_HEADER) ----
const cache = new Map();
async function miToken(resource) {
  const c = cache.get(resource);
  if (c && c.exp > Date.now() + 120_000) return c.tok;
  const r = await fetch(`${process.env.IDENTITY_ENDPOINT}?resource=${encodeURIComponent(resource)}&api-version=2019-08-01`, { headers: { 'X-IDENTITY-HEADER': process.env.IDENTITY_HEADER } });
  if (!r.ok) throw new Error(`MI token ${r.status}: ${await r.text()}`);
  const j = await r.json();
  cache.set(resource, { tok: j.access_token, exp: Number(j.expires_on) * 1000 });
  return j.access_token;
}

// ---- kdo volá: z hlavičky Easy Auth (zvenku ji nelze podvrhnout, Easy Auth ji přepíše) ----
function volajici(req) {
  const h = req.headers['x-ms-client-principal'];
  if (!h) return null;
  const p = JSON.parse(Buffer.from(h, 'base64').toString('utf8'));
  const cl = {}; for (const c of p.claims ?? []) (cl[c.typ] ??= []).push(c.val);
  const one = (...ks) => { for (const k of ks) if (cl[k]?.[0]) return cl[k][0]; };
  return {
    oid: one('http://schemas.microsoft.com/identity/claims/objectidentifier', 'oid'),
    upn: one('preferred_username', 'upn', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn', 'name'),
    clientAppId: one('azp', 'appid'),
    scopes: (one('http://schemas.microsoft.com/identity/claims/scope', 'scp') ?? '').split(' ').filter(Boolean),
    roles: cl['roles'] ?? cl['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? [],
  };
}

// ---- kvóta a spotřeba: Table Storage, jeden řádek na (den, uživatel nebo appka, appKey) ----
const TV = '2023-11-03';
async function tableReq(method, path, body, extra = {}) {
  const r = await fetch(`${C.table}/${path}`, {
    method, body: body ? JSON.stringify(body) : undefined,
    headers: { Authorization: `Bearer ${await miToken('https://storage.azure.com/')}`, 'x-ms-version': TV, 'x-ms-date': new Date().toUTCString(),
      Accept: 'application/json;odata=nometadata', 'Content-Type': 'application/json', ...extra },
  });
  return r;
}
const den = () => new Date().toISOString().slice(0, 10);
const rowKey = (sub, appKey) => `${sub}__${appKey}`.replace(/[\\/#?]/g, '_');
async function nactiSpotrebu(sub, appKey, d = den()) {
  const r = await tableReq('GET', `${C.tableName}(PartitionKey='${d}',RowKey='${rowKey(sub, appKey)}')`);
  if (r.status === 404) return { tokens: 0, calls: 0, costUsd: 0, pages: 0, etag: null };
  if (!r.ok) throw new Error(`table get ${r.status}: ${await r.text()}`);
  const e = await r.json();
  return { tokens: Number(e.tokens ?? 0), calls: Number(e.calls ?? 0), costUsd: Number(e.costUsd ?? 0), pages: Number(e.pages ?? 0), etag: r.headers.get('etag') };
}
// Atomický přírůstek (optimistická souběžnost): přečte řádek s ETagem, zapíše jen pokud se mezitím nezměnil
// (Update Entity s If-Match → 412), nový řádek přes Insert Entity (POST → 409, když ho mezitím založil jiný požadavek).
// Při kolizi načte znovu a opakuje. limit != null: kontrola kvóty uvnitř téže transakce (rezervace před voláním modelu).
async function prictiSpotrebu(sub, appKey, delta, { limit = null, d = den(), who = {} } = {}) {
  for (let pokus = 1; pokus <= C.quotaRetries; pokus++) {
    const sp = await nactiSpotrebu(sub, appKey, d);
    if (limit != null && sp.tokens >= limit) throw new HttpErr(429, `Denní kvóta tokenů vyčerpána (${sp.tokens}/${limit})`);
    const ns = { tokens: sp.tokens + delta.tokens, calls: sp.calls + delta.calls, costUsd: sp.costUsd + delta.costUsd, pages: sp.pages + delta.pages };
    const ent = { ...ns, upn: who.upn ?? '', oid: who.oid ?? sub, client: who.clientAppId ?? '' };
    const r = sp.etag
      ? await tableReq('PUT', `${C.tableName}(PartitionKey='${d}',RowKey='${rowKey(sub, appKey)}')`, ent, { 'If-Match': sp.etag })
      : await tableReq('POST', C.tableName, { PartitionKey: d, RowKey: rowKey(sub, appKey), ...ent }, { Prefer: 'return-no-content' });
    if (r.ok) return { ...ns, pokusu: pokus };
    if (r.status !== 412 && r.status !== 409) throw new Error(`table zápis ${r.status}: ${await r.text()}`);
    await new Promise((ok) => setTimeout(ok, Math.random() * C.quotaBackoffMs * pokus));
  }
  throw new HttpErr(503, 'Kvóta je právě přetížená souběžnými voláními, zkus to znovu');
}
const limitTokenu = (appKey) => C.apps[appKey]?.tokensPerDay ?? C.defQuota;

class HttpErr extends Error { constructor(status, msg, extra) { super(msg); this.status = status; this.extra = extra; } }

async function body(req) {
  const ch = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > 15_000_000) throw new HttpErr(413, 'Tělo je větší než 15 MB'); ch.push(c); }
  try { return JSON.parse(Buffer.concat(ch).toString('utf8') || '{}'); } catch { throw new HttpErr(400, 'Tělo není JSON'); }
}

// ---- operace ----
async function chat(b) {
  const messages = b.messages ?? (b.prompt ? [{ role: 'user', content: b.prompt }] : null);
  if (!messages) throw new HttpErr(400, 'Pošli messages[] nebo prompt (obrázek: content jako pole s {type:"image_url"}).');
  const r = await fetch(`${C.aoai}/openai/v1/chat/completions`, {
    method: 'POST', headers: { Authorization: `Bearer ${await miToken('https://cognitiveservices.azure.com/')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: C.chat, messages, max_tokens: Math.min(Number(b.max_tokens ?? 500), 2000) }),
  });
  const j = await r.json();
  if (!r.ok) throw new HttpErr(502, 'Model vrátil chybu', j);
  const u = j.usage ?? {};
  const cost = (u.prompt_tokens * C.prices.chatInPerM + u.completion_tokens * C.prices.chatOutPerM) / 1e6;
  return { out: { text: j.choices?.[0]?.message?.content, usage: u, costUsd: cost, model: j.model }, tokens: u.total_tokens ?? 0, cost, pages: 0, model: j.model };
}

async function ocr(b) {
  const model = b.model ?? 'prebuilt-read';
  if (!['prebuilt-read', 'prebuilt-layout', 'prebuilt-invoice', 'prebuilt-receipt'].includes(model)) throw new HttpErr(400, 'Nepodporovaný model');
  if (!b.base64) throw new HttpErr(400, 'Pošli base64 (obsah PDF nebo obrázku).');
  const tok = await miToken('https://cognitiveservices.azure.com/');
  const s = await fetch(`${C.di}/documentintelligence/documentModels/${model}:analyze?api-version=${C.diVer}`, {
    method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ base64Source: b.base64 }),
  });
  if (s.status !== 202) throw new HttpErr(502, 'Document Intelligence odmítlo dokument', await s.text());
  const op = s.headers.get('operation-location');
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 700));
    const p = await (await fetch(op, { headers: { Authorization: `Bearer ${tok}` } })).json();
    if (p.status === 'succeeded') {
      const pages = p.analyzeResult.pages?.length ?? 0;
      const cost = pages * (model === 'prebuilt-read' ? C.prices.ocrPer1000Pages : C.prices.prebuiltPer1000Pages) / 1000;
      const fields = p.analyzeResult.documents?.[0]?.fields;
      return { out: { text: p.analyzeResult.content, pages, costUsd: cost, fields }, tokens: 0, cost, pages, model };
    }
    if (p.status === 'failed') throw new HttpErr(502, 'Analýza selhala', p);
  }
  throw new HttpErr(504, 'Analýza trvala příliš dlouho');
}

async function image(b) {
  if (!C.image) throw new HttpErr(501, 'Generování obrázků není nasazeno (kvóta modelu gpt-image je v subscription 0, vyžaduje žádost o přístup).');
  if (!b.prompt) throw new HttpErr(400, 'Pošli prompt.');
  const r = await fetch(`${C.aoai}/openai/v1/images/generations`, {
    method: 'POST', headers: { Authorization: `Bearer ${await miToken('https://cognitiveservices.azure.com/')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: C.image, prompt: b.prompt, size: b.size ?? '1024x1024', quality: b.quality ?? 'low', n: 1 }),
  });
  const j = await r.json();
  if (!r.ok) throw new HttpErr(502, 'Model vrátil chybu', j);
  return { out: { b64: j.data?.[0]?.b64_json, usage: j.usage }, tokens: j.usage?.total_tokens ?? 0, cost: 0, pages: 0, model: C.image };
}

const OPS = { '/api/chat': chat, '/api/ocr': ocr, '/api/image': image };

const send = (res, st, o) => { res.writeHead(st, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(o)); };

http.createServer(async (req, res) => {
  const t0 = Date.now(); const path = new URL(req.url, 'http://x').pathname;
  try {
    if (path === '/healthz') return send(res, 200, { ok: true });
    const who = volajici(req);
    if (!who?.oid && !who?.upn) throw new HttpErr(401, 'Chybí identita (Easy Auth)');
    // scope Gateway.Use pro delegovaný token, role Gateway.App pro aplikační (např. Power Automate / job)
    if (!who.scopes.includes(C.scope) && !who.roles.includes(C.role)) throw new HttpErr(403, `Token nemá scope ${C.scope} ani roli ${C.role}`);
    // „projektový klíč“: X-App-Id musí být v registru. SPFx má vždy stejné clientAppId (SharePoint Online Client Extensibility),
    // appky se proto rozlišují touto hlavičkou (evidenční, ne bezpečnostní hranice) nebo vlastním scopem/registrací.
    const appKey = String(req.headers['x-app-id'] ?? 'default');
    if (appKey !== 'default' && !C.apps[appKey]) throw new HttpErr(403, `Neznámá appka ${appKey}`);
    const sub = who.oid ?? who.upn;
    const sp = await nactiSpotrebu(sub, appKey);
    const lim = limitTokenu(appKey);
    if (path === '/api/whoami') return send(res, 200, { who, appKey });
    if (path === '/api/kvota') { const { etag, ...spotreba } = sp; return send(res, 200, { den: den(), appKey, spotreba, limitTokenuZaDen: lim }); }
    const op = OPS[path];
    if (!op || req.method !== 'POST') throw new HttpErr(404, 'Neznámý endpoint');
    const b = await body(req);
    // rezervace před voláním modelu: horní mez výstupu (max_tokens) se přičte atomicky spolu s kontrolou limitu,
    // takže souběžná volání limit neobejdou; po odpovědi se doúčtuje skutečnost (rozdíl), při chybě se rezervace vrátí
    const rez = path === '/api/chat' ? Math.min(Number(b.max_tokens ?? 500), 2000) : 0;
    const d = den();
    const rv = await prictiSpotrebu(sub, appKey, { tokens: rez, calls: 0, costUsd: 0, pages: 0 }, { limit: lim, d, who });
    let r;
    try { r = await op(b); }
    catch (e) { if (rez) await prictiSpotrebu(sub, appKey, { tokens: -rez, calls: 0, costUsd: 0, pages: 0 }, { d, who }).catch(() => {}); throw e; }
    const ns = await prictiSpotrebu(sub, appKey, { tokens: r.tokens - rez, calls: 1, costUsd: r.cost, pages: r.pages }, { d, who });
    const ms = Date.now() - t0;
    // aplikační klient (role Gateway.App) nemá upn: identifikuje ho oid jeho service principalu a client (appId)
    console.log(JSON.stringify({ evt: 'usage', kind: who.upn ? 'user' : 'app', user: who.upn, oid: who.oid, client: who.clientAppId, appKey, endpoint: path, model: r.model, tokens: r.tokens, rezervace: rez, pages: r.pages, costUsd: r.cost, pokusu: rv.pokusu + ns.pokusu, ms }));
    send(res, 200, { ...r.out, ms, kvotaDnes: { tokens: ns.tokens, limit: lim } });
  } catch (e) {
    const st = e.status ?? 500;
    console.log(JSON.stringify({ evt: 'error', path, status: st, msg: e.message, ms: Date.now() - t0 }));
    send(res, st, { error: e.message, detail: e.extra });
  }
}).listen(PORT, () => console.log(`gateway na :${PORT}`));
