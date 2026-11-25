# Copilot CLI Session

> [!NOTE]
> - **Session ID:** `88ce3228-2247-456a-bd35-6bb904a2767c`  
> - **Started:** 11/22/2026, 8:55:07 PM  
> - **Duration:** 2m 50s  
> - **Exported:** 11/22/2026, 8:57:57 PM  

---

<sub>2s</sub>

### Info

Copilot Fusion selected GPT-6 Luna because it was the best choice out of the models available in your plan.

---

<sub>3s</sub>

### User

Zkontroluj moji připravenost na workshop. Jmenuji se Test Sest. Adresa mého DEV webu je https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest . Je to lab, ne E.ON: tenant pavelchocholousgmail.onmicrosoft.com, ID 972a674c-7b85-4e56-a31f-b2f95b42fd1e, používej --tenant s tímto ID. Licenci GitHub Copilot mám, weby DEV/TEST/PROD neobjednané. Do M365 jsem přihlášený. Nemůžu odpovídat interaktivně, takže předem: zkušební zápis na tomto lab webu schvaluji, odpověď na „Můžu to zapsat?“ je ANO. Nic dalšího nezapisuj a nic neodesílej.

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

<sub>13s</sub>

### `view`

**view the file at /tmp/cp-run6/home/.copilot/skills/egd-pripravenost/references/windows.md.**

`/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/references/windows.md`

<details>
<summary>37 lines</summary>

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
- Proto skript volá `node <npm-cli.js>` a `node <cli>/dist/index.js` s polem argumentů, bez shellu. Výjimka: kontroly nástrojů (`git`, `code`, `copilot`, `claude`, `gh`) jsou `.cmd` a jdou přes `shell: true` (cmd.exe); argumenty jsou u nich pevné a bez mezer ❓ Windows.
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

1. Stáhni z https://nodejs.org/dist/latest-v22.x/ soubor `node-v22.….-win-x64.zip` a rozbal ho (pravé tlačítko → Extrahovat vše) do `%USERPROFILE%\node22`. Zip má uvnitř jednu složku `node-v22.xx.x-win-x64`, takže `node.exe` je až v `%USERPROFILE%\node22\node-v22.xx.x-win-x64\node.exe` (dvojité zanoření). Kontrola: `Get-ChildItem "$env:USERPROFILE\node22" -Recurse -Filter node.exe`.
2. Jen pro toto okno PowerShellu (nic se nenastavuje trvale): `$env:Path = "$env:USERPROFILE\node22\node-v22.xx.x-win-x64;" + $env:Path` (název složky podle zipu), pak **`node -v`** musí vypsat v22.x. Nevypíše-li, cesta je špatná (viz výše) nebo okno není to samé.
   Co když: stažení z nodejs.org je blokované → požádej IT o archiv nebo o povolení; `node.exe` se nespustí (AppLocker / „blokováno zásadami“) → nejde to bez IT, věta pro IT je ve výpisu `spfx`; zip chce rozbalit jinam, protože `%USERPROFILE%` je síťový → zvol lokální disk.
3. Ve VS Code nastav PATH před jeho spuštěním, nebo spusť VS Code z toho okna příkazem `code .`; jinak agent dál uvidí starý Node. Trvalá změna: Nastavení → proměnné prostředí pro váš účet → `Path` (bez admina).

## Doporučené prostředí (nepovinné)

- **Git for Windows** (obsahuje Git Bash). V Claude Code pak bash místo PowerShellu.
- **PowerShell 7** jako portable zip (bez admina), když musí zůstat PowerShell.
- **Node 22.14+ (nebo 24 / 26) LTS** jako portable zip z nodejs.org: rozbalit do `%USERPROFILE%\node22` (stejná složka jako výše) a
  v uživatelských proměnných prostředí dát tu složku na začátek `Path` (bez admina). Stahuje uživatel sám. ❓ Windows.
```

</details>


---

<sub>13s</sub>

### `view`

**view the file at /tmp/cp-run6/home/.copilot/skills/egd-pripravenost/references/github.md.**

`/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/references/github.md`

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
| jiná vlastní adresa (třeba `github.eon.com`) | nejspíš GitHub Enterprise Server ❓ | Ověř u IT; `gh` a git fungují s `--hostname`, Copilot a Claude konektory se liší (viz krok 4). |

Poznámka: i na `github.com` může být tvůj účet „managed“ (patří firmě). Pozná se podle toho, že se přihlašuješ přes firemní SSO a jméno účtu má příponu firmy.

Ověření v prohlížeči: otevři adresu, přihlas se, vpravo nahoře profilový obrázek → **Your organizations** (nebo **Your enterprises**). Vidíš EG.D / E.ON = máš firemní přístup. Licenci Copilota ukáže `https://<GITHUB-ADRESA>/settings/copilot` (u github.com `https://github.com/settings/copilot`) 📘 (menu jsem živě neprošel, ❓ přesné popisky).

## Krok 2 – Nemáš přístup nebo licenci: ITSM

E.ON ITSM („my IT order“), jak řekla Adriána (schválení T. Richtera a vedoucího, k žádosti screenshot). Vzor žádosti:

„Žádám o přidělení licence GitHub Copilot a přístupu do firemní organizace GitHub Enterprise pro účastníka vibecoding workshopu IT EG.D 25. 11. 2026. Potřebuji GitHub Copilot v editoru Visual Studio Code a GitHub Copilot CLI na pracovní stanici s Windows.“

Číslo požadavku pošli lektorovi workshopu. Podej co nejdřív.

## Krok 3 – Záloha, když do úterý 24. 11. nemáš nic z kroků 1–2

