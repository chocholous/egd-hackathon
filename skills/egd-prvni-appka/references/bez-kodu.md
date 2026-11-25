# Cesta B: první appka bez kódu (seznam + formátování, volitelně Power Apps)

Kdy: SPFx nejde (web nemá katalog aplikací, uživatel nemá roli, npm nebo Node jsou blokované),
nebo A narazila a nechceme čekat na IT. Výsledek je stejné hodnocení spokojenosti 1–5, jen bez
vlastního kódu a s jednodušším přehledem. Potřeba je jen role **Člen** na nějakém webu.

Stav: založení seznamu a formátování přes CLI (`seznam`) ✅ v labu; kroky v prohlížeči a
Power Apps ❓ (z dokumentace, české popisky se můžou lišit, anglický originál je v závorce).

## 1. Seznam

- **CLI jde** (přihlášení OK): `node "<A>" seznam --web <web>` → plán → „ano“ → `--ano`.
  Založí seznam `MojeAppka`, sloupce Hodnocení (číslo 1–5) a Den a barevné formátování hodnocení.
- **CLI nejde:** uživatel ho založí v prohlížeči podle
  [rucne-v-prohlizeci.md](rucne-v-prohlizeci.md), krok 2.

Hlasování: v seznamu **Nový** → Hodnocení 1–5, Den dnešní datum ve tvaru `2026-11-25`.

## 2. Malý dashboard bez kódu (uživatel v prohlížeči, 3 minuty)

1. **Seskupit podle** Den (záhlaví sloupce Den → Seskupit podle Den / Group by Den).
2. Záhlaví sloupce Hodnocení → **Součty → Průměr** a **Počet** (Totals → Average, Count) ❓.
3. **Uložit zobrazení jako** (Save view as) „Přehled po dnech“.

Výsledek: pro každý den počet hlasů a průměr. Rozložení 1–5 ukáže filtr podle Hodnocení.

## 3. Volitelně: formulář z Power Apps

Jen pokud uživatel chce hezčí formulář a `make.powerapps.com` se mu otevře s prostředím
(zjistil to `egd-pripravenost`, krok 9).

1. V seznamu **Integrovat → Power Apps → Přizpůsobit formuláře** (Integrate → Power Apps →
   Customize forms).
2. Pole Den nastavit na výchozí `Text(Today(), "yyyy-mm-dd")` a skrýt; Hodnocení jako pět tlačítek
   nebo posuvník 1–5; barvy podle značky z kroku 0: EG.D (`#1200E0` tlačítka, `#261B62` text; zdroj: `~/Projects/egd-vibecoding/README.md`), E.ON (`#EA1B0A` jen hlavní tlačítko, rohy 0).
3. **Publikovat do SharePointu** (Publish to SharePoint).

Licence: Power Apps nad SharePointem (standardní konektor) je součástí licencí Microsoft 365
E3/E5 📘; zda to platí v E.ON, ❓ - zjistí se tím, že Studio jde otevřít.

## Kdy přejít z B na A

Až IT založí katalog aplikací na webu a dá roli Člen: seznam `MojeAppka` zůstane, appka ho
převezme beze změny (stejné interní názvy sloupců). Stačí cesta A, kroky 1, 2 a 4.
