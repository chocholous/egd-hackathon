# Katalog funkcí EG.D: ukázkový web v labu

Web: **https://pavelchocholousgmail.sharepoint.com/sites/egd-ukazky** (domovská stránka `SitePages/katalog.aspx`).
Postaveno 24. 11. 2026 (session katalog-funkci). Značky: ✅ změřeno v labu · ❌ nefunguje (s důvodem) · ❓ neověřeno.

Pavel 24. 11. rozhodl takhle: jedna ukázková stránka, každá karta předvede jednu funkci. U každé oblasti je vysvětlení
„Co se děje na pozadí“.

Dvanáct hotových `.sppkg` ze sond je nasazených **beze změny kódu**. Každý je v katalogu aplikací webu jako samostatné
řešení. Jsou na SPFx 1.23.2 i 1.24.1 a vedle sebe fungují ✅.

## Výsledek: karta × účastník v prohlížeči

Postup: každou kartu jsem prošel ve skutečném Chrome pod účastníkem `egd09` nebo `egd10`. Klikl jsem a ověřil
výsledek a snímek uložil do `dukazy/karty/<karta>/`. Souhrnná tabulka je v [dukazy/vysledky.tsv](dukazy/vysledky.tsv).

| Oblast / stránka | Karta (balíček) | Účet | Výsledek | Co bylo vidět | Snímek |
|---|---|---|---|---|---|
| Data `data.aspx` | Evidence se souběhem (`miniskilly/etag-appka` 1.0.2) | egd09 + egd10 | ✅ | egd09 odeslal požadavek a schválil ho (POST 204). egd10 měl stránku otevřenou dřív a klikl Zamítnout. Dostal POST **412** a hlášku „Mezitím položku změnil někdo jiný“ | [07-egd10-po-412.png](dukazy/karty/data-etag/egd10/07-egd10-po-412.png) |
| Práva `prava.aspx` | Evidence s rolemi (`ms-prava/prvni-appka`) | egd09 + egd10 | ✅ | egd09 má štítek „Zadavatel“ a odeslal požadavek. egd10 má štítek „Schvalovatel“ a v záložce „Ke schválení (1)“ vidí položku od egd09 | [03-egd10-ke-schvaleni.png](dukazy/karty/prava-role/egd10/03-egd10-ke-schvaleni.png) |
| Práva | Vlastní API, role, SQL (`container-app/prava-db`) | egd09 + egd10 | ✅ | `/api/me` 200: egd09 má roli `Zadavatel`, egd10 `Schvalovatel`. `/api/zadosti` 200: egd09 dostal `[]` (jen své), egd10 všechny. Studený start 31 s | [02-egd10-zadosti.png](dukazy/karty/prava-db/egd10/02-egd10-zadosti.png) |
| Dokumenty `dokumenty.aspx` | Spokojenost a export (`ms-dokumenty/appka-spokojenost`) | egd09 | ✅ | Hlas 4 → POST 201. Word, PDF z Wordu (Graph), PDF (pdf-lib), Excel i PowerPoint skončily HOTOVO. 5 souborů je v `Dokumenty/exporty` ([výpis](dukazy/karty/dok-spokojenost/knihovna-exporty.txt)) | [02-egd09-export-log.png](dukazy/karty/dok-spokojenost/02-egd09-export-log.png) |
| Dokumenty | Generátor ze šablony (`dokumenty/spfx/egd-dokumenty`) | egd09 | ✅ | 5 položek Revize. Word ze šablony, pdf a xlsx se uložily, Graph PDF má 85 206 B. Vše je v `Dokumenty/sonda` | [01-egd09-generator.png](dukazy/karty/dok-generator/01-egd09-generator.png) |
| Dokumenty | Převod do PDF na serveru (`container-app/libreoffice`) | egd09 | ✅ | „Kdo jsem“ 200, studený start 30 s. `sablona.docx` → POST `/api/pdf` 200 za 1,3 s, výsledek začíná `%PDF-` a nabídl odkaz Stáhnout | [02-egd09-pdf.png](dukazy/karty/dok-pdf-ca/02-egd09-pdf.png) |
| E-mail `email.aspx` | Moje požadavky mailem (`ms-maily/prvni-appka`) | egd09 → egd10 | ✅ | Graph `POST /me/sendMail` vrátil 202 a appka hlásí „OK odesláno moje-pozadavky.csv“. V Outlooku egd10 je zpráva s přílohou z 19:43 | [03-egd10-inbox.png](dukazy/karty/mail/egd10-inbox/03-egd10-inbox.png) |
| AI `ai.aspx` | LLM gateway: whoami, chat, OCR (`ai/spfx`) | egd09 | ✅ | whoami 200 (scope `Gateway.Use`, appKey `demo`). Chat 200 za 1,3 s. OCR obrázku 200 s přesným přepisem | [02-egd09-ocr.png](dukazy/karty/ai-gateway/02-egd09-ocr.png) |
| AI | Spokojenost s AI (`ms-llm/spokojenost-ai` 1.0.0.3) | egd09 | ✅ | „Shrnout dnešek“: `/api/chat` 200 a appka ukázala „Návrh AI: …“. „Kolik AI zbývá“: `/api/kvota` 200 | [02-egd09-shrnuti.png](dukazy/karty/ai-spokojenost/shrnuti/02-egd09-shrnuti.png) |
| AI | Evidence s AI a kvótou „tiny“ (`ms-llm/prvni-appka` 1.0.0.4) | egd09 | ✅ | První shrnutí prošlo (200). Druhé vrátilo **429** a appka napsala „Dnešní limit AI pro appku je vyčerpaný“. Ukázat limit je záměr karty | [02-egd09-podruhe.png](dukazy/karty/ai-llm/02-egd09-podruhe.png) |
| Cizí API `cizi-api.aspx` | ARES, Open-Meteo, ČNB (`ms-dokumenty/appka`) | egd09 | ✅ | ARES 200 (Škoda Auto), ARES přes spHttpClient 200, Open-Meteo 200. ČNB skončila `net::ERR_FAILED` s hláškou „nejde volat z prohlížeče (CORS)“, což je očekávaný výsledek | [01-egd09-cizi-api.png](dukazy/karty/cizi-api/01-egd09-cizi-api.png) |
| Graph `graph.aspx` | OBO pošta **se souhlasem** (`container-app/obo` 0.2.0) | egd10 | ✅ | Pavel 24. 11. chtěl obě varianty. „Pošta přes OBO“ vrátila 200: OBO výměna 344 ms, Graph 450 ms, `me` = „Účastník 10“ a jeho poslední zprávy | [posta-obo-egd10.png](dukazy/karty/obo-egd10/posta-obo-egd10.png) |
| Graph | OBO pošta **bez souhlasu** | egd09 | ✅ (chyba je záměr) | Tentýž klik vrátil 403 `AADSTS65001` „The user or administrator has not consented … egd-ca-obo-api“. whoami (API) 200, studený start ~47 s. „Přímo z SPFx“ → 403 `ErrorAccessDenied` (také záměr) | [posta-obo-egd09.png](dukazy/karty/obo-egd09/posta-obo-egd09.png) |
| Graph | **Copilot přes OBO** (stejný balíček `container-app/obo` 0.2.0.0, druhá instance web partu; Pavel 24. 11.: samostatná karta, **potřebuje licenci Microsoft 365 Copilot**) | egd09 | ✅ (chyby jsou záměr) | „Retrieval přes OBO“ → 403 `AADSTS65001`: účastníci nemají souhlas API → Graph se scopy Copilota (egd10 má souhlas jen na poštu). „Retrieval přímo z SPFx“ → 403 **„Authorization Failed - User does not have valid license“**: SPFx oprávnění prošla, chybí licence. Licence účastníků bez plánu Copilot: [licence-ucastniku.json](dukazy/licence-ucastniku.json). Ze sondy ([obo-copilot.md](../container-app/obo-copilot.md), výsledky ca-obo): se souhlasem OBO projde a rozhoduje licence, bez ní Retrieval 403 „valid license“ (petra). **Retrieval s licencí je změřený jen přímo ze SPFx** (200 s úryvky, [copilot-graph.md](../ms-llm/copilot-graph.md)). **Přes OBO s licencí ❓ nedoměřeno**, nikdo z testovaných licenci neměl (tomas 200 s `hits: []` 8 min po odebrání licence = nejspíš zpoždění ❓). **Chat přes OBO ❓**: 201/200, ale bez licence Copilot neodpoví (zopakovaný dotaz). Trial Copilot končí 25. 11. 08:31 UTC | [01-retrieval-obo.png](dukazy/karty/obo-copilot-egd09/01-retrieval-obo.png), [02-retrieval-primo.png](dukazy/karty/obo-copilot-egd09/02-retrieval-primo.png), [03-text-karty.png](dukazy/karty/obo-copilot-egd09/03-text-karty.png) |
| Graph | **Copilot přes OBO s licencí** (Pavel 24. 11.: „doover, dokud mame licence“) | egd10 + dočasně licence Copilot + souhlas s 8 scopy | ✅ Chat, ❓ Retrieval přes OBO | **Chat přes OBO 200, `copilotOdpovedel: true`**, 2 zprávy, Graph 13–15 s, odpověď Copilota v češtině („údaj se nepodařilo dohledat…“). Retrieval přímo z SPFx 200 vrátil 4 úryvky (`spokojenost.docx/pdf/pptx` v `exporty`). **Retrieval přes OBO 200, ale `hits: []`** (2×, 1,6 s za tepla). Parametr `resourceMetadata` je vyloučený ✅: přímé volání tokenem SPFx vrátilo 4 výsledky s ním i bez něj ([resourcemetadata/klik.json](dukazy/copilot-licence/resourcemetadata/klik.json)). Rozdíl tedy dělá OBO token, příčina ❓. Čtecí scopy (`Sites.Read.All`, `Files.Read.All`) mají oba tokeny. Zápisové scopy příčinou nejsou ✅. Pavel 24. 11. schválil test („ok, dej mu readwriteall“): s `Sites.ReadWrite.All` v OBO tokenu vrátil Retrieval přes OBO opět 0 (2×), grant byl potom hned vrácen. Zbývá aplikace v tokenu (API `egd-ca-obo-api` vs. SPFx principal) ❓. Chat přes OBO je nedeterministický: správnou odpověď „4 z 5, 1 hlas“ se 4 zdroji dal jednou ze 6 volání ([egd10-rw/chat.png](dukazy/copilot-licence/egd10-rw/chat.png)), jinak „údaj nenašel“ ([licence.log](dukazy/copilot-licence/licence.log)) Přesun licence a grantu: [dukazy/copilot-licence/licence.log](dukazy/copilot-licence/licence.log) | [chat.png](dukazy/copilot-licence/egd10-2/chat.png), [pretr.png](dukazy/copilot-licence/egd10-2/pretr.png), [retr.png](dukazy/copilot-licence/egd10-2/retr.png) |

