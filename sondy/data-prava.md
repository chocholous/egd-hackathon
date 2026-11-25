# Sonda: data a práva (databáze, editace, víceúrovňová autentizace)

Požadavky Tomáše Galíka: „databáze včetně editace dat“ a „víceúrovňová autentizace a práva“ (zadavatel, schvalovatel, admin; kdo vidí jaké záznamy).
Měřeno v labu (tenant pavelchocholousgmail) 2026-11-22. Značky: ✅ změřeno v labu · 📘 dokumentace · ❓ neověřeno (📘 a ❓ jsou jen mezistav, viz [../CLAUDE.md](../CLAUDE.md); neověřené je v sekci „Neověřeno“ na konci).

## Shrnutí: požadavek, varianty, ověřeno, doporučení

Varianty: A) SharePoint seznam, B) Dataverse / Power Apps, C) vlastní DB za API, D) SharePoint seznam + Power Automate pro ACL na položku (jen návrh, ❓). Pro/proti, nároky na IT E.ON a náročnost pro citizen developera jsou u každé níže. Sloupec „Varianta (doporučení)“ ukazuje, co je v labu ověřené; doporučení k použití je jen návrh a stojí na ✅ řádcích.

| Požadavek | Varianta (doporučení) | Stav |
|---|---|---|
| Databáze + editace dat (stovky až nízké tisíce záznamů) | **A) SharePoint seznam** + SPFx (`fetch` na `_api`; PnPjs a `SPHttpClient` v labu neběžely ❓) | ✅ čtení, zápis, úprava (holé REST), přílohy, verze, 6000 položek |
| Role zadavatel / schvalovatel / admin, „zadavatel vidí jen své“ | **A) SharePoint seznam**: 3 skupiny + `ReadSecurity=2`/`WriteSecurity=2` + vlastní úroveň oprávnění s `CancelCheckout` pro schvalovatele | ✅ ověřeno pod 5 uživateli |
| Přílohy k záznamu, které vidí jen autor a řešitelé | A) přílohy položky listu | ✅ REST (cizí dostane 404/400); přímé čtení souboru ✅ jen přes REST `GetFileByServerRelativeUrl`, **v prohlížeči s cookie ❓ neověřeno** |
| Víc než ~5000 záznamů, dotazy přes více sloupců, vztahy 1:N, reporty/SQL | **C) vlastní DB za API** (Azure SQL free/serverless + Container App + app role) | ✅ role z tokenu fungují, 0 USD (log: [overeni/data-prava/api-matrix-2026-11-22.jsonl](overeni/data-prava/api-matrix-2026-11-22.jsonl)) |
| Sdílení jednoho záznamu s vybranými lidmi (ACL na položku) z appky | C) (nebo A) s backendem), SPFx samotné to nezvládne | ✅ v `Zadosti` zadavatel dědičnost rozbít nemůže (403); ❓ v `ZadostiACL` na položce s přímým grantem to prošlo (200, nevysvětleno, viz níž) – tedy „zadavatel nemůže rozdávat práva“ **zatím neplatí obecně** |
| Sdílení záznamu přes Power Automate (ACL na položku bez backendu v Azure) | D) SharePoint seznam + flow s „Grant access to an item or a folder“ | flow uloženo ✅ (viz [power-automate.md](power-automate.md)), **běh ❓ neověřen**, čeká na přihlášení připojení |
| Dataverse / Power Apps | B) pro EG.D podle 📘 spíš ne: placené licence, Dataverse for Teams se ruší | 📘 ❓ v labu nezkoušeno |

**Pro většinu appek, které workshop předpokládá (formulář, tabulka, stav, schválení, přílohy, „vidím své / vidím vše“), podle změřeného stačí SharePoint seznamy** (platí pro změřené scénáře: až ~6000 položek s indexovanými sloupci, role „své / vše“, přílohy, verze; podíl appek z EG.D soutěže nemáme doložený rozborem zadání, proto žádné procento). Bez Azure, bez per-user licencí, práva vynucuje SharePoint, ne appka. DB je potřeba, až když platí aspoň jedno z: (1) víc než pár tisíc záznamů s dotazy přes neindexovatelné kombinace, (2) vztahy a transakce (několik tabulek, konzistence), (3) práva po záznamu, která nejdou vyjádřit „své / vše“ (např. „vidí moje oddělení a nadřízený“) a nemá je kdo rozdávat, (4) data musí číst i jiný systém než SharePoint, (5) audit a reporting v SQL.

