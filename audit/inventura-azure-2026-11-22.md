# Azure inventura — stav k 2026-11-22T19:10:56Z

Tenant `972a674c-7b85-4e56-a31f-b2f95b42fd1e`, subscription `05a636d8-d8e3-49d2-a450-4b3ff7cc0a13`. Generovano `tools/azure-inventory.sh` (read-only).

## 1. Azure subscription a kredit

✅ Nazev: **Azure subscription 1**, stav: **Enabled**, quotaId: `FreeTrial_2014-09-01`, spending limit: **On**
✅ Promo `freetier` do 2027-11-27T02:08:47.7804747Z  (freetier = 12 mesicu free sluzeb, plati az po prechodu na pay-as-you-go 📘)

✅ Billing: ucet **Pavel Chocholouš**, profil `DFOZ-IIKU-BG7-PGB`, produkt Microsoft Azure Standard, spending limit na profilu: **On**

✅ Mena faktury: EUR. Spending limit detail:
- typ **FreeAccount**, 200.0 USD, 2026-10-27 → **2026-11-26**, stav Active
- konec kreditu: ⚠️ za 3 dni

✅ Kreditni loty:
- Azure sign-up credit: puvodne 200.0 USD, zbyva (uzavrena bilance) **194.32 USD** (≈ 171 EUR), plati 2026-10-27 → **2026-11-26**
✅ Zustatek kreditu: aktualni 194.32 USD, odhad po neuctovanych poplatcich **168.58 USD** (cekajici poplatky -25.74)

✅ Billing subscriptions na uctu:
- Azure subscription 1 (Usage based, stav Active, koupeno 2026-10-27, autoRenew Off)
- Microsoft Entra ID Free (Microsoft Entra ID Free, stav Active, koupeno 2026-10-27, autoRenew Off)

✅ Faktury (rok 2026):
- 2026-10-27 → 2026-10-31: fakturovano 4.92 EUR, kredit -4.92, k uhrade 0.0, stav Paid

## 2. Naklady (Cost Management, ActualCost)

✅ Tento mesic (od 2026-11-01): **23.11 EUR**
✅ Celkem od 1. 1. (tj. od zalozeni): **28.11 EUR**
✅ Denni run-rate (prumer poslednich 7 plnych dni): **1.16 EUR/den**, odhad na 30 dni: **35 EUR**

✅ Budgety:
- mcp-lab-budget: limit 20.0 (Monthly), aktualne 22.96 EUR, forecast 32.44 — notifikace: actual100, actual50, forecast100

## 3. Inventura zdroju po resource group

### copilot-credits-rg (westeurope)
Tagy RG: `{}` · naklady za okno: **0.92 EUR** · zdroju: 1

| Zdroj | Typ | SKU | Region | Vytvoren | Naklady (okno) | Poznamka |
|---|---|---|---|---|---|---|
| 4224fcb2-2317-4f50-84e2-3cf0cb181c86 | Microsoft.PowerPlatform/accounts | — | europe | 2026-10-27 | 0.92 |  |

### DefaultResourceGroup-SEC (swedencentral)
Tagy RG: `{}` · naklady za okno: **0.00 EUR** · zdroju: 1

| Zdroj | Typ | SKU | Region | Vytvoren | Naklady (okno) | Poznamka |
|---|---|---|---|---|---|---|
| DefaultWorkspace-05a636d8-d8e3-49d2-a450-4b3ff7cc0a13-SEC | Microsoft.OperationalInsights/workspaces | — | swedencentral | 2026-11-11 | 0.00 | 📘 potencialne prubezne — Log Analytics: plati se za ingest/retenci |

### NetworkWatcherRG (swedencentral)
Tagy RG: `{}` · naklady za okno: **0.00 EUR** · zdroju: 1

| Zdroj | Typ | SKU | Region | Vytvoren | Naklady (okno) | Poznamka |
|---|---|---|---|---|---|---|
| NetworkWatcher_swedencentral | Microsoft.Network/networkWatchers | — | swedencentral | 2026-10-29 | 0.00 |  |

### rg-egd-sonda-ai (swedencentral) — 🧪 sonda (nesahat, jine agenty ji muzou zakladat/mazat)
Tagy RG: `{"ucel": "egd-workshop"}` · naklady za okno: **0.00 EUR** · zdroju: 7

