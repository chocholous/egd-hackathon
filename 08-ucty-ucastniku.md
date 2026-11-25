# Lab účty účastníků (egd01–egd10)

Stav 2026-11-22, session lab-ucty. Značky: ✅ změřeno, 📘 dokumentace, ❓ neověřeno.
Hesla a výdejní kódy jsou jen v `lab/ucastnici.secrets.json` (práva 0600). Projekt je od 23. 11. privátní git
repozitář, ale tyto soubory do něj nejdou: `.gitignore` vylučuje `*.secrets.json` a `*.secrets/`
(✅ `git check-ignore`, 24. 11.; v gitu sledovaných souborů s `secrets` v cestě: 0). V tomto souboru nejsou.
Důkazy (výstupy bez tajných údajů) jsou v [lab/dukazy/](lab/dukazy/).

## Co v labu je

| Co | Stav |
|---|---|
| 10 účtů `egd01@pavelchocholousgmail.onmicrosoft.com` … `egd10@…`, jméno „Účastník 01“ … | ✅ založeno, bez admin rolí, usageLocation CZ |
| Skupina „EGD workshop účastníci“ (bezpečnostní, 10 členů) | ✅ id ve secrets (`skupinaId`) |
| Licence | ✅ **Business Standard EEA (no Teams)** (`Microsoft_365_Business_Standard_EEA_(no_Teams)`, 25 licencí) má všech 10 účtů od 24. 11. ([stav-po-prideleni.txt](lab/dukazy/licence-bstd/stav-po-prideleni.txt)). Na egd09 jsou SHAREPOINTSTANDARD, EXCHANGE_S_STANDARD a FLOW_O365_P1 ve stavu Success ([egd09-licenseDetails.json](lab/dukazy/licence-bstd/egd09-licenseDetails.json)). Přidělila ho hlavní session na Pavlovo ano. Business Basic se tím nahrazuje. **Vedle SPE_E5 jde licence přidělit jen s vypnutým plánem OFFICE_BUSINESS.** Bez toho Graph vrátí 400 „service plans … are mutually exclusive“, protože se plán kříží s OFFICESUBSCRIPTION z E5. Proto má skript volbu `--vypnout-plan PLAN`. Na egd09 je E5 už odebraná (`--jen-odebrat SPE_E5 --ucty 09`) a pod samotnou Business Standard EEA prošel `tools/lab-ucty-overeni.mjs` ✅: přihlášení, nahrání i nasazení .sppkg 200, cizí web 403, zápis na vlastní DEV/TEST/PROD ([egd09-overeni.log](lab/dukazy/licence-bstd/egd09-overeni.log)). Ostatních 9 účtů má zatím obě licence. E5 (trial do 25. 11. 04:04) se jim odebere po jeho konci, nebo u některých zůstane, podle Pavla. Po odebrání E5 jde OFFICE_BUSINESS zapnout zpět; desktopové Office na workshop potřeba nejsou. Skript předem porovná volná místa s počtem potřeba a při nedostatku skončí bez jediné změny ✅ (23. 11.) |
| SharePoint v licencích | ✅ SPE_E5 (SHAREPOINTENTERPRISE), BP+Copilot a Business Standard EEA (SHAREPOINTSTANDARD), viz [subscribedSkus-sharepoint.json](lab/dukazy/subscribedSkus-sharepoint.json) a [egd09-licenseDetails.json](lab/dukazy/licence-bstd/egd09-licenseDetails.json). Že site app catalog funguje i se SHAREPOINTSTANDARD bez E5, je ověřené na egd09 (viz řádek Licence) |
| 30 webů `/sites/egdNN-dev`, `-test`, `-prod` | ✅ komunikační web, šablona Blank, čeština, title „Účastník NN – DEV“ |
| Site collection app catalog na všech 30 | ✅ (`m365 spo site appcatalog list`) |
| Účastník = primární správce kolekce + člen skupiny Vlastníci | ✅ `tools/lab-ucty-weby.py --kontrola`: 30/30 OK ([weby-kontrola.log](lab/dukazy/weby-kontrola.log)) |
| `pavel.admin` = sekundární správce kolekce | ✅ |
| Skupiny Návštěvníci a Členové na webech prázdné, web se s nikým dalším nesdílí | ✅ kontrolou skupin i pod účastníkem (viz Ověření) |
| Výdejní web appka (hlavní cesta) | ✅ https://witty-pond-0f3afad0f.4.azurestaticapps.net — společné heslo, „Beru tenhle“, rezervace ([viz níže](#výdejní-web-appka-hlavní-cesta)) |
| Výdejní stránka (záloha A) | ✅ https://claude.ai/artifact/A1rabZHmzw2xYZ3iEcrvb7 (soukromá; sdílení viz níže) |

