# Test skillu egd-prvni-appka

Aktuální šablona: **Spokojenost s prostředím kanceláře dnes** (tlačítka 1–5 + dashboard), od
22. 11. 2026 večer. Předchozí šablona „Evidence požadavků“ a její test jsou v
[test-dukazy/evidence-v1/](test-dukazy/evidence-v1/TEST-evidence.md) - ověřený řetězec
(novy → build → seznam → nasadit, test agentem, který znal jen skill) platí i teď, skript je stejný.

Prostředí: lab tenant `pavelchocholousgmail`, macOS, Node 22.23.5, CLI for Microsoft 365 11.11.0
(`HOME=~/.m365-osobni`, účet `pavel.admin`, Global Admin), SPFx 1.24.1.

## Spokojenost na `/sites/egd-test-prvni-appka` (22. 11. 2026)

| Krok | Výsledek | Důkaz |
|---|---|---|
| `novy` (šablona, nové GUIDy, `npm ci` z lockfile), `build` (12 041 B, bez chyb a varování) | ✅ rc 0 | [spokojenost-1-retezec.log](test-dukazy/spokojenost-1-retezec.log) |
| `seznam` plán (rc 10) → `--ano`: seznam Spokojenost, sloupce Hodnoceni (číslo 1–5), Den, formátování | ✅ rc 0, čtení zpět | tamtéž |
| `nasadit` plán (rc 10) → `--ano`: add / deploy / install / Article → sekce → web part → SingleWebPartAppPage | ✅ rc 0, čtení zpět | tamtéž |
| nová verze 1.0.0.1: `build` + `nasadit --ano` → `upgrade` | ✅ rc 0 | [spokojenost-2-upgrade.log](test-dukazy/spokojenost-2-upgrade.log) |
| UI pod **Členem** (eva.vesela): appka na `?env=WebView`, klik 4 → „Zapsáno: 4. Díky!“, tlačítko zvýrazněné, dashboard 1 hlas / 4,0 | ✅ 0 chyb konzole | [spokojenost-3-ui-prvni-beh.log](test-dukazy/spokojenost-3-ui-prvni-beh.log) (test hlásil `potvrzeno=false` kvůli chybě v regexu testu, ne appky; opraveno) |
| UI pod **Vlastníkem** (jakub.kucera): klik 2 → dashboard 2 hlasy / 3,0 | ✅ | tamtéž |
| změna hlasu: Eva 5 → „Změněno na 5.“, Jakub 1 → „Změněno na 1.“, počet hlasů dnes zůstal 2 | ✅ `VSE OK` | [spokojenost-4-ui-zmena.log](test-dukazy/spokojenost-4-ui-zmena.log), [snímek](test-dukazy/spokojenost-lab/1b-eva.vesela-po-hlasu.png) |
| zápis do seznamu | ✅ 2 položky, Den 2026-11-22, Eva 5, Jakub 1 | konec `spokojenost-4-ui-zmena.log` |
| dotaz appky `$orderby=ID desc&$top=2000` (projde i nad 5000 položkami) | ✅ zachycený síťový požadavek | logy UI testu |

UI test: [test-dukazy/ui-test.mjs](test-dukazy/ui-test.mjs) (Playwright, headless Chrome) pod
uloženými profily lab uživatelů `~/.config/ppf-rooms-lab/profily/<uživatel>`, bez zadávání hesla:
`node test-dukazy/ui-test.mjs "<url s ?env=WebView>" <složka> eva.vesela:4 jakub.kucera:2`.
Eva byla pro test přidána do Členů webu, Jakub do Vlastníků (`spo group member add`). Účty a role změřené dodatečně (`kdo-jsem.mjs`, `_api/web/currentuser`, skupiny, EffectiveBasePermissions): [spokojenost-ucty.log](test-dukazy/spokojenost-ucty.log).

## Dvě appky vedle sebe na jednom webu (22. 11. 2026 večer)

Kanonická appka Spokojenost je v `egd-pripravenost` (pondělí). Aby šly obě na stejný web, má šablona
egd-prvni-appka od teď **vlastní GUIDy** (řešení `5385b1dc-…`, feature `6d8d18a0-…`, web part
`c44510bd-…`; `novy` je navíc v každém projektu nahradí novými), **stránku `prvni-appka.aspx`**
(dřív `spokojenost.aspx`, stejně jako v egd-pripravenost) a seznam `Spokojenost` (egd-pripravenost
má `SpokojenostHodnoceni`). Čerstvý web `/sites/egd-test-vedle-sebe` s katalogem, pavel.admin.

| Krok | Výsledek | Důkaz |
|---|---|---|
| egd-prvni-appka: `novy`, `build`, `seznam --ano`, `nasadit --ano` | ✅ rc 0 | [vedle-sebe-nasazeni.log](test-dukazy/vedle-sebe-nasazeni.log) |
| egd-pripravenost (jeho `appka.mjs` a jeho `.sppkg`): `seznam --ano`, `nasadit --ano` na tentýž web | ✅ rc 0 | tamtéž |
| čtení zpět: v katalogu obě řešení (`prvni-appka-…` 1.0.0.0, `spokojenost-appka-…` 1.0.0.1), obě nainstalované, dva seznamy, dvě app stránky s web partem | ✅ `over` obou skriptů | tamtéž, konec |
| prohlížeč, eva.vesela (Člen): prvni-appka klik 4 → „Zapsáno: 4. Díky!“; pripravenost klik 2 → „Děkujeme, vaše hodnocení je uložené.“; zpět na prvni-appka → hlas 4 pořád vybraný | ✅ `VSE OK`, 0 chyb konzole, každá appka čte jen svůj seznam | [vedle-sebe-ui.log](test-dukazy/vedle-sebe-ui.log), účet a role: [vedle-sebe-ucty.log](test-dukazy/vedle-sebe-ucty.log) (eva.vesela, skupina Členové, Low 1011030767 = AddListItems bez ManageWeb), [snímky](test-dukazy/vedle-sebe-lab/), test [vedle-sebe-test.mjs](test-dukazy/vedle-sebe-test.mjs) |

