# Matice: požadavky Tomáše Galíka × varianty řešení

Stav 24. 11. 2026 ~03:00, sestavila session `matice-variant`. Řádky jsou všech 37 položek z
[galik-otazky.md](galik-otazky.md), sloupce jsou varianty. Fakta jsou jen z důkazů v repu
(kánon v [CLAUDE.md](../CLAUDE.md)). Dokumentace (📘) a odhady nejsou ✅. Slouží jako řídicí přehled
hlavní session: podle buněk **DÍRA** rozděluje práci rolím ([role.md](role.md)).

## Sloupce (varianty)

| | Varianta | Co to je |
|---|---|---|
| **A** | SPFx bez Azure | web part v prohlížeči: SharePoint REST, `MSGraphClientV3`, `fetch`, JS knihovny |
| **B** | SPFx + Container App / Job | vlastní server v Azure (`AadHttpClient`, managed identity, cron Job) |
| **C** | Power Automate Standard | flow se standardními konektory (licence PA z E3/E5) |
| **D** | Power Automate Premium | HTTP, Word Online „Populate“, SQL, Dataverse, AI Builder |
| **E** | M365 / Graph nativně | bez vlastního kódu: UI SharePointu a Lists, Graph funkce, Microsoft 365 Copilot |
| **F** | jiné | Copilot Studio, Logic Apps, APIM, Dataverse, tesseract.js apod., kde to dává smysl |

## Značky v buňkách

- ✅ změřeno v labu, za značkou důkaz
- ❌ změřeno, že nejde, za značkou důkaz
- ⛔ jen v E.ON (v labu neověřitelné)
- 🔒 v labu blokováno licencí: Premium SKU v tenantu není, zapnutí flow vrací 403 `MissingAdequateQuotaPolicy`
  ([behy.txt](../sondy/power-automate/vystupy/behy.txt) konec, [diag-409.txt](../sondy/power-automate/vystupy/diag-409.txt)).
  Je to **DÍRA, kterou bez rozhodnutí Pavla o trialu Premium / PAYG nikdo nezměří**.
- **DÍRA**: varianta dává smysl, ale nikdo ji neměřil. Za šipkou → je, kdo na ní už pracuje.
- – varianta tu nedává smysl (důvod v závorce)

Zkratky důkazů: `PA` = [sondy/power-automate.md](../sondy/power-automate.md) a `vystupy/behy.txt`
(běhy `…CUnn`), `CA` = [10-container-app.md](../10-container-app.md), katalog 1–6.

## 1 Data

| č. | Položka | A SPFx bez Azure | B + Container App | C PA Standard | D PA Premium | E M365 nativně | F jiné |
|---|---|---|---|---|---|---|---|
| 1.1 | Editace dat (ne jen čtení) | ✅ čtení, zápis i úprava v seznamu: `sondy/data-prava/matrix.jsonl` ř. 1–4, `skills/egd-data-seznamy/TEST.md` + `TEST-copilot.md` | ✅ Azure SQL + API (založení, změna stavu, mazání podle role): `sondy/overeni/data-prava/api-matrix-2026-11-22.jsonl`, `sondy/container-app/prava-db/14–16-*-klik.log` | ✅ asynchronně: flow „When an item is created“ → `PatchItem` zapíše do položky za ~43 s (`queue-llm` 766a529e, PA) | 🔒 SQL / Dataverse konektor | ✅ úpravy přímo v UI seznamu pod rolemi: `sondy/ms-prava/ui/`, `bez-mazani.jsonl` ř. 5–8 | **DÍRA** (nízká): Dataverse, licence na uživatele |
| 1.2 | Kolik dat seznam unese | ✅ 12 000 položek, indexy max. 20, stránkování: `sondy/data-prava/threshold.jsonl` ř. 3–13, `sondy/miniskilly/indexy-max.jsonl`, `sondy/optimalizace/stranky.jsonl` | **DÍRA** (nízká): objem v SQL nikdo neměřil | **DÍRA** (nízká): „Get items“ nad 5000 položek ve flow | 🔒 | ✅ jako A (UI zobrazení nad 5000 s indexem: `sondy/miniskilly/indexy-*.jsonl`) | – |
| 1.3 | Souběžná editace dvou lidí | ✅ REST pod dvěma účty: s `IF-MATCH: *` se změna A ztratí, s ETagem 412 a druhý pokus projde: `sondy/miniskilly/etag.jsonl` ř. 1–20; skill a web part → **Miniskilly** (`miniskilly-etag`, `sondy/miniskilly/etag-appka/`) | **DÍRA** (nízká): v API není řízení souběhu (`rowversion`) | **DÍRA** (nízká): dva flow nad jednou položkou | 🔒 | **DÍRA** (nízká): dva uživatelé v UI seznamu | – |
| 1.4 | Kdy vlastní databáze | – (seznam není relační) | ✅ Azure SQL free + API, role z tokenu, `AadHttpClient` ze SPFx pod 3 účty: CA 2, `prava-db/09-regrese-po-0.2.jsonl` | – (Standard umí jen SharePoint a Excel) | 🔒 SQL Server, Dataverse | – | **DÍRA** (nízká): Dataverse, Cosmos DB free |

