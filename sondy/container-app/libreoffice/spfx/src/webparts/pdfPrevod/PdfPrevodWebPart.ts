import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { AadHttpClient } from '@microsoft/sp-http';

export interface IPdfPrevodProps { apiUrl: string; apiAppId: string; }

/** Soubor z disku → POST /api/pdf (tělo = binárka, ?ext=) → odkaz na PDF. Token uživatele přes AadHttpClient
 *  (scope access_as_user z webApiPermissionRequests v package-solution.json). */
export default class PdfPrevodWebPart extends BaseClientSideWebPart<IPdfPrevodProps> {
  private async _client(): Promise<AadHttpClient> { return this.context.aadHttpClientFactory.getClient(this.properties.apiAppId); }
  private _url(p: string): string { return `${this.properties.apiUrl.replace(/\/$/, '')}${p}`; }

  public render(): void {
    const d = this.domElement;
    if (!this.properties.apiUrl || !this.properties.apiAppId) { d.innerHTML = '<p>Vyplň v nastavení web partu apiUrl a apiAppId.</p>'; return; }
    d.innerHTML = `<div style="font-family:Segoe UI,sans-serif;max-width:760px">
      <h3>Převod do PDF (LibreOffice v Container App)</h3>
      <button id="me">Kdo jsem (token)</button>
      <input id="f" type="file" accept=".docx,.xlsx,.pptx"> <button id="go">Převést do PDF</button>
      <div id="a" style="margin:8px 0"></div>
      <pre id="o" style="white-space:pre-wrap;background:#f3f2f1;padding:8px;min-height:60px">…</pre></div>`;
    const o = d.querySelector('#o') as HTMLElement, a = d.querySelector('#a') as HTMLElement;
    (d.querySelector('#me') as HTMLElement).onclick = async () => {
      o.textContent = 'volám…'; const t0 = performance.now();
      try {
        const r = await (await this._client()).get(this._url('/api/me'), AadHttpClient.configurations.v1);
        o.textContent = JSON.stringify({ status: r.status, ms: Math.round(performance.now() - t0), body: await r.json() }, null, 2);
      } catch (e) { o.textContent = 'CHYBA: ' + (e as Error).message; }
    };
    (d.querySelector('#go') as HTMLElement).onclick = async () => {
      const file = (d.querySelector('#f') as HTMLInputElement).files?.[0];
      if (!file) { o.textContent = 'Vyber soubor.'; return; }
      o.textContent = 'převádím…'; a.innerHTML = ''; const t0 = performance.now();
      try {
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const r = await (await this._client()).post(this._url(`/api/pdf?ext=${encodeURIComponent(ext)}`), AadHttpClient.configurations.v1,
          { headers: { 'Content-Type': 'application/octet-stream' }, body: await file.arrayBuffer() });
        const ms = Math.round(performance.now() - t0);
        if (r.status !== 200) { o.textContent = JSON.stringify({ status: r.status, ms, body: await r.text() }, null, 2); return; }
        const blob = await r.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); link.download = file.name.replace(/\.[^.]+$/, '') + '.pdf'; link.id = 'pdf';
        link.textContent = `Stáhnout ${link.download}`; a.appendChild(link);
        const head = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
        o.textContent = JSON.stringify({ status: r.status, ms, serverConvertMs: r.headers.get('x-convert-ms'), pdfBytes: blob.size,
          contentType: r.headers.get('content-type'), magic: String.fromCharCode.apply(null, Array.prototype.slice.call(head) as number[]) }, null, 2);
      } catch (e) { o.textContent = 'CHYBA: ' + (e as Error).message; }
    };
  }

  protected get dataVersion(): Version { return Version.parse('1.0'); }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ groups: [{ groupName: 'API', groupFields: [
      PropertyPaneTextField('apiUrl', { label: 'URL Container App (https://…)' }),
      PropertyPaneTextField('apiAppId', { label: 'appId API registrace' })] }] }] };
  }
}
