---
name: egd-maily
description: Nauč SPFx appku EG.D poslat e-mail s přílohou - jménem přihlášeného uživatele přes Microsoft Graph sendMail (bez Azure, jen jedno schválení správcem), a poradí, co dělat, když má mail odejít ze systémové schránky nebo bez uživatele. Použij, když uživatel řekne „pošli to mailem“, „odešli export jako přílohu“, „vygeneruj PDF a pošli mailem“, „notifikace schvalovateli“, „e-mail z appky“, „sendMail“, „Mail.Send“, „ErrorAccessDenied u mailu“, „403 u sendMail“, „mail z noreply / sdílené schránky“ nebo „upozornění, když přijde nová žádost“.
license: interní pomůcka workshopu EG.D
---

# E-maily s přílohou (požadavek 6)

Uživatel je začátečník na Windows. Navazuje na `egd-prvni-appka`, příloha typicky z `egd-dokumenty`.

Značky: ✅ změřeno v labu 22. 11. 2026 · ❓ neověřeno (viz sekce Neověřeno). Důkazy:
`sondy/ms-maily/README.md` (v repu workshopu) (SPFx end-to-end) a `sondy/napojeni.md` (server, Graph).

## Varianty

| Kdo mail posílá | Cesta | Stav v labu | Pro / proti | Co chce IT E.ON | Obtížnost pro citizen developera |
|---|---|---|---|---|---|
| **přihlášený uživatel klikne v appce** („pošli export šéfovi“) | SPFx: Graph `POST /me/sendMail` přes `MSGraphClientV3`, scope `Mail.Send` | ✅ celé prošlo: web part SPFx 1.24.1 → 202 → doručeno s přílohou, kopie v Odeslaných | + bez Azure, bez licencí; − schválení je tenantové (platí pro všechny SPFx appky) | schválit `Mail.Send` (SharePoint admin → Advanced → API access, česky Upřesnit → Přístup k rozhraní API) | nízká: jedna funkce + řádek v `package-solution.json` |
| uživatel bez schválení `Mail.Send` | `mailto:` odkaz (otevře poštovního klienta, uživatel odešle sám) | ✅ odkaz se správně zakóduje; ❓ otevření Outlooku na Windows | + nic neschvaluje IT; − bez přílohy, uživatel musí kliknout Odeslat | nic | velmi nízká |
| uživatel jménem sdílené schránky | `/me/sendMail` s polem `from` = sdílená schránka | ✅ s pouhým `Mail.Send` + Send As v Exchange (měřeno delegovaným tokenem mimo SPFx) | + mail „od“ týmu; − Send As musí dát správce Exchange každému uživateli | Send As na schránku | nízká v kódu, závisí na IT |
| systémová schránka (report, noreply) nebo bez uživatele (v noci) | server: Container Apps Job + Exchange RBAC na jednu schránku, viz `egd-planovane-ulohy` | ✅ (`sondy/napojeni.md`, Sonda 2) | + nezávislé na uživateli; − Azure | subscription, Exchange RBAC | vysoká, dělá IT |
| plánovaný report bez kódu | Power Automate: Recurrence → SharePoint → Outlook „Send an email (V2)“, viz `egd-planovane-ulohy` | ✅ klikací cesta prošla, mail doručen | + klikání, Standard konektory; − mimo git, vázané na vlastníka | licence PA, role v prostředí | střední |

## Žebřík: co agent zkusí u účastníka (od nejjednoduššího)

