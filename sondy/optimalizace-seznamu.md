# Sonda: optimalizace SharePoint seznamů pro velká data (limit 5000, až 30 mil. položek)

Otázka: jak má SPFx appka nad SharePoint seznamem zůstat rychlá a funkční, když seznam unese až 30 mil. položek, ale dotazy narážejí na limit 5000 (list view threshold)?
Měřeno v labu (tenant `pavelchocholousgmail`) 2026-11-22, SharePoint Online, Graph v1.0. Značky: ✅ změřeno v labu · ❓ neověřeno (důvod uveden). Podle kánonu nestojí žádné doporučení na 📘.
Navazuje na [data-prava.md](data-prava.md) (oddíl Limity, 6000 položek) a skill [egd-data-seznamy](../skills/egd-data-seznamy/SKILL.md). Samotné indexy (přidání nad 5000, složený index, typy sloupců, max. 20) měří session miniskilly, zde se neopakují.

## Shrnutí: 5 nejdůležitějších zjištění

1. ✅ **Limit 5000 se nedá vypnout ani obejít právy.** `QueryThrottleMode="Override"` pod vlastníkem webu vrací 500, vlastnost `EnableThrottling` na seznamu v SPO REST neexistuje, hlavička `Prefer: HonorNonIndexed…` v SP REST nepomůže (500), uživatel i vlastník webu se chovají stejně (46 + 30 testů shodných pod oběma). Limit se obchází jen tak, že dotaz **nesahá na víc než 5000 řádků**: indexovaný filtr s malým výsledkem, rozsah podle `ID`, nebo prohledání po částech.
2. ✅ **`RenderListDataAsStream` s neindexovaným filtrem NEHLÁSÍ chybu, ale tiše prohledá jen prvních 5000 položek** (hledaná položka s ID ≤ 5000 se najde, s ID ≥ 5001 ne, status 200 a 0 řádků). Správně jde jen s `RowLimit Paged="TRUE"` a následováním `NextHref` (3 stránky ≈ 1 s pro 12 000 položek). Stejný nebezpečný zdroj „zdánlivě fungujícího“ dotazu je `GetItems` bez stránkování: ten naopak vrací 500, takže je bezpečnější.
3. ✅ **Nejrychlejší čtení velkého seznamu je paralelní čtení po rozsazích `ID`** (`$filter=ID ge a and ID lt b`, `$top=1000`): 12 000 položek za 0,57 s (8 vláken) proti 7,1 s sekvenčně přes `nextLink`. `$skip` SharePoint ignoruje (vrátí zase první stránku). Stránkování přes `nextLink` s `$orderby=Created` při souběžném zápisu **ztratilo 2 z 600 řádků**, s `$orderby=ID desc` ne.
4. ✅ **Pro opakované načítání nepatří appce znovu číst vše: změnový token + lokální cache.** `GetChanges` od uloženého tokenu vrátil 8 změn za 0,46 s, dočtení změněných položek celkem 0,76 s (proti 2,6 s na plné načtení 12 009 položek); cache po synchronizaci 100 % souhlasila se serverem. HTTP cache nepomůže: kolekce položek má `Cache-Control: private, max-age=0` a žádný ETag.
5. ✅ **Počty a součty bez stažení položek jdou jen s indexovaným filtrem:** `RenderListDataAsStream` s `<Aggregations>` (SUM/COUNT/AVG/MAX/MIN, GroupBy) dal správný výsledek za 0,2 – 0,4 s, ale bez filtru nebo s filtrem nad 5000 shod vrací 500. Celkový počet seznamu je `ItemCount` (0,17 s). Search je pro agregace nespolehlivý (`TotalRows` je odhad: 200 místo 6001) a **indexace je pomalá a nerovnoměrná**: nová položka po 96 s, úprava po 630 s, druhá nová položka po 441 s ještě ne; po 100 minutách bylo z 12 012 hromadně vložených položek v indexu 2 492.

## Prostředí a metoda

