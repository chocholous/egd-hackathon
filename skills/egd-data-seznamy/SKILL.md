---
name: egd-data-seznamy
description: Nauč SPFx appku EG.D ukládat a upravovat data v SharePoint seznamu tak, aby fungovala i s tisíci záznamy - indexy sloupců (UI, CLI, REST), pořadí podmínek ve filtru, stránkování po 1000, zápis a úprava položky, a kdy už je potřeba opravdová databáze. Použij, když uživatel řekne „potřebuju databázi“, „ukládat a upravovat záznamy“, „tabulka s editací“, „appka spadla po pár tisících položek“, „chyba 500 překračuje mezní hodnotu zobrazení“, „SPQueryThrottledException“, „list view threshold“, „5000 položek“, „indexovaný sloupec“, „filtrování a řazení v seznamu“, „Dataverse nebo SQL?“ nebo když se rozhoduje, kde budou data appky.
license: interní pomůcka workshopu EG.D
---

# Data appky v SharePoint seznamu (požadavek 1: databáze s editací)

Uživatel je začátečník na Windows. Mluv česky a krátce. Navazuje na `egd-prvni-appka`
(soubor `src\webparts\spokojenost\SpokojenostWebPart.ts`, metody `_url`, `_nacti`, `_popisChyby`).

**Pro kterou šablonu:** skill je psaný pro šablonu `egd-prvni-appka` (seznam `Spokojenost`, `Den`
jako text, čte `ID desc&$top=2000`, žádný index). Šablona appky v `egd-pripravenost`
(`SpokojenostHodnoceni`, `DenCislo`, `Klic`) indexy zakládá sama a stránkuje přes oba klíče
`nextLink`; u ní skill použij jen pro nové sloupce a dotazy, pravidla níže platí stejně.

Značky: ✅ změřeno v labu 22. 11. 2026 (SPFx 1.24.1, CLI for Microsoft 365 11.11, seznamy se 6000+
položkami na `/sites/egd-sonda-miniskilly`). Důkazy: `sondy/miniskilly/indexy-*.jsonl`,
screenshoty `sondy/miniskilly/ui/`, nástroj `tools/miniskilly-indexy.py`. Co ověřené není, je v sekci „Neověřeno“.

## Rozhodnutí: seznam, nebo databáze?

**Seznam stačí** (bez Azure, bez licencí, práva hlídá SharePoint) pro formulář, tabulku, stav,
schválení, přílohy, verze, „vidím své / vidím vše“ ✅ (`sondy/data-prava.md`).

**Databázi** navrhni jen, když platí aspoň jedno: vztahy mezi několika tabulkami a transakce · dotazy
přes libovolné kombinace sloupců nad tisíci řádky (víc než 20 indexů, viz níže) · práva „moje
oddělení a nadřízený“ · data čte jiný systém · reporty v SQL.

Žebřík variant (od nejjednodušší; zkus první, která v prostředí účastníka projde):

| # | Varianta | Test „funguje?“ | Když ne | Lab | IT E.ON | Citizen dev |
|---|---|---|---|---|---|---|
| 1 | **SharePoint seznam** + SPFx (`spHttpClient`) | appka načte a uloží položku | role na webu (věta níže) | ✅ e2e appky Spokojenost v Claude i Copilotu (`TEST.md` (v repu workshopu), `TEST-copilot.md` (v repu workshopu)) | nic (role na webu) | snadné |
| 2 | Seznam + kit `ppf-citizen-ai-devkit` (`fetch` + vlastní digest, mock, manifest práv) | `npm run` v kitu projde | zůstaň u 1 | ✅ `sondy/data-prava.md` (REST) | nic | střední (víc souborů) |
| 3 | Azure SQL za vlastním API (Container App, app role) | API vrátí 200 s tokenem | jen přes IT | ✅ `sondy/data-prava.md` část C, 0 USD free tier | subscription, Entra app, consent | těžké |
| 4 | Dataverse / Power Apps | – | – | ❓ nezkoušeno (licence viz Neověřeno) | licence | střední, ale licence |