Rozcestník pod egd09: [02-karty.png](dukazy/karty/rozcestnik/02-karty.png).

### OBO se souhlasem a bez souhlasu (obě varianty na jednom webu)

Souhlas `egd-ca-obo-api` → Microsoft Graph je potřeba pro každého uživatele. Na začátku ho v labu měli jen tomas a
petra (sonda tak dělala negativní test, [../container-app/obo.md](../container-app/obo.md)). Proto původně egd09 dostal
❌ `AADSTS65001`.

Pavel 24. 11. řekl: „vyzkouset s a bez udeleni souhlasu API OBO, pokud umime mit obe varianty“. Umíme ✅. Souhlas
typu `Principal` jsem udělil jen egd10, jen se scopy, které server žádá (`GRAPH_SCOPES` v Container App:
`User.Read Mail.ReadBasic`):

```bash
az rest --method post --url https://graph.microsoft.com/v1.0/oauth2PermissionGrants --headers Content-Type=application/json \
  --body '{"clientId":"7a0b43a3-e80e-431f-9722-bffe50daff3f","resourceId":"e9e4c7a2-9a70-413e-bf92-fb987471717d",
           "consentType":"Principal","principalId":"d13528e1-0847-465c-b3ad-e12727ed6516","scope":"User.Read Mail.ReadBasic"}'
```

