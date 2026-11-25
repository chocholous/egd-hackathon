# Copilot CLI Session

> [!NOTE]
> - **Session ID:** `18049cb0-b874-4eb1-8ddb-93deac1fbf56`  
> - **Started:** 11/22/2026, 8:30:31 PM  
> - **Duration:** 5m 22s  
> - **Exported:** 11/22/2026, 8:35:54 PM  

---

<sub>3s</sub>

### Info

Copilot Fusion selected GPT-6 Luna because it was the best choice out of the models available in your plan.

---

<sub>3s</sub>

### User

Zkontroluj moji připravenost na workshop. Jmenuji se Test Ctyri. Adresa mého DEV webu je https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest (lab, ne E.ON). Licenci GitHub Copilot mám, weby DEV/TEST/PROD zatím neobjednané. Do M365 jsem přihlášený. Nemůžu odpovídat interaktivně, takže předem: plán zkušebního zápisu schvaluji, odpověď na tvou otázku „Můžu to zapsat?“ je ANO, zapiš (jen na tento lab web).

---

<sub>5s</sub>

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

<sub>15s</sub>

### `bash`

**Zkontrolovat nástroje**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" nastroje`

<details>
<summary>13 lines</summary>

```
[INFO]   system: Darwin 27.2.0 Darwin Kernel Version 27.2.0: Wed Oct 14 23:47:07 PDT 2026; root:xnu-13432.41.4~25/RELEASE_ARM64_T8132 (arm64)
[ZELENA] git: git version 2.54.0 (Apple Git-157)
[ZELENA] node: v22.23.5 (/opt/homebrew/Cellar/node@22/22.23.5_1/bin/node)
[ZELENA] npm: 10.9.9
[ZELENA] vscode: VS Code 1.146.0
[ZLUTA]  vscode-copilot: rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene)
          co dal: otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> "GitHub Copilot Chat" (kdyz je Marketplace blokovany, IT)
[ZELENA] copilot-cli: Copilot CLI GitHub Copilot CLI 1.0.114.
[INFO]   gh: gh version 2.104.0 (2026-11-12)
[ZELENA] claude-code: Claude Code 2.1.330 (Claude Code)
[ZELENA] claude-desktop: nalezeno: /Applications/Claude.app
[INFO]   spusteno-z: jiny terminal
<shellId: 0 completed with exit code 0>
```

</details>


---

<sub>47s</sub>

### `bash`

**Prověřit npm a síť**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" npm`

```
[INFO]   npm-registry: https://registry.npmjs.org/
[INFO]   npm-proxy: proxy=null https-proxy=null strict-ssl=true cafile=null HTTPS_PROXY=ne NODE_EXTRA_CA_CERTS=ne
[ZELENA] npm-ping: registry odpovida (PONG)
[ZELENA] npm-stazeni-metadat: @pnp/cli-microsoft365 12.0.0 je dostupny
<shellId: 1 completed with exit code 0>
```


---

<sub>20s</sub>

### `bash`

**Prověřit přístup k síti**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" sit`

```
[ZELENA] entra-dosazitelne: login.microsoftonline.com odpovida, tenant egd.cz = b914a242-e718-443b-a47c-6b4c649d8c0a
[ZELENA] sharepoint-dosazitelny: eonos.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne)
<shellId: 2 completed with exit code 0>
```


---

<sub>24s</sub>

### `bash`

**Prověřit dostupné varianty**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" varianty`

```
[ZELENA] varianta-node: funguje: 1 uz je (Node 22.14+/24/26 v PATH), 3 portable archiv z nodejs.org (bez admina); nezmereno: 2 winget (jen Windows; na macOS brew nebo portable). Pouzij prvni funkcni: 1 uz je (Node 22.14+/24/26 v PATH)
[ZELENA] varianta-cli: funguje: 1 npm lokalne v pracovni slozce (cli-instalace), 3 globalni m365 uz v PATH, 4 bez CLI: prohlizec (prikaz prohlizec); nezmereno: 2 npx (bez instalace, stahuje pri kazdem behu) (nezkouseno, jen zaloha; pozor na cizi balicek m365 na npm). Pouzij prvni funkcni: 1 npm lokalne v pracovni slozce (cli-instalace)
[ZELENA] varianta-prihlaseni: funguje: 1 device code (--authType deviceCode), 2 prohlizec (--authType browser, redirect na localhost); nezmereno: 3 appId od IT / souhlas spravce (zatim se nikdo neprihlasil). Pouzij prvni funkcni: 1 device code (--authType deviceCode)
[INFO]   varianta-pouzita: uz prihlaseny pres CLI: ne; spusteno z: jiny terminal. Co z toho skutecne pouzijes, dopis: zapis --klic varianta-pouzita-<oblast> --stav info --hodnota "<cislo varianty>"
<shellId: 3 completed with exit code 0>
```


