# Fakta o workshopu

## Základní údaje

| | |
|---|---|
| Název | Vibecoding hackathon (v mailech i „vibecoding workshop“) |
| Kdy | středa 25. 11. 2026, 12:30–17:00 |
| Kde | České Budějovice, F. A. Gerstnera 6, místnost A 0488 (prezenčně, nepřespává se — rozhodnutí 18. 11., nízký budget) |
| Organizátorka | Adriána Šebedovská (EG.D; píše i z adresy adriana.friedlova@egd.cz) |
| Účastníci EG.D | **6**: Adriána Šebedovská, Tomáš Galík, Eliška Mládková, Martin Jač, Jan Urbánek, Filip Smolík (stav pozvánek do labu: [03](03-lab.md), sekce „Hosté z EG.D“) |
| Za nás | Pavel (v pozvánce jako chocholous@ppf.cz) |
| Navazuje | část lidí se vidí začátkem prosince v Brně; páteční status meetingy „[Vibecoding pilot]“ 14:00–15:00 (série do 2. 4. 2027) |

## Cíle (Adriána, pozvánka 6. 11.)

- Každý si hands-on vyzkouší tvorbu vlastní appky s AI v prostředí EG.D.
- Zjistit, co v prostředí funguje a kde se narazí (přihlášení, data, integrace, AI funkce), a jak to obejít.
  Co je zatím změřené v labu a co zbývá: [04](04-integrace-test-plan.md), [05](05-otevrene-body.md), sondy v [sondy/](sondy/).
- Hotové appky ukázat managementu jako podklad pro licence a budget na AI citizen development.
- Doladit skills a základní proces tvorby appek v EG.D včetně nasazení na SharePoint.
- Rozhodnout nástroj: GitHub Copilot (licence přes ServiceNow) vs. Claude (v EG.D hůř dostupný). Varianty
  s pro a proti: sekce „Volba nástroje“ níž a [09](09-github-ucastnici.md).

## Harmonogram (pozvánka, aktualizace 18. 11.)

| Čas | Blok |
|---|---|
| 12:30–13:00 | Základy frameworku a skills |
| 13:00–13:30 | První jednoduchá appka **v labu** |
| 13:30–14:00 | Detaily frameworku, řídicí appky (operační data, konfigurační data, přístupy) |
| 14:00–14:15 | Zadání appek a jejich příprava pro framework |
| 14:15–16:00 | Vývoj ve frameworku (+ Power Automate) |
| 16:00–16:30 | Sdílení appek, zjištění, další kroky, finální set skills pro EG.D |
| 16:30–17:00 | Rezerva |

Paralelně: průzkum prostředí E.ON skillem frameworku; Power Automate pro složitější úlohy (OCR,
obrázky, generování, e-maily); externí úlohy (scraping, API); ladění finálního setu skills.

## Očekávané výstupy

1. Ověřený proces od zadání po hotovou appku (licence, přístupy, prostředí), aby ho zvládli i další.
2. Ověřené možnosti prostředí: typy appek, nasazení na SharePoint, volba nástroje (Copilot vs. Claude).
3. Seznam blokerů a otevřených témat.
4. Potřebné skills a připravený set pro EG.D.
5. Ukázkové appky pro management.

Pavel 16. 11.: harmonogram i výstupy OK; část výstupů bude až follow-up.

## Požadované funkce od Tomáše Galíka (11. 11.)

Přesně tohle chtějí vidět jako „jde / nejde“ — páteř technické přípravy (viz [04](04-integrace-test-plan.md)):

1. Databáze včetně editace dat.
2. LLM přes API gateway na projektový/aplikační klíč (OCR, rozpoznání obrázků, generování textu/obrázků).
3. Generování a úprava dokumentů (PDF, Word, PPT, Excel).
4. Víceúrovňová autentizace a práva.
5. Integrace externích zdrojů (API, scraping).
6. Posílání e-mailů s přílohami.
7. Plánované úlohy (např. denní report z externího zdroje → analýza → dokument → e-mail).

Kontext od Galíka (2. 11., mail E.ON SharePoint týmu): cílem je SPFx nad SharePoint listy **bez
Azure hostingu a bez per-user licencí**; plný Azure setup považuje za „heavy“.

Stav jednotlivých funkcí v labu (✅ změřeno, důkazy v odkazované sondě; vše v tenantu E.ON je ⛔ v labu
neověřitelné, viz [04](04-integrace-test-plan.md)):

