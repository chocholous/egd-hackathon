import { jsPDF } from 'jspdf';
import { title, pangram } from './data.mjs';
export function genJsPdfDefault() { const d = new jsPDF(); d.text(title + '\n' + pangram, 10, 20); return new Uint8Array(d.output('arraybuffer')); }
export function genJsPdfFont(ttfBase64) { const d = new jsPDF(); d.addFileToVFS('R.ttf', ttfBase64); d.addFont('R.ttf', 'Roboto', 'normal'); d.setFont('Roboto'); d.text(title + '\n' + pangram, 10, 20); return new Uint8Array(d.output('arraybuffer')); }
