# Lab tenant

Stav 2026-11-22. Licence a Azure čísla jsou z živých dotazů (jen čtení, viz [06](06-azure-inventar.md)); u ostatních tvrzení je značka ✅ / ⚠ / ❓ přímo u nich. Hodnoty, které se mění, ověř příkazy níže.

## Tenant

| | |
|---|---|
| Doména | `pavelchocholousgmail.onmicrosoft.com` |
| Tenant ID | `972a674c-7b85-4e56-a31f-b2f95b42fd1e` |
| Správce | `pavel.admin@pavelchocholousgmail.onmicrosoft.com` (Global Admin ❓), Azure vlastní `pavel.chocholous@gmail.com` ❓. Role ani vlastnictví nemají uložený důkaz (výpis rolí / `az role assignment list` chybí) |
| Licence | ✅ (Graph `subscribedSkus`, 2026-11-22): Microsoft 365 E5 (`SPE_E5`, **23 z 25 přiděleno, volné 2**; 13 původních účtů + egd01–10), Business Premium + Copilot (1/1, jediná licence Copilotu, účet alice; konec **25. 11. 09:31 SEČ**), Agent 365 (0/25, konec 11:37), Flow Free. **Trial E5 končí 25. 11. 04:04 SEČ**, tj. před začátkem workshopu ve 12:30. **Závislost: vše v labu, co stojí na licencích E5 (účty egd01–10 a 13 původních, SharePoint a app catalog pod nimi, Copilot z BP+Copilot trialu), je závislé na trialech, které všechny končí 25. 11. dopoledne (E5 04:04, BP+Copilot 09:31, Agent 365 11:37 SEČ), před začátkem workshopu;** řešení a varianty viz [07](07-lab-trial-plan.md), účty účastníků [08](08-ucty-ucastniku.md), čísla a konce trialů [06](06-azure-inventar.md) |
| Power Platform | ✅ existuje `Microsoft.PowerPlatform/accounts` v RG `copilot-credits-rg` ([06](06-azure-inventar.md)). ❓ Zda je navázaný na prostředí a zda jde o PAYG billing policy: BAP endpointy vrací 404, jde zjistit jen v Power Platform admin centru (viz seznam ❓ níže) |
| m365 CLI | `HOME=~/.m365-osobni m365 status` → appka `m365-cli-spfx-lab` (`12f19539-…`), device code. Tahle appka **nemá** Graph práva na uživatele, licence ani `m365 pp` (AADSTS65001) ❓ (související, ale jiný případ: [08](08-ucty-ucastniku.md), pokusy pod účastníkem; uloženou ukázku chyby jsem nenašel; ověřit, viz seznam ❓) — na to použij `az rest` |
| Hesla testovacích účtů | `~/Projects/ppf-rooms/lab/lab.secrets.json` (0600, gitignored) |

⚠ Druhý tenant `M365x04523031` (LabAdmin2, údajně 25× E5/Power Apps/Copilot): dřívější zjištění, že
**nemá SharePoint** (DNS nic nevrací) a LabAdmin2 není GA, nemá uložený důkaz. [06](06-azure-inventar.md)
(sekce 5) píše „nezjištěno“ (`az` nemá do tenantu token). Stav: ❓ neověřeno; pro workshop se s ním nepočítá,
dokud ho Pavel nepřihlásí a nespustí `tools/azure-inventory.sh` (příkaz je v 06).

## SharePoint weby

| Web | URL |
|---|---|
| Kořen (návod) | https://pavelchocholousgmail.sharepoint.com/?env=WebView |
| Rozcestník / průvodce / Pac-Man | `/SitePages/arcade-home.aspx`, `/SitePages/workflow.aspx`, `/SitePages/pacman.aspx` (vše `?env=WebView`) |
| Tenant app catalog | https://pavelchocholousgmail.sharepoint.com/sites/apps |
| Test Custom Script Deny=2 | `/sites/noscripttest` |
| Test site app catalogu | `/sites/sitecatalogtest` |
| Jiné (nesouvisí) | `/sites/zasedacky-lab`, `/sites/ppf-rooms-lab`, `/sites/mcplabdocs`, `/sites/copilotcommunity` |

