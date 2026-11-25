# Pro roli Ověřovatel sond (od Redaktora podkladů, 1. kolo, 22. 11. 2026)

Fakta, která Redaktor nemá doložená a neodhaduje. Měřit je má role Ověřovatel sond. Každý bod: tvrzení, kde, jak ověřit.
Skupiny: A = 04 a 10, B = sondy (ai, data-prava, dokumenty, napojeni), C = 03 a 06, D = 00/01/02/05.

## A. `04-integrace-test-plan.md`, `10-container-app.md`

| # | Tvrzení | Kde | Jak ověřit |
|---|---|---|---|
| A1 | Proč v ppf-rooms HTTP pod E5 doběhlo, když v egd labu je blokované licencí (403 `MissingAdequateQuotaPolicy`) | 04 ř. 25, 10 „Neověřeno“ | porovnat licence a prostředí obou labů; trial PA Premium pro lab uživatele, `tools/pa-flow.py start` |
| A2 | Průchod schválením `webApiPermissionRequests` v SharePoint admin centru a kdo schvaluje (Global Admin vs SharePoint admin) | 04 ř. 40–45, 10 ř. ~118 | v labu projít API access pro jeden balíček pod oběma rolemi |
| A3 | Fronta `queue-llm` (seznam jako fronta) nikdy neběžela | 10 ř. ~102 | Pavel přihlásí SharePoint připojení, uložit flow, zapsat položku |
| A4 | PA běhy čekají na přihlášení připojení (sdílená schránka, práva, PDF, Recurrence→SP→Outlook) | 04 ř. ~112, 10 ř. 87–92 | po přihlášení stop+start flow |
| A5 | `AadHttpClient` ze SPFx pro DB API; OBO na Container App v egd labu | 04 ř. ~129 | nasadit web part nad `ca-egd-data-api` |
| A6 | Denní Job: AI shrnutí a docx (dnes jen CSV); `Gateway.App` client credentials | 04 ř. ~105 | rozšířit image Jobu |
| A7 | `ppf-citizen-ai-devkit` v egd labu pod rolí Člen a na Windows | 04 ř. ~106 | nasazení přes kit |
| A8 | Deploy bez PSGallery a bez admina | 04 ř. 14 | lokální npm instalace CLI pod ne-adminem |
| A9 | Custom Script false v egd labu (důkaz je z PPF tenantu) | 04 ř. 13 | zopakovat v labu |
| A10 | ACR ≈ 0,17 USD/den je z ceníku, ne z faktury | 10 ř. ~120 | Cost Management po zpoždění |
| A11 | Cosmos, Postgres, Dataverse, LibreOffice v kontejneru, ACL backend, PPTX/XLSX šablony, OCR/vision přes Foundry konektor | 10 ř. 56–82 | podle „Neověřeno“ v sondách |
| A12 | `min-replicas 1` ≈ 8 USD/měs. je výpočet | 04 ř. ~94, 10 ř. 25 | změřit po zapnutí (jen s Pavlovým ano) |

## B. Sondy (ai, data-prava, dokumenty, napojeni)

**Chybí uložený surový výstup (doplnit a odkázat):**
- ai: výstupy `tools/ai-gateway-probe.sh`, Log Analytics dotaz, 401/403/429/502, výsledek `apim-policy-test.sh` → `sondy/ai/dukazy/`.
- data-prava ř. 131–154: log cesty C (např. `api-matrix.jsonl`), studený start 7,8 s.
- dokumenty ř. 54–58: log HTTP volání; 403 u `Files.Read` (`tools/dokumenty-graph-pdf.sh` s `-filesread`); `npm audit`.
- napojeni ř. 31–36, 56–60, 76–77, 99: `curl -i -X OPTIONS` preflight, `az containerapp job execution list` + logy, výstup `napojeni-graph-delegated.py`, stav připojení.

