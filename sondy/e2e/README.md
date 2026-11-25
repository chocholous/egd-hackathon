# E2E běh hackathonu pod účtem účastníka (Claude) – 24. 11. 2026

Jeden souvislý průchod od výdeje účtu po hotovou appku pod **egd10**, jen cestou účastníka (skilly
`egd-pripravenost` → `egd-prvni-appka`), bez zkratek správce. Agent: Claude Code (Opus 5.5), macOS arm64,
Node 22.23.5. Přihlášení (výdej, M365, CLI) dělal jen Pavel; agent hesla nezadával.

- Pracovní složka účastníka: `sondy/e2e/prace/` (odpovídá `%USERPROFILE%\egd-workshop`), `node_modules` gitignored.
- Profil prohlížeče: `~/.config/ppf-rooms-lab/profily/e2e-egd10` (čistý, založený pro tento běh).
- CLI: nainstalováno lokální `@pnp/cli-microsoft365` 12.0.0 v `prace/node_modules`, ale přihlášení a všechny zápisy
  běžely přes globální m365 **v11.11.0** s vlastním `HOME=~/.m365-e2e` (CLI 12 v izolovaném HOME selhalo, Z2b).
- Verze skillu `egd-prvni-appka`: `801db34` (2026-11-24 11:13, „README a chyby.md sjednocené na Node 22…“); v okamžiku startu běhu `ad402b8`.
- Pomocné nástroje tohoto běhu: [okno.sh](okno.sh) (viditelný Chrome s CDP na náhodném portu),
  [cdp.mjs](cdp.mjs) (kroky v okně: tab/goto/click/shot/text), [rezervuj.mjs](rezervuj.mjs) (rezervace ve výdeji),
  [foto-maska.mjs](foto-maska.mjs) (snímek výdeje s maskou hesla).

## Časová osa

