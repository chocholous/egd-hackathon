# E2E běh účastníka v GitHub Copilot CLI (24. 11. 2026)

Tester: session test-copilot. Pokyny: [BRIEF.md](BRIEF.md). Vzor: [../README.md](../README.md) (Claude, egd10).
Účet **egd09** (rezervace přes výdej, okno `e2e-egd09`, přihlášení M365 dělal Pavel), web `/sites/egd09-dev`,
m365 v11 v `~/.m365-e2e-egd09` (kopie do sandboxu `--m365-from`). Copilot CLI 1.0.114, model volí Copilot sám.
Skilly z `dist/egd-skills.zip` **SHA-256 `8ed759fae6964b21899505018116982497d71986db23a4bb818a0b6d7610fc1d`** (rozbaleno do
`~/egd-e2e-copilot/rozbaleno`). Sandbox `~/egd-e2e-copilot/sandbox` (mimo repo, viz Z-C1). Důkazy: `dukazy/`.

**Závěr:** ✅ Copilot si skilly ze ZIPu nainstaloval sám (shodné `diff -rq`), prošel egd-pripravenost (26 zelených, 4 žluté, 0 červených)
a postavil a nasadil appku EG.D / single na egd09-dev; v prohlížeči hlas 4 → změna na 2, hlasů dnes 1, spolužák egd01 nemá přístup.
Ale ⚠️ **na značku ani režim se Copilot nezeptal** (viz Z-C2, Z-C3).

## Časová osa

| # | Krok | Čas | Co se stalo | ✅/❌ | Důkaz |
|---|---|---|---|---|---|
| 1 | Instalace skillů Copilotem z ZIPu (instalační prompt, cíl `$SB/home/.copilot/skills`) | 48 s | zkopíroval 10 složek, ověřil `SKILL.md`, `copilot skill list` je vidí bez restartu; `diff -rq` shodné | ✅ | `dukazy/copilot/01b-instalace-mimo-repo/` |
| 2 | „zkontroluj připravenost na workshop“ (nová relace) | 1 min 39 s | `cli-instalace` (lokální CLI 12), síť, Node, hlásí „částečná“; na jméno ani DEV web **se nezeptal**, dokončil s jménem z účtu OS | ⚠️ | `…/02-pripravenost/` |
| 3 | odpověď „jméno, DEV web, tenant (zkušební, ne E.ON), ITSM/GitHub přeskoč“ (`--continue`) | 1 min 44 s | dopsal zprávu `pripravenost-e2e-copilot.md`: 26 zelených / 4 žluté / 0 červených; přihlášení, role, katalog, licence Power Apps ověřil; appId si vzal z přihlášení (účastník ho jinak nemá odkud znát, Z3); zkušební zápis nespustil | ✅ | `…/03-odpoved-krok0/`, `dukazy/pripravenost-e2e-copilot.md` |
| 4 | „Ano, postav mi první appku, ale přes skill egd-prvni-appka“ | 3 min 3 s | `novy --znacka egd --rezim single`, build, `seznam` plán → zápis, `nasadit` plán → zápis na egd09-dev, `over`; pak adresa `?env=WebView` | ✅ / ⚠️ | `…/04-appka/` |
| 5 | Prohlížeč (CDP, okno egd09): appka | | nadpis, otázka, 5 tlačítek, dashboard 0 hlasů, indigo oblé tvary | ✅ | `dukazy/30-appka.png` |
| 6 | klik na „Spíš spokojen/a“ | | „Zapsáno: 4. Díky!“, hlasů dnes 1, průměr 4,0 | ✅ | `dukazy/31-hlas-4.png` |
| 7 | klik na „Spíš nespokojen/a“ | | „Změněno na 2. Díky!“, hlasů dnes zůstává 1, průměr 2,0 | ✅ | `dukazy/32-zmena-2.png` |
| 8 | `over` | | katalog nasazeno true, `SingleWebPartAppPage`, seznam 1 hlas (2026-11-24 → 2) | ✅ | `dukazy/35-over.txt` |
| 9 | Spolužák egd01 (režim single) | | „You don't have access to this item“ | ✅ | `dukazy/40-spoluzak.png` |
| 10 | Uvolnění egd09 | | `tools/lab-vydej.py uvolnit egd09` → „uvolněno: egd09“; `lab-vydej.py stav` pak v rezervacích egd09 nemá (jen egd03, egd04, egd06) | ✅ | `dukazy/53-vydej-stav-po-uvolneni.txt` |

Celkový čas Copilota (kroky 1–4): ~7 min 15 s. AI Credits: `usage.json` kroků 2–4 je **kumulativní** za jednu relaci (`--continue`), tedy 1,21 → 2,61 → 4,12 (celkem 4,12, nesčítat); krok 1 (instalace, samostatná relace) 0,45.

## Nálezy

- **Z-C1 Sandbox v repu = nečistý účastník.** Můj první pokus o krok 2 běžel v `sondy/e2e/copilot/sandbox` (BRIEF). Copilot z cwd
  uvnitř repa načetl pokyny projektu, volal `tools/stav.sh` a `git status` a zapsal do `prehled/stav/`
  ([log](dukazy/copilot/02-nečistý-sandbox-v-repu-pripravenost/log.txt)). Zopakováno se sandboxem `~/egd-e2e-copilot/sandbox`.
  Pro BRIEF: sandbox patří mimo repo (jak brief připouští).
