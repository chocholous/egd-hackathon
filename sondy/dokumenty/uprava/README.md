# Sonda 3.2: úprava dokumentů, které už leží v knihovně

Otázka Tomáše Galíka 3.2 (EG.D): umí SharePoint appka (SPFx) upravit **existující** Word, Excel a PowerPoint
v knihovně a vyplnit **šablonu napsanou ručně ve Wordu**? Dosud bylo ověřené jen generování nového dokumentu
a šablona vyrobená kódem ([../../dokumenty.md](../../dokumenty.md)). Měřeno 24. 11. 2026 v labu
(`pavelchocholousgmail`, web `sites/egd-sonda-ms-dokumenty`, knihovna Dokumenty, složka `uprava/`),
SPFx 1.23.2 (Heft), headless Chrome, uživatelé Petra Nováková a Jakub Kučera. Session `ms-uprava-dok`.

Značky: ✅ změřeno v labu · ❌ v labu nefunguje · ⛔ jen v E.ON / neověřitelné v labu · ❓ neověřeno.

## Shrnutí (žebřík variant)

Hlavní varianta je **SPFx bez Azure, úprava v prohlížeči**: appka stáhne soubor z knihovny (SPHttpClient), upraví
XML uvnitř OOXML balíčku (JSZip, exceljs nebo docxtemplater) a uloží ho zpět (`Files/AddUsingPath`, overwrite).
Pro Excel je druhá varianta **Graph Excel API** (úprava přímo na serveru, Excel hned přepočítá vzorce).