Pro EG.D platí 1: šablona `egd-prvni-appka` používá `spHttpClient` (✅ e2e níže). Kit (2) dělá
totéž přes `fetch` s `credentials: same-origin` a vlastním `X-RequestDigest`; oba tvary volají
stejné REST adresy ✅. Nemíchej je v jedné appce.

## Limit 5000 platí i pro appku, ne jen pro zobrazení ✅

Dotaz na REST seznamu (měřeno voláním stejných adres, jaké volá appka přes `spHttpClient`, s tokenem;
v běžící appce potvrzeno: bez indexu na `Den` ukáže appka hlášku z `_popisChyby` místo dat,
`ui/17-claude-bez-indexu-500.png`, `TEST.md` (v repu workshopu)) dostane nad limitem chybu **500
`SPQueryThrottledException`** („…překračuje mezní hodnotu zobrazení seznamu“), stejně pod vlastníkem
webu i běžným uživatelem. Pod 5000 položek funguje všechno i bez indexů, chyba přijde až s růstem.

| Dotaz z appky nad 6000 položkami | Výsledek |
|---|---|
| `$top=5000` bez filtru / `$top=5001` | ✅ 200 / ❌ 500 |
| `$orderby=Created desc&$top=200` (dřívější šablona první appky) | ❌ 500: `Created` **není** indexovaný |
| `$orderby=Modified desc` / `$orderby=ID desc` bez vlastního indexu | ✅ 200 (`ID` nehlásí `Indexed`, přesto projde; `Modified` dnes hlásí `Indexed:true` na obou seznamech, `k2.jsonl`; dřívější čtení na IndexTest hlásilo `false` a dotaz prošel taky, `modified.txt`) |
| `$filter` nebo `$orderby` na neindexovaný sloupec, i s `$top=10` | ❌ 500 |
| `$filter` na indexovaný sloupec, výsledek pod 5000 | ✅ 200, 0,2–0,3 s |
| indexovaný filtr, který vrátí přes 5000 řádků (např. `AuthorId`, když má autor 6000 položek) | ❌ 500 |
| `Volba eq 'B' and OsobaId eq 6` / **obráceně** `OsobaId eq 6 and Volba eq 'B'` | ✅ 200 / ❌ 500 |
| celý seznam po stránkách `$top=1000` + `@odata.nextLink` (v SPFx), řazení `ID` | ✅ |

Bez vlastního indexu fungují jen `ID` a `Modified`. Zdroj: `sondy/data-prava/threshold.jsonl`, `sondy/miniskilly/indexy-typy.jsonl`, `indexy-ui.jsonl`, `doplnky.jsonl`, `k2.jsonl`, `modified.txt`.

### Pravidla pro appku

1. **Každý sloupec, podle kterého appka filtruje nebo řadí, indexuj.** Na seznamu nad 5000 se
   index dá přidat i dodatečně ✅ (viz níže), takže zapomenutý index se dá opravit za minutu.
2. **Řaď podle `ID desc`** (pořadí vložení) nebo `Modified desc`, ne `Created desc`. ID přiděluje
   SharePoint při vložení; u paralelního hromadného vkládání se `Created` může o vteřiny lišit od
   pořadí ID ✅ (`doplnky.jsonl`), pro appku s ručním zadáváním je to totéž.
3. **Filtruj na serveru** a **první podmínka ve `$filter` musí být indexovaná a vracet pod 5000
   řádků**. SharePoint se řídí první podmínkou; když je široká, dotaz padne, i když je druhá
   úzká a indexovaná ✅.
