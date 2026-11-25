// Minimální API nad Azure SQL: role z tokenu (app roles) rozhodují, co kdo vidí a smí.
// Zadavatel: čte a zakládá jen své (podle oid); Schvalovatel: čte vše, mění stav; Spravce: vše + mazání.
// Konfigurace jen z prostředí (TENANT_ID, API_CLIENT_ID, SQL_*), žádné pevné hodnoty.
import http from 'node:http';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import sql from 'mssql';

const need = (k) => { if (!process.env[k]) throw new Error(`chybí ${k}`); return process.env[k]; };
const TENANT = need('TENANT_ID'), AUD = need('API_CLIENT_ID');
const jwks = createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${TENANT}/discovery/v2.0/keys`));
const cfg = { server: need('SQL_SERVER'), database: need('SQL_DB'), user: need('SQL_ADMIN'), password: need('SQL_PASSWORD'),
  options: { encrypt: true }, connectionTimeout: 90000, requestTimeout: 90000 };
let pool;
const db = async () => (pool ??= await sql.connect(cfg));
const init = async () => (await db()).request().query(`IF OBJECT_ID('dbo.Zadost') IS NULL CREATE TABLE dbo.Zadost (
  Id INT IDENTITY PRIMARY KEY, Nazev NVARCHAR(200) NOT NULL, Castka DECIMAL(12,2) NULL, Stav NVARCHAR(20) NOT NULL DEFAULT 'Nova',
  AutorOid NVARCHAR(40) NOT NULL, AutorUpn NVARCHAR(200) NOT NULL, Vytvoreno DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME());
