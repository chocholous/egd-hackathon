---
name: egd-prava-role
description: Nastav v SharePoint appce EG.D role zadavatel / schvalovatel / správce tak, aby je vynucoval SharePoint, ne kód - tři skupiny, seznam „každý vidí jen své“ (ReadSecurity), vlastní úroveň oprávnění s CancelCheckout pro schvalovatele a podle práv v appce ukázat nebo schovat tlačítka. Použij, když uživatel řekne „zadavatel vidí jen své žádosti“, „schvalovatel vidí všechno“, „role a práva v appce“, „víceúrovňová autentizace“, „kdo smí schvalovat“, „schovej tlačítko Schválit“, „přílohy vidí jen autor“, „schvalovatel nevidí cizí položky“, „schvalovatel nesmí mazat“ nebo „sdílet jeden záznam s kolegou“.
license: interní pomůcka workshopu EG.D
---

# Role a práva v appce (požadavek 4)

Uživatel je začátečník na Windows. Navazuje na `egd-prvni-appka` (SPFx web part nad seznamem na stejném webu).
Pravidlo: **práva nastav na seznamu, appka je jen čte.** Skrytí tlačítka není zabezpečení;
kdo má právo na seznamu, udělá totéž přes REST nebo přímo v seznamu.

Značky: ✅ ověřeno v labu 22. 11. 2026 (důkaz v závorce, cesty od kořene repa `egd-workshop`) · ❓ neověřeno (viz sekce Neověřeno).
Lab: web `sites/egd-sonda-ms-prava`, appka Evidence požadavků (seznam `Pozadavky`), účty jakub + zuzana (zadavatelé),
eva (schvalovatelka), karolina (vlastnice webu, ne globální admin), lucie (bez skupiny). Důkazy: `sondy/ms-prava/`.
Starší měření pod 5 účty přes REST: `sondy/data-prava.md`.

## Model, který funguje ✅

| Role | Skupina na webu | Na webu | Úroveň na seznamu | Vidí | Upraví cizí | Smaže cizí |
|---|---|---|---|---|---|---|
| Zadavatel | „<Appka> Zadavatelé“ | **Čtení** | **EGD Zadavatel** = kopie Přispívání | jen své | ne (404) | ne (404) |
| Schvalovatel | „<Appka> Schvalovatelé“ | **Čtení** | **EGD Schvalovatel** = Přispívání + **Přepsat rezervaci a uživatelské nastavení** (`CancelCheckout`) | vše | ano | **ano** |
| Schvalovatel bez mazání | totéž | **Čtení** | totéž, ale **bez Odstranit položky** | vše | ano | ne, ani své (403) |
| Správce | „<Appka> Správci“ | **Čtení** | Úplné řízení | vše | ano | ano |
| ostatní | žádná | – | nic (přerušená dědičnost) | nic (Potřebujete přístup / 403) | ne | ne |

Seznam: **Upřesnit nastavení → Přístup pro čtení: „Číst položky vytvořené daným uživatelem“,
Přístup pro vytváření a úpravy: „Vytvořit položky a upravit položky vytvořené daným uživatelem“**
(`ReadSecurity=2`, `WriteSecurity=2`).

Důkazy: appka v prohlížeči pod 5 účty (`sondy/ms-prava/appka/*.json` a `.png`); REST pod tokeny
(`sondy/ms-prava/matrix-po-polozkach.jsonl`: zuzana upraví cizí 404, eva 204, lucie 403); bez mazání
(`sondy/ms-prava/bez-mazani.jsonl`: upraví cizí 204, smaže cizí 403, smaže svou 403, do koše 403).

Pasti ✅:
- „jen své“ obchází **`CancelCheckout`**, ne Úpravy / `ManageLists`. Schvalovatel s výchozí úrovní Úpravy cizí
  žádosti **nevidí** (`sondy/data-prava/matrix.jsonl` ř. 9). Česká UI tomu bitu říká „Přepsat rezervaci a uživatelské
  nastavení“, v Upřesnit nastavení „Zrušit rezervaci“.
- **Skupiny jen na seznamu nestačí.** Bez Čtení na webu zadavatel neotevře ani stránku appky („Potřebujete přístup“,
  `sondy/ms-prava/ui/30-jakub-bez-webu.png`). Čtení webu „jen své“ na seznamu nepřebije (`sondy/ms-prava/appka/`).
- Kdo skupinu zakládá, stane se automaticky jejím členem (`sondy/ms-prava/ui/14-pridat.png`). Vlastníka webu
  ze skupin Zadavatelé a Schvalovatelé odeber, jinak bude mít i tyto role (má ale Úplné řízení tak jako tak).
- **Skupina Entra** (bezpečnostní) vložená do SharePoint skupiny funguje stejně jako člověk ✅, ale **s prodlevou**:
  vloženo 21:06, v 21:21 ještě 403 na seznamu, v 21:47 už role Schvalovatel, obě žádosti, stránka 200
  (`sondy/ms-prava/matrix-entra.jsonl`, `entra-detail.txt`, `matrix-entra-po.txt`). Po přidání do skupiny Entra
  počítej s desítkami minut, než to SharePoint uvidí. Vložení jsem dělal REST (`sitegroups(<id>)/users`, LoginName
  `c:0t.c|tenant|<id skupiny>`), protože CLI na to v labu nemělo práva na Graph.
- Index sloupce nezaloží úroveň Přispívání (403, `sondy/miniskilly/k2.jsonl`): indexy zakládá vlastník při přípravě seznamu.

## Žebřík variant: zkus odshora, první fungující použij

Nejdřív zjisti, co účastník na webu smí (agent, jen čtení):

```powershell
m365 spo web get --url <web> --withGroups --output json   # AssociatedOwnerGroup
m365 spo group member list --webUrl <web> --groupName "<Vlastníci webu …>" --output text
```

Je-li účastník ve skupině Vlastníci webu, smí všechno níže ✅ (karolina, vlastnice, ne globální admin, prošla A
celé; `sondy/ms-prava/ui/`). Člen webu (Úpravy) dostane na založení úrovně, skupiny i přerušení dědičnosti **403** ✅
(`sondy/ms-prava/clen-test.jsonl`) → rovnou varianta D.

### A) Klikání v prohlížeči (vlastník webu) ✅ — doporučeno pro začátečníka

Prošlo v české UI pod vlastnicí webu, logy a screenshoty `sondy/ms-prava/ui/` (časy jsem neměřil ručně ❓).

1. **Úrovně:** ozubené kolo → **Oprávnění k webu** → dole **Rozšířené nastavení oprávnění** → pás karet
   **Úrovně oprávnění** → klikni **Přispívání** → dole **Zkopírovat úroveň oprávnění** → Název `EGD Schvalovatel`
   → zaškrtni **Přepsat rezervaci a uživatelské nastavení** → **Vytvořit**. Totéž znovu s názvem `EGD Zadavatel`
   bez zaškrtnutí (kopie dá přesně práva Přispívání, `sondy/ms-prava/urovne.json`).
   Schvalovatel nemá mazat? Při kopii navíc odškrtni **Odstranit položky** (zaškrtávátko v UI existuje, `ui/05`, ale
   tenhle proklik jsem neudělal ❓; stejnou úroveň bez mazání jsem ověřil přes CLI ✅, viz B).
   *Funguje?* Na stránce Úrovně oprávnění jsou obě nové úrovně. *Ne (chybí odkaz / chyba přístupu)?* Nejsi vlastník → D.
   *Ne (chyba při Vytvořit, politika tenantu)?* → C.
2. **Skupiny:** Rozšířené nastavení oprávnění → **Vytvořit skupinu** → Název `<Appka> Zadavatelé` → dole v části
   „Poskytnout skupině oprávnění k tomuto webu“ zaškrtni **Čtení** → **Vytvořit**. Totéž pro Schvalovatelé a Správci.
   Lidi: na stránce skupiny **Nový** → jméno nebo e-mail → **ZOBRAZIT MOŽNOSTI** → odškrtni „Poslat pozvánku
   e-mailem“ → **Sdílet**. Sebe ze skupin Zadavatelé a Schvalovatelé odeber (Akce → Odebrat uživatele ze skupiny ❓ neprokliknuto).
   (V labu jsem Čtení dával dodatečně: Rozšířené nastavení → **Udělit oprávnění** → skupina → ZOBRAZIT MOŽNOSTI →
   Vybrat úroveň oprávnění **Čtení** → Sdílet; `sondy/ms-prava/ui/31-*.log`. Zaškrtnutí Čtení přímo ve formuláři
   Vytvořit skupinu je stejné nastavení, sám jsem ho nekliknul ❓.)
