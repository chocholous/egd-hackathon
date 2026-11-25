# TEST: egd-dokumenty v GitHub Copilot CLI

22. 11. 2026, GitHub Copilot CLI 1.0.114, macOS, izolovaný „počítač účastníka“ (`tools/copilot-run.sh`,
skilly `egd-dokumenty` a `egd-externi-api` nainstalované do `~/.copilot/skills`). Model vybral Copilot sám
(„Copilot Fusion“ → GPT-6 Luna). Záznamy (zkopírované z dočasného sandboxu do repa): `sondy/ms-dokumenty/copilot/dokumenty-log.txt`, `dokumenty-prepis.md`, `dokumenty-sandbox/` (příkaz, usage, vytvořené soubory).

## Scénář

Kopie appky `sondy/ms-dokumenty/appka` (s `pptxgenjs` v kódu) **bez** webpack patche. Prompt:
„Ve složce appka mám SPFx web part, přidal jsem pptxgenjs kvůli exportu do PowerPointu a teď mi
'npm run build' padá na UnhandledSchemeError node:fs. Oprav to tak, aby build prošel, a build spusť. Nic nenasazuj.“

## Výsledek

| Krok | Stav | Důkaz |
|---|---|---|
| Copilot skill vidí (`copilot skill list`) | ✅ | `dokumenty-run.log` |
| Sám vybral skill `egd-dokumenty` | ✅ | `● skill(egd-dokumenty)` v logu |
| Vytvořil `config/webpack-patch.json`, `webpack-patch/empty.js`, `webpack-patch/node-builtins.js` podle skillu | ✅ | kopie v `sondy/ms-dokumenty/copilot/dokumenty-sandbox/webpack-patch*`; logika shodná se skillem (jen jiné zalomení řádků) |
| `npm run build` prošel, `.sppkg` vznikl (991 044 B, 20:59), chunk `lib-pptx` je v `release/assets` | ✅ | `sondy/ms-dokumenty/copilot/dokumenty-sandbox/sppkg-ls.txt` |
| Nic nenasadil | ✅ | jen lokální build |
| Cena / čas | 0,51 AI Credits, 1 min 43 s | konec logu |

## Rozdíly Copilot vs. Claude

- Claude (tato session) prošel celý skill v labu end-to-end (všech 5 formátů, Graph PDF, čeština,
  Čtenář, anglický web). Copilot v scénáři 1 jen opravil build; generování dokumentů klikem v appce, kterou
  napsal Copilot, je ověřené ve scénáři 2 níže ✅.
- Copilot jedno hledání v souborech nechal vypršet (`Timed out 20s`), pak pokračoval čtením souborů. Výsledek to neovlivnilo.
- Copilot na macOS běžel s `--allow-all-tools` (bez dotazů); na Windows u účastníka se bude ptát na každý příkaz ❓.

## Scénář 2: export ve Spokojenosti od nuly, nasazení a klik (23. 11. 2026)

Copilot CLI 1.0.114, „Copilot Fusion“ → GPT-6 Luna. Izolovaný „počítač účastníka“ (`tools/copilot-run.sh`),
skilly `egd-dokumenty` a `egd-prvni-appka`, bez přihlášení m365 (nasazovala tato session).
Ve sandboxu čistá appka ze šablony (`appka.mjs novy --slozka spokojenost --bez-instalace`, bez `node_modules`).
Prompt (`sondy/ms-dokumenty/copilot/dokumenty2-sandbox/prompt.txt`): „Ve složce spokojenost mám svou první SharePoint
appku … Chci pod dashboard tlačítka, která z hlasů vyrobí dokument Word, Excel a PDF, uloží ho do knihovny dokumentů
webu a zároveň ho stáhnou. Doinstaluj, co je potřeba, zvyš verzi balíčku a postav .sppkg … Na SharePoint nic nenasazuj.“

