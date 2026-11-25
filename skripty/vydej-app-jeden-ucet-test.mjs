#!/usr/bin/env node
// Test „jeden účet na prohlížeč“ ve výdejní appce: druhá rezervace ze stejného prohlížeče odmítnuta (UI, druhá karta i API
// s tokenem), po „Vracím účet“ a po uvolnění organizátorem jde rezervovat znovu, reload ukáže můj účet, jiné anonymní
// okno rezervovat může, mobil. Hesla nevypisuje. Na konci uvolní, co rezervoval.
// Použití: node skripty/vydej-app-jeden-ucet-test.mjs <URL appky> <výstupní složka>
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const [URL_APP, OUT] = process.argv.slice(2);
if (!URL_APP || !OUT) { console.log("Použití: node skripty/vydej-app-jeden-ucet-test.mjs <URL> <složka>"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const sec = JSON.parse(fs.readFileSync(path.join(ROOT, "lab/ucastnici.secrets.json"), "utf8")).vydej;
const req = createRequire("/opt/homebrew/lib/node_modules/@playwright/cli/package.json");
const { chromium, devices } = req("playwright-core");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const vysl = {};
const ok = (k, v) => { vysl[k] = v; console.log(k.padEnd(40), JSON.stringify(v)); };
const maskuj = (p) => p.evaluate(() => { const e = document.getElementById("m-heslo"); if (e) e.textContent = "••••••••"; });
const api = (p, akce, body) => p.evaluate(async ({ akce, body }) => {
  const r = await fetch("/api/vydej/" + akce, { method: "POST", headers: { "Content-Type": "application/json", "X-Vydej-Sezeni": localStorage.getItem("vydej-sezeni") || "" }, body: JSON.stringify(body) });
  const d = await r.json(); delete d.heslo; delete d.token; return { status: r.status, ...d };
}, { akce, body });
const admin = (ucet) => fetch(URL_APP + "/api/vydej/admin-uvolnit", { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ admin: sec.admin_heslo, ucet }) }).then((r) => r.status);