⛔ Pozor: účet spravovaný firmou (EMU) Copilot Free mít nesmí a po přidělení firemní licence se osobní plán přepíše 📘 (zdroj `09-github-ucastnici.md`). Jedna věta: založ si bezplatný osobní účet na https://github.com/signup (bez karty; zda smíš firemní e-mail, ověř u nadřízeného, jinak soukromý), ve VS Code **Sign in with GitHub** a v Copilot Chatu **Sign up for Copilot Free**; Free zahrnuje agent mode i Copilot CLI 📘, ale s limity: 2 000 návrhů kódu měsíčně, „omezené“ použití chatu a agenta (přesné číslo GitHub neuvádí), jen automatický výběr modelu 📘. Na Free účtu jsem to **neověřoval** ❓. **Pošli lektorovi (Pavlovi) své uživatelské jméno na GitHubu** (login, ne heslo; třeba i na adresu, kterou ti řekne): bez osobního účtu a jeho loginu tě nejde pozvat do záložní organizace a pozvánku bys nepřijal. Dostaneš-li později firemní licenci, přepíše osobní plán.

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
2. Naklonuj jakékoli firemní repo (adresu ti dá IT): `git clone https://<GITHUB-ADRESA>/<org>/<repo>.git`. Povede-li se bez zadávání hesla, git je připojený.
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

<sub>13s</sub>

### `view`

**view the file at /tmp/cp-run6/home/.copilot/skills/egd-pripravenost/references/prihlaseni.md.**

`/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/references/prihlaseni.md`

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

1. **appId od IT** – aplikace už registrovaná v tenantu E.ON se souhlasem správce:
   `node "<S>" prihlaseni-prikaz --appId <id>`.
2. **Nová registrace přes ServiceNow** (věta níže). Co musí mít: delegovaná oprávnění
   **SharePoint `AllSites.FullControl`** (oprávnění lab aplikace, se kterým nasazení v labu prošlo ✅; že je to **nejmenší** potřebné oprávnění, není ověřeno ❓ – IT může zvolit jiné, věta ho proto jen navrhuje) a
   **Microsoft Graph `User.Read`**, souhlas správce, zapnuté **Allow public client flows** (device code)
   a pro `--authType browser` redirect URI `http://localhost` typu „Mobile and desktop applications“ ❓.
3. **`m365 setup`** – založí registraci sám, ale je to **zápis do Entra ID E.ON**. Jen se svolením IT,
   ne na vlastní pěst; v E.ON nejspíš skončí na právech ❓.
4. **Bez CLI** (když do středy nic z toho nevyjde): SharePoint jde ověřit v prohlížeči (příkaz
   `prohlizec`); první appka pak bude bez nasazování kódu (seznam + formátování), nebo s ručním
   nahráním `.sppkg` do katalogu v prohlížeči (tak to EG.D už jednou udělala).

## Registrace Authenticatoru (MFA) – může zastavit první přihlášení

Po zadání hesla se může objevit obrazovka „Let's keep your account secure“ s výzvou nainstalovat Microsoft Authenticator.
Pokud ji uvidíš, zvol **„Set up a different authentication app“** a zaregistruj libovolnou TOTP aplikaci (Microsoft
Authenticator, Google Authenticator, 1Password), nebo zavolej lektora: přeskočit ji nejde.

Fakta z labu (zdroj `08-ucty-ucastniku.md`, oddíl Rozhodnutí, a `lab/dukazy/prihlaseni-egd01-6x.log`): skupina účastníků je
vyjmutá z CA politiky MFA a výzva je registrační nastavení mimo CA. U `egd01` přišla ve 3 z 6 přihlášení (první běh) a v 0 z 6
(druhý běh). V E.ON se to může stát také ⛔.

Nejde-li to ani tak, věta pro IT: „Prosím o dokončení registrace vícefaktorového ověření (MFA) pro můj účet, přihlášení do Microsoft 365 se zastavuje na registraci Microsoft Authenticator.“

## Věty pro ServiceNow

Doplň `<…>`. Jedna věta = jeden požadavek.

- **appId:** „Prosím o appId registrované aplikace v Entra ID tenantu E.ON, přes kterou se smím přihlásit
  nástrojem CLI for Microsoft 365 (device code) k SharePointu; delegovaná oprávnění pro SharePoint a Microsoft Graph podle potřeby CLI (v labu fungovalo SharePoint AllSites.FullControl a Graph User.Read; minimum určí IT) se souhlasem správce a povolené public client flows.
  Účel: nasazování SharePoint Framework aplikací na můj web <URL> (workshop EG.D).“
- **Souhlas pro existující appId (AADSTS65001 / 90094 / 90095):** „Prosím o udělení souhlasu správce
  (admin consent) pro aplikaci s appId <appId> v tenantu E.ON pro delegovaná oprávnění, která CLI for Microsoft 365
  potřebuje (SharePoint a Microsoft Graph User.Read; v labu AllSites.FullControl, minimum určí IT).“
- **Public client flows (AADSTS7000218):** „Prosím o zapnutí Allow public client flows u registrace aplikace
  <appId> (přihlášení CLI for Microsoft 365 metodou device code).“
- **Conditional Access (AADSTS53003 / 50097):** „Prosím o postup nebo výjimku pro přihlášení nástroje CLI for
  Microsoft 365 k SharePointu z mého firemního počítače; přihlášení blokuje Conditional Access (kód <AADSTS…>).“
```

</details>


---

<sub>13s</sub>

### `view`

**view the file at /tmp/cp-run6/home/.copilot/skills/egd-pripravenost/references/zebrik.md.**

`/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/references/zebrik.md`

<details>
<summary>37 lines</summary>

```
# Žebřík variant: co v prostředí účastníka funguje