---

<sub>20s</sub>

### `bash`

**Zkontrolovat firemní GitHub**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" github`

```
[ZLUTA]  github-hosty: gh neni k zadnemu hostu prihlasen (nebo vypis nejde precist)
          co dal: postup v references/github.md krok 4: gh auth login --hostname <adresa firemniho GitHubu>
[INFO]   git-credential-helper: osxkeychain
<shellId: 4 completed with exit code 0>
```


---

<sub>3m 12s</sub>

### `bash`

**Nainstalovat Microsoft 365 CLI**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" cli-instalace`

```
Zalozen package.json v teto slozce (jen pro lokalni instalaci nastroju).
Instaluji @pnp/cli-microsoft365@12 do /private/tmp/cp-run4/home/egd-workshop/node_modules (bez admin prav, muze trvat par minut)...
[ZELENA] cli-instalace: CLI for Microsoft 365 v12.0.0 lokalne v node_modules
[ZELENA] cli-setup: CLI nastaveno pro skripty (bez interaktivnich dotazu)
<shellId: 5 completed with exit code 0>
```


---

<sub>59s</sub>

### `bash`

**Prověřit připravenost SPFx**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" spfx`

```
[ZELENA] node-pro-spfx-1.24: Node v22.23.5; SPFx 1.24 chce 22 / 24 / 26 (22 aspon 22.14). Gulp uz neni, build je Heft.
[ZELENA] generator-dostupny: @microsoft/generator-sharepoint@1.24.1 je v registry
Zkusebni instalaci generatoru spustis volbou --instalovat (stahne cca stovky MB do .pripravenost/spfx-test).
<shellId: 6 completed with exit code 0>
```


---

<sub>52s</sub>

### `view`

**view the file at /tmp/cp-run4/home/.copilot/skills/egd-pripravenost/references/prihlaseni.md.**

`/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/references/prihlaseni.md`

<details>
<summary>46 lines</summary>

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
| Blokuje Conditional Access v E.ON device code? | ⛔ jen E.ON; v labu nejde. Ověření: `varianty` a první pokus o přihlášení, AADSTS53003/50097 |
| Aplikace se souhlasem správce u E.ON (pro `spo app add`) | ⛔ jen E.ON; zdroj: mail E.ON 12. 11. (SHO-5032) mluví jen o app catalogu, ne o appId |
| Přihlášení CLI v labu | ✅ jen pod `pavel.admin`; pod `egd01` AADSTS65001 (zdroj `08-ucty-ucastniku.md`); AADSTS700016 ✅ `test-dukazy/aadsts-700016.out` |

## Možnosti appId (od nejjednodušší pro účastníka; celý žebřík je v [zebrik.md](zebrik.md))

1. **appId od IT / Pavla** – aplikace už registrovaná v tenantu E.ON se souhlasem správce:
   `node "<S>" prihlaseni-prikaz --appId <id>`.
2. **Nová registrace přes ServiceNow** (věta níže). Co musí mít: delegovaná oprávnění
   **SharePoint `AllSites.FullControl`** (použité oprávnění lab aplikace; že ho `spo app add` / `deploy` vyžadují, jsem v labu neověřil ❓, nápověda příkazu to neříká, minimum je třeba ověřit u IT ⛔) a
   **Microsoft Graph `User.Read`**, souhlas správce, zapnuté **Allow public client flows** (device code)
   a pro `--authType browser` redirect URI `http://localhost` typu „Mobile and desktop applications“ ❓.
3. **`m365 setup`** – založí registraci sám, ale je to **zápis do Entra ID E.ON**. Jen se svolením IT,
   ne na vlastní pěst; v E.ON nejspíš skončí na právech ❓.
