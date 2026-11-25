import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { AadHttpClient } from '@microsoft/sp-http';

export interface IPravaDbProps { apiUrl: string; apiAppId: string; listTitle: string; }

/**
 * Minimální web part bez Reactu (sonda ca-prava-db):
 *  - „Kdo jsem“ a „Žádosti (SQL)“ volají DB API tokenem uživatele přes AadHttpClient (scope access_as_user z package-solution.json),
 *  - „Položky seznamu“ čte SharePoint REST přímo pod uživatelem (co vidí on, ne API),
 *  - „Sdílet“ pošle API žádost o nasdílení položky; práva mění API svou identitou, uživatel ManagePermissions nemá.
 * Výsledek každého tlačítka je v #log jako „HOTOVO <klíč> …“ / „CHYBA <klíč> …“ (čte tools/spo-webpart-konzole.mjs).
 */
export default class PravaDbWebPart extends BaseClientSideWebPart<IPravaDbProps> {
  private _client: AadHttpClient | undefined;

  private async _api(method: 'GET' | 'POST', path: string, body?: unknown): Promise<{ status: number; ms: number; json: unknown }> {
    const t0 = performance.now();
    this._client = this._client ?? await this.context.aadHttpClientFactory.getClient(this.properties.apiAppId);
    const url = `${this.properties.apiUrl.replace(/\/$/, '')}${path}`;
    const opt = { headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) };
    const r = method === 'GET' ? await this._client.get(url, AadHttpClient.configurations.v1, opt)
      : await this._client.post(url, AadHttpClient.configurations.v1, opt);
    return { status: r.status, ms: Math.round(performance.now() - t0), json: await r.json() };
  }

  private async _items(): Promise<{ status: number; ms: number; json: unknown }> {
    const t0 = performance.now();
    const web = this.context.pageContext.web.absoluteUrl;
    const r = await fetch(`${web}/_api/web/lists/getbytitle('${encodeURIComponent(this.properties.listTitle)}')/items?$select=Id,Title,Author/Title&$expand=Author&$orderby=Id desc&$top=20`,
      { headers: { Accept: 'application/json;odata=nometadata' }, credentials: 'same-origin' });
    return { status: r.status, ms: Math.round(performance.now() - t0), json: await r.json() };
  }

  public render(): void {
    const d = this.domElement;
    if (!this.properties.apiUrl || !this.properties.apiAppId) { d.innerHTML = '<p>Vyplň v nastavení web partu apiUrl a apiAppId.</p>'; return; }
    d.innerHTML = `<div style="font-family:Segoe UI,sans-serif;max-width:820px">
      <h3>DB API a sdílení položek (sonda)</h3>
      <p>Přihlášen: <b>${this.context.pageContext.user.loginName}</b> · API ${this.properties.apiUrl}</p>
      <button data-k="me">Kdo jsem (API)</button> <button data-k="zadosti">Žádosti (SQL přes API)</button>
      <button data-k="polozky">Položky seznamu ${this.properties.listTitle} (SharePoint pod mnou)</button><br><br>
      Položka ID <input id="iid" size="5"> komu (UPN) <input id="komu" size="42"> role
      <select id="role"><option>Read</option><option>Edit</option></select>
      <button data-k="sdilet">Sdílet (přes API)</button> <button data-k="prava">Práva položky</button>
      <pre id="log" style="white-space:pre-wrap;background:#f3f2f1;padding:8px;min-height:120px">…</pre></div>`;
    const log = d.querySelector('#log') as HTMLElement;
    const val = (s: string): string => (d.querySelector(s) as HTMLInputElement).value.trim();
    const run = (k: string, p: () => Promise<{ status: number; ms: number; json: unknown }>): void => {
      log.textContent = `volám ${k}…`;
      p().then((r) => { log.textContent = `${r.status < 400 ? 'HOTOVO' : 'CHYBA'} ${k} HTTP ${r.status} (${r.ms} ms)\n${JSON.stringify(r.json, null, 2)}`; },
        (e) => { log.textContent = `CHYBA ${k} ${(e as Error).message}`; });
    };
    const on = (k: string, f: () => Promise<{ status: number; ms: number; json: unknown }>): void => {
      (d.querySelector(`button[data-k="${k}"]`) as HTMLElement).onclick = () => run(k, f);
    };
    on('me', () => this._api('GET', '/api/me'));
    on('zadosti', () => this._api('GET', '/api/zadosti'));
    on('polozky', () => this._items());
    on('sdilet', () => this._api('POST', `/api/sp/polozky/${val('#iid')}/sdilet`, { komu: val('#komu'), role: val('#role') }));
    on('prava', () => this._api('GET', `/api/sp/polozky/${val('#iid')}/prava`));
  }

  protected get dataVersion(): Version { return Version.parse('1.0'); }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ groups: [{ groupName: 'DB API', groupFields: [
      PropertyPaneTextField('apiUrl', { label: 'URL API (https://…azurecontainerapps.io)' }),
      PropertyPaneTextField('apiAppId', { label: 'appId API registrace (egd-sonda-data-api)' }),
      PropertyPaneTextField('listTitle', { label: 'Seznam SharePointu' })] }] }] };
  }
}
