# Otevřené body do středy 25. 11.

Seřazeno podle toho, co blokuje workshop. Stav k 22. 11. 2026 večer. Značky: ✅ změřeno · 📘 dokumentace · ❓ neověřeno ·
⛔ v labu neověřitelné (důvod u položky) · 🔀 víc variant (doporučení až po nich). 📘 a ❓ jsou jen mezistav (kánon v [CLAUDE.md](CLAUDE.md)).
Co už je hotové, je v [00-co-mame.md](00-co-mame.md).

## Musí se stát (blokuje průběh)

0. **Co se stane s labem 25. 11.** M365 E5 trial končí **25. 11. v 04:04**, tedy osm hodin před začátkem workshopu (12:30);
   Azure kredit 26. 11. v 03:08 ✅. Bez zásahu se uživatelé nepřihlásí a SharePoint je jen pro čtení 📘.
   Licence: E5 je přiděleno **23 z 25** (13 původních účtů + egd01–egd10), **volné jsou 2** ✅ ([07](07-lab-trial-plan.md), [08](08-ucty-ucastniku.md)).
   Plán a varianty (prodloužit trial, nový trial jiného SKU, koupit Business Basic) jsou v [07](07-lab-trial-plan.md), **čeká na rozhodnutí Pavla**;
   nejpozději 24. 11. večer. Přehození SKU nebylo zkoušeno ani na jednom účtu ❓.
1. **Domácí úkol pro EG.D** („noty“, jak připravit zadání appek; Adriána čeká od 12./18. 11., Pavlova poznámka 17. 11.; zdrojový mail či poznámku jsem nedohledal ❓, dohledá Ověřovatel v PPF Outlooku / Teams).
   Rozhodnuto 22. 11. (`prehled/stav/domaci-ukol.json`): domácí úkol = zadání mini appky „spokojenost s kanceláří“ (1–5 + dashboard)
   v skillu `egd-pripravenost`. ❓ Zda a kdy to Adriána dostala: ověřit v poště (Odeslané) a Teams.
2. **Jak budou účastníci v bloku „první appka v labu“ (13:00) pracovat.** Hosté z EG.D (neměřeni ❓) by se podle měření na testovacím hostovi `chocholous@ppf.cz` ([07](07-lab-trial-plan.md) P7) dostali na kořen labu (200), ale na `/sites/apps` ne (403) – ✅ nasazovat balíčky nemohou; členství ve „Visitors“ je nedoložené. Účastníků je 6; podle [03](03-lab.md) přijali pozvánku Galík, friedlova (= Šebedovská) a Smolík,
   čekají Urbánek, Mládková, Jač (a Tučková, která není účastník).
   🔀 Varianty:

   | Varianta | Pro | Proti | Co chce IT E.ON | Náročnost pro citizen developera |
   |---|---|---|---|---|
   | **A) lokální lab účty egd01–egd10** | ✅ hotové: účty a 30 webů se site app catalogem; výdejní stránka je ✅ vyrobená, ale zatím **nesdílená** (Share dělá Pavel); pod `egd01` a `egd03` ověřeno nahrání a nasazení `.sppkg`, cizí web 403 ([08](08-ucty-ucastniku.md)); nezávisí na pozvánkách | licence jen díky řešení konce trialu ([07](07-lab-trial-plan.md)); ⚠ asi polovina přihlášení skončí na registraci Authenticatoru (čeká na Pavla v Entra); ⚠ m365 CLI pod účastníkem nejde (AADSTS65001), nasazení jen přes UI; hesla se vydávají přes výdejní stránku (nesdílenou, viz výše) | nic (mimo E.ON) | nízká: přihlásí se heslem z výdejní stránky; ❓ první přihlášení bez MFA registrace |
   | **B) role Člen / Vlastník na DEV webu pro hosty z EG.D** | pracují pod vlastním firemním účtem; v blízkosti jejich prostředí | ❓ **nikdo v labu nezkoušel** (pod hostem se přístup nezkoušel); 3 ze 6 účastníků pozvánku nepřijali; ⛔ zda EG.D pustí přihlášení do cizího tenantu, jde změřit jen s nimi; `m365 login` hosta ❓ | ⛔ povolení přihlášení do cizího tenantu / B2B na straně EG.D | ❓ neměřeno |
   | **C) kombinace** (A pro vývoj, hosté jen na prohlížení výsledků) | A je spolehlivá, B jen pro ukázku | dvojí správa | jako B | jako A |

   Test varianty B (návrh): zkušební host (např. `chocholous@ppf.cz` s rolí Visitors, později Member) zkusí vytvořit stránku a nasadit balíček na DEV webu.