**Proč komunikační web:** nemá M365 skupinu, Teams ani poštovní schránku. Vlastnictví je tak čistě
v SharePointu, nic se nesdílí s „Everyone“ a pro SPFx je to stejné jako týmový web. EG.D AILab-Dev/Test/Prod
mají site app catalog, tady je to stejně.

## Rozhodnutí

- **Povinná změna hesla při prvním přihlášení: ne.** Heslo je náhodné (20 znaků) a účastník ho dostane
  z výdejní stránky. Po vynucené změně by stránka ukazovala neplatné heslo a kdo nové zapomene, potřebuje
  ve 13:00 reset od Pavla. Přihlášení se navíc opakuje (prohlížeč, `m365 login`, Workbench). Riziko
  pokrývá skupina webů jen pro účastníka a zablokování účtů hned po workshopu.
- **MFA (CA):** skupina „EGD workshop účastníci“ je vyjmutá z CA politiky „LAB baseline: MFA all users“
  (Pavel 2026-11-22: „Ano, vyjmout“). ✅ Změnilo se jen `excludeGroups` (diff politiky před a po: [ca-mfa-vyjimka-diff.log](lab/dukazy/ca-mfa-vyjimka-diff.log)), jednotlivé
  výjimky zůstaly. Vrací to `tools/lab-ucty-mfa.py --vratit`, které volá i `lab-ucty-uklid.py`. Politika
  „block legacy auth“ platí dál.
- ✅ **Registrace Authenticatoru: po vyjmutí z registrační kampaně se neobjevuje.** Pavel (hlavní session,
  22. 11. večer) vyjmul skupinu účastníků z Entra → Authentication methods → Registration campaign (Exclude
  1 Group). Výjimka v ID Protection (MFA registration policy) ověřená není. Potom ✅ 19:47–19:53 UTC: egd01–egd10,
  každý účet 2× paralelně a 4 účty ještě 2× postupně, celkem 28 pokusů. Obrazovka „More information required“
  ani „keep your account secure“ se neobjevila ani jednou, všech 10 účtů se přihlásilo
  ([prihlaseni-egd01-10-po-kampani.log](lab/dukazy/prihlaseni-egd01-10-po-kampani.log)). 6 paralelních
  pokusů skončilo na stránce zadání e-mailu: skript nestihl stránku pod zátěží, při opakování postupně prošly 8/8.
  U 8 z 10 účtů to bylo první přihlášení vůbec, kdy se registrace vynucuje nejspíš. Příčinou byla nejspíš
  kampaň; je to ale jen nepřímý důkaz a ID Protection vyloučit nejde.
  Historie: před výjimkou i s výjimkou z CA skončilo v prvním
  běhu (ručně, log se neuložil, proto bez důkazu) 3 ze 6 přihlášení `egd01` po úspěšném ověření hesla na obrazovce „Let's keep your account secure“. Odtud
  vede na `mysignins.microsoft.com/register` („Install Microsoft Authenticator“) a přeskočit to nejde,
  přímý odkaz na web vrátí na stejnou obrazovku. V záznamu přihlášení je CA „success“, jde tedy
  o registrační nastavení mimo CA. Nastavení z `az` ani m365 nepřečtu (403, chybí Policy.Read). **Pavel
  zkontroluje v Entra admin centru** a skupinu účastníků vyjme:
  1. Protection → Authentication methods → **Registration campaign** (stav, cíloví uživatelé, snooze),
  2. ID Protection → **Multifactor authentication registration policy**.
  Nouzově si účastník zaregistruje jakoukoli TOTP aplikaci přes „Set up a different authentication app“.
  ✅ Druhý běh (19:15–19:20 UTC, skriptem 6× za sebou) prošel 6/6 bez obrazovky
  ([prihlaseni-egd01-6x.log](lab/dukazy/prihlaseni-egd01-6x.log)). Výzva tedy přichází občas, ne vždy;
  příčinu to nevysvětluje, proto zůstává v Neověřeno.
