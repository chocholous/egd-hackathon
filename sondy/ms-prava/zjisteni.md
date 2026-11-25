# ms-prava — ověření skillu egd-prava-role (22. 11. 2026)

Web: https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava (Communication site, lcid 1029, site app catalog).
Appka: `prvni-appka/` (šablona egd-prvni-appka Evidence + bity CancelCheckout/AddListItems/ManageLists), nasazená (`nasadit.log`).
Vlastník webu pro klikání: karolina.mala (Vlastníci webu). Profily Chrome = kopie v `~/.config/ppf-rooms-lab/profily-ms-prava/`.

## Klikací cesta v české UI ✅ (logy a screenshoty `ui/`)

| Skill psal | UI skutečně ukazuje | Důkaz |
|---|---|---|
| Ozubené kolo → Oprávnění webu | **Oprávnění k webu** | `ui/01-ozubene-kolo.png` |
| Upřesnit nastavení oprávnění | **Rozšířené nastavení oprávnění** (odkaz dole v panelu) | `ui/02-opravneni-k-webu.png` |
| Úrovně oprávnění | **Úrovně oprávnění** (pás karet) | `ui/04-urovne.png` |
| „Kopírovat úroveň oprávnění“ | **Zkopírovat úroveň oprávnění** (dole na stránce Přispívání) | `ui/05-prispivani.png` |
| zaškrtni **Přepsat chování seznamu** | **Přepsat rezervaci a uživatelské nastavení** (`CancelCheckout`) | `ui/05`, `urovne.json` |
| Vytvořit | **Vytvořit** | `ui/07-schvalovatel.log`, `urovne.json` |
| Vytvořit skupinu | **Vytvořit skupinu** (pás karet Rozšířeného nastavení) | `ui/09-nova-skupina.png` |
| přidat lidi | stránka skupiny → **Nový** → dialog „Sdílet: …“ → jméno → ZOBRAZIT MOŽNOSTI → odškrtnout „Poslat pozvánku e-mailem“ → **Sdílet** | `ui/14-pridat.png`, `ui/15-*.log` |
| Nastavení seznamu | ozubené kolo v seznamu → **Nastavení seznamu** | `ui/16.log` |
| Oprávnění pro tento seznam | **Oprávnění pro: Seznam** | `ui/17.log` |
| Zastavit dědění oprávnění | **Ukončit dědění oprávnění** + potvrzovací dialog | `ui/18.log`, `ui/19.log` |
| odebrat Členy a Návštěvníky | zaškrtnout → **Odebrat uživatelská oprávnění** + potvrdit | `ui/20.log` |
| Udělit oprávnění | **Udělit oprávnění** → jméno skupiny → ZOBRAZIT MOŽNOSTI → „Vybrat úroveň oprávnění“ → Sdílet | `ui/22-*.log` |
| Upřesňující nastavení | **Upřesnit nastavení** | `ui/17.log` |
| „Jen položky, které vytvořil uživatel“ | **Číst položky vytvořené daným uživatelem** | `ui/23.log` |
| „Vytvořit a upravit jen vlastní položky“ | **Vytvořit položky a upravit položky vytvořené daným uživatelem** + OK | `ui/23.log`, `ui/24.log` |

Kontrola `spo list get … --properties ReadSecurity,WriteSecurity,HasUniqueRoleAssignments` → `2, 2, true` ✅ (`kontrola-list-get.json`).

## Nová zjištění

1. ✅ **Skupiny jen na seznamu nestačí.** Zadavatel (jakub) bez oprávnění na webu dostal na stránce appky
   „Potřebujete přístup“ (`ui/30.log`, `ui/30-jakub-bez-webu.png`). Skupinám je nutné dát na webu **Čtení**
   (Rozšířené nastavení → Udělit oprávnění → Čtení; `ui/31-*.log`). Pak stránka 200 (`matrix-pred-polozkami.jsonl`).
