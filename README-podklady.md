# EG.D vibecoding hackathon — podklady a lab

Příprava na **vibecoding hackathon s EG.D** (středa 25. 11. 2026, 12:30–17:00, České Budějovice) a na
navazující konzultaci k zavedení citizen AI developmentu. Lidé z EG.D, kteří nejsou programátoři, si mají
s AI agentem (GitHub Copilot nebo Claude) postavit vlastní appku na SharePointu (SPFx) a zjistit, co
v jejich prostředí jde a kde narazí. Fakta o workshopu: [01-fakta-workshopu.md](01-fakta-workshopu.md).

Repo obsahuje tři věci:

1. **Skilly pro agenta účastníka** ([skills/](skills/)): návody, podle kterých agent zkontroluje počítač,
   postaví první appku a přidá do ní data, role, dokumenty, AI, e-maily, cizí API a plánované úlohy.
2. **Sondy** ([sondy/](sondy/)): měření v lab tenantu k sedmi požadavkům Tomáše Galíka z EG.D
   („jde / nejde, jak a za kolik“), včetně kódu a surových výstupů.
3. **Lab a řízení přípravy**: popis lab tenantu, účty účastníků, nástroje pro agenty ([tools/](tools/README.md)),
   přehled prací a audit.

Všechna měření proběhla v **lab tenantu** `pavelchocholousgmail.onmicrosoft.com` (M365 + Azure, [03-lab.md](03-lab.md)).
Do tenantu E.ON se nezapisuje a nic v něm změřeno není.

## Značky

✅ změřeno v labu (s důkazem) · 📘 jen dokumentace · ❓ neověřeno · ⛔ v labu neověřitelné (typicky „jen v tenantu E.ON“) ·
❌ změřeno, že nejde · 🔀 víc funkčních variant. 📘 a ❓ jsou mezistav, doporučení na nich nestojí
(kánon v [CLAUDE.md](CLAUDE.md)).

## Stav k 24. 11. 2026

