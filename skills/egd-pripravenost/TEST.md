# Test skillu egd-pripravenost (jako účastník, 22. 11. 2026)

Tester: session test-pripravenost. Lab `pavelchocholousgmail`, web `…/sites/sitecatalogtest`, macOS, Node 22.23.5 a portable Node 18.20.8, CLI 12.0.0 a 11.11.0. Proti E.ON nic nespuštěno.

**Verdikt (po 2. kole oprav, 22. 11. večer):** skill je k rozeslání použitelný, ale jen pro tyto záruky: **běh ověřen jen na macOS (Node 22 a Node 18) a jen pod správcem labu `pavel.admin`**; pod účastníkem (role Člen) neověřeno, protože CLI pod `egd01` nejde (AADSTS65001). **Windows a PowerShell 5.1 nebyly nikdy spuštěny**, jen přečtena logika (viz `references/windows.md`, ❓ po krocích). Přihlášení a SharePoint E.ON ⛔ jen u E.ON.

Důkazy (uložené výstupy, **finální běh 22. 11. 20:48 po posledním uložení skriptů 20:47**): `test-dukazy/finalni-beh.log` (`github` → `nastroje` → `npm` → `sit` → `varianty` → `cli-instalace` → `prihlaseni` → `sharepoint` → `zkouska` plán a `--ano` → `spfx` → `zprava`), `vysledky.json` a `pripravenost-Finale.md` (stejný běh; 29 unikátních kontrol: 29 zelených, 1 žlutá `vscode-copilot`, 0 červených; v `finalni-beh.log` je „31 ZELENA“, protože `prihlaseni` se tiskne i uvnitř `sharepoint` a `zkouska`), `appka-beh.log` (`appka.mjs` cesta, novy, build, seznam a nasadit plán i `--ano`, over na webu `egd09-dev`, vše rc 0 / 10 u plánů), `node18-beh.log` a `pripravenost-Node18.md` (Node 18: `cli-instalace` a `spfx` správně červené), `spfx-instalovat.out` (`yo` + generátor ✅), `aadsts-700016.out`.

## ✅ Prošlo (změřeno)

- `nastroje`, `npm`, `sit`: správné výsledky na Node 22 i Node 18 (fetch na Node 18 funguje).
- `cli-instalace` (CLI 12.0.0 na Node 22), `prihlaseni` s tenantem labu (`--tenant`), `sharepoint` (web, role Vlastník, seznamy, katalog aplikací, role v katalogu, licence).
- `zkouska` bez `--ano` → plán, kód 10. S `--ano` → seznam `EGD-pripravenost` založen, položka zapsána a přečtena zpět; druhé spuštění seznam znovu použije (idempotentní).
- `spfx` (Node 22 zelená, Node 18 červená s větou pro IT), `prohlizec`, `maska`, `zapis` (odmítne text s „heslo“), `zprava`.
- **Zkušební seznam v labu NEMAZÁN:** `https://pavelchocholousgmail.sharepoint.com/sites/sitecatalogtest/Lists/EGD-pripravenost` (položky 1 a 2, „Zkouska Test …“).

## ❌ Nalezeno a opraveno

1. **Node 18: CLI 11 i 12 nejdou spustit** (`yargs-parser` chce Node 20+). Skript instaloval a hlásil „nejde spustit, zkus `--verze 11`“, což na Node 18 nepomůže. Oprava: `cli-instalace` na Node <20 nic neinstaluje, dá červenou, správný postup (portable Node 22) a větu pro IT. Konstanta `CLI_MIN_NODE_MAJOR`.
2. **Zpráva nevedla ke třem objednávkám z pošty** (Copilot licence, 3 weby, katalog). Doplněn oddíl „Objednávky předem (E.ON ITSM)“ se stavem hotovo / CHYBI / neověřené, v SKILL.md oddíl „Objednávky předem“, README oddíl „Co si objednat předem“, krok 0 se ptá na licenci a weby.
3. **Věta pro chybějící katalog mířila do ServiceNow.** Katalog zakládá ručně Product Team přes sharepoint@eon.com. Věta je teď e-mail tam (konstanta `EON_SHAREPOINT_MAIL`); poznámka o 24h custom scriptu a že pro `requiresCustomScript: false` není potřeba.
4. **Červená licence Copilota nedala žádnou větu pro IT** (věta byla jen v SKILL.md). Zpráva ji teď doplní sama při `copilot-licence` červená.
5. **`sit` hlásil červenou i při nedostupnosti přes firemní proxy**, přestože Node `fetch` proxy nepoužívá. Pro ne‑certifikátové chyby je teď žlutá.
6. **`vscode-copilot` žlutá „rozšíření není“** i když je Copilot ve VS Code vestavěný (na této Macu VS Code 1.146 rozšíření v seznamu není). Text upraven: ověř panel Chat.
7. Doporučení nástroje zmiňuje Copilot CLI vedle Claude Code s poznámkou o licenci; text „bez webu“ odkazuje na Objednávky předem.
8. README: Node „stačí portable“ doplněno o „ne starší než 22“; návod `copilot skill list` ✅ (příkaz existuje v Copilot CLI 1.0.91) a nastavení `chat.useAgentSkills` pro VS Code 📘. `references/windows.md`: postup portable Node 22 bez admina.

