# Sonda ms-maily: ověření miniskillů `egd-maily` a `egd-planovane-ulohy` v labu

Session `ms-maily`, 22. 11. 2026. Všechno pod lab účty tenantu `pavelchocholousgmail`, maily jen mezi lab účty
(odesílatel Tomáš Procházka, adresát Eva Veselá). Značky: ✅ změřeno · ❓ neověřeno (důvod v tabulce Neověřeno).

## A) SPFx web part posílá mail (`egd-maily`)

Web `https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-maily` (Communication site, `--lcid 1029`,
site app catalog), appka z `skills/egd-prvni-appka` (`appka.mjs novy|build|seznam|nasadit`, SPFx 1.24.1, projekt
[prvni-appka/](prvni-appka/)). Do záložky „Moje požadavky“ přidán panel „Poslat mailem“ s funkcí `_posliMail`
přesně podle skillu, `webApiPermissionRequests` Microsoft Graph / `Mail.Send`. Klikání: [tools/maily-spo-klik.mjs](../../tools/maily-spo-klik.mjs)
(headless Chrome s uloženým profilem `tomas.prochazka`).

| Krok | Výsledek | Důkaz |
|---|---|---|
| Build s kódem ze skillu | ✅ prošel; ⚠ `Promise.finally` v šabloně nejde (`TS2550`, lib < es2018), použito `then/catch` | [build.out](build.out), `prvni-appka/build.log` |
| Žádost o oprávnění z **katalogu webu** (ne tenantu) | ✅ vznikla: `prvni-appka-client-side-solution` 1.0.0.0, Microsoft Graph, `Mail.Send` | výpis `permissionrequest list --debug` (CSOM odpověď) |
| Klik „Poslat mailem“ **bez schválení** | ✅ Graph `POST /me/sendMail` → **403 `ErrorAccessDenied`** „Access is denied“ (žádné AADSTS65001; token vznikne, jen bez `Mail.Send`) | [bez-schvaleni.png](bez-schvaleni.png) |
| `m365 spo serviceprincipal permissionrequest list` (CLI 11.11.0) | ❌ 403 `Authorization_RequestDenied` na Graph `servicePrincipals?$filter=…` (aplikace CLI nesmí číst SP) | [permissionrequest-list.log](permissionrequest-list.log) |
| `m365 spo serviceprincipal permissionrequest approve --id 11308e16-…` | ❌ „The service principal for permssion request prvni-appka-client-side-solution could not be found.“ (chyba **SharePointu**, CSOM `ErrorInfo`) | [approve-cli.log](approve-cli.log), [approve-debug-redigovano.log](approve-debug-redigovano.log) |
| Schválení v UI admin centra (API access) | ❓ nezkoušeno: admin centrum chtělo MFA na účtu, který není lab účet; agent se nepřihlašuje | – |
| Schválení přes Graph: k existujícímu `oauth2PermissionGrant` principalu „SharePoint Online Web Client Extensibility“ (`AllPrincipals`, resource Microsoft Graph) přidán scope `Mail.Send` | ✅ PATCH 204, scope obsahuje `Mail.Send`, `consentType` `AllPrincipals`; žádost v SharePoint adminu ale dál visí jako čekající | [grant-pred.txt](grant-pred.txt) (stav před), [grant-po.txt](grant-po.txt) (stav po + opakovaný PATCH 204) |
| Klik hned po grantu (stránka už jednou otevřená) | ✅ pořád 403: token v cache prohlížeče **nemá** `Mail.Send` (`scp` dekódováno) | konzole nástroje |
| Klik po smazání access tokenů MSAL z úložiště stránky (`--novy-token`) | ✅ **202**, `scp` obsahuje `Mail.Send`, 780 ms | [limit-prilohy.log](limit-prilohy.log) (každý řádek `[graph] 202 … Mail.Send v tokenu: true` = výstup `maily-spo-klik.mjs` z kliku ve web partu), [inbox-csv.log](inbox-csv.log) (doručení CSV). Pozn.: `po-schvaleni.png` je omylem kopie `bez-schvaleni.png`, nedokládá nic |
| Doručení | ✅ Evina schránka: od Tomáše, příloha `moje-pozadavky.csv` 243 B, UTF-8 BOM, čeština v pořádku; kopie v Tomášových Odeslaných | [inbox-csv.log](inbox-csv.log), [priloha-prijata.csv](priloha-prijata.csv) |
| Limit přílohy (náhodná data, `contentBytes` v jednom `sendMail`) | ✅ 1 / 2,5 / 2,9 / 3 / 3,5 / 4 / 6 / 10 / 20 / 25 / **30 MB → 202 a doručeno**; **40 MB → 400 `ErrorMessageSizeExceeded`**. 30 MB trvá v prohlížeči 20 s (převod na base64 po bajtech). Tvrzení „do ~3 MB“ je vyvrácené | [limit-prilohy.log](limit-prilohy.log), [limit-prilohy-doruceni.log](limit-prilohy-doruceni.log) |
| `mailto:` náhrada | ✅ vygeneruje `mailto:eva…?subject=P%C5%99ehled…&body=…` (čeština zakódovaná); otevření Outlooku ❓ (headless, bez Windows) | [mailto.log](mailto.log) |
| Jménem sdílené schránky | ✅ `POST /me/sendMail` s `from` = `egd-report@` (Tomáš má Send As) projde **jen s `Mail.Send`**, doručeno od `egd-report@`; ✅ `from` = `eva.vesela@` (bez Send As) → 403 `ErrorSendAsDenied`; ✅ `POST /users/egd-report@…/sendMail` → 403 „requires Mail.Send.All, Mail.Send.Shared“. Měřeno delegovaným tokenem mimo SPFx (`napojeni-graph-delegated.py token`) | [sendas.log](sendas.log) |

