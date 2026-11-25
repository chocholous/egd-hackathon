# Atomicita kvóty LLM gateway: oprava v3 (ms-llm, 2026-11-24)

Chybu našel Ověřovatel ([../../overeni/gateway-app/README.md](../../overeni/gateway-app/README.md), soubor 08):
12 souběžných volání na `tiny` (limit 60) prošlo 12× 200, spotřeba byla 215 tokenů, zapsáno ale jen 18. Kód
`sondy/ai/gateway/server.mjs` četl a zapisoval řádek v Table Storage bez ETagu (InsertOrReplace).

## Oprava (`sondy/ai/gateway/server.mjs`, image `acregdsondaai.azurecr.io/egd-llm-gateway:v3`)

- `prictiSpotrebu` = atomický přírůstek s optimistickou souběžností. Existující řádek se zapisuje přes Update Entity
  s `If-Match: <etag>`, při 412 se načte znovu. Nový řádek jde přes Insert Entity (`POST`), při 409 (založil ho jiný
  požadavek) se opakuje. Po `QUOTA_MAX_RETRIES` pokusech vrací 503. Mezi pokusy čeká náhodně
  0…`QUOTA_RETRY_BACKOFF_MS` × číslo pokusu ms.
- **Rezervace před voláním modelu:** limit se kontroluje uvnitř téže atomické operace, která přičte `max_tokens`
  (horní mez výstupu). Po odpovědi se doúčtuje rozdíl (skutečné tokeny − rezervace), počet volání, cena a stránky.
  Při chybě modelu se rezervace vrátí. OCR rezervuje 0 tokenů, počítá stránky.
- Řádek nově nese `upn`, `oid` a `client` (dřív `upn` = oid). Log `usage` má navíc `kind` (`user` / `app`),
  `rezervace` a `pokusu`.
- `/api/kvota` vrací spotřebu bez etagu (stejný tvar jako dřív).
- Nové proměnné prostředí, bez výchozích hodnot v kódu: `QUOTA_MAX_RETRIES=20`, `QUOTA_RETRY_BACKOFF_MS=25`
  (nastavené v `az containerapp update`). Hodnoty jsou volené pro lab (12 souběžných volání se vešlo do 7 pokusů).

## Důkazy

| # | Co | Výsledek | Soubor |
|---|---|---|---|
| 1 | lokálně proti mocku Table Storage (ETag, 412, 409), 12 souběžných volání, `tiny` 60 | ✅ 3× 200 + 9× 429. Součet tokenů v odpovědích 54 = zapsáno 54, 3 volání | `01-lokalne-mock.txt`, `lokal-test.sh`, `mock.mjs` |
| 2 | build a push v3 (lokální docker, ACR Tasks v labu zakázané) | ✅ | `02-build-push-v3.log` |
| 3 | nasazení revize `ca-egd-llm-gateway--0000003`, 100 % provozu | ✅ Running/Healthy | `03-deploy-v3.log` |
| 4 | test 4 s po nasazení | obsloužila ještě revize 2 (v logu v3 žádné volání): 12× 200, 209 tokenů, zapsáno +17. **Neplatí pro v3** | `04-atomicita-behem-prepnuti-obsluhovala-v2.txt` |
| 5 | `tools/overeni-gateway-atomicita.sh 12 tiny` na v3 (aplikační klient, kvóta před 35/60) | ✅ **2× 200 + 10× 429**. 200 vrátily 34 tokenů, kvóta 35 → 69 (= 35 + 34), volání 2 → 4. Rezervace 20 + 20 přetáhne limit z 35 na 75, další volání odmítnuta | `05-atomicita-v3-lab.txt` |
| 6 | `tools/overeni-gateway-atomicita.sh 12 demo` na v3 (limit 50 000, všech 12 se zapisuje souběžně) | ✅ **12× 200, součet 213 tokenů = zapsáno 213, 12 volání, 0,0001392 USD** | `07-souhra-12x200-demo.txt` |
| 7 | konzolový log v3 | ✅ `kind:"app"`, `pokusu` 3–7 (kolize ETagu se opravdu děly a vyřešily se) | `06-log-v3.txt` |

## Chování kvóty po opravě

Limit se kontroluje atomicky. Volání projde, pokud zapsaná spotřeba + rezervace běžících volání < limit. Poslední
povolené volání limit přetáhne nejvýš o svou rezervaci (`max_tokens`). Souběžná volání limit neobejdou a žádný
přírůstek se neztratí ✅ (#5, #6).
Neověřeno ❓: dlouhá souběžná zátěž (desítky volání), kdy by 20 pokusů nestačilo a gateway vrátí 503.

## upn u aplikačního klienta

Aplikační token (client credentials, role `Gateway.App`) nemá uživatele, takže `upn` být nemůže. Identita je `oid`
service principalu klienta a `client` (appId). Obojí je v logu i v řádku kvóty. Pro audit to stačí, appId jednoznačně
určí aplikaci (v labu `egd-overeni-gwapp-client`). Nově `kind:"app"` odliší aplikační volání od uživatelských bez
domýšlení. Kdo v aplikaci spustil akci, zná jen volající aplikace. Pokud to audit chce, musí ho poslat sama
(např. vlastní hlavička). Gateway to dnes nečte a ani by tomu nemohla věřit.
