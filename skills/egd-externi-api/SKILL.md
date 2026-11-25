---
name: egd-externi-api
description: Napoj SPFx appku EG.D na cizí zdroj dat - nejdřív zjisti, jestli API povoluje volání z prohlížeče (CORS); když ano, volej ho přímo z web partu, když ne (ČNB, OTE, scraping webových stránek), vysvětli, proč to z prohlížeče nejde, a nabídni server nebo Power Automate. Použij, když uživatel řekne „načti data z API“, „napoj ARES / ČNB / OTE / počasí“, „stáhni kurzy“, „scrapuj web“, „Failed to fetch“, „blocked by CORS policy“, „No 'Access-Control-Allow-Origin' header“, nebo „proč to v Postmanu jde a v appce ne“.
license: interní pomůcka workshopu EG.D
---

# Cizí API a scraping (požadavek 5)

Uživatel je začátečník na Windows. Navazuje na `egd-prvni-appka`. Appka běží **v prohlížeči
uživatele**; prohlížeč pustí odpověď cizího serveru jen tehdy, když to ten server dovolí
hlavičkou `Access-Control-Allow-Origin` (CORS). V SharePointu ani v SPFx se to zapnout nedá.

Značky: ✅ změřeno v labu 22. 11. 2026 · co ověřit nešlo, je v sekci **Neověřeno**. Důkazy:
`sondy/ms-dokumenty/README.md` (v repu workshopu) (skutečný SPFx 1.24.1 web part na
`/sites/egd-sonda-ms-dokumenty`, klikal lab uživatel `petra.novakova` v Chrome) a `sondy/napojeni.md`
(Chromium s podstrčeným originem SharePointu).

## Žebřík variant (zkoušej shora, na konci řekni, kterou jsi použil)

**Test CORS** (jde zdroj volat z prohlížeče?), první varianta, která v prostředí účastníka funguje:

| # | Varianta | Test „funguje?“ | Když ne | Lab |
|---|---|---|---|---|
| T1 | **Konzole prohlížeče na stránce SharePointu** (nic se neinstaluje): otevři libovolnou stránku svého webu, F12 → Konzole, vlož `fetch('<URL API>').then(r => r.status)` | vypíše číslo (200) = **jde**; `TypeError: Failed to fetch` + „blocked by CORS policy“ = **nejde** | F12 zakázané politikou → T2 | ✅ ARES 200, ČNB Failed to fetch; měřeno skriptem (`tools/spo-webpart-konzole.mjs --eval`, totéž vyhodnocení jako v konzoli) pod profilem `petra.novakova` (`sondy/ms-dokumenty/konzole-fetch-test.log`), ručně v F12 ❓ |
| T2 | **PowerShell `Invoke-WebRequest`** (Windows, bez instalace): `(Invoke-WebRequest -UseBasicParsing -Uri '<URL API>' -Headers @{ Origin = 'https://<tenant>.sharepoint.com' }).Headers['Access-Control-Allow-Origin']` | vypíše `*` nebo tvůj origin = **jde**; prázdné = **nejde** | chyba spojení (proxy) → T1 | PowerShell 7.5 na macOS ✅ (ARES `*`, ČNB prázdné, `sondy/ms-dokumenty/pwsh-cors.log`); Windows PowerShell 5.1 ❓ |
| T3 | `curl.exe` ve Windows PowerShellu (`-o NUL`), na macOS `curl` (`-o /dev/null`) | ve výpisu `access-control-allow-origin: *` nebo tvůj origin | `curl.exe` chybí / proxy → T1, T2 nebo se zeptej IT | macOS ✅; Windows ❓ |

**Získání dat:**

