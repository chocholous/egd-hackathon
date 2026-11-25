# Integrace a LLM gateway: co víme a co otestovat

Otázka: dokážeme SharePoint (SPFx) appku spojit s jinými systémy přes Power Apps / Power Automate
nebo přes Azure Container Apps, a udělat v Container App LLM gateway pro SharePoint?

Značky: ✅ změřeno v labu · 📘 dokumentace Microsoft · ❓ neověřeno · ⛔ v labu neověřitelné (důvod u položky) ·
🔀 víc funkčních variant (všechny uvedeny, doporučení až po nich). 📘 a ❓ jsou jen mezistav, ne podklad doporučení
(kánon v [CLAUDE.md](CLAUDE.md)). Podrobnosti a důkazy jsou v sondách, tady se fakta neduplikují:
[sondy/ai.md](sondy/ai.md), [sondy/napojeni.md](sondy/napojeni.md), [sondy/data-prava.md](sondy/data-prava.md),
[sondy/dokumenty.md](sondy/dokumenty.md), [sondy/power-automate.md](sondy/power-automate.md).
Stav k 22. 11. 2026. Funkce, které potřebují vlastní server, jsou v [10-container-app.md](10-container-app.md).

**Závislost na trialu lab tenantu (platí pro všechno níž).** Trial Microsoft 365 E5 v labu končí **25. 11. 2026 v 04:04**,
tedy před workshopem (12:30); Business Premium + Copilot trial končí 25. 11. v 09:31, Agent 365 v 11:37 ([07-lab-trial-plan.md](07-lab-trial-plan.md)).
Všechny ✅ běhy Power Automate (Standard konektory, Recurrence, Foundry, Outlook/SharePoint) i SharePoint/Graph části běží pod E5 licencemi
lab uživatelů; po konci trialu se nechovají jako teď a nic z nich se pak nedá znovu změřit. Než trial skončí, je potřeba přihlásit připojení
Power Automate (viz Neověřeno) a případně přehodit SKU ([07](07-lab-trial-plan.md)). Azure zdroje (gateway, Job, SQL) na M365 trialu nezávisí; Azure trial končí 26. 11.

## Co už je změřené