Pravidlo (kánon projektu, 22. 11.): nepředepisuj jednu cestu. Zkoušej od nejjednodušší varianty dolů,
u každé je test „funguje?“ a co dělat, když ne. Příkaz `node "<S>" varianty` měří, co jde bez zápisu,
a zapíše do zprávy oddíl „Varianty (zebrik)“. Co jsi nakonec použil, dopiš:
`node "<S>" zapis --klic varianta-pouzita-node --stav info --hodnota "1"` (a stejně `-cli`, `-prihlaseni`).
Stav: ✅ změřeno v labu (macOS) · ❓ Windows neměřeno (jen kód a dokumentace) · ⛔ jen E.ON.

## Node (SPFx chce 22.14+ / 24 / 26 📘; CLI chce 20+ ✅)

| # | Varianta | Test „funguje?“ | Když ne |
|---|---|---|---|
| 1 | Node už je v PATH | `node -v` ≥ 22.14 (`nastroje`, `spfx`) ✅ | jdi na 2 |
| 2 | **winget bez admina** (Windows): `winget install OpenJS.NodeJS.LTS --scope user` | `winget --version` (`varianty`); po instalaci nové okno terminálu a `node -v` ❓ Windows | winget chybí nebo je blokovaný → 3 |
| 3 | **Portable archiv** z nodejs.org (zip na Windows, tar.gz na macOS), bez admina; dát na začátek PATH jen v okně terminálu (viz `windows.md`) | `varianty` ukáže, jestli je nodejs.org dosažitelný ✅ (stažení a spuštění Node 18 ✅ na macOS; Node 22 portable na Windows ❓) | nodejs.org blokovaný → 4 |
| 4 | Přes IT: archiv stažený jinde / instalace Node 22 LTS | věta pro IT je ve výpisu `spfx` | bez Node jen cesta B (bez kódu) |

Pro a proti: 1 nic nedělá; 2 je nejpohodlnější, ale je-li `winget` zakázaný, nejde; 3 funguje vždy, ale účastník musí rozbalit a upravit PATH; 4 trvá dny.

## CLI for Microsoft 365 (npm balíček, ne PowerShell modul)

| # | Varianta | Test | Když ne |
|---|---|---|---|
| 1 | **npm lokálně** v pracovní složce: `node "<S>" cli-instalace` | skript ověří `version` po instalaci ✅ (CLI 12 na Node 22) | Node < 20 ✅ nepomůže ani CLI 11 → opravit Node (výše) |
| 2 | `npx` bez instalace | jen záloha ❓ neměřeno; pozor na cizí balíček `m365` na npm (používej `@pnp/cli-microsoft365`) | → 3 |
| 3 | globální `m365` už v PATH (někdo ho nainstaloval) | `varianty` ukáže `m365 --version` ✅ | → 4 |
| 4 | **bez CLI**: prohlížeč (`prohlizec`, `maska`) a ruční nahrání do katalogu | funguje vždy ✅ (jen čtení v prohlížeči) | — |

PowerShell moduly z PSGallery se nepoužívají (PSGallery je u EG.D blokovaná; moduly ze souboru mimo galerii nejsou potřeba, protože CLI je npm) ✅ v labu nebylo třeba.

## Přihlášení

| # | Varianta | Test | Když ne |
|---|---|---|---|
| 1 | **device code** (`--authType deviceCode`) | `varianty` volá endpoint device code bez přihlášení a čeká chybu aplikace (✅ v labu: AADSTS700016/700038 = endpoint žije) | AADSTS53003/50097 ⛔ jen E.ON → 2 |
| 2 | **prohlížeč** (`--authType browser`) | `varianty` ověří, že jde otevřít lokální port ✅; redirect URI `http://localhost` v aplikaci ❓ | → 3 |
| 3 | **appId a souhlas od IT** (věty v `prihlaseni.md`) | `prihlaseni` ukáže účet ✅ v labu jen pod pavel.admin | → 4 |
| 4 | bez CLI (viz výše) | — | — |

Přihlášení dělá vždy člověk. Registrace Authenticatoru: viz `prihlaseni.md`.

## Terminál a Copilot/Claude

| # | Varianta | Poznámka |
|---|---|---|
| Windows PowerShell 5.1 | je všude; skript s ním počítá (jen `node …`, ASCII uvozovky) | ❓ nezměřeno na Windows |
| PowerShell 7 / Git Bash | nepovinné; Git Bash se hodí pro Claude Code | ❓ |
| `copilot` CLI: `winget install GitHub.Copilot` / `npm i @github/copilot` v projektu | `nastroje` hlásí verzi ✅ (1.0.114 na macOS) | winget ❓ Windows |
| VS Code Copilot Chat Agent | `nastroje` nevidí vestavěný Copilot; ověř panel Chat | ❓ |
```

</details>


---

<sub>13s</sub>

### `bash`

**Zobrazit příkazy a pracovní složku**

`$ node "/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" --help && printf '\n--- WORKSPACE ---\n' && pwd && ls -la`

<details>
<summary>28 lines</summary>

```
pripravenost.mjs - kontrola pripravenosti na workshop EG.D (Node 20+ kvuli CLI, SPFx 22.14+; bez zavislosti)

Spoustej v pracovni slozce (vysledky v .pripravenost/vysledky.json):
  node pripravenost.mjs <prikaz> [volby]

