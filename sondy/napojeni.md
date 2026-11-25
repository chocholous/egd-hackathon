# Napojení: cizí zdroje, e-maily s přílohou, plánované úlohy

Požadavek Tomáše Galíka (EG.D) na SharePoint appky (SPFx): (1) integrace externích zdrojů (cizí API,
scraping), (2) e-maily s přílohami, (3) plánované úlohy (denní report: data z externího zdroje, analýza,
dokument, e-mail). Značky: ✅ změřeno v labu 2026-11-22 · 📘 dokumentace (v této session znovu nečtená) · ❓ neověřeno; 📘 a ❓ jsou jen mezistav ([../CLAUDE.md](../CLAUDE.md)), neověřené je v sekci „Neověřeno“ na konci. Surové výstupy doměřila role Ověřovatel sond 22. 11. 2026 ([overeni/README.md](overeni/README.md)): [cors-curl-preflight](overeni/napojeni/cors-curl-preflight-2026-11-22.txt), [cors-probe](overeni/napojeni/cors-probe-2026-11-22.json), [job-executions](overeni/napojeni/job-executions-2026-11-22.json), [job-logy](overeni/napojeni/job-logy-2026-11-22.txt), [delegated-sendmail](overeni/napojeni/delegated-sendmail-2026-11-22.txt); starší uložené: `napojeni/cors-vysledek.json`, `priloha-test.csv`, `napojeni/dukazy/`. Stále bez uloženého běhu (výsledek ✅ z opisu, běh ❓): stav OAuth připojení, `AADSTS65002`, běh flow.

## Souhrn: požadavek, varianty, ověřeno, doporučení

Varianty A (SPFx + Graph, bez Azure), B (Power Automate), C (Container App / Job); jejich srovnání a pro/proti je v části „Srovnání cest“ níž, doporučení až pod ní. Tabulka ukazuje, která varianta je pro daný požadavek v labu ověřená.

| Požadavek | Varianta s ověřeným výsledkem | Stav |
|---|---|---|
| Externí API s CORS (ARES, Open-Meteo) | A: `fetch` / `HttpClient` přímo ze SPFx | ✅ prohlížeč dostal data, i s hlavičkou `Authorization` (preflight prošel) |
| Externí API bez CORS (ČNB, OTE) a scraping webu | C: server (Container App / Job) nebo B: Power Automate; z prohlížeče to nejde | ✅ ČNB a OTE z prohlížeče zablokované; ✅ ČNB stažené z Jobu |
| E-mail s přílohou jménem přihlášeného uživatele | A: Graph `sendMail` z `MSGraphClient`, scope `Mail.Send` | ✅ delegované odeslání s přílohou (202, doručeno) přes vlastní app registraci (ROPC); ✅ cesta přes `webApiPermissionRequests` ze SPFx web partu změřena v [sondy/ms-maily/README.md](ms-maily/README.md): bez schválení 403 `ErrorAccessDenied`, po schválení (Graph grant) 202 a doručeno; schválení v UI admin centra ✅ pod Global Adminem ([ui-4](overeni/api-access/ui-4/)) |
| E-mail ze systémové schránky (report, ne od uživatele) | C: Graph s aplikační identitou + Exchange RBAC na jednu schránku | ✅ odeslání s přílohou, doručeno; ✅ odeslání z jiné schránky odmítnuto (403) |
| Plánovaná úloha (denní report) | C: Container Apps Job s cronem; B: Power Automate Recurrence | ✅ C: Job se podle cronu opravdu spustil, poslal mail (202) a ten dorazil ✅ ([executions](overeni/napojeni/job-executions-2026-11-22.json), [logy](overeni/napojeni/job-logy-2026-11-22.txt)); B: flow uloženo a spuštěno, **doběhlo `Failed` (`Unauthorized`)**, doběhne až po přihlášení konektorů člověkem; „B funguje“ je ❓ neověřeno |
| Plánování čistě v SharePointu | neexistuje | 📘 SPFx ani seznam nic časového nespouští; vždy je potřeba B nebo C |

