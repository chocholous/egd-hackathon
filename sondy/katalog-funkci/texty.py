"""Texty Katalogu funkcí EG.D. Jen z důkazů v repu (cesty u každé karty), nic z dokumentace.
Vlastnosti web partů = hodnoty z původního nasazení sond (zdroj u každé karty v README.md)."""

REPO = "https://github.com/chocholous/egd-workshop/blob/main"
GW = "https://ca-egd-llm-gateway.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io"

UVOD = (
    "<h2>Katalog funkcí EG.D</h2>"
    "<p>Každá karta předvede jednu funkci, kterou jsme ověřili v labu. Na stránce oblasti je nad každou appkou "
    "krátké vysvětlení, co se děje na pozadí, jestli to potřebuje vlastní server, jak by to šlo přes Power Automate "
    "a co je potřeba od IT E.ON. Appky jsou nasazené beze změny kódu, tak jak vznikly v sondách.</p>"
    "<p>Přehled variant pro všechny požadavky: "
    f'<a href="{REPO}/prehled/varianty.md">prehled/varianty.md</a>, katalog serverových funkcí: '
    f'<a href="{REPO}/10-container-app.md">10-container-app.md</a>.</p>'
)

PA_FRONTA = ("seznam jako fronta: appka zapíše položku do seznamu, flow „When an item is created“ ji zpracuje a výsledek "
             "zapíše zpět. Změřeno: výsledek v položce po 43 s, licence Standard, pro okamžitou odpověď v appce pomalé "
             "(10-container-app.md:136).")

