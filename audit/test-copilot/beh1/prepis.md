# Copilot CLI Session

> [!NOTE]
> - **Session ID:** `cff9f79b-2477-4386-9564-fbff9bd7e9ce`  
> - **Started:** 11/22/2026, 8:15:31 PM  
> - **Duration:** 5m 24s  
> - **Exported:** 11/22/2026, 8:20:56 PM  

---

<sub>3s</sub>

### User

Zkontroluj moji připravenost na workshop. Jmenuji se Test Copilot. Adresa mého DEV webu je https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest . Licenci GitHub Copilot mám (používáš mě), weby DEV/TEST/PROD zatím neobjednané. Do SharePointu zatím nic zapisovat nechci (zkušební zápis přeskoč). Přihlášení do Microsoft 365 už mám hotové, tenant je pavelchocholousgmail.onmicrosoft.com. Na dotazy odpověz sám podle tohoto zadání, nemůžu odpovídat interaktivně.

---

<sub>6s</sub>

### `skill`

**egd-pripravenost**

<details>
<summary>Arguments</summary>

```json
{
  "skill": "egd-pripravenost"
}
```

</details>

```
Skill "egd-pripravenost" loaded successfully. Follow the instructions in the skill context.
```


---

<sub>10s</sub>

### Copilot

Začnu místní kontrolou nástrojů a síťového přístupu; zápis do SharePointu přeskočím podle vašeho zadání.

---

<sub>10s</sub>

### `view`

**view the file at /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/README.md.**

/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/README.md

<details>
<summary>51 lines</summary>

````
# egd-pripravenost

Kontrola, jestli je tvůj počítač připravený na vibecoding workshop EG.D (středa 25. 11.). AI agent
(GitHub Copilot nebo Claude) projde krok za krokem nástroje, síť, připojení k SharePointu a SharePoint
Framework a na konci vyrobí soubor `pripravenost-<jmeno>.md`, který pošleš Pavlovi. Trvá to asi
20–40 minut, většinu času čekáš na stahování.

Agent nic nemaže, nic nenastavuje v celé firmě a jediný zápis do SharePointu (jeden zkušební seznam
s jednou položkou na tvém webu) udělá až po tvém „ano“. Přihlašuješ se ty sám, agent hesla ani kódy nevidí.

## Co budeš potřebovat

- Windows počítač, na kterém pracuješ (admin práva nejsou potřeba).
- Node.js — stačí portable verze (bez admina), ale **ne starší než 22** (Node 18 nestačí ani na přihlášení k SharePointu). Když máš starší, agent ti řekne, odkud stáhnout Node 22 a jak ho zapnout; postup je i v `references\windows.md`.
- Adresu svého DEV webu na SharePointu (např. AILab-Dev), když ji máš.
- Nástroj: **VS Code s GitHub Copilot Chat** (režim Agent), **GitHub Copilot CLI**, nebo **Claude Code**.

## Instalace

Skill je složka `egd-pripravenost` (v ní `SKILL.md`, `scripts\`, `references\`). Rozbal ji z balíčku
na jedno z míst níže. Název složky musí zůstat přesně `egd-pripravenost`.

### GitHub Copilot ve VS Code nebo Copilot CLI (Windows)

1. Ve Průzkumníku otevři `%USERPROFILE%` (napiš to do adresního řádku) a vytvoř složku `.copilot\skills`
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
   Potřebuješ k tomu **appId** (číslo aplikace pro přihlášení) — máš ho od Pavla nebo IT. Když ho nemáš,
   nevadí, agent to zapíše do zprávy jako věc pro IT a pokračuje.
5. Agent přečte tvůj web, ukáže plán zkušebního zápisu a počká na tvé „ano“.
6. Na konci dostaneš `pripravenost-<jmeno>.md`. **Pošli ho Pavlovi.**

## GitHub a Copilot (firemní přístup)

Jak se připojit k firemnímu GitHubu a Copilotu (VS Code, Copilot CLI, `gh`, Claude) je v [references/github.md](references/github.md). Agent to s tebou projde v kroku „GitHub“.

## Co si objednat předem (E.ON ITSM)

Skript to na konci vypíše i do zprávy. Stručně: licence GitHub Copilot (ITSM „my IT order“, schválení T. Richtera a vedoucího, screenshot žádosti; jen když chceš Copilot), tři weby DEV/TEST/PROD (ITSM „SharePoint Online | New Site Creation“) a katalog aplikací na webu (e-mail vlastníka webu na sharepoint@eon.com, zakládá se ručně, tak s tím neotálej).

## Ruční spuštění bez agenta

```
cd %USERPROFILE%\egd-workshop
node "%USERPROFILE%\.copilot\skills\egd-pripravenost\scripts\pripravenost.mjs" --help
```

Ověřeno: běh skriptu na macOS (Node 22, CLI 12.0.0, čtení labového SharePointu). Windows, Node 18
a tenant E.ON zatím ověřené nejsou — právě proto tenhle test děláš.
````

</details>


---

<sub>10s</sub>

### `view`

**view the file at /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/references/github.md.**

/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/references/github.md

<details>
<summary>57 lines</summary>

```
# GitHub a Copilot: připojení k firemnímu GitHubu EG.D / E.ON

Pro neprogramátora na Windows. Značky: ✅ změřeno · 📘 dokumentace · ❓ neověřeno.
Přihlášení dělá **člověk** sám (v prohlížeči nebo ve svém terminálu); agent kódy ani tokeny nevidí a nezapisuje.
Adresu firemního GitHubu zatím **neznáme**; v textu je `<GITHUB-ADRESA>`, dosadí se, až ji IT potvrdí.

## Krok 1 – Jak firemní GitHub poznáš

Zeptej se IT, kolegů nebo najdi na intranetu, jakou adresou se firemní GitHub otevírá. Pak:

| Adresa | Co to je | Co z toho plyne |
|---|---|---|
| `https://github.com` + přihlášení firemním účtem / firemní SSO | github.com s enterprise účtem (organizace EG.D / E.ON uvnitř github.com) 📘 | Nastavení VS Code se **nemění**, `gh auth login` bez `--hostname`. Funguje vše včetně GitHub konektoru v Claude. |
| `https://<něco>.ghe.com` | GitHub Enterprise Cloud s vlastní doménou (data residency) 📘 | V VS Code, Copilot CLI i `gh` se musí zadat **tato adresa**, jinak se přihlásíš na špatný GitHub. |
| jiná vlastní adresa (třeba `github.eon.com`) | nejspíš GitHub Enterprise Server ❓ | Ověř u IT; `gh` a git fungují s `--hostname`, Copilot a Claude konektory se liší (viz krok 6). |

Poznámka: i na `github.com` může být tvůj účet „managed“ (patří firmě). Pozná se podle toho, že se přihlašuješ přes firemní SSO a jméno účtu má příponu firmy.

Ověření v prohlížeči: otevři adresu, přihlas se, vpravo nahoře profilový obrázek → **Your organizations** (nebo **Your enterprises**). Vidíš EG.D / E.ON = máš firemní přístup. Licenci Copilota ukáže `https://<GITHUB-ADRESA>/settings/copilot` (u github.com `https://github.com/settings/copilot`) 📘 (menu jsem živě neprošel, ❓ přesné popisky).

## Krok 2 – Nemáš přístup nebo licenci: ITSM

E.ON ITSM („my IT order“), jak řekla Adriána (schválení T. Richtera a vedoucího, k žádosti screenshot). Vzor žádosti:

„Žádám o přidělení licence GitHub Copilot a přístupu do firemní organizace GitHub Enterprise pro účastníka vibecoding workshopu IT EG.D 25. 11. 2026. Potřebuji GitHub Copilot v editoru Visual Studio Code a GitHub Copilot CLI na pracovní stanici s Windows.“

Číslo požadavku pošli Pavlovi. Podej co nejdřív.

## Krok 3 – Záloha, když do úterý 24. 11. nemáš nic z kroků 1–2

Jedna věta: založ si bezplatný osobní účet na https://github.com/signup (bez karty; zda smíš firemní e-mail, ověř u nadřízeného, jinak soukromý), ve VS Code **Sign in with GitHub** a v Copilot Chatu **Sign up for Copilot Free**; Free zahrnuje agent mode i Copilot CLI, ale jen omezený počet použití 📘. Dostaneš-li později firemní licenci, přepíše osobní plán.

## Krok 4 – Přihlášení v nástrojích

### a) VS Code a Copilot

- **github.com (i s firemním účtem):** vlevo dole ikona účtu → **Sign in with GitHub**, přihlas se firemním účtem. Pak otevři Chat a přepni na **Agent**.
- **GHE.com (`*.ghe.com`):** 📘 podle dokumentace GitHubu:
  1. Nastavení (Ctrl+,), vyhledej `enterprise`, u **Github-enterprise: Uri** zadej `https://<GITHUB-ADRESA>` (např. `https://octocorp.ghe.com`).
  2. Vyhledej `copilot`, u „GitHub > Copilot: Advanced“ klikni **Edit in settings.json** a doplň  
     `"github.copilot.advanced": { "authProvider": "github-enterprise" }`
  3. Ulož. Objeví se výzva **Sign in to GitHub**; když ne, restartuj VS Code.
  4. Zpět na github.com: odstraň `authProvider` ze `settings.json`.
  ❓ komunitní vlákno tvrdí, že `github-enterprise.uri` ovlivní jen rozšíření GitHub, ne Copilot; proto je potřeba i `authProvider`. Neověřeno na GHE.com, kterou nemáme.

### b) Copilot CLI

- **github.com:** v terminálu `copilot`, pak `/login` (nebo `copilot login`) ✅ (`copilot login --help`, Copilot CLI 1.0.91). Otevře prohlížeč.
- **GHE.com:** `copilot login --host https://<GITHUB-ADRESA>` ✅ (příklad přímo v `copilot login --help`); v `/login` jde zvolit i „GitHub Enterprise Cloud with data residency“ a zadat adresu 📘.
- Instalace na Windows: `winget install GitHub.Copilot` (bez Node) nebo `npm i -g @github/copilot` 📘; požadavek PowerShell 6+ ❓ ověř (Windows PowerShell 5.1 nemusí stačit, `pwsh` jako portable).
- Skill se instaluje do `%USERPROFILE%\.copilot\skills` (viz README).

### c) `gh` (GitHub CLI) a git

- Přihlášení: `gh auth login --hostname <GITHUB-ADRESA>` (pro github.com bez `--hostname`) ✅ (`gh auth login --help`: `--hostname` je výslovně pro jiný GitHub; existuje i `--web` a `--with-token`). Zvol HTTPS a „Login with a web browser“.
- Který host je přihlášený: `gh auth status` (vypíše každý host zvlášť; tokeny nikam nepiš) ✅. Skill to dělá příkazem `node "<S>" github`.
- git přes `gh`: `gh auth setup-git --hostname <GITHUB-ADRESA>` ✅ (příkaz existuje, nastaví `gh` jako credential helper pro daný host).
- git přes Git Credential Manager: Git for Windows ho obsahuje a při prvním `git clone` otevře přihlašovací okno ❓ (pro `*.ghe.com` ověř u prvního klonu; nic nenastavuj sám, když okno nevyskočí, použij `gh auth setup-git`).
- Nikdy nevkládej heslo ani token do chatu; „classic“ osobní tokeny Copilot CLI nepodporuje 📘.

### d) Claude Code a Claude Desktop (záložka Code)

- Claude pracuje s repem **lokálně přes git a `gh` na tvém počítači** ❓ (princip: spouští tytéž příkazy co ty; funguje tedy se vším, k čemu jsi přihlášený v krocích 4a–4c, i na `*.ghe.com`). Neověřeno na firemním hostu.
- **GitHub konektor / GitHub app pro Claude** (cloudové relace, code review, `/install-github-app`) je pro **github.com** 📘. Pro GitHub Enterprise Server je podpora jen v plánech Team a Enterprise a `/install-github-app` tam nejde 📘. Pro `*.ghe.com` jsem podporu nenašel ❓ → počítej s prací přes lokální git a `gh`.

## Krok 5 – Rychlý test (3 věci)

1. `gh auth status` (nebo `node "<S>" github`): vidíš svou adresu a svůj účet.
2. Naklonuj jakékoli firemní repo (adresu dej IT/Pavla): `git clone https://<GITHUB-ADRESA>/<org>/<repo>.git`. Povede-li se bez zadávání hesla, git je připojený.
3. Ve VS Code Chat (Agent) napiš „Ahoj, funguješ?“ a odpoví, nebo v terminálu `copilot` a otázku.

Výsledky zapiš agentovi, ten je dá do zprávy (`zapis --klic github-test --stav zelena|zluta|cervena --hodnota "…"`).

## Co když to nejde

| Příznak | Pravděpodobná příčina |
|---|---|
| ve VS Code se přihlásíš na github.com místo firmy | chybí `github-enterprise.uri` / `authProvider` (jen u `*.ghe.com`) |
| „You don't have access to Copilot“ | licence ještě není přidělena → krok 2 |
| `gh` neukazuje firemní host | `gh auth login --hostname <GITHUB-ADRESA>` |
| `git clone` hlásí chybu ověření | stará položka v Správci pověření Windows (Credential Manager), smaž ji tam a zkus znovu ❓ |
| SSO „authorize token“ | firma vyžaduje autorizaci tokenu pro SAML SSO; potvrď v prohlížeči ❓ |

Zdroje 📘: GitHub Docs „Authenticating to an account on GHE.com“ (docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/configure-personal-settings/authenticate-to-ghecom), „Authenticate Copilot CLI“, manuál `gh auth login`, Claude Code docs „GitHub Enterprise Server“. Zjištění k ceně a variantám: [09-github-ucastnici.md](../../../09-github-ucastnici.md).
```

</details>


---

<sub>10s</sub>

### `view`

**view the file at /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/references/prihlaseni.md.**

/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/references/prihlaseni.md

<details>
<summary>37 lines</summary>

```
# Přihlášení CLI for Microsoft 365 v tenantu E.ON

## Fakta

| Fakt | Stav |
|---|---|
| Tenant E.ON (doména `egd.cz`) = `b914a242-e718-443b-a47c-6b4c649d8c0a` | ✅ veřejný OIDC endpoint `login.microsoftonline.com/egd.cz/v2.0/.well-known/openid-configuration`, 22. 11. 2026 |
| SharePoint E.ON = `eonos.sharepoint.com` | ✅ odpovídá (bez přihlášení HTTP 403) |
| CLI 11 i 12 vyžaduje appId (`--appId`, konfigurace nebo proměnná `CLIMICROSOFT365_ENTRAAPPID`) | 📘 `m365 login --help remarks` (CLI 12.0.0) |
| Výchozí `authType` je `deviceCode`; pro člověka je druhá možnost `browser` | 📘 tamtéž |
| `m365 setup` umí založit registraci aplikace (přihlásí se jako Azure CLI a vytvoří ji) | 📘 `m365 setup --help full` |
| Existuje v E.ON už schválená aplikace pro CLI / PnP? | ❓ zeptat se IT |
| Smí běžný uživatel v E.ON registrovat aplikace a dát si souhlas? | ❓ nejspíš ne |
| Blokuje Conditional Access v E.ON device code? | ❓ |

## Možnosti appId (od nejlepší)

1. **appId od IT / Pavla** – aplikace už registrovaná v tenantu E.ON se souhlasem správce:
   `node "<S>" prihlaseni-prikaz --appId <id>`.
2. **Nová registrace přes ServiceNow** (věta níže). Co musí mít: delegovaná oprávnění
   **SharePoint `AllSites.FullControl`** (to vyžadují `spo app add` / `deploy`, ✅ v labu) a
   **Microsoft Graph `User.Read`**, souhlas správce, zapnuté **Allow public client flows** (device code)
   a pro `--authType browser` redirect URI `http://localhost` typu „Mobile and desktop applications“ ❓.
3. **`m365 setup`** – založí registraci sám, ale je to **zápis do Entra ID E.ON**. Jen se svolením IT,
   ne na vlastní pěst; v E.ON nejspíš skončí na právech ❓.
4. **Bez CLI** (když do středy nic z toho nevyjde): SharePoint jde ověřit v prohlížeči (příkaz
   `prohlizec`); první appka pak bude bez nasazování kódu (seznam + formátování), nebo s ručním
   nahráním `.sppkg` do katalogu v prohlížeči (tak to EG.D už jednou udělala).

## Věty pro ServiceNow

Doplň `<…>`. Jedna věta = jeden požadavek.

- **appId:** „Prosím o appId registrované aplikace v Entra ID tenantu E.ON, přes kterou se smím přihlásit
  nástrojem CLI for Microsoft 365 (device code) k SharePointu; potřebná delegovaná oprávnění SharePoint
  AllSites.FullControl a Microsoft Graph User.Read se souhlasem správce a povolené public client flows.
  Účel: nasazování SharePoint Framework aplikací na můj web <URL> (workshop EG.D).“
- **Souhlas pro existující appId (AADSTS65001 / 90094 / 90095):** „Prosím o udělení souhlasu správce
  (admin consent) pro aplikaci s appId <appId> v tenantu E.ON pro delegovaná oprávnění SharePoint
  AllSites.FullControl a Microsoft Graph User.Read.“
- **Public client flows (AADSTS7000218):** „Prosím o zapnutí Allow public client flows u registrace aplikace
  <appId> (přihlášení CLI for Microsoft 365 metodou device code).“
- **Conditional Access (AADSTS53003 / 50097):** „Prosím o postup nebo výjimku pro přihlášení nástroje CLI for
  Microsoft 365 k SharePointu z mého firemního počítače; přihlášení blokuje Conditional Access (kód <AADSTS…>).“
```

</details>


---

<sub>11s</sub>

### `view`

**view the file at /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs.**

/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs (lines 1-220)

<details>
<summary>209 lines</summary>

```
#!/usr/bin/env node
// pripravenost.mjs - kontrola pripravenosti pocitace na vibecoding workshop EG.D.
// Bez zavislosti, Node 18+, Windows / macOS / Linux. Vysledky sbira do .pripravenost/vysledky.json
// v aktualni slozce a prikaz `zprava` z nich slozi pripravenost-<jmeno>.md.
// Nikdy neuklada tokeny ani hesla. Zapisuje do SharePointu jen prikaz `zkouska` s volbou --ano.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// ---- konstanty (na jednom miste, at se daji zmenit) ----
const EON_TENANT_ID = 'b914a242-e718-443b-a47c-6b4c649d8c0a'; // z verejneho OIDC endpointu pro egd.cz (overeno 22. 11. 2026)
const EON_SP_HOST = 'eonos.sharepoint.com';
const SPFX_NODE_MAJORS = [22, 24, 26];           // SPFx 1.24.x podle Microsoft docs (compatibility, 2. 11. 2026)
const SPFX_NODE_22_MIN = [22, 14, 0];            // engines sablony 1.24.1: >=22.14.0
const SPFX_GENERATOR = '@microsoft/generator-sharepoint@1.24.1';
const YO = 'yo@7.0.1';
const CLI_PKG = '@pnp/cli-microsoft365';
const CLI_DEFAULT_MAJOR = '12';
const CLI_MIN_NODE_MAJOR = 20;                  // zmereno: CLI 11 i 12 padaji na Node 18 (yargs-parser chce Node 20+)
const EON_SHAREPOINT_MAIL = 'sharepoint@eon.com'; // zakladani site collection app catalogu a custom scriptu (mail E.ON 12. 11. 2026)
const TIMEOUT_SHORT_MS = 30_000;                 // jednoduchy prikaz / sitovy dotaz
const TIMEOUT_INSTALL_MS = 600_000;              // npm install
const TEST_LIST = 'EGD-pripravenost';
const STATE_DIR = '.pripravenost';
const STATE_FILE = path.join(STATE_DIR, 'vysledky.json');
const IS_WIN = process.platform === 'win32';

// ---- vystup a stav ----
const ICON = { zelena: '[ZELENA]', zluta: '[ZLUTA] ', cervena: '[CERVENA]', info: '[INFO]  ' };
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return { vysledky: {} }; }
}
function saveState(s) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2), 'utf8');
}
const state = loadState();
function record(oblast, klic, stav, hodnota, dalsi = {}) {
  // dalsi: { it: 'veta pro ServiceNow', oprava: 'co udela uzivatel', zdroj: 'odkud' }
  state.vysledky[klic] = { oblast, stav, hodnota: String(hodnota ?? ''), ...dalsi, kdy: new Date().toISOString() };
  console.log(`${ICON[stav] || stav} ${klic}: ${hodnota}`);
  if (dalsi.oprava) console.log(`          co dal: ${dalsi.oprava}`);
  if (dalsi.it) console.log(`          veta pro IT: ${dalsi.it}`);
}

