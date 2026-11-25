# Co řešíme přes Container App (vlastní server v Azure)

Sběrné místo pro všechno, co SharePoint appka (SPFx) sama v prohlížeči neumí a potřebuje k tomu
vlastní server. Server je **Azure Container App** pro API volané z appky nebo **Container Apps Job**
pro úlohy spouštěné podle plánu. Každá sonda a session sem zapisuje nové funkce i požadavky. Edituje
hlavní session, ostatní posílají nálezy v reportu.

**Pozor: ✅ běhy Power Automate a SharePoint/Graph části běží pod E5 licencemi lab trialu, který končí 25. 11. 2026 v 04:04** (Business Premium + Copilot 09:31; [07-lab-trial-plan.md](07-lab-trial-plan.md)). Azure zdroje na M365 trialu nezávisí (Azure trial končí 26. 11.). Přihlášení připojení Power Automate je potřeba stihnout před 25. 11. 04:04.

Značky: ✅ změřeno v labu · 📘 z dokumentace · ❓ neověřeno · ⛔ v labu neověřitelné (důvod u položky) ·
🔀 víc funkčních variant. 📘 a ❓ jsou jen mezistav, ne podklad doporučení (kánon v [CLAUDE.md](CLAUDE.md)).
Podrobnosti jsou v odkazovaných sondách. Stav k 24. 11. 2026.

## Princip

```
SPFx web part ──AadHttpClient (token přihlášeného uživatele)──▶ Container App (API)
                                                            │ ověří token (Entra), role/kvóty podle appky
                                                            │ managed identity → Graph, SQL, LLM, cizí API
                                                            ▼
                                        Azure SQL · Azure OpenAI/Foundry · Graph (mail) · ČNB/OTE/web
Container Apps Job (cron) ──managed identity──▶ stáhne data → dokument → e-mail
```

Tajemství nejsou v prohlížeči ani v kódu: server používá managed identity a uživatele pozná z tokenu.

## Katalog ověřených funkcí (cíl: každá funkce = ✅ v labu + postup volání)

Zadání (Pavel, 23. 11.): Container App má mít všechny funkce ověřené v labu a k tomu dokumentaci. Katalog je
**vstupní bod**: u každé funkce co umí, kde ji zavolat, jak ze SPFx, co chce v Entra a od admina, kolik stojí,
kde je surový důkaz a stav. Tabulka „Funkce, které Container App otevírá“ níž zůstává jako přehled proč a varianty.
Pravidlo: do katalogu se ✅ zapisuje jen s odkazem na uložený důkaz (kánon v [CLAUDE.md](CLAUDE.md)); co čeká na
sondu, je ❓ s odkazem na zdroj, odkud se doplní.

Společné pro všechna API volaná ze SPFx (platí pro funkce 1, 2 a 4–6): web part volá
`context.aadHttpClientFactory.getClient(<appId API>)`, v `config/package-solution.json` je
`webApiPermissionRequests: [{ resource: "<název API>", scope: "<scope>" }]`; schválení API access dělá správce
jednou na scope (UI SharePoint admin centra, Advanced → API access ✅ pod Global Adminem, `sondy/overeni/api-access/ui-4/`;
fallback Graph `oauth2PermissionGrant`, `tools/ai-spfx-api-grant.sh` ✅). Bez schválení token nevznikne
(`AADSTS65001`, ✅ `sondy/ms-llm/e2e-aadsts65001/`). Chování a limity schválení viz [sondy/ai.md](sondy/ai.md).

| # | Funkce | Co umí | Endpoint / Job | Volání ze SPFx | Consent a Entra | Cena | Důkaz | Stav |
|---|---|---|---|---|---|---|---|---|
| 1 | **LLM gateway** | chat (text i `messages` s `image_url` = vision), OCR (`prebuilt-read`, invoice s `fields`), kvóta na appku, log ceny; generování obrázků ne (kvóta modelu 0) | Container App `ca-egd-llm-gateway` (rg `rg-egd-sonda-ai`): `GET /api/whoami`, `GET /api/kvota`, `POST /api/chat`, `POST /api/ocr`, `POST /api/image` (501) | `AadHttpClient`, scope **`Gateway.Use`** na API „EGD sonda AI gateway“, hlavička `X-App-Id` (registr appek + kvóty v proměnných prostředí); z prohlížeče ✅ (chat 0,85–1,6 s, OCR 1,0–1,2 s, vision 2,2–3,0 s) | API registrace se scope `Gateway.Use` a rolí `Gateway.App`, SP s tagem `WindowsAzureActiveDirectoryIntegratedApp`, `oauth2PermissionGrant` pro SPFx principal; Easy Auth (401 bez tokenu) | chat ≈ 0,0001 USD/volání ✅, OCR ≈ 0,0015 USD/stránka ✅; min. 1 replika ≈ 8 USD/měs. 📘 (výpočet z ceníku) | [probe-2026-11-22.out](sondy/overeni/ai/probe-2026-11-22.out), [studeny-start](sondy/overeni/ai/studeny-start-2026-11-22.txt), [overeni/container-app/gateway](sondy/overeni/container-app/gateway/) (24. 11.: studený start 27,9 s, chat, OCR 0,0015 USD/stránka, vision, kvóta, chyby a CORS, konzolový auditní log, `/api/image` 501; mapování v [README](sondy/overeni/container-app/README.md)), [ms-llm](sondy/ms-llm/README.md) (e2e-1.0.0.3, e2e-429, chyby-gateway.md, ocr-velke-soubory.md) | ✅ chat, vision, OCR, kvóta, 401/403/429, CORS (allow-origin jen pro SharePoint origin, jiný origin 401), auditní JSON řádky (user, oid, appKey, model, tokeny) v konzolovém logu, `/api/image` 501; kvóta je od gateway v3 atomická ✅ (ETag + rezervace `max_tokens`; 12 souběžných volání: 2× 200 + 10× 429 bez ztraceného přírůstku, na `demo` 213 = 213 tokenů, [gateway-atomicita](sondy/ms-llm/gateway-atomicita/README.md)); kvóta 429 u appky `tiny` (limit 60 tokenů/den): 1.–2. volání 200, další 429, přesné pořadí závisí na délce promptu (limit se kontroluje před voláním, [07](sondy/overeni/container-app/gateway/07-kvota-429-2026-11-24.txt)); **limity**: studený start ≈ 30 s (27,9–30,1 s ✅), OCR na Document Intelligence F0 3,1 MB projde, 4,6 a 9,2 MB → 502 `InvalidContentLength`; ❓ aplikační volající `Gateway.App` (client credentials), identifikace appky variantami (b)/(c), příčina 502 po čistém nasazení |
| 2 | **Databáze s právy podle role** (Azure SQL) | zakládání a čtení žádostí, role z tokenu (Zadavatel jen své podle `oid`, Schvalovatel vše a mění stav, Spravce maže) | Container App `ca-egd-data-api` (rg `rg-egd-sonda-data-prava`, v0.2): `GET /healthz`, `GET /api/me` (v0.2 bez dotazu na SQL), `GET/POST /api/zadosti`, `POST /api/zadosti/{id}/stav`, `DELETE /api/zadosti/{id}`; SQL `egddata` (free offer, serverless, auto-pause 60 min) | `AadHttpClient.getClient(<appId API>)`, scope **`access_as_user`** na API `egd-sonda-data-api` (`fec3e01a-…`), ✅ ze SPFx pod 3 účty (whoami, žádosti z SQL; [14](sondy/container-app/prava-db/14-tomas-klik.log), [15](sondy/container-app/prava-db/15-eva-klik.log), [16](sondy/container-app/prava-db/16-jakub-klik.log)) | API registrace s app rolemi Zadavatel/Schvalovatel/Spravce + přiřazení uživatelů (`tools/data-prava-entra-api.py`), souhlas správce pro `webApiPermissionRequests` | SQL free 0 USD, Container App min 0 ≈ centy (celá sonda pod 1 USD, odhad) | [api-matrix](sondy/overeni/data-prava/api-matrix-2026-11-22.jsonl), regrese [04](sondy/container-app/prava-db/04-regrese-pred-0.1.jsonl) → [09](sondy/container-app/prava-db/09-regrese-po-0.2.jsonl) (14/14 stejné kódy), [prava-db.md](sondy/container-app/prava-db.md) | ✅ 401 bez tokenu, 403 bez role, role z tokenu, izolace podle `oid`, stav jen Schvalovatel, mazání jen Spravce, `AadHttpClient` ze SPFx; **limity**: studený start 19,2 s ✅, první dotaz po auto-pauze SQL 33,3 s ✅ (v0.2 `/api/me` SQL nebudí); ❓ „petra maže 200“ a přiřazení rolí bez uloženého běhu; první volání `AadHttpClient` v nové relaci 26,9 s (token vs. studený start ❓ nerozlišeno) |
| 3 | **Plánovaná úloha** (ČNB → CSV → e-mail) | stáhne cizí API bez CORS (ČNB), vyrobí CSV (30 měn) a pošle e-mail s přílohou ze sdílené schránky přes Graph s managed identitou | Container Apps Job `job-egd-report` (rg `rg-egd-sonda-napojeni`), trigger Schedule (cron), 0,25 vCPU / 0,5 GiB, MI s Exchange RBAC for Applications omezeným na jednu schránku | **bez volání ze SPFx** (běží podle plánu); „spusť report hned“ ze SPFx přes API ❓ nepostaveno | MI + Exchange RBAC for Applications (Test-ServicePrincipalAuthorization `egd-report@` InScope ✅); žádný consent pro uživatele | haléře za běh (≈ 35–40 s) ✅ řád | [overeni/container-app/job](sondy/overeni/container-app/job/) (24. 11.: ruční start `az containerapp job start`, execution, log, doručený mail), [job-executions](sondy/overeni/napojeni/job-executions-2026-11-22.json), [job-logy](sondy/overeni/napojeni/job-logy-2026-11-22.txt), [cors-probe](sondy/overeni/napojeni/cors-probe-2026-11-22.json) | ✅ ruční spuštění (`az containerapp job start`) Succeeded 37 s (22. 11.) a 39 s (24. 11.), 30 kurzů ČNB, CSV 1239 B, doručený mail s přílohou `kurzy-cnb-….csv` 1465 B, `sendMail` 202 doručeno, cron přesně v 18:20:00 UTC, negativní test jako alice@ 403 `ErrorAccessDenied` (RBAC drží); ❓ docx a AI shrnutí v Jobu nezkoušeno |
| 4 | **Práva na jednotlivé položky** (zadavatel nasdílí svou položku kolegovi, ač sám nemá `ManagePermissions`) | při prvním sdílení přeruší dědičnost (`breakroleinheritance`, autor dostane `Contribute`), pak `ensureuser` + `addroleassignment`; kdo smí, rozhoduje token (vlastník položky = `Author`, nebo app role `Spravce`); změnu dělá API svou identitou | `ca-egd-data-api` v0.2: `POST /api/sp/polozky/{id}/sdilet` body `{komu: UPN, role: Read\|Edit\|Contribute}`, `GET /api/sp/polozky/{id}/prava` (výpis); SharePoint REST pod **user-assigned managed identity** `id-egd-data-sp` | `AadHttpClient` (jako funkce 2), `client.post(…/sdilet)`, scope `access_as_user` na API `egd-sonda-data-api`; ✅ v prohlížeči: tomas sdílí položku 6 Evě → 200, eva ji vidí, jakub ne a `Sdílet` → 403 | souhlas správce pro SPFx → API; **MI: app role `Sites.Selected` na „Office 365 SharePoint Online“ + grant `fullcontrol` jen na jeden web** (`tools/prava-db-identita.sh`); `ManagePermissions` je jen ve Full Control, `manage`/`write` nezkoušeno ❓ | UAMI zdarma, Container App min 0 (sdílená s funkcí 2) | [08-test-sdileni.jsonl](sondy/container-app/prava-db/08-test-sdileni.jsonl) (23/23 `sedi: true`), [02-identita-setup.log](sondy/container-app/prava-db/02-identita-setup.log), [14](sondy/container-app/prava-db/14-tomas-klik.log)–[16](sondy/container-app/prava-db/16-jakub-klik.log) | ✅ B vidí / C nevidí (404), C na cizí položce 403, Schvalovatel 403, bez role 403, bez tokenu 401, Spravce 200, bez backendu zadavatel rozbije dědičnost jen 403; ❓ role `manage`/`write` na webu, system-assigned MI, certifikát, tenant E.ON ⛔ (viz [prava-db.md](sondy/container-app/prava-db.md) „Neověřeno“) |
| 5 | **Dokumenty: konverze LibreOffice** (docx/xlsx/pptx → PDF; základ pro šablony na serveru, jiné formáty než OOXML, soubory mimo M365) | LibreOffice headless 7.4.7 s fonty Carlito/Caladea/Liberation (metricky Calibri/Cambria/Arial); diakritika bez ztrát (5 vzorků, `pdftotext`) | Container App `ca-egd-dokumenty` (rg `rg-egd-ca-dokumenty`, 1 vCPU / 2 GiB, min 0 / max 2): `GET /healthz`, `GET /api/me`, `POST /api/pdf?ext=docx\|xlsx\|pptx` (tělo = binárka, odpověď `application/pdf`) | `AadHttpClient.getClient(<appId>)`, `client.post(…/api/pdf?ext=…, { body: arrayBuffer })`, scope `access_as_user` na API `egd-ca-dokumenty` (`54c0b31d-…`); ✅ web part pod `tomas.prochazka`: `/api/me` 200, převod pptx 200, PDF s diakritikou | registrace API + souhlas správce pro SPFx (`tools/ai-spfx-api-grant.sh`); token jiného API 401, bez scope 403; CORS jen SharePoint origin | aktivní replika ≈ 0,108 USD/h; jedno probuzení ≈ 0,01 USD, 100 probuzení/měs ≈ 1 USD; min 1 replika ≈ 23 USD/měs (výpočet ze sazeb Retail Prices API, vyúčtování ❓) | [azure-1.jsonl](sondy/container-app/libreoffice/dukazy/azure-1.jsonl), [spfx-klik.log](sondy/container-app/libreoffice/dukazy/spfx-klik.log), [auth.log](sondy/container-app/libreoffice/dukazy/auth.log), [okrajove-0.2.log](sondy/container-app/libreoffice/dukazy/okrajove-0.2.log), [studeny-start-1.jsonl](sondy/container-app/libreoffice/dukazy/studeny-start-1.jsonl), [libreoffice.md](sondy/container-app/libreoffice.md) | ✅ PDF z docx/xlsx/pptx; teplý převod 1,06–1,61 s (11,5 MB docx 3,4 s celkem); studený start 25,6 s ze SPFx / 28,3 s curl; 4 souběžné převody na 1 replice 7 s; chyby 400/401/403/413/500 ošetřené; limit těla `MAX_BYTES` 25 MB je volba sondy; **kvalita**: pptx shodné s Graphem, docx tabulky bez pevných šířek a xlsx fonty bez jména se liší; ❓ dokument uložený Wordem/Excelem (šablona E.ON), štítky citlivosti ⛔, Windows build bez admina ⛔ |
| 6 | **Graph jménem uživatele (OBO)** | výměna uživatelského tokenu za token Graphu (`Mail.ReadBasic User.Read`), tj. oprávnění, které má jen toto API, ne všechny SPFx v tenantu; server rozhoduje, co vrátí (5 předmětů) | Container App `ca-egd-obo` (rg `rg-egd-ca-obo`, min 0 / max 1): `GET /api/posta` (ukázka), důkaz identity API dvěma způsoby: **A) federated credential na uživatelem přiřazenou MI (bez tajemství)**, **B) client secret v Key Vaultu** | `AadHttpClient.getClient(<appId>)`, `client.get(…/api/posta)`, scope `access_as_user` na API `egd-ca-obo-api` (`9809454b-…`); ✅ web part pod Tomášem 200, 486 ms (OBO 285 ms, Graph 104 ms); totéž přímo `MSGraphClientV3` → 403 | **admin consent API → Graph** (uživatel si ho dát nesmí ✅ „Need admin approval“; bez něj 403 `AADSTS65001`), souhlas SPFx → API, FIC na registraci API, tag `WindowsAzureActiveDirectoryIntegratedApp` na SP | Container App min 0, Key Vault (varianta B) centy 📘; útrata ❓ neodečtena | [obo.md](sondy/container-app/obo.md), [spfx/tomas.prochazka.json](sondy/container-app/obo/dukazy/spfx/tomas.prochazka.json), [matice-mi-1.jsonl](sondy/container-app/obo/dukazy/matice-mi-1.jsonl), [matice-secret.jsonl](sondy/container-app/obo/dukazy/matice-secret.jsonl), [consent-revoke-lucie.jsonl](sondy/container-app/obo/dukazy/consent-revoke-lucie.jsonl) | ✅ varianta A i B; negativní: bez tokenu 401, špatná audience 401, bez souhlasu 403; odebrání souhlasu platí do 92 s; studený start 20,3 s, první OBO 4,2 s, další 0,4–0,9 s; **pasti** ✅ koncový `\n` v tajemství a `AADSTS7000215` v prvních minutách po založení; ❓ Conditional Access/MFA (`interaction_required`) ⛔, certifikát, system-assigned MI, politika user consent v E.ON ⛔ |
| 7 | **Řetěz v Jobu: ČNB → LLM → docx → PDF → e-mail** (denní report) | stáhne cizí API bez CORS, analýza přes LLM gateway, docx v procesu, PDF přes `ca-egd-dokumenty`, e-mail s PDF i docx přílohou z `egd-report@` | Container Apps Job `job-egd-retez` (Manual, cron volitelně), user-assigned MI `id-job-egd-retez` bez tajemství | bez volání ze SPFx (běží podle plánu nebo ručně) | **aplikační role `Gateway.App` na API gateway a `Dokumenty.App` na PDF API** (client credentials přes MI) + Exchange RBAC for Applications jen na `egd-report@`; MI nemá žádné Graph oprávnění v Entra | haléře: LLM krok ≈ 0,0004 USD, běh desítky sekund | [job-retez.md](sondy/container-app/job-retez.md), [beh-1.log](sondy/container-app/job-retez/dukazy/beh-1.log), [doruceni-1.txt](sondy/container-app/job-retez/dukazy/doruceni-1.txt) | ✅ celý řetěz v jednom běhu (02:10:44–02:11:51 UTC), mail doručen s přílohami; druhý běh se studenými závislostmi 100 s ✅; tím ✅ i větev `Gateway.App`; ❓ vše v E.ON ⛔ |

