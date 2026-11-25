# TEST v Claude: egd-prava-role (24. 11. 2026)

Agent účastníka: subagent Claude Sonnet (effort medium). Dostal cesty ke skillům `egd-prava-role`
a `egd-prvni-appka`, které si sám přečetl, a zákaz je upravovat. Prostředí byl macOS a zsh. Jako `m365` dostal
`tools/lab-m365.sh` (globální CLI v11.11.0, přihlášený vlastník webu). Login, mazání a subagenty měl zakázané.

- **Web:** `https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava`.
- **Seznam `PozadavkyClaude`:** před během prázdný, bez vlastních práv. Kontrola vrátila `HasUniqueRoleAssignments`
  false, `ReadSecurity` 1, `WriteSecurity` 1 (`sondy/ms-prava/claude-pred.json`).
- **Úrovně ani skupiny s předponou Objednávky** před během na webu nebyly.

Zadání bylo stejné jako v 3. běhu Copilota ([TEST-copilot.md](TEST-copilot.md)), lišila se jen jména:
- appka „Objednávky“ místo „Nákupy“;
- seznam `PozadavkyClaude`;
- zadavatel jakub a schvalovatelka eva místo jany a tomáše, protože jen pro ně má tester profily prohlížeče.

Zbytek zadání: schvalovatel nesmí mazat, úrovně založ nové s předponou appky a na konci nastavení ověř.

## Výsledek: ✅

| Krok | Výsledek |
|---|---|
| Přečetl oba skilly, zjistil stav: `m365 status`, vlastník webu (`group member list`), seznam `1, 1, false` | ✅ |
| Založil úrovně `Objednávky Zadavatel` (Low 1011028719) a `Objednávky Schvalovatel` bez `DeleteListItems`, s `CancelCheckout` (Low 1011028967) | ✅ stejné bity jako z UI, CLI i Copilota |
| 3 skupiny (Zadavatelé, Schvalovatelé, Správci) s členy jakub a eva, Čtení na webu pro všechny 3 | ✅ |
| Přerušení dědičnosti, Vlastníci + 3 skupiny na seznam, `list set 2/2` | ✅ |
| Závěrečná kontrola ze skillu `2, 2, true` a přiřazení přes `m365 request` | ✅ |
| **REST pod skutečnými účty** (`claude-ucastnik/mereni-rest.jsonl`): eva vidí obě položky, upraví jakubovu (204), smazat nesmí cizí, svou ani do koše (403 ×3), bity `CancelCheckout` ano, `DeleteListItems` ne; jakub vidí jen svou | ✅ |
| **Prohlížeč, seznam `/Lists/PozadavkyClaude`**: jakub vidí jen svou položku, eva obě (`prohlizec-*.log`, `.png`) | ✅ |
| **Prohlížeč, příkaz Odstranit**: po výběru položky je v menu **Více** u jakuba (zadavatel, vlastní položka) **Odstranit**, u evy ne (`vice-*.log`, `.png`) | ✅ |
| Ptal se nebo se zastavil | ne |
| Upravoval soubory skillu | ne |
| Spustil mazací příkaz, login nebo subagenta | ne |

Pozn. k `mereni-rest.jsonl`: měřicí skript `sondy/ms-prava/bez-mazani-copilot.py` se volal s parametry
`PozadavkyClaude jakub.kucera eva.vesela`. Popisky kroků („jana“, „tomas“) a názvy položek pochází z jeho první
verze. Zadavatel tu je jakub a schvalovatel eva.

## Důkazy (`sondy/ms-prava/claude-ucastnik/`)

- `report.md`: závěrečný report agenta účastníka (všechny příkazy s výsledky, kontrola, připomínky).
- `prikazy.txt`, `vystupy.txt`: doslovné příkazy a výstupy z přepisu běhu.
- `mereni-rest.jsonl`: chování pod tokeny jakub a eva.
- `prohlizec-jakub.kucera.*`, `prohlizec-eva.vesela.*`: seznam v prohlížeči.
- `vice-*.log`, `vice-*.png`: menu Více po výběru položky.
- `clenove-skupin.txt`: členové skupin po běhu, zakladatel mezi nimi není.
- `pwsh-kontrola.ps1`, `pwsh-kontrola.txt`: ověření nových řádků skillu v PowerShellu 7.5.4 (výraz pro úroveň bez
  mazání a výpis přiřazení).

## Co agent vytkl skillu a co se s tím stalo

- **Úroveň bez mazání byla jen v komentáři.** Blok PowerShell teď má vlastní řádek
  `$ZS = ($Z -replace ",DeleteListItems", "") + ",CancelCheckout"` (ověřeno v pwsh).
- **Příklady používaly předponu EGD.** Názvy úrovní v bloku B jsou teď `$A Zadavatel` / `$A Schvalovatel`.
- **Chyběla kontrola přiřazení.** CLI 11 nemá `spo list roleassignment list` a `spo list get --withPermissions`
  na seznamu skončí chybou (`VersionPolicies`). Do Ověření přibyl příkaz `m365 request …/roleassignments` pro
  PowerShell, ověřený v labu.
- **„Zakladatel se stane členem skupiny“ přes CLI neplatí.** Skill teď říká, že jen v UI (Vytvořit skupinu).
- **„Pavel Admin (lab)“ s Úplným řízením na seznamu.** Účet, který přerušil dědičnost, na seznamu zůstane. Skill to
  teď uvádí v Pastech a radí ho neodebírat, protože je to vlastník.
- Skupinu Správci agent založil, i když v zadání nebyla (skill ji uvádí jako volitelnou). Zůstala prázdná a nevadí.
- Ověření pod účty účastník bez druhého účtu neudělá. Skill to už říká (Ověření, poslední odstavec).

## Rozdíly Claude vs Copilot (běh 3)

- Claude nejdřív ověřil, že je přihlášený vlastník webu, a příkazy pouštěl po jednom s kontrolou `rc`. Copilot
  řetězil přes `&&` s `--output none`, jeden krok mu tiše selhal a 2 minuty visel.
- Claude založil i skupinu Správci, Copilot ne. Obojí odpovídá skillu.
- Oba si ověřili přiřazení přes REST (`m365 request`), protože CLI na to nemá příkaz. Proto je teď ve skillu.
- Claude zkusil tři neexistující nebo nevhodné příkazy (`spo list roleassignment list`, `spo roledefinition get
  --name`, `spo list get --withPermissions`). Chyby přečetl a pokračoval jinou cestou.
- Ani jeden neověřil chování pod účty sám; to dělá tester.
