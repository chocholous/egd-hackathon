#!/usr/bin/env node
// dotaz.mjs — otevře stránku SharePointu v běžícím Chrome profilu (CDP, nový panel, na konci zavře),
// klikne na tlačítko „Copilot“ (selektor volitelný), napíše dotaz do pole panelu, odešle Enterem,
// počká a uloží snímek + text všech rámců.
// Použití: node dotaz.mjs <profil> <url> <složka> "<dotaz>" [--klik "<css>"] [--pole "<text placeholderu>"] [--cekej <s>] [--vyber "<text řádku>"]
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const a = process.argv.slice(2);
if (!a.length || a.includes('--help')) { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 6).join('\n')); process.exit(0); }
const opt = (n, d) => { const i = a.indexOf(n); return i >= 0 ? a.splice(i, 2)[1] : d; };
const klik = opt('--klik', "[aria-label='Copilot']"), pole = opt('--pole', 'Ask a question'), cekej = +opt('--cekej', 40), vyber = opt('--vyber', '');
const [profil, url, out, dotaz] = a; fs.mkdirSync(out, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const zdroj = `${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}`;
const port = fs.readFileSync(path.join(zdroj, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim();
const br = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const p = await br.contexts()[0].newPage(); await p.setViewportSize({ width: 1400, height: 1000 });
try {
  await p.goto(url); await p.waitForTimeout(7000);
  if (vyber) { await p.getByText(vyber, { exact: true }).first().click(); await p.waitForTimeout(1500); }
  if (klik !== 'ne') { await p.locator(klik).first().click(); await p.waitForTimeout(15000); }
  await p.screenshot({ path: path.join(out, '1-otevreno.png') });
  if (dotaz) {
    let box = null;
    for (const f of p.frames()) { const l = f.getByPlaceholder(new RegExp(pole, 'i')).first(); if (await l.count()) { box = l; break; }
      const l2 = f.locator(`[aria-label*="${pole}"],[data-placeholder*="${pole}"]`).first(); if (await l2.count()) { box = l2; break; } }
    if (!box) throw new Error('pole pro dotaz nenalezeno');
    await p.mouse.click(1200, 929); /* pole je dole v pravém panelu; textarea v DOM je skrytý stín */ await p.keyboard.type(dotaz, { delay: 15 }); await p.keyboard.press('Enter');
    await p.waitForTimeout(cekej * 1000);
    await p.screenshot({ path: path.join(out, '2-odpoved.png') });
  }
  const txt = []; for (const f of p.frames()) { try { txt.push(`## ${f.url().slice(0, 100)}\n` + (await f.locator('body').innerText({ timeout: 3000 })).slice(0, 6000)); } catch {} }
  fs.writeFileSync(path.join(out, 'text.txt'), txt.join('\n\n')); console.log(txt.join('\n\n').slice(-3500));
} finally { await p.close(); await br.close().catch(() => {}); }