Stručně: **A zvládne jen to, co dělá uživatel z prohlížeče v okamžiku, kdy je na stránce** (volat CORS API,
poslat mail jeho jménem). Cokoli bez uživatele (plán, noční report) nebo proti API bez CORS vyžaduje B nebo C.
Pro „bez Azure, bez per-user licencí“ je nejblíž B se standardními konektory, ale ten neumí akci HTTP bez Premium (✅ vestavěná akce HTTP: Power Automate odmítne flow zapnout s `403 MissingAdequateQuotaPolicy`, tedy licence, viz Sonda 4; ✅ „HTTP with Microsoft Entra ID“ je tier Premium z API).

## Sonda 1: CORS ze SPFx (prohlížeč)

Jak: `tools/napojeni-cors-probe.mjs`. Headless Chromium dostane stránku s originem
`https://pavelchocholousgmail.sharepoint.com` (odpověď stránky podstrčena přes `route.fulfill`, na tenant se nic nezapisuje) a z ní
volá `fetch`: jednou prostý GET, jednou s `Authorization` a `Content-Type: application/json` (to vyvolá preflight `OPTIONS`, stejně jako `HttpClient`/`AadHttpClient` v SPFx).
Surová data: `napojeni/cors-vysledek.json`.

| API | Prostý GET | S Authorization (preflight) | Proč (hlavičky a kód preflightu **nejsou v `cors-vysledek.json`**, ten má jen ok/err; ✅ doloženo [cors-curl-preflight](overeni/napojeni/cors-curl-preflight-2026-11-22.txt): ČNB `api.cnb.cz` preflight **403**, OTE **404**, ARES `access-control-allow-origin: *`; ČNB `denni_kurz.txt` vrací `Access-Control-Allow-Origin: apl.cnb.cz` (jen vlastní origin, pro SharePoint tedy neplatí); prohlížečové výsledky [cors-probe](overeni/napojeni/cors-probe-2026-11-22.json); starší `dukazy/curl-options.txt` nese jen ČNB a OTE) |
|---|---|---|---|
| ARES (`ares.gov.cz`, REST) | ✅ 200 | ✅ 200 | `access-control-allow-origin: *`, preflight povolí `authorization` |
| Open-Meteo | ✅ 200 | ✅ 200 | `access-control-allow-origin: *` |
| jsonplaceholder | ✅ 200 | ✅ 200 | CORS povolen |
| ČNB `api.cnb.cz` (kurzy) | ❌ Failed to fetch | ❌ | odpověď bez `Access-Control-Allow-Origin`, preflight vrací 403 (curl) |
| ČNB `denni_kurz.txt` | ❌ | ❌ | bez CORS hlaviček |
| OTE `ote-cr.cz` (HTML) | ❌ | ❌ | bez CORS hlaviček, preflight 404 |
| `example.com` | ❌ | ❌ | bez CORS |

Dopad: ze SPFx lze volat jen ta API, která si CORS pro cizí origin výslovně zapnou. Kdo ho nezapne (včetně českých veřejných zdrojů ČNB a OTE, které EG.D pravděpodobně
potřebuje), je z prohlížeče nedostupný a ne ten, kdo to „nepovolil v SharePointu“. Nejde to obejít nastavením v SPFx ani v tenantu.
`mode: 'no-cors'` vrátí neprůhlednou odpověď, tedy nepoužitelnou. Scraping HTML (OTE) je z prohlížeče ze stejného důvodu nemožný. Veřejné CORS proxy
nedoporučuji (data a případné tokeny jdou přes cizí server). Poznámka: CORS testuje origin SharePointu v prohlížeči; server-side volání (Job, flow) CORS vůbec neřeší.

## Sonda 2: Container Apps Job, report a e-mail přes Graph s managed identitou

Co běží: Job `job-egd-report` (rg `rg-egd-sonda-napojeni`, trigger Schedule/cron, 0,25 vCPU / 0,5 GiB, systémová managed identita, `replicaRetryLimit 0`).
Skript `tools/napojeni-report-job.py` stáhne ČNB kurzy (`api.cnb.cz`, ta, co z prohlížeče nešla), vyrobí CSV (30 měn, 1237 B) a pošle ho přes
`POST /users/{schránka}/sendMail` s přílohou. Token bere z identity endpointu Container Apps (`IDENTITY_ENDPOINT`), bez tajemství.