❓ URL webů a stránek v tabulce výše nebyly v této revizi znovu načteny (HTTP 200 / `m365 spo site list` ke dni revize chybí).
Názvy `/sites/noscripttest` a `/sites/sitecatalogtest` nejsou doložené mimo tento soubor; test Deny=2 se zdrojově opírá o
`~/Projects/ppf-arcade/odpoved-adriane.md` (jiný tenant, PPF).
⚠ Zdrojáky web partů Pacman / Guide / ArcadeHome se ztratily (byly ve scratchpadu); nasazené balíčky běží. ❓ Zda nejsou jinde
(`~/Projects/ppf-arcade`, GitHub repo) není ověřeno. Web `/sites/arcade` zmiňovaný 6. 11. v seznamu webů 22. 11. není.
Tento seznam je jen výběr; celkový počet webů uvádí inventura v [07](07-lab-trial-plan.md) (14 webů, ❓ bez uloženého výstupu) a 30 webů `egdNN-*` je v [08](08-ucty-ucastniku.md).

## Hosté z EG.D (stav 2026-11-22)

✅ Graph `users?$filter=userType eq 'Guest'` (`externalUserState`, čteno 2026-11-22 19:34 UTC, jen čtení). Uložený výstup:
`audit/hoste-externalUserState-2026-11-22.json`.

| Účet | externalUserState | Změna stavu (UTC) |
|---|---|---|
| tomas.galik@egd.cz | ✅ Accepted | 2026-11-06 07:50 |
| adriana.friedlova@egd.cz | ✅ Accepted | 2026-11-06 09:48 |
| filip.smolik@egd.cz | ✅ Accepted | 2026-11-09 07:44 |
| jan.urbanek@egd.cz | ✅ PendingAcceptance | pozvaný 2026-11-06 01:58 |
| eliska.mladkova@egd.cz | ✅ PendingAcceptance | pozvaná 2026-11-06 01:58 |
| martin.jac@egd.cz | ✅ PendingAcceptance | pozvaný 2026-11-06 01:58 |
| pavla.tuckova@egd.cz | ✅ PendingAcceptance (❓ „není v pozvánce na hackathon“: zdroj mimo tento výpis) | pozvaná 2026-11-06 01:58 |
| adriana.sebedovska@egd.cz | ✅ ve výpisu hostů **není** (❓ „je jen jako friedlova“ je tvrzení bez zdroje) | — |
| chocholous@ppf.cz | ✅ Accepted (test) | 2026-11-06 02:08 |

Hostů je ve výpisu 8: 7 z `egd.cz` (3 přijali, 4 čekají) a 1 test `ppf.cz`. Zda se přijetí pozvánky promítlo do přístupu na weby, výpis neříká.

❓ Členství hostů ve skupině App catalog Visitors není doložené: v Entra (`groups`, 22 skupin, výpis `audit/entra-skupiny-2026-11-22.json`) žádná skupina s „Visitors“ není, jde tedy nejspíš o SharePointovou skupinu webu, kterou Graph nevypíše; ověřit přes `m365 spo` / `/_api/web/sitegroups`. Pod účty hostů z EG.D se přístup ke stránkám **nezkoušel**.
✅ Změřeno na testovacím hostovi `chocholous@ppf.cz` ([07](07-lab-trial-plan.md) P7, `tools/lab-host-kontrola.mjs`, profil `host-ppf`, 22. 11.): kořenový web labu `/` vrací 200, `/sites/apps` (katalog aplikací) vrací **403**. Host bez licence se tedy dostane na kořen, ale na web katalogu ne, takže nasazovat balíčky nemůže (✅ pro tento účet; hosté z EG.D neměřeni ❓). Role Visitor katalogu (SharePointová skupina „App catalog Visitors“ na `/sites/apps`) je ✅ změřena na testovacím členském účtu `tomas.prochazka` přidaném do téže skupiny ([sondy/overeni/README.md](sondy/overeni/README.md) oddíl 1, `sondy/overeni/prava-visitor/`): čtení webu, seznamů a knihovny 200, založení seznamu 403, nahrání `.sppkg` 403, cizí web (`egd10-dev`) 403 – tedy jen čtení, nasadit ani vyvíjet nemůže. ❓ Zda se **hosté EG.D** (`#ext#`) chovají stejně a zda do skupiny skutečně patří, nemáme změřeno (hesla hostů nemáme; ověřit vlastním testovacím hostem s heslem nebo na workshopu). Stav po konci E5 ❓. Pro blok „první appka v labu“
je potřeba rozhodnout (viz [05](05-otevrene-body.md)). Varianty:

