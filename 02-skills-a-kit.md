# Skills a Citizen AI developer kit

Značky: ✅ změřeno v labu · 📘 dokumentace · ❓ neověřeno · ⛔ v labu neověřitelné (důvod u položky) ·
🔀 víc funkčních variant (všechny uvedeny, doporučení až po nich). 📘 a ❓ jsou jen mezistav (kánon v [CLAUDE.md](CLAUDE.md)).
Stav k 22. 11. 2026. Všechno níž je změřené jen na **macOS a v lab tenantu**; Windows a tenant E.ON jsou ⛔
(v labu nejsou, návrh ověření je u každého rizika).

## Skilly pro EG.D: deset složek `skills/egd-*`

Každý vychází ze sondy v labu ([sondy/](sondy/)); co se stane v E.ON tenantu, je ⛔ neověřitelné. Rozdělení rolí
a vlastníků: [prehled/role.md](prehled/role.md).

| Skill | Co dělá | Důkaz v labu | Stav a háčky |
|---|---|---|---|
| `egd-pripravenost` | kontrola počítače účastníka (AI nástroj, npm a Node, CLI for M365, SharePoint, SPFx), zpráva s větami pro ServiceNow | ✅ [TEST.md](skills/egd-pripravenost/TEST.md): macOS, Node 22 i 18, CLI 12.0.0 a 11.11.0 | audit 2. kolo: bez blokátorů (Copilot rerun na finální verzi před odesláním); Windows a PowerShell 5.1 ❓ ⛔ |
| `egd-prvni-appka` | první appka „Spokojenost s prostředím kanceláře“ nejjednodušší cestou, která v prostředí funguje (žebřík A / A2 / B) | ✅ [TEST.md](skills/egd-prvni-appka/TEST.md): celý cyklus build → nasadit → upgrade, CLI 11.11.0, jako Global Admin | ⚠ šablona se přepisuje (stav k 22. 11., aktuálně `prehled/stav/skill-prvni-appka.json`); role Člen a Čtenář neměřeny; cesty A2 a B nikdo neprošel (audit); Windows ❓ ⛔ |
| `egd-data-seznamy` | data a editace v SharePoint seznamech, indexy, stránkování | ✅ sonda [data-prava](sondy/data-prava.md); e2e test skillu zatím nemá výsledek (`prehled/stav/miniskilly.json`: běží) ❓ | kód ve skillu jako celek neběžel ❓ |
| `egd-prava-role` | role zadavatel / schvalovatel / správce vynucené SharePointem | ✅ sonda [data-prava](sondy/data-prava.md), pod 5 uživateli; [TEST-copilot.md](skills/egd-prava-role/TEST-copilot.md) ✅ | ⚠ audit 2. kolo (22. 11.): 14 bodů vyřešeno, 4 částečně (varianta B přes CLI, testy v žebříku); skupina z Entra uvnitř skupiny SharePointu ❓ (403) |
| `egd-dokumenty` | Word, Excel, PPT, PDF z dat seznamu v prohlížeči + Graph PDF | ✅ sonda [dokumenty](sondy/dokumenty.md) | audit 2. kolo: uzavřeno s výhradou (build na šabloně Spokojenost chybí, Copilot ověřil jen build); `Files.Read.All` musí schválit správce; schválení v UI nikdo neprošel ❓ |
| `egd-llm-gateway` | AI přes sdílenou gateway tokenem uživatele | ✅ sonda [ai](sondy/ai.md) | obsah uzavřen auditem (2. kolo, 22. 11.); studený start gateway ~30 s; ✅ [TEST-copilot.md](skills/egd-llm-gateway/TEST-copilot.md) (1 běh) |
| `egd-maily` | e-mail s přílohou jménem uživatele (Graph `sendMail`) | ✅ sonda [napojeni](sondy/napojeni.md) (delegované odeslání a SPFx cesta, logy v [sondy/ms-maily](sondy/ms-maily/README.md) a [sondy/overeni/napojeni](sondy/overeni/README.md)) | ✅ SPFx cesta změřena ([sondy/ms-maily/README.md](sondy/ms-maily/README.md)): bez schválení 403 `ErrorAccessDenied`, po schválení 202 a doručeno; příloha 30 MB ✅, 40 MB → 400; ❓ schválení v UI admin centra |
| `egd-externi-api` | cizí API: CORS, jinak server / Job | ✅ sonda [napojeni](sondy/napojeni.md) (CORS probe v headless prohlížeči; preflight `curl` uložen v [sondy/overeni/napojeni](sondy/overeni/README.md)) | audit 2. kolo: uzavřeno; HTTP akce v Power Automate chce Premium ✅; ⛔ síť E.ON (CORS z jejich prohlížeče) |
| `egd-planovane-ulohy` | plánovaná úloha: Power Automate nebo Container Apps Job | ✅ Job s cronem a Recurrence ([napojeni](sondy/napojeni.md), [power-automate](sondy/power-automate.md)); výstupy Jobu uloženy v `sondy/napojeni/dukazy/job-execution-list.json` a `sondy/overeni/napojeni/` | ⚠ část Power Automate běhů čeká na přihlášení připojení Pavlem; HTTP akce se v labu nezapne: 403 `MissingAdequateQuotaPolicy` = Premium licence ✅ (`sondy/power-automate/vystupy/diag-409.txt`); 409 u Request triggeru a Recurrence + HTTP má příčinu ❓ |
| `egd-recon` | záchranný skill k `egd-pripravenost`: když něco zůstane červené (AADSTS65001, 403, web bez katalogu aplikací, nejde nahrát balíček), jen čte a vypíše funguje / blokováno / žádost pro IT | skript `recon.mjs` a `prava-z-prohlizece.mjs`; uložené běhy ve [skills/egd-recon/test-dukazy](skills/egd-recon/test-dukazy/) (bez přihlášení, `egd09-dev`, `mcplabdocs`, práva z prohlížeče) | ✅ [TEST.md](skills/egd-recon/TEST.md) Claude 3/3, [TEST-copilot.md](skills/egd-recon/TEST-copilot.md) Copilot 4/4; ❓ větev „chybí role / scope“ pod účtem bez práv, Windows / PowerShell 5.1, VS Code agent mode |