**Co v katalogu zůstává ❓ (k 24. 11.):** příčina 502 po čistém nasazení,
ruční spuštění Jobu ze SPFx a docx/AI shrnutí v Jobu; `Sites.Selected` s rolí `manage`/`write` (4); dokument uložený
Wordem/Excelem a štítky citlivosti (5); Conditional Access/MFA při OBO a certifikát místo tajemství (6);
vše v tenantu E.ON ⛔. Funkce 1–6 mají ✅ celou cestu SPFx → Container App.
Surové logy gateway a Jobu jsou uložené v `sondy/overeni/container-app/` (24. 11.), „log neuložen ❓“ u nich odpadá.

## Funkce, které Container App otevírá

U každé funkce je i cesta bez serveru nebo přes Power Automate (PA), viz sekce níž; tady je jen to, co
dává server.

| Funkce | Proč to bez serveru nejde | Stav (server) | Varianty a odkazy | Požadavek Tomáše |
|---|---|---|---|---|
| LLM gateway (chat, OCR, rozpoznání obrázků, generování) s kvótou na appku | klíč k LLM by byl v prohlížeči | ✅ celá cesta SPFx → AadHttpClient → gateway → Azure OpenAI / Document Intelligence: chat 1,0–1,7 s, OCR ~1,2 s, vision 2,2–3,0 s, kvóta (429), log ceny, 401/403. Generování obrázků ne (kvóta 0). Studený start ≈ 30 s (✅ 27,9–30,1 s, [studeny-start](sondy/overeni/ai/studeny-start-2026-11-22.txt)), min. 1 replika ≈ 8 USD/měs. (📘 výpočet z ceníku). Uložený log: [probe-2026-11-22.out](sondy/overeni/ai/probe-2026-11-22.out); kvóta 429 a 403 u neznámé appky ✅ ve [ms-llm](sondy/ms-llm/README.md). APIM Consumption neumí token limit ani kvótu (✅ uložení politiky odmítnuto); token limit chce tier v2 ≈ 150 USD/měs. (📘 přepočet) | 🔀 PA flow s konektorem Azure AI Foundry Inference: Standard ✅ doběhlo ([power-automate.md](sondy/power-automate.md)), ale bez kvóty na appku a bez auditu na uživatele. [sondy/ai.md](sondy/ai.md) | 2 |
| Cizí API bez CORS (ČNB, OTE) a scraping webů | prohlížeč je zablokuje (CORS) | ✅ ČNB stažené z Jobu ([job-logy](sondy/overeni/napojeni/job-logy-2026-11-22.txt)); ✅ z prohlížeče zablokované (`sondy/napojeni/cors-vysledek.json`, [cors-probe](sondy/overeni/napojeni/cors-probe-2026-11-22.json)) | 🔀 PA HTTP: viz tabulka PA níž (✅ negativní, Premium 403). [sondy/napojeni.md](sondy/napojeni.md) | 5 |
| Plánované úlohy (denní report → dokument → e-mail) | appka běží jen, když ji má někdo otevřenou | ✅ Job s cronem se spustil a poslal mail s přílohou (CSV, [executions](sondy/overeni/napojeni/job-executions-2026-11-22.json); docx a AI shrnutí v Jobu ❓ nezkoušeno) | 🔀 PA Recurrence Standard ✅. [sondy/napojeni.md](sondy/napojeni.md) | 7 |
| E-mail ze sdílené schránky (ne jménem uživatele) | potřebuje aplikační oprávnění | ✅ Graph sendMail přes managed identity, omezeno RBAC na jednu schránku (jiná schránka 403, [job-logy](sondy/overeni/napojeni/job-logy-2026-11-22.txt)) | 🔀 PA „Send from a shared mailbox“ (flow uloženo, běh ❓). [sondy/napojeni.md](sondy/napojeni.md) | 6 |
| Vlastní databáze (relační data, víc tabulek, SQL reporty, data čte i jiný systém) | SharePoint seznam není relační a má limit 5000 na dotaz | ✅ Azure SQL free + API, role z tokenu (Zadavatel/Schvalovatel/Spravce), volání tokenem ([api-matrix-2026-11-22.jsonl](sondy/overeni/data-prava/api-matrix-2026-11-22.jsonl)) i `AadHttpClient` ze SPFx ✅ pod 3 účty ([prava-db.md](sondy/container-app/prava-db.md)) | 🔀 viz „Databáze: varianty“ níž. [sondy/data-prava.md](sondy/data-prava.md) | 1 |
| Práva na jednotlivé položky (sdílet záznam vybraným lidem) | běžný uživatel práva v SPFx rozdávat nesmí (✅ 403) | ✅ backend postaven a změřen 24. 11.: endpoint `POST /api/sp/polozky/{id}/sdilet` v `ca-egd-data-api` pod managed identitou (`Sites.Selected` + `fullcontrol` na web), 23/23 volání podle očekávání, `AadHttpClient` ze SPFx ✅ ([katalog 4](#katalog-ověřených-funkcí-cíl-každá-funkce--v-labu--postup-volání), [prava-db.md](sondy/container-app/prava-db.md)) | 🔀 viz „Práva na položky: varianty“ níž. [sondy/data-prava.md](sondy/data-prava.md) | 4 |
| Role složitější než „své / vše“ (oddělení, nadřízený) | SharePoint skupiny to nevyjádří | ✅ jen **ploché app role** (Zadavatel / Schvalovatel / Spravce) vynucené v API (`/api/me`, 403 podle role). ❓ Hierarchie „oddělení / nadřízený“ nikdo neměřil: není v API ani v sondách, skupina místo jednotlivce při sdílení také ❓ ([prava-db.md](sondy/container-app/prava-db.md)); návrh ověření: app role nebo skupina z tokenu (`groups`) + tabulka oddělení v SQL | 🔀 PA logika ve flow (nevynucuje role) viz tabulka PA. [sondy/data-prava.md](sondy/data-prava.md) | 4 |
| Těžší dokumenty (konverze LibreOffice, šablony na serveru, velké soubory) | v prohlížeči jen to, co zvládnou JS knihovny | ✅ v kontejneru postaveno a změřeno 24. 11.: `ca-egd-dokumenty`, `POST /api/pdf`, diakritika bez ztrát, teplý převod ≈ 1,1–1,6 s, studený start 25–28 s, `AadHttpClient` ze SPFx ✅ ([katalog 5](#katalog-ověřených-funkcí-cíl-každá-funkce--v-labu--postup-volání), [libreoffice.md](sondy/container-app/libreoffice.md)) | 🔀 viz „Dokumenty: varianty“ níž. [sondy/dokumenty.md](sondy/dokumenty.md) | 3 |
| Volání Graphu jménem uživatele (OBO) s oprávněními, která appka v prohlížeči nedostane | admin consent jen pro API, ne pro každou appku | ✅ na Container App v egd labu 24. 11. (SPFx → `ca-egd-obo` → OBO → Graph `/me/messages`, MI bez tajemství i Key Vault; [katalog 6](#katalog-ověřených-funkcí-cíl-každá-funkce--v-labu--postup-volání), [obo.md](sondy/container-app/obo.md)); dříve ✅ v ppf-rooms na Function App | `~/Projects/ppf-rooms/docs/obo.md` (hodně míst je v něm ❓); 🔀 PA OBO neumí (viz tabulka PA) | – |

### Databáze: varianty (všechny, pro a proti)

Podrobně [sondy/data-prava.md](sondy/data-prava.md). Doporučení až tam; nevítězné varianty zůstávají.

| Varianta | Stav | Pro | Proti | Co chce IT E.ON | Náročnost pro citizen developera |
|---|---|---|---|---|---|
| A) SharePoint seznam | ✅ (6000 položek, práva ✅ pod 5 účty) | 0 USD, žádné Azure ani licence navíc, práva vynucuje SharePoint | nerelační, limit 5000 na dotaz (indexy, stránkování) | web, právo zakládat skupiny a úrovně | nízká (kit: manifest + mock) |
| C) Azure SQL free + Container App + app role | ✅ včetně `AadHttpClient` ze SPFx | relační, SQL reporty, data čte i jiný systém, role z tokenu | Azure, Entra, consent; studený start 7,8 s a po auto-pauze SQL ❓ neměřeno | subscription, Entra app, consent, provoz | vysoká |
| Cosmos DB free tier | ❓ nezkoušeno (📘 1000 RU/s + 25 GB zdarma, jeden na subscription) | NoSQL bez serveru DB | jiná technologie, žádné SQL reporty | subscription | střední ❓ |
| Dataverse (plný) | ❓ nezkoušeno (📘) | relační, řádková bezpečnost, audit | per-user licence (Galík nechce), nové prostředí; Dataverse for Teams se ruší (📘 sekundární zdroje) | licence, kapacita tenantu | střední ❓ |
| Postgres Flexible | ❓ nezkoušeno (📘 trvalý náklad) | standardní relační | trvalý náklad, žádná výhoda proti SQL free | subscription | vysoká ❓ |
| PA + SQL / Dataverse | ❓ nezkoušeno (Premium ✅ tier z API) | – | Premium licence, nemá smysl proti C | Premium | střední ❓ |

### Práva na položky: varianty

| Varianta | Stav | Pro | Proti | Co chce IT E.ON | Náročnost |
|---|---|---|---|---|---|
| A) `ReadSecurity=2` („vidím jen své“) | ✅ | nejlevnější a nejspolehlivější, bez serveru | vše-nebo-nic; sdílení kolegovi nejde; schvalovatel potřebuje `CancelCheckout` (dává i mazání) | skupiny a úrovně | nízká |
| B) `ReadSecurity=1` + ACL na položce nastavené servisním účtem | ✅ ACL funguje, ale **důkaz je slabší**: u „schvalovatel s Edit“ vrací `extras2.jsonl` ř. 28 404 „Seznam neexistuje“ (list nepřístupný, ne skrytá položka), zopakovat s právem na list ❓ ([data-prava.md](sondy/data-prava.md)). ✅ zadavatel práva sám nerozdá, ale v `ZadostiACL` na položce s předchozím grantem 200 ❓ nevysvětleno, **nepoužívat pro důvěrná data, dokud se nevysvětlí**. Nastavení právy `ManagePermissions` ❓ nepostaveno jako služba | skutečné sdílení po záznamu | potřebuje backend s oprávněním | backend (viz C, D, E) | vysoká |
| C) Container App backend s `ManagePermissions` (managed identita + `Sites.Selected` + `fullcontrol` na web) | ✅ 23/23, `AadHttpClient` ✅ ([prava-db.md](sondy/container-app/prava-db.md)) | kód v gitu, audit, žádné tajemství, právo jen na jeden web; zadavatel sdílí sám, i když `ManagePermissions` nemá | Azure, appka smí na webu vše (`fullcontrol`; menší role ❓); grant na web umí jen `Sites.FullControl.All` | subscription, UAMI, app role `Sites.Selected` + grant na web, souhlas SPFx → API | střední (dostane hotovou identitu), pro IT vysoká |
| D) PA flow „Grant access to an item“ | ❌ běh `…CU19` (23. 11.) selhal: 400 „The selected permission level is not valid“ (hodnoty Read/Edit/View/Contribute/Full Control všechny `BadRequest`); platné hodnoty ❓ zjistit v designeru (flow id `c076f6d0-…`) | Standard, jedna akce | běží s právy vlastníka připojení (sdílený účet), v auditu SharePointu je to vlastník flow | licence PA, servisní účet s Manage Permissions | střední |
| E) Function App | ❓ nepostaveno | levnější hosting než Container App ❓ | stejné nároky na identitu | subscription | vysoká |

