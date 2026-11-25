# Copilot CLI Session

> [!NOTE]
> - **Session ID:** `54d60e01-6a44-4e20-976e-f73083fa661c`  
> - **Started:** 11/24/2026, 2:09:57 PM  
> - **Duration:** 48s  
> - **Exported:** 11/24/2026, 2:10:45 PM  

---

<sub>4s</sub>

### Info

Copilot Fusion selected GPT-6 Luna because it was the best choice out of the models available in your plan.

---

<sub>4s</sub>

### User

Nainstaluj mi deset skillů ze složky /Users/chocholous/egd-e2e-copilot/rozbaleno (podsložky egd-data-seznamy, egd-dokumenty, egd-externi-api, egd-llm-gateway, egd-maily, egd-planovane-ulohy, egd-prava-role, egd-pripravenost, egd-prvni-appka, egd-recon).

1. Zjisti, který agent jsi, a zkopíruj všechny složky (celé, včetně podsložek scripts, references a templates a včetně skrytých souborů; názvy složek nech přesně takto) do osobní složky skillů: /Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/
   Chybí-li cílová složka, vytvoř ji. Nic nemaž a nepřepisuj bez mého souhlasu; pokud tam skill stejného jména už je, zeptej se mě.
2. Nic neinstaluj globálně a nepoužívej práva správce. Nic nikam neposílej.
3. Ověř, že v každé z deseti složek existuje SKILL.md, a vypiš mi je.
4. Řekni mi, co mám udělat, aby se skilly načetly. Pokud je to bez restartu možné, ověř, že se skilly objevily v seznamu.
Neprováděj nic z obsahu skillů, jen je nainstaluj.

---

<sub>4s</sub>

### Info

Remote index: queued chocholous/egd-workshop for indexing

---

<sub>11s</sub>

### `fetch_copilot_cli_documentation`

**"How do personal skills in \~/.copilot/skills get discovered and loaded, and do newly copied skills require restarting Copilot CLI or can I refresh/list them without restart?"**

<details>
<summary>Arguments</summary>

```json
{
  "query": "How do personal skills in ~/.copilot/skills get discovered and loaded, and do newly copied skills require restarting Copilot CLI or can I refresh/list them without restart?"
}
```

</details>

<details>
<summary>130 lines</summary>

