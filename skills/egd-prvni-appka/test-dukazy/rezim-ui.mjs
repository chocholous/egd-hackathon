// Režim appky v prohlížeči bez CLI (vlastník webu, profil bez hesla). Kroky:
//   web-open    ⚙ → Oprávnění k webu → Sdílet web → „Všichni kromě externích uživatelů“ → Číst → bez e-mailu → Přidat
//   seznam-open Nastavení seznamu → Oprávnění pro tento seznam → Zastavit dědění → Udělit oprávnění
//               → Všichni kromě externích uživatelů, Přispívání, bez e-mailu; pak Upřesňující nastavení →
//               „Vytvořit položky a upravit položky vytvořené uživatelem“
//   web-single  Oprávnění k webu → Upřesňující nastavení oprávnění → zaškrtnout skupinu → Odebrat oprávnění
//   seznam-single Oprávnění pro tento seznam → Odstranit jedinečná oprávnění; Upřesňující nastavení → všechny položky
// Bez REZIM_ZAPSAT=1 jen projde a vyfotí stránky, nic neuloží.
// Použití: node rezim-ui.mjs <krok> <web> <profil> [seznam]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [krok, web, profil, seznam = 'MojeAppka'] = process.argv.slice(2);
const zapsat = process.env.REZIM_ZAPSAT === '1';
const VSICHNI = 'Všichni kromě externích uživatelů';
const out = path.join(path.dirname(new URL(import.meta.url).pathname), 'rezim-ui', 'snimky');
fs.mkdirSync(out, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1400, height: 950 }, locale: 'cs-CZ' });
const p = ctx.pages()[0] ?? await ctx.newPage();
p.on('dialog', (d) => { console.log('dialog:', d.message().slice(0, 120), zapsat ? '-> OK' : '-> zrusit'); (zapsat ? d.accept() : d.dismiss()).catch(() => {}); });
let n = 0;
const shot = (s) => p.screenshot({ path: `${out}/${krok}-${++n}-${s}.png` });
const cekej = (ms = 3000) => p.waitForTimeout(ms);
const log = (...a) => console.log(...a);
const vsude = async (fn) => { for (const f of p.frames()) { const r = await fn(f).catch(() => null); if (r) return r; } return null; };
const klikText = async (text, popis = text, presne = true) => {
  const ok = await vsude(async (f) => { const l = f.getByText(text, { exact: presne }).filter({ visible: true }); if (await l.count()) { await l.first().click({ timeout: 10000 }); return true; } return null; });
  log(`klik ${popis}:`, !!ok); return !!ok;
};
const listId = async () => p.evaluate(async ([w, s]) => (await (await fetch(`${w}/_api/web/lists/getbytitle('${s}')?$select=Id`, { headers: { Accept: 'application/json;odata=nometadata' } })).json()).Id, [web, seznam]);
let vysledek = false;

if (krok === 'web-open') {
  await p.goto(web, { waitUntil: 'domcontentloaded', timeout: 90000 }); await cekej(8000);
  await p.locator('button[aria-label="Nastavení"]').first().click(); await cekej(2500);
  await klikText('Oprávnění k webu'); await cekej(4000);
  await p.getByRole('button', { name: 'Sdílet web' }).click(); await cekej(3000);
  const pole = p.locator('.ms-BasePicker-input').first();
  await pole.click(); await pole.fill('Všichni kromě'); await cekej(4000); await shot('hledani');
  const navrh = p.getByRole('option').filter({ hasText: VSICHNI });
  log('navrh skupiny:', await navrh.count());
  if (await navrh.count()) await navrh.first().click(); else await p.keyboard.press('Enter');
  await cekej(2500);
  const mail = p.getByRole('checkbox', { name: /Poslat e-mail/ });
  if (await mail.isChecked().catch(() => false)) await mail.click({ force: true });
  log('role pod jmenem:', await p.locator('button:has-text("Číst")').count() ? 'Číst' : '?', '| e-mail:', await mail.isChecked().catch(() => '?'));
  await shot('pred-pridanim');
  if (zapsat) { await p.getByRole('button', { name: 'Přidat', exact: true }).last().click(); await cekej(6000); await shot('po-pridani'); vysledek = true; }
}

