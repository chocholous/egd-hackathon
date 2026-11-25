// Cesta A2 (ručně v prohlížeči) pod účtem s omezenou rolí: co uživatel uvidí. Jen čtení + snímky.
// Použití: node jakub-a2-ui.mjs <profil> <web-url> <složka snímků>
import os from 'node:os'; import path from 'node:path'; import fs from 'node:fs'; import { createRequire } from 'node:module';
const { chromium } = createRequire('/opt/homebrew/lib/node_modules/@playwright/cli/package.json')('playwright-core');
const [profil, web0, out] = process.argv.slice(2); const web = web0.replace(/\/+$/, ''); fs.mkdirSync(out, { recursive: true });
const ctx = await chromium.launchPersistentContext(path.join(os.homedir(), '.config/ppf-rooms-lab/profily', profil), { channel: 'chrome', headless: true, viewport: { width: 1300, height: 900 } });
const p = ctx.pages()[0] || await ctx.newPage();
for (const [krok, u] of [['A2-1 obsah webu', '/_layouts/15/viewlsts.aspx'], ['A2-3 katalog', '/AppCatalog/Forms/AllItems.aspx'], ['A2-4 přidat appku', '/_layouts/15/appStore.aspx']]) {
  await p.goto(web + u, { waitUntil: 'domcontentloaded' }).catch(() => {}); await p.waitForTimeout(8000);
  const tl = await p.getByRole('button', { name: /^(Nový|New|Nahrát|Upload)\b/ }).count().catch(() => -1);
  const txt = (await p.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ');
  const hl = (txt.match(/(Přístup odepřen|Access denied|nemáte oprávnění|Nemáte přístup|Požádat o přístup|Request access)[^.]{0,80}/i) || [''])[0];
  const f = `${out}/${krok.replace(/\s+/g, '-')}.png`; await p.screenshot({ path: f });
  console.log(JSON.stringify({ krok, url: p.url().slice(0, 110), tlacitka_novy_nahrat: tl, hlaska: hl, snimek: path.basename(f) }));
}
await ctx.close();