IF OBJECT_ID('dbo.OrgUzivatel') IS NULL CREATE TABLE dbo.OrgUzivatel (
  Oid NVARCHAR(40) PRIMARY KEY, Upn NVARCHAR(200) NOT NULL, Oddeleni NVARCHAR(200) NULL, NadrizenyOid NVARCHAR(40) NULL,
  Synchronizovano DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME());`);

// --- Organizace: oddělení a nadřízený (v0.3) ----------------------------------------------------------------------
// Zdroj pravdy je Entra (department, manager). /api/org/sync je zkopíruje do SQL (dbo.OrgUzivatel), aby šla práva
// vyhodnotit jedním dotazem (rekurzivní CTE přes nadřízené). Identita: stejná MI, Graph app role User.Read.All.
const orgSync = async () => {
  const t0 = Date.now(); const lide = [];
  let url = 'https://graph.microsoft.com/v1.0/users?$select=id,userPrincipalName,department&$expand=manager($select=id)&$top=999';
  while (url) {
    const r = await fetch(url, { headers: { authorization: `Bearer ${await miToken('https://graph.microsoft.com')}` } });
    const j = await r.json();
    if (!r.ok) throw new Error(`Graph ${r.status}: ${JSON.stringify(j).slice(0, 300)}`);
    lide.push(...j.value); url = j['@odata.nextLink'];
  }
  const tx = new sql.Transaction(await db()); await tx.begin();
  try {
    await new sql.Request(tx).query('DELETE dbo.OrgUzivatel');
    for (const u of lide) {
      await new sql.Request(tx).input('o', u.id).input('u', u.userPrincipalName).input('d', u.department ?? null).input('m', u.manager?.id ?? null)
        .query('INSERT dbo.OrgUzivatel(Oid,Upn,Oddeleni,NadrizenyOid) VALUES(@o,@u,@d,@m)');
    }
    await tx.commit();
  } catch (e) { await tx.rollback(); throw e; }
  return { uzivatelu: lide.length, sNadrizenym: lide.filter((u) => u.manager?.id).length, ms: Date.now() - t0 };
};
// Viditelnost žádostí „týmu“: vlastní + všech podřízených (i nepřímých) + (Schvalovatel) celého svého oddělení + (Spravce) vše.
const TYM_SQL = `WITH pod AS (
    SELECT Oid, 1 AS Uroven FROM dbo.OrgUzivatel WHERE NadrizenyOid=@me
    UNION ALL SELECT o.Oid, p.Uroven+1 FROM dbo.OrgUzivatel o JOIN pod p ON o.NadrizenyOid=p.Oid WHERE p.Uroven < 20)
  SELECT z.Id, z.Nazev, z.Castka, z.Stav, z.AutorUpn, ou.Oddeleni AS AutorOddeleni,
    CASE WHEN z.AutorOid=@me THEN 'vlastni' WHEN z.AutorOid IN (SELECT Oid FROM pod) THEN 'podrizeny'
         WHEN @schv=1 AND ou.Oddeleni=(SELECT Oddeleni FROM dbo.OrgUzivatel WHERE Oid=@me) THEN 'oddeleni' ELSE 'spravce' END AS Duvod
  FROM dbo.Zadost z LEFT JOIN dbo.OrgUzivatel ou ON ou.Oid=z.AutorOid
  WHERE z.AutorOid=@me OR z.AutorOid IN (SELECT Oid FROM pod) OR @spravce=1
     OR (@schv=1 AND ou.Oddeleni IS NOT NULL AND ou.Oddeleni=(SELECT Oddeleni FROM dbo.OrgUzivatel WHERE Oid=@me))
  ORDER BY z.Id OPTION (MAXRECURSION 20)`;

// --- SharePoint: práva na jednotlivé položky (v0.2) --------------------------------------------------------------
// Identita: user-assigned managed identity (env SP_MI_CLIENT_ID) s app rolí Sites.Selected + fullcontrol jen na SP_SITE_URL.
// Volající uživatel SharePoint práva nemění: API ověří jeho token (vlastník položky nebo role Spravce) a změnu udělá samo.
const SP_SITE = process.env.SP_SITE_URL?.replace(/\/$/, ''), SP_LIST = process.env.SP_LIST, SP_MI = process.env.SP_MI_CLIENT_ID;
// Token managed identity pro libovolný zdroj (SharePoint, Graph); kešuje se do 5 min před vypršením.
const miTok = {};
const miToken = async (resource) => {
  const c = miTok[resource];
  if (c && c.exp - 300 > Date.now() / 1000) return c.t;
  const u = `${process.env.IDENTITY_ENDPOINT}?resource=${encodeURIComponent(resource)}&api-version=2019-08-01&client_id=${SP_MI}`;
  const r = await fetch(u, { headers: { 'X-IDENTITY-HEADER': process.env.IDENTITY_HEADER } });
  const j = await r.json();
  if (!r.ok) throw new Error(`MI token ${r.status}: ${JSON.stringify(j).slice(0, 300)}`);
  miTok[resource] = { t: j.access_token, exp: Number(j.expires_on) };
  return j.access_token;
};
const spToken = () => miToken(new URL(SP_SITE).origin);
const sp = async (method, path, body) => {
  const r = await fetch(`${SP_SITE}/_api/${path}`, { method, headers: { authorization: `Bearer ${await spToken()}`,
    accept: 'application/json;odata=nometadata', ...(body ? { 'content-type': 'application/json;odata=nometadata' } : {}) },
    body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let j; try { j = t ? JSON.parse(t) : {}; } catch { j = t; }
  return { status: r.status, j };
};
const ROLE_TYPE = { Read: 2, Contribute: 3, Edit: 6 };   // SP.RoleType: Reader, Contributor, Editor
const loginOf = (upn) => `i:0#.f|membership|${upn}`;
const L = () => `web/lists/getbytitle('${encodeURIComponent(SP_LIST)}')`;
const spErr = (r) => ({ sp_status: r.status, sp: typeof r.j === 'object' ? (r.j['odata.error']?.message?.value || r.j.error?.message || r.j) : String(r.j).slice(0, 300) });

// Kdo smí: vlastník (Author položky, porovnání UPN z tokenu s e-mailem/UPN autora) nebo app role Spravce.
const spItemOwner = async (id) => {
  const r = await sp('GET', `${L()}/items(${id})?$select=Id,Title,HasUniqueRoleAssignments,Author/Id,Author/EMail,Author/Name&$expand=Author`);
  if (r.status !== 200) return { r };
  const a = r.j.Author || {};
  const upn = String(a.Name || '').split('|').pop().toLowerCase();
  return { r, item: r.j, ownerUpn: upn, ownerEmail: String(a.EMail || '').toLowerCase() };
};

