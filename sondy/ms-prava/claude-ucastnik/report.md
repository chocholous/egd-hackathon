Nejdřív zjistím, co účastník na webu smí (jen čtení).
Zkusím zjistit správné volby pro kontrolu přiřazení a úrovní.
Role pro Objednávky jsou nastavené na `PozadavkyClaude` a závěrečná kontrola prošla. Ověřil jsem je jen čtením přes CLI a REST. Pod účty jakub a eva jsem to nezkoušel, takže podle skillu (ř. 229) to zatím není ověřené.

## 1. Příkazy m365 v pořadí
Všude `tools/lab-m365.sh`. `W` je `https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava`, seznam je `PozadavkyClaude`.

1. `status` vrátilo rc=0 a přihlášeného `pavel.admin@pavelchocholousgmail.onmicrosoft.com`.
2. `spo web get --url W --withGroups --output json` vrátilo rc=0.
3. `spo group member list --webUrl W --groupName "Vlastníci webu EGD sonda ms-prava"` vrátilo rc=0. Ve skupině jsou karolina, petra a pavel.admin, takže přihlášený účet je vlastník.
4. `spo list get --title PozadavkyClaude --properties "ReadSecurity,WriteSecurity,HasUniqueRoleAssignments"` vrátilo rc=0. Před změnou: `false`, `1`, `1`.
5. `spo roledefinition list` vrátilo rc=0. Existující úrovně EGD a Nákupy jsem nepoužil.
6. `spo group list` vrátilo rc=0.
7. `spo list roleassignment list` skončilo chybou `Command 'spo list roleassignment list' was not found...` (v CLI 11.11.0 neexistuje), rc=0.
8. `spo roledefinition add --name "Objednávky Zadavatel" --rights "<20 práv ze skillu>" --output json` vrátilo rc=0.
9. `spo roledefinition add --name "Objednávky Schvalovatel" --rights "<totéž bez DeleteListItems, plus CancelCheckout>" --output json` vrátilo rc=0.
10. `spo group add --name "Objednávky Zadavatelé"` vrátilo rc=0 (Id 36).
11. `spo group add --name "Objednávky Schvalovatelé"` vrátilo rc=0 (Id 37).
12. `spo group add --name "Objednávky Správci"` vrátilo rc=0 (Id 38).
13. `spo group member add --groupName "Objednávky Zadavatelé" --userNames jakub.kucera@pavelchocholousgmail.onmicrosoft.com` vrátilo rc=0.
14. `spo group member add --groupName "Objednávky Schvalovatelé" --userNames eva.vesela@pavelchocholousgmail.onmicrosoft.com` vrátilo rc=0.
15. `spo group member list` pro všechny tři skupiny vrátilo rc=0. Zadavatelé mají jen jakuba, Schvalovatelé jen evu, Správci jsou prázdní.
16. `spo web roleassignment add --groupName "Objednávky Zadavatelé" --roleDefinitionName "Čtení"` vrátilo rc=0.
17. Totéž pro Schvalovatelé vrátilo rc=0.
18. Totéž pro Správci vrátilo rc=0.
19. `spo list roleinheritance break --listTitle PozadavkyClaude --clearExistingPermissions --force` vrátilo rc=0.
20. `spo list roleassignment add` pro skupinu "Vlastníci webu EGD sonda ms-prava" s úrovní "Úplné řízení" vrátilo rc=0.
21. `spo list roleassignment add` pro "Objednávky Zadavatelé" s úrovní "Objednávky Zadavatel" vrátilo rc=0.
22. `spo list roleassignment add` pro "Objednávky Schvalovatelé" s úrovní "Objednávky Schvalovatel" vrátilo rc=0.
23. `spo list roleassignment add` pro "Objednávky Správci" s úrovní "Úplné řízení" vrátilo rc=0.
24. `spo list set --title PozadavkyClaude --readSecurity 2 --writeSecurity 2` vrátilo rc=0.
25. `spo list get ... --properties "ReadSecurity,WriteSecurity,HasUniqueRoleAssignments"` vrátilo rc=0 (výstup v bodě 2).
26. `spo list get --withPermissions` skončilo chybou `{"error":"Seznam není DocumentLibrary, VersionPolicies se nepodporuje."}`, rc=1.
27. `spo roledefinition get --name "Objednávky Schvalovatel"` a totéž pro Zadavatel skončilo chybou `{"error":"Invalid option: 'name'\n"}`, rc=1. Příkaz bere jen `--id`.
28. `spo web roleassignment list` skončilo chybou `Command ... was not found`.
29. `spo roledefinition list --output json` vrátilo rc=0.
30. `request --method get` na `_api/web/lists/getbytitle('PozadavkyClaude')/roleassignments?$expand=Member,RoleDefinitionBindings` vrátilo rc=0.
31. `request --method get` na `_api/web/roleassignments?...&$filter=startswith(Member/Title,'Objedn')` vrátilo rc=0.

