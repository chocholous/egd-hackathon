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

⛔ Pozor: účet spravovaný firmou (EMU) Copilot Free mít nesmí a po přidělení firemní licence se osobní plán přepíše 📘. Jedna věta: založ si bezplatný osobní účet na https://github.com/signup (bez karty; zda smíš firemní e-mail, ověř u nadřízeného, jinak soukromý), ve VS Code **Sign in with GitHub** a v Copilot Chatu **Sign up for Copilot Free**; Free zahrnuje agent mode i Copilot CLI 📘, ale s limity: 2 000 návrhů kódu měsíčně, „omezené“ použití chatu a agenta (přesné číslo GitHub neuvádí), jen automatický výběr modelu 📘. Na Free účtu jsem to **neověřoval** ❓. **Pošli lektorovi (Pavlovi) své uživatelské jméno na GitHubu** (login, ne heslo; třeba i na adresu, kterou ti řekne): bez osobního účtu a jeho loginu tě nejde pozvat do záložní organizace a pozvánku bys nepřijal. Dostaneš-li později firemní licenci, přepíše osobní plán.

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

Zdroje 📘: GitHub Docs „Authenticating to an account on GHE.com“ (docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/configure-personal-settings/authenticate-to-ghecom), „Authenticate Copilot CLI“, manuál `gh auth login`, Claude Code docs „GitHub Enterprise Server“.