const spRoutes = async (req, res, url, c, has) => {
  const m = /^\/api\/sp\/polozky\/(\d+)\/(sdilet|prava)$/.exec(url.pathname);
  if (!m) return false;
  if (!SP_SITE || !SP_LIST || !SP_MI) { send(res, 501, { error: 'SharePoint není nakonfigurován (SP_SITE_URL, SP_LIST, SP_MI_CLIENT_ID)' }); return true; }
  const id = m[1], me = String(c.preferred_username || '').toLowerCase();
  const o = await spItemOwner(id);
  if (!o.item) { send(res, o.r.status === 404 ? 404 : 502, { error: 'položku nelze načíst', ...spErr(o.r) }); return true; }
  const isOwner = me && (me === o.ownerUpn || me === o.ownerEmail);
  if (!isOwner && !has('Spravce')) { send(res, 403, { error: 'sdílet smí jen vlastník položky nebo Spravce', ja: me, vlastnik: o.ownerUpn }); return true; }
  if (m[2] === 'prava' && req.method === 'GET') {
    const r = await sp('GET', `${L()}/items(${id})/roleassignments?$expand=Member,RoleDefinitionBindings&$select=Member/Title,Member/LoginName,RoleDefinitionBindings/Name`);
    send(res, r.status === 200 ? 200 : 502, r.status === 200 ? { id: Number(id), unikatni: o.item.HasUniqueRoleAssignments,
      prava: r.j.value.map((x) => ({ kdo: x.Member.LoginName, role: x.RoleDefinitionBindings.map((b) => b.Name) })) } : spErr(r));
    return true;
  }
  if (m[2] === 'sdilet' && req.method === 'POST') {
    const b = await readBody(req);
    const komu = String(b.komu || '').toLowerCase(), role = b.role || 'Read';
    if (!/^[^@\s]+@[^@\s]+$/.test(komu) || !ROLE_TYPE[role]) { send(res, 400, { error: 'chci {komu: upn, role: Read|Edit|Contribute}' }); return true; }
    const kroky = [];
    if (!o.item.HasUniqueRoleAssignments) {   // první sdílení = položka se uzavře: vidí ji jen autor a ti, komu ji nasdílí
      const br = await sp('POST', `${L()}/items(${id})/breakroleinheritance(copyRoleAssignments=false,clearSubscopes=true)`);
      kroky.push({ krok: 'breakroleinheritance', http: br.status });
      if (br.status !== 200) { send(res, 502, { error: 'breakroleinheritance selhalo', kroky, ...spErr(br) }); return true; }
      const au = await sp('POST', 'web/ensureuser', { logonName: loginOf(o.ownerUpn) });
      const rd = await sp('GET', `web/roledefinitions/getbytype(${ROLE_TYPE.Contribute})?$select=Id`);
      const ga = await sp('POST', `${L()}/items(${id})/roleassignments/addroleassignment(principalid=${au.j.Id},roledefid=${rd.j.Id})`);
      kroky.push({ krok: 'autor-Contribute', kdo: o.ownerUpn, http: ga.status });
    }
    const u = await sp('POST', 'web/ensureuser', { logonName: loginOf(komu) });
    if (u.status !== 200) { send(res, 400, { error: 'uživatel nenalezen', kroky, ...spErr(u) }); return true; }
    const rd = await sp('GET', `web/roledefinitions/getbytype(${ROLE_TYPE[role]})?$select=Id,Name`);
    const g = await sp('POST', `${L()}/items(${id})/roleassignments/addroleassignment(principalid=${u.j.Id},roledefid=${rd.j.Id})`);
    kroky.push({ krok: 'addroleassignment', kdo: komu, role: rd.j.Name, http: g.status });
    send(res, g.status === 200 ? 200 : 502, { ok: g.status === 200, id: Number(id), sdilel: me, jako: isOwner ? 'vlastnik' : 'Spravce', kroky, ...(g.status === 200 ? {} : spErr(g)) });
    return true;
  }
  send(res, 405, { error: 'metoda' }); return true;
};