4. **Čti po stránkách** `$top=1000` + další stránka z `@odata.nextLink`. Nikdy `$top` nad 5000.
   ⚠️ `spHttpClient` s `SPHttpClient.configurations.v1` posílá `OData-Version: 4.0`, takže klíč je
   **`@odata.nextLink`**; `curl` bez té hlavičky vrací `odata.nextLink`. Kód, který čte jen `odata.nextLink`,
   v appce tiše skončí po 1000 položkách ✅ (Copilot e2e 22. 11.: appka ukázala 1000 z 2900, `TEST-copilot.md` (v repu workshopu)). Čti oba klíče.
5. Nejvýš **20 indexů na seznam** ✅ (21. vrátí chybu „…maximální počet“).

## Indexy: co jde, jak a jak dlouho ✅

Žebřík pro založení indexu (všechny tři ✅ na seznamu se 6009 položkami):

| # | Varianta | Test „funguje?“ | Když ne |
|---|---|---|---|
| 1 | UI (Nastavení seznamu → Indexed columns) | stránka ukáže „N of maximum 20“ a nový sloupec v seznamu | nemáš roli Člen/Vlastník → věta pro IT; nebo už je 20 indexů → zruš nepotřebný |
| 2 | CLI z pracovní složky (`spo field set --Indexed true`) | `spo field get` → `"Indexed": true` | CLI není přihlášené (`egd-pripravenost`) → varianta 1 |
| 3 | REST z prohlížeče / kódu (`MERGE` s `{"Indexed":true}`) | odpověď 204 a dotaz s filtrem vrátí 200 | 403 = role Návštěvník → varianta 1 s vyšší rolí |


| Typ sloupce | Jde indexovat? |
|---|---|
| Jeden řádek textu, Volba, Datum, Číslo, Osoba, Vyhledávání (lookup) | ✅ ano |
| Více voleb (multi-choice), Více řádků textu (poznámka) | ❌ „Tento typ sloupce není podporován pro indexování“; poznámka nejde ani filtrovat (400) |

Index na **seznamu se 6009 položkami** se založil všemi třemi cestami a dotaz prošel hned potom
(žádné čekání na dokončení, nic „mezitím“ neběží):

| Cesta | Čas založení | Pro koho | Důkaz |
|---|---|---|---|
| **UI**: Nastavení seznamu → Indexované sloupce → Vytvořit nový index | jedno kliknutí | **citizen developer**, nejjednodušší | `ui/04-po-ui-T05.png`, `indexy-ui.jsonl` |
| **CLI** `spo field set … --Indexed true` | 6–9 s (většinou start CLI) | agent | `indexy-typy.jsonl` |
| **REST** `MERGE …/fields/getbyinternalnameortitle('X')` `{"Indexed":true}` | 0,3–1,6 s | kód / agent | `indexy-typy.jsonl`, `indexy-max.jsonl` |

**Jak těžké je indexování pro citizen developera:** snadné. Jedna obrazovka v nastavení seznamu,
stačí úroveň **Upravit / Edit** = role **Člen** ✅ (jakub.kucera REST 204, `doplnky.jsonl`). **Přispívání /
Contribute** (např. Zadavatel ze skillu `egd-prava-role`) položky zapíše (201), ale index **nezaloží: 403** ✅
(`k2.jsonl`, karolina.mala s dočasným Contribute). Návštěvník 403 ✅. Index proto zakládá Člen nebo Vlastník
webu, ne běžný uživatel appky. Těžší je **vědět, že je potřeba** (chyba přijde až nad
5000) a **dát podmínky ve filtru ve správném pořadí**. Proto to agent dělá rovnou při zakládání seznamu.

### UI

Seznam → ozubené kolo → **List settings / Nastavení seznamu** → **Indexed columns** (stránka ukazuje
„You have created N of maximum 20 indices“) → **Create a new index** → Primary column → **Create** ✅.
Přímá adresa: `<web>/_layouts/15/IndexedColumns.aspx?List={<id seznamu>}`. Ověřeno pod účtem
s anglickým UI; české popisky viz Neověřeno.