Omezení na jednu schránku (Exchange RBAC for Applications, vzor ppf-rooms `41_rbac.ps1`, skript `tools/napojeni-exo-rbac.ps1`):
sdílená schránka `egd-report@…` (bez licence), management scope `egd-sonda: odesilani egd-report`, role `Application Mail.Send` pouze na tento scope.
V Entra ID nemá identita žádné Graph oprávnění.

| Test | Výsledek |
|---|---|
| Ruční spuštění Jobu (`job start`) | ✅ Succeeded za 37 s (18:16:22–18:16:59), log: `sendMail jako egd-report@…: HTTP 202`; [executions](overeni/napojeni/job-executions-2026-11-22.json), [logy](overeni/napojeni/job-logy-2026-11-22.txt) |
| Doručení | ✅ Graph čtení schránky Tomáše Procházky: zpráva „Denní report kurzů ČNB 2026-11-20“, `hasAttachments`, příloha `kurzy-cnb-2026-11-20.csv` (1463 B s kódováním) |
| Odeslání z jiné schránky (alice) toutéž identitou | ✅ HTTP 403 `ErrorAccessDenied`, RBAC drží ([logy](overeni/napojeni/job-logy-2026-11-22.txt)) |
| Cron | ✅ cron nastaven na minutu +3, Job se spustil přesně v 18:20:00 UTC (běh 35 s, [executions](overeni/napojeni/job-executions-2026-11-22.json)), mail doručen; pak cron vrácen na `0 6 * * 1` (týdně, pondělí 06:00 UTC; čas cronu je UTC) |
| Test-ServicePrincipalAuthorization | ✅ `egd-report@…` InScope True (test pro další adresy v skriptu selhal na parsování čárky, nahrazen negativním testem v Jobu) |

Omezení labu (✅ změřena chyba): předplatné smí mít **jedno** prostředí Container Apps (`MaxNumberOfGlobalEnvironmentsInSubExceeded`),
„vlastní env“ proto nešlo. Job leží ve vlastní RG, ale používá existující prostředí `ca-ppf-rooms-env` (zadání to dovoluje, nic v něm se neměnilo).
Spuštěno z veřejného image (`mcr.microsoft.com/azurelinux/base/python:3.12`) se skriptem v env proměnné (base64); produkčně patří skript do image v registru. **Cena ACR:** sonda žádný vlastní ACR nepoužila (image je veřejný z MCR). 1,51 EUR v [../06-azure-inventar.md](../06-azure-inventar.md) ř. 48 je naměřený ✅ náklad **cizího ACR `acrppfroomsca3lbgs` (ppf-rooms) za posledních 30 dní**, tedy jen řádová opora, ne cena produkčního ACR pro EG.D; vlastní ACR sondy `acregdsondaai` stojí ≈ 0,17 USD/den (viz [ai.md](ai.md), 📘 odhad z ceníku, faktura neověřena ❓). ACR Basic je trvalý denní náklad.
Poznámka k `az`: `--args "-c …"` v CLI containerapp 1.3.0b6 vyhodil chybu parsování, nasazení proto jde přes `--yaml` (řeší `tools/napojeni-job-deploy.sh`).
Cena sondy: tři spuštění po desítkách sekund na 0,25 vCPU, v řádu haléřů (odhad, ❓ fakturou neověřeno); neběží nic trvale mimo prázdný Log Analytics workspace.

Co chybí k plné cestě C: SPFx → Container App přes `AadHttpClient` (vzor v ppf-rooms `docs/obo.md`, ✅ změřeno na AI gateway, viz [ai.md](ai.md) Sonda 3) pro „spusť report hned“, a docx místo CSV (knihovna v image). Pro tento Job nezkoušeno ❓ (v zadání sondy nebylo).

## Sonda 3: Graph `sendMail` s přílohou delegovaně (jako uživatel)

