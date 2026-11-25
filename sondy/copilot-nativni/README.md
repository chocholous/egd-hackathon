# Nativní Copilot v SharePointu bez vlastního kódu

Session copilot-nativni, 24. 11. 2026. Cíl: co SharePoint Online umí s Microsoft 365 Copilotem **bez vlastní appky**, aby šlo
porovnat „nativní Copilot“ a „vlastní appku“ (OBO: [../container-app/obo-copilot.md](../container-app/obo-copilot.md),
[../ms-llm/copilot-graph.md](../ms-llm/copilot-graph.md)). Rešerše dokumentace: [dokumentace.md](dokumentace.md)
(Microsoft Learn + support, 📘, s URL a daty). Měřeno v labu (web `/sites/egd-ukazky`, uživatel **egd10 s trial licencí
M365 Copilot** `BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS`, UI v angličtině; dotazy v češtině). Nic se nepublikovalo,
tenant se neměnil, nic se neplatilo.

Značky: ✅ změřeno v labu · 📘 dokumentace · ❓ neověřeno · ⛔ jen v E.ON (s postupem).

## Tabulka funkcí

| Funkce | Co umí (✅ = vidět v labu) | Licence | Admin | EU / čeština | Stav |
|---|---|---|---|---|---|
| **Copilot v knihovně: otázka nad souborem** (tlačítko Copilot → Ask a question, panel vpravo) | Dotaz „Shrň soubor spokojenost.docx ve 3 větách česky“ → správné české shrnutí (1 hlas, průměr 4 z 5) s odkazem na zdroj `spokojenost.docx` | M365 Copilot na uživatele | po GA nic; Site AI, RCD (📘, [dokumentace.md](dokumentace.md) §8) | čeština ✅ (odpověď česky nad českým docx); EU ❓ | ✅ [knihovna-dotaz](dukazy/knihovna-dotaz/2-odpoved.png) |
| **Porovnání souborů** | „Porovnej spokojenost.docx a spokojenost.xlsx“ → společné (datum, hodnocení 4), rozdíly (Word shrnuje, Excel list Hlasy), s citacemi obou souborů; limit 5 souborů 📘 | M365 Copilot | — | čeština ✅ | ✅ [knihovna-porovnani](dukazy/knihovna-porovnani/2-odpoved.png) |
| **Copilot v seznamu (Lists)** | Panel „Ask a question about Spokojenost“: „Kolik položek je v seznamu a průměrné hodnocení?“ → „1 položka, průměr 4“ (správně) | M365 Copilot | — | čeština ✅ | ✅ [seznam-dotaz](dukazy/seznam-dotaz/2-odpoved.png) |
| **Copilot v editoru stránek** (prompt v panelu „Describe what you’d like to edit“) | Prompt „Napiš úvodní odstavec o spokojenosti zaměstnanců…“ → Copilot vložil odstavec česky do nové stránky (jen koncept, nepublikováno); nabídky „Build out this page from a document or file“, „Create and add new content“ | M365 Copilot | — | čeština ✅; EU ❓ | ✅ [editor-prompt](dukazy/editor-prompt/editor-prompt.png), [prázdný panel](dukazy/editor-s/editor.png) |
| **Copilot Chat (M365 Copilot, Work IQ) nad SharePointem** (`m365.cloud.microsoft/chat`) | „Najdi na SharePointu v knihovně exporty soubor spokojenost.docx a shrň ho…“ → shrnutí česky + karta souboru jako zdroj, účet ukazuje „M365 Copilot (Premium)“, „Credits not in use“ | M365 Copilot | — | čeština ✅ | ✅ [chat-dotaz](dukazy/chat-dotaz/chat-dotaz.png) |
| **Bez licence Copilot** (egd09) | V knihovně **chybí tlačítko Copilot** i ikona agenta v záhlaví | — | — | — | ✅ [bez-licence](dukazy/bez-licence-egd09/knihovna.png) (Chat pod egd09 se nenačetl, ❓) |
| **Výchozí agent webu / knihovny** | Ikona Copilotu v záhlaví SharePointu, plovoucí tlačítko vpravo dole, panel s nápovědami („Which files are relevant to me?“, „Find files about a topic“) | M365 Copilot | Site AI settings vlastníka webu 📘 | ✅ viz výše | ✅ [panel](dukazy/p7/panel.png) |
| **Create an agent** (Copilot ▾ → Create an agent) | Položka v nabídce **existuje** ([menu](dukazy/menu/menu-copilot.png)). Kliknutí (Playwright: text, element, myš na souřadnice, i s označeným souborem) **nic neotevřelo**, žádný nový panel ani formulář | M365 Copilot; PAYG/Credits 📘 | od 11/2026 přes Agent Builder, `.agent` se ruší (do 3/2027) 📘 | ❓ | ⚠️ nabídka ✅, průchod ❓ → [Neověřeno](#neověřeno) |
| **Sdílení agenta do Teams** | — | — | sdílení agentů v admin center 📘 | ❓ | 📘 nezkoušeno (agenta se nepodařilo vytvořit) |
| **Autofill columns** | V „Add column“ (seznam i knihovna) **není** typ ani volba Autofill; viz [add-column](dukazy/autofill-knihovna/add-column-knihovna.png) | M365 Copilot; Advanced = Credits 📘 | Site AI, usage-based billing 📘 | 📘 jen **anglické soubory** | ❌ v UI tohoto webu nenalezeno (nejspíš jinde, např. v nastavení knihovny / panelu Copilot ❓) |

## Web party (otázka Pavla: „co ty webparty?“)

| Web part | Stav |
|---|---|
| **Agent link** | ✅ je v nabídce web partů webu (`GetClientSideWebParts`, [webparty-seznam.json](dukazy/webparty-seznam.json)). Jen odkaz, který otevře agenta v postranním panelu 📘 |
| **Agent Chat web part** (agent přímo na stránce) | ✅ **v tenantu není** (v seznamu chybí). 📘 Learn: „coming soon“, preview 11/2026, GA 1/2027 |
| Jiný web part s Copilotem (např. „AI web part“) | ✅ není. Jediné nativní AI/analytické: `Model Usage Analytics`, `Topics`… (nejsou Copilot chat). `AI gateway` je náš vlastní |
| **FAQ web part s AI**, vytvoření sekce přes AI | 📘 v overview; v editoru je u každé sekce ikona „Copilot“ vedle „+“ (✅ viditelná na [snímku](dukazy/webpart/webpart-agent.png)) |

## Integrace Copilotu do SPFx (otázka Pavla)

- ✅ **Žádný hotový „Copilot“ komponent pro SPFx nenabízí** ani toolbox (viz výše), ani Learn (📘 Copilot in SharePoint „bez vlastního kódu“).
- ✅ **Copilot API z SPFx** (Retrieval, Chat) už je změřené: Retrieval ze SPFx s licencí ✅ ([../ms-llm/copilot-graph.md](../ms-llm/copilot-graph.md)),
  Chat potřebuje 7 širokých scopů a funguje přes OBO jen pro naši API registraci; **vždy licence Copilot u uživatele**
  ([../container-app/obo-copilot.md](../container-app/obo-copilot.md)). Bez licence 403 / prázdná odpověď.
- ❓ Nezkoumáno: vlastní SPFx komponenta jako plugin/rozšíření samotného Copilotu (declarative agents, Copilot extensibility). Mimo zadání,
  navrhuji samostatnou sondu.
- Praktický závěr: nativní funkce (Copilot panel, agent link) se **do appky nedají vložit jako komponenta**. Buď použít Copilot přímo na stránce/knihovně,
  nebo volat API (licence) / vlastní LLM přes gateway (bez Copilot licence).

## Licence a podmínky, shrnutí

- ✅ Bez licence Copilot (egd09) nativní tlačítko Copilot v knihovně **není**. S licencí (egd10) vše výše funguje hned, bez zapínání adminem v tenantu (nic jsme nezapínali).
- 📘 Copilot in SharePoint je od 30. 9. 2026 GA; denní funkce jsou v licenci, „advanced work“ za Copilot Credits; PAYG „SharePoint agents“ se na něj
  nevztahuje, nelicencovaným uživatelům není dostupný ([dokumentace.md](dokumentace.md)).
- 📘 Copilot Chat zdarma (Entra) nemá agenty nad SharePoint daty bez PAYG. V labu neměřeno (nepovoleno zapínat PAYG).
- ⛔ EU / EU Data Boundary a čeština Autofillu: ověřit v tenantu E.ON/EG.D a v Message Center (primární Learn region neuvádí).

## Doporučení pro EG.D (citizen developer místo vlastní appky)

1. **Má-li uživatel licenci Copilot**: nativní Copilot je nejlevnější cesta pro čtení/shrnutí/porovnání souborů, dotazy nad seznamem a psaní stránek. Žádný kód,
   žádný server, čeština funguje ✅. Odpovídá požadavku „shrnutí / otázky nad dokumenty“, který jsme jinak řešili přes gateway LLM.
2. **Nemá-li licenci**: nativní cesta mizí (✅ egd09), zbývá vlastní appka s gateway LLM (bez Copilotu). Rozhodnutí tedy stojí na **počtu licencí Copilot v EG.D**.
3. **Vlastní appku** zachovat tam, kde je potřeba pevný proces (zápis do seznamu, schvalování, export, role), ne jen „zeptat se nad dokumenty“. Copilot tohle nenahradí.
4. Autofill sloupců a „Create agent“ před workshopem neslibovat, dokud neprojdou v labu (viz Neověřeno).

## Neověřeno

- **Create an agent**: kliknutí na položku nic neotevřelo. Ověřit ručně v profilu egd10 (do 25. 11. 08:31 UTC, jinak v E.ON): Dokumenty → Copilot ▾ → Create an agent. Nový Agent Builder (od poloviny 11/2026) 📘 může běžet mimo SharePoint.
- **Sdílení agenta do Teams** a **Agent Chat web part**: závisí na předchozím bodu, resp. na rolloutu (1/2027).
- **Autofill columns**: UI volbu jsem v „Add column“ nenašel; 📘 existuje a zpracuje jen anglické soubory.
- **Copilot Chat bez licence** (Entra free) a PAYG agenti: neměřeno (PAYG se bez výslovného ano nezapíná).
- EU / EUDB, limit velikosti souboru ❓ ([dokumentace.md](dokumentace.md) §7).

## Nástroje a stopy

- [dotaz.mjs](dotaz.mjs): Copilot panel v knihovně/seznamu (otevře, napíše dotaz, zachytí odpověď); [scenar.mjs](scenar.mjs): scénáře agent / editor / editor-prompt / autofill / webpart / bez-licence / chat-dotaz.
  Obojí běží přes CDP v přihlášeném Chrome profilu (`~/.config/ppf-rooms-lab/profily/e2e-egd10`), nový panel, na konci ho zavře.
- Pasti ⚠️: pole dotazu v panelu je skrytý `textarea` (stín), píše se klikem na souřadnice; `getByText('Edit')` trefí zápatí; po `Edit` na stránce zůstává koncept (zkušební
  stránka `SitePages/copilot-test.aspx` je moje, nepublikovaná, smí se smazat).
- Změny v labu: nová stránka `copilot-test.aspx` (koncept s odstavcem od Copilotu). `Home.aspx` jsem v editoru jen otevřel a zavřel bez uložení.
- Důkazy: [dukazy/](dukazy/) (snímky + `text.txt` s odpověďmi).