| # | Varianta | Kdy | Test „funguje?“ | Když ne | Lab |
|---|---|---|---|---|---|
| D1 | **Přímo z web partu** (`httpClient`, krok 2a) | zdroj má CORS, klíč není tajný | data se v appce zobrazí, v konzoli nic o CORS | CORS chybí → D2 | ✅ ARES, Open-Meteo |
| D2 | **Ruční data**: Excel → SharePoint seznam, appka čte seznam | zdroj bez CORS, stačí občasná aktualizace | appka zobrazí položky seznamu | seznam nejde založit (práva) → požádej vlastníka webu | ✅ čtení seznamu (`egd-prvni-appka`) |
| D3 | **Container Apps Job** zapisuje do seznamu | pravidelná data bez CORS, tajný klíč, scraping | Job doběhne, v seznamu přibudou řádky | bez subscription a identity od IT nejde → D2 | ⚠ stažení ✅, zápis do seznamu ❓ |
| D4 | **Power Automate** s akcí HTTP | jen s licencí Premium | flow jde zapnout a doběhne | 403 `MissingAdequateQuotaPolicy` („you need a Power Automate Premium license“) → D2/D3 | ✅ bez Premium nejde (`sondy/power-automate/vystupy/diag-409.txt` ř. 10, 15) |

U D2 a D3 zakládej seznam i sloupce **bez diakritiky a mezer** (`Kurzy`, `Mena`). Popisek s diakritikou nastav až
potom. Diakritika a mezera se do interního názvu sloupce propíšou zakódované a zkrácené ✅. Kód appky pak musí používat
zakódovaný název. Pravidlo a důkaz jsou
ve skillu `egd-data-seznamy`, oddíl „Pravidlo: názvy seznamů a sloupců“.

## Krok 1: jde to z prohlížeče?

| Zdroj | Z appky | Jak změřeno |
|---|---|---|
| ARES (`ares.gov.cz/ekonomicke-subjekty-v-be/rest`) | ✅ ano | web part: firma načtena za 0,2–0,4 s; `curl`: `access-control-allow-origin: *`, preflight s `authorization` povolen |
| Open-Meteo (počasí) | ✅ ano | web part: teplota načtena; `curl`: `access-control-allow-origin: *` |
| ČNB API (`api.cnb.cz`) | ❌ ne | web part: `blocked by CORS policy`; `curl`: hlavička chybí |
| ČNB `denni_kurz.txt` (`www.cnb.cz`) | ❌ ne | `curl`: `Access-Control-Allow-Origin: apl.cnb.cz` (povoleno jen jiné doméně); prohlížeč: Failed to fetch (`sondy/napojeni.md`) |
| OTE (`ote-cr.cz`), `example.com` | ❌ ne | prohlížeč s originem SharePointu (`sondy/napojeni.md`) |
| jiné webové stránky (scraping HTML) | ❌ očekávej totéž | změřeny jen OTE a `example.com`; obecně weby CORS nemají |

### Neznámé API ověř sám (jen čtení)

Do `Origin` dej adresu **svého** SharePointu (začátek URL webu, např. `https://<tenant>.sharepoint.com`):

```
curl.exe -s -D - -o NUL -H "Origin: https://<tenant>.sharepoint.com" "<URL API>"
```

Ve výpisu hledej `access-control-allow-origin: *` nebo **přesně** svůj origin. Jiná hodnota (např.
`apl.cnb.cz`) nebo žádná = **z appky to nepůjde**. Pro API s klíčem v hlavičce zkus i preflight:

```
curl.exe -s -D - -o NUL -X OPTIONS -H "Origin: https://<tenant>.sharepoint.com" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: authorization" "<URL API>"
```

Na macOS / Linuxu piš `curl` a `-o /dev/null` (`curl.exe` tam není ✅, Copilot to zjistil a přešel sám).
✅ V labu (macOS, `curl` s `-o /dev/null`) dal `curl` u ARES, Open-Meteo a ČNB stejný verdikt jako
skutečný web part v prohlížeči. Zápis pro Windows (`curl.exe`, `NUL`) viz Neověřeno.

Nepoužívej `mode: 'no-cors'` (vrátí prázdnou odpověď) ani veřejné CORS proxy (data a klíče jdou
přes cizí server).

## Krok 2a: API s CORS → volání z web partu ✅

```ts
import { HttpClient } from '@microsoft/sp-http';

interface IFirma { ico: string; obchodniJmeno: string; sidlo?: { textovaAdresa?: string } }

// ARES: firma podle IČO
private async _firma(ico: string): Promise<IFirma> {
  const r = await this.context.httpClient.get(
    `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${encodeURIComponent(ico)}`,
    HttpClient.configurations.v1);
  if (!r.ok) throw new Error(`ARES vrátil ${r.status}`);
  return (await r.json()) as IFirma;
}
```

