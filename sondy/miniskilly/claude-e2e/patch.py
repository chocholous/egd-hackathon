p='src/webparts/spokojenost/SpokojenostWebPart.ts'
t=open(p,encoding='utf-8').read()
def rep(a,b):
    global t
    assert a in t, a
    t=t.replace(a,b,1)
rep("const DNU_V_PREHLEDU = 7;","const DNU_V_PREHLEDU = 30;")
rep("""// Radi se podle ID: je vzdy indexovane, takze dotaz projde i nad 5000 polozkami (Created by spadl na throttling).
const MAX_HLASU = 2000;
""","""// Hlasy se ctou na serveru filtrem na sloupec Den (musi byt indexovany) po strankach po 1000.
// Obdobi filtru nesmi mit vic nez 5000 hlasu (limit SharePointu), pri 30 dnech a ~100 hlasech za den je to v poradku.
""")
rep("""    let text = '';
    try { text = (await r.text()).slice(0, 300); } catch { /* nic */ }
""","""    let text = '';
    try { text = (await r.text()).slice(0, 300); } catch { /* nic */ }
    if (r.status === 500 && /SPQueryThrottledException|mezn|threshold/i.test(text))
      return 'Seznam je moc velký pro tenhle dotaz. Sloupec ve filtru nebo řazení musí být indexovaný (Nastavení seznamu → Indexované sloupce).';
""")
rep("""  private async _nacti(): Promise<void> {
    this._chyba = '';
    try {
      const r = await this.context.spHttpClient.get(
        this._url(`/items?$select=Id,Hodnoceni,Den,AuthorId&$orderby=ID desc&$top=${MAX_HLASU}`),
        SPHttpClient.configurations.v1, { headers: JSON_HLAVICKY });
      if (!r.ok) throw new Error(await this._popisChyby(r));
      this._hlasy = ((await r.json()) as { value: IHlas[] }).value;
    } catch (e) {""","""  // Precte vsechny polozky, ktere projdou filtrem, po strankach po 1000.
  // filtr: OData vyraz; PRVNI podminka musi byt indexovany sloupec s vysledkem pod 5000 radku.
  private async _ctiVse<T>(select: string, filtr = '', razeni = 'ID desc'): Promise<T[]> {
    const vysledek: T[] = [];
    let url: string | undefined = this._url(
      `/items?$select=${select}&$top=1000&$orderby=${encodeURIComponent(razeni)}` +
      (filtr ? `&$filter=${encodeURIComponent(filtr)}` : ''));
    while (url) {
      const r: SPHttpClientResponse = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1, { headers: JSON_HLAVICKY });
      if (!r.ok) throw new Error(await this._popisChyby(r));
      const j = (await r.json()) as { value: T[]; '@odata.nextLink'?: string; 'odata.nextLink'?: string };
      vysledek.push(...j.value);
      // configurations.v1 posila OData-Version: 4.0 -> klic je '@odata.nextLink' (bez te hlavicky 'odata.nextLink')
      url = j['@odata.nextLink'] ?? j['odata.nextLink'];
    }
    return vysledek;
  }

  private async _nacti(): Promise<void> {
    this._chyba = '';
    try {
      const od = new Date(); od.setDate(od.getDate() - (DNU_V_PREHLEDU - 1));
      this._hlasy = await this._ctiVse<IHlas>('Id,Hodnoceni,Den,AuthorId', `Den ge '${den(od)}'`);
    } catch (e) {""")
open(p,'w',encoding='utf-8').write(t)
s='src/webparts/spokojenost/SpokojenostWebPart.module.scss'
c=open(s,encoding='utf-8').read()
a=".dny { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;"
assert a in c
c=c.replace(a,".dny { display: grid; grid-template-columns: repeat(30, 1fr); gap: 2px;")
open(s,'w',encoding='utf-8').write(c)
