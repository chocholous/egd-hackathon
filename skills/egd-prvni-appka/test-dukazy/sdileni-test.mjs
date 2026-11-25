// Z5: sdílení webu s appkou spolužákovi, aby mohl hlasovat. Kroky:
//   pred  <web> <stranka> <profil spoluzaka>      - spolužák otevře appku (čekáme „nemáte přístup“)
//   sdilet <web> <profil vlastnika> <upn> <role>  - vlastník: ⚙ → Oprávnění webu → Sdílet web → jen web,
//                                                   přidá upn s rolí (Upravit = Členové), e-mail vypnutý
//   hlas  <web> <stranka> <profil spoluzaka> <n>  - spolužák otevře appku a klikne na n
// Profil lab uživatele bez hesla (~/.config/ppf-rooms-lab/profily/<profil>).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [krok, web, a3, a4, a5] = process.argv.slice(2);
const out = path.join(path.dirname(new URL(import.meta.url).pathname), 'z5-sdileni');
fs.mkdirSync(out, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const profil = krok === 'sdilet' ? a3 : a4;
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1400, height: 950 }, locale: 'cs-CZ' });
const p = ctx.pages()[0] ?? await ctx.newPage();
const shot = (n) => p.screenshot({ path: `${out}/${krok}-${n}.png` });
const ramce = () => p.frames();
const najdi = async (sel) => { for (const f of ramce()) { const l = f.locator(sel); if (await l.count().catch(() => 0)) return l.first(); } return null; };
const klik = async (sel, popis) => { const l = await najdi(sel); console.log(`klik ${popis}:`, !!l); if (l) await l.click({ timeout: 15000 }).catch((e) => console.log('  chyba', e.message.split('\n')[0])); return !!l; };
let ok = false;
if (krok === 'pred' || krok === 'hlas') {
  await p.goto(`${web}/SitePages/${a3}?env=WebView`, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  const g = p.locator('[role=group][aria-label^="Hodnocení"]');
  await g.waitFor({ timeout: 45000 }).catch(() => {});
  console.log('url:', p.url().split('?')[0], '| appka:', await g.count());
  await shot('1');
  if (krok === 'pred') ok = !(await g.count());
  else if (await g.count()) {
    await p.locator(`button[aria-label^="${a5} "]`).click();
    const st = p.locator('[role=status], [role=alert]');
    await st.first().waitFor({ timeout: 30000 }).catch(() => {});
    const t = await st.allTextContents(); console.log('zprava:', JSON.stringify(t));
    await shot('2'); ok = t.some((x) => /Zapsáno|Změněno/.test(x));
  }
} else if (krok === 'sdilet') {
  const [upn, role] = [a4, a5 || 'Upravit'];
  await p.goto(web, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await p.waitForTimeout(8000);
  await klik('button[aria-label="Nastavení"], button#O365_MainLink_Settings', 'Nastavení (⚙)');
  await p.waitForTimeout(2500); await shot('1-nastaveni');
  await klik('text=Oprávnění k webu', 'Oprávnění k webu');
  await p.waitForTimeout(4000); await shot('2-panel');
  await klik('button:has-text("Sdílet web")', 'Sdílet web');
  await p.waitForTimeout(3000); await shot('3-sdilet');
  await klik('text=Sdílet jenom web', 'Sdílet jenom web');
  await p.waitForTimeout(3000); await shot('4-jen-web');
  const pole = await najdi('input[aria-label*="jména"], input[placeholder*="jméno"], input[placeholder*="Zadejte"], .ms-BasePicker-input');
  console.log('pole jmen:', !!pole);
  if (pole) { await pole.click(); await pole.fill(upn); await p.waitForTimeout(4000); await shot('5-hledani'); await p.keyboard.press('Enter'); await p.waitForTimeout(2500); }
  // role: výchozí bývá Číst; pro hlasování je potřeba Upravit
  // role: pod jménem je roletka s výchozím „Číst“; pro hlasování je potřeba „Upravit“
  await klik('button:has-text("Číst"), [role=button]:has-text("Číst")', 'roletka role');
  await p.waitForTimeout(1500); await shot('5b-role');
  const polozka = p.locator('[role=menu], .ms-ContextualMenu').getByText(role, { exact: true });
  console.log(`role ${role} v nabidce:`, await polozka.count());
  if (await polozka.count()) await polozka.first().click();
  await p.waitForTimeout(1500);
  // e-mail s pozvánkou vypnout
  const mail = p.getByRole('checkbox', { name: /Poslat e-mail/ });
  console.log('e-mail zaskrtnuty pred:', await mail.isChecked().catch(() => 'nenalezen'));
  if (await mail.isChecked().catch(() => false)) await mail.click({ force: true });
  console.log('e-mail zaskrtnuty po:', await mail.isChecked().catch(() => 'nenalezen'));
  await p.waitForTimeout(1500); await shot('6-pred-pridanim');
  const texty = []; for (const f of ramce()) texty.push(...await f.evaluate(() => [...document.querySelectorAll('button,[role=checkbox],label')].filter((e) => e.offsetParent).map((e) => (e.innerText || e.getAttribute('aria-label') || '').trim()).filter(Boolean)).catch(() => []));
  console.log('ovladaci prvky:', JSON.stringify([...new Set(texty)].slice(0, 60)));
  if (process.env.Z5_PRIDAT === '1') {
    const pridat = p.getByRole('button', { name: 'Přidat', exact: true });
    console.log('tlacitko Pridat:', await pridat.count());
    if (await pridat.count()) { await pridat.last().click(); ok = true; }
    await p.waitForTimeout(6000); await shot('7-po-pridani');
  } else console.log('Z5_PRIDAT neni 1: jen pruzkum, nic nepridano');
}
await ctx.close();
console.log(ok ? 'VYSLEDEK OK' : 'VYSLEDEK NE');
process.exit(ok ? 0 : 1);