4. **Bez CLI** (když do středy nic z toho nevyjde): SharePoint jde ověřit v prohlížeči (příkaz
   `prohlizec`); první appka pak bude bez nasazování kódu (seznam + formátování), nebo s ručním
   nahráním `.sppkg` do katalogu v prohlížeči (tak to EG.D už jednou udělala).

## Registrace Authenticatoru (MFA) – může zablokovat první přihlášení

V labu skončila zhruba polovina přihlášení pod účtem `egd01` (✅ 3 z 6 pokusů, zdroj `08-ucty-ucastniku.md`) po správném
hesle na obrazovce „Let's keep your account secure“ → `mysignins.microsoft.com/register` („Install Microsoft
Authenticator“); přeskočit to nešlo. V E.ON se může stát totéž ⛔. Co dělat (účastník):

1. Na telefonu nainstaluj **Microsoft Authenticator** a dokonči registraci (QR kód), než začneš s přihlášením CLI.
2. Nemáš-li telefon po ruce: na té obrazovce „Set up a different authentication app“ a libovolná TOTP aplikace.
3. Nejde-li to ani tak, věta pro IT: „Prosím o dokončení registrace vícefaktorového ověření (MFA) pro můj účet, přihlášení do Microsoft 365 se zastavuje na registraci Microsoft Authenticator.“

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

<sub>52s</sub>

### `view`

**view the file at /tmp/cp-run4/home/.copilot/skills/egd-pripravenost/references/github.md.**

`/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/references/github.md`

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

⛔ Pozor: účet spravovaný firmou (EMU) Copilot Free mít nesmí a po přidělení firemní licence se osobní plán přepíše 📘 (zdroj `09-github-ucastnici.md`). Jedna věta: založ si bezplatný osobní účet na https://github.com/signup (bez karty; zda smíš firemní e-mail, ověř u nadřízeného, jinak soukromý), ve VS Code **Sign in with GitHub** a v Copilot Chatu **Sign up for Copilot Free**; Free zahrnuje agent mode i Copilot CLI 📘, ale s limity: 2 000 návrhů kódu měsíčně, „omezené“ použití chatu a agenta (přesné číslo GitHub neuvádí), jen automatický výběr modelu 📘. Na Free účtu jsem to **neověřoval** ❓. Dostaneš-li později firemní licenci, přepíše osobní plán.

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

- **github.com:** v terminálu `copilot`, pak `/login` (nebo `copilot login`) ✅ (`copilot login --help`, Copilot CLI 1.0.114). Otevře prohlížeč.
- **GHE.com:** `copilot login --host https://<GITHUB-ADRESA>` ✅ (příklad přímo v `copilot login --help`); v `/login` jde zvolit i „GitHub Enterprise Cloud with data residency“ a zadat adresu 📘.
- Instalace na Windows: `winget install GitHub.Copilot` (bez Node) nebo `npm i -g @github/copilot` 📘; požadavek PowerShell 6+ ❓ ověř (Windows PowerShell 5.1 nemusí stačit, `pwsh` jako portable).
- Skill se instaluje do `%USERPROFILE%\.copilot\skills` (viz README).

### c) `gh` (GitHub CLI) a git

- Přihlášení: `gh auth login --hostname <GITHUB-ADRESA>` (pro github.com bez `--hostname`) ✅ (`gh auth login --help`: `--hostname` je výslovně pro jiný GitHub; existuje i `--web` a `--with-token`). Zvol HTTPS a „Login with a web browser“.
- Který host je přihlášený: `gh auth status` (vypíše každý host zvlášť; tokeny nikam nepiš) ✅. Skill to dělá příkazem `node "<S>" github`.
- git přes `gh`: `gh auth setup-git --hostname <GITHUB-ADRESA>` ✅ (příkaz existuje, nastaví `gh` jako credential helper pro daný host).
- git přes Git Credential Manager: Git for Windows ho obsahuje a při prvním `git clone` otevře přihlašovací okno ❓ (pro `*.ghe.com` ověř u prvního klonu; nic nenastavuj sám, když okno nevyskočí, použij `gh auth setup-git`).
- Nikdy nevkládej heslo ani token do chatu; „classic“ osobní tokeny (`ghp_`) Copilot CLI nepodporuje ✅ (výslovně v `copilot login --help`, 1.0.114).