Prikazy (jen cteni, pokud neni uvedeno jinak):
  nastroje                       Windows, PowerShell, git, Node/npm, VS Code + Copilot, Copilot CLI, Claude, WSL
  npm                            npm registry, proxy, SSL inspekce (npm ping, npm view)
  sit [--domena egd.cz]          dosazitelnost prihlaseni Microsoft a SharePointu z Node, tenant ID
  cli-instalace [--verze 12|11]  ZAPISUJE LOKALNE: npm install @pnp/cli-microsoft365 do teto slozky
  prihlaseni-prikaz [--appId ID] vypise prikaz pro prihlaseni, ktery spusti clovek ve svem terminalu
  prihlaseni                     overi prihlaseni CLI (m365 status) a tenant
  sharepoint --web <url>         nazev webu, tvoje role, seznamy, katalog aplikaci, licence
  zkouska --web <url> [--ano]    bez --ano jen plan; s --ano ZAPISE 1 seznam "EGD-pripravenost" + 1 polozku a precte ji
  github [--host <host>]         gh auth status: ke kterym GitHub hostum je gh prihlasen + git credential helper (jen cteni)
  varianty                       zebrik variant: co funguje pro Node, CLI a prihlaseni (jen cteni, nic neinstaluje)
  spfx [--instalovat]            Node vs SPFx 1.24; s --instalovat zkusi lokalne yo + generator (stovky MB)
  prohlizec [--web <url>]        adresy k overeni v prohlizeci, kdyz CLI/npm nejde
  maska --high H --low L [--zapsat]  prelozi EffectiveBasePermissions na prava a roli
  zapis --klic K --stav S --hodnota T [--it "veta"]  zapise rucne overeny vysledek
  zprava --jmeno <jmeno>         slozi pripravenost-<jmeno>.md (tabulka + vety pro ServiceNow)
  m365 <argumenty...>            spusti lokalni CLI (napr. login) primo v terminalu

Spolecne volby: --cli <cesta k dist/index.js>, --tenant <tenantId> (vychozi E.ON b914a242-e718-443b-a47c-6b4c649d8c0a)
Navratove kody: 0 hotovo, 1 chyba, 2 spatne pouziti, 10 plan bez zapisu.

--- WORKSPACE ---
/tmp/cp-run6/home/egd-workshop
total 0
drwxr-xr-x@ 2 chocholous  wheel   64 Nov 22 20:54 .
drwxr-xr-x@ 9 chocholous  wheel  288 Nov 22 20:55 ..
<shellId: 0 completed with exit code 0>
```

</details>


---

<sub>38s</sub>

### `bash`

**Prověřit nástroje, npm, síť a varianty**

`$ node "/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" nastroje; node "/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" npm; node "/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" sit --domena pavelchocholousgmail.onmicrosoft.com --tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e; node "/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" varianty`

<details>
<summary>23 lines</summary>

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
[INFO]   npm-registry: https://registry.npmjs.org/
[INFO]   npm-proxy: proxy=null https-proxy=null strict-ssl=true cafile=null HTTPS_PROXY=ne NODE_EXTRA_CA_CERTS=ne
[ZELENA] npm-ping: registry odpovida (PONG)
[ZELENA] npm-stazeni-metadat: @pnp/cli-microsoft365 12.0.0 je dostupny
[ZELENA] entra-dosazitelne: login.microsoftonline.com odpovida, tenant pavelchocholousgmail.onmicrosoft.com = 972a674c-7b85-4e56-a31f-b2f95b42fd1e
[ZELENA] sharepoint-dosazitelny: eonos.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne)
[ZELENA] varianta-node: funguje: 1 uz je (Node 22.14+/24/26 v PATH), 3 portable archiv z nodejs.org (bez admina); nezmereno: 2 winget (jen Windows; na macOS brew nebo portable). Pouzij prvni funkcni: 1 uz je (Node 22.14+/24/26 v PATH)
[ZELENA] varianta-cli: funguje: 1 npm lokalne v pracovni slozce (cli-instalace), 3 globalni m365 uz v PATH, 4 bez CLI: prohlizec (prikaz prohlizec); nezmereno: 2 npx (bez instalace, stahuje pri kazdem behu) (nezkouseno, jen zaloha; pozor na cizi balicek m365 na npm). Pouzij prvni funkcni: 1 npm lokalne v pracovni slozce (cli-instalace)
[ZELENA] varianta-prihlaseni: funguje: 1 device code (--authType deviceCode), 2 prohlizec (--authType browser, redirect na localhost); nezmereno: 3 appId od IT / souhlas spravce (zatim se nikdo neprihlasil). Pouzij prvni funkcni: 1 device code (--authType deviceCode)
[INFO]   varianta-pouzita: uz prihlaseny pres CLI: ne; spusteno z: jiny terminal. Co z toho skutecne pouzijes, dopis: zapis --klic varianta-pouzita-<oblast> --stav info --hodnota "<cislo varianty>"
<shellId: 1 completed with exit code 0>
```

</details>


---

<sub>1m 8s</sub>

### `bash`

**Nainstalovat Microsoft 365 CLI lokálně**

`$ node "/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" cli-instalace`

```
Zalozen package.json v teto slozce (jen pro lokalni instalaci nastroju).
Instaluji @pnp/cli-microsoft365@12 do /private/tmp/cp-run6/home/egd-workshop/node_modules (bez admin prav, muze trvat par minut)...
[ZELENA] cli-instalace: CLI for Microsoft 365 v12.0.0 lokalne v node_modules
[ZELENA] cli-setup: CLI nastaveno pro skripty (bez interaktivnich dotazu)
<shellId: 2 completed with exit code 0>
```


---

<sub>1m 35s</sub>

### `bash`

**Ověřit přihlášení, SharePoint a plán testu**

