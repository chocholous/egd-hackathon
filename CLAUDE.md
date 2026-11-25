# egd-workshop — pravidla projektu

Příprava a podklady k vibecoding hackathonu s EG.D (25. 11. 2026) a navazující konzultaci
citizen AI developmentu. Kontext a rozcestník: [README.md](README.md).

## Tři zásady (Pavel, 2026-11-22)

1. **Maximální paralelizace.** Nezávislou práci (sondy, research, testy, psaní částí) pouštěj
   najednou v samostatných agentech (Sonnet, Opus na těžší úsudek; Fable jen na nejasné nebo
   složité syntézy — v tomto projektu výslovně povoleno). Paralelní agenti nesmí psát do stejných
   souborů ani do stejné resource group / SharePoint webu.
2. **Znovupoužitelné nástroje pro agenty.** Cokoli, co agent udělal ručně a bude potřeba znovu
   (přihlášení do labu, token, deploy SPFx, založení webu, inventura), patří do `tools/` jako skript
   s `--help` a jednou větou v [tools/README.md](tools/README.md). Než píšeš nový postup, podívej se tam.
3. **Centrální hierarchická dokumentace.** Jeden kořen [README.md](README.md) → témata (01–05) →
   podrobnosti (`sondy/`, `skills/`, `zdroje/`). Každý nový dokument zapiš o úroveň výš do rozcestníku.
   Fakta neduplikuj — odkazuj. U tvrzení značky ✅ změřeno / 📘 dokumentace / ❓ neověřeno.

## Kánon: každé tvrzení ověřené v labu (Pavel, 2026-11-22)

Platí pro všechny agenty, sessions, skilly i dokumenty bez výjimky:

- **Tvrzení, ze kterého něco plyne pro EG.D (jde / nejde / limit / postup / cena), musí být ověřené
  v labu**: spuštěním, měřením, pokusem pod reálným účtem. Výsledek ✅ s odkazem na důkaz (soubor,
  příkaz, výstup).
- 📘 dokumentace a ❓ jsou jen **mezistav**, ne závěr. Skill ani doporučení nesmí stavět na 📘.
  Co ověřit nejde, zapiš do sekce „Neověřeno“ s důvodem (např. „jen v tenantu E.ON“) a navrhni,
  jak a kde to ověřit.
- Postup ve skillu (příkaz, kód, klikací cesta) musí agent v labu opravdu projít. Zkontrolovat
  syntaxi nestačí.
- Najdeš-li v projektu tvrzení jen z dokumentace, ověř ho v labu, nebo ho označ a nahlas hlavní session.
- **Když ověřování přinese víc funkčních variant, zdokumentuj všechny** (např. CLI / REST / UI,
  SPFx / Power Automate / Container App). U každé uveď, co bylo v labu ověřeno, pro a proti, co chce
  od IT E.ON a jak je těžká pro citizen developera. Doporučení přidej až potom. Nevítězné varianty nemaž.
- **Skill nepředepisuje jednu cestu, ale žebřík variant** (Pavel, 22. 11.). Agent si v prostředí
  účastníka sám vyzkouší, co funguje: Windows / Mac, admin práva ano / ne, PowerShell 5.1 / 7, winget,
  npm, portable Node, stažení mimo PSGallery, CLI / REST / prohlížeč, proxy. Pořadí je od nejjednodušší
  varianty, u každé je test „funguje?“ a co dělat, když ne. Na konci agent zapíše, kterou variantu použil.
  Každá varianta je ověřená v labu, nebo označená ⛔ „jen v E.ON“ s postupem, jak ji ověřit.
- **Každý skill pro EG.D se ověřuje ve dvou agentech: Claude i GitHub Copilot** (Copilot CLI,
  tooling `tools/copilot-*.sh`). Výsledek je v `skills/<skill>/TEST-copilot.md`. Skill je hotový,
  teprve když projde v obou.
- Plnění kánonu kontroluje audit ([audit/overeni.md](audit/overeni.md)). Na jeho požadavek autor
  tvrzení ověří a doplní.

## Samostatné sessions

**Stálé role:** sessions mají role a vlastní soubory podle [prehled/role.md](prehled/role.md).
Práce jde nejdřív k roli, která oblast vlastní. Novou session zakládej jen pro práci mimo všechny role.
Chceš-li změnu v souboru jiné role, pošli jí `SendMessage` a needituj ho sám.

Paralelní práci spouštěj jako **samostatné sessions, ne jako subagenty** (Pavel, 2026-11-22: sessions
může sledovat a mluvit k nim napřímo). Spouštěj je **bez ptaní**; pro destruktivní, placené nebo ven
odesílané kroky uvnitř nich dál platí výslovné ano. Subagent jen na krátké čtení, jehož výsledek je
potřeba hned v téže odpovědi. Každá session dostane: odkaz na tento soubor, své `id` pro `tools/stav.sh`,
vlastní výstupní soubor a vlastní resource group / web.

## Stav práce = jeden řádek (povinné pro každého agenta)

Živý přehled prací: https://claude.ai/artifact/TyBcdy4fjd4KP6aGTSveNT. Agenti do něj **nepíší přímo**,
jen zavolají skript (šetří kontext a nekoliduje při paralelní práci; každý úkol má vlastní soubor):

