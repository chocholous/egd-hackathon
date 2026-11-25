# 07 — Jak lab tenant přežije konec trialů (M365 25. 11., Azure 26. 11.)

**Stav k 2026-11-22 večer (2. verze po auditu).** V tenantu ani v Azure se zatím nic neměnilo, licence také ne.
Značky: ✅ změřeno (příkaz v [Příloze](#příloha-důkazy)) · 📘 dokumentace · ❓ neověřeno · ⛔ ověřit teď nejde (důvod uveden).
Výchozí data: [06-azure-inventar.md](06-azure-inventar.md), [03-lab.md](03-lab.md). Účty účastníků řeší [08-ucty-ucastniku.md](08-ucty-ucastniku.md) (session lab-ucty).

## Výchozí stav

| Co | Konec (SEČ) | Dnes |
|---|---|---|
| SPE_E5 trial (Microsoft 365 E5) | **25. 11. 04:04** ✅ [P1](#p1) | **23 z 25** přiděleno ✅ [P2](#p2): 13 původních účtů (pavel.admin, alice, bob a 10 testovacích osob) a egd01–egd10 |
| Microsoft 365 Business Premium + Copilot trial (`BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS`) | 25. 11. 09:31 ✅ [P1](#p1) | 1/1 (alice) ✅ [P2](#p2) |
| Agent 365 trial (`AGENT_365`) | 25. 11. 11:37 ✅ [P1](#p1) | 0/25, nepoužívá se ✅ [P2](#p2) |
| Azure free account, kredit ~169 USD | **26. 11. 03:08** ✅ ([06](06-azure-inventar.md)) | spending limit On |

Workshop začíná **25. 11. ve 12:30**, tedy 8 hodin po konci E5.

**Co se stane bez zásahu:**
- Předplatné přejde do stavu **Disabled** 📘. Uživatelé se nepřihlásí do aplikací, SharePoint a OneDrive jsou jen pro čtení a licence nejde přidělovat 📘.
- U přímého nákupu přes MCA Microsoft od 9. 2. 2026 ruší fázi „Expired“ 📘. Zda to platí i pro trialy, dokumentace neříká ❓.
- Jak dlouho se drží data, dokumentace uvádí rozporně: návod k trialům píše „trvale smazána“, tabulka na stejné stránce 30 + 90 dní (stejně to dnes uvádí [06](06-azure-inventar.md)). Všechno je ❓.
- ⛔ Ověřit se to dá až po expiraci. Graph `nextLifecycleDateTime` ukazuje jen čas změny stavu (25. 11. 03:04Z ✅ [P1](#p1)), ne na jaký stav se přejde.

Pro workshop to v horším případě znamená, že účastníci ve 12:30 nemohou nic nasadit.

**Termín:** všechno kolem M365 musí být hotové **nejpozději 24. 11. večer**. Přehození vyzkoušet na jednom účtu hned po spuštění nového trialu (viz Kroky).

## Srovnání variant (10 účastníků + Pavel = 11 licencí, nebo všech 23 dnešních)

| # | Varianta | Co zůstane | Co se ztratí | Cena | Práce | Co chce od IT E.ON | Dopad na účastníky při přehození | Riziko | Udělat do |
|---|---|---|---|---|---|---|---|---|---|
| 1 | ~~**Prodloužit E5 trial**~~ **nejde** ✅ [P8](#p8) | (vše, přiřazení by zůstala) | nic | 0 | 2 min, klik Pavla | nic, lab | žádný | ✅ 23. 11.: „Extend trial end date“ u E5 vrátil „Trial end date can't be extended“ [P8](#p8). API na to není 📘 | (vyřazeno) |
| 2 | **Nový trial jiného SKU** ve stejném tenantu (Microsoft 365 E3 = `SPE_E3`, Microsoft 365 Business Premium = `SPB`, Microsoft 365 Business Standard = `O365_BUSINESS_PREMIUM`; pozor, název SKU Business Standard obsahuje „PREMIUM“), pak přehodit licence skriptem | uživatelé, weby, app catalog, appky, hosté, Entra, Azure | Copilot (trial BP+Copilot, alice), Agent 365 (nepoužívaný), funkce jen z E5 | **0** po dobu 1 měsíce, 25 licencí ✅ [P8](#p8) (nabídka Business Premium (Trial) v admin centru), tedy zhruba do 23.–24. 12. | 5 min klik Pavla + 2× skript | nic, lab | Když se přehazuje den předem a nové SKU se přidá dřív, než se E5 odebere, nic nepoznají ❓. Při přehození uprostřed workshopu riskujeme minuty výpadku SharePointu u účastníka, než se licence propíše (u přidělení M365 licence běžně minuty až desítky minut 📘), proto ne v den workshopu | ✅ 23. 11. [P8](#p8): E3 trial v Marketplace (MCA) **není** (jen nákup od 31,88 €); **Business Premium (Trial)** dostupný (zdarma 1 měsíc, 25 licencí); Business Standard má „TRIAL AVAILABLE“. Trial se může na konci převést na placený, proto vypnout opakovanou fakturaci 📘 | start 23.–24. 11. |
| 3 | **Koupit placené licence** s měsíčním závazkem (Microsoft 365 Business Basic = `O365_BUSINESS_ESSENTIALS`) | totéž co 2 | totéž co 2 a navíc desktopové Office | Basic bez Teams **4,67 €**, s Teams 6,07 € / uživ. / měs. 📘 (roční závazek). Příplatek za měsíční závazek ❓, bývá +5 až 20 %. **Odhad: 11 licencí ≈ 51–80 €/měs., 23 ≈ 107–168 €/měs.** | 10 min nákup Pavlem + 2× skript | nic, lab | stejný jako u 2 | nízké. Zrušit jde kdykoli, peníze se vracejí jen do 7 dní a licence jde ubírat jen do 7 dní 📘 (⛔ ověřit by šlo jen nákupem). Samostatný SharePoint Plan 1 není v ceníku 📘, ověří Pavel v Purchase services ⛔ | 24. 11. |
| 4 | **Záloha, smazání tenantu a nový trial tenant** | jen to, co se znovu nasadí skripty | 55 účtů (z toho 31 zasedaček `ppfgate_*` a `recepce-ppfgate`), 14 webů včetně obsahu, 10 balíčků v app catalogu, 21 registrací appek, 20 skupin, 8 hostů ✅ [P3](#p3) (+ 10 účtů a 30 webů egd z [08](08-ucty-ucastniku.md)). Hosté musí znovu přijmout pozvánku. Přesun Azure subscription do jiného adresáře rozbije managed identity, RBAC, Easy Auth a OBO u ppf-rooms 📘 | 0 za trial, ale i nový E5 trial skončí za 30 dní | **1–2 dny** ❓. Smazání tenantu trvá dny až týdny, doména se hned neuvolní 📘 | nic, lab | všichni začínají znovu (nové účty, weby, pozvánky) | **vysoké.** Hosté z EG.D přijímali pozvánky týdny ([03](03-lab.md)). Nestihne se do středy | nedává smysl |

**Azure (nezávisle na M365):**

| Varianta | Co se stane | Cena |
|---|---|---|
| Nic nedělat | 26. 11. v 03:08 se subscription zakáže 📘. Workshop 25. 11. ještě poběží. Upgrade jde i po zakázání a zdroje se pak znovu zapnou 📘. Jak dlouho se drží data, není v nalezené dokumentaci ❓ (06 to vede také jako neověřené) | 0 |
| **Upgrade na pay-as-you-go** (Pavel v portálu) | zbylý kredit platí do 26. 11. a 12měsíční free služby zůstanou 📘. ⛔ Ověřit se to dá až po upgradu, který vyžaduje Pavlovy platební údaje | ≈ **35 €/měs.** ✅ ([06](06-azure-inventar.md), sestava k 22. 11. **bez** dnešních sond `rg-egd-sonda-*`, které mezitím přidaly AOAI, APIM, SQL a Container Apps ✅ [P5](#p5); jejich cena ❓) |
| ~~Upgrade + zmenšit `plan-mcp-lab` z B2 na B1~~ **nedoporučuji** | Na plánu je 8 MCP webapp z dřívějšího labu (7 běží) ✅ [P4](#p4). Workshop na ně nestojí: žádná sonda, nástroj ani ppf-rooms neodkazuje na jejich názvy ✅ [P4](#p4) (ppf-rooms a OBO běží v `rg-ppf-rooms-lab` na Container App/Functions). **Ale B1 nestačí paměťově:** plán dnes využívá průměrně ≈ 1,7 GB a ve špičce ≈ 2,6 GB z 3,5 GB, B1 má 1,75 GB 📘 ✅ [P4](#p4), takže MCP servery by na B1 padaly. Zastavení webapp plán **neodečte**, platí se za plán. Ušetřit by šlo jen smazáním části webapp nebo plánu, a to je nevratné rozhodnutí Pavla, které 07 nenavrhuje | Základna z Cost Management: B2 20,06 € za 30 dní ✅ ([06](06-azure-inventar.md)). B1 stojí polovinu B2 (retail API 0,0162 × 0,0323 €/h ✅ [P4](#p4)) → úspora by byla ≈ 10 €/měs., celkem ≈ 25 €/měs. |

## Doporučení

**Varianta 2, s variantou 1 jako bonusem a variantou 3 jako záchranou. Azure upgradovat po workshopu, ale před 26. 11. 03:08, sestavu neměnit.**

1. Je to zdarma a nic se nepřenáší, tenant zůstává stejný.
2. 25 licencí (✅ [P8](#p8), nabídka Business Premium (Trial)) pokryje 10 účastníků i 13 dnešních účtů.
3. Prodloužení E5 nejde ✅ [P8](#p8) a E3 trial v nabídce není ✅ [P8](#p8), takže konkrétně **Business Premium (Trial), `SPB`**; Business Standard je náhradník.
4. Pokud žádný vhodný trial není, koupit 11× Business Basic s měsíčním závazkem (odhad 51–80 €). Zbylé testovací účty mohou zůstat bez licence.
5. Po workshopu: trial z varianty 2 skončí kolem 23. 12. Pak buď Basic pro ty, kdo lab ještě používají, nebo nechat tenant přejít do stavu jen pro čtení.

Rozpočet: varianta 2 = 0 € a Azure ≈ 35 €/měs. (bez sond). Vejde se do ~50 USD teď i do 300 USD na workshop. Varianta 3 přidá odhadem 51–80 €/měs.

## Kroky

### Pavel klikne (admin centrum jako `pavel.admin@pavelchocholousgmail.onmicrosoft.com`, ne firemním účtem PPF)

1. **22.–23. 11., kontrola, nic nekupovat.** https://admin.microsoft.com → Billing → Your products:
   - a) **Microsoft 365 E5**: je tam „Extend trial / Prodloužit zkušební verzi“? Pokud ano, klikni (zdarma) a pokračuj jen bodem 1b.
   - b) U všech tří trialů zkontroluj **Recurring billing / Opakovaná fakturace = Off**. Jinak se může E5 převést na placených 25 × 58,13 € měsíčně 📘 (ceník E5 cs-cz). Graph tento stav neukazuje ⛔.
   - c) Napiš mi, co jsi viděl. **Nebo** se jednou přihlas do trvalého profilu: `tools/lab-profil-prihlaseni.mjs pavel-admin https://admin.microsoft.com/#/subscriptions` (otevře viditelný Chrome, přihlásíš se včetně MFA a okno zavřeš). Pak 1a i 1b přečtu headless z profilu `~/.config/ppf-rooms-lab/profily/pavel-admin` sám a nic tam nekliknu ❓ (jestli admin centrum v headless profilu nevyžádá nové MFA, se ukáže).
2. **Pokud prodloužení není:** Billing → Purchase services → „Start free trial / Vyzkoušet zdarma“, v tomto pořadí:
   - **Microsoft 365 E3** (`SPE_E3`)
   - **Microsoft 365 Business Premium** (`SPB`)
   - **Microsoft 365 Business Standard** (`O365_BUSINESS_PREMIUM`, název SKU je matoucí, jde o Business Standard)

   Spusť **jeden** z nich **23. 11.** (ať je den na pilot a opravu). Po spuštění nastav opakovanou fakturaci na Off.

   **Stav 23. 11. ~11:30 ✅ [P8](#p8):** 1a nejde („Trial end date can't be extended“); 1b u E5 = Off; E3 trial v nabídce není.

   **Rozhodnutí Pavla 23. 11. (po [P9](#p9)):** trial Business Premium se **nespouští** (checkout zavřen bez „Place order“; po něm by se trial sám převedl na placený, minimálně 1 licence × 22,87 € + DPH). Licence po konci E5 Pavel zajistí **partnerskou licencí Microsoft 365 Business Basic**. Další kroky agenta: až se partnerské SKU objeví v `subscribedSkus`, poslat lab-ucty `skuPartNumber` a počet licencí, pak pilot na egd01 (SharePoint, app catalog, SPFx) a výsledek sem.
3. **Záloha:** Purchase services → **Microsoft 365 Business Basic** (`O365_BUSINESS_ESSENTIALS`, stačí bez Teams) → **11 licencí, měsíční závazek**. Platbu děláš sám.
4. **Pilot (ty, 5 min, po kroku 2 nebo 3 a mém přehození egd01):** přihlas se jako egd01 (výdejní stránka) na `/sites/egd01-dev`. Host se kontroluje bez tebe: `tools/lab-host-kontrola.mjs host-ppf` (uložený profil hosta chocholous@ppf.cz, jen čtení, [P7](#p7)).
5. **Azure, 25. 11. po workshopu, nejpozději 26. 11. před 03:08:** https://portal.azure.com → Subscriptions → „Azure subscription 1“ → **Upgrade**. Platební údaje zadáváš sám.

### Agent udělá až po tvém „ano“ v chatu (zatím **nic neproběhlo**)

| Po kroku | Kdo | Co spustí | Kontrola |
|---|---|---|---|
| 1a (prodlouženo) | lab-trial | nic. Ověří nové `nextLifecycleDateTime` ([P1](#p1)) | datum > 25. 11. |
| 2 nebo 3, **pilot** | lab-trial | `tools/lab-ucty-licence.py --sku <SKU> --ucty 1` (jen egd01, E5 zatím nechá) | `tools/lab-ucty-licence.py --stav`, pak krok 4 Pavla |
| 2 nebo 3, po úspěšném pilotu, 13 původních účtů | lab-trial | `tools/lab-licence-prehod.py --z SPE_E5 --na <SKU>` (náhled), pak s `--provest`. Přidá nové SKU, E5 nechá doběhnout. Účty egd přeskakuje | `tools/lab-licence-prehod.py --sku` (obsazenost) |
| 2 nebo 3, egd01–egd10 (**samostatný krok**) | session lab-ucty (nebo lab-trial, když lab-ucty neběží) | `tools/lab-ucty-licence.py --sku <SKU>` **bez** `--remove-sku` (nové SKU se přidá vedle E5, takže licence se SharePointem nechybí ani minutu). E5 se odebere až po 25. 11. příkazem `--jen-odebrat SPE_E5`. Totéž platí pro 13 původních účtů. Dohodnuto s lab-ucty kvůli sjednocení s [08](08-ucty-ucastniku.md) | `tools/lab-ucty-licence.py --stav` |
| 5 (Azure) | lab-trial | nic, upgrade klikáš ty. Sestavu neměním (B1 nestačí, viz tabulka Azure). Budget `mcp-lab-budget` zůstává na dnešních **20 €/měs.** ✅ [P4](#p4). Je to jen upozornění, po upgradu bude přečerpaný (náklad ≈ 35 €). Jestli ho zvednout a na kolik, rozhodneš ty | `tools/azure-inventory.sh` |

`skuPartNumber` náhrad (shodně s [08](08-ucty-ucastniku.md)):

| Produkt | skuPartNumber 📘 | Ověřeno v `subscribedSkus` tenantu |
|---|---|---|
| Microsoft 365 E3 | `SPE_E3` | ne, trial v nabídce není ✅ [P8](#p8) |
| Microsoft 365 Business Premium | `SPB` | ne, trial zatím nespuštěn (23. 11. 11:40 `--sku` ukazuje jen BP+Copilot, FLOW_FREE, AGENT_365, SPE_E5) |
| Microsoft 365 Business Standard | `O365_BUSINESS_PREMIUM` | ne, trial nespuštěn |
| Microsoft 365 Business Basic | `O365_BUSINESS_ESSENTIALS` | ne, nekoupeno |

Skutečný název se ověří příkazem `tools/lab-licence-prehod.py --sku` hned po spuštění. Oba skripty neznámé SKU odmítnou.

## Neověřeno a proč

| Tvrzení | Stav | Proč nejde ověřit teď |
|---|---|---|
| ~~U E5 existuje „Extend trial“~~ | ✅ vyřešeno | tlačítko je, ale vrací „Trial end date can't be extended“ [P8](#p8) |
| ~~Které trialy tenant nabídne~~ | ✅ vyřešeno | BP (Trial) a Business Standard ano, E3 ne [P8](#p8) |
| Stav opakované fakturace trialů | ✅ E5 Off [P8](#p8); nový BP trial ⛔ | Graph `directory/subscriptions` ho nevrací ([P1](#p1)); BP trial zkontroluje Pavel po spuštění |
| Po konci trialu rovnou Disabled a SPO jen pro čtení | ⛔ 📘 | dá se pozorovat až po 25. 11. 03:04Z |
| Hosté bez licence fungují, dokud je v tenantu aktivní SKU se SharePointem | ❓ (po přehození) | **Dnes** host bez licence čte kořenový web ✅ [P7](#p7). Jestli to platí i po konci E5, se ukáže až s novým SKU; po pilotu a po 25. 11. 03:04Z znovu `tools/lab-host-kontrola.mjs host-ppf`. Pozn.: tento host na `/sites/apps` dostává 403 ✅, v rozporu s [03](03-lab.md) („hosté jsou v App catalog Visitors“) |
| Přehození SKU nezpůsobí výpadek SharePointu u účastníka | ❓ | nové SKU v tenantu ještě není. Pilot na egd01 hned po kroku 2 |
| Přesná `skuPartNumber` náhrad | 📘 | ověří se až po spuštění trialu nebo koupi |
| Ceník: příplatek za měsíční závazek, nedostupnost SharePoint Plan 1 | ❓ / 📘 | jen v nákupním procesu admin centra (Pavel) |
| Upgrade Azure ponechá kredit a 12měsíční free služby | ⛔ 📘 | jde ověřit až po upgradu (Pavlovy platební údaje) |
| Kolik dní Azure drží data zakázané free subscription | ❓ | nenalezeno na oficiální stránce (06 to také vede jako neověřené); v labu nejdřív po 26. 11. |
| Trvání smazání tenantu, uvolnění domény (var. 4) | 📘 / ❓ | varianta se nedoporučuje, neověřuji |

## Zdroje

- 📘 https://learn.microsoft.com/microsoft-365/commerce/subscriptions/what-if-my-subscription-expires (stavy, poznámka MCA od 9. 2. 2026)
- 📘 https://learn.microsoft.com/microsoft-365/commerce/try-or-buy-microsoft-365 (převod trialu, „move or reassign users … before your trial expires“)
- 📘 https://learn.microsoft.com/troubleshoot/microsoft-365/admin/sign-in/subscription-issues-affect-access-to-services (SharePoint jen pro čtení)
- 📘 https://learn.microsoft.com/graph/api/resources/companysubscription (Graph jen čtení)
- 📘 https://learn.microsoft.com/partner-center/customers/offer-your-customers-trials-of-microsoft-products (jeden trial na nabídku, pro CSP)
- 📘 https://learn.microsoft.com/microsoft-365/commerce/subscriptions/cancel-your-subscription (7 dní na vrácení peněz)
- 📘 https://www.microsoft.com/cs-cz/microsoft-365/business/no-teams-plans-and-pricing a …/with-teams-plans-and-pricing (Business v EUR)
- 📘 https://www.microsoft.com/cs-cz/microsoft-365/enterprise/microsoft-365-plans-and-pricing (E5 58,13 €, E3 37,78 €)
- 📘 https://learn.microsoft.com/azure/cost-management-billing/manage/upgrade-azure-subscription (upgrade free účtu, i po zakázání)

## Příloha: důkazy

Všechno spuštěno 2026-11-22 večer, az přihlášené do tenantu `972a674c-…` (jen čtení).

<a id="p1"></a>**P1: předplatná a trialy**
```
az rest --method get --url "https://graph.microsoft.com/v1.0/directory/subscriptions" \
  --query "value[].[skuPartNumber,isTrial,status,createdDateTime,nextLifecycleDateTime,totalLicenses]" -o tsv
BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS  True   Enabled  2026-10-27T08:31:26Z  2026-11-25T08:31:26Z  1
FLOW_FREE                                                False  Enabled  2026-11-12T08:49:26Z  None                  10000
AGENT_365                                                True   Enabled  2026-10-27T10:37:06Z  2026-11-25T10:37:06Z  25
SPE_E5                                                   True   Enabled  2026-10-27T03:04:00Z  2026-11-25T03:04:00Z  25
```

<a id="p2"></a>**P2: obsazenost (subscribedSkus)**
```
tools/lab-licence-prehod.py --sku
BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS  Enabled  1/1
FLOW_FREE                                                Enabled  2/10000
AGENT_365                                                Enabled  0/25
SPE_E5                                                   Enabled  23/25
```
Držitelé E5 před založením egd účtů (13): alice, bob, eva.vesela, jakub.kucera, jana.svobodova, karolina.mala,
lucie.dvorakova, martina.cerna, ondrej.horak, pavel.admin, petra.novakova, tomas.prochazka, zuzana.kralova.
Zjištěno dotazem `users?$filter=assignedLicenses/$count ne 0` (ConsistencyLevel eventual); BP+Copilot má jen alice.

<a id="p3"></a>**P3: inventura pro variantu 4**
```
az rest --method get --url "https://graph.microsoft.com/v1.0/users?\$select=id&\$top=999" --query "length(value)"          → 55
az rest --method get --url "https://graph.microsoft.com/v1.0/applications?\$select=displayName&\$top=999" --query "length(value)" → 21
az rest --method get --url "https://graph.microsoft.com/v1.0/groups?\$select=id&\$top=999" --query "length(value)"         → 20
az rest --method get --url "https://graph.microsoft.com/v1.0/users?\$filter=userType%20eq%20'Guest'&\$select=mail" --query "length(value)" → 8
HOME=~/.m365-osobni m365 spo site list --output json | jq length                                                       → 14
HOME=~/.m365-osobni m365 spo app list --appCatalogScope tenant --output json | jq length                               → 10
```
Počty jsou z doby před založením egd účtů a webů (session lab-ucty je přidala potom).

<a id="p4"></a>**P4: `plan-mcp-lab`**
```
az appservice plan show -g rg-entra-mcp-lab -n plan-mcp-lab --subscription 05a636d8-… → sku B2, tier Basic, Sweden Central, linux
az webapp list … [?contains(serverFarmId,'plan-mcp-lab')] → mcp-softeria, mcp-lab (Stopped), mcp-costcenter, mcp-admin,
  mcp-classic, mcp-aether-a, mcp-aether-b, mcp-o2 (*.azurewebsites.net)
az appservice plan update --help → --sku: „Use this to scale up/down … Allowed values: B1, B2, B3, …“
rg (md/py/sh/mjs/ts/json/bicep/yaml) na názvy webapp, plan-mcp-lab, pg-mcplab, apim-mcp-lab:
  ~/Projects/egd-workshop/{sondy,tools,skills} → jen sondy/_zadani-spolecne.md (APIM „není kandidát“)
  ~/Projects/ppf-rooms (bez node_modules/lib/temp/dist) → 0 výskytů názvů webapp a plánu; obecné „azurewebsites.net“
  je jen v power-automate/export_package.py:31 (regex na přepis hostu při exportu, žádná vazba na tyto webapp)
az monitor metrics list (plán, 7 dní, PT1H): MemoryPercentage max 75 %, průměr 49 %; CpuPercentage max 59 %, průměr 6 %
  → B2 má 3,5 GB RAM, průměrně se využívá ≈ 1,7 GB, špička ≈ 2,6 GB; B1 má 1,75 GB 📘 → na B1 se nevejde
az consumption budget list → mcp-lab-budget 20.0 Monthly
az rest users?$filter=startswith(userPrincipalName,'ppfgate_') → 31
Azure Retail Prices API (EUR, swedencentral, Consumption):
  B2 Basic Plan - Linux 0.0323 €/h · B1 Basic Plan - Linux 0.0162 €/h
```

<a id="p5"></a>**P5: sondy v Azure (22. 11. večer)**
```
az resource list --subscription 05a636d8-… --query "[?starts_with(resourceGroup,'rg-egd')]"
rg-egd-sonda-ai: aoai-egd-sonda-ai, di-egd-sonda-ai, apim-egd-sonda-ai, ca-egd-llm-gateway, acregdsondaai, stegdsondaai, log-egd-sonda-ai
rg-egd-sonda-data-prava: sql-egd-data-41ebe9 (+ db egddata), ca-egd-data-api, id-egd-data-pull
rg-egd-sonda-napojeni: job-egd-report, workspace-…
```

<a id="p6"></a>**P6: stav Azure subscription**
```
az account subscription show --id 05a636d8-… → state Enabled, quotaId FreeTrial_2014-09-01, spendingLimit On
```
Doba držení dat po zakázání se z API zjistit nedá (❓, viz Neověřeno).

<a id="p7"></a>**P7: host chocholous@ppf.cz v lab tenantu (22. 11. ~20:30)**
```
1) Panel prohlížeče v aplikaci (firemní relace chocholous@ppf.cz) → /sites/apps → login.microsoftonline.com/972a674c-…:
   "Verify your identity / Approve a request on my Microsoft Authenticator app" → dál nepokračováno (MFA patří Pavlovi)
2) tools/lab-host-kontrola.mjs host-ppf / /sites/apps   (uložený profil ~/.config/ppf-rooms-lab/profily/host-ppf, headless)
   /            200 i:0#.f|membership|chocholous_ppf.cz#ext#@pavelchocholousgmail.onmicrosoft.com
   /sites/apps  403
```
Host bez licence se tedy dnes na kořenový web labu dostane ✅. Stav po konci E5 ❓.

<a id="p8"></a>**P8: admin centrum, Billing (23. 11. ~11:30, `pavel.admin`, Chrome; pozorovala hlavní session „EGD workshop příprava“ s Pavlem)**
```
1) Your products → Microsoft 365 E5 (Trial) → „Extend trial end date“ → „Trial end date can't be extended“
2) Recurring billing u E5 = Off
3) Marketplace (MCA): Microsoft 365 E3 bez trialu, jen nákup od 31,88 €
4) Microsoft 365 Business Premium (Trial): zdarma 1 měsíc, 25 licencí, plán „Microsoft 365 Business Premium (Trial)“
5) Microsoft 365 Business Standard: „TRIAL AVAILABLE“
6) tools/lab-licence-prehod.py --sku (23. 11. ~11:40): BUSINESS_PREMIUM_AND_..._COPILOT 1/1, FLOW_FREE 2/10000, AGENT_365 0/25, SPE_E5 23/25 → BP trial zatím nespuštěn
```

<a id="p9"></a>**P9: Marketplace lab tenantu, ceník a checkout (23. 11. ~12:00, `Pavel Admin (lab)`, Claude in Chrome, nic neobjednáno)**
```
Checkout „Microsoft 365 Business Premium (Trial)“: 25 licencí, 23 Nov 2026 – 22 Dec 2026, Total due €0.00
  „Trial renewal settings“: trial se po skončení převede na placené předplatné; minimum 1 licence,
  1 měsíc, Pay monthly = €22.87 + odhad daně €4.80 = €27.67 k 23 Dec 2026. → Neobjednáno, zavřeno.
Business Premium (with Copilot) (Trial): „YOU OWN THIS“ (stávající 1/1, alice)
Ceník bez DPH (1 měsíc / 1 rok placený měsíčně):
  Business Basic EEA (no Teams)  €5.60 / €4.90   — trial zdarma 1 měsíc nabízen
  Business Basic                 €7.28 / €6.37   — trial zdarma 1 měsíc nabízen
  Business Standard              od €11.21       — trial nabízen
  Business Premium               €22.87 / €20.01
SharePoint Online (Plan 1) samostatně mezi 50 produkty katalogu není.
lab-licence-prehod.py --sku po zavření: beze změny (BP+Copilot 1/1, FLOW_FREE, AGENT_365 0/25, SPE_E5 23/25)
```

## Opakované účtování všech předplatných (24. 11. dopoledne)

Zdroj: admin centrum jako „Pavel Admin (lab)“ (Claude in Chrome, uložený profil `pavel.admin` je odhlášený: `lab-host-kontrola.mjs pavel.admin /` → 403 bez LoginName), Billing → Your products → detail každého produktu; Graph `directory/subscriptions`. **Nic nezměněno.** Důkaz [P10](#p10).

| Předplatné (skuPartNumber) | Trial? | Konec (Graph UTC / admin centrum) | Opakované účtování | Po konci | Platební metoda | Důkaz |
|---|---|---|---|---|---|---|
| **Power Automate Premium** (`POWERAUTOMATE_ATTENDED_RPA`), 0/25 | ano, start 24. 11. 08:59Z | 23. 12. 08:59Z / 23/12/2026 | ~~ZAPNUTO~~ → **vypnuto 24. 11. ~10:30** ([P11](#p11)); původně „On, changes to paid subscription on 24 December 2026“ | skončí 23. 12. bez platby (původně by přešlo na 1 × 15,60 €/měs. + DPH) | Visa **2657 (profil „Xx“) | ✅ P10 |
| Microsoft 365 E5 (`SPE_E5`), 23/25 | ano | 25. 11. 03:04Z / 26/11/2026 | vypnuto („Expires on 27 November 2026“) | zruší se, uživatelé ztratí přístup | Visa **2657 (profil „Xx“) | ✅ P10 |
| Microsoft 365 Business Premium with Copilot (`BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS`), 1/1 | ano | 25. 11. 08:31Z / 26/11/2026 | vypnuto | zruší se | Visa **2657 (profil „Xx“) | ✅ P10 |
| Agent 365 (`AGENT_365`), 0/25 | ano | 25. 11. 10:37Z / 26/11/2026 | vypnuto | zruší se | Visa **2657 (profil „Xx“) | ✅ P10 |
| **Microsoft 365 Business Standard EEA (no Teams)** (`Microsoft_365_Business_Standard_EEA_(no_Teams)`), 11/25 | ano (sub `7dfeaf39-…`) | 23. 12. (billing `termEndDate` 2026-12-23) | ~~ZAPNUTO~~ (`autoRenew: On`) → **vypnuto 24. 11. ~18:40** hlavní session na Pavlovo ano přes Azure Billing API `PATCH …/billingSubscriptions/7dfeaf39-…?api-version=2024-04-01` | skončí 23. 12. bez platby | ❓ neověřeno (pravděpodobně tentýž profil „Xx“) | ✅ [před](lab/dukazy/licence-bstd/billing-autorenew.json) / [po](lab/dukazy/licence-bstd/billing-autorenew-po.json); `--sku` 24. 11. večer: 11/25 |
| Microsoft Power Automate Free (`FLOW_FREE`), 2/10000 | ne (zdarma) | bez konce | — (v „Your products“ není, nefakturuje se) | trvá | — | ✅ P10 (jen Graph) |

**Kde bylo zapnuto: Power Automate Premium (vypnuto 24. 11. dopoledne, [P11](#p11)) a později přidaný trial Business Standard EEA (vypnuto 24. 11. ~18:40 přes Billing API). Stav 24. 11. ~18:40: všech 5 M365 trialů má `autoRenew: Off` ✅ [billing-autorenew-po.json](lab/dukazy/licence-bstd/billing-autorenew-po.json).** Ověření bez prohlížeče: `az rest GET …/billingAccounts/<Default Directory MCA>/billingSubscriptions`, pole `properties.autoRenew`. Postup (skutečná cesta je v P11): Billing → Your products → **Power Automate Premium** → pole *Recurring billing* → **Edit recurring billing** → přepnout na **Off** → **Save**. Kontrola: v detailu pak „Recurring billing: Expires on …“ jako u E5. Trial poběží dál do 23. 12. a pak skončí bez platby.

Pozn.: admin centrum ukazuje konec trialů o den později (26/11) než Graph `nextLifecycleDateTime` (25. 11. UTC); počítáme s dřívějším časem z Graphu.

<a id="p10"></a>**P10: předplatné a opakované účtování (24. 11. ~10:00, admin centrum „Pavel Admin (lab)“ + Graph)**
```
az rest GET /v1.0/directory/subscriptions:
  BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS  trial  Enabled  1      next 2026-11-25T08:31:26Z
  FLOW_FREE                                                -      Enabled  10000  -
  AGENT_365                                                trial  Enabled  25     next 2026-11-25T10:37:06Z
  SPE_E5                                                   trial  Enabled  25     next 2026-11-25T03:04:00Z
  POWERAUTOMATE_ATTENDED_RPA                               trial  Enabled  25     created 2026-11-24T08:59:29Z, next 2026-12-23T08:59:29Z
Admin centrum, Billing → Your products (4 items, MCA „Default Directory“), detail:
  Power Automate Premium (sub d145f107-…): „Recurring billing: On, changes to paid subscription on 24 December 2026“;
    „When this trial ends on 23/12/2026, your paid subscription … will begin. You'll be charged €15.60/month for 1 license.“
    Paid subscription plan: 1 licence, 1 month, Pay monthly, €15.60 per user; Billing profile Xx
  Microsoft 365 E5 (sub e9f1689f-…): „Recurring billing: Expires on 27 November 2026“; „will be canceled when it expires on 26 November 2026“
  Microsoft 365 Business Premium with Copilot (sub e1f76444-…): „Recurring billing: Expires on 27 November 2026“, 1/1
  Agent 365 (sub 67dd07f9-…): „Recurring billing: Expires on 27 November 2026“, 0/25
Billing → Payment methods: Visa ****2657, exp. 10/2031, výchozí pro billing profil „Xx“
```

<a id="p11"></a>**P11: vypnutí opakovaného účtování Power Automate Premium (24. 11. ~10:30, „Pavel Admin (lab)“, Claude in Chrome; na Pavlovo „vypnout auto renewal u power automate premium“ předané hlavní session)**

Skutečná klikací cesta (přepínač „Off“ tu není, jmenuje se to zrušení ke konci období):
Billing → Your products → Power Automate Premium → **Edit recurring billing** → panel „Renew or cancel this subscription“ → **Cancel on expiration** („Let this subscription expire on 24 December 2026“) → formulář „Cancel subscription“ (důvod nepovinný, nic nevyplněno) → **Continue cancelling** → „Review and confirm your cancellation“: *Your cancellation will be scheduled for 23 December 2026, when your current term ends*, €0.00, 25 seats → **Confirm cancellation** → „Power Automate Premium subscription cancellation scheduled … You can continue to use it until then“.
```
Čtení zpět (detail předplatného d145f107-…):
  Recurring billing: Expires on 24 December 2026          (dříve: On, changes to paid subscription on 24 December 2026)
  „This subscription will be canceled when it expires on 23 December 2026 at which point users will lose access“
  Paid subscription: „To start a paid subscription when this trial ends on 23/12/2026, turn on recurring billing.“
  Subscription status: Active; Expiration date 23/12/2026
Graph directory/subscriptions POWERAUTOMATE_ATTENDED_RPA: Enabled, next 2026-12-23T08:59:29Z (beze změny, trial běží)
```
Snímky: [potvrzení](07-prilohy/p11-pa-cancellation-scheduled.jpg), [detail po změně](07-prilohy/p11-pa-recurring-off.jpg). Vrátit jde stejnou cestou volbou „Renew“ (nebo odkaz „turn on recurring billing“).
