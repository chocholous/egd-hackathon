import ExcelJS from 'exceljs';
import { rows, sum } from './data.mjs';
export async function genExcelJs() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Revize');
  ws.columns = [
    { header: '#', key: 'id', width: 5 }, { header: 'Zařízení', key: 'zarizeni', width: 38 },
    { header: 'Technik', key: 'technik', width: 26 }, { header: 'Termín', key: 'termin', width: 14, style: { numFmt: 'd. m. yyyy' } },
    { header: 'Stav', key: 'stav', width: 14 }, { header: 'Náklad (Kč)', key: 'naklad', width: 14, style: { numFmt: '#,##0 "Kč"' } },
  ];
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE30613' } };
  rows.forEach((r) => ws.addRow({ ...r, termin: new Date(r.termin + 'T00:00:00Z') }));
  const t = ws.addRow({ zarizeni: 'Celkem', naklad: { formula: `SUM(F2:F${rows.length + 1})`, result: sum } });
  t.font = { bold: true };
  return new Uint8Array(await wb.xlsx.writeBuffer());
}
