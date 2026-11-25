---
name: egd-prvni-appka
description: Postav s uživatelem z EG.D první jednoduchou appku na SharePointu nejjednodušší cestou, která v jeho prostředí funguje - SPFx web part „Spokojenost s prostředím kanceláře dnes“ (tlačítka 1–5 a malý vyhodnocovací dashboard) nad SharePoint seznamem, nasazený do katalogu aplikací jeho webu jako celostránková appka (?env=WebView), nebo bez kódu přes seznam s formátováním a Power Apps. Navazuje na egd-pripravenost. Použij, když uživatel řekne „postav mi první appku“, „udělej mi appku na SharePoint“, „nasaď to na můj web“, „spokojenost s kanceláří“, „hlasování 1–5 s dashboardem“, „spusť egd-prvni-appka“ nebo po dokončené kontrole připravenosti.
license: interní pomůcka workshopu EG.D
---

# První appka na SharePointu (workshop EG.D)

Uživatel je **neprogramátor**. Mluv česky, lidsky, krátce: jeden krok, jedna věta o výsledku, další
krok. Výstupy skriptu nepřepisuj do chatu, přelož je („Seznam je založený, teď appku nahraju na web.“).
Cíl: na konci uživatel **sám v prohlížeči** vidí svou appku, klikne na hodnocení 1–5 a jeho hlas
se hned propíše do dashboardu. Stav ověření v labu: `TEST.md` (v repu workshopu).

**Zadání appky** (pro workshop pevné, neměň ho bez uživatele): otázka „Jak jste dnes spokojeni
s prostředím kanceláře?“, pět tlačítek 1–5 (1 = velmi nespokojen/a, 5 = velmi spokojen/a), jeden
hlas na člověka a den (další klik ho změní) a pod tím dashboard: počet hlasů dnes, průměr dnes,
rozložení 1–5 dnes a průměry za posledních 7 dní. Data v seznamu `MojeAppka` na stejném webu (web part se v nabídce jmenuje „Moje první appka“; názvy se
záměrně liší od appky egd-pripravenost, která na stejném webu běží dřív).

Značky: ✅ změřeno v labu (macOS, CLI 11.11) · 📘 dokumentace Microsoftu · ❓ neověřeno (Windows, E.ON).

## Pojistky (platí vždy)

1. **Jen jeden web.** Všechno jde na web, který uživatel řekne (např.
   `https://eonos.sharepoint.com/sites/AILab-Dev-...`), do **katalogu aplikací toho webu**
   (`--appCatalogScope sitecollection --appCatalogUrl <web>`). Nikdy tenant katalog, nikdy
   `--appCatalogScope tenant`, nikdy „zpřístupnit všem webům“. Skript jiný cíl ani neumí.
2. **Zápis až po „ano“.** Příkazy `seznam` a `nasadit` bez `--ano` jen vypíšou plán (kód 10).
   Plán ukaž uživateli, zeptej se „Můžu to zapsat?“ a teprve po jasném „ano“ spusť znovu s `--ano`.
3. **Nic nemaž** (seznam, stránku, appku v katalogu). Když je potřeba něco smazat, řekni uživateli,
   kde to v prohlížeči udělá sám.
4. **Přihlášení dělá člověk** ve svém terminálu (skill `egd-pripravenost`, krok 5). `m365 login`
   nespouštěj, hesla ani kódy nevidíš a nikam nepíšeš.
5. **Bez admina a bez obcházení:** nic globálně (`npm -g`), nevypínej kontrolu certifikátů
   (`strict-ssl false`, `NODE_TLS_REJECT_UNAUTHORIZED=0`), neměň execution policy. Co nejde,
   je věta pro IT, ne obezlička.
6. **Custom Script neřeš.** Web part má `requiresCustomScript: false` a běží i na webu se
   zablokovaným Custom Scriptem ✅ (kontrolní pokus 5.–6. 11. na lab webu `/sites/noscripttest`,
   záznam ve skillu `spfx-ship`, `references/verified.md`; v tomto testu znovu neměřeno). Ten příznak v manifestu nepřepínej.

## Skript

