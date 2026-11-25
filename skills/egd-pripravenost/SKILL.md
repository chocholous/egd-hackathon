---
name: egd-pripravenost
description: Kontrola připravenosti počítače na vibecoding workshop EG.D – zjistí, který AI nástroj (GitHub Copilot, Claude) tu funguje, jestli jde npm a Node pro SharePoint Framework, jestli se připojíš k SharePointu (CLI for Microsoft 365) a umíš ho ovládat, vyrobí zprávu pripravenost-<jmeno>.md s větami pro ServiceNow a při zelené připravenosti postaví první appku (Spokojenost s prostředím kanceláře, ZADANI-appka.md). Použij, když uživatel řekne „připrav můj počítač na workshop“, „zkontroluj připravenost“, „připojím se k SharePointu?“, „co mi chybí na středu“, „spusť egd-pripravenost“ nebo „otestuj, jestli tu jde npm / m365 / Copilot“.
license: interní pomůcka workshopu EG.D
---

# Připravenost na workshop EG.D

Uživatel je **neprogramátor** a pouští to sám. Mluv lidsky, česky, krátce. Jeden krok → výsledek →
další krok. Po každém kroku řekni jednou větou, co vyšlo (zelená / žlutá / červená) a co bude dál.
Cíl: na konci existuje soubor `pripravenost-<jmeno>.md`, který uživatel pošle Pavlovi.

Značky: ✅ změřeno v labu (macOS) · 📘 dokumentace · ❓ neověřeno (Windows a PowerShell 5.1 nebyly nikdy spuštěny, jen přečteny) · ⛔ jen E.ON, v labu nejde (zdroj a postup ověření vždy uveden).
Platí jen to, co je u kroku označeno ✅; všechno ostatní ber jako návrh, který agent ověří na místě.

## Prostředí se liší, řeš je sám

Počítač uživatele může být Windows nebo macOS, terminál PowerShell 5.1 / 7, cmd, zsh nebo bash, může tu být nebo chybět `curl`, Chrome,
winget, Git, nebo firemní proxy a omezení IT. **Tenhle skill ani skript neví, co přesně máš před sebou**: příkazy v něm jsou ověřené
jen na macOS a jinde jsou návrh. Než něco spustíš, zjisti, v jakém shellu a systému jsi (`$PSVersionTable`, `uname`, `where`/`which`), a příkaz
přizpůsob (uvozovky, cesty, nastavení proměnných, `;` vs `&&`). Selže-li příkaz, přečti chybu, zkus jinou variantu (žebřík níže) a řekni
uživateli, co jsi změnil. Co se nepodaří vyřešit na počítači, zapiš do zprávy jako červené nebo žluté s větou pro IT.

## Pojistky (platí vždy)

1. **Nic tenant-wide, nic se nemaže.** Zápisy do SharePointu jsou jen krok 7 (jeden zkušební seznam
   `EGD-pripravenost` + jedna položka) a poslední krok „postav appku“ (seznam `SpokojenostHodnoceni` + appka v katalogu webu; plán a „ano“ jako u kroku 7; **přeskoč ho, když uživatel chce místo něj `egd-prvni-appka`**, tam platí její seznam a pojistky), jen na webu, který uživatel sám uvede, a jen po jeho „ano“.
2. **Přihlášení dělá člověk** ve svém terminálu. Agent hesla, kódy ani tokeny nevidí, neopisuje a
   nezapisuje. `m365 login` nikdy nespouštěj sám: kód z přihlášení bys viděl jen ty, ne uživatel.
3. **Žádný admin, nic globálně.** Instaluje se jen lokálně do pracovní složky (`npm install` bez `-g`).
   Nic do `Program Files`, neměň systémová ani bezpečnostní nastavení (ani execution policy).
4. Nic sám neposílej (mail, Teams). Zprávu pošle uživatel.

## Skript

Všechny kontroly dělá `scripts/pripravenost.mjs` ve složce tohoto skillu (Node 18+ pro kontroly; CLI chce Node 20+, SPFx 22.14+; bez závislostí,
Windows i macOS; běh změřen jen na macOS ✅, Windows ❓). Najdi jeho absolutní cestu (složka, ze které jsi načetl tenhle SKILL.md; obvykle
`%USERPROFILE%\.copilot\skills\egd-pripravenost`, `%USERPROFILE%\.claude\skills\egd-pripravenost` nebo
`.github\skills\egd-pripravenost` v otevřené složce) a ověř, že soubor existuje. Dál ji píšu jako `<S>`.

