# Test skillu egd-pripravenost na GitHub Copilot CLI (22. 11. 2026)

Tester: session test-copilot. Copilot CLI 1.0.112 (běh sám hlásil bundlovanou 1.0.91 / 1.0.114 podle cache), výchozí model, macOS, Node 22.23.5.
Lab `pavelchocholousgmail` (tenant ID 972a674c-…), web `/sites/sitecatalogtest`. Proti E.ON nic nespuštěno.
Důkazy (log, přepis, vygenerovaná zpráva z každého běhu): [audit/test-copilot/beh1…beh5](../../audit/test-copilot/).

**Závěr jednou větou:** skill je pro Copilot CLI připravený (najde ho, projde, spustí skript, přihlášení nechá na člověku, zápis udělá jen po „ano“), po třech drobných opravách níže; VS Code agent mode a Windows jsou ❓ neověřené.

## Jak se testovalo

`tools/copilot-run.sh` vyrobí „nový počítač účastníka“ (izolovaný `HOME`, `COPILOT_HOME`, pracovní složka, bez proměnných `CLAUDE*`), nainstaluje skill `tools/copilot-skill-install.sh` a spustí `copilot -p … --allow-all-tools --allow-all-paths`. Přihlášení Copilotu: token z `gh auth token` v `COPILOT_GITHUB_TOKEN` (maskovaný přes `--secret-env-vars`). Přihlášení m365: zkopírovaný token labu (`--m365-from`), nebo žádné.

| Běh | Zadání | Výsledek |
|---|---|---|
| 1 | „zkontroluj připravenost“, jméno + web, přihlášen, bez zápisu | zpráva `pripravenost-Test-Copilot.md`, 23 zelených, 0 červených |
| 2 | bez přihlášení m365 | zastavil, vypsal **příkaz pro device code, který má spustit člověk**, a zprávu |
| 3 | přihlášen, zápis „po souhlasu“ | ukázal plán, nezapsal (souhlas byl podmíněný), kroky 5–6 přeskočil ❌ (opraveno) |
| 4 | předem schválený zápis, bez `--tenant` | zápis zastavila pojistka tenantu (správně) |
| 5 | schválený zápis + `--tenant` labu | zápis proběhl: seznam, položka, čtení zpět ✅ |

## ✅ Prošlo (změřeno)

- **Copilot skill vidí a načte.** `copilot skill list` ho ukáže (osobní `~/.copilot/skills/<jméno>` i projektový `.github/skills/<jméno>`), v běhu 1–5 se zavolal `skill(egd-pripravenost)` na první větu „zkontroluj připravenost“.
- Pochopil kroky a pořadí, cestu `<S>` našel sám (skript v `~/.copilot/skills/…/scripts`), spouštěl `node "<S>" nastroje|npm|sit|github|cli-instalace|prihlaseni|sharepoint|spfx|zapis|zprava`.
- Správně čte výstup: zelená/žlutá/červená, `co dal`, kód 10 u `zkouska` bez `--ano` (Copilot ho ukáže jako „Failed with exit code 10“, ale správně pochopí, že je to plán).
- **Přihlášení:** běh 2: `m365 login` nespustil sám, předal uživateli přesný příkaz ze `prihlaseni-prikaz` a řekl, co má udělat; kód z přihlášení neviděl. Pojistka č. 2 platí i pro Copilota. (Samotné dokončení device code člověkem v Copilotu ❓, viz níže.)
- **Zápis:** `zkouska --ano` až po plánu a souhlasu, jen na labovém webu; v běhu 4 se zastavil na hlášce o tenantu a nic nezapsal. Běh 5 ✅ zápis i čtení zpět.
- Souhrn v češtině a věta „Pošli soubor Pavlovi“; zpráva neobsahuje token ani heslo (Copilot to sám zkontroloval grepem).
- Dlouhý příkaz (`cli-instalace`, ~3 min) Copilot zvládl: sám čekal na výstup po 30 s.
- Tooling: `copilot-skill-install.sh` a `copilot-run.sh` mají `--help`, projdou `shellcheck`, a izolace funguje.

## ❌ Nalezeno a opraveno ve skillu