**Neověřeno:**
- ai: (UI approve API access ✅ změřeno pod `pavel.admin`, `ui-4`; zbývá ❓: příčina rozdílu CLI × UI, první grant pro API bez grantu (POST), zda stačí role SharePoint admin; `ui/` a `ui-3/` neplatné, host `#ext#`); `Gateway.App` client credentials; `appRoleAssignmentRequired` s novým tokenem; příčina 502 po čistém nasazení; (b) a (c) identifikace appky; APIM v2 ceny (zřídit a smazat jen s výslovným ano); runtime `llm-emit-token-metric`.
- data-prava: ř. 75 zadavatel rozbil dědičnost v `ZadostiACL` (200); ř. 74 `extras2.jsonl` ř. 28 vrací 404; ř. 71 příloha v prohlížeči s cookie; ř. 96 index na naplněný seznam; vzor „list rozhodnutí + otisk“; `SPHttpClient`/PnPjs; resume SQL po auto-pauze; `AadHttpClient` proti tomuto API; varianta D (PA ACL) po přihlášení konektoru; zda E5 pokrývá Dataverse prostředí (datum 15. 11. 2026 z Learn); Dataverse ve výchozím prostředí (od 12. 11. podle napojeni.md).
- dokumenty: kdo schvaluje `Files.Read.All`; limit 2 MB pro xlsx a pptx; PPTX šablona v docxtemplater; LibreOffice + fonty v kontejneru; `npm view <balík> time`; přesná chyba `WinAnsi cannot encode "ř"` (v `src/` nenalezena); běh flow `6492f614-…`; host z EG.D.
- napojeni: (`Mail.Send` ze SPFx a příloha nad 3 MB už změřeno v sondy/ms-maily – zbývá jen schválení v UI); vlastní konektor Premium; PAYG podmínky; cesta bez člověka pro OAuth připojení; Azure Function timer a Logic Apps; odchod vlastníka flow (⛔ jen E.ON).

## C. `03-lab.md`, `06-azure-inventar.md`
Syrový výstup inventury 22. 11.: [inventura-azure-2026-11-22.md](inventura-azure-2026-11-22.md) (`tools/azure-inventory.sh --no-other-tenant`).
1. `freetier`: API vrací `promotions[].endDateTime` = 2027-11-27 (✅ výstup API), rozdíl proti 12 měsícům od koupě 2026-10-27 nevysvětlen – ověřit v portálu (Free services) nebo billing API (06 ř. 17).
2. Postgres `pg-mcplab-0c83e1` účtován 0 € – Cost Management po zdrojích, `az postgres flexible-server show`, faktura po upgradu (06 ř. 48).
3. Náklady zdrojů v `rg-egd-sonda-ai`, `rg-egd-sonda-data-prava`, `rg-egd-sonda-napojeni` jsou 0 € jen proto, že vznikly dnes – znovu inventura za 1–2 dny.
4. Účel `Microsoft.PowerPlatform/accounts` a PAYG pro premium konektory – Power Platform admin centrum (BAP endpointy 404) (03 ř. 13, 06 ř. 20).
5. Chování po konci trialu (Disabled, SharePoint read-only, doba držení dat v Azure) – nejde před 25./26. 11., po nich změřit (06 ř. 13–16, 07 ř. 18–22).
6. Druhý tenant `M365x04523031` (SharePoint, licence, LabAdmin2 GA) – Pavel se přihlásí a spustí `tools/azure-inventory.sh --other-tenant`.
7. `m365-cli-spfx-lab` bez Graph práv, AADSTS65001 – spustit a uložit výstup chyby (03 ř. 14).
8. Hosté EG.D a skupina „App catalog Visitors“ – výpis členství a pokus o nasazení pod hostem/testovacím účtem (03 ř. 48–60).
9. Weby v 03 – `m365 spo site list` / HTTP 200, existence `noscripttest` a `sitecatalogtest`, záložní zdrojáky Pacman/Guide/ArcadeHome (`~/Projects/ppf-arcade`, GitHub) (03 ř. 22–31).
10. Počty v 07 ř. 34 (14 webů, 55 účtů, 8 hostů) – chybí uložený výstup.

## D. `00`, `01`, `02`, `05`
(doplní se po reportu skupiny D)

## Rozpory mimo vlastnictví Redaktora (předáno hlavní session)
1. `sondy/ai/gateway/server.mjs:146` komentář „role Gateway.Use“ × doc/deploy `Gateway.App` (kód needitován).
2. `~/Projects/egd-vibecoding/README.md:92`, `docs/pasti.md`, `docs/historie.md`: „ManageLists jediná možnost“ × lab `CancelCheckout`.
3. `skills/egd-maily/SKILL.md:32` míchá `AADSTS65001` a `65002`.
4. `skills/egd-dokumenty/SKILL.md:153`: „SharePoint admin“ × sondy „Global Admin nebo SharePoint admin ❓“.
5. `skills/egd-prava-role` nedává schvalovateli `ApproveItems`, šablona `egd-prvni-appka` ho testuje (riziko č. 4 auditu).

## Doplněno po 2. kolu auditu
- „PA OBO neumí“ (10 ř. 93, Neověřeno): pokus s konektory Users/SharePoint a HTTP s Entra ID pod Premium trialem.
- 01 ř. 74: „3 weby v E.ON zařídila Adriána, licence E.ON Copilot a GHE si zařídili sami“ – zdroj Pavlův komentář v přehledovém artefaktu z 22. 11.; v labu neověřitelné (jen E.ON). Ověření: účastník v pondělí spustí prereq skill `egd-pripravenost`, který zkontroluje přihlášení do GHE a Copilota.