| Věc | Stav | Zdroj |
|---|---|---|
| SPFx web part běží při zablokovaném Custom Script (`requiresCustomScript: false`) | ✅ 6. 11., ale změřeno v **PPF tenantu, ne v egd labu**; v egd labu neopakováno ❓ (návrh: stejný pokus se dvěma web party v `egd-test-prvni-appka`) | `~/Projects/ppf-arcade/odpoved-adriane.md` ř. 10–16 |
| Deploy skriptem přes CLI for M365 nainstalované lokálně z npm (bez PSGallery, bez admina) | ✅ v egd labu: celý cyklus build → nasadit → upgrade proběhl pod CLI 11.11.0 (macOS, jako Global Admin; Windows a role Člen ne). Tvrzení „bez PSGallery a bez admina“ je v koncepci odpovědi Adriáně (ř. 23–26, 84) a v egd labu jako takové nezkoušeno ❓ | [skills/egd-prvni-appka/TEST.md](skills/egd-prvni-appka/TEST.md), skill `m365-cli-safe` |
| SPFx → vlastní API tokenem přihlášeného uživatele (`AadHttpClient`, `webApiPermissionRequests`) | ✅ v egd labu: web part v prohlížeči pod lab uživatelem volal gateway (`whoami` 257 ms, chat 0,85–0,9 s, OCR 1,0 s, `scopes=[Gateway.Use]`). Vzor navíc v ppf-rooms (`spfx/config/package-solution.json` ř. 28, `mistnostiGraph.ts` ř. 83) | [sondy/ai.md](sondy/ai.md) Sonda 3; `~/Projects/ppf-rooms/docs/prava.md` |
| API v **Container App** za Easy Auth, audit do Table Storage + Log Analytics | ✅ (`ca-ppf-rooms-app`) a v egd sondách (`ca-egd-llm-gateway`, `ca-egd-data-api`) | `~/Projects/ppf-rooms/container/`; [sondy/ai.md](sondy/ai.md), [sondy/data-prava.md](sondy/data-prava.md) |
| OBO na Graph | **částečně ✅, ale z PPF tenantu (ppf-rooms), ne z egd labu** (README ppf-rooms tenant nejmenuje a účty alice/bob jsou i v egd labu, ověřit ❓): v ppf-rooms měřeno na Function App s **uživatelem přiřazenou** managed identitou (`/api/obsazenost` 200, 14. 11.). Lab má jinak systémovou MI a pro OBO bez tajemství ta nestačí (`docs/obo.md`, tabulka výhrad). Na Container App a v egd labu OBO nezkoušeno ❓ | `~/Projects/ppf-rooms/docs/obo.md`, `lab/README.md` |
| Totéž ve Function App (Flex Consumption) s managed identity | ✅ ppf-rooms | `~/Projects/ppf-rooms/lab/README.md` |
| Power Automate volá vlastní API: logika flow proti živému API běžela, přesun proběhl | ✅ (testovací flow s **vestavěným HTTP** a krátkodobým tokenem recepční). Produkční konektor `konektor.flow.json` je uložen, ale ❓ nespuštěn (čeká na přihlášení člověka a souhlas správce) | `~/Projects/ppf-rooms/docs/power-automate.md` §6 řádky 5 a 7 (měřeno v ppf-rooms, ne v egd labu) |
| Standardní konektory vlastní API zavolat nejde; „HTTP s Microsoft Entra ID“ a custom connector jsou **Premium** | ✅ API tenantu hlásí `tier: Premium` (ppf-rooms §1; v egd labu 1224 Premium z 1395 konektorů). Že E5 dává jen standardní konektory, je 📘 | ppf-rooms §1; [sondy/napojeni.md](sondy/napojeni.md) Sonda 4 |
| Power Automate flow s akcí HTTP se v egd labu **nedá zapnout** | ✅ negativní: 403 `MissingAdequateQuotaPolicy` („potřebuješ Premium“, `sondy/power-automate/vystupy/diag-409.txt`), příčina je licence ✅; Request trigger dá obecné 409; flow s Compose naběhne. V ppf-rooms HTTP pod E5 doběhla (§6 řádek 6, „není doklad souladu s licencí“) – rozpor obou labů ❓ viz Neověřeno | [sondy/power-automate.md](sondy/power-automate.md) (Souhrn, řádek „Cizí API“; „Jak spustit flow ze SPFx“), `vystupy/diag-409.txt` D/F |
| Power Automate se **standardními** konektory: Recurrence, LLM přes Azure AI Foundry Inference konektor, **OCR/vision** | ✅ doběhlo (`Succeeded`); Foundry připojení vzniklo přes API bez člověka; ✅ vision/OCR: flow s obrázkem faktury (`data:` URL) vrátilo přesný přepis (běh `…CU25`, gpt-4.1-mini). Document Intelligence (strukturovaná pole) přes PA ❓ nezkoušeno | [sondy/power-automate.md](sondy/power-automate.md) (Souhrn, řádky LLM a Plánované úlohy), `sondy/power-automate/vystupy/behy.txt` (CU25) |
| **LLM gateway** (Container App, Azure OpenAI + Document Intelligence, kvóta, audit) | ✅ postavená a změřená: chat 0,9–1,7 s, OCR ~1,2 s, vision 2,2 s, kvóta 429, log ceny, 401/403; účet `aoai-egd-sonda-ai` | [sondy/ai.md](sondy/ai.md) Sonda 1–3 |
| Container Apps **Job s cronem** | ✅ spustil se podle cronu (18:20:00 UTC) a poslal mail | [sondy/napojeni.md](sondy/napojeni.md) Sonda 2 |
| E-mail s přílohou z Jobu (managed identity, Graph `sendMail`, RBAC na jednu schránku) | ✅ doručeno, odeslání z jiné schránky 403. Totéž jako **PA flow** s přílohou: ❓ flow uloženo, ale nedoběhlo (konektory nepřihlášené) | [sondy/napojeni.md](sondy/napojeni.md) Sonda 2 a Sonda 4; [sondy/power-automate.md](sondy/power-automate.md) (Souhrn, řádek e-mail; běh `…CU16` `ActionFailed`, připojení nepřihlášené). Surový log běhů Jobu v `sondy/napojeni/` není uložen ❓ (jsou tam jen `cors-vysledek.json`, `priloha-test.csv`) |
| Cokoli z toho v **E.ON tenantu** | ⛔ v labu nejde ověřit, E.ON tenant nemáme (jen lab `pavelchocholousgmail`, do E.ON ani PPF se nezapisuje). Ověřit u Galíka / IT E.ON, nebo při hostu z EG.D v labu | – |