## Statická kontrola Windows / PowerShell 5.1 (kód, ne běh)

- `run()`: `.cmd` programy (`git`, `code`, `copilot`, `claude`, `gh`) jdou přes `shell: true` (cmd.exe), `.exe` a absolutní `process.execPath` bez shellu → bez EINVAL. Argumenty u `shell:true` jsou jen fixní bez mezer. ✅ (úsudek z kódu)
- Všechna volání `m365`/`npm` jdou přes `node` a pole argumentů, takže uvozovky a `$select` PowerShell nezkazí. Cesta k `npm-cli.js` u portable Node na Windows je `<node>\node_modules\npm\bin\npm-cli.js` = první kandidát. ✅
- Timeout u `shell:true` zabije jen `cmd.exe`, ne potomka (může zůstat viset `code`); riziko nízké.
- Cesty používají `path`, `prihlaseni-prikaz` vypisuje lomítka, která `node` na Windows přijme.
- Čeština: konzole je záměrně ASCII; zpráva je UTF-8, ale věty pro IT jsou bez diakritiky (viz návrhy).

## ❓ Neověřeno

Windows a PowerShell 5.1 za běhu; CLI 12 nativní doplněk pro tokeny na Windows; appId a device code v E.ON (hlavní riziko); detekce licence Copilota (jen ručně); `/skills reload` v Copilot CLI (interaktivní, nezkoušeno); `chat.useAgentSkills` a `~/.copilot/skills` ve VS Code uživatele; Marketplace a proxy v E.ON; lhůta a podoba založení katalogu Product Teamem.

## Návrhy větších změn (neprovedeno)

- **Věty pro ServiceNow s diakritikou.** Zpráva je UTF-8, ale věty jsou ASCII, což se špatně kopíruje do ticketu. Přepsat řetězce skriptu (konzoli nechat ASCII).
- **Jméno v názvu zkušební položky** bere `os.userInfo().username`; přidat zeptání na jméno z kroku 0 (`--jmeno` už existuje).
- **Zkušební seznam** na webu E.ON zůstane; do zprávy dát odkaz a větu „smaž v Obsahu webu“ (odkaz už se ukládá do stavu, ale ve zprávě chybí).
- Jednou na čisté Windows VM s PS 5.1 a Node 22 projít `nastroje` → `zprava`.

## Dodatek: GitHub (22. 11., po zadání z hlavní session)

- Nový `references/github.md` (jen firemní GitHub EG.D/E.ON, adresa `<GITHUB-ADRESA>` se dosadí; osobní účet jednou větou jako záloha) a krok 9b v SKILL.md, odkaz v README.
- Nový příkaz `node "<S>" github [--host H]` (jen čtení: `gh auth status` + git credential helper, tokeny se nezapisují), oblast „GitHub“ ve zprávě. ✅ Ověřeno na tomto Macu: dva hosty (github.com, ppfas.ghe.com), `--host` s neexistujícím hostem → žlutá.
- ✅ `copilot login --host https://x.ghe.com`, `gh auth login --hostname`, `gh auth setup-git --hostname` (z `--help` nainstalovaných verzí). 📘 VS Code `github-enterprise.uri` + `github.copilot.advanced.authProvider` (docs.github.com). ❓ Git Credential Manager na `*.ghe.com`, požadavek PowerShell 6+ pro Copilot CLI, GitHub konektor Claude pro `*.ghe.com`, popisky menu GitHubu.

