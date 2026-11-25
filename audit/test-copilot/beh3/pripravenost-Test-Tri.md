# Pripravenost na workshop - Test-Tri

Vytvoreno 22. 11. 2026 20:28:06 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
- **Nejjednodussi cesta k prvni appce:** zatim zadna - chybi web nebo pristup k nemu (viz Objednavky predem)

Soucty: zelena 15, zluta 8, cervena 0.

## Dulezite upresneni

Uvedeny DEV web je lab, ne E.ON: `https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest`; tenant: `pavelchocholousgmail.onmicrosoft.com`. Kontroly site a prihlaseni v tabulce Sit a npm jsou vychozi kontroly E.ON, ne overeni tohoto labu. Lab vratil HTTP 403 bez prihlaseni; to potvrzuje jen dosazitelnost, nikoli opravneni. Uzivatel uvadi, ze je prihlasen do M365, ale CLI prihlaseni a prava k webu nebyla overena.

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
| entra-dosazitelne | zelena | login.microsoftonline.com odpovida, tenant egd.cz = b914a242-e718-443b-a47c-6b4c649d8c0a |
| sharepoint-dosazitelny | zelena | eonos.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne) |

## Pripojeni k SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| cli-instalace | zelena | CLI for Microsoft 365 v12.0.0 lokalne v node_modules |
| cli-setup | zelena | CLI nastaveno pro skripty (bez interaktivnich dotazu) |

Zkusebni zapis do labu nebyl proveden. Plan: zalozit seznam `EGD-pripravenost`, pokud jeste neexistuje; pridat jednu polozku `Zkouska chocholous 22. 11. 2026 20:27:39`; precist ji zpet. Nic se nema mazat. Nebylo obdrzeno vyslovne schvaleni `ano, zapiš`.

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
| copilot-licence | zluta | Uživatel uvádí přidělenou licenci; přihlášení a přístup do firemního GitHubu nebylo ověřeno. |
| weby-dev-test-prod | zluta | DEV/TEST/PROD zatím neobjednány. |
| appId | zluta | Není známé appId pro CLI for Microsoft 365 v tenantovi pavelchocholousgmail.onmicrosoft.com; CLI přihlášení nebylo provedeno. |
| github-test | zluta | gh není přihlášeno k žádnému hostu; firemní GitHub adresa není známá. Uživatel uvádí licenci Copilot. |
| sharepoint-lab | zluta | Web je uživatelem označený jako lab, ne E.ON. HTTP 403 bez přihlášení; přístup a role nebyly ověřeny. |
| zkouska | zluta | Plán zobrazen; nebylo obdrženo přesné výslovné schválení 'ano, zapiš', proto se seznam ani položka nezapisovaly. |

## Objednávky předem (E.ON ITSM)

Účastníci mají předem zařídit tři věci. Stav podle této kontroly:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | neoverene | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |
| 3 weby DEV / TEST / PROD | CHYBI | ITSM „SharePoint Online \| New Site Creation“, ostatní účastníci jako site members. |
| Katalog aplikací (site collection app catalog) na webu | neoverene | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na sharepoint@eon.com (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |

## Vety pro ServiceNow

- **weby-dev-test-prod:** Prosím o objednání tří webů DEV/TEST/PROD v ITSM přes SharePoint Online | New Site Creation; přidejte účastníky jako site members.
- **appId:** Prosím o potvrzení appId aplikace schválené pro CLI for Microsoft 365 se souhlasem správce a potřebnými delegovanými oprávněními k SharePointu v tenantovi pavelchocholousgmail.onmicrosoft.com.