Závěr pro středu: **SPFx ↔ Container App ↔ jiné systémy je v labu prokázané** včetně LLM gateway
a Jobu s cronem. **Power Automate se Standard konektory umí plánování (Recurrence) a LLM přes Foundry
konektor; cizí API přes HTTP se v labu nezapnulo (403 `MissingAdequateQuotaPolicy`, příčina je licence ✅).** Ze strany E.ON zůstává
neověřeno schválení API přístupu, síť a to, zda E.ON dá Azure (viz níž).

## Kde to v EG.D narazí (předem)

1. **Schválení API přístupu.** `webApiPermissionRequests` z `.sppkg` musí někdo v E.ON schválit. V labu:
   ✅ žádost se u adminu objeví (`m365 request` na seznam žádostí ukázal `Gateway.Use`); ✅ ekvivalentní
   souhlas přes Graph `oauth2PermissionGrant` (`tools/ai-spfx-api-grant.sh`) a pak volání funguje;
   ❌ standardní příkaz `permissionrequest approve` selhal (příčina ❓). **Průchod schvalováním v UI
   (SharePoint admin center → API access) nikdo neprošel ❓.** Kdo v E.ON schvaluje, je ❓: změřený je jen Global Admin (UI i Graph, ✅ ui-4); zda stačí role SharePoint admin, nikdo neměřil. →
   ⛔ nejde ověřit v E.ON; v labu doměřit v UI pro jeden balíček. Ticket pro E.ON IT.
2. **App registrace a Azure subscription.** 🔀 Tři funkční varianty, všechny v labu změřené nebo
   odkazované (podrobnosti [10-container-app.md](10-container-app.md) a [sondy/ai.md](sondy/ai.md)):

   | Varianta | Pro | Proti | Co chce IT E.ON | Náročnost pro citizen developera |
   |---|---|---|---|---|
   | a) Jedna sdílená platforma (gateway, Jobs, API), spravuje IT/CoE ✅ | jedno místo pro kvóty, logy, klíče; appky jen volají `AadHttpClient` | někdo ji musí provozovat; Azure subscription | subscription, Entra registrace, schválení API access, síť | nízká pro appky (volání API), vysoká pro provozovatele |
   | b) Bez vlastního hostingu: SPFx + SharePoint seznamy + Power Automate | žádný vlastní server | **není to „bez Azure“**: LLM přes PA konektor Foundry (Standard ✅) potřebuje Azure OpenAI/Foundry resource a klíč v připojení; cizí API bez CORS a scraping chtějí akci HTTP = **Premium** ✅ (403); plánovaný řetěz se sdílenou schránkou zatím ❌ (404 `ErrorItemNotFound`); OCR/LLM bez kvóty na appku; práva na položku zatím ❌ (neplatná role) | licence Power Automate (Premium pro HTTP), správa připojení, Azure OpenAI resource | nízká až střední |
   | c) Vlastní server každého vibecodera | nic neodkládá | každý řeší identitu, síť a provoz sám; v labu nezkoušeno ❓ | to samé × počet appek | vysoká  |

   Galík chce „bez Azure hostingu“ → buď a), nebo b); u funkcí, které b) nepokryje (LLM/OCR bez Azure resource, zdroje bez CORS, scraping, plánovaný řetěz s e-mailem ze sdílené schránky), nic. ⛔ Zda E.ON
   dá Azure subscription pro citizen dev, nejde v labu ověřit (rozhodnutí E.ON).
