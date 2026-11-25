---
name: egd-dokumenty
description: Přidej do SPFx appky EG.D tlačítko, které z dat seznamu vyrobí Word, Excel, PowerPoint nebo PDF přímo v prohlížeči, uloží ho do knihovny dokumentů a stáhne - včetně Wordu ze šablony a věrného PDF z Wordu přes Microsoft Graph, s funkční češtinou. Použij, když uživatel řekne „vygeneruj z toho Word / Excel / PDF / prezentaci“, „export do Excelu“, „protokol podle šablony“, „ulož dokument do knihovny“, „převeď Word na PDF“, „v PDF jsou rozbité háčky a čárky“, „pptxgenjs neprojde buildem“, „UnhandledSchemeError node:fs“ „potřebujeme Power Automate na dokumenty?“, „uprav existující Word / Excel / prezentaci v knihovně“, „vyplň šablonu, kterou jsme napsali ve Wordu“, „zástupné texty se nenahradily“ nebo „změň buňky v Excelu, který má někdo otevřený“.
license: interní pomůcka workshopu EG.D
---

# Dokumenty z appky (požadavek 3)

Uživatel je začátečník na Windows. Navazuje na `egd-prvni-appka`. Dokument vzniká **v prohlížeči
uživatele jeho právy**: žádný Azure, žádná licence navíc, žádný Power Automate.

Značky: ✅ změřeno v labu 22.–23. 11. 2026 (SPFx 1.24.1 + Heft; kliky skriptem v headless Chrome pod
uloženým profilem lab uživatele `petra.novakova`, ne ručně) · co ověřit nešlo, je v sekci **Neověřeno**.
Důkazy: `sondy/ms-dokumenty/README.md` (v repu workshopu).

Úryvky níže jsou pro **appku Spokojenost** z `egd-prvni-appka` (`IHlas`, `this._hlasy`, seznam
`Spokojenost`, sloupce `Hodnoceni` a `Den`). Celý funkční web part se všemi úryvky:
`sondy/ms-dokumenty/appka-spokojenost/src/webparts/spokojenost/SpokojenostWebPart.ts` ✅ (23. 11.: založeno
`appka.mjs novy`, build, `appka.mjs seznam` + `nasadit` na web `egd-sonda-ms-dokumenty`, hlas 4 a šest tlačítek
pod `petra.novakova` → všude `HOTOVO`: `sondy/ms-dokumenty/spokojenost-klik.log`, obsah souborů
`sondy/ms-dokumenty/spokojenost-obsah.txt`: Word, PowerPoint a PDF nesou souhrn Den / Hlasů / Průměr, Excel surové
hlasy Den / Hodnocení). Starší ověření (22. 11., appka nad seznamem požadavků, čeština,
Čtenář, anglický web): `sondy/ms-dokumenty/appka/`.

## Žebřík variant (zkoušej shora, na konci řekni, kterou jsi použil)

| # | Varianta | Test „funguje?“ | Když ne | Lab |
|---|---|---|---|---|
| 1 | **Word / Excel / PowerPoint v prohlížeči**, uložení do knihovny (kód níže) | po kliku je soubor ve složce `exporty` a stáhne se | build: `UnhandledSchemeError node:fs` → webpack patch; uložení 403 → uživatel nemá zápis (Člen), nebo varianta 2; `npm install` neprojde (proxy) → `egd-pripravenost` | ✅ |
| 2 | **Jen stažení** (Čtenář, nebo knihovna nejde): stejný kód, stažení proběhne před uložením | soubor se stáhne, uložení hlásí 403 | — | ✅ (`jakub.kucera`, Návštěvník: `sondy/ms-dokumenty/ctenar-2.log`) |
| 3 | **PDF z Wordu přes Graph** | po kliku je vedle `.docx` i `.pdf` | chyba souhlasu / 403 → `Files.Read.All` není schválené → varianta 4 a věta pro IT | ✅ |
| 4 | **PDF přes pdf-lib s fontem** | PDF s češtinou | `Soubor assets/Roboto-Regular.ttf: 404` → nahraj font do knihovny | ✅ |
| 5 | Power Automate: převod hotového souboru (OneDrive „Convert file“, Standard) | flow doběhne | připojení nepřihlášené / licence → zůstaň u 3–4 | ❓ běh v labu selhal (nepřihlášené připojení, `sondy/power-automate.md` ř. 20) |
| 6 | Server (Container App) | — | — | v `sondy/dokumenty.md`, pro workshop ne |

## Výběr knihovny