Spouštěj ho **vždy z pracovní složky** (výsledky se sbírají do `.pripravenost\vysledky.json` tamtéž):

```
node "<S>" <příkaz> [volby]        # node "<S>" --help vypíše všechny příkazy
```

Návratové kódy: 0 hotovo, 1 chyba, 2 špatné použití, 10 plán bez zápisu (není chyba).
Řádky výstupu začínají `[ZELENA]`, `[ZLUTA]`, `[CERVENA]` nebo `[INFO]` (konzole je schválně bez
diakritiky kvůli kódování Windows); u problému následuje `co dal:` a případně `veta pro IT:`.
Ty řádky uživateli **přelož do lidské věty**, nevypisuj dumpy.

**Windows a PowerShell 5.1:** cesty v uvozovkách, jen ASCII uvozovky, nepřesměrovávej `2>&1`, výstup
nečti přes `| Select -First`. Detaily: [references/windows.md](references/windows.md).

## Postup

**Žebřík variant (platí pro každý krok, který něco instaluje nebo se připojuje).** Nepředepisuj jednu cestu: spusť
`node "<S>" varianty`, ukáže pro Node, CLI a přihlášení, které varianty tu fungují (od nejjednodušší), a zprávě
zapíše, kterou použiješ. Co dělat, když varianta nefunguje, je v [references/zebrik.md](references/zebrik.md).

| # | Krok | Příkaz | Kdo |
|---|---|---|---|
| 0 | Zeptej se na jméno (do názvu zprávy) a adresu DEV webu (např. `https://eonos.sharepoint.com/sites/<AILab-Dev…>`); když ji neví, pokračuj bez ní. Zeptej se i, jestli už zadal v E.ON ITSM (a) licenci GitHub Copilot, (b) 3 weby DEV/TEST/PROD; odpověď zapiš `zapis` (u licence viz krok 2) a řekni, co ještě objednat (viz níže „Objednávky předem“) | – | člověk |
| 1 | Pracovní složka: navrhni `%USERPROFILE%\egd-workshop`, založ ji, dál pracuj v ní | `mkdir` | agent |
| 2 | Nástroje na počítači | `node "<S>" nastroje` | agent |
| 3 | Síť a npm | `node "<S>" npm`, pak `node "<S>" sit`, pak `node "<S>" varianty` (žebřík variant) | agent |
| 4 | CLI for Microsoft 365 lokálně (jen když `npm-ping` je zelený) | `node "<S>" cli-instalace` (při chybě `--verze 11`) | agent |
| 5 | Přihlášení | `node "<S>" prihlaseni-prikaz --appId <id>` → uživatel spustí vypsaný příkaz ve **svém** terminálu → řekne „hotovo“ → `node "<S>" prihlaseni`. **I když uživatel tvrdí, že už je přihlášen, vždy spusť `prihlaseni` a hned po něm krok 6** (skript ověří, jestli to platí; „nepodařilo se ověřit“ bez spuštění je chyba) | člověk + agent |
| 6 | Ovládání SharePointu (jen čtení) | `node "<S>" sharepoint --web <url>` | agent |
| 7 | Zkušební zápis | `node "<S>" zkouska --web <url> --jmeno <jméno z kroku 0>` vypíše plán (kód 10) → ukaž ho → po „ano“ znovu s `--ano` | člověk schválí |
| 8 | SPFx připravenost | `node "<S>" spfx`; když uživatel souhlasí se stažením stovek MB, `--instalovat` | agent |
| 9 | Záložní cesty v prohlížeči (vždy, když je v krocích 3–6 něco červené; jinak jen Power Apps a licence) | `node "<S>" prohlizec --web <url>` → uživatel otevře adresy → výsledky `node "<S>" zapis …` nebo `node "<S>" maska --high H --low L --zapsat` | člověk + agent |
| 9b | GitHub (firemní přístup a Copilot) | `node "<S>" github` (jen čtení) + návod [references/github.md](references/github.md) | člověk + agent |
| 10 | Zpráva | `node "<S>" zprava --jmeno <jmeno>` → řekni cestu k souboru a shrnutí ve 3 větách | agent |