## Dodatek: zadání appky a poslední krok (22. 11., večer)

Co přibylo: `ZADANI-appka.md`, `references/appka.md`, `scripts/appka.mjs` (odvozeno ze skriptu skillu `egd-prvni-appka`, který jsem neměnil) a šablona `templates/spokojenost` (SPFx 1.24.1, bez frameworku). Poslední krok je v SKILL.md.

- ✅ Lab, web `egd01-dev`, CLI jako `pavel.admin` (správce kolekce webu): `novy` (npm ci), `build` (0 varování), `seznam --ano` (seznam, 3 sloupce, `DenCislo` a `Klic` indexované, kontrola indexů zelená), `nasadit --ano` (katalog webu, deploy, install, stránka `SingleWebPartAppPage`), druhé `nasadit` po zvýšení verze = `upgrade`, `over`.
- ✅ Unikátní `Klic`: druhý zápis stejného klíče SharePoint odmítl („Tato hodnota již v seznamu existuje“). Dotazy appky (filtr a řazení jen podle `DenCislo`, dotaz podle `Klic`) vrací správně. Při testu vznikla v seznamu jedna zkušební položka (`Title 2026-11-01`, klíč `999|20261101`), nemazáno.
- ✅ Logika appky v simulaci (esbuild + jsdom, falešný SharePoint, 2300 hodnocení za 14 dní): stránkování po 1000, klik na 4 → uloženo a tlačítka zamčená, po znovunačtení zůstane, druhý hlas stejného uživatele hlásí „Dnes jste už hodnotili“, průměr 3,0 a rozložení 20 % × 5 sedí, žádný dotaz podle neindexovaného sloupce. Nalezená chyba: zpráva o duplicitě se po znovunačtení dat ztrácela, a české znění chyby SharePointu nebylo rozpoznáno; opraveno (nasazená verze 1.0.0.1 už je opravená).
- ❓ **Vykreslení a klik v prohlížeči jsem sám neověřil** (panel chtěl přihlášení s Authenticatorem a hesla ani schvalování jsem nezadával), screenshot není. Uživatel (člověk) mi později napsal „appka funguje“; bez screenshotu a bez uvedeného účtu to ber jako ústní potvrzení. Adresa (starší nasazení, jiný GUID než teď): https://pavelchocholousgmail.sharepoint.com/sites/egd01-dev/SitePages/spokojenost.aspx?env=WebView
- ❌ **CLI pod `egd01` nejde** (podle `08-ucty-ucastniku.md` AADSTS65001: lab appka má souhlas jen pro `pavel.admin`). Účastníci v labu tedy projdou cestou A2 (ruční nahrání v prohlížeči, popsané v `references/appka.md`, neměřeno) nebo Pavel dá souhlas pro celou organizaci. Toto je pro pondělí hlavní riziko nasazení.
- ❓ Windows, Node 22 portable na Windows, Copilot (role Copilot tester), Power Automate, E.ON.

## Dodatek: oprava po auditu a žebřík variant (22. 11., noc)

- ✅ Finální běh na finální verzi skriptu uložen (viz výše): 31 zelených, jediná žlutá `vscode-copilot` (VS Code nevypisuje vestavěný Copilot). Zápis `zkouska --ano` opět prošel.
- ✅ Nový příkaz `varianty` (žebřík Node / CLI / přihlášení, jen čtení): na Node 22 doporučí „už je“, na Node 18 „portable archiv“ a pro CLI „bez CLI: prohlížeč“. Test endpointu device code: odpověď AADSTS700016/700038 = endpoint žije.
- ✅ AADSTS700016 vyvoláno v labu (`test-dukazy/aadsts-700016.out`). 65001 ✅ jen z `08-ucty-ucastniku.md` (egd01), 7000218 ❓ nevyvoláno, 53003/50097 ⛔ jen E.ON.
- ❌→opraveno: `npm view` generátoru SPFx jednou po 30 s vypršel (falešná červená), timeout zvýšen na 90 s (`TIMEOUT_VIEW_MS`); následující tři běhy 8–11 s.
- Opraveno v textech: sjednocená věta o Node (22.14+ / 24 / 26), README (PowerShell `$env:USERPROFILE`, `mkdir`, appId neexistuje a Pavel je host, Node 18 změřeno), ✅ u `AllSites.FullControl` změněno na ❓ (nápověda `spo app add` oprávnění neuvádí), ✅ u „brzdou je role“ upřesněno (v labu uspěl vlastník kolekce, nejnižší role neměřena), „Claude licenci z ITSM nepotřebuje“ ❓, ⛔ u tvrzení z mailů E.ON, registrace Authenticatoru v `prihlaseni.md`, per-krok tabulka Windows ❓, varianty nástrojů v README.
- ❓ Role Člen: nikdy nezměřeno (účastnický účet v labu nejde přes CLI). Test v prohlížeči by to ukázal jen pro UI cestu A2.
- ❓ Copilot Free: limity jsou z dokumentace (`09-github-ucastnici.md`), na Free účtu neověřeno.
- ✅ Uživatel potvrdil po nasazení: „appka funguje“ (Spokojenost na `egd01-dev`, ověřeno ručně v prohlížeči; pozn. která role účtu, nezjištěno).

