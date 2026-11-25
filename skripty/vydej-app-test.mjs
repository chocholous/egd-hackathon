#!/usr/bin/env node
// Test výdejní web appky v labu: špatné heslo, souběžné „Beru tenhle“ dvou lidí na stejný účet (UI)
// i 10 souběžných API požadavků, anonymní okno, mobil (iPhone), vrácení účtu. Hesla nevypisuje, na snímcích je maskuje.
// Použití: node skripty/vydej-app-test.mjs <URL appky> <výstupní složka>   (po testu: tools/lab-vydej.py uvolnit-vse)
import fs from "fs";
import path from "path";
import { createRequire } from "module";
const [URL_APP, OUT] = process.argv.slice(2);
if (!URL_APP || !OUT) { console.log("Použití: node skripty/vydej-app-test.mjs <URL> <složka>"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const sec = JSON.parse(fs.readFileSync(path.join(ROOT, "lab/ucastnici.secrets.json"), "utf8"));
const HESLO = sec.vydej.spolecne_heslo;
const req = createRequire("/opt/homebrew/lib/node_modules/@playwright/cli/package.json");
const { chromium, devices } = req("playwright-core");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const vysl = {};
const ok = (k, v) => { vysl[k] = v; console.log(k.padEnd(34), JSON.stringify(v)); };
const maskuj = (p) => p.evaluate(() => { const e = document.getElementById("m-heslo"); if (e) e.textContent = "••••••••"; });

async function osoba(jmeno, opts = {}) {
  const ctx = await browser.newContext(opts); // každý = čisté anonymní okno, žádné cookies ani localStorage
  const p = await ctx.newPage();
  await p.goto(URL_APP);
  return { ctx, p, jmeno };
}
async function prihlas(o, heslo = HESLO) {
  await o.p.fill("#heslo", heslo); await o.p.click("#f-heslo button");
}
try {
  // 1) špatné heslo
  const x = await osoba("X");
  await prihlas(x, "spatne-heslo");
  await x.p.waitForSelector("#e-heslo:not([hidden])");
  ok("spatne_heslo_chyba", await x.p.textContent("#e-heslo"));
  ok("spatne_heslo_seznam_skryty", await x.p.isHidden("#vyber"));
  await x.p.screenshot({ path: `${OUT}/1-spatne-heslo.png` });
  await x.ctx.close();

  // 2) souběh v UI: Alice a Bob kliknou na egd10 ve stejný okamžik
  const a = await osoba("Test Alice"), b = await osoba("Test Bob");
  for (const o of [a, b]) { await prihlas(o); await o.p.waitForSelector('button[data-ucet="egd10"]'); await o.p.fill("#jmeno", o.jmeno); }
  await Promise.all([a.p.click('button[data-ucet="egd10"]'), b.p.click('button[data-ucet="egd10"]')]);
  await Promise.all([a, b].map((o) => o.p.waitForFunction(() => !document.getElementById("muj").hidden || !document.getElementById("e-vyber").hidden)));
  const stav = async (o) => (await o.p.isVisible("#muj")) ? { vyhral: true, ucet: await o.p.textContent("#m-ucet"),
    heslo_sedi: (await o.p.textContent("#m-heslo")) === sec.hesla[await o.p.textContent("#m-upn")] } : { vyhral: false, chyba: await o.p.textContent("#e-vyber") };
  const sa = await stav(a), sb = await stav(b);
  ok("soubeh_ui_alice", sa); ok("soubeh_ui_bob", sb);
  ok("soubeh_ui_prave_jeden_vitez", [sa, sb].filter((s) => s.vyhral).length === 1);
  const vitez = sa.vyhral ? a : b, porazeny = sa.vyhral ? b : a;
  await maskuj(vitez.p); await vitez.p.screenshot({ path: `${OUT}/2-vitez.png`, fullPage: true });
  await porazeny.p.waitForSelector("li:has-text('egd10') .rez");
  ok("porazeny_vidi_rezervaci", await porazeny.p.textContent("li:has-text('egd10') .rez"));
  await porazeny.p.screenshot({ path: `${OUT}/3-porazeny.png`, fullPage: true });

  // 3) API souběh: 10 požadavků na egd09 najednou
  const sez = await a.p.evaluate(() => localStorage.getItem("vydej-sezeni"));
  const kody = await a.p.evaluate(async (sez) => Promise.all(Array.from({ length: 10 }, (_, i) =>
    fetch("/api/vydej/beru", { method: "POST", headers: { "Content-Type": "application/json", "X-Vydej-Sezeni": sez },
      body: JSON.stringify({ ucet: "egd09", jmeno: "Burst " + i }) }).then((r) => r.status))), sez);
  ok("soubeh_api_10x_egd09", { "200": kody.filter((k) => k === 200).length, "409": kody.filter((k) => k === 409).length, jine: kody.filter((k) => k !== 200 && k !== 409) });

  // 4) obnovení stránky u vítěze vrátí jeho údaje (localStorage), nové anonymní okno je nevidí
  await vitez.p.reload(); await vitez.p.waitForSelector("#muj:not([hidden])");
  ok("vitez_po_reloadu_vidi_ucet", await vitez.p.textContent("#m-ucet"));
  const c = await osoba("Test Cyril"); await prihlas(c); await c.p.waitForSelector("li:has-text('egd10') .rez");
  const obsah = await c.p.content();
  ok("anonym_okno_hesla_v_html", Object.values(sec.hesla).filter((h) => obsah.includes(h)).length);
  ok("anonym_okno_egd10", await c.p.textContent("li:has-text('egd10') .rez"));
  await c.ctx.close();

  // 5) mobil (iPhone 13), anonymní kontext
  const m = await osoba("Test Mobil", { ...devices["iPhone 13"] }); await prihlas(m);
  await m.p.waitForSelector('button[data-ucet="egd01"]');
  ok("mobil_bez_vodorovneho_posunu", await m.p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await m.p.screenshot({ path: `${OUT}/4-mobil-seznam.png`, fullPage: true });
  await m.p.fill("#jmeno", m.jmeno); await m.p.click('button[data-ucet="egd08"]'); await m.p.waitForSelector("#muj:not([hidden])");
  ok("mobil_rezervace", await m.p.textContent("#m-ucet"));
  ok("mobil_bez_vodorovneho_posunu_ucet", await m.p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  // nic nesmí přetékat přes pravý okraj karty (odkazy na weby, UPN)
  ok("mobil_nic_nepretika_kartu", await m.p.evaluate(() => { const k = document.getElementById("muj").getBoundingClientRect().right;
    return [...document.querySelectorAll("#muj a, #muj dd span")].every((e) => [...e.getClientRects()].every((r) => r.right <= k + 0.5)); }));
  await maskuj(m.p); await m.p.screenshot({ path: `${OUT}/5-mobil-ucet.png`, fullPage: true });
  // 6) vrácení účtu
  await m.p.click("#b-vracim"); await m.p.waitForSelector('button[data-ucet="egd08"]');
  ok("mobil_vraceno_egd08_volne", true);
  await m.ctx.close(); await a.ctx.close(); await b.ctx.close();
} catch (e) {
  ok("CHYBA", String(e).slice(0, 300));
} finally {
  await browser.close();
  fs.writeFileSync(`${OUT}/vysledek.json`, JSON.stringify(vysl, null, 2));
}
