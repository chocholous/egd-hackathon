# 06 — Azure a M365 lab: co kdy vyprší, co tam je, kolik to stojí

**Stav k 2026-11-22 (neděle, ~20:10 CET; inventura znovu spuštěna `tools/azure-inventory.sh --no-other-tenant`).** Jen čtení, nic se neměnilo. Značky: ✅ zjištěno dotazem · 📘 dokumentace · ❓ nezjištěno.

Obnovení (syrový výstup, vždy aktuální): `tools/azure-inventory.sh -o <soubor>.md` (`--help` pro volby). Uložený výstup z běhu 22. 11. ~20:10 CET: [audit/inventura-azure-2026-11-22.md](audit/inventura-azure-2026-11-22.md) (kopii ukládá hlavní session; ❓ do uložení soubor nemusí existovat). Tento přehled je z něj ručně okomentovaný; zdrojová čísla viz níže.

Rozsah: lab tenant `972a674c-7b85-4e56-a31f-b2f95b42fd1e` (pavelchocholousgmail.onmicrosoft.com), subscription `05a636d8-d8e3-49d2-a450-4b3ff7cc0a13`. Druhý tenant viz sekce 5. Firemní tenanty (PPF `5ae9dff0-…`, `b287c0b1-…`) mimo rozsah.

## Co kdy vyprší

| Datum (UTC) | Co | Co se stane | Co udělat, aby nevypršelo |
|---|---|---|---|
| **2026-11-25 03:04** ✅ | M365 **SPE_E5** trial (Microsoft 365 E5), 25 licencí, **23 přidělených (volné 2)** ✅ | 📘 Co se stane po konci, **dokumentace si odporuje** (trvalé smazání × 30 + 90 dní; u MCA od 9. 2. 2026 prý přímo Disabled a SharePoint jen pro čtení), viz [07](07-lab-trial-plan.md). ❓ Nelze ověřit, dokud trial běží. **Končí v den workshopu, o 04:04 ráno středoevropského času** | Varianty (prodloužit, nový trial jiného SKU, koupit Business Basic, nový tenant) s pro a proti a kroky jsou v tabulce variant v [07](07-lab-trial-plan.md), zde se neduplikují. Rozhodnutí o nákupu je na Pavlovi. |
| **2026-11-25 08:31** ✅ | M365 **Business Premium + Microsoft 365 Copilot** trial, 1 licence (využitá) | 📘 stejně jako výše (viz 07, ❓ nelze ověřit před koncem); přijdeš o Copilot licenci a Business Premium | totéž; Copilot licence se kupuje zvlášť |
| **2026-11-25 10:37** ✅ | **Agent 365** trial, 25 licencí, 0 využito | 📘 licence zaniknou (❓ detaily jako u E5); nic nepřidělené, takže dopad jen na funkce agentů | nic, pokud ji workshop nepotřebuje |
| **2026-11-26 02:08** ✅ | Azure **sign-up kredit 200 USD** (Free account, `FreeTrial_2014-09-01`) | 📘 Spending limit = **On** → po konci kreditu/30 dnů se subscription **zablokuje (disabled)**, zdroje se vypnou. ❓ Jak dlouho se drží data (dřív zde stálo ~90 dní), není ověřené a 07 to také vede jako neověřené; v labu to jde ověřit nejdřív po 26. 11. Na pay-as-you-go **nepřejde sama** | Pokud má lab přežít: *Upgrade to pay-as-you-go* v Azure portálu (Cost Management → Subscriptions); varianty Azure viz [07](07-lab-trial-plan.md). Pak se začne účtovat odhadem ~**35 EUR/měsíc** (z run-rate, ❓ Postgres je účtován 0 € a po upgradu může přidat; nové sondy mohou přidat také) a platí rozpočet z CLAUDE.md. Před upgradem zvážit vypnutí B2 plánu a Postgresu (sekce Náklady). Nic jsem neměnil. |
| 2027-11-27 ✅ (datum) / ❓ (výklad) | Azure promo `freetier` (12 měsíců free služeb) | Datum vrací ARM `GET /subscriptions/{id}` (`promotions[].endDateTime` = 2027-11-27T02:08Z; `tools/azure-inventory.sh` ř. 116–118), ne billing API. Subscription je ale koupena 2026-10-27, 12 měsíců by dalo 2027-10-27; rozdíl měsíce nevysvětluji (❓ ověřit v portálu, Free services). 📘 free allowance se uplatňuje jen po upgradu na PAYG | nic |
| bez expirace ✅ | M365 **FLOW_FREE** (10 000) | Power Automate Free, neplacená | — |
| bez expirace ✅ | Power Platform prostředí „Default Directory (default)“ (typ Default) | nevyprší | — |
| ❓ | Power Platform billing policy / Copilot Studio trialy | nezjištěno: BAP `billingPolicies` endpointy vracejí 404; účet `Microsoft.PowerPlatform/accounts` v `copilot-credits-rg` existuje (vytvořen 2026-10-27), jeho stav napojení lze vidět v Power Platform admin centru → Billing | Pavel v admin centru |