Všechno dělá skript `scripts\appka.mjs` (bez závislostí; celá cesta A chce **Node 22 (22.14+) nebo 24**
kvůli SPFx 1.24 a CLI). **`<A>` = úplná cesta k tomu
souboru**: vezmi složku, ze které jsi načetl tenhle SKILL.md, a připoj `scripts\appka.mjs`
(typicky `%USERPROFILE%\.claude\skills\egd-prvni-appka\scripts\appka.mjs`, u Copilota
`%USERPROFILE%\.copilot\skills\...` nebo `.github\skills\...` v otevřené složce). Ověř, že
soubor existuje; složka skillu může ležet kdekoli, rozhoduje to, odkud jsi SKILL.md četl.

Spouštěj ho **vždy z pracovní složky z `egd-pripravenost`** = složka, ve které je podsložka
`.pripravenost` (obvykle `%USERPROFILE%\egd-workshop`, může se jmenovat jinak). Tam leží výsledek
kontroly a lokálně nainstalované CLI for Microsoft 365, které skript najde sám. Projekt appky
vznikne jako její podsložka `prvni-appka`. **I `build`, `seznam`, `nasadit` a `over` pouštěj z téže
pracovní složky, ne z `prvni-appka`:** `--slozka` se počítá od aktuální složky, takže uvnitř projektu
skript hledá `prvni-appka\prvni-appka` a hlásí „chybi node_modules“.

```
node "<A>" <prikaz> [volby]      # node "<A>" --help vypíše všechno
```

Kódy: 0 hotovo, 1 chyba, 2 špatné použití, 10 plán bez zápisu. Řádky začínají `[OK]`, `[INFO]`,
`[POZOR]`, `[CHYBA]`; u chyby následuje `co dal:` a případně `veta pro IT:`. Výpis skriptu je bez
diakritiky schválně (konzole Windows); uživateli piš normálně česky. S `--ano` skript plán vypíše
znovu a hned za ním zapisuje - to je v pořádku.

**Windows / PowerShell 5.1:** cesty vždy v uvozovkách, jen ASCII uvozovky, nepřesměrovávej `2>&1`,
výstup nečti přes `| Select -First`. `npm`, `npx` ani `m365` přímo nevolej (execution policy,
cizí balíček `m365` na npm) - vše jde přes `node "<A>"`.

## Krok 0: převezmi výsledek kontroly připravenosti

```
node "<A>" cesta
```

Skript přečte `.pripravenost\vysledky.json` a doporučí cestu **A**, **A2** nebo **B**. Když výsledek
chybí, řekni: „Nejdřív prosím spusťme kontrolu připravenosti (skill egd-pripravenost), zabere
pár minut.“ Když uživatel má jen soubor `pripravenost-<jmeno>.md`, přečti z něj řádek
„Nejjednodušší cesta“. Discovery znovu nedělej.

Zeptej se na **adresu webu** (pokud ji kontrola nemá ani ji uživatel neřekl) a **jak se appka
má jmenovat** (nadpis; výchozí „Spokojenost s prostředím kanceláře dnes“; předává se jako `--nadpis` v kroku 4).

**Vždy se zeptej na značku** (i když se zdá jasná, výchozí neexistuje):
„Má appka vypadat jako **E.ON** (červená jen na hlavním tlačítku a vybrané volbě, hranaté rohy,
nadpis písmem E.ON Head), nebo jako **EG.D** (indigo, oblé tvary)?“ Odpověď zapiš do souboru
s výsledkem (`pripravenost-<jmeno>.md`, řádek „Značka appky: E.ON / EG.D“) a předávej ji jako
`--znacka eon|egd` v kroku 1 (a v kroku 3, jestli děláš seznam bez projektu). Bez `--znacka` skript
`novy` skončí s výzvou, ať se zeptáš. U cesty B se značka promítne jen do barev sloupce Hodnocení.

