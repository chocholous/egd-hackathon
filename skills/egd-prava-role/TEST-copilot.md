# Test skillu egd-prava-role v GitHub Copilot CLI

Datum 22. 11. 2026. Nástroj `tools/copilot-run.sh` (izolovaný HOME „účastníka“, skill nainstalovaný do
`~/.copilot/skills`, přihlášení m365 CLI zkopírované z labu). Copilot vybral model sám (GPT-6 Luna přes Copilot Fusion).
Lab web `sites/egd-sonda-ms-prava`. Důkazy: `sondy/ms-prava/copilot/`.

## Běh 1: jen kontrola (čtení) ✅

Prompt: „Mám appku … seznam Pozadavky. Chci, aby zadavatel viděl jen své a schvalovatel všechny. Zkontroluj nastavení,
řekni jak se to dělá a jak v kódu poznám schvalovatele. Nic neměň.“ (zápisové příkazy zakázané `--deny-tool`).

| Očekávání ze skillu | Copilot | Stav |
|---|---|---|
| Skill se načte | `skill(egd-prava-role)` | ✅ |
| Kontrola `spo list get … ReadSecurity,WriteSecurity,HasUniqueRoleAssignments` → 2, 2, true | spustil, správně vyhodnotil | ✅ |
| Projde skupiny, úrovně a Čtení na webu | sám přes `spo roledefinition list` a `m365 request …/roleassignments`; našel všechny 3 skupiny, úrovně a Čtení na webu | ✅ |
| Schvalovatel podle `CancelCheckout` 0x100, ne `ApproveItems` | přesně tak, se snippetem | ✅ |
| Upozorní, že bez dvou účtů to není ověřené | ano („neověřoval jsem chování pod dvěma účty“) | ✅ |
| Nic nezměnil | `Changes +0 -0` | ✅ |

Spotřeba: 0,58 AI Credits, 36 s. Log `sondy/ms-prava/copilot/beh1-log.txt`, přepis `beh1-prepis.md`.

Rozdíly proti Claude: Copilot zkoušel číst důkazní soubory `sondy/ms-prava/…` relativně k pracovní složce
účastníka (neexistují, „Path does not exist“) a pokračoval bez nich. Neškodí, ale cesty k důkazům nejsou
pro účastníka; skill proto výslovně říká, že jsou to cesty v repu `egd-workshop`.

## Běh 2: nastavení rolí agentem přes CLI (varianta B) ✅

Prompt: „Jsem vlastník webu … Na seznamu PozadavkyCopilot nastav role pro appku Copilot: zadavatelka jana,
schvalovatel tomas, schvalovatel nesmí mazat … Udělej to sám přes m365 CLI, nic nemaž a na konci ověř. Souhlasím se zápisem.“
Seznam `PozadavkyCopilot` jsem předem založil prázdný (bez práv). Zakázané jen `m365 login/logout`.

Co Copilot udělal (`sondy/ms-prava/copilot/beh2-log.txt`): `spo group add` ×3, `group member add` ×2,
`web roleassignment add` ×3 (**Čtení na webu, krok z nové verze skillu**), `list roleinheritance break`,
`list roleassignment add` ×3, `list set` (2/2), kontrola. Úroveň „EGD Schvalovatel bez mazání“ už na webu byla
(z mého běhu B), Copilot ji našel a znovu použil. Žádný mazací příkaz. 1,42 AI Credits, 1 min 15 s.

Nezávislé ověření pod skutečnými účty (`beh2-overeni.txt`, `beh2-bez-mazani.jsonl`):

| Kontrola | Výsledek | Stav |
|---|---|---|
| Seznam: `ReadSecurity`, `WriteSecurity`, `HasUniqueRoleAssignments` | 2, 2, true | ✅ |
| Seznam: Copilot Zadavatelé = EGD Zadavatel, Copilot Schvalovatelé = EGD Schvalovatel bez mazání, Vlastníci = Úplné řízení | ano | ✅ |
| Web: obě skupiny Čtení | ano | ✅ |
| tomas (schvalovatel) vidí janinu položku a upraví ji | 200 / 204 | ✅ |
| tomas smaže cizí / svou / do koše | 403 / 403 / 403 | ✅ |
| jana vidí jen svou | ano | ✅ |

Rozdíly proti Claude:
- Copilot si dvakrát vymyslel volbu CLI (`spo web get --webUrl`, `spo roledefinition get --name`) a jednou překlepl
  doménu (`shareport.com`); chyby sám přečetl a opravil. Claude v této session volby předem ověřil přes `--help`.
