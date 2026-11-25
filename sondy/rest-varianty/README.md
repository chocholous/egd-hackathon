# Sonda: appka bez příkazů CLI `spo …` (REST, Graph, prohlížeč)

Cíl: když se CLI nepřihlásí (AADSTS65001, Conditional Access), jde appku nasadit jinak? Web `egd09-dev`, lab, pod `pavel.admin`.
Značky: ✅ změřeno · ❓ neověřeno. Pravidla sond: [../_zadani-spolecne.md](../_zadani-spolecne.md).

| Varianta | Výsledek | Důkaz |
|---|---|---|
| **REST `_api` s bearer tokenem** (token z `m365 util accesstoken get`, scope `AllSites.FullControl`) | ✅ seznam + indexy + unikátní `Klic`, nahrání `.sppkg` do katalogu, `Deploy` prošly (HTTP 200/201). `Install` vrátil 400 „instance už existuje“, tedy aplikace už na webu je. Past: CLI vypisuje token **v uvozovkách**, bez jejich odstranění SharePoint hlásí „invalid signature“. Stránka přes REST neověřena ❓ | `rest-token.log`, `sonda-rest-token.mjs` |
| **Azure CLI token** (`az account get-access-token --resource <SPO>`) | ✅ SharePoint ho odmítá (HTTP 401; token má jen `user_impersonation`, appId Azure CLI). Měřeno pod účtem, kterým je `az` přihlášený (`pavel.chocholous@gmail.com`, ne `pavel.admin`) | `az-token.log` |
| **Graph přes `az` token** | ✅ HTTP 403 na `/sites/…` (scopes jen Entra/Directory, žádné `Sites.*`) | `az-token.log` |
| **Graph PowerShell** (`Connect-MgGraph`, appId „Microsoft Graph Command Line Tools“ = stejný jako `mgc`; scopes `Sites.Manage.All`, `Sites.ReadWrite.All`, `Files.ReadWrite.All`, v labu už i `Sites.FullControl.All`) | ✅ **seznam + sloupce + index + unikátní `Klic` jedním voláním** (`columnDefinition.indexed`, `enforceUniqueValues`), ✅ nahrání `.sppkg` do knihovny katalogu (soubor `spokojenost-graph-sonda.sppkg` existuje), ✅ vytvoření stránky `graph-sonda.aspx` (prázdná). **Deploy a Install balíčku Graph nemá** 📘, takže po nahrání je nutné ještě volání SharePoint REST nebo klik „Nasadit“. `mgc` samotné není nainstalováno, SDK i CLI sdílejí appId i scopes ❓ | `sonda-graph.ps1`, `graph.log` (seznam, indexy), `graph-stav-rest.log` (seznam `SpokojenostGraph`, soubor `.sppkg` v katalogu a stránka `graph-sonda.aspx` skutečně existují) |
| **REST z přihlášené stránky v prohlížeči** (cookie + `X-RequestDigest`, bez tokenu a bez registrace aplikace), profil `rest-sonda` přihlášený ručně jako `pavel.admin` | ✅ celá cesta: seznam + sloupce + indexy + unikátní `Klic` (zpět ověřeno), nahrání `.sppkg`, `AvailableApps`, `Deploy` (HTTP 200). `Install` a stránka v téhle sondě ❓ nezkoušeny (jsou v sondě s tokenem, resp. přes Graph). Pod rolí Člen ❓ neměřeno | `sonda-rest-prohlizec.mjs`, `rest-prohlizec.log` |

## Nová appka (nové GUIDy) celá přes REST z prohlížeče (23. 11., `pavel.admin`, `egd09-dev`)

✅ `rest-prohlizec-nova-appka.log`: balíček z `novy` + `build` (solution `c3b7740d…`, web part `fdb087f9…`) → upload (HTTP 200) → `Deploy` (200) → `Install` (200, tentokrát opravdu nová instalace) → web part se objevil v `GetClientSideWebParts` → stránka `spokojenost-b.aspx` přes `_api/sitepages/pages` (create 201, `savepage` 200, `publish` 200) → **appka se v prohlížeči vykreslila** (otázka, tlačítka 1–5, dashboard). Rozložení stránky zůstalo `Article`, protože jsem ho měnil špatným voláním (`MERGE` na `sitepages` vrátil 204 bez účinku); správně viz oddíl „Rozložení SingleWebPartAppPage“ níž. Pod rolí Vlastník a Člen neměřeno.

