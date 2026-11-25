// Šablona = .docx s {značkami}; v SPFx se stáhne z knihovny (SPHttpClient), tady ji vyrobíme knihovnou docx
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { title, rows, sum, fmtKc, fmtDate } from './data.mjs';
export async function makeTemplate() {
  const c = (t) => new TableCell({ children: [new Paragraph({ children: [new TextRun(t)] })] });
  const doc = new Document({ sections: [{ children: [
    new Paragraph({ children: [new TextRun({ text: '{nazev}', bold: true, size: 32 })] }),
    new Paragraph({ children: [new TextRun('Vytvořil: {autor}, dne {datum}')] }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
      new TableRow({ children: ['Zařízení', 'Technik', 'Termín', 'Náklad'].map(c) }),
      new TableRow({ children: ['{#radky}{zarizeni}', '{technik}', '{termin}', '{naklad}{/radky}'].map(c) }),
    ] }),
    new Paragraph({ children: [new TextRun('Celkem: {celkem}')] }),
  ] }] });
  return new Uint8Array(await Packer.toArrayBuffer(doc));
}
export async function genDocxFromTemplate(tplBytes) {
  const zip = new PizZip(tplBytes);
  const d = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  d.render({ nazev: title, autor: 'Žofie Příhodová', datum: fmtDate('2026-11-22'), celkem: fmtKc(sum),
    radky: rows.map((r) => ({ zarizeni: r.zarizeni, technik: r.technik, termin: fmtDate(r.termin), naklad: fmtKc(r.naklad) })) });
  return d.getZip().generate({ type: 'uint8array', compression: 'DEFLATE' });
}