### d) Claude Code a Claude Desktop (záložka Code)

- Claude pracuje s repem **lokálně přes git a `gh` na tvém počítači** ❓ (princip: spouští tytéž příkazy co ty; funguje tedy se vším, k čemu jsi přihlášený v krocích 4a–4c, i na `*.ghe.com`). Neověřeno na firemním hostu.
- **GitHub konektor / GitHub app pro Claude** (cloudové relace, code review, `/install-github-app`) je pro **github.com** 📘. Pro GitHub Enterprise Server je podpora jen v plánech Team a Enterprise a `/install-github-app` tam nejde 📘. Pro `*.ghe.com` jsem podporu nenašel ❓ → počítej s prací přes lokální git a `gh`.

## Krok 5 – Rychlý test (3 věci)

1. `gh auth status` (nebo `node "<S>" github`): vidíš svou adresu a svůj účet.
2. Naklonuj jakékoli firemní repo (adresu dej IT/Pavla): `git clone https://<GITHUB-ADRESA>/<org>/<repo>.git`. Povede-li se bez zadávání hesla, git je připojený.
3. Ve VS Code Chat (Agent) napiš „Ahoj, funguješ?“ a odpoví, nebo v terminálu `copilot` a otázku.

Výsledky zapiš agentovi, ten je dá do zprávy obecným příkazem skriptu `zapis` (`node "<S>" zapis --klic github-test --stav zelena|zluta|cervena --hodnota "…"`; klíč je libovolný název) ✅.

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

<sub>52s</sub>

### `view`

**view the file at /tmp/cp-run4/home/.copilot/skills/egd-pripravenost/references/windows.md.**

`/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/references/windows.md`

<details>
<summary>36 lines</summary>

```
# Windows: pasti pro agenta

Stav: **na Windows neověřené** ❓ (nikdy nespuštěno, jen kód a dokumentace). Úroveň jistoty po krocích:

| Krok skillu | Windows | macOS |
|---|---|---|
| `nastroje`, `npm`, `sit`, `varianty` | ❓ čtením kódu: `.cmd` jdou přes `shell:true`, `.exe` bez | ✅ |
| `cli-instalace` | ❓ nativní doplněk CLI 12 | ✅ |
| `prihlaseni`, `sharepoint`, `zkouska` | ❓ stejný kód, ale úložiště tokenů CLI jinde | ✅ (jen pod správcem labu) |
| `spfx --instalovat`, `appka.mjs build` (Heft) | ❓ | ✅ |
| portable Node 22 a PATH (níže) | ❓ nikdo neprošel | ✅ jen Node 18 jako portable archiv |
| README příkazy v PowerShellu | ❓ | n/a |

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
- **Node 22.14+ (nebo 24 / 26) LTS** jako portable zip z nodejs.org: rozbalit do `%USERPROFILE%\node` a
  v uživatelských proměnných prostředí dát tu složku na začátek `Path` (bez admina). Stahuje uživatel sám. ❓ Windows.
```

</details>


---

<sub>3m 28s</sub>

### `bash`

**Ověřit přihlášení Microsoft 365**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" prihlaseni`

```
[ZLUTA]  prihlaseni: prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e
          co dal: tenant neni b914a242-e718-443b-a47c-6b4c649d8c0a - prihlasen jinam? odhlas se (logout) a prihlas znovu s --tenant b914a242-e718-443b-a47c-6b4c649d8c0a
<shellId: 7 completed with exit code 0>
```


---

<sub>3m 30s</sub>

### `bash`

**Prověřit laboratorní SharePoint web**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-workshop/../skills/egd-pripravenost/scripts/pripravenost.mjs" sharepoint --web "https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest"`

<details>
<summary>16 lines</summary>

```
node:internal/modules/cjs/loader:1433
  throw err;
  ^

Error: Cannot find module '/tmp/cp-run4/home/.copilot/skills/skills/egd-pripravenost/scripts/pripravenost.mjs'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1430:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1040:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1045:22)
    at Module._load (node:internal/modules/cjs/loader:1216:25)
    at wrapModuleLoad (node:internal/modules/cjs/loader:254:19)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)
    at node:internal/main/run_main_module:36:49 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v22.23.5
<shellId: 8 completed with exit code 1>
```

</details>


---

<sub>4m 10s</sub>

### `bash`

