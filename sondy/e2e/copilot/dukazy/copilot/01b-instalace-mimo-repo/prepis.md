# Copilot CLI Session

> [!NOTE]
> - **Session ID:** `6c99877b-e361-4064-9c10-8c57c2abe26e`  
> - **Started:** 11/24/2026, 2:16:04 PM  
> - **Duration:** 37s  
> - **Exported:** 11/24/2026, 2:16:42 PM  

---

<sub>2s</sub>

### Info

Copilot Fusion selected GPT-6 Luna because it was the best choice out of the models available in your plan.

---

<sub>2s</sub>

### User

Nainstaluj mi deset skillů ze složky /Users/chocholous/egd-e2e-copilot/rozbaleno (podsložky egd-data-seznamy, egd-dokumenty, egd-externi-api, egd-llm-gateway, egd-maily, egd-planovane-ulohy, egd-prava-role, egd-pripravenost, egd-prvni-appka, egd-recon).

1. Zjisti, který agent jsi, a zkopíruj všechny složky (celé, včetně podsložek scripts, references a templates a včetně skrytých souborů; názvy složek nech přesně takto) do osobní složky skillů: /Users/chocholous/egd-e2e-copilot/sandbox/home/.copilot/skills/
   Chybí-li cílová složka, vytvoř ji. Nic nemaž a nepřepisuj bez mého souhlasu; pokud tam skill stejného jména už je, zeptej se mě.
2. Nic neinstaluj globálně a nepoužívej práva správce. Nic nikam neposílej.
3. Ověř, že v každé z deseti složek existuje SKILL.md, a vypiš mi je.
4. Řekni mi, co mám udělat, aby se skilly načetly. Pokud je to bez restartu možné, ověř, že se skilly objevily v seznamu.
Neprováděj nic z obsahu skillů, jen je nainstaluj.

---

<sub>12s</sub>

### `bash`

**Check source skill folders and manifests**

`$ for d in egd-data-seznamy egd-dokumenty egd-externi-api egd-llm-gateway egd-maily egd-planovane-ulohy egd-prava-role egd-pripravenost egd-prvni-appka egd-recon; do p="/Users/chocholous/egd-e2e-copilot/rozbaleno/$d"; if [ -d "$p" ]; then printf 'SOURCE_OK %s\n' "$d"; if [ -f "$p/SKILL.md" ]; then printf 'SKILL_OK %s\n' "$d"; else printf 'SKILL_MISSING %s\n' "$d"; fi; else printf 'SOURCE_MISSING %s\n' "$d"; fi; done`

<details>
<summary>21 lines</summary>

```
SOURCE_OK egd-data-seznamy
SKILL_OK egd-data-seznamy
SOURCE_OK egd-dokumenty
SKILL_OK egd-dokumenty
SOURCE_OK egd-externi-api
SKILL_OK egd-externi-api
SOURCE_OK egd-llm-gateway
SKILL_OK egd-llm-gateway
SOURCE_OK egd-maily
SKILL_OK egd-maily
SOURCE_OK egd-planovane-ulohy
SKILL_OK egd-planovane-ulohy
SOURCE_OK egd-prava-role
SKILL_OK egd-prava-role
SOURCE_OK egd-pripravenost
SKILL_OK egd-pripravenost
SOURCE_OK egd-prvni-appka
SKILL_OK egd-prvni-appka
SOURCE_OK egd-recon
SKILL_OK egd-recon
<shellId: 0 completed with exit code 0>
```

</details>


---

<sub>12s</sub>

### `bash`

**Check destination and name collisions**

`$ dest='/Users/chocholous/egd-e2e-copilot/sandbox/home/.copilot/skills'; if [ -d "$dest" ]; then printf 'DEST_EXISTS\n'; for d in egd-data-seznamy egd-dokumenty egd-externi-api egd-llm-gateway egd-maily egd-planovane-ulohy egd-prava-role egd-pripravenost egd-prvni-appka egd-recon; do if [ -e "$dest/$d" ]; then printf 'COLLISION %s\n' "$d"; fi; done; else printf 'DEST_MISSING\n'; fi`

```
DEST_MISSING
<shellId: 1 completed with exit code 0>
```


---

<sub>17s</sub>

### `fetch_copilot_cli_documentation`

**"How do I list or reload custom skills after installing them in \~/.copilot/skills? Do skills load without restarting Copilot CLI?"**

