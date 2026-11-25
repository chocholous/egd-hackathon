// Jen cteni: pod ulozenym Chrome profilem lab uzivatele (bez hesla) zavola GET REST adresy webu a vypise JSON.
// Pouziti: node rest-cteni.mjs <web url> <profil> <cesta1> [cesta2 ...]   (cesta zacina /_api/...)
import { createRequire } from 'node:module';
import path from 'node:path';
const [web, profil, ...cesty] = process.argv.slice(2);
if (!web || !profil || !cesty.length) { console.log('Pouziti: node rest-cteni.mjs <web> <profil> </_api/...> [...]'); process.exit(2); }
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = ctx.pages()[0] ?? await ctx.newPage();
await p.goto(`${web}/_layouts/15/viewlsts.aspx`, { waitUntil: 'domcontentloaded', timeout: 90000 });
for (const c of cesty) {
  const r = await p.evaluate(async (u) => { const x = await fetch(u, { headers: { Accept: 'application/json;odata=nometadata' } }); return { status: x.status, telo: x.ok ? await x.json() : (await x.text()).slice(0, 300) }; }, web + c);
  console.log(`${c}\n${JSON.stringify(r)}`);
}
await ctx.close();
