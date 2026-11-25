# Sonda ms-dokumenty: ověření miniskillů `egd-dokumenty` a `egd-externi-api` v labu

Session `ms-dokumenty`, 22. 11. 2026. Pravidla: [../../CLAUDE.md](../../CLAUDE.md) (Kánon).

## Co v labu je

- Web `https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-dokumenty` (Communication site, čeština 1029,
  site app catalog), seznam `Pozadavky` (3 položky s diakritikou), knihovna `Dokumenty` (URL `Sdilene dokumenty`)
  se složkami `exporty/` (generované soubory), `assets/Roboto-Regular.ttf`, `zkouska-slozky/` (test REST).
  Členové: `petra.novakova`; Návštěvníci: `jakub.kucera`. Stránka `SitePages/evidence.aspx`.
- Web `…/sites/egd-sonda-ms-dokumenty-en` (angličtina 1033, site catalog), seznam `Pozadavky` (1 položka),
  knihovna `Documents` (URL `Shared Documents`), stránka `SitePages/evidence.aspx`. Člen `petra.novakova`.
- Appka `appka/` = šablona první appky (`egd-prvni-appka`, verze šablony „evidence“ z 22. 11. odpoledne)
  + panel „Ověření miniskillů“ s tlačítky `data-k`: `docx graphpdf pdf pptx xlsx ares aressp meteo cnb`.
  Kód: `appka/src/webparts/evidence/EvidenceWebPart.ts` (úryvky ze skillů doslova). `.sppkg` 1.0.0.3 (stažení před uložením).
  Pozor: `appka.mjs build/nasadit` od 20:10 míří na novou šablonu „spokojenost“; tuhle appku stav přímo
  `npm run build` a `m365 spo app add/deploy/upgrade`.

## Důkazy

| Co | Soubor | Výsledek |
|---|---|---|
| Úryvek `_ulozDokument` na čerstvém webu bez složky | `out-1.png` | `CHYBA docx: Error: Uložení pozadavky.docx: 404` → do skillu přidáno založení složky |
| Všech 8 tlačítek (verze s `getbytitle('Dokumenty')`) | `klik-2.log`, `out-2/` | docx, Graph PDF, pdf-lib PDF, pptx, xlsx uloženy; ARES, Open-Meteo OK; ČNB `TypeError: Failed to fetch` |
| Graph PDF zvlášť | `klik-3.log`, `out-3-graph/`, `nahled-graph-1.png` | 68 048 B, čeština OK |
| pdf-lib s Robotem | `out-2/pozadavky.pdf`, `nahled-pdflib-1.png` | font vložený (CID TrueType), text OK |
| Verze s `defaultDocumentLibrary` na CZ i EN webu | `klik-4-*.log`, `out-4-*/` | CZ: vše OK; EN: vše OK, `Shared Documents/exporty` založena; pdf-lib na EN 404 (font na EN webu záměrně není) |
| EN web: `getbytitle('Dokumenty')` | příkaz `m365 request …/lists/getbytitle('Dokumenty')/rootFolder` | 404; `…/defaultDocumentLibrary/rootFolder` → `/sites/egd-sonda-ms-dokumenty-en/Shared Documents` |
| Soubory v knihovně v UI pod Petrou | `knihovna-exporty.png` | 4 soubory ve složce `exporty`, autorka Nováková Petra |
| Zvětšení Office souborů po nahrání | `m365 spo file get` (Length) | docx 9 845 → 17 083, xlsx 6 836 → 13 742, pptx 57 539 → 65 061, PDF 7 134 beze změny |
| Webpack patch je nutný | `build-bez-patche.log` | bez `webpack-patch.json`: `UnhandledSchemeError` u `node:fs` a `node:https`, rc=1; s patchem `build3.log` rc=0 |
| `Files.Read` vs `Files.Read.All` (Graph `?format=pdf`) | `graph-scope.log` (`tools/dokumenty-graph-scope.sh`) | `Files.Read` → 403 accessDenied; `Files.Read.All` → 200, 68 048 B |
| Žádost o API po nasazení appky s už schváleným scope | `api-access.txt` | v API access žádná nová čekající žádost; cesta v menu Advanced → API access; CLI `permissionrequest list` → 403 |
| CORS v prohlížeči, ARES přes `spHttpClient` | `konzole-cz.log`, `konzole-cz.png` (`tools/spo-webpart-konzole.mjs`) | ČNB: „blocked by CORS policy: No 'Access-Control-Allow-Origin' header…“, `net::ERR_FAILED`; ARES přes `spHttpClient` 200 |
| CORS přes `curl` (macOS) | `curl-cors.log` | ARES `*` (i preflight s `authorization`), Open-Meteo `*`, `api.cnb.cz` bez hlavičky, `denni_kurz.txt` `apl.cnb.cz` |
| Power Automate HTTP | `tools/pa-flow.py tiers/start` | `tiers`: jen `type: Http` (bez tieru); `start` flow „Recurrence + HTTP ČNB“ → 409 `CannotStartUnpublishedSolutionFlow`; flow „Recurrence + Compose“ → 200 (hned zase zastaveno) |
| Word Online (Business) tier | `tools/pa-connection.py apis --filter "Word Online"` | `shared_wordonlinebusiness Premium` |
| Uživatel jen se čtením (`jakub.kucera`, Návštěvníci) | `ctenar.log`, `ctenar.png` | `Uložení pozadavky.docx: 403`, nic se nestáhlo |
| Test CORS v konzoli prohlížeče na stránce webu (bez instalace) | `konzole-fetch-test.log` (`tools/spo-webpart-konzole.mjs --eval`) | ARES `fetch(...).then(r => r.status)` → 200; ČNB → `TypeError: Failed to fetch` + „blocked by CORS policy“ |
| Stažení před uložením (verze 1.0.0.3) | `ctenar-2.log`, `out-5-ctenar/`, `klik-5.log` | Čtenář: soubor stažen, uložení 403; Petra: všech 5 formátů dál OK |
| GitHub Copilot CLI | `copilot/` | oba skilly ✅, viz `skills/egd-*/TEST-copilot.md` |
| Invoke-WebRequest (PowerShell 7.5, macOS) | `pwsh-cors.log` | ARES `Access-Control-Allow-Origin=[*]`, ČNB prázdné |
| Práva hned po přidání do Členů (EN web, `karolina.mala`) | `prava-zpozdeni.log` | před přidáním stránka neotevřena (timeout); hned po přidání uložení OK; dřívější 403 se nezopakovalo |
| Font a PDF | `font-upload.log`, `pdffonts.log` | font 157 216 B v `assets/`; Roboto vložený, text s diakritikou |
| Tier konektorů PA | `pa-tier-word.log` | Word Online (Business) Premium, OneDrive for Business Standard |
| Copilot sandboxy (kopie z dočasné složky) | `copilot/dokumenty-sandbox/`, `copilot/externi-api-sandbox/` | příkaz, usage, soubory vytvořené Copilotem |

