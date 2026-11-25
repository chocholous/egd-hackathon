# Microsoft 365 Copilot API přes OBO na Container App `ca-egd-obo`

Session ca-obo, 24. 11. 2026. Navazuje na [obo.md](obo.md) (OBO tunel) a [../ms-llm/copilot-graph.md](../ms-llm/copilot-graph.md)
(Copilot API přímo ze SPFx). Smysl: oprávnění, která SPFx nedostane, nebo která by šla všem SPFx appkám v tenantu
(principal SharePoint Online Web Client Extensibility `08e18876`), dostane **jen registrace `egd-ca-obo-api`** (`9809454b-…`).

Platí **jen pro Copilot API**. OBO pošta z [obo.md](obo.md) (`User.Read Mail.ReadBasic`) licenci Copilot nepotřebuje a funguje ✅.

Kód: `obo/api/server.mjs` (endpointy `POST /api/copilot/retrieval | chat | odpoved`), web part `obo/spfx` (0.2.0.0),
nástroje `tools/ca-obo.sh copilot-grant | copilot-revert | copilot-test` a `tools/ca-obo-klik.mjs … retr,chat,odp,pretr,pchat`.
Důkazy: `obo/dukazy/copilot/`.

## Výsledky

**Uzavřeno 24. 11. jako „funguje jen s licencí Microsoft 365 Copilot“** (Pavel). Licence Copilot u testovacích uživatelů
během měření **nebyla**: tomas.prochazka ji měl odebranou od 08:36:50Z (session ms-llm), kontrola `licenseDetails` 08:45Z
a 19:29Z = jen `FLOW_FREE`, `SPE_E5` ([tomas-licence-0845.txt](obo/dukazy/copilot/tomas-licence-0845.txt)). Petra ji neměla
nikdy. V mých měřeních (ráno) tedy licence nebyla. **S licencí změřila večer session katalog-funkci** pod egd10: licenci dočasně přesunula
z alice a grant egd10 rozšířila o 8 scopů (Pavel: „klidne ten copilot pres obo doover, dokud mame licence“). Licence u egd10
v `licenseDetails` = `M365_COPILOT_*` Success ([licence.log](../katalog-funkci/dukazy/copilot-licence/licence.log)). Session katalog-funkci pak licenci vrátila alici a grant egd10 zúžila na `User.Read Mail.ReadBasic` (ověřeno čtením
Graphu 24. 11. ~21:00 SEČ; Pavel předtím rozhodl grant nevracet, vrácení proběhlo podle původního plánu session).
Proto názvy souborů: `ropc-tomas-1.jsonl` i `ropc-bez-licence-tomas.prochazka.jsonl` jsou obě volání tomase **bez licence**.

Všechna čísla jsou z `obo/dukazy/copilot/`. Čas = celé volání z klienta (ROPC curl / klik ve web partu), OBO = výměna tokenu
na Container App, Graph = volání Graph z Container App.