## Co z toho plyne (zatím bez doporučení do skillu)

- Registraci aplikace a souhlas správce nepotřebuje **jen** varianta „REST z prohlížeče“: jde pod přihlášením uživatele a platí jeho práva. U E.ON je to pravděpodobně jediná cesta, když CLI hlásí AADSTS65001. ❓ Ověřit pod Vlastníkem (`egd05`), kdyby se dal profil přihlásit.
- Graph a CLI/REST s tokenem potřebují appId s SharePoint scopes; v labu je má jen Graph Command Line Tools pod správcem. U E.ON ⛔ neznámé.
- Každá cesta kromě klikání potřebuje uživatelova práva k zápisu do katalogu webu (role Člen nestačí? ❓, viz TEST.md).

## Pod rolí Vlastník (`egd05`, 23. 11., web `egd05-dev`)

✅ `rest-prohlizec-egd05-vlastnik.log`: účet `egd05` (primární správce kolekce, Vlastník; přihlášen ručně do profilu `rest-sonda` → `egd05-sonda`) projel stejnou cestu jako správce: seznam + indexy + unikátní `Klic`, upload, `Deploy`, `Install` (200), web part v `GetClientSideWebParts`, stránka (create/savepage/publish 200), **vykreslení v prohlížeči** (otázka, tlačítka, dashboard). Bez tokenu, bez registrace aplikace, bez CLI, bez souhlasu správce. Rozložení se přepnulo až správným voláním (oddíl níž). ❓ Role Člen neměřeno (uživatel řekl, že Člena neřešíme). ⛔ E.ON: stejná cesta nemusí projít, pokud tamní politika zakazuje nahrávání do katalogu webu nebo skripty na webu.

## Rozložení SingleWebPartAppPage přes REST (23. 11., `egd05-dev`, Vlastník)

✅ `rest-layout-egd05.log`, `sonda-rest-layout.mjs`: `PageLayoutType` je pole položky v knihovně SitePages a nastavuje se stejně jako v CLI (`spo page set --layoutType`, zdroj `page-set.js`): `POST /_api/sitepages/pages(<id>)/checkoutpage` → `POST /_api/web/GetList('<web>/SitePages')/items(<id>)/ValidateUpdateListItem` s `{"formValues":[{"FieldName":"PageLayoutType","FieldValue":"SingleWebPartAppPage"}],"bNewDocumentUpdate":true}` → `POST /_api/sitepages/pages(<id>)/publish`. Před: `Article`, po: `SingleWebPartAppPage`, stránka se vykreslí bez titulku a rámu stránky (jen obsah appky). `savepage` po přepnutí vrátil 409 (editační relace skončila), nevadí, publikace prošla. Můj dřívější pokus přes `MERGE` na `/_api/sitepages/pages(<id>)` byl špatné volání, ne omezení SharePointu.

## Závěrečný běh cesty A3 od nuly (23. 11. 10:47, `egd05-dev`, Vlastník)

✅ `rest-prohlizec-egd05-final.log`: balíček čerstvě z `novy` + `build` (poslední verze `appka.mjs`, nové GUIDy `d3e14232…`/`79aee750…`) → upload → `Deploy` → `Install` (200) → web part v `GetClientSideWebParts` → stránka `spokojenost-c.aspx` (create, savepage, checkoutpage, `ValidateUpdateListItem` 200, publish) → rozložení zpětně `SingleWebPartAppPage` → vykreslení v prohlížeči. V logu je jedno `ERR layout zpet` (špatný název lokalizované knihovny v mém čtení, skript opraven na `GetList('<web>/SitePages')`; rozložení jsem ověřil zvlášť posledním řádkem logu).

Poznámka k `rest-prohlizec-egd05-final.log`: řádek `ERR layout zpet` pochází z chybného názvu knihovny v mém čtení (skript potom opraven na `GetList('<web>/SitePages')`); zpětné čtení rozložení (`PageLayoutType: SingleWebPartAppPage`) je jeho poslední řádek, získaný samostatným dotazem po opravě. Cesta A3 běžela pod `egd05`, který je správce kolekce (`IsSiteAdmin: true`); „Vlastník“ tu znamená právě to. Člen ❓.
