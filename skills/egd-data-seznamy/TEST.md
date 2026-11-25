# TEST v Claude: egd-data-seznamy (23. 11. 2026)

Agent účastníka: subagent Claude Sonnet (effort medium). Dostal cesty ke skillům `egd-data-seznamy`
a `egd-prvni-appka`, které si sám přečetl, a zákaz je upravovat. Prostředí byl macOS, zsh a m365 CLI
přihlášené do labu.

- **Projekt:** založený předem (`appka.mjs novy --slozka prvni-appka`, `sondy/miniskilly/claude-e2e/novy.log`).
- **Web:** `https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-miniskilly`.
- **Seznam `Spokojenost`:** 6001 hlasů za 60 dní.
- **Index `Den`:** před během **vypnutý**. Dotaz `Den ge …` bez indexu → 500 `SPQueryThrottledException`.

Zadání bylo stejné jako u Copilota ([TEST-copilot.md](TEST-copilot.md)): dashboard za posledních 30
dní, funkční i s tisíci záznamy, nastavit seznam, postavit a nasadit na stránku `spokojenost-claude`.

## Výsledek: ✅

| Krok | Výsledek |
|---|---|
| Přečetl oba skilly a zjistil stav (`spo field get … Den` → `Indexed: false`) | ✅ |
| Zapnul index CLI `spo field set … --internalName Den --Indexed true` (tvar ze skillu), kontrola `Indexed: true` | ✅ |
| `_ctiVse` ze skillu, čte `@odata.nextLink ?? odata.nextLink` | ✅ |
| Filtr na serveru `Den ge '<před 29 dny>'`, `DNU_V_PREHLEDU = 30` | ✅ (jako skill) |
| Větev pro 500 / `SPQueryThrottledException` v `_popisChyby` | ✅ |
| Graf na 30 sloupců (SCSS, popisek dne) | ✅ vlastní úprava, skill to tehdy neřešil (doplněno) |
| Ověření REST před nasazením: curl s `OData-Version: 4.0`, všechny stránky | ✅ 2801 hlasů, stránky 1000 + 1000 + 801, vše 200 |
| Build, nasazení (`nasadit` → plán rc=10 → `--ano`), `over` | ✅ 1.0.0.1 |
| **Appka v prohlížeči** (`tools/lab-spo-stranka.mjs ondrej.horak`) | ✅ data ve všech dnech 25. 10.–22. 11. |
| Klik na 4 → „Zapsáno: 4. Díky!“, dnes 1 hlas, průměr 4,0, sloupec 23. 11. v grafu | ✅ |
| **Appka nad limitem** (tester po běhu: index `Den` dočasně vypnut, stránka otevřena, index zase zapnut) | ✅ hláška „Seznam je moc velký pro tenhle dotaz…“, graf prázdný (`ui/17-claude-bez-indexu-500.png`, `claude-e2e/appka-bez-indexu.jsonl`: off 204 → 500, on 204 → 200) |
| Ptal se / zastavil se | ne |
| Upravoval soubory skillu | ne |

Proč graf dokládá čtení všech stránek: přehled za 30 dní obsahuje 2801 hlasů, zhruba 100 za den.
Kdyby appka četla jen první stránku, měla by 1000 nejnovějších hlasů, tedy asi 10 dní, a starší dny
vlevo by byly prázdné. Tak to dopadlo v 1. běhu Copilota (TEST-copilot.md). Šablona počet za období
neukazuje, proto skill v kroku Ověření teď popisuje kontrolu přes nejstarší dny.

## Důkazy

- `sondy/miniskilly/ui/15-claude-30dni.png`: dashboard po načtení.
- `sondy/miniskilly/ui/16-claude-30dni-hlas.png`: po hlasu 4.
- `sondy/miniskilly/ui/17-claude-bez-indexu-500.png`: appka bez indexu, nad limitem.
- `sondy/miniskilly/claude-e2e/`:
  - `overeni-z-prepisu.txt`: doslovné výstupy z přepisu běhu (index Den před `false`, po `true`, 500 bez
    indexu, curl 1000 + 1000 + 801 = 2801, ItemCount 6001);
  - `appka-bez-indexu.jsonl`: vypnutí a zapnutí indexu kolem snímku `ui/17`;
  - `zmeny.diff`: šablona → agent, TS i SCSS;
  - `SpokojenostWebPart.ts`: výsledný kód;
  - `build-out.log`, `plan.log`, `nasadit.log`, `novy.log`;
  - `patch.py`: úprava kódu agentem.

## Co agent vytkl skillu a co se s tím stalo

- Graf šablony je na 7 dní a 30 sloupců se nevejde. Do skillu jsem doplnil úpravu SCSS a popisku dne
  a poznámku, že popisky průměrů lehce přetékají kartu (vidět na `ui/15`).
- Při období nad zhruba 50 dní (přes 5000 hlasů) appka spadne s hláškou. Skill to už říká a radí
  dotazovat se po kratších úsecích; agent tuto pojistku do kódu nepřidal, protože 30 dní je pod limitem.
- Chybějící `.pripravenost` nevadila, CLI se předávalo přes `--cli`.

## Rozdíly Claude vs Copilot

- Claude upravil graf na 30 dní. Copilot místo toho přidal počet hlasů za období a graf nechal.
- Claude použil filtr `Den ge` (jako skill), Copilot ve 2. běhu 30 dotazů `Den eq`.
- Ani jeden neověřil vykreslení v prohlížeči sám; to dělá tester.
