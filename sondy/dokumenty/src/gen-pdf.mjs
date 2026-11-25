import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { title, rows, sum, fmtKc, fmtDate, pangram } from './data.mjs';
// ttfBytes: Uint8Array s TTF s češtinou (v SPFx fetch ze sdílené knihovny / bundle jako asset)
export async function genPdfLib(ttfBytes) {
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(ttfBytes, { subset: true });
  const page = pdf.addPage([595, 842]); let y = 790;
  page.drawText(title, { x: 40, y, size: 16, font, color: rgb(0.89, 0.02, 0.07) }); y -= 24;
  page.drawText(pangram.split('. ')[0] + '.', { x: 40, y, size: 10, font }); y -= 28;
  for (const r of rows) { page.drawText(`${r.id}. ${r.zarizeni} | ${r.technik} | ${fmtDate(r.termin)} | ${r.stav}`, { x: 40, y, size: 9, font }); page.drawText(fmtKc(r.naklad), { x: 480, y, size: 9, font }); y -= 16; }
  page.drawText('Celkem: ' + fmtKc(sum), { x: 40, y: y - 8, size: 11, font });
  return pdf.save();
}
export async function genPdfLibStdFont() { // dokumentuje past: standardní font nemá ě š č ř ž
  const pdf = await PDFDocument.create(); const f = await pdf.embedFont(StandardFonts.Helvetica);
  pdf.addPage().drawText('Příliš žluťoučký kůň', { font: f }); return pdf.save();
}
