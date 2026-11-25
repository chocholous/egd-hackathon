import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { title, rows, sum, fmtKc, fmtDate, pangram } from './data.mjs';
export async function genDocx() {
  const cell = (t, bold = false, right = false) => new TableCell({ children: [new Paragraph({ alignment: right ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [new TextRun({ text: String(t), bold })] })] });
  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [{ children: [
      new Paragraph({ heading: HeadingLevel.HEADING_1, text: title }),
      new Paragraph({ children: [new TextRun(pangram)] }),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
        new TableRow({ tableHeader: true, children: ['#', 'Zařízení', 'Technik', 'Termín', 'Stav', 'Náklad'].map((h) => cell(h, true)) }),
        ...rows.map((r) => new TableRow({ children: [cell(r.id), cell(r.zarizeni), cell(r.technik), cell(fmtDate(r.termin)), cell(r.stav), cell(fmtKc(r.naklad), false, true)] })),
        new TableRow({ children: [cell(''), cell('Celkem', true), cell(''), cell(''), cell(''), cell(fmtKc(sum), true, true)] }),
      ] }),
    ] }],
  });
  return new Uint8Array(await Packer.toArrayBuffer(doc));
}