| # | Úkol | Varianta | Výsledek | Důkaz |
|---|---|---|---|---|
| a | přepsat text v nahraném .docx | JSZip + DOM, náhrada po odstavcích přes hranice runů (`nahradVOdstavcich`) | ✅ 4 náhrady, i text v tučném runu („Za **Stavby Morava** …“); 530 ms | `klik-2.log`, `vystup/smlouva-upravena.docx`, LO PDF `vystup/lo/`, Office Online `office-online/smlouva-upravena.png` |
| b1 | změnit buňky .xlsx | exceljs 4.4.0 (načte a zapíše celý sešit) | ✅ s výhradou: vzorec zůstane s **uloženým starým výsledkem**. Excel Online ho přepočítá (B5 = 530000), LibreOffice ukáže starých 480000. exceljs zahodí `calcChain.xml` | `klik-2.log`, `vystup/lo/rozpocet-exceljs.csv`, `office-online/rozpocet-exceljs.png` |
| b2 | změnit buňky .xlsx | JSZip: přepsat `<c>` v `sheet1.xml`, text jako `inlineStr`, smazat uložený výsledek vzorce, `fullCalcOnLoad="1"` | ✅ ostatní části sešitu beze změny; LibreOffice spočítá 530000 | `klik-2.log`, `vystup/lo/rozpocet-xml.csv`, `office-online/rozpocet-xml.png` |
| b3 / E | změnit buňky .xlsx na serveru | **Graph Excel API** z `MSGraphClientV3`: PATCH `range`, POST `tables/…/rows`, relace | ✅ PATCH i POST rows prošly a Excel přepočítal vzorce; změny se živě propsaly do otevřeného Excelu Online; uživatel bez práva zápisu dostane odmítnutí. Potřebuje Graph `Files.ReadWrite.All` (v labu schválené ✅, v E.ON ⛔) | `klik-2.log`, `soubeh/`; podrobně níž |
| c | upravit text na snímku .pptx | JSZip + DOM (`a:p`/`a:t`), stejná funkce jako u Wordu | ✅ 3 náhrady; „Stav projektu Rozvodna Sever“ PowerPoint pro web rozdělil do 3 runů (kontrola pravopisu) a náhrada prošla | `klik-2.log`, `vystup/prezentace-upravena.pptx`, `office-online/prezentace-upravena.png` |
| d0 | šablona z Wordu | naivní `split/join` nad surovým `document.xml` | ❌ **past**: `{{utvar}}` a `{{datum}}` zůstanou, protože je Word rozdělil do více runů | `klik-2.log`, `vystup/lo/sablona-naivne.pdf` |
| d1 | šablona z Wordu | vlastní náhrada po odstavcích (stejná funkce jako a) | ✅ všechny 4 zástupné texty, zbylo 0 | `klik-2.log`, `vystup/sablona-odstavce.docx` |
| d2 | šablona z Wordu | **docxtemplater 3.71.1** + pizzip 3.3.0, oddělovače `{{ }}` | ✅ všechny 4, zbylo 0 (runy spojuje sám) | `klik-2.log`, `vystup/sablona-docxtemplater.docx` |
| d3 | šablona z **desktopového Wordu** (Word for Mac 16) se značkami `{{ }}` a polem `MERGEFIELD jmeno` (`w:fldSimple`) | `vyplnSlucovaciPole` (pole → prostý text) + docxtemplater | ✅ 4 značky + 1 pole, zbylo 0 značek a 0 polí; 1127 ms. Office pro web i LibreOffice ukazují „Procházka Tomáš“ | `klik-3.log`, `vystup/sablona-desktop-vyplnena.docx`, `office-online/sablona-desktop-vyplnena.png`, `vystup/lo/sablona-desktop-vyplnena.pdf` |
| d3k | kontrola: táž šablona jen docxtemplaterem | docxtemplater 3.71.1 bez větve pro pole | ❌ značky ano, ale pole zůstane (`w:fldSimple`, text `«jmeno»`) | `kontrola-bez-mergefield.log` |
| d4 | složené pole (`w:fldChar begin` → `w:instrText` ve 2 runech → `separate` → výsledek → `end`, tak ukládá Word pro Windows) | totéž jako d3 | ✅ pole nahrazeno, 0 zbylých `fldChar`/`instrText`; 393 ms. Vstup je **ruční přepis** šablony z Word for Mac, ne soubor z Wordu pro Windows ❓ | `klik-3.log`, `vstup/sablona-slozene-pole.docx`, `office-online/sablona-slozene-vyplnena.png` |
| – | totéž přes Container App | LibreOffice v kontejneru | nepotřeba: všechny úpravy OOXML prošly v prohlížeči. Container App dává smysl jen pro staré formáty (.doc, .xls) a převod do PDF; převod ověřila session ca-libreoffice ✅ ([../../container-app/libreoffice.md](../../container-app/libreoffice.md)), úpravu dokumentu v kontejneru jsem nestavěl ❓ | – |

**Doporučení:** text ve Wordu a PowerPointu a šablony vyplňovat v prohlížeči. Pro šablony je nejjednodušší **docxtemplater**
(řeší rozdělené runy, umí i opakování řádků `{#radky}`). Bez další knihovny stačí funkce `nahradVOdstavcich`
z kódu níž, která poslouží i pro .pptx. Excel: když stačí změnit pár buněk a sešit se má hned přepočítat (a třeba
ho má zrovna někdo otevřený), použij **Graph Excel API** (E). Bez Graphu použij přímou úpravu XML (b2). exceljs (b1) jen tehdy,
když se sešit otevírá v Excelu nebo v Excelu Online, ne v LibreOffice ani při čtení uložených hodnot strojem.

## Vstupní soubory: napsané v Office, ne kódem

Všechny 4 vstupy napsal lab uživatel (Petra) v **Office pro web** pod svým účtem, přes Playwright klávesnicí
(`tools/office-web-kroky.mjs`, kroky `office-web/k-*.mjs`). Do knihovny šly prázdné soubory z LibreOffice a obsah do nich
psal a ukládal Word, Excel a PowerPoint pro web. Stažené vstupy jsou v `vstup/`.

