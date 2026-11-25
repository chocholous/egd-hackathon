// Spokojenost s prostredim kancelare dnes - appka z workshopu EG.D.
// Jedno hodnoceni 1-5 na uzivatele a den + maly dashboard (prumer dne, rozlozeni 1-5, trend).
// Data lezi v SharePoint seznamu na stejnem webu (vychozi nazev "SpokojenostHodnoceni").
//
// Limit 5000 polozek: SharePoint u seznamu nad 5000 polozek odmitne dotaz, ktery filtruje nebo radi
// podle NEindexovaneho sloupce. Appka proto filtruje a radi jen podle indexovaneho sloupce DenCislo
// (RRRRMMDD), cte po strankach a bere jen poslednich N dnu. Klic (uzivatel|den) je indexovany
// a unikatni: druhe hodnoceni stejneho cloveka v jeden den SharePoint odmitne sam.

import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient, type SPHttpClientResponse } from '@microsoft/sp-http';

import styles from './SpokojenostWebPart.module.scss';

export interface ISpokojenostWebPartProps {
  nadpis: string;
  seznam: string;
  dnu: number;
}

interface IHodnoceni {
  Hodnoceni: number;
  DenCislo: number;
}

interface IStranka {
  value: IHodnoceni[];
  'odata.nextLink'?: string;
  '@odata.nextLink'?: string;
}

const STUPNE = [1, 2, 3, 4, 5];
const STRANKA = 1000;      // $top na jednu stranku (do 5000 je v poradku)
const MAX_STRANEK = 5;     // nejvic 5000 radku na jedno nacteni; vic appka nacte jen ze zacatku a upozorni
const VYCHOZI_DNU = 14;

const JSON_HLAVICKY = {
  Accept: 'application/json;odata=nometadata',
  'Content-Type': 'application/json;odata=nometadata'
};

export default class SpokojenostWebPart extends BaseClientSideWebPart<ISpokojenostWebPartProps> {
  private _data: IHodnoceni[] = [];
  private _moje: number | undefined; // moje dnesni hodnoceni
  private _chyba = '';
  private _zprava = '';
  private _zkraceno = false;
  private _odesilam = false;

  // ---------- data ----------

  private _dnu(): number {
    const n = Number(this.properties.dnu);
    return n >= 1 && n <= 60 ? Math.floor(n) : VYCHOZI_DNU;
  }

  private _url(cesta: string): string {
    const seznam = (this.properties.seznam || 'SpokojenostHodnoceni').replace(/'/g, "''");
    return `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(seznam)}')${cesta}`;
  }

  private async _popisChyby(r: SPHttpClientResponse): Promise<string> {
    if (r.status === 404) return `Seznam "${this.properties.seznam}" na tomhle webu neni. Zalozte ho (agent: prikaz "seznam") nebo opravte nazev v nastaveni web partu.`;
    if (r.status === 403) return 'Na seznam nemate pravo. Pozadejte vlastnika webu o roli Clen (Member).';
    let text = '';
    try { text = (await r.text()).slice(0, 300); } catch { /* nic */ }
    if (/duplicate|unique|already exists|již v seznamu existuje/i.test(text)) return 'Dnes jste uz hodnotili. Dekujeme!';
    return `SharePoint vratil chybu ${r.status}. ${text}`;
  }

  private async _cti(url: string): Promise<IStranka> {
    const r = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1, { headers: JSON_HLAVICKY });
    if (!r.ok) throw new Error(await this._popisChyby(r));
    return (await r.json()) as IStranka;
  }

  // Filtr i razeni jen podle indexovaneho DenCislo; stranky po STRANKA polozkach.
  private async _nacti(): Promise<void> {
    this._chyba = '';
    this._zkraceno = false;
    try {
      const od = cisloDne(pred(this._dnu() - 1));
      let url: string | undefined = this._url(`/items?$select=Hodnoceni,DenCislo&$filter=DenCislo ge ${od}&$orderby=DenCislo desc&$top=${STRANKA}`);
      const vse: IHodnoceni[] = [];
      for (let i = 0; url && i < MAX_STRANEK; i++) {
        const s: IStranka = await this._cti(url);
        vse.push(...s.value);
        url = s['odata.nextLink'] || s['@odata.nextLink'];
      }
      this._zkraceno = !!url;
      this._data = vse;
      // moje dnesni hodnoceni: dotaz podle unikatniho indexovaneho Klice
      const m = await this._cti(this._url(`/items?$select=Hodnoceni,DenCislo&$filter=Klic eq '${this._klic()}'&$top=1`));
      this._moje = m.value.length ? m.value[0].Hodnoceni : undefined;
    } catch (e) {
      this._chyba = (e as Error).message;
    }
  }

