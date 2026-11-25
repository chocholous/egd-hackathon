# GitHub a Copilot pro 10 účastníků workshopu (st 25. 11. 2026)

Research ke dni **2026-11-22**, jen čtení, nic nezaloženo. Zpět do [README](README.md).
Značky: ✅ změřeno (surový výstup ve [sondy/lab-github/](sondy/lab-github/)) · 📘 jen dokumentace GitHubu, v labu neověřeno · ❓ neověřeno / zdroje si protiřečí.
Stránky GitHubu neuvádějí datum poslední úpravy, „datum“ = den načtení.

**Co je v tomto dokumentu skutečně změřeno (2026-11-22):** jen čtení `gh` na Pavlově osobním účtu a suchý běh skriptů, viz [introspekce-graphql.txt](sondy/lab-github/introspekce-graphql.txt) (mutace `createEnterpriseOrganization` a její vstupy existují ve schématu), [gh-scopes.txt](sondy/lab-github/gh-scopes.txt) (token má scopes `gist, read:org, repo, workflow`; dotaz na enterprises končí `INSUFFICIENT_SCOPES`), [suchy-beh-skriptu.txt](sondy/lab-github/suchy-beh-skriptu.txt) a [npm-copilot-cli.txt](sondy/lab-github/npm-copilot-cli.txt) (balíček `@github/copilot` verze 1.0.114 existuje v npm; požadavek Node 22+ z toho nevyplývá). **Všechno ostatní je 📘/❓**: nebyl založen žádný účet, trial, org ani Copilot. Pozor, neměřeno: limity Copilot Free, CLI a agent mode na Free účtu, registrace s doménou onmicrosoft, trial Enterprise, EMU/OIDC/SCIM, Windows.

## Zjištění (se zdroji)

| # | Fakt | Zdroj | |
|---|---|---|---|
| 1 | GitHub Free organizace: neomezená privátní repa (omezená sada funkcí), Actions v privátních repech u Free 2 000 min/měs (pricing) resp. 12 USD kreditu (docs – zdroje se liší); v privátních repech u Free chybí repository rules, code owners, secret scanning push protection. Číselný limit členů jsem nenašel. | <https://github.com/pricing>, <https://docs.github.com/en/get-started/learning-about-github/githubs-plans> | 📘 |
| 2 | Bez EMU **musí mít každý člen vlastní osobní účet** („Each user must create, manage, and sign in to a personal account“). | <https://docs.github.com/en/enterprise-cloud@latest/admin/concepts/enterprise-fundamentals/choose-an-enterprise-type> | 📘 |
| 3 | **SAML SSO jen v Enterprise Cloud**; u Free a Team „Not included“. Entra ID podporováno (SAML, OIDC, SCIM). | <https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-saml-single-sign-on-for-your-organization/about-identity-and-access-management-with-saml-single-sign-on> | 📘 |
| 4 | **EMU** = jen Enterprise Cloud; účty vytváří IdP (Entra) a patří enterprise, nemohou tvořit veřejný obsah ani přispívat mimo enterprise. Trial: 30 dní, bez karty, až 50 licencí, max 3 nové organizace; zrušení/smazání je možné, po 90 dnech po konci se maže sám. | <https://docs.github.com/en/enterprise-cloud@latest/admin/overview/setting-up-a-trial-of-github-enterprise-cloud> | 📘 |
| 5 | **Copilot v Enterprise trialu: zdroje si protiřečí; pracovní předpoklad „Copilot v trialu NENÍ“.** Docs (konkrétnější, sekce „Features not included in the trial“): Copilot v self-service trialu není, „contact GitHub Sales“. Pricing/trial stránka (marketing): trial zahrnuje Copilot Business (až 50 členů). Rozhodne se až při založení trialu (Pavel), do té doby s Copilotem v trialu nepočítat. | docs výše vs. <https://github.com/enterprise/trial>, <https://github.com/pricing> | ❓ |
| 6 | **Copilot Free** (dle dokumentace, neměřeno): 0 USD, bez karty, 2 000 completions/měs, „limited chat and agent usage“ (číslo creditů neuvedeno), jen auto výběr modelu; agent mode i Copilot CLI uvedeny jako zahrnuté; aktivace přímo ve VS Code. Není pro managed user účty ani pro uživatele, kterým organizace přidělila seat. **Na čerstvém Free účtu se to neměřilo** (to by vyžadovalo založit účet, což zadání zakazuje). | <https://github.com/features/copilot/plans>, <https://docs.github.com/en/billing/concepts/product-billing/github-copilot-licenses>, <https://docs.github.com/en/copilot/how-tos/manage-your-account/get-started-with-a-copilot-plan> | 📘 |
| 7 | **Copilot Pro** 10 USD/měs (1 500 AI Credits, 1 credit = 0,01 USD; premium requests nahrazeny credity). Marketingová stránka stále nabízí „30 days free“, ale komunitní vlákna (květen 2026) tvrdí, že GitHub **nové Pro trialy pozastavil** a trial chtěl kartu (dočasná autorizace). | <https://github.com/github-copilot/pro>, <https://github.com/orgs/community/discussions/195166> | ❓ |
| 8 | **Copilot Business** 19 USD/seat/měs, 1 900 credits/uživatele (sdílený pool), nad pool se účtuje 0,01 USD/credit (admin může vypnout). Samostatný trial neověřen; trial v Enterprise trialu viz řádek 5. Přidělení seatu členům *Free* organizace výslovně nepotvrzeno (v praxi Business funguje v libovolné org, ale nezměřeno). Osobní Pro/Free se po přidělení seatu přepne. | <https://docs.github.com/en/billing/concepts/product-billing/github-copilot-licenses>, <https://docs.github.com/en/copilot/concepts/billing-and-usage/organizations-and-enterprises/billing> | 📘/❓ |
| 9 | **Copilot CLI** je ve všech plánech (📘); Windows: PowerShell 6+, instalace `winget install GitHub.Copilot` (bez Node) nebo `npm i -g @github/copilot` (Node 22+). Spotřebovává AI credits. Měřeno jen: balíček `@github/copilot` v npm existuje ✅; `winget` a Windows v labu nejsou, `winget` příkaz a Node 22+ tedy ❓. | <https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli> | 📘 ✅ |

