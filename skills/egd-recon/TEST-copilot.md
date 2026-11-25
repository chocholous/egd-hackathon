# Test skillu egd-recon na GitHub Copilot CLI (24. 11. 2026)

Tester: session miniskilly. Ke spuštění `tools/copilot-run.sh` (izolovaný `HOME` a `COPILOT_HOME`, `copilot -p` s `--allow-all-tools --allow-all-paths`).

**Prostředí:**
- nainstalované skilly `egd-pripravenost` a `egd-recon`;
- model zvolil Copilot sám (Fusion: GPT-6 Luna, v běhu 2 MAI Code 2 Flash);
- lab `pavelchocholousgmail`;
- CLI for Microsoft 365 11.11.0 jako APFS klon v `node_modules` pracovní složky;
- přihlášení: kopie token cache labu (`--m365-from`), nebo žádné.

## Výsledek: ✅

| Běh | Zadání | Co Copilot udělal | Výsledek |
|---|---|---|---|
| 1 | „v přípravě mi svítí červeně“, `egd-sonda-miniskilly`, přihlášen | `skill(egd-recon)`, přečetl `recon.mjs`, spustil ho s `--web` | ✅ „Na webu nic nechybí, IT žádat nemusíš“. Scope, katalog i nahrávání jsou správně. 0,42 AI credits. |
| 2 | „nejde nahrát balíček“, `mcplabdocs` | spustil recon s `--out recon.md` | ✅ „Blokuje to SharePoint: web nemá vlastní katalog“. Větu pro IT přeformuloval a adresu webu i název katalogu v ní nechal. 0,17 AI credits. |
| 3 | „AADSTS65001“, nepřihlášen | recon (rc 1, Copilot ukáže „Failed“) | ✅ Určil vrstvu Entra a dal větu o souhlasu správce s rolí na webu. Neuvedl náhradní cestu A3 / A2 (doplněno do kroku 3 skillu). 0,31 AI credits. |
| 1b | jako 1, po úpravě SKILL.md | recon, pak `zapis --klic recon-egd-sonda-miniskilly --stav zelena` | ✅ Použil nový klíč i stav ze skillu a dodal, že výsledek platí jen pro přihlášený účet. 0,6 AI credits. |

Ve všech bězích: `Changes +0 -0`, tedy žádná úprava skillu. Přihlášení nespouštěl, do SharePointu nic nezapsal.

## Rozdíly Copilot vs Claude

| Oblast | Claude ([TEST.md](TEST.md)) | Copilot | Dopad |
|---|---|---|---|
| Krok 3 (`zapis`) | dělal vždy | v bězích 1–3 vynechal, v běhu 1b (po úpravě) udělal | ✅ po úpravě |
| Věta pro IT | doslova z reconu | přeformuluje | skill teď říká, co v ní musí zůstat |
| „Vše zelené, ale uživatel vidí červenou“ | sám poradil vrátit se k `sharepoint --web` | v 1b ne, jen „nic neblokuje“ | ❌ drobnost, viz níže |
| Rozsah čtení | jen SKILL.md a skript | čte `recon.mjs`. V 1b prohledal `~` na `.pripravenost` (288 souborů). | zdržení ~6 s, neškodné |
| Návratový kód 1 | bere jako očekávaný | zobrazí „Failed“, ale vyloží správně | kosmetika |

## Nalezeno, neopraveno

- V běhu 1b Copilot nevyužil nový bod „Nic neblokuje → vrať se do `egd-pripravenost`“. Odpověď je přesto správná a
  bezpečná. Uživatel by se musel doptat, kde je ta červená. Návrh: lektor na workshopu říká „pošli agentovi i řádek,
  který svítí“.

## Důkazy

`test-dukazy/copilot/`:
- `<běh>.log.txt` (stdout Copilota) a `<běh>.prepis.md` (`--share`);
- `copilot-mcplab.recon.md`.

Názvy běhů: `copilot-prihlasen`, `copilot-mcplab`, `copilot-neprihlasen`, `copilot-prihlasen-2` (= 1b).
gitleaks: no leaks found.

## Neověřeno

Stejné jako v [TEST.md](TEST.md):
- ✅ větev „chybí role“ doměřena skriptem pod `jakub.kucera` ([test-dukazy/jakub-postup.md](test-dukazy/jakub-postup.md)); ❓ Copilot sám pod Jakubem nespuštěn, ❓ větev „chybí scope“;
- ❓ VS Code agent mode a Windows;
- ⛔ tenant E.ON.