## Použité účty (odchylka od zadání)

`alice` a `bob` v labu existují, ale jejich hesla v `~/Projects/ppf-rooms/lab/lab.secrets.json` **nejsou** (jen deset jiných účtů). Heslo cizímu účtu jsem neresetoval (jiné lab projekty ho mohou potřebovat). Použil jsem:

| Role v sondě | Účet | Skupina na webu |
|---|---|---|
| zadavatel 1 / 2 (místo alice / bob) | tomas.prochazka / jakub.kucera | Zadavatelé |
| schvalovatel | eva.vesela | Schvalovatelé (úroveň „EGD Schvalovatel“, má `CancelCheckout`) |
| schvalovatel s úrovní Edit (pro srovnání) | martina.cerna | Schvalovatelé (Edit) |
| správce | petra.novakova | Správci (Full Control na listu) |
| cizí, bez skupiny | lucie.dvorakova | nic |

Přihlášení: ROPC s veřejným klientem „SharePoint Online Management Shell“ (`9bc3ab49-…`). Azure CLI klient SharePoint odmítne (`401: App is not allowed to call SPO with user_impersonation`). Token jde jen na stdout, nikam se neukládá, `~/.config/spo-auth` jsem nesáhl.

## A) SharePoint seznamy

### Co jsem postavil

Web `https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-data-prava` (Communication site, jen pro sondu). Skupiny Zadavatelé, Schvalovatelé, Správci (+ „Schvalovatelé (Edit)“ pro srovnání). Seznamy:

- `Zadosti`: `ReadSecurity=2`, `WriteSecurity=2`, přerušená dědičnost, skupiny na listu: Zadavatelé = úroveň „EGD Zadavatel“ (Contribute bez `CancelCheckout`), Schvalovatelé = „EGD Schvalovatel“ (totéž **plus `CancelCheckout`**), Správci = Full Control. Sloupce Castka a Stav a Oddeleni indexované.
- `ZadostiW`: totéž, ale `ReadSecurity=1` (vzor digi-podnety: všichni čtou, upravuje jen autor).
- `ZadostiACL`: `ReadSecurity=1`, práva na položce (unikátní ACL).
- `Velky`: 6000 položek, bez item-level bezpečnosti, sloupce Kategorie, Castka (indexované), Neindexovano.

### Co kdo vidí a smí (✅ `Zadosti`, RS=2/WS=2)

Surová data: `sondy/data-prava/matrix.jsonl`, `matrix-ZadostiW.jsonl`.

| Účet | Čte | Přidá | Upraví cizí | Smaže cizí | Přímé čtení cizí položky |
|---|---|---|---|---|---|
| zadavatel | jen své | ano | ne (404 „položka neexistuje“) | ne (404) | 404 |
| schvalovatel (`CancelCheckout`) | vše | ano | **ano** | **ano** (pozor, i mazání) | 200 |
| schvalovatel s úrovní Edit (`ManageLists`, bez `CancelCheckout`) | **nic cizího (jen své)** | ano | ne | ne | 404 |
| správce | vše | ano | ano | ano | 200 |
| cizí bez skupiny | 403 | 403 | 403 | 403 | 403 |

Důležité zjištění (✅ **změřeno v labu**, `matrix.jsonl`, `matrix-ZadostiW.jsonl`): **co obchází „jen své“ je `CancelCheckout` (Override List Behaviors), ne `ManageLists`.**
V `ZadostiW` (`ReadSecurity=1`, `WriteSecurity=2`) schvalovatel s `CancelCheckout` cizí položku upraví, schvalovatel s Edit/`ManageLists` dostane 403 (Access is denied) a zadavatel taky 403.
**Rozpor mezi zdroji:** v labu je změřeno `CancelCheckout` (✅ viz `matrix*.jsonl`). Tvrzení „`ManageLists` je jediná možnost“ pochází z `~/Projects/egd-vibecoding` (README digi-podnety a `docs/historie.md`), kde bylo „ověřeno výpočtem“ bitů, ne zápisem druhým účtem; **je to tvrzení z egd-vibecoding, které se má opravit tam** (README a `docs/pasti.md` tam jsme needitovali, nahlášeno hlavní session). ❓ Proč na devu MeetAI-Dev fungovalo Edit, nevím (jiná cesta k právům, jiná definice úrovně?); ověřit zápisem pod účtem schvalovatele na devu MeetAI-Dev. Návrh: dát schvalovateli vlastní úroveň s `CancelCheckout` (jako kit `edit-all`), ne Edit; a pozor, že platnost i v tenantu E.ON je ověřena jen v labu (⛔ viz níž).