Podle kánonu je skill hotový až po průchodu v Claude **i** v GitHub Copilot (výsledek v `skills/<skill>/TEST-copilot.md`).
K 24. 11. má `TEST-copilot.md` **všech 10** skillů (`skills/*/TEST-copilot.md`), ale hloubka je různá: `egd-dokumenty` jen build, u `egd-prvni-appka` chybí ověření nasazené appky v prohlížeči ❓, `egd-data-seznamy` v 1. běhu našel chybu ve skillu (opravena, 2. běh ✅). Podrobnosti v souborech.

## Pět obecných skillů z 5.–6. 11. 2026

Vznikly v noční session „EON Sharepoint“ (Claude Code, účet chocholous@ppf.cz) nad měřením v lab tenantu.
Leží **jen lokálně** v `~/.claude/skills/` (není to git repo ✅), nejsou v katalogu. Žádný nemá EG.D v názvu.
Měření jsou ve `spfx-ship/references/verified.md`; měřilo se v PPF tenantu a v labu, nikoli v E.ON ⛔.

| Skill | Co dělá | Pozn. |
|---|---|---|
| `sharepoint-tenant-recon` | jen čtení: co v tenantu smíš, výstup funguje / blokováno / věta pro IT | první krok v cizím tenantu (důkaz `spfx-ship/references/verified.md` ✅ PPF / lab, ❓ konkrétní odkaz na měření recon skillu); v E.ON ⛔ neproběhl (ověří pondělní zkouška účastníků skillem `egd-pripravenost`, který má podobný čtecí krok „sharepoint“) |
| `spfx-ship` | scaffold → build → `spo app add/deploy/install` → Single Part App Page, `?env=WebView` | uvádí CLI 11.x, devkit závisí na `m365-cli-12`. ✅ cyklus proběhl v labu pod CLI 11.11.0; ❓ totéž příkazy na CLI 12 neměřeno (ověř: `m365 --version` + stejný cyklus pod CLI 12) |
| `m365-cli-safe` | CLI for M365 bez admin práv a při víc sessions, izolace `HOME`, pinování cíle | ✅ CLI 11.11.0 běžel v egd labu (macOS, Global Admin); ❓ instalace z npm do projektu **bez PSGallery a bez admin práv** v labu nezkoušena (viz [04](04-integrace-test-plan.md), řádek o deployi); ❓ v E.ON (proxy, npm mirror) nezkoušeno, viz [skills/egd-prvni-appka/TEST.md](skills/egd-prvni-appka/TEST.md) |
| `spfx-develop` | psaní SPFx: víc web partů, Heft, SPFx 1.24.1 / Heft 1.3.2 / Node 22.23 | 📘 gulp od 1.24 nepodporován (build SPFx 1.24.1 / Heft ✅ v labu, `verified.md` ✅ jen pro `spfx-ship`; u `spfx-develop` ❓ bez odkazu na měření); EG.D má 1.18.2 + gulp ⛔ (z podkladů EG.D), viz 🔀 níž |
| `spfx-performance` | schovat rámec SharePointu, zmenšit bundle, změřit dopad | ❓ bez odkazu na důkaz; měření v PPF tenantu / labu nedohledána, ověřit podle skillu v labu |