### CLI (agent; účastník ho má lokálně z `egd-pripravenost`)

Plán ukaž, zapiš po „ano“. Ve Windows z pracovní složky (kde je `node_modules\@pnp\cli-microsoft365`;
tvar s `\` nespuštěn na Windows, viz Neověřeno; stejný příkaz s `/` na macOS ✅):

```
node node_modules\@pnp\cli-microsoft365\dist\index.js spo field set --webUrl <web> --listTitle Spokojenost --internalName Den --Indexed true
node node_modules\@pnp\cli-microsoft365\dist\index.js spo field get --webUrl <web> --listTitle Spokojenost --internalName Den --output json
```

`--Indexed` v `spo field set --help` není, CLI ho pošle jako vlastnost pole; funguje ✅ (rc 0,
`"Indexed": true`, `indexy-typy.jsonl`). Sloupec Vytvořil = `--internalName Author` ✅ (zapnutí 5 s, vypnutí 8 s, `k2.jsonl`).

### Složený index (dva sloupce)

Jen **v UI** (formulář výše, Secondary column). REST na indexy seznamu neexistuje
(`/FieldIndexes`, `/Indexes` → 404 ✅, `k2.jsonl`). Jako sekundární sloupec UI nabízí jen Datum, Osobu,
Vyhledávání, Created/Created By/Modified/Modified By a Typ obsahu ✅ (`editindex-formy.txt`,
`ui/13-editindex-sekundarni.png`: na IndexTest nabídka `Created, Created By, Datum, Modified, Modified By, Odkaz, Osoba, Typ obsahu`). V labu se složený index `T06 + Osoba` choval stejně
jako jednoduchý index na `T06` (filtr `T06 and Osoba` prošel, obrácené pořadí padlo) ✅;
přínos navíc jsme nenaměřili. Pro appku: místo složeného indexu dej úzký indexovaný sloupec
do filtru **první**.

### Auto-index ✅

**Seřazení** podle neindexovaného sloupce v moderním zobrazení seznamu (klik na záhlaví nebo
`AllItems.aspx?sortField=<sloupec>`) založilo index samo a hned (`ui/06-razeni-T07.png`,
`indexy-auto.jsonl`). **Filtr** v zobrazení (`FilterField1=…`) data ukázal, ale index nezaložil
(`ui/07-filtr-T09.png`). Dotaz z appky (REST) index nikdy nezaloží. Na auto-index se nespoléhej,
spotřebovává jeden z 20 indexů.

### Pravidlo: názvy seznamů a sloupců bez diakritiky a mezer

**Seznam ani sloupec nezakládej s diakritikou ani mezerou v názvu.** SharePoint z prvního názvu
vyrobí interní název a adresu a ty už se nedají změnit.
- **Seznam „Test Žádosti o volno“** má adresu `Lists/Test dosti o volno`: „Žá“ zmizelo, mezery
  zůstaly ✅.
- **Sloupec „Komentář schvalovatele“** dostal interní název `Koment_x00e1__x0159__x0020_schva`:
  zakódovaný a zkrácený ✅. Kód appky pak musí používat tenhle zakódovaný název. Kód, který počítá
  s čitelným `Komentar`, dostane 400 (dotaz na neexistující sloupec) ✅.

Postup:
1. Založ s ASCII názvem bez mezer: seznam `ZadostiOVolno`, sloupce `Stav`, `Oddeleni`, `Komentar`.
2. Popisek s diakritikou nastav až potom: `spo field set … --internalName Komentar --Title "Komentář schvalovatele"`.
   Interní název zůstane `Komentar` a appka ho čte ✅.

   Druhá cesta, jedním příkazem: `spo field add … --xml '<Field Type="Number" Name="Hodnoceni" DisplayName="Hodnocení" />'
   --options AddFieldInternalNameHint`. Vznikne interní název `Hodnoceni` rovnou s českým popiskem ✅.
   **Bez `--options`** se `Name` z XML ignoruje. Pro `DisplayName="Hodnocení 2"` pak vznikl
   `Hodnocen_x00ed__x0020_2` ✅.
3. V UI napiš název nejdřív bez diakritiky a přejmenuj až po uložení.

Důkaz: `sondy/miniskilly/nazvy-diakritika.sh` a `.out` (v repu workshopu).

Sloupec pojmenovaný jako buňka Excelu (`T01`, `AB12`) dostane interní název `_x0054_01`. V REST
těle i `$filter` se pak píše **`OData__x0054_01`** ✅, proto ani takové názvy nepoužívej.

### Past: datum o den dřív (časové pásmo webu)

Nový web v labu měl pásmo „(UTC-08:00) Tichomoří USA a Kanada“ (Id 13), i když jazyk byl čeština (lcid 1029).
Datum `2026-12-03T00:00:00Z`, zapsané přes REST do sloupce typu jen datum, pak web zobrazil jako **02.12.2026** ✅.

1. **Ověř pásmo webu:** `m365 request --url "<web>/_api/web/RegionalSettings/TimeZone"`. Hledej `Description`.
2. **Přepni pásmo na Prahu (Id 6), je-li jiné.** Potřebuješ roli Vlastník.
   - V labu: `M365=tools/lab-m365.sh tools/spo-web-pasmo.sh <web> 6 --ano` (v repu workshopu). Skript posílá CSOM,
     protože CLI v11 tuto volbu nemá ✅.
   - Mimo lab: ❓ cesta v UI Nastavení webu → Místní nastavení zatím neprojitá.
3. **Z kódu zapisuj datum jako ISO bez `Z`** (`"2026-12-03T00:00:00"`). Uloží se jako půlnoc v pásmu webu.

Po přepnutí na Prahu ukázaly 03.12.2026 všechny tři způsoby zápisu ✅:
- REST s `Z`;
- REST bez `Z`;
- CLI `spo listitem add --Termin 03.12.2026`.

Na webu s lcid 1029 chce CLI datum ve tvaru `dd.mm.rrrr`. ISO odmítne hláškou „Je třeba zadat platné datum“ ✅.

Neměřeno ❓:
- zápis bez `Z` na webu, kde zůstalo pásmo Id 13;
- výchozí pásmo webů v tenantu E.ON.

Důkaz: `sondy/katalog-funkci/dukazy/datum.log` (v repu workshopu, session katalog-funkci, 24. 11.).

## Kód: čtení po stránkách a filtr na serveru (SPFx 1.24.1)

Šablona `egd-prvni-appka` (appka **Spokojenost**, seznam `Spokojenost`, sloupce `Hodnoceni` číslo
a `Den` text `RRRR-MM-DD`) čte jen `$orderby=ID desc&$top=2000` a „dnešek“ filtruje v prohlížeči.
Nad 5000 hlasy **nespadne** (ID je indexované) ✅, ale když přibude víc než 2000 hlasů za období
dashboardu, tiše ukáže neúplná data. Jakmile appka potřebuje delší období nebo „můj hlas“ bez ohledu
na počet, dej filtr na server:

1. Index na `Den` (žebřík výše).
2. Do třídy web partu vedle `_nacti` přidej `_ctiVse` (`_url` už vrací celou adresu `…/_api/web/lists/getbytitle('…')`):

```ts
// Přečte všechny položky, které projdou filtrem, po stránkách po 1000.
// filtr: OData výraz; PRVNÍ podmínka musí být indexovaný sloupec s výsledkem pod 5000 řádků.
private async _ctiVse<T>(select: string, filtr = '', razeni = 'ID desc'): Promise<T[]> {
  const vysledek: T[] = [];
  let url: string | undefined = this._url(
    `/items?$select=${select}&$top=1000&$orderby=${encodeURIComponent(razeni)}` +
    (filtr ? `&$filter=${encodeURIComponent(filtr)}` : ''));
  while (url) {
    const r: SPHttpClientResponse = await this.context.spHttpClient.get(url, SPHttpClient.configurations.v1, { headers: JSON_HLAVICKY });
    if (!r.ok) throw new Error(await this._popisChyby(r));
    const j = (await r.json()) as { value: T[]; '@odata.nextLink'?: string; 'odata.nextLink'?: string };
    vysledek.push(...j.value);
    // configurations.v1 posílá OData-Version: 4.0 -> klíč je '@odata.nextLink' (bez té hlavičky 'odata.nextLink')
    url = j['@odata.nextLink'] ?? j['odata.nextLink'];
  }
  return vysledek;
}
```

3. V `_nacti` nahraď dotaz s `$top=${MAX_HLASU}` filtrem na období (funkce `den()` je v šabloně):

```ts
const od = new Date(); od.setDate(od.getDate() - (DNU_V_PREHLEDU - 1));
this._hlasy = await this._ctiVse<IHlas>('Id,Hodnoceni,Den,AuthorId', `Den ge '${den(od)}'`);
```

Delší přehled než 7 dní potřebuje i úpravu grafu, jinak se sloupce nevejdou. Při 30 dnech:
- v `SpokojenostWebPart.module.scss` změň `.dny` na `grid-template-columns: repeat(30, 1fr); gap: 2px`;
- písmo `.denHodnota` a `.denNazev` zmenši na 9px;
- popisek dne zkrať na `String(d.getDate())`.

Výsledek se vykreslí ✅ (`ui/16-claude-30dni-hlas.png`). Popisky průměrů ale lehce přetékají kartu,
takže při 30 dnech je čistší popisky průměrů vynechat.

Text `RRRR-MM-DD` se porovnává správně i jako text ✅. Na seznamu se 6000 hlasy (100 za den):
bez indexu `Den ge '<před 30 dny>'` → 500 ✅ (`spokojenost-den.jsonl`). S indexem, stránkováno po 1000
přes `@odata.nextLink` s `OData-Version: 4.0` ✅ (`sondy/miniskilly/k2-den.jsonl`):

| Období | Hlasů | Stránek | Výsledek |
|---|---|---|---|
| 30 dní | 2901 | 3 | 200, 2,3 s |
| 50 dní | 4901 | 5 | 200, 3,1 s |
| 51 dní | 5001 | – | **500** `SPQueryThrottledException` |

**Celé období filtru musí mít nejvýš 5000 záznamů** (stránkování nepomůže, rozhoduje počet řádků, které
filtr vybere). Pro delší přehled se ptej po kratších úsecích (`Den ge 'A' and Den lt 'B'`, každý pod 5000),
nebo měj souhrnný seznam s jedním řádkem na den. Copilot v e2e zvolil 30 dotazů `Den eq '<den>'` (po 5
souběžně): funguje taky ✅ (`TEST-copilot.md` (v repu workshopu)), jen víc požadavků.

„Můj dnešní hlas“ na serveru: `Den eq '${den(new Date())}' and AuthorId eq ${this._ja()}` → 200 ✅
(první podmínka `Den` je úzká). Obráceně (`AuthorId` první) projde jen s indexem na `Author` a pod
5000 hlasy daného člověka ✅ (`doplnky.jsonl`: 1 položka → 200, 6000 → 500).

Srozumitelná hláška v `_popisChyby`: přidej větev pro 500 s `SPQueryThrottledException`
(tělo odpovědi jde přečíst jen jednou, proto ho čti do proměnné a testuj ji):

```ts
if (r.status === 500 && /SPQueryThrottledException|mezn|threshold/i.test(text))
  return 'Seznam je moc velký pro tenhle dotaz. Sloupec ve filtru nebo řazení musí být indexovaný (Nastavení seznamu → Indexované sloupce).';
```

## Kód: zápis a úprava položky ✅

Šablona už zapisuje: nový hlas `POST /items`, změna `POST /items(<id>)` s hlavičkami `IF-MATCH: *`
a `X-HTTP-Method: MERGE` (u záznamů, které mění víc lidí, místo `*` ETag, viz níže). Zápis funguje i nad 6000 položkami ✅ (dřívější šablona Evidence:
odeslání i schválení v appce, `ui/10-appka-schvaleno.png`, `ui/11-appka-moje.png`). Hromadné
vložení z appky nepotřebuješ; skriptem jde SP REST `$batch` po 100 v changesetu ✅ (6000 položek za
156–181 s, `tools/miniskilly-naplnit-seznam.py`; z SPFx appky `$batch` nezkoušen).

### Když stejnou položku upravuje víc lidí najednou (ETag) ✅

`IF-MATCH: *` znamená „přepiš bez ohledu na to, co tam mezitím je“. U položky, kterou upravuje víc lidí
(žádost, kterou mají otevřenou dva schvalovatelé, sdílený záznam), se tak **cizí změna tiše ztratí**.
Měřeno dvěma uživateli labu nad jednou položkou: A uloží `Stav=Schváleno`, B pak uloží formulář se
starým stavem. S `*` vyhraje B a A-ho schválení zmizí; s ETagem dostane B 412 a A-ho změna zůstane
✅ (`sondy/miniskilly/etag.jsonl`, skript `mereni_etag.py`).

Kdy co použít:

| Varianta | Co se stane při souběhu | Kdy |
|---|---|---|
| `IF-MATCH: *` (šablona) | poslední zápis vyhraje, cizí změna se ztratí ✅ | položku mění jen její autor (vlastní hlas ve Spokojenosti) |
| `*`, ale posílat **jen změněná pole** | změna jiného pole přežije, stejné pole se přepíše ✅ | rychlá záplata, ne ochrana |
| **ETag z načtení** v `IF-MATCH` | druhý dostane 412, appka načte znovu a ukáže hlášku ✅ | **sdílené záznamy, schvalování: doporučeno** |

ETag dává SharePoint u každé položky v odpovědi jako `@odata.etag` (např. `"3"`), i s
`odata=nometadata`, protože SPFx posílá `OData-Version: 4.0` ✅. Úprava kódu:

```ts
interface IPolozka { Id: number; /* … */ '@odata.etag'?: string; }

// etag = verze z načtení; '*' by tiše přepsalo cizí změnu
private async _zapis(cesta: string, telo: object, etag?: string): Promise<void> {
  const headers: Record<string, string> = { ...JSON_HLAVICKY };
  if (etag) { headers['IF-MATCH'] = etag; headers['X-HTTP-Method'] = 'MERGE'; }
  const r = await this.context.spHttpClient.post(this._url(cesta), SPHttpClient.configurations.v1, { headers, body: JSON.stringify(telo) });
  if (!r.ok) throw new Error(await this._popisChyby(r));
}
// v _popisChyby:
if (r.status === 412) return 'Mezitím položku změnil někdo jiný. Načetl jsem aktuální stav, zkontrolujte ho a rozhodněte znovu.';
// volání: this._zapis(`/items(${p.Id})`, { Stav: stav }, p['@odata.etag'])
//   .catch(async (e: Error) => { await this._nacti(); this._chyba = e.message; this.render(); });
```

V běžící appce ✅: appka Evidence 1.0.2.0 na webu miniskilly. Dva schvalovatelé (jakub.kucera,
karolina.mala) měli otevřenou stejnou žádost. Jakub schválil, Karolína pak se starou stránkou zamítla.
Appka jí ukázala hlášku výše, načetla seznam znovu a na serveru zůstalo `Schváleno` od Jakuba
(`sondy/miniskilly/etag-prohlizece.jsonl`, `ui/etag/1-…3-*.png`, změna kódu `etag-zmeny.diff`).
Bez Azure, bez Power Automate; jiná varianta není potřeba. Úprava ve formuláři seznamu
SharePointu (mimo appku) ❓ neověřeno.

## Ověření (vždy)

1. Agent bez prohlížeče: každý dotaz z kódu zkus REST voláním s tokenem (`m365 util accesstoken get
   --resource https://<tenant>.sharepoint.com`, pak `curl` na `<web>/_api/web/lists/getbytitle('<seznam>')/items?…`
   se stejným `$select/$filter/$orderby` **a hlavičkou `OData-Version: 4.0`** jako SPFx). Každý musí vrátit 200;
   projdi všechny stránky přes `@odata.nextLink` a zapiš si celkový počet.
