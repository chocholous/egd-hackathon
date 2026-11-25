# Test balíčku skillů z čistého rozbalení (Claude) – 24. 11. 2026

Navazuje na [E2E běh pod egd10](../README.md). Otázka: projde účastník ze **samotného ZIPu** (bez repa)
`egd-pripravenost` → `egd-prvni-appka` se značkou **E.ON** a režimem **open**, a nechybí v balíčku něco, co v repu
vidět není?

**Výsledek: ✅ prošlo.** Instalace 20 s, připravenost (cesta A) a appka E.ON/open nasazená, hlas egd10 i spolužáka
egd01 zapsaný a přečtený zpět. Za běhu agent **nenarazil na žádný chybějící soubor**. Statická kontrola našla
odkazy mimo balíček (jen citace důkazů, nic potřebného k běhu, B3) a jeden obsahový problém: B1 (dvě různé appky).

## Co se testovalo

| | |
|---|---|
| Balíček | `dist/egd-skills.zip`, **SHA-256 `166fc7fd821c3f931c3ac12ca2078a3956f504cc12a69488b0e1f66224b0bdce`**, 98 položek (60 souborů, 10 skillů), postaven 12:21:13 z `a4cac70` (hlavní session ohlásila nejdřív `fd8350d7…` z `a6526a9`, ZIP byl přestavěn minutu před rozbalením; rozdíl = Z9 v SKILL.md egd-prvni-appka) |
| Rozbaleno | `~/egd-e2e-balicek/rozbaleno/` – nová prázdná složka **mimo repo** (`sondy/e2e/balicek/` gitignore nekryje a `.gitignore` edituje jen hlavní session) |
| Instalace | `~/egd-e2e-balicek/prace/.claude/skills/` = projektové skilly nové pracovní složky; ne `~/.claude/skills` ani skilly jiných sessions. V `~/.claude/skills` žádný `egd-*` není (kolize vyloučena) |
| Agent účastníka | `claude -p` (Claude Code 2.1.331, `--model sonnet --effort medium --setting-sources project`), v `~/egd-e2e-balicek/prace`, odpovědi účastníka přes `--resume`. Povolené nástroje `Bash Read Write Edit Glob Grep Skill` v režimu `dontAsk` (= účastník kliká „Povolit“) |
| Účet / web | egd10 (rezervován ve výdeji 12:23, uvolněn 12:41), web **`/sites/egd10-prod`** (čistý; egd10-dev nese appku z prvního E2E běhu, egd10-test používala skill-prvni-appka) |
| CLI | lab wrapper `~/egd-e2e-balicek/m365-lab.mjs` (globální m365 v11.11.0 s `HOME=~/.m365-e2e`, přihlášený egd10) předaný přes `PRIPRAVENOST_M365_CLI` / `PRVNI_APPKA_M365_CLI`. Artefakt labu (Z2b v [../README.md](../README.md)), není v balíčku |

**Odchylky od skutečného účastníka (artefakty testu):** globální `~/.claude/CLAUDE.md` Pavla se do `claude -p` načetl
(agent proto volal `ListAgents` a hlásil běžící sessions); `prace/node_modules` s CLI 12 byl předem APFS klon (pravidlo
disku), takže agent `cli-instalace` vynechal; appId jsem jako účastník řekl sám („od lektora“, Z3 z prvního běhu trvá).

## Časová osa

