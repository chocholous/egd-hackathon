#!/usr/bin/env node
// Projde pod účastníkem klikací cestu nasazení .sppkg v UI: /AppCatalog → Nahrát → soubor → OK → Nasadit,
// pak přes REST vypíše stav katalogu. Screenshoty ukládá do <výstupní složka>/ui-<účet>-N.png. Heslo nevypisuje.
// Použití: tools/lab-ucty-ui-nasazeni.mjs <účet, např. egd05> <výstupní složka> <cesta.sppkg>
// Návratový kód 3 = přihlášení nedošlo na web (opakovat; výpis ukáže, kde se zaseklo).
if (process.argv.includes("--help") || process.argv.length < 5) { console.log((await import("fs")).readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1, 5).join("\n").replace(/^\/\/ ?/gm, "")); process.exit(0); }
import fs from "fs"; import { createRequire } from "module";
const req = createRequire("/opt/homebrew/lib/node_modules/@playwright/cli/package.json");
const { chromium } = req("playwright-core");
const [ucet, out, pkg] = process.argv.slice(2);
const upn = `${ucet}@pavelchocholousgmail.onmicrosoft.com`;
const heslo = JSON.parse(fs.readFileSync(process.env.HOME + "/Projects/egd-workshop/lab/ucastnici.secrets.json","utf8")).hesla[upn];
const dev = `https://pavelchocholousgmail.sharepoint.com/sites/${ucet}-dev`;
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await (await b.newContext({ viewport: { width: 1400, height: 900 }, locale: "cs-CZ" })).newPage();
const shot = (n) => p.screenshot({ path: `${out}/ui-${ucet}-${n}.png` });
const texty = async () => { const all = []; for (const f of p.frames()) all.push(...await f.evaluate(() => [...document.querySelectorAll("button,input[type=button],input[type=submit],a.ms-Button,[role=button]")].filter(e=>e.offsetParent).map(e=>(e.innerText||e.value||"").trim()).filter(Boolean)).catch(()=>[])); return all; };
await p.goto(dev + "/AppCatalog");
await p.fill('input[type="email"]', upn); await p.click('input[type="submit"]');
await p.waitForSelector('input[type="password"]'); await p.fill('input[type="password"]', heslo); await p.click('input[type="submit"]');
for (let i = 0; i < 10 && !p.url().startsWith(dev); i++) { await p.waitForTimeout(3000); if (await p.$("#idBtn_Back")) await p.click("#idBtn_Back"); if (/keep your account secure/i.test(await p.evaluate(()=>document.body.innerText).catch(()=>""))) { console.log("MFA_REGISTRACE"); await b.close(); process.exit(3);} }
await p.waitForTimeout(6000);
await p.waitForURL(u => u.href.startsWith(dev), { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(4000);
console.log("1 katalog:", p.url().split("?")[0]);
if (!p.url().startsWith(dev)) { console.log("NEPRIHLASEN:", (await p.evaluate(()=>document.body.innerText)).replace(/\s+/g," ").slice(0,200)); await b.close(); process.exit(3); }
await p.click('text=Nahrát'); await p.waitForTimeout(4000);
let nahrano = false;
for (const f of p.frames()) { const inp = await f.$('input[type=file]'); if (inp) { await inp.setInputFiles(pkg); await p.waitForTimeout(500); await f.click('input[value="OK"], button:has-text("OK")'); nahrano = true; break; } }
console.log("2 soubor vybrán a OK:", nahrano);
await p.waitForTimeout(12000); await shot("3-duvera");
console.log("3 tlačítka po nahrání:", JSON.stringify(await texty()));
let klik = null;
for (const f of p.frames()) for (const sel of ['button:has-text("Nasadit")','input[value="Nasadit"]','button:has-text("Povolit")','button:has-text("Deploy")','button:has-text("Enable")']) { if (!klik && await f.$(sel)) { await f.click(sel); klik = sel; } }
console.log("4 kliknuto:", klik);
await p.waitForTimeout(10000); await shot("4-po-nasazeni");
const r = await p.evaluate(async (dev) => { const a = await (await fetch(dev + "/_api/web/sitecollectionappcatalog/AvailableApps", { headers: { Accept: "application/json;odata=nometadata" } })).json(); return a.value.map(x => ({ t: x.Title, nasazena: x.Deployed, verze: x.AppCatalogVersion })); }, dev);
console.log("5 katalog po UI:", JSON.stringify(r));
await b.close();
