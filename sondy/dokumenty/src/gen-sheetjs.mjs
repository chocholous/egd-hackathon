import * as XLSX from 'xlsx';
import { rows } from './data.mjs';
export function genSheetJs() {
  const aoa = [['#', 'Zařízení', 'Technik', 'Termín', 'Stav', 'Náklad (Kč)'], ...rows.map((r) => [r.id, r.zarizeni, r.technik, r.termin, r.stav, r.naklad])];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 5 }, { wch: 38 }, { wch: 26 }, { wch: 12 }, { wch: 14 }, { wch: 14 }];
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Revize');
  return new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }));
}