3. **Licence Power Automate.** 📘 Modely: per-user, per-flow, pay-as-you-go (PAYG) navázané na prostředí.
   ✅ V labu bez Premium: Recurrence a LLM přes Foundry konektor jdou. Bez Premium navíc zbývá: Outlook,
   SharePoint, schvalování, notifikace (Standard ✅ tier z API). HTTP, Word Online „Populate“, SQL a
   Dataverse jsou Premium (✅ tier z API); že flow s nimi poběží jen s licencí: HTTP ✅ změřeno (403 `MissingAdequateQuotaPolicy`,
   příčina je licence), Word Online/SQL/Dataverse ❓ nezkoušeno (v ppf-rooms HTTP pod E5 přesto doběhlo, rozpor ❓). PAYG účet v labu existuje, ale
   napojení na prostředí se přečíst nepodařilo ❓ ([sondy/napojeni.md](sondy/napojeni.md), konec Sondy 4, odstavec Pay-as-you-go).
4. **Odchozí síť ze SPFx** (CORS, proxy, firewall E.ON) na `*.azurecontainerapps.io`: ⛔ v labu jde
   (gateway, CORS po nastavení na ingressu ✅), ale síť E.ON neověříme. Ověřit při testu „Host z EG.D“
   (níže) nebo přímo u IT E.ON; alternativa vlastní doména.

## Mapování Galíkových požadavků

U každého požadavku jsou uvedeny všechny funkční varianty; doporučení až v sondách.

| # | Požadavek | Bez Azure (SPFx + SharePoint + std. Power Automate) | S gateway / serverem v Container App |
|---|---|---|---|
| 1 | Databáze s editací | SharePoint listy ✅ (čtení, zápis, úprava, přílohy, verze, 6000 položek; limit 5000 na dotaz) → [data-prava.md](sondy/data-prava.md) A | Azure SQL free + API s rolemi z tokenu ✅ (`AadHttpClient` ze SPFx ✅ pod 3 účty, [10-container-app.md](10-container-app.md) katalog 2) → [data-prava.md](sondy/data-prava.md) C. Cosmos DB free tier 📘/❓ nezkoušeno, Postgres Flexible 📘/❓ nezkoušeno (trvalý náklad), Dataverse 📘/❓ per-user licence a ruší se Dataverse for Teams |
| 2 | LLM přes gateway na aplikační klíč | ❌ klíč by byl v prohlížeči; 🔀 PA flow s Foundry konektorem ✅ chat i OCR/vision (CU25; Standard, ale pořád Azure OpenAI resource; klíč drží připojení, bez kvóty na appku) | ✅ gateway změřená ([ai.md](sondy/ai.md)): „aplikační klíč“ = identita + `X-App-Id`, ne klíč |
| 3 | Generování PDF/Word/PPT/Excel | ✅ v prohlížeči (docx, exceljs, pptxgenjs, pdf-lib; Word šablona docxtemplater) a PDF přes Graph `?format=pdf` (potřebuje `Files.Read.All`) → [dokumenty.md](sondy/dokumenty.md); 🔀 PA: Populate Word šablony Premium 📘, OneDrive „Convert file“ Standard (flow uloženo, běh ❓) | LibreOffice v kontejneru: lokálně ✅ kvalita, v kontejneru ❓ nepostaveno |
| 4 | Víceúrovňová autentizace a práva | SharePoint skupiny, `ReadSecurity`, `EffectiveBasePermissions` ✅ ([data-prava.md](sondy/data-prava.md) A, skill [egd-prava-role](skills/egd-prava-role/SKILL.md)). Vzor původně v `~/Projects/egd-vibecoding/digi-podnety`; lab ho **částečně vyvrátil** (schvalovatel potřebuje `CancelCheckout`, ne jen Edit/`ManageLists`) | Entra app role v API ✅ ([data-prava.md](sondy/data-prava.md) C); práva na položku (ACL) backendem s `ManagePermissions` ❓ nepostaveno; 🔀 PA „Grant access to an item“ flow uloženo, běh ❓ |
| 5 | Externí API, scraping | ✅ ze SPFx jen API s CORS (ARES, Open-Meteo); ✅ ČNB a OTE z prohlížeče zablokované ([napojeni.md](sondy/napojeni.md) Sonda 1); 🔀 PA: HTTP akce se v labu nezapnula (Premium, 403 `MissingAdequateQuotaPolicy` ✅); RSS konektor Standard ✅ jen feedy | ✅ ČNB stažené z Jobu |
| 6 | E-maily s přílohami | Graph `sendMail` delegovaně ✅, ze SPFx `MSGraphClient` ✅ ([sondy/ms-maily/README.md](sondy/ms-maily/README.md): bez schválení 403, po schválení 202, příloha do 30 MB; ❓ schválení v UI admin centra); 🔀 PA Outlook flow (Standard ✅ tier, běh ❓ čeká na přihlášení, od majitele připojení) | ✅ Graph `sendMail` z Jobu přes MI, RBAC na jednu schránku ([napojeni.md](sondy/napojeni.md) Sonda 2) |
| 7 | Plánované úlohy (denní report) | PA Recurrence ✅ (Compose doběhlo); Recurrence → SharePoint → Outlook s přílohou ❓ nedoběhlo (`Unauthorized`, konektory nepřihlášené) | ✅ Container Apps **Job** s cronem, doběhl a poslal mail |