OBLASTI = [
 {"stranka": "data.aspx", "nazev": "Data v seznamu", "karta": "Zápis, schválení a souběh dvou lidí nad jedním seznamem.",
  "uvod": "Seznam SharePointu jako databáze appky: zápis pod přihlášeným uživatelem, schvalování a ochrana proti tomu, "
          "aby si dva lidé navzájem přepsali změnu.",
  "karty": [{
   "kratce": "Evidence požadavků se souběhem (ETag)", "nazev": "Evidence požadavků – souběh dvou schvalovatelů",
   "co": "Zadavatel pošle požadavek, schvalovatel ho schválí nebo zamítne. Když schvalují dva najednou, druhý dostane "
         "upozornění místo tichého přepsání.",
   "kroky": ["Tlačítko <em>Odeslat ke schválení</em> zapíše položku do seznamu <code>Pozadavky</code> na tomto webu, "
             "pod vaším přihlášením.",
             "Při načtení si appka ke každé položce zapamatuje její verzi (ETag).",
             "Při schválení pošle verzi zpátky. Když položku mezitím změnil někdo jiný, SharePoint vrátí 412 a nic "
             "nepřepíše. Uvidíte „Mezitím položku změnil někdo jiný“.",
             "Seznam čte po stránkách po 1000 položkách a filtruje jen podle indexovaných sloupců, aby fungoval i nad "
             "limitem 5000 položek."],
   "server": "nepotřebuje. Vše dělá SharePoint pod přihlášeným uživatelem.",
   "pa": "náhrada není: dva flow nad jednou položkou souběh neřeší (prehled/varianty.md, řádek 1.3).",
   "it": "nic pro celý tenant. Stačí role na webu: Člen pro zápis, pro schvalování právo „schvalovat položky“.",
   "tady": "seznam <code>Pozadavky</code> založil skript katalogu. Schvalovat smí, kdo má ApproveItems, proto "
           "účastníci dostali na tomto seznamu úroveň Návrh.",
   "zkus": "pošlete požadavek, otevřete <em>Ke schválení</em> ve dvou oknech (dva účty) a schvalte v obou.",
   "dukazy": ["sondy/miniskilly/etag-prohlizece.jsonl", "sondy/miniskilly/ui/etag/2-A-schvaleno.png",
              "sondy/miniskilly/etag.jsonl", ("skills/egd-data-seznamy/SKILL.md", "skill egd-data-seznamy")],
   "webpart": "3d81fe5e-92a0-428a-b960-5fcf470daf24",
   "vlastnosti": {"nadpis": "Evidence požadavků", "seznam": "Pozadavky"}}]},

 {"stranka": "prava.aspx", "nazev": "Práva a role", "karta": "Kdo co vidí a smí: role v SharePointu a sdílení přes API.",
  "uvod": "Dvě cesty k právům: role ze SharePoint skupin, které vynucuje sám SharePoint, a sdílení konkrétní položky, "
          "které běžný uživatel udělat nesmí, a proto ho dělá server.",
  "karty": [{
   "kratce": "Evidence s rolemi (vidí jen své)", "nazev": "Evidence s rolemi Zadavatel / Schvalovatel / Správce",
   "co": "Zadavatel vidí jen své požadavky, schvalovatel vidí všechny a smí je schválit. Appka ukáže, jakou máte roli.",
   "kroky": ["Seznam <code>PozadavkyPrava</code> má vlastní práva: skupiny Katalog Zadavatelé, Schvalovatelé a Správci.",
             "Nastavení „číst a upravovat jen své“ zařídí, že SharePoint cizí položky zadavateli vůbec nevrátí.",
             "Schvalovatel smí upravovat cizí položky díky právu CancelCheckout ve vlastní úrovni oprávnění, mazat nemusí.",
             "Appka si jen zjistí, co smíte (EffectiveBasePermissions), a podle toho ukáže roli a záložky. "
             "Vynucuje to SharePoint, ne kód appky."],
   "server": "nepotřebuje.",
   "pa": "náhrada není, role ve flow nikdo nevynucuje (prehled/varianty.md, řádek 4.1).",
   "it": "nic pro celý tenant, stačí vlastník webu. Entra skupina uvnitř SharePoint skupiny začne platit se zpožděním "
         "15–40 minut.",
   "tady": "práva nastavil tools/prava-role-cli.sh: egd09 je Zadavatel, egd10 Schvalovatel.",
   "zkus": "pod egd09 pošlete požadavek, pod egd10 ho uvidíte v záložce Ke schválení.",
   "dukazy": ["sondy/ms-prava/zjisteni.md", "sondy/ms-prava/appka/03-eva.json", "sondy/ms-prava/bez-mazani.jsonl",
              ("skills/egd-prava-role/SKILL.md", "skill egd-prava-role")],
   "webpart": "35d2a567-3b96-4d18-907d-16f486e50e79",
   "vlastnosti": {"nadpis": "Evidence s rolemi", "seznam": "PozadavkyPrava"}},
  {
   "kratce": "Vlastní API: role z Entra, data z SQL, sdílení položky", "nazev": "Vlastní API: role, databáze a sdílení",
   "co": "Appka volá vlastní API v Azure. API pozná, kdo volá a jakou má roli, čte žádosti z databáze a umí nasdílet "
         "položku seznamu jinému člověku.",
   "kroky": ["Appka pošle API token přihlášeného uživatele.",
             "API z tokenu zjistí, kdo volá, a jeho roli z Entra (Zadavatel, Schvalovatel, Spravce). Bez role vrátí 403.",
             "Žádosti čte z Azure SQL.",
             "Sdílení položky dělá API svou vlastní identitou: přeruší dědění práv, autorovi nechá Přispívání a příjemci "
             "přidá Čtení."],
   "server": "potřebuje. Běžný uživatel práva rozdávat nesmí, SharePoint mu to odmítne s 403 „Access is denied“ "
             "(změřeno v sondě).",
   "pa": "akce „Grant access to an item“ skončila chybou 400 „The selected permission level is not valid“ pro všechny "
         "zkoušené úrovně (10-container-app.md, řádek Práva na položky).",
   "it": "Azure subscription s Container Apps, managed identita se Sites.Selected a právem na konkrétní web, "
         "registrace API s app rolemi, schválení API pro SPFx a rozhodnutí, jestli smí appka na jednom webu vše.",
   "tady": "API je napojené na seznam <code>Sdileni</code> na webu egd-sonda-data-prava. Tady proto funguje "
           "<em>Kdo jsem</em> a <em>Žádosti</em>. Tlačítka pro sdílení pracují s položkami na tom původním webu.",
   "zkus": "klikněte na Kdo jsem (API) a Žádosti (SQL přes API).",
   "dukazy": ["sondy/container-app/prava-db.md", "sondy/container-app/prava-db/08-test-sdileni.jsonl",
              "sondy/container-app/prava-db/14-tomas-klik.log", "sondy/container-app/prava-db/16-jakub-403.png"],
   "webpart": "e11ebff0-d972-4f4a-8401-aaf1bbf40fb9",
   "vlastnosti": {"apiUrl": "https://ca-egd-data-api.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io",
                  "apiAppId": "fec3e01a-6ce4-4f9e-9dff-a61b354151fb", "listTitle": "Sdileni"}}]},

 {"stranka": "dokumenty.aspx", "nazev": "Dokumenty", "karta": "Word, Excel, PowerPoint a PDF z dat seznamu, převod do PDF.",
  "uvod": "Tři způsoby, jak vyrobit dokument: knihovny přímo v prohlížeči, PDF přes Microsoft Graph a převod "
          "hotového souboru na serveru s LibreOffice.",
  "karty": [{
   "kratce": "Spokojenost: hlasování a export do dokumentů", "nazev": "Spokojenost: hlasování a export",
   "co": "Hlasování 1–5 do seznamu a export výsledků do Wordu, Excelu, PowerPointu a PDF.",
   "kroky": ["Hlas se zapíše do seznamu <code>Spokojenost</code> pod vaším přihlášením.",
             "Tlačítka exportu vyrobí soubor z dat seznamu knihovnami v JavaScriptu přímo v prohlížeči.",
             "Hotový soubor se uloží do knihovny Dokumenty, složka <code>exporty</code>.",
             "Word → PDF jde přes Microsoft Graph (<code>?format=pdf</code>) s oprávněním Files.Read.All. "
             "S Files.Read Graph vrátí 403."],
   "server": "nepotřebuje.",
   "pa": "převod Word → PDF přes OneDrive „Convert file“, licence Standard, ověřený běh (10-container-app.md, "
         "řádek Dokumenty). Převádí jen soubory v OneDrive uživatele.",
   "it": "schválení Files.Read.All pro SPFx, platí pro celý tenant.",
   "zkus": "dejte hlas a klikněte na export docx a graphpdf.",
   "dukazy": ["sondy/ms-dokumenty/README.md", "sondy/ms-dokumenty/spokojenost-klik.log",
              "sondy/ms-dokumenty/graph-scope.log", ("skills/egd-dokumenty/SKILL.md", "skill egd-dokumenty")],
   "webpart": "f8fbbd7b-5022-4888-9121-d544eb74d96a",
   "vlastnosti": {"nadpis": "Spokojenost s prostředím kanceláře dnes", "seznam": "Spokojenost"}},
  {
   "kratce": "Generátor dokumentů ze šablony Word", "nazev": "Generátor dokumentů: revize zařízení",
   "co": "Ze seznamu <code>Revize</code> vyrobí Word (i ze šablony), Excel, PowerPoint a PDF s českou diakritikou.",
   "kroky": ["Appka načte položky seznamu <code>Revize</code>.",
             "Po kliknutí si teprve stáhne potřebnou knihovnu (Word, Excel, PowerPoint nebo PDF).",
             "Šablonu <code>sablona.docx</code> a písmo pro PDF bere z knihovny Dokumenty (<code>sonda/assets</code>).",
             "Výsledek uloží do knihovny do složky <code>sonda</code>."],
   "server": "nepotřebuje.",
   "pa": "šablona Word přes Word Online „Populate“ je Premium a nezkoušeli jsme ji; převod do PDF přes OneDrive "
         "„Convert file“ je Standard a ověřený.",
   "it": "schválení Files.Read.All jen pro tlačítko PDF přes Graph. Ostatní nic.",
   "zkus": "klikněte na docxtpl (Word ze šablony) a pdf.",
   "dukazy": ["sondy/dokumenty.md", "sondy/dokumenty/out-spo"],
   "webpart": "fbeaf821-f908-453a-ad1c-c4e13c485e73",
   "vlastnosti": {"description": "DokumentyGenerator"}},
  {
   "kratce": "Převod souboru do PDF na serveru (LibreOffice)", "nazev": "Převod do PDF na serveru (Container App)",
   "co": "Vyberete hotový docx, xlsx nebo pptx a server vám vrátí PDF.",
   "kroky": ["Prohlížeč pošle soubor na API a přiloží token přihlášeného uživatele.",
             "Server ověří token (podpis, pro koho je, oprávnění).",
             "Server soubor převede programem LibreOffice.",
             "Server vrátí PDF a soubor ze své dočasné složky smaže."],
   "server": "potřebuje. Převod hotového Office souboru chce LibreOffice a ten v prohlížeči spustit nejde. "
             "První volání po nečinnosti trvá 25–28 s (server se probouzí).",
   "pa": "OneDrive „Convert file“, licence Standard, ověřený běh. Jen soubory v OneDrive uživatele.",
   "it": "Azure subscription s Container Apps a registrem image, sestavení image, registrace aplikace v Entra a "
         "schválení API pro SPFx. Odchozí síť server nepotřebuje.",
   "zkus": "klikněte na Kdo jsem (token), vyberte soubor a klikněte na Převést do PDF.",
   "dukazy": ["sondy/container-app/libreoffice.md", "sondy/container-app/libreoffice/dukazy/spfx-klik.log",
              "sondy/container-app/libreoffice/dukazy/spfx-klik/webpart.png"],
   "webpart": "874880f3-cc01-4935-a0ad-393df1499f29",
   "vlastnosti": {"apiUrl": "https://ca-egd-dokumenty.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io",
                  "apiAppId": "54c0b31d-b482-4d3f-900c-3e6c0e5fe870"}}]},

 {"stranka": "email.aspx", "nazev": "E-mail", "karta": "Mail s přílohou CSV jménem přihlášeného uživatele.",
  "uvod": "Appka pošle e-mail s přílohou za přihlášeného uživatele, bez vlastního serveru.",
  "karty": [{
   "kratce": "Moje požadavky mailem jako CSV", "nazev": "Poslat moje požadavky mailem",
   "co": "V záložce Moje požadavky zadáte adresáta a appka mu pošle vaše požadavky jako přílohu CSV.",
   "kroky": ["Appka sestaví CSV z vašich položek seznamu <code>Pozadavky</code>.",
             "Zavolá Microsoft Graph <code>/me/sendMail</code> jménem přihlášeného uživatele a CSV přiloží.",
             "Bez schválení Mail.Send Graph vrátí 403, po schválení 202. Příloha do 30 MB prošla, 40 MB ne.",
             "Po schválení oprávnění je potřeba otevřít nové okno, stará stránka drží starý token."],
   "server": "nepotřebuje.",
   "pa": "Outlook „Send an email (V2)“, licence Standard, běh a doručení ověřené. Poslat ze sdílené schránky přes PA "
         "v labu skončilo chybou 404.",
   "it": "schválení Mail.Send pro SPFx, jednou pro celý tenant.",
   "zkus": "v záložce Moje požadavky napište adresu kolegy z labu a klikněte na Poslat mailem.",
   "dukazy": ["sondy/ms-maily/README.md", "sondy/ms-maily/inbox-csv.log", "sondy/ms-maily/pa-runs.log",
              ("skills/egd-maily/SKILL.md", "skill egd-maily")],
   "webpart": "56f0f09f-1e2b-4810-a93b-d8633dc23c7b",
   "vlastnosti": {"nadpis": "Evidence požadavků", "seznam": "Pozadavky"}}]},

 {"stranka": "ai.aspx", "nazev": "AI", "karta": "Chat, OCR a shrnutí přes firemní LLM gateway s kvótou.",
  "uvod": "Všechny AI appky volají jednu LLM gateway v Azure. Klíč k modelu je jen na serveru, gateway hlídá denní kvótu "
          "a zapisuje, kdo kolik spotřeboval.",
  "karty": [{
   "kratce": "Gateway: kdo jsem, chat, OCR", "nazev": "LLM gateway: kdo jsem, chat a OCR",
   "co": "Tři tlačítka přímo na gateway: kdo jsem, otázka pro model a přečtení textu z obrázku.",
   "kroky": ["Appka si vyžádá token přihlášeného uživatele pro gateway a přidá kód appky (X-App-Id).",
             "Gateway ověří přihlášení a že kód appky zná.",
             "Zkontroluje denní kvótu tokenů pro uživatele a appku.",
             "Zavolá Azure OpenAI nebo Document Intelligence svou identitou, bez klíče v kódu.",
             "Zapíše do logu uživatele, appku, tokeny a cenu a vrátí odpověď."],
   "server": "potřebuje. Bez serveru by byl klíč k modelu vidět v prohlížeči. První volání po nečinnosti trvá "
             "přibližně 28–30 s.",
   "pa": "konektor Azure AI Foundry „Chat completion“, licence Standard, ověřený běh, i OCR obrázku. Bez kvóty na "
         "appku a bez záznamu po uživatelích. Jako fronta: " + PA_FRONTA,
   "it": "LLM endpoint a kvóta, registrace API v Entra, schválení API pro SPFx, CORS na gateway, smlouva a DPA.",
   "zkus": "klikněte na whoami, pak napište otázku a klikněte na Chat.",
   "dukazy": ["sondy/ai.md", "sondy/overeni/container-app/gateway/06-chyby-2026-11-24.md",
              ("skills/egd-llm-gateway/SKILL.md", "skill egd-llm-gateway")],
   "webpart": "5b0b4f5c-2d3a-4a51-9d0e-6a1f3c7e8b24",
   "vlastnosti": {"gatewayUrl": GW, "apiAppId": "7b59591a-0058-4799-be76-0d1f5b79ca95", "appKey": "demo"}},
  {
   "kratce": "Spokojenost s AI shrnutím", "nazev": "Spokojenost s AI: shrnutí hlasování",
   "co": "Stejné hlasování jako u Dokumentů, navíc AI shrnutí a spotřeba kvóty.",
   "kroky": ["Hlas se zapíše do seznamu <code>Spokojenost</code>.",
             "Tlačítko AI pošle data gateway s tokenem uživatele a kódem appky „demo“.",
             "Gateway odpoví a appka ukáže, kolik kvóty zbývá."],
   "server": "potřebuje gateway (viz karta výše).",
   "pa": PA_FRONTA,
   "it": "stejné jako u gateway.",
   "zkus": "dejte hlas a klikněte na AI tlačítko.",
   "dukazy": ["sondy/ms-llm/README.md", "sondy/ms-llm/e2e-1.0.0.3/klik.json"],
   "webpart": "9669ff55-924e-4bae-bf73-e84f7de8cd13",
   "vlastnosti": {"nadpis": "Spokojenost s prostředím kanceláře dnes", "seznam": "Spokojenost"}},
  {
   "kratce": "Evidence s AI a vyčerpanou kvótou", "nazev": "Evidence s AI: shrnutí, OCR a limit kvóty",
   "co": "Evidence požadavků s tlačítky Shrnout popis a Přečíst soubor (OCR). Tahle verze má záměrně malou kvótu "
         "(kód appky „tiny“), aby bylo vidět, co uživatel uvidí po vyčerpání limitu.",
   "kroky": ["Appka pošle popis požadavku gateway s tokenem uživatele a kódem appky „tiny“.",
             "Gateway zkontroluje kvótu. Dokud zbývá, vrátí návrh shrnutí.",
             "Po vyčerpání vrátí 429 a appka napíše „Dnešní limit AI pro appku je vyčerpaný. Zkuste to zítra.“"],
   "server": "potřebuje gateway.",
   "pa": PA_FRONTA,
   "it": "stejné jako u gateway; navíc rozhodnutí o kvótách na appku.",
   "zkus": "otevřete formulář, napište popis a klikněte na Shrnout popis.",
   "dukazy": ["sondy/ms-llm/e2e-429/klik.json", "sondy/ms-llm/chyby-gateway.md"],
   "webpart": "4d0850fa-6cee-41a0-be2c-b0aac1ed61fb",
   "vlastnosti": {"nadpis": "Evidence požadavků", "seznam": "Pozadavky"}}]},

 {"stranka": "cizi-api.aspx", "nazev": "Cizí API a plánované úlohy",
  "karta": "Data z ARES a počasí přímo z prohlížeče; co nejde bez serveru a jak na plán.",
  "uvod": "Některá veřejná API jde volat přímo z appky, jiná prohlížeč zablokuje. Plánované úlohy appka v prohlížeči "
          "neumí vůbec, běží jen s otevřenou stránkou.",
  "karty": [{
   "kratce": "ARES, počasí a ČNB z appky", "nazev": "Cizí API z appky: ARES, Open-Meteo, ČNB",
   "co": "Panel Ověření miniskillů: tlačítka ares, aressp, meteo a cnb (plus exporty do dokumentů).",
   "kroky": ["ARES a Open-Meteo posílají hlavičku, že je smí volat jakákoli stránka (CORS). Appka je volá přímo.",
             "ČNB tu hlavičku neposílá, prohlížeč odpověď zahodí. U tlačítka cnb je chyba očekávaný výsledek.",
             "Data bez CORS (ČNB, OTE, scraping webu) proto stahuje server: Container Apps Job je stáhne podle plánu "
             "a pošle dál, třeba mailem.",
             "Plánovaná úloha: Container Apps Job s cronem se spustil přesně v nastavený čas, nebo Power Automate "
             "Recurrence."],
   "server": "pro ARES a počasí ne; pro ČNB, OTE, scraping a plán ano (nebo Power Automate).",
   "pa": "akce HTTP je Premium, v labu flow s HTTP nešlo zapnout (403 MissingAdequateQuotaPolicy). Recurrence je "
         "Standard a ověřená (mail doručen).",
   "it": "pro Job: Azure subscription s Container Apps a managed identitou, pro mail z Jobu omezení na jednu schránku "
         "(Exchange RBAC). Pro PA s HTTP licence Premium.",
   "zkus": "klikněte na ares, meteo a cnb v panelu Ověření miniskillů.",
   "dukazy": ["sondy/napojeni.md", "sondy/ms-dokumenty/konzole-fetch-test.log",
              "sondy/overeni/napojeni/job-executions-2026-11-22.json", "sondy/ms-maily/pa-runs.log",
              ("skills/egd-externi-api/SKILL.md", "skill egd-externi-api"),
              ("skills/egd-planovane-ulohy/SKILL.md", "skill egd-planovane-ulohy")],
   "webpart": "229a4c9b-2eb7-4ecb-8bc1-27a8879e38db",
   "vlastnosti": {"nadpis": "Evidence požadavků", "seznam": "Pozadavky"}}]},

 {"stranka": "graph.aspx", "nazev": "Graph jménem uživatele",
  "karta": "Pošta přihlášeného uživatele přes vlastní API (OBO) místo širokého oprávnění pro SPFx.",
  "uvod": "Appka chce data uživatele z Microsoft 365 (tady předměty jeho pošty). Přímo z SPFx by oprávnění platilo pro "
          "všechny SPFx appky v tenantu. Přes vlastní API (On-Behalf-Of) ho dostane jen jedno API.",
  "karty": [{
   "kratce": "Pošta přes OBO", "nazev": "OBO pošta: Graph jménem uživatele přes vlastní API",
   "co": "Tlačítko Pošta přes OBO vrátí předměty vašich 5 posledních mailů. Pošta přímo z SPFx skončí 403, protože SPFx "
         "takové oprávnění nemá. To je záměr.",
   "kroky": ["Appka si vyžádá token přihlášeného uživatele pro API.",
             "API token ověří.",
             "API se Entra prokáže, že je to ono (v labu bez hesla přes managed identitu).",
             "Entra vymění token uživatele za token pro Microsoft Graph.",
             "API přečte poštu a vrátí jen 5 předmětů, nic víc."],
   "server": "potřebuje. Schválení Graph oprávnění pro SPFx by platilo pro všechny SPFx appky v tenantu. Přes OBO ho má "
             "jen jedno API a server rozhoduje, co vrátí.",
   "pa": "konektory běží jako vlastník připojení, ne jako uživatel appky. Jestli to PA umí jinak, jsme neověřili.",
   "it": "registrace API v Entra, souhlas správce API → Graph (uživatel ho dát nesmí), schválení API pro SPFx, "
         "federated credential nebo Key Vault, Container Apps a registr image. Conditional Access jsme neověřili.",
   "tady": "ukázka obou variant souhlasu. <b>egd10 souhlas má</b> (správce udělil API → Graph jen jemu, typ Principal, "
           "User.Read Mail.ReadBasic): Pošta přes OBO vrátí jeho poslední zprávy. <b>egd09 souhlas nemá</b>: tentýž klik "
           "skončí 403 s chybou AADSTS65001 „user or administrator has not consented“. Souhlas pro všechny (AllPrincipals) "
           "by tu chybu odstranil u každého. Uživatel si ho dát sám nesmí, protože to v E.ON bude rozhodnutí IT.",
   "zkus": "klikněte na whoami (API), pak na Pošta přes OBO. Pod egd10 uvidíte zprávy, pod egd09 chybu souhlasu. "
           "Pošta přímo z SPFx vrátí 403 záměrně: SPFx samo právo na poštu nemá.",
   "dukazy": ["sondy/container-app/obo.md", "sondy/katalog-funkci/dukazy/karty/obo-egd10/posta-obo-egd10.png",
              "sondy/katalog-funkci/dukazy/karty/obo-egd09/posta-obo-egd09.png", "sondy/container-app/obo/dukazy/spfx/tomas.prochazka.json",
              "sondy/container-app/obo/dukazy/spfx/tomas.prochazka-posta.png"],
   "webpart": "f6aa9c1a-afda-448e-a188-96437bc2bd7c",
   "vlastnosti": {"apiUrl": "https://ca-egd-obo.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io",
                  "apiAppId": "9809454b-59c2-4d85-8bf6-dbd1481b1d6b"}},
  {
   "kratce": "Copilot přes OBO (potřebuje licenci)", "nazev": "Copilot přes OBO: Microsoft 365 Copilot API jménem uživatele",
   "co": "Stejné API jako u pošty, ale volá Microsoft 365 Copilot API (Retrieval = hledání v obsahu, ke kterému má "
         "uživatel přístup). <b>Na rozdíl od pošty potřebuje každý uživatel licenci Microsoft 365 Copilot.</b> "
         "Bez ní Retrieval vrátí 403 „User does not have valid license“. Účastníci licenci nemají, proto tu čekejte chybu.",
   "kroky": ["Appka si vyžádá token přihlášeného uživatele pro naše API (stejně jako u pošty).",
             "API vymění token (OBO) za token pro Graph se scopy, které Copilot API chce: Sites.Read.All, Files.Read.All, "
             "Mail.Read, People.Read.All, OnlineMeetingTranscript.Read.All, Chat.Read, ChannelMessage.Read.All, "
             "ExternalItem.Read.All.",
             "Bez souhlasu správce s těmito scopy výměna skončí chybou AADSTS65001 a do Copilota se nedojde.",
             "Se souhlasem API zavolá Graph beta /copilot/retrieval. Graph ověří licenci uživatele.",
             "API vrátí nalezené úryvky (nebo je pošle do vlastního LLM přes gateway: tlačítko Retrieval + gateway LLM)."],
   "server": "potřebuje, a tady je to hlavní důvod OBO: Copilot API chce široká oprávnění včetně pošty, chatů a přepisů "
             "schůzek. Kdyby je dostal SPFx, platila by pro všechny SPFx appky v tenantu. Přes OBO je má jen jedno API. "
             "Ze SPFx přímo prošel jen Retrieval (s licencí 200), Chat ze SPFx skončil 403 i s licencí.",
   "pa": "neověřeno.",
   "it": "licence Microsoft 365 Copilot pro každého uživatele, souhlas správce API → Graph s 8 scopy výše (jen pro jednu "
         "registraci API, ne pro SPFx), Container Apps. Cena licence je ❓ (v labu neměřeno).",
   "tady": "účastníci licenci Copilot nemají a souhlas se scopy Copilota také ne. Retrieval přes OBO proto skončí "
           "403 AADSTS65001 už při výměně tokenu, Retrieval přímo z SPFx 403 „User does not have valid license“. "
           "<b>S licencí změřeno 24. 11. večer na egd10</b> (licence z trialu dočasně přesunutá, souhlas API → Graph s 8 scopy jen pro egd10): "
           "<b>Copilot Chat přes OBO odpověděl</b> (200, 2 zprávy, odpověď Copilota v češtině, 13–15 s). "
           "Retrieval přímo z SPFx 200 vrátil 4 úryvky z exportů Spokojenosti na tomto webu. "
           "Retrieval přes OBO vrátil 200, ale 0 výsledků (3× za sebou). Tentýž dotaz s tokenem SPFx najde 4, s parametrem resourceMetadata i bez něj. Rozdíl je tedy v OBO tokenu. Zápisová oprávnění to nezmění, ani s Sites.ReadWrite.All se nic nenašlo. Příčina je nejspíš v tom, jaká aplikace token drží ❓. "
           "Chat odpovídá pokaždé jinak: jednou ze 6 pokusů správně („4 z 5, 1 hlas“ se 4 odkazy na soubory), jinak napsal, že údaj nenašel. "
           "Bez licence Chat jen zopakuje dotaz a Retrieval vrátí 403. Trial s licencí Copilot v labu končí 25. 11. 08:31 UTC, "
           "pak už tu půjde vidět jen chyba.",
   "zkus": "v Microsoft 365 Copilot API zadejte dotaz a klikněte na Retrieval přes OBO. Uvidíte chybu souhlasu. "
           "Retrieval přímo z SPFx ukáže 403 „Authorization Failed - User does not have valid license“: oprávnění SPFx "
           "tu prošla, chybí jen licence (ověřeno pod egd09 24. 11.).",
   "dukazy": ["sondy/katalog-funkci/dukazy/copilot-licence/egd10-2/chat.png", "sondy/katalog-funkci/dukazy/copilot-licence/egd10-1/klik.json", "sondy/container-app/obo-copilot.md", "sondy/container-app/obo/dukazy/copilot/ropc-bez-licence-petra.novakova.jsonl",
              "sondy/container-app/obo/dukazy/copilot/ropc-bez-souhlasu-lucie.jsonl",
              "sondy/katalog-funkci/dukazy/karty/obo-copilot-egd09/01-retrieval-obo.png",
              "sondy/katalog-funkci/dukazy/karty/obo-copilot-egd09/02-retrieval-primo.png",
              ("sondy/ms-llm/copilot-graph.md", "copilot-graph.md (403 bez licence)")],
   "webpart": "f6aa9c1a-afda-448e-a188-96437bc2bd7c",
   "vlastnosti": {"apiUrl": "https://ca-egd-obo.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io",
                  "apiAppId": "9809454b-59c2-4d85-8bf6-dbd1481b1d6b"}}]},
]