| Chci | Balíček (přesná verze) | Stav | Pozor |
|---|---|---|---|
| Word | `docx@9.16.0` | ✅ 0,7 s | |
| Excel | `exceljs@4.4.0` | ✅ 0,8 s | velký (0,9 MB), jen líně |
| PowerPoint | `pptxgenjs@4.0.1` | ✅ 0,5–0,9 s | **potřebuje webpack patch** (níže) |
| PDF bez Graphu | `pdf-lib@1.17.1` + `@pdf-lib/fontkit@1.1.1` + **TTF font s češtinou** | ✅ 1,1 s | jsPDF ani pdf-lib s výchozím fontem češtinu neumí ✅ („PYehled“ místo „Přehled“, `sondy/dokumenty/out/`) |
| PDF z Wordu, věrně | Graph `?format=pdf` | ✅ 1,1–1,8 s | potřebuje `Files.Read.All` schválené v tenantu |
| Word podle firemní šablony | `docxtemplater@3.71.1` + `pizzip@3.3.0` | ✅ v sondě `sondy/dokumenty` (ne v první appce) | šablona `.docx` s `{nazev}` a `{#radky}…{/radky}` leží v knihovně; kód: větev `docxtpl` v `sondy/dokumenty/spfx/egd-dokumenty/src/webparts/dokumentyGenerator/DokumentyGeneratorWebPart.ts` |

Instalace (ve složce appky, jen co potřebuješ):
`npm install docx@9.16.0 exceljs@4.4.0 pptxgenjs@4.0.1 pdf-lib@1.17.1 @pdf-lib/fontkit@1.1.1 --save-exact` ✅.
Šablona první appky už má `@microsoft/sp-http` v závislostech ✅. Pak zvyš verzi v
`config\package-solution.json` a postav a nasaď podle `egd-prvni-appka`.

Knihovny vždy přes `await import()` uvnitř obsluhy kliku, nikdy import nahoře v souboru ✅: hlavní
bundle zůstal 27 KB, knihovny jsou zvláštní soubory (docx 295 KB, exceljs 941 KB, pptx 372 KB,
pdf-lib 1,16 MB) a stahují se až po kliknutí.

## Kód: uložení do knihovny a stažení ✅

Do importů: `import { SPHttpClient, type SPHttpClientResponse, MSGraphClientV3 } from '@microsoft/sp-http';`

```ts
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
```

Proč takhle (vše ✅ v labu):
- `defaultDocumentLibrary` místo `getbytitle('Dokumenty')`: na českém webu se knihovna jmenuje
  `Dokumenty` (URL `Sdilene dokumenty`), na anglickém `Documents` (URL `Shared Documents`) a
  `getbytitle('Dokumenty')` tam vrátí 404. Výchozí knihovna funguje na obou a je to tatáž knihovna,
  kterou používá Graph (`drive/root`) v převodu na PDF.
- Na čerstvém webu složka `exporty` není a nahrání do ní vrátí **404**. Proto ji kód při 404 založí.

## Kód: tlačítka a souhrn hlasů ✅

Do `render()` za `koren.appendChild(this._dashboard(dnes));` přidej `koren.appendChild(this._exporty());`.
Funkce `el()` je v šabloně na konci souboru.

```ts
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
```

- ✅ Šablona první appky překládá do ES5: první verze `_souhrn` s `[...new Map().entries()]` spadla v buildu na
  `TS2802 … can only be iterated through when using the '--downlevelIteration' flag`
  (`sondy/ms-dokumenty/build-spokojenost-ts2802.txt`); s `Object.keys` build prošel ✅ (`build-spokojenost.log`).
  Nepoužívej spread nad `Map`/`Set`.
- `this._hlasy` je to, co appka načetla (šablona: posledních nejvýš 2000 hlasů, `MAX_HLASU`). Pro export všech hlasů
  stránkuj: SharePoint vrací odkaz na další stránku jako `odata.nextLink` (hlavička `Accept: application/json;odata=nometadata`
  bez `OData-Version`) nebo `@odata.nextLink` (s `OData-Version: 4.0`) ✅ (`sondy/ms-dokumenty/strankovani.log`). Čti proto
  `j['@odata.nextLink'] || j['odata.nextLink']`. `SPHttpClient.configurations.v1` posílá `OData-Version: 4.0`, appka tedy dostane
  `@odata.nextLink` ✅ (`skills/egd-data-seznamy/TEST-copilot.md`, sekce „Nalezená chyba a oprava skillu“). Hotové čtení všech stránek
  je `_ctiVse` ze skillu `egd-data-seznamy` ✅ (e2e 2801 hlasů ve 3 stránkách, `skills/egd-data-seznamy/TEST.md`): načti jím `this._hlasy`
  a exporty pak zahrnou všechny hlasy.

## Kód: Word ✅

```ts
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
```

## Kód: Excel ✅

Jeden řádek na hlas (den a hodnocení), ať si uživatel v Excelu udělá vlastní kontingenční tabulku.