**Vždy se zeptej na režim** (výchozí neexistuje): „Má appku používat **jen vás** (single), nebo
**všichni v organizaci**, kdo dostanou odkaz (open)? V režimu open hlasuje kdokoli z firmy a každý
mění jen svůj hlas; vidí ale i cizí hlasy včetně jmen v seznamu.“ Zapiš řádek „Režim appky:
single / open“ do `pripravenost-<jmeno>.md` a předej `--rezim single|open` v kroku 1. Bez něj `novy`
skončí s výzvou. Přepnout jde kdykoli později (sekce Režim appky).

Co už uživatel řekl, se znovu neptej. Podle cesty pokračuj níže.

## Rozhodovací strom

| Cesta | Kdy | Co uživatel dostane | Co potřebuje od IT |
|---|---|---|---|
| **A** SPFx, nasazení skriptem | npm a Node 22 (22.14+) nebo 24 jdou, CLI je přihlášené, web má **vlastní katalog aplikací** a uživatel na webu roli **Člen** nebo **Vlastník** | vlastní kód v projektu, appka na celé okno `.../SitePages/prvni-appka.aspx?env=WebView`, změny = upravit kód a znovu `build` + `nasadit` | nic navíc (katalog a role už má) |
| **A3** SPFx, zápisy REST z přihlášeného prohlížeče | jako A, CLI se nepřihlásí, ale agent umí spustit JavaScript v přihlášené stránce (Playwright / F12) | totéž co A | postup a ověření jsou ve skillu **egd-pripravenost** (`references/appka.md`, oddíl „Cesta A3“; ✅ tam na jeho appce pod egd05). S touto šablonou (seznam MojeAppka, stránka) neprošlo ❓; když A3 neumíš, jdi na A2 |
| **A2** SPFx, nahrání v prohlížeči | jako A, ale CLI se nepřihlásí (chybí appId, souhlas, blokuje přihlášení) | totéž, jen balíček, seznam a stránku udělá uživatel klikáním podle [references/rucne-v-prohlizeci.md](references/rucne-v-prohlizeci.md) | později appId pro CLI (věta níže) |
| **B** bez kódu | chybí katalog nebo role, npm/Node blokované, nebo nic z A nestihneme | seznam „MojeAppka“ s barevným hodnocením, formulář na hlas a pohled seskupený podle dne; volitelně formulář z Power Apps. Návod [references/bez-kodu.md](references/bez-kodu.md) | jen roli Člen na nějakém webu |

Pravidlo: **když A narazí, nečekej na IT** - pošli větu pro ServiceNow a dokonči první appku cestou
B. Na workshopu je cílem appka dnes, ne ideální technologie.

### Věty pro ServiceNow (doplň `<web>`)

- **Katalog aplikací na webu:** „Prosím o založení katalogu aplikací pro kolekci webů (site collection
  app catalog) na webu <web>. Účel: nasazení SharePoint Framework web partu pro tým, jen na tento
  web, bez nasazení do celého tenantu.“
- **Role na webu:** „Prosím o roli Člen (Member) nebo Vlastník na webu <web>; potřebuji nahrávat
  aplikace do jeho katalogu aplikací a zakládat seznamy a stránky.“
- **Node.js:** „Prosím o instalaci Node.js 24 LTS (případně 22 od verze 22.14; nebo povolení portable verze) -
  SharePoint Framework 1.24 Node 18 nepodporuje.“
- **npm přes proxy:** „Prosím o kořenový certifikát proxy (.cer/.pem) pro npm a Node.js
  (NODE_EXTRA_CA_CERTS), případně o přístup k registry.npmjs.org nebo firemnímu npm mirroru.“
- **appId pro CLI:** věty jsou ve skillu `egd-pripravenost`, `references/prihlaseni.md`.

## Cesta A: krok za krokem

| # | Krok | Příkaz | Kdo |
|---|---|---|---|
| 1 | Projekt ze šablony + značka + balíčky (stovky MB, pár minut) | `node "<A>" novy --slozka prvni-appka --znacka <eon\|egd> --rezim <single\|open>` | agent |
| 2 | Build `.sppkg` | `node "<A>" build --slozka prvni-appka` | agent |
| 3 | Seznam na webu: plán → „ano“ → zápis | `node "<A>" seznam --web <web> --slozka prvni-appka` → `... --ano` | člověk schválí |
| 4 | Nasazení + práva podle režimu: plán → „ano“ → zápis | `node "<A>" nasadit --web <web> --slozka prvni-appka --nadpis "<nadpis>"` → `... --ano` | člověk schválí |
| 5 | Kontrola a ověření v prohlížeči | `node "<A>" over --web <web>`, pak uživatel otevře adresu z výstupu | agent + člověk |