- ✅ **m365 CLI pod účastníkem jde (stav 24. 11.):** lab appka `m365-cli-spfx-lab` (`12f19539-…`) má
  admin consent pro celou organizaci (Graph `oauth2PermissionGrants`: `consentType=AllPrincipals`,
  `AllSites.FullControl` a `Sites.FullControl.All`, čteno 24. 11.). E2E test pod `egd10` prošel
  přihlášením i `spo app add/deploy/install` na vlastní DEV web
  ([12-pripravenost-kroky5-7.log](sondy/e2e/dukazy/12-pripravenost-kroky5-7.log),
  [24-appka-nasadit-over.log](sondy/e2e/dukazy/24-appka-nasadit-over.log)).
  Historie: 22. 11. měla appka consent jen pro `pavel.admin` a `egd01` dostal AADSTS65001
  ([cli-egd01-65001.log](lab/dukazy/cli-egd01-65001.log)). Kdo a kdy consent udělil, z labu nevyčtu.
  Pro E.ON to znamená požadavek na admin consent (viz varianta 2).
  Účastník appId, tenant a hotový příkaz `m365 login` vidí na výdejní stránce po rezervaci (24. 11., viz níže).

## Varianty nasazení .sppkg pod účastníkem

| # | Varianta | Stav v labu | Pro | Proti | Co chce od IT E.ON | Náročnost pro citizen developera |
|---|---|---|---|---|---|---|
| 1 | **UI app catalogu webu:** `<DEV web>/AppCatalog` → Nahrát → soubor → OK → v dialogu „Důvěřujete aplikaci…“ Nasadit | ✅ `egd05`, 2026-11-22 19:25 UTC, `tools/lab-ucty-ui-nasazeni.mjs`, balíček `eon-demo-statistiky.sppkg`: nahráno, `Deployed: true`, verze 1.0.0.14 ([log](lab/dukazy/ui-egd05.log), screenshoty [katalog](lab/dukazy/ui-egd05-1-katalog.png), [Nahrát](lab/dukazy/ui-egd05-2-nahrat-menu.png), [důvěra](lab/dukazy/ui-egd05-3-duvera.png), [po nasazení](lab/dukazy/ui-egd05-4-po-nasazeni.png)). První pokus se zasekl na přihlašovací obrazovce, druhý prošel | nic neinstaluje, žádný consent, funguje hned | ruční kliky po každém buildu; agent to zvládne jen přes skriptovaný prohlížeč (`tools/lab-ucty-ui-nasazeni.mjs`) s uloženým heslem | jen site app catalog na webu a roli vlastníka (EG.D AILab-* to mají podle zadání ❓ ověřit v E.ON) | nízká |
| 2 | **m365 CLI s admin consentem** pro appku (`m365 spo app add/deploy --appCatalogScope sitecollection`) | ✅ pod účastníkem `egd10` 24. 11. (E2E: login, `spo app add/deploy/install`, [24-appka-nasadit-over.log](sondy/e2e/dukazy/24-appka-nasadit-over.log)), od chvíle, kdy má appka consent pro celou organizaci. ✅ Dříve pod `pavel.admin` (appka má jeho consent) `m365 spo app add` + `deploy` do `/sites/egd01-dev` prošlo, `Deployed: true` ([cli-pavel-admin-deploy.log](lab/dukazy/cli-pavel-admin-deploy.log)) | jeden příkaz, agent nasazuje sám | potřebuje consent správce, appka pak platí pro všechny uživatele | registraci appky s delegovanými právy SharePointu a admin consent | střední (instalace CLI, `m365 login`) |
| 3 | **REST z přihlášeného prohlížeče** (`/_api/web/sitecollectionappcatalog/Add` a `…/Deploy` s cookie relací a digestem) | ✅ `egd01` a `egd03` přes `tools/lab-ucty-overeni.mjs` ([egd01](lab/dukazy/overeni-egd01-pokus1.json.log), [egd03](lab/dukazy/overeni-egd03-pokus1.json.log)) | bez consentu i bez CLI, automatizovatelné | potřebuje skriptovaný prohlížeč (Playwright) a uložené heslo; křehké na změny přihlašovacích obrazovek | nic navíc; může ale narazit na zásady zařízení a MFA v E.ON | vysoká, pro účastníka jen přes hotový skript |
| 4 | **Vlastní registrace appky** účastníka (`m365 setup` / vlastní appId) | ❓ nezkoušeno: účastník nemá roli k registraci appek, pokud to tenant nepovoluje | nezávislé na Pavlově appce | stejně potřebuje consent; v E.ON registrace appek běžně zakázané ❓ | povolit registraci appek nebo appku založit za něj | vysoká |