## D. Skupina 00, 01, 02, 05 – ❓ k ověření
1. Běh našich skillů v Copilot CLI (`TEST-copilot.md` chybí) – dokončit session test-copilot (`tools/copilot-run.sh`). Platí pro 00, 01 „Volba nástroje“, 02, 05 bod 3.
2. „Copilot je pomalejší než Claude“ (01) – stejný skill v obou, změřit čas.
3. `/plugin install` z katalogu a verze v ZIPu ze `build-plugin.mjs --zip` (zdrojový `plugin.json` 0.7.0, katalog 0.8.0) – sestavit ZIP, přečíst `plugin.json`, instalace v izolovaném `HOME` (02, 05 bod 15).
4. EG.D nemá přístup do PPF GHE (odvozeno z INTERNAL) – zkusit pod účtem mimo PPF GHE (02, 05 bod 4).
5. Instalace ZIPu/skillů do Claude i Copilota mimo PPF, všechny varianty distribuce (02).
6. SPFx 1.18.2 + gulp + Node 18 v labu neměřeno; scaffold 1.24 s gulpem; migrace gulp → Heft (02).
7. `spo app add/deploy/install` pod CLI 12 × CLI 11 (`spfx-ship`) (02, 05 bod 14).
8. `m365-cli-safe`: npm bez PSGallery a bez admina v egd labu (02).
9. `project_config.json` devkitu pro lab tenant – `devkit init` (02, 05 bod 9).
10. Role Člen a Čtenář pod účastníkem – `nasadit --ano` pod `egd01` (00).
11. Hosté z EG.D: Visitors jen čtení, Member na DEV webu, `m365 login` hosta – zkušební host `chocholous@ppf.cz` (00, 05 bod 2).
12. Přehození SKU licencí nezkoušeno; „Extend trial“ (05 bod 0, viz 07).
13. ID Protection / registrace Authenticatoru – `tools/lab-mfa-registrace.ps1 -Stav`, pak 6× `tools/lab-ucty-overeni.mjs` (05 bod 6).
14. Odpověď Adriáně neodeslána (podle mailů) – PPF Outlook Odeslané a Teams, zapsat prohledané složky (05 bod 5).
15. Domácí úkol: zda ho Adriána dostala (05 bod 1).
16. Kolize 25. 11.: onboarding T. Otruby 15:30–17:00 (zdroj „PPF KB“) – kalendář PPF (jen čtení) (05 bod 21).
17. `skills-download.zip`: čísla (117 skills…) a zda obsahuje eon-ui-design-system, eon-security, eo-compliance-standards – otevřít přílohu z mailu Adriány 10. 11. (02, 05 bod 13).
18. Počet položek „v EG.D nevíme“ a artefakty `MA6m5Qwvot9W6t5QRDwoCk`, `VHtLC7LZcgXvAEtNQAz9AU` – Artifact read (00, 02).
19. ⛔ Stav licencí Copilot a webů DEV/TEST/PROD v E.ON; dotaz na Adrianu do 24. 11. (01, 05 bod 3).
20. Windows a PowerShell 5.1, portable Node 22 bez admina – Windows VM (00, 02, 05 bod 7).
21. Dema statistiky a podněty: nasazení v labu pod `egd02`/`egd03` (00).
22. Surové výstupy sond a testů nejsou uložené (obecně).
23. Kód skillů `egd-llm-gateway`, `egd-data-seznamy`, `egd-maily` e2e nikdy neběžel; `egd-prava-role` nedává schvalovateli `ApproveItems` (00, 02).

## 2. kolo – 02-skills-a-kit.md
- Instalace CLI for M365 z npm do projektu bez PSGallery a bez admin práv (`m365-cli-safe`, 02 ř. 38): v egd labu nezkoušeno, jen CLI 11.11.0 jako Global Admin. Změřit: čistý `HOME`, bez admina, `npm i` do projektu, `m365 --version`, výstup uložit.
- `project_config.json` / `devkit init` proti labu (viz D9): v labu se nespustil, změřit.

## 2. kolo – sondy/data-prava.md
- Zadavatel rozbije dědičnost v `ZadostiACL` na položce s přímým grantem (200) × v `Zadosti` 403: zopakovat matici s různými grantovými úrovněmi a vysvětlit, kdy zadavatel smí rozbít dědičnost (ř. 16, 78, 81). Do vysvětlení neplatí „zadavatel nemůže rozdávat práva“.
- Ostatní částečné/nové body 2. kola – viz `audit/overeni.md`, sekce 2. kolo (doměřit podle „co udělat“ u každého).

