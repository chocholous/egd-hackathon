#!/usr/bin/env node
// Otevře stránku s web partem „AI gateway“ pod uloženým Chrome profilem lab uživatele a klikne whoami / chat / OCR.
import { createRequire } from 'node:module'; import path from 'node:path';
const [profile, url, shot] = process.argv.slice(2);
if (!profile || !url || profile === '--help') { console.log('Použití: tools/ai-spfx-klik.mjs <profil> <url-stránky> [screenshot.png]  (profil z ~/.config/ppf-rooms-lab/profily/)'); process.exit(0); }
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const ctx = await chromium.launchPersistentContext(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profile}`, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1300, height: 1000 } });
const p = ctx.pages()[0] ?? await ctx.newPage();
await p.goto(url, { waitUntil: 'domcontentloaded' });
await p.waitForSelector('#who', { timeout: 90000 }).catch(() => console.log('web part nenalezen, url=', p.url()));
const out = async (label, sel) => { await p.waitForFunction(() => !document.querySelector('#o')?.textContent.startsWith('volám'), null, { timeout: 60000 }).catch(() => {}); console.log(`--- ${label}\n` + (await p.locator('#o').innerText()).slice(0, 900)); };
let t = Date.now(); await p.locator('#who').click(); await p.waitForTimeout(500); await out('whoami'); console.log('wall ms', Date.now() - t);
t = Date.now(); await p.locator('#chat').click(); await p.waitForTimeout(500); await out('chat'); console.log('wall ms', Date.now() - t);
await p.locator('#f').setInputFiles(`${process.env.HOME}/Projects/egd-workshop/sondy/ai/ocr-test.png`);
t = Date.now(); await p.locator('#ocr').click(); await p.waitForTimeout(500); await out('ocr'); console.log('wall ms', Date.now() - t);
if (shot) await p.screenshot({ path: shot }); await ctx.close();