Doporučení pro workshop: varianta 2, když má agent nasazovat sám (v labu consent už je, ověřeno pod `egd10`).
Varianta 1 jako záloha bez CLI. V E.ON varianta 2 stojí na admin consentu od IT.
- **Výdejní stránka bez samoobsluhy přes db.** Pravidla kolekce `kody` jsou ověřená ✅ ([db-kody-pravidla.md](lab/dukazy/db-kody-pravidla.md)). Že host
  zvenku do db nezapíše, je zatím 📘 a ověřuje se jen na jednom místě, v řádku „Host zvenku“ v Neověřeno.
  Řešení B na tom nestojí: hosté do db nic nepíšou, ať to jde, nebo ne. Kdyby zápis šel, otevřela by se
  jen pohodlnější samoobsluha (A). Podle kontraktu db (runtime 0.2.98) do db zapisují jen
  vlastník, pozvaní Editoři a členové Pavlovy claude.ai organizace. Host z EG.D přes odkaz má úroveň `view`
  a nic nezapíše. Kdo není přihlášený do claude.ai, z db nevidí nic. Proto platí tohle:
  - Stránka je čitelná pro každého s odkazem. Heslo každého účtu je v ní zašifrované (AES-GCM 256,
    klíč PBKDF2-SHA256 600 000× z výdejního kódu, alias jako AAD). ✅ Ověřeno: správný kód otevře
    10/10 účtů, kód cizího účtu 10/10 odmítne ([vydej-sifra-10x10.log](lab/dukazy/vydej-sifra-10x10.log), test [skripty/vydej-sifra-test.mjs](lab/dukazy/skripty/vydej-sifra-test.mjs)).
  - Výdejní kód (8 znaků) má každý účet vlastní. Pavel ho vidí ve správcovském pohledu. Kódy jsou
    v db kolekci `kody` s pravidlem `read/write: owner`. ✅ Pod úrovní `admin` i `view` je kolekce prázdná.
  - Zablokování a uvolnění dělá Pavel ve správcovském pohledu („Označit jako vydaný“ s jménem,
    „Uvolnit“). Stránka se uloží jako nová verze, capability `artifact`. ✅ Vydání a uvolnění účtu 01 vyzkoušeno,
    stav vydržel obnovení stránky ([vydej-vydani-uvolneni.md](lab/dukazy/vydej-vydani-uvolneni.md)).
  - Limit: zablokování nedělá účastník sám, ale Pavel, když mu řekne kód. Kód předaný jinému člověku
    otevře heslo i jemu, stejně jako lístek s heslem.

## Výdejní web appka (hlavní cesta)

Pavel 23. 11.: účastníci si účty rozeberou sami, nic se nerozesílá. Kdo klikne „Beru tenhle“, dostane jméno
a heslo, ostatním se účet hned ukáže jako rezervovaný (se jménem, které zadal).

- **URL:** https://witty-pond-0f3afad0f.4.azurestaticapps.net (odkaz rozdá Pavel; stránka má `noindex`).
- **Přihlášení:** jedno společné heslo, `lab/ucastnici.secrets.json` → `vydej.spolecne_heslo`
  (Pavel ho řekne nahlas). Admin heslo pro uvolnění je tamtéž v `vydej.admin_heslo`.
- **Architektura:** Azure Static Web Apps **Free** (East US 2) + managed function (Node 20, bez závislostí)
  + Table Storage (`stegdvydej9a2c08b6`, Sweden Central, Standard_LRS, platí se jen za spotřebu, centy).
  Vše v `rg-egd-vydej`, tag `ucel=egd-workshop`. Pevná měsíční cena: žádná ✅ (`tools/lab-vydej.py stav` → `SKU: Free`).
  West Europe 23. 11. odmítl nový SWA i storage (`RequestDisallowedByAzure`), proto jiné regiony.
- **Tajemství:** hesla účtů, společné a admin heslo, podpisový klíč a SAS jen na tabulku jsou v app settings SWA,
  ne v kódu ani v repu. Prohlížeč heslo účtu dostane až po rezervaci, a jen ten, kdo rezervoval.
  Sken kódu, logů a snímků na tajemství: 0 nálezů v 18 souborech, po doplnění CLI bloku 0 nálezů ve 24 souborech.