### Dokumenty: varianty

Podrobně [sondy/dokumenty.md](sondy/dokumenty.md) (sonda doporučuje A, doporučení tam).

| Varianta | Stav | Pro | Proti | Co chce IT E.ON | Náročnost |
|---|---|---|---|---|---|
| A) V prohlížeči v SPFx (docx, exceljs, pptxgenjs, pdf-lib, docxtemplater) | ✅ všech 5 výstupů, čeština, šablona Word; šablona PPTX/XLSX ❓ | bez Azure a licencí | velké bundle (lazy chunk), opuštěné knihovny (pdf-lib, exceljs) | nic navíc | nízká |
| A2) PDF přes Graph `?format=pdf` (`MSGraphClientV3`) | ✅ SPFx i prohlížeč; `Files.Read.All` | věrné PDF, bez Azure | schválení `Files.Read.All` pro celý tenant; v labu měl principál grant už předem, samotné schválení ❓ nezkoušeno | schválení (kdo: ❓ Global Admin dle dokumenty.md) | nízká |
| B) PA: Word Online „Populate“ + PDF | 📘 Premium; ❓ nezkoušeno | šablony na pozadí | Premium licence | licence | střední |
| B2) PA: OneDrive „Convert file“ | ✅ běh `…CU08` (23. 11.) `Succeeded`, všechny 4 akce OK (flow id `6492f614-…`, `sondy/power-automate/vystupy/behy.txt`) | Standard | jen převod hotového dokumentu, jen soubory v OneDrive uživatele | licence PA | střední |
| C) Container App s LibreOffice | ✅ docx/xlsx/pptx → PDF, `AadHttpClient` ✅, studený start 25–28 s ([libreoffice.md](sondy/container-app/libreoffice.md)) | převede i soubor mimo M365, jiné formáty než OOXML, hromadně a z Jobu, žádný Graph consent, základ pro šablony na serveru | Azure, Docker build (ACR Tasks zakázané), LibreOffice ≠ Office (tabulky bez šířek, fonty bez jména); pro soubor už v SharePointu je A2 věrnější | subscription, ACR, Entra app + souhlas SPFx | vysoká |