Vedlejší nález: `m365 spo app list --appCatalogScope sitecollection --appCatalogUrl <web>` vrátil
na tomto webu jednou `…/sitecollectionappcatalog/ se nedá najít`, i když `spo app add/deploy/install`
na stejném katalogu chvíli předtím prošly; o pár minut později tentýž příkaz vrátil obě řešení ✅.
Katalog čerstvě založeného webu tedy může krátce „blikat“ ❓ (příčina neověřena). Skript tuto
hlášku bere jako „web nemá katalog“; kdo ji dostane na webu, kde katalog prokazatelně je, má příkaz
za minutu zopakovat.

## Role Čtenář v appce (22. 11. 2026 večer)

zuzana.kralova přidaná do Návštěvníků `/sites/egd-test-vedle-sebe`, `ui-test.mjs … zuzana.kralova:3`:
appka se načte, dashboard ukáže cizí hlasy (1 hlas, 4,0), klik na 3 → REST 403 a appka ukáže
„Hlasovat nemůžete: na seznamu nemáte právo přidávat položky. Požádejte vlastníka webu o roli Člen
(Member).“ ✅ (test hlásí `SELHALO`, protože čeká úspěšný hlas; tady je odmítnutí správně).
Účet a role: [vedle-sebe-ucty.log](test-dukazy/vedle-sebe-ucty.log) (zuzana.kralova, skupina Návštěvníci, Low 138612833 bez AddListItems). Důkaz: [ctenar-ui.log](test-dukazy/ctenar-ui.log), [snímek](test-dukazy/ctenar-lab/1b-zuzana.kralova-po-hlasu.png).

## `egd01-dev` pod účtem egd01

Agent se heslem ze secrets nepřihlašuje (pravidla mu zadávání hesel nedovolují). Profil egd01
přihlásil Pavel ručně (`tools/lab-profil-prihlaseni.mjs egd01`, 24. 11.), testy pak běží headless
bez hesla. CLI pod egd01 vrací AADSTS65001 (`08-ucty-ucastniku.md`), účastníci v labu tedy
nasazují cestou **A2** (ruční nahrání).

### Ruční nahrání `.sppkg` do katalogu webu v prohlížeči (24. 11. 2026, díra 17) ✅

Skript [katalog-ui-test.mjs](test-dukazy/katalog-ui-test.mjs) (stejné kliky jako
`tools/lab-ucty-ui-nasazeni.mjs` u egd05, jen s uloženým profilem místo hesla), web
`/sites/egd01-dev`, balíček `prvni-appka.sppkg` z existujícího buildu `sondy/ms-prava/prvni-appka`
(22. 11.). Má stejný název řešení, ale uvnitř je jiný web part („evidence“), ne Spokojenost. Pro
samotné nahrání a nasazení to nevadí, appku ověřuje až sekce níže.

| Krok | Výsledek |
|---|---|
| kdo | `egd01@…`, skupina „Vlastníci webu Účastník 01 – DEV“, admin kolekce, plná práva (High 2147483647) |
| `<web>/AppCatalog` → **Nahrát** → soubor → **OK** | „Nahrávání se dokončilo (počet přidaných souborů: 1)“ |
| dialog „Důvěřujete aplikaci prvni-appka-client-side-solution?“ | ✅ zobrazen; zaškrtávátko „Zpřístupnit toto řešení na všech webech v organizaci“ **nezaškrtnuté** (jen tento web) |
| **Nasadit** | ✅ katalog přes REST: `prvni-appka-client-side-solution`, `Deployed: true`, verze 1.0.0.0; dříve nasazené appky beze změny |

Důkaz: [ui-egd01.log](test-dukazy/katalog-egd01/ui-egd01.log), snímky
[katalog](test-dukazy/katalog-egd01/1-katalog.png), [Nahrát](test-dukazy/katalog-egd01/2-nahrat.png),
[důvěra](test-dukazy/katalog-egd01/3-duvera.png), [po nasazení](test-dukazy/katalog-egd01/4-po-nasazeni.png).
Podmínku úspěchu skriptu jsem po běhu zpřísnil: dřív stačila kterákoli nasazená appka v katalogu,
teď musí být nasazená nová nebo změněná položka. Tento běh by prošel i podle nové podmínky
(nová položka 92f450c3, `nasazena: true`). Pozor: balíček z tohoto běhu je jiný web part („evidence“
ze sondy `ms-prava`), appka Spokojenost to není. Proto celá cesta A2 níže běžela znovu s balíčkem
postaveným z šablony skillu.

### Celá cesta A2 v prohlížeči pod egd01 (24. 11. 2026) ✅

Jako účastník bez CLI, podle [references/rucne-v-prohlizeci.md](references/rucne-v-prohlizeci.md)
(návod jsem podle zkoušky opravil). Kroky dělá skript [a2-krok.mjs](test-dukazy/a2-krok.mjs)
(uložený profil egd01, bez hesla, klikání v UI). Hlasování ověřil [ui-test.mjs](test-dukazy/ui-test.mjs).

**Balíček:** `novy --bez-instalace` (šablona, nové GUIDy: solution `bf9f5ac7…`, web part `16d31e58…`)
ve scratchpadu. `node_modules` jsou APFS klon (`cp -c -R`) ze zdravého vzoru se shodným zámkem (0 prázdných
`package.json`). `npm ls` rc 0, pak `build` rc 0 a vznikl `prvni-appka.sppkg` (12 kB). Bez `npm ci`.

