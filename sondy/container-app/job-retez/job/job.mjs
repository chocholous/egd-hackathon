// Řetěz v jednom běhu Container Apps Jobu: ČNB kurzy → shrnutí přes LLM gateway → docx → PDF (Container App s LibreOffice)
// → e-mail s přílohami (Graph sendMail ze sdílené schránky). Všechno pod jednou user-assigned managed identitou, bez tajemství.
// Konfigurace jen z prostředí (viz REQUIRED níž). Lokálně: --dry-run (jen ČNB + docx do ./out), tokeny pak nejsou potřeba.
import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, TextRun, WidthType } from 'docx';
import { writeFile, mkdir } from 'node:fs/promises';

const DRY = process.argv.includes('--dry-run');
const REQUIRED = ['CNB_URL', ...(DRY ? [] : ['AZURE_CLIENT_ID', 'GATEWAY_URL', 'GATEWAY_APP_ID', 'GATEWAY_APP_KEY', 'PDF_URL', 'PDF_APP_ID', 'MAIL_SENDER', 'MAIL_TO'])];
const E = Object.fromEntries(REQUIRED.map((k) => { if (!process.env[k]) { console.error(`chybí ${k}`); process.exit(2); } return [k, process.env[k]]; }));
const t0 = Date.now();
const log = (krok, data) => console.log(JSON.stringify({ krok, ms: Date.now() - t0, ...data }));

async function miToken(resource) {
  const u = `${process.env.IDENTITY_ENDPOINT}?resource=${encodeURIComponent(resource)}&api-version=2019-08-01&client_id=${E.AZURE_CLIENT_ID}`;
  const r = await fetch(u, { headers: { 'X-IDENTITY-HEADER': process.env.IDENTITY_HEADER } });
  if (!r.ok) throw new Error(`MI token ${resource}: ${r.status} ${(await r.text()).slice(0, 300)}`);
  return (await r.json()).access_token;
}
const claims = (t) => { const p = JSON.parse(Buffer.from(t.split('.')[1], 'base64url')); return { aud: p.aud, roles: p.roles, oid: p.oid, azp: p.azp || p.appid }; };

// 1) ČNB
const cnb = await fetch(E.CNB_URL);
if (!cnb.ok) throw new Error(`ČNB ${cnb.status}`);
const rates = (await cnb.json()).rates;
const day = rates[0].validFor;
const per1 = (r) => r.rate / r.amount;
log('cnb', { http: cnb.status, meny: rates.length, den: day });

// 2) LLM gateway (aplikační role Gateway.App)
let shrnuti = '(dry-run: bez LLM)'; let llm = {};
if (!DRY) {
  const tok = await miToken(`api://${E.GATEWAY_APP_ID}`);
  log('token-gateway', claims(tok));
  const tabulka = rates.map((r) => `${r.currencyCode} ${per1(r).toFixed(4)}`).join(', ');
  const r = await fetch(`${E.GATEWAY_URL.replace(/\/$/, '')}/api/chat`, {
    method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json', 'X-App-Id': E.GATEWAY_APP_KEY },
    body: JSON.stringify({ max_tokens: 400, prompt: `Jsi analytik. Česky, 4–6 vět, bez odrážek: shrň kurzy ČNB ze dne ${day} (CZK za 1 jednotku): ${tabulka}. Zmiň EUR, USD, GBP a PLN.` }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`gateway ${r.status}: ${JSON.stringify(j).slice(0, 300)}`);
  shrnuti = j.text; llm = { http: r.status, model: j.model, tokens: j.usage?.total_tokens, costUsd: j.costUsd, gatewayMs: j.ms };
  log('llm', { ...llm, znaku: shrnuti.length });
}

// 3) docx
const cell = (t, bold = false) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(t), bold })] })] });
const doc = new Document({ sections: [{ children: [
  new Paragraph({ text: `Denní report kurzů ČNB – ${day}`, heading: HeadingLevel.HEADING_1 }),
  new Paragraph({ text: 'Shrnutí (LLM gateway)', heading: HeadingLevel.HEADING_2 }),
  new Paragraph({ text: shrnuti }),
  new Paragraph({ text: 'Kurzy', heading: HeadingLevel.HEADING_2 }),
  new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    new TableRow({ children: ['Země', 'Měna', 'Kód', 'Množství', 'Kurz CZK'].map((h) => cell(h, true)) }),
    ...rates.map((r) => new TableRow({ children: [r.country, r.currency, r.currencyCode, r.amount, r.rate.toFixed(3)].map((v) => cell(v)) })),
  ] }),
  new Paragraph({ text: `Vygenerováno Container Apps Jobem ${new Date().toISOString()}.` }),
] }] });
const docx = await Packer.toBuffer(doc);
log('docx', { bajty: docx.length });
if (DRY) { await mkdir('out', { recursive: true }); await writeFile(`out/report-${day}.docx`, docx); log('hotovo', { soubor: `out/report-${day}.docx` }); process.exit(0); }

// 4) PDF (Container App s LibreOffice, aplikační role Dokumenty.App)
const ptok = await miToken(`api://${E.PDF_APP_ID}`);
log('token-pdf', claims(ptok));
const p = await fetch(`${E.PDF_URL.replace(/\/$/, '')}/api/pdf?ext=docx`, { method: 'POST', headers: { Authorization: `Bearer ${ptok}`, 'Content-Type': 'application/octet-stream' }, body: docx });
if (p.status !== 200) throw new Error(`PDF ${p.status}: ${(await p.text()).slice(0, 300)}`);
const pdf = Buffer.from(await p.arrayBuffer());
log('pdf', { http: p.status, bajty: pdf.length, serverConvertMs: p.headers.get('x-convert-ms'), magic: pdf.subarray(0, 5).toString() });

// 5) e-mail (Graph, Exchange RBAC for Applications omezuje identitu na jednu schránku)
const gtok = await miToken('https://graph.microsoft.com');
const att = (name, type, buf) => ({ '@odata.type': '#microsoft.graph.fileAttachment', name, contentType: type, contentBytes: buf.toString('base64') });
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const m = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(E.MAIL_SENDER)}/sendMail`, {
  method: 'POST', headers: { Authorization: `Bearer ${gtok}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ saveToSentItems: false, message: {
    subject: `Denní report kurzů ČNB ${day} (řetěz Job → LLM → PDF)`,
    body: { contentType: 'HTML', content: `<p><b>Shrnutí:</b> ${esc(shrnuti)}</p><p>V příloze report jako PDF a docx (${rates.length} měn).</p>` },
    toRecipients: E.MAIL_TO.split(',').map((a) => ({ emailAddress: { address: a.trim() } })),
    attachments: [att(`report-cnb-${day}.pdf`, 'application/pdf', pdf),
      att(`report-cnb-${day}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', docx)] } }),
});
log('mail', { http: m.status, odesilatel: E.MAIL_SENDER, prijemci: E.MAIL_TO, chyba: m.ok ? undefined : (await m.text()).slice(0, 300) });
if (!m.ok) process.exit(1);
log('hotovo', { den: day, llm, pdfBajty: pdf.length, docxBajty: docx.length });
