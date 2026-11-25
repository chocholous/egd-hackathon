# Chyby a pasti podrobněji

Doplňuje tabulku v SKILL.md. Zdroj měření: lab tenant (Global Admin, macOS, SPFx 1.24.1,
CLI for Microsoft 365 11.x), 5.-6. 11. a 22. 11. 2026.

## 403 / Access denied u `spo app add`

- Pozorováno 6. 11. (odpověď Adrianě): s rolí Čtenář (`High 688 / Low 138612833`) na webu katalogu
  zápis neprošel, po změně na Člena prošel. Měření se nezachovalo, proto ❓. Zopakovat jde pod
  lab účtem s rolí Čtenář: od 24. 11. má aplikace CLI v labu souhlas správce pro celý tenant a běžné
  lab účty se přihlásí ✅ (`sondy/overeni/site-owner/README.md`, bod 6, v repu workshopu). Do té doby
  vracelo CLI pod běžnými účty AADSTS65001.
- 403 dá i aplikace (appId), která nemá oprávnění na SharePoint: Graph s tokenem z `az` (jen scopes
  Entra) vrátil na `/sites/…` HTTP 403 ✅ (`sondy/rest-varianty/az-token.log`, v repu workshopu).
  Že by `E_ACCESSDENIED` vracely i Graph Command Line Tools pod Global Adminem, doložené nemáme ❓
  (Graph PowerShell s týmž appId a scopes `Sites.*` v labu naopak prošel). Rozliš: otevře uživatel `<web>/AppCatalog`
  v prohlížeči a smí tam nahrát soubor? Ano = problém je v appId (věta pro IT z
  `egd-pripravenost`), ne = role na webu.
- Nejnižší potřebnou roli jsme neměřili; dokumentace uvádí pro katalog na webu správce kolekce
  webů 📘. Ve větě pro IT proto „Člen nebo Vlastník“.

## AADSTS kódy při přihlášení

Přihlášení řeší `egd-pripravenost` (krok 5, `references/prihlaseni.md`). Tady jen: `AADSTS65001`
= chybí souhlas správce pro appId; `AADSTS700016` = appId v tenantu není; `AADSTS7000218` =
nejsou povolené public client flows; `AADSTS53003`/`50097` = Conditional Access. Bez CLI se dá
pokračovat cestou A2 nebo B.

## Propagace po instalaci

`There is no available WebPart with Id <id>` přišlo hned po `spo app install`; za 20 s až 1 min
byl web part k dispozici (✅ 5.–6. 11., stavba skillu `spfx-ship`; v testech 22. 11. nenastalo). Skript zkouší 12× po 15 s. Stejně se chová katalog čerstvě založený
přes `spo site appcatalog add`: první minuta „Katalog aplikací ... neexistuje“ ✅ (22. 11.).

## Pořadí stránky

`spo page add` vyrobí prázdný canvas; `clientsidewebpart add` pak spadne na
`Invalid column 'undefined'` a `Invalid section '1'` ✅. Sekci nepřidáš, když je stránka už
`SingleWebPartAppPage`. Jediné funkční pořadí: **Article → sekce → web part → layout + publish**.
Skript to dodržuje; rozbitou stránku smaže uživatel v prohlížeči a `nasadit --ano` ji založí znovu.

## Nová verze a `upgrade`

`app add --overwrite` + `deploy` nestačí, když appka na webu už je: bez `spo app upgrade` může
stránka běžet starým kódem (pozorováno u appky `digi-podnety`; průkazné je `CanUpgrade: false`
spolu s `Deployed: true`) ✅ jinde, ❓ tady. Skript dělá `upgrade` sám, když appku na webu najde.

