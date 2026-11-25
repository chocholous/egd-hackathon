// Ověří, že Graph ?format=pdf jde volat z JS v prohlížeči (fetch s Authorization, CORS, redirect na předpodepsané URL)
import { chromium } from 'playwright-core';
const [token, site, id] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage(); await p.goto('https://pavelchocholousgmail.sharepoint.com/_layouts/15/error.aspx').catch(()=>{});
await p.goto('https://example.org/');
console.log('origin', await p.evaluate(() => location.origin));
console.log(await p.evaluate(async ([t, s, i]) => { try { const r = await fetch(`https://graph.microsoft.com/v1.0/sites/${s}/drive/items/${i}/content?format=pdf`, { headers: { Authorization: 'Bearer ' + t } }); const buf = await r.arrayBuffer(); return `status=${r.status} redirected=${r.redirected} bytes=${buf.byteLength} magic=${new TextDecoder().decode(buf.slice(0,5))}`; } catch (e) { return 'ERR ' + e.message; } }, [token, site, id]));
await b.close();
