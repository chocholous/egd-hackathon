# Zadání první appky: Spokojenost s prostředím kanceláře dnes

Malá appka na SharePointu. Cíl: mít na vašem DEV webu funkční appku včetně dat a dashboardu. Kolik to zabere, závisí na tom, jestli vám jde přihlášení CLI (cesta A), nebo musíte nahrávat v prohlížeči (cesta A2). Zadání je záměrně malé, aby zbyl čas na úpravy podle vašich nápadů. Časový odhad zatím nemáme ověřený ❓: cesta A běžela v labu jen pod správcovským účtem, cesta A2 (ručně v prohlížeči) nikdo celá neprošel.

## Co appka umí

1. **Hodnocení.** Přihlášený uživatel klikne na jedno z pěti tlačítek **1–5**
   („1 = velmi nespokojen(a)“ … „5 = velmi spokojen(a)“) a odpoví na otázku
   *Jak jste dnes spokojení s prostředím kanceláře?*
2. **Jedno hodnocení na uživatele a den.** Po hlasování se tlačítka zamknou a appka ukáže, co uživatel
   zvolil. Druhý hlas tentýž den SharePoint sám odmítne (není to jen „schované tlačítko“).
3. **Malý dashboard** pro všechny, kdo appku otevřou:
   - **průměr dne** a počet hlasů dnes,
   - **rozložení 1–5** (kolik hlasů má která známka, v počtu i procentech),
   - **trend**: průměr po dnech za posledních 14 dní (počet dní jde změnit v nastavení web partu).

## Kde to běží a kde jsou data

- Appka je SharePoint Framework web part nasazený jako celostránková appka na **vašem DEV webu**
  (`<web>/SitePages/spokojenost.aspx?env=WebView`).
- Data jsou v SharePoint seznamu **SpokojenostHodnoceni** na stejném webu. Sloupce (interní názvy bez diakritiky):
  `Hodnoceni` (1–5), `DenCislo` (číslo `RRRRMMDD`), `Klic` (`uživatel|den`, unikátní), Vytvořil (SharePoint doplní sám).

## Pravidlo kvůli limitu 5000 položek

SharePoint seznam od 5000 položek odmítne dotaz, který **filtruje nebo řadí podle sloupce bez indexu**
(chyba 500). Proto:

- sloupce, podle kterých appka filtruje nebo řadí (**DenCislo**, **Klic**), jsou **indexované**; datum je
  uložené jako číslo `RRRRMMDD` právě proto (kalendářní datum SharePoint posouvá časovými pásmy);
- dashboard čte jen posledních N dní, po stránkách po 1000, a když by dat bylo víc, napíše upozornění;
- při vlastních úpravách **nikdy neřaďte ani nefiltrujte podle sloupce bez indexu**.

## Hotovo je, když

1. Otevřete adresu appky v prohlížeči a **vy sami** kliknete na hodnocení; zobrazí se „Děkujeme“.
2. Tlačítka se zamknou a obnovení stránky (F5) ukáže pořád vaše hodnocení.
3. Dashboard ukazuje vaše hodnocení v průměru dne a v rozložení.
4. Druhý účet (kolega) může ještě tentýž den hodnotit nezávisle na vás.
5. V seznamu `<web>/Lists/SpokojenostHodnoceni` jsou řádky podle toho, kolik lidí hlasovalo.

## Nápady na úpravy (až základ běží)

Filtr podle týdne, textová poznámka k hodnocení, barevné tlačítka podle známky, export do Excelu, upozornění
při průměru pod 3, jiná otázka (kantýna, hluk, teplota).
