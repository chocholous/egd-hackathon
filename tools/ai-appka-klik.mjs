#!/usr/bin/env node
// Odklikne AI tlačítka v první appce (Evidence požadavků + skill egd-llm-gateway) pod uloženým Chrome profilem lab uživatele:
// napíše Popis → „Shrnout popis“, vybere soubor → „Přečíst soubor (OCR)“, zaznamená volání na gateway (stav, hlavičky bez hodnot tokenu)
// a uloží screenshoty. Volitelně zkusí stejné volání z cizího originu (https://example.com) → očekávané „Failed to fetch“ (CORS).
// Jen čte a kliká; nic neukládá do seznamu (formulář se neodesílá).
import { createRequire } from 'node:module'; import path from 'node:path'; import fs from 'node:fs';

const args = process.argv.slice(2);
if (!args.length || args.includes('--help')) {
  console.log(`Použití: node tools/ai-appka-klik.mjs <profil> <url-stránky> <výstupní-složka> [--soubor <pdf|png>] [--popis "<text>"] [--cizi-origin <gatewayUrl>]
  profil      složka v ~/.config/ppf-rooms-lab/profily/ (lab uživatel, přihlášený Chrome profil) nebo absolutní cesta ke kopii profilu
              (kopie: cp -cR <profil> <scratch>; drží-li profil jiná session, hlásí to Chrome jako ProcessSingleton)
  url         stránka appky, např. https://<tenant>.sharepoint.com/sites/<web>/SitePages/evidence.aspx?env=WebView
  výstup      kam uložit klik.json + screenshoty (1-shrnuti.png, 2-ocr.png)
  --soubor    soubor pro OCR (výchozí sondy/ai/ocr-cs.png)
  šablony     Evidence (#evidence-*), Spokojenost (#ai-*), obecná (tlačítka s textem „Shrnout“ a „OCR“, výstup p[aria-live])
  --hlasuj    (šablona Spokojenost) nejdřív klikne hodnocení 4 = zápis do seznamu, ať má shrnutí data
  --cizi-origin  URL gateway: zkusí fetch z https://example.com (CORS test, bez tokenu)
Výstup: JSON s textem výsledku, časem kliknutí a záznamem síťových volání na gateway.`);
  process.exit(0);
}
const [profile, url, outDir] = args;
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const ROOT = path.join(process.env.HOME, 'Projects/egd-workshop');
const soubor = opt('--soubor', path.join(ROOT, 'sondy/ai/ocr-cs.png'));
const popisText = opt('--popis', 'Na chodbě ve 2. patře budovy B nesvítí od pondělí tři zářivky, je tam tma a lidé zakopávají o schod u výtahu. Prosím o výměnu zářivek a kontrolu, jestli není vadný vypínač.');
const ciziOrigin = opt('--cizi-origin', '');
fs.mkdirSync(outDir, { recursive: true });

const { chromium } = createRequire(path.join(ROOT, 'sondy/dokumenty/'))('playwright-core');
// profil: název v ~/.config/ppf-rooms-lab/profily/ nebo absolutní cesta (vlastní kopie profilu, když ho drží jiná session)
const ctx = await chromium.launchPersistentContext(path.isAbsolute(profile) ? profile : `${process.env.HOME}/.config/ppf-rooms-lab/profily/${profile}`,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1300, height: 1000 } });
const p = ctx.pages()[0] ?? await ctx.newPage();
const sit = [];
p.on('requestfinished', async (rq) => {
  if (!/azurecontainerapps\.io/.test(rq.url())) return;
  const h = await rq.allHeaders(); const r = await rq.response();
  sit.push({ metoda: rq.method(), url: rq.url(), stav: r?.status(), authorization: h.authorization ? `${h.authorization.slice(0, 13)}…(${h.authorization.length} znaků)` : null,
    xAppId: h['x-app-id'] ?? null, hlavickyPozadavku: Object.keys(h).sort() });
});
const bundly = [];
p.on('response', (r) => { if (/web-part[^/]*\.js(\?|$)/.test(r.url())) bundly.push(`${r.status()} ${r.url().split('/').pop()}`); });
p.on('requestfailed', (rq) => { if (/azurecontainerapps\.io/.test(rq.url())) sit.push({ metoda: rq.method(), url: rq.url(), chyba: rq.failure()?.errorText }); });
const out = { profil: profile, url, cas: new Date().toISOString() };
const t0 = Date.now();
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
// dvě šablony první appky: Evidence (#evidence-*) a Spokojenost (#ai-*); zjistí se podle toho, co se vykreslí
// třetí možnost „obecna“: appka, kterou upravil agent bez našich id (tlačítka podle textu „Shrnout…“ a „…OCR…“, výstup p[aria-live])
const sablona = await p.waitForSelector('#evidence-shrnout, #ai-shrnout, button:has-text("Shrnout")', { timeout: 90000 })
  .then(async () => (await p.locator('#evidence-shrnout').count()) ? 'evidence' : (await p.locator('#ai-shrnout').count()) ? 'spokojenost' : 'obecna')
  .catch(() => null);