`$ S="/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs"; node "$S" zapis --klic copilot-licence --stav zluta --hodnota "uzivatel uvadi licenci; v GitHub nastaveni ani VS Code nebylo overeno"; node "$S" zapis --klic weby-dev-test-prod --stav zluta --hodnota "DEV/TEST/PROD weby nejsou objednane"; node "$S" zapis --klic appId --stav cervena --hodnota "appId pro prihlaseni CLI nebylo dodano; tenant ID neni appId" --it "Prosím o appId registrované aplikace v Entra ID tenantu pavelchocholousgmail.onmicrosoft.com pro CLI for Microsoft 365; delegovaná oprávnění SharePoint a Microsoft Graph podle potřeby a souhlas správce."; node "$S" prihlaseni --tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e; node "$S" sharepoint --web https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest --tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e; node "$S" zkouska --web https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest --tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e`

<details>
<summary>21 lines</summary>

```
[ZLUTA]  copilot-licence: uzivatel uvadi licenci; v GitHub nastaveni ani VS Code nebylo overeno
[ZLUTA]  weby-dev-test-prod: DEV/TEST/PROD weby nejsou objednane
[CERVENA] appId: appId pro prihlaseni CLI nebylo dodano; tenant ID neni appId
          veta pro IT: Prosím o appId registrované aplikace v Entra ID tenantu pavelchocholousgmail.onmicrosoft.com pro CLI for Microsoft 365; delegovaná oprávnění SharePoint a Microsoft Graph podle potřeby a souhlas správce.
[ZELENA] prihlaseni: prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e
[ZELENA] prihlaseni: prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e
[ZELENA] web-cteni: "Site catalog test" (https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest)
[ZELENA] role-na-webu: Vlastnik (Full Control) (odhad z EffectiveBasePermissions High 2147483647 / Low 4294705151; zapis polozek ano, sprava seznamu ano)
[ZELENA] seznamy: 7 viditelnych seznamu/knihoven: Apps for SharePoint (4), Documents (0), EGD-pripravenost (3), Events (0), Form Templates (0), Site Pages (3), Style Library (0)
[INFO]   tenant-app-catalog: https://pavelchocholousgmail.sharepoint.com/sites/apps (pro workshop ho nepotrebujeme; zapisujeme jen do katalogu na vlastnim webu)
[ZELENA] site-app-catalog: web ma vlastni katalog aplikaci "Apps for SharePoint" (4 balicku)
[ZELENA] role-v-katalogu: muzes nahrat balicek (.sppkg) do katalogu
[INFO]   licence-m365: licence: FLOW_FREE, SPE_E5
[ZELENA] power-platform-licence: Power Apps / Power Automate v licenci: FLOW_P2_VIRAL, FLOW_O365_P3, POWERAPPS_O365_P3
PLAN ZAPISU (nic se zatim nezapsalo):
  1. na webu https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest zalozit seznam "EGD-pripravenost" (jen kdyz jeste neexistuje)
  2. pridat do nej JEDNU polozku s nazvem "Zkouska chocholous 22. 11. 2026 20:56:42"
  3. precist ji zpatky
Nic se nemaze. Seznam si muzes pozdeji smazat sam v prohlizeci (Obsah webu).
Kdyz s tim clovek souhlasi, spust znovu s volbou --ano.
<shellId: 3 completed with exit code 10>
```

</details>


---

<sub>1m 58s</sub>

### `bash`

**Provést schválený jediný zkušební zápis**

`$ node "/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" zkouska --web https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest --tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e --ano`

```
[ZELENA] prihlaseni: prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e
[ZELENA] zalozeni-seznamu: seznam "EGD-pripravenost" uz existuje, pouzivam ho
[ZELENA] zapis-polozky: polozka 4 zapsana
[ZELENA] cteni-zpet: precteno zpatky: "Zkouska chocholous 22. 11. 2026 20:56:52"
<shellId: 4 completed with exit code 0>
```


---

<sub>2m 7s</sub>

### `bash`

**Prověřit SPFx a GitHub, doplnit zjištěné stavy**

`$ S="/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs"; node "$S" spfx; node "$S" github; node "$S" zapis --klic prihlaseni-identity --stav zluta --hodnota "CLI a SharePoint byly ověřeny, ale přihlášený účet je pavel.admin@pavelchocholousgmail.onmicrosoft.com, ne Test Sest"; node "$S" zapis --klic appId --stav zelena --hodnota "CLI již bylo přihlášeno existujícím profilem; appId nebylo třeba zadávat"; node "$S" zapis --klic varianta-pouzita-node --stav info --hodnota "1 uz je v PATH (Node 22.23.5)"; node "$S" zapis --klic varianta-pouzita-cli --stav info --hodnota "1 npm lokalne v pracovni slozce (CLI 12.0.0)"; node "$S" zapis --klic varianta-pouzita-prihlaseni --stav info --hodnota "jiz prihlaseny existujicim CLI profilem"`

<details>
<summary>12 lines</summary>

```
[ZELENA] node-pro-spfx-1.24: Node v22.23.5; SPFx 1.24 chce 22 / 24 / 26 (22 aspon 22.14). Gulp uz neni, build je Heft.
[ZELENA] generator-dostupny: @microsoft/generator-sharepoint@1.24.1 je v registry
Zkusebni instalaci generatoru spustis volbou --instalovat (stahne cca stovky MB do .pripravenost/spfx-test).
[ZLUTA]  github-hosty: gh neni k zadnemu hostu prihlasen (nebo vypis nejde precist)
          co dal: postup v references/github.md krok 4: gh auth login --hostname <adresa firemniho GitHubu>
[INFO]   git-credential-helper: osxkeychain
[ZLUTA]  prihlaseni-identity: CLI a SharePoint byly ověřeny, ale přihlášený účet je pavel.admin@pavelchocholousgmail.onmicrosoft.com, ne Test Sest
[ZELENA] appId: CLI již bylo přihlášeno existujícím profilem; appId nebylo třeba zadávat
[INFO]   varianta-pouzita-node: 1 uz je v PATH (Node 22.23.5)
[INFO]   varianta-pouzita-cli: 1 npm lokalne v pracovni slozce (CLI 12.0.0)
[INFO]   varianta-pouzita-prihlaseni: jiz prihlaseny existujicim CLI profilem
<shellId: 5 completed with exit code 0>
```