3. **Na čem poběží vývoj.** 🔀 Claude vs. GitHub Copilot vs. obojí; podrobně s pro a proti v [01](01-fakta-workshopu.md) („Volba nástroje“)
   a [09](09-github-ucastnici.md) (varianty F firemní GitHub, A osobní Free, B–E). Fakta: ⛔ licence EG.D přes ServiceNow (schvalují T. Richter a vedoucí),
   stav podání neznámý, ověří Adriána / IT EG.D (dotaz zatím nepoložen ❓; účastníci ověřují přístup do úterý 24. 11.). V labu ✅ jen to, že existuje `copilot skill list`
   (Copilot CLI 1.0.91) a balíček v npm; běh našich skillů v Copilotu máme ✅ (všech 10 má `TEST-copilot.md`, různě hluboké; ❓ VS Code agent mode), Windows ⛔.
4. **Distribuce skillů a kitu účastníkům.** GHE PPF je `INTERNAL` ✅; že EG.D nemá přístup, je odvozeno ❓ (zdroj: viditelnost repa, [02](02-skills-a-kit.md)).
   Připravit balíček = **10 skillů `egd-*`** (`egd-recon` ✅ v Claude i Copilotu; ❓ větev „chybí role / scope“ pod účtem bez práv) + obecné skilly + kit; 🔀 varianty (ZIP, kopie na firemní GitHub EG.D, veřejný GitHub, jen skilly, sdílená složka v E.ON,
   na místě) s pro a proti jsou v [02](02-skills-a-kit.md). Návod k instalaci ještě není.
5. **Odpověď Adriáně** ✅ vyřízeno: Pavel jí odpověděl ručně 6., 12. a 16. 11. (`prehled/stav/odpoved-adriane.json`, stav „hotovo“, 24. 11.); návrh `~/Projects/ppf-arcade/odpoved-adriane.md` už není potřeba. Hlavní sdělení
   „Custom Script ani PnP nepotřebujete“ ✅ změřeno 6. 11. v **PPF tenantu**, ne v egd labu (viz [00](00-co-mame.md), [04](04-integrace-test-plan.md)); v egd labu ❓ neopakováno; ⛔ pro E.ON.
6. **MFA a přihlášení účastníků:** Pavel v Entra zkontroluje Registration campaign a ID Protection a vyjme skupinu účastníků
   ([08](08-ucty-ucastniku.md), skript `tools/lab-mfa-registrace.ps1`, ID Protection neběželo ❓). Také sdílení výdejní stránky (Share → Anyone with the link).
7. **Windows a E.ON**: nic z toho, co skilly dělají, nebylo změřeno na Windows ani v E.ON ⛔ (viz [02](02-skills-a-kit.md), [00](00-co-mame.md)).
   Pondělní rozeslání `egd-pripravenost` účastníkům je zároveň první zkouška; výsledky sebrat a zapsat. Test hosta (bod 2) zatím neproběhl ❓; běh skillů v Copilotu ✅ proběhl (bod 3).

- **Co smí vlastník webu bez admin rolí** ✅ změřeno pod `egd01` 24. 11. (nasadit balíček, seznamy, stránky, role, Graph PDF ano; schválit API ne): tabulka v [10-container-app.md](10-container-app.md), důkazy [sondy/overeni/site-owner](sondy/overeni/site-owner/README.md). `m365` CLI pod `egd01` ✅ (po tenantovém consentu appky CLI; bez něj „Need admin approval“). ❓ Zbývá chování web partu bez schváleného API a celý průchod skillem pod `egd10` ([sondy/e2e/README.md](sondy/e2e/README.md)).

## Technika (viz [04](04-integrace-test-plan.md))

8. Test „Appka volá vlastní server“: ✅ hotovo (web part v labu volá gateway i DB API přes `AadHttpClient`, [10-container-app.md](10-container-app.md) katalog 1, 2; vzor v ppf-rooms).
9. Test „Kit mimo PPF“ (devkit nasadí appku do lab tenantu): ❓ nepotvrzeno; skill `egd-prvni-appka` prošel v labu (jako Global Admin, macOS), samotný devkit s `project_config.json` pro lab ne.
10. Test „LLM gateway“: ✅ **hotovo**. Gateway `ca-egd-llm-gateway` existuje a je změřená (text, OCR, vision, kvóta; obrázky ❌ kvóta 0; surové výstupy ✅ uložené v [sondy/overeni/container-app/gateway](sondy/overeni/container-app/gateway/), [sondy/ai.md](sondy/ai.md)); LLM rozhodnut: Azure OpenAI `gpt-4.1-mini`.
    Zbývá: `min-replicas 1` před středou (jen s Pavlovým ano, studený start ≈ 30 s ✅). Atomická kvóta ✅ (gateway v3, [gateway-atomicita](sondy/ms-llm/gateway-atomicita/README.md)), aplikační role `Gateway.App` ✅, schválení API v UI admin centra ✅ pod Global Adminem (❓ zda stačí role SharePoint admin); ⛔ pro E.ON datová pravidla a schválený endpoint.
