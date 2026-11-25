// OBO sonda: Container App vezme token uživatele (aud = naše API), vymění ho on-behalf-of za token Graphu
// jménem téhož člověka a vrátí data, ke kterým SPFx v prohlížeči nemá oprávnění (Mail.ReadBasic).
// Důkaz „jsem tato appka“ při výměně:
//   OBO_MODE=mi     → token uživatelem přiřazené managed identity pro api://AzureADTokenExchange (federated credential, bez tajemství)
//   OBO_MODE=secret → client secret z Key Vaultu (Container App secret s keyVaultUrl), proměnná OBO_CLIENT_SECRET
// Konfigurace jen z prostředí: TENANT_ID, API_CLIENT_ID, OBO_MODE, MI_CLIENT_ID | OBO_CLIENT_SECRET, GRAPH_SCOPES,
//   COPILOT_SCOPES (scopy pro Graph beta /copilot/*), volitelně GATEWAY_URL + GATEWAY_SCOPE (Retrieval + vlastní LLM).
// Endpointy: GET /api/whoami, GET /api/posta, POST /api/copilot/retrieval {dotaz, filtr?},
//   POST /api/copilot/chat {dotaz}, POST /api/copilot/odpoved {dotaz, filtr?} (Retrieval → gateway LLM, bez Copilot Chatu).
import http from 'node:http';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const need = (k) => { if (!process.env[k]) throw new Error(`chybí ${k}`); return process.env[k]; };
const TENANT = need('TENANT_ID'), AUD = need('API_CLIENT_ID'), MODE = need('OBO_MODE');
const SCOPES = need('GRAPH_SCOPES'), COPILOT_SCOPES = need('COPILOT_SCOPES'); // např. "https://graph.microsoft.com/User.Read https://graph.microsoft.com/Mail.ReadBasic"
const AUTHORITY = `https://login.microsoftonline.com/${TENANT}`;
const jwks = createRemoteJWKSet(new URL(`${AUTHORITY}/discovery/v2.0/keys`));

const send = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); };

// Token managed identity pro výměnu (Container Apps: IDENTITY_ENDPOINT + IDENTITY_HEADER).
async function miAssertion() {
  const u = new URL(need('IDENTITY_ENDPOINT'));
  u.searchParams.set('api-version', '2019-08-01');
  u.searchParams.set('resource', 'api://AzureADTokenExchange');
  u.searchParams.set('client_id', need('MI_CLIENT_ID'));
  const r = await fetch(u, { headers: { 'X-IDENTITY-HEADER': need('IDENTITY_HEADER') } });
  const j = await r.json();
  if (!r.ok) throw Object.assign(new Error('managed identity token selhal'), { status: 500, detail: j });
  return j.access_token;
}

async function obo(userToken, scope = SCOPES) {
  const form = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', client_id: AUD, assertion: userToken,
    requested_token_use: 'on_behalf_of', scope,
  });
  if (MODE === 'mi') {
    form.set('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
    form.set('client_assertion', await miAssertion());
  } else if (MODE === 'secret') {
    form.set('client_secret', need('OBO_CLIENT_SECRET'));
  } else throw new Error(`neznámý OBO_MODE ${MODE}`);
  const t0 = Date.now();
  const r = await fetch(`${AUTHORITY}/oauth2/v2.0/token`, { method: 'POST', body: form });
  const j = await r.json();
  if (!r.ok) {
    const code = (/AADSTS\d+/.exec(j.error_description || '') || [])[0];
    // consent_required / invalid_grant(65001) → 403 souhlas; interaction_required (CA, MFA) → 401 s claims pro klienta
    const status = j.error === 'interaction_required' ? 401 : (code === 'AADSTS65001' || j.error === 'consent_required') ? 403 : 502;
    throw Object.assign(new Error('OBO výměna selhala'), { status, detail: { error: j.error, aadsts: code, claims: j.claims, description: (j.error_description || '').split('\r\n')[0] } });
  }
  return { token: j.access_token, scope: j.scope, ms: Date.now() - t0 };
}