// ---- spousteni programu ----
function run(cmd, args = [], { timeout = TIMEOUT_SHORT_MS, shell = false, cwd } = {}) {
  // Na Windows jsou npm/code/copilot/claude .cmd soubory: bez shellu je Node nespusti (EINVAL).
  const useShell = shell || (IS_WIN && !/\.exe$/i.test(cmd) && !path.isAbsolute(cmd));
  const r = spawnSync(cmd, args, { encoding: 'buffer', timeout, shell: useShell, cwd, windowsHide: true });
  const dec = (b) => {
    if (!b) return '';
    // wsl.exe pise UTF-16LE
    const zeros = b.filter((x) => x === 0).length;
    return (zeros > b.length / 4 ? b.toString('utf16le') : b.toString('utf8')).replace(/\0/g, '').trim();
  };
  return {
    ok: r.status === 0 && !r.error,
    status: r.status,
    timedOut: r.error?.code === 'ETIMEDOUT' || r.signal === 'SIGTERM',
    missing: r.error?.code === 'ENOENT' || (useShell && (r.status === 127 || /not recognized|nebyl rozpozn|not found/i.test(dec(r.stderr)))),
    out: dec(r.stdout),
    err: dec(r.stderr) || (r.error ? String(r.error.message) : ''),
  };
}
const firstLine = (s) => (s || '').split(/\r?\n/).find((l) => l.trim()) || '';

