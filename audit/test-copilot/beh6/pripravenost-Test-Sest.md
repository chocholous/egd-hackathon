# Pripravenost na workshop - Test-Sest

Vytvoreno 22. 11. 2026 20:57:34 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
- **Mozna cesta k prvni appce:** A: vlastni SPFx aplikace na webu; Node, CLI a katalog jsou technicky pripraveny, ale pristup byl overen pod uctem pavel.admin, ne Test Sest. Pred nasazenim je treba overit ucet Test Sest. Appka nebyla vytvorena ani nasazena.
- **Web:** https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest
- **Prihlaseni CLI (overena identita):** pavel.admin@pavelchocholousgmail.onmicrosoft.com, nikoli Test Sest; appId 12f19539-b70a-499d-b6dc-517a32c0e904

Zapis do SharePointu byl omezen na uzivatelem predem schvaleny test: jedna polozka v seznamu EGD-pripravenost. Zadne dalsi polozky, seznamy ani aplikace nebyly vytvoreny; nic nebylo odeslano.

Soucty: zelena 29, zluta 5, cervena 0.

## Nastroje

| Kontrola | Stav | Vysledek |
|---|---|---|
| system | info | Darwin 27.2.0 Darwin Kernel Version 27.2.0: Wed Oct 14 23:47:07 PDT 2026; root:xnu-13432.41.4~25/RELEASE_ARM64_T8132 (arm64) |
| git | zelena | git version 2.54.0 (Apple Git-157) |
| node | zelena | v22.23.5 (/opt/homebrew/Cellar/node@22/22.23.5_1/bin/node) |
| npm | zelena | 10.9.9 |
| vscode | zelena | VS Code 1.146.0 |
| vscode-copilot | zluta | rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene) - *co dal:* otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> "GitHub Copilot Chat" (kdyz je Marketplace blokovany, IT) |
| copilot-cli | zelena | Copilot CLI GitHub Copilot CLI 1.0.114. |
| gh | info | gh version 2.104.0 (2026-11-12) |
| claude-code | zelena | Claude Code 2.1.330 (Claude Code) |
| claude-desktop | zelena | nalezeno: /Applications/Claude.app |
| spusteno-z | info | jiny terminal |

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

## Ovladani SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| web-cteni | zelena | "Site catalog test" (https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest) |
| role-na-webu | zelena | Vlastnik (Full Control) (odhad z EffectiveBasePermissions High 2147483647 / Low 4294705151; zapis polozek ano, sprava seznamu ano) |
| seznamy | zelena | 7 viditelnych seznamu/knihoven: Apps for SharePoint (4), Documents (0), EGD-pripravenost (3), Events (0), Form Templates (0), Site Pages (3), Style Library (0) |
| tenant-app-catalog | info | https://pavelchocholousgmail.sharepoint.com/sites/apps (pro workshop ho nepotrebujeme; zapisujeme jen do katalogu na vlastnim webu) |
| site-app-catalog | zelena | web ma vlastni katalog aplikaci "Apps for SharePoint" (4 balicku) |
| role-v-katalogu | zelena | muzes nahrat balicek (.sppkg) do katalogu |
| zalozeni-seznamu | zelena | seznam "EGD-pripravenost" uz existuje, pouzivam ho |
| zapis-polozky | zelena | polozka 4 zapsana |
| cteni-zpet | zelena | precteno zpatky: "Zkouska chocholous 22. 11. 2026 20:56:52" |

## Varianty (zebrik)

| Kontrola | Stav | Vysledek |
|---|---|---|
| varianta-node | zelena | funguje: 1 uz je (Node 22.14+/24/26 v PATH), 3 portable archiv z nodejs.org (bez admina); nezmereno: 2 winget (jen Windows; na macOS brew nebo portable). Pouzij prvni funkcni: 1 uz je (Node 22.14+/24/26 v PATH) |
| varianta-cli | zelena | funguje: 1 npm lokalne v pracovni slozce (cli-instalace), 3 globalni m365 uz v PATH, 4 bez CLI: prohlizec (prikaz prohlizec); nezmereno: 2 npx (bez instalace, stahuje pri kazdem behu) (nezkouseno, jen zaloha; pozor na cizi balicek m365 na npm). Pouzij prvni funkcni: 1 npm lokalne v pracovni slozce (cli-instalace) |
| varianta-prihlaseni | zelena | funguje: 1 device code (--authType deviceCode), 2 prohlizec (--authType browser, redirect na localhost); nezmereno: 3 appId od IT / souhlas spravce (zatim se nikdo neprihlasil). Pouzij prvni funkcni: 1 device code (--authType deviceCode) |

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

## Zalozni cesty

| Kontrola | Stav | Vysledek |
|---|---|---|
| licence-m365 | info | licence: FLOW_FREE, SPE_E5 |
| power-platform-licence | zelena | Power Apps / Power Automate v licenci: FLOW_P2_VIRAL, FLOW_O365_P3, POWERAPPS_O365_P3 |

## Rucne overeno

| Kontrola | Stav | Vysledek |
|---|---|---|
| varianta-pouzita | info | uz existujici prihlaseny CLI profil, ktery prihlaseni a zkouska uspesne overily |
| copilot-licence | zluta | uzivatel uvadi licenci; v GitHub nastaveni ani VS Code nebylo overeno |
| weby-dev-test-prod | zluta | DEV/TEST/PROD weby nejsou objednane |
| appId | zelena | CLI již bylo přihlášeno existujícím profilem; appId nebylo třeba zadávat |
| prihlaseni-identity | zluta | CLI a SharePoint byly ověřeny, ale přihlášený účet je pavel.admin@pavelchocholousgmail.onmicrosoft.com, ne Test Sest |
| varianta-pouzita-node | info | 1 uz je v PATH (Node 22.23.5) |
| varianta-pouzita-cli | info | 1 npm lokalne v pracovni slozce (CLI 12.0.0) |
| varianta-pouzita-prihlaseni | info | jiz prihlaseny existujicim CLI profilem |

## Objednavky a omezeni (lab tenant)

Tento tenant je podle uzivatele lab, nikoli E.ON. Postupy E.ON ITSM se na nej nevztahuji. Stav:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | neoverena | Uzivatel uvadi, ze licenci ma; nastaveni GitHubu ani VS Code nebylo overeno. |
| Weby DEV / TEST / PROD | neobjednane | Podle uzivatele nejsou objednane. |
| Katalog aplikaci na zadanem DEV webu | overeno pod pavel.admin | Vlastni katalog webu je dostupny a ucet pavel.admin do nej muze zapisovat; opravneni uctu Test Sest nebylo overeno. |

## Vety pro ServiceNow

E.ON ServiceNow pozadavky se na tento lab tenant nevztahuji. Nebyl odeslan zadny pozadavek.
