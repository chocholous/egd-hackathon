# Sonda: generování a úprava dokumentů (PDF, Word, PPT, Excel)

Požadavek Tomáše Galíka (EG.D): ze SharePoint appky (SPFx) vyrobit dokument z dat seznamu, uložit do knihovny nebo stáhnout. Měřeno 22. 11. 2026 v labu (`pavelchocholousgmail`), SPFx 1.24.1, Node 22.23.5, Chrome.

Značky: ✅ změřeno v labu · 📘 dokumentace · ❓ neověřeno; 📘 a ❓ jsou jen mezistav ([../CLAUDE.md](../CLAUDE.md)), neověřené je v sekci „Neověřeno“ na konci. Logy doměřila role Ověřovatel sond 22. 11. 2026 ([overeni/README.md](overeni/README.md)): [graph-pdf log](overeni/dokumenty/graph-pdf-2026-11-22.log) (HTTP 200, 1 přesměrování, 0,9–1,6 s pro docx, xlsx, pptx; výstupní PDF v `overeni/dokumenty/pdf/`) a [Files.Read vs Files.Read.All](overeni/dokumenty/files-read-vs-readall-2026-11-22.log) (403 vs 200). Dále `dukazy/npm-audit.txt` a `dukazy/npm-view-time.txt`. Stále bez uloženého běhu (výsledek ✅ z opisu, běh ❓): SPFx web part v prohlížeči (log tlačítek), CORS/`fetch` z čistého prohlížeče a `MSGraphClientV3` volání (85 206 B), velký docx 11,5 MB (jen výstupní PDF).

## Shrnutí: požadavek → varianty → ověřeno → doporučení

Varianty A (SPFx v prohlížeči), B (Power Automate: B1 Word Online Premium, B2 OneDrive Convert / Standard) a C (server) jsou v tabulce „Porovnání cest“ níž; doporučení je až pod tabulkou.

| Požadavek | Varianta s ověřeným výsledkem | Stav |
|---|---|---|
| Word, Excel, PowerPoint, PDF z položek seznamu, uložit do knihovny / stáhnout | **A) v prohlížeči v SPFx** (docx, exceljs, pptxgenjs, pdf-lib, uložení přes SPHttpClient) | ✅ změřeno: web part v labu, všech 5 výstupů otevřeno a ověřeno přes soffice, čeština OK |
| Word podle firemní šablony (E.ON vzhled) | A) **docxtemplater** + `.docx` šablona z knihovny | ✅ změřeno (šablona uložená v knihovně, vyplnění v prohlížeči). Šablona PPTX/XLSX: ❓ |
| PDF přesně podle Wordu/Excelu/PPT | A) vyrobit Office soubor, uložit, **Graph `?format=pdf` z `MSGraphClientV3`** | ✅ Graph PDF doloženo logem ([log](overeni/dokumenty/graph-pdf-2026-11-22.log), 0,9–1,6 s); běh přímo ze SPFx web partu a z čistého prohlížeče ❓ neuložen; potřebuje schválit `Files.Read.All` (kdo smí schválit: Global Admin nebo SharePoint admin, ❓ neověřeno v labu), žádný Azure |
| PDF bez Graphu | A) **pdf-lib + font s češtinou** (nebo pdfmake) | ✅ změřeno; jsPDF s výchozím fontem češtinu **rozbije** |
| Hromadné / plánované generování, velké soubory, jiný formát než OOXML | C) server (Container App / Functions), nebo B2) Power Automate Standard (Recurrence + SharePoint → OneDrive „Convert file“) | C: nepostaveno; LibreOffice konverze lokálně ✅ (kvalita), kontejner, cena a provoz ❓. B2: flow `6492f614-…` uloženo ✅, běh ❓ čeká na přihlášení konektorů ([power-automate.md](power-automate.md)) |
| **Úprava existujícího** docx / xlsx / pptx v knihovně, šablona napsaná ručně ve Wordu (Galík 3.2) | A) v prohlížeči: JSZip + náhrada přes hranice runů, docxtemplater; Excel také přes **Graph Excel API** (PATCH range, POST rows, relace) | ✅ 24. 11., 8 variant, výstupy otevřel Office Online i LibreOffice; naivní náhrada ❌ (Word dělí zástupné texty do runů); souběh s otevřeným Excelem Online ✅ → [dokumenty/uprava/README.md](dokumenty/uprava/README.md) |
| Totéž přes Power Automate (Word šablona) | B1) Word Online (Business) „Populate“ / „Convert“ je Premium | 📘 z dokumentace; ⛔ v labu nespuštěno (trial Premium se teprve rozhoduje, viz [power-automate.md](power-automate.md)) |