```bash
~/Projects/egd-workshop/tools/stav.sh <id> <planovano|bezi|ceka|hotovo> "<název>" -p "<co se děje>" -o <oblast> -k "<kdo>" -v "<výstup>"
```

Volej na začátku, při větším kroku a na konci. `id` drž stejné po celou dobu úkolu. Hlavní session
soubory z `prehled/stav/` promítá do artefaktu.

## Pravidla paralelní práce (konflikty)

- Každý agent má vlastní výstupní soubor / složku, vlastní resource group a vlastní SharePoint web.
- Sdílené soubory (`README.md`, `tools/README.md`, `00-co-mame.md`, `CLAUDE.md`) edituje jen hlavní session;
  agenti své nálezy vrací v reportu nebo ve svém souboru.
- Cokoli, co vyžaduje vlastní server (Container App / Job), patří do [10-container-app.md](10-container-app.md):
  funkce, co ji otevírá, a požadavky na IT. Agenti to hlásí v reportu, zapisuje hlavní session.
- Brief pro agenta = odkaz na tento soubor + úzké zadání; neopisuj mu celé podklady, ať šetří kontext.
- **Git** (od 23. 11.): privátní repo https://github.com/chocholous/egd-workshop, větev `main`.
  Commituje a pushuje **jen hlavní session**, vždy výčtem cest (nikdy `git add -A` ani `git add .`)
  a po `gitleaks git --pre-commit --staged`. Ostatní sessions necommitují, jen píší své soubory.
  Tajemství, `node_modules`, buildy SPFx a falešné HOME Copilota hlídá `.gitignore`; nový typ tajného
  souboru pojmenuj `*.secrets.json` nebo dej do složky `*.secrets/`.
- **Nové `node_modules` jen jako APFS klon (`cp -c`) ze zdravého vzoru** (Pavel, 2026-11-24; disk je
  plný a `npm ci` od nuly bere ~0,7 GB na každý SPFx projekt). Postup:
  1. Vzor najdi příkazem, neopisuj cestu: `fd -H -I -t d '^node_modules$' --prune ~/Projects/egd-workshop`,
     přednostně ten se shodným `package-lock.json` (`cmp` se zámkem cílového projektu).
  2. Ověř, že je zdravý: `fd -H -I -t f -S -1b '^package\.json$' <vzor>` nesmí nic vypsat ✅ fd 10.5.2
     najde prázdný `package.json` (24. 11. tak vyšly 2 v `sondy/dokumenty/node_modules`) (23. 11. jsme
     koš plnili rozbitými stromy s prázdnými `package.json`).
  3. `cp -c -R <vzor> <cíl>/node_modules`, pak v cíli `npm install` (doplní jen rozdíly). Při shodném
     zámku stačí `npm ls >/dev/null` jako kontrola.
  4. Po instalaci `tools/apfs-dedupe.py <cíl>/node_modules <vzor>` (sloučí, co npm zapsal nově).
  Instalace od nuly jen tam, kde vzor neexistuje; uveď to v reportu.

## Struktura

| Cesta | Co tam je |
|---|---|
| `README.md` | kořen: termín, rozcestník „kde co je“ |
| `01-…05-*.md` | fakta workshopu, skills a kit, lab, integrace a testy, otevřené body |
| `skills/` | skilly pro EG.D (pondělní `egd-prvni-appka`) |
| `sondy/` | výsledky sond k Tomášovým požadavkům, `_zadani-spolecne.md` = pravidla sond |
| `tools/` | znovupoužitelné skripty pro agenty |
| `zdroje/` | výtahy z jiných Claude účtů a zdrojů |

## Lab (jediné místo pro zápisy)

- M365 tenant `pavelchocholousgmail.onmicrosoft.com`; m365 CLI vždy `HOME=~/.m365-osobni m365 …`
  (bez `HOME=` míří na PPF!). Nově přednostně `tools/lab-m365.sh …`: hlídá verzi 11, obnovuje
  ztracenou token cache ze zálohy. Stav přihlášení zjistíš bez sítě: `tools/lab-m365.sh --stav`.
- 🔴 **Sdílené přihlášení `~/.m365-osobni` je jen pro globální m365 v11.** CLI 12 a lokální
  instalace z `node_modules` (testy skillů, `PRIPRAVENOST_M365_CLI`, Copilot) běží s **vlastním
  HOME** a vlastním loginem. 23. 11. test CLI 12 nad sdíleným HOME smazal refresh token a Pavel
  se musel znovu přihlašovat. Login dělá jen Pavel; agent při ztrátě přihlášení nejdřív
  `--stav`, pak hlásí hlavní session. Sám login nespouští. Všechna přihlášení labu najednou
  (az, m365, Power Automate, profily prohlížeče): `tools/lab-prihlaseni-stav.sh`.
- Azure vždy `--subscription 05a636d8-d8e3-49d2-a450-4b3ff7cc0a13`; nové zdroje jen v
  `rg-egd-<něco>` s tagem `ucel=egd-workshop`.
- Rozpočet: ~50 USD na zkoušení teď, do