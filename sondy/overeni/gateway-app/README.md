# 2.1 Gateway.App: klient bez uživatele (Ověřovatel, 24. 11. 2026)

Aplikační identita (client credentials) volá LLM gateway bez uživatele, jak by volal Job, Container App nebo Power Automate přes vlastní app registraci. Pomocný skript: [`tools/overeni-gateway-app.sh`](../../../tools/overeni-gateway-app.sh) (token ani secret se nevypisují).

| Položka | Varianta | Stav | Důkaz |
|---|---|---|---|
| 2.1 klient bez uživatele | app registrace `egd-overeni-gwapp-client` (confidential, secret) **bez** přiřazené role | ✅ chování zjištěno: token se vydá (aud = API, bez claimu `roles`), gateway vrátí **403** „Token nemá scope Gateway.Use ani roli Gateway.App“ | [04](04-pred-prirazenim-2026-11-24.txt) |
| 2.1 klient bez uživatele | stejný klient **s rolí `Gateway.App`** (appRoleAssignedTo na SP gateway) | ✅ token má `roles:["Gateway.App"]`; whoami 200 (`scopes:[]`, `roles:["Gateway.App"]`, bez `upn`), chat 200 (0,97 s), OCR 200 (1,2 s), kvóta se vede na `oid` SP klienta | [05](05-prirazeni-role-2026-11-24.json), [06](06-po-prirazeni-2026-11-24.txt), [07](07-whoami-kvota-ocr-2026-11-24.txt) |
| 2.1 kvóta pro aplikační klient | `X-App-Id: tiny` s aplikačním klientem | ✅ vlastní čistá kvóta (0/60) nezávislá na kvótě uživatelů | [06](06-po-prirazeni-2026-11-24.txt) |
| 2.1 atomicita kvóty | 12 souběžných `POST /api/chat` na `tiny` (limit 60 tokenů), aplikační klient s čistou kvótou | ❌ **není atomická**: všech 12 volání prošlo (200), spotřebovalo 215 tokenů (3,6× limit), ale zapsáno je jen **18 tokenů / 1 volání**. Čtení+zápis Table Storage bez ETag = ztracené zápisy; souběžné volání obejde limit i účtování | [08](08-atomicita-kvoty-2026-11-24.txt) |
| 2.1 atomicita kvóty | tentýž test po opravě **gateway v3** (revize `ca-egd-llm-gateway--0000003`, oprava a vlastní měření v [sondy/ms-llm/gateway-atomicita/README.md](../../ms-llm/gateway-atomicita/README.md), commit 0375fc1) | **❌ v2 → ✅ v3** podle měření role ms-llm (tiny 2× 200 a 10× 429 bez ztrát, 213 = 213). Moje nezávislé opakování ([09](09-atomicita-v3-nezavisle-2026-11-24.txt)) narazilo na kvótu klienta už vyčerpanou jejich během (69/60, 4 volání): všech 12 volání dostalo 429 a spotřeba se nezměnila (žádný zápis navíc). To potvrzuje vynucení limitu, **ne** znovu souběh; ten by chtěl novou identitu s čistou kvótou | [09](09-atomicita-v3-nezavisle-2026-11-24.txt) |
| 2.1 atomicita kvóty | **moje nezávislé měření v3** s druhým aplikačním klientem (čistá kvóta 0/60), 12 souběžných `POST /api/chat` na `tiny` | ✅ **3× 200, 9× 429**; součet tokenů v odpovědích 200 = **53**, zapsáno **53 tokenů / 3 volání** (shoda, žádné ztracené zápisy; ve v2 bylo 12× 200, 215 tokenů, zapsáno 18). Poznámka: 4. volání by se vešlo (53 < 60), ale 9 volání dostalo 429, tj. v3 pravděpodobně rezervuje odhad před voláním (přísnější než účtování po faktu; mechanismus jsem nečetl) | [13](13-atomicita-v3-klient2-nezavisle-2026-11-24.txt) |
| 2.1 klient bez uživatele | Power Automate / Job s managed identitou místo secretu | ❓ neměřeno (MI by dostala stejné přiřazení role; Job `job-egd-report` nedotčen) | – |

Audit: v konzolovém logu gateway je u aplikačního volání `user` prázdný (není `upn`), identifikuje se jen `oid`/`client` ([../container-app/gateway/08](../container-app/gateway/08-konzolovy-log-gateway-2026-11-24.txt) formát). Pro audit „kdo“ musí aplikace v tělu nebo hlavičce uvést projekt přes `X-App-Id`.

## Co jsem v labu přidal (a jak vrátit)

| Co | Id | Návrat |
|---|---|---|
| App registrace `egd-overeni-gwapp-client` | appId `bdb62127-e0ba-4fc6-9a2c-c3706e76940d`, objectId `61306537-aa29-4460-88e0-a662284d13af`, SP `14acac9a-683d-47bb-85a1-98d5841b79c3` | smazat app (jen s Pavlovým ano) |
| Secret `overeni-2d` | platí do 2026-11-26T07:42Z, uložen **mimo repo** v `~/.config/egd-overeni/gwapp.secrets.json` (chmod 600) | vyprší sám; dřív `az ad app credential delete --id bdb62127-… --key-id …` |
| Přiřazení role `Gateway.App` klientovi na SP gateway | assignment id `mqysFD1ou0eFoZjVhBt5w02ZAHzLkcZLj1jgw-UP4sk` | `az rest --method DELETE …/servicePrincipals/4b368df2-9977-460f-8688-ce84efa250b9/appRoleAssignedTo/<id>` |

## Návrh opravy atomicity (jen návrh, kód gateway patří jeho roli)
- `nactiSpotrebu` vrací i `etag` řádku, `zapisSpotrebu` posílá `If-Match: <etag>` (u neexistujícího řádku `If-None-Match: *`); při 412 znovu načíst a přičíst znovu (opakovat 3–5×).
- Kvótu rezervovat **před** voláním modelu (přičíst odhad, po odpovědi doúčtovat rozdíl), jinak souběh mine limit i při správném ETagu.
- Alternativa: počítadlo v Azure SQL nebo Redis s atomickým přírůstkem; Table Storage s ETagem stačí pro kvótu „zhruba“.
