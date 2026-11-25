---
name: egd-recon
description: Záchranný skill k egd-pripravenost. Použij, když se v přípravě něco nedaří (AADSTS65001, „Need admin approval“ / „Vyžaduje se schválení správcem“, 403 / Přístup odepřen, web nemá katalog aplikací, nejde nahrát balíček) a chceš vědět proč a co přesně požádat IT. Jen čte, nic nezapisuje.
license: interní pomůcka workshopu EG.D
---

# egd-recon: co tu smím (jen čtení)

Skill nepouštěj jako první krok. Je to **záchrana**: spusť ho, až v `egd-pripravenost` něco zůstane červené
a není jasné proč. Výstup jsou tři seznamy: **funguje / blokováno / žádost pro IT**.

## Pojistky

- Nic nezapisuj, nic nemaž, nic neposílej. Recon jen čte.
- Přihlášení dělá člověk (viz `egd-pripravenost`, krok 5). Heslo ani kód nikdy nezadávej.
- Použij jen web, který ti uživatel uvedl.

## Postup

1. Spusť ve stejné pracovní složce jako `egd-pripravenost` (kde je `node_modules` s CLI). `<cesta>` je složka,
   ve které leží tento skill (tam, odkud jsi načetl SKILL.md):
   - Windows: `node "<cesta>\egd-recon\scripts\recon.mjs" --web <adresa webu> --out recon.md`
   - macOS: `node "<cesta>/egd-recon/scripts/recon.mjs" --web <adresa webu> --out recon.md`

   Je-li CLI jinde, přidej `--cli <cesta k …/@pnp/cli-microsoft365/dist/index.js>`.
2. Přečti výstup a řekni uživateli jednou větou, **která vrstva** to blokuje:
   - **Entra (aplikace), přihlášení skončí obrazovkou „Need admin approval“ / „Vyžaduje se schválení správcem“ (česká podoba ❓ neviděna):**
     aplikace CLI v tenantu existuje, ale **ty si ji sám schválit nesmíš**. Oprávnění SharePointu
     (`AllSites.FullControl`, `Sites.FullControl.All`) nespadá pod souhlas, který smí dát běžný uživatel
     (politika `microsoft-user-default-low`). Nezkoušej to znovu ani jiným účtem. Žádost pro IT: „Prosím o souhlas
     správce (admin consent) pro aplikaci <appId z přihlašovací stránky / od lektora> s delegovanými oprávněními
     SharePointu AllSites.FullControl, pro můj účet nebo pro celý tenant.“ Recon v tu chvíli nemá z čeho číst
     (rc 1), stejně jako u `AADSTS65001`. Mezitím zvol cestu A3 / A2.
   - **Entra (aplikace):** aplikace nemá na SharePointu scope → `AADSTS65001`. Žádost: souhlas správce (admin consent). Při `AADSTS65001` se CLI nepřihlásí, takže recon nemá z čeho číst: **vypíše jen větu pro IT a odkáže na cestu A3 / A2** (to je očekávaný výsledek, ne chyba).
   - **SharePoint (ty na webu):** chybí role Člen / Vlastník nebo web nemá katalog aplikací → `403`, „Přístup odepřen“.
   - **Nic neblokuje** (vše pod „Funguje“, „Blokováno: nic“): problém není v oprávnění ani ve webu. Vrať se do
     `egd-pripravenost`, spusť `prihlaseni` a `sharepoint --web <adresa webu>` a řeš konkrétní řádek `[CERVENA]`.

   Návratový kód: 1 = CLI chybí nebo není přihlášené (očekávané u AADSTS65001), 0 = recon doběhl.
   Když CLI chybí, recon vypíše adresu `…/_api/web/GetList('<cesta webu>/AppCatalog')/EffectiveBasePermissions`. Uživatel
   ji otevře v přihlášeném prohlížeči a čísla High a Low přelož příkazem `node "<S>" maska --high H --low L`. Pak pokračuj
   cestou A3 / A2. Ukáže-li maska jen čtení (Čtenář / Návštěvník), A3 ani A2 nepomohou: nejdřív žádost o roli. Kód 0 neznamená
   „vše v pořádku“, rozhoduje část „Blokováno“.
3. Věty z části „Žádost pro IT“ dej uživateli do zprávy pro ServiceNow / `sharepoint@eon.com` (můžeš je
   přeformulovat, ale nech v nich adresu webu a název oprávnění). Ve složce s `.pripravenost` výsledek zapiš
   (`<S>` = `scripts/pripravenost.mjs` skillu `egd-pripravenost`):
   `node "<S>" zapis --klic recon --stav <zelena|zluta|cervena> --hodnota "<co blokuje>" --it "<věta pro IT>"`.
   Stav: `zelena` = nic neblokuje, `cervena` = appku nejde nasadit (chybí souhlas správce, role nebo katalog),
   `zluta` = jen počkat (čerstvý web, katalog se zakládá). Zpráva `pripravenost-<jméno>.md` se tím nepřepíše:
   obnov ji `node "<S>" zprava --jmeno <jméno>`. Recon pro víc webů: klíč `recon-<web>`, jinak se zápisy přepíšou.
   Když blokuje vrstva Entra (CLI se nepřihlásí), připomeň i náhradní cestu A3 / A2 (`egd-pripravenost/references/appka.md`).
