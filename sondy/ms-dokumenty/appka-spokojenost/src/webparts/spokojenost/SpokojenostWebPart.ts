// Spokojenost s prostredim kancelare dnes - prvni appka z workshopu EG.D.
// Kazdy da jednim kliknutim hodnoceni 1-5 (jedno za den, jde zmenit), pod tim je maly dashboard:
// dnesni pocet hlasu, prumer a rozlozeni, a prumery za poslednich 7 dni.
// Data lezi v SharePoint seznamu na stejnem webu (vychozi nazev "Spokojenost", sloupce Hodnoceni a Den).

import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient, type SPHttpClientResponse, HttpClient, MSGraphClientV3 } from '@microsoft/sp-http';

interface IFirma { ico: string; obchodniJmeno: string; sidlo?: { textovaAdresa?: string } }

import styles from './SpokojenostWebPart.module.scss';

export interface ISpokojenostWebPartProps {
  nadpis: string;
  seznam: string;
}

interface IHlas {
  Id: number;
  Hodnoceni?: number;
  Den?: string;
  AuthorId: number;
}

const STUPNE: [number, string][] = [
  [1, 'Velmi nespokojen/a'], [2, 'Spíš nespokojen/a'], [3, 'Tak napůl'], [4, 'Spíš spokojen/a'], [5, 'Velmi spokojen/a']
];
const DNU_V_PREHLEDU = 7;
// Radi se podle ID: je vzdy indexovane, takze dotaz projde i nad 5000 polozkami (Created by spadl na throttling).
const MAX_HLASU = 2000;

const JSON_HLAVICKY = {
  Accept: 'application/json;odata=nometadata',
  'Content-Type': 'application/json;odata=nometadata'
};

