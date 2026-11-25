# Vlastník webu bez admin rolí (účet egd01, web egd01-test) – měřeno 24. 11. 2026

Účet `egd01` je vlastník site collection `egd01-test` (`IsSiteAdmin: true`), nemá žádnou roli v tenantu.
Měřeno přes REST z přihlášeného prohlížeče (`tools/overeni-site-owner.mjs`, těla v `telo/`). Bez CLI.

| # | Co | Výsledek | Důkaz |
|---|---|---|---|
| 1 | Nahrání `.sppkg` do site katalogu (REST) a `Deploy` | ✅ upload 200 (0,9 s), Deploy 200 (2,9 s), `Deployed: true` | `01-sppkg-nahrani-nasazeni-2026-11-24.json` |
| 2 | Balíček s `webApiPermissionRequests` bez schválení | ✅ nahraje se i nasadí bez chyby (`No errors.`, `AadPermissions` vyplněno). Vlastník nedostane žádné upozornění; tenant admin API je pro něj 403. Ve frontě tenantu čeká požadavek `Test.Probe` → i site katalog zakládá tenantní požadavky. Chování web partu za běhu bez schválení: ❓ neměřeno | `02-*`, `03-tenant-pozadavky-po-nahrani-2026-11-24.txt` |
| 3 | Seznam + sloupec + položka, stránka | ✅ seznam 201, sloupec 201, položka 201; stránka přes `/_api/sitepages/pages` 201 + publish 200 | `04-seznam-stranka-role-2026-11-24.json` |
| 4 | Role na seznamu: `breakroleinheritance`, přidání skupiny, `resetroleinheritance` | ✅ 200 / 200 / 200 (Contribute přidáno i odebráno). Po resetu se objevil systémový vedlejší efekt: Limited Access pro Účastník 01 | `04-…`, `05-role-detail-2026-11-24.json` |
| 5 | Graph PDF pod tokenem egd01 | ✅ s `Files.ReadWrite.All`: docx 56 937 B/1 str., xlsx 218 187 B/2 str., pptx 263 132 B/3 str., 1–1,4 s. `Files.Read.All`: převod existujícího souboru 200, nahrání 403. `Files.Read`: ❌ 403 (hledání webu i převod); `/me/drive` 400 (egd01 nemá OneDrive) | `07-…`, `08-…`, `pdf/` |
| 6 | m365 CLI v11.11 pod egd01 (device code, HOME `~/.m365-egd01`) | ✅ login projde; `spo web get` ✅, `spo list add` ✅ (vznikl seznam `OverEni-cli-egd01`), `spo app add --appCatalogScope sitecollection` do site katalogu ✅ (soubor přepsán, verze 5), `spo app deploy` ✅ rc=0 (`11-cli-deploy.log`). Pozn.: appka CLI má od 24. 11. tenantový admin consent; „Need admin approval“ pro účastníka bez consentu změřeno dřív pod jakub.kucera (`skills/egd-recon`, politika microsoft-user-default-low) | `10-cli-egd01-2026-11-24.log` |

Pokus o `SP.OAuth.Token/Acquire` (`09-…`) selhal na digestu (403 „security validation“), je neplatný; neměřeno.

## Co zůstalo v labu (egd01-test) – mazat jen po ano Pavla
- Aplikace `prvni-appka` a `egd-overeni-siteowner-probe` v site katalogu (Deployed; jde Retract bez mazání).
- Seznam `OverEni-site-owner` (1 položka), stránka `overeni-site-owner`.
- Dokumenty `overeni-g42df-*` v knihovně dokumentů (nahrané klientem 42df při testu PDF).
- Extra přiřazení „Účastník 01: Limited Access“ na seznamu.
- Seznam `OverEni-cli-egd01` (z CLI), balíček `egd-overeni-siteowner-probe` přepsán CLI (verze 5).
- Scope `Test.Probe` na `egd-overeni-api` a čekající tenantní požadavek `Test.Probe`.

## Poznámka k bodu 6
Appka `m365-cli-spfx-lab` má od 24. 11. dopoledne admin consent pro celý tenant, takže login egd01 projde bez dotazu. Stav „tenant zablokuje“ je změřen dřív pod jakub.kucera („Need admin approval“, politika microsoft-user-default-low, `skills/egd-recon`). V bodě 6 se měří jen to, co egd01 s přihlášeným CLI smí.

## Doplnění dokladů po auditu (24. 11. 2026)
- Identita v prohlížeči: `12-identita-egd01-2026-11-24.json` (LoginName egd01, `IsSiteAdmin: true`).
- `upn` tokenů k 07/08: `13-upn-tokenu-2026-11-24.txt` (všechny tři klienty `egd01@…`, tenant 972a674c…; tokeny znovu vydány, shodné scope jako v 07/08).
- CLI deploy: `11b-cli-app-list-po-deploy-2026-11-24.json` (`spo app list`, obě aplikace `Deployed: true`); `spo app deploy` sám výstup nevypisuje (rc=0 v `11-cli-deploy.log`).
- Pole `unikatni` v `04` a `05` je **neplatné**: čtení `HasUniqueRoleAssignments` v těch během vracelo `false` i po `breakroleinheritance`. Stav rozdělení dědičnosti dokládá seznam `roleassignments` (po breaku jen Účastník 01: Full Control, v `05`). Aktuální hodnota po resetu je `false` (`12-…`), což sedí.
