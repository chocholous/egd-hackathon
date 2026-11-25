// Evidence pozadavku - prvni appka z workshopu EG.D.
// Zadavatel posle pozadavek, schvalovatel ho schvali nebo zamitne.
// Data lezi v SharePoint seznamu na stejnem webu (vychozi nazev "Pozadavky").
// Schvalovatel = kdo ma na seznamu pravo "Schvalovat polozky" (vlastnici webu).
// Je to role pro zobrazeni, ne zabezpeceni: kdo smi seznam upravovat, zmeni Stav i primo v seznamu.

import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient, type SPHttpClientResponse, HttpClient, MSGraphClientV3 } from '@microsoft/sp-http';

interface IFirma { ico: string; obchodniJmeno: string; sidlo?: { textovaAdresa?: string } }

import styles from './EvidenceWebPart.module.scss';

export interface IEvidenceWebPartProps {
  nadpis: string;
  seznam: string;
}

interface IPolozka {
  Id: number;
  Title: string;
  Popis?: string;
  Stav?: string;
  Komentar?: string;
  Created: string;
  AuthorId: number;
  Author?: { Title: string };
}

type Zalozka = 'novy' | 'moje' | 'schvalit';

const STAV_NOVY = 'Nový';
const STAV_SCHVALENO = 'Schváleno';
const STAV_ZAMITNUTO = 'Zamítnuto';
const PRAVO_SCHVALOVAT = 0x10; // ApproveItems v dolnich 32 bitech masky prav
const MAX_POLOZEK = 200;

const JSON_HLAVICKY = {
  Accept: 'application/json;odata=nometadata',
  'Content-Type': 'application/json;odata=nometadata'
};

export default class EvidenceWebPart extends BaseClientSideWebPart<IEvidenceWebPartProps> {
  private _zalozka: Zalozka = 'novy';
  private _schvalovatel = false;
  private _polozky: IPolozka[] = [];
  private _chyba = '';
  private _zprava = '';

  // ---------- data ----------