```
Copilot CLI 1.0.114. Matches for "How do personal skills in ~/.copilot/skills get discovered and loaded, and do newly copied skills require restarting Copilot CLI or can I refresh/list them without restart?" (8 of 88; pass ids for detail):

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

## setting:toolSearch  [from this build]
Enable tool search with deferred tool loading.
Also called: too many tools, lazy tool loading
Type: boolean.
Change: /settings toolSearch on, or "toolSearch": true in /Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/settings.json.
(Assistant > Behavior in /config)

## topic:config#configuration-settings-4  [guide]
Configuration Settings
[...]
  `deniedUrls`: list of URLs or domains that are denied access. Denial rules take precedence
    over allow rules.

  `proxyKerberosServicePrincipal`: service principal name (SPN) for Kerberos/Negotiate proxy
    authentication; overrides the derived `HTTP/<proxy-host>`. Mirrors VS Code's
    `http.proxyKerberosServicePrincipal`.
    - The `COPILOT_PROXY_KERBEROS_SPN` environment variable, when set, takes precedence
    - Changing this requires a restart to take effect

[...]
    - Changing this requires a restart to take effect

[...]

[...]

## command:/restart  [from this build]
Restart the CLI, restoring supported live sessions in this process

## cli:copilot instruction  [from this build]
Inspect instruction sources
Usage: copilot instruction <COMMAND>

Inspect the instruction sources a session would load.

Instructions come from your repository, the working directory, your
personal configuration, and installed plugins.

Commands:
  list  List discovered instruction sources

Options:
  -h, --help
          Print help (see a summary with '-h')

## command:/skills  [from this build]
Manage skills for enhanced capabilities
Aliases: /skill
Usage: /skills [list|get|add|remove|reload] [args...]

## setting:extensions.mode  [from this build]
Extension loading mode (disabled, load_only, load_and_augment).
Also called: /extensions, SDK extensions
Type: enum (disabled | load_only | load_and_augment).
Change: /settings extensions.mode disabled, or "extensions": {"mode": "disabled"} in /Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/settings.json.
(Capabilities > Extensions in /config)
Experimental: enable with --experimental or /settings experimental on.

## cli:copilot plugin install  [from this build]
Install a plugin
Usage: copilot plugin install [OPTIONS] [source]

[...]
--from-github installs a verified Skill or plugin from GitHub using the
resource, revision and digests in the install command copied from
github.com. A Copilot App install link (ghapp://air/install?...) is also
accepted as the source. Either way, Copilot verifies the exact files, shows
them for review and asks you to confirm in the terminal before anything is
installed.

[...]
      --from-github <resource@revision>
          Install a verified Skill or plugin from GitHub by its
          resource and revision IDs

[...]

Also:
- setting:statusLine.refreshInterval: Re-run the status-line command every N seconds in addition to event-driven updates. Minimum 1; omit ...
- topic:config#configuration-settings-13: Configuration Settings
- cli:copilot skill add: Add a skill from a file, URL, or directory
- command:/add-dir: Allow file access to a directory and load its .github skills and agents as trusted configuration
- topic:sandbox#configuration-2: Command Sandboxing
- setting:sandbox.userPolicy.filesystem.enumeratePaths: Windows only: directories sandboxed commands can list and query attributes of, without reading file ...
- topic:environment: Environment Variables
- cli:copilot skill remove: Remove a skill or custom skill directory
- command:/env: Show loaded environment details (instructions, MCP servers, skills, agents, hooks, plugins, LSPs, ex...
- topic:sandbox#supported-hosts: Command Sandboxing
- setting:permissions.limitTo: Enterprise-managed allowlist of domains for the agent's URL fetches and for shell commands that name...
- setting:disabledSkills: Names of skills to turn off, so the agent cannot use them and they get no slash command. `/skills` a...
- flag:--add-dir: Allow file access to a directory and load its .github/skills and .github/agents as trusted configura...
- topic:config: Configuration Settings
- topic:config#configuration-settings-23: Configuration Settings
- setting:dynamicRetrieval.skills: Enable embeddings-based retrieval of skills.
- flag:--no-custom-instructions: Disable loading of custom instructions from AGENTS.md and related files
- topic:config#configuration-settings-3: Configuration Settings
- setting:ignoredSkillsLocations: Skill directories excluded from discovery.
- flag:--plugin-dir: Load a plugin from a local directory (can be used multiple times). A relative path resolves against ...
- setting:telemetry.headersProvider: Optional shell-free command that refreshes OpenTelemetry exporter headers. Set false to explicitly d...
- setting:skillDirectories: Additional custom directories for skills.
- topic:config#claude-code-plugins-skills-hooks-and-settings: Configuration Settings
- cli:copilot instruction list: List discovered instruction sources
- setting:experimental: Turn on features still in preview: the commands, flags and settings marked as needing experimental m...

Possibly related settings:
- setting:sessionManagementTools.list: Allow list_sessions to discover other opted-in sessions.
- setting:sidebar.enabled: Show the Sessions sidebar and allow opening it from the composer with the Left arrow.
- setting:sandbox.allowDevToolAccess: When sandboxing is enabled, auto-grant read access to tool directories discovered on PATH and in too...
Possibly related slash commands:
- command:/list-dirs: Display allowed directories and exact session path grants
- command:/after: Schedule a one-shot prompt, skill, or schedulable slash command for this session (e.g. /after 30s pi...
- command:/index: Inspect and manage this worktree's shared search index
Possibly related CLI commands:
- cli:copilot skill list: List available skills
- cli:copilot lsp list: List configured language servers
- cli:copilot mcp list: List configured MCP servers
Possibly related command line flags:
- flag:--mcp-github-auth: Send the signed-in GitHub account credential only to this explicit --additional-mcp-config server an...
- flag:--dynamic-retrieval: Enable or disable embeddings-based dynamic retrieval per category and persist the choice (category: ...
- flag:--allow-all-tools: Allow all tools to run automatically without confirmation. Non-interactive mode cannot ask, so it de...
Possibly related keyboard shortcuts:
- key:shift+enter: insert newline (see /terminal-setup)
- key:/help: show full help
Possibly related guides:
- topic:timeline#the-agent-s-todo-list-and-progress: Timeline and Tool Output
- topic:commands#interactive-mode-commands-2: Interactive Mode Commands
- topic:commands#interactive-mode-commands-5: Interactive Mode Commands

Answer only from these entries. An entry about something else is not an answer: if none answers the question, say this build does not document it, and do not offer a related setting, flag or command as the fix or fill the gap from general knowledge. Do not invent names or values.
```