| Co | Hodnota |
|---|---|
| Web | `https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-optimalizace` (Communication site, vlastní pro tuto sondu) |
| Hlavní seznam `Velky` | 12 000 položek při založení (dnes 12 012 po měřeních změn), sloupce `Kategorie` (K00–K19), `Castka` (0–999), `Stav`, `Datum`, `Oddeleni` – **indexované**; `Neindexovano` – **bez indexu**. Indexy založeny na prázdném seznamu. Pozn. ✅ `Modified` je indexovaný ve výchozím stavu, `Created`, `Author`, `Title`, `ContentType` ne, `ID` se chová jako indexované (`indexed-pole.json`). |
| Vložení 12 000 položek | REST `$batch` po 100 v changesetu, 4 paralelně: 313,6 s = 38 položek/s (`fill-velky.jsonl`) |
| Další seznamy | `Slozky` (7200 položek ve 3 složkách S1–S3 po 2400), `Archiv` (1000), `Zapis` (zápisy), `Lag` (zpoždění Search), `Zadosti` (ReadSecurity=2), `Soucty` (čítače) |
| Uživatelé | admin = vlastník (`pavel.admin`, token z m365 CLI); `tomas.prochazka` (Návštěvníci, pak i Členové), `jakub.kucera` (Členové); stejné výsledky dotazů pod adminem i `tomas` |
| Čas | průběžně ve vteřinách jednoho volání (`urllib`, jedno spojení na volání), z Macu v Evropě. 429/503 se opakují podle `Retry-After`; v `rest.jsonl` žádné opakování nebylo |
| Surová data | `sondy/optimalizace/*.jsonl` (viz [Soubory](#soubory)) |

## Přehled metod

Náročnost pro citizen developera: **nízká** = jedna URL s `$filter`/`$select`; **střední** = vlastní helper (stránkování, rozsahy, cache); **vysoká** = vlastní backend / práva v tenantu.

| Metoda | Co řeší | Změřené chování (čas, chyba) | Pro | Proti | Náročnost |
|---|---|---|---|---|---|
| REST `$filter` na **indexovaný** sloupec (méně než 5000 shod) | filtr nad velkým seznamem | ✅ 600 z 12 000: 0,20 s, 200 | nejjednodušší, `$select` v URL | více než 5000 shod → 500 i s `$top=100` (`Castka ge 0`, `Castka lt 500`) | nízká |
| REST `$filter` na **neindexovaný** sloupec | – | ✅ 500 „překračuje mezní hodnotu“ i s `$top=10`; `Created` taky | – | nejde, jedině s indexovaným filtrem navíc: `Kategorie eq 'K01' and Neindexovano eq 'N1'` → 200 za 0,2 s (v libovolném pořadí) | nízká |
| REST `$orderby` | řazení | ✅ indexované (`Castka`, `Datum`, `Modified`, `ID`): 0,2–0,7 s; `Created`, neindexovaný: 500; indexovaný filtr + `Created`/neindexovaný `$orderby`: 200 (0,3–0,4 s) | `ID desc` = „nejnovější první“ | `Created` nelze samostatně | nízká |
| REST `$top` | velikost stránky | ✅ `$top=5000` OK (0,41 s), `$top=5001` → 500 | – | vyšší `$top` nikdy | nízká |
| REST `$skip` | přeskočení | ✅ **ignoruje se** (`$skip=5000` vrátí ID 1–100) | – | nepoužít | – |
| REST `nextLink` / `$skiptoken` | stránkování celého seznamu | ✅ 12 stránek po 1000 = 12 000 řádků za 7,1 s (seřazeno podle `Castka` 7,7 s, `Datum`/`Modified` 3,0 s); ručně složený `$skiptoken=Paged=TRUE&p_ID=5000` funguje | funguje i nad 5000 | sekvenční (každá stránka čeká na předchozí); s `$orderby=Created` ztráta 2 z 600 řádků; filtr s >5000 shodami pořád 500 | střední |
| REST rozsahy `ID` paralelně | rychlé načtení všeho | ✅ 1 vlákno 7,0 s, 4 vlákna 0,84 s, 8 vláken 0,57 s (12 000 řádků); `ID gt 10000` s `$top=5000` OK | nejrychlejší, žádné ztráty, nezávislé na limitu | musí se znát maximum `ID` (`$orderby=ID desc&$top=1`); u řídkého ID zbytečné prázdné dotazy | střední |
| REST operátory | jiné filtry | ✅ `startswith`, `substringof` nad indexovaným sloupcem s 600 shodami OK (0,15–0,2 s); `ne` (>5000 shod) 500; **`or` přes dva indexované sloupce 500**; `or` přes jeden sloupec `ID` (30 hodnot) OK | – | `or`/`ne` nepoužít | nízká |
| CAML přes `GetItems` | složitější podmínky | ✅ RowLimit 1000: 0,42 s; 5000: 0,98 s; 5001 a `Paged` 6000: 500; neindexovaný Where: 500; indexovaný Where: 0,32 s; `QueryThrottleMode="Override"`: 500 i pro vlastníka; `Scope=RecursiveAll` 5000: OK 0,9 s | stejná pravidla jako REST | **nevrací `nextLink`**; stránkuje se jen ručním `ListItemCollectionPosition.PagingInfo = "Paged=TRUE&p_ID=<poslední ID>"` (12 stran, 12 000 řádků, 4,6 s) | střední |
| `RenderListDataAsStream` | stránkování a agregace | ✅ RowLimit 1000: 1,0 s; 5000: 3,4–3,9 s (3–4× pomalejší než `GetItems`, 8× než REST); 5001 → 500; `NextHref` po 1000: 12 000 řádků za 6,6 s; **neindexovaný filtr nechyboval, ale prohledal jen prvních 5000 (viz níž)** | jediná cesta k `<Aggregations>` a `GroupBy`; stránkuje `NextHref` i při prázdné stránce | **tiché ořezání výsledků u neindexovaného filtru bez `Paged`**; těžší odpověď (hodnoty jsou formátované řetězce, např. `298 200` s pevnou mezerou) | střední |
| `RenderListDataAsStream` + `RowLimit Paged="TRUE"` + `NextHref` u neindexovaného filtru | hledání bez indexu | ✅ 4 hledání (ID 2803, 5593, 10 914, neexistující): správně nalezeno / nenalezeno, 3 stránky, 0,9 – 1,2 s | úplný výsledek bez indexu | čas roste lineárně s velikostí seznamu: 0,33 s na každých 5000 prohledaných řádků. Extrapolace na 30 mil. = ~6000 stránek ❓ neměřeno | střední |
| **Search** `/_api/search/query` | fulltext, filtr přes managed properties nad celým webem/seznamy, security trimming | ✅ viz [Search](#c-search-api). Výrazná zpoždění indexace, `TotalRows` jen odhad, číselné rozsahy na `…OWSNMBR` vrací 0, refinery jen vestavěné | bez limitu 5000, ořezává práva, fulltext | indexace minuty až hodiny, ne jako zdroj pravdy pro editaci | střední |
| **Graph** `/sites/{id}/lists/{id}/items` s `$expand=fields` | čtení z Graphu (SPFx `MSGraphClient`) | ✅ viz [Graph](#d-microsoft-graph). Neindexovaný filtr s hlavičkou `Prefer` projde a je úplný, **ale stránky mohou být prázdné s `@odata.nextLink`**; indexovaný filtr nad 5000 shod projde po stránkách (12 002 řádků) | úplný výsledek i nad limitem, `delta` | pomalejší než SP REST (13 stránek 7,5–10 s, `delta` 19 s); `$count` nepodporován; potřebuje `Sites.*` oprávnění | střední až vysoká |
| Změnový token `GetChanges` | inkrementální načtení | ✅ 8 změn: 0,46 s; vrací max. 1000 změn/volání (bez tokenu první stránka 1000 změn za 0,3 s) | tisíckrát méně dat než plné načtení | cache a slučování v appce; token není v UI | střední |
| `GetListItemChangesSinceToken` | totéž, XML | ✅ s tokenem a 1 změnou 3,7 kB, 0,21 s; bez tokenu s `RowLimit=100` 364 kB (všechny sloupce), `RowLimit=5000` 15,9 MB / 2,2 s; 6000 → 500 | vrací i `ListItemCollectionPositionNext` | XML, bez `ViewFields` těžké; zastaralé API | vysoká |
| Graph `delta` | totéž v Graphu | ✅ první plné načtení 12 002 řádků v 61 stránkách 19,4 s; `delta?token=latest` + 2 změny → 2 řádky za 0,29 s | oficiální, čistý model | pomalé první načtení, `Sites.*` | střední až vysoká |
| REST `$batch` pro zápis | rychlý zápis | ✅ 100 položek: sekvenčně 28–35 s, 4 vlákna 6,7–7,1 s, jeden batch 8,4–9,2 s, **4 batche paralelně (400 položek) 9,1–10,0 s = 40 položek/s**; `MERGE` v batchi se píše jako metoda `PATCH` s `IF-MATCH: *` (`X-HTTP-Method` v batchi nefunguje) | nejrychlejší hromadný zápis | changeset je atomický: jedna chyba zruší celých 100 | střední |
| Graph `$batch` (20) | zápis přes Graph | ✅ 20 položek 0,57 s proti 7,8 s po jedné | – | max. 20 v dávce, uživatel s právem zápisu | střední |
| Rozdělení do složek | obejít limit v jednom seznamu | ✅ složka s 2400 položkami v seznamu se 7200: **neindexovaný filtr + řazení podle `Created` v rámci složky OK** (0,19 s GetItems, 1,6 s RLDAS); celý seznam rekurzivně: 500 | limit platí na složku, ne na seznam | nutno znát cestu složky; rekurzivní dotaz nad víc složkami 500; ztíží se práva | střední |
| Více seznamů / archivní seznam | oddělit živá data od historie | ✅ seznam do 5000 položek bez indexů funguje (stejné chování jako složka); kopie 1000 položek do `Archiv` 28 s (35 pol/s); mazání ze zdroje neměřeno (kánon „nic nemazat“) ❓ | nejjednodušší model, žádný limit na dotaz | dotazy přes víc seznamů = víc volání / Search; přesun = dvojí zápis | střední |
| Souhrnný seznam (čítač) | počty bez čtení položek | ✅ souběh 8 vláken, 20 přírůstků: naivně 3 z 20, s ETagem a opakováním při 409/412/500 **20 z 20** (77 neúspěšných pokusů) | O(1) čtení | při souběhu mnoho kolizí; konzistenci musí hlídat appka | střední až vysoká |
| Cache v appce (IndexedDB) + token | opakované načtení | ✅ `optimalizace-sync.py`: první načtení 2,6 s (12 009 položek, 1,6 MB), inkrement 0,76 s, kontrola 0 neshod | appka se zdá okamžitá | smazání položky se do cache dostane jen přes `ChangeType=3` (větev nemohla být měřena, nic nemažeme ❓) | střední |
| `$select` + `odata=nometadata` + gzip | velikost odpovědi | ✅ 1000 položek: bez `$select` 553 kB, s `$select` 3 sloupců 53 kB (nometadata), 245 kB (minimalmetadata), 307 kB (verbose), 3,6 MB (verbose bez `$select`); gzip 53 kB → 11 kB | trivialní | `SPHttpClient` posílá výchozí `odata=verbose`, je nutné nastavit hlavičku | nízká |

## A) Dotazy REST: co obejde limit 5000 a co ne

Zdroj: `sondy/optimalizace/rest.jsonl` (stejné statusy pod adminem i `tomas.prochazka`: `rest-tomas.jsonl`).

**Obejde:** (1) filtr na indexovaný sloupec s méně než 5000 shodami; (2) čtení po rozsazích `ID` (✅ i `ID gt 0` s `$top=100` se 12 000 shodami vrátí stránku, `Castka ge 0` se 12 000 shodami ne); (3) indexovaný filtr v kombinaci s neindexovaným filtrem nebo řazením, pokud indexovaný filtr zúží na méně než 5000; (4) složka s méně než 5000 položkami; (5) `Modified` jako řazení (je indexovaný od výrobce).

**Neobejde:** `$top` > 5000; filtr na neindexovaný sloupec samostatně; `$orderby` na neindexovaný sloupec (`Created`, `Neindexovano`); indexovaný filtr s více než 5000 shodami; `or` přes dva sloupce; `ne`; `QueryThrottleMode=Override`; `EnableThrottling` (vlastnost neexistuje, `enablethrottling.jsonl`).

Pasti, které vypadají jako výhra: ✅ `$skip` je ignorován (vrací zase první stránku, takže smyčka s `$skip` se zacyklí); ✅ stránkování přes `nextLink` podle `$orderby=Created` při souběžných zápisech ztratilo 2 z 600 řádků (`nextlink-razeni.jsonl`; token nese čas na sekundy, položky vložené v téže sekundě paralelně nemají pořadí podle `ID`). Stránkuj podle `ID` (nebo indexovaného sloupce s unikátními hodnotami).

### CAML a `RenderListDataAsStream` (`caml.jsonl`)

- `GetItems`: stejná pravidla jako REST, `RowLimit` max 5000. ✅ **Odpověď nemá `nextLink`**: pro další stránku je nutné poslat `ListItemCollectionPosition.PagingInfo` = `Paged=TRUE&p_ID=<poslední ID>`; 12 stránek po 1000 = 12 000 řádků za 4,6 s.
- `RenderListDataAsStream` je pomalejší na stejný počet řádků (5000: 3,4–3,9 s proti 0,98 s `GetItems` a 0,41 s REST), ale **stránkuje přes `NextHref`** a jako jediné umí agregace.
- ✅ **Tichá chyba**: s neindexovaným `Title` filtrem a bez `Paged` vrací 200 a hledá jen v prvních 5000 položkách:

| Hledané ID | RLDAS bez `Paged` | `GetItems` | RLDAS `Paged` + `NextHref` |
|---|---|---|---|
| 1, 2803, 4802, 4990, 5000 | nalezeno | 500 | nalezeno |
| 5001, 5010, 5100, 5200, 5400, 10 914 | **0 řádků, status 200** | 500 | nalezeno (3 stránky, 1,0–1,2 s) |

Pro appku z toho plyne pravidlo: **nikdy nedůvěřuj prázdné odpovědi RLDAS u neindexovaného filtru**, vždy `Paged="TRUE"` a dočti `NextHref` do konce.

## B) Stránkování celého seznamu (12 000 řádků, `stranky.jsonl`)

| Způsob | Čas |
|---|---|
| REST `nextLink` po 1000 | 7,13 s (12 stran) |
| RLDAS `NextHref` po 1000 | 6,59 s |
| REST rozsahy `ID` po 1000, 1 vlákno | 7,03 s |
| REST rozsahy `ID`, 4 vlákna | 0,84 s |
| REST rozsahy `ID`, 8 vláken | 0,57 s |
| REST `$top=5000` jedním voláním | 0,61 s (jen první polovina; 12 000 nejde jedním) |
| Graph `nextLink` po 999 s `$expand=fields` | 9,99 s (13 stran, 12 002 řádků) |
| Graph `delta` plné načtení | 19,37 s (61 stran) |

## C) Search API

Měřeno na webu `egd-sonda-data-prava` (seznam `Velky`, 6000 položek, plně v indexu) – čtení; na mém webu se zápisy do indexu neprojevily včas, viz zpoždění. (`search-dotazy.jsonl`, `search-prava.jsonl`, `search-lag.jsonl`.)

**Dotaz nad velkým seznamem bez limitu 5000** ✅: `path:"…/Lists/Velky"` vrací stránky po 500 (maximum `rowlimit` je 500: `rowlimit=1000` vrátilo 500). Celých 6001 řádků po 12 stranách = 16,2 s (1,35 s na stránku, 2× pomalejší než REST). `startrow=5000` a `5500` fungují. Deep paging nad 50 000 ❓ (v seznamu je jen 6000 položek, `startrow=49500` vrací 0 řádků po 2,5 s).

**Filtr přes automatické managed properties** ✅: ze sloupců vznikají vlastnosti `KategorieOWSTEXT`, `CastkaOWSNMBR`… Rovnost funguje: `KategorieOWSTEXT=K1` → 300 řádků, `CastkaOWSNMBR=4588` → 1 řádek; `KategorieOWSTEXT:K1*` (předpona) dává 3300, tedy zachytí i `K10`–`K19`. **Číselné rozsahy na `CastkaOWSNMBR` (`>=`, `<=`, `>`, `<`, `..`) vždy vrátily 0** (8 variant na webu data-prava a `>=990` na mém webu) – nepoužitelné pro „Částka nad X“. Důvod ❓ (nejspíš textový typ managed property; vyžaduje schéma Search, které citizen developer mění jen přes admina).

**Počet** ✅ **`TotalRows` je odhad**: při `rowlimit=1` vrátilo 200, při `rowlimit=500` 5959, refiner `Author` hlásí 6001. Pro počet se Search hodí hrubě (refiner), ne jako přesná hodnota.

**Řazení** ✅: `sortlist` funguje na `Created`, `LastModifiedTime`; `Title` a `CastkaOWSNMBR` → 400 (nejsou řaditelné). **Refinery** ✅: vestavěné (`Author`, `ContentTypeId`, `LastModifiedTime`) vracejí počty; `KategorieOWSTEXT`, `CastkaOWSNMBR`, `RefinableString00` bez výsledků. Refinery nad vlastním sloupcem vyžadují mapování na `RefinableString` ve schématu Search (správce) ❓ neprovedeno (zásah do schématu).

**Práva (security trimming)** ✅ `search-prava.jsonl`, seznamy webu data-prava:

| Uživatel | `Zadosti` (RS=2/WS=2, 41 položek) | `ZadostiW` (RS=1, 6) | `ZadostiACL` (3, unikátní ACL) | `Velky` |
|---|---|---|---|---|
| admin (vlastník) | 41 | 6 | 3 | 5959 |
| `tomas` (zadavatel) | **3 (jen své)** | 6 | 2 | 5959 |
| `jakub` (zadavatel) | **3 (jen své)** | 6 | 2 | 5959 |
| `eva` (schvalovatel `CancelCheckout`) | 41 | 6 | 3 | 5959 |
| `petra` (správce) | 41 | 6 | 0 | 5959 |
| `lucie` (bez přístupu) | **403** (celý dotaz) | 403 | 403 | 403 |

Search tedy respektuje i `ReadSecurity=2` a unikátní ACL položky. (Dotazy vyhovují těm, které vidí SP REST: `data-prava.md`.)

**Zpoždění indexace** ✅ (`search-lag.jsonl`, `search-lag-1-prerusene.jsonl`; můj nový web, 2026-11-22):

- Nová položka v seznamu, který už je v indexu (`Lag`, položka 2): **objevila se po 96 s** (dotaz každých 30 s).
- Úprava téže položky (změna `Title`, hledá se nový token): **objevila se po 630 s (10,5 min)** (`search-lag.jsonl`).
- Druhá nová položka (`nova2`) zapsaná hned po tom: **po 441 s ještě nenalezena** (měření jsem ukončil, výsledek je „více než 7 minut“). Zpoždění tedy kolísá od 1,5 minuty do desítek minut.
- Hromadně vložených 12 000 položek (19:05 – 19:10) a ostatní nové seznamy: v indexu bylo z `Velky` 200 položek (kolem 19:27), 1 764 (~20:32), 2 010 (20:44) a 2 492 (20:48), tedy po ~100 minutách 2 492 z 12 012; `Zadosti` (7 položek), `Archiv` (1000) a `Soucty` 0, `Zapis` 440 z 1 740, `Slozky` 7 ze 7 208 a první položka v `Lag` (zapsaná 19:07) nebyla v indexu ani 100 minut po zápisu (dotazy 19:07 – 20:48). **Index se u nového webu s hromadným vložením dohání v řádu hodin, nespolehlivě.** Search proto nesmí být zdrojem pravdy ani pro čerstvě zapsaná data v appce (appka se po uložení musí opřít o `GetItemById`/REST).

## D) Microsoft Graph

Token: vlastní veřejný klient `egd-sonda-optimalizace-graph` (delegované `Sites.ReadWrite.All`, souhlas správce, vytvořen `tools/optimalizace-entra-graph.py`), ROPC pod `tomas.prochazka` (čtení) a `jakub.kucera` (zápis). Klient Teams (`d3590ed6…`) s `Files.*` seznam `Velky` **nevidí** (`The specified list was not found`, v seznamu listů jen Dokumenty): ✅ SPFx `MSGraphClient` potřebuje `Sites.*`, ne `Files.*`.

Zdroj: `graph-filtr.jsonl`, `graph-uplnost.jsonl`, `graph-stranky.jsonl`, `graph-delta.jsonl`, `graph-batch.jsonl`.

| Dotaz (Graph v1.0) | Bez `Prefer` | S `Prefer: HonorNonIndexedQueriesWarningMayFailRandomly` |
|---|---|---|
| `fields/Kategorie eq 'K01'` (indexovaný, 600) | 200 0,62 s | 200 0,54 s |
| `fields/Castka ge 0` (indexovaný, >5000 shod) `$top=100` | **200** 0,48 s, `nextLink` | 200 0,31 s |
| `fields/Neindexovano eq 'N1'` | **400** „not indexed… provide the header“ | **200** 0,47 s (100 řádků + `nextLink`) |
| `Kategorie eq … and Neindexovano eq …` | 400 | 200 0,50 s |
| `createdDateTime ge …` | 400 „Invalid request“ | 400 |
| `$orderby=fields/Castka` (indexovaný) | 200 1,1 s | – |
| `$orderby=lastModifiedDateTime desc` | – (neměřeno) | 200 0,36 s |
| `$orderby=createdDateTime desc` | **422** (limit) | 422 |
| `$top=999` s fields / `$top=5000` s fields | 200 0,96 s / 200 2,5 s | |
| `$count=true` | **400** „$count is not supported on this API“ | |

- ✅ **Indexovaný filtr s více než 5000 shodami Graph zvládne** (REST ne): po `nextLink` přečetl všech 12 002 řádků v 13 stranách za 7,4 s.
- ✅ **Hlavička `Prefer` umožní neindexovaný filtr a výsledek je po dočtení `nextLink` úplný**: `Neindexovano eq 'N1'` → 240 řádků (v ID až 11 878, tedy za hranicí 5000) ve 3 stránkách 0,95 s. Hledání jedné položky podle `Title` (neindexovaný): 1. stránka vrátí 0 řádků, ale **s `@odata.nextLink`**; po dočtení (3 stránky) se najdou všechny (ID 2803, 5593, 10 914), neexistující `Položka NEEXISTUJE` správně 0. Bezpečné pravidlo: **v Graphu čti vždy do konce `nextLink`, prázdná stránka nic neříká** (na rozdíl od RLDAS, které `NextHref` bez `Paged` nevrací vůbec).
- ✅ **Delta:** `delta?token=latest` (0,87 s) → po 1 přidání a 1 úpravě vrátila další volání deltaLinku 2 položky za 0,29 s. Plné první načtení přes `delta` 19,4 s (61 stran) je dvakrát pomalejší než `nextLink`.
- ✅ **`$batch` v Graphu:** 20 vložení 0,57 s (proti 7,75 s po jedné); pod `tomas` (Návštěvník) 403 `accessDenied`, takže práva SharePointu platí i v Graphu.
- ✅ Hlavička `Prefer` v **SP REST** nic nemění (500).

## E) Dělení dat: složky, víc seznamů, archiv, retence

Zdroj: `slozky.jsonl`, `archiv-kopie.jsonl`, `soucty.jsonl`.

**Složky** ✅ (`Slozky`: 7200 položek ve 3 složkách po 2400, `ItemCount` seznamu 7208, `Folder.ItemCount` 2400):

| Dotaz | Výsledek |
|---|---|
| `GetItems` v rámci složky S1, `RowLimit` 5000 | 200, 2400 řádků, 0,64 s |
| složka S1, neindexovaný filtr + `OrderBy Created` | 200, 48 řádků, 0,19 s |
| RLDAS `RootFolder=…/S1`, RowLimit 2000 / neindexovaný filtr + `Created` | 200, 1,9 s / 1,6 s |
| celý seznam `Scope="RecursiveAll"` RowLimit 5000 | 200, 5000 řádků, 0,96 s |
| celý seznam rekurzivně, neindexovaný filtr / `OrderBy Created` | **500** |
| celý seznam rekurzivně, indexovaný filtr | 200, 0,27 s |
| REST `$filter=FileDirRef eq '…/S1'` | **500** (`FileDirRef` není indexovaný) |

Složka tedy funguje jako **oddíl, ve kterém limit platí zvlášť**, takže se v ní dá filtrovat a řadit i bez indexu. Rekurzivní dotaz přes víc složek ale limit zase přinese. Pro EG.D: složka = rok nebo středisko (v rámci jedné složky pod 5000). Pozor ✅ na zakládání: složku je třeba zakládat jako položku seznamu (`AddValidateUpdateItemUsingPath`, `UnderlyingObjectType=1`, název v `FileLeafRef`); `rootfolder/folders/add()` složku vytvoří, ale nepoužitelnou pro položky (chyba „Hodnota adresy URL není platná“).

**Víc seznamů / archiv** ✅/❓: seznam do 5000 položek se chová bez indexů bez omezení (viz `data-prava.md`, `Slozky`). Kopie 1000 položek do seznamu `Archiv` přes `$batch` trvala 28 s (35 položek/s). Smazání zkopírovaných položek ze zdroje a koš jsem **neměřil** (pravidlo „nic nemazat“) ❓: v produkci ověřit, že hromadné mazání nad 5000 položek (a prázdnění koše) není blokováno limitem. Praktické schéma: aktivní seznam (do několika tisíc) + roční archivní seznamy; dotazy do archivu přes Search nebo přes `ID` rozsahy.

**Retence** ❓: Purview retention labels / policy pro SharePoint, které by položky mazaly nebo přesunuly, jsem v labu nezkoušel (potřebuje tenant s licencí a politiku; je to věc IT E.ON). Navrhované ověření: v E.ON tenantu nastavit label „smazat po N letech“ na seznam a ověřit, že položky zmizí a že dotaz po smazání nepadá.

**Souhrnný seznam (čítač)** ✅ `soucty.jsonl`: naivní „přečti, přičti, zapiš“ při 8 souběžných vláknech ztratilo 17 z 20 přírůstků; s `ETag` + opakováním při 409/412/500 vyšlo 20 z 20, ale za cenu 77 neúspěšných pokusů. Použitelné jen pro nízkou frekvenci zápisů.

## F) Výkon v appce

- ✅ **`$select` jen potřebné sloupce**: 1000 položek 553 kB bez `$select`, 53 kB s `$select=Id,Kategorie,Castka`; `odata=verbose` 307 kB (s `$select`) až 3,6 MB (bez). Nastav `Accept: application/json;odata=nometadata` (čas klesl z ~0,5 na 0,25 s). `gzip` zmenší 53 kB na 11 kB (prohlížeč ho řeší sám; `urllib` jen s hlavičkou).
- ✅ **HTTP cache nepomůže**: kolekce položek vrací `Cache-Control: private, max-age=0`, `Last-Modified`, žádný `ETag`, takže `If-None-Match` nelze použít; opakované volání trvá stejně (0,22 s). Položka (`items(10)`) má `ETag` (použitelný pro souběh, viz čítač).
- ✅ **Změnové tokeny** (`optimalizace-sync.py`): `CurrentChangeToken` přečíst **před** prvním čtením, pak `GetChanges` (max. 1000 změn na volání) a změněná ID dočíst `$filter=ID eq a or ID eq b …` (30 ID na dotaz, `or` přes sloupec `ID` funguje). Výsledek: první načtení 12 009 položek 2,6 s (1,6 MB v cache), po 3 nových a 5 upravených položkách inkrement 0,76 s, kontrola proti serveru 0 neshod. Cache pro prohlížeč = IndexedDB, mimo hlavní vlákno ❓ v prohlížeči neměřeno (skript simuluje souborem).
- ✅ **Graph `delta`** je ekvivalent pro Graph (viz výše). ❓ `GetListItemChangesSinceToken` nedoporučuji: XML s 3,7 kB na jednu změnu, ale 364 kB na 100 řádků při prvním volání.
- ✅ **Zápis**: jednotlivě 0,28–0,35 s/položka; 4 paralelní vlákna 14–15 položek/s; `$batch` 4×100 paralelně 40 položek/s (9–10 s na 400). `$batch` s `MERGE` musí použít metodu `PATCH`.
- ✅ Sekvenční cykly nad 20 voláními jsou při 0,2–0,6 s na volání pomalé (7 s pro 12 000 řádků); paralelní rozsahy `ID` jsou řádově rychlejší.
- ✅ 429: souběžné čtení 8 vláken ani zápisy 4 vlákna 429 nevyvolaly. První běh `rest` hned po dokončení hromadného vkládání vrátil 429 u 3 dotazů (výstup tohoto běhu se neuložil), po zavedení opakování podle `Retry-After` v `optimalizace_lib.py` se už neobjevilo; 429 počítej s opakováním.

## G) Agregace bez stahování všech položek (`agregace.jsonl`)

| Metoda | Výsledek |
|---|---|
| `ItemCount` seznamu (`/lists/…?$select=ItemCount` nebo `/ItemCount`) | ✅ 12 012, 0,16–0,18 s, celý seznam, bez filtru |
| Počet s filtrem přes `items?$select=Id&$filter=Stav eq 'Nový'&$top=5000` | ✅ 600, 0,19–0,21 s (indexovaný filtr, do 5000 shod; stahuje ID) |
| REST `$count`, `$inlinecount`, `items/$count` | ✅ nevracejí počet (odpověď bez počtu; `/$count` 404) |
| RLDAS `<Aggregations>` SUM/COUNT/AVG/MAX/MIN s indexovaným filtrem (600 shod) | ✅ 298 200 / 600 / 497 / 987 / 7 za 0,19–0,35 s; shoda se stažením položek (součet 298 200, průměr 497, max 987, min 7) |
| totéž bez filtru, nebo se 6000 shod (`Castka lt 500`) | ✅ **500** (limit) |
| RLDAS `GroupBy` Kategorie + SUM, indexovaný filtr (`Datum` v březnu, 558 řádků) | ✅ 20 skupin, 0,40 s; 18 z 20 skupin přesně jako REST; **K00 (18 místo 36 / 8 780 místo 17 040) a K11 (36 místo 18) se liší**, součet řádků zůstal 558 ❓ nejspíš hranice dne `Datum` (UTC vs. časové pásmo webu); neověřeno, nepoužívat bez kontroly |
| RLDAS `GroupBy` bez filtru | ✅ 500 |
| Search `TotalRows` / refiner | ✅ odhad (200 vs. 5959 vs. 6001), součty nejsou |
| Souhrnný seznam / čítač | ✅ viz E) (jen nízká frekvence) |
| Power BI / SQL / Dataverse | ❓ mimo tuto sondu |

## Doporučený recept pro appku EG.D

Pořadí odpovídá tomu, co jsem měřil. Pro každý bod je uvedeno, kde je důkaz.

1. **Návrh seznamu hned při založení** (kdy ještě není nad 5000): index na každý sloupec, který appka filtruje nebo řadí (`Stav`, `Datum`, `Oddeleni`…); `Modified` je indexovaný, `Created` ne. Řaď podle `ID desc` nebo `Modified desc`. Odkaz: A), skill `egd-data-seznamy`.
2. **Čtení = REST s `$select`, `odata=nometadata`, filtr na indexovaný sloupec, `$top≤1000`.** Pro načtení „všeho“ z velkého seznamu **paralelně po rozsazích `ID`** (4–8 vláken, `ID ge a and ID lt a+1000`); `nextLink` jen pro sekvenční čtení, vždy podle `ID` nebo indexovaného unikátního sloupce, **ne podle `Created`**. Nikdy `$skip`, nikdy `$top` nad 5000, nikdy `or`/`ne`. B), A).
3. **Hledání v neindexovaném sloupci** (jednorázové, řídké): RLDAS s `RowLimit Paged="TRUE"` a dočtením `NextHref`, nebo Graph s hlavičkou `Prefer` a dočtením `nextLink`. Nikdy RLDAS bez `Paged`. Bohužel je cena lineární (0,33 s na každých 5000 řádků), proto je to nouzová cesta; pravidelné hledání patří do indexovaného sloupce. A).
4. **Opakovaná načtení: lokální cache (IndexedDB) + `GetChanges`**: při startu `CurrentChangeToken` před čtením, po prvním načtení uložit; další start = `GetChanges` a dočtení změněných ID. 0,76 s místo 2,6 s u 12 000 položek, u milionů rozdíl roste. F).
5. **Počty a součty**: celkový počet `ItemCount`; počet/součet s indexovaným filtrem `RenderListDataAsStream` `<Aggregations>`; velké souhrny držet v souhrnném seznamu (jen nízká frekvence) nebo mimo SharePoint (viz níže). G).
6. **Rozdělení dat podle času nebo střediska** do složek (limit platí v rámci složky) nebo do ročních seznamů; živé a archivní seznamy držet pod několika tisíci položek. Pozor: dotaz přes víc složek je limitovaný znovu. E).
7. **Zápis**: jedna položka přímo; dávky `$batch` po 100 v changesetu, paralelně 4, `MERGE` jako `PATCH`; v Graphu `$batch` po 20. F).
8. **Search jen jako doplněk** (fulltext napříč seznamy, filtr přes `…OWSTEXT` rovnost, hrubý počet), s vědomím, že indexace nového obsahu trvá od ~1,5 minuty (96 s) přes desítky minut (úprava 630 s, druhá nová položka přes 441 s) až po hodiny (po hromadném vložení) a že číselné rozsahy `…OWSNMBR` nefungují. Appka nesmí číst právě uložená data ze Search. C).
9. **Kdy už ne SharePoint seznam**: seznam nad ~100 000 položek s filtry přes neindexovatelné kombinace (`or`, `ne`, rozsahy přes víc sloupců), agregace bez filtru, reporting → databáze za API (varianta C v `data-prava.md`, Azure SQL), nebo Power BI nad seznamem. ❓ rychlost na 30 mil. položkách v labu neměřena: největší seznam v labu je 12 012 položek, extrapolace je 📘/❓ (vlastní závěr: RLDAS sken neindexovaného sloupce 30 mil. řádků = ~6000 volání ≈ desítky minut).

