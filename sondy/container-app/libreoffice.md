# Container App „Dokumenty“: LibreOffice headless → PDF

Sonda `ca-libreoffice` (24. 11. 2026, session ca-libreoffice). Nadřazené: [10-container-app.md](../../10-container-app.md)
(řádek „Těžší dokumenty“ a „Dokumenty: varianty“), předchozí sonda [sondy/dokumenty.md](../dokumenty.md).
Kód a surové důkazy: [libreoffice/](libreoffice/). Značky: ✅ změřeno · 📘 dokumentace · ❓ neověřeno.

## Shrnutí

| Co | Výsledek |
|---|---|
| Převod docx / xlsx / pptx → PDF v Container App | ✅ 5 vzorků s češtinou, `pdftotext` vrací diakritiku beze ztrát, žádné `?` ([azure-1.jsonl](libreoffice/dukazy/azure-1.jsonl), [azure-0.2.jsonl](libreoffice/dukazy/azure-0.2.jsonl)) |
| Volání ze SPFx přes `AadHttpClient` | ✅ web part na `/sites/egd-ca-dokumenty/SitePages/pdf.aspx`, odklikáno pod profilem `tomas.prochazka`: `/api/me` 200, převod pptx 200, stažené PDF s diakritikou ([spfx-klik.log](libreoffice/dukazy/spfx-klik.log), [screenshot](libreoffice/dukazy/spfx-klik/webpart.png)) |
| Ochrana tokenem Entra | ✅ bez tokenu 401, nesmyslný token 401, token jiného API (Graph) 401, CORS jen pro `https://pavelchocholousgmail.sharepoint.com` ([auth.log](libreoffice/dukazy/auth.log)) |
| Doba převodu (teplá replika) | ✅ 1,06–1,27 s na serveru, 1,27–1,61 s celkem z Macu (malé soubory); 11,5 MB docx 1,5 s serveru / 3,4 s celkem |
| Studený start (0 replik → první odpověď) | ✅ 28,3 s curl (z toho převod 1,1 s) ([studeny-start-1.jsonl](libreoffice/dukazy/studeny-start-1.jsonl)); 25,6 s v prohlížeči ze SPFx, bez timeoutu ([spfx-klik-studeny.log](libreoffice/dukazy/spfx-klik-studeny.log)) |
| Souběh | ✅ 4 souběžné převody na 1 replice: každý ~6 s, celkem 7 s (LibreOffice se dělí o 1 vCPU) |
| Kvalita proti Graph `?format=pdf` | ✅ porovnáno vizuálně: pptx prakticky shodné, docx a xlsx se liší v detailech (viz „Kvalita“) |
| Velikost image | ✅ 654 MB rozbaleno, 254 MB v ACR (komprimované vrstvy) |
| Cena | ✅ ceník z Azure Retail Prices API; reálné vyúčtování ❓ (Cost Management má zpoždění) |

## Architektura

```
SPFx web part ──AadHttpClient (token uživatele, scope access_as_user)──▶ ca-egd-dokumenty (Container App, min 0 replik)
   soubor z <input type=file>, tělo = binárka                              │ jose: podpis, issuer, aud = appId API, scp
                                                                           │ soffice --headless --convert-to pdf
   ◀──────────────────────── application/pdf ──────────────────────────────┘ (vlastní profil LO pro každý požadavek)
```

Zdroje v labu:

| Zdroj | Detail |
|---|---|
| Entra appka API | `egd-ca-dokumenty`, appId `54c0b31d-b482-4d3f-900c-3e6c0e5fe870`, `api://54c0b31d-…`, scope `access_as_user`, app role `Dokumenty.App` (od 0.3, pro Job), v2 tokeny, `isFallbackPublicClient` (jen kvůli ROPC testu z CLI) |
| Souhlas pro SPFx | grant `access_as_user` pro „SharePoint Online Web Client Extensibility“ přes `tools/ai-spfx-api-grant.sh` ([spfx-grant.log](libreoffice/dukazy/spfx-grant.log)) |
| RG | `rg-egd-ca-dokumenty` (tag `ucel=egd-workshop`, Sweden Central) |
| Container App | `ca-egd-dokumenty` ve **sdíleném** env `ca-ppf-rooms-env` (jediné v subscription), Consumption, 1 vCPU / 2 GiB, min 0 / max 2 repliky, HTTP škálování 4 souběžné požadavky ([containerapp-show.json](libreoffice/dukazy/containerapp-show.json)); URL `https://ca-egd-dokumenty.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io` |
| Pull identity | user-assigned `id-ca-egd-dokumenty-pull` s `AcrPull` na cizím ACR `acrppfroomsca3lbgs` (Basic, RG `rg-ppf-rooms-lab`), image `ca-egd-dokumenty:0.1` a `:0.2` |
| SharePoint | web `/sites/egd-ca-dokumenty` (komunikační, tomas v Členech), app `egd-ca-dokumenty.sppkg` v tenant katalogu, stránka `pdf.aspx` |