## Alternativa přes Power Automate (ke každé funkci)

Tabulka je převzatá z ověřené [sondy/power-automate.md](sondy/power-automate.md) (zdroj pravdy; při změně
se opravuje tam). EG.D Azure nemusí dostat, proto ke každé funkci i cesta přes PA (Pavel, 22. 11.).
Stav k 23. 11. 2026: připojení jsou přihlášená (Pavel 23. 11.), běhy proběhly, část skončila chybou (viz řádky); zbývá rozhodnutí o trialu Premium/PAYG, vše do konce E5 trialu 25. 11. 04:04.

| Funkce | Cesta přes Power Automate | Konektor | Licence | Stav |
|---|---|---|---|---|
| LLM (chat, shrnutí, klasifikace) | akce „Chat completion“ proti Azure OpenAI | Azure AI Foundry Inference | **Standard** ✅ (tier z API) | ✅ flow doběhlo, připojení vzniklo přes API bez člověka. Bez kvóty na appku a auditu na uživatele; OCR/vision ✅ (flow s obrázkem faktury vrátilo přesný přepis, běh `…CU25`, `sondy/power-automate/vystupy/behy.txt`); Document Intelligence přes PA ❓ nezkoušeno; AI Builder není v katalogu prostředí (chce Dataverse + kredity ❓) |
| Cizí API bez CORS (ČNB, OTE), scraping | akce HTTP | vestavěné HTTP | **Premium** ✅ | ✅ negativní: flow s HTTP se v labu **nedá zapnout**; flow Button + HTTP vrátí 403 `MissingAdequateQuotaPolicy` („you need a Power Automate Premium license“), tedy příčina je licence (`sondy/power-automate/vystupy/diag-409.txt`). Flow Recurrence + HTTP a Request trigger dostanou jen obecné 409 `CannotStartUnpublishedSolutionFlow`, **příčina u nich neznámá ❓** (mluví o nepublikovaném řešení a připojeních, ne o licenci). Flow bez HTTP naběhne. Rozpor s ppf-rooms (HTTP pod E5 doběhlo) viz sekce „Neověřeno“ na konci. Standardní náhrada: RSS konektor ✅ (jen feedy) |
| Plánované úlohy | Recurrence trigger | Recurrence | **Standard** ✅ | ✅ Recurrence + Compose doběhlo (`Succeeded`); běh s konektory SharePoint/Outlook po přihlášení připojení v sondě nezaznamenán ❓ |
| E-mail ze sdílené schránky s přílohou | „Send an email from a shared mailbox (V2)“ | Office 365 Outlook | **Standard** ✅ | flow uloženo (id `78b7eef6-…`), Send As přidáno ✅ (`Get-RecipientPermission`); běh `…CU21` (23. 11., po přihlášení) ❌ selhal na akci `Posli`: 404 `ErrorItemNotFound`; příčina ❓ (hypotéza: konektor chce i FullAccess, ověřit a opakovat) |
| Vlastní databáze | SQL konektor nebo Dataverse | SQL Server, Dataverse | **Premium** ✅ (tier z API) | ❓ nezkoušeno |
| Práva na položky | „Grant access to an item or a folder“ | SharePoint | **Standard** ✅ | flow uloženo (id `c076f6d0-…`); běh `…CU19` ❌ 400 „The selected permission level is not valid“ (hodnoty Read/Edit/View/Contribute/Full Control všechny `BadRequest`); platné hodnoty ❓ zjistit v designeru (`GetItemAccessRoleOptions`) |
| Role složitější než „své / vše“ | logika ve flow | Office 365 Groups, Users, SharePoint | **Standard** ✅ (tier) | ❓ nezkoušeno; PA role nevynucuje |
| Dokumenty: šablona Word → PDF | (a) Word Online „Populate“; (b) OneDrive „Convert file“ | (a) Word Online (Business); (b) OneDrive | (a) **Premium** ✅; (b) **Standard** ✅ | (a) ❓; (b) ✅ běh `…CU08` (23. 11.) `Succeeded`, všechny 4 akce OK (flow id `6492f614-…`, `sondy/power-automate/vystupy/behy.txt`); (a) ❓ |
| Volání Graphu jménem uživatele (OBO) | konektory běží jako vlastník připojení | – | Standard | ❓; „PA OBO neumí“ je ❓ neověřeno (viz Neověřeno); ověřeno jen: HTTP s Entra ID je Premium ✅ |

