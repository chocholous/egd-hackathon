# Vision na reálné fotce zařízení — varianty (Ověřovatel, 24. 11. 2026)

Fotka: elektroměr ET 404-2 (rok 1985), Wikimedia Commons, Public domain, náhled 1280×1707, 643 KB ([ZDROJ.txt](ZDROJ.txt), [soubor](czech-electric-meter-1280.jpg)). Gateway `ca-egd-llm-gateway`, model `gpt-4.1-mini`, volající přes `az` (delegovaný token, scope `Gateway.Use`).

| Položka | Varianta | Stav | Důkaz |
|---|---|---|---|
| 2.3 vision, fotka zařízení | gateway `/api/chat` s `image_url` (volání curlem s tokenem uživatele, stejný požadavek jako pošle `AadHttpClient`) | ✅ 200; rozpoznal elektroměr, přepsal typ ET 404-2, 3×220/380 V, 10–40 A, 50 Hz, N4098332, k=135, rok 1985, Made in Czechoslovakia; 3,8 s po zahřátí (6,3 s model + režie), ≈ 0,0007 USD, 1307–1349 vstupních tokenů | [01](01-vision-gateway-obecny-2026-11-24.txt), [02](02-vision-gateway-cilena-2026-11-24.txt) |
| 2.3 vision, fotka zařízení | cílená otázka (zařízení, údaj, plomba) | ✅ odpověď česky ve 3 bodech, plombu zmínil; **ale hodnoty ze stejného čísla se liší mezi voláními** (`2114213 kWh` vs `211423 kWh`) | [01](01-vision-gateway-obecny-2026-11-24.txt), [02](02-vision-gateway-cilena-2026-11-24.txt) |
| 2.3 vision, fotka zařízení | OCR (`/api/ocr`, Document Intelligence `prebuilt-read`) | ✅ 200, 2,2 s, 0,0015 USD; přečetl typ, napětí, proud, N4098332, k=135, ale číslice displeje poškozeně (`12 1 14 12 13 1DE kWh`) a šum | [03](03-ocr-gateway-foto-2026-11-24.txt) |
| 2.3 vision, fotka zařízení | studený start gateway při prvním volání po několika hodinách | ✅ první volání 33,8 s (min-replicas 0), další 3,8 s | [01](01-vision-gateway-obecny-2026-11-24.txt) |
| 2.3 vision | SPFx web part → gateway v prohlížeči | ❓ vision s fotkou z prohlížeče neměřeno; CORS preflight z origin SharePointu ✅ ([gateway/06](../container-app/gateway/06-chyby-2026-11-24.md)), chat z prohlížeče ✅ dřív ([probe](../ai/probe-2026-11-22.out)); velká fotka je v těle požadavku (≈ 860 KB base64), limit těla na straně gateway/Azure OpenAI neměřen | – |
| 2.3 vision | Container App / Job → gateway bez uživatele (aplikační klient, role `Gateway.App`) | ❓ neměřeno (2.1 klient bez uživatele čeká) | – |
| 2.3 vision | Power Automate | role Power Automate, neduplikováno | – |

Závěr pro skill: číslice na displeji elektroměru model čte nespolehlivě (dvě různé hodnoty ze stejné fotky, OCR taky poškozené). Vhodné na „co je to za zařízení, je tam plomba, jaký typ“, **ne** na odečet stavu bez kontroly člověkem.

## Doplněk: velikost těla a vision z prohlížeče (24. 11. 2026)

| Položka | Varianta | Stav | Důkaz |
|---|---|---|---|
| 2.3 vision z prohlížeče | web part simulovaný v Chrome s origin SharePointu, `fetch` s `Authorization` (CORS preflight) + fotka elektroměru, tělo 857 KB | ✅ 200, 2,4 s, „starý elektroměr vyrobený v bývalém Československu“ | [05](05-prohlizec-spfx-foto-2026-11-24.json), skript `tools/overeni-vision-prohlizec.mjs` |
| 2.3 limit těla | gateway `/api/chat`, tělo 1 / 5 / 14 MB (neplatný obrázek) | ✅ projde gateway (až k modelu): 502 „Model vrátil chybu … invalid_image_format“ | [04](04-limit-tela-curl-2026-11-24.txt) |
| 2.3 limit těla | tělo 16 MB | ✅ **413** „Tělo je větší než 15 MB“ (limit v kódu gateway); tělo 31 MB vrátilo 500 bez těla (ingress/spojení) | [04](04-limit-tela-curl-2026-11-24.txt) |
| 2.3 limit těla | platný JPEG 11,1 MB (tělo 14,8 MB po base64) | ✅ 200, 5,5 s | [04](04-limit-tela-curl-2026-11-24.txt) |

Praktický strop: JPEG do ≈ 11 MB (base64 přidá třetinu, gateway řeže 15 MB). Zároveň vysvětluje dřívější **502 z gateway**: je to chyba modelu předaná dál (např. špatný formát obrázku), ne chyba nasazení.