## 23. 11. 2026: úryvky na šabloně Spokojenost

Appka `appka-spokojenost/` (založená `appka.mjs novy` z `egd-prvni-appka`, úryvky `egd-dokumenty` + `_firma` z `egd-externi-api`),
seznam `Spokojenost`, stránka `SitePages/spokojenost.aspx`, appId v katalogu webu `501592b3-ba4b-456b-8ab9-c3daa7ab4c2f`.

| Co | Soubor | Výsledek |
|---|---|---|
| Instalace knihoven | `npm-spokojenost.log` | `npm ci` rc=0, `npm install docx@9.16.0 exceljs@4.4.0 pptxgenjs@4.0.1 pdf-lib@1.17.1 @pdf-lib/fontkit@1.1.1 --save-exact` rc=0 |
| První build | `build-spokojenost-ts2802.txt` | TS2802 (spread nad `Map.entries()` v ES5) → `_souhrn` přepsán na `Object.keys` |
| Build 1.0.0.0 | `build-spokojenost.log` | rc=0, `.sppkg` 990 797 B, chunky lib-docx/exceljs/pptx/pdf, hlavní 26 406 B |
| Seznam + nasazení | `nasazeni-spokojenost.log` | `appka.mjs seznam` a `nasadit --ano` rc=0, čteno zpět |
| Hlas 4 + šest tlačítek pod `petra.novakova` | `spokojenost-klik.log`, `spokojenost-klik.png` | docx, graphpdf, pdf, xlsx, pptx, ares → `HOTOVO` |
| Obsah souborů | `spokojenost-obsah.txt`, `out-spokojenost/` | docx, pptx a PDF: souhrn Den / Hlasů / Průměr s jedním dnem; xlsx: surové hlasy (Den, Hodnocení), jeden řádek na hlas; čeština OK; `spokojenost.pdf` byl z pdf-lib (přepsal Graph PDF téhož názvu) |
| Graph PDF zvlášť | `spokojenost-klik-graphpdf.log`, `spokojenost-graphpdf-cteni.log` | `spokojenost.pdf` 61 933 B, PDF 1.7, bez Producer pdf-lib |
| Oprava kolize názvů (pdf-lib → `spokojenost-prehled.pdf`), verze 1.0.0.1 | `build-spokojenost-2.log`, `nasazeni-spokojenost-2.log` | build rc=0; první nasazení neproběhlo (lab CLI odhlášené); po přihlášení Pavla nasazeno přes `tools/lab-m365.sh` (`nasazeni-spokojenost-3.log`, katalog 1.0.0.1) |
| Klik po upgradu | `spokojenost-klik-3.log`, `spokojenost-klik-4.log` | 1. načtení hned po upgradu: starý bundle, pdf-lib do `spokojenost.pdf`; o 40 s později bundle `7bc9f996…`: `spokojenost.pdf` 61 933 B (Graph) + `spokojenost-prehled.pdf` 8 099 B (pdf-lib) |
| Klíč stránkování SP REST | `strankovani.log` | `odata=nometadata` bez `OData-Version` → `odata.nextLink`; s `OData-Version: 4.0` → `@odata.nextLink` |