| # | Krok | Čas (CET) | Min | Co účastník viděl | Výsledek | Důkaz |
|---|---|---|---|---|---|---|
| 1 | Výdejní web: společné heslo (Pavel) → jméno → „Beru tenhle“ u egd10 | 11:09–11:10 | 1 | stránka „Lab účty EG.D“, po rezervaci „Váš účet: egd10“, jméno, heslo, 3 weby, „Vracím účet“ | ✅ | [01](dukazy/01-vydej-start.png), [02](dukazy/02-vydej-seznam.png), [03 (heslo zamaskováno)](dukazy/03-vydej-rezervovano.png), [rezervace.log](dukazy/rezervace.log) |
| 2a | Přihlášení do M365 v čistém profilu (Pavel) | 11:10–11:12 | 2 | web `egd10-dev`, `currentuser` = „Účastník 10“ (`egd10@…`) | ✅ | [04](dukazy/04-m365-web-egd10-dev.png) |
| 3a | egd-pripravenost kroky 2–3 (nástroje, npm, síť, varianty) | 11:13–11:15 | 2 | vše zelené kromě rozšíření Copilot Chat ve VS Code (žlutá) | ✅ | [10-pripravenost-kroky2-3.log](dukazy/10-pripravenost-kroky2-3.log) |
| 3b | krok 4 `cli-instalace` (CLI 12.0.0 lokálně) | 11:15–11:17 | 2 | „CLI for Microsoft 365 v12.0.0 lokalne v node_modules“ | ✅ (viz zádrhel Z2) | [11-cli-instalace.log](dukazy/11-cli-instalace.log) |
| 4a | egd-prvni-appka `novy --znacka egd` + balíčky + `build` | 11:20–11:25 | 5 | `prvni-appka.sppkg` 12 169 B, verze 1.0.0.0; build 10 s | ✅ | [20](dukazy/20-appka-novy.log), [21](dukazy/21-appka-npm-install.log), [22](dukazy/22-appka-build.log) |
| 2b | Přihlášení m365 CLI jako egd10 (Pavel, device code, lab appId `12f19539-…`) | 11:19–11:27 | 8 | 1. pokus CLI 12: `CachePersistenceError` (Z2b); 2. pokus globální v11.11.0: `connectedAs egd10`, **bez AADSTS65001** | ✅ | [12](dukazy/12-pripravenost-kroky5-7.log) |
| 3c | egd-pripravenost kroky 5–6 (`prihlaseni`, `sharepoint`) | 11:27 | 1 | web „Účastník 10 – DEV“, role Vlastník, vlastní katalog aplikací (0 balíčků), smí nahrát .sppkg, licence SPE_E5 | ✅ | [12](dukazy/12-pripravenost-kroky5-7.log) |
| 3d | krok 7 `zkouska` plán → `--ano`, krok 8 `spfx`, 9b `github`, 10 `zprava` | 11:27–11:28 | 1 | seznam `EGD-pripravenost` + 1 položka přečtená zpět; SPFx zelená; zpráva: **cesta A**, 28 zelených / 2 žluté / 0 červených | ✅ | [13](dukazy/13-pripravenost-kroky7-10.log), [zpráva](dukazy/14-pripravenost-e2e-egd10.md) |
| 4b | egd-prvni-appka `cesta` → `seznam` plán → `--ano` | 11:28 | 1 | „DOPORUCENA CESTA: A“; seznam `MojeAppka` se sloupci Hodnoceni, Den a formátováním (EG.D semafor) | ✅ | [23](dukazy/23-appka-cesta-seznam.log) |
| 4c | `nasadit` plán → `--ano` → `over` | 11:28–11:30 | 1 | add/deploy/install, stránka SingleWebPartAppPage, publikováno; `over`: katalog 1.0.0.0 nasazeno, 0 hlasů | ✅ | [24](dukazy/24-appka-nasadit-over.log) |
| 5a | Appka v prohlížeči pod egd10 (`?env=WebView`) | 11:30 | 1 | nadpis, otázka, 5 tlačítek, dashboard (EG.D indigo, oblé rohy) | ✅ | [30](dukazy/30-appka-otevrena.png) |
| 5b | Hlas 4 → změna na 2 | 11:30 | 1 | „Zapsáno: 4. Díky!“, pak „Změněno na 2. Díky!“, hlasů dnes zůstalo 1, průměr 2,0, sloupec út 24. 11. | ✅ | [31](dukazy/31-appka-hlas-4.png), [32](dukazy/32-appka-zmena-2.png) |
| 5c | Čtení zpět: `over`, REST, seznam v UI | 11:30–11:31 | 1 | 1 položka: Hodnoceni 2, Den 2026-11-24, Vytvořil „Účastník 10“ | ✅ | [33](dukazy/33-appka-over-po-hlasu.log), [35 REST](dukazy/35-rest-cteni-zpet.json), [34 seznam](dukazy/34-seznam-mojeappka.png) |
| 5d | Spolužák `egd01` (jediný přihlášený profil účastníka) otevře appku egd10 | 11:31 | 1 | „You need access / You don't have access to this item“ (AccessDenied.aspx) | ❌ očekávané (Z5) | [40](dukazy/40-spoluzak-egd01-appka-egd10.png), [log](dukazy/40-spoluzak-egd01.log) |
| 5e | Z6 znovu: `seznam --ano` (skill po opravě, pracovní strom) | 11:45 | 1 | štítek Hodnocení malý a vycentrovaný | ✅ | [36](dukazy/36-seznam-z6-znovu.log), [37](dukazy/37-seznam-z6-po-oprave.png) |
| 5f | Z5 znovu: sdílení webu podle nové sekce skillu (⚙ → Site permissions → Share site → „Účastník 01“, role **Read**, Send email **odškrtnuto**, Add) | 11:46–11:48 | 3 | panel Site access; „Send email“ je ve výchozím stavu zaškrtnuté (Z9) | ✅ | [41](dukazy/41-sdileni-1-nastaveni.png)–[46](dukazy/46-sdileni-6-pridano.png), [45b bez e-mailu](dukazy/45b-sdileni-bez-emailu.png), [sdilej-web.mjs](sdilej-web.mjs) |
| 5g | Spolužák `egd01` jen pro čtení po sdílení | 11:48 | 1 | appka egd10 se vykreslí, dashboard 1 hlas, průměr 2,0, sloupec út 24. 11. (nehlasoval, role Read) | ✅ | [47](dukazy/47-spoluzak-egd01-po-sdileni.png), [log](dukazy/47-spoluzak-egd01-po-sdileni.log) |
| 6 | Úklid: `tools/lab-vydej.py uvolnit egd10` | 11:31 | 1 | `rezervace (0)`; výdejní stránka v okně účastníka po načtení znovu nabízí „Beru tenhle“ | ✅ | [50](dukazy/50-vydej-po-uvolneni.png) |