- **Z-C2 Značka: nezeptal se (v tomto běhu).** V kroku 3 jsem nechtěně použil větu „ne E.ON“ (z BRIEFu) a Copilot si v kroku 4
  vybral EG.D sám a ve zprávě řekl „použil jsem vzhled EG.D“. Stejné zjištění jako ve [skills/egd-prvni-appka/TEST-copilot.md](../../../skills/egd-prvni-appka/TEST-copilot.md)
  (dodatek 24. 11.): kdo značku zmíní, byť nepřímo, dotaz nedostane. Čistý dotaz na značku tam prošel.
- **Z-C3 Režim (single / open): nezeptal se vůbec.** Skill říká „vždy se zeptej“ i na `--rezim`, `novy` bez něj končí rc 2; Copilot
  si přečetl `--help` a rovnou zvolil `single` (nejbezpečnější). Zadání nenabízelo nápovědu. Pro skill: u režimu je výchozí volba
  Copilotem tichá; zvážit, zda je to přijatelné (single je bezpečná výchozí hodnota), nebo zpřísnit „před `novy` napiš otázku a skonči“.
- **Z-C4 „ano“ k zápisu.** Copilot po „Ano, postav mi první appku“ pustil `seznam --ano` i `nasadit --ano` sám (plán ukázal a vzal
  to jako souhlas). Plán mířil na egd09-dev, takže v pořádku; SKILL.md přitom chce samostatné „ano“ k zápisu.
- **Z-C5 Jméno a web nezjišťoval.** Krok 2 skončil „částečná“ bez dotazu na jméno a adresu webu (`zprava --jmeno <OS uživatel>`).
- **Z-C6 CLI verze ❓.** Copilot v kroku 2 nainstaloval lokální CLI 12 (`cli-instalace`, ~240 MB). Proměnné `PRIPRAVENOST_M365_CLI`
  a `PRVNI_APPKA_M365_CLI` na v11 byly nastavené; které CLI skutečně použila kontrola přihlášení, z logu nevyplývá, přihlášení prošlo.
- **Z-C7 Přepis a OSC 8:** adresy v logu s escape sekvencemi (jen zobrazení).

## Neověřeno

Windows, VS Code agent mode, režim **open** v Copilotu (Claude běh: E.ON + open), značka E.ON na egd09, Copilot bez `--m365-from`
(device code dělá člověk), zkušební zápis `zkouska` (nespustil).

## Disk

`node_modules` v sandboxu (CLI 12 ~240 MB, `prvni-appka` ~0,7 GB, `npm ci` od nuly): po běhu `tools/apfs-dedupe.py`
(`/tmp/dd1.log`, `/tmp/dd2.log`). Volno před během 24 GiB. Sandbox mimo repo ponechán jako důkaz.

## Důkaz původu snímků a identity (doplněno na žádost auditu)

- **Vznik snímků 30, 31, 32, 40:** nekopírovány. 30–32 jsem pořídil příkazy z BRIEFu (krok 2) v okně `e2e-egd09`:
  `node sondy/e2e/cdp.mjs e2e-egd09 tab:egd09-dev "goto:https://pavelchocholousgmail.sharepoint.com/sites/egd09-dev/SitePages/prvni-appka.aspx?env=WebView" wait:9000 shot:sondy/e2e/copilot/dukazy/30-appka.png`,
  potom `click:Spíš spokojen` a `click:Spíš nespokojen` s `shot:…31-hlas-4.png` a `…32-zmena-2.png`. 40: `node tools/lab-spo-stranka.mjs egd01 "<stejná URL>" wait:6000 --shot …/40-spoluzak.png`.
  Shodné md5 s egd10 vysvětluji tím, že appka je ze stejné šablony, na snímku není jméno ani adresa (`?env=WebView` = celé okno bez rámu), stejné okno a datum
  (24. 11.) a stejná data (0 hlasů, pak 4, pak 2); render je deterministický. **Samotné snímky 30–32 identitu účtu nedokládají**, proto následující důkazy.
- **Identita okna a webu (`_api/web/currentuser`, URL stránky):** [dukazy/50-identita-currentuser.txt](dukazy/50-identita-currentuser.txt) = `egd09@pavelchocholousgmail.onmicrosoft.com`, „Účastník 09“, URL `…/sites/egd09-dev/SitePages/prvni-appka.aspx?env=WebView`.
- **Odlišující snímek:** [dukazy/51-seznam-egd09.png](dukazy/51-seznam-egd09.png): seznam `MojeAppka` na webu „Účastník 09 – DEV“, jedna položka 2026-11-24, Hodnocení 2 (to je hlas po změně 4 → 2).
- `over` z doby běhu: [dukazy/35-over.txt](dukazy/35-over.txt) (seznam 1 hlas, 2026-11-24 → 2); hlas Účastníka 09 potvrdil i audit čtením z labu.
- **Balíček:** [dukazy/52-zip-sha256.txt](dukazy/52-zip-sha256.txt): `shasum -a 256 ~/egd-e2e-copilot/egd-skills.zip` = `8ed759fa…0d6610fc1d` (shodné s hodnotou od hlavní session), 98 souborů v archivu a 10 složek `egd-*` po rozbalení. Dnešní `dist/egd-skills.zip` už má jiný hash (`08cb3306…`), balíček byl od té doby přestavěn; test běžel nad kopií v `~/egd-e2e-copilot/`. Log samotného `unzip` jsem neukládal (rozbalení bez výstupu, `-q`); shodnost instalace: [dukazy/54-diff-instalace.txt](dukazy/54-diff-instalace.txt) (znovu spuštěno po běhu).