  private _url(cesta: string): string {
    const seznam = (this.properties.seznam || 'Pozadavky').replace(/'/g, "''");
    return `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(seznam)}')${cesta}`;
  }

  private async _cti<T>(cesta: string): Promise<T> {
    const r: SPHttpClientResponse = await this.context.spHttpClient.get(this._url(cesta), SPHttpClient.configurations.v1, { headers: JSON_HLAVICKY });
    if (!r.ok) throw new Error(await this._popisChyby(r));
    return (await r.json()) as T;
  }

  private async _zapis(cesta: string, telo: object, merge = false): Promise<void> {
    const headers: Record<string, string> = { ...JSON_HLAVICKY };
    if (merge) { headers['IF-MATCH'] = '*'; headers['X-HTTP-Method'] = 'MERGE'; }
    const r = await this.context.spHttpClient.post(this._url(cesta), SPHttpClient.configurations.v1, { headers, body: JSON.stringify(telo) });
    if (!r.ok) throw new Error(await this._popisChyby(r));
  }

  private async _popisChyby(r: SPHttpClientResponse): Promise<string> {
    if (r.status === 404) return `Seznam "${this.properties.seznam}" na tomhle webu neni. Zalozte ho (agent: prikaz "seznam") nebo opravte nazev v nastaveni web partu.`;
    if (r.status === 403) return 'Na tuhle akci nemate na seznamu pravo. Pozadejte vlastnika webu o roli Clen (Member).';
    let text = '';
    try { text = (await r.text()).slice(0, 300); } catch { /* nic */ }
    return `SharePoint vratil chybu ${r.status}. ${text}`;
  }

  // Radi se podle ID (stejne poradi jako Created): ID je jediny vzdy indexovany sloupec, razeni podle
  // neindexovaneho Created spadne nad 5000 polozkami na 500 SPQueryThrottledException.
  // Filtry Moje / Ke schvaleni jsou nad poslednimi MAX_POLOZEK polozkami (u velkych seznamu starsi nevidi).
  private async _nacti(): Promise<void> {
    this._chyba = '';
    try {
      const prava = await this._cti<{ High: string; Low: string }>('/EffectiveBasePermissions');
      this._schvalovatel = (Number(prava.Low) & PRAVO_SCHVALOVAT) !== 0;
      const data = await this._cti<{ value: IPolozka[] }>(
        `/items?$select=Id,Title,Popis,Stav,Komentar,Created,AuthorId,Author/Title&$expand=Author&$orderby=ID desc&$top=${MAX_POLOZEK}`);
      this._polozky = data.value;
    } catch (e) {
      this._chyba = (e as Error).message;
    }
  }

  // ---------- vykresleni ----------

  public render(): void {
    const koren = el('section', { class: styles.appka });
    koren.appendChild(el('header', { class: styles.hlavicka }, [
      el('h1', {}, [this.properties.nadpis || 'Evidence požadavků']),
      el('span', { class: styles.role }, [this._schvalovatel ? 'Zadavatel a schvalovatel' : 'Zadavatel'])
    ]));

    const zalozky: [Zalozka, string][] = [['novy', 'Nový požadavek'], ['moje', 'Moje požadavky']];
    if (this._schvalovatel) zalozky.push(['schvalit', `Ke schválení (${this._polozky.filter((p) => p.Stav === STAV_NOVY).length})`]);
    const nav = el('nav', { class: styles.zalozky });
    for (const [id, text] of zalozky) {
      const b = el('button', { class: id === this._zalozka ? styles.aktivni : '', type: 'button' }, [text]);
      b.addEventListener('click', () => { this._zalozka = id; this._zprava = ''; this.render(); });
      nav.appendChild(b);
    }
    koren.appendChild(nav);

    if (this._chyba) koren.appendChild(el('p', { class: styles.chyba, role: 'alert' }, [this._chyba]));
    if (this._zprava) koren.appendChild(el('p', { class: styles.zprava, role: 'status' }, [this._zprava]));

    if (this._zalozka === 'novy') koren.appendChild(this._formular());
    if (this._zalozka === 'moje') koren.appendChild(this._tabulka(this._polozky.filter((p) => p.AuthorId === this._ja()), false));
    if (this._zalozka === 'schvalit') koren.appendChild(this._tabulka(this._polozky.filter((p) => p.Stav === STAV_NOVY), true));

    koren.appendChild(this._panelOvereni());
    this.domElement.replaceChildren(koren);
  }

  // ---------- overeni miniskillu egd-dokumenty a egd-externi-api (sonda ms-dokumenty) ----------

  private _panelOvereni(): HTMLElement {
    const log = el('pre', { id: 'log', style: 'background:#f3f3f3;padding:8px;white-space:pre-wrap' }, [this._logText]);
    const tlacitka: [string, string, () => Promise<void>][] = [
      ['docx', 'Word', () => this._word(this._polozky)],
      ['graphpdf', 'Word → PDF (Graph)', () => this._pdfZWordu('exporty', 'pozadavky.docx')],
      ['pdf', 'PDF (pdf-lib)', () => this._pdfBezGraphu()],
      ['pptx', 'PowerPoint', () => this._pptx(this._polozky)],
      ['xlsx', 'Excel', () => this._excel(this._polozky)],
      ['ares', 'ARES', async () => { const f = await this._firma('00177041'); this._log(`ARES: ${f.obchodniJmeno}, ${f.sidlo?.textovaAdresa || ''}`); }],
      ['aressp', 'ARES přes spHttpClient', async () => {
        const r = await this.context.spHttpClient.get('https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/00177041', SPHttpClient.configurations.v1);
        this._log(`ARES přes spHttpClient: status ${r.status}`);
      }],
      ['meteo', 'Počasí', () => this._pocasi()],
      ['cnb', 'ČNB kurzy', () => this._cnb()],
    ];
    const box = el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' });
    for (const [k, text, akce] of tlacitka) {
      const b = el('button', { type: 'button', 'data-k': k }, [text]);
      b.addEventListener('click', () => {
        const t0 = performance.now();
        akce().then(() => this._log(`HOTOVO ${k} za ${Math.round(performance.now() - t0)} ms`))
          .catch((e: Error) => this._log(`CHYBA ${k}: ${e.name}: ${e.message}`));
      });
      box.appendChild(b);
    }
    return el('section', {}, [el('h2', {}, ['Ověření miniskillů']), el('p', { id: 'info' }, [`Položek: ${this._polozky.length}`]), box, log]);
  }

  private _logText = '';
  private _log(s: string): void {
    this._logText += s + '\n';
    const l = this.domElement.querySelector('#log'); if (l) l.textContent = this._logText;
  }

  // ===== egd-dokumenty: _ulozDokument (doslova ze skillu) =====
  // Uloží bajty do výchozí knihovny webu (Dokumenty / Documents), chybějící složku založí, a nabídne stažení.
  private async _ulozDokument(slozka: string, nazev: string, bajty: Uint8Array): Promise<void> {
    // nejdřív stažení: dostane ho i uživatel, který do knihovny zapisovat nesmí (Čtenář)
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([bajty as BlobPart])); a.download = nazev; a.click();
    const w = this.context.pageContext.web.absoluteUrl;
    const koren = await (await this.context.spHttpClient.get(
      `${w}/_api/web/defaultDocumentLibrary/rootFolder?$select=ServerRelativeUrl`, SPHttpClient.configurations.v1)).json();
    const cil = `${koren.ServerRelativeUrl}/${slozka}`;
    const nahraj = (): Promise<SPHttpClientResponse> => this.context.spHttpClient.post(
      `${w}/_api/web/GetFolderByServerRelativePath(decodedurl='${cil}')/Files/AddUsingPath(decodedurl='${nazev}',overwrite=true)`,
      SPHttpClient.configurations.v1, { body: bajty });
    let r = await nahraj();
    if (r.status === 404) {   // složka ještě není (čerstvý web): založ ji a zkus znovu
      const s = await this.context.spHttpClient.post(
        `${w}/_api/web/folders/AddUsingPath(DecodedUrl='${cil}',overwrite=false)`, SPHttpClient.configurations.v1, {});
      if (!s.ok) throw new Error(`Založení složky ${slozka}: ${s.status}`);
      r = await nahraj();
    }
    if (!r.ok) throw new Error(`Uložení ${nazev}: ${r.status}`);
    this._log(`uloženo ${cil}/${nazev} (${bajty.length} B)`);
  }