2. ✅ Zakladatel skupiny se do ní automaticky přidá jako člen (karolina je ve všech třech; `ui/14-pridat.png`).
3. ✅ Vestavěná úroveň **Návrh** obsahuje `CancelCheckout` i `ApproveItems` (`urovne.json`).
4. Entra skupina `egd-sonda-ms-prava Schvalovatelé` (`entra-skupina.json`, člen martina.cerna) vložená do SP skupiny
   Evidence Schvalovatelé (REST `sitegroups(13)/users`, LoginName `c:0t.c|tenant|<id>`): v 21:07 martina 403 (čerstvé členství).
5. ✅ M365 CLI v labu nemá práva na Graph (`entra user get` / `spo group member add --entraGroupIds` → Insufficient privileges).
6. Od koordinátora (měření `sondy/miniskilly/k2.jsonl`): Přispívání zapíše položku, ale index sloupce nezaloží (403) → indexy patří do přípravy seznamu (vlastník).

21:08–21:10 disk Macu plný (ENOSPC), práce stála.

## Appka v prohlížeči pod účty ✅ (`appka/`, nástroj `tools/prava-appka-klik.mjs`)

| Účet | Role v appce | Záložky | Vidí |
|---|---|---|---|
| jakub (Zadavatelé) | Zadavatel | Nový, Moje | jen „Notebook pro Jakuba“ (`01-jakub.json`), po schválení stav Schváleno (`05`) |
| zuzana (Zadavatelé) | Zadavatel | Nový, Moje | jen „Monitor pro Zuzanu“ (`02`); v seznamu `/Lists/Pozadavky` taky jen svou (`08-zuzana-seznam.log`) |
| eva (Schvalovatelé, EGD Schvalovatel) | Schvalovatel | Nový, Moje, **Ke schválení (2)** | obě; schválila Jakubovu (`03`, `04-eva-schvalit.json`) |
| karolina (Vlastníci + Správci) | Správce | + Ke schválení (1) | obě (`06`) |
| lucie (nic) | – | – | stránka Potřebujete přístup (`07`) |

REST pod tokeny (`matrix-po-polozkach.jsonl`, `tools/prava-role-over.py --cizi 1`): úprava Jakubovy položky zuzana 404, eva 204, karolina 204, lucie 403.
Příloha Jakubovy položky přímou URL v prohlížeči: zuzana Potřebujete přístup, eva obsah souboru (`appka/priloha-*.log`).

## Bity ✅ (`clen-test.jsonl`)
Seznam Pozadavky: eva Low 0x3c4313ef (CancelCheckout ano, ApproveItems ne), jakub 0x3c4312ef, karolina 0xfffbffff; High u eva/jakub 0x3b0.

## Člen webu vs vlastník ✅ (`clen-test.jsonl`)
jana jako Člen webu (Úpravy): POST roledefinitions 403, breakroleinheritance 403, POST sitegroups 403. Vlastnice webu karolina (ne GA) prošla celou klikací cestu.

## Varianta CLI + schvalovatel bez mazání ✅
`tools/prava-role-cli.sh` na seznamu PozadavkyCLI (`cli-varianta-2.log`, kontrola 2/2/true); skupiny CLI Zadavatelé (jana), CLI Schvalovatelé (tomas), úroveň „EGD Schvalovatel bez mazání“.
`bez-mazani.jsonl`: tomas vidí obě, upraví cizí 204, smaže cizí 403, smaže svou 403, recycle 403.
Pozn.: první běh selhal na ondrej.horakk (UPN je ondrej.horak, heslo v lab.secrets je pod klíčem s překlepem) → tomas přidán do Zadavatelů omylem a odebrán (`spo group member remove`), pak běh 2.

## Entra skupina ❓
martina přes Entra skupinu v SP skupině: 21:07, 21:10, 21:15, 21:18 pořád 403 (`matrix-entra.jsonl`).