## Postup (ověřený v labu)

Vše je ve skriptu [tools/ca-dokumenty-deploy.sh](../../tools/ca-dokumenty-deploy.sh) (`--help`), kroky idempotentní
(✅ `entra` spuštěno dvakrát, `deploy` jako create i třikrát jako update):

```bash
tools/ca-dokumenty-deploy.sh entra                 # Entra appka API + consent pro ROPC test
tools/ai-spfx-api-grant.sh <appId> access_as_user  # souhlas pro SPFx (místo „API access → Approve“)
tools/ca-dokumenty-deploy.sh push --tag 0.2        # docker buildx linux/amd64 + push (ACR Tasks jsou zakázané)
tools/ca-dokumenty-deploy.sh deploy --tag 0.2      # RG, identita s AcrPull, Container App
```

Měřené doby: build image na Macu (arm64, emulace amd64 přes OrbStack) 2:34 ([build-0.1.log](libreoffice/dukazy/build-0.1.log)),
push 34 s (0.1), 9 s (0.2, jen změněná vrstva), deploy create 1:58 (včetně 60 s čekání na propagaci AcrPull), update 38 s.

SPFx web part: [libreoffice/spfx/](libreoffice/spfx/) (Heft, SPFx 1.23.2, bez Reactu), build `npm ci && npm run build`,
nasazení `tools/ai-spfx-deploy.sh <sppkg> <web> 874880f3-cc01-4935-a0ad-393df1499f29 pdf.aspx '{"apiUrl":"…","apiAppId":"…"}'`
([spfx-deploy.log](libreoffice/dukazy/spfx-deploy.log)). Klik v prohlížeči: [libreoffice/spfx-klik.mjs](libreoffice/spfx-klik.mjs).
Test převodů z CLI: [libreoffice/test-pdf.sh](libreoffice/test-pdf.sh) (token přes `tools/data-prava-token.py --client <appId> --resource api://<appId>`).

### Dockerfile

[libreoffice/app/Dockerfile](libreoffice/app/Dockerfile): `node:22-bookworm-slim` + `libreoffice-{writer,calc,impress}-nogui`
+ `fonts-crosextra-carlito` (metricky = Calibri), `fonts-crosextra-caladea` (= Cambria), `fonts-liberation2`
(= Arial/Times New Roman/Courier New), `fonts-dejavu-core`. Běží jako uživatel `node`, `HOME=/tmp`.
V image: LibreOffice 7.4.7.2, `fc-match Calibri` → Carlito, `Cambria` → Caladea, `Arial` → Liberation Sans ✅ ([image-fonty.txt](libreoffice/dukazy/image-fonty.txt)).

### Endpoint

[libreoffice/app/server.mjs](libreoffice/app/server.mjs) (Node 22, jediná závislost `jose`):

| Metoda a cesta | Co dělá |
|---|---|
| `GET /healthz` | bez tokenu, `{ok, uptimeMs}` |
| `GET /api/me` | kdo volá (`upn`, `oid`, `scp`) |
| `POST /api/pdf?ext=docx` | tělo = soubor (raw binárka; přípona v `?ext=` nebo hlavičce `X-Filename`), odpověď `application/pdf`, hlavičky `x-convert-ms`, `x-convert-count` |

Chyby (✅ všechny vyzkoušené, [okrajove-0.2.log](libreoffice/dukazy/okrajove-0.2.log)): 401 bez/špatný token, 403 token bez scope,
400 neznámá přípona, 400 docx/xlsx/pptx, který není ZIP, 413 nad limit (i při `Transfer-Encoding: chunked`), 500 při chybě nebo
timeoutu `soffice`. Konfigurace jen z proměnných prostředí:

| Proměnná | Hodnota v labu | Poznámka |
|---|---|---|
| `TENANT_ID`, `API_CLIENT_ID` | lab tenant, appId API | povinné |
| `REQUIRED_SCOPE` | `access_as_user` | delegovaný token (SPFx) |
| `REQUIRED_ROLE` | `Dokumenty.App` | od 0.3: aplikační token (managed identity Jobu); ✅ volá ho [job-retez.md](job-retez.md) |
| `MAX_BYTES` | 26214400 (25 MB) | volba sondy; ingress propustil i 45 MB ✅, víc nezkoušeno |
| `CONVERT_TIMEOUT_MS` | 120000 | volba sondy; nejdelší reálný převod 1,5 s |
| `CORS_ORIGINS` | `https://pavelchocholousgmail.sharepoint.com` | jinak prohlížeč odpověď nepustí |

Dvě vady první verze 0.1, opravené v 0.2 a znovu změřené ✅: (1) nad limit server přerušil spojení a klient dostal od ingressu
**503** místo 413 → teď tělo dočte a vrátí 413; (2) 3,4 MB náhodných bajtů s příponou docx držely `soffice` **120 s** do timeoutu
(blokuje repliku) → teď kontrola ZIP hlavičky, odpověď 400 za 0,8 s.

### Jak volat ze SPFx

1. `package-solution.json`: `"webApiPermissionRequests": [{ "resource": "egd-ca-dokumenty", "scope": "access_as_user" }]`
   a souhlas správce (v labu přes `tools/ai-spfx-api-grant.sh`; v E.ON ho dělá admin v „API access“).
2. Kód ([PdfPrevodWebPart.ts](libreoffice/spfx/src/webparts/pdfPrevod/PdfPrevodWebPart.ts)):

```ts
const client = await this.context.aadHttpClientFactory.getClient(apiAppId);
const r = await client.post(`${apiUrl}/api/pdf?ext=${ext}`, AadHttpClient.configurations.v1,
  { headers: { 'Content-Type': 'application/octet-stream' }, body: await file.arrayBuffer() });
const pdf = await r.blob();   // → URL.createObjectURL(pdf) pro odkaz ke stažení, nebo upload do knihovny přes SPHttpClient
```

## Výkon

| Měření | Výsledek | Důkaz |
|---|---|---|
| teplý převod malých souborů (7–125 kB) | server 1,06–1,27 s, celkem z Macu 1,27–1,61 s | [azure-1.jsonl](libreoffice/dukazy/azure-1.jsonl), [azure-0.2.jsonl](libreoffice/dukazy/azure-0.2.jsonl) |
| obrázkové docx 0,7 / 2,9 / 11,5 MB | server 1,09 / 1,26 / 1,55 s, celkem 1,7 / 2,4 / 3,4 s | [azure-velke.jsonl](libreoffice/dukazy/azure-velke.jsonl) |
| 4 souběžné převody, 1 replika | každý 5,8–6,0 s na serveru, celkem 7 s | [azure-soubezne/](libreoffice/dukazy/azure-soubezne/) |
| studený start (0 replik, první požadavek = převod, curl) | 28,3 s, převod v něm 1,1 s | [studeny-start-1.jsonl](libreoffice/dukazy/studeny-start-1.jsonl) |
| studený start z prohlížeče (SPFx, 0 replik, profil tomas) | první volání `/api/me` 25,6 s (AadHttpClient nevypršel, 200), následný převod xlsx 1,36 s (server 1,24 s) | [spfx-klik-studeny.log](libreoffice/dukazy/spfx-klik-studeny.log) |
| SPFx teplé: `/api/me` / převod pptx | 956 ms / 1510 ms (server 1249 ms) | [spfx-klik.log](libreoffice/dukazy/spfx-klik.log) |
| na Macu v emulaci amd64 (pro srovnání) | 3,7–6,0 s na převod | [lokalne.jsonl](libreoffice/dukazy/lokalne.jsonl) |
| škálování na 0 | po ~300 s nečinnosti (cooldown 300 s v konfiguraci), změřeno 3× (poslední požadavek 00:49:14 → 0 replik 00:55:03; 01:04:52 → 01:10:56) | `az containerapp replica list` |