  // ===== egd-dokumenty: _word (doslova ze skillu) =====
  private async _word(polozky: IPolozka[]): Promise<void> {
    const d = await import(/* webpackChunkName: 'lib-docx' */ 'docx');
    const bunka = (t: string, tucne = false): InstanceType<typeof d.TableCell> =>
      new d.TableCell({ children: [new d.Paragraph({ children: [new d.TextRun({ text: t, bold: tucne })] })] });
    const doc = new d.Document({ sections: [{ children: [
      new d.Paragraph({ heading: d.HeadingLevel.HEADING_1, text: 'Přehled požadavků' }),
      new d.Table({ width: { size: 100, type: d.WidthType.PERCENTAGE }, rows: [
        new d.TableRow({ children: ['Požadavek', 'Zadal', 'Stav'].map((h) => bunka(h, true)) }),
        ...polozky.map((p) => new d.TableRow({ children: [p.Title, p.Author?.Title || '', p.Stav || ''].map((x) => bunka(x)) }))
      ] })
    ] }] });
    await this._ulozDokument('exporty', 'pozadavky.docx', new Uint8Array(await d.Packer.toArrayBuffer(doc)));
  }

  // ===== egd-dokumenty: _pdfZWordu (doslova ze skillu) =====
  // Word, který už leží v knihovně (výchozí knihovna webu), vrátí jako PDF a uloží vedle.
  private async _pdfZWordu(slozka: string, nazev: string): Promise<void> {
    const pc = this.context.pageContext;
    const graf: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
    const host = new URL(pc.web.absoluteUrl).hostname;
    const cesta = `/sites/${host},${pc.site.id.toString()},${pc.web.id.toString()}/drive/root:/${slozka}/${nazev}:/content?format=pdf`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdf: Blob = await (graf.api(cesta) as any).responseType('blob').get();
    await this._ulozDokument(slozka, nazev.replace(/\.docx$/i, '.pdf'), new Uint8Array(await pdf.arrayBuffer()));
  }

  // ===== egd-dokumenty: PDF bez Graphu (úryvek ze skillu + stažení fontu z knihovny) =====
  private async _bajtyZKnihovny(cestaVKnihovne: string): Promise<Uint8Array> {
    const w = this.context.pageContext.web.absoluteUrl;
    const koren = await (await this.context.spHttpClient.get(
      `${w}/_api/web/defaultDocumentLibrary/rootFolder?$select=ServerRelativeUrl`, SPHttpClient.configurations.v1)).json();
    const r = await this.context.spHttpClient.get(
      `${w}/_api/web/GetFileByServerRelativePath(decodedurl='${koren.ServerRelativeUrl}/${cestaVKnihovne}')/$value`, SPHttpClient.configurations.v1);
    if (!r.ok) throw new Error(`Soubor ${cestaVKnihovne}: ${r.status}`);
    return new Uint8Array(await r.arrayBuffer());
  }