## 2 AI a API gateway

| č. | Položka | A SPFx bez Azure | B + Container App | C PA Standard | D PA Premium | E M365 nativně | F jiné |
|---|---|---|---|---|---|---|---|
| 2.1 | API gateway s klíčem appky | – (klíč by byl v prohlížeči) | ✅ token uživatele + `X-App-Id`, kvóta 429, audit ceny: `sondy/overeni/container-app/gateway/07-kvota-429-*`, `08-konzolovy-log-*`, `sondy/ms-llm/e2e-copilot/klik.json`. Volající bez uživatele (`Gateway.App`) **DÍRA** | ✅ volání LLM přes připojení s klíčem (běh `…CU15`). Kvóta na appku a audit na uživatele flow nemá (připojení drží jeden klíč) | – | – | ❌ APIM Consumption odmítl politiku token limitu: `sondy/overeni/ai/apim-policy-test-2026-11-22.out` |
| 2.2 | OCR | **DÍRA** (nízká): OCR v prohlížeči (tesseract.js) bez Azure | ✅ čeština, 1–1,3 s, 0,0015 USD/str.: `sondy/overeni/container-app/gateway/03-ocr-*`, `sondy/ms-llm/e2e-1.0.0.3/`; nad 3,1 MB 502 (`ocr-velke-soubory.md`) | ✅ Foundry konektor s obrázkem faktury, přesný přepis (běh `…CU25`) | ❌ AI Builder v labu není (žádný konektor ani servisní plán): `sondy/ms-llm/cesta-a-b.md` ř. 6, 16 | **DÍRA** (nízká): SharePoint Premium OCR na knihovnu | – |
| 2.3 | Rozpoznání obrázků | – (bez modelu) | ✅ text na obrázku přes vision: `gateway/04-vision-2026-11-24.txt`. Popis reálné fotky (scéna) **DÍRA** → **Ověřovatel** (`overeni-galik`) | ✅ text na obrázku (běh `…CU25`). Popis fotky **DÍRA** | ❌ AI Builder v labu není (`cesta-a-b.md`) | **DÍRA** (nízká): Microsoft 365 Copilot nad obrázkem | – |
| 2.4 | Generování textu | – (klíč by byl v prohlížeči) | ✅ 1–1,8 s, ~0,0001 USD: `sondy/overeni/ai/probe-2026-11-22.out` ř. 6–7, `gateway/02-chat-*`, `ms-llm/e2e-1.0.0.3/klik.json` | ✅ Foundry Inference `ChatCompletion` (běh `…CU15`, v řetězu `…CU05`) | ❌ AI Builder v labu není | ❌ bez Copilot licence: `POST /beta/copilot/conversations` 401 (`cesta-a-b.md` ř. 9). S licencí **DÍRA**, Copilot trial v labu končí 25. 11. 08:31 (`06-azure-inventar.md` ř. 14) | **DÍRA**: Copilot Studio (konektor je Standard: `sondy/ms-llm/pa-konektory-ai.md` ř. 20, nikdy nespuštěn) |
| 2.5 | Generování obrázků | – | ❌ kvóta obrazových modelů 0, `/api/image` 501: `sondy/ms-llm/image-kvota.txt`, `gateway/09-image-501-*` | ❌ stejná subscription, stejná kvóta 0 (`image-kvota.txt`) | ❌ AI Builder v labu není | **DÍRA** (nízká): obrázky v Microsoft 365 Copilot | – |
| 2.6 | LLM bez Azure hostingu | – | – (Azure z definice) | ✅ Standard, bez vlastního serveru, ale model je pořád Azure OpenAI (běh `…CU15`) | ❌ AI Builder v labu není | ❌ Copilot API bez licence 401 (`cesta-a-b.md`). S licencí **DÍRA** (viz 2.4) | **DÍRA**: Copilot Studio ze SPFx (Direct Line / Agents SDK) |