Nic jsem nemazal, nepustil jsem `login` ani `logout` a nespustil jsem žádné subagenty.

## 2. Závěrečná kontrola (doslovně)
Kontrolní příkaz ze skillu:
```
{ "HasUniqueRoleAssignments": true, "ReadSecurity": 2, "WriteSecurity": 2 }
```

Bity nových úrovní (`roledefinition list`):
```
{"Id":1073741932,"Name":"Objednávky Zadavatel","BasePermissions":{"High":432,"Low":1011028719}}
{"Id":1073741933,"Name":"Objednávky Schvalovatel","BasePermissions":{"High":432,"Low":1011028967}}
```
Tato čísla se shodují s hodnotami uvedenými ve skillu na ř. 73 a 106. Schvalovatel má `CancelCheckout` a nemá `DeleteListItems`.

Přiřazení na seznamu:
```
{"p":"Vlastníci webu EGD sonda ms-prava","r":["Úplné řízení"]}
{"p":"Pavel Admin (lab)","r":["Úplné řízení"]}
{"p":"Objednávky Zadavatelé","r":["Objednávky Zadavatel"]}
{"p":"Objednávky Schvalovatelé","r":["Objednávky Schvalovatel"]}
{"p":"Objednávky Správci","r":["Úplné řízení"]}
```

Přiřazení na webu:
```
{"p":"Objednávky Zadavatelé","r":["Čtení","Omezený přístup"]}
{"p":"Objednávky Schvalovatelé","r":["Čtení","Omezený přístup"]}
{"p":"Objednávky Správci","r":["Čtení","Omezený přístup"]}
```

## 3. Kde jsem se zastavil nebo skill neodpovídal realitě
- Zadání nezmiňuje skupinu Správci, ale skill ji zakládá (ř. 121 a 128). Založil jsem ji prázdnou s Úplným řízením na seznamu. Pokud ji nechcete, je potřeba ji odebrat ručně, já nic nemažu.
- Skill ř. 42–43 a 80 říká, že zakladatel skupiny se stane jejím členem a má se odebrat. Přes CLI se to nestalo, členové jsou jen jakub a eva (bod 15). Odebírat nebylo co.
- Na seznamu se ale objevil řádek "Pavel Admin (lab)" s Úplným řízením. Vznikl při přerušení dědičnosti a skill o něm nic neříká. Je to přihlášený vlastník a odebrat bych ho mohl jen příkazem `remove`, který jsem nesměl použít.
- Skill ř. 223 a 108 dávají kontrolu `spo list get ... --properties`, a ta funguje. Skill ale nenabízí způsob, jak si ověřit samotná přiřazení rolí. `spo list roleassignment list` a `spo web roleassignment list` neexistují, `spo roledefinition get` nebere `--name` a `spo list get --withPermissions` na běžném seznamu skončí chybou. Přiřazení jsem proto ověřil přes `m365 request` GET na REST.
- Skill ř. 118 až 119 volá `m365`, v mém prostředí wrapper `lab-m365.sh`. To je v pořádku. Zápis `"$Z,CancelCheckout"` ve skillu je pro PowerShell, v zsh jsem seznam práv sestavil sám a DeleteListItems z něj vyndal.
- Skill ř. 120 píše "z $Z vyndej DeleteListItems" jen v komentáři za řádkem. U schvalovatele bez mazání je to snadné přehlédnout.

## 4. Co ve skillu chybí nebo mátlo
- Chybí hotový příklad pro jména tvaru "<Appka> Zadavatel" (úroveň) a "<Appka> Zadavatelé" (skupina). Skill ve všech příkladech používá předponu EGD, ale uživatel chtěl svou předponu.
- Chybí rozlišení, kdy se úroveň "bez mazání" týká jen schvalovatele. Tabulka na ř. 22–24 to ukazuje, ale příkaz ve skriptu (ř. 120) to jen naznačuje komentářem.
- Řádek 223 ukazuje kontrolu `ReadSecurity`, `WriteSecurity` a `HasUniqueRoleAssignments`. Chybí kontrola, že úrovně a skupiny jsou přiřazené. Přibližně odpovídá tomu, co jsem udělal přes `request`, a mohla by tam být jako hotový příkaz.
- Skill výslovně neříká, že vlastník webu zůstane na seznamu po přerušení dědičnosti vždy sám. Řádek 125 přidává skupinu vlastníků ručně. Pozor: je tam rizikový `--clearExistingPermissions`, který krátce odebere všechny včetně vlastníků.
- Chybí upozornění, že po zápisu nelze ověřit chování pod účty jakub a eva přes CLI. Skill ř. 229 odkazuje na `tools/data-prava-token.py` a `tools/prava-role-over.py`, kterými by se to dalo změřit, ale účastník je mít nebude.

Poznámky jsem do `sondy/ms-prava/claude-ucastnik/` nezapisoval.