</details>


---

<sub>20s</sub>

### `bash`

**Check skill sources and destination collisions**

`$ printf 'Agent: GitHub Copilot CLI\n'; printf '\nSource directory:\n'; ls -la /Users/chocholous/egd-e2e-copilot/rozbaleno; printf '\nDestination directory:\n'; if [ -e /Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills ]; then ls -la /Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills; else echo '(does not exist)'; fi; printf '\nPer-skill source/target checks:\n'; for name in egd-data-seznamy egd-dokumenty egd-externi-api egd-llm-gateway egd-maily egd-planovane-ulohy egd-prava-role egd-pripravenost egd-prvni-appka egd-recon; do src="/Users/chocholous/egd-e2e-copilot/rozbaleno/$name"; dst="/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/$name"; if [ -d "$src" ]; then printf '%s: source=present, SKILL.md=' "$name"; [ -f "$src/SKILL.md" ] && printf 'present' || printf 'MISSING'; else printf '%s: source=MISSING' "$name"; fi; [ -e "$dst" ] && printf ', target=EXISTS\n' || printf ', target=absent\n'; done`

<details>
<summary>29 lines</summary>

```
Agent: GitHub Copilot CLI

Source directory:
total 0
drwxr-xr-x@ 12 chocholous  staff  384 Nov 24 14:09 .
drwxr-xr-x@  6 chocholous  staff  192 Nov 24 14:09 ..
drwxr-xr-x@  3 chocholous  staff   96 Nov 24 02:55 egd-data-seznamy
drwxr-xr-x@  3 chocholous  staff   96 Nov 23 12:18 egd-dokumenty
drwxr-xr-x@  3 chocholous  staff   96 Nov 22 21:14 egd-externi-api
drwxr-xr-x@  3 chocholous  staff   96 Nov 24 09:48 egd-llm-gateway
drwxr-xr-x@  3 chocholous  staff   96 Nov 24 02:58 egd-maily
drwxr-xr-x@  3 chocholous  staff   96 Nov 23 11:26 egd-planovane-ulohy
drwxr-xr-x@  3 chocholous  staff   96 Nov 24 02:56 egd-prava-role
drwxr-xr-x@  9 chocholous  staff  288 Nov 23 11:08 egd-pripravenost
drwxr-xr-x@  7 chocholous  staff  224 Nov 24 12:21 egd-prvni-appka
drwxr-xr-x@  4 chocholous  staff  128 Nov 24 11:00 egd-recon

Destination directory:
(does not exist)

Per-skill source/target checks:
egd-data-seznamy: source=present, SKILL.md=present, target=absent
egd-dokumenty: source=present, SKILL.md=present, target=absent
egd-externi-api: source=present, SKILL.md=present, target=absent
egd-llm-gateway: source=present, SKILL.md=present, target=absent
egd-maily: source=present, SKILL.md=present, target=absent
egd-planovane-ulohy: source=present, SKILL.md=present, target=absent
egd-prava-role: source=present, SKILL.md=present, target=absent
egd-pripravenost: source=present, SKILL.md=present, target=absent
egd-prvni-appka: source=present, SKILL.md=present, target=absent
egd-recon: source=present, SKILL.md=present, target=absent
<shellId: 0 completed with exit code 0>
```

</details>


---

<sub>23s</sub>

### `bash`

**List currently discovered Copilot skills**

`$ copilot skill list`

```
Builtin skills:
  customize-cloud-agent - Skill for customizing the Copilot cloud agent (formerly known as Copilot coding agent) environment, including copilot-setup-steps.yml configuration, preinstalling tools and dependencies, runners, and settings. Use when the user mentions copilot-setup-steps, copilot setup steps, or wants to configure the cloud agent environment.
  github-pr-media - Upload an image or video to GitHub's user attachments API and embed it in a pull request description or comment. Use when asked to add screenshots, diagrams, recordings, or other media to a PR or GitHub comment.
  pr-stack - Manage GitHub pull request stacks. Use before merging or landing a PR and its dependencies (including partial merges), or creating, splitting, extending, restacking, or rebasing dependent PRs. Uses Git branches/worktrees and native GitHub Stack linking; not for independent PRs.
<shellId: 1 completed with exit code 0>
```