out.sablona = sablona;
if (!sablona) out.chyba = `web part nenalezen, url=${p.url()}`;
out.nacteniMs = Date.now() - t0;
const S = sablona === 'evidence'
  ? { shrnout: '#evidence-shrnout', ocr: '#evidence-ocr', soubor: '#evidence-soubor', vystup: '#evidence-ai' }
  : sablona === 'obecna'
    ? { shrnout: 'button:has-text("Shrnout") >> nth=0', ocr: 'button:has-text("OCR") >> nth=0', soubor: 'input[type=file] >> nth=0', vystup: 'p[aria-live]' }
    : { shrnout: '#ai-shrnout', ocr: '#ai-ocr', soubor: '#ai-soubor', vystup: '#ai-vystup' };
const cekej = (zacatek) => p.waitForFunction(([sel, z]) => { const s = document.querySelector(sel)?.textContent ?? ''; return s && !s.startsWith(z); }, [S.vystup, zacatek], { timeout: 90000 }).catch(() => {});
if (sablona === 'evidence') {
  await p.fill('#evidence-nazev', 'Nesvítí zářivky na chodbě');
  await p.fill('#evidence-popis', popisText);
}
if (sablona === 'spokojenost' && args.includes('--hlasuj')) {
  // hlas 4 (zapíše/změní dnešní hlas přihlášeného uživatele v seznamu), ať má shrnutí data
  await p.click('button[aria-label^="4 "]'); await p.waitForTimeout(4000);
}
if (sablona) {
  let t = Date.now();
  await p.click(S.shrnout); await cekej('Přemýšlím');
  out.shrnuti = { ms: Date.now() - t, vystup: await p.locator(S.vystup).first().innerText() };
  await p.screenshot({ path: path.join(outDir, '1-shrnuti.png'), fullPage: true });
  await p.setInputFiles(S.soubor, soubor);
  t = Date.now();
  await p.click(S.ocr); await cekej('Čtu');
  out.ocr = { soubor: path.basename(soubor), ms: Date.now() - t, vystup: await p.locator(S.vystup).first().innerText(),
    ...(sablona === 'evidence' ? { popisPoOcr: await p.inputValue('#evidence-popis') } : {}) };
  await p.screenshot({ path: path.join(outDir, '2-ocr.png'), fullPage: true });
  if (await p.locator('#ai-kvota').count()) {  // Spokojenost: tlačítko s GET /api/kvota (_aiGet)
    await p.locator(S.vystup).first().evaluate((e) => { e.textContent = ''; });
    t = Date.now(); await p.click('#ai-kvota'); await cekej('\u0000');
    out.kvota = { ms: Date.now() - t, vystup: await p.locator(S.vystup).first().innerText() };
  }
}
out.sit = sit; out.bundly = bundly;
if (ciziOrigin) {
  const q = await ctx.newPage();
  await q.goto('https://example.com', { waitUntil: 'domcontentloaded' });
  out.ciziOrigin = await q.evaluate(async (u) => {
    try { const r = await fetch(`${u}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-App-Id': 'demo', Authorization: 'Bearer x' }, body: '{}' }); return `HTTP ${r.status}`; }
    catch (e) { return `${e.name}: ${e.message}`; }
  }, ciziOrigin);
}
fs.writeFileSync(path.join(outDir, 'klik.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await ctx.close();