## Dodatek: běh appky po poslední úpravě `appka.mjs` (22. 11. 20:59)

`appka-beh.log` (20:48) je z verze skriptu před úpravou z 20:57:54 (regex rozpoznání webu bez katalogu v `nasadit`). Po ní proběhlo jen čtení, nic se nezapisovalo:

- ✅ `appka.mjs over` na `egd09-dev`: appka nasazena, stránka `SingleWebPartAppPage`, seznam existuje, rc 0: `test-dukazy/appka-over-egd09-dev.out`.
- ✅ `appka.mjs nasadit` bez `--ano` na webu **bez katalogu** (`mcplabdocs`; `m365` tam vrací anglickou hlášku „Cannot find resource … sitecollectionappcatalog“): skript ji rozpoznal, skončil rc 1 s větou pro IT: `test-dukazy/appka-nasadit-web-bez-katalogu.out`. Česká hláška „se nedá najít“ z `egd-prvni-appka` v labu nevznikla, regex ji jen zahrnuje ❓.
- Plán `nasadit` na webu s katalogem (`egd09-test`) skončil rc 10 (jen plán, nic nezapsáno).
- Zápis (`--ano`) se po úpravě znovu nespouštěl; jediná změna ve skriptu je ten regex a přejmenování šablony na `spokojenost-appka` (`novy` po přejmenování nespuštěno ❓).

## Dodatek: vykreslení appky v prohlížeči (22. 11., doplňuje ústní potvrzení)

✅ Test v prohlížeči provedla role skill-prvni-appka na webu `egd-test-vedle-sebe` (obě appky vedle sebe): hlas v naší appce (`spokojenost.aspx`) pod účtem eva.vesela s rolí Člen, zpráva „Děkujeme, vaše hodnocení je uložené.“, 0 chyb konzole; dotazy filtrují jen `DenCislo` a `Klic`. Důkaz: `../egd-prvni-appka/test-dukazy/vedle-sebe-ui.log` (+ snímky ve stejné složce). Platí jen pro lab; na E.ON ⛔.
Hláška o chybějícím katalogu nově radí „zkus to znovu za 5 minut“ (čerstvý web, katalog se může objevit se zpožděním podle TEST.md role prvni-appka), až pak IT. Po této textové změně `appka.mjs` jen `node --check`.

## Dodatek: `novy` + `build` po přejmenování šablony a změně hlášky (22. 11. 21:00)

✅ `appka.mjs novy` a `build` v čisté složce (jen lokálně, nic se nezapisovalo) prošly oba rc 0; vznikl `spokojenost-appka.sppkg` (12 kB) a v `config` ani `package.json` nezůstalo `prvni-appka`. Výstup: `test-dukazy/appka-novy-build-po-prejmenovani.log` (hlavička 21:00:26, `appka.mjs` z 21:00:08, tedy po poslední úpravě). Zápisové příkazy (`seznam`/`nasadit --ano`) se po úpravách textu a názvu znovu nespouštěly.

## Dodatek: cesta A3 a záchranný skill `egd-recon` (23. 11.)

Změny po auditu: v `references/appka.md` nová cesta A3 (REST `_api` z přihlášené stránky v prohlížeči, správná volání se čtou ze zdroje CLI 12), řádek v `references/zebrik.md`, sekce „Záchrana“ v `SKILL.md` a nový skill `../egd-recon` (`scripts/recon.mjs`).