## 3 Dokumenty

| č. | Položka | A SPFx bez Azure | B + Container App | C PA Standard | D PA Premium | E M365 nativně | F jiné |
|---|---|---|---|---|---|---|---|
| 3.1 | Generování pdf, docx, pptx, xlsx | ✅ všech 5 výstupů v prohlížeči, čeština: `sondy/ms-dokumenty/spokojenost-klik.log`, `spokojenost-obsah.txt`, `skills/egd-dokumenty/TEST-copilot.md` (PPT a pdf-lib jen v Claude) | ✅ LibreOffice docx/xlsx/pptx → PDF, diakritika, `AadHttpClient`: `sondy/container-app/libreoffice/dukazy/spfx-klik.log`, `okrajove-0.2.log` | ✅ Word → PDF přes OneDrive „Convert file“ (běh `…CU08`, 23. 11.) | 🔒 „Populate a Word template“: flow `54ef5251` vznikl `Suspended`, zapnutí 409 (licenci to nedokazuje, `behy.txt`) | ✅ Graph `?format=pdf`: `sondy/overeni/dokumenty/graph-pdf-2026-11-22.log`, `sondy/ms-dokumenty/spokojenost-graphpdf-cteni.log` | **DÍRA** (nízká): Encodian / Plumsail (Standard, cizí předplatné) |
| 3.2 | Úprava existujících dokumentů | **DÍRA** → **Miniskilly** (`ms-uprava-dok`): přepsat Word, buňky Excelu, snímek PPT, ručně vyrobená šablona | **DÍRA** (nízká): úprava docx na serveru (konverze LibreOffice úprava není) | **DÍRA**: Excel Online (Business) „Update a row“ v existujícím sešitu (Standard) | 🔒 Word „Populate“ (viz 3.1) | **DÍRA**: Graph Excel API (`workbook/…/range` PATCH) v existujícím souboru | – |

## 4 Práva

