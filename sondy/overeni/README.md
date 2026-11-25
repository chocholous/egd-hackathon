# Doměření sond v labu (role Ověřovatel sond)

Datum měření: 22. 11. 2026, lab `pavelchocholousgmail`. Zdroj úkolů: [audit/overeni.md](../../audit/overeni.md).
Každý řádek: tvrzení → příkaz → surový výstup (soubor v této složce) → výsledek.
Značky: ✅ změřeno · ❌ měření odporuje textu · ❓ neověřeno (důvod).
Nástroje: `tools/overeni-*` (viz [tools/README.md](../../tools/README.md), řádky doplní hlavní session).

## Změny, které měření v labu zanechalo

| Změna | Proč | Vrácení |
|---|---|---|
| `tomas.prochazka@…` přidán do skupiny „App catalog Visitors“ na `/sites/apps` | testovací účet v roli Visitor | `m365 spo group member remove` (nic jsem nemazal) |
| `tomas.prochazka` přiřazen k SP „EGD sonda AI gateway“ (výchozí role) | test `appRoleAssignmentRequired` | smazat `appRoleAssignment` `r39QMwZn…` |
| Entra app + SP `egd-overeni-api` (scope `Test.Read`), 3 balíčky `egd-overeni-apiaccess*` v tenant app catalogu, grant `Test.Read` pro SPFx principal | zkušební žádost o API access | nic nemazáno; nejde o existující granty |
| Container App `ca-egd-llm-gateway-t502` (min 0 replik) | opakování 502 | smazat po Pavlově ano |
| 2 řádky „overeni-…“ v tabulce `dbo.Zadost` (sonda data-prava) | matice cesty C | – |
| API `politiky` v `apim-egd-sonda-ai` (už existovalo) | test politik | – |
| API `egd-overeni-api` rozšířeno o scope `Test.Write`, balíček `egd-overeni-apiaccess-write` v tenant app catalogu, grant `Test.Write` (schváleno v UI) | UI schválení API access nad novým scopem | odebrat scope/grant, smazat balíček |
| Container Apps Job `job-egd-scrape` (Manual, rg-egd-sonda-napojeni, 0,25 vCPU) | scraping OTE | smazat po Pavlově ano |
| App registrace `egd-overeni-gwapp-client` + secret (2 dny, mimo repo) + role `Gateway.App` | 2.1 klient bez uživatele | viz [gateway-app/README.md](gateway-app/README.md) |
| App registrace `egd-overeni-gwapp-client2` (appId `eda29ad1-73c7-4f12-bb23-97bf9a24fa03`, SP `f92f8e98-4845-4bd4-b6dc-8eb7494f7bae`), secret do 2026-11-26T08:49Z v `~/.config/egd-overeni/gwapp2.secrets.json` (chmod 600), role `Gateway.App` (assignment `mI4v-UVI1Eu23I63SU97rvM6hXJ98EdMki4DzpPLwjw`) | nezávislé měření atomicity v3 | secret vyprší sám; smazání registrace jen na pokyn; přiřazení `az rest --method DELETE …/servicePrincipals/4b368df2-…/appRoleAssignedTo/<id>` |

`appRoleAssignmentRequired` na gateway je vrácený na původní `false`. `min-replicas` gateway nezměněno.

## 1. Hosté z EG.D jako Visitors „jen čtení“ (03-lab.md ř. 48–49, sondy/ai.md)

Hesla hostů nemáme. Použit testovací účet `tomas.prochazka` (licencovaný člen lab tenantu) přidaný do stejné skupiny jako hosté:
**App catalog Visitors** na `/sites/apps` (členové skupiny viz `prava-visitor/01-add-visitor.log`; ve skupině Members nikdo není).
Příkaz: `tools/overeni-visitor.sh tomas.prochazka <web> --file <sppkg>`.