| Krok | Zkus | Funguje? (test) | Když ne |
|---|---|---|---|
| 1 | Je `Mail.Send` už schválené? Postav panel „Poslat mailem“ (kód níže), nasaď, klikni | 202 a mail v Odeslaných ✅ | 403 `ErrorAccessDenied` → krok 2 |
| 2 | Starý token: zavři kartu, otevři stránku v novém okně InPrivate a klikni znovu (InPrivate ❓; v labu ✅ pomohlo smazat uložené tokeny MSAL, `maily-spo-klik.mjs --novy-token`) | 202 | pořád 403 → krok 3 |
| 3 | Je v `package-solution.json` `webApiPermissionRequests` s `Mail.Send` (patří tam **před** nasazením) a nasazený nový `.sppkg`? | při nasazení se objeví hláška o žádosti o API; žádost je vidět v SharePoint admin → Advanced → API access (česky Upřesnit → Přístup k rozhraní API → Žádosti čekající na vyřízení) s názvem balíčku ✅ (`sondy/overeni/api-access/ui-4/po-reloadu.png`; pro běžného uživatele nečitelné: `permissionrequest list` → 403 ✅) | doplň řádek, nasaď znovu |
| 4 | Pošli IT větu níže (schválení dělá správce) | po schválení krok 1 | IT odmítne → krok 5 |
| 5 | `mailto:` odkaz (bez přílohy, uživatel odešle sám) | otevře se pošta s předmětem a textem (✅ zakódování; ❓ Outlook na Windows) | krok 6 |
| 6 | Bez kódu: Power Automate (`egd-planovane-ulohy`), nebo systémová schránka přes IT | podle toho skillu | zapiš, co chybí, do zprávy pro Pavla |

Pro a proti a co chce IT u každé cesty: tabulka Varianty výše. Na konci zapiš, který krok prošel. **Doporučení na workshop:** krok 1 v labu, kde je `Mail.Send` schválené.
Mail odejde **pod jménem uživatele** a skončí v jeho Odeslaných ✅. V E.ON to podmiň schválením od IT; bez něj `mailto:`.

## Nastavení balíčku

`config\package-solution.json`, do objektu `solution` (vedle případného `Files.Read.All`):

```json
"webApiPermissionRequests": [{ "resource": "Microsoft Graph", "scope": "Mail.Send" }]
```

Po nasazení `.sppkg` vznikne žádost u správce ✅ — **i když appka leží v katalogu webu**, ne v tenantovém
(změřeno: `prvni-appka-client-side-solution`, Microsoft Graph, `Mail.Send`).

### Schválení (dělá správce, ne účastník)

| Cesta | Stav v labu |
|---|---|
| SharePoint admin centrum → Advanced → API access → žádost → Approve (česky Upřesnit → Přístup k rozhraní API → Žádosti čekající na vyřízení → žádost → Schválit ❓ popisek tlačítka) | ✅ UI Approve rozšířil grant pod Global Adminem (ui-4, žádost z tenantového katalogu; ze site catalogu ❓): čekající 5 → 4, schválené 61 → 62, po reloadu stav drží; prohlížeč při kliku poslal Graph PATCH `oAuth2PermissionGrants` → 204 a SharePoint `PermissionRequests('…')` → 204 (`sondy/overeni/api-access/ui-4/`, účet `pavel.admin`). ❓ zbývá: úplně první grant pro API, které ještě grant nemá (POST), neměřen; zda stačí role SharePoint admin bez Global Admina |
| `m365 spo serviceprincipal permissionrequest approve --id <id>` (CLI 11.11.0) | ❌ chyba SharePointu „The service principal for permssion request … could not be found.“; `permissionrequest list` navíc padá na 403 (`sondy/ms-maily/permissionrequest-list.log`) |
| Graph: k `oauth2PermissionGrant` principalu „SharePoint Online Web Client Extensibility“ pro Microsoft Graph přidat scope `Mail.Send` | ✅ PATCH → 204, grant `consentType: AllPrincipals` obsahuje `Mail.Send` (`sondy/ms-maily/grant-po.txt`); žádost v admin centru pak dál visí jako čekající |

Graph varianta (jen správce, Global Admin / Cloud App Admin; v labu `az` jako admin):