  private async _pdfBezGraphu(): Promise<void> {
    const bajtyFontu = await this._bajtyZKnihovny('assets/Roboto-Regular.ttf');
    const [{ PDFDocument }, fk] = await Promise.all([
      import(/* webpackChunkName: 'lib-pdf' */ 'pdf-lib'), import(/* webpackChunkName: 'lib-pdf' */ '@pdf-lib/fontkit')]);
    const pdf = await PDFDocument.create(); pdf.registerFontkit(fk.default);
    const font = await pdf.embedFont(bajtyFontu, { subset: true });   // bajty TTF stažené z knihovny
    pdf.addPage([595, 842]).drawText('Přehled revizí – čeština ěščřžýáíéúůďťň', { x: 40, y: 790, size: 14, font });
    await this._ulozDokument('exporty', 'pozadavky.pdf', await pdf.save());
  }

  private async _pptx(polozky: IPolozka[]): Promise<void> {
    const P = (await import(/* webpackChunkName: 'lib-pptx' */ 'pptxgenjs')).default;
    const p = new P(); p.layout = 'LAYOUT_WIDE';
    p.addSlide().addText('Přehled požadavků', { x: 0.5, y: 1.5, w: 12, h: 1.2, fontSize: 36, bold: true });
    const radky = [['Požadavek', 'Zadal', 'Stav'], ...polozky.map((x) => [x.Title, x.Author?.Title || '', x.Stav || ''])];
    p.addSlide().addTable(radky.map((r) => r.map((text) => ({ text }))), { x: 0.5, y: 1, w: 12, fontSize: 14 });
    await this._ulozDokument('exporty', 'pozadavky.pptx', new Uint8Array(await p.write({ outputType: 'arraybuffer' }) as ArrayBuffer));
  }

  private async _excel(polozky: IPolozka[]): Promise<void> {
    const ExcelJS = (await import(/* webpackChunkName: 'lib-exceljs' */ 'exceljs')).default;
    const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet('Požadavky');
    ws.columns = [{ header: 'Požadavek', key: 'n', width: 40 }, { header: 'Zadal', key: 'z', width: 25 }, { header: 'Stav', key: 's', width: 14 }, { header: 'Kdy', key: 'd', width: 14 }];
    ws.getRow(1).font = { bold: true };
    polozky.forEach((x) => ws.addRow({ n: x.Title, z: x.Author?.Title || '', s: x.Stav || '', d: new Date(x.Created) }));
    ws.getColumn('d').numFmt = 'd. m. yyyy';
    await this._ulozDokument('exporty', 'pozadavky.xlsx', new Uint8Array(await wb.xlsx.writeBuffer()));
  }

  // ===== egd-externi-api: _firma (doslova ze skillu) =====
  // ARES: firma podle IČO
  private async _firma(ico: string): Promise<IFirma> {
    const r = await this.context.httpClient.get(
      `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${encodeURIComponent(ico)}`,
      HttpClient.configurations.v1);
    if (!r.ok) throw new Error(`ARES vrátil ${r.status}`);
    return (await r.json()) as IFirma;
  }

  private async _pocasi(): Promise<void> {
    const r = await this.context.httpClient.get(
      'https://api.open-meteo.com/v1/forecast?latitude=49.19&longitude=16.61&current=temperature_2m', HttpClient.configurations.v1);
    if (!r.ok) throw new Error(`Open-Meteo vrátil ${r.status}`);
    const j = await r.json();
    this._log(`Brno teď: ${j.current.temperature_2m} °C`);
  }

  private async _cnb(): Promise<void> {
    try {
      const r = await this.context.httpClient.get('https://api.cnb.cz/cnbapi/exrates/daily?lang=CZ', HttpClient.configurations.v1);
      this._log(`ČNB status ${r.status}`);
    } catch (e) {
      // Bez CORS prohlížeč odpověď zahodí a fetch skončí výjimkou TypeError („Failed to fetch“).
      throw new Error(`ČNB nejde volat z prohlížeče (CORS). Původní chyba: ${(e as Error).name}: ${(e as Error).message}`);
    }
  }

  private _ja(): number {
    return Number(this.context.pageContext.legacyPageContext.userId);
  }