## LLM gateway pro SharePoint (postavená, změřená)

```
SPFx web part ──AadHttpClient (token uživatele, scope Gateway.Use)──▶ Container App „ca-egd-llm-gateway“
                                                                       │ Easy Auth (Entra) – kdo volá
                                                                       │ X-App-Id → kvóta tokenů/den, log
                                                                       │ log: uživatel, appka, tokeny, cena → Log Analytics
                                                                       ▼
                                          Azure OpenAI (gpt-4.1-mini) · Document Intelligence – managed identity, žádný klíč
```

- Podrobnosti, čísla, ceny a pasti: [sondy/ai.md](sondy/ai.md). Klíč k LLM nikdy v prohlížeči.
- ✅ Co běží: chat, OCR (`prebuilt-read`), vision, kvóta (429), audit. ❌ Generování obrázků: kvóta modelů 0.
- ✅ Past pro demo: studený start 26 s (`min-replicas 0`); `min-replicas 1` ≈ 8 USD/měs. (výpočet z ceníku 📘),
  jen s Pavlovým souhlasem (placená trvalá položka).
- **Varianta B: APIM před gateway.** ✅ APIM **Consumption** `llm-token-limit`, `quota-by-key` ani
  `rate-limit-by-key` **neumí** (uložení politiky odmítnuto, `rate-limit` ano). Token limit chce tier v2:
  Basic v2 ≈ 150 USD/měs., Standard v2 ≈ 700 USD/měs. (📘 přepočet z hodinové sazby, tier v2 jsme
  nezaložili ❓). Dává smysl jen, pokud E.ON takové APIM už má. Kvótu proto děláme v kódu gateway.
- **LLM je rozhodnutý a běží:** Azure OpenAI `aoai-egd-sonda-ai` (`gpt-4.1-mini`, swedencentral) +
  Document Intelligence `di-egd-sonda-ai` (F0). Alternativa Anthropic API klíč se nezkoušela ❓.
  Pro E.ON ⛔ nejde v labu ověřit: smluvní/datová pravidla (Global Standard vs DataZone EU), schválený endpoint.