- **Přihlášení agenta (CLI):** po rezervaci stránka ukáže appId CLI aplikace, tenant a příkaz
  `m365 login --authType deviceCode --appId <appId> --tenant <tenant>`. Hodnoty nejsou v kódu: jsou v app settings SWA
  `CLI_APP_ID` a `CLI_TENANT`. Plní je `tools/lab-vydej.py zalozit`: appId z `EGD_VYDEJ_CLI_APPID`, jinak ho dohledá v Entra
  podle názvu `EGD_VYDEJ_CLI_APPNAZEV` (výchozí `m365-cli-spfx-lab`), tenant z `EGD_LAB_DOMENA`. Bez těchto nastavení
  se blok neukáže.
- **Jeden účet na prohlížeč** (Pavel 23. 11.): token rezervace je v localStorage. Dokud ho účastník nevrátí, stránka
  ukazuje jen „Váš účet: egdNN“ a tlačítka „Beru tenhle“ skryje. Server pojistka: `beru` s tokenem platné rezervace
  vrátí 409 „Už máte účet egdNN, nejdřív ho vraťte.“ Když účet uvolní organizátor, token se při dalším načtení smaže.
  Bez localStorage (soukromé okno, blokované úložiště) appka funguje jako dřív, omezení pak neplatí.
  Obejít jde jen jiným prohlížečem nebo anonymním oknem, což je záměr (jiný člověk).
- **Rezervace je atomická:** vložení řádku s klíčem = účet; druhý dostane 409 „Tenhle účet si právě vzal někdo jiný“.
- Účastník vidí své údaje znovu po obnovení stránky na stejném zařízení; tlačítko **Vracím účet** rezervaci zruší. Účastníka ale neodhlásí z M365 ani z CLI (E2E test 24. 11.), což vadí jen na sdíleném PC; po workshopu to řeší reset hesel.
  Pavel uvolní účet příkazem `tools/lab-vydej.py uvolnit egdNN` (nebo API `admin-uvolnit` s admin heslem).

Ověřeno v labu 23. 11. ✅ ([vydej-app-test.log](lab/dukazy/vydej-app-test.log), snímky v [lab/dukazy/vydej-app/](lab/dukazy/vydej-app/),
test `node skripty/vydej-app-test.mjs <URL> <složka>`):

| Test | Výsledek |
|---|---|
| Špatné heslo | ✅ „Špatné heslo.“, seznam skrytý; API bez sezení 401 |
| Dva lidé kliknou na egd10 ve stejný okamžik (dvě anonymní okna) | ✅ právě jeden vítěz, druhý dostal hlášku a vidí „rezervováno: Test Alice“ |
| 10 souběžných požadavků na egd09 přes API | ✅ 1× 200, 9× 409 |
| Heslo ve výdeji = heslo účtu v secrets | ✅ |
| Nové anonymní okno | ✅ přihlásí se, vidí rezervace, v HTML žádné heslo účtu (0/10) |
| CLI blok po rezervaci (24. 11.) | ✅ desktop (egd10) i iPhone 13 (egd09): appId `12f19539-…`, tenant a příkaz se ukážou, zůstanou po reloadu a nic nepřetéká; účty pak uvolněny ([vydej-app-cli.log](lab/dukazy/vydej-app-cli.log), [desktop](lab/dukazy/vydej-app/8-cli-desktop.png), [mobil](lab/dukazy/vydej-app/8-cli-mobil.png)). Regrese „jeden účet“ 16/16 ([log](lab/dukazy/vydej-app-jeden-ucet-po-cli.log)) |
| Mobil (iPhone 13) | ✅ bez vodorovného posunu, nic nepřetéká kartu (první verze přetékala odkazy, opraveno), rezervace i „Vracím účet“ fungují |
| Jeden účet na prohlížeč ([vydej-app-jeden-ucet.log](lab/dukazy/vydej-app-jeden-ucet.log), `skripty/vydej-app-jeden-ucet-test.mjs`) | ✅ po rezervaci 0 tlačítek „Beru“; druhá karta rovnou ukáže můj účet; API `beru` s tokenem → 409 „Už máte účet egd07…“; stará karta se seznamem po kliku přepne na můj účet; reload ukáže můj účet; jiné anonymní okno si vzít může; po „Vracím účet“ i po uvolnění organizátorem token zmizí a jde rezervovat znovu; mobil totéž (409, reload, bez posunu); bez localStorage rezervace funguje |
| Uvolnění organizátorem | ✅ špatné admin heslo 401, správné uvolní ([vydej-app-admin.log](lab/dukazy/vydej-app-admin.log)); `uvolnit-vse` → 0 rezervací |

