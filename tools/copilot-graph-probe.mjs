#!/usr/bin/env node
// Zavolá Microsoft 365 Copilot API (Graph beta /copilot/retrieval a /copilot/conversations) pod lab uživatelem
// BEZ hesla: v jeho přihlášeném Chrome profilu otevře SharePoint stránku a token pro Graph si vyžádá stejně jako SPFx
// (aadTokenProviderFactory moderní stránky → token principalu „SharePoint Online Web Client Extensibility“ 08e18876, jeho granty;
// POST /_api/SP.OAuth.Token/Acquire pro Graph vrací 400 „Resource is not allowed“).
// Zapisuje jen do výstupní složky; v tenantu nic nemění (Copilot konverzace se ale v tenantu založí, je to jeho funkce).
import { createRequire } from 'node:module'; import path from 'node:path'; import fs from 'node:fs';
const args = process.argv.slice(2);
if (!args.length || args.includes('--help')) {
  console.log(`Použití: node tools/copilot-graph-probe.mjs <profil> <url-webu> <výstupní-složka> [--dotaz "<text>"] [--jen retrieval|chat]
  profil   složka v ~/.config/ppf-rooms-lab/profily/ nebo absolutní cesta ke kopii profilu (cp -cR, když ho drží jiná session)
  url-webu např. https://<tenant>.sharepoint.com/sites/<web> (z něj Retrieval hledá: filterExpression Path:"<url-webu>")
  --filtr   KQL filterExpression pro Retrieval (výchozí Path:"<url-webu>"); --bez-filtru = celý tenant
  --stranka moderní stránka, na které běží SPFx (výchozí url-webu)
  --dotaz  výchozí „Shrň jednou větou, o čem jsou dokumenty na tomto webu.“
Výstup: copilot-graph.json (stav, čas, scp tokenu, odpověď zkrácená na 4000 znaků; token se neukládá).`);
  process.exit(0);
}
const [profile, site, outDir] = args;
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const dotaz = opt('--dotaz', 'Shrň jednou větou, o čem jsou dokumenty na tomto webu.');
const jen = opt('--jen', '');
const filtr = args.includes('--bez-filtru') ? '' : opt('--filtr', `Path:"${site}"`);
const ROOT = path.join(process.env.HOME, 'Projects/egd-workshop');
fs.mkdirSync(outDir, { recursive: true });
const { chromium } = createRequire(path.join(ROOT, 'sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(path.isAbsolute(profile) ? profile : `${process.env.HOME}/.config/ppf-rooms-lab/profily/${profile}`,
  { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = ctx.pages()[0] ?? await ctx.newPage();
await p.goto(opt('--stranka', site), { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(8000);
const out = await p.evaluate(async ({ site, dotaz, jen, filtr }) => {
  const o = { cas: new Date().toISOString() };
  // token pro Graph stejně jako SPFx web part: aadTokenProviderFactory z kontextu stránky (MSAL, SSO, bez hesla)
  let tok;
  o.url = location.href;
  for (let i = 0; i < 60 && !window.moduleLoaderPromise; i++) await new Promise((r) => setTimeout(r, 1000));  // pomalé načtení stránky
  try { const ml = await window.moduleLoaderPromise; const prov = await ml.context._aadTokenFactory.getTokenProvider();
    tok = await prov.getToken('https://graph.microsoft.com'); o.tokenZdroj = 'moduleLoaderPromise.context._aadTokenFactory'; }
  catch (e) { o.tokenChyba = String(e).slice(0, 800); return o; }
  const c = JSON.parse(atob(tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  o.token = { upn: c.upn, appid: c.appid, app_displayname: c.app_displayname, scp: c.scp };
  const g = async (k, url, body) => { const t = Date.now(); const r = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const txt = await r.text(); o[k] = { stav: r.status, ms: Date.now() - t, odpoved: txt.slice(0, 4000) }; return { r, txt }; };
  if (jen !== 'chat') await g('retrieval', 'https://graph.microsoft.com/beta/copilot/retrieval',
    { queryString: dotaz, dataSource: 'sharePoint', ...(filtr ? { filterExpression: filtr } : {}), maximumNumberOfResults: 5, resourceMetadata: ['title', 'author'] });
  if (jen !== 'retrieval') {
    const { r, txt } = await g('konverzace', 'https://graph.microsoft.com/beta/copilot/conversations', {});
    if (r.ok) { const id = JSON.parse(txt).id; await g('chat', `https://graph.microsoft.com/beta/copilot/conversations/${id}/chat`,
      { message: { text: dotaz }, locationHint: { timeZone: 'Europe/Prague' } }); }
  }
  return o;
}, { site, dotaz, jen, filtr });
out.profil = profile; out.web = site; out.dotaz = dotaz;
fs.writeFileSync(path.join(outDir, 'copilot-graph.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await ctx.close();