| Varianta | Pro | Proti / co chce od IT E.ON | Stav |
|---|---|---|---|
| A. Licencované lab účty `egd01–10` pro každého ([08](08-ucty-ucastniku.md)) | účastník je správcem svých 30 webů; ✅ nasazení přes UI a REST pod účastníkem ([08](08-ucty-ucastniku.md)); ⚠ CLI pod účastníkem naráží na AADSTS65001 a přihlášení občas vyžaduje MFA registraci, viz 08 | licence: 23 z 25 přiděleno, volné 2; trial E5 končí 25. 11. 04:04, náhrada viz [07](07-lab-trial-plan.md). Od IT E.ON nic (lab je Pavlův) | ✅ účty a weby založeny |
| B. Hostu přidat roli na DEV webu s vlastním app catalogem | host zůstává s firemní identitou, není třeba licence | ❓ nezkoušeno: zda host smí nasadit balíček a zda to dovolí externí sdílení; vyžaduje, aby host pozvánku přijal (✅ 4 ze 7 z EG.D zatím ne) | ❓ |

Doporučení zatím nepřidávám (B není změřena).

Ověření: `az rest --method get --url "https://graph.microsoft.com/v1.0/users?\$filter=userType%20eq%20'Guest'&\$select=mail,externalUserState"`
(az přihlášený do tenantu 972a…).

## Azure (subscription „Azure subscription 1“, `05a636d8-…`)

| RG | Obsah | Využití pro workshop |
|---|---|---|
| `rg-ppf-rooms-lab` | Container Apps env `ca-ppf-rooms-env`, app `ca-ppf-rooms-app` (scale-to-zero, Easy Auth), ACR, Function App `func-ppf-rooms-5zacu`, managed identity `id-ppf-rooms-obo`, Table Storage | vzor SPFx → API s OBO (⚠ z projektu `ppf-rooms`, ne z workshopu; viz [10-container-app.md](10-container-app.md)); Container Apps env se **sdílí** s gateway (✅ [sondy/ai.md](sondy/ai.md): v subscription smí být jen jeden env) |
| `rg-entra-mcp-lab` | APIM Consumption `apim-mcp-lab-9365c0`, App Service MCP servery, Postgres flexible (private endpoint), Key Vault, App Insights, Log Analytics | APIM Consumption **není kandidát na AI gateway**: neumí limit tokenů ani kvótu na klíč (✅ změřeno, [sondy/ai.md](sondy/ai.md), sekce o APIM). Postgres = ❓ možná „databáze s editací“ (viz [sondy/data-prava.md](sondy/data-prava.md)); náklad 0 € nevysvětlen, viz [06](06-azure-inventar.md) |
| `copilot-credits-rg` | Power Platform billing account | ❓ premium konektory pay-as-you-go: neověřeno, jde jen v admin centru (viz [04](04-integrace-test-plan.md)) |

**Seznam resource group je v [06-azure-inventar.md](06-azure-inventar.md)** (generuje ho `tools/azure-inventory.sh`);
zde se neduplikuje. Od 22. 11. v labu existuje i **Azure OpenAI** (`aoai-egd-sonda-ai`, `rg-egd-sonda-ai`, swedencentral,
`gpt-4.1-mini`) ✅ [sondy/ai.md](sondy/ai.md).

Budget `mcp-lab-budget` = 20 **EUR** / měsíc, ✅ **překročen** (22,96 EUR k 22. 11., forecast 32,44 EUR; jen upozornění, ne strop;
čísla z [06](06-azure-inventar.md)). Rozpočet pro práci jinak určuje CLAUDE.md (50 / 300 USD).

Inventura: `tools/azure-inventory.sh` (nebo `az resource list --subscription 05a636d8-d8e3-49d2-a450-4b3ff7cc0a13 -o table`).

## ❓ Pro Ověřovatele sond

1. `m365-cli-spfx-lab` nemá Graph práva (AADSTS65001): uložit příkaz a výstup chyby.
2. Členství hostů EG.D ve skupině App catalog Visitors (SharePoint site group, ne Entra) a chování hosta při nasazení (varianta B výše).
3. HTTP 200 / `m365 spo site list` pro weby v tabulce SharePoint webů; existence `noscripttest`, `sitecatalogtest`.
4. Druhý tenant `M365x04523031`: SharePoint, licence, GA (po přihlášení Pavla, viz 06).
5. Existence záložních zdrojáků Pacman / Guide / ArcadeHome.
6. Napojení `Microsoft.PowerPlatform/accounts` na prostředí; PAYG pro premium konektory (Power Platform admin centrum).
7. Přijetí pozvánky ≠ přístup: pod hostem `tomas.galik`/`filip.smolik` (nebo `chocholous@ppf.cz`) zkusit otevřít `/sites/apps` a nasazení; kdo a odkud smí hosta použít.
8. Odkaz OBO `ppf-rooms` na konkrétní soubor důkazu (03 tabulka Azure) a `/sites/arcade` (zdroj zmínky 6. 11. chybí).