| Co | Výsledek |
|---|---|
| Scope | `Mail.Send` (delegovaný). Pro čtení výsledku v testu i `Mail.Read` (pro odeslání nepotřeba) |
| Souhlas | ✅ vlastní app registrace (veřejný klient) s `Mail.Send Mail.Read` + souhlas správce pro všechny uživatele (`tools/napojeni-delegated-app.sh`) |
| Odeslání | ✅ `POST /me/sendMail` jako Eva Veselá, příloha CSV, odpověď 202; doručeno, odesílatel i `from` = Eva (✅ čteno z Tomášovy schránky; [delegated-sendmail](overeni/napojeni/delegated-sendmail-2026-11-22.txt)) |
| Bez souhlasu | ✅ klient bez předautorizace (Azure CLI) dostane **`AADSTS65002`** (klient není předautorizovaný pro cílový API zdroj): token na `Mail.Send` nevznikne (❓ v doměření znovu nezkoušeno, běh neuložen). Pozor, **není to `AADSTS65001`** (chybí souhlas správce / uživatele), které dostala m365 CLI appka na Graph uživatele ([../03-lab.md](../03-lab.md) ř. 14); `skills/egd-maily/SKILL.md` ř. 32 oba kódy míchá |
| V SPFx | ✅ `webApiPermissionRequests` (`Microsoft Graph` / `Mail.Send`) + `MSGraphClient` ze SPFx web partu změřeno ([sondy/ms-maily/README.md](ms-maily/README.md)): **bez schválení 403 `ErrorAccessDenied`** (žádné AADSTS65001/65002, token vznikne bez `Mail.Send`); po schválení přes Graph `oauth2PermissionGrant` a vymazání tokenu z cache 202, doručeno. ✅ Schválení v UI SharePoint admin centra (API access) pod Global Adminem funguje a drží po reloadu ([ui-4](overeni/api-access/ui-4/); vzniká Graph grant), je to hlavní cesta (rozšíření už existujícího grantu, PATCH 204; ❓ první grant POST a ❓ zda stačí role SharePoint admin); `permissionrequest approve` v CLI selhává chybou SharePointu, Graph grant je fallback. Doporučení „bez Azure, jedno schválení“ je tedy ✅ až na krok schválení v UI |
| Za koho | vždy za přihlášeného uživatele; „jménem jiné schránky“ vyžaduje Send As/Send on Behalf a navíc scope `Mail.Send.Shared`; ❓ neměřeno |

Limity: ✅ příloha v jednom `sendMail` do 30 MB → 202 a doručeno, 40 MB → 400 `ErrorMessageSizeExceeded` ([ms-maily/limit-prilohy.log](ms-maily/limit-prilohy.log)); dřívější „do ~3 MB“ je vyvráceno; souhlas je tenantový, takže jednou schválený `Mail.Send` platí pro **všechny** SPFx appky v tenantu, které ho vyžádají. Mail se odesílá z prohlížeče uživatele: kdo appku ovládne (skript na stránce), může poslat mail jeho jménem.

## Sonda 4: Power Automate (standardní konektory)

Zařazení konektorů (✅ API prostředí, pole `tier`): Office 365 Outlook **Standard**, SharePoint **Standard**, Approvals **Standard**, Notifications **Standard**,
Office 365 Users **Standard**; HTTP with Microsoft Entra ID **Premium**, Azure Blob Storage **Premium**. Z katalogu prostředí: 171 Standard, 1224 Premium z 1395.
**Značení HTTP (sjednoceno s [../04-integrace-test-plan.md](../04-integrace-test-plan.md); důkaz `sondy/power-automate/vystupy/diag-409.txt`):** „HTTP with Microsoft Entra ID“ je Premium ✅ (tier z API prostředí). **Vestavěná akce HTTP je v tomto labu Premium ✅**: flow Button + akce HTTP se nedá zapnout, `403 MissingAdequateQuotaPolicy` („need a Power Automate Premium license … connection: Http“), zopakováno dvakrát (kroky D a F). Samostatný případ jsou flow, která se nezapnou s `409 CannotStartUnpublishedSolutionFlow` (Request trigger + Compose, Recurrence + HTTP ČNB): příčina je tam ❓ neznámá a **nepřičítá se HTTP akci ani licenci**. V ppf-rooms flow s HTTP pod E5 doběhlo (hypotéza ❓: tehdy výchozí prostředí nemělo Dataverse, viz [power-automate.md](power-automate.md)).
Vlastní konektor: 📘 Premium pro uživatele a vyžaduje prostředí; ❓ nezkoušeno (ověřit s Premium trialem).

