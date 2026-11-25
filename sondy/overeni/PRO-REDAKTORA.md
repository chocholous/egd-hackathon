# Opravy textu podle měření (22. 11. 2026) – pro roli Redaktor podkladů

Důkazy: [README.md](README.md) v této složce. Ověřovatel texty v sondách ani v 00–06, 10 needituje.

| Soubor, místo | Co je tam | Co změřeno | Navržená oprava |
|---|---|---|---|
| `03-lab.md` ř. 48–49 | hosté jako Visitors „nejspíš jen čtení (neměřeno)“ | pod účtem v roli Visitor katalogu: čtení 200, založení seznamu 403, nahrání `.sppkg` 403, cizí web 403 (`prava-visitor/`) | změnit na ✅ pro roli Visitor, host-specifické chování nechat ❓ (účet hosta nemáme) |
| `sondy/ai.md` ř. 125, 140 | studený start 26 s | 30,1 s (min-replicas 0) | „kolem 30 s“, ✅ s odkazem `sondy/overeni/ai/studeny-start-2026-11-22.txt` |
| `sondy/ai.md` ř. 135, 207, 226 | omezení volajících skupinou „neprůkazné“ | nepřiřazený uživatel dostane při `appRoleAssignmentRequired=true` `AADSTS50105` už u tokenu, ne 403 z gateway | ✅, upravit formulaci na „token se nevydá (AADSTS50105)“ |
| `sondy/ai.md` ř. 150, 222, `skills/egd-llm-gateway/SKILL.md` ř. 112 | schválení API access `approve` selhává, příčina neznámá | chyba přichází ze SharePointu (`service principal … could not be found`), CLI je jen obálka; tag na SP ani tvar resource nepomáhá; obejití Graph grantem ✅; UI zatím neověřeno (čeká na přihlášení admina) | doplnit do „Neověřeno“: UI cesta, příčina; do skillu: fallback Graph grant (`tools/ai-spfx-api-grant.sh`) |
| `sondy/ai.md` ř. 161–164 | APIM Consumption nezná token limit a rate-limit-by-key | ✅ potvrzeno při uložení politiky; `llm-emit-token-metric` a `llm-semantic-cache-lookup` uložit jde | doplnit „uložení ≠ funkce za běhu ❓“ a odkaz na `sondy/overeni/ai/apim-policy-test-2026-11-22.out` |
| `sondy/data-prava.md` ř. 131–154 (cesta C) | ✅ „proběhlo“, log chybí | log je v `sondy/overeni/data-prava/api-matrix-2026-11-22.jsonl`, tabulka ř. 144–152 sedí | doplnit odkaz na log |
| `sondy/data-prava.md` ř. 154 | studený start 7,8 s | **19,2 s** | přepsat číslo; dodat, že první dotaz na SQL po auto-pauze trvá ≈ 33 s ✅ (ne „desítky sekund“ ❓) |
| `sondy/napojeni.md` ř. 31–36 | důvody CORS (hlavička `*`, preflight 403 / 404) | ✅ `napojeni/cors-curl-preflight-2026-11-22.txt` | doplnit odkaz |
| `sondy/napojeni.md` ř. 57–60 | Job: mail doručen, cron, 202/403, 37 s | ✅ `napojeni/job-executions-…json`, `job-logy-…txt` | doplnit odkaz |
| `sondy/napojeni.md` ř. 76 | delegovaný sendMail jako Eva | ✅ 202 a zpráva v schránce | doplnit odkaz; AADSTS65002 ❓ znovu neměřeno. SPFx `sendMail` není ❓: změřeno v `sondy/ms-maily/README.md` ř. 18–26 (bez schválení 403 `ErrorAccessDenied`, 65001/65002 nevznikly; po grantu a novém tokenu 202; 30 MB → 202, 40 MB → 400 `ErrorMessageSizeExceeded`, takže „do 3 MB“ neplatí) |
| `sondy/dokumenty.md` ř. 54, 56 | Graph PDF z docx, xlsx, pptx | ✅ log `dokumenty/graph-pdf-2026-11-22.log`, 0,9–1,6 s | doplnit odkaz |
| `sondy/dokumenty.md` ř. 57 | `Files.Read` 403, `Files.Read.All` OK | ✅ `dokumenty/files-read-vs-readall-2026-11-22.log` | doplnit odkaz |
| `sondy/ai.md` ř. 125, 220 | 502 po nasazení, příčina „propagace rolí“ | na čistém nasazení 503 z ingressu v +0 s, 200 od +30 s; 502 z modelu se nezopakovalo | příčinu přepsat na ❓ neprokázáno, doplnit rozehřívací volání do postupu |

Další otevřené věci k doplnění do „Neověřeno“ / Pavlovi:
- UI schválení API access vyžaduje přihlášení Global Admina do profilu prohlížeče (příkaz v README oddíl 2). Po něm Ověřovatel UI cestu odklikne.
- Test rolí hostů z EG.D (`#ext#`) pod jejich účty: ❓ jen na workshopu nebo s vlastním testovacím hostem s heslem.