4. Nepomůže-li to, vrať se k tabulce „Když se něco pokazí“ v `egd-pripravenost` nebo napiš lektorovi.

## Co je ověřeno

- ✅ **Běh v labu pod `pavel.admin` (23. 11., CLI 12, macOS):** na `egd09-dev` vše zelené (scope `AllSites.FullControl`, katalog jde číst, do katalogu jde nahrávat), na `mcplabdocs` (bez katalogu) správně „blokováno: web nemá katalog“ a věta pro IT. Výstupy: `test-dukazy/recon-egd09-dev.md` (v repu workshopu), `test-dukazy/recon-mcplabdocs.md` (v repu workshopu).
- ✅ **Bez přihlášeného CLI** (23. 11.): recon vypíše větu o souhlasu správce (admin consent) a odkáže na cestu A3 / A2, rc 1 (`test-dukazy/recon-bez-prihlaseni.out` (v repu workshopu)). Díky tomu dává smysl i u AADSTS65001: místo čtení vypíše aspoň větu pro IT.
- ✅ **Čtení práv v katalogu pod jiným účtem než správcem** (`egd05` správce kolekce: add/edit v katalogu ANO; `eva.vesela` Člen na `egd-test-vedle-sebe`: add/edit ANO, `IsSiteAdmin` false; v obou `addAndCustomizePages` ne, tj. Custom Script je zakázaný) (jen čtení, přes prohlížeč, protože CLI tam nejde): `test-dukazy/prava-katalog-ucty.md` (v repu workshopu), skript `scripts/prava-z-prohlizece.mjs`.
- ✅ **„Need admin approval“ u běžného uživatele (24. 11., změřila hlavní session):** `jakub.kucera` (bez admina)
  se do CLI nepřihlásil, appka `m365-cli-spfx-lab` (appId `12f19539…`). Politika souhlasu tenantu je
  `ManagePermissionGrantsForSelf.microsoft-user-default-low` a `Sites.FullControl.All` / `AllSites.FullControl` pod ni
  nespadá. Do té doby měl souhlas jen správcův účet (`consentType Principal`). Pro EG.D z toho plyne, že **citizen developer si
  appku CLI sám neschválí**. Potřebuje admin consent (pro svůj účet nebo pro celý tenant), a to je položka pro IT.
  Lab od 24. 11. odpoledne: Pavel dal souhlas pro celý tenant (`AllPrincipals`), takže se teď přihlásí kdokoli z labu.
  Hlášku v labu už znovu nevyvoláš, ale v E.ON bez souhlasu správce platí dál. Delegovaná práva jsou i se souhlasem
  omezená právy uživatele na webu, takže recon pod Návštěvníkem dál ukáže chybějící roli (✅ viz další bod).
- ✅ **Recon pod běžným uživatelem `jakub.kucera` (24. 11., CLI 11.11, macOS):**
  - jako Člen: vše zelené;
  - jako jen Návštěvník: „v katalogu chybí práva addListItems, editListItems (jen čtení)“ a žádost o roli Člen / Vlastník;
  - na webu bez přístupu: „do katalogu webu nevidíš (Attempted to perform an unauthorized operation.)“ a žádost o roli.

  Důkazy: `test-dukazy/jakub-postup.md` a `test-dukazy/jakub-*.md` (v repu workshopu).
- ✅ **Bez CLI pod Návštěvníkem (24. 11.):** z prohlížeče je v katalogu `addListItems` / `editListItems` = ne (bez přístupu 403).
  Cesta A3 skončí na prvním zápisu 403 „Access is denied“, v cestě A2 chybí tlačítko „Nový“ a „Přidat aplikaci“ ukáže
  „You need access“. **Cesty A3 / A2 obcházejí chybějící CLI nebo souhlas správce, ne chybějící roli.** Bez role Člen /
  Vlastník zbývá jen žádost o roli. Důkazy: `test-dukazy/jakub-postup.md` (v repu workshopu).
- ❓ Větev „Entra: aplikace nemá dost práv (scope)“ neběžela: v labu má appka souhlas se všemi scopy. ❓ Windows / PowerShell 5.1 neměřeno.
- 📘 Bity práv (`addListItems` 0x2, `editListItems` 0x4) a rozdíl Entra vs SharePoint podle dokumentace a skillu `sharepoint-tenant-recon`.
- ✅ **Test v Claude i v Copilotu (24. 11., CLI 11.11, macOS):** tři situace (vše zelené / web bez katalogu /
  nepřihlášené CLI) prošly v obou agentech, viz `TEST.md` (v repu workshopu) a `TEST-copilot.md` (v repu workshopu).
- ⛔ V tenantu E.ON neověřeno.
