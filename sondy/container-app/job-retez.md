# Container Apps Job „řetěz“: ČNB → LLM → docx → PDF → e-mail

Sonda `ca-job-retez` (24. 11. 2026, session ca-libreoffice), odpověď na bod **7.2** v [prehled/galik-otazky.md](../../prehled/galik-otazky.md)
(„report z externího zdroje se 1× denně načte, provede se analýza, zpracuje se dokument a pošle emailem“). Nadřazené:
[10-container-app.md](../../10-container-app.md). Kód a důkazy: [job-retez/](job-retez/). Značky: ✅ změřeno · 📘 dokumentace · ❓ neověřeno.

## Výsledek

✅ **Celý řetěz prošel v jednom běhu Jobu** (`job-egd-retez-96aennt`, 02:10:44–02:11:51 UTC, `Succeeded`,
[beh-1.log](job-retez/dukazy/beh-1.log)) a mail dorazil do schránky Tomáše Procházky s PDF i docx v příloze
([doruceni-1.txt](job-retez/dukazy/doruceni-1.txt), stažené přílohy `doruceno-*` a text PDF [doruceno-report.txt](job-retez/dukazy/doruceno-report.txt)).

| Krok | Jak | Výsledek běhu 1 |
|---|---|---|
| 1. Externí zdroj | `GET api.cnb.cz/cnbapi/exrates/daily?lang=CZ` (z prohlížeče nejde kvůli CORS, viz [napojeni.md](../napojeni.md)) | ✅ 200, 30 měn, den 2026-11-23, 233 ms |
| 2. Analýza | LLM gateway `ca-egd-llm-gateway` `/api/chat`, token managed identity s **aplikační rolí `Gateway.App`** | ✅ 200, `gpt-4.1-mini`, 483 tokenů, 0,00042 USD, 3,2 s v gateway; celý krok 33 s (studený start gateway) |
| 3. Dokument | docx v Jobu (knihovna `docx` 9.16.0): nadpis, shrnutí, tabulka kurzů | ✅ 11 009 B |
| 4. PDF | `ca-egd-dokumenty` `/api/pdf` (LibreOffice, [libreoffice.md](libreoffice.md)), token MI s **aplikační rolí `Dokumenty.App`** | ✅ 200, 29 806 B, převod 1,17 s, `%PDF-` |
| 5. E-mail | Graph `POST /users/egd-report@…/sendMail` s přílohami, token MI; Exchange RBAC for Applications pustí jen schránku `egd-report@` | ✅ 202; doručeno 02:11:49, přílohy `report-cnb-2026-11-23.pdf` + `.docx` |

Tokeny v logu (jen claimy, ne token): `aud` = appId gateway / PDF API, `roles` = `["Gateway.App"]` / `["Dokumenty.App"]`, `oid` = MI.
Tím je ✅ ověřená i do té doby neotestovaná větev gateway „aplikační volající přes `Gateway.App`“ ([ai.md](../ai.md), „Neověřeno“).

✅ Druhý běh se **studenými** závislostmi (gateway i PDF API na 0 replikách) prošel taky: 100 s, mail doručen (viz „Výkon“).
PDF API 0.3 dál přijímá uživatelský token ze SPFx cesty (✅ [azure-0.3.jsonl](libreoffice/dukazy/azure-0.3.jsonl)).

## Architektura

```
Container Apps Job job-egd-retez (Manual; cron volitelně)   user-assigned MI id-job-egd-retez (bez tajemství)
  ├─ GET api.cnb.cz ─────────────────────────────────▶ ČNB (veřejné, bez CORS)
  ├─ token api://<gateway> (role Gateway.App) ───────▶ ca-egd-llm-gateway → Azure OpenAI (MI gateway)
  ├─ docx v procesu (npm docx)
  ├─ token api://<pdf-api> (role Dokumenty.App) ─────▶ ca-egd-dokumenty (LibreOffice) → PDF
  └─ token graph (Exchange RBAC: Mail.Send jen egd-report@) ─▶ Graph sendMail s přílohami
```

Jedna identita, tři různá oprávnění, každé na jednom místě: app role v Entra (gateway, PDF) a Exchange RBAC (jedna schránka).
V Entra nemá MI žádné Graph oprávnění (`Mail.Send` pro celý tenant nedostala).