```ts
private async _excel(hlasy: IHlas[]): Promise<void> {
  const ExcelJS = (await import(/* webpackChunkName: 'lib-exceljs' */ 'exceljs')).default;
  const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet('Hlasy');
  ws.columns = [{ header: 'Den', key: 'd', width: 14 }, { header: 'Hodnocení', key: 'h', width: 12 }];
  ws.getRow(1).font = { bold: true };
  hlasy.forEach((h) => ws.addRow({ d: h.Den || '', h: h.Hodnoceni }));
  await this._ulozDokument('exporty', 'spokojenost.xlsx', new Uint8Array(await wb.xlsx.writeBuffer()));
}
```

## Kód: PowerPoint ✅ (jen s webpack patchem)

```ts
private async _pptx(hlasy: IHlas[]): Promise<void> {
  const P = (await import(/* webpackChunkName: 'lib-pptx' */ 'pptxgenjs')).default;
  const p = new P(); p.layout = 'LAYOUT_WIDE';
  p.addSlide().addText('Spokojenost s prostředím kanceláře', { x: 0.5, y: 1.5, w: 12, h: 1.2, fontSize: 36, bold: true });
  const radky = [['Den', 'Hlasů', 'Průměr (1–5)'], ...this._souhrn(hlasy).map((r) => r.map(String))];
  p.addSlide().addTable(radky.map((r) => r.map((text) => ({ text }))), { x: 0.5, y: 1, w: 12, fontSize: 14 });
  await this._ulozDokument('exporty', 'spokojenost.pptx', new Uint8Array(await p.write({ outputType: 'arraybuffer' }) as ArrayBuffer));
}
```

`pptxgenjs` obsahuje `import("node:fs")` a `node:https`. Bez patche build spadne ✅:
`UnhandledSchemeError: Reading from "node:fs" is not handled by plugins (Unhandled scheme)` (totéž
pro `node:https`). S těmito třemi soubory build projde ✅:

`config\webpack-patch.json`: `{ "patchFiles": ["./config/webpack-patch/node-builtins.js"] }`

`config\webpack-patch\empty.js`: `module.exports = {};`

`config\webpack-patch\node-builtins.js`:

```js
const path = require('path');
module.exports = function (webpackConfig) {
  webpackConfig.plugins = webpackConfig.plugins || [];
  webpackConfig.plugins.push({ apply(compiler) {
    compiler.hooks.normalModuleFactory.tap('node-builtins-empty', (nmf) => {
      nmf.hooks.beforeResolve.tap('node-builtins-empty', (data) => {
        if (/^node:(fs|https)$/.test(data.request)) data.request = path.resolve(__dirname, 'empty.js');
      });
    });
  } });
  return webpackConfig;
};
```

## Kód: PDF bez Graphu ✅

Font s češtinou (Roboto, licence Apache-2.0) nahraj do knihovny do složky `assets`
(`assets/Roboto-Regular.ttf`). Agent: `m365 spo folder add --webUrl <web> --parentFolderUrl "<URL kořene
knihovny>" --name assets` a `m365 spo file add --webUrl <web> --folder "<kořen knihovny>/assets" --path Roboto-Regular.ttf` ✅
(`sondy/ms-dokumenty/font-upload.log`)
(soubor v repu: `sondy/dokumenty/src/Roboto-Regular.ttf`). Uživatel může soubor do složky přetáhnout v prohlížeči.

```ts
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
  // jiný název než PDF z Wordu (spokojenost.pdf), jinak se navzájem přepíší
  await this._ulozDokument('exporty', 'spokojenost-prehled.pdf', await pdf.save());
}
```

✅ Ve verzi 1.0.0.1 jsou v `exporty` oba soubory vedle sebe: `spokojenost.pdf` (Graph, 61 933 B) a `spokojenost-prehled.pdf`
(pdf-lib, 8 099 B) (`sondy/ms-dokumenty/spokojenost-klik-4.log`). Verze 1.0.0.0 ukládala obě do `spokojenost.pdf` a přepsaly se
(`spokojenost-klik.log`, Producer pdf-lib).

Po `upgrade` appky se první načtení stránky ještě chovalo jako stará verze (pdf-lib uložil do `spokojenost.pdf`) ✅
(`spokojenost-klik-3.log`; hash bundlu tam zapsaný není, starou verzi dokládá chování). O ~40 s později už běžel nový bundle
`7bc9f996…` (`spokojenost-klik-4.log`, hash v logu). Sedí to s ~1 min propagace v `sondy/ms-llm/bundle-propagace.md`.
Po nasazení proto chvíli počkej, obnov stránku a ověř znovu, než hlásíš chybu.

Jedna strana pojme asi 45 dní. Na delší přehled přidej `pdf.addPage` při `y < 40` (❓, v labu byl jeden den).