```bash
G=https://graph.microsoft.com/v1.0
CLI=$(az rest --method get --url "$G/servicePrincipals?\$filter=displayName eq 'SharePoint Online Web Client Extensibility'&\$select=id" --query 'value[0].id' -o tsv)
GR=$(az rest --method get --url "$G/servicePrincipals?\$filter=appId eq '00000003-0000-0000-c000-000000000000'&\$select=id" --query 'value[0].id' -o tsv)
ID=$(az rest --method get --url "$G/oauth2PermissionGrants?\$filter=clientId eq '$CLI' and resourceId eq '$GR'" --query 'value[0].id' -o tsv)
S=$(az rest --method get --url "$G/oauth2PermissionGrants/$ID" --query scope -o tsv)
az rest --method patch --url "$G/oauth2PermissionGrants/$ID" --headers Content-Type=application/json --body "{\"scope\":\"$S Mail.Send\"}"
```

Pozor: `tools/ai-spfx-api-grant.sh` na Microsoft Graph **nepoužívej** (přepisuje tagy service principalu API).

## Kód ✅ (prošel build i odeslání v SPFx 1.24.1)

```ts
import { MSGraphClientV3 } from '@microsoft/sp-http';

// Pošle mail jménem přihlášeného uživatele. Příloha: bajty souboru (v labu prošlo až 30 MB).
private async _posliMail(komu: string, predmet: string, text: string,
                         priloha?: { nazev: string; bajty: Uint8Array; typ: string }): Promise<void> {
  const graf: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
  const zprava: Record<string, unknown> = {
    subject: predmet,
    body: { contentType: 'Text', content: text },
    toRecipients: komu.split(/[;,]\s*/).filter(Boolean).map((a) => ({ emailAddress: { address: a } }))
  };
  if (priloha) {
    let bin = ''; priloha.bajty.forEach((b) => { bin += String.fromCharCode(b); });
    zprava.attachments = [{
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: priloha.nazev, contentType: priloha.typ, contentBytes: btoa(bin)
    }];
  }
  await graf.api('/me/sendMail').post({ message: zprava, saveToSentItems: true });
}
```

Volání z tlačítka (ověřený tvar; **ne** `.finally()` — v šabloně `egd-prvni-appka` build spadne na `TS2550` ✅):

```ts
tlacitko.addEventListener('click', () => {
  tlacitko.disabled = true;
  this._posliMail(komu.value.trim(), 'Přehled požadavků', 'Dobrý den, v příloze…',
                  { nazev: 'pozadavky.csv', bajty, typ: 'text/csv' })
    .then(() => { tlacitko.disabled = false; vysledek.textContent = 'Odesláno.'; })
    .catch((e: { statusCode?: number; code?: string; message?: string }) => {
      tlacitko.disabled = false;
      vysledek.textContent = `Chyba ${e.statusCode ?? ''} ${e.code ?? ''} ${e.message ?? ''}`;
    });
});
```

CSV s češtinou pro Excel: na začátek textu dej `'﻿'` a převeď `new TextEncoder().encode(text)` ✅ (příloha
dorazila s BOM a správnou diakritikou).

Pravidla:
- Odpověď 202 bez těla = přijato k odeslání ✅ (doručení do pár sekund ✅).
- Velikost přílohy ✅: 30 MB v jednom `sendMail` doručeno, 40 MB → **400 `ErrorMessageSizeExceeded`**. Velké
  soubory jsou v prohlížeči pomalé (30 MB ≈ 20 s převodu) — nad pár MB raději pošli **odkaz** na soubor v knihovně.
- Návrhové pravidlo workshopu (ne omezení platformy): adresáta nech vybrat nebo potvrdit uživatele; appka neposílá mail
  sama od sebe při načtení stránky.
- Delegované `sendMail` potřebuje u odesílatele licenci s Exchange Online ✅ (v labu E5; pozor, lab stojí na trialu
  `SPE_E5`, který končí 25. 11. 2026 03:04 UTC, `sondy/ms-maily/licence-subscriptions.json`).
- `/users/<sdílená schránka>/sendMail` vrací 403 „requires Mail.Send.All, Mail.Send.Shared“ ✅ (`sendas.log`) — pro sdílenou
  schránku použij `/me/sendMail` s `from: { emailAddress: { address: '<schránka>' } }` (stačí `Mail.Send` + Send As ✅).

## Jedno tlačítko: vygeneruj PDF a pošli mailem ✅ (24. 11. 2026)