  private _formular(): HTMLElement {
    const nazev = el('input', { id: 'evidence-nazev', type: 'text', required: 'required', maxlength: '255' }) as HTMLInputElement;
    const popis = el('textarea', { id: 'evidence-popis', rows: '5' }) as HTMLTextAreaElement;
    const odeslat = el('button', { type: 'submit', class: styles.primarni }, ['Odeslat ke schválení']) as HTMLButtonElement;
    const form = el('form', { class: styles.formular }, [
      el('label', { for: 'evidence-nazev' }, ['Co potřebujete (krátce)']), nazev,
      el('label', { for: 'evidence-popis' }, ['Popis']), popis,
      odeslat
    ]);
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (!nazev.value.trim()) return;
      odeslat.disabled = true;
      this._zapis('/items', { Title: nazev.value.trim(), Popis: popis.value.trim(), Stav: STAV_NOVY })
        .then(async () => { await this._nacti(); this._zprava = 'Požadavek je odeslaný.'; this._zalozka = 'moje'; this.render(); })
        .catch((e: Error) => { this._chyba = e.message; this.render(); });
    });
    return form;
  }

  private _tabulka(polozky: IPolozka[], sAkcemi: boolean): HTMLElement {
    if (!polozky.length) return el('p', { class: styles.prazdno }, [sAkcemi ? 'Nic nečeká na schválení.' : 'Zatím tu nic není.']);
    const hlavicky = ['Požadavek', 'Zadal', 'Kdy', 'Stav', sAkcemi ? 'Rozhodnutí' : 'Komentář'];
    const tbody = el('tbody');
    for (const p of polozky) {
      const posledni = sAkcemi ? this._akce(p) : el('span', {}, [p.Komentar || '']);
      tbody.appendChild(el('tr', {}, [
        el('td', {}, [el('strong', {}, [p.Title]), el('div', { class: styles.popis }, [p.Popis || ''])]),
        el('td', {}, [p.Author?.Title || '']),
        el('td', {}, [new Date(p.Created).toLocaleDateString('cs-CZ')]),
        el('td', {}, [el('span', { class: `${styles.stav} ${tridaStavu(p.Stav)}` }, [p.Stav || STAV_NOVY])]),
        el('td', {}, [posledni])
      ]));
    }
    return el('table', { class: styles.tabulka }, [el('thead', {}, [el('tr', {}, hlavicky.map((h) => el('th', {}, [h])))]), tbody]);
  }

  private _akce(p: IPolozka): HTMLElement {
    const komentar = el('input', { type: 'text', placeholder: 'Komentář (nepovinný)', 'aria-label': `Komentář k ${p.Title}` }) as HTMLInputElement;
    const rozhodni = (stav: string): void => {
      this._zapis(`/items(${p.Id})`, { Stav: stav, Komentar: komentar.value.trim() }, true)
        .then(async () => { await this._nacti(); this._zprava = `"${p.Title}": ${stav}.`; this.render(); })
        .catch((e: Error) => { this._chyba = e.message; this.render(); });
    };
    const ano = el('button', { type: 'button', class: styles.primarni }, ['Schválit']);
    const ne = el('button', { type: 'button', class: styles.sekundarni }, ['Zamítnout']);
    ano.addEventListener('click', () => rozhodni(STAV_SCHVALENO));
    ne.addEventListener('click', () => rozhodni(STAV_ZAMITNUTO));
    return el('div', { class: styles.akce }, [komentar, ano, ne]);
  }

  // ---------- zivotni cyklus ----------

  protected async onInit(): Promise<void> {
    await this._nacti();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected onPropertyPaneConfigurationChanged(): void {
    this._nacti().then(() => this.render()).catch(() => { /* chyba je v this._chyba */ });
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [{
        header: { description: 'Nastavení evidence' },
        groups: [{
          groupName: 'Základní',
          groupFields: [
            PropertyPaneTextField('nadpis', { label: 'Nadpis appky' }),
            PropertyPaneTextField('seznam', { label: 'Název seznamu na tomto webu' })
          ]
        }]
      }]
    };
  }
}

function tridaStavu(stav?: string): string {
  if (stav === STAV_SCHVALENO) return styles.schvaleno;
  if (stav === STAV_ZAMITNUTO) return styles.zamitnuto;
  return styles.novy;
}

// Prvek postaveny pres DOM: texty jdou pres textContent, takze nic z dat se nespusti jako HTML.
function el(tag: string, atributy: Record<string, string> = {}, deti: (Node | string)[] = []): HTMLElement {
  const e = document.createElement(tag);
  for (const k of Object.keys(atributy)) if (atributy[k] !== "") e.setAttribute(k, atributy[k]);
  for (const d of deti) e.appendChild(typeof d === 'string' ? document.createTextNode(d) : d);
  return e;
}