Bez fontu v knihovně skončí chybou `Soubor assets/Roboto-Regular.ttf: 404` ✅. V PDF je font vložený
(`pdffonts`: Roboto, CID TrueType, Identity-H) a text sedí ✅ (`sondy/ms-dokumenty/pdffonts.log`).

## Kód: PDF z Wordu přes Graph ✅

Do `config\package-solution.json` do objektu `solution`:

```json
"webApiPermissionRequests": [{ "resource": "Microsoft Graph", "scope": "Files.Read.All" }]
```

```ts
// Word, který už leží ve výchozí knihovně webu, vrátí jako PDF a uloží vedle.
private async _pdfZWordu(slozka: string, nazev: string): Promise<void> {
  const pc = this.context.pageContext;
  const graf: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
  const host = new URL(pc.web.absoluteUrl).hostname;
  const cesta = `/sites/${host},${pc.site.id.toString()},${pc.web.id.toString()}/drive/root:/${slozka}/${nazev}:/content?format=pdf`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdf: Blob = await (graf.api(cesta) as any).responseType('blob').get();
  await this._ulozDokument(slozka, nazev.replace(/\.docx$/i, '.pdf'), new Uint8Array(await pdf.arrayBuffer()));
}
```

Volej až po `_word` (převádí soubor, který už je v knihovně): `await this._word(this._hlasy); await this._pdfZWordu('exporty', 'spokojenost.docx');`.
- ✅ V appce Spokojenost: `spokojenost.pdf` z Graphu 61 933 B, PDF 1.7, autor Petra Nováková
  (`sondy/ms-dokumenty/spokojenost-graphpdf-cteni.log`).
- ✅ PDF věrné Wordu, čeština v pořádku, na českém i anglickém webu.
- ✅ Samotné `Files.Read` nestačí: Graph vrátí **403 accessDenied** na soubor v knihovně webu,
  `Files.Read.All` vrátí 200 (`sondy/ms-dokumenty/graph-scope.log`, nástroj `tools/dokumenty-graph-scope.sh`).
- ✅ Schválení je jednou pro celý tenant a sdílí ho všechny SPFx appky: nová appka s
  `Files.Read.All` v tenantu, kde už je schválené, funguje hned a **žádná nová žádost** se
  v API access neobjeví (`sondy/ms-dokumenty/api-access.txt`).
- ✅ Graph převede i Excel a PowerPoint a docx 11,5 MB (`sondy/dokumenty.md`). Limit 2 MB z dokumentace
  pro docx v labu neplatil; pro xlsx/pptx je limit ❓ (`sondy/dokumenty.md` ř. 59).

## Úprava existujícího dokumentu v knihovně ✅ (Galík 3.2, 24. 11.)

Soubor, který už v knihovně leží (napsaný člověkem ve Wordu, Excelu nebo PowerPointu), appka stáhne, upraví a uloží
zpět. Důkazy, celý web part a 8 variant: `sondy/dokumenty/uprava/README.md` (v repu workshopu)
(`appka-uprava/src/webparts/uprava/UpravaWebPart.ts`). Vstupy psala Petra v Office pro web. Výstupy otevřel
Office Online (`office-online/*.png`) i LibreOffice (`vystup/lo/`).

| # | Úkol | Varianta (zkoušej shora) | Lab |
|---|---|---|---|
| 1 | šablona napsaná ve Wordu (`{{jmeno}}`…) | **docxtemplater** s `delimiters: { start: '{{', end: '}}' }` | ✅ všechny zástupné texty, i rozdělené do runů |
| 1b | šablona z **desktopového Wordu** se slučovacím polem **MERGEFIELD** (`«jmeno»`) | nejdřív funkce `vyplnSlucovaciPole` (níže), pak docxtemplater jako v řádku 1 | ✅ Word for Mac (`w:fldSimple`) i složené pole (`w:fldChar` + `w:instrText`, tak ho ukládá Word pro Windows): pole nahrazeno textem, 0 zbylých polí, Office pro web i LibreOffice ukazují jméno. **Samotný docxtemplater pole nechá** ❌ (`«jmeno»` zůstane) |
| 2 | totéž bez další knihovny, i přepis textu v .docx a na snímku .pptx | funkce `nahradVOdstavcich` (níže) + JSZip | ✅ docx 4 náhrady, pptx 3 náhrady, šablona 4 |
| 3 | buňky v .xlsx, sešit se má hned přepočítat / někdo ho má otevřený | **Graph Excel API**: PATCH `workbook/worksheets('List')/range(address='B2:C3')`, POST `workbook/tables('T')/rows` | ✅ 0,5–0,9 s, Excel přepočítá, změna se živě objeví v otevřeném Excelu Online; potřebuje Graph `Files.ReadWrite.All` (lab ✅ schválené, E.ON ⛔) |
| 4 | buňky v .xlsx bez Graph oprávnění | JSZip: přepsat `<c>` v `xl/worksheets/sheet1.xml`, smazat uložený výsledek vzorce, `fullCalcOnLoad="1"` | ✅ ostatní části sešitu beze změny |
| 5 | buňky v .xlsx, pohodlně | exceljs `wb.xlsx.load(buf)` → `getCell('B3').value = …` → `writeBuffer()` | ✅ s výhradou: vzorec si nese **starý uložený výsledek**. Excel Online přepočítá, LibreOffice a čtení hodnot strojem ne |

