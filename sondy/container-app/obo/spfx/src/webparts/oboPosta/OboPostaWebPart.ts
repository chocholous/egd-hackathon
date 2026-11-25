import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { AadHttpClient, MSGraphClientV3 } from '@microsoft/sp-http';

export interface IOboPostaProps { apiUrl: string; apiAppId: string; }

/** Tři tlačítka: whoami a pošta přes Container App (AadHttpClient → OBO), a pro srovnání pošta přímo z prohlížeče (MSGraphClientV3). */
export default class OboPostaWebPart extends BaseClientSideWebPart<IOboPostaProps> {
  private async _api(path: string): Promise<unknown> {
    const t0 = performance.now();
    const client = await this.context.aadHttpClientFactory.getClient(this.properties.apiAppId);
    const r = await client.get(`${this.properties.apiUrl.replace(/\/$/, '')}${path}`, AadHttpClient.configurations.v1);
    return { cesta: 'SPFx → AadHttpClient → Container App → OBO → Graph', http: r.status, ms: Math.round(performance.now() - t0), odpoved: await r.json() };
  }

  private async _apiPost(path: string, body: unknown): Promise<unknown> {
    const t0 = performance.now();
    const client = await this.context.aadHttpClientFactory.getClient(this.properties.apiAppId);
    const r = await client.post(`${this.properties.apiUrl.replace(/\/$/, '')}${path}`, AadHttpClient.configurations.v1,
      { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    return { cesta: `SPFx → AadHttpClient → Container App → OBO → Graph ${path}`, http: r.status, ms: Math.round(performance.now() - t0), odpoved: await r.json() };
  }

  /** Copilot API přímo z prohlížeče tokenem SPFx (principal SharePoint Online Web Client Extensibility) — pro srovnání s OBO. */
  private async _primoCopilot(kind: 'retrieval' | 'chat', dotaz: string): Promise<unknown> {
    const t0 = performance.now();
    const g: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
    try {
      const r = kind === 'retrieval'
        ? await g.api('/copilot/retrieval').version('beta').post({ queryString: dotaz, dataSource: 'sharePoint', maximumNumberOfResults: 5 })
        : await g.api('/copilot/conversations').version('beta').post({});
      return { cesta: `SPFx → MSGraphClientV3 → Graph beta /copilot/${kind === 'chat' ? 'conversations' : kind} (přímo)`, http: 200, ms: Math.round(performance.now() - t0), odpoved: r };
    } catch (e) {
      const err = e as { statusCode?: number; code?: string; message?: string };
      return { cesta: `SPFx → MSGraphClientV3 → Graph beta /copilot/${kind === 'chat' ? 'conversations' : kind} (přímo)`, http: err.statusCode, ms: Math.round(performance.now() - t0), chyba: err.code, zprava: err.message };
    }
  }

  private async _primo(): Promise<unknown> {
    const t0 = performance.now();
    const g: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
    try {
      const r = await g.api('/me/messages').top(5).select('subject,receivedDateTime').get();
      return { cesta: 'SPFx → MSGraphClientV3 → Graph (přímo)', http: 200, ms: Math.round(performance.now() - t0), odpoved: r };
    } catch (e) {
      const err = e as { statusCode?: number; code?: string; message?: string };
      return { cesta: 'SPFx → MSGraphClientV3 → Graph (přímo)', http: err.statusCode, ms: Math.round(performance.now() - t0), chyba: err.code, zprava: err.message };
    }
  }

  public render(): void {
    const d = this.domElement;
    if (!this.properties.apiUrl || !this.properties.apiAppId) { d.innerHTML = '<p>Vyplň v nastavení web partu apiUrl a apiAppId.</p>'; return; }
    d.innerHTML = `<div style="font-family:Segoe UI,sans-serif;max-width:860px">
      <h3>OBO pošta (sonda)</h3>
      <button id="who">whoami (API)</button> <button id="posta">Pošta přes OBO</button> <button id="primo">Pošta přímo z SPFx</button>
      <h4>Microsoft 365 Copilot API</h4>
      <input id="q" style="width:100%" value="Jaký je průměr spokojenosti s prostředím kanceláře?"><br>
      <button id="retr">Retrieval přes OBO</button> <button id="chat">Copilot Chat přes OBO</button> <button id="odp">Retrieval + gateway LLM přes OBO</button>
      <button id="pretr">Retrieval přímo z SPFx</button> <button id="pchat">Chat přímo z SPFx</button>
      <pre id="o" style="white-space:pre-wrap;background:#f3f2f1;padding:8px;min-height:80px">…</pre></div>`;
    const o = d.querySelector('#o') as HTMLElement;
    const show = (p: Promise<unknown>): void => {
      o.textContent = 'volám…';
      p.then((r) => { o.textContent = JSON.stringify(r, null, 2); console.log('[obo-sonda]', JSON.stringify(r)); },
        (e) => { o.textContent = 'CHYBA: ' + (e as Error).message; console.log('[obo-sonda] CHYBA', (e as Error).message); });
    };
    (d.querySelector('#who') as HTMLElement).onclick = () => show(this._api('/api/whoami'));
    (d.querySelector('#posta') as HTMLElement).onclick = () => show(this._api('/api/posta'));
    (d.querySelector('#primo') as HTMLElement).onclick = () => show(this._primo());
    const q = (): string => (d.querySelector('#q') as HTMLInputElement).value;
    (d.querySelector('#retr') as HTMLElement).onclick = () => show(this._apiPost('/api/copilot/retrieval', { dotaz: q() }));
    (d.querySelector('#chat') as HTMLElement).onclick = () => show(this._apiPost('/api/copilot/chat', { dotaz: q() }));
    (d.querySelector('#odp') as HTMLElement).onclick = () => show(this._apiPost('/api/copilot/odpoved', { dotaz: q() }));
    (d.querySelector('#pretr') as HTMLElement).onclick = () => show(this._primoCopilot('retrieval', q()));
    (d.querySelector('#pchat') as HTMLElement).onclick = () => show(this._primoCopilot('chat', q()));
  }

  protected get dataVersion(): Version { return Version.parse('1.0'); }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ groups: [{ groupName: 'API', groupFields: [
      PropertyPaneTextField('apiUrl', { label: 'URL Container App (https://…)' }),
      PropertyPaneTextField('apiAppId', { label: 'appId API registrace' })] }] }] };
  }
}