## B) Power Automate klikací cesta (`egd-planovane-ulohy`)

Pod Tomášem (licence E5, role Environment Maker z `sondy/napojeni.md`) v make.powerautomate.com, ovládáno
[tools/pw-profil-server.mjs](../../tools/pw-profil-server.mjs) (Chrome s uloženým profilem, SSO). Rozhraní je anglicky
(jazyk profilu). Flow `EGD ms-maily: denní report (klikací cesta)`, id `5516544d-6bf0-7b8e-ab9f-5c077c57ec3b`.

| Krok | Výsledek | Důkaz |
|---|---|---|
| Create → Scheduled cloud flow → název, 06:00 AM, Repeat every 1 Day → Create | ✅ designer (nový) otevřen | [klik-pa3.png](klik-pa3.png), [klik-pa7.png](klik-pa7.png) |
| Past: dialog čas převede na `Start time 2026-11-22T05:00:00Z` (UTC podle prohlížeče) a **Time zone nechá prázdné** | ✅ | [klik-pa8.png](klik-pa8.png) |
| Recurrence → Time zone „(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague“, At these hours 6, minutes 0 | ✅ definice `timeZone: Central Europe Standard Time`, `hours: [6]` | [pa-flow-definice.json](pa-flow-definice.json) |
| SharePoint **Get items** → Add new → Sign in → okno „Pick an account“ → klik na účet | ✅ připojení vzniklo **bez hesla** (SSO uloženého profilu), „Connected to SharePoint“ | [klik-pa13.png](klik-pa13.png), [klik-pa14-1.png](klik-pa14-1.png), [klik-pa15-0.png](klik-pa15-0.png) |
| Site Address a List Name z nabídky, Show all → Filter Query `Stav eq 'Nový'`, Top Count 1000 | ✅ | – |
| **Create HTML table**: hledání „Create HTML table“ s filtrem All ji nenašlo; „HTML table“ + filtr **Built-in** ano (Data Operation) | ✅ | [klik-pa24.png](klik-pa24.png) |
| From ⚡ `body/value`; Columns Custom: Požadavek ← „Požadavek“, Stav ← „Stav Value“, Zadal ← „Created By DisplayName“ | ✅ | – |
| Office 365 Outlook **Send an email (V2)** → Add new → Connection name + Sign in → Pick an account | ✅ „Connected to Office 365 Outlook“ | – |
| To, Subject, Body (text + `/` → Insert dynamic content → Output), Show all → Attachments → Name `prehled-pozadavku.html`, Content ⚡ Output | ✅ | [klik-pa37.png](klik-pa37.png) |
| Save | ✅ „Your flow is ready to go“ | [klik-pa43.png](klik-pa43.png) |
| Test → Manually → Test → Run flow | ✅ „Your flow ran successfully“, 4 akce zelené, Send email `statusCode 200` | [pa-beh-uspesny.png](pa-beh-uspesny.png) |
| Doručení | ✅ Eva: od Tomáše, tělo s HTML tabulkou (3 položky, čeština OK), příloha `prehled-pozadavku.html` 623 B | [pa-mail-doruceny.log](pa-mail-doruceny.log) |
| Tier konektorů (API) | ✅ `shared_sharepointonline: Standard`, `shared_office365: Standard`; tabulka je vestavěná akce | [pa-flow-tiers.log](pa-flow-tiers.log) |
| Stav po uložení a další úpravě | ✅ detail flow ukázal **Status Off** + „potential problem… Flow checker“; zapnuto přes API (`pa-flow.py start` 200) | [klik-pa50.png](klik-pa50.png), [klik-pa53.png](klik-pa53.png) |
| Zapnutí/vypnutí v UI | ✅ My flows → sloupec **Enabled** (přepínač) → stav Started / Stopped (ověřeno API) | [klik-pa61-enabled.png](klik-pa61-enabled.png) |
| Plánovaný běh v pražském čase | ✅ dočasně hours 20, minutes 50 → běh `Succeeded` v **19:50:00 UTC** (= 20:50 SEČ), mail doručen v 19:50:05 | [pa-runs.log](pa-runs.log) |
| Export | ✅ menu **Export** u flow nabízí jen „Learn how“ a „Get flow identifier“ — balíček .zip v tomto prostředí (Dataverse) **není**; definice jde uložit přes API (`pa-flow.py get --full`) | [klik-pa54.png](klik-pa54.png), [pa-flow-definice.json](pa-flow-definice.json) |
| Spoluvlastník (Share) | ✅ přidána Eva; dialog „Before you share…“: spoluvlastník smí používat **připojení vlastníka** (Outlook: „Send mail as signed in user (you)“, číst/mazat jeho maily; SharePoint: zápis položek) | [pa-spoluvlastnik-varovani.png](pa-spoluvlastnik-varovani.png) |
| „Plan: This flow runs on owner's plan“, připojení na účtu Tomáše | ✅ detail flow | [klik-pa50.png](klik-pa50.png) |

## Neověřeno

| Tvrzení | Proč | Jak a kde ověřit |
|---|---|---|
| Approve v UI, když API ještě grant nemá (POST), a pod rolí SharePoint admin bez Global Admina | UI Approve rozšiřující existující grant je ✅ (`sondy/overeni/api-access/ui-4/`, Global Admin) | žádost na API bez grantu; lab účet jen s rolí SharePoint Administrator |
| Za jak dlouho uživatel s otevřenou stránkou dostane nový token sám (bez mazání úložiště) | měřeno jen s ručním smazáním tokenů | po schválení nechat stránku 60–90 min a kliknout znovu, nebo nové okno InPrivate |
| `mailto:` otevře Outlook na Windows E.ON a délka těla | headless Chrome na macOS | na notebooku účastníka |
| Limit velikosti v E.ON (MaxSendSize schránky) | v labu výchozí, 30 MB prošlo, 40 MB ne | zkušební mail v tenantu E.ON nebo dotaz na IT |
| PA „When an item is created“ → Send an email (upozornění bez kódu) | čas; připojení i Send email V2 ověřeny jinou cestou | stejným nástrojem `pw-profil-server.mjs`, trigger SharePoint |
| Export flow přes Solutions (.zip) | v labu nezkoušeno (zakládá řešení a vydavatele v Dataverse) | Solutions → New solution → Add existing → Cloud flow → Export |
| Co se stane s flow, když vlastník odejde (účet zablokován) | v labu nechci blokovat sdílený lab účet | v E.ON s IT, nebo na jednorázovém lab účtu |
| České popisky v make.powerautomate.com | profil je anglický | profil s jazykem čeština |
| Přihlášení konektoru u E.ON (MFA, Conditional Access) | lab má SSO bez MFA | na workshopu |

## Get items nad 6000 položkami (23. 11. 2026) ✅

Seznam `Pozadavky6000` na tomto webu (6000 položek, z toho 300 „Nový“, sloupec Stav bez indexu; plnění
[filtr6000-naplneni.log](filtr6000-naplneni.log)). Flow `9bd91b66-…` přes API ([filtr6000-flow.json](filtr6000-flow.json)),
trigger Recurrence po minutě, akce paralelně, připojení SharePoint Tomáše. Výstupy běhu přes `tools/pa-run-vystupy.py`
→ [filtr6000-beh1.json](filtr6000-beh1.json), běhy [filtr6000-runs.log](filtr6000-runs.log).

| Akce Get items | Vrátila | Pozn. |
|---|---|---|
| bez Top Count | **100** | `nextLink` |
| bez filtru, Top Count 5000 | 5000 | `nextLink` |
| `Stav eq 'Nový'`, Top Count 5000 | **251 z 300**, bez chyby | tiše neúplné |
| `Stav eq 'Nový'`, stránkování 5000 | **300** | správně |
| bez filtru, stránkování 5000 | 5000 | víc nejde |
| stránkování 6000 | flow nejde uložit: `InvalidPaginationPolicy … Maximum: '5000'` | [filtr6000-create.log](filtr6000-create.log) |
| `Created ge '@{addDays(utcNow(),-1)}'`, Top Count 5000 | 5000 (všechny položky jsou z dneška) | filtr podle data prošel bez chyby prahu |

Recurrence jen pracovní dny: flow `25546f31-…` (vypnutý) s `frequency: Week`, `weekDays` Po–Pá, 6:00 Praha — Flow API
definici uložil a vrátil ✅ ([recurrence-po-pa-flow.json](recurrence-po-pa-flow.json), [recurrence-po-pa.log](recurrence-po-pa.log)); běh ❓.

## Test v GitHub Copilot CLI (23. 11. 2026)

Výsledky: [skills/egd-maily/TEST-copilot.md](../../skills/egd-maily/TEST-copilot.md),
[skills/egd-planovane-ulohy/TEST-copilot.md](../../skills/egd-planovane-ulohy/TEST-copilot.md); logy v [copilot/](copilot/)
(`mm1` = egd-maily, `pu2` = egd-planovane-ulohy, `pu1.out` = neúspěšný pokus 22. 11. při plném disku).
Klik na tlačítko z Copilotovy appky: [copilot-mm1-klik.log](copilot-mm1-klik.log) (202),
[copilot-mm1-klik.png](copilot-mm1-klik.png), doručení [copilot-mm1-doruceni.log](copilot-mm1-doruceni.log).

## Co jsem v labu vytvořil / změnil (nic nesmazáno)

- Web `/sites/egd-sonda-ms-maily` + site app catalog; Tomáš ve Vlastnících, Eva ve Členech; seznam `Pozadavky` (3 položky), stránka `SitePages/evidence.aspx`, appka `prvni-appka` 1.0.0.0.
- **Tenantový grant**: principal „SharePoint Online Web Client Extensibility“ → Microsoft Graph nyní i s `Mail.Send` (platí pro všechny SPFx appky v labu). Původní scope v [grant-pred.txt](grant-pred.txt).
- Žádost o oprávnění `11308e16-b190-406a-83c7-9cdffaa2c16b` (Mail.Send) zůstává v SharePoint adminu čekající.
- Power Automate (Tomáš): připojení SharePoint (`tomas.prochazka@…`) a Office 365 Outlook (`egd-ms-maily-outlook`), přihlášená; flow `5516544d-…` (**Stopped**, plán nyní 20:50 SEČ), spoluvlastník Eva.
- Maily: v Evině schránce zkušební zprávy (CSV, test 1–30 MB, Send As z `egd-report@`, 2× report z PA); kopie v Tomášových Odeslaných.
- 23. 11.: seznam `Pozadavky6000` (6000 položek); flow `9bd91b66-…` „test Get items nad 6000“ (**Stopped**) a
  `25546f31-…` „test Recurrence Po–Pá“ (**Stopped**, nikdy nezapnut).
- 23. 11.: Copilot (test) nasadil do katalogu webu novou `prvni-appka.sppkg` 1.0.0.1 (appka Spokojenost, „přepsat starší“
  podle plánu `appka.mjs nasadit`), založil seznam `Spokojenost` a stránku `SitePages/prvni-appka.aspx`; v Evině schránce
  „Výsledky hlasování 2026-11-23“. Zda stránka `evidence.aspx` se starou appkou dál funguje ❓ (m365 přihlášení vypršelo
  dřív, než šlo katalog přečíst).