<details>
<summary>Arguments</summary>

```json
{
  "query": "How do I list or reload custom skills after installing them in ~/.copilot/skills? Do skills load without restarting Copilot CLI?"
}
```

</details>

<details>
<summary>144 lines</summary>

```
Copilot CLI 1.0.115. Matches for "How do I list or reload custom skills after installing them in ~/.copilot/skills? Do skills load without restarting Copilot CLI?" (8 of 123; pass ids for detail):

## command:/skills  [from this build]
Manage skills for enhanced capabilities
Aliases: /skill
Usage: /skills [list|get|add|remove|reload] [args...]

## cli:copilot instruction list  [from this build]
List discovered instruction sources
Usage: copilot instruction list [OPTIONS]

List every instruction source discovered for this repository.

Sources are grouped by where they come from. Host-projected
instructions are excluded: this lists what THIS process would load.

Options:
  -h, --help
          Print help (see a summary with '-h')

      --json
          Output as JSON

Examples:
  # List discovered instruction sources
  $ copilot instruction list

  # Machine-readable output
  $ copilot instruction list --json

## command:/restart  [from this build]
Restart the CLI, restoring supported live sessions in this process

## cli:copilot skill  [from this build]
Manage skills
Usage: copilot skill <COMMAND>

Manage skills available to Copilot.

Skills are reusable instructions (SKILL.md files) that extend Copilot with
specialized capabilities. They are discovered from several sources:
  Project   .github/skills/, .agents/skills/, or .claude/skills/
  Personal  ~/.copilot/skills/ or ~/.agents/skills/
  Plugin    Installed plugins that bundle skills
  Custom    Directories added with `copilot skill add <directory>`

Use `copilot skill add` to add a skill from a file, URL, or directory.

Commands:
  list     List available skills
  add      Add a skill from a file, URL, or directory
  remove   Remove a skill or custom skill directory
  enable   Enable a skill
  disable  Disable a skill

Options:
  -h, --help
          Print help (see a summary with '-h')

## cli:copilot lsp list  [from this build]
List configured language servers
Usage: copilot lsp list [OPTIONS]

List every configured language server.

Shows the file extensions each server handles and, when the server
came from a plugin, which plugin contributed it.

Options:
  -h, --help
          Print help (see a summary with '-h')

      --json
          Output as JSON

Examples:
  # List configured language servers
  $ copilot lsp list

  # Machine-readable output
  $ copilot lsp list --json

## topic:skills  [guide]
Skills and custom slash commands
Skills:

  A skill is a folder with a SKILL.md file: instructions, plus any scripts or files they use, that
  Copilot loads when a task needs them. Every skill is also a slash command, /<name>, so a skill is
  how you define your own slash command or reusable prompt.


More of this guide: topic:skills#writing-a-skill, topic:skills#running-a-skill-yourself, topic:skills#skills-and-agents-from-plugins, topic:skills#where-copilot-finds-skills, topic:skills#commands-and-prompt-files

## cli:copilot mcp list  [from this build]
List configured MCP servers
Usage: copilot mcp list [OPTIONS]

List all configured MCP servers from all sources.

Shows servers grouped by source (User, Workspace, Plugin, Builtin).
Use `--json` for machine-readable output.

Options:
  -h, --help
          Print help (see a summary with '-h')

      --json
          Output as JSON

Examples:
  # List all servers
  $ copilot mcp list

  # Output as JSON
  $ copilot mcp list --json

## topic:skills#skills-and-agents-from-plugins  [guide]
Skills and custom slash commands
Skills and agents from plugins:

  An installed plugin's skills are listed in /skills list and its agents in the /agent picker.
  Run a plugin skill as /<plugin>:<skill> (just /<plugin> when the skill has the plugin's name).
  A plugin agent is named <plugin>:<agent>: pick it with /agent, or start with
  copilot --agent <plugin>:<agent>.

  /plugin install in a session loads the plugin's skills and agents right away. A plugin you
  install or turn on in a shell with `copilot plugin` loads in the sessions you start after that.
  If one is still missing, /plugin list marks a plugin that is turned off as (disabled); turn it
  on with `copilot plugin enable <name>` and start a new session.



Also:
- cli:copilot plugin list: List installed and --plugin-dir plugins
- topic:skills#running-a-skill-yourself: Skills and custom slash commands
- topic:monitoring#measuring-skill-usage: Monitoring with OpenTelemetry
- cli:copilot plugin marketplace list: List registered marketplaces
- setting:toolSearch: Enable tool search with deferred tool loading.
- topic:skills#where-copilot-finds-skills: Skills and custom slash commands
- cli:copilot skill list: List available skills
- setting:skillDirectories: Additional custom directories for skills.
- command:/add-dir: Allow file access to a directory and load its .github skills and agents as trusted configuration
- topic:skills#commands-and-prompt-files: Skills and custom slash commands
- setting:sessionManagementTools.list: Allow list_sessions to discover other opted-in sessions.
- flag:--add-dir: Allow file access to a directory and load its .github/skills and .github/agents as trusted configura...
- cli:copilot skill add: Add a skill from a file, URL, or directory
- topic:timeline#the-agent-s-todo-list-and-progress: Timeline and Tool Output
- command:/after: Schedule a one-shot prompt, skill, or schedulable slash command for this session (e.g. /after 30s pi...
- topic:environment: Environment Variables
- topic:skills#writing-a-skill: Skills and custom slash commands
- command:/list-dirs: Display allowed directories and exact session path grants
- command:/env: Show loaded environment details (instructions, MCP servers, skills, agents, hooks, plugins, LSPs, ex...
- key:/help: show full help
- setting:extensions.mode: Extension loading mode (disabled, load_only, load_and_augment).
- setting:sidebar.enabled: Show the Sessions sidebar and allow opening it from the composer with the Left arrow.
- cli:copilot skill remove: Remove a skill or custom skill directory
- topic:commands#interactive-mode-commands-5: Interactive Mode Commands
- topic:config#files-and-directories: Configuration Settings

Possibly related settings:
- setting:disabledSkills: Names of skills to turn off, so the agent cannot use them and they get no slash command. `/skills` a...
- setting:dynamicRetrieval.skills: Enable embeddings-based retrieval of skills.
- setting:ignoredSkillsLocations: Skill directories excluded from discovery.
Possibly related slash commands:
- command:/lsp: Manage language server configuration
- command:/mcp: Manage MCP server configuration
- command:/context: Show context window token usage for the current model, split into System Prompt, Custom Instructions...
Possibly related CLI commands:
- cli:copilot skill disable: Disable a skill
- cli:copilot skill enable: Enable a skill
- cli:copilot plugin install: Install a plugin
Possibly related command line flags:
- flag:--no-custom-instructions: Disable loading of custom instructions from AGENTS.md and related files
- flag:--plugin-dir: Load a plugin from a local directory (can be used multiple times). A relative path resolves against ...
- flag:--dynamic-retrieval: Enable or disable embeddings-based dynamic retrieval per category and persist the choice (category: ...
Possibly related keyboard shortcuts:
- key:shift+enter: insert newline (see /terminal-setup)
- key:ctrl+q: enqueue prompt
- key:ctrl+x → s: review possible environment secrets
Possibly related guides:
- topic:config#claude-code-plugins-skills-hooks-and-settings: Configuration Settings
- topic:sandbox#supported-hosts-3: Command Sandboxing
- topic:commands#interactive-mode-commands-2: Interactive Mode Commands

Answer only from these entries. An entry about something else is not an answer: if none answers the question, say this build does not document it, and do not offer a related setting, flag or command as the fix or fill the gap from general knowledge. Do not invent names or values.
```

