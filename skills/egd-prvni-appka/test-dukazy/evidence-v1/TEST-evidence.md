# Test skillu egd-prvni-appka (22. 11. 2026)

Lab tenant `pavelchocholousgmail`, web
https://pavelchocholousgmail.sharepoint.com/sites/egd-test-prvni-appka (založený pro test:
Communication site, jazyk čeština, vlastní katalog aplikací přes `spo site appcatalog add`, tedy
v roli IT). macOS, Node 22.23.5, CLI for Microsoft 365 11.11.0 (`HOME=~/.m365-osobni`, účet
Global Admin). Výsledek `egd-pripravenost` byl **syntetický** (`.pripravenost/vysledky.json` se
zelenými položkami), protože prereq skill se testoval zvlášť.

## Jak se testovalo

Samostatný agent (Sonnet, effort medium) dostal jen cestu k SKILL.md a roli vibecodera z EG.D
(„Postav mi první appku na můj web …“). Skill ani skript neupravoval. Zápisy měl předem
schválené jen na testovací web. Pak jsem skill opravil podle toho, kde zaváhal, a sám prošel
cestu nové verze.

## Co bylo ověřeno

| Krok | Výsledek | Jak ověřeno |
|---|---|---|
| `cesta` převezme výsledek prereq a doporučí A | ✅ rc 0 | výstup skriptu |
| `novy`: šablona, nové GUIDy, `npm ci` z lockfile | ✅ rc 0 (2× čistě: smoke + agent) | výstup, `package-solution.json` |
| `build`: Heft, `.sppkg` 11,8 kB, bez chyb a varování | ✅ rc 0 | soubor existuje |
| `seznam`: plán (rc 10) → `--ano` → seznam + sloupce + formátování Stavu, čtení zpět | ✅ | `spo field list` ve skriptu |
| `nasadit`: plán (rc 10) → `--ano` → add / deploy / install / stránka Article → sekce → web part → SingleWebPartAppPage, čtení zpět | ✅ rc 0, vše `--appCatalogScope sitecollection` | `spo page get`: layout SingleWebPartAppPage, web part na stránce |
| propagace web partu | v tomto běhu nenastala (web part šel vložit hned prvním pokusem); čekací smyčka skriptu tedy ❓ neprověřená | `nasadit.out` bez řádku „propaguje“ |
| nová verze: 1.0.0.1, `build`, `nasadit --ano` → `upgrade` | ✅ katalog ukazuje 1.0.0.1, `Deployed=true` | `over`, `spo app list` |
| `over` (kontrola bez prohlížeče) | ✅ rc 0 | výstup |
| REST volání appky (stejné URL a hlavičky jako `EvidenceWebPart.ts`): práva seznamu, POST položky s `odata=nometadata` bez `__metadata`, MERGE se schválením, čtení s `$expand=Author` | ✅ položka 1 založena a schválena | `m365 request` pod vlastníkem webu |
| vykreslení appky na `?env=WebView` (bez rámu SharePointu), 0 chyb v konzoli | ✅ | headless Chrome, [1-zadavatel-start.png](test-dukazy/1-zadavatel-start.png) |
| zadavatel (petra.novakova, role **Člen**): štítek „Zadavatel“, záložka Ke schválení skrytá, odeslání → „Požadavek je odeslaný.“ → položka v Moje požadavky se stavem Nový | ✅ | [2-zadavatel-odeslano.png](test-dukazy/2-zadavatel-odeslano.png) |
| schvalovatel (jakub.kucera, role **Vlastník**): štítek „Zadavatel a schvalovatel“, položka v Ke schválení, Schválit s komentářem | ✅ | [3-…](test-dukazy/3-schvalovatel-ke-schvaleni.png), [4-schvalovatel-hotovo.png](test-dukazy/4-schvalovatel-hotovo.png) |
| zápis do seznamu z UI | ✅ položka 2: autor Nováková Petra, Stav Schváleno, Komentar „Schvaleno v UI testu“ | `spo listitem list` |

`InstalledVersion` (`spo app instance list` → `Version`) je u `skipFeatureDeployment: true`
prázdný ✅; o nové verzi rozhoduje katalog.

## Kde agent zaváhal a co se opravilo