### Spuštění flow z SPFx appky

| Cesta | Licence | Stav |
|---|---|---|
| „When an HTTP request is received“ (Request trigger, URL z appky) | tier **Premium 📘** (vestavěný trigger není v katalogu konektorů, tier z něj nejde ✅ odečíst) | ✅ negativní: flow `diag Request Http trigger + Compose` (bez akce HTTP) se v labu nezapnulo: obecné 409 `CannotStartUnpublishedSolutionFlow`; **příčina blokace ❓ neznámá** (licence u triggeru není prokázaná; `vystupy/diag-409.txt` E) |
| Akce **HTTP** ve flow (např. po Button triggeru) | **Premium ✅** | ✅ zapnutí vrací 403 `MissingAdequateQuotaPolicy` („you need a Power Automate Premium license … connection: 'Http'“), tedy příčina je licence ✅ (`vystupy/diag-409.txt` D/F) |
| Request trigger druh „PowerApp“ | Standard? ❓ | ✅ zapnuto, URL získána, bez tokenu 401; ❓ s tokenem uživatele 403 `MisMatchingOAuthClaims` (příčina neznámá) |
| Request trigger druhy „Button“, „Teams“ | Standard | ✅ zapnuto, ale `listCallbackUrl` zablokován; z appky nevolatelné |
| **Seznam jako fronta** (SPFx zapíše položku do SharePoint seznamu, flow „When an item is created“ ji zpracuje a výsledek zapíše zpět) | **Standard** ✅ (SharePoint) | ✅ změřeno 23. 11.: flow `queue-llm` (LLM přes Foundry, zápis zpět `PatchItem`) zapsalo `Vysledek` **po 43 s** od vytvoření položky přes `m365 spo listitem add` (`vystupy/behy.txt`); háček: `PatchItem` chce `item/Title`; latence do ~1 min (polling), pro interaktivní UI pomalé, pro asynchronní zpracování stačí; z web partu přes SPFx zápis do seznamu samotný ❓ nezkoušen |
| „For a selected item“ (tlačítko Automatizovat v seznamu) | Standard ❓ | ❓ nespouští se z web partu |
| Volání Flow API tokenem uživatele z prohlížeče | ❓ | ❓ v SPFx nezkoušeno |

Srovnání pro vibecodera a IT E.ON: [sondy/power-automate.md](sondy/power-automate.md) („Srovnání s Container App“).

## Co Container App vyžaduje (požadavky na E.ON IT)

Sloupec „Lab“ říká, co jsme změřili. Kde je ⛔, v labu to nejde ověřit, protože E.ON tenant ani jejich IT nemáme;
ověřuje se dotazem u IT E.ON nebo při testu s hostem z EG.D.

| Co | Proč | Kdo to v E.ON dělá | Lab |
|---|---|---|---|
| Azure subscription a resource group | hosting | IT / cloud tým ⛔ (rozhodnutí E.ON; zeptat se Galíka) | ✅ |
| Container Apps prostředí | v jednom předplatném smí být jen **jedno** (`MaxNumberOfGlobalEnvironmentsInSubExceeded`). Sdílet ho mezi appkami | IT ⛔ | ✅ `ca-ppf-rooms-env` (sdílené) |
| Registrace aplikace v Entra (API, app role, přiřazení uživatelů) | aby server poznal, kdo volá | Entra admin ⛔ | ✅ |
| Admin consent pro `webApiPermissionRequests` v SPFx | aby appka dostala token na API (platí pro celý tenant) | změřeno ✅ jen Global Admin; zda stačí role SharePoint admin ❓, ⛔ v E.ON | ✅ **UI SharePoint admin centra (API access) pod Global Adminem funguje a drží** (`sondy/overeni/api-access/ui-4/`); ✅ ekvivalent přes Graph `oauth2PermissionGrant` (`tools/ai-spfx-api-grant.sh`) jako fallback, protože CLI `permissionrequest approve` selhal; příčina rozdílu CLI × UI ❓; šlo o rozšíření existujícího grantu (PATCH), ❓ první grant (POST) a ❓ zda stačí SharePoint admin |
| Managed identity + oprávnění (Graph `Mail.Send`, SQL, LLM) | server bez hesel | Entra admin, Exchange admin (RBAC for Applications) ⛔ | ✅ |
| Container registry (ACR) na image | produkční nasazení vlastního kódu | IT ⛔ | 📘 ACR Basic ≈ 0,17 USD/den (≈ 5 USD/měs., výpočet z ceníku, [ai.md](sondy/ai.md) sekce „Vytvořené zdroje“; faktura nepotvrdila ❓); ACR Tasks zakázané (`az acr build` nejde, build lokálně) |
| LLM endpoint (Azure OpenAI / Foundry) a kvóta | gateway | IT + nákup ⛔ (smlouva/DPA, Global Standard vs DataZone EU) | ✅ `aoai-egd-sonda-ai`; kvóta obrazových modelů 0 |
| Managed identita pro SharePoint (funkce 4): app role `Sites.Selected` na „Office 365 SharePoint Online“ + grant `fullcontrol` na konkrétní web | server mění práva na položkách bez tajemství; `ManagePermissions` je jen ve Full Control | Entra admin (role), SharePoint/Global admin (grant na web) ⛔ rozhodnutí, zda je „appka smí na jednom webu vše“ přijatelné | ✅ ([prava-db.md](sondy/container-app/prava-db.md)) |
| Admin consent API → Graph pro OBO (funkce 6) | bez něj 403 `AADSTS65001`, uživatel souhlas dát nesmí ✅; platí jen pro toto API, ne pro všechny SPFx | Entra admin ⛔ (politika user consent E.ON ❓) | ✅ ([obo.md](sondy/container-app/obo.md)) |
| Federated credential na registraci API, nebo Key Vault + politika tajemství (funkce 6) | důkaz identity API při OBO | Entra admin / IT ⛔ | ✅ obě varianty |
| Build image bez ACR Tasks (funkce 5, 6) | v labu ACR Tasks zakázané, lokální `docker buildx` | správce platformy nebo pipeline ⛔; Docker na Windows bez admina ❓ | ✅ lokálně |
| Provoz: logy, monitoring, kdo opraví, když spadne | server je trvalá služba | „správce platformy“ ⛔ (organizační rozhodnutí) | Log Analytics ✅ |