| Zdroj | Typ | SKU | Region | Vytvoren | Naklady (okno) | Poznamka |
|---|---|---|---|---|---|---|
| aoai-egd-sonda-ai | Microsoft.CognitiveServices/accounts | S0 | swedencentral | 2026-11-22 | 0.00 | tagy: {"ucel": "egd-workshop"} |
| di-egd-sonda-ai | Microsoft.CognitiveServices/accounts | F0 | swedencentral | 2026-11-22 | 0.00 | tagy: {"ucel": "egd-workshop"} |
| log-egd-sonda-ai | Microsoft.OperationalInsights/workspaces | — | swedencentral | 2026-11-22 | 0.00 | 📘 potencialne prubezne — Log Analytics: plati se za ingest/retenci tagy: {"ucel": "egd-workshop"} |
| acregdsondaai | Microsoft.ContainerRegistry/registries | Basic | swedencentral | 2026-11-22 | 0.00 | 📘 potencialne prubezne — ACR: denni poplatek za SKU tagy: {"ucel": "egd-workshop"} |
| stegdsondaai | Microsoft.Storage/storageAccounts | Standard_LRS | swedencentral | 2026-11-22 | 0.00 | tagy: {"ucel": "egd-workshop"} |
| ca-egd-llm-gateway | Microsoft.App/containerApps | — | swedencentral | 2026-11-22 | 0.00 | tagy: {"ucel": "egd-workshop"} |
| apim-egd-sonda-ai | Microsoft.ApiManagement/service | Consumption | swedencentral | 2026-11-22 | 0.00 | tagy: {"ucel": "egd-workshop"} |

### rg-egd-sonda-data-prava (swedencentral) — 🧪 sonda (nesahat, jine agenty ji muzou zakladat/mazat)
Tagy RG: `{"ucel": "egd-workshop"}` · naklady za okno: **0.00 EUR** · zdroju: 5

| Zdroj | Typ | SKU | Region | Vytvoren | Naklady (okno) | Poznamka |
|---|---|---|---|---|---|---|
| sql-egd-data-41ebe9 | Microsoft.Sql/servers | — | swedencentral | 2026-11-22 | 0.00 | tagy: {"ucel": "egd-workshop"} |
| sql-egd-data-41ebe9/master | Microsoft.Sql/servers/databases | GP_SYSTEM | swedencentral | 2026-11-22 | 0.00 |  |
| sql-egd-data-41ebe9/egddata | Microsoft.Sql/servers/databases | GP_S_Gen5 | swedencentral | 2026-11-22 | 0.00 | tagy: {"ucel": "egd-workshop"} |
| id-egd-data-pull | Microsoft.ManagedIdentity/userAssignedIdentities | — | swedencentral | 2026-11-22 | 0.00 | tagy: {"ucel": "egd-workshop"} |
| ca-egd-data-api | Microsoft.App/containerApps | — | swedencentral | 2026-11-22 | 0.00 | tagy: {"ucel": "egd-workshop"} |

### rg-egd-sonda-napojeni (swedencentral) — 🧪 sonda (nesahat, jine agenty ji muzou zakladat/mazat)
Tagy RG: `{"ucel": "egd-workshop"}` · naklady za okno: **0.00 EUR** · zdroju: 2

| Zdroj | Typ | SKU | Region | Vytvoren | Naklady (okno) | Poznamka |
|---|---|---|---|---|---|---|
| workspace-rgegdsondanapojenioOTH | Microsoft.OperationalInsights/workspaces | — | swedencentral | 2026-11-22 | 0.00 | 📘 potencialne prubezne — Log Analytics: plati se za ingest/retenci |
| job-egd-report | Microsoft.App/jobs | — | swedencentral | 2026-11-22 | 0.00 | tagy: {"ucel": "egd-workshop"} |

### rg-entra-mcp-lab (westeurope)
Tagy RG: `{}` · naklady za okno: **25.66 EUR** · zdroju: 22