PDF vznikne v prohlížeči podle skillu `egd-dokumenty` a jeho bajty jdou rovnou do `_posliMail` jako příloha.
Do knihovny se PDF neukládá, takže nic nepřepíše. Ověřeno v appce Spokojenost na `egd-sonda-ms-maily`
(stránka `pdf-mail.aspx`, balíček `appka-pdf-mail` 1.0.0.0, SPFx 1.24.1). Kliknul lab účet Tomáš, adresátka Eva.
Důkazy jsou v `sondy/ms-pdf-mail/` (v repu workshopu).

| Varianta | Co navíc potřebuje | Výsledek v labu |
|---|---|---|
| **A: pdf-lib s fontem** (doporučeno) | jen `Mail.Send`; font `assets/Roboto-Regular.ttf` v knihovně webu (`egd-dokumenty`) | ✅ 202 za 1,6 s od kliku; Eva dostala `spokojenost-2026-11-24.pdf` (8 099 B), hlavička `%PDF-1.7`, font Roboto vložený, čeština v pořádku (`klik-pdflib.log`, `doruceni.log`, `pdf-kontrola.log`, `nahled-pdflib-1.png`) |
| **B: Word → PDF přes Graph** (věrné Wordu) | `Mail.Send` **i** `Files.Read.All`; Word se nejdřív uloží do `exporty` | ✅ 202 za 2,6 s od kliku; doručeno `spokojenost-word-2026-11-24.pdf` (61 933 B), `%PDF-1.7`, Creator Microsoft Word (`klik-graphpdf.log`, `nahled-graph-1.png`) |
| **C1: SPFx + Container App (LibreOffice)** → mail ze SPFx | Azure (Container App, ACR), Entra appka API + schválení `access_as_user` pro SPFx, `Mail.Send` | ✅ Word z prohlížeče (`docx`) → `AadHttpClient` POST `/api/pdf?ext=docx` na `ca-egd-dokumenty` → `_posliMail`. **Studený start** (0 replik): převod 35,0 s (server 1,1 s), 202 za 35,5 s od kliku (`klik-lo-studeny.log`). **Teplý**: převod 1,5–1,6 s, 202 za 2,0 s (2 kliky, `klik-lo-teply.log`). Eva dostala 3× `spokojenost-lo-2026-11-24.pdf` (18 297 B), `%PDF-1.6`, Producer LibreOffice 7.4, Liberation Serif, čeština v pořádku (`doruceni-lo.log`, `pdf-kontrola-lo.log`, `nahled-lo-1.png`) |
| **C2: SPFx + Container App, mail posílá server (OBO)** | jako C1 + admin consent API → Graph `Mail.Send` (uživatel ho dát nesmí ✅), federated credential nebo tajemství v Key Vaultu | ❓ neměřeno. OBO ze SPFx přes Container App ✅ jen pro čtení pošty (`Mail.ReadBasic`, 200 za 486 ms; `sondy/container-app/obo.md` (v repu workshopu), `obo/dukazy/spfx/tomas.prochazka.json`). `sendMail` přes OBO ani LibreOffice + OBO v jednom API neměřil nikdo |

Oba maily jsou v Odeslaných u Tomáše ✅ (`odeslane.log`). Hláška 404 v konzoli u varianty B při prvním kliku je
očekávaná: složka `exporty` na čerstvém webu ještě není a `_ulozDokument` ji při 404 založí ✅.

**Varianta C v kostce** (převzato ze sond `ca-libreoffice` a `ca-obo`, znovu neměřeno):
- **Pro:** převede i existující soubor, který v M365 není (upload z disku), formáty mimo OOXML (doc, odt, rtf) a hromadné
  nebo plánované převody (Container Apps Job). C2 navíc nechá `Mail.Send` jen jednomu API, ne všem SPFx appkám v tenantu,
  a server rozhodne, komu a co smí poslat.
