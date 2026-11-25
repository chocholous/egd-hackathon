# Surové výstupy: gateway a Job (Ověřovatel, 24. 11. 2026)

Zopakováno v labu (sub `05a636d8-…`, volající `pavel.chocholous@gmail.com` přes `az`). Nic nebylo změněno kromě ručního spuštění Jobu (cron `0 6 * * 1` zůstal).

## LLM gateway `ca-egd-llm-gateway` (rg-egd-sonda-ai)

| Funkce | Výsledek | Důkaz |
|---|---|---|
| Studený start (0 replik) | ✅ 1. volání 27,9 s, další 0,2 s | [gateway/01](gateway/01-studeny-start-whoami-2026-11-24.txt) |
| whoami | ✅ 200, `scopes:["Gateway.Use"]`, `appKey:default` | gateway/01 |
| chat (latence) | ✅ 200, 1,0–1,6 s, 23–31 tokenů | [gateway/02](gateway/02-chat-2026-11-24.txt) |
| OCR `prebuilt-read` | ✅ 200, 1,0–1,2 s, 1 strana, 0,0015 USD, diakritika správně | [gateway/03](gateway/03-ocr-2026-11-24.txt) |
| vision (obrázek v chatu) | ✅ 200, 3,0 s, přepsal text | [gateway/04](gateway/04-vision-2026-11-24.txt) |
| kvóta, stav | ✅ `GET /api/kvota` | [gateway/05](gateway/05-kvota-2026-11-24.txt) |
| 401 bez tokenu / token pro Graph, 403 neznámá appka, 404, CORS | ✅ | [gateway/06](gateway/06-chyby-2026-11-24.md) |
| kvóta 429 (appka `tiny`, 60 tokenů/den) | ✅ 1.–2. volání 200 (součet 151/60), další **429** | [gateway/07](gateway/07-kvota-429-2026-11-24.txt) |
| Konzolový log (audit JSON: user, oid, appKey, model, tokeny; chyby 403/404/429) | ✅ | [gateway/08](gateway/08-konzolovy-log-gateway-2026-11-24.txt) |
| `/api/image` | ✅ 501 „Generování obrázků není nasazeno (kvóta gpt-image 0)“ | [gateway/09](gateway/09-image-501-2026-11-24.txt) |

## Job `job-egd-report` (rg-egd-sonda-napojeni)

| Funkce | Výsledek | Důkaz |
|---|---|---|
| Ruční start (`az containerapp job start`) u Jobu s triggerem Schedule | ✅ execution `job-egd-report-r83t40z`, Succeeded, 00:42:54–00:43:33 (**39 s**) | [job/01](job/01-start-2026-11-24.json), [job/02](job/02-execution-2026-11-24.json) |
| Log běhu | ✅ 30 kurzů ČNB, CSV 1239 B, sendMail jako egd-report@ HTTP 202, negativní test jako alice@ HTTP 403 | [job/03](job/03-log-behu-2026-11-24.txt) |
| Doručený mail s přílohou | ✅ v schránce tomas.prochazka 00:43:28Z, příloha `kurzy-cnb-2026-11-23.csv` 1465 B | [job/04](job/04-doruceny-mail-2026-11-24.txt) |
