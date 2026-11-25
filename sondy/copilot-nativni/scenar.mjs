#!/usr/bin/env node
// scenar.mjs — pojmenované scénáře klikání v SharePointu pod egd10 (běžící Chrome, CDP, nový panel, na konci zavře).
// Použití: node scenar.mjs <profil> <scénář> <složka>      scénáře: agent | editor | stranka | chat-agenti
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const [profil, sc, out] = process.argv.slice(2);
if (!sc || sc === '--help') { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 4).join('\n')); process.exit(0); }
fs.mkdirSync(out, { recursive: true });
const { chromium } = createRequire(path.join(process.env.HOME, 'Projects/egd-workshop/sondy/dokumenty/'))('playwright-core');
const port = fs.readFileSync(`${process.env.HOME}/.config/ppf-rooms-lab/profily/${profil}/DevToolsActivePort`, 'utf8').split('\n')[0].trim();
const br = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const p = await br.contexts()[0].newPage(); await p.setViewportSize({ width: 1400, height: 1000 });
const S = 'https://pavelchocholousgmail.sharepoint.com/sites/egd-ukazky';
const shot = (n) => p.screenshot({ path: path.join(out, n + '.png') });
const txt = async (n) => { const t = []; for (const f of p.frames()) { try { t.push(`## ${f.url().slice(0, 90)}\n` + (await f.locator('body').innerText({ timeout: 3000 })).slice(0, 5000)); } catch {} } fs.writeFileSync(path.join(out, n + '.txt'), t.join('\n\n')); };
try {
  if (sc === 'agent') {
    await p.goto(`${S}/Sdilene%20dokumenty/exporty`); await p.waitForTimeout(7000);
    await p.mouse.click(900, 400); await p.mouse.click(900, 351, { modifiers: ['Control'] }); await p.waitForTimeout(1500); await shot('vybrano');
    await p.locator("[aria-label='Show Copilot actions for selected items']").first().click(); await p.waitForTimeout(1000); await shot('menu-vyber');
    const novy = []; p.context().on('page', (q) => novy.push(q));
    await p.mouse.click(789, 259); await p.waitForTimeout(25000);
    await shot('create-agent'); await txt('create-agent');
    fs.writeFileSync(path.join(out, 'nove-panely.txt'), novy.map((q) => q.url()).join('\n'));
    for (const [i, q] of novy.entries()) { await q.screenshot({ path: path.join(out, `popup${i}.png`) }).catch(() => {}); console.log('popup', q.url().slice(0, 160)); await q.close().catch(() => {}); }
  } else if (sc === 'editor') {
    await p.goto(`${S}/SitePages/Home.aspx`); await p.waitForTimeout(6000);
    await p.mouse.click(1334, 165); await p.waitForTimeout(12000);
    await shot('editor'); await txt('editor');
    await p.mouse.click(700, 330); await p.waitForTimeout(1500); await shot('editor-klik');
    await p.keyboard.press('Control+/'); await p.waitForTimeout(3000); await shot('editor-copilot'); await txt('editor-klik');
  } else if (sc === 'stranka') {
    await p.goto(`${S}/SitePages`); await p.waitForTimeout(6000);
    await p.getByText('Create or upload', { exact: true }).first().click(); await p.waitForTimeout(1500); await shot('new-menu');
    await txt('new-menu');
  } else if (sc === 'autofill') {
    await p.goto(`${S}/Lists/Spokojenost/AllItems.aspx`); await p.waitForTimeout(7000);
    await p.getByText('Add column', { exact: true }).first().click(); await p.waitForTimeout(2000); await shot('add-column'); await txt('add-column');
  } else if (sc === 'editor-prompt') {
    await p.goto(`${S}/SitePages/copilot-test.aspx`); await p.waitForTimeout(7000);
    await p.getByText('Edit', { exact: true }).first().click(); await p.waitForTimeout(12000); await shot('editor-otevren');
    await p.mouse.click(1309, 82).catch(() => {}); await p.waitForTimeout(800);
    await p.mouse.click(1170, 930); await p.keyboard.type(process.argv[5] || 'Napiš úvodní odstavec o spokojenosti zaměstnanců s prostředím kanceláře.', { delay: 15 }); await p.keyboard.press('Enter');
    await p.waitForTimeout(45000); await shot('editor-prompt'); await txt('editor-prompt');
  } else if (sc === 'chat-dotaz') {
    await p.goto('https://m365.cloud.microsoft/chat'); await p.waitForTimeout(10000);
    await p.mouse.click(830, 476); await p.keyboard.type(process.argv[5] || 'Najdi na SharePointu v knihovně exporty soubor spokojenost.docx a shrň ho ve dvou větách česky.', { delay: 15 }); await p.keyboard.press('Enter');
    await p.waitForTimeout(60000); await shot('chat-dotaz'); await txt('chat-dotaz');
  } else if (sc === 'autofill-knihovna') {
    await p.goto(`${S}/Sdilene%20dokumenty/exporty`); await p.waitForTimeout(7000);
    await p.getByText('Add column', { exact: true }).first().click(); await p.waitForTimeout(2500); await shot('add-column-knihovna'); await txt('add-column-knihovna');
  } else if (sc === 'webpart') {
    await p.goto(`${S}/SitePages/copilot-test.aspx`); await p.waitForTimeout(7000);
    await p.getByText('Edit', { exact: true }).first().click(); await p.waitForTimeout(12000);
    await p.mouse.click(631, 141); await p.waitForTimeout(2500);
    await p.keyboard.type('agent', { delay: 40 }); await p.waitForTimeout(3000); await shot('webpart-agent'); await txt('webpart-agent');
  } else if (sc === 'bez-licence') {
    await p.goto(`${S}/Sdilene%20dokumenty/exporty`); await p.waitForTimeout(8000); await shot('knihovna'); await txt('knihovna');
    await p.goto('https://m365.cloud.microsoft/chat'); await p.waitForTimeout(12000); await shot('chat'); await txt('chat');
  } else if (sc === 'chat-agenti') {
    await p.goto('https://m365.cloud.microsoft/chat'); await p.waitForTimeout(8000);
    await p.mouse.click(66, 278); await p.waitForTimeout(15000); await shot('agenti-1'); await p.mouse.click(66, 278); await p.waitForTimeout(8000);
    await shot('agenti'); await txt('agenti');
  }
  console.log('hotovo', sc);
} catch (e) { console.log('CHYBA', sc, String(e).slice(0, 400)); await shot('chyba').catch(() => {}); await txt('chyba').catch(() => {}); }
finally { await p.close(); await br.close().catch(() => {}); }