const graph = async (tok, path) => {
  const r = await fetch(`https://graph.microsoft.com/v1.0${path}`, { headers: { authorization: `Bearer ${tok}` } });
  return { status: r.status, body: await r.json() };
};
// POST na Graph (beta Copilot API); vrací stav, čas a tělo (text, když to není JSON)
const graphPost = async (tok, url, data) => {
  const t0 = Date.now();
  const r = await fetch(url, { method: 'POST', headers: { authorization: `Bearer ${tok}`, 'content-type': 'application/json' }, body: JSON.stringify(data) });
  const txt = await r.text(); let body; try { body = JSON.parse(txt); } catch { body = txt; }
  return { status: r.status, ms: Date.now() - t0, body, requestId: r.headers.get('request-id') };
};
const readBody = (req) => new Promise((ok, ko) => { let d = ''; req.on('data', (c) => { d += c; if (d.length > 1e5) ko(Object.assign(new Error('tělo > 100 kB'), { status: 413 })); });
  req.on('end', () => { try { ok(d ? JSON.parse(d) : {}); } catch { ko(Object.assign(new Error('tělo není JSON'), { status: 400 })); } }); });
const BETA = 'https://graph.microsoft.com/beta/copilot';
const retrieval = (tok, dotaz, filtr) => graphPost(tok, `${BETA}/retrieval`, { queryString: dotaz, dataSource: 'sharePoint',
  ...(filtr ? { filterExpression: filtr } : {}), maximumNumberOfResults: 5, resourceMetadata: ['title', 'author'] });
const hits = (b) => (b?.retrievalHits ?? []).map((h) => ({ url: h.webUrl, title: h.resourceMetadata?.title, extracts: (h.extracts ?? []).map((e) => e.text) }));