**Starý kód i po `upgrade`: service worker v prohlížeči** ✅ (24. 11., egd01-dev, třikrát po sobě).
Hned po `nasadit --ano` (upgrade proběhl, katalog hlásí novou verzi) první otevření stránky načetlo
**starý** soubor `spokojenost-web-part_<hash>.js`. Vrátil ho service worker SharePointu z cache
(v síťovém záznamu `200 SW`). Až druhé otevření načetlo nový. Uživatel tak vidí starý vzhled
a myslí si, že změna neprošla. Co dělat:
- Stránku otevři **dvakrát** (nebo Ctrl+F5) a teprve potom hodnoť.
- Kontrola: v nástrojích prohlížeče (F12 → Síť, filtr `web-part_`) musí být stejný hash jako v
  balíčku (`ClientSideAssets/...` v `.sppkg`; na macOS ✅ `unzip -l <balicek>.sppkg`, na Windows ❓ neověřeno).
  Když se hash nezměnil, nezměnil se ani kód (stejný obsah = stejný hash), to není chyba.
- Ve skriptovaném testu nejdřív stránku otevři naprázdno a měř až při druhém načtení
  (`test-dukazy/znacky-test.mjs`).

## Node a SPFx

Používej **Node 22 (22.14+) nebo 24**. Build šablony ověřen na 24.22.3 a 22.23.5 ✅, Node 22.14.0 přesně měřený není ❓.
Poznámka: `engines` v `package.json` šablony (generátor 1.24.1) povoluje `>=22.14 <23`, `24` a `26`; Node 26 jsme nezkoušeli ❓. Node 18, se kterým EG.D stavěla
SPFx 1.18.2 + gulp, už nestačí; gulp od 1.24 není 📘.
Portable Node (zip) jde bez admina - stáhne ho uživatel, agent jen řekne odkud (nodejs.org).

## CLI vrací chybu s kódem 0

Dřívější poznámka (skill `m365-cli-safe`) tvrdila `{"error": "..."}` s `rc=0`. Měření 22. 11. (CLI 11.11, přímo
`node dist/index.js`) dalo u tří chyb `rc=1` ✅ (`test-dukazy/cli-chyba-rc0.txt` (v repu workshopu)).
Skript přesto rozhoduje podle kódu i obsahu. Když agent volá CLI
sám mimo skript, platí totéž - a nikdy ne přes rouru (`| head`), ta návratový kód přepíše.

## `spo web roleassignment add/remove --principalId` nic neudělá

CLI 11.11.0 vypíše úspěch, ale k SharePointu nepošle žádný dotaz (`--debug`: žádné volání API) ✅
(`test-dukazy/rezim/cli-remove-debug.log` (v repu workshopu)). Role webu proto skript nastavuje
přes `m365 request` (REST `roleassignments/addroleassignment`, `getbyprincipalid(...)/deleteobject()`) a po zápisu čte
stav zpět. Když agent mění práva sám, vždy čti zpět; s `--groupName` příkaz funguje (viz skill egd-prava-role).

## Hlášky v jazyce webu

Web s jazykem čeština (LCID 1029) vrací chyby česky ✅ (tamtéž): web bez katalogu `Prostředek pro požadavek
SP.RequestContext.current/web/sitecollectionappcatalog/ se nedá najít.`, čerstvě založený katalog
první minutu `Katalog aplikací s ID ... neexistuje`, chybějící seznam `Seznam X neexistuje na serveru ...`.
Skript hledá české i anglické varianty; když agent hlášku nezná, hledej v ní klíčová slova
(`odepřen` = denied, `neexistuje` = does not exist).

## Windows ❓

Neměřeno. Skript spouští `node` s polem argumentů (bez shellu), takže by mu neměly vadit uvozovky
ani execution policy PowerShellu. JSON pro formátování sloupce předává skript, ne příkazová
řádka. Riziko: dlouhé cesty v `node_modules` pod `C:\Users\<jméno>\...` (limit 260 znaků) -
když `npm ci` spadne na `ENAMETOOLONG`/`EPERM`, dej pracovní složku blíž ke kořeni
(`C:\egd\` nemusí jít bez admina; zkus `%USERPROFILE%\egd`).