3. **Seznam:** v seznamu ozubené kolo → **Nastavení seznamu** → **Oprávnění pro: Seznam** → **Ukončit dědění oprávnění**
   → potvrď → zaškrtni Členy a Návštěvníky webu → **Odebrat uživatelská oprávnění** → potvrď → **Udělit oprávnění** →
   název skupiny → ZOBRAZIT MOŽNOSTI → odškrtni pozvánku → **Vybrat úroveň oprávnění** (EGD Zadavatel / EGD Schvalovatel /
   Úplné řízení pro Správce) → **Sdílet**. Vlastníci webu na seznamu zůstanou.
   *Funguje?* Na stránce oprávnění seznamu je „Pro tento seznam jsou nastavena jedinečná oprávnění“ a 4 řádky
   (Vlastníci + 3 skupiny). *Ne (tlačítko Ukončit dědění chybí)?* Nejsi vlastník → D.
4. **Jen své:** Nastavení seznamu → **Upřesnit nastavení** → Přístup pro čtení **Číst položky vytvořené daným uživatelem**,
   Přístup pro vytváření a úpravy **Vytvořit položky a upravit položky vytvořené daným uživatelem** → dole **OK**.

*Funguje?* Kontrolní příkaz v části Ověření vrátí `2, 2, true`. *Ne?* Zopakuj krok, jehož hodnota nesedí
(`ReadSecurity`/`WriteSecurity` ≠ 2 → krok 4; `HasUniqueRoleAssignments` false → krok 3).

Pro: začátečník vidí, co dělá; nic neinstaluje. Proti: hodně obrazovek, snadno přehlédne „Čtení na webu“ nebo
pozvánku e-mailem. Co chce od IT E.ON: jen roli Vlastník webu (viz D). Obtížnost pro citizen developera: nízká až střední.

### B) Agent příkazy m365 CLI (vlastník webu přihlášený v CLI) ✅

Stejné nastavení příkazy CLI; běží i v PowerShellu. V labu prošlo na seznamu `PozadavkyCLI` skriptem
`tools/prava-role-cli.sh` (bez `--ano` jen plán; logy `sondy/ms-prava/cli-varianta.log` a `cli-varianta-2.log`,
kontrola `2, 2, true`). Čerstvý běh s novými názvy úrovní na prázdném seznamu `PozadavkyCLI2` založil přes CLI obě
úrovně, tři skupiny, Čtení na webu, přiřazení i „jen své“ (`sondy/ms-prava/cli-varianta-3.log`). Úrovně z CLI mají
bit po bitu stejná práva jako z UI (`Low` 1011028975 / 1011028719, `cli-varianta-3-urovne.txt`). Pod účty: schvalovatel
vidí cizí, upraví (204) a smaže (200), zadavatelka vidí jen své (`cli-varianta-3-mereni.jsonl`); úroveň bez mazání viz
`bez-mazani.jsonl`.
*Před* během: `m365 status` musí ukazovat účet vlastníka webu. *Funguje?* Poslední `spo list get` vrátí `2, 2, true`.
*Ne?* `Access denied`/403 → nejsi vlastník → D; chyba u `roledefinition add` → C; „Uživatel neexistuje“ → překlep v UPN.
Na Windows spusť příkazy po jednom:

```powershell
$W = "<web>"; $S = "<Seznam>"; $A = "<Appka>"
$Z = "ViewListItems,AddListItems,EditListItems,DeleteListItems,OpenItems,ViewVersions,DeleteVersions,ManagePersonalViews,ViewFormPages,Open,ViewPages,CreateSSCSite,BrowseDirectories,BrowseUserInfo,AddDelPrivateWebParts,UpdatePersonalWebParts,UseClientIntegration,UseRemoteAPIs,CreateAlerts,EditMyUserInfo"
m365 spo roledefinition add --webUrl $W --name "EGD Zadavatel" --rights $Z
m365 spo roledefinition add --webUrl $W --name "EGD Schvalovatel" --rights "$Z,CancelCheckout"   # bez mazání: z $Z vyndej DeleteListItems
m365 spo group add --webUrl $W --name "$A Zadavatelé"          # totéž Schvalovatelé, Správci
m365 spo group member add --webUrl $W --groupName "$A Zadavatelé" --userNames "a@firma.cz,b@firma.cz"
m365 spo web roleassignment add --webUrl $W --groupName "$A Zadavatelé" --roleDefinitionName "Čtení"   # pro všechny 3 skupiny
m365 spo list roleinheritance break --webUrl $W --listTitle $S --clearExistingPermissions --force
m365 spo list roleassignment add --webUrl $W --listTitle $S --groupName "<Vlastníci webu …>" --roleDefinitionName "Úplné řízení"
m365 spo list roleassignment add --webUrl $W --listTitle $S --groupName "$A Zadavatelé" --roleDefinitionName "EGD Zadavatel"
m365 spo list roleassignment add --webUrl $W --listTitle $S --groupName "$A Schvalovatelé" --roleDefinitionName "EGD Schvalovatel"
m365 spo list roleassignment add --webUrl $W --listTitle $S --groupName "$A Správci" --roleDefinitionName "Úplné řízení"
m365 spo list set --webUrl $W --title $S --readSecurity 2 --writeSecurity 2
```

Pro: opakovatelné, agent nic neklikne špatně. Proti: názvy úrovní jsou v jazyce webu („Čtení“, „Úplné řízení“ na
českém webu); `--clearExistingPermissions` shodí i vlastníky (proto je hned vracíme). Obtížnost: agent snadno,
člověk ručně střední. Co chce od IT E.ON: roli Vlastník webu a povolené přihlášení m365 CLI (app registrace, viz
`egd-pripravenost`). Pozor ✅: přidání skupiny Entra přes `--entraGroupIds` a `entra user get` potřebují v CLI
práva na Graph; v labu je CLI aplikace neměla („Insufficient privileges“, `sondy/ms-prava/cli-graph-prava.log`),
u lidí pomohl `--userNames`.
Třetí, stejná cesta přes holé REST: `tools/data-prava-sp.py setup` ✅ (`sondy/data-prava.md`).

### C) Vlastní úroveň nejde vytvořit (politika tenantu)

**Vestavěná úroveň Návrh** pro skupinu Schvalovatelé na seznamu ✅: obsahuje `CancelCheckout` (`sondy/ms-prava/urovne.json`);
schvalovatel s Návrhem při „jen své“ vidí cizí položky a upraví je (204, `sondy/ms-prava/navrh.jsonl`).
Proti: má i `ManageLists` (smí měnit sloupce seznamu a zobrazení) a mazání. Kód níže ho pak označí jako **Správce**
(bit 0x800), záložka Ke schválení se ale ukáže (má 0x100). Obtížnost: stejná jako A, jen bez kroku 1.
Co chce od IT E.ON: Vlastník webu. *Funguje?* Pod schvalovatelem `prava-role-over.py` ukáže `CancelCheckout`
a všechny položky. *Ne?* → D.

Druhá možnost je vzor „samostatný seznam rozhodnutí“ bez `CancelCheckout` (kit `ppf-citizen-ai-devkit`,
`sondy/data-prava.md` ř. 113): schvalovatel cizí žádosti přes REST nevidí ani nesmaže, rozhodnutí píše do druhého
seznamu. V labu neověřeno ❓. Pro: schvalovatel nemůže mazat ani měnit žádosti; žádná vlastní úroveň. Proti: dva
seznamy a víc kódu (appka páruje rozhodnutí se žádostí); schvalovatel musí žádosti nějak vidět (podle kitu čte
otisk obsahu, ne žádost samotnou), autor čte rozhodnutí i k cizím žádostem, pokud má seznam rozhodnutí čtení pro všechny.
Co chce od IT: Vlastník webu (jedno přerušení dědičnosti navíc). Obtížnost: střední až vysoká.

### D) Účastník není vlastník webu → IT ✅

