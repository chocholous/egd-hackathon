// Kontrola: samotný docxtemplater (bez větve MERGEFIELD) nad šablonou z desktopového Wordu.
const PizZip = require('pizzip'); const Docxtemplater = require('docxtemplater'); const fs = require('fs');
const dt = new Docxtemplater(new PizZip(fs.readFileSync(process.argv[2])), { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' } });
dt.render({ jmeno: 'Procházka Tomáš', oddeleni: 'Distribuce Brno', datum: '24. 11. 2026', hodnoceni: '5' });
const x = dt.getZip().file('word/document.xml').asText();
console.log('docxtemplater', require('docxtemplater/package.json').version, '| {{ zbylo:', (x.match(/\{\{/g) || []).length, '| fldSimple:', (x.match(/<w:fldSimple/g) || []).length, '| text pole:', (x.match(/«[^»]*»/g) || []).join(','));