Stav: použitelné, ale „ne 100 %“ (Pavel 10. 11.). Chybí verzování a distribuce pro účastníky (varianty níž).
Seznam „v EG.D nevíme“ v návodu pro AILab (artefakt, [00](00-co-mame.md)) má svůj počet jen v artefaktu; z projektu ho doložit nelze ❓.

Další související: `~/.claude/skills/m365-graph` (PPF Graph; pro EG.D nepoužitelné, protože míří do PPF tenantu a používá sdílený PPF token 📘, v E.ON neověřitelné ⛔).

## ppf-citizen-ai-devkit (Citizen AI developer kit)

| | |
|---|---|
| Repo | https://ppfas.ghe.com/ppf-it/ppf-citizen-ai-devkit, viditelnost `INTERNAL` ✅ (`gh repo view`, 22. 11.) |
| Katalog | marketplace `https://ppfas.ghe.com/ppf-it/ppf-skills.git`, plugin `ppf-citizen-ai-devkit` |
| Verze | **release a tag v0.8.0**, 15. 11. 2026 ✅ (`GH_HOST=ppfas.ghe.com gh release list -R ppf-it/ppf-citizen-ai-devkit`). **Rozpor:** `plugin.json` v tagu `v0.8.0` i na `origin/main` zdrojového repa hlásí `"version": "0.7.0"` ✅ (`git show v0.8.0:plugin/ppf-citizen-ai-devkit/.claude-plugin/plugin.json`, po `git fetch`); kopie pluginu v katalogu `ppf-skills` (`plugins/ppf-citizen-ai-devkit/.claude-plugin/plugin.json`) a `marketplace.json` hlásí 0.8.0 ✅ (`gh api`). Dopad: kdo instaluje z katalogu, dostane štítek 0.8.0; ZIP z `node tools/build-plugin.mjs --zip` se staví ze zdrojového repa, takže může nést 0.7.0 ❓ (ověř: sestavit ZIP, přečíst `plugin.json` uvnitř). Skutečné `/plugin install` v tomto projektu neproběhlo ❓. Návrh nápravy (vlastník kitu): sladit `plugin.json` ve zdroji na 0.8.0 |
| Lokálně | `~/Projects/ppf-spfx-devkit`; před prací `git fetch` a `git status -sb` (lokální checkout bývá pozadu za `origin/main`) |
| Závislosti | ppf-material, ppf-browsermagic, m365-cli-12 (doinstalují se, nevypínat) |
| Prerekvizity | Node 22.14+/24/26 (engines SPFx 1.24 📘; ✅ build šablony na Node 22.23), git, DEV web s vlastnictvím a site app catalogem, jednorázový `m365 login`, přihlášení sondy. Test v labu: [skills/egd-pripravenost/TEST.md](skills/egd-pripravenost/TEST.md) |
| Novinka 0.8 | místní cockpit bez artefaktů claude.ai, určený i pro **GitHub Copilot CLI** |

### Copilot CLI: co je změřeno

- ✅ Příkaz `copilot skill list` existuje v Copilot CLI 1.0.91 ([TEST.md](skills/egd-pripravenost/TEST.md)); balíček `@github/copilot` je v npm ([sondy/lab-github/npm-copilot-cli.txt](sondy/lab-github/npm-copilot-cli.txt)).
- 📘 „Funguje v Copilot CLI (0.7.1+)“: pouze podle autora kitu, zkouška prototypu na macOS s CLI 1.0.91 (`docs/vydani-0.8.md` v repu kitu). **Vlastní běh našich skillů v Copilotu máme** ✅: každý skill má `skills/<skill>/TEST-copilot.md` (tooling `tools/copilot-run.sh`, `tools/copilot-skill-install.sh`). ❓ VS Code agent mode.
- ⛔ Windows (PowerShell 6+ pro Copilot CLI, `winget install GitHub.Copilot` nebo npm): v labu není Windows ani `winget`. Návrh: Windows VM; do té doby jen pondělní zkouška u účastníků.
- ⛔ Licence Copilot v E.ON: stav neznámý, ověří Adriána / IT EG.D. Zálohy a varianty: [09](09-github-ucastnici.md).

