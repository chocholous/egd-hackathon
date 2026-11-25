# Copilot CLI Session

> [!NOTE]
> - **Session ID:** `a0d4150c-4e11-455d-bc74-bb4b2aa55f2e`  
> - **Started:** 11/24/2026, 11:17:31 AM  
> - **Duration:** 168m 15s  
> - **Exported:** 11/24/2026, 2:05:47 PM  

---

<sub>2s</sub>

### Info

Copilot Fusion selected GPT-6 Luna because it was the best choice out of the models available in your plan.

---

<sub>2s</sub>

### User

Postav mi první appku na můj web https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd . Je to lab, ne E.ON: tenant pavelchocholousgmail.onmicrosoft.com. Kontrolu připravenosti (egd-pripravenost) jsem už udělal, výsledek je v téhle složce. Nemůžu odpovídat interaktivně: pokud se potřebuješ na cokoli zeptat, napiš otázku a skonči, odpovím ti v dalším kroku. Zápis na tento jeden web předem schvaluji: plán mi ukaž a pak rovnou pokračuj (ano). Na jiný web nic nezapisuj.

---

<sub>4s</sub>

### `skill`

**egd-prvni-appka**

<details>
<summary>Arguments</summary>

```json
{
  "skill": "egd-prvni-appka"
}
```

</details>

```
Skill "egd-prvni-appka" loaded successfully. Follow the instructions in the skill context.
```


---

<sub>13s</sub>

### Copilot

Plán: ověřím výsledek připravenosti a nástroje v této pracovní složce, připravím SPFx appku a před každým zápisem ukážu skriptem přesně cílený plán pro tento jediný web; vaše „ano“ beru jako schválení. Zatím nezačnu zapisovat do SharePointu, dokud nebudou ověřené cesta a povinná volba značky.

---

<sub>13s</sub>

### `view`

**view the file at /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop.**

`/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop`

```
.pripravenost
node_modules
```


---

<sub>13s</sub>

### `view`

**view the file at /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/README.md.**

`/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/README.md`

<details>
<summary>69 lines</summary>

````
# egd-prvni-appka

Skill pro AI agenta (Claude Code nebo GitHub Copilot), se kterým si na workshopu EG.D postavíte
první appku na SharePointu: **Spokojenost s prostředím kanceláře dnes** - každý jedním kliknutím
ohodnotí den 1–5 a pod tím vidí malý dashboard (dnešní počet hlasů, průměr, rozložení a 7 dní). Agent zvolí nejjednodušší cestu, která na vašem počítači a webu funguje:

- **A** - vlastní SharePoint Framework (SPFx) web part nasazený skriptem na váš web,
- **A2** - stejná appka, jen ji do SharePointu nahrajete ručně v prohlížeči,
- **B** - bez kódu: SharePoint seznam s formátováním, volitelně formulář z Power Apps.

Navazuje na skill **egd-pripravenost** (kontrola počítače). Ten pusťte jako první; tenhle skill
převezme jeho výsledek ze stejné pracovní složky.

## Co je ve složce

```
egd-prvni-appka\
  SKILL.md                    návod pro agenta
  scripts\appka.mjs           pomocný skript (Node, bez závislostí)
  templates\spokojenost\      hotový SPFx 1.24.1 projekt (zdroják appky + package-lock.json)
  references\                 podrobnosti: ruční nahrání, cesta bez kódu, úpravy, chyby
```

## Instalace na Windows (bez admin práv)

Rozbalte ZIP tak, aby `SKILL.md` ležel **přímo** ve složce `egd-prvni-appka`
(ne `egd-prvni-appka\egd-prvni-appka\SKILL.md`). V PowerShellu (upravte cestu k ZIPu):

**Claude Code** (osobní skill, platí pro všechny složky):

```powershell
Expand-Archive -Path "$env:USERPROFILE\Downloads\egd-prvni-appka.zip" -DestinationPath "$env:USERPROFILE\.claude\skills" -Force
Test-Path "$env:USERPROFILE\.claude\skills\egd-prvni-appka\SKILL.md"
```

**GitHub Copilot** (VS Code v režimu Agent, Copilot CLI) - osobní skill:

```powershell
Expand-Archive -Path "$env:USERPROFILE\Downloads\egd-prvni-appka.zip" -DestinationPath "$env:USERPROFILE\.copilot\skills" -Force
Test-Path "$env:USERPROFILE\.copilot\skills\egd-prvni-appka\SKILL.md"
```

