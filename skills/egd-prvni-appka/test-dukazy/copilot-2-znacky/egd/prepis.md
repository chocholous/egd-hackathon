# Copilot CLI Session

> [!NOTE]
> - **Session ID:** `a0d4150c-4e11-455d-bc74-bb4b2aa55f2e`  
> - **Started:** 11/24/2026, 11:17:31 AM  
> - **Duration:** 23s  
> - **Exported:** 11/24/2026, 11:17:55 AM  

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

<sub>Generated by [GitHub Copilot CLI](https://github.com/features/copilot/cli)</sub>