### K jednotlivým krokům

- **Krok 1.** Šablona je hotový SPFx 1.24.1 projekt bez frameworku (čisté TypeScript + SCSS,
  bez Reactu) s `package-lock.json`, takže `npm ci` nainstaluje přesně ověřené verze ✅. Každý projekt
  dostane nové GUIDy, dva účastníci si appky nepřepíšou. `yo` ani generátor nejsou potřeba.
  Spadne-li na Node, certifikátu nebo síti, skript vypíše větu pro IT → cesta B.
  Značka se zapíše do jediného souboru `src\webparts\spokojenost\_znacka.scss` (`$znacka: eon;`
  nebo `$znacka: egd;`); přepnout ji jde i později (znovu `novy --znacka …` nebo ruční změna řádku,
  pak `build` a `nasadit`). Písmo E.ON Head je v šabloně (`assets\EONScreen-Head.woff`), přibalí se
  jen ve variantě E.ON a smí se použít jen pro projekty skupiny E.ON.
- **Krok 2.** Build je Heft (`npm run build`), gulp od SPFx 1.24 neexistuje 📘. Chyby jsou celé
  v `prvni-appka\build.log`. Varování lintu (`Warning:`) nevadí, chyby (`Error`, `TS####`) ano.
- **Krok 3.** Seznam `MojeAppka`: sloupce Hodnocení (číslo 1–5, povinné, formátované jako barevný
  štítek s číslem: E.ON jedna červená škála od nejsvětlejší 1 po nejsytější 5, EG.D semafor; značku
  skript přečte z projektu, bez projektu ji dej jako `--znacka`) a Den (text `RRRR-MM-DD`, podle něj appka sčítá dny). Kdo hlasoval, si SharePoint pamatuje
  sám (Vytvořil). Interní názvy jsou bez diakritiky (`Hodnoceni`, `Den`); appka je čte podle nich.
- **Krok 4.** Skript sám: ověří přihlášení a katalog webu, nahraje balíček (`spo app add
  --appCatalogScope sitecollection --appCatalogUrl <web> --overwrite`), `deploy`, `install`
  (nebo `upgrade`, když appka na webu už je), založí stránku v jediném funkčním pořadí
  **Article → sekce → web part → SingleWebPartAppPage + publish** ✅ a přečte ji zpátky. Hlášku
  „There is no available WebPart with Id“ hned po instalaci čeká a zkouší znovu - je to propagace,
  ne chyba práv (20 s až 1 min ✅ změřeno 5.–6. 11. při stavbě skillu `spfx-ship`; v testech tohoto
  skillu propagace nenastala, čekací smyčka skriptu je proto ❓).
- **Krok 5.** Skript vypíše dvě adresy. Uživateli dej tu s `?env=WebView` (appka na celé okno, bez
  rámu SharePointu ✅). Ověření níže. `rc=0` ani `[OK]` nestačí - hotovo je to, co člověk viděl.

### Ověření v prohlížeči (vždy)

Požádej uživatele, ať otevře `<web>/SitePages/prvni-appka.aspx?env=WebView` a řekne, co vidí:

1. Nadpis, otázku a pět tlačítek 1–5, pod nimi dashboard.
2. Klikne na číslo → zelená zpráva „Zapsáno: N. Díky!“, tlačítko zůstane zvýrazněné, „hlasů dnes“
   a „průměr dnes“ se změní.
3. Klikne na jiné číslo → „Změněno na N.“, počet hlasů dnes se nezvýší (jeden hlas na den).
4. Seznam `<web>/Lists/MojeAppka` ukazuje jeho hlas s dnešním dnem.

Kontrola bez prohlížeče (jen čtení, vždy ji spusť před tím, než uživateli dáš odkaz):

```
node "<A>" over --web <web> --slozka prvni-appka
```