**Nevynechávej:** krok 9b (GitHub) a krok 10 jsou povinné vždy. Po každé oblasti, kde jsi zkoušel víc variant, zapiš použitou variantu: `node "<S>" zapis --klic varianta-pouzita-<oblast> --stav info --hodnota "<číslo varianty>"`. Krok 4 nepřeskakuj podle toho, že už někde leží `node_modules`; spusť `cli-instalace` a ať skript sám řekne, že je hotovo.

### K jednotlivým krokům

- **Krok 2.** Skript zapíše i to, v čem právě běžíš (`spusteno-z`). U GitHub Copilota ověř licenci:
  ve VS Code ikona Copilota dole musí být přihlášená a bez „no access“ (nebo
  `https://github.com/settings/copilot`); výsledek `node "<S>" zapis --klic copilot-licence --stav zelena|cervena --hodnota "<co uživatel viděl>"`.
  Když je červená, věta pro IT: „Prosím o přidělení licence GitHub Copilot (Business) pro můj účet – workshop vibecodingu EG.D 25. 11.“
- **Krok 3.** `npm-ping` červený = bez npm nepůjde CLI ani SPFx; přeskoč kroky 4–5 a 8 a jdi na krok 9.
  Častá je SSL inspekce (certifikát proxy) – skript ji pozná a dá větu pro IT.
- **Krok 4.** CLI for Microsoft 365 je **npm balíček, ne PowerShell modul**; blokovaná PSGallery ho
  nezastaví (npm instalace lokálně ✅ v labu; že je PSGallery u EG.D blokovaná, je jen zpráva od lektora workshopu ❓). **CLI 11 i 12 chtějí Node 20+ ✅ (na Node 18 spadnou při startu, `--verze 11` nepomůže)**; skript na Node <20 instalaci nespustí a dá větu pro IT. CLI 12 ukládá tokeny přes nativní doplněk; na Windows neověřené ❓ – když instalace
  nebo přihlášení spadne, `cli-instalace --verze 11`. CLI spouštěj jen přes skript
  (`node "<S>" m365 …`), ne `npx m365` (na npm je cizí balíček `m365`) ani `.\node_modules\.bin\m365`
  (PowerShell ho může zablokovat execution policy).
- **Krok 5 – appId.** CLI potřebuje appId registrované aplikace v tenantu E.ON 📘. Možnosti a věty pro
  IT: [references/prihlaseni.md](references/prihlaseni.md). Když uživatel appId nemá, **nezkoušej
  náhodná appId** a nespouštěj `m365 setup` (zakládá registraci aplikace v Entra = zápis do tenantu);
  zapiš červenou s větou pro IT (`zapis --klic appId --stav cervena --hodnota "appId chybí" --it "<věta>"`)
  a pokračuj krokem 9. Čeká-li uživatele po heslu obrazovka „Let's keep your account secure“ (registrace Authenticatoru), postup je v `prihlaseni.md` (oddíl MFA). Nepřihlásí-li se CLI (AADSTS65001 / „Need admin approval“ ✅ v labu do 24. 11., než tenant dostal souhlas správce), pokračuj cestou A3, A2 nebo B v `references/appka.md`.
- **Krok 6.** Vypíše název webu, roli uživatele (odhad z `EffectiveBasePermissions`), seznamy,
  katalog aplikací webu a práva v něm, tenant katalog (jen informace) a licence. Pro první SPFx
  appku je potřeba: web má **vlastní katalog aplikací** a uživatel do něj smí zapisovat (role
  Member/Člen). Brzdou bývá právě role, ne API oprávnění (v labu uspěl vlastník kolekce webu ✅; nejnižší potřebná role není změřená ❓, E.ON ⛔). Custom Script řešit
  nemusí: web part s `requiresCustomScript: false` běží i při zablokovaném Custom Scriptu ✅.
- **Krok 7.** Jediný zápis. Ukaž plán přesně tak, jak ho skript vypsal, a zeptej se „Můžu to zapsat?“
  Bez jasného „ano“ ho přeskoč (`zapis --klic zkouska --stav zluta --hodnota "neschváleno"`).
- **Krok 8.** SPFx 1.24 chce Node **22.14 nebo novější 22, nebo 24, nebo 26** 📘 (nejjednodušší je 22 LTS; všude ve skillu platí tato věta); Node 18 (který EG.D měla) už
  nestačí a gulp nahradil Heft 📘. Portable Node (zip z nodejs.org) jde bez admina – stáhnout ho musí
  uživatel sám, ty jen řekneš odkud. Lokální instalace `yo` + generátoru a jeho spuštění ✅ (macOS, Node 22);
  Windows ❓.