| Tvrzení / test | Výsledek | Důkaz |
|---|---|---|
| Visitor přečte web, seznamy, knihovnu „Apps for SharePoint“ | ✅ HTTP 200 (EffectiveBasePermissions Low=138612833, jen čtecí bity) | `prava-visitor/02-visitor-apps-catalog-2026-11-22.tsv` |
| Visitor založí seznam | ✅ 403 „Access is denied“ (s platným digestem) | tamtéž |
| Visitor nahraje `.sppkg` do app catalogu (= nasadit nemůže) | ✅ 403 „Access denied“ | tamtéž |
| Členství ve Visitors katalogu **nedává** přístup na cizí web (`egd10-dev`) | ✅ 403 na čtení webu | `prava-visitor/03-visitor-cizi-web-2026-11-22.tsv` |
| Hosté (egd.cz, `#ext#`) se chovají stejně | ❓ účet hosta nemáme. Rozdíl možný u CDN/„Everyone except external users“ (zdroje/chocholous-net.md ř. 34). Ověřit: pozvat vlastního externího hosta s heslem, nebo se přihlásit pod `filip.smolik` na workshopu |
| Aby hosté vyvíjeli, potřebují roli na DEV webu (03-lab.md ř. 49) | ✅ logicky potvrzeno: Visitor katalogu = čtení, žádný zápis ani přístup na weby | viz výše |

## 2. Schválení API access (ai.md ř. 150, 222; riziko 8)

Zkušební žádost: vlastní `.sppkg` (klon `egd-ai-gateway`, `tools/overeni-sppkg-klon.sh`) žádá scope `Test.Read` od nového API `egd-overeni-api`.
Nástroj `tools/overeni-api-access.py list|approve|deny` posílá totéž CSOM volání, které dělá admin centrum (a `m365`).

| Tvrzení / test | Výsledek | Důkaz |
|---|---|---|
| `m365 spo serviceprincipal permissionrequest list` selhává | ✅ 403 „Insufficient privileges“. Příčina: m365 11.11 po CSOM volání volá ještě Graph (`servicePrincipals`, `oAuth2Permissiongrants`) a lab token CLI má jen `AllSites.FullControl User.Read` | `api-access/01-m365-cli-selhani-2026-11-22.log`; zdroj: `serviceprincipal-permissionrequest-list.js` |
| `permissionrequest approve` selhává | ✅ reprodukováno: `The service principal for permssion request … could not be found.` Chyba je **ze SharePointu (server)**, ne z CLI: totéž vrací přímé CSOM `Approve` | `api-access/07-…`, `08-csom-approve-bez-tagu-…` |
| Příčina: chybí tag `WindowsAzureActiveDirectoryIntegratedApp` na SP API | ❌ po přidání tagu (+60 s) stále stejná chyba | `api-access/09`, `10` |
| Příčina: špatný tvar `resource` (appId / displayName / objectId) | ❌ všechny tři tvary vedou na stejnou chybu | `api-access/08`, `12`, `15` |
| Funkční obejití: Graph `oauth2PermissionGrant` pro SPFx principál (`tools/ai-spfx-api-grant.sh`) | ✅ vytvoří grant `Test.Read` (consentType AllPrincipals) | `api-access/16-graph-grant-testovaci-api.log` |
| Schválení v UI SharePoint admin centra (Advanced → API access), 23. 11. 2026, **pod `pavel.admin@pavelchocholousgmail.onmicrosoft.com`** (identita ověřena: všech 20 výskytů v `api-access/ui-4/sitove-odpovedi.json`); skript `tools/overeni-ui-approve.mjs`; nová žádost o scope, který grant dosud neměl (`Test.Write`, balíček `egd-overeni-apiaccess-write`) | ✅ **funguje a drží**: Pending 5 → 4, Approved 61 → 62, **po reloadu stejně** (`ui-4/pocty.txt`, snímky `po-kliku-*.png`, `po-reloadu.png`). Graph grant `Test.Write Test.Read` pro SPFx principal (AllPrincipals) na SP `6cd0dea2…` potvrzen přes Graph. V síťovém záznamu klik odešle `…/PermissionRequests('…')/Deny` → 204 (UI tím odstraní žádost) a čte grant přes `graph …/oAuth2Permissiongrants`; tj. UI schválení = grant v Graphu, stejný mechanismus jako náš fallback `tools/ai-spfx-api-grant.sh`. **Oprava dřívějších měření:** `ui/` a `ui-3/` byly pořízeny pod hostem `pavel.chocholous_gmail.com#ext#` (profil `pavel.admin` byl přihlášený jako host), tam UI vrací 403 Access denied; to není měření účtu admina a závěr „UI nepersistuje“ neplatí. CLI/CSOM `approve` dál selhává (viz řádky výše), UI funguje. Příčina rozdílu CLI×UI ❓ (CLI token má jen `AllSites.FullControl User.Read`) |
| Příčina chyby SP lookupu | ❓ nevyřešeno; nejpravděpodobněji stav lab tenantu (nový tenant, SPO lookup SP). V E.ON může být jiná |