Založení a nasazení: `tools/lab-vydej.py zalozit` a `nasadit` ([vydej-app-zalozeni.log](lab/dukazy/vydej-app-zalozeni.log),
[vydej-app-nasazeni.log](lab/dukazy/vydej-app-nasazeni.log)). Nasazení běží v linux/amd64 kontejneru (OrbStack),
protože nástroj SWA má jen x86 binárku a na Apple Silicon bez Rosetty padá (`spawn Unknown system error -86`).

Smazání po workshopu (nevratné, rozhoduje Pavel): `az group delete -n rg-egd-vydej --subscription 05a636d8-d8e3-49d2-a450-4b3ff7cc0a13 --yes`
(totéž vypíše `tools/lab-vydej.py smazat`). SAS do tabulky stejně vyprší 23. 12. 2026.

### Záložní varianty výdeje (když web appka nepůjde)

| Varianta | Stav v labu | Pro | Proti | Náročnost pro Pavla na workshopu |
|---|---|---|---|---|
| **0. Výdejní web appka (Azure SWA Free)** | ✅ vše výše | samoobsluha, nic se nerozesílá, rezervace atomická, funguje bez účtu na claude.ai | závisí na Azure a síti; kdo zná společné heslo, může vzít libovolný volný účet | velmi nízká: říct odkaz a heslo; omyl = `tools/lab-vydej.py uvolnit egdNN` |
| **A. Výdejní stránka (claude.ai, šifrovaná hesla + kód)** | ✅ lokálně i v claude.ai pod vlastníkem; veřejný odkaz ⛔ čeká na Share (viz Neověřeno) | přehled, kdo má co; uvolnění jedním klikem; heslo se nediktuje | závisí na claude.ai a na tom, že veřejný odkaz u stránky s db jde zapnout | nízká: 10× zapsat jméno, kliknout a říct kód; omyl = „Uvolnit“ |
| **B. Stejná stránka jako soubor** (`lab/vydej/vydej-uctu.html` poslaný nebo na flashce) | ✅ otevřená bez runtime: karty, špatný kód odmítnut, správný kód egd02 dá správné heslo ([vydej-bez-runtime.log](lab/dukazy/vydej-bez-runtime.log)) | nezávislá na claude.ai, hesla pořád šifrovaná | bez správcovského pohledu, evidenci vydání vede Pavel ručně | střední: poslat soubor, 10× říct kód z lokálního výpisu `lab/vydej/db-kody.secrets/`, evidence na papíře |
| **C. Papírové lístky** (UPN + heslo, jeden lístek na účet) | ❓ netisknuto; obsah = `lab/ucastnici.secrets.json` | nejodolnější, funguje bez sítě | 20znakové heslo se špatně přepisuje; lístek se dá ztratit, po workshopu je nutný reset hesel (`lab-ucty-uklid.py --nova-hesla` to dělá) | nízká na místě (rozdat), příprava = vytisknout 10 lístků večer předem |
| **D. Lokální výpis u Pavla** (čte ze secrets a nadiktuje / pošle do chatu workshopu) | ✅ data jsou v secrets | bez přípravy | heslo putuje chatem nebo hlasem; žádná evidence | vysoká: 10× diktovat 20 znaků, chyby v přepisu |

Doporučení: 0 (web appka), při výpadku A nebo B, C jako papírová záloha v tašce.

## Průběh na workshopu

Web appka: Pavel řekne odkaz a společné heslo. Účastník zadá heslo a své jméno, klikne „Beru tenhle“,
uvidí jméno, heslo, odkazy na své tři weby a příkaz pro přihlášení CLI. Omyl: „Vracím účet“ nebo `tools/lab-vydej.py uvolnit egdNN`.
Pokud účet dostane jiný člověk, nejdřív `tools/lab-ucty-reset.py --ucty NN`, pak `tools/lab-vydej.py zalozit`
(přenese nová hesla do app settings; opakované spuštění ověřeno ✅ [vydej-app-zalozeni-znovu.log](lab/dukazy/vydej-app-zalozeni-znovu.log)).

Záloha A (stránka na claude.ai):

1. Účastník otevře odkaz, vybere volný účet a klikne „Beru si tenhle“. Pavlovi řekne číslo.
2. Pavel ve správcovském pohledu zapíše jméno, klikne „Označit jako vydaný“ a řekne kód.
3. Účastník zadá kód. Uvidí jméno, heslo, odkazy na své tři weby a první krok (DEV web v anonymním okně,
   `/AppCatalog` → Nahrát → Nasadit, varianta 1 výše).
4. Omyl: „Uvolnit“. Pokud účet dostane jiný člověk, nejdřív `tools/lab-ucty-reset.py --ucty NN`,
   pak přegenerovat a přepublikovat stránku (níže).