Poznámka k účtu: `gh` na tomto Macu = osobní účet `chocholous` (čten jen login), nic nezakládáno.

## Varianty

Sloupce „co chce IT E.ON“ a „náročnost“: o požadavcích IT E.ON/EG.D **nic nevíme** (dotaz nebyl položen, k 2026-11-22 nikomu neodeslán; ověří Adriána/IT EG.D, v labu to zjistit nejde). Hodnoty ve sloupci jsou proto jen předpoklad ❓ z běžné praxe. Náročnost pro citizen developera = odhad.

| Varianta | Účastník předem | Pavel | Cena (10 lidí, workshop + 2–4 týdny) | Co chce IT E.ON ❓ | Náročnost pro citizen developera | Riziko | Rychlost do středy |
|---|---|---|---|---|---|---|---|
| **F. Firemní GitHub Enterprise EG.D/E.ON + Copilot přes E.ON ITSM (hlavní cesta)** | Ověřit přístup, případně podat žádost v ITSM, přihlásit VS Code | nic; vyžádá si informace od Adriány | 0 USD (licence EG.D) | Jejich proces, ITSM žádanka, firemní SSO; data v jejich tenantu | Nízká, když licence je; střední, když se čeká na ITSM a nejde založit repo | Stav licencí: [01](01-fakta-workshopu.md) ř. 74 uvádí „licenci E.ON Copilot a GHE si zařídili sami“ (Pavlova zpráva 22. 11., nezdokumentovaná, nezávisle neověřená; zda se týká všech 10 účastníků a Windows/VS Code/CLI, nevíme) a nejde ho ověřit v labu (jen EG.D/E.ON, ověří Adriána/IT) → **střední až vysoké** | nelze předvídat; závisí na ITSM |
| **A. Osobní účty + Copilot Free (záloha)** | Založí si GitHub účet (e-mail, ověření), ve VS Code „Sign up for Copilot Free“, zkusí `copilot` CLI | nic; volitelně org na sdílení repa | **0 USD** | Pravděpodobně nerado: osobní účet a pracovní data mimo firmu; zda smí zaměstnanec založit osobní účet na firemní e-mail, ověří jen EG.D (Adriána) | Nízká (registrace a přihlášení ~10 min, neměřeno) | Limity Free (chat/agent) **neměřeny**, mohou je za 4 h vyčerpat → **vysoké**; jen auto model | ihned, bez ITSM |
| **B. A + Free org + Copilot Business seaty** | Totéž co A + přijmout pozvánku do org | Založit org (Free), objednat 10 seatů, karta | **190 USD/měs** (10 × 19); při zrušení během měsíce možná méně ❓ | Mimo jejich kontrolu → jako A | Nízká–střední (pozvánky) | Přesahuje 50 USD „teď“, vejde se do 300; Free org + Business seat nezměřeno ❓ | org za minuty, účastníci musí mít účet do úterý |
| **C. Enterprise Cloud trial (běžný, osobní účty) + org + pozvánky** | Totéž co A + přijmout pozvánku | Trial bez karty (📘), 30 dní, 3 org; Copilot nejspíš nebude | **0 USD** | jako A | Nízká–střední | Copilot v trialu nejspíš není (viz zjištění 5); po 30 dnech omezení/smazání | málo práce, viz plán níže |
| **D. EMU + Entra lab (účty egdNN z lab Entra)** | Nic, účty vznikají samy (první přihlášení Entra + MFA) | Enterprise s EMU, OIDC na Entra, SCIM pro egd01–10; Copilot jen s placeným seatem | 0 USD v trialu, pak Enterprise 21 USD/seat ❓ | Lab hřiště, žádný požadavek IT, jejich data se tam nedávají | Nízká pro účastníka (jen přihlášení), vysoká pro Pavla | Neprošlo v labu; EMU účty bez Copilot Free; přihlášení VS Code/CLI k EMU nezměřeno ❓ | střední až pomalé |
| **E. Bez GitHubu, jen Claude** | – | Claude licence | mimo toto zadání | Neznámé, jiný nástroj než Copilot | Nízká | Nezávisí na GitHubu; EG.D možná chce Copilot | ihned |

