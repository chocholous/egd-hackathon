---
name: egd-planovane-ulohy
description: Vysvětli a postav plánovanou úlohu pro SharePoint appku EG.D (denní report, noční přepočet, pravidelné stažení dat a e-mail s přílohou) - SharePoint ani SPFx samy nic podle času nespustí, takže vyber Power Automate s plánovaným spuštěním (standardní konektory), nebo Azure Container Apps Job s cronem a systémovou schránkou. Použij, když uživatel řekne „každý den v 6 ráno“, „pošli týdenní report“, „naplánuj úlohu“, „cron“, „automaticky na pozadí“, „když nikdo nemá appku otevřenou“, „Recurrence“, „Power Automate flow“ nebo „noční zpracování“.
license: interní pomůcka workshopu EG.D
---

# Plánované úlohy (požadavek 7)

Uživatel je začátečník na Windows. Hlavní věta pro něj: **web part běží jen tehdy, když má někdo
stránku otevřenou.** Nic v SharePointu nespustí kód „v 6:00“. Potřebuješ jednu ze dvou cest níže.

Značky: ✅ změřeno v labu 22. 11. 2026 · ❓ neověřeno (viz sekce Neověřeno). Důkazy:
`sondy/ms-maily/README.md` (v repu workshopu) (klikací cesta B), `sondy/napojeni.md` (C, Sonda 2 a 4),
`sondy/power-automate.md` (Premium akce).

## Varianty

| | B) Power Automate | C) Azure Container Apps Job |
|---|---|---|
| Kdy | EG.D má Power Automate a stačí standardní konektory | data z API bez CORS, scraping, výpočty, mail ze systémové schránky |
| Plánování | Recurrence s časovým pásmem Praha ✅ (běh se startem 19:50:00 UTC = 20:50 SEČ; že šlo o plánovaný, ne ruční běh, je odvozeno z času — API typ spuštění nevrací, `pa-runs.log`) | cron ✅ spustil se na minutu přesně (cron je v **UTC**) |
| Mail s přílohou | Outlook „Send an email (V2)“ ✅ doručeno s tabulkou a přílohou, **jménem vlastníka flow** | Graph `sendMail` ze sdílené schránky, RBAC na jedinou schránku ✅ |
| Cizí API | jen akce HTTP (Premium ✅): Button + HTTP → zapnutí **403 `MissingAdequateQuotaPolicy`** = chybí licence Premium ✅; Recurrence + HTTP a Request trigger → **409 `CannotStartUnpublishedSolutionFlow`**, příčina ❓ (`sondy/power-automate/vystupy/diag-409.txt`) | ✅ (ČNB staženo) |
| Licence / Azure | žádný Azure; licence Power Automate pro **každého**, kdo flow vlastní (v labu E5 + role Environment Maker ✅). Napětí se zadáním: „EG.D nechce Azure hosting ani licence pro každého uživatele“ (`sondy/power-automate.md` ř. 3); per-user licence „Galík nechce“ (`10-container-app.md`, Dataverse) — u PA se to týká jen licence s PA, kterou E3 možná obsahuje ❓ | Azure subscription; licence ne |
| Kdo to nastaví | uživatel v prohlížeči, 15–20 minut klikání ✅ | IT / správce platformy |
| Verzování | mimo git; menu Export v labu **nenabízí balíček .zip** ✅; definice přes API ✅ | kód v gitu, deploy skriptem |
| Stav v labu | ✅ celá cesta prošla (uloženo, test, plánovaný běh, mail doručen) | ✅ celé prošlo, mail doručen |
| Co chce IT E.ON | licence Power Automate, role v prostředí (Environment Maker u Dataverse ✅), přihlášená připojení | subscription, vlastní prostředí Container Apps, Exchange RBAC, identita |
| Pro citizen developera | střední: klikání, žádný kód | vysoká, dělá IT |

Další varianty (méně časté):

| Varianta | Stav v labu | Pro / proti | Co chce IT |
|---|---|---|---|
| B s mailem ze sdílené schránky: Outlook „Send an email from a shared mailbox (V2)“ | ❓ běh neověřen (`sondy/power-automate.md`, Send As `tools/pa-sharedmailbox-sendas.ps1`) | + odesílatel je tým, ne člověk; − Send As pro vlastníka flow | Send As na schránku |
| B s cizím API přes akci HTTP (Premium, per-user nebo PAYG) | ❌ zapnutí 403 `MissingAdequateQuotaPolicy` (chybí Premium ✅) | + bez Azure; − licence Premium | Premium licence, nebo PAYG plán prostředí 📘 (nezkoušeno) |
| Ruční „pošli report hned“ tlačítkem v appce | ✅ `egd-maily` (SPFx `sendMail`) | + bez plánovače; − jen když někdo klikne | schválit `Mail.Send` |