async function okno(opts = {}) { const ctx = await browser.newContext(opts); const p = await ctx.newPage(); await p.goto(URL_APP); return { ctx, p }; }
async function prihlas(p) { await p.fill("#heslo", sec.spolecne_heslo); await p.click("#f-heslo button"); }
async function vezmi(p, ucet, jmeno) {
  await p.waitForSelector(`button[data-ucet="${ucet}"]`); await p.fill("#jmeno", jmeno); await p.click(`button[data-ucet="${ucet}"]`);
  await p.waitForSelector("#muj:not([hidden])"); return p.textContent("#m-ucet");
}
const viditelnaBeru = (p) => p.locator('button[data-ucet]:visible').count();
try {
  const a = await okno(); await prihlas(a.p);
  ok("A_rezervace_egd07", await vezmi(a.p, "egd07", "Test Alice"));
  ok("A_seznam_skryty_beru_viditelnych", { seznam_skryty: await a.p.isHidden("#vyber"), beru: await viditelnaBeru(a.p) });

  // druhá karta stejného prohlížeče (sdílí localStorage) rovnou ukáže můj účet
  const a2 = await a.ctx.newPage(); await a2.goto(URL_APP); await a2.waitForSelector("#muj:not([hidden])");
  ok("A_druha_karta_ukaze_muj", { ucet: await a2.textContent("#m-ucet"), beru: await viditelnaBeru(a2) });

  // API obchvat: beru s tokenem platné rezervace
  const token = await a.p.evaluate(() => localStorage.getItem("vydej-token"));
  ok("A_api_beru_s_tokenem", await api(a.p, "beru", { ucet: "egd06", jmeno: "Test Alice", token }));

  // karta otevřená na seznamu před rezervací: klik na jiný účet → server odmítne, karta přepne na můj účet
  const a3 = await a.ctx.newPage(); await a3.goto(URL_APP);
  await a3.evaluate(() => { localStorage.removeItem("vydej-token"); }); // simulace staré karty: seznam se načte bez tokenu
  await a3.reload(); await a3.waitForSelector('button[data-ucet="egd06"]');
  await a3.evaluate((t) => localStorage.setItem("vydej-token", t), token); // mezitím jiná karta rezervovala
  await a3.fill("#jmeno", "Test Alice"); await a3.click('button[data-ucet="egd06"]'); await a3.waitForSelector("#muj:not([hidden])");
  ok("A_stara_karta_klik_odmitnut_ukaze_muj", await a3.textContent("#m-ucet"));
  await a2.close(); await a3.close();

  // reload ukáže můj účet
  await a.p.reload(); await a.p.waitForSelector("#muj:not([hidden])");
  ok("A_reload_ukaze_muj", await a.p.textContent("#m-ucet"));
  await maskuj(a.p); await a.p.screenshot({ path: `${OUT}/6-mam-ucet.png`, fullPage: true });

  // jiné anonymní okno může rezervovat
  const b = await okno(); await prihlas(b.p);
  ok("B_jine_okno_rezervace_egd06", await vezmi(b.p, "egd06", "Test Bob"));

  // po „Vracím účet“ jde znovu
  await a.p.click("#b-vracim"); await a.p.waitForSelector('button[data-ucet="egd07"]');
  ok("A_po_vracim_token_smazan", (await a.p.evaluate(() => localStorage.getItem("vydej-token"))) === null);
  ok("A_po_vracim_nova_rezervace_egd05", await vezmi(a.p, "egd05", "Test Alice"));

  // po uvolnění organizátorem jde znovu
  ok("admin_uvolnil_egd05", await admin("egd05"));
  await a.p.reload(); await a.p.waitForSelector('button[data-ucet="egd05"]');
  ok("A_po_admin_token_smazan", (await a.p.evaluate(() => localStorage.getItem("vydej-token"))) === null);
  ok("A_po_admin_nova_rezervace_egd04", await vezmi(a.p, "egd04", "Test Alice"));

  // mobil: rezervace, druhá rezervace přes API odmítnuta, reload ukáže účet, bez přetékání
  const m = await okno({ ...devices["iPhone 13"] }); await prihlas(m.p);
  ok("M_rezervace_egd03", await vezmi(m.p, "egd03", "Test Mobil"));
  const mt = await m.p.evaluate(() => localStorage.getItem("vydej-token"));
  ok("M_api_beru_s_tokenem", await api(m.p, "beru", { ucet: "egd02", jmeno: "Test Mobil", token: mt }));
  await m.p.reload(); await m.p.waitForSelector("#muj:not([hidden])");
  ok("M_reload_ukaze_muj", { ucet: await m.p.textContent("#m-ucet"), beru: await viditelnaBeru(m.p),
    bez_posunu: await m.p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth) });
  await maskuj(m.p); await m.p.screenshot({ path: `${OUT}/7-mobil-mam-ucet.png`, fullPage: true });

  // prohlížeč bez localStorage (vyhazuje chybu): funguje jako dřív
  const z = await okno(); await z.ctx.addInitScript(() => { Object.defineProperty(window, "localStorage", { get() { throw new Error("blokováno"); } }); });
  await z.p.reload(); await prihlas(z.p);
  ok("Z_bez_localStorage_rezervace_egd02", await vezmi(z.p, "egd02", "Test Bez uloziste"));
  await z.ctx.close(); await m.ctx.close(); await b.ctx.close(); await a.ctx.close();
} catch (e) {
  ok("CHYBA", String(e).slice(0, 400));
} finally {
  for (const u of ["egd02", "egd03", "egd04", "egd05", "egd06", "egd07"]) await admin(u);
  await browser.close();
  fs.writeFileSync(`${OUT}/vysledek-jeden-ucet.json`, JSON.stringify(vysl, null, 2));
}