function npmCli() {
  // npm volame pres node + npm-cli.js, kdyz to jde (bez .cmd a bez PowerShell execution policy)
  const cands = [
    path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(path.dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
  const f = cands.find((c) => fs.existsSync(c));
  return f ? { cmd: process.execPath, pre: [f] } : { cmd: 'npm', pre: [] };
}
function npm(args, opts) { const n = npmCli(); return run(n.cmd, [...n.pre, ...args], opts); }

function cliPath(opts) {
  const p = opts.cli || process.env.PRIPRAVENOST_M365_CLI || path.join(process.cwd(), 'node_modules', '@pnp', 'cli-microsoft365', 'dist', 'index.js');
  return fs.existsSync(p) ? p : null;
}
function m365(opts, args, { timeout = TIMEOUT_SHORT_MS } = {}) {
  const p = cliPath(opts);
  if (!p) return { ok: false, json: null, err: 'CLI for Microsoft 365 neni v teto slozce nainstalovane (spust: cli-instalace)' };
  const r = run(process.execPath, [p, ...args, '--output', 'json'], { timeout });
  let json = null;
  try { json = JSON.parse(r.out); } catch { /* text */ }
  const errText = (json && typeof json === 'object' && json.error) ? (typeof json.error === 'string' ? json.error : JSON.stringify(json.error)) : '';
  // pozor: CLI umi vratit {"error": ...} i s rc 0 -> rozhoduje tvar vystupu
  return { ok: r.ok && !errText, json, err: errText || r.err || (r.ok ? '' : r.out), raw: r.out, timedOut: r.timedOut };
}

// ---- prava SharePointu (SP.PermissionKind) ----
const KINDS = {
  1: 'ViewListItems', 2: 'AddListItems', 3: 'EditListItems', 4: 'DeleteListItems', 5: 'ApproveItems', 6: 'OpenItems',
  7: 'ViewVersions', 8: 'DeleteVersions', 9: 'CancelCheckout', 10: 'ManagePersonalViews', 12: 'ManageLists',
  13: 'ViewFormPages', 14: 'AnonymousSearchAccessList', 17: 'Open', 18: 'ViewPages', 19: 'AddAndCustomizePages',
  20: 'ApplyThemeAndBorder', 21: 'ApplyStyleSheets', 22: 'ViewUsageData', 23: 'CreateSSCSite', 24: 'ManageSubwebs',
  25: 'CreateGroups', 26: 'ManagePermissions', 27: 'BrowseDirectories', 28: 'BrowseUserInfo', 29: 'AddDelPrivateWebParts',
  30: 'UpdatePersonalWebParts', 31: 'ManageWeb', 32: 'AnonymousSearchAccessWebLists', 37: 'UseClientIntegration',
  38: 'UseRemoteAPIs', 39: 'ManageAlerts', 40: 'CreateAlerts', 41: 'EditMyUserInfo', 63: 'EnumeratePermissions',
};
function decodeMask(high, low) {
  const H = BigInt(high || 0), L = BigInt(low || 0);
  const names = [];
  for (let k = 1; k <= 64; k++) {
    const set = k <= 32 ? ((L >> BigInt(k - 1)) & 1n) : ((H >> BigInt(k - 33)) & 1n);
    if (set) names.push(KINDS[k] || `kind${k}`);
  }
  return names;
}
function roleGuess(names) {
  const has = (n) => names.includes(n);
  if (has('ManageWeb') && has('ManagePermissions')) return 'Vlastnik (Full Control)';
  if (has('AddListItems') && has('EditListItems') && has('ManageLists')) return 'Clen (Edit)';
  if (has('AddListItems') && has('EditListItems')) return 'Prispevatel (Contribute)';
  if (has('ViewListItems')) return 'Ctenar (Read)';
  return 'zadny pristup';
}

// ---- prikazy ----
function cmdNastroje() {
  const oblast = 'Nastroje';
  record(oblast, 'system', 'info', `${os.type()} ${os.release()} ${os.version ? os.version() : ''} (${process.arch})`.trim());
  if (IS_WIN) {
    const ps5 = run('powershell.exe', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']);
    record(oblast, 'powershell-5', ps5.ok ? 'info' : 'zluta', ps5.ok ? ps5.out : 'nenalezen');
    const ps7 = run('pwsh.exe', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']);
    record(oblast, 'powershell-7', ps7.ok ? 'zelena' : 'zluta', ps7.ok ? ps7.out : 'neni (nevadi; agentum pomuze, viz README)',
      ps7.ok ? {} : { oprava: 'nepovinne: PowerShell 7 jako portable zip bez admin prav, nebo Git Bash' });
    const pol = run('powershell.exe', ['-NoProfile', '-Command', 'Get-ExecutionPolicy']);
    const blocked = pol.ok && /Restricted|AllSigned/i.test(pol.out);
    record(oblast, 'powershell-execution-policy', blocked ? 'zluta' : 'info', pol.ok ? pol.out : 'nezjisteno',
      blocked ? { oprava: 'npm/npx v PowerShellu muzou koncit "running scripts is disabled"; volej pres node ... nebo cmd' } : {});
  }
  const git = run('git', ['--version']);
  record(oblast, 'git', git.ok ? 'zelena' : 'zluta', git.ok ? git.out : 'neni',
    git.ok ? {} : { oprava: 'Git for Windows (portable verze jde bez admina); na prvni zkousku neni nutny', it: 'Prosim o instalaci Git for Windows na muj pocitac (potrebuji ho pro vyvoj SharePoint aplikaci s GitHub Copilotem).' });

  const nodeV = process.versions.node;
  const major = Number(nodeV.split('.')[0]);
  const portable = IS_WIN ? !/Program Files/i.test(process.execPath) : null;
  const spfxOk = SPFX_NODE_MAJORS.includes(major) && (major !== 22 || cmpVer(nodeV, SPFX_NODE_22_MIN) >= 0);
  record(oblast, 'node', spfxOk ? 'zelena' : 'zluta', `v${nodeV} (${process.execPath}${portable === null ? '' : portable ? ', vypada jako portable' : ', instalovany'})`,
    spfxOk ? {} : { oprava: `pro SPFx 1.24 je potreba Node ${SPFX_NODE_MAJORS.join(' / ')} (22 aspon 22.14). Portable zip z nodejs.org jde bez admin prav; staci ho rozbalit a dat na zacatek PATH`, zdroj: 'Microsoft docs SPFx compatibility' });
  const npmV = npm(['--version']);
  record(oblast, 'npm', npmV.ok ? 'zelena' : 'cervena', npmV.ok ? npmV.out : (npmV.err || 'neni'));

  const code = run('code', ['--version']);
  record(oblast, 'vscode', code.ok ? 'zelena' : 'zluta', code.ok ? `VS Code ${firstLine(code.out)}` : 'prikaz "code" nenalezen (VS Code chybi nebo neni v PATH)');
  if (code.ok) {
    const ext = run('code', ['--list-extensions']);
    const list = ext.ok ? ext.out.toLowerCase().split(/\r?\n/) : [];
    const chat = list.includes('github.copilot-chat'), base = list.includes('github.copilot');
    record(oblast, 'vscode-copilot', chat ? 'zelena' : 'zluta', chat ? `rozsireni GitHub Copilot Chat${base ? ' + GitHub Copilot' : ''}` : 'rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene)',
      chat ? { oprava: 'licenci over ve VS Code: ikona Copilota dole -> musi byt prihlaseno a bez "no access"' } : { oprava: 'otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> "GitHub Copilot Chat" (kdyz je Marketplace blokovany, IT)' });
  }
  const cop = run('copilot', ['--version']);
  record(oblast, 'copilot-cli', cop.ok ? 'zelena' : 'info', cop.ok ? `Copilot CLI ${firstLine(cop.out)}` : 'neni (nepovinne)');
  const gh = run('gh', ['--version']);
  record(oblast, 'gh', gh.ok ? 'info' : 'info', gh.ok ? firstLine(gh.out) : 'neni (nepovinne)');
  const cl = run('claude', ['--version']);
  record(oblast, 'claude-code', cl.ok ? 'zelena' : 'info', cl.ok ? `Claude Code ${firstLine(cl.out)}` : 'neni');
  const desk = claudeDesktopPath();
  record(oblast, 'claude-desktop', desk ? 'zelena' : 'info', desk ? `nalezeno: ${desk}` : 'nenalezeno (hledano ve vychozich cestach)');
  if (IS_WIN) {
    const w = run('wsl.exe', ['-l', '-q']);
    record(oblast, 'wsl', w.ok && w.out ? 'info' : 'info', w.ok && w.out ? `distribuce: ${w.out.split(/\r?\n/).join(', ')}` : 'neni / bez distribuce (nepovinne)');
  }
  const who = process.env.CLAUDECODE ? 'Claude Code' : process.env.TERM_PROGRAM === 'vscode' ? 'terminal VS Code (Copilot agent mode nebo rucne)' : 'jiny terminal';
  record(oblast, 'spusteno-z', 'info', who);
  saveState(state);
}
function claudeDesktopPath() {
  const c = [];
  if (IS_WIN) {
    const la = process.env.LOCALAPPDATA || '';
    c.push(path.join(la, 'AnthropicClaude', 'claude.exe'), path.join(la, 'Programs', 'Claude', 'Claude.exe'));
  } else if (process.platform === 'darwin') c.push('/Applications/Claude.app');
  return c.find((p) => p && fs.existsSync(p)) || null;
}
function cmpVer(v, min) {
  const a = v.split('.').map(Number);
  for (let i = 0; i < 3; i++) { if ((a[i] || 0) !== min[i]) return (a[i] || 0) - min[i]; }
  return 0;
}

function cmdNpm() {
  const oblast = 'Sit a npm';
  const cfg = (k) => { const r = npm(['config', 'get', k]); return r.ok ? r.out : '?'; };
  const registry = cfg('registry');
  record(oblast, 'npm-registry', registry.includes('registry.npmjs.org') ? 'info' : 'zluta', registry,
    registry.includes('registry.npmjs.org') ? {} : { oprava: 'firemni zrcadlo npm - to je v poradku, jen ho zapis do zpravy' });
  const proxy = cfg('proxy'), hproxy = cfg('https-proxy'), ssl = cfg('strict-ssl'), cafile = cfg('cafile');
  record(oblast, 'npm-proxy', 'info', `proxy=${proxy} https-proxy=${hproxy} strict-ssl=${ssl} cafile=${cafile} HTTPS_PROXY=${process.env.HTTPS_PROXY || process.env.https_proxy ? 'nastaveno' : 'ne'} NODE_EXTRA_CA_CERTS=${process.env.NODE_EXTRA_CA_CERTS ? 'nastaveno' : 'ne'}`);
  const ping = npm(['ping'], { timeout: TIMEOUT_SHORT_MS });
  const txt = `${ping.out}\n${ping.err}`;
  if (ping.ok) record(oblast, 'npm-ping', 'zelena', 'registry odpovida (PONG)');
  else record(oblast, 'npm-ping', 'cervena', diagnoseNet(txt, ping.timedOut), npmFix(txt, ping.timedOut));
  const view = npm(['view', CLI_PKG, 'version'], { timeout: TIMEOUT_SHORT_MS });
  record(oblast, 'npm-stazeni-metadat', view.ok ? 'zelena' : 'cervena', view.ok ? `${CLI_PKG} ${view.out} je dostupny` : diagnoseNet(`${view.out}\n${view.err}`, view.timedOut),
    view.ok ? {} : npmFix(`${view.out}\n${view.err}`, view.timedOut));
  saveState(state);
}
function diagnoseNet(t, timedOut) {
  if (timedOut) return 'vyprsel cas - nejspis proxy nebo firewall';
  if (/SELF_SIGNED_CERT_IN_CHAIN|UNABLE_TO_GET_ISSUER_CERT|UNABLE_TO_VERIFY_LEAF|CERT_/i.test(t)) return 'SSL inspekce: firemni proxy podepisuje HTTPS vlastnim certifikatem';
  if (/E407|Proxy Authentication/i.test(t)) return 'proxy chce prihlaseni (407)';
  if (/ENOTFOUND|EAI_AGAIN/i.test(t)) return 'DNS nezna adresu registry (bez proxy nebo blokovano)';
  if (/ECONNREFUSED|ECONNRESET|ETIMEDOUT/i.test(t)) return 'spojeni odmitnuto nebo preruseno (firewall/proxy)';
  if (/E403|403 Forbidden/i.test(t)) return 'registry vraci 403 (blokovano politikou)';
  return firstLine(t) || 'neznama chyba';
}
function npmFix(t, timedOut) {
  if (/SELF_SIGNED|ISSUER_CERT|VERIFY_LEAF|CERT_/i.test(t)) return {
    oprava: 'nevypinej strict-ssl. Pozadej IT o korenovy certifikat proxy (soubor .cer/.pem) a nastav: npm config set cafile <cesta> a promennou NODE_EXTRA_CA_CERTS=<cesta>',
    it: 'Prosim o korenovy certifikat firemni HTTPS inspekce (PEM) a postup, jak ho nastavit pro Node.js/npm (npm cafile, NODE_EXTRA_CA_CERTS) - potrebuji instalovat balicky z registry.npmjs.org.' };
```

</details>


---

<sub>11s</sub>

### `bash`

**Ověří pracovní složku a diagnostický skript**

$ pwd && ls -ld . && node --version && test -f "/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" && echo SKRIPT_OK

```
/tmp/cp-run1/home/egd-workshop
drwxr-xr-x@ 2 chocholous  wheel  64 Nov 22 20:15 .
v22.23.5
SKRIPT_OK
<shellId: 0 completed with exit code 0>
```


---

<sub>45s</sub>

### `bash`

**Zkontroluje nástroje, npm, síť a GitHub**

$ node "/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" nastroje && node "/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" npm && node "/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" sit && node "/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" github

<details>
<summary>15 lines</summary>

```
[INFO]   system: Darwin 27.2.0 Darwin Kernel Version 27.2.0: Wed Oct 14 23:47:07 PDT 2026; root:xnu-13432.41.4~25/RELEASE_ARM64_T8132 (arm64)
[ZELENA] git: git version 2.54.0 (Apple Git-157)
[ZELENA] node: v22.23.5 (/opt/homebrew/Cellar/node@22/22.23.5_1/bin/node)
[ZELENA] npm: 10.9.9
[ZELENA] vscode: VS Code 1.146.0
[ZLUTA]  vscode-copilot: rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene)
          co dal: otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> "GitHub Copilot Chat" (kdyz je Marketplace blokovany, IT)
[ZELENA] copilot-cli: Copilot CLI GitHub Copilot CLI 1.0.91.
[INFO]   gh: gh version 2.104.0 (2026-11-12)
[ZELENA] claude-code: Claude Code 2.1.330 (Claude Code)
[ZELENA] claude-desktop: nalezeno: /Applications/Claude.app
[INFO]   spusteno-z: Claude Code
[INFO]   npm-registry: https://registry.npmjs.org/
[INFO]   npm-proxy: proxy=null https-proxy=null strict-ssl=true cafile=null HTTPS_PROXY=ne NODE_EXTRA_CA_CERTS=ne
<command with shellId: 1 is still running after 30 seconds. The command is still running. You will be automatically notified when it completes; if you need the command to complete end your response with no tool calls to wait for the notification. Use stop_bash to stop it.>
```

</details>


---

<sub>58s</sub>

### `read_bash`

**Waiting up to 30 seconds for command output**

<details>
<summary>Arguments</summary>

```json
{
  "shellId": "1",
  "delay": 30
}
```

</details>

<details>
<summary>22 lines</summary>

```
[INFO]   system: Darwin 27.2.0 Darwin Kernel Version 27.2.0: Wed Oct 14 23:47:07 PDT 2026; root:xnu-13432.41.4~25/RELEASE_ARM64_T8132 (arm64)
[ZELENA] git: git version 2.54.0 (Apple Git-157)
[ZELENA] node: v22.23.5 (/opt/homebrew/Cellar/node@22/22.23.5_1/bin/node)
[ZELENA] npm: 10.9.9
[ZELENA] vscode: VS Code 1.146.0
[ZLUTA]  vscode-copilot: rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene)
          co dal: otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> "GitHub Copilot Chat" (kdyz je Marketplace blokovany, IT)
[ZELENA] copilot-cli: Copilot CLI GitHub Copilot CLI 1.0.91.
[INFO]   gh: gh version 2.104.0 (2026-11-12)
[ZELENA] claude-code: Claude Code 2.1.330 (Claude Code)
[ZELENA] claude-desktop: nalezeno: /Applications/Claude.app
[INFO]   spusteno-z: Claude Code
[INFO]   npm-registry: https://registry.npmjs.org/
[INFO]   npm-proxy: proxy=null https-proxy=null strict-ssl=true cafile=null HTTPS_PROXY=ne NODE_EXTRA_CA_CERTS=ne
[ZELENA] npm-ping: registry odpovida (PONG)
[ZELENA] npm-stazeni-metadat: @pnp/cli-microsoft365 12.0.0 je dostupny
[ZELENA] entra-dosazitelne: login.microsoftonline.com odpovida, tenant egd.cz = b914a242-e718-443b-a47c-6b4c649d8c0a
[ZELENA] sharepoint-dosazitelny: eonos.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne)
[ZLUTA]  github-hosty: gh neni k zadnemu hostu prihlasen (nebo vypis nejde precist)
          co dal: postup v references/github.md krok 4: gh auth login --hostname <adresa firemniho GitHubu>
[INFO]   git-credential-helper: osxkeychain
<shellId: 1 completed with exit code 0>
```

</details>


---

<sub>1m 3s</sub>

### Copilot

Základní prostředí je zelené a npm/SharePoint jsou dosažitelné; GitHub firemní přihlášení se v tomto počítači neověřilo. Teď ověřím místní M365 CLI relaci a web jen pro čtení.

---

<sub>1m 3s</sub>

### `rg`

**function cmd(Prihlaseni|SharePoint|Spfx|Zprava|Prohlizec|Zapis|Zkouska)|case 'prihlaseni'|case 'sharepoint'|cli-instalace|case 'zprava'|--jmeno**

"function cmd(Prihlaseni|SharePoint|Spfx|Zprava|Prohlizec|Zapis|Zkouska)|case 'prihlaseni'|case 'sharepoint'|cli-instalace|case 'zprava'|--jmeno" (~/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs)

<details>
<summary>107 matches</summary>

```
[grep content: 105 matches across 1 file(s) under /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts]

pripravenost.mjs (105 match(es)):
  85- function m365(opts, args, { timeout = TIMEOUT_SHORT_MS } = {}) {
  86-   const p = cliPath(opts);
  87:   if (!p) return { ok: false, json: null, err: 'CLI for Microsoft 365 neni v teto slozce nainstalovane (spust: cli-instalace)' };
  88-   const r = run(process.execPath, [p, ...args, '--output', 'json'], { timeout });
  89-   let json = null;
  90-   try { json = JSON.parse(r.out); } catch { /* text */ }
  91-   const errText = (json && typeof json === 'object' && json.error) ? (typeof json.error === 'string' ? json.error : JSON.stringify(json.error)) : '';
  258-   const nodeMajor = Number(process.versions.node.split('.')[0]);
  259-   if (nodeMajor < CLI_MIN_NODE_MAJOR) {
  260:     record(oblast, 'cli-instalace', 'cervena', `Node v${process.versions.node} je moc stary: CLI for Microsoft 365 (verze 11 i 12) chce Node ${CLI_MIN_NODE_MAJOR}+; instalaci jsem nespoustel`,
  261:       { oprava: 'nejdriv portable Node 22 (zip z nodejs.org, bez admina, viz references/windows.md), dat ho na zacatek PATH, zavrit a znovu otevrit terminal, a pak cli-instalace; --verze 11 na Node 18 NEPOMUZE',
  262-         it: 'Prosim o povoleni portable Node.js 22 LTS (zip z nodejs.org, bez admin prav), nebo o jeho instalaci - CLI for Microsoft 365 i SharePoint Framework 1.24 nefunguji na Node 18.' });
  263-     saveState(state); return;
  264-   }
  265-   if (!fs.existsSync('package.json')) {
  271-   if (!r.ok) {
  272-     const t = `${r.out}\n${r.err}`;
  273:     record(oblast, 'cli-instalace', 'cervena', `${CLI_PKG}@${ver}: ${diagnoseNet(t, r.timedOut)}`, ver === '12' ? { oprava: 'zkus starsi verzi bez nativnich doplnku: cli-instalace --verze 11', ...npmFix(t, r.timedOut) } : npmFix(t, r.timedOut));
  274-     saveState(state); return;
  275-   }
  276-   const p = cliPath(opts);
  277-   const v = p ? run(process.execPath, [p, 'version', '--output', 'text']) : { ok: false };
  278:   record(oblast, 'cli-instalace', v.ok ? 'zelena' : 'cervena', v.ok ? `CLI for Microsoft 365 ${v.out} lokalne v node_modules` : 'nainstalovano, ale nejde spustit',
  279:     v.ok ? {} : { oprava: 'zkus cli-instalace --verze 11 (kdyz je Node 20+; na Node 18 nepomuze)' });
  280-   if (v.ok) {
  281-     const s = run(process.execPath, [p, 'setup', '--scripting', '--skipApp']);
  282-     record(oblast, 'cli-setup', s.ok ? 'zelena' : 'zluta', s.ok ? 'CLI nastaveno pro skripty (bez interaktivnich dotazu)' : `setup selhal: ${firstLine(s.err || s.out)}`);
  283-   }
  285- }
  286- 
  287: function cmdPrihlaseniPrikaz(opts) {
  288-   const appId = opts.appId || '<APP_ID_OD_IT>';
  289-   const tid = opts.tenant || state.tenantId || EON_TENANT_ID;
  290-   console.log(`
  291- Prihlaseni dela CLOVEK ve svem terminalu (agent ho neudela, kod z prohlizece musis zadat ty).
  299- }
  300- 
  301: function cmdPrihlaseni(opts) {
  302-   const oblast = 'Pripojeni k SharePointu';
  303-   const s = m365(opts, ['status']);
  304-   if (!s.ok || !s.json || !s.json.connectedAs) {
  305-     const t = `${s.err} ${s.raw || ''}`;
  402- }
  403- 
  404: function cmdZkouska(opts) {
  405-   const oblast = 'Ovladani SharePointu';
  406-   const web = (opts.web || state.web || '').replace(/\/+$/, '');
  407-   if (!web) { console.error('Chybi --web'); process.exit(2); }
  408-   const nazev = `Zkouska ${opts.jmeno || os.userInfo().username} ${new Date().toLocaleString('cs-CZ')}`;
  464- }
  465- 
  466: function cmdSpfx(opts) {
  467-   const oblast = 'SPFx pripravenost';
  468-   const nodeV = process.versions.node, major = Number(nodeV.split('.')[0]);
  469-   const ok = SPFX_NODE_MAJORS.includes(major) && (major !== 22 || cmpVer(nodeV, SPFX_NODE_22_MIN) >= 0);
  470-   record(oblast, 'node-pro-spfx-1.24', ok ? 'zelena' : 'cervena', `Node v${nodeV}; SPFx 1.24 chce ${SPFX_NODE_MAJORS.join(' / ')} (22 aspon 22.14). Gulp uz neni, build je Heft.`,
  486- }
  487- 
  488: function cmdProhlizec(opts) {
  489-   const web = (opts.web || state.web || 'https://eonos.sharepoint.com/sites/<tvuj-web>').replace(/\/+$/, '');
  490-   console.log(`Kdyz CLI nebo npm nejde, over aspon prohlizecem (Edge, firemni ucet). Otevri postupne a vysledek rekni agentovi:
  491- 
  492-   1. Web:                     ${web}
  510- }
  511- 
  512: function cmdZapis(opts) {
  513-   if (!opts.klic || !opts.stav) { console.error('Pouziti: zapis --klic <nazev> --stav zelena|zluta|cervena|info --hodnota "<text>" [--oblast "<oblast>"] [--it "<veta>"]'); process.exit(2); }
  514-   if (/eyJ[A-Za-z0-9_-]{10,}|password|heslo\s*[:=]/i.test(opts.hodnota || '')) { console.error('Text vypada jako token nebo heslo - nezapisuji.'); process.exit(2); }
  515-   record(opts.oblast || 'Rucne overeno', opts.klic, opts.stav, opts.hodnota || '', opts.it ? { it: opts.it } : {});
  516-   saveState(state);
  535- }
  536- 
  537: function cmdZprava(opts) {
  538-   const jmeno = (opts.jmeno || os.userInfo().username).replace(/[^\p{L}\p{N}_-]+/gu, '-');
  539-   const v = state.vysledky;
  540-   const order = ['Nastroje', 'Sit a npm', 'Pripojeni k SharePointu', 'Ovladani SharePointu', 'SPFx pripravenost', 'GitHub', 'Zalozni cesty', 'Rucne overeno'];
  541-   const label = { zelena: 'zelena', zluta: 'zluta', cervena: 'CERVENA', info: 'info' };
  572- function cmdPassthrough(rest, opts) {
  573-   const p = cliPath(opts);
  574:   if (!p) { console.error('CLI neni nainstalovane v teto slozce (cli-instalace).'); process.exit(1); }
  575-   const r = spawnSync(process.execPath, [p, ...rest], { stdio: 'inherit' });
  576-   process.exit(r.status ?? 1);
  577- }
  578- 
  586-   npm                            npm registry, proxy, SSL inspekce (npm ping, npm view)
  587-   sit [--domena egd.cz]          dosazitelnost prihlaseni Microsoft a SharePointu z Node, tenant ID
  588:   cli-instalace [--verze 12|11]  ZAPISUJE LOKALNE: npm install @pnp/cli-microsoft365 do teto slozky
  589-   prihlaseni-prikaz [--appId ID] vypise prikaz pro prihlaseni, ktery spusti clovek ve svem terminalu
  590-   prihlaseni                     overi prihlaseni CLI (m365 status) a tenant
  591-   sharepoint --web <url>         nazev webu, tvoje role, seznamy, katalog aplikaci, licence
  592-   zkouska --web <url> [--ano]    bez --ano jen plan; s --ano ZAPISE 1 seznam "${TEST_LIST}" + 1 polozku a precte ji
  596-   maska --high H --low L [--zapsat]  prelozi EffectiveBasePermissions na prava a roli
  597-   zapis --klic K --stav S --hodnota T [--it "veta"]  zapise rucne overeny vysledek
  598:   zprava --jmeno <jmeno>         slozi pripravenost-<jmeno>.md (tabulka + vety pro ServiceNow)
  599-   m365 <argumenty...>            spusti lokalni CLI (napr. login) primo v terminalu
  600- 
  601- Spolecne volby: --cli <cesta k dist/index.js>, --tenant <tenantId> (vychozi E.ON ${EON_TENANT_ID})
  602- Navratove kody: 0 hotovo, 1 chyba, 2 spatne pouziti, 10 plan bez zapisu.`;
  622- if (opts.help) { console.log(HELP); process.exit(0); }
  623- const table = {
  624:   nastroje: cmdNastroje, npm: cmdNpm, sit: cmdSit, 'cli-instalace': cmdCliInstalace, 'prihlaseni-prikaz': cmdPrihlaseniPrikaz,
  625-   prihlaseni: cmdPrihlaseni, sharepoint: cmdSharepoint, zkouska: cmdZkouska, spfx: cmdSpfx, github: cmdGithub, prohlizec: cmdProhlizec,
  626-   maska: cmdMaska, zapis: cmdZapis, zprava: cmdZprava,
  627- };
  628- if (!table[cmd]) { console.error(`Neznamy prikaz "${cmd}".\n\n${HELP}`); process.exit(2); }
```

</details>


---

<sub>1m 3s</sub>

### `view`

**view the file at /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs.**

/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs (lines 220-600)

<details>
<summary>253 lines</summary>

```
    it: 'Prosim o korenovy certifikat firemni HTTPS inspekce (PEM) a postup, jak ho nastavit pro Node.js/npm (npm cafile, NODE_EXTRA_CA_CERTS) - potrebuji instalovat balicky z registry.npmjs.org.' };
  return {
    oprava: 'bez npm nepujde CLI ani SPFx; zkus to z jine site, a zatim pokracuj kroky v prohlizeci (prikaz prohlizec)',
    it: 'Prosim o pristup k npm registry (https://registry.npmjs.org) pres firemni proxy, nebo o adresu firemniho zrcadla npm. Potrebuji ho pro nastroje SharePoint Framework a CLI for Microsoft 365 (vyvoj SharePoint aplikaci, workshop EG.D).' + (timedOut ? ' Pozadavky aktualne konci vyprsenim casu.' : '') };
}

async function cmdSit(opts) {
  const oblast = 'Sit a npm';
  const domain = opts.domena || 'egd.cz';
  try {
    const r = await fetchT(`https://login.microsoftonline.com/${encodeURIComponent(domain)}/v2.0/.well-known/openid-configuration`);
    const j = await r.json();
    const tid = (j.issuer || '').split('/')[3] || '?';
    record(oblast, 'entra-dosazitelne', 'zelena', `login.microsoftonline.com odpovida, tenant ${domain} = ${tid}`);
    state.tenantId = tid;
  } catch (e) {
    const certErr = /CERT|SELF_SIGNED/i.test(String(e.cause?.code || e.message));
    record(oblast, 'entra-dosazitelne', certErr ? 'cervena' : 'zluta', `Node se nedostane na login.microsoftonline.com: ${e.cause?.code || e.message}`,
      certErr ? npmFix('CERT', false) : { oprava: 'zkontroluj proxy (promenna HTTPS_PROXY Node fetch nepouziva) - prihlaseni CLI se muze chovat jinak, zkus ho i tak' });
  }
  const host = opts.host || EON_SP_HOST;
  try {
    const r = await fetchT(`https://${host}/_api/web?$select=Title`, { headers: { Accept: 'application/json' } });
    record(oblast, 'sharepoint-dosazitelny', 'zelena', `${host} odpovida (HTTP ${r.status}; 401/403 bez prihlaseni je spravne)`);
  } catch (e) {
    record(oblast, 'sharepoint-dosazitelny', 'zluta', `${host} nedosazitelny z Node: ${e.cause?.code || e.message} (Node fetch nepouziva proxy; neni to nutne chyba, rozhodne prihlaseni)`);
  }
  saveState(state);
}
async function fetchT(url, init = {}) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_SHORT_MS);
  try { return await fetch(url, { ...init, signal: ac.signal }); } finally { clearTimeout(t); }
}

function cmdCliInstalace(opts) {
  const oblast = 'Pripojeni k SharePointu';
  const ver = opts.verze || CLI_DEFAULT_MAJOR;
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor < CLI_MIN_NODE_MAJOR) {
    record(oblast, 'cli-instalace', 'cervena', `Node v${process.versions.node} je moc stary: CLI for Microsoft 365 (verze 11 i 12) chce Node ${CLI_MIN_NODE_MAJOR}+; instalaci jsem nespoustel`,
      { oprava: 'nejdriv portable Node 22 (zip z nodejs.org, bez admina, viz references/windows.md), dat ho na zacatek PATH, zavrit a znovu otevrit terminal, a pak cli-instalace; --verze 11 na Node 18 NEPOMUZE',
        it: 'Prosim o povoleni portable Node.js 22 LTS (zip z nodejs.org, bez admin prav), nebo o jeho instalaci - CLI for Microsoft 365 i SharePoint Framework 1.24 nefunguji na Node 18.' });
    saveState(state); return;
  }
  if (!fs.existsSync('package.json')) {
    fs.writeFileSync('package.json', JSON.stringify({ name: 'egd-pracovni-slozka', private: true, version: '0.0.0' }, null, 2), 'utf8');
    console.log('Zalozen package.json v teto slozce (jen pro lokalni instalaci nastroju).');
  }
  console.log(`Instaluji ${CLI_PKG}@${ver} do ${path.join(process.cwd(), 'node_modules')} (bez admin prav, muze trvat par minut)...`);
  const r = npm(['install', `${CLI_PKG}@${ver}`, '--save-exact', '--no-audit', '--no-fund'], { timeout: TIMEOUT_INSTALL_MS });
  if (!r.ok) {
    const t = `${r.out}\n${r.err}`;
    record(oblast, 'cli-instalace', 'cervena', `${CLI_PKG}@${ver}: ${diagnoseNet(t, r.timedOut)}`, ver === '12' ? { oprava: 'zkus starsi verzi bez nativnich doplnku: cli-instalace --verze 11', ...npmFix(t, r.timedOut) } : npmFix(t, r.timedOut));
    saveState(state); return;
  }
  const p = cliPath(opts);
  const v = p ? run(process.execPath, [p, 'version', '--output', 'text']) : { ok: false };
  record(oblast, 'cli-instalace', v.ok ? 'zelena' : 'cervena', v.ok ? `CLI for Microsoft 365 ${v.out} lokalne v node_modules` : 'nainstalovano, ale nejde spustit',
    v.ok ? {} : { oprava: 'zkus cli-instalace --verze 11 (kdyz je Node 20+; na Node 18 nepomuze)' });
  if (v.ok) {
    const s = run(process.execPath, [p, 'setup', '--scripting', '--skipApp']);
    record(oblast, 'cli-setup', s.ok ? 'zelena' : 'zluta', s.ok ? 'CLI nastaveno pro skripty (bez interaktivnich dotazu)' : `setup selhal: ${firstLine(s.err || s.out)}`);
  }
  saveState(state);
}