| Položka | Varianta | Stav | Důkaz |
|---|---|---|---|
| OBO výměna za token Graphu s 8 Copilot scopy | Container App, režim `mi` (federated credential, bez tajemství), grant jen API `egd-ca-obo-api`, Principal tomas+petra | ✅ 200, OBO 107–291 ms, token má všech 8 scopů (`oboScope`) | `ropc-*.jsonl`, `spfx-bez-licence/tomas.prochazka.json` |
| Retrieval | přes OBO, petra **bez licence** (ROPC) | ❌ Graph 403 `Authorization Failed - User does not have valid license` (Graph 1,8 s), API vrací 502 | `ropc-bez-licence-petra.novakova.jsonl` |
| Retrieval | přes OBO, tomas bez licence 8–10 min po odebrání (ROPC i klik ve web partu) | ⚠️ 200, `retrievalHits: []` (Graph 1,0–1,2 s, celkem 5,0–5,3 s). Petra ve stejné minutě 403. Vysvětluji to zpožděním po odebrání licence (ms-llm s licencí měla stejným dotazem úryvek), ověřené to není ❓ | `ropc-tomas-1.jsonl`, `ropc-bez-licence-tomas.prochazka.jsonl`, `spfx-bez-licence/tomas.prochazka-retr.png` |
| Retrieval | přímo ze SPFx (`MSGraphClientV3`, principal 08e18876), tomas bez licence | ⚠️ 200 `retrievalHits: []`, 3,4 s (totéž jako přes OBO) | `spfx-bez-licence/tomas.prochazka-pretr.png` |
| Retrieval | přímo ze SPFx **s licencí** | ✅ 200, úryvky z dokumentu (sonda ms-llm, ř. 3, 5, 6) | [../ms-llm/copilot-graph.md](../ms-llm/copilot-graph.md) |
| Retrieval | přes OBO **s licencí** (egd10, klik ve web partu na egd-ukazky, session katalog-funkci, 19:47–20:15Z, 6 průchodů, licence od 19:45:09Z) | ⚠️ 200, ale `hits: []` ve všech 6 průchodech, i 30 min po přidání licence (Graph 0,9–3,1 s, OBO 193–276 ms, celkem 1,6–31,4 s; requestId 3. průchodu `d74130f1-35b9-483b-83f2-151aee7eacf5`). **Tentýž uživatel, dotaz i minuta přímo ze SPFx = 4 úryvky** (ř. níže). Příčinou **není** `resourceMetadata` ✅: přímé volání tokenem SPFx vrátilo 4 úryvky s ním i bez něj (4 volání střídavě, 19:54:44Z). Rozdíl dělá **OBO token**. Čtecí scopy `Sites.Read.All` a `Files.Read.All` mají oba tokeny (OBO token je má v `oboScope`). **Ani zápisové scopy příčinou nejsou** ✅: s `Sites.ReadWrite.All` v `oboScope` (A/B, Pavel: „ok, dej mu readwriteall“, grant jen egd10 20:10–20:15Z) vrátil Retrieval přes OBO 0 úryvků ve 2 průchodech, bez něj 0 ve 4 průchodech. Přímé volání ze SPFx vrátilo 4 úryvky ve všech 6 průchodech ([egd10-rw](../katalog-funkci/dukazy/copilot-licence/egd10-rw/klik.json), [egd10-rw2](../katalog-funkci/dukazy/copilot-licence/egd10-rw2/klik.json), [egd10-bez-rw](../katalog-funkci/dukazy/copilot-licence/egd10-bez-rw/klik.json), souhrn v [licence.log](../katalog-funkci/dukazy/copilot-licence/licence.log)). Zbývá **aplikace v tokenu** (`azp` = `egd-ca-obo-api` místo SPFx `08e18876`) ❓. Že Retrieval filtruje podle volající aplikace, z měření vyplývá, potvrzené to není | [../katalog-funkci/dukazy/copilot-licence/egd10-1/klik.json](../katalog-funkci/dukazy/copilot-licence/egd10-1/klik.json), [retr.png](../katalog-funkci/dukazy/copilot-licence/egd10-1/retr.png), [egd10-2](../katalog-funkci/dukazy/copilot-licence/egd10-2/klik.json), [egd10-3](../katalog-funkci/dukazy/copilot-licence/egd10-3/klik.json), [resourcemetadata/klik.json](../katalog-funkci/dukazy/copilot-licence/resourcemetadata/klik.json) |
| Retrieval | přímo ze SPFx **s licencí** (egd10, totéž kliknutí) | ✅ 200, 4 úryvky (`spokojenost.docx`, `.pdf`, `.pptx`, `spokojenost-prehled.pdf`) ve všech 6 průchodech (vč. A/B), 1,4–2,8 s | [../katalog-funkci/dukazy/copilot-licence/egd10-1/pretr.png](../katalog-funkci/dukazy/copilot-licence/egd10-1/pretr.png), klik.json obou průchodů |
| Chat | přímo ze SPFx | ❌ 403 `Required scopes = [Sites.Read.All, Mail.Read, People.Read.All, OnlineMeetingTranscript.Read.All, Chat.Read, ChannelMessage.Read.All, ExternalItem.Read.All]` (176 ms) | `spfx-bez-licence/tomas.prochazka-pchat.png` |
| Chat | přes OBO, bez licence (tomas i petra, ROPC i web part) | ⚠️ scopy projdou: `POST /conversations` 201 a `…/chat` 200 (Graph 1,6–2,0 s, celkem 4,3–6,0 s). Copilot ale **neodpoví**: v konverzaci je jen zopakovaný dotaz (`messages` = 1, `copilotOdpovedel: false`). Bez licence tedy žádná chyba, jen prázdná odpověď | `ropc-*.jsonl` (pole `raw` s celou konverzací), `spfx-bez-licence/tomas.prochazka-chat.png` |
| Chat | přes OBO **s licencí** (egd10, 6 průchodů 19:47–20:15Z) | ✅ 200, `copilotOdpovedel: true` ve všech 6 průchodech (3 základní + 3 v A/B), 2 zprávy. **Obsah je nedeterministický:** jen 1× ze 6 (`egd10-rw`, 20:11Z, requestId `568595bf-3606-4421-a141-d1d57a5f5fec`) Copilot odpověděl správně („Průměrná spokojenost … je **4 z 5**. Aktuální přehled uvádí **1 hlas**“) se 4 zdroji. Ostatních 5× napsal „údaj se nepodařilo dohledat“ (z toho 1× s RW, takže to nezávisí na scopu). Copilot odpověděl česky vlastním textem („V dostupných interních podkladech se mi nepodařilo dohledat údaj…“), `zdroje: []`. Graph `/chat` 13,1–14,5 s (requestId 3. průchodu `17b038f1-88d6-4572-957c-7ef8c91ae6f0`), založení konverzace 3,0 / 1,9 s, OBO 142 / 213 ms, celkem 16,4 / 16,8 s. Data uživatele tedy Chat přes OBO dosáhnout umí, ale jen občas ❓ | [egd10-rw/chat.png](../katalog-funkci/dukazy/copilot-licence/egd10-rw/chat.png), [egd10-1/chat.png](../katalog-funkci/dukazy/copilot-licence/egd10-1/chat.png), klik.json všech průchodů |
| Retrieval + gateway LLM („odpověď bez Copilot Chatu“) | přes OBO: Retrieval, pak 2. OBO výměna za `api://<gateway>/Gateway.Use` a `POST /api/chat` gateway (gpt-4.1-mini) | ✅ řetěz funguje: tomas 200, 2. OBO 134 ms, gateway 1,9 s (za tepla, celkem 2,7–3,1 s), studená gateway 29 s. Odpověď „V dodaných úryvcích není…“, protože Retrieval vrátil 0 úryvků. Petra: 502, Retrieval 403 licence | `ropc-tomas-1.jsonl`, `ropc-bez-licence-*.jsonl`, `spfx-bez-licence/tomas.prochazka-odp.png` |
| Bez souhlasu | lucie (grant nemá), všechny 3 endpointy | ✅ 403 `AADSTS65001` už při OBO výměně (0,2–0,3 s) | `ropc-bez-souhlasu-lucie.jsonl` |
| Po vrácení grantů | tomas, všechny 3 endpointy | ✅ 403 `AADSTS65001`, vrácení platí hned | `po-revert-tomas-copilot.jsonl` |