2. Indexy: `spo field get … --internalName <sloupec>` → `"Indexed": true` pro každý sloupec ve filtru/řazení.
3. Build, nasazení (`egd-prvni-appka`), uživatel otevře stránku a zkontroluje, že appka čte všechny
   stránky:
   - Ukazuje-li appka počet, **musí se rovnat počtu z bodu 1**. Přesně 1000 znamená, že čte jen první stránku.
   - Šablona Spokojenost počet za období neukazuje. V grafu proto musí mít data i **nejstarší dny
     období**: první stránka obsahuje jen 1000 nejnovějších hlasů, takže starší dny vlevo by zůstaly
     prázdné ✅ (`TEST.md` (v repu workshopu)).
   - Hlas se uloží a je hned vidět.

E2E v labu: výsledky pro Claude i GitHub Copilot jsou v `TEST.md` (v repu workshopu) a `TEST-copilot.md` (v repu workshopu).

## Kdy to nejde v E.ON

- Uživatel je na webu jen Návštěvník (Čtenář) → nezaloží index ani nezapíše položku (403 ✅). Člen stačí ✅.
- Dotazy přes víc než 20 sloupců, nebo filtry, kde žádná první podmínka nezúží pod 5000 → databáze (C).

**Věta pro IT (ServiceNow):** „Prosím o roli Člen (Member) na webu <web>, potřebuji v seznamu <seznam>
založit indexy sloupců pro aplikaci (SharePoint Framework web part); seznam má/bude mít víc než
5000 položek.“