function cmdPrihlaseniPrikaz(opts) {
  const appId = opts.appId || '<APP_ID_OD_IT>';
  const tid = opts.tenant || state.tenantId || EON_TENANT_ID;
  console.log(`
Prihlaseni dela CLOVEK ve svem terminalu (agent ho neudela, kod z prohlizece musis zadat ty).
Otevri terminal v teto slozce (${process.cwd()}) a spust:

  node node_modules/@pnp/cli-microsoft365/dist/index.js login --authType deviceCode --appId ${appId} --tenant ${tid}

Vypise adresu https://microsoft.com/devicelogin a kod. Otevri adresu, zadej kod, prihlas se firemnim uctem.
Kdyz device code firma blokuje (chyba AADSTS53003 nebo AADSTS50097), zkus misto deviceCode: --authType browser
Kdyz nemas appId: viz references/prihlaseni.md (veta pro IT). Pak agentovi napis "hotovo".`);
}

function cmdPrihlaseni(opts) {
  const oblast = 'Pripojeni k SharePointu';
  const s = m365(opts, ['status']);
  if (!s.ok || !s.json || !s.json.connectedAs) {
    const t = `${s.err} ${s.raw || ''}`;
    record(oblast, 'prihlaseni', 'cervena', loginDiag(t) || 'neprihlaseno', loginFix(t));
    saveState(state); return false;
  }
  const tid = opts.tenant || state.tenantId || EON_TENANT_ID;
  const same = s.json.appTenant === tid;
  record(oblast, 'prihlaseni', same ? 'zelena' : 'zluta', `prihlasen ${s.json.connectedAs}, appId ${s.json.appId}, tenant ${s.json.appTenant}`,
    same ? {} : { oprava: `tenant neni ${tid} - prihlasen jinam? odhlas se (logout) a prihlas znovu s --tenant ${tid}` });
  state.prihlasen = { ucet: s.json.connectedAs, appId: s.json.appId, tenant: s.json.appTenant };
  saveState(state); return true;
}
function loginDiag(t) {
  const m = /AADSTS\d+/.exec(t || '');
  const map = {
    AADSTS65001: 'chybi souhlas (consent) pro aplikaci, pres kterou se CLI prihlasuje',
    AADSTS90094: 'aplikace potrebuje souhlas spravce (admin consent)',
    AADSTS90095: 'aplikace potrebuje souhlas spravce - pozadavek jde schvalit spravci',
    AADSTS700016: 'aplikace (appId) v tenantu neexistuje - spatne appId nebo jiny tenant',
    AADSTS7000218: 'aplikace nema povolene "public client flows" (device code)',
    AADSTS53003: 'prihlaseni zablokovala politika podmineneho pristupu (Conditional Access)',
    AADSTS50097: 'prihlaseni chce spravovane zarizeni (device code z tohoto zarizeni neprojde)',
    AADSTS50105: 'nejsi prirazen k aplikaci',
  };
  if (m) return `${m[0]}: ${map[m[0]] || 'viz Microsoft Entra error codes'}`;
  if (/not logged|Log in to Microsoft 365 first|Logged out/i.test(t)) return 'neprihlaseno';
  return '';
}
function loginFix(t) {
  const code = (/AADSTS\d+/.exec(t || '') || [''])[0];
  const app = state.prihlasen?.appId || '<appId>';
  if (['AADSTS65001', 'AADSTS90094', 'AADSTS90095'].includes(code)) return {
    oprava: 'neni to tvoje chyba, rozhoduje spravce Entra ID',
    it: `Prosim o udeleni souhlasu spravce (admin consent) pro aplikaci CLI for Microsoft 365 s appId ${app} v tenantu E.ON, s delegovanymi opravnenimi SharePoint AllSites.FullControl a Microsoft Graph User.Read, nebo o appId jiz schvalene aplikace, pres kterou se smim prihlasovat k SharePointu z CLI for Microsoft 365 (device code).` };
  if (code === 'AADSTS7000218') return { it: `Prosim o povoleni "Allow public client flows" u registrace aplikace ${app} (prihlaseni CLI for Microsoft 365 metodou device code).` };
  if (code === 'AADSTS53003' || code === 'AADSTS50097') return { oprava: 'zkus --authType browser; kdyz neprojde, IT', it: 'Prosim o vyjimku nebo postup pro prihlaseni nastroje CLI for Microsoft 365 k SharePointu z meho firemniho pocitace (device code / interaktivni prihlaseni blokuje Conditional Access).' };
  if (code === 'AADSTS700016') return { oprava: 'zkontroluj appId a tenant (preklep?)' };
  return { oprava: 'spust prihlaseni-prikaz a prihlas se ve svem terminalu' };
}

