import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { SPHttpClient, MSGraphClientV3 } from '@microsoft/sp-http';

export interface IUpravaProps { slozka: string; }

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const XML_SPACE = 'http://www.w3.org/XML/1998/namespace';

/** Najde v každém odstavci text i přes hranice runů (Word dělí text do runů podle formátu, kontroly pravopisu,
 *  oprav) a nahradí ho. Nový text dostane první dotčený run (jeho formát), z dalších runů se odebere jen
 *  nahrazená část. pLocal/tLocal: w:p + w:t (Word) nebo a:p + a:t (PowerPoint). */
export function nahradVOdstavcich(xml: string, ns: string, pLocal: string, tLocal: string, mapa: [string, string][]): { xml: string; pocet: number } {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  let pocet = 0;
  const ps = doc.getElementsByTagNameNS(ns, pLocal);
  for (let i = 0; i < ps.length; i++) {
    const ts = Array.prototype.slice.call(ps[i].getElementsByTagNameNS(ns, tLocal)) as Element[];
    if (!ts.length) continue;
    for (const [hledat, nahradit] of mapa) {
      let od = 0;
      for (;;) {
        const texty = ts.map((t) => t.textContent || '');
        const idx = texty.join('').indexOf(hledat, od);
        if (idx < 0) break;
        const konec = idx + hledat.length;
        let s = 0; let prvni = true;
        for (let j = 0; j < ts.length; j++) {
          const e = s + texty[j].length;
          if (e > idx && s < konec) {           // run se překrývá s nálezem
            const pred = texty[j].slice(0, Math.max(0, idx - s));
            const po = texty[j].slice(Math.min(texty[j].length, konec - s));
            ts[j].textContent = prvni ? pred + nahradit + po : po;
            if (ns === W) ts[j].setAttributeNS(XML_SPACE, 'xml:space', 'preserve');
            prvni = false;
          }
          s = e;
        }
        pocet++; od = idx + nahradit.length;
      }
    }
  }
  let out = new XMLSerializer().serializeToString(doc);
  if (!/^<\?xml/.test(out)) out = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + out;
  return { xml: out, pocet };
}

/** Slučovací pole Wordu (MERGEFIELD) nahradí prostým textem z `data` („odpojí“ pole, jako Ctrl+Shift+F9).
 *  Umí obě podoby: jednoduché pole <w:fldSimple w:instr="MERGEFIELD x"> (tak ukládá Word for Mac)
 *  i složené pole w:fldChar begin → w:instrText → separate → výsledek → end. Formát dostane první run výsledku.
 *  Pole, které v `data` není, zůstane beze změny a vrátí se v `chybi`. */