**Závěr:** S licencí **Chat API přes OBO odpovídá** ✅ (13–15 s), správný údaj z dokumentů ale dal jen 1× ze 6. Retrieval s licencí vrací úryvky přímo ze SPFx ✅, přes OBO trvale 0 (příčinou je OBO token, ne scopy ani parametry; nejspíš aplikace v tokenu ❓). Bez licence vrací Retrieval 403 a Chat jen prázdnou konverzaci. Chat API potřebuje 7 širokých delegovaných scopů (pošta,
chaty, kanály, přepisy schůzek, lidé, weby, externí položky). OBO je dokáže dát **jen naší API registraci**, ne všem SPFx
appkám. Obě API vyžadují licenci Microsoft 365 Copilot u každého uživatele. V labu byla jen 1 trial licence BP+Copilot (konec 25. 11. 08:31 UTC). **Pro EG.D ⛔: záleží na tom, zda a komu mají
licenci Copilot.** Bez ní zbývá varianta bez Copilotu: vlastní vyhledávání (`/search/query` ze SPFx) + gateway LLM (ta není součástí tohoto měření ❓).

**Neověřeno:** proč Retrieval přes OBO vrací 0 úryvků. `resourceMetadata` i scopy (čtecí i `Sites.ReadWrite.All`) jsou vyloučené měřením,
zbývá aplikace v tokenu. Potvrdit by to šlo jen dotazem na Microsoft (requestId v tabulce) nebo voláním Retrieval tokenem jiné
vlastní registrace. Pro EG.D z toho plyne: grounding přes Retrieval dělat ze SPFx (s licencí), ne přes OBO.

**Ověřit v E.ON:** u uživatele s licencí Copilot kliknout ve web partu `egd-ca-obo` 0.2.0.0 „Retrieval přes OBO“
a „Copilot Chat přes OBO“ (`tools/ca-obo-klik.mjs <profil> <stránka> <výstup> retr,chat,odp`). Předtím musí admin udělit
souhlas těch 8 scopů jedné registraci API.

## Granty (co se změnilo a jak to vrátit)

Před změnou uloženo `obo/dukazy/copilot/grant-pred-20261124T084256Z.json` (granty API + `requiredResourceAccess`), 08:42:56Z.

