#!/usr/bin/env node
// overeni-ui-approve.mjs — schválí požadavek API access v UI SharePoint admin centra a zachytí
// síťové odpovědi (jen POST/PUT/PATCH, bez hlaviček = bez tokenů) + screenshot po kliku i po novém načtení.
// Volitelně --cekat-na-prihlaseni: otevře viditelné okno, počká na ruční přihlášení a pokračuje ve stejném okně.
// Použití: overeni-ui-approve.mjs <profil> <část-textu-řádku> <výstupní-složka>
// Příklad: overeni-ui-approve.mjs pavel.admin 4a212388-1e08-4d67-83a8-0fa6eca855a7 sondy/overeni/api-access/ui
// Profil nesmí být otevřený v jiném Chrome. Vyžaduje playwright-core (sondy/dokumenty/node_modules).
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const [profile, rowText, outDir] = process.argv.slice(2);
if (!profile || !rowText || !outDir || process.argv.includes('--help')) {
  console.log('Použití: overeni-ui-approve.mjs <profil> <část-textu-řádku> <výstupní-složka>'); process.exit(profile ? 0 : 1);
}
fs.mkdirSync(outDir, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profile}`,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: !process.argv.includes('--cekat-na-prihlaseni'), viewport: { width: 1400, height: 1000 }, locale: 'cs-CZ' });
const p = ctx.pages()[0] ?? await ctx.newPage();
const URL = 'https://pavelchocholousgmail-admin.sharepoint.com/_layouts/15/online/AdminHome.aspx#/webApiPermissionManagement';
const log = [];
// tokeny a přihlašovací kódy se do záznamu nikdy neukládají
const cerni = (s) => s
  .replace(/("?(?:access_token|refresh_token|id_token|client_info|code|session_state)"?\s*[:=]\s*\\?"?)[^"\\&,}\s]{8,}/g, '$1[ZACERNENO]')
  .replace(/eyJ[0-9A-Za-z_-]{10,}(?:\.[0-9A-Za-z_-]+){0,2}/g, '[JWT-ZACERNENO]');
const lines = [];
p.on('response', async (r) => {
  const rq = r.request();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(rq.method())) return;
  let body = ''; try { body = (await r.text()).slice(0, 1500); } catch {}
  let req = ''; try { req = (rq.postData() || '').slice(0, 1500); } catch {}
  log.push({ t: new Date().toISOString(), method: rq.method(), url: r.url().replace(/\?.*$/, ''), status: r.status(), request: cerni(req), response: cerni(body) });
});
const pending = async () => (await p.locator('body').innerText()).split('\n').filter((l) => /^(Pending requests|Approved requests|Žádosti čekající na vyřízení|Schválené žádosti)\s*\(/.test(l.trim())).join(' | ');
await p.goto(URL);
if (process.argv.includes('--cekat-na-prihlaseni')) {
  // viditelné okno: člověk se přihlásí (heslo, MFA); čekáme až 10 min, než se objeví stránka API access
  console.log('Čekám na přihlášení v otevřeném okně…');
  for (let i = 0; i < 200; i++) { if (/Pending requests|Approved requests|Žádosti čekající/.test(await p.locator('body').innerText().catch(() => ''))) break; await p.waitForTimeout(3000); }
}
await p.waitForTimeout(15000);
lines.push('před: ' + await pending());
await p.getByText(rowText).first().click(); await p.waitForTimeout(1500);
await p.getByRole('button', { name: /Approve|Schválit/ }).first().click(); await p.waitForTimeout(2500);
await p.locator('button.ms-Button--primary:has-text("Approve"), button.ms-Button--primary:has-text("Schválit")').first().click();
await p.waitForTimeout(1000); await p.screenshot({ path: path.join(outDir, 'po-kliku-1s.png') });
await p.waitForTimeout(8000); await p.screenshot({ path: path.join(outDir, 'po-kliku-9s.png') });
lines.push('po kliku (9 s): ' + await pending());
await p.reload(); await p.waitForTimeout(15000);
await p.screenshot({ path: path.join(outDir, 'po-reloadu.png') });
lines.push('po reloadu: ' + await pending());
fs.writeFileSync(path.join(outDir, 'sitove-odpovedi.json'), JSON.stringify(log, null, 1));
fs.writeFileSync(path.join(outDir, 'pocty.txt'), lines.join('\n') + '\n');
console.log(lines.join('\n')); console.log(`zachyceno odpovědí (POST/PUT/PATCH/DELETE): ${log.length}`);
for (const l of log) console.log(l.status, l.method, l.url);
await ctx.close();