- **Proti:**
  - LibreOffice ≠ Office: u docx tabulky bez pevných šířek dá všem sloupcům stejnou šířku a víc se zalamuje, u xlsx
    tučné buňky bez jména fontu dostanou patkový Caladea ✅ (porovnání v `libreoffice/dukazy/porovnani/`).
    Dokument s formátováním a složitými tabulkami je proto věrnější přes **B (Graph)**.
  - Studený start ~26–28 s při min 0 replik; min 1 replika stojí odhadem ~23 USD/měsíc.
  - Image má 254 MB a build vyžaduje Docker.
  - Dokument uložený přímo Wordem nebo šablona E.ON ❓ (nezkoušeno).
- **IT E.ON:**
  - Azure subscription s Container Apps a ACR, build image (pipeline, citizen developer bez admina Docker nespustí ⛔).
  - Registrace Entra appky API a schválení `access_as_user` pro SPFx v API access.
  - Pro C2 navíc admin consent API → Graph `Mail.Send` a federated credential, nebo tajemství v Key Vaultu.
- **C1 v labu** (24. 11., ms-maily):
  - Postavené nad stávající `ca-egd-dokumenty`, žádný nový zdroj v Azure.
  - Adresu a appId API čte appka z knihovny webu, z `assets/prevod-api.json` (`{ "url": "https://…", "appId": "…" }`).
    V kódu nic natvrdo není a přesun API je jen výměna souboru.
  - V `package-solution.json` přibyl `{ "resource": "egd-ca-dokumenty", "scope": "access_as_user" }`. Token prošel, protože
    schválení pro SPFx v labu už bylo (tenantové).
  - Zda balíček v API access založil novou žádost, ❓: výpis žádostí vrátil CLI 403.
  - Studený start je v prohlížeči delší než v sondě (35 s proti 25,6 s), ale `AadHttpClient` nevypršel.
  - Uživatel do té doby vidí „Vyrábím PDF…“. Pro E.ON proto napiš do UI, že první převod po pauze trvá až minutu, nebo zvaž
    min 1 repliku (~23 USD/měsíc).
- **C2** (OBO `sendMail` na serveru) zůstává ❓: patří ca-obo, potřebuje souhlas API → Graph `Mail.Send`.

Doporučení:
- **A**, protože nepotřebuje druhé tenantové schválení a PDF je malé.
- **B**, když má PDF vypadat přesně jako Word (šablona, formátování). Do `webApiPermissionRequests` pak patří oba scope.
- **C1** jen tehdy, když soubor v M365 není (upload, jiné formáty) nebo jde o hromadné převody. Funguje ✅, ale chce Azure
  a první klik po pauze trvá ~35 s.
- **C2**, když IT nechce `Mail.Send` pro všechny SPFx appky; ❓ neověřeno.

Kód (do web partu z `egd-dokumenty`). Funkce `_pdfPrehled` je `_pdfBezGraphu` ze skillu `egd-dokumenty`, jen místo
`_ulozDokument` vrátí `pdf.save()`. `_posliMail` je výše:

```ts
// Bajty PDF přehledu (pdf-lib + font s češtinou z knihovny). Nic neukládá.
private async _pdfPrehled(hlasy: IHlas[]): Promise<Uint8Array> {
  const bajtyFontu = await this._bajtyZKnihovny('assets/Roboto-Regular.ttf');
  const [{ PDFDocument }, fk] = await Promise.all([
    import(/* webpackChunkName: 'lib-pdf' */ 'pdf-lib'), import(/* webpackChunkName: 'lib-pdf' */ '@pdf-lib/fontkit')]);
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fk.default);
  const font = await pdf.embedFont(bajtyFontu, { subset: true });
  const strana = pdf.addPage([595, 842]); let y = 790;
  strana.drawText('Spokojenost s prostředím kanceláře – přehled po dnech', { x: 40, y, size: 14, font }); y -= 28;
  for (const [d, n, p] of this._souhrn(hlasy)) { strana.drawText(`${d}   hlasů: ${n}   průměr: ${p}`, { x: 40, y, size: 11, font }); y -= 16; }
  return pdf.save();
}

// Varianta B: bajty PDF převedeného Graphem z Wordu, který už leží ve výchozí knihovně webu.
private async _pdfZWorduBajty(slozka: string, nazev: string): Promise<Uint8Array> {
  const pc = this.context.pageContext;
  const graf: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
  const host = new URL(pc.web.absoluteUrl).hostname;
  const cesta = `/sites/${host},${pc.site.id.toString()},${pc.web.id.toString()}/drive/root:/${slozka}/${nazev}:/content?format=pdf`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdf: Blob = await (graf.api(cesta) as any).responseType('blob').get();
  return new Uint8Array(await pdf.arrayBuffer());
}
```