nebo jen pro jednu složku (projekt): `<složka>\.github\skills\egd-prvni-appka\` 📘
([GitHub Docs: About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)).
Copilot čte i `.claude\skills` v projektu a osobní `~\.agents\skills` 📘.

`Test-Path` musí vypsat `True`. Stejně nainstalujte `egd-pripravenost`.

### Ověření, že ho agent vidí

| Nástroj | Jak |
|---|---|
| Claude Code | nová konverzace, napište `/egd-prvni-appka` (nebo „postav mi první appku“) |
| VS Code + Copilot | Chat v režimu **Agent**, napište `/` - skill musí být v nabídce 📘 |
| Copilot CLI | `/skills list`; po instalaci za běhu `/skills reload` 📘 |

## Spuštění

1. Otevřete pracovní složku z kontroly připravenosti (obvykle `%USERPROFILE%\egd-workshop`) -
   ve VS Code **Soubor → Otevřít složku**, v Claude Code ji vyberte jako složku projektu.
2. Napište agentovi: **„Postav mi první appku na můj web <adresa webu>.“**
3. Agent vám před každým zápisem do SharePointu ukáže plán a zeptá se. Zapisuje jen na váš web.
4. Na konci dostanete odkaz `.../SitePages/prvni-appka.aspx?env=WebView` - otevřete ho a klikněte
   na číslo 1–5; hlas se hned objeví v dashboardu.

## Co je potřeba

| | Cesta A | A2 | B |
|---|---|---|---|
| Node.js 22 (22.14+) nebo 24, ověřeno na 24.22.3 a 22.23.5 (portable zip stačí) | ano | ano | ne |
| npm k registry (případně certifikát proxy) | ano | ano | ne |
| CLI for Microsoft 365 přihlášené (appId od IT) | ano | ne | ne (pomůže) |
| web s vlastním katalogem aplikací | ano | ano | ne |
| role Člen nebo Vlastník na webu | ano | ano | Člen |

Co chybí, za vás agent zformuluje jako větu pro ServiceNow.

## Stav ověření

Viz [TEST.md](TEST.md). Ověřeno v testovacím tenantu na macOS (Node 22.23.5, build šablony i na 24.22.3, CLI for Microsoft 365
11.11). **Na Windows a v tenantu E.ON neověřeno** - lab je macOS a vlastní tenant. Instalace výše
(`Expand-Archive`, `Test-Path`, cesty `%USERPROFILE%`) je **na Windows nezkoušená**; ověřit na
Windows VM nebo notebooku EG.D. Seznam všeho neověřeného je v [TEST.md](TEST.md), sekce Neověřeno.

## Srovnání cest

| | A (SPFx + skript) | A2 (SPFx ručně) | B (bez kódu) |
|---|---|---|---|
| ověřeno v labu | ✅ celý řetězec (TEST.md) | ❓ klikací cesta | ✅ jen seznam přes CLI |
| výsledek | vlastní appka na celé okno, dashboard | stejná appka | seznam s přehledem po dnech |
| od IT E.ON | katalog na webu, role Člen, Node 22 (22.14+) nebo 24, npm, appId pro CLI | totéž bez appId | role Člen |
| obtížnost pro citizen developera | nízká (agent dělá vše) | střední (5 kliknutí v SharePointu) | nízká |
| proti | nejvíc předpokladů | ruční kroky, chyby v klikání | žádný vlastní dashboard |
````

</details>


---

<sub>13s</sub>

### `view`

**view the file at /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/TEST.md.**

`/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/TEST.md`

```
File too large to read at once (26.5 KB). Consider using the rg tool to search within the file, or view with view_range to read specific sections.
```


---

<sub>13s</sub>

### `bash`

**Read readiness result and recommend app path**

`$ node "/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/scripts/appka.mjs" cesta`

<details>
<summary>10 lines</summary>

```
[INFO]    vysledky: /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop/.pripravenost/vysledky.json
[INFO]    web z kontroly: https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd
          npm-ping: zelena (registry odpovida (PONG))
          node-pro-spfx-1.24: zelena (Node v22.23.5; SPFx 1.24 chce 22 / 24 / 26 (22 aspon 22.14). Gulp uz neni, build je Heft.)
          prihlaseni: zelena (prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e)
          web-cteni: zelena ("Účastník 09 – DEV" (https://pavelchocholousgmail.sharepoint.com/sites/egd09-dev))
          site-app-catalog: zelena (web ma vlastni katalog aplikaci "Aplikace pro SharePoint" (0 balicku))
          role-v-katalogu: zelena (muzes nahrat balicek (.sppkg) do katalogu)

DOPORUCENA CESTA: A: SPFx web part, nasazeni skriptem (prikazy novy -> build -> seznam -> nasadit)
<shellId: 0 completed with exit code 0>
```

</details>


---

<sub>23s</sub>

### Copilot

Kontrola připravenosti doporučuje cestu A: Node, npm, přihlášení i katalog webu jsou připravené a adresa ve výsledku odpovídá vašemu cílovému webu.

**Plán:** připravím SPFx appku, založím seznam `MojeAppka` a nasadím appku i stránku `prvni-appka.aspx` výhradně na `https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd`. Vaše „ano“ beru jako schválení těchto zápisů. Zatím jsem nic nezapisoval; potřebuji ještě povinnou volbu značky: má appka vypadat jako **EG.D** (indigo, oblé tvary), nebo **E.ON** (červená, hranaté tvary)?

---

<sub>165m 26s</sub>

### User

Chci vzhled EG.D. Pokračuj, ano platí. Pak mi napiš, co mám v prohlížeči otevřít.

---

<sub>165m 33s</sub>

### `view`

**view the file at /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop/.pripravenost.**

`/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop/.pripravenost`

```
vysledky.json
```


---

<sub>165m 35s</sub>

### `bash`

**Check app deployment script commands**

`$ node "/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/scripts/appka.mjs" --help`

<details>
<summary>21 lines</summary>

```
appka.mjs - prvni appka EG.D (Spokojenost s prostredim kancelare dnes, 1-5 + dashboard)

Spoustej v pracovni slozce z egd-pripravenost:  node "<cesta>/appka.mjs" <prikaz> [volby]

Prikazy:
  cesta                         precte .pripravenost/vysledky.json a doporuci cestu A / A2 / B
  novy   --znacka eon|egd [--slozka prvni-appka]
                                zalozi projekt ze sablony (nove GUIDy), zapise znacku do _znacka.scss
                                a nainstaluje balicky (npm ci). Znacku VZDY zjisti od uzivatele.
         [--bez-instalace]      jen zkopiruje sablonu (a zapise znacku)
  build  [--slozka prvni-appka] postavi .sppkg (npm run build), chyby i do build.log
  seznam --web <url> [--seznam MojeAppka] [--znacka eon|egd | --slozka prvni-appka] [--ano]
                                zalozi seznam MojeAppka a sloupce Hodnoceni, Den (bez --ano jen plan);
                                barvy Hodnoceni podle znacky (bez --znacka se cte z projektu)
  nasadit --web <url> [--slozka prvni-appka] [--stranka prvni-appka] [--nadpis "..."] [--seznam MojeAppka] [--ano]
                                nahraje do katalogu TOHOTO webu, deploy, install/upgrade, stranka
                                (Article -> sekce -> web part -> SingleWebPartAppPage), cteni zpet
  over   --web <url> [--slozka prvni-appka] [--stranka prvni-appka] [--seznam MojeAppka]
                                jen cteni: appka v katalogu, stranka s web partem, polozky seznamu

Spolecne volby: --cli <cesta k @pnp/cli-microsoft365/dist/index.js> (jinak ./node_modules nebo
PRVNI_APPKA_M365_CLI / PRIPRAVENOST_M365_CLI).
Kody: 0 hotovo, 1 chyba, 2 spatne pouziti, 10 plan bez zapisu (neni chyba).
<shellId: 1 completed with exit code 2>
```

</details>


---

<sub>165m 34s</sub>

### `view`

**view the file at /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/TEST.md.**

`/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/TEST.md (lines 1-100)`

<details>
<summary>79 lines</summary>

```
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
```

</details>


---

<sub>165m 39s</sub>

### `view`

**view the file at /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop/.pripravenost/vysledky.json.**

`/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop/.pripravenost/vysledky.json`

<details>
<summary>263 lines</summary>

```
{
  "vysledky": {
    "github-hosty": {
      "oblast": "GitHub",
      "stav": "zelena",
      "hodnota": "ppfas.ghe.com [GHE.com], ucet chocholous; github.com [github.com], ucet chocholous",
      "kdy": "2026-11-22T19:48:10.960Z"
    },
    "git-credential-helper": {
      "oblast": "GitHub",
      "stav": "info",
      "hodnota": "osxkeychain",
      "kdy": "2026-11-22T19:48:10.992Z"
    },
    "system": {
      "oblast": "Nastroje",
      "stav": "info",
      "hodnota": "Darwin 27.2.0 Darwin Kernel Version 27.2.0: Wed Oct 14 23:47:07 PDT 2026; root:xnu-13432.41.4~25/RELEASE_ARM64_T8132 (arm64)",
      "kdy": "2026-11-22T19:48:11.149Z"
    },
    "git": {
      "oblast": "Nastroje",
      "stav": "zelena",
      "hodnota": "git version 2.54.0 (Apple Git-157)",
      "kdy": "2026-11-22T19:48:11.177Z"
    },
    "node": {
      "oblast": "Nastroje",
      "stav": "zelena",
      "hodnota": "v22.23.5 (/opt/homebrew/Cellar/node@22/22.23.5_1/bin/node)",
      "kdy": "2026-11-22T19:48:11.177Z"
    },
    "npm": {
      "oblast": "Nastroje",
      "stav": "zelena",
      "hodnota": "10.9.9",
      "kdy": "2026-11-22T19:48:11.735Z"
    },
    "vscode": {
      "oblast": "Nastroje",
      "stav": "zelena",
      "hodnota": "VS Code 1.146.0",
      "kdy": "2026-11-22T19:48:14.797Z"
    },
    "vscode-copilot": {
      "oblast": "Nastroje",
      "stav": "zluta",
      "hodnota": "rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene)",
      "oprava": "otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> \"GitHub Copilot Chat\" (kdyz je Marketplace blokovany, IT)",
      "kdy": "2026-11-22T19:48:15.244Z"
    },
    "copilot-cli": {
      "oblast": "Nastroje",
      "stav": "zelena",
      "hodnota": "Copilot CLI GitHub Copilot CLI 1.0.114.",
      "kdy": "2026-11-22T19:48:15.669Z"
    },
    "gh": {
      "oblast": "Nastroje",
      "stav": "info",
      "hodnota": "gh version 2.104.0 (2026-11-12)",
      "kdy": "2026-11-22T19:48:15.729Z"
    },
    "claude-code": {
      "oblast": "Nastroje",
      "stav": "zelena",
      "hodnota": "Claude Code 2.1.330 (Claude Code)",
      "kdy": "2026-11-22T19:48:15.962Z"
    },
    "claude-desktop": {
      "oblast": "Nastroje",
      "stav": "zelena",
      "hodnota": "nalezeno: /Applications/Claude.app",
      "kdy": "2026-11-22T19:48:15.963Z"
    },
    "spusteno-z": {
      "oblast": "Nastroje",
      "stav": "info",
      "hodnota": "Claude Code",
      "kdy": "2026-11-22T19:48:15.963Z"
    },
    "npm-registry": {
      "oblast": "Sit a npm",
      "stav": "info",
      "hodnota": "https://registry.npmjs.org/",
      "kdy": "2026-11-22T19:48:16.469Z"
    },
    "npm-proxy": {
      "oblast": "Sit a npm",
      "stav": "info",
      "hodnota": "proxy=null https-proxy=null strict-ssl=true cafile=null HTTPS_PROXY=ne NODE_EXTRA_CA_CERTS=ne",
      "kdy": "2026-11-22T19:48:17.604Z"
    },
    "npm-ping": {
      "oblast": "Sit a npm",
      "stav": "zelena",
      "hodnota": "registry odpovida (PONG)",
      "kdy": "2026-11-22T19:48:18.611Z"
    },
    "npm-stazeni-metadat": {
      "oblast": "Sit a npm",
      "stav": "zelena",
      "hodnota": "@pnp/cli-microsoft365 12.0.0 je dostupny",
      "kdy": "2026-11-22T19:48:20.718Z"
    },
    "entra-dosazitelne": {
      "oblast": "Sit a npm",
      "stav": "zelena",
      "hodnota": "login.microsoftonline.com odpovida, tenant egd.cz = b914a242-e718-443b-a47c-6b4c649d8c0a",
      "kdy": "2026-11-22T19:48:21.167Z"
    },
    "sharepoint-dosazitelny": {
      "oblast": "Sit a npm",
      "stav": "zelena",
      "hodnota": "eonos.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne)",
      "kdy": "2026-11-22T19:48:21.325Z"
    },
    "varianta-node": {
      "oblast": "Varianty (zebrik)",
      "stav": "zelena",
      "hodnota": "funguje: 1 uz je (Node 22.14+/24/26 v PATH), 3 portable archiv z nodejs.org (bez admina); nezmereno: 2 winget (jen Windows; na macOS brew nebo portable). Pouzij prvni funkcni: 1 uz je (Node 22.14+/24/26 v PATH)",
      "kdy": "2026-11-22T19:48:21.647Z"
    },
    "varianta-cli": {
      "oblast": "Varianty (zebrik)",
      "stav": "zelena",
      "hodnota": "funguje: 1 npm lokalne v pracovni slozce (cli-instalace), 3 globalni m365 uz v PATH, 4 bez CLI: prohlizec (prikaz prohlizec); nezmereno: 2 npx (bez instalace, stahuje pri kazdem behu) (nezkouseno, jen zaloha; pozor na cizi balicek m365 na npm). Pouzij prvni funkcni: 1 npm lokalne v pracovni slozce (cli-instalace)",
      "kdy": "2026-11-22T19:48:22.589Z"
    },
    "varianta-prihlaseni": {
      "oblast": "Varianty (zebrik)",
      "stav": "zelena",
      "hodnota": "funguje: 1 device code (--authType deviceCode), 2 prohlizec (--authType browser, redirect na localhost); nezmereno: 3 appId od IT / souhlas spravce (zatim se nikdo neprihlasil). Pouzij prvni funkcni: 1 device code (--authType deviceCode)",
      "kdy": "2026-11-22T19:48:22.833Z"
    },
    "varianta-pouzita": {
      "oblast": "Varianty (zebrik)",
      "stav": "info",
      "hodnota": "uz prihlaseny pres CLI: ne; spusteno z: Claude Code. Co z toho skutecne pouzijes, dopis: zapis --klic varianta-pouzita-<oblast> --stav info --hodnota \"<cislo varianty>\"",
      "kdy": "2026-11-22T19:48:22.834Z"
    },
    "cli-instalace": {
      "oblast": "Pripojeni k SharePointu",
      "stav": "zelena",
      "hodnota": "CLI for Microsoft 365 v12.0.0 lokalne v node_modules",
      "kdy": "2026-11-22T19:48:42.558Z"
    },
    "cli-setup": {
      "oblast": "Pripojeni k SharePointu",
      "stav": "zelena",
      "hodnota": "CLI nastaveno pro skripty (bez interaktivnich dotazu)",
      "kdy": "2026-11-22T19:48:43.344Z"
    },
    "prihlaseni": {
      "oblast": "Pripojeni k SharePointu",
      "stav": "zelena",
      "hodnota": "prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e",
      "kdy": "2026-11-22T19:48:52.143Z"
    },
    "web-cteni": {
      "oblast": "Ovladani SharePointu",
      "stav": "zelena",
      "hodnota": "\"Účastník 09 – DEV\" (https://pavelchocholousgmail.sharepoint.com/sites/egd09-dev)",
      "kdy": "2026-11-22T19:48:45.920Z"
    },
    "role-na-webu": {
      "oblast": "Ovladani SharePointu",
      "stav": "zelena",
      "hodnota": "Vlastnik (Full Control) (odhad z EffectiveBasePermissions High 2147483647 / Low 4294705151; zapis polozek ano, sprava seznamu ano)",
      "kdy": "2026-11-22T19:48:46.926Z"
    },
    "seznamy": {
      "oblast": "Ovladani SharePointu",
      "stav": "zelena",
      "hodnota": "6 viditelnych seznamu/knihoven: Aplikace pro SharePoint (0), Dokumenty (0), Knihovna stylů (0), Stránky webu (1), Šablony formulářů (0), Události (0)",
      "kdy": "2026-11-22T19:48:47.946Z"
    },
    "tenant-app-catalog": {
      "oblast": "Ovladani SharePointu",
      "stav": "info",
      "hodnota": "https://pavelchocholousgmail.sharepoint.com/sites/apps (pro workshop ho nepotrebujeme; zapisujeme jen do katalogu na vlastnim webu)",
      "kdy": "2026-11-22T19:48:48.975Z"
    },
    "site-app-catalog": {
      "oblast": "Ovladani SharePointu",
      "stav": "zelena",
      "hodnota": "web ma vlastni katalog aplikaci \"Aplikace pro SharePoint\" (0 balicku)",
      "kdy": "2026-11-22T19:48:49.953Z"
    },
    "role-v-katalogu": {
      "oblast": "Ovladani SharePointu",
      "stav": "zelena",
      "hodnota": "muzes nahrat balicek (.sppkg) do katalogu",
      "kdy": "2026-11-22T19:48:49.953Z"
    },
    "licence-m365": {
      "oblast": "Zalozni cesty",
      "stav": "info",
      "hodnota": "licence: FLOW_FREE, SPE_E5",
      "kdy": "2026-11-22T19:48:51.014Z"
    },
    "power-platform-licence": {
      "oblast": "Zalozni cesty",
      "stav": "zelena",
      "hodnota": "Power Apps / Power Automate v licenci: FLOW_P2_VIRAL, FLOW_O365_P3, POWERAPPS_O365_P3",
      "kdy": "2026-11-22T19:48:51.014Z"
    },
    "zalozeni-seznamu": {
      "oblast": "Ovladani SharePointu",
      "stav": "zelena",
      "hodnota": "seznam \"EGD-pripravenost\" zalozen",
      "kdy": "2026-11-22T19:48:55.312Z"
    },
    "zapis-polozky": {
      "oblast": "Ovladani SharePointu",
      "stav": "zelena",
      "hodnota": "polozka 1 zapsana",
      "kdy": "2026-11-22T19:48:56.579Z"
    },
    "cteni-zpet": {
      "oblast": "Ovladani SharePointu",
      "stav": "zelena",
      "hodnota": "precteno zpatky: \"Zkouska Finale 22. 11. 2026 20:48:51\"",
      "kdy": "2026-11-22T19:48:57.417Z"
    },
    "node-pro-spfx-1.24": {
      "oblast": "SPFx pripravenost",
      "stav": "zelena",
      "hodnota": "Node v22.23.5; SPFx 1.24 chce 22 / 24 / 26 (22 aspon 22.14). Gulp uz neni, build je Heft.",
      "kdy": "2026-11-22T19:48:57.533Z"
    },
    "generator-dostupny": {
      "oblast": "SPFx pripravenost",
      "stav": "zelena",
      "hodnota": "@microsoft/generator-sharepoint@1.24.1 je v registry",
      "kdy": "2026-11-22T19:48:58.904Z"
    }
  },
  "githubHosty": [
    "ppfas.ghe.com",
    "github.com"
  ],
  "tenantId": "b914a242-e718-443b-a47c-6b4c649d8c0a",
  "prihlasen": {
    "ucet": "pavel.admin@pavelchocholousgmail.onmicrosoft.com",
    "appId": "12f19539-b70a-499d-b6dc-517a32c0e904",
    "tenant": "972a674c-7b85-4e56-a31f-b2f95b42fd1e"
  },
  "web": "https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd",
  "rolaWeb": "Vlastnik (Full Control)",
  "licence": {
    "skus": [
      "FLOW_FREE",
      "SPE_E5"
    ],
    "powerPlatform": [
      "FLOW_P2_VIRAL",
      "FLOW_O365_P3",
      "POWERAPPS_O365_P3"
    ]
  },
  "odkazSeznam": "https://pavelchocholousgmail.sharepoint.com/sites/egd09-dev/Lists/EGD-pripravenost"
}
```

</details>


---

<sub>165m 39s</sub>

### `bash`

**Confirm Node version and readiness recommendation**

`$ node --version && node "/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/scripts/appka.mjs" cesta`

<details>
<summary>11 lines</summary>

```
v22.23.5
[INFO]    vysledky: /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop/.pripravenost/vysledky.json
[INFO]    web z kontroly: https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd
          npm-ping: zelena (registry odpovida (PONG))
          node-pro-spfx-1.24: zelena (Node v22.23.5; SPFx 1.24 chce 22 / 24 / 26 (22 aspon 22.14). Gulp uz neni, build je Heft.)
          prihlaseni: zelena (prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e)
          web-cteni: zelena ("Účastník 09 – DEV" (https://pavelchocholousgmail.sharepoint.com/sites/egd09-dev))
          site-app-catalog: zelena (web ma vlastni katalog aplikaci "Aplikace pro SharePoint" (0 balicku))
          role-v-katalogu: zelena (muzes nahrat balicek (.sppkg) do katalogu)

DOPORUCENA CESTA: A: SPFx web part, nasazeni skriptem (prikazy novy -> build -> seznam -> nasadit)
<shellId: 2 completed with exit code 0>
```

</details>


---

<sub>165m 44s</sub>

### `rg`

**znacka|PRIPRAVENOST\_M365\_CLI|appCatalogScope|--ano**

`"znacka|PRIPRAVENOST_M365_CLI|appCatalogScope|--ano" (~/.copilot/skills/egd-prvni-appka/scripts/appka.mjs)`

<details>
<summary>117 matches</summary>

```
[grep content: 115 matches across 1 file(s) under /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/scripts; delimited groups]

appka.mjs (115 match(es)):
  5- // Bez zavislosti, Node 22.14+ (SPFx 1.24), Windows / macOS / Linux. Vsechny programy spousti pres `node`
  6- // s polem argumentu (bez shellu), takze nevadi PowerShell execution policy ani uvozovky.
  7: // Kazdy zapis do SharePointu nejdriv vypise plan (kod 10) a provede se az s volbou --ano.
  8- 
  9- import { spawnSync } from 'node:child_process';
  29- const DEFAULT_FOLDER = 'prvni-appka';
  30- const ZNACKY = ['eon', 'egd'];                                 // vzhled appky; agent se VZDY zepta uzivatele
  31: const ZNACKA_SOUBOR = '_znacka.scss';                          // jediny prepinac vzhledu v projektu
  32- const SPFX_NODE_MAJORS = [22, 24, 26];                         // SPFx 1.24.x (engines sablony)
  33- const SPFX_NODE_22_MIN = [22, 14, 0];
  84- 
  85- function m365Path(opts) {
  86:   const c = [opts.cli, process.env.PRVNI_APPKA_M365_CLI, process.env.PRIPRAVENOST_M365_CLI,
  87-     path.join(process.cwd(), 'node_modules', '@pnp', 'cli-microsoft365', 'dist', 'index.js'),
  88-     path.join(process.cwd(), '..', 'node_modules', '@pnp', 'cli-microsoft365', 'dist', 'index.js')].filter(Boolean);
  169- }
  170- 
  171: function znackaZVolby(o) {
  172:   const z = String(o.znacka || '').toLowerCase();
  173-   return ZNACKY.includes(z) ? z : null;
  174- }
  175: function znackaProjektu(slozka) {
  176-   const p = path.join(slozka, WP_DIR, ZNACKA_SOUBOR);
  177-   if (!fs.existsSync(p)) return null;
  178:   const m = fs.readFileSync(p, 'utf8').match(/^\$znacka:\s*([a-z]+)\s*;/m);
  179-   return m && ZNACKY.includes(m[1]) ? m[1] : null;
  180- }
  182-   const p = path.join(slozka, WP_DIR, ZNACKA_SOUBOR);
  183-   const t = fs.readFileSync(p, 'utf8');
  184:   const n = t.replace(/^\$znacka:\s*[a-z]+\s*;/m, `$znacka: ${z};`);
  185:   if (n === t && !t.includes(`$znacka: ${z};`)) { fail(`v ${p} chybi radek $znacka`, 'zkopiruj soubor znovu ze sablony'); process.exit(1); }
  186-   fs.writeFileSync(p, n, 'utf8');
  187- }
  189- function cmdNovy(o) {
  190-   const slozka = path.resolve(o.slozka || DEFAULT_FOLDER);
  191:   const znacka = znackaZVolby(o);
  192:   if (!znacka) {
  193:     fail(o.znacka ? `neznama znacka "${o.znacka}"` : 'chybi --znacka',
  194:       'zeptej se uzivatele, jaky vzhled chce: E.ON (cervena jen na hlavni akci, hranate rohy) nebo EG.D (indigo, oble tvary); pak spust znovu s --znacka eon nebo --znacka egd');
  195-     process.exit(2);
  196-   }
  203-   }
  204-   const existoval = fs.existsSync(path.join(slozka, 'package.json'));
  205:   const predtim = existoval ? znackaProjektu(slozka) : null;
  206-   if (existoval) {
  207-     info(`projekt uz existuje: ${slozka} - nekopiruji znovu.`);
  216-     ok(`projekt zalozen: ${slozka} (reseni ${jmeno}, web part ${ids.component})`);
  217-   }
  218:   zapisZnacku(slozka, znacka);
  219:   ok(`znacka ${znacka === 'eon' ? 'E.ON' : 'EG.D'} zapsana do ${path.join(WP_DIR, ZNACKA_SOUBOR)}${predtim && predtim !== znacka ? ` (predtim ${predtim}; po zmene znovu build)` : ''}`);
  220-   if (o['bez-instalace']) { info('instalaci balicku jsi vynechal (--bez-instalace).'); return; }
  221-   out('Instaluji balicky SharePoint Frameworku (npm ci, lokalne, bez admina; stovky MB, par minut)...');
  289-   const web = needWeb(o);
  290-   const title = o.seznam || DEFAULT_LIST;
  291:   const znacka = znackaZVolby(o) || znackaProjektu(path.resolve(o.slozka || DEFAULT_FOLDER));
  292:   if (!znacka) { fail('nevim znacku pro barvy sloupce Hodnoceni', 'pridej --znacka eon|egd nebo --slozka <projekt> (precte se z _znacka.scss)'); process.exit(2); }
  293:   const format = znacka === 'eon' ? HODNOCENI_FORMAT_EON : HODNOCENI_FORMAT_EGD;
  294-   const existing = m365(o, ['spo', 'list', 'get', '--webUrl', web, '--title', title]);
  295-   const fields = existing.ok ? m365(o, ['spo', 'field', 'list', '--webUrl', web, '--listTitle', title]) : { ok: true, json: [] };
  299-   out(existing.ok ? `  - seznam "${title}" uz existuje` : `  - zalozit seznam "${title}" (bezny seznam, v navigaci webu)`);
  300-   for (const f of missing) out(`  - pridat sloupec ${f.name}`);
  301:   out(`  - sloupec Hodnoceni naformatovat jako barevny stitek (${znacka === 'eon' ? 'E.ON: cervena skala + cislo' : 'EG.D: semafor + cislo'})`);
  302:   if (!o.ano) { out('\nNic jsem nezapsal. Ukaz plan uzivateli a po jeho "ano" spust znovu s --ano.'); process.exit(10); }
  303-   if (!existing.ok) {
  304-     if (!/not exist|neexistuje|404/i.test(existing.err)) { fail(`nejde precist web: ${firstLine(existing.err)}`, 'over prihlaseni (m365 status) a adresu webu'); process.exit(1); }
  336-   if (!st.ok || !st.json?.connectedAs) { fail('CLI for Microsoft 365 neni prihlasene', 'prihlaseni dela clovek ve svem terminalu (skill egd-pripravenost, krok 5)'); process.exit(1); }
  337-   info(`prihlasen: ${st.json.connectedAs}`);
  338:   const kat = m365(o, ['spo', 'app', 'list', '--appCatalogScope', 'sitecollection', '--appCatalogUrl', web]);
  339-   if (!kat.ok) {
  340-     if (/sitecollectionappcatalog|neexistuje|nedá najít|does not exist|not exist|cannot be found|no app catalog/i.test(kat.err)) fail('web nema vlastni katalog aplikaci', 'bez nej SPFx nenasadis; mezitim cesta B (bez kodu)', `Prosim o zalozeni katalogu aplikaci pro kolekci webu (site collection app catalog) na webu ${web} a o roli Clen (Member) nebo Vlastnik na tomto webu.`);
  353-   out('  3. nainstalovat appku na web, nebo aktualizovat, kdyz uz tam je');
  354-   out(pageExists ? `  4. stranka ${page} uz existuje - jen overim, ze na ni web part je` : `  4. zalozit stranku ${page} ("${title}"), vlozit web part, prepnout na celostrankovou appku a publikovat`);
  355:   if (!o.ano) { out('\nNic jsem nezapsal. Ukaz plan uzivateli a po jeho "ano" spust znovu s --ano.'); process.exit(10); }
  356- 
  357:   const add = m365(o, ['spo', 'app', 'add', '--filePath', p.sppkg, '--appCatalogScope', 'sitecollection', '--appCatalogUrl', web, '--overwrite']);
  358-   if (!add.ok) {
  359-     const denied = /denied|odepřen|403|unauthorized/i.test(add.err);
  363-   const appId = add.json?.UniqueId || add.json?.uniqueId;
  364-   ok(`nahrano do katalogu (appId ${appId})`);
  365:   const dep = m365(o, ['spo', 'app', 'deploy', '--id', appId, '--appCatalogScope', 'sitecollection', '--appCatalogUrl', web]);
  366-   if (!dep.ok) { fail(`deploy: ${firstLine(dep.err)}`); process.exit(1); }
  367-   ok('nasazeno (deploy)');
  370-   const installed = Array.isArray(inst.json) && inst.json.some((x) => (x.ProductId || '').toLowerCase() === p.solutionId.toLowerCase());
  371-   const step = installed ? 'upgrade' : 'install';
  372:   const ins = m365(o, ['spo', 'app', step, '--id', appId, '--siteUrl', web, '--appCatalogScope', 'sitecollection']);
  373-   if (!ins.ok && !/already|již|uz je/i.test(ins.err)) { fail(`${step}: ${firstLine(ins.err)}`); process.exit(1); }
  374-   ok(installed ? 'appka na webu aktualizovana (upgrade)' : 'appka nainstalovana na web');
  397-       } else { fail(`web part: ${firstLine(w.err)}`); process.exit(1); }
  398-     }
  399:     if (!added) { fail('web part se ani po cekani neobjevil', 'pockej par minut a spust nasadit --ano znovu (nahrani se jen zopakuje)'); process.exit(1); }
  400-     ok('web part vlozen na stranku');
  401-     const set = m365(o, ['spo', 'page', 'set', '--webUrl', web, '--name', page, '--layoutType', 'SingleWebPartAppPage', '--publish']);
  420-   const p = fs.existsSync(path.join(slozka, 'config', 'package-solution.json')) ? projectInfo(slozka) : null;
  421-   let vse = true;
  422:   const kat = m365(o, ['spo', 'app', 'list', '--appCatalogScope', 'sitecollection', '--appCatalogUrl', web]);
  423-   const app = p && Array.isArray(kat.json) ? kat.json.find((a) => (a.ProductId || '').toLowerCase() === p.solutionId.toLowerCase()) : null;
  424-   if (app) ok(`katalog webu: ${app.Title} verze ${app.AppCatalogVersion || '?'}, nasazeno ${app.Deployed}`); else { vse = false; fail(`v katalogu webu appka neni${kat.ok ? '' : ': ' + firstLine(kat.err)}`); }
  440- Prikazy:
  441-   cesta                         precte .pripravenost/vysledky.json a doporuci cestu A / A2 / B
  442:   novy   --znacka eon|egd [--slozka prvni-appka]
  443:                                 zalozi projekt ze sablony (nove GUIDy), zapise znacku do _znacka.scss
  444-                                 a nainstaluje balicky (npm ci). Znacku VZDY zjisti od uzivatele.
  445-          [--bez-instalace]      jen zkopiruje sablonu (a zapise znacku)
  446-   build  [--slozka prvni-appka] postavi .sppkg (npm run build), chyby i do build.log
  447:   seznam --web <url> [--seznam MojeAppka] [--znacka eon|egd | --slozka prvni-appka] [--ano]
  448:                                 zalozi seznam MojeAppka a sloupce Hodnoceni, Den (bez --ano jen plan);
  449:                                 barvy Hodnoceni podle znacky (bez --znacka se cte z projektu)
  450:   nasadit --web <url> [--slozka prvni-appka] [--stranka prvni-appka] [--nadpis "..."] [--seznam MojeAppka] [--ano]
  451-                                 nahraje do katalogu TOHOTO webu, deploy, install/upgrade, stranka
  452-                                 (Article -> sekce -> web part -> SingleWebPartAppPage), cteni zpet
  455- 
  456- Spolecne volby: --cli <cesta k @pnp/cli-microsoft365/dist/index.js> (jinak ./node_modules nebo
  457: PRVNI_APPKA_M365_CLI / PRIPRAVENOST_M365_CLI).
  458- Kody: 0 hotovo, 1 chyba, 2 spatne pouziti, 10 plan bez zapisu (neni chyba).`);
  459- }
```

</details>


---

<sub>165m 44s</sub>

### `view`

**view the file at /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop/node\_modules.**

`/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop/node_modules`

```
@pnp
```


---

<sub>165m 47s</sub>

### `apply_patch`

<details>
<summary>Arguments</summary>

```json
"*** Begin Patch\n*** Update File: /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop/.pripravenost/vysledky.json\n@@\n   },\n   \"web\": \"https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd\",\n+  \"znackaAppky\": \"EG.D\",\n   \"rolaWeb\": \"Vlastnik (Full Control)\",\n*** End Patch\n"
```

</details>

```
Modified 1 file(s): /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop/.pripravenost/vysledky.json
```


---

<sub>166m 30s</sub>

### `bash`

**Create EG.D app and install project dependencies**

`$ node "/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/scripts/appka.mjs" novy --slozka prvni-appka --znacka egd`

```
[OK]      projekt zalozen: /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop/prvni-appka (reseni prvni-appka, web part ac5fbfc4-e08b-48bd-b512-dd0aee6ad780)
[OK]      znacka EG.D zapsana do src/webparts/spokojenost/_znacka.scss
Instaluji balicky SharePoint Frameworku (npm ci, lokalne, bez admina; stovky MB, par minut)...
[OK]      balicky nainstalovane. Dalsi krok: build
<shellId: 3 completed with exit code 0>
```


---

<sub>166m 39s</sub>

### `bash`

**Build SharePoint app package**

`$ node "/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/scripts/appka.mjs" build --slozka prvni-appka`

```
Stavim balicek (npm run build, Heft; minuta az dve)...
[OK]      balicek: /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/egd-workshop/prvni-appka/sharepoint/solution/prvni-appka.sppkg (12166 B, verze 1.0.0.0)
<shellId: 4 completed with exit code 0>
```


---

<sub>166m 45s</sub>

### Copilot

Hotová je EG.D verze a sestavený balíček. Teď si skript načítá cílový web a ukáže konkrétní plány seznamu a nasazení; vaše předchozí „ano“ schvaluje pokračování přesně na tomto webu.

---

<sub>166m 47s</sub>

### `bash`

**Preview creation plan for target SharePoint list**

`$ node "/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/scripts/appka.mjs" seznam --web https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd --slozka prvni-appka`

<details>
<summary>7 lines</summary>

```
PLAN na webu https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd:
  - zalozit seznam "MojeAppka" (bezny seznam, v navigaci webu)
  - pridat sloupec Hodnoceni
  - pridat sloupec Den
  - sloupec Hodnoceni naformatovat jako barevny stitek (EG.D: semafor + cislo)

Nic jsem nezapsal. Ukaz plan uzivateli a po jeho "ano" spust znovu s --ano.
<shellId: 5 completed with exit code 10>
```

</details>


---

<sub>166m 52s</sub>

### `bash`

**Preview app deployment plan for target SharePoint site**

`$ node "/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/scripts/appka.mjs" nasadit --web https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd --slozka prvni-appka --nadpis "Spokojenost s prostředím kanceláře dnes"`

<details>
<summary>9 lines</summary>

```
[INFO]    prihlasen: pavel.admin@pavelchocholousgmail.onmicrosoft.com
[POZOR]   seznam "MojeAppka" na webu neni - appka ho bude hlasit; zaloz ho prikazem seznam

PLAN (vse jen na webu https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd, katalog tohoto webu, nic tenant-wide):
  1. nahrat prvni-appka.sppkg (verze 1.0.0.0) do katalogu aplikaci webu (prepsat starsi)
  2. nasadit (deploy) v katalogu webu
  3. nainstalovat appku na web, nebo aktualizovat, kdyz uz tam je
  4. zalozit stranku prvni-appka.aspx ("Spokojenost s prostředím kanceláře dnes"), vlozit web part, prepnout na celostrankovou appku a publikovat

Nic jsem nezapsal. Ukaz plan uzivateli a po jeho "ano" spust znovu s --ano.
<shellId: 6 completed with exit code 10>
```

</details>


---

<sub>167m 7s</sub>

### `bash`

**Create MojeAppka list on approved SharePoint site**

`$ node "/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/scripts/appka.mjs" seznam --web https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd --slozka prvni-appka --ano`

<details>
<summary>12 lines</summary>

```
PLAN na webu https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd:
  - zalozit seznam "MojeAppka" (bezny seznam, v navigaci webu)
  - pridat sloupec Hodnoceni
  - pridat sloupec Den
  - sloupec Hodnoceni naformatovat jako barevny stitek (EG.D: semafor + cislo)
[OK]      seznam "MojeAppka" zalozen
[OK]      sloupec Hodnoceni
[OK]      sloupec Den
[OK]      sloupec Hodnoceni naformatovan
[OK]      precteno zpet: seznam "MojeAppka" ma sloupce Hodnoceni, Den

Seznam v prohlizeci: https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd/Lists/MojeAppka
<shellId: 7 completed with exit code 0>
```

</details>


---

<sub>167m 58s</sub>

### `bash`

**Deploy app and publish its page on approved SharePoint site**

`$ node "/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/scripts/appka.mjs" nasadit --web https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd --slozka prvni-appka --nadpis "Spokojenost s prostředím kanceláře dnes" --ano`

<details>
<summary>19 lines</summary>

```
[INFO]    prihlasen: pavel.admin@pavelchocholousgmail.onmicrosoft.com

PLAN (vse jen na webu https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd, katalog tohoto webu, nic tenant-wide):
  1. nahrat prvni-appka.sppkg (verze 1.0.0.0) do katalogu aplikaci webu (prepsat starsi)
  2. nasadit (deploy) v katalogu webu
  3. nainstalovat appku na web, nebo aktualizovat, kdyz uz tam je
  4. zalozit stranku prvni-appka.aspx ("Spokojenost s prostředím kanceláře dnes"), vlozit web part, prepnout na celostrankovou appku a publikovat
[OK]      nahrano do katalogu (appId 84dc817d-3fda-4cec-a0e9-d32aadc0823c)
[OK]      nasazeno (deploy)
[OK]      appka nainstalovana na web
[OK]      stranka prvni-appka.aspx zalozena (Article + sekce)
[OK]      web part vlozen na stranku
[OK]      stranka prepnuta na celostrankovou appku a publikovana
[OK]      precteno zpet: stranka prvni-appka.aspx, rozlozeni SingleWebPartAppPage, web part ac5fbfc4-e08b-48bd-b512-dd0aee6ad780 na ni je

Otevri v prohlizeci (bez ramu SharePointu):
  https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd/SitePages/prvni-appka.aspx?env=WebView
S ramem SharePointu (na upravy):
  https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd/SitePages/prvni-appka.aspx
Hotovo je az to, co uzivatel uvidi v prohlizeci: appka se nacte, po kliknuti na cislo se hlas propise do dashboardu.
<shellId: 8 completed with exit code 0>
```

</details>


---

<sub>168m 6s</sub>

### `bash`

**Verify deployed app, page, and current list contents**

`$ node "/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/scripts/appka.mjs" over --web https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd --slozka prvni-appka`

<details>
<summary>6 lines</summary>

```
[OK]      katalog webu: prvni-appka-client-side-solution verze 1.0.0.0, nasazeno true
[OK]      stranka prvni-appka.aspx: rozlozeni SingleWebPartAppPage, web part na ni je
[OK]      seznam MojeAppka: 0 hlasu

Na SharePointu je vse na miste. Ze se appka vykresli a funguje, ukaze jen prohlizec:
  https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd/SitePages/prvni-appka.aspx?env=WebView
<shellId: 9 completed with exit code 0>
```

</details>


---

<sub>168m 10s</sub>

### `view`

**view the file at /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/references/upravy.md.**

`/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-egd/home/.copilot/skills/egd-prvni-appka/references/upravy.md`

<details>
<summary>43 lines</summary>

```
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
```

</details>


---

<sub>168m 15s</sub>

### Copilot

Hotovo: appka EG.D je nasazená jen na webu, který jsi určil, a ověřil jsem stránku, seznam i web part. Otevři v prohlížeči [appku](https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-egd/SitePages/prvni-appka.aspx?env=WebView), vyber číslo 1–5 a zkontroluj, že se hlas a dashboard aktualizují. Hlas není anonymní — seznam ukazuje autora; každý může svůj hlas za den změnit. Příště můžeme upravit například otázku nebo popisky hodnocení.

---

<sub>Generated by [GitHub Copilot CLI](https://github.com/features/copilot/cli)</sub>
