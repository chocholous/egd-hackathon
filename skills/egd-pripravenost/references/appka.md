# Poslední krok: postav appku „Spokojenost“ na DEV webu

Zadání: [../ZADANI-appka.md](../ZADANI-appka.md). Značky: ✅ změřeno v labu (macOS, CLI 12, Node 22, web
`egd01-dev`, nasazení pod `pavel.admin`) · 📘 dokumentace · ❓ neověřeno (Windows, E.ON, přihlášení účastníka).

Všechno dělá `scripts\appka.mjs` (`<A>` = úplná cesta k němu, vedle `pripravenost.mjs`), spouštěný **z téže
pracovní složky** jako `pripravenost.mjs` (kde je `.pripravenost` a `node_modules` s CLI). Pojistky ze SKILL.md platí:
jen web, který uživatel uvedl, jen jeho katalog aplikací, zápis až po „ano“, nic se nemaže, přihlášení dělá člověk.

## Cesta A (CLI přihlášené, katalog na webu je)

| # | Krok | Příkaz | Kdo |
|---|---|---|---|
| 1 | Projekt ze šablony `templates\spokojenost` + balíčky (stovky MB, minuty) | `node "<A>" novy` | agent |
| 2 | Build `.sppkg` | `node "<A>" build` | agent |
| 3 | Seznam `SpokojenostHodnoceni` + indexy: plán → „ano“ → zápis | `node "<A>" seznam --web <web>` → `... --ano` | člověk schválí |
| 4 | Nasazení do katalogu webu + stránka: plán → „ano“ → zápis | `node "<A>" nasadit --web <web>` → `... --ano` | člověk schválí |
| 5 | Kontrola (jen čtení) a ověření v prohlížeči | `node "<A>" over --web <web>` | agent + člověk |

Složka projektu je `spokojenost-appka`, stránka `spokojenost.aspx` (volby `--slozka`, `--stranka`).
Seznam má sloupce `Hodnoceni` (číslo 1–5), `DenCislo` (RRRRMMDD, **indexovaný**), `Klic` (`uživatel|den`,
**indexovaný a unikátní**) ✅. Skript po zápisu čte zpět a kontroluje indexy (jinak končí chybou).

Ověření (člověk, vždy): otevře `<web>/SitePages/spokojenost.aspx?env=WebView`, sám klikne na 1–5 → uvidí
„Děkujeme“, tlačítka se zamknou, dashboard ukáže jeho hlas. Obnoví stránku (F5): hodnocení zůstane.
Pak spusť `over` znovu: v seznamu je jeho položka. Přihlašování v prohlížeči za něj nedělej. `rc=0` ani `[OK]` nestačí.

Nová verze po úpravě kódu: zvyš verzi v `config\package-solution.json` (`1.0.0.0` → `1.0.0.1`), `build`,
`nasadit --ano` (dělá `upgrade`) ✅.

## Cesta A2 (CLI se nepřihlásí: appId, AADSTS65001, Conditional Access)

`novy` a `build` projdou stejně; seznam a nasazení udělá člověk v prohlížeči ❓ (české popisky se mohou lišit).
Výsledek je stejná appka. Čeká se tím na appId pro CLI (věty ve `references\prihlaseni.md`).

1. **Seznam:** na webu Nový → Seznam → Prázdný seznam, název `SpokojenostHodnoceni`. Sloupce přidávej s názvy
   **bez diakritiky a bez mezer, přesně takto; je to pravidlo, ne doporučení** (interní název vzniká z názvu při založení a pozdější přejmenování ho nezmění; z „Komentář schvalovatele“ vznikne zakódovaný a zkrácený `Koment_x00e1__x0159__x0020_schva`, takže kód musí používat ten, ne `Komentar` ✅, v názvu seznamu diakritika z adresy zmizí a mezery zůstanou ✅, zdroj: lab, sonda skillu `egd-data-seznamy`; popisek s diakritikou jde nastavit až po založení):
   `Hodnoceni` (Číslo, min 1, max 5, 0 desetinných míst), `DenCislo` (Číslo, 0 desetinných míst) a
   `Klic` (Jeden řádek textu). Obě poslední jsou povinné.
