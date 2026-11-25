# Pripravenost na workshop - e2e-copilot

Vytvoreno 24. 11. 2026 14:20:00 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
- **Nejjednodussi cesta k prvni appce:** A: vlastni SPFx aplikace na webu (vse potrebne funguje)
- **Web:** https://pavelchocholousgmail.sharepoint.com/sites/egd09-dev
- **Prihlaseni CLI:** egd09@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904

Soucty: zelena 26, zluta 4, cervena 0.

## Nastroje

| Kontrola | Stav | Vysledek |
|---|---|---|
| system | info | Darwin 27.2.0 Darwin Kernel Version 27.2.0: Wed Oct 14 23:47:07 PDT 2026; root:xnu-13432.41.4~25/RELEASE_ARM64_T8132 (arm64) |
| git | zelena | git version 2.54.0 (Apple Git-157) |
| node | zelena | v22.23.5 (/opt/homebrew/Cellar/node@22/22.23.5_1/bin/node) |
| npm | zelena | 10.9.9 |
| vscode | zelena | VS Code 1.146.0 |
| vscode-copilot | zluta | rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene) - *co dal:* otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> "GitHub Copilot Chat" (kdyz je Marketplace blokovany, IT) |
| copilot-cli | zelena | Copilot CLI GitHub Copilot CLI 1.0.115. |
| gh | info | gh version 2.104.0 (2026-11-12) |
| claude-code | zelena | Claude Code 2.1.331 (Claude Code) |
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
| sharepoint-dosazitelny | zelena | pavelchocholousgmail.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne) |

## Pripojeni k SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| cli-setup | zelena | CLI nastaveno pro skripty (bez interaktivnich dotazu) |
| prihlaseni | zelena | prihlasen egd09@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant pavelchocholousgmail.onmicrosoft.com |

## Ovladani SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| web-cteni | zelena | "Účastník 09 – DEV" (https://pavelchocholousgmail.sharepoint.com/sites/egd09-dev) |
| role-na-webu | zelena | Vlastnik (Full Control) (odhad z EffectiveBasePermissions High 2147483647 / Low 4294705151; zapis polozek ano, sprava seznamu ano) |
| seznamy | zelena | 11 viditelnych seznamu/knihoven: Aplikace pro SharePoint (5), Dokumenty (0), EGD-pripravenost (1), Knihovna stylů (0), SpokojenostBrowser (0), SpokojenostGraph (0), SpokojenostHodnoceni (0), SpokojenostRest (0), Stránky webu (4), Šablony formulářů (0), Události (0) |
| tenant-app-catalog | info | https://pavelchocholousgmail.sharepoint.com/sites/apps (pro workshop ho nepotrebujeme; zapisujeme jen do katalogu na vlastnim webu) |
| site-app-catalog | zelena | web ma vlastni katalog aplikaci "Aplikace pro SharePoint" (5 balicku) |
| role-v-katalogu | zelena | muzes nahrat balicek (.sppkg) do katalogu |

## Varianty (zebrik)

| Kontrola | Stav | Vysledek |
|---|---|---|
| varianta-node | zelena | funguje: 1 uz je (Node 22.14+/24/26 v PATH), 3 portable archiv z nodejs.org (bez admina); nezmereno: 2 winget (jen Windows; na macOS brew nebo portable). Pouzij prvni funkcni: 1 uz je (Node 22.14+/24/26 v PATH) |
| varianta-cli | zelena | funguje: 1 npm lokalne v pracovni slozce (cli-instalace), 3 globalni m365 uz v PATH, 4 bez CLI: prohlizec (prikaz prohlizec); nezmereno: 2 npx (bez instalace, stahuje pri kazdem behu) (nezkouseno, jen zaloha; pozor na cizi balicek m365 na npm). Pouzij prvni funkcni: 1 npm lokalne v pracovni slozce (cli-instalace) |
| varianta-pouzita | info | uz prihlaseny pres CLI: ne; spusteno z: jiny terminal. Co z toho skutecne pouzijes, dopis: zapis --klic varianta-pouzita-<oblast> --stav info --hodnota "<cislo varianty>" |

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
| licence-m365 | info | licence: SPE_E5 |
| power-platform-licence | zelena | Power Apps / Power Automate v licenci: FLOW_O365_P3, POWERAPPS_O365_P3 |