</details>


---

<sub>2m 12s</sub>

### `bash`

**Připravit záložní odkazy pro kontrolu v prohlížeči**

`$ node "/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" prohlizec --web https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest`

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
<shellId: 6 completed with exit code 0>
```

</details>


---

<sub>2m 15s</sub>

### `bash`

**Vytvořit zprávu o připravenosti**

`$ node "/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs" zprava --jmeno "Test Sest"`

```
Zprava ulozena: /private/tmp/cp-run6/home/egd-workshop/pripravenost-Test-Sest.md
Nastroj: Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
Cesta: A: vlastni SPFx aplikace na webu (vse potrebne funguje)
Zelena 29 / zluta 5 / cervena 0
<shellId: 7 completed with exit code 0>
```


---

<sub>2m 17s</sub>

### `view`

**view the file at /private/tmp/cp-run6/home/egd-workshop/pripravenost-Test-Sest.md.**

`/private/tmp/cp-run6/home/egd-workshop/pripravenost-Test-Sest.md`

<details>
<summary>90 lines</summary>

```
# Pripravenost na workshop - Test-Sest

Vytvoreno 22. 11. 2026 20:57:22 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
- **Nejjednodussi cesta k prvni appce:** A: vlastni SPFx aplikace na webu (vse potrebne funguje)
- **Web:** https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest
- **Prihlaseni CLI:** pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904

Soucty: zelena 29, zluta 5, cervena 0.

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
| entra-dosazitelne | zelena | login.microsoftonline.com odpovida, tenant pavelchocholousgmail.onmicrosoft.com = 972a674c-7b85-4e56-a31f-b2f95b42fd1e |
| sharepoint-dosazitelny | zelena | eonos.sharepoint.com odpovida (HTTP 403; 401/403 bez prihlaseni je spravne) |

## Pripojeni k SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| cli-instalace | zelena | CLI for Microsoft 365 v12.0.0 lokalne v node_modules |
| cli-setup | zelena | CLI nastaveno pro skripty (bez interaktivnich dotazu) |
| prihlaseni | zelena | prihlasen pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904, tenant 972a674c-7b85-4e56-a31f-b2f95b42fd1e |

## Ovladani SharePointu

| Kontrola | Stav | Vysledek |
|---|---|---|
| web-cteni | zelena | "Site catalog test" (https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest) |
| role-na-webu | zelena | Vlastnik (Full Control) (odhad z EffectiveBasePermissions High 2147483647 / Low 4294705151; zapis polozek ano, sprava seznamu ano) |
| seznamy | zelena | 7 viditelnych seznamu/knihoven: Apps for SharePoint (4), Documents (0), EGD-pripravenost (3), Events (0), Form Templates (0), Site Pages (3), Style Library (0) |
| tenant-app-catalog | info | https://pavelchocholousgmail.sharepoint.com/sites/apps (pro workshop ho nepotrebujeme; zapisujeme jen do katalogu na vlastnim webu) |
| site-app-catalog | zelena | web ma vlastni katalog aplikaci "Apps for SharePoint" (4 balicku) |
| role-v-katalogu | zelena | muzes nahrat balicek (.sppkg) do katalogu |
| zalozeni-seznamu | zelena | seznam "EGD-pripravenost" uz existuje, pouzivam ho |
| zapis-polozky | zelena | polozka 4 zapsana |
| cteni-zpet | zelena | precteno zpatky: "Zkouska chocholous 22. 11. 2026 20:56:52" |

## Varianty (zebrik)

| Kontrola | Stav | Vysledek |
|---|---|---|
| varianta-node | zelena | funguje: 1 uz je (Node 22.14+/24/26 v PATH), 3 portable archiv z nodejs.org (bez admina); nezmereno: 2 winget (jen Windows; na macOS brew nebo portable). Pouzij prvni funkcni: 1 uz je (Node 22.14+/24/26 v PATH) |
| varianta-cli | zelena | funguje: 1 npm lokalne v pracovni slozce (cli-instalace), 3 globalni m365 uz v PATH, 4 bez CLI: prohlizec (prikaz prohlizec); nezmereno: 2 npx (bez instalace, stahuje pri kazdem behu) (nezkouseno, jen zaloha; pozor na cizi balicek m365 na npm). Pouzij prvni funkcni: 1 npm lokalne v pracovni slozce (cli-instalace) |
| varianta-prihlaseni | zelena | funguje: 1 device code (--authType deviceCode), 2 prohlizec (--authType browser, redirect na localhost); nezmereno: 3 appId od IT / souhlas spravce (zatim se nikdo neprihlasil). Pouzij prvni funkcni: 1 device code (--authType deviceCode) |
| varianta-pouzita | info | uz prihlaseny pres CLI: ne; spusteno z: jiny terminal. Co z toho skutecne pouzijes, dopis: zapis --klic varianta-pouzita-<oblast> --stav info --hodnota "<cislo varianty>" |

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

## Zalozni cesty

| Kontrola | Stav | Vysledek |
|---|---|---|
| licence-m365 | info | licence: FLOW_FREE, SPE_E5 |
| power-platform-licence | zelena | Power Apps / Power Automate v licenci: FLOW_P2_VIRAL, FLOW_O365_P3, POWERAPPS_O365_P3 |

## Rucne overeno