| Krok návodu | Výsledek | Důkaz |
|---|---|---|
| 3 nahrát a nasadit v katalogu | ✅ ProductId `bf9f5ac7…`, `Deployed: true`. Soubor stejného jména přepsal položku 92f450c3 (dřívější balíček „evidence“) a skript to nepoznal, protože se ID položky ani verze nezměnily. Kontrolu jsem doplnil o ProductId. Log proto končí **SELHALO** (`nove nebo zmenene: []`): stará kontrola hledala nové ID položky, ne ProductId. ProductId doložen dodatečným čtením katalogu (24. 11. odpoledne, jen čtení pod pavel.admin): položka 92f450c3 = ProductId `bf9f5ac7-cf87-…`, `Deployed: true` | [1-katalog.log](test-dukazy/a2-egd01/1-katalog.log), [1b-katalog-productid.json](test-dukazy/a2-egd01/1b-katalog-productid.json) |
| 2 seznam | ✅ Obsah webu → **Nové** → Seznam → okno „Jak chcete začít?“ → **Vytvořit z prázdného: Seznam** → název → Vytvořit. Starý návod říkal „Prázdný seznam“, tak se ta volba nejmenuje | [2-seznam.log](test-dukazy/a2-egd01/2-seznam.log), [snímek](test-dukazy/a2-egd01/seznam-2-vytvorit-seznam.png) |
| 2 sloupce | ✅ **Přidat sloupec** → Číslo (`Hodnoceni`, Další možnosti: min 1, max 5) a **Text** (`Den`; volba se jmenuje „Text“, ne „Jeden řádek textu“). REST: `Hodnoceni` Number 1–5, `Den` Text | [3-sloupce.log](test-dukazy/a2-egd01/3-sloupce.log) |
| ⚠️ kolize názvu seznamu | Na egd01-dev už je seznam `Spokojenost` od egd-pripravenost se sloupci Hodnoceni, DenCislo a Klic. Proto vznikl `SpokojenostA2`. S výchozím názvem appka ukázala „SharePoint vrátil chybu 400 … Pole nebo vlastnost Den neexistuje“ | [snímek](test-dukazy/a2-egd01/stranka-6-po-zmene-seznamu.png) |
| 4 přidat appku | ✅ **nutné**: před ním web (`GetClientSideWebParts`) náš web part neznal, i když byl balíček nasazený (`skipFeatureDeployment: true`). Obsah webu → Nové → Aplikace → Přidat → „Přidání proběhlo úspěšně.“, web part dostupný do 10 s | [4-pridat.log](test-dukazy/a2-egd01/4-pridat.log) |
| 5 stránka | ✅ Nové → Stránka → Galerie šablon → **Vytvořit prázdné** → název `prvni-appka` (soubor `prvni-appka.aspx`) → Sada nástrojů → hledat „Spokojenost“ | [5-stranka.log](test-dukazy/a2-egd01/5-stranka.log) |
| ⚠️ dva stejné web party | V Sadě nástrojů jsou dva výsledky „Spokojen…“ (náš a egd-pripravenost). Rozliší je jen popis po najetí myší: náš „Hodnocení 1–5 jedním kliknutím a souhrn za dnešek a posledních 7 dní.“ | [snímek](test-dukazy/a2-egd01/stranka-2-toolbox-hledani.png) |
| 5 vlastnosti | ✅ lišta web partu **Upravit vlastnosti** → „Název seznamu na tomto webu“ = `SpokojenostA2`. Hláška 400 zůstane do publikování a nového načtení | [6-publikovat.log](test-dukazy/a2-egd01/6-publikovat.log) |
| 5 publikovat | ✅ **Publikovat stránku**, `prvni-appka.aspx` Level 1 (publikováno) | [6-publikovat.log](test-dukazy/a2-egd01/6-publikovat.log) |
| 6 hlasování | ✅ klik 4 → „Změněno na 4. Díky!“, zvýrazněná 4, dashboard 1 hlas, průměr 4,0. REST: v `SpokojenostA2` položka Hodnoceni 4, Den 2026-11-24, autor Účastník 01. Cizí `Spokojenost` netknutý (2 položky, naposledy 22. 11.) | [7-hlas.log](test-dukazy/a2-egd01/7-hlas.log), [8-zapis-rest.log](test-dukazy/a2-egd01/8-zapis-rest.log), [snímek](test-dukazy/a2-egd01/hlas/1b-egd01-po-hlasu.png) |
| `?env=WebView` na běžné stránce | ✅ lišta SharePointu zmizí, zůstane banner s názvem stránky a appka | týž snímek |

„Změněno“ místo „Zapsáno“: hlas založil už první běh `ui-test.mjs` (09:03:12), který pak spadl na
dvou nadpisech `h1` (běžná stránka má i `h1` banneru). `ui-test.mjs` teď hledá jen nadpis appky.
Druhý běh hlas změnil (09:03:26).

Na egd01-dev po zkoušce zůstaly: seznam `SpokojenostA2`, stránka `prvni-appka.aspx`, nepublikovaný
koncept `Page.aspx` z neúspěšného pokusu a v katalogu náš balíček místo dřívějšího „evidence“.
Nic jsem nemazal.

### Šablona bez kolize s egd-pripravenost (24. 11. 2026) ✅

Kolize ⚠️ z tabulky výše budou mít ve středu všichni účastníci, protože egd-pripravenost běží na
stejném webu dřív. Šablona proto dostala jiné názvy:
- výchozí seznam je `MojeAppka` (dřív `Spokojenost`; egd-pripravenost má `Spokojenost` nebo
  `SpokojenostHodnoceni`);