export function vyplnSlucovaciPole(xml: string, data: Record<string, string>): { xml: string; pocet: number; chybi: string[] } {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const jmenoPole = (instr: string): string | undefined => (instr.match(/^\s*MERGEFIELD\s+"?([^\s"\\]+)"?/i) || [])[1];
  let pocet = 0; const chybi: string[] = [];
  const nastavText = (runy: Element[], hodnota: string): void => {
    let prvni = true;
    runy.forEach((r) => Array.prototype.slice.call(r.getElementsByTagNameNS(W, 't')).forEach((t: Element) => {
      t.textContent = prvni ? hodnota : ''; t.setAttributeNS(XML_SPACE, 'xml:space', 'preserve'); prvni = false;
    }));
  };
  // 1) jednoduchá pole
  Array.prototype.slice.call(doc.getElementsByTagNameNS(W, 'fldSimple')).forEach((f: Element) => {
    const k = jmenoPole(f.getAttributeNS(W, 'instr') || '');
    if (!k) return;
    if (!(k in data)) { chybi.push(k); return; }
    let runy = Array.prototype.slice.call(f.getElementsByTagNameNS(W, 'r')) as Element[];
    if (!runy.length) { const r = doc.createElementNS(W, 'w:r'); r.appendChild(doc.createElementNS(W, 'w:t')); f.appendChild(r); runy = [r]; }
    nastavText(runy, data[k]);
    while (f.firstChild) f.parentNode!.insertBefore(f.firstChild, f);   // runy výsledku ven z pole
    f.parentNode!.removeChild(f); pocet++;
  });
  // 2) složená pole (begin/instr/separate/výsledek/end; v jednom odstavci i přes víc odstavců)
  const runy = Array.prototype.slice.call(doc.getElementsByTagNameNS(W, 'r')) as Element[];
  const typ = (r: Element): string => { const fc = r.getElementsByTagNameNS(W, 'fldChar')[0]; return fc ? fc.getAttributeNS(W, 'fldCharType') || '' : ''; };
  for (let i = 0; i < runy.length; i++) {
    if (typ(runy[i]) !== 'begin') continue;
    let j = i + 1; let instr = ''; let hloubka = 0;
    for (; j < runy.length && !(hloubka === 0 && /separate|end/.test(typ(runy[j]))); j++) {
      if (typ(runy[j]) === 'begin') hloubka++; if (typ(runy[j]) === 'end') hloubka--;
      const it = runy[j].getElementsByTagNameNS(W, 'instrText'); for (let q = 0; q < it.length; q++) instr += it[q].textContent || '';
    }
    const k = jmenoPole(instr);
    if (!k) continue;
    if (!(k in data)) { chybi.push(k); continue; }
    const sep = typ(runy[j]) === 'separate' ? j : -1;
    let e = j; while (e < runy.length && typ(runy[e]) !== 'end') e++;
    const vysledek = sep >= 0 ? runy.slice(sep + 1, e) : [];
    if (vysledek.length) nastavText(vysledek, data[k]);
    else { const r = doc.createElementNS(W, 'w:r'); const t = doc.createElementNS(W, 'w:t'); t.textContent = data[k]; r.appendChild(t); runy[e].parentNode!.insertBefore(r, runy[e]); }
    runy.slice(i, sep >= 0 ? sep + 1 : e).concat([runy[e]]).forEach((r) => r.parentNode && r.parentNode.removeChild(r));
    pocet++; i = e;
  }
  let out = new XMLSerializer().serializeToString(doc);
  if (!/^<\?xml/.test(out)) out = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + out;
  return { xml: out, pocet, chybi };
}

/** Text dokumentu po odstavcích (pro kontrolu výsledku v #log). */
function textOdstavcu(xml: string, ns: string, pLocal: string, tLocal: string): string[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const ps = doc.getElementsByTagNameNS(ns, pLocal); const out: string[] = [];
  for (let i = 0; i < ps.length; i++) {
    const ts = ps[i].getElementsByTagNameNS(ns, tLocal); let t = '';
    for (let j = 0; j < ts.length; j++) t += ts[j].textContent || '';
    if (t) out.push(t);
  }
  return out;
}

export default class UpravaWebPart extends BaseClientSideWebPart<IUpravaProps> {
  private _web(): string { return this.context.pageContext.web.absoluteUrl; }
  private _srvSlozka(): string { return `${this.context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/${this.properties.slozka}`; }

