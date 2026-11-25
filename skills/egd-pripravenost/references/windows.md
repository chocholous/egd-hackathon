# Windows: pasti pro agenta

Stav: **na Windows neověřené** ❓ (nikdy nespuštěno, jen kód a dokumentace). Úroveň jistoty po krocích:

| Krok skillu | Windows | macOS |
|---|---|---|
| `nastroje`, `npm`, `sit`, `varianty` | ❓ čtením kódu: `.cmd` jdou přes `shell:true`, `.exe` bez | ✅ |
| `cli-instalace` | ❓ nativní doplněk CLI 12 | ✅ |
| `prihlaseni`, `sharepoint`, `zkouska` | ❓ stejný kód, ale úložiště tokenů CLI jinde | ✅ (jen pod správcem labu) |
| `spfx --instalovat`, `appka.mjs build` (Heft) | ❓ | ✅ |
| portable Node 22 a PATH (níže) | ❓ nikdo neprošel | ✅ jen Node 18 jako portable archiv |
| README příkazy v PowerShellu | ❓ | n/a |

## Proč skript spouští všechno přes `node`

- `npm`, `npx` a `node_modules\.bin\*` jsou na Windows `.cmd` a `.ps1` soubory. PowerShell sáhne
  po `.ps1` a při execution policy `Restricted` skončí `running scripts is disabled on this system`.
- PowerShell 5.1 kazí vnořené uvozovky v argumentech nativních programů; PowerShell 7.3+ to opravil
  jen pro `.exe`, ne pro `.cmd` 📘.
- Proto skript volá `node <npm-cli.js>` a `node <cli>/dist/index.js` s polem argumentů, bez shellu. Výjimka: kontroly nástrojů (`git`, `code`, `copilot`, `claude`, `gh`) jsou `.cmd` a jdou přes `shell: true` (cmd.exe); argumenty jsou u nich pevné a bez mezer ❓ Windows.
  Agent nemusí skládat složité příkazy – stačí `node "<S>" <příkaz> --volba hodnota`.

## Pasti PowerShellu 5.1

| Past | Obrana |
|---|---|
| `Out-File` / `Set-Content` píšou BOM nebo UTF-16 | soubory píše skript (UTF-8) |
| čeština jako rozsypaný čaj (cp1250) | konzolový výstup skriptu je bez diakritiky; zpráva je UTF-8 |
| `$` v `"…"` se rozvine (`$filter`, `$select`) | adresy s `$` dávej do jednoduchých uvozovek `'…'` |
| `2>&1` u nativního programu = `NativeCommandError` | nepřesměrovávej stderr, čti návratový kód |
| `\| Select -First N` ukončí proces | výstup si nech celý |
| české uvozovky „“ ukončí řetězec | v příkazech jen ASCII uvozovky |
| cesta s mezerou (`C:\Users\Jan Novák\…`) | vždy v uvozovkách |

## Portable Node 22 bez admina (PowerShell)

1. Stáhni z https://nodejs.org/dist/latest-v22.x/ soubor `node-v22.….-win-x64.zip` a rozbal ho (pravé tlačítko → Extrahovat vše) do `%USERPROFILE%\node22`. Zip má uvnitř jednu složku `node-v22.xx.x-win-x64`, takže `node.exe` je až v `%USERPROFILE%\node22\node-v22.xx.x-win-x64\node.exe` (dvojité zanoření). Kontrola: `Get-ChildItem "$env:USERPROFILE\node22" -Recurse -Filter node.exe`.
2. Jen pro toto okno PowerShellu (nic se nenastavuje trvale): `$env:Path = "$env:USERPROFILE\node22\node-v22.xx.x-win-x64;" + $env:Path` (název složky podle zipu), pak **`node -v`** musí vypsat v22.x. Nevypíše-li, cesta je špatná (viz výše) nebo okno není to samé.
   Co když: stažení z nodejs.org je blokované → požádej IT o archiv nebo o povolení; `node.exe` se nespustí (AppLocker / „blokováno zásadami“) → nejde to bez IT, věta pro IT je ve výpisu `spfx`; zip chce rozbalit jinam, protože `%USERPROFILE%` je síťový → zvol lokální disk.
3. Ve VS Code nastav PATH před jeho spuštěním, nebo spusť VS Code z toho okna příkazem `code .`; jinak agent dál uvidí starý Node. Trvalá změna: Nastavení → proměnné prostředí pro váš účet → `Path` (bez admina).

## Doporučené prostředí (nepovinné)

- **Git for Windows** (obsahuje Git Bash). V Claude Code pak bash místo PowerShellu.
- **PowerShell 7** jako portable zip (bez admina), když musí zůstat PowerShell.
- **Node 22.14+ (nebo 24 / 26) LTS** jako portable zip z nodejs.org: rozbalit do `%USERPROFILE%\node22` (stejná složka jako výše) a
  v uživatelských proměnných prostředí dát tu složku na začátek `Path` (bez admina). Stahuje uživatel sám. ❓ Windows.