## Sdílení stránky (dělá Pavel)

Stránka je zatím soukromá. Otevři https://claude.ai/artifact/A1rabZHmzw2xYZ3iEcrvb7 a vpravo nahoře klikni
**Share**. V **General access** zvol **Anyone with the link** a úroveň **Viewer**, víc účastníci
nepotřebují. Pak **Copy link** a odkaz pošli účastníkům.
Pokud menu napíše, že veřejný odkaz pro tuhle stránku nejde kvůli tomu, co stránka používá, dej vědět:
připravím verzi bez db. Kódy pak budou jen na lokálním výpisu.

## Skripty (`tools/`, všechny mají `--help`)

| Skript | Co dělá |
|---|---|
| `lab-ucty-zalozit.py` | založí účty a skupinu; idempotentní; hesla jen do secrets |
| `lab-ucty-licence.py` | `--sku X [--remove-sku Y] [--vypnout-plan PLAN …]`, `--jen-odebrat`, `--ucty`, `--stav`; po změně SKU stačí přehrát |
| `lab-ucty-weby.py` | 30 webů, app catalog, správci, Vlastníci; `--kontrola` jen ověří |
| `lab-ucty-mfa.py` | `--stav`, `--vyjmout`, `--vratit` výjimky skupiny z MFA politiky |
| `lab-ucty-reset.py` | nové heslo + nový kód + zneplatnění přihlášení (`--ucty`, `--vse`) |
| `lab-ucty-vydej.py` | vyrobí `lab/vydej/vydej-uctu.html` (šifrovaná hesla) a dokumenty pro db `kody` |
| `lab-ucty-ui-nasazeni.mjs` | pod účastníkem projde UI cestu `/AppCatalog` → Nahrát → Nasadit se screenshoty (rc 3 = přihlášení nedoběhlo, opakovat) |
| `lab-ucty-overeni.mjs` | pod účastníkem (Playwright, izolovaný profil): přihlášení, nahrání a nasazení `.sppkg` do vlastního DEV, přístup k cizímu webu, práva na tenant katalog a kořen |
| `lab-ucty-uklid.py` | po workshopu: zablokuje přihlášení, vrátí MFA výjimku, volitelně nová hesla a odebrání licencí; nic nemaže (`--vypis-mazani` jen vypíše) |
| `lab-vydej.py` | výdejní web appka: `zalozit`, `nasadit`, `stav`, `uvolnit egdNN`, `uvolnit-vse`, `smazat` (jen vypíše příkaz) |
| `lab_ucty_lib.py` | sdílené funkce a konfigurace (env `EGD_LAB_*`) |

Předpoklady: `az` přihlášený do tenantu 972a…, `HOME=~/.m365-osobni m365` jako `pavel.admin`,
`.venv` s balíčkem `cryptography` (jen pro `lab-ucty-vydej.py`).

Přepublikování stránky po resetu hesla (z Claude Code):
1. `Artifact read` publikované stránky, uložit HTML do souboru,
2. `tools/lab-ucty-vydej.py --stav-z <ten soubor>`, aby se zachovalo, komu je co vydáno,
3. publikovat `lab/vydej/vydej-uctu.html` na stejnou URL a nahrát změněné kódy (`ArtifactData batch`
   z `lab/vydej/db-kody.secrets/`).

## Po workshopu

```bash
~/Projects/egd-workshop/tools/lab-ucty-uklid.py --nova-hesla
```
Tím se zablokuje přihlášení všech 10 účtů, zneplatní relace, vrátí MFA výjimka a hesla na stránce přestanou
platit. Licence uvolní `--odebrat-licence SPE_E5` (bere jedno SKU), Business Standard pak `tools/lab-ucty-licence.py --jen-odebrat "Microsoft_365_Business_Standard_EEA_(no_Teams)"`. Smazání webů a účtů jen na výslovné ano
(`--vypis-mazani`). Stránku pak Pavel přepne v Share zpět na soukromou. Web appku smaže
`az group delete -n rg-egd-vydej --subscription 05a636d8-d8e3-49d2-a450-4b3ff7cc0a13 --yes` (jen na Pavlovo ano).

## Ověření pod účastnickým účtem

✅ 2026-11-22, `tools/lab-ucty-overeni.mjs` jako `egd01` (heslo ze secrets, izolovaný prohlížeč),
výstup [overeni-egd01-pokus1.json.log](lab/dukazy/overeni-egd01-pokus1.json.log); `egd03`
[overeni-egd03-pokus1.json.log](lab/dukazy/overeni-egd03-pokus1.json.log); UI cesta `egd05`
[ui-egd05.log](lab/dukazy/ui-egd05.log):