**Pasti (všechny změřené):**
- ❌ `xml.split('{{utvar}}').join(…)` nad surovým `document.xml` **nestačí**. Word zástupný text rozdělí do více runů,
  jakmile v něm je změna formátu, oprava překlepu nebo podtržení kontroly pravopisu (`{{ut` `va` `r}}`). Naivní náhrada
  nechala 2 ze 4 zástupných textů beze změny. PowerPoint pro web dělí do runů i obyčejný text.
- Zástupný text po náhradě převezme formát **prvního** runu (tučná část uprostřed zmizí).
- Graph: adresa se dvěma cestami `/sites/{host}:/sites/x:/drive/root:/soubor` vrátí `400 Resource not found for the
  segment 'root:'`. Nejdřív zjisti id webu (`/sites/{host}:/sites/x`), pak `/sites/{id}/drive/root:/cesta`.
- Graph: čtení **bez relace** hned po zápisu vrátilo ve 4 z 11 případů předchozí stav. Když po zápisu čteš výsledek
  (přepočet), založ relaci `createSession { persistChanges: true }` a posílej hlavičku `workbook-session-id`. V relaci
  čtení sedělo vždy a PATCH trval 85–110 ms.
- Graph dodržuje práva uživatele: návštěvník webu dostane `Contact the workbook owner to request edit access.` ✅
- Excel pro web v češtině přijme jen `=SUMA(…)`, `=SUM(…)` uloží jako `#NAME?` (to se týká lidí, ne appky).

