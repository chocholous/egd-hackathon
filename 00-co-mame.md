# Co máme připravené (stav 2026-11-22 večer)

Tři stavy: **hotové** (dá se použít), **rozpracované** (existuje, ale neúplné nebo neověřené),
**chybí**. Značky u každého řádku: ✅ změřeno v labu · 📘 dokumentace · ❓ neověřeno · ⛔ v labu neověřitelné
(důvod u položky). 📘 a ❓ jsou jen mezistav, na nich nestojí doporučení (kánon v [CLAUDE.md](CLAUDE.md)).
Podrobnosti v odkazech; fakta se tu neduplikují.

Platí pro všechno níž: **všechno je změřené jen na macOS a v lab tenantu** `pavelchocholousgmail`.
Windows a tenant E.ON (⛔) v labu nejsou; návrh ověření je v sekci „Chybí“. Hosté z EG.D v labu zatím
nic nezkoušeli ❓ (neměřeno).

## Hotové

| Co | Kde | Stav a poznámka |
|---|---|---|
| Měření SharePointu (PPF tenant): Custom Script ani PnP.PowerShell nejsou potřeba, appka přes celé okno (`?env=WebView`), brzdou je role na webu katalogu | `~/Projects/ppf-arcade/odpoved-adriane.md`; analýza 70 tvrzení https://claude.ai/artifact/VHtLC7LZcgXvAEtNQAz9AU (počty 35 ověřeno / 12 nepřímo / 17 domněnek / 6 vyvráceno jsou ve výtahu [zdroje/chocholous-net.md](zdroje/chocholous-net.md), samotný artefakt neotevřen) | ✅ měřeno 6. 11. v **PPF tenantu**, **ne v egd labu**; v labu neopakováno ❓ (návrh: nasadit `.sppkg` s `requiresCustomScript: false` na lab web `/sites/noscripttest` s Deny=2, [03](03-lab.md)); viz [04](04-integrace-test-plan.md). ⛔ Windows a tenant E.ON: v labu není Windows ani přístup do E.ON; ověřit v pondělní zkoušce skillu `egd-pripravenost` u účastníků ([02](02-skills-a-kit.md)) |
| Návod SPFx pro tým AILab v EG.D se štítky „v EG.D povoleno / zakázáno / nevíme“ | https://claude.ai/artifact/MA6m5Qwvot9W6t5QRDwoCk (v15, „work in progress“) | 📘 štítky „povoleno / zakázáno“ pocházejí z podkladů EG.D ([01](01-fakta-workshopu.md)), ne z labu. ⛔ „Nevíme“ položky potvrdí jen EG.D / E.ON IT (Adriána, Galík) |
| Obecné SharePoint/SPFx skilly (5, z 5.–6. 11.) | `~/.claude/skills/` → [02](02-skills-a-kit.md), důkazy `spfx-ship/references/verified.md` | ✅ změřeno v labu; jen lokálně, bez gitu; Pavel 10. 11.: „ne 100 %“ |
| **Skilly pro EG.D: 10 složek `skills/egd-*`** (příprava počítače, záchranný recon, první appka, data v seznamech, role, dokumenty, LLM gateway, e-maily, externí API, plánované úlohy) | `skills/` → [02](02-skills-a-kit.md) | každý je napsaný podle sondy v labu (✅ sonda), ale **kód skillů jako celek většinou neběžel** ale prošly zkouškou i v Copilotu: všech 10 má `TEST-copilot.md` ✅ (hloubka různá, viz [02](02-skills-a-kit.md)). Windows a E.ON ⛔ |
| Citizen AI developer kit (devkit) | plugin `ppf-citizen-ai-devkit` na PPF GHE → [02](02-skills-a-kit.md) | ✅ release a tag **v0.8.0** (15. 11. 2026) a kopie pluginu v katalogu `ppf-skills` s `plugin.json` 0.8.0. ⚠ `plugin.json` ve zdrojovém repu (tag `v0.8.0` i `main`) pořád píše 0.7.0, rozpor je rozepsaný v [02](02-skills-a-kit.md); skutečná instalace `/plugin install` neověřena ❓. Funguje v GitHub Copilot CLI jen podle autora kitu (viz řádek Copilot níž) ❓. PPF interní; Windows a jiný tenant ⛔ |
| Lab tenant se SharePointem, katalogem, hosty z EG.D a účty egd01–egd10 | [03](03-lab.md), [08](08-ucty-ucastniku.md) | ✅ stav hostů k 22. 11. (z [03](03-lab.md)): přijali 3 (Galík, friedlova, Smolík), čekají 4 (Urbánek, Mládková, Jač, Tučková, která není účastník), Šebedovská není pozvaná pod vlastní adresou. Z 6 účastníků EG.D tedy přijala pozvánku polovina |
| **Lab účty účastníků egd01–egd10**: 10 účtů, 30 webů DEV/TEST/PROD se site app catalogem, výdejní stránka | [08](08-ucty-ucastniku.md), `tools/lab-ucty-*` | ✅ pod `egd01` a `egd03` ověřeno nahrání a nasazení `.sppkg` do vlastního webu, cizí web 403. ⚠ MFA: každé druhé přihlášení skončí na registraci Authenticatoru (čeká na Pavla v Entra, [08](08-ucty-ucastniku.md)). ⚠ m365 CLI pod účastníkem nejde (AADSTS65001); nasazení přes UI funguje. Licence: viz řádek Trialy |
| Trialy a rozpočet: M365 E5 končí **25. 11. 04:04**, Azure kredit 26. 11. 03:08 | [06](06-azure-inventar.md), [07](07-lab-trial-plan.md) | ✅ zjištěno dotazem. Plán hotový, **čeká na Pavlovo rozhodnutí** (doporučení: nový trial jiného SKU + kontrola „Extend trial“). Licencí je přiděleno 23 z 25, volné 2 |
| SPFx → vlastní server v Azure (Container App / Functions) tokenem uživatele | `~/Projects/ppf-rooms`, [04](04-integrace-test-plan.md), [10](10-container-app.md) | ✅ v ppf-rooms i v egd sondách. 🔀 varianty (sdílená platforma / bez Azure s Power Automate Standard / vlastní server každého; varianta s Power Automate umí HTTP jen s Premium, důkaz `sondy/power-automate/vystupy/diag-409.txt`) s pro a proti a nároky na IT E.ON jsou v [04](04-integrace-test-plan.md) a [10](10-container-app.md). ⛔ E.ON tenant |
| **Všechny sondy k požadavkům Tomáše Galíka** | `sondy/`: [ai](sondy/ai.md), [dokumenty](sondy/dokumenty.md), [napojeni](sondy/napojeni.md), [data-prava](sondy/data-prava.md), [power-automate](sondy/power-automate.md) | ✅ závěry mají měření; ⚠ surové výstupy často neuložené (audit, doplní Ověřovatel sond). **Power Automate:** dokument hotový, ale část běhů čeká na Pavla (přihlášení připojení, rozhodnutí o trialu); akce HTTP se v labu nezapne: 403 `MissingAdequateQuotaPolicy` = licence ✅ (`sondy/power-automate/vystupy/diag-409.txt`); 409 u Request triggeru a Recurrence + HTTP má příčinu ❓; OCR / vision přes PA ✅ doběhlo (`vystupy/behy.txt`, CU25) |
| LLM gateway v Container App (text, OCR, vision, kvóta, audit) | [sondy/ai.md](sondy/ai.md), skill `egd-llm-gateway` | ✅ postavená a změřená v labu (chat 0,9–1,7 s, OCR ~1,2 s). Generování obrázků ❌ kvóta modelů 0. ⚠ studený start ~26 s a první 502 po nasazení (příčina ❓) |
| Rozbor Power Automate (standard vs. Premium) | `~/Projects/ppf-rooms/docs/power-automate.md`, [sondy/power-automate.md](sondy/power-automate.md) | ✅ Recurrence a LLM přes Foundry konektor (Standard) běžely; ✅ HTTP akce vyžaduje Premium (403, viz řádek sond); ❓ SQL a Dataverse (Premium podle tieru z API) se zapnutím nezkoušely; 📘 že E5 dává jen Standard konektory |
| 3 dema ve vizuálu EG.D (statistiky, kalkulačka, podněty) | `~/Projects/egd-vibecoding` | `.sppkg` připravené ✅ existují; kalkulačka nasazená pod `egd01` ([08](08-ucty-ucastniku.md)). Statistiky a podněty: nasazení v labu neověřeno ❓ |