- titulek web partu v Sadě nástrojů je **„Moje první appka“** (dřív „Spokojenost s prostředím
  kanceláře“, stejně jako u egd-pripravenost).

Nadpis a otázka v appce zůstaly. Změněno v šabloně (manifest, výchozí hodnota v `SpokojenostWebPart.ts`),
v `DEFAULT_LIST` v `appka.mjs`, v SKILL.md a v návodech A2 a B.

Ověřeno na `/sites/egd01-dev` v kolizním stavu: je tam seznam `Spokojenost` a web part
„Spokojenost s prostředím kanceláře“ od egd-pripravenost a navíc náš web part z předchozí zkoušky.
Účet egd01, prohlížeč, bez CLI. Balíček je nový projekt
`novy --slozka moje-appka --bez-instalace` + klon `node_modules` (`cp -c`) + `build`, solution
`f23585f0…`, web part `dde1a220…`. Složka `moje-appka`, aby nepřepsala soubor `prvni-appka.sppkg`
z předchozí zkoušky. U účastníka bude `prvni-appka`.

| Krok | Výsledek | Důkaz |
|---|---|---|
| nahrát a nasadit | ✅ nová položka `moje-appka-client-side-solution`, `Deployed: true` | [1-katalog.log](test-dukazy/a3-moje-appka/1-katalog.log) |
| seznam `MojeAppka` + sloupce | ✅ Hodnoceni Number 1–5, Den Text | [2-seznam.log](test-dukazy/a3-moje-appka/2-seznam.log), [2-sloupce.log](test-dukazy/a3-moje-appka/2-sloupce.log) |
| Přidat appku | ✅ web part „Moje první appka“ dostupný do 10 s | [2-pridat.log](test-dukazy/a3-moje-appka/2-pridat.log) |
| Sada nástrojů, hledat „Moje první appka“ | ✅ **jediný výsledek**, náš web part. Bez rozlišování podle popisu | [3-stranka.log](test-dukazy/a3-moje-appka/3-stranka.log), [snímek](test-dukazy/a3-moje-appka/stranka-3-toolbox-hledani.png) |
| vlastnosti | ✅ „Název seznamu na tomto webu“ = `MojeAppka` ve výchozím stavu, nic se nepřepisovalo, žádná chyba 400 | [4-publikovat.log](test-dukazy/a3-moje-appka/4-publikovat.log) |
| publikovat | ✅ `moje-appka.aspx` Level 1 | týž log |
| hlas | ✅ klik 5 → „Zapsáno: 5. Díky!“, dashboard 1 hlas, průměr 5,0. REST: položka v `MojeAppka` (Hodnoceni 5, Den 2026-11-24, Účastník 01). Seznam `Spokojenost` od egd-pripravenost netknutý (2 položky, naposledy 22. 11.) | [5-hlas.log](test-dukazy/a3-moje-appka/5-hlas.log), [6-zapis-rest.log](test-dukazy/a3-moje-appka/6-zapis-rest.log), [snímek](test-dukazy/a3-moje-appka/hlas/1b-egd01-po-hlasu.png) |
| CLI cesta A, plán `seznam` | ✅ plán „založit seznam "MojeAppka"“, rc 10, nic nezapsáno (pavel.admin, `/sites/egd-test-vedle-sebe`) | [7-cli-plan-seznam.log](test-dukazy/a3-moje-appka/7-cli-plan-seznam.log) |

#### CLI cesta A s novými názvy (24. 11. 2026) ✅

Globální CLI for Microsoft 365 11.11.0 (`--cli /opt/homebrew/lib/node_modules/@pnp/cli-microsoft365/dist/index.js`,
`HOME=~/.m365-osobni`, pavel.admin), projekt `moje-appka` z nové šablony. Důkazy: [test-dukazy/a4-cli/](test-dukazy/a4-cli/).

| Web | Krok | Výsledek |
|---|---|---|
| `/sites/egd-test-vedle-sebe` (běží tam egd-pripravenost se `SpokojenostHodnoceni` a `spokojenost.aspx`) | `seznam` plán / `--ano` | ✅ rc 10 / 0. Seznam `MojeAppka` založen, sloupce Hodnoceni a Den, formátování, zpětné čtení OK ([1](test-dukazy/a4-cli/1-seznam-plan.log), [2](test-dukazy/a4-cli/2-seznam-ano.log)) |
| | `nasadit` plán / `--ano` (`--stranka moje-appka`) | ✅ rc 10 / 0. Nahráno, nasazeno, **nainstalováno**. `moje-appka.aspx` jako SingleWebPartAppPage s web partem `dde1a220…` ([3](test-dukazy/a4-cli/3-nasadit-plan.log), [4](test-dukazy/a4-cli/4-nasadit-ano.log)) |
| | `over` | ✅ katalog OK, stránka OK, „seznam MojeAppka: 0 hlasu“ ([5](test-dukazy/a4-cli/5-over.log)). Seznam `SpokojenostHodnoceni` od egd-pripravenost: 1 položka, naposledy 22. 11. ([9](test-dukazy/a4-cli/9-cizi-seznam.log)) |
| | hlas v prohlížeči | ❓ **neprovedeno**: uložené profily eva.vesela a pavel.admin mají vypršelé přihlášení (přesměrování na login.microsoftonline.com). Přihlášené profily egd01 a tomas.prochazka na web nemají práva (perm 0). Obnovit přihlášení může jen člověk (`tools/lab-profil-prihlaseni.mjs eva.vesela`) ([6](test-dukazy/a4-cli/6-hlas.log)) |
| `/sites/egd01-dev` (kolizní stav, seznam `MojeAppka` a appka už z testu v UI) | `seznam` plán / `--ano` | ✅ plán „seznam "MojeAppka" uz existuje“ + formátování. `--ano` jen naformátoval, zpětné čtení OK ([1](test-dukazy/a4-cli/egd01-dev/1-seznam-plan.log), [2](test-dukazy/a4-cli/egd01-dev/2-seznam-ano.log)) |
| | `nasadit` plán / `--ano` (`--stranka moje-appka-cli`) | ✅ „appka na webu aktualizovana (upgrade)“ (byla nainstalovaná z UI), `moje-appka-cli.aspx` jako SingleWebPartAppPage ([3](test-dukazy/a4-cli/egd01-dev/3-nasadit-plan.log), [4](test-dukazy/a4-cli/egd01-dev/4-nasadit-ano.log)) |
| | `over` | ✅ „seznam MojeAppka: 1 hlasu (posledni: 2026-11-24 -> 5)“, tedy hlas z testu v UI ([5](test-dukazy/a4-cli/egd01-dev/5-over.log)) |
| | hlas v prohlížeči (egd01, vlastník) | ✅ klik 3 → „Změněno na 3. Díky!“ (týž seznam jako stránka z UI), dashboard 1 hlas, 3,0. `over` potom „posledni: 2026-11-24 -> 3“. Cizí `Spokojenost` netknutý ([6](test-dukazy/a4-cli/egd01-dev/6-hlas.log), [7](test-dukazy/a4-cli/egd01-dev/7-over-po-hlasu.log), [8](test-dukazy/a4-cli/egd01-dev/8-cizi-seznam.log), [snímek](test-dukazy/a4-cli/egd01-dev/hlas/1b-egd01-po-hlasu.png)) |