**Prověřit laboratorní SharePoint web**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" sharepoint --web "https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest"`

```
[ZLUTA]  prihlaseni: prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e
          co dal: tenant neni b914a242-e718-443b-a47c-6b4c649d8c0a - prihlasen jinam? odhlas se (logout) a prihlas znovu s --tenant b914a242-e718-443b-a47c-6b4c649d8c0a
[CERVENA] web-cteni: nejde precist: spawnSync /opt/homebrew/Cellar/node@22/22.23.5_1/bin/node ETIMEDOUT
          co dal: zkontroluj adresu webu (preklep, /sites/...)
<shellId: 9 completed with exit code 0>
```


---

<sub>4m 15s</sub>

### `bash`

**Připravit plán zkušebního zápisu**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" zkouska --web "https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest"`

<details>
<summary>7 lines</summary>

```
PLAN ZAPISU (nic se zatim nezapsalo):
  1. na webu https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest zalozit seznam "EGD-pripravenost" (jen kdyz jeste neexistuje)
  2. pridat do nej JEDNU polozku s nazvem "Zkouska chocholous 22. 11. 2026 20:34:47"
  3. precist ji zpatky
Nic se nemaze. Seznam si muzes pozdeji smazat sam v prohlizeci (Obsah webu).
Kdyz s tim clovek souhlasi, spust znovu s volbou --ano.
<shellId: 10 completed with exit code 10>
```

</details>


---

<sub>4m 15s</sub>

### `bash`

**Připravit ověření v prohlížeči**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" prohlizec --web "https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest"`

<details>
<summary>13 lines</summary>

```
Kdyz CLI nebo npm nejde, over aspon prohlizecem (Edge, firemni ucet). Otevri postupne a vysledek rekni agentovi:

  1. Web:                     https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest
  2. Tvoje prava (REST):      https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest/_api/web/EffectiveBasePermissions
     -> v XML najdi <d:High> a <d:Low>, cisla posli agentovi (prikaz: maska --high X --low Y)
  3. Seznamy (REST):          https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest/_api/web/lists?$select=Title,ItemCount&$filter=Hidden eq false
  4. Katalog aplikaci webu:   https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest/AppCatalog
     -> kdyz se otevre knihovna "Apps for SharePoint", web katalog ma
  5. Power Apps:              https://make.powerapps.com   (vidis prostredi a muzes "Vytvorit"?)
  6. Power Automate:          https://make.powerautomate.com
  7. Licence Microsoft 365:   https://myaccount.microsoft.com  -> Predplatne / Subscriptions
  8. GitHub Copilot licence:  https://github.com/settings/copilot  (nebo ve VS Code ikona Copilota)

Vysledek zapise agent prikazem: zapis --klic <nazev> --stav zelena|zluta|cervena --hodnota "<co jsi videl>"
<shellId: 11 completed with exit code 0>
```

</details>


---

<sub>4m 36s</sub>

### `bash`

**Provést schválený zkušební zápis**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" zkouska --web "https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest" --ano`

```
[ZLUTA]  prihlaseni: prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e
          co dal: tenant neni b914a242-e718-443b-a47c-6b4c649d8c0a - prihlasen jinam? odhlas se (logout) a prihlas znovu s --tenant b914a242-e718-443b-a47c-6b4c649d8c0a
Prihlaseny tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e neni b914a242-e718-443b-a47c-6b4c649d8c0a. Zapis zastaven.
<shellId: 12 completed with exit code 1>
```


---

<sub>4m 46s</sub>

### `bash`

**Zaznamenat stav licence a webů**

`$ S="/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs"; node "$S" zapis --klic copilot-licence --stav zluta --hodnota "Uživatel uvádí, že licenci GitHub Copilot má; přihlášení ke GitHubu ani stav licence nebylo možné ověřit." && node "$S" zapis --klic dev-test-prod --stav zluta --hodnota "Uživatel uvádí, že weby DEV/TEST/PROD nejsou objednány; zadaný web je výslovně laboratorní, nikoli E.ON." && node "$S" zapis --klic zkouska --stav cervena --hodnota "Uživatel předem schválil jeden zkušební zápis jen na laboratorní web. Skript zastavil zápis, protože očekává tenant E.ON b914a242-e718-443b-a47c-6b4c649d8c0a; aktivní přihlášení je do tenantu 972a674c-7b85-4e56-a31f-b2f95b42fd1e. Nic nebylo zapsáno."`