Pro a proti hlavní cesty F v kontextu ostatních:

| | F firemní GHE + ITSM | A osobní Free | D lab EMU |
|---|---|---|---|
| Pro | skutečné prostředí, žádná data mimo firmu, licence zdarma pro workshop, bez práce Pavla | okamžitě, bez ITSM, zdarma, dá se vyzkoušet do úterý | účty z lab Entra, Pavel vše řídí, bezpečný lab |
| Proti | stav licencí podle Pavla (22. 11., viz [01](01-fakta-workshopu.md) ř. 74) „zařízeno“, nezávisle neověřeno; ITSM může trvat; v labu to nelze ověřit | limity Free neznámé (riziko pro 4 h), osobní účet na pracovní věci nemusí být povolen | hodně nastavování, neprošlo v labu, bez Copilotu, účty po konci trialu zaniknou |
| Co potřebuje od IT | přístup a seat Copilot, případně povolení CLI/VS Code | nic, jen povolení volat github.com z firemní sítě (proxy, ❓) | nic |

Pozn.: Vytvořit 10 účtů za účastníky nelze. Podle podmínek GitHubu smí osoba mít jeden bezplatný účet a hromadná registrace je zakázaná ❓ (smluvní text jsem nečetl, jde z paměti; zdroj ke kontrole: <https://docs.github.com/en/site-policy/github-terms/github-terms-of-service>); registraci by navíc mohlo blokovat ověření e-mailem nebo captcha ❓ (nezkoušeno). Účty musí založit lidé sami.

Vazba na lab Entra: u A, B, C a F se jí nic nepropojuje (SSO jen Enterprise Cloud, EMU jen D). Účtů `egd01–10@pavelchocholousgmail.onmicrosoft.com` by šlo použít jen jako e-mailovou adresu pro registraci (schránku mají s E5), ale ❓ nebylo vyzkoušeno, zda GitHub doménu při registraci neodmítne (zkouška by byla zápisem a vyžaduje Pavlovo „ano“), a po labu zůstanou účty bez vlastníka. Doporučuji soukromý nebo pracovní e-mail účastníka.

## Rozhodnutí Pavla (2026-11-23): firemní GitHub, lab se nepoužije

Pavel: „ok, nechme firemni github“. **Hlavní cesta = firemní GitHub EG.D + Copilot z ITSM** (stav licencí ověří jen Adriána/IT EG.D). **Záloha = osobní účet + Copilot Free.** Z toho plyne:

- Pozvánky do `egd-lab` se **neposílají**, loginy účastníků se nesbírají, EMU/Entra se nestaví (varianta D zůstává jen jako dokumentovaný plán).
- Enterprise trial `egd-lab`, org `egd-lab` a privátní repo `egd-kit` zůstávají jako **nepoužitá záloha**. Trial vyprší sám (~22. 12. 2026), nic se nemaže.
- **Kit se účastníkům rozdává jako zip nebo odkaz**, ne přes GitHub org. Postup pozvání níže platí jen kdyby se záloha později oživila.

## Dřívější rozhodnutí Pavla (2026-11-22)

EG.D má nejspíš **GitHub Enterprise**; Pavlova slova: „oni nejspis budou mit github enterprise, osobni ucty budou jen zaloha“. Je to jen Pavlův předpoklad: kde EG.D GitHub drží, jaký plán a zda mají Copilot, **v labu nejde ověřit**, ověří Adriána/IT EG.D (dotaz zatím nepoložen, datum dotazu: nevyplněno). Hlavní cesta je tedy **F: firemní GitHub Enterprise + licence Copilot přes E.ON ITSM** (stav neznámý, viz [05](05-otevrene-body.md) bod 3). Varianta A (osobní účet + Copilot Free) je **záloha**.

Nevítězné varianty se nemažou: **D/EMU se staví jako lab hřiště** (viz plán níže, Pavel o něm rozhodl samostatně), B a C zůstávají v záloze, dokud nevíme, jak dopadne F a limity Free.

Pozor: licence z firemní organizace přepíše osobní plán (seat nahradí osobní Pro/Free; 📘, neměřeno), takže záloha firemní cestě nevadí.

## Doporučení

0. **Aktuální stav (2026-11-23):** hlavní cesta firemní GitHub, záloha osobní Free, kit jako zip/odkaz (viz rozhodnutí výše). Body níže vznikly dříve, platí jen v souladu s tím.
1. **Hlavní cesta (F):** firemní GitHub Enterprise + Copilot z E.ON ITSM. Do úterý 24. 11. musí každý účastník ověřit přístup (text níže). Stav licencí ověří jen EG.D/E.ON (Adriána/IT), ne lab.
2. **Záloha A:** kdo do úterý přístup nemá, založí si osobní účet a zapne Copilot Free (0 USD, bez karty; CLI a agent mode jsou jen 📘 zdokumentované).
3. **Úterý 24. 11. večer test zálohy** (zatím nepodniknut, vyžaduje založit Free účet se souhlasem Pavla): 30–60 min vibecodingu na čerstvém Free účtu, jestli limity chatu stačí a zda funguje `copilot` CLI. Nestačí-li, nabídnout Pavlovi B (Free org + 10 seatů, 190 USD), jen po jeho výslovném „ano“.
4. Číslování plánů níže: **„Varianta 1“ = D (EMU + Entra)**, **„Varianta 2“ = C (běžný trial + pozvánky)**. Obě jsou jen záloha/hřiště; **jediný důvod, proč C nebrat jako hlavní, je Copilot** (v trialu pravděpodobně není, zjištění 5): pro účty, git a Claude je C v pořádku a je to záložní plán, kdyby D v úterý selhala.
5. U zálohy potvrdit s Adriánou (**jen EG.D**), zda smí zaměstnanci zakládat osobní účet na firemní e-mail; jinak soukromý.

## Pro prereq skill

**Stav (2026-11-22):** `egd-pripravenost` už GitHub krok **obsahuje** (krok 9b, `references/github.md`, příkaz `github`); tento text je původní podklad, který skill vychází z. Nevkládat znovu. Windows (PowerShell, `winget`, přihlášení VS Code) se v labu nezkoušelo: Windows v labu není ([04](04-integrace-test-plan.md)), takže kroky pro Windows jsou ❓ a ověří je až první účastník EG.D. Firemní část (GitHub Enterprise EG.D, E.ON ITSM, firemní e-mail) umí ověřit jen EG.D/E.ON.

> **GitHub a Copilot – nejdřív firemní přístup**
>
> **Krok 1 – ověřte firemní GitHub Enterprise (5 minut).**
> 1. Zeptejte se kolegů nebo na intranetu, jakou adresou se firemní GitHub otevírá (obvykle https://github.com, přihlášení přes firemní SSO, nebo vlastní adresa EG.D). Otevřete ji v prohlížeči a přihlaste se firemním účtem.
> 2. Vpravo nahoře klikněte na profilový obrázek → **Your organizations** (nebo **Your enterprises**). Vidíte-li organizaci EG.D / E.ON, máte firemní přístup.
> 3. Ověřte Copilot: https://github.com/settings/copilot. Stojí-li tam „You have access to GitHub Copilot“ (případně „assigned by your organization“), máte licenci. Ve VS Code pak vlevo dole ikona účtu → **Sign in with GitHub** a otevřete Copilot Chat.
> 4. Přihlášení dělejte sami, heslo ani kód z ověření nikomu nepište ani neposílejte.
>
> **Krok 2 – nemáte přístup nebo licenci? Požádejte ITSM (E.ON ITSM / ServiceNow).** Vzor žádosti:
> „Žádám o přidělení licence GitHub Copilot a přístupu do firemní organizace GitHub Enterprise pro účastníka vibecoding workshopu IT EG.D 25. 11. 2026. Potřebuji GitHub Copilot v editoru Visual Studio Code a GitHub Copilot CLI na pracovní stanici s Windows.“
> Číslo požadavku pošlete Pavlovi, ať ví, že je podáno. Podání co nejdřív, nejlépe dnes.
>
> **Krok 3 – záloha: do úterý 24. 11. nemáte nic z kroku 1–2.**
> 1. Na https://github.com/signup si založte bezplatný osobní účet (e-mail, heslo, ověření e-mailu; bez karty a zdarma). Zda smíte použít firemní e-mail, ověřte u nadřízeného, jinak použijte soukromý.
> 2. Ve VS Code ikona účtu vlevo dole → **Sign in with GitHub**, ve Copilot Chatu **Sign up for Copilot Free**.
> 3. Zeptejte se Copilot Chatu: „Ahoj, funguješ?“ Odpoví-li, hotovo.
> 4. Volitelně v PowerShellu: `winget install GitHub.Copilot`, potom `copilot` a `/login`.
> 5. Uživatelské jméno pošlete Pavlovi.
>
> Pokud později firemní licenci dostanete, přepíše osobní plán a nic se nekazí.

Poznámka k přesnosti: umístění položek v nabídce GitHubu (Your organizations, settings/copilot) jsem neprošel živě, 📘 z dokumentace; session test-pripravenost ať je při vkládání ověří na účtu.

## Lab GitHub Enterprise trial pro 10 účastníků (plán, 2026-11-22)

**Celý postup EMU+OIDC+SCIM níže je plán podle dokumentace, v labu se nezkoušel** (trial neexistuje, skripty běžely jen v suchém běhu). Projít ho je naplánováno až po Pavlově založení trialu.

Zadání Pavla: v labu GitHub Enterprise trial (Copilot nemusí být), účastníci tam mají účet a napojí ho na VS Code, Copilot CLI, Claude a git. Zdroje: [setup trialu](https://docs.github.com/en/enterprise-cloud@latest/admin/overview/setting-up-a-trial-of-github-enterprise-cloud), [EMU start](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/understanding-iam-for-enterprises/getting-started-with-enterprise-managed-users), [OIDC](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/configuring-authentication-for-enterprise-managed-users/configuring-oidc-for-enterprise-managed-users), [SCIM](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/provisioning-user-accounts-with-scim/configuring-scim-provisioning-for-users), [týmy z IdP skupin](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/provisioning-user-accounts-with-scim/managing-team-memberships-with-identity-provider-groups), [omezení managed účtů](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/understanding-iam-for-enterprises/abilities-and-restrictions-of-managed-user-accounts), [Microsoft Learn: OIDC provisioning](https://learn.microsoft.com/azure/active-directory/saas-apps/github-enterprise-managed-user-oidc-provisioning-tutorial). Čteno 22. 11. 2026.

### Co platí pro oba trialy

| Fakt | |
|---|---|
| Trial je **samoobslužný**, 30 dní, bez platební metody, až 50 licencí, max 3 nové organizace; „EMU trial jen přes Sales“ v docs nestojí. Přesná pole formuláře docs nepopisují, takže po kliknutí může být omezení (region, účet) ❓. Formulář: <https://github.com/account/enterprises/new?ref_product=ghec&ref_type=trial&ref_style=button&ref_plan=enterprise> | 📘 |
| **Pracovní předpoklad: Copilot v trialu není** (docs: „Features not included“, Copilot trial jen přes Sales; marketingová stránka tvrdí opak, viz zjištění 5). Koupit Copilot Business jde až po převodu na placený enterprise. **EMU účty nesmí Copilot Free ani Pro**, jen seat Business/Enterprise. | 📘 ❓ |
| Po konci: enterprise přejde do „downgraded“ stavu, expirovaný trial lze smazat, nezkonvertovaný se sám smaže 90 dní po konci, zrušení („Danger zone“) odebere přístup hned. Trial založený 23.–24. 11. končí kolem 23.–24. 12. 2026. | 📘 |
| `gh` na tomto Macu má scopes jen `gist, read:org, repo, workflow`; pro enterprise potřebuje token se `read:enterprise`/`admin:enterprise` (✅ [gh-scopes.txt](sondy/lab-github/gh-scopes.txt)). Vytvoření org: REST endpoint v docs nenalezen, ale **GraphQL mutace `createEnterpriseOrganization` existuje** (✅ [introspekce-graphql.txt](sondy/lab-github/introspekce-graphql.txt)). | ✅ |

### Varianta 1: EMU trial + lab Entra (OIDC + SCIM) — jen PLÁN, v labu neprošel

Účty `egd01…egd10` vzniknou z lab uživatelů; na GitHubu se jmenují `egd01_SHORTCODE` (část UPN před `@` + shortcode) 📘.

**Pavel sám (nelze delegovat, registrace, podmínky, hesla):**
1. V prohlížeči (profil, kde chce vlastnit trial) otevřít odkaz na formulář výše. Zvolit typ **Enterprise with managed users**, umístění **GitHub.com** (ne GHE.com, tam je Copilot a přihlášení složitější), shortcode např. `egdlab` (3–8 znaků, nejde později změnit), odsouhlasit podmínky. Přesné klikání ve formuláři neznám ❓; Pavel mi případně napíše, co vidí.
2. Přijde e-mail → v anonymním okně nastavit heslo setup usera `egdlab_admin`, zapnout 2FA, uložit recovery codes i enterprise SSO recovery codes do správce hesel (ne mně).
3. Jako `egdlab_admin`: enterprise → **Identity provider** → **Single sign-on configuration** → **Enable OIDC configuration** → **Save** → v Entra přihlásit jako Global Admin lab tenantu (`pavel.admin@…`), souhlasit s „GitHub Enterprise Managed User (OIDC)“ + zaškrtnout „Consent on behalf of your organization“ → uložit recovery codes → **Enable OIDC Authentication**. (Jedna OIDC integrace na Entra tenant.)
4. Jako `egdlab_admin` vytvořit **PAT classic** se scope `scim:enterprise` (docs: ne `admin:enterprise`), bez expirace; předat mi ho přes `GH_TOKEN` v terminálu, ne do chatu/souboru. Druhý token pro API: `admin:enterprise`, `admin:org`, `read:enterprise` (nebo týž token).
5. Řekne mi „trial založen“ a shortcode.

**Já (po kroku 5):**
- Hned teď připraveno: [tools/lab-github-entra.sh](tools/lab-github-entra.sh) (`plan`, `group`) — skupina `grp-egd-github` s účty egd01–10 (suchý běh ✅ [suchy-beh-skriptu.txt](sondy/lab-github/suchy-beh-skriptu.txt), 1 účet; zápis jen s `--apply` a po Pavlově „ano“).
- SCIM v Entra: Enterprise apps → galerie „GitHub Enterprise Managed User (OIDC)“ → Provisioning, Tenant URL `https://api.github.com/scim/v2/enterprises/egdlab`, Secret = PAT, Test Connection, přiřadit skupinu `grp-egd-github`, Start provisioning. Entra nepodporuje vnořené skupiny. Dokumentovaná hodnota je jen „about 40 minut“ při změně mapování, doba prvního cyklu ❓; plánuj hodiny, ne minuty.
- Přes API ([tools/lab-github-org.sh](tools/lab-github-org.sh)): `check`, `create-org` (GraphQL), `repo`; členy EMU organizace dávám přes tým propojený na IdP skupinu (UI: Organization → Teams → Identity Provider Groups), protože `POST /orgs/{org}/invitations` pro EMU **není dostupný** (📘 <https://docs.github.com/en/enterprise-cloud@latest/rest/orgs/members>, nezkoušeno). Skripty nebyly proti skutečnému enterprise zkoušeny ❓.

**Rychlost:** Pavel ~30–45 min, SCIM první běh hodiny ❓; realisticky hotovo za jeden večer (pondělí/úterý), tedy do středy ano, ale první přihlášení účastníků (Entra heslo + MFA lab účtů, viz `lab-ucty-mfa.py`) je nutné vyzkoušet v úterý.

**Omezení pro účastníky:** managed účty nemohou tvořit veřejný obsah ani přispívat mimo enterprise; čtení veřejných repozitářů (např. kit) docs výslovně neříkají ❓. Přihlášení VS Code / `gh` / Copilot CLI k EMU na GitHub.com: specifický postup v docs nenalezen ❓ (pro GHE.com existuje). Git přes HTTPS s EMU účtem a PAT je běžný postup, Claude Code potřebuje jen git, ne Copilot. **Copilot:** žádný (ani Free). Zbývá EG.D licence nebo osobní účet jako záloha (A výše), ten je ale **jiná identita**, než je EMU účet.

### Varianta 2: běžný Enterprise trial + organizace s pozvánkami — jen PLÁN, v labu neprošel

**Pavel sám:** založit trial stejným formulářem, ale typ **Enterprise with personal accounts** (zakladatel potřebuje přihlášený osobní účet ❓), odsouhlasit podmínky, vytvořit token (`admin:org`, `admin:enterprise`, `read:enterprise`) a předat přes `GH_TOKEN`.
**Já:** `create-org` (nebo Pavel v UI: enterprise → Organizations → New organization), `repo` (privátní repa pro kit a šablony), `invite` (e-maily nebo loginy účastníků; limit pozvánek 50/24 h pro novou org, 500 pro starší/placenou (📘 <https://docs.github.com/en/enterprise-cloud@latest/rest/orgs/members>, nezkoušeno; pro 10 lidí stejně nerelevantní)), seaty `copilot` jen když by Copilot byl (v trialu není).
**Účastník:** musí mít osobní GitHub účet (varianta A) a přijmout pozvánku; členství bez SSO a bez Entra. Účty účastníků zůstávají jejich.
**Rychlost:** Pavel 10–15 min, ostatní minuty; účastníci do úterý.
**Po konci:** členové zůstanou v downgraded org, osobní účty se neztratí (výhoda oproti EMU, kde účty patří enterprise a zaniknou se smazáním).

### Srovnání a doporučení

| | 1. EMU + Entra | 2. běžný trial + pozvánky |
|---|---|---|
| Účty účastníků | automaticky z lab Entra (egdNN_egdlab) | vlastní osobní/firemní účet |
| Návaznost na lab tenant | ano (OIDC + SCIM) | ne |
| Práce Pavla | ~30–45 min + Entra souhlas | ~10–15 min |
| Riziko do středy | střední (první SCIM cyklus, přihlášení, VS Code/CLI s EMU nezměřeno) | nízké, ale účastníci musí mít účet |
| Copilot | **ne** (EMU nesmí Free; trial bez Copilotu) | ne v trialu; osobní Free u účastníků by měl fungovat 📘 (neměřeno) |
| Po konci trialu | účty a repa zanikají s enterprise | osobní účty zůstanou |
| Cena | 0 USD | 0 USD |

**Doporučení:** pokud Pavlovi jde hlavně o „účty z lab Entra, napojené na git a Claude“, jde **varianta 1**, ale spouštět **jen s tichým plánem B**: do úterý večer dokončit test jednoho přihlášení egd01 (web, `git clone` přes HTTPS s PAT, VS Code přihlášení); když selže, za hodinu přepnout na variantu 2 (trial 1 se smaže, trial 2 založí). Copilot v obou případech řeší EG.D licence nebo osobní Free účet. Mohou se založit obě (každý trial je samostatný enterprise), ale jeden Pavlův osobní účet smí asi vlastnit víc trialů jen omezeně ❓.

**Ptám se Pavla:** (1) jdeme variantou 1, 2, nebo oběma? (2) souhlas s `lab-github-entra.sh group --apply` (založí jen skupinu a přidá egd01–10)? (3) jaký shortcode (návrh `egdlab`) a který e-mail jako billing/kontakt?

## Rozhodnuto: běžný trial (Varianta 2 = C), 2026-11-22

Pavel zvolil **běžný Enterprise trial + organizace + pozvánky**. EMU/Entra (Varianta 1 = D) se nestaví; `lab-github-entra.sh` se nepoužije. Copilot v trialu nejspíš není (zjištění 5), řeší ho EG.D licence nebo osobní Free.

**Pavel (nelze delegovat; kliky ❓ podle docs, formulář jsem neviděl):**
1. Přihlásit se na github.com účtem, který má trial vlastnit, a otevřít <https://github.com/account/enterprises/new?ref_product=ghec&ref_type=trial&ref_style=button&ref_plan=enterprise>.
2. Zvolit typ **Enterprise s osobními účty** (ne „managed users“), název např. `egd-lab`, odsouhlasit podmínky, kontaktní e-mail. Karta se nemá chtít; když ji chce, zastavit a napsat mi.
3. V enterprise → Settings/Billing zkontrolovat konec trialu (~30 dní) a zda je tam Copilot; napsat mi, co vidí.
4. Vytvořit **PAT classic** (github.com → Settings → Developer settings → Tokens (classic)) se scopes `admin:org`, `admin:enterprise`, `read:enterprise` (+ `manage_billing:copilot`, pokud Copilot je), expirace např. 30 dní. Uložit do vlastního profilu `gh`, ať ho nevidím: `GH_CONFIG_DIR=~/.config/gh-egd-lab gh auth login --hostname github.com --with-token` a vložit token ze schránky.
5. Dát mi seznam 10 účastníků (e-mail nebo GitHub login) a potvrdit „trial založen“.

**Změřeno v Pavlově Chrome 2026-11-22 (formulář otevřen, nic neodesláno):** trial je samoobslužný, na stránce stojí „For Copilot access, please contact sales“ (✅ Copilot v trialu není). Volba typu: „Enterprise with personal accounts“ / „with managed users“. Formulář chce: Enterprise name, URL slug, Industry, Number of employees, Organization (existující org Pavlova účtu, nebo „Create without an organization“), Admin name, Admin work email, Country, zaškrtnutí „Trial terms“ a **GitHub Customer Agreement** (+ nepovinný souhlas s marketingem). Odeslání = Pavlův souhlas s podmínkami, nedělal jsem ho.

**Já potom:** `GH_CONFIG_DIR=~/.config/gh-egd-lab tools/lab-github-org.sh check`, `create-org` (suchý běh, pak `--apply` po Pavlově „ano“), `repo`, `invite`. Nic z toho dosud neběželo proti skutečnému enterprise ❓.

### Stav po založení (2026-11-22 večer)

✅ V Pavlově Chrome (na jeho pokyn, e-mailový kód zadal Pavel) vznikl **enterprise `egd-lab`** (<https://github.com/enterprises/egd-lab>, typ s osobními účty, „30 days left“, bez karty) a v něm **organizace `egd-lab`** (vlastník `chocholous`, bez pozvánek). Na dashboardu stojí „For Copilot access, please contact sales“, takže Copilot v trialu není (✅ viz formulář). Trial končí zhruba 22. 12. 2026. Souhlas s podmínkami a Customer Agreement dal Pavel v chatu; marketing nezaškrtnut. **Nikomu nic nebylo posláno** (žádné pozvánky; platí stop odesílání do rána).

✅ Založeno také **privátní repo `egd-lab/egd-kit`** (<https://github.com/egd-lab/egd-kit>, prázdné, bez pozvaných lidí; slouží na kit a skilly, naplnit lze z ZIP, viz [05](05-otevrene-body.md) bod 4).

**Postup pozvání, připravený na jeden krok (spustit až po zrušení stopu odesílání a po Pavlově výslovném „ano“ + seznamu účastníků):**
1. Seznam do souboru `~/.config/egd-lab/ucastnici.txt`, jeden řádek = GitHub login (lepší) nebo e-mail účastníka.
2. Varianta přes Chrome (Pavlova přihlášená session, bez tokenu): pro každého otevřít <https://github.com/orgs/egd-lab/people> → **Invite member** → login/e-mail → role **Member** → **Send invitation**. Agent to udělá sám po „ano“.
3. Varianta přes API (jen když je v `~/.config/gh-egd-lab` uložen PAT se scopes `admin:org`): `GH_CONFIG_DIR=~/.config/gh-egd-lab tools/lab-github-org.sh invite --org egd-lab --file ~/.config/egd-lab/ucastnici.txt` (suchý běh), potom totéž s `--apply`. Limit 50 pozvánek/24 h stačí.
4. Kontrola: <https://github.com/orgs/egd-lab/people> záložka *Pending invitations* má 10 řádků; účastníci přijmou e-mailem (musí mít osobní GitHub účet) a potom jim v `egd-kit` přidat přístup (člen org vidí privátní repa jen podle role/týmu: přidat tým `ucastnici` s právem Read nebo Write).
Pozvánky jsou odeslání ven k lidem z EG.D: bez Pavlova ano neodcházejí.

Zbývá: pozvánky (až po zrušení stopu a seznamu účastníků od Pavla), ověřit jestli `gh` s `read:enterprise` vidí enterprise (`gh auth refresh -s read:enterprise,admin:org` – Pavel potvrdí přihlášení).

## Otevřeno

- Číslo creditů u Copilot Free (stránky neuvádějí) → změřit v úterním testu.
- Zda Copilot je v self-service Enterprise trialu a zda jde Business seat do Free org → živě nebo dotaz na GitHub Sales.
- Trial Copilot Pro: zdroje si protiřečí (možná pozastaven) → nespoléhat.