| Krok | Stav | Důkaz (`sondy/ms-dokumenty/copilot/`) |
|---|---|---|
| Sám vybral skill `egd-dokumenty` | ✅ | `dokumenty2-log.txt` ř. 4 |
| `npm install --save-exact docx@9.16.0 exceljs@4.4.0` (přesné verze ze skillu) | ✅ | `dokumenty2-sandbox/package.json` |
| Tlačítka Word / Excel / PDF; `_ulozDokument` (stažení, `defaultDocumentLibrary`, založení složky při 404), PDF přes Graph `?format=pdf`, `webApiPermissionRequests` `Files.Read.All`; verze 1.0.0.1 | ✅ | `dokumenty2-sandbox/SpokojenostWebPart.ts`, `package-solution.json` |
| Navíc sám načítá všechny hlasy přes `@odata.nextLink ‖ odata.nextLink` | ✅ | `SpokojenostWebPart.ts` ř. 209–213 |
| `npm run build` prošel (3 buildy, jeden mezi tím opravil), `.sppkg` 356 898 B, chunky `lib-docx`, `lib-exceljs` | ✅ | `dokumenty2-sandbox/sppkg-ls.txt` |
| Nic nenasadil | ✅ | log, `Changes +198 -17` jen v sandboxu |
| Nasazení (tato session, `tools/lab-m365.sh`): web `…/sites/egd-sonda-ms-dokumenty-en`, seznam `Spokojenost`, site catalog, stránka `SitePages/spokojenost-copilot.aspx` | ✅ | `dokumenty2-nasazeni.log`, `dokumenty2-sandbox/nasad-copilot.sh` |
| Klik pod `petra.novakova`: hlas 3, pak Word, Excel, PDF → všude „Hotovo: … stažen a uložen“ | ✅ | `dokumenty2-klik.log`, `dokumenty2-klik.png` |
| Soubory v `Shared Documents/exporty`, autorka Nováková Petra: docx 16 970 B (tabulka Den / Hlasů / Průměr, čeština OK), xlsx 13 420 B (Den, Hodnocení), PDF 61 485 B (PDF 1.7, Creator Microsoft Word) | ✅ | `dokumenty2-out/` |
| Cena / čas | 1,51 AI Credits, 2 min 40 s | konec logu, `dokumenty2-sandbox/usage.json` |

Rozdíly proti Claude: Copilot vynechal PowerPoint i pdf-lib (prompt je nechtěl) a zvolil PDF přes Graph (varianta 3
žebříku). Bez schváleného `Files.Read.All` by tlačítko PDF skončilo chybou; v labu je schválené. Tlačítka nemají `data-k`
a výsledek píšou do `#export-status`, proto se klikalo podle textu (`tools/spo-webpart-konzole.mjs --eval`).

## Dodatek: sekce „Úprava existujícího dokumentu v knihovně“ (24. 11. 2026)

Copilot CLI (výchozí model), skilly `egd-dokumenty` a `egd-prvni-appka` bez `TEST*.md`, projekt `prvni-appka` (APFS klon `node_modules`), CLI 11 přes `--cli`. Vstupy v knihovně webu `egd-sonda-ms-dokumenty` (`uprava/vstup`, napsala je Petra v Office pro web). Zadání: panel se 4 tlačítky (šablona `{{jmeno}}…` ve Wordu, přepis textu ve smlouvě, buňky B2:C3 v xlsx s přepočtem, přepis textu v pptx), originály nepřepisovat, výsledek do `uprava/copilot`, nasadit na stránku `uprava-copilot`. Důkazy: [audit/test-copilot/beh-dokumenty](../../audit/test-copilot/beh-dokumenty/) (`klik-uprava.mjs`, `klik.log`, `vystup/*`, `uprava.png`).

| Tlačítko | Varianta, kterou Copilot zvolil | Výsledek po kliku (Petra) |
|---|---|---|
| Vyplnit šablonu | docxtemplater 3.71.1 + pizzip 3.3.0 (ze skillu) | ✅ 4 náhrady, ve výstupu 0 zbylých `{{ }}` (jméno, Distribuce Brno, 24. 11. 2026, hodnocení) |
| Smlouva | JSZip + náhrada po odstavcích přes hranice runů | ✅ 2 × „Elektro Vysočina“, „Stavby Morava“ nezbylo |
| Rozpočet | přímá úprava XML (JSZip), inlineStr, `fullCalcOnLoad="1"` | ✅ B2 125000, B3 355000; LibreOffice spočítá Celkem 540000 |
| Prezentace | JSZip + DOM, `a:p`/`a:t` | ✅ „Rozvodna Jih“ |

Dále: skill načten ✅; originály ve `vstup/` po běhu **beze změny** (`cmp` se zdrojem) ✅; skilly beze změny ✅; nasazeno jen na zadaný web, stránka `uprava-copilot` publikována ✅; výsledek v `uprava/copilot` (4 soubory) ✅. Graph Excel API Copilot nepoužil (volil variantu bez Graph oprávnění). Build napoprvé spadl na vlastní chybě typů, opravil ✅. Cena 3,67 AI Credits, 4 min 57 s.
Nezkoušeno ❓: Graph Excel API s relací, `.doc`/`.xls`, šablona s polem/ovládacím prvkem obsahu ⛔ (skill sám ji uvádí jako neověřenou), otevření výstupů v Office Online.
**Závěr:** nová sekce Copilotovi stačí na všechny čtyři úkoly od zadání po ověřený výstup ✅.
