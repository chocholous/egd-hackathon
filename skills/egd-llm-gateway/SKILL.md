---
name: egd-llm-gateway
description: Napoj SPFx appku EG.D na AI (generování a shrnutí textu, OCR dokumentů a obrázků, popis obrázku) přes sdílenou LLM gateway - web part volá gateway tokenem přihlášeného uživatele (AadHttpClient), žádný API klíč v kódu; vysvětli, že bez Azure to nejde, a co musí dodat IT. Použij, když uživatel řekne „přidej AI“, „ať to shrne / přeloží / navrhne odpověď“, „přečti text z PDF nebo fotky“, „OCR faktury“, „popiš obrázek“, „vygeneruj obrázek“, „zavolej OpenAI / GPT / LLM“, „kam dám API klíč“, „Failed to fetch na gateway“, „429 kvóta“, „502 u OCR“ nebo „AADSTS65001“.
license: interní pomůcka workshopu EG.D
---

# AI přes LLM gateway (požadavek 2)

Uživatel je začátečník na Windows. Navazuje na `egd-prvni-appka`.
Hlavní věta pro něj: **API klíč k modelu nikdy do appky.** Web part běží v prohlížeči, klíč by
viděl každý. Appka volá **gateway** (malý server v Azure) tokenem přihlášeného uživatele;
gateway má k modelu přístup sama (managed identity), hlídá denní kvótu a zapisuje, kdo kolik utratil.

