#!/usr/bin/env node
// Výdejní appka: po rezervaci volného účtu se ukáže blok CLI (appId, tenant, příkaz m365 login); po reloadu znovu; mobil
// bez vodorovného posunu. Hesla nevypisuje (snímky maskují heslo). Na konci účet uvolní.
// Použití: node skripty/vydej-app-cli-test.mjs <URL appky> <výstupní složka>
import fs from "fs"; import path from "path"; import { createRequire } from "module";
const [URL_APP, OUT] = process.argv.slice(2);
if (!URL_APP || !OUT) { console.log("Použití: node skripty/vydej-app-cli-test.mjs <URL> <složka>"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const sec = JSON.parse(fs.readFileSync(path.join(ROOT, "lab/ucastnici.secrets.json"), "utf8")).vydej;
const { chromium, devices } = createRequire("/opt/homebrew/lib/node_modules/@playwright/cli/package.json")("playwright-core");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const vysl = {}; const ok = (k, v) => { vysl[k] = v; console.log(k.padEnd(28), JSON.stringify(v)); };
const admin = (ucet) => fetch(URL_APP + "/api/vydej/admin-uvolnit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ admin: sec.admin_heslo, ucet }) }).then((r) => r.status);
const maskuj = (p) => p.evaluate(() => { document.getElementById("m-heslo").textContent = "••••••••"; });
const cli = (p) => p.evaluate(() => ({ viditelny: !document.getElementById("m-cli").hidden, appId: document.getElementById("m-appid").textContent,
  tenant: document.getElementById("m-tenant").textContent, prikaz: document.getElementById("m-prikaz").textContent }));
const vzate = [];
try {
  for (const [nazev, opts] of [["desktop", {}], ["mobil", devices["iPhone 13"]]]) {
    const ctx = await browser.newContext(opts); const p = await ctx.newPage(); await p.goto(URL_APP);
    await p.fill("#heslo", sec.spolecne_heslo); await p.click("#f-heslo button");
    const b = p.locator("button[data-ucet]").last(); await b.waitFor(); const ucet = await b.getAttribute("data-ucet");
    await p.fill("#jmeno", "Test CLI " + nazev); await b.click(); await p.waitForSelector("#muj:not([hidden])"); vzate.push(ucet);
    ok(`${nazev}_rezervace`, ucet); ok(`${nazev}_cli`, await cli(p));
    await p.reload(); await p.waitForSelector("#muj:not([hidden])"); ok(`${nazev}_cli_po_reloadu`, (await cli(p)).viditelny);
    ok(`${nazev}_bez_posunu`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await maskuj(p); await p.screenshot({ path: path.join(OUT, `8-cli-${nazev}.png`), fullPage: true });
    await ctx.close();
  }
} catch (e) { ok("CHYBA", String(e).slice(0, 300)); }
finally {
  for (const u of vzate) ok("uvolneno_" + u, await admin(u));
  await browser.close(); fs.writeFileSync(path.join(OUT, "vysledek-cli.json"), JSON.stringify(vysl, null, 2));
}