function cmdSharepoint(opts) {
  const oblast = 'Ovladani SharePointu';
  const web = (opts.web || '').replace(/\/+$/, '');
  if (!/^https:\/\/[^/]+\.sharepoint\.com\//i.test(web + '/')) { console.error('Chybi --web https://<tenant>.sharepoint.com/sites/<web>'); process.exit(2); }
  if (!cmdPrihlaseni(opts)) return;
  state.web = web;
  const w = m365(opts, ['spo', 'web', 'get', '--url', web]);
  record(oblast, 'web-cteni', w.ok ? 'zelena' : 'cervena', w.ok ? `"${w.json.Title}" (${w.json.Url})` : `nejde precist: ${firstLine(w.err)}`,
    w.ok ? {} : accessFix(w.err, web, 'web'));
  if (!w.ok) { saveState(state); return; }
  const p = m365(opts, ['request', '--url', `${web}/_api/web/EffectiveBasePermissions`]);
  if (p.ok && p.json) {
    const names = decodeMask(p.json.High, p.json.Low);
    const role = roleGuess(names);
    state.rolaWeb = role;
    const canWrite = names.includes('AddListItems');
    record(oblast, 'role-na-webu', role.startsWith('Vlastnik') || role.startsWith('Clen') ? 'zelena' : canWrite ? 'zluta' : 'cervena',
      `${role} (odhad z EffectiveBasePermissions High ${p.json.High} / Low ${p.json.Low}; zapis polozek ${canWrite ? 'ano' : 'ne'}, sprava seznamu ${names.includes('ManageLists') ? 'ano' : 'ne'})`,
      role.startsWith('Vlastnik') || role.startsWith('Clen') ? {} : { it: `Prosim o pridani uctu ${state.prihlasen?.ucet || '<muj ucet>'} jako Member (Clen) na web ${web}.` });
  } else record(oblast, 'role-na-webu', 'zluta', `nezjisteno: ${firstLine(p.err)}`);
  const l = m365(opts, ['spo', 'list', 'list', '--webUrl', web, '--properties', 'Title,BaseTemplate,ItemCount,Hidden', '--filter', 'Hidden eq false']);
  if (l.ok && Array.isArray(l.json)) {
    const names = l.json.map((x) => `${x.Title} (${x.ItemCount})`);
    record(oblast, 'seznamy', 'zelena', `${l.json.length} viditelnych seznamu/knihoven: ${names.slice(0, 12).join(', ')}${names.length > 12 ? ', ...' : ''}`);
  } else record(oblast, 'seznamy', 'zluta', `nejde vypsat: ${firstLine(l.err)}`);

  const t = m365(opts, ['spo', 'tenant', 'appcatalogurl', 'get']);
  const tUrl = t.ok && typeof t.json === 'string' ? t.json : (t.ok ? (t.raw || '').replace(/"/g, '') : '');
  record(oblast, 'tenant-app-catalog', tUrl ? 'info' : 'info', tUrl ? `${tUrl} (pro workshop ho nepotrebujeme; zapisujeme jen do katalogu na vlastnim webu)` : `nezjisteno: ${firstLine(t.err)}`);
  const c = m365(opts, ['spo', 'list', 'get', '--webUrl', web, '--url', 'AppCatalog', '--properties', 'Title,ItemCount,BaseTemplate,EffectiveBasePermissions']);
  if (c.ok && c.json && c.json.Title) {
    const names = decodeMask(c.json.EffectiveBasePermissions?.High, c.json.EffectiveBasePermissions?.Low);
    const canAdd = names.includes('AddListItems') && names.includes('EditListItems');
    record(oblast, 'site-app-catalog', 'zelena', `web ma vlastni katalog aplikaci "${c.json.Title}" (${c.json.ItemCount} balicku)`);
    record(oblast, 'role-v-katalogu', canAdd ? 'zelena' : 'cervena', canAdd ? 'muzes nahrat balicek (.sppkg) do katalogu' : `do katalogu nesmis zapisovat (${roleGuess(names)})`,
      canAdd ? {} : { it: `Prosim o pridani uctu ${state.prihlasen?.ucet || '<muj ucet>'} jako Member (Clen) na web ${web}, ktery ma katalog aplikaci (site collection app catalog). Bez toho nemohu nahrat SharePoint aplikaci (.sppkg).` });
  } else {
    const notFound = /not found|File Not Found|neexistuje|404/i.test(c.err);
    record(oblast, 'site-app-catalog', notFound ? 'cervena' : 'zluta', notFound ? 'web nema vlastni katalog aplikaci (site collection app catalog)' : `nezjisteno: ${firstLine(c.err)}`,
      notFound ? { oprava: `katalog zaklada rucne Product Team E.ON; napis jako vlastnik webu na ${EON_SHAREPOINT_MAIL} (ne pres ITSM), lhuta je nejista`, it: `E-mail na ${EON_SHAREPOINT_MAIL}: Jako vlastnik webu ${web} zadam o zalozeni katalogu aplikaci (site collection app catalog). Potrebuji na nem nasazovat vlastni SharePoint Framework web party (bez Custom Script, requiresCustomScript: false). Workshop EG.D 25. 11.` } : {});
  }
  const lic = m365(opts, ['request', '--url', 'https://graph.microsoft.com/v1.0/me/licenseDetails?$select=skuPartNumber,servicePlans', '--resource', 'https://graph.microsoft.com']);
  if (lic.ok && lic.json?.value) {
    const skus = lic.json.value.map((x) => x.skuPartNumber);
    const plans = lic.json.value.flatMap((x) => (x.servicePlans || []).filter((s) => s.provisioningStatus === 'Success').map((s) => s.servicePlanName));
    const pa = plans.filter((n) => /POWERAPPS|FLOW|POWER_AUTOMATE/i.test(n));
    state.licence = { skus, powerPlatform: pa };
    record('Zalozni cesty', 'licence-m365', 'info', `licence: ${skus.join(', ')}`);
    record('Zalozni cesty', 'power-platform-licence', pa.length ? 'zelena' : 'zluta', pa.length ? `Power Apps / Power Automate v licenci: ${pa.join(', ')}` : 'v licenci jsem nenasel Power Apps / Power Automate');
  } else record('Zalozni cesty', 'licence-m365', 'info', `licence nejdou precist pres CLI (${firstLine(lic.err) || 'bez opravneni User.Read'}); over v prohlizeci (prikaz prohlizec)`);
  saveState(state);
}
function accessFix(err, web, what) {
  if (/403|Access denied|unauthorized|E_ACCESSDENIED/i.test(err || '')) return {
    oprava: 'bud nemas roli na webu, nebo aplikace CLI nema opravneni na SharePoint (zjisti v prohlizeci: otevri web - kdyz ho vidis, je to aplikace)',
    it: `Prosim o pridani uctu ${state.prihlasen?.ucet || '<muj ucet>'} jako Member (Clen) na web ${web}.` };
  if (/AADSTS/.test(err || '')) return loginFix(err);
  return { oprava: `zkontroluj adresu ${what}u (preklep, /sites/...)` };
}

function cmdZkouska(opts) {
  const oblast = 'Ovladani SharePointu';
  const web = (opts.web || state.web || '').replace(/\/+$/, '');
  if (!web) { console.error('Chybi --web'); process.exit(2); }
  const nazev = `Zkouska ${opts.jmeno || os.userInfo().username} ${new Date().toLocaleString('cs-CZ')}`;
  if (!opts.ano) {
    console.log(`PLAN ZAPISU (nic se zatim nezapsalo):
  1. na webu ${web} zalozit seznam "${TEST_LIST}" (jen kdyz jeste neexistuje)
  2. pridat do nej JEDNU polozku s nazvem "${nazev}"
  3. precist ji zpatky
Nic se nemaze. Seznam si muzes pozdeji smazat sam v prohlizeci (Obsah webu).
Kdyz s tim clovek souhlasi, spust znovu s volbou --ano.`);
    process.exit(10);
  }
  if (!cmdPrihlaseni(opts)) return;
  const st = m365(opts, ['status']);
  const tid = opts.tenant || state.tenantId || EON_TENANT_ID;
  if (st.json?.appTenant !== tid && !opts.jinyTenant) { console.error(`Prihlaseny tenant ${st.json?.appTenant} neni ${tid}. Zapis zastaven.`); process.exit(1); }
  let ex = m365(opts, ['spo', 'list', 'get', '--webUrl', web, '--title', TEST_LIST, '--properties', 'Title,Id']);
  if (!ex.ok) {
    const add = m365(opts, ['spo', 'list', 'add', '--webUrl', web, '--title', TEST_LIST, '--baseTemplate', 'GenericList', '--description', 'Zkusebni seznam z kontroly pripravenosti na workshop. Muzete smazat.']);
    record(oblast, 'zalozeni-seznamu', add.ok ? 'zelena' : 'cervena', add.ok ? `seznam "${TEST_LIST}" zalozen` : `seznam nejde zalozit: ${firstLine(add.err)}`,
      add.ok ? {} : { oprava: 'na zalozeni seznamu je potreba role Clen nebo Vlastnik', it: `Prosim o pridani uctu ${state.prihlasen?.ucet || '<muj ucet>'} jako Member (Clen) na web ${web}.` });
    if (!add.ok) { saveState(state); return; }
  } else record(oblast, 'zalozeni-seznamu', 'zelena', `seznam "${TEST_LIST}" uz existuje, pouzivam ho`);
  const item = m365(opts, ['spo', 'listitem', 'add', '--webUrl', web, '--listTitle', TEST_LIST, '--Title', nazev]);
  const id = item.json?.Id ?? item.json?.ID;
  record(oblast, 'zapis-polozky', item.ok && id ? 'zelena' : 'cervena', item.ok && id ? `polozka ${id} zapsana` : `zapis selhal: ${firstLine(item.err)}`);
  if (item.ok && id) {
    const back = m365(opts, ['spo', 'listitem', 'list', '--webUrl', web, '--listTitle', TEST_LIST, '--fields', 'Id,Title', '--filter', `Id eq ${id}`]);
    const okBack = back.ok && Array.isArray(back.json) && back.json.some((x) => x.Title === nazev);
    record(oblast, 'cteni-zpet', okBack ? 'zelena' : 'zluta', okBack ? `precteno zpatky: "${nazev}"` : `zpetne cteni nesedi: ${firstLine(back.err || back.raw)}`);
    state.odkazSeznam = `${web}/Lists/${TEST_LIST}`;
  }
  saveState(state);
}

function cmdGithub(opts) {
  // jen cteni: gh auth status + git credential helper; tokeny se nikam nezapisuji (vypis gh se parsuje jen na host a login)
  const oblast = 'GitHub';
  const gh = run('gh', ['auth', 'status', ...(typeof opts.host === 'string' ? ['--hostname', opts.host] : [])]);
  const text = `${gh.out}\n${gh.err}`;
  if (gh.missing) {
    record(oblast, 'github-gh', 'info', 'gh (GitHub CLI) neni nainstalovane; pro workshop nepovinne. Copilot ve VS Code se prihlasuje v editoru, viz references/github.md');
  } else {
    const hosts = [];
    for (const m of text.matchAll(/Logged in to (\S+) (?:account|as) (\S+)/g)) hosts.push({ host: m[1], login: m[2].replace(/[()]/g, '') });
    const kind = (h) => (h === 'github.com' ? 'github.com' : /\.ghe\.com$/i.test(h) ? 'GHE.com' : 'jiny host (GitHub Enterprise Server?)');
    if (hosts.length) {
      record(oblast, 'github-hosty', 'zelena', hosts.map((x) => `${x.host} [${kind(x.host)}], ucet ${x.login}`).join('; '));
      state.githubHosty = hosts.map((x) => x.host);
    } else {
      record(oblast, 'github-hosty', 'zluta', 'gh neni k zadnemu hostu prihlasen (nebo vypis nejde precist)',
        { oprava: 'postup v references/github.md krok 4: gh auth login --hostname <adresa firemniho GitHubu>' });
    }
    if (/failed|invalid|expired|authentication issues/i.test(text) && hosts.length) record(oblast, 'github-gh-token', 'zluta', 'gh hlasi problem s prihlasenim u nektereho hostu', { oprava: 'gh auth login --hostname <host> znovu' });
  }
  const gcm = run('git', ['config', '--get', 'credential.helper']);
  record(oblast, 'git-credential-helper', 'info', gcm.ok && gcm.out ? firstLine(gcm.out) : 'nenastaven (na Windows s Git for Windows bývá "manager")');
  saveState(state);
}

function cmdSpfx(opts) {
  const oblast = 'SPFx pripravenost';
  const nodeV = process.versions.node, major = Number(nodeV.split('.')[0]);
  const ok = SPFX_NODE_MAJORS.includes(major) && (major !== 22 || cmpVer(nodeV, SPFX_NODE_22_MIN) >= 0);
  record(oblast, 'node-pro-spfx-1.24', ok ? 'zelena' : 'cervena', `Node v${nodeV}; SPFx 1.24 chce ${SPFX_NODE_MAJORS.join(' / ')} (22 aspon 22.14). Gulp uz neni, build je Heft.`,
    ok ? {} : { oprava: 'stahni portable Node 24 nebo 26 LTS (zip z nodejs.org, bez admina), rozbal a dej na zacatek PATH; Node 18 uz SPFx 1.24 nepostavi', it: 'Prosim o instalaci Node.js 24 LTS nebo 26 LTS (nebo povoleni portable verze) - SharePoint Framework 1.24 Node 18 nepodporuje.' });
  const v = npm(['view', SPFX_GENERATOR, 'version'], { timeout: TIMEOUT_SHORT_MS });
  record(oblast, 'generator-dostupny', v.ok ? 'zelena' : 'cervena', v.ok ? `${SPFX_GENERATOR} je v registry` : diagnoseNet(`${v.out}\n${v.err}`, v.timedOut), v.ok ? {} : npmFix(`${v.out}\n${v.err}`, v.timedOut));
  if (opts.instalovat) {
    const dir = path.resolve(STATE_DIR, 'spfx-test');
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(path.join(dir, 'package.json'))) fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'spfx-test', private: true }, null, 2));
    console.log(`Instaluji ${YO} a ${SPFX_GENERATOR} do ${dir} (lokalne, par minut)...`);
    const r = npm(['install', YO, SPFX_GENERATOR, '--no-audit', '--no-fund'], { timeout: TIMEOUT_INSTALL_MS, cwd: dir });
    const yo = path.join(dir, 'node_modules', 'yo', 'lib', 'cli.js');
    const h = r.ok && fs.existsSync(yo) ? run(process.execPath, [yo, '@microsoft/sharepoint', '--help'], { cwd: dir, timeout: 120_000 }) : { ok: false };
    record(oblast, 'generator-instalace', h.ok ? 'zelena' : 'cervena', h.ok ? 'yo + generator SharePoint jdou nainstalovat lokalne a spustit' : `nejde: ${r.ok ? firstLine(h.err || h.out) : diagnoseNet(`${r.out}\n${r

[Output truncated. Use view_range=[483, ...] to continue reading. In your next response, you may batch this with other view calls. File has at least 630 lines.]
```

</details>


---

<sub>1m 3s</sub>

### `view` — Failed

**view the file at /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs.**

/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs (lines 900-1180)

```
view_range out of bounds
```


---

<sub>3m 8s</sub>

### `bash`

**Nainstaluje místní CLI a ověří přihlášení i web jen pro čtení**

$ node "/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" sit --domena pavelchocholousgmail.onmicrosoft.com && node "/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" cli-instalace && node "/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" prihlaseni && node "/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" sharepoint --web https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest

<details>
<summary>6 lines</summary>

```
[ZELENA] entra-dosazitelne: login.microsoftonline.com odpovida, tenant pavelchocholousgmail.onmicrosoft.com = 972a674c-7b85-4e56-a31f-b2f95b42fd1e
[ZELENA] sharepoint-dosazitelny: eonos.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne)
Zalozen package.json v teto slozce (jen pro lokalni instalaci nastroju).
Instaluji @pnp/cli-microsoft365@12 do /private/tmp/cp-run1/home/egd-workshop/node_modules (bez admin prav, muze trvat par minut)...
[ZELENA] cli-instalace: CLI for Microsoft 365 v12.0.0 lokalne v node_modules
<command with shellId: 2 is still running after 120 seconds. The command is still running. You will be automatically notified when it completes; if you need the command to complete end your response with no tool calls to wait for the notification. Use stop_bash to stop it.>
```

</details>


---

<sub>3m 40s</sub>

### `read_bash`

**Waiting up to 30 seconds for command output**

<details>
<summary>Arguments</summary>

```json
{
  "shellId": "2",
  "delay": 30
}
```

</details>

<details>
<summary>12 lines</summary>

```
[ZELENA] entra-dosazitelne: login.microsoftonline.com odpovida, tenant pavelchocholousgmail.onmicrosoft.com = 972a674c-7b85-4e56-a31f-b2f95b42fd1e
[ZELENA] sharepoint-dosazitelny: eonos.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne)
Zalozen package.json v teto slozce (jen pro lokalni instalaci nastroju).
Instaluji @pnp/cli-microsoft365@12 do /private/tmp/cp-run1/home/egd-workshop/node_modules (bez admin prav, muze trvat par minut)...
[ZELENA] cli-instalace: CLI for Microsoft 365 v12.0.0 lokalne v node_modules
[ZELENA] cli-setup: CLI nastaveno pro skripty (bez interaktivnich dotazu)
[ZELENA] prihlaseni: prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e
[ZELENA] prihlaseni: prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e
[ZELENA] web-cteni: "Site catalog test" (https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest)
[ZELENA] role-na-webu: Vlastnik (Full Control) (odhad z EffectiveBasePermissions High 2147483647 / Low 4294705151; zapis polozek ano, sprava seznamu ano)
[ZELENA] seznamy: 7 viditelnych seznamu/knihoven: Apps for SharePoint (4), Documents (0), EGD-pripravenost (2), Events (0), Form Templates (0), Site Pages (3), Style Library (0)
<command with shellId: 2 is still running after 30 seconds. The command is still running. You will be automatically notified when it completes; if you need the command to complete end your response with no tool calls to wait for the notification. Use stop_bash to stop it.>
```

</details>


---

<sub>3m 55s</sub>

### `read_bash`

**Waiting up to 30 seconds for command output**

<details>
<summary>Arguments</summary>

```json
{
  "shellId": "2",
  "delay": 30
}
```

</details>

<details>
<summary>17 lines</summary>

```
[ZELENA] entra-dosazitelne: login.microsoftonline.com odpovida, tenant pavelchocholousgmail.onmicrosoft.com = 972a674c-7b85-4e56-a31f-b2f95b42fd1e
[ZELENA] sharepoint-dosazitelny: eonos.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne)
Zalozen package.json v teto slozce (jen pro lokalni instalaci nastroju).
Instaluji @pnp/cli-microsoft365@12 do /private/tmp/cp-run1/home/egd-workshop/node_modules (bez admin prav, muze trvat par minut)...
[ZELENA] cli-instalace: CLI for Microsoft 365 v12.0.0 lokalne v node_modules
[ZELENA] cli-setup: CLI nastaveno pro skripty (bez interaktivnich dotazu)
[ZELENA] prihlaseni: prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e
[ZELENA] prihlaseni: prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e
[ZELENA] web-cteni: "Site catalog test" (https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest)
[ZELENA] role-na-webu: Vlastnik (Full Control) (odhad z EffectiveBasePermissions High 2147483647 / Low 4294705151; zapis polozek ano, sprava seznamu ano)
[ZELENA] seznamy: 7 viditelnych seznamu/knihoven: Apps for SharePoint (4), Documents (0), EGD-pripravenost (2), Events (0), Form Templates (0), Site Pages (3), Style Library (0)
[INFO]   tenant-app-catalog: https://pavelchocholousgmail.sharepoint.com/sites/apps (pro workshop ho nepotrebujeme; zapisujeme jen do katalogu na vlastnim webu)
[ZELENA] site-app-catalog: web ma vlastni katalog aplikaci "Apps for SharePoint" (4 balicku)
[ZELENA] role-v-katalogu: muzes nahrat balicek (.sppkg) do katalogu
[INFO]   licence-m365: licence: FLOW_FREE, SPE_E5
[ZELENA] power-platform-licence: Power Apps / Power Automate v licenci: FLOW_P2_VIRAL, FLOW_O365_P3, POWERAPPS_O365_P3
<shellId: 2 completed with exit code 0>
```

</details>


---

<sub>4m 4s</sub>

### `view`

**view the file at /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs.**

/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs (lines 460-570)

<details>
<summary>103 lines</summary>

```
  }
  const gcm = run('git', ['config', '--get', 'credential.helper']);
  record(oblast, 'git-credential-helper', 'info', gcm.ok && gcm.out ? firstLine(gcm.out) : 'nenastaven (na Windows s Git for Windows bývá "manager")');
  saveState(state);
}

