#!/usr/bin/env node
// Ověří pod účastnickým účtem (výchozí egd01): přihlášení, nahrání a nasazení .sppkg do site app catalogu
// vlastního DEV webu a že cizí weby (egd02-dev, tenant app catalog) nevidí. Nic nevypisuje z hesel.
// Použití: tools/lab-ucty-overeni.mjs [--ucet egd01] [--cizi egd02] [--sppkg cesta.sppkg] [--prava-url <web>] [--jen-prihlaseni] [--headed]
// Potřebuje: globální @playwright/cli (playwright-core) a nainstalovaný Google Chrome; hesla v lab/ucastnici.secrets.json.
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 5).join("\n").replace(/^\/\/ ?/gm, ""));
  process.exit(0);
}
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SP = process.env.EGD_LAB_SP_HOST || "https://pavelchocholousgmail.sharepoint.com";
const DOMENA = process.env.EGD_LAB_DOMENA || "pavelchocholousgmail.onmicrosoft.com";
const ucet = opt("--ucet", "egd01"), cizi = opt("--cizi", "egd02");
const sppkg = opt("--sppkg", path.join(process.env.HOME, "Projects/egd-vibecoding/eon-demo-kalkulacka/sharepoint/solution/eon-demo-kalkulacka.sppkg"));
const upn = `${ucet}@${DOMENA}`;
const heslo = JSON.parse(fs.readFileSync(path.join(ROOT, "lab/ucastnici.secrets.json"), "utf8")).hesla[upn];
if (!heslo) throw new Error("chybí heslo pro " + upn);

const req = createRequire("/opt/homebrew/lib/node_modules/@playwright/cli/package.json");
const { chromium } = req("playwright-core");
const browser = await chromium.launch({ channel: "chrome", headless: !args.includes("--headed") });
const ctx = await browser.newContext(); // izolovaný profil, žádné cizí cookies
const page = await ctx.newPage();
const vysledek = {};
try {
  await page.goto(`${SP}/sites/${ucet}-dev`);
  await page.fill('input[type="email"]', upn); await page.click('input[type="submit"]');
  await page.waitForSelector('input[type="password"]', { timeout: 20000 });
  await page.fill('input[type="password"]', heslo); await page.click('input[type="submit"]');
  // „Zůstat přihlášeni?“ / „Stay signed in?“ nebo případná výzva k MFA
  await page.waitForLoadState("networkidle").catch(() => {});
  for (let i = 0; i < 30 && !page.url().startsWith(SP); i++) {
    const t = (await page.textContent("body").catch(() => "")) || "";
    if (/More information required|Další informace|Action required|Authenticator|keep your account secure/i.test(t)) { vysledek.mfa = "VYŽADOVÁNO"; break; }
    if (await page.$("#idBtn_Back")) await page.click("#idBtn_Back");
    await page.waitForTimeout(1500);
  }
  if (!vysledek.mfa) await page.waitForURL(u => u.href.startsWith(SP), { timeout: 30000 }).catch(() => {});
  await page.waitForLoadState("load").catch(() => {}); await page.waitForTimeout(3000);
  vysledek.prihlaseni = page.url().startsWith(SP) ? "OK" : "SELHALO: " + new URL(page.url()).host;
  if (vysledek.prihlaseni !== "OK") vysledek.text_stranky = ((await page.innerText("body").catch(() => "")) || "").replace(/\s+/g, " ").slice(0, 300);
  if (vysledek.prihlaseni === "OK" && !args.includes("--jen-prihlaseni")) {
    const b64 = fs.readFileSync(sppkg).toString("base64");
    Object.assign(vysledek, await page.evaluate(async ({ SP, ucet, cizi, b64, jmeno, extra }) => {
      const r = {};
      const dev = `${SP}/sites/${ucet}-dev`;
      const j = { Accept: "application/json;odata=nometadata" };
      const digest = (await (await fetch(dev + "/_api/contextinfo", { method: "POST", headers: j })).json()).FormDigestValue;
      const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const add = await fetch(`${dev}/_api/web/sitecollectionappcatalog/Add(overwrite=true,url='${jmeno}')`,
        { method: "POST", headers: { ...j, "X-RequestDigest": digest }, body: bin });
      r.nahrani = add.status;
      const apps = (await (await fetch(`${dev}/_api/web/sitecollectionappcatalog/AvailableApps`, { headers: j })).json()).value || [];
      r.aplikaci_v_katalogu = apps.length;
      // čerstvý web má v katalogu jen náš balíček; jinak vezmi naposledy změněný
      const posledni = apps.sort((x, y) => String(y.AppCatalogVersion && y.LastModifiedDateTime || "").localeCompare(String(x.LastModifiedDateTime || "")))[0];
      if (posledni) {
        const dep = await fetch(`${dev}/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${posledni.ID}')/Deploy`,
          { method: "POST", headers: { ...j, "Content-Type": "application/json;odata=nometadata", "X-RequestDigest": digest }, body: JSON.stringify({ skipFeatureDeployment: false }) });
        r.nasazeni = dep.status;
        const po = await (await fetch(`${dev}/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${posledni.ID}')`, { headers: j })).json();
        r.aplikace = { titulek: po.Title, nasazena: po.Deployed, verze: po.InstalledVersion || po.AppCatalogVersion };
      }
      r.cizi_web = (await fetch(`${SP}/sites/${cizi}-dev/_api/web?$select=Title`, { headers: j })).status;
      r.tenant_app_catalog = (await fetch(`${SP}/sites/apps/_api/web?$select=Title`, { headers: j })).status;
      r.koren_webu = (await fetch(`${SP}/_api/web?$select=Title`, { headers: j })).status;
      // smí zapisovat? (bit AddListItems = 0x2 v Low části EffectiveBasePermissions)
      const zapis = async (u) => { const x = await fetch(u + "/_api/web/EffectiveBasePermissions", { headers: j });
        if (!x.ok) return "bez přístupu"; const p = await x.json(); return (Number(p.Low) & 2) ? "MŮŽE zapisovat" : "jen čtení"; };
      r.prava_tenant_app_catalog = await zapis(`${SP}/sites/apps`);
      r.prava_koren = await zapis(SP);
      r.prava_vlastni_dev = await zapis(dev);
      r.prava_vlastni_test = await zapis(`${SP}/sites/${ucet}-test`);
      r.prava_vlastni_prod = await zapis(`${SP}/sites/${ucet}-prod`);
      if (extra) r.prava_extra = { url: extra, prava: await zapis(extra) };
      r.cizi_test_prod = [(await fetch(`${SP}/sites/${cizi}-test/_api/web`, { headers: j })).status, (await fetch(`${SP}/sites/${cizi}-prod/_api/web`, { headers: j })).status];
      const q = await (await fetch(`${SP}/_api/search/query?querytext='path:${SP}/sites/${cizi}-dev'&rowlimit=5`, { headers: j })).json().catch(() => null);
      r.hledani_cizi_vysledku = q?.PrimaryQueryResult?.RelevantResults?.TotalRows ?? "?";
      return r;
    }, { SP, ucet, cizi, b64, jmeno: path.basename(sppkg), extra: opt("--prava-url", "") }));
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify({ ucet, sppkg: path.basename(sppkg), ...vysledek }, null, 2));