Bez `--cli` by `appka.mjs` CLI nenašel: v projektu ani o složku výš není `node_modules/@pnp/cli-microsoft365`.
U účastníka ho tam dává egd-pripravenost. V labu je předání globálního CLI výslovně nutné, aby se
sdílené přihlášení nepoužilo s jiným CLI.

Na labových webech přibyly: na `egd-test-vedle-sebe` seznam `MojeAppka`, stránka `moje-appka.aspx`
a appka `moje-appka`; na `egd01-dev` stránka `moje-appka-cli.aspx`. Nic jsem nemazal.

Na egd01-dev po zkoušce navíc zůstaly: seznam `MojeAppka`, stránka `moje-appka.aspx` a appka
`moje-appka-client-side-solution`. Nic jsem nemazal.

## Dvě značky v šabloně: E.ON a EG.D (24. 11. 2026) ✅

Zadání D1–D3 z artefaktu „EPL pro naše skilly“. Přepínač je v jednom souboru
`src/webparts/spokojenost/_znacka.scss` (`$znacka: eon | egd`). Všechna pravidla jsou pod `.appka`,
rozměry jsou po 4 px. `appka.mjs novy` bez `--znacka` skončí kódem 2 s výzvou, ať se agent zeptá
uživatele ✅ ([výstup níže](#vystup-novy)). SKILL.md má v kroku 0 povinnou otázku na značku.

Postup: `novy --znacka eon|egd --bez-instalace` → APFS klon `node_modules` ze vzoru `a3/moje-appka`
(zámek se liší jen jménem, 0 prázdných `package.json`, `npm ls` rc 0) → `build` → `seznam --ano`
→ `nasadit --ano` → `over` pod pavel.admin (CLI 11.11.0, `--cli`), web `/sites/egd01-dev`, seznamy
`MojeAppkaEon` / `MojeAppkaEgd`, stránky `znacka-eon.aspx` / `znacka-egd.aspx`. V prohlížeči
egd01 (vlastník), `?env=WebView`, skript [znacky-test.mjs](test-dukazy/znacky-test.mjs).

| Kontrola | E.ON | EG.D | Důkaz |
|---|---|---|---|
| balíček | 62,9 kB, `ClientSideAssets/EONScreen-Head_….woff` uvnitř | 12,2 kB, bez písma | `unzip -l` (níže) |
| nasazení, seznam, `over` | ✅ rc 0, verze 1.0.0.1 přes `upgrade` | ✅ rc 0 | [eon](test-dukazy/d1-znacky/eon-2-nasadit.log), [egd](test-dukazy/d1-znacky/egd-2-nasadit.log) |
| nadpis | `"E.ON Head"`, písmo `loaded`, `text-transform: none` | Segoe UI, žádné písmo E.ON se nenačítá | [eon log](test-dukazy/d1-znacky/eon-4-prohlizec.log) |
| karta | rohy 0, bez stínu, pozadí Gray 100 #F8F5F2 | rohy 28 px | tamtéž |
| červená / indigo | jen vybrané tlačítko (a okraj při najetí myší) | vybrané tlačítko, pruhy rozložení | [snímek eon](test-dukazy/d1-znacky/eon-prohlizec/4-po-mezerniku.png), [snímek egd](test-dukazy/d1-znacky/egd-prohlizec/4-po-mezerniku.png) |
| fokus z klávesnice | `2px solid rgb(0,117,194)` = #0075C2, `:focus-visible` | `2px solid #1200E0` | logy |
| Tab → Enter → Shift+Tab → mezerník | ✅ „Změněno na 3“, pak „Změněno na 2“ | ✅ totéž | logy, kroky 2–5 |
| kontrast textů (getComputedStyle + vzorec WCAG 2.x) | nadpis 15,1; otázka 13,9; vedlejší text (Gray 700) 6,2 / 6,7; bílá na #EA1B0A **4,51** (i popisek 12 px) | 14,8; 13,1; 6,2 / 7,0; bílá na indigu 10,0 | logy, krok 1 a 4 |
| kontrast rámečků (≥ 3 : 1) | tlačítko 4,18, panel 4,54 (Gray 600 #767676) | **před opravou 1,27 / 1,43**, po opravě 3,64 / 4,10 (#7D7A99) | [v1 egd](test-dukazy/d1-znacky/v1/egd-4-prohlizec.log) a nový log |
| Hodnocení v seznamu | 5 Red 100 / Red 800 (9,42), 4 Red 200 / Red 800 (7,23), 3 Red 300 / Red 900 (7,22), 2 Red 400 / Red 900 (4,61; bílá by měla jen 3,34), 1 Red 500 / bílá (4,51); číslo vidět vždy | semafor beze změny | [seznam E.ON](test-dukazy/d1-znacky/seznam-Eon.png), [seznam EG.D](test-dukazy/d1-znacky/seznam-Egd.png), [logy](test-dukazy/d1-znacky/seznam-Eon.log) |

Nálezy a opravy:

- **Fokus se po hlasu ztrácel** (obě značky). `render()` staví DOM znovu, takže po Enteru byl
  `document.activeElement` prázdný a mezerník nic nedělal ([v1 log](test-dukazy/d1-znacky/v1/eon-4-prohlizec.log),
  „Shift+Tab na null“). Oprava v `SpokojenostWebPart.ts` (`_fokus`): po uložení se fokus vrátí na
  stisknuté tlačítko. Po opravě ✅.
- **Rámeček EG.D #D5D7E3 nesplňoval 3 : 1** (WCAG 1.4.11). Změněn na #7D7A99. Jinak vzhled EG.D beze
  změny.
- **Bílá na #EA1B0A má 4,51.** Projde AA těsně, i pro popisek 12 px. Ztmavení by šlo proti značce.
- **Past při měření:** první běh po `upgrade` dostal od service workeru SharePointu starý bundle
  (stejná čísla jako v1). Druhý běh už nový (`spokojenost-web-part_62ee857a….js` shodný s `.sppkg`).
  Po nasazení proto ověřuj, který bundle se načetl, nebo test zopakuj.
- **`document.fonts.check()` vrací `true` i v EG.D**, kde písmo E.ON vůbec není: metoda vrací `true`,
  když nic nemusí načítat. Rozhoduje seznam `document.fonts` (`E.ON Head:loaded` vs. prázdný).

Hodnoty E.ON jsou z tokenů („E.ON brand tokens, EPL export 10. 11.“, přepsané ručně do
`_znacka.scss` a `EON_SKALA` v `appka.mjs`): Red 100–500, Gray 100 / 600 / 700 / 900, Blue 700.
Hodnoty jsem 24. 11. porovnal se souborem `brand-tokens.json` z `egd-skills-download.zip`
(red, gray, blue 100–900), všechny sedí. Pořadová škála v souboru není, je ze zadání hlavní session
(Red100/Red800, Red200/Red800, Red300/Red900, Red500/bílá). Pátý stupeň Red 400 jsem dopočítal stejnou
logikou: pozadí o krok tmavší než Red 300, text tmavý Red 900 (4,61 : 1), protože bílá na Red 400 má
jen 3,34 : 1. Obě varianty jsou znovu nasazené jako 1.0.0.2, `over` ✅ ([eon](test-dukazy/d1-znacky/eon-3-over.log),
[egd](test-dukazy/d1-znacky/egd-3-over.log)), prohlížeč ✅ s kontrolou bundlu ([eon](test-dukazy/d1-znacky/eon-bundle.log),
[egd](test-dukazy/d1-znacky/egd-bundle.log)). Past se service workerem je v [references/chyby.md](references/chyby.md).
Varianta E.ON byla přeměřená ✅ (čísla výše). Měření s mými dřívějšími
dočasnými hodnotami jsou v [v2-docasne](test-dukazy/d1-znacky/v2-docasne/). Nový bundle
(`…17a2e208….js`, shodný s `.sppkg`) se načetl až při druhém otevření stránky, při prvním
service worker vrátil starý. Test proto běžel až po kontrole bundlu.

<a id="vystup-novy"></a>`novy` bez značky:
```
[CHYBA]   chybi --znacka
          co dal: zeptej se uzivatele, jaky vzhled chce: E.ON (cervena jen na hlavni akci, hranate rohy) nebo EG.D (indigo, oble tvary); pak spust znovu s --znacka eon nebo --znacka egd
rc=2
```

Na egd01-dev zůstaly appky `znacka-eon` a `znacka-egd`, seznamy `MojeAppkaEon` / `MojeAppkaEgd`
(5 testovacích položek `test-1`–`test-5` a hlas egd01) a stránky `znacka-eon.aspx` / `znacka-egd.aspx`.
Nic jsem nemazal.

## Nálezy E2E testu účastníka (24. 11. 2026): Z5, Z6 ✅

Z E2E testu (`sondy/e2e/README.md`, účet egd10):

- **Z5 – nasdílení webu spolužákům.** Na egd01-dev: tomas.prochazka před sdílením dostal
  `AccessDenied.aspx` ([log](test-dukazy/z5-pred.log)). Vlastník egd01 v prohlížeči: ⚙ → Oprávnění
  k webu → Sdílet web → jméno → role **Upravit** → Poslat e-mail **vypnuto** → Přidat
  ([log](test-dukazy/z5-sdilet.log), [snímek před Přidat](test-dukazy/z5-sdileni/sdilet-6-pred-pridanim.png)).
  CLI potom: tomas je ve skupině Členové ([log](test-dukazy/z5-clenove.log)). Tomas otevřel
  `znacka-egd.aspx` a klikl na 5: „Zapsáno: 5. Díky!“, v seznamu položka 7 pod jeho jménem
  ([log](test-dukazy/z5-hlas.log), [seznam](test-dukazy/z5-seznam.log), [snímek](test-dukazy/z5-sdileni/hlas-2.png)).
  Skript [sdileni-test.mjs](test-dukazy/sdileni-test.mjs) (bez `Z5_PRIDAT=1` jen průzkum). Postup je v
  SKILL.md, sekce „Když mají hlasovat i ostatní“. Role Číst = hlas odmítnut, viz výše „Role Čtenář“.
- **Z6 – štítek Hodnocení v seznamu** byl vysoký ovál s číslem nahoře (div roztažený na výšku
  buňky). Nové formátování: flex obal + `span` se štítkem. Na `MojeAppkaEon` i `MojeAppkaEgd`
  znovu `seznam --ano`, štítek je malý a svisle vycentrovaný, barvy beze změny
  ([E.ON](test-dukazy/d1-znacky/seznam-Eon-z6.png), [EG.D](test-dukazy/d1-znacky/seznam-Egd-z6.png),
  [logy](test-dukazy/d1-znacky/seznam-Egd-z6.log)). Duplicitní Title = datum nechávám: Title je
  povinný sloupec seznamu a appka ho plní; skrýt ho ve výchozím zobrazení by šlo, ale nezkoušel jsem ❓.
- **Z4 – plný `npm ci`** v E2E změřen není (pravidlo disku); naposledy ✅ v testu 22. 11.

Na egd01-dev zůstává tomas.prochazka ve skupině Členové a jeho hlas v `MojeAppkaEgd`. Nic jsem nemazal.

## Režimy single / open (24. 11. 2026) ✅

Zadání: single = appka jen autorovi, open = všem v tenantu („Všichni kromě externích uživatelů“).
Druhé účty: egd01, tomas.prochazka (lab profily bez hesla). Nic pod pavel.admin kromě přípravy egd01-test.
Sonda druhého účtu: [rezim-sonda.mjs](test-dukazy/rezim-sonda.mjs); cesta v prohlížeči: [rezim-ui.mjs](test-dukazy/rezim-ui.mjs)
(bez `REZIM_ZAPSAT=1` jen průzkum).

**A. Skript, egd10-test, autor egd10 (vlastník webu, bez admin rolí, CLI `~/.m365-e2e`)** — [test-dukazy/rezim/](test-dukazy/rezim/)

| Stav webu | egd01 uvidí | Důkaz |
|---|---|---|
| single (výchozí) | `AccessDenied.aspx`, REST položek 403 | [1-single-egd01](test-dukazy/rezim/1-single-egd01.log) |
| jen Čtení pro Všechny na webu | appka se vykreslí, hlas „Hlasovat nemůžete: na seznamu nemáte právo přidávat položky…“ | [4-web-read-egd01](test-dukazy/rezim/4-web-read-egd01.log) |
| jen Přispívání na seznamu, web bez Čtení | stránka AccessDenied, i když REST seznamu projde → Čtení webu je nutné | [7-jen-seznam-egd01](test-dukazy/rezim/7-jen-seznam-egd01.log) |
| open (web Čtení + seznam Přispívání + WriteSecurity 2) | „Zapsáno“, změna „Změněno“; cizí položka MERGE 403, recycle 403 | [5](test-dukazy/rezim/5-open-egd01.log), [6](test-dukazy/rezim/6-open-zmena-egd01.log) |

Cyklus příkazem `rezim`: open už je → nic ([10](test-dukazy/rezim/10-open-uz-je.log)); `single` plán → `--ano`
→ čtení zpět „rezim single“ ([11](test-dukazy/rezim/11-single-plan.log), [12](test-dukazy/rezim/12-single-ano.log));
egd01 znovu AccessDenied + 403 ([13](test-dukazy/rezim/13-single-egd01.log)); `open --ano` ([14](test-dukazy/rezim/14-open-ano.log));
egd01 hlasuje, cizí 403 ([15](test-dukazy/rezim/15-open-egd01.log)); tomas první hlas „Zapsáno: 5“ ([16](test-dukazy/rezim/16-open-tomas.log)).
`novy` bez `--rezim` skončí s výzvou ([17](test-dukazy/rezim/17-novy-bez-rezimu.log)); plán `nasadit` má krok 5 „rezim“
([18](test-dukazy/rezim/18-nasadit-plan.log)). Názvy rolí jsou lokalizované (Čtení, Přispívání), skript proto bere role přes
`getbytype` ([role-definice](test-dukazy/rezim/role-definice.log)).

**B. Prohlížeč bez CLI, egd01-test, autor egd01 (vlastník webu)** — [test-dukazy/rezim-ui/](test-dukazy/rezim-ui/)

- výchozí single: tomas AccessDenied ([1](test-dukazy/rezim-ui/1-single-tomas.log));
- Sdílet web → Všichni kromě externích → Číst, bez e-mailu ([2](test-dukazy/rezim-ui/2-web-open.log)); UI tím skupinu
  **přidá do Návštěvníků**, ne jako přímou roli;
- seznam: ukončit dědění, udělit Přispívání, upřesnit nastavení „jen vlastní“ ([3](test-dukazy/rezim-ui/3-seznam-open.log),
  [3b](test-dukazy/rezim-ui/3b-seznam-open.log)); tomas hlasuje, cizí položka 403 ([4](test-dukazy/rezim-ui/4-open-tomas.log));
- `rezim` skriptu stav z UI pozná (plán open = nic, plán single = kroky) ([5](test-dukazy/rezim-ui/5-cli-plan-open.log),
  [6](test-dukazy/rezim-ui/6-cli-plan-single.log));
- zpět single v UI: seznam ([7](test-dukazy/rezim-ui/7-seznam-single.log)), odebrání z Návštěvníků
  ([8](test-dukazy/rezim-ui/8-web-single.log), [8b](test-dukazy/rezim-ui/8b-navstevnici.log)); tomas AccessDenied, **REST položek ale 200
  s 0 položkami** ([9](test-dukazy/rezim-ui/9-single-tomas.log)) — na webu zůstal „Omezený přístup“ (RoleTypeKind 1). Data neuvidí;
  plán `rezim single` zbytek najde a odstraní ([10](test-dukazy/rezim-ui/10-cli-plan-single-po-ui.log)). Plán jsem nespustil
  s `--ano`, egd01-test nechávám v tomto stavu jako ukázku.

**Incident ❓:** při prvním běhu kroku „Udělit oprávnění“ na seznamu zůstalo zaškrtnuté „Poslat pozvánku e-mailem“
(skript ho ještě neodškrtával). Zda SharePoint skupině Všichni kromě externích uživatelů něco poslal, nevím (skupina
nemá schránku, poštu lab účtů jsem nekontroloval). Skript teď po „Zobrazit možnosti“ odškrtne a při zaškrtnutí skončí
bez sdílení. V SKILL.md je odškrtnutí výslovně.

**Zbylo v labu:** egd10-test v režimu open (hlasy egd10, egd01, tomas v `MojeAppka`); egd01-test single, hlasy egd01 a tomas (tomas 24. 11. změnil na 2; zbytek „Omezeného přístupu“ 24. 11. uklidil `rezim --rezim single --ano`
pod pavel.admin, tomas teď AccessDenied a REST 403; logy toho běhu nezachovány); egd01-dev beze změny (tomas v Členové ze Z5). Nic jsem nemazal.

## Další měření 22. 11.

- Chyba CLI: tři chyby, vždy `rc=1` (dřívější tvrzení „chyba s rc 0“ **vyvráceno**); web bez
  katalogu hlásí česky `…/sitecollectionappcatalog/ se nedá najít.` - skript na to dřív nereagoval,
  opraveno. [cli-chyba-rc0.txt](test-dukazy/cli-chyba-rc0.txt)
- Řazení `Created desc` nad 6000 položkami → 500, `ID desc` → 200 položek (`/sites/egd-sonda-miniskilly`,
  jen čtení).

## Neověřeno (důvod a jak ověřit)

| Co | Proč ne | Jak a kde ověřit |
|---|---|---|
| Windows, PowerShell 5.1, portable Node, `Expand-Archive`, dlouhé cesty v `node_modules` | v labu není Windows stroj (lab je macOS) | Windows VM nebo notebook EG.D: README instalace → `cesta`, `novy`, `build`, `nasadit` |
| tenant E.ON: role na AILab-Dev, katalog od IT, appId pro CLI, proxy / npm mirror | jen v tenantu E.ON | zkouška s EG.D na AILab-Dev |
| anglické popisky cesty A2 (české ✅ pod egd01) | lab je česky | anglický lab účet nebo EG.D |
| celostránková stránka („Aplikace na celou stránku“ v galerii šablon) v prohlížeči | nezkoušeno, běžná stránka stačí | Nové → Stránka → dlaždice appky pod egd01 |
| cesta **B** v prohlížeči (součty v zobrazení, Power Apps formulář) | v labu jen CLI části | Playwright pod lab profilem |
| `?env=WebView` u seznamu | na app stránce i běžné stránce ✅, seznam nezkoušen | otevřít seznam s `?env=WebView` pod lab profilem |
| čekací smyčka na propagaci web partu | ve všech bězích web part šel vložit hned | `nasadit` na čerstvém webu hned po `site appcatalog add` |
| role Čtenář u `spo app add` / nahrání `.sppkg` | CLI pod běžným účtem nejde (AADSTS65001); v appce už ověřeno (viz výše) | nahrání `.sppkg` v UI pod profilem z Návštěvníků |
| starý kód bez zvýšení verze | vždy jsme verzi zvyšovali | nasadit změnu bez zvýšení verze a zkontrolovat síťový dotaz / text |
| úpravy z upravy.md v plném cyklu, negativní test pojistek (cizí web), CLI 12 | nestihnuto | podle upravy.md; `nasadit --web <cizí web>`; `--cli <CLI 12>` |
| písmo E.ON Brix Sans | licencované, nemáme | jen u E.ON; teď fallback Segoe UI |
| čtečka obrazovky (NVDA / VoiceOver) | měřeno jen klávesnicí a stylem | VoiceOver na stránce `znacka-eon.aspx` |
| režim open, když E.ON skupinu Everyone except external users skryje nebo zakáže ⛔ | jen v tenantu E.ON | na webu účastníka `rezim --rezim open` nebo Sdílet web → „Všichni kromě“; při nenalezení náhrada konkrétní lidé / skupina |
| `nasadit --ano` s režimem na čerstvém webu (krok 5 ověřen jen v plánu, `rezim --ano` zvlášť ✅) | nestihnuto | nový web, `novy --rezim open`, `nasadit --ano`, sonda druhého účtu |
| cesta CLI pod egd01 | egd01 nemá CLI login (login dělá Pavel) | po přihlášení egd01 `rezim --web …/egd01-test --rezim single --ano` (uklidí i Omezený přístup) |
| VS Code (agent mode) načtení skillu | Copilot CLI otestován ✅ ([TEST-copilot.md](TEST-copilot.md); E2E účastníka v Copilotu pod egd09 ze ZIPu: `sondy/e2e/copilot/README.md`), VS Code ne | VS Code, Chat v režimu Agent, `/` |