První převod v čerstvém procesu nebyl pomalejší než další (1137 ms), drahý je jen start repliky (stažení 254 MB image
a start kontejneru). Zkrácení: min 1 replika (trvalý náklad, viz cena) nebo menší image (❓ nezkoušeno).

## Kvalita proti Graph `?format=pdf`

Graph převod: `tools/dokumenty-graph-pdf.sh` (upload do `/sites/egd-sonda-dokumenty`, 1,0–1,4 s) ([graph.log](libreoffice/dukazy/graph/graph.log)).
Obrázky vedle sebe (vlevo LibreOffice, vpravo Graph): [porovnani/](libreoffice/dukazy/porovnani/).

| Soubor | Stránky LO / Graph | Fonty LO / Graph | Rozdíl |
|---|---|---|---|
| docx (`docx` knihovna) | 1 / 1 | Carlito / Calibri | tabulka bez pevných šířek sloupců: LO dá sloupce stejně široké (víc zalomených řádků), Word je přizpůsobí obsahu; text a diakritika shodné |
| xlsx (exceljs) | 2 / 2 | Carlito + **Caladea-Bold** / Calibri | tučné buňky mají ve `styles.xml` font bez jména (`<font><b/></font>`); LO dosadí Caladea (patkové), Excel Calibri. U souboru uloženého Excelem ❓ (jméno fontu tam bývá) |
| pptx (pptxgenjs) | 3 / 3 | Carlito, Liberation Sans / Calibri, Arial | prakticky shodné |

Závěr: na běžné dokumenty LibreOffice s fonty Carlito/Liberation stačí, Graph je věrnější u Word tabulek a stylů bez jména fontu.
Vzorky jsou vygenerované JS knihovnami; **dokument uložený přímo ve Wordu/Excelu** (vlastní šablona E.ON, fonty firmy) ❓ nezkoušen.

## Cena

Ceník Azure Retail Prices API, Sweden Central, Consumption ([cenik-container-apps-swedencentral.json](libreoffice/dukazy/cenik-container-apps-swedencentral.json), [cenik-acr-swedencentral.json](libreoffice/dukazy/cenik-acr-swedencentral.json)):

| Položka | Sazba | Pro 1 vCPU / 2 GiB |
|---|---|---|
| vCPU aktivní / nečinný | 0,000024 / 0,000003 USD/s | |
| paměť aktivní / nečinná | 0,000003 / 0,000003 USD/GiB·s | |
| replika aktivní | | 0,000030 USD/s = 0,108 USD/h |
| replika nečinná | | 0,000009 USD/s = 0,032 USD/h |
| požadavky | 0,40 USD / 1 mil. | |
| ACR Basic | 0,1666 USD/den ≈ 5 USD/měsíc | v labu sdílený cizí ACR, nic navíc |

Odhad (výpočet ze sazeb, ne z faktury): jedno „probuzení“ = start + převody + 300 s cooldown ≤ 330 s × 0,000030 ≈ **0,01 USD**
(horní mez, kdyby cooldown běžel jako aktivní). 100 probuzení za měsíc ≈ 1 USD. Min 1 replika trvale (bez studeného startu)
≈ 0,032 USD/h × 730 h ≈ **23 USD/měsíc** nečinně. Měsíční bezplatná kvóta Consumption 📘 (z ceníku API ji nevidím) a skutečně
vyúčtovaná částka ❓ (Cost Management, data se zpožděním). Sonda celkem: desítky minut aktivní repliky, odhad pod 0,2 USD.

## Co chce IT E.ON

- Azure subscription s Container Apps (env stačí sdílené s ostatními API), ACR (Basic) nebo povolení pullu z firemního registru.
- Build image: buď ACR Tasks (v labu zakázané), nebo lokální Docker / pipeline (GitHub Actions, Azure DevOps). Citizen developer
  na Windows bez admina Docker nespustí ❓ (nezkoušeno), takže build reálně dělá „správce platformy“ nebo pipeline.
- Registraci Entra appky API (scope `access_as_user`) a **admin consent** pro SPFx (`webApiPermissionRequests`, API access).
- Odchozí síť z kontejneru není potřeba (jen stažení klíčů Entra `login.microsoftonline.com`).
- Pokud dokumenty obsahují citlivá data: zápis do logu je jen metadata (`upn`, přípona, velikosti, čas), soubory se mažou po převodu
  z dočasné složky repliky. Štítky citlivosti / šifrované dokumenty (MIP) LibreOffice neotevře ❓ (nezkoušeno).