| Test | Výsledek |
|---|---|
| Přihlášení heslem (po CA výjimce) | OK; před vyjmutím z registrační kampaně občas zastavila registrace Authenticatoru (3/6 bez logu, 0/6), po vyjmutí 0 z 28 pokusů na egd01–egd10, viz Rozhodnutí |
| Nahrání `eon-demo-kalkulacka.sppkg` do `/sites/egd01-dev` site app catalogu | 200 |
| Nasazení (Deploy) | 200, `Deployed: true`, verze 1.0.0.9 |
| Cizí web `/sites/egd02-dev` | 403 |
| Hledání v cizím webu | 0 výsledků |
| Tenant app catalog `/sites/apps` | čtení ano, zápis ne |
| Druhý účet `egd03` (stejný skript, `--ucet egd03 --cizi egd04`) | nahrání 200, nasazení 200; vlastní DEV, TEST i PROD: zápis ano; cizí egd04-dev/test/prod: 403/403/403; hledání 0 |
| Nasazení přes UI (`egd05`, Nahrát → Nasadit) | `Deployed: true`, verze 1.0.0.14 |
| Kořenový web | ⚠️ **zápis ano**: účastník by mohl měnit Pavlovy stránky s návodem (arcade-home, workflow). Příčina ✅: „Everyone except external users“ je ve skupině Členové kořene ([koren-clenove.log](lab/dukazy/koren-clenove.log)). **Odloženo na Pavla:** změna se týká všech interních uživatelů tenantu, ne jen účastníků, proto jsem ji neprovedl. Oprava = přesunout tu skupinu z Členů do Návštěvníků. ✅ Účinek ověřen na labovém webu `egd10-prod` pod `egd01` ([koren-oprava-test.log](lab/dukazy/koren-oprava-test.log)): Everyone v Členech → „MŮŽE zapisovat“, v Návštěvnících → „jen čtení“, po odebrání → „bez přístupu“ (web vrácen do původního stavu). Po opravě kořene ověřit `tools/lab-ucty-overeni.mjs --ucet egd01`: `prava_koren: jen čtení` |

✅ Výdejní stránka bez runtime claude.ai (Playwright, lokální `vydej-uctu.html`, tedy bez db, user
a artifact, jako host bez účtu): 10 karet, správcovský pohled skrytý, špatný kód ukáže chybu. Správný kód
egd02 ukáže správné jméno i heslo (porovnáno se secrets) a 3 odkazy na weby. Heslo je na stránce jen
jednou, v pohledu s přístupy ([vydej-bez-runtime.log](lab/dukazy/vydej-bez-runtime.log), test
[skripty/vydej-bez-runtime-test.mjs](lab/dukazy/skripty/vydej-bez-runtime-test.mjs)).

## Neověřeno

| Tvrzení | Proč zatím ne | Jak ověřit |
|---|---|---|
| Host přes veřejný odkaz stránku otevře a odemkne heslo | stránka je soukromá a sdílení zapíná jen Pavel; headless prohlížeč bez přihlášení zastaví ochrana claude.ai proti botům (`challenge_redirect`) | po Share → Anyone with the link otevřít odkaz v anonymním okně běžného prohlížeče a zadat kód jednoho účtu |
| Host zvenku (claude.ai účet mimo Pavlovu organizaci) nezapíše do db, takže samoobsluha typu A nejde | máme jen Pavlův účet | pozvat externí testovací claude.ai účet jako Viewer a zkusit zápis ze zkušební stránky s pravidlem `write: interact` |
| UI cesta nasazení v tenantu E.ON | ⛔ jen v E.ON | na AILab-Dev projít `/AppCatalog` → Nahrát → Nasadit |
| Registraci Authenticatoru nevynucuje i ID Protection (MFA registration policy) | `az` a m365 nemají Policy.Read; kampaň je už vyjmutá a 0/28 výzev ukazuje, že teď nic nevynucuje, ale politika ID Protection může mít vlastní interval | Pavel v Entra → ID Protection → Multifactor authentication registration policy: vyjmout skupinu nebo potvrdit vypnuto; 24. 11. znovu `printf 'egd%02d\n' {1..10} \| xargs -I{} tools/lab-ucty-overeni.mjs --ucet {} --jen-prihlaseni` |
