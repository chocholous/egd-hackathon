# Pripravenost na workshop - Node18

Vytvoreno 22. 11. 2026 20:52:26 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Desktop (kod v zalozce Code)
- **Nejjednodussi cesta k prvni appce:** zatim zadna - chybi web nebo pristup k nemu (viz Objednavky predem)

Soucty: zelena 11, zluta 2, cervena 2.

## Nastroje

| Kontrola | Stav | Vysledek |
|---|---|---|
| system | info | Darwin 27.2.0 Darwin Kernel Version 27.2.0: Wed Oct 14 23:47:07 PDT 2026; root:xnu-13432.41.4~25/RELEASE_ARM64_T8132 (arm64) |
| git | zelena | git version 2.54.0 (Apple Git-157) |
| node | zluta | v18.20.8 (/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/c383f5cb-8f69-4fd1-b190-5505ca641bc6/scratchpad/node18/node-v18.20.8-darwin-arm64/bin/node) - *co dal:* pro SPFx 1.24 je potreba Node 22 / 24 / 26 (22 aspon 22.14). Portable zip z nodejs.org jde bez admin prav; staci ho rozbalit a dat na zacatek PATH |
| npm | zelena | 10.8.2 |
| vscode | zluta | prikaz "code" nenalezen (VS Code chybi nebo neni v PATH) |
| copilot-cli | info | neni (nepovinne) |
| gh | info | neni (nepovinne) |
| claude-code | info | neni |
| claude-desktop | zelena | nalezeno: /Applications/Claude.app |
| spusteno-z | info | Claude Code |

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
| cli-instalace | CERVENA | Node v18.20.8 je moc stary: CLI for Microsoft 365 (verze 11 i 12) chce Node 20+; instalaci jsem nespoustel - *co dal:* nejdriv portable Node 22 (zip z nodejs.org, bez admina, viz references/windows.md), dat ho na zacatek PATH, zavrit a znovu otevrit terminal, a pak cli-instalace; --verze 11 na Node 18 NEPOMUZE |

## Varianty (zebrik)

| Kontrola | Stav | Vysledek |
|---|---|---|
| varianta-node | zelena | funguje: 3 portable archiv z nodejs.org (bez admina); nefunguje: 1 uz je (Node 22.14+/24/26 v PATH) (je v18.20.8); nezmereno: 2 winget (jen Windows; na macOS brew nebo portable). Pouzij prvni funkcni: 3 portable archiv z nodejs.org (bez admina) |
| varianta-cli | zelena | funguje: 4 bez CLI: prohlizec (prikaz prohlizec); nefunguje: 1 npm lokalne v pracovni slozce (cli-instalace) (Node v18.20.8 je pod 20), 2 npx (bez instalace, stahuje pri kazdem behu) (nezkouseno, jen zaloha; pozor na cizi balicek m365 na npm), 3 globalni m365 uz v PATH (m365 v PATH neni). Pouzij prvni funkcni: 4 bez CLI: prohlizec (prikaz prohlizec) |
| varianta-prihlaseni | zelena | funguje: 1 device code (--authType deviceCode), 2 prohlizec (--authType browser, redirect na localhost); nezmereno: 3 appId od IT / souhlas spravce (zatim se nikdo neprihlasil). Pouzij prvni funkcni: 1 device code (--authType deviceCode) |
| varianta-pouzita | info | uz prihlaseny pres CLI: ne; spusteno z: Claude Code. Co z toho skutecne pouzijes, dopis: zapis --klic varianta-pouzita-<oblast> --stav info --hodnota "<cislo varianty>" |

## SPFx pripravenost

| Kontrola | Stav | Vysledek |
|---|---|---|
| node-pro-spfx-1.24 | CERVENA | Node v18.20.8; SPFx 1.24 chce 22 / 24 / 26 (22 aspon 22.14). Gulp uz neni, build je Heft. - *co dal:* stahni portable Node 22 (aspon 22.14), 24 nebo 26 LTS (zip z nodejs.org, bez admina), rozbal a dej na zacatek PATH; Node 18 uz SPFx 1.24 nepostavi |
| generator-dostupny | zelena | @microsoft/generator-sharepoint@1.24.1 je v registry |

## Objednávky předem (E.ON ITSM)

Účastníci mají předem zařídit tři věci. Stav podle této kontroly:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | neoverene | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |
| 3 weby DEV / TEST / PROD | CHYBI | ITSM „SharePoint Online \| New Site Creation“, ostatní účastníci jako site members. |
| Katalog aplikací (site collection app catalog) na webu | neoverene | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na sharepoint@eon.com (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |

## Vety pro ServiceNow

- **cli-instalace:** Prosim o povoleni portable Node.js 22 LTS (zip z nodejs.org, bez admin prav), nebo o jeho instalaci - CLI for Microsoft 365 i SharePoint Framework 1.24 nefunguji na Node 18.
- **node-pro-spfx-1.24:** Prosim o instalaci Node.js 22 LTS (nebo novejsi LTS) nebo povoleni portable verze - SharePoint Framework 1.24 Node 18 nepodporuje.