Co proběhlo (`tools/napojeni-flow-deploy.py`): flow „EGD sonda: denní report“ (id `46ec4d7a-ad39-c64b-fcb3-39bb3be72825`, vlastník Tomáš Procházka):
Recurrence (denně 06:00 pražského času) → SharePoint `GetFileContentByPath` (soubor ze site `egd-sonda-napojeni`) → Outlook `SendEmailV2` s přílohou.

| Krok | Výsledek |
|---|---|
| Vytvoření pod uživatelem bez licence Power Automate (`az` jako host-správce) | ❌ `InvalidUserPlan`, `UserConsentMissing`: potřeba licencovaný účet |
| Vytvoření pod licencovaným lab uživatelem (E5) | ❌ napoprvé `missing prvReadconnectionreference`: **výchozí prostředí má od 12. 11. Dataverse, uživatel musí mít roli Environment Maker** (v ppf-rooms docs je ještě „bez Dataverse“, to už neplatí). Roli jsem Tomášovi přiřadil přes Dataverse API |
| Po přidělení role | ✅ flow uloženo (201), Started, oba konektory ve flow zařazeny Standard |
| Spuštění | ✅ Recurrence se spustila hned po vytvoření, běh `…CU07` skončil `Failed`: akce `Nacti_soubor` = `Unauthorized`, `Posli_email` přeskočena |
| Příčina | OAuth připojení SharePoint a Outlook se přes API založí, ale ve stavu `Error` (nepřihlášené); výpis stavu připojení neuložen. Přihlášení do konektoru jde podle pokusu jen interaktivně člověkem; zda existuje cesta bez člověka (např. service principal connection), neověřeno ❓ |
| Úklid | flow zastaveno (`Stopped`), aby se denně neopakoval chybný běh; neodstraněno |

**Co musí udělat Pavel** (pak flow doběhne, plně standardní, bez Premium):
1. https://make.powerautomate.com, prostředí Default Directory, přihlásit se jako `tomas.prochazka@pavelchocholousgmail.onmicrosoft.com` (heslo v `lab.secrets.json`).
2. Data → Připojení: u `egd-sonda-sharepointonline` a `egd-sonda-office365` kliknout Opravit připojení a přihlásit se.
3. Moje flow → „EGD sonda: denní report“ → Zapnout → Spustit (nebo počkat na 06:00).
4. Ověřit doručení: `python3 tools/napojeni-graph-delegated.py inbox tomas.prochazka --subject "Power Automate"` (s `EGD_CLIENT_ID`).

**Stav Sondy 4 pro kánon:** „B funguje“ je ❓ neověřeno, dokud člověk nepřihlásí konektory a flow nedoběhne `Succeeded`; po přihlášení zapsat výsledek ✅ a výstup uložit.

Pay-as-you-go (Power Platform billing account, jen čtení): ✅ v `copilot-credits-rg` je prostředek `Microsoft.PowerPlatform/accounts/4224fcb2-2317-4f50-84e2-3cf0cb181c86`
(Evropa, vytvořil `pavel.admin` 27. 10. 2026, bez tagů, bez vlastností o napojení). **Na jaké prostředí je navázaný, se mi nepodařilo přečíst**: BAP API `billingPolicies` vrací 404 a
`api.powerplatform.com/licensing` odmítne token hosta-správce (`AuthorizationInvalidIdentity`). Jediné prostředí v tenantu je výchozí `Default-972a674c-…` (✅ vypsáno přes BAP admin API;
Dataverse zřízen 12. 11., region Švýcarsko, `billingPolicy: null`, tedy žádné napojení viditelné ani tam). Závěr: ❓ napojení neověřeno; pokud existuje, může se týkat jen tohoto prostředí, ale to je jen úsudek.
Ověření: Power Platform admin center → Billing → Billing plans → plán → Environments. Pro EG.D 📘 (podmínky PAYG neověřeny ❓): PAYG podle dokumentace účtuje použití ve spojeném prostředí tak,
že tam nepotřebují licence pro jednotlivé uživatele; podmínky a ceny je potřeba ověřit v aktuálním ceníku Microsoftu (v session nečteno).

