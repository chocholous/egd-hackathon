# Recon pod běžným uživatelem jakub.kucera (24. 11. 2026)

CLI for Microsoft 365 v11.11.0, `HOME=~/.m365-jakub` (přihlásil Pavel, authType browser, appId 12f19539…, tenant má admin consent AllPrincipals).
`node scripts/recon.mjs --cli /opt/homebrew/lib/node_modules/@pnp/cli-microsoft365/dist/index.js --web <web> --out jakub-<web>.md`

| Web | Role Jakuba | Výsledek reconu |
|---|---|---|
| egd-sonda-miniskilly | Člen | vše zelené, do katalogu smí nahrávat |
| egd09-dev | jen Návštěvník (dočasně přidán do „Návštěvníci webu“, skupina 4, po běhu odebrán, výpis skupiny prázdný) | katalog čte (2 balíčky), **chybí addListItems, editListItems** → žádost o roli Člen/Vlastník |
| egd05-dev | bez skupiny, jen „Omezený přístup“ na webu | katalog čte (0 balíčků), **chybí addListItems, editListItems** → žádost o roli |
| egd-test-vedle-sebe, egd09-dev (před přidáním) | žádný přístup | **„do katalogu webu nevidíš (Attempted to perform an unauthorized operation.)“** → žádost o roli Člen/Vlastník |

Pozn.: odebrání přes `spo group member remove --email` v11 selhalo („Insufficient privileges“, zřejmě dohledání přes Graph); `--userName` prošlo.

## Cesty bez CLI pod Jakubem (24. 11. 2026, odpoledne)

Profil prohlížeče `jakub.kucera` přihlásil Pavel (`tools/lab-profil-prihlaseni.mjs`). Jakub byl na `egd09-dev` dočasně ve skupině
Návštěvníci (id 4); po měření odebrán `--userName`, skupina má 0 členů.

**Práva z prohlížeče** (`scripts/prava-z-prohlizece.mjs`):

| Účet a web | Katalog „Apps for SharePoint“ | add / edit v katalogu | Soubor |
|---|---|---|---|
| jakub, jen Návštěvník, egd09-dev | HTTP 200, High 176 / Low 138612833 | **ne / ne** (maska → „Ctenar (Read)“) | `jakub-prohlizec-navstevnik.txt`, `jakub-maska-navstevnik.txt` |
| jakub, bez přístupu, egd-test-vedle-sebe | **HTTP 403** | – | `jakub-prohlizec-bez-pristupu.txt` |
| pro srovnání egd05 (správce), eva.vesela (Člen) | HTTP 200 | ANO / ANO | `prava-katalog-ucty.md` |

Skript při 403 padal (`Cannot convert undefined to a BigInt`); opraveno, teď vypíše „bez údaje (403 = na web nemáš přístup…)“.
Nadpis 404: `GetList` na neexistující seznam vrátí 404 `File Not Found.` (`jakub-getlist-404.txt`; měřeno na neexistujícím
seznamu, ne na skutečném webu bez katalogu, ten pod Jakubem v labu není).

**Recon bez CLI** (`--cli` na neexistující soubor, prázdné HOME): rc 1, výpis „CLI for Microsoft 365 tu není … pokračuj cestou
A3 … nebo A2“ a adresa `…/_api/web/GetList('<web>/AppCatalog')/EffectiveBasePermissions`. Agent účastníka (Sonnet) z toho sám
zvolil cestu A3 a připravil plán, nic neprovedl.

**Cesta A3 (REST z prohlížeče) jako Návštěvník, egd09-dev** (`jakub-a3.mjs`, `jakub-a3-navstevnik.jsonl`):
- `contextinfo` 200 (digest dostane), `currentuser` 200;
- krok 1 založit seznam: **403 „Access is denied. (Exception from HRESULT: 0x80070005 (E_ACCESSDENIED))“** → dál nejde;
- krok 3 nahrát balíček do `AppCatalog`: **403 „Access denied.“**;
- číst nabídku appek (`AvailableApps`): 200.

**Cesta A2 (ručně) jako Návštěvník, egd09-dev** (`jakub-a2-ui.mjs`, `jakub-a2-navstevnik.jsonl`, snímky `jakub-a2-ui/`):
- Obsah webu: seznamy vidí, **tlačítko „Nový“ chybí** (`A2-1-obsah-webu.png`);
- katalog `AppCatalog` se otevře (klasická stránka, balíčky vidí), tlačítko „Nahrát“ v moderním UI není; klik do klasické
  záložky FILES nezkoušen ❓ (`A2-3-katalog.png`);
- „Přidat aplikaci“ (`_layouts/15/appStore.aspx`): **„You need access … don't have access to this site“ s „Request access“**
  (`A2-4-přidat-appku.png`). Jazyk UI účtu je angličtina.

Závěr: Návštěvník skončí v A3 hned na prvním zápisu (403) a v A2 nevidí „Nový“; obě cesty vedou na stejnou žádost —
role Člen nebo Vlastník na webu. Cesty bez CLI obcházejí jen chybějící CLI / souhlas správce, ne chybějící roli.