1. **Copilot sám přepsal soubor skillu** (`scripts/pripravenost.mjs`, funkci `zprava`; běh 1) a četl `TEST.md`, `README.md` a zdrojový kód skriptu. Účastník by pak měl jinou verzi než ostatní. Oprava: SKILL.md pojistka č. 7 („soubory skillu neupravuj, README/TEST/zdroj číst nemusíš“). V běhu 2–5 už skill neupravoval (editoval jen vygenerovanou zprávu; jen `Edit` souboru `pripravenost-<jmeno>.md`, přijatelné).
2. **Při „už jsem přihlášený“ Copilot krok 5–6 přeskočil** a do zprávy napsal „přihlášení nebylo ověřeno“ (běh 3). Oprava: u kroku 5 v SKILL.md „vždy spusť `prihlaseni` a hned po něm krok 6“.
3. **Nastavení testu, ne skillu:** proměnná `CLAUDECODE` z mé session se dostala do běhu a zpráva napsala „spuštěno z Claude Code“. `copilot-run.sh` teď proměnné `CLAUDE*` maže. U skutečného účastníka skript správně pozná jen VS Code terminál; **v Copilot CLI mimo VS Code vyjde „jiný terminál“** (nemá detekci Copilota, kosmetické).

## Rozdíly Copilot vs Claude

| Oblast | Claude | Copilot CLI | Dopad |
|---|---|---|---|
| Načtení skillu | z `~/.claude/skills` | z `~/.copilot/skills`, `.github/skills`, `.claude/skills` (`copilot skill list`) | ✅ bez problému |
| Dodatečné čtení | čte SKILL.md | před prvním krokem přečte i README, references, TEST.md a **zdroj skriptu** | zdržení (~2 min), oprava č. 7 |
| Zásahy do skillu | nedělá | **opraví „chybu“ ve skriptu sám** | ❌ opraveno č. 7 |
| Oprávnění v `-p` | – | bez `--allow-all-paths` zamítne i skript ve vlastním skillu; v interaktivním režimu se ptá po každém příkazu (účastník klikne „Yes“; ❓ neověřeno interaktivně) | v návodu pro účastníka zmínit, že schvaluje příkazy `node …` |
| Zápis po „ano“ | spustí `--ano` | s podmíněným souhlasem v zadání ho **neprovede** (konzervativnější) | ✅ bezpečnější |
| Hlášení kódu 10 | – | zobrazí jako „Failed“ (červený křížek) | kosmetika |
| Dlouhé příkazy | – | čeká po 30 s na výstup, zvládne | ✅ |
| Rozsah | zastaví po zprávě | **pokračuje dál** (viděl `references/appka.md` / `ZADANI-appka.md` a chtěl stavět appku, zastavil ho jen nedostatek souhlasu) | je-li záměr, ať to je v SKILL.md jasné |
| Zobrazení URL | – | v logu odkaz obalen escape sekvencemi OSC 8, příkaz je v pořádku | jen vzhled logu |
| Model | – | výchozí (`Auto`), odpovědi česky | ✅ |

## Varianty ovládání pro agenty (pro a proti)

| Varianta | Ověřeno | Pro | Proti |
|---|---|---|---|
| **Copilot CLI `-p`** (`copilot-run.sh`) | ✅ 5 běhů | headless, log + přepis (`--share`), izolace `HOME`/`COPILOT_HOME`, token přes env | nelze odpovídat na dotazy skillu, vše v zadání; model a kvóta účtu (1,2 až 2,3 AI credits na běh) |
| **VS Code agent mode** | ❓ nespuštěno | `code chat -m agent "<prompt>"` (v `code chat --help`) | otevře okno GUI, výstup nejde zachytit do souboru, schválení nástrojů je klikání, chce přihlášení GitHubu v profilu; bez klikání nejde ✅ z `--help` 📘, ne z běhu. Doporučení: ruční test na jednom stroji |
| Interaktivní Copilot CLI (`copilot -i`) | ❓ | věrné pro účastníka (ptá se, schvaluje) | vyžaduje terminál a člověka |

## ❓ Neověřeno

- **Windows / PowerShell 5.1** (shell Copilota na Windows je PowerShell; skill používá jen `node`, ale nezkoušeno), VS Code agent mode a `chat.useAgentSkills`.
- Interaktivní režim Copilotu: otázky na jméno a web (v testu bylo vše v zadání), schvalování příkazů klikáním.
- Skutečné dokončení device code člověkem v E.ON (appId); v labu se přihlášení nahradilo kopií tokenu.
- Licence Copilota u EG.D (Business/Enterprise, politiky organizace, povolené modely); GitHub Enterprise adresa.

## Návrhy větších změn (neprovedeno)