Tlačítko (v `render()` přidej `koren.appendChild(this._pdfMailem());`; pole třídy `private _pdfKomu = ''; private _pdfVysledek = '';`):

```ts
private _pdfMailem(): HTMLElement {
  const komu = el('input', { type: 'email', id: 'pdf-komu', 'aria-label': 'Komu poslat PDF', placeholder: 'adresa@firma.cz' }) as HTMLInputElement;
  komu.value = this._pdfKomu;
  komu.addEventListener('input', () => { this._pdfKomu = komu.value; });
  const vysledek = el('p', { id: 'pdf-vysledek', role: 'status' }, [this._pdfVysledek]);
  const box = el('div', { class: styles.tlacitka });
  const dnes = den(new Date());
  const akce: [string, string, () => Promise<{ nazev: string; bajty: Uint8Array }>][] = [
    ['pdfmail', 'Vygenerovat PDF a poslat mailem',
      async () => ({ nazev: `spokojenost-${dnes}.pdf`, bajty: await this._pdfPrehled(this._hlasy) })],
    // varianta B; bez Files.Read.All vynech
    ['graphpdfmail', 'PDF z Wordu a poslat mailem',
      async () => { await this._word(this._hlasy); return { nazev: `spokojenost-word-${dnes}.pdf`, bajty: await this._pdfZWorduBajty('exporty', 'spokojenost.docx') }; }],
  ];
  for (const [k, text, vyrob] of akce) {
    const b = el('button', { type: 'button', 'data-k': k }, [text]) as HTMLButtonElement;
    b.addEventListener('click', () => {
      const adresa = komu.value.trim();
      const ukaz = (s: string): void => { this._pdfVysledek = s; vysledek.textContent = s; };
      if (!adresa) { ukaz('Vyplňte adresu příjemce.'); return; }
      b.disabled = true; ukaz('Vyrábím PDF…');
      vyrob()
        .then((pdf) => {
          ukaz(`PDF ${pdf.bajty.length} B, odesílám…`);
          return this._posliMail(adresa, `Spokojenost – přehled ${dnes}`, 'Dobrý den, v příloze je přehled spokojenosti v PDF.',
            { nazev: pdf.nazev, bajty: pdf.bajty, typ: 'application/pdf' }).then(() => pdf);
        })
        .then((pdf) => { b.disabled = false; ukaz(`Odesláno: ${pdf.nazev} (${pdf.bajty.length} B) na ${adresa}.`); })
        .catch((e: { statusCode?: number; code?: string; message?: string }) => {
          b.disabled = false;
          ukaz(`Chyba ${e.statusCode ?? ''} ${e.code ?? ''} ${e.message ?? ''}`.replace(/\s+/g, ' '));
        });
    });
    box.appendChild(b);
  }
  return el('div', { class: styles.panel }, [el('h2', {}, ['PDF mailem']), komu, box, vysledek]);
}
```

Varianta C1 (import `AadHttpClient` z `@microsoft/sp-http`; `_wordBajty` je `_word` ze skillu `egd-dokumenty`, jen vrátí
bajty místo `_ulozDokument`). Do pole `akce` v `_pdfMailem` přidej
`['lopdfmail', 'PDF přes LibreOffice a poslat mailem', async () => ({ nazev: `spokojenost-lo-${dnes}.pdf`, bajty: (await this._pdfZLibreOffice(this._hlasy)).bajty })]`:

