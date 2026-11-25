#!/usr/bin/env node
// Jednorázové ruční přihlášení do labu + opakované použití uložené relace (heslo nezadává agent).
// Použití:
//   tools/pa-browser-session.mjs login [--ucet tomas.prochazka]   otevře okno Chrome na make.powerautomate.com; ty se PŘIHLÁSÍŠ,
//                                                                 skript počká na přihlášení a uloží relaci (storageState)
//   tools/pa-browser-session.mjs check [--ucet …]                 ověří, že uložená relace ještě platí
//   tools/pa-browser-session.mjs repair [--ucet …] [--headed]     z uložené relace otevře Data → Připojení a klikne „Opravit“ / přihlásí
//                                                                 OAuth připojení egd-sonda-* (jen kliky, bez hesla; SSO z relace)
// Relace: ${EGD_LAB_AUTH_DIR:-~/.config/egd-lab-auth}/<ucet>.json (mimo repo, práva 600; v gitu nikdy). Potřebuje Google Chrome a
// globální @playwright/cli (playwright-core). Prostředí: EGD_PA_ENV (výchozí Default-<tenantId> z `az account show`).
import fs from "fs"; import os from "os"; import path from "path"; import { execFileSync } from "child_process"; import { createRequire } from "module";
const args = process.argv.slice(2); const cmd = args[0];
if (!cmd || args.includes("--help") || args.includes("-h")) { console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1, 11).join("\n").replace(/^\/\/ ?/gm, "")); process.exit(0); }
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const ucet = opt("--ucet", process.env.PA_USER || "tomas.prochazka");
const dom = process.env.PA_DOMAIN || "pavelchocholousgmail.onmicrosoft.com";
const dir = process.env.EGD_LAB_AUTH_DIR || path.join(os.homedir(), ".config/egd-lab-auth"); fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
const state = path.join(dir, `${ucet}.json`);
const tid = execFileSync("az", ["account", "show", "--query", "tenantId", "-o", "tsv"]).toString().trim();
const env = process.env.EGD_PA_ENV || `Default-${tid}`;
const { chromium } = createRequire("/opt/homebrew/lib/node_modules/@playwright/cli/package.json")("playwright-core");
const url = `https://make.powerautomate.com/environments/${env}/connections`;
if (cmd === "login") {
  const b = await chromium.launch({ channel: "chrome", headless: false }); const c = await b.newContext(); const p = await c.newPage();
  await p.goto(url); console.log(`Přihlas se v otevřeném okně jako ${ucet}@${dom}. Čekám (max 10 min) na stránku Připojení…`);
  await p.waitForURL(/make\.powerautomate\.com\/environments\/.*\/connections/, { timeout: 600000 });
  await p.waitForTimeout(4000); await c.storageState({ path: state }); fs.chmodSync(state, 0o600); console.log("relace uložena:", state); await b.close();
} else {
  if (!fs.existsSync(state)) { console.error(`chybí relace ${state}; spusť nejdřív: login`); process.exit(2); }
  const b = await chromium.launch({ channel: "chrome", headless: !args.includes("--headed") }); const c = await b.newContext({ storageState: state }); const p = await c.newPage();
  await p.goto(url); await p.waitForTimeout(6000);
  if (/login\.microsoftonline\.com/.test(p.url())) { console.error("relace vypršela; spusť znovu: login"); await b.close(); process.exit(3); }
  if (cmd === "check") { console.log("relace platí:", p.url()); }
  else if (cmd === "repair") {
    const rows = await p.locator("text=/Reconnect|Opravit/").allInnerTexts(); console.log("připojení k opravě na stránce:", rows.length);
    const fix = p.locator("text=/^(Reconnect|Opravit|Fix connection)$/");
    for (let i = 0, n = await fix.count(); i < n; i++) {
      const [pop] = await Promise.all([c.waitForEvent("page", { timeout: 15000 }).catch(() => null), fix.first().click()]);
      if (pop) { await pop.waitForLoadState(); const acc = pop.locator(`text=${ucet}`).first(); await acc.waitFor({ timeout: 15000 }).catch(() => {}); await acc.click().catch(() => {}); await pop.waitForEvent("close", { timeout: 30000 }).catch(() => {}); }
      await p.waitForTimeout(3000);
    }
    await p.screenshot({ path: path.join(dir, "repair-po.png") }); console.log("hotovo, ověř: tools/pa-connection.py list");
  } else { console.error("neznámý příkaz"); process.exit(1); }
  await b.close();
}