  private _ja(): number {
    return Number(this.context.pageContext.legacyPageContext.userId);
  }

  private _klic(): string {
    return `${this._ja()}|${cisloDne(new Date())}`;
  }

  private _hodnot(h: number): void {
    if (this._odesilam) return;
    this._odesilam = true;
    this._chyba = '';
    const dnes = new Date();
    const telo = { Title: isoDne(dnes), Hodnoceni: h, DenCislo: cisloDne(dnes), Klic: this._klic() };
    this.context.spHttpClient.post(this._url('/items'), SPHttpClient.configurations.v1, { headers: JSON_HLAVICKY, body: JSON.stringify(telo) })
      .then(async (r) => {
        if (!r.ok) throw new Error(await this._popisChyby(r));
        this._zprava = 'Děkujeme, vaše hodnocení je uložené.';
        await this._nacti();
      })
      .catch(async (e: Error) => { const zprava = e.message; await this._nacti(); this._chyba = this._moje !== undefined ? 'Dnes jste už hodnotili. Děkujeme!' : zprava; }) // _nacti chybu nuluje, proto ji vracime
      .then(() => { this._odesilam = false; this.render(); })
      .catch(() => { this._odesilam = false; this.render(); });
  }

  // ---------- vypocty ----------

  private _dnesni(): IHodnoceni[] {
    const dnes = cisloDne(new Date());
    return this._data.filter((d) => d.DenCislo === dnes);
  }

  // ---------- vykresleni ----------