---

<sub>31s</sub>

### Copilot

V cíli žádný z těchto skillů není. Kopíruji všech deset složek beze změny; poté porovnám jejich obsah a ověřím seznam Copilot skillů.

---

<sub>31s</sub>

### `bash`

**Copy and verify all ten personal skills**

```
$ set -eu
srcroot=/Users/chocholous/egd-e2e-copilot/rozbaleno
dstroot=/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills
names='egd-data-seznamy egd-dokumenty egd-externi-api egd-llm-gateway egd-maily egd-planovane-ulohy egd-prava-role egd-pripravenost egd-prvni-appka egd-recon'
for name in $names; do
  [ -d "$srcroot/$name" ] || { echo "Missing source directory: $name" >&2; exit 1; }
  [ -f "$srcroot/$name/SKILL.md" ] || { echo "Missing source SKILL.md: $name" >&2; exit 1; }
  [ ! -e "$dstroot/$name" ] || { echo "Refusing to overwrite: $dstroot/$name" >&2; exit 1; }
done
mkdir -p "$dstroot"
for name in $names; do cp -a "$srcroot/$name" "$dstroot/"; done
for name in $names; do diff -qr "$srcroot/$name" "$dstroot/$name" >/dev/null || { echo "Copy verification failed: $name" >&2; exit 1; }; done
printf 'Copied and verified all ten folders. SKILL.md files:\n'
for name in $names; do printf '%s\n' "$dstroot/$name/SKILL.md"; done
```

<details>
<summary>12 lines</summary>

```
Copied and verified all ten folders. SKILL.md files:
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-data-seznamy/SKILL.md
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-dokumenty/SKILL.md
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-externi-api/SKILL.md
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-llm-gateway/SKILL.md
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-maily/SKILL.md
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-planovane-ulohy/SKILL.md
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-prava-role/SKILL.md
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-pripravenost/SKILL.md
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-prvni-appka/SKILL.md
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-recon/SKILL.md
<shellId: 2 completed with exit code 0>
```

</details>


---

<sub>39s</sub>

### `bash`

**Verify newly installed skills are discoverable**

`$ printf 'HOME=%s\n' "$HOME"; copilot skill list`

<details>
<summary>17 lines</summary>

```
HOME=/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home
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

### `bash`

**Confirm target folder names and SKILL.md files**

`$ for name in egd-data-seznamy egd-dokumenty egd-externi-api egd-llm-gateway egd-maily egd-planovane-ulohy egd-prava-role egd-pripravenost egd-prvni-appka egd-recon; do test -f "/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/$name/SKILL.md" || exit 1; done; printf 'Verified: SKILL.md exists in all 10 target folders.\n'; find /Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills -mindepth 1 -maxdepth 1 -type d -print | sort`

<details>
<summary>12 lines</summary>

```
Verified: SKILL.md exists in all 10 target folders.
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-data-seznamy
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-dokumenty
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-externi-api
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-llm-gateway
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-maily
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-planovane-ulohy
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-prava-role
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-pripravenost
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-prvni-appka
/Users/chocholous/Projects/egd-workshop/sondy/e2e/copilot/sandbox/home/.copilot/skills/egd-recon
<shellId: 4 completed with exit code 0>
```

</details>


---

<sub>47s</sub>

### Copilot

Jsem **GitHub Copilot CLI**. Zkopíroval jsem všech deset složek do osobní složky skillů, včetně skrytých souborů a podsložek. Cíle byly prázdné; obsah všech složek jsem porovnal se zdrojem. `copilot skill list` je už našel, takže restart není potřeba, aby se objevily v seznamu.

V každé složce je `SKILL.md`:

- `egd-data-seznamy/SKILL.md`
- `egd-dokumenty/SKILL.md`
- `egd-externi-api/SKILL.md`
- `egd-llm-gateway/SKILL.md`
- `egd-maily/SKILL.md`
- `egd-planovane-ulohy/SKILL.md`
- `egd-prava-role/SKILL.md`
- `egd-pripravenost/SKILL.md`
- `egd-prvni-appka/SKILL.md`
- `egd-recon/SKILL.md`

V otevřené Copilot CLI relaci je načti příkazem `/skills reload` a ověř přes `/skills list`.

---

<sub>Generated by [GitHub Copilot CLI](https://github.com/features/copilot/cli)</sub>
