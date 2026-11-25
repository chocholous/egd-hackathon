# Sonda: PDF a mail jedním tlačítkem (otázka 6.2, 24. 11. 2026)

Session ms-maily (stav `ms-pdf-mail`). Výsledek je zapsaný ve skillu
[egd-maily § Jedno tlačítko: vygeneruj PDF a pošli mailem](../../skills/egd-maily/SKILL.md).

**Závěr:** ✅ Jedno kliknutí v SPFx appce vyrobí PDF v prohlížeči (`egd-dokumenty`) a pošle ho jako přílohu
přes Graph `/me/sendMail` (`egd-maily`). Mail dorazil a PDF jde otevřít, a to v obou variantách.

## Jak to proběhlo

1. **Projekt.** Zdroje appky Spokojenost jsem zkopíroval z `sondy/ms-dokumenty/appka-spokojenost` a dal jim nové GUIDy
   řešení, feature i web partu a název `appka-pdf-mail`. `node_modules` vznikly APFS klonem (`cp -c -R`) ze
   `sondy/container-app/libreoffice/spfx/node_modules` (SPFx 1.23.2). `npm install` pak doplnil rozdíl na 1.24.1:
   +251, −76, ~112 balíčků za 23 s (`npm-install.log`). Nakonec proběhl `tools/apfs-dedupe.py` (59 164 souborů sloučeno).
2. **Build.** `appka.mjs build` ✅ vyrobil `appka-pdf-mail.sppkg` (991 666 B), viz `build.out`.
3. **Font.** `Roboto-Regular.ttf` jsem nahrál do `Sdilene dokumenty/assets` na `egd-sonda-ms-maily` přes `tools/lab-m365.sh`
   (`font-upload.log`).
4. **Nasazení.** `appka.mjs nasadit` šel nejdřív jako plán (rc 10), pak s `--ano` ✅ (`nasadit.log`). CLI bylo globální
   m365 v11.11.0 (`--cli /opt/homebrew/lib/node_modules/@pnp/cli-microsoft365/dist/index.js`) s `HOME=~/.m365-osobni`.
   Zapisoval se jen katalog webu `egd-sonda-ms-maily` a stránka `pdf-mail.aspx`.
5. **Klik** jako Tomáš v headless Chrome, adresátka Eva:

| Varianta | sendMail | Doručeno | Kontrola souboru |
|---|---|---|---|
| A pdf-lib + font | 202, 1,6 s od kliku (`klik-pdflib.log`) | `spokojenost-2026-11-24.pdf`, 8 099 B | `%PDF-1.7`, Roboto vložený, text s diakritikou (`pdf-kontrola.log`, `nahled-pdflib-1.png`) |
| B Word → PDF přes Graph | 202, 2,6 s od kliku (`klik-graphpdf.log`) | `spokojenost-word-2026-11-24.pdf`, 61 933 B | `%PDF-1.7`, Creator Microsoft Word (`nahled-graph-1.png`) |

Doručení a přílohy jsem ověřil Graphem pod Evou (`doruceni.log`); PDF uložená tak, jak přišla: `prijato-*.pdf`.
Obě zprávy jsou v Odeslaných u Tomáše (`odeslane.log`). Obrazovky appky po odeslání: `klik-pdflib.png`, `klik-graphpdf.png`.
Kód web partu: `SpokojenostWebPart.ts`, oprávnění: `package-solution.json` (`Files.Read.All` + `Mail.Send`).

## Varianta C1: SPFx → Container App LibreOffice → mail ✅ (24. 11., druhý běh)

Balíček `appka-pdf-mail` 1.0.0.1 přidal tlačítko „PDF přes LibreOffice a poslat mailem“.
- **Co dělá:** Word se vyrobí v prohlížeči (`docx`), pošle se přes `AadHttpClient` na stávající `ca-egd-dokumenty`
  (`POST /api/pdf?ext=docx`) a vrácené PDF jde přílohou přes `_posliMail`. V Azure jsem nic nového nezaložil.
- **Konfigurace:** URL a appId API leží v knihovně webu v `assets/prevod-api.json` (kopie zde `prevod-api.json`, nahrání
  `config-upload.log`). Hodnoty jsou z `az containerapp show`.
- **Build a nasazení:** `build-c1.out`, `nasadit-c1.log`.
- **Projekt:** složka `appka` vrácená z koše a po běhu do koše znovu přesunutá.

| Měření | Výsledek | Důkaz |
|---|---|---|
| studený start (0 replik před klikem) | převod 35,0 s (server 1,1 s), sendMail 202 za 35,5 s od kliku | `klik-lo-studeny.log`, `klik-lo-studeny.png` |
| teplý (1 replika), 2 kliky | převod 1,58 / 1,55 s (server 1,09 / 1,07 s), 202 za 2,04 / 1,99 s | `klik-lo-teply.log` |
| doručení Evě | 3× `spokojenost-lo-2026-11-24.pdf`, 18 297 B, `%PDF-1.6` | `doruceni-lo.log` |
| PDF jde otevřít | Producer LibreOffice 7.4, Liberation Serif vložený, text s diakritikou | `pdf-kontrola-lo.log`, `nahled-lo-1.png`, `prijato-spokojenost-lo-2026-11-24.pdf` |

Při prvním pokusu o studený klik se ještě načetl starý bundle a tlačítko se nenašlo (log v `klik-lo-studeny.log`).
Container App se tehdy nevolala a zůstala na 0 replikách, druhý pokus o 1,5 min později už měřil studený start.

## Úpravy nástrojů

`tools/maily-spo-klik.mjs` má nově:

- **`--pole SELEKTOR`:** vyplní adresáta do pole.
- **`--vysledek SELEKTOR`:** vypíše text výsledku v UI.
- **`--konzole REGEX`:** vypíše zprávy konzole stránky odpovídající regexu (časy převodu `[c1]`).
- **Hledání `playwright-core`:** v `PLAYWRIGHT_CORE_DIR`, pak ve staré cestě, pak v globálním `@playwright/cli`. Původní cesta
  `sondy/dokumenty/node_modules` mezitím zmizela.

## Objekty v labu (`/sites/egd-sonda-ms-maily`)

- **Katalog webu:** `appka-pdf-mail.sppkg` 1.0.0.1.
- **Stránka:** `SitePages/pdf-mail.aspx`.
- **Knihovna Dokumenty:**
  - `assets/Roboto-Regular.ttf`, `assets/prevod-api.json`;
  - `exporty/spokojenost.docx` (zápis varianty B).
- **Maily:** 5 ve schránce Evy (2× A/B, 3× C1), tolik i v Odeslaných Tomáše.

Dočasný projekt (1,2 GB s `node_modules`) jsem po běhu přesunul do koše (`/usr/bin/trash`).