| č. | Položka | A SPFx bez Azure | B + Container App | C PA Standard | D PA Premium | E M365 nativně | F jiné |
|---|---|---|---|---|---|---|---|
| 4.1 | Práva a přístupy v appce | ✅ SharePoint skupiny, „vidí jen své“, schvalovatel bez mazání: `sondy/ms-prava/matrix-po-polozkach.jsonl` ř. 1–6, `bez-mazani.jsonl` ř. 5–8; Entra skupiny s prodlevou 15–40 min: `matrix-entra.jsonl` ř. 5–7. Skill `egd-prava-role`: Copilot ✅, Claude `TEST.md` → **Miniskilly** (`ms-prava-claude`) | ✅ app role Zadavatel / Schvalovatel / Spravce: 401, 403, izolace podle `oid` (`api-matrix-2026-11-22.jsonl`, `prava-db/09-regrese-po-0.2.jsonl`) | **DÍRA** (nízká): role ve flow (Office 365 Groups/Users) | – | ✅ nastavení skupin a úrovní v UI SharePointu: `sondy/ms-prava/ui/00–07*.png`, `07-schvalovatel.log` | – |
| 4.2 | Víceúrovňová autentizace | – (SPFx přebírá přihlášení SharePointu) | ⛔ Conditional Access / MFA při OBO (`interaction_required`): `sondy/container-app/obo.md` „Neověřeno“ | – | – | **DÍRA**: Entra Conditional Access, authentication context na web nebo akci (v labu jde; co Tomáš myslí, nevíme, viz otázka 1 v galik-otazky) | – |
| 4.3 | Práva podle oddělení a nadřízeného, sdílení záznamu | ❌ zadavatel bez `ManagePermissions` sdílet nesmí (403): `sondy/container-app/prava-db/08-test-sdileni.jsonl` | ✅ sdílení položky přes MI (23/23): `08-test-sdileni.jsonl`, `14-tomas-klik.log`, `15-eva-klik.log`, `16-jakub-klik.log`. Oddělení / nadřízený **DÍRA** | ❌ „Grant access“ 400 „permission level is not valid“ u všech hodnot (běh `…CU19`, flow `e07b38c5`). Příčina ❓, zkusit hodnoty z designeru | – | **DÍRA**: sdílení položky tlačítkem Sdílet v UI seznamu | **DÍRA** (nízká): Dataverse s řádkovou bezpečností |

## 5 Externí zdroje

| č. | Položka | A SPFx bez Azure | B + Container App | C PA Standard | D PA Premium | E M365 nativně | F jiné |
|---|---|---|---|---|---|---|---|
| 5.1 | Externí data přes API | ✅ API s CORS (ARES, Open-Meteo) jdou, ❌ ČNB a OTE z prohlížeče ne: `sondy/overeni/napojeni/cors-curl-preflight-2026-11-22.txt`, `sondy/ms-dokumenty/konzole-fetch-test.log` | ✅ ČNB z Jobu: `sondy/overeni/container-app/job/03-log-behu-2026-11-24.txt`, `sondy/overeni/napojeni/job-executions-2026-11-22.json` | ✅ jen RSS / Atom feedy (flow `RSS bez HTTP`, běh `…CU08`). ČNB bez HTTP nejde | 🔒 HTTP akce 403 (`diag-409.txt`, flow `04cafff2`) | – | **DÍRA**: Logic Apps Consumption (HTTP bez licence PA, platí se z Azure): `sondy/napojeni.md` ř. 134 „nezkoušeno“ |
| 5.2 | Scraping webů | ❌ OTE (HTML) z prohlížeče blokuje CORS: `cors-curl-preflight-2026-11-22.txt` | **DÍRA** → **Ověřovatel** (`overeni-galik`): Job `job-egd-scrape` 1. běh padl na TLS (`sondy/overeni/scraping/04-log-bez-CA-FAILED-*`), 2. běh s CA běží (`06-execution-s-CA-*`) | – (bez HTTP stránku nestáhneš, RSS jen feedy) | 🔒 HTTP | – | **DÍRA** (nízká): Logic Apps |

## 6 E-maily