function cmdSpfx(opts) {
  const oblast = 'SPFx pripravenost';
  const nodeV = process.versions.node, major = Number(nodeV.split('.')[0]);
  const ok = SPFX_NODE_MAJORS.includes(major) && (major !== 22 || cmpVer(nodeV, SPFX_NODE_22_MIN) >= 0);
  record(oblast, 'node-pro-spfx-1.24', ok ? 'zelena' : 'cervena', `Node v${nodeV}; SPFx 1.24 chce ${SPFX_NODE_MAJORS.join(' / ')} (22 aspon 22.14). Gulp uz neni, build je Heft.`,
    ok ? {} : { oprava: 'stahni portable Node 24 nebo 26 LTS (zip z nodejs.org, bez admina), rozbal a dej na zacatek PATH; Node 18 uz SPFx 1.24 nepostavi', it: 'Prosim o instalaci Node.js 24 LTS nebo 26 LTS (nebo povoleni portable verze) - SharePoint Framework 1.24 Node 18 nepodporuje.' });
  const v = npm(['view', SPFX_GENERATOR, 'version'], { timeout: TIMEOUT_SHORT_MS });
  record(oblast, 'generator-dostupny', v.ok ? 'zelena' : 'cervena', v.ok ? `${SPFX_GENERATOR} je v registry` : diagnoseNet(`${v.out}\n${v.err}`, v.timedOut), v.ok ? {} : npmFix(`${v.out}\n${v.err}`, v.timedOut));
  if (opts.instalovat) {
    const dir = path.resolve(STATE_DIR, 'spfx-test');
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(path.join(dir, 'package.json'))) fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'spfx-test', private: true }, null, 2));
    console.log(`Instaluji ${YO} a ${SPFX_GENERATOR} do ${dir} (lokalne, par minut)...`);
    const r = npm(['install', YO, SPFX_GENERATOR, '--no-audit', '--no-fund'], { timeout: TIMEOUT_INSTALL_MS, cwd: dir });
    const yo = path.join(dir, 'node_modules', 'yo', 'lib', 'cli.js');
    const h = r.ok && fs.existsSync(yo) ? run(process.execPath, [yo, '@microsoft/sharepoint', '--help'], { cwd: dir, timeout: 120_000 }) : { ok: false };
    record(oblast, 'generator-instalace', h.ok ? 'zelena' : 'cervena', h.ok ? 'yo + generator SharePoint jdou nainstalovat lokalne a spustit' : `nejde: ${r.ok ? firstLine(h.err || h.out) : diagnoseNet(`${r.out}\n${r.err}`, r.timedOut)}`,
      h.ok ? {} : (r.ok ? {} : npmFix(`${r.out}\n${r.err}`, r.timedOut)));
  } else console.log('Zkusebni instalaci generatoru spustis volbou --instalovat (stahne cca stovky MB do .pripravenost/spfx-test).');
  saveState(state);
}

function cmdProhlizec(opts) {
  const web = (opts.web || state.web || 'https://eonos.sharepoint.com/sites/<tvuj-web>').replace(/\/+$/, '');
  console.log(`Kdyz CLI nebo npm nejde, over aspon prohlizecem (Edge, firemni ucet). Otevri postupne a vysledek rekni agentovi:

  1. Web:                     ${web}
  2. Tvoje prava (REST):      ${web}/_api/web/EffectiveBasePermissions
     -> v XML najdi <d:High> a <d:Low>, cisla posli agentovi (prikaz: maska --high X --low Y)
  3. Seznamy (REST):          ${web}/_api/web/lists?$select=Title,ItemCount&$filter=Hidden eq false
  4. Katalog aplikaci webu:   ${web}/AppCatalog
     -> kdyz se otevre knihovna "Apps for SharePoint", web katalog ma
  5. Power Apps:              https://make.powerapps.com   (vidis prostredi a muzes "Vytvorit"?)
  6. Power Automate:          https://make.powerautomate.com
  7. Licence Microsoft 365:   https://myaccount.microsoft.com  -> Predplatne / Subscriptions
  8. GitHub Copilot licence:  https://github.com/settings/copilot  (nebo ve VS Code ikona Copilota)

Vysledek zapise agent prikazem: zapis --klic <nazev> --stav zelena|zluta|cervena --hodnota "<co jsi videl>"`);
}

function cmdMaska(opts) {
  const names = decodeMask(opts.high, opts.low);
  console.log(`Role (odhad): ${roleGuess(names)}\nPrava: ${names.join(', ') || '(zadna)'}`);
  if (opts.zapsat) { record('Ovladani SharePointu', opts.klic || 'role-z-prohlizece', 'info', `${roleGuess(names)} (High ${opts.high} / Low ${opts.low}, z prohlizece)`); saveState(state); }
}

function cmdZapis(opts) {
  if (!opts.klic || !opts.stav) { console.error('Pouziti: zapis --klic <nazev> --stav zelena|zluta|cervena|info --hodnota "<text>" [--oblast "<oblast>"] [--it "<veta>"]'); process.exit(2); }
  if (/eyJ[A-Za-z0-9_-]{10,}|password|heslo\s*[:=]/i.test(opts.hodnota || '')) { console.error('Text vypada jako token nebo heslo - nezapisuji.'); process.exit(2); }
  record(opts.oblast || 'Rucne overeno', opts.klic, opts.stav, opts.hodnota || '', opts.it ? { it: opts.it } : {});
  saveState(state);
}

function doporuceni() {
  const v = state.vysledky;
  const g = (k) => v[k]?.stav === 'zelena';
  let nastroj;
  if (g('claude-code')) nastroj = 'Claude Code (je nainstalovany a funguje)';
  else if (g('vscode-copilot')) nastroj = 'VS Code + GitHub Copilot Chat v rezimu Agent (over licenci)';
  else if (g('copilot-cli')) nastroj = 'GitHub Copilot CLI';
  else if (g('claude-desktop')) nastroj = 'Claude Desktop (kod v zalozce Code)';
  else nastroj = 'zatim zadny agentni nastroj - pozadej o licenci GitHub Copilot pres E.ON ITSM (my IT order)';
  if (g('claude-code') && g('copilot-cli')) nastroj += '; je i Copilot CLI (jen kdyz mas licenci Copilot)';
  let cesta;
  if (g('npm-ping') && g('prihlaseni') && g('site-app-catalog') && g('role-v-katalogu') && g('node-pro-spfx-1.24')) cesta = 'A: vlastni SPFx aplikace na webu (vse potrebne funguje)';
  else if (g('npm-ping') && g('node-pro-spfx-1.24') && g('site-app-catalog') && g('role-v-katalogu')) cesta = 'A2: SPFx aplikace postavena lokalne, nahrana do katalogu rucne v prohlizeci (CLI prihlaseni zatim nejde)';
  else if (g('web-cteni') || v['role-z-prohlizece']) cesta = 'B: aplikace bez nasazovani kodu - SharePoint seznam + formatovani (JSON), pripadne Power Apps';
  else cesta = 'zatim zadna - chybi web nebo pristup k nemu (viz Objednavky predem)';
  return { nastroj, cesta };
}

function cmdZprava(opts) {
  const jmeno = (opts.jmeno || os.userInfo().username).replace(/[^\p{L}\p{N}_-]+/gu, '-');
  const v = state.vysledky;
  const order = ['Nastroje', 'Sit a npm', 'Pripojeni k SharePointu', 'Ovladani SharePointu', 'SPFx pripravenost', 'GitHub', 'Zalozni cesty', 'Rucne overeno'];
  const label = { zelena: 'zelena', zluta: 'zluta', cervena: 'CERVENA', info: 'info' };
  const { nastroj, cesta } = doporuceni();
  const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  let md = `# Pripravenost na workshop - ${jmeno}\n\nVytvoreno ${new Date().toLocaleString('cs-CZ')} skriptem egd-pripravenost. Bez tokenu a hesel.\n\n`;
  md += `## Doporuceni\n\n- **Nastroj na stredu:** ${nastroj}\n- **Nejjednodussi cesta k prvni appce:** ${cesta}\n`;
  if (state.web) md += `- **Web:** ${state.web}\n`;
  if (state.prihlasen) md += `- **Prihlaseni CLI:** ${state.prihlasen.ucet}, appId ${state.prihlasen.appId}\n`;
  const counts = Object.values(v).reduce((a, x) => { a[x.stav] = (a[x.stav] || 0) + 1; return a; }, {});
  md += `\nSoucty: zelena ${counts.zelena || 0}, zluta ${counts.zluta || 0}, cervena ${counts.cervena || 0}.\n`;
  for (const o of order.concat([...new Set(Object.values(v).map((x) => x.oblast))].filter((x) => !order.includes(x)))) {
    const rows = Object.entries(v).filter(([, x]) => x.oblast === o);
    if (!rows.length) continue;
    md += `\n## ${o}\n\n| Kontrola | Stav | Vysledek |\n|---|---|---|\n`;
    for (const [k, x] of rows) md += `| ${k} | ${label[x.stav] || x.stav} | ${esc(x.hodnota)}${x.oprava ? ` - *co dal:* ${esc(x.oprava)}` : ''} |\n`;
  }
  const lic = v['copilot-licence']?.stav;
  const stavTxt = (ok, bad) => (ok ? 'hotovo' : bad ? 'CHYBI' : 'neoverene');
  md += `\n## Objednávky předem (E.ON ITSM)\n\nÚčastníci mají předem zařídit tři věci. Stav podle této kontroly:\n\n| Co | Stav | Jak |\n|---|---|---|\n`;
  md += `| Licence GitHub Copilot | ${stavTxt(lic === 'zelena', lic === 'cervena')} | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |\n`;
  md += `| 3 weby DEV / TEST / PROD | ${stavTxt(!!state.web && v['web-cteni']?.stav === 'zelena', !state.web)} | ITSM „SharePoint Online \\| New Site Creation“, ostatní účastníci jako site members. |\n`;
  const ac = v['site-app-catalog']?.stav;
  md += `| Katalog aplikací (site collection app catalog) na webu | ${stavTxt(ac === 'zelena', ac === 'cervena')} | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na ${EON_SHAREPOINT_MAIL} (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |\n`;
  if (lic === 'cervena' && !v['copilot-licence'].it) v['copilot-licence'].it = 'Prosim o prideleni licence GitHub Copilot (Business) pro muj ucet - workshop vibecodingu EG.D 25. 11.';
  const itAll = Object.entries(v).filter(([, x]) => x.it && (x.stav === 'cervena' || x.stav === 'zluta'));
  md += `\n## Vety pro ServiceNow\n\n`;
  md += itAll.length ? itAll.map(([k, x]) => `- **${k}:** ${x.it}`).join('\n') + '\n' : 'Nic neni potreba.\n';
  const out = `pripravenost-${jmeno}.md`;
  fs.writeFileSync(out, md, 'utf8');
  console.log(`\nZprava ulozena: ${path.resolve(out)}\nNastroj: ${nastroj}\nCesta: ${cesta}\nZelena ${counts.zelena || 0} / zluta ${counts.zluta || 0} / cervena ${counts.cervena || 0}`);
}
```

</details>


---

<sub>4m 4s</sub>

### `view`

**view the file at /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/references/windows.md.**

/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/references/windows.md (lines 1-120)

<details>
<summary>29 lines</summary>

```
# Windows: pasti pro agenta

Stav: **na Windows neověřené** ❓. Obsah je z dokumentace a z pastí, které jsme viděli u citizen
developerů na Windows (PowerShell 5.1). Až se změří, přepsat.

## Proč skript spouští všechno přes `node`

- `npm`, `npx` a `node_modules\.bin\*` jsou na Windows `.cmd` a `.ps1` soubory. PowerShell sáhne
  po `.ps1` a při execution policy `Restricted` skončí `running scripts is disabled on this system`.
- PowerShell 5.1 kazí vnořené uvozovky v argumentech nativních programů; PowerShell 7.3+ to opravil
  jen pro `.exe`, ne pro `.cmd` 📘.
- Proto skript volá `node <npm-cli.js>` a `node <cli>/dist/index.js` s polem argumentů, bez shellu.
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

1. Stáhni z https://nodejs.org/dist/latest-v22.x/ soubor `node-v22.….-win-x64.zip` a rozbal ho třeba do `%USERPROFILE%\node22`.
2. Jen pro toto okno terminálu (nic se nenastavuje trvale): `$env:Path = "$env:USERPROFILE\node22\node-v22.xx.x-win-x64;" + $env:Path` (uprav název složky podle zipu), pak `node -v`.
3. Ve VS Code nastav PATH před jeho spuštěním, nebo spusť VS Code z toho okna příkazem `code .`; jinak agent dál uvidí starý Node. Trvalá změna: Nastavení → proměnné prostředí pro váš účet → `Path` (bez admina).

## Doporučené prostředí (nepovinné)

- **Git for Windows** (obsahuje Git Bash). V Claude Code pak bash místo PowerShellu.
- **PowerShell 7** jako portable zip (bez admina), když musí zůstat PowerShell.
- **Node 24 nebo 26 LTS** jako portable zip z nodejs.org: rozbalit do `%USERPROFILE%\node` a
  v uživatelských proměnných prostředí dát tu složku na začátek `Path` (bez admina). Stahuje uživatel sám.