### Rizika pro EG.D

- Ověřený jen na macOS proti PPF webu MeetAI-Dev. **Windows, Edge a jiný tenant nejsou změřené** ⛔ (v labu není Windows; EG.D
  bude na Windows a v E.ON tenantu). Návrh: Windows VM s účtem bez admina; pondělní rozeslání `egd-pripravenost` jako zkouška.
- Repo i katalog jsou na PPF GHE (`INTERNAL` ✅). Že k nim lidé z EG.D nemají přístup, je odvozeno z viditelnosti ❓
  (nezkoušeno pod účtem mimo PPF GHE). Distribuce: varianty níž.
- Kit má prefixy a výchozí hodnoty pro PPF; `project_config.json` pro lab tenant ani pro E.ON není vyzkoušený ❓ (pro lab ověřitelné,
  test „Kit mimo PPF“ v [04](04-integrace-test-plan.md); pro E.ON ⛔).

## 🔀 SPFx: 1.18.2 + gulp (EG.D) vs. 1.24 + Heft (naše skilly)

Podklady: [skills/egd-prvni-appka/references/chyby.md](skills/egd-prvni-appka/references/chyby.md), sekce „Node a SPFx“.
Fakta: SPFx 1.24 vyžaduje Node `>=22.14 <23`, 24 nebo 26 📘 (engines šablony); build naší šablony 1.24.1 na Node 22.23 ✅;
na Node 18 se CLI for M365 (11 i 12) nespustí ✅ (`yargs-parser` chce Node 20+, [TEST.md](skills/egd-pripravenost/TEST.md));
„gulp od 1.24 neexistuje“ je 📘 (scaffold 1.24 s gulpem v labu nezkoušen ❓). Appku Snake s 1.18.2 + gulp + Node 18 máme jen z podkladů EG.D ⛔.

| Varianta | Pro | Proti | Co chce IT E.ON | Náročnost pro citizen developera |
|---|---|---|---|---|
| **A) zůstat na 1.18.2 + gulp + Node 18** | shoduje se se stávající appkou a stroji EG.D | v labu **neměřeno** ❓: šablony, skilly (`spfx-develop`, `egd-prvni-appka`) a sondy jsou na 1.24.1; CLI for M365 na Node 18 nejde ✅, takže nasazení by potřebovalo druhý Node | nic nového | ❓ neměřeno (dva Node, ruční postup mimo naše skilly) |
| **B) 1.24 + Heft + Node 22.14+/24/26** | ✅ změřeno v labu (build, nasazení, upgrade); CLI běží; všechny naše skilly a šablony | nutný novější Node na stroji (portable zip z nodejs.org bez admina je 📘, na Windows nezkoušen ⛔); 1.24 neumí gulp, takže stará appka se musí migrovat | povolit instalaci nebo portable Node 22+; věta pro ServiceNow je ve skillu | nižší: skill to vede; Node si stáhne sám |
| **C) migrace existující 1.18.2 appky na 1.24 + Heft** | stará appka dostane novější SPFx | skill `spfx-develop` migraci gulp → Heft popisuje, ale v labu neměřena ❓; nasazená 1.18.2 appka běží dál bez migrace 📘 | jako B | vyšší (úprava cizího projektu) |
| **D) bez SPFx kódu** (cesta B ve skillu `egd-prvni-appka`: seznam + pohledy + volitelně Power Apps) | nepotřebuje Node ani katalog | omezená funkčnost; návod [bez-kodu.md](skills/egd-prvni-appka/references/bez-kodu.md) nikdo neprošel ❓ | jen role Člen na webu | nízká |

Doporučení neformulujeme, dokud není A změřená aspoň jednou (návrh pro Ověřovatele: v labu scaffold SPFx 1.18.2 + gulp na portable Node 18,
build `.sppkg`, nasazení a stejné pod 1.24).

