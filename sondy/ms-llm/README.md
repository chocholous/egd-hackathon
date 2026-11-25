# Sonda ms-llm: ověření skillu `egd-llm-gateway` v labu (2026-11-22)

Web: https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-llm (Communication site, lcid 1029, site app catalog).
Gateway: `ca-egd-llm-gateway…swedencentral.azurecontainerapps.io` (rg-egd-sonda-ai, beze změny). Lab uživatel v prohlížeči: tomas.prochazka (Člen webu).

| Soubor | Co dokazuje |
|---|---|
| `spokojenost-ai/` | aktuální první appka (šablona Spokojenost, SPFx 1.24.1) + úryvky `_ai`, `_aiGet`, `_shrn`, `_ocr` ze skillu; stránka `SitePages/prvni-appka.aspx` |
| `prvni-appka/` | předchozí šablona Evidence + stejné úryvky (testovací verze 1.0.0.1–1.0.0.4, poslední nasazená má `APP_KEY='tiny'` kvůli testu 429); stránka `SitePages/evidence.aspx` |
| `e2e-1/` | Evidence: „Shrnout popis“ 200 (studený start 24 s), „Přečíst soubor (OCR)“ 200 (1,1 s), hlavička `Authorization: Bearer`, žádný klíč; fetch z https://example.com → `TypeError: Failed to fetch` |
| `e2e-spokojenost/` | Spokojenost: „Shrnout dnešek (AI)“ 200 (studený start 28 s), OCR z PDF 200 (1,1 s) |
| `e2e-spokojenost-3mb/` | OCR 3,1 MB PDF (2 strany) z prohlížeče 200 za 3,5 s; tlačítko kvóty (`_aiGet` → `GET /api/kvota`) 200 |
| `e2e-spokojenost-velky/` | 9,2 MB PDF: převod v prohlížeči + upload 4 s, gateway 502 (Document Intelligence F0: soubor moc velký) |
| `ocr-velke-soubory.md` | hranice F0: 3,1 MB projde, 4,6 MB a 9,2 MB → 502 `InvalidContentLength` |
| `e2e-401-jine-api/` | web part s `API_APP_ID` jiného API (se souhlasem SPFx) → token se vydá, gateway 401 |
| `e2e-aadsts65001/` | web part s `API_APP_ID` API bez souhlasu → `invalid_grant:AADSTS65001`, druhé volání `Token request previously failed` |
| `e2e-429/` | `X-App-Id: tiny` (limit 60): první volání uživatele 200 (limit se kontroluje před voláním), druhé 429 s hláškou z `_ai` |
| `chyby-gateway.md` | curl: 401 bez tokenu, 401 token pro Graph, 403 neznámá appka, 404, 429, CORS preflight (SharePoint origin 200 + ACAO, cizí origin 401 bez ACAO) |
| `gateway-prima.md`, `ocr-pdf.md`, `image-kvota.txt` | chat, vision, OCR (read, invoice s `fields`), PDF OCR, `/api/image` 501, kvóta obrazových modelů 0 |
| `webapi-requests-list*.json` | žádosti o API access (tenant catalog, seznam *Web Api Permission Requests*): site catalog žádost **založí** (řádek 14 Notes.Read od `prvni-appka` 1.0.0.1), ale pro dvojici resource+scope, která už v seznamu čeká, **nezaloží novou** (Gateway.Use od obou balíčků chybí) |
| `spfx-granty.json` | granty principalu SharePoint Online Web Client Extensibility (Gateway.Use udělen sondou AI přes Graph) |
| `cesta-a-b.md`, `licence.json`, `pa-konektory-ai.md` | licence tenantu, Copilot Chat API 403 se 7 požadovanými scopy, katalog konektorů PA |

Nástroje: `tools/ai-gateway-chyby.sh`, `tools/ai-appka-klik.mjs`, `tools/spfx-site-upgrade.sh` (nové), `tools/ai-gateway-probe.sh` (oprava pro velké soubory).

Další: `easyauth.json` (Easy Auth gateway: issuer lab tenantu, audience API, 401 bez přihlášení), `tsc-finally.out`
(`Promise.finally` s `lib` SPFx 1.24.1 rigu → TS2550), `cesta-a-b.md` (cesty A/B).
| `e2e-simulace/` | varianta 3: prázdné `GATEWAY_URL` → „Shrnout“ i OCR vrátí ukázkový text, žádné volání sítě (spokojenost-ai 1.0.0.2) |
| `e2e-1.0.0.3/` | návrat na gateway 23. 11. (spokojenost-ai 1.0.0.3, nový bundle až ve 2. načtení): chat 200 za 30,3 s (studený start), OCR PDF 200 za 1,9 s, `/api/kvota` 200 „114 z 50000“; logy `spokojenost-ai/build-1.0.0.3.log`, `nasadit-1.0.0.3.log` |
| `bundle-propagace.md` | po upgradu balíčku první načtení 3× ze 3 ještě starý bundle, do ~1 min nový |
| `zdroje-verzi.md`, `zdroj-spokojenost.diff`, `zdroj-evidence-1.0.0.4.ts` | zdroje měřených verzí (konstanty každé testovací verze, UPN, API_APP_ID) |
| `copilot-prepis/` | test skillu v GitHub Copilot CLI 23. 11.: `prompt.txt`, `log.txt`, `prepis.md`, `usage.json`, diff zdroje, `package-solution.json` a README, které Copilot napsal (vyhodnocení v `skills/egd-llm-gateway/TEST-copilot.md`) |
| `e2e-copilot/` | appka od Copilota (stránka `spokojenost-ai-copilot`) proklikaná pod tomas.prochazka: chat 200, OCR PDF 200, Bearer + `X-App-Id: demo` |
| `webapi-requests-list-copilot.json` | po nasazení balíčku od Copilota (≈10:13Z) žádná nová žádost `Gateway.Use` (ř. 16 je od jiné sondy) |
| `grant-overeni-cli.txt` | `entra enterpriseapp get` pro principal SPFx pod pavel.admin → „Insufficient privileges“ (stav grantu z CLI nezjistíš) |

Na webu teď běží spokojenost-ai 1.0.0.3 (gateway). Před ní build padal na `ERR_INVALID_PACKAGE_CONFIG`: po plném disku zůstalo v `node_modules` 156 prázdných `package.json`. Pomohl až nový `npm ci`.
| `copilot-graph.md`, `copilot-graph/` | 24. 11.: Microsoft 365 Copilot API přes Graph ze SPFx tokenu. Retrieval s licencí 200 (úryvky), bez licence 403; Chat API 403, chybí 7 scopů i s licencí. Přesun a vrácení licence alice ↔ tomas (`licence-presun.log`) |
| `gateway-atomicita/` | 24. 11.: oprava atomicity kvóty gateway (ETag + rezervace, image v3). 12 souběžných: `tiny` 2× 200 + 10× 429 a zapsáno = spotřebováno, `demo` 12× 200, 213 = 213 tokenů |