## Neověřeno ❓ (a jak to ověřit)

| Co | Důvod | Jak a kde ověřit |
|---|---|---|
| Chování na milionech položek (limit 20 indexů, trvání dotazu nad 100 000, 30 mil.) | největší seznam v labu 12 012; plnění ~38 položek/s znamená ~9 dní na 30 mil. | v E.ON tenantu nad skutečným seznamem; v labu jen se souhlasem a po hodinách vkládání |
| Index přidaný nad 5000 položek, složený index | zadáno jako práce session miniskilly | viz jejich sonda |
| Smazání položek ze zdroje při archivaci, koš, hromadné mazání nad 5000 | kánon „nic nemazat“ | na zkušebním seznamu se svolením: `DELETE` v `$batch`, `recycle()`, `ItemCount` |
| Retence (Purview) | licence, politika, mimo můj tenant | IT E.ON |
| Refinery nad vlastními sloupci, číselné rozsahy v Search | vyžadují zásah do schématu Search | správce webu: mapovat sloupec na `RefinableString00`/`RefinableDecimal00`, opakovat dotaz |
| Deep paging Search nad 50 000 | v labu jen 6000 položek v indexu | `startrow` nad 50 000 na velkém webu |
| Příčina nesrovnalosti `GroupBy` (K00/K11) | nezkoumáno | stejný dotaz se `Datum` jako číslem nebo textovým rozsahem |
| Cache v prohlížeči (IndexedDB) | skript simuluje souborem | SPFx appka s IndexedDB na reálném stroji |
| Větev „smazáno“ (`ChangeType=3`) v inkrementální synchronizaci | nemazáno | totéž jako smazání výše |
| Ustálené zpoždění Search u hotového webu s naindexovanými seznamy | změřeny 3 události na webu v backlogu (96 s, 630 s, >441 s); ustálená hodnota vyžaduje web bez backlogu | `optimalizace-search-lag.py` na webu, který je v indexu úplně |

