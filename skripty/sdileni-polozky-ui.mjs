#!/usr/bin/env node
// Díra 10 (4.3 E): smí běžný uživatel sdílet jednu položku seznamu „vidí jen své“ (ReadSecurity=2) tlačítkem Sdílet
// a vidí ji pak kolega? Běží nad přihlášenými profily prohlížeče (klony v <složka profilů>), heslo nezadává.
// Použití: node skripty/sdileni-polozky-ui.mjs <krok> <složka profilů> <výstupní složka>
//   setup    (vlastník egd05) seznam SdileniTest s ReadSecurity=2/WriteSecurity=2, eva+jakub do Členů, nastavení sdílení webu
//   polozka  (eva) založí položku přes REST, vypíše, co vidí eva a jakub
//   vidi     vypíše, co vidí eva a jakub (REST items + UI snímek jakuba)
//   sdilet   (eva) UI: seznam → vybrat položku → Sdílet → jakub → Odeslat (snímky)
//   prava    (vlastník) role assignments položky a sdílecí odkazy
// Prostředí: EGD_LAB_SP_HOST (výchozí https://pavelchocholousgmail.sharepoint.com), SDILENI_WEB (výchozí /sites/egd05-dev),
// SDILENI_SDILI / SDILENI_KOLEGA (profily, výchozí eva.vesela / jakub.kucera), SDILENI_VLASTNIK (egd05-sonda).
import fs from "fs"; import path from "path"; import { createRequire } from "module";
const [krok, PROF, OUT] = process.argv.slice(2);
if (!krok || !PROF || !OUT) { console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1, 12).join("\n").replace(/^\/\/ ?/gm, "")); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });
const SP = process.env.EGD_LAB_SP_HOST || "https://pavelchocholousgmail.sharepoint.com";
const WEB = SP + (process.env.SDILENI_WEB || "/sites/egd05-dev");
const DOM = "pavelchocholousgmail.onmicrosoft.com";
const SDILI = process.env.SDILENI_SDILI || "eva.vesela", KOLEGA = process.env.SDILENI_KOLEGA || "jakub.kucera", VLASTNIK = process.env.SDILENI_VLASTNIK || "egd05-sonda";
const LIST = "SdileniTest";
const { chromium } = createRequire(path.join(process.env.HOME, "Projects/egd-workshop/sondy/dokumenty/"))("playwright-core");
const log = (k, v) => { const r = { cas: new Date().toISOString(), krok, k, v }; fs.appendFileSync(path.join(OUT, "sdileni.jsonl"), JSON.stringify(r) + "\n"); console.log(k.padEnd(32), JSON.stringify(v)); };