| Kontrola | Stav | Vysledek |
|---|---|---|
| copilot-licence | zluta | uzivatel uvadi licenci; v GitHub nastaveni ani VS Code nebylo overeno |
| weby-dev-test-prod | zluta | DEV/TEST/PROD weby nejsou objednane |
| appId | zelena | CLI již bylo přihlášeno existujícím profilem; appId nebylo třeba zadávat |
| prihlaseni-identity | zluta | CLI a SharePoint byly ověřeny, ale přihlášený účet je pavel.admin@pavelchocholousgmail.onmicrosoft.com, ne Test Sest |
| varianta-pouzita-node | info | 1 uz je v PATH (Node 22.23.5) |
| varianta-pouzita-cli | info | 1 npm lokalne v pracovni slozce (CLI 12.0.0) |
| varianta-pouzita-prihlaseni | info | jiz prihlaseny existujicim CLI profilem |

## Objednávky předem (E.ON ITSM)

Účastníci mají předem zařídit tři věci. Stav podle této kontroly:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | neoverene | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |
| 3 weby DEV / TEST / PROD | hotovo | ITSM „SharePoint Online \| New Site Creation“, ostatní účastníci jako site members. |
| Katalog aplikací (site collection app catalog) na webu | hotovo | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na sharepoint@eon.com (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |

## Vety pro ServiceNow

Nic neni potreba.
```

</details>


---

<sub>2m 27s</sub>

### `bash`

**Srovnat stav přihlášení ve zprávě**

`$ S="/tmp/cp-run6/home/.copilot/skills/egd-pripravenost/scripts/pripravenost.mjs"; node "$S" zapis --klic varianta-pouzita --stav info --hodnota "uz existujici prihlaseny CLI profil, ktery prihlaseni a zkouska uspesne overily"; node "$S" zprava --jmeno "Test Sest"`

<details>
<summary>6 lines</summary>

```
[INFO]   varianta-pouzita: uz existujici prihlaseny CLI profil, ktery prihlaseni a zkouska uspesne overily

Zprava ulozena: /private/tmp/cp-run6/home/egd-workshop/pripravenost-Test-Sest.md
Nastroj: Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
Cesta: A: vlastni SPFx aplikace na webu (vse potrebne funguje)
Zelena 29 / zluta 5 / cervena 0
<shellId: 8 completed with exit code 0>
```

</details>


---

<sub>2m 39s</sub>

### `apply_patch`

<details>
<summary>Arguments</summary>

```json
"*** Begin Patch\n*** Update File: /private/tmp/cp-run6/home/egd-workshop/pripravenost-Test-Sest.md\n@@\n ## Doporuceni\n \n - **Nastroj na stredu:** Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)\n-- **Nejjednodussi cesta k prvni appce:** A: vlastni SPFx aplikace na webu (vse potrebne funguje)\n+- **Mozna cesta k prvni appce:** A: vlastni SPFx aplikace na webu; Node, CLI a katalog jsou technicky pripraveny, ale pristup byl overen pod uctem pavel.admin, ne Test Sest. Pred nasazenim je treba overit ucet Test Sest. Appka nebyla vytvorena ani nasazena.\n - **Web:** https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest\n-- **Prihlaseni CLI:** pavel.admin@pavelchocholousgmail.onmicrosoft.com, appId 12f19539-b70a-499d-b6dc-517a32c0e904\n+- **Prihlaseni CLI (overena identita):** pavel.admin@pavelchocholousgmail.onmicrosoft.com, nikoli Test Sest; appId 12f19539-b70a-499d-b6dc-517a32c0e904\n+\n+Zapis do SharePointu byl omezen na uzivatelem predem schvaleny test: jedna polozka v seznamu EGD-pripravenost. Zadne dalsi polozky, seznamy ani aplikace nebyly vytvoreny; nic nebylo odeslano.\n@@\n-## Objednávky předem (E.ON ITSM)\n+## Objednavky a omezeni (lab tenant)\n \n-Účastníci mají předem zařídit tři věci. Stav podle této kontroly:\n+Tento tenant je podle uzivatele lab, nikoli E.ON. Postupy E.ON ITSM se na nej nevztahuji. Stav:\n \n | Co | Stav | Jak |\n |---|---|---|\n-| Licence GitHub Copilot | neoverene | ITSM „my IT order“ → GitHub Copilot; potřeba schválení T. Richtera a vedoucího, k žádosti přiložit screenshot. Platí jen pro Copilot; s Claude není potřeba. |\n-| 3 weby DEV / TEST / PROD | hotovo | ITSM „SharePoint Online \\| New Site Creation“, ostatní účastníci jako site members. |\n-| Katalog aplikací (site collection app catalog) na webu | hotovo | Zakládá ručně Product Team E.ON, žádost jako vlastník webu na sharepoint@eon.com (ne přes ITSM); lhůta nejistá, požádej hned. Custom script se povoluje jen na 24 hodin na žádost tamtéž, pro web part s requiresCustomScript: false není potřeba. |\n+| Licence GitHub Copilot | neoverena | Uzivatel uvadi, ze licenci ma; nastaveni GitHubu ani VS Code nebylo overeno. |\n+| Weby DEV / TEST / PROD | neobjednane | Podle uzivatele nejsou objednane. |\n+| Katalog aplikaci na zadanem DEV webu | overeno pod pavel.admin | Vlastni katalog webu je dostupny a ucet pavel.admin do nej muze zapisovat; opravneni uctu Test Sest nebylo overeno. |\n \n ## Vety pro ServiceNow\n \n-Nic neni potreba.\n+E.ON ServiceNow pozadavky se na tento lab tenant nevztahuji. Nebyl odeslan zadny pozadavek.\n*** End Patch\n"
```

</details>

```
Modified 1 file(s): /private/tmp/cp-run6/home/egd-workshop/pripravenost-Test-Sest.md
```


---

<sub>2m 43s</sub>

### `view`

**view the file at /private/tmp/cp-run6/home/egd-workshop/pripravenost-Test-Sest.md.**

`/private/tmp/cp-run6/home/egd-workshop/pripravenost-Test-Sest.md (lines 1-18)`

<details>
<summary>11 lines</summary>

```
# Pripravenost na workshop - Test-Sest

Vytvoreno 22. 11. 2026 20:57:34 skriptem egd-pripravenost. Bez tokenu a hesel.

## Doporuceni

- **Nastroj na stredu:** Claude Code (je nainstalovany a funguje); je i Copilot CLI (jen kdyz mas licenci Copilot)
- **Mozna cesta k prvni appce:** A: vlastni SPFx aplikace na webu; Node, CLI a katalog jsou technicky pripraveny, ale pristup byl overen pod uctem pavel.admin, ne Test Sest. Pred nasazenim je treba overit ucet Test Sest. Appka nebyla vytvorena ani nasazena.
- **Web:** https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest
- **Prihlaseni CLI (overena identita):** pavel.admin@pavelchocholousgmail.onmicrosoft.com, nikoli Test Sest; appId 12f19539-b70a-499d-b6dc-517a32c0e904

Zapis do SharePointu byl omezen na uzivatelem predem schvaleny test: jedna polozka v seznamu EGD-pripravenost. Zadne dalsi polozky, seznamy ani aplikace nebyly vytvoreny; nic nebylo odeslano.

Soucty: zelena 29, zluta 5, cervena 0.

## Nastroje

| Kontrola | Stav | Vysledek |
```

</details>


---

<sub>2m 43s</sub>

### `view`

**view the file at /private/tmp/cp-run6/home/egd-workshop/pripravenost-Test-Sest.md.**

`/private/tmp/cp-run6/home/egd-workshop/pripravenost-Test-Sest.md (lines 72-end)`

<details>
<summary>35 lines</summary>

```

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

## Zalozni cesty

| Kontrola | Stav | Vysledek |
|---|---|---|
| licence-m365 | info | licence: FLOW_FREE, SPE_E5 |
| power-platform-licence | zelena | Power Apps / Power Automate v licenci: FLOW_P2_VIRAL, FLOW_O365_P3, POWERAPPS_O365_P3 |

## Rucne overeno

| Kontrola | Stav | Vysledek |
|---|---|---|
| varianta-pouzita | info | uz existujici prihlaseny CLI profil, ktery prihlaseni a zkouska uspesne overily |
| copilot-licence | zluta | uzivatel uvadi licenci; v GitHub nastaveni ani VS Code nebylo overeno |
| weby-dev-test-prod | zluta | DEV/TEST/PROD weby nejsou objednane |
| appId | zelena | CLI již bylo přihlášeno existujícím profilem; appId nebylo třeba zadávat |
| prihlaseni-identity | zluta | CLI a SharePoint byly ověřeny, ale přihlášený účet je pavel.admin@pavelchocholousgmail.onmicrosoft.com, ne Test Sest |
| varianta-pouzita-node | info | 1 uz je v PATH (Node 22.23.5) |
| varianta-pouzita-cli | info | 1 npm lokalne v pracovni slozce (CLI 12.0.0) |
| varianta-pouzita-prihlaseni | info | jiz prihlaseny existujicim CLI profilem |

## Objednavky a omezeni (lab tenant)

Tento tenant je podle uzivatele lab, nikoli E.ON. Postupy E.ON ITSM se na nej nevztahuji. Stav:

| Co | Stav | Jak |
|---|---|---|
| Licence GitHub Copilot | neoverena | Uzivatel uvadi, ze licenci ma; nastaveni GitHubu ani VS Code nebylo overeno. |
| Weby DEV / TEST / PROD | neobjednane | Podle uzivatele nejsou objednane. |
| Katalog aplikaci na zadanem DEV webu | overeno pod pavel.admin | Vlastni katalog webu je dostupny a ucet pavel.admin do nej muze zapisovat; opravneni uctu Test Sest nebylo overeno. |

## Vety pro ServiceNow

E.ON ServiceNow pozadavky se na tento lab tenant nevztahuji. Nebyl odeslan zadny pozadavek.
```

</details>


---

<sub>2m 43s</sub>

### `rg`

**token|heslo|password|secret|Bearer|Objednávky předem \\(E.ON ITSM\\)|vse potrebne funguje**

`"token|heslo|password|secret|Bearer|Objednávky předem \(E.ON ITSM\)|vse potrebne funguje" (pripravenost-Test-Sest.md)`

```
/private/tmp/cp-run6/home/egd-workshop/pripravenost-Test-Sest.md:3:Vytvoreno 22. 11. 2026 20:57:34 skriptem egd-pripravenost. Bez tokenu a hesel.
```


---

<sub>2m 50s</sub>

### Copilot

Technické prostředí je připravené, ale přihlášení nebylo pod účtem Test Sest: SharePoint ověřil účet **pavel.admin**. Po předchozím souhlasu jsem do existujícího seznamu `EGD-pripravenost` přidal a zpětně ověřil jedinou testovací položku; žádnou aplikaci ani další položku jsem nevytvořil a nic neodeslal.

Zpráva je v `/private/tmp/cp-run6/home/egd-workshop/pripravenost-Test-Sest.md`. GitHub přihlášení a Copilot licenci se nepodařilo ověřit; weby DEV/TEST/PROD jsou podle vás neobjednané.

---

<sub>Generated by [GitHub Copilot CLI](https://github.com/features/copilot/cli)</sub>