- ✅ **A3** v labu pod `pavel.admin` (`egd09-dev`) i pod `egd05` (Vlastník, `egd05-dev`), nová appka z `novy` + `build` (poslední verze skriptu): seznam + indexy + unikátní `Klic`, upload, Deploy, Install, stránka, `SingleWebPartAppPage`, vykreslení. Důkazy: `../../sondy/rest-varianty/` (`README.md`, `rest-prohlizec-egd05-final.log`, `rest-layout-egd05.log`).
- ✅ **`egd-recon`** pod `pavel.admin`: `egd09-dev` zeleně, `mcplabdocs` (bez katalogu) správně „blokováno“ + věta pro IT: `../egd-recon/test-dukazy/`.
- ❓ Role Člen (uživatel ji vynechal), Windows / PowerShell 5.1, E.ON ⛔, VS Code Agent mode, REST z prohlížeče pod rolí Člen.
- ❓ Copilot test po těchto změnách `SKILL.md`: požádán tester, výsledek zatím není v `TEST-copilot.md`.

## Dodatek: oprava `sit` (23. 11. 10:56) a nový běh nad finální verzí

Chyba (našel auditor v běhu 7 Copilota): `sit` ignoroval `--tenant` a `--web`, měřil vždy E.ON (`egd.cz`, `eonos.sharepoint.com`) a přepisoval `state.tenantId` tenantem E.ON. Oprava v `scripts/pripravenost.mjs`: `sit` bere tenant z `--tenant` (GUID i doména) a SharePoint host z `--host`, `--web` nebo uloženého webu; při zadaném `--tenant` stav nepřepisuje; `--host`, `--web` a `--tenant` jsou v nápovědě `sit`. Bez voleb se chová jako dřív (E.ON).

- ✅ `test-dukazy/sit-tenant-web.out`: `sit --tenant <lab> --web <lab web>` → tenant lab a host `pavelchocholousgmail.sharepoint.com`; `sit` bez voleb → E.ON (`b914a242…`, `eonos`).
- ✅ **Nový celý běh nad finální verzí** (`pripravenost.mjs` z 10:56): `test-dukazy/finalni-beh-2.log` + `pripravenost-Final2.md`: `github`, `nastroje`, `npm`, `sit`, `varianty`, `prihlaseni`, `sharepoint`, `zkouska` (plán rc 10), `spfx`, `zprava`; 24 zelených řádků v logu, žluté jen `github-hosty` (gh nepřihlášen) a `vscode-copilot`, červené žádné. `cli-instalace` se nepouštěl znovu (CLI z dřívějška, `--cli`). Starší `finalni-beh.log` (22. 11.) je z verze před touto opravou `sit`.

**Doplněk 23. 11. 10:58:** `--tenant` se u `sit` nově **ukládá** do stavu (dřívější verze z 10:56 ho nechávala prázdný, takže další příkaz bez `--tenant` spadl na E.ON). ✅ `test-dukazy/sit-tenant-ulozen.out`: po `sit --tenant <lab>` míří `prihlaseni-prikaz` bez `--tenant` na lab. `finalni-beh-2.log` a `pripravenost-Final2.md` jsem po téhle změně spustil znovu (volby `--tenant` jen u `sit`, ostatní příkazy ho berou ze stavu).

## Dodatek: změna pojistek (23. 11., na pokyn uživatele)

Odstraněny pojistky „neobcházej“ a „soubory skillu neupravuj“; pojistka o certifikátech už nezakazuje vypnutí kontroly, ale odkazuje na `references/certifikat.md` (kdy a jak, jen pro stahování balíčků, jen v okně terminálu, nikdy pro přihlášení). Nový oddíl „Prostředí se liší, řeš je sám“ na začátku `SKILL.md`. ✅ Chování `npm` a `node` při samopodepsaném certifikátu (chyba, `--cafile`, `--strict-ssl=false`, `NODE_EXTRA_CA_CERTS`, `NODE_TLS_REJECT_UNAUTHORIZED=0`, `npm_config_strict_ssl`, dědění do podprocesů) změřeno na lokálním HTTPS serveru: `test-dukazy/cert-simulace.out`. ❓ PowerShell zápis proměnných a skutečná proxy E.ON ⛔. Pojistka č. 7 (soubory skillu neupravuj) vznikla podle Copilot testu, odpadá proto i předpoklad „(a)“ v `TEST-copilot.md`, Copilot může skript při chybě opravit.