```
[ZLUTA]  copilot-licence: Uživatel uvádí, že licenci GitHub Copilot má; přihlášení ke GitHubu ani stav licence nebylo možné ověřit.
[ZLUTA]  dev-test-prod: Uživatel uvádí, že weby DEV/TEST/PROD nejsou objednány; zadaný web je výslovně laboratorní, nikoli E.ON.
[CERVENA] zkouska: Uživatel předem schválil jeden zkušební zápis jen na laboratorní web. Skript zastavil zápis, protože očekává tenant E.ON b914a242-e718-443b-a47c-6b4c649d8c0a; aktivní přihlášení je do tenantu 972a674c-7b85-4e56-a31f-b2f95b42fd1e. Nic nebylo zapsáno.
<shellId: 13 completed with exit code 0>
```


---

<sub>4m 50s</sub>

### `bash`

**Vytvořit zprávu o připravenosti**

`$ node "/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" zprava --jmeno "Test Ctyri"`

```
Zprava ulozena: /private/tmp/cp-run4/home/egd-workshop/pripravenost-Test-Ctyri.md
Nastroj: Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
Cesta: zatim zadna - chybi web nebo pristup k nemu (viz Objednavky predem)
Zelena 11 / zluta 4 / cervena 2
<shellId: 14 completed with exit code 0>
```


---

<sub>4m 52s</sub>

### `view`

**view the file at /private/tmp/cp-run4/home/egd-workshop/pripravenost-Test-Ctyri.md.**

`/private/tmp/cp-run4/home/egd-workshop/pripravenost-Test-Ctyri.md`

<details>
<summary>54 lines</summary>

```
# Pripravenost na workshop - Test-Ctyri

Vytvoreno 22. 11. 2026 20:35:22 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
- **Nejjednodussi cesta k prvni appce:** zatim zadna - chybi web nebo pristup k nemu (viz Objednavky predem)
- **Web:** https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest
- **Prihlaseni CLI:** pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904

Soucty: zelena 11, zluta 4, cervena 2.

## Nastroje

| Kontrola | Stav | Vysledek |
|---|---|---|
| system | info | Darwin 27.2.0 Darwin Kernel Version 27.2.0: Wed Oct 14 23:47:07 PDT 2026; root:xnu-13432.41.4~25/RELEASE_ARM64_T8132 (arm64) |
| git | zelena | git version 2.54.0 (Apple Git-157) |
| node | zelena | v22.23.5 (/opt/homebrew/Cellar/node@22/22.23.5_1/bin/node) |
| npm | zelena | 10.9.9 |
| vscode | zelena | VS Code 1.146.0 |
| vscode-copilot | zluta | rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene) - *co dal:* otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> "GitHub Copilot Chat" (kdyz je Marketplace blokovany, IT) |
| copilot-cli | zelena | Copilot CLI GitHub Copilot CLI 1.0.114. |
| gh | info | gh version 2.104.0 (2026-11-12) |
| claude-code | zelena | Claude Code 2.1.330 (Claude Code) |
| claude-desktop | zelena | nalezeno: /Applications/Claude.app |
| spusteno-z | info | jiny terminal |

## Sit a npm

| Kontrola | Stav | Vysledek |
|---|---|---|
| npm-registry | info | https://registry.npmjs.org/ |
| npm-proxy | info | proxy=null https-proxy=null strict-ssl=true cafile=null HTTPS_PROXY=ne NODE_EXTRA_CA_CERTS=ne |
| npm-ping | zelena | registry odpovida (PONG) |
| npm-stazeni-metadat | zelena | @pnp/cli-microsoft365 12.0.0 je dostupny |

## Pripojeni k SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| cli-instalace | zelena | CLI for Microsoft 365 v12.0.0 lokalne v node_modules |
| cli-setup | zelena | CLI nastaveno pro skripty (bez interaktivnich dotazu) |
| prihlaseni | zluta | prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e - *co dal:* tenant neni b914a242-e718-443b-a47c-6b4c649d8c0a - prihlasen jinam? odhlas se (logout) a prihlas znovu s --tenant b914a242-e718-443b-a47c-6b4c649d8c0a |

## Ovladani SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| web-cteni | CERVENA | nejde precist: spawnSync /opt/homebrew/Cellar/node@22/22.23.5_1/bin/node ETIMEDOUT - *co dal:* zkontroluj adresu webu (preklep, /sites/...) |

## Rucne overeno

| Kontrola | Stav | Vysledek |
|---|---|---|
| copilot-licence | zluta | Uživatel uvádí, že licenci GitHub Copilot má; přihlášení ke GitHubu ani stav licence nebylo možné ověřit. |
| dev-test-prod | zluta | Uživatel uvádí, že weby DEV/TEST/PROD nejsou objednány; zadaný web je výslovně laboratorní, nikoli E.ON. |
| zkouska | CERVENA | Uživatel předem schválil jeden zkušební zápis jen na laboratorní web. Skript zastavil zápis, protože očekává tenant E.ON b914a242-e718-443b-a47c-6b4c649d8c0a; aktivní přihlášení je do tenantu 972a674c-7b85-4e56-a31f-b2f95b42fd1e. Nic nebylo zapsáno. |

## Objednávky předem (E.ON ITSM)

Účastníci mají předem zařídit tři věci. Stav podle této kontroly:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | neoverene | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |
| 3 weby DEV / TEST / PROD | neoverene | ITSM „SharePoint Online \| New Site Creation“, ostatní účastníci jako site members. |
| Katalog aplikací (site collection app catalog) na webu | neoverene | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na sharepoint@eon.com (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |

## Vety pro ServiceNow

Nic neni potreba.
```

