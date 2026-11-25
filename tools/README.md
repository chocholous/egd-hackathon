# Nástroje pro agenty

Jeden řádek na nástroj: název, co dělá, příklad. Každý skript má `--help`.

| Nástroj | Co dělá | Příklad |
|---|---|---|
| `lab-m365.sh` | m365 v11 na sdílené přihlášení labu (`HOME=~/.m365-osobni`): odmítne jinou verzi a stopu CLI 12, ztracenou token cache obnoví ze zálohy, `--stav` bez sítě ✅ v labu (obnova, rozbitá cache, stopa v12) | `tools/lab-m365.sh --stav` |
| `lab-prihlaseni-stav.sh` | jen čtení: zdraví všech přihlášení labu (az, m365, relace Power Automate, každý profil prohlížeče přes klon); spusť dřív, než požádáš Pavla o login ✅ v labu (23. 11.: vše ✅, 14 profilů). Pozor: profil `pavel.admin` je ve skutečnosti host `pavel.chocholous_gmail.com#ext#`, admin je `pavel.admin-2` | `tools/lab-prihlaseni-stav.sh [--bez-profilu]` |
| `lab-vydej.py` | výdejní web appka účtů egd01–10 (SWA Free + Table Storage v `rg-egd-vydej`): založení, nasazení, stav rezervací, uvolnění, příkaz na smazání ✅ v labu (souběh, špatné heslo, anonymní okno, mobil), viz [08](../08-ucty-ucastniku.md) | `--help` |
| `stav.sh` | zapíše stav úkolu do živého přehledu prací | `tools/stav.sh sonda-ai bezi "Sonda AI" -p "zakládám model" -o sondy` |
| `azure-inventory.sh` | inventura Azure, náklady a expirace trialů (jen čtení; výstup markdown) | `tools/azure-inventory.sh --help` |
| `prehled-sync-plan.sh` | jen hlavní session: připraví zápis změn do přehledu s verzemi | `tools/prehled-sync-plan.sh sonda-ai` |
| `../skills/egd-pripravenost/scripts/pripravenost.mjs` | kontrola připravenosti účastníka (nástroje, síť, CLI, SharePoint, SPFx), zpráva pro ServiceNow | `node …/pripravenost.mjs --help` |
| `napojeni-cors-probe.mjs` | zjistí, která cizí API jdou volat přímo z prohlížeče s originem SharePointu (CORS) | `node tools/napojeni-cors-probe.mjs --help` |
| `copilot-graph-probe.mjs` | změří Graph Copilot API (Retrieval, Chat) s tokenem SPFx z přihlášeného profilu, bez hesla | `node tools/copilot-graph-probe.mjs --help` |
| `overeni-gateway-app.sh` | aplikační token (client credentials) pro LLM gateway a volání jejího endpointu bez uživatele (role Gateway.App) | `tools/overeni-gateway-app.sh --help` |
| `overeni-gateway-atomicita.sh` | N souběžných volání chatu na appku s malým limitem: změří, zda kvóta gateway drží | `tools/overeni-gateway-atomicita.sh --help` |
| `balicek-skillu.sh` | sestaví ZIP se skilly pro účastníky bez testů a důkazů, vypíše počet souborů, SHA-256 a souhrn odkazů, které v balíčku nevedou nikam | `tools/balicek-skillu.sh --help` |
| `balicek-kontrola-odkazu.py` | najde v rozbaleném balíčku skillů odkazy a cesty, které v něm neexistují | `python3 tools/balicek-kontrola-odkazu.py --help` |
| `overeni-vision-prohlizec.mjs` | pošle fotku do gateway z prohlížeče s originem SharePointu (vision, CORS, limit těla) | `node tools/overeni-vision-prohlizec.mjs --help` |
| `overeni-scrape-job.py` | scraping HTML tabulek (stdlib) v Container Apps Jobu; volitelná doplňková kořenová CA `SCRAPE_CA_PEM` | `tools/overeni-scrape-job.py --help` |
| `napojeni-report-job.py` + `napojeni-job-deploy.sh` | Container Apps Job: stáhne data, udělá CSV a pošle ho mailem přes Graph (managed identity) | viz [sondy/napojeni.md](../sondy/napojeni.md) |
| `napojeni-exo-rbac.ps1` | omezí aplikaci, aby posílala mail jen z jedné schránky (Exchange RBAC for Applications) | `pwsh tools/napojeni-exo-rbac.ps1 -?` |
| `napojeni-delegated-app.sh` + `napojeni-graph-delegated.py` | app registrace s delegovaným Mail.Send a odeslání jako uživatel | `--help` |
| `napojeni-flow-deploy.py` | založí Power Automate flow přes API (připojení pak musí přihlásit člověk) | `--help` |
| `dokumenty-graph-pdf.sh` | nahraje soubor do knihovny a vrátí PDF z Graphu (`?format=pdf`) | `--help` |
| `data-prava-token.py` | token pro lab uživatele (ROPC), na zkoušky práv pod různými účty | `--help` |
| `data-prava-sp.py` | sonda práv a limitů SharePoint seznamů (role, své/cizí položky, threshold 5000) | `--help` |
| `data-prava-entra-api.py` | Entra aplikace s app rolemi (Zadavatel/Schvalovatel/Spravce) pro vlastní API | `--help` |
| `data-prava-docker-push.sh` | lokální build a push image do ACR v labu | `--help` |
| `ai-gateway-deploy.sh` | postaví LLM gateway v Container App (přepsáno z ručního běhu, jako celek neběželo ❓) | `--help` |
| `ai-gateway-probe.sh` | volá gateway tokenem uživatele (whoami, kvota, chat, vision, ocr, image) a měří latenci | `--help` |
| `ai-spfx-deploy.sh` | `.sppkg` do katalogu, instalace na web, stránka s web partem | `--help` |
| `ai-spfx-api-grant.sh` | souhlas správce pro SPFx → vlastní API přes Graph | `--help` |
| `ai-spfx-klik.mjs` | otevře stránku s web partem pod lab profilem a klikne whoami/chat/OCR | `--help` |
| `lab-ucty-{zalozit,licence,weby,mfa,reset,vydej,uklid}.py` + `lab_ucty_lib.py` | účty egd01–10: založení, licence, 3 weby s katalogem, MFA výjimka, reset hesla, výdej, úklid po workshopu | `--help`, viz [08](../08-ucty-ucastniku.md) |
| `lab-github-org.sh` | GitHub Enterprise trial přes gh/GraphQL: check, create-org, invite, repo, copilot; výchozí je suchý běh, zápis jen s `--apply` | `tools/lab-github-org.sh --help` |
| `lab-github-entra.sh` | skupina `grp-egd-github` s účty egd01–10 v lab Entra pro SCIM do GitHub EMU; suchý běh, zápis jen s `--apply` | `tools/lab-github-entra.sh --help` |
| `lab-licence-prehod.py` | přehodí licence účtů na jiné SKU (výchozí je jen náhled); viz [07](../07-lab-trial-plan.md) | `--help` |
| `lab-mfa-registrace.ps1` | Pavel jako admin: vyjme skupinu účastníků z kampaně registrace Authenticatoru (`-Stav`, `-Vyjmout`, `-Vratit`); `-Stav` ✅; `-Vyjmout` ✅ (22. 11., Pavel; Entra → Registration campaign ukazuje Exclude 1 Group). Spouštět v terminálu, ne přes `!` (chce okno prohlížeče); ID Protection jen odkazem | `pwsh tools/lab-mfa-registrace.ps1 -Stav` |
| `lab-graph-prihlaseni.ps1` | Pavel jednou: Graph PowerShell se širokými scopes do cache (bez Policy.ReadWrite), `-Pridat` zvedne scopes. Přihlášení ✅ (22. 11., Pavel); tiché převzetí z cache v Bash nástroji agenta ❌ (timeout, chce okno) → agent zatím Graph přes `az rest` | `pwsh tools/lab-graph-prihlaseni.ps1` |
| `lab-host-kontrola.mjs` | jen čtení: ověří přístup uloženého profilu (např. hosta) na weby labu (`/` a `/sites/apps`) | `node tools/lab-host-kontrola.mjs <profil>` |
| `pa-browser-session.mjs` | Pavel se jednou ručně přihlásí (např. jako tomas.prochazka) do make.powerautomate.com, agent pak používá uloženou relaci; heslo agent nezadává | `node tools/pa-browser-session.mjs login --ucet tomas.prochazka` |
| `lab-ucty-ui-nasazeni.mjs` | projde pod účastníkem klikací nasazení `.sppkg` v UI app catalogu, uloží screenshoty a vypíše stav katalogu | `node tools/lab-ucty-ui-nasazeni.mjs egd05 <složka> <cesta.sppkg>` |
| `ai-gateway-chyby.sh` | vyvolá chybové stavy LLM gateway (401 bez tokenu, 401 cizí API, 403 neznámá appka …) bez její změny | `--help` |
| `ai-appka-klik.mjs` | odklikne AI web part pod lab profilem (soubor, popis, cizí origin) a uloží výstupy | `node tools/ai-appka-klik.mjs <profil> <url> <složka>` |
| `miniskilly-indexy.py` | měření indexů SharePoint seznamu nad limitem 5000 (setup, fill, status, query, index, max) | `--help` |
| `miniskilly-naplnit-seznam.py` | naplní seznam testovacími položkami (šablona pozadavky / spokojenost) v dávkách | `--web <url> --typ spokojenost --count 6000` |
| `lab-spo-stranka.mjs` | otevře stránku SharePointu pod lab profilem, provede kroky (click …), uloží screenshot nebo text | `node tools/lab-spo-stranka.mjs <profil> <url> click:Uložit --shot x.png` |
| `optimalizace-setup.py` | velký testovací seznam se sloupci a indexy, naplnění přes `$batch`, počet ([sondy/optimalizace-seznamu.md](../sondy/optimalizace-seznamu.md)) | `--help` |
| `optimalizace-rest.py` | sondy REST/CAML/RLDAS nad limitem 5000 (rest, caml, stranky, agregace, zmeny, zapis, velikost) | `--help` |
| `optimalizace-graph.py` | sondy Graphu nad seznamem (filtr, uplnost, stranky, delta, batch) | `--help` |
| `optimalizace-search.py` + `optimalizace-search-lag.py` | Search nad seznamem (dotazy, práva) a zpoždění indexace | `--help` |
| `optimalizace-slozky.py` | dotazy nad složkami vs. celým seznamem | `--help` |
| `optimalizace-sync.py` | inkrementální cache přes `GetChanges` (vzor pro SPFx) | `--help` |
| `optimalizace-soucty.py` | souběh čítače (naivně vs. ETag) | `--help` |
| `optimalizace-entra-graph.py` + `optimalizace_lib.py` | Entra aplikace pro Graph sondy; společná knihovna (tokeny, retry 429/401) | `--help` |
| `lab-ucty-overeni.mjs` | ověří přihlášení účastníka, zápis do vlastních webů a 403 u cizích | `--help` |
| `pozadavek.sh` | zapíše stav Tomášova požadavku (reálné / ověřeno / miniskill) do přehledu | `tools/pozadavek.sh 3 -s ano -k skills/egd-dokumenty` |
| `cil.sh` | jen hlavní session: stav cíle workshopu do přehledu | `--help` |
| `dokumenty-spo-klik.mjs` | odklikne tlačítka web partu v prohlížeči pod lab uživatelem | `--help` |
| `spo-webpart-konzole.mjs` | otevře stránku s web partem pod lab profilem, kliká a čte konzoli; `--pred JS` spustí výraz před kliky, po každém kliku vypíše `#log` (ms-dokumenty) | `--help` |
| `spo-web-pasmo.sh` | přečte nebo nastaví časové pásmo SharePoint webu (CLI v11 to neumí, CSOM přes `m365 request`); bez `--ano` jen čte (katalog-funkci) | `--help` |
| `pa-flow.py` + `pa-run-vystupy.py` | Power Automate flow přes API; `pa-run-vystupy.py FLOW RUN [--json f]` u každé akce běhu vypíše stav, HTTP kód, počet položek z Get items a rozpad podle Stavu ✅ v labu (ms-maily) | `--help` |
| `maily-spo-klik.mjs` | klikne tlačítko web partu (`--tlacitko "<text>"`, volitelně `--nejdriv "<text>"`) a zachytí odpověď Graph `sendMail` ✅ v labu (ms-maily) | `--help` |
| `lab-zaloha.py` | jen čtení: záloha lab tenantu do JSON (Entra účty, skupiny, aplikace, CA; SharePoint weby, seznamy s položkami, práva; flow); mimo repo `~/egd-lab-zaloha/<čas>/` ✅ v labu 24. 11. (65 účtů, 56 webů, 52 088 položek; politiky ověření 403, viz README zálohy) | `python3 tools/lab-zaloha.py --help` |
| `apfs-dedupe.py` | APFS dedupe: duplikáty podle fdupes nahradí `cp -c` klonem (nic nemaže), přeskočí už sloučené (clone ID); `--dry-run` nanečisto; spouštět až po `afsctool -c` ✅ v labu (egd-workshop, dedupe 321 476 souborů, rc=0) | `--help` |
| `verejne-repo.sh` | veřejná kopie repa bez historie, `zdroje/`, písem E.ON a výpisu hostů, se stránkou `verejne/index.html` jako GitHub Pages; bez `--ano` jen složí a ukáže změny | `--help` |