## Žebřík: co agent zkusí u účastníka

| Krok | Zkus | Funguje? (test) | Když ne |
|---|---|---|---|
| 1 | Otevři https://make.powerautomate.com pod účtem účastníka | portál se otevře, vlevo My flows | licence chybí (`InvalidUserPlan` ✅ v labu) → krok 5 |
| 2 | Create → Scheduled cloud flow → Create | otevře se designer | — |
| 3 | Postav flow podle B níže a dej Save | „Your flow is ready to go“ ✅ | chyba `prvReadconnectionreference` → IT: role Environment Maker, pak znovu |
| 4 | Test → Manually → Run flow | „Your flow ran successfully“ a mail ✅ | Unauthorized u akce → připojení není přihlášené: Sign in u akce |
| 5 | Bez licence / role: tlačítko „pošli report hned“ (`egd-maily`) | 202, mail v Odeslaných ✅ | `mailto:` (❓ na Windows, viz `egd-maily`) |
| 6 | Je opravdu potřeba noční běh bez člověka? → C přes IT (věta níže) | Job Succeeded ✅ | zapiš požadavek do zprávy pro Pavla |

Na konci zapiš, který krok prošel.

**Doporučení na workshop:** B klikáním, **pokud** má účastník licenci Power Automate a smí uložit flow
(kroky 1–3 projdou). Jinak krok 5 a C jen jako „co by udělalo IT“.

## B) Power Automate: denní report ze seznamu (klikací cesta ✅)

Prošlo v labu pod licencovaným uživatelem v anglickém rozhraní; popisky níže jsou anglicky, jak je portál ukázal
(české popisky ❓). Seznam `Pozadavky` z `egd-prvni-appka`.

1. https://make.powerautomate.com → **Create** → **Scheduled cloud flow** → Flow name, Starting dnes,
   at **06:00 AM**, Repeat every **1 Day** → **Create**. Otevře se designer.