2. **Indexy (povinné kvůli limitu 5000):** Nastavení seznamu → **Indexované sloupce** → Vytvořit nový index →
   `DenCislo`; znovu → `Klic`. U `Klic` v nastavení sloupce zapni **Vynutit jedinečné hodnoty** (Enforce unique
   values; je to dostupné až po indexu).
3. **Balíček** `spokojenost-appka\sharepoint\solution\spokojenost-appka.sppkg` nahraj do `<web>/AppCatalog`
   (Nahrát → Nasadit). „Přístup odepřen“ = chybí role Člen/Vlastník na webu.
4. **Obsah webu → Nový → Aplikace** → „spokojenost-appka-client-side-solution“ → Přidat.
5. **Stránka:** Nový → Stránka (prázdná, „Spokojenost“) → sekce Celá šířka → **+** → „Spokojenost s prostředím
   kanceláře“ → Publikovat. Odkaz s `?env=WebView` schová rám SharePointu ✅.

## Cesta A3 (CLI se nepřihlásí, ale prohlížeč ano: REST `_api`)

Dělá totéž co cesta A, jen **bez CLI**: požadavky `_api` posílá přihlášená stránka SharePointu v prohlížeči (cookie + `X-RequestDigest`
z `POST <web>/_api/contextinfo`). Neřeší AADSTS65001, protože nepotřebuje registraci aplikace ani souhlas správce; platí práva
přihlášeného uživatele. ✅ v labu (23. 11.) pod správcem i pod `egd05` (Vlastník) na nové appce: seznam + indexy, nahrání do katalogu,
`Deploy`, `Install`, stránka, vykreslení. ❓ role Člen, ⛔ E.ON, ❓ Windows. Agent musí mít přihlášený profil prohlížeče
(přihlašuje člověk) a umět v něm spustit JavaScript (Playwright, nebo člověk v konzoli F12 na stránce webu).

