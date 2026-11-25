# První úpravy appky (vibecoding po prvním nasazení)

Soubory v projektu `prvni-appka\`:

| Soubor | Co v něm je |
|---|---|
| `src\webparts\spokojenost\SpokojenostWebPart.ts` | logika: načtení hlasů, tlačítka 1–5, zápis hlasu, dashboard |
| `src\webparts\spokojenost\SpokojenostWebPart.module.scss` | vzhled (pravidla pod `.appka`) |
| `src\webparts\spokojenost\_znacka.scss` | značka (`$znacka: eon` / `egd`), barvy, rohy a písma obou značek |
| `src\webparts\spokojenost\SpokojenostWebPart.manifest.json` | název web partu v nabídce, výchozí nastavení |
| `config\package-solution.json` | jméno řešení a **verze** (zvyšuj před každým nasazením) |

Pravidla pro agenta:

- Jedna změna → `build` → když projde, ukaž plán `nasadit` → „ano“ → `--ano` → uživatel ověří
  v prohlížeči. Nedělej pět změn najednou; neprogramátor pak neví, která se rozbila.
- `requiresCustomScript` v manifestu nech `false`. ID v manifestu a v package-solution neměň
  (nová ID = nová appka vedle staré).
- Texty z dat vkládej přes funkci `el()` (textContent), ne přes `innerHTML` - jinak by se
  obsah položky mohl spustit jako HTML.
- Nové knihovny (React, PnPjs, knihovny grafů) do první appky nepřidávej; React chce přesně verzi
  18.3.1 a jiná verze selže potichu až za běhu 📘. Grafy v dashboardu jsou obyčejné `div` pruhy.

## Typické první úpravy

### Jiná otázka nebo popisky stupňů

Konstanta `STUPNE` a text otázky v `render()`. Nadpis jde změnit i bez buildu: na stránce
**Upravit** → ikona tužky u web partu → Nadpis appky (stránka bez `?env=WebView`).

### Komentář k hlasu („Co by pomohlo?“)

1. Sloupec do seznamu: v prohlížeči **+ Přidat sloupec** → Více řádků textu, název nejdřív bez
   diakritiky (`Komentar`), pak přejmenovat.
2. V `SpokojenostWebPart.ts`: `Komentar?: string` do `IHlas`, do `$select` v `_nacti()`, pole
   `<textarea>` pod tlačítka a hodnotu do těla v `_hlasuj()`.
3. V dashboardu výpis posledních komentářů (jen text, bez jmen).

### Delší přehled (30 dní) nebo jiná barva

`DNU_V_PREHLEDU` (počet dní) a proměnné v `_znacka.scss` (`$egd-akce`, `$eon-akce`, `$*-inkoust`, `$*-plocha`).

### Anonymní hlasování

Teď seznam ukazuje autora. Opravdu anonymně to v SharePoint seznamu nejde (autora SharePoint
ukládá vždy); u první appky to řekni uživateli. Varianta pro konzultaci: zápis přes Power Automate
pod servisním účtem.

### Velký seznam (nad 5000 položek)

Řaď a filtruj jen podle **indexovaných** sloupců; `ID` je indexovaný vždy. Řazení podle `Created`
spadlo nad 6000 položkami na 500 (throttling) ✅, proto šablona řadí `ID desc` a bere posledních
`MAX_HLASU` (2000) hlasů. Filtr na `Den` na serveru chce index na sloupci (Nastavení seznamu →
Indexované sloupce).

## Když build spadne

Agent přečte `build.log`, opraví **první** chybu `TS####` a zkusí znovu. Uživateli řekne jednou
větou, co opravil. Po třech neúspěšných pokusech vrátit poslední funkční verzi souboru (git
nebo kopie) a zkusit menší krok.
