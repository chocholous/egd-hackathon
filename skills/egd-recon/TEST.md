# TEST v Claude: egd-recon (24. 11. 2026)

V roli účastníka byl subagent Claude Sonnet (effort medium). Dostal cesty ke skillům `egd-recon` a `egd-pripravenost`
a zákaz je upravovat, spouštět přihlášení nebo zapisovat do SharePointu.

**Prostředí:**
- macOS, zsh;
- lab `pavelchocholousgmail`;
- CLI for Microsoft 365 11.11.0 jako APFS klon globální instalace v `node_modules` pracovní složky;
- vlastní `HOME` pro každý „počítač účastníka“.

Situace „přihlášen“ dostala kopii token cache labu (účet `pavel.admin`), situace „nepřihlášen“ prázdné `HOME`.

## Výsledek: ✅

| Situace | Co uživatel řekl | Co agent udělal | Výsledek |
|---|---|---|---|
| 1 | „v přípravě mi svítí červeně“, web `egd-sonda-miniskilly`, přihlášen | `recon.mjs --web … --out recon-1.md` (rc 0), `zapis --klic recon --stav zelena` | ✅ Vše pod „Funguje“: scope `AllSites.FullControl`, katalog čte i nahrává. Agent správně řekl, že nic neblokuje a pro IT nic není. |
| 2 | „nejde nahrát balíček“, web `mcplabdocs` | recon (rc 0), `zapis … --stav zluta --it "<věta>"` | ✅ Agent určil vrstvu **SharePoint**: web nemá katalog aplikací. Věta pro IT doslova z reconu. |
| 3 | „AADSTS65001“, CLI nepřihlášené | recon (rc 1), `zapis … --stav cervena --it "<věta>"`, `zprava` | ✅ Agent určil vrstvu **Entra** a dal větu o souhlasu správce a náhradní cestu A3 / A2. Řádek `recon` je ve zprávě `pripravenost-Test-Recon.md`. |

- Přihlášení nespustil a do SharePointu nic nezapsal.
- Soubory skillu neupravoval.
- Nikde se nezastavil a na nic se neptal.

## Co agent vytkl skillu a co se s tím stalo (opraveno v SKILL.md)

1. Neví, co dělat, když recon vyjde celý zelený a uživatel přitom vidí červenou. **Doplněno:** „Nic neblokuje“ odkazuje
   zpět na `prihlaseni` a `sharepoint --web`, ať se řeší konkrétní řádek `[CERVENA]`.
2. Krok 1 měl jen cestu s `\` (Windows). Na macOS musel hádat. **Doplněno:** obě formy, co je `<cesta>` a volba `--cli`.
3. Krok 3 nabízel jen `--stav zluta|cervena`, chyběl `--it` a nebylo jasné, kdy jaký stav použít. **Doplněno:**
   - `zelena` / `zluta` / `cervena` s významem;
   - `--it`;
   - `zprava` k obnovení zprávy (samotný `zapis` zprávu nepřepíše, ověřeno);
   - klíč `recon-<web>` pro víc webů (dva zápisy se stejným klíčem se přepsaly, ověřeno ve `vysledky-prihlasen.json`).
4. Rozbitý text „Výstupy:, …“ a „viz.“ bez odkazu v části „Co je ověřeno“. **Opraveno**, odkazy vedou do `test-dukazy/`.
5. Kód 0 i při „Blokováno“. **Doplněno do skillu:** rozhoduje část „Blokováno“, ne návratový kód. Skript jsem neměnil.

Neopraveno (poznámka): věta pro IT při nepřihlášeném CLI žádá zároveň souhlas správce i roli na webu. Roli
recon v té chvíli ověřit nemůže. Je to úmysl (jedna zpráva IT místo dvou), proto je to ponechané.

## Důkazy

- `test-dukazy/claude/recon-1.md`, `recon-2.md`, `recon-3.md`: výstupy reconu ze tří situací.
- `test-dukazy/claude/pripravenost-Test-Recon.md`: zpráva přípravy s řádkem `recon` (situace 3, po `zprava`).
- `test-dukazy/claude/vysledky-prihlasen.json`: zápis situace 2 přepsal situaci 1 (stejný klíč).
- Kontrolní běh testera před agentem (stejné prostředí, také `egd05-dev` a `egd-test-vedle-sebe`): vše zelené pod `pavel.admin`.

## Neověřeno

- ✅ **Doměřeno (24. 11. odpoledne), cesty bez CLI pod `jakub.kucera`:**
  - agent Sonnet bez CLI dostal od reconu cestu A3 a zvolil ji;
  - Návštěvník v A3 dostane 403 na prvním zápisu a v A2 chybí „Nový“;
  - podrobně v `test-dukazy/jakub-postup.md`.

  Nález agenta: recon radil `prava-z-prohlizece.mjs`, který funguje jen na labovém Macu. Opraveno: recon vypíše adresu
  `GetList(…/AppCatalog)/EffectiveBasePermissions` a odkáže na `pripravenost.mjs maska`.

- ✅ **Doměřeno později (24. 11.):** větev „chybí role“ pod `jakub.kucera` (Návštěvník / bez přístupu), viz
  [test-dukazy/jakub-postup.md](test-dukazy/jakub-postup.md). Zůstává ❓ jen větev „chybí scope“, protože appka má v labu souhlas se všemi scopy.
- ~~❓ Větve „chybí role“ a „chybí scope“ ve skriptu pod účtem bez práv.~~ (původní poznámka)
  - Proč: CLI je přihlášené jen jako `pavel.admin` a ten je správce všude, takže na žádném webu labu nevyjde 403.
  - Účastnický účet (např. `jakub.kucera`, jen Člen) by do CLI musel přihlásit Pavel, ve vlastním `HOME`.
  - Návrh: Pavel spustí `HOME=<nový> m365 login --authType deviceCode` jako jakub. Potom `recon.mjs` na webu, kde je jakub jen Návštěvník.
- ❓ Windows / PowerShell 5.1 neměřeno.
- ⛔ Tenant E.ON (skutečné AADSTS65001, `sharepoint@eon.com`).
