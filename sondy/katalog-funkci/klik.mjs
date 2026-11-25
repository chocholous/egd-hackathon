#!/usr/bin/env node
// klik.mjs — projde kartu Katalogu funkcí v Chrome pod účastníkem: APFS klon přihlášeného profilu
// (originál může mít otevřený jiná session), otevře stránku, provede kroky, uloží snímky, text a síť.
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
import { execFileSync } from 'node:child_process';
const args = process.argv.slice(2);
if (!args.length || args.includes('--help')) {
  console.log(`Použití: node klik.mjs <profil> <url> <složka-výstupu> [krok ...] [--headed]
  profil   podadresář ~/.config/ppf-rooms-lab/profily/ (e2e-egd09, e2e-egd10); použije se jeho APFS klon
  kroky    click:<text|css>       klik (text = viditelný text tlačítka, první shoda; css začíná # . [ )
           clickn:<n>:<text>      klik na n-tou (od 0) shodu textu
           fill:<css>=<text>      vyplnění pole       file:<css>=<cesta>   výběr souboru
           wait:<ms>              čekání              waitfor:<text>       čeká až se text objeví (max 90 s)
           shot:<jméno>           snímek celé stránky do <složka>/<jméno>.png (SharePoint scrolluje uvnitř, ber shotv/shotel)
           shotv:<jméno>          snímek viditelné části   shotel:<css|text>=<jméno>  snímek jednoho prvku
           scroll:<css|text>      posune prvek do zorného pole
           rozbal[:ms]            projede stránku, aby se vykreslily líně načítané web party
           text:<css>             vypíše innerText prvku (např. text:#log)
           eval:<js>              vyhodnotí výraz ve stránce a vypíše výsledek
  Výstup: <složka>/klik.json (kroky, výsledky, síť na *.azurecontainerapps.io, graph, _api), snímky.`);
  process.exit(0);
}
const headed = args.includes('--headed');
const [profil, url, out, ...kroky] = args.filter((a) => a !== '--headed');
fs.mkdirSync(out, { recursive: true });
const zdroj = `${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`;
// Přihlášení účastníka žije jen v běžícím Chrome (session cookie), APFS klon profilu skončí na přihlašovací stránce
// (✅ 24. 11.). Když Chrome s tímto profilem běží, připojí se k němu přes DevTools (DevToolsActivePort) a pracuje
// v NOVÉM panelu, který na konci zavře; Chrome nechá běžet. Jinak spustí klon profilu.
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
let ctx, browser, klon = null, p;
const portSoubor = path.join(zdroj, 'DevToolsActivePort');
const lstat = (f) => { try { return fs.lstatSync(f); } catch { return null; } };  // SingletonLock je visící symlink
const bezi = !!lstat(path.join(zdroj, 'SingletonLock')) && fs.existsSync(portSoubor);
if (bezi) {
  const port = fs.readFileSync(portSoubor, 'utf8').split('\n')[0].trim();
  browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  ctx = browser.contexts()[0]; p = await ctx.newPage(); await p.setViewportSize({ width: 1400, height: 1000 });
  console.log(`připojeno k běžícímu Chrome ${profil} (port ${port}), nový panel`);
} else {
  klon = `${process.env.TMPDIR || '/tmp/'}katalog-klik-${profil}-${process.pid}`;
  execFileSync('cp', ['-cR', zdroj, klon]);
  for (const f of ['SingletonLock', 'SingletonSocket', 'SingletonCookie', 'DevToolsActivePort']) fs.rmSync(path.join(klon, f), { force: true });
  ctx = await chromium.launchPersistentContext(klon, {
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: !headed, viewport: { width: 1400, height: 1000 } });
  p = ctx.pages()[0] ?? await ctx.newPage();
}
const t0 = Date.now(); const zaznam = { profil, url, start: new Date().toISOString(), kroky: [], sit: [], konzole: [] };
const log = (...a) => { const s = `[${((Date.now() - t0) / 1000).toFixed(1)}s] ${a.join(' ')}`; console.log(s); };
p.on('response', async (r) => {
  const u = r.url();
  if (/azurecontainerapps\.io|graph\.microsoft\.com|\/_api\/(web\/lists|SP\.|web\/currentuser)|ares\.gov|open-meteo|cnb\.cz/.test(u) && r.request().method() !== 'OPTIONS')
    zaznam.sit.push({ t: Date.now() - t0, m: r.request().method(), s: r.status(), u: u.slice(0, 200) });
});
p.on('requestfailed', (r) => { const u = r.url(); if (!/\.(js|css|png|woff2?)(\?|$)/.test(u)) zaznam.sit.push({ t: Date.now() - t0, m: r.method(), s: 'FAILED ' + (r.failure()?.errorText || ''), u: u.slice(0, 200) }); });
p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) zaznam.konzole.push(`${m.type()}: ${m.text().slice(0, 300)}`); });
await p.goto(url, { waitUntil: 'load', timeout: 90000 }).catch((e) => log('goto:', e.message));
log('URL', p.url());
// text hledá nejdřív mezi tlačítky a odkazy (jinak trefí stejná slova v textu „Co se děje na pozadí“)
const najdi = (v, n = 0) => (/^[#.\[]|^button|^form|^input/.test(v) ? p.locator(v).nth(n) : p.locator('button, [role=button], a, input[type=button], input[type=submit]').filter({ hasText: v }).nth(n));
for (const k of kroky) {
  const [typ, ...rest] = k.split(':'); const v = rest.join(':'); const zk = { krok: k, t: Date.now() - t0 };
  try {
    if (typ === 'click') { await najdi(v).scrollIntoViewIfNeeded({ timeout: 20000 }); await najdi(v).click({ timeout: 20000 }); }
    else if (typ === 'clickn') { const [n, ...t] = v.split(':'); await najdi(t.join(':'), Number(n)).click({ timeout: 20000 }); }
    else if (typ === 'fill') { const i = v.indexOf('=', v.lastIndexOf(']') + 1); /* „=“ v [atribut="…"] nepočítat */ await p.locator(v.slice(0, i)).first().fill(v.slice(i + 1)); }
    else if (typ === 'file') { const i = v.lastIndexOf('='); await p.locator(v.slice(0, i)).first().setInputFiles(v.slice(i + 1)); }
    else if (typ === 'wait') await p.waitForTimeout(Number(v));
    else if (typ === 'waitfor') await p.getByText(v, { exact: false }).first().waitFor({ timeout: 90000 });
    else if (typ === 'shot') { const f = path.join(out, `${v}.png`); await p.screenshot({ path: f, fullPage: true }); zk.vysledek = f; }
    else if (typ === 'rozbal') { // SharePoint vykreslí web part až při posunu do zorného pole: projede všechny zóny
      const n = await p.evaluate(() => document.querySelectorAll('.ControlZone').length);
      for (let i = 0; i < n; i++) { await p.evaluate((i) => document.querySelectorAll('.ControlZone')[i].scrollIntoView(), i); await p.waitForTimeout(700); }
      await p.waitForTimeout(Number(v || 3000)); zk.vysledek = `${n} zón`; }
    else if (typ === 'scroll') { await najdi(v).scrollIntoViewIfNeeded({ timeout: 20000 }); }
    else if (typ === 'shotv') { const f = path.join(out, `${v}.png`); await p.screenshot({ path: f }); zk.vysledek = f; }
    else if (typ === 'shotel') { const i = v.lastIndexOf('='); const f = path.join(out, `${v.slice(i + 1)}.png`); await najdi(v.slice(0, i)).screenshot({ path: f, timeout: 20000 }); zk.vysledek = f; }
    else if (typ === 'text') { zk.vysledek = (await p.locator(v).first().innerText({ timeout: 20000 })).slice(0, 4000); }
    else if (typ === 'eval') { zk.vysledek = await p.evaluate(v); }
    zk.ok = true;
  } catch (e) { zk.ok = false; zk.chyba = e.message.split('\n')[0]; }
  zaznam.kroky.push(zk); log(zk.ok ? 'OK' : 'CHYBA', k, zk.chyba || '', typeof zk.vysledek === 'string' ? '\n' + zk.vysledek : (zk.vysledek !== undefined ? JSON.stringify(zk.vysledek) : ''));
}
zaznam.konec = new Date().toISOString();
fs.writeFileSync(path.join(out, 'klik.json'), JSON.stringify(zaznam, null, 1));
if (klon) { await ctx.close(); execFileSync('/usr/bin/trash', [klon]); } else { await p.close(); await browser.close().catch(() => {}); }
log('síť:', zaznam.sit.map((s) => `${s.m} ${s.s} ${s.u.slice(0, 110)}`).join('\n  '));
