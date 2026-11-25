import pdfMake from 'pdfmake/build/pdfmake.js';
import { title, rows, sum, fmtKc, fmtDate } from './data.mjs';
// ttfBytes: Uint8Array; do virtuálního FS pdfmake dáme base64 / buffer
export function genPdfMake(ttfRegular, ttfBold) {
  const b64 = (u) => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  pdfMake.addVirtualFileSystem({ 'R.ttf': b64(ttfRegular), 'B.ttf': b64(ttfBold) });
  pdfMake.addFonts({ Roboto: { normal: 'R.ttf', bold: 'B.ttf', italics: 'R.ttf', bolditalics: 'B.ttf' } });
  const dd = { defaultStyle: { font: 'Roboto', fontSize: 10 }, content: [
    { text: title, fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
    { table: { headerRows: 1, widths: ['auto', '*', '*', 'auto', 'auto'], body: [
      ['#', 'Zařízení', 'Technik', 'Termín', 'Náklad'].map((t) => ({ text: t, bold: true })),
      ...rows.map((r) => [r.id, r.zarizeni, r.technik, fmtDate(r.termin), { text: fmtKc(r.naklad), alignment: 'right' }]),
      ['', { text: 'Celkem', bold: true }, '', '', { text: fmtKc(sum), bold: true, alignment: 'right' }] ] } },
  ] };
  return pdfMake.createPdf(dd).getBuffer();
}
