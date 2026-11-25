// Výdejní API lab účtů EG.D (Azure Static Web Apps, managed function, programovací model v3, bez závislostí).
// Rezervace drží Azure Table Storage: vložení řádku s RowKey = účet je atomické (druhý dostane 409).
// Nastavení (app settings SWA, nikdy v repu):
//   SPOLECNE_HESLO  heslo, které Pavel řekne na workshopu
//   ADMIN_HESLO     heslo pro uvolnění rezervace
//   PODPIS_KLIC     náhodný klíč pro podpis sezení
//   UCTY_JSON       {"egd01":{"upn":"…","heslo":"…"}, …}
//   TABLE_URL       https://<účet>.table.core.windows.net/rezervace
//   TABLE_SAS       SAS token jen na tabulku rezervace (raud)
//   SEZENI_HODIN    platnost sezení v hodinách (výchozí 12)
//   SP_HOST         https://<tenant>.sharepoint.com (pro odkazy na weby účastníka)
//   CLI_APP_ID      appId CLI aplikace pro `m365 login` (nepovinné; bez něj se blok CLI neukáže)
//   CLI_TENANT      tenant pro `m365 login` (např. <tenant>.onmicrosoft.com)
const crypto = require("crypto");

const env = (n) => { const v = process.env[n]; if (!v) throw new Error("chybí nastavení " + n); return v; };
const ucty = () => JSON.parse(env("UCTY_JSON"));
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
const stejne = (a, b) => { const x = Buffer.from(hash(String(a))), y = Buffer.from(hash(String(b))); return crypto.timingSafeEqual(x, y); };
const podpis = (s) => crypto.createHmac("sha256", env("PODPIS_KLIC")).update(s).digest("base64url");
const pauza = (ms) => new Promise((r) => setTimeout(r, ms));

function noveSezeni() {
  const exp = Date.now() + Number(process.env.SEZENI_HODIN || 12) * 3600e3;
  return `${exp}.${podpis("v1." + exp)}`;
}
function platneSezeni(s) {
  const [exp, sig] = String(s || "").split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(podpis("v1." + exp))); } catch { return false; }
}

// --- Table Storage přes REST + SAS ---
const J = { Accept: "application/json;odata=nometadata", "Content-Type": "application/json", "x-ms-version": "2019-02-02" };
const turl = (cesta, dotaz = "") => `${env("TABLE_URL")}${cesta}?${env("TABLE_SAS").replace(/^\?/, "")}${dotaz}`;
async function vsechnyRezervace() {
  const r = await fetch(turl("()", "&$filter=" + encodeURIComponent("PartitionKey eq 'u'")), { headers: J });
  if (!r.ok) throw new Error("tabulka: " + r.status);
  return (await r.json()).value || [];
}
const vlozit = (ent) => fetch(turl(""), { method: "POST", headers: { ...J, Prefer: "return-no-content" }, body: JSON.stringify(ent) });
const smazat = (ucet) => fetch(turl(`(PartitionKey='u',RowKey='${ucet}')`), { method: "DELETE", headers: { ...J, "If-Match": "*" } });

const odpoved = (status, body) => ({ status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) });
const udaje = (ucet) => {
  const u = ucty()[ucet], sp = process.env.SP_HOST || "";
  const app = process.env.CLI_APP_ID, ten = process.env.CLI_TENANT;
  const cli = app && ten ? { appId: app, tenant: ten, prikaz: `m365 login --authType deviceCode --appId ${app} --tenant ${ten}` } : null;
  return { ucet, upn: u.upn, heslo: u.heslo, weby: sp ? ["dev", "test", "prod"].map((p) => `${sp}/sites/${ucet}-${p}`) : [], cli };
};

module.exports = async function (context, req) {
  try {
    context.res = await obsluz(req);
  } catch (e) {
    context.log.error(e);
    context.res = odpoved(500, { chyba: "Chyba serveru, zkuste to znovu." });
  }
};

async function obsluz(req) {
  const akce = req.params.akce;
  const b = req.body || {};
  if (akce === "prihlasit") {
    if (!stejne(b.heslo || "", env("SPOLECNE_HESLO"))) { await pauza(1000); return odpoved(401, { chyba: "Špatné heslo." }); }
    return odpoved(200, { sezeni: noveSezeni() });
  }
  if (akce === "admin-uvolnit") {
    if (!stejne(b.admin || "", env("ADMIN_HESLO"))) { await pauza(1000); return odpoved(401, { chyba: "Špatné admin heslo." }); }
    if (!ucty()[b.ucet]) return odpoved(400, { chyba: "Neznámý účet." });
    const r = await smazat(b.ucet);
    return odpoved(r.ok || r.status === 404 ? 200 : 502, { uvolneno: b.ucet });
  }
  if (!platneSezeni(req.headers["x-vydej-sezeni"])) return odpoved(401, { chyba: "Přihlaste se heslem." });

  if (akce === "seznam") {
    const rez = Object.fromEntries((await vsechnyRezervace()).map((x) => [x.RowKey, x]));
    return odpoved(200, { ucty: Object.keys(ucty()).sort().map((ucet) => ({
      ucet, upn: ucty()[ucet].upn, rezervovano: !!rez[ucet], jmeno: rez[ucet]?.jmeno || "", cas: rez[ucet]?.cas || "" })) });
  }
  if (akce === "beru") {
    const ucet = String(b.ucet || ""), jmeno = String(b.jmeno || "").trim().slice(0, 60);
    if (!ucty()[ucet]) return odpoved(400, { chyba: "Neznámý účet." });
    if (!jmeno) return odpoved(400, { chyba: "Napište své jméno." });
    // jeden účet na prohlížeč: kdo pošle token platné rezervace, další nedostane, dokud ji nevrátí
    if (b.token) {
      const th = hash(String(b.token));
      const drzi = (await vsechnyRezervace()).find((x) => x.tokenHash === th);
      if (drzi) return odpoved(409, { chyba: `Už máte účet ${drzi.RowKey}, nejdřív ho vraťte.`, mam: drzi.RowKey });
    }
    const token = crypto.randomBytes(24).toString("base64url");
    const r = await vlozit({ PartitionKey: "u", RowKey: ucet, jmeno, cas: new Date().toISOString(), tokenHash: hash(token) });
    if (r.status === 409) return odpoved(409, { chyba: "Tenhle účet si právě vzal někdo jiný. Vyberte jiný." });
    if (!r.ok) throw new Error("vložení: " + r.status);
    return odpoved(200, { ...udaje(ucet), token, jmeno });
  }
  if (akce === "muj" || akce === "vracim") {
    const th = hash(String(b.token || ""));
    const moje = (await vsechnyRezervace()).find((x) => x.tokenHash === th);
    if (!moje) return odpoved(404, { chyba: "Rezervace nenalezena (možná ji uvolnil organizátor)." });
    if (akce === "muj") return odpoved(200, { ...udaje(moje.RowKey), token: b.token, jmeno: moje.jmeno });
    await smazat(moje.RowKey);
    return odpoved(200, { vraceno: moje.RowKey });
  }
  return odpoved(404, { chyba: "Neznámá akce." });
}