| Grant | Před | Po (`tools/ca-obo.sh copilot-grant`) |
|---|---|---|
| `egd-ca-obo-api` → Microsoft Graph, consentType **Principal**, jen tomas.prochazka a petra.novakova (8:42Z, vráceno 19:24Z) | `User.Read Mail.ReadBasic` | + `Sites.Read.All Mail.Read People.Read.All OnlineMeetingTranscript.Read.All Chat.Read ChannelMessage.Read.All ExternalItem.Read.All Files.Read.All` |
| `egd-ca-obo-api` → `EGD sonda AI gateway` (`7b59591a…`), Principal, tomas + petra | nebyl | `Gateway.Use` (druhá OBO výměna pro variantu Retrieval + vlastní LLM) |
| `requiredResourceAccess` API | Graph `User.Read Mail.ReadBasic` | Graph všech 10 scopů + gateway `Gateway.Use` (jen deklarace, souhlas dávají granty výše) |
| Principal SPFx `08e18876` (všechny SPFx appky) | beze změny | **beze změny** |

Vrácení: `tools/ca-obo.sh copilot-revert obo/dukazy/copilot/grant-pred-20261124T084256Z.json`. Uloženým grantům nastaví
uložený scope, smaže granty na gateway, ostatní granty nechá a vrátí `requiredResourceAccess`.

**Vráceno 24. 11. 19:24Z** ([revert.log](obo/dukazy/copilot/revert.log); stav před vrácením
[grant-pred-revert.json](obo/dukazy/copilot/grant-pred-revert.json), po vrácení
[grant-po-revert.json](obo/dukazy/copilot/grant-po-revert.json)). Zpětné čtení `oauth2PermissionGrants` klienta `7a0b43a3…`:

| Principal | Resource | Scope po vrácení |
|---|---|---|
| petra.novakova `7b981009…` | Microsoft Graph | `User.Read Mail.ReadBasic` |
| tomas.prochazka `33507faf…` | Microsoft Graph | `User.Read Mail.ReadBasic` |
| egd10 `d13528e1…` (karta OBO v katalogu funkcí, přidáno po mém uložení) | Microsoft Graph | v 19:24Z `User.Read Mail.ReadBasic`, ponecháno; v 19:45Z rozšířeno session katalog-funkci o 8 scopů, večer vráceno na `User.Read Mail.ReadBasic` (ověřeno ~21:00 SEČ) |
| gateway `Gateway.Use` (tomas, petra) | EGD sonda AI gateway | **smazáno** |

`requiredResourceAccess` API se zpětně čtením shoduje s uloženým stavem (Graph `User.Read`, `Mail.ReadBasic`;
[requiredResourceAccess-po-revert.json](obo/dukazy/copilot/requiredResourceAccess-po-revert.json)).

Past ⚠️: první verze `copilot-revert` mazala každý grant, který v uloženém souboru nebyl. Smazala by tak i grant egd10
přidaný později jinou prací. Opraveno ještě před spuštěním: maže jen granty na gateway, ostatní cizí granty vypíše
jako „ponechán“.

Container App jsem nepřenasazoval. Běží revize `ca-egd-obo--0000005` (image 0.4, od 08:48Z) a na ní je změřená i karta
OBO pod egd10 (19:03Z, `sondy/katalog-funkci/dukazy/karty/obo-egd10/`). Po vrácení: `/api/posta` pro tomase (stejný tvar
grantu jako egd10) 2× 200, OBO 320–349 ms ([po-revert-tomas-posta.jsonl](obo/dukazy/copilot/po-revert-tomas-posta.jsonl)).
Klik karty pod egd10 po vrácení ❓ neprošel: profil prohlížeče `e2e-egd10` je odhlášený (přesměrování na login,
[po-revert-karta-egd10/e2e-egd10.json](obo/dukazy/copilot/po-revert-karta-egd10/e2e-egd10.json)). Grant egd10 se nezměnil,
ROPC heslo egd10 v `lab.secrets.json` není. Po Pavlově přihlášení profilu:
`node tools/ca-obo-klik.mjs e2e-egd10 https://pavelchocholousgmail.sharepoint.com/sites/egd-ukazky/SitePages/graph.aspx <výstup> who,posta`.

Lucie (`lucie.dvorakova`) grant nemá, slouží jako negativní případ „bez souhlasu“. Consent pro celý tenant
(`AllPrincipals`) jsem nedával. V E.ON by to byl admin consent celé sady pro jednu registraci, viz níže.

## Co v labu zůstává

- Container App `ca-egd-obo` image 0.4 s endpointy `/api/copilot/*`. Bez grantů vracejí 403 AADSTS65001, pro `/api/posta` se nic nezměnilo.
- Web part `egd-ca-obo` 0.2.0.0 v tenant katalogu, na `/sites/egd-ca-obo/SitePages/obo.aspx` s Copilot tlačítky.
- Konverzace Copilota založené testy (`POST /conversations`, 4×: tomas 3, petra 1) zůstávají v tenantu, Graph je mazat neumí ❓.