Ukáže appku v katalogu, stránku s web partem a položky seznamu. **Nenahrazuje prohlížeč** - že se
appka vykreslí a odeslání funguje, vidí jen člověk. Když máš nástroje prohlížeče, můžeš stránku
otevřít i sám; když ale prohlížeč chce přihlášení, výběr účtu nebo schválení v Authenticatoru,
**nepřihlašuj se** a nic neschvaluj - ověření nech uživateli. Po jeho hlasu spusť `over`
znovu: hlas s dnešním dnem musí být v seznamu. Červený rámeček v appce s textem chyby
přelož podle tabulky níže.

## Co se v appce dá změnit hned potom (vibecoding)

Kód je v `prvni-appka\src\webparts\spokojenost\SpokojenostWebPart.ts` (logika) a
`SpokojenostWebPart.module.scss` (vzhled; barvy, rohy a písma obou značek jsou v `_znacka.scss`,
všechna pravidla zanořená pod `.appka`). Typické první
úpravy a jejich postup: [references/upravy.md](references/upravy.md). Po každé změně
`build` a `nasadit --ano` (plán ukaž znovu); `nasadit` nahraje novou verzi a udělá `upgrade`.
**Před buildem zvyš verzi** v `config\package-solution.json` (`1.0.0.0` → `1.0.0.1`), jinak web
může dál ukazovat starý kód ❓ (pozorováno u jiné appky: bez `upgrade` zůstala stará verze).

Hlasování není anonymní: seznam ukazuje, kdo hlasoval (Vytvořil), a „jeden hlas na den“ hlídá
appka, ne SharePoint (kdo smí seznam upravovat, přidá položku i přímo). Řekni to uživateli.

## Když se něco pokazí

| Hláška | Co to znamená | Co udělat |
|---|---|---|
| `403` / `Access denied` / `Přístup odepřen` u `spo app add` | uživatel nemá právo zapisovat do katalogu webu: nejčastěji **role na webu**, ne Custom Script (❓ pozorováno 6. 11., měření se nezachovalo; viz chyby.md) | věta „Role na webu“; mezitím cesta B |
| `...sitecollectionappcatalog/ se nedá najít` / `cannot be found`, `Katalog aplikací ... neexistuje` | web nemá vlastní katalog ✅ (hláška je v jazyce webu, `test-dukazy/cli-chyba-rc0.txt` (v repu workshopu)) | Pokud jsi katalog právě založil (do pár minut), počkej 1 min a nasazení zopakuj jednou ✅ (Copilot 24. 11.: po opakování prošlo); teprve když spadne znovu, věta „Katalog aplikací“ a cesta B. |
| `AADSTS65001` | aplikace (appId), přes kterou se CLI hlásí, nemá souhlas správce ✅ (v labu 22. 11. pod egd01, než měla aplikace CLI souhlas pro celý tenant: `lab/dukazy/cli-egd01-65001.log` v repu workshopu; jak chybu rozebrat, skill egd-recon) | věta pro appId (egd-pripravenost); do té doby cesta A2 nebo B |
| `There is no available WebPart with Id` | propagace po instalaci, **ne práva** ✅ | skript čeká sám; když dojdou pokusy, za pár minut `nasadit --ano` znovu |
| `Invalid column 'undefined'` / `Invalid section '1'` | stránka nemá sekci, nebo už je přepnutá na app page ✅ | uživatel stránku smaže v prohlížeči (Obsah webu → Stránky), pak `nasadit --ano` |
| `Unsupported engine`, build hlásí verzi Node, `node-pro-spfx` červeně | Node 18/20 je na SPFx 1.24 starý (engines šablony: 22.14+/24/26 ✅ v `package.json`) | portable Node 24 LTS nebo 22 (22.14+), build ověřen na 24.22.3 i 22.23.5 (zip z nodejs.org do `%USERPROFILE%\node`, na začátek PATH), nebo věta „Node.js“; mezitím B |
| `SELF_SIGNED_CERT_IN_CHAIN`, `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` | firemní proxy přepisuje HTTPS | věta „npm přes proxy“, ne `strict-ssl false` |
| `running scripts is disabled on this system` | PowerShell execution policy | volej jen `node "<A>" ...`; politiku neměň |
| v appce „Seznam ... na tomhle webu není“ | seznam chybí nebo má jiný název | `seznam --web <web>`, nebo v appce Upravit → nastavení web partu → název seznamu |
| v appce „Hlasovat nemůžete: … nemáte právo přidávat položky“ (403) | uživatel je na webu jen Čtenář ✅ (appku a dashboard vidí, hlas odmítne; `test-dukazy/ctenar-ui.log` (v repu workshopu)) | věta „Role na webu“ |
| `{"error": ...}` | chyba CLI (v CLI 11.11 s kódem 1 ✅, `test-dukazy/cli-chyba-rc0.txt` (v repu workshopu); že by šla s kódem 0, jsme neviděli) | skript rozhoduje podle kódu i obsahu výstupu |
| stránka ukazuje starou verzi | nová verze nahraná, ale na webu neaktualizovaná | zvyš verzi, `build`, `nasadit --ano` (dělá `upgrade`), obnov stránku s Ctrl+F5 |

