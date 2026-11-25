import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { AadHttpClient } from '@microsoft/sp-http';

export interface IAiGatewayProps { gatewayUrl: string; apiAppId: string; appKey: string; }

/** Web part bez Reactu: prompt → /api/chat, soubor → /api/ocr. Token uživatele získá AadHttpClient (scope Gateway.Use z package-solution.json). */
export default class AiGatewayWebPart extends BaseClientSideWebPart<IAiGatewayProps> {
  private async _call(path: string, body?: unknown): Promise<{ status: number; ms: number; json: unknown }> {
    const t0 = performance.now();
    const client = await this.context.aadHttpClientFactory.getClient(this.properties.apiAppId);
    const url = `${this.properties.gatewayUrl.replace(/\/$/, '')}${path}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-App-Id': this.properties.appKey };
    const r = body === undefined
      ? await client.get(url, AadHttpClient.configurations.v1, { headers })
      : await client.post(url, AadHttpClient.configurations.v1, { headers, body: JSON.stringify(body) });
    return { status: r.status, ms: Math.round(performance.now() - t0), json: await r.json() };
  }

  public render(): void {
    const d = this.domElement;
    if (!this.properties.gatewayUrl || !this.properties.apiAppId) {
      d.innerHTML = '<p>Vyplň v nastavení web partu gatewayUrl a apiAppId.</p>';
      return;
    }
    d.innerHTML = `<div style="font-family:Segoe UI,sans-serif;max-width:760px">
      <h3>AI gateway (sonda)</h3>
      <textarea id="p" rows="3" style="width:100%">Shrň jednou větou, co je SharePoint.</textarea><br>
      <button id="who">whoami</button> <button id="chat">Chat</button>
      <input id="f" type="file" accept="image/*,application/pdf"> <button id="ocr">OCR souboru</button>
      <pre id="o" style="white-space:pre-wrap;background:#f3f2f1;padding:8px;min-height:80px">…</pre></div>`;
    const o = d.querySelector('#o') as HTMLElement;
    const show = (p: Promise<unknown>): void => { o.textContent = 'volám…'; p.then((r) => { o.textContent = JSON.stringify(r, null, 2); }, (e) => { o.textContent = 'CHYBA: ' + (e as Error).message; }); };
    (d.querySelector('#who') as HTMLElement).onclick = () => show(this._call('/api/whoami'));
    (d.querySelector('#chat') as HTMLElement).onclick = () => show(this._call('/api/chat', { prompt: (d.querySelector('#p') as HTMLTextAreaElement).value, max_tokens: 200 }));
    (d.querySelector('#ocr') as HTMLElement).onclick = () => {
      const file = (d.querySelector('#f') as HTMLInputElement).files?.[0];
      if (!file) { o.textContent = 'Vyber soubor.'; return; }
      show(file.arrayBuffer().then((buf) => {
        let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, Array.prototype.slice.call(u, i, i + 0x8000) as number[]);
        return this._call('/api/ocr', { base64: btoa(s), model: 'prebuilt-read' });
      }));
    };
  }

  protected get dataVersion(): Version { return Version.parse('1.0'); }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ groups: [{ groupName: 'Gateway', groupFields: [
      PropertyPaneTextField('gatewayUrl', { label: 'URL gateway (https://…)' }),
      PropertyPaneTextField('apiAppId', { label: 'appId API registrace (nebo api://…)' }),
      PropertyPaneTextField('appKey', { label: 'X-App-Id (projektový klíč)' })] }] }] };
  }
}