http.createServer(async (req, res) => {
  // CORS: SPFx volá z https://<tenant>.sharepoint.com (AadHttpClient = fetch s Authorization → preflight)
  const origin = req.headers.origin;
  if (origin && origin === process.env.ALLOWED_ORIGIN) {
    res.setHeader('access-control-allow-origin', origin);
    res.setHeader('access-control-allow-headers', 'authorization, content-type');
    res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/healthz') return send(res, 200, { ok: true, mode: MODE });
    const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
    if (!m) return send(res, 401, { error: 'chybí token' });
    let c;
    try { c = (await jwtVerify(m[1], jwks, { issuer: `${AUTHORITY}/v2.0`, audience: AUD })).payload; }
    catch (e) { return send(res, 401, { error: 'neplatný token', detail: e.code || e.message }); }
    if (!String(c.scp || '').split(' ').includes('access_as_user')) return send(res, 403, { error: 'token bez scope access_as_user', scp: c.scp });
    const who = { upn: c.preferred_username, oid: c.oid, azp: c.azp, scp: c.scp };
    if (url.pathname === '/api/whoami') return send(res, 200, who);
    if (url.pathname === '/api/posta') {
      const o = await obo(m[1]);
      const t0 = Date.now();
      const [me, msgs] = await Promise.all([
        graph(o.token, '/me?$select=displayName,mail'),
        graph(o.token, '/me/messages?$top=5&$select=subject,from,receivedDateTime&$orderby=receivedDateTime desc'),
      ]);
      return send(res, msgs.status === 200 ? 200 : 502, {
        mode: MODE, who, oboScope: o.scope, oboMs: o.ms, graphMs: Date.now() - t0,
        me: me.body.displayName ?? me.body, graphStatus: msgs.status,
        zpravy: msgs.status === 200 ? msgs.body.value.map((x) => ({ kdy: x.receivedDateTime, od: x.from?.emailAddress?.address, predmet: x.subject })) : msgs.body,
      });
    }
    if (url.pathname.startsWith('/api/copilot/') && req.method === 'POST') {
      const b = await readBody(req);
      const dotaz = String(b.dotaz || '').slice(0, 2000);
      if (!dotaz) return send(res, 400, { error: 'pošli {"dotaz": "..."}' });
      const o = await obo(m[1], COPILOT_SCOPES);
      const zaklad = { mode: MODE, who: who.upn, oboScope: o.scope, oboMs: o.ms };
      if (url.pathname === '/api/copilot/retrieval') {
        const r = await retrieval(o.token, dotaz, b.filtr);
        return send(res, r.status === 200 ? 200 : 502, { ...zaklad, graphStatus: r.status, graphMs: r.ms, requestId: r.requestId,
          ...(r.status === 200 ? { hits: hits(r.body) } : { graphChyba: r.body }), ...(b.raw ? { raw: r.body } : {}) });
      }
      if (url.pathname === '/api/copilot/chat') {
        const k = await graphPost(o.token, `${BETA}/conversations`, {});
        if (k.status !== 201 && k.status !== 200) return send(res, 502, { ...zaklad, krok: 'conversations', graphStatus: k.status, graphMs: k.ms, requestId: k.requestId, graphChyba: k.body });
        const c = await graphPost(o.token, `${BETA}/conversations/${k.body.id}/chat`, { message: { text: dotaz }, locationHint: { timeZone: 'Europe/Prague' } });
        const msgs = c.body?.messages ?? [];
        return send(res, c.status === 200 ? 200 : 502, { ...zaklad, krok: 'chat', konverzaceMs: k.ms, graphStatus: c.status, graphMs: c.ms, requestId: c.requestId,
          ...(c.status === 200 ? { copilotOdpovedel: msgs.length > 1, odpoved: msgs.at(-1)?.text, zdroje: (msgs.at(-1)?.attributions ?? []).map((a) => a.seeMoreWebUrl || a.providerDisplayName), zprav: msgs.length } : { graphChyba: c.body }),
          ...(b.raw ? { raw: c.body } : {}) });
      }
      if (url.pathname === '/api/copilot/odpoved') {
        if (!process.env.GATEWAY_URL) return send(res, 501, { error: 'GATEWAY_URL není nastavená' });
        const r = await retrieval(o.token, dotaz, b.filtr);
        if (r.status !== 200) return send(res, 502, { ...zaklad, krok: 'retrieval', graphStatus: r.status, graphChyba: r.body });
        const h = hits(r.body);
        const g = await obo(m[1], need('GATEWAY_SCOPE'));  // druhá OBO výměna: token pro gateway LLM jménem téhož uživatele
        const kontext = h.map((x, i) => `[${i + 1}] ${x.title || x.url}\n${x.extracts.join('\n')}`).join('\n\n') || '(nic nenalezeno)';
        const gw = await graphPost(g.token, `${process.env.GATEWAY_URL}/api/chat`, { max_tokens: 400, messages: [
          { role: 'system', content: 'Odpovídej česky, stručně, jen z dodaných úryvků. Na konci uveď čísla použitých zdrojů. Když v úryvcích odpověď není, řekni to.' },
          { role: 'user', content: `Úryvky z SharePointu:\n${kontext}\n\nOtázka: ${dotaz}` }] });
        return send(res, gw.status === 200 ? 200 : 502, { ...zaklad, retrievalMs: r.ms, gatewayOboMs: g.ms, gatewayStatus: gw.status, gatewayMs: gw.ms,
          zdroje: h.map((x) => x.url), ...(gw.status === 200 ? { odpoved: gw.body.text, model: gw.body.model, usage: gw.body.usage } : { gatewayChyba: gw.body }) });
      }
    }
    return send(res, 404, { error: 'neznámá cesta' });
  } catch (e) {
    return send(res, e.status || 500, { error: e.message, detail: e.detail });
  }
}).listen(process.env.PORT || 8080);