## Srovnání cest

| | A) SPFx + Graph, bez Azure | B) Power Automate | C) Container App / Job |
|---|---|---|---|
| Cizí API s CORS | ✅ funguje | ✅ (standardní konektor, HTTP je premium) | ✅ |
| Cizí API bez CORS (ČNB, OTE), scraping | ❌ z prohlížeče nejde (✅ ČNB, OTE změřeno) | ⚠ jen přes HTTP („HTTP with Entra ID“ Premium ✅ tier; vestavěné HTTP Premium ✅ 403 licence) nebo vlastní konektor (Premium 📘) | ✅ změřeno (ČNB) |
| E-mail s přílohou | ✅ jménem uživatele (`Mail.Send`, souhlas správce) | ✅ Outlook Standard, jménem majitele připojení | ✅ ze sdílené schránky, RBAC na jednu schránku (✅ i negativní test) |
| Plánování | ❌ neexistuje | ✅ Recurrence (Standard); ⚠ potřebuje člověka na přihlášení konektorů, licenci s Dataverse rolí | ✅ cron, změřeno |
| IT E.ON musí | schválit `Mail.Send` (tenantově; ❓ neověřeno ze SPFx) | licence Power Automate, role v prostředí (✅ Environment Maker u Dataverse prostředí), správa připojení; premium = per-user nebo PAYG (📘) | subscription, RBAC v Exchange, app registrace/identity, hosting; vlastní prostředí Container Apps (v labu smí být jedno na subscription, viz níž); náklad: ACR ✅ 1,51 EUR (viz výše), ostatní haléře, řádově jednotky USD/měsíc (odhad) |
| Provoz | kód ve SPFx balíčku | flow mimo repo, vázané na účet vlastníka (📘, v ppf-rooms ✅ pozorováno), verzování jen exportem | kód v gitu, deploy skriptem |
| Náročnost pro vibecodera s agentem | nízká (ale nic neplánuje) | střední: definice flow jde generovat agentem (✅ `napojeni-flow-deploy.py`), ale přihlášení konektorů dělá člověk v portálu | vyšší: Azure + Exchange RBAC; v labu hotovo skripty |

### Varianta „Job v EG.D“ (vlastní prostředí) a další alternativy (mezistav)

- **Job v EG.D:** sonda běžela ve sdíleném cizím prostředí `ca-ppf-rooms-env` (✅ chyba `MaxNumberOfGlobalEnvironmentsInSubExceeded`: v lab subscription smí být jedno prostředí). Pro E.ON to znamená: vlastní prostředí Container Apps (kvótu 1 prostředí na subscription ❓ ověřit u E.ON), subscription, RBAC v Exchange, hosting. Pro: kód v gitu, změřený RBAC na jednu schránku. Proti: potřebuje Azure a správce platformy. Pro citizen developera vysoká náročnost, v labu hotovo skripty.
- **Azure Function (timer trigger), Logic Apps Standard/Consumption:** neprověřeno ❓ (Function App s managed identity je v ppf-rooms ✅ jako API, viz [../04-integrace-test-plan.md](../04-integrace-test-plan.md), plánovaný trigger ale nezkoušen). Důvod: mimo zadání sondy. Návrh ověření: timer trigger Function se stejnou MI a stejným Exchange RBAC.

**Závislost na E5 trialu:** B (Power Automate s licencovaným uživatelem, Dataverse role) a delegované `Mail.Send` (A) v labu stojí na licencích, které končí **25. 11. 2026 v 04:04** (E5) a v 09:31 (Business Premium + Copilot). Po tomto čase je ukázka B a delegovaného mailu v labu ❓ nespolehlivá. Cesta C (Job + managed identity + sdílená schránka bez licence) na E5 nezávisí (schránka je bez licence, ❓ kromě případné závislosti Exchange Online plánu).