✅ Přeloženo a spuštěno v appce z šablony první appky (`@microsoft/sp-http` v ní už je): `_firma('00177041')`
vrátilo „Škoda Auto a.s., tř. Václava Klementa 869, Mladá Boleslav II, 29301 Mladá Boleslav“.
Totéž v appce Spokojenost (aktuální šablona `egd-prvni-appka`, 23. 11.): úryvek vložen beze změny, build prošel, tlačítko ARES pod `petra.novakova` → `HOTOVO` ✅ (`sondy/ms-dokumenty/spokojenost-klik.log`). Úryvek nemá vazbu na `IHlas` ani seznam.
Open-Meteo stejně (`https://api.open-meteo.com/v1/forecast?latitude=49.19&longitude=16.61&current=temperature_2m`,
v odpovědi `current.temperature_2m`) ✅.

Na cizí servery používej `this.context.httpClient`. `spHttpClient` je pro SharePoint (přidává
SharePoint hlavičky); na ARES v labu také prošel (200 ✅), ale jiné API ho odmítnout může, takže
na to nespoléhej. API klíč v kódu web partu **není tajný**: kdokoli ho uvidí v prohlížeči (F12).
Pro API s tajným klíčem platí krok 2b.

### Co uvidí uživatel u API bez CORS ✅

Volání skončí výjimkou `TypeError: Failed to fetch` (žádný HTTP status). V F12 → Konzole:

```
Access to fetch at 'https://api.cnb.cz/cnbapi/exrates/daily?lang=CZ' from origin 'https://pavelchocholousgmail.sharepoint.com'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Chybu chyť a řekni ji lidsky (kód, který v labu běžel ✅):

```ts
private async _cnb(): Promise<void> {
  try {
    const r = await this.context.httpClient.get('https://api.cnb.cz/cnbapi/exrates/daily?lang=CZ', HttpClient.configurations.v1);
    this._log(`ČNB status ${r.status}`);
  } catch (e) {
    // Bez CORS prohlížeč odpověď zahodí a fetch skončí výjimkou TypeError („Failed to fetch“).
    throw new Error(`ČNB nejde volat z prohlížeče (CORS). Původní chyba: ${(e as Error).name}: ${(e as Error).message}`);
  }
}
```

Výsledek v appce: `ČNB nejde volat z prohlížeče (CORS). Původní chyba: TypeError: Failed to fetch` ✅.

## Krok 2b: API bez CORS, scraping, tajný klíč → server

Volání ze serveru CORS neřeší. Varianty:

| Varianta | Stav v labu | Pro | Proti | Co chce IT E.ON | Citizen developer |
|---|---|---|---|---|---|
| **A: přímo z prohlížeče** (jen zdroje s CORS) | ✅ ARES, Open-Meteo | nic navíc | jen zdroje s CORS; klíč není tajný | nic | snadné |
| **Ruční data**: Excel → SharePoint seznam, appka čte seznam | ✅ appka čte seznam (`egd-prvni-appka`) | bez serveru a licencí | ruční aktualizace | nic | snadné |
| **Azure Container Apps Job** (skript stáhne data, uloží / pošle) | ✅ ČNB staženo z Jobu a posláno mailem (`tools/napojeni-report-job.py`, `sondy/napojeni.md`); zápis do seznamu ❓ | libovolný zdroj, tajné klíče, plán | server a identita; cena odhadem jednotky USD/měs. (❓ odhad, `sondy/napojeni.md`) | subscription, identita Jobu, `Sites.Selected` na jeden web | těžké, dělá IT/vývojář |
| **Power Automate** s akcí HTTP | ❌ bez Premium nejde zapnout: 403 `MissingAdequateQuotaPolicy`, hláška výslovně chce Power Automate Premium ✅ (`sondy/power-automate/vystupy/diag-409.txt`) | bez kódu | akce HTTP je Premium ✅ | licence Premium nebo PAYG | střední |

Vzor pro appku: **server zapisuje do SharePoint seznamu, appka čte seznam** (žádné volání appka →
server, žádný `AadHttpClient`). Čtení seznamu z appky ✅; samotný zápis Jobu do seznamu přes
`Sites.Selected` ❓ (viz Neověřeno).

Doporučení pro workshop: když zdroj nemá CORS, řekni to uživateli rovnou, dej větu pro IT
a pokračuj se zdrojem s CORS (ARES, Open-Meteo) nebo s daty nahranými ručně do seznamu.

## Ověření (vždy)

1. Před kódem: test T1–T3 ukazuje CORS hlavičku `*` nebo tvůj origin.
2. Po nasazení: uživatel v appce načte data. V F12 → Konzole: žádné „blocked by CORS policy“.
3. Chyba „Failed to fetch“ = CORS nebo síť; `curl.exe` z téhož počítače rozliší, co z toho
   (`curl` projde a hlavička chybí → CORS; `curl` neprojde → síť/proxy).

**Věta pro IT (ServiceNow):** „Pro aplikaci na webu <web> potřebujeme pravidelně stahovat data
z <zdroj/URL>. Zdroj nepovoluje volání z prohlížeče (CORS), proto prosím o Azure prostředek
(Container Apps Job) s identitou, která smí zapisovat jen do seznamu <seznam> na webu <web>
(Microsoft Graph `Sites.Selected` s právem zápisu na tento web), nebo o licenci Power Automate
Premium pro jeden flow. Jde o čtení veřejných dat.“

Pozor: zápis identity se `Sites.Selected` do seznamu jsme v labu neověřili ❓ (viz Neověřeno); licence
Premium pro akci HTTP je ověřená ✅.

## Neověřeno

| Tvrzení | Proč neověřeno | Jak a kde ověřit |
|---|---|---|
| Postup `curl.exe … -o NUL` a `Invoke-WebRequest` ve Windows PowerShellu 5.1 | lab je macOS (`curl -o /dev/null` ✅, PowerShell 7.5 ✅) | na stroji účastníka v PowerShellu (`curl.exe`, ne alias `curl`) |
| Firemní proxy / Zscaler E.ON blokuje cizí API i s CORS | jen ze sítě E.ON | první `curl.exe` a klik v appce z počítače účastníka |
| Content Security Policy tenantu E.ON omezí `fetch` na cizí domény | v labu se neprojevila (ARES i Open-Meteo prošly); nastavení E.ON neznáme | klik na ARES v appce na pilotním webu E.ON, F12 → Konzole („Content Security Policy“) |
| Proč se flow „Recurrence + HTTP“ nezapne s 409 `CannotStartUnpublishedSolutionFlow` (a ne s 403 o licenci) | stejný 409 má i flow s Request triggerem bez akce HTTP; příčina neznámá (`sondy/power-automate/vystupy/diag-409.txt` ř. 12, 18) | netřeba pro workshop: licence Premium pro HTTP je ✅ z 403. Ověřit v portálu make.powerautomate.com otevřením a uložením flow |
| Akce HTTP nemá tier v API | `tools/pa-flow.py tiers` ukáže jen `type: Http` ✅; konektory „HTTP with Microsoft Entra ID“ jsou Premium ✅ (`sondy/power-automate/vystupy/katalog-konektoru-tier.txt` ř. 1324–1325) | — |
| Job zapisuje do SharePoint seznamu přes `Sites.Selected` | vyžaduje novou identitu (nebo udělit roli existující) a grant na web v Entra; to je trvalá změna oprávnění v labu a chce Pavlovo ano | identita (managed identity Jobu nebo app registrace) + Graph aplikační `Sites.Selected` + `POST /sites/{id}/permissions` (role `write`) + `POST /sites/{id}/lists/{seznam}/items` tokenem identity; očekávat 201 a 403 na jiný web |
| Jiné API než ARES odmítne `spHttpClient` | změřen jen ARES (200) | netřeba: doporučení je `httpClient` |

## Zdroje

`sondy/ms-dokumenty/README.md` (web part, konzole, curl), `sondy/napojeni.md` (Sonda 1 CORS, Sonda 2 Job),
`sondy/power-automate.md` (HTTP a Premium), `tools/napojeni-cors-probe.mjs` (CORS z originu SharePointu),
`tools/spo-webpart-konzole.mjs` (chyby z F12 při kliku v web partu).
