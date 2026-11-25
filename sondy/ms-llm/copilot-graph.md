# LLM „bez Azure“: Microsoft 365 Copilot API přes Graph (díra 4 v `prehled/varianty.md`, 2.4 / 2.6 E)

Session ms-llm, 2026-11-24. Nástroj: `tools/copilot-graph-probe.mjs` (bez hesla a bez MFA). Otevře přihlášený
Chrome profil lab uživatele a na moderní stránce SharePointu si vyžádá token pro Graph tak, jak ho dostává každý
SPFx web part (`moduleLoaderPromise.context._aadTokenFactory`). Pak volá Graph beta:
- `POST /copilot/retrieval` (Retrieval API: vyhledá v SharePointu úryvky textu, které si appka pošle do vlastního modelu),
- `POST /copilot/conversations` a `…/{id}/chat` (Chat API: odpověď Copilota).

## Token, který má SPFx web part ✅

`01-bez-licence-tomas/copilot-graph.json`: `appid 08e18876-6177-487e-b8b5-cf950c1e598c` (SharePoint Online Web Client
Extensibility), upn tomas.prochazka. Scopy v tokenu jsou granty tenantu pro tento principal (stejné pro všechny SPFx
appky), mimo jiné `Sites.Read.All` a `Files.Read.All`. Nechybí `Mail.Read`, `Chat.Read`, `ChannelMessage.Read.All`,
`OnlineMeetingTranscript.Read.All` ani `ExternalItem.Read.All`, protože nejsou udělené.
`POST /_api/SP.OAuth.Token/Acquire` s resource Graph vrací 400 „Resource is not allowed“ (starší cesta tokenu nejde).

## Výsledky

| # | Uživatel / licence | API | Výsledek | Důkaz |
|---|---|---|---|---|
| 1 | tomas.prochazka, bez Copilot licence, token SPFx | Retrieval | ❌ 403 `Authorization Failed - User does not have valid license` (1,8 s). Scopy prošly, chybí jen licence | `copilot-graph/01-bez-licence-tomas/copilot-graph.json` |
| 2 | totéž | Chat (`/conversations`) | ❌ 403 `Required scopes = [Sites.Read.All, Mail.Read, People.Read.All, OnlineMeetingTranscript.Read.All, Chat.Read, ChannelMessage.Read.All, ExternalItem.Read.All]` | tamtéž |
| 3 | tomas.prochazka **s licencí Copilot** (od 07:40Z), token SPFx | Retrieval, filtr `Path:` webu ms-llm | ✅ 200 za 3,6 s, `retrievalHits: []` (na webu nejsou dokumenty) | `copilot-graph/02-s-licenci-tomas/copilot-graph.json` |
| 4 | totéž | Chat (`/conversations`) | ❌ 403, stejných 7 scopů jako ř. 2. Licence nestačí, chybí granty | tamtéž |
| 5 | totéž | Retrieval celý tenant, „Jaký je průměr spokojenosti s prostředím kanceláře?“ | ✅ 200 za 2,7 s: úryvek z `egd-sonda-ms-maily/…/exporty/spokojenost.docx` („Den Hlasů Průměr (1–5) 2026-11-23 1 4“), metadata title/author | `copilot-graph/03-retrieval-tenant/copilot-graph.json` |
| 6 | totéž | Retrieval s filtrem `Path:"…/sites/egd-sonda-power-automate"` | ✅ 200 za 3,6 s: 2 úryvky (sablona-test.pdf a .docx), jen z daného webu | `copilot-graph/04-retrieval-web-pa/copilot-graph.json` |

Retrieval respektuje práva uživatele (vrací jen dokumenty, které tomas vidí; ověřeno předem přes `/search/query` stejným tokenem).
`relevanceScore` byl ve všech úryvcích 0,0.

## Co z toho plyne pro EG.D

- ✅ **Retrieval API ze SPFx jde bez nového grantu**: token web partu (`08e18876`, `Sites.Read.All` + `Files.Read.All`) stačí,
  podmínkou je jen licence Microsoft 365 Copilot u přihlášeného uživatele (bez ní 403 „valid license“).
- ⚠️ **Retrieval není LLM**: vrací úryvky textu (grounding), ne odpověď. Odpověď musí vygenerovat jiný model (u nás gateway / Azure).
  „LLM bez Azure“ tedy Retrieval sám nesplní.
- ❌ **Chat API (skutečná odpověď Copilota) ze SPFx nejde** ani s licencí: vyžaduje 7 delegovaných oprávnění včetně pošty,
  chatů, kanálů a přepisů schůzek. Pro SPFx by je admin musel udělit principalu SharePoint Online Web Client Extensibility,
  tedy **všem SPFx appkám v tenantu**. Volání s udělenými scopy v labu neměřeno ❓ (vyžaduje grant 7 scopů, bez výslovného ano
  nedělám). Varianta s vlastní app registrací pro Chat API (scopy jen pro ni) je také neměřená ❓.

## Licence (Pavel: „Jo, přesuň licenci“, 24. 11.)

`copilot-graph/licence-presun.log`, původní přiřazení alice v `alice-licence-puvodni.json`:
- 07:39:55Z: z alice odebrán SKU `BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS` (`a6d18b68…`); SPE_E5 jí zůstal.
- 07:39:58Z: přidání tomasovi bez `disabledPlans` ❌ `Request_BadRequest … service plans 43de0ff5… (SPE_E5 OFFICESUBSCRIPTION),
  094e7854… (OFFICE_BUSINESS) are mutually exclusive`. Alice měla v balíčku 50 plánů vypnutých (zapnuté Copilot plány).
- 07:40:18Z: přidáno tomasovi se stejnými `disabledPlans` jako alice ✅. `licenseDetails`: `M365_COPILOT_BUSINESS_CHAT`,
  `M365_COPILOT_APPS`, `M365_COPILOT_SHAREPOINT` … = `Success`.
- 08:36:50Z vráceno: tomasovi odebráno, 08:36:52Z alici přidáno z `alice-licence-puvodni.json`; 08:37:02Z kontrola: alice má SKU zpět s 50 vypnutými plány ✅.

## Přihlášení

07:41Z byly všech 14 profilů prohlížeče labu odhlášené (vypršené relace). 08:32Z Pavel přihlásil profil `tomas.prochazka`
(`tools/lab-profil-prihlaseni.mjs`), měření ř. 3–6 proběhlo potom. Agent heslo nezadával.

## Cena / licence

- V labu ✅ je Copilot jen v SKU `BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS` (trial, 1 licence, konec 25. 11. 08:31,
  `06-azure-inventar.md`). Retrieval bez licence = 403 (řádek 1), tedy API je vázané na licenci uživatele.
- Cena licence ani případné placení za volání bez licence nejsou v labu ověřené ❓ (jen ceník Microsoftu).
