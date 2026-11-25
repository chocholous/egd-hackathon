#!/usr/bin/env node
// Otevře appku „Evidence požadavků“ s panelem „Poslat mailem“ (miniskill egd-maily) pod uloženým Chrome profilem
// lab uživatele, vyplní adresu, volitelně velikost testovací přílohy, klikne „Poslat mailem“ a vypíše výsledek z #mail-vysledek.
// S --mailto místo toho klikne „Otevřít v Outlooku“ a vypíše zachycenou mailto: adresu (CDP Page.frameRequestedNavigation).
import { createRequire } from 'node:module'; import path from 'node:path';
const args = process.argv.slice(2);
if (args.length < 3 || args.includes('--help')) {
  console.log(`Použití: tools/maily-spo-klik.mjs <profil> <url-stránky> <komu> [--mb N]... [--mailto] [--shot soubor.png]
  profil  podadresář ~/.config/ppf-rooms-lab/profily/ (např. tomas.prochazka); profil nesmí být otevřený v jiném Chrome
  url     stránka s web partem (…/SitePages/evidence.aspx?env=WebView)
  komu    adresát (jen lab účty tenantu!)
  --mb N  testovací příloha N MB (opakovat pro víc pokusů; bez --mb = CSV export „Moje požadavky“)
  --mailto  jen ověří odkaz mailto: (nic neodešle)
  --novy-token  před kliknutím smaže access tokeny MSAL z úložiště stránky (po schválení oprávnění)
  --tlacitko TEXT  obecný režim pro libovolný web part: klikne tlačítko s tímto názvem a počká na Graph sendMail
                   (<komu> se pak jen vypíše; adresát je v kódu web partu)
  --nejdriv TEXT   před --tlacitko klikne tlačítko s tímto názvem (např. hlas „4“) a počká 5 s
  --pole SELEKTOR  před --tlacitko vyplní <komu> do pole (např. '#pdf-komu')
  --konzole REGEX  vypíše i zprávy konzole stránky (log/info), které odpovídají regexu (např. '^\\[c1\\]')
  --vysledek SELEKTOR  po --tlacitko počká na text prvku, který nezačíná „Vyrábím“ / „PDF … odesílám“, a vypíše ho
Vyžaduje playwright-core (cesta k jeho rodičovské složce v env PLAYWRIGHT_CORE_DIR, jinak
~/Projects/egd-workshop/sondy/dokumenty/ a globální npm @playwright/cli) a Google Chrome.`); process.exit(0);
}
const [profile, url, komu] = args;
const mbs = []; let mailto = false, shot = '', novyToken = false, tlacitko = '', nejdriv = '', pole = '', vysledek = '', konzole = null;
for (let i = 3; i < args.length; i++) { if (args[i] === '--mb') mbs.push(args[++i]); else if (args[i] === '--mailto') mailto = true; else if (args[i] === '--shot') shot = args[++i]; else if (args[i] === '--novy-token') novyToken = true; else if (args[i] === '--tlacitko') tlacitko = args[++i]; else if (args[i] === '--nejdriv') nejdriv = args[++i]; else if (args[i] === '--pole') pole = args[++i]; else if (args[i] === '--vysledek') vysledek = args[++i]; else if (args[i] === '--konzole') konzole = new RegExp(args[++i]); }
import { execSync } from 'node:child_process';
const pwKandidati = [process.env.PLAYWRIGHT_CORE_DIR, path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/')];
try { pwKandidati.push(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), '@playwright/cli/')); } catch { /* bez npm */ }
let chromium;
for (const d of pwKandidati.filter(Boolean)) { try { ({ chromium } = createRequire(path.join(d, 'x.js'))('playwright-core')); break; } catch { /* další */ } }
if (!chromium) { console.error('playwright-core nenalezen v:', pwKandidati.filter(Boolean).join(', '), '→ nastav PLAYWRIGHT_CORE_DIR'); process.exit(1); }
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profile}`,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1300, height: 1000 } });
const p = ctx.pages()[0] ?? await ctx.newPage();
p.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 400)); else if (konzole && konzole.test(m.text())) console.log('[console]', m.text().slice(0, 400)); });
p.on('response', async (r) => {
  if (!(r.url().includes('graph.microsoft.com') && r.url().includes('sendMail'))) return;
  const auth = r.request().headers().authorization || '';
  let scp = '?'; try { scp = JSON.parse(Buffer.from(auth.split(' ')[1].split('.')[1], 'base64url').toString()).scp; } catch { /* nic */ }
  console.log('[graph]', r.status(), r.url(), '| Mail.Send v tokenu:', / Mail\.Send( |$)/.test(' ' + scp), '| délka těla', (r.request().postData() || '').length);
});
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 180000 });
if (novyToken) {  // smaže z localStorage/sessionStorage uložené access tokeny MSAL (SPFx je jinak drží do vypršení)
  const n = await p.evaluate(() => { let c = 0; for (const s of [localStorage, sessionStorage]) for (const k of Object.keys(s)) if (/accesstoken/i.test(k)) { s.removeItem(k); c++; } return c; });
  console.log('[cache] smazáno access tokenů:', n); await p.reload({ waitUntil: 'domcontentloaded', timeout: 180000 });
}
if (tlacitko) {  // obecný režim: libovolný web part s tlačítkem, které volá Graph sendMail
  if (nejdriv) { await p.getByRole('button', { name: nejdriv }).first().click({ timeout: 90000 }); await p.waitForTimeout(5000); }
  if (pole) await p.fill(pole, komu, { timeout: 90000 });
  const odp = p.waitForResponse((r) => r.url().includes('graph.microsoft.com') && r.url().includes('sendMail'), { timeout: 120000 }).catch(() => null);
  const t0 = Date.now(); await p.getByRole('button', { name: tlacitko }).click({ timeout: 90000 });
  const r = await odp; console.log(pole ? 'adresát vyplněn do ' + pole + ':' : 'adresát (podle kódu web partu), zadáno:', komu, '| sendMail:', r ? r.status() : 'žádná odpověď do 120 s', '| od kliku', Date.now() - t0, 'ms');
  if (vysledek) {
    await p.waitForFunction((s) => { const v = document.querySelector(s)?.textContent || ''; return v && !/^(Vyrábím|PDF \d+ B, odesílám)/.test(v); }, vysledek, { timeout: 60000 }).catch(() => {});
    console.log('výsledek v UI:', await p.locator(vysledek).innerText().catch(() => '(prvek nenalezen)'));
  }
  await p.waitForTimeout(3000);
  if (shot) await p.screenshot({ path: shot });
  await ctx.close(); process.exit(0);
}
await p.getByRole('button', { name: /Moje požadavky/ }).click({ timeout: 90000 });
await p.fill('#mail-komu', komu);
if (mailto) {
  const cdp = await ctx.newCDPSession(p); await cdp.send('Page.enable');
  const nav = new Promise((res) => cdp.on('Page.frameRequestedNavigation', (e) => res(e.url)));
  await p.click('#mail-mailto');
  console.log('mailto:', await Promise.race([nav, new Promise((r) => setTimeout(() => r('(žádná navigace do 5 s)'), 5000))]));
} else {
  for (const mb of (mbs.length ? mbs : ['0'])) {
    await p.fill('#mail-test-mb', mb);
    const t = Date.now(); await p.click('#mail-poslat');
    await p.waitForFunction(() => { const v = document.querySelector('#mail-vysledek')?.textContent || ''; return v && !v.startsWith('odesílám'); }, null, { timeout: 180000 }).catch(() => {});
    console.log(`--- mb=${mb} wall ${Date.now() - t} ms\n` + (await p.locator('#mail-vysledek').innerText()));
  }
}
if (shot) await p.screenshot({ path: shot });
await ctx.close();