## Doplněk po 2. kole auditu (21:25–21:50)
- `cli-graph-prava.log`: surový „Insufficient privileges“ pro `--entraGroupIds` a `entra user get`.
- Čerstvá varianta B na `PozadavkyCLI2` (`cli-varianta-3.log`): úrovně „EGD Zadavatel CLI2“ a „EGD Schvalovatel CLI2“ založené přes CLI,
  stejné `Low` jako z UI (`cli-varianta-3-urovne.txt`); tomas (schvalovatel s mazáním) upraví 204 a smaže cizí i svou 200 —
  smazané byly jen 2 testovací položky založené tímtéž testem (`cli-varianta-3-mereni.jsonl`).
- Entra skupina ✅ s prodlevou: martina v 21:47 Schvalovatel, 2 položky, stránka 200 (`matrix-entra-po.txt`, `entra-detail.txt`).
  Dřívější 403 na „stránku“ byla zčásti chyba kontroly v `prava-role-over.py` (dotaz na knihovnu Stránky bez fallbacku, opraveno);
  403 na seznam do 21:21 byla skutečná.
- lucie je od 21:18 ve skupině „CLI Návrh“ (Čtení na webu), proto už otevře stránku; na seznam Pozadavky dál nemá přístup (404).

## Těžké běhy po uvolnění disku (23. 11. 2026, 10:50–11:15)
- ✅ **A krok 1 bez mazání v UI**: Přispívání → Zkopírovat úroveň oprávnění → „EGD Schvalovatel UI bez mazání“ → zaškrtnout
  Přepsat rezervaci… → odškrtnout **Odstranit položky** → Vytvořit (`ui/40-pred-vytvorenim.png`, `ui/41-bez-mazani.log`).
  `Low` 1011028967, totožné s CLI „EGD Schvalovatel bez mazání“ (`ui/41-urovne.json`).
- ✅ **Vytvořit skupinu se zaškrtnutým Čtení** („UI Test Čtení“, id 35) → na webu přiřazení Čtení (`ui/42-*`).
- ✅ **Odebrání sebe ze skupiny**: zaškrtnout svůj řádek → Akce → Odebrat uživatele ze skupiny → potvrzovací dialog
  „Chystáte se odebrat ze skupiny následující členy“ → skupina prázdná (`ui/43-*`). Skupina „UI Test Čtení“ zůstala (prázdná, nic nemažu).
- ✅ **Appka s UPN** (`appka/09-upn-*.json`): jakub Zadavatel (Moje: Notebook pro Jakuba), zuzana Zadavatel (Monitor pro Zuzanu),
  eva Schvalovatel (Ke schválení (1)), karolina Správce, lucie „Jen čtení“ bez položek (stránku otevře díky skupině CLI Návrh, seznam nevidí).
  `_spPageContextInfo` na moderní stránce není (upn null), nástroj teď čte `/_api/web/currentuser`.
- ✅ **Copilot běh 3** na aktuálním SKILL.md, nové úrovně „Nákupy …“ na `PozadavkyCopilot3` (`copilot/beh3-*`, `skills/egd-prava-role/TEST-copilot.md`).
- ✅ `--output none` skryje chybu CLI (rc=1, prázdný výstup); `--output json` vypíše `Specify one of the following options: listId, listTitle, listUrl.` (CLI v11.11.0).
- Sandboxy Copilota (cop1–3) přesunuty do koše po zkopírování důkazů.

## Test v Claude (24. 11. 2026, měření 02:48) ✅
Agent účastníka = subagent Sonnet, zadání jako Copilot běh 3 (appka Objednávky, `PozadavkyClaude`, jakub/eva).
Výsledek a důkazy: `skills/egd-prava-role/TEST.md`, `claude-ucastnik/`. REST: eva 204 úprava, 403 ×3 mazání; jakub jen své.
Prohlížeč: jakub vidí 1 položku, eva 2; v menu Více má Odstranit jen jakub (`vice-*`).
Nové: CLI `spo group add` zakladatele do skupiny nepřidá (UI ano); `spo list get --withPermissions` na seznamu padá
(`VersionPolicies`), `spo list roleassignment list` v CLI 11 není → kontrola přiřazení přes `m365 request` (`pwsh-kontrola.*`).
`tools/spo-ui-krok.mjs`: `check:` teď s `force` (skryté zaškrtávátko řádku v moderním seznamu).
