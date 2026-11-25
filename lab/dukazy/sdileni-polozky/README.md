# Díra 10 (4.3 E): sdílení položky tlačítkem Sdílet v seznamu „vidí jen své“

Ověřeno v labu 24. 11. 2026 skriptem [`skripty/sdileni-polozky-ui.mjs`](../../../skripty/sdileni-polozky-ui.mjs)
nad přihlášenými profily prohlížeče. Heslo nezadával agent. Záznam kroků je v [sdileni.jsonl](sdileni.jsonl).

**Výsledek: ❌ Kolega sdílenou položku nevidí.** Běžný uživatel smí sdílet ✅, ale sdílení nemá žádný účinek.

| Krok | Výsledek | Důkaz |
|---|---|---|
| Na webu `/sites/egd05-dev` je seznam `SdileniTest` s `ReadSecurity=2` a `WriteSecurity=2`. Vlastník je egd05. Eva Veselá a Jakub Kučera jsou Členové (Úpravy). Web má `MembersCanShare=true`. | ✅ | jsonl `krok=setup` |
| Eva založí položku. Eva ji vidí, Jakub vidí 0 položek. | ✅ | jsonl `krok=polozka` |
| Eva, běžná uživatelka bez admin práv, označí položku a klikne na Sdílet. Do dialogu zadá Jakuba a klikne na Poslat. | ✅ smí. Dialog odpoví „Pozvali jste Kučera Jakub do upravit“. | `1`–`6-*.png`, jsonl `po_odeslani_text` |
| Práva na položce po sdílení | ✅ položka má vlastní práva. Jakub na ní dostal **Přispívání**. | jsonl `krok=prava` |
| Jakub v seznamu (REST `items`, UI „Všechny položky“) | ❌ 0 položek | jsonl `krok=vidi`, `9-jakub-nevidi.png` (`8-eva-vidi.png` je kontrola) |
| Jakub přímo: REST `items(1)`, CAML podle ID, `DispForm.aspx?ID=1` | ❌ 404 „Položka neexistuje“, prázdný výsledek, stránka „neexistuje žádná položka“ | jsonl `krok=primo`, `7-jakub-dispform.png` |

**Proč:** `ReadSecurity=2` filtruje podle autora položky. Na práva přidělená na položce se nedívá. Sdílení tak
oprávnění na položce zapíše, ale kolega ji stejně neuvidí. Kdo potřebuje sdílet jeden záznam, musí použít variantu
`ReadSecurity=1` s vlastními právy na položce (B v [10-container-app.md](../../../10-container-app.md)) nebo backend.

**Vedlejší účinky:**
- Sdílení poslalo Jakubovi pozvánku. Odešla v rámci labu, ven nic neodešlo.
- Eva a Jakub jsou zase odebraní ze Členů egd05-dev (`krok=uklid`).
- Seznam `SdileniTest` na egd05-dev **zůstal**. Smazat ho nejde: m365 v11 `spo list remove --recycle` vrací
  „Seznam nejde odstranit, když je blokovaný nebo se pro něj uplatňuje zásada uchovávání informací“.
  V tenantu platí zásada uchovávání.