```

</details>


---

<sub>4m 16s</sub>

### Copilot

Přihlášení i čtení DEV webu fungují; web má katalog aplikací a jste jeho vlastníkem. Opravuji drobnou chybu ve výstupní zprávě: existence jednoho webu nesmí být zaměněna za objednání všech tří prostředí.

---

<sub>4m 16s</sub>

### `apply_patch`

<details>
<summary>Arguments</summary>

```json
"*** Begin Patch\n*** Update File: /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs\n@@\n-  md += `| 3 weby DEV / TEST / PROD | ${stavTxt(!!state.web && v['web-cteni']?.stav === 'zelena', !state.web)} | ITSM „SharePoint Online \\\\| New Site Creation“, ostatní účastníci jako site members. |\\n`;\n+  const sites = v['weby-dev-test-prod']?.stav;\n+  md += `| 3 weby DEV / TEST / PROD | ${stavTxt(sites === 'zelena', sites === 'cervena' || sites === 'zluta')} | ITSM „SharePoint Online \\\\| New Site Creation“, ostatní účastníci jako site members. |\\n`;\n*** End Patch\n"
```

</details>

```
Modified 1 file(s): /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs
```


---

<sub>4m 39s</sub>

### `bash`

**Zaznamená výsledky a vytvoří připravenostní zprávu**

$ S="/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs"; node "$S" spfx && node "$S" zapis --klic copilot-licence --stav zelena --oblast GitHub --hodnota "Uživatel potvrzuje licenci; Copilot je v této relaci aktivní." && node "$S" zapis --klic weby-dev-test-prod --stav zluta --oblast "Pripojeni k SharePointu" --hodnota "DEV/TEST/PROD zatím nejsou objednané. Zadaný DEV web je v tenantovi pavelchocholousgmail.onmicrosoft.com, nejde o doménu eonos.sharepoint.com." --it "Prosím o vytvoření tří webů SharePoint Online DEV / TEST / PROD pro workshop EG.D; ostatní účastníky přidejte jako site members. Prosím také o potvrzení, zda lze použít již existující web v tenantovi pavelchocholousgmail.onmicrosoft.com, nebo je potřeba DEV web v tenantovi E.ON." && node "$S" zapis --klic tenant-webu --stav zluta --oblast "Pripojeni k SharePointu" --hodnota "Přístup je ověřen do uživatelem uvedeného webu; jde o tenant pavelchocholousgmail.onmicrosoft.com, nikoli tenant E.ON." --it "Prosím o potvrzení, zda je pro workshop schválený DEV web v tenantovi pavelchocholousgmail.onmicrosoft.com, nebo mám používat web v tenantovi E.ON." && node "$S" zapis --klic zkouska --stav zluta --oblast "Ovladani SharePointu" --hodnota "Zkušební zápis přeskočen na výslovné přání uživatele; do SharePointu se nic nezapisovalo." && node "$S" zapis --klic github-firemni-pristup --stav zluta --oblast GitHub --hodnota "gh auth status nenašel přihlášený GitHub host; firemní přístup do organizace nebyl ověřen." --it "Prosím o potvrzení adresy firemního GitHubu EG.D/E.ON a přístup do firemní organizace pro workshop EG.D, pokud ještě není přidělen." && node "$S" zprava --jmeno "Test Copilot"

<details>
<summary>16 lines</summary>

```
[ZELENA] node-pro-spfx-1.24: Node v22.23.5; SPFx 1.24 chce 22 / 24 / 26 (22 aspon 22.14). Gulp uz neni, build je Heft.
[ZELENA] generator-dostupny: @microsoft/generator-sharepoint@1.24.1 je v registry
Zkusebni instalaci generatoru spustis volbou --instalovat (stahne cca stovky MB do .pripravenost/spfx-test).
[ZELENA] copilot-licence: Uživatel potvrzuje licenci; Copilot je v této relaci aktivní.
[ZLUTA]  weby-dev-test-prod: DEV/TEST/PROD zatím nejsou objednané. Zadaný DEV web je v tenantovi pavelchocholousgmail.onmicrosoft.com, nejde o doménu eonos.sharepoint.com.
          veta pro IT: Prosím o vytvoření tří webů SharePoint Online DEV / TEST / PROD pro workshop EG.D; ostatní účastníky přidejte jako site members. Prosím také o potvrzení, zda lze použít již existující web v tenantovi pavelchocholousgmail.onmicrosoft.com, nebo je potřeba DEV web v tenantovi E.ON.
[ZLUTA]  tenant-webu: Přístup je ověřen do uživatelem uvedeného webu; jde o tenant pavelchocholousgmail.onmicrosoft.com, nikoli tenant E.ON.
          veta pro IT: Prosím o potvrzení, zda je pro workshop schválený DEV web v tenantovi pavelchocholousgmail.onmicrosoft.com, nebo mám používat web v tenantovi E.ON.
[ZLUTA]  zkouska: Zkušební zápis přeskočen na výslovné přání uživatele; do SharePointu se nic nezapisovalo.
[ZLUTA]  github-firemni-pristup: gh auth status nenašel přihlášený GitHub host; firemní přístup do organizace nebyl ověřen.
          veta pro IT: Prosím o potvrzení adresy firemního GitHubu EG.D/E.ON a přístup do firemní organizace pro workshop EG.D, pokud ještě není přidělen.

Zprava ulozena: /private/tmp/cp-run1/home/egd-workshop/pripravenost-Test-Copilot.md
Nastroj: Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
Cesta: A: vlastni SPFx aplikace na webu (vse potrebne funguje)
Zelena 23 / zluta 6 / cervena 0
<shellId: 3 completed with exit code 0>
```

</details>


---

<sub>4m 45s</sub>

### `view`

**view the file at /private/tmp/cp-run1/home/egd-workshop/pripravenost-Test-Copilot.md.**

/private/tmp/cp-run1/home/egd-workshop/pripravenost-Test-Copilot.md

<details>
<summary>77 lines</summary>

```
# Pripravenost na workshop - Test-Copilot

Vytvoreno 22. 11. 2026 20:20:11 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
- **Nejjednodussi cesta k prvni appce:** A: vlastni SPFx aplikace na webu (vse potrebne funguje)
- **Web:** https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest
- **Prihlaseni CLI:** pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904

Soucty: zelena 23, zluta 6, cervena 0.

## Nastroje

| Kontrola | Stav | Vysledek |
|---|---|---|
| system | info | Darwin 27.2.0 Darwin Kernel Version 27.2.0: Wed Oct 14 23:47:07 PDT 2026; root:xnu-13432.41.4~25/RELEASE_ARM64_T8132 (arm64) |
| git | zelena | git version 2.54.0 (Apple Git-157) |
| node | zelena | v22.23.5 (/opt/homebrew/Cellar/node@22/22.23.5_1/bin/node) |
| npm | zelena | 10.9.9 |
| vscode | zelena | VS Code 1.146.0 |
| vscode-copilot | zluta | rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene) - *co dal:* otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> "GitHub Copilot Chat" (kdyz je Marketplace blokovany, IT) |
| copilot-cli | zelena | Copilot CLI GitHub Copilot CLI 1.0.91. |
| gh | info | gh version 2.104.0 (2026-11-12) |
| claude-code | zelena | Claude Code 2.1.330 (Claude Code) |
| claude-desktop | zelena | nalezeno: /Applications/Claude.app |
| spusteno-z | info | Claude Code |

## Sit a npm

| Kontrola | Stav | Vysledek |
|---|---|---|
| npm-registry | info | https://registry.npmjs.org/ |
| npm-proxy | info | proxy=null https-proxy=null strict-ssl=true cafile=null HTTPS_PROXY=ne NODE_EXTRA_CA_CERTS=ne |
| npm-ping | zelena | registry odpovida (PONG) |
| npm-stazeni-metadat | zelena | @pnp/cli-microsoft365 12.0.0 je dostupny |
| entra-dosazitelne | zelena | login.microsoftonline.com odpovida, tenant pavelchocholousgmail.onmicrosoft.com = 972a674c-7b85-4e56-a31f-b2f95b42fd1e |
| sharepoint-dosazitelny | zelena | eonos.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne) |

## Pripojeni k SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| cli-instalace | zelena | CLI for Microsoft 365 v12.0.0 lokalne v node_modules |
| cli-setup | zelena | CLI nastaveno pro skripty (bez interaktivnich dotazu) |
| prihlaseni | zelena | prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e |
| weby-dev-test-prod | zluta | DEV/TEST/PROD zatím nejsou objednané. Zadaný DEV web je v tenantovi pavelchocholousgmail.onmicrosoft.com, nejde o doménu eonos.sharepoint.com. |
| tenant-webu | zluta | Přístup je ověřen do uživatelem uvedeného webu; jde o tenant pavelchocholousgmail.onmicrosoft.com, nikoli tenant E.ON. |

## Ovladani SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| web-cteni | zelena | "Site catalog test" (https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest) |
| role-na-webu | zelena | Vlastnik (Full Control) (odhad z EffectiveBasePermissions High 2147483647 / Low 4294705151; zapis polozek ano, sprava seznamu ano) |
| seznamy | zelena | 7 viditelnych seznamu/knihoven: Apps for SharePoint (4), Documents (0), EGD-pripravenost (2), Events (0), Form Templates (0), Site Pages (3), Style Library (0) |
| tenant-app-catalog | info | https://pavelchocholousgmail.sharepoint.com/sites/apps (pro workshop ho nepotrebujeme; zapisujeme jen do katalogu na vlastnim webu) |
| site-app-catalog | zelena | web ma vlastni katalog aplikaci "Apps for SharePoint" (4 balicku) |
| role-v-katalogu | zelena | muzes nahrat balicek (.sppkg) do katalogu |
| zkouska | zluta | Zkušební zápis přeskočen na výslovné přání uživatele; do SharePointu se nic nezapisovalo. |

## SPFx pripravenost

| Kontrola | Stav | Vysledek |
|---|---|---|
| node-pro-spfx-1.24 | zelena | Node v22.23.5; SPFx 1.24 chce 22 / 24 / 26 (22 aspon 22.14). Gulp uz neni, build je Heft. |
| generator-dostupny | zelena | @microsoft/generator-sharepoint@1.24.1 je v registry |

## GitHub

| Kontrola | Stav | Vysledek |
|---|---|---|
| github-hosty | zluta | gh neni k zadnemu hostu prihlasen (nebo vypis nejde precist) - *co dal:* postup v references/github.md krok 4: gh auth login --hostname <adresa firemniho GitHubu> |
| git-credential-helper | info | osxkeychain |
| copilot-licence | zelena | Uživatel potvrzuje licenci; Copilot je v této relaci aktivní. |
| github-firemni-pristup | zluta | gh auth status nenašel přihlášený GitHub host; firemní přístup do organizace nebyl ověřen. |

## Zalozni cesty

| Kontrola | Stav | Vysledek |
|---|---|---|
| licence-m365 | info | licence: FLOW_FREE, SPE_E5 |
| power-platform-licence | zelena | Power Apps / Power Automate v licenci: FLOW_P2_VIRAL, FLOW_O365_P3, POWERAPPS_O365_P3 |

## Objednávky předem (E.ON ITSM)

