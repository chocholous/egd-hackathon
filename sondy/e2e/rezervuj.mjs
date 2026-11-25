#!/usr/bin/env node
// rezervuj.mjs - ceka v okne z okno.sh, az clovek zada spolecne heslo vydeje, pak jako ucastnik napise jmeno
// a klikne "Beru tenhle" u zvoleneho uctu. Heslo uctu NEcte a nevypisuje (snimek jen s rozmazanym heslem).
// Pouziti: node sondy/e2e/rezervuj.mjs <profil> <ucet> "<jmeno>" <slozka-dukazu> [cil-url]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const [profil, ucet, jmeno, out, cil] = process.argv.slice(2);
if (!out) { console.log('Pouziti: node sondy/e2e/rezervuj.mjs <profil> <ucet> "<jmeno>" <slozka-dukazu> [cil-url]'); process.exit(2); }
const dir = path.join(process.env.HOME, '.config/ppf-rooms-lab/profily', profil);
const port = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim();
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const b = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const p = b.contexts()[0].pages().filter(x => x.url().includes('azurestaticapps')).at(-1);
const t0 = Date.now(); const ts = () => new Date().toISOString().slice(11, 19);
const tlac = p.locator(`button[data-ucet="${ucet}"]`);
while (!(await tlac.isVisible().catch(() => false))) {
  if (Date.now() - t0 > 30 * 60e3) { console.log(ts(), 'TIMEOUT cekani na heslo'); process.exit(1); }
  await p.waitForTimeout(2000);
}
console.log(ts(), 'seznam uctu viditelny (heslo zadano)');
await p.screenshot({ path: `${out}/02-vydej-seznam.png` });
await p.fill('#jmeno', jmeno);
await tlac.click();
await p.waitForTimeout(3000);
// Heslo NIKDY necist do vystupu. 24. 11. tu byl filtr /heslo:/ na innerText a heslo prosaklo (stitek je na
// samostatnem radku), blur pres CSS taky nezabral. Proto: cerna maska Playwrightu pres list s textem Egd-…,
// a z textu stranky se vypise jen radek "Vas ucet".
await p.evaluate(() => { for (const el of document.querySelectorAll('body *')) if (el.children.length === 0 && /^Egd-\S+$/.test((el.textContent || '').trim())) el.setAttribute('data-e2e-maska', '1'); });
if (await p.locator('[data-e2e-maska]').count()) await p.screenshot({ path: `${out}/03-vydej-rezervovano.png`, mask: [p.locator('[data-e2e-maska]')], maskColor: '#000' });
else console.log(ts(), 'pole hesla nenalezeno, snimek nedelam');
const ucetRadek = (await p.evaluate(() => document.body.innerText)).split('\n').find(l => /^Váš účet:/.test(l.trim()));
console.log(ts(), 'po rezervaci:', ucetRadek ?? 'radek "Vas ucet" nenalezen');
if (cil) { const np = await b.contexts()[0].newPage(); await np.goto(cil).catch(() => {}); console.log(ts(), 'nova karta', cil); }
await b.close().catch(() => {});
