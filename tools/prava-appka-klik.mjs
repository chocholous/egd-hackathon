#!/usr/bin/env node
// prava-appka-klik.mjs — otevře appku "Evidence požadavků" (skill egd-prvni-appka) pod uloženým Chrome profilem
// lab uživatele a vypíše, co ten uživatel vidí: roli, záložky, Moje požadavky, Ke schválení. Volitelně odešle
// požadavek nebo schválí položku. Na ověření rolí ze skillu egd-prava-role v prohlížeči.
import { createRequire } from 'node:module'; import path from 'node:path';
const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log(`Použití: prava-appka-klik.mjs <profil> <url stránky appky> [--odeslat "název"] [--schvalit "název"] [--shot soubor.png]
  profil     podadresář ~/.config/ppf-rooms-lab/profily/ (nebo SPO_UI_PROFILY=<adresář> s kopiemi profilů)
  url        např. https://<tenant>.sharepoint.com/sites/<web>/SitePages/evidence.aspx?env=WebView
  --odeslat  vyplní formulář Nový požadavek a odešle (ZAPISUJE do seznamu)
  --schvalit klikne Schválit u položky s tímto názvem v záložce Ke schválení (ZAPISUJE)
Vypíše JSON: upn (přihlášený účet z /_api/web/currentuser), role, zalozky, moje (názvy), keSchvaleni (názvy + autor), chyba, zprava.
Vyžaduje playwright-core (z ~/Projects/egd-workshop/sondy/dokumenty/node_modules) a Google Chrome.`); process.exit(0);
}
const val = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : null);
const pos = args.filter((a, i) => !a.startsWith('--') && !['--odeslat', '--schvalit', '--shot'].includes(args[i - 1]));
const [profile, url] = pos;
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const dir = `${process.env.SPO_UI_PROFILY || process.env.HOME + '/.config/ppf-rooms-lab/profily'}/${profile}`;
const ctx = await chromium.launchPersistentContext(dir, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1300, height: 900 }, locale: 'cs-CZ', args: ['--disk-cache-size=5000000'] });
const p = ctx.pages()[0] ?? await ctx.newPage();
const out = { profil: profile, cas: new Date().toISOString() };
const zalozka = async (t) => { const b = p.locator('nav button', { hasText: t }); if (await b.count()) { await b.first().click(); await p.waitForTimeout(800); return true; } return false; };
const radky = async () => p.locator('table tbody tr').evaluateAll((rs) => rs.map((r) => ({ nazev: r.querySelector('td strong')?.textContent, autor: r.children[1]?.textContent, stav: r.children[3]?.textContent })));
try {
  await p.goto(url, { waitUntil: 'commit', timeout: 90000 });
  const ok = await p.waitForSelector('#evidence-role', { timeout: 60000 }).then(() => true).catch(() => false);
  out.url = p.url();
  if (!ok) { out.chyba = 'appka se nenačetla: ' + (await p.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200); }
  else {
    await p.waitForTimeout(1500);
    out.upn = await p.evaluate(async () => { const web = location.pathname.split('/SitePages/')[0]; const r = await fetch(`${web}/_api/web/currentuser?$select=UserPrincipalName`, { headers: { Accept: 'application/json;odata=nometadata' } }); return r.ok ? (await r.json()).UserPrincipalName : `HTTP ${r.status}`; }).catch((e) => `chyba: ${e.message}`);
    out.role = await p.locator('#evidence-role').innerText();
    out.zalozky = await p.locator('nav button').allInnerTexts();
    if (val('--odeslat')) {
      await zalozka('Nový požadavek'); await p.fill('#evidence-nazev', val('--odeslat')); await p.fill('#evidence-popis', `test ${profile}`);
      await p.locator('form button[type=submit]').click(); await p.waitForTimeout(4000);
    }
    if (await zalozka('Moje požadavky')) out.moje = await radky();
    if (await zalozka('Ke schválení')) {
      out.keSchvaleni = await radky();
      if (val('--schvalit')) {
        const r = p.locator('table tbody tr', { hasText: val('--schvalit') }).first();
        await r.locator('input').fill(`schválil ${profile}`); await r.locator('button', { hasText: 'Schválit' }).click(); await p.waitForTimeout(4000);
        out.poSchvaleni = await radky();
      }
    }
    out.chybaAppky = await p.locator('[role=alert]').allInnerTexts();
    out.zprava = await p.locator('[role=status]').allInnerTexts();
  }
  if (val('--shot')) await p.screenshot({ path: val('--shot') });
} catch (e) { out.chyba = e.message; }
console.log(JSON.stringify(out, null, 1));
await ctx.close();