## Postup (ověřený v labu)

Skript [tools/job-retez-deploy.sh](../../tools/job-retez-deploy.sh) (`--help`), kód Jobu [job-retez/job/job.mjs](job-retez/job/job.mjs) + [Dockerfile](job-retez/job/Dockerfile):

```bash
tools/job-retez-deploy.sh identita   # RG rg-egd-job-retez, MI, AcrPull, app role Gateway.App + Dokumenty.App, Exchange RBAC (pwsh)
tools/job-retez-deploy.sh push       # image do ACR (lokální docker buildx; ACR Tasks v labu zakázané)
tools/job-retez-deploy.sh job        # Job, trigger Manual; --cron "0 6 * * *" = denně 06:00 UTC
tools/job-retez-deploy.sh start      # spustí, počká, vypíše stav a log z Log Analytics
```

Logy kroků: [identita.log](job-retez/dukazy/identita.log) (Exchange `Test-ServicePrincipalAuthorization`: `egd-report@` InScope True),
[push-0.1.log](job-retez/dukazy/push-0.1.log), [job-deploy.log](job-retez/dukazy/job-deploy.log).
Předpoklad: PDF API ve verzi 0.3, která kromě uživatelského scope `access_as_user` přijímá app roli `Dokumenty.App`
(změna v [libreoffice/app/server.mjs](libreoffice/app/server.mjs), role zakládá `tools/ca-dokumenty-deploy.sh entra`).

Konfigurace Jobu jen z proměnných prostředí (skript je doplní sám z Azure): `AZURE_CLIENT_ID` (MI), `CNB_URL`, `GATEWAY_URL`,
`GATEWAY_APP_ID`, `GATEWAY_APP_KEY` (účetní štítek gateway, v labu `demo`), `PDF_URL`, `PDF_APP_ID`, `MAIL_SENDER`, `MAIL_TO`.
Lokálně bez Azure: `CNB_URL=… node job.mjs --dry-run` (jen ČNB + docx do `./out`).

Build image: `az acr build` v labu ✅ odmítnut `TasksOperationsNotAllowed` ([acr-build-pokus.log](job-retez/dukazy/acr-build-pokus.log)),
proto lokální Docker (OrbStack, po pushi zastaven kvůli disku). Push image jobu 15 s.

## Výkon

| Běh | Celkem (Job start → konec) | ČNB | LLM krok | PDF krok | Pozn. |
|---|---|---|---|---|---|
| 1 ([beh-1.log](job-retez/dukazy/beh-1.log)) | 67 s (z toho start kontejneru Jobu ~29 s, kód 36,6 s) | 0,2 s | 33,1 s (gateway studená, v gateway 3,2 s) | 1,6 s (PDF API teplé po nasazení) | |
| 2, obě služby na 0 replikách ([beh-2-studeny.log](job-retez/dukazy/beh-2-studeny.log)) | 100 s (start kontejneru Jobu ~47 s, kód 51,6 s) | 0,25 s | 22,7 s (v gateway 3,8 s) | 27,2 s (studený start PDF API, převod 1,3 s) | mail 202, doručeno 02:19:14 ([doruceni-2.txt](job-retez/dukazy/doruceni-2.txt)) |

Pro denní report je doba nepodstatná; podstatné je, že studené starty závislých služeb Job vydrží (timeout repliky 600 s).

## Cena

Sazby Consumption ze [ceníku](libreoffice/dukazy/cenik-container-apps-swedencentral.json) (Job se účtuje stejnými metry jako app 📘):
Job 0,5 vCPU / 1 GiB = 0,000015 USD/s → běh ~70 s ≈ **0,001 USD**; LLM 0,00042 USD (z odpovědi gateway); probuzení PDF API
≤ 0,01 USD a gateway obdobně (cooldown 300 s, viz [libreoffice.md](libreoffice.md)). **Denní běh ≈ 0,02 USD, měsíc < 1 USD** (výpočet
ze sazeb, faktura ❓). Nic neběží trvale: Job jen na spuštění, obě API min 0 replik.

## Co chce IT E.ON

- Azure subscription s Container Apps (Job i API ve stejném env), registr image a možnost image postavit (ACR Tasks nebo pipeline;
  lokální Docker citizen developer bez admina nemá ❓).