| č. | Položka | A SPFx bez Azure | B + Container App | C PA Standard | D PA Premium | E M365 nativně | F jiné |
|---|---|---|---|---|---|---|---|
| 6.1 | Maily s přílohami | ✅ jménem uživatele, příloha 30 MB ano / 40 MB ne, po schválení `Mail.Send`: `sondy/ms-maily/limit-prilohy.log`, `inbox-csv.log`, `skills/egd-maily/TEST-copilot.md`; Send As ze sdílené schránky: `sendas.log` | ✅ ze systémové schránky přes MI + Exchange RBAC, jiná schránka 403: `sondy/overeni/container-app/job/04-doruceny-mail-2026-11-24.txt`, `sondy/overeni/napojeni/job-logy-2026-11-22.txt` | ✅ ze schránky vlastníka flow s přílohou ze seznamu, doručeno: `sondy/ms-maily/pa-runs.log`, `pa-mail-doruceny.log`. ❌ ze sdílené schránky 404 `ErrorItemNotFound` (běh `…CU21`, příčina ❓) | – | – (Outlook sám) | – |
| 6.2 | Mail s vygenerovaným PDF | **DÍRA** → **Miniskilly** (`ms-pdf-mail`, `sondy/ms-pdf-mail/appka/`) | **DÍRA** → **ca-job-retez** (`sondy/container-app/job-retez/`, zatím jen `dukazy/identita.log`) | ✅ Convert file → `SendEmailV2` s PDF v jednom flow, všechny akce Succeeded (flow `1cac9ed2`, běh `…CU05`). Doručení a otevřitelnost PDF nečteno ❓ | – | – | – |

## 7 Plánované úlohy

| č. | Položka | A SPFx bez Azure | B + Container App | C PA Standard | D PA Premium | E M365 nativně | F jiné |
|---|---|---|---|---|---|---|---|
| 7.1 | Plánování tasků | – (SPFx běží jen s otevřenou stránkou) | ✅ cron v 18:20:00 UTC přesně: `sondy/overeni/napojeni/job-executions-2026-11-22.json`, `sondy/overeni/container-app/job/` | ✅ Recurrence v pražském čase, mail doručen: `sondy/ms-maily/pa-runs.log` (běh v 19:50:00 UTC), flow `b4ffdc0a` | – | – (seznam sám nic časového nespouští; jen 📘, neměřeno) | **DÍRA** (nízká): Logic Apps / Azure Function timer |
| 7.2 | Denní report: zdroj → analýza → dokument → mail | – | **DÍRA** → **ca-job-retez** (ČNB → gateway → docx/PDF → mail v jednom Jobu) | ✅ bez ČNB: Recurrence → LLM → Word → PDF → mail, běh `…CU05` (zdroj nahrazen pevnou hodnotou). Doručení nečteno ❓ | 🔒 krok „stáhnout ČNB“ je HTTP (403) | – | **DÍRA**: Logic Apps (celý řetěz včetně HTTP bez licence PA) |
| 7.3 | Licence pro plánované úlohy | – | ✅ Job licence M365 nepotřebuje (MI + RBAC, CA 3), chce Azure subscription | ⛔ jestli mají účastníci v E.ON licenci PA a smí tvořit flow. V labu bez licence `InvalidUserPlan` (`skills/egd-planovane-ulohy/SKILL.md` ř. 153) | ⛔ Premium / PAYG v E.ON | – | – |

## 8–22 Proces, nasazení, organizace

Většina položek není technická varianta, ale rozhodnutí nebo dokument. Varianty A–F tu mají smysl jen u
položek 8, 10, 12, 13, 20 a 21.