</details>


---

<sub>5m 14s</sub>

### `bash`

**Doplnit stav GitHubu do zprávy**

`$ S="/tmp/cp-run4/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs"; node "$S" zapis --klic github --stav zluta --hodnota "gh není přihlášen k žádnému hostu; firemní GitHub adresa a přístup nebyly ověřeny." && node "$S" zprava --jmeno "Test Ctyri"`

<details>
<summary>6 lines</summary>

```
[ZLUTA]  github: gh není přihlášen k žádnému hostu; firemní GitHub adresa a přístup nebyly ověřeny.

Zprava ulozena: /private/tmp/cp-run4/home/egd-workshop/pripravenost-Test-Ctyri.md
Nastroj: Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
Cesta: zatim zadna - chybi web nebo pristup k nemu (viz Objednavky predem)
Zelena 11 / zluta 5 / cervena 2
<shellId: 15 completed with exit code 0>
```

</details>


---

<sub>5m 17s</sub>

### `view`

**view the file at /private/tmp/cp-run4/home/egd-workshop/pripravenost-Test-Ctyri.md.**

`/private/tmp/cp-run4/home/egd-workshop/pripravenost-Test-Ctyri.md`

<details>
<summary>55 lines</summary>

```
# Pripravenost na workshop - Test-Ctyri

Vytvoreno 22. 11. 2026 20:35:46 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
- **Nejjednodussi cesta k prvni appce:** zatim zadna - chybi web nebo pristup k nemu (viz Objednavky predem)
- **Web:** https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest
- **Prihlaseni CLI:** pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904

Soucty: zelena 11, zluta 5, cervena 2.

## Nastroje

| Kontrola | Stav | Vysledek |
|---|---|---|
| system | info | Darwin 27.2.0 Darwin Kernel Version 27.2.0: Wed Oct 14 23:47:07 PDT 2026; root:xnu-13432.41.4~25/RELEASE_ARM64_T8132 (arm64) |
| git | zelena | git version 2.54.0 (Apple Git-157) |
| node | zelena | v22.23.5 (/opt/homebrew/Cellar/node@22/22.23.5_1/bin/node) |
| npm | zelena | 10.9.9 |
| vscode | zelena | VS Code 1.146.0 |
| vscode-copilot | zluta | rozsireni GitHub Copilot Chat v seznamu neni (novejsi VS Code ho muze mit vestavene) - *co dal:* otevri ve VS Code panel Chat: kdyz tam Copilot je a jde prepnout na Agent, je to v poradku; jinak Extensions -> "GitHub Copilot Chat" (kdyz je Marketplace blokovany, IT) |
| copilot-cli | zelena | Copilot CLI GitHub Copilot CLI 1.0.114. |
| gh | info | gh version 2.104.0 (2026-11-12) |
| claude-code | zelena | Claude Code 2.1.330 (Claude Code) |
| claude-desktop | zelena | nalezeno: /Applications/Claude.app |
| spusteno-z | info | jiny terminal |

## Sit a npm

| Kontrola | Stav | Vysledek |
|---|---|---|
| npm-registry | info | https://registry.npmjs.org/ |
| npm-proxy | info | proxy=null https-proxy=null strict-ssl=true cafile=null HTTPS_PROXY=ne NODE_EXTRA_CA_CERTS=ne |
| npm-ping | zelena | registry odpovida (PONG) |
| npm-stazeni-metadat | zelena | @pnp/cli-microsoft365 12.0.0 je dostupny |

## Pripojeni k SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| cli-instalace | zelena | CLI for Microsoft 365 v12.0.0 lokalne v node_modules |
| cli-setup | zelena | CLI nastaveno pro skripty (bez interaktivnich dotazu) |
| prihlaseni | zluta | prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e - *co dal:* tenant neni b914a242-e718-443b-a47c-6b4c649d8c0a - prihlasen jinam? odhlas se (logout) a prihlas znovu s --tenant b914a242-e718-443b-a47c-6b4c649d8c0a |

## Ovladani SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| web-cteni | CERVENA | nejde precist: spawnSync /opt/homebrew/Cellar/node@22/22.23.5_1/bin/node ETIMEDOUT - *co dal:* zkontroluj adresu webu (preklep, /sites/...) |

## Rucne overeno

| Kontrola | Stav | Vysledek |
|---|---|---|
| copilot-licence | zluta | Uživatel uvádí, že licenci GitHub Copilot má; přihlášení ke GitHubu ani stav licence nebylo možné ověřit. |
| dev-test-prod | zluta | Uživatel uvádí, že weby DEV/TEST/PROD nejsou objednány; zadaný web je výslovně laboratorní, nikoli E.ON. |
| zkouska | CERVENA | Uživatel předem schválil jeden zkušební zápis jen na laboratorní web. Skript zastavil zápis, protože očekává tenant E.ON b914a242-e718-443b-a47c-6b4c649d8c0a; aktivní přihlášení je do tenantu 972a674c-7b85-4e56-a31f-b2f95b42fd1e. Nic nebylo zapsáno. |
| github | zluta | gh není přihlášen k žádnému hostu; firemní GitHub adresa a přístup nebyly ověřeny. |

## Objednávky předem (E.ON ITSM)

Účastníci mají předem zařídit tři věci. Stav podle této kontroly:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | neoverene | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |
| 3 weby DEV / TEST / PROD | neoverene | ITSM „SharePoint Online \| New Site Creation“, ostatní účastníci jako site members. |
| Katalog aplikací (site collection app catalog) na webu | neoverene | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na sharepoint@eon.com (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |

## Vety pro ServiceNow

Nic neni potreba.
```