`CancelCheckout` zároveň dává schvalovateli čtení i **mazání** cizích položek. Smazání zakázat jde jen úrovní bez `DeleteListItems` (v mé úrovni jsem ho nechal; kit má `edit-all` také s mazáním) a verzováním/košem.

### `EffectiveBasePermissions` pro UI (✅)

`GET lists/getbytitle('X')/EffectiveBasePermissions` vrací správná práva každého účtu (zadavatel: View/Add/Edit/Delete; schvalovatel: + `CancelCheckout`; správce: + `ManageLists`, `ManagePermissions`, `ApproveItems`). Jde i na položku: `items(id)/EffectiveBasePermissions` (zadavatel u cizí položky 400/„neexistuje“, u své `Edit/Delete`; schvalovatel u každé s `CancelCheckout`). Pro rozhodnutí v UI („ukaž tlačítko Schválit“) tedy stačí `CancelCheckout` bit na listu. Kit `SpSource.can()` dělá přesně tohle (jen list, bit `CancelCheckout` pro `edit-all`).

### Přílohy, verze, ACL na položce

| Měření | Výsledek |
|---|---|
| Příloha cizí položky přes REST `AttachmentFiles` | ✅ cizí zadavatel 400 („položka neexistuje“), schvalovatel/správce 200, cizí bez skupiny 403 |
| Přímé čtení souboru přílohy (`GetFileByServerRelativeUrl`) | ✅ vlastník 200, cizí zadavatel 404, schvalovatel s Edit 404, schvalovatel `CancelCheckout` 200. Item-level skrytí chrání i soubor. (Přímý GET na `/Lists/.../Attachments/..` s bearer tokenem dával 401 všem (`extras.jsonl` ř. 12–14), což nic nedokazuje; v prohlížeči s cookie pod zadavatelem ❓ neověřeno) |
| Verze položky `items(id)/versions` | ✅ zadavatel vidí verze své položky (3), cizí položky ne; schvalovatel vidí. Kit psal „neověřeno druhým účtem“, tady ověřeno |
| `ReadSecurity=2` + sdílení jedné položky s dalším uživatelem (item ACL) | ✅ **nefunguje**: `ReadSecurity=2` přebíjí ACL položky; jakub po sdílení (Read) položku nevidí (404). Pro sdílení musí být `ReadSecurity=1` |
| `ReadSecurity=1` + položka s vlastním ACL (`copyRoleAssignments=false`, přidáni autor + schvalovatelé + vlastníci) | ⚠ funguje podle opisu (slabší důkaz, viz níž): každý zadavatel vidí jen svou položku, schvalovatelé obě; schvalovatel s Edit (bez položkového ACL) ne. Důkaz je slabší: `extras2.jsonl` ř. 28 u „schvalovatel s Edit“ vrací 404 „Seznam neexistuje“ (list nepřístupný, ne skrytá položka), zopakovat s právem na list ❓. Nastavit ACL ale musí někdo s `ManagePermissions` |
| Zadavatel (Contribute-like) rozbije dědičnost na vlastní položce | ✅ v `Zadosti` 403; v `ZadostiACL` na položce, kde měl už přímý grant, překvapivě 200 ❓ (autor sondy nechápe proč, `extras2.jsonl` ř. 30; **nepoužívat pro důvěrná data, dokud se nevysvětlí**) |
| Čas: položka + `breakroleinheritance` | ✅ 30 položek za 19,9 s (~0,66 s na položku, sekvenčně) |

Závěr k ACL: `ReadSecurity=2` je nejlevnější a nejspolehlivější vzor „vidím jen své“, ale je to vše-nebo-nic (nejde sdílet kolegovi, schvalovatel potřebuje `CancelCheckout`, a tím i mazání). Skutečný ACL na položku z SPFx pod běžným uživatelem nejde (✅ v `Zadosti` 403; ❓ výjimka v `ZadostiACL`, kde měl zadavatel přímý grant a rozbití dědičnosti prošlo – nevysvětleno, viz výše), potřebuje backend (Power Automate, Container App, Function) s oprávněním `ManagePermissions`. Limity 5000 unikátních ACL na list (doporučení) a 50 000 (tvrdý limit) jsou jen 📘, v labu neověřené (tvrdý limit ověřit nejde).