Tento souhrn je sestavený z dokumentů v repu; kde si odporují, je to uvedeno v sekci
[Známé rozpory](#známé-rozpory-a-zastaralá-místa). Živý stav jednotlivých úkolů je v `prehled/stav/*.json`.

- **Skilly:** 10 složek `skills/egd-*`, každá má `TEST-copilot.md`. Samostatný `TEST.md` (běh v Claude) má 5 z nich,
  u zbylých 5 je důkaz běhu v Claude jen v `SKILL.md` a v sondách. Podrobně v tabulce [Skilly](#skilly-skills).
- **Sedm požadavků Tomáše Galíka:** ke každému existuje sonda a skill. Generování obrázků ❌ (kvóta modelů v labu 0),
  cesta k LLM a OCR bez Azure nalezena nebyla (📘, mezistav). Stav po položkách: [prehled/galik-otazky.md](prehled/galik-otazky.md)
  (37 položek) a matice variant [prehled/varianty.md](prehled/varianty.md).
- **Vlastní server (Container App):** 7 funkcí vlastního serveru změřených v labu ✅, viz [10-container-app.md](10-container-app.md).
  Ukázkový web [egd-ukazky](https://pavelchocholousgmail.sharepoint.com/sites/egd-ukazky) má 13 karet napříč
  SPFx / Power Automate / Container App ([sondy/katalog-funkci/](sondy/katalog-funkci/README.md)).
- **Cesta účastníka (E2E):** cesta A prošla v Claude pod `egd10` i v Copilot CLI pod `egd09` ✅ ([sondy/e2e/](sondy/e2e/README.md)).
- **Platí pro všechno:** měřeno jen na **macOS a v lab tenantu**. Windows, PowerShell 5.1, VS Code agent mode
  a tenant E.ON jsou ❓ / ⛔ ([02-skills-a-kit.md](02-skills-a-kit.md), [05-otevrene-body.md](05-otevrene-body.md)).
- **Trial labu:** Microsoft 365 E5 trial končí **25. 11. 2026 v 04:04 SEČ**, tedy před začátkem workshopu; Azure kredit
  26. 11. v 03:08 ✅ ([06-azure-inventar.md](06-azure-inventar.md)). Prodloužit E5 nejde ✅ ([07-lab-trial-plan.md](07-lab-trial-plan.md)).
  Náhrada: Microsoft 365 Business Standard EEA (no Teams), trial do 23. 12., 11 z 25 licencí, `OFFICE_BUSINESS` vypnutý
  kvůli kolizi s E5 ✅. `egd09` bez E5 ověřen, SharePoint i nasazení `.sppkg` projdou ✅
  ([lab/dukazy/licence-bstd/](lab/dukazy/licence-bstd/)). Automatické obnovení je Off u všech 5 trialů ✅.
- **Co čeká na lidi:** rozhodnutí a kroky Pavla (licence, sdílení výdeje účtů) a odpovědi z EG.D / E.ON
  (appId a katalog aplikací, licence Copilota, Power Automate), viz [05-otevrene-body.md](05-otevrene-body.md)
  a „Mezery“ v [prehled/galik-otazky.md](prehled/galik-otazky.md).

Číslované dokumenty `00`–`06` nesou stav k 22. 11. a místy zaostávají za skilly, sondami a `prehled/stav/`.
Novější jsou `10` (24. 11.), `07` (dodatek 24. 11.), `TEST*.md` ve skillech a `sondy/container-app/`.

## Jak se v repu orientovat

Dokumentace je hierarchická: **tento README → číslované dokumenty `00`–`10` → podrobnosti** (`sondy/`, `skills/`,
`lab/dukazy/`, `zdroje/`). Fakta se neopisují, vyšší úroveň odkazuje na nižší.

| Chci vědět | Kde začít |
|---|---|
| co je workshop, kdo, kdy, co EG.D chce | [01-fakta-workshopu.md](01-fakta-workshopu.md) |
| co je hotové a co chybí | [00-co-mame.md](00-co-mame.md) (22. 11.), novější [prehled/galik-otazky.md](prehled/galik-otazky.md) a `prehled/stav/` |
| jestli jde konkrétní funkce a kterou cestou | [prehled/varianty.md](prehled/varianty.md) → příslušná sonda |
| co dát agentovi účastníka | [skills/](skills/), pořadí: `egd-pripravenost` → `egd-prvni-appka` → ostatní |
| co chtít od IT E.ON | [10-container-app.md](10-container-app.md) (souhrn oprávnění), sekce „Neověřeno“ ve skillech |
| jak se dostat do labu a čím | [03-lab.md](03-lab.md), [CLAUDE.md](CLAUDE.md) sekce „Lab“, [tools/README.md](tools/README.md) |
| jak v repu pracují agenti (role, pravidla, git) | [CLAUDE.md](CLAUDE.md), [prehled/role.md](prehled/role.md) |

## Číslované dokumenty

| Dokument | Obsah | Stav k |
|---|---|---|
| [00-co-mame.md](00-co-mame.md) | přehled hotové / rozpracované / chybí | 22. 11. večer (zastaralé u skillů a testů v Copilotu) |
| [01-fakta-workshopu.md](01-fakta-workshopu.md) | termín, lidé, harmonogram, cíle, 7 požadavků T. Galíka, co víme o prostředí EG.D (z mailů, ⛔), obchodní rámec, časová osa, volba nástroje | 22. 11. |
| [02-skills-a-kit.md](02-skills-a-kit.md) | 10 skillů `egd-*`, 5 obecných SharePoint skillů (jen lokálně mimo repo), `ppf-citizen-ai-devkit`, 🔀 SPFx 1.18.2 + gulp vs. 1.24 + Heft, 🔀 distribuce balíčku účastníkům, AI Engineering Library od EG.D | 22. 11. (tabulka skillů částečně novější) |
| [03-lab.md](03-lab.md) | lab tenant, licence, SharePoint weby, hosté z EG.D a jejich stav, Azure resource groups, seznam ❓ pro ověření | 22. 11. |
| [04-integrace-test-plan.md](04-integrace-test-plan.md) | co je změřené u napojení na jiné systémy a u LLM gateway, kde to v EG.D narazí, mapování požadavků, testy a jejich stav | 22. 11. |
| [05-otevrene-body.md](05-otevrene-body.md) | otevřené body do středy podle priority | 22. 11. večer |
| [06-azure-inventar.md](06-azure-inventar.md) | co kdy v labu vyprší, typ subscription, náklady, zdroje po resource group, M365 licence | 22. 11. |
| [07-lab-trial-plan.md](07-lab-trial-plan.md) | jak lab přežije konec trialů: varianty s cenou a rizikem, kroky pro Pavla, důkazy P1–P11; přílohy v [07-prilohy/](07-prilohy/) | 22. 11., dodatek 24. 11. (opakované účtování) |
| [08-ucty-ucastniku.md](08-ucty-ucastniku.md) | účty `egd01`–`egd10`, 30 webů DEV/TEST/PROD, MFA, varianty nasazení pod účastníkem, výdej účtů, úklid po workshopu | 22.–23. 11. |
| [09-github-ucastnici.md](09-github-ucastnici.md) | GitHub a Copilot pro účastníky: zjištění, varianty F a A–E, rozhodnutí, záložní Enterprise trial | 22.–23. 11. |
| [10-container-app.md](10-container-app.md) | co se řeší vlastním serverem v Azure: katalog 7 ověřených funkcí, varianty, alternativa přes Power Automate, požadavky na IT E.ON, souhrn oprávnění pro security assessment, cena | 24. 11. |

## Skilly (`skills/`)

Skill je složka se `SKILL.md` (návod pro agenta), případně skripty, šablonou a důkazy z testů. Podle kánonu je skill
hotový, až projde v Claude **i** v GitHub Copilot CLI. Skilly nepředepisují jednu cestu, ale žebřík variant, ze kterého
si agent v prostředí účastníka vybere první funkční. Sloupce „Claude“ a „Copilot“ shrnují `TEST.md` a `TEST-copilot.md`;
všechny testy běžely na macOS v labu, Copilot vždy jako Copilot CLI.

| Skill | Co dělá | Claude | Copilot CLI |
|---|---|---|---|
| [egd-pripravenost](skills/egd-pripravenost/SKILL.md) | prereq: zjistí, zda počítač neprogramátora zvládne workshop (AI nástroj, Node a npm, CLI for Microsoft 365, SharePoint), vyrobí zprávu `pripravenost-<jméno>.md` s větami pro ServiceNow; při zelené vede k první appce. Obsahuje i [zadání appky](skills/egd-pripravenost/ZADANI-appka.md) a [průvodní text](skills/egd-pripravenost/PRUVODNI-TEXT.md) | [TEST.md](skills/egd-pripravenost/TEST.md) (22.–23. 11.): použitelný k rozeslání, ale běh ověřen jen na macOS a pod správcem labu; role Člen přes CLI neověřena (AADSTS65001), Windows a PowerShell 5.1 nikdy nespuštěny | [TEST-copilot.md](skills/egd-pripravenost/TEST-copilot.md) (22.–23. 11.): „pro Copilot CLI připravený“; Windows, VS Code agent mode a interaktivní schvalování ❓ |
| [egd-recon](skills/egd-recon/SKILL.md) | záchranný skill k přípravě: když něco zůstane červené (AADSTS65001, „Need admin approval“, 403, web bez katalogu), jen čte a vypíše funguje / blokováno / žádost pro IT | [TEST.md](skills/egd-recon/TEST.md) ✅ 24. 11., tři situace; ❓ větev „chybí scope“ pod účtem bez práv | [TEST-copilot.md](skills/egd-recon/TEST-copilot.md) ✅ 24. 11.; krok zápisu stavu udělal až po úpravě skillu |
| [egd-prvni-appka](skills/egd-prvni-appka/SKILL.md) | první appka „Spokojenost s prostředím kanceláře“ (tlačítka 1–5 a dashboard nad seznamem), ve značce E.ON nebo EG.D. Cesty: A nasazení skriptem, A2 nahrání v prohlížeči, B bez kódu | [TEST.md](skills/egd-prvni-appka/TEST.md) (22.–24. 11.): ✅ cesta A, ✅ celá A2 pod `egd01`, ✅ dvě značky; souhrnný verdikt v souboru není, cesta B v prohlížeči neověřena | [TEST-copilot.md](skills/egd-prvni-appka/TEST-copilot.md) (22. 11.): cestu A prošel sám, vykreslení v prohlížeči ❓. Test je starší než přejmenování šablony a značky z 24. 11.; A2 a B v Copilotu nezkoušeny |
| [egd-data-seznamy](skills/egd-data-seznamy/SKILL.md) | data a editace v SharePoint seznamu i pro tisíce záznamů: indexy, stránkování po 1000, souběžná úprava (ETag), kdy už vlastní databáze | [TEST.md](skills/egd-data-seznamy/TEST.md) ✅ 23. 11. | [TEST-copilot.md](skills/egd-data-seznamy/TEST-copilot.md) ✅ ve 2. běhu (1. běh našel chybu ve skillu, opravena); dodatek ETag 24. 11.: build ✅, chování nasazené appky ❓ |
| [egd-prava-role](skills/egd-prava-role/SKILL.md) | role zadavatel / schvalovatel / správce vynucené SharePointem (skupiny, „každý vidí jen své“, vlastní úroveň oprávnění), appka práva jen čte | [TEST.md](skills/egd-prava-role/TEST.md) ✅ 24. 11. | [TEST-copilot.md](skills/egd-prava-role/TEST-copilot.md) ✅ ve třech bězích (22.–23. 11.) |
| [egd-dokumenty](skills/egd-dokumenty/SKILL.md) | Word, Excel, PowerPoint a PDF z dat seznamu přímo v prohlížeči, Word ze šablony, věrné PDF přes Graph, úprava existujících dokumentů | `TEST.md` není; ✅ podle `SKILL.md`, důkazy v [sondy/ms-dokumenty](sondy/ms-dokumenty/README.md) a `sondy/dokumenty/uprava/` | [TEST-copilot.md](skills/egd-dokumenty/TEST-copilot.md) ✅ (oprava buildu, export Word / Excel / PDF, úpravy 24. 11.); PowerPoint a pdf-lib Copilot nezkoušel |
| [egd-llm-gateway](skills/egd-llm-gateway/SKILL.md) | AI v appce (text, OCR, popis obrázku) přes sdílenou LLM gateway tokenem přihlášeného uživatele, bez klíče v kódu; říká, co musí dodat IT | `TEST.md` není; ✅ podle `SKILL.md`, důkazy v [sondy/ms-llm](sondy/ms-llm/README.md) | [TEST-copilot.md](skills/egd-llm-gateway/TEST-copilot.md) ✅ 23. 11. (1 běh) |
| [egd-maily](skills/egd-maily/SKILL.md) | e-mail s přílohou jménem přihlášeného uživatele (Graph `sendMail`), varianty pro systémovou schránku, „vygeneruj PDF a pošli“ | `TEST.md` není; ✅ podle `SKILL.md`, důkazy v [sondy/ms-maily](sondy/ms-maily/README.md) a [sondy/ms-pdf-mail](sondy/ms-pdf-mail/README.md) | [TEST-copilot.md](skills/egd-maily/TEST-copilot.md) ✅ 23. 11.; PDF mailem 24. 11.: varianty A a C1 ✅, B a C2 nezadány ❓ |
| [egd-externi-api](skills/egd-externi-api/SKILL.md) | cizí API: test, zda jde volat z prohlížeče (CORS); když ne (ČNB, OTE, scraping), nabídne ruční data, server nebo Power Automate | `TEST.md` není; ✅ podle `SKILL.md` (22. 11.) | [TEST-copilot.md](skills/egd-externi-api/TEST-copilot.md) 22. 11.: jen poradní scénář (nic nestavěl), všechny kroky ✅, souhrnný verdikt v souboru není |
| [egd-planovane-ulohy](skills/egd-planovane-ulohy/SKILL.md) | plánovaná úloha (denní report, e-mail): Power Automate s Recurrence, nebo Container Apps Job s cronem | `TEST.md` není; ✅ podle `SKILL.md` (22. 11.) | [TEST-copilot.md](skills/egd-planovane-ulohy/TEST-copilot.md) ✅ 23. 11., jen poradní (nic nezaložil) |

Společné mezery všech skillů: Windows a PowerShell 5.1, tenant E.ON (proxy, politiky, kdo schvaluje API access),
VS Code agent mode. Každý `SKILL.md` má vlastní sekci „Neověřeno“. Souvislosti, obecné skilly a distribuce:
[02-skills-a-kit.md](02-skills-a-kit.md).

## Sondy (`sondy/`)

Sonda je experiment v labu k jednomu požadavku: dokument se závěry a variantami + složka s kódem a surovými výstupy.
Pravidla sond: [sondy/_zadani-spolecne.md](sondy/_zadani-spolecne.md) (tři patra: SPFx bez Azure, Power Platform, vlastní server).

### Hlavní sondy (22. 11., doplňky do 24. 11.)

| Sonda | Otázka | Závěr (zkráceně) |
|---|---|---|
| [ai.md](sondy/ai.md) | LLM přes gateway „na aplikační klíč“: text, OCR, obrázky | ✅ gateway v Container App (text, OCR, vision), klíč nahrazuje token uživatele a `X-App-Id` jako účetní štítek; ❌ generování obrázků (kvóta 0); ✅ APIM Consumption jako AI gateway nejde; cesta bez Azure jen 📘 |
| [dokumenty.md](sondy/dokumenty.md) | generování a úprava Word / Excel / PPT / PDF | ✅ vše v prohlížeči (docx, exceljs, pptxgenjs, pdf-lib, šablona), ✅ PDF přes Graph `?format=pdf` (chce `Files.Read.All`); doporučuje cestu bez serveru |
| [napojeni.md](sondy/napojeni.md) | cizí API a scraping, e-mail s přílohou, plánované úlohy | ✅ část API jde z prohlížeče (CORS), ČNB a OTE ne; ✅ Container Apps Job s cronem poslal mail; ✅ `sendMail` s přílohou do 30 MB; ✅ akce HTTP v Power Automate chce Premium |
| [data-prava.md](sondy/data-prava.md) | databáze s editací, víceúrovňová práva | ✅ SharePoint seznam s `ReadSecurity` a vlastní úrovní oprávnění; ✅ limit 5000 a stránkování na 6000 položkách; ✅ Azure SQL free + API s rolemi z tokenu; Dataverse nezkoušen |
| [power-automate.md](sondy/power-automate.md) | cesta přes Power Automate ke každé funkci vlastního serveru | označeno „rozpracováno“; ✅ LLM přes Foundry Inference, Recurrence, převod do PDF a seznam jako fronta na Standard; akce HTTP 403 (Premium); ❌ „Grant access“ a „Send from a shared mailbox“ |
| [optimalizace-seznamu.md](sondy/optimalizace-seznamu.md) | jak zůstat rychlý nad limitem 5000 | ✅ limit nejde vypnout; nejrychlejší je paralelní čtení po rozsazích `ID`; změnový token + cache; měřeno do 12 012 položek, miliony ❓ |

Ke každé patří stejnojmenná složka (`sondy/ai/`, `dokumenty/`, `napojeni/`, `data-prava/`, `power-automate/`,
`optimalizace/`) s kódem, definicemi flow a surovými daty.

### Další složky

| Složka | Co v ní je |
|---|---|
| [container-app/](sondy/container-app/) | pět sond vlastního serveru z 24. 11.: [obo.md](sondy/container-app/obo.md) (Graph jménem uživatele), [libreoffice.md](sondy/container-app/libreoffice.md) (převod do PDF), [prava-db.md](sondy/container-app/prava-db.md) (sdílení položky, práva podle oddělení a nadřízeného), [job-retez.md](sondy/container-app/job-retez.md) (denní report celým řetězem). [obo-copilot.md](sondy/container-app/obo-copilot.md) (Copilot API přes OBO): funguje jen s licencí M365 Copilot ✅ (bez ní Retrieval 403); pošta přes OBO licenci Copilot nepotřebuje ✅; Retrieval přes OBO s licencí vrací 0 úryvků, příčina ❓ |
| [ms-dokumenty/](sondy/ms-dokumenty/README.md), [ms-llm/](sondy/ms-llm/README.md), [ms-maily/](sondy/ms-maily/README.md), [ms-pdf-mail/](sondy/ms-pdf-mail/README.md), [ms-prava/](sondy/ms-prava/zjisteni.md) | ověření úryvků z miniskillů ve skutečné SPFx appce v labu, přepisy běhů Copilota. V `ms-llm` je i měření Microsoft 365 Copilot API ze SPFx ([copilot-graph.md](sondy/ms-llm/copilot-graph.md)): Retrieval s licencí ✅ (není to LLM), Chat API ❌ |
| [miniskilly/](sondy/miniskilly/) | měření k `egd-data-seznamy` (indexy nad 5000, ETag při souběhu); bez souhrnného dokumentu, závěry jsou ve skillu |
| [overeni/](sondy/overeni/README.md) | role Ověřovatel sond: doměření tvrzení, která audit našel bez důkazu (schválení API access v UI, studené starty, role Visitor, kvóta gateway, logy Jobu) |
| [rest-varianty/](sondy/rest-varianty/README.md) | nasazení appky, když CLI nejde: ✅ REST z přihlášené stránky v prohlížeči projde celou cestu bez tokenu a bez souhlasu správce; role Člen ❓ |
| [lab-github/](sondy/lab-github/) | čtyři výpisy k průzkumu GitHubu pro [09](09-github-ucastnici.md) |
| [e2e/](sondy/e2e/README.md) | průchod „účastník od výdeje účtu“: cesta A prošla v Claude pod `egd10` a v Copilot CLI pod `egd09` ✅; Windows, VS Code agent mode a tenant E.ON ❓ |
| [katalog-funkci/](sondy/katalog-funkci/README.md) | ukázkový web https://pavelchocholousgmail.sharepoint.com/sites/egd-ukazky: jedna karta na funkci (SPFx / Power Automate / Container App) s vysvětlením „co se děje na pozadí“, vlastníci `egd01`–`egd10`; 13 karet |
| [copilot-nativni/](sondy/copilot-nativni/README.md) | nativní Copilot v SharePointu bez vlastního kódu, měřeno pod `egd10` s trial licencí Copilot: knihovna, seznam, editor a Chat ✅, vytvoření agenta a Autofill ❓ |

## Vlastní server v Azure: Container App a LLM gateway

Všechno, co SPFx appka v prohlížeči sama neumí, je sebrané v [10-container-app.md](10-container-app.md). Princip:
web part volá API tokenem přihlášeného uživatele (`AadHttpClient`), server pracuje pod managed identitou, tajemství
nejsou v prohlížeči ani v kódu. Katalog funkcí změřených v labu:

| # | Funkce | Služba v labu | Podrobnosti |
|---|---|---|---|
| 1 | LLM gateway: chat, vision, OCR, kvóta na appku, log ceny (generování obrázků ne) | `ca-egd-llm-gateway` | [sondy/ai.md](sondy/ai.md), skill `egd-llm-gateway` |
| 2 | databáze s právy podle role (Azure SQL) | `ca-egd-data-api` | [sondy/data-prava.md](sondy/data-prava.md), [prava-db.md](sondy/container-app/prava-db.md) |
| 3 | plánovaná úloha ČNB → CSV → e-mail | Job `job-egd-report` | [sondy/napojeni.md](sondy/napojeni.md) |
| 4 | práva na jednotlivé položky seznamu (sdílení kolegovi) | `ca-egd-data-api` | [prava-db.md](sondy/container-app/prava-db.md) |
| 5 | převod docx / xlsx / pptx do PDF (LibreOffice) | `ca-egd-dokumenty` | [libreoffice.md](sondy/container-app/libreoffice.md) |
| 6 | Graph jménem uživatele (OBO) s oprávněním jen pro jedno API | `ca-egd-obo` | [obo.md](sondy/container-app/obo.md) |
| 7 | denní report: ČNB → LLM → docx → PDF → e-mail | Job `job-egd-retez` | [job-retez.md](sondy/container-app/job-retez.md) |

Dokument dál uvádí ke každé funkci cestu přes Power Automate, co by musel dodat IT E.ON a souhrn oprávnění pro
security assessment. Galík chce cestu bez Azure hostingu; dokument proto server navrhuje jen jako jednu sdílenou
platformu spravovanou jedním týmem, ne jako server každého vývojáře. V tenantu E.ON nic z toho ověřené není ⛔.

## Lab

| Téma | Kde | Stručně |
|---|---|---|
| tenant, weby, hosté | [03-lab.md](03-lab.md) | lab M365 tenant se SharePointem a katalogem aplikací; 7 hostů z `egd.cz`, k 22. 11. přijali 3 |
| účty účastníků | [08-ucty-ucastniku.md](08-ucty-ucastniku.md) | ✅ 10 účtů `egd01`–`egd10`, každý 3 weby se site app catalogem; nasazení `.sppkg` pod účastníkem přes UI a REST ✅, přes CLI ne (AADSTS65001) |
| výdej účtů | [08-ucty-ucastniku.md](08-ucty-ucastniku.md), [lab/](lab/) | web appka (Azure Static Web App + Table Storage), kde si účastník po zadání společného hesla účet sám rezervuje; zdroj v `lab/vydej-app/`, záložní stránka v `lab/vydej/`, správa `tools/lab-vydej.py` |
| trialy a náklady | [06-azure-inventar.md](06-azure-inventar.md), [07-lab-trial-plan.md](07-lab-trial-plan.md) | co kdy vyprší, varianty řešení, stav předplatných |
| GitHub a Copilot | [09-github-ucastnici.md](09-github-ucastnici.md) | rozhodnutí 23. 11.: hlavní cesta firemní GitHub EG.D a Copilot přes jejich IT (stav licencí ⛔ ověří EG.D), záloha osobní účet s Copilot Free; založený Enterprise trial `egd-lab` zůstává nepoužitý |
| přihlášení agentů do labu | [CLAUDE.md](CLAUDE.md), [tools/README.md](tools/README.md) | `tools/lab-m365.sh`, `tools/lab-prihlaseni-stav.sh`; login dělá jen Pavel |

## Nástroje (`tools/`)

Znovupoužitelné skripty pro agenty, každý má `--help`. Popis po jednom řádku je v [tools/README.md](tools/README.md);
část skriptů (hlavně `prava-*`, `ca-*`, `copilot-*` a některé `overeni-*`) tam zapsaná není. Skupiny podle předpony:

| Předpona | K čemu |
|---|---|
| `lab-*` | přihlášení do labu, účty a weby účastníků, licence, MFA, výdej, záloha tenantu, GitHub |
| `ai-*`, `ca-*`, `job-*` | nasazení a měření LLM gateway a dalších Container Apps a Jobů |
| `data-prava-*`, `prava-*` | sondy práv, tokeny lab uživatelů, API s app rolemi, sdílení položek |
| `dokumenty-*`, `maily-*`, `office-*`, `spo-*`, `spfx-*`, `pw-*` | klikání ve web partech pod lab profilem, PDF přes Graph, nasazení SPFx |
| `napojeni-*`, `pa-*` | CORS sonda, Job s reportem, Exchange RBAC, Power Automate flow přes API |
| `optimalizace-*`, `miniskilly-*` | měření velkých seznamů a indexů |
| `overeni-*` | doměření pro roli Ověřovatel sond |
| `copilot-*` | běh GitHub Copilot CLI v izolovaném „počítači účastníka“ a instalace skillů do něj |
| `balicek-*` | kontrola a sestavení balíčku skillů (`dist/`) |
| `stav.sh`, `pozadavek.sh`, `cil.sh`, `prehled-sync-plan.sh` | zápis stavu do přehledu prací |
| `azure-inventory.sh`, `apfs-dedupe.py` | inventura Azure a nákladů; úspora místa na disku |

## Řízení, audit a zdroje

| Cesta | Co tam je |
|---|---|
| [prehled/](prehled/) | řízení přípravy: [role.md](prehled/role.md) (stálé role sessions a kdo smí editovat který soubor), [galik-otazky.md](prehled/galik-otazky.md) (37 otázek a požadavků T. Galíka se stavem odpovědi), [varianty.md](prehled/varianty.md) (matice požadavky × 6 variant řešení se seznamem děr), `stav/` (jeden JSON na úkol, zapisuje `tools/stav.sh`), `cile/` a `pozadavky/` (stav cílů workshopu a sedmi požadavků), `index.html` (stránka „EG.D hackathon – stav prací“), `workshop-pripraveno.html` (zdroj artefaktu Přehled připravenosti) |
| [audit/](audit/) | kontrola kánonu „každé tvrzení ověřené v labu“: [overeni.md](audit/overeni.md) (dvě kola, nálezy po souborech, top rizika), [pro-overovatele.md](audit/pro-overovatele.md) (co doměřit), uložené výpisy z labu z 22. 11., `test-copilot/` (záznamy běhů Copilota, hlavně nad `egd-pripravenost`) |
| [lab/](lab/) | zdroj výdejní appky a [dukazy/](lab/dukazy/) k účtům účastníků (logy přihlášení, nasazení, testy výdeje) |
| [zdroje/](zdroje/) | výtahy z jiných účtů a pošty: [ppf.md](zdroje/ppf.md), [chocholous-net.md](zdroje/chocholous-net.md); [eon-fonty/](zdroje/eon-fonty/README.md) jsou písma E.ON Head z knihovny E.ON (licence jen pro projekty E.ON, mimo E.ON nešířit) |
| [skripty/](skripty/) | čtyři testovací skripty (výdejní appka, sdílení položky v UI) |
| [07-prilohy/](07-prilohy/) | snímky obrazovky k [07](07-lab-trial-plan.md) |
| `.gitignore`, `.gitleaks.toml`, `.gitleaksignore` | co do gitu nesmí a kontrola tajemství před commitem |

K exportu knihovny E.ON („Engineering Prompt Library“, od EG.D 10. 11.) existuje rozbor s návrhy pro naše skilly
(`prehled/epl-navrhy.html`, zatím není v gitu). Obsah knihovny v repu není, kromě písem výše a barevných tokenů
ve značce E.ON v šabloně první appky.

**Co v gitu není:** tajemství (`*.secrets.json`, `*.secrets/`, `.env`, uložené relace prohlížeče), `node_modules`,
buildy SPFx včetně `.sppkg`, falešné HOME adresáře z běhů Copilota a velká generovaná testovací data, `dist/` (balíček skillů `egd-skills.zip`,
98 souborů, SHA-256 `06da77863b57a35e9f812a3cb4ce47af354b17576e7c0bfe77cdf0e3ede412e4`, a koncept e-mailu
`EMAIL-instalace-skillu.md`, který se neposílá: skilly jsou v repu ve `skills/`) a `archiv/` (dočasné zálohy). Hesla lab účtů
jsou jen lokálně mimo verzování. Commituje pouze hlavní session ([CLAUDE.md](CLAUDE.md)).

## Co je mimo repo

| Co | Kde |
|---|---|
| živý přehled prací | https://claude.ai/artifact/TyBcdy4fjd4KP6aGTSveNT |
| přehled připravenosti | https://claude.ai/artifact/QhDQDbCgReAeY94wmYKTbV |
| obecné skilly a pluginy (devkit, m365-cli-12, ppf-browsermagic, ppf-material, playwright-cli, spfx-*, recon, m365-cli-safe) jako ZIP | [skills-obecne/](skills-obecne/README.md) v repu, zabaleno 25. 11. |
| veřejná kopie repa a stránka pro účastníky | https://github.com/chocholous/egd-hackathon, https://chocholous.github.io/egd-hackathon/ (zdroj `verejne/`, obnova `tools/verejne-repo.sh --repo chocholous/egd-hackathon --pracovni ~/Projects/egd-hackathon --ano`; bez `zdroje/`, písem E.ON a výpisu hostů) |
| pět obecných SharePoint / SPFx skillů z 5.–6. 11. | `~/.claude/skills/{spfx-ship,sharepoint-tenant-recon,m365-cli-safe,spfx-develop,spfx-performance}` (jen lokálně, bez gitu) |
| Citizen AI developer kit | plugin `ppf-citizen-ai-devkit` na PPF GHE (interní), podrobnosti a rozpor verzí v [02](02-skills-a-kit.md) |
| vzor SPFx → API s OBO a rozbor Power Automate | `~/Projects/ppf-rooms` (`docs/obo.md`, `docs/power-automate.md`) |
| měření SharePointu z 6. 11. (v PPF tenantu) a podklad k pozvánce | `~/Projects/ppf-arcade` |
| tři dema ve vizuálu EG.D | `~/Projects/egd-vibecoding` |
| návod „SharePoint Arcade“ pro EG.D | https://claude.ai/artifact/MA6m5Qwvot9W6t5QRDwoCk |
| lab tenant a Azure subscription | [03-lab.md](03-lab.md) |

Podklady vznikly z pošty, Teams a kalendáře PPF, z Gmailu Vorian, z lokálních transkriptů Claude Code a z dotazů do
labu; co se prohledalo a co bylo nedostupné, je v [zdroje/](zdroje/) a na konci [00-co-mame.md](00-co-mame.md).

## Známé rozpory a zastaralá místa

Zapsáno při sestavení tohoto přehledu 24. 11.; opravy patří do příslušných dokumentů.

- **Testy v Copilotu:** [00](00-co-mame.md), [01](01-fakta-workshopu.md), [05](05-otevrene-body.md) a text pod tabulkou
  v [02](02-skills-a-kit.md) tvrdí, že žádný `TEST-copilot.md` neexistuje. Existuje u všech 10 skillů.
- **Počet skillů:** [00](00-co-mame.md) a bod 13 v [05](05-otevrene-body.md) píší 9, složek `skills/egd-*` je 10.
- **Licence po konci trialu:** [07](07-lab-trial-plan.md) (ř. 33, 51, 74–75) a [05](05-otevrene-body.md) bod 0 popisují
  starší plán Business Premium / Business Basic; nasazeno je Business Standard EEA ([08](08-ucty-ucastniku.md) ř. 15,
  [07](07-lab-trial-plan.md) ř. 242, `prehled/stav/lab-licence-bstd.json`).
- **Počet funkcí:** [10](10-container-app.md) uvádí 7 funkcí vlastního serveru, web `egd-ukazky` má 13 karet včetně
  variant SPFx a Power Automate; `sondy/katalog-funkci/README.md` píše „Dvanáct hotových `.sppkg`“ (13. karta je Copilot přes OBO).
- **AI Engineering Library:** [00](00-co-mame.md), [02](02-skills-a-kit.md) a [05](05-otevrene-body.md) píší, že export
  nikdo neotevřel; [zdroje/eon-fonty/README.md](zdroje/eon-fonty/README.md) a `prehled/epl-navrhy.html` z něj 24. 11. čerpají.
- **Odpověď Adriáně:** [05](05-otevrene-body.md) bod 5 ji vede jako neodeslanou, `prehled/stav/odpoved-adriane.json`
  (24. 11.) říká, že Pavel odpověděl ručně a návrh už není potřeba.
- **Denní report a další body z 22. 11.:** [04](04-integrace-test-plan.md) a [05](05-otevrene-body.md) vedou jako
  nezkoušené docx a AI shrnutí v Jobu, `AadHttpClient` pro DB API a atomickou kvótu gateway;
  [10](10-container-app.md) je 24. 11. uvádí jako ✅.
- **Skilly proti vlastním testům:** `README.md` skillu `egd-prvni-appka` a `SKILL.md` skillu `egd-pripravenost` píší,
  že cestu A2 nikdo celou neprošel; [TEST.md](skills/egd-prvni-appka/TEST.md) ji 24. 11. dokládá pod `egd01`.
  `TEST-copilot.md` skillu `egd-prvni-appka` je starší než změny šablony z 24. 11.
- **`08-ucty-ucastniku.md`** v úvodu píše, že projekt není git repozitář; od 23. 11. je.
- **Kdo schvaluje API access** (SharePoint admin, nebo Global Admin) je v dokumentech uvedeno různě a v labu
  je změřen jen Global Admin ([10](10-container-app.md)).
- **Cíle v `prehled/cile/`** mají poslední aktualizaci 22. 11. a neodpovídají novějším stavům v `prehled/stav/`.