</details>


---

<sub>5m 17s</sub>

### `rg`

**(ghp\_\[A-Za-z0-9\]{20,}|github\_pat\_\[A-Za-z0-9\_\]{20,}|access\[\_ -\]?token\\s\*\[:=\]|password\\s\*\[:=\]|\\beyJ\[A-Za-z0-9\_-\]{20,})**

`"(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|access[_ -]?token\s*[:=]|password\s*[:=]|\beyJ[A-Za-z0-9_-]{20,})" (pripravenost-Test-Ctyri.md)`

```
No matches found.
```


---

<sub>5m 22s</sub>

### Copilot

Kontrola je hotová: **11 zelených, 5 žlutých a 2 červené**. Node, npm i lokální CLI fungují; přístup ke GitHubu přes `gh` není ověřen a kontrola laboratorního SharePointu skončila timeoutem.

Schválený zkušební zápis se **neprovedl**: skript vyžaduje tenant E.ON, zatímco přihlášení je do jiného tenantu. Zastavil se před zápisem, takže seznam ani položka nevznikly. Appku jsem kvůli neověřenému přístupu nestavěl.

Zpráva je v `/private/tmp/cp-run4/home/egd-workshop/pripravenost-Test-Ctyri.md`. Pošli prosím soubor Pavlovi.

---

<sub>Generated by [GitHub Copilot CLI](https://github.com/features/copilot/cli)</sub>