**Jak správná volání poznáš:** CLI 12 leží po `cli-instalace` v `node_modules\@pnp\cli-microsoft365\dist\m365\spo\commands\`
(např. `page\page-set.js`, `app\app-deploy.js`) a je čitelné jako obyčejný JavaScript. Když potřebuješ jiný krok, **přečti tam,
co příkaz `spo …` posílá**, a udělej totéž z prohlížeče. Neodhaduj volání z paměti: moje první „změna rozložení“ vrátila 204 a nic neudělala.

Ověřená volání (základ `<web>`, hlavičky `Accept: application/json;odata=nometadata`, `X-RequestDigest`, u zápisu `Content-Type` stejný):

| Krok | Volání |
|---|---|
| seznam | `POST /_api/web/lists` `{"Title":"…","BaseTemplate":100}` |
| sloupec + index + unikát | `POST /_api/web/lists/getbytitle('…')/fields/createfieldasxml` `{"parameters":{"SchemaXml":"<Field … Indexed=\"TRUE\" EnforceUniqueValues=\"TRUE\" />","Options":8}}` |
| nahrání balíčku | `POST /_api/web/getfolderbyserverrelativeurl('<cesta webu>/AppCatalog')/files/add(url='x.sppkg',overwrite=true)` (tělo = bajty, `application/octet-stream`) |
| nasazení, instalace | `POST /_api/web/sitecollectionappcatalog/AvailableApps/GetById('<id řešení z package-solution.json>')/Deploy` (tělo `{"skipFeatureDeployment":false}`), potom `…/Install` |
| čekání na web part | `GET /_api/web/GetClientSideWebParts`, hledat id web partu (až desítky sekund po instalaci) |
| stránka | `POST /_api/sitepages/pages` `{"PageLayoutType":"Article","Title":"…"}` → `…/pages(<id>)/savepage` `{"CanvasContent1":"<JSON web partu>"}` |
| celostránkové rozložení | `POST …/pages(<id>)/checkoutpage` → `POST /_api/web/GetList('<cesta webu>/SitePages')/items(<id>)/ValidateUpdateListItem` `{"formValues":[{"FieldName":"PageLayoutType","FieldValue":"SingleWebPartAppPage"}],"bNewDocumentUpdate":true}` → `POST …/pages(<id>)/publish` |

Pasti: `Install` vrátí 400 „instance už existuje“, je-li appka na webu; `MERGE` na `/_api/sitepages/pages(<id>)` rozložení **nemění**
(vrací 204); po `ValidateUpdateListItem` vrací `savepage` 409, publikace přesto projde. Kontrola: otevři `<web>/SitePages/<stránka>?env=WebView`.
Stejná volání jdou i s bearer tokenem z `m365 util accesstoken get` (CLI ho **vypisuje v uvozovkách**, odstraň je), ale token chce tutéž
registraci jako CLI, takže u AADSTS65001 nepomůže. Graph (`Sites.*`) zvládne seznam, sloupce, soubor v katalogu a stránku ✅, **ne** Deploy a Install balíčku 📘 (v dokumentaci Graphu endpoint není, v labu nezkoušeno).

## Cesta B (bez kódu: nejde npm, Node ani katalog)

Seznam `Spokojenost` (sloupce výše) a v něm vlastní pohled: seskupit podle `DenCislo`, ve souhrnu
Průměr u `Hodnoceni`, a formát sloupce `Hodnoceni` jako číselník. Dashboard jako stránka s web partem
**Seznam** (pohled) a graf z Power BI / Excelu až ve zkušebním čase ❓. Neslibuj tlačítka 1–5 bez kódu.

## Limit 5000 položek (platí i při vlastních úpravách)

Dotaz s `$filter` nebo `$orderby` na sloupec **bez indexu** SharePoint nad 5000 položkami zamítne (500) ✅ v sondě v labu. Appka proto filtruje a řadí jen `DenCislo`, čte po 1000 řádcích (`nextLink`) a bere
posledních N dní (výchozí 14). Datum je číslo `RRRRMMDD`, protože kalendářní sloupec posouvá časová pásma ❓ (pozorování
v sondě chybí). Unikátní `Klic` zajišťuje „jednou za den“ na straně SharePointu ✅ (druhý zápis se stejným klíčem
vrátil „Tato hodnota již v seznamu existuje“). Seznam zakládej a indexy dělej **dokud je prázdný**; index na seznamu nad
prahem často selže 📘.

## Když se něco pokazí

| Hláška | Co dělat |
|---|---|
| `403` / `Přístup odepřen` u katalogu | role Člen/Vlastník na webu (věta pro IT v `SKILL.md`, krok „Objednávky předem“) |
| `Katalog aplikací ... neexistuje` | web nemá katalog → e-mail na sharepoint@eon.com (Product Team), mezitím cesta B |
| `There is no available WebPart with Id` | propagace po instalaci, ne práva ✅: skript čeká sám, jinak za pár minut znovu `nasadit --ano` |
| `Invalid column 'undefined'` / `Invalid section '1'` | stránku smaž v prohlížeči (Obsah webu → Stránky), pak `nasadit --ano` |
| `sloupce nejsou indexované` | zapni index v Nastavení seznamu (A2, krok 2) |
| `Unsupported engine`, `Node` červeně | portable Node 22+ (`references\windows.md`) |
| `AADSTS65001` u přihlášení | cesta A3 (REST z prohlížeče) nebo A2 + věta o souhlasu v `references\prihlaseni.md` |
| `running scripts is disabled` | volej jen `node "<A>" ...` |
| v appce „Seznam ... není“ | `seznam --web <web> --ano`, nebo název v nastavení web partu |
