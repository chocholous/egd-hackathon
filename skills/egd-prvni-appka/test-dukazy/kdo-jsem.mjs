// Pod jakym uctem a s jakou roli bezi ulozeny Chrome profil na danem webu (jen cteni).
// Pouziti: node kdo-jsem.mjs <web url> <profil> [<profil> ...]
// Vypise: profil, UPN z _api/web/currentuser, skupiny webu, EffectiveBasePermissions a odhad role.
import { createRequire } from 'node:module';
import path from 'node:path';
const [web, ...profily] = process.argv.slice(2);
if (!web || !profily.length) { console.log('Pouziti: node kdo-jsem.mjs <web> <profil> ...'); process.exit(2); }
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
async function kdoJsem(p, webUrl) {
  return p.evaluate(async (w) => {
    const g = async (u) => { const r = await fetch(w + u, { headers: { Accept: 'application/json;odata=nometadata' } }); return r.ok ? r.json() : { chyba: r.status }; };
    const u = await g('/_api/web/currentuser?$select=UserPrincipalName,Title,IsSiteAdmin');
    const s = await g('/_api/web/currentuser/groups?$select=Title');
    const perm = await g('/_api/web/EffectiveBasePermissions');
    const hi = Number(perm.High ?? 0); const lo = Number(perm.Low ?? 0);
    // bity SPBasePermissions: AddListItems 0x2, ManageLists 0x800, ManageWeb 0x40000000
    const role = (lo & 0x40000000) ? 'Vlastnik (ManageWeb)' : (lo & 0x2) ? 'Clen (AddListItems)' : 'Ctenar (bez AddListItems)';
    return { upn: u.UserPrincipalName, jmeno: u.Title, adminKolekce: u.IsSiteAdmin, skupiny: (s.value || []).map((x) => x.Title), permHigh: hi, permLow: lo, role };
  }, webUrl);
}
let chyba = 0;
for (const profil of profily) {
  const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`, { executablePath: CHROME, headless: true });
  const p = ctx.pages()[0] ?? await ctx.newPage();
  await p.goto(`${web}/_layouts/15/viewlsts.aspx`, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  const k = await kdoJsem(p, web).catch((e) => ({ chyba: String(e).slice(0, 200) }));
  console.log(`[${new Date().toISOString()}] profil=${profil} web=${web} ${JSON.stringify(k)}`);
  if (!k.upn) chyba++;
  await ctx.close();
}
process.exit(chyba ? 1 : 0);