Značky: ✅ změřeno v labu 22. 11. 2026, důkaz v `sondy/ms-llm/` (rozcestník
`sondy/ms-llm/README.md` (v repu workshopu)) nebo `sondy/ai.md`. Co ověřit nešlo, je
v sekci [Neověřeno](#neověřeno) s důvodem.

## Co gateway umí ✅

| Endpoint | Co | Čas / cena za volání | Důkaz |
|---|---|---|---|
| `POST /api/chat` `{ prompt, max_tokens }` | text, shrnutí, klasifikace (`gpt-4.1-mini`) | 0,9–1,8 s, ~0,0001 USD | `gateway-prima.md`, `e2e-*/klik.json` |
| `POST /api/chat` `{ messages }` s `image_url` | popis / přepis obrázku | 2,8–5,6 s, ~0,0004 USD | `gateway-prima.md`, `ocr-velke-soubory.md` |
| `POST /api/ocr` `{ base64, model: 'prebuilt-read' }` | OCR PDF i obrázků, čeština správně | 1,0–1,3 s (1 strana), 0,0015 USD / stránka | `ocr-pdf.md`, `e2e-spokojenost/` |
| `POST /api/ocr` `{ …, model: 'prebuilt-invoice' }` | faktura: text + vytěžená pole `fields` (dodavatel, splatnost, částka) | 2 s, 0,01 USD / stránka | `gateway-prima.md` |
| `GET /api/kvota` | dnešní spotřeba uživatele v appce a limit | 0,2 s | `e2e-spokojenost-3mb/` |
| `POST /api/image` | generování obrázků | ❌ 501: kvóta všech obrazových modelů je 0 | `image-kvota.txt` |

Odpověď `/api/chat` a `/api/ocr` má navíc `costUsd`, `ms` a `kvotaDnes: { tokens, limit }`, OCR i
`pages`. `/api/kvota` vrací jiný tvar: `{ den, appKey, spotreba: { tokens, calls, costUsd, pages }, limitTokenuZaDen }`.

**OCR limit velikosti ✅:** lab gateway běží na Document Intelligence **F0** – soubor 3,1 MB
prošel, 4,6 MB a 9,2 MB vrátily **502** (`InvalidContentLength`, `ocr-velke-soubory.md`).
Převod na base64 v prohlížeči je i u 9 MB rychlý (celé volání 4 s), brzdou je jen limit služby.

## Žebřík variant: zkoušej odshora, zůstaň na první, která funguje

Agent nejdřív zjistí, co má účastník k dispozici, a jde odshora dolů. Na konci řekne uživateli
a zapíše do poznámek projektu (`README.md` appky), **kterou variantu použil a proč ne vyšší**.

| # | Varianta | Kdy | Test „funguje?“ | Když ne | Lab |
|---|---|---|---|---|---|
| 1 | **SPFx + sdílená gateway** (kód níže) | IT dodalo `gatewayUrl`, `apiAppId`, `appKey` | po nasazení klik na „Kolik AI zbývá dnes“ nebo „Shrnout“ → do ~30 s text, ve F12 stav 200 | podle [tabulky chyb](#ověření-vždy): 65001 → schválení u IT, `Failed to fetch` → CORS/proxy, 403 → `appKey` do registru; mezitím varianta 3 | ✅ celý řetěz (`e2e-spokojenost*`, `e2e-1`) |
| 2 | **Power Automate + konektor Azure AI Foundry Inference** (B2) | gateway není, ale E.ON má Azure OpenAI / Foundry a dá klíč do připojení | flow s akcí „Chat completion“ doběhne a vrátí text | bez klíče od IT nejde → varianta 3 | ✅ flow (`sondy/power-automate.md` ř. 13); napojení na SPFx přes seznam ❓ (Neověřeno) |
| 3 | **Simulace** (bez AI) | nic z výše; appka se má dnes dokončit | „Shrnout“ ukáže ukázkový text „AI zatím není napojená…“ | – (funguje vždy) | ✅ `e2e-simulace` |

Hodnoty pro variantu 1 (od IT / organizátorů):

- `gatewayUrl` (např. `https://ca-egd-llm-gateway.<…>.azurecontainerapps.io`),
- `apiAppId` = appId registrace API gateway v Entra,
- `appKey` = název tvé appky v registru gateway (hlavička `X-App-Id`; účetní štítek pro kvótu, ne heslo).

Varianta 3 je tentýž kód s prázdným `GATEWAY_URL` – až IT hodnoty dodá, stačí je doplnit, build a
nasadit, nic dalšího se nepřepisuje. Lab gateway přijímá jen tokeny lab tenantu: Easy Auth má issuer
`login.microsoftonline.com/<lab tenant>/v2.0` a bez platného tokenu vrací 401 ✅ (`easyauth.json`,
`chyby-gateway.md`). Z tenantu E.ON tedy nepůjde, tam musí být gateway E.ON.

Copilot Chat API ani AI Builder do žebříku nepatří: viz [Proč ne jiné cesty](#proč-ne-jiné-cesty).

## Kód (SPFx 1.24.1) ✅

Přesně tento kód běžel v aktuální první appce Spokojenost (build `appka.mjs`, nasazení do katalogu
webu, klikání v prohlížeči pod lab uživatelem; `sondy/ms-llm/zdroj-spokojenost.diff`). `_ai`, `_shrn`
a `_ocr` běžely i ve starší šabloně Evidence; `_aiGet` a simulace jen ve Spokojenosti
(`sondy/ms-llm/zdroje-verzi.md`).

`config\package-solution.json`, do objektu `solution` (resource = appId API):

```json
"webApiPermissionRequests": [{ "resource": "<apiAppId>", "scope": "Gateway.Use" }]
```

Do web partu (import `AadHttpClient` přidej k existujícímu řádku `@microsoft/sp-http`):

```ts
import { SPHttpClient, type SPHttpClientResponse, AadHttpClient } from '@microsoft/sp-http';

const GATEWAY_URL = '<gatewayUrl>';   // od IT; prázdné '' = simulace (varianta 3)
const API_APP_ID = '<apiAppId>';
const APP_KEY = '<appKey>';

// do třídy web partu:
private async _ai<T>(cesta: string, telo: object): Promise<T> {
  if (!GATEWAY_URL) return { text: '(Ukázka – AI zatím není napojená. Až IT dodá adresu gateway, odpoví model.)' } as unknown as T;
  const klient = await this.context.aadHttpClientFactory.getClient(API_APP_ID);
  const r = await klient.post(`${GATEWAY_URL}${cesta}`, AadHttpClient.configurations.v1, {
    headers: { 'Content-Type': 'application/json', 'X-App-Id': APP_KEY },
    body: JSON.stringify(telo)
  });
  if (r.status === 429) throw new Error('Dnešní limit AI pro appku je vyčerpaný. Zkuste to zítra.');
  if (!r.ok) throw new Error(`AI gateway vrátila ${r.status}`);
  return (await r.json()) as T;
}

// GET, např. /api/kvota
private async _aiGet<T>(cesta: string): Promise<T> {
  if (!GATEWAY_URL) return { spotreba: { tokens: 0 }, limitTokenuZaDen: 0 } as unknown as T;
  const klient = await this.context.aadHttpClientFactory.getClient(API_APP_ID);
  const r = await klient.get(`${GATEWAY_URL}${cesta}`, AadHttpClient.configurations.v1, { headers: { 'X-App-Id': APP_KEY } });
  if (!r.ok) throw new Error(`AI gateway vrátila ${r.status}`);
  return (await r.json()) as T;
}

// shrnutí textu
private async _shrn(text: string): Promise<string> {
  const o = await this._ai<{ text: string }>('/api/chat',
    { prompt: `Shrň jednou větou česky:\n${text}`, max_tokens: 200 });
  return o.text;
}

// OCR souboru z <input type="file"> (PDF, PNG, JPG)
private async _ocr(soubor: File): Promise<string> {
  const b = new Uint8Array(await soubor.arrayBuffer());
  let bin = ''; b.forEach((x) => { bin += String.fromCharCode(x); });
  const o = await this._ai<{ text: string }>('/api/ocr', { base64: btoa(bin), model: 'prebuilt-read' });
  return o.text;
}
```

Napojení na tlačítko (vzor z první appky Spokojenost; `el` je pomocná funkce šablony, `vystup` je
`<p>` pro výsledek). Nepoužívej `.finally()` – SPFx 1.24.1 kompiluje s `lib` jen do `es2015.promise`, TypeScript ho
odmítne (`TS2550`) ✅ (`tsc-finally.out`):

```ts
const shrnout = el('button', { type: 'button' }, ['Shrnout dnešek (AI)']) as HTMLButtonElement;
shrnout.addEventListener('click', () => {
  shrnout.disabled = true; vystup.textContent = 'Přemýšlím…';
  this._shrn(textProAi)
    .then((t) => { vystup.textContent = `Návrh AI: ${t}`; })
    .catch((e: Error) => { vystup.textContent = `Chyba AI: ${e.message}`; })
    .then(() => { shrnout.disabled = false; }, () => { shrnout.disabled = false; });
});
```

Kam to dát v první appce Spokojenost ✅: pod dashboard karta „AI pomocník“ s tlačítky
„Shrnout dnešek (AI)“ (do promptu jdou jen čísla z dashboardu, žádná jména), soubor +
„Přečíst soubor (OCR)“ a „Kolik AI zbývá dnes“ (`_aiGet('/api/kvota')`). Ve starší šabloně Evidence
„Shrnout popis“ (prompt = Popis) a OCR, který text vloží do Popisu k úpravě ✅.

Pravidla:
- Tlačítko ukazuje „Přemýšlím…“: první volání po pauze trvalo z web partu **24 s a 28 s** ✅
  (`e2e-1`, `e2e-spokojenost`), curlem 30,1 s ✅ (`sondy/overeni/ai/studeny-start-2026-11-22.txt`), tedy **~25–30 s**; gateway má
  `min-replicas 0` a probouzí se. Jak dlouhá nečinnost k uspání stačí, měřeno nebylo ❓. Další volání 1,1–1,8 s.
  Na workshop je potřeba gateway předem „probudit“ nebo `min-replicas 1` (≈ 8 USD/měsíc, rozhoduje Pavel).
- Výsledek AI ukaž jako **návrh**, který člověk potvrdí ✅: shrnutí dne s průměrem 4,0 v labu
  jednou napsalo „spokojenost je zatím nízká“ (`e2e-spokojenost-3mb/klik.json`).
- Do promptu neposílej osobní údaje bez souhlasu IT / bezpečnosti (rozhodnutí o datech; lab gateway běží na Global Standard = zpracování kdekoli, varianta DataZone EU 📘 neověřena).
- OCR soubor do ~3 MB (lab F0, viz výše); u většího ukaž uživateli, ať soubor zmenší.

## Ověření (vždy)

0. Před ukázkou gateway rozehřej (jedno volání „Shrnout“ nebo `tools/ai-gateway-probe.sh whoami`), ať
   první uživatel nečeká ~30 s; hned po novém nasazení gateway vrací ~30 s **503** ✅.
1. Build a nasazení dělej skriptem skillu `egd-prvni-appka` (`appka.mjs build`, `appka.mjs nasadit … --ano`),
   ne ručně přes `spo app add` / `spo page …` (Copilot bez něj sestavoval stránku ručně a sekci
   dostal až na druhý pokus, `sondy/ms-llm/copilot-prepis/log.txt`). Po nasazení `.sppkg` uživatel klikne „Shrnout“ → do pár sekund vidí text (první volání až ~30 s).
   Hned po upgradu balíčku dostalo první načtení stránky ještě **starý bundle** (3× ze 3), další
   načtení do ~1 min už nový ✅ (`bundle-propagace.md`). Neukazuje-li appka změnu, načti ji znovu.
2. F12 → Síť: `POST …/api/chat` má stav 200, v hlavičkách je `Authorization: Bearer …` a `X-App-Id`,
   **žádný klíč** ✅ (`e2e-1/klik.json`, seznam hlaviček).
3. „Kolik AI zbývá dnes“ (`_aiGet('/api/kvota')`) ukazuje přírůstek tokenů ✅.

| Chyba v appce | Význam | Stav (odkud vyvoláno) |
|---|---|---|
| `invalid_grant:AADSTS65001: Access to this resource is blocked` | pro `API_APP_ID` není schválený `Gateway.Use` (SharePoint admin → API access); další volání na téže stránce pak hlásí jen `Token request previously failed` | ✅ web part (tomas.prochazka, `API_APP_ID` = egd-sonda-data-api bez grantu; `e2e-aadsts65001`, `zdroje-verzi.md`) |
| `TypeError: Failed to fetch` | origin stránky není v CORS gateway (preflight vrátí 401 bez `access-control-allow-origin`), nebo ji blokuje proxy | ✅ prohlížeč z `https://example.com` (origin mimo CORS; SharePoint origin v CORS je a prochází) – `e2e-1`, `chyby-gateway.md`; proxy ❓ |
| `AI gateway vrátila 401` | `API_APP_ID` patří jinému API (token se vydá, ale gateway ho odmítne), nebo chybí token | ✅ web part (`e2e-401-jine-api`) i curl (`chyby-gateway.md`) |
| `AI gateway vrátila 403` | `APP_KEY` (`X-App-Id`) není v registru gateway („Neznámá appka …“) | ✅ jen curl (`chyby-gateway.md`) |
| „Dnešní limit AI pro appku je vyčerpaný“ (429) | denní kvóta tokenů pro **uživatele v dané appce**; kontroluje se před voláním, takže poslední volání limit přetáhne (nejvýš o svůj `max_tokens`). Od gateway v3 platí i pro souběžná volání: 12 najednou → 2× 200, 10× 429, nic se neztratí | ✅ web part (`e2e-429`), curl a souběh (`sondy/ms-llm/gateway-atomicita/`) |
| `AI gateway vrátila 502` u OCR | soubor je pro Document Intelligence moc velký (F0: 4,6 MB už neprojde) | ✅ web part (`e2e-spokojenost-velky`) i curl (`ocr-velke-soubory.md`) |
| `AI gateway vrátila 503` | gateway se po novém nasazení ještě rozjíždí (~30 s) | ✅ curl (`sondy/overeni/ai/502-opakovani-2026-11-22.log`: +0 s 503, +30 s 200) |
| `AI gateway vrátila 501` | generování obrázků není nasazené (kvóta 0) | ✅ jen curl (`gateway-prima.md`) |

## Schválení `Gateway.Use` (`webApiPermissionRequests`)

- Nasazení do **katalogu webu** (jak to dělá `egd-prvni-appka`) žádost o API access **založí** ✅:
  balíček `prvni-appka` 1.0.0.1 ze site catalogu přidal do seznamu *Web Api Permission Requests*
  v tenant catalogu řádek `Microsoft Graph / Notes.Read` (`webapi-requests-list-1001.json`, ř. 14).
- Když v seznamu už čeká žádost se **stejným textem resource + scope**, nová nevznikne ✅: `Gateway.Use`
  od dvou nových balíčků se nepřidal, protože tam čeká žádost sondy AI. Žádost od jiného balíčku se
  stejným API zapsaným jinak (název místo appId) vznikne zvlášť ✅ (řádky 9/10 a 12/13/15).
- Grant platí pro **všechny SPFx appky v tenantu** ✅ (je na principalu „SharePoint Online Web Client
  Extensibility“, `spfx-granty.json`); appka bez vlastní žádosti dostane token taky (Spokojenost i
  Evidence volaly gateway, i když jejich žádost nevznikla).
- V labu je `Gateway.Use` udělený přes Graph grant (`tools/ai-spfx-api-grant.sh`).
- **Schválení v UI SharePoint admin centra** (API access → Approve; v českém UI „Upřesnit → Přístup k rozhraní API“) funguje ✅. UI Approve rozšířil
  existující grant pod Global Adminem `pavel.admin`: čekajících žádostí 5 → 4, schválených 61 → 62,
  stav drží i po reloadu, Graph `PATCH oAuth2PermissionGrants` → 204 (`sondy/overeni/api-access/ui-4/`).
  Schválení přes CLI / CSOM (`spo serviceprincipal permissionrequest approve`) v labu selhalo ❌
  (`sondy/overeni/api-access/07-…`, `08-…`, `09-…`, `10-…`). Co z toho ověřeno není, viz [Neověřeno](#neověřeno).
- **Je už schválené?** Z CLI to účastník nezjistí. `spo serviceprincipal permissionrequest list` vrací
  403 i pod adminem (`permissionrequests.json`) a v Copilot testu se zasekl na 30 s. `entra enterpriseapp get`
  pro principal SPFx končí „Insufficient privileges“ ✅ (`grant-overeni-cli.txt`). Proto nezkoušej
  výpisy, rovnou appku nasaď a klikni na „Shrnout“. Text = schváleno, `AADSTS65001` = požádej IT
  (tabulka chyb výše). Uživateli to řekni na konci jednou větou.

## Proč ne jiné cesty

| | A) Copilot Chat API (bez Azure) | B) AI Builder v Power Automate | B2) Power Automate + konektor Azure AI Foundry Inference | C) Sdílená gateway v Azure (tento skill) |
|---|---|---|---|---|
| Lab stav | ✅ negativní: API vyžaduje 7 širokých delegovaných oprávnění (`Mail.Read`, `Chat.Read`, `OnlineMeetingTranscript.Read.All`, …), uživatel bez licence dostane 403; s licencí ❓ | ❓ tenant nemá AI Builder ani kredity; v katalogu konektorů AI Builder není ✅ | ✅ flow doběhlo (`sondy/power-automate.md` ř. 13), konektor je **Standard** ✅ | ✅ celý řetěz web part → gateway → model/OCR |
| Pro | bez vlastního serveru | bez kódu | bez Premium licence, umí i vision | kvóta a audit na uživatele i appku, OCR s poli faktur, žádný klíč |
| Proti | SPFx by dostalo přístup k poště a chatům (grant platí pro všechny SPFx appky); licence per uživatel ❓ | licence a kredity ❓ (v labu nejsou, viz Neověřeno) | model i klíč jsou stejně Azure; klíč drží připojení, žádná kvóta na appku; spuštění ze SPFx jen nepřímo (seznam jako fronta, v sondě PA ❓) | potřebuje Azure subscription, Entra registraci a schválení API |
| Co chce od IT E.ON | schválení 7 Graph oprávnění pro všechny SPFx appky (+ licence ❓) | prostředí, licence, kredity ❓ | Azure AI Foundry / OpenAI resource a klíč | subscription, gateway, Entra API, schválení `Gateway.Use`, síť |
| Obtížnost pro citizen developera | – | střední (klikání ve flow) | střední (flow + seznam) | nízká: 4 funkce do web partu, hodnoty dodá IT |

