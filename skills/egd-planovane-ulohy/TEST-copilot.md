# Test skillu egd-planovane-ulohy v GitHub Copilot CLI (23. 11. 2026)

Tester: session ms-maily. Tooling `tools/copilot-run.sh` (izolovaný HOME ve scratchpadu, skill instalovaný přes
`copilot-skill-install.sh`), Copilot CLI 1.0.114, model vybral Copilot sám („GPT-6 Luna“), macOS.
Bez přihlášení k M365 (zadání je jen poradit). Důkazy: [sondy/ms-maily/copilot/pu2/](../../sondy/ms-maily/copilot/pu2/)
(`zadani.txt`, `log.txt`, `prepis.md`, `prikaz.txt`, `instalace.txt`).

**Závěr jednou větou:** Copilot skill najde a podle něj doporučí cestu B s podmínkou licence, časové pásmo Praha,
Environment Maker a větu pro IT; nic nezaložil. Vynechal přihlášení připojení (Sign in) a past „flow po uložení Off“,
a „pracovní dny“ jen zmínil bez postupu. Poslední bod skill tehdy neuměl, doplněno a ověřeno v labu.

## Zadání účastníka

> Pracuju v EG.D a mám na SharePointu seznam "Požadavky" (web …/sites/egd-sonda-ms-maily). Chci, aby mi každý
> pracovní den v 6 ráno přišel mail s přehledem nových požadavků za poslední den. Nevím, jestli na to mám licenci
> ani jaká práva. Poraď mi, jak to udělat krok za krokem. Zatím nic nezakládej ani nespouštěj […]

Běh: 30 s, návratový kód 0, „Changes +0 -0“, 0,28 AI Credits.

## ✅ Prošlo (log běhu)

| Co | Výsledek |
|---|---|
| skill vidí a načte | `copilot skill list` ho ukázal; na první větu zavolal `skill(egd-planovane-ulohy)` |
| cesta B (Scheduled cloud flow) | ✅ zvolil B, standardní konektory |
| podmínka licence | ✅ „z odkazu nejde poznat, jakou máte licenci“, krok 1 = otevřít make.powerautomate.com |
| časové pásmo v Recurrence | ✅ „(UTC+01:00) Prague“, letní/zimní čas |
| Get items, Create HTML table, Send an email (V2) | ✅ ve správném pořadí, jen užitečné sloupce |
| Save, Test, zapnutí, kontrola prvního **plánovaného** běhu | ✅ (odpovídá „Neříkej naplánováno, dokud…“) |
| Environment Maker, DLP, vlastník flow (odchod) | ✅ |
| věta pro IT | ✅ vlastní znění, obsahově shodné s větou B |
| nic nezaložil ani nespustil | ✅ žádný shell příkaz, „Changes +0 -0“ |
| velký seznam: filtr už v Get items a stránkování | ✅ zmínil |

## ❌ / ❓ Nalezeno

1. **Přihlášení připojení (Add new → Sign in → Pick an account)** Copilot nezmínil. Skill to má v kroku 3 a 5
   i v žebříku (krok 4, „Unauthorized“). Chyba modelu, ne skillu; ❓ zda posílit v popisu.
2. **Past „po uložení je flow Off“ / přepínač Enabled** nezmínil (napsal jen „ulož a zapni“). Skill to má v kroku 7.
3. **„Jen pracovní dny“** Copilot zmínil bez postupu. Skill to tehdy neuměl (lab měl Repeat every 1 Day).
   **Opraveno:** do kroku 2 doplněno Frequency Week + Po–Pá. Definici Flow API uložil a vrátil ✅
   (`sondy/ms-maily/recurrence-po-pa.log`); popisky v designeru a běh v pondělí ❓ (Neověřeno ve skillu).
4. **„Za poslední den“** Copilot navrhl filtr podle Created (ne `Stav eq 'Nový'`), správně upozornil na pondělí
   a víkend. Skill to tehdy neměl. **Doplněno a změřeno:** `Created ge '@{addDays(utcNow(),-1)}'` prošlo nad
   6000 položkami bez chyby ✅ (`sondy/ms-maily/filtr6000-beh1.json`).
5. Copilot nepoužil žebřík jako tabulku a na konci nezapsal, který krok prošel (zadání ale nic nezakládat).

## Rozdíly Copilot vs Claude

| Oblast | Claude (lab, `sondy/ms-maily/README.md`) | Copilot CLI |
|---|---|---|
| provedení | prošel celou klikací cestu B v labu | jen poradil (dle zadání) |
| Sign in u připojení | klik „Pick an account“ ✅ | nezmínil |
| Enabled po uložení | našel past (Off) a zapnul ✅ | „ulož a zapni“ |
| definice „za poslední den“ | Stav = Nový | Created za 24 h + upozornění na víkend (lepší otázka; doplněno do skillu) |

**Výsledek: ✅ prošlo** (správná cesta, podmínky, nic nezaložil); nálezy 3 a 4 opraveny ve skillu a ověřeny v labu,
1 a 2 jsou mezery odpovědi modelu, které skill pokrývá.