- **Krok 9.** Když CLI nejde, prohlížeč stejně ukáže, jestli SharePoint funguje: adresa
  `<web>/_api/web/EffectiveBasePermissions` vrátí čísla High/Low, která přeloží `maska`. Power Apps /
  Power Automate: jen zjisti, jestli se `make.powerapps.com` a `make.powerautomate.com` otevřou
  s prostředím; nic tam nezakládej.

### GitHub (krok 9b)

Firemní GitHub EG.D/E.ON je hlavní cesta, osobní účet s Copilot Free je jen záloha. Adresu firemního GitHubu **neznáme**: účastník ji zjistí od IT, nebo z přihlášení (github.com s enterprise účtem, nebo vlastní `*.ghe.com`). Spusť `github`, a podle [references/github.md](references/github.md) projdi s uživatelem kroky 1–2 (ověřit firemní přístup a Copilot, jinak ITSM), krok 3 (záloha, když do úterý 24. 11. nic nemá: osobní GitHub účet a **poslat lektorovi jeho login**; bez toho ho nejde pozvat do záložní organizace). Licenci zapiš `zapis --klic copilot-licence …` (krok 2). Přihlášení dělá člověk, agent žádné kódy ani tokeny nevidí.

## Objednávky předem (E.ON, mail Adriány 18. 11. a E.ON 12. 11.)

Účastník má sám zařídit tři věci; zpráva je shrnuje v oddílu „Objednávky předem“. Řekni mu to jednou větou na konci kroku 0 a 10:

1. **Licence GitHub Copilot** (jen když chce pracovat s Copilotem): ITSM „my IT order“, schválení T. Richtera a vedoucího, k žádosti screenshot. Claude licenci z ITSM nepotřebuje ❓ (Claude má vlastní licenci a účet; zda ho E.ON smí používat, není ověřeno).
   ⛔ Celý tento odstavec (ITSM, sharepoint@eon.com, schvalovatelé) je jen E.ON, v labu nejde ověřit; zdroj: mail E.ON 12. 11. a mail Adriány 18. 11. (`zdroje/ppf.md`, sekce 4).
2. **3 weby DEV / TEST / PROD**: ITSM „SharePoint Online | New Site Creation“, ostatní účastníci jako site members.
3. **Site collection app catalog** na webu: **ne přes ITSM**, zakládá ho ručně Product Team E.ON; žádost píše vlastník webu na sharepoint@eon.com, lhůta nejistá ❓ – požádat hned, jak web existuje. Custom script se povoluje jen na 24 h; pro web part s `requiresCustomScript: false` ho nežádat.

Volitelně čtvrtá věc, jen chce-li uživatel CLI: **appId se souhlasem správce** pro CLI for Microsoft 365 (bez něj se běžný uživatel nepřihlásí, viz [prihlaseni.md](references/prihlaseni.md)); věta pro IT se vyrobí sama při `AADSTS65001`, mezitím jede cesta A3 / A2.

Bez katalogu se v E.ON nedá nasazovat (cesta A/A2); zbývá cesta B. Věta pro e-mail se vyrobí sama, když `sharepoint` nenajde katalog.

## Poslední krok: postav appku podle zadání

Toto je **jiná appka než ta ze skillu `egd-prvni-appka`**: slouží jako zkouška připravenosti (nasazení, seznam, indexy, stránka), vlastní seznam a vlastní stránku. Požádá-li uživatel rovnou o `egd-prvni-appka`, tento krok přeskoč. Obě mohou na webu existovat vedle sebe; nenahrazuj jednu druhou a neptej se na značku ani režim, to je věc `egd-prvni-appka`.