| # | Funkce | Cesta, která v labu prošla | Bez Azure a bez Premium? | Sonda |
|---|---|---|---|---|
| 1 | Databáze + editace | SharePoint seznam + SPFx ✅ (změřeno do 6000 položek); hranice „kdy už vlastní DB“ je 📘 odhad; vlastní DB (Azure SQL + API) ✅ proběhla | ano (seznam) | [data-prava](sondy/data-prava.md) |
| 2 | LLM přes gateway | vlastní gateway v Container App ✅ (text, OCR, vision); generování obrázků ❌ kvóta modelů 0 | ne: LLM a OCR bez Azure nenalezeno (📘, mezistav) | [ai](sondy/ai.md) |
| 3 | Dokumenty | knihovny v prohlížeči ✅ (+ Graph `?format=pdf`, schválit `Files.Read.All`) | ano | [dokumenty](sondy/dokumenty.md) |
| 4 | Role a práva | SharePoint skupiny + `ReadSecurity` ✅ | ano | [data-prava](sondy/data-prava.md) |
| 5 | Externí zdroje | CORS API přímo z prohlížeče ✅; bez CORS a scraping: server / Job ✅ (⚠ surové logy Jobu uložené nejsou, [napojeni](sondy/napojeni.md)) | jen část | [napojeni](sondy/napojeni.md) |
| 6 | E-maily s přílohou | Graph `sendMail` jménem uživatele ✅ (měřeno přes app registraci s delegovaným tokenem; ze SPFx ❓ nezkoušeno); ze systémové schránky přes Job ✅ | ❓ jménem uživatele jen po ověření ze SPFx a schválení `Mail.Send` | [napojeni](sondy/napojeni.md) |
| 7 | Plánované úlohy | Container Apps Job s cronem ✅; Power Automate Recurrence ✅ jen pro flow bez konektoru (flow s konektory Outlook / SharePoint doběhne až po přihlášení připojení člověkem ❓) | jen Power Automate Standard | [napojeni](sondy/napojeni.md), [power-automate](sondy/power-automate.md) |

## Prostředí EG.D (co víme)

Všechno v této sekci pochází z mailů a podkladů EG.D / E.ON, ne z měření. Tenant E.ON nemáme, takže
výroky o něm jsou ⛔ „v labu neověřitelné“ (ověří Adriána, Galík nebo IT E.ON, případně účastníci skillem `egd-pripravenost`).

- Tenant E.ON (`eonos.sharepoint.com`), tenant ID `b914a242-e718-443b-a47c-6b4c649d8c0a` (z Teams odkazů).
- Testovací weby **AILab-Dev, AILab-Test, AILab-Prod** (M365 Service Catalog); App Catalog + Custom Script
  přes ServiceNow incident (skupina `infosys-all-o365-sharepointonline`). URL webů v mailech nejsou.
- Na AILab-Dev nasazená testovací SPFx appka (Snake; SPFx 1.18.2, portable Node 18, gulp), `.sppkg` ručně.
  ⛔ Zdroj: podklady EG.D, appku nemáme. Naše skilly míří na SPFx 1.24 / Heft, rozdíl a varianty v [02](02-skills-a-kit.md).
- PSGallery blokovaná → PnP.PowerShell nejde ⛔ (tvrzení EG.D). Naše měření: ✅ CLI for M365 11.11.0 běží v egd labu a PnP.PowerShell nebyl potřeba ([04](04-integrace-test-plan.md), řádek o nasazení skriptem); ❓ instalace z npm do projektu bez PSGallery a bez admin práv jako taková v labu nezkoušena (skill `m365-cli-safe`).
  Totéž přes proxy / npm mirror v E.ON ⛔.
- E.ON SharePoint tým (ticket SHO-5032, 12. 11.): SPFx podporováno, site collection app catalog na
  žádost vlastníka, Custom Script dočasně na 24 h přes sharepoint@eon.com, nové weby přes „my IT order“.
  ⛔ Výrok E.ON z ticketu, v labu neověřitelný, platí jen v tenantu E.ON. V labu Custom Script není potřeba
  (✅ [00](00-co-mame.md), první řádek tabulky).
- Před workshopem si má každý podat: licenci GitHub Copilot (schválení T. Richter + vedoucí) a tři
  weby DEV/TEST/PROD s kolegy jako members (Adriána, 18. 11.). Stav 22. 11. (Pavel): weby zřídila Adriána,
  licenci E.ON Copilot a GHE si zařídili sami (zdroj: Pavlův komentář v přehledovém artefaktu z 22. 11., ❓ nedoloženo).
  ⛔ **Neověřeno:** stav licencí, GHE a URL webů ověří jen Adriána / IT EG.D, v labu to zjistit nejde (jen E.ON).
  Návrh ověření: účastník v pondělí spustí prereq skill `egd-pripravenost`, který zkontroluje přihlášení do GHE a Copilota. Dotaz musí padnout dřív, než
  účastníci ověřují přístup (do úterý 24. 11., viz [09](09-github-ucastnici.md)); k 22. 11. není položen ❓.
- Pavel je v tenantu EG.D jen host a stránky se mu „někdy zobrazí, někdy ne“ (6. 11.). ❓ Jen citát z 6. 11.,
  bez pokusu o ověření; týká se bloku „průzkum prostředí E.ON“ (ověřit na místě).

## Obchodní rámec