Člen webu nesmí nic z A/B (403, `sondy/ms-prava/clen-test.jsonl`); vlastník webu (ne globální admin, ověřil i auditor
přes Graph: 0 roleAssignments) smí vše ✅. *Funguje?* Po odpovědi IT je účastník ve skupině Vlastníci webu (příkaz výše).
*Ne (IT odmítne)?* Appka běží bez rolí; role může nastavit vlastník webu za účastníka podle A.
Pro: jediná cesta bez vlastnictví. Proti: čeká se na ServiceNow (dny). Obtížnost: nízká (jen žádost).
**Věta pro IT (ServiceNow):** „Prosím o roli Vlastník na webu <web>. Potřebuji pro aplikaci vytvořit tři SharePoint
skupiny (Zadavatelé, Schvalovatelé, Správci), vlastní úroveň oprávnění ‚EGD Schvalovatel‘ (Přispívání + Přepsat
rezervaci a uživatelské nastavení) a přerušit dědění oprávnění na seznamu <seznam>.“
Do odpovědi IT nastav v appce jen zobrazení (kód níže); přístup k datům dál vynucuje seznam tak, jak je.

## Kód: appka pozná roli z práv, ne ze jména skupiny ✅

Ověřeno v appce Evidence (SPFx 1.24.1) pod jakub/zuzana (Zadavatel, bez záložky Ke schválení), eva (Schvalovatel,
záložka „Ke schválení (2)“, schválila Jakubovu žádost, Jakub pak vidí „Schváleno“), karolina (Správce), lucie
(stránka Potřebujete přístup). Kód `sondy/ms-prava/prvni-appka/src/webparts/evidence/EvidenceWebPart.ts`,
výsledky `sondy/ms-prava/appka/01–07*.json` (soubory nesou profil Chrome; profil = lab účet stejného jména).

Pomocné metody, které úryvek používá (z téhož souboru; `SPHttpClient` z `@microsoft/sp-http`):

```ts
private _url(cesta: string): string {
  const seznam = (this.properties.seznam || '<Seznam>').replace(/'/g, "''");
  return `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${encodeURIComponent(seznam)}')${cesta}`;
}
private async _cti<T>(cesta: string): Promise<T> {
  const r = await this.context.spHttpClient.get(this._url(cesta), SPHttpClient.configurations.v1,
    { headers: { Accept: 'application/json;odata=nometadata' } });
  if (!r.ok) throw new Error(`SharePoint vrátil ${r.status}`);
  return (await r.json()) as T;
}
```

```ts
const PRAVO_VSE = 0x100;      // CancelCheckout (Přepsat rezervaci…) = vidí a upraví cizí → schvalovatel
const PRAVO_PRIDAT = 0x2;     // AddListItems
const PRAVO_SPRAVA = 0x800;   // ManageLists → správce

