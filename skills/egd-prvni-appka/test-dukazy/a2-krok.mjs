// Cesta A2 v prohlizeci pod ulozenym Chrome profilem lab uzivatele (bez hesla), po krocich.
// Kazdy krok klika jako uzivatel podle references/rucne-v-prohlizeci.md, uklada snimky a vypisuje,
// co na strance je. Pouziti: node a2-krok.mjs <web> <slozka> <profil> <krok> [nazev seznamu]
//   krok: seznam | sloupce | aplikace | pridat | stranka | publikovat | stav
//   promenne: A2_RESENI (nazev reseni v katalogu, vychozi prvni-appka-client-side-solution),
//             A2_WP_ID (id web partu z manifestu), A2_STRANKA (nazev stranky, vychozi prvni-appka),
//             A2_HLEDAT (text do Sady nastroju, vychozi "Moje první appka"), A2_KONCEPT (soubor stranky),
//             A2_NASTAVIT_SEZNAM=1 (prepsat nazev seznamu ve vlastnostech; jinak jen kontrola vychozi hodnoty)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [web, outDir, profil, krok, seznam = 'MojeAppka'] = process.argv.slice(2);
const RESENI = process.env.A2_RESENI || 'prvni-appka-client-side-solution';
const WP_ID = (process.env.A2_WP_ID || '').toLowerCase();
const STRANKA = process.env.A2_STRANKA || 'prvni-appka';
const HLEDAT = process.env.A2_HLEDAT || 'Moje první appka';
const NASTAVIT = process.env.A2_NASTAVIT_SEZNAM === '1';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
if (!web || !outDir || !profil || !krok) { console.log('Pouziti: node a2-krok.mjs <web> <slozka> <profil> <seznam|sloupce|aplikace|stranka|stav> [nazev seznamu]'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1400, height: 950 }, locale: 'cs-CZ' });
const p = ctx.pages()[0] ?? await ctx.newPage();
let n = 0;
const shot = async (jm) => { n++; await p.screenshot({ path: `${outDir}/${krok}-${n}-${jm}.png` }); };
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${krok}:`, ...a);
const viditelne = async () => (await p.evaluate(() => [...document.querySelectorAll('button,[role=button],[role=menuitem],[role=tab],a[role=link],input[type=submit]')].filter((e) => e.offsetParent).map((e) => (e.innerText || e.getAttribute('aria-label') || e.value || '').trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 80)).catch(() => []));
const rest = (u) => p.evaluate(async (x) => { const r = await fetch(x, { headers: { Accept: 'application/json;odata=nometadata' } }); return { status: r.status, telo: r.ok ? await r.json() : (await r.text()).slice(0, 200) }; }, web + u);
// najde ramec (hlavni stranka nebo iframe), jehoz text odpovida vzoru; SharePoint dava dialogy do iframe
const ramec = async (re, ms = 30000) => {
  for (let t = 0; t < ms; t += 1000) {
    for (const f of p.frames()) { const txt = await f.evaluate(() => document.body?.innerText || '').catch(() => ''); if (re.test(txt) && f !== p.mainFrame()) return f; }
    if (re.test(await p.evaluate(() => document.body.innerText).catch(() => ''))) { /* zkus jeste iframe, pak hlavni */ if (t > 5000) return p.mainFrame(); }
    await p.waitForTimeout(1000);
  }
  return p.mainFrame();
};
let ok = false;
try {
  if (krok === 'stav') {
    await p.goto(`${web}/_layouts/15/viewlsts.aspx`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    log(JSON.stringify(await rest(`/_api/web/lists/getbytitle('${seznam}')/fields?$select=InternalName,TypeAsString,MinimumValue,MaximumValue&$filter=CanBeDeleted eq true`)));
    log(JSON.stringify(await rest(`/_api/web/getfolderbyserverrelativeurl('SitePages')/files?$select=Name`)));
    log(JSON.stringify(await rest(`/_api/web/AppTiles?$select=Title,ProductId`)));
    ok = true;
  }
  if (krok === 'seznam') {
    await p.goto(`${web}/_layouts/15/viewlsts.aspx`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.locator('button:has(span.ms-Button-label:text-is("Nové"))').first().waitFor({ timeout: 60000 });
    await shot('obsah-webu');
    await p.locator('button:has(span.ms-Button-label:text-is("Nové"))').first().click();
    await p.getByRole('menuitem', { name: /^Seznam$/ }).click();
    await p.waitForTimeout(5000); await shot('vytvorit-seznam');
    // dialog „Jak chcete začít?“ je v iframe: Vytvořit z prázdného → dlaždice „Seznam“
    const f = await ramec(/Jak chcete začít/);
    log('dialog v ramci:', f === p.mainFrame() ? 'hlavni' : f.url().split('?')[0]);
    await f.getByText(/^Seznam$/).first().click();
    await p.waitForTimeout(3000); await shot('prazdny');
    const f2 = await ramec(/Vytvořit|Název/);
    log('pole:', JSON.stringify(await f2.evaluate(() => [...document.querySelectorAll('input,textarea,button')].filter((e) => e.offsetParent).map((e) => `${e.tagName}:${e.getAttribute('aria-label') || e.placeholder || e.innerText || ''}`.trim()))));
    await f2.locator('input[type=text], input:not([type])').first().fill(seznam);
    await shot('nazev');
    await f2.getByRole('button', { name: /^Vytvořit$/ }).click();
    await p.waitForURL(/\/Lists\//, { timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(6000); await shot('seznam-zalozen');
    log('url:', p.url().split('?')[0]);
    ok = /\/Lists\//.test(p.url());
  }
  if (krok === 'sloupce') {
    const uz = ((await (async () => { await p.goto(`${web}/_layouts/15/viewlsts.aspx`, { waitUntil: 'domcontentloaded', timeout: 90000 }); return rest(`/_api/web/lists/getbytitle('${seznam}')/fields?$select=InternalName&$filter=CanBeDeleted eq true`); })()).telo?.value || []).map((x) => x.InternalName);
    log('uz existuje:', JSON.stringify(uz));
    for (const [jmeno, typ] of [['Hodnoceni', /^Číslo$/], ['Den', /^Text$/]]) {
      if (uz.includes(jmeno)) continue;
      await p.goto(`${web}/Lists/${seznam}/AllItems.aspx`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      const pridat = p.getByRole('button', { name: /Přidat sloupec/ }).first();
      await pridat.waitFor({ timeout: 60000 }); await pridat.click();
      await p.waitForTimeout(2000); await shot(`menu-${jmeno}`);
      log('menu:', JSON.stringify(await viditelne()));
      await p.getByRole('menuitem', { name: typ }).click().catch(async () => { await p.getByText(typ).first().click(); });
      const dalsi = p.getByRole('button', { name: /^Další$/ });
      if (await dalsi.isVisible().catch(() => false)) await dalsi.click();
      await p.waitForTimeout(3000);
      await p.getByRole('textbox', { name: /^Název/ }).first().fill(jmeno);
      if (jmeno === 'Hodnoceni') {
        const vic = p.getByRole('button', { name: /Další možnosti/ });
        if (await vic.isVisible().catch(() => false)) { await vic.click(); await p.waitForTimeout(1500); }
        const tb = async (re) => p.getByRole('textbox', { name: re }).first();
        for (const [re, v] of [[/Minim/, '1'], [/Maxim/, '5']]) { const t = await tb(re); if (await t.isVisible().catch(() => false)) await t.fill(v); else log('pole nenalezeno', String(re)); }
      }
      await shot(`panel-${jmeno}`);
      log('panel:', JSON.stringify(await viditelne()));
      await p.getByRole('button', { name: /^Uložit$/ }).click();
      await p.waitForTimeout(5000); await shot(`po-${jmeno}`);
    }
    const f = await rest(`/_api/web/lists/getbytitle('${seznam}')/fields?$select=InternalName,TypeAsString,MinimumValue,MaximumValue&$filter=CanBeDeleted eq true`);
    log('pole:', JSON.stringify(f));
    const jm = (f.telo?.value || []).map((x) => x.InternalName);
    ok = jm.includes('Hodnoceni') && jm.includes('Den');
  }
  if (krok === 'stranka') {
    // Novy -> Stranka -> Prazdna -> nazev -> + webova cast "Spokojenost s prostredim kancelare" (ta s popisem
    // "Hodnocení 1–5 jedním kliknutím…", na webu muze byt i stejnojmenna z egd-pripravenost) -> seznam -> Publikovat
    const koncept = process.env.A2_KONCEPT; // pokracovat v uz zalozenem konceptu (Page(N).aspx), at nevznikaji dalsi
    if (koncept) await p.goto(`${web}/SitePages/${koncept}?Mode=Edit`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    else {
      await p.goto(`${web}/_layouts/15/viewlsts.aspx`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      const nove = p.locator('button:has(span.ms-Button-label:text-is("Nové"))').first();
      await nove.waitFor({ timeout: 60000 }); await nove.click();
      await p.getByRole('menuitem', { name: /^Stránka$/ }).click();
      await p.waitForTimeout(8000); await shot('sablony');
      // Galerie sablon: tlacitko "Vytvorit prazdne" (vpravo nahore)
      await p.getByRole('button', { name: /^Vytvořit prázdné$/ }).first().click();
    }
    await p.waitForTimeout(10000); await shot('nova-stranka');
    log('url:', p.url().split('?')[0]);
    // bublina "Zacinate se SharePointem?" prekryva platno
    await p.keyboard.press('Escape').catch(() => {});
    const zavrit = p.locator('.ms-Callout button[aria-label], [role=dialog] button[aria-label*="Zavřít" i]').first();
    if (await zavrit.isVisible().catch(() => false)) await zavrit.click().catch(() => {});
    const h1 = p.locator('h1[data-placeholder="Přidejte název"], [role=textbox] h1').first();
    await h1.click({ force: true }); await p.waitForTimeout(800);
    await h1.evaluate((e) => { e.closest('[contenteditable]')?.focus(); });
    await p.keyboard.insertText(STRANKA);
    await p.waitForTimeout(800);
    log('nazev stranky:', JSON.stringify(await p.locator('[role=textbox] h1').first().innerText().catch(() => '?')));
    await p.waitForTimeout(1000);
    // Text webovou cast "Sem pridejte text" v prvni sekci: klik do ni -> nova cast se vlozi za ni
    await p.locator('p[data-placeholder^="Sem přidejte text"]').first().click({ force: true }).catch(() => {});
    const hledat = p.locator('input[data-automation-id="toolbox-searchBox"]').first();
    await hledat.waitFor({ timeout: 30000 });
    await hledat.fill(HLEDAT); await p.waitForTimeout(4000); await shot('toolbox-hledani');
    // vysledky hledani: popisek (aria-label "Pridat webovou cast <titulek>") a id web partu
    const tlacitka = p.locator('button[data-automation-id^="authoringTools-"]');
    const vysledky = await tlacitka.evaluateAll((els) => els.filter((e) => e.offsetParent).map((e) => ({ id: e.getAttribute('data-automation-id').replace('authoringTools-', ''), popisek: e.getAttribute('aria-label') })));
    log(`vysledky hledani "${HLEDAT}":`, JSON.stringify(vysledky));
    const nase = WP_ID ? p.locator(`button[data-automation-id^="authoringTools-${WP_ID}"]`).first() : tlacitka.first();
    let vlozeno = false;
    if (await nase.count()) {
      await nase.hover(); await p.waitForTimeout(2000); await shot('kandidat');
      const tip = (await p.evaluate(() => [...document.querySelectorAll('[role=tooltip], .ms-Callout, .ms-Tooltip')].filter((e) => e.offsetParent).map((e) => e.innerText).join(' | ')).catch(() => '')).replace(/\s+/g, ' ');
      log('popis po najeti mysi:', tip.slice(0, 250));
      await nase.click(); vlozeno = true;
    }
    await p.waitForTimeout(10000); await shot('vlozeno');
    const otazka = await p.getByText(/Jak jste dnes spokojen[ií] s prostředím kanceláře\?/).first().innerText().catch(() => '-');
    log('otazka ve vlozene casti:', JSON.stringify(otazka), '(nase appka = "spokojeni", egd-pripravenost = "spokojení")');
    log('hlaska v casti:', (await p.locator('[role=alert]').first().innerText().catch(() => '-')).replace(/\s+/g, ' '));
    await p.waitForTimeout(3000);
    const f = await rest(`/_api/web/getfolderbyserverrelativeurl('SitePages')/files?$select=Name,Level,TimeLastModified`);
    log('SitePages (koncept se uklada sam):', JSON.stringify(f.telo?.value || f));
    ok = vlozeno && /spokojeni s/.test(otazka);
    if (!vlozeno) throw new Error('nase webova cast (A2_WP_ID) v Sade nastroju neni');
  }
  if (krok === 'pridat') {
    // Obsah webu -> Nove -> Aplikace -> "Z nasi organizace" -> u prvni-appka-client-side-solution Pridat
    const wp = async () => p.evaluate(async (w) => { const d = (await (await fetch(w + '/_api/contextinfo', { method: 'POST', headers: { Accept: 'application/json;odata=nometadata' } })).json()).FormDigestValue; const j = await (await fetch(w + '/_api/web/GetClientSideWebParts', { method: 'POST', headers: { Accept: 'application/json;odata=nometadata', 'X-RequestDigest': d } })).json(); return (j.value || []).filter((v) => /Spokojen|appka/i.test(v.Manifest || '')).map((v) => `${v.Id} ${JSON.parse(v.Manifest).preconfiguredEntries?.[0]?.title?.default}`); }, web);
    await p.goto(`${web}/_layouts/15/appStore.aspx/myApps?entry=SiteContentsAddApp`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    log('web party (Spokojen*/appka) pred:', JSON.stringify(await wp()));
    await p.getByText(/^Z naší organizace$/).first().click().catch(() => {});
    await p.waitForTimeout(6000); await shot('moje-aplikace');
    const vzor = new RegExp(`^\\s*${esc(RESENI)}\\s*Moje organizace\\s*Přidat\\s*$`);
    const karta = p.locator('div,li,[role=listitem],[role=gridcell]').filter({ hasText: vzor }).last();
    log(`karet ${RESENI}:`, await p.locator('div,li').filter({ hasText: vzor }).count());
    await karta.getByRole('button', { name: /Přidat/ }).first().click().catch(async () => { await karta.getByText(/^Přidat$/).click(); });
    await p.waitForTimeout(8000); await shot('po-pridat');
    log('po kliknuti:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 400));
    log('url:', p.url().split('?')[0]);
    for (let i = 0; i < 12; i++) { const ids = await wp().catch(() => []); if (ids.some((x) => x.toLowerCase().includes(WP_ID))) { log(`web part nasi appky dostupny po ${i * 10} s:`, JSON.stringify(ids)); ok = true; break; } await p.waitForTimeout(10000); }
    if (!ok) log(`web part nasi appky (${WP_ID}) se neobjevil do 2 minut`);
    await shot('po-cekani');
  }
  if (krok === 'publikovat') {
    // pokracuje v konceptu A2_KONCEPT: zkontroluje nazev seznamu ve vlastnostech, publikuje, otevre stranku
    const koncept = process.env.A2_KONCEPT;
    await p.goto(`${web}/SitePages/${koncept}?Mode=Edit`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForTimeout(12000); await shot('editace');
    log('hlaska v casti:', (await p.locator('[role=alert]').first().innerText().catch(() => '-')).replace(/\s+/g, ' ').slice(0, 200));
    const cast = p.getByText(/Jak jste dnes spokojeni s prostředím kanceláře\?/).first();
    await cast.click().catch(() => {}); await p.waitForTimeout(1500);
    const lista = await p.evaluate(() => [...document.querySelectorAll('[data-automation-id*="toolbar" i] button, [role=toolbar] button')].filter((e) => e.offsetParent).map((e) => e.getAttribute('aria-label') || e.getAttribute('title') || e.innerText));
    log('lista webove casti:', JSON.stringify(lista));
    const tuzka = p.locator('[role=toolbar] button[aria-label*="Upravit" i], [role=toolbar] button[aria-label*="vlastnost" i], [role=toolbar] button[aria-label*="Edit" i]').first();
    await tuzka.click({ timeout: 10000 }).catch(async (e) => { log('tuzka:', String(e).slice(0, 100)); await p.keyboard.press('Alt+P').catch(() => {}); });
    await p.waitForTimeout(3000);
    const pole = p.getByRole('textbox', { name: /Název seznamu na tomto webu/ }).first();
    await pole.waitFor({ timeout: 15000 }).catch(() => {});
    log('vlastnost seznam =', await pole.inputValue({ timeout: 5000 }).catch(() => '?'));
    const hodnota = await pole.inputValue({ timeout: 5000 }).catch(() => '');
    if (NASTAVIT && hodnota !== seznam && await pole.isVisible()) { await pole.fill(seznam); await pole.press('Tab'); await p.waitForTimeout(3000); log('nastaveno na', seznam); }
    else if (hodnota !== seznam) { log(`CHYBA: vlastnost seznam je "${hodnota}", ocekavano "${seznam}" (A2_NASTAVIT_SEZNAM neni 1)`); }
    await shot('vlastnosti');
    await p.keyboard.press('Escape').catch(() => {});
    await p.mouse.move(10, 500); await p.waitForTimeout(1500);
    await p.locator('button:has-text("Publikovat stránku")').first().click({ force: true });
    await p.waitForTimeout(15000); await shot('publikovano');
    log('po publikovani url:', p.url().split('?')[0]);
    log('text:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 300));
    const f = await rest(`/_api/web/getfolderbyserverrelativeurl('SitePages')/files?$select=Name,Level,TimeLastModified`);
    log('SitePages:', JSON.stringify(f.telo?.value || f));
    const pub = (f.telo?.value || []).find((x) => x.Name === koncept);
    ok = !!pub && pub.Level === 1 && (NASTAVIT || hodnota === seznam);
  }
  if (krok === 'aplikace') {
    await p.goto(`${web}/_layouts/15/viewlsts.aspx`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.locator('button:has(span.ms-Button-label:text-is("Nové"))').first().waitFor({ timeout: 60000 });
    await p.locator('button:has(span.ms-Button-label:text-is("Nové"))').first().click();
    await p.waitForTimeout(1500); await shot('menu-novy');
    log('menu:', JSON.stringify(await viditelne()));
    await p.getByRole('menuitem', { name: /^Aplikace$/ }).click();
    await p.waitForTimeout(10000); await shot('aplikace');
    log('url:', p.url().split('?')[0]);
    log('stranka:', JSON.stringify(await viditelne()));
    log('text:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 1200));
    ok = true;
  }
} catch (e) { log('CHYBA', String(e).split('\n')[0].slice(0, 300)); await shot('chyba'); log('viditelne:', JSON.stringify(await viditelne())); }
await ctx.close();
console.log(ok ? `${krok} OK` : `${krok} SELHALO`);
process.exit(ok ? 0 : 1);
