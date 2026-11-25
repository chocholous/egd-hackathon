# Copilot CLI Session

> [!NOTE]
> - **Session ID:** `58111c4d-6640-4c42-8482-aa485334cc04`  
> - **Started:** 11/24/2026, 11:19:15 AM  
> - **Duration:** 31s  
> - **Exported:** 11/24/2026, 11:19:46 AM  

---

<sub>2s</sub>

### Info

Copilot Fusion selected GPT-6 Luna because it was the best choice out of the models available in your plan.

---

<sub>2s</sub>

### User

Postav mi první appku na můj web https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-eon . Je to testovací lab tenant pavelchocholousgmail.onmicrosoft.com. Kontrolu připravenosti (egd-pripravenost) jsem už udělal, výsledek je v téhle složce. Nemůžu odpovídat interaktivně: pokud se potřebuješ na cokoli zeptat, napiš otázku a skonči, odpovím ti v dalším kroku. Zápis na tento jeden web předem schvaluji: plán mi ukaž a pak rovnou pokračuj (ano). Na jiný web nic nezapisuj.

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

<sub>10s</sub>

### Copilot

Plán: nejdřív načtu výsledek připravenosti a potvrdím cestu pro tento konkrétní web, pak připravím a sestavím aplikaci, před každým zápisem zkontroluji plán omezený na tento web a pokračuji na základě tvého předchozího „ano“. Nakonec ověřím nasazení pouze pro tento web; přihlášení ani bezpečnostní potvrzení za tebe provádět nebudu.

---

<sub>11s</sub>

### `glob`

**.pripravenost/\*\*/\***

`".pripravenost/**/*"`

```
./.pripravenost/vysledky.json
```


---

<sub>11s</sub>

### `glob`

**\*\*/pripravenost-\*.md**

`"**/pripravenost-*.md"`

```
No files matched the pattern.
```


---

<sub>10s</sub>

### `view`

**view the file at /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-eon/home/.copilot/skills/egd-prvni-appka/README.md.**

`/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-eon/home/.copilot/skills/egd-prvni-appka/README.md`

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

<sub>10s</sub>

### `view`

**view the file at /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-eon/home/.copilot/skills/egd-prvni-appka/TEST.md.**

`/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-eon/home/.copilot/skills/egd-prvni-appka/TEST.md`

```
File too large to read at once (26.5 KB). Consider using the rg tool to search within the file, or view with view_range to read specific sections.
```


---

<sub>15s</sub>

### `view`

**view the file at /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-eon/home/egd-workshop/.pripravenost/vysledky.json.**

`/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-eon/home/egd-workshop/.pripravenost/vysledky.json`

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
  "web": "https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-eon",
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

<sub>23s</sub>

### `bash`

**Zkontrolovat doporučenou cestu appky**

`$ node "/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-eon/home/.copilot/skills/egd-prvni-appka/scripts/appka.mjs" cesta`

<details>
<summary>10 lines</summary>

```
[INFO]    vysledky: /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/5f69cff6-031c-4b89-a84d-c6295599c8c7/scratchpad/pa/sb-eon/home/egd-workshop/.pripravenost/vysledky.json
[INFO]    web z kontroly: https://pavelchocholousgmail.sharepoint.com/sites/egd-test-cp-eon
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

<sub>31s</sub>

### Copilot

Připravenost doporučuje cestu A: vlastní SPFx aplikaci. Plán je vytvořit a sestavit projekt, ověřit oprávnění a katalog **jen na zadaném webu**, pak tam založit seznam `MojeAppka`, nasadit aplikaci a stránku a ověřit výsledek. Zatím jsem do SharePointu nic nezapsal; kontrola připravenosti ověřovala katalog a roli na jiném webu, takže je potřeba ověřit je znovu na cílovém.

Než začnu, potřebuji zvolit vzhled: **E.ON** (červená, hranaté tvary) nebo **EG.D** (indigo, oblé tvary)? Vaše předchozí „ano“ bude platit pro tento plán; po výběru pokračuji.

---

<sub>Generated by [GitHub Copilot CLI](https://github.com/features/copilot/cli)</sub>