### Limity: 6000 položek a threshold (✅ `Velky`, surová data `threshold.jsonl`, `bulk.jsonl`)

Vložení: SP REST `$batch` (changeset po 100) paralelně po 4: 5800 položek za 161 s (36 položek/s; ✅ `bulk.jsonl`). Údaj „200 položek za 15,6 s“ v `bulk.jsonl` **není**, ❓ doložit. Celkem 6000 za ~3 minuty. (První pokus bez changesetu: 400 „POST ve query operaci“. Zápisy musí být v changesetu.)

| Dotaz nad 6000 položkami | Vlastník webu | Zadavatel |
|---|---|---|
| `$top=100`, `$top=5000` bez filtru | OK (0,3 – 0,5 s) | OK |
| `$top=5001` bez filtru | **500 „překračuje mezní hodnotu zobrazení“** | totéž |
| filtr na **indexovaný** sloupec (300 výsledků) | OK 0,2 s | OK |
| filtr na **neindexovaný** sloupec, i s `$top=10` | **500** | **500** |
| `$orderby` neindexovaný | **500** | **500** |
| `$orderby` indexovaný | OK | OK |
| indexovaný filtr + neindexovaný `$orderby`/filtr navíc | OK (index zúží) | OK |
| indexovaný filtr, který vrací >5000 řádků (`Castka ge 0`) | **500** ❓ (v `threshold.jsonl` řádek pro `ge 0` není, doložit) | **500** ❓ |
| stránkování všeho po 1000 přes `odata.nextLink` | OK, 6 stránek, 1,6 s | OK |

Pravidlo pro vibecodera: všechny sloupce, podle kterých appka filtruje nebo řadí, **index**; čti po stránkách `$top≤1000` a `nextLink`; nikdy `$top` nad 5000; indexy zakládej, dokud je seznam malý (📘 přidat index na seznam nad prahem často selže; zde ❓ neměřeno, indexy byly založeny na prázdném seznamu; ověřit přidáním nového indexovaného sloupce na seznam `Velky` při 6000 položkách). Vlastník webu práh neobchází (✅ stejné chyby). Kit to řeší: `getItems` se `where` filtruje na serveru, stránkuje po `nextLink`, a unikátní sloupec s `itemScope own` zakazuje.

Další limity (📘 jen dokumentace, v labu neověřeno, pro appky nepodstatné): lookup sloupce ve view max. 12, seznam až 30 miliónů položek, soubor přílohy do 250 MB. Lookup/Číselníky: v kitu je „textový klíč, ne SP Lookup“ (jednodušší práva a threshold); doporučuji převzít.

### Editace z SPFx: PnPjs vs. `SPHttpClient` vs. `fetch`

V labu jsem testoval **jen holé REST** (stejné volání, jaké by dělal `SPHttpClient`/PnPjs; `SPHttpClient` ani PnPjs v SPFx v labu neběžely ❓): čtení `items?$select&$filter&$top`, zápis `POST items` s `X-RequestDigest`, úprava `MERGE` + `IF-MATCH: *`, přílohy `AttachmentFiles/add`. Kit nepoužívá ani PnPjs, ani `SPHttpClient`, ale `fetch` se `credentials: same-origin` a vlastní digest (`SpSource.ts`), a aplikace se k datům dostane přes malé rozhraní `DataSource` (Mock i SP). Pro EG.D to je nejjednodušší cesta pro agenta: žádná další závislost a mock pro lokální vývoj bez tenantu.

### Co z kitu `ppf-spfx-devkit` jde vzít pro EG.D bez PPF závislostí

Zdroj: `git show origin/main:plugin/ppf-citizen-ai-devkit/skills/ppf-citizen-ai-devkit/templates/project/...`