**Doporučení pro vibecodery (návrh, výchozí = cesta A; stojí na ✅ řádcích výše):** cesta A. Dokument se generuje v prohlížeči uživatele jeho právy, nepotřebuje Azure ani licence navíc, a agent ji napíše za jedno sezení. Pro PDF z Wordu/Excelu přidat krok Graph `?format=pdf` (jedna schválená oprávnění pro celý tenant, schválení u E.ON je ⛔ neověřené). Premium Word konektor v Power Automate (B1, 📘) jako výchozí nedoporučovat (per-user/per-flow licence, to EG.D nechce). Server (C) až pro případy, které prohlížeč neunese.

## Co se postavilo a změřilo

### Sonda 1: knihovny v prohlížeči (kód `sondy/dokumenty/src/`)

Tentýž kód běžel v Node, v headless Chrome (`run-browser.mjs`) i uvnitř SPFx. Všechny výstupy jsem převedl `soffice --headless --convert-to pdf` a zkontroloval `pdftotext` / `pdftoppm` (diakritika `ěščřžýáíéúůďťň`, tabulky, graf v PPT).

| Cíl | Knihovna (verze, licence) | Min. velikost (gzip) | Výsledek |
|---|---|---|---|
| Word | docx 9.16 (MIT) | 231 KB (69) | ✅ nadpis, tabulka, čeština |
| Word ze šablony | docxtemplater 3.71 (MIT jádro) + pizzip (MIT nebo GPL, brát MIT) | cca 285 KB (bez docx) | ✅ cyklus `{#radky}` v tabulce, šablona stažená z knihovny |
| Excel | exceljs 4.4 (MIT) | **927 KB (265)** | ✅ hlavička, formát data a `Kč`, vzorec SUM |
| Excel (alternativa) | SheetJS `xlsx` z npm 0.18.5 (Apache-2.0) | 282 KB (93) | ✅ funguje, ale **npm verze je zastaralá, `npm audit` hlásí high** (✅ `dukazy/npm-audit.txt`, 22. 11. 2026: `xlsx` high, bez opravy; celkem 5 nálezů, 3 high, mj. i `image-size` přes pptxgenjs a `uuid`); novější jen z cdn.sheetjs.com. Styly jen v placené verzi (📘) |
| PowerPoint | pptxgenjs 4.0 (MIT) | 367 KB (125) | ✅ 3 snímky, tabulka, sloupcový graf |
| PDF | pdf-lib 1.17 + @pdf-lib/fontkit (MIT) | **1,34 MB (535)** | ✅ s vloženým TTF; se standardním fontem selže (`WinAnsi cannot encode "ř"`; přesná chybová hláška se v `src/` ani logu nedohledala, tedy jen z paměti, ❓ doložit) |
| PDF (alternativa) | pdfmake 0.3 (MIT) | 855 KB (316) | ✅ po `addVirtualFileSystem` + `addFonts` |
| PDF (past) | jsPDF 4.2 (MIT) | 804 KB (244) | ❌ výchozí font: "PYehled revizí rozvado" (znaky mimo Latin-1 se rozbijí); s `addFont` Roboto ✅ |

Rychlost: generování v Chrome 3 až 30 ms na dokument, v SPFx 0,6 až 1,3 s včetně stažení chunku a uložení do knihovny.

Fonty: Word/Excel/PPT fonty nevkládají (použije se Calibri u uživatele, žádný problém s češtinou). U PDF je nutné vložit TTF s českými znaky; Roboto (Apache-2.0, je v balíčku pdfmake) fungoval ✅. Firemní font E.ON do PDF je jen domněnka (musel by se dodat jako TTF s licencí pro vkládání ❓, viz „Neověřeno“).