## Rucne overeno

| Kontrola | Stav | Vysledek |
|---|---|---|
| varianta-prihlaseni | info | Existující přihlášení CLI ověřeno v testovacím tenant pavelchocholousgmail.onmicrosoft.com; nový přihlašovací tok nebyl třeba. |
| varianta-pouzita-node | info | 1 uz je (Node 22.14+/24/26 v PATH) |
| varianta-pouzita-cli | info | 1 npm lokalne v pracovni slozce |
| varianta-pouzita-prihlaseni | info | Existující CLI relace v testovacím tenant; přihlášení funguje, způsob původního přihlášení nebyl zjišťován. |
| cli-instalace | zelena | CLI for Microsoft 365 v12.0.0 (ověřeno z lokálního node_modules; spouští se přes Node) |
| appId | zelena | Úspěšné CLI přihlášení ověřeno v testovacím tenant pavelchocholousgmail.onmicrosoft.com; appId 12f19539-b70a-499d-b6dc-517a32c0e904 |
| dev-web | zelena | https://pavelchocholousgmail.sharepoint.com/sites/egd09-dev; dodal lektor; read-only přístup, role Vlastník a webový katalog ověřeny v tenant pavelchocholousgmail.onmicrosoft.com |
| zkouska | zluta | Plán zkušebního zápisu nebyl schválen; žádný zápis proveden. Seznam EGD-pripravenost už na webu existuje. |
| copilot-licence | info | Přeskočeno na žádost; licence nebyla ověřována. |
| github-test | info | Přeskočeno na žádost; gh na žádný host přihlášen není, firemní přístup ani licence nebyly ověřeny. |
| spfx-instalace | zluta | Node 22.23.5 a generátor SPFx 1.24 jsou kompatibilní/dostupné; zkušební instalace stovek MB nebyla spuštěna bez souhlasu |
| browser-checks | info | Ověřeno přes CLI: DEV web, vlastnická role, katalog aplikací a licence Power Apps/Power Automate; prohlížečové UI samostatně neotvíráno. |
| workshop-kontext | info | Testovací tenant pavelchocholousgmail.onmicrosoft.com; DEV web dodal lektor; uživatel neobjednával v ITSM. Copilot licence a ITSM na žádost přeskočeny. |

## Další kroky

Jde o testovací tenant `pavelchocholousgmail.onmicrosoft.com`, nikoli tenant E.ON. DEV web a přístup ke katalogu dodal lektor; postupy a objednávky E.ON ITSM se na tuto kontrolu nevztahují. Uživatel požádal přeskočit ověření licence GitHub Copilot a ITSM.

Zkušební zápis do seznamu `EGD-pripravenost` nebyl proveden: byl zobrazen plán, ale nebyl schválen. Před vytvořením appky je potřeba výslovný souhlas se zápisy do SharePointu. Zkušební instalace SPFx generátoru (stovky MB) rovněž nebyla spuštěna.

## První appka

- Značka: EG.D; režim: single (jen přihlášený vlastník webu).
- Zdrojový projekt: `prvni-appka/`; balíček SPFx 1.24.1 se úspěšně sestavil.
- Seznam `MojeAppka` se sloupci `Hodnoceni` a `Den` byl založen na DEV webu.
- Balíček byl nasazen do katalogu tohoto webu a stránka `SitePages/prvni-appka.aspx` publikována.
- Ověření přes CLI potvrdilo nasazený balíček, stránku i seznam; v seznamu zatím nejsou žádné hlasy. Vykreslení a odeslání hlasu je nutné ověřit v prohlížeči.
- Adresa appky: https://pavelchocholousgmail.sharepoint.com/sites/egd09-dev/SitePages/prvni-appka.aspx?env=WebView