// v _nacti() (this._cti čte /_api/web/lists/getbytitle('<Seznam>') + cesta):
const prava = await this._cti<{ High: string; Low: string }>('/EffectiveBasePermissions');
const low = Number(prava.Low);
this._schvalovatel = (low & PRAVO_VSE) !== 0;
this._muzePridat = (low & PRAVO_PRIDAT) !== 0;
this._spravce = (low & PRAVO_SPRAVA) !== 0;
// záložku „Ke schválení“ ukaž jen když this._schvalovatel; formulář jen když this._muzePridat
```

**Nepoužívej `ApproveItems` (0x10)** jako znak schvalovatele: úroveň EGD Schvalovatel ho nemá (Eva má `Low=0x3c4313ef`,
bez 0x10) a záložka by se neukázala. Všechny použité bity jsou v `Low` ✅ (`High` je u zadavatele i schvalovatele `0x3b0`;
`sondy/ms-prava/clen-test.jsonl`). Při `ReadSecurity=2` vrací seznam zadavateli jen jeho položky sám; filtr `AuthorId`
v kódu už není potřeba (ale neuškodí). Čteš-li víc než jednu stránku, hledej další stránku pod `@odata.nextLink`
i `odata.nextLink` (SPFx `SPHttpClient` posílá OData 4.0; důkaz `skills/egd-data-seznamy/TEST-copilot.md` ř. 39–43).

## Přílohy, verze, sdílení jedné položky

- Přílohy ✅: cizí zadavatel nedostane přílohu přes REST (404/400, `sondy/data-prava/extras2.jsonl`) ani v prohlížeči
  přímou URL `/Lists/<Seznam>/Attachments/<id>/<soubor>` (stránka Potřebujete přístup); schvalovatelka soubor otevře
  (`sondy/ms-prava/appka/priloha-*.log`). Nic dalšího nastavovat netřeba.
- Verze ✅: zadavatel vidí historii jen svých položek (`sondy/data-prava/extras.jsonl`).
- **Sdílet jednu položku s kolegou nejde** při „jen své“ ✅ (ReadSecurity přebije sdílení, `extras.jsonl`).
  `ReadSecurity=1` + vlastní oprávnění na položce funguje jen částečně doloženo ❓ (`sondy/data-prava.md` ř. 75,
  `extras2.jsonl`: slabší důkaz, jeden řádek 404). Nastavit je smí jen někdo s právem Spravovat oprávnění, ne appka
  pod běžným uživatelem. Nevysvětlené ❓: zadavatel v `ZadostiACL` rozbil dědičnost na své položce (200), kde už měl
  přímý grant; v `Zadosti` 403. Kdo ACL nastaví (Power Automate, server), je ❓.

## Ověření (vždy, aspoň dvěma účty)

1. Agent (jen čtení): `m365 spo list get --webUrl <web> --title <Seznam> --properties "ReadSecurity,WriteSecurity,HasUniqueRoleAssignments" --output json`
   → `2`, `2`, `true` ✅ (`sondy/ms-prava/kontrola-list-get.json`).
2. Zadavatel otevře appku, odešle žádost, v Moje vidí jen své.
3. Schvalovatel otevře appku: vidí žádosti obou, má záložku Ke schválení, schválí.
4. Druhý zadavatel nevidí žádost prvního ani v appce, ani v seznamu (`/Lists/<Seznam>`).

Bez druhého účtu to ověřené není; řekni to uživateli. Agent v labu: tokeny `tools/data-prava-token.py`,
matice `tools/prava-role-over.py`, proklik appky `tools/prava-appka-klik.mjs`, klikací cesta `tools/spo-ui-krok.mjs`.

## Neověřeno

| Tvrzení | Proč není ověřeno | Jak a kde ověřit |
|---|---|---|
| Vlastní úrovně oprávnění jdou politikou tenantu zakázat | V labu nastavení nenalezeno a úroveň šla vytvořit; politika E.ON neznámá | V E.ON jeden pokus: varianta A krok 1 na testovacím webu; selže → C nebo D |
| Varianta C: seznam rozhodnutí bez `CancelCheckout` | Vzor z kitu, v labu nepostaven | Postavit druhý seznam Rozhodnutí v labu a změřit pod zadavatelem a schvalovatelem |
| Sdílení položky přes Power Automate (ACL na položce) | Flow s právem Spravovat oprávnění nikdo nepostavil; PA v labu naráží na licence (`sondy/power-automate.md`) | Flow „Při vytvoření položky → přerušit dědičnost → přidat autora a schvalovatele“ pod účtem s licencí |
| Formulář Vytvořit skupinu se zaškrtnutým Čtení | Čtení jsem dával přes Udělit oprávnění (ověřeno); zaškrtávátko ve formuláři existuje (`ui/09`), ale neprokliknuto | Jedno založení skupiny se zaškrtnutím a kontrola `_api/web/roleassignments` |
| Odebrání sebe ze skupiny (Akce → Odebrat uživatele) | Neprokliknuto | Proklik na stránce skupiny |
| A krok 1: odškrtnutí „Odstranit položky“ při kopii úrovně | Neprokliknuto (stejná úroveň přes CLI ✅) | `tools/spo-ui-krok.mjs … unchecklabel:Odstranit položky` |
| `ReadSecurity=1` + ACL na položce; zadavatel rozbije dědičnost (200) | Slabší důkaz v `data-prava` | Znovu změřit `tools/data-prava-sp.py extras2` |
| Jak dlouho to člověku trvá | Klikal skript, ne člověk | Stopky při zkoušce s účastníkem |

## Zdroje

`sondy/ms-prava/zjisteni.md` (tabulka „skill psal → UI ukazuje“ a všechny důkazy), `sondy/data-prava.md`,
surová data `sondy/data-prava/*.jsonl`; kit `ppf-citizen-ai-devkit` (`itemScope: own`, `can()`).
