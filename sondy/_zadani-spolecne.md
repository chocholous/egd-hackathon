# Společné zadání sond (pro agenty)

Nadřazená pravidla (kánon, tři zásady, role, paralelní práce) jsou v [../CLAUDE.md](../CLAUDE.md); tenhle soubor je jen doplněk pro sondy a v případě rozporu platí CLAUDE.md. Paralelní práci dnes dělají samostatné sessions (ne subagenti); sondu zadává a její soubory vlastní role podle [../prehled/role.md](../prehled/role.md).

Cíl: pro každý požadavek Tomáše Galíka (EG.D) najít cesty, jak ho SharePoint appka (SPFx web part nad SharePoint seznamy) splní, a porovnat je.

Tři patra řešení, která se vždy porovnávají:
- A) Jen SharePoint + SPFx + standardní M365 (bez Azure, bez Premium licencí) — to EG.D chce nejvíc (Galík: „bez Azure hostingu a bez per-user licencí“).
- B) Power Platform: Power Automate (standard / Premium / pay-as-you-go), AI Builder, Copilot Studio, Power Apps.
- C) Vlastní server v Azure (Container Apps / Functions), který SPFx volá přes AadHttpClient tokenem uživatele (vzor změřený v ~/Projects/ppf-rooms: docs/obo.md, docs/prava.md, container/, lab/README.md, docs/power-automate.md).

U každé cesty: funguje? (✅ změřeno v labu s odkazem na důkaz / 📘 dokumentace s odkazem / ❓ neověřeno; 📘 a ❓ jsou jen **mezistav**, ne závěr, a doporučení na nich nestojí; co v labu ověřit nejde, patří do sekce „Neověřeno“ s důvodem a návrhem, jak a kde to ověřit), co potřebuje od IT E.ON (licence, admin consent pro webApiPermissionRequests, app registrace, subscription), přibližná cena, a jak těžké je to pro vibecodera s agentem.

Lab (jediné místo pro sondy; do PPF ani E.ON nic nezapisovat):
- M365 tenant pavelchocholousgmail.onmicrosoft.com (972a674c-7b85-4e56-a31f-b2f95b42fd1e), SharePoint https://pavelchocholousgmail.sharepoint.com, licence M365 E5 (`SPE_E5`, **trial končí 25. 11. 2026 v 04:04, Business Premium + Copilot v 09:31**; počty licencí viz 03-lab.md) a Flow Free (viz [../03-lab.md](../03-lab.md)); Power Automate: v labu měřené konektory jsou Standard a Premium (tier z API prostředí), že E5 dává „jen standardní konektory“, je 📘 – měření je v [power-automate.md](power-automate.md).
- m365 CLI: VŽDY `HOME=~/.m365-osobni m365 ...` (bez toho míří na PPF!). Appka CLI nemá consent na Graph uživatele ani `m365 pp/flow` (chyba `AADSTS65001` je v [../03-lab.md](../03-lab.md) ř. 14 vedena jako ❓: výstup chyby není uložen, ověřit spuštěním a uložit) — pro Graph použij `az rest`. Přečti skill ~/.claude/skills/m365-cli-safe/SKILL.md.
- Azure: VŽDY `--subscription 05a636d8-d8e3-49d2-a450-4b3ff7cc0a13` (lab). Existuje: Container Apps env `ca-ppf-rooms-env` + ACR `acrppfroomsca3lbgs` (rg-ppf-rooms-lab), APIM Consumption `apim-mcp-lab-9365c0` (jako AI gateway **není kandidát**: neumí `llm-token-limit` ani kvótu na klíč; uložení politiky bylo odmítnuto, ✅ výsledek, ale výstup běhu neuložen, viz [ai.md](ai.md)) + Postgres + Key Vault (rg-entra-mcp-lab), Power Platform billing account (copilot-credits-rg; ✅ existuje, ❓ zda je navázaný na prostředí / PAYG). Cizí zdroje NEMĚŇ, jen čti / sdílej env.
- Testovací účty a hesla: ~/Projects/ppf-rooms/lab/lab.secrets.json (hesla nikam nekopíruj).

Pravidla:
- Nové Azure zdroje jen ve vlastní resource group `rg-egd-sonda-<tema>`, tag `ucel=egd-workshop`, přednostně free / consumption / scale-to-zero tarify; strop 10 USD na celou sondu (Pavel schválil celkem ~50 USD na hraní). Placené zdroje, které běží trvale (např. APIM Standard, VM, dedicated plán), NEZAKLÁDAT. Nic nemaž (ani zdroje, ani soubory; soubory jen `/usr/bin/trash`). Na konci vypiš, co jsi vytvořil.
- SharePoint: jen vlastní web `/sites/egd-sonda-<tema>`, pokud ho potřebuješ.
- Flagy CLI vždy z `--help`, knihovny přes context7 / docs, neodhaduj. Shell je zsh na macOS. Nepotlačuj stderr.
- Nic neposílej ven (maily jen na lab účty).
- Model: agent sondy (subagent, případně session spuštěná pro sondu) jen sonnet nebo opus, effort medium, **ne Fable**. Zákaz platí pro sondy; v projektu je Fable výslovně povolen jen na nejasné nebo složité syntézy, a to z hlavní session (viz CLAUDE.md, „Tři zásady“).
- **Postup musí agent v labu opravdu projít** (příkaz, kód, klikací cesta); kontrola syntaxe nestačí. Surový výstup měření ulož do `sondy/<tema>/` a odkaž na něj; ✅ bez uloženého důkazu je jen slib.

Výstup: ~/Projects/egd-workshop/sondy/<tema>.md (česky, lidsky). Na začátku nejdřív **všechny funkční varianty** a až potom doporučení, v tabulce „požadavek → varianty (A/B/C, případně víc, např. CLI / REST / UI) → ověřeno → doporučení“. U každé varianty: co bylo v labu ověřeno, pro a proti, co chce IT E.ON, náročnost pro citizen developera. Nevítězné varianty se nemažou. Neověřené body patří do sekce „Neověřeno“ (důvod + návrh ověření; ⛔ „jen v E.ON“ s postupem, jak ověřit). Kód sond do ~/Projects/egd-workshop/sondy/<tema>/. Vrať stručné shrnutí.

## Doplněno za běhu: znovupoužitelné nástroje

Pravidla projektu jsou v ~/Projects/egd-workshop/CLAUDE.md. Cokoli, co bude potřeba znovu (přihlášení do labu, získání tokenu, deploy SPFx, založení webu, Container App s Easy Auth, …), ulož jako samostatný skript do ~/Projects/egd-workshop/tools/<tema>-<nazev>.(sh|mjs|py) s `--help`. Do tools/README.md NEZAPISUJ (souběžné zápisy) — místo toho je vypiš v sekci „Znovupoužitelné nástroje“ ve svém sondy/<tema>.md; hlavní session je sloučí.

## Hlášení stavu (doplněno)

Hlas průběh jedním řádkem: `~/Projects/egd-workshop/tools/stav.sh <id> planovano|bezi|ceka|hotovo "<název>" -p "<co se děje>"`. Tvoje id: `sonda-<tema>` (např. `sonda-ai`). Volej při každém větším kroku a na konci.