Galík chce cestu **bez Azure hostingu** a plný Azure setup bere jako „heavy“ ([01](01-fakta-workshopu.md)).
Container App proto dává smysl jako **jedna sdílená platforma pro všechny appky** (gateway, jobs, API),
kterou spravuje jeden tým. Rozhodně ne jako vlastní server každého vibecodera. Tam, kde Azure nebude, zůstává
varianta bez serveru (SharePoint seznamy, prohlížeč, PA Standard) a tabulky výše říkají, co nepokryje.

## Co smí vlastník webu bez admin rolí (účet egd01, web egd01-test) – měřeno 24. 11.

Odpověď na otázku „co zvládne site owner“, protože v labu máme jen Global Admina a SharePoint admina. Měřeno pod
`egd01` (`IsSiteAdmin: true`, žádná role v tenantu) přes REST z prohlížeče; důkazy a těla odpovědí:
[sondy/overeni/site-owner/README.md](sondy/overeni/site-owner/README.md). 🔀 Celý průchod skillem pod `egd10` přidá
[sondy/e2e/README.md](sondy/e2e/README.md) (po dokončení odkazuji).

| Co | Site owner | Důkaz / poznámka |
|---|---|---|
| Nahrát `.sppkg` do **site** katalogu a nasadit (`Deploy`) | ✅ upload 0,9 s, Deploy 2,9 s, `Deployed: true` | `01-…json` |
| Balíček s `webApiPermissionRequests` | ✅ nahraje se i nasadí bez chyby, **bez schválení** a bez upozornění vlastníkovi; požadavek skončí ve frontě tenantu (i site katalog zakládá tenantní požadavky); tenant admin API je pro něj 403. Chování web partu za běhu bez schválení ❓ neměřeno | `02-*`, `03-*` |
| Schválit API access | ❌ nemůže (to je admin tenantu; změřeno jen Global Admin ✅, role SharePoint admin ❓) | viz [10](10-container-app.md) |
| Vytvořit seznam, sloupec, položku, stránku | ✅ 201 / 201 / 201, stránka 201 + publish 200 | `04-…json` |
| Role na seznamu (přerušit dědičnost, přidat skupinu, vrátit) | ✅ 200 / 200 / 200; po resetu vznikl systémový řádek Limited Access pro vlastníka | `04-…`, `05-…json` |
| Graph PDF (`?format=pdf`) pod vlastním tokenem | ✅ s `Files.ReadWrite.All` (docx 1 str., xlsx 2, pptx 3; 1–1,4 s); `Files.Read.All`: převod existujícího souboru 200, nahrání 403; `Files.Read` ❌ 403. Token musí mít souhlas admina (viz API access výše); `egd01` nemá OneDrive (`/me/drive` 400) | `07-…`, `08-…` |
| `m365` CLI v11 bez admin práv | ✅ po tenantovém admin consentu appky CLI (24. 11.): `spo web get`, `spo list add`, `spo app add --appCatalogScope sitecollection` i `spo app deploy` rc=0 pod `egd01`. ❓ bez consentu: „Need admin approval“ změřeno pod `jakub.kucera` (politika microsoft-user-default-low, `skills/egd-recon`); dřívější AADSTS65001 pod `egd01` | `10-cli-egd01-…`, `11-cli-deploy.log` |

Důsledky: nasazení a práce s daty zvládne vlastník webu sám ✅; cokoli s API (gateway, DB API, Graph scopy) potřebuje
jednorázově admina tenantu ⛔. Totéž consent pro appku CLI: bez něj účastník `m365` nepřihlásí ⛔. Pozor, většina testů skillů dosud běžela pod adminem, ne pod vlastníkem.

## Souhrnný seznam oprávnění pro security assessment E.ON

Jeden přehled všeho, co Container App platforma a SPFx appky od E.ON chtějí. Sloupec „Rozsah“ říká, jak daleko
oprávnění sahá (to je to, co bude security řešit). „Lab“ = ✅ změřeno / ❓ / ⛔ (jen v E.ON). Podrobnosti a důkazy
v katalogu výš a v odkazovaných sondách.

| # | Oprávnění / objekt | Typ | Rozsah | K čemu | Kdo schvaluje v E.ON | Lab |
|---|---|---|---|---|---|---|
| 1 | Azure subscription + resource group, Container Apps prostředí (jedno na předplatné), ACR, Log Analytics, Key Vault (jen varianta OBO se secretem) | Azure RBAC / nákup | předplatné nebo RG | hosting platformy | IT / cloud tým ⛔ (rozhodnutí E.ON) | ✅ |
| 2 | Azure OpenAI / Foundry resource + Document Intelligence, kvóta modelů, smlouva/DPA | Azure + právní | resource | LLM gateway, OCR | IT + nákup + právní ⛔ | ✅ |
| 3 | **Registrace aplikace v Entra** pro každé API (gateway, DB API, dokumenty, OBO): identifier URI, scope `Gateway.Use` / `access_as_user`, app role, service principal s tagem `WindowsAzureActiveDirectoryIntegratedApp` | Entra | jedno API | token pro `AadHttpClient`, role z tokenu | Entra admin; **cestu žádosti (ServiceNow) ❓ neověřeno**, proces E.ON neznáme ⛔ | ✅ |
| 4 | **Schválení API access** pro `webApiPermissionRequests` (SharePoint admin centrum → Advanced → API access) | delegované, SPFx → API | **tenant-wide pro principal „SharePoint Online Web Client Extensibility“**, tj. každý SPFx balíček v tenantu si může vyžádat daný scope | appka dostane token na API | SharePoint admin (v labu ✅ Global Admin; zda stačí SharePoint admin ❓) | ✅ UI, ✅ Graph grant jako záloha |
| 5 | **`Mail.Send`** delegovaný přes SPFx `MSGraphClient` | delegované, Graph | tenant-wide pro všechny SPFx (jménem přihlášeného uživatele, příloha ≤ 30 MB ✅) | e-mail z appky | SharePoint / Global admin ⛔ | ✅ ([ms-maily](sondy/ms-maily/README.md)) |
| 6 | **`Files.Read.All`** (Graph, převod `?format=pdf`) | delegované, Graph | tenant-wide pro všechny SPFx, čtení všech souborů, které uživatel smí | PDF bez serveru | Global admin (kdo přesně ❓ rozpor ai.md × dokumenty.md) ⛔ | ✅ použití, ❓ samotné schválení |
| 7 | **Aplikační `Mail.Send` přes managed identity + Exchange RBAC for Applications** omezený na jednu schránku | aplikační, Graph + Exchange | **jedna schránka** (jiná 403 ✅) | plánovaný Job posílá report | Exchange admin ⛔ | ✅ |
| 8 | **`Sites.Selected` na „Office 365 SharePoint Online“** pro UAMI + grant `fullcontrol` na konkrétní web | aplikační, SharePoint | **jeden web, ale Full Control** (`manage`/`write` ❓ nezkoušeno) | server mění práva na položkách | Entra admin (role) + SharePoint/Global admin (grant) ⛔ | ✅ |
| 9 | **Admin consent API → Graph** pro OBO (`User.Read`, `Mail.ReadBasic`) | delegované, API → Graph | jen toto API, ne všechny SPFx (uživatel si ho dát nesmí ✅) | OBO Graph jménem uživatele | Entra admin ⛔ (politika user consent E.ON ❓) | ✅ |
| 10 | Federated credential na registraci API (varianta bez tajemství) nebo Key Vault + client secret (rotace) | Entra / Key Vault | jedna registrace | důkaz identity API při OBO | Entra admin / IT ⛔ | ✅ obě |
| 11 | User-assigned managed identity: AcrPull, přiřazení k Container App | Azure RBAC | RG / ACR | pull image, přístup ke službám | IT ⛔ | ✅ |
| 12 | Odchozí síť z kontejneru (Entra, ČNB/OTE a jiná cizí API, Azure OpenAI) a z E.ON prohlížečů na `*.azurecontainerapps.io` | síť / proxy | podle domény | provoz | síťový tým ⛔ | ❓ |
| 13 | Power Automate: licence (Premium pro HTTP), přihlášená připojení, role Environment Maker | licence | uživatel / prostředí | alternativa bez serveru | IT / licence ⛔ | ✅ tier z API |