Vzít (čisté, bez PPF):
- `sp/app.manifest.json`: model `roles` → `lists.<List>.access` → `levels` (úrovně oprávnění s `rights`) a `itemScope: own | own-write`. `own` = `ReadSecurity=WriteSecurity=2`, `own-write` = Read 1 / Write 2 (`tools/lib/manifest.mjs`). Přesně to, co jsem změřil, a čte se to jedním souborem.
- `tools/lib/plan/perms.mjs`: plánovač práv (skupiny rolí, úrovně, přerušení dědičnosti, srovnání s gitem; nic nemaže, vlastníky ponechá). `PERMISSION_KIND`/`maskOf` je správná tabulka bitů.
- `tools/lib/prava.mjs`: `getusereffectivepermissions` = ověření práv libovolného uživatele bez jeho účtu (užitečné jako test „co smí schvalovatel“). V labu jsem použil `EffectiveBasePermissions` pod jeho tokenem; kit umí totéž adminem.
- `spfx/src/app/data/SpSource.ts`, `MockSource.ts`, `types.ts` (`DataSource`: `getItems`, `addItem`, `updateItem`, `can(list, 'read|add|edit|edit-all')`, přílohy, verze). `can()` z `EffectiveBasePermissions` je správný vzor, appka nezná jména skupin.
- Vzor „Schvalování, které autor neobejde“ (`references/app-design.md`): samostatný list rozhodnutí + otisk obsahu. Podle kódu funguje bez `CancelCheckout` pro schvalovatele (kód přečten z gitu, **v labu nespuštěn ❓**, ověřit pod schvalovatelem bez `CancelCheckout`), takže schvalovatel nemusí vidět/mazat cizí žádosti přes REST (ale žadatel pak čte rozhodnutí i k cizím požadavkům, pokud má list rozhodnutí `read` pro všechny, kit to sám uvádí).

PPF závislosti, které je nutné vyřadit nebo přejmenovat: prefix `PPF` v názvech skupin a úrovní (`<prefix> – <role>`), `ppf-material` / PPF design tokeny (`gen-design-values`, `design-check`), `m365` CLI home a PPF tenant (`tools/lib/m365-home.mjs`), cockpit a „Připomínky“ vrstva (`feedback`). `deploy.mjs` počítá s DEV/TEST prostředími a m365 CLI; pro EG.D bude potřeba jen jejich část.

Neověřeno kitem a ověřeno mnou: cizí položky u `itemScope own` vidí a upraví úroveň s `CancelCheckout`; zadavatel s `ViewVersions` dostane verze své položky; přílohy cizí položky jsou skryté.

### Co potřebuje A od IT E.ON

Vlastní web (nebo site collection) pro appku, právo zakládat skupiny a vlastní úrovně oprávnění (jinak to udělá správce), nic jiného. Žádné Azure, žádné licence navíc. Cena 0. Obtížnost pro vibecodera s agentem: nízká, pokud použije kit (manifest + mock); střední, pokud právní model píše ručně přes REST (v labu to dalo práci, hlavně `CancelCheckout`, ACL a threshold).

## B) Dataverse / Dataverse for Teams / Power Apps (📘 mezistav, v labu nezkoušeno)