| # | Krok | Čas (CET) | Min | Co účastník viděl | Výsledek | Důkaz |
|---|---|---|---|---|---|---|
| 1 | Rozbalení ZIPu, SHA-256 | 12:21 | 1 | 10 složek | ✅ | výše |
| 2 | Instalace agentem, prompt z `dist/EMAIL-instalace-skillu.md` upravený na 10 skillů a projektový cíl ([prompt](#instalační-prompt)) | 12:21–12:22 | 1 | 1. pokus: agent odmítl kopírovat (moje příliš úzké povolení `Bash(cp:*)`, složený příkaz) a nabídl příkaz; 2. pokus s povoleným Bash: 10/10, `diff -r` beze rozdílu, „ukončete a spusťte `claude` znovu“ | ✅ | [01](dukazy/01-instalace.json), [02](dukazy/02-instalace-povoleny-bash.json) |
| 3 | Rezervace egd10 ve výdeji (profil `e2e-egd10` už přihlášený) | 12:23 | 1 | „Váš účet: egd10“ | ✅ | [03 (heslo maskováno)](dukazy/03-vydej-rezervovano.png) |
| 4 | „zkontroluj připravenost na workshop“ → kroky 2–3 | 12:24–12:25 | 1 | zelené, žlutý jen Copilot Chat ve VS Code; dotaz na jméno, web, ITSM | ✅ | [10](dukazy/10-ucastnik-t1.json) |
| 5 | Odpověď krok 0 (jméno, web egd10-prod, appId) → kroky 5–6, 8 | 12:25–12:26 | 1 | Vlastník, vlastní katalog, SPE_E5; plán zkušebního zápisu | ✅ | [11](dukazy/11-ucastnik-t2.json) |
| 6 | „ano“ → krok 7, zpráva | 12:26 | 1 | `EGD-pripravenost` + položka „Zkouska e2e-balicek …“ (Z7 opraveno: jméno z kroku 0); zpráva 26 zelených / 1 žlutá / 0 červených, cesta A. **Nabídne vestavěnou appku `SpokojenostHodnoceni`** (B1) | ✅ / ⚠️ B1 | [12](dukazy/12-ucastnik-t3.json) |
| 7 | „Ano, postav mi první appku, ale přes skill egd-prvni-appka.“ | 12:27 | 1 | `cesta` → A; ptá se na značku, režim, nadpis (výchozí nemá) | ✅ | [13](dukazy/13-ucastnik-t4.json) |
| 8 | „E.ON, režim open, nadpis ponech.“ → `novy` (plné `npm ci`) + `build` | 12:27–12:28 | 1 | build `prvni-appka.sppkg` 1.0.0.0; plán seznamu a varování o právech open | ✅ | [14](dukazy/14-ucastnik-t5.json) |
| 9 | „ano“ → seznam `MojeAppka` (červený štítek E.ON) | 12:28 | 1 | plán nasazení vč. změny práv (Všichni kromě externích: Čtení web, Přispívání seznam) | ✅ | [15](dukazy/15-ucastnik-t6.json) |
| 10 | „ano“ → `nasadit --ano` (katalog webu, stránka, práva open) | 12:29–12:30 | 1 | adresa `?env=WebView`, výzva ověřit v prohlížeči | ✅ | [16](dukazy/16-ucastnik-t7.json) |
| 11 | Prohlížeč egd10: appka E.ON, hlas 5 → změna na 3 | 12:30 | 1 | písmo E.ON Head, hranaté rohy, červená jen u vybrané volby; „Zapsáno: 5“, „Změněno na 3“, 1 hlas | ✅ | [20](dukazy/20-appka-eon-open.png), [21](dukazy/21-hlas-5.png), [22](dukazy/22-zmena-3.png) |
| 12 | Spolužák **egd01** (web egd10-prod mu nikdo nesdílel) hlasuje 4 | 12:30 | 1 | „Zapsáno: 4. Díky!“, průměr 3,5 → přístup jen díky režimu open | ✅ | [23](dukazy/23-spoluzak-egd01-hlas-4.png), [log](dukazy/23-spoluzak-egd01.log) |
| 13 | Čtení zpět: agent `over` + REST | 12:31 | 1 | 2 položky: Účastník 10 = 3, Účastník 01 = 4, Den 2026-11-24 | ✅ | [17](dukazy/17-ucastnik-t8.json), [24 REST](dukazy/24-rest-cteni-zpet.json) |
| 14 | Úklid: `tools/lab-vydej.py uvolnit egd10`; `apfs-dedupe` nových `node_modules` | 12:41 | – | `rezervace (0)` | ✅ | – |

**Celkem 12:21–12:31 = 10 min** od rozbalení po hlas spolužáka; agent účastníka 8 tahů, ~1,13 USD (Sonnet).
Plné `npm ci` + build v `novy` trvalo **~1 min** (npm cache stroje je teplá; na čistém PC účastníka bude delší),
volné místo 32 → 31 GiB před sloučením. Tím je doměřen Z4 z prvního běhu (s teplou cache).

## Nálezy

- **B1 (obsah, egd-pripravenost × egd-prvni-appka) ⚠️:** `egd-pripravenost` nese **vlastní starší** `scripts/appka.mjs`
  (411 řádků, seznam `SpokojenostHodnoceni`, bez `--znacka`/`--rezim`) a šablonu **bez `_znacka.scss`**; `egd-prvni-appka`
  má novou (620 řádků, `MojeAppka`, značky, režimy). Po zelené připravenosti agent sám nabídne „Poslední krok: postav appku“
  podle `ZADANI-appka.md` = **starou appku bez dotazu na značku a režim**. Účastník, který neřekne „přes egd-prvni-appka“,
  dostane jinou appku, než ukazují lektoři, a na webu můžou skončit dvě. Návrh: v SKILL.md připravenosti poslední krok
  změnit na „předej skillu `egd-prvni-appka`, je-li nainstalovaný“ a vestavěnou appku nechat jen jako zálohu (nebo ji
  z balíčku vyřadit). → Prereq skill, kopie Skill první appka.
- **B2 (egd-pripravenost) – kroky, které agent vynechal:** `cli-instalace` (našel `node_modules/@pnp` – v testu můj
  předklon, u účastníka by ho neměl), krok **9b GitHub** se nespustil vůbec a **`varianta-pouzita-<oblast>`** nezapsal
  (jen obecné `varianta-pouzita=info`), takže zpráva neříká, kterou variantu žebříku použil. → Prereq skill.
- **B3 (balíček) – odkazy mimo balíček:** [kontrola-odkazu.py](kontrola-odkazu.py) nad nainstalovanými skilly
  ([souhrn](dukazy/03-kontrola-souhrn.txt), [výpis](dukazy/03-kontrola-odkazu.tsv)):

  | Skill | odkaz na neexistující soubor | cesta mimo balíček (`sondy/`, `tools/`, `test-dukazy`, `TEST*.md`, `../`) |
  |---|---|---|
  | egd-pripravenost | 0 | 1 (`zdroje/ppf.md` jako zdroj ⛔ věty) |
  | egd-prvni-appka | 9 (`TEST.md` ×4, `test-dukazy/*` ×5) | 1 |
  | egd-recon | 7 (`test-dukazy/*` ×5, `TEST.md`, `TEST-copilot.md`) | 1 |
  | egd-data-seznamy | 8 | 14 |
  | egd-dokumenty | 3 | 47 |
  | egd-externi-api | 1 | 19 |
  | egd-llm-gateway | 3 | 29 |
  | egd-maily | 5 | 17 |
  | egd-planovane-ulohy | 2 | 24 |
  | egd-prava-role | 0 | 47 |

  Všechny prověřené případy u tří hlavních skillů jsou **citace důkazů** (✅ s odkazem na log), ne soubory potřebné k běhu;
  v tomto běhu na ně agent nesáhl. Riziko: agent je může zkusit otevřít při chybě (tabulky „Když se něco pokazí“ odkazují
  `test-dukazy/cli-chyba-rc0.txt`), nebo je ukázat účastníkovi jako odkaz, který nevede nikam. Miniskilly odkazují hlavně na
  `sondy/` a `tools/` z repa (u `egd-dokumenty` i `../../sondy/…` jako markdown odkazy). Návrh: `tools/balicek-skillu.sh`
  buď přibalí `TEST.md` + odkazované `test-dukazy` (malé textové soubory), nebo při stavbě převede odkazy mimo balíček na
  prostý text „(důkaz v repu workshopu)“; a pustit `kontrola-odkazu.py` jako krok stavby. → hlavní session (vlastník
  `tools/balicek-skillu.sh`), majitelé miniskillů přes koordinátora.
  **Stav 24. 11. ~12:55:**
  - `egd-prvni-appka`: majitel převedl odkazy na `TEST.md` a `test-dukazy/` na prostý text „(v repu workshopu)“.
    Kontrola nad `skills/` v repu ✅: v SKILL.md, README.md a references/ už nic. Zbylé nálezy jsou jen v `TEST*.md` a
    `test-dukazy/`, které se do balíčku nebalí. V ZIPu se to projeví až po přestavbě.
  - Miniskilly: koordinátor prošel všech 237 řádků. Žádný chybějící soubor, který by agent účastníka potřeboval k běhu;
    `sondy/`, `TEST*` a `test-dukazy` jsou citace důkazů, `tools/…` laboratorní nástroje testera. Výjimka: varianta C v
    `egd-planovane-ulohy` (`napojeni-report-job.py`, `napojeni-exo-rbac.ps1`, `napojeni-job-deploy.sh`) – nasazuje ji IT,
    skripty v balíčku chybí. Návrh: přibalit do `scripts/`, nebo označit „jen pro IT, v repu“.
  - `egd-recon`: `SKILL.md:72` dál uvádí `test-dukazy/jakub-*.md`. Doporučení labového nástroje z výpisu reconu koordinátor
    odstranil.
- **B4 (instalační prompt):** viz níže; prompt funguje, jen je na 2 skilly a na osobní složku.
- **Ověřeno opravené z prvního běhu:** Z7 (zkušební položka nese jméno z kroku 0), Z9 (balíček z `a4cac70`), Z6
  (červený štítek E.ON v seznamu, nekontrolováno vizuálně), Z5 v režimu open (spolužák bez sdílení hlasuje).

### Instalační prompt

Použitý text (prošel v Claude Code; zdroj a cíl jsou lab cesty): `~/egd-e2e-balicek/prompt-instalace.txt`.
**Návrh úpravy `dist/EMAIL-instalace-skillu.md`** (vlastník hlavní session):

1. Úvod a krok 1 postupu: „deset skillů“ místo „dva“ a výčet (nebo „všechny podsložky `egd-*`“, odolné vůči dalším skillům);
   věta „Uvnitř jsou dvě složky“ → „složky `egd-…` (10)“.
2. Ověření: „Ověř, že v **každé** složce `egd-*` je `SKILL.md`, a vypiš je“ místo dvou pevných cest.
3. Doplnit: „Kopíruj i skryté soubory a podsložky (`.npmignore`, `.yo-rc.json`, `.vscode`)“ – agent je sám zmínil jako
   riziko; při `cp -R` projdou, při kopírování po souborech ne.
4. Doplnit pro Claude Code: „Když se tě agent zeptá na povolení příkazu pro kopírování, povol ho“ – v režimu bez povolení
   Bash agent instalaci odmítne a jen vypíše příkaz (1. pokus).
5. Po instalaci první věta účastníka: místo „zkontroluj připravenost“ zvážit „zkontroluj připravenost na workshop a pak mi
   postav první appku přes egd-prvni-appka“, dokud trvá B1.
6. „Co jsme nestihli ověřit“: doplnit „instalace z balíčku ověřena v Claude Code (macOS) 24. 11., viz sondy/e2e/balicek“.

## Neověřeno

- Instalace do **osobní** složky (`~/.claude/skills`, `%USERPROFILE%`) – záměrně jen projektová, aby se nemíchala se
  skilly ostatních sessions; obsah kopie je stejný (`diff -r`).
- Copilot: brief upraven na instalaci ze stejného ZIPu ([../copilot/BRIEF.md](../copilot/BRIEF.md)), běh pustí tester.
- Windows / PowerShell 5.1, E.ON tenant (skupina „Everyone except external users“ pro režim open) ⛔.
- Plné `npm ci` se studenou npm cache.

## Stav po testu

Na `/sites/egd10-prod` zůstává: seznam `EGD-pripravenost` (1 položka), `MojeAppka` (2 hlasy), appka v katalogu webu,
stránka `prvni-appka.aspx`, **práva režimu open** (Všichni kromě externích: Čtení na webu, Přispívání na seznamu).
Mazání / `rezim single` jen po ano Pavla. egd10 ve výdeji uvolněn. Pracovní složka `~/egd-e2e-balicek/` (mimo repo)
zůstává jako důkaz; `node_modules` v ní sloučené `apfs-dedupe` se vzory.

## Přeověření po B1 + B3 – 24. 11. 2026 12:49–13:01 (Claude, egd10)

**Balíček:** testován `dist/egd-skills.zip` SHA-256 `9e7f70988b347ffcf399204d2169dc1d1f73a0dca7069f79a9a503d3e2d88583`
(98 souborů, přestavěn z `ab3eaae` v 12:47). Zadání znělo na `bcdeeebd…c641` z `8511625`. Hlavní session potvrdila, že
mezi nimi se změnil jen text odkazů v pěti miniskillech (data-seznamy, maily, dokumenty, llm-gateway, externi-api).
`egd-pripravenost` a `egd-prvni-appka` jsou v obou stejné, takže výsledek platí pro oba ZIPy.
Nová prázdná složka `~/egd-e2e-balicek/r2/` (mimo repo), web **`/sites/egd10-test`**, výdej
„E2E Claude balicek 2“. Důkazy jsou v [dukazy/r2/](dukazy/r2/).

**Výsledek: ✅ za 12 min a 3,80 USD.** Agent po připravenosti po staré appce nesáhl.

| # | Čas | Krok | Co účastník viděl | | Důkaz |
|---|---|---|---|---|---|
| 1 | 12:49 | Výdej egd10 (heslo zamaskované) | Váš účet: egd10 | ✅ | `r2/02-*`, `r2/03-*` |
| 2 | 12:51:32–49 | Instalace agentem podle nového `dist/EMAIL-instalace-skillu.md` (cíl `prace/.claude/skills/` místo osobní složky) | 10 skillů, SKILL.md v každém, pokyn spustit novou relaci | ✅ `diff -rq` shodné | `r2/01-instalace.json` |
| 3 | 12:52 | `kontrola-odkazu.py` nad rozbalením | 0× rozbitý markdown odkaz; cesty do repa jen jako text (B3) | ✅ | `r2/02-kontrola-*.txt` |
| 4 | 12:53–12:54 | Věta „zkontroluj připravenost na workshop a pak mi postav první appku přes egd-prvni-appka“ | Kontroly zelené, dotaz na jméno, web, appId, přihlášení | ✅ | `r2/10-tah1.json` |
| 5 | 12:54–12:55 | Jméno, web egd10-test, appId od lektora | Přihlášení egd10 ověřené, plán zkušebního zápisu | ✅ | `r2/11-tah2.json` |
| 6 | 12:55–12:56 | „ano“ | Zkouška zapsaná, **přechod na `egd-prvni-appka`** (`cesta` = A), dotaz na značku/režim/nadpis | ✅ | `r2/12-tah3.json` |
| 7 | 12:56–12:58 | „EG.D, open, nadpis ponech výchozí.“ | `novy` + `build` OK, plán seznamu `MojeAppka` | ✅ | `r2/13-tah4.json` |
| 8 | 12:58 | „ano“ | Seznam hotový, plán nasazení (open: práva už sedí) | ✅ | `r2/14-tah5.json` |
| 9 | 12:59 | „ano“ | Nasazeno, `over` OK, URL stránky a co má být vidět | ✅ | `r2/15-tah6.json` |
| 10 | 13:00 | egd10 v prohlížeči: vzhled EG.D, hlas 3 | „Zapsáno: 3. Díky!“ | ✅ | `r2/20-appka.png`, `r2/21-*` |
| 11 | 13:01 | Spolužák egd01 (open): appku vidí, mění hlas 4 → 2 | „Změněno na 2. Díky!“ | ✅ | `r2/22-*`, `r2/23-*` |
| 12 | 13:01 | Čtení zpět REST `MojeAppka` | 24. 11.: autor 7 (egd10) = 3, autor 11 (egd01) = 2 | ✅ | `r2/24-rest-mojeappka.json` |

**Co agent spustil** (`r2/19-nastroje.txt`, 16 volání):
- Skill `egd-pripravenost`, pak jen `pripravenost.mjs` (nastroje, npm, sit, varianty, **cli-instalace**, spfx, github,
  prihlaseni, zkouska, zkouska --ano).
- Pak skill `egd-prvni-appka` a jeho `appka.mjs` (cesta, novy, build, seznam, nasadit).
- `egd-pripravenost/scripts/appka.mjs` ani šablonu `templates/spokojenost` nevolal. Značku a režim zapsal do zprávy.
- B2 je oproti prvnímu testu lepší: `cli-instalace`, `github` a `varianta-pouzita-<oblast>` (node, cli, prihlaseni)
  tentokrát proběhly.

### Nálezy přeověření

- **B1-zbytek (egd-pripravenost, drobné):** `SKILL.md:27` dál popisuje poslední krok „postav appku (seznam
  `SpokojenostHodnoceni` …)“. Agent to převzal do věty v tahu 2: „`egd-prvni-appka` … bude chtít … ano na seznam
  `SpokojenostHodnoceni`“. Skutečný běh šel správně na `MojeAppka`, ale účastník chvíli čte jméno cizího seznamu.
  Návrh: v ř. 27 dopsat, že po větě s `egd-prvni-appka` se tento krok přeskakuje, nebo ho přesunout až za oddíl
  z ř. 131.
- **B5 (egd-pripravenost, kosmetika, artefakt testu):** `cli-instalace` nainstalovala `@pnp/cli-microsoft365` **12.0.0**
  (`prace/node_modules`). Hlášení ale zní „v11.11.0 lokálně v node_modules“, protože verzi čte z CLI
  v `PRIPRAVENOST_M365_CLI` (test ho směruje na globální v11, Z2b). Účastník proměnnou nastavenou mít nebude.
  Popisek by měl jmenovat skutečný zdroj verze.
- Bez nálezu: instalační prompt (B4) prošel napoprvé, včetně skrytých souborů a kontroly SKILL.md.

**Stav po přeověření:** na `/sites/egd10-test` zůstává appka 1.0.0.0 v katalogu webu, stránka `prvni-appka.aspx`,
`MojeAppka` (4 položky; tento běh přidal hlas egd10 a změnil hlas egd01), `EGD-pripravenost` +1 položka. Práva režimu open tam byla už před
během. Mazání jen po ano Pavla. Složka `~/egd-e2e-balicek/r2/` zůstává jako důkaz.