- **Rozpočet (dvě různé měny, nepřepočítáno):** Azure budget `mcp-lab-budget` = **20 EUR/měsíc**
  ([06-azure-inventar.md](06-azure-inventar.md), sekce o budgetu; podle něj překročen, 22,96 EUR při posledním spuštění, jen upozornění, nic nevypíná).
  Pro projekt platí rozpočet z [CLAUDE.md](CLAUDE.md): **~50 USD na zkoušení teď, do 300 USD na workshop**.
  Provoz gateway: tokeny v řádu haléřů za volání; odhad pro ~10 appek ≈ 35 USD/měs. (lehký) až ≈ 300 USD
  (střední) je **odhad, ne měření** ([ai.md](sondy/ai.md) „Ceny“). ACR gateway ≈ 0,17 USD/den (≈ 5 USD/měs.) trvale 📘 (výpočet z ceníku Basic; faktura to nepotvrdila ❓).

## Testy a jejich stav

| Test | Co přesně ověří | Stav | Výstup / zbývá | Kdo |
|---|---|---|---|---|
| **Appka volá vlastní server** | SharePoint web part pošle dotaz na server v Container App a ten vrátí jméno přihlášeného | ✅ hotovo | web part v labu volal gateway (`whoami`, chat, OCR) → [ai.md](sondy/ai.md) Sonda 3. `AadHttpClient` pro DB API ze SPFx ✅ ([10-container-app.md](10-container-app.md) katalog 2, [data-prava.md](sondy/data-prava.md) sekce C) | agent |
| **LLM gateway** | Server, přes který appky volají AI; klíč jen na serveru, každá appka má limit | ✅ hotovo | endpoint + web part. Zbývá před provozem: `min-replicas 1`. Atomická kvóta ✅, aplikační role `Gateway.App` ✅, schválení API v UI admin centra ✅ pod Global Adminem ([ai.md](sondy/ai.md) „Doporučení“ 5, [10-container-app.md](10-container-app.md)) | agent |
| **Power Automate** | Jaké toky jdou bez Premium, co přidá Premium, kolik to stojí | ⚠ rozpracováno | ✅ Recurrence, LLM + OCR/vision přes Foundry (CU25); ✅ HTTP akce blokována Premium (403). ❓ čeká na přihlášení připojení (SharePoint, Outlook, OneDrive) a rozhodnutí o trialu/PAYG: sdílená schránka (CU16), práva (CU30), převod do PDF (CU17), fronta v seznamu. **Přihlásit před koncem E5 trialu 25. 11. 04:04** → [power-automate.md](sondy/power-automate.md) | agent + Pavel (přihlášení konektoru musí udělat člověk) |
| **Denní report** | Úloha, která se sama spustí: stáhne data z cizího API, AI shrnutí, Word, e-mail | ✅ hotovo | ✅ Job (cron) → ČNB → LLM shrnutí → **docx** → PDF → e-mail s přílohou ([10-container-app.md](10-container-app.md) katalog 7, [job-retez.md](sondy/container-app/job-retez.md)); dřívější CSV varianta: [napojeni.md](sondy/napojeni.md) Sonda 2 | agent |
| **Kit mimo PPF** | Citizen AI developer kit (ppf-citizen-ai-devkit) založí a nasadí appku do lab tenantu místo PPF | ❓ nepotvrzeno | skill `egd-prvni-appka` (vlastní šablona) prošel v labu jako Global Admin na macOS ([TEST.md](skills/egd-prvni-appka/TEST.md)); samotný `ppf-citizen-ai-devkit` v egd labu nepotvrzen. Seznam úprav kitu: [data-prava.md](sondy/data-prava.md) „Co z kitu jde vzít“. Jak ověřit: `devkit init` a nasazení na nový web v labu pod rolí Člen i Čtenář, výstup uložit do `skills/`/`sondy/` | agent |
| **Host z EG.D** | Galík nebo Adriána otevřou stránku v labu pod svým účtem z EG.D | ❓ nezkoušeno | ⛔ jestli jejich firma pustí přihlášení do cizího tenantu, jde změřit jen s nimi (3 ze 7 hostů pozvánku přijali, [03-lab.md](03-lab.md)); tentýž test ověří síť na `*.azurecontainerapps.io`. Jak ověřit: host otevře stránku s gateway web partem (`/sites/egd-sonda-ai`) a spustí `whoami`; výsledek zapsat. Pozor na konec E5 trialu 25. 11. 04:04 | ty s nimi |
| **Windows + Copilot** | Kit a skills v GitHub Copilot CLI na Windows (tak budou pracovat v EG.D) | ❓ nezkoušeno | Windows neměřen ([05-otevrene-body.md](05-otevrene-body.md), bod 3); ⛔ potřebuje Windows stroj nebo VM. Jak ověřit: jeden celý běh `egd-pripravenost` → `egd-prvni-appka` v PowerShellu 5.1 a v Copilot CLI | potřebuje Windows stroj |