11. Test „Power Automate“: ⚠ částečně. ✅ Recurrence a LLM přes Foundry konektor (Standard); akce HTTP se nezapne: 403 `MissingAdequateQuotaPolicy` = chybí Premium ✅ (`sondy/power-automate/vystupy/diag-409.txt`), neznámá příčina (❓) je jen u 409 Request triggeru a Recurrence + HTTP; OCR / vision přes PA ✅ doběhlo (`vystupy/behy.txt`, CU25); část běhů čeká na Pavla
    (přihlášení připojení, rozhodnutí o trialu / PAYG), viz [sondy/power-automate.md](sondy/power-automate.md).
12. Test „Denní report“: ⚠ částečně. ✅ Job s cronem → ČNB → **CSV** → e-mail s přílohou ([sondy/napojeni.md](sondy/napojeni.md) Sonda 2; logy v [sondy/overeni/container-app/job](sondy/overeni/container-app/job/)). ✅ AI shrnutí a docx + PDF v Jobu: řetěz `job-egd-retez` ([10-container-app.md](10-container-app.md) katalog 7, [job-retez.md](sondy/container-app/job-retez.md)).
13. Rozbor `skills-download.zip` (AI Engineering Library) je hotový 24. 11. ✅ ([prehled/epl-navrhy.html](prehled/epl-navrhy.html), písma v [zdroje/eon-fonty/](zdroje/eon-fonty/README.md)); porovnání s našimi skilly (10 `egd-*` + 5 obecných) je v návrzích. Převzetí `eon-ui-design-system`,
    `eon-security`, `eo-compliance-standards` rozhodne Pavel, obsah knihovny se do repa nekopíruje (bez licence) ❓ (117 skills ✅ potvrzeno rozborem 24. 11.).
14. Sjednotit `spfx-ship` (CLI 11.x) s kitem (`m365-cli-12`): ❓ změřit `m365 --version` a příkazy `spo app add/deploy/install` pod CLI 12 ([02](02-skills-a-kit.md));
    obecné skilly dát do gitu (nejsou).
15. Rozpor verze devkitu (`plugin.json` 0.7.0 vs. release a katalog 0.8.0): vlastník kitu sladí; zatím jen zapsáno v [02](02-skills-a-kit.md).
16. 🔀 SPFx 1.18.2 + gulp (EG.D) vs. 1.24 + Heft (naše skilly): varianty v [02](02-skills-a-kit.md); varianta 1.18.2 nikdy neměřena v labu ❓.
17. Aktualizovat lokální `ppf-spfx-devkit` a `ppf-skills` (`git fetch` a `git status -sb`; lokální kopie bývají pozadu za `origin/main`).

## Méně naléhavé

18. Ztracené zdrojáky Pacman / Guide / ArcadeHome (jen nasazené balíčky) ✅ potvrzeno v [03](03-lab.md).
19. `egd-vibecoding` nemá remote ✅ (`git remote -v` prázdné, 22. 11.); `ppf-arcade` lokálně není git ✅, kopie je na GitHubu a je `PRIVATE` ✅ (`gh repo view chocholous/ppf-arcade`).
20. Demo `digi-podnety`: notifikace zadavateli a prázdná skupina schvalovatelů (✅ `~/Projects/egd-vibecoding/docs/historie.md` ř. 388–392); u kartogramu
    povinná atribuce ČÚZK / RÚIAN, CC BY 4.0 (✅ `egd-vibecoding/README.md` ř. 62).
21. Kolize 25. 11.: onboarding T. Otruby v Praze 15:30–17:00 (zdroj „PPF KB“, jinde v projektu není) ❓ ověřit v kalendáři PPF (ne editovat) a rozhodnout.
22. Nepřečtené zdroje: cloud session „EON skill citizen AI developer“ a artefakt „Citizen AI Developer Onboarding“
    (https://claude.ai/artifact/UPmvjcT5bRDzhdmeWMF39i, září) jsou z této aplikace nečitelné (jiný účet); claude.ai chaty na účtech
    pavel@chocholous.net a chocholous@ppf.cz lokálně nejsou. Přiřadit: Pavel přes prohlížeč na odpovídajícím účtu.