- Květen 2026 (Pavla Tučková, EG.D): workshop 3 MD × 15 000 Kč = 45 000 Kč; další rozvoj 3 000 Kč/h.
- 16. 10. Vorian (Michal Fibiger) → Galík: konzultace k zavedení citizen AI developmentu, 20 000 Kč/MD,
  max. 7,5 MD (150 000 Kč) do 31. 12. 2026; tři oblasti (technické prostředí, proces, role) → návrh
  pro pilot 2027. EG.D přijalo 21. 10., objednávka dorazila 26. 10.
- Vztah workshopu k té objednávce není v mailech výslovně napsaný.

## Časová osa

| Datum | Událost |
|---|---|
| 11.–12. 5. | Tučková: sladění očekávání, cena workshopu |
| 5.–8. 10. | Galík: blokace „non-dev vibecoding model EG.D“; schůzka 7. 10.; Adriána posílá finalisty soutěže (`Uce cases - finalisti.pptx`, videa na eonos SharePointu) |
| 16.–26. 10. | nabídka Vorian → přijata → objednávka |
| 23. 10. | první status meeting |
| 3. 11. | Digiboard 2.0, ČB, A 0488 |
| 5.–6. 11. | Adriána: test SharePoint app deploy; v noci 5./6. 11. vzniká 5 skillů, lab weby, návod, odpověď Adriáně; 7 pozvánek hostům do labu (6 účastníků pod adresami egd.cz + Pavla Tučková, která není účastník; Šebedovská je pozvaná jen jako friedlova); k 22. 11. přijali 3, čekají 4 ([03](03-lab.md)) |
| 6. 11. | pozvánka na hackathon |
| 10. 11. | Pavel: „set skills = citizen ai developer kit, ještě ne 100 %“; Adriána posílá export AI Engineering Library |
| 11.–12. 11. | Galík: požadované funkce; E.ON SPFx feasibility (SHO-5032); Pavel: Power Automate spíš zvlášť / ve zbylém čase |
| 12.–16. 11. | agenda; Pavel: Copilot se skills funguje (pomaleji než Claude; ❓ Pavlův citát, měření nemáme), Power Automate a LLM gateway „zkoumám v labu“ (výsledky: [sondy/power-automate.md](sondy/power-automate.md), [sondy/ai.md](sondy/ai.md)) |
| 15. 11. | devkit: release a tag v0.8.0 ✅; podle autora kitu funguje i v GitHub Copilot CLI (📘 `docs/vydani-0.8.md` v repu kitu, vlastní běh našich skillů ✅ `skills/*/TEST-copilot.md`); rozpor `plugin.json` 0.7.0 vs. 0.8.0 viz [02](02-skills-a-kit.md) |
| 17. 11. | Pavlova poznámka: „chybí odpověď na domácí úkol“ |
| 18. 11. | Adriána: aktualizovaná pozvánka, žádosti na licence a weby |

## Volba nástroje (Claude vs. GitHub Copilot)

🔀 Víc variant, doporučení až po nich. Změřeno: skilly a devkit jsme zkoušeli v Claude Code ✅ (macOS, lab).
U Copilot CLI je v labu ověřeno jen to, že příkaz `copilot skill list` existuje (CLI 1.0.91,
[skills/egd-pripravenost/TEST.md](skills/egd-pripravenost/TEST.md)) a že balíček `@github/copilot` je v npm
(✅ [sondy/lab-github/npm-copilot-cli.txt](sondy/lab-github/npm-copilot-cli.txt)). Běh našich skillů v Copilotu máme ✅:
tooling (`tools/copilot-run.sh`), všech 10 skillů má `TEST-copilot.md` (různě hluboké; ❓ VS Code agent mode). „Copilot je pomalejší“ je ❓ nezměřeno.

| Varianta | Pro | Proti | Co chce IT E.ON | Náročnost pro citizen developera |
|---|---|---|---|---|
| Claude (Code / Desktop) | všechny skilly a sondy změřené v něm ✅ | v EG.D „hůř dostupný“ (podklady EG.D); licence a schválení ❓ | ⛔ neznámé (ověří Adriána) | ❓ neměřeno |
| GitHub Copilot (CLI / VS Code) | licence přes ServiceNow už se řeší (T. Richter + vedoucí, mail 18. 11.) | běh našich skillů v Copilot CLI ✅ (`skills/*/TEST-copilot.md`, 10 ze 10); ❓ VS Code agent mode; Windows ⛔ | licence a schválení; ⛔ povolení `github.com` / npm ze sítě neznámé | ❓ neměřeno |
| Obojí (skilly funkční v obou) | nezávislost na licenci; cílem workshopu je nástroj rozhodnout | dvojí údržba a test (kánon: skill hotový, až projde v obou) | součet obou | ❓ |

Zálohy bez licence EG.D (firemní GitHub, osobní účet s Copilot Free a další): [09](09-github-ucastnici.md), varianty F, A–E.