**Nejdůležitější:** trialy M365 (E5, Business Premium+Copilot, Agent 365) končí **25. 11. 2026**, tj. v den hackathonu s EG.D (ráno ještě před začátkem), Azure kredit o den později. Pokud workshop počítá s E5/Copilot licencemi, musí se to vyřešit nejpozději 24. 11. (plán a varianty v [07](07-lab-trial-plan.md)).

## Typ subscription a kredit (Azure)

- ✅ Typ nabídky: **Azure free account** (`quotaId FreeTrial_2014-09-01`), smlouva Microsoft Customer Agreement, billing profil `DFOZ-IIKU-BG7-PGB`, měna faktur EUR, **spending limit On** (typ `FreeAccount`).
- ✅ Subscription koupena 2026-10-27, kredit 200 USD platí 2026-10-27 → **2026-11-26**.
- ✅ Zbývající kredit: **194,32 USD** uzavřená bilance (účtování se zpožděním), **odhad po nezaúčtovaných poplatcích 168,58 USD** (čekající −25,74 USD).
- ✅ Faktura G197995274 (27.–31. 10.): 4,92 EUR, plně pokryto kreditem, uhrazeno.
- ✅ Budget `mcp-lab-budget`: 20 EUR/měsíc, aktuálně 22,96 EUR (stav při posledním spuštění; překročen, notifikace na gmail), forecast 32,44 EUR. Je to jen upozornění, nic nevypíná.

## Náklady

| Položka | Hodnota |
|---|---|
| ✅ Tento měsíc (1.–22. 11.) | **23,11 EUR** |
| ✅ Celkem od založení (27. 10.) | **28,11 EUR** |
| ✅ Denní run-rate (7 plných dní) | 1,16 EUR/den |
| ✅ Odhad za měsíc | **≈ 35 EUR** |
| ✅ Zbývající kredit | ≈ 169 USD (po zaúčtování), propadne 26. 11. |

Náklady po zdrojích za posledních 30 dní (✅ Cost Management, ActualCost):

| Zdroj | Náklad | Běží 24/7? |
|---|---|---|
| App Service plan `plan-mcp-lab` (Basic B2, 8 webapp, 7 běží, 1 stopped) | 20,06 EUR | **ano, hlavní náklad** (≈ 57 % měsíčního odhadu 35 EUR = 20,06 / 35; ≈ 71 % součtu 30denních nákladů po zdrojích 28,09 EUR = 20,06 / 28,09; tento součet je ruční sčítání řádků tabulky, inventura uvádí jen „celkem od založení“ 28,11 EUR) |
| Private Endpoint `pe-pg` | 5,25 EUR | ano (hodinová sazba) |
| ACR `acrppfroomsca3lbgs` (Basic) | 1,51 EUR | ano (denní poplatek) |
| Power Platform account `4224fcb2-…` | 0,92 EUR | pravděpodobně |
| Private DNS zóna `privatelink.postgres…` | 0,35 EUR | ano |
| Key Vault, ostatní | ≤ 0,02 EUR | — |
| Postgres `pg-mcplab-0c83e1` (B1ms, Ready) | 0,00 EUR | ano běží, ale účtováno 0 ❓ (proč je nulový, nezjištěno; nutno ověřit na faktuře po upgradu) |
| Zdroje sond `rg-egd-sonda-*` (aoai, ACR `acregdsondaai`, SQL `egddata`, APIM Consumption, Container Apps, DI F0) | 0,00 EUR | ❓ vznikly dnes (22. 11.), náklad se v Cost Management ještě nemusel projevit; ACR Basic a SQL mohou být průběžně placené, ověřit po zaúčtování |
| APIM Consumption, Functions Flex (FC1), Container App (min 0 replik), storage | 0,00 EUR | ne / pay-per-use |