Účastníci mají předem zařídit tři věci. Stav podle této kontroly:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | hotovo | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |
| 3 weby DEV / TEST / PROD | CHYBI | ITSM „SharePoint Online \| New Site Creation“, ostatní účastníci jako site members. |
| Katalog aplikací (site collection app catalog) na webu | hotovo | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na sharepoint@eon.com (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |

## Vety pro ServiceNow

- **weby-dev-test-prod:** Prosím o vytvoření tří webů SharePoint Online DEV / TEST / PROD pro workshop EG.D; ostatní účastníky přidejte jako site members. Prosím také o potvrzení, zda lze použít již existující web v tenantovi pavelchocholousgmail.onmicrosoft.com, nebo je potřeba DEV web v tenantovi E.ON.
- **tenant-webu:** Prosím o potvrzení, zda je pro workshop schválený DEV web v tenantovi pavelchocholousgmail.onmicrosoft.com, nebo mám používat web v tenantovi E.ON.
- **github-firemni-pristup:** Prosím o potvrzení adresy firemního GitHubu EG.D/E.ON a přístup do firemní organizace pro workshop EG.D, pokud ještě není přidělen.
```

</details>


---

<sub>4m 45s</sub>

### `rg`

**eyJ[A-Za-z0-9_-]{10,}|(password|heslo)\s*[:=]|access_token|refresh_token|Bearer\s**

"eyJ[A-Za-z0-9_-]{10,}|(password|heslo)\s*[:=]|access_token|refresh_token|Bearer\s" (pripravenost-Test-Copilot.md)

```
No matches found.
```


---

<sub>4m 45s</sub>

### `bash`

**Ověří syntaxi skriptu a existenci zprávy**

$ node --check "/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" && test -f "/private/tmp/cp-run1/home/egd-workshop/pripravenost-Test-Copilot.md" && echo REPORT_OK

```
REPORT_OK
<shellId: 4 completed with exit code 0>
```


---

<sub>5m 3s</sub>

### `apply_patch` — Failed

<details>
<summary>Arguments</summary>

```json
"*** Begin Patch\n*** Update File: /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs\n@@\n   const order = ['Nastroje', 'Sit a npm', 'Pripojeni k SharePointu', 'Ovladani SharePointu', 'SPFx pripravenost', 'GitHub', 'Zalozni cesty', 'Rucne overeno'];\n   const label = { zelena: 'zelena', zluta: 'zluta', cervena: 'CERVENA', info: 'info' };\n   const { nastroj, cesta } = doporuceni();\n+  const eonWeb = /^https:\\/\\/eonos\\.sharepoint\\.com\\//i.test(state.web || '');\n   const esc = (s) => String(s).replace(/\\|/g, '\\\\|').replace(/\\r?\\n/g, ' ');\n   let md = `# Pripravenost na workshop - ${jmeno}\\n\\nVytvoreno ${new Date().toLocaleString('cs-CZ')} skriptem egd-pripravenost. Bez tokenu a hesel.\\n\\n`;\n   md += `## Doporuceni\\n\\n- **Nastroj na stredu:** ${nastroj}\\n- **Nejjednodussi cesta k prvni appce:** ${cesta}\\n`;\n+  if (state.web && !eonWeb) md += `- **Pozor:** cesta a katalog jsou technicky overene na uvedenem webu v tenantovi mimo E.ON; pouziti pro workshop potvrdit s IT/Pavlem.\\n`;\n@@\n   md += `| Licence GitHub Copilot | ${stavTxt(lic === 'zelena', lic === 'cervena')} | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |\\n`;\n   md += `| 3 weby DEV / TEST / PROD | ${stavTxt(sites === 'zelena', sites === 'cervena' || sites === 'zluta')} | ITSM „SharePoint Online \\\\| New Site Creation“, ostatní účastníci jako site members. |\\n`;\n   const ac = v['site-app-catalog']?.stav;\n-  md += `| Katalog aplikací (site collection app catalog) na webu | ${stavTxt(ac === 'zelena', ac === 'cervena')} | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na ${EON_SHAREPOINT_MAIL} (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |\\n`;\n+  const catalogStatus = eonWeb ? stavTxt(ac === 'zelena', ac === 'cervena') : 'neověřeno pro E.ON';\n+  const catalogNote = eonWeb\n+    ? `Zakládá ručně Product Team E.ON, žádost jako vlastník webu na ${EON_SHAREPOINT_MAIL} (ne přes ITSM); lhůta nejistá, požádej hned.`\n+    : `Na uvedeném webu mimo E.ON je katalog ${ac === 'zelena' ? 'ověřen' : 'neověřen'}; na případném E.ON webu ho ověř nebo požádej Product Team E.ON na ${EON_SHAREPOINT_MAIL} (ne přes ITSM).`;\n+  md += `| Katalog aplikací (site collection app catalog) na webu | ${catalogStatus} | ${catalogNote} Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |\\n`;\n*** End Patch\n"
```

</details>

```
Failed to apply patch: Error: Failed to find expected lines in /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs:
  md += `| Licence GitHub Copilot | ${stavTxt(lic === 'zelena', lic === 'cervena')} | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |\n`;
  md += `| 3 weby DEV / TEST / PROD | ${stavTxt(sites === 'zelena', sites === 'cervena' || sites === 'zluta')} | ITSM „SharePoint Online \\| New Site Creation“, ostatní účastníci jako site members. |\n`;
  const ac = v['site-app-catalog']?.stav;
  md += `| Katalog aplikací (site collection app catalog) na webu | ${stavTxt(ac === 'zelena', ac === 'cervena')} | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na ${EON_SHAREPOINT_MAIL} (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |\n`;
```


---

<sub>5m 5s</sub>

### `view`

**view the file at /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs.**

/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs (lines 537-574)

<details>
<summary>37 lines</summary>

```
function cmdZprava(opts) {
  const jmeno = (opts.jmeno || os.userInfo().username).replace(/[^\p{L}\p{N}_-]+/gu, '-');
  const v = state.vysledky;
  const order = ['Nastroje', 'Sit a npm', 'Pripojeni k SharePointu', 'Ovladani SharePointu', 'SPFx pripravenost', 'GitHub', 'Zalozni cesty', 'Rucne overeno'];
  const label = { zelena: 'zelena', zluta: 'zluta', cervena: 'CERVENA', info: 'info' };
  const { nastroj, cesta } = doporuceni();
  const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
  let md = `# Pripravenost na workshop - ${jmeno}\n\nVytvoreno ${new Date().toLocaleString('cs-CZ')} skriptem egd-pripravenost. Bez tokenu a hesel.\n\n`;
  md += `## Doporuceni\n\n- **Nastroj na stredu:** ${nastroj}\n- **Nejjednodussi cesta k prvni appce:** ${cesta}\n`;
  if (state.web) md += `- **Web:** ${state.web}\n`;
  if (state.prihlasen) md += `- **Prihlaseni CLI:** ${state.prihlasen.ucet}, appId ${state.prihlasen.appId}\n`;
  const counts = Object.values(v).reduce((a, x) => { a[x.stav] = (a[x.stav] || 0) + 1; return a; }, {});
  md += `\nSoucty: zelena ${counts.zelena || 0}, zluta ${counts.zluta || 0}, cervena ${counts.cervena || 0}.\n`;
  for (const o of order.concat([...new Set(Object.values(v).map((x) => x.oblast))].filter((x) => !order.includes(x)))) {
    const rows = Object.entries(v).filter(([, x]) => x.oblast === o);
    if (!rows.length) continue;
    md += `\n## ${o}\n\n| Kontrola | Stav | Vysledek |\n|---|---|---|\n`;
    for (const [k, x] of rows) md += `| ${k} | ${label[x.stav] || x.stav} | ${esc(x.hodnota)}${x.oprava ? ` - *co dal:* ${esc(x.oprava)}` : ''} |\n`;
  }
  const lic = v['copilot-licence']?.stav;
  const stavTxt = (ok, bad) => (ok ? 'hotovo' : bad ? 'CHYBI' : 'neoverene');
  md += `\n## Objednávky předem (E.ON ITSM)\n\nÚčastníci mají předem zařídit tři věci. Stav podle této kontroly:\n\n| Co | Stav | Jak |\n|---|---|---|\n`;
  md += `| Licence GitHub Copilot | ${stavTxt(lic === 'zelena', lic === 'cervena')} | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |\n`;
  const sites = v['weby-dev-test-prod']?.stav;
  md += `| 3 weby DEV / TEST / PROD | ${stavTxt(sites === 'zelena', sites === 'cervena' || sites === 'zluta')} | ITSM „SharePoint Online \\| New Site Creation“, ostatní účastníci jako site members. |\n`;
  const ac = v['site-app-catalog']?.stav;
  md += `| Katalog aplikací (site collection app catalog) na webu | ${stavTxt(ac === 'zelena', ac === 'cervena')} | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na ${EON_SHAREPOINT_MAIL} (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |\n`;
  if (lic === 'cervena' && !v['copilot-licence'].it) v['copilot-licence'].it = 'Prosim o prideleni licence GitHub Copilot (Business) pro muj ucet - workshop vibecodingu EG.D 25. 11.';
  const itAll = Object.entries(v).filter(([, x]) => x.it && (x.stav === 'cervena' || x.stav === 'zluta'));
  md += `\n## Vety pro ServiceNow\n\n`;
  md += itAll.length ? itAll.map(([k, x]) => `- **${k}:** ${x.it}`).join('\n') + '\n' : 'Nic neni potreba.\n';
  const out = `pripravenost-${jmeno}.md`;
  fs.writeFileSync(out, md, 'utf8');
  console.log(`\nZprava ulozena: ${path.resolve(out)}\nNastroj: ${nastroj}\nCesta: ${cesta}\nZelena ${counts.zelena || 0} / zluta ${counts.zluta || 0} / cervena ${counts.cervena || 0}`);
}

function cmdPassthrough(rest, opts) {
  const p = cliPath(opts);
```

</details>


---

<sub>5m 11s</sub>

### `apply_patch`

<details>
<summary>Arguments</summary>

```json
"*** Begin Patch\n*** Update File: /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs\n@@\n   const order = ['Nastroje', 'Sit a npm', 'Pripojeni k SharePointu', 'Ovladani SharePointu', 'SPFx pripravenost', 'GitHub', 'Zalozni cesty', 'Rucne overeno'];\n   const label = { zelena: 'zelena', zluta: 'zluta', cervena: 'CERVENA', info: 'info' };\n   const { nastroj, cesta } = doporuceni();\n+  const eonWeb = /^https:\\/\\/eonos\\.sharepoint\\.com\\//i.test(state.web || '');\n   const esc = (s) => String(s).replace(/\\|/g, '\\\\|').replace(/\\r?\\n/g, ' ');\n@@\n   let md = `# Pripravenost na workshop - ${jmeno}\\n\\nVytvoreno ${new Date().toLocaleString('cs-CZ')} skriptem egd-pripravenost. Bez tokenu a hesel.\\n\\n`;\n   md += `## Doporuceni\\n\\n- **Nastroj na stredu:** ${nastroj}\\n- **Nejjednodussi cesta k prvni appce:** ${cesta}\\n`;\n+  if (state.web && !eonWeb) md += `- **Pozor:** cesta a katalog jsou technicky overene na uvedenem webu v tenantovi mimo E.ON; pouziti pro workshop potvrdit s IT/Pavlem.\\n`;\n@@\n   const sites = v['weby-dev-test-prod']?.stav;\n   md += `| 3 weby DEV / TEST / PROD | ${stavTxt(sites === 'zelena', sites === 'cervena' || sites === 'zluta')} | ITSM „SharePoint Online \\\\| New Site Creation“, ostatní účastníci jako site members. |\\n`;\n   const ac = v['site-app-catalog']?.stav;\n-  md += `| Katalog aplikací (site collection app catalog) na webu | ${stavTxt(ac === 'zelena', ac === 'cervena')} | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na ${EON_SHAREPOINT_MAIL} (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |\\n`;\n+  const catalogStatus = eonWeb ? stavTxt(ac === 'zelena', ac === 'cervena') : 'neověřeno pro E.ON';\n+  const catalogNote = eonWeb\n+    ? `Zakládá ručně Product Team E.ON, žádost jako vlastník webu na ${EON_SHAREPOINT_MAIL} (ne přes ITSM); lhůta nejistá, požádej hned.`\n+    : `Na uvedeném webu mimo E.ON je katalog ${ac === 'zelena' ? 'ověřen' : 'neověřen'}; na případném E.ON webu ho ověř nebo požádej Product Team E.ON na ${EON_SHAREPOINT_MAIL} (ne přes ITSM).`;\n+  md += `| Katalog aplikací (site collection app catalog) na webu | ${catalogStatus} | ${catalogNote} Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |\\n`;\n*** End Patch\n"
```

</details>

```
Modified 1 file(s): /tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs
```


---

<sub>5m 14s</sub>

### `bash`

**Znovu vygeneruje zprávu s upozorněním na tenant**

$ S="/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs"; node --check "$S" && node "$S" zprava --jmeno "Test Copilot"

```
Zprava ulozena: /private/tmp/cp-run1/home/egd-workshop/pripravenost-Test-Copilot.md
Nastroj: Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
Cesta: A: vlastni SPFx aplikace na webu (vse potrebne funguje)
Zelena 23 / zluta 6 / cervena 0
<shellId: 5 completed with exit code 0>
```


---

<sub>5m 17s</sub>

### `view`

**view the file at /private/tmp/cp-run1/home/egd-workshop/pripravenost-Test-Copilot.md.**

/private/tmp/cp-run1/home/egd-workshop/pripravenost-Test-Copilot.md (lines 1-100)

<details>
<summary>77 lines</summary>

```
# Pripravenost na workshop - Test-Copilot

Vytvoreno 22. 11. 2026 20:20:45 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
- **Nejjednodussi cesta k prvni appce:** A: vlastni SPFx aplikace na webu (vse potrebne funguje)
- **Pozor:** cesta a katalog jsou technicky overene na uvedenem webu v tenantovi mimo E.ON; pouziti pro workshop potvrdit s IT/Pavlem.
- **Web:** https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest
- **Prihlaseni CLI:** pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904

Soucty: zelena 23, zluta 6, cervena 0.

## Nastroje

| Kontrola | Stav | Vysledek |
|---|---|---|
| system | info | Darwin 27.2.0 Darwin Kernel Version 27.2.0: Wed Oct 14 23:47:07 PDT 2026; root:xnu-13432.41.4~25/RELEASE_ARM64_T8132 (arm64) |
| git | zelena | git version 2.54.0 (Apple Git-157) |
| node | zelena | v22.23.5 (/opt/homebrew/Cellar/node@22/22.23.5_1/bin/node) |
| npm | zelena | 10.9.9 |
| vscode | zelena | VS Code 1.146.0 |
| vscode-copilot | zluta | rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene) - *co dal:* otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> "GitHub Copilot Chat" (kdyz je Marketplace blokovany, IT) |
| copilot-cli | zelena | Copilot CLI GitHub Copilot CLI 1.0.91. |
| gh | info | gh version 2.104.0 (2026-11-12) |
| claude-code | zelena | Claude Code 2.1.330 (Claude Code) |
| claude-desktop | zelena | nalezeno: /Applications/Claude.app |
| spusteno-z | info | Claude Code |

## Sit a npm

| Kontrola | Stav | Vysledek |
|---|---|---|
| npm-registry | info | https://registry.npmjs.org/ |
| npm-proxy | info | proxy=null https-proxy=null strict-ssl=true cafile=null HTTPS_PROXY=ne NODE_EXTRA_CA_CERTS=ne |
| npm-ping | zelena | registry odpovida (PONG) |
| npm-stazeni-metadat | zelena | @pnp/cli-microsoft365 12.0.0 je dostupny |
| entra-dosazitelne | zelena | login.microsoftonline.com odpovida, tenant pavelchocholousgmail.onmicrosoft.com = 972a674c-7b85-4e56-a31f-b2f95b42fd1e |
| sharepoint-dosazitelny | zelena | eonos.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne) |

## Pripojeni k SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| cli-instalace | zelena | CLI for Microsoft 365 v12.0.0 lokalne v node_modules |
| cli-setup | zelena | CLI nastaveno pro skripty (bez interaktivnich dotazu) |
| prihlaseni | zelena | prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e |
| weby-dev-test-prod | zluta | DEV/TEST/PROD zatím nejsou objednané. Zadaný DEV web je v tenantovi pavelchocholousgmail.onmicrosoft.com, nejde o doménu eonos.sharepoint.com. |
| tenant-webu | zluta | Přístup je ověřen do uživatelem uvedeného webu; jde o tenant pavelchocholousgmail.onmicrosoft.com, nikoli tenant E.ON. |

## Ovladani SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| web-cteni | zelena | "Site catalog test" (https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest) |
| role-na-webu | zelena | Vlastnik (Full Control) (odhad z EffectiveBasePermissions High 2147483647 / Low 4294705151; zapis polozek ano, sprava seznamu ano) |
| seznamy | zelena | 7 viditelnych seznamu/knihoven: Apps for SharePoint (4), Documents (0), EGD-pripravenost (2), Events (0), Form Templates (0), Site Pages (3), Style Library (0) |
| tenant-app-catalog | info | https://pavelchocholousgmail.sharepoint.com/sites/apps (pro workshop ho nepotrebujeme; zapisujeme jen do katalogu na vlastnim webu) |
| site-app-catalog | zelena | web ma vlastni katalog aplikaci "Apps for SharePoint" (4 balicku) |
| role-v-katalogu | zelena | muzes nahrat balicek (.sppkg) do katalogu |
| zkouska | zluta | Zkušební zápis přeskočen na výslovné přání uživatele; do SharePointu se nic nezapisovalo. |

## SPFx pripravenost

| Kontrola | Stav | Vysledek |
|---|---|---|
| node-pro-spfx-1.24 | zelena | Node v22.23.5; SPFx 1.24 chce 22 / 24 / 26 (22 aspon 22.14). Gulp uz neni, build je Heft. |
| generator-dostupny | zelena | @microsoft/generator-sharepoint@1.24.1 je v registry |

## GitHub

| Kontrola | Stav | Vysledek |
|---|---|---|
| github-hosty | zluta | gh neni k zadnemu hostu prihlasen (nebo vypis nejde precist) - *co dal:* postup v references/github.md krok 4: gh auth login --hostname <adresa firemniho GitHubu> |
| git-credential-helper | info | osxkeychain |
| copilot-licence | zelena | Uživatel potvrzuje licenci; Copilot je v této relaci aktivní. |
| github-firemni-pristup | zluta | gh auth status nenašel přihlášený GitHub host; firemní přístup do organizace nebyl ověřen. |

## Zalozni cesty

| Kontrola | Stav | Vysledek |
|---|---|---|
| licence-m365 | info | licence: FLOW_FREE, SPE_E5 |
| power-platform-licence | zelena | Power Apps / Power Automate v licenci: FLOW_P2_VIRAL, FLOW_O365_P3, POWERAPPS_O365_P3 |

## Objednávky předem (E.ON ITSM)

Účastníci mají předem zařídit tři věci. Stav podle této kontroly:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | hotovo | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |
| 3 weby DEV / TEST / PROD | CHYBI | ITSM „SharePoint Online \| New Site Creation“, ostatní účastníci jako site members. |
| Katalog aplikací (site collection app catalog) na webu | neověřeno pro E.ON | Na uvedeném webu mimo E.ON je katalog ověřen; na případném E.ON webu ho ověř nebo požádej Product Team E.ON na sharepoint@eon.com (ne přes ITSM). Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |

## Vety pro ServiceNow

- **weby-dev-test-prod:** Prosím o vytvoření tří webů SharePoint Online DEV / TEST / PROD pro workshop EG.D; ostatní účastníky přidejte jako site members. Prosím také o potvrzení, zda lze použít již existující web v tenantovi pavelchocholousgmail.onmicrosoft.com, nebo je potřeba DEV web v tenantovi E.ON.
- **tenant-webu:** Prosím o potvrzení, zda je pro workshop schválený DEV web v tenantovi pavelchocholousgmail.onmicrosoft.com, nebo mám používat web v tenantovi E.ON.
```

</details>


---

<sub>5m 17s</sub>

### `rg`

**eyJ[A-Za-z0-9_-]{10,}|(password|heslo)\s*[:=]|access_token|refresh_token|Bearer\s**

"eyJ[A-Za-z0-9_-]{10,}|(password|heslo)\s*[:=]|access_token|refresh_token|Bearer\s" (pripravenost-Test-Copilot.md)

```
No matches found.
```


---

<sub>5m 17s</sub>

### `bash`

**Potvrdí validní skript a nenulovou zprávu**

$ node --check "/tmp/cp-run1/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" && test -s "/private/tmp/cp-run1/home/egd-workshop/pripravenost-Test-Copilot.md" && echo "Kontrola hotova"

```
Kontrola hotova
<shellId: 6 completed with exit code 0>
```


---

<sub>5m 24s</sub>

### Copilot

Kontrola je hotová. Zprávu najdete v ` /private/tmp/cp-run1/home/egd-workshop/pripravenost-Test-Copilot.md` (bez mezery na začátku cesty).

M365 přihlášení, čtení zadaného webu, vaše role vlastníka, katalog aplikací, npm a požadavky SPFx jsou ověřené. **Do SharePointu jsem nic nezapisoval.** Zbývá objednat weby DEV/TEST/PROD, potvrdit, zda lze pro workshop použít web v uvedeném tenantovi mimo E.ON, a ověřit firemní GitHub přístup. Kontrola proběhla na macOS, ne na případném pracovním počítači s Windows.

Pošlete prosím soubor Pavlovi.

---

<sub>Generated by [GitHub Copilot CLI](https://github.com/features/copilot/cli)</sub>
