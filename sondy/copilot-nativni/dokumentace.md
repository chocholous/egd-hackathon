# Nativní Copilot v SharePoint Online bez vlastního kódu: rešerše dokumentace (stav k 24. 11. 2026)

Metoda: čistě rešerše (WebFetch / WebSearch), nic v labu zkoušeno. Všechna tvrzení jsou 📘 (dokumentace), nejasnosti ❓. Podle kánonu v [CLAUDE.md](../../CLAUDE.md) z toho **zatím nic neplyne jako závěr pro EG.D**, dokud to není ověřeno v labu.

## Klíčové zjištění: model se v 9–11/2026 změnil

- 📘 **Copilot in SharePoint** (dřív „Knowledge Agent", preview od 5/2026) vstoupil do GA od **30. 9. 2026** (rolloutem, funkce se v tenantu objevují postupně). Každodenní funkce jsou součástí licence Microsoft 365 Copilot. „Advanced work" (velký rozsah, tvorba celých webů, obrázky, analytika) běží na **Copilot Credits** (usage-based billing). Zdroj: [copilot-in-sharepoint-get-started](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-get-started) (ms.date 2026-09-25, updated 2026-11-20).
- 📘 **Formát `.agent` (agenti v knihovně/webu) se ruší.** Existující `.agent` soubory fungují do konce března 2027, pak přestanou odpovídat. Od poloviny 11/2026 se agenti ze SharePointu/OneDrivu tvoří přes **Microsoft Copilot Agent Builder** a `.agent` soubor se už neukládá. Zdroj: [upgrade-sharepoint-agents](https://learn.microsoft.com/en-us/sharepoint/upgrade-sharepoint-agents) (ms.date 2026-11-16, updated 2026-11-17). Starší stránky (agents PAYG, manage access) na to upozorňují bannerem.
- 📘 **SharePoint Agents pay-as-you-go platí jen pro `.agent` soubory** a „nevztahuje se na Copilot in SharePoint". Upgradovaní agenti sledují licenční model agentů v Copilot app. Zdroj: tamtéž.
- ❓ Rozpor/zastaralost: starší support stránky (authoring, overview, ask-a-question) stále mluví o „Knowledge Agent turned on" / „Public Preview, opt-in". Aktuální Learn (get-started, 9/2026) říká: „no opt-in step is required", přepínače PowerShell se ruší (viz 8). Brát jako platnou Learn stránku s novějším datem.

## Přehledová tabulka

| # | Položka | Co umí (📘) | Licence | Co zapnout admin | EU / čeština | Zdroj (datum) |
|---|---|---|---|---|---|---|
| 1a | Copilot in SharePoint jako výchozí „agent" webu/knihovny (ikona agenta v záhlaví, plovoucí tlačítko, chat panel) | otázky nad webem, knihovnou, složkou, souborem; scope se mění podle místa | M365 Copilot licence (uživatel) | nic nevyžaduje; řízení přes Site AI a RCD (viz 8) | EU ❓ neuvedeno; čeština ❓ jen přes průnik seznamů | get-started (2026-09-25 / upd. 11-20) |
| 1b | Create agent v knihovně/webu | od poř. 11/2026 přes Copilot Agent Builder, žádný `.agent` soubor | agent nad SharePointem: M365 Copilot, nebo PAYG Copilot Credits (viz 6) | sdílení agentů, přístup k agentům (agent settings v M365 admin center) | ❓ | upgrade-sharepoint-agents (2026-11-16) |
| 1c | Sdílení agenta do Teams | upgradovaný agent: sdílecí odkaz vložit do chatu/kanálu Teams (agent se musí do chatu přidat znovu). `.agent` v Teams funguje do 3/2027 | dtto | sdílení agentů v admin center | ❓ | upgrade-sharepoint-agents |
| 1d | Vložení agenta na stránku | **Agent Chat web part** (roadmap RM575298 / MC1559633): preview 11/2026, GA 1/2027, rollout 11/2026–3/2027; „coming soon" v Learn. Dosavadní **Agent Link web part** jen odkaz, který otevře agenta v postranním panelu | agent dle licence | žádná akce admina (MC) | ❓ | upgrade-sharepoint-agents; [mc.merill.net RM575298](https://mc.merill.net/message/RM575298) (agregátor, ne primární) |
| 2 | Copilot v editoru stránek | tvorba stránky z promptu / prázdné / ze šablony, úprava existující (obsah, layout, sekce, web party), Design ideas, přepis textu v rich text editoru (délka, tón) | M365 Copilot | nic; starší stránka tvrdí „Knowledge Agent musí být zapnut" (❓ zastaralé) | EU ❓; čeština ❓ | [authoring overview](https://support.microsoft.com/en-us/sharepoint/copilot-in-sharepoint/authoring-with-ai-in-sharepoint-an-overview) (bez data), [overview](https://support.microsoft.com/en-us/sharepoint/copilot-in-sharepoint/copilot-in-sharepoint-an-overview) (bez data) |
| 3 | Copilot v knihovnách: souhrn, porovnání, otázky | souhrn vybraných souborů, FAQ ze souboru, porovnání souborů, audio přehled (jen Word/PDF), otázky nad souborem/knihovnou | M365 Copilot | nic | EU ❓; čeština ❓ | [ask-a-question](https://support.microsoft.com/en-gb/sharepoint/copilot-in-sharepoint/ask-a-question-about-content), [compare](https://support.microsoft.com/en-us/SharePoint/copilot-in-sharepoint/compare-your-files-with-ai) (bez dat) |
| 4 | Copilot v Lists | otázky (scope = položky seznamu), tvorba seznamu z popisu, přidání sloupců/položek, views z metadat, převod nahraného Excelu na seznam (z prezentace MS), dashboard ze seznamu (blog) | M365 Copilot (běžné); vytváření „ve velkém" = Credits | nic | ❓ | ask-a-question; [create-views](https://support.microsoft.com/en-gb/sharepoint/copilot-in-sharepoint/create-views-in-a-library-or-list); get-started (tabulka) |
| 5 | Autofill columns (dříve Knowledge Agent) | navrhne sloupce a extrakční prompty z prvních 20 souborů; nové soubory se zpracují automaticky | M365 Copilot (běžný Autofill), **Advanced Autofill** = Credits | Advanced: usage-based billing + site admin zapne „Share credits for advanced autofill columns" v Site AI | zpracuje jen **anglické soubory**; prompty/odpovědi ve všech jazycích Copilotu (čeština v seznamu Copilotu ✅📘) | [autofill columns](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-create-autofill-columns) (ms.date 2026-06-15 / upd. 10-06) |
| 6 | Copilot Chat zdarma (Entra) a agenti za zprávy/Credits | viz sekce 6 | viz sekce 6 | M365 admin center > Copilot > Billing & usage | ❓ | prerequisites (2026-11-16) |
| 7 | Omezení | viz sekce 7 | | | | |

## 1) Výchozí agent, Create agent, Teams, vložení na stránku

Přečteno: [get-started-sharepoint-agents](https://learn.microsoft.com/en-us/sharepoint/get-started-sharepoint-agents) (ms.date 2026-10-15), [manage-access-agents-in-sharepoint](https://learn.microsoft.com/en-us/sharepoint/manage-access-agents-in-sharepoint) (ms.date 2026-10-15, updated 2026-10-31), [upgrade-sharepoint-agents](https://learn.microsoft.com/en-us/sharepoint/upgrade-sharepoint-agents) (2026-11-16), [copilot-in-sharepoint-get-started](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-get-started), [copilot overview (support)](https://support.microsoft.com/en-us/sharepoint/copilot-in-sharepoint/copilot-in-sharepoint-an-overview).

- 📘 Site AI settings (Settings > Site AI): vlastník webu vybere, který agent se otevře z ikony v záhlaví (Copilot in SharePoint, nebo vlastní agent), může skrýt tlačítko Copilot pro návštěvníky a zapnout advanced document processing. Po 3/2027 zůstane jediný „main agent" = Copilot a nastavení zmizí.
- 📘 Podle starší Learn stránky (manage-access, 10/2026) uživatel vytvoří agenta, když má licenci Copilot a smí přidávat soubory na web; agent byl `.agent` soubor, oprávnění se řídí oprávněním souboru. Agent nesmí vidět obsah, ke kterému uživatel nemá přístup.
- 📘 Nový stav (upgrade, od poloviny 11/2026): vytváření přes Copilot Agent Builder, agent je mimo SharePoint oprávnění. Sdílí se na lidi/skupiny M365/e-maily (ne na SharePoint skupiny), jinak je soukromý. Spravuje se přes Copilot app a Agent 365. Agent Builder agenti se dají použít v Copilot app, Teams a SharePointu.
- 📘 Sdílení do Teams: zkopírovat sdílecí odkaz agenta a vložit do zprávy chatu/kanálu; všichni `.agent` agenti v jednom chatu se musí upgradovat najednou.
- 📘 Vložení na stránku: Agent Chat web part ještě „coming soon" (Learn k 17. 11. 2026). ❓ Nevíme, zda je ve stavu preview už dostupný v našem tenantu. Agent Link web part existuje (jen odkaz otevírající panel).
- 📘 Pay-as-you-go uživatelé v Agent Chat web part: využití neotitulovaných uživatelů se konsoliduje pod Copilot app PAYG.
- 📘 Skills: nová rozšíření Copilot in SharePoint (osobní skill v OneDrive, site skill jako `SKILL.md` v knihovně Agent Assets; Edit = tvorba, View = použití; bez externích systémů a vlastního kódu; žádný admin přepínač). Zdroj: [copilot-in-sharepoint-skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills) (2026-11-06).

## 2) Copilot v editoru stránek

Přečteno: [authoring overview](https://support.microsoft.com/en-us/sharepoint/copilot-in-sharepoint/authoring-with-ai-in-sharepoint-an-overview) (bez data na stránce), výsledky vyhledávání (jen snippety, tělo nepřečteno): [create pages](https://support.microsoft.com/en-us/sharepoint/sites-pages/create-pages-with-ai-in-sharepoint), [blog SharePoint AI page authoring](https://techcommunity.microsoft.com/blog/spblog/sharepoint-ai-page-authoring-select-describe-and-refine/4553193).

- 📘 Tvorba stránky z chatu, prázdné stránky nebo šablony; úprava existující stránky; Design ideas; přepis textu v rich text editoru (změna délky, tónu, nahradit/vložit pod).
- 📘 Také z overview: vytvoření sekce, FAQ web part s AI; v říjnovém blogu: HTML jako SharePoint stránky, komentáře k vygenerovanému HTML (s M365 Copilot licencí); obrázky generovat/upravovat = Credits. Zdroj: [What's new October 2026](https://techcommunity.microsoft.com/blog/spblog/what%E2%80%99s-new-in-copilot-in-sharepoint-october-2026/4535423) (1. 10. 2026).
- ❓ Jazyky, EU, limity: na stránkách o authoringu neuvedeny.

## 3) Copilot v knihovnách

- 📘 Souhrn vybraných souborů, FAQ ze souboru, porovnání souborů, audio přehled, otázky: z [overview](https://support.microsoft.com/en-us/sharepoint/copilot-in-sharepoint/copilot-in-sharepoint-an-overview). Scope otázek: celá knihovna / vybrané složky / vybrané soubory; když neodpoví, hledá na webu ([ask-a-question](https://support.microsoft.com/en-gb/sharepoint/copilot-in-sharepoint/ask-a-question-about-content)).
- 📘 Až **5 souborů** najednou (ask-a-question; compare: „up to 5 files" ze snippetu vyhledávání). Podporované typy: DOC, DOCX, PPT, PPTX, XLSX, FLUID, LOOP, PDF, TXT, RTF, ASPX, HTM, HTML, ODT, ODP; audio přehled jen Word a PDF.
- Další: vytvoření knihovny z popisu (+ vzorový soubor) s AI sloupci; vyžaduje licenci Copilot a právo vytvářet knihovny ([create-document-library](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-create-document-library), ms.date 2026-09-24). Pravidla/workflows: [automate workflows](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-automate-workflows) (nepřečteno).
- Role: „consumers" čtenáři/členové s read, „content managers" potřebují oprávnění Manage list (sloupce, pravidla, views). Zdroj: overview.

## 4) Copilot v Lists

- 📘 Otázky nad seznamem: scope = položky seznamu ([ask-a-question](https://support.microsoft.com/en-gb/sharepoint/copilot-in-sharepoint/ask-a-question-about-content)). Views v seznamu z metadat ([create-views](https://support.microsoft.com/en-gb/sharepoint/copilot-in-sharepoint/create-views-in-a-library-or-list)).
- 📘 Tvorba a úprava seznamů, sloupců a položek je v „everyday" tabulce get-started (součást M365 Copilot licence); ve velkém = Credits.
- ❓ Přesné podmínky „generování seznamů z popisu" a „převod Excelu na seznam": jen z prezentace [Getting Started Guide Prompt Library](https://adoption.microsoft.com/files/sharepoint/GettingStartedGuidePromptLibrary.pdf) a komunitního postu (březen 2026, omezení na ~60 řádků × 8 sloupců, podle jednoho uživatele). Samostatnou Learn stránku pro Lists jsem nenašel.

## 5) Autofill columns / knowledge agent

Přečteno celé: [copilot-in-sharepoint-create-autofill-columns](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-create-autofill-columns) (ms.date 2026-06-15, updated 2026-10-06).

- 📘 Návrh sloupců z posledních max. **20 souborů** (nebo vybraných); úprava instrukce se testuje na max. 10 souborech; po uložení se nové soubory zpracují automaticky bez ohledu na to, zda nahrávající má licenci Copilot (kryje licence Copilot, ne PAYG).
- 📘 Advanced Autofill: rychlejší zpracování za Copilot Credits, jen organizace s usage-based billing; site admin zapne v Site AI > „Share credits for advanced autofill columns" (sdílí jen své vlastní credits). Bez credits se použije kapacita z licence.
- 📘 Podporované typy: .csv, .docx, .pdf, .xlsx a další M365 formáty. Sloupce: Text, Multiple lines, Number, Yes/No, Date, Choice, Hyperlink, Currency, Managed metadata. Nepodporováno: Person/Group, Location, Image, Lookup.
- 📘 Doporučení: max. 10 sloupců na knihovnu, soubory do 65 stran; šifrované soubory nelze; managed metadata jen prvních 100 termů; nepodporované knihovny FormServerTemplates, SitePages, Style Library, SiteAssets; nepodporované subwebs.
- 📘 **Jazyky:** prompty a odpovědi ve všech jazycích Microsoft Copilot, ale **zpracovat lze jen soubory v angličtině**. ❓ To je pro české dokumenty EG.D zásadní omezení, v labu ověřit.

## 6) Copilot Chat zdarma pro Entra uživatele, agenti za zprávy, Copilot Studio

Přečteno: [extensibility prerequisites](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/prerequisites) (ms.date 2026-11-16; sekce Agent capabilities and licensing models; URL přesměrována na learn.microsoft.com/en-us/plugins/prerequisites), [sharepoint-agents-azure-billing](https://learn.microsoft.com/en-us/sharepoint/sharepoint-agents-azure-billing) (2026-10-15), [license options](https://learn.microsoft.com/en-us/copilot/plan/copilot-license-options) (2026-10-19; zpětně `microsoft-365-copilot-licensing`).

- 📘 Copilot Chat je dostupný všem uživatelům M365 (Entra). Bez PAYG nemá agenty grounded na **SharePoint data**, Copilot connectors ani embedded soubory (❌ v tabulce); může web search, instrukce, akce, code interpreter. S usage-based billingem (Copilot Credits) ✅ SharePoint data, connectors, embedded soubory, Dataverse; e-mail, lidé, Teams zprávy a schůzky jen s plnou licencí Copilot.
- 📘 PAYG pro SharePoint agenty (`.agent`): nutná Azure subscription + resource group, role SharePoint admin a Owner/Contributor v Azure; billing policy v M365 admin center (Copilot > Billing & usage) a **připojit službu „SharePoint agents"**; max. 10 politik, 1 bezpečnostní skupina na politiku, jen členové skupiny mají přístup. Sazba: generative answer 2 zprávy + tenant graph grounding 10 zpráv = **12 zpráv na složitý prompt**; interaktivní použití v M365 aplikacích autentizovanými uživateli Copilot bez poplatku. Účtuje se pod měřidlem Copilot Studio. Platí jen pro `.agent` (viz výše).
- 📘 Nové: Copilot in SharePoint „advanced work" = Copilot Credits přes spending policy: M365 admin center > Copilot > Cost management > Add spending policy > Agents and services > „Advanced work in SharePoint" ([get-started](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-get-started)). Pro nelicencované uživatele **není** Copilot in SharePoint dostupný („Only Microsoft Copilot licensed users can access Copilot in SharePoint and its services").
- 📘 Copilot Studio: agenti publikovaní do SharePoint kanálu = `.agent`; od upgrade se publikují do Copilot app a zobrazí v Agent Chat web partu. Agenti grounded na SharePointu v Copilot Studiu vyžadují PAYG nebo licenci Copilot Studio.
- ❓ Aktuální cena za zprávu/Credit nepřečtena z Learn (jen 2025 tisk: 0,01 USD/zpráva); neuvádět bez ověření. [Copilot Credits Guide](https://aka.ms/CopilotCredits/LicensingGuide) a [usage-based billing overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/usage-based-billing-overview-copilot-credits) jsem nečetl (jen v seznamu vyhledávání).

## 7) Omezení (souhrn)

- 📘 Soubory najednou: 5 (sumarizace/porovnání/ask-a-question); Autofill: 20 souborů při konfiguraci, 10 sloupců doporučeno, 65 stran, jen anglické soubory.
- 📘 Týdenní limity z preview zrušeny; mohou platit denní „service protection" limity (get-started).
- 📘 Seznam URL pro include/exclude v PowerShell max. 100 položek.
- ❓ Limit velikosti souboru: oficiální stránku jsem nenašel. Fóra zmiňují ~150 MB (neověřeno).
- 📘 Government cloudy (GCC, GCC High, DoD, 21Vianet) Copilot in SharePoint nepodporují.
- 📘 Jazyky: Copilot in SharePoint podporuje jen jazyky ze **průniku** seznamů [SharePoint](https://support.microsoft.com/office/languages-supported-by-sharepoint-dfbf3652-2902-4809-be21-9080b6512fff) a [M365 Copilot](https://support.microsoft.com/office/supported-languages-for-microsoft-365-copilot-94518d61-644b-4118-9492-617eea4801d8). ✅📘 Čeština je v seznamu Copilotu (stránka „Last updated: September 2026"). ❓ Seznam jazyků SharePointu jsem nečetl, průnik pro češtinu neověřen. Mimo seznam „not tested or validated".
- ❓ **EU:** v primárních Learn stránkách o Copilot in SharePoint není uvedena dostupnost po regionech ani EU Data Boundary. Sekundární zdroj (topedia blog) tvrdí, že preview model byl od Anthropic a mimo EUDB. Message Center MC1546438: od 9. 12. 2026 se Claude modely v Copilotu pro EU/EFTA tenanty zapínají ve výchozím stavu se zpracováním v EUDB (agregátor). Model GA: „Microsoft-managed reasoning model from OpenAI" (get-started). Nutno ověřit v tenantu E.ON/EG.D a v Message Center.

## 8) Co musí zapnout admin (souhrn)

| Co | Kde | Zdroj |
|---|---|---|
| Licence Microsoft 365 Copilot uživatelům | M365 admin center; per-user lze vypnout plán „Microsoft Copilot for SharePoint" (vypne i Copilot v OneDrive a authoring stránek) | manage-access (2026-10-31) |
| Dostupnost Copilot in SharePoint | po GA bez opt-inu; Site AI settings (vlastník webu); PowerShell `Set-SPOTenant -KnowledgeAgentScope AllSites/IncludeSelectedSites/ExcludeSelectedSites/NoSites` (výchozí NoSites v preview), `KnowledgeAgentSelectedSitesList` (max. 100), `...Operation`; SPO Management Shell ≥ 16.0.26615.12013; **parametry se ruší, platí do 1. 11. 2026** | get-started |
| Restricted Content Discoverability | na webu s RCD zmizí Copilot in SharePoint, AI akce i ikona agenta; nelze použít obsah webu v agentech | get-started, manage-access |
| Restricted access control, DLP + sensitivity labels | omezení přístupu k obsahu pro Copilot; DLP může vyloučit soubory ze zpracování | manage-access |
| Copilot control system > Agents | blokování agenta v Copilot Chat (neplatí pro OneDrive, SharePoint, Teams) | manage-access |
| PAYG / Credits | M365 admin center > Copilot > Billing & usage / Cost management; Azure předplatné | agents-azure-billing, get-started |
| Monitoring | SPO Management Shell, Purview audit, Cost Management, SharePoint Advanced Management (Agent Insights) | [monitor-agent-usage](https://learn.microsoft.com/en-us/sharepoint/monitor-agent-usage) (2026-10-15) |

## Co jsem opravdu přečetl (celé stránky přes WebFetch)

Learn: get-started-sharepoint-agents, manage-access-agents-in-sharepoint, sharepoint-agents-azure-billing, upgrade-sharepoint-agents, monitor-agent-usage, copilot-in-sharepoint-get-started, copilot-in-sharepoint-skills, copilot-in-sharepoint-create-autofill-columns, copilot-in-sharepoint-create-document-library, extensibility/prerequisites (agent licensing), copilot/plan/copilot-license-options. Support: copilot-in-sharepoint-an-overview, authoring-with-ai overview, ask-a-question-about-content, create-views-in-a-library-or-list, supported languages for M365 Copilot (jen dotaz na češtinu). Tech Community: What's new October 2026 (shrnutí).

Jen výsledky vyhledávání / snippety (tělo nečteno, bráno s rezervou): compare-your-files-with-ai (5 souborů), roadmap RM575298 / MC1559633 (agregátor mc.merill.net), topedia blog o GA a EUDB, MC1546438, komunitní posty (150 MB, Lists), Copilot Chat free (starší tisk 2025).

Nečteno vůbec: Copilot in SharePoint automate workflows, usage-based billing overview, Copilot Credits Guide, seznam jazyků SharePointu, Microsoft 365 roadmap přímo, Message Center GA záznam, GitHub MicrosoftDocs / pnp / microsoft-365-docs (zdrojový repo OfficeDocs-SharePoint-pr je jen odkazován v metadatech).

## Návrh, co ověřit v labu (kánon)

1. Zda je Copilot in SharePoint v lab tenantu k dispozici bez licence Copilot (dokumentace: ne) a s ní.
2. Funguje Autofill na českých dokumentech (dokumentace: jen angličtina).
3. Výchozí agent webu po 11/2026: jde vytvořit agenta přes Agent Builder ze SharePointu, existuje už Agent Chat web part?
4. Co vidí uživatel Copilot Chat bez licence nad SharePoint obsahem (bez PAYG vs s PAYG).
5. EU: v nastavení tenantu a Message Center ověřit model a EUDB.