### Sonda 2: SPFx web part v labu

- Web `https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-dokumenty` (Communication site, **site app catalog**), seznam `Revize` (5 položek s diakritikou), knihovna Dokumenty, složka `sonda/` (+ `sonda/assets/` se šablonou a fontem).
- Web part `DokumentyGenerator` (`sondy/dokumenty/spfx/egd-dokumenty`), 6 tlačítek: Word, Word ze šablony, Excel, PowerPoint, PDF (pdf-lib), Word → PDF přes Graph. Stránka `SitePages/dokumenty.aspx?env=WebView`.
- `.sppkg` **1,08 MB**; hlavní bundle web partu 15 KB, knihovny jsou **lazy chunky** (docx 295 KB, exceljs 941 KB, pdf-lib 1,16 MB, pptx 372 KB, šablony 274 KB; nestažené, dokud uživatel neklikne).
- Nasazení: `spo app add/deploy/install --appCatalogScope sitecollection` podle skillu spfx-ship, vše prošlo.
- Ověřeno v prohlížeči pod lab uživatelem (uložený Chrome profil `petra.novakova`, člen webu): web part načte seznam přes SPHttpClient, všech 6 tlačítek uloží soubor do knihovny (`POST .../Files/AddUsingPath(overwrite=true)`) a stáhne ho. Stažené soubory otevřeny přes soffice, čeština OK.
- Úlohy, které agent nezná: viz "Pasti".

### Sonda 3: Graph konverze do PDF

`GET /sites/{site}/drive/items/{id}/content?format=pdf` (nebo `/drive/root:/cesta:/content?format=pdf`):

| Měření | Výsledek |
|---|---|
| docx, xlsx, pptx z knihovny webu (delegovaný token) | ✅ HTTP 200 po 1 přesměrování (302 na předpodepsanou URL), 1 až 2 s; čeština správně, fonty vložené (Calibri) |
| Velikost | docx 0,7 MB, 2,9 MB i **11,5 MB** převedeno OK. Dokumentace uvádí limit 2 MB; **v labu na tenantu E5 pro docx neplatil**, obecně to netvrdíme; pro xlsx/pptx neověřeno ❓ (důkaz je jen výstupní PDF, `out-big/obri.pdf`) |
| Oprávnění | `Files.Read.All` ✅; **`Files.Read` samotné → 403** pro soubor v knihovně webu (jen vlastní OneDrive); ✅ [files-read-vs-readall](overeni/dokumenty/files-read-vs-readall-2026-11-22.log): stejná položka, `Files.Read` 403 `accessDenied`, `Files.Read.All` 200 (221 765 B), `Files.ReadWrite.All` 200 |
| Z JS v prohlížeči (`fetch` s Bearer, cizí origin) | ✅ CORS i redirect bez chyby |
| **Ze SPFx přes `MSGraphClientV3`** | ✅ `client.api('/sites/{host},{siteId},{webId}/drive/root:/sonda/revize.docx:/content?format=pdf').responseType('blob').get()` vrátil 85 206 B `application/pdf`, uloženo do knihovny |
| Bez Azure? | **Ano.** MSGraphClient jede přes principál SharePoint Online Client Extensibility, žádná app registrace ani subscription |

