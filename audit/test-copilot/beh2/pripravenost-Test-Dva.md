# Pripravenost na workshop - Test-Dva

Vytvoreno 22. 11. 2026 20:28:48 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Code je nainstalovany, prihlaseni neni overene; je i Copilot CLI, ale firemni GitHub neni prihlasen
- **Nejjednodussi cesta k prvni appce:** zatim zadna - chybi web nebo pristup k nemu (viz Objednavky predem)

Soucty: zelena 8, zluta 7, cervena 1.

## Sit a npm

| Kontrola | Stav | Vysledek |
|---|---|---|
| npm-registry | info | https://registry.npmjs.org/ |
| npm-proxy | info | proxy=null https-proxy=null strict-ssl=true cafile=null HTTPS_PROXY=ne NODE_EXTRA_CA_CERTS=ne |
| npm-ping | zelena | registry odpovida (PONG) |
| npm-stazeni-metadat | zelena | @pnp/cli-microsoft365 12.0.0 je dostupny |

## Pripojeni k SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| cli-instalace | zelena | CLI for Microsoft 365 v12.0.0 lokalne v node_modules |
| cli-setup | zelena | CLI nastaveno pro skripty (bez interaktivnich dotazu) |

## Rucne overeno

| Kontrola | Stav | Vysledek |
|---|---|---|
| copilot-licence | zelena | Uzivatel uvadi, ze licenci GitHub Copilot ma; pred workshopem je jeste treba overit firemni prihlaseni a pristup v Copilot Chatu nebo na github.com/settings/copilot. |
| m365-prihlaseni | zluta | Uzivatel se do Microsoft 365 jeste neprihlasil; pripraven je lokalni CLI v12 a prikaz prihlasovaciho prikazu. |
| appId | zluta | Uzivatel poskytl appId 12f19539-b70a-499d-b6dc-517a32c0e904 pro tenant pavelchocholousgmail.onmicrosoft.com; registrace a souhlas nejsou prihlasenim overeny. |
| dev-web | zluta | Uzivatel uvedl https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest; pristup a opravneni nebyly overeny. |
| weby-dev-test-prod | CERVENA | DEV/TEST/PROD weby zatim nejsou objednane; dodany je pouze DEV web, jeho opravneni nejsou overena. |
| zkouska | zluta | Uzivatel zkusny zapis vyslovne nechce; do SharePointu se nic nezapise. |
| github-test | zluta | gh neni prihlasen k zadnemu hostu; firemni GitHub adresa a pristup nejsou potvrzeny. |
| copilot-cli | zelena | Nalezena instalace GitHub Copilot CLI 1.0.114; gh neni prihlasen k zadnemu hostu. |
| claude-code | zelena | Nalezena instalace Claude Code 2.1.330; prihlaseni nebylo testovano. |
| spfx-pripravenost | zelena | Node v22.23.5 splnuje SPFx 1.24; generátor @microsoft/generator-sharepoint 1.24.1 je dostupny v npm, instalace nebyla provedena. |
| vscode-copilot | zluta | GitHub Copilot Chat rozsireni nebylo v seznamu nalezeno; novy VS Code muze mit Chat vestavene. Over otevrenim panelu Chat ve VS Code. |
| tenant-id | zluta | Domenu pavelchocholousgmail.onmicrosoft.com lze rozlisit; Microsoft vraci tenant ID 972a674c-7b85-4e56-a31f-b2f95b42fd1e, jine nez E.ON tenant ID b914a242-e718-443b-a47c-6b4c649d8c0a. Over, zda je tento DEV web spravny pro workshop. |

## Objednávky předem (E.ON ITSM)

Účastníci mají předem zařídit tři věci. Stav podle této kontroly:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | hotovo | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |
| 3 weby DEV / TEST / PROD | CHYBI | ITSM „SharePoint Online \| New Site Creation“, ostatní účastníci jako site members. |
| Katalog aplikací (site collection app catalog) na webu | neoverene | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na sharepoint@eon.com (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |

## Vety pro ServiceNow

- **weby-dev-test-prod:** Prosím o zřízení tří SharePoint Online webů DEV/TEST/PROD přes ITSM požadavek SharePoint Online | New Site Creation a přidání účastníků jako site members.