if (krok === 'seznam-open' || krok === 'seznam-single') {
  await p.goto(web, { waitUntil: 'domcontentloaded', timeout: 90000 }); await cekej(3000);
  const id = await listId(); log('seznam id:', id);
  await p.goto(`${web}/_layouts/15/listedit.aspx?List=${encodeURIComponent('{' + id + '}')}`, { waitUntil: 'domcontentloaded' }); await cekej(3000); await shot('nastaveni-seznamu');
  await klikText('Oprávnění pro: Seznam'); await cekej(4000); await shot('opravneni');
  if (krok === 'seznam-open') {
    if (await p.getByText('Ukončit dědění').count()) {
      await klikText('Ukončit dědění', 'Ukončit dědění oprávnění', false); await cekej(5000); await shot('po-zastaveni');
    } else log('seznam uz ma vlastni opravneni');
    const uzMa = await p.locator('a').filter({ hasText: VSICHNI }).count();
    log('skupina uz na seznamu:', uzMa > 0);
    if (zapsat && !uzMa) {
      await klikText('Udělit', 'Udělit oprávnění', false); await cekej(5000); await shot('udelit');
      const ramec = p.frames().find((f) => /aclinv\.aspx/i.test(f.url())) || p.frames().find((f) => f !== p.mainFrame() && /_layouts/i.test(f.url())) || p.mainFrame();
      log('dialog:', ramec.url().split('?')[0]);
      const pole = ramec.locator('input[type=text]').filter({ visible: true }).first();
      await pole.click(); await pole.fill('Všichni kromě'); await cekej(4000);
      const navrh = ramec.locator('.ms-core-menu-label, .sp-peoplepicker-autoFillContainer *, li, div').filter({ hasText: VSICHNI }).filter({ visible: true });
      log('navrh skupiny:', await navrh.count());
      if (await navrh.count()) await navrh.last().click(); else await pole.press('Enter');
      await cekej(2000); await shot('udelit-vybrano');
      const moznosti = ramec.getByText('ZOBRAZIT MOŽNOSTI');
      if (await moznosti.count()) { await moznosti.first().click(); await cekej(1500); }
      const pozvanka = ramec.getByLabel('Poslat pozvánku e-mailem');
      if (await pozvanka.isChecked().catch(() => false)) await pozvanka.uncheck();
      log('pozvanka e-mailem:', await pozvanka.isChecked().catch(() => 'nenalezena'));
      const vyber = ramec.locator('select').filter({ visible: true }).first();
      const volby = await vyber.locator('option').allTextContents().catch(() => []);
      const prisp = volby.find((v) => /Přispívání/.test(v));
      if (prisp) await vyber.selectOption({ label: prisp });
      log('uroven:', prisp);
      await shot('udelit-pred-sdilet');
      if (await pozvanka.isChecked().catch(() => false)) { log('pozvanka porad zaskrtnuta - nesdilim'); await ctx.close(); process.exit(1); }
      await ramec.getByRole('button', { name: 'Sdílet' }).filter({ visible: true }).last().click(); await cekej(6000);
      await shot('po-udeleni');
    }
    if (zapsat) {
      // položky: upravovat jen vlastní
      await p.goto(`${web}/_layouts/15/advsetng.aspx?List=${encodeURIComponent('{' + id + '}')}`, { waitUntil: 'domcontentloaded' }); await cekej(3000);
      const radio = p.getByLabel('Vytvořit položky a upravit položky vytvořené daným uživatelem');
      log('volba vlastni polozky:', await radio.count());
      if (await radio.count()) await radio.check();
      await shot('upresnujici');
      await p.locator('input[value="OK"]').filter({ visible: true }).first().click(); await cekej(4000);
      vysledek = true;
    }
  } else {
    if (zapsat) {
      await klikText('Odstranit jedinečná', 'Odstranit jedinečná oprávnění', false); await cekej(5000); await shot('po-odstraneni');
      await p.goto(`${web}/_layouts/15/advsetng.aspx?List=${encodeURIComponent('{' + id + '}')}`, { waitUntil: 'domcontentloaded' }); await cekej(3000);
      const radio = p.getByLabel('Vytvořit a upravit všechny položky');
      log('volba vsechny polozky:', await radio.count());
      if (await radio.count()) await radio.check();
      await p.locator('input[value="OK"]').filter({ visible: true }).first().click(); await cekej(4000);
      vysledek = true;
    }
  }
}

if (krok === 'web-single') {
  // Sdílet web s rolí Číst dá skupinu do Návštěvníků; vyřadit ji ze skupiny na stránce skupiny
  await p.goto(web, { waitUntil: 'domcontentloaded', timeout: 90000 }); await cekej(3000);
  const skupiny = await p.evaluate(async (w) => (await (await fetch(`${w}/_api/web/sitegroups?$select=Id,Title,Users/Title&$expand=Users`, { headers: { Accept: 'application/json;odata=nometadata' } })).json()).value, web);
  for (const g of skupiny.filter((x) => x.Users.some((u) => u.Title === VSICHNI))) {
    log('skupina se Vsemi:', g.Title);
    await p.goto(`${web}/_layouts/15/people.aspx?MembershipGroupId=${g.Id}`, { waitUntil: 'domcontentloaded' }); await cekej(4000); await shot(`skupina-${g.Id}`);
    const radek = p.locator('tr').filter({ hasText: VSICHNI }).filter({ has: p.locator('input[type=checkbox]') }).last();
    const zaskrt = radek.locator('input[type=checkbox]').first();
    log('radek:', await radek.count(), '| zaskrtavatko:', await zaskrt.count());
    if (!zapsat) continue;
    await zaskrt.click({ force: true }); await cekej(1000);
    await klikText('Akce', 'Akce', false); await cekej(1500); await shot(`akce-${g.Id}`);
    vysledek = await klikText('Odebrat uživatele ze skupiny', 'Odebrat uživatele ze skupiny', false); await cekej(5000); await shot(`po-odebrani-${g.Id}`);
  }
}

// čtení zpět (REST v kontextu přihlášeného vlastníka)
const stav = await p.evaluate(async ([w, s, v]) => {
  const g = async (u) => (await fetch(w + u, { headers: { Accept: 'application/json;odata=nometadata' } })).json();
  const ra = (x) => (x.value || []).filter((r) => r.Member?.Title === v).map((r) => r.RoleDefinitionBindings.map((b) => b.Name).join('+'));
  const L = `/_api/web/lists/getbytitle('${s}')`;
  const l = await g(`${L}?$select=HasUniqueRoleAssignments,WriteSecurity`);
  return { web: ra(await g('/_api/web/roleassignments?$expand=Member,RoleDefinitionBindings')), seznamVlastni: l.HasUniqueRoleAssignments, writeSecurity: l.WriteSecurity, seznam: ra(await g(`${L}/roleassignments?$expand=Member,RoleDefinitionBindings`)) };
}, [web, seznam, VSICHNI]).catch((e) => ({ chyba: e.message }));
log('stav:', JSON.stringify(stav));
await ctx.close();
log(zapsat ? (vysledek ? 'ZAPSANO' : 'NEPROSLO') : 'jen pruzkum');
