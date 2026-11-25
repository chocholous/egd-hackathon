# Scraping HTML stránky (OTE) — varianty (Ověřovatel, 24. 11. 2026)

Cíl: stáhnout a rozparsovat HTML stránku, ne JSON (OTE „Denní trh s elektřinou“, 2 tabulky: 4 a 98 řádků).
Skript: [`tools/overeni-scrape-job.py`](../../../tools/overeni-scrape-job.py) (jen stdlib, parser tabulek). Nový Job `job-egd-scrape` (rg-egd-sonda-napojeni, trigger Manual, 0,25 vCPU / 0,5 GiB, bez MI, bez mailu; `job-egd-report` nedotčen).

| Položka | Varianta | Stav | Důkaz |
|---|---|---|---|
| 5.2 scraping HTML | SPFx / prohlížeč přímo (`fetch` z origin SharePointu) | ❌ OTE neposílá `Access-Control-Allow-Origin`, preflight 404; v Chrome „Failed to fetch“ (simple i s Authorization) | [08](08-cors-ote-spfx-2026-11-24.txt), [09](09-cors-ote-prohlizec-2026-11-24.json) |
| 5.2 scraping HTML | Container Apps Job, image `mcr.microsoft.com/azurelinux/base/python:3.12` bez úpravy | ❌ `CERTIFICATE_VERIFY_FAILED` (OTE používá řetězec Let's Encrypt YE1 → Root YE → ISRG Root X2; image má 23 kořenových CA a X2 nezná) | [04](04-log-bez-CA-FAILED-2026-11-24.txt), [03](03-execution-bez-CA-FAILED-2026-11-24.json) |
| 5.2 scraping HTML | Container Apps Job + doplněný kořen ISRG Root X2 (env `SCRAPE_CA_PEM`, otisk SHA-256 69:72:9B:8E…14:70 ověřen proti veřejnému) | ✅ 200, 123 513 B, 873 ms, 2 tabulky (4 a 98 řádků), řádky BASE LOAD / PEAK LOAD / 15min ceny rozparsované správně; execution Succeeded | [06](06-execution-s-CA-2026-11-24.json), [07](07-log-s-CA-2026-11-24.txt), [isrg-root-x2.pem](isrg-root-x2.pem) |
| 5.2 scraping HTML | Job s vypnutou kontrolou certifikátu | ⛔ neměřeno schválně (nedoporučeno) | – |
| 5.2 scraping HTML | Power Automate (HTTP + zpracování HTML) | patří roli Power Automate, neduplikováno | – |

Poznámka pro skill: u nového Jobu či Container App s minimálním Python image počítat s tím, že veřejné weby s novým řetězcem Let's Encrypt (ISRG Root X2) selžou na ověření certifikátu; řešení = image s aktuálním CA balíkem nebo doplnit CA.