## Rozpracované (běží teď)

| Co | Stav |
|---|---|
| Skill `egd-prvni-appka`: šablona se přepisuje na appku „Spokojenost s prostředím kanceláře“ (1–5 + dashboard) | session skill-prvni-appka běží (`prehled/stav/`). Test běžel jako Global Admin (stav šablony se mění, aktuální stav ve `prehled/stav/skill-prvni-appka.json`); role Člen a Čtenář neotestované; záložní cesty A2 a B nikdo neprošel ([audit](audit/overeni.md)) |
| Skill `egd-pripravenost` | skript a skill změřené na macOS a v labu; verdikt stojí na starší verzi než finální (audit); Windows ⛔ |
| Miniskilly `egd-data-seznamy`, `-prava-role`, `-dokumenty`, `-llm-gateway`, `-maily`, `-externi-api`, `-planovane-ulohy` | napsané podle sond; e2e test `egd-data-seznamy` běží (`prehled/stav/miniskilly.json`, výsledek zatím není), u ostatních kód ve skillech nikdy neběžel jako celek ❓ (audit) |
| Test skillů v GitHub Copilot CLI | tooling hotové (`tools/copilot-run.sh`, `copilot-skill-install.sh`); **všech 10 skillů má `TEST-copilot.md` ✅** (24. 11.), různě hluboké; ❓ VS Code agent mode, Windows ⛔ |
| Trial a licence po 25. 11. | čeká na rozhodnutí Pavla ([07](07-lab-trial-plan.md)) |
| MFA / registrace Authenticatoru pro egd01–10 | čeká na kontrolu Pavla v Entra ([08](08-ucty-ucastniku.md)) |
| GitHub a Copilot pro účastníky | [09](09-github-ucastnici.md): research hotový, 🔀 varianty F (firemní GitHub EG.D) / A (osobní Free) / B–E; stav EG.D licencí ⛔ ověří Adriána |