**Doporučení:** C (= varianta 1) – jedna sdílená gateway spravovaná IT/CoE, appky ji volají tímto
skillem; `min-replicas 1` (≈ 8 USD/měsíc), jinak má první volání po pauze ~25 s. B2 (= varianta 2)
je záloha. A a B pro appky nedoporučuj.

Další varianty **uvnitř** gateway (APIM před gateway, vlastní scope nebo registrace pro každou appku
místo `X-App-Id`) jsou rozebrané v `sondy/ai.md` („Co se při měření ukázalo“ bod 1 a „APIM jako AI
gateway“); pro účastníka se kód nemění, rozhoduje IT.

## Kdy to nejde v E.ON

- Bez Azure subscription a sdílené gateway: nic ověřeného nemáme (A a B viz „Proč ne jiné cesty“). To je rozhodnutí IT / CoE.
- Bez schválení `Gateway.Use`: `AADSTS65001` ✅.
- Generování obrázků: dokud Microsoft nezvedne kvótu `gpt-image-*` (v labu 0 ✅).

**Věta pro IT (ServiceNow):** „Pro aplikaci <název> na webu <web> prosím o přístup ke sdílené
LLM gateway: URL gateway, appId její registrace v Entra a název appky do registru gateway
(X-App-Id), a o schválení žádosti SharePoint Framework o oprávnění API `Gateway.Use`
(SharePoint admin centrum → API access, česky „Upřesnit → Přístup k rozhraní API“). Appka volá gateway tokenem přihlášeného uživatele, žádný
klíč k modelu nedrží. Prosím i o povolení HTTPS z prohlížečů na adresu gateway (proxy). Pokud
gateway zatím není: návrh architektury a nákladů je v podkladech z workshopu (Container App +
Azure OpenAI, odhad ≈ 35–300 USD měsíčně pro 10 appek podle provozu, `sondy/ai.md` „Ceny“).“

