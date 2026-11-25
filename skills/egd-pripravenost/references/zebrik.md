# Žebřík variant: co v prostředí účastníka funguje

Pravidlo (kánon projektu, 22. 11.): nepředepisuj jednu cestu. Zkoušej od nejjednodušší varianty dolů,
u každé je test „funguje?“ a co dělat, když ne. Příkaz `node "<S>" varianty` měří, co jde bez zápisu,
a zapíše do zprávy oddíl „Varianty (zebrik)“. Co jsi nakonec použil, dopiš:
`node "<S>" zapis --klic varianta-pouzita-node --stav info --hodnota "1"` (a stejně `-cli`, `-prihlaseni`).
Stav: ✅ změřeno v labu (macOS) · ❓ Windows neměřeno (jen kód a dokumentace) · ⛔ jen E.ON.

## Node (SPFx chce 22.14+ / 24 / 26 📘; CLI chce 20+ ✅)

| # | Varianta | Test „funguje?“ | Když ne |
|---|---|---|---|
| 1 | Node už je v PATH | `node -v` ≥ 22.14 (`nastroje`, `spfx`) ✅ | jdi na 2 |
| 2 | **winget bez admina** (Windows): `winget install OpenJS.NodeJS.LTS --scope user` | `winget --version` (`varianty`); po instalaci nové okno terminálu a `node -v` ❓ Windows | winget chybí nebo je blokovaný → 3 |
| 3 | **Portable archiv** z nodejs.org (zip na Windows, tar.gz na macOS), bez admina; dát na začátek PATH jen v okně terminálu (viz `windows.md`) | `varianty` ukáže, jestli je nodejs.org dosažitelný ✅ (stažení a spuštění Node 18 ✅ na macOS; Node 22 portable na Windows ❓) | nodejs.org blokovaný → 4 |
| 4 | Přes IT: archiv stažený jinde / instalace Node 22 LTS | věta pro IT je ve výpisu `spfx` | bez Node jen cesta B (bez kódu) |

Pro a proti: 1 nic nedělá; 2 je nejpohodlnější, ale je-li `winget` zakázaný, nejde; 3 funguje vždy, ale účastník musí rozbalit a upravit PATH; 4 trvá dny.

## CLI for Microsoft 365 (npm balíček, ne PowerShell modul)

| # | Varianta | Test | Když ne |
|---|---|---|---|
| 1 | **npm lokálně** v pracovní složce: `node "<S>" cli-instalace` | skript ověří `version` po instalaci ✅ (CLI 12 na Node 22) | Node < 20 ✅ nepomůže ani CLI 11 → opravit Node (výše) |
| 2 | `npx` bez instalace | jen záloha ❓ neměřeno; pozor na cizí balíček `m365` na npm (používej `@pnp/cli-microsoft365`) | → 3 |
| 3 | globální `m365` už v PATH (někdo ho nainstaloval) | `varianty` ukáže `m365 --version` ✅ | → 4 |
| 4 | **bez CLI**: prohlížeč (`prohlizec`, `maska`) a ruční nahrání do katalogu | funguje vždy ✅ (jen čtení v prohlížeči) | — |

PowerShell moduly z PSGallery se nepoužívají (PSGallery je u EG.D blokovaná; moduly ze souboru mimo galerii nejsou potřeba, protože CLI je npm) ✅ v labu nebylo třeba.

## Přihlášení

| # | Varianta | Test | Když ne |
|---|---|---|---|
| 1 | **device code** (`--authType deviceCode`) | `varianty` volá endpoint device code bez přihlášení a čeká chybu aplikace (✅ v labu: AADSTS700016/700038 = endpoint žije) | AADSTS53003/50097 ⛔ jen E.ON → 2 |
| 2 | **prohlížeč** (`--authType browser`) | `varianty` ověří, že jde otevřít lokální port ✅; redirect URI `http://localhost` v aplikaci ❓ | → 3 |
| 3 | **appId a souhlas od IT** (věty v `prihlaseni.md`) | `prihlaseni` ukáže účet ✅ v labu jen pod pavel.admin | → 4 |
| 4 | **bez CLI: REST `_api` z přihlášené stránky v prohlížeči** (cesta A3, `appka.md`); správná volání si přečti ve zdroji CLI 12 v `node_modules` | ✅ v labu pod správcem a Vlastníkem, ❓ Člen, ⛔ E.ON | → cesta A2 ručně v prohlížeči |

Přihlášení dělá vždy člověk. Registrace Authenticatoru: viz `prihlaseni.md`.

## Terminál a Copilot/Claude

| # | Varianta | Poznámka |
|---|---|---|
| Windows PowerShell 5.1 | je všude; skript s ním počítá (jen `node …`, ASCII uvozovky) | ❓ nezměřeno na Windows |
| PowerShell 7 / Git Bash | nepovinné; Git Bash se hodí pro Claude Code | ❓ |
| `copilot` CLI: `winget install GitHub.Copilot` / `npm i @github/copilot` v projektu | `nastroje` hlásí verzi ✅ (1.0.114 na macOS) | winget ❓ Windows |
| VS Code Copilot Chat Agent | `nastroje` nevidí vestavěný Copilot; ověř panel Chat | ❓ |