Pro assessment je rozhodující rozdíl **tenant-wide** (řádky 4–6: schválení platí pro všechny SPFx v tenantu, server
nemůže omezit, co appka čte) × **na jedno API / schránku / web** (řádky 7–9: Container App s identitou omezuje rozsah
a rozhoduje, co vrátí). To je argument pro sdílenou platformu spravovanou jedním týmem (viz „Co Container App vyžaduje“).
Co v E.ON projde, se zjistí až dotazem na IT (⛔).

## Cena (lab)

Container App s min. 0 replikami a Job za běh stojí haléře (✅ řád, Cost Management s odstupem). Azure SQL free offer je za 0.
ACR Basic ≈ 0,17 USD/den (≈ 5 USD/měs.) 📘 (z ceníku, ne z faktury). Hlavní proměnný náklad je LLM (tokeny, ✅ chat ≈ 0,0001 USD/volání).
Odhad pro ~10 appek: 35 až 300 USD/měs. podle počtu volání (**odhad, ne měření**, [ai.md](sondy/ai.md) „Ceny“).
Rozpočet projektu: ~50 USD na zkoušení teď, do 300 USD na workshop ([CLAUDE.md](CLAUDE.md)); Azure budget
`mcp-lab-budget` je 20 EUR/měs. (06-azure-inventar.md), jiná měna a jiný účel, nepřepočítáno.

## Otevřené otázky ⛔ (v labu nejde ověřit, ptát se E.ON)

- Má EG.D/E.ON vůbec Azure subscription pro citizen dev, a kdo by ji spravoval? ⛔ rozhodnutí E.ON.
- Smí SPFx v E.ON dostat admin consent na vlastní API (`webApiPermissionRequests`) a kdo schvaluje? ⛔ jen E.ON admin; UI průchod v labu ✅ ([ui-4](sondy/overeni/api-access/ui-4/)).
- LLM v E.ON: Azure OpenAI nebo jiný schválený endpoint? Pravidla pro data? ⛔ bezpečnost/právní E.ON.
- Stačí Power Automate Premium (PAYG) jako alternativa k části funkcí (e-maily, plánované úlohy)? ❓ v labu PAYG vazba na prostředí nečitelná, trial Premium nezapnut ([sondy/power-automate.md](sondy/power-automate.md) „Neověřeno“).
- Rozpor s ppf-rooms: v egd labu je HTTP blokované licencí (403 `MissingAdequateQuotaPolicy`), v ppf-rooms HTTP pod E5 doběhlo. ❓ Neověřeno, jak to ppf-rooms dosáhlo (jiný plán/prostředí?). Návrh: porovnat licence a prostředí obou labů.
- „Power Automate neumí OBO (volání jako přihlášený uživatel)“ je ❓ neověřeno; návrh: pokus s konektorem Office 365 Users/SharePoint a s HTTP s Entra ID pod Premium trialem.
- Běhy po přihlášení připojení (23. 11.): převod do PDF `…CU08` ✅, fronta ✅ (43 s), sdílená schránka `…CU21` ❌ (404), práva na položku `…CU19` ❌ (neplatná role); opakovat po opravě (FullAccess; hodnoty z designeru) a stihnout **před koncem E5 trialu 25. 11. 04:04**, jinak flow ztratí licenci.

## Neověřeno (pro roli Ověřovatel sond)

| Tvrzení | Proč zatím ne | Jak ověřit |
|---|---|---|
| Příčina 409 u Request triggeru a Recurrence + HTTP; rozpor s ppf-rooms (HTTP pod E5 doběhlo) | v egd labu jen negativní výsledek; akce HTTP ve flow Button je licence ✅ (403) | trial Power Automate Premium pro lab uživatele, znovu `tools/pa-flow.py start` na `diag Request Http trigger + Compose`; porovnat prostředí a licence s ppf-rooms |
| Příčina selhání PA běhů `…CU21` (sdílená schránka, 404) a `…CU19` (práva, neplatná role) | připojení jsou přihlášená, běhy selhaly | FullAccess na `egd-report@` a opakovat; hodnoty role z `GetItemAccessRoleOptions` v designeru |
| Document Intelligence přes PA | nezkoušeno | flow s konektorem po trialu |
| Schválení API přístupu v SharePoint admin centru a kdo schvaluje | ověřen jen grant přes Graph | UI průchod pro jeden balíček v labu |
| Práva na položky: `Sites.Selected` s rolí `manage`/`write` místo `fullcontrol`; system-assigned MI | nezkoušeno (zvolen `fullcontrol`) | změnit grant a opakovat `tools/prava-db-test.py test` |
| LibreOffice: dokument uložený Wordem/Excelem (šablona E.ON), štítky citlivosti | v labu jen vzorky z JS knihoven | reálné dokumenty od Tomáše přes `test-pdf.sh` + Graph |
| OBO: Conditional Access/MFA (`interaction_required`), certifikát, system-assigned MI | v labu žádná CA politika | ⛔ E.ON, nebo politika MFA na testovacího uživatele |
| Surové logy některých ✅ měření (kvóta 429 gateway uložena v `sondy/ms-llm/e2e-429/`; DB API: výjimky „petra maže 200“ a přiřazení rolí) | uložené logy jsou v `sondy/overeni/{ai,napojeni,data-prava}` a `sondy/ms-llm`, chybí jen zmíněné výjimky | opakovat s uložením výstupu |
