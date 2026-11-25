# Audit: je všechno ověřené v labu?

Kontrola kánonu z [CLAUDE.md](../CLAUDE.md) (sekce „Kánon“): ✅ ověřeno v labu s důkazem, ⚠ 📘/❓ bez
pokusu nebo ✅ bez důkazu, ⛔ jen v E.ON (výslovně s důvodem), 🔀 chybí varianty s pro a proti,
❌ rozpor mezi dokumenty nebo s labem.

- **Kolo:** 1. kolo, 22. 11. 2026 (session audit-overeni). Druhé kolo proběhne nad soubory, které autoři opraví.
- **Jak:** každý soubor četl celý jeden subagent (Sonnet, jen čtení). U 2–4 tvrzení na soubor ověřil důkaz
  (`ls`, `rg`, u části i čtení z labu přes `m365`/`az`) a hledal rozpory s ostatními soubory. Výsledky jsem
  sloučil. Hlavní nálezy jsem namátkou ověřil sám (viz „Vlastní kontrola“).
- **Počty** jsou po skupinách tvrzení, ne po větách. Slouží k porovnání souborů, ne jako absolutní míra.

## Rozsah: prošlé soubory (37, každý přečten celý)

Kořen: `00-co-mame.md`, `01-fakta-workshopu.md`, `02-skills-a-kit.md`, `03-lab.md`, `04-integrace-test-plan.md`,
`05-otevrene-body.md`, `06-azure-inventar.md`, `07-lab-trial-plan.md`, `08-ucty-ucastniku.md`,
`09-github-ucastnici.md`, `10-container-app.md`.
Sondy: `sondy/_zadani-spolecne.md`, `sondy/ai.md`, `sondy/data-prava.md`, `sondy/dokumenty.md`,
`sondy/napojeni.md`, `sondy/power-automate.md`.
Skilly: `skills/egd-pripravenost/{SKILL,README,TEST}.md` a `references/{github,prihlaseni,windows}.md`;
`skills/egd-prvni-appka/{SKILL,README,TEST}.md` a `references/{bez-kodu,chyby,rucne-v-prohlizeci,upravy}.md`;
`skills/egd-{data-seznamy,dokumenty,externi-api,llm-gateway,maily,planovane-ulohy,prava-role}/SKILL.md`.

Úplnost: glob `0*.md 10-container-app.md sondy/*.md skills/*/SKILL.md skills/*/README.md
skills/*/references/*.md skills/*/TEST.md` vrátil přesně těchto 37 souborů (3597 řádků). Mimo rozsah jsou
`zdroje/`, `prehled/`, `README.md`, `tools/` a podsložky sond.

## Souhrn podle souborů

| soubor | ✅ | ⚠ | ⛔ | 🔀 | ❌ | autor |
|---|---|---|---|---|---|---|
| [00-co-mame.md](#00-co-mame-md) | 6 | 3 | 1 | 1 | 2 | hlavní session |
| [01-fakta-workshopu.md](#01-fakta-workshopu-md) | 2 | 5 | 2 | 1 | 1 | hlavní session |
| [02-skills-a-kit.md](#02-skills-a-kit-md) | 3 | 8 | 2 | 2 | 1 | hlavní session |
| [03-lab.md](#03-lab-md) | 0 | 9 | 0 | 1 | 3 | hlavní session |
| [04-integrace-test-plan.md](#04-integrace-test-plan-md) | 8 | 6 | 1 | 2 | 6 | hlavní session |
| [05-otevrene-body.md](#05-otevrene-body-md) | 3 | 8 | 1 | 2 | 3 | hlavní session |
| [06-azure-inventar.md](#06-azure-inventar-md) | 14 | 8 | 1 | 2 | 3 | hlavní session |
| [07-lab-trial-plan.md](#07-lab-trial-plan-md) | 6 | 11 | 1 | 2 | 2 | lab-trial |
| [08-ucty-ucastniku.md](#08-ucty-ucastniku-md) | 14 | 5 | 0 | 2 | 1 | lab-ucty |
| [09-github-ucastnici.md](#09-github-ucastnici-md) | 3 | 10 | 3 | 2 | 2 | lab-github |
| [10-container-app.md](#10-container-app-md) | 11 | 6 | 2 | 4 | 4 | hlavní session |
| [sondy/_zadani-spolecne.md](#sondy-zadani-spolecne-md) | 5 | 3 | 0 | 1 | 2 | hlavní session |
| [sondy/ai.md](#sondy-ai-md) | 22 | 12 | 2 | 2 | 3 | hlavní session |
| [sondy/data-prava.md](#sondy-data-prava-md) | 14 | 10 | 1 | 3 | 1 | hlavní session |
| [sondy/dokumenty.md](#sondy-dokumenty-md) | 14 | 8 | 2 | 2 | 1 | hlavní session |
| [sondy/napojeni.md](#sondy-napojeni-md) | 13 | 6 | 1 | 2 | 1 | hlavní session |
| [sondy/power-automate.md](#sondy-power-automate-md) | 12 | 11 | 2 | 3 | 3 | sonda-power-automate |
| [skills/egd-pripravenost/SKILL.md](#skills-egd-pripravenost-skill-md) | 8 | 14 | 4 | 2 | 2 | test-pripravenost |
| [skills/egd-pripravenost/README.md](#skills-egd-pripravenost-readme-md) | 8 | 6 | 4 | 1 | 4 | test-pripravenost |
| [skills/egd-pripravenost/TEST.md](#skills-egd-pripravenost-test-md) | 5 | 7 | 3 | 0 | 2 | test-pripravenost |
| [skills/egd-pripravenost/references/github.md](#skills-egd-pripravenost-references-github-md) | 6 | 9 | 2 | 2 | 2 | test-pripravenost |
| [skills/egd-pripravenost/references/prihlaseni.md](#skills-egd-pripravenost-references-prihlaseni-md) | 2 | 8 | 0 | 2 | 1 | test-pripravenost |
| [skills/egd-pripravenost/references/windows.md](#skills-egd-pripravenost-references-windows-md) | 0 | 8 | 1 | 1 | 0 | test-pripravenost |
| [skills/egd-prvni-appka/SKILL.md](#skills-egd-prvni-appka-skill-md) | 11 | 9 | 2 | 2 | 1 | skill-prvni-appka |
| [skills/egd-prvni-appka/README.md](#skills-egd-prvni-appka-readme-md) | 9 | 7 | 1 | 1 | 2 | skill-prvni-appka |
| [skills/egd-prvni-appka/TEST.md](#skills-egd-prvni-appka-test-md) | 13 | 7 | 3 | 2 | 2 | skill-prvni-appka |
| [skills/egd-prvni-appka/references/bez-kodu.md](#skills-egd-prvni-appka-references-bez-kodu-md) | 3 | 6 | 1 | 2 | 1 | skill-prvni-appka |
| [skills/egd-prvni-appka/references/chyby.md](#skills-egd-prvni-appka-references-chyby-md) | 2 | 10 | 1 | 1 | 3 | skill-prvni-appka |
| [skills/egd-prvni-appka/references/rucne-v-prohlizeci.md](#skills-egd-prvni-appka-references-rucne-v-prohlizeci-md) | 3 | 9 | 1 | 1 | 1 | skill-prvni-appka |
| [skills/egd-prvni-appka/references/upravy.md](#skills-egd-prvni-appka-references-upravy-md) | 3 | 7 | 0 | 2 | 1 | skill-prvni-appka |
| [skills/egd-data-seznamy/SKILL.md](#skills-egd-data-seznamy-skill-md) | 8 | 6 | 1 | 1 | 1 | miniskilly |
| [skills/egd-dokumenty/SKILL.md](#skills-egd-dokumenty-skill-md) | 12 | 5 | 1 | 2 | 0 | miniskilly |
| [skills/egd-externi-api/SKILL.md](#skills-egd-externi-api-skill-md) | 4 | 6 | 0 | 1 | 1 | miniskilly |
| [skills/egd-llm-gateway/SKILL.md](#skills-egd-llm-gateway-skill-md) | 9 | 8 | 1 | 2 | 4 | miniskilly |
| [skills/egd-maily/SKILL.md](#skills-egd-maily-skill-md) | 4 | 9 | 1 | 2 | 1 | miniskilly |
| [skills/egd-planovane-ulohy/SKILL.md](#skills-egd-planovane-ulohy-skill-md) | 9 | 8 | 0 | 2 | 2 | miniskilly |
| [skills/egd-prava-role/SKILL.md](#skills-egd-prava-role-skill-md) | 7 | 8 | 2 | 1 | 1 | miniskilly |
| **celkem (37 souborů)** | **276** | **286** | **51** | **64** | **71** | |

**Obecný vzorec:** ✅ v sondách většinou stojí na skutečném měření, ale **surové výstupy chybí**. V
`sondy/*/` bývají jen skripty a definice, ne logy běhů (ai, napojeni, data-prava cesta C, power-automate,
pripravenost, prvni-appka). Důkaz se pak nedá dohledat, jen zopakovat. **Opatření pro všechny autory:**
ke každému ✅ uložit výstup příkazu do složky sondy nebo skillu (`*.out`/`*.jsonl`) a odkázat na něj.

## Top 10 rizik pro středu 25. 11.

| # | riziko | proč hrozí | kdo | dál |
|---|---|---|---|---|
| 1 | **Licence v labu skončí v den workshopu** | E5 trial končí 25. 11. v 04:04 a workshop začíná ve 12:30. Přehození SKU není rozhodnuté ani zkoušené na jednom účtu. Čísla licencí si odporují: `03` a `06` píšou 13 z 25, `05` 12 volných, `07` a `08` 23 z 25 (volné jen 2). Seznam náhradních SKU se mezi `07` a `08` liší. V `07` ř. 79 je u kontroly obsazenosti `lab-ucty-licence.py --sku`, jenže ten licenci přiděluje, správně je `--stav`. | lab-trial, lab-ucty, hlavní | 23. 11. přehodit jedno SKU na jednom účtu a ověřit SharePoint i hosty |
| 2 | **Windows a PowerShell 5.1 nikdy neběžely**, a skill se rozesílá v Po ve 12:00 | `egd-pripravenost` i `egd-prvni-appka` prošly jen na macOS. Windows je jen statická kontrola kódu. Verze Node se v dokumentech liší (18+, 22, 22.14+, 24/26). README pro ruční spuštění používá `%USERPROFILE%`, což v PowerShellu nefunguje. Portable Node 22 nikdo nezkoušel. | test-pripravenost, skill-prvni-appka | jeden celý běh na Windows VM, sjednotit Node na 22.14+/24/26 |
| 3 | **Verdikt „skill je připravený“ stojí na starší verzi** | `egd-pripravenost/TEST.md`: jediný doložený běh je z 19:29. Skript, SKILL.md a github.md se upravovaly v 19:34–19:35, takže opravy už neprošly celé. Běželo se jako Global Admin, ne jako účastník. Uložený výstup chybí. | test-pripravenost | před 12:00 jeden celý běh `nastroje` → `zprava` na finální verzi, výstup do TEST.md |
| 4 | **Schvalovatel v appce neuvidí „Ke schválení“** | Šablona `egd-prvni-appka` (`EvidenceWebPart.ts:35,85`) pozná schvalovatele podle bitu `ApproveItems` (0x10). `egd-prava-role` dává schvalovateli úroveň s `CancelCheckout` a `ApproveItems` mu nedává. Ověřil jsem v `sondy/data-prava/matrix.jsonl`: schvalovatel má `CancelCheckout`, `ApproveItems` ne. V testu to prošlo jen proto, že schvalovatel byl Vlastník webu. | skill-prvni-appka, miniskilly | sjednotit bit a projít pod účtem s úrovní „EGD Schvalovatel“ |
| 5 | **Polovina přihlášení skončí na registraci Authenticatoru** | Podle `08` skončila registrací MFA 3 ze 6 přihlášení `egd01`. `references/prihlaseni.md` o MFA nic neříká. | lab-ucty (Pavel v Entra), test-pripravenost | vyřešit výjimku z CA a doplnit krok do prihlaseni.md |
| 6 | **Nasazení s rolí Člen nikdy neproběhlo** | Test `egd-prvni-appka` běžel jako Global Admin. `chyby.md` tvrdí, že Čtenář ne a Člen ano (✅), `TEST.md` ale říká, že Čtenáře netestoval: ❌. Hosté z EG.D jsou v roli Návštěvníci, tedy nejspíš jen čtení (neměřeno). Ze 7 hostů pozvánku přijali jen 3. | skill-prvni-appka, hlavní | `nasadit --ano` pod Členem a pod Čtenářem, výstup uložit |
| 7 | **Záložní cesty A2 (ručně v prohlížeči) a B (bez kódu) nikdo neprošel** | Na ně se přejde, když CLI v E.ON nebude mít appId nebo consent, a to je pravděpodobné. Krok 4 v `rucne-v-prohlizeci.md` je při `skipFeatureDeployment: true` možná zbytečný. Popisky v UI jsou z dokumentace. | skill-prvni-appka | projít A2 a B v labu Playwrightem pod `egd01` a opravit popisky |
| 8 | **Schvalování API v admin centru nikdo neprošel** | `Mail.Send` (egd-maily), `Files.Read.All` (egd-dokumenty) a `Gateway.Use` (egd-llm-gateway) prošly jen přes Graph grant nebo se nezkoušely vůbec. Cesta SPFx → `sendMail` nikdy neběžela. `egd-maily` uvádí `AADSTS65001`, sonda ale naměřila `AADSTS65002` u jiného klienta. Nejednotné je i to, kdo schvaluje (Global Admin, nebo SharePoint admin). | miniskilly, hlavní (sondy) | v labu projít SharePoint admin centrum → API access pro jeden balíček |
| 9 | **AI demo může vypadat jako mrtvé** | Studený start gateway trvá 26 s (`min-replicas 0`), první volání po nasazení vrací 502 (příčina ❓). Kód ve skillu `egd-llm-gateway` nikdy neběžel: verze SPFx je 1.23.2, ne 1.24.1, a `GET /api/kvota` přes `_ai` neexistuje. | miniskilly, hlavní | `min-replicas 1` před středou (jen s Pavlovým ano, ≈ 8 USD/měs.) a zkopírovat kód do šablony a spustit |
| 10 | **Hlavní dokumenty si odporují se sondami** | `04` píše, že LLM gateway „nic postavené“, že APIM umí kvóty a že Job je ❓. Sondy ukazují opak. Tabulka Power Automate v `10` neodpovídá `sondy/power-automate.md`. `03` neuvádí `aoai-egd-sonda-ai`. `00` má zastaralý stav. U Power Automate je doporučená cesta „seznam jako fronta“, která se nikdy nespustila. Chyba 409 u HTTP může mít jinou příčinu než licenci (v ppf-rooms HTTP pod E5 doběhlo). | hlavní, sonda-power-automate | přepsat 03, 04, 10 a 00 podle sond a frontu spustit |

Další rizika, která se do top 10 nevešla:
- Copilot Free jako záloha má neznámé limity (`09`, `references/github.md`).
- Adresa firemního GitHubu EG.D zatím není známa.
- Výdejní stránka hesel přes „Anyone with link“ se v anonymním okně nezkoušela (`08`).
- Kořenový web labu je zapisovatelný pro všechny (`08`).
- `m365 spo field set --Indexed true` nikdo nespustil (`egd-data-seznamy`).
- Kód pro OCR PDF nebyl ověřen.

## Vlastní kontrola (audit-overeni, 22. 11.)

| tvrzení auditu | jak ověřeno | výsledek |
|---|---|---|
| Šablona testuje `ApproveItems` 0x10 | `rg PRAVO_SCHVALOVAT templates/evidence/.../EvidenceWebPart.ts` | ✅ ř. 35, 85 |
| Úroveň „EGD Schvalovatel“ nemá `ApproveItems` | `jq` nad `sondy/data-prava/matrix.jsonl` | ✅ `approve:false, cc:true` |
| `egd-prvni-appka/SKILL.md` píše „Node 18+“ | `rg -n 'Node 18\+'` | ✅ ř. 36 |
| Propagace web partu ✅ ve SKILL × ❓ v TEST | `rg propagace` | ✅ SKILL ř. 126, TEST ř. 26 |
| Licence: 13 z 25 × 23 z 25 | `rg` přes 03, 05, 07 | ✅ 03:12, 05:12, 07:10 |
| `egd-maily` `AADSTS65001` × sonda `65002` | `rg AADSTS6500` | ✅ maily:32, napojeni:77 |
| `04` „LLM gateway nic postavené“ | `rg` | ✅ 04:19 |

Neověřeno mnou: tvrzení subagentů o devkitu (`plugin.json` 0.7.0 v tagu v0.8.0). Cesta k pluginu se
v lokálním checkoutu liší a agent měřil přes `git show` v jiném adresáři.

## Nálezy po souborech

Každá sekce obsahuje namátkové ověření důkazů, tabulku a rizika. Ve sloupci „co udělat“ je formulace pro autora: „ověř
v labu, nebo napiš proč nejde“, případně „doplň varianty s pro a proti“.


<a id="00-co-mame-md"></a>
### `00-co-mame.md` (autor: hlavní session)

**Namátka důkazů:**

- „5 obecných skillů v `~/.claude/skills/`" → `~/.claude/skills/` a 02-skills-a-kit.md:5-19 → ano. Všech 5 existuje (sharepoint-tenant-recon, spfx-ship, m365-cli-safe, spfx-develop, spfx-performance) a odpovídají tabulce v 02.
- „Custom Script ani PnP nejsou potřeba, brzdou je role na webu katalogu" → `~/Projects/ppf-arcade/odpoved-adriane.md:12,22,29` → ano. Řádek 83 má i kontrolní pokus `Deny=2` + `requiresCustomScript:false`. Počty „35 ověřeno / 6 vyvráceno" sedí s `zdroje/chocholous-net.md:23`, ale to je jen výtah ze stránky artefaktu. Samotný artefakt jsem neotevíral.
- „3 dema, `.sppkg` připravené" → `~/Projects/egd-vibecoding/{digi-podnety,eon-demo-kalkulacka,eon-demo-statistiky}/sharepoint/solution/*.sppkg` → ano, všechny 3 existují. Nahrání kalkulačky do labu má důkaz v 08-ucty-ucastniku.md:117 (200).

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `00-co-mame.md` | 10 | Custom Script a PnP nejsou potřeba, `?env=WebView`, brzdí role na webu katalogu | ✅ | Důkaz je v `odpoved-adriane.md`. U odkazu na artefakt doplnit i soubor s počty (35/6 je jen v zdroje/chocholous-net.md). | hlavní session |
| `00-co-mame.md` | 10 | „jen macOS, jen lab tenant" | ⛔ | OK. Omezení je výslovně napsané. Doplnit důvod („Windows a tenant E.ON nejsou k dispozici v labu") a odkaz na 02:37-38. | hlavní session |
| `00-co-mame.md` | 11 | Návod SPFx pro AILab se štítky povoleno / zakázáno / nevíme | ⚠ | Odkaz vede jen na artefakt (v15, „work in progress"). Podle 02 čeká ~37 položek „v EG.D nevíme". Štítky „povoleno / zakázáno" pocházejí z podkladů EG.D (01:66-71), ne z labu. Ověř v labu, nebo označ jako ⛔ s důvodem a napiš, kdo je u EG.D potvrdí. | hlavní session |
| `00-co-mame.md` | 12 | 5 obecných skillů, jen lokálně | ✅ | Existují. Kánon (skill nesmí stát na 📘): 02 sám říká „ne 100 %". Doplnit odkaz na `references/verified.md`. | hlavní session |
| `00-co-mame.md` | 13 | Kit 0.8.0 funguje i v Copilot CLI | ⚠ | „Funguje v Copilot CLI" je jen 📘 podle 01:98 a 05:14 (běh v Copilot CLI na Windows nezměřený). Ověř, nebo napiš proč nejde. | hlavní session |
| `00-co-mame.md` | 13 | Kit 0.8.0 vs. `plugin.json` v tagu | ❌ | 02:41 uvádí, že `plugin.json` v tagu `v0.8.0` hlásí 0.7.0. V 00 chybí zmínka o rozporu. Opravit nebo doplnit poznámku. | hlavní session |
| `00-co-mame.md` | 13 | Windows a jiný tenant neověřené | ⛔ | OK, výslovně napsané. Chybí důvod a návrh ověření (např. Windows VM v labu). Doplnit. | hlavní session |
| `00-co-mame.md` | 14 | Lab tenant, hosté z EG.D, přijali 3 ze 7 | ✅ | Sedí s 03 a 05:11. Stav se může změnit, doplnit datum. | hlavní session |
| `00-co-mame.md` | 14 | (implicitně) hosté mohou v labu pracovat | ⚠ | 03:49-51 říká „nejspíš jen čtení, neměřeno" (Visitors). Ověř pod hostem, nebo v 00 napiš „neměřeno". | hlavní session |
| `00-co-mame.md` | 15 | SPFx → vlastní server (Container App / Functions) tokenem uživatele | 🔀 | Varianty jsou ověřené (CA, Functions, Power Automate: 04:14-17), ale 00 jmenuje jen jednu cestu. Doplnit varianty s pro a proti, požadavky na IT E.ON a náročnost pro citizen developera (viz 10-container-app.md). | hlavní session |
| `00-co-mame.md` | 16 | Rozbor Power Automate (standard vs. Premium) | ✅ | Sedí s `power-automate.md`. Tenant E5 → jen standardní konektory je tam označené 📘. Doplnit v labu, nebo napsat proč nejde. | hlavní session |
| `00-co-mame.md` | 17 | 3 dema ve vizuálu EG.D, `.sppkg` připravené | ✅ | Existují a kalkulačka je nasazená (08:117). Dvě zbylá dema bez důkazu nasazení (jen existence souborů). | hlavní session |
| `00-co-mame.md` | 19-27 | „Rozpracované (běží teď)": 4 sondy a skill `egd-prvni-appka` | ❌ | Zastaralé. `sondy/` má už i `power-automate.md`; `skills/` má 9 skillů (egd-data-seznamy, egd-dokumenty, egd-externi-api, egd-llm-gateway, egd-maily, egd-planovane-ulohy, egd-prava-role, egd-pripravenost, egd-prvni-appka). Aktualizovat stav a doplnit sondu power-automate a skilly. | hlavní session |
| `00-co-mame.md` | 29-34 | Chybí: rozhodnutí o účtech pro účastníky | ❌ | Rozpor s 08-ucty-ucastniku.md (účty egd01–egd10, výdej, skripty). Soubory 06–10 (inventář, trial plán, účty, GitHub, Container App) 00 vůbec nezmiňuje. Opravit „Chybí" a doplnit do rozcestníku. | hlavní session |
| `00-co-mame.md` | 29-39 | Chybí: ZIP, Windows, tenant E.ON, AI Engineering Library, účet ppf.cz | ⛔ | Seznam otevřených úkolů (ne tvrzení). Platí, že jde jen v E.ON / jinde. U každé položky doplnit důvod a jak/kde ověřit (některé jsou v 05). | hlavní session |
| `00-co-mame.md` | 2-4 | Definice stavů hotové / rozpracované / chybí | ⚠ | „Hotové" zahrnuje položky s 📘/neověřeno (ř. 11, 13). Přidat značky ✅/📘/❓ podle kánonu, ať je u každého řádku vidět stav ověření. | hlavní session |

**Riziko pro středu:**

1. Hosté z EG.D mají v labu nejspíš jen čtení (neměřeno), 4 ze 7 pozvánku nepřijali, takže blok „první appka v labu" ve 13:00 nemusí fungovat. Vysoké.
2. Návod pro AILab a skilly stojí z velké části na štítcích „v EG.D povoleno / nevíme" a na prostředí macOS + lab. Na Windows v tenantu E.ON může cesta nasazení selhat. Střední až vysoké.
3. Zastaralé 00-co-mame.md (chybí účty egd01–egd10, sondy a skilly už hotové) může účastníky nebo Pavla zmást při rozhodování, co už je připravené. Nízké až střední.


<a id="01-fakta-workshopu-md"></a>
### `01-fakta-workshopu.md` (autor: hlavní session)

**Namátka důkazů:**

soubor má jen jedno tvrzení typu ✅, tak jsem ověřil i odkazované doklady v sousedních dokumentech):
- ř. 69 „CLI for M365 je npm, jde lokálně do projektu“ → 04-integrace-test-plan.md:13 (✅, skill `m365-cli-safe`) a 02-skills-a-kit.md:14 → nalezeno ano.
- ř. 15 a 98 „devkit 0.8.0“ → 02-skills-a-kit.md:29 (0.8.0, release 15. 11.) → nalezeno ano. Zároveň 02:41 uvádí rozpor verzí (viz ❌ níže).
- ř. 68 „Snake, SPFx 1.18.2, gulp“ → skills/egd-prvni-appka/references/chyby.md:46 (1.18.2 + gulp, build šablony na Node 22.23 ✅) → nalezeno ano.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `01-fakta-workshopu.md` | 69 | „Naše měření: CLI for M365 je npm, jde lokálně“ | ✅ | doplň odkaz na 04:13, ať je důkaz dohledatelný | hlavní session |
| `01-fakta-workshopu.md` | 15, 98 | devkit 0.8.0, funguje i v GitHub Copilot CLI | ❌ | 02:41: `plugin.json` ve tagu v0.8.0 hlásí 0.7.0. Sjednoť číslo verze v 01, 02 a 00. Tvrzení o Copilot CLI v 00:13 vede jako „Windows a jiný tenant neověřené“, tak to přenes. | hlavní session |
| `01-fakta-workshopu.md` | 97 | „Copilot se skills funguje (pomaleji než Claude)“ | ⚠ | jen Pavlův citát z 12.–16. 11. Ověř v labu měřením (příkaz, čas) a odkaž na důkaz, nebo označ „neověřeno“. | hlavní session |
| `01-fakta-workshopu.md` | 21, 97 | Rozhodnutí nástroje Copilot vs. Claude | 🔀 | nejsou rozepsané varianty (Copilot, Claude, devkit v obou) s pro a proti, požadavky na IT E.ON a náročností pro citizen developera. Doplň, nebo odkaž na dokument, kde varianty jsou. | hlavní session |
| `01-fakta-workshopu.md` | 97 | Power Automate a LLM gateway „zkoumám v labu“ | ⚠ | v souboru není výsledek ani odkaz na sondu. Odkaž na `sondy/power-automate.md` a `sondy/ai.md`, nebo označ „neověřeno“. | hlavní session |
| `01-fakta-workshopu.md` | 60-62 | Galíkův cíl: SPFx nad listy bez Azure hostingu a bez per-user licencí | ⚠ | jde o požadavek a z něj plyne, co je pro EG.D přípustné, ale nikde není ověřeno, které z 7 funkcí (ř. 50-58) se tak dají splnit. Odkaž na tabulku v 04 s výsledky jde / nejde. | hlavní session |
| `01-fakta-workshopu.md` | 70-72 | E.ON: Custom Script na 24 h přes sharepoint@eon.com, site collection app catalog na žádost | ⛔ | je to výrok E.ON z ticketu SHO-5032. Napiš výslovně „v labu neověřitelné, platí jen v tenantu E.ON“ a doplň, že lab Custom Script nepotřebuje (00:10). | hlavní session |
| `01-fakta-workshopu.md` | 72-73 | tři weby DEV/TEST/PROD a licence Copilotu: „stav podání neznámý“ | ⛔ | napiš výslovně, že to jde zjistit jen u Adriány, a přidej termín dotazu (před středou). | hlavní session |
| `01-fakta-workshopu.md` | 74 | Pavel je v tenantu EG.D host, stránky se „někdy zobrazí, někdy ne“ | ⚠ | jen citát z 6. 11., bez pokusu o ověření. Ověř nebo označ jako neověřené, zvlášť když se k tomu váže blok „průzkum prostředí E.ON“ (ř. 35). | hlavní session |
| `01-fakta-workshopu.md` | 93 | „7 lidí z EG.D pozváno jako hosté“ | ⚠ | v seznamu účastníků na ř. 11 je 6 jmen. 00:14 říká „přijali jen 3 ze 7“, 05:11 vyjmenovává 3 nepřijaté a 4 jsou v součtu. Sjednoť to a odkaž na 03-lab.md:46-49. | hlavní session |
| `01-fakta-workshopu.md` | 18 | „co v prostředí funguje, kde se narazí a jak to obejít“ | ⚠ | jde jen o cíl, ne o tvrzení. Přidej odkaz na 04 a 05, kde jsou výsledky. | hlavní session |

**Riziko pro středu:**

1. Hosté z EG.D se v labu nejspíš nepřihlásí nebo mají jen čtení (4 ze 7 pozvánku nepřijali, role Visitors je odvozená, ne měřená) a blok „první appka v labu“ ve 13:00 se zasekne. Hodnocení: vysoké.
2. Verze devkitu se v dokumentech rozchází (0.7.0 v `plugin.json` vs. 0.8.0 v katalogu) a Copilot CLI nikdo neměřil. Účastníci mohou dostat jinou verzi, než jakou jsme testovali. Hodnocení: střední.
3. Licence Copilotu a weby DEV/TEST/PROD v E.ON mají „stav podání neznámý“. Když to není vyřízené, účastníci nemají kam nasadit ani čím psát. Hodnocení: střední až vysoké.


<a id="02-skills-a-kit-md"></a>
### `02-skills-a-kit.md` (autor: hlavní session)

**Namátka důkazů:**

- Verze 0.8.0, release 15. 11. → ř. 29 → `gh release list` vrací „0.8.0 Latest v0.8.0 2026-11-15T20:39Z“ → ano.
- „plugin.json v tagu v0.8.0 hlásí 0.7.0“ → ř. 41 → `git show v0.8.0:plugin/ppf-citizen-ai-devkit/.claude-plugin/plugin.json` dává `"version": "0.7.0"`. Totéž je na `origin/main`. → ano.
- Lokální `~/Projects/ppf-spfx-devkit` pozadu za `origin/main` → ř. 30 → po `git fetch` je `main...origin/main [behind 42]` → ano.
- Skilly leží v `~/.claude/skills/` (ř. 7) → všech 5 adresářů existuje, `spfx-develop` uvádí „SPFx 1.24.1 / Heft 1.3.2 / Node 22.23.3“ → ano. `~/.claude/skills` není git repo, což souhlasí s „nejsou v gitu“.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `02-skills-a-kit.md` | 7–8 | 5 skillů leží jen lokálně, nejsou v gitu ani katalogu | ✅ | (adresáře existují, `~/.claude/skills` není git repo) | hlavní session |
| `02-skills-a-kit.md` | 15 | spfx-develop: SPFx 1.24.1, Node 22, Heft | ✅ | (potvrzeno v SKILL.md; pro souběh s 1.18.2 viz ř. 15 níže) | hlavní session |
| `02-skills-a-kit.md` | 29, 41 | Verze 0.8.0, rozpor plugin.json 0.7.0 vs. tag | ✅ | Chybí odkaz na důkaz u rozporu. Doplň příkaz a dopad (zda `/plugin install` ukáže 0.7.0). | hlavní session |
| `02-skills-a-kit.md` | 9–16 | „Použitelné“ jako celek, bez značky a bez odkazu na test skillů v labu | ⚠ | Doplň odkaz na důkaz u každého skillu (`verified.md`, TEST.md), nebo napiš, že jsou ověřené jen na PPF webu a v labu. | hlavní session |
| `02-skills-a-kit.md` | 12 | `sharepoint-tenant-recon` „první krok v EG.D“, výstup funguje/blokováno/věta pro IT | ⛔/⚠ | V E.ON tenantu to v labu nejde. Napiš výslovně „neověřeno v E.ON“ a kdy se to zkouší (pondělní zkouška). | hlavní session |
| `02-skills-a-kit.md` | 13 | spfx-ship uvádí CLI 11.x, „sjednotit s CLI 12“ | ⚠ | Skill používá `CLI 11`, devkit závisí na `m365-cli-12`. Sjednoť, nebo napiš, co se stane s příkazy `spo app add/deploy/install` na CLI 12. Ověř v labu. | hlavní session |
| `02-skills-a-kit.md` | 14 | m365-cli-safe: řeší blokovanou PSGallery (CLI je npm) | ⚠ | Doplň důkaz (instalace přes npm bez PSGallery v labu). V E.ON je proxy/npm mirror neověřený, viz `skills/egd-prvni-appka/TEST.md:70`. Napiš to sem. | hlavní session |
| `02-skills-a-kit.md` | 15 | „EG.D má 1.18.2 + gulp“ vs. skill pro 1.24.1/Heft | 🔀 | Chybí cesta pro stávající 1.18.2/gulp (Node 18 portable). Doplň varianty (zůstat na 1.18.2+gulp, nebo 1.24+Heft) s pro a proti a s nároky na IT a citizen developera. Podklady jsou v `skills/egd-prvni-appka/references/chyby.md:46`. | hlavní session |
| `02-skills-a-kit.md` | 15 | „gulp od 1.24 nepodporovaný“ | ⚠ | Napsáno jako fakt bez značky. Jinde je označeno 📘 (`skills/egd-prvni-appka/SKILL.md:115`). Ověř v labu (scaffold 1.24 s gulpem), nebo označ 📘. | hlavní session |
| `02-skills-a-kit.md` | 19 | „cca 37 položek ‚v EG.D nevíme‘ čeká na ověření“ | ⚠ | Číslo nemá zdroj v projektu (`rg` ho jinde nenašel). Odkaž na seznam, nebo číslo odstraň. | hlavní session |
| `02-skills-a-kit.md` | 18 | Chybí verzování a distribuce pro účastníky | ⚠ | Je to jen konstatování, nic z toho neplyne. Navazuje na ř. 54. Doplň rozhodnutí a způsob distribuce. | hlavní session |
| `02-skills-a-kit.md` | 27–28 | Repo a katalog na PPF GHE (internal), lidé z EG.D k nim nemají přístup | ⚠ | Tvrzení je odvozené (internal viditelnost), v labu neověřené. Ověř `gh repo view` (visibility) a pokus o přístup pod účtem bez PPF GHE. | hlavní session |
| `02-skills-a-kit.md` | 32 | Prerekvizity: Node 22.14+/24/26, DEV web s vlastnictvím a site app catalogem | ⚠ | Bez důkazu. Odkaž na test v labu (`skills/egd-pripravenost/TEST.md`). | hlavní session |
| `02-skills-a-kit.md` | 33, 38 | Funguje i v GitHub Copilot CLI (0.7.1+) | ⚠ | Důkaz je jen zkouška prototypu s Copilot CLI 1.0.91 na macOS (`docs/vydani-0.8.md:4` v repu devkitu). Nic není z labu EG.D, tedy Windows ani E.ON tenant. Doplň odkaz na důkaz. | hlavní session |
| `02-skills-a-kit.md` | 37–38 | Ověřeno jen na macOS proti PPF MeetAI-Dev; Windows, Edge a jiný tenant neměřeno | ⛔ | Dobře uvedeno jako riziko. Dopiš výslovně, jak a kdy to ověřit (Windows VM, E.ON). | hlavní session |
| `02-skills-a-kit.md` | 41 | Rozpor verzí plugin.json 0.7.0 vs. katalog 0.8.0 | ❌ | Tag v0.8.0 i `origin/main` mají 0.7.0, `00-co-mame.md:13` a `01-fakta-workshopu.md:98` říkají „devkit 0.8.0“. Oprav 0.7.0→0.8.0 v pluginu, nebo napiš, co se instaluje. Ověř, co skutečně nainstaluje `/plugin install` z katalogu. | hlavní session |
| `02-skills-a-kit.md` | 42–43 | `project_config.json` pro lab tenant ani E.ON není vyzkoušený | ⚠ | Pro lab ověř v labu (`pavelchocholousgmail`) a výsledek zapiš. E.ON zůstává ⛔. Dnes to jde v rozporu s `ppf-citizen-ai-devkit` (ověřeno jen PPF). | hlavní session |
| `02-skills-a-kit.md` | 47–48 | Export od Adriány: 117 skills, 5 MCP, 3 hooky, 9 promptů, 2 CI šablony, 2,85 MB | ⚠ | Čísla pocházejí z mailu, zip nikdo neotevřel (ř. 50). Otevři zip a čísla ověř, nebo označ „podle mailu, neověřeno“. | hlavní session |
| `02-skills-a-kit.md` | 48–50 | Klíčové E.ON skilly a „porovnání slíbeno, zip neotevřen“ | ⚠ | Čeká se na otevření zipu. Soubor jinde (`05-otevrene-body.md:27`) vede jako otevřený bod, tady chybí ref. | hlavní session |
| `02-skills-a-kit.md` | 53–57 | Návrh pro workshop: ZIP, E.ON vrstva, Copilot na Windows | 🔀 | Jediná cesta (ZIP) bez variant. Doplň alternativy distribuce (ZIP, kopie repa mimo GHE, katalog na veřejném GitHubu) s pro a proti a nároky na IT E.ON a citizen developera. | hlavní session |
| `02-skills-a-kit.md` | 57 | Skills/kit běží v GitHub Copilot CLI na Windows, licence přes ServiceNow | ⛔ | Výslovně označeno jako „ověřit“. Doplň důvod, proč nejde v labu (chybí Windows a licence), a návrh zkoušky (viz `09-github-ucastnici.md`, Copilot Free). | hlavní session |

**Riziko pro středu:**

1. Vysoká: kit je jen na PPF GHE (internal) a EG.D k němu nemá přístup. ZIP ani distribuční cesta ještě nejsou ověřené. Pokud se nic nepřipraví, účastníci nemají co instalovat.
2. Vysoká: nic z devkitu ani ze skillů není vyzkoušené na Windows ani v E.ON tenantu (Node 22 portable, proxy/npm, katalog, `m365 login`, Copilot CLI). Selhat může první krok po příchodu na místo.
3. Střední: EG.D má SPFx 1.18.2 + gulp a skilly míří na 1.24.1 + Heft. Pro existující `.sppkg` a stroje chybí varianta, a verze v `plugin.json` (0.7.0) nesedí s tím, co dokumentace slibuje (0.8.0).


<a id="03-lab-md"></a>
### `03-lab.md` (autor: hlavní session)

**Namátka důkazů:**

soubor nemá ✅ s odkazem; ověřeno, co se dalo):
- Hesla účtů v `~/Projects/ppf-rooms/lab/lab.secrets.json` (ř. 15) → soubor existuje, práva 0600 → ano (obsah jsem neotevíral).
- Custom Script Deny=2 na `/sites/noscripttest` (ř. 27) → `~/Projects/ppf-arcade/odpoved-adriane.md:14,83` potvrzuje pokus Deny=2 + `requiresCustomScript:false`, ale `noscripttest` a `sitecatalogtest` se tam nevyskytují → částečně. Název webu není v důkazu.
- 7 hostů z EG.D, 3 přijali (ř. 36–45) → `05-otevrene-body.md:11` a `00-co-mame.md:14` souhlasí (3 ze 7) → ano. Stav `čeká` se ale nedá dohledat v žádném uloženém výstupu.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `03-lab.md` | 11–12 | Správce, GA, E5 `SPE_E5` 13 z 25 | ❌ | Rozpor: `07-lab-trial-plan.md:10` uvádí 23 z 25 (13 původních + egd01–10). Aktualizuj číslo a připiš, že trial končí 25. 11. 04:04 (`06-azure-inventar.md:77`). | hlavní session |
| `03-lab.md` | 12 | Licence BP+Copilot (1), Agent 365 (25), Flow Free | ⚠ | Ověř příkazem `az rest … subscribedSkus`, nebo uveď zdroj. V `06-azure-inventar.md` chybí. | hlavní session |
| `03-lab.md` | 13 | Pay-as-you-go účet v `copilot-credits-rg` | ⚠ | Napsáno „neověřeno“, což je OK jako stav. Ověř v Power Platform admin centru, nebo napiš proč nejde (`06:20`: BAP endpointy vracejí 404). | hlavní session |
| `03-lab.md` | 14 | m365 CLI appka nemá Graph práva (AADSTS65001) | ⚠ | Připoj důkaz: příkaz a výstup chyby, nebo odkaz na sondu. | hlavní session |
| `03-lab.md` | 17–18 | Druhý tenant `M365x04523031` nemá SharePoint (DNS nic nevrací), LabAdmin2 není GA | ❌ | `06-azure-inventar.md:84–86` píše „Nezjištěno“ (az nemá token). Buď doplň důkaz (`nslookup`, výstup), nebo změkči na ⚠. | hlavní session |
| `03-lab.md` | 22–29 | URL webů, stránky `arcade-home`, `workflow`, `pacman` | ⚠ | Připoj ověření (HTTP 200 / `m365 spo site list`) a datum. Řádek 29 říká, že 14 webů existuje (`07:34`), ale seznam má jen 8. | hlavní session |
| `03-lab.md` | 31 | Zdrojáky Pacman/Guide/ArcadeHome ztraceny | ⚠ | Ověř, že nejsou nikde (`~/Projects/ppf-arcade`, GitHub `chocholous/ppf-arcade` podle `README.md:37`). Je to riziko, pokud je někdo má upravit. | hlavní session |
| `03-lab.md` | 36–45 | Stavy hostů (3 přijato, 4 čeká, 1 není pozvaná) | ⚠ | Z výstupu příkazu z ř. 53 ulož výsledek do souboru a odkaž na něj. Nesedí „7 z EG.D“ s `07:34` „8 hostů“ (včetně testovacího ppf.cz, tedy v pořádku). | hlavní session |
| `03-lab.md` | 48 | Hosté ve skupině „App catalog Visitors“ | ⚠ | Ověř skupinu (m365/az). Nikde jinde není. | hlavní session |
| `03-lab.md` | 48–52 | Hosté mají jako Visitors nejspíš jen čtení (neměřeno) | 🔀 | Zkus pod hostem (nebo testovacím účtem ve skupině Visitors): nasazení balíčku. Popiš varianty „lab účty pro každého“ / „role na DEV webu“ s pro a proti, nároky na IT a náročností. Odkazuje se na `05`, kde je jen jedna věta. | hlavní session |
| `03-lab.md` | 52 | „Volných E5: 12“ (v `05:12` také) | ❌ | Rozpor: podle `07:10` jsou volné jen 2 z 25 (23 přiděleno). Oprav v obou souborech. | hlavní session |
| `03-lab.md` | 60 | `rg-ppf-rooms-lab`: ověřený vzor SPFx → API s OBO, env a ACR jde sdílet | ⚠ | Slovo „ověřený“ a „jde sdílet“ doplň odkazem na důkaz (`sondy/ai.md` nebo ppf-rooms). | hlavní session |
| `03-lab.md` | 61 | APIM = kandidát na AI gateway; Postgres = „databáze s editací“ | ⚠ | Rozpor s `sondy/ai.md:170`: Consumption nemá limit tokenů ani kvótu na klíč. Opravit: „kandidát“ neplatí pro Consumption. Postgres má účtováno 0 ❓ (`06:52`). | hlavní session |
| `03-lab.md` | 62 | Premium konektory pay-as-you-go (ověřit) | ⚠ | Ověř, nebo napiš, že jde jen v admin centru (viz `04-integrace-test-plan.md:33`). | hlavní session |
| `03-lab.md` | 64 | Není tam Azure OpenAI ani AI Foundry | ❌ | Rozpor: `sondy/ai.md:78` — účet `aoai-egd-sonda-ai` (swedencentral, `gpt-4.1-mini`) vznikl v labu. Oprav. | hlavní session |
| `03-lab.md` | 64 | Budget `mcp-lab-budget` = 20 / měsíc | ⚠ | Chybí měna (EUR podle `06:30`) a že je překročen (22,83 EUR). | hlavní session |
| `03-lab.md` | 14,60–62 | Přehled RG a zdrojů | ⚠ | Není úplný: inventura `06-azure-inventar.md` uvádí i `rg-egd-sonda-ai` a další. Nahraď odkazem na `06`, ať se nerozchází. | hlavní session |

**Riziko pro středu:**

1. VYSOKÉ: Hosté z EG.D (4 ze 7 nepřijali, ř. 41–44) nejspíš nemají právo vyvíjet ani nasazovat (ř. 48–49, neměřeno). V bloku „první appka“ (13:00) by účastníci neměli kam nasadit. Změř pod testovacím účtem ve skupině Visitors a rozhodni variantu.
2. VYSOKÉ: Trial E5 končí 25. 11. v 04:04, před začátkem workshopu v 12:30 (`07:15`). Soubor to neuvádí a drží zastaralé „13 z 25“ a „12 volných“, takže plán s lab účty může počítat s licencemi, které už nebudou.
3. STŘEDNÍ: Chybí zdrojáky Pacman/Guide/ArcadeHome (ř. 31). Pokud se při workshopu rozbijí nasazené balíčky, nejdou opravit ani znovu nasadit.


<a id="04-integrace-test-plan-md"></a>
### `04-integrace-test-plan.md` (autor: hlavní session)

**Namátka důkazů:**

- Web part běží při zablokovaném Custom Script → `~/Projects/ppf-arcade/odpoved-adriane.md:12-15` (`requiresCustomScript: false`, `DenyAddAndCustomizePages = 2`) → ano
- Power Automate: standardními konektory vlastní API nejde, HTTP s Entra ID = Premium → `~/Projects/ppf-rooms/docs/power-automate.md:15,75` (`tier: Premium` z API) a §6 řádek 5 (běh `…CU19` Succeeded) → ano
- SPFx `AadHttpClient` na vlastní API → `ppf-rooms/spfx/src/webparts/zasedacky/mistnostiGraph.ts:83` a `docs/prava.md:81` → ano. Souborově ověřeno, v labu nespuštěno.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `04-integrace-test-plan.md` | 12 | SPFx běží při zablokovaném Custom Script | ✅ | Důkaz: odpoved-adriane.md:12-15. Zdroj je ale z jiného projektu (ppf-arcade, 6. 11.), ne z lab tenantu egd. Doplň, že jde o PPF tenant, nebo zopakuj v labu. | hlavní session |
| `04-integrace-test-plan.md` | 13 | Deploy přes CLI M365 z npm, bez PSGallery a admina | ✅ | Odkaz „tamtéž“ je vágní. Doplň konkrétní řádek. | hlavní session |
| `04-integrace-test-plan.md` | 14 | `AadHttpClient` + `webApiPermissionRequests` | ✅ | Důkaz: mistnostiGraph.ts:83. Kód existuje, ale přímý doklad `webApiPermissionRequests` nebyl v odkazovaných souborech nalezen (rg našel jen `AadHttpClient`). Doplň odkaz na `package-solution.json`. | hlavní session |
| `04-integrace-test-plan.md` | 15–16 | Container App s Easy Auth + OBO + audit; Function App s MI | ✅ | Soubory existují (obo.md, lab/README.md:15). V obo.md:95 je ale řádek, že lab má systémovou MI a OBO funguje jen s uživatelskou MI. Upřesni, co přesně běželo. | hlavní session |
| `04-integrace-test-plan.md` | 17 | Power Automate volá vlastní API, přesun proběhl | ✅ | Důkaz: power-automate.md §6 řádek 5. Přidej, že šlo o vestavěné HTTP s krátkodobým tokenem a testovací flow bylo smazáno. Produkční konektor je ❓ nespuštěný (§6 řádek 7). | hlavní session |
| `04-integrace-test-plan.md` | 18 | Standardní konektory vlastní API nezavolají, potřeba Premium | ✅ | Ověřeno tier z API (§1, ř. 75). Chybí 📘 značka u „E5 = jen standard“ pro úplnost. Nově viz sondy/power-automate.md: flow s HTTP akcí se v labu nedá zapnout (409). Doplň to jako silnější důkaz. | hlavní session |
| `04-integrace-test-plan.md` | 19 | LLM gateway: „nic postavené, v subscription není žádný LLM endpoint“ | ❌ | Rozpor s sondy/ai.md:11-14,78 a 10-container-app.md:27: gateway postavená a změřená (chat 0,9 s, OCR 1,2 s, vision 2,2 s, kvóta 429), účet `aoai-egd-sonda-ai`. Přepiš řádek na ✅ s odkazem na sondy/ai.md. | hlavní session |
| `04-integrace-test-plan.md` | 22–24 | Závěr: „LLM gateway je zatím jen návrh“; Premium PA jen na vlastní API | ❌ | Zastaralé (sondy/ai.md). Přepiš závěr. Doplň sondy/power-automate.md: LLM přes Foundry Inference konektor je Standard ✅, plánované úlohy (Recurrence) Standard ✅. | hlavní session |
| `04-integrace-test-plan.md` | 20 | Cokoli z toho v E.ON tenantu | ⛔ | Napsáno ❓ bez důvodu. Doplň: „v labu nejde, E.ON tenant nemáme; ověřit u Galíka/IT“. | hlavní session |
| `04-integrace-test-plan.md` | 28–30 | Schválení API přístupu adminem E.ON | ⚠ | Postup je 📘 bez značky a bez pokusu. Značky chybí. Ověř v labu, že `.sppkg` s `webApiPermissionRequests` čeká na schválení v API access, nebo napiš proč nejde. | hlavní session |
| `04-integrace-test-plan.md` | 31–34 | Container App potřebuje subscription a Entra registraci; sdílená platforma | 🔀 | Chybí pro a proti variant (sdílená platforma vs. nic). Doplň „co chce IT E.ON“ a náročnost pro citizen developera. Odkaž na 10-container-app.md, ne duplikuj. | hlavní session |
| `04-integrace-test-plan.md` | 33–34 | Premium PA: per-user / per-flow / PAYG; bez něj jen schvalování, notifikace, Outlook/Teams | ⚠ | Licenční modely jsou 📘 bez značky. „Bez něj zbývá jen…“ je zastaralé: sondy/power-automate.md ukazuje i Standard Recurrence a LLM přes Foundry konektor. Oprav a označ 📘. | hlavní session |
| `04-integrace-test-plan.md` | 35 | Odchozí síť ze SPFx na `*.azurecontainerapps.io` neznámé | ⛔ | Čestně ❓, ale chybí důvod ani návrh ověření. Doplň „v labu jde (gateway), v síti E.ON neověřitelné; ověř při hostu z EG.D“. | hlavní session |
| `04-integrace-test-plan.md` | 41 | Databáze s editací: SharePoint listy ✅, Postgres přes API | ⚠ | „✅ devkit to umí“ bez odkazu na důkaz. Postgres přes API bez značky. Doplň odkaz (sondy/data-prava.md) a stav. | hlavní session |
| `04-integrace-test-plan.md` | 42 | LLM přes gateway bez Azure ❌ / s gateway „✅ návrh níž“ | ❌ | „návrh“ je dnes změřeno (sondy/ai.md). Přepiš. | hlavní session |
| `04-integrace-test-plan.md` | 43 | Generování PDF/Word/PPT/Excel: v prohlížeči ❓, na serveru ✅ | ⚠ | „✅ na serveru“ bez důkazu. Existuje sondy/dokumenty.md. Odkaž na něj a rozliš, co je změřeno. | hlavní session |
| `04-integrace-test-plan.md` | 44 | Práva: `EffectiveBasePermissions` ✅ (digi-podnety) | ⚠ | Projekt „digi-podnety“ v ~/Projects neexistuje (ověřeno `ls`). Důkaz nedohledatelný. Odkaž na skills/egd-prava-role/SKILL.md nebo sondy/data-prava.md. | hlavní session |
| `04-integrace-test-plan.md` | 45 | Externí API/scraping: ❌ bez Azure (CORS) | 🔀 | Chybí cesta přes PA (HTTP = Premium) a změřené „✅ ČNB z Jobu, z prohlížeče zablokované“ (sondy/napojeni.md). Doplň varianty. | hlavní session |
| `04-integrace-test-plan.md` | 46 | E-maily: std. PA ✅ 📘 / Graph `Mail.Send` ✅ v ppf-rooms | ⚠ | Hybridní značka ✅ 📘 je nejasná. Nově je e-mail s přílohou ✅ z Jobu (sondy/napojeni.md:56-57), PA flow ❓ čeká na přihlášení. Oprav. | hlavní session |
| `04-integrace-test-plan.md` | 47 | Denní úloha: Container Apps Job (cron) ❓ | ❌ | Rozpor: sondy/napojeni.md:59 a 10-container-app.md:29 mají ✅ Job se spustil podle cronu a poslal mail. Přepiš. | hlavní session |
| `04-integrace-test-plan.md` | 61–62 | APIM s politikami na tokeny a kvóty jako varianta B | ❌ | Rozpor s 10-container-app.md:27: „APIM Consumption neumí token limit ani kvótu“ (sondy/ai.md:171, token limit potřebuje tier v2, ≈150 USD/měs.). Oprav. | hlavní session |
| `04-integrace-test-plan.md` | 63–64 | „Který LLM“: v labu není; obojí stojí mimo budget 20 / měsíc | ❌ | Rozpor: LLM je rozhodnuto a běží (Azure OpenAI). Budget `mcp-lab-budget` = 20 EUR (06-azure-inventar.md:30), ale platí rozpočet z CLAUDE.md 50/300 USD. Oprav měnu a rozpočet. | hlavní session |
| `04-integrace-test-plan.md` | 66–76 | Plán testů před středou | ⚠ | Většina testů je hotová (appka volá server, gateway, denní report, PA). Zbývá „Kit mimo PPF“, „Host z EG.D“ a Windows+Copilot (05-otevrene-body.md:14: Windows neměřen). Aktualizuj stav a „kdo“. | hlavní session |

**Riziko pro středu:**

1. **Zastaralý dokument (vysoká):** kdo se podle rozcestníku řídí tímto souborem, uvede účastníkům, že LLM gateway je „jen návrh“ a APIM umí kvóty. Obojí je v rozporu s changed stavem v sondy/ai.md a hrozí chybné doporučení EG.D.
2. **Schválení API přístupu a odchozí síť v E.ON (vysoká):** bez schválení `webApiPermissionRequests` a bez průchodu `*.azurecontainerapps.io` žádná SPFx appka nezavolá gateway. V labu jsme to nezkoušeli ani s hostem z EG.D.
3. **Power Automate Premium (střední):** řádky 33–34 tvrdí, že bez Premium zbývá jen schvalování a notifikace. Ve skutečnosti Standard pokrývá Recurrence a LLM přes Foundry. Na druhé straně HTTP a „When an HTTP request“ se v labu bez Premium nezapnou (409), takže účastníci mohou narazit na flow, který nejde zapnout.


<a id="05-otevrene-body-md"></a>
### `05-otevrene-body.md` (autor: hlavní session)

**Namátka důkazů:**

- „git pull v ppf-spfx-devkit a ppf-skills (lokálně pozadu)“ (ř. 30) → `git status -sb` v obou repech → ano. Devkit je `behind 42`, ppf-skills `behind 21`. Měřeno bez `git fetch`, takže skutečný rozdíl může být větší.
- „odpoved-adriane.md“ (ř. 17) → `~/Projects/ppf-arcade/odpoved-adriane.md` → soubor existuje. Že odpověď nebyla odeslána, jsem nemohl ověřit (viz ř. 17).
- „egd-vibecoding nemá remote; ppf-arcade lokálně není git“ (ř. 35) → `~/Projects/egd-vibecoding/.git` existuje, `~/Projects/ppf-arcade/.git` neexistuje → ano. Že egd-vibecoding nemá remote, jsem neověřoval (`git remote`).

KONTROLA PROTI OSTATNÍM SOUBORŮM:
- „12 volných E5“ (ř. 12) se shoduje s 03-lab.md:12 a :51 („13 z 25“). 07-lab-trial-plan.md:10 a 08-ucty-ucastniku.md:12 ale říkají, že je přiděleno 23 z 25, protože egd01–10 už licenci mají. Volné jsou tedy 2.
- Počet skillů: ř. 16, 27 a 29 říkají „5 skillů“ (jako 01:93, 02:54 a README). `ls skills/` ukazuje 9 složek `egd-*`.
- „4 z 7 pozvánku nepřijali“ (ř. 11): v 03-lab.md je u hostů jiný stav. Čekají 4 (Urbánek, Mládková, Jač, Tučková). Šebedovská není pozvaná. Přijali 3 (Galík, friedlova, Smolík). Účastníků EG.D je podle 01:11 šest.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `05-otevrene-body.md` | 7–9 | Adriána čeká na „noty“ od 12./18. 11.; Pavlova poznámka 17. 11. | ⚠ | Doplň odkaz na zdrojový mail nebo poznámku; ověř, zda se po 17. 11. něco nezměnilo. | hlavní session |
| `05-otevrene-body.md` | 11 | „4 z 7 pozvánku nepřijali“ (jmenováni jen 3 + Šebedovská) | ❌ | Oprav podle 03-lab.md: 4 čekají (vč. Tučkové, která není účastník), Šebedovská není pozvaná, 3 přijali. Počet účastníků je 6. | hlavní session |
| `05-otevrene-body.md` | 10–11 | Hosté z EG.D mají v labu nejspíš jen čtení | ⚠ | 03-lab.md přiznává „neměřeno“. Ověř v labu pod hostem, nebo pod testovacím guestem (např. chocholous@ppf.cz s rolí Visitors) zkus vytvořit stránku a nasadit balíček. | hlavní session |
| `05-otevrene-body.md` | 12 | Varianta „lokální lab účty pro každého (12 volných E5)“ | ❌ | Volné E5 jsou 2 (23 z 25 přiděleno), egd01–10 už licenci mají; E5 trial končí 25. 11. 04:04, před workshopem. Oprav číslo a navaž na 07-lab-trial-plan.md. | hlavní session |
| `05-otevrene-body.md` | 12 | Dvě varianty (lokální účty / role na DEV webu) bez pro a proti | 🔀 | Doplň varianty s pro a proti, nároky na IT E.ON a náročnost pro citizen developera. U role na DEV webu napiš, zda ji někdo v labu zkoušel pod hostem. | hlavní session |
| `05-otevrene-body.md` | 13–14 | Claude vs. Copilot: licence EG.D přes ServiceNow, stav podání neznámý | ⛔ | Je to stav na straně EG.D. Napiš výslovně „ověřit u Adriány/IT EG.D“ a do kdy. Jinak se bere jako ⚠. | hlavní session |
| `05-otevrene-body.md` | 14 | Devkit 0.8 běží i v Copilot CLI | ⚠ | Tvrzení je z release notes (02:33, 📘). Ověř v labu Copilot CLI na macOS, nebo napiš proč nejde. Windows je správně označeno jako neměřené. | hlavní session |
| `05-otevrene-body.md` | 13–14 | Vývoj na Claude vs. Copilot | 🔀 | Doplň pro a proti obou variant i závislost na licenci. Navazuje na 09-github-ucastnici.md (Copilot Free, EMU), které tu chybí. | hlavní session |
| `05-otevrene-body.md` | 15–16 | Distribuce: GHE PPF je pro EG.D nedostupné | ⚠ | Chybí důkaz (kdo to řekl, kdy). Doplň odkaz na zdroj (01-fakta-workshopu.md), nebo označ ❓. | hlavní session |
| `05-otevrene-body.md` | 16, 27, 29 | „5 skillů“ do ZIPu a do gitu | ❌ | `skills/` má 9 skillů `egd-*`. Oprav počet, nebo uveď, které se balí. Sjednoť i s README a 02. | hlavní session |
| `05-otevrene-body.md` | 17–18 | Odpověď Adriáně „nebyla odeslána“ podle nalezených mailů | ⚠ | Doplň, které složky a hledání jsi prošel (vč. Odeslané). Ověř čtením Sent Items, nebo napiš, že to nejde jistě říct. | hlavní session |
| `05-otevrene-body.md` | 18 | Hlavní sdělení „Custom Script ani PnP nepotřebujete“ | ✅ | V labu změřeno (00-co-mame.md:10, 04:12 ✅ 6. 11., `skills/egd-pripravenost/SKILL.md:87–88`). Dodej do bodu odkaz místo samotného tvrzení. | hlavní session |
| `05-otevrene-body.md` | 22–26 | Testy 6–10 (server, kit mimo PPF, gateway, Power Automate, denní report) | ✅ | Jsou to úkoly, ne tvrzení. Stav každého testu se vede v 04-integrace-test-plan.md; zkontroluj, že tam jsou stejné (ověřil jsem jen část). | hlavní session |
| `05-otevrene-body.md` | 24 | Test LLM gateway „až bude rozhodnuto“ | ⚠ | V sondy/ai.md už gateway existuje (`egd-ai-gateway`). Uprav stav bodu 8 podle skutečnosti. | hlavní session |
| `05-otevrene-body.md` | 27–29 | `skills-download.zip` neotevřený; převzít `eon-ui-design-system`, `eon-security`, `eo-compliance-standards` | ⚠ | Převzetí tří skillů se plánuje bez otevření ZIPu. Otevři ho a napiš, zda tyto tři skilly vůbec obsahuje. | hlavní session |
| `05-otevrene-body.md` | 29 | Sjednotit `spfx-ship` (CLI 11.x) s kitem (CLI 12) | ⚠ | Verze CLI jsou z popisu skillů. Změř `m365 --version` v obou kontextech, nebo odkaž na 02. | hlavní session |
| `05-otevrene-body.md` | 30 | `ppf-spfx-devkit`, `ppf-skills` lokálně pozadu | ✅ | Ověřeno (viz NAMÁTKA). Po `git fetch` napiš aktuální počet commitů, ať číslo nezastará. | hlavní session |
| `05-otevrene-body.md` | 34 | Zdrojáky Pacman/Guide/ArcadeHome ztraceny | ✅ | Souhlasí s 03-lab.md (řádek u „Zdrojáky“). Důkaz je tam jen jako ⚠ bez příkazu. | hlavní session |
| `05-otevrene-body.md` | 35 | egd-vibecoding bez remote; ppf-arcade lokálně není git | ⚠ | Druhá půlka ověřena (`.git` chybí). U první spusť `git remote -v`; tvrzení o GitHubu (private) ověř `gh repo view chocholous/ppf-arcade`. | hlavní session |
| `05-otevrene-body.md` | 36–37 | digi-podnety: bez notifikací, prázdná skupina, povinná atribuce ČÚZK | ⚠ | V `*.md` (mimo zdroje/ a prehled/) jsem „digi-podnety“ ani „ČÚZK“ nenašel. Doplň odkaz na zdroj, nebo ověř v labu. | hlavní session |
| `05-otevrene-body.md` | 38 | Kolize: onboarding T. Otruby v Praze 15:30–17:00 | ⚠ | Zdroj je „PPF KB“ bez odkazu; jinde v projektu zmíněno není (rg „Otruba“ = 0 nálezů). Ověř v kalendáři a doplň odkaz, nebo označ ❓. | hlavní session |
| `05-otevrene-body.md` | 39–42 | Nečtené zdroje: cloud session a artefakt „Citizen AI Developer Onboarding“ | 🔀 | Zdroj je v kánonu otevřená mezera. Zkus ho přečíst přes Artifact (action read), nebo napiš, proč nejde (jiný účet), a komu to přiřadit. | hlavní session |

**Riziko pro středu:**

1. Vysoké: v bloku „první appka v labu“ (13:00) nemusí mít hosté práva vyvíjet a nasazovat. Navíc „12 volných E5“ neplatí (volné jsou 2) a E5 trial končí 25. 11. v 04:04, před workshopem.
2. Střední: ZIP s kitem a skilly se plánuje na špatný počet („5“, ve skutečnosti 9 skillů `egd-*`). Účastníci tak mohou dostat nekompletní balíček.
3. Střední: vývoj na Copilotu (licence přes ServiceNow, Windows neměřené) může na místě nefungovat. Bez licence nebo funkčního CLI nebude na čem pracovat.


<a id="06-azure-inventar-md"></a>
### `06-azure-inventar.md` (autor: hlavní session)

**Namátka důkazů:**

- Skript `tools/azure-inventory.sh` je zdroj čísel → existuje, `--help` funguje, obsahuje dotazy na `spendingLimit`, billing profil a `ActualCost` → ano. Syrový výstup (`/tmp/inventar.md`) ale neexistuje, takže konkrétní čísla nemají uložený důkaz.
- „rg-entra-mcp-lab: 22 zdrojů, 8 webapp, 7 běží, 1 stopped“ (ř. 63, 46) → `az resource list` = 22, `az webapp list` = 8 (7 Running, `mcp-lab-49163d` Stopped) → ano.
- „Subscription bez tagů mimo rg-egd-*“ (ř. 71) + `rg-egd-*` s tagem `ucel=egd-workshop` → `az group list` → ano. Výjimka: RG `rg-egd-sonda-data-prava` v souboru chybí.
- Trial E5 25. 11. 03:04Z / Azure kredit 26. 11. → shodné s `07-lab-trial-plan.md` (04:04 SEČ, 03:08 SEČ) a `08-ucty-ucastniku.md:12` → ano.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `06-azure-inventar.md` | 13, 14, 15 | po konci trialu licence „deprovisioned“, data ~30 dní | ⚠ | 📘 bez ověření. Navíc `07:…` píše, že dokumentace si odporuje (data se mažou hned / 30+90 dní) a že u MCA přejde subscription rovnou do Disabled. Sjednoť s 07, nebo označ „nelze ověřit, trial ještě běží“. | hlavní session |
| `06-azure-inventar.md` | 16 | spending limit On → po 30 dnech disabled, data ~90 dní; na PAYG sama nepřejde | ⚠ | 📘. 07 píše „jak dlouho se drží data, není ověřené“, 06 uvádí 90 dní. Sjednoť a označ jako neověřené (ověřit v labu nejde dřív než po 26. 11.). | hlavní session |
| `06-azure-inventar.md` | 16, 98 | PAYG upgrade = ~35 EUR/měs. | ⚠ | Číslo je z run-rate, ale Postgres účtován 0 € (ř. 52) a po upgradu ho může začít účtovat. Přidej „odhad, Postgres může přidat“. | hlavní session |
| `06-azure-inventar.md` | 17 | `freetier` do 2027-11-27 | ❌ | Subscription koupena 2026-10-27, 12 měsíců by končilo 2027-10-27. Nikde v projektu jinde není. Ověř datum v `az`/portálu, nebo oprav. | hlavní session |
| `06-azure-inventar.md` | 46 | B2 = „~77 % měsíčního odhadu“ | ❌ | 20,06 / 35 = 57 %, 20,06 / 28,09 (součet 30denních nákladů) = 71 %. Přepočítej a uveď základ. | hlavní session |
| `06-azure-inventar.md` | 69, 63–71 | seznam RG; `rg-egd-sonda-ai` je prázdná | ❌ | Rozpor s labem: `rg-egd-sonda-ai` dnes obsahuje 7 zdrojů (APIM, aoai, ACR, Container App …) a existuje `rg-egd-sonda-data-prava` (SQL, Container App), v souboru chybí. Přegeneruj inventuru. Pozor na náklady: `aoai`, ACR a SQL v ní nejsou v tabulce. | hlavní session |
| `06-azure-inventar.md` | 13, 77, 78 | E5: 13 přiděleno | ❌ | `07-lab-trial-plan.md` a `08-ucty-ucastniku.md` uvádějí 23 z 25 (egd01–10 přidány dnes). Také `03-lab.md:12` má 13. Aktualizuj (13 → 23), jinak se bude plést, kolik licencí zbývá (zbývají 2). | hlavní session |
| `06-azure-inventar.md` | 13–15 | přesné časy konce trialů, počty licencí, FLOW_FREE | ✅ | (součást souhrnu ✅, viz níže) | hlavní session |
| `06-azure-inventar.md` | 20, 49, 65 | Power Platform účet v `copilot-credits-rg`, stav „pravděpodobně 24/7“, billing policy | ⚠ | ❓ vyznačeno poctivě, ale je to v ř. 65 popsáno jako „billing policy pro Copilot kredity“ bez ověření. Ověř v PP admin centru, nebo přepiš jako „účet, účel neověřen“. | hlavní session |
| `06-azure-inventar.md` | 52 | Postgres B1ms účtován 0 € | ⚠ | Vyznačeno ❓. Ověř v Cost Management po zdrojích (free tier Postgres 12 měsíců?), případně potvrď v `az postgres flexible-server show`. Důležité kvůli odhadu ceny. | hlavní session |
| `06-azure-inventar.md` | 55, 99 | po vypnutí B2 a `pe-pg` pod ~10 EUR/měs. | ⚠ | Odvozené výpočtem, nezkoušeno. 07 uvádí jiná čísla (≈ 20 €/měs. s B1, ≈ 10 € bez plánu). Sjednoť a označ „výpočet z ceníku“. | hlavní session |
| `06-azure-inventar.md` | 84–93 | druhý tenant `M365x04523031` | ⛔ | Výslovně ❓ s důvodem (chybí token) a příkaz pro Pavla. OK, ale 03-lab.md tvrdí „25× E5…“; zdroj údajů zde chybí. Doplň, kdo to ověřil, nebo viz 03. | hlavní session |
| `06-azure-inventar.md` | 16, 98 | Dvě cesty pro Azure: upgrade vs. nechat vypršet | 🔀 | Chybí pro a proti a co je nutné od IT E.ON (nic, je to lab Pavla), a hlavně náročnost: 06 nabízí jen upgrade/nechat vypršet. Odkaž na tabulku variant v 07 nebo ji sem převeď. | hlavní session |
| `06-azure-inventar.md` | 13, 97 | M365: „koupit/prodloužit“ | 🔀 | 06 uvádí jen „koupit“ a „obvykle ne“ pro prodloužení; 07 rozebírá 4 varianty (extend, nový trial jiného SKU, koupě, nový tenant) a doporučuje variantu 2. Odkaž na 07, ať 06 není v rozporu s doporučením. | hlavní session |
| `06-azure-inventar.md` | 22 | „Pokud workshop počítá s E5/Copilot, vyřešit do 24. 11.“ | ✅ | Shodné s 07 a 08:12. | hlavní session |
| `06-azure-inventar.md` | (souhrn) | ✅: licence, konce trialů (Graph), billing, kredit, faktura, budget, náklady po zdrojích, RG a počty zdrojů | ✅ | Zdroj je reprodukovatelný skriptem; chybí uložený syrový výstup. Přilož ho (např. do `prehled/`). | hlavní session |

**Riziko pro středu:**

1. Vysoké: E5 trial končí 25. 11. v 04:04 SEČ, tedy 8 hodin před začátkem workshopu; do té doby musí běžet přehození licencí (07, krok do 24. 11.). Bez toho se účastníci nepřihlásí a SharePoint je jen pro čtení.
2. Střední: Údaje o počtech licencí (13 vs. 23) a o zdrojích v `rg-egd-sonda-*` jsou zastaralé. Kdo se podle 06 rozhodne o skriptu přehození nebo o úklidu RG, pracuje s nesprávným stavem (zbývají jen 2 volné licence, nové RG s aoai/SQL/ACR nejsou v inventuře).
3. Nízké: Azure kredit končí 26. 11. v 03:08 SEČ, až po workshopu; při upgradu na PAYG hrozí neočekávané náklady (Postgres účtován 0 € bez vysvětlení, nové zdroje sond mimo inventuru).


<a id="07-lab-trial-plan-md"></a>
### `07-lab-trial-plan.md` (autor: lab-trial)

**Namátka důkazů:**

- Konec E5 „25. 11. 04:04“ → 06-azure-inventar.md:13 a :77 (`2026-11-25 03:04Z`, tj. 04:04 SEČ) → ano.
- Konec Azure „26. 11. 03:08“ → 06-azure-inventar.md:16 (`2026-11-26 02:08` UTC, tj. 03:08 SEČ) a :27 → ano.
- „Nástroj `tools/lab-licence-prehod.py --z/--na/--provest/--sku`“ → soubor existuje; argparse v řádcích 44–49 má všechny vlastnosti → ano. Soubory `tools/lab-ucty-licence.py` a `tools/azure-inventory.sh` také existují.
- Doplňkově: „13 přidělených E5“ → 06:77 a 03-lab.md:12 → ano. Údaj „23 z 25“ se opírá o 08-ucty-ucastniku.md:12 (10 účtů egd má E5) a je konzistentní.
- Živý Graph/lab dotaz jsem nespouštěl. Čísla v 07 jsem ověřoval jen proti ostatním dokumentům a skriptům.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `07-lab-trial-plan.md` | 8–13 | Data trialů: konce E5, BP+Copilot, Agent 365, Azure, počty licencí (✅) | ✅ | Konce E5 a Azure a počty E5 sedí s 06 a 03. U BP+Copilot (09:31) a Agent 365 (11:37) jsem v 06 nenašel samostatný řádek. Doplň odkaz na důkaz (Graph subscribedSkus). | lab-trial |
| `07-lab-trial-plan.md` | 18–22 | MCA od 9. 2. 2026 ruší fázi „Expired“, předplatné jde rovnou do Disabled, SPO/OD jen pro čtení | ⚠ | Je to 📘 a celé doporučení na něm stojí. Změř to na reálném subscription (`nextLifecycleDateTime` a stav v Graph `directory/subscriptions`) nebo vyzkoušej na krátkém trialu. Pokud to jde ověřit až po expiraci, napiš proč nejde. | lab-trial |
| `07-lab-trial-plan.md` | 20 | Dokumentace si odporuje (trvalé smazání × 30+90 dní) | ⚠ | Je to ❓ bez pokusu. Další rozpor: 06:13 tvrdí „typicky 30 dní, pak se mažou“ a 07 to nezmiňuje. Sjednoť a označ jako neověřené. | lab-trial |
| `07-lab-trial-plan.md` | 23 | Hosté z EG.D nepotřebují licenci, jen když zůstane aktivní předplatné se SharePointem | ⚠ | Ověř v labu: hostu (nebo `egd01`) po přehození licence zkontroluj přístup. Jinak výslovně do „Neověřeno“ (v sekci chybí). | lab-trial |
| `07-lab-trial-plan.md` | 31, 61 | Varianta 1: „Extend trial“ u E5 | ⛔/⚠ | Napsáno poctivě jako ❓ a v Neověřeno (ř. 95). Důvod „prohlížeč je přihlášený PPF“ je ale slabý. Admin centrum jde otevřít v izolovaném profilu (`~/.m365-osobni`, Playwright), takže to jde zkontrolovat v labu hned. Udělej to dřív, než o to požádáš Pavla. | lab-trial |
| `07-lab-trial-plan.md` | 32 | Varianta 2: nový trial jiného SKU, 25 licencí na 30 dní | ⚠ | Je to 📘. Existenci nabídek může ověřit jen Pavel v admin centru. Údaj „platí pravidlo jeden trial na nabídku“ také 📘. Ověř, nebo označ ⛔ s důvodem. | lab-trial |
| `07-lab-trial-plan.md` | 32–34 | Varianty 1–4 jsou popsány | 🔀 | Struktura je dobrá (pro/proti, cena, riziko). Chybí sloupec „co chce od IT E.ON“ (u 2 a 3 nic, napiš to výslovně) a „náročnost pro citizen developera“. U 2 a 3 přidej, co se stane s účastníkovými licencemi při přehození uprostřed workshopu. | lab-trial |
| `07-lab-trial-plan.md` | 34 | Varianta 4: 55 účtů (36 zasedaček), 14 webů, 10 balíčků, 21 registrací, 20 skupin, 8 hostů | ⚠ | Čísla jsou ✅-styl bez odkazu. Zdroj uvádí jen řádek 110 („Inventura 22. 11.“) bez konkrétního výstupu. Odkaž na soubor s inventurou (06 tyto počty neobsahuje, 03:49 mluví o hostech jinak). | lab-trial |
| `07-lab-trial-plan.md` | 32, 62 | Trial se sám převede na placený, proto vypnout opakovanou fakturaci (25×58 €/měs.) | ⚠ | 📘, částka 58 € nemá zdroj. Ověř stav Recurring billing v labu (Graph `directory/subscriptions` nebo admin centrum), nebo uveď zdroj ceny. | lab-trial |
| `07-lab-trial-plan.md` | 33 | Ceny Business Basic 4,67 / 6,07 €, příplatek za měsíční závazek +5–20 % | ⚠ | 📘, příplatek je ❓. Cena „11 licencí ≈ 51–80 €“ se z toho dopočítává. Ověř ceník v admin centru, nebo označ jako odhad, ne doporučení. | lab-trial |
| `07-lab-trial-plan.md` | 33 | Samostatný SharePoint Plan 1 už není prodejný | ⚠ | 📘. Ověř v Purchase services v admin centru. | lab-trial |
| `07-lab-trial-plan.md` | 33 | Vrácení peněz a ubrání licencí jen do 7 dní | ⚠ | 📘 (ř. 107). Ověření v labu nejde, napiš proč. | lab-trial |
| `07-lab-trial-plan.md` | 40–42 | Azure po zakázání: zdroje se vypnou, upgrade později jde, zdroje se znovu zapnou; kolik dní se drží data | ⚠ | Je to 📘/❓. 06:16 uvádí „~90 dní“ jako 📘, 07:40 „není ověřené“. Sjednoť. Ověř aspoň přes `az account subscription show` a stav subscription. | lab-trial |
| `07-lab-trial-plan.md` | 41 | Upgrade na PAYG: kredit platí do 26. 11., 12měsíční free služby zůstanou | ⚠ | 📘. Neplatí-li, přijdeš o spojitost zdrojů. Dá se ověřit jen po upgradu. Napiš to jako ⛔ s důvodem „vyžaduje platební údaje Pavla“. | lab-trial |
| `07-lab-trial-plan.md` | 41, 42 | ≈ 35 €/měs. (✅), ≈ 20 € s B1, ≈ 10 € bez plánu, PE ≈ 6 € | ⚠ | 35 € sedí s 06:98. Údaje 20/10/6 € nemají zdroj ani výpočet. Přepočti z cen v 06:46 (B2 20,06 €). | lab-trial |
| `07-lab-trial-plan.md` | 42 | MCP servery v `rg-entra-mcp-lab` workshop nepotřebuje | ⚠ | Tvrzení o závislostech bez důkazu. Ověř, že žádná sonda ani Easy Auth/OBO (`ppf-rooms`, ř. 34) na `plan-mcp-lab` nestojí. | lab-trial |
| `07-lab-trial-plan.md` | 82–91 | Tabulka skuPartNumber (SPE_E3, SPB, ENTERPRISEPACK, O365_BUSINESS_PREMIUM, ...) | ⚠ | 📘 s poznámkou „ověří se v subscribedSkus“. Není to chyba, ale tabulku nelze brát jako fakt. Doplň sloupec „ověřeno v tenantu“ až po spuštění trialu. | lab-trial |
| `07-lab-trial-plan.md` | 79 | `lab-ucty-licence.py --sku <SKU>`; kontrola „`--sku` ukáže obsazenost“ | ❌ | Rozpor s nástrojem: v `lab-ucty-licence.py` je `--sku` přidělení licence (default SPE_E5), obsazenost ukazuje `--stav`. Opravit na `--stav`. Navíc 08:107 píše `--odebrat-licence` a nástroj má `--remove-sku` / `--jen-odebrat` (08:12 je správně). | lab-trial |
| `07-lab-trial-plan.md` | 79 | `lab-licence-prehod.py ... přidá nové SKU 13 původním účtům` | ❌ | Skript účty egd01–10 přeskakuje (ř. 5–6), takže počet je tedy 13. To je v souladu s textem, ale 07:20 jinde počítá „23 licencí“ pro Basic a 08 je řeší zvlášť. Dopiš, že přehození egd01–10 je samostatný krok a která session ho spouští (zatím nespuštěno, jen plán). | lab-trial |
| `07-lab-trial-plan.md` | 80 | `az appservice plan update --sku B1` a budget na 30 € | ⚠ | Postup nebyl v labu proveden ani na suchu. Ověř `--help` a `az appservice plan show` (jen čtení). | lab-trial |
| `07-lab-trial-plan.md` | 95–99 | Sekce Neověřeno | ✅ | Pět položek poctivě vyjmenováno. Chybí položky z řádků 18–23 a 41. | lab-trial |

**Riziko pro středu:**

1. VYSOKÉ: Celý plán stojí na 📘 tvrzení o chování Microsoftu (variantě 2 „nový trial jiného SKU“ a 4 licencích SharePointu po přehození). Když se po 04:04 ukáže, že přehození licencí ztratí SharePoint na `egd01–10` nebo hosté ztratí přístup, účastníci ve 12:30 nemohou nic nasadit. Vyzkoušej to na jednom účtu s novým SKU už 23. 11.
2. VYSOKÉ: Chybná kontrola v řádku 79 (`--sku` u `lab-ucty-licence.py` licenci přidělí, ne jen zobrazí), a rozpor s 08:107 (`--odebrat-licence`) můžou způsobit nechtěný zápis nebo selhání skriptu v termínu 24. 11. večer. Oprav hned a jednotně.
3. STŘEDNÍ: Rozhodnutí o variantě 2 závisí na tom, jaké trialy tenant nabídne, a to ví jen Pavel (ř. 32, 95). Kdyby nic nenabídl, zbývá varianta 3, tedy nákup, ale ten Pavel zatím ani neschválil. Zjisti to ještě v pondělí.


<a id="08-ucty-ucastniku-md"></a>
### `08-ucty-ucastniku.md` (autor: lab-ucty)

**Namátka důkazů:**

nejde o spuštění v labu, jen o dohledání důkazů v souborech):
- Šifra „AES-GCM, PBKDF2-SHA256 600 000×, alias jako AAD“ → `lab/vydej/vydej-uctu.html` (`"iterace": 600000`) a `vydej-uctu.template.html:109-112` (PBKDF2, SHA-256, AES-GCM, `additionalData` = alias) → ano.
- Skripty z tabulky (ř. 80–90) mají mít `--help` a uvedené přepínače → `tools/lab-ucty-weby.py:12` (`--kontrola`), `lab-ucty-mfa.py:37` (`--vratit`), `lab-ucty-uklid.py:9-15` (`--vypis-mazani`, `--odebrat-licence`, `--nova-hesla`), `lab-ucty-licence.py:9-11` (`--remove-sku`, `--jen-odebrat`, `--stav`) → ano. Samotné `--help` jsem nespouštěl.
- Ověření pod `egd01`/`egd03` (ř. 112–123) → `tools/lab-ucty-overeni.mjs` existuje, `.sppkg` existuje (`~/Projects/egd-vibecoding/eon-demo-kalkulacka/.../eon-demo-kalkulacka.sppkg`, 18 155 B). Výsledek je shrnutý v `prehled/stav/lab-ucty.json` ("egd01+egd03, 3 vlastní weby zápis, cizí 403"). Samotné výstupy běhů (JSON, log, screenshot) v projektu nejsou, takže čísla 200/403, „Deployed: true“ a verze 1.0.0.9 nemají dohledatelný důkaz. → ne.
- Nezávislé potvrzení z labu jsem nedělal. `lab/ucastnici.secrets.json` existuje (0600, klíče `hesla`, `kody`, `skupinaId`), `lab/vydej/` obsahuje `db-kody.secrets/egdNN.json`.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `08-ucty-ucastniku.md` | 10–17 | 10 účtů, skupina, 30 webů, app catalog, správci, prázdné skupiny („30/30 OK“) | ✅ (souhrnně 14 tvrzení) | Důkaz je jen skript `--kontrola` bez uloženého výstupu. Ulož výstup do souboru a uveď cestu. | lab-ucty |
| `08-ucty-ucastniku.md` | 51–52 | šifra stránky: správný kód otevře 10/10, cizí 10/10 odmítne | ✅ | OK (kód i lokální test popsaný na ř. 125–129). | lab-ucty |
| `08-ucty-ucastniku.md` | 112–122 | `egd01`: nahrání 200, nasazení 200, 1.0.0.9, cizí web 403, hledání 0 | ✅ bez důkazu → ⚠ | Připoj log běhu `lab-ucty-overeni.mjs` (nebo ho pusť znovu a ulož výstup). | lab-ucty |
| `08-ucty-ucastniku.md` | 12 | licence SPE_E5 do 25. 11. 4:04; „ve hře“ SPE_E3, SPB, O365_BUSINESS_ESSENTIALS, O365_BUSINESS_PREMIUM, „všechny se SharePointem“ | ⚠ | Tvrzení „všechny se SharePointem“ nemá důkaz (je jen z dokumentace). Ověř přes `az rest subscribedSkus` (servicePlans), nebo škrtni. | lab-ucty |
| `08-ucty-ucastniku.md` | 12 vs 07 | seznam náhradních SKU | ❌ | `07-lab-trial-plan.md` (ř. 31–34, 51, 71) uvádí E3, Business Premium, Office 365 E3 a zálohu Business Basic. 08 uvádí jiné SKU (SPE_E3, SPB, O365_BUSINESS_ESSENTIALS, O365_BUSINESS_PREMIUM). Sjednoť názvy a uveď, že nabídku trialů zná jen Pavel. | lab-ucty |
| `08-ucty-ucastniku.md` | 47–49 | db kontrakt: zapisují jen vlastník, Editoři, členové org; host z EG.D má `view` | ⚠ | Je to 📘 podle runtime 0.2.98, soubor to přiznává. Ověř pokusem s externím účtem (jako ř. 135) a výsledek napiš výše, ne jen do „Neověřeno“. | lab-ucty |
| `08-ucty-ucastniku.md` | 53–54 | kolekce `kody` je pod `admin` i `view` prázdná | ✅ bez důkazu → ⚠ | Připoj výstup `ArtifactData` / testu, nebo odkaz na soubor. | lab-ucty |
| `08-ucty-ucastniku.md` | 55–57 | vydání a uvolnění účtu 01 vyzkoušeno, stav vydržel obnovení | ✅ bez důkazu → ⚠ | Připoj důkaz (screenshot, verze stránky, log). | lab-ucty |
| `08-ucty-ucastniku.md` | 31, 34–42 | CA výjimka pro skupinu; polovina přihlášení skončí registrací Authenticatoru („3 z 6“) | ✅ / blokér | Číslo 3/6 je z pokusů bez přiložených logů. U blokéru nejde o vlastnost dokumentu, ale o otevřený úkol: Pavel zkontroluje Entra. Stav „čeká“ je v `prehled/stav/lab-ucty.json`. | lab-ucty |
| `08-ucty-ucastniku.md` | 43–46 | `m365` CLI pod účastníkem nejde (AADSTS65001), nasazení přes UI funguje | 🔀 | Varianty (UI app catalog / CLI s admin consentem / REST přes Playwright) nejsou popsané s pro a proti ani s tím, co chce IT E.ON. V EG.D reálně CLI použít nepůjde bez consentu; doplň. Pozor na `03-lab.md:14`: tam se stejný kód AADSTS65001 týká práv na uživatele a licence u `pavel.admin`. Jde o dva různé případy téhož kódu, rozliš je. | lab-ucty |
| `08-ucty-ucastniku.md` | 47–60, 70–76 | výdej hesel (šifrovaná stránka + kód od Pavla) | 🔀 | Je tu jediná cesta (stránka přes Share). Záložní varianta „bez db“ je jen zmíněná. Doplň varianty (tištěné lístky, e-mail, `lab/vydej` lokálně) s pro a proti a s náročností pro Pavla na workshopu. | lab-ucty |
| `08-ucty-ucastniku.md` | 72–76, 134 | veřejný odkaz „Anyone with the link“ otevře stránku hostovi | ⚠ | Správně zapsáno v „Neověřeno“ s postupem. Co udělat: zapnout Share a otestovat v anonymním okně ještě před 25. 11. Je to bod, na kterém stojí celý výdej. | lab-ucty |
| `08-ucty-ucastniku.md` | 123 | kořenový web: účastník má zápis | ✅ nález, ⚠ rizikový | Napsáno jako zjištění. Ověř, že řešení „Everyone except external users → Návštěvníci“ fakticky odebere zápis, a opravu proveď nebo výslovně odlož. | lab-ucty |
| `08-ucty-ucastniku.md` | 135 | host zvenku nezapíše do db | ⚠ | Duplicita s ř. 47–49; ověř jednou a oba řádky sjednoť. | lab-ucty |
| `08-ucty-ucastniku.md` | 136 | co vynucuje registraci Authenticatoru | ⚠ | OK jako „Neověřeno“ s důvodem (chybí Policy.Read). Dokud se nevyřeší, drží blokér u ř. 34. | lab-ucty |
| `08-ucty-ucastniku.md` | 9 (README) | `lab/ucastnici.secrets.json` je 0600 a gitignored | ✅ / ⚠ | 0600 potvrzeno. `egd-workshop` není git repo, tedy „gitignored“ nemá co ověřit. Přeformuluj: „mimo verzování“. | lab-ucty |

**Riziko pro středu:**

1. Registrace Authenticatoru zastaví zhruba polovinu přihlášení a obejít ji jde jen přes TOTP aplikaci. Na workshopu to blokuje start a končí to u Pavlovy ruční opravy v Entra. Vysoké.
2. Konec trialu SPE_E5 se po 25. 11. 4:04 dostane k účtům hned před začátkem workshopu (12:30). Náhradní SKU nejsou rozhodnuté a seznam je rozporný s `07`. Když se licence nepřehodí, `egd01–10` ztratí SharePoint. Vysoké.
3. Výdej hesel stojí na veřejném odkazu Share, který nikdo nezkusil v anonymním okně. Když to nejde, výdej se musí rychle přepracovat bez db. Střední.


<a id="09-github-ucastnici-md"></a>
### `09-github-ucastnici.md` (autor: lab-github)

**Namátka důkazů:**

v souboru jsou jen 3 ✅ tvrzení):
- Skripty `lab-github-entra.sh` a `lab-github-org.sh` existují a jsou spustitelné → řádky 103, 105 → ano. Na `tools/lab-github-entra.sh:3,8,57,67` je výchozí suchý běh a `--apply`. Samotný „suchý běh ověřen, 1 účet“ ale žádný uložený výstup nedokládá.
- GraphQL `createEnterpriseOrganization` ověřená introspekcí → řádek 89 → `tools/lab-github-org.sh:14,30,69` ano. Soubor přiznává „jen ve schématu (introspekce 2026-11-22)“, ale výstup introspekce nikde uložen není.
- `INSUFFICIENT_SCOPES` při `gh` bez `read:enterprise` → řádek 89 → jen komentář ve skriptu (`lab-github-org.sh:63`). Surový výstup chybí, v `prehled/stav/lab-github.json` jsem ho nehledal. Dohledatelnost je tedy slabá.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `09-github-ucastnici.md` | 89, 103 | `gh` scopes, GraphQL mutace, suchý běh skupiny | ✅ (slabý důkaz) | uložit surový výstup introspekce a suchého běhu do souboru a odkázat na něj | lab-github |
| `09-github-ucastnici.md` | 21 | `gh` = osobní účet, nic nezakládáno | ✅ | – | lab-github |
| `09-github-ucastnici.md` | 11, 13, 14 | Free org (limity, Actions, chybějící funkce), SAML jen Enterprise Cloud, trial 30 dní / 50 licencí / 3 org | ⚠ | jen 📘; ověř v labu (Pavlův trial) nebo napiš proč nejde | lab-github |
| `09-github-ucastnici.md` | 12, 33 | bez EMU má každý člen vlastní osobní účet; 10 účtů za účastníky vytvořit nelze (podmínky, captcha) | ⚠ | 📘 bez pokusu; ověř nebo označ jako ❓ | lab-github |
| `09-github-ucastnici.md` | 16, 46, 127 | Copilot Free: CLI i agent mode zahrnuty, bez karty; „✅📘“ | ⚠ | značka ✅ je bez měření a bez důkazu; ověř na čerstvém Free účtu (CLI i agent) nebo ✅ odstraň | lab-github |
| `09-github-ucastnici.md` | 17, 18, 19 | ceny Pro/Business (10/19 USD), credity, `winget install GitHub.Copilot`, Node 22+ | ⚠ | cena je jen 📘; instalaci `copilot` ověř v labu (Windows nebo `npm`) | lab-github |
| `09-github-ucastnici.md` | 27 | „Free limity chatu/agenta se mohou za 4 h vyčerpat“, účastník ~10 min | ⚠ | změř v úterním testu; číslo creditů je v „Otevřeno“ | lab-github |
| `09-github-ucastnici.md` | 35 | doména `@…onmicrosoft.com` GitHub může odmítnout | ⚠ | jde ověřit hned: pokus o signup s `egd01@…` (zápis jen se souhlasem) | lab-github |
| `09-github-ucastnici.md` | 86–88 | trial je samoobslužný, bez karty, Copilot v něm není, životní cyklus po skončení | ⚠ | 📘; ověř při založení trialu (Pavel) | lab-github |
| `09-github-ucastnici.md` | 96–98, 104–105, 109 | postup EMU+OIDC+SCIM, SCIM Test Connection, členství přes IdP tým, skripty „nezkoušeny“ | ⚠ | postup nebyl v labu projit (kánon: „postup se musí projít“); projít podle plánu v úterý nebo označit jako plán | lab-github |
| `09-github-ucastnici.md` | 114 | pozvánky: limit 50 / 24 h (nová org), 500 (starší) | ⚠ | 📘; ověř nebo vyhoď | lab-github |
| `09-github-ucastnici.md` | 39, 45, 49 | EG.D má nejspíš GitHub Enterprise; Copilot přes E.ON ITSM | ⛔ | jen „nejspíš“, důvod chybí v tomto souboru; dopiš „v labu nejde, ověří Adriána/IT EG.D“ a datum dotazu | lab-github |
| `09-github-ucastnici.md` | 49, 68 | smí zaměstnanec založit osobní účet na firemní e-mail | ⛔ | dopiš výslovně: jen EG.D, ověří Adriána (je v doporučení, ne v 05) | lab-github |
| `09-github-ucastnici.md` | 60, 64, 71 | postup na Windows (PowerShell, winget, VS Code přihlášení) | ⛔ | Windows v labu není (viz 04 řádek 76); dopiš tuto větu i do textu pro účastníky | lab-github |
| `09-github-ucastnici.md` | 25–31 | varianty A–E: chybí sloupce „co chce IT E.ON“ a „náročnost pro citizen developera“ | 🔀 | doplň sloupce (hlavně u A a hlavní cesty) | lab-github |
| `09-github-ucastnici.md` | 39, 45 | hlavní cesta (firemní Enterprise + ITSM) není varianta s pro a proti, a „B–D se nezavádějí“ | 🔀 | doplň tabulku „firemní GHE vs. osobní Free vs. lab EMU“ s pro a proti a požadavky na IT; nevítězné varianty nemaž | lab-github |
| `09-github-ucastnici.md` | 15 vs 87 | řádek 15: „Copilot v trialu: zdroje si protiřečí ❓“, řádek 87: „Copilot v trialu není“ | ❌ | sjednoť (87 je v rozporu s 15, 29 a 138) | lab-github |
| `09-github-ucastnici.md` | 39 vs 78–133 | „B–D se nezavádějí“ vs. plán varianty 1 = EMU (to je D) a 2 včetně dotazů na Pavla | ❌ | uprav 39 (např. „D/EMU se staví jako lab hřiště“) | lab-github |

**Riziko pro středu:**

1. Záloha Copilot Free: limity chatu a agenta nejsou změřené a může je vyčerpat 10 lidí za 4 h → vysoké.
2. Hlavní cesta firemní GHE + Copilot přes ITSM: stav objednávek neznámý a nejde ho ověřit v labu → vysoké.
3. Přihlášení EMU účtu (VS Code, `gh`, Copilot CLI) a první SCIM cyklus nikdy nezkoušeny → střední.


<a id="10-container-app-md"></a>
### `10-container-app.md` (autor: hlavní session)

**Namátka důkazů:**

5 ověřených důkazů):
- Chat 1,2–1,7 s → sondy/ai.md:116 → ano. Studený start 26 s → sondy/ai.md:124 → ano.
- Odeslání z jiné schránky = 403 (RBAC) → sondy/napojeni.md:58 → ano. Skript `tools/napojeni-exo-rbac.ps1` je zmíněn na řádku 50 a jeho existenci jsem neověřoval.
- PDF přes Graph `?format=pdf` bez serveru → sondy/dokumenty.md:11 → ano.
- Řádek 35 (OBO ✅, `~/Projects/ppf-rooms/docs/obo.md`) → soubor existuje, ale je to hlavně návrh. Má 11× ❓ a ✅ jen u dílčích měření (ř. 132: `/api/obsazenost` s OBO výměnou 200). Zdroj tedy ✅ nese jen částečně.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `10-container-app.md` | 27, 28, 29, 30, 31, 33, 60, 61, 64, 74–75 | LLM gateway, ČNB z Jobu, Job + mail, sendMail přes MI s RBAC, SQL + role z tokenu, Entra app role, jedno env v subscription, cena | ✅ | Souhrn: 11 položek, všechny doložené v sondách (ai.md:116/124/81, napojeni.md:58/62, data-prava.md:137/145). | hlavní session |
| `10-container-app.md` | 62 | Admin consent pro `webApiPermissionRequests` „✅ v labu“ | ⚠ | ai.md:151 a :222: schválení šlo přes Graph `oauth2PermissionGrant` (`tools/ai-spfx-api-grant.sh`), protože `permissionrequest approve` selhal. dokumenty.md:61 uvádí, že schválení samo nezkoušel. Upřesni: ✅ ekvivalent přes grant, ❓ reálný průchod schvalování v SharePoint admin centru. | hlavní session |
| `10-container-app.md` | 31 | DB přes API + role z tokenu ✅ | ⚠ | data-prava.md:156: `AadHttpClient` ze SPFx v té sondě nezkoušen, token volán mimo SPFx. Připiš výhradu, nebo doměř. | hlavní session |
| `10-container-app.md` | 32 | Práva na položky: „📘, nepostaveno“ | ⚠ | Ověř v labu (backend s `ManagePermissions`, nebo PA flow `c076f6d0-…`, které je uložené a čeká na přihlášení připojení). Nebo napiš proč nejde. | hlavní session |
| `10-container-app.md` | 32 | Dtto, varianty | 🔀 | Doplň srovnání: Container App / Power Automate / Function (pro a proti, co chce IT E.ON, náročnost). | hlavní session |
| `10-container-app.md` | 34 | Těžší dokumenty ❓ nepostaveno | ⚠ | Ověř v labu (LibreOffice v Containeru), nebo napiš proč ne. dokumenty.md:13 uvádí „server 📘 nepostaveno“. | hlavní session |
| `10-container-app.md` | 34 | Dokumenty: cesty A (prohlížeč) a Graph PDF ✅ nejsou zmíněny jako primární | 🔀 | dokumenty.md:16 doporučuje A, tabulka zde zmiňuje jen server a Graph PDF. Doplň odkaz na všechny varianty. | hlavní session |
| `10-container-app.md` | 27 | LLM: v tabulce chybí Power Automate Foundry konektor | 🔀 | power-automate.md ř. 13: Foundry Inference, Standard ✅. Doplň do varianty LLM. | hlavní session |
| `10-container-app.md` | 31 | DB: chybí Cosmos DB / Dataverse / Postgres | 🔀 | data-prava.md:158 a :127: doplň aspoň odkaz s pro a proti. | hlavní session |
| `10-container-app.md` | 35 | OBO „✅ vzor v ppf-rooms“ | ⚠ | Cizí repo, pro EG.D je to návrh i z části ❓ (obo.md má 11× ❓). Ověř OBO v egd labu, nebo uveď „částečně ✅ v ppf-rooms“. | hlavní session |
| `10-container-app.md` | 45 | LLM přes PA: „AI Builder / HTTP, Premium + kredity ❓“ | ❌ | Rozpor s power-automate.md:13: „Chat completion“ přes Foundry Inference je Standard ✅ a doběhlo. AI Builder není v katalogu. Přepiš. | hlavní session |
| `10-container-app.md` | 46 | Cizí API přes PA: HTTP „Premium 📘“, stav ❓ | ❌ | power-automate.md:14: flow s HTTP se nezapnulo (409), tedy ✅ negativní. Přepiš stav. | hlavní session |
| `10-container-app.md` | 47, 49, 50 | PA plánované úlohy, SQL, práva: stavy ❓/⚠ | ⚠ | Plánované úlohy: power-automate.md:15 ✅ Recurrence doběhlo. SQL: Premium ✅ tier. Práva: flow uloženo. Synchronizuj tabulku se sondou nebo ji smaž a odkaž. | hlavní session |
| `10-container-app.md` | 52 | PA Word → PDF: „Premium 📘“ | ❌ | power-automate.md:20: (a) Populate Premium, (b) OneDrive Convert Standard ✅ (flow uloženo). Doplň obě varianty. | hlavní session |
| `10-container-app.md` | 53 | Spuštění PA z SPFx: HTTP trigger Premium ❓ | ❌ | power-automate.md:28–31: HTTP trigger se nezapnul ✅ negativně, „PowerApp“ trigger vrací 403 `MisMatchingOAuthClaims`. Chybí varianta „seznam jako fronta“ (Standard, doporučená). Zapiš. | hlavní session |
| `10-container-app.md` | 41, 82 | „Do vyplnění platí jen to, co je níž“ / Otázka na PAYG | ⚠ | Sonda je rozpracovaná. Zapiš datum a stav, nebo celou sekci nahraď odkazem na sondy/power-automate.md. | hlavní session |
| `10-container-app.md` | 59, 63, 65, 66, 79–82 | Kdo to v E.ON dělá, má EG.D subscription, LLM endpoint, provoz | ⛔ | Výslovně „❓ IT“ a v otevřených otázkách; důvod (jen E.ON) chybí. Dopiš „v labu nejde ověřit, protože…“ a komu se zeptat. | hlavní session |
| `10-container-app.md` | 64 | ACR „✅ cizí ACR v labu; 📘 ~5 USD“ | ✅/⚠ | ai.md:235 měří ≈ 0,17 USD/den (~5 USD/měs.), takže 📘 lze přepsat na ✅. Drobnost. | hlavní session |

**Riziko pro středu:**

1. **Vysoké:** PA tabulka (ř. 45–53) je zastaralá a odporuje sondě. Když na workshopu zazní „HTTP trigger / HTTP akce v PA jde ve Standardu“ nebo „AI Builder“, tak v labu a u E.ON nejde zapnout (409). Doporučená cesta „seznam jako fronta“ je v dokumentu vynechaná.
2. **Střední:** Admin consent pro `webApiPermissionRequests` (ř. 62) je ověřen jen obejitím přes Graph grant. Pokud E.ON admin neschválí nebo SharePoint API nenajde (chybí tag `WindowsAzureActiveDirectoryIntegratedApp`), celá cesta SPFx → gateway/API nefunguje.
3. **Střední:** Studený start 26 s a nepotvrzené `AadHttpClient` pro DB API (ř. 27, 31) mohou na demu vypadat jako porucha. Jde o `min-replicas 1` (~8 USD/měs.) nebo UI „probouzím…“, a v dokumentu je to jen v sondě ai.md.


<a id="sondy-zadani-spolecne-md"></a>
### `sondy/_zadani-spolecne.md` (autor: hlavní session)

**Namátka důkazů:**

jen 3 ověřené důkazy; soubor má málo ✅ tvrzení, jsou to spíš pravidla):
- ř. 15 „existuje env `ca-ppf-rooms-env`, ACR `acrppfroomsca3lbgs`, APIM `apim-mcp-lab-9365c0`, `copilot-credits-rg`“ → 03-lab.md:60–62 a 06-azure-inventar.md:48,65 → ano. V labu jsem to nečetl, jen v dokumentech.
- ř. 15/16 „vzor v ~/Projects/ppf-rooms: docs/obo.md, prava.md, container/, lab/README.md, power-automate.md, lab/lab.secrets.json“ → `ls` → ano, všechny existují.
- ř. 33 „tools/stav.sh <id> bezi|ceka|hotovo“ → `tools/stav.sh --help` → ano, existuje. Povoluje i `planovano`, které zadání neuvádí. Drobná odchylka.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `sondy/_zadani-spolecne.md` | 23 | „Subagenti jen sonnet nebo opus, … nikdy Fable“ | ❌ | CLAUDE.md:9 říká, že Fable je v tomto projektu výslovně povolen na nejasné a složité syntézy. Sjednotit: „Fable jen na syntézy, jen z hlavní session“. Zákaz platí pro sondy, ne pro celý projekt. | hlavní session |
| `sondy/_zadani-spolecne.md` | 13 | „licence M365 E5 (Power Automate jen standard)“ | ❌ | 03-lab.md:12 uvádí „Flow Free“ a 04-integrace-test-plan.md:18 píše „E5 = jen standard 📘“ (tedy jen dokumentace). Změř v labu, jaké plány Power Automate tenant má, a sjednoť formulaci. | hlavní session |
| `sondy/_zadani-spolecne.md` | 14 | „Appka CLI nemá consent na Graph uživatele ani `m365 pp/flow`“ | ⚠ | 03-lab.md:14 má chybu AADSTS65001 jako důkaz, ale zadání ho neuvádí. Doplň odkaz na 03-lab.md:14 a uveď, že je to změřeno. | hlavní session |
| `sondy/_zadani-spolecne.md` | 9 | „✅ změřeno / 📘 dokumentace / ❓ neověřeno“ jako rovnocenné stavy | ⚠ | Doplnit kánon: 📘 a ❓ jsou jen mezistav. Skill ani doporučení na nich nestaví, neověřené patří do sekce „Neověřeno“ s důvodem a návrhem, jak ověřit. | hlavní session |
| `sondy/_zadani-spolecne.md` | 25 | Výstup: „tabulka požadavek → doporučená cesta → stav“, doporučení hned na začátku | 🔀 | Kánon chce nejdřív všechny funkční varianty (CLI / REST / UI atd.) s tím, co bylo ověřeno, pro a proti, co chce IT a jak je těžká pro citizen developera. Doporučení až potom, nevítězné varianty nemazat. Upravit tabulku na „požadavek → varianty (A/B/C) → ověřeno → doporučení“. | hlavní session |
| `sondy/_zadani-spolecne.md` | 10 | U každé cesty „funguje? … co chce IT, cena, náročnost“ | ✅ | Odpovídá kánonu. Chybí jen výslovné „postup musí agent v labu projít, kontrola syntaxe nestačí“. | hlavní session |
| `sondy/_zadani-spolecne.md` | 5–10 | Tři patra A/B/C, vždy porovnat | ✅ | V souladu s kánonem (víc variant). | hlavní session |
| `sondy/_zadani-spolecne.md` | 19, 22 | Strop 10 USD na sondu, ~50 USD celkem, nic nemazat, jen `/usr/bin/trash`, nepotlačovat stderr | ✅ | V souladu s CLAUDE.md (rozpočet ~50 USD, nic nemazat bez ano). | hlavní session |
| `sondy/_zadani-spolecne.md` | 29, 33 | Do `tools/README.md` nezapisovat, stav jen přes `stav.sh` | ✅ | V souladu s CLAUDE.md (sdílené soubory edituje jen hlavní session). | hlavní session |
| `sondy/_zadani-spolecne.md` | 2–3 | Zadání mluví o „agentech“ a „subagentech“ | ⚠ | CLAUDE.md zavádí „samostatné sessions místo subagentů“. Zadání to nezmiňuje. Doplnit odkaz na CLAUDE.md, aby se pravidla nerozcházela. | hlavní session |
| `sondy/_zadani-spolecne.md` | 12–16 | Lab: tenant, SPO URL, subscription, existující zdroje, lab.secrets.json | ✅ | Existenci souborů jsem ověřil (`ls`) a shoduje se se 03-lab.md. Samotné zdroje v Azure jsem nečetl. | hlavní session |

**Riziko pro středu:**

1. Rozpor „Power Automate jen standard / Flow Free“ (ř. 13): střední. Na workshopu se může slíbit nebo vyloučit cesta přes Power Automate podle licence, kterou nikdo v labu nezměřil.
2. Zákaz Fable a „doporučená cesta“ bez variant (ř. 23, 25): nízké až střední. Nejde o technický výpadek. Pravidlo ale nutí sondy předčasně vybrat jednu cestu a vyřadit varianty, které by EG.D mohly vyhovovat víc.

Ověřené sondy a dokumenty jsem v tomto souboru nenašel, protože je to zadání, ne sonda. Soubor `audit/overeni.md`, který CLAUDE.md zmiňuje, v projektu zatím neexistuje (`ls audit` → No such file).


<a id="sondy-ai-md"></a>
### `sondy/ai.md` (autor: hlavní session)

**Namátka důkazů:**

- Kvóta 429 a hlavička `X-App-Id` (ř. 120–121) → `sondy/ai/gateway/server.mjs:159`, `:149` → ano. Kód vrací 429 „Denní kvóta tokenů vyčerpána“ a 403 u neznámého appKey. Samotné naměřené odpovědi (surový výstup) nikde uložené nejsou.
- APIM Consumption nezná `llm-token-limit`, `rate-limit-by-key` (ř. 161–164) → `sondy/ai/apim-policy-test.sh:13,18,20` → ano. Skript tyto politiky zkouší. Soubor s výsledkem běhu chybí, v dokumentu je jen opis.
- `webApiPermissionRequests` s `Gateway.Use` (ř. 144) → `sondy/ai/spfx/config/package-solution.json:28–31` → ano. Balíček `release/` existuje. Dál ověřeno: `ocr-cs.png`, `tools/ai-*` (5 skriptů), `tools/ai-gateway-probe.sh --help` fungují a `MaxNumberOfGlobalEnvironmentsInSubExceeded` je i v `10-container-app.md:60`.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `sondy/ai.md` | 11–13, 116–125, 152, 182 | Latence, ceny, vision, OCR, studený start 26 s, kvóta, 401/403, audit v Log Analytics | ✅ (souhrn: 22 tvrzení) | Žádný soubor s důkazem (výstup probe, log dotazu) není uložený, jen opis a kód. Uložit výstupy `tools/ai-gateway-probe.sh` do `sondy/ai/dukazy/`. | hlavní session |
| `sondy/ai.md` | 15 | „Appky se podle tokenu nerozliší“, kvóta na appku/uživatele | ⚠ | `X-App-Id` je jen štítek, a přesto se prezentuje jako „projektový klíč“. Doplnit variantu (b)/(c) s měřením, nebo výslovně napsat, že nejde o bezpečnostní hranici (ř. 132 to píše). | hlavní session |
| `sondy/ai.md` | 16 | Cesta A „nejde“ pro LLM/OCR | ⚠ | Jen 📘 (Copilot API, SharePoint Premium). Z toho plyne závěr „bez Azure to nejde“. Ověřit v labu, nebo vypsat do „Neověřeno“ (licence Copilot v labu nejsou). | hlavní session |
| `sondy/ai.md` | 17, 26–31, 56–70 | Cesta B (AI Builder, Copilot Studio, ceny kreditů, 200 USD/měs.) | ⚠ | Celé 📘, v labu nic neměřeno, a přitom se z toho dělá srovnání (ř. 193: 6 000 USD vs gateway). Zkusit AI Builder/„Run a prompt“ v labu, nebo srovnání označit jako odhad. `sondy/power-automate.md:13` ale ✅ měří akci Foundry „Chat completion“, na tu odkázat. | hlavní session |
| `sondy/ai.md` | 17, 27–28 | SharePoint Premium: OCR „žádné API pro SPFx“, image tagging, cena 0,001 USD | ⚠ | 📘 + „nenašli jsme“. Důkaz absence je slabý. Ověřit v labu (Azure subscription tam je), nebo napsat proč ne. | hlavní session |
| `sondy/ai.md` | 26 | Copilot Chat API „preview, jen text“ | ⚠ | 📘, nezkoušeno (licence). Uvést jako neověřené. | hlavní session |
| `sondy/ai.md` | 46, 53, 67, 68 | ❓ SPFx volání Copilot API, Power Apps trigger, Direct Line z SPFx | ⚠ | Samé ❓ bez pokusu. Zkusit, nebo zapsat do „Neověřeno“ s důvodem. | hlavní session |
| `sondy/ai.md` | 135, 207, 226 | Omezení volajících skupinou (`appRoleAssignmentRequired`) | ⚠ | Pokus byl, ale neprůkazný (cache tokenů). Zopakovat s novým tokenem (nový uživatel / `--force`), je to doporučení z ř. 5 i tabulky IT. | hlavní session |
| `sondy/ai.md` | 137, 216 | Aplikační volající `Gateway.App` (client credentials) | ⚠ | Větev v kódu neotestovaná, přitom je to cesta pro Power Automate a Container Apps Job. Otestovat client credentials. | hlavní session |
| `sondy/ai.md` | 125, 220 | 1. volání po nasazení 502 – příčina „pravděpodobně propagace rolí“ | ⚠ | Příčina nepotvrzena. Zopakovat na čistém nasazení (`tools/ai-gateway-deploy.sh`), jinak může workshopový deploy padnout. | hlavní session |
| `sondy/ai.md` | 150, 222 | Schválení API access: `m365 … permissionrequest approve` selhává, příčina neznámá, UI neověřeno | ⚠ | Zkusit schválení v UI SharePoint admin centra, je to hlavní krok pro IT E.ON (ř. 202). Skill `egd-llm-gateway:112` to také nese jako ❓. | hlavní session |
| `sondy/ai.md` | 166–167, 182, 192 | `llm-emit-token-metric` runtime, semantic cache, nano reasoning tokeny, faktura | ⚠ | Neměřeno. Buď změřit, nebo přesunout do „Neověřeno“. | hlavní session |
| `sondy/ai.md` | 171–172 | APIM Basic v2 ≈ 150 USD, Standard v2 ≈ 700 USD, v2 nezaloženo | ⚠ | Přepočet z ceníku, ne z labu. Ověřit zřízením s hned smazaním (po výslovném ano) nebo označit jako 📘. | hlavní session |
| `sondy/ai.md` | 177–180, 188–193 | Ceny, scénáře 35 / 300 USD, srovnání s B | ⚠ | Ceny 📘 z Retail Prices API, počty volání odhad (napsáno). Doplnit, že měřená je jen jednotková cena, ne měsíční součet. | hlavní session |
| `sondy/ai.md` | 193 | AI Builder „standard“ ≈ 6 000 USD za 210 000 promptů | ⚠ | Počítáno ze sazby 📘, žádné měření. Označit jako odhad. | hlavní session |
| `sondy/ai.md` | 199–208 | Požadavky na IT E.ON (Azure, Entra, SPO admin, síť, data, DataZone) | ⛔ | Chybí výslovné „jen v E.ON“ s důvodem. Doplnit: co v labu nejde ověřit (síť/proxy z E.ON prohlížečů, právní schválení DPA, politiky E.ON). | hlavní session |
| `sondy/ai.md` | 208 | Private Link neprojde SPFx mimo VPN | ⛔ | Označeno ❓, uvést „jen v E.ON“ a jak ověřit (test z E.ON zařízení). | hlavní session |
| `sondy/ai.md` | 24–33 | Tři cesty (A/B/C) | 🔀 | Varianty jsou, včetně pro/proti a nároků na IT. Chybí ale Power Automate „Chat completion“ přes Foundry (`sondy/power-automate.md:13`, ✅) jako samostatná varianta B2. Doplnit odkaz a řádek. | hlavní session |
| `sondy/ai.md` | 36–37, 129–133 | Jak identifikovat appku (a/b/c) | 🔀 | Tři možnosti jsou jen popsané, ověřeno je (a). (b) a (c) nezměřeny, chybí náročnost pro citizen developera a požadavky IT. | hlavní session |
| `sondy/ai.md` | 50, 177 | `gpt-image-1` cena za obrázek „nenašli jsme“ | ❓ v ⚠ | Viz řádek 177–180. | hlavní session |
| `sondy/ai.md` | 17, 26 vs `04-integrace-test-plan.md:19` | „LLM gateway: ❓ nic postavené, v subscription není žádný LLM endpoint“ | ❌ | Rozpor: ai.md ✅ měří funkční gateway. Opravit `04-integrace-test-plan.md:19` (hlavní session). | hlavní session |
| `sondy/ai.md` | 170–173 vs `04-integrace-test-plan.md:61`, `03-lab.md:61`, `_zadani-spolecne.md:15` | APIM Consumption jako „kandidát na AI gateway / politiky tokenů a kvót“ | ❌ | Rozpor: ai.md změřilo, že Consumption token limit ani kvótu neumí. Opravit oba soubory. | hlavní session |
| `sondy/ai.md` | 146 vs `ai.md:105,137` | Komentář v `server.mjs:146` píše „role Gateway.Use“, doc a deploy skript používají `Gateway.App` | ❌ | Jen komentář (kód bere `C.role` = `REQUIRED_ROLE=Gateway.App` v deploy skriptu). Opravit komentář, aby neplatil dvojí název. | hlavní session |

**Riziko pro středu:**

1. Studený start 26 s a 502 u prvního volání po nasazení: demo AI funkce vypadá jako zamrzlá, pokud není `min-replicas 1` a rozehřátí před startem (vysoké).
2. Schválení API access jde jen přes Graph grant; v UI SharePoint admin centra neověřeno, takže u E.ON může `webApiPermissionRequests` zůstat bez tokenu a každá AI appka vrátí 401/403 (vysoké).
3. Odvození „projektového klíče“ z `X-App-Id` a nepotvrzená omezení volajících skupinou: kvóta a audit na appku jdou obejít, pokud se u E.ON bere kvóta jako bezpečnostní hranice (střední).


<a id="sondy-data-prava-md"></a>
### `sondy/data-prava.md` (autor: hlavní session)

**Namátka důkazů:**

3 ✅ ověřeny, všechny nalezeny):
- `$top=5001` bez filtru dává 500 a `$orderby` neindexovaného sloupce dává 500 (ř. 87, 90) → `sondy/data-prava/threshold.jsonl` ř. 4, 9, 16, 21, text „překračuje mezní hodnotu zobrazení seznamu“ → ano.
- Schvalovatel s Edit (bez `CancelCheckout`) nemůže upravit cizí položku, 403 (ř. 57) → `matrix-ZadostiW.jsonl`, `edit_foreign: 403` / „Access is denied“ u `schvalovatel_edit`, u `schvalovatel` s `CancelCheckout` „OK“ → ano.
- 30 položek + `breakroleinheritance` za 19,9 s (ř. 76) → `extras.jsonl` ř. 32 (`"sec": 19.9, "ok": 30`) → ano. Příloha cizí položky (ř. 70): 400 cizí zadavatel, 200 schvalovatel, 403 cizí → `extras.jsonl` ř. 4–9 → ano.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `sondy/data-prava.md` | 11–12, 44–58 | role, `ReadSecurity=2`/`WriteSecurity=2`, `CancelCheckout`, matice pod 5 účty | ✅ | `matrix*.jsonl` existují a sedí. | hlavní session |
| `sondy/data-prava.md` | 62–64, 70, 72–73, 76, 80–95 | `EffectiveBasePermissions`, přílohy, verze, sdílení vs. `ReadSecurity=2`, threshold, `$batch` | ✅ (9 tvrzení) | Bez nálezu; důkazy v `extras*.jsonl`, `threshold.jsonl`, `bulk.jsonl`. | hlavní session |
| `sondy/data-prava.md` | 58 | „`ManageLists` je jediná možnost“ (egd-vibecoding) vs. lab: `CancelCheckout` | ❌ | Opravit `egd-vibecoding/README.md:92` a `docs/pasti.md`. Ověřit zápisem pod schvalovatelem na devu MeetAI-Dev, proč tam Edit fungoval. | hlavní session |
| `sondy/data-prava.md` | 13, 131–154 | celá cesta C (role z tokenu, 401/403/201/200, 0 USD) označena ✅ „proběhlo“ | ⚠ | V `sondy/data-prava/` není žádný log volání (jen `api/` s `server.mjs`, `Dockerfile`, `package.json`). Doplnit surový výstup (např. `api-matrix.jsonl`) ze znovu spuštěné matice volání. | hlavní session |
| `sondy/data-prava.md` | 154 | studený start 7,8 s a 0,15–0,3 s | ⚠ | Bez důkazu. Změřit znovu a uložit výstup. | hlavní session |
| `sondy/data-prava.md` | 154 | resume Azure SQL po auto-pauze „desítky sekund“ | ⚠ | 📘/❓. Změřit (nechat DB usnout, 1. dotaz). | hlavní session |
| `sondy/data-prava.md` | 156 | `AadHttpClient` z SPFx proti tomuto API ❓ | ⚠ | Cesta je ✅ pro gateway v `sondy/ai.md`. Přidat odkaz tam, nebo ověřit na tomto API. | hlavní session |
| `sondy/data-prava.md` | 74 | schvalovatel s Edit u `ZadostiACL` „ne“ | ⚠ | `extras2.jsonl` ř. 28 vrací 404 „Seznam neexistuje“ (list nepřístupný, ne skrytá položka). Důkaz je slabý, zopakovat s právem na list. | hlavní session |
| `sondy/data-prava.md` | 75 | zadavatel rozbil dědičnost na položce v `ZadostiACL`, 200 (ř. 75) | ⚠ | Sám autor píše ❓ „nechápu proč“. Vyjasnit před použitím pro důvěrná data (`extras2.jsonl` ř. 30). | hlavní session |
| `sondy/data-prava.md` | 71 | přímé čtení souboru přílohy v prohlížeči s cookie ❓ | ⚠ | Ověřit v prohlížeči (Playwright) pod zadavatelem. Samotné 401 u `extras.jsonl` ř. 12–14 nic nedokazuje. | hlavní session |
| `sondy/data-prava.md` | 96 | přidání indexu na již naplněný seznam nad prahem ❓ | ⚠ | Snadno proveditelné na `Velky`. Přidat nový sloupec s indexem při 6000 položkách a zapsat výsledek. | hlavní session |
| `sondy/data-prava.md` | 17 | „90 % appek z EG.D soutěže stačí SharePoint“ | ⚠ | Číslo bez zdroje. Přepsat kvalitativně, nebo doložit rozborem zadání. | hlavní session |
| `sondy/data-prava.md` | 78, 98, 158 | 5000 unikátních ACL / 50 000 tvrdý limit, limity lookupů a příloh, Cosmos free tier | ⚠ | Jen 📘 a nikde neověřeno. Označit jako „Neověřeno“ nebo změřit (ACL tvrdý limit nejde, ostatní ano). | hlavní session |
| `sondy/data-prava.md` | 109–113, 117 | co z kitu `ppf-spfx-devkit` lze vzít a vzor „schvalování bez `CancelCheckout`“ | ⚠ | Kód přečten z gitu, v labu nespuštěn. Vzor „list rozhodnutí + otisk“ ověřit pod schvalovatelem bez `CancelCheckout`. | hlavní session |
| `sondy/data-prava.md` | 102 | PnPjs / `SPHttpClient` | ⚠ | Testováno jen holé REST. Doplnit, že `SPHttpClient` a PnPjs v SPFx v labu neběžely, nebo ověřit. | hlavní session |
| `sondy/data-prava.md` | 123–129 | B) Dataverse: licence, zrušení Teams prostředí (od 15. 11. 2026), `AADSTS65001` | ⛔ | Odůvodnění „mimo rozpočet/licence“ je napsané. Doplnit, kolik by stálo založení developer prostředí, zda to E5 pokrývá, a datum z Microsoft Learn (dnes je už po 15. 11.). | hlavní session |
| `sondy/data-prava.md` | 123–129 | B) bez požadavků na IT E.ON a bez obtížnosti pro citizen developera | 🔀 | Doplnit, co chce IT E.ON a jak je cesta těžká (jako u A a C). | hlavní session |
| `sondy/data-prava.md` | 78 | ACL na položku přes Power Automate / Function jen zmíněno, netestováno | 🔀 | Přidat variantu D: SharePoint seznam + Power Automate s `ManagePermissions` (🔀 pro a proti, licence, náročnost). Ověřit v labu. | hlavní session |
| `sondy/data-prava.md` | 14 | sdílení záznamu: A (jen `ReadSecurity=1`) vs. C | 🔀 | Chybí, kdo nastavuje ACL a jaké je to pro citizen developera. Doplnit srovnání. | hlavní session |

**Riziko pro středu:**

1. Vysoké: pokud vzor `CancelCheckout` (a ne Edit) neplatí i v tenantu E.ON, schvalovatel nevidí cizí žádosti a celá role „schvalovatel“ selže. Ověřeno jen na labu, v E.ON nikoli (ř. 58).
2. Střední: cesta C je v dokumentu ✅, ale bez dohledatelného logu. Pokud na workshopu selže (token, role, admin consent), nejde ji rychle obhájit ani zopakovat (ř. 131–154).
3. Střední: u položek s vlastním ACL zadavatel dokázal rozbít dědičnost (ř. 75, nevysvětleno). Pokud vzor dostane i důvěrná data, může v EG.D porušit důvěrnost.


<a id="sondy-dokumenty-md"></a>
### `sondy/dokumenty.md` (autor: hlavní session)

**Namátka důkazů:**

- Web part ukládá do knihovny přes `AddUsingPath` a volá `MSGraphClientV3 … content?format=pdf` (ř. 45, 58) → `spfx/egd-dokumenty/src/webparts/dokumentyGenerator/DokumentyGeneratorWebPart.ts:54, 115–118` → ano. `package-solution.json` má `Files.Read.All`, `.sppkg` má 1 076 696 B (≈ 1,08 MB), a chunky docx 295 KB, exceljs 941 KB, pdf-lib 1,16 MB, pptx 372 KB, tpl 274 KB, hlavní bundle 14,7 KB → ano, čísla sedí.
- jsPDF s výchozím fontem rozbije češtinu, pdf-lib s TTF ji zvládá (ř. 31, 33) → `out/pdf/pdf-jspdf-default.pdf` (`pdftotext`: „PYehled revizí rozvado“) a `out/pdf/pdf-pdflib.pdf` („Přehled revizí rozvaděčů“) → ano. Chybová hláška `WinAnsi cannot encode "ř"` se nikde nedohledala: v `src/` ani v logu není.
- Graph PDF z docx, xlsx a pptx plus velký docx 11,5 MB (ř. 54–55) → `out-graph/*.pdf` (docx 1 str., xlsx 2, pptx 3), `out-big/obri.docx` 11 549 992 B → `obri.pdf` 646 122 B, 1 str. → ano. Ale chybí log HTTP volání, jen výsledné soubory. `docx 0,7 / 2,9 MB` sedí (maly 731 963 B, velky 2 896 448 B). Zapsat do labu `obri.docx` 11,5 MB je ověřitelné jen přes výstupní PDF.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `sondy/dokumenty.md` | 9–10, 12, 16, 33, 45 | Všech 5 výstupů se vygeneruje a čeština je OK (Word, Word ze šablony, Excel, PPT, PDF), změřeno v SPFx web partu | ✅ | Soubory v `out*/` existují a sedí. Chybí jen log běhu v SPFx, viz ř. 45. | hlavní session |
| `sondy/dokumenty.md` | 54, 56 | Graph `?format=pdf` funguje: docx/xlsx/pptx, 2,9 a 11,5 MB, 1–2 s, ze SPFx i z prohlížeče | ✅ | Výstupní PDF existují. HTTP kódy, doby, 302 a „85 206 B“ nejsou nikde zalogované (`graph-browser-test.mjs` je jen skript, jeho výstup uložený není). Ulož log běhu do `sondy/dokumenty/` a odkaž na něj. | hlavní session |
| `sondy/dokumenty.md` | 57 | `Files.Read` samotné → 403, `Files.Read.All` OK | ⚠ | Důkaz je jen manifest appek `rra*.json`, výstup 403 není uložen. Zopakuj volání přes `tools/dokumenty-graph-pdf.sh` s appkou `-filesread` a ulož výstup. | hlavní session |
| `sondy/dokumenty.md` | 55 | docx 11,5 MB převedeno, takže limit 2 MB z dokumentace neplatí | ⚠ | Napiš „neplatí v labu na tenantu E5 pro docx“ a ne obecně. Pro xlsx a pptx je to už přiznané jako neověřené, ale chybí v sekci „Neověřeno“ (ř. 108–113). | hlavní session |
| `sondy/dokumenty.md` | 58–59, 61 | Ze SPFx přes `MSGraphClientV3` bez Azure; stačí `Files.Read.All` schválit jednou (Global Admin), platí pro celý tenant | ⛔ | Schválení v labu nešlo ověřit (principál měl grant předem, seznam žádostí → 403) a to je napsané. Chybí ale důvod proč to nejde a návrh jak ověřit. Doplň: „ověřit v E.ON, nebo v labu nový tenant bez předchozího grantu (trial)“. | hlavní session |
| `sondy/dokumenty.md` | 61 | „Global Administrátor“ schvaluje, „Files.Read.All pro celý tenant“ | ⚠ | Je to 📘 z `use-aadhttpclient` a v labu nezkoušeno. Doplň, že schvalovat umí i SharePoint admin (viz rozpor v ř. 61 níže). | hlavní session |
| `sondy/dokumenty.md` | 61 | Rozpor: tady „schválení Global Administrátorem“, ale `skills/egd-dokumenty/SKILL.md:153` a `04-integrace-test-plan.md:28` píšou „SharePoint admin centrum → API access“ | ❌ | Sjednoť: kdo přesně smí schválit (SharePoint admin vs. Global Admin) a ověř v labu pod rolí SharePoint admin. | hlavní session |
| `sondy/dokumenty.md` | 62–63 (tabulka B/C) | Power Automate: Word Online (Business) = Premium, Run script 1600/den, content controls, 10 MB, MFA | ⛔ | Je to 📘 a výslovně napsáno „v labu jen Standard“. Doplň, jak ověřit (tenant s Premium/PAYG, `copilot-credits-rg` v `03-lab.md:62`). Pro vibecodera se to nedoporučuje, takže riziko je nízké. | hlavní session |
| `sondy/dokumenty.md` | 71 | C) Container App „v řádu jednotek USD/měs.“ | ⚠ | Cena je „neměřeno“. Změř v labu (scale-to-zero + LibreOffice kontejner) nebo odkaž na `10-container-app.md`. | hlavní session |
| `sondy/dokumenty.md` | 14, 67, 80 | C) server: „LibreOffice lokálně ✅, v kontejneru je nutné doinstalovat fonty (Carlito/Liberation)“ | ⚠ | Lokálně ano, kontejner nezkoušen. Tvrzení o fontech v kontejneru nemá důkaz, ověř v `docker run` nebo označ ❓. | hlavní session |
| `sondy/dokumenty.md` | 14 | Hromadné/plánované generování → C | 🔀 | Chybí naměřená varianta. Doplň alespoň Power Automate Standard (SharePoint → OneDrive Convert) jako druhou cestu s pro/proti a náročností. | hlavní session |
| `sondy/dokumenty.md` | 73 | PDF v B: OneDrive „Convert file“ (Standard, Preview) jen pro OneDrive uživatele | ⚠ | 📘 bez pokusu. Zkus v labu a ulož výstup, nebo napiš proč nejde (lab má Flow Free, a konektor je Standard). | hlavní session |
| `sondy/dokumenty.md` | 12, 33 | pdfmake funguje po `addVirtualFileSystem` + `addFonts` | ✅ | `out-browser/pdf-pdfmake.pdf` existuje, kód `src/gen-pdfmake.mjs:7`. | hlavní session |
| `sondy/dokumenty.md` | 29 | SheetJS z npm je zastaralý, `npm audit` high; styly jen v placené verzi | ⚠ | Audit výstup není uložen a „styly jen v placené“ je 📘. Spusť `npm audit` v `sondy/dokumenty/` a ulož výstup. | hlavní session |
| `sondy/dokumenty.md` | 28, 92 | docxtemplater PPTX/XLSX šablony ❓, placené moduly | ⚠ | Je přiznáno jako neověřené (ř. 110–112), ale ř. 72 a 92 jsou pro „E.ON vzhled“ klíčové. Vyzkoušej PPTX šablonu v labu, nebo napiš „nepodporováno bez placeného modulu“. | hlavní session |
| `sondy/dokumenty.md` | 36–37 | Firemní font E.ON do PDF jen jako TTF s licencí pro vkládání | ⚠ | Je to domněnka. Ověř s Roboto jako náhradou (ř. 37, sedí) a firemní font dej do „Neověřeno“ (je tam v ř. 113). | hlavní session |
| `sondy/dokumenty.md` | 90 | pdf-lib poslední vydání 2021, exceljs 2023, docx/pptxgenjs/pdfmake aktivní | ⚠ | Údržba je 📘 z npm, bez data ověření. Doplň `npm view <balík> time` s datem. | hlavní session |
| `sondy/dokumenty.md` | 84 | pptxgenjs v SPFx: `UnhandledSchemeError`, patch funguje, `resolve.alias`/`externals` nestačí | ✅ | `config/webpack-patch/node-builtins.js` existuje a build prošel (`.sppkg` vznikl). Selhání alternativ není zalogované. | hlavní session |
| `sondy/dokumenty.md` | 111 | Pod účtem hosta z EG.D nezkoušeno | ⛔ | Jen tenant E.ON / host. Doplň, zda lze v labu založit hosta (`tools/lab-ucty-*`) a ověřit zápis do knihovny. | hlavní session |
| `sondy/dokumenty.md` | 8–16 | Doporučení „výchozí = cesta A“ | 🔀 | Varianty jsou popsané včetně pro a proti (ř. 65–76), ale chybí náročnost pro citizen developera u Graph PDF kroku (admin consent) a co přesně chce IT E.ON u varianty B (ř. 70 je jen výčet). | hlavní session |

**Riziko pro středu:**

1. Schválení `Files.Read.All` v E.ON (kdo schvaluje, jak dlouho to trvá) je neověřené a rozcházejí se zdroje (Global Admin vs. SharePoint admin); když schválení nepřijde, Graph PDF nepůjde a zbývá pdf-lib s fontem. Hodnocení: vysoké.
2. Trial E5 (lab) končí 25. 11. ráno; Graph `Files.Read.All` grant a ověřené PDF cesty se mohou v labu bez licence rozbít. Hodnocení: střední (`06-azure-inventar.md:22`, `08-ucty-ucastniku.md:12`).
3. Build pptxgenjs/Heft u E.ON (gulp, SPFx 1.18.2, Node 18; viz `02-skills-a-kit.md:15`) není prověřený, webpack patch platí jen pro Heft/1.24.1. Hodnocení: střední.


<a id="sondy-napojeni-md"></a>
### `sondy/napojeni.md` (autor: hlavní session)

**Namátka důkazů:**

- ARES a Open-Meteo vrací z prohlížeče 200 i s Authorization → `sondy/napojeni/cors-vysledek.json` (ares 5433 B, open-meteo 324/323 B, `ok:true`) → ano.
- ČNB (`api.cnb.cz`, `denni_kurz.txt`) a OTE z prohlížeče neprojdou → tentýž soubor, `ok:false`, "Failed to fetch" → ano.
- Job stáhl ČNB kurzy do CSV, 30 měn → `sondy/napojeni/priloha-test.csv` je jen vzorová příloha (`code;rate`, AUD, BRL…). Nástroje `tools/napojeni-*` (7 souborů) existují. `napojeni-report-job.py` používá `IDENTITY_ENDPOINT` a `sendMail`, `napojeni-job-deploy.sh` má `replicaRetryLimit 0` → ano. Doklad z běhu (log Jobu, 202, 403, cron v 18:20:00 UTC, hlavičky mailu) v projektu není → ne.
- Sloupec „Proč“ u CORS (ř. 31–36): hlavičky `access-control-allow-origin: *`, ČNB preflight 403 (curl) a OTE preflight 404 jsou v `cors-vysledek.json` nenalezeny (0 shod na access-control/403/404) → ne.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `sondy/napojeni.md` | 31–36 | Důvody CORS (hlavička `*`, preflight 403/404 přes curl) | ⚠ | JSON obsahuje jen ok/err. Ulož výstup `curl -i -X OPTIONS` jako důkaz, nebo tvrzení zmírni. | hlavní session |
| `sondy/napojeni.md` | 57–60 | Mail doručen, čas cronu, 202/403 z logů, `Succeeded za 37 s` | ⚠ | Důkaz je jen v textu. Ulož výstup `az containerapp job execution list` a logy do `sondy/napojeni/` nebo uveď příkaz k reprodukci. | hlavní session |
| `sondy/napojeni.md` | 76, 77 | Delegovaný sendMail jako Eva, AADSTS65002 | ⚠ | Chybí uložený výstup `napojeni-graph-delegated.py` (202, `from`, chyba AADSTS65002). | hlavní session |
| `sondy/napojeni.md` | 99 | OAuth připojení se přes API založí ve stavu Error, přihlásit lze jen člověkem | ⚠ | Chybí výpis stavu připojení. Ověř, zda existuje cesta bez člověka (např. service principal connection), nebo napiš proč ne. | hlavní session |
| `sondy/napojeni.md` | 78 | SPFx `webApiPermissionRequests` pro `Mail.Send` | ⚠ (❓) | Je jen 📘 a zároveň základ doporučené varianty A, takže pro kánon nestačí. Ověř v labu: SPFx web part nasazený s požadavkem, schválení v API access, volání `MSGraphClient`. | hlavní session |
| `sondy/napojeni.md` | 81, 85–87, 88, 113 | 3 MB limit přílohy, HTTP Premium, vlastní konektor Premium, PAYG podmínky | ⚠ (📘) | Ověř v labu (příloha nad 3 MB, tier akce HTTP), nebo zapiš do „Neověřeno“. Doporučení nesmí stát na 📘. | hlavní session |
| `sondy/napojeni.md` | 64, 123 | ACR Basic ~5 USD/měs. | ⚠ | Cena je jen 📘, ale `06-azure-inventar.md:48` má změřený ACR Basic (1,51 EUR za 11.–14. 11.). Použij naměřené číslo. | hlavní session |
| `sondy/napojeni.md` | 98–103 | Flow v Power Automate nedoběhlo (Failed, Unauthorized) | ⛔ | Je to otevřená položka s postupem pro Pavla, což je v pořádku. Po přihlášení konektorů zapiš výsledek ✅. Do té doby je „B funguje“ neověřené. | hlavní session |
| `sondy/napojeni.md` | 12, 14 | ✅ pro Container Apps Job a RBAC, ale label sdílí cizí prostředí `ca-ppf-rooms-env` | 🔀 | Chybí varianta „Job v EG.D“: co chce IT E.ON (vlastní prostředí, kvóta 1 prostředí na předplatné), pro a proti. | hlavní session |
| `sondy/napojeni.md` | 117–125 | Srovnání A/B/C | 🔀 | Chybí varianta Azure Function (timer trigger) a Logic Apps Standard/Consumption, pokud byly v ppf-rooms ověřeny. Napiš „neprověřeno“ s důvodem. | hlavní session |
| `sondy/napojeni.md` | 32 | „ČNB `api.cnb.cz`… preflight vrací 403“ vs. 128 | ❌ (drobný) | Ř. 120 uvádí u B „⚠ jen přes HTTP (Premium)“. `04-integrace-test-plan.md:18` říká „✅ tier Premium“, ale ř. 87 píše o HTTP „📘 Premium“. Sjednoť značku (✅ u HTTP with Entra ID, 📘 u vestavěné HTTP). | hlavní session |
| `sondy/napojeni.md` | 130+ vs `skills/egd-maily/SKILL.md:32` | `egd-maily` uvádí `AADSTS65001`, sonda změřila AADSTS65002 u klienta bez předautorizace | ❌ | Rozliš v skillu 65001 (chybí souhlas správce) a 65002 (klient bez předautorizace), případně oprav. Jinak je skill zavádějící. | hlavní session |

**Riziko pro středu:**

1. Vysoká: trial E5 a Business Premium + Copilot končí 25. 11. (`06-azure-inventar.md`). Pokud na workshopu ukazuješ flow v Power Automate nebo delegovaný `Mail.Send`, mohou se licence nebo Dataverse role v den akce ztratit. Flow navíc ještě nikdy nedoběhlo a vyžaduje ruční přihlášení konektorů.
2. Střední: doporučená varianta A (e-mail z SPFx přes `MSGraphClient` a `webApiPermissionRequests`) nebyla v labu ověřena ze SPFx web partu. Ověřený je jen Graph s ROPC. Ve skillu `egd-maily` je z toho „bez Azure, jedno schválení“ a na workshopu to může padnout na schvalování oprávnění.
3. Střední: Job běží ve sdíleném cizím prostředí `ca-ppf-rooms-env` z `rg-ppf-rooms-lab`. Pokud se ppf-rooms zdroje před 25. 11. uklidí nebo vyprší kredit, demo Jobu s cronem zmizí.


<a id="sondy-power-automate-md"></a>
### `sondy/power-automate.md` (autor: sonda-power-automate)

**Namátka důkazů:**

živé čtení labu přes `tools/pa-flow.py`):
- Flow `78b7eef6-…`, `c076f6d0-…`, `6492f614-…` jsou uložena → `pa-flow.py list` je ukazuje jako Started → ano.
- Recurrence + Compose „doběhlo Succeeded“ (ř. 15) → `pa-flow.py runs b4ffdc0a-…` → ano, Succeeded 2026-11-22 18:43. LLM flow `161eb740-…` také Succeeded 18:46, takže ř. 13 platí.
- Zahazování těla u `triggers/manual/run` (ř. 33) → `~/Projects/ppf-rooms/docs/power-automate.md:110,152` → ano.
- Flow JSON v `sondy/power-automate/` existují (rec-http, http-cnb, llm-foundry, mail-shared, grant, convert-pdf, queue-llm, trigger-*), `tools/pa-flow.py` a `pa-connection.py` také. Účet `aoai-egd-sonda-ai` je v `sondy/ai.md:78`.
- Slabina: ve složce `sondy/power-automate/` nejsou žádné výstupy běhů ani odpovědi API (chybí 409, 401, 403, tiery). Jsou jen definice flow, takže důkaz jde dohledat jen živým dotazem na lab, ne ze souboru.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `sondy/power-automate.md` | 13 | LLM přes Foundry Inference je Standard a flow vrátilo českou větu | ✅ | Doplň do souboru odkaz na ID běhu (`1aae33f3…`/`161eb740…`, běh `…CU15`). | sonda-power-automate |
| `sondy/power-automate.md` | 13 | OCR/vision a AI Builder přes PA | ⚠ | Ověř v labu, nebo napiš proč nejde (chybí kredity/Dataverse). Popsáno jako ❓, ale nezkoušeno. | sonda-power-automate |
| `sondy/power-automate.md` | 13, 39 | „PA o něco jednodušší pro vibecodera než CA“ | ⚠ | Je to úsudek bez měření. Doplň pro a proti a náročnost. | sonda-power-automate |
| `sondy/power-automate.md` | 14 | Flow s HTTP nejde zapnout (409), příčina licence | ❌ | `napojeni.md:87` a `04-integrace-test-plan.md:17` uvádějí, že HTTP flow v ppf-rooms doběhlo pod E5. Rozpor s „Premium blokuje“. Rozliš v labu, zda 409 způsobuje licence, nebo něco jiného (např. nepublikované řešení). Další podezření: stejné 409 je i u flow s Request triggerem. | sonda-power-automate |
| `sondy/power-automate.md` | 14 | RSS konektor je Standard ✅ | ⚠ | U RSS není běh, jen tier. Doplň test, nebo to označ jako jen tier. | sonda-power-automate |
| `sondy/power-automate.md` | 14, 56 | HTTP/Request/Word/SQL = Premium | ⚠ | Tier z API je ✅, ale závěr „poběží jen s licencí“ není ověřen. Trial Premium je u Pavla (ř. 56). | sonda-power-automate |
| `sondy/power-automate.md` | 15 | Recurrence + Compose je Standard a doběhlo | ✅ | Ověřeno živě. | sonda-power-automate |
| `sondy/power-automate.md` | 15 | Při odchodu vlastníka se flow zastaví | ⛔ | Napiš výslovně „jen v tenantu E.ON“. Teď je to jen ❓. | sonda-power-automate |
| `sondy/power-automate.md` | 16 | Shared mailbox: flow uloženo, Send As přidáno | ✅ | Ověřeno `list`. Chybí důkaz Send As (výstup skriptu, `Get-RecipientPermission`). | sonda-power-automate |
| `sondy/power-automate.md` | 16, 18, 20, 31 | Běh mail-shared / grant / convert-pdf / queue-llm | ⚠ | Čeká na přihlášení připojení. Ověř po přihlášení; Pavel nebo `pa-connection` nedokáže OAuth. Flow `queue-llm` jde dokonce nejde uložit. | sonda-power-automate |
| `sondy/power-automate.md` | 17 | SQL/Dataverse Premium, běh nezkoušen | ⚠ | Ověř v labu s Premium trialem, nebo napiš proč nejde. Vlastní konektor také. | sonda-power-automate |
| `sondy/power-automate.md` | 17 | Alternativy bez Premium (SharePoint seznam, Excel Online) | 🔀 | Jsou jmenovány, ale chybí pro a proti, nároky IT a náročnost. Excel Online nebyl vůbec zkoušen. | sonda-power-automate |
| `sondy/power-automate.md` | 19 | Role složitější než „své / vše“ | ⚠ | Ověř v labu, nebo označ jako návrh bez měření. | sonda-power-automate |
| `sondy/power-automate.md` | 20 | Word šablona → PDF: Populate (Premium) vs OneDrive Convert | 🔀 | Chybí běh (b), cizí konektory (Encodian/Plumsail) nezkoušeny; chybí náročnost a nároky IT. Doplň varianty s pro a proti. | sonda-power-automate |
| `sondy/power-automate.md` | 22 | OBO neumí / HTTP with Entra ID je Premium | ⚠ | Tier ✅, tvrzení „OBO neumí“ je 📘. Ověř, nebo napiš proč nejde. | sonda-power-automate |
| `sondy/power-automate.md` | 28 | HTTP request trigger vyžaduje Premium | ⚠ | Viz ř. 14, 409 ≠ důkaz licence. | sonda-power-automate |
| `sondy/power-automate.md` | 29 | PowerApp trigger: 401 bez tokenu, 403 s tokenem | ✅/⚠ | 401/URL změřeno (✅), ale funkční volání ze SPFx se nepodařilo (403). Zapiš výslovně do „Neověřeno“ i dopad na doporučení. | sonda-power-automate |
| `sondy/power-automate.md` | 30 | Button/Teams nevolatelné | ✅ | Změřeno (blokováno `ListCallbackUrlOperationBlocked`). | sonda-power-automate |
| `sondy/power-automate.md` | 31 | Doporučená cesta: seznam jako fronta | ❌ | Doporučení stojí na neověřené (ne uložené, nespuštěné) cestě; přitom dokument tvrdí „doporučená“. Kánon zakazuje doporučení z ❓. Ověř, nebo přeformuluj jako kandidáta. Latence ~1 min je ❓. | sonda-power-automate |
| `sondy/power-automate.md` | 32, 33 | „For a selected item“, Flow API z prohlížeče | ⛔/⚠ | Označ jako neověřené a doplň způsob ověření v lab (ne E.ON). | sonda-power-automate |
| `sondy/power-automate.md` | 35–47 | Srovnací tabulka (kdo je jednodušší, co chce IT) | ⚠ | Většina buněk je odhad z ❓ řádků; navíc u řádku Databáze se píše „CA s SQL ✅ sonda data-prava“ bez odkazu na soubor. Odlišuj změřené a odhadnuté. | sonda-power-automate |
| `sondy/power-automate.md` | 41 | Env Maker role nutná (✅ viz sonda 4) | ✅ | `napojeni.md:96` ověřeno. | sonda-power-automate |
| `sondy/power-automate.md` | 49–50 | Obecné háčky PA (OAuth, vlastník…) | ⚠ | Označeno ❓, nezkoušeno v labu. Ověř, nebo napiš proč nejde. | sonda-power-automate |
| `sondy/power-automate.md` | 10-container-app.md:45–53 | Tabulka PA alternativ: LLM „AI Builder, Premium + kredity ❓“ | ❌ | Rozpor: tento soubor říká Standard ✅ (Foundry konektor). Hlavní session má srovnat. Ostatní řádky té tabulky také zastaralé (ř. 46, 53 stav ❓). | sonda-power-automate |
| `sondy/power-automate.md` | 61–66 | Co smí jen Pavel (přihlášení 3 připojení, trial) | ⛔ | Je to výslovné s důvodem (OAuth jen člověk). OK, ale pozor na termín (viz riziko). | sonda-power-automate |

**Riziko pro středu:**

1. Vysoké: „Seznam jako fronta“ je doporučená cesta ze SPFx, ale flow se nikdy nespustilo (není ani uložené); pokud nepojede nebo je latence minuty, hlavní demo „klikni v appce, flow udělá“ selže.
2. Vysoké: Premium vs. Standard u HTTP není rozhodnuto (409 vs. ppf-rooms, kde HTTP pod E5 běželo); EG.D se může dozvědět, že „PA na API bez CORS nejde“, přestože to je jen artefakt labu.
3. Střední: Většina běhů (sdílená schránka, práva, PDF, fronta) čeká na OAuth přihlášení od Pavla, a lab trialy E5 končí 25. 11. ráno (`06-azure-inventar.md:22`), takže po vypršení se flow nemusí dát dozkoušet vůbec.

#### STAV POLOŽEK 1. KOLA (2. kolo auditu, `sondy/power-automate.md` po opravě)

**Namátka důkazů 2. kola** (`sondy/power-automate/vystupy/`):
- `behy.txt`: LLM flow `161eb740` běh `…CU15` Succeeded 18:46, Compose `b4ffdc0a` běh `…CU20` Succeeded 18:43, RSS `…CU08` Succeeded 19:12, `78b7eef6…CU16`, `c076f6d0…CU30`, `6492f614…CU17` Failed `ActionFailed` → shoduje se s tvrzeními. Živě `pa-flow.py runs` vrací stejné běhy CU20, CU08, CU15 → ano.
- `diag-409.txt`: 403 `MissingAdequateQuotaPolicy` ("Premium license … connection: 'Http'") je u flow **Button + HTTP akce**; 409 `CannotStartUnpublishedSolutionFlow` ("unpublished solution flow … authenticate the flow connections and save the flow") u Recurrence + HTTP a u jednoho nepopsaného řádku (z pořadí Request trigger). Soubor je surový log bez popisků; řádek se 409 nemá ID flow. 403 → licence u akce HTTP je doložené ✅; 409 text mluví o nepublikovaném řešení/ nepřihlášených připojeních, ne o licenci.
- `katalog-konektoru-tier.txt`: 1395 řádků, Premium 1224 / Standard 171 (sedí s `04-integrace-test-plan.md:24`); `webcontentsv2`, `sql`, `commondataservice(forapps)`, `wordonlinebusiness`, `azureopenai` = Premium; `azureaifoundryinference`, `rss`, `office365*`, `excelonlinebusiness`, `encodian*`, `plumsail*`, `sharepointonline`, `onedriveforbusiness` = Standard → tiery v dokumentu sedí. Vestavěné „HTTP“ v katalogu není (jeho Premium stojí jen na textu 403).
- `sendas-get-recipientpermission.txt`: SendAs pro `tomas.prochazka@…` Allow → sedí, ale soubor neuvádí, na které schránce (chybí hlavička).
- `trigger-volani.txt`: 401 `DirectApiAuthorizationRequired`, 403 `MisMatchingOAuthClaims` (aud flow s lomítkem i bez, powerapps), 400 `ListCallbackUrlOperationBlocked` → přesně jak v ř. 41–42.
- `licence-tomas.txt`: 6 bajtů („2 / 2 2“), nic nedokládá; v dokumentu necitováno, nevadí.

| ř. 1. kola | položka | vyřešeno | poznámka |
|---|---|---|---|
| 13 | LLM Standard + běh | ano | Běh `…CU15` je v `behy.txt` a živě; tier v katalogu i v `behy.txt`. Řádek 13 necituje `vystupy/behy.txt` přímo, jen obecně ř. 81. |
| 13 | OCR/vision, AI Builder | ne | Pořád ❓ „nezkoušeno“; OCR/vision šlo zkusit přes Foundry (vision model), důvod nemožnosti není. AI Builder: důvod (Dataverse + kredity) uveden. |
| 13, 39 | „PA jednodušší“ | ano | Označeno „odhad“ (ř. 49 a 53), plus přibyla tabulka Varianty bez Premium s pro/proti. |
| 14 | HTTP 409, příčina licence vs. ppf-rooms | ne (částečně) | Pro akci HTTP doloženo: 403 u Button + HTTP je licence ✅ (`diag-409.txt`). Rozpor s ppf-rooms uznán, hypotéza v Neověřeno ř. 74. Ale: (a) „409 = stejná třída blokace“ (ř. 14) není podložené, text 409 je jiný (nepublikované řešení/ nepřihlášená připojení); (b) Neověřeno ř. 69 stále píše „příčina (licence) nepotvrzena“, což odporuje ř. 14 („příčina je licence ✅“); totéž `04-integrace-test-plan.md:25` vs. `:60`. Nutné sjednotit. |
| 14 | RSS Standard | ano | Běh `…CU08` Succeeded v `behy.txt` i živě; napsáno, že čte jen feedy. |
| 14, 56 | HTTP/Request/Word/SQL Premium | ano | Tier z katalogu ✅; závěr „poběží jen s licencí“ přesunut do Neověřeno ř. 69 s postupem (trial Premium). Pro akci HTTP navíc 403. Pozor na rozpor viz ř. 14 výš. |
| 15 | Recurrence + Compose doběhlo | ano | `…CU20` Succeeded, živě potvrzeno. |
| 15 | Odchod vlastníka | ano | Neověřeno ř. 73: výslovně „jen v tenantu E.ON“ s návrhem pilotu. |
| 16 | Send As doložen | ano | `sendas-get-recipientpermission.txt` existuje a ukazuje SendAs Allow; slabina: bez názvu schránky v souboru. |
| 16, 18, 20, 31 | Běhy mail-shared / grant / convert-pdf / queue-llm | ano | Přeznačeno ❓, ID běhů CU16/CU30/CU17 Failed v `behy.txt`, důvod (OAuth jen člověk) a postup v Neověřeno ř. 70. `queue-llm` výslovně „neuloženo“. Neověřeno z objektivního důvodu. |
| 17 | SQL/Dataverse běh | ano | Důvod napsán (Premium konektor flow nezapne), tier ✅ v katalogu, postup ř. 69/72. |
| 17 | Alternativy bez Premium 🔀 | ano | Nová tabulka ř. 24–34 s pro/proti/IT/náročností; Excel Online a Encodian/Plumsail přiznaně ❓. |
| 19 | Role složitější | ano | Ř. 19 ❓ + Neověřeno ř. 72, srovnání „odhad“. Nezkoušeno, ale poctivě označeno. |
| 20 | Word → PDF 🔀 | ano | Tabulka ř. 31–34 doplnila varianty (OneDrive, Populate, Encodian/Plumsail, CA) s pro/proti/IT/náročností. Běh (b) čeká na přihlášení. |
| 22 | OBO neumí | ne | Přeznačeno ❓ (ř. 22, Neověřeno ř. 72), ale bez důvodu nemožnosti a bez návrhu testu; `10-container-app.md:93` pořád píše „PA OBO neumí“ bez ❓ v textu. |
| 28 | HTTP request trigger Premium | ne | Ř. 40 stále píše „blokováno bez Premium ✅“ pro Request trigger, ale důkaz je jen 409 s textem o nepublikovaném řešení (ne licence). Přeformulovat na „blokováno, příčina neznámá ❓ (409)“. Stejně `10-container-app.md:99` („trigger blokuje sám“, Premium ✅). |
| 29 | PowerApp trigger 401/403 | ano | `trigger-volani.txt` odpovídá; 403 je v ř. 41 a Neověřeno ř. 71; dopad na doporučení (fronta jako kandidát) zapsán. |
| 30 | Button/Teams nevolatelné | ano | `trigger-volani.txt`: 400 `ListCallbackUrlOperationBlocked`. |
| 31 | Fronta jako „doporučená“ | ano | V souboru přeformulováno na „Kandidát (neověřeno)“ (ř. 43). Zbytky: `10-container-app.md:101` píše „Sonda ji označuje za doporučenou“ a ř. 61 tohoto souboru má „PA fronta v seznamu“ bez ❓. Sdílený soubor opraví hlavní session. |
| 32, 33 | „For a selected item“, Flow API z prohlížeče | ano | Ř. 44–45 označeny ❓, způsob ověření v Neověřeno ř. 71–72 (obecný). |
| 35–47 | Srovnací tabulka odhady | ano | Úvodní věta označuje odhady, „CA s SQL ✅“ má odkaz `data-prava.md`. |
| 41 | Env Maker | ano | Nezměněno; `sondy/napojeni.md:98` (v 1. kole chybně `:96`) tvrzení obsahuje. |
| 49–50 | Obecné háčky PA | ne | Ř. 63 odkazuje „Ostatní háčky (flow mimo repo, vlastník, export) viz Neověřeno“, ale v tabulce Neověřeno export/flow mimo repo chybí (jen vlastník, ř. 73). Doplnit řádek. |
| 10-container-app:45–53 | Rozpor LLM Standard vs. Premium | ano | `10-container-app.md:85` nyní Standard ✅ Foundry, shoduje se. Zbytky: ř. 33 a 99 pořád „409“ u HTTP (správně je 403 u akce), viz též ř. 28 výš. |
| 61–66 | Co smí jen Pavel | ano | Sekce ř. 77–83 výslovná; termín trialu 25. 11. 04:04 sedí s `06-azure-inventar.md:13`. |

**Souhrn 2. kola:** z 25 položek 1. kola vyřešeno 20, nevyřešeno 5 (ř. 13 OCR/vision; ř. 14 vnitřní rozpor „licence ✅“ vs. Neověřeno ř. 69 a neopodstatněné „stejná třída blokace“ u 409; ř. 22 OBO; ř. 28 Request trigger „Premium ✅“; ř. 49–50 chybějící řádek „háčky“ v Neověřeno). Nové: `diag-409.txt` je neoznačený log (první 409 bez ID flow, Button flow v logu při 201 „Started“ a pak 403 při aktivaci – pořadí nejasné); doporučuji připsat do souboru popisky. Žádné nové ❌ vůči labu; rozpor uvnitř projektu zůstává jen v textech o 409.


<a id="skills-egd-pripravenost-skill-md"></a>
### `skills/egd-pripravenost/SKILL.md` (autor: test-pripravenost)

**Namátka důkazů:**

- „CLI 11 i 12 padají na Node 18“ (ř. 75) → TEST.md:17 a konstanta `CLI_MIN_NODE_MAJOR` v pripravenost.mjs:21 → ano, ale jen jako popis, bez surového výstupu.
- „web part s `requiresCustomScript: false` běží při zablokovaném Custom Scriptu“ (ř. 88) → 04-integrace-test-plan.md:12 a ~/Projects/ppf-arcade/odpoved-adriane.md:12–15, soubor existuje → ano.
- „SPFx 1.24 chce Node 22.14+; build na 22.23“ (ř. 91) → skills/egd-prvni-appka/references/chyby.md:45–46 → ano. Ověřený je build na Node 22.23. Minimum 22.14 je pořád jen z dokumentace.

**

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-pripravenost/SKILL.md` | 28–47 | Celý skript a postup „Windows i macOS“. Běh byl jen na macOS, Windows nikdy (TEST.md:36, README:70, windows.md:3) | ⚠ | Projít `nastroje` až `zprava` na čisté Windows VM s PS 5.1 a Node 22. Jinak v SKILL.md výslovně napsat „Windows neprošlo během, jen kontrola kódu“. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 46, windows.md 15–25 | PS 5.1: bez `2>&1`, bez `\ | Select -First`, ASCII uvozovky, BOM/UTF-16, cp1250 (jen 📘 a pozorování z jiných lidí) | ⚠ Ověřit na Windows, nebo označit 📘/❓. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 74 | PSGallery nezastaví CLI, protože je to npm balíček ✅ | ⚠ | Doložit odkazem na měření. Je jen v 01-fakta-workshopu.md:69 („naše měření“) a v E.ON se npm registry nezkoušel. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 75 | CLI 12 tokeny přes nativní doplněk; na Windows ❓. Záloha `--verze 11` na Windows nezkoušena | ⚠ | Ověřit CLI 12 a CLI 11 na Windows. Do kroku 4 doplnit, že fallback je neověřený. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 58, 79, prihlaseni.md 9–11, 13–14 | Login přes deviceCode/browser s appId je 📘. V TEST.md je ověřen `prihlaseni` (kontrola stavu) s labovým tenantem, ne `login` s vlastní appId | ⚠ | Projít v labu `login --authType deviceCode --appId <vlastní registrace>` i `--authType browser`. V SKILL.md výslovně uvést, že E.ON appId a Conditional Access je ⛔ jen E.ON. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 129–132 | Tabulka AADSTS (65001, 90094/95, 700016, 7000218, 53003/50097) označená 📘 | ⚠ | Většinu jde vyvolat v labu: registrace bez souhlasu → 65001, bez public client → 7000218, špatné appId → 700016. Zapsat výstupy. 53003/50097 označit ⛔ (jen E.ON). | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 86–87 | „Brzdou bývá role Member/Člen ✅ lab“ | ⚠ | chyby.md:15 říká „nejnižší potřebnou roli jsme neměřili“. Změřit s účtem Návštěvník/Člen/Vlastník, nebo vynechat „✅“ u minimální role. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 93–94 | „Lokální instalace `yo` + generátoru a jeho spuštění ✅ (macOS)“ | ⚠ | TEST.md uvádí jen `spfx` zelená/červená. Nenašel jsem, že byl proveden `spfx --instalovat` a spuštění generátoru. Zapsat běh, nebo „spuštění“ vypustit. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 108 | „Claude licenci z ITSM nepotřebuje“ (žádný zdroj) | ⚠ | 01-fakta-workshopu.md:21 říká „Claude v EG.D hůř dostupný“ a 09-github:31 „Claude licence“. Doplnit zdroj nebo označit ❓. Pro účastníky v EG.D je to tvrzení riziková zkratka. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 70–71, github.md 19 | Ověření licence Copilota přes ikonu a `github.com/settings/copilot`; věta pro IT předpokládá „Business“ | ⚠ | github.md:19 sám říká, že menu nebylo procházeno. Projít na osobním účtu a zjistit, jaký plán EG.D má. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | github.md 31, 09:19 | Záložní plán „Copilot Free zahrnuje agent mode i CLI“ je 📘. Je to doporučení pro úterý 24. 11. | ⚠ | Ověřit na osobním účtu (VS Code, `copilot login`), než se to doporučí účastníkům. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | github.md 50, 58 | `winget install GitHub.Copilot`, požadavek PowerShell 6+, Git Credential Manager na `*.ghe.com` (📘/❓) | ⚠ | Ověřit na Windows. Bez toho nepsat do kroku 9b jako jisté. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | README 29–33, 35 | Instalace skillu: `~/.copilot/skills`, `/skills reload`, `chat.useAgentSkills`, `.github/skills` | ⚠ | `copilot skill list` je ✅ jen jako existence příkazu. Skutečně načtení skillu ve VS Code a v Copilot CLI proveďte na Windows. Je to první věc, kterou účastník udělá. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 134 | „`{"error": …}` s kódem 0 ✅“ | ⚠ | Mám jen komentář ve skriptu (řádek 92) a žádný záznam měření. Doplnit příkaz a výstup, je to nízké riziko. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 62–63, 97–98 | Záložní cesty v prohlížeči (Power Apps/Automate se otevřou „s prostředím“) | ⚠ | TEST.md uvádí jen, že `prohlizec` vypíše adresy. Co člověk v E.ON uvidí, nikdo neověřil. Doplnit ❓. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 79, 110 | Katalog zakládá ručně Product Team E.ON, custom script jen na 24 h, `sharepoint@eon.com` (mail SHO-5032) | ⛔ | OK, zdroj je mail E.ON z 12. 11. (zdroje/ppf.md:74–75). Ve skillu připsat „⛔ jen E.ON, v labu nejde“. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 53, 108–109 | Postup ITSM: „my IT order“, schválení T. Richtera, „SharePoint Online \ | New Site Creation“ | ⛔ OK, zdroj je mail Adriány z 18. 11. Ve skillu připsat důvod ⛔ a že stav žádostí neznáme. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 79, 80 | appId v E.ON, souhlas správce, public client flows a Conditional Access v E.ON | ⛔ | Doplnit do SKILL.md výslovné „⛔ jen E.ON“, jinak zůstane jen 📘. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | github.md 38–44 | `github-enterprise.uri` + `authProvider` pro `*.ghe.com` | ⛔ | OK, github.md:44 to přiznává. Doplnit „v labu nemáme GHE.com“. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 5–11, 91, windows.md 37 | Node pro SPFx: SKILL.md a README říkají „22.14+ stačí“. Windows.md:37 doporučuje 24/26 a skript (řádek 471) žádá IT o 24/26 | ❌ | Sjednotit. Ověřený je jen build na Node 22.23. Node 24/26 v labu neběžel. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 79 vs. 62–63 | SKILL zakazuje `m365 setup`, protože zakládá registraci aplikace. Skript při `cli-instalace` volá `m365 setup --scripting --skipApp` | ❌ | `--skipApp` v help CLI 11.11.0 stojí „Skip configuring an Entra app“, takže zápis nehrozí. Přidat do SKILL.md větu, aby to agent nepovažoval za porušení pojistky. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 79–82, prihlaseni.md 16–28 | Varianty appId (od IT / nová registrace / `m365 setup` / bez CLI) | 🔀 | Chybí náročnost pro citizen developera, co přesně chce IT a co je v labu ověřené. Bez CLI (možnost 4) odkazuje na cestu A2/B z egd-prvni-appka. | test-pripravenost |
| `skills/egd-pripravenost/SKILL.md` | 116–118, 9b | Cesty A / A2 / B a Copilot vs. Claude jako jednořádkový popis | 🔀 | Doplnit pro a proti a odkaz na evidenci v egd-prvni-appka. Doporučení až po variantách. | test-pripravenost |

**Riziko pro středu:**

1. **Windows/PS 5.1 nikdy neběželo** (ř. 28–47, 46, README 29–33): od instalace skillu přes portable Node 22 po celý skript je ověřený jen kód a macOS, takže může účastníkům selhat hned na startu. Vysoké.
2. **Přihlášení k SharePointu v E.ON** (ř. 58, 79): bez appId se souhlasem správce, povolených public client flows a bez Conditional Access celý řetězec CLI spadne (cesta A). Skill má záložní cestu (A2/B), která v E.ON také nebyla zkoušena. Vysoké.
3. **Katalog aplikací, web a licence v E.ON** (ř. 53, 108–110): mají lhůtu a schválení mimo naši kontrolu, účastníci nemusí do středy nic z toho mít. Na workshopu pak zbývá lab nebo cesta B. Střední až vysoké.


<a id="skills-egd-pripravenost-readme-md"></a>
### `skills/egd-pripravenost/README.md` (autor: test-pripravenost)

**Namátka důkazů:**

- `copilot skill list` existuje (ř. 32) → spuštěno: `copilot skill list --help` i `copilot skill list` fungují (Copilot CLI 1.0.112), help uvádí `~/.copilot/skills/` jako osobní cestu a `.github/skills/` jako projektovou → ano.
- Node 18 nestačí, CLI chce Node 20+ (ř. 14) → `scripts/pripravenost.mjs:21` (`CLI_MIN_NODE_MAJOR = 20`, komentář „zmereno“) a TEST.md (ř. 17 „Node 18: CLI 11 i 12 nejdou spustit“) → ano. Samotné měření jsem nespouštěl, mám ho jen z TEST.md a komentáře ve skriptu.
- Skript běží a `--help` vypisá příkazy (ř. 67) → spuštěno `node …/pripravenost.mjs --help`, výstup obsahuje `nastroje`, `zkouska`, `github`, `zprava` atd. → ano.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-pripravenost/README.md` | 50 | appId „máš ho od Pavla nebo IT“ | ❌ | V projektu není žádný appId pro tenant E.ON, Pavel je tam jen host (01-fakta ř. 76). `egd-prvni-appka/README.md:73` a `TEST.md:70` říkají „appId od IT“. Přepiš na „od IT, případně ho doručí Pavel po domluvě s IT“ nebo napiš, kdo ho opravdu dodá. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 66–67 | ruční spuštění přes `cd %USERPROFILE%\…` a `node "%USERPROFILE%\…"` | ❌ | `%USERPROFILE%` nefunguje v PowerShellu (PS 5.1 je hlavní cílové prostředí podle windows.md). Oprav na `$env:USERPROFILE` (jako v `egd-prvni-appka/README.md`) nebo uveď obě varianty. Složka `egd-workshop` navíc nemusí existovat, přidej `mkdir`. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 14 vs SKILL krok 8 a skript ř. 471 | „Node ne starší než 22“ | ❌ | Soulad: SKILL krok 8 a `cmdSpfx` chtějí 22.14+ (22.0–22.13 selže), skript při chybě radí „Node 24 nebo 26“, windows.md radí portable 22 a pak 24/26. Sjednoť na jednu větu (22.14+/24/26) v README, windows.md i hlášce `spfx`. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 70–71 | „Node 18 … zatím ověřené nejsou“ | ❌ | TEST.md Node 18 (portable 18.20.8) v labu změřil. Přepiš: „Windows a tenant E.ON ověřené nejsou“ (na Node 18 už je ✅). | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 6 | „asi 20–40 minut“ | ⚠ | Nikde nezměřeno. Změř (macOS, Node 22), nebo napiš „odhad“. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 12 | „admin práva nejsou potřeba“ | ⚠ | Na Windows neověřeno (TEST.md ř. 33 „Windows za běhu neověřeno“). Označ ❓ nebo ověř na čisté Windows VM. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 31 | Copilot CLI `/skills reload` | ⚠ | TEST.md: „interaktivní, nezkoušeno“. Spusť v `copilot` interaktivně, nebo označ 📘/❓. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 33 | `chat.useAgentSkills` ve VS Code | ⚠ | Je tam značka 📘, ale kánon dokumentaci nepřijímá jako závěr. Ověř na lokálním VS Code (existence nastavení, načtení skillu z `~/.copilot/skills`), nebo napiš „Neověřeno“. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 29–30, 35 | VS Code načte skill z `~/.copilot/skills` i `.github/skills`, příkaz `/egd-pripravenost` | ⚠ | Pro CLI je to z `copilot skill --help` ✅, pro VS Code jen dokumentace. Ověř ve VS Code, nebo označ ❓. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 39–40 | Claude Code na Windows: `%USERPROFILE%\.claude\skills\` a `/egd-pripravenost` | ⚠ | Na Windows neověřeno, na macOS standard. Označ ❓ (nízké riziko). | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 14 | Node „stačí portable verze (bez admina)“ | ⚠ | Na Windows nezkoušeno. Ověř na VM, nebo označ ❓. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 59–61 | Objednávky: Copilot (T. Richter + vedoucí), 3 weby přes „SharePoint Online \ | New Site Creation“, katalog přes sharepoint@eon.com, zakládá se ručně | ⛔ Obsah souhlasí s `01-fakta` ř. 70–73 a `zdroje/ppf.md:75` (ticket SHO-5032). V README ale není napsáno, že jde o e-mail E.ON a v labu nejde ověřit. Doplň větu „zdroj: mail E.ON 12. 11. / Adriána 18. 11.; v labu neověřitelné“. Název ITSM položky „SharePoint Online \ New Site Creation“ jsem v ostatních dokumentech nenašel, ověř ho. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 48–51 | přihlášení device code / appId v tenantu E.ON | ⛔ | Chybí výslovné „jen v E.ON, v labu nejde“. Doplň (je to hlavní riziko podle TEST.md ř. 38). | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 55–57 | připojení k firemnímu GitHubu (github.md) | ⛔ | Adresa GitHubu EG.D není známa a `*.ghe.com` nemáme. Doplň do README větu „adresu zatím nemáme, dosadí se“, aby účastník nenarazil na `<GITHUB-ADRESA>`. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 70–71 | „Windows … zatím ověřené nejsou“ | ⛔ | OK, napsáno otevřeně. Chybí jen důvod („nemáme Windows VM“) a plán ověření (TEST.md navrhuje čisté Windows VM s PS 5.1). | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 23–41 | tři nástroje (VS Code Copilot, Copilot CLI, Claude Code) | 🔀 | Chybí pro a proti a náročnost pro citizen developera (Copilot CLI na Windows chce podle github.md PowerShell 6+ ❓, VS Code je nejjednodušší, Claude nepotřebuje ITSM licenci). Doplň tři řádky srovnání, nebo odkaz na `01-fakta`/`09-github-ucastnici.md`. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 20–22 | složka `egd-pripravenost` (SKILL.md, scripts, references) | ✅ | `ls` potvrzuje `SKILL.md`, `scripts/pripravenost.mjs`, `references/{github,prihlaseni,windows}.md`. Je tam i `TEST.md`, README o něm neříká, účastníkům se pravděpodobně posílat nemá. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 8–9, 52–53, 70 | zkušební zápis, běh skriptu na macOS (CLI 12.0.0), čtení webu | ✅ | Důkaz v TEST.md ř. 10–14, seznam v labu `…/sitecatalogtest/Lists/EGD-pripravenost`. Samotný zápis jsem znovu neověřoval. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 57 | github.md existuje | ✅ | Soubor je a obsahuje `copilot login --host`. | test-pripravenost |
| `skills/egd-pripravenost/README.md` | 14, 61 | Node 18 nestačí, CLI 11/12 chtějí Node 20+ | ✅ | Viz NAMÁTKA. | test-pripravenost |

**Riziko pro středu:**

1. appId pro CLI (ř. 50, 48–51): README slibuje, že ho má účastník od Pavla nebo IT, ale žádný appId pro E.ON v projektu není a Pavel je v tenantu jen host. Bez něj nejde přihlášení k SharePointu, účastníci spadnou na záložní cestu bez CLI. Vysoké.
2. Ruční spuštění s `%USERPROFILE%` (ř. 66–67) nefunguje v PowerShellu a README je psané pro Windows. Účastník, který skript pouští sám, narazí hned na začátku. Střední (agent skript spouští sám, ruční běh je záložní cesta).
3. Nejednotná verze Node (22 v README, 22.14+ v SKILL, 24/26 ve skriptu a v windows.md): účastník si stáhne portable Node 22.0–22.13 nebo 22, a SPFx na něm pak selže. Střední.


<a id="skills-egd-pripravenost-test-md"></a>
### `skills/egd-pripravenost/TEST.md` (autor: test-pripravenost)

**Namátka důkazů:**

- Zkouška zapsala seznam a položky → lab, `sitecatalogtest`, seznam `EGD-pripravenost`, položky 1 a 2 → ano. Položky jsou „Zkouska Test 22. 11. 2026 19:29:22“ a „…19:29:28“, vytvořené v 18:29Z. Dvě položky odpovídají tomu, že běh s `--ano` proběhl dvakrát a seznam se použil podruhé.
- `CLI_MIN_NODE_MAJOR` a `EON_SHAREPOINT_MAIL` → `scripts/pripravenost.mjs:21,22,259,383,562` → ano. Opravy jsou ve skriptu.
- `copilot skill list` a `chat.useAgentSkills` → `README.md:32-33` → ano. Řádek `copilot skill list ✅` je v README, důkaz je jen věta v TEST.md („z --help“), bez výpisu.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-pripravenost/TEST.md` | 3 | Test jako účastník, Node 22.23.5 + portable 18.20.8, CLI 12.0.0 + 11.11.0 | ⚠ | K portable Node 18 ani CLI 11 není soubor ani výpis. Vlož výstup, nebo napiš, že jde jen o slovo testera. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 5 | „Po opravách je skill připravený“ | ❌ | Rozpor s řádky 15-24. Verdikt platí pro verzi po opravách, ale test proběhl před nimi. Po poslední úpravě skriptu spusť znovu `nastroje` až `zprava` a vlož výstup. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 9 | `nastroje`, `npm`, `sit` správně na Node 22 i 18 | ⚠ | Chybí výstup. Po změně `sit` (ř. 21) neznovu otestováno. Vlož výpis. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 10 | `cli-instalace`, `prihlaseni`, `sharepoint` ✅ | ⚠ | Chybí výpis. Přihlášení je s `--tenant` labu, takže cesta přes appId/device code (ř. 79 SKILL.md) se netestovala. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 11 | `zkouska` plán (kód 10), `--ano`, idempotence | ✅ | Seznam a položky 1 a 2 v labu ověřeny. Kód 10 a „druhé spuštění seznam použije“ jsou jen tvrzení. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 12 | `spfx`, `prohlizec`, `maska`, `zapis`, `zprava` | ⚠ | Chybí výpis. `zprava` byla po úpravách změněna (ř. 18, 19, 22) a nevidím žádný vygenerovaný `pripravenost-*.md`. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 13 | Zkušební seznam v labu nemazán, položky 1 a 2 | ✅ | Ověřeno čtením z labu. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 17 | Node <20: instalace se nespustí, červená + věta pro IT | ⚠ | Bez výpisu a po 19:29. Ověř na portable Node 18 a vlož výstup. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 18-19 | Mail na sharepoint@eon.com, oddíl „Objednávky předem“ | ⚠ | Je v kódu (ř. 383, 562). Zda ho vyvolala `zprava` při reálném běhu, není doloženo. Obsah vychází z mailů 12. 11. a 18. 11. a v labu se ověřit nedá. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 20 | Červená licence Copilota → věta pro IT | ⚠ | Detekce licence je ručně (ř. 36). Vyzkoušej `zapis --klic copilot-licence --stav cervena` a pak `zprava`. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 21 | `sit` žlutá při proxy | ⚠ | Proxy se v labu nesimulovala. Ověř s `HTTPS_PROXY` na nedostupný port. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 23 | Copilot CLI zmíněn v doporučení | ⚠ | Doporučení (SKILL.md ř. 116) vychází z `nastroje`. Otestuj `zprava` na stroji s Copilot CLI. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 24 | `copilot skill list` ✅, `chat.useAgentSkills` 📘 | ⚠ | `chat.useAgentSkills` je 📘 a podle kánonu nesmí být základ postupu. Ověř ve VS Code, nebo přesuň do Neověřeno. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 26-32 | Windows / PS 5.1 jen statická kontrola | ⛔ | Napsáno správně jako „kód, ne běh“. Je to ale hlavní platforma účastníků a skill ji přesto prohlašuje za připravenou. Pro rozeslání potřebuješ aspoň jeden běh na Windows. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 36 | appId a device code v E.ON | ⛔ | Zapsáno s důvodem. Krok 5 SKILL.md je tím neotestovaný, `m365 login` skript nikdy nespustil. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 36 | `/skills reload`, VS Code `~/.copilot/skills`, Marketplace/proxy | ⛔ | Zapsáno s důvodem. Mohlo by se ověřit na vlastním VS Code, ale nezkoušelo se. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 49 | Copilot CLI, `gh` a `setup-git` z `--help` | ⚠ | Příkazy existují, ale `--help` jen ukazuje jejich dostupnost. K příkazu `github` je jen věta „ověřeno“, bez výpisu. | test-pripravenost |
| `skills/egd-pripravenost/TEST.md` | 50 | `--host` s neexistujícím hostem → žlutá | ⚠ | Dodatek je dopsán po 19:34, tedy po posledním doloženém běhu. | test-pripravenost |

**Riziko pro středu:**

1. **Vysoká:** skill se rozesílá v podobě, která po posledních úpravách (19:34-19:35) neproběhla celá znovu. Verdikt „připravený“ stojí na jediném doloženém běhu z 19:29 na macOS. Změny po něm mohou skript rozbít a nikdo to neví.
2. **Vysoká:** Windows a PowerShell 5.1 jsou jen kontrola kódu a účastníci jedou na Windows. Při chybě (cesty, cmd.exe, UTF-8) se kontrola ničeho nedočká a účastník skončí na červené hned u kroku 2.
3. **Střední:** krok 5 (appId a device code v E.ON) je neotestovaný a TEST.md ho sám označuje jako hlavní riziko. Bez přihlášení neproběhnou kroky 6 a 7 a zpráva je v E.ON jen červená.


<a id="skills-egd-pripravenost-references-github-md"></a>
### `skills/egd-pripravenost/references/github.md` (autor: test-pripravenost)

**Namátka důkazů:**

- `copilot login --host https://<…>.ghe.com` → řádek 49 → `copilot login --help` v labu: „--host <host> … data residency (e.g. https://example.ghe.com)“ → ano. Verze v labu je 1.0.112, soubor cituje 1.0.91 (nesedí, viz tabulka).
- `gh auth login --hostname`, `--web`, `--with-token` → řádek 55 → `gh auth login --help`: „--hostname“ i „--with-token“ ano. `--web` jsem v prvních 30 řádcích výpisu neviděl, ale v nápovědě je běžně (nedohledáno).
- `gh auth setup-git --hostname` → řádek 57 → `gh auth setup-git --help`: „use the `--hostname` flag to specify a single host“ → ano.
- Skript `node "<S>" github` → řádek 56 → `scripts/pripravenost.mjs:593` příkaz `github` existuje (gh auth status, jen čtení) → ano.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-pripravenost/references/github.md` | 3, 49–59 | ✅ položky: `copilot login --help`, `--host`, `gh auth login/status/setup-git`, příkaz `github` ve skriptu | ✅ (6) | Jen opravit verzi 1.0.91 na skutečnou (v labu 1.0.112), nebo uvést „ověřeno na 1.0.91“. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 49 | „v `/login` jde zvolit GitHub Enterprise Cloud with data residency“ | ⚠ (označeno 📘) | Ověř v labu v interaktivním `copilot` → `/login`, nebo škrtni. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 13–15 | Tabulka „jak poznat firemní GitHub“ (github.com s enterprise účtem / `*.ghe.com` / vlastní adresa = GHES) | ⚠ | Je to jen 📘/❓. Ověřit v labu nejde, protože EG.D nemáme. Přidej „⛔ jen EG.D, ověří Adriána/IT“ a příznak, jak to rozlišit (vlastní host se pozná z URL). | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 17 | „managed“ účet na github.com se pozná podle přípony firmy | ⚠ | Ověř v labu u EMU účtu (`egd01_egdlab`), nebo označ ⛔. Pozn.: 09 ř. 109 uvádí EMU na github.com s příponou shortcode. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 19 | `settings/copilot` ukáže licenci, menu „Your organizations/enterprises“ | ⚠ | Soubor sám říká „menu jsem živě neprošel“. Projdi na osobním účtu, nebo napiš proč ne. 09 ř. 76 žádá totéž ověření. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 23–25 | ITSM „my IT order“, schválení Richtera a vedoucího, vzor žádosti | ⛔ nevyslovené | Zdroj je mail Adriány (01-fakta ř. 72–73, „stav podání neznámý“). Připiš „⛔ jen E.ON, postup převzat z e-mailu 18. 11.“. Pozn.: 09 ř. 63 jmenuje „ITSM / ServiceNow“, tady chybí. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 31 | Free zahrnuje agent mode i Copilot CLI, omezený počet použití | ⚠ (📘) | 09 ř. 16 to má také jen 📘, ale 09 ř. 46 dává „✅📘“. Ověř v labu na čerstvém Free účtu (test 24. 11. večer už je naplánován), jinak sjednoť značku. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 31 | „Dostaneš-li firemní licenci, přepíše osobní plán“ | ⚠ | Jen 📘 (09 ř. 18). Ověřit nejde bez licence, označ ⛔ s důvodem. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 31 | Zda smí zaměstnanec založit účet na firemní e-mail | ⛔ ok | Správně přeneseno na nadřízeného. Přidej, že to potvrzuje Adriána (09 ř. 49). | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 38–44 | Nastavení VS Code pro GHE.com (`github-enterprise.uri`, `authProvider`) | ⚠ + ⛔ | Sám přiznává „neověřeno“ a „komunitní vlákno“. Ověřit nejde bez `*.ghe.com`, ale v labu je `ppfas.ghe.com` (viz ❌ níže), kde to jde zkusit. Jinak doplň „⛔ jen host EG.D“. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 50 | winget / npm instalace, PowerShell 6+ | ⚠ | `winget` a požadavek PS 6+ jen 📘. 09 ř. 19 má navíc „Node 22+“, tady chybí. Ověřit na Windows stroji, nebo napsat proč ne. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 51 | Skill do `%USERPROFILE%\.copilot\skills` | ✅ shoda | Odkazuje na README.md ř. 25–28, tam stojí stejně. Samotné načtení skillu Copilot CLI ale nikdo neověřil → ověř. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 58, 81 | Git Credential Manager / stará položka ve Správci pověření | ⚠ (❓) | Ověřit na Windows, nebo označit ⛔ „Windows stanice EG.D“. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 59 | „classic tokeny Copilot CLI nepodporuje“ | ⚠ (📘) | Dá se potvrdit v labu: `copilot login --help` říká „Classic personal access tokens (ghp_) are not supported“ → změň na ✅ s tímto důkazem. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 63–64 | Claude lokálně přes git/`gh` funguje i na `*.ghe.com` | ⚠ ❓ | Ověř v labu: `gh` je přihlášen k `ppfas.ghe.com`, tedy klon a push z Claude Code jdou vyzkoušet (jen čtení/klon). | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 64 | GitHub app pro Claude jen github.com; GHES jen Team/Enterprise; `*.ghe.com` nenalezeno | ⚠ 📘 | Skill nesmí stavět na 📘. Napiš „neověřeno, počítej s lokální cestou“ (už tak je), přidej odkaz na doc. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 69–70 | Rychlý test (klon, chat odpoví) | ⚠ | Postup nikdo nespustil na Windows. Projdi ho na labu (osobní Free účet) a zapiš výsledek. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 72 | `zapis --klic github-test` | ❌ (drobné) | Příkaz `zapis` existuje (`pripravenost.mjs:513`), ale klíč `github-test` není nikde ve skriptu ani v SKILL.md (SKILL.md používá `copilot-licence`). Sjednoť klíče, ať je souhrn zprávy přečte. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 3–5, 14–15 | Tři varianty hostu (github.com / GHE.com / GHES) | 🔀 | Cesty jsou popsané, ale chybí u každé „co chce IT E.ON“ a náročnost pro citizen developera. Doplň pro a proti. | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 29–31 vs 09 | Záloha = jen osobní účet + Free | 🔀 | 09 má varianty B (Free org + 10 seatů, 190 USD) a podmínku „nestačí-li Free, nabídnout B po Pavlově ano“. V souboru chybí informace, že Free se může vyčerpat (09 ř. 27, 47), a že EMU účet Free nesmí (09 ř. 16, 87). | test-pripravenost |
| `skills/egd-pripravenost/references/github.md` | 29 vs 09 ř. 46 | Termín zálohy: do úterý 24. 11. | ❌ | Soubor říká „pokud do úterý nemáš nic, záloha“, 09 ř. 45 to samé, ale v 09 ř. 47 se test zálohy dělá až večer 24. 11. Účastník tedy možná dostane zálohu bez předchozího ověření, že Free limity stačí. Uveď to v souboru, nebo posuň termín. | test-pripravenost |

**Riziko pro středu:**

1. Vysoké: Copilot Free má limity chatu a agenta (číslo creditů neznámé, 09 ř. 6 a 137) a soubor je neuvádí. Záloha tak může za pár hodin vyčerpat limit, účastníci to uvidí až na workshopu.
2. Vysoké: Hlavní cesta (firemní GitHub + licence přes ITSM) je celá ⛔ a neověřitelná. Adresu hostu ani stav podání neznáme (01-fakta ř. 73), takže `<GITHUB-ADRESA>` zůstane prázdná a krok 4 nepůjde dokončit.
3. Střední: Postupy pro Windows (winget, PowerShell 6+, Credential Manager, `.copilot\skills`) nebyly spuštěny na Windows. Zablokovaná instalace nebo chybějící `pwsh` zastaví `copilot` CLI u účastníků.


<a id="skills-egd-pripravenost-references-prihlaseni-md"></a>
### `skills/egd-pripravenost/references/prihlaseni.md` (autor: test-pripravenost)

**Namátka důkazů:**

- Tenant ID `b914a242-…` → OIDC endpoint `egd.cz` (curl dnes) → `issuer` vrací přesně toto ID → ano.
- `eonos.sharepoint.com` bez přihlášení HTTP 403 → curl dnes → 403 → ano. Ověřuje jen to, že host existuje. To, že je to E.ON, plyne z 01-fakta-workshopu.md:65.
- „AllSites.FullControl vyžadují `spo app add` / `deploy`, ✅ v labu“ (ř. 21) → `rg` přes projekt mimo `node_modules`, `zdroje/` a `prehled/` → pojem se vyskytuje jen v tomto souboru → ne. Důkaz chybí.
- 📘 ř. 9–11 (appId povinné, env `CLIMICROSOFT365_ENTRAAPPID`, výchozí `deviceCode`, `browser`, `m365 setup` se přihlásí jako Azure CLI) → `m365 login --help full` a `m365 setup --help full` → sedí. Měřeno na CLI 11.11.0, dokument cituje 12.0.0.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-pripravenost/references/prihlaseni.md` | 7, 8 | tenant ID, doména `egd.cz`, `eonos` odpovídá (403) | ✅ | Ověřeno dnes (curl). U 8 doplň „host existuje“, ne „je to E.ON“. | test-pripravenost |
| `skills/egd-pripravenost/references/prihlaseni.md` | 21 | `spo app add` / `deploy` vyžadují `AllSites.FullControl`, „✅ v labu“ | ⚠ | Dohledatelný důkaz chybí. Ověř v labu (appka s jen `AllSites.Write` nebo bez práv → `spo app add`) a zapiš výstup, nebo ✅ změň na 📘. Tohle je klíčové, protože z toho plyne text žádosti pro IT. | test-pripravenost |
| `skills/egd-pripravenost/references/prihlaseni.md` | 9–11 | appId povinné, `deviceCode` výchozí, `m365 setup` zakládá app | ⚠ | Dnešní `--help` to potvrzuje na 11.11.0. Připiš příkaz a verzi. Funkční `m365 login` s appId je v labu ověřený (03-lab.md:14), ale chybí odkaz. | test-pripravenost |
| `skills/egd-pripravenost/references/prihlaseni.md` | 12–14 | schválená appka v E.ON? uživatel smí registrovat? CA vs. device code? | ⚠ | ❓ bez pokusu. Ověřit v labu nejde. Napiš do „Neověřeno“ s důvodem „jen v tenantu E.ON“ a jak ověřit (Tomáš / IT, test `m365 login` z E.ON stroje v pondělí). | test-pripravenost |
| `skills/egd-pripravenost/references/prihlaseni.md` | 22–23 | nutné: Allow public client flows, souhlas správce, `User.Read` | ⚠ | Bez značky. Public client lab nepřímo potvrzuje (device code běží). Ověř čtením manifestu lab appky `12f19539-…` (`az ad app show`), nebo označ 📘. | test-pripravenost |
| `skills/egd-pripravenost/references/prihlaseni.md` | 23 | redirect URI `http://localhost` pro `--authType browser` | ⚠ | Je tam ❓. Zkus `m365 login --authType browser` v labu, nebo napiš proč nejde. | test-pripravenost |
| `skills/egd-pripravenost/references/prihlaseni.md` | 24 | `m365 setup` v E.ON „nejspíš skončí na právech“ | ⚠ | ❓ spekulace. Do „Neověřeno“ (jen E.ON). Rozumné je vynechat jako doporučení a nechat jako variantu. | test-pripravenost |
| `skills/egd-pripravenost/references/prihlaseni.md` | 28 | „tak to EG.D už jednou udělala“ (ruční nahrání .sppkg) | ⚠ | Zdroj neuveden. Rucne-v-prohlizeci.md:7 to samo značí ❓. Doplň zdroj (mail, schůzka) nebo napiš „podle Tomáše“. | test-pripravenost |
| `skills/egd-pripravenost/references/prihlaseni.md` | 38–44 | mapování chyb AADSTS65001/90094/90095, 7000218, 53003/50097 na věty pro IT | ⚠ | U vět chybí značky. 65001 ✅ v labu (08:44), ostatní kódy jen 📘 (SKILL.md:129–131). Označ to. Ověř 7000218 v labu (kopie lab appky s vypnutým public client). | test-pripravenost |
| `skills/egd-pripravenost/references/prihlaseni.md` | 18–24 vs. 26–28 | varianty 1–4 | 🔀 | Chybí pro a proti, co chce IT a náročnost pro citizen developera. Doplň sloupce (čas, kdo, riziko). U 1 a 2 chybí odhad čekání na IT. | test-pripravenost |
| `skills/egd-pripravenost/references/prihlaseni.md` | 26–28 | varianta „bez CLI / prohlížeč“ | 🔀 | Jediná variace, kterou lab ověřil (08:44–46, 116–121: UI app catalog, nahrání a nasazení 200). Odkaž na 08 a `lab-ucty-overeni.mjs`, uveď limit (ruční nahrání .sppkg, bez skriptování). Teď je označena jako poslední záchrana bez důkazu. | test-pripravenost |
| `skills/egd-pripravenost/references/prihlaseni.md` | 7–44 jako celek | MFA / Authenticator se nezmiňuje | ❌ | 08-ucty-ucastniku.md:34–42 označuje registraci Authenticatoru za blokér (3 ze 6 pokusů `egd01`). prihlaseni.md uvádí jen CA (53003/50097) a vůbec nezmiňuje obrazovku „Let's keep your account secure“. Doplň řádek „registrace MFA/Authenticatoru při prvním přihlášení“ a větu pro účastníka, nebo napiš, že v E.ON jde o jiný případ. | test-pripravenost |

**Riziko pro středu:**

1. Vysoké: appId a admin consent pro SharePoint a Graph v E.ON (ř. 12–23, 38–40) nejsou vyřešené ani ověřené. Podle 08:43–46 lab ukazuje, že bez consentu pro uživatele CLI nejede (AADSTS65001), takže bez schváleného appId zbude jen prohlížeč bez skriptů.
2. Střední: tvrzení o `AllSites.FullControl` (ř. 21) je označené ✅ bez důkazu. Pokud je nadsazené nebo chybí `Sites.*`, IT dostane špatnou žádost a Tomáš nic nenasadí.
3. Střední: chybí řádek o MFA/Authenticatoru (rozpor s 08). Účastník v E.ON se zasekne na registraci druhého faktoru a skill ho nevede, jak z toho ven (v labu se to dělo u poloviny pokusů).


<a id="skills-egd-pripravenost-references-windows-md"></a>
### `skills/egd-pripravenost/references/windows.md` (autor: test-pripravenost)

**Namátka důkazů:**

soubor žádné ✅ neobsahuje, ověřil jsem proto, co se o skriptu tvrdí):
- „skript volá `node <npm-cli.js>`" (ř. 12) → `scripts/pripravenost.mjs:71-74` → ano, nalezeno. Ověřeno jen čtením kódu na macOS.
- „skript volá `node <cli>/dist/index.js`" (ř. 12) → `pripravenost.mjs:82` → ano, nalezeno.
- „konzolový výstup bez diakritiky" (ř. 21) → `SKILL.md:43` (konzole záměrně ASCII) → ano. Že se na Windows opravdu nerozsype, nikdo neměřil.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-pripravenost/references/windows.md` | 3 | „Stav: na Windows neověřené ❓" | ✅ jako přiznání, ale globální | u každé sekce doplň značku (viz níže) | test-pripravenost |
| `skills/egd-pripravenost/references/windows.md` | 3 | „pasti, které jsme viděli u citizen developerů" | ⚠ | uveď zdroj a datum pozorování, nebo přepiš na „očekávané pasti z dokumentace" | test-pripravenost |
| `skills/egd-pripravenost/references/windows.md` | 8-9 | `npm`/`npx` jsou `.cmd`/`.ps1`, `Restricted` dá „running scripts is disabled" | ⚠ | označ 📘; ověř na Windows VM (`Get-ExecutionPolicy` + `npm -v`) nebo napiš „v labu není Windows" | test-pripravenost |
| `skills/egd-pripravenost/references/windows.md` | 10-11 | PS 5.1 kazí vnořené uvozovky; PS 7.3+ opravil jen `.exe` | ⚠ | má 📘 bez odkazu na zdroj. Doplň URL dokumentace, jinak označ ❓ | test-pripravenost |
| `skills/egd-pripravenost/references/windows.md` | 12-13 | skript volá `node` s polem argumentů, takže tyto problémy obchází | ⚠ | doplň „✅ kód (macOS), na Windows neběželo". Na macOS jde jen o důkaz, že skript to dělá, ne že na Windows funguje | test-pripravenost |
| `skills/egd-pripravenost/references/windows.md` | 17-25 | tabulka 7 pastí (BOM/UTF-16, cp1250, `$`, `2>&1`, `Select -First`, uvozovky, mezery) | ⚠ | přidej sloupec „stav" (📘/❓). Pro každou „obranu" napiš, zda ji skript opravdu realizuje (UTF-8 zápis, ASCII výstup), nebo je to rada pro agenta | test-pripravenost |
| `skills/egd-pripravenost/references/windows.md` | 24 | „české uvozovky „" ukončí řetězec" | ⚠ | v CLAUDE.md je to zažité na macOS/zsh (a platí tam). Pro PS 5.1 označ ❓ | test-pripravenost |
| `skills/egd-pripravenost/references/windows.md` | 27-31 | postup portable Node 22 bez admina (zip, `$env:Path`, `node -v`) | ⚠ | postup nikdo na Windows neprošel. Označ ❓ a doplň „projít na Windows VM nebo na stroji EG.D". Název zipu a cesta `node-v22.xx.x-win-x64` je ruční doplnění, riziko chyby pro začátečníka | test-pripravenost |
| `skills/egd-pripravenost/references/windows.md` | 31 | `code .` z okna s upraveným PATH; trvalá změna přes uživatelské proměnné bez admina | ⛔ | v labu nejde (žádný Windows stroj, EG.D může mít zamčené GPO). Napiš to výslovně a uveď „ověřit na notebooku EG.D" | test-pripravenost |
| `skills/egd-pripravenost/references/windows.md` | 33-39 | Git for Windows, PowerShell 7 portable, Node 24/26 | 🔀 | doporučení bez pro a proti. Chybí: co z toho bere IT E.ON (instalace bez admina, whitelist), náročnost pro citizen developera, a že Node 22 (ř. 29) a Node 24/26 (ř. 37) jsou dvě různé cesty. Jedno rozhodnutí „Node 22 vs 24/26" chybí | test-pripravenost |
| `skills/egd-pripravenost/references/windows.md` | 37 | složka `%USERPROFILE%\node` vs `node22` v ř. 29 | ⚠ | sjednoť cesty, jinak si agent splete portable instalace | test-pripravenost |
| `skills/egd-pripravenost/references/windows.md` | 34 | „V Claude Code pak bash místo PowerShellu" | ⚠ | neověřeno. Doplň ❓, nebo smaž (EG.D pracuje v Copilot CLI, viz `09-github-ucastnici.md:19`, PowerShell 6+) | test-pripravenost |

**Riziko pro středu:**

1. **Vysoká:** Postup portable Node 22 (ř. 27-31) nikdo na Windows nezkoušel. Pokud selže (PATH, název zipu, GPO), účastník nespustí SPFx a workshop se u něj zastaví hned na startu.
2. **Střední:** PS 5.1 vs PS 7. Pokud EG.D má jen 5.1 a Copilot CLI chce 6+, pasti i doporučení v souboru míří na špatné prostředí. Chybí rozhodnutí, co dělat.
3. **Střední:** Tvrzení „viděli jsme u citizen developerů" (ř. 3) může u příjemce vyvolat dojem, že jde o ověřené postupy. Při rozeslání v pondělí 12:00 doporučuji do souboru dopsat „Windows nezkoušeno, ověří se až u vás" a značky ❓ u jednotlivých sekcí (úprava dvou řádků, rizikové minimum).


<a id="skills-egd-prvni-appka-skill-md"></a>
### `skills/egd-prvni-appka/SKILL.md` (autor: skill-prvni-appka)

**Namátka důkazů:**

- „Web part má `requiresCustomScript: false`“ (ř. 31) → `templates/evidence/src/webparts/evidence/EvidenceWebPart.manifest.json:8` → ano. Běh bez Custom Scriptu je doložený v `04-integrace-test-plan.md:12` (✅ 6. 11.) a v `ppf-arcade/odpoved-adriane.md`. Weby bez Custom Scriptu jsou v 03-lab (`/sites/noscripttest`).
- „zadavatel/schvalovatel v UI“ (ř. 12, 135–136) → `test-dukazy/1…4-*.png` a `ui-test.mjs` existují (`ls`), popis v `TEST.md` (řádky 36–39 tabulky) → ano. Obsah PNG jsem neotevíral.
- „řazení `ID desc`“ (ř. 161+, upravy.md) → `EvidenceWebPart.ts:87` (`$orderby=ID desc&$top=…`) a `:35` (ApproveItems `0x10`) → ano.
- „403 u `spo app add` = role na webu“ (ř. 169) → `ppf-arcade/odpoved-adriane.md:63` → ano, ale jen odkaz mimo projekt. `TEST.md` roli Čtenář výslovně neměřil.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-prvni-appka/SKILL.md` | 12, 79, 99–137 | cesta A (novy, build, seznam, nasadit, over, UI pod zadavatelem a schvalovatelem) prošlá | ✅ | TEST.md má důkazy (rc, PNG, `ui-test.mjs`). Běželo ale jen na macOS, CLI 11.11, v roli Global Admin. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 31–32, 111, 124 | Custom Script nepotřeba, Article → sekce → web part → SingleWebPartAppPage, `npm ci` z lockfile | ✅ | TEST.md a 04-integrace-test-plan. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 127, 135–136, 161 | `?env=WebView`, role schvalovatele podle práva Schvalovat položky (Člen ne, Vlastník ano) | ✅ | TEST.md (Petra = Člen, Jakub = Vlastník). | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 36, 51 | skript „Node 18+“ | ❌ | Rozpor s `egd-pripravenost/SKILL.md:75`: CLI 11 i 12 chtějí Node 20+ ✅ a na Node 18 spadnou při startu. Skript tedy na 18 s CLI nepoběží. Oprav na 20+ (reálně 22+). | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 79, 93–94, 174 | Node „22.14+/24/26“ vs. věta pro IT „Node 24 nebo 26“ a portable 24/26 | ⚠ | Nejednotné s egd-pripravenost (doporučuje portable 22) a s 02-skills. Sjednoť. 22.14+ je 📘, v labu je 22.23.5 ✅. Zbytek ověř v labu, nebo napiš, že jde jen o 📘. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 56–58 | Windows PS 5.1: uvozovky, bez `2>&1`, execution policy | ⛔ | Důvod („v labu není Windows“) je v TEST.md a ř. 14, ale ne u tohoto řádku. Doplň ⛔ s důvodem a návrhem testu na Windows VM. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 79, 89–97 | E.ON: role Člen/Vlastník, katalog od IT, appId, proxy | ⛔ | OK pro lab, v E.ON ověřit v pondělí na AILab-Dev (TEST.md to má). Do SKILL.md přidej odkaz na tuto sekci. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 80, 99–107 | cesta A2: ruční nahrání v prohlížeči | 🔀 | `rucne-v-prohlizeci.md` je ❓ (z dokumentace, v labu neprojitá). Projdi v labu Playwrightem, nebo označ jako nevyzkoušenou. Chybí pro a proti proti A. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 81 | cesta B: seznam + formátování + Power Apps | 🔀 | V labu jen CLI část (seznam, formátování Stavu). Pohledy, Power Apps a Automate nejsou ověřené. Doplň pro a proti a náročnost pro citizen developera. Řádek 79–81 nemá sloupec „pro/proti“, jen „co dostane / co chce IT“. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 83 | „když A narazí, jdi na B“ (doporučení) | ⚠ | Staví na nevyzkoušené B. Doplň větu „B zatím jen částečně ověřená“, nebo B v labu projdi. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 126 | propagace web partu 20 s až 1 min ✅ | ⚠ | TEST.md: v obou bězích nenastala a čekací smyčka je ❓. Zdroj čísla je jen `ppf-arcade/odpoved-adriane.md:65`. Přepiš na „měřeno v jiném projektu“ s odkazem. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 158–159 | před buildem zvýšit verzi, jinak starý kód ❓ | ⚠ | TEST.md ověřil 1.0.0.1 → `upgrade`, ne to, že bez zvýšení zůstane stará verze. Ověř v labu (nasadit bez zvýšení), nebo nech ❓. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 169 | 403 = role na webu ✅ | ⚠ | Důkaz mimo projekt. Roli Čtenář TEST.md nemá (sekce Neověřeno). Odkaž na důkaz, nebo ověř s lab uživatelem v Návštěvnících. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 171 | AADSTS65001 = chybí souhlas správce | ⚠ | 📘 bez pokusu. Ověř v labu (appId bez souhlasu), nebo napiš proč nejde. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 173 | `Invalid column 'undefined'` / `Invalid section '1'` ✅ | ⚠ | Odpovídající řádek je jen v `references/chyby.md`, v TEST.md ne. Doplň odkaz na důkaz. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 175 | proxy: `SELF_SIGNED_CERT_IN_CHAIN`… | ⚠ | Nezkoušeno v labu. Je to chování npm/Node, ověř simulací (vlastní `NODE_EXTRA_CA_CERTS`), nebo označ 📘. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 177–178 | hlášky „Seznam … není“ a „nemáte právo“ v appce | ⚠ | Role Čtenář neotestována (TEST.md). Spusť `ui-test.mjs` pod lab uživatelem v Návštěvnících. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 179 | `{"error":…}` při rc 0 ✅ | ⚠ | Důkaz v TEST.md chybí. Doplň ukázku výstupu. | skill-prvni-appka |
| `skills/egd-prvni-appka/SKILL.md` | 115 | Heft, gulp od 1.24 neexistuje 📘 | ✅ | Funkčně potvrzeno buildem (Heft). Znění „neexistuje“ je dokumentace, v pořádku. | skill-prvni-appka |

**Riziko pro středu:**

1. Vysoká: Na AILab-Dev nemusí mít účastník roli Člen/Vlastník ani katalog aplikací. Skill pak spadne na A2 nebo B, které nejsou v labu ověřené, a první appka neproběhne.
2. Vysoká: Windows, PowerShell 5.1 a Node 18 na stanicích EG.D. Celý skill je měřený jen na macOS s Node 22 a CLI 11.11. Chybná hodnota „Node 18+“ vede přímo k pádu.
3. Střední: Na čerstvě založeném katalogu nebo webu může vyjít propagace web partu a „katalog neexistuje“. Čekací smyčka ani to nebyly v labu prověřeny, na workshopu to vypadá jako chyba skriptu.


<a id="skills-egd-prvni-appka-readme-md"></a>
### `skills/egd-prvni-appka/README.md` (autor: skill-prvni-appka)

**Namátka důkazů:**

- „Šablona je SPFx 1.24.1 a vyžaduje Node 22.14+/24/26“ → templates/evidence/package.json:6 (`engines`) a :16 (`sp-core-library 1.24.1`) → ano
- „`requiresCustomScript: false`“ (SKILL.md:31) → templates/evidence/src/webparts/evidence/EvidenceWebPart.manifest.json:8 → ano. Samotný příznak sedí. Tvrzení, že běží na webu se zablokovaným Custom Scriptem, tam důkaz nemá.
- „Řazení `ID desc` a `$top=200`“ (TEST.md) → EvidenceWebPart.ts:87 a :36 (`MAX_POLOZEK = 200`) → ano. Existují i test-dukazy/ui-test.mjs a PNG 1–4 a templates/stav-format.json.
- „S Členem `spo app add` prošlo, se Čtenářem ne“ (chyby.md:9) → žádný důkazní soubor ani výstup, jen věta → ne

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-prvni-appka/README.md` | 5–9, 14–23, 81 | Tři cesty A / A2 / B, obsah složky, SPFx 1.24.1, CLI 11.11, ověřeno v testovacím tenantu | ✅ | Jde o souhrn; důkaz je v TEST.md a test-dukazy/. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | 9 | Cesta B „bez kódu“: seznam s formátováním a Power Apps formulář | ⚠ | TEST.md říká, že v labu je změřená jen CLI část (`seznam`, formátování Stavu). Pohledy, ruční formátování a Power Apps v prohlížeči neověřeny. Ověř v labu přes Playwright, nebo napiš, proč to nejde. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | 8, 80 | Cesta A2: ruční nahrání `.sppkg` v prohlížeči | ⚠ | TEST.md: „klikací cesta z dokumentace, v labu neprojitá“. Projdi ji v labu (např. eva.vesela jako Člen na druhém webu) a doplň české popisky. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | 44, 46 | Copilot čte `.github\skills` v projektu, `.claude\skills` a `~\.agents\skills` | ⚠ | Je to jen 📘. Ověř aspoň `copilot skill list` s nainstalovaným skillem na macOS. `~/.copilot/skills` ověřeno není. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | 55 | VS Code Copilot: `/` v režimu Agent skill nabídne | ⚠ | 📘 bez pokusu. Zkus ve VS Code v labu, nebo označ jako neověřené s návodem. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | 56 | Copilot CLI: `/skills list` a `/skills reload` | ⚠ | Sourozenecký skill `egd-pripravenost` měl `copilot skill list` ✅ a `/skills reload` označený jako nezkoušený. Sjednoť příkazy mezi README. Spusť `copilot skill list` a vyzkoušej `/skills reload`. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | 71 | Node.js 22.14+, 24 nebo 26 (portable zip stačí) | ⚠ | Požadavek odpovídá `engines` v šabloně. Že „portable zip stačí“ na Windows, je neověřené (TEST.md: Windows nezkoušen). Ověř na Windows VM nebo to označ ❓. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | 72–74 | Pro A „role Člen nebo Vlastník“, katalog aplikací jen na webu | ⚠ | `chyby.md:12–15` přiznává: „nejnižší potřebnou roli jsme neměřili“. Dokumentace uvádí správce kolekce webů. Nasazení v TEST.md běželo pod Global Adminem. Ověř v labu `spo app add` pod uživatelem s rolí Člen a výsledek zapiš. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | 73 | CLI přihlášené přes appId od IT | ⛔ | OK jako ⛔: appId, souhlas správce a proxy jdou ověřit jen v E.ON. SKILL.md to jako ❓ uvádí a odkazuje na `egd-pripravenost`. Doplň tentýž důvod i do README. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | 82–83 | Windows a E.ON neověřeno | ✅ | Poctivě uvedeno s důvodem. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | 5–12 | Tři varianty A / A2 / B | 🔀 | Pro a proti, nároky na IT a obtížnost jsou ve SKILL.md:77–81 a v README jen ve zkrácené tabulce. Neuvedené alternativy: Power Automate a Container App (SPFx jako jediná kódová cesta). Doplň do README odkaz na rozhodovací tabulku a krátké „proč ne Power Apps / Power Automate“. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | 63–64, 77 | Agent ukáže plán před zápisem, zapisuje jen na váš web, při chybějících věcech napíše větu pro ServiceNow | ✅ | Chování je ve skriptu (rc 10 bez `--ano`, `sitecollection` pevně) a odpovídá TEST.md. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | SKILL.md 126 vs TEST.md | Čekání na propagaci web partu „měřeno 20 s až 1 min ✅“ | ❌ | TEST.md říká, že propagace „v tomto běhu nenastala“ a čekací smyčka je ❓. Rozpor mezi SKILL.md:126 a chyby.md:25 (✅, bez důkazu) na jedné straně a TEST.md na druhé. Najdi důkaz, nebo ✅ změň na ❓. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | SKILL.md 31–32, 169 | „Běží i na webu se zablokovaným Custom Scriptem ✅“ | ❌ | V TEST.md ani v labu není záznam o testu na webu s `DenyAddAndCustomize`. `rg` nenašel nic než samotné tvrzení. Ověř v labu, nebo odstraň ✅. U EG.D je to kritické. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | chyby.md 9 vs TEST.md 75 | Čtenář neprošel, Člen prošel (5.–6. 11.) vs „Čtenář netestován“ | ⚠ | Nesoulad mezi dokumenty a chybí důkaz. Dohledej výstup z 5.–6. 11. a odkaž na něj. | skill-prvni-appka |
| `skills/egd-prvni-appka/README.md` | SKILL.md 159 | Bez zvýšení verze web může ukazovat starý kód | ⚠ | Je to ❓ „pozorováno u jiné appky“. V labu je upgrade na 1.0.0.1 ✅. Chybí test, zda bez zvýšení verze zůstane stará verze. Proveď měření, nebo nech ❓. | skill-prvni-appka |

**Riziko pro středu:**

1. Role Člen na webu AILab-Dev nemusí stačit pro `spo app add` do katalogu a nejnižší potřebná role není změřena, takže účastníci narazí na 403 a skript je pošle na cestu B. Hodnocení: vysoké.
2. SKILL.md se opírá o ✅ „běží i s blokovaným Custom Scriptem“ bez důkazu a v E.ON může být Custom Script zablokovaný, takže web part by se nemusel zobrazit. Hodnocení: střední až vysoké.
3. Cesty A2 a B v prohlížeči nebyly v labu projity, takže při selhání A nemá záložní cesta ověřené kroky. Hodnocení: vysoké.


<a id="skills-egd-prvni-appka-test-md"></a>
### `skills/egd-prvni-appka/TEST.md` (autor: skill-prvni-appka)

**Namátka důkazů:**

- Položka 2 „Stav Schváleno, Komentar ‚Schvaleno v UI testu‘“ (TEST.md:33) → živé `m365 spo listitem list` na webu egd-test-prvni-appka → nalezeno ano. Nalezena i položka 3 z druhého běhu, o které TEST.md nemluví.
- „nová verze 1.0.0.1/1.0.0.2, katalog `Deployed=true`“ (TEST.md:27, 55) → `m365 spo app list` → verze 1.0.0.2, `Deployed: true` → ano. Verze 1.0.0.1 už z labu nedoložím, je přepsaná.
- „šablona řadí `ID desc`, `$top=200`“ (TEST.md:53–55) → `templates/evidence/src/webparts/evidence/EvidenceWebPart.ts:87` (`$orderby=ID desc&$top=${MAX_POLOZEK}`) → ano. Důkaz je i ve snímcích: 1-zadavatel-start.png až 4-schvalovatel-hotovo.png existují. Zachycený síťový požadavek ale uložený není.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-prvni-appka/TEST.md` | TEST 19–33 | cesta, novy, build, seznam, nasadit, over, REST, UI zadavatel/schvalovatel (13 řádků) | ✅ | doplň do test-dukazy uložený výstup (`nasadit.out`, `build.log`, rc) | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | TEST 26, 74; SKILL 125–126, 172; chyby.md 26 | propagace web partu: TEST říká „nenastala, ❓ neprověřená“, SKILL tvrdí „✅ měřeno 20 s až 1 min“ | ❌ | sjednoť. Buď dohledej a ulož původní měření (jiný běh?), nebo ✅ ve SKILL a chyby.md sniž na ❓ | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | TEST 75 vs chyby.md 8–10 | TEST: roli Čtenář netestováno. chyby.md: „Čtenář zápis neprošel, Člen prošel ✅“ | ❌ | najdi důkaz měření z chyby.md, nebo oprav jeden z dokumentů; přidej test Čtenáře | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | SKILL 79, 106 | cesta A „stačí role Člen/Vlastník“. Nasazení v testu běželo jako Global Admin | ⚠ | ověř `nasadit --ano` pod uživatelem s rolí Člen (m365 login pod jeho účtem) | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | SKILL 6, 32 | „Custom Script nepřepínej, web part běží i na webu se zablokovaným Custom Scriptem ✅“ | ⚠ | TEST to nezmiňuje. Ověř na webu s `DenyAddAndCustomizePages`, nebo označ ❓ | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | SKILL 20–21 | „skript jiný cíl neumí“ (jen jeden web, nikdy tenant katalog) | ⚠ | negativní test: `--appCatalogScope tenant` a cizí `--web`. Ověř, že skript odmítne | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | SKILL 169–179 | chybová tabulka: `Invalid column/section`, `Katalog neexistuje`, `{"error"}` s rc 0 (označené ✅), AADSTS, SELF_SIGNED, execution policy | ⚠ | TEST je neprochází (u 3 řádků ✅ bez odkazu na TEST). Odkaž na důkaz, nebo vyvolej v labu (smazaný katalog, rozbitá stránka) | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | SKILL 177–178 | hlášky „Seznam … není“ a „nemáte právo (403)“ v appce | ⚠ | v TEST nepokryto (Čtenář i chybějící seznam). Vyvolej v UI testu | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | SKILL 157–159, upravy.md | vibecoding úpravy a „bez zvýšení verze může zůstat stará verze ❓“ | ⚠ | upravy.md: projdi aspoň jednu úpravu end-to-end. Verzi ověř: nasadit bez zvýšení verze, sleduj `CanUpgrade` | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | SKILL 161–163 | schvalovatel = právo Schvalovat položky, „Členové ne ✅“ | ⚠ | role Člen vs Vlastník je v UI testu, ale samotné oprávnění `ApproveItems` ne. Přidej do `ui-test.mjs` výpis `EffectiveBasePermissions` | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | SKILL 71–73 | `cesta` s reálným výsledkem prereq | ⚠ | spusť po skutečném `egd-pripravenost`, ne po syntetickém `vysledky.json` | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | TEST 69; SKILL 56–58, 174 | Windows, PowerShell 5.1, dlouhé cesty, portable Node | ⛔ | OK, je to výslovně zapsané s důvodem a návrhem ověření | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | TEST 70 | tenant E.ON: role, katalog, appId, proxy/npm | ⛔ | OK, výslovně napsáno | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | TEST 76 | CLI 12 netestováno | ⛔ | OK napsáno. Spusť `--cli` s CLI 12 v labu, je to levné a lab to umí | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | SKILL 80, 81; TEST 71–73 | cesty A2 a B nepoužily žádný test v prohlížeči. SKILL přitom doporučuje B jako záložní. U B chybí pro/proti A vs B a co chce IT | 🔀 | projdi A2 a B v labu (Playwright pod profilem). Doplň srovnání variant (ověřeno / pro / proti / IT / náročnost) | skill-prvni-appka |
| `skills/egd-prvni-appka/TEST.md` | SKILL 75–82 | A (CLI) vs A2 (ruční) vs B jsou popsané. Power Automate/Power Apps/Container App jako další varianta chybí | 🔀 | doplň, co je ověřeno u každé varianty. Nevítězné varianty ponech | skill-prvni-appka |

**Riziko pro středu:**

1. **Vysoké:** `nasadit` nebyl nikdy spuštěn pod rolí Člen ani pod EG.D účtem. Test běžel jako Global Admin a o Čtenáři se TEST a chyby.md rozcházejí. Pokud účastníci na AILab-Dev nemají plnou roli, `spo app add` spadne na 403 a cesta A nefunguje.
2. **Vysoké:** celá cesta A je ověřená jen na macOS. Windows PowerShell 5.1, portable Node a dlouhé cesty v `node_modules` (stovky MB) vzniknou poprvé až na workshopu u účastníků.
3. **Střední:** čekací smyčka na propagaci web partu (12 × 15 s) se nikdy nespustila, přesto je ve SKILL označená ✅. Na čerstvém webu E.ON může první `nasadit` selhat nebo se zbytečně protáhnout.


<a id="skills-egd-prvni-appka-references-bez-kodu-md"></a>
### `skills/egd-prvni-appka/references/bez-kodu.md` (autor: skill-prvni-appka)

**Namátka důkazů:**

- Založení seznamu přes CLI `seznam` ✅ (ř. 7, 13-14) → TEST.md:24 „`seznam`: plán → `--ano` → seznam + sloupce + formátování Stavu, čtení zpět ✅“, kód `scripts/appka.mjs:226-272` → ano (soubor existuje, řádek nalezen).
- Formátování Stavu přes CLI ✅ (ř. 7) → `appka.mjs:266` (`spo field set --CustomFormatter`) + `templates/stav-format.json` existuje → ano. Důkaz je ale jen „čtení zpět“ ve skriptu, ne screenshot barevného štítku (v `test-dukazy/` žádný snímek seznamu).
- Stejné interní názvy sloupců u A a B (ř. 59) → `appka.mjs:230` (Name="Komentar") + `EvidenceWebPart.ts:87` (`Popis,Stav,Komentar`) → ano, sedí.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-prvni-appka/references/bez-kodu.md` | 7, 13-14, 19 | CLI `seznam` založí seznam, sloupce, formátování | ✅ | ověřeno v TEST.md:24; zbývá jen test pod uživatelem s rolí Člen (viz ř. 5) | skill-prvni-appka |
| `skills/egd-prvni-appka/references/bez-kodu.md` | 59 | A převezme seznam beze změny (stejné interní názvy) | ✅ | OK (kód A i skriptu sedí); nezkoušeno jako celý přechod B→A, ale jde o shodu názvů | skill-prvni-appka |
| `skills/egd-prvni-appka/references/bez-kodu.md` | 5, 56-59 | Stačí role **Člen** na nějakém webu | ⚠ | TEST.md:31 měřil appku s Členem Petra, ale `seznam` (založení seznamu) běželo jako vlastník; ověř v labu `seznam --ano` pod Členem, nebo napiš, že nezkoušeno | skill-prvni-appka |
| `skills/egd-prvni-appka/references/bez-kodu.md` | 11-17 | „CLI jde (přihlášení OK)“ jako větev u E.ON | ⛔ | v E.ON jde o přihlášení CLI / appId; napsat výslovně „jen v E.ON, lab to nepokryje“ (TEST.md:65 to pro A uvádí, tady chybí) | skill-prvni-appka |
| `skills/egd-prvni-appka/references/bez-kodu.md` | 22-29 | Pohledy „Moje požadavky“ (Created By = [Me]) a „Ke schválení“ (Stav = Nový), uložení zobrazení | ⚠ | ❓ jen v hlavičce; projdi v labu Playwrightem pod Členem (TEST.md:72 to samo uvádí jako neověřené). Označ i u kroků, ne jen v úvodu | skill-prvni-appka |
| `skills/egd-prvni-appka/references/bez-kodu.md` | 24-29 | České popisky (Uložit zobrazení jako, Filtrovat podle) | ⚠ | ověř v labu přesné české názvy; ve skriptu jsou jen odhad | skill-prvni-appka |
| `skills/egd-prvni-appka/references/bez-kodu.md` | 33-34 | `?env=WebView` na seznamu ❓ (na stránkách ✅) | ⚠ | ověř `Lists/Pozadavky/AllItems.aspx?env=WebView` v labu (TEST.md:73 „neměřeno“); jinak je to rozumně označeno | skill-prvni-appka |
| `skills/egd-prvni-appka/references/bez-kodu.md` | 20-21 | „Nový“ = formulář zadavatele, Stav barevný štítek, Created By | ⚠ | stav ✅/❓ chybí; barevný štítek v prohlížeči nepotvrzen snímkem → ověř a ulož screenshot do test-dukazy/ | skill-prvni-appka |
| `skills/egd-prvni-appka/references/bez-kodu.md` | 36-45 | Power Apps „Přizpůsobit formuláře“, publikace do SharePointu, úprava barev | 🔀 | popis jen jedné cesty (Customize forms), chybí varianty a pro/proti (Power Apps vs. Column/Form formatting JSON vs. A) a co chce IT E.ON (prostředí, licence, DLP); doplň tabulku variant s náročností pro citizen developera | skill-prvni-appka |
| `skills/egd-prvni-appka/references/bez-kodu.md` | 47-48 | Licence Power Apps nad SP ve standardním konektoru v M365 E3/E5 📘 | ⚠ | 📘 jen mezistav; v labu je druhý tenant s „Power Apps“ (03-lab.md:17) – zkus otevřít Studio a zapsat výsledek, jinak označ ⛔ „jen v E.ON“ | skill-prvni-appka |
| `skills/egd-prvni-appka/references/bez-kodu.md` | 50-54 | Power Automate: šablona schválení + konektor Approvals, ❓ v E.ON | 🔀 | rozpor/nesoulad: sondy/napojeni.md:85 měřilo Approvals jako Standard ✅ API, ale zde ❓ bez odkazu; doplň odkaz na sondu a u varianty „Flow ze seznamu“ uveď pro/proti a požadavky na IT | skill-prvni-appka |
| `skills/egd-prvni-appka/references/bez-kodu.md` | 44 | EG.D barvy `#1200E0` / `#261B62` | ❌ | SKILL.md:155 má stejné hodnoty (shoda), ale nikde není zdroj (01-fakta, brand); doplň odkaz na zdroj barev, nebo označ ❓ | skill-prvni-appka |

**Riziko pro středu:**

1. Cesta B v prohlížeči (pohledy, formátování, Power Apps/Flow) je celá neprojitá v labu, a to je záložní cesta, když A selže (katalog/role v E.ON) – vysoké.
2. Hlavička tvrdí „potřeba je jen role Člen“, ale založení seznamu skriptem nebylo zkoušeno pod Členem a CLI v E.ON může scházet přihlášení/appId – střední.
3. Power Apps / Power Automate v E.ON (licence, prostředí, DLP) nejsou ověřitelné v labu a text je na workshopu nabízí jako „volitelné“ – střední.


<a id="skills-egd-prvni-appka-references-chyby-md"></a>
### `skills/egd-prvni-appka/references/chyby.md` (autor: skill-prvni-appka)

**Namátka důkazů:**

✅ tvrzení):
- Build šablony na Node 22.23 ✅ → skills/egd-prvni-appka/TEST.md:6 (Node 22.23.5) → ano. Je to ale jen zmínka prostředí, ne výpis buildu.
- „upgrade“ při nové verzi → TEST.md:27 a :54 (1.0.0.1 a 1.0.0.2, `Deployed=true`) → ano. To dokládá, že skript upgrade dělá. Netvrdí to „stránka běžela starým kódem“.
- Čtenář `High 688 / Low 138612833` → rg v skills/, lab/, prehled/, egd-vibecoding → nalezeno jen v chyby.md:9 a SKILL.md. Žádný zdroj (výstup, soubor) není. Celé tvrzení je ❌/⚠ (viz tabulka).

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-prvni-appka/references/chyby.md` | 8-9 | Čtenář nemůže `spo app add`, Člen může; ✅ | ❌ | TEST.md:75 říká „testován jen Člen a Vlastník“ a pro roli Čtenář „přidat lab uživatele do Návštěvníků a spustit“. To odporuje ✅ v chyby.md. Buď dohledej důkaz z 5.-6. 11. (výstup, `High 688 / Low 138612833`), nebo test zopakuj a ulož výstup do skills/egd-prvni-appka/test-dukazy/. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 10-11 | `E_ACCESSDENIED` i pod Global Adminem u Graph Command Line Tools (appId bez práv na SharePoint) ✅ | ⚠ | V projektu není důkaz (rg `Graph Command Line` vrací jen tento řádek). Přilož výstup, nebo odkaz na sondu. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 11-13 | Rozlišení „otevře `<web>/AppCatalog` a nahraje soubor = problém je appId“ | ⚠ | Postup není označen ani ověřen. Projdi ho v labu, nebo označ jako 📘. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 14-15 | Nejnižší role pro katalog neměřena, 📘 správce kolekce; v větě pro IT „Člen nebo Vlastník“ | ⚠ | Je to přiznaný mezistav a doporučení stojí na 📘. Změř Člena i Vlastníka (Člen prošel podle ř. 9), nebo napiš, že jde jen o hypotézu. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 19-22 | Význam AADSTS 65001 / 700016 / 7000218 / 53003 / 50097 | ⚠ | Bez značky. Ověřený je jen 65001, v egd-maily/SKILL.md:32 (✅ u Graph consent). Pro ostatní zapiš 📘 nebo vyvolej v labu; 53003/50097 jsou ⛔ (E.ON Conditional Access). | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 19-22 | 53003/50097 = Conditional Access, 7000218 = chybí public client flows | ⛔ | Reálně jen v E.ON. Napiš to výslovně, s důvodem. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 26-27 | `There is no available WebPart` hned po install, za 20 s až 1 min ✅ | ❌ | TEST.md:26 říká, že propagace „v tomto běhu nenastala“ a čekací smyčka je „❓ neprověřená“ (TEST.md:74 totéž). Rozpor s ✅. Najdi původní měření (mimo TEST.md), nebo změň na ❓. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 27-28 | Skript zkouší 12× po 15 s | ⚠ | Konstanta v appka.mjs:32 (15 s) existuje. Počet pokusů neověřen a není to tvrzení z měření. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 28-29 | Čerstvý katalog: první minuta „neexistuje“ ✅ (22. 11.) | ⚠ | Hláška `neexistuje` je i v SKILL.md:170, ale důkaz o jedné minutě chybí. Do TEST.md se nedostal. Doplň výstup z `site appcatalog add`. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 32-35 | `page add` → `clientsidewebpart add` padá na `Invalid column/section` ✅; jediné funkční pořadí Article → sekce → web part → layout + publish | ⚠ | Chybové hlášky jsou jen v SKILL.md/chyby.md, výstup chybí. „Jediné funkční pořadí“ je silné tvrzení bez důkazu, že jiné neexistují (např. SPA stránka přes šablonu). Doložit výstupem, případně 🔀 jiná cesta stránky. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 35-36 | Rozbitou stránku smaže uživatel v prohlížeči, `nasadit --ano` ji založí znovu | ⚠ | Postup nebyl v TEST.md zachycen. Proveď v labu (smazání, nový deploy). | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 39-42 | Bez `spo app upgrade` běží starý kód (`digi-podnety`; `CanUpgrade: false` + `Deployed: true`) ✅ jinde, ❓ tady | ⚠ | Poctivě značené ❓ „tady“, zdroj je egd-vibecoding/README.md:41 (jiný projekt). Kánon vyžaduje lab: nasaď verzi N, přepiš `--overwrite` + `deploy` bez upgrade, zapiš `CanUpgrade`. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 46-48 | SPFx 1.24.x: Node `>=22.14 <23`, 24, 26 📘; gulp od 1.24 není 📘 | ⚠ | Konzistentní s 02-skills-a-kit.md:15 a :32. Je to ale jen 📘. Ověř `npm ci` / build pod Node 20 a pod 22.14 (egd-pripravenost/TEST.md má portable Node 18.20.8, viz důkaz tam). | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 48 | „Build šablony na Node 22.23 ✅“ | ✅ | Viz namátka: potvrzeno TEST.md:6. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 49 | Portable Node (zip) jde bez admina | ⚠ | Bez značky; egd-pripravenost/TEST.md zmiňuje portable Node 18, ne 22+. Ověř zip pro Node 22/24. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 52-54 | CLI vrací `{"error":...}` na stdout a rc=0 ✅ | ⚠ | Chybí výstup důkazu. Přilož příkaz a rc. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 52-54 | „Nikdy ne přes rouru“ | ✅ | Je to v souladu s globálním pravidlem, jde o proceduru, ne o měření. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 57-58 | Web s LCID 1029 vrací chyby česky ✅ | ⚠ | LCID 1029 je v tools/lab_ucty_lib.py:30 jako konfigurace, ale důkaz hlášky česky je jen v SKILL.md. Přilož výstup. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 60-66 | Windows ❓ (délka cest, ENAMETOOLONG/EPERM, `%USERPROFILE%\egd`) | ⛔ | Řádek 60 přiznává „neměřeno“. Chybí důvod, proč nejde v labu (stroj s Windows). Napiš „⛔ lab má jen macOS“ a navrhni ověření (Windows VM / stroj účastníka). `C:\egd\` bez admina je spekulace. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/chyby.md` | 6-66 | Soubor popisuje jedinou cestu pro 403 (role na webu) | 🔀 | Podle CLAUDE.md u variant uveď pro a proti a požadavky na IT: oprava role / nový katalog / cesta A2 / B (ruční v prohlížeči, rucne-v-prohlizeci.md). V souboru jsou jen odkazy bez srovnání. | skill-prvni-appka |

**Riziko pro středu:**

1. Propagace web partu (ř. 26-28): skript čeká 12× po 15 s (~3 min) podle měření, které TEST.md nepotvrdil. Pokud je propagace u více účastníků dlouhá, deploy skončí neúspěchem a lidé budou čekat. Hodnocení: střední.
2. Čtenář vs. Člen (ř. 8-9, 14-15): tvrzení „Čtenář neprojde, Člen ano“ je rozporné a nejnižší potřebná role neověřena. Věta pro IT s „Člen nebo Vlastník“ může být nesprávná. Hodnocení: vysoké.
3. Windows / délka cest a Node 22+ (ř. 46-66): EG.D pracuje na Windows s Node 18, a to je právě nezměřené. `npm ci` může spadnout na ENAMETOOLONG a build pod Node 18 selže. Hodnocení: vysoké.


<a id="skills-egd-prvni-appka-references-rucne-v-prohlizeci-md"></a>
### `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` (autor: skill-prvni-appka)

**Namátka důkazů:**

- `?env=WebView` schová rám (ř. 61) → TEST.md:30 a test-dukazy/1-zadavatel-start.png (soubor existuje) → ano, ale změřeno jen na stránce SingleWebPartAppPage (`evidence.aspx`), ne na stránce Article z kroku 5. Obecné „na jakékoli stránce“ tedy nemá důkaz.
- Název balíčku `prvni-appka-client-side-solution` (ř. 52) → templates/evidence/config/package-solution.json:4 → ano. Titulek web partu „Evidence požadavků“ je v manifestu ř. 14 → ano.
- Vnitřní název `Komentar` s popiskem „Komentář schvalovatele“ (ř. 33) → scripts/appka.mjs:230 (`Name="Komentar"`, `DisplayName="Komentář schvalovatele"`) → ano. Důkaz platí jen pro CLI cestu, ne pro to, že UI z názvu „Komentar“ vyrobí vnitřní název `Komentar`.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 3–5 | Kdy cesta A2 platí (npm jde, CLI se nepřihlásí kvůli appId / AADSTS65001 / CA, uživatel je Člen/Vlastník) | ✅ | AADSTS65001 je změřeno v 08-ucty-ucastniku.md:44. Podmínka „Člen stačí k nahrání“ platí jen pro lab, kde je web ručně nastavený. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 7–9 | Celý postup je „z dokumentace MS a z toho, co EG.D udělala ručně“ (❓) | ⚠ | Projít v labu Playwrightem pod účastnickým profilem (např. egd01) a doplnit přesné české popisky. TEST.md:71 to už navrhuje a nic z toho není hotové. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 14–18 | `novy` a `build` vyrobí `sharepoint\solution\prvni-appka.sppkg` | ✅ | TEST.md:25 má měření pro `nasadit`. Cestu `prvni-appka\sharepoint\solution\...` zkontroluj v labu při tomtéž průchodu (jen krátká poznámka). | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 22 | Nový → Seznam → Prázdný seznam; název `Pozadavky` | ⚠ | Projít v UI a zapsat české popisky. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 25–27 | Název bez diakritiky při zakládání → vnitřní název, který appka čte; popisek později | ⚠ | Ověřit v labu, že UI z „Komentar“ udělá `Komentar` a po přejmenování se vnitřní název nezmění (důkaz je jen pro CLI, appka.mjs:228–230). | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 29–33 | Typy a nastavení sloupců, Stav s volbami a výchozí „Nový“; přejmenování Komentar | ⚠ | Projít v UI. Ruční výsledek musí odpovídat tomu, co appka čte (`Popis`, `Stav`, `Komentar`). | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 35–37 | Formátování sloupce Stav: Nastavení sloupce → Formátovat → Upřesnit režim → vložit `templates/stav-format.json` | ⚠ | Ověřit v UI (popisky, vložení JSON). Soubor existuje, formátování přes CLI je změřeno (TEST.md:72). | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 41–42 | `<web>/AppCatalog` otevře knihovnu; neotevře = web nemá katalog | ⚠ | Ověřit v labu na webu bez katalogu a s katalogem. 08-ucty-ucastniku.md:66 `/AppCatalog` používá, ale chování bez katalogu nikdo neměřil. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 43–44 | Nahrát `.sppkg`, dialog Povolit/Nasadit, nezaškrtávat „zpřístupnit všem webům“ | ⚠ | Upload a Deploy v UI app catalogu je změřený (08:117 → 200, Deployed true), ale popisky tlačítek a dialogu ne. Doplnit z labu. Tvrzení o „zaškrtnutí platí jen pro tenhle web“ ověřit nebo vypustit. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 45–46 | Chyba „Přístup odepřen“ = chybí role na webu | ⚠ | SKILL.md:169 má ✅ pro CLI (`spo app add`). Pro UI ověřit pod uživatelem s rolí Čtenář (TEST.md:74 to eviduje jako neověřené). | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 49–52 | Obsah webu → Nový → Aplikace → najít `...-client-side-solution` → Přidat; propagace „minutu“ | ❌ | Rozpor: `package-solution.json` má `skipFeatureDeployment: true` a TEST.md:73 říká, že web part šel vložit hned po deploy. Ověřit, zda je krok 4 vůbec potřeba. Pokud ne, odstranit ho a ono „počkej minutu“ nahradit měřením. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 54–59 | Nová stránka (šablona Prázdná), Celá šířka, vložit „Evidence pozadavku“, Publikovat | 🔀 | Název web partu je v manifestu „Evidence požadavků“ (s diakritikou), v textu je „pozadavku“ → opravit nebo ověřit. Doplnit variantu: CLI `spo page` + SingleWebPartAppPage (TEST.md:25 ✅) s pro/proti a náročností pro citizen developera. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 60 | `SingleWebPartAppPage` v prohlížeči založit nejde ❓ | ⚠ | Ověřit v labu (UI nabídka „Aplikační stránka“ / Single Part App Page), nebo napsat, že je to jen o CLI. SKILL.md ji dělá přes CLI. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 61–62 | `?env=WebView` schová rám na jakékoli stránce ✅ | ⚠ | ✅ je u tvrzení přehnané: TEST.md:30 měřil jen app page; zobrazení seznamu je „neměřeno“ (TEST.md:73). Přeformulovat na „na app page ✅, na běžné stránce Article ❓“, nebo změřit. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 64–67 | Ověření: Nový požadavek → Moje → Ke schválení | ✅ | ui-test.mjs + snímky 1–4 v test-dukazy/ (zadavatel i schvalovatel) → platí pro app page, ne pro ruční cestu A2. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 69–73 | Nová verze: zvýšit verzi, build, Nahrát (přepsat), Nasadit, na webu Podrobnosti → Získat/Aktualizovat | ⚠ | ❓ je v textu. Ověřit v labu (TEST.md:36 – o nové verzi rozhoduje katalog ✅ jen pro `nasadit upgrade`). Doplnit, zda Update v UI je potřeba při `skipFeatureDeployment`. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/rucne-v-prohlizeci.md` | 5, 9 | Conditional Access / appId v E.ON, EG.D už jednou ručně něco nahrála | ⛔ | OK jen s odkazem: jak je to v tenantu E.ON, nejde v labu ověřit (TEST.md:71 „jen v tenantu E.ON“). Napsat to výslovně i sem, ať text neslibuje jistotu. | skill-prvni-appka |

**Riziko pro středu:**

1. Krok 4 (přidat appku) je zřejmě zbytečný nebo se v UI jmenuje jinak: účastník se zasekne a čeká „minutu“ na něco, co nepřijde. Vysoké.
2. Soubor je ❓ celý a nikdo ho v labu neprošel: popisky tlačítek a dialogů nemusí sedět a jediná záchrana je snímek obrazovky od účastníka. Vysoké (na CLI selže přihlášení pod E.ON, takže tato cesta je pravděpodobná).
3. Ruční založení sloupců: chybný vnitřní název nebo typ (zejména `Komentar`) rozbije čtení v appce bez srozumitelné chyby. Střední.


<a id="skills-egd-prvni-appka-references-upravy-md"></a>
### `skills/egd-prvni-appka/references/upravy.md` (autor: skill-prvni-appka)

**Namátka důkazů:**

- ř. 54–56 „řazení Created nad 6000 položkami → 500, proto ID desc“ → sondy/data-prava.md ř. 80–96, skills/egd-data-seznamy/SKILL.md ř. 37–48, TEST.md ř. 51–54 (`Created desc` → 500, `ID desc` → 200, `m365 request`) → ano. Šablona opravdu řadí `$orderby=ID desc` (EvidenceWebPart.ts ř. 87).
- ř. 3–10, 30–36 „názvy souborů a funkcí (EvidenceWebPart.ts, `_nacti`, `_formular`, `_zapis`, `_tabulka`, `_akce`, `tridaStavu`, `IPolozka`, `el()`, `$indigo/$inkoust/$plocha`, `requiresCustomScript:false`)“ → templates/evidence/src/webparts/evidence/* → ano, vše existuje. Cesta je ve skutečnosti `templates/evidence/` (v dokumentu `prvni-appka\` = výsledek `novy`).
- ř. 17–19 „texty přes `el()` / textContent“ → EvidenceWebPart.ts ř. 200+ (komentář a funkce `el`) → ano.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-prvni-appka/references/upravy.md` | 54–56, 3–10, 17–19 | Index/řazení `ID desc` (✅), struktura souborů šablony, `el()` místo innerHTML | ✅ (3) | bez zásahu; ✅ u 55 je doloženo, ale odkaz na důkaz v textu chybí, doplnit odkaz na TEST.md ř. 51–54 | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 45–46 | Appka pozná schvalovatele podle práva „Schvalovat položky“ | ❌ | Rozpor s sondy/data-prava.md ř. 64, 78 (pro UI stačí bit `CancelCheckout`, kit `SpSource.can()`). Šablona (ř. 35, 84–85) testuje ApproveItems (0x10). Ujasni, který bit je správně, a sjednoť skill, šablonu i sondu. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 45–47 | „Kdo smí seznam upravovat, změní Stav i v seznamu“ | ⚠ | Nikde v labu nezměřeno (SKILL.md ř. 161 to jen tvrdí). Ověř v labu pod účtem Člen: PATCH na Stav přímo přes REST/UI. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 47–50 | Silnější varianty: oprávnění na úrovni položky přes Power Automate, Content approval | ⚠ | Jen 📘, ale zároveň 🔀 (viz níže). Ověř v labu, nebo napiš „neověřeno, proč“; u Content approval ověř, že SPFx čte `_ModerationStatus` a že ho Člen nepřepíše. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 47–50 | Varianty „opravdového schvalování“ chybí pro a proti | 🔀 | Doplň tabulku: ReadSecurity/WriteSecurity (✅ v sondy/data-prava.md ř. 78), item ACL přes PA/Container App (potřebuje `ManagePermissions`), Content approval, Azure SQL + app role (✅ v sondy/data-prava.md ř. 13). U každé: co je ověřeno, co chce IT E.ON, náročnost pro citizen developera. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 27–29 | Nový sloupec: „+ Přidat sloupec → Datum, název bez diakritiky, pak přejmenovat“ | ⚠ | Postup z UI v labu neprojit (chybí v TEST.md). Ověř, nebo napiš „nezkoušeno“. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 28–29 | Alternativa: doplnit do `FIELDS` v `scripts/appka.mjs` a spustit `seznam` | 🔀 | `FIELDS` existuje (ř. 227), ale přidání pole (např. Date) nikdo nezkusil. Ověř v labu a u obou cest (UI/skript) uveď pro a proti. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 30–33 | Přidání `Termin` do `IPolozka`, `$select`, formuláře, těla `_zapis`, `_tabulka` | ⚠ | Postup není v labu proveden (TEST.md má jen build bez změny). Projdi celý cyklus „přidej sloupec Termín“ až do prohlížeče. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 36–37 | Nový stav „V řešení“ (volba ve sloupci, konstanta, tlačítko, `tridaStavu`, SCSS) | ⚠ | Neprojito. Ověř. Pozor: `FIELDS`/`STAV_FORMAT` v `appka.mjs` (ř. 227–240) mají fixní trojici voleb a barvy, takže skript `seznam` by nový stav neznal; doplň do postupu. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 41–42 | Nadpis jde změnit bez buildu: Upravit → tužka → „Nadpis appky“ (stránka bez `?env=WebView`) | ⚠ | Pole `nadpis` v property pane existuje (ts ř. 198), ale úpravu na stránce v labu nikdo neprošel (TEST.md ji nemá). Ověř a zapiš, že klik změní nadpis a že se uloží. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 20–21 | React 18.3.1 přesně, jiná verze selže potichu za běhu 📘 | ⚠ | Jen 📘 a bez zdroje; zdroje/chocholous-net.md ř. 72 zmiňuje pin React 18.3.1 jako ❓. Ověř v labu (nasaď appku s Reactem 19), nebo napiš „neověřeno“. Pozor, šablona má v `package.json` `@fluentui/react ^8` (React nevyžaduje, jen peer), ale nikdy se nepoužívá. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 14, 12–16 | Jedna změna → build → plán → „ano“ → `--ano` → ověření v prohlížeči | ⚠ | Postup ve skillu je ✅ v TEST.md (ř. 27, 55), ale cyklus „změna kódu → build → nasazení“ se nikdy neprošel s vlastní úpravou kódu. Navrhni test: jedna reálná úprava kódu až do prohlížeče. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 13, 16 | „Verzi zvyšuj před každým nasazením“; ID neměň (nová ID = nová appka) | ⚠ | SKILL.md ř. 158–159 to označuje ❓ („pozorováno u jiné appky“). V labu změřit: nasadit stejnou verzi bez zvýšení. Zdůvodnění „nová ID = nová appka“ neověřeno. | skill-prvni-appka |
| `skills/egd-prvni-appka/references/upravy.md` | 60–62 | Při chybě buildu: čti build.log, oprav první `TS####`, po třech pokusech vrať poslední funkční verzi (git nebo kopie) | ⚠ | `build.log` skript píše (appka.mjs ř. 215), ale chybová větev a návrat verze nikdy nezkoušeny. Ověř záměrně rozbitým kódem. Pozor: `git` není v seznamu požadavků skillu, „kopie“ není nikde popsaná. | skill-prvni-appka |

**Riziko pro středu:**

1. Role schvalovatele (ř. 45–46): rozpor ApproveItems vs. CancelCheckout. Pokud Člen EG.D právo nemá ve stejném tvaru jako v labu, záložka „Ke schválení“ se ukáže jen vlastníkovi (nebo nikomu); vysoké.
2. První úprava (ř. 30–37) je neprojitá celým cyklem změna kódu → build → nasazení → prohlížeč. Pokud se na workshopu rozbije build nebo se zapomene zvýšit verze, účastníci uvíznou a uvidí starý kód; vysoké.
3. Změna nadpisu „bez buildu“ přes tužku (ř. 41–42) nikdy neověřena. Je to nejlákavější první úprava pro neprogramátora; střední.


<a id="skills-egd-data-seznamy-skill-md"></a>
### `skills/egd-data-seznamy/SKILL.md` (autor: miniskilly)

**Namátka důkazů:**

- Tabulka limitů (500 u `$top=5001`, neindexovaný filtr/orderby, 200 u indexovaného, stránkování 6×1000 za 1,6 s) → `sondy/data-prava/threshold.jsonl` (25 řádků, existuje; admin i zadavatel1) → ano
- `$batch` po 100, 36 položek/s → `sondy/data-prava.md:82` → ano (v textu, bez samostatného logu; `bulk.jsonl` existuje)
- „`$orderby=Created desc` → 500 ✅“ → `skills/egd-prvni-appka/TEST.md:51-53` (`m365 request`, jen čtení) → ano, ale jen jako věta v TEST.md; `threshold.jsonl` ani `data-prava.md` řádek s `Created` neobsahují. Samostatný výstup chybí.

Důkaz pro tabulku tedy drží, kromě řádku s `Created` (ten stojí jen na textu v TEST.md).

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-data-seznamy/SKILL.md` | 31–40 | Tabulka dotazů nad 6000 položkami (`$top=5000` OK, `5001` 500, neindexovaný filtr a orderby 500, indexovaný OK, >5000 výsledků 500, stránkování 6 stránek) | ✅ | Bez akce. Důkaz: `threshold.jsonl`. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 24–28 | „Limit 5000 není jen zobrazení, padají i REST dotazy z appky, vlastník i uživatel“ | ✅ | Bez akce. `threshold.jsonl` obsahuje admina i `zadavatel1`. Dotazy šly skriptem `tools/data-prava-sp.py`, ne z nasazené appky. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 37, 47 | `$orderby=Created desc&$top=200` → 500, `Created` ani `Modified` nejsou indexované | ⚠ | `Created` je podložené jen větou v `skills/egd-prvni-appka/TEST.md:51`. `Modified` v labu nikdo neměřil, ale skill ho uvádí s ✅. Změř `Created` i `Modified` a ulož výstup do `sondy/`, nebo `Modified` označ ❓. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 36 | „`ID desc` je stejné pořadí jako nejnovější první“ | ⚠ | `TEST.md:52` ověřuje jen to, že `ID desc` vrátí 200 položek (HTTP 200). Pořadí se neměřilo. Je to logicky jasné, ale ověř to na dvou položkách. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 98–100 | Filtr `AuthorId eq …` nad 5000 položkami, index na Author | ⚠ | Skill to označuje ❓, ale ukázkový kód (ř. 95) takový filtr používá. Vlastní vzorový příklad tedy nad 5000 položkami nemusí projít. Zkus `AuthorId` na seznamu se 6000 položkami. Zdroj `EvidenceWebPart.ts` v `sondy/miniskilly/prvni-appka` obchází problém okénkem `ID gt <odId>`, které skill v textu nezmiňuje. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 71–87 | Kód `_ctiVse` (stránkování, `nextLink`, `ID desc`) | ⚠ | Kód je v `sondy/miniskilly/prvni-appka/src/.../EvidenceWebPart.ts:67-77` a build proběhl (`build.log`). Na 6000 položkách ho ale nikdo nespustil. Naměřené stránkování bylo skriptem, ne appkou. Nasaď appku, otevři ji nad 6000 položkami a ulož snímek nebo síťový záznam. Kód ve skillu se od kódu v šabloně liší (okénko `ID gt`), sjednoť je. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 61–65 | `m365 spo field set … --Indexed true` a kontrola `spo field get` → `"Indexed": true` | ⚠ | V labu neproběhl žádný pokus. `indexy-fill.jsonl` má 0 řádků a `indexy-setup.jsonl` obsahuje jen přidání sloupců. V `tools/miniskilly-indexy.py` je cesta `--via cli`, ale bez výstupu. `m365 spo field set --help` (CLI 11.11) volbu `--Indexed` neuvádí, jen REMARKS „specify properties by their names“. Spusť příkaz na zkušebním seznamu a `spo field get`, výsledek ulož. Bez toho je to postup jen „na syntaxi“. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 56–59 | Postup v prohlížeči (Nastavení seznamu → Indexované sloupce) | ⚠ | V labu neprošel jako klikací cesta. Index se zakládal přes REST. Projdi UI, nebo ověř text menu. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 111–116 | Zápis `POST /items`, úprava `MERGE` s `IF-MATCH: *` | ✅ | Doloženo v `data-prava.md` (oddíl „Editace z SPFx“) a v UI testu `test-dukazy/ui-test.mjs` (odeslání a schválení). Dokument je ale kvůli rozporu níže u ř. 111 označen jako ❌, viz další řádek. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 114 | „Už je v šabloně (`_zapis`)… ✅“ vs. `data-prava.md:104`: kit používá `fetch` a vlastní digest, ne `SPHttpClient` | ❌ | Vyjasni rozpor: skill předpokládá `spHttpClient` a šablonu `egd-prvni-appka`, `data-prava.md` doporučuje kit s `fetch`. Zapiš, který postup platí pro EG.D. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 115–116 | `$batch` po 100 v changesetu, 36 položek/s (✅) | ⚠ | Číslo je z `data-prava.md:82` a `bulk.jsonl`. Skill ho ale uvádí u zápisu „z appky“ a `$batch` z SPFx appky nikdo nezkoušel. Napiš, že to byl skript, nebo ověř z appky. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 118–124 | Postup „Ověření“ (build → nasazení → změna stavu → kontrola indexů → důkaz limitu) | ⚠ | Kroky 1–2 odpovídají UI testu ✅. Kroky 3 a 4 (index, limit po založení indexu) v labu neproběhly. Chybí měření „po založení indexu projde“ po přidání indexu na velkém seznamu. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 19–22, 11 | Kdy seznam nestačí a kdy navrhnout databázi (Azure SQL za API) | 🔀 | Odkazuje na `sondy/data-prava.md` část C a `10-container-app.md`. Chybí pro a proti, nároky na IT E.ON a náročnost pro citizen developera. Cenu a závislost na IT shrnuj tabulkou variant, nebo odkaž přímo na řádek v `10-container-app.md:31`. Dataverse je v `description`, ale v těle skillu se nikde nesrovnává. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 17, 54, 99 | 30 milionů položek, přidání indexu nad 5000 často selže, 12 lookupů ve view | ⛔ | 📘 značeno správně. 30 milionů a 12 lookupů nejde rozumně změřit. „Index selže nad prahem“ ověřitelné je: `data-prava.md:96` přiznává ❓ neměřeno. Změř na seznamu se 6000 položkami (admin, `spo field set`), nebo napiš proč nejde. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 126–134 | Čtenář nemůže zapisovat ani zakládat indexy (403); věta pro IT o roli Vlastník | ⚠ | 403 pro Čtenáře není v souboru doložen jako měření. Index (`ManageLists`) vyžaduje u E.ON Vlastníka nebo Správce webu: doplň odkaz na `egd-prava-role`, nebo změř pod čtenářem. | miniskilly |
| `skills/egd-data-seznamy/SKILL.md` | 76–101 | Kód `_popisChyby` | ✅ | Regex a hláška jsou ve vzorku `EvidenceWebPart.ts:94-95`. Text chyby v tělu odpovědi (česky: „mezní hodnotu zobrazení“) potvrzuje `threshold.jsonl`. | miniskilly |

**Riziko pro středu:**

1. Příkaz `m365 spo field set … --Indexed true` nikdo v labu nespustil a `--help` volbu neuvádí; když na workshopu selže, účastníci nezaloží indexy a appka přeroste práh — vysoké.
2. Vzorový filtr `AuthorId eq` (a řazení bez okénka `ID gt`) nad 5000 položkami nemusí projít, kód ve skillu se liší od kódu v šabloně, který je skutečně nasazený — střední.
3. Rozpor mezi skillem (`spHttpClient`/`_zapis` v šabloně) a `data-prava.md` (kit s `fetch`) zmate agenta, který čte oba dokumenty — střední.


<a id="skills-egd-dokumenty-skill-md"></a>
### `skills/egd-dokumenty/SKILL.md` (autor: miniskilly)

**Namátka důkazů:**

- Hlavní bundle web partu 15 KB a lazy chunky (ř. 67–68) → `sondy/dokumenty/spfx/egd-dokumenty/release/assets/dokumenty-generator-web-part_*.js` má 14 714 B a `chunk.lib-*` jsou zvlášť → ano.
- 11,5 MB docx převedený přes Graph (ř. 96) → `sondy/dokumenty/out-big/obri.docx` má 11 549 992 B a existuje `obri.pdf` → ano.
- jsPDF s výchozím fontem rozbije češtinu, „PYehled“ (ř. 24) → `sondy/dokumenty/out/pdf-jspdf-default.pdf` obsahuje „PYehled revizí rozvado“ → ano.
- Dodatečně: verze balíčků (ř. 19–24) jsou přesně v `spfx/egd-dokumenty/package.json` → ano. `webpack-patch.json` i `node-builtins.js` (ř. 117–136) se shodují se soubory v `config/` → ano.
- Neprokázáno: tvrzení „`Files.Read` samotné → 403“ (ř. 97). V `sondy/dokumenty/*.mjs`, `*.json` ani v `tools/` jsem nenašel log ani skript s 403 (rg „Files.Read“, „403“). Pokus mohl proběhnout jednorázově v příkazové řádce bez uloženého výstupu.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-dokumenty/SKILL.md` | 12, 17–24 | verze balíčků, web part se 6 tlačítky, Word/Excel/PPT/PDF s češtinou, soubory přes soffice | ✅ | Souhrnně. Důkazy: `package.json`, `out*/`, `out-spo/`, `sondy/dokumenty.md`. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 29–45 | `_ulozDokument` a uložení do knihovny ✅ | ⚠ | V labu prošel jen kód z web partu (`_save`, ř. 52–59 v `.ts`). Snippet ve skillu je přepsaný: bere `getbytitle('Dokumenty')` a `slozka` jinak než web part. Zkopíruj ho 1:1 z web partu, nebo ho znovu proženi v labu. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 47 | knihovna může být `Documents` / `Shared Documents` | ⚠ | Je to 📘 bez značky. Ověř v labu na webu s anglickým jazykem, nebo označ jako ❓ a napiš, jak zjistit URL (`rootFolder`). | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 49–65 | Word ✅ | ⚠ | Snippet je zjednodušený (jen 3 sloupce, `bunka`), v web partu je jiný kód. Znovu ho proženi, nebo nahraď výpisem z web partu. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 70–71 | „zkopíruj větev `_run` ze sondového web partu“ | 🔀 | Excel, PPT a šablona nejsou ve skillu přímo. Agent bez přístupu k `sondy/` je nezíská. Vlož kód do skillu (`references/`), nebo napiš, že je vždy dostupná složka `sondy/`. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 73–94 | PDF z Wordu přes Graph, 85 206 B z `MSGraphClientV3` | ✅ | Kód odpovídá web partu (ř. 115–119). Důkaz je v `sondy/dokumenty.md` (sonda 3). | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 96 | Převede i Excel a PowerPoint (1–2 s) | ✅ | `out-graph/*.pdf` pro xlsx a pptx existují. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 96 | docx 11,5 MB prošel; dokumentace uvádí limit 2 MB | ✅ | Obě čísla jsou v `dokumenty.md`. Limit pro xlsx/pptx je ověřený jen jako 📘, uveď to ve skillu. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 97 | `Files.Read` samotné → 403 ✅ | ⚠ | Chybí důkaz (soubor, log, příkaz). Zopakuj pokus s appkou `...-filesread` a ulož výstup do `sondy/dokumenty/`. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 97–98 | Bez schválení chyba `AADSTS65001` | ⚠ | Není změřeno, v labu už je schváleno. `AADSTS65001` je 📘 podle `sondy/data-prava.md:127`. Označ 📘, nebo ověř tak, že odeberou grant na jiném, nepoužívaném webu/appce. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 98, 146–148 | schválení `Files.Read.All` v tenantu (cesta v admin centru, Global Admin) | ⛔ | Skill to píše jako ❓ „nezkoušeli jsme“ a lab ho měl uděleno. Doplň, jak ověřit: na čerstvém webu s novým `.sppkg` a bez grantu. Důvod, že to v labu nejde, je `sondy/dokumenty.md`: 403 na seznam žádostí. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 100–110 | PDF s pdf-lib a fontem ✅ | ⚠ | Snippet je zkrácený, bajty fontu se stahují z `assets/Roboto-Regular.ttf` (web part ř. 102). Doplň, odkud se font bere a jak ho nahrát. Ověř, že font v knihovně opravdu je (`sonda/assets/`). | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 112–136 | webpack patch pro `node:fs`/`node:https` ✅ | ✅ | Soubory sedí, build prošel (`release/assets/chunk.lib-pptx_*.js`). Chybí `empty.js` obsah ve skillu, je tam (ř. 119), takže v pořádku. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 138–142 | postup Ověření (3 kroky) | ⚠ | Kroky 1–2 jsou ruční, ve skillu není záznam, že je prošel člověk bez agenta (na Windows, desktop Office). Ověř v labu pod účtem `petra.novakova` a ulož screenshot. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 141 | SharePoint Office soubor přepíše a zvětší ✅ | ✅ | `dokumenty.md` past 4: 10 KB → 17 KB. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 9–10 | Cílový uživatel „začátečník na Windows“, nepotřebuje Azure ani Premium | 🔀 | Skill uvádí jen cestu A. Varianty B (Power Automate Premium) a C (server) jsou v `sondy/dokumenty.md`, ve skillu jen jedna věta (ř. 150). Doplň krátkou tabulku pro a proti, co chce IT a náročnost, nebo odkaz na `dokumenty.md` jako povinné čtení. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 149 | Firemní font E.ON jen jako TTF s licencí ❓ | ⚠ | Je to ❓. Označ jako neověřené s důvodem „font E.ON v labu není“, nebo to ověř s fontem Roboto/Carlito a licencí pro vkládání. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 150 | Power Automate Word Online je Premium 📘 | ⚠ | 📘, v labu se ověřit nedá (jen Standard). Přesuň do „Neověřeno“ a napiš důvod. | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 152–155 | Věta pro IT (ServiceNow) | ⚠ | Cesta „SharePoint admin centrum → Advanced → API access“ je z dokumentace. Neprošla v labu; ověř cestu v UI labového tenantu (čtení). | miniskilly |
| `skills/egd-dokumenty/SKILL.md` | 159 | Zdroje | ✅ | Soubory existují. | miniskilly |

**Riziko pro středu:**

1. Vysoké: schválení `Files.Read.All` nikdo nezkusil. Pokud ho IT E.ON na workshopu neschválí, nefunguje věrné PDF z Wordu, a fallback na pdf-lib je ve skillu jen krátká ukázka.
2. Střední: snippety ve skillu (`_ulozDokument`, `_word`) nejsou stejné jako kód, který v labu prošel, takže agent může narazit na chybu, kterou web part v labu neměl. Uložení do knihovny je navíc závislé na názvu knihovny a složce.
3. Střední: tvrzení, že `Files.Read` samotné vrací 403, nemá žádný uložený důkaz. Špatné rozhodnutí o rozsahu oprávnění by IT mohlo zbytečně zdržet nebo naopak vyžádat příliš široké oprávnění.


<a id="skills-egd-externi-api-skill-md"></a>
### `skills/egd-externi-api/SKILL.md` (autor: miniskilly)

**Namátka důkazů:**

- ARES a Open-Meteo CORS `*` i s Authorization → `sondy/napojeni/cors-vysledek.json` (ok:true, status 200 v simple i withAuthHeader) a `sondy/napojeni.md:31-32` → ano.
- ČNB a OTE bez CORS → `cors-vysledek.json` (Failed to fetch u obou URL ČNB i u OTE) a `sondy/napojeni.md:34-36` → ano. Živý curl na `api.cnb.cz` s hlavičkou Origin vrátil odpověď bez `Access-Control-Allow-Origin`, takže to sedí.
- ČNB staženo z Jobu → `sondy/napojeni.md:46-60` (Job Succeeded, mail s přílohou doručen, cron ověřen) a existuje `tools/napojeni-report-job.py` → ano.
- Pozor: sonda běžela v headless Chromiu s origin podstrčeným přes `route.fulfill` (`pavelchocholousgmail.sharepoint.com`, viz `sondy/napojeni.md:22-27`). Skill to uvádí jako „změřeno z originu SharePointu“. Skutečný web part v SPFx to nebyl.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-externi-api/SKILL.md` | 15-23 | Tabulka ARES, Open-Meteo, ČNB, OTE funguje nebo nefunguje z appky | ✅ | Doplň větu, že jde o simulovaný origin v headless Chromiu, ne o reálný SPFx web part. | miniskilly |
| `skills/egd-externi-api/SKILL.md` | 23 | „libovolná webová stránka (scraping HTML): prakticky nikdy“ | ⚠ | Změřen byl jen OTE a `example.com` (`napojeni.md:36-37`). Zobecnění je rozumné, ale není změřené. Přeformuluj na „OTE, example.com ❌ změřeno; obecně očekávej totéž“. | miniskilly |
| `skills/egd-externi-api/SKILL.md` | 27-28 | `curl.exe -s -D - -o NUL -H "Origin: https://eonos.sharepoint.com" …` jako postup pro začátečníka na Windows | ⚠ | Postup nikdo neprošel na Windows (lab je macOS, Windows `curl.exe` s `-o NUL` neověřen). Ověř ho na Windows, nebo napiš, že byl spuštěn jen na macOS s `/dev/null`. | miniskilly |
| `skills/egd-externi-api/SKILL.md` | 28, 33 | Hlavička `access-control-allow-origin` v odpovědi na GET s Origin stačí jako rozhodnutí „půjde to“ | ⚠ | Změřeno prohlížečem, ne curlem. U ARES s `Authorization` je rozhodující preflight. Ověř, že curl-test a prohlížečová sonda dávají stejný výsledek na všech 5 zdrojích (u ARES i OPTIONS). | miniskilly |
| `skills/egd-externi-api/SKILL.md` | 28, 33 | Origin `https://eonos.sharepoint.com` | ⚠ | Je to hádaný origin. Tenant E.ON je v `01-fakta-workshopu.md:65` uveden, ale reálný web (`eonos.sharepoint.com/sites/AILab-Dev…`) je bez ověření. Servery s allowlistem originů by mohly odpovědět jinak. Napiš „doplň origin svého webu“. | miniskilly |
| `skills/egd-externi-api/SKILL.md` | 40-52 | TS kód `context.httpClient.get(..., HttpClient.configurations.v1)` označený ✅ | ❌ | Značka ✅ nemá důkaz. V projektu není web part, který by tenhle kód zkompiloval a spustil (v `skills/egd-prvni-appka/templates/evidence/` je jen `spHttpClient` na SharePoint). Sonda volala čistý `fetch`. Nasaď minimální web part v labu, načti ARES a odkaz na důkaz zapiš. Do té doby 📘. Pozor: `@microsoft/sp-http` šablona nepřidá do dependencies (`sondy/dokumenty.md:85`), skill o tom mlčí. | miniskilly |
| `skills/egd-externi-api/SKILL.md` | 55-57 | `httpClient` pro cizí servery, `spHttpClient` pro SharePoint; klíč v kódu není tajný | ⚠ | Doku-znalost bez značky. Ověř v labu spolu s krokem 2a (např. že `spHttpClient` pošle SharePoint hlavičky na ARES a ten to odmítne, nebo ne). | miniskilly |
| `skills/egd-externi-api/SKILL.md` | 63-66 | Tabulka cest: Power Automate 📘 Premium, Container Apps Job ✅ | 🔀 | Chybí pro a proti, náročnost pro citizen developera a cena Jobu. Chybí varianty A (CORS API přímo z prohlížeče, v kroku 2a) a „ruční data do seznamu“, které jsou v `sondy/napojeni.md:117-128` srovnány. Doplň sloupce, nebo odkaz na tabulku v `sondy/napojeni.md:117`. | miniskilly |
| `skills/egd-externi-api/SKILL.md` | 65 | HTTP akce je Premium | ❌ | V `sondy/napojeni.md:87` stojí „v ppf-rooms labu přesto doběhla pod E5“ a `04-integrace-test-plan.md:18` tvrdí ✅ `tier: Premium` z API tenantu. Skill uvádí jen 📘. Sjednoť odkaz na ✅ měření tieru a zmiň, že akce v labu doběhla. Rozpor v ověření: jednou „Premium (měřeno)“, jednou „📘“. | miniskilly |
| `skills/egd-externi-api/SKILL.md` | 66, 70-71 | Job: ČNB staženo ✅; zápis Jobu do SP seznamu ❓; Sites.Selected od IT | ⚠ | Doporučený „nejjednodušší vzor“ (řádky 68-69) stojí na neměřeném zápisu. Přitom `sondy/napojeni.md:46-60` je Job → mail. Ověř v labu zápis z Jobu do seznamu (MI + Sites.Selected), nebo vzor přestaň označovat za „nejjednodušší“. | miniskilly |
| `skills/egd-externi-api/SKILL.md` | 85-86 | Proxy/Zscaler a CSP tenantu ❓ | ⚠ | Nezměřeno, výslovně uvedeno jako ❓ a „v labu se neprojevila“. Napiš, že to jde ověřit jen v E.ON (⛔) a jak (první `curl.exe`/fetch z počítače uživatele na pilotním webu). | miniskilly |
| `skills/egd-externi-api/SKILL.md` | 88-91 | Věta pro IT (licence Premium, Container Apps Job s identitou) | ⚠ | Opírá se o neměřený zápis do seznamu a o Premium 📘. Až po ověření dvou položek výše. | miniskilly |

**Riziko pro středu:**

1. (vysoké) Kód v kroku 2a nebyl nikdy sestaven a spuštěn v SPFx web partu. Když chybí `@microsoft/sp-http` v dependencies nebo jiný detail, účastník se zasekne hned na prvním příkladu s ARES.
2. (střední) Windows `curl.exe` test CORS s hádaným originem není na Windows ověřen. Když nefunguje, pravidlo „nejdřív zkontroluj CORS“ nebude mít na workshopu použitelný nástroj.
3. (střední) Doporučený vzor „Job zapisuje do seznamu“ a věta pro IT stojí na neověřeném zápisu a na licenčním tvrzení 📘. IT může odpovědět, že identitu s `Sites.Selected` nedají, a skill nemá jinou ověřenou cestu pro zdroje bez CORS.


<a id="skills-egd-llm-gateway-skill-md"></a>
### `skills/egd-llm-gateway/SKILL.md` (autor: miniskilly)

**Namátka důkazů:**

- 429 „vyčerpána (69/60)“ → `sondy/ms-llm/chyby-gateway.md` ř. 11–13 → ano
- CORS preflight pro `https://pavelchocholousgmail.sharepoint.com` → `sondy/ms-llm/chyby-gateway.md` ř. 16–18 → ano
- `webApiPermissionRequests` s `Gateway.Use` → `sondy/ai/spfx/config/package-solution.json` ř. 28–32 → ano, ale `package.json` má SPFx 1.23.2, ne 1.24.1 jako skill
- OCR `prebuilt-read`, 0,0015 USD, čeština → `sondy/ms-llm/gateway-prima.md` ř. 11–12 → ano

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-llm-gateway/SKILL.md` | 16–24 | tabulka endpointů: chat, vision, OCR, kvóta, časy a ceny | ✅ | Důkaz: `sondy/ai.md` ř. 109–123, `sondy/ms-llm/gateway-prima.md`. Souhrnně 7 tvrzení. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 24 | `/api/image` → 501, kvóta obrazových modelů 0 | ✅ | Důkaz: `server.mjs` ř. 125, `ai.md` ř. 81. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 26–27 | bez Azure to nejde (Copilot API, AI Builder) | ⚠ | Skill to značí 📘 a `ai.md` je 📘 z dokumentace. Neprošlo labem (chybí licence). Napiš ⛔ „bez Copilot licence a Premium v labu nejde ověřit“ a uveď, kde to ověřit (tenant E.ON). | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 40 | kód „SPFx 1.24.1 ✅ ověřeno web partem v labu“ | ❌ | Měřený web part je SPFx 1.23.2 (`sondy/ai/spfx/package.json`, `ai.md` ř. 142). 1.24.1 je v šabloně `egd-prvni-appka`. Oprav verzi, nebo ověř na 1.24.1. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 57–66 | kód `_ai`, `_shrn`, `_ocr` ze skillu | ❌ | Kód ze skillu v labu neběžel. Běžel jiný kód v `AiGatewayWebPart.ts`: OCR kóduje base64 po 32 kB blocích, skill smyčkou po bajtu. Skill nemá `_ai` pro GET. Spusť přesně kód ze skillu v labu (build a klik), nebo přestaň psát „ověřeno“. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 68–73 | `_shrn`: prompt „Shrň jednou větou česky“ | ⚠ | Prompt neměřen. V labu byl jiný (`ai.md`, `gateway-prima.md`: oprava textu). Ověř spuštěním. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 84 | odpověď má `costUsd`, `ms`, `kvotaDnes {tokens, limit}`, OCR `pages`, `fields` | ✅ | Důkaz: `server.mjs` ř. 97, 117, 165 a `gateway-prima.md`. U `prebuilt-invoice` jsou `fields` v kódu. Výstup `fields` jsem v `gateway-prima.md` na ř. 14 neviděl, jen nadpis. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 88 | první volání po pauze 26 s | ✅ | Důkaz: `ai.md` ř. 124. Měřeno curlem, ne z web partu. Skill říká „min-replicas 0“, ale `ai.md` ř. 213 doporučuje `min-replicas 1` (≈ 8 USD/měs.). Skill to doporučení vynechává. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 88 | tlačítko „Přemýšlím…“ | ⚠ | UI text je návrh, v labu netestován. Drobné. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 96 | `GET /api/kvota` „stejným `_ai`, metoda `get`“ | ❌ | Skillová `_ai` umí jen POST. Odpověď `/api/kvota` má jiný tvar (`spotreba`, `limitTokenuZaDen`, ne `kvotaDnes`), viz `server.mjs` ř. 156. Doplň `_aiGet`, ověř v labu. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 94–95 | ověření: klik „Shrnout“, F12 ukáže `Authorization: Bearer`, žádný klíč | ⚠ | Postup skillu nikdo neprošel. `ai.md` ř. 152 ověřil whoami, chat a OCR přes `tools/ai-spfx-klik.mjs`, ne F12. Projdi a zapiš. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 101 | `Failed to fetch` = chybí CORS ✅ | ✅ | Důkaz: `ai.md` ř. 153. Část „nebo ji blokuje proxy“ neměřena (viz ř. 113). | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 100 | `AADSTS65001` = IT neschválilo `Gateway.Use` | ⚠ | Chybová hláška v labu nezachycena (grant se dělal rovnou). Zkus volání před schválením a zapiš text hlášky. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 102 | 401 = špatné `apiAppId` ✅ | ⚠ | Naměřeno jen 401 pro token s jiným cílem (Graph) z curlu. Z web partu by špatné `apiAppId` selhalo při získání tokenu v `getClient`, ne jako 401. Ověř web partem se špatným `apiAppId`. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 103–104 | 403 „Neznámá appka“, 429 | ✅ | Důkaz: `chyby-gateway.md` ř. 8, 11–13. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 105 | 502 hned po nasazení = propagace práv ✅ | ❌ | `ai.md` ř. 125 a 220 říkají „pravděpodobně… nepotvrzeno ❓“. Skill má ✅. Změň na ❓, nebo ověř. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 109 | bez Azure a sdílené gateway to nejde | ⛔ | OK jako rozhodnutí IT, ale důvod není u značky. Doplň ⛔ s odkazem na `ai.md` „Tři cesty“. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 110 | schválení `Gateway.Use` platí pro všechny SPFx appky v tenantu ✅ | ⚠ | Odvozeno z `AllPrincipals` (`ai.md` ř. 134, 202), na tvrzení nebyl samostatný test. Ověř druhým balíčkem, nebo značka 📘. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 111–112 | `permissionrequest approve` selhalo, prošel Graph grant, UI neověřeno | ✅ | Důkaz: `ai.md` ř. 150–151 a `tools/ai-spfx-api-grant.sh`. UI krok ❓ je poctivě uveden. Doporučení pro IT E.ON ale chybí (ověř v UI SharePoint admin centra, nebo napiš, že nešlo). | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 113 | proxy E.ON musí pustit `*.azurecontainerapps.io` ❓ | ⚠ | V labu nejde (žádná firemní proxy). Označ ⛔ „jen E.ON“ a napiš, kde to ověřit. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 25–27, 109–121 | jediná cesta C (gateway); cesta B (Power Automate / AI Builder) se jen odmítá | 🔀 | `ai.md` ř. 22–33 má srovnání A/B/C. Ve skillu chybí pro a proti, nároky na IT a náročnost pro citizen developera u B. Doplň 3–4 řádky nebo odkaz na tabulku. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 29–38, 116–121 | tři hodnoty od IT; gateway v E.ON neexistuje | 🔀 | Varianty gateway (APIM za ní, `min-replicas 1`, `X-App-Id` vs scope na appku) jsou jen v `ai.md`. Skill uvádí jen `X-App-Id`. Doplň odkaz, nebo 2 řádky s pro a proti. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 116–121 | věta pro IT: „desítky USD měsíčně pro 10 appek“ | ⚠ | `ai.md` ř. 188–189: lehký scénář ≈ 35 USD, střední ≈ 300 USD (mini). Odhad počtu volání, ne měření. Skill říká jen „desítky“. Doplň „≈ 35 až 300 USD, odhad“. | miniskilly |
| `skills/egd-llm-gateway/SKILL.md` | 89 | do promptu neposílat osobní údaje; region EU | ⚠ | Doporučení bez ověření. Lab běží na Global Standard, ne DataZone EU (`ai.md` ř. 84). Skill vypouští, že „region EU“ je jen 📘 a zatím neplatí. | miniskilly |

**Riziko pro středu:**

1. Skillový kód (`_ai`, `_ocr`, GET kvóta) v labu neběžel. Účastník ho zkopíruje a první chyba (verze SPFx 1.23.2 vs 1.24.1, nefunkční GET `/api/kvota`, pomalý base64 u větších souborů) se objeví až na workshopu: vysoké.
2. Studený start 26 s při `min-replicas 0`. Skill to zmiňuje jen jako varování a nedoporučuje `min-replicas 1`. Účastníci uvidí „Přemýšlím…“ a bez vysvětlení budou dál klikat: střední.
3. Gateway a `Gateway.Use` v E.ON neexistují a nikdo je neschválil. Skill to popisuje správně, ale schválení přes UI admin centra se v labu nepovedlo (jen Graph grant). Na workshopu to může zablokovat všechny: vysoké, pokud IT nepřipraví gateway předem.


<a id="skills-egd-maily-skill-md"></a>
### `skills/egd-maily/SKILL.md` (autor: miniskilly)

**Namátka důkazů:**

3 ✅ ověřeno):
- Delegované `POST /me/sendMail` s přílohou, 202, doručeno (ř. 17, 55, 63) → `sondy/napojeni.md:76` → ano (Eva Veselá, CSV, 202, odesílatel i `from` = Eva). Skript `tools/napojeni-graph-delegated.py` existuje (ř. 5 `send`, ř. 39 volá `/me/sendMail`).
- Systémová schránka přes Job + Exchange RBAC (ř. 18) → `sondy/napojeni.md:56` a `:51` → ano (Job Succeeded za 37 s, `sendMail jako egd-report@…: HTTP 202`). Skripty `tools/napojeni-report-job.py` a `tools/napojeni-exo-rbac.ps1` existují.
- Konektory Outlook a PA „Standard“ (ř. 19) → `sondy/napojeni.md:~100` (sekce Sonda 4) → ano (pole `tier`). Samotné flow ale doběhlo `Failed`, protože konektory nejsou přihlášené.

Souběžně: nic ze SPFx web partu skill neprošel. `sondy/ms-maily/` obsahuje jen `novy.log` a vygenerovaný projekt `prvni-appka`, bez jediného `sendMail` ve zdrojácích (`rg` mimo `node_modules`: 0 shod).

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-maily/SKILL.md` | 17, 34 | Cesta SPFx → `MSGraphClientV3` → `/me/sendMail` je „✅ tvar ověřený Graphem“. Ověřen je jen Python/REST, ne `webApiPermissionRequests`, `getClient('3')` ani `post()` | ⚠ | Projít kód ve skutečném web partu na labu: build, `.sppkg`, schválení, klik, mail v Odeslaných. Nadpis „Kód ✅“ změnit, dokud to nejde. | miniskilly |
| `skills/egd-maily/SKILL.md` | 23–31 | `webApiPermissionRequests` s `Mail.Send` v `package-solution.json` a schválení v API access | ⚠ | 📘, v labu nezkoušeno (`napojeni.md:78`). Ověř v labu, nebo napiš proč nejde. | miniskilly |
| `skills/egd-maily/SKILL.md` | 32 | „Bez schválení AADSTS65001 nebo 403 ✅“ | ❌ | Změřeno bylo `AADSTS65002` u Azure CLI (`napojeni.md:77`), což je jiný klient i jiný kód. Chování SPFx bez schválení nikdo neměřil. Oprava: ✅ jen „token nevznikne (AADSTS65002 u CLI)“, chování SPFx označit ❓ nebo ověřit. | miniskilly |
| `skills/egd-maily/SKILL.md` | 64 | Odpověď 202 bez těla ✅ | ✅ | `napojeni.md:76`. | miniskilly |
| `skills/egd-maily/SKILL.md` | 64 | Příloha ~3 MB, větší přes upload session | ⚠ | 📘. Otestuj přílohu 2,9 MB a 3,5 MB. Odkaz místo přílohy je jen doporučení bez pokusu. | miniskilly |
| `skills/egd-maily/SKILL.md` | 65 | „Appka nesmí posílat mail sama od sebe“ | ⚠ | Je to návrhové pravidlo, ne tvrzení o platformě. Přijatelné, ale výslovně to tak označ. | miniskilly |
| `skills/egd-maily/SKILL.md` | 66 | `Mail.Send.Shared` a Send As ❓ | ⛔/⚠ | Je to ❓ s „na workshopu nedělat“, ale bez důvodu. Doplň, že v labu jde založit sdílenou schránku (existuje `egd-report`), a zkus to, nebo napiš proč ne. | miniskilly |
| `skills/egd-maily/SKILL.md` | 19 | Power Automate „Když se vytvoří položka“ → Outlook „Odeslat e-mail“ | ⚠ | Konektory Standard ✅, ale flow zkouší jiný trigger (Recurrence) a skončilo `Failed` (`napojeni.md` Sonda 4). Trigger „Když se vytvoří položka“ nikdo nezkoušel. Ověř, nebo škrtni. Skill mlčí o tom, že připojení musí člověk přihlásit ručně a že je třeba role Environment Maker. | miniskilly |
| `skills/egd-maily/SKILL.md` | 19 | PA „Odeslat e-mail“ s přílohou pro nové žádosti | 🔀 | U varianty chybí „co chce IT E.ON“ (licence PA, role v prostředí, připojení vázané na vlastníka) a náročnost pro citizen developera. V `napojeni.md:121–125` to je, ve skillu ne. Doplň aspoň odkaz nebo dva řádky. | miniskilly |
| `skills/egd-maily/SKILL.md` | 18 | Systémová schránka přes Container Apps Job | 🔀 | Jen odkaz na `egd-planovane-ulohy`. Chybí, co chce IT (subscription, Exchange RBAC) a že účastník to bez IT nesvede. Doplň pro a proti. | miniskilly |
| `skills/egd-maily/SKILL.md` | 70–72 | Postup „Ověření“ (klik → Odeslané → čeština v pořádku) | ⚠ | Čeština a otevření přílohy nejsou v labu změřené. Příloha byla CSV, ne `.docx`. Projdi s `.docx` z `egd-dokumenty` a diakritikou. | miniskilly |
| `skills/egd-maily/SKILL.md` | 76–78 | „Mail.Send je tenantové, platí pro všechny SPFx appky a kdokoli, kdo stránku otevře, může poslat mail“ | ⚠ | Je to 📘 (`napojeni.md:81`). Formulace „jménem kohokoli, kdo stránku otevře“ je nepřesná: appka může poslat jen jménem toho, kdo ji spustil. Oprav a ověř v labu, nebo označ 📘. | miniskilly |
| `skills/egd-maily/SKILL.md` | 79–80 | Náhradní cesta `mailto:` | ⚠ | Kód nikdo nespustil. Ověř na Windows s klasickým i novým Outlookem, délku URL a češtinu v těle. | miniskilly |
| `skills/egd-maily/SKILL.md` | 82–85 | Věta pro IT: SharePoint admin centrum → Advanced → API access | ⚠ | Cesta v menu je 📘. Ověř v labu v admin centru, že položka existuje a že se tam žádost objeví. | miniskilly |
| `skills/egd-maily/SKILL.md` | 11, 8 | Úvod a popis: „bez Azure, jen jedno schválení“ | ⚠ | Plyne z nezměřené SPFx cesty. Doplň „po ověření v labu“. | miniskilly |
| `skills/egd-maily/SKILL.md` | 9 | „příloha typicky z `egd-dokumenty`“, příklad s `.docx` | ⚠ | Spojení obou skillů nebylo spuštěno (viz ř. 70–72). | miniskilly |

**Riziko pro středu:**

1. Vysoké: Celá cesta v ř. 17 a 34 (SPFx `MSGraphClientV3` + `webApiPermissionRequests` + schválení správcem) nebyla v labu nikdy spuštěna. Jestli `getClient('3')` nebo schválení v API access nefunguje, hlavní scénář skillu se na workshopu rozpadne. ms-maily sonda skončila jen scaffoldem.
2. Střední: Chybové hlášení v ř. 32 a 72 (`AADSTS65001`) nesedí s měřeným `AADSTS65002`. Účastník se pak bude podle skillu řídit špatnou diagnostikou.
3. Střední: Schválení `Mail.Send` bude pravděpodobně blokovat IT E.ON. Skill nabízí jen `mailto:` bez přílohy (nezkoušeno) a odkaz na Power Automate, který v labu nedoběhl.


<a id="skills-egd-planovane-ulohy-skill-md"></a>
### `skills/egd-planovane-ulohy/SKILL.md` (autor: miniskilly)

**Namátka důkazů:**

- „Job spustil cron na minutu přesně, cron je UTC“ → sondy/napojeni.md, řádek „Cron“ (spuštění 18:20:00 UTC, mail doručen) → ano
- „Odeslání z jiné schránky = 403“ → sondy/napojeni.md, řádek „Odeslání z jiné schránky (alice)“ (HTTP 403 ErrorAccessDenied) → ano; skripty `tools/napojeni-exo-rbac.ps1` a `tools/napojeni-job-deploy.sh` existují, cronExpression je v druhém na ř. 24 → ano
- „Past: missing prvReadconnectionreference, role Environment Maker“ → sondy/napojeni.md, tabulka Sondy 4 (❌ napoprvé, po přidělení role flow uloženo 201) → ano

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-planovane-ulohy/SKILL.md` | 5–6, 20, 24 | B „klikáním“ v prohlížeči: v labu proběhlo jen vytvoření flow přes API, ne klikání v UI. Běh skončil Failed (Unauthorized), mail nepřišel. Značka „✅ uloženo a spuštěno“ je pravdivá, ale doporučení B plyne z nedoběhlé cesty | ⚠ | Pavel přihlásí konektory, flow doběhne a mail se doručí. Do té doby doporučení B označit jako podmíněné | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 30–37 | Celý klikací postup 1–5 (Naplánovaný cloudový tok, Získat položky s Filtrovat dotaz `Stav eq 'Nový'`, Počet položek 1000, Vytvořit tabulku HTML, příloha přes Upřesnit parametry) nikdo neprošel. Lab flow je jiné: Recurrence → GetFileContentByPath → SendEmailV2. Get items ani Create HTML table v žádné sondě nejsou (`rg` nic) | ⚠ | Ověř v labu: postav přesně tento flow (UI nebo `napojeni-flow-deploy.py`) a nech ho doběhnout. Názvy českých akcí a menu ověř v reálném UI | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 34 | Filtrovat dotaz na „indexovaný sloupec“ a Počet položek 1000 | ⚠ | Odkaz na `egd-data-seznamy` je v pořádku (index/500 u filtru tam ✅), ale chování akce Získat položky ve flow ověř v labu. Strop 5000 a stránkování taky | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 39 | Konektory SharePoint, Outlook a Data Operation jsou Standard ✅ | ⚠ | SharePoint a Outlook ✅ (pole tier v `sondy/napojeni.md`). Data Operation (Create HTML table) tam změřen není. Dohledej tier z API prostředí | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 40–41 | Přihlášení konektorů dělá člověk, přes API zůstane Error | ✅ | Příklad důkazu: `sondy/napojeni.md` Sonda 4, řádek „Příčina“ | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 22 | Cizí API v B = HTTP Premium 📘 | ⚠ | `sondy/power-automate.md` má tier z API a pokus zapnout HTTP flow. Příčina (licence) je tam označená jako nepotvrzená. Doplň o trial Premium, jak plánuje `power-automate.md` ř. 56 | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 45 | Flow je vázaný na účet vlastníka a spoluvlastník to řeší 📘 | ⚠ | Skill sám říká 📘, `power-automate.md` ř. 59 říká ❓ (odchod vlastníka jen v E.ON). Spoluvlastníka v labu zkus přidat a odebrat vlastníka. Případně uveď, že jde ověřit jen v E.ON | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 46 | Export → Balíček .zip jako záloha definice | ⚠ | Žádná sonda export neprošla. Proveď export a import v labu, nebo zapiš „neověřeno“ | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 24 | Stav v labu C: „celé prošlo, mail doručen“ | ✅ | Sonda 2 prošla celá: Succeeded za 37 s, HTTP 202, doručeno, příloha, 403 negativní test | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 18–24 | Cena C „haléře za běh ✅“ (ř. 55) | ⚠ | `sondy/napojeni.md` píše „řádově haléře, přesná fakturace se projeví s odstupem“. Je to odhad, ne měření. Doplň fakturaci z Cost Management. ACR (5 USD) je v sondě 📘 | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 54 | Cron `0 5 * * 1-5` = 6:00 SEČ ve všední dny | ⚠ | V labu se zkoušel `cron na minutu+3` a `0 6 * * 1`. Konkrétní výraz 1-5 neběžel, přepočet SEČ/SELČ je aritmetika. Spusť s cronem pro všední dny nebo to označ jako odvozené | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 18, 55–56 | `tools/napojeni-job-deploy.sh` a RBAC skript existují | ✅ | Soubory jsou v `tools/`. V skillu chybí poznámka, že lab používal cizí prostředí `ca-ppf-rooms-env` a limit je jedno prostředí na subscription (`MaxNumberOfGlobalEnvironmentsInSubExceeded`). EG.D bude potřebovat vlastní prostředí | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 19–22 | Rozhodovací tabulka, řádky „Plánování“, „Mail s přílohou“ u C | ✅ | Pokryto sondou 2 (cron přesně, 202, 403) | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 24 | Licence u B: „uživatel s licencí PA a rolí Environment Maker ✅“ | ✅ | Sonda 4: `InvalidUserPlan` bez licence, role Environment Maker nutná | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 36 | Pasti: výchozí prostředí s Dataverse vyžaduje Environment Maker | ✅ | viz namátka | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 66–68 | „Kdy to nejde v E.ON“: DLP zakáže kombinaci konektorů 📘 | ⚠ | DLP neověřeno nikde. Označ „jen v E.ON“ s důvodem, nebo zkus DLP v labu (pokud lab jde nastavit) | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 68 | „Galík nechce Azure subscription“ | ❌ | Rozpor s `10-container-app.md` a `sondy/power-automate.md` ř. 3. Tam je to jen „EG.D nechce Azure hosting a licence pro každého uživatele“ a Container App se dál nabízí jako varianta pro IT. Upřesni zdroj výroku nebo ho přeformuluj | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 68 | „Jedna sdílená úloha pro víc appek je levnější“ | ⚠ | Nikdo neměřil. Napiš jako úvahu, nebo spočítej | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 47–48, 72–77 | Věty pro IT (ServiceNow) B a C | ✅ | Odpovídají tomu, co lab skutečně potřeboval (role, Send As, RBAC scope) | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 19–26 | B vs C: skill neuvádí variantu e-mailu ze sdílené schránky přes „Send an email from a shared mailbox (V2)“ (`power-automate.md` ř. 16, běh ❓) a variantu kombinace SPFx + A pro manuální „pošli report hned“ | 🔀 | Doplň řádek o sdílené schránce v B a odkaz na Send As (`tools/pa-sharedmailbox-sendas.ps1`) s poznámkou, že běh čeká na přihlášení | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 14–26 | Chybí A) nebo hybridní varianty (premium HTTP, PAYG) a u B/C chybí řádek „co chce IT E.ON“ a „náročnost pro citizen developera“ ve stejné tabulce. `napojeni.md` je má v srovnání cest | 🔀 | Přidej do tabulky řádky IT požadavky a náročnost. Zmiň PAYG a „Pavel přihlásí konektory“ jako podmínku | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 26 | „Na workshopu: B klikáním; C jen jako co by udělalo IT“ | ❌ | `napojeni.md` doporučuje „B, pokud EG.D drží licence PA a smí konektory přihlásit, jinak C“ a `10-container-app.md` ř. 47 označuje B jako „⚠ flow nasazené, čeká na přihlášení“. Skill zjednodušuje na jednu cestu bez podmínky | miniskilly |
| `skills/egd-planovane-ulohy/SKILL.md` | 12 | Legenda značek | ✅ | Odkazuje na `sondy/napojeni.md`, který existuje. Značka ✅ „22. 11. 2026“ sedí s datem sondy | miniskilly |

**Riziko pro středu:**

1. Vysoká: klikací postup B (ř. 30–37) nikdo neprošel a lab flow nikdy nedoběhlo. Pokud se akce jmenují jinak nebo tabulka HTML či příloha nepůjdou, účastníci se na workshopu zaseknou na hlavní cestě.
2. Vysoká: účastník EG.D nemusí mít licenci PA ani roli Environment Maker (v labu `InvalidUserPlan` a `missing prvReadconnectionreference`). Doporučení „B klikáním“ je nepodmíněné, takže hrozí, že nic z toho nejde uložit.
3. Střední: přihlášení konektorů (SharePoint, Outlook) musí udělat člověk, což skill zmiňuje jen jednou větou. Bez toho první běh skončí Unauthorized a „neříkej naplánováno, dokud nepřišel mail“ se nedá splnit.


<a id="skills-egd-prava-role-skill-md"></a>
### `skills/egd-prava-role/SKILL.md` (autor: miniskilly)

**Namátka důkazů:**

- Zadavatel cizí položku neupraví ani nesmaže (404) → `sondy/data-prava/matrix.jsonl` ř. 6–7 (`edit_foreign: 404`, `delete_foreign: 404`) → ano.
- Schvalovatel s `CancelCheckout` čte, upraví i smaže cizí; schvalovatel s Edit/`ManageLists` nevidí nic cizího → `matrix.jsonl` ř. 8 (`CancelCheckout`, `delete_foreign: "OK (smazáno!)"`), ř. 9 (`ManageLists`, `read_foreign_direct: 404`) → ano.
- Sdílení při `ReadSecurity=2` nejde → `extras.jsonl` ř. 29–30 (share 200, jakub čte 404). Verze: `extras.jsonl` ř. 15–18 (zadavatel 3 verze své položky, cizí 400, schvalovatel 3). Příloha: `extras2.jsonl` ř. 2 a 4 (404). → ano.
- Bit `CancelCheckout=9` (0x100) a `ManageLists=12` (0x800) → `tools/data-prava-sp.py` ř. 32 → ano, sedí s kódem ve skillu.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `skills/egd-prava-role/SKILL.md` | 15–22, 27–30 | Model rolí a past `CancelCheckout`; zadavatel 404, schvalovatel vše včetně mazání, cizí 403 | ✅ | `matrix.jsonl`, `matrix-ZadostiW.jsonl`, `sondy/data-prava.md` ř. 44–60; 5 účtů, 3 role | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 69–74 | Přílohy cizí nedostane; verze jen svých; sdílení při „jen své“ nejde | ✅ | `extras.jsonl`, `extras2.jsonl` (viz namátka) | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 24–25, 30 | `ReadSecurity=2`, `WriteSecurity=2` fungují jako „jen své“ | ✅ | změřeno na `Zadosti`, ne na `Pozadavky` z `egd-prvni-appka` (viz ř. 78) | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 46–61, 64–65 | Nadpis „Kód: appka pozná roli z práv ✅“ a kód s `CancelCheckout` 0x100 | ❌ | Kód ze skillu se nikdy nezkompiloval ani nespustil. Šablona (`sondy/miniskilly/prvni-appka/src/webparts/evidence/EvidenceWebPart.ts` ř. 35) a `sondy/ms-prava/.../EvidenceWebPart.ts` ř. 35 používají `PRAVO_SCHVALOVAT = 0x10` (ApproveItems), `PRAVO_VSE` v nich není. Úroveň „EGD Schvalovatel“ ApproveItems nemá (`matrix.jsonl` ř. 8), takže záložka Ke schválení se schvalovateli neukáže. Změnit v šabloně i v kroku 3 „Ověření“ a projít to v appce pod účtem eva.vesela. Pak ✅ nebo smazat značku. | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 63 | Bity jen v dolních 32 bitech (`Low`) | ⚠ | 📘 se zdrojem. Jde snadno ověřit: `Low` a `High` pro eva a petra z `EffectiveBasePermissions`. | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 32–40 | Postup klikání (Kopírovat úroveň, Přepsat chování seznamu, Zastavit dědění…) | ⚠ | Lab prošel jen REST (`tools/data-prava-sp.py setup`), ne UI. Projdi klikáním v prohlížeči nebo přes Playwright a ověř názvy tlačítek a časy (10 minut). | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 24–25 | Názvy v UI „Přístup ke čtení položek: Jen položky, které vytvořil uživatel“ | ⚠ | Dohledej v labu přesné české znění, nebo přepiš na ověřené. | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 36 | Úroveň „EGD Zadavatel“ je kopie Přispívání beze změny | ⚠ | V labu to byl ručně sestavený seznam práv (`ZAD_RIGHTS`, ř. 36 skriptu), ne kopie. Ověř, že kopie z UI dá stejná práva. | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 42–44 | „REST/CLI je pracnější“ a skript ukazuje postup | ⚠ | `setup` v REST běžel. Zapiš, zda je `m365`/PnP příkaz pro úroveň a skupiny proveditelný, nebo napiš proč ne. | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 78 | `m365 spo list get --properties "ReadSecurity,WriteSecurity,HasUniqueRoleAssignments"` → `2, 2, true` | ⚠ | Příkaz nikdy nespuštěn (v `tools/` ani v logu není). Spusť na `egd-sonda-data-prava/Zadosti` a ověř, že CLI tyto vlastnosti vrací, nebo uprav příkaz. | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 79–83 | Ověření dvěma účty (zadavatel a schvalovatel v appce) | ⚠ | Proběhlo REST pod účty, v appce ne. Projdi s `prvni-appka` na webu `egd-sonda-miniskilly`, kde `Pozadavky` nemá `ReadSecurity=2`. | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 71 | „Přímé čtení souboru napřímo 404/400“ | ⚠ | `sondy/data-prava.md` ř. 71 uvádí: v prohlížeči s cookie neověřeno ❓. Skill to tvrdí bez výhrady. Ověř v prohlížeči nebo přidej výhradu. | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 73–74 | Sdílení položky: řešení `ReadSecurity=1` + ACL | ✅ / ⚠ | Funguje v `ZadostiACL` (`extras2.jsonl` ř. 25–26). Skill však říká „Power Automate nebo server“ a to v labu pod právy `ManagePermissions` nikdo neprošel. Označ jako 📘, nebo ověř. Pozor: `data-prava.md` ř. 75, zadavatel rozbil dědičnost na vlastní položce (200, nevysvětleno ❓). Skill to vynechává. | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 85–87 | Nevlastník webu nemůže tvořit skupiny, úrovně ani přerušit dědičnost | ⛔ | Napsáno jako podmínka „kdy to nejde“, bez ověření. Přidej, že v E.ON jde o politiku tenantu, a zkus pod běžným členem (např. lucie, tomas) pokusem o `POST roledefinitions` a `breakroleinheritance`. | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 88 | Vlastní úrovně mohou být v tenantu zakázané politikou | ⛔ | Je označeno ❓ a důvod je uveden. OK, ale chybí, jak to rychle zjistit (jeden pokus o vytvoření úrovně ve webu E.ON). | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 89 | Role přes skupiny Entra místo SharePoint skupin „funguje stejně“ | ⚠ | 📘, v labu nezkoušeno (lab má skupiny Entra). Ověř: přidej Entra skupinu do skupiny Schvalovatelé a změř `EffectiveBasePermissions`. | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 91–93 | Věta pro IT (role Vlastník) | ⚠ | Doporučení bez ověření, že vlastník webu opravdu smí vše (skupiny, úrovně, dědičnost). V labu to dělal admin tenantu. Ověř pod účtem s rolí Vlastník (ne globální admin). | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 29–30 | Zákaz mazání jen úrovní bez „Odstranit položky“ a košem/verzemi | 🔀 | Varianta „vzor samostatného listu rozhodnutí bez `CancelCheckout`“ je v `data-prava.md` ř. 113 (kit), ve skillu chybí. Doplň ji s pro a proti a požadavky na IT, protože zakazuje vidět a mazat cizí žádosti. Variantu „úroveň bez DeleteListItems“ v labu neprošel nikdo. | miniskilly |
| `skills/egd-prava-role/SKILL.md` | 76 | „Bez druhého účtu to ověřené není“ | ⚠ | Rozumné varování, ale chybí odkaz, kde druhý účet vzít (`tools/data-prava-token.py`, lab účty). | miniskilly |

**Riziko pro středu:**

1. Vysoké: Schvalovatel po kroku 1 a kódu dostane `Ke schválení` jen s opravenou šablonou. Jinak v appce bit 0x10 (ApproveItems) nemá a záložka se neukáže, i když seznam funguje. Nebo se bit 0x100 nedostane do appky vůbec.
2. Vysoké: Skill má začátečníka vést klikáním v UI, ale kroky 1–4 nikdo v UI neprošel, jen REST. Pokud se názvy nebo pořadí liší, uvízne.
3. Střední: Účastník v E.ON nebude vlastník webu nebo tenant zakáže vlastní úrovně (ř. 85–88). Bez plánu B (vzor listu rozhodnutí z ř. 113 `sondy/data-prava.md`) skill na workshopu nepomůže.


## 2. kolo

<a id="k2-09-github-ucastnici-md"></a>
### `09-github-ucastnici.md` (autor: lab-github), 2. kolo 22. 11.

**Výsledek:** z 18 položek 1. kola je vyřešených 17. Nedořešený zůstává ř. 46 (podmínky a captcha). Nově: ✅ 5 / ⚠ 4 / ⛔ 4 / 🔀 0 / ❌ 2 (v 1. kole ✅ 3 / ⚠ 10 / ⛔ 3 / 🔀 2 / ❌ 2).

**Namátka:** nové důkazy v `sondy/lab-github/` existují a sedí:
- `gh-scopes.txt:3-4`: scopes a INSUFFICIENT_SCOPES. Soubor je oříznutý uprostřed druhé chyby, na závěr to nemá vliv.
- `introspekce-graphql.txt`: `createEnterpriseOrganization`.
- `suchy-beh-skriptu.txt`: rc=0, egd01.
- `npm-copilot-cli.txt`: @github/copilot 1.0.114. `npm view … engines` je prázdné, takže „Node 22+“ zůstává ❓.

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `09-github-ucastnici.md` | 122 | `POST /orgs/{org}/invitations` pro EMU „není dostupný“ | ⚠ | doplnit značku a zdroj, nebo ověřit po založení trialu | lab-github |
| `09-github-ucastnici.md` | 46 | podmínky GitHubu: 1 účet na osobu; signup blokuje captcha | ⚠ | podmínky jdou přečíst: odkázat je, nebo dát ❓; u captchy chybí značka | lab-github |
| `09-github-ucastnici.md` | 131 | pozvánky 50/24 h, 500 u starší org | ⚠ | doplnit URL dokumentace, nebo číslo vypustit | lab-github |
| `09-github-ucastnici.md` | 21 | Node 22+ pro `npm i -g @github/copilot` | ⚠ | `engines` je prázdné: ověřit na Macu v izolaci, nebo nechat ❓ | lab-github |
| `09-github-ucastnici.md` | 31, 52 | stav licencí GHE a Copilot „neznámý“ × `01-fakta-workshopu.md:74` („zařídili si sami“) | ❌ | sjednotit s 01 a 05 bod 3, uvést zdroj a jistotu zprávy | lab-github + hlavní |
| `09-github-ucastnici.md` | 63 × 128–134, 148 | „C neobjednávat“ × plán varianty 2 (= C) jako záloha | ❌ | napsat, že důvodem je jen Copilot, a propojit číslování (varianta 1 = D, 2 = C) | lab-github |
| `09-github-ucastnici.md` | 32, 52, 64, 68 | EG.D GHE, ITSM, firemní e-mail, Windows | ⛔ | OK, výslovně „jen EG.D/E.ON“ s vlastníkem; datum dotazu doplnit, až se položí | lab-github |

**Riziko pro středu:** hlavní cesta F, tedy stav licencí podle 09 × 01, je vysoké riziko. Záloha A (limity Copilot Free) se neměřila, test je až v úterý: vysoké. Přihlášení k EMU nezkoušeno: střední.

**Doplněk 2. kola (09, 22. 11., kontrola `rg` audit-overeni):** všech 6 zbývajících bodů je opravených. Ř. 31/43: stav licencí odkazuje na 01:74 s výhradou „nezávisle neověřeno“. Ř. 63: číslování je teď Varianta 1 = D a Varianta 2 = C, proti C jako hlavní cestě mluví jen Copilot. Ř. 46: ToS ❓ s URL, captcha ❓. Ř. 122 a 131: 📘 s URL a „nezkoušeno“. `gh-scopes.txt` je celý (1631 B, rc=0). **09 je uzavřený**: zbývají jen ⛔/📘/❓ s výslovným důvodem, žádný ❌.

<a id="k2-sondy-power-automate-md"></a>
### `sondy/power-automate.md` (autor: sonda-power-automate), 2. kolo 22. 11.

Výsledek: **z 25 položek prvního kola je vyřešeno 20, 5 trvá.** Tabulka po položkách je přímo v sekci prvního kola (ř. 774 a dál).

Ověřené důkazy:
- `vystupy/behy.txt`: …CU15/CU20/CU08 Succeeded, CU16/CU30/CU17 Failed. Živé `pa-flow.py runs` vrací totéž.
- `katalog-konektoru-tier.txt`: 1224 Premium, 171 Standard.
- `diag-409.txt`: 403 MissingAdequateQuotaPolicy u HTTP akce.
- `sendas-get-recipientpermission.txt` a `trigger-volani.txt` odpovídají textu.
- `licence-tomas.txt` není důkaz (autor to sám uvádí).

| soubor | ř. | tvrzení (krátce) | stav | co udělat | autor |
|---|---|---|---|---|---|
| `sondy/power-automate.md` | 14, 28, 40 × 69 | „409 = stejná třída blokace jako 403, příčina licence ✅“ × v Neověřeno „příčina nepotvrzena“ | ❌ | 409 `CannotStartUnpublishedSolutionFlow` mluví o nepublikovaném řešení a připojeních, ne o licenci. ✅ platí jen pro HTTP akci (403). U Request triggeru napsat „příčina neznámá“. | sonda-power-automate |
| `sondy/power-automate.md` | 13 | OCR/vision přes PA | ⚠ | ověř přes Foundry konektor, nebo napiš proč nejde | sonda-power-automate |
| `sondy/power-automate.md` | 22 | „OBO neumí“ ❓ | ⚠ | doplň důvod a návrh testu | sonda-power-automate |
| `sondy/power-automate.md` | 49–50 | odkaz na háčky v Neověřeno, chybí řádek export / flow mimo repo | ⚠ | doplň řádek | sonda-power-automate |
| `10-container-app.md` | 33, 93, 99, 101 | „409 u HTTP“ (správně 403), OBO bez ❓, fronta „doporučená“ | ❌ | opravit podle sondy | hlavní session |
| `04-integrace-test-plan.md` | 60 | „příčina nepotvrzena“ | ⚠ | sjednotit se sondou po vyřešení ř. 14 | hlavní session |

<a id="k2-skills-egd-prvni-appka"></a>
### `skills/egd-prvni-appka/*` (autor: skill-prvni-appka), 2. kolo: čeká

22. 11.: autor průběžně hlásí opravy, ještě nejsou hotové. Šablona je teď appka „Spokojenost s prostředím kanceláře dnes“, Evidence požadavků ve skillu už není. Bod 4 z top 10 (bit `ApproveItems`) tím odpadá, ale až po kontrole v 2. kole. Druhé kolo spustím, až autor ohlásí konec labového testu Spokojenosti a testu pod `egd01`.

#### `sondy/power-automate.md`, 2. kolo, druhá iterace (22. 11.): uzavřeno

Všech 5 zbylých bodů je opraveno. Ověřil jsem je `rg` nad sondou a `vystupy/`:
- ř. 40: u Request triggeru je teď „příčina neznámá ❓“. Formulace „stejná třída“ zmizela. Licence má ✅ jen u HTTP akce (403, `diag-409.txt` D/F).
- ř. 13: vision/OCR ✅, běh `…CU25` Succeeded ve `behy.txt` ř. 57–58. Document Intelligence je označený ❓.
- ř. 22: OBO má teď důvod i návrh testu.
- ř. 73: v Neověřeno přibyl řádek o exportu, flow mimo repo a verzování.
- `diag-409.txt`: má popisky A–G a ID flow.

Otevřené zůstávají jen body v Neověřeno, mají uvedený důvod i postup. Na hlavní session zbývá `10-container-app.md` ř. 33/93/99/101.

<a id="k2-redaktor"></a>
### Podklady 00–06, 10 a sondy (autor: redaktor podkladů), 2. kolo 22. 11.

Kontrolu dělalo 13 subagentů, každý na jednom souboru a jen pro čtení. Kontrolovali položky 1. kola, namátkou důkazy (u části živě přes `az`) a rozpory s ostatními soubory. Výsledky jsem sloučil, sporné body (10:99, digi-podnety) jsem ověřil sám.

| soubor | vyřešeno | částečně | trvá | neplatí | nové |
|---|---|---|---|---|---|
| 00-co-mame | 13 | 3 | 0 | 0 | 5 |
| 01-fakta-workshopu | 11 | 1 | 0 | 0 | 5 |
| 02-skills-a-kit | 13 | 7 | 1 | 0 | 7 |
| 03-lab | 10 | 7 | 0 | 0 | 7 |
| 04-integrace-test-plan | 17 | 3 | 0 | 1 | 6 |
| 05-otevrene-body | 11 | 8 | 2 | 0 | 4 |
| 06-azure-inventar | 11 | 3 | 1 | 0 | 3 |
| 10-container-app | 13 | 5 | 1 | 0 | 7 |
| sondy/_zadani-spolecne | 9 | 1 | 0 | 0 | 4 |
| sondy/ai | 14 | 5 | 2 | 0 | 7 |
| sondy/data-prava | 6 | 11 | 0 | 0 | 9 |
| sondy/dokumenty | 11 | 5 | 3 | 0 | 8 |
| sondy/napojeni | 3 | 7 | 1 | 0 | 5 |
| **celkem** | **142** | **66** | **11** | **1** | **77** |

**Společné vzorce:**
1. **Power Automate 403 a 409 se pořád pletou.** V 00:25, 02:23, 05:50 a napojeni:22/89/124/137/173 stojí u HTTP akce „409, příčina ❓“. Správně je 403 `MissingAdequateQuotaPolicy`, tedy licence ✅ (`sondy/power-automate/vystupy/diag-409.txt` D/F). 409 s neznámou příčinou mají jen Request trigger a Recurrence+HTTP. OCR/vision přes PA je ✅ (CU25), přesto ho 04:131 a 10:85 vedou jako ❓.
2. **✅ s plošnou omluvou „surový výstup neuložen“** (ai, napojeni, dokumenty, data-prava cesta C). Podle kánonu je to mezistav. Buď výstup uložit do `sondy/<tema>/`, nebo u buňky napsat „✅ výstupní soubor, běh ❓ neuložen“.
3. **Měřeno v PPF tenantu, vydáváno za lab:** Custom Script (00:16, 05:38) a OBO (04:21).
4. **Závislost na E5 trialu**, který končí 25. 11. 04:04 (BP+Copilot v 09:31), chybí v 04, napojeni, dokumenty a 03:12.

**Nález 1. kola, který neplatil:** 04 „digi-podnety neexistuje“. Projekt je v `~/Projects/egd-vibecoding/digi-podnety` a `podnetyService.ts` má `EffectiveBasePermissions` (ověřeno `ls` a `rg`).

**Doměřitelné hned, jen čtením:** probuzení Azure SQL `egddata` (teď Paused), index nad prahem na `Velky`, `npm audit` a `npm view time` v `sondy/dokumenty`, výstup 403 u `Files.Read`, `tools/ai-gateway-chyby.sh` s uložením do `sondy/ai/dukazy/`.

#### 00

VYŘEŠENO 13, ČÁSTEČNĚ 3, NOVÉ 5.
ČÁSTEČNĚ:
- ř.135: Copilot CLI ❓ bez důvodu a návrhu ověření; TEST-copilot.md neexistuje
- ř.141: 00:27 „📘 E5 dává jen Standard“, přitom 403 z labu je důkaz
- ř.145: „Chybí“ má položky bez návrhu nebo důvodu: chocholous@ppf.cz 00:57–58, Claude.ai chaty 00:59
NOVÉ:
- 00:25 ❌: HTTP „409, příčina ❓“; správně HTTP akce 403 = licence ✅, Request trigger a Recurrence+HTTP 409 = příčina ❓
- 00:27 ⚠: povýšit na ✅ pro HTTP, u SQL/Dataverse nechat ❓
- 00:19 ⚠: „✅ každý skill vychází ze sondy v labu“ × 00:34–37 (kód nikdy neběžel jako celek, chybí Copilot test)
- 00:24 ⚠: varianta „bez Azure s PA“ potřebuje Premium HTTP; chybí konkrétní soubor s důkazem
- 00:16 ⚠: ✅ měřeno v PPF tenantu, ne v labu; doplnit zkoušku v labu, nebo ⛔ s důvodem

#### 01

VYŘEŠENO 11, ČÁSTEČNĚ 1 (ř.162 dotaz Adriáně nepoložen), NOVÉ 5:
- 01:97 × 05:30 a 01:98: „zařídili sami“ × „stav neznámý“; sjednotit na „podle Pavla hotovo, nepotvrzeno“ 🔀
- 01:70: „vlastní DB až při víc než pár tisících ✅“; změřeno 6000 položek, hranice je 📘 ⚠
- 01:74–75: bez CORS / systémová schránka přes Job ✅, napojeni.md:5 přiznává, že logy nejsou uložené ⚠
- 01:75: sendMail jménem uživatele „ano bez Azure“, ✅ jen přes ROPC app registraci, ze SPFx ❓ ⚠
- 01:76: PA Recurrence ✅, platí jen pro flow bez konektoru (napojeni.md:17 Failed Unauthorized) ⚠

#### 02

VYŘEŠENO 13, ČÁSTEČNĚ 7, TRVÁ 1, NOVÉ 7.
ČÁSTEČNĚ:
- 0.7.0/0.8.0: rozpor trvá, ZIP a /plugin install ❓
- CLI 12 cyklus ❓
- m365-cli-safe ř.38 (viz N1)
- varianta A 1.18.2+gulp neměřena
- „gulp od 1.24 nepodporovaný“ 📘
- přístup EG.D k GHE ❓ (zkouška pod účtem mimo PPF)
TRVÁ:
- ř.72–73: project_config.json v labu nespuštěn
NOVÉ:
- N1 02:38 ❌: „✅ CLI z npm bez PSGallery“ × 04:18 „nezkoušeno ❓“
- N2 02:23 ⚠: PA HTTP „409“; správně 403 licence ✅, 409 jen Recurrence+HTTP a Request trigger
- N3 02:21–23 ⚠: ✅ maily, externi-api a Job bez uloženého důkazu (napojeni.md:5)
- N4 02:17 ⚠: egd-data-seznamy „e2e test běží ✅“ bez odkazu
- N5 02:36, 39, 40 ⚠: spfx-performance bez značky; recon a develop bez odkazu na verified.md
- N6 02:45 ⚠: m365-graph „nepoužitelné“ bez značky
- N7 02:16 ⚠: „šablona se právě přepisuje“, časově závislé

#### 03

VYŘEŠENO 10, ČÁSTEČNĚ 7, NOVÉ 7.
ČÁSTEČNĚ:
- 03:14 AADSTS65001 neuloženo (08:44 má jiný případ, odkázat)
- 03:33 weby: spo site list chybí
- 03:36 zdrojáky arcade: GitHub neověřen
- 03:44–52 stavy hostů neuloženy
- 03:54 členství Visitors ❓
- varianta B: tools/overeni-visitor.sh bez logu
- 03:72 OBO ppf-rooms bez odkazu na soubor
NOVÉ:
- 03:40–52 ❌: tabulka hostů (data přijetí, „není pozvaná“) bez značky a bez výstupu; uložit externalUserState
- 03:60 ⚠: „vše ✅ pod účastníkem“ × 08 (MFA přerušovaně, CLI pod účastníkem AADSTS65001); změkčit na „UI nasazení ✅“
- 03:38 × 07:35 🔀: 14 webů ❓ × ✅ P3
- 05:17 × 03:54 🔀: „hosté jen Visitors“ jako fakt
- 03:11 ⚠: Global Admin a vlastník Azure bez důkazu
- 03:37 ❓: /sites/arcade bez zdroje
- 03:12 ⚠: chybí konec BP+Copilot trialu 25. 11. 09:31 (jediná licence Copilotu, alice) a Agent 365

#### 04

VYŘEŠENO 17, ČÁSTEČNĚ 3, NEPLATÍ 1, NOVÉ 6. Řádek 60 (sjednocení se sondou PA) je VYŘEŠENO.
NEPLATÍ:
- ř.44 1. kola: „digi-podnety neexistuje“ byla chyba auditu; projekt existuje
ČÁSTEČNĚ:
- 04:25: odkaz „power-automate ř. 28“ je chybný (ř. 28 = Databáze)
- schválení API v UI ❓ (v Neověřeno, úkol pro ověřovatele)
- plán testů: Kit mimo PPF, host z EG.D a Windows ❓/⛔
NOVÉ:
- N1 04:113, 116, 119, 25 ⚠: chybná čísla řádků v odkazech; odkazovat na sekce
- N2 04:131 🔀: „OCR/vision přes PA neměřeno“, ale sonda má ✅ CU25; smazat a doplnit do 04:26, 74 (Document Intelligence zůstává ❓)
- N3 04:104 ⚠: budget 22,83 € × 06:30 22,96 €
- N4 04:57–62, 74–79 ⚠: Standard běhy PA jsou pod E5 trialem, který končí 25. 11.; připsat závislost
- N5 04:21: OBO ✅ je z PPF tenantu; označit jako u ř. 17
- N6 04:94 ⚠: „ACR ≈ 0,17 USD/den ✅“ je výpočet, ne měření; změnit na 📘

#### 05

VYŘEŠENO 11, ČÁSTEČNĚ 8, TRVÁ 2, NOVÉ 4.
TRVÁ:
- 05:53–54: skills-download.zip neotevřen
- 05:67: kolize Otruby, kalendář neověřen
ČÁSTEČNĚ:
- ř. 14: zdroj Adriánina „noty“
- test hosta neproveden
- Claude vs Copilot jen odkaz
- hledání odpovědi Adriáně nezapsáno
- Custom Script (N1)
- test 12 bez důkazu
- CLI 11/12
- nečtené zdroje
NOVÉ:
- 05:50 ❌: HTTP „409, příčina ❓“; správně 403 = licence ✅
- 05:38 ⚠: Custom Script „✅ změřeno v labu“, změřeno je v PPF tenantu; v egd labu ❓
- 05:48, 52 ⚠: Job a gateway ✅ bez odkazu na důkaz
- 05:24 ⚠: výdejní stránka „hotovo“ × „nesdílená“ v jedné buňce

#### 06

VYŘEŠENO 11, ČÁSTEČNĚ 3, TRVÁ 1, NOVÉ 3.
Agent ověřil živě: az group list (8 RG) a az resource list (49 zdrojů) souhlasí s ř. 64–73; freetier endDateTime 2027-11-27 ✅.
TRVÁ:
- 06:5, 60: odkaz na /tmp/inventar.md; má odkazovat na audit/inventura-azure-2026-11-22.md
ČÁSTEČNĚ:
- Postgres 0 € ❓
- po vypnutí B2 (viz N2)
- druhý tenant
NOVÉ:
- 06:101 ❌: cituje 07 „≈ 20 € s B1, ≈ 10 € bez plánu“; 07:43 má ≈ 23 €/měs. po B1 [P4] a variantu 10 € vyřadil
- 06:17 ⚠: promo je z ARM GET /subscriptions (azure-inventory.sh:116–118), ne z billing API
- 06:46, 56, 101 ⚠: základ 28,09 € v inventuře chybí, ta má 28,11 €

#### 10

VYŘEŠENO 13, ČÁSTEČNĚ 5, TRVÁ 1, NOVÉ 7.
TRVÁ:
- 10:39, 75: LibreOffice v Containeru „nepostaveno“ bez důvodu i postupu
ČÁSTEČNĚ:
- 10:37: práva na položky ❓ bez důvodu
- 10:86: chybí „příčina neznámá“ u 409
- 10:99: licence (viz N1)
- 10:120: ACR (viz N5)
- 2. kolo: 33, 93, 102 opraveny, ř. 99 ne
NOVÉ:
- N1 10:99 ⚠ (zjemněno mnou): „Premium ✅“ může být tier z katalogu (to je fakt), ale stav „flow se nezapnulo“ čte čtenář jako licenční; připsat „tier ✅, příčina blokace triggeru ❓“
- N2 10:85 ❌: „OCR/vision ❓“; sonda má ✅ CU25, ❓ jen u Document Intelligence
- N3 10:86 ⚠: u 409 chybí „příčina neznámá ❓“; odkaz „viz Neověřeno“ míří do neexistující sekce
- N4 10:32, 33, 35, 36, 49 ⚠: ✅ bez uloženého logu (sondy to samy přiznávají)
- N5 10:120, 131 ⚠: ACR 0,17 USD/den ✅ je z ceníku (správně odkaz ai.md ř. 281, ne 235); změnit na 📘
- N6 10:60 ⚠: ReadSecurity=1 „✅ funguje“ bez výhrady data-prava.md:77 o slabém důkazu
- N7 10:88, 90, 92, 145 ⚠: chybí ID neúspěšných běhů CU16, CU30, CU17 a termín 25. 11. pro přihlášení připojení

#### zadani

VYŘEŠENO 9, ČÁSTEČNĚ 1, NOVÉ 4.
ČÁSTEČNĚ/NOVÉ:
- _zadani:16 ❌: AADSTS65001 jako ✅ odkazuje na 03:14, kde je ❓ (výstup chyby chybí); spustit, uložit, nebo ❓
- _zadani:17 ⚠: APIM Consumption „✅ změřeno“, ai.md:183 přiznává, že výstup chybí; zadání tím porušuje vlastní pravidlo ř. 26
- _zadani:17 ⚠: billing account: existuje ✅, navázání/PAYG ❓
- _zadani:15 ⚠: chybí zmínka o konci E5 trialu 25. 11. a 23 z 25; stačí odkaz na 03:12

#### ai

VYŘEŠENO 14, ČÁSTEČNĚ 5, TRVÁ 2, NOVÉ 7.
TRVÁ:
- sondy/ai/dukazy/ neexistuje, všechna ✅ jsou bez uloženého výstupu; spustit tools/ai-gateway-chyby.sh, ai-gateway-probe.sh, apim-policy-test.sh a uložit
- server.mjs:146 komentář „role Gateway.Use“ (má být Gateway.App; změna kódu)
ČÁSTEČNĚ:
- appRoleAssignmentRequired
- Gateway.App client credentials netestováno (potřebuje PA i Job)
- 502 po nasazení
- schválení API v UI
- cena gpt-image-1
NOVÉ:
- ai:259, 262 ⚠: doporučení gpt-5-nano DataZone EU, měřen jen gpt-4.1-mini
- ai:158 ⚠: „(a)+(b) stačí“ stojí na ❓ (b)
- ai:296–300 ⚠: tabulka nástrojů nemá tools/ai-gateway-chyby.sh ani ai-appka-klik.mjs (i tools/README; hlavní session)
- ai:42 ⚠: „výstup neuložen“, ale behy.txt existuje
- ai:15 ⚠: chat 0,9 s × 1,2–1,7 s; rozlišit web part a probe
- ai:22 🔀: „nejkratší cesta je gateway“ × B2 bez serveru; doplnit srovnání B2 vs C

#### data-prava

VYŘEŠENO 6, ČÁSTEČNĚ 11, NOVÉ 9 problémů (+5 potvrzeno bez problému).
Agent znovu ověřil Azure: SQL free, autoPause 60, Paused; Container App min 0.
ČÁSTEČNĚ:
- egd-vibecoding README:92 „ManageLists jediná možnost“ neopraveno (cizí repo)
- cesta C bez api-matrix.jsonl
- studený start 7,8 s bez výstupu
- SQL resume neměřeno; DB je teď Paused, změřit hned jde
- ZadostiACL: schvalovatel ✅ se slabým důkazem
- ZadostiACL: zadavatel rozbil dědičnost, nevysvětleno
- příloha v prohlížeči ❓
- index nad prahem: jeden příkaz, nespuštěn
- kit vzor nespuštěn
- Dataverse cena/E5 ❓
- varianta D CU30 Failed
NOVÉ:
- N2 data-prava:16, 81 ❌: „✅ zadavatel nemůže rozdávat práva“ × ř. 78 (v ZadostiACL rozbil dědičnost, 200); omezit na Zadosti, ř. 78 změnit na ⚠
- N1 data-prava:15 ⚠: cesta C „✅ proběhlo“ bez „log neuložen“
- N3 data-prava:14 ⚠: „i přímé čtení souboru ✅“, v prohlížeči je to ❓
- N4 data-prava:12 ⚠: PnPjs v ✅ řádku, přitom neběželo
- N5 data-prava:20 ⚠: „stačí SharePoint“ zpřesnit na změřené scénáře
- N6 data-prava:179–184 ⚠: A ReadSecurity=1 ✅ se slabým důkazem → ⚠
- N8 data-prava:85 ⚠: „200 položek za 15,6 s“ v bulk.jsonl není
- N9 data-prava:96 ⚠: indexovaný filtr nad 5000 → 500, v threshold.jsonl není
- N14 data-prava:143 ⚠: app roles bez uloženého výstupu

#### dokumenty

VYŘEŠENO 11, ČÁSTEČNĚ 5, TRVÁ 3, NOVÉ 8.
TRVÁ:
- Files.Read → 403 neuloženo
- npm audit SheetJS neuložen
- údržba knihoven bez data (npm view time)
ČÁSTEČNĚ:
- log web partu
- log Graph PDF (302, CORS, doby)
- Global Admin × SharePoint admin nesjednoceno (SKILL.md:153)
- OneDrive Convert běh
- docxtemplater PPTX nezkoušen
NOVÉ:
- dokumenty:5, 15, 58, 61, 62 ⚠: ✅ HTTP/CORS/doby jen s plošnou omluvou; přepsat na „výstupní soubor ✅, běh ❓“
- dokumenty:65 ⚠: „oprávnění pro celý tenant“ bez 📘
- dokumenty:59, 65 ⚠: nezmiňuje konec E5 trialu 25. 11.; doměřit před ním
- dokumenty:88, 120 ⚠: patch pptxgenjs jen pro Heft 1.24.1 × toolchain E.ON gulp 1.18.2
- dokumenty:91 ⚠: „10 → 17 KB“ bez značky
- dokumenty:18 🔀: „Premium trial u Pavla“ × power-automate:83 (teprve se rozhoduje)
- dokumenty:77, 78 ⚠: 📘 jen v hlavičce, ne u buněk

#### napojeni

VYŘEŠENO 3, ČÁSTEČNĚ 7, TRVÁ 1, NOVÉ 5.
Agent znovu ověřil Job: `az containerapp job execution list` → 18:16 a 18:20 Succeeded; tvrzení platí.
ČÁSTEČNĚ: hlavně ✅ bez uloženého důkazu:
- CORS: ř. 33–38 bez ❓, cors-vysledek.json má jen ok/err
- Job: ř. 17, 58–62
- delegovaný sendMail: ř. 78–79
- stav připojení
- SPFx Mail.Send je 📘/❓
- HTTP Premium (viz N1)
- ACR (viz N2)
TRVÁ:
- skills/egd-maily/SKILL.md:32 a :72 uvádí jen AADSTS65001 (oprava je na miniskilly)
NOVÉ:
- napojeni:22, 89, 124, 137, 173 ❌: vestavěné HTTP „Premium jen 📘, 409 příčina nepotvrzena“ × 403 licence ✅ (diag-409); oddělit akci od Request triggeru
- napojeni:66, 127 ⚠: ACR 1,51 € je ppf-rooms za 30 dní a sonda ACR nepoužívá; nesedí s 0,17 USD/den z ai.md:281
- napojeni ⚠: ✅ bez souborů s důkazem; doplnit job execution list, graph-delegated a curl -i OPTIONS
- napojeni:181 ⚠: „haléře z 10 USD“ bez značky
- napojeni:136–137 ⚠: doporučení nezmiňuje konec E5 trialu 25. 11. 04:04 (demo B a delegovaný Mail.Send by zanikly před workshopem)

<a id="k2-07-lab-trial-plan-md"></a>
### `07-lab-trial-plan.md` (autor: lab-trial), 2. kolo 22. 11.

VYŘEŠENO 16, ČÁSTEČNĚ 5, NEPLATÍ 1, NOVÉ 8.
Agent ověřil živě:
- az webapp list: 8 aplikací, z toho 7 Running
- plan B2
- subscription Enabled, spendingLimit On
- budget 20 €
- Retail Prices: B2 23,58 €, B1 11,83 €
NEPLATÍ:
- ř.418 1. kola: --odebrat-licence (patří k lab-ucty-uklid.py, má ho)
ČÁSTEČNĚ:
- 07:72, 104 ⚠: „✅ pokus 22. 11., host narazí na MFA“ bez důkazu; přidat P7, nebo ❓
- 07:64, 100: Extend trial nezmiňuje tools/lab-profil-prihlaseni.mjs (Pavel se jednou přihlásí, agent čte headless)
- 07:35: „36 zasedaček ppfgate“ bez zdroje; 03:38 „14 webů ❓“ × 07 ✅
- 07:21, 109: citace staré verze 06
- budget (viz N2)
NOVÉ:
- N1 07:82 × 08:12 ❌: 07 E5 neodebírá (doběhne sama), 08 přehrává s --remove-sku SPE_E5 do 24. 11.; sjednotit
- N2 07:83 ⚠: budget „na 30 €“, dnes je 20 €; uvést stávající hodnotu a zdůvodnit
- N3 07:167–169 ⚠: „0 výskytů azurewebsites v ppf-rooms“ neplatí doslova (export_package.py:31, obecný regex); riziko výkonu 8 webapp na B1
- N4 07:43 ⚠: úspora z retail ceny × 35 € z Cost Management (B2 20,06 €); skutečná úspora ≈ 10 €, celkem ≈ 25 €
- N5 07:21, 109 ⚠: cituje starou verzi 06
- N6 07:50 ⚠: „25 licencí“ nového trialu bez značky
- N7 07:33, 66–68 ⚠: názvy produktů × skuPartNumber (Business Standard = O365_BUSINESS_PREMIUM)
- N8 03:38 × 07:35: na hlavní session

<a id="k2-08-ucty-ucastniku-md"></a>
### `08-ucty-ucastniku.md` (autor: lab-ucty), 2. kolo 22. 11.

Výsledek: VYŘEŠENO 8, ČÁSTEČNĚ 6, TRVÁ 2, NOVÉ 7.

Důkazy v `lab/dukazy/` sedí: weby 30/30, egd01/egd03 200/200 a cizí 403, kolekce `kody` pod view prázdná, vydání a uvolnění účtu, `subscribedSkus` a UI nasazení egd05 1.0.0.14. Sken 15 souborů nenašel hesla, tokeny ani kódy. `lab-ucty-licence.py --stav` (jen čtení) potvrdil E5 u egd01–10.

TRVÁ:
- veřejný odkaz výdejní stránky pro hosta (08:169)
- příčina registrace Authenticatoru (08:173)

ČÁSTEČNĚ:
- šifra 10/10 bez logu
- host `view` v db ❓
- CA: první běh 3/6 bez logu, diff politiky neuložen
- AADSTS65001 u egd01 bez logu
- výdej bez sloupce náročnosti
- host zápis do db

NOVÉ:
- tools/README.md ❌: chybí `tools/lab-ucty-ui-nasazeni.mjs` (`--help` funguje); doplní hlavní session
- 08:49–52 ⚠: ✅ AADSTS65001 u egd01 bez uloženého výstupu
- 08:60 ⚠: „pod pavel.admin CLI funguje (viz 03-lab)“, 03 to neukazuje; přidat důkaz, nebo ❓
- 08:70–71, 85, 160–163 ⚠: šifra 10/10 a lokální Playwright test bez logu
- 08:37–38, 150 ⚠: „zhruba každé druhé“ z n=6 (3/6, pak 6/6); přeformulovat na „občas“
- 08:34 ⚠: diff CA politiky neuložen
- 08:59 drobnost: uvést, že UI pokus byl s `eon-demo-statistiky`; „agent to neudělá sám“ × nástroj existuje

#### `07-lab-trial-plan.md`, 2. kolo, druhá iterace (22. 11.): uzavřeno

Všech 10 zbylých bodů je opraveno. Ověřil jsem je `rg` nad 07 a `--help` nástroje:
- E5 se neodebírá, nové SKU jde bez `--remove-sku` (ř. 82). Na lab-ucty zbývá upravit 08:12.
- P7 (ř. 193–200) je výstup `tools/lab-host-kontrola.mjs`: host `/` 200, `/sites/apps` 403. **Nový rozpor pro 03:** podle 03:54 jsou hosté v App catalog Visitors, P7 ale ukazuje 403 na `/sites/apps`.
- Budget zůstává 20 € (P4).
- Snížení plánu na B1 autor nově nedoporučuje. Opírá to o metriky plánu za 7 dní (P4 ř. 171–172): paměť průměr 49 %, max 75 % z 3,5 GB, B1 má 1,75 GB.
- 31 zasedaček `ppfgate_*` (ř. 174), citace 06 opraveny, „25 licencí“ má 📘/⛔, názvy SKU jsou jednoznačné.

Zbývá: `tools/lab-host-kontrola.mjs` chybí v `tools/README.md` (hlavní session).

<a id="k2-egd-pripravenost"></a>
### `skills/egd-pripravenost/*` (autor: test-pripravenost), 2. kolo 22. 11. (priorita: rozeslání Po 23. 11. 12:00)

Kontrolovalo 7 subagentů, každý jeden soubor nebo skupinu. Sám jsem ověřil časy (`stat`), chybějící `TEST-copilot.md` a shodu GUID šablon (`rg`).

| soubor | vyřešeno | částečně | trvá | neplatí | nové | verdikt agenta |
|---|---|---|---|---|---|---|
| SKILL.md | 6 | 13 | 5 | 0 | 10 | ano s výhradou |
| README.md | 5 | 7 | 7 | 1 | 9 | ano s výhradou |
| TEST.md + test-dukazy | 3 | 8 | 6 | 0 | 12 | **ne** |
| references/github.md | 2 | 7 | 12 | 0 | 12 | ano s výhradou |
| references/prihlaseni.md | 3 | 5 | 5 | 0 | 12 | ano s výhradou |
| references/windows.md | 3 | 5 | 4 | 0 | 11 | ano s výhradou |
| nové: zebrik, appka, ZADANI-appka, appka.mjs, templates | – | – | – | – | 14 | ano jen bez kroku „postav appku“ |
| **celkem** | **22** | **45** | **39** | **1** | **80** | |

**Blokátory před rozesláním (moje shrnutí):**
1. **Finální běh neproběhl na finální verzi.** Hlavička `finalni-beh.log` je z 20:27:32, `pripravenost.mjs` byl naposledy změněn ve 20:39:20 a soubory v `test-dukazy/` jsou kopie z 20:39:54. Běh je potřeba zopakovat.
2. **`TEST-copilot.md` neexistuje.** Podle kánonu skill není hotový, a Copilot je přitom jedna ze dvou cest instalace (README ř. 27–35, `/skills reload` nikdo neprošel). Buď test před 12:00 projít, nebo v README výslovně napsat „v Copilotu zatím neprošlo“. Rozhoduje hlavní session nebo Pavel.
3. **Kolize šablon.** `templates/spokojenost` v egd-pripravenost i v egd-prvni-appka mají stejné solution id `cd0c8675…`, feature `78066171…` a web part `1dac1a9d…`, ale jiný kód a jiné sloupce seznamu `Spokojenost` (Den × DenCislo+Klic). Na jednom webu se navzájem přepíšou. Ověřeno `rg`.
4. **„Postav appku“ ✅ bez logu.** V `test-dukazy` není žádný výstup `appka.mjs`. „Uživatel potvrdil“ odporuje TEST.md:58 („❌ nevyzkoušeno v prohlížeči“). ZADANI-appka slibuje „v jednom odpoledni“, ale pod egd01 CLI nejde a cestu A2 nikdo neprošel.
5. **❌ věty:**
   - SKILL:154 „`{"error"}` s kódem 0 ✅“: egd-prvni-appka to v labu vyvrátila (`test-dukazy/cli-chyba-rc0.txt`, rc vždy 1).
   - README:8 „jediný zápis je zkušební seznam“ neplatí, krok 7 zapisuje appku.
   - README:14 × 85: Node 18.
   - windows.md:21 × 7: shell.
   - github.md:15 odkazuje na neexistující „krok 6“.
6. **SKILL:84 „PSGallery nezastaví CLI ✅“** × 01:88 ❓. Věty pro IT žádají neověřené `AllSites.FullControl` (prihlaseni:48–54, skript:387).

#### skill

SKILL.md: VYŘEŠENO 6, ČÁSTEČNĚ 13, TRVÁ 5, NOVÉ 10. Rozeslat s výhradou.
TRVÁ:
- SKILL:84 „PSGallery nezastaví CLI ✅“ × 01:88 ❓
- SKILL:154 „{"error"} s kódem 0 ✅“ ❌; egd-prvni-appka to v labu VYVRÁTILA (test-dukazy/cli-chyba-rc0.txt: rc vždy 1)
- SKILL:80 a skript:613 věta „(Business)“
- SKILL:104–107 záložní cesty bez ❓
- SKILL:90 „m365 setup zakázán“ × skript:331 volá setup --skipApp
NOVÉ:
- TEST-copilot.md chybí ❌
- krok 5 bez MFA věty ⚠
- krok 5 nezmiňuje, že pod egd01 CLI nejde (A2/B) 🔀
- SKILL:100 22.14+/24/26 ✅ jen 22.23; skript:521 žádá jen 24/26 ⚠
- Node 18+ (skript) × CLI/SPFx ⚠
- README „Windows počítač“ bez „neověřeno“ ⚠
- aadsts-700016.out bez příkazu ⚠
- věty pro IT bez diakritiky ⚠

#### readme

README.md: VYŘEŠENO 5, ČÁSTEČNĚ 7, TRVÁ 7, NEPLATÍ 1, NOVÉ 9. Lze rozeslat s výhradou (opravit N2, N3, N4, N6).
Sám jsem ověřil `stat`: finální běh 20:27:32 (hlavička logu), skript naposledy změněn 20:39:20, logy zkopírovány 20:39:54. Běh tedy neproběhl na finální verzi. TEST-copilot.md neexistuje.
NOVÉ:
- N1 ❌: „finální verze“, běh je z 20:27, skript z 20:39; zopakovat, nebo uvést verzi
- N2 README:14 × 85 ❌: „Node 18 nestačí ✅“ × „běh na Node 22 i 18, CLI 12“; výstup z Node 18 neuložen
- N4 README:8 × 63 ❌: „jediný zápis je zkušební seznam“, krok 7 zapisuje appku, katalog a stránku
- N3 README:33–45 ⚠: PS příkazy jen prošly parserem; mkdir bez -Force; jen cesta .copilot
- N5 ⛔: chybí TEST-copilot.md
- N6 ⚠: Node 18+ v --help a SKILL:35 × 22.14+
- N7 ⚠: README nezmiňuje MFA/Authenticator ani AADSTS65001 v labu
- N8 ⚠: Copilot CLI na Windows chce PS 6+ ❓
- N9 ⚠: odkaz na zebrik.md pro Node
TRVÁ:
- 20–40 min neměřeno
- admin práva na Windows
- /skills reload
- Claude Code Windows cesta
- portable Node bez značky
- ITSM zdroj
- GitHub adresa

#### test

TEST.md: VYŘEŠENO 3, ČÁSTEČNĚ 8, TRVÁ 6, NOVÉ 12. Agent: NEROZESÍLAT kvůli N1 a N2.
- N1 ❌: finální běh 20:27:32 × skript 20:39:20 (ověřil jsem sám stat)
- N2 ❌: TEST-copilot.md neexistuje
- N11 ❌: instalace do .copilot\skills a /skills reload nikdo neprošel
- TRVÁ:
  - Node 18 a CLI 11: výstup chybí
  - Node <20 červená: výstup chybí
  - červená licence Copilota → věta pro IT: neověřeno
  - proxy žlutá: neověřeno
  - /skills reload: neověřeno
  - github --host s neexistujícím hostem: neověřeno
- ⚠:
  - počty zelených 31/30/29 se neshodují
  - „tři běhy 8–11 s“ bez logu
  - TEST.md:15 odkazuje na sitecatalogtest × egd01-dev
  - krok 5 předpokládá appId, které nikdo nemá
  - MFA věta je z labu
  - README:31 „Pavel je host“ (interní, matoucí)
  - appka „funguje“ jen ústně

#### github

references/github.md: VYŘEŠENO 2, ČÁSTEČNĚ 7, TRVÁ 12, NOVÉ 12. Lze rozeslat s výhradou: GitHub část označit jako neověřenou (Windows/PS 5.1, /login, VS Code pro GHE.com a Free limity nikdo neprošel).
TRVÁ:
- ř.49 /login 📘
- ř.17 managed účet bez značky
- ř.23 ITSM bez ⛔ a ServiceNow
- ř.31 Free agent/CLI 📘; přepis licence bez ⛔
- smí zaměstnanec účet: bez Adriány
- ř.38–44 VS Code GHE.com neověřeno
- ř.51 skill na Windows
- ř.63 Claude přes gh na ghe.com, klon nezkoušen (gh je přihlášen)
- ř.66–70 rychlý test nikdo neprošel ani na Macu
- ř.11–15 varianty bez IT/náročnosti
- ř.29 termín zálohy × test 24. 11. večer
NOVÉ:
- ř.15 ❌: odkaz „viz krok 6“ neexistuje (má být 4d)
- ř.50 ⚠: PS 5.1 bez ⛔ a postupu; chybí test po instalaci Copilot CLI; chybí Node 22.14+
- ř.36–44 ⚠: chybí žebřík github.com/GHE.com/GHES s „funguje?“
- ř.72 × SKILL 🔀: klíč github-test × copilot-licence
- ř.29 ⚠: záloha půjde ven neověřená (test až úterý večer)
- ⚠: chybí „co když SSO chce MFA“
- ⚠: ř.48, 59 verze 1.0.114 ✅ (ověřeno), jen uvést „ověřeno na“

#### prihlaseni


#### windows

references/windows.md: VYŘEŠENO 3, ČÁSTEČNĚ 5, TRVÁ 4, NOVÉ 11. Rozeslat s výhradou.
- ř.21 × 7 ❌: „bez shellu“ × „.cmd přes shell:true“; s shell:true se cesta s mezerou láme (Node 24 DEP0190)
- ř.11 ⚠: „✅ jen Node 18 portable“, skill Node 18 nepodporuje; portable Node 22 neměřeno
- ř.9 🔀: prihlaseni/sharepoint/zkouska ✅ jen pod správcem × 08 (egd01 AADSTS65001, MFA)
- ř.37–38, 45 ⚠: zip z Průzkumníku má dvojité zanoření; cesty node × node22; chybí test node -v ≥ 22.14
- ř.35–39 ⛔: chybí „co když“ (nodejs.org blokovaný, AppLocker/WDAC, zip z internetu)
- ř.41–46 ⚠: Copilot CLI chce PS 6+; co dělat při 5.1, chybí
- ř.27–32 ⚠: Get-Content PS 5.1 bez -Encoding UTF8; konzole cp852, ne cp1250
- ř.29, 31, 19 TRVÁ/⚠: 📘 bez zdroje
- ř.33–35 ⚠: %USERPROFILE% × $env:USERPROFILE
- ř.39 TRVÁ: Path bez admina bez ⛔/GPO

#### nove

Nové soubory (zebrik, appka, ZADANI-appka, appka.mjs, templates/spokojenost): NOVÉ 14 (4 ❌). Rozeslat jen s výhradou.
- appka.md:3, TEST.md:56–57, 73 ❌: „postav appku ✅“, v test-dukazy žádný log appka.mjs; „uživatel potvrdil“ × TEST.md:58 „❌ nevyzkoušeno v prohlížeči“
- templates/spokojenost ❌ (sám ověřeno rg): stejné solution id cd0c8675…, feature 78066171… a web part 1dac1a9d… jako egd-prvni-appka/templates/spokojenost, ale jiný kód i sloupce seznamu (Den × DenCislo+Klic); na jednom webu se přepíšou
- ZADANI-appka.md:46 ❌: „v labu i na DEV v jednom odpoledni“; pod egd01 CLI nejde (AADSTS65001), A2 nikdo neprošel, MFA
- appka.md:36–53 ⚠: A2 je jediná cesta pod egd01 a nikdo ji neprošel
- zebrik.md:35–37 ⚠: 700016 = endpoint žije, ne přihlášení; 700038 bez souboru; varianta 3 ✅ jen pod pavel.admin
- zebrik.md:14, 46–49 ⚠: Windows bez postupu ověření
- appka.mjs:5 „Node 18+“ × build chce 22.14+; appka.mjs:172 radí jen 24/26 ⚠
- appka.md:55 ?env=WebView ✅ bez důkazu; appka.md:56–63 limit 5000 bez odkazu ⚠
- TEST-copilot.md chybí ⛔

#### prihlaseni (doplněk)

references/prihlaseni.md: VYŘEŠENO 3, ČÁSTEČNĚ 5, TRVÁ 5, NOVÉ 12. Rozeslat s výhradou (N1, N4).
- N1 ⚠: věty pro IT (ř.48–54, skript:387) žádají AllSites.FullControl, ř.23 to vede jako neověřené
- N4 🔀: verze Node chybí; --help skriptu „Node 18+“
- N2/N3 ⚠: odkaz na lab/dukazy/cli-egd01-65001.log; význam 700016 a 700038
- N5–N7 ⚠: TOTP nouzově neprošlo; přeskočit nejde bez ✅ odkazu; „až ji Pavel vypne“ je interní věta v textu pro EG.D
- N8, N10 ⚠: žebřík bez testu „funguje?“/„co když ne“; m365 setup = zápis do Entra E.ON bez varování
- N9 ⛔: chybí Windows/PS 5.1
- TRVÁ: eonos bez zdroje 01:83; public client flows bez značky; „EG.D to už jednou udělala“ bez zdroje (01:86); varianty bez pro/proti; prohlížeč bez odkazu na UI egd05 ✅

#### Podklady 00–06, 10, sondy: 2. kolo, druhá iterace (22. 11.)

Ověřil jsem sám (`rg`, `ls`) všechny ❌ z první iterace:
- **PA 403/409:** opraveno v 00, 02, 04, 05, 10 a napojeni. HTTP akce je teď 403 licence ✅, 409 má jen Request trigger a Recurrence+HTTP ❓. 10:101–102 tier triggeru a akce rozlišuje.
- **OCR/vision přes PA ✅ (CU25):** opraveno v 04:32, 80, 121, 137.
- **data-prava:16:** omezeno na `Zadosti` (403), `ZadostiACL` je ❓.
- **02:38:** instalace z npm bez PSGallery je teď ❓.
- **_zadani:16:** AADSTS65001 je ❓ s odkazem na 03:14.
- **Nové důkazy existují:**
  - `audit/hoste-externalUserState-2026-11-22.json`
  - `audit/entra-skupiny-2026-11-22.json`
  - `sondy/napojeni/dukazy/{job-execution-list.json, curl-options.txt}`
  - `sondy/dokumenty/dukazy/{npm-audit.txt, npm-view-time.txt}`
- **Drobnost:** `job-execution-list.err` je prázdný (0 B). Lze smazat, nebo ponechat.

**Nový drift (❌):** 06:101 teď cituje 2. verzi 07 (retail 23,6/11,8 €, úspora ≈ 11,8 €, celkem ≈ 23 €). Mezitím ale vyšla 3. verze 07. Ta přepočítává z Cost Management (úspora ≈ 10 €, celkem ≈ 25 €) a hlavně **B1 nedoporučuje**: paměť plánu má průměr 49 % a maximum 75 % z 3,5 GB, B1 má jen 1,75 GB (07:43, 83, P4 ř. 171–172). 06:101 je potřeba přepsat na „B1 nestačí, viz 07“.

Zbytek (SQL, index, Files.Read 403, gateway probe, cesta C) je v `audit/pro-overovatele.md` jako úkol pro Ověřovatele. Má uvedený důvod, kánon tím splněn jako mezistav.

#### `08-ucty-ucastniku.md`, 2. kolo, druhá iterace (22. 11.): uzavřeno

Všech 8 bodů jsem ověřil sám (`ls`, `rg` v `lab/dukazy/`):
- E5 sjednoceno se 07: `--sku <nové>` bez `--remove-sku` (08:14).
- `cli-egd01-65001.log`: AADSTS65001, rc=1. Heslo je v logu nahrazené zástupným znakem.
- `cli-pavel-admin-deploy.log`: Deployed true, 1.0.0.9.
- `vydej-sifra-10x10.log`: správný kód 10/10, cizí kód odmítnut 10/10.
- `ca-mfa-vyjimka-diff.log`: změnilo se jen `excludeGroups`.
- Nový `koren-oprava-test.log`: oprava ověřená na `egd10-prod`. Na kořenovém webu čeká na Pavla.

Zbývají otevřené body s důvodem v Neověřeno: veřejný odkaz výdeje pro hosta, host do db, příčina Authenticatoru (čekají na Pavla). Na 08 už nic nečeká.

<a id="k2-overovatel"></a>
### Doměření od Ověřovatele sond (22. 11.)

Surové výstupy jsou v `sondy/overeni/` (README: tvrzení → příkaz → výstup → ✅/❌), opravy textu jdou redaktorovi přes `PRO-REDAKTORA.md`. Namátkou jsem prošel README §1–5. Na stav auditu to má tento dopad:

- **Visitor app catalogu:** jen čtení, má 200 a 403 na zápis i nahrání `.sppkg`, ✅ (`prava-visitor/*.tsv`). Hosté zůstávají ❓, protože nebyl k dispozici účet hosta z egd.cz. 07 P7 navíc ukazuje host ppf.cz `/sites/apps` 403.
- **Ověřovatel přepsal tato čísla v sondách:**
  - studený start gateway **30,1 s**, ne 26 s;
  - studený start API **19,2 s**, ne 7,8 s ❌;
  - probuzení SQL **33,3 s** ✅;
  - `appRoleAssignmentRequired` blokuje už vydání tokenu (**AADSTS50105**), nevrací 403 z gateway. Text sondy je potřeba opravit.
- **502 po nasazení:** nezopakovalo se. Na +0 s přišlo 503 z ingressu před startem repliky, od +30 s 200. „502“ v ai.md a v top 10 (riziko 9) přepsat na „~30 s po nasazení 503, pak OK“.
- **Doloženo uloženými výstupy, ✅:** Files.Read 403 / Files.Read.All 200, Graph PDF docx/xlsx/pptx, CORS preflight a probe, delegovaný sendMail, Job 37 s / 35 s, APIM Consumption odmítá token politiky. Výhrada auditu „✅ bez uloženého výstupu“ u ai, napojeni, dokumenty a data-prava C tím pro tyto body padá.
- **API access:** `permissionrequest approve` padá na serveru SharePointu. Zkoušely se tagy i tři tvary `resource`, chyba zůstala stejná. Funkční obejití přes Graph grant je ✅. UI schválení v admin centru je ❓, potřebuje Pavlovo přihlášení (MFA).
- **Zápisy Ověřovatele v labu** podle jeho README §1:
  - člen ve Visitors;
  - přiřazení role na SP gateway;
  - Entra app `egd-overeni-api` a 3 balíčky v tenant katalogu;
  - Container App `ca-egd-llm-gateway-t502` (min 0 replik);
  - řádky v `dbo.Zadost`.

  Nic se nemazalo, úklid (hlavně `t502`) čeká na Pavlovo ano.

#### `skills/egd-pripravenost/*`, 2. kolo, druhá iterace (22. 11. ~21 h): blokátory odstraněny

Ověřil jsem sám (`stat`, `rg`, `ls`):
1. **Finální běh na finální verzi ✅.** Skripty mají mtime 20:47:15, `finalni-beh.log` začíná 20:48:09 (hlavička uvádí i mtime skriptu), `appka-beh.log` 20:48:59. Přibyl `node18-beh.log`.
2. **`TEST-copilot.md` existuje** (20:51:48, 72 ř.). Má 5 běhů v Copilot CLI s důkazy v `audit/test-copilot/beh1…5`. Kánon „Claude i Copilot“ je tím splněný.
3. **Kolize šablon odstraněna.** Šablony obou skillů mají teď různé GUID. `appka.mjs novy` navíc dává každému projektu nové GUID (`crypto.randomUUID()`, ř. 180). V běhu vyšel web part `deaa3dc1-…`.
4. **„Postav appku“ má log:** `novy` → `build` → `seznam --ano` → `nasadit --ano` → `over`. Stránka `spokojenost.aspx` je SingleWebPartAppPage s web partem, v katalogu je `nasazeno true`. Vykreslení v prohlížeči zůstává jen ústní potvrzení, autor to tak uvádí.
5. **❌ věty opraveny:**
   - SKILL:154 má rc 1 ✅ se zdrojem;
   - README:8 vyjmenovává zápis appky;
   - README:74 říká, že Copilot test je zatím neukončen. Teď je potřeba to aktualizovat podle `TEST-copilot.md`.

**Verdikt pro rozeslání v Po 12:00: ano s výhradou.** V průvodním textu musí zaznít tři věci:
- Windows a PowerShell 5.1 nikdy neběžely;
- celý běh šel jen pod `pavel.admin`, účastnický účet neprošel;
- vykreslení appky v prohlížeči je potvrzené jen ústně.

Drobnosti k opravě:
- README:74 je teď v rozporu s existujícím `TEST-copilot.md`.
- `package-solution.json` šablony má `name` „prvni-appka-client-side-solution“. `appka.mjs` ho podle logu přepíše na `spokojenost-appka`, ale v šabloně mate.

<a id="k2-egd-data-seznamy"></a>
### `skills/egd-data-seznamy/SKILL.md` (autor: miniskilly), 2. kolo 22. 11.

VYŘEŠENO 12, ČÁSTEČNĚ 4, NOVÉ 10. Měření v `sondy/miniskilly/*.jsonl` tvrzení podpírají: Created desc 500, Modified a ID desc 200, AuthorId 6000 → 500, Člen 204 / Návštěvník 403, `Den ge` s indexem 200.

NOVÉ:
- **ř. 212 ❌:** odkaz na `TEST.md` a `TEST-copilot.md`, oba soubory neexistují (podle autora ještě běží).
- **ř. 14, 34, 143–175 🔀:** SKILL platí pro šablonu egd-prvni-appka (seznam `Spokojenost`, `Den` text). Šablona egd-pripravenost má `SpokojenostHodnoceni`, `DenCislo` a `Klic` s indexy od začátku. Napsat, pro kterou šablonu skill platí.
- **ř. 29, 34 ⚠:** „✅ e2e“ je appka Evidence (`Pozadavky`), ne Spokojenost.
- **ř. 177–181 ⚠:** „3000 hlasů“ a „přes 5000 u 55 dnů“ jsou dopočítané, měřeno bylo `$top=100`.
- **ř. 96, 217 ⚠:** Člen = Edit je změřený, ale role Zadavatel v egd-prava-role je Contribute. Ten `ManageLists` nemá (📘), ověřit.
- **ř. 120–126 ⛔:** REST `/FieldIndexes` 404 a nabídka sekundárního sloupce v UI bez záznamu.
- **ř. 108–113 ⚠:** Windows tvar příkazu nespuštěn.
- **ř. 116 ⚠:** index `Author` přes CLI bez záznamu.
- **ř. 53 ⚠:** Modified bez indexu je jen v `modified.txt`.
- **ř. 32 ⚠:** Dataverse „licence pro každého“ bez 📘.
- **`tools/README.md`:** chybí `miniskilly-indexy.py`, `miniskilly-naplnit-seznam.py` a `lab-spo-stranka.mjs` (`--help` mají). Doplní hlavní session.

ČÁSTEČNĚ: REST s tokenem místo appky (ř. 40), `_ctiVse` pro Spokojenost nespuštěn, běh celé appky Spokojenost chybí, Dataverse.

#### `skills/egd-pripravenost/*`, zmražená verze (22. 11. ~21:00)

Ověřil jsem sám:
- Interní zmínky o Pavlovi v textu pro EG.D zůstaly jen jako `pavel.admin` (název účtu v labu). To je v pořádku.
- SKILL:132 píše „✅ cesta A jen pod pavel.admin, pod egd01 ❓“.

**Výhrada ke zmražení:** `scripts/appka.mjs` má mtime 20:57:54, je tedy **novější** než `appka-beh.log` (20:48:59, zkopírováno 20:52:42). Změna je jen regex pro web bez katalogu (ř. 288, „nedá najít“). `node --check` projde (rc 0), ale znovu ji nikdo nespustil. Před rozesláním stačí spustit `appka.mjs over` na `egd09-dev` a `nasadit` (plán, bez `--ano`) na webu bez katalogu a výstup přidat do `test-dukazy/`. Jinak do TEST.md napsat, že běh je z verze před 20:57.

#### Kolize šablon prvni-appka × pripravenost: vyřešeno a ověřeno (22. 11. ~21 h)

Ověřil jsem sám (`rg`, `ls`):
- **GUID:** prvni-appka má nové GUID `5385b1dc…` a `6d8d18a0…`, pripravenost `ef7a3151…`. Navíc `novy` v obou skillech generuje GUID náhodně.
- **Stránka:** druhá kolize (stejná stránka `spokojenost.aspx`) je vyřešená, prvni-appka má teď `prvni-appka.aspx`.
- **Lab test na `/sites/egd-test-vedle-sebe`:**
  - `vedle-sebe-nasazeni.log`: oba balíčky nasazeno true (1.0.0.0 a 1.0.0.1).
  - `vedle-sebe-ui.log`: pod eva.vesela (Člen) se v obou appkách klik zapsal, 0 chyb v konzoli. Je to **první vykreslení appky v prohlížeči pod rolí Člen** s uloženým logem a screenshoty. Doplňuje tím ústní potvrzení v egd-pripravenost.

**Riziko pro egd-pripravenost (❓):** prvni-appka zaznamenala, že `spo app list --appCatalogScope sitecollection` na čerstvém webu jednou vrátil „…se nedá najít“ a o pár minut později prošel. Nová podmínka v `egd-pripravenost/scripts/appka.mjs:288` považuje přesně tuhle hlášku za „web nemá vlastní katalog“. Na čerstvém webu tak může dát falešnou červenou. Doporučení: v hlášce poradit „zkus za 5 minut znovu“, než odkáže na IT.

#### `egd-pripravenost`, doběh nad appka.mjs z 20:57:54 (22. 11. ~21 h)

Ověřeno `stat`, `rg` a `node --check`:
- Oba nové výstupy (20:59:36) jsou novější než `appka.mjs` a šablona (obě 20:57:54).
- `over`: rc 0, nasazeno.
- `nasadit` bez `--ano` na webu bez katalogu: rc 1 a věta pro IT. Rozpoznala se ale jen anglická hláška, česká „nedá najít“ ❓.
- Přejmenování na `spokojenost-appka`: šablona tento název používá všude (package.json, package-lock.json, package-solution.json). `novy` ho nahradí spolu s GUID (ř. 181) a substituce je konzistentní. `novy` po přejmenování ale nikdo nespustil ❓. Zápis se při něm nedělá (jen lokální projekt a npm ci), takže doporučuji jeden běh `novy` + `build` před rozesláním.

Dál otevřená: rada „katalog se může objevit až za pár minut“ v hlášce na ř. 288 (od prvni-appka) zatím doplněná není.

#### `egd-pripravenost`, poslední úpravy (22. 11. ~21:10)

Ověřeno sám (`rg`, `node --check` rc 0):
- Na ř. 288 je teď rada „u čerstvě založeného webu… zkus znovu za 5 minut“. Je to jen změna řetězce a běh po ní neproběhl. Riziko je nízké.
- **PRUVODNI-TEXT.md bod 3:** formulace „viděli jsme jen ve zkušebním tenantu pod účtem Člen“ odpovídá důkazu `egd-prvni-appka/test-dukazy/vedle-sebe-ui.log` (appka pripravenost, klik 2, potvrzeno, 0 chyb). Z pohledu kánonu je přesnější než „jen ústně“. **❌ Překlep, který mění smysl:** „Na vašem tenantu… to neověřeno není“ je dvojitý zápor a znamená „ověřeno je“. Správně má být „to ověřeno není“.
- `novy` + `build` po přejmenování šablony nikdo nespustil, log v `test-dukazy` chybí ❓.

**Oprava mého záznamu výše:** `vedle-sebe-ui.log` účet ani roli neuvádí. Skript `vedle-sebe-test.mjs` bere profil jako argument a do logu ho nepíše (ověřeno `rg`). Údaj „eva.vesela, Člen“ pochází jen ze zprávy autora prvni-appka. Rozhodnutí hlavní session: v textu zůstane „ve zkušebním tenantu“. „Pod účtem Člen“ se přidá, až autor doplní do logu účet a roli (např. výpis `whoami` / `EffectiveBasePermissions` pod tím profilem).

#### Uzavření bodů pripravenost a prvni-appka (22. 11. ~21:10, ověřeno audit-overeni)

- ✅ **`novy` + `build` po přejmenování šablony:** `skills/egd-pripravenost/test-dukazy/appka-novy-build-po-prejmenovani.log` (mtime 21:03) má dvakrát `rc=0` a `spokojenost-appka.sppkg` 12401 B. `scripts/appka.mjs` má mtime 21:00:08, log tedy vznikl na poslední verzi. Dodatek je v TEST.md ř. 91.
- ✅ **Rada „zkus to znovu za 5 minut“:** `scripts/appka.mjs:288`.
- ✅ **Dvojí zápor v PRUVODNI-TEXT.md:37:** opraveno na „to ověřeno není“.
- ✅ **„pod testovacím účtem role Člen“ smí zůstat.** `skills/egd-prvni-appka/test-dukazy/vedle-sebe-ucty.log`: `profil=eva.vesela`, UPN `eva.vesela@…`, skupina „Členové webu EGD test dvě appky vedle sebe“, permLow 1011030767, `adminKolekce:false`. Výhrada: role je změřená **dodatečně** (20:02 UTC, `kdo-jsem.mjs`), ne během UI běhu. Že se členství mezitím neměnilo, uvádí autor, z logu to nevyplývá. Pro další běhy je to vyřešené: `vedle-sebe-test.mjs:27–36` teď účet vypisuje sám.
- ✅ **Role Čtenář (bod z 1. kola, riziko 6, část Čtenář):** zuzana.kralova je v Návštěvnících (permLow 138612833, bez AddListItems). `ctenar-ui.log` ukazuje 403 při hlasování a dashboard viditelný. Hláška „Hlasovat nemůžete… o roli Člen (Member)“ je vidět na snímku `ctenar-lab/1b-zuzana.kralova-po-hlasu.png`. V logu je `zprava="-"` a `SELHALO: 1`, protože skript čeká úspěšný hlas. Pro Čtenáře je to očekávaný výsledek: pozor při čtení logu.
- ⏳ **Trvá u prvni-appka:** cesty A2 a B pod egd01 (čeká se na přihlášení profilu člověkem), test v Copilot CLI běží.

<a id="k2-egd-dokumenty"></a>
### `skills/egd-dokumenty/*` a `skills/egd-externi-api/*` (autor: ms-dokumenty), 2. kolo 22. 11.

**První iterace (~21:00, subagenti Sonnet, jen čtení, po jednom skillu):**
- `egd-dokumenty`: z položek 1. kola (ř. 1327–1367) je 15 vyřešených, 4 částečně, 0 trvá.
- `egd-externi-api` (ř. 1368–1410): 9 vyřešených, 2 částečně, 1 trvá.
- Úryvky `_ulozDokument`, `_word`, `_pptx`, `_pdfZWordu`, `_firma` a `_pocasi` se shodují s `sondy/ms-dokumenty/appka/.../EvidenceWebPart.ts` (diff).
- Ve skillech jsou žebřík variant a tabulky A/B/C s pro a proti.

Nálezy poslané autorovi:
- ❌ `egd-externi-api`: u HTTP v PA stálo „409, licence ❓“. To je rozpor s `sondy/power-automate/vystupy/diag-409.txt` ř. 10 a 15, kde je 403 `MissingAdequateQuotaPolicy`, tedy Premium ✅.
- ❌ `egd-dokumenty` ř. 226: „403 pár minut po přidání do skupiny ✅“ bez důkazu.
- ⚠ Dalších zhruba 12 drobností: pdffonts, výpis tieru, limit 2 MB, kdo schvaluje, skriptovaný klik, try/catch mimo web part, cena Jobu, `Invoke-WebRequest`, výstupy Copilota v `/var/folders`.

**Druhá iterace (~21:15), ověřeno mnou:**
- ✅ `egd-externi-api` ř. 35, 131: 403 `MissingAdequateQuotaPolicy` = Premium ✅ s odkazem na `diag-409.txt`. Ř. 163: 409 je samostatně v Neověřeno, příčina ❓. Rozpor je pryč.
- ✅ `pwsh-cors.log`: PowerShell 7.5.4, ARES `*`, ČNB 200 s prázdnou hlavičkou ACAO. To sedí s CORS blokem v prohlížeči. Windows PowerShell 5.1 je ❓.
- ✅ `pdffonts.log`: Roboto, CID TrueType, Identity-H, emb yes. `pdftotext` vrací češtinu správně.
- ✅ `pa-tier-word.log`: Word Online (Business) Premium.
- ✅ `prava-zpozdeni.log`: karolina.mala hned po přidání do Members uložila docx napoprvé (21:13:24). Dřívější 403 je teď ❓.
  - Výhrada: krok „před přidáním“ v logu ukazuje jen useknutý výstup chyby Node (`}` a verzi Node), ne HTTP kód. Tvrzení „před přidáním stránka nejde otevřít“ je proto doložené slabě.
- ✅ Výstupy Copilota jsou zkopírované do `sondy/ms-dokumenty/copilot/{dokumenty,externi-api}-sandbox/`.
- ⏳ Trvá: úryvky nejsou sladěné na šablonu Spokojenost. `sondy/ms-dokumenty/appka-spokojenost` se nestavěla, odloženo kvůli ENOSPC.
- ⏳ Trvá: u `egd-dokumenty` ověřil Copilot jen build, generování dokumentů v prohlížeči ne. Kánon „projde v obou“ je tím splněný jen částečně.

**Verdikt:** `egd-externi-api` uzavřen. `egd-dokumenty` uzavřen s výhradou: chybí build na šabloně Spokojenost a druhý scénář v Copilotu.
- ✅ **Výhrada (1) je doměřená (21:15).** `prava-zpozdeni.log`, konec: nečlen ondrej.horak dostane HTTP 200 přesměrováním na `_layouts/15/AccessDenied.aspx`, ne 401/403. Tím se vysvětluje timeout kliku. Zapsáno i v `egd-dokumenty/SKILL.md` ř. 229. Rozdíl ondrej.horak vs. karolina.mala je ekvivalentní stav (oba bez skupiny). Trvají výhrady (2) a (3).

<a id="k2-egd-llm-gateway"></a>
### `skills/egd-llm-gateway/SKILL.md` (autor: ms-llm), 2. kolo 22. 11.

Položky 1. kola (ř. 1401–1435): **VYŘEŠENO 17, ČÁSTEČNĚ 3, TRVÁ 3.** Subagent Sonnet, jen čtení.

Co je ověřené:
- SPFx 1.24.1 je v `sondy/ms-llm/spokojenost-ai/` i `prvni-appka/package.json`.
- Blok `ts` ve skillu se shoduje se `SpokojenostWebPart.ts` ř. 55–90. Liší se jen konstanty `<…>`.
- `_aiGet` a `/api/kvota` vrátily 200 za 163 ms (`e2e-spokojenost-3mb`).
- AADSTS65001 je doslova v `e2e-aadsts65001/klik.json`.
- 401 je v `e2e-401-jine-api`, 429 v `e2e-429`.
- Grant AllPrincipals je v `spfx-granty.json`.
- Žádost ze site catalogu: duplicitní nevznikne (`webapi-requests-list*.json`).
- B2 je ve skillu jako varianta s pro a proti.

| ř. SKILL | tvrzení | stav | co udělat |
|---|---|---|---|
| celý skill | `TEST-copilot.md` chybí | ⛔ | Podle kánonu skill není hotový. Spustit v Copilot CLI, až bude místo na disku. |
| 151 | po upgradu SharePoint 1–3 min servíruje starý bundle ✅ (`e2e-aadsts65001`: 2. pokus) | ❌ | `klik.json` má jediný pokus a jeden bundle. „1–3 min“ ani „2. pokus“ jsem nikde nenašel (ověřil jsem `rg`). `spfx-site-upgrade.sh --help` uvádí „~1 min“. Doložit, nebo dát ❓. |
| 216, tabulka chyb 156–164 | 502 po nasazení: „reprodukce vyžaduje nové nasazení“ | ❌ | Reprodukce už proběhla: `sondy/overeni/ai/502-opakovani-2026-11-22.log` ř. 11 ukazuje +0 s **503**, +30 s 200 a 502 se nezopakovalo (ověřil jsem). Přepsat na „po nasazení ~30 s 503 ✅, původní 502 ❓“, do tabulky chyb přidat 503 a do Ověření rozehřívací volání. |
| 219 | odkaz `sondy/power-automate.md` ř. 31 | ❌ | Ř. 31 je Word → PDF, „seznam jako fronta“ je na ř. 43 (ověřil jsem). |
| 62–64 | „přesně tento kód běžel v obou šablonách“ | ⚠ | `_aiGet` je jen ve Spokojenosti, Evidence ho nemá. Měřené bundly nemají archivovaný zdroj (dnes `GATEWAY_URL=''`). Uložit diff, nebo poznamenat, že se verze liší jen konstantami. |
| 158 | AADSTS65001 | ⚠ | `klik.json` uvádí jen profil `profil-tomas`, ne UPN ani `API_APP_ID` bez souhlasu. Doplnit. |
| 159 | `Failed to fetch` = gateway nemá CORS pro tenant | ⚠ | Vyvoláno z `example.com`, gateway CORS pro SharePoint má (preflight 200). Přeformulovat. |
| 140–141, 191 | studený start „po ~10 min klidu“, „~25 s“ | ⚠ | Dobu nečinnosti nikdo nezměřil (`ai.md` uvádí ~5 min a 30,1 s). Uvést: web part 24 a 28 s ✅, curl 30,1 s ✅, a „~25–30 s“. |
| 156–164 | „každý řádek vyvolán“ | ⚠ | 403 a 501 jen curlem, `Failed to fetch` jen z `example.com`. Doplnit sloupec „web part / curl“. |
| 196 | „Bez Azure… vůbec“ | ⚠ | Silnější než důkaz (A s licencí a B jsou ❓). Napsat „nic ověřeného nemáme“. |
| 206 | „řádově desítky USD měsíčně“ | ⚠ trvá | `ai.md` ř. 217–218 uvádí ≈35–300 USD jako odhad. Opravit. |
| 145 | „region EU“ | ⚠ trvá | Lab je Global Standard, DataZone EU je jen 📘. |
| — | varianty gateway (APIM, scope na appku) | 🔀 trvá | Doplnit 2 řádky, nebo odkaz na `ai.md` ř. 150–152. |

#### `egd-llm-gateway`, 2. kolo, druhá iterace (22. 11. ~21:40), ověřeno mnou

- ✅ Starý bundle: `sondy/ms-llm/bundle-propagace.md` ukazuje 3 upgrady. Pokaždé byl pokus 1 starý a pokus 2 ok: 12 s po nasazení (e2e-429), 17 s (e2e-simulace) a ~58 s (e2e-aadsts65001). Formulace „do ~1 min“ sedí.
- ✅ 503 po nasazení: SKILL ř. 153 a 169, tabulka chyb, odkaz na `502-opakovani` log. 502 je v Neověřeno (ř. 226).
- ✅ Odkaz na PA je opravený na ř. 43. Cena ≈35–300 USD je označená jako odhad (ř. 216). Global Standard / DataZone EU 📘 je na ř. 147. Sloupec „odkud vyvoláno“ je doplněný (ř. 161).
- ✅ Zdroje měřených verzí: `zdroje-verzi.md`, `zdroj-spokojenost.diff`, `zdroj-evidence-1.0.0.4.ts`.
- ⚠ ř. 142: „curlem 26 s ✅ (`sondy/ai.md`)“. `ai.md` ř. 145 ale říká, že 26 s je „původní opis“ a naměřeno bylo **30,1 s** (`overeni/ai/studeny-start-2026-11-22.txt`). Opravit na 30,1 s. Rozsah ~25–30 s platí dál.
- ⛔ Trvá: chybí `TEST-copilot.md`, blokuje to plný disk (build a npm jsou zakázané). Skill je hotový jen na straně Claude.

**Verdikt:** po opravě ř. 142 obsah uzavřen. Skill bude hotový podle kánonu až po testu v Copilot CLI.

<a id="k2-egd-prava-role"></a>
### `skills/egd-prava-role/*` (autor: ms-prava), 2. kolo 22. 11.

Položky 1. kola (ř. 1524–1562): **VYŘEŠENO 14, ČÁSTEČNĚ 4, TRVÁ 0.** Kontrolu dělal subagent Sonnet, jen čtení.

Ověřené body:
- **Bit 0x100.** Úryvek ve SKILL ř. 144–148 je 1:1 s `sondy/ms-prava/appka/.../EvidenceWebPart.ts` ř. 88–92. `.sppkg` je z této verze zdroje. `appka/03-eva.json` ukazuje „Ke schválení (2)“, `05-jakub-po.json` stav Schváleno.
- **Úrovně.** Low/High v `clen-test.jsonl` sedí se skillem. `urovne.json`: EGD Zadavatel = Přispívání, EGD Schvalovatel = Přispívání + 0x100.
- **Nastavení seznamu.** `ReadSecurity` 2/2/true.
- **Bez mazání.** `bez-mazani.jsonl`: upravit 204, smazat 403.
- **Člen webu.** Na úroveň, skupinu i dědičnost dostane 403.
- **Příloha cizí položky.** Vrací „Potřebujete přístup“.
- **Návrh jako varianta C.** Doložen v `navrh.jsonl`.
- **Rozpor s Evidence a `ApproveItems` 0x10 zmizel.** `skills/egd-prvni-appka/templates/` obsahuje jen `spokojenost`. `rg ApproveItems` ani `PRAVO_*` nic nenajde.
- **Karolina není globální admin.** Ověřil jsem sám přes `az rest` Graph: `roleManagement/directory/roleAssignments` pro její principalId vrací 0 přiřazení, `memberOf` ukazuje jen 4 skupiny, žádnou directoryRole. ✅

| ř. SKILL | tvrzení | stav | co udělat |
|---|---|---|---|
| 87–111 | varianta B (CLI) ✅ | ⚠ | `cli-varianta-2.log` ř. 1–6: úrovně EGD Zadavatel a Schvalovatel i obě skupiny „už existuje“ (ověřil jsem sám). `roledefinition add` u nich neběžel, přes CLI vznikla jen úroveň „bez mazání“. Buď doložit čerstvý běh na nových názvech, nebo dát ✅ jen té jedné úrovni. `--entraGroupIds` „Insufficient privileges“ nemá surový log. |
| 46–134 | žebřík A–D | 🔀 | Test „funguje?“ a „když ne“ má jen A krok 1. B, C a D test nemají. A a D nemají pro/proti ani „co chce IT E.ON“. Doplnit. |
| 165 | `ReadSecurity=1` + ACL ✅ | ⚠ | `sondy/data-prava.md` ř. 75 to vede jako ⚠ (`extras2.jsonl` ř. 28 = 404). Snížit na ⚠ a doplnit zjištění, že zadavatel rozbil dědičnost na své položce (200, ❓). |
| 133–136 | 5 účtů, eva schválí | ⚠ | `appka/*.json` mají jen `profil`, UPN chybí. Doplnit výpis UPN z `_spPageContextInfo` do `prava-appka-klik.mjs`. |
| 64–67 | A: „Odškrtni Odstranit položky“ | ⚠ | V UI to nikdo neprošel, úroveň vznikla přes CLI. Označit ❓, nebo prokliknout. |
| 9, 131–137 | navazuje na `_cti`/`_nacti` | ⚠ | Kód je v `sondy/ms-prava/prvni-appka`, účastník ho nemá. Dát úryvek do skillu, nebo cestu do kitu. |
| 155–156 | `@odata.nextLink` „změřila miniskilly“ | ⚠ | Důkaz je v `skills/egd-data-seznamy/TEST-copilot.md` ř. 39–43. Opravit odkaz. |
| 183 | Entra skupina 21:07–21:21 | ⚠ | `matrix-entra.jsonl` začíná 21:10. Sjednotit se `zjisteni.md`. Zopakovat po hodině, jinak trvá ❓. |
| 29–30 | samostatný seznam rozhodnutí | ⚠ | Jen ❓ a pár vět. Chybí pro/proti a „co chce IT“. |
| TEST-copilot | běh 2 (varianta B) | ⚠ | Copilot úroveň nezaložil, našel ji hotovou. Běhy jsou z 21:19–21:21, SKILL z 21:21:24, tedy starší verze. Přepisy obsahují cesty `/private/tmp/…`. Zopakovat na čerstvé úrovni s aktuálním skillem. |
| `02-skills-a-kit.md` ř. 18 | poznámka auditu „schvalovatel bez ApproveItems…“ | 🔀 | Po přechodu na 0x100 je zastaralá. Opraví hlavní session, sdílený soubor. |
- ✅ `02-skills-a-kit.md` ř. 18: hlavní session zastaralou poznámku o `ApproveItems` odstranila (ověřeno: `rg ApproveItems 02-skills-a-kit.md` nic nenajde).

#### `egd-prava-role`, 2. kolo, druhá iterace (22. 11. ~21:50)

Textové opravy jsem ověřil, všechny sedí:
- ✅ `cli-graph-prava.log` je surový log, „Insufficient privileges“ v něm je 2×.
- ✅ Žebřík má u variant A–D test „Funguje?“.
- ✅ `_cti` je přímo ve skillu (ř. 169–183).
- ✅ Odkaz na nextLink vede na `egd-data-seznamy/TEST-copilot.md` ř. 39–43.
- ✅ Tyto body jsou teď v Neověřeno: ACL, rozbitá dědičnost, odškrtnutí ve UI (ř. 224–232) a Zadavatel/Schvalovatel přes CLI.
- ✅ `prava-appka-klik.mjs:33` vypisuje UPN.

⏳ Na disk čekají běhy:
- čerstvé CLI s novými názvy úrovní;
- Copilot se zakládáním úrovně;
- proklik odškrtnutí;
- appka s UPN;
- skupina z Entra po hodině.

Varianta B je teď ✅ jen pro úroveň „bez mazání“, ostatní úrovně jsou ❓. To je poctivé. Obsah skillu proto uzavírám. Až běhy doběhnou, ověřím jejich logy.

#### `egd-prava-role`, 2. kolo, třetí iterace (22. 11. ~21:50), ověřeno mnou

- ✅ **Varianta B je teď bez výhrady.** V `sondy/ms-prava/cli-varianta-3.log` ř. 1–8 jsou čerstvé příkazy `roledefinition add` pro „EGD Zadavatel CLI2“ a „EGD Schvalovatel CLI2“, ani jednou „už existuje“. `cli-varianta-3-urovne.txt` ukazuje stejná čísla jako úrovně z UI: Low 1011028719 a 1011028975, High 432.
- ✅ **Chování pod uživateli** (`cli-varianta-3-mereni.jsonl`, 21:47):
  - jana a tomas přidají položku (201);
  - tomas má bit 0x3c4313ef s `CancelCheckout`, vidí obě položky a schválí cizí (204);
  - jana nevidí cizí položku.

  Poznámka: `recycle cizi` vrátilo 400, protože položku už předtím smazal krok `maze cizi`. Jde o pořadí kroků, ne o nález.
- ✅ **Skupina z Entra funguje s prodlevou.** V `matrix-entra-po.txt` má martina.cerna stránku 200, roli Schvalovatel a 2 položky. Do 21:21 měla 403. Autor uvádí, že dřívější 403 na stránku byla zčásti chyba kontroly v `tools/prava-role-over.py`. Délka prodlevy je tím pádem ❓, ověřená je jen horní mez, zhruba do 21:47.
- ⏳ Na disk (15 GB) čekají: běh Copilota se zakládáním úrovně, proklik odškrtnutí v UI a běh appky s UPN.

<a id="k2-egd-maily"></a>
### `skills/egd-maily/SKILL.md` (autor: ms-maily), 2. kolo 22. 11.

Položky 1. kola (ř. 1444–1481): **VYŘEŠENO 7, ČÁSTEČNĚ 7, TRVÁ 1.** Kontrolu dělal subagent Sonnet, jen čtení.

Ověřené body:
- **Kód `sendMail`:** shoduje se s `sondy/ms-maily/prvni-appka/.../EvidenceWebPart.ts:182-197`. Liší se jen komentář.
- **Velikost přílohy:** podle `limit-prilohy.log` prošlo 1–30 MB s odpovědí 202, 40 MB vrátilo 400 `ErrorMessageSizeExceeded`. Doručení je v `limit-prilohy-doruceni.log`.
- **Chybějící schválení:** vrací 403 `ErrorAccessDenied`. 65001 ani 65002 v SPFx nevznikly.
- **Odeslání za cizí osobu:** `ErrorSendAsDenied` je v `sendas.log` (ověřil jsem sám).
- **„Appka neposílá sama“:** skill to teď uvádí jako návrhové pravidlo.

| ř. SKILL | tvrzení | stav | co udělat |
|---|---|---|---|
| TEST-copilot | neproběhl (disk) | ⛔ | Podle kánonu skill není hotový. Spustit, až bude na disku 15 GB. |
| 119 | `/users/<schránka>/sendMail` → 403 „requires Mail.Send.All, Mail.Send.Shared“ ✅ | ❌ | `sendas.log` má jen Send As z `egd-report@` a `ErrorSendAsDenied` (ověřil jsem sám). Tuhle hlášku neobsahuje. Doložit, nebo dát ❓. |
| — | `po-schvaleni.png` | ❌ | Soubor je bajtově shodný s `bez-schvaleni.png` (md5 `d0762998…`, ověřil jsem sám), takže ukazuje 403. Úspěšný klik s 202 a `scp` s `Mail.Send` uložený není. Uložit log, nebo soubor přejmenovat. |
| 23–31 | schválení přes Graph grant | ⚠ | `grant-pred.txt` je stav před PATCH. Chybí PATCH 204, stav po něm a `consentType: AllPrincipals` (ř. 135). |
| 29 | InPrivate okno ✅ 202 | ⚠ | Změřené bylo jen smazání tokenů MSAL (`--novy-token`). InPrivate dát na ❓. |
| 52–66 | pořadí žebříku | ⚠ | `webApiPermissionRequests` je potřeba před nasazením. Krok 3 nemá, jak agent ověří, že žádost čeká (`permissionrequest list` vrací 403 a jeho výstup není uložený). |
| 22–33 | žebřík bez pro/proti a „co chce IT“ | 🔀 | Doplnit do žebříku, nebo odkázat na tabulku variant. |
| 82–85 | věta pro IT, cesta „API access“ | ⚠ trvá | Schválení v UI admin centra není ověřené. Je to v Neověřeno, ověří `pavel.admin`. |
| celý skill | delegované `sendMail` stojí na licenci s Exchange, E5 trial končí 25. 11. 04:04 | ⚠ | Doplnit poznámku o licenci účastníka. |
| `sondy/napojeni.md` ř. 15, 79–83; `02-skills-a-kit.md` ř. 21; `sondy/overeni/PRO-REDAKTORA.md` ř. 16, 56; `audit/pro-overovatele.md` ř. 87 | SPFx cesta „nezkoušena“, „do cca 3 MB“, „míchá 65001/65002“ | 🔀 | Zastaralé proti `sondy/ms-maily/README.md`. Opraví hlavní session nebo redaktor (sdílené soubory). |

<a id="k2-egd-planovane-ulohy"></a>
### `skills/egd-planovane-ulohy/SKILL.md` (autor: ms-maily), 2. kolo 22. 11.

Položky 1. kola (ř. 1482–1523): **VYŘEŠENO 20, ČÁSTEČNĚ 3, TRVÁ 0.** Kontrolu dělal subagent Sonnet, jen čtení.

Ověřené body:
- Cesta B (18 kroků) je projitá v UI. Snímky `klik-pa8`, `klik-pa50` a `klik-pa54` odpovídají textu skillu.
- `pa-flow-definice.json` obsahuje Recurrence → GetItems → `Table` → SendEmailV2.
- Úrovně konektorů v `pa-flow-tiers.log` sedí: SharePoint a Office 365 jsou Standard, `Table` je vestavěná akce.
- Export `.zip` menu nenabízí, dokládá to `klik-pa54.png`.
- Doporučení je podmíněné.
- Cron a cena Jobu jsou označené jako ❓.

| ř. SKILL | tvrzení | stav | co udělat |
|---|---|---|---|
| TEST-copilot | neproběhl (disk) | ⛔ | Podle kánonu skill není hotový. |
| 23, 36 | HTTP v B: „nejde zapnout (409), licence ❓“ | 🔀 | Rozlišit dva případy podle `diag-409.txt`. Button + HTTP vrací 403 `MissingAdequateQuotaPolicy`, takže licence Premium je ✅. Recurrence + HTTP (plánovaná varianta) a Request trigger vrací 409 a příčina je ❓. „Per-user nebo PAYG“ (ř. 36) označit 📘. |
| `pa-runs.log` | plánovaný běh Succeeded | ⚠ | Log ukazuje 2× Succeeded (19:38:56Z a 19:50:00.17Z, ověřil jsem sám). Typ triggeru v něm ale chybí. Že šlo o plánovaný běh, je odvozené jen z času přesně na minutu 19:50:00 a dočasná definice „20:50“ uložená není. Doplnit výstup `run-actions` s triggerem, nebo napsat „odvozeno z času“. |
| 103 | „registr ACR ✅ 1,51 EUR“ | ⚠ | Je to 30denní náklad cizího ACR `acrppfroomsca3lbgs` (`napojeni.md` ř. 66), ne cena pro EG.D. Přeformulovat. |
| 105 | `MaxNumberOfGlobalEnvironmentsInSubExceeded` ✅ | ⚠ | Chybí surový log, chyba je jen opsaná v `ai.md` ř. 108. Kvóta v E.ON je ❓ (`napojeni.md` ř. 133). |
| 9–29, 52 | B potřebuje licenci PA pro každého | ⚠ | Je to v napětí s „EG.D nechce licence pro každého“ (`sondy/power-automate.md` ř. 3). Uvést to. Platnost ✅ v labu stojí na E5 trialu do 25. 11. 04:04. |
| Galíkova věta | odkaz na `10-container-app.md` | ⚠ | Doplněk „pro každého uživatele / licence“ je až v `sondy/power-automate.md` ř. 3. Citovat obě místa. |
| 74 | příloha `prehled.html` | ⚠ | V labu se příloha jmenovala `prehled-pozadavku.html`. Sjednotit. |
| 47 | krok 5 „když ne: `mailto:`“ | ⚠ | Otevření Outlooku je ❓. |
| 78 | přepínač Enabled ✅ | ⚠ | Flow se zapínal přes API (`pa-flow.py start`). U přepínače v UI uvést, že je jen zobrazený. |
| `pa-mail-doruceny.log` | doručení | ⚠ | Doručení je v 19:38:59Z a 19:50:05Z. Příjemce plyne jen z hlavičky souboru, doplnit pole `komu:`. |
| 1495 (1. kolo) | strop 5000 a `Filter Query` | ⚠ | Na seznamu se 6000 položkami v labu to jde ověřit hned. Filtr `Stav eq 'Nový'` se nedal odlišit, protože všechny 3 položky měly stav Nový. |

#### `egd-maily` a `egd-planovane-ulohy`, 2. kolo, druhá iterace (22. 11. ~22 h), ověřeno mnou

Ověřené opravy:
- ✅ **maily ř. 119:** `sendas.log` ř. 7 obsahuje hlášku s `Mail.Send.Shared` (403).
- ✅ **Úspěšný klik:** `limit-prilohy.log` má 12× „Mail.Send v tokenu: true“. Chybný snímek `po-schvaleni.png` je v README přiznaný.
- ✅ **Grant:** `grant-po.txt` ukazuje `consentType: AllPrincipals`, scope s `Mail.Send` a opakovaný PATCH s odpovědí 204. Původní výstup PATCH se nezachoval, autor to přiznává.
- ✅ **`permissionrequest list`:** odpověď 403 je v `permissionrequest-list.log`.
- ✅ **Licence:** u maily ř. 120 je uvedeno, že `sendMail` potřebuje licenci s Exchange. E5 končí 25. 11. 03:04 UTC, což je totéž co 04:04 SEČ v jiných souborech, takže rozpor není.
- ✅ **planovane-ulohy ř. 23, 36:** HTTP je rozlišené. Kombinace Button + HTTP vrací 403 `MissingAdequateQuotaPolicy`, takže Premium je ✅. Recurrence/Request vrací 409 s příčinou ❓. Souhlasí to s `diag-409.txt`.
- ✅ **Doručení:** `pa-mail-doruceny.log` má pole „komu: Eva“.

⏳ Zbývá:
- Filtr a strop 5000 jsou v Neověřeno, odloženo kvůli disku.
- Plánovaný běh je „odvozený z času“, protože API typ spouštěče nevrací. Je to poctivě uvedené.
- **⛔ Test v Copilotu u obou skillů.** Obsah obou skillů uzavírám, ale hotové podle kánonu budou až po něm.

#### `egd-pripravenost` po uzavření: cesta A3, „Záchrana“ a nový skill `egd-recon` (23. 11. ~11 h), ověřeno mnou

Prošel jsem celé `sondy/rest-varianty/` (README, 7 logů, skripty), `references/appka.md` ř. 49–76 a 103, `SKILL.md` „Záchrana“, `references/zebrik.md` ř. 38, `TEST.md` ř. 93–99, celý `skills/egd-recon/` (`SKILL.md`, `scripts/recon.mjs`, `test-dukazy/`).

| místo | tvrzení | stav | důkaz / co udělat |
|---|---|---|---|
| `appka.md` ř. 53–55 | A3 ✅ pod správcem i `egd05` na nové appce: seznam + indexy, upload, Deploy, Install, stránka, vykreslení | ✅ | `rest-prohlizec-egd05-final.log`: čerstvé ID `515b8da2…` s `Deployed:false` → deploy 200, install 200, web part `79aee750…` v `GetClientSideWebParts`, stránka 201/200, render s otázkou; poslední řádek `PageLayoutType: SingleWebPartAppPage`. Seznam + indexy pod `egd05`: `rest-prohlizec-egd05-vlastnik.log` (`Indexed:true`, `Klic` unique). Výhrada: `egd05` má `IsSiteAdmin:true` (primární správce kolekce), takže „Vlastník“ = nejvyšší role na webu; Člen ❓ správně uveden |
| `appka.md` tabulka volání | volání pro seznam, pole, upload, Deploy/Install, stránku, rozložení | ✅ | každé volání má v logu 200/201; rozložení `rest-layout-egd05.log` (před `Article`, po `SingleWebPartAppPage`) |
| `appka.md` pasti | `Install` 400 u existující appky, `MERGE` 204 bez účinku, `savepage` 409 po `ValidateUpdateListItem` | ✅ | `rest-token.log` (400), `rest-prohlizec-egd05-vlastnik.log` (204, `Article` zpět), `rest-layout-egd05.log` (409) |
| `appka.md` ř. 76 | Graph zvládne seznam, sloupce, soubor, stránku, ne Deploy a Install | ⚠ | `graph.log` dokládá jen seznam + index/unikát a název knihovny; upload a stránka jsou jen v README („soubor existuje“), řádky `OK upload`/`OK stranka` v logu chybí. „Graph Deploy nemá“ je 📘 (README to tak značí), v `appka.md` bez značky → doplň 📘, nebo ulož výstup volání |
| README | `az` token → SPO 401, Graph přes `az` 403 | ⚠ | důkaz „příkaz v transkriptu“, výstup neuložen → ulož do `*.log` |
| `rest-prohlizec-egd05-final.log` | `ERR layout zpet` 404 „List 'Site Pages' does not exist“ | nit | skript je opraven na `GetList`, ale opravená verze po opravě neběžela; ověření rozložení stojí na samostatném posledním řádku logu. Stačí jeden běh čtení zpět, nebo věta v README, odkud poslední řádek je |
| `SKILL.md` „Záchrana“ + `egd-recon/SKILL.md` krok 2 | recon nabídnout u `AADSTS65001`; vrstva Entra „→ AADSTS65001“ | ❌ | `recon.mjs` ř. 48–51: bez přihlášeného CLI vypíše „CLI neni prihlasene… Konec.“ a skončí rc 1. `AADSTS65001` ale vzniká **při přihlášení**, takže v tom případě recon nic nediagnostikuje. Větev „aplikace nemá scope“ (ř. 59) nastane jen při úspěšném přihlášení s tokenem bez `AllSites.*`, a to není 65001. Oprava: u 65001 recon nenabízet (rovnou A3 / věta o souhlasu), nebo recon doplnit, aby při nepřihlášení vypsal větu o admin consent |
| `egd-recon/SKILL.md` konec | „Windows / PowerShell 5.“ | ❌ | soubor končí uprostřed věty (`od -c` na konec souboru) → dopsat |
| `egd-recon` „do katalogu můžeš nahrávat“ | podle bitů `AddListItems`/`EditListItems` v `EffectiveBasePermissions` | ⚠ | ověřeno jen pod správcem (všechny bity); bitová maska 📘 (`recon.mjs` ř. 9). Větve „chybí role“ / „chybí scope“ neběžely (autor uvádí ❓). Pro E.ON užitečné hlavně pod Členem → spustit pod `egd05` nebo jiným ne-adminem |
| `egd-recon` jen čte | žádný zápis | ✅ | `recon.mjs` volá jen `status`, `util accesstoken get`, `spo app list`, `spo list get`, `spo tenant appcatalogurl get`; zapisuje jen lokální `--out` |
| `zebrik.md` ř. 38, `TEST.md` ř. 97–99 | A3 ✅ správce + Vlastník, ❓ Člen, ⛔ E.ON | ✅ | v souladu s logy |

**Závěr:** A3 je doložená a nad rámec ověřeného nejde. Výjimkou je Graph (⚠, chybí uložený výstup). Sekce „Záchrana“ slibuje víc, než recon umí: u `AADSTS65001` skončí bez diagnózy (❌). `egd-recon/SKILL.md` je useknutý (❌). Copilot test po změnách SKILL.md ⛔ zatím chybí.

#### `egd-pripravenost` A3 + `egd-recon`, druhá iterace (23. 11. ~11:30), ověřeno mnou

| bod | stav | důkaz |
|---|---|---|
| ❌ recon u AADSTS65001 bez diagnózy | VYŘEŠENO ✅ | `recon.mjs` ř. 48–55: bez přihlášení vypíše větu o admin consent + roli a odkaz na A3/A2, rc 1; text v `test-dukazy/recon-bez-prihlaseni.out` se shoduje s kódem. `egd-recon/SKILL.md` ř. 22, 31 a `egd-pripravenost/SKILL.md` ř. 147 to popisují stejně |
| ❌ useknutý `egd-recon/SKILL.md` | VYŘEŠENO | konec „❓ Windows / PowerShell 5.1 neměřeno.“ + řádky 📘 a ⛔ |
| ⚠ Graph bez výstupu | VYŘEŠENO ✅ | `graph-stav-rest.log`: seznam `SpokojenostGraph`, `spokojenost-graph-sonda.sppkg` 12398 B v katalogu, `graph-sonda.aspx` (časy 09:35–09:36 Z). „Deploy/Install Graph nemá“ je v `appka.md` ř. 76 označeno 📘 |
| ⚠ az token jen „v transkriptu“ | VYŘEŠENO ✅ | `az-token.log`: SPO token `scp user_impersonation`, `_api/web` 401; Graph bez `Sites.*`, `/sites/…` 403 |
| ⚠ recon větve mimo správce | ČÁSTEČNĚ | `prava-katalog-ucty.md`: `eva.vesela` (Člen, `IsSiteAdmin false`) má v katalogu High 432 / Low 1011030767, tedy přidat i upravit ANO. Low je o 0x800 (ManageLists) vyšší než „Přispívání“ 1011028719, sedí na výchozí úroveň „Upravit“ skupiny Členové. **Nové zjištění:** Člen v labu do katalogu webu zapisovat smí. `Deploy` pod Členem ale neměřen ❓. Větev recon „chybí role“ nenastala ❓, `recon.mjs` pod ne-adminem neběžel (CLI → 65001); autor to uvádí |
| nit final.log | VYŘEŠENO | README ř. 36: poslední řádek je samostatný dotaz po opravě; „Vlastník“ = správce kolekce |

**Uzavírám** A3 i `egd-recon` co do obsahu. Zbývá ⛔ Copilot test po změnách `SKILL.md`, který má zadaný role test-copilot. Neověřené zůstávají `Deploy` pod Členem a Windows; obojí je ve skillu správně jako ❓.

#### `egd-pripravenost`, Copilot běh 7 (23. 11. ~12 h), ověřeno mnou

`TEST-copilot.md` „Dodatek 2“ a `audit/test-copilot/beh7/` (`log.txt`, `prepis.md`, `pripravenost-Test-Sedm.md`).

| bod | stav | důkaz |
|---|---|---|
| (a) nepřepisuje skill, (b) bez `egd-recon` ho nenabízí, (c) po zprávě nestaví appku | ✅ (podle záznamu autora) | v přepisu ke (b) ani (c) nic opačného není; `diff -r` sám neopakuji |
| zkouška zápisu se neprovedla | ⚠ správně uvedeno | `prepis.md` ř. 632: `zkouska` bez `--ano`; CLI přihlášené jako `pavel.admin`. Copilot odmítl zapsat za jiného uživatele, je to konzervativní, ne chyba skriptu |
| „Copilot nejspíš nepřesně četl, že `sit` vypsal tenant E.ON“ ❓ | **NEPLATÍ: Copilot měl pravdu, chyba je ve skriptu** ❌ | `prepis.md` ř. 316: `sit --tenant 972a674c…`; výstup ř. 327–328: `tenant egd.cz = b914a242…`, `eonos.sharepoint.com`. `pripravenost.mjs` ř. 227–248 (`cmdSit`): `--tenant` ani `--web` nečte, doménu bere z `--domena` (výchozí `egd.cz`), host z `--host` (výchozí `eonos.sharepoint.com`, v nápovědě ř. 637 chybí) a **přepíše `state.tenantId`** tenantem E.ON (ř. 235) |

**Dopad:** v E.ON jsou výchozí hodnoty správné, takže účastníkovi to neublíží. V labu a v testech ale `sit` měří tenant E.ON místo labu a do stavu uloží tenant E.ON. Následné příkazy bez `--tenant` by pak cílily na E.ON (`opts.tenant || state.tenantId`). **Návrh:** `sit` ať bere tenant z `--tenant` (OIDC jde i s GUID) a host z `--web` / `state.web`, `state.tenantId` při zadaném `--tenant` nepřepisovat, `--host` doplnit do nápovědy. Pak ověřit během `sit --tenant <lab> --web <lab web>`.

#### `egd-pripravenost`, oprava `sit` (23. 11. ~12:30), ověřeno mnou včetně vlastního běhu

| bod | stav | důkaz |
|---|---|---|
| ❌ `sit` ignoruje `--tenant`/`--web`, přepisuje `state.tenantId` | **VYŘEŠENO** ✅ | `pripravenost.mjs` (mtime 10:56) `cmdSit`: tenant `--tenant` > `--domena` > `egd.cz`, host `--host` > `--web` > `state.web` > eonos, `state.tenantId` se přepisuje jen bez `--tenant`; nápověda ř. 640. **Vlastní běh** (scratchpad, jen čtení OIDC + anonymní GET): `sit --tenant pavelchocholousgmail.onmicrosoft.com --web …/egd05-dev` vrátil `= 972a674c…` a `pavelchocholousgmail.sharepoint.com` (403), rc 0, stav `tenantId:null`. `sit` bez voleb vrátil E.ON `b914a242…`/eonos a uložil tenant E.ON. Odpovídá `test-dukazy/sit-tenant-web.out` |
| celý běh nad opravenou verzí | ✅ | `test-dukazy/finalni-beh-2.log`: 24× ZELENA, žluté jen `github-hosty` a `vscode-copilot`, 0 červených; `zkouska` rc 10 (plán), ostatní rc 0 |
| Copilot | ⚠ | běh 7 proběhl nad verzí před opravou. Změna je jen v `cmdSit` a v nápovědě. Podle kánonu doporučuji krátký běh Copilota s `sit --tenant <lab> --web <lab>`, nebo výslovně zapsat, že na změnu stačí běh 7 + `finalni-beh-2.log` |
| nit | — | při zadaném `--tenant` zůstane ve stavu `tenantId:null`, takže pozdější příkaz bez `--tenant` spadne na E.ON. Funguje to podle návrhu, jen ať o tom skill ví (vždy předávat `--tenant`) |

**`egd-pripravenost` uzavírám.** Otevřené zůstávají jen známé ❓: Deploy pod Členem, recon pod ne-adminem, Windows/PS 5.1, E.ON, VS Code Agent, a k tomu volitelný krátký Copilot běh po opravě `sit`.

#### Schválení API access v UI admin centra (riziko 8), měření Ověřovatele 23. 11., zkontrolováno mnou

`sondy/overeni/README.md` oddíl 2, `sondy/overeni/api-access/ui/` (3 PNG).

| tvrzení | stav | důkaz / co udělat |
|---|---|---|
| UI ukáže 4 pending, Approve → panel „Approve access“ (Test.Read, `egd-overeni-apiaccess`, 0.1.1.0) | ✅ | `api-approve1.png`: Pending (4), Approved (61), panel s Approve |
| po kliku řádek zmizí (Pending 3) | ✅ | `api-approve2.png`: Pending (3), Approved (61), řádek `4a212388…` chybí |
| **po novém načtení zase Pending (4), Approved 61 → nepersistuje ❌** | ⚠ **bez důkazu** | `api-approve4.png` má **stejné md5 jako `api-approve2.png`** (`cd040172…`), tedy jde o kopii stavu po kliku, ne o snímek po reloadu. Všechny 3 soubory mají stejný mtime 10:59:28. Klíčový stav, ze kterého plyne ❌, tak uložený není. Zároveň chybí síťová odpověď na Approve. → uložit snímek po reloadu (nebo výstup `tools/overeni-api-access.py list`) a ideálně HAR/odpověď volání Approve |
| můj pokus o nezávislé přečtení stavu | ⛔ | `tools/overeni-api-access.py list` padá na `contextinfo` (prázdná odpověď). `m365 util accesstoken get --resource https://pavelchocholousgmail-admin.sharepoint.com` chce nové přihlášení přes device code, a to dělá člověk |

**Dopad na podklady (❌ rozpor, pokud se měření potvrdí):** UI cesta je dosud uvedená jako ❓ „nezkoušeno / neověřeno“ v `skills/egd-maily/SKILL.md` ř. 53 a 152, `skills/egd-llm-gateway/SKILL.md` ř. 222, `skills/egd-dokumenty/SKILL.md` ř. 260, `sondy/napojeni.md` ř. 15, 80 a 171 a v `10-container-app.md` ř. 121 a 143. `04` ř. 135 už má ❌. Po doložení reloadu přepsat na „UI Approve v labu nepersistuje ❌, funkční je jen Graph grant ✅“ a do tabulek variant doplnit pro a proti (Graph grant potřebuje Global Admina v `az`).

#### API access UI, 2. měření Ověřovatele (`api-access/ui-3/`, 23. 11. 11:05), zkontrolováno mnou

| tvrzení | stav | důkaz |
|---|---|---|
| před 4/61 → po kliku 3/61 → po reloadu 4/61 | ✅ | `pocty.txt`; `po-reloadu.png` má jiné md5 (`7d4bb9ae…`) než snímky po kliku (`cd040172…`, ty jsou mezi sebou shodné) |
| klik Approve pošle jediný `POST …/PermissionRequests('a58056ee…')/Deny` → 403 `UnauthorizedAccessException`, volání Approve ani zápis grantu tam nejsou | ✅ | `sitove-odpovedi.json` [62] (10:05:13); v okně [43–97] jsou jen GET dotazy na Graph `oAuth2Permissiongrants`/`servicePrincipals`, žádný POST grantu |
| načtení stránky pošle 11× `Deny`, vše 403 | ✅ | [32–42] a [98–112] |
| **závěr „UI Approve v labu nepersistuje ❌“** | ⚠ **dva rušivé vlivy, závěr zatím nepřenášet do skillů** | (1) **Účet:** všech 20 identit v síťovém záznamu je `pavel.chocholous_gmail.com#ext#` (hostovský účet z gmailu). `pavel.admin@…` se v záznamu nevyskytuje, přestože profil se jmenuje `pavel.admin` a README uvádí „pod `pavel.admin`“. 403 na `SPOWebAppServicePrincipal` tak může být právem hosta. (2) **Scope už byl schválený:** `Test.Read` pro API `4a212388…` (SP `6cd0dea2…`) dostal grant už 22. 11. přes Graph (`api-access/16-graph-grant-testovaci-api.log`). UI pak nejspíš nic neuděluje a žádost jen odstraňuje (`Deny`). Totéž dělá při načtení s dalšími 11 žádostmi. Měření tedy ukazuje „UI nesmaže žádost u už uděleného scope pod hostovským účtem“, ne „Approve nefunguje“ |

**Co doměřit:** přihlásit profil skutečně jako `pavel.admin@pavelchocholousgmail.onmicrosoft.com` (kontrola: identita v síťovém záznamu) a schvalovat žádost o scope, který ještě grant **nemá** (nový scope v `egd-overeni-api`, nebo nový balíček). Do té doby u skillů ponechat ❓ „UI schválení neověřeno“ s poznámkou „pod hostem a u už uděleného scope 403“.

- **23. 11. ~11:30, redaktor:** UI approve vráceno na ❓ s poznámkou (host `#ext#`, už udělený scope, Deny 403, `ui-3`). Ověřeno mnou `rg`: `04` ř. 135, `sondy/ai.md` ř. 179 a 251, `audit/pro-overovatele.md` ř. 32 a 132. ✅ Přepis `napojeni` 15/80/171 a `10` ř. 121/143 čeká na opakované měření Ověřovatele pod `pavel.admin` s novým scope.

#### `egd-data-seznamy`, 2. kolo, druhá iterace (23. 11. ~11:30), ověřeno mnou

| bod 2. kola | stav | důkaz |
|---|---|---|
| ř. 212 ❌ chybí `TEST.md` | **VYŘEŠENO** | `TEST.md` (59 ř.) existuje. E2E v Claude (subagent Sonnet): index `Den`, `_ctiVse`, filtr `Den ge`, graf na 30 dní, build, nasazení, appka v prohlížeči a hlas |
| E2E: graf má data ve všech 30 dnech (čte všechny stránky) | ✅ | `sondy/miniskilly/ui/15-claude-30dni.png`: sloupce 25.–22. všechny s průměrem, 23. prázdný. `claude-e2e/SpokojenostWebPart.ts` ř. 76–79 čte `@odata.nextLink ?? odata.nextLink`. `nasadit.log`: deploy, instalace, `SingleWebPartAppPage`, čtení zpět. Argument „1. stránka = ~10 dní“ odpovídá ~100 hlasům/den |
| E2E: hlas se zapsal | ✅ (podle záznamu autora) | `ui/16-claude-30dni-hlas.png` |
| E2E: 2801 hlasů ve 3 stránkách (1000+1000+801), před během `Indexed:false` a `Den ge` → 500, pak `spo field set` → `Indexed:true` | ⚠ **bez uloženého výstupu** | v `claude-e2e/` je jen build, plán, nasazení, diff a kód; výstup curl ani `spo field get/set` tam není. Ulož ho (stačí přepis z běhu), nebo v TEST.md uveď „z přepisu, neuloženo“ |
| ř. 12–14 🔀 pro kterou šablonu | **VYŘEŠENO** | SKILL ř. 12–14 |
| ř. 29, 34 ⚠ e2e Evidence × Spokojenost | **VYŘEŠENO** | ř. 34 odkazuje na e2e Spokojenost (TEST.md, TEST-copilot.md) |
| ř. 96, 217 ⚠ Contribute a `ManageLists` | **VYŘEŠENO** ✅ | `k2.jsonl`: dočasné Contribute přidá položku 201, index 403 `UnauthorizedAccessException`, Contribute odebráno. SKILL ř. 105–107 |
| ř. 116 ⚠ index `Author` přes CLI | **VYŘEŠENO** ✅ | `k2.jsonl`: `--Indexed true` rc 0 za 5,2 s → `po:true`, `false` za 7,7 s → `po:false` |
| ř. 53 ⚠ Modified | **VYŘEŠENO** ✅ | `k2.jsonl`: `Modified` `Indexed:true`, `Created` `false` na IndexTest i Pozadavky. SKILL ř. 54 to tak popisuje |
| ř. 120–126 ⛔ `/FieldIndexes` 404, sekundární sloupec v UI | **VYŘEŠENO** ✅ | `k2.jsonl` (2× 404), `ui/13-editindex-sekundarni.png`, `editindex-formy.txt` |
| ř. 108–113 ⚠ Windows tvar | ČÁSTEČNĚ (poctivě v „Neověřeno“) | SKILL ř. 120–121, 269–271 |
| ř. 32 ⚠ Dataverse bez 📘 | **VYŘEŠENO** | ř. 37 ❓, ř. 272 📘 |
| ř. 177–181 ⚠ 3000/5000 dopočítané | (nekontroloval jsem znovu řádky) | — |
| **NOVÉ ⚠ ř. 44–45** „500 `SPQueryThrottledException` v běžící appce potvrzeno e2e v TEST.md“ | ⚠ | TEST.md uvádí 500 jen u REST dotazu **před** během (bez uloženého výstupu). Appka v prohlížeči chybu nad limitem neukázala, protože 30 dní je pod limitem a TEST.md to sám říká. Oprav na „REST měřeno, v appce neukázáno“, nebo ulož snímek appky nad limitem (např. období 60 dní) |
| poznámka | — | E2E nasazovalo pod `pavel.admin` (`plan.log`), ne pod účtem účastníka. Pro tento skill to nevadí, role pro index jsou změřené zvlášť |

**Závěr:** obsah skillu uzavírám až na dvě ⚠ (neuložený výstup E2E: index a 2801/3 stránky; ř. 44–45 přeceňuje e2e). Copilot je hotový (`TEST-copilot.md`, 1. kolo). Kánon „Claude i Copilot“ je splněn.

#### `egd-prava-role`, zbylé body 2. kola + Copilot běh 3 (23. 11. ~11:30), ověřeno mnou

| bod | stav | důkaz |
|---|---|---|
| Copilot běh 3: Copilot sám založil úrovně „Nákupy …“ a skupiny, rozbil dědění a nastavil `ReadSecurity/WriteSecurity 2` | ✅ | `copilot/beh3-overeni.txt`: `HasUniqueRoleAssignments:true`, RS/WS 2, Low 1011028719 a 1011028967. `beh3-prepis.md` čte `egd-prava-role` (3×) |
| ověření pod skutečnými účty | ✅ | `beh3-bez-mazani.jsonl`: tomas MERGE cizí 204; smazat cizí, smazat svou i recycle 403; bity `0x3c4313e7` (= 1011028967), `DeleteListItems:false`, `CancelCheckout:true`; jana vidí jen svou položku |
| verze skillu pro běh | ⚠ nelze zpětně porovnat | `beh3-skill-sha256.txt` = `0eecc6ff…`, dnešní SKILL.md = `c355c637…` (mtime 11:12). Rozdíl podle autora tvoří jen značky ✅ a nová past. Kopie verze z běhu chybí, takže diff nejde udělat. Pro příště ukládat i kopii `SKILL.md` z běhu |
| nová past `--output none` | ✅ | `zjisteni.md` ř. 92, SKILL ř. 110–112. V přepisu běhu 3 (ř. 1804) chybí ve 4. příkazu řetězu `--listTitle` a vše jede s `--output none`; oprava je na ř. 2263. Odpovídá popisu. Že varování Copilotu pomůže, se neověřovalo (bylo přidáno po běhu), riziko nízké |
| UI: odškrtnout „Odstranit položky“ | ✅ | `ui/40-*.log` (`copyrole.aspx`, `unchecklabel:Odstranit položky`), `ui/41-urovne.json`: „EGD Schvalovatel UI bez mazání“ Low 1011028967 = CLI i Copilot |
| UI: skupina s úrovní Čtení | ✅ | `ui/42-skupina-cteni.log` (`newgrp.aspx` → Čtení → Vytvořit), `42-roleassignments.json`: `UI Test Čtení` → [Čtení] |
| UI: Odebrat uživatele ze skupiny | ✅ | `ui/43-odebrat-sebe.log` („Chcete tyto členy odebrat?“), `43-clenove-po.json` = `[]` |
| appka vypisuje UPN | ✅ | `appka/09-upn-*.json` (5 účtů), např. eva.vesela: UPN, role Schvalovatel, záložky |

**`egd-prava-role` uzavírám:** obsah ✅, Claude ✅, Copilot ✅ (běh 3). Zbylé ❓ jsou v sekci Neověřeno, každá s důvodem.
- **Doplnění 23. 11. ~11:45:** ⚠ k verzi skillu je vyřešená. `sondy/ms-prava/copilot/beh3-SKILL.md` má SHA `0eecc6ff…` = hodnota zapsaná při běhu (přepočítal jsem). Můj vlastní `diff` proti dnešnímu SKILL.md ukazuje jen datum, značky ✅ s důkazy u tří UI kroků (text kroků stejný), past `--output none` a 3 řádky vyřazené z Neověřeno. Kroky postupu se nezměnily, běh 3 tedy platí pro dnešní verzi.
- **Uzavření `egd-data-seznamy`, 23. 11. ~11:50, ověřeno mnou:**
  - (1) `claude-e2e/overeni-z-prepisu.txt`: `Indexed:false` → `spo field set` rc 0 → `Indexed:true`, 500 `SPQueryThrottledException` bez indexu, stránky 1000+1000+801 = 2801, ItemCount 6001. Zdrojový přepis subagenta existuje a `TOTAL=2801` i `page 3: 801` v něm jsou (`rg`).
  - (2) `appka-bez-indexu.jsonl`: index off 204 (11:13:50) → 500 → snímek → on 204 (11:14:13) → 200. `ui/17-claude-bez-indexu-500.png` (mtime 11:14, tedy mezi vypnutím a zapnutím) ukazuje v běžící appce hlášku „Seznam je moc velký pro tenhle dotaz…“ a prázdný graf. SKILL ř. 44–46 odkazuje správně.
  - **Skill uzavírám:** obsah ✅, Claude ✅, Copilot ✅.

#### `egd-llm-gateway`, Copilot test a 1.0.0.3 (23. 11. ~12 h), ověřeno mnou

| bod | stav | důkaz |
|---|---|---|
| Copilot načetl skill a sám napsal `_ai`/`_shrn`/`_ocr`, appku postavil a nasadil | ✅ | `copilot-prepis/log.txt` ř. 4 `● skill(egd-llm-gateway)`, `zdroj-SpokojenostWebPart.diff`, `README-copilota.md` |
| klik pod tomas.prochazka: chat i OCR 200, Bearer a `X-App-Id: demo` | ✅ | `e2e-copilot/klik.json`: stránka `spokojenost-ai-copilot`, shrnutí 1474 ms, OCR `ocr-cs.pdf` 2429 ms s celou českou diakritikou, POST `/api/chat` 200, Bearer, `xAppId: demo` |
| appka 1.0.0.3 zpět na gateway | ✅ | `e2e-1.0.0.3/klik.json`: chat, OCR i kvóta 200. Shrnutí 30 291 ms (studený start) odpovídá ř. 142 „~25–30 s“ |
| „stav grantu z CLI nezjistíš“ | ✅ | `grant-overeni-cli.txt`: `entra enterpriseapp get` → „Insufficient privileges“ pod pavel.admin. SKILL ř. 187–189 |
| nit ř. 142 26 s → 30,1 s (z dřívějška) | **VYŘEŠENO** | ř. 142 „curlem 30,1 s ✅ … ~25–30 s“ |
| ř. 229 schválení v UI admin centra | ❓ správně | nové měření Ověřovatele (`sondy/overeni/api-access/ui-3`) běželo pod hostem `#ext#` nad už uděleným scope. Až bude měření pod `pavel.admin`, přidat ho sem |
| poznámka | — | `Gateway.Use` byl v tenantu už udělený, takže Copilot cestu „žádost → schválení“ neprošel. Skill to v TEST-copilot.md uvádí |

**`egd-llm-gateway` uzavírám:** obsah ✅, Claude ✅, Copilot ✅. Zbývá jen ❓ schválení v UI (společné s maily a dokumenty).

#### API access UI, 3. měření Ověřovatele (`api-access/ui-4/`, 23. 11. 11:21), ověřeno mnou: **UI Approve funguje ✅**

| tvrzení | stav | důkaz |
|---|---|---|
| identita `pavel.admin` | ✅ | `sitove-odpovedi.json`: 20× `pavel.admin@pavelchocholousgmail.onmicrosoft.com`, `#ext#` 0× |
| nový scope `Test.Write`: Pending 5→4, Approved 61→62, po reloadu drží | ✅ | `pocty.txt`; `po-reloadu.png` má jiné md5 než snímky po kliku |
| co UI udělá | ✅ | [49] `PATCH graph …/oAuth2Permissiongrants/3lM8GAZB…` `{"scope":"Test.Write Test.Read "}` → 204, pak [50] `POST …/PermissionRequests('d63aa260…')/Deny` → 204 (odstranění vyřízené žádosti) |
| `ui/` a `ui-3/` | NEPLATÍ | měřeno pod hostem `#ext#`. Ověřovatel opravil README oddíl 2 |

**Zbytkové ❓ (malé):** (a) UI rozšířilo **existující** grant (PATCH). Úplně první schválení pro API bez grantu (POST nového grantu, typicky `Gateway.Use` v čistém tenantu E.ON) se neměřilo. (b) Měřeno pod Global Adminem. Zda stačí role SharePoint admin, je dál ❓ (rozpor `ai.md` × `dokumenty.md`). ❌ zůstává CLI/CSOM `permissionrequest approve`.

**Přepis ❓ → ✅ u „schválení v UI admin centra“** (s poznámkou „rozšíření grantu pod Global Adminem, `sondy/overeni/api-access/ui-4/`“):
- miniskilly: `egd-maily` ř. 53 a 152, `egd-llm-gateway` ř. 229, `egd-dokumenty` ř. 260;
- redaktor: `04` ř. 135, `sondy/ai.md` ř. 179 a 251, `sondy/napojeni.md` ř. 15, 80 a 171, `10-container-app.md` ř. 121 a 143, `audit/pro-overovatele.md` ř. 32 a 132.

Riziko 8 z Top 10 se tím zmenšuje: v E.ON zkusit „Approve“ v admin centru, Graph grant je jen záloha.
- **23. 11. ~12:15, redaktor:** `04` ř. 135, `audit/pro-overovatele.md` ř. 32 a 132 a `sondy/ai.md` ř. 179 a 251 přepsány na UI ✅ (`ui-4`) se zbytkovými ❓, ověřeno mnou `rg`. Zbývá `sondy/ai.md` ř. 239 („v labu šlo jen přes Graph grant“, zastaralé), `napojeni` ř. 15/80/171 a `10` ř. 121/143 (redaktor dostal souhlas) a skilly (miniskilly).
- **23. 11. ~12:20, `egd-maily`:** ř. 30, 53 a 152–153 přepsány podle `ui-4`, ověřeno mnou (čtení řádků, `po-reloadu.png`: „Žádosti čekající na vyřízení (4)“ se sloupcem Balíček). ✅ VYŘEŠENO. Nit: admin centrum bylo v labu česky („Upřesnit → Přístup k rozhraní API“), skill uvádí jen anglické „Advanced → API access“. Doplnit český popisek vedle anglického.
- **23. 11. ~12:25, `egd-llm-gateway`:** ř. 186–189 přepsány na UI ✅ (`ui-4`), CLI/CSOM ❌, Neověřeno má ❓ POST první grant a ❓ SharePoint admin. ✅ VYŘEŠENO (ověřeno čtením řádků). Stejný nit jako u maily: chybí český popisek „Upřesnit → Přístup k rozhraní API“.
- **⚠ Bezpečnost (hlášeno ms-llm, ověřeno mnou):** `sondy/overeni/api-access/ui-4/sitove-odpovedi.json` obsahuje nezačerněný access a refresh token `pavel.admin` (`rg -c 'access_token|refresh_token|eyJ0'` = 3). Soubor zatím není v gitu. `gitleaks dir` ho **nenachází** („no leaks found“), takže kontrola před commitem by ho propustila. Nahlášeno Ověřovateli (začernit, upravit skript) a hlavní session (necommitovat). Odvolání přihlášení je na Pavlovi.
- **23. 11. ~12:30:** český popisek „Upřesnit → Přístup k rozhraní API“ doplněn v `egd-maily` ř. 18, 30, 53 a 144 a v `egd-llm-gateway` ř. 186 a 224 (`rg`). Nit uzavřen. Tokeny v `ui-4/sitove-odpovedi.json` jsou stále nezačerněné (3 řádky), čeká se na Ověřovatele. Hlásil i koordinátor miniskillů.
- **Tokeny v `ui-4` vyřešeno (ověřeno mnou):** `eyJ0` 0×, `access_token` 2× `[JWT-ZACERNENO…]`, `refresh_token=[ZACERNENO]`. Hlavní session doplnila `.gitleaks.toml` (commit `f0d1909`, pravidla pro refresh token a JWT). Revokace přihlášení `pavel.admin` čeká na Pavla.

#### `egd-maily` a `egd-planovane-ulohy`: Copilot testy, filtr/5000 a Recurrence Po–Pá (23. 11. ~12:40), ověřeno mnou

| bod | stav | důkaz |
|---|---|---|
| maily Copilot: načetl skill, `Mail.Send` v `webApiPermissionRequests`, build a nasazení jen na zadaný web | ✅ | `copilot/mm1/log.txt` ř. 4 `skill(egd-maily)`, ř. 82 `skill(egd-prvni-appka)`, `TEST-copilot.md` |
| klik pod Tomášem 202, mail s CSV doručen | ✅ | `copilot-mm1-klik.log`: `[graph] 202 …/me/sendMail`, `Mail.Send v tokenu: true`. `copilot-mm1-doruceni.log`: „Výsledky hlasování 2026-11-23“ od `tomas.prochazka@…`, příloha `hlasy-2026-11-23.csv` s `Den;Hodnocení` / `2026-11-23;4` |
| planovane Copilot: zvolil B s podmínkou licence, nic nezaložil | ✅ (podle záznamu) | `TEST-copilot.md`, `copilot/pu2/`. Vynechal Sign in připojení a past „flow Off po uložení“; skill obojí má, autor to uvádí jako chybu modelu |
| Get items nad 6000: bez Top Count 100; Top Count 5000 + filtr **251 z 300 tiše**; stránkování 5000 + filtr 300; bez filtru max 5000 | ✅ | `filtr6000-beh1.json`: akce A–F `Succeeded`, počty 251/5000/100/5000/300/5000. **Nový důležitý nález:** filtr nad neindexovaným sloupcem ve flow nespadne, ale vrátí neúplný výsledek. Skill ř. 73–79 to popisuje |
| stránkování 6000 nejde uložit | ✅ | `filtr6000-create.log`: `InvalidPaginationPolicy … Actual: '6000'. Maximum: '5000'` |
| `Created ge addDays(utcNow(),-1)` bez chyby prahu | ✅ | akce F `Succeeded`, 5000 (všechny položky jsou z dneška, takže nejde poznat, zda filtr omezil. Tvrzení „projde bez chyby“ platí) |
| Recurrence Po–Pá definice | ✅ definice, ❓ běh | `recurrence-po-pa.log`: `frequency: Week`, `weekDays` Monday…Friday. Běh a popisky v designeru ❓ v Neověřeno |
| filtr/5000 (odložený bod z 2. kola) | **VYŘEŠENO** | viz výše |

**Oba skilly uzavírám:** obsah ✅, Claude ✅, Copilot ✅. Zbylé ❓ jsou v sekcích Neověřeno: Pagination v designeru, smyčka nad 5000, běh Recurrence Po–Pá, český popisek tlačítka „Schválit“ a dále první grant (POST) a SharePoint admin u UI Approve.

#### `egd-dokumenty`, výhrada (2): úryvky pro šablonu Spokojenost (23. 11. ~12:50), ověřeno mnou

| bod | stav | důkaz |
|---|---|---|
| 6 tlačítek (docx, graphpdf, pdf, xlsx, pptx, ares) pod petra.novakova | ✅ | `spokojenost-klik.log`: 6× „HOTOVO“. `spokojenost-obsah.txt`: 4 soubory s autorem „Nováková Petra“ (10:21), docx/pptx mají tabulku Den / Hlasů / Průměr „2026-11-23 1 4“, česky správně. xlsx má **surové hlasy** (Den, Hodnocení), ne souhrn. Odpovídá kódu ř. 168, jen zpráva autora říká „tabulka Den / Hlasů / Průměr“ u všech |
| Graph PDF zvlášť | ✅ | `spokojenost-graphpdf-cteni.log`: `%PDF-1.7`, bez Produceru pdf-lib, Length 61933, 10:29:18 (pozdější samostatný běh, protože v 10:21 ho přepsal pdf-lib) |
| (a) TS2802 spread nad Map → `Object.keys` | ✅ | `build-spokojenost-ts2802.txt`, SKILL ř. 125 a 134 |
| (b) kolize `spokojenost.pdf` → `spokojenost-prehled.pdf` | ✅ nález, ❓ oprava | nález doložen (Producer pdf-lib v `spokojenost-obsah.txt`). Oprava (ř. 242) je jen build 1.0.0.1, nasazení neproběhlo, protože lab CLI je odhlášené. Správně v Neověřeno ř. 328 |
| stránkování: bez `OData-Version` `odata.nextLink`, s 4.0 `@odata.nextLink` | ✅ | `strankovani.log` (3 varianty fetch) |
| **ř. 140 ❓ „kterou hlavičku posílá `SPHttpClient.configurations.v1`“** | 🔀/❌ **zbytečně ❓, je změřeno jinde** | `skills/egd-data-seznamy/TEST-copilot.md` ř. 36–43: `configurations.v1` posílá `OData-Version: 4.0` (zdroj `sp-http-base`, `defaultODataVersion`), appka proto dostane `@odata.nextLink`. Potvrzuje to e2e Copilota (1000 z 2900) i Claude (`claude-e2e/SpokojenostWebPart.ts` ř. 78). → nahradit ❓ odkazem |
| ř. 329 ❓ stránkování přímo ve web partu | 🔀 | e2e ve web partu ✅ v `egd-data-seznamy/TEST.md` (`_ctiVse`, 2801 hlasů ve 3 stránkách, data ve všech 30 dnech). Odkázat, nebo převzít `_ctiVse` z data-seznamy |

**`egd-dokumenty`:** výhrada (2) je vyřešena až na nasazení opravy názvu PDF (❓, čeká na přihlášení CLI) a dvě ❓, která jdou nahradit odkazem na `egd-data-seznamy`.
- **23. 11. ~13:00, `egd-dokumenty` přepis UI Approve:** ř. 309–310 a 319 a Neověřeno ř. 326–328 (a) POST první grant, (b) SharePoint admin, (c) žádost ze **site** catalogu. Ověřeno mnou. K (c): `18-add-write-2026-11-23.log` ř. 18 `ServerRelativeUrl /sites/apps/AppCatalog/…`, ui-4 tedy schvaloval žádost z tenantového katalogu. ✅ VYŘEŠENO. Poznámka: (c) se týká i `egd-maily` a `egd-llm-gateway`, které nasazují do katalogu webu. Vznik žádosti ze site catalogu je ✅ (llm-gateway ř. 174), schválení takové žádosti v UI ❓. Riziko je nízké, protože jde o stejný objekt žádosti, ale pro úplnost by to měly mít i ty dva skilly v Neověřeno.
- **23. 11. ~13:05, `egd-maily`:** Neověřeno ř. 154 (schválení v UI u žádosti ze site catalogu ❓) a upřesněný ř. 53 doplněny, ověřeno čtením. ✅. `egd-llm-gateway` ještě čeká.
- **23. 11. ~13:10, `egd-llm-gateway`:** Neověřeno ř. 235 (schválení v UI u žádosti ze site catalogu ❓) doplněn, ověřeno čtením. ✅. Nit „site catalog“ je teď uzavřen ve všech třech skillech (maily, llm-gateway, dokumenty).
- **23. 11. ~13:15, `egd-dokumenty` 3 body:** ř. 140–141 `configurations.v1` → `OData-Version: 4.0` ✅ s odkazem, ř. 143 `_ctiVse` z `egd-data-seznamy` ✅, ř. 21–22 a README ř. 60 xlsx = surové hlasy. Ověřeno `rg`. **`egd-dokumenty` uzavírám co do obsahu.** ❓ zůstává nasazení `spokojenost-prehled.pdf` (čeká na přihlášení CLI). Copilot test `egd-dokumenty` 2. scénář: stav viz předchozí zápisy (build-only).
- **23. 11. ~13:25, `egd-dokumenty` zavřené obě ❓ (ověřeno mnou):**
  - (1) `nasazeni-spokojenost-3.log`: add, deploy a upgrade rc 0, katalog 1.0.0.1 `deployed=true`. `spokojenost-klik-4.log`: vedle sebe `spokojenost-prehled.pdf` 8099 B (11:11:26) a `spokojenost.pdf` 61 933 B (11:11:25), bundle `spokojenost-web-part_7bc9f996…`. `klik-3.log` (o 40 s dřív) ještě přepsal `spokojenost.pdf` na 8098 B (11:10:46), tedy starý bundle. Hash starého bundlu v klik-3 chybí, zpoždění dokládá chování, ne hash. Souhlasí s dřívějším nálezem `sondy/ms-llm/bundle-propagace.md` (~1 min).
  - (2) Copilot scénář 2: `dokumenty2-log.txt` ř. 4 `skill(egd-dokumenty)`, `dokumenty2-klik.log` na `egd-sonda-ms-dokumenty-en`: hlas 3 „Zapsáno“, Word/Excel/PDF → Hotovo, v `Shared Documents/exporty` docx 16970, xlsx 13420, pdf 61485 (11:16). Výstupy v `dokumenty2-out/`.
  - **`egd-dokumenty` uzavírám úplně:** obsah ✅, Claude ✅, Copilot ✅ (build i scénář 2 s klikem).
- **23. 11. ~13:30:** nit k hashi bundlu v `egd-dokumenty` ř. 254–257 opraven (chování vs hash, odkaz na `bundle-propagace.md`), ověřeno čtením. ✅

### Matice vlastníka webu (`sondy/overeni/site-owner/README.md`, ověřovatel sond), kontrola 24. 11.

Přečetl jsem README a všechny logy a JSON 01–11. Tokeny v souborech nejsou (`rg` na refresh_token/JWT/access_token: 0 souborů).

| # | tvrzení | stav | důkaz / poznámka |
|---|---|---|---|
| 1 | REST upload `.sppkg` do site katalogu a Deploy | ✅ | `01-…json`: 200/907 ms, 200/2936 ms, `nasazena: true` |
| 2 | Balíček s API požadavkem se nasadí a založí tenantní požadavek | ✅ | `02-…json` `No errors.`, `AadPermissions … Test.Probe`, tenant admin API 403. `03-…txt`: požadavek `Test.Probe`/`egd-overeni-siteowner-probe`. Tím se uzavírá můj otevřený ❓ z API access, jestli požadavek vzniká i ze **site** katalogu. Schválení takového požadavku v UI a běh appky bez schválení zůstávají ❓. |
| 3 | Seznam, sloupec, položka a stránka | ✅ | `04-…json` 201/201/201, stránka 201 a publish 200 |
| 4 | break/add/reset rolí | ✅ | `04`, `05`: 200/200/200. Po resetu zůstane navíc „Účastník 01: Limited Access“ (`05` v3). Nit: pole `unikatni` ukazuje `false` i po `breakroleinheritance`, takže čte něco jiného než `HasUniqueRoleAssignments`. Přeměřit, nebo pole přejmenovat. |
| 5 | Graph PDF: k nahrání je potřeba `Files.ReadWrite.All`, převod jde s `Files.Read.All`, `Files.Read` vrátí 403 | ✅ | `07`, `08`, `pdf/` (3 PDF). V logu je jen `scp`, ne `upn` tokenu. ⚠ nit: doplnit `upn` do logu. |
| 6 | m365 CLI v11 pod egd01 | ✅ | `10`: `connectedAs egd01@…`, web get, list add, app add (MajorVersion 5). ⚠ `11-cli-deploy.log` obsahuje jen `rc=0`, výstup chybí. |
| — | identita v prohlížečových bězích 1–4 | ⚠ | V důkazech chybí `currentuser`. Nepřímo: po `breakroleinheritance(copy=false)` má Full Control „Účastník 01“ (`05` v1), takže volající byl egd01. `IsSiteAdmin: true` z README v žádném souboru není. Zalogovat `_api/web/currentuser` (LoginName, IsSiteAdmin). |
| — | `09` SP.OAuth.Token/Acquire | ❓ | Autor ho sám označil za neplatný (403 digest). Souhlasím. |

Závěr: hlavní tvrzení 1–6 ✅. Tři ⚠ nity jsou jen v dokladech (identita, upn, výstup deploye), výsledky nezpochybňují.
- **24. 11., doplnění site-owner:** tři ⚠ nity jsou uzavřené, soubory jsem přečetl.
  - `12-identita-egd01` ukazuje `LoginName …|egd01@…` a `IsSiteAdmin: true`. Byl to samostatný dotaz až po bězích 1–4, ne log z nich. Beru ho jako dostatečný doklad spolu s `05` v1.
  - `13-upn-tokenu` ukazuje u všech tří klientů `upn egd01@…` a stejné `scp` jako `07`/`08`. Tokeny se vydaly znovu.
  - `11b-cli-app-list-po-deploy` ukazuje u obou aplikací `Deployed: true`.
  - Pole `unikatni` README teď výslovně označuje za neplatné.
  - V souborech nejsou tokeny (`rg` našel 0 souborů).
  - Matice vlastníka webu je ✅.
- **24. 11., tokeny v `ui-4/sitove-odpovedi.json`: uzavřeno.** Přihlášení `pavel.admin` se neodvolává. Pavel to rozhodl 24. 11. (přes hlavní session): „pavel.admin nebudeme odvolavat, o nic nejde, je to lab“.
  - Ověřil jsem: tokeny jsou začerněné. `rg` na JWT a `refresh_token` v pracovní kopii nic nenašel.
  - Upřesnění k „soubor nebyl v gitu“: soubor **v gitu je**. Je v commitu `57e9c69` na `origin/main`, ale už začerněný (`refresh_token=[ZACERNENO]`, žádný JWT). Nezačerněná verze se do gitu nedostala. ✅

## Závěrečné kolo: `egd-prvni-appka` (HEAD d58df0d, 24. 11. odpoledne)

**Rozsah.** Celé jsem přečetl `SKILL.md`. Tři subagenti (sonnet, jen čtení) přečetli celé:
- `README.md`, `references/*.md`;
- `TEST.md`, `TEST-copilot.md`;
- `sondy/e2e/README.md`, `sondy/e2e/copilot/{README,BRIEF}.md`.

Klíčové nálezy jsem ověřil sám:
- md5 snímků;
- `a2-egd01/1-katalog.log`;
- `git diff a6526a9..d58df0d`;
- **čtení z labu**: `spo listitem list` na egd09-dev pod pavel.admin, jen čtení.

Pavel rozhodl, že skill se nemění: povinná otázka na režim zůstává a Z-C3 je výsledek testu, ne úkol.

### Verdikt

**Cesta A je hotová v obou agentech ✅.** Nic neblokuje, aby šel skill v pondělí ven s cestou A.
- **Claude:** cesta A v celém řetězci, pod egd01, egd10 i pavel.admin. Režimy single a open (`rezim/`, `rezim-ui/`). E2E egd10 od výdeje účtu po hlas.
- **Copilot:**
  - E2E egd09 prošel cestou A až po hlas. Nová kontrola v labu: na egd09-dev je jedna položka od **Účastníka 09**, vytvořená 13:24:04Z a změněná 13:24:09Z, `Hodnoceni` 2, `Den` 2026-11-24. To sedí s „4 → 2“.
  - Kód skriptu a šablony se od `a6526a9` nezměnil: `git diff a6526a9..d58df0d -- scripts templates` je prázdný. Copilot E2E použil `--rezim single`, běžel tedy nad kódem shodným s HEAD. Od té doby se změnil jen text, asi 20 řádků v SKILL.md.

**Není hotové podle kánonu „projde v obou“.** Jsou to známé mezery, nic z toho neblokuje pondělní cestu A:

| co | Claude | Copilot | stav |
|---|---|---|---|
| A2 (ručně v prohlížeči) | ✅ `a2-egd01`, `a3-moje-appka` | nespuštěno | ⚠ |
| B (bez kódu) | jen seznam přes CLI ✅, prohlížeč a Power Apps ❓ | nespuštěno | ⚠ |
| režim open | ✅ | nespuštěno (Z-C3: Copilot se nezeptal, zvolil single) | ⚠, podle rozhodnutí Pavla výsledek |
| `references/upravy.md` (první úpravy v plném cyklu) | nestihnuto (TEST.md ř. 336) | — | ⚠ postup bez průchodu, přiznáno v „Neověřeno“ |
| Windows a PowerShell 5.1 | nikdy | nikdy | ⛔ přiznáno |

### Důkazy, které nesedí nebo chybí

| soubor:ř. | nález | stav | co udělat (autor) |
|---|---|---|---|
| `sondy/e2e/copilot/dukazy/30,31,32,40-*.png` | md5 je **bajt po bajtu shodné** s `sondy/e2e/dukazy/30–32,40` z egd10 běhu. Nemusí jít o kopii: obě appky mají EG.D, stejné hlasy 4 → 2 a stejný den, a `?env=WebView` ani stránka „You need access“ neukazují účet ani web. Snímky ale **egd09 nedokládají**. Hlas egd09 dokládá až mé čtení z labu (výše). | ⚠ | Do důkazů uložit `currentuser` a URL s egd09, nebo REST položky s `Author`. U kroku 9 (spolužák egd01) uložit URL egd09-dev. |
| `sondy/e2e/copilot/README.md:6` | SHA-256 ZIPu `8ed759…` není v žádném logu. Dnešní `dist/egd-skills.zip` má `08cb3306…` (přestavěný). Ani `diff -rq` „shodné“ není v `01b/log.txt`. | ⚠ | Uložit výstup `shasum` a `diff -rq`, nebo SHA označit jako neověřitelné. |
| `sondy/e2e/copilot/README.md:26` | Uvolnění egd09 nemá důkaz. | ⚠ | Log `lab-vydej.py uvolnit`. |
| `sondy/e2e/copilot/README.md:28` | AI Credits 0,45 + 1,21 + 2,61 + 4,12 jsou kumulativní součty relace. Celkem je 4,12, ne součet. | ❌ | Opravit text. |
| `sondy/e2e/README.md:9` | Hlavička uvádí lokální CLI 12 s `~/.m365-e2e`. Login a zápisy ale šly přes globální v11.11.0 (Z2b, ř. 89). | ❌ | Opravit hlavičku. |
| `sondy/e2e/copilot/BRIEF.md:45 × 81` | Sandbox je jednou „mimo repo“, podruhé „pod `sondy/e2e/copilot/`“. | ⚠ | Sjednotit. |
| `skills/egd-prvni-appka/TEST.md:78–93` | A2 „ProductId `bf9f5ac7`, Deployed true“. Log `a2-egd01/1-katalog.log` ale končí **SELHALO** (`nove nebo zmenene: []`). Doplněný výstup s ProductId chybí. Ověřil jsem sám. | ⚠ | Uložit doplněnou kontrolu. A2 jako celek je doložená v `a3-moje-appka/` a `7-hlas.log`. |
| `TEST.md:323` | „Copilot … čeká na tooling“ je zastaralé, `TEST-copilot.md` i E2E existují. | ❌ | Opravit řádek. |
| `TEST-copilot.md:25–61` (běh 22. 11.) | Důkazy byly ve scratchpadu `cp-prvni-appka`, ten už neexistuje a kopie v repu není. | ⚠ | Označit jako historický, překrytý během 24. 11. a E2E egd09. |
| `TEST-copilot.md:137` + hlavička | Hlas v prohlížeči je ❓, ale E2E egd09 ho doložil. Na `sondy/e2e/copilot/` se neodkazuje. Copilot běhy dvou značek jely pod pavel.admin, ne pod egd0X. | ⚠ | Doplnit odkaz na E2E a uvést identitu. |
| `README.md:89` | Tabulka cest: A2 je pořád „❓ klikací cesta“. TEST.md a `rucne-v-prohlizeci.md:7` ji mají ✅ (egd01). | ❌ | A2 → „✅ v Claude (egd01), Copilot ne“. |
| `references/chyby.md:10–11` | „CLI pod běžnými lab účty vrací AADSTS65001, appka má consent jen pro správce“ je **zastaralé**. Od 24. 11. má appka CLI admin consent pro celý tenant (`sondy/overeni/site-owner/README.md`, bod 6), egd10 i egd09 se v E2E přihlásili. | ❌ | Opravit. Stav bez souhlasu dokládá `skills/egd-recon` (jakub.kucera, „Need admin approval“). |
| `references/chyby.md:12–14` | `E_ACCESSDENIED` pod Global Adminem u Graph CLI ✅: v projektu není žádný log (vytýkáno už v 1. kole). | ❌ | Doložit, nebo označit ❓. |
| `references/chyby.md:51–52`, `TEST.md:213` | Výpis `unzip -l` (62,9 / 12,2 kB) „níže“ nikde není. | ⚠ | Uložit výpis. |
| `SKILL.md:117` | Věta pro IT žádá „Node 24 nebo 26“. Ř. 43 a 204 ale říkají 22.14+ nebo 24, a Node 26 se nezkoušel (`chyby.md:60` ❓). | ⚠ | „Node 24 LTS (nebo 22.14+)“. Je to text ve SKILL.md, rozhoduje Pavel nebo hlavní session. |
| `SKILL.md:201` | `AADSTS65001` 📘: chyba je v labu změřená (`skills/egd-recon`). | ⚠ | Odkázat na důkaz, změna značky. |
| `SKILL.md:265` | „egd10-dev anglicky“ (sdílení webu): pro anglickou cestu není log, je jen `z5-*` česky. TEST.md ř. 329 má anglické popisky jako neověřené. | ⚠ | Doložit, nebo „anglické popisky ❓“. |
| `SKILL.md:101–105` | Žebřík nasazení A → A2 → B nemá variantu A3 (REST z přihlášeného prohlížeče, agent dělá zápisy za uživatele). Ta je ✅ v `egd-pripravenost` a `sondy/rest-varianty/`. | 🔀 | Doporučení, ne blokátor: zvážit A3 mezi A a A2 (méně klikání než A2, nepotřebuje appId CLI). |

**Tajemství:** `rg` na JWT a `refresh_token` přes `sondy/e2e` našel 0 tokenů. Šest souborů obsahuje jen slovo „password/heslo“ v textu, bez hodnoty. `rezervace.log` má heslo začerněné.

**Počty (sloučeno, bez duplicit):** ❌ 6 (texty a zastaralé údaje), ⚠ 14 (chybějící nebo nerozlišující doklady), 🔀 1. Žádný nález nezpochybňuje, že cesta A funguje v obou agentech.

## Uzávěrka auditu (24. 11. večer, HEAD 75a344a)

Pavel řekl audit uzavřít. Přeměřil jsem opravy redaktora a všechny ❌/⚠ ze závěrečného kola `egd-prvni-appka`.
Číst jsem jen soubory a důkazy v repu, do labu jsem nesahal.

### Opravy redaktora (schválení API access)

| soubor : ř. | tvrzení teď | stav | důkaz |
|---|---|---|---|
| `sondy/napojeni.md:15, 80, 171` | hlavní cesta = UI Approve v SharePoint admin centru pod Global Adminem, Graph grant = fallback; ❓ první grant (POST), ❓ role SharePoint admin | ✅ VYŘEŠENO | `sondy/overeni/api-access/ui-4/`: `pocty.txt` čekající 5 → 4, schválené 61 → 62, po reloadu drží; `sitove-odpovedi.json` ř. 396 `PATCH 204 …/oAuth2Permissiongrants/3lM8…` |
| `10-container-app.md:38, 152, 198, 225` | totéž, ✅ UI a ✅ Graph grant jako záloha, ⛔ v E.ON | ✅ VYŘEŠENO | týž ui-4 |
| `sondy/ai.md:239` | ⛔ E.ON: schválení skutečným SharePoint adminem; v labu UI ✅ pod GA | ✅ VYŘEŠENO | týž ui-4 |
| `sondy/napojeni.md:80` (konec věty) | „Doporučení … je tedy ✅ až na krok schválení v UI“ | ⚠ drobnost | krok v UI už je ✅; věta má znít „✅, otevřené jen první grant (POST) a role SharePoint admin“ |

### `egd-prvni-appka`: ❌ ze závěrečného kola (commity ffa7af6, b253809)

| místo | stav | důkaz |
|---|---|---|
| README ř. 89, A2 ❓ | ✅ VYŘEŠENO | „✅ v Claude pod egd01; v Copilotu nespuštěno“ |
| `chyby.md` ř. 10–11, AADSTS65001 | ✅ VYŘEŠENO | věta je v minulém čase s odkazem na site-owner bod 6 |
| `chyby.md` ř. 12–14, E_ACCESSDENIED | ✅ VYŘEŠENO | teď ❓ „doložené nemáme“; 403 z `az` tokenu doložen `sondy/rest-varianty/az-token.log` |
| TEST.md ř. 323 (Copilot čeká) | ✅ VYŘEŠENO | ř. 342 odkazuje TEST-copilot.md a E2E egd09 |
| `sondy/e2e/README.md:9`, CLI 12 | ✅ VYŘEŠENO | „lokální 12.0.0, zápisy přes globální v11.11.0“ |
| `copilot/README.md:28`, kredity | ✅ VYŘEŠENO | „kumulativní … celkem 4,12, nesčítat“ |

### ⚠ a 🔀 ze závěrečného kola

| nález | stav | důkaz / co zbývá |
|---|---|---|
| snímky nedokládají egd09 | ✅ VYŘEŠENO | `copilot/dukazy/50-identita-currentuser.txt`: `currentuser` na `egd09-dev` = `egd09@…`, „Účastník 09“ |
| SHA ZIPu bez logu | ✅ VYŘEŠENO | `52-zip-sha256.txt`: `8ed759…10fc1d` u kopie, dnešní `dist/` = `08cb3306…` (přestavěn; přiznáno) |
| uvolnění egd09 bez důkazu | ✅ VYŘEŠENO | `53-vydej-stav-po-uvolneni.txt`: rezervace jen egd03, egd04, egd06 |
| log A2 končí SELHALO | ✅ VYŘEŠENO | TEST.md ř. 103 vysvětluje (stará kontrola ID položky); `1b-katalog-productid.json`: `bf9f5ac7-cf87-…`, `Deployed: true` |
| TEST-copilot.md bez odkazu na E2E | ✅ VYŘEŠENO | ř. 7 |
| SKILL.md: Node 26 | ✅ VYŘEŠENO | ř. 205: „Node 24 LTS nebo 22 (22.14+), build ověřen na 24.22.3 i 22.23.5“; 26 už jen v engines šablony |
| SKILL.md: AADSTS65001 📘 | ✅ VYŘEŠENO | ř. 202 ✅ s `lab/dukazy/cli-egd01-65001.log` (1× AADSTS65001) |
| SKILL.md: anglické popisky bez logu | ✅ VYŘEŠENO | ř. 266 odkazuje `sondy/e2e/dukazy/41–47` (soubory existují) |
| 🔀 A3 chybí v žebříku | ✅ VYŘEŠENO | SKILL.md ř. 104: A3 s odkazem na `egd-pripravenost/references/appka.md` (oddíl „Cesta A3“ existuje); s touto šablonou ❓, přiznáno |
| důkazy Copilota z 22. 11. ztracené | TRVÁ (přiznáno) | nahrazuje je E2E egd09 z 24. 11. |

### Co zůstává otevřené (nic z toho neblokuje cestu A ve středu)

- **Copilot neprošel:** cesty A2 a B, režim open ani `references/upravy.md` (přiznáno v TEST-copilot.md ř. 79, 149).
  Podle kánonu tedy tyto větve nejsou „hotové v obou agentech“. Cesta A hotová je.
- **Windows a PowerShell 5.1:** neběžely v žádném agentovi.
- **Schválení API access:** ❓ zda stačí role SharePoint admin a ❓ první grant (POST); v E.ON ⛔.
- Drobnost `sondy/napojeni.md:80` (viz výše).

**Verdikt uzávěrky:** všechny ❌ ze závěrečného kola jsou opravené. Z ⚠ a 🔀 zůstal jen jeden přiznaný nález
(ztracené důkazy z 22. 11.). Důkazy jsem namátkou otevřel a sedí. Audit uzavírám. Otevřené jsou jen přiznané
mezery výše a drobnost v `napojeni.md:80`.