- Entra: registrace API (gateway, PDF) s **aplikačními rolemi** a jejich přiřazení managed identitě Jobu (admin consent ekvivalent;
  v labu `appRoleAssignments` přes Graph jako Global Admin).
- Exchange Online: sdílená schránka pro odesílání a **RBAC for Applications** (`Application Mail.Send` na management scope s jednou
  schránkou) – dělá Exchange admin (`tools/napojeni-exo-rbac.ps1`).
- Odchozí přístup z prostředí na `api.cnb.cz` (nebo jiný zdroj) a `graph.microsoft.com`.

## Varianty

| Varianta | Stav | Pro | Proti | IT E.ON | Náročnost |
|---|---|---|---|---|---|
| **C) Container Apps Job (tato sonda)** | ✅ celý řetěz, mail doručen | kód v gitu, jedna MI bez tajemství, oprávnění úzká (role + jedna schránka), < 1 USD/měsíc | Azure, Entra role, Exchange RBAC, build image | subscription, Entra, Exchange admin | vysoká (v labu jedním skriptem) |
| C1) Job s LibreOffice přímo v image (bez volání PDF API) | ❓ nezkoušeno | o jeden HTTP skok a jednu app roli méně | image ~650 MB místo malé, každá appka svou kopii LibreOffice | totéž | vysoká |
| C2) Job jen s CSV (bez LLM a PDF) | ✅ [napojeni.md](../napojeni.md) Sonda 2, i cron | nejjednodušší | bez analýzy a dokumentu | totéž | střední |
| B) Power Automate (Recurrence → HTTP ČNB → AI → Word → Outlook) | ❓ celý řetěz nepostaven; HTTP konektor je Premium ✅ (PA sonda), E5 trial končí 25. 11. 04:04 | bez Azure, klikací | Premium licence, přihlášení konektorů člověkem | licence PA Premium | střední |

Doporučení: pro Tomášův scénář (denní report s analýzou a dokumentem) je v labu ověřená jen cesta **C**. B je levnější na
infrastrukturu, ale vyžaduje Premium licence a v labu neprošla. C1 dává smysl, jen když PDF API nebude sdílené.

## Neověřeno

| Tvrzení | Důvod | Návrh ověření |
|---|---|---|
| Cron přímo u tohoto Jobu | Job je `Manual`; mechanismus cronu je ✅ změřený u `job-egd-report` ([napojeni.md](../napojeni.md)) | `tools/job-retez-deploy.sh job --cron "<minuta+3> * * * *"`, počkat na běh, vrátit |
| Odeslání z jiné schránky touto MI odmítnuto (403) | stejný scope a mechanismus ✅ u `job-egd-report`, pro tuto MI neměřeno | `MAIL_SENDER=alice@… ` jednorázový běh, čekat 403 |
| Fonty v PDF | docx z knihovny nemá jméno fontu → LibreOffice dosadí Liberation Serif (patkové) | v `job.mjs` nastavit `styles.default.document.run.font = "Calibri"` → Carlito |
| Skutečná faktura | Cost Management se zpožděním | `az costmanagement query` nad `rg-egd-job-retez` |
| Exchange RBAC v E.ON | ⛔ jen v E.ON | Exchange admin E.ON spustí `napojeni-exo-rbac.ps1` |

## Co jsem vytvořil v labu

| Zdroj | Detail |
|---|---|
| RG `rg-egd-job-retez` (tag `ucel=egd-workshop`) | Job `job-egd-retez` (Manual, 0,5 vCPU / 1 GiB, timeout 600 s, retry 0) ve sdíleném env `ca-ppf-rooms-env`; MI `id-job-egd-retez` (clientId `92fbf658-…`, principalId `b67b9a49-…`) |
| ACR `acrppfroomsca3lbgs` (cizí) | repozitář `job-egd-retez:0.1`, AcrPull pro MI; `ca-egd-dokumenty:0.3` |
| Entra | app role `Dokumenty.App` na `egd-ca-dokumenty`; přiřazení `Gateway.App` a `Dokumenty.App` MI |
| Exchange | service principal `job-egd-retez`, role `Application Mail.Send` na existující scope `egd-sonda: odesilani egd-report` |
| Pošta | 2 testovací maily `egd-report@` → `tomas.prochazka@` (lab) |