Doporučení pro workshop: ukázat A pro uživatelské akce (odeslat výběr z tabulky mailem, volat API s CORS), a pro „denní report“ nabídnout **B**, pokud EG.D drží licence Power Automate a smí konektory přihlásit,
jinak **C** s jedním malým Jobem a jednou omezenou schránkou (návrh; B je zatím ❓ neověřeno a A pro e-mail ze SPFx také). Kombinace „C jako zdroj dat/reportu a B jen jako plánovač“ vyžaduje HTTP (Premium ✅ licence), takže nedává smysl.

## Znovupoužitelné nástroje

| Nástroj | Co dělá | Příklad |
|---|---|---|
| `tools/napojeni-cors-probe.mjs` | změří CORS v headless Chromiu z originu SharePointu (simple GET + preflight s Authorization) | `CHROMIUM_PATH=… tools/napojeni-cors-probe.mjs --url https://api.example/x --json` |
| `tools/napojeni-report-job.py` | denní report: stáhne ČNB kurzy, CSV, pošle Graph `sendMail` s přílohou přes MI (jen stdlib; env `MAIL_SENDER`, `MAIL_TO`, `CNB_URL`) | `CNB_URL=… tools/napojeni-report-job.py --dry-run` |
| `tools/napojeni-job-deploy.sh` | nasadí/aktualizuje Container Apps Job se systémovou MI a skriptem (přes `--yaml`) | `AZ_SUB=… tools/napojeni-job-deploy.sh --rg … --name … --env <envId> --location … --sender … --to … --image … --cnb-url … --cron "0 6 * * 1" --trigger Schedule` |
| `tools/napojeni-exo-rbac.ps1` | Exchange RBAC for Applications: Mail.Send jen z jedné schránky (volitelně založí sdílenou), idempotentní | `EXO_TOKEN=$(az account get-access-token --resource https://outlook.office365.com --query accessToken -o tsv) pwsh tools/napojeni-exo-rbac.ps1 -Organization … -Mailbox … -AppId … -ObjectId … -Name … -CreateSharedMailbox` |
| `tools/napojeni-delegated-app.sh` | založí app registraci (veřejný klient) s delegovanými scopy a souhlasem správce; scope cizího API jako `appId/scope` | `tools/napojeni-delegated-app.sh --scopes "Mail.Send Mail.Read"` |
| `tools/napojeni-graph-delegated.py` | delegovaný Graph jako lab uživatel (ROPC): `token`, `send` s přílohou, `inbox` včetně příloh | `EGD_CLIENT_ID=… tools/napojeni-graph-delegated.py inbox tomas.prochazka --top 5` |
| `tools/napojeni-flow-deploy.py` | založí flow Recurrence → SharePoint → Outlook s přílohou (Standard); `--get` vypíše stav; `--as-user` pro licencovaného lab uživatele | `tools/napojeni-flow-deploy.py --as-user tomas.prochazka --client <appId> --site … --file … --to …` |

## Co jsem v labu vytvořil nebo změnil

Azure (sub lab, `rg-egd-sonda-napojeni`, tag `ucel=egd-workshop`):
- Container Apps Job `job-egd-report` (cron `0 6 * * 1`, systémová MI `21be75f6-a3a2-4253-87b6-8e3079f0fbda`) v prostředí `ca-ppf-rooms-env` (cizí, jen použité).
- Log Analytics workspace `workspace-rgegdsondanapojenioOTH` (vznikl jako vedlejší efekt prvního neúspěšného pokusu o vlastní env; nepoužitý, nic jsem nemazal).