- `sablona-word.docx`: zástupné texty `{{jmeno}}`, `{{utvar}}`, `{{datum}}`, `{{hodnoceni}}`. Při psaní se uprostřed
  zapínalo tučné písmo a kurzíva a v jednom z nich byl překlep opravený Backspacem. Word uložil
  `{{ut` `va` `r}}` a `{{dat` `um` `}}` jako **samostatné runy** ✅ (`unzip -p vstup/sablona-word.docx word/document.xml`).
- `smlouva.docx`: smlouva s textem v tučném runu.
- `rozpocet.xlsx`: tabulka a vzorec. Excel pro web v češtině přijme jen `=SUMA(B2:B4)`. Napsané `=SUM(...)` uložil jako
  `_xludf.SUM` s chybou `#NAME?` ✅. Do souboru se vzorec ukládá jako `SUM(B2:B4)`.
- `prezentace.pptx`: 3 řádky textu. PowerPoint pro web je kvůli kontrole pravopisu rozdělil do runů (`Stav `, `projektu`, ` Rozvodna Sever`).

**Word na Macu (desktop) ❌ nepoužit:** šablonu jsem nejdřív psal ve Wordu 16.115 přes AppleScript (`word-mac-sablona.applescript`).
Text i rozdělení formátováním prošly, ale `save as` zůstal viset na dialogu. Ten při zamčené obrazovce nešel zobrazit
ani zavřít (ani do kontejneru `~/Library/Containers/com.microsoft.Word/Data/Documents`). Zbytek proto proběhl ve Wordu pro web.

**Šablona z desktopového Wordu ✅ (24. 11. odpoledne):** hlavní session vyrobila `sablona-desktop-word.docx` ve
Word for Mac 16 přes AppleScript (`sondy/miniskilly/word-desktop/`, zdroj v `ZDROJ.md`): značky `{{jmeno}}`,
`{{oddeleni}}`, `{{datum}}`, `{{hodnoceni}}` (každá v jednom `w:t`) a pole `<w:fldSimple w:instr=" MERGEFIELD jmeno \* MERGEFORMAT ">`
s textem `«jmeno»`. Nadpis šablony začíná „aria“ (`ariaPotvrzení o školení`), to je vada šablony, ne appky.
`sablona-slozene-pole.docx` je tentýž dokument s polem přepsaným ručně na složené pole (`fldChar`/`instrText`).
Výsledky jsou v řádcích d3, d3k a d4. Klikal lab uživatel **Tomáš** (Petra a ostatní profily byly 24. 11. odpoledne
odhlášené; Tomáše jsem přidal do skupiny Členové webu sondy).

**Ovládací prvky obsahu ⛔ (dál neověřeno):** Word pro web na kartě Vložení nemá pole (MERGEFIELD) ani ovládací prvky obsahu
(`office-web/vlozeni.png`). Šablonu s nimi umí jen desktopový Word. V labu ji vyrobit nešlo (viz výš), takže ji ověřit
nešlo. Návrh: Pavel ve Wordu na Windows nebo Macu vloží do šablony jeden ovládací prvek obsahu (Vývojář → Prostý text,
značka `utvar`) a jedno pole `MERGEFIELD jmeno` a nahraje ji do `uprava/vstup/`. Appka pak zkusí vyplnit `w:sdt`
(nahradit text uvnitř `w:sdtContent`) a pole (`w:fldSimple`, nebo výsledek mezi `w:fldChar separate…end`).

## Kód (celý v `appka-uprava/src/webparts/uprava/UpravaWebPart.ts`)