Když je připravenost **zelená** (doporučená cesta A nebo A2 ve zprávě), pokračuj hned a **v tomtéž skillu**.
Přečti [ZADANI-appka.md](ZADANI-appka.md) (appka „Spokojenost s prostředím kanceláře dnes“: hodnocení 1–5
jednou za den + dashboard průměr/rozložení/trend), řekni uživateli jednou větou, co postavíš, a dál
postupuj podle [references/appka.md](references/appka.md): `novy` → `build` → `seznam` → `nasadit` →
`over` → uživatel appku otevře a sám hodnotí. Zápisy po jeho „ano“ (pojistka 2). Cesta A2 (CLI nejde)
a cesta B (bez kódu) jsou v tomtéž souboru. Šablona appky je ve `templates\spokojenost`, skript
`scripts\appka.mjs`. ✅ Cesta A prošla v labu pod `pavel.admin` (macOS, CLI 12); pod účtem účastníka (`egd10`) prošel login i zápisy po udělení souhlasu správce pro tenant (24. 11., lab; jen cesta A, pod CLI 11 ✅ podle E2E zprávy, kterou jsem sám neověřoval ❓). Cesta A2 (ručně v prohlížeči) ještě nikdo celá neprošel. Čas na appku proto neslibuj. Názvy seznamů a sloupců zakládej vždy bez diakritiky a bez mezer (viz `references/appka.md`). Limit 5000 položek: nikdy neřaď ani nefiltruj podle sloupce bez indexu.

## Výsledek

Soubor `pripravenost-<jmeno>.md` v pracovní složce: doporučený nástroj na středu, nejjednodušší cesta
k první appce (A: SPFx s CLI, A2: SPFx s ručním nahráním v prohlížeči, B: seznam + formátování bez
kódu), tabulka zelená/žlutá/červená po oblastech a **věty pro ServiceNow** u každé červené/žluté.
Před koncem ho otevři a zkontroluj, že v něm není token ani heslo (skript je neukládá, ale ověř).
Nakonec řekni: „Pošli prosím soubor <cesta> Pavlovi.“

## Záchrana: skill `egd-recon`

Zůstane-li něco červené a není jasné proč (`AADSTS65001`, `403` / Přístup odepřen, web bez katalogu, nejde nahrát balíček),
a je nainstalován skill `egd-recon` (složka vedle této), nabídni ho uživateli jako **druhý krok**. Jen čte a vypíše,
která vrstva blokuje (aplikace v Entra, nebo role na webu) a větu pro IT: `node "<cesta>\egd-recon\scripts\recon.mjs" --web <web>`.
Při `AADSTS65001` se CLI nepřihlásí a recon proto vypíše jen větu pro IT (souhlas správce) a odkaz na cestu A3 / A2. Není-li nainstalovaný, pokračuj podle tabulky níže. Recon ✅ prošel v labu pod správcem (`egd-recon/SKILL.md`), pod účtem Člen a na Windows ❓ ne.

## Když se něco pokazí

| Hláška | Co to znamená | Co udělat |
|---|---|---|
| `running scripts is disabled on this system` | execution policy blokuje `npm.ps1` / `npx.ps1` | volej `node …` (skript to tak dělá) nebo `npm.cmd`; politiku neměň |
| `SELF_SIGNED_CERT_IN_CHAIN`, `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` | firemní proxy přepisuje HTTPS | věta pro IT ve zprávě; kontrolu certifikátů za uživatele nevypínej |
| `E407`, `ETIMEDOUT`, `ENOTFOUND` u npm | proxy / firewall | věta pro IT; dál krok 9 |
| `AADSTS65001`, `AADSTS90094`, `AADSTS90095` | aplikace nemá souhlas správce ✅ 65001 v labu pod účtem egd01; běžný uživatel bez admina dostane „Need admin approval“, protože politika souhlasu tenantu (`microsoft-user-default-low`) nepokrývá `AllSites.FullControl` / `Sites.FullControl.All` ✅ (24. 11.); 90094/90095 📘 | věta pro IT v [prihlaseni.md](references/prihlaseni.md) |
| `AADSTS700016` | appId v tenantu neexistuje ✅ | překlep v appId nebo `--tenant` |
| `AADSTS7000218` | aplikace nemá povolené public client flows (device code) 📘 ❓ v labu nevyvoláno | věta pro IT |
| `AADSTS53003`, `AADSTS50097` | blokuje Conditional Access / chce spravované zařízení ⛔ jen E.ON (v labu CA tohoto typu není), 📘 | zkus `--authType browser`, jinak IT |
| `403` / `Access denied` u webu | role na webu, nebo aplikace bez práv na SharePoint ✅ (lab) | otevři web v prohlížeči: vidíš ho = problém je v aplikaci |
| `{"error": …}` | CLI hlásí chybu jako JSON; návratový kód bývá 1 ✅, starší verze ale uměly rc 0 ❓ | skript rozhoduje podle obsahu i kódu |
| CLI 12: chyba ukládání tokenů | nativní doplněk na Window