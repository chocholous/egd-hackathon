import { build } from 'esbuild'; import zlib from 'node:zlib'; import fs from 'node:fs';
const libs = { docx: 'src/gen-docx.mjs', docxtemplater: 'src/gen-docxtpl.mjs', exceljs: 'src/gen-exceljs.mjs', sheetjs: 'src/gen-sheetjs.mjs', pptxgenjs: 'src/gen-pptx.mjs', 'pdf-lib+fontkit': 'src/gen-pdf.mjs', pdfmake: 'src/gen-pdfmake.mjs', jspdf: 'src/gen-jspdf.mjs' };
fs.mkdirSync('dist', { recursive: true });
console.log('knihovna | min KB | gzip KB');
for (const [n, e] of Object.entries(libs)) {
  const r = await build({ entryPoints: [e], bundle: true, minify: true, format: 'esm', platform: 'browser', outfile: `dist/${n.replace(/\W/g, '_')}.js`, write: true, logLevel: 'error', define: { global: 'globalThis' } });
  const f = fs.readFileSync(`dist/${n.replace(/\W/g, '_')}.js`);
  console.log(n, '|', (f.length / 1024).toFixed(0), '|', (zlib.gzipSync(f).length / 1024).toFixed(0));
}