**Dopad:** v labu dnes funguje jen cesta přes Graph grant (potřebuje Global Admina v `az`). Pro E.ON platí: „Approve“ v admin centru zkusit hned první den; fallback je Graph grant nebo `New-MgOauth2PermissionGrant`.

## 3. Surové výstupy

| Soubor / sonda | Tvrzení | Výsledek |
|---|---|---|
| `ai/probe-2026-11-22.out` | whoami (UPN, scope `Gateway.Use`, `azp`), kvóta, chat 1,1 s, vision 2,7 s, OCR `prebuilt-read` 1,2–2,4 s a 0,0015 USD, bez tokenu 401 | ✅ |
| `ai/studeny-start-2026-11-22.txt` | studený start gateway ≈ 26 s | ✅ **30,1 s** pro první volání po nečinnosti (min-replicas 0), potom 6,6 s a 0,2–0,4 s. Číslo v textu zaokrouhlit na „kolem 30 s“ |
| `ai/apim-policy-test-2026-11-22.out` | APIM Consumption nezná `llm-token-limit`, `azure-openai-token-limit`, `rate-limit-by-key`, `quota-by-key`, `quota` | ✅ odmítnuto při uložení. Přijato: `rate-limit`, `validate-jwt`, `validate-azure-ad-token`, `*-emit-token-metric`, `llm-semantic-cache-lookup`, `authentication-managed-identity` (přijetí při uložení ≠ funkce za běhu ❓) |
| `data-prava/api-matrix-2026-11-22.jsonl` | cesta C: bez tokenu 401, lucie bez role 403, tomas/jakub zakládají 201 a vidí jen své, eva vidí vše, tomas mění stav 403, eva 200, eva zakládá/maže 403 | ✅ všechny řádky tabulky z data-prava.md ř. 144–152 sedí (mazání Spravcem neověřeno, nemažeme) |
| tamtéž | studený start API 7,8 s | ❌ **19,2 s** (`/healthz` po nečinnosti) |
| tamtéž | resume Azure SQL po auto-pauze „desítky sekund“ | ✅ **33,3 s** u prvního volání se SQL (`/api/me`), pak 0,16–0,35 s |
| `napojeni/job-executions-2026-11-22.json`, `job-logy-2026-11-22.txt` | Job doběhl, cron, 202 / 403 | ✅ ruční běh 18:16:22–18:16:59 (**37 s**), naplánovaný 18:20:00 (35 s), `sendMail jako egd-report: HTTP 202`, negativní test jako alice HTTP 403, 30 kurzů, CSV 1237 B. Cron je teď vrácen na `0 6 * * 1` |
| `napojeni/cors-curl-preflight-2026-11-22.txt` | ČNB `api.cnb.cz` preflight 403, OTE preflight 404, ARES `access-control-allow-origin: *` | ✅ |
| `napojeni/cors-probe-2026-11-22.json` | z prohlížeče s originem SharePointu: ARES, Open-Meteo, jsonplaceholder jdou i s `Authorization`; ČNB, OTE, ČHMÚ ne | ✅ |
| `napojeni/delegated-sendmail-2026-11-22.txt` | delegovaný `sendMail` jako uživatel | ✅ `POST /me/sendMail` 202, zpráva v schránce s odesílatelem eva.vesela. ❓ AADSTS65002 u klienta bez předautorizace nezkoušeno znovu. SPFx `sendMail` jsem neměřil, je změřený v `../ms-maily/README.md` ř. 18–26: bez schválení 403 `ErrorAccessDenied` (AADSTS65001/65002 nevznikly), po grantu a novém tokenu 202, příloha 30 MB 202, 40 MB 400 `ErrorMessageSizeExceeded` (limit „3 MB“ neplatí). Tamní reprodukce `m365 approve` stejnou chybou ze SharePointu potvrzuje oddíl 2 |
| `dokumenty/graph-pdf-2026-11-22.log`, `dokumenty/pdf/*.pdf` | Graph `?format=pdf` pro docx, xlsx, pptx | ✅ HTTP 200, 0,9–1,6 s, 1 / 2 / 3 stránky |
| `dokumenty/files-read-vs-readall-2026-11-22.log` | `Files.Read` samotné → 403, `Files.Read.All` OK | ✅ stejná položka: `Files.Read` 403 `accessDenied`, `Files.Read.All` 200 (221 765 B), `Files.ReadWrite.All` 200 |