2. Klikni na **Recurrence** a nastav **Time zone** „(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague“,
   **At these hours** 6, **At these minutes** 0. ⚠ Dialog z kroku 1 pásmo **nevyplní** a čas uloží jako
   `05:00Z` (UTC podle prohlížeče) ✅ — bez tohoto kroku by report v létě chodil o hodinu jinak.
   **Jen pracovní dny:** v Recurrence Frequency **Week** a ve dnech zaškrtni pondělí až pátek. Definici
   `frequency: Week`, `weekDays: Monday–Friday`, `hours: 6`, pásmo Praha Flow API uložil a vrátil zpět ✅
   (`sondy/ms-maily/recurrence-po-pa.log`); popisky polí v designeru a skutečný běh v pondělí 6:00 ❓.
3. **+** pod Recurrence → hledej **Get items** → SharePoint **Get items** → **Add new** → **Sign in** → v okně
   „Pick an account“ klikni na svůj účet ✅ (připojení se přihlásí, heslo se nezadává, pokud je člověk v prohlížeči
   přihlášený). Site Address a List Name vyber z nabídky. **Show all** → Filter Query `Stav eq 'Nový'`,
   Top Count `1000`. „Za poslední den“ místo stavu: Filter Query `Created ge '@{addDays(utcNow(),-1)}'` ✅
   (nad 6000 položkami prošlo bez chyby, `sondy/ms-maily/filtr6000-beh1.json`).
   ⚠ **Seznam s víc než 5000 položkami** ✅ (změřeno nad 6000, 300 z nich „Nový“, sloupec Stav bez indexu):
   - bez Top Count vrátí Get items jen **100** položek;
   - Filter Query s Top Count 5000 vrátí **251 z 300** — tiše, bez chyby (prohledá jen prvních 5000 řádků);
   - se zapnutým **stránkováním** (Pagination, práh 5000) vrátí filtr všech **300** ✅;
   - víc než 5000 položek najednou nedostaneš: práh stránkování 6000 flow odmítne uložit
     (`InvalidPaginationPolicy … Maximum: '5000'`, `sondy/ms-maily/filtr6000-create.log`).
   Proto u velkého seznamu vždy filtr **a** stránkování. Stránkování je v definici `paginationPolicy` ✅ (API);
   cesta v designeru (nastavení akce → Pagination) ❓ neklikáno.
4. **+** → hledej `HTML table` a zapni filtr **Built-in** (bez něj „Create HTML table“ v hledání chyběla ✅) →
   **Create HTML table**. From: ikona ⚡ → `body/value`. Show all → Columns **Custom**: Požadavek ← „Požadavek“,
   Stav ← „Stav Value“, Zadal ← „Created By DisplayName“ (jinak tabulka obsahuje všechny systémové sloupce).
5. **+** → **Send an email (V2)** (Office 365 Outlook) → **Add new** → Connection name (libovolný) → **Sign in** →
   Pick an account ✅. To, Subject, Body: text a pak `/` → Insert dynamic content → **Output**.
   Příloha: **Show all** → Attachments → **Add new item** → Name `prehled-pozadavku.html`, Content ⚡ → Output ✅.
   (Soubor z knihovny místo toho: akce SharePoint „Get file content“ ❓ v této cestě nezkoušeno.)
6. **Save** → „Your flow is ready to go“ ✅ → **Test** → Manually → Test → **Run flow** → „Your flow ran
   successfully“ ✅ → zkontroluj mail.
7. **Zapni flow:** My flows → u flow přepínač **Enabled** ✅ (klik v UI, výsledný stav Started/Stopped ověřen API, `klik-pa61-enabled.png`). Po uložení a další úpravě byl flow v labu ve stavu
   **Off** ✅ (detail flow: Status Off); bez zapnutí plánovaný běh nepřijde.

Všechny konektory výše jsou **Standard** ✅ (API flow: `shared_sharepointonline` a `shared_office365` Standard;
„Create HTML table“ je vestavěná akce typu `Table` bez konektoru ✅, `sondy/ms-maily/pa-flow-tiers.log`).

Pasti ✅:
- Výchozí prostředí v tenantu může mít Dataverse; pak bez role **Environment Maker** flow nejde uložit
  (`missing prvReadconnectionreference`, `sondy/napojeni.md` Sonda 4).
- Připojení založené přes API (agentem bez prohlížeče) zůstane ve stavu Error; přihlásí se jen klikem „Sign in“
  v prohlížeči ✅. Agent s uloženým přihlášeným profilem to v labu zvládl výběrem účtu (`tools/pw-profil-server.mjs`).
- Flow běží **na licenci a připojeních vlastníka** („This flow runs on owner's plan“, připojení na jeho účtu) ✅.
- Spoluvlastník: Share → přidat kolegu ✅. Pozor, dialog „Before you share…“ říká, že spoluvlastník smí používat
  **připojení vlastníka** — u Outlooku posílat mail jeho jménem a číst/mazat jeho poštu ✅. Pro týmový report proto
  raději servisní účet jako vlastník.
- Export: menu **Export** u flow v prostředí s Dataverse nabízí jen „Learn how“ a „Get flow identifier“ ✅ — balíček
  .zip není. Zálohu definice udělal v labu agent nástrojem `tools/pa-flow.py get <id> --full > flow.json` ✅ (nástroj labu, v repu workshopu, v balíčku není; účastník bez něj zálohu .zip nezíská, viz Export výše). Export přes Solutions ❓.

## C) Container Apps Job (pro IT, ověřeno v labu)

**Skripty této varianty jsou jen pro IT, v repu workshopu** (`egd-workshop`, složka `tools/`): `tools/napojeni-report-job.py`,
`tools/napojeni-exo-rbac.ps1`, `tools/napojeni-job-deploy.sh`. V balíčku skillů nejsou. Agent účastníka je nehledá
a nespouští, IT o ně požádá lektora.

Skript (`tools/napojeni-report-job.py`) stáhne data, vyrobí CSV a pošle ho přes Graph `sendMail`
ze sdílené schránky. Identita je **managed identity** (žádné heslo), oprávnění `Mail.Send` jen
na jednu schránku přes Exchange RBAC for Applications (`tools/napojeni-exo-rbac.ps1`) ✅;
pokus odeslat z jiné schránky dostal 403 ✅. Nasazení `tools/napojeni-job-deploy.sh`
(cron je UTC ✅; v labu běžel `0 6 * * 1` a cron na minutu dopředu. `0 5 * * 1-5` = 6:00 SEČ ve všední dny, v létě 7:00,
je odvozené ❓). Cena: v řádu haléřů za běh (odhad, fakturou neověřeno ❓; 1,51 EUR v `sondy/napojeni.md` je náklad sdíleného registru ACR projektu ppf-rooms, ne cena pro EG.D; vlastní registr
by byl další trvalý náklad ❓).
Lab Job běžel ve sdíleném prostředí `ca-ppf-rooms-env`: subscription smí mít jen jedno prostředí Container Apps
(`MaxNumberOfGlobalEnvironmentsInSubExceeded` podle `sondy/napojeni.md`, surový log neuložen ❓) — EG.D potřebuje
vlastní prostředí, kvóta v E.ON ❓. Vše `sondy/napojeni.md`, Sonda 2.

## Ověření (vždy)

- B: Test → Manually → „Your flow ran successfully“ a mail v doručené poště ✅. Pak zkontroluj **Enabled** a počkej
  na první plánovaný běh, nebo dočasně nastav At these hours/minutes na čas za pár minut ✅ (tak to prošlo v labu);
  historie běhů: detail flow → 28-day run history, nebo v labu `tools/pa-flow.py runs <id>` (v repu workshopu).
- C: `az containerapp job execution list` → `Succeeded`, mail doručen ✅.
- Neříkej „naplánováno“, dokud neproběhl aspoň jeden plánovaný běh a nepřišel mail.

## Kdy to nejde v E.ON

- Uživatel nemá licenci Power Automate nebo roli v prostředí (bez Environment Maker se flow neuloží ✅ v labu).
- Cizí API v plánované úloze → akce HTTP je Premium (tier z API ✅) a flow s ní se v labu nezapnul ✅ → licence nebo cesta C.
- DLP politika může zakázat kombinaci konektorů ❓ (v labu žádná DLP není).
- C vyžaduje Azure subscription a prostředí Container Apps. EG.D nechce Azure hosting pro každého uživatele
  (`10-container-app.md`), C je proto varianta pro IT. Úvaha (nespočítáno): jedna sdílená úloha pro víc appek by
  měla vyjít levněji než úloha pro každou.

**Věta pro IT (ServiceNow) — B:** „Prosím o ověření, že můj účet smí v Power Automate (výchozí
prostředí) vytvořit naplánovaný tok se standardními konektory SharePoint a Office 365 Outlook,
případně o roli Environment Maker. Účel: denní e-mailový přehled ze seznamu <seznam> na webu <web>.“

**Věta pro IT (ServiceNow) — C:** „Prosím o Azure Container Apps Job se systémovou managed identitou
a sdílenou schránkou <adresa>; identita smí posílat poštu jen z této schránky (Exchange RBAC for
Applications, role Application Mail.Send s management scope na jednu schránku). Úloha běží denně
v 6:00 a posílá report z dat <zdroj>.“

## Neověřeno

| Tvrzení | Proč | Jak a kde ověřit |
|---|---|---|
| České popisky v make.powerautomate.com | lab profil je anglicky | profil s jazykem čeština |
| Přihlášení konektoru u E.ON (MFA, Conditional Access) | lab má SSO bez MFA | na workshopu pod účtem účastníka |
| Power Automate je v licenci E3 (EG.D) | lab má E5 | dotaz na IT / účet účastníka |
| Akce HTTP poběží s licencí Premium | v labu není Premium licence | trial Premium (`sondy/power-automate.md`) |
| DLP politika E.ON povolí SharePoint + Outlook | v labu DLP není | Power Platform admin E.ON |
| Co se stane s flow po odchodu vlastníka | lab účet nechci blokovat | jednorázový lab účet / E.ON |
| Export přes Solutions (.zip) | zakládá řešení v Dataverse, nezkoušeno | Solutions → New solution → Add existing → Cloud flow → Export |
| Příloha ze souboru v knihovně („Get file content“) | v klikací cestě použita HTML tabulka | přidat akci a pustit Test |
| Kde je Pagination v nastavení akce Get items (designer) | stránkování ověřeno jen definicí přes API | otevřít akci → Settings → Pagination, zapnout, Threshold 5000, Save, Test |
| Víc než 5000 položek v jednom reportu (smyčka po oknech ID) | strop stránkování 5000 ✅, smyčka nezkoušena | Do until s filtrem `ID gt <poslední>` nad 6000 položkami |
| Recurrence Po–Pá opravdu spustí jen ve všední dny | definice uložena ✅, běh nečekán | nechat flow zapnutý přes víkend a `tools/pa-flow.py runs` |
| Popisky Frequency Week / dny v designeru | definice přes API | klik v designeru |
| Proč byl flow po úpravě Off a kde je v detailu „Turn on“ | v detailu tlačítko nebylo, pomohl přepínač v My flows | znovu uložit nový flow a sledovat stav |

## Zdroje

`sondy/ms-maily/README.md` (v repu workshopu) (klikací cesta B, screenshoty),
`sondy/napojeni.md` (Sonda 2 Job, Sonda 4 Power Automate), `sondy/power-automate.md` (Premium akce),
nástroje `tools/napojeni-*`, `tools/pa-flow.py`, `tools/pw-profil-server.mjs`.