```ts
// docx (w:p/w:t) i pptx (a:p/a:t): najdi text přes hranice runů a nahraď ho
const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
function nahradVOdstavcich(xml: string, ns: string, mapa: [string, string][]): { xml: string; pocet: number } {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  let pocet = 0;
  const ps = doc.getElementsByTagNameNS(ns, 'p');
  for (let i = 0; i < ps.length; i++) {
    const ts = Array.prototype.slice.call(ps[i].getElementsByTagNameNS(ns, 't')) as Element[];
    for (const [hledat, nahradit] of mapa) {
      let od = 0;
      for (;;) {
        const texty = ts.map((t) => t.textContent || '');
        const idx = texty.join('').indexOf(hledat, od);
        if (idx < 0) break;
        const konec = idx + hledat.length; let s = 0; let prvni = true;
        for (let j = 0; j < ts.length; j++) {
          const e = s + texty[j].length;
          if (e > idx && s < konec) {
            const pred = texty[j].slice(0, Math.max(0, idx - s)), po = texty[j].slice(Math.min(texty[j].length, konec - s));
            ts[j].textContent = prvni ? pred + nahradit + po : po;
            if (ns === W) ts[j].setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
            prvni = false;
          }
          s = e;
        }
        pocet++; od = idx + nahradit.length;
      }
    }
  }
  let out = new XMLSerializer().serializeToString(doc);
  if (!/^<\?xml/.test(out)) out = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + out;
  return { xml: out, pocet };
}

// použití: načti soubor z knihovny, uprav, ulož (uložení: _uloz z „Kód: uložení do knihovny“)
const r = await this.context.spHttpClient.get(`${web}/_api/web/GetFileByServerRelativePath(decodedurl='${encodeURIComponent(cesta)}')/$value`, SPHttpClient.configurations.v1);
const JSZip = (await import('jszip')).default;            // jszip@3.10.2
const zip = await JSZip.loadAsync(await r.arrayBuffer());
const v = nahradVOdstavcich(await zip.file('word/document.xml')!.async('string'), W, [['Stavby Morava', 'Elektro Vysočina']]);
zip.file('word/document.xml', v.xml);                      // pptx: 'ppt/slides/slide1.xml' a A
const vysledek = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });

// šablona přes docxtemplater@3.71.1 + pizzip@3.3.0
const PizZip = (await import('pizzip')).default;
const Docxtemplater = (await import('docxtemplater')).default;
const dt = new Docxtemplater(new PizZip(buf), { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' } });
dt.render({ jmeno: this.context.pageContext.user.displayName, utvar: 'Distribuce Brno' });
const vyplneno = dt.getZip().generate({ type: 'arraybuffer', compression: 'DEFLATE' }) as ArrayBuffer;

// šablona z desktopového Wordu: slučovací pole MERGEFIELD → prostý text (pak teprve docxtemplater nad stejným zipem)
// Umí <w:fldSimple w:instr="MERGEFIELD x"> (Word for Mac) i složené pole fldChar begin/instrText/separate/výsledek/end.
// W a XML_SPACE jako výše; zdroj: sondy/dokumenty/uprava/appka-uprava/src/webparts/uprava/UpravaWebPart.ts
const XML_SPACE = 'http://www.w3.org/XML/1998/namespace';
function vyplnSlucovaciPole(xml: string, data: Record<string, string>): { xml: string; pocet: number; chybi: string[] } {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const jmenoPole = (instr: string): string | undefined => (instr.match(/^\s*MERGEFIELD\s+"?([^\s"\\]+)"?/i) || [])[1];
  let pocet = 0; const chybi: string[] = [];
  const nastavText = (runy: Element[], hodnota: string): void => {
    let prvni = true;
    runy.forEach((r) => Array.prototype.slice.call(r.getElementsByTagNameNS(W, 't')).forEach((t: Element) => {
      t.textContent = prvni ? hodnota : ''; t.setAttributeNS(XML_SPACE, 'xml:space', 'preserve'); prvni = false;
    }));
  };
  // 1) jednoduchá pole
  Array.prototype.slice.call(doc.getElementsByTagNameNS(W, 'fldSimple')).forEach((f: Element) => {
    const k = jmenoPole(f.getAttributeNS(W, 'instr') || '');
    if (!k) return;
    if (!(k in data)) { chybi.push(k); return; }
    let runy = Array.prototype.slice.call(f.getElementsByTagNameNS(W, 'r')) as Element[];
    if (!runy.length) { const r = doc.createElementNS(W, 'w:r'); r.appendChild(doc.createElementNS(W, 'w:t')); f.appendChild(r); runy = [r]; }
    nastavText(runy, data[k]);
    while (f.firstChild) f.parentNode!.insertBefore(f.firstChild, f);   // runy výsledku ven z pole
    f.parentNode!.removeChild(f); pocet++;
  });
  // 2) složená pole (begin/instr/separate/výsledek/end; v jednom odstavci i přes víc odstavců)
  const runy = Array.prototype.slice.call(doc.getElementsByTagNameNS(W, 'r')) as Element[];
  const typ = (r: Element): string => { const fc = r.getElementsByTagNameNS(W, 'fldChar')[0]; return fc ? fc.getAttributeNS(W, 'fldCharType') || '' : ''; };
  for (let i = 0; i < runy.length; i++) {
    if (typ(runy[i]) !== 'begin') continue;
    let j = i + 1; let instr = ''; let hloubka = 0;
    for (; j < runy.length && !(hloubka === 0 && /separate|end/.test(typ(runy[j]))); j++) {
      if (typ(runy[j]) === 'begin') hloubka++; if (typ(runy[j]) === 'end') hloubka--;
      const it = runy[j].getElementsByTagNameNS(W, 'instrText'); for (let q = 0; q < it.length; q++) instr += it[q].textContent || '';
    }
    const k = jmenoPole(instr);
    if (!k) continue;
    if (!(k in data)) { chybi.push(k); continue; }
    const sep = typ(runy[j]) === 'separate' ? j : -1;
    let e = j; while (e < runy.length && typ(runy[e]) !== 'end') e++;
    const vysledek = sep >= 0 ? runy.slice(sep + 1, e) : [];
    if (vysledek.length) nastavText(vysledek, data[k]);
    else { const r = doc.createElementNS(W, 'w:r'); const t = doc.createElementNS(W, 'w:t'); t.textContent = data[k]; r.appendChild(t); runy[e].parentNode!.insertBefore(r, runy[e]); }
    runy.slice(i, sep >= 0 ? sep + 1 : e).concat([runy[e]]).forEach((r) => r.parentNode && r.parentNode.removeChild(r));
    pocet++; i = e;
  }
  let out = new XMLSerializer().serializeToString(doc);
  if (!/^<\?xml/.test(out)) out = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + out;
  return { xml: out, pocet, chybi };
}

const zip = new PizZip(buf);
const pole = vyplnSlucovaciPole(zip.file('word/document.xml')!.asText(), data);   // → { xml, pocet, chybi }
zip.file('word/document.xml', pole.xml);
const dt2 = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, delimiters: { start: '{{', end: '}}' },
  nullGetter: (p) => `{{${(p as { value: string }).value}}}` });   // chybějící hodnota nechá značku viditelnou místo „undefined“
dt2.render(data);

// Excel přes Graph (MSGraphClientV3), v relaci
const g = await this.context.msGraphClientFactory.getClient('3');
const site = await g.api(`/sites/${new URL(web).hostname}:${this.context.pageContext.web.serverRelativeUrl}`).select('id').get();
const item = await g.api(`/sites/${site.id}/drive/root:/slozka/rozpocet.xlsx`).select('id,parentReference').get();
const wb = `/drives/${item.parentReference.driveId}/items/${item.id}/workbook`;
const sid = (await g.api(`${wb}/createSession`).post({ persistChanges: true })).id;
await g.api(`${wb}/worksheets('rozpocet')/range(address='B2:C3')`).header('workbook-session-id', sid).patch({ values: [[125000, 'ok'], [355000, 'ok']] });
await g.api(`${wb}/tables('Polozky')/rows`).header('workbook-session-id', sid).post({ values: [['Rezerva', 25000]] });
const b5 = await g.api(`${wb}/worksheets('rozpocet')/range(address='B5')`).header('workbook-session-id', sid).select('values').get();
await g.api(`${wb}/closeSession`).header('workbook-session-id', sid).post({});
```

