# Cesta A2: SPFx appka nahraná ručně v prohlížeči

Kdy: npm a Node jdou (`novy` a `build` projdou), web má vlastní katalog aplikací a uživatel na
webu roli Člen/Vlastník, ale **CLI for Microsoft 365 se nepřihlásí** (chybí appId, AADSTS65001,
blokuje Conditional Access). Výsledek je stejná appka jako v cestě A, jen kroky 3-4 dělá člověk.

Stav: ✅ kroky 2–6 prošel 24. 11. 2026 v labu účastnický účet egd01 (vlastník webu, bez CLI) v českém
SharePointu, popisky níže jsou z té zkoušky (`TEST.md` (v repu workshopu), sekce egd01-dev). V závorce je
anglický originál ❓ (neověřený). Když uživatel tlačítko nenajde, ať pošle snímek obrazovky.

## 1. Postav balíček (agent)

```
node "<A>" novy --slozka prvni-appka --znacka <eon|egd> --rezim <single|open>
node "<A>" build --slozka prvni-appka
```

Výsledek: `prvni-appka\sharepoint\solution\prvni-appka.sppkg`. Uživateli řekni přesnou cestu.

## 2. Seznam (uživatel, cca 3 minuty)

Na webu: **Obsah webu → Nové → Seznam** → v okně „Jak chcete začít?“ pod „Vytvořit z prázdného“
dlaždice **Seznam** (New → List → Blank list) → název `MojeAppka` → **Vytvořit**.

Název `MojeAppka` appka čte ve výchozím stavu. Seznamy `Spokojenost` a `SpokojenostHodnoceni` na
webu patří appce egd-pripravenost (jiné sloupce), nesahej na ně. Jiný název seznamu jde nastavit
v kroku 5 ve vlastnostech web partu.

Sloupce přidej přes **+ Přidat sloupec** (+ Add column). **Název napiš nejdřív bez diakritiky**
přesně takto - podle něj vznikne vnitřní název, který appka čte. Popisek s diakritikou můžeš
změnit až potom.

| Název při zakládání | Typ | Nastavení |
|---|---|---|
| `Hodnoceni` | Číslo (Number) | **Další možnosti** → minimum 1, maximum 5; potom lze přejmenovat na „Hodnocení“ |
| `Den` | Text (Single line of text) | |

## 3. Nahraj balíček do katalogu webu (uživatel)

1. Otevři `<web>/AppCatalog` (knihovna „Aplikace pro SharePoint“ / Apps for SharePoint).
   Neotevře se = web nemá katalog → věta pro IT (SKILL.md) a cesta B.
2. **Nahrát** (Upload) → vyber `prvni-appka.sppkg`.
3. V dialogu **Povolit / Nasadit** (Enable app / Deploy). Políčko „zpřístupnit všem webům“
   nezaškrtávej - u katalogu webu by to stejně platilo jen pro tenhle web.
4. Chyba „Přístup odepřen“ = chybí role na webu → věta „Role na webu“.

## 4. Přidej appku na web (uživatel)

Krok je **nutný** ✅: bez něj web part v nabídce stránky není (ani se `skipFeatureDeployment`).

1. **Obsah webu → Nové → Aplikace** (Site contents → New → App).
2. Filtr **Z naší organizace** → u `prvni-appka-client-side-solution` **Přidat** (Add). Hlášení
   „Přidání proběhlo úspěšně.“ Web part byl k dispozici do 10 s; když není, počkej minutu.

## 5. Stránka (uživatel)

1. **Obsah webu → Nové → Stránka** → „Galerie šablon“ → vpravo nahoře **Vytvořit prázdné**.
2. Do „Přidejte název“ napiš `prvni-appka` (soubor se pak jmenuje `prvni-appka.aspx`).
3. Klikni do první sekce, vpravo v panelu **Sada nástrojů** do vyhledávání napiš `Moje první appka`
   a klikni na výsledek. („Spokojenost s prostředím kanceláře“ je web part appky egd-pripravenost.)
   Celou šířku sekce nastavovat nemusíš.
4. Když appka ukáže „Seznam … na tomhle webu není“ nebo „SharePoint vrátil chybu 400 … Pole nebo
   vlastnost Den neexistuje“, seznam se jmenuje jinak nebo má jiné sloupce: na liště web partu
   **Upravit vlastnosti** → „Název seznamu na tomto webu“ → název seznamu z kroku 2. Hláška
   zmizí až po publikování a novém načtení stránky.
5. **Publikovat stránku** (Publish).
6. V galerii šablon je i oddíl „Aplikace na celou stránku“ s dlaždicí appky; celostránkovou stránku
   tudy zatím nikdo nezkoušel ❓, běžná stránka stačí.
   Odkaz s `?env=WebView` schová rám SharePointu na jakékoli stránce ✅:
   `<web>/SitePages/prvni-appka.aspx?env=WebView` (přesný název souboru je v adrese stránky).

## 6. Ověření

Stejné jako v SKILL.md (klik na 1–5 → „Zapsáno“ → dashboard se změní). Pak do
`pripravenost`/poznámek zapiš, že CLI zatím nejde, a pošli větu pro appId.

## Nová verze appky

Zvyš verzi v `config\package-solution.json`, `build`, v katalogu znovu **Nahrát** (přepsat) a
**Nasadit**. Na webu pak **Obsah webu** → u appky „…“ → **Podrobnosti → Získat / Aktualizovat**
(Details → Get it / Update), pokud se nabízí ❓.