Další podrobnosti a pasti: [references/chyby.md](references/chyby.md).

## Režim appky: single / open

| Režim | Kdo appku otevře a hlasuje | Co se na webu nastaví |
|---|---|---|
| **single** | jen autor (a lidé, se kterými web sdílel jednotlivě, viz níže) | nic, výchozí stav webu |
| **open** | každý v organizaci, kdo má odkaz; každý mění jen svůj hlas | skupina „Všichni kromě externích uživatelů“: **Čtení** na webu, **Přispívání** na seznamu `MojeAppka` (seznam dostane vlastní práva), úpravy jen vlastních položek |

Změřené minimum pro open ✅ (24. 11., egd10-test pod egd10, druhý účet egd01 a tomas.prochazka):
- jen Čtení na webu → appka se otevře, hlas skončí hláškou „Hlasovat nemůžete: na seznamu nemáte právo přidávat položky …“;
- jen Přispívání na seznamu, bez Čtení na webu → stránka „Nemáte přístup“, i když REST na seznam projde;
- obojí → hlas „Zapsáno“, změna „Změněno na …“; cizí hlas upravit ani smazat nejde (REST 403), protože
  seznam má „upravit jen vlastní položky“. Autor (vlastník webu) to nastaví sám, admin role nejsou potřeba.

**Žebřík: zkus odshora, první fungující použij.** Na konci zapiš, kterou variantu jsi použil.

1. **Skript (CLI přihlášené jako vlastník webu)** ✅: plán, ukaž ho uživateli, po „ano“ zápis a čtení zpět.
   ```
   node "<A>" rezim --web <web> --rezim open         # nebo --rezim single; pak totéž s --ano
   ```
   *Funguje?* Poslední řádek `[OK] precteno zpet: rezim open (…)`. Při `nasadit --ano` se režim z projektu
   (`config\appka.json`) nastaví sám. Přepnutí open → single → open ověřeno; single vrací web do
   výchozího stavu a druhý účet dostane „Nemáte přístup“ i REST 403 ✅.
   *Ne?* `Access denied` → uživatel není vlastník webu → 3. Hláška „skupinu … nejde na web přidat“ → 4.
2. **Prohlížeč, bez CLI (vlastník webu)** ✅ (egd01-test pod egd01, česky):
   - web: ⚙ → **Oprávnění k webu** → **Sdílet web** → napiš „Všichni kromě“ → vyber **Všichni kromě
     externích uživatelů** → role **Číst** nech → **Poslat e-mail** odškrtni → **Přidat** (skupina se
     přidá do Návštěvníků webu);
   - seznam: `MojeAppka` → ⚙ → **Nastavení seznamu** → **Oprávnění pro: Seznam** → **Ukončit dědění
     oprávnění** (potvrdit) → **Udělit oprávnění** → „Všichni kromě externích uživatelů“ → **Zobrazit
     možnosti** → **Poslat pozvánku e-mailem** odškrtni → úroveň **Přispívání** → **Sdílet**;
   - tamtéž **Upřesnit nastavení** → Přístup pro vytváření a úpravy: **Vytvořit položky a upravit položky
     vytvořené daným uživatelem** → **OK**.
   Zpět na single: seznam → Oprávnění pro: Seznam → **Odstranit jedinečná oprávnění**; Upřesnit nastavení →
   **Vytvořit a upravit všechny položky**; web → `…/_layouts/15/people.aspx` skupina Návštěvníci →
   zaškrtni „Všichni kromě externích uživatelů“ → **Akce** → **Odebrat uživatele ze skupiny**. Na webu pak
   zůstane „Omezený přístup“: stránka i data jsou zavřené (REST vrátí 0 položek), úplný úklid udělá `rezim single`.