Server (Container App s LibreOffice) pro úpravy OOXML potřeba není, všechno prošlo v prohlížeči. Hodí se jen na staré
formáty .doc a .xls a na převod do PDF (`sondy/container-app/libreoffice.md` (v repu workshopu)).

## Ověření (vždy)

1. Uživatel klikne na tlačítko → soubor se stáhne a v knihovně je ve složce `exporty` s ním jako
   autorem ✅ (`sondy/ms-dokumenty/knihovna-exporty.png`).
2. Otevře ho: háčky a čárky správně, tabulka má všechny řádky ✅ (ověřeno rozbalením docx/pptx/xlsx
   a `pdftotext` / náhledem PDF; v desktopovém Office na Windows ❓, viz Neověřeno).
3. SharePoint po nahrání Office soubor doplní o vlastnosti a zvětší ✅ (docx 9 845 → 17 083 B,
   xlsx 6 836 → 13 742 B, pptx 57 539 → 65 061 B; PDF beze změny). To je v pořádku.
4. Kdo není členem webu, stránku vůbec neotevře (SharePoint ho přesměruje na `AccessDenied.aspx`, HTTP 200, ne 401/403); hned po přidání do skupiny Členové uložení prošlo napoprvé ✅
   (`sondy/ms-dokumenty/prava-zpozdeni.log`). Jednou jsme po přidání viděli pár minut 403, log se nezachoval ❓.

## Varianty a doporučení

| Varianta | Stav v labu | Pro | Proti | Co chce IT E.ON | Citizen developer |
|---|---|---|---|---|---|
| **A: v prohlížeči (tento skill)** | ✅ všechny formáty | žádná licence ani server, práva uživatele | velké knihovny (líně), PDF z Wordu chce `Files.Read.All` | jen schválení `Files.Read.All` (pro Graph PDF) | snadné: kopírování úryvků |
| B: Power Automate | převod hotového souboru OneDrive „Convert file“ je Standard ✅ (tier z API), „Word Online (Business)“ (šablona) je **Premium** ✅ (tier z API, `sondy/ms-dokumenty/pa-tier-word.log`); flow s „Convert file“ uloženo, ale **běh selhal** (nepřihlášené připojení, `sondy/power-automate.md` ř. 20), takže převod přes PA ❓ | bez kódu | šablona jen s Premium; flow a připojení někdo spravuje | licence Premium nebo PAYG, správa připojení | střední |
| C: server (Container App) | v `sondy/dokumenty.md` | cokoli (LibreOffice, šablony) | server, identita, provoz | subscription, app registrace | těžké |

Doporučení pro workshop: **A**. B jen pro převod hotového souboru, C až když A nestačí.
Podrobnosti: `sondy/dokumenty.md`, `sondy/power-automate.md`.

## Kdy to nejde v E.ON

- Graph PDF: dokud správce neschválí `Files.Read.All` v SharePoint admin centru → **Advanced → API access** → žádost → **Approve**.
  ✅ UI Approve rozšířil grant pod Global Adminem (ui-4: `pavel.admin`, čekající 5 → 4, schválené 61 → 62, po reloadu
  drží, Graph PATCH `oAuth2PermissionGrants` 204; `sondy/overeni/api-access/ui-4/`). Schválení přes m365 CLI / CSOM
  v labu nefungovalo ❌ (`sondy/overeni/api-access/07-…`, `08-…`, `09-…`, `10-…`), schvaluje se v prohlížeči.
  Zda stačí role SharePoint admin, je ❓. Do schválení pdf-lib s fontem.