| č. | Položka | A SPFx bez Azure | B + Container App | C PA Standard | D PA Premium | E M365 nativně | F jiné |
|---|---|---|---|---|---|---|---|
| 8 | Demo Power Apps / Power Automate | – | – | ✅ hotová flow k ukázce: denní mail (`pa-runs.log`), LLM (`…CU15`), OCR (`…CU25`), řetěz (`…CU05`). Po 25. 11. 04:04 v labu nepoběží (konec E5) | 🔒 | – | **DÍRA**: Power Apps (licence na uživatele), demo nabízí Urbánek |
| 9 | SPFx podporované, skupinová politika | ⛔ odpověď E.ON SHO-5032 (mail M2) | – | – | – | – | – |
| 10 | App catalog na webu, kdo rozhoduje | ✅ v labu nasazení do katalogu webu bez Custom Script (`lab/dukazy/ui-egd05.log`). ⛔ v E.ON AILab-Dev2 katalog nemá (404, `pripravenost-Tomáš.md`) | – | – | – | – | – |
| 11 | Automatizace webů a katalogů, CoE | ⛔ mail M2 | – | – | – | – | – |
| 12 | Bez Azure, bez registrace appky, bez licencí | ✅ jádro: data, role, dokumenty, mail (1.1, 3.1, 4.1, 6.1 ve sloupci A) | – (Azure z definice) | ✅ plán, LLM, PDF, mail (C v 6.2, 7.1, 7.2) s licencí PA | – | ✅ ruční nahrání `.sppkg` bez registrace appky (`lab/dukazy/ui-egd05.log`) | – |
| 13 | Kód v GitLabu, CI/CD | **DÍRA** (po workshopu): runner → katalog webu, certifikát | – | – | – | – | – |
| 14 | API permissions, security assessment | – (dokument: souhrnný seznam oprávnění, **Redaktor**) | – | – | – | – | – |
| 15 | Srovnání prostředí, doporučení | – (dokument; vstupem je tato matice). Copilot Studio a AI Builder ve sloupci F zatím neměřené | – | – | – | – | – |
| 16 | Proces od nápadu po údržbu | – (dokument, Pavel, 31. 12.) | – | – | – | – | – |
| 17 | Role a lidé | – (dokument, Pavel, 31. 12.) | – | – | – | – | – |
| 18 | Návrh pro pilot 2027 | – (dokument, Pavel, 31. 12.) | – | – | – | – | – |
| 19 | GitHub Copilot nebo Claude | – (agent, ne varianta; `skills/*/TEST-copilot.md`) | – | – | – | – | – |
| 20 | appId, které nemáme | ✅ ruční nahrání bez appId: `lab/dukazy/ui-egd05.log`. Pod `egd01` ✅ 24. 11. (profil, bez hesla, Deployed 1.0.0.0): `skills/egd-prvni-appka/test-dukazy/katalog-egd01/ui-egd01.log` | – | – | – | – | – |
| 21 | App catalog „24 h předem“ | ⛔ katalog zakládá Product Team E.ON (mail M2); naše appky `requiresCustomScript: false` | – | – | – | – | – |
| 22 | Prereq skill v Copilotu v E.ON | ⛔ spustí Tomáš nebo Adriána | – | – | – | – | – |

## Součty

Počítáno po buňkách v řádcích 1.1–7.3 (22 položek × 6 variant = 132 buněk). Kde buňka kombinuje
✅ s dírou (např. 2.3 B), počítám ji jako ✅ a díru vedu v seznamu níž.

| | A | B | C | D | E | F | celkem |
|---|---|---|---|---|---|---|---|
| ✅ | 7 | 13 | 12 | 0 | 4 | 0 | 36 |
| ❌ | 2 | 1 | 2 | 5 | 2 | 1 | 13 |
| 🔒 (díra kvůli licenci) | 0 | 0 | 0 | 9 | 0 | 0 | 9 |
| ⛔ | 0 | 1 | 1 | 1 | 0 | 0 | 3 |
| **DÍRA** | 3 | 6 | 4 | 0 | 7 | 10 | 30 |
| – | 10 | 1 | 3 | 7 | 9 | 11 | 41 |

Spočítáno skriptem podle první značky v buňce (132 buněk, žádná neklasifikovaná).

Sloupec B je nejúplnější: Container App má ✅ u všech technických položek kromě scrapingu a řetězu 7.2,
které běží. Sloupec D je celý blokovaný licencí (❌ jsou AI Builder, který v labu není). F je skoro celý neměřený.

## Díry seřazené podle důležitosti pro hackathon 25. 11.

Kritérium: Tomáš položku jmenoval výslovně v M1 (1.–7.) a ve středu se na ni zeptá; varianta je ta,
kterou by EG.D reálně použilo (bez Azure nebo bez licencí na uživatele); termín. Role podle
[role.md](role.md). **Běží** = úkol už má vlastníka, nezdvojovat.