  /** Načte soubor z knihovny jako ArrayBuffer. */
  private async _nacti(nazev: string): Promise<ArrayBuffer> {
    const cesta = `${this._srvSlozka()}/vstup/${nazev}`.replace(/'/g, "''");
    const r = await this.context.spHttpClient.get(`${this._web()}/_api/web/GetFileByServerRelativePath(decodedurl='${encodeURIComponent(cesta)}')/$value`,
      SPHttpClient.configurations.v1);
    if (!r.ok) throw new Error(`čtení ${nazev}: HTTP ${r.status}`);
    return r.arrayBuffer();
  }

  /** Uloží výsledek do <slozka>/vystup (složku založí, když chybí) a vrátí jeho URL. */
  private async _uloz(nazev: string, data: ArrayBuffer | Blob): Promise<string> {
    const slozka = `${this._srvSlozka()}/vystup`;
    const url = `${this._web()}/_api/web/GetFolderByServerRelativePath(decodedurl='${encodeURIComponent(slozka)}')/Files/AddUsingPath(decodedurl='${encodeURIComponent(nazev)}',overwrite=true)`;
    let r = await this.context.spHttpClient.post(url, SPHttpClient.configurations.v1, { body: data });
    if (r.status === 404) {
      await this.context.spHttpClient.post(`${this._web()}/_api/web/folders/AddUsingPath(decodedurl='${encodeURIComponent(slozka)}')`, SPHttpClient.configurations.v1, {});
      r = await this.context.spHttpClient.post(url, SPHttpClient.configurations.v1, { body: data });
    }
    if (!r.ok) throw new Error(`uložení ${nazev}: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
    return `${slozka}/${nazev}`;
  }

  // (a) přepsat text v nahraném .docx: JSZip + DOM, nahrazení i přes hranice runů
  private async _docx(): Promise<string> {
    const JSZip = (await import(/* webpackChunkName: 'jszip' */ 'jszip')).default;
    const zip = await JSZip.loadAsync(await this._nacti('smlouva.docx'));
    const xml = await zip.file('word/document.xml')!.async('string');
    const v = nahradVOdstavcich(xml, W, 'p', 't', [['Stavby Morava s.r.o.', 'Elektro Vysočina s.r.o.'], ['Stavby Morava', 'Elektro Vysočina'],
      ['480 000 Kč', '512 000 Kč'], ['31. 3. 2027', '30. 4. 2027']]);
    zip.file('word/document.xml', v.xml);
    const u = await this._uloz('smlouva-upravena.docx', await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' }));
    return `${v.pocet} náhrad → ${u} | ${textOdstavcu(v.xml, W, 'p', 't').join(' ¶ ')}`;
  }

  // (b1) změnit buňky v .xlsx přes exceljs (načte a znovu zapíše celý sešit)
  private async _xlsxExceljs(): Promise<string> {
    const ExcelJS = await import(/* webpackChunkName: 'exceljs' */ 'exceljs');
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await this._nacti('rozpocet.xlsx'));
    const ws = wb.getWorksheet('rozpocet') || wb.worksheets[0];
    ws.getCell('B3').value = 350000;
    ws.getCell('A4').value = 'Doprava a montáž';
    ws.getCell('D2').value = `Upraveno appkou ${new Date().toLocaleDateString('cs-CZ')}`;
    wb.calcProperties.fullCalcOnLoad = true;   // vzorec B5 přepočítá Excel / LibreOffice při otevření
    const buf = await wb.xlsx.writeBuffer();
    const u = await this._uloz('rozpocet-exceljs.xlsx', buf as ArrayBuffer);
    const b5 = ws.getCell('B5').value as { formula?: string; result?: unknown };
    return `→ ${u} | B3=${ws.getCell('B3').value} A4=${ws.getCell('A4').value} B5 vzorec=${b5 && b5.formula} uložený výsledek=${b5 && b5.result}`;
  }

  // (b2) změnit buňky v .xlsx přímo v XML (JSZip): ostatní části sešitu zůstanou beze změny
  private async _xlsxZip(): Promise<string> {
    const JSZip = (await import(/* webpackChunkName: 'jszip' */ 'jszip')).default;
    const zip = await JSZip.loadAsync(await this._nacti('rozpocet.xlsx'));
    const cesta = 'xl/worksheets/sheet1.xml';
    let xml = await zip.file(cesta)!.async('string');
    const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cislo = (ref: string, n: number): void => { xml = xml.replace(new RegExp(`<c r="${ref}"([^>]*?)(?: t="[^"]*")?([^>]*)>.*?</c>`), `<c r="${ref}"$1$2><v>${n}</v></c>`); };
    const text = (ref: string, s: string): void => { xml = xml.replace(new RegExp(`<c r="${ref}"([^>]*?)(?: t="[^"]*")?([^>]*)>.*?</c>`), `<c r="${ref}"$1$2 t="inlineStr"><is><t>${esc(s)}</t></is></c>`); };
    cislo('B3', 350000);
    text('A4', 'Doprava a montáž');
    xml = xml.replace(/(<c r="B5"[^>]*>)(<f>[^<]*<\/f>)<v>[^<]*<\/v>/, '$1$2');   // zahodit uložený výsledek vzorce
    zip.file(cesta, xml);
    let wbx = await zip.file('xl/workbook.xml')!.async('string');
    wbx = /<calcPr[^>]*\/>/.test(wbx) ? wbx.replace(/<calcPr([^>]*)\/>/, (m, a: string) => `<calcPr${a.replace(/ fullCalcOnLoad="[^"]*"/, '')} fullCalcOnLoad="1"/>`)
      : wbx.replace('</workbook>', '<calcPr fullCalcOnLoad="1"/></workbook>');
    zip.file('xl/workbook.xml', wbx);
    const u = await this._uloz('rozpocet-xml.xlsx', await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' }));
    return `→ ${u} | B3,A4 přepsány v ${cesta}, fullCalcOnLoad=1`;
  }

  // (b3) změnit buňky přes Graph Excel API: soubor se upraví na serveru, Excel hned přepočítá vzorce
  private async _xlsxGraph(): Promise<string> {
    const u = await this._uloz('rozpocet-graph.xlsx', await this._nacti('rozpocet.xlsx'));   // pracovní kopie
    const g: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
    const host = new URL(this._web()).hostname;
    // dvě cesty (web i soubor) v jedné adrese Graph nebere („Resource not found for the segment 'root:'“) → nejdřív id webu
    const site = await g.api(`/sites/${host}:${this.context.pageContext.web.serverRelativeUrl}`).select('id').get();
    const item = await g.api(`/sites/${site.id}/drive/root:/${this.properties.slozka.split('/').slice(1).join('/')}/vystup/rozpocet-graph.xlsx`).select('id,parentReference').get();
    const base = `/drives/${item.parentReference.driveId}/items/${item.id}/workbook/worksheets('rozpocet')`;
    await g.api(`${base}/range(address='A3:B4')`).patch({ values: [['Práce', 350000], ['Doprava a montáž', 60000]] });
    const b5 = await g.api(`${base}/range(address='B5')`).select('values,formulas').get();
    return `→ ${u} | B5 vzorec=${JSON.stringify(b5.formulas)} hodnota po přepočtu=${JSON.stringify(b5.values)}`;
  }

  // (E) Graph Excel API nad sešitem, který už v knihovně leží (vystup/rozpocet-graph.xlsx): bez kopie, úprava na místě
  private async _wb(): Promise<{ g: MSGraphClientV3; base: string }> {
    const g: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
    const host = new URL(this._web()).hostname;
    const site = await g.api(`/sites/${host}:${this.context.pageContext.web.serverRelativeUrl}`).select('id').get();
    const item = await g.api(`/sites/${site.id}/drive/root:/${this.properties.slozka.split('/').slice(1).join('/')}/vystup/rozpocet-graph.xlsx`).select('id,parentReference').get();
    return { g, base: `/drives/${item.parentReference.driveId}/items/${item.id}/workbook` };
  }

  /** Volitelně s relací sešitu (persistChanges) – hlavička workbook-session-id. */
  private async _relace(g: MSGraphClientV3, base: string, s: boolean): Promise<string | undefined> {
    if (!s) return undefined;
    const r = await g.api(`${base}/createSession`).post({ persistChanges: true });
    return r.id as string;
  }

  private async _eRange(sRelaci: boolean): Promise<string> {
    const t0 = performance.now(); const { g, base } = await this._wb(); const sid = await this._relace(g, base, sRelaci);
    const h = (r: ReturnType<MSGraphClientV3['api']>): ReturnType<MSGraphClientV3['api']> => (sid ? r.header('workbook-session-id', sid) : r);
    const cas = new Date().toLocaleTimeString('cs-CZ');
    const t1 = performance.now();
    await h(g.api(`${base}/worksheets('rozpocet')/range(address='B2:C3')`)).patch({ values: [[125000, `API ${cas}`], [355000, `API ${cas}`]] });
    const t2 = performance.now();
    const v = await h(g.api(`${base}/worksheets('rozpocet')/range(address='A1:C6')`)).select('values').get();
    if (sid) await g.api(`${base}/closeSession`).header('workbook-session-id', sid).post({});
    return `relace=${sid ? 'ano' : 'ne'} PATCH ${Math.round(t2 - t1)} ms (celkem ${Math.round(performance.now() - t0)} ms) | ${JSON.stringify(v.values)}`;
  }

  private async _eTabulka(): Promise<string> {
    const { g, base } = await this._wb();
    const tabs = await g.api(`${base}/tables`).select('name').get();
    if (!(tabs.value as { name: string }[]).some((t) => t.name === 'Polozky')) {
      const t = await g.api(`${base}/worksheets('rozpocet')/tables/add`).post({ address: 'F1:G3', hasHeaders: true });
      await g.api(`${base}/tables/${t.id}`).patch({ name: 'Polozky' });
      await g.api(`${base}/tables('Polozky')/headerRowRange`).patch({ values: [['Položka', 'Částka']] });
      await g.api(`${base}/tables('Polozky')/dataBodyRange`).patch({ values: [['Materiál', 120000], ['Práce', 300000]] });
      return 'tabulka Polozky založena na F1:G3';
    }
    return 'tabulka Polozky už existuje';
  }

  private async _eRadek(): Promise<string> {
    const t0 = performance.now(); const { g, base } = await this._wb();
    const t1 = performance.now();
    await g.api(`${base}/tables('Polozky')/rows`).post({ values: [[`Rezerva ${new Date().toLocaleTimeString('cs-CZ')}`, 25000]] });
    const t2 = performance.now();
    const r = await g.api(`${base}/tables('Polozky')/range`).select('address,values').get();
    return `POST rows ${Math.round(t2 - t1)} ms (celkem ${Math.round(performance.now() - t0)} ms) | ${r.address} ${JSON.stringify(r.values)}`;
  }

  // (c) upravit text na snímku .pptx (JSZip + DOM přes hranice runů a:r)
  private async _pptx(): Promise<string> {
    const JSZip = (await import(/* webpackChunkName: 'jszip' */ 'jszip')).default;
    const zip = await JSZip.loadAsync(await this._nacti('prezentace.pptx'));
    const cesta = 'ppt/slides/slide1.xml';
    const v = nahradVOdstavcich(await zip.file(cesta)!.async('string'), A, 'p', 't',
      [['Rozvodna Sever', 'Rozvodna Jih'], ['3 z 5', '4 z 5'], ['Jan Dvořák', 'Petra Nováková']]);
    zip.file(cesta, v.xml);
    const u = await this._uloz('prezentace-upravena.pptx', await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' }));
    return `${v.pocet} náhrad → ${u} | ${textOdstavcu(v.xml, A, 'p', 't').join(' ¶ ')}`;
  }

  private _data(): Record<string, string> {
    return { jmeno: this.context.pageContext.user.displayName, utvar: 'Distribuce Brno', oddeleni: 'Distribuce Brno', datum: new Date().toLocaleDateString('cs-CZ'), hodnoceni: '5' };
  }

  // (d0) naivní náhrada v surovém XML: ukazuje past, zástupné texty rozdělené do runů zůstanou
  private async _sablonaNaivne(): Promise<string> {
    const JSZip = (await import(/* webpackChunkName: 'jszip' */ 'jszip')).default;
    const zip = await JSZip.loadAsync(await this._nacti('sablona-word.docx'));
    let xml = await zip.file('word/document.xml')!.async('string');
    const d = this._data();
    Object.keys(d).forEach((k) => { xml = xml.split(`{{${k}}}`).join(d[k]); });
    zip.file('word/document.xml', xml);
    const u = await this._uloz('sablona-naivne.docx', await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' }));
    const t = textOdstavcu(xml, W, 'p', 't');
    return `→ ${u} | zbylo zástupných textů: ${(t.join(' ').match(/\{\{[^}]*\}\}/g) || []).join(', ') || 'žádný'} | ${t.join(' ¶ ')}`;
  }

  // (d1) šablona z Wordu: vlastní náhrada po odstavcích (stejná funkce jako u (a))
  private async _sablonaOdstavce(): Promise<string> {
    const JSZip = (await import(/* webpackChunkName: 'jszip' */ 'jszip')).default;
    const zip = await JSZip.loadAsync(await this._nacti('sablona-word.docx'));
    const d = this._data();
    const v = nahradVOdstavcich(await zip.file('word/document.xml')!.async('string'), W, 'p', 't', Object.keys(d).map((k): [string, string] => [`{{${k}}}`, d[k]]));
    zip.file('word/document.xml', v.xml);
    const u = await this._uloz('sablona-odstavce.docx', await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' }));
    const t = textOdstavcu(v.xml, W, 'p', 't');
    return `${v.pocet} náhrad → ${u} | zbylo: ${(t.join(' ').match(/\{\{[^}]*\}\}/g) || []).join(', ') || 'žádný'} | ${t.join(' ¶ ')}`;
  }

  // (d2) šablona z Wordu přes docxtemplater (sám spojuje runy; oddělovače {{ }})
  private async _sablonaDocxtemplater(): Promise<string> {
    const PizZip = (await import(/* webpackChunkName: 'pizzip' */ 'pizzip')).default;
    const Docxtemplater = (await import(/* webpackChunkName: 'docxtemplater' */ 'docxtemplater')).default;
    const dt = new Docxtemplater(new PizZip(await this._nacti('sablona-word.docx')), { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' } });
    dt.render(this._data());
    const zip = dt.getZip();
    const u = await this._uloz('sablona-docxtemplater.docx', zip.generate({ type: 'arraybuffer', compression: 'DEFLATE' }) as ArrayBuffer);
    const t = textOdstavcu(zip.file('word/document.xml')!.asText(), W, 'p', 't');
    return `→ ${u} | zbylo: ${(t.join(' ').match(/\{\{[^}]*\}\}/g) || []).join(', ') || 'žádný'} | ${t.join(' ¶ ')}`;
  }

  // (d3) šablona z desktopového Wordu: nejdřív slučovací pole MERGEFIELD, pak značky {{ }} docxtemplaterem.
  //      vstup = parametr (sablona-desktop-word.docx z Word for Mac, sablona-slozene-pole.docx = složené pole)
  private async _sablonaDesktop(vstup: string, vystup: string): Promise<string> {
    const PizZip = (await import(/* webpackChunkName: 'pizzip' */ 'pizzip')).default;
    const Docxtemplater = (await import(/* webpackChunkName: 'docxtemplater' */ 'docxtemplater')).default;
    const zip = new PizZip(await this._nacti(vstup));
    const d = this._data();
    const pole = vyplnSlucovaciPole(zip.file('word/document.xml')!.asText(), d);
    zip.file('word/document.xml', pole.xml);
    const dt = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' }, nullGetter: (p) => `{{${(p as { value: string }).value}}}` });
    dt.render(d);
    const z2 = dt.getZip();
    const u = await this._uloz(vystup, z2.generate({ type: 'arraybuffer', compression: 'DEFLATE' }) as ArrayBuffer);
    const xml = z2.file('word/document.xml')!.asText();
    const t = textOdstavcu(xml, W, 'p', 't');
    return `MERGEFIELD: ${pole.pocet} vyplněno, chybí data: ${pole.chybi.join(', ') || 'nic'}; zbylá pole: ${(xml.match(/MERGEFIELD/g) || []).length} → ${u} | zbylo {{}}: ${(t.join(' ').match(/\{\{[^}]*\}\}/g) || []).join(', ') || 'žádný'} | ${t.join(' ¶ ')}`;
  }

  public render(): void {
    const tl: [string, string][] = [['docx', '(a) Přepsat text ve smlouvě .docx'], ['xlsx-exceljs', '(b) Buňky .xlsx: exceljs'], ['xlsx-xml', '(b) Buňky .xlsx: přímo XML'],
      ['xlsx-graph', '(b) Buňky .xlsx: Graph Excel API'], ['e-range', '(E) Graph: PATCH B2:C3'], ['e-range-relace', '(E) Graph: PATCH B2:C3 v relaci'], ['e-tabulka', '(E) Graph: založit tabulku'], ['e-radek', '(E) Graph: POST řádek tabulky'], ['pptx', '(c) Text na snímku .pptx'], ['sablona-naivne', '(d) Šablona: naivní náhrada'],
      ['sablona-odstavce', '(d) Šablona: náhrada po odstavcích'], ['sablona-docxtemplater', '(d) Šablona: docxtemplater'], ['sablona-desktop', '(d) Šablona z desktop Wordu + MERGEFIELD'], ['sablona-slozene', '(d) Šablona: složené pole MERGEFIELD']];
    this.domElement.innerHTML = `<div style="font-family:Segoe UI,sans-serif;max-width:900px"><h3>Úprava existujících dokumentů</h3>
      <p>Vstupy: ${this.properties.slozka}/vstup, výstupy: ${this.properties.slozka}/vystup</p>
      ${tl.map(([k, t]) => `<button data-k="${k}" style="margin:3px">${t}</button>`).join('')}
      <p id="log" style="white-space:pre-wrap;background:#f3f2f1;padding:8px"></p></div>`;
    const log = this.domElement.querySelector('#log') as HTMLElement;
    const akce: Record<string, () => Promise<string>> = { 'docx': () => this._docx(), 'xlsx-exceljs': () => this._xlsxExceljs(), 'xlsx-xml': () => this._xlsxZip(),
      'xlsx-graph': () => this._xlsxGraph(), 'e-range': () => this._eRange(false), 'e-range-relace': () => this._eRange(true), 'e-tabulka': () => this._eTabulka(), 'e-radek': () => this._eRadek(), 'pptx': () => this._pptx(), 'sablona-naivne': () => this._sablonaNaivne(),
      'sablona-odstavce': () => this._sablonaOdstavce(), 'sablona-docxtemplater': () => this._sablonaDocxtemplater(),
      'sablona-desktop': () => this._sablonaDesktop('sablona-desktop-word.docx', 'sablona-desktop-vyplnena.docx'), 'sablona-slozene': () => this._sablonaDesktop('sablona-slozene-pole.docx', 'sablona-slozene-vyplnena.docx') };
    this.domElement.querySelectorAll('button[data-k]').forEach((b) => {
      (b as HTMLButtonElement).onclick = async () => {
        const k = (b as HTMLElement).getAttribute('data-k') as string; const t0 = performance.now();
        log.textContent = `pracuji ${k}…`;
        try { const vysledek = await akce[k](); log.textContent = `HOTOVO ${k} (${Math.round(performance.now() - t0)} ms): ${vysledek}`; }
        catch (e) { log.textContent = `CHYBA ${k}: ${(e as Error).message}`; }
      };
    });
  }

  protected get dataVersion(): Version { return Version.parse('1.0'); }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ groups: [{ groupName: 'Nastavení', groupFields: [PropertyPaneTextField('slozka', { label: 'Složka v knihovně (vstup/ a vystup/)' })] }] }] };
  }
}