## Chybí

Ke každé položce: proč nejde teď a jak ověřit.

- **Noty pro EG.D k domácímu úkolu.** Rozhodnuto 22. 11. (`prehled/stav/domaci-ukol.json`): zadání mini appky
  „spokojenost s kanceláří“ v prereq skillu. Zda to Adriána dostala, ❓ ověřit v poště (Odeslané), viz [05](05-otevrene-body.md).
- **Balíček skillů a kitu pro EG.D mimo PPF GHE** a návod pro Windows. Varianty distribuce (ZIP, kopie repa, veřejný GitHub …) s pro a proti:
  [02](02-skills-a-kit.md). Cesta ještě není vybrána ani zkoušena mimo PPF ❓.
- **Cokoli změřené na Windows (PowerShell 5.1, bez admina, proxy) a skill v Copilot CLI.** Copilot CLI: ✅ běh každého skillu je v `skills/*/TEST-copilot.md`; ❓ zůstává VS Code agent mode a hlubší průchody (viz jednotlivé soubory). Windows: ⛔ v labu není Windows ani proxy EG.D.
  Návrh: Windows VM s účtem bez admina, projít `egd-pripravenost` a `egd-prvni-appka`; jinak v pondělní zkoušce u účastníků.
- **Cokoli v tenantu E.ON** (App catalog, schválení API, `m365 login`, síť, SHO-5032). ⛔ tenant E.ON nemáme a nezapisujeme
  do něj. Návrh: dotaz na Galíka / IT E.ON, nebo hosté z EG.D měřící přes `egd-pripravenost`.
- **Hosté z EG.D v labu** (práva Visitors, nasazení, tvorba stránek). Neměřeno ❓. Návrh: zkušební host (např. `chocholous@ppf.cz`) s rolí Visitors / Member na DEV webu; viz [05](05-otevrene-body.md).
- **Porovnání s jejich AI Engineering Library** (`skills-download.zip`). Rozbor je hotový 24. 11. ✅ (117 skillů, přečteno celé): návrhy převzetí jsou v [prehled/epl-navrhy.html](prehled/epl-navrhy.html), písma E.ON Head v [zdroje/eon-fonty/](zdroje/eon-fonty/README.md). Obsah knihovny se do repa nekopíruje (bez licence). Rozhodnutí o převzetí čeká na Pavla ❓.
- **Účet chocholous@ppf.cz:** claude.ai artefakty a cloud sessions z toho účtu („EON skill citizen AI developer“,
  „Školící artefakt“, „Citizen AI Developer Onboarding“) nejsou prošlé; žádná session k nim nemá nástroj (jiný účet než v této aplikaci).
  Návrh: Pavel (nebo session s Chrome MCP přihlášenou na ten účet) otevře jejich seznam a výtah zapíše do `zdroje/`. Zatím ❓.
- **Claude.ai chaty a projekty na obou účtech** (chocholous.net, chocholous@ppf.cz): lokálně nejsou, nástroj k nim žádná session nemá.
  Návrh: projít v prohlížeči (Chrome MCP, účet přepnout ručně) a výtah zapsat do `zdroje/`; Copilot test viz „Rozpracované“.

## Rozcestník k dokumentům 03–10

| Soubor | O čem |
|---|---|
| [03-lab.md](03-lab.md) | lab tenant, weby, hosté, Azure zdroje |
| [04-integrace-test-plan.md](04-integrace-test-plan.md) | co je změřené u napojení a gateway, kde to v EG.D narazí |
| [05-otevrene-body.md](05-otevrene-body.md) | co zbývá do středy |
| [06-azure-inventar.md](06-azure-inventar.md) | Azure a M365 v labu: co kdy vyprší, náklady |
| [07-lab-trial-plan.md](07-lab-trial-plan.md) | jak lab přežije konec trialů (varianty, kroky pro Pavla) |
| [08-ucty-ucastniku.md](08-ucty-ucastniku.md) | účty egd01–egd10, weby, výdej, MFA, úklid |
| [09-github-ucastnici.md](09-github-ucastnici.md) | GitHub a Copilot pro účastníky (varianty F, A–E) |
| [10-container-app.md](10-container-app.md) | co řešíme přes vlastní server, požadavky na IT |
| [audit/overeni.md](audit/overeni.md) | audit kánonu; zdroj těchto oprav |

Úplný seznam úkolů: [05-otevrene-body.md](05-otevrene-body.md). Výtah z účtu chocholous.net:
[zdroje/chocholous-net.md](zdroje/chocholous-net.md).