Paralelně jdou: „Kit mimo PPF“ a doměření PA po přihlášení připojení („Denní report“ s AI a docx je ✅).
„Host z EG.D“ a „Windows + Copilot“ závisí na lidech a stroji, ne na technice labu.

## Neověřeno (pro roli Ověřovatel sond)

| Tvrzení | Proč zatím ne | Jak ověřit |
|---|---|---|
| Proč v ppf-rooms HTTP pod E5 doběhlo, když v egd labu je blokované licencí | v egd labu změřeno blokování | trial Power Automate Premium pro lab uživatele (zapne Pavel), znovu `tools/pa-flow.py start`; porovnat stav prostředí/DLP s ppf-rooms |
| Schválení `webApiPermissionRequests` v UI SharePoint admin center a kdo schvaluje | `permissionrequest approve` selhal; UI approve ✅ pod Global Adminem, drží po reloadu (`sondy/overeni/api-access/ui-4`), rozšíření existujícího grantu (PATCH 204), ❓ první grant (POST) a ❓ zda stačí SharePoint admin; grant přes Graph ✅ jako fallback | příčina rozdílu CLI × UI ❓; u E.ON ⛔ jen skutečný SharePoint admin, zkusit první den, fallback Graph grant |
| Průchod schválením a práva v E.ON, síť na `*.azurecontainerapps.io`, Azure subscription pro citizen dev | ⛔ E.ON tenant nemáme | otázky na Galíka/IT, test s hostem z EG.D |
| Document Intelligence (strukturovaná pole) přes PA | OCR/vision přes Foundry je ✅ (CU25), Document Intelligence přes PA nezkoušeno | flow s konektorem Document Intelligence/AI Builder po trialu |
| Měření v ppf-rooms (OBO, PA, Custom Script v ppf-arcade): ve kterém tenantu proběhlo | README ppf-rooms tenant nejmenuje; audit uvádí PPF tenant | zeptat se autora, nebo zopakovat v egd labu před koncem E5 trialu (25. 11. 04:04) |
| Surové logy ✅ měření (Job, gateway chyby, ai, napojení) | uložené v `sondy/overeni/container-app/{gateway,job}` a `sondy/ms-llm`; chybí jen starší měření mimo ně ❓ | u konkrétního tvrzení najít soubor, jinak opakovat s uložením výstupu do `sondy/<téma>/` |
| Běhy PA po přihlášení připojení (CU16, CU30, CU17, fronta) | OAuth připojení přihlásí jen člověk | Pavel před 25. 11. 04:04, potom `pa-flow.py stop`+`start` |
| ~~`AadHttpClient` ze SPFx pro DB API a OBO~~ | ✅ změřeno ([10-container-app.md](10-container-app.md) katalog 2, 6) | |
| ~~AI shrnutí a docx v denním Jobu~~ | ✅ změřeno (katalog 7) | |