Co k tomu potřebuje IT E.ON: v `package-solution.json` `webApiPermissionRequests: [{resource: "Microsoft Graph", scope: "Files.Read.All"}]` a **schválení v SharePoint admin centru; změřeno ✅ jen pod Global Adminem (UI approve u jiného scope, `sondy/overeni/api-access/ui-4/`), zda stačí role SharePoint admin, je ❓ neověřeno** (📘 [use-aadhttpclient](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient) uvádí Global Admin, kdežto `skills/egd-dokumenty/SKILL.md` a `04-integrace-test-plan.md` uvádějí SharePoint admin centrum → API access); oprávnění platí podle dokumentace 📘 pro celý tenant a sdílí ho všechna SPFx řešení (v labu neověřeno). ⛔ V labu měl principál `Files.Read.All` už uděleno (grant `AllPrincipals` obsahuje Files.Read.All, Files.ReadWrite.All, Sites.Read.All), takže **samotné schválení jsem nezkoušel**; seznam čekajících žádostí CLI vrátilo 403. Proč to v labu nejde ověřit: grant byl udělen předem a CLI k seznamu žádostí nemá právo. Jak ověřit: v E.ON, nebo v labu v novém tenantu (trial) bez předchozího grantu, pod rolí SharePoint admin a pod Global Admin zvlášť. Zdroje: [Graph: convert to other formats](https://learn.microsoft.com/en-us/graph/api/driveitem-get-content-format?view=graph-rest-1.0): zdroje pro PDF: doc(x), xls(x/m), ppt(x), odt/ods/odp, rtf, html, md, msg, eml aj.

## Porovnání cest

| | A) SPFx v prohlížeči | B) Power Automate | C) server (Container App / Functions) |
|---|---|---|---|
| Funguje | ✅ změřeno (výstupní soubory) | 📘 | PDF lokálně ✅, nasazení ❓ |
| Licence navíc | žádná | **Word Online (Business) = Premium** (Power Automate i Power Apps; 📘 [konektor](https://learn.microsoft.com/en-us/connectors/wordonlinebusiness/)). Excel Online (Business) a OneDrive for Business = Standard | žádná, ale Azure subscription |
| Azure | ne | ne | ano |
| IT E.ON | jen schválení `Files.Read.All` pro Graph PDF (změřeno ✅ Global Admin; role SharePoint admin ❓) | B1: licence Premium nebo PAYG, DLP politika konektorů (📘); B2: licence Power Automate, správa připojení a vlastnictví flow | subscription, app registrace, admin consent `webApiPermissionRequests`, provoz |
| Cena | 0 | Standard v E3/E5 zdarma (📘); Premium per-user/per-flow (cena neověřena) | Container App scale-to-zero: cena **neměřena ❓** (souvislosti k Container App viz [../10-container-app.md](../10-container-app.md); naměřené ceny jsou jen v [ai.md](ai.md) a jde o jednotkové ceny, ne měsíční součet) |
| Šablony | docxtemplater (Word ✅); PPTX/XLSX šablona ❓ | 📘 Word: content controls (plain text, repeating section, image; **ne** rich text, date picker, checkbox), max 10 MB, nefunguje s MFA conditional access | python-docx / docxtpl / LibreOffice, plný výběr |
| PDF | pdf-lib/pdfmake, nebo Graph (věrné) | 📘 Word Online "Convert Word Document to PDF" (Premium, nepodporuje Confidential štítky), OneDrive "Convert file" (Standard, Preview, jen soubory v OneDrive uživatele, ne knihovna webu) | LibreOffice headless, nebo Graph |
| Excel | exceljs ✅ | 📘 Excel Online: jen tabulky, Run script max 1600/den; sám nevyrobí nový soubor ze šablony bez skriptu | openpyxl apod. |
| Spouštění | uživatel klikne, jeho práva | flow na pozadí (trigger, schedule) | cokoli, i plánovaně |
| Obtížnost pro citizen developera | nízká (jeden web part, lazy import; krok Graph PDF navíc chce admin consent, tedy čekání na IT) | B1 nízká až střední, ale licenční past; B2 střední (flow generuje agent, přihlášení konektorů dělá člověk) | vysoká (infrastruktura, auth, údržba) |

B detailně: **B1** (📘, v labu nespuštěno): Word Online (Business) má `Populate a Microsoft Word template` (výchozí vstup 10 MB, šablona musí být v knihovně Graphu) a `Convert Word Document to PDF` (limit konverze 2 min). Obě jsou **Premium**. **B2** bezlicenční cesta (Standard): SharePoint `Get file content` + OneDrive `Create file` + OneDrive `Convert file` (Preview) funguje podle dokumentace jen na souborech vlastního OneDrive; flow `6492f614-…` je v labu uloženo ✅ (tier Standard z API), **běh ❓ čeká na přihlášení konektorů** (lab má Flow Free, konektor je Standard; výstup doplní Ověřovatel sond, viz [power-automate.md](power-automate.md)). Pro/proti: B2 běží i plánovaně na pozadí (Recurrence, Standard ✅) a bez Azure; ale umí jen převod hotového dokumentu (ne šablonu), jen OneDrive, vlastnictví flow na účtu a přihlášení konektorů dělá člověk. Pro knihovnu webu je v A jednodušší Graph `?format=pdf`. Cizí konektory (Encodian, Plumsail) neprověřeny ❓.

C detailně: lokálně ověřeno, že LibreOffice (`soffice --headless --convert-to pdf`) věrně vykreslí docx, xlsx i pptx s češtinou. V kontejneru by bylo podle úvahy nutné doinstalovat fonty (Carlito/Liberation místo Calibri), **kontejner jsme nezkoušeli ❓** (ověřit `docker run` s LibreOffice a diakritikou). Graph `?format=pdf` z backendu s tokenem uživatele (OBO) jde stejně, takže C pro samotné PDF nepřidává nic, co by A neuměla.

## Pasti (co by agent bez zkoušky netrefil)

1. **pptxgenjs v SPFx neprojde buildem** (patch platí jen pro toolchain Heft / SPFx 1.24.1 z labu; u E.ON je podle `02-skills-a-kit.md` gulp, SPFx 1.18.2, Node 18, kde patch ❓ neověřen, ověřit build na toolchainu E.ON) (✅ build s patchem prošel, `.sppkg` vznikl; selhání alternativ `resolve.alias`/`externals` není zalogováno): v kódu má `import("node:fs")` / `node:https`, Heft/webpack padne na `UnhandledSchemeError`. Řešení: oficiální Webpack Patch (`config/webpack-patch.json` + `config/webpack-patch/node-builtins.js`, který přesměruje `node:fs|https` na prázdný modul). `resolve.alias`, `externals` ani import `dist/pptxgen.bundle.js` nestačí (`externals` navíc SPFx vyžaduje deklarovat v `config.json`).
2. `@microsoft/sp-http` šablona SPFx 1.24.1 do dependencies **nepřidá**; je třeba doinstalovat ve stejné verzi.
3. `ResponseType` u `MSGraphClientV3.responseType('blob')` TypeScript nepřijme jako string, v kódu je přetypování.
4. SharePoint po nahrání přepíše Office soubor (promotion vlastností): `revize.docx` 10 KB v prohlížeči → 17 KB v knihovně (pozorováno při sondě, běh ❓ neuložen). Obsah v pořádku, ale nespoléhat na bajtovou shodu.
5. Datum při `m365 spo listitem add` na webu s českým lokálem musí být `03.12.2026`, ISO formát hlásí chybu.
6. `jsPDF` a `pdf-lib` standardní fonty = rozbitá čeština; vždy vložit TTF.
7. Údržba (✅ `dukazy/npm-view-time.txt`, 22. 11. 2026): poslední vydání pdf-lib 2021-11-06, exceljs 2023-10-19, SheetJS `xlsx` z npm 2022-03-24 (prakticky opuštěné); docx 2026-11-19, pdfmake 2026-11-20, docxtemplater 2026-10-15, pptxgenjs 2025-06-26 (aktivní, pptxgenjs ale podle auditu táhne zranitelný `image-size`). SheetJS z npm je zastaralý (viz výše). Pro "dlouho žijící" appku preferovat docx + exceljs/SheetJS z oficiálního CDN + pdfmake.
8. Bundle: exceljs 0,9 MB a pdf-lib 1,3 MB (min) jsou velké; **vždy `await import()` až po kliku**, jinak se zpomalí načtení stránky (viz spfx-performance).
9. docxtemplater: jádro MIT, ale moduly (obrázky, HTML, XLSX, grafy) jsou placené (📘); pro tabulky a text stačí jádro ✅. Šablonu PPTX jádro podle dokumentace umí, my jsme to neměřili ❓ (pro „E.ON vzhled“ klíčové, ověřit v labu).

## Co jsem vytvořil (lab)

- SharePoint: web `/sites/egd-sonda-dokumenty` se site app catalogem, seznam `Revize` (5 položek), složka `sonda/` v knihovně Dokumenty (generované soubory, `assets/` s Roboto TTF a `sablona.docx`), stránka `SitePages/dokumenty.aspx`, balíček `egd-dokumenty.sppkg` nasazený a nainstalovaný ve site catalogu; `jana.svobodova` a `petra.novakova` přidány do skupiny Členové webu.
- Entra (lab): 3 app registrace s service principaly a admin consentem, veřejný klient: `egd-sonda-dokumenty-graph` (Files+Sites ReadWrite.All), `...-filesreadall` (Files.Read.All), `...-filesread` (Files.Read; pro důkaz 403). Slouží jen k ROPC testu Graphu.
- Azure: **nic** (žádný nový zdroj, 0 USD).
- Soubory: `~/Projects/egd-workshop/sondy/dokumenty/` (zdroje `src/`, `run-node.mjs`, `run-browser.mjs`, `bundle-sizes.mjs`, `graph-browser-test.mjs`, `spfx/egd-dokumenty/`, výstupy `out*/`; `spfx-gen/` je lokální generátor 1.24.1, `node_modules` ~236 MB, lze zahodit).
- Nic nebylo smazáno ani odesláno ven.

## Znovupoužitelné nástroje

- `~/Projects/egd-workshop/tools/dokumenty-graph-pdf.sh` (`--help`): nahraje soubor do knihovny labového webu a vrátí PDF přes Graph `?format=pdf` (token lab uživatele přes `data-prava-token.py` a appku `egd-sonda-dokumenty-graph`).
- `~/Projects/egd-workshop/tools/dokumenty-spo-klik.mjs` (`--help`): otevře stránku pod uloženým Chrome profilem lab uživatele (bez hesla) a odklikne tlačítka web partu, uloží stažené soubory a vypíše log.
- Token Graphu pro lab uživatele: `python3 tools/data-prava-token.py <alias> --resource https://graph.microsoft.com --client <appId>` (existující nástroj, jen s jiným `--client`).

**Závislost na licencích labu (E5 trial končí 25. 11. 2026 v 04:04, Business Premium + Copilot v 09:31):** po tomto čase se může rozbít grant `Files.Read.All` a ověřené Graph PDF cesty v labu i přihlášené profily lab uživatelů; měření, která se mají opakovat v labu (403 u `Files.Read`, Graph PDF xlsx/pptx, log web partu), je nutné stihnout před tímto termínem.

## Neověřeno (mezistav; důvod a návrh ověření)

| Tvrzení / oblast | Důvod | Návrh ověření |
|---|---|---|
| ⛔ Schválení `Files.Read.All` v tenantu, kde ho principál ještě nemá, a **kdo smí schválit** (změřen jen Global Admin ✅, role SharePoint admin ❓); chování site-collection catalogu při schvalování | lab měl grant předem, seznam žádostí → 403 | v E.ON, nebo nový trial tenant; zkusit pod oběma rolemi |
| ⛔ Pod účtem hosta z EG.D, nasazení na tenant catalog | jen tenant E.ON / host | v labu založit hosta (`tools/lab-ucty-*`) a ověřit zápis do knihovny; tenant catalog zkusit zvlášť |
| Limit 2 MB převodu pro xlsx a pptx | ověřen jen docx 11,5 MB | převést velký xlsx a pptx přes `tools/dokumenty-graph-pdf.sh` |
| Šablony PPTX/XLSX přes docxtemplater | nezkoušeno | PPTX šablona v labu |
| B1 Word Online Premium (Populate, Convert, Run script 1600/den, content controls, MFA) | ⛔ 📘 a v labu nelze spustit bez Premium | tenant s Premium/PAYG (`copilot-credits-rg`, 03-lab.md) |
| B2 OneDrive „Convert file“, běh flow `6492f614-…` | čeká na přihlášení konektorů člověkem | po přihlášení spustit flow a uložit výstup |
| C: Container App s LibreOffice (fonty, cena) | nezkoušeno | `docker run` s LibreOffice + diakritika; scale-to-zero cena z Cost Management |
| Šablony ve skutečném E.ON vzhledu a firemní font | ⛔ chybí od E.ON | dodat TTF s licencí, ověřit s Roboto jako náhradou ✅ |
| Údržba knihoven a `npm audit` | ✅ uloženo (`dukazy/npm-audit.txt`, `dukazy/npm-view-time.txt`) | opakovat těsně před workshopem |
