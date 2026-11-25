# Pripravenost na workshop - Test-Copilot

Vytvoreno 22. 11. 2026 20:20:45 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
- **Nejjednodussi cesta k prvni appce:** A: vlastni SPFx aplikace na webu (vse potrebne funguje)
- **Pozor:** cesta a katalog jsou technicky overene na uvedenem webu v tenantovi mimo E.ON; pouziti pro workshop potvrdit s IT/Pavlem.
- **Web:** https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest
- **Prihlaseni CLI:** pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904

Soucty: zelena 23, zluta 6, cervena 0.

## Nastroje

| Kontrola | Stav | Vysledek |
|---|---|---|
| system | info | Darwin 27.2.0 Darwin Kernel Version 27.2.0: Wed Oct 14 23:47:07 PDT 2026; root:xnu-13432.41.4~25/RELEASE_ARM64_T8132 (arm64) |
| git | zelena | git version 2.54.0 (Apple Git-157) |
| node | zelena | v22.23.5 (/opt/homebrew/Cellar/node@22/22.23.5_1/bin/node) |
| npm | zelena | 10.9.9 |
| vscode | zelena | VS Code 1.146.0 |
| vscode-copilot | zluta | rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene) - *co dal:* otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> "GitHub Copilot Chat" (kdyz je Marketplace blokovany, IT) |
| copilot-cli | zelena | Copilot CLI GitHub Copilot CLI 1.0.91. |
| gh | info | gh version 2.104.0 (2026-11-12) |
| claude-code | zelena | Claude Code 2.1.330 (Claude Code) |
| claude-desktop | zelena | nalezeno: /Applications/Claude.app |
| spusteno-z | info | Claude Code |

## Sit a npm

| Kontrola | Stav | Vysledek |
|---|---|---|
| npm-registry | info | https://registry.npmjs.org/ |
| npm-proxy | info | proxy=null https-proxy=null strict-ssl=true cafile=null HTTPS_PROXY=ne NODE_EXTRA_CA_CERTS=ne |
| npm-ping | zelena | registry odpovida (PONG) |
| npm-stazeni-metadat | zelena | @pnp/cli-microsoft365 12.0.0 je dostupny |
| entra-dosazitelne | zelena | login.microsoftonline.com odpovida, tenant pavelchocholousgmail.onmicrosoft.com = 972a674c-7b85-4e56-a31f-b2f95b42fd1e |
| sharepoint-dosazitelny | zelena | eonos.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne) |

## Pripojeni k SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| cli-instalace | zelena | CLI for Microsoft 365 v12.0.0 lokalne v node_modules |
| cli-setup | zelena | CLI nastaveno pro skripty (bez interaktivnich dotazu) |
| prihlaseni | zelena | prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e |
| weby-dev-test-prod | zluta | DEV/TEST/PROD zatím nejsou objednané. Zadaný DEV web je v tenantovi pavelchocholousgmail.onmicrosoft.com, nejde o doménu eonos.sharepoint.com. |
| tenant-webu | zluta | Přístup je ověřen do uživatelem uvedeného webu; jde o tenant pavelchocholousgmail.onmicrosoft.com, nikoli tenant E.ON. |

## Ovladani SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| web-cteni | zelena | "Site catalog test" (https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest) |
| role-na-webu | zelena | Vlastnik (Full Control) (odhad z EffectiveBasePermissions High 2147483647 / Low 4294705151; zapis polozek ano, sprava seznamu ano) |
| seznamy | zelena | 7 viditelnych seznamu/knihoven: Apps for SharePoint (4), Documents (0), EGD-pripravenost (2), Events (0), Form Templates (0), Site Pages (3), Style Library (0) |
| tenant-app-catalog | info | https://pavelchocholousgmail.sharepoint.com/sites/apps (pro workshop ho nepotrebujeme; zapisujeme jen do katalogu na vlastnim webu) |
| site-app-catalog | zelena | web ma vlastni katalog aplikaci "Apps for SharePoint" (4 balicku) |
| role-v-katalogu | zelena | muzes nahrat balicek (.sppkg) do katalogu |
| zkouska | zluta | Zkušební zápis přeskočen na výslovné přání uživatele; do SharePointu se nic nezapisovalo. |

## SPFx pripravenost

| Kontrola | Stav | Vysledek |
|---|---|---|
| node-pro-spfx-1.24 | zelena | Node v22.23.5; SPFx 1.24 chce 22 / 24 / 26 (22 aspon 22.14). Gulp uz neni, build je Heft. |
| generator-dostupny | zelena | @microsoft/generator-sharepoint@1.24.1 je v registry |

## GitHub

| Kontrola | Stav | Vysledek |
|---|---|---|
| github-hosty | zluta | gh neni k zadnemu hostu prihlasen (nebo vypis nejde precist) - *co dal:* postup v references/github.md krok 4: gh auth login --hostname <adresa firemniho GitHubu> |
| git-credential-helper | info | osxkeychain |
| copilot-licence | zelena | Uživatel potvrzuje licenci; Copilot je v této relaci aktivní. |
| github-firemni-pristup | zluta | gh auth status nenašel přihlášený GitHub host; firemní přístup do organizace nebyl ověřen. |

## Zalozni cesty

| Kontrola | Stav | Vysledek |
|---|---|---|
| licence-m365 | info | licence: FLOW_FREE, SPE_E5 |
| power-platform-licence | zelena | Power Apps / Power Automate v licenci: FLOW_P2_VIRAL, FLOW_O365_P3, POWERAPPS_O365_P3 |

## Objednávky předem (E.ON ITSM)

Účastníci mají předem zařídit tři věci. Stav podle této kontroly:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | hotovo | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |
| 3 weby DEV / TEST / PROD | CHYBI | ITSM „SharePoint Online \| New Site Creation“, ostatní účastníci jako site members. |
| Katalog aplikací (site collection app catalog) na webu | neověřeno pro E.ON | Na uvedeném webu mimo E.ON je katalog ověřen; na případném E.ON webu ho ověř nebo požádej Product Team E.ON na sharepoint@eon.com (ne přes ITSM). Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |

## Vety pro ServiceNow

- **weby-dev-test-prod:** Prosím o vytvoření tří webů SharePoint Online DEV / TEST / PROD pro workshop EG.D; ostatní účastníky přidejte jako site members. Prosím také o potvrzení, zda lze použít již existující web v tenantovi pavelchocholousgmail.onmicrosoft.com, nebo je potřeba DEV web v tenantovi E.ON.
- **tenant-webu:** Prosím o potvrzení, zda je pro workshop schválený DEV web v tenantovi pavelchocholousgmail.onmicrosoft.com, nebo mám používat web v tenantovi E.ON.
- **github-firemni-pristup:** Prosím o potvrzení adresy firemního GitHubu EG.D/E.ON a přístup do firemní organizace pro workshop EG.D, pokud ještě není přidělen.