| Zaváhání | Oprava |
|---|---|
| `<A>` vypadal jako složka, ne cesta ke skriptu | `<A>` = úplná cesta k `scripts\appka.mjs`, jak ji odvodit |
| pracovní složka se jmenovala jinak než `%USERPROFILE%\egd-workshop` | pracovní složka = ta, kde je `.pripravenost` |
| ptát se na nadpis, i když ho uživatel řekl? | „co už uživatel řekl, se znovu neptej“; nadpis jde jako `--nadpis` |
| `cesta` ukazovala „zkouska: neověřeno“ bez vysvětlení | řádek odstraněn (pro první appku nerozhoduje) |
| výstup skriptu bez diakritiky, plán se s `--ano` vypíše znovu | vysvětleno v SKILL.md |
| prohlížeč chtěl přihlášení jiným účtem a Authenticator | „nepřihlašuj se, ověření nech uživateli“ |
| chyběla kontrola bez prohlížeče | nový příkaz `over` (jen čtení) |
| titulek web partu bez diakritiky | manifest šablony s diakritikou, build ověřen |

Oprava po upozornění session „Miniskilly“ (22. 11.): řazení `Created desc` nad seznamem se 6000
položkami (`/sites/egd-sonda-miniskilly`) vrací 500 (throttling, Created není indexovaný),
`ID desc` vrací 200 položek ✅ (`m365 request`, jen čtení). Šablona teď řadí podle `ID desc`.
Ověřeno: build, nasazení 1.0.0.2 s `upgrade`, stránka posílá `$orderby=ID desc&$top=200`
(zachycený síťový požadavek) a `ui-test.mjs` znovu prošel (zadavatel i schvalovatel) ✅.
Limit: záložky Moje / Ke schválení filtrují jen posledních 200 položek ❓ u velkých seznamů.

UI test: [test-dukazy/ui-test.mjs](test-dukazy/ui-test.mjs) (Playwright, headless Chrome) pod
uloženými Chrome profily lab uživatelů `~/.config/ppf-rooms-lab/profily/<uživatel>`, bez zadávání
hesla. Spuštění: `node test-dukazy/ui-test.mjs "<url stránky s ?env=WebView>" <složka na snímky>`
(playwright-core se bere z `sondy/dokumenty/node_modules`). Oba uživatelé byli pro test přidáni
na web (`spo group member add`: Petra do Členů, Jakub do Vlastníků). Přihlášení heslem
z `lab.secrets.json` agent záměrně nepoužil (zadávání hesel mu pravidla nedovolují).

## Neověřeno (důvod a jak ověřit)

| Co | Proč ne | Jak a kde ověřit |
|---|---|---|
| Windows, PowerShell 5.1, portable Node, dlouhé cesty v `node_modules` | v labu není Windows stroj | Windows VM nebo notebook EG.D: README instalace → `cesta`, `novy`, `build`, `nasadit` |
| tenant E.ON: role na AILab-Dev, katalog od IT, appId pro CLI, proxy / npm mirror | jen v tenantu E.ON | pondělní zkouška s Tomášem nebo Adrianou na AILab-Dev |
| cesta **A2** (ruční nahrání `.sppkg`, přidání appky, stránka v prohlížeči) | klikací cesta z dokumentace, v labu neprojitá | v labu Playwrightem pod profilem (např. eva.vesela jako Člen na druhém testovacím webu); doplnit přesné české popisky |
| cesta **B** v prohlížeči (pohledy, formátování ručně, Power Apps formulář, Power Automate) | v labu změřené jen CLI části (`seznam`, formátování Stavu přes CLI) | v labu Playwrightem; Power Apps vyžaduje prostředí a licenci v labu |
| `?env=WebView` u zobrazení seznamu (cesta B) | neměřeno | otevřít `Lists/Pozadavky/AllItems.aspx?env=WebView` pod lab profilem |
| čekací smyčka na propagaci web partu | v obou bězích web part šel vložit hned | nové `nasadit` na čerstvém webu hned po `site appcatalog add` |
| hlášky 403 v appce a u `spo app add` pro roli Čtenář | testován jen Člen a Vlastník | přidat lab uživatele do Návštěvníků a spustit `ui-test.mjs` a `nasadit` jeho přihlášením |
| CLI 12 | test běžel na CLI 11.11 | `node "<A>" ... --cli <CLI 12 dist/index.js>` po `cli-instalace` z egd-pripravenost |
