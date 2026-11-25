# Obecné skilly a pluginy (ZIP)

Doplňky ke skillům `egd-*` ve složce [../skills](../skills). Skilly `egd-*` je k běhu nepotřebují, protože E2E
cesta účastníka prošla jen s nimi. Hodí se, když chceš jít dál než první appka. Zabalené 25. 11. 2026
z Pavlovy instalace (pluginy z marketplace `ppf-skills`, verze níže, a vlastní skilly z `~/.claude/skills`).

| ZIP | Co to je | Pozn. |
|---|---|---|
| [ppf-citizen-ai-devkit-0.8.0.zip](ppf-citizen-ai-devkit-0.8.0.zip) | Citizen AI developer kit: SPFx appka ze šablony, vývoj nad mocky, listy, práva a stránky v manifestu, nasazení na DEV/TEST s plánem, sonda stránky, připomínky testerů | psaný pro PPF tenant: v `templates/project/project_config.json` přepiš `m365.tenantId` a `appId` na svůj tenant; závisí na třech ZIPech pod ním |
| [m365-cli-12-2.0.0.zip](m365-cli-12-2.0.0.zip) | CLI for Microsoft 365 verze 12: vyhledání příkazu místo hádání, vlastní přihlašovací HOME, tabulka chyb | MIT |
| [ppf-browsermagic-0.9.0.zip](ppf-browsermagic-0.9.0.zip) | uložené přihlášení do SharePointu pro Playwright (sonda stránek) | výchozí web v `template/auth-refresh.mjs` je PPF, přepiš ho |
| [ppf-material-1.1.0.zip](ppf-material-1.1.0.zip) | design system PPF + Material Design 3 (vzhled kitu) | značka PPF; pro EG.D/E.ON použij značku ze šablony `egd-prvni-appka` |
| [playwright-cli-1.0.2.zip](playwright-cli-1.0.2.zip) | ovládání prohlížeče z příkazové řádky | |
| [spfx-ship.zip](spfx-ship.zip) | od scaffoldu po stránku v prohlížeči: build, katalog aplikací, nasazení | měřeno 5.–6. 11. v labu a PPF tenantu, CLI 11 |
| [spfx-develop.zip](spfx-develop.zip) | psaní SPFx: víc web partů, Heft, property pane | ❓ bez odkazu na měření |
| [spfx-performance.zip](spfx-performance.zip) | schovat rámec SharePointu, menší bundle, změřit dopad | ❓ bez odkazu na měření |
| [sharepoint-tenant-recon.zip](sharepoint-tenant-recon.zip) | jen čtení: co v tenantu smíš, věta pro IT | |
| [m365-cli-safe.zip](m365-cli-safe.zip) | CLI for Microsoft 365 při víc sessions: izolace přihlášení, pinování cíle, CLI 11 vs 12 | |

## Instalace

- **Pluginy** (`ppf-*`, `m365-cli-12`, `playwright-cli`): ZIP obsahuje složku pluginu s `.claude-plugin/plugin.json`
  a `skills/<jméno>/`. Pro Claude Code nebo GitHub Copilot stačí zkopírovat `skills/<jméno>/` do osobní složky
  skillů (`~/.claude/skills/` nebo `~/.copilot/skills/`). Kit potřebuje všechny čtyři: devkit, m365-cli-12,
  ppf-browsermagic a ppf-material.
- **Samostatné skilly** (`spfx-*`, `sharepoint-tenant-recon`, `m365-cli-safe`): rozbal do osobní složky skillů.

Prompt pro agenta je stejný jako u `egd-*` (viz [přehledová stránka](https://chocholous.github.io/egd-hackathon/#instalace)),
jen s cestou k rozbaleným ZIPům.

## Kontrola před zveřejněním (25. 11. 2026)

Gitleaks: žádné klíče ani hesla (5 nálezů v `otisky.json` jsou SHA-256 otisky souborů). Ručně prohledáno na
e-maily, interní adresy a ID a upraveno proti Pavlově instalaci:

- `templates/project/project_config.json` devkitu má prázdné `m365.tenantId` a `m365.appId` (doplň za svůj tenant;
  `npm run prereq` do té doby hlásí, co chybí),
- adresy testovacího webu a interního marketplace PPF jsou pryč (výchozí web v `auth-refresh.mjs` je `contoso`),
- ukázková data v `ppf-material/examples` (organigram, vyhledávání, schvalování) mají smyšlená jména, e-maily
  `@example.com`, telefony `+420 000 000 …` a adresy; e-maily v testech devkitu jsou `@contoso.cz`,
- testy šablony devkitu po úpravě: 137 z 140 prošlo, tytéž 3 padají i v neupravené verzi.

Písma PPF v `ppf-material` zůstávají. Upravené soubory šablony devkitu neodpovídají otiskům v `otisky.json`,
takže `devkit update` je u nich ukáže jako změněné uživatelem.
