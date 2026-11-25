// Evidence pozadavku - prvni appka z workshopu EG.D.
// Zadavatel posle pozadavek, schvalovatel ho schvali nebo zamitne.
// Data lezi v SharePoint seznamu na stejnem webu (vychozi nazev "Pozadavky").
// Schvalovatel = kdo ma na seznamu pravo "Schvalovat polozky" (vlastnici webu).
// Je to role pro zobrazeni, ne zabezpeceni: kdo smi seznam upravovat, zmeni Stav i primo v seznamu.

import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient, type SPHttpClientResponse } from '@microsoft/sp-http';

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
const PRAVO_VSE = 0x100;      // CancelCheckout (Prepsat chovani seznamu) = vidi a upravi cizi
const PRAVO_PRIDAT = 0x2;     // AddListItems
const PRAVO_SPRAVA = 0x800;   // ManageLists
const MAX_POLOZEK = 200;

const JSON_HLAVICKY = {
  Accept: 'application/json;odata=nometadata',
  'Content-Type': 'application/json;odata=nometadata'
};

export default class EvidenceWebPart extends BaseClientSideWebPart<IEvidenceWebPartProps> {
  private _zalozka: Zalozka = 'novy';
  private _schvalovatel = false;
  private _muzePridat = false;
  private _spravce = false;
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
      const low = Number(prava.Low);
      this._schvalovatel = (low & PRAVO_VSE) !== 0;
      this._muzePridat = (low & PRAVO_PRIDAT) !== 0;
      this._spravce = (low & PRAVO_SPRAVA) !== 0;
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
      el('span', { class: styles.role, id: 'evidence-role' }, [this._spravce ? 'Správce' : this._schvalovatel ? 'Schvalovatel' : this._muzePridat ? 'Zadavatel' : 'Jen čtení'])
    ]));

    const zalozky: [Zalozka, string][] = [];
    if (this._muzePridat) zalozky.push(['novy', 'Nový požadavek']);
    zalozky.push(['moje', 'Moje požadavky']);
    if (!this._muzePridat && this._zalozka === 'novy') this._zalozka = 'moje';
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

    this.domElement.replaceChildren(koren);
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