- **Dataverse for Teams se ruší** (zdroje: [Microsoft Learn/GitHub about-teams-environment](https://github.com/MicrosoftDocs/power-platform/blob/main/power-platform/admin/about-teams-environment.md), [Skybow](https://www.skybow.com/blog/dataverse-for-teams-deprecation), [Cohash](https://cohash.com/blog/dataverse-for-teams-end-of-support-2027)): sekundární zdroje uvádějí zákaz zakládání nových prostředí od 15. 11. 2026 a suspendaci stávajících v září 2027. Limit 2 GB na prostředí. Nezakládat nic nového. ❓ přesná data si ověř na Microsoft Learn.
- **Plný Dataverse**: každý uživatel potřebuje licenci Power Apps / Power Automate / Copilot Studio a tenant kapacitu (na licenci bývá 10 GB databáze + 20 GB souborů) ([ZapAI srovnání](https://zapai.io/dataverse-vs-sharepoint-lists/), [DEV Community](https://dev.to/balupremkumar/dataverse-for-teams-vs-the-real-thing-the-limits-2cdh)). To je přesně „per-user licence“, kterou Galík nechce.
- **Přístup ze SPFx**: jde přes `AadHttpClient` na Dataverse Web API s `webApiPermissionRequests` (admin consent) ([postup](https://vitalyzhukov.com/en/call-dataverse-api-from-spfx-web-part), [Learn: AadHttpClient](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient)); znám hlášený `AADSTS65001` (chybí souhlas správce) u „SharePoint Online Client Extensibility“ (Q&A; v labu nezkoušeno, srovnej AADSTS65001 u m365 CLI v [../03-lab.md](../03-lab.md) ř. 14, což je jiný případ). Licenční pravidlo pro volání ze SPFx jsem nenašel; předpoklad: uživatel licenci potřebuje.
- Výhody: skutečná relační DB, řádková bezpečnost (role, business units), audit. Nevýhody: licence, nové prostředí, ALM. Pro appky, které stačí SharePoint seznam (A), zbytečné.
- **Co chce od IT E.ON** (📘): Power Platform prostředí s Dataverse (správce), licence Power Apps / Power Automate / Dataverse kapacita pro uživatele, DLP politika, ALM (řešení, prostředí DEV/TEST/PROD). **Náročnost pro citizen developera:** vysoká (modelování tabulek, role a business units, správa prostředí, licence), vyžaduje správce platformy.
- ⛔ **Důvod, proč v labu nezkoušeno:** žádné Power Platform prostředí s Dataverse jsem nezaložil, mimo rozpočet/licence (E5 samo Dataverse kapacitu pro vlastní DB nedává ❓). Návrh ověření: založit developer prostředí (cenu a pokrytí E5 zjistit na Microsoft Learn / v Power Platform admin center), zjistit náklad před založením. Výchozí prostředí má od 12. 11. Dataverse (viz [napojeni.md](napojeni.md)), takže tabulku jde zřejmě zkusit tam ❓.
- Datum 15. 11. 2026 (zákaz nových prostředí Dataverse for Teams) je dnes už za námi; ze sekundárních zdrojů, neověřeno proti Microsoft Learn ❓.

## C) Vlastní DB za API (✅ proběhlo v labu; log volání uložen)

> Log volání doměřila role Ověřovatel sond 22. 11. 2026: [overeni/data-prava/api-matrix-2026-11-22.jsonl](overeni/data-prava/api-matrix-2026-11-22.jsonl). Tabulka ověření níže v něm sedí (mazání Správcem se neověřovalo, nemažeme; řádek „petra maže 200“ je opis, běh ❓ neuložen). Přiřazení app roles uživatelům nemá uložený výstup.

Architektura: SPFx → `AadHttpClient` (token uživatele) → Container App (Node, `jose` ověří JWT) → Azure SQL. Role z tokenu rozhodují o právech, DB drží data.

Postaveno (kód `sondy/data-prava/api/`):
- Entra appka `egd-sonda-data-api` (`fec3e01a-6ce4-4f9e-9dff-a61b354151fb`), **app roles** Zadavatel / Schvalovatel / Spravce, scope `access_as_user`, uživatelé přiřazeni (tool `data-prava-entra-api.py`).
- Azure SQL: server `sql-egd-data-41ebe9`, databáze `egddata` **free offer, serverless, auto-pause 60 min** (`--use-free-limit`, po vyčerpání měsíčního limitu AutoPause). Cena 0 USD. Heslo je v `~/.config/egd-sonda-data-prava/sql.env` (0600, mimo repo; lab).
- Container App `ca-egd-data-api` (0,25 vCPU, min replik 0) ve sdíleném prostředí `ca-ppf-rooms-env`; URL `https://ca-egd-data-api.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io`.

Ověření (každá řádka skutečné volání s tokenem daného uživatele; ✅ log viz výše; výjimky: „petra maže 200“ a přiřazení app roles ❓ bez uloženého běhu):

| Volání | Výsledek |
|---|---|
| bez tokenu | 401 |
| lucie (platný token, bez app role) | 403 „bez aplikační role“ |
| tomas `/api/me` | `roles: ["Zadavatel"]` (role přímo z tokenu) |
| tomas a jakub zakládají žádost | 201 |
| tomas / jakub čtou | každý jen svou žádost (filtr podle `oid`) |
| eva (Schvalovatel) čte | obě žádosti |
| tomas mění stav | 403; eva mění stav 200 |
| eva zakládá / maže | 403 / 403 |
| petra (Spravce) maže | 200 |

Studený start API: první volání po nečinnosti (`/healthz`) trvalo **19,2 s** ✅ (původní opis 7,8 s byl chybný), další 0,15 – 0,35 s. První dotaz na SQL po auto-pauze (`/api/me`) trval **33,3 s** ✅ (ne „desítky sekund“ ❓), pak 0,16 – 0,35 s. Zdroj: [overeni/data-prava/api-matrix-2026-11-22.jsonl](overeni/data-prava/api-matrix-2026-11-22.jsonl).

SPFx část (`AadHttpClient.getClient(appId)` + `webApiPermissionRequests` v `package-solution.json` + admin consent): vzor je změřený v `~/Projects/ppf-rooms` (web part s Graphem a `Presuny.Manage`). V této sondě jsem SPFx web part nenasazoval, volal jsem API tokenem stejného druhu (v2, `aud` = appId, `roles`, `scp`), takže ❓ jen samotné `AadHttpClient` z SPFx proti tomuto API. Samotný vzor `AadHttpClient` → Container App s Easy Auth je ✅ změřen na AI gateway, viz [ai.md](ai.md) (Sonda 3).

Cena: SQL free offer 0, Container App min 0 repliky ≈ centy (Log Analytics sdílené), image v cizím ACR (viz níž). Odhad celé sondy: pod 1 USD. Alternativy (jen 📘, v labu nezkoušeno): Cosmos DB free tier (1000 RU/s + 25 GB zdarma, jeden na subscription), Postgres Flexible (trvalý náklad).

Co potřebuje od IT E.ON: Azure subscription, registraci Entra appky (app roles, přiřazení uživatelů nebo skupin), admin consent pro `webApiPermissionRequests`, právo na Container Apps/SQL. Obtížnost pro vibecodera: vysoká (identita, tokeny, deploy, SQL), nutný nějaký „správce platformy“. Kdyby se to dělalo pro víc appek, vyplatí se jedno sdílené API/šablona.

## D) SharePoint seznam + Power Automate pro ACL na položku (❓ návrh, v labu neověřeno)

Idea: zadavatel zapíše položku do seznamu (`ReadSecurity=1`), standardní trigger SharePointu spustí flow, které akcí „Grant access to an item or a folder“ (SharePoint, **Standard** ✅ tier, viz [power-automate.md](power-automate.md)) nastaví ACL (autor, schvalovatelé). Flow uloženo (`c076f6d0-…`), **běh ❓ čeká na přihlášení SharePoint připojení**, výsledek tedy není známý.
- Pro: bez Azure a bez Premium (pokud je akce opravdu Standard), nastavení ACL dělá flow s právy vlastníka připojení, ne zadavatel.
- Proti: akce běží s právy vlastníka připojení (musí mít Manage Permissions), v auditu SharePointu je „kdo to udělil“ vlastník flow; odchod vlastníka flow zastaví ❓ (⛔ jen v tenantu E.ON); latence a spolehlivost neměřeny.
- Co chce IT E.ON: licenci Power Automate, správu připojení, servisní účet jako vlastníka flow. Náročnost pro citizen developera: střední.
- Návrh ověření: přihlásit připojení člověkem (viz [napojeni.md](napojeni.md), část Power Automate), pustit flow a zkontrolovat ACL přes `EffectiveBasePermissions` pod zadavatelem a cizím.

### Srovnání: kdo nastavuje ACL a jak těžké je to pro citizen developera

| Varianta | Kdo nastaví ACL | Naměřeno | Náročnost pro citizen developera |
|---|---|---|---|
| A, `ReadSecurity=2` | nikdo (vše-nebo-nic, nejde sdílet kolegovi) | ✅ | nízká |
| A, `ReadSecurity=1` + ACL | někdo s `ManagePermissions` mimo SPFx (správce, skript) | ✅ (se slabším důkazem u ř. `extras2`) | střední |
| C, API | backend s identitou, role z tokenu | ✅ (log neuložen) | vysoká |
| D, Power Automate | flow s právy vlastníka připojení | ❓ | střední |

## Co jsem vytvořil v labu

| Zdroj | Detail |
|---|---|
| SharePoint web | `/sites/egd-sonda-data-prava` (skupiny Zadavatelé, Schvalovatelé, Správci, Schvalovatelé (Edit); úrovně „EGD Zadavatel“, „EGD Schvalovatel“; seznamy Zadosti, ZadostiW, ZadostiACL, Velky se 6000 položkami) |
| Azure RG | `rg-egd-sonda-data-prava` (tag `ucel=egd-workshop`): SQL server + DB `egddata` (free), Container App `ca-egd-data-api`, user identity `id-egd-data-pull` |
| Změna cizího | role `AcrPull` pro `id-egd-data-pull` na ACR `acrppfroomsca3lbgs`; nový repozitář `egd-sonda-data-api:0.1` v tom ACR; app v prostředí `ca-ppf-rooms-env`; registrace poskytovatele `Microsoft.Sql` v předplatném (bylo nutné pro SQL) |
| Entra | aplikace `egd-sonda-data-api` + service principal + admin consent a přiřazení rolí (tomas, jakub = Zadavatel; eva = Schvalovatel; petra = Spravce) |

Nic jsem nemazal. Upozornění: testovací data zůstala v seznamech (položky bez prefixu „uniq“ a „zadavatel? #“); uklidit je půjde přes SharePoint (REST DELETE) až na tvůj pokyn.

## Neověřeno (mezistav, důvod a návrh ověření)

| Tvrzení | Důvod | Návrh ověření |
|---|---|---|
| Vzor `CancelCheckout` (a ne Edit) platí i v tenantu E.ON a na devu MeetAI-Dev | ⛔ jen v E.ON / dev jiného tenantu | zápis pod účtem schvalovatele v E.ON, v labu ✅ |
| Zadavatel rozbil dědičnost na položce v `ZadostiACL` (200) | autor nechápe proč (`extras2.jsonl` ř. 30) | zopakovat, zjistit oprávnění a zdroj přímého grantu |
| Schvalovatel s Edit u `ZadostiACL` „ne“ | důkaz 404 „Seznam neexistuje“ (`extras2.jsonl` ř. 28) | zopakovat s právem na list |
| Přímé čtení přílohy v prohlížeči s cookie | token dává 401 všem | Playwright pod zadavatelem |
| Přidání indexu na naplněný seznam nad prahem | neměřeno | nový sloupec s indexem na `Velky` |
| Limity ACL (5000 / 50 000), lookup, přílohy 250 MB, Cosmos free tier | jen 📘 | změřit, kde jde (ACL tvrdý limit ne) |
| Cesta C: `AadHttpClient` z SPFx proti tomuto API; mazání Správcem (200) | SPFx web part na toto API nenasazen; mazání se v doměření nezkoušelo | nasadit web part; opakovat s testovacími daty po výslovném ano (log volání a studený start jsou doměřeny ✅) |
| Kit `ppf-spfx-devkit` (vzor „list rozhodnutí + otisk“), `SPHttpClient` / PnPjs | kód z gitu, v labu nespuštěn | spustit pod schvalovatelem bez `CancelCheckout` |
| Dataverse (B) a Power Automate ACL (D) | licence / čeká na přihlášení připojení | viz sekce B a D |

## Znovupoužitelné nástroje (do tools/README.md doplní hlavní session)

| Nástroj | Co dělá | Příklad |
|---|---|---|
| `tools/data-prava-token.py` | token pro lab uživatele přes ROPC (klient SPO Management Shell, jde i `--client`/`--resource` pro vlastní API); heslo z lab.secrets.json, nic se neukládá | `python3 tools/data-prava-token.py tomas.prochazka` |
| `tools/data-prava-sp.py` | SharePoint sonda práv: `setup` (skupiny, úrovně, listy), `matrix`, `extras`, `extras2`, `bulk` ($batch vkládání N položek), `threshold` | `python3 tools/data-prava-sp.py matrix --list ZadostiW` |
| `tools/data-prava-entra-api.py` | Entra appka s app rolemi + scope + přiřazení uživatelů + consent, idempotentně | `python3 tools/data-prava-entra-api.py` |
| `tools/data-prava-docker-push.sh` | lokální docker build amd64 + push do ACR, když ACR Tasks nejsou povolené (`TasksOperationsNotAllowed`) | `tools/data-prava-docker-push.sh acrppfroomsca3lbgs sondy/data-prava/api egd-sonda-data-api:0.1` |

Poznámky ke `data-prava-sp.py`: `setup` je idempotentní, ale `matrix` a `extras` vkládají nové položky při každém běhu. Přihlášení admina bere z m365 CLI (`HOME=~/.m365-osobni`).

## Soubory

- Tento dokument: `~/Projects/egd-workshop/sondy/data-prava.md`
- Surová měření: `~/Projects/egd-workshop/sondy/data-prava/` (`matrix.jsonl`, `matrix-ZadostiW.jsonl`, `extras.jsonl`, `extras2.jsonl`, `bulk.jsonl`, `threshold.jsonl`)
- Kód API: `~/Projects/egd-workshop/sondy/data-prava/api/` (`server.mjs`, `Dockerfile`)