Výsledek ([dukazy/obo-grant-egd10.json](dukazy/obo-grant-egd10.json), před/po:
[obo-grant-pred.json](dukazy/obo-grant-pred.json) 4 granty → [obo-grant-po.json](dukazy/obo-grant-po.json) 5):

| Účastník | Souhlas API → Graph | Pošta přes OBO |
|---|---|---|
| egd10 | `Principal` (24. 11.) | ✅ 200, vlastní zprávy |
| egd09 | žádný | ✅ očekávaná chyba 403 `AADSTS65001` |

Pro E.ON z toho plyne: buď IT udělí souhlas správce pro všechny (`AllPrincipals`, jeden grant), nebo jednotlivě
(`Principal` na uživatele). Uživatel si ho nedá sám. Odebrání souhlasu egd10:
`az rest --method delete --url https://graph.microsoft.com/v1.0/oauth2PermissionGrants/<id z obo-grant-egd10.json>`.

## Přístup: účastníci egd01–egd10 jsou vlastníci webu

Pavel 24. 11. napsal, že web smí upravovat všichni účastníci, případně všichni v tenantu jako vlastníci. Zvolil jsem
**egd01–egd10 ve skupině Vlastníci webu**. Je to užší varianta než skupina „Všichni kromě externích uživatelů“:
vlastníci můžou stránky, seznamy i appky upravit a smazat, takže to má být jen pro účastníky. Nastavuje se to
`nasadit.sh web --ano` (proměnná `VLASTNICI`). Výpis skupiny je v [dukazy/vlastnici.txt](dukazy/vlastnici.txt),
11 členů (pavel.admin + egd01–10) ✅.