## Neověřeno

| Tvrzení | Proč neověřeno | Jak a kde ověřit |
|---|---|---|
| UI Approve jako **úplně první** grant pro API, které ještě žádný grant nemá (Graph `POST` místo `PATCH`) | ui-4 rozšiřovalo existující grant (`PATCH` 204); první grant se neměřil | v labu: nové testovací API bez grantu → žádost → Approve v admin centru, zkontrolovat `POST oAuth2PermissionGrants` |
| Stačí ke schválení role **SharePoint admin** (bez Global Admin)? | ui-4 běželo pod Global Adminem `pavel.admin` | v labu pod účtem jen s rolí SharePoint Administrator (úkol A2 auditu, `audit/pro-overovatele.md`); u E.ON zjistit, kdo roli má |
| Schválení v UI u žádosti ze **site** catalogu (tak nasazuje `egd-prvni-appka` i tento skill) | ui-4 schvaloval žádost z tenantového katalogu (`/sites/apps/AppCatalog`, `sondy/overeni/api-access/18-add-write-2026-11-23.log`). Že žádost ze site catalogu v seznamu vznikne, je ✅ (`sondy/ms-llm/webapi-requests-list-1001.json`, ř. 14 Notes.Read), její schválení se ale neměřilo | v labu schválit v admin centru žádost ze site catalogu od nového testovacího balíčku s neschváleným scope testovacího API (ne čekající Graph Notes.Read) a ověřit grant + token v appce |
| Proxy E.ON pustí `*.azurecontainerapps.io` | jen v síti E.ON | skill `egd-pripravenost` (síťový test) na notebooku EG.D; jinak vlastní doména gateway |
| Copilot Chat API s licencí (podle dokumentace jen s Copilot licencí každého uživatele, vrací jen text) | jediná licence (alice) nemá heslo v `lab.secrets.json` | volání `POST /beta/copilot/conversations` pod licencovaným účtem |
| AI Builder (licence, cena, latence, OCR) – dokumentace uvádí Premium + Copilot Credits (`sondy/ai.md`, „Cesta B“) | tenant nemá AI Builder ani Copilot Credits (`licence.json`) | po trialu AI Builder / PAYG v labu (souhlas Pavla, placené) |
| 502 hned po nasazení gateway (pozorováno jednou v sondě AI, `sondy/ai.md`) | opakované nové nasazení (audit, `sondy/overeni/ai/502-opakovani-2026-11-22.log`) dalo jen ~30 s 503 ✅, 502 se nezopakovalo | při dalším nasazení gateway znovu volat hned po startu |
| OCR limit na placeném tieru S0 (📘 do 500 MB) | lab Document Intelligence je F0 | jednorázově S0 v labu, nebo u gateway E.ON |
| Generování obrázků (cena, čas) | kvóta 0 | po schválení kvóty `gpt-image-*` |
| B2: spuštění flow ze SPFx přes seznam jako frontu | v sondě Power Automate flow nešlo uložit bez přihlášeného SharePoint připojení (`sondy/power-automate.md` ř. 43, „Kandidát (neověřeno)“) | po přihlášení připojení člověkem v labu |
| Build a nasazení na Windows | měřeno na macOS (CLI 11.11, Node 22) v Claude i Copilot CLI ✅ (`TEST-copilot.md` (v repu workshopu)) | test účastnického notebooku (skill `egd-prvni-appka`, TEST.md) |

## Zdroje

`sondy/ms-llm/README.md` (v repu workshopu) (důkazy tohoto skillu), `sondy/ai.md`
(cesty, ceny, architektura), kód gateway `sondy/ai/gateway/server.mjs`. Nástroje:
`tools/ai-gateway-probe.sh` (jedno volání), `tools/ai-gateway-chyby.sh` (401/403/429/CORS),
`tools/ai-appka-klik.mjs` (odkliká AI tlačítka v první appce), `tools/spfx-site-upgrade.sh`
(upgrade balíčku v katalogu webu), `tools/ai-spfx-api-grant.sh` (grant místo schválení, jen lab).