| Zdroj | Typ | SKU | Region | Vytvoren | Naklady (okno) | Poznamka |
|---|---|---|---|---|---|---|
| plan-mcp-lab | Microsoft.Web/serverFarms | B2 | swedencentral | 2026-10-27 | 20.06 | 💸 prubezne naklady — App Service plan: plati se za hodiny planu (mimo Free/Flex/Consumption) |
| pe-pg | Microsoft.Network/privateEndpoints | — | swedencentral | 2026-10-29 | 5.25 | 💸 prubezne naklady — Private Endpoint: hodinova sazba 24/7 |
| privatelink.postgres.database.azure.com | Microsoft.Network/privateDnsZones | — | global | 2026-10-29 | 0.35 | 💸 prubezne naklady — Private DNS zona: mesicni poplatek |
| kv-mcplab-3ed5fb | Microsoft.KeyVault/vaults | — | swedencentral | 2026-10-27 | 0.01 | 📘 potencialne prubezne — Key Vault: za operace (zanedbatelne) |
| stmcplab3f3133 | Microsoft.Storage/storageAccounts | Standard_LRS | swedencentral | 2026-10-27 | 0.00 |  |
| mcp-lab-49163d | Microsoft.Web/sites | — | swedencentral | 2026-10-27 | 0.00 |  |
| apim-mcp-lab-9365c0 | Microsoft.ApiManagement/service | Consumption | swedencentral | 2026-10-27 | 0.00 |  |
| law-mcp-lab | Microsoft.OperationalInsights/workspaces | — | swedencentral | 2026-10-27 | 0.00 | 📘 potencialne prubezne — Log Analytics: plati se za ingest/retenci |
| SecurityInsights(law-mcp-lab) | Microsoft.OperationsManagement/solutions | — | swedencentral | 2026-10-27 | 0.00 |  |
| mcp-softeria-c13f9b | Microsoft.Web/sites | — | swedencentral | 2026-10-27 | 0.00 |  |
| appi-mcp-lab | Microsoft.Insights/components | — | swedencentral | 2026-10-27 | 0.00 |  |
| mcp-o2-d11724 | Microsoft.Web/sites | — | swedencentral | 2026-10-27 | 0.00 |  |
| Application Insights Smart Detection | microsoft.insights/actiongroups | — | global | 2026-10-27 | 0.00 |  |
| pg-mcplab-0c83e1 | Microsoft.DBforPostgreSQL/flexibleServers | Standard_B1ms | northeurope | 2026-10-27 | 0.00 | 📘 potencialne prubezne — Postgres Flexible: plati se za bezici server + disk |
| mcp-classic-e047b6 | Microsoft.Web/sites | — | swedencentral | 2026-10-27 | 0.00 |  |
| mcp-aether-a-e047b6 | Microsoft.Web/sites | — | swedencentral | 2026-10-27 | 0.00 |  |
| mcp-aether-b-e047b6 | Microsoft.Web/sites | — | swedencentral | 2026-10-27 | 0.00 |  |
| mcp-admin-e22c24 | Microsoft.Web/sites | — | swedencentral | 2026-10-27 | 0.00 |  |
| mcp-costcenter-e047b6 | Microsoft.Web/sites | — | swedencentral | 2026-10-28 | 0.00 |  |
| vnet-mcp-lab | Microsoft.Network/virtualNetworks | — | swedencentral | 2026-10-29 | 0.00 |  |
| privatelink.postgres.database.azure.com/link-mcp | Microsoft.Network/privateDnsZones/virtualNetworkLinks | — | global | 2026-10-29 | 0.00 |  |
| pe-pg.nic.1cd27250-5f67-4294-9929-984bf2793e8f | Microsoft.Network/networkInterfaces | — | swedencentral | 2026-10-29 | 0.00 |  |

### rg-ppf-rooms-lab (westeurope)
Tagy RG: `{}` · naklady za okno: **1.51 EUR** · zdroju: 10