- Firemní fonty (E.ON) do image, pokud je licence dovolí ❓.

## Varianty (všechny funkční, pro a proti)

| Varianta | Stav v labu | Pro | Proti | IT E.ON | Náročnost pro citizen developera |
|---|---|---|---|---|---|
| A) PDF v prohlížeči (JS knihovny) | ✅ ([dokumenty.md](../dokumenty.md)) | bez Azure | jen nově generované dokumenty, nepřevede existující docx | nic | nízká |
| A2) Graph `?format=pdf` z SPFx | ✅ ([dokumenty.md](../dokumenty.md)) + zde ✅ porovnání | nejvěrnější (render Office), 1–1,4 s, bez Azure | soubor musí být v SharePointu/OneDrivu, `Files.Read.All` consent | consent | nízká |
| B2) Power Automate „Convert file“ | flow uloženo, běh ❓ ([power-automate.md](../power-automate.md)) | Standard licence | jen OneDrive uživatele | licence | střední |
| **C) Container App s LibreOffice (tato sonda)** | ✅ celý řetězec SPFx → CA → PDF | převede i soubor, který není v M365 (upload z disku, hromadně, z jobu), formáty mimo OOXML (odt, rtf, doc), plná kontrola, žádný Graph consent | studený start ~28 s, image 254 MB, LibreOffice ≠ Office (šířky tabulek, fonty bez jména), Docker build, Azure + Entra | subscription, ACR, Entra app, consent | vysoká |
| C2) C s min 1 replikou | ❓ nezkoušeno (jen změna `--min-replicas 1`) | bez studeného startu | ≈ 23 USD/měsíc trvale | totéž + rozpočet | vysoká |
| C3) Gotenberg (hotový image s LibreOffice + API) | ❓ nezkoušeno | 📘 hotové API, Chromium pro HTML→PDF | ověřování tokenu je potřeba doplnit (proxy / Easy Auth) | totéž | vysoká |

Doporučení: pro převod dokumentu, který už leží v SharePointu, je jednodušší a věrnější **A2 (Graph)**. **C** má smysl, když
soubor v M365 není nebo nemá být (převod z uploadu bez uložení), pro hromadné a plánované převody (Container Apps Job), pro jiné
formáty než OOXML a jako základ pro šablony na serveru (python-docx, docxtpl). Pokud C, pak sdílená jedna instance pro všechny appky
(jedno API, jeden consent), ne image pro každou appku.

## Neověřeno

| Tvrzení | Důvod | Návrh ověření |
|---|---|---|
| Dokument uložený Wordem/Excelem/PowerPointem (ne JS knihovnou), šablona E.ON | v labu nemáme Office desktop ani firemní šablony | nahrát 3 reálné dokumenty od Tomáše do `test-pdf.sh` + Graph, porovnat obrázky |
| Skutečně vyúčtovaná cena | Cost Management má zpoždění (h) | `az costmanagement query` nad `rg-egd-ca-dokumenty` 25. 11. |
| Bezplatná měsíční kvóta Container Apps | jen 📘, ceník API ji neukazuje | Cost Management po měsíci provozu |
| Šifrované dokumenty / štítky citlivosti | v labu nejsou nastavené štítky | ⛔ jen v E.ON: převést dokument se štítkem „Confidential“ |
| Menší image (Alpine, bez impress/calc) a dopad na studený start | nezkoušeno | varianta Dockerfile + `studeny-start` měření |
| Novější LibreOffice (bookworm má 7.4.7) | nezkoušeno | `debian:trixie` nebo backports, porovnat docx tabulku |
| 503 v 01:00:15 po nasazení 0.2 (ještě než se nová revize plně ujala) | jednorázové, příčina neprokázána (revize 0.1 měla 0 % provozu) | po dalším nasazení opakovat test 413 hned po `deploy` |
| Build image na Windows bez admin práv | Docker Desktop potřebuje admina 📘 | ⛔ v E.ON; alternativa pipeline |
| Gotenberg (C3) | nezkoušeno | `gotenberg/gotenberg:8` za Easy Auth, stejný `test-pdf.sh` |