Ověřeno pod egd09 (24. 11.) ✅:

- web se otevře a na rozcestníku jsou všechny karty ([01-rozcestnik-karty.png](dukazy/karty/vlastnik-egd09/01-rozcestnik-karty.png));
- `effectivebasepermissions` webu vrací High `2147483647` a `ManagePermissions` = true, tedy vlastník
  ([klik.json](dukazy/karty/vlastnik-egd09/prava-webu/klik.json));
- karta Práva mu dál ukazuje roli **Zadavatel** ([02-prava-role-vlastnik.png](dukazy/karty/vlastnik-egd09/prava/02-prava-role-vlastnik.png)).

Proč karta Práva dál ukazuje Zadavatel: `tools/prava-role-cli.sh` dává skupině Vlastníci na seznamu `PozadavkyPrava`
Úplné řízení. Pak by appka všem vlastníkům ukázala „Správce“. `seznamy.sh` proto skupinu Vlastníci z tohoto seznamu
odebere. Úplné řízení tam má jen správce kolekce webu (pavel.admin), role egd09 a egd10 jdou ze skupin Katalog.
Vlastník si ale umí práva na seznamu vrátit. Kdo to udělá, uvidí roli Správce. Stav obnoví `nasadit.sh seznamy --ano`.

**Obnova po rozbití:** `sondy/katalog-funkci/nasadit.sh vse --ano`. Kroky jsou web, balicky, seznamy a stranky.
- Chybějící seznam, sloupec, šablona nebo appka v katalogu se doplní.
- Stránky se přesunou do koše a založí znovu z `texty.py`.
- Smazaný web ani data, která někdo v seznamech přepsal, se neobnoví.

Bez `--ano` vypíše jen plán. Krok `seznamy` jsem spustil 4× a stránky 2×, opakovaně to prošlo bez chyby ✅. Celý
krok `vse` v jednom běhu jsem nespouštěl ❓.

## Souhlasy SPFx: nic nového schvalovat netřeba (OBO výše má vlastní souhlas)

- Granty SPFx principalu „SharePoint Online Web Client Extensibility“ jsou před nasazením i po něm shodné ✅. Jde o
  13 grantů `AllPrincipals`: Graph `Files.Read.All` a `Mail.Send`, `Gateway.Use`, `access_as_user` pro data-api,
  egd-ca-dokumenty a egd-ca-obo-api. Výpisy jsou v [dukazy/grant-pred.json](dukazy/grant-pred.json) a
  [dukazy/grant-po.json](dukazy/grant-po.json), rozdíl je prázdný.
