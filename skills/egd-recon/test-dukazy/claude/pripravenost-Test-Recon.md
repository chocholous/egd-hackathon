# Pripravenost na workshop - Test-Recon

Vytvoreno 24. 11. 2026 10:41:34 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** zatim zadny agentni nastroj - pozadej o licenci GitHub Copilot pres E.ON ITSM (my IT order)
- **Nejjednodussi cesta k prvni appce:** zatim zadna - chybi web nebo pristup k nemu (viz Objednavky predem)

Soucty: zelena 0, zluta 0, cervena 1.

## Rucne overeno

| Kontrola | Stav | Vysledek |
|---|---|---|
| recon | CERVENA | AADSTS65001, CLI neprihlasene |

## Objednávky předem (E.ON ITSM)

Účastníci mají předem zařídit tři věci. Stav podle této kontroly:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | neoverene | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |
| 3 weby DEV / TEST / PROD | CHYBI | ITSM „SharePoint Online \| New Site Creation“, ostatní účastníci jako site members. |
| Katalog aplikací (site collection app catalog) na webu | neoverene | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na sharepoint@eon.com (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |

## Vety pro ServiceNow

- **recon:** Prosim o souhlas spravce (admin consent) s delegovanym opravnenim SharePointu (AllSites.Manage / AllSites.FullControl) pro aplikaci CLI for Microsoft 365 a o roli Clen (Member) nebo Vlastnik na webu https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-miniskilly.