```ts
// Word z prohlížeče → PDF v Container App (LibreOffice). Adresa a appId API: knihovna webu, assets/prevod-api.json.
private async _pdfZLibreOffice(hlasy: IHlas[]): Promise<{ bajty: Uint8Array; ms: string }> {
  const api = JSON.parse(new TextDecoder().decode(await this._bajtyZKnihovny('assets/prevod-api.json'))) as { url: string; appId: string };
  const docx = await this._wordBajty(hlasy);
  const klient = await this.context.aadHttpClientFactory.getClient(api.appId);
  const r = await klient.post(`${api.url}/api/pdf?ext=docx`, AadHttpClient.configurations.v1,
    { headers: { 'Content-Type': 'application/octet-stream' }, body: docx as BlobPart });
  if (!r.ok) throw new Error(`Převod PDF vrátil ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return { bajty: new Uint8Array(await r.arrayBuffer()), ms: r.headers.get('x-convert-ms') || '?' };
}
```

Celý web part prošel buildem a nasazením (`sondy/ms-pdf-mail/SpokojenostWebPart.ts`). Agent ověří takto:
1. Klikne tlačítko: `node tools/maily-spo-klik.mjs <profil> "<stránka>?env=WebView" <adresát> --pole '#pdf-komu' --tlacitko 'Vygenerovat PDF a poslat mailem' --vysledek '#pdf-vysledek'`.
2. Přečte přílohu: `tools/napojeni-graph-delegated.py token <adresát>` a pak Graph `GET /me/messages/<id>/attachments`.
3. Zkontroluje PDF: `contentBytes` dekóduje z base64 a ověří, že začíná `%PDF`; pak `pdfinfo` a `pdftotext`.

## Ověření (vždy)

1. Po schválení oprávnění uživatel klikne „Poslat“ → zpráva je v jeho **Odeslaných** a dorazí adresátovi s přílohou ✅.
2. Příloha se otevře a čeština je v pořádku ✅ (CSV; PDF z `egd-dokumenty` obou variant, viz sekce výše; `.docx` ❓).
3. Chyba **403 `ErrorAccessDenied`** („Access is denied. Check credentials and try again.“) = `Mail.Send` není
   schválené, nebo prohlížeč drží starý token ✅. `AADSTS65001` ani `AADSTS65002` jsme v SPFx nedostali: token vznikne, jen bez `Mail.Send`. (`AADSTS65002` v
   `sondy/napojeni.md` je jiný klient, Azure CLI bez předautorizace — u SPFx ho nečekej.)
4. Hned po schválení může 403 trvat dál: stránka má token z doby před schválením ✅. V labu pomohlo smazat uložené
   tokeny stránky (`tools/maily-spo-klik.mjs … --novy-token`); jak dlouho to trvá uživateli samo, ❓ neověřeno.

## Kdy to nejde v E.ON

- `Mail.Send` neschválí správce: grant je na principalu „SharePoint Online Web Client Extensibility“ s
  `consentType: AllPrincipals` ✅, tedy platí pro **všechny** SPFx appky v tenantu. Kterákoli z nich pak může poslat
  mail jménem uživatele, který má její stránku otevřenou, bez dalšího dotazu na souhlas (vždy jen jménem toho, kdo
  stránku otevřel ✅ — `from` jiné osoby bez Send As vrátí 403 `ErrorSendAsDenied` ✅, `sendas.log`). Počítej s tím, že IT bude opatrné.
- Náhradní cesta bez schválení: odkaz `mailto:` (bez přílohy) ✅ vygenerovaný a zakódovaný:
  `window.location.href = 'mailto:' + komu + '?subject=' + encodeURIComponent(predmet) + '&body=' + encodeURIComponent(text);`

**Věta pro IT (ServiceNow):** „Prosím o schválení žádosti o oprávnění API pro SharePoint Framework
(SharePoint admin centrum → Advanced → API access, česky Upřesnit → Přístup k rozhraní API): Microsoft Graph, delegované `Mail.Send`, pro
aplikaci <název .sppkg> na webu <web>. Appka posílá e-mail s přílohou pouze jménem přihlášeného
uživatele po jeho kliknutí; žádná aplikační oprávnění. Pozn.: schválení platí pro všechny SPFx appky v tenantu.“

## Neověřeno

| Tvrzení | Proč | Jak a kde ověřit |
|---|---|---|
| UI Approve, když API ještě nemá žádný grant (první POST místo PATCH) | v ui-4 se jen rozšířil existující grant | žádost na API bez grantu, Approve v UI, síťový záznam |
| Approve v UI pod rolí SharePoint admin (bez Global Admina) | ui-4 měřeno pod Global Adminem | lab účet jen s rolí SharePoint Administrator klikne Approve |
| Schválení v UI u žádosti ze **site** catalogu (egd-maily nasazuje do katalogu webu) | ui-4 schvaloval žádost z tenantového katalogu (`/sites/apps/AppCatalog`, `sondy/overeni/api-access/18-add-write-2026-11-23.log`); naše žádost `Mail.Send` ze site catalogu (`11308e16-…`) zůstala čekající a grant byl doplněn přes Graph | balíček s ještě neschváleným scope nahrát do katalogu webu, deploy, v API access kliknout Approve, sledovat grant a 202 |
| Za jak dlouho se po schválení obnoví token sám | měřeno jen se smazáním úložiště | po schválení počkat 60–90 min / nové okno InPrivate |
| `mailto:` otevře Outlook na Windows a jak dlouhé tělo projde | lab je headless Chrome na macOS | na notebooku účastníka |
| Limit velikosti mailu v E.ON | výchozí limit labu (30 MB ano, 40 MB ne) | zkušební mail v tenantu E.ON / dotaz na IT |
| Send As ze sdílené schránky přímo z SPFx tlačítka | měřeno delegovaným tokenem se stejným scope mimo SPFx | panel „Poslat mailem“ s polem `from` na webu sondy |
| Příloha `.docx` / `.xlsx` z `egd-dokumenty` (spojení skillů) | ověřeno CSV a PDF (obě varianty, `sondy/ms-pdf-mail/`), Word ani Excel jako příloha neodešel | stejný panel jako „PDF mailem“, místo `_pdfPrehled` bajty z `Packer.toArrayBuffer` |
| PDF mailem bez `Files.Read.All` (varianta B) | v labu je `Files.Read.All` schválené pro celý tenant | v E.ON před schválením: klik „PDF z Wordu a poslat mailem“, opsat chybu z řádku výsledku |
| PDF mailem přes Container App s OBO `sendMail` na serveru (C2) | ca-obo měřilo jen čtení pošty (`Mail.ReadBasic`); C1 ✅ (`sondy/ms-pdf-mail/klik-lo-*.log`) | ca-obo: endpoint s převodem a OBO `sendMail` + souhlas API → Graph `Mail.Send` |
| Nová žádost v API access po nasazení balíčku s `egd-ca-dokumenty/access_as_user`, když je scope už schválený | `spo serviceprincipal permissionrequest list` vrátil 403 | SharePoint admin centrum → API access pod Global Adminem, nebo Graph nad `SharePoint Online Web Client Extensibility` |
| PDF přes více stran (přes 45 dní) | v labu jeden den hlasů | `pdf.addPage` při `y < 40`, viz `egd-dokumenty` |
| Upozornění bez kódu „When an item is created“ → Outlook | ověřen jen plánovaný tok s Outlookem | `tools/pw-profil-server.mjs`, trigger SharePoint |

## Zdroje

`sondy/ms-maily/README.md` (v repu workshopu) (SPFx end-to-end, limity, schválení),
`sondy/napojeni.md` (Sonda 2 systémová schránka, Sonda 3 delegovaný `sendMail`),
`sondy/ms-pdf-mail/README.md` (v repu workshopu) (PDF mailem jedním klikem),
`tools/maily-spo-klik.mjs` (klik „Poslat mailem“ pod lab uživatelem), `tools/napojeni-graph-delegated.py`
(čtení cílové schránky).