**Celkem 11:08–11:31 = 23 min** (z toho ~10 min čekání na Pavlovy loginy a jeden neúspěšný pokus CLI 12).
Čistá práce agenta podle skillů: připravenost ~6 min, appka od `cesta` po hlas ~3 min (+ build 10 s; `npm ci` v E2E neměřen, Z4).
Nasazená appka, seznamy `MojeAppka` a `EGD-pripravenost` na `/sites/egd10-dev` zůstávají jako důkaz (mazání jen po ano Pavla).

## Zádrhele

- **Z1 (můj nástroj, ne skill):** první verze `rezervuj.mjs` vypsala heslo egd10 do logu (filtr hledal „heslo:“,
  stránka má štítek a hodnotu na zvláštních řádcích) a CSS blur ve snímku nezabral. Log začerněn, snímek s heslem
  v koši, nový snímek s maskou Playwrightu; skript opraven. Pavel informován. Poučení pro Copilot běh: snímky výdeje
  jen s `mask`, nikdy `innerText` celé stránky.
- **Z2 (skill egd-pripravenost, `cli-instalace`):** krok `cli-setup` zapisuje nastavení CLI do
  `~/.config/configstore/cli-m365-config.json` v HOME uživatele. U účastníka správně, v labu ale bez `HOME=` přepíše
  globální konfiguraci sdílenou s globálním m365 (PPF). Opakováno s `HOME=~/.m365-e2e`. → Prereq skill: zmínit v
  TEST/lab návodu, že lab testy pouštějí celý skript s vlastním `HOME`.
- **Z2b (artefakt testu, ne skillu):** první login CLI 12 s `HOME=~/.m365-e2e` skončil
  `CachePersistenceError: Verifing persistence failed`. CLI 12 na macOS ukládá tokeny do login keychainu pod
  `$HOME/Library/Keychains`; v izolovaném HOME tam keychain není a fallback na soubor má jen Linux. Skutečný účastník
  s normálním HOME na tuto past **nenarazí**. Symlink na keychain jsme neudělali: všechny instalace v12 sdílejí jednu
  položku keychainu (`cli-microsoft365` / `msal-cache`), login egd10 by přepsal přihlášení v12 ostatních sessions
  (stalo se 23. 11.). Náhrada: globální m365 **v11.11.0** (`/opt/homebrew/lib/node_modules/@pnp/cli-microsoft365/dist/index.js`)
  s `HOME=~/.m365-e2e` (token v souboru pod HOME); skripty skillů dostaly tuto cestu přes `--cli` /
  `PRIPRAVENOST_M365_CLI`. Lokální v12 z `cli-instalace` tak v tomto běhu přihlášení neprošla – to zůstává pro Copilot běh / ⛔.
- **Z3 (podklady):** odkud má účastník v labu **appId** pro `prihlaseni-prikaz`? Skript vypíše `<APP_ID_OD_IT>`;
  v podkladech pro účastníka (výdejní stránka, skill) lab appId `12f19539-…` není. Použil jsem ho z `audit/test-copilot`.
- **Z4 (pravidlo disku vs. skill):** `novy` dělá `npm ci` od nuly (~0,7 GB). Podle CLAUDE.md jsem použil
  `novy --bez-instalace` + APFS klon vzoru `sondy/overeni/node24/prvni-appka/node_modules` (shodný `package-lock.json`)
  + `npm install` („up to date“). Účastník na workshopu poběží `novy` celé; tahle část proto v E2E změřená není.

- **Z5 ✅ vyřešeno 24. 11. (majitel přidal sekci „Když mají hlasovat i ostatní“; v E2E ověřeno kroky 5f–5g):** web účastníka vidí jen on. Spolužák `egd01` dostane na appce egd10
  „You need access“. Skill neříká, jak appku nasdílet (přidat spolužáky jako Návštěvníky/Členy webu, aby mohli hlasovat).
  Sdílení jsem nedělal (zápis mimo zadání). Když mají spolužáci hlasovat navzájem, chybí krok „nasdílej web“ → majitel skillu.