- Prakticky se to potvrdilo v prohlížeči ✅. Pod egd09 prošlo AadHttpClient na všechna čtyři API a MSGraphClient
  (`Files.Read.All` i `Mail.Send`).
- `webApiPermissionRequests` v balíčcích z katalogu webu nic nového nevyžádaly. Fronta žádostí se ale nedala vypsat:
  `m365 spo serviceprincipal permissionrequest list` → 403. CLI hledá principal přes Graph a jeho appka na to nemá
  oprávnění. Výpis je v [dukazy/permissionrequest-pred.json](dukazy/permissionrequest-pred.json). Zda se ve frontě
  objevily duplicitní čekající žádosti, je ❓. Na funkci to vliv nemá, granty už existují.

## Co v labu vzniklo nebo se změnilo

| Co | Kde | Jak |
|---|---|---|
| Komunikační web „Katalog funkcí EG.D“ (lcid 1029, Blank) s katalogem aplikací webu | `/sites/egd-ukazky` | `nasadit.sh web --ano`. Vlastník: pavel.admin |
| egd09 a egd10 ve skupině Členové webu | web | `nasadit.sh web --ano` |
| 12 řešení v katalogu webu, nasazená a nainstalovaná | `/sites/egd-ukazky/AppCatalog` | `nasadit.sh balicky --ano`. Stav katalogu je v [dukazy/stav-katalogu.txt](dukazy/stav-katalogu.txt) |
| Seznamy `Pozadavky`, `PozadavkyPrava`, `Spokojenost`, `Revize` + soubory | web | `nasadit.sh seznamy --ano`. Logy jsou v `dukazy/seznamy*.log` |
| Skupiny „Katalog Zadavatelé / Schvalovatelé / Správci“, úrovně „EGD Zadavatel / EGD Schvalovatel“ | web | `tools/prava-role-cli.sh` (volá `seznamy.sh`) |
| Úroveň **Návrh** na seznamu `Pozadavky` pro egd09 a egd10 (seznam má vlastní práva, zděděná byla zkopírována) | seznam | `seznamy.sh`. Důvod je v kartě Data níže |
| 7 stránek oblastí a rozcestník `katalog.aspx`, nastavený jako domovská stránka | `SitePages` | `nasadit.sh stranky --ano` |
| egd01–egd10 ve skupině Vlastníci webu (Pavel 24. 11.), skupina Vlastníci odebrána ze seznamu `PozadavkyPrava` | web | `nasadit.sh web --ano`, `seznamy.sh` |
| **Entra:** app role v `egd-sonda-data-api` (`fec3e01a-…`): egd09 = Zadavatel, egd10 = Schvalovatel | Entra | `az rest POST …/appRoleAssignedTo` ✅ ([dukazy/data-api-role.json](dukazy/data-api-role.json)). Bez role API vrací 403. Odebrání: `DELETE …/appRoleAssignedTo/<id>` |
| **Entra:** souhlas `egd-ca-obo-api` → Graph `Principal` jen pro egd10 (`User.Read Mail.ReadBasic`) | Entra | `az rest POST …/oauth2PermissionGrants` ✅, viz OBO výše. Odebrání `DELETE …/oauth2PermissionGrants/<id>` |
| **Licence Copilot** (trial `BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS`) dočasně alice → egd10 (19:45–20:30Z), **teď zase u alice** (50 vypnutých plánů jako ráno). Grant egd10 dočasně rozšířený o 8 scopů Copilota a na chvíli o `Sites.ReadWrite.All`, **teď zase `User.Read Mail.ReadBasic`** | Entra | Pavel 24. 11.: „licence presouvej jak bude potreba“, „ok, dej mu readwriteall“. Celý průběh je v [dukazy/copilot-licence/licence.log](dukazy/copilot-licence/licence.log) ✅ |
| Časové pásmo webu: (UTC-08:00) Tichomoří USA (Id 13) → **Praha (Id 6)** | web | `tools/spo-web-pasmo.sh` (krok `web`) ✅ |
| Vzhled EG.D: téma webu z tokenů `_znacka.scss` a záhlaví v barvě akce | web | `nasadit.sh vzhled --ano` ([stylovat.py](stylovat.py)) ✅ |
| Testovací data z ověření | seznamy, knihovna, schránka egd10 | 2 požadavky, 1 hlas, soubory v `Dokumenty/exporty` a `Dokumenty/sonda`, 1 mail egd09 → egd10 |