## Co jsem v labu založil

| Zdroj | Detail |
|---|---|
| SharePoint web | `/sites/egd-sonda-optimalizace` (Communication site); do skupin Návštěvníci a Členové přidáni lab uživatelé `tomas.prochazka`, `jakub.kucera` |
| Seznamy na webu | `Velky` (12 012), `Slozky` (7208 položek: 7200 ve složkách S1–S3, plus 3 složky a ladicí zbytky: složky `Slozka01` (ne jako položka), `Slozka02`, `Slozka03`, položky `x`, `test-in-folder`, `v-slozce`), `Archiv` (1000), `Zapis` (1 740 položek ze zápisových testů), `Lag`, `Zadosti` (RS=2, 7 položek), `Soucty` |
| Entra | aplikace `egd-sonda-optimalizace-graph` (appId `1be6cab2-e345-4037-a382-7eac8a7ba603`, veřejný klient, delegované `Sites.ReadWrite.All`, souhlas správce pro všechny uživatele) |
| Čtení | `data-prava`: Search dotazy (`Velky`, `Zadosti`, `ZadostiW`, `ZadostiACL`), žádný zápis |
| Azure | nic (0 USD) |

Nic nemazáno. V `Slozky` zbyly zkušební položky z ladění `AddValidateUpdateItemUsingPath` (pouze v mém webu).