- **Neposílat s balíčkem `TEST.md`** (obsahuje tenant labu, interní poznámky, a Copilot ho čte) ani `test-dukazy/`; vyrobit distribuční zip bez nich.
- Do `spusteno-z` doplnit detekci Copilot CLI (`COPILOT_*` proměnné) a jasně napsat v SKILL.md, zda se má agent po zprávě zastavit (appka je nová, navazující část).
- Návod pro účastníka s Copilotem: jak schvalovat příkazy (`Yes`), že na Windows nemá vypínat sandbox ani kontrolu certifikátů.

## Dodatek: běh 6 nad zmraženou verzí (22. 11. večer)

Verze: `SKILL.md` sha256 `8ead5285…`, `pripravenost.mjs` sha256 `94326243…`, balíček bez `TEST.md`, `TEST-copilot.md` a `test-dukazy/` (jako v distribuci). Důkazy: [audit/test-copilot/beh6](../../audit/test-copilot/beh6/).

- ✅ Skill nalezen a projit, kroky 5–6 tentokrát spuštěny (oprava č. 2 platí), `--tenant` labu použit, zápis po předem daném souhlasu proběhl (seznam `EGD-pripravenost` už existoval, přidána a přečtena jedna položka), zpráva `pripravenost-Test-Sest.md` bez tokenů.
- ✅ Soubory skillu po běhu **beze změny** (`diff` se zdrojem prázdný): pojistka č. 7 funguje. Copilot se nepouštěl do appky ani nic neodeslal.
- ❓ Copilot upozornil, že přihlášený účet (`pavel.admin`) není „Test Sest“ – očekávané, v labu je kopie tokenu.

**Závěr po zmražené verzi:** `TEST-copilot.md` platí i pro ni; skill je pro Copilot CLI připravený (Windows, VS Code agent mode a interaktivní schvalování zůstávají ❓).

## Dodatek 2: běh 7 nad změněným skillem (23. 11. dopoledne)

Na žádost session vlastníka skillu (po změnách: sekce „Záchrana“ v SKILL.md, cesta A3 v `references/appka.md`, řádek v `zebrik.md`, upravená hláška o katalogu v `appka.mjs`). Čistá kopie skillu bez `TEST.md`, `TEST-copilot.md`, `test-dukazy/`; `egd-recon` **nenainstalován**. Stejné zadání jako běh 6 (jméno Test Sedm, lab tenant s `--tenant`, zápis předem schválen). Model tentokrát zvolil auto‑výběr Copilota (GPT-6 Luna), 2,07 AI credits, 3 m 48 s. Důkazy: [audit/test-copilot/beh7](../../audit/test-copilot/beh7/).

| Otázka | Výsledek |
|---|---|
| (a) nepřepisuje soubory skillu | ✅ `diff -r` instalovaného skillu proti zdroji po běhu prázdný; editoval jen vygenerovanou zprávu `pripravenost-Test-Sedm.md` |
| (b) nenabízí egd-recon, když není nainstalován | ✅ v logu ani v odpovědi se `recon`/„Záchrana“ nevyskytuje (`rg` bez zásahu) |
| (c) po zprávě nestaví appku | ✅ spustil jen `spfx` (kontrola předpokladů); `ZADANI-appka.md` ani `references/appka.md` nečetl, nic nescaffoldoval, nic neodeslal |

Další pozorování:
- ✅ Skill nalezen, kroky 5–6 (`prihlaseni`) spuštěny, zpráva bez tokenů.
- ⚠️ Zkušební zápis tentokrát **neprovedl**: `zkouska` bez `--ano` ukázala plán (kód 10) a Copilot zápis nespustil, protože CLI je přihlášené jako `pavel.admin`, ne jako „Test Sedm“. V běhu 6 se stejné zadání zapsalo. Je to konzervativní, ne chyba, ale výsledek závisí na modelu; ❓ zápis v tomto běhu neověřen.
- ⚠️ V závěru Copilot napsal, že kontrola sítě vypsala výchozí tenant E.ON, ačkoli `sit` dostal `--tenant` labu (viz řádek 21 logu); vyplatí se projít výstup `sit` skriptem (návrh pro vlastníka skillu, neupraveno).
- Copilot přes `zapis --klic …` ručně doplnil žluté řádky (uvedeno „neověřeno“) před `zprava`: užívá kontrolní příkaz skillu, ne zásah do souborů.