// Den jako text RRRR-MM-DD v mistnim case prohlizece (bez posunu casovych pasem).
function den(d: Date): string {
  const p = (n: number): string => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default class SpokojenostWebPart extends BaseClientSideWebPart<ISpokojenostWebPartProps> {
  private _hlasy: IHlas[] = [];
  private _chyba = '';
  private _zprava = '';
  private _ukladam = false;

  // ---------- data ----------

  private _url(cesta: string): string {
    const seznam = (this.properties.seznam || 'Spokojenost').replace(/'/g, "''");
    return `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(seznam)}')${cesta}`;
  }

  private async _popisChyby(r: SPHttpClientResponse): Promise<string> {
    if (r.status === 404) return `Seznam "${this.properties.seznam}" na tomhle webu není. Založte ho (agent: příkaz "seznam") nebo opravte název v nastavení web partu.`;
    if (r.status === 403) return 'Hlasovat nemůžete: na seznamu nemáte právo přidávat položky. Požádejte vlastníka webu o roli Člen (Member).';
    let text = '';
    try { text = (await r.text()).slice(0, 300); } catch { /* nic */ }
    return `SharePoint vrátil chybu ${r.status}. ${text}`;
  }

  private async _nacti(): Promise<void> {
    this._chyba = '';
    try {
      const r = await this.context.spHttpClient.get(
        this._url(`/items?$select=Id,Hodnoceni,Den,AuthorId&$orderby=ID desc&$top=${MAX_HLASU}`),
        SPHttpClient.configurations.v1, { headers: JSON_HLAVICKY });
      if (!r.ok) throw new Error(await this._popisChyby(r));
      this._hlasy = ((await r.json()) as { value: IHlas[] }).value;
    } catch (e) {
      this._chyba = (e as Error).message;
    }
  }

  private async _hlasuj(hodnota: number): Promise<void> {
    const dnes = den(new Date());
    const muj = this._mujHlas(dnes);
    const telo = JSON.stringify({ Title: dnes, Den: dnes, Hodnoceni: hodnota });
    const headers: Record<string, string> = { ...JSON_HLAVICKY };
    if (muj) { headers['IF-MATCH'] = '*'; headers['X-HTTP-Method'] = 'MERGE'; }
    const r = await this.context.spHttpClient.post(this._url(muj ? `/items(${muj.Id})` : '/items'),
      SPHttpClient.configurations.v1, { headers, body: telo });
    if (!r.ok) throw new Error(await this._popisChyby(r));
    this._zprava = muj ? `Změněno na ${hodnota}. Díky!` : `Zapsáno: ${hodnota}. Díky!`;
  }

  private _ja(): number {
    return Number(this.context.pageContext.legacyPageContext.userId);
  }

  private _mujHlas(dnes: string): IHlas | undefined {
    return this._hlasy.find((h) => h.Den === dnes && h.AuthorId === this._ja());
  }

  // ---------- vykresleni ----------

  public render(): void {
    const dnes = den(new Date());
    const muj = this._mujHlas(dnes);
    const koren = el('section', { class: styles.appka });
    koren.appendChild(el('h1', {}, [this.properties.nadpis || 'Spokojenost s prostředím kanceláře dnes']));

    // hlasovani
    const karta = el('div', { class: styles.karta });
    karta.appendChild(el('p', { class: styles.otazka }, ['Jak jste dnes spokojeni s prostředím kanceláře?']));
    const radek = el('div', { class: styles.tlacitka, role: 'group', 'aria-label': 'Hodnocení 1 až 5' });
    for (const [n, popis] of STUPNE) {
      const b = el('button', {
        type: 'button',
        class: `${styles.stupen} ${muj?.Hodnoceni === n ? styles.vybrany : ''}`,
        'aria-pressed': muj?.Hodnoceni === n ? 'true' : 'false',
        'aria-label': `${n} – ${popis}`
      }, [el('span', { class: styles.cislo }, [String(n)]), el('span', { class: styles.popisek }, [popis])]) as HTMLButtonElement;
      b.disabled = this._ukladam;
      b.addEventListener('click', () => {
        this._ukladam = true; this._zprava = ''; this.render();
        this._hlasuj(n)
          .then(() => this._nacti())
          .catch((e: Error) => { this._chyba = e.message; })
          .then(() => { this._ukladam = false; this.render(); })
          .catch(() => { /* nic */ });
      });
      radek.appendChild(b);
    }
    karta.appendChild(radek);
    karta.appendChild(el('p', { class: styles.poznamka }, [muj ? `Dnes jste dali ${muj.Hodnoceni}. Kliknutím na jiné číslo hlas změníte.` : 'Jeden hlas na den, jde ho později změnit.']));
    koren.appendChild(karta);

    if (this._chyba) koren.appendChild(el('p', { class: styles.chyba, role: 'alert' }, [this._chyba]));
    if (this._zprava) koren.appendChild(el('p', { class: styles.zprava, role: 'status' }, [this._zprava]));

    koren.appendChild(this._dashboard(dnes));
    koren.appendChild(this._exporty());
    this.domElement.replaceChildren(koren);
  }

  private _dashboard(dnes: string): HTMLElement {
    const dnesni = this._hlasy.filter((h) => h.Den === dnes && h.Hodnoceni);
    const prumer = (xs: IHlas[]): number => xs.reduce((s, h) => s + (h.Hodnoceni || 0), 0) / (xs.length || 1);
    const fmt = (x: number): string => x.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const dash = el('div', { class: styles.dashboard });
    // dnes: cisla
    dash.appendChild(el('div', { class: styles.dlazdice }, [
      el('div', { class: styles.hodnota }, [String(dnesni.length)]), el('div', { class: styles.nazev }, ['hlasů dnes'])
    ]));
    dash.appendChild(el('div', { class: styles.dlazdice }, [
      el('div', { class: styles.hodnota }, [dnesni.length ? fmt(prumer(dnesni)) : '–']), el('div', { class: styles.nazev }, ['průměr dnes (1–5)'])
    ]));

    // dnes: rozlozeni
    const maxPocet = Math.max(1, ...STUPNE.map(([n]) => dnesni.filter((h) => h.Hodnoceni === n).length));
    const rozlozeni = el('div', { class: styles.panel }, [el('h2', {}, ['Rozložení dnes'])]);
    for (const [n] of STUPNE) {
      const pocet = dnesni.filter((h) => h.Hodnoceni === n).length;
      const sloupec = el('div', { class: styles.pruhVypln });
      sloupec.style.width = `${(pocet / maxPocet) * 100}%`;
      rozlozeni.appendChild(el('div', { class: styles.pruh }, [
        el('span', { class: styles.pruhCislo }, [String(n)]),
        el('div', { class: styles.pruhStopa }, [sloupec]),
        el('span', { class: styles.pruhPocet }, [String(pocet)])
      ]));
    }
    dash.appendChild(rozlozeni);

    // poslednich 7 dni
    const tyden = el('div', { class: styles.panel }, [el('h2', {}, [`Posledních ${DNU_V_PREHLEDU} dní (průměr)`])]);
    const dny = el('div', { class: styles.dny });
    for (let i = DNU_V_PREHLEDU - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const klic = den(d);
      const hlasy = this._hlasy.filter((h) => h.Den === klic && h.Hodnoceni);
      const p = hlasy.length ? prumer(hlasy) : 0;
      const sloupec = el('div', { class: styles.denVypln });
      sloupec.style.height = `${(p / 5) * 100}%`;
      dny.appendChild(el('div', { class: styles.den, title: `${klic}: ${hlasy.length} hlasů` }, [
        el('span', { class: styles.denHodnota }, [hlasy.length ? fmt(p) : '–']),
        el('div', { class: styles.denStopa }, [sloupec]),
        el('span', { class: styles.denNazev }, [d.toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric' })])
      ]));
    }
    tyden.appendChild(dny);
    dash.appendChild(tyden);
    return dash;
  }

  // ---------- exporty (miniskill egd-dokumenty) a cizi API (egd-externi-api) ----------

  // Tlačítka exportu pod dashboardem. Výsledek nebo chyba se vypíše do řádku #log.
  private _exporty(): HTMLElement {
    const log = el('p', { id: 'log', role: 'status' }, [this._logText]);
    const box = el('div', { class: styles.tlacitka });
    const akce: [string, string, () => Promise<void>][] = [
      ['docx', 'Word', () => this._word(this._hlasy)],
      ['graphpdf', 'PDF (z Wordu)', async () => { await this._word(this._hlasy); await this._pdfZWordu('exporty', 'spokojenost.docx'); }],
      ['pdf', 'PDF (pdf-lib)', () => this._pdfBezGraphu(this._hlasy)],
      ['xlsx', 'Excel', () => this._excel(this._hlasy)],
      ['pptx', 'PowerPoint', () => this._pptx(this._hlasy)],
      ['ares', 'ARES', async () => { const f = await this._firma('00177041'); this._log(`ARES: ${f.obchodniJmeno}`); }],
    ];
    for (const [k, text, fn] of akce) {
      const b = el('button', { type: 'button', 'data-k': k }, [text]);
      b.addEventListener('click', () => {
        fn().then(() => this._log(`HOTOVO ${k}`)).catch((e: Error) => this._log(`CHYBA ${k}: ${e.message}`));
      });
      box.appendChild(b);
    }
    return el('div', { class: styles.panel }, [el('h2', {}, ['Export']), box, log]);
  }

  private _logText = '';
  private _log(s: string): void {
    this._logText = s;
    const l = this.domElement.querySelector('#log'); if (l) l.textContent = s;
  }

  // Souhrn hlasů po dnech: [den, počet hlasů, průměr], nejnovější den nahoře.
  private _souhrn(hlasy: IHlas[]): [string, number, string][] {
    // obyčejný objekt místo Map: šablona překládá do ES5 a spread nad Map.entries() tam neprojde (TS2802)
    const dny: Record<string, number[]> = {};
    for (const h of hlasy) if (h.Den && h.Hodnoceni) (dny[h.Den] = dny[h.Den] || []).push(h.Hodnoceni);
    return Object.keys(dny).sort().reverse().map((d): [string, number, string] =>
      [d, dny[d].length, (dny[d].reduce((s, x) => s + x, 0) / dny[d].length).toLocaleString('cs-CZ', { maximumFractionDigits: 1 })]);
  }

  // Nabídne stažení a uloží bajty do výchozí knihovny webu (Dokumenty / Documents); chybějící složku založí.
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
  }

  private async _word(hlasy: IHlas[]): Promise<void> {
    const d = await import(/* webpackChunkName: 'lib-docx' */ 'docx');
    const bunka = (t: string, tucne = false): InstanceType<typeof d.TableCell> =>
      new d.TableCell({ children: [new d.Paragraph({ children: [new d.TextRun({ text: t, bold: tucne })] })] });
    const doc = new d.Document({ sections: [{ children: [
      new d.Paragraph({ heading: d.HeadingLevel.HEADING_1, text: 'Spokojenost s prostředím kanceláře' }),
      new d.Table({ width: { size: 100, type: d.WidthType.PERCENTAGE }, rows: [
        new d.TableRow({ children: ['Den', 'Hlasů', 'Průměr (1–5)'].map((h) => bunka(h, true)) }),
        ...this._souhrn(hlasy).map((r) => new d.TableRow({ children: r.map((x) => bunka(String(x))) }))
      ] })
    ] }] });
    await this._ulozDokument('exporty', 'spokojenost.docx', new Uint8Array(await d.Packer.toArrayBuffer(doc)));
  }

  private async _excel(hlasy: IHlas[]): Promise<void> {
    const ExcelJS = (await import(/* webpackChunkName: 'lib-exceljs' */ 'exceljs')).default;
    const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet('Hlasy');
    ws.columns = [{ header: 'Den', key: 'd', width: 14 }, { header: 'Hodnocení', key: 'h', width: 12 }];
    ws.getRow(1).font = { bold: true };
    hlasy.forEach((h) => ws.addRow({ d: h.Den || '', h: h.Hodnoceni }));
    await this._ulozDokument('exporty', 'spokojenost.xlsx', new Uint8Array(await wb.xlsx.writeBuffer()));
  }

  private async _pptx(hlasy: IHlas[]): Promise<void> {
    const P = (await import(/* webpackChunkName: 'lib-pptx' */ 'pptxgenjs')).default;
    const p = new P(); p.layout = 'LAYOUT_WIDE';
    p.addSlide().addText('Spokojenost s prostředím kanceláře', { x: 0.5, y: 1.5, w: 12, h: 1.2, fontSize: 36, bold: true });
    const radky = [['Den', 'Hlasů', 'Průměr (1–5)'], ...this._souhrn(hlasy).map((r) => r.map(String))];
    p.addSlide().addTable(radky.map((r) => r.map((text) => ({ text }))), { x: 0.5, y: 1, w: 12, fontSize: 14 });
    await this._ulozDokument('exporty', 'spokojenost.pptx', new Uint8Array(await p.write({ outputType: 'arraybuffer' }) as ArrayBuffer));
  }

  private async _pdfZWordu(slozka: string, nazev: string): Promise<void> {
    const pc = this.context.pageContext;
    const graf: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
    const host = new URL(pc.web.absoluteUrl).hostname;
    const cesta = `/sites/${host},${pc.site.id.toString()},${pc.web.id.toString()}/drive/root:/${slozka}/${nazev}:/content?format=pdf`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdf: Blob = await (graf.api(cesta) as any).responseType('blob').get();
    await this._ulozDokument(slozka, nazev.replace(/\.docx$/i, '.pdf'), new Uint8Array(await pdf.arrayBuffer()));
  }

  private async _bajtyZKnihovny(cestaVKnihovne: string): Promise<Uint8Array> {
    const w = this.context.pageContext.web.absoluteUrl;
    const koren = await (await this.context.spHttpClient.get(
      `${w}/_api/web/defaultDocumentLibrary/rootFolder?$select=ServerRelativeUrl`, SPHttpClient.configurations.v1)).json();
    const r = await this.context.spHttpClient.get(
      `${w}/_api/web/GetFileByServerRelativePath(decodedurl='${koren.ServerRelativeUrl}/${cestaVKnihovne}')/$value`, SPHttpClient.configurations.v1);
    if (!r.ok) throw new Error(`Soubor ${cestaVKnihovne}: ${r.status}`);
    return new Uint8Array(await r.arrayBuffer());
  }

  private async _pdfBezGraphu(hlasy: IHlas[]): Promise<void> {
    const bajtyFontu = await this._bajtyZKnihovny('assets/Roboto-Regular.ttf');
    const [{ PDFDocument }, fk] = await Promise.all([
      import(/* webpackChunkName: 'lib-pdf' */ 'pdf-lib'), import(/* webpackChunkName: 'lib-pdf' */ '@pdf-lib/fontkit')]);
    const pdf = await PDFDocument.create(); pdf.registerFontkit(fk.default);
    const font = await pdf.embedFont(bajtyFontu, { subset: true });
    const strana = pdf.addPage([595, 842]); let y = 790;
    strana.drawText('Spokojenost s prostředím kanceláře – přehled po dnech', { x: 40, y, size: 14, font }); y -= 28;
    for (const [d, n, p] of this._souhrn(hlasy)) { strana.drawText(`${d}   hlasů: ${n}   průměr: ${p}`, { x: 40, y, size: 11, font }); y -= 16; }
    await this._ulozDokument('exporty', 'spokojenost-prehled.pdf', await pdf.save());   // jiný název než PDF z Wordu, ať se nepřepíší
  }

  // ARES: firma podle IČO (miniskill egd-externi-api)
  private async _firma(ico: string): Promise<IFirma> {
    const r = await this.context.httpClient.get(
      `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${encodeURIComponent(ico)}`,
      HttpClient.configurations.v1);
    if (!r.ok) throw new Error(`ARES vrátil ${r.status}`);
    return (await r.json()) as IFirma;
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
        header: { description: 'Nastavení appky' },
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

// Prvek postaveny pres DOM: texty jdou pres textContent, takze nic z dat se nespusti jako HTML.
function el(tag: string, atributy: Record<string, string> = {}, deti: (Node | string)[] = []): HTMLElement {
  const e = document.createElement(tag);
  for (const k of Object.keys(atributy)) if (atributy[k] !== '') e.setAttribute(k, atributy[k]);
  for (const d of deti) e.appendChild(typeof d === 'string' ? document.createTextNode(d) : d);
  return e;
}