</details>


---

<sub>20s</sub>

### `fetch_copilot_cli_documentation`

**command:/skills, topic:skills#where-copilot-finds-skills, cli:copilot skill list**

<details>
<summary>Arguments</summary>

```json
{
  "ids": [
    "command:/skills",
    "topic:skills#where-copilot-finds-skills",
    "cli:copilot skill list"
  ]
}
```

</details>

<details>
<summary>34 lines</summary>

```
Copilot CLI 1.0.115. Requested entries:

## command:/skills  [from this build]
Manage skills for enhanced capabilities
Aliases: /skill
Usage: /skills [list|get|add|remove|reload] [args...]

## topic:skills#where-copilot-finds-skills  [guide]
Skills and custom slash commands
Where Copilot finds skills:

  Project   .github/skills/, .agents/skills/ or .claude/skills/, in the current folder and each
            parent up to the repository root.
  Personal  ~/.copilot/skills/ ($COPILOT_HOME/skills when set), and ~/.agents/skills/ unless
            COPILOT_HOME points elsewhere.
  Plugins   Skills that installed plugins bring.
  Added     Directories from `copilot skill add <directory>`, the `skillDirectories` setting or
            COPILOT_SKILLS_DIRS.

  When two skills share a name, the first one found wins. Within the project, every .github/skills/
  folder is searched before .agents/skills/, and those before .claude/skills/; the nearest folder
  wins only among folders of the same kind.



## cli:copilot skill list  [from this build]
List available skills
Usage: copilot skill list [OPTIONS]

List all available skills grouped by source.

Use `--json` for machine-readable output.

Options:
  -h, --help
          Print help (see a summary with '-h')

      --json
          Output as JSON

Examples:
  # List all skills
  $ copilot skill list

  # Output as JSON
  $ copilot skill list --json

Answer only from these entries. An entry about something else is not an answer: if none answers the question, say this build does not document it, and do not offer a related setting, flag or command as the fix or fill the gap from general knowledge. Do not invent names or values.
```