- **Z6 ✅ vyřešeno (štítek; ověřeno krokem 5e; Title = datum zůstává ❓):** ve standardním zobrazení seznamu `MojeAppka` je štítek Hodnocení vysoký ovál
  s číslem nahoře, ne vycentrovaný ([34](dukazy/34-seznam-mojeappka.png)). Title položky = datum (duplicita se sloupcem Den).
- **Z7 (egd-pripravenost, drobnost):** název zkušební položky bere jméno uživatele OS („Zkouska chocholous …“), ne jméno
  účastníka z kroku 0. Na sdíleném PC by to bylo matoucí.
- **Z8 (podklady 08 / prihlaseni.md jsou zastaralé):** `08-ucty-ucastniku.md` ř. 59–60 a `egd-pripravenost/references/prihlaseni.md`
  ř. 16 i SKILL.md (krok 5, „V labu CLI pod účastnickým účtem nejde (AADSTS65001 ✅)“) tvrdí, že CLI pod účastníkem
  v labu nejde. Dnes ✅ (souhlas pro celý tenant od 24. 11.) egd10 prošlo loginem i celou cestou A
  ([12](dukazy/12-pripravenost-kroky5-7.log), [24](dukazy/24-appka-nasadit-over.log)). Hlášeno majitelům.
- **Z9 (egd-prvni-appka, sekce sdílení):** v panelu Site access je **„Send email“ ve výchozím stavu zaškrtnuté**
  ([45](dukazy/45-sdileni-5-vybrano.png)); skill říká „zaškrtni, jen když chce“ → správně „**odškrtni**, pokud nechce posílat
  pozvánku“. Kdo krok proklikne, pošle kolegovi e-mail bez úmyslu. V E2E odškrtnuto, nic neodesláno. UI bylo anglicky
  (jazyk uživatele egd10), skill uvádí české názvy – stojí za doplnění EN v závorce. Hlášeno majiteli.
- **Odhlášení:** vrácení účtu ve výdeji účastníka neodhlásí z M365 ani z CLI (profil `e2e-egd10` a `~/.m365-e2e` jsou
  dál přihlášené jako egd10). Na workshopu jde o sdílené PC jen výjimečně; po workshopu řeší reset hesel.

## Varianty žebříku použité v běhu

| Oblast | Varianta | Pozn. |
|---|---|---|
| Node | 1 – už je (22.23.5 v PATH) | |
| CLI | 1 – npm lokálně (`cli-instalace`, v12.0.0) pro instalaci; přihlášení a zápisy přes 3 – globální m365 v11.11.0 | jen kvůli izolovanému HOME labu (Z2b) |
| Přihlášení | 1 – device code s lab appId | souhlas správce pro tenant od 24. 11. |
| Cesta appky | A – SPFx, nasazení skriptem | doporučená skriptem `cesta` |
| Značka | EG.D (`--znacka egd`) | |

## Neověřeno

- **CLI 12 lokálně + přihlášení pod účastníkem** v tomto běhu neprošlo (izolované HOME, Z2b). Ověřit v Copilot běhu
  s CLI 11 nebo na stroji účastníka s normálním HOME; ⛔ Windows/E.ON jen tam.
- **`novy` s plným `npm ci`** (čas a místo na disku) v E2E neměřen (Z4).
- **Spolužák s rolí Upravit (hlasování)** v E2E neověřen; majitel skillu to ověřil na egd01-dev s tomas.prochazka.
- **GitHub / Copilot licence** v kroku 9b: `gh` pod izolovaným HOME nepřihlášený, licence zapsaná jako „neověřeno“.

## Předáno majitelům (24. 11. 11:33, SendMessage)

| Komu | Nálezy |
|---|---|
| Skill první appka (`local_4be01f58…`) | Z4, Z5, Z6; 11:49 Z9 |
| Prereq skill (`local_8267fb24…`) | Z2, Z2b (pozn.), Z3, Z7, Z8 |
| Správce labu (`local_2c1aae9c…`) | Z3, Z8 (08-ucty), odhlášení |
| Copilot tester (`local_82dab511…`) | druhý běh v Copilotu: brief [copilot/BRIEF.md](copilot/BRIEF.md) (egd09), pustí tester po svém běhu |

## Navazující testy

- [balicek/README.md](balicek/README.md) – test balíčku `dist/egd-skills.zip` z čistého rozbalení (E.ON + open, egd10-prod), 24. 11. 12:21–12:41.
