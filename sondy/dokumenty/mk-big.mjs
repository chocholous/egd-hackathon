import fs from 'node:fs'; import { Document, Packer, Paragraph, ImageRun } from 'docx';
const [img, out] = process.argv.slice(2);
const d = new Document({ sections: [{ children: [new Paragraph({ children: [new ImageRun({ type: 'png', data: fs.readFileSync(img), transformation: { width: 400, height: 400 } })] })] }] });
fs.writeFileSync(out, new Uint8Array(await Packer.toArrayBuffer(d)));
