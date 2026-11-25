# Pripravenost na workshop - Test-Sedm

Vytvoreno 23. 11. 2026 10:54:45 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Code a Copilot CLI jsou nainstalovane; prihlaseni a licence pro Test Sedm nebyly overeny
- **Nejjednodussi cesta k prvni appce:** zatim zadna - chybi web nebo pristup k nemu (viz Objednavky predem)
- **Web:** https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest
- **Prihlaseni CLI:** nalezena session jineho uzivatele; nebyla pouzita k overeni webu ani k zapisu

Soucty: zelena 12, zluta 25, cervena 0.

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

## Rucne overeno

| Kontrola | Stav | Vysledek |
|---|---|---|
| copilot-licence | zluta | Uzivatel uvadi licenci, ale pristup v editoru nebo na GitHubu nebyl overen |
| entra-dosazitelne | zluta | Kontrola omylem vypsala vychozi tenant E.ON, nikoli zadany lab tenant |
| sharepoint-dosazitelny | zluta | Kontrola testovala eonos.sharepoint.com, nikoli zadany lab web |
| cli-instalace | zelena | @pnp/cli-microsoft365 v12.0.0 nainstalovano lokalne v node_modules |
| prihlaseni | zluta | CLI session patri jinemu uzivateli nez Test Sedm; nepouzivat pro jeho overeni ani zapis |
| zalozeni-seznamu | zluta | Neovereno pro Test Sedm; drivejsi vysledek je z jineho prihlaseni |
| zapis-polozky | zluta | Tato kontrola zapis neprovedla; drivejsi vysledek nelze priradit Test Sedm |
| cteni-zpet | zluta | Neovereno pod uctem Test Sedm |
| web-cteni | zluta | Neovereno pod uctem Test Sedm |
| role-na-webu | zluta | Neovereno pod uctem Test Sedm |
| seznamy | zluta | Neovereno pod uctem Test Sedm |
| tenant-app-catalog | zluta | Neovereno pod uctem Test Sedm |
| site-app-catalog | zluta | Neovereno pod uctem Test Sedm |
| role-v-katalogu | zluta | Neovereno pod uctem Test Sedm |
| licence-m365 | zluta | Drivejsi vysledek z jineho uctu; pro Test Sedm neovereno |
| power-platform-licence | zluta | Drivejsi vysledek z jineho uctu; pro Test Sedm neovereno |
| weby-dev-test-prod | zluta | Uvedena je adresa lab webu; pristup pod uctem Test Sedm neoveren. E.ON objednavky se na lab nevztahuji |
| github-pristup | zluta | gh neni prihlaseno k zadnemu GitHub hostu; firemni GitHub adresa a pristup nebyly overeny. Copilot CLI je pritomen, ale licence se nepodarilo nezavisle overit. |
| m365-ucet | zluta | CLI session je prihlasena pod jinym uctem nez Test Sedm; web nebyl overen |
| sharepoint-pristup | zluta | Pristup k uvedenemu webu neoveren; CLI ucet neodpovida Test Sedm |
| zkouska | zluta | Plan pripraven, zapis neproveden kvuli odlisne CLI identite |
| github-test | zluta | gh neni prihlaseno k zadnemu hostu; firemni GitHub neznamy |
| dev-test-prod | zluta | DEV/TEST/PROD weby nejsou objednane; uvedeny web je labovy, ne E.ON |
| cli-funkcni | zluta | Drivejsi zaznam nelze overit ani priradit Test Sedm; tato kontrola web necetla a zkusebni zapis nespustila |

## Objednávky předem (jen E.ON ITSM; na zadaný lab se nevztahují)

Účastníci E.ON mají předem zařídit tři věci. Pro zadaný lab tenant tyto požadavky neplatí:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | neoverene | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |
| 3 weby DEV / TEST / PROD | neoverene | ITSM „SharePoint Online \| New Site Creation“, ostatní účastníci jako site members. |
| Katalog aplikací (site collection app catalog) na webu | neoverene | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na sharepoint@eon.com (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |

## Vety pro ServiceNow

Pro zadaný lab nebyl vytvořen požadavek ServiceNow. Přístup k SharePointu pod účtem Test Sedm je neověřen.