Nic placeného nevzniklo. Container Apps běžely už předtím, všechny s `min 0` (`az containerapp list`, 24. 11.).

## Rozhodnutí u každé karty: seznamy a vlastnosti

Web party čtou seznam vždy z **aktuálního webu** (`pageContext.web.absoluteUrl`). Přes vlastnost jde změnit jen název
seznamu, ne web. Proto jsem seznamy založil na `/sites/egd-ukazky`. Schémata jsem zkopíroval z původních webů
(`spo field list`, 24. 11.).

| Karta | Seznam / zdroj | Vlastnosti web partu (z původního nasazení) |
|---|---|---|
| data-etag | `Pozadavky` (Title „Požadavek“, `Popis` Note, `Stav` Choice Nový/Schváleno/Zamítnuto, `Komentar` Note) a 3 ukázkové položky. Schvalovat smí, kdo má ApproveItems (0x10, `EvidenceWebPart.ts:36`). Člen ho nemá, proto mají egd09 a egd10 na seznamu úroveň **Návrh** (BasePermissions.Low 1012866047 obsahuje 0x10) | `seznam: Pozadavky` |
| prava-role | Vlastní seznam `PozadavkyPrava` s vlastními právy (`ReadSecurity=2`, `WriteSecurity=2`) přes `tools/prava-role-cli.sh --appka Katalog`. Kdyby sdílel `Pozadavky` s ostatními kartami, rozbila by se jim práva | `seznam: PozadavkyPrava` |
| prava-db | **Míří na původní web.** API má v prostředí Container App `SP_SITE_URL=…/egd-sonda-data-prava`, takže „Sdílet“ a „Práva položky“ pracují s položkami tam. Seznam `Sdileni` na novém webu jsem nezaložil, tlačítko by ukazovalo jiné položky, než API sdílí. Ověřené jsou „Kdo jsem“ a „Žádosti“ | `apiUrl` ca-egd-data-api, `apiAppId fec3e01a-…`, `listTitle Sdileni` (`tools/prava-db-test.py:17-18`) |
| dok-spokojenost, ai-spokojenost | Sdílený `Spokojenost` (`Hodnoceni` Number 1–5, `Den` Text 10). Font `Roboto-Regular.ttf` je v `Dokumenty/assets` | `seznam: Spokojenost` |
| dok-generator | `Revize` je v kódu natvrdo (5 položek z `sondy/dokumenty/src/data.mjs`). `sablona.docx` a font jsou zkopírované z `egd-sonda-dokumenty` do `Dokumenty/sonda/assets` | `description` (jiná vlastnost neexistuje) |
| dok-pdf-ca | Bez seznamu, jen API. CORS hlídá origin tenantu, nový web prošel ✅ | `apiUrl` ca-egd-dokumenty, `apiAppId 54c0b31d-…` (`libreoffice.md:34,37`) |
| mail, ai-llm, cizi-api (dok-evidence) | Sdílený `Pozadavky` | `seznam: Pozadavky` |
| ai-gateway | Bez seznamu | `gatewayUrl` ca-egd-llm-gateway, `apiAppId 7b59591a-…`, `appKey demo` (registr `APPS_JSON`) |
| obo | Bez seznamu | `apiUrl` ca-egd-obo, `apiAppId 9809454b-…` (`obo/stav.json`) |

Gateway URL a appKey (`demo` / `tiny`) mají `ms-llm/prvni-appka` a `spokojenost-ai` natvrdo v kódu. Kód jsem neměnil.

Stránky: na stránce Plánované úlohy nemá vlastní web part. SPFx běží jen s otevřenou stránkou
(`prehled/varianty.md`, řádek 7.1), proto je plán vysvětlený textem na stránce Cizí API a doložený odkazem na běh Jobu
a Recurrence.

## Texty „Co se děje na pozadí“

