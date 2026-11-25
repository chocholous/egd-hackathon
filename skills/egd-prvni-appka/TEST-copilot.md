# Test skillu egd-prvni-appka na GitHub Copilot CLI (22. 11. 2026)

> **Stav 24. 11.:** tento běh z 22. 11. je **historický**. Jeho důkazy byly ve scratchpadu session
> (`cp-prvni-appka`), ten už neexistuje a kopie v repu není. Překrývají ho dva novější testy:
> - [Dodatek níže](#dodatek-skill-po-přepisu-na-dvě-značky-eon-i-egd-24-11-2026): dvě značky, Copilot CLI,
>   **pod pavel.admin** (ne pod účtem účastníka), důkazy v `test-dukazy/copilot-2-znacky/`;
> - **E2E účastníka v Copilotu pod egd09** ze ZIPu (`sondy/e2e/copilot/README.md`, v repu workshopu): EG.D /
>   single na egd09-dev, `over` zelený s 1 hlasem (`dukazy/35-over.txt`), identita egd09 v prohlížeči
>   (`dukazy/50-identita-currentuser.txt`), spolužák egd01 bez přístupu. Audit upozornil, že snímky hlasu
>   `30–32` jsou bajtově shodné se snímky z Claude běhu pod egd10; hlas egd09 dokládá `35-over.txt` a čtení z labu.

Tester: session skill-prvni-appka. Tooling `tools/copilot-run.sh` (session test-copilot), Copilot CLI,
model vybral Copilot sám („MAI Code 2 Flash“), macOS, Node 22.23.5. Lab `pavelchocholousgmail`,
web `/sites/egd-test-prvni-appka`, přihlášení m365 zkopírované z labu (`--m365-from`, pavel.admin).
Proti E.ON nic nespuštěno.

**Závěr jednou větou:** Copilot skill najde a celou cestu A projde sám (cesta → novy → build →
seznam plán/ano → nasadit plán/ano → over) a soubory skillu neupravuje; zbývá ověřit appku, kterou
nasadil, v prohlížeči (čeká na volné místo na disku) ❓.

## Jak se testovalo

Izolovaný „počítač účastníka“ (`--sandbox` ve scratchpadu session), v pracovní složce
`.pripravenost/vysledky.json` ze skutečného běhu egd-pripravenost (`skills/egd-pripravenost/test-dukazy/vysledky.json`,
web přepsaný na testovací) a `node_modules/@pnp/cli-microsoft365` (odkaz na CLI 11.11, jako po
kroku `cli-instalace` v egd-pripravenost). Zadání účastníka (vše předem, na dotazy nejde odpovědět):

> Postav mi první appku na můj web https://pavelchocholousgmail.sharepoint.com/sites/egd-test-prvni-appka .
> Kontrolu připravenosti (egd-pripravenost) jsem už udělal, výsledek je v téhle složce. Zápis na tento
> jeden web předem schvaluji: plán mi ukaž a pak rovnou pokračuj (ano). Na jiný web nic nezapisuj. […]

Běh: 5 min 24 s, návratový kód 0, „Changes +0 -0“, 1,19 AI Credits.

## ✅ Prošlo (změřeno, log běhu)

| Co | Výsledek |
|---|---|
| skill vidí a načte | `copilot skill list` ho ukázal (instalace do `~/.copilot/skills`), na první větu zavolal `skill(egd-prvni-appka)` |
| převzetí výsledku egd-pripravenost | našel `.pripravenost/vysledky.json`, spustil `cesta` → cesta A |
| `novy` (npm ci, 1 min 49 s), `build` (12 s) | rc 0 |
| `seznam` plán (rc 10, „Failed with exit code 10“) → pochopil jako plán → `--ano` | rc 0; seznam už existoval, doplnil formátování |
| `nasadit` plán → `--ano` | rc 0 (1 min 5 s), stránka `prvni-appka.aspx` |
| `over` (jen čtení) | rc 0 |
| zapisoval jen na zadaný web, nic tenant-wide | ✅ (plán i příkazy jen s `--web` testovacího webu) |
| soubory skillu neupravoval | ✅ „Changes +0 -0“ |
| na konci dal odkaz `…/SitePages/prvni-appka.aspx?env=WebView` a poslal uživatele kliknout | ✅ |

## ❌ / ❓ Nalezeno

1. **Nápověda skriptu ukazovala starou stránku** `[--stranka spokojenost]` (po přejmenování na
   `prvni-appka.aspx`). Copilot ji četl (`--help`). Opraveno v `scripts/appka.mjs`.
2. **Copilot jednou zkomolil cestu ke skriptu** (`…8d3c6e51-bb-v4e00…`, MODULE_NOT_FOUND), sám si
   všiml a opravil. Chyba modelu, ne skillu; SKILL.md říká `<A>` = úplná cesta, nic dalšího s tím
   neuděláme.
3. **Tvrzení „funguje tam hlasování“ bez prohlížeče.** V závěru Copilot napsal, že hlasování funguje,
   ačkoli otevřít stránku nemohl; zároveň ale uživatele poslal ji otevřít a kliknout. SKILL.md
   („Hotovo je až to, co uživatel uvidí v prohlížeči“) to zakazuje; ❓ zda zpřísnit formulaci.
4. Argument `--web` je v logu zobrazen s escape sekvencemi odkazu terminálu (OSC 8); skript dostal
   správnou adresu (plán i zápis proběhly na správném webu) - jen zobrazení logu.
5. **Ověření nasazené appky v prohlížeči ❓** - neprovedeno: disk Macu je plný (ENOSPC) a hlavní
   session zakázala do odvolání spouštět buildy a pracovat s profily. Po uvolnění:
   `node test-dukazy/ui-test.mjs "<web>/SitePages/prvni-appka.aspx?env=WebView" <složka> eva.vesela:4`.

## Rozdíly Copilot vs Claude

| Oblast | Claude (TEST.md) | Copilot CLI |
|---|---|---|
| plán (rc 10) | chápe jako plán | hlásí „Failed with exit code 10“, ale pochopí jako plán |
| čtení zdroje skriptu | ne | četl prvních 40 řádků `appka.mjs` a `--help` (neupravoval) |
| doba | podobná (dominuje `npm ci`) | 5 min 24 s celkem |

## Neověřeno

| Co | Proč | Jak ověřit |
|---|---|---|
| appka nasazená Copilotem v prohlížeči | plný disk | `ui-test.mjs` výše |
| Copilot bez přihlášení m365 (device code dělá člověk) | nespuštěno | `copilot-run.sh` bez `--m365-from` |
| Copilot ve VS Code (agent mode), Windows | jen Copilot CLI na macOS | VS Code + Windows VM |
| cesty A2 / B v Copilotu | nespuštěno | zadání bez katalogu / bez Node |

Důkazy byly ve scratchpadu session (`…/scratchpad/cp-prvni-appka/vystup/log.txt`, `prepis.md`, `usage.json`);
ten už neexistuje a kopie v repu není. Tvrzení tohoto oddílu proto ber jako historická, viz stav nahoře.

---

# Dodatek: skill po přepisu na dvě značky, E.ON i EG.D (24. 11. 2026)

Tester: session test-copilot. Skill ve stavu pracovního stromu po commitech ad402b8 a 2a1d998 (zmrazená kopie bez
`test-dukazy`), Copilot CLI 1.0.114 (model vybral Copilot sám, „GPT-6 Luna“), macOS, Node 22.23.5, izolovaný „počítač
účastníka“ (`tools/copilot-run.sh --sandbox`), CLI m365 v11 přes odkaz v `node_modules`, přihlášení zkopírované z labu
(pavel.admin). Dva vlastní weby s katalogem: `/sites/egd-test-cp-eon` a `/sites/egd-test-cp-egd`. Proti E.ON nic nespuštěno.
Zadání: [prompt1-eon-b.txt](test-dukazy/copilot-2-znacky/prompt1-eon-b.txt), [prompt1-egd.txt](test-dukazy/copilot-2-znacky/prompt1-egd.txt)
(web, „testovací lab“, „ptej se, odpovím v dalším kroku“, zápis na tento web předem schválen; **značka v zadání není**). Odpověď
na dotaz přes `--continue`: [prompt2-eon.txt](test-dukazy/copilot-2-znacky/prompt2-eon.txt), [prompt2-egd.txt](test-dukazy/copilot-2-znacky/prompt2-egd.txt).

**Závěr:** ✅ Copilot se na značku u obou běhů zeptal, nic nezapsal a `novy` bez `--znacka` neprošlo. Po odpovědi E.ON i EG.D
postavil, nasadil a `over` je zelený na obou webech. ❓ Vykreslení a hlas v prohlížeči neověřeny (viz Neověřeno).

## ✅ Změřeno

| Co | E.ON (`egd-test-cp-eon`) | EG.D (`egd-test-cp-egd`) | Důkaz |
|---|---|---|---|
| **Fáze 1: zeptal se na značku?** | ✅ „E.ON (červená, hranaté tvary) nebo EG.D (indigo, oblé tvary)?“, rc 0, žádný zápis (`Changes +0 -0`) | ✅ totéž; před dotazem pustil jen `cesta` | `eon/log.txt`, `egd/log.txt` |
| `novy` bez `--znacka` | Copilot ho nepustil (zeptal se dřív); rc 2 jsem ověřil sám na zmrazené kopii skillu | totéž (jeho „exit code 2“ v logu je `--help`, ne `novy`) | tabulka níže, nález 7 |
| Po odpovědi `novy … --znacka <x> --slozka prvni-appka` | ✅ 30 s (`npm ci`) | ✅ 40 s | `fáze2/log.txt` |
| Značka v projektu | ✅ `$znacka: eon;` | ✅ `$znacka: egd;` | `eon/_znacka.scss`, `egd/_znacka.scss` |
| Balíček podle značky | ✅ `.sppkg` 62 943 B, obsahuje `EONScreen-Head….woff`, `border-radius:0` | ✅ `.sppkg` 12 166 B, bez písma, `border-radius:28px` | `unzip -l` sppkg v sandboxu |
| `--znacka`/`--slozka` v kroku `seznam` (plán → ano) | ✅ rc 10 → `--ano` | ✅ rc 10 → `--ano` | log |
| Barvy sloupce Hodnocení (REST `spo field get`, `CustomFormatter`) | ✅ červená škála `#F6E5DC … #EA1B0A`, `border-radius:0` | ✅ semafor `#DDF4E4 / #FBE1E0 / #F0F1F5`, `border-radius:12px` | čtení zpět z labu |
| `nasadit` plán → `--ano`, `over` | ✅ (po opakování, viz níže) | ✅ napoprvé, 47 s | `over` mnou znovu: katalog `nasazeno true`, `SingleWebPartAppPage`, web part je na stránce, seznam `MojeAppka` |
| Zápis jen na zadaný web, nic tenant-wide | ✅ | ✅ | příkazy v logu |
| Soubory skillu neupravil | ✅ `diff -rq` zmrazená kopie × instalace shodné | ✅ | |
| Závěr uživateli: adresa s `?env=WebView`, ať otevře a klikne, hlasování není anonymní | ✅ | ✅ (+ nabídl úpravu z `upravy.md`) | konec logu |
| Čas, kredity | 2 běhy + opakování, 1,17 + 1,66 AI Credits | 0,46 + 1,57 AI Credits | `usage.json` |

## ❌ / ⚠️ Nalezeno

1. **Zadání s nápovědou k značce se bere jako odpověď (nečistý běh).** Můj první E.ON prompt měl „Je to lab, ne E.ON“.
   Copilot dotaz na značku přeskočil, vyvodil EG.D a rovnou pustil `novy --znacka egd` na E.ON web. Běh jsem zastavil
   (nic nezapsáno na SharePoint, jen lokální projekt, [log](test-dukazy/copilot-2-znacky/eon/nečistý-běh-log.txt)).
   Pro skill: pojistka „vždy se zeptej“ drží, jen když uživatel značku nezmíní ani nepřímo. Doporučení: do SKILL.md
   ke kroku 0 „věta typu ‚ne E.ON‘ není odpověď, vyvozená značka se potvrdí otázkou“ ❓ (stojí za zvážení, ne chyba).
2. **Čerstvě založený katalog: `deploy` selhal „…/sitecollectionappcatalog/ se nedá najít“** (E.ON web, hned po
   založení katalogu `spo site appcatalog add`). Přesně případ z tabulky „Když se něco pokazí“. Copilot ho vyložil
   po skillu jako „web nemá katalog“, zastavil nasazení, nabídl cestu B (seznam bez kódu) a větu pro IT. **Neví, že jde
   o propagaci**: tabulka říká „čerstvě založený katalog se může minutu nenajít“, ale rozhodl se pro B. Po mém „katalog už
   existuje, zkus znovu“ (`--continue`) nasazení za 57 s prošlo. Doporučení ❓: u této hlášky nejdřív jedno opakování
   po minutě a teprve potom věta pro IT (účastník dostane katalog od lektora/IT právě takhle čerstvý).
3. **EG.D běh: `Changes +1 -0`.** Copilot jeden soubor přidal; v sandboxu přibyl jen projekt `prvni-appka` (což je
   `novy`), soubory skillu shodné. Beru za očekávané.
4. **První pokus o fázi 2 u EG.D selhal v mém toolingu** (`copilot-skill-install.sh` při opakovaném spuštění nad
   obsazenou složkou skillu: `trash … fBsyErr`, Copilot se nespustil). Opakováno bez `--skill`. K opravě tooling:
   při `--continue` neinstalovat skill znovu.
5. `--web` je v logu s OSC 8 escape sekvencemi (zobrazení, skript dostal správnou adresu), jako v prvním testu.
6. `over` z jiné složky než pracovní hlásí „v katalogu webu appka neni“ (hledá `prvni-appka\prvni-appka`); stejná
   past, kterou SKILL.md popisuje. Copilot ji nedělal.

7. **Testovaná verze je starší než aktuální skill.** Zmrazená kopie byla bez povinného `--rezim`; pracovní strom hlavní session
   ho mezitím vyžaduje (`novy` bez něj končí rc 2 „chybi --rezim“, dotaz single/open). Dotaz na režim (a sdílení) tímto testem
   **není pokryt**; kryje ho E2E v Copilotu pod egd09 ze ZIPu.

## Neověřeno

| Co | Proč | Jak ověřit |
|---|---|---|
| Vykreslení appky E.ON (červené tlačítko, písmo E.ON Head) v prohlížeči po běhu Copilota, klik na hlas | prohlížečové profily s právem na tyto dva weby nejsou přihlášené (pavel.admin 403), přihlášení dělá jen Pavel. EG.D po běhu Copilota ✅ v E2E pod egd09 (viz stav nahoře) | `skills/egd-prvni-appka/test-dukazy/ui-test.mjs "<web>/SitePages/prvni-appka.aspx?env=WebView" <složka> <účet>:4` po přihlášení profilu |
| Chování, když Copilot na dotaz odpoví „nevím“ / neodpoví na značku | v `-p` se odpovídá jen v dalším běhu | `--continue` s odpovědí „je mi to jedno“ |
| Windows / PowerShell, VS Code agent mode | jen Copilot CLI na macOS | VS Code + Windows VM |
| Cesty A2 / B v Copilotu | nespuštěno | zadání bez katalogu / bez Node |

Důkazy: [test-dukazy/copilot-2-znacky/](test-dukazy/copilot-2-znacky/) (`eon/`, `egd/`: log, přepis, usage obou fází,
`_znacka.scss`). Sandboxy ve scratchpadu session. `node_modules` obou sandboxů: `npm ci` od nuly (testuje `novy`),
poté `tools/apfs-dedupe.py` proti `sondy/overeni/node24/prvni-appka/node_modules`.