## Znovupoužitelné nástroje (do `tools/README.md` doplní hlavní session)

| Nástroj | Co dělá |
|---|---|
| `tools/optimalizace-setup.py` | založí seznam se sloupci a indexy (`create`, volitelně složky), naplní `$batch` (`fill`), `count` |
| `tools/optimalizace-rest.py` | sondy REST/CAML/RLDAS (`rest`, `caml`, `stranky`, `agregace`, `zmeny`, `zapis`, `velikost`) |
| `tools/optimalizace-graph.py` | sondy Graphu (`filtr`, `uplnost`, `stranky`, `delta`, `batch`) |
| `tools/optimalizace-search.py` | sondy Search (`dotazy`, `prava`) |
| `tools/optimalizace-search-lag.py` | zpoždění indexace Search |
| `tools/optimalizace-slozky.py` | dotazy nad složkami vs. celý seznam |
| `tools/optimalizace-sync.py` | inkrementální cache přes `GetChanges` (vzor pro SPFx) |
| `tools/optimalizace-soucty.py` | souběh čítače (naivně vs. ETag) |
| `tools/optimalizace-entra-graph.py` | Entra aplikace pro Graph sondy (lab) |
| `tools/optimalizace_lib.py` | společná knihovna (tokeny, retry při 429/401) |

## Soubory

- Tento dokument: `~/Projects/egd-workshop/sondy/optimalizace-seznamu.md`
- Surová data: `~/Projects/egd-workshop/sondy/optimalizace/` (`rest.jsonl`, `rest-tomas.jsonl`, `caml.jsonl`, `caml-tomas.jsonl`, `stranky.jsonl`, `agregace.jsonl`, `zmeny.jsonl`, `zapis.jsonl`, `velikost.jsonl`, `sync.jsonl`, `slozky.jsonl`, `soucty.jsonl`, `nextlink-razeni.jsonl`, `enablethrottling.jsonl`, `indexed-pole.json`, `graph-*.jsonl`, `search-dotazy.jsonl`, `search-prava.jsonl`, `search-lag.jsonl`, `search-lag-1-prerusene.jsonl`, `fill-velky.jsonl`, `archiv-kopie.jsonl`)
