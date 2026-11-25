# AI: LLM přes gateway ze SharePoint appky (OCR, obrázky, text)

Požadavek Tomáše Galíka (EG.D): „LLM přes API gateway na projektový/aplikační klíč: OCR, rozpoznání obrázků,
generování textu i obrázků“, volané ze SharePoint appky (SPFx). Značky: ✅ změřeno v labu 2026-11-22 ·
📘 dokumentace (odkaz) · ❓ neověřeno. 📘 a ❓ jsou jen mezistav (kánon v [../CLAUDE.md](../CLAUDE.md)): doporučení na nich nestojí, co v labu ověřeno není, je v sekci „Neověřeno“ s důvodem a návrhem ověření. Kód sondy: `sondy/ai/`, nástroje: `tools/ai-*` (viz konec).

> **Důkazy:** surové výstupy doměřila role Ověřovatel sond 22. 11. 2026, jsou v [overeni/](overeni/README.md): [probe](overeni/ai/probe-2026-11-22.out) (whoami, kvóta, chat, vision, OCR, 401), [studený start](overeni/ai/studeny-start-2026-11-22.txt), [APIM politiky](overeni/ai/apim-policy-test-2026-11-22.out), [502 opakování](overeni/ai/502-opakovani-2026-11-22.log), [appRoleAssignmentRequired](overeni/ai/appRoleAssignmentRequired-2026-11-22.log), [API access](overeni/api-access/) (soubory 01–16). **Stále bez uloženého logu** (výsledek ✅ z opisu, běh ❓ neuložen): kvóta 429 a 403 u neznámého `X-App-Id`, `prebuilt-layout`, audit v Log Analytics, CORS preflight, web part pod `tomas.prochazka`, 1. volání a časy chatu v web partu. Uložené je i B2: `sondy/power-automate/vystupy/behy.txt`, `katalog-konektoru-tier.txt`.

## Souhrn: požadavek, varianty, ověřeno, doporučení

Varianty (A bez Azure, B Power Platform vč. B2 Power Automate + Foundry, C vlastní gateway) jsou rozepsané v části „Tři cesty“ níž; tabulka dává to, co je v labu změřené, a doporučení je až v části „Doporučení“.

| Požadavek | Varianta s ověřeným výsledkem (doporučení viz „Doporučení“) | Stav |
|---|---|---|
| Generování textu / shrnutí / klasifikace (LLM) | **C: vlastní gateway v Container App** → Azure OpenAI managed identitou | ✅ (běh ❓ neuložen) SPFx web part → `AadHttpClient` → gateway → `gpt-4.1-mini`, pod lab účtem, **0,85–0,9 s v web partu** (probe z klienta 1,2–1,7 s, viz Měření), ~0,0001 USD za volání |
| OCR dokumentů a obrázků | **C: gateway → Azure AI Document Intelligence** (`prebuilt-read`) | ✅ 1 stránka 1,0–1,3 s, 0,0015 USD; česká diakritika přečtená správně (Document Intelligence i vision) |
| Rozpoznání / popis obrázku | **C: gateway → vision model** (`gpt-4.1-mini` s `image_url`) | ✅ 2,2 s, 0,0004 USD za obrázek |
| Generování obrázků | C: gateway → `gpt-image-*` | ❌ v lab subscription je kvóta všech obrazových modelů **0** (musí se žádat); endpoint v gateway je připravený a vrací 501 |
| „Projektový / aplikační klíč“ | **Ne klíč, ale identita**: Entra token uživatele + `X-App-Id` jako účetní štítek; klíč k modelu vůbec neexistuje (managed identity) | ✅ kvóta za den na uživatele a appku (429 při překročení), log kdo/co/tokeny/cena; `X-App-Id` je jen účetní štítek, **ne bezpečnostní hranice** (SPFx appky se podle tokenu nerozliší, viz „Co se při měření ukázalo“); varianty (b) a (c) neměřeny ❓ |
| Bez Azure (cesta A) | Pro obecné LLM / OCR zatím **nenalezena** | 📘 jen dokumentace: Copilot API ani SharePoint Premium nejsou obecné LLM endpointy a SharePoint Premium se platí přes Azure subscription. V labu **neověřeno** (licence Copilot v labu nejsou), závěr „bez Azure nejde“ je tedy mezistav, viz „Neověřeno“ |
| Power Platform B1 (AI Builder / Copilot Studio) | jednotlivé flow nad seznamem | 📘 AI akce ve flow = Premium + Copilot Credits; ❓ v labu neměřeno |
| Power Platform B2 (Power Automate, akce „Chat completion“ proti Azure OpenAI) | LLM bez vlastní gateway, ale s modelem v Azure | ✅ flow doběhlo, model vrátil českou větu, konektor Foundry Inference je Standard (tier z API); viz [power-automate.md](power-automate.md) ř. 13 a níž |

**Srovnání B2 vs C:** B2 nepotřebuje žádný vlastní server ani kód (nejkratší cesta z hlediska práce), ale nemá kvótu na appku ani audit na uživatele a OCR/vision přes ni není zdokumentováno; C je nejkratší z hlediska ověřené kontroly (kvóta, audit, 401/403), ale chce Container App, Entra registraci a schválení API access. Která je „kratší“, závisí na tom, jestli E.ON potřebuje kvótu a audit; změřeno obojí zvlášť, přímé měření B2 vs C (latence) není.

**Jednou větou:** ze SharePointu na LLM jsme v labu funkčně prošli dvě cesty a obě končí v Azure (C gateway, B2 Power Automate + Foundry); cesta bez Azure (A) je jen 📘 a v labu neověřená. Nejkontrolovatelnější změřená cesta je jedna sdílená
gateway v Container App (scale-to-zero), kterou volají všechny appky tokenem přihlášeného člověka.

## Tři cesty