Jádro je funkce `nahradVOdstavcich(xml, ns, 'p', 't', [[hledat, nahradit], …])`. V každém odstavci spojí text runů,
najde hledaný text a nový text zapíše do prvního dotčeného runu (s jeho formátem). Z dalších runů odebere jen
nahrazenou část. Funguje pro Word (`w:p`/`w:t`) i PowerPoint (`a:p`/`a:t`). Načtení: `GetFileByServerRelativePath(...)/$value`.
Uložení: `Files/AddUsingPath(overwrite=true)`, při 404 nejdřív `folders/AddUsingPath`. Knihovny se načítají `await import()`
až po kliku. Build 1.0.0.0 prošel napoprvé ✅ (`appka-uprava/build.log`).

## Varianta E: Graph Excel API nad existujícím sešitem

Sešit `uprava/vystup/rozpocet-graph.xlsx` v knihovně. Volání z `MSGraphClientV3`: id webu
(`/sites/{host}:/sites/…`), pak `…/drive/root:/cesta`, pak `/drives/{d}/items/{i}/workbook/…`.

- ❌ jedna adresa se dvěma cestami `/sites/{host}:/sites/x:/drive/root:/soubor` → `400 Resource not found for the segment 'root:'`
  (`klik.log`). Nejdřív je potřeba zjistit id webu ✅.
- Oprávnění: tenant lab má pro principála SPFx (SharePoint Online Web Client Extensibility) v Graphu schválené
  `Files.ReadWrite.All` (a `Sites.Read.All`, ne `Sites.ReadWrite.All`) ✅ (`../../ms-llm/spfx-granty.json`, výpis z 22. 11.).
  S tím PATCH i POST prošly. Minimální potřebný scope ❓: odebírat grant v labu kvůli testu nebudu (dotkne se všech appek).
  Přímé ověření grantů z mého účtu CLI selhalo (`Insufficient privileges`, `graph-scopes.log`).

Tlačítka `e-range` (PATCH `worksheets('rozpocet')/range(address='B2:C3')` a čtení A1:C6), `e-range-relace` (totéž
v relaci `createSession {persistChanges:true}` + hlavička `workbook-session-id`), `e-tabulka` (jednou `tables/add` F1:G3,
název `Polozky`) a `e-radek` (POST `tables('Polozky')/rows`). Kód je ve stejném web partu, verze 1.0.0.2.

| Co | Výsledek | Důkaz |
|---|---|---|
| PATCH `range(address='B2:C3')` bez relace | ✅ 0,5–0,9 s samotný PATCH, 1,1–1,7 s celé tlačítko; Excel přepočítá SUMA (540000) | `soubeh/soubeh.log`, `soubeh3.log` |
| PATCH v relaci (`persistChanges:true`) | ✅ PATCH 85–110 ms, celé tlačítko kolem 1 s; čtení v téže relaci vrátilo vždy právě zapsané hodnoty (2 ze 2) | `soubeh.log`, `soubeh3.log` |
| POST `tables/{tabulka}/rows` | ✅ 0,5–0,6 s; tabulka se rozšíří (F1:G4 → G5 → G6) | `soubeh.log`, `soubeh3.log`, `soubeh4.log` |
| ❗ čtení bez relace hned po zápisu bez relace | ⚠️ vrátí **předchozí stav**: 4 z 11 volání bez relace ve třech bězích (např. zapsáno `API 3:46:09`, přečteno `API 3:46:05`; nový řádek tabulky v odpovědi chyběl). Excel Online i pozdější čtení změnu mají. **Kdo potřebuje přečíst výsledek (přepočet), musí použít relaci** | `soubeh.log`, `soubeh3.log`, `soubeh4.log` |
| sešit má otevřený jiný uživatel (jen čtení) | ✅ změny z API se mu objevily v otevřeném Excelu Online do 12 s, bez obnovení stránky | `soubeh/soubeh-0-excel-otevreno.png` → `soubeh-1-excel-po-api.png` (Jakub) |
| sešit má otevřený k úpravám tentýž uživatel v druhé záložce | ✅ API zápisy i řádky tabulky se v otevřeném editoru propsaly (spoluautorství); zámek ani chyba nenastaly | `soubeh3-1-excel-po-api.png`, `soubeh4-1-excel-po-api.png` |
| ruční zápis v Excelu Online a hned potom PATCH na stejnou buňku | ✅ platí poslední zápis (API přepsalo ruční `B2=999`) | `soubeh3.log`, `soubeh3-1-excel-po-api.png` |
| uživatel bez práva upravovat (Jakub, návštěvník webu) volá PATCH / POST rows | ✅ odmítnuto `Contact the workbook owner to request edit access.`; čtení (seznam tabulek) projde. API běží právy přihlášeného uživatele | `soubeh/soubeh2.log` |
| API vidí ruční zápis editora (opačný směr) | ❓ neprokázáno: headless Excel Online ve druhé záložce psaní nepřevzal (výběr se nepohnul), měření je tedy nečisté. Že Graph čte, co Excel pro web uložil, je doloženo sekvenčně: vstup `rozpocet.xlsx` napsaný v Excelu pro web Graph přečetl i se vzorcem `=SUM(B2:B4)` (`klik-2.log`, `xlsx-graph`) | `soubeh4.log`, `soubeh4-0b-editor-g2.png` |

