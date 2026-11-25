# TEST v GitHub Copilot CLI: egd-llm-gateway (23. 11. 2026)

Copilot CLI 1.0.114 (`/opt/homebrew/bin/copilot`). Model si vybral sám: Copilot Fusion, GPT-6 Luna.
Spuštěno přes `tools/copilot-run.sh` s izolovaným HOME. V `~/.copilot/skills` byly skilly `egd-llm-gateway`
a `egd-prvni-appka` (instalace: `copilot-prepis/instalace.txt`). Dál `--m365-from ~/.m365-osobni`
(CLI přihlášené jako pavel.admin) a `--timeout 1800`.
Výchozí stav: čerstvý projekt `prvni-appka` ze šablony Spokojenost (`appka.mjs novy`, bez AI).
Solution je přejmenované na `prvni-appka-copilot`, aby nepřepsalo jiný balíček v katalogu webu.
Web `https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-llm`, gateway lab beze změny,
`Gateway.Use` je v tenantu už udělený.

Prompt (účastník, vše předem, `sondy/ms-llm/copilot-prepis/prompt.txt`): přidat tlačítko „shrň
dnešní spokojenost jednou větou“ a tlačítko „přečti text ze souboru (PDF/obrázek)“. Hodnoty gateway
od IT (URL, appId API, klíč `demo`). Postavit, nasadit na stránku `spokojenost-ai-copilot` a nakonec
říct, co změnil, jestli musí někdo něco schválit a jak to ověřit.

## Výsledek: ✅ (1 běh)

| Krok | Výsledek |
|---|---|
| Skill sám načetl | ✅ `● skill(egd-llm-gateway)`; `egd-prvni-appka` nenačetl (viz níže) |
| Kód: `_ai`, `_shrn`, `_ocr` podle skillu (AadHttpClient, `X-App-Id`, žádný klíč) | ✅ `copilot-prepis/zdroj-SpokojenostWebPart.diff` |
| Bez `.finally()` (TS2550 v SPFx 1.24.1) | ✅ použil `.then(ok, err)` ze skillu |
| `webApiPermissionRequests` `Gateway.Use` do `package-solution.json`, verze +1 | ✅ |
| Do AI posílá jen souhrnná čísla, ne jména (pravidlo o osobních údajích) | ✅ počet, průměr, rozložení 1–5 |
| OCR limit 3 MB a zpráva uživateli | ✅ kontrola velikosti před voláním. Vlastní hlášky pro 401/403/502/503 podle tabulky chyb |
| Zapsal, kterou variantu žebříku použil (`README.md` appky) | ✅ „varianta 1: sdílená LLM gateway“ (`copilot-prepis/README-copilota.md`) |
| Vlastní chyba v kódu | dvojí volání `_shrn` v prvním patchi, sám opravil dalším editem (`prepis.md`, patch na ř. 1207) |
| Build | ✅ `npm run build` (první pokus ze špatné složky, ENOENT, pak správně) |
| Nasazení a stránka | ✅ ručně CLI (`spo app add/deploy/install`, `spo page add` SingleWebPartAppPage). Web part na stránku vložil až na druhý pokus (`Invalid section '1'` → `spo page section add`) |
| Zjišťoval stav schválení | `spo serviceprincipal permissionrequest list` visel 30 s, Copilot ho zastavil. Uživateli poctivě napsal „stav se mi nepodařilo potvrdit“ |
| Zpráva uživateli na konci | ✅ co změnil, že `Gateway.Use` musí schválit SharePoint admin, první odpověď 25–30 s, kontrola v F12 (200, token a `X-App-Id`, žádný klíč), že lab gateway bere jen tokeny lab tenantu |
| Ptal se / zastavil se | ne |
| Upravoval soubory skillu | ne |
| **Appka v prohlížeči** (`tools/ai-appka-klik.mjs`, tomas.prochazka) | ✅ „Shrnout dnešek (AI)“ → 200 za 1,5 s, text. „Přečíst soubor (OCR)“ s `ocr-cs.pdf` → 200 za 2,4 s, čeština správně. Bearer token a `X-App-Id: demo` (`sondy/ms-llm/e2e-copilot/`) |
| Nová žádost o API access po nasazení | nevznikla, `Gateway.Use` už v seznamu čeká (`webapi-requests-list-copilot.json`). Souhlasí se skillem |

Cena a čas běhu: 3,03 AI Credits, 5 min 16 s (`usage.json`, `log.txt`).

## Co se změnilo ve skillu po testu

- **Ověření, krok 1:** build a nasazení dělat přes `appka.mjs` ze skillu `egd-prvni-appka`, ne ručně.
  Copilot si druhý skill nenačetl, sestavil stránku sám a sekci dostal až na druhý pokus.
  Výsledek byl správný, ale delší.
- **Schválení `Gateway.Use`:** nový bod „Je už schválené?“. Z CLI to nezjistíš: `permissionrequest list`
  vrací 403 nebo visí, `entra enterpriseapp get` končí „Insufficient privileges“ ✅
  (`sondy/ms-llm/grant-overeni-cli.txt`). Test je klik na „Shrnout“; `AADSTS65001` = požádat IT.
- Neověřeno: řádek „Build a nasazení … s Copilotem“ zúžen na Windows.

## Rozdíly Copilot vs Claude

- Claude (ověřování skillu 22. 11.) stavěl a nasazoval přes `appka.mjs` / `tools/spfx-site-upgrade.sh`.
  Copilot si `egd-prvni-appka` nenačetl a šel přímo CLI s `--help` u každého příkazu.
- Copilot přidal kontroly navíc: 3 MB limit před voláním, typ souboru a vlastní text pro každý stav
  z tabulky chyb. Claude měl ve skillu jen 429 a obecné „vrátila N“.
- Tlačítko kvóty (`_aiGet`) Copilot nepřidal; prompt ho nechtěl.
- Gateway předem nerozehřál (krok 0), jen o 25–30 s čekání řekl uživateli. První klik testera
  trval 1,5 s, protože gateway byla teplá po Claudově testu 1.0.0.3 o pár minut dřív.
- Ani jeden agent sám neověří vykreslení v prohlížeči. Klikání dělá tester (`tools/ai-appka-klik.mjs`,
  teď umí i appku bez našich `id`: šablona „obecna“).

Claude: ověřování ve [SKILL.md](SKILL.md) (důkazy `sondy/ms-llm/`).
