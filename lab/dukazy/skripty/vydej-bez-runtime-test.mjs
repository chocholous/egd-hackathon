import fs from "fs"; import { createRequire } from "module";
const req = createRequire("/opt/homebrew/lib/node_modules/@playwright/cli/package.json");
const { chromium } = req("playwright-core");
const sec = JSON.parse(fs.readFileSync(process.env.HOME + "/Projects/egd-workshop/lab/ucastnici.secrets.json","utf8"));
const b = await chromium.launch({ channel: "chrome", headless: true });
// 1) publikovaný odkaz bez přihlášení
let p = await (await b.newContext()).newPage();
await p.goto("https://claude.ai/artifact/A1rabZHmzw2xYZ3iEcrvb7"); await p.waitForTimeout(8000);
console.log("anonym odkaz:", p.url().split("?")[0], "|", (await p.evaluate(() => document.body.innerText)).replace(/\s+/g," ").slice(0,160));
// 2) stránka bez runtime claude.ai (jako host bez db/user)
p = await (await b.newContext()).newPage();
await p.goto("file://" + process.env.HOME + "/Projects/egd-workshop/lab/vydej/vydej-uctu.html"); await p.waitForTimeout(1500);
const r = {};
r.karet = await p.locator("article.card").count();
r.spravce_skryty = await p.locator("#adminbox").isHidden();
await p.locator('article[aria-label="Účet 02"] button', { hasText: "Beru si tenhle" }).click();
await p.fill("#kod-egd02", "ZZZZ-ZZZZ"); await p.click('article[aria-label="Účet 02"] button[type=submit]'); await p.waitForTimeout(1500);
r.spatny_kod_chyba = await p.locator('article[aria-label="Účet 02"] .err').isVisible();
await p.fill("#kod-egd02", sec.kody.egd02.toLowerCase()); await p.click('article[aria-label="Účet 02"] button[type=submit]'); await p.waitForTimeout(2500);
const codes = await p.locator('article[aria-label="Účet 02"] .field code').allTextContents();
r.jmeno_ok = codes[0] === "egd02@pavelchocholousgmail.onmicrosoft.com";
r.heslo_ok = codes[1] === sec.hesla["egd02@pavelchocholousgmail.onmicrosoft.com"];
r.odkazy_webu = await p.locator('article[aria-label="Účet 02"] .sites a').count();
r.heslo_jinde_na_strance = (await p.evaluate(() => document.body.innerText)).split(codes[1] || "@@@").length - 1;
console.log("stránka bez runtime:", JSON.stringify(r));
await b.close();