| | A) Bez Azure (📘, v labu neověřeno) | B) Power Platform (B1 📘; B2 viz níž ✅) | C) Vlastní gateway (✅ změřeno) |
|---|---|---|---|
| Obecný LLM (prompt → text) | ❌ Copilot Chat API je jen s Copilot licencí každého uživatele, je preview, odpovídá nad firemními daty, nevrací soubory ani obrázky 📘 | AI Builder „prompt“ (GPT) ve flow; Premium, kredity 📘 | ✅ |
| OCR | SharePoint Premium OCR: jen automaticky na knihovnu, žádné API pro SPFx; **platí se přes Azure subscription** (0,001 USD/stránka) 📘; ❓ zda je něco zdarma v E5 | AI Builder „Text recognition“: 0,1 kreditu/stránka ≈ 0,001 USD, Premium flow 📘 | ✅ Document Intelligence Read 1,50 USD/1000 stran 📘 |
| Rozpoznání obrázku | SharePoint Premium image tagging, opět PAYG přes Azure 📘 | AI Builder „image description“ 8 kreditů/obrázek ≈ 0,08 USD 📘 | ✅ vision model, ≈ 0,0004 USD/obrázek |
| Generování obrázků | ❌ | ❌ nenalezeno | ❌ v labu kvóta 0 (žádost o přístup) |
| Jak to spustí SPFx | nijak (SPFx nemá co volat) | zápis položky do seznamu → standardní trigger SharePoint → flow; nebo HTTP trigger (Premium) 📘; viz [ppf-rooms power-automate.md](../../ppf-rooms/docs/power-automate.md) §1 ✅ HTTP s Entra = Premium | ✅ `AadHttpClient`, token uživatele |
| Licence / kdo platí | Copilot licence per uživatel (cena v sondě neověřena), PAYG vyžaduje Azure | Premium Power Automate + Copilot Credits (0,01 USD/kredit PAYG, balík 25 000 kreditů ≈ 200 USD/měsíc 📘) | jen spotřeba v Azure |
| Co potřebuje od IT E.ON | licence | Dataverse prostředí, Premium licence, kredity | subscription + Entra + schválení API access (viz níže) |
| Pro vibecodera s agentem | – | střední (klikání ve flow, omezené verzování) | nízká až střední: ~300 řádků Node, deploy skriptem |

### Varianta B2: Power Automate, akce „Chat completion“ (Azure AI Foundry Inference) ✅

Zdroj měření: [power-automate.md](power-automate.md) ř. 13 (flow `161eb740-…`, běh Succeeded 22. 11. 2026 18:46; surový výstup běhu neuložen, jde jen živě přes `tools/pa-flow.py runs`).

| | B2 |
|---|---|
| Co je ověřeno | Konektor Azure AI Foundry Inference (`shared_azureaifoundryinference`) je **Standard** (tier z API prostředí), připojení klíčem vzniklo přes API bez člověka, flow doběhlo a model vrátil českou větu ✅ |
| Pro | Žádný vlastní server ani kód, standardní konektor (bez Premium licence), stačí flow nad SharePoint seznamem (zápis položky → odpověď zpět do seznamu) |
| Proti | Klíč drží připojení: **žádná kvóta na appku ani audit na uživatele**, jen historie běhů flow; model i klíč jsou pořád Azure (resource Foundry/OpenAI u E.ON IT); OCR/vision tímto konektorem neověřeno ❓; AI Builder („Run a prompt“) v katalogu konektorů prostředí není, chce Dataverse + kredity ❓; z SPFx se flow spouští přes seznam (latence ❓ neměřena) |
| Co chce od IT E.ON | Azure OpenAI / Foundry resource a klíč, licenci Power Automate s právem na konektor, správu připojení (flow běží pod účtem vlastníka připojení) |
| Náročnost pro citizen developera | střední (flow se dá generovat agentem, připojení a vlastnictví flow řeší člověk) |

Proč klíč v prohlížeči nejde: web part běží v prohlížeči uživatele, jeho JS a síťový provoz si každý přečte. Klíč v balíčku nebo
v požadavku je tedy vyzrazený a použitelný mimo appku (a bez kvóty). Klíč proto musí zůstat na serveru, klient posílá jen token Entra.
Podobně doporučuje Microsoft u Copilot Studio (Direct Line secret nepatří do kódu v prohlížeči) 📘.

### Cesta A v detailu (📘 mezistav: výzkum z dokumentace Microsoft Learn k 22. 11. 2026, v labu nezkoušeno)

- **Microsoft 365 Copilot APIs** (Graph `/copilot`): vyžadují Copilot licenci pro uživatele; Chat API je preview, vrací jen text, nepodporuje soubory ani obrázky;
  Retrieval API vrací úryvky z SharePointu (limit 200 požadavků/uživatel/hodinu), pro uživatele bez licence existuje PAYG (preview, 0,10 USD/volání, vyžaduje Azure subscription).
  Není to obecný „prompt → LLM“ endpoint. [přehled](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/copilot-apis-overview),
  [Chat API](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/ai-services/chat/overview),
  [Retrieval PAYG](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/ai-services/retrieval/paygo-retrieval).
  ❓ Že SPFx smí tato API volat přes `AadHttpClient`, dokumentace výslovně neříká (technicky Graph s delegovaným tokenem).