Úspora, kdyby se rozhodlo o šetření (nic jsem nedělal): plán B2 (20,06 EUR) a `pe-pg` (5,25 EUR) dělají 25,31 z 28,09 EUR 30denních nákladů po zdrojích (≈ 90 %; součet řádků tabulky, bez nových sond). Varianty a ceny úspory (B1) viz [07](07-lab-trial-plan.md).

## Inventura zdrojů po resource group (✅ vytvořeno = `createdTime` z ARM)

Plný seznam s SKU a náklady vygeneruje `tools/azure-inventory.sh` (stav z běhu 22. 11. ~20:10 CET). Zde souhrn:

| RG | Region | Zdrojů | Obsah | Vytvořeno | Náklad 30 d |
|---|---|---|---|---|---|
| `rg-entra-mcp-lab` | westeurope (zdroje swedencentral/northeurope) | 22 | App Service plan B2 + 8 webapp (mcp-*), APIM Consumption, Postgres Flexible B1ms (northeurope, privátní endpoint + DNS + VNet), Key Vault, Log Analytics + Sentinel solution, App Insights, Storage LRS | 27.–29. 10. | 25,66 EUR |
| `rg-ppf-rooms-lab` | westeurope | 10 | Function App (Flex FC1) + Storage, Container Apps (env + app, min 0), ACR Basic, Log Analytics, App Insights, managed identity `id-ppf-rooms-obo` | 11.–14. 11. | 1,51 EUR |
| `copilot-credits-rg` | westeurope | 1 | `Microsoft.PowerPlatform/accounts` (❓ účel neověřen; dřívější označení „billing policy pro Copilot kredity“ nemá důkaz) | 27. 10. | 0,92 EUR |
| `DefaultResourceGroup-SEC` | swedencentral | 1 | Log Analytics default workspace (Defender/Sentinel) | 11. 11. | 0,00 EUR |
| `NetworkWatcherRG` | swedencentral | 1 | Network Watcher (automaticky) | 29. 10. | 0,00 EUR |
| `rg-egd-sonda-napojeni` 🧪 | swedencentral | 2 | Log Analytics workspace, Container Apps job `job-egd-report`; tag `ucel=egd-workshop` | 22. 11. (dnes) | 0,00 EUR |
| `rg-egd-sonda-ai` 🧪 | swedencentral | 7 | Azure OpenAI `aoai-egd-sonda-ai` (S0), Document Intelligence `di-egd-sonda-ai` (F0), Log Analytics, ACR `acregdsondaai` (Basic), Storage, Container App `ca-egd-llm-gateway`, APIM Consumption `apim-egd-sonda-ai`; tag `ucel=egd-workshop` | 22. 11. (dnes) | 0,00 EUR ❓ |
| `rg-egd-sonda-data-prava` 🧪 | swedencentral | 5 | SQL server `sql-egd-data-41ebe9` + databáze `master` a `egddata` (GP_S_Gen5, serverless), managed identity `id-egd-data-pull`, Container App `ca-egd-data-api`; tag `ucel=egd-workshop` | 22. 11. (dnes) | 0,00 EUR ❓ |

🧪 = dnešní sondy jiných agentů, mohou se měnit; nic jsem s nimi nedělal. Ostatní RG (`rg-entra-mcp-lab`, `rg-ppf-rooms-lab`, `copilot-credits-rg`, `DefaultResourceGroup-SEC`, `NetworkWatcherRG`) nemají tagy RG (✅ `Tagy RG: {}` ve výstupu inventury), nelze rozlišit vlastníka jinak než podle názvu. Počty zdrojů (22 / 10 / 1 / 1 / 1 / 2 / 7 / 5 = 49) jsou z téhož běhu.