Texty jsou v [texty.py](texty.py), jeden blok na kartu. Každý blok má 3–5 kroků, odpověď na otázku, proč (ne)potřebuje
server, cestu přes Power Automate, co chce od IT E.ON, poznámku „Na tomto webu“, návod „Jak to vyzkoušet“ a odkazy na
důkazy. Texty vycházejí jen ze souborů v repu (sondy, `10-container-app.md`, `prehled/varianty.md`). Seznam jako frontu
přes PA uvádějí s 43 s podle `10-container-app.md:136`. Odkazy na důkazy vedou do privátního repa na GitHubu a všechny
cesty existují (kontrola skriptem při psaní). Soubory sond, které ještě nejsou commitnuté (např. část `obo/dukazy`),
začnou fungovat až po commitu hlavní session.

## Postup (opakovatelný)

```bash
sondy/katalog-funkci/nasadit.sh web --ano        # web + katalog + členové (bez --ano jen plán, rc 10)
sondy/katalog-funkci/nasadit.sh balicky --ano    # 12 × spo app add/deploy/install do katalogu webu (balicky.tsv)
sondy/katalog-funkci/nasadit.sh seznamy --ano    # seznamy.sh: seznamy, práva, data, šablona a font
sondy/katalog-funkci/nasadit.sh stranky --ano    # stranky.py + texty.py: 7 stránek + rozcestník (domovská)
sondy/katalog-funkci/nasadit.sh vzhled --ano     # stylovat.py: téma EG.D na web + záhlaví v barvě akce
sondy/katalog-funkci/nasadit.sh stav             # jen čtení
node sondy/katalog-funkci/klik.mjs e2e-egd09 <url stránky> <složka> rozbal "click:<css>" wait:5000 shotv:x
```

Všechny skripty jsou idempotentní. Co existuje, přeskočí. Stránku přesunou do koše a založí znovu.
`WEB=… CLENOVE="egd05 egd06"` je přesměruje jinam.

Soubory:

- [nasadit.sh](nasadit.sh): orchestrace.
- [balicky.tsv](balicky.tsv): karta → `.sppkg`.
- [seznamy.sh](seznamy.sh): seznamy.
- [stranky.py](stranky.py) a [texty.py](texty.py): stránky a texty.
- [sppkg-info.py](sppkg-info.py): solution id, verze, SPFx, web party, výchozí vlastnosti a `webApiPermissionRequests` z `.sppkg`.
- [klik.mjs](klik.mjs): průchod kartou v Chrome účastníka.

## Pasti (✅ změřeno 24. 11.)

1. **Interní název sloupce s diakritikou.** `spo field add --xml` s `DisplayName="Komentář schvalovatele"` založí
   `Koment_x00e1__x0159__x0020_schva`, i když je `Name="Komentar"`. Web part pak hlásí 400 „The field or property
   'Komentar' does not exist“. Oprava: zakládat s ASCII DisplayName a přejmenovat přes `spo field set --Title`
   (`seznamy.sh`, funkce `pole`).
   Druhý funkční postup ✅: `spo field add --xml '<Field … Name="Hodnoceni" DisplayName="Hodnocení"/>' --options AddFieldInternalNameHint`
   vytvoří interní název `Hodnoceni` s českým popiskem na jeden krok. Bez té volby vznikne `Koment_x00e1_…`
   ([dukazy/nazvy-poli.log](dukazy/nazvy-poli.log), dočasný seznam je v koši). Postup používá `egd-prvni-appka` (`appka.mjs:452`).
   Pravidlo pro skilly (Pavel 24. 11.): skill má zakázat diakritiku a mezery v názvech seznamů. Předal jsem ho rolím
   skill-prvni-appka a miniskilly, úprava skillů je na nich.
2. **Datum v českém webu.** `spo listitem add --Termin 2026-12-03` vrátí „Zadejte datum takhle: 23.02.2012“. Datum
   musí mít tvar `03.12.2026`. Z kódu (REST) se zapisuje ISO. Bezpečný je tvar bez `Z` (`2026-12-03T00:00:00`), který web
   bere jako místní půlnoc. Pak ale musí platit past 8.