- Uživatel jen se čtením (Návštěvník webu): soubor se stáhne, uložení skončí **403** ✅
  (`sondy/ms-dokumenty/ctenar-2.log`). Dřívější verze se stažením až po uložení nestáhla nic ✅ (`ctenar.log`).

**Věta pro IT (ServiceNow):** „Prosím o schválení žádosti o oprávnění API pro SharePoint Framework
(SharePoint admin centrum → Advanced → API access): Microsoft Graph, delegované `Files.Read.All`,
pro balíček <název .sppkg> z webu <web>. Slouží k převodu dokumentů z knihovny do PDF jménem
přihlášeného uživatele, bez aplikačních oprávnění. Schválení platí pro celý tenant.“ (Pod Global Adminem schválení v UI ✅; zda stačí SharePoint admin, je ❓, viz Neověřeno.)

## Neověřeno

| Tvrzení | Proč neověřeno | Jak a kde ověřit |
|---|---|---|
| Bez schválení `Files.Read.All` appka dostane chybu souhlasu (`AADSTS65001`) | v labu je `Files.Read.All` udělené celému tenantu; odebrat ho by rozbilo jiné sondy | v E.ON před schválením, nebo v novém trial tenantu: kliknout „Word → PDF“ a opsat chybu z konzole |
| (a) Úplně první grant pro API, které ještě žádný grant nemá (Approve vytvoří grant, POST) | ui-4 měřil jen rozšíření existujícího grantu (PATCH 204) | balíček žádající scope API bez grantu → Approve v UI → Graph `oAuth2PermissionGrants` |
| (b) Zda žádost schválí role **SharePoint admin** (bez Global Admina) | ui-4 běžel pod Global Adminem `pavel.admin` | totéž Approve pod účtem jen s rolí SharePoint admin |
| (c) Jak se chová žádost ze **site** catalogu pro scope, který ještě schválený není | ui-4 nasazoval z tenantového katalogu (`/sites/apps/AppCatalog`, `sondy/overeni/api-access/18-add-write-2026-11-23.log`); appka z mého site catalogu nežádala nic nového (scope už schválený, `sondy/ms-dokumenty/api-access.txt`) | balíček s neschváleným scope nahrát do site catalogu, deploy, sledovat API access |
| Otevření souborů v desktopovém Word/Excel/PowerPoint na Windows | lab je macOS; obsah ověřen rozbalením a v PDF náhledem | na stroji účastníka otevřít `exporty/*` |
| Firemní font E.ON v PDF | font E.ON v labu není; nutná TTF s licencí pro vkládání | s IT/marketingem E.ON |
| Webpack patch na toolchainu EG.D (SPFx 1.18.2 + gulp) | lab má jen 1.24.1 + Heft | build na stroji EG.D |
| Font Roboto stažený účastníkem z webu (fonts.google.com) na síti E.ON | lab ho bere z repa | na stroji účastníka |
| Šablona s **ovládacími prvky obsahu** (`w:sdt`) | Word pro web je vložit neumí; desktopová šablona z 24. 11. obsahuje jen značky a MERGEFIELD (MERGEFIELD už ✅, řádek 1b výše) | šablonu s ovládacím prvkem vyrobit v desktopovém Wordu, nahrát do `uprava/vstup/`, doplnit větev pro `w:sdt` |
| Složené pole MERGEFIELD uložené **opravdu Wordem pro Windows** | lab je macOS; složené pole v testu je ruční přepis `w:fldSimple` z Word for Mac na `w:fldChar`/`w:instrText` (`uprava/vstup/sablona-slozene-pole.docx`) | šablonu s polem uložit ve Wordu na Windows (stroj EG.D), nahrát a kliknout „Šablona z desktop Wordu + MERGEFIELD“ |
| Zda Graph Excel API stačí `Sites.ReadWrite.All` místo `Files.ReadWrite.All` | v labu je `Files.ReadWrite.All` schválené celému tenantu, odebrání by rozbilo jiné sondy | v E.ON podle toho, co správce schválí ⛔ |
| API čte ruční zápis, který editor právě píše v Excelu Online | headless Excel ve druhé záložce psaní nepřevzal, měření nečisté (`sondy/dokumenty/uprava/soubeh/soubeh4.log`) | dva lidé se zápisem, každý ve svém prohlížeči |

## Zdroje

`sondy/ms-dokumenty/README.md` (důkazy tohoto skillu), `sondy/dokumenty/uprava/README.md` (úprava existujících dokumentů, Graph Excel API, souběh), `sondy/dokumenty.md` (knihovny, Graph, pasti,
varianty), kód `sondy/ms-dokumenty/appka-spokojenost/` (Spokojenost), `sondy/ms-dokumenty/appka/` a `sondy/dokumenty/spfx/egd-dokumenty/`.