  public render(): void {
    const koren = el('section', { class: styles.appka });
    koren.appendChild(el('h1', {}, [this.properties.nadpis || 'Spokojenost s prostředím kanceláře dnes']));
    koren.appendChild(el('p', { class: styles.datum }, [new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })]));
    if (this._chyba) koren.appendChild(el('p', { class: styles.chyba, role: 'alert' }, [this._chyba]));
    if (this._zprava && !this._chyba) koren.appendChild(el('p', { class: styles.zprava, role: 'status' }, [this._zprava]));
    if (this._zkraceno) koren.appendChild(el('p', { class: styles.varovani }, [`Dashboard ukazuje jen část dat (nejvýš ${STRANKA * MAX_STRANEK} nejnovějších řádků v okně ${this._dnu()} dní). Zkraťte okno v nastavení web partu.`]));

    koren.appendChild(this._hlasovani());
    koren.appendChild(this._dashboard());
    this.domElement.replaceChildren(koren);
  }

  private _hlasovani(): HTMLElement {
    const karta = el('div', { class: styles.karta }, [el('h2', {}, ['Jak jste dnes spokojení s prostředím kanceláře?'])]);
    const radek = el('div', { class: styles.tlacitka, role: 'group', 'aria-label': 'Hodnocení 1 až 5' });
    for (const h of STUPNE) {
      const vybrane = this._moje === h;
      const b = el('button', { type: 'button', class: `${styles.tlacitko} ${vybrane ? styles.vybrane : ''}`, 'aria-label': `Hodnocení ${h} z 5`, 'aria-pressed': vybrane ? 'true' : 'false' }, [String(h)]) as HTMLButtonElement;
      b.disabled = this._moje !== undefined || this._odesilam;
      b.addEventListener('click', () => this._hodnot(h));
      radek.appendChild(b);
    }
    karta.appendChild(radek);
    karta.appendChild(el('div', { class: styles.popisky }, [el('span', {}, ['1 = velmi nespokojen(a)']), el('span', {}, ['5 = velmi spokojen(a)'])]));
    if (this._moje !== undefined) karta.appendChild(el('p', { class: styles.maly }, [`Dnes jste hodnotili ${this._moje} z 5. Hodnotit jde jednou za den.`]));
    return karta;
  }

  private _dashboard(): HTMLElement {
    const dnes = this._dnesni();
    const n = dnes.length;
    const prumer = n ? dnes.reduce((s, d) => s + d.Hodnoceni, 0) / n : 0;

    const karta = el('div', { class: styles.karta }, [el('h2', {}, ['Dnešní výsledek'])]);
    karta.appendChild(el('div', { class: styles.souhrn }, [
      el('div', {}, [el('div', { class: styles.cislo }, [n ? prumer.toFixed(1).replace('.', ',') : '–']), el('div', { class: styles.maly }, ['průměr dne (z 5)'])]),
      el('div', {}, [el('div', { class: styles.cislo }, [String(n)]), el('div', { class: styles.maly }, [n === 1 ? 'hlas' : 'hlasů dnes'])])
    ]));
    if (!n) karta.appendChild(el('p', { class: styles.maly }, ['Dnes zatím nikdo nehodnotil.']));
    for (const h of STUPNE) {
      const pocet = dnes.filter((d) => d.Hodnoceni === h).length;
      const pct = n ? Math.round((pocet / n) * 100) : 0;
      const vypln = el('div', { class: styles.vypln });
      vypln.style.width = `${pct}%`;
      karta.appendChild(el('div', { class: styles.radek }, [el('span', {}, [String(h)]), el('div', { class: styles.pruh, title: `${pocet} hlasů` }, [vypln]), el('span', {}, [`${pocet} (${pct} %)`])]));
    }

    const trend = el('div', { class: styles.karta }, [el('h2', {}, [`Trend: průměr po dnech (posledních ${this._dnu()} dní)`])]);
    const sloupce = el('div', { class: styles.trend });
    const dny = el('div', { class: styles.dny });
    for (let i = this._dnu() - 1; i >= 0; i--) {
      const d = pred(i);
      const cislo = cisloDne(d);
      const den = this._data.filter((x) => x.DenCislo === cislo);
      const p = den.length ? den.reduce((s, x) => s + x.Hodnoceni, 0) / den.length : 0;
      const vypln = el('div', { class: `${styles.sloupecVypln} ${den.length ? '' : styles.sloupecPrazdny}`, title: den.length ? `${d.toLocaleDateString('cs-CZ')}: průměr ${p.toFixed(1)} (${den.length} hlasů)` : `${d.toLocaleDateString('cs-CZ')}: bez hlasů` });
      vypln.style.height = den.length ? `${(p / 5) * 100}%` : '2px';
      sloupce.appendChild(el('div', { class: styles.sloupec }, [el('span', { class: styles.hodnota }, [den.length ? p.toFixed(1).replace('.', ',') : '']), vypln]));
      dny.appendChild(el('span', {}, [`${d.getDate()}.${d.getMonth() + 1}.`]));
    }
    trend.appendChild(sloupce);
    trend.appendChild(dny);
    return el('div', {}, [karta, trend]);
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
            PropertyPaneTextField('seznam', { label: 'Název seznamu na tomto webu' }),
            PropertyPaneTextField('dnu', { label: 'Kolik dní zpět ukazuje trend (1–60)' })
          ]
        }]
      }]
    };
  }
}

function pred(dnu: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0); // poledne: posun letniho casu nepreskoci den
  d.setDate(d.getDate() - dnu);
  return d;
}

function cisloDne(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function isoDne(d: Date): string {
  const p = (n: number): string => (n < 10 ? `0${n}` : String(n));
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Prvek postaveny pres DOM: texty jdou pres textContent, takze nic z dat se nespusti jako HTML.
function el(tag: string, atributy: Record<string, string> = {}, deti: (Node | string)[] = []): HTMLElement {
  const e = document.createElement(tag);
  for (const k of Object.keys(atributy)) if (atributy[k] !== '') e.setAttribute(k, atributy[k]);
  for (const d of deti) e.appendChild(typeof d === 'string' ? document.createTextNode(d) : d);
  return e;
}