- **SharePoint Premium** (dříve Syntex): per-user licence se už neprodává, jen pay-as-you-go **přes aktivní Azure subscription**
  (OCR 0,001 USD/stránka, image tagging 0,001 USD, autofill 0,005 USD/transakce, prebuilt zpracování 0,01 USD/stránka, strukturované 0,05 USD/stránka).
  Funguje jako služba nad knihovnou (OCR se spouští při nahrání), veřejné REST API pro spuštění ze SPFx jsme nenašli.
  [PAYG ceny](https://learn.microsoft.com/en-us/microsoft-365/documentprocessing/syntex-pay-as-you-go-services),
  [licencování](https://learn.microsoft.com/en-us/microsoft-365/documentprocessing/syntex-licensing),
  [OCR](https://learn.microsoft.com/en-us/microsoft-365/documentprocessing/ocr-overview). ❓ Co z toho je v E5 zdarma: stránky neříkají, nic jsme nenašli.
- **Copilot Chat / SharePoint agenti**: Copilot Chat je zdarma pro uživatele Entra, agenti se měří a vyžadují Azure; ❓ programové volání z SPFx jsme nenašli.
- Dílčí závěr (📘, ne měření): podle dokumentace A dává uživateli Copilota v UI, ne službu pro appku, takže cíl „bez Azure“ se u LLM a OCR pravděpodobně nenaplní. Absence veřejného API pro SPFx je z „nenašli jsme“, tedy slabý důkaz; viz „Neověřeno“.

### Cesta B1 v detailu (📘 mezistav, v labu neměřeno; měřená varianta B2 je výš)

- **AI Builder** se od 1. 11. 2026 u nových a obnovených licencí nedodává se seeded kredity; nový zákazník kupuje Copilot Credits.
  Sazby (1 kredit = 0,01 USD PAYG): text recognition 0,1 kreditu/stránka, receipt/invoice/doklad 8 kreditů/stránka (0,08 USD),
  prompt basic/standard/premium 0,1 / 1,5 / 10 kreditu za 1000 tokenů, image description 8 kreditů/obrázek.
  Vyžaduje prostředí Power Platform s Dataverse. Flow s AI Builder akcí je **Premium** (a při PAYG se navíc účtuje běh flow).
  [konec AI Builder kreditů](https://learn.microsoft.com/en-us/ai-builder/endofaibcredits), [licencování a sazby](https://learn.microsoft.com/en-us/ai-builder/administer-licensing).
- **Seeded Power Automate z M365 (E5)**: jen standardní konektory, 6000 akcí/den/uživatel; Premium a custom konektory ne
  ([deep dive](https://learn.microsoft.com/en-us/power-platform/admin/power-automate-licensing/deep-dive-on-specific-license)).
- **Jak SPFx flow spustí**: (1) SPFx zapíše položku do seznamu, standardní trigger SharePointu („When an item is created“) spustí flow, ten výsledek zapíše zpět
  (u standardních akcí bez Premium; jakmile je uvnitř AI Builder, je Premium); (2) „When an HTTP request is received“ z `AadHttpClient` (PnP sample ✅ existuje; že je to Premium,
  oficiální stránka neříká, v tomto tenantu ✅ „HTTP s Entra ID“ = Premium, viz ppf-rooms). ❓ „Power Apps trigger“ ze SPFx nepotvrzen.
- **Copilot Studio**: z SPFx jde volat agenta přes Direct Line (token endpoint) nebo Microsoft 365 Agents SDK (delegované `CopilotStudio.Copilots.Invoke`); web chat embed jen bez autentizace.
  Balík 25 000 kreditů ≈ 200 USD/měsíc (z licenčního průvodce, ne z přímo načtené stránky). [licencování](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing).
- Srovnání ceny jednoho promptu (1,9k tokenů) je **odhad z 📘 sazeb**, ne měření: AI Builder basic ≈ 0,002 USD, standard ≈ 0,029 USD, premium ≈ 0,19 USD; gateway s `gpt-4.1-mini` ≈ 0,0012 USD (výpočet z ceníku; změřené jsou jen jednotkové ceny v sekci Ceny).
  U OCR vychází B (0,001 USD/stránka) srovnatelně s Document Intelligence Read (0,0015 USD/stránka).

## Sonda 1: Azure OpenAI a Document Intelligence v labu

| Co | Výsledek |
|---|---|
| Registrace poskytovatele | `Microsoft.CognitiveServices` nebyl v subscription registrovaný; `az provider register` stačil (1 minuta) ✅ |
| Azure OpenAI | účet `aoai-egd-sonda-ai` (swedencentral, S0, vlastní subdoména), **žádná žádost o přístup k modelům nebyla potřeba** ✅ |
| Chat model | `gpt-4.1-mini` (2025-04-14), **Global Standard**, kapacita 50 (= 50 000 tokenů/min, jen strop, platí se za tokeny) ✅ |
| Dostupnost modelů ve swedencentral (`az cognitiveservices model list`) ✅ | `gpt-4o-mini`, `gpt-4.1-mini/nano`, `gpt-5-mini/nano`, `gpt-5.4-mini/nano` (Global Standard i DataZone EU u části), obrazové `gpt-image-1`, `-1-mini`, `-1.5`, `-2`, `-2-flare`, `-2.5-*` |
| **Kvóta obrazových modelů** ✅ | `az cognitiveservices usage list`: **všechny** `gpt-image-*` a `MAI-Image-*` mají limit **0** → nasazení končí `InsufficientQuota`. Generování obrázků vyžaduje žádost o kvótu u Microsoftu. |
| Document Intelligence | `di-egd-sonda-ai`, **F0** (500 stran/měsíc zdarma 📘), API `2024-11-30` ✅ |
| Přístup | role `Cognitive Services OpenAI User` / `Cognitive Services User` pro managed identitu gateway; ani vlastník subscription nemá data-plane právo, dokud si roli nepřiřadí (PermissionDenied na `chat/completions/action`) ✅ |
| Region / data | Global Standard může zpracovat data kdekoli; pro EU existuje `DataZoneStandard` (např. `gpt-4.1-mini`, `gpt-5-mini`), cena +10 % 📘 |

Další lab omezení, na která jsme narazili (platí i pro plánování u E.ON) ✅:

- **ACR Tasks jsou zakázané** (`TasksOperationsNotAllowed`), `az acr build` nejde; image se buildí lokálně (`docker buildx --platform linux/amd64`) a pushuje.
- **Container Apps env: v subscription smí být jen jedno** (`MaxNumberOfGlobalEnvironmentsInSubExceeded`), `westeurope` nově nepřijímá zákazníky
  (`RequestDisallowedByAzure`). Gateway proto běží ve **sdíleném env** `ca-ppf-rooms-env` (swedencentral), vlastní Container App v rg-egd-sonda-ai.

## Sonda 2: gateway jako Container App

```
SPFx web part ──AadHttpClient (token uživatele, scope api://<API>/Gateway.Use)──▶ Container App ca-egd-llm-gateway (min 0 replik)
                                                    │ Easy Auth (Entra, v2 tokeny, 401 bez tokenu; /healthz bez přihlášení)
                                                    │ kód: scope Gateway.Use (uživatel) nebo role Gateway.App (aplikace);
                                                    │      X-App-Id musí být v registru; kvóta tokenů/den na (uživatel, appka) v Table Storage
                                                    ├─ MI → Azure OpenAI /openai/v1/chat/completions (gpt-4.1-mini)
                                                    ├─ MI → Document Intelligence (prebuilt-read | layout | invoice | receipt)
                                                    └─ log JSON {user, oid, client, appKey, endpoint, model, tokens, pages, costUsd, ms} → Log Analytics
```

Kód: `sondy/ai/gateway/server.mjs` (Node 22, **žádné npm závislosti**, ~170 řádků), `Dockerfile`. Endpointy: `GET /api/whoami`, `GET /api/kvota`,
`POST /api/chat` (text nebo `messages` s `image_url` pro vision), `POST /api/ocr` (`base64`, `model`), `POST /api/image` (501, dokud není kvóta).
Žádný klíč v kódu ani v proměnných prostředí: tokeny modelu a tabulky bere z identity kontejneru (`IDENTITY_ENDPOINT`).
Konfigurace (ceny, registr appek a kvóty) jsou proměnné prostředí kontejneru, v kódu žádné výchozí hodnoty. Lab hodnoty (kvóta 200 000 tokenů/den, `demo` 50 000) jsou **jen pro sondu**.

### Měření (✅ 22. 11. 2026, klient v Praze, region swedencentral; logy viz [overeni/](overeni/README.md), kde chybí, je u řádku „běh ❓ neuložen“)

Uložený log [probe-2026-11-22.out](overeni/ai/probe-2026-11-22.out) potvrzuje: bez tokenu 401 (0,18 s), whoami 0,24 s (UPN, scope `Gateway.Use`, `azp`), kvóta, chat 1,1 s, vision 2,7 s, OCR `prebuilt-read` 1,2–2,7 s (0,0015 USD). Časy v tabulce níž jsou původní opis; kde se liší, platí log. Kvóta 429, 403 u neznámého `X-App-Id`, layout a audit v Log Analytics mají zatím jen opis (běh ❓ neuložen).

| Test | Výsledek |
|---|---|
| Bez tokenu `GET /api/whoami` | 401 (Easy Auth), 0,16 s |
| Token pro **jiný zdroj** (Graph) | 401 |
| Delegovaný token přes `az account get-access-token --scope api://<API>/Gateway.Use` (az CLI předautorizovaný na scope) | `aud`=API, `scp`=Gateway.Use, `azp`=Azure CLI, uživatel v `preferred_username` ✅ |
| Chat, teplá replika | 1,2–1,7 s od klienta (z toho model ~0,5–0,8 s), 45–110 tokenů, **0,00005–0,00015 USD** |
| Vision (obrázek 900×420, přepis textu) | 2,2 s, 681 vstupních + 85 výstupních tokenů, **0,0004 USD** |
| OCR `prebuilt-read`, 1 strana | 1,1–1,3 s, **0,0015 USD**, text přečten celý (faktura s IČO, datem, částkou) |
| `prebuilt-layout` | 1,6 s, 0,01 USD/stránka (cena z ceníku, ne z faktury) |
| Kvóta: appka `tiny` s limitem 60 tokenů | 1. volání 200, 2.–3. volání **429** „Denní kvóta tokenů vyčerpána (69/60)“; `GET /api/kvota` ukáže spotřebu |
| Neznámý `X-App-Id` | 403 |
| Generování obrázku | 501 (kvóta modelu 0) |
| Audit | JSON řádek na každé volání je v Log Analytics (tabulka `ContainerAppConsoleLogs_CL`); ✅ dotaz vrátil uživatele, appKey, tokeny, cenu, ms |
| **Studený start** (scale-to-zero, po ~5 min bez provozu; `min-replicas 0`) | **kolem 30 s** (naměřeno 30,1 s pro první volání po nečinnosti, potom 6,6 s a 0,2–0,4 s; ✅ [studeny-start](overeni/ai/studeny-start-2026-11-22.txt); původní opis 26 s), tj. start repliky, stažení image z ACR, první token MI a čtení tabulky. Pro interaktivní appku je to příliš: `min-replicas 1` (≈ 8 USD/měsíc) nebo UI „probouzím…“ |
| První volání po nasazení | původně pozorováno 502 `internal_server_error` z modelu, druhé prošlo. Na čistém nasazení ([502-opakovani](overeni/ai/502-opakovani-2026-11-22.log)) se **502 nezopakovalo**: +0 s **503** z ingressu (replika ještě není ready, 0,6 s), +30 s 200 (9,7 s), +60/120/240 s 200 (0,8–1,0 s) ✅. Příčina původního 502 („propagace rolí MI“) je **❓ neprokázána** (ani nevyvrácena); do postupu patří rozehřívací volání a počítat s jedním 5xx |

### Co se při měření ukázalo (důležité pro návrh)

1. **SPFx appky se podle tokenu nerozliší.** Token z SPFx nese `azp = 08e18876-6177-487e-b8b5-cf950c1e598c` („SharePoint Online Web Client Extensibility“),
   stejný pro všechny SPFx appky v tenantu ✅ (viděno v `whoami` z web partu). „Aplikační klíč“ nejde odvodit z `azp`. Možnosti: (a) hlavička `X-App-Id` z web partu
   (účetní štítek, kdo má SPFx nasazení, může poslat cokoli, **není to bezpečnostní hranice**); (b) vlastní scope na jednu API registraci pro každou appku (`App.Podnety`, `App.Revize`),
   kvóta podle `scp`; grant je ale tenant-wide pro SPFx principal, takže si scope může vyžádat každý balíček; (c) vlastní API registrace pro každou appku
   (admin schvaluje zvlášť). **Ověřena (✅) je jen varianta (a); (b) a (c) jsou popsané, v labu neměřené ❓.** Srovnání:

   | Varianta | Ověřeno | Pro | Proti | Co chce IT E.ON | Náročnost pro citizen developera |
   |---|---|---|---|---|---|
   | (a) `X-App-Id` | ✅ | nic navíc, kvóta a log na štítek | nic nebrání podvržení štítku | nic navíc | nízká |
   | (b) scope na appku | ❓ | kvóta podle `scp`, vynutí to token | grant je tenant-wide, scope si může vyžádat každý balíček; admin schvaluje každý scope | schválení scope na appku | střední |
   | (c) API registrace na appku | ❓ | nejlepší oddělení | admin schvaluje každou zvlášť, víc registrací ke správě | registrace a souhlas na appku | vysoká |

   Pro 10 interních appek by podle popisu mohlo stačit (a); (b) k tomu přidat až po ověření (stojí na ❓), takže „(a)+(b) stačí“ je zatím jen návrh. Cíl je rozpočet a odpovědnost, ne obrana proti zlému vývojáři v tenantu.
2. **Kdo smí gateway volat** řeší Entra, ne gateway: souhlas správce je pro všechny uživatele (`AllPrincipals`), takže token získá každý v tenantu. Omezení na skupinu:
   `appRoleAssignmentRequired` na service principalu API + přiřazení skupiny (✅ [appRoleAssignmentRequired-log](overeni/ai/appRoleAssignmentRequired-2026-11-22.log): při `required=true` a čerstvých ROPC tokenech **nepřiřazený uživatel token nedostane, `AADSTS50105`**, přiřazený projde; omezení tedy funguje na straně Entra, ne jako 403 z gateway; přiřazení skupinou vyžaduje Entra P1 ❓, v E5 je; dřívější pokus byl neprůkazný kvůli cache tokenů).
3. **Kvóta v Table Storage byla neatomická (v1/v2), od gateway v3 je atomická ✅**: zápis přes `If-Match`/ETag (při 412 se čte znovu) a rezervace `max_tokens` před voláním modelu. 12 souběžných volání na `tiny`: 2× 200 + 10× 429, zapsáno = vráceno (kvóta 35 → 69 = 35 + 34 tokenů); na `demo` 12× 200, součet 213 tokenů = zapsáno 213. Důkaz: [gateway-atomicita](ms-llm/gateway-atomicita/README.md) (č. 5, 6). ❓ jen dlouhá zátěž (desítky volání, 503 po 20 pokusech).
4. **Aplikační volající** (Power Automate, Container Apps Job, jiný server) mají jít přes aplikační roli `Gateway.App` (client credentials); větev v kódu je, v sondě ❓ **neotestovaná** (viz „Neověřeno“; je to cesta pro Power Automate i Container Apps Job).
5. **Rozdělení odpovědnosti**: gateway ví jen tokeny a cenu; obsah promptů nelogujeme (jen metadata).

## Sonda 3: SPFx web part a schválení API přístupu

Web part `sondy/ai/spfx/` (SPFx 1.23.2, Heft, bez Reactu, `requiresCustomScript: false`): tlačítka whoami / Chat / OCR souboru, volá gateway přes
`context.aadHttpClientFactory.getClient(apiAppId)` a `AadHttpClient.configurations.v1`, hlavičku `X-App-Id` bere z vlastnosti web partu.
`package-solution.json`: `webApiPermissionRequests: [{ resource: "<appId API>", scope: "Gateway.Use" }]`, `skipFeatureDeployment: false` (appka je dostupná jen na webech, kam se nainstaluje).

| Krok | Výsledek |
|---|---|
| Web `/sites/egd-sonda-ai`, nasazení do tenant catalogu, instalace **jen na tento web** | ✅ |
| Žádost o API přístup se objeví u SharePoint adminu | ✅ (`m365 request` na `ProcessQuery` seznam žádostí ukázal „Gateway.Use“ od balíčku `egd-ai-gateway`) |
| **Schválení standardním příkazem** `m365 spo serviceprincipal permissionrequest approve` | ❌ „The service principal for permission request egd-ai-gateway could not be found“, i po přidání tagu `WindowsAzureActiveDirectoryIntegratedApp` na SP a při `resource` jako název i jako appId. Doměřeno ([overeni/api-access](overeni/api-access/), README oddíl 2): chyba přichází **ze SharePointu** (server), CLI je jen obálka (totéž vrací přímé CSOM `Approve`); tag na SP ani tvar `resource` (appId / název / objectId) nepomáhá ✅. **Obejití Graph `oauth2PermissionGrant` ✅** (`tools/ai-spfx-api-grant.sh`, [log 16](overeni/api-access/16-graph-grant-testovaci-api.log)). **UI SharePoint admin centra (Advanced → API access) ✅ změřeno 23. 11. pod Global Adminem `pavel.admin` (nový scope `Test.Write`): Pending 5 → 4, Approved 61 → 62, drží po reloadu; vznikl Graph grant, tj. UI schválení = grant v Graphu, stejný mechanismus jako fallback `tools/ai-spfx-api-grant.sh`** ([README oddíl 2](overeni/README.md), `overeni/api-access/ui-4/`). **Doporučení: UI jako hlavní cesta, Graph grant jako fallback.** CLI/CSOM `approve` selhává dál, příčina rozdílu CLI × UI ❓. Šlo o rozšíření už existujícího grantu (síťově Graph PATCH 204 + Deny žádosti 204), ❓ první grant pro API bez grantu (POST) a ❓ zda stačí role SharePoint admin (měřeno pod Global Adminem); `ui/` a `ui-3/` neplatné (host `#ext#`).; příčina chyby lookupu SP ❓ nevyřešena (možná stav lab tenantu), v E.ON zkusit „Approve“ hned první den, fallback Graph grant. |
| Schválení přes Graph `oauth2PermissionGrant` pro principal SPFx (`consentType: AllPrincipals`, scope `Gateway.Use`) | ✅ to je totéž, co schválení dělá; `tools/ai-spfx-api-grant.sh` |
| Stránka s web partem otevřená v prohlížeči jako lab uživatel `tomas.prochazka` (headless Chrome, uložený profil) | ✅ `whoami` 257 ms, chat 0,85–0,9 s, OCR 1,0 s; `upn`=Tomáš, `scopes`=[Gateway.Use], `clientAppId`=SPFx principal |
| **CORS** | bez nastavení `Failed to fetch` ✅; po `az containerapp ingress cors enable --allowed-origins https://<tenant>.sharepoint.com` (+ headers `authorization content-type x-app-id`) preflight 200 a volání prochází ✅. Easy Auth CORS preflight neblokuje, vyřizuje ho ingress. |
| Past: stránka je prázdná | `spo page add --publish` publikuje prázdnou stránku; po přidání web partu je nutné **znovu `spo page set --publish`**, jinak se web part nevykreslí ✅ |

## APIM jako AI gateway: které politiky umí Consumption (✅ změřeno)

V labu jsem založil prázdnou APIM **Consumption** `apim-egd-sonda-ai` (rg-egd-sonda-ai; 1 mil. volání zdarma, pak 3,50 USD/mil. 📘) a zkoušel ukládat politiky na API (uložení politiku validuje).
Skript `sondy/ai/apim-policy-test.sh`; výstup běhu: [apim-policy-test-2026-11-22.out](overeni/ai/apim-policy-test-2026-11-22.out) ✅ (odmítnutí při uložení potvrzeno; přijetí při uložení neznamená, že politika za běhu funguje ❓).

| Politika | Consumption |
|---|---|
| `llm-token-limit`, `azure-openai-token-limit` | ❌ „Policy is not allowed in 'Consumption' sku“ |
| `rate-limit-by-key`, `quota-by-key`, `quota` | ❌ totéž |
| `rate-limit` | ✅ uložení projde |
| `llm-emit-token-metric`, `azure-openai-emit-token-metric` | ✅ uložení projde (uložení ≠ funkce za běhu ❓); **runtime neměřen ❓** (dokumentace si protiřečí, vyžaduje Application Insights logger) |
| `llm-semantic-cache-lookup` | ✅ uložení projde (uložení ≠ funkce za běhu ❓); **runtime neměřen ❓** (vyžaduje externí Redis a embeddings backend 📘) |
| `validate-azure-ad-token`, `validate-jwt`, `authentication-managed-identity` | ✅ uložení projde (uložení ≠ funkce za běhu ❓) |

Závěr (✅ změřeno): **APIM Consumption není kandidát na AI gateway, nelze na něm postavit limit tokenů ani kvótu na klíč**, což je hlavní důvod, proč by člověk APIM před LLM chtěl. Token limit vyžaduje Basic v2 / Standard v2 / klasické tiery
(📘 [llm-token-limit](https://learn.microsoft.com/en-us/azure/api-management/llm-token-limit-policy); Basic v2 ≈ 150 USD/měsíc, Standard v2 ≈ 700 USD/měsíc jsou 📘 přepočet z hodinové sazby 0,205 / 0,959 USD v Retail Prices API, ne z labu; tier v2 jsme
z důvodu trvalého nákladu nezakládali ❓, ověřit jde zřízením s okamžitým smazáním po výslovném ano). Proto v naší gateway kvótu děláme v kódu. Pokud E.ON APIM už má, dá se gateway dát za něj (APIM → Container App) a kvóty
nechat tam; naopak založit APIM jen kvůli tomu se pro 10 appek nevyplatí.

## Ceny

Jednotkové ceny (📘 Azure Retail Prices API, USD, k 22. 11. 2026; stránky azure.microsoft.com ukazují „$-“): `gpt-4.1-mini` Global 0,40 / 1,60 za 1 M vstupních / výstupních tokenů,
`gpt-5-mini` 0,25 / 2,00, `gpt-5-nano` 0,05 / 0,40; Document Intelligence Read 1,50 za 1000 stran (prebuilt/layout 10 za 1000), F0 500 stran zdarma; ACR Basic ≈ 5 USD/měsíc;
Container Apps Consumption 0,000034 USD/vCPU-s aktivní, 0,000004 idle, 0,000004 GiB-s, 0,56 USD/mil. požadavků (❓ free grant v API nebyl, ověřit v ceníku);
`gpt-image-1` 40 USD za 1 M výstupních tokenů obrazu (cenu za obrázek jsme nenašli ❓).

**Změřená je jen jednotková cena** (ne měsíční součet); scénáře níže jsou výpočet z 📘 ceníku a odhadu počtu volání. **Změřeno v sondě**: chat 0,00005–0,00015 USD, vision 0,0004 USD, OCR 0,0015 USD/stránka (celková spotřeba sondy je pod 1 USD; Cost Management má zpoždění, nepotvrzeno fakturou ❓).

**Měsíc pro ~10 appek** (předpoklad: průměrné volání 1 500 vstupních + 400 výstupních tokenů, 21 pracovních dní; počty volání jsou **odhad, ne měření**, EG.D je zná lépe):

| Scénář | Volání/měsíc | `gpt-4.1-mini` | `gpt-5-nano` | + OCR Read | Pevné (ACR, storage, logy, Container App scale-to-zero) | Celkem |
|---|---|---|---|---|---|---|
| Lehký: 10 appek × 20 uživatelů × 5 volání/den | 21 000 | 26 USD | 5 USD | 2 000 stran = 3 USD | ≈ 7 USD | **≈ 35 USD** (mini), ≈ 15 USD (nano) |
| Střední: 10 appek × 100 uživatelů × 10 volání/den | 210 000 | 260 USD | 49 USD | 20 000 stran = 30 USD | ≈ 7 USD | **≈ 300 USD** (mini), ≈ 85 USD (nano) |

Pevná část bez studeného startu: ≈ 5 USD ACR + ≈ 2 USD ostatní. S `min-replicas 1` (bez studeného startu) přibude ≈ 8 USD/měsíc (0,25 vCPU, 0,5 GiB, idle sazba, výpočet z ceníku).
**Cenu určuje model a počet tokenů, ne infrastruktura**: nano je ~5× levnější než mini (poměr z ceníku 📘). `gpt-5-*` jsou reasoning modely, skryté tokeny úvah zvyšují výstup ❓ (neměřeno).
Srovnání s B1: stejných 210 000 promptů přes AI Builder „standard“ ≈ 6 000 USD (0,029 USD/prompt), „basic“ ≈ 400 USD; plus Premium licence Power Automate. **Je to odhad** ze sazby 📘, žádné měření; B2 (Foundry konektor) se cenově chová jako přímé volání modelu, ale měsíční součet neměřen ❓.

## Co EG.D potřebuje od IT E.ON

| Co | Proč | Kdo |
|---|---|---|
| **Azure subscription** (nebo resource group) s právy Contributor + přiřazování rolí (nebo IT roli přiřadí) | Azure OpenAI, Document Intelligence, Container App, ACR, Storage | Azure admin |
| Poskytovatelé `Microsoft.CognitiveServices`, `Microsoft.App`, `Microsoft.ContainerRegistry`, `Microsoft.OperationalInsights` | v lab subscription nebyl první | Azure admin |
| **Entra: registrace API** (scope `Gateway.Use`, role `Gateway.App`, identifier URI) a service principal s tagem `WindowsAzureActiveDirectoryIntegratedApp` | token pro `AadHttpClient`, Easy Auth | Entra admin / vývojář s právem registrací |
| **Admin: schválení API access** (SharePoint admin centrum) pro `webApiPermissionRequests` | bez něj SPFx žádný token na gateway nedostane; schvaluje se jednou na scope, platí pro celý tenant | admin E.ON: změřeno ✅ jen Global Admin (UI i Graph), zda stačí role SharePoint admin ❓ |
| Rozhodnutí o **datech**: Global Standard (zpracování kdekoli) vs **DataZone EU** (+10 %), smlouva/DPA k Azure OpenAI, zda smí do modelu dokumenty a osobní údaje | právní a bezpečnostní schválení | bezpečnost / právní |
| **Síť:** odchozí HTTPS z prohlížečů na adresu gateway (`*.azurecontainerapps.io` nebo vlastní doména), případně výjimka na proxy | SPFx volá z prohlížeče | síť |
| **CORS** na gateway pro origin `https://<tenant>.sharepoint.com` | bez něj `Failed to fetch` | my (skript) |
| **Kvóta obrazových modelů** (`gpt-image-*` jsou v lab subscription 0) | generování obrázků | žádost u Microsoftu přes subscription |
| (volitelně) omezení, kdo smí gateway volat: skupina + `appRoleAssignmentRequired` | souhlas správce je pro všechny uživatele | Entra admin |
| (volitelně) Conditional Access, Private Link, vlastní doména + WAF | pokud to politika E.ON vyžaduje; Private Link by SPFx z prohlížeče stejně neprošel mimo VPN ❓ | síť / bezpečnost |

**⛔ Jen v E.ON (v labu neověřitelné):** schválení API access skutečným SharePoint adminem E.ON (v labu UI Approve ✅ pod Global Adminem, `overeni/api-access/ui-4/`; Graph grant jako záloha), politiky E.ON (Conditional Access, proxy a odchozí HTTPS z E.ON prohlížečů na `*.azurecontainerapps.io`, Private Link mimo VPN ❓), právní schválení DPA k Azure OpenAI a zpracování osobních údajů, volba Global Standard vs DataZone EU. Jak ověřit: test z E.ON zařízení (volání `whoami`/`chat` z web partu na E.ON tenantu), dotaz na IT E.ON, a u schválení API access zkouška v UI SharePoint admin centra (v labu UI approve ✅ pod Global Adminem, viz ui-4; u E.ON ⛔ ověřit první den, fallback Graph grant).

## Neověřeno (mezistav, každé s důvodem a návrhem ověření)

| Tvrzení | Důvod, že není ověřeno | Návrh ověření |
|---|---|---|
| Cesta A (bez Azure) pro LLM/OCR nejde; Copilot Chat API „preview, jen text“; SharePoint Premium nemá API pro SPFx; zda je něco zdarma v E5 | jen 📘 a „nenašli jsme“ (slabý důkaz absence); v labu nejsou Copilot licence pro volání API | zkusit volání Graph `/copilot` v tenantu s Copilot licencí (v labu je 1 licence Business Premium + Copilot, viz 03-lab.md), zkusit SharePoint Premium přes Azure subscription |
| SPFx smí volat Copilot API přes `AadHttpClient`; „Power Apps trigger“ ze SPFx; Direct Line z SPFx | bez pokusu | jednoduchý web part, který volá Graph `/copilot` a Direct Line |
| Varianty (b) a (c) identifikace appky | jen popsané | scope na appku v labu, kvóta podle `scp` |
| Omezení **skupinou** (přiřazení skupiny místo jednotlivců) | ✅ ověřeno pro jednotlivce (`AADSTS50105`); skupina vyžaduje Entra P1 ❓ | přiřadit skupinu a zopakovat |
| Aplikační volající `Gateway.App` (client credentials) | větev v kódu neotestovaná | získat token client credentials, zavolat `chat`; potřebné pro Power Automate a Container Apps Job |
| 502 z modelu při prvním volání po nasazení, příčina „propagace rolí“ | na čistém nasazení se nezopakovalo (503 z ingressu +0 s, pak 200), příčina ❓ neprokázána | opakovat čisté nasazení vícekrát přes `tools/ai-gateway-deploy.sh` s okamžitým voláním |
| Příčina, proč `approve` selhává (CLI), a UI approve | CLI `approve` selhává ze strany SharePointu (✅), UI approve ✅ (`overeni/api-access/ui-4/`) | zkusit v E.ON tenantu první den; fallback Graph grant `tools/ai-spfx-api-grant.sh` |
| `llm-emit-token-metric` runtime, semantic cache, APIM v2 tiery (150 / 700 USD) | jen uložení politiky, v2 tier nezaložen | ověřit zřízením s okamžitým smazáním (po výslovném ano) |
| Měsíční náklad, reasoning tokeny `gpt-5-*`, cena za obrázek `gpt-image-1` | jen jednotkové ceny z ceníku | porovnat s fakturou v Cost Management po týdnu provozu |
| ~~Kvóta v Table Storage není atomická~~ opraveno v gateway v3 | ✅ souběžný test 12 volání, [gateway-atomicita](ms-llm/gateway-atomicita/README.md) | dlouhá zátěž (desítky volání) ❓ |
| OCR/vision přes Foundry konektor ve flow (B2), AI Builder v labu | nezkoušeno; AI Builder nemá v prostředí konektor | zkusit akci s obrázkem; AI Builder chce Dataverse + kredity |
| Kvóta obrazových modelů | v lab subscription 0 | žádost o kvótu u Microsoftu |

## Doporučení

Doporučení stojí jen na ✅ měřeném (gateway C, B2); body, kde záleží na 📘/❓ (cesta A, B1, varianty identifikace appky), jsou výš v „Neověřeno“.

1. **Jedna sdílená gateway**, spravovaná CoE/IT (ne gateway v každé appce). Appky ji volají `AadHttpClient`, hlavičkou `X-App-Id` říkají, kdo jsou; kvóty a logy jsou na jednom místě.
2. `min-replicas 1` (≈ 8 USD/měsíc), jinak má první volání po pauze kolem 30 s. Začít s `gpt-4.1-mini` (jediný model v labu skutečně změřený); `gpt-5-nano` a DataZone EU jsou jen 📘 z ceníku, nezkoušeno ❓ (kvalita češtiny a reasoning tokeny neměřeny), OCR Document Intelligence `prebuilt-read`; obrázky řešit až po získání kvóty.
3. Pro appky bez Azure jsme pro LLM v labu žádnou funkční cestu nenašli (A je 📘 a neověřená); B1 (AI Builder) vychází podle sazeb 📘 řádově dráž a chce Premium, B2 (Power Automate + Foundry) funguje, ale bez kvóty na appku a auditu na uživatele.
4. APIM Consumption není kandidát (✅); APIM před gateway jen pokud ho E.ON už má v tieru s `llm-token-limit`.
5. Než se to dá do provozu: (atomická kvóta ✅ hotová v gateway v3), omezení volajících skupinou, test aplikační role, měření skutečných nákladů z faktury.

## Pasti

- První volání po nasazení původně skončilo 502 z modelu, na čistém nasazení se nezopakovalo (503 z ingressu v +0 s, 200 od +30 s; příčina ❓ neprokázána): po nasazení udělat rozehřívací volání a počítat s jedním 5xx; studený start repliky trvá kolem 30 s.
- Easy Auth: `--excluded-paths` bere jednu hodnotu bez JSON (`/healthz`), JSON pole se uloží jako jeden řetězec.
- Bez tagu `WindowsAzureActiveDirectoryIntegratedApp` na service principalu API nemusí SharePoint API najít (příčinu selhání schválení jsme nedohledali).
- Easy Auth se musí nastavit na issuer `https://login.microsoftonline.com/<tenant>/v2.0` a registrace API na `requestedAccessTokenVersion: 2`.
- Container Apps v sdíleném env ukládají logy do **workspace toho env**, ne do workspace vytvořeného pro sondu (ten zůstal prázdný).
- Test OCR s češtinou: `Částka k úhradě: 12 345,00 Kč Příliš žluťoučký kůň úpěl ďábelské ódy Řezníkův závod` přečteno bez chyby (Read 1,0 s) i vision modelem ✅ (`sondy/ai/ocr-cs.png`). Zkoušeno jen na vygenerovaném obrázku, ne na skutečné faktuře ani PDF.
- Test omezení volajících: první pokus byl neprůkazný (tokeny v cache). Opakování s čerstvými tokeny ✅ ([log](overeni/ai/appRoleAssignmentRequired-2026-11-22.log)): nepřiřazený uživatel dostane `AADSTS50105`, token se nevydá; vráceno na `false`.

## Vytvořené zdroje (lab subscription 05a636d8…, vše `ucel=egd-workshop`)

| Zdroj | Poznámka |
|---|---|
| RG `rg-egd-sonda-ai` (swedencentral) | |
| Azure OpenAI `aoai-egd-sonda-ai` + nasazení `gpt-41-mini` (GlobalStandard, 50) | platí se jen za tokeny |
| Document Intelligence `di-egd-sonda-ai` (F0) | zdarma |
| ACR `acregdsondaai` (Basic) | **≈ 0,17 USD/den trvale** |
| Storage `stegdsondaai` (tabulka `kvota`) | centy |
| Log Analytics `log-egd-sonda-ai` | prázdný (viz Pasti) |
| Container App `ca-egd-llm-gateway` (min 0 replik) ve sdíleném env `ca-ppf-rooms-env`; image `egd-llm-gateway:v1,v2` | |
| APIM Consumption `apim-egd-sonda-ai` + API `politiky` s poslední zkoušenou politikou | 1 mil. volání zdarma |
| Entra: aplikace `EGD sonda AI gateway` (appId `7b59591a-0058-4799-be76-0d1f5b79ca95`), SP s tagem, `oauth2PermissionGrant` SPFx principalu → `Gateway.Use` | |
| SharePoint: web `/sites/egd-sonda-ai`, stránka `ai.aspx`, balíček `egd-ai-gateway` v tenant catalogu (+ dvě nevyřízené žádosti o API access, jedna od verze 0.1.0 s názvem, jedna od 0.1.1 s appId); `tomas.prochazka` přidán do Visitors | |
| Registrace poskytovatele `Microsoft.CognitiveServices` v subscription | |

Nic nesmazáno. Gateway URL: `https://ca-egd-llm-gateway.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io`.

## Znovupoužitelné nástroje

| Nástroj | Co dělá |
|---|---|
| `tools/ai-gateway-deploy.sh` | postaví celou gateway (AOAI, Document Intelligence, storage, ACR, image, Entra API, Container App, Easy Auth, CORS, role); `--help`; z ručního běhu přepsané, jako celek neběželo |
| `tools/ai-gateway-probe.sh` | volá gateway delegovaným tokenem z `az`: `whoami`, `kvota`, `chat`, `vision`, `ocr`, `image`, měří HTTP kód a latenci |
| `tools/ai-spfx-deploy.sh` | `.sppkg` do tenant catalogu, install/upgrade na web, stránka s web partem a **publikace** |
| `tools/ai-spfx-api-grant.sh` | souhlas správce pro SPFx → vlastní API přes Graph (náhrada za selhávající `permissionrequest approve`) |
| `tools/ai-spfx-klik.mjs` | otevře stránku s web partem pod uloženým Chrome profilem lab uživatele a klikne whoami/chat/OCR |
| `tools/ai-gateway-chyby.sh` | vyvolá chybové stavy gateway (401, 403 neznámá appka, 429 malý limit, CORS z cizího originu); `--help` ✅ existuje, běh ❓ neuložen (do `tools/README.md` doplní hlavní session) |
| `tools/ai-appka-klik.mjs` | otevře stránku appky pod uloženým Chrome profilem, klikne a uloží `klik.json` + screenshoty, volitelně CORS test z cizího originu (`--help` ✅; do `tools/README.md` doplní hlavní session) |