**Pro EG.D (⛔ v E.ON):** varianta potřebuje Graph oprávnění pro principála SPFx, v labu `Files.ReadWrite.All`, které tam
už je schválené. V E.ON ho musí schválit správce (stránka API access, nebo `webApiPermissionRequests` v balíčku). Bez něj
zbývá úprava v prohlížeči (b2), která žádné Graph oprávnění nepotřebuje, jen právo zápisu do knihovny.

## Neověřeno

| Co | Proč | Jak ověřit |
|---|---|---|
| šablona s ovládacími prvky obsahu (`w:sdt`) | Word pro web je vložit neumí; desktopová šablona z 24. 11. obsahuje jen značky a MERGEFIELD (to už ✅ d3) | šablona s ovládacím prvkem z desktopového Wordu, appka doplní větev pro `w:sdt` |
| složené pole MERGEFIELD uložené opravdu Wordem pro Windows | lab je macOS, d4 je ruční přepis | šablonu s polem uložit ve Wordu na Windows (EG.D), nahrát do `uprava/vstup/`, tlačítko „Šablona z desktop Wordu + MERGEFIELD“ |
| minimální Graph scope pro Excel API (`Files.ReadWrite.All` vs `Sites.ReadWrite.All`) | v labu je `Files.ReadWrite.All` už schválené pro celý tenant, odebrání by rozbilo jiné sondy | v E.ON se schvaluje jen to, co appka žádá v `webApiPermissionRequests`; zkusit s `Sites.ReadWrite.All` ⛔ |
| úprava v Container App | v prohlížeči prošlo všechno, server nebyl potřeba | jen pokud EG.D potřebuje .doc/.xls |
| velké soubory (desítky MB) a výkon JSZip v prohlížeči | nezkoušeno | nahrát velký docx (sonda dokumenty má 11,5 MB) a změřit |

## Soubory

`appka-uprava/` (SPFx projekt, `sharepoint/solution/egd-uprava-dokumentu.sppkg`), `nasad.sh` (nasazení přes `tools/lab-m365.sh`),
`nasazeni*.log`, `klik.log` / `klik-2.log` (proklik Petrou, `tools/spo-webpart-konzole.mjs`), `klik-3.log` (šablona z desktopového Wordu, Tomáš, `klik-tlacitka.mjs <data-k…>`), `kontrola-bez-mergefield.cjs`/`.log` (d3k), `vstup/`, `vystup/` (+ `vystup/lo/` převody LibreOffice),
`office-online/` (náhled výstupů v Office Online), `office-web/` (kroky a snímky psaní vstupů), `soubeh/` (varianta E).
App id v katalogu webu: `4024089f-f48a-4de3-98c5-ec3cc2dd54d6`, stránka `SitePages/uprava.aspx`.