10. **Přechodné `ECONNRESET` z SharePointu** při zakládání stránek (24. 11. večer 3× za sebou). Rozpracovaná stránka
   pak zůstane bez web partů. Příčina byla v místní síti, Pavel ji 24. 11. vyřešil. `stranky.py` přesto síťové
   chyby opakuje až 3× s čekáním.
8. **Časové pásmo webu je (UTC-08:00) Tichomoří USA.** Platí pro všechny weby v labu, i `egd0X-dev`. Datum
   zapsané z kódu jako půlnoc UTC (`2026-12-03T00:00:00Z`) se pak zobrazí jako **02.12.2026**. CLI v11 pásmo nastavit
   neumí (`spo site add --timeZone` jen pro ClassicSite), proto vznikl `tools/spo-web-pasmo.sh <web> 6 --ano`
   (CSOM ProcessQuery). Po přepnutí na Prahu ukazují všechny tři zápisy 03.12.2026
   ([dukazy/datum.log](dukazy/datum.log)) ✅. Weby se zakládají přes `nasadit.sh web`, který pásmo nastaví sám.
9. **Téma webu bez zápisu do tenantu.** `spo theme set` přidává motiv pro celý tenant. `stylovat.py` místo toho volá
   REST `/_api/ThemeManager/ApplyTheme` jen na tento web. Paletu Fluent počítá z `$egd-*` v
   `skills/egd-prvni-appka/…/_znacka.scss`, žádná barva není ve skriptu natvrdo. Web party mají vlastní styly
   v balíčcích (kód neměníme), téma proto mění jen rámec webu: záhlaví (`headerEmphasis 3` = indigo `#1200E0`),
   navigaci, odkazy, okraje tabulky a text. Snímky pod egd09: [rozcestnik.png](dukazy/karty/vzhled-egd09/rozcestnik.png),
   [data.png](dukazy/karty/vzhled-egd09-data/data.png).
3. **CLI v11, sekce ThreeColumn.** `spo page text add --column 2` vrátí „Invalid column '2'“. Rozcestník je proto
   tabulka v jednom textovém web partu.
4. **Přihlášení účastníka je jen v běžícím Chrome.** APFS klon profilu `e2e-egd09` skončil na přihlašovací stránce
   (session cookie). `klik.mjs` se proto k běžícímu Chrome připojí přes `DevToolsActivePort` a pracuje v novém
   panelu, který zavře. Pozor: `SingletonLock` je visící symlink, `fs.existsSync` vrací false, správně je `lstat`.
5. **Líné vykreslení web partů.** Web part pod okrajem obrazovky se nenačte, dokud se k němu nescrolluje
   (`data-sp-web-part-id` v DOM chybí). Řeší to krok `rozbal`.
6. **Více web partů na stránce sdílí `data-k`, `#log` a podobně.** V UI to nevadí, každý web part hledá ve svém
   `domElement`. Automatizace ale musí selektor omezit na `[data-sp-web-part-id="…"]`.
7. **Studené starty Container Apps** (min 0) byly při prvním kliku 30–47 s. Je to očekávané chování (Pavel 24. 11.),
   karty to v textu uvádějí.

## Neověřeno a otevřené

- ❓ Čekající žádosti o API v SharePoint admin centru: fronta se nedala přes CLI vypsat (403). Ověřit v UI
  `…-admin.sharepoint.com` → API access.
- ❓ Karta prava-db, „Sdílet“ a „Práva položky“: na tomto webu jsem je nezkoušel, API míří na `egd-sonda-data-prava`.
  Ověřeno je to v sondě ([../container-app/prava-db.md](../container-app/prava-db.md), logy 14–16).
- ❓ Karty pod účastníky egd01–08 jsem nezkoušel. Přístup mají jako vlastníci webu. Na seznamu `Pozadavky` má skupina
  Vlastníci Úplné řízení (zkopírováno při přerušení dědění), takže by měli smět schvalovat. Na `PozadavkyPrava` přístup
  nemají; co karta Práva ukáže, je ❓. Data-api role mají jen egd09 a egd10,
  ostatní dostanou u vlastního API 403.
- Kvóta `tiny` (ai-llm) je na den a na uživatele. Po prvním shrnutí karta pod stejným účtem ukazuje 429 až do půlnoci.
