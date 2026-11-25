// Spokojenost s prostredim kancelare dnes - prvni appka z workshopu EG.D.
// Kazdy da jednim kliknutim hodnoceni 1-5 (jedno za den, jde zmenit), pod tim je maly dashboard:
// dnesni pocet hlasu, prumer a rozlozeni, a prumery za poslednich 7 dni.
// Data lezi v SharePoint seznamu na stejnem webu (vychozi nazev "Spokojenost", sloupce Hodnoceni a Den).

import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient, type SPHttpClientResponse } from '@microsoft/sp-http';

import styles from './SpokojenostWebPart.module.scss';

export interface ISpokojenostWebPartProps {
  nadpis: string;
  seznam: string;
}

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const DRAWING_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const SPREADSHEET_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const RELATIONSHIPS_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

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
  private _upravujeDokumenty = false;
  private _upravaStatus = '';

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
    koren.appendChild(this._panelUpravy());
    this.domElement.replaceChildren(koren);
  }

  private _panelUpravy(): HTMLElement {
    const status = el('p', { class: styles.statusDokumentu, role: 'status' }, [this._upravaStatus]);
    const akce: [string, () => Promise<number>][] = [
      ['Vyplnit šablonu', () => this._vyplnitSablonu()],
      ['Smlouva', () => this._upravitSmlouvu()],
      ['Rozpočet', () => this._upravitRozpocet()],
      ['Prezentace', () => this._upravitPrezentaci()]
    ];
    const tlacitka = el('div', { class: styles.upravaTlacitka, role: 'group', 'aria-label': 'Úprava dokumentů' });
    for (const [popis, fn] of akce) {
      const b = el('button', { type: 'button', class: styles.akceDokumentu }, [popis]) as HTMLButtonElement;
      b.disabled = this._upravujeDokumenty;
      b.addEventListener('click', () => {
        this._upravujeDokumenty = true;
        this._upravaStatus = `Zpracovávám: ${popis}…`;
        this.render();
        fn()
          .then((pocet) => { this._upravaStatus = `Hotovo: ${popis}; počet změn/náhrad: ${pocet}. Výsledek je ve složce uprava/copilot.`; })
          .catch((e: unknown) => { this._upravaStatus = `Chyba: ${e instanceof Error ? e.message : String(e)}`; })
          .then(() => { this._upravujeDokumenty = false; this.render(); })
          .catch((e: unknown) => { this._upravaStatus = `Chyba: ${e instanceof Error ? e.message : String(e)}`; });
      });
      tlacitka.appendChild(b);
    }
    return el('section', { class: styles.panel }, [
      el('h2', {}, ['Úprava dokumentů']),
      tlacitka,
      status
    ]);
  }

  private async _hlasyCelkem(): Promise<number> {
    let url = this._url('/items?$select=Id&$orderby=ID asc&$top=2000');
    let pocet = 0;
    while (url) {
      const r = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1, { headers: JSON_HLAVICKY });
      if (!r.ok) throw new Error(`Načtení počtu hlasů: ${r.status}`);
      const j = await r.json() as { value: { Id: number }[]; '@odata.nextLink'?: string; 'odata.nextLink'?: string };
      pocet += j.value.length;
      url = j['@odata.nextLink'] || j['odata.nextLink'] || '';
    }
    return pocet;
  }

  private async _korenDokumentu(): Promise<string> {
    const web = this.context.pageContext.web.absoluteUrl;
    const r = await this.context.spHttpClient.get(
      `${web}/_api/web/defaultDocumentLibrary/rootFolder?$select=ServerRelativeUrl`,
      SPHttpClient.configurations.v1);
    if (!r.ok) throw new Error(`Načtení knihovny Dokumenty: ${r.status}`);
    return ((await r.json()) as { ServerRelativeUrl: string }).ServerRelativeUrl;
  }

  private async _bajtyDokumentu(cesta: string): Promise<ArrayBuffer> {
    const koren = await this._korenDokumentu();
    const url = `${this.context.pageContext.web.absoluteUrl}/_api/web/GetFileByServerRelativePath(decodedurl='${encodeURIComponent(`${koren}/${cesta}`)}')/$value`;
    const r = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    if (!r.ok) throw new Error(`Načtení ${cesta}: ${r.status}`);
    return r.arrayBuffer();
  }

  private async _ulozitDokument(nazev: string, bajty: ArrayBuffer | Uint8Array): Promise<void> {
    const web = this.context.pageContext.web.absoluteUrl;
    const koren = await this._korenDokumentu();
    const cil = `${koren}/uprava/copilot`;
    const nahrat = (): Promise<SPHttpClientResponse> => this.context.spHttpClient.post(
      `${web}/_api/web/GetFolderByServerRelativePath(decodedurl='${encodeURIComponent(cil)}')/Files/AddUsingPath(decodedurl='${encodeURIComponent(nazev)}',overwrite=true)`,
      SPHttpClient.configurations.v1,
      { body: bajty });
    let r = await nahrat();
    if (r.status === 404) {
      const s = await this.context.spHttpClient.post(
        `${web}/_api/web/folders/AddUsingPath(DecodedUrl='${encodeURIComponent(cil)}',overwrite=false)`,
        SPHttpClient.configurations.v1, {});
      if (!s.ok && s.status !== 409) throw new Error(`Založení složky uprava/copilot: ${s.status}`);
      r = await nahrat();
    }
    if (!r.ok) throw new Error(`Uložení ${nazev}: ${r.status}`);
  }

  private async _vyplnitSablonu(): Promise<number> {
    const sablona = await this._bajtyDokumentu('uprava/vstup/sablona-word.docx');
    const Docxtemplater = (await import(/* webpackChunkName: 'lib-docxtemplater' */ 'docxtemplater')).default;
    const PizZip = (await import(/* webpackChunkName: 'lib-docxtemplater' */ 'pizzip')).default;
    const doc = new Docxtemplater(new PizZip(sablona), {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' }
    });
    const data = {
      jmeno: this.context.pageContext.user.displayName,
      utvar: 'Distribuce Brno',
      datum: new Date().toLocaleDateString('cs-CZ'),
      hodnoceni: String(await this._hlasyCelkem())
    };
    const text = doc.getFullText();
    const pocet = Object.keys(data).reduce((součet, klic) => součet + text.split(`{{${klic}}}`).length - 1, 0);
    doc.render(data);
    const vystup = doc.getZip().generate({ type: 'arraybuffer', compression: 'DEFLATE' }) as ArrayBuffer;
    await this._ulozitDokument('sablona-word-vyplnena.docx', vystup);
    return pocet;
  }

  private async _nahraditDocx(nazev: string, novyNazev: string, mapa: [string, string][]): Promise<number> {
    const puvodni = await this._bajtyDokumentu(`uprava/vstup/${nazev}`);
    const JSZip = (await import(/* webpackChunkName: 'lib-jszip' */ 'jszip')).default;
    const zip = await JSZip.loadAsync(puvodni);
    let pocet = 0;
    const soubory = Object.keys(zip.files).filter((jmeno) =>
      /^word\/(document|header\d*|footer\d*|footnotes|endnotes|comments)\.xml$/.test(jmeno));
    for (const jmeno of soubory) {
      const soubor = zip.file(jmeno);
      if (!soubor) continue;
      const zmeny = nahradVOdstavcich(await soubor.async('string'), WORD_NS, mapa);
      zip.file(jmeno, zmeny.xml);
      pocet += zmeny.pocet;
    }
    await this._ulozitDokument(novyNazev, await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' }));
    return pocet;
  }

  private async _upravitSmlouvu(): Promise<number> {
    return this._nahraditDocx('smlouva.docx', 'smlouva-upravena.docx', [['Stavby Morava', 'Elektro Vysočina']]);
  }

  private async _upravitPrezentaci(): Promise<number> {
    const puvodni = await this._bajtyDokumentu('uprava/vstup/prezentace.pptx');
    const JSZip = (await import(/* webpackChunkName: 'lib-jszip' */ 'jszip')).default;
    const zip = await JSZip.loadAsync(puvodni);
    let pocet = 0;
    const snimky = Object.keys(zip.files).filter((jmeno) => /^ppt\/slides\/slide\d+\.xml$/.test(jmeno));
    for (const jmeno of snimky) {
      const soubor = zip.file(jmeno);
      if (!soubor) continue;
      const zmeny = nahradVOdstavcich(await soubor.async('string'), DRAWING_NS, [['Rozvodna Sever', 'Rozvodna Jih']]);
      zip.file(jmeno, zmeny.xml);
      pocet += zmeny.pocet;
    }
    await this._ulozitDokument('prezentace-upravena.pptx', await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' }));
    return pocet;
  }

  private async _upravitRozpocet(): Promise<number> {
    const puvodni = await this._bajtyDokumentu('uprava/vstup/rozpocet.xlsx');
    const JSZip = (await import(/* webpackChunkName: 'lib-jszip' */ 'jszip')).default;
    const zip = await JSZip.loadAsync(puvodni);
    const parse = (xml: string): XMLDocument => {
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      if (doc.getElementsByTagName('parsererror').length) throw new Error('Neplatné XML sešitu.');
      return doc;
    };
    const workbookFile = zip.file('xl/workbook.xml');
    const relsFile = zip.file('xl/_rels/workbook.xml.rels');
    if (!workbookFile || !relsFile) throw new Error('Sešit neobsahuje očekávanou strukturu Excelu.');
    const workbook = parse(await workbookFile.async('string'));
    const rels = parse(await relsFile.async('string'));
    const sheets = workbook.getElementsByTagNameNS(SPREADSHEET_NS, 'sheet');
    const sheet = Array.prototype.slice.call(sheets).find((s: Element) => s.getAttribute('name')?.toLowerCase() === 'rozpocet') || sheets.item(0);
    if (!sheet) throw new Error('Sešit neobsahuje list.');
    const relationId = sheet.getAttributeNS(RELATIONSHIPS_NS, 'id');
    const relation = Array.prototype.slice.call(rels.getElementsByTagName('*')).find((r: Element) => r.getAttribute('Id') === relationId) as Element | undefined;
    const target = relation?.getAttribute('Target');
    if (!target) throw new Error('Cestu k listu sešitu se nepodařilo načíst.');
    const cast = target.startsWith('/') ? target.slice(1) : `xl/${target}`;
    const castList = cast.split('/');
    const normalizovana: string[] = [];
    for (const castCast of castList) {
      if (castCast === '..') normalizovana.pop();
      else if (castCast && castCast !== '.') normalizovana.push(castCast);
    }
    const sheetPath = normalizovana.join('/');
    const sheetFile = zip.file(sheetPath);
    if (!sheetFile) throw new Error(`List sešitu nebyl nalezen: ${sheetPath}`);
    const sheetXml = parse(await sheetFile.async('string'));
    const sheetData = sheetXml.getElementsByTagNameNS(SPREADSHEET_NS, 'sheetData').item(0);
    if (!sheetData) throw new Error('List sešitu neobsahuje data.');
    const nastavitBunku = (adresa: string, hodnota: number | string): void => {
      const rowNumber = Number(adresa.match(/\d+$/)?.[0]);
      const rows = Array.prototype.slice.call(sheetData.getElementsByTagNameNS(SPREADSHEET_NS, 'row')) as Element[];
      let row = rows.find((e) => Number(e.getAttribute('r')) === rowNumber);
      if (!row) {
        row = sheetXml.createElementNS(SPREADSHEET_NS, 'row');
        row.setAttribute('r', String(rowNumber));
        const after = rows.find((e) => Number(e.getAttribute('r')) > rowNumber);
        sheetData.insertBefore(row, after || null);
      }
      const cells = Array.prototype.slice.call(row.getElementsByTagNameNS(SPREADSHEET_NS, 'c')) as Element[];
      let cell = cells.find((e) => e.getAttribute('r') === adresa);
      if (!cell) {
        cell = sheetXml.createElementNS(SPREADSHEET_NS, 'c');
        cell.setAttribute('r', adresa);
        const col = adresa.replace(/\d+$/, '');
        const colNumber = columnNumber(col);
        const after = cells.find((e) => columnNumber((e.getAttribute('r') || '').replace(/\d+$/, '')) > colNumber);
        row.insertBefore(cell, after || null);
      }
      while (cell.firstChild) cell.removeChild(cell.firstChild);
      if (typeof hodnota === 'number') {
        cell.removeAttribute('t');
        const value = sheetXml.createElementNS(SPREADSHEET_NS, 'v');
        value.textContent = String(hodnota);
        cell.appendChild(value);
      } else {
        cell.setAttribute('t', 'inlineStr');
        const inline = sheetXml.createElementNS(SPREADSHEET_NS, 'is');
        const text = sheetXml.createElementNS(SPREADSHEET_NS, 't');
        text.textContent = hodnota;
        inline.appendChild(text);
        cell.appendChild(inline);
      }
    };
    nastavitBunku('B2', 125000);
    nastavitBunku('C2', 'ok');
    nastavitBunku('B3', 355000);
    nastavitBunku('C3', 'ok');
    zip.file(sheetPath, new XMLSerializer().serializeToString(sheetXml));

    const workbookRoot = workbook.documentElement;
    let calcPr = workbook.getElementsByTagNameNS(SPREADSHEET_NS, 'calcPr').item(0);
    if (!calcPr) {
      calcPr = workbook.createElementNS(SPREADSHEET_NS, 'calcPr');
      workbookRoot.appendChild(calcPr);
    }
    calcPr.setAttribute('calcMode', 'auto');
    calcPr.setAttribute('fullCalcOnLoad', '1');
    calcPr.setAttribute('forceFullCalc', '1');
    zip.file('xl/workbook.xml', new XMLSerializer().serializeToString(workbook));

    const worksheetPaths = Object.keys(zip.files).filter((jmeno) => /^xl\/worksheets\/[^/]+\.xml$/.test(jmeno));
    for (const jmeno of worksheetPaths) {
      const soubor = zip.file(jmeno);
      if (!soubor) continue;
      const xml = parse(await soubor.async('string'));
      const vzorce = Array.prototype.slice.call(xml.getElementsByTagNameNS(SPREADSHEET_NS, 'c')) as Element[];
      for (const bunka of vzorce) {
        if (bunka.getElementsByTagNameNS(SPREADSHEET_NS, 'f').length) {
          const hodnota = bunka.getElementsByTagNameNS(SPREADSHEET_NS, 'v').item(0);
          if (hodnota) bunka.removeChild(hodnota);
        }
      }
      zip.file(jmeno, new XMLSerializer().serializeToString(xml));
    }
    await this._ulozitDokument('rozpocet-upraven.xlsx', await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' }));
    return 4;
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

function columnNumber(column: string): number {
  let number = 0;
  for (const letter of column.toUpperCase()) number = number * 26 + letter.charCodeAt(0) - 64;
  return number;
}

function nahradVOdstavcich(xml: string, ns: string, mapa: [string, string][]): { xml: string; pocet: number } {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Neplatné XML dokumentu.');
  let pocet = 0;
  const odstavce = doc.getElementsByTagNameNS(ns, 'p');
  for (let i = 0; i < odstavce.length; i++) {
    const texty = Array.prototype.slice.call(odstavce[i].getElementsByTagNameNS(ns, 't')) as Element[];
    for (const [hledat, nahradit] of mapa) {
      let od = 0;
      for (;;) {
        const obsah = texty.map((t) => t.textContent || '');
        const idx = obsah.join('').indexOf(hledat, od);
        if (idx < 0) break;
        const konec = idx + hledat.length;
        let zacatek = 0;
        let prvni = true;
        for (let j = 0; j < texty.length; j++) {
          const konecTextu = zacatek + obsah[j].length;
          if (konecTextu > idx && zacatek < konec) {
            const pred = obsah[j].slice(0, Math.max(0, idx - zacatek));
            const po = obsah[j].slice(Math.min(obsah[j].length, konec - zacatek));
            texty[j].textContent = prvni ? pred + nahradit + po : po;
            if (ns === WORD_NS) texty[j].setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
            prvni = false;
          }
          zacatek = konecTextu;
        }
        pocet++;
        od = idx + nahradit.length;
      }
    }
  }
  let vystup = new XMLSerializer().serializeToString(doc);
  if (!/^<\?xml/.test(vystup)) vystup = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + vystup;
  return { xml: vystup, pocet };
}