const send = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
const readBody = (req) => new Promise((ok) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => ok(b ? JSON.parse(b) : {})); });

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/healthz') return send(res, 200, { ok: true });
    const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
    if (!m) return send(res, 401, { error: 'chybí token' });
    let c;
    try { c = (await jwtVerify(m[1], jwks, { issuer: `https://login.microsoftonline.com/${TENANT}/v2.0`, audience: AUD })).payload; }
    catch (e) { return send(res, 401, { error: 'neplatný token', detail: e.code || e.message }); }
    const roles = c.roles || [];
    if (!roles.length) return send(res, 403, { error: 'bez aplikační role', upn: c.preferred_username });
    const has = (...r) => r.some((x) => roles.includes(x));
    if (url.pathname === '/api/me') return send(res, 200, { upn: c.preferred_username, oid: c.oid, roles, ver: '0.3' });
    if (await spRoutes(req, res, url, c, has)) return;
    const pool = await db();
    const idm = /^\/api\/zadosti\/(\d+)(\/stav)?$/.exec(url.pathname);
    if (url.pathname === '/api/org/sync' && req.method === 'POST') {
      if (!has('Spravce')) return send(res, 403, { error: 'synchronizaci spouští jen Spravce', roles });
      return send(res, 200, await orgSync());
    }
    if (url.pathname === '/api/org/me') {
      const r = await pool.request().input('me', c.oid).query(`SELECT u.Upn, u.Oddeleni, m.Upn AS Nadrizeny,
        (SELECT STRING_AGG(p.Upn, ', ') FROM dbo.OrgUzivatel p WHERE p.NadrizenyOid=u.Oid) AS PrimiPodrizeni, u.Synchronizovano
        FROM dbo.OrgUzivatel u LEFT JOIN dbo.OrgUzivatel m ON m.Oid=u.NadrizenyOid WHERE u.Oid=@me`);
      return send(res, r.recordset.length ? 200 : 404, r.recordset[0] ?? { error: 'nejsi v org tabulce, spusť /api/org/sync' });
    }
    if (url.pathname === '/api/zadosti/tym' && req.method === 'GET') {
      const r = await pool.request().input('me', c.oid).input('schv', has('Schvalovatel') ? 1 : 0).input('spravce', has('Spravce') ? 1 : 0).query(TYM_SQL);
      return send(res, 200, r.recordset);
    }
    if (url.pathname === '/api/zadosti' && req.method === 'GET') {
      const r = pool.request();
      let q = 'SELECT Id,Nazev,Castka,Stav,AutorUpn,Vytvoreno FROM dbo.Zadost';
      if (!has('Schvalovatel', 'Spravce')) { q += ' WHERE AutorOid=@o'; r.input('o', c.oid); }
      return send(res, 200, (await r.query(q + ' ORDER BY Id')).recordset);
    }
    if (url.pathname === '/api/zadosti' && req.method === 'POST') {
      if (!has('Zadavatel', 'Spravce')) return send(res, 403, { error: 'role nesmí zakládat', roles });
      const b = await readBody(req);
      const r = await pool.request().input('n', b.nazev).input('c', b.castka ?? null).input('o', c.oid).input('u', c.preferred_username)
        .query('INSERT dbo.Zadost(Nazev,Castka,AutorOid,AutorUpn) OUTPUT INSERTED.Id VALUES(@n,@c,@o,@u)');
      return send(res, 201, { id: r.recordset[0].Id });
    }
    if (idm && idm[2] && req.method === 'POST') { // změna stavu
      if (!has('Schvalovatel', 'Spravce')) return send(res, 403, { error: 'role nesmí měnit stav', roles });
      const b = await readBody(req);
      if (!['Nova', 'Schvaleno', 'Zamitnuto'].includes(b.stav)) return send(res, 400, { error: 'neplatný stav' });
      const r = await pool.request().input('i', idm[1]).input('s', b.stav).query('UPDATE dbo.Zadost SET Stav=@s WHERE Id=@i');
      return send(res, r.rowsAffected[0] ? 200 : 404, { ok: !!r.rowsAffected[0] });
    }
    if (idm && !idm[2] && req.method === 'DELETE') {
      if (!has('Spravce')) return send(res, 403, { error: 'maže jen Spravce', roles });
      const r = await pool.request().input('i', idm[1]).query('DELETE dbo.Zadost WHERE Id=@i');
      return send(res, r.rowsAffected[0] ? 200 : 404, { ok: !!r.rowsAffected[0] });
    }
    send(res, 404, { error: 'nenalezeno' });
  } catch (e) { console.error(e); send(res, 500, { error: String(e.message || e) }); }
}).listen(process.env.PORT || 8080, () => { init().then(() => console.log('ready')).catch((e) => console.error('init', e.message)); });