3. **Uživatel není vlastník webu** → vlastník nebo IT: „Prosím nastavte na webu `<web>` skupině Everyone except
   external users roli Read a na seznamu MojeAppka roli Contribute (vlastní oprávnění seznamu,
   WriteSecurity = jen vlastní položky).“
4. ⛔ **Jen v E.ON:** organizace může skupinu „Everyone except external users“ ve výběru lidí skrýt nebo sdílení
   s ní zakázat (nastavení tenantu). V labu je povolená, v E.ON neověřeno. Ověření: na webu účastníka krok 1
   nebo 2; když skupina nejde najít či přidat, náhrada je **sdílení konkrétním lidem nebo skupině** (sekce níže,
   u seznamu místo „Všichni kromě…“ jméno skupiny) nebo žádost na IT o skupinu zabezpečení s hlasujícími.

Jemnější role (zadavatel / schvalovatel, vlastní úrovně oprávnění, kdo smí mazat) řeší skill
**egd-prava-role** (`skills/egd-prava-role/SKILL.md`), sem je nekopíruj.

## Když mají hlasovat i ostatní (nasdílení webu)

Appku vidí jen ten, kdo má přístup k webu; spolužák bez něj dostane „You need access“ /
„Nemáte přístup“ ✅. Vlastník webu (účastník) to udělá sám v prohlížeči ✅ (24. 11., egd01-dev česky,
egd10-dev anglicky v E2E testu, snímky `sondy/e2e/dukazy/41–47` v repu workshopu; popisky v jazyce
uživatele, anglické v závorce):

1. Na webu vpravo nahoře ⚙ **Nastavení** (Settings) → **Oprávnění k webu** (Site permissions) → **Sdílet web** (Share site).
2. Do pole napiš jméno nebo e-mail kolegy a vyber ho ze seznamu.
3. Pod jménem přepni roli z **Číst** (Read) na **Upravit** (Edit) (= skupina Členové). S rolí Číst appku uvidí,
   ale hlas skončí hláškou „Hlasovat nemůžete … Požádejte vlastníka webu o roli Člen“ ✅.
4. **Poslat e-mail** (Send email) je ve výchozím stavu **zaškrtnuté** ✅. Odškrtni ho; zaškrtnuté nech jen, když uživatel
   výslovně řekne, že chce kolegům poslat pozvánku (odeslání e-mailu je jeho rozhodnutí).
5. **Přidat** (Add). Kolega pak otevře adresu s `?env=WebView` a může hlasovat hned (ověřeno bez čekání).

Upravit (skupina Členové) dává i právo měnit stránky a mazat položky seznamu 📘; pro hackathon to stačí, pro ostrý
provoz je čistší vlastní skupina s právem jen přidávat položky (to už je práce pro vlastníka/IT ❓).
Zeptej se uživatele, komu a s jakou rolí sdílet; sdílení je jeho rozhodnutí.

## Na konci

Řekni uživateli třemi větami: kde appka je (adresa s `?env=WebView`), co v ní funguje (hlas 1–5,
dashboard), v jakém je režimu (single / open) a co by šlo dál (jedna úprava z upravy.md, přepnutí režimu nebo nasdílení webu kolegům, viz výše). Pokud něco čeká na IT, zopakuj větu pro
ServiceNow. Zdrojáky zůstávají v `prvni-appka\` v pracovní složce - bez nich appku nezmění.