</details>


---

<sub>27s</sub>

### `bash`

**Copy and verify ten personal skills**

`$ src='/Users/chocholous/egd-e2e-copilot/rozbaleno'; dest='/Users/chocholous/egd-e2e-copilot/sandbox/home/.copilot/skills'; mkdir -p "$dest" || exit 1; for d in egd-data-seznamy egd-dokumenty egd-externi-api egd-llm-gateway egd-maily egd-planovane-ulohy egd-prava-role egd-pripravenost egd-prvni-appka egd-recon; do if [ -e "$dest/$d" ]; then printf 'COLLISION %s; stopping without overwrite\n' "$d"; exit 2; fi; cp -R "$src/$d" "$dest/" || exit 1; done; printf 'COPIED\n'; for d in egd-data-seznamy egd-dokumenty egd-externi-api egd-llm-gateway egd-maily egd-planovane-ulohy egd-prava-role egd-pripravenost egd-prvni-appka egd-recon; do if [ -f "$dest/$d/SKILL.md" ]; then printf '%s/SKILL.md\n' "$d"; else printf 'MISSING %s/SKILL.md\n' "$d"; fi; done; for d in egd-data-seznamy egd-dokumenty egd-externi-api egd-llm-gateway egd-maily egd-planovane-ulohy egd-prava-role egd-pripravenost egd-prvni-appka egd-recon; do diff -qr "$src/$d" "$dest/$d" >/dev/null || { printf 'DIFF %s\n' "$d"; exit 3; }; done; printf 'ALL_COPIES_MATCH\n'`

<details>
<summary>13 lines</summary>

```
COPIED
egd-data-seznamy/SKILL.md
egd-dokumenty/SKILL.md
egd-externi-api/SKILL.md
egd-llm-gateway/SKILL.md
egd-maily/SKILL.md
egd-planovane-ulohy/SKILL.md
egd-prava-role/SKILL.md
egd-pripravenost/SKILL.md
egd-prvni-appka/SKILL.md
egd-recon/SKILL.md
ALL_COPIES_MATCH
<shellId: 2 completed with exit code 0>
```

</details>


---

<sub>30s</sub>

### `bash`

**Check current Copilot skill discovery**

`$ printf 'HOME=%s\nCOPILOT_HOME=%s\n' "$HOME" "${COPILOT_HOME-}"; if command -v copilot >/dev/null 2>&1; then copilot skill list; else printf 'COPILOT_COMMAND_UNAVAILABLE\n'; fi`

<details>
<summary>18 lines</summary>

