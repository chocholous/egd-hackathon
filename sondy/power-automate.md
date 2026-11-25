# Power Automate jako alternativa ke každé funkci Container App

Zadání (Pavel, 22. 11. 2026): EG.D nechce Azure hosting ani licence pro každého uživatele, proto ke každé funkci z
[10-container-app.md](../10-container-app.md) hledáme a v labu ověřujeme cestu přes Power Automate (PA). Navazuje na
[sondu 4 v napojeni.md](napojeni.md#sonda-4-power-automate-standardní-konektory).
Značky: ✅ změřeno v labu 2026-11-22 · ❓ neověřeno (mezistav, ne závěr; viz „Neověřeno“).
**Stav: rozpracováno.** Část ověřování čeká na kroky, které smí udělat jen Pavel (viz konec).

## Souhrn: funkce → PA cesta → licence → stav

| Funkce (Container App) | Cesta přes Power Automate | Konektor / akce | Standard / Premium | Stav | Háček |
|---|---|---|---|---|---|
| LLM (chat, shrnutí, klasifikace) | akce „Chat completion“ proti Azure OpenAI | **Azure AI Foundry Inference** (`shared_azureaifoundryinference`), připojení klíčem | **Standard** ✅ (tier z API) | ✅ flow doběhlo, model vrátil českou větu; připojení vzniklo přes API bez člověka | model i klíč jsou pořád Azure (resource Foundry/OpenAI u E.ON IT); klíč drží připojení → žádná kvóta na appku ani audit na uživatele, jen historie běhů. Vision/OCR ✅: flow s obrázkem (`data:` URL) vrátilo přesný přepis faktury (běh `…CU25`, `vystupy/behy.txt`), model gpt-4.1-mini; Document Intelligence (strukturovaná pole) přes PA ❓ nezkoušeno. AI Builder („Run a prompt“) není v katalogu konektorů prostředí, chce Dataverse + kredity ❓ |
| Cizí API bez CORS (ČNB, OTE), scraping | akce HTTP (`GET https://api.cnb.cz/…`) | vestavěné HTTP | **Premium** ✅ (ne z katalogu, tam vestavěné HTTP není; z chyby 403 „premium license … connection 'Http'“) | ✅ negativní: flow s akcí HTTP se v labu **nedá zapnout**. Flow Button + akce HTTP vrátí při zapnutí 403 `MissingAdequateQuotaPolicy`: „you need a Power Automate Premium license … connection: 'Http'“ (důkaz `vystupy/diag-409.txt`), tedy příčina je licence ✅. U flow Recurrence + HTTP (id `27d47779-…`) a Request/Http trigger (id `fbe0eb18-…`) vrací zapnutí 409 `CannotStartUnpublishedSolutionFlow`, což mluví o nepublikovaném řešení a připojeních, ne o licenci; **příčina u nich neznámá** ❓ (rozdíl proti Button + HTTP je, že se při vytvoření samy vrátily do Stopped/Suspended). Flow bez HTTP naběhne | Standardní náhrada: konektor RSS (Standard ✅, flow `RSS bez HTTP` doběhlo, `…CU08`, čte jen RSS/Atom feedy). ČNB textový soubor ani HTML OTE bez HTTP nepřečteš. Vlastní konektor je Premium ❓ |
| Plánované úlohy | Recurrence trigger | Recurrence | **Standard** ✅ | ✅ flow Recurrence + Compose zapnuto a doběhlo (`Succeeded`) | flow běží pod účtem vlastníka a s jeho připojeními; chování při odchodu vlastníka: jen E.ON (viz Neověřeno) |
| E-mail ze sdílené schránky s přílohou | „Send an email from a shared mailbox (V2)“ | Office 365 Outlook | **Standard** ✅ | flow uloženo ✅ (id `78b7eef6-…`), Send As pro Tomáše na `egd-report@` přidáno ✅; po přihlášení připojení (23. 11.) běh `…CU21` selhal na akci `Posli`: 404 `ErrorItemNotFound` („The specified object was not found in the store“), tedy ❌ zatím **nefunguje** přes Send As samotné; příčina neznámá ❓ (hypotéza: konektor chce i FullAccess/přístup do schránky kvůli uložení do Odeslané; ověřit přidáním FullAccess a opakovat běh). Důkaz `vystupy/behy.txt`. Send As doloženo `Get-RecipientPermission` (`vystupy/sendas-get-recipientpermission.txt`) | odesílatel je schránka, ale oprávnění (Send As) musí mít vlastník připojení; příloha z obsahu flow nebo ze SharePointu |
| Vlastní databáze | Azure SQL přes SQL konektor, nebo Dataverse | SQL Server, Microsoft Dataverse | **Premium** ✅ (tier z API u obou) | ❓ nezkoušeno (Premium konektor by flow nezapnul, viz HTTP) | Standardní varianty jsou jen SharePoint seznam (limit 5000/zobrazení, nerelační) a Excel Online (Business, Standard ✅). Ostatní SQL klienti čtou data ze SQL přímo, ne přes PA |
| Práva na jednotlivé položky | akce „Grant access to an item or a folder“ | SharePoint | **Standard** ✅ | flow uloženo ✅ (id `c076f6d0-…`); po přihlášení běh `…CU19` selhal: 400 „The selected permission level is not valid“; hodnoty `Read`, `Edit`, `View`, `Can view`, `Contribute`, `Full Control` všechny `BadRequest` (flow `e07b38c5-…`), tedy ❌ zatím nefunguje; platné hodnoty dává dynamická nabídka `GetItemAccessRoleOptions`, ❓ zjistit v designeru (UI) a opakovat (`vystupy/behy.txt`) | akce běží s právy vlastníka připojení (musí mít Manage Permissions), tedy jako sdílený účet; „kdo to udělil“ v auditu SharePointu = vlastník flow |
| Role složitější než „své / vše“ | logika ve flow (podmínky, členové skupiny) | Office 365 Groups, Office 365 Users (obě Standard ✅), SharePoint | **Standard** ✅ (tier) | ❓ nezkoušeno (jen tier z API) | tvrzení, že PA role nevynucuje, je ❓ (viz Neověřeno) |
| Dokumenty: šablona Word → PDF | (a) „Populate a Microsoft Word template“; (b) převod přes OneDrive „Convert file“ | (a) Word Online (Business); (b) OneDrive for Business | (a) **Premium** ✅; (b) **Standard** ✅ | (a) ❓ nezkoušeno; (b) flow uloženo ✅ (id `6492f614-…`, SharePoint → OneDrive → Convert file → SharePoint), běh `…CU08` (23. 11.) **Succeeded** ✅ (všechny 4 akce OK, `vystupy/behy.txt`) | (b) umí jen převod hotového dokumentu, ne dosazení do šablony; dosazení bez Premium dají jen cizí Standard konektory (Encodian Word, Plumsail Documents, Standard ✅ tier), které chtějí vlastní předplatné/klíč dodavatele ❓ |
| Spuštění flow z SPFx appky | viz samostatná tabulka níž | | | | |
| Volání Graphu jménem uživatele (OBO) | konektory (Outlook, Users, SharePoint) běží jako vlastník připojení, ne jako uživatel | – | Standard | ❓ | konektory běží jako vlastník připojení (z definice připojení), jestli jde předat identitu uživatele, ❓ nezkoušeno; test: dvě flow pod stejným připojením spuštěná dvěma uživateli přes trigger „For a selected item“ a porovnat v Outlooku/SharePointu, kdo je autor akce (potřebuje přihlášená připojení); jediný ověřený fakt: „HTTP with Microsoft Entra ID“ je Premium ✅ |

## Varianty bez Premium: pro a proti

| Potřeba | Varianta | Pro | Proti | Co chce IT / náročnost | Stav |
|---|---|---|---|---|---|
| Databáze | SharePoint seznam (Standard) | v M365, žádná licence | nerelační, limit 5000 na zobrazení, bez SQL reportů | nic navíc; nízká | tier ✅, použití známé ze SPFx |
| Databáze | Excel Online (Business) (Standard ✅ tier) | tabulky známé uživatelům | pomalé, souběžné zápisy, ne pro objem | nic navíc; nízká | ❓ nezkoušeno |
| Databáze | SQL / Dataverse konektor | relační data, SQL | Premium ✅ tier | licence Premium nebo PAYG; střední | ❓ blokováno licencí |
| Word → PDF | OneDrive „Convert file“ (Standard) | bez licence, hotový převod | umí jen převést hotový docx, nedosadí do šablony; potřebuje OneDrive uživatele | nic navíc; střední (3 akce) | ✅ změřeno 23. 11. (běh `…CU08` Succeeded) |
| Word → PDF | „Populate a Microsoft Word template“ (Premium) | šablona s poli | Premium ✅ tier | licence Premium; nízká | ❓ blokováno licencí |
| Word → PDF | Encodian / Plumsail (Standard ✅ tier) | šablony i PDF | předplatné a klíč třetí strany, data jdou k dodavateli | nákup a schválení dodavatele; střední | ❓ nezkoušeno |
| Word → PDF | Container App (LibreOffice) | plná kontrola | vlastní server | Azure + registry; vyšší | viz [dokumenty.md](dokumenty.md) |

## Jak spustit flow ze SPFx appky

| Cesta | Licence | Stav | Poznámka |
|---|---|---|---|
| „When an HTTP request is received“ (volání URL z appky) | **v labu nefunguje, příčina neznámá** ❓ | ✅ flow `diag Request Http trigger + Compose` (jen Compose, bez akce HTTP) skončilo při vytvoření Suspended a zapnutí vrací 409; **příčina neznámá** ❓, licence u Request triggeru není prokázaná (`vystupy/diag-409.txt`) | nejpřímější cesta, ale v labu s E5 bez Premium nefunguje; `listCallbackUrl` vrací jen u zapnutých flow ❓ |
| Request trigger druh „PowerApp“ (Power Apps V2) | Standard? ❓ | ✅ flow se zapnulo; ✅ URL se dá získat; ✅ volání bez tokenu 401 `DirectApiAuthorizationRequired`; ❓ s tokenem uživatele 403 `MisMatchingOAuthClaims` (zkoušeno aud `service.flow.microsoft.com` s lomítkem i bez, `service.powerapps.com`) | pokud by šlo volat tokenem přihlášeného uživatele (`AadHttpClient`, resource Flow), byla by to Standard cesta. Zatím nefunguje, nevím proč ❓ |
| Request trigger druhy „Button“, „Teams“ | Standard | ✅ zapnuto, ale `listCallbackUrl` je zablokován (`ListCallbackUrlOperationBlocked`) | z appky nevolatelné |
| **Kandidát (neověřeno)** seznam jako fronta: SPFx zapíše položku do SharePoint seznamu, flow „When an item is created“ ji zpracuje a výsledek zapíše zpět do položky (appka ho načte) | **Standard** ✅ (SharePoint) | ✅ změřeno 23. 11.: flow `queue-llm` (trigger „When an item is created“, LLM přes Foundry, zápis výsledku zpět `PatchItem`) uloženo po přihlášení připojení; položka zapsaná přes `m365 spo listitem add` měla `Vysledek` vyplněný **po 43 s** (měřeno po 10 s, polling 1 min); důkaz `vystupy/behy.txt`. Háček: `PatchItem` vyžaduje `item/Title` | funguje a je Standard; latence do ~1 min, pro interaktivní UI je to pomalé, pro asynchronní zpracování stačí |
| „For a selected item“ (tlačítko Automatizovat v seznamu) | Standard ❓ | ❓ | nespouští se z web partu, jen z UI seznamu |
| Volání Flow API tokenem uživatele z prohlížeče | ❓ | ❓ | ✅ `api.flow.microsoft.com` přijímá token uživatele z ROPC (tím tooly pa-* pracují); z SPFx by vyžadovalo `webApiPermissionRequests` na Flow; v SPFx nezkoušeno. Navíc Flow API zahazuje tělo při `triggers/manual/run` (převzato z ppf-rooms docs/power-automate.md, v této session neověřeno ❓) |

## Srovnání s Container App (vibecoder × E.ON IT)

Co je změřené, je v tabulkách výš; **buňky níž jsou odhady, pokud nemají ✅ nebo odkaz** (hodnocení „jednodušší“ není měření).

| Funkce | Pro vibecodera jednodušší | Co chce E.ON IT |
|---|---|---|
| LLM | odhad: **PA** o něco: klikací akce, žádný kód serveru; **Container App** má kvóty na appku, audit na uživatele, OCR, vision | obě cesty potřebují Azure OpenAI/Foundry resource a klíč nebo identitu; PA navíc správu připojení s klíčem (klíč u vlastníka flow) |
| Cizí API bez CORS | **Container App/Job** (kód, hotové, ✅ ČNB). PA jen s Premium HTTP | PA: Premium licence (uživatel nebo PAYG). CA: subscription + hosting |
| Plánované úlohy | **PA**: Recurrence je Standard a funguje | PA: licence PA (E5 stačí), role Environment Maker v prostředí s Dataverse (✅ viz sonda 4); CA: Azure + cron |
| E-mail ze sdílené schránky | **PA** (jedna akce), pokud se dá Send As; CA vyžaduje Exchange RBAC for Applications | PA: Send As pro účet vlastníka flow, správa připojení; CA: Exchange admin, managed identity |
| Databáze | **PA** nepomůže: SQL/Dataverse jsou Premium; Container App s SQL: ✅ viz [data-prava.md](data-prava.md) | PA: Premium; CA: Azure SQL + API |
| Práva na položky | **PA**: jedna Standard akce; CA to řeší backendem s `ManagePermissions` | PA: servisní účet s Manage Permissions jako vlastník flow; CA: aplikační oprávnění |
| Role | odhad: stejně složité v obou | – |
| Dokumenty | **PA** pro převod na PDF (Standard); šablony jen Premium nebo třetí strana; CA: LibreOffice/knihovny v kontejneru | PA: Premium Word Online nebo licence cizího konektoru; CA: registry + hosting |
| Spuštění ze SPFx | **PA fronta v seznamu**: appka jen zapíše položku | PA: nic navíc kromě licence; HTTP varianta: Premium |

Ověřeno v labu ✅: OAuth připojení se přes API založí, ale přihlásí je jen člověk (stav `Error`, běhy `…CU16/CU30/CU17` selhaly); připojení s API klíčem (Foundry, RSS) jde založit i přihlásit přes API; výchozí prostředí má Dataverse (role Environment Maker, sonda 4). Ostatní „háčky“ (flow mimo repo, vlastník, export) viz Neověřeno.

## Položky Tomáše Galíka: varianta Power Automate (měřeno 24. 11. 2026 v noci)

Premium licenci Tomáš **nemá**: `subscribedSkus` v tenantu neobsahuje Power Automate Premium SKU a zapnutí flow s HTTP akcí vrací 403 `MissingAdequateQuotaPolicy` („potřebuješ Power Automate Premium“; `vystupy/behy.txt`). Premium položky jsou proto ⛔ s touto chybou jako důkazem. Běhy se zjišťují `tools/pa-flow.py runs ID`.

| Položka | Varianta PA | Standard/Premium | Stav | Důkaz (run id) |
|---|---|---|---|---|
| 1.1 editace seznamu | flow „When an item is created“ → `PatchItem` zapíše do položky (SPFx jen zapíše položku, flow upraví) | Standard | ✅ (asynchronně, ~43 s) | flow `766a529e-…`, běh `08584061557754741458058924431CU15` (23. 11.) |
| 2.2 OCR | Foundry Inference `ChatCompletion` s obrázkem (vision/OCR textu faktury) | Standard | ✅ | flow `24b88ead-…`, běh `…CU25` (22. 11.) |
| 2.3 vision | tentýž konektor, popis obrázku | Standard | ✅ pro text na obrázku; popis reálné fotky ❓ nezkoušeno | běh `…CU25` |
| 2.4 text generation | Foundry Inference `ChatCompletion` | Standard | ✅ | flow `161eb740-…`, běh `…CU15` (22. 11.); v řetězu `…CU05` |
| 3.1 dokument | (a) Word → PDF přes OneDrive `ConvertFile`; (b) dosazení do šablony „Populate a Word template“ | (a) Standard; (b) Premium | (a) ✅; (b) ⛔ nezapnutelné (flow vznikne ve stavu `Suspended`, zapnutí vrací 409 `CannotStartUnpublishedSolutionFlow`, to licenci nedokazuje) | (a) flow `6492f614-…`, běh `…CU08` (23. 11.); (b) flow `54ef5251-…` |
| 5.1 externí API (HTTP, ČNB) | akce HTTP | Premium | ⛔ 403 `MissingAdequateQuotaPolicy` | flow `04cafff2-…` zapnutí 24. 11.; `vystupy/diag-409.txt` |
| 5.2 scraping HTML | HTTP GET stránky + parsování | Premium | ⛔ stejná chyba jako 5.1 (bez HTTP akce stránku nestáhneš; RSS jen feedy) | totéž; RSS flow `956c058c-…` jen feedy |
| 6.1 mail s přílohou | Office 365 Outlook `SendEmailV2` s přílohou; ze sdílené schránky `SharedMailboxSendEmailV2` | Standard | `SendEmailV2` ✅ (akce Succeeded, doručení do schránky nečtu: čtení pošty Tomáše mi chybí oprávnění); sdílená schránka ❌ 404 `ErrorItemNotFound` | `…CU05` (akce `Posli`); sdílená schránka `…CU21` |
| 6.2 mail s vygenerovaným PDF | Convert file → `SendEmailV2` s PDF v příloze v jednom flow | Standard | ✅ (akce Succeeded, doručení nečteno) | flow `1cac9ed2-…`, běh `…CU05` (24. 11.) |
| 7.1 plán | trigger Recurrence | Standard | ✅ | flow `b4ffdc0a-…` (Recurrence + Compose) |
| 7.2 celý řetěz | Recurrence → LLM → Word→PDF → mail v jednom flow; **krok „stáhnout ČNB“ je Premium** (HTTP), v řetězu je nahrazen pevnou hodnotou | řetěz Standard, ČNB Premium | ✅ bez ČNB; ⛔ s ČNB | flow `1cac9ed2-…`, běh `…CU05`; ČNB: 403 |

Pozn.: v řetězu `…CU05` jsou všechny akce `Succeeded` (LLM, Nacti_docx, Do_OneDrive, Na_PDF, Posli, Do_SharePointu). Doručení mailu a otevřitelnost PDF přílohy jsem nečetl ❓ (Graph čtení pošty Tomáše odmítnuto).

### Doplněné díry z `prehled/varianty.md` (24. 11. 2026, jen Standard)

| Díra | Varianta PA | Stav | Důkaz |
|---|---|---|---|
| 3.2 C úprava Excelu | Excel Online (Business) „Update a row“ (v API `PatchItem`) nad tabulkou `Tabulka1` v souboru v OneDrive; po úpravě `GetItems` | ✅ Standard; řádek `A` změněn na `zmeneno-flow`, řádek `B` beze změny | flow `b059d042-…`, běh `08584061194338581447147296676CU25` (všechny 3 akce Succeeded, hodnota přečtena zpět z výstupu `Cti_radky`) |
| 4.3 C práva na položku | (a) akce „Grant access to an item or a folder“; (b) SharePoint „Send an HTTP request to SharePoint“ (Standard): `ensureuser` → `breakroleinheritance` → `roleassignments/addroleassignment(roledefid=1073741826)` | (a) ❌ 400 „The selected permission level is not valid“ pro všech 14 zkoušených hodnot role (názvy `Read`, `Edit`, `Contribute`, `Full Control`, `View`, `Can view`, … i číselná ID rolí); platné hodnoty dává dynamická nabídka designéru, kterou jsem přes API nezískal ❓. (b) ✅ Standard, položka 1 má po běhu pro `eva.vesela@` roli `Read` (ověřeno čtením `roleassignments` přes SharePoint REST) | (a) běhy `…CU19`, `…CU28`; (b) flow `66b0cc58-…`, běh `08584061197996115527473851755CU02` |
| 6.1 C sdílená schránka | (a) `SharedMailboxSendEmailV2`; (b) `SendEmailV2` s polem From = adresa sdílené schránky (Send As) | (a) ❌ 404 `ErrorItemNotFound` i po přidání FullAccess a Send As Tomášovi (běhy `…CU21`, `…CU04`, `…CU24`); schránka existuje (`SharedMailbox`, Exchange); propagace práv může trvat až hodiny ❓, opakovat. (b) ✅ akce Succeeded (Send As stačí), doručení a hlavičku From jsem nečetl ❓ | (b) flow `eb66b33c-…`, běh `08584061192681984003357588528CU15`; skript `tools/pa-sharedmailbox-fullaccess.ps1` |
| 15 Copilot Studio | konektor „Microsoft Copilot Studio“, akce „Execute Agent and wait“ (`ExecuteCopilotAsyncV2`) a „Execute Agent“ | konektor **Standard** ✅ (tier z API); běh ⛔ neověřen: v prostředí není publikovaný agent a jeho založení je UI/licence Copilot Studia ❓ | tier: `vystupy/katalog-konektoru-tier.txt`; operace ze swaggeru API `shared_microsoftcopilotstudio` |

## Neověřeno (kánon: ❓ je mezistav; co je potřeba k ověření)

| Tvrzení | Proč zatím ne | Jak ověřit |
|---|---|---|
| HTTP, Request trigger, Word Online, SQL jsou Premium a flow s nimi poběží jen s licencí | v labu je ověřen jen tier z API a to, že flow s HTTP nejde zapnout; příčina (licence) nepotvrzena | trial Power Automate Premium pro Tomáše (zapne Pavel), pak znovu `pa-flow.py start` na flow `HTTP trigger + ČNB` a `Recurrence + HTTP` |
| E-mail ze sdílené schránky (404 `ErrorItemNotFound`) a práva na položku (neplatná role) | připojení jsou od 23. 11. přihlášená, běhy ale selhaly (viz tabulka nahoře) | sdílená schránka: přidat Tomášovi FullAccess na `egd-report@` a opakovat; práva: zjistit hodnoty z `GetItemAccessRoleOptions` v designeru (UI) a nastavit `roleValue` |
| Trigger „PowerApp“ volatelný tokenem uživatele ze SPFx | 403 `MisMatchingOAuthClaims` z ROPC tokenu, příčina neznámá | token z prohlížeče (`AadHttpClient`) v SPFx webpartu, případně nastavení autentizace triggeru v portálu |
| Sdílení flow, role ve flow, „PA OBO neumí“, trigger „For a selected item“, SQL/Dataverse běh, Document Intelligence přes PA | nezkoušeno | po přihlášení připojení a trialu Premium |
| Flow mimo repo, export/import a verzování | v této session nezkoušeno | `m365 flow export` nebo balíček z portálu, import do čistého prostředí, diff definic |
| Chování při odchodu vlastníka flow | jen v tenantu E.ON (v labu nelze rozumně odebrat licenci vlastníku produkčního flow) | v E.ON pilotu: odejmout licenci/zakázat účet testovacího vlastníka a sledovat flow |
| Proč ppf-rooms (12. 11.) HTTP pod E5 doběhlo, ale dnes ne | hypotéza: tehdy výchozí prostředí nemělo Dataverse (zřízen 12. 11.), dnes je kontrola licencí vynucená; nepotvrzeno | trial Premium → flow půjde zapnout; porovnat s prostředím bez Dataverse (nové prostředí) |
| AI Builder, PAYG vazba na prostředí | chybí licence/kredity, billing účet nečitelný | trial/PAYG schválí Pavel; Billing plans → Environments v admin centru |

## Co chybí a co smí udělat jen Pavel

⏱ Trial E5 v labu končí 25. 11. v 04:04 (podle auditora): přihlášení připojení a trial Premium je potřeba stihnout dřív, jinak flow ztratí licenci.

Důkazy (výstupy API, ID běhů) jsou v `sondy/power-automate/vystupy/`. **Hotovo 23. 11.:** Pavel přihlásil Tomáše (`tools/pa-browser-session.mjs login`), `repair` přihlásil čtyři OAuth připojení.
**Zbývá jen Pavel:** rozhodnout o trialu Power Automate Premium / PAYG (bez něj nejde ověřit nic Premium: HTTP, Word Online, SQL), a to před koncem trialu E5 25. 11. v 04:04.

## Znovupoužitelné nástroje

| Nástroj | Co dělá | Příklad |
|---|---|---|
| `tools/pa-flow.py` | Flow API jako lab uživatel: `list`, `get`, `create SOUBOR.json`, `start`/`stop`, `run ID --trigger Recurrence` (ruční spuštění), `url` (callback URL), `runs`, `run-actions [--full]`, `tiers` | `tools/pa-flow.py create sondy/power-automate/grant.flow.json` |
| `tools/pa-connection.py` | připojení: `list`, `apis --filter` (katalog s tierem), `params API`, `create API NAME --param k=v --param-env k=ENV` (konektory s API klíčem se přihlásí bez člověka) | `tools/pa-connection.py apis --filter foundry` |
| `tools/pa-sharedmailbox-sendas.ps1` | přidá uživateli Send As na sdílenou schránku (pro akci Send from a shared mailbox) | viz `--help` v hlavičce skriptu (`Get-Help`) |
| `sondy/power-automate/build.py` + `*.flow.json` | generuje definice zkušebních flow (mail-shared, queue-llm, grant, convert-pdf) | `python3 sondy/power-automate/build.py` |

## Co jsem v labu vytvořil

- SharePoint web `/sites/egd-sonda-power-automate` (vlastník Tomáš Procházka), seznam `Zadosti` (sloupec `Vysledek`, položka 1), `Shared Documents/sablona-test.docx`.
- Exchange: Send As pro `tomas.prochazka@` na `egd-report@` (sdílená schránka ze sondy napojení).
- Power Automate (prostředí Default, vlastník Tomáš): připojení `egd-sonda-foundry` (Connected, klíč Azure OpenAI z `aoai-egd-sonda-ai`), `egd-sonda-onedrive`, `egd-sonda-wordonline` (obě Error = nepřihlášená); testovací flow (všechna kromě tří dole Stopped): HTTP trigger + ČNB, Recurrence + HTTP, Recurrence + Compose, LLM přes Foundry (2×), trigger Button/Teams/PowerApp; zapnuté po přihlášení připojení: `mail-shared`, `grant`, `convert-pdf`, `queue-llm` (všechna připojení `egd-sonda-*` jsou od 23. 11. Connected).
- Nic placeného, žádný trial, nic nemazáno. Rozpočet: haléře (tokeny gpt-4.1-mini).