## 2. kolo – 03, 06
1. Členství hostů v SharePoint skupině „App catalog Visitors“ (Graph skupinu nevypíše): `/_api/web/sitegroups` nebo `m365 spo`.
2. Přijetí pozvánky ≠ přístup: pod hostem (galik, smolik, ppf.cz) otevřít `/sites/apps` a zkusit nasazení.
3. Global Admin pro `pavel.admin` a vlastnictví Azure pro `pavel.chocholous@gmail.com`: `az role assignment list`, Graph `directoryRoles`.
4. `/sites/arcade` a soubor důkazu pro OBO ppf-rooms (03, tabulka Azure).
5. Vejdou se MCP webapp na B1 (07 říká ne, 📘): metriky paměti.
6. Zbylé z 1. kola: `m365 spo site list`, zdrojáky arcade na GitHubu, `tools/overeni-visitor.sh` bez logu.
Uložené výstupy: `audit/hoste-externalUserState-2026-11-22.json`, `audit/entra-skupiny-2026-11-22.json`.

## 2. kolo – 00, 01, 02, 05
24. Custom Script není potřeba i v egd labu (měřeno jen v PPF): `.sppkg` s `requiresCustomScript:false` na `/sites/noscripttest` (00 ř. 16, 05 bod 5).
25. `spfx-performance` a `sharepoint-tenant-recon`: je měření v `~/.claude/skills/spfx-ship/references/verified.md`? (02 ř. 36, 40).
26. Příčina 409 u Request triggeru a Recurrence+HTTP: po přihlášení připojení znovu zapnout (`tools/pa-flow.py start`), porovnat s Button+HTTP (403).
27. SQL a Dataverse přes PA (Premium jen tier z API): pokus o zapnutí, očekává se 403 (00 ř. 27).
28. „Noty“ k domácímu úkolu, mail 12./18. 11. a Pavlova poznámka 17. 11. – PPF Outlook a Teams (05 bod 1).
29. Odpověď Adriáně: prohledat Odeslané a Koncepty, zapsat složky a dotazy (05 bod 5).
30. `ppf-arcade/odpoved-adriane.md` ř. ~83 (Deny=2) porovnat s `/sites/noscripttest` (00).

## 2. kolo – 04, 10
31. Ve kterém tenantu proběhla měření v ppf-rooms (OBO, PA) a ppf-arcade (Custom Script): README ppf-rooms tenant nejmenuje, účty alice/bob jsou i v egd labu. Zopakovat v egd labu před koncem E5.
32. Request trigger: tier (v `katalog-konektoru-tier.txt` není, v dokumentech 📘 Premium) a příčina 409: po trialu Premium `pa-flow.py start` na `diag Request Http trigger + Compose`.
33. Logy ✅ (gateway, Job, DB API): nový běh s uložením (`tools/ai-gateway-chyby.sh`).
34. Document Intelligence přes PA ❓ (OCR přes Foundry konektor je ✅, CU25).
35. ACR cena z faktury (zatím 📘 ≈ 0,17 USD/den).

## 2. kolo – sondy (ai, data-prava, dokumenty, napojeni, _zadani)
1. `sondy/ai/dukazy/` (neexistuje): spustit `ai-gateway-probe.sh`, `ai-gateway-chyby.sh`, `apim-policy-test.sh`, uložit výstupy.
2. `sondy/data-prava/`: znovu matice cesty C s logem; probuzení SQL `egddata` (Paused) a index na `Velky` (mutace/náklad – jen s vědomím Pavla).
3. data-prava: doložit „200 položek za 15,6 s“ a `Castka ge 0 → 500` (v `bulk.jsonl`/`threshold.jsonl` nejsou).
4. `sondy/napojeni/dukazy/`: CORS preflight ARES a Open-Meteo, log kontejneru Jobu (202/403), výstup `napojeni-graph-delegated.py inbox`. Už uloženo: `job-execution-list.json`, `curl-options.txt`.
5. `sondy/dokumenty/dukazy/`: 403 u `Files.Read` (`tools/dokumenty-graph-pdf.sh` s appkou `-filesread`), log web partu, HTTP kódy Graph PDF. Už uloženo: `npm-audit.txt`, `npm-view-time.txt`.
6. Vše, co stojí na licencích, změřit před 25. 11. 04:04.
7. Sdílená schránka bez licence vs. Exchange Online plán E5 (cesta C v napojeni).

## Stav po doměření Ověřovatele (22. 11.)
Texty v 03 a sondách zapracovány podle `sondy/overeni/PRO-REDAKTORA.md`. Zbývá ❓: příčina, proč CLI `approve` selhává a UI funguje (UI approve ✅, `ui-4`; rozšíření grantu pod Global Adminem, ❓ první grant POST, ❓ zda stačí SharePoint admin), hosté EG.D `#ext#` pod vlastním účtem, příčina 502 po nasazení, příčina 409 u Request triggeru.