```
HOME=/Users/chocholous/egd-e2e-copilot/sandbox/home
COPILOT_HOME=/Users/chocholous/egd-e2e-copilot/sandbox/home/.copilot
Personal skills:
  egd-data-seznamy - Nauč SPFx appku EG.D ukládat a upravovat data v SharePoint seznamu tak, aby fungovala i s tisíci záznamy - indexy sloupců (UI, CLI, REST), pořadí podmínek ve filtru, stránkování po 1000, zápis a úprava položky, a kdy už je potřeba opravdová databáze. Použij, když uživatel řekne „potřebuju databázi“, „ukládat a upravovat záznamy“, „tabulka s editací“, „appka spadla po pár tisících položek“, „chyba 500 překračuje mezní hodnotu zobrazení“, „SPQueryThrottledException“, „list view threshold“, „5000 položek“, „indexovaný sloupec“, „filtrování a řazení v seznamu“, „Dataverse nebo SQL?“ nebo když se rozhoduje, kde budou data appky.
  egd-dokumenty - Přidej do SPFx appky EG.D tlačítko, které z dat seznamu vyrobí Word, Excel, PowerPoint nebo PDF přímo v prohlížeči, uloží ho do knihovny dokumentů a stáhne - včetně Wordu ze šablony a věrného PDF z Wordu přes Microsoft Graph, s funkční češtinou. Použij, když uživatel řekne „vygeneruj z toho Word / Excel / PDF / prezentaci“, „export do Excelu“, „protokol podle šablony“, „ulož dokument do knihovny“, „převeď Word na PDF“, „v PDF jsou rozbité háčky a čárky“, „pptxgenjs neprojde buildem“, „UnhandledSchemeError node:fs“ „potřebujeme Power Automate na dokumenty?“, „uprav existující Word / Excel / prezentaci v knihovně“, „vyplň šablonu, kterou jsme napsali ve Wordu“, „zástupné texty se nenahradily“ nebo „změň buňky v Excelu, který má někdo otevřený“.
  egd-externi-api - Napoj SPFx appku EG.D na cizí zdroj dat - nejdřív zjisti, jestli API povoluje volání z prohlížeče (CORS); když ano, volej ho přímo z web partu, když ne (ČNB, OTE, scraping webových stránek), vysvětli, proč to z prohlížeče nejde, a nabídni server nebo Power Automate. Použij, když uživatel řekne „načti data z API“, „napoj ARES / ČNB / OTE / počasí“, „stáhni kurzy“, „scrapuj web“, „Failed to fetch“, „blocked by CORS policy“, „No 'Access-Control-Allow-Origin' header“, nebo „proč to v Postmanu jde a v appce ne“.
  egd-llm-gateway - Napoj SPFx appku EG.D na AI (generování a shrnutí textu, OCR dokumentů a obrázků, popis obrázku) přes sdílenou LLM gateway - web part volá gateway tokenem přihlášeného uživatele (AadHttpClient), žádný API klíč v kódu; vysvětli, že bez Azure to nejde, a co musí dodat IT. Použij, když uživatel řekne „přidej AI“, „ať to shrne / přeloží / navrhne odpověď“, „přečti text z PDF nebo fotky“, „OCR faktury“, „popiš obrázek“, „vygeneruj obrázek“, „zavolej OpenAI / GPT / LLM“, „kam dám API klíč“, „Failed to fetch na gateway“, „429 kvóta“, „502 u OCR“ nebo „AADSTS65001“.
  egd-maily - Nauč SPFx appku EG.D poslat e-mail s přílohou - jménem přihlášeného uživatele přes Microsoft Graph sendMail (bez Azure, jen jedno schválení správcem), a poradí, co dělat, když má mail odejít ze systémové schránky nebo bez uživatele. Použij, když uživatel řekne „pošli to mailem“, „odešli export jako přílohu“, „vygeneruj PDF a pošli mailem“, „notifikace schvalovateli“, „e-mail z appky“, „sendMail“, „Mail.Send“, „ErrorAccessDenied u mailu“, „403 u sendMail“, „mail z noreply / sdílené schránky“ nebo „upozornění, když přijde nová žádost“.
  egd-planovane-ulohy - Vysvětli a postav plánovanou úlohu pro SharePoint appku EG.D (denní report, noční přepočet, pravidelné stažení dat a e-mail s přílohou) - SharePoint ani SPFx samy nic podle času nespustí, takže vyber Power Automate s plánovaným spuštěním (standardní konektory), nebo Azure Container Apps Job s cronem a systémovou schránkou. Použij, když uživatel řekne „každý den v 6 ráno“, „pošli týdenní report“, „naplánuj úlohu“, „cron“, „automaticky na pozadí“, „když nikdo nemá appku otevřenou“, „Recurrence“, „Power Automate flow“ nebo „noční zpracování“.
  egd-prava-role - Nastav v SharePoint appce EG.D role zadavatel / schvalovatel / správce tak, aby je vynucoval SharePoint, ne kód - tři skupiny, seznam „každý vidí jen své“ (ReadSecurity), vlastní úroveň oprávnění s CancelCheckout pro schvalovatele a podle práv v appce ukázat nebo schovat tlačítka. Použij, když uživatel řekne „zadavatel vidí jen své žádosti“, „schvalovatel vidí všechno“, „role a práva v appce“, „víceúrovňová autentizace“, „kdo smí schvalovat“, „schovej tlačítko Schválit“, „přílohy vidí jen autor“, „schvalovatel nevidí cizí položky“, „schvalovatel nesmí mazat“ nebo „sdílet jeden záznam s kolegou“.
  egd-pripravenost - Kontrola připravenosti počítače na vibecoding workshop EG.D – zjistí, který AI nástroj (GitHub Copilot, Claude) tu funguje, jestli jde npm a Node pro SharePoint Framework, jestli se připojíš k SharePointu (CLI for Microsoft 365) a umíš ho ovládat, vyrobí zprávu pripravenost-<jmeno>.md s větami pro ServiceNow a při zelené připravenosti postaví první appku (Spokojenost s prostředím kanceláře, ZADANI-appka.md). Použij, když uživatel řekne „připrav můj počítač na workshop“, „zkontroluj připravenost“, „připojím se k SharePointu?“, „co mi chybí na středu“, „spusť egd-pripravenost“ nebo „otestuj, jestli tu jde npm / m365 / Copilot“.
  egd-prvni-appka - Postav s uživatelem z EG.D první jednoduchou appku na SharePointu nejjednodušší cestou, která v jeho prostředí funguje - SPFx web part „Spokojenost s prostředím kanceláře dnes“ (tlačítka 1–5 a malý vyhodnocovací dashboard) nad SharePoint seznamem, nasazený do katalogu aplikací jeho webu jako celostránková appka (?env=WebView), nebo bez kódu přes seznam s formátováním a Power Apps. Navazuje na egd-pripravenost. Použij, když uživatel řekne „postav mi první appku“, „udělej mi appku na SharePoint“, „nasaď to na můj web“, „spokojenost s kanceláří“, „hlasování 1–5 s dashboardem“, „spusť egd-prvni-appka“ nebo po dokončené kontrole připravenosti.
  egd-recon - Záchranný skill k egd-pripravenost. Použij, když se v přípravě něco nedaří (AADSTS65001, „Need admin approval“ / „Vyžaduje se schválení správcem“, 403 / Přístup odepřen, web nemá katalog aplikací, nejde nahrát balíček) a chceš vědět proč a co přesně požádat IT. Jen čte, nic nezapisuje.

Builtin skills:
  customize-cloud-agent - Skill for customizing the Copilot cloud agent (formerly known as Copilot coding agent) environment, including copilot-setup-steps.yml configuration, preinstalling tools and dependencies, runners, and settings. Use when the user mentions copilot-setup-steps, copilot setup steps, or wants to configure the cloud agent environment.
  github-pr-media - Upload an image or video to GitHub's user attachments API and embed it in a pull request description or comment. Use when asked to add screenshots, diagrams, recordings, or other media to a PR or GitHub comment.
  pr-stack - Manage GitHub pull request stacks. Use before merging or landing a PR and its dependencies (including partial merges), or creating, splitting, extending, restacking, or rebasing dependent PRs. Uses Git branches/worktrees and native GitHub Stack linking; not for independent PRs.
<shellId: 3 completed with exit code 0>
```

</details>


---

<sub>37s</sub>

### Copilot

Jsem **GitHub Copilot CLI**. Zkopíroval jsem všech 10 složek do `/Users/chocholous/egd-e2e-copilot/sandbox/home/.copilot/skills/`, včetně skrytých souborů a podsložek. Nic jsem nepřepisoval; ověřil jsem, že kopie odpovídají zdrojům a že v každé je `SKILL.md`.

Ověřené soubory:
```text
egd-data-seznamy/SKILL.md
egd-dokumenty/SKILL.md
egd-externi-api/SKILL.md
egd-llm-gateway/SKILL.md
egd-maily/SKILL.md
egd-planovane-ulohy/SKILL.md
egd-prava-role/SKILL.md
egd-pripravenost/SKILL.md
egd-prvni-appka/SKILL.md
egd-recon/SKILL.md
```

`copilot skill list` je už zobrazil v seznamu osobních skillů. Pro načtení v této interaktivní relaci spusťte `/skills reload` a ověřte přes `/skills list`; pokud se tam neobjeví, spusťte novou relaci.

---

<sub>Generated by [GitHub Copilot CLI](https://github.com/features/copilot/cli)</sub>
