import pptxgen from 'pptxgenjs';
import { title, rows, sum, fmtKc, fmtDate, pangram } from './data.mjs';
export async function genPptx() {
  const p = new pptxgen(); p.layout = 'LAYOUT_WIDE';
  const s1 = p.addSlide(); s1.addText(title, { x: 0.5, y: 1.5, w: 12, h: 1.2, fontSize: 36, bold: true, color: 'E30613', fontFace: 'Calibri' });
  s1.addText(pangram, { x: 0.5, y: 3, w: 12, h: 1, fontSize: 18, fontFace: 'Calibri' });
  const s2 = p.addSlide(); s2.addText('Revize – seznam', { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true });
  const hdr = ['Zařízení', 'Technik', 'Termín', 'Stav', 'Náklad'].map((t) => ({ text: t, options: { bold: true, fill: { color: 'E30613' }, color: 'FFFFFF' } }));
  s2.addTable([hdr, ...rows.map((r) => [r.zarizeni, r.technik, fmtDate(r.termin), r.stav, fmtKc(r.naklad)]), [{ text: 'Celkem', options: { bold: true } }, '', '', '', { text: fmtKc(sum), options: { bold: true } }]], { x: 0.5, y: 1.2, w: 12, fontSize: 14, border: { type: 'solid', color: 'CCCCCC', pt: 1 } });
  const s3 = p.addSlide(); s3.addText('Náklady podle zařízení', { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true });
  s3.addChart(p.charts.BAR, [{ name: 'Náklad (Kč)', labels: rows.map((r) => r.zarizeni.slice(0, 18)), values: rows.map((r) => r.naklad) }], { x: 0.5, y: 1.2, w: 12, h: 5.5, showLegend: false });
  return new Uint8Array(await p.write({ outputType: 'arraybuffer' }));
}