## M365 / Entra licence — lab tenant (✅ Graph `/directory/subscriptions`, `/subscribedSkus`)

| SKU | Trial | Vytvořeno | Konec | Licencí | Přiděleno |
|---|---|---|---|---|---|
| SPE_E5 (Microsoft 365 E5) | ano | 2026-10-27 | **2026-11-25 03:04Z** | 25 | **23** (13 původních + egd01–10; volné 2) |
| BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS | ano | 2026-10-27 | **2026-11-25 08:31Z** | 1 | 1 |
| AGENT_365 | ano | 2026-10-27 | **2026-11-25 10:37Z** | 25 | 0 |
| FLOW_FREE (Power Automate Free) | ne | 2026-11-12 | — | 10 000 | 2 |

Tenant „Default Directory“ vytvořen 2026-10-27 02:04Z; Microsoft Entra ID Free (zdarma, bez expirace).

## 5. Druhý tenant (demo/hackathon, M365x04523031)

❓ **Nezjištěno.** `az` nemá platný token do tenantu `1f59a485-a0a7-4b68-aa03-d8aa133dd708` (účet LabAdmin2 je v `az account list` bez subscription a token vyžaduje nové interaktivní přihlášení; pokus končí AADSTS50020 / výzvou k loginu). Demo tenanty M365 Developer/Microsoft 365 demo mívají typicky vlastní krátkou expiraci 📘, proto stojí za ověření. Pavel musí spustit sám (a přihlásit se jako LabAdmin2, ne gmailem):

```
AZURE_CONFIG_DIR=~/.azure-demo az login --tenant 1f59a485-a0a7-4b68-aa03-d8aa133dd708 --scope https://graph.microsoft.com/.default --allow-no-subscriptions
OTHER_AZURE_CONFIG_DIR=~/.azure-demo tools/azure-inventory.sh -o /tmp/inventar.md
```

Skript pak v sekci 5 vypíše `directory/subscriptions` (isTrial, konec) a `subscribedSkus` i pro tento tenant.

## Co by měl Pavel rozhodnout (nic jsem neprovedl)

1. M365 licence před 25. 11.: vybrat variantu z tabulky v [07](07-lab-trial-plan.md) (prodloužení, nový trial jiného SKU, koupě, nový tenant; 07 doporučuje nový trial jiného SKU), nebo workshop postavit tak, aby na licencích nezávisel.
2. Azure: nechat kredit vypršet (lab se 26. 11. zablokuje, ❓ doba držení dat neověřena) nebo upgradovat na pay-as-you-go (odhad ~35 EUR/měsíc při stávající sestavě; varianty viz 07).
3. Zmenšit `plan-mcp-lab` z B2 na B1: **B1 nestačí**, plán využívá paměť v průměru ≈ 49 % a ve špičce ≈ 75 % z 3,5 GB, B1 má 1,75 GB (📘 ✅ měření paměti, viz [07](07-lab-trial-plan.md) ř. 43, 83 a P4). Úspora a celková cena po případné změně jsou tam počítané z Cost Management; čísla zde neduplikuji. `pe-pg` zůstává. Nic nezkoušeno.
4. Spustit přihlášení do druhého tenantu (viz výše).

## ❓ Pro Ověřovatele sond

1. Výklad data promo `freetier` 2027-11-27 vs. 12 měsíců od 2026-10-27: portál (Free services) nebo billing API.
2. Proč je Postgres `pg-mcplab-0c83e1` účtován 0 €: Cost Management po zdrojích, `az postgres flexible-server show`, faktura po upgradu.
3. Náklady zdrojů v `rg-egd-sonda-ai` a `rg-egd-sonda-data-prava` (ACR, SQL, APIM, aoai): znovu po zaúčtování (za 1–2 dny).
4. Účel účtu `Microsoft.PowerPlatform/accounts` (billing policy?): Power Platform admin centrum.
5. Chování po konci trialu (data, Disabled, SharePoint jen pro čtení) a doba držení dat Azure: nelze ověřit před 25./26. 11.; po nich změřit.
6. Druhý tenant `M365x04523031`: po přihlášení Pavla spustit skript s `--other-tenant`.
