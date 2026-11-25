# egd-pripravenost

Kontrola, jestli je tvůj počítač připravený na vibecoding workshop EG.D (středa 25. 11.). AI agent
(GitHub Copilot nebo Claude) projde krok za krokem nástroje, síť, připojení k SharePointu a SharePoint
Framework a na konci vyrobí soubor `pripravenost-<jmeno>.md`, který pošleš Pavlovi. Trvá to asi
20–40 minut, většinu času čekáš na stahování.

Agent nic nemaže, nic nenastavuje v celé firmě a do SharePointu zapisuje jen na tvém webu a až po tvém „ano“: zkušební seznam s jednou položkou a nakonec appku (seznam a balíček v katalogu aplikací webu). Přihlašuješ se ty sám, agent hesla ani kódy nevidí.

## Co budeš potřebovat

- Windows počítač, na kterém pracuješ (admin práva nejsou potřeba).
- Node.js 22.14 nebo novější (nebo 24, 26); stačí portable verze bez admina. **Node 18 nestačí ani na přihlášení k SharePointu** ✅ (změřeno). Máš-li starší, agent ti řekne, odkud stáhnout Node 22 (`references\windows.md`).
- Adresu svého DEV webu na SharePointu (např. AILab-Dev), když ji máš.
- Nástroj: **VS Code s GitHub Copilot Chat** (režim Agent), **GitHub Copilot CLI**, nebo **Claude Code**.

## Který nástroj? (varianty, od nejjednodušší pro tebe)

| Nástroj | Pro | Proti | Co chce IT |
|---|---|---|---|
| **VS Code + Copilot Chat (Agent)** | VS Code asi máš; nic se neinstaluje v terminálu | musí být licence Copilot; skill se ve VS Code načítá podle nastavení `chat.useAgentSkills` 📘 | licence Copilot (ITSM) ⛔ |
| **GitHub Copilot CLI** | jednoduchý příkaz `copilot`, `copilot skill list` ✅ | potřebuje instalaci (winget / npm) ❓ Windows, a licenci | licence Copilot ⛔, případně povolit winget |
| **Claude Code** | nejpřímější pro skill i pro appky; bez licence Copilotu | vlastní licence a instalace Claude Code ❓ v E.ON | zatím neověřeno, jestli ho E.ON dovolí ⛔ |

Pořadí na workshopu: použij, co už máš a funguje; agent to pozná (`nastroje`) a napíše do zprávy.

## Instalace

Skill je složka `egd-pripravenost` (v ní `SKILL.md`, `scripts\`, `references\`). Rozbal ji z balíčku
na jedno z míst níže. Název složky musí zůstat přesně `egd-pripravenost`.

### GitHub Copilot ve VS Code nebo Copilot CLI (Windows)

1. Ve Průzkumníku otevři `%USERPROFILE%` (napiš to do adresního řádku; to je Průzkumník, ne PowerShell) a vytvoř složku `.copilot\skills`
   (když ještě není).
2. Zkopíruj do ní složku `egd-pripravenost`, takže vznikne
   `%USERPROFILE%\.copilot\skills\egd-pripravenost\SKILL.md`.
3. **VS Code:** zavři a znovu otevři VS Code, otevři Chat, přepni na **Agent** a napiš
   `/egd-pripravenost` (nebo jen „zkontroluj pripravenost na workshop“).
   **Copilot CLI:** spusť `copilot`, napiš `/skills reload` a pak `/skills list` — skill tam má být; pak
   „zkontroluj pripravenost na workshop“. Seznam skillů jde vypsat i mimo chat příkazem `copilot skill list` ✅.
   Když se skill ve VS Code neobjeví, v Settings vyhledej `chat.useAgentSkills` a zaškrtni ho 📘.

Alternativa jen pro jeden projekt: složku dej do `.github\skills\egd-pripravenost` v otevřené složce.

### Claude Code (Windows)

1. Zkopíruj složku do `%USERPROFILE%\.claude\skills\egd-pripravenost`.
2. Spusť Claude Code v nové složce (např. `%USERPROFILE%\egd-workshop`) a napiš `/egd-pripravenost`
   nebo „zkontroluj pripravenost na workshop“.

## Jak to probíhá

1. Agent se zeptá na tvé jméno a adresu webu.
2. Projde nástroje a síť (nic neinstaluje globálně).
3. Do pracovní složky nainstaluje CLI for Microsoft 365.
4. **Ty** se přihlásíš: agent ti vypíše jeden příkaz, ten spustíš ve svém terminálu (ve VS Code
   Terminal → New Terminal), otevřeš odkaz, zadáš kód a napíšeš agentovi „hotovo“.
   Potřebuješ k tomu **appId** (číslo aplikace pro přihlášení v tenantu E.ON). Zatím žádné schválené neexistuje ⛔, proto většinou žádné nemáš a to nevadí: agent to zapíše do zprávy jako věc pro IT (věta pro ServiceNow) a pokračuje cestou bez CLI. Možnosti a ověřené varianty: `references\zebrik.md`.
5. Agent přečte tvůj web, ukáže plán zkušebního zápisu a počká na tvé „ano“.
6. Na konci dostaneš `pripravenost-<jmeno>.md`. **Pošli ho Pavlovi.**
7. Je-li vše zelené, agent podle [ZADANI-appka.md](ZADANI-appka.md) postaví a nasadí na tvůj DEV web první appku (hodnocení spokojenosti 1–5 + malý dashboard); ty ji otevřeš a vyzkoušíš.

## GitHub a Copilot (firemní přístup)

Jak se připojit k firemnímu GitHubu a Copilotu (VS Code, Copilot CLI, `gh`, Claude) je v [references/github.md](references/github.md). Agent to s tebou projde v kroku „GitHub“.

## Co si objednat předem (E.ON ITSM)

Skript to na konci vypíše i do zprávy. Stručně: licence GitHub Copilot (ITSM „my IT order“, schválení T. Richtera a vedoucího, screenshot žádosti; jen když chceš Copilot), tři weby DEV/TEST/PROD (ITSM „SharePoint Online | New Site Creation“) a katalog aplikací na webu (e-mail vlastníka webu na sharepoint@eon.com, zakládá se ručně, tak s tím neotálej).

## Copilot: stav testu

Copilot CLI ✅ změřeno: skill se načte, kroky projdou, přihlášení nechá na člověku, zápis až po „ano“ (5 běhů). VS Code Agent mode ❓ **nespuštěn**; jeho použití ber jako neověřené.

## Ruční spuštění bez agenta

V **PowerShellu** (ne v Průzkumníku):

```
mkdir "$env:USERPROFILE\egd-workshop"
cd "$env:USERPROFILE\egd-workshop"
node "$env:USERPROFILE\.copilot\skills\egd-pripravenost\scripts\pripravenost.mjs" --help
```

V `cmd.exe` se místo `$env:USERPROFILE` píše `%USERPROFILE%`.

Ověřeno ✅: běh skriptu na macOS (Node 22 i Node 18, CLI 12.0.0, čtení a zápis v labu). Neověřeno ❓: Windows a PowerShell 5.1
(kód je kontrolovaný jen čtením), přihlášení a SharePoint E.ON ⛔ (jen u E.ON). Právě proto tenhle test děláš.