## 4. `appRoleAssignmentRequired` u gateway (ai.md ř. 135)

Příkaz: `GW_FQDN=… GW_APP_ID=… tools/overeni-gateway-role.sh karolina.mala tomas.prochazka`. Výstup: `ai/appRoleAssignmentRequired-2026-11-22.log`.

| Stav | nepřiřazená `karolina.mala` | přiřazený `tomas.prochazka` |
|---|---|---|
| `required=false` | token vydán, gateway `/api/whoami` 200 | token vydán, 200 |
| `required=true` (čerstvé ROPC tokeny, bez cache) | ✅ **token se nevydá: `AADSTS50105`** (administrátor blokuje uživatele bez přiřazení) | token vydán, 200 |

Omezení volajících skupinou tedy funguje, ale **na straně Entra (odepření tokenu), ne jako 403 z gateway**. Text sondy upravit z „403“ na „AADSTS50105 při získání tokenu“. Přiřazení skupinou (ne jednotlivci) vyžaduje Entra P1 ❓ (v E5 je).

## 5. 502 po nasazení gateway

Příkaz: `tools/overeni-gateway-502.sh ca-egd-llm-gateway-t502` (nová kopie Container App se stejným image `egd-llm-gateway:v2` a čerstvou managed identitou; role a Easy Auth nastaveny těsně před voláním). Výstup: `ai/502-opakovani-2026-11-22.log`.

| Čas od zapnutí Easy Auth | `POST /api/chat` |
|---|---|
| +0 s (19:47:05) | **503** `upstream connect error … remote connection failure` (0,6 s) – to je ingress před startem repliky, ne chyba modelu |
| +30 s | 200 (9,7 s, studený start repliky + první volání modelu) |
| +60 / +120 / +240 s | 200 (0,8–1,0 s) |

Výsledek: ❌ **502 z modelu (`internal_server_error`) se nezopakovalo**. ✅ Naměřeno: první volání hned po nasazení vrátí 503 z ingressu (replika ještě není ready) a další už projde, i když role MI byly přiřazeny jen ≈ 1,5 min předtím. Hypotéza „propagace rolí MI“ tím není potvrzena ani vyvrácena (první volání, které se dostalo na model, prošlo). Doporučení pro workshop: po nasazení udělat rozehřívací volání a počítat s jedním 5xx; text sondy upravit z „502 – propagace rolí“ na „první volání 503/502, příčina neprokázána“. Kopie `ca-egd-llm-gateway-t502` zůstává (min 0 replik, ≈ 0 USD); smazání po Pavlově ano.

## Co jde Redaktorovi a Auditorovi

Seznam oprav textu je v souboru `PRO-REDAKTORA.md` v této složce.

- Měření vlastníka webu (egd01-test): viz `site-owner/README.md`, oddíl „Co zůstalo v labu“ (apps v site katalogu, seznam, stránka, dokumenty, požadavek `Test.Probe`).