## Neověřeno (a jak to ověřit)

- **Kapacita 30 milionů položek na seznam**: jen dokumentace Microsoftu; v labu ověřeno 6009. Ověřit
  v rozumném čase nejde; pro appky EG.D nepodstatné.
- **Index na seznamu s desítkami tisíc položek**: měřeno na 6009; nad ~20 000 se chování (čas, auto-index)
  může lišit. Ověřit: `tools/miniskilly-naplnit-seznam.py --count 25000` a `tools/miniskilly-indexy.py index`.
- **České popisky UI** (Indexované sloupce, Vytvořit nový index): lab účty mají anglické UI. Ověřit
  na účtu s jazykem čeština.
- **Windows tvar CLI příkazu** (`node node_modules\@pnp\…\index.js`): spuštěn jen na macOS s `/`.
  Ověřit na Windows notebooku účastníka (PowerShell 5.1) nebo ve Windows VM; skill `egd-pripravenost` už
  CLI na Windows spouští stejným tvarem.
- **Dataverse a licence**: podle dokumentace Microsoftu (📘) potřebuje každý uživatel appky licenci
  Power Apps Premium nebo per-app; v labu nezkoušeno (placené). Ověřit trialem Power Apps Developer Plan.
- **Tenant E.ON**: limit 5000 je v SharePoint Online pevný a jiné chování neočekáváme, ale neověřeno.

## Zdroje

`sondy/data-prava.md` (oddíly „Limity“ a „Editace z SPFx“), `sondy/miniskilly/` (měření indexů,
e2e appka), kit `ppf-citizen-ai-devkit` (`SpSource.getItems` stránkuje přes `nextLink`).