- Copilot nezaložil skupinu Správci (v promptu nebyla) — skill ji uvádí jako volitelnou, to je v pořádku.
- Na seznamu zůstal i „Pavel Admin (lab)“ s Úplným řízením: přerušení dědičnosti s `--clearExistingPermissions`
  nechá přihlášenému autorovi změny plná práva. Totéž se stane i Claude/ručně; neškodí (je vlastník webu).

Výhrady auditu (2. kolo): Copilot úroveň „bez mazání“ nezaložil, našel ji hotovou; běh 2 (21:19–21:21) šel na verzi
SKILL.md před auditními úpravami (21:21+). Přepisy obsahují cesty `/private/tmp/…` (sandbox `copilot-run.sh`),
nejsou to cesty účastníka. Proto běh 3.

## Běh 3: nové úrovně, aktuální SKILL.md ✅ (23. 11. 2026)

SKILL.md v sandboxu = tehdy aktuální verze (`diff` bez rozdílu, SHA-256 v `beh3-skill-sha256.txt`, kopie `beh3-SKILL.md`); rozdíl proti dnešní verzi `beh3-SKILL.diff`: datum, značky ✅ u tří prokliků z UI (a jejich vyřazení z Neověřeno) a past `--output none`, kroky postupu se neměnily. Prázdný seznam
`PozadavkyCopilot3` založený předem. Prompt jako v běhu 2, appka „Nákupy“, navíc: „Úrovně oprávnění pro tuhle appku
založ nové a pojmenuj je s předponou Nákupy (stávající úrovně EGD nepoužívej).“ Zakázané jen `m365 login/logout`.
Model GPT-6 Luna, 1,68 AI Credits, 4 min 13 s. Důkazy `sondy/ms-prava/copilot/beh3-*`.

Co Copilot udělal (`beh3-log.txt`): přečetl `--help` k příkazům, které chtěl použít. Pak **založil obě úrovně**:
„Nákupy Zadavatel“ = Přispívání a „Nákupy Schvalovatel bez mazání“ = Přispívání + `CancelCheckout` − `DeleteListItems`.
Dál 2 skupiny s členy, Čtení na webu, přerušení dědičnosti, přiřazení a `list set 2/2`. Na konci kontrola, žádný mazací příkaz.

Nezávislé ověření pod skutečnými účty (`beh3-overeni.txt`, `beh3-bez-mazani.jsonl`):

| Kontrola | Výsledek | Stav |
|---|---|---|
| Seznam `ReadSecurity`, `WriteSecurity`, `HasUniqueRoleAssignments` | 2, 2, true | ✅ |
| Úrovně: bity `Low` | Zadavatel 1011028719, Schvalovatel bez mazání 1011028967, stejné jako z UI i CLI | ✅ |
| Seznam: Nákupy Zadavatelé = Nákupy Zadavatel, Nákupy Schvalovatelé = Nákupy Schvalovatel bez mazání, Vlastníci = Úplné řízení | ano | ✅ |
| Web: obě skupiny Čtení | ano | ✅ |
| tomas: bity `CancelCheckout` ano, `DeleteListItems` ne; vidí janinu položku a upraví ji | 200 / 204 | ✅ |
| tomas smaže cizí / svou / do koše | 403 / 403 / 403 | ✅ |
| jana vidí jen svou | ano | ✅ |

Rozdíl proti Claude: Copilot řetězil příkazy přes `&&` s `--output none` a u jednoho vynechal `--listTitle`.
Chyba se nevypsala, krok visel 2 minuty (příčinu visení jsem v labu nezopakoval: týž příkaz u mě skončí hned
s `rc=1`). Copilot ho zastavil, stav zkontroloval a chybějící přiřazení schvalovatele doplnil. Skill proto nově
varuje před `--output none` (varianta B, změřeno). Na seznamu znovu zůstal „Pavel Admin (lab)“ s Úplným řízením
(autor přerušení dědičnosti), stejně jako v běhu 2.

## Závěr

Skill prošel v Copilot CLI ve všech třech bězích (čtení, zápis s existující úrovní, zápis s novými úrovněmi na
aktuálním SKILL.md) ✅. V Claude jsem stejný postup prošel v této session:
klikání v UI (A), CLI skript (B), appka pod 5 účty v prohlížeči (`sondy/ms-prava/zjisteni.md`).