| Zdroj | Typ | SKU | Region | Vytvoren | Naklady (okno) | Poznamka |
|---|---|---|---|---|---|---|
| acrppfroomsca3lbgs | Microsoft.ContainerRegistry/registries | Basic | swedencentral | 2026-11-12 | 1.51 | 💸 prubezne naklady — ACR: denni poplatek za SKU |
| stppfrooms5zacu | Microsoft.Storage/storageAccounts | Standard_LRS | swedencentral | 2026-11-11 | 0.00 |  |
| stppfroomsca3lbgs | Microsoft.Storage/storageAccounts | Standard_LRS | swedencentral | 2026-11-12 | 0.00 |  |
| ASP-rgppfroomslab-663c | Microsoft.Web/serverFarms | FC1 | swedencentral | 2026-11-11 | 0.00 | 📘 potencialne prubezne — App Service plan: plati se za hodiny planu (mimo Free/Flex/Consumption) |
| func-ppf-rooms-5zacu | Microsoft.Web/sites | — | swedencentral | 2026-11-11 | 0.00 |  |
| func-ppf-rooms-5zacu | Microsoft.Insights/components | — | swedencentral | 2026-11-11 | 0.00 |  |
| ca-ppf-rooms-logs | Microsoft.OperationalInsights/workspaces | — | swedencentral | 2026-11-12 | 0.00 | 📘 potencialne prubezne — Log Analytics: plati se za ingest/retenci |
| ca-ppf-rooms-env | Microsoft.App/managedEnvironments | — | swedencentral | 2026-11-12 | 0.00 |  |
| ca-ppf-rooms-app | Microsoft.App/containerApps | — | swedencentral | 2026-11-12 | 0.00 |  |
| id-ppf-rooms-obo | Microsoft.ManagedIdentity/userAssignedIdentities | — | swedencentral | 2026-11-14 | 0.00 |  |

### Stav kompute (✅ dotaz)

- App Service plan `ASP-rgppfroomslab-663c` (rg-ppf-rooms-lab): FlexConsumption FC1, webapps: 1
- App Service plan `plan-mcp-lab` (rg-entra-mcp-lab): Basic B2, webapps: 8
- webapp `mcp-softeria-c13f9b` (rg-entra-mcp-lab): Running
- webapp `mcp-lab-49163d` (rg-entra-mcp-lab): Stopped
- webapp `mcp-costcenter-e047b6` (rg-entra-mcp-lab): Running
- webapp `mcp-admin-e22c24` (rg-entra-mcp-lab): Running
- webapp `mcp-classic-e047b6` (rg-entra-mcp-lab): Running
- webapp `mcp-aether-b-e047b6` (rg-entra-mcp-lab): Running
- webapp `mcp-o2-d11724` (rg-entra-mcp-lab): Running
- webapp `mcp-aether-a-e047b6` (rg-entra-mcp-lab): Running
- Postgres `pg-mcplab-0c83e1`: Ready, Burstable Standard_B1ms

## 4. M365 / Entra licence — lab tenant

✅ `/directory/subscriptions` (lab tenant):

| SKU | Trial | Stav | Vytvoreno | Dalsi lifecycle (konec) | Za kolik | Licenci |
|---|---|---|---|---|---|---|
| BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS | true | Enabled | 2026-10-27 | 2026-11-25T08:31 | ⚠️ za 2 dni | 1 |
| FLOW_FREE | false | Enabled | 2026-11-12 | — | — | 10000 |
| AGENT_365 | true | Enabled | 2026-10-27 | 2026-11-25T10:37 | ⚠️ za 2 dni | 25 |
| SPE_E5 | true | Enabled | 2026-10-27 | 2026-11-25T03:04 | ⚠️ za 2 dni | 25 |

✅ `/subscribedSkus` (lab tenant):

| SKU | Stav | Pouzito | Zakoupeno | Suspended | Warning |
|---|---|---|---|---|---|
| BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS | Enabled | 1 | 1 | 0 | 0 |
| FLOW_FREE | Enabled | 2 | 10000 | 0 | 0 |
| AGENT_365 | Enabled | 0 | 25 | 0 | 0 |
| SPE_E5 | Enabled | 23 | 25 | 0 | 0 |

### Power Platform (✅ dotaz / ❓)

- ✅ Power Platform account (billing policy / PAYG) `4224fcb2-2317-4f50-84e2-3cf0cb181c86` v `copilot-credits-rg`, vytvoren 2026-10-27 uzivatelem pavel.admin@pavelchocholousgmail.onmicrosoft.com
- ✅ Prostredi `Default Directory (default)`: typ Default, vytvoreno 2026-10-27, expirace: bez expirace (typ Default)
- ❓ Billing policy a trialy Power Apps / Power Automate / Copilot Studio: BAP endpointy billingPolicies vraci 404 s verejnym api-version; zjistitelne v Power Platform admin centru (Billing → Billing policies, Licenses).

## Mimo rozsah

Firemni tenanty (PPF 5ae9dff0-…, b287c0b1-…) skript neprochazi.

---
Obnova: `tools/azure-inventory.sh -o <soubor>.md`.
