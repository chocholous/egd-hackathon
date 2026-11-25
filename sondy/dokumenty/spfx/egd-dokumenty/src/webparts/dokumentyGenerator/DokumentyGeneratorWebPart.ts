import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse, MSGraphClientV3 } from '@microsoft/sp-http';
import { escape } from '@microsoft/sp-lodash-subset';

// Sonda "dokumenty": generování Word/Excel/PPT/PDF z položek seznamu v prohlížeči, uložení do knihovny
// (SPHttpClient), převod na PDF přes Graph (MSGraphClientV3, Files.Read.All schválené v API access).
// Knihovny se načítají líně (dynamic import → samostatný chunk jen po kliknutí).

interface IRow { id: number; zarizeni: string; technik: string; termin: string; stav: string; naklad: number; }
const FOLDER = 'sonda'; // složka v knihovně Dokumenty
const fmtKc = (n: number): string => new Intl.NumberFormat('cs-CZ').format(n) + ' Kč';
const fmtDate = (s: string): string => { const d = new Date(s); return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`; };
const TITLE = 'Přehled revizí rozvaděčů – příští čtvrtletí';

export default class DokumentyGeneratorWebPart extends BaseClientSideWebPart<{ description: string }> {
  private _rows: IRow[] = [];
  private _libUrl = ''; // server-relative URL kořene knihovny Dokumenty

  public render(): void {
    this.domElement.innerHTML = `<div style="font-family:Segoe UI,sans-serif">
      <h2>Generování dokumentů – sonda</h2>
      <p id="info">Načítám seznam Revize…</p>
      <div id="btns" style="display:flex;gap:8px;flex-wrap:wrap">
        ${[['docx', 'Word (docx)'], ['docxtpl', 'Word ze šablony'], ['xlsx', 'Excel (exceljs)'], ['pptx', 'PowerPoint'], ['pdf', 'PDF (pdf-lib)'], ['graphpdf', 'Word → PDF přes Graph']]
          .map(([k, l]) => `<button data-k="${k}" style="padding:8px 12px">${l}</button>`).join('')}
      </div>
      <pre id="log" style="background:#f3f3f3;padding:8px;white-space:pre-wrap"></pre></div>`;
    this.domElement.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { void this._run(b.getAttribute('data-k') as string); }));
    void this._load();
  }

  private _log(s: string): void { const l = this.domElement.querySelector('#log'); if (l) l.textContent += s + '\n'; }

  private async _load(): Promise<void> {
    const w = this.context.pageContext.web.absoluteUrl;
    const r = await this.context.spHttpClient.get(`${w}/_api/web/lists/getbytitle('Revize')/items?$select=Id,Title,Technik,Termin,Stav,Naklad&$orderby=Id`, SPHttpClient.configurations.v1);
    const j = await r.json();
    this._rows = (j.value as any[]).map((x) => ({ id: x.Id, zarizeni: x.Title, technik: x.Technik, termin: x.Termin, stav: x.Stav, naklad: x.Naklad }));
    const lr = await (await this.context.spHttpClient.get(`${w}/_api/web/lists/getbytitle('Dokumenty')/rootFolder?$select=ServerRelativeUrl`, SPHttpClient.configurations.v1)).json();
    this._libUrl = lr.ServerRelativeUrl;
    const info = this.domElement.querySelector('#info'); if (info) info.innerHTML = `Položek v seznamu: <b>${this._rows.length}</b> (${escape(this._rows.map((r) => r.zarizeni)[0] || '')} …), knihovna <code>${escape(this._libUrl)}/${FOLDER}</code>`;
  }

  private async _fetchBytes(rel: string): Promise<Uint8Array> {
    const w = this.context.pageContext.web.absoluteUrl;
    const r: SPHttpClientResponse = await this.context.spHttpClient.get(`${w}/_api/web/GetFileByServerRelativePath(decodedurl='${this._libUrl}/${FOLDER}/${rel}')/$value`, SPHttpClient.configurations.v1);
    if (!r.ok) throw new Error(`${rel}: ${r.status}`);
    return new Uint8Array(await r.arrayBuffer());
  }

  private async _save(name: string, bytes: Uint8Array): Promise<void> {
    const w = this.context.pageContext.web.absoluteUrl;
    const url = `${w}/_api/web/GetFolderByServerRelativePath(decodedurl='${this._libUrl}/${FOLDER}')/Files/AddUsingPath(decodedurl='${name}',overwrite=true)`;
    const r = await this.context.spHttpClient.post(url, SPHttpClient.configurations.v1, { body: bytes });
    if (!r.ok) throw new Error(`upload ${name}: ${r.status} ${await r.text()}`);
    this._log(`uloženo do knihovny: ${FOLDER}/${name} (${bytes.length} B)`);
    // + stažení do počítače
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes as BlobPart])); a.download = name; a.click();
  }

  private async _run(k: string): Promise<void> {
    const t0 = performance.now();
    try {
      let name = ''; let bytes: Uint8Array;
      if (k === 'docx' || k === 'graphpdf') {
        const d = await import(/* webpackChunkName: 'lib-docx' */ 'docx');
        const cell = (t: string, bold = false): any => new d.TableCell({ children: [new d.Paragraph({ children: [new d.TextRun({ text: t, bold })] })] });
        const doc = new d.Document({ sections: [{ children: [
          new d.Paragraph({ heading: d.HeadingLevel.HEADING_1, text: TITLE }),
          new d.Table({ width: { size: 100, type: d.WidthType.PERCENTAGE }, rows: [
            new d.TableRow({ children: ['Zařízení', 'Technik', 'Termín', 'Stav', 'Náklad'].map((h) => cell(h, true)) }),
            ...this._rows.map((r) => new d.TableRow({ children: [r.zarizeni, r.technik, fmtDate(r.termin), r.stav, fmtKc(r.naklad)].map((x) => cell(x)) })),
          ] })] }] });
        bytes = new Uint8Array(await d.Packer.toArrayBuffer(doc)); name = 'revize.docx';
        await this._save(name, bytes);
        if (k === 'graphpdf') await this._graphPdf(name);
      } else if (k === 'docxtpl') {
        const [{ default: PizZip }, { default: Docxtemplater }] = await Promise.all([import(/* webpackChunkName: 'lib-tpl' */ 'pizzip'), import(/* webpackChunkName: 'lib-tpl' */ 'docxtemplater')]);
        const tpl = await this._fetchBytes('assets/sablona.docx');
        const dt = new Docxtemplater(new PizZip(tpl), { paragraphLoop: true, linebreaks: true });
        dt.render({ nazev: TITLE, autor: this.context.pageContext.user.displayName, datum: fmtDate(new Date().toISOString()), celkem: fmtKc(this._rows.reduce((a, r) => a + r.naklad, 0)),
          radky: this._rows.map((r) => ({ zarizeni: r.zarizeni, technik: r.technik, termin: fmtDate(r.termin), naklad: fmtKc(r.naklad) })) });
        await this._save('revize-sablona.docx', dt.getZip().generate({ type: 'uint8array', compression: 'DEFLATE' }) as Uint8Array);
      } else if (k === 'xlsx') {
        const ExcelJS = (await import(/* webpackChunkName: 'lib-exceljs' */ 'exceljs')).default;
        const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet('Revize');
        ws.columns = [{ header: 'Zařízení', key: 'z', width: 38 }, { header: 'Technik', key: 't', width: 26 }, { header: 'Termín', key: 'd', width: 14 }, { header: 'Stav', key: 's', width: 14 }, { header: 'Náklad', key: 'n', width: 14 }];
        ws.getRow(1).font = { bold: true };
        this._rows.forEach((r) => ws.addRow({ z: r.zarizeni, t: r.technik, d: new Date(r.termin), s: r.stav, n: r.naklad }));
        ws.getColumn('d').numFmt = 'd. m. yyyy'; ws.getColumn('n').numFmt = '#,##0 "Kč"';
        await this._save('revize.xlsx', new Uint8Array(await wb.xlsx.writeBuffer()));
      } else if (k === 'pptx') {
        const P = (await import(/* webpackChunkName: 'lib-pptx' */ 'pptxgenjs')).default;
        const p = new P(); p.layout = 'LAYOUT_WIDE';
        p.addSlide().addText(TITLE, { x: 0.5, y: 1.5, w: 12, h: 1.2, fontSize: 36, bold: true });
        const s = p.addSlide();
        const tc = (x: string): { text: string } => ({ text: x });
        s.addTable([['Zařízení', 'Technik', 'Termín', 'Náklad'].map(tc), ...this._rows.map((r) => [r.zarizeni, r.technik, fmtDate(r.termin), fmtKc(r.naklad)].map(tc))], { x: 0.5, y: 1, w: 12, fontSize: 14 });
        await this._save('revize.pptx', new Uint8Array(await p.write({ outputType: 'arraybuffer' }) as ArrayBuffer));
      } else if (k === 'pdf') {
        const [{ PDFDocument }, fk, font] = await Promise.all([import(/* webpackChunkName: 'lib-pdf' */ 'pdf-lib'), import(/* webpackChunkName: 'lib-pdf' */ '@pdf-lib/fontkit'), this._fetchBytes('assets/Roboto-Regular.ttf')]);
        const pdf = await PDFDocument.create(); pdf.registerFontkit(fk.default);
        const f = await pdf.embedFont(font, { subset: true }); const pg = pdf.addPage([595, 842]); let y = 790;
        pg.drawText(TITLE, { x: 40, y, size: 16, font: f }); y -= 30;
        for (const r of this._rows) { pg.drawText(`${r.zarizeni} | ${r.technik} | ${fmtDate(r.termin)} | ${r.stav}`, { x: 40, y, size: 9, font: f }); pg.drawText(fmtKc(r.naklad), { x: 480, y, size: 9, font: f }); y -= 16; }
        await this._save('revize.pdf', await pdf.save());
      }
      this._log(`HOTOVO ${k} za ${Math.round(performance.now() - t0)} ms`);
    } catch (e) { this._log(`CHYBA ${k}: ${(e as Error).message}`); }
  }

  private async _graphPdf(name: string): Promise<void> {
    const pc = this.context.pageContext;
    const client: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
    const host = new URL(pc.web.absoluteUrl).hostname;
    const path = `/sites/${host},${pc.site.id.toString()},${pc.web.id.toString()}/drive/root:/${FOLDER}/${name}:/content?format=pdf`;
    const blob: Blob = await (client.api(path) as any).responseType('blob').get();
    this._log(`Graph ?format=pdf → ${blob.size} B (${blob.type})`);
    await this._save(name.replace(/\.docx$/, '.pdf'), new Uint8Array(await blob.arrayBuffer()));
  }

  protected get dataVersion(): Version { return Version.parse('1.0'); }
}