| # | Díra (položka, varianta) | Proč důležitá | Vlastník | Stav |
|---|---|---|---|---|
| 1 | **7.2 B** celý denní report v jednom Jobu (ČNB → LLM → dokument → mail) | Tomášův vzorový případ. C prošel jen bez ČNB, B je jediná úplná cesta bez Premium | ca-libreoffice / ca-job-retez | **běží** (zatím jen `identita.log`) |
| 2 | **3.2 A** úprava existujícího Wordu, Excelu, PPT a ruční šablony | výslovně v zadání, dnes ❌ ve všech sloupcích | Miniskilly (`ms-uprava-dok`) | **běží** |
| 3 | **D celý sloupec** (5.1, 5.2, 7.2 s ČNB, 3.1/3.2 Populate, 1.4 SQL): Premium | bez trialu Premium / PAYG zůstane 9 buněk 🔒. Rozhoduje se před 25. 11. 04:04 | **Pavel** (rozhodnutí), pak Power Automate | čeká na Pavla |
| 4 | **2.4 / 2.6 E** Graph `/copilot` s licencovaným uživatelem | jediná cesta LLM „bez Azure“, kterou E.ON může mít. Copilot trial v labu končí 25. 11. 08:31, pak už neověříme | Ověřovatel sond (nebo ms-llm přes Miniskilly) | **nikdo**, nutné hned |
| 5 | **5.2 B** scraping HTML v Jobu | výslovně v M1, dnes ❌ z prohlížeče, PA jen s Premium | Ověřovatel sond (`overeni-galik`) | **běží** (2. běh s CA) |
| 6 | **6.2 A** jedno tlačítko „vygeneruj PDF a pošli“ v SPFx | výslovně v M1, cesta bez Azure a bez licencí; C už ✅ | Miniskilly (`ms-pdf-mail`) | **běží** |
| 7 | **2.3 B / C** popis reálné fotky (scéna, zařízení) | výslovně v M1 („picture recognition“), máme jen text z obrázku | Ověřovatel sond (`overeni-galik`) | **běží** (vision) |
| 8 | **3.2 C / E** úprava Excelu přes Excel Online „Update a row“ (Standard) a Graph Excel API | alternativa k 2. bez kódu v prohlížeči; Graph Excel API jde i ze SPFx | Power Automate (C), Miniskilly (E) | **nikdo** |
| 9 | **4.3 B** práva podle oddělení a nadřízeného | Tomáš to má v M1 implicitně, `10-container-app.md` ř. 69 to vede jako ✅ bez důkazu | ca-prava-db (idle, vlastní sondu) | **nikdo** |
| 10 | **4.3 C / E** sdílení položky: PA „Grant access“ s platnou hodnotou role z designeru; tlačítko Sdílet v UI seznamu | jediné cesty sdílení bez Azure; C dnes ❌ 400 s neznámou příčinou | Power Automate (C), Správce labu (E, ověření pod účastníkem) | **nikdo** |
| 11 | **6.1 C** sdílená schránka ve flow (404 `ErrorItemNotFound`) | report „od systému“ bez Azure; hypotéza FullAccess | Power Automate | **nikdo** (v Neověřeno PA sondy) |
| 12 | **4.1 A** Claude `TEST.md` pro `egd-prava-role` | kánon: skill hotový až po dvou agentech | Miniskilly (`ms-prava-claude`) | **běží** |
| 13 | **1.3 A** ETag do skillu a šablony web partu | měření hotové, chybí ve skillu (šablona tiše přepíše cizí změnu) | Miniskilly (`miniskilly-etag`) | **běží** |
| 14 | **4.2 E** Conditional Access / authentication context | nevíme, co Tomáš myslí; nejdřív otázka 1 v galik-otazky | Pavel (otázka), pak Správce labu | čeká na odpověď |
| 15 | **2.4 / 2.6 F** Copilot Studio (konektor Standard ✅ v katalogu, nespuštěn) | M4 jmenuje Copilot Studio výslovně (bod 15), dnes jen 📘 | Power Automate | **nikdo** |
| 16 | **5.1 / 5.2 / 7.2 F** Logic Apps Consumption | HTTP bez licence PA; náhrada D, kdyby Premium nebyl | Ověřovatel sond (Azure) | **nikdo**, po workshopu |
| 17 | ~~**20 A** ruční nahrání `.sppkg` pod `egd01`~~ ✅ 24. 11. | uzavřeno ([důkaz](../skills/egd-prvni-appka/test-dukazy/katalog-egd01/ui-egd01.log)) | Skill první appka | – |
| 18 | **2.1 B** `Gateway.App` (volající bez uživatele z Jobu nebo flow) | potřebné pro 7.2 B s LLM | ca-job-retez (narazí na to v řetězu) | souvisí s 1. |
| 19 | **8 F** Power Apps demo | Tomáš o něj žádal; licence na uživatele | Pavel / Urbánek (rozhodnutí) | čeká |
| 20 | Nízké: 1.2 B/C objem, 1.3 B/C/E souběh, 2.2 A tesseract.js, 2.2/2.3/2.5 E SharePoint Premium a Copilot, 3.1 F Encodian, 3.2 B, 4.1 C, 1.1/1.4/4.3 F Dataverse, 7.1 F timer | pro středu nepotřebné | po workshopu, hlavní session rozdělí | – |
| 21 | Po workshopu: 13 GitLab CI/CD | zadání M2, termín 31. 12. | Hlavní session založí sondu | – |