## 🔀 Distribuce balíčku účastníkům EG.D

GHE PPF je interní (`INTERNAL` ✅). Žádná z cest níž nebyla vyzkoušena pod účastníkem bez PPF GHE ❓. Instalační příkazy pro Claude
a Copilot se liší (`/plugin …` vs. `copilot skill …`, složky `~/.claude/skills` vs. `~/.copilot/skills`), `tools/copilot-skill-install.sh` slouží pro Copilot.

| Varianta | Pro | Proti | Co chce IT E.ON | Náročnost pro citizen developera |
|---|---|---|---|---|
| **a) ZIP** (`node tools/build-plugin.mjs --zip` pro kit; složky `skills/egd-*` jako ZIP) | nepotřebuje GHE ani GitHub; jeden soubor | přenos souboru (mail / sdílená složka) může filtrovat IT ❓; ruční aktualizace; štítek verze ❓ viz rozpor výše; instalace ZIPu do Claude i Copilota nezkoušena mimo PPF ❓ | povolit přijetí ZIP a rozbalení | střední: rozbalit do správné složky podle návodu |
| **b) Kopie repa / katalogu na firemní GitHub EG.D** | aktualizace přes marketplace; jejich prostředí | adresa firemního GitHubu **neznáme** ⛔ ([09](09-github-ucastnici.md)); někdo z EG.D musí repo založit; PPF obsah v E.ON | repo, přístup, schválení | nižší po zřízení |
| **c) Veřejný GitHub** (např. kopie `egd-*` skillů, bez PPF-interních částí) | žádný přístup od IT, instalace z URL | kit je PPF interní, zveřejnění rozhodne vlastník ❓; síť EG.D musí povolit `github.com` ⛔; obsah veřejný | povolit `github.com` | nižší |
| **d) jen skilly `skills/egd-*` jako složky** (bez kitu) | nejjednodušší, kopie do složky skillů | bez kitu (cockpit, nasazení s plánem) chybí; kit je navíc pro PPF | nic | nízká |
| **e) sdílená složka v tenantu E.ON** (SharePoint / Teams / OneDrive) | jejich tenant, bez GitHubu | musí ji založit někdo z EG.D (Pavel je tam host, přístupnost „někdy ano, někdy ne“ ❓) | kdo založí a sdílí | nízká |
| **f) na místě** (USB / sdílení v místnosti A 0488) | nezávisí na síti | až ve středu 12:30, ne dřív; nehodí se pro pondělní zkoušku | nic | nízká |

Rozeslání skillu `egd-pripravenost` účastníkům před workshopem se řídí [05](05-otevrene-body.md). Doporučení až po výběru.

## AI Engineering Library od EG.D

Adriána 10. 11. poslala export (`skills-download.zip`, 2,85 MB, mail „RE: Sharepoint app deploy“): podle mailu 117 skills,
5 MCP serverů, 3 hooky, 9 system promptů, 2 CI šablony (čísla z mailu). ZIP byl rozebrán 24. 11. ✅: knihovna má 117 skillů ([prehled/epl-navrhy.html](prehled/epl-navrhy.html); ostatní počty jsem v rozboru neověřoval ❓). Za klíčové E.ON skilly označila:
`eon-security`, `eo-compliance-standards`, `code-review`, `deep-security-audit`, `eon-ui-design-system`. Pavel slíbil porovnání
(„mrknu na to“); otevřený bod [05](05-otevrene-body.md) (bod o `skills-download.zip`). Ověření: otevřít ZIP z PPF Outlooku a spočítat položky; zjistit, zda tři plánované
skilly (`eon-ui-design-system`, `eon-security`, `eo-compliance-standards`) v něm opravdu jsou.

## Co z toho dát EG.D na workshop (návrh, ne rozhodnutí)

1. Balíček = 10 skillů `egd-*` + obecné skilly + kit; forma podle varianty distribuce výše (ZIP je jen jedna z nich).
2. Doplnit E.ON vrstvu z jejich knihovny (`eon-ui-design-system`, `eon-security`, `eo-compliance-standards`), jakmile se ověří, že v ZIPu jsou.
3. Pro Copilot: ověřit, že skilly a kit běží v GitHub Copilot CLI i na Windows (licence přes ServiceNow, [09](09-github-ucastnici.md)); zatím ❓ a ⛔.