async function otevri(profil, headless = true) {
  const ctx = await chromium.launchPersistentContext(path.join(PROF, profil), { executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless, viewport: { width: 1400, height: 900 }, locale: "cs-CZ" });
  const p = ctx.pages()[0] ?? await ctx.newPage();
  await p.goto(WEB + "/", { waitUntil: "domcontentloaded" }); await p.waitForTimeout(3000);
  return { ctx, p };
}
// REST ze stránky (cookies), s digestem pro zápisy
const rest = (p, metoda, url, body) => p.evaluate(async ({ WEB, metoda, url, body }) => {
  const H = { Accept: "application/json;odata=nometadata", "Content-Type": "application/json;odata=nometadata" };
  if (metoda !== "GET") { const d = await fetch(WEB + "/_api/contextinfo", { method: "POST", headers: H }).then((r) => r.json()); H["X-RequestDigest"] = d.FormDigestValue; }
  if (metoda === "MERGE") { H["X-HTTP-Method"] = "MERGE"; H["IF-MATCH"] = "*"; }
  const r = await fetch(WEB + "/_api/" + url, { method: metoda === "GET" ? "GET" : "POST", headers: H, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = t.slice(0, 300); }
  return { status: r.status, j };
}, { WEB, metoda, url, body });
const kdo = async (p) => (await rest(p, "GET", "web/currentuser?$select=LoginName,IsSiteAdmin")).j;
const polozky = async (p) => { const r = await rest(p, "GET", `web/lists/getbytitle('${LIST}')/items?$select=Id,Title,AuthorId`); return { status: r.status, polozky: r.j.value || r.j }; };

if (krok === "setup") {
  const { ctx, p } = await otevri(VLASTNIK);
  log("vlastnik", await kdo(p));
  let r = await rest(p, "GET", `web/lists/getbytitle('${LIST}')?$select=Id`);
  if (r.status === 404) r = await rest(p, "POST", "web/lists", { Title: LIST, BaseTemplate: 100 });
  log("seznam", r.status);
  log("readsecurity", (await rest(p, "MERGE", `web/lists/getbytitle('${LIST}')`, { ReadSecurity: 2, WriteSecurity: 2 })).status);
  log("seznam_stav", (await rest(p, "GET", `web/lists/getbytitle('${LIST}')?$select=ReadSecurity,WriteSecurity,HasUniqueRoleAssignments`)).j);
  const clenove = (await rest(p, "GET", "web/AssociatedMemberGroup?$select=Id,Title")).j;
  log("skupina_clenu", clenove);
  for (const u of [SDILI, KOLEGA]) log("pridat_" + u, (await rest(p, "POST", `web/sitegroups(${clenove.Id})/users`, { LoginName: `i:0#.f|membership|${u}@${DOM}` })).status);
  log("web_sdileni", (await rest(p, "GET", "web?$select=MembersCanShare,RequestAccessEmail,ShareByEmailEnabled")).j);
  log("site_sdileni", (await rest(p, "GET", "site?$select=ShareByEmailEnabled,ShareByLinkEnabled,DisableCompanyWideSharingLinks")).j);
  await ctx.close();
}
if (krok === "polozka") {
  const a = await otevri(SDILI); log("sdili", await kdo(a.p));
  log("nova_polozka", (await rest(a.p, "POST", `web/lists/getbytitle('${LIST}')/items`, { Title: "Žádost Evy " + new Date().toISOString().slice(0, 16) })).j);
  log("vidi_" + SDILI, await polozky(a.p)); await a.ctx.close();
  const b = await otevri(KOLEGA); log("vidi_" + KOLEGA, await polozky(b.p)); await b.ctx.close();
}
if (krok === "vidi") {
  for (const u of [SDILI, KOLEGA]) {
    const x = await otevri(u); log("vidi_" + u, await polozky(x.p));
    await x.p.goto(`${WEB}/Lists/${LIST}/AllItems.aspx`, { waitUntil: "domcontentloaded" }); await x.p.waitForTimeout(6000);
    await x.p.screenshot({ path: path.join(OUT, `vidi-${u}-${Date.now()}.png`) }); await x.ctx.close();
  }
}
if (krok === "primo") { // kolega: přímý přístup k položce 1 (REST podle ID, DispForm, oprávnění na položce)
  const { ctx, p } = await otevri(KOLEGA);
  log("primo_rest_items1", await rest(p, "GET", `web/lists/getbytitle('${LIST}')/items(1)?$select=Id,Title`));
  log("primo_prava_polozky", (await rest(p, "GET", `web/lists/getbytitle('${LIST}')/items(1)/EffectiveBasePermissions`)).j);
  log("primo_caml", await rest(p, "POST", `web/lists/getbytitle('${LIST}')/GetItems`, { query: { ViewXml: "<View Scope='RecursiveAll'><Query><Where><Eq><FieldRef Name='ID'/><Value Type='Counter'>1</Value></Eq></Where></Query></View>" } }));
  await p.goto(`${WEB}/Lists/${LIST}/DispForm.aspx?ID=1`, { waitUntil: "domcontentloaded" }); await p.waitForTimeout(7000);
  log("primo_dispform_text", (await p.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 300));
  await p.screenshot({ path: path.join(OUT, "7-jakub-dispform.png") });
  await ctx.close();
}
if (krok === "uklid") { // (vlastník) seznam do koše webu (vratné), sdílejícího a kolegu ze Členů
  const { ctx, p } = await otevri(VLASTNIK);
  log("seznam_do_kose", (await rest(p, "POST", `web/lists/getbytitle('${LIST}')/recycle()`)).status);
  const g = (await rest(p, "GET", "web/AssociatedMemberGroup?$select=Id")).j.Id;
  for (const u of [SDILI, KOLEGA]) log("odebrat_" + u, (await rest(p, "POST", `web/sitegroups(${g})/users/removeByLoginName(@v)?@v='${encodeURIComponent(`i:0#.f|membership|${u}@${DOM}`)}'`)).status);
  log("clenove_po", ((await rest(p, "GET", `web/sitegroups(${g})/users?$select=LoginName`)).j.value || []).map((x) => x.LoginName));
  await ctx.close();
}
if (krok === "prava") {
  const { ctx, p } = await otevri(VLASTNIK);
  const it = (await rest(p, "GET", `web/lists/getbytitle('${LIST}')/items?$select=Id,Title,HasUniqueRoleAssignments`)).j.value || [];
  for (const i of it) {
    log("polozka_" + i.Id, { Title: i.Title, unikatni: i.HasUniqueRoleAssignments });
    const ra = await rest(p, "GET", `web/lists/getbytitle('${LIST}')/items(${i.Id})/roleassignments?$expand=Member,RoleDefinitionBindings&$select=Member/Title,Member/LoginName,RoleDefinitionBindings/Name`);
    log("role_" + i.Id, (ra.j.value || ra.j));
  }
  await ctx.close();
}
if (krok === "sdilet") {
  const headed = !!process.env.SDILENI_HEADED;
  const { ctx, p } = await otevri(SDILI, !headed);
  await p.goto(`${WEB}/Lists/${LIST}/AllItems.aspx`, { waitUntil: "domcontentloaded" }); await p.waitForTimeout(7000);
  await p.screenshot({ path: path.join(OUT, "1-eva-seznam.png") });
  // výběr první položky (kruh vlevo od řádku)
  // nové UI seznamů: výběr kliknutím na úchyt vlevo od řádku (role=row tu není)
  const nadpis = p.getByText("Žádost Evy").first(); const bb = await nadpis.boundingBox();
  await p.mouse.move(bb.x + 5, bb.y + bb.height / 2); await p.mouse.click(bb.x - 48, bb.y + bb.height / 2); await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(OUT, "2-eva-vybrano.png") });
  const tlac = p.locator('button[name="Sdílet"], button[name="Share"], [data-automationid="shareCommand"], button:has-text("Sdílet")').first();
  log("tlacitko_sdilet_viditelne", await tlac.isVisible().catch(() => false));
  await tlac.click(); await p.waitForTimeout(6000);
  await p.screenshot({ path: path.join(OUT, "3-eva-dialog.png") });
  // dialog sdílení je v iframe
  const fr = p.frames().find((f) => /sharing|shareWidget|odsp|_layouts\/15\/sharedialog/i.test(f.url())) || p.mainFrame();
  log("dialog_frame", fr.url().slice(0, 120));
  const vstup = fr.locator('input[aria-label*="jméno"], input[aria-label*="name"], input[placeholder*="jméno"], input[placeholder*="name"], input[role="combobox"]').first();
  await vstup.click(); await vstup.fill(KOLEGA.split(".")[0] === "jakub" ? "Jakub" : KOLEGA); await p.waitForTimeout(4000);
  await p.screenshot({ path: path.join(OUT, "4-eva-hledani.png") });
  const navrh = fr.locator(`[role="option"]:has-text("${KOLEGA}"), [role="option"]:has-text("Jakub"), button:has-text("Jakub")`).first();
  log("navrh_kolegy", await navrh.textContent().catch((e) => "chyba " + e.message.slice(0, 100)));
  await navrh.click(); await p.waitForTimeout(2000);
  await p.screenshot({ path: path.join(OUT, "5-eva-vybran-kolega.png") });
  const odeslat = fr.locator('button:has-text("Poslat"), button:has-text("Odeslat"), button:has-text("Send")').first();
  await odeslat.click(); await p.waitForTimeout(6000);
  await p.screenshot({ path: path.join(OUT, "6-eva-po-odeslani.png") });
  log("po_odeslani_text", (await fr.locator("body").innerText().catch(() => "")).slice(0, 400));
  await ctx.close();
}