## Rozpory nalezené při sestavování

- `galik-otazky.md` 1.3 odkazuje na `sondy/data-prava/soucty.jsonl`, soubor ale leží v
  `sondy/optimalizace/soucty.jsonl`. Stejně `sondy/data-prava/stranky.jsonl` (1.2) je v `sondy/optimalizace/`.
- `galik-otazky.md` 2.3 říká „vision jsme nevolali“. Gateway vision je od 24. 11. změřen curlem s tokenem
  (`gateway/04-vision-2026-11-24.txt`, popis textu faktury). Z web partu a nad fotkou scény stále ne.
- `10-container-app.md` (tabulka dokumentů, B2) vede OneDrive „Convert file“ jako „běh ❓“, PA sonda má běh
  `…CU08` 23. 11. Succeeded. Tabulka PA v témže souboru už má ✅. Opraví **Redaktor**.
- `10-container-app.md` (práva na položky, D) vede „běh čeká na přihlášení“, běh `…CU19` mezitím selhal 400. Opraví **Redaktor**.
- PA tabulka 24. 11. značí Premium položky ⛔. Podle kánonu je ⛔ „jen v E.ON“; Premium jde ověřit i v labu
  trialem, proto ho tu vedu jako 🔒 (díra s rozhodnutím Pavla).

## Co jsem prohledal

Celé: `prehled/galik-otazky.md`, `prehled/role.md`, `sondy/power-automate.md` (včetně neuložené změny z 24. 11.),
`sondy/power-automate/vystupy/behy.txt`, `diag-409.txt`, `10-container-app.md` ř. 1–130, poznámky sessions ve
sdílené složce, `prehled/stav/*.json` (popisy). Částečně: `sondy/napojeni.md` (souhrn, neověřeno), `sondy/ai.md`
a `sondy/ms-llm/cesta-a-b.md` (řádky o Copilotu, AI Builderu, Copilot Studiu), `sondy/miniskilly/etag.jsonl`,
`gateway/04-vision-*`, `sondy/overeni/scraping/` (výpis a log). Existenci každého citovaného souboru jsem ověřil
(`[ -e ]`). Obsah důkazů u řádků převzatých z galik-otazky jsem znovu neotevíral, kromě výše jmenovaných.