Entra / Exchange / M365 (lab tenant):
- App registrace `egd-sonda napojeni (delegated)` (`f281d16f-b399-484f-956e-3b57419855ae`; `Mail.Send`, `Mail.Read`, souhlas správce) a `egd-sonda napojeni (flow)` (`28929f82-8763-4340-a2b8-6e6eeed15d32`; Flow a PowerApps scopy, souhlas správce).
- Sdílená schránka `egd-report@pavelchocholousgmail.onmicrosoft.com`, management scope `egd-sonda: odesilani egd-report`, service principal MI v Exchange, role assignment `Application Mail.Send`.
- Přidělena Dataverse role Environment Maker uživateli Tomáš Procházka ve výchozím prostředí (potřeba k vytvoření flow).
- SharePoint web `/sites/egd-sonda-napojeni` s `Shared Documents/priloha-test.csv`.
- Power Automate: 2 připojení (`egd-sonda-sharepointonline`, `egd-sonda-office365`, nepřihlášená) a flow `46ec4d7a-…` (Stopped).
- Maily v schránce Tomáše Procházky: 2 zprávy od `egd-report@` (ruční start, cron) a 1 od Evy Veselé; v Evině složce Odeslané 1 zpráva.

## Neověřeno (mezistav; důvod a návrh ověření)

| Tvrzení | Důvod | Návrh ověření |
|---|---|---|
| A: `Mail.Send` ze SPFx přes `webApiPermissionRequests` a `MSGraphClient` | ✅ ze SPFx změřeno ([ms-maily](ms-maily/README.md)): 403 bez schválení, 202 po schválení přes Graph grant; schválení v UI admin centra ✅ ([ui-4](overeni/api-access/ui-4/)) | v E.ON ⛔ schválí admin v UI (API access; změřeno ✅ jen pod Global Adminem, role SharePoint admin ❓), fallback Graph grant |
| CORS hlavička `*` u Open-Meteo | ARES, ČNB, OTE doloženy ✅ ([preflight](overeni/napojeni/cors-curl-preflight-2026-11-22.txt)); Open-Meteo jen z prohlížečového probe | `curl -i -X OPTIONS` s `Origin` pro Open-Meteo |
| Job: log kontejneru s HTTP 202/403 | ✅ doloženo ([job-logy](overeni/napojeni/job-logy-2026-11-22.txt), [executions](overeni/napojeni/job-executions-2026-11-22.json)) | nic, jen doručení mailu čtením schránky ✅ ([delegated-sendmail](overeni/napojeni/delegated-sendmail-2026-11-22.txt) pokrývá delegovaný mail, ne Job) |
| `AADSTS65002` u klienta bez předautorizace | `sendMail` jako Eva ✅ doložen ([log](overeni/napojeni/delegated-sendmail-2026-11-22.txt)); AADSTS65002 neměřeno znovu, výstup neuložen | zopakovat token přes Azure CLI na `Mail.Send` a uložit |
| PAYG podmínky, vlastní konektor Premium | jen 📘 | tier akcí z API; Premium trial (limit přílohy je ✅ změřen: 30 MB ano, 40 MB ne, viz Limity výše) |
| Flow v Power Automate doběhne | připojení nepřihlášená, OAuth jde jen člověkem; bez člověka (service principal connection) neověřeno | po přihlášení spustit flow, zapsat ✅ |
| Napojení PAYG billing účtu na prostředí | BAP API 404, token hosta odmítnut | Power Platform admin center → Billing plans → Environments |
| ⛔ Odchod vlastníka flow zastaví flow | jen tenant E.ON | ověřit v E.ON |
| Azure Function timer, Logic Apps | nezkoušeno | viz výše |
| Provoz po 25. 11. | trial E5 končí 25. 11. 2026 v 04:04 (Business Premium + Copilot v 09:31): delegované `Mail.Send` (varianta A), flow v Power Automate (B) i licencovaný uživatel s Dataverse rolí by před workshopem zanikly | změřit/ukázat vše před 25. 11. 04:04; viz [../06-azure-inventar.md](../06-azure-inventar.md) |
| Stav OAuth připojení Power Automate | výstup stavu neuložen | `pa-connection.py` výpis uložit |

Soubory: `sondy/napojeni.md`, `sondy/napojeni/cors-vysledek.json`, `sondy/napojeni/priloha-test.csv`, `tools/napojeni-*`.
Rozpočet: čerpáno odhadem v řádu haléřů z 10 USD (❓ nepotvrzeno Cost Management). Zdroje ppf-rooms (skripty, RG, env) nezměněny.
