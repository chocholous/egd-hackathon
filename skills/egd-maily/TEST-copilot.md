# Test skillu egd-maily v GitHub Copilot CLI (23. 11. 2026)

Tester: session ms-maily. Tooling `tools/copilot-run.sh` (izolovaný HOME ve scratchpadu), skilly `egd-prvni-appka`
a `egd-maily`, Copilot CLI 1.0.114, model vybral Copilot sám („GPT-6 Luna“), macOS. Přihlášení m365 zkopírované
z labu (`--m365-from ~/.m365-osobni`, `pavel.admin`), CLI 11.11.0 v `node_modules` pracovní složky.
Zakázané nástroje: `m365 spo tenant appcatalog*`, `m365 entra*`. Proti E.ON nic.
Důkazy: [sondy/ms-maily/copilot/mm1/](../../sondy/ms-maily/copilot/mm1/) (`zadani.txt`, `log.txt`, `prepis.md`,
`SpokojenostWebPart.ts` a `package-solution.json` tak, jak je Copilot nechal, `novy.log`).

**Závěr jednou větou:** Copilot podle skillu přidal do čisté appky tlačítko, které pošle dnešní hlasy jako CSV přes
Graph `sendMail`, doplnil `webApiPermissionRequests` s `Mail.Send`, appku postavil a nasadil jen na zadaný web,
nic neschválil ani neposlal. Klik na jeho tlačítko pod jiným lab účtem vrátil **202** a mail s CSV přílohou
dorazil ✅.

## Příprava

Čistý projekt `appka.mjs novy --slozka prvni-appka` (npm ci) a `.pripravenost/vysledky.json` ze skutečného
běhu (web přepsaný na `egd-sonda-ms-maily`). Zadání účastníka:

> Mám v téhle složce svou první appku (prvni-appka) … Chci do ní přidat tlačítko "Poslat výsledky mailem": pošle
> hlasy z dnešního dne jako přílohu CSV na adresu eva.vesela@… Pak appku postav a nasaď na můj web …/egd-sonda-ms-maily
> (zápis na tento jeden web předem schvaluji …). Na jiný web nic nezapisuj, nic neschvaluj tenant-wide a mail sám
> neposílej … Na konci mi řekni, co mám udělat, když po kliknutí dostanu chybu 403.

Běh: 7 min 33 s, návratový kód 0, „Changes +87 -7“ (jen projekt, soubory skillů beze změny – `diff -r`), 3,64 AI Credits.

## ✅ Prošlo (změřeno)

| Co | Výsledek | Důkaz |
|---|---|---|
| skill vidí a načte | `skill(egd-maily)` na první větu, pak `skill(egd-prvni-appka)` pro build/nasazení | `log.txt` |
| `webApiPermissionRequests` | ✅ `{"resource": "Microsoft Graph", "scope": "Mail.Send"}` před nasazením | `package-solution.json` |
| kód 1:1 se skillem | ✅ `MSGraphClientV3` (`getClient('3')`), `/me/sendMail`, `fileAttachment` s `contentBytes` (base64 přes bajty UTF-8), `saveToSentItems: true`, CSV s BOM a `;` | `SpokojenostWebPart.ts` ř. 100–121 |
| chyba do UI | ✅ zobrazí `HTTP <kód> <code> <message>` | ř. 123–130 |
| plán → `--ano` jen na zadaný web | ✅ `seznam` a `nasadit` nejdřív bez `--ano` (rc 10), pak s ním; nic tenant-wide | `log.txt` |
| build, nasazení | ✅ `build` rc 0, `nasadit` 34 s, stránka `prvni-appka.aspx` | `log.txt` |
| nic neschválil, mail neposlal | ✅ (žádný `permissionrequest approve`, žádný Graph) | `log.txt` |
| **klik na jeho tlačítko** (účet Tomáš, hlas 4) | ✅ `[graph] 202 …/me/sendMail`, `Mail.Send v tokenu: true`; UI „Výsledky … byly odeslány“ | [copilot-mm1-klik.log](../../sondy/ms-maily/copilot-mm1-klik.log), [copilot-mm1-klik.png](../../sondy/ms-maily/copilot-mm1-klik.png) |
| doručení | ✅ Eva má „Výsledky hlasování 2026-11-23“ od Tomáše s `hlasy-2026-11-23.csv` (`Den;Hodnocení` / `2026-11-23;4`) | [copilot-mm1-doruceni.log](../../sondy/ms-maily/copilot-mm1-doruceni.log) |
| rada k 403 | ✅ nejdřív nové anonymní okno (starý token), pak chybějící schválení `Mail.Send`, upozornil, že platí tenant-wide, náhrada `mailto:` | `log.txt` (závěr) |

## ❌ / ❓ Nalezeno

1. **Rada k 403 bez věty pro IT.** Copilot napsal „řešení připravené IT“, ale nedal větu pro ServiceNow
   ze skillu (žebřík krok 4). Mezera odpovědi; skill větu má. ❓ zda ji v žebříku zvýraznit.
2. **Druhé nasazení nedokončil:** při drobné úpravě (verze 1.0.0.2) si m365 CLI v izolovaném HOME řeklo o nové
   přihlášení zařízením. Copilot to správně zastavil, vrátil zdroj na nasazenou verzi 1.0.0.1 a přestavěl.
   Příčina je v testovacím prostředí, ne ve skillu: sdílené přihlášení labu `~/.m365-osobni` (zdroj kopie) v tu dobu
   zneplatnil jiný test (CLI 12 nad sdíleným HOME smazal refresh token, podle hlavní session). Od 23. 11. platí
   `tools/lab-m365.sh` a pro CLI z `node_modules` vlastní HOME (CLAUDE.md § Lab).
3. Seznam `Spokojenost` Copilot založil sám přes `appka.mjs seznam` (plán → `--ano`), protože na webu chyběl.
   V zadání to bylo kryté souhlasem se zápisem na web.

## Rozdíly Copilot vs Claude

| Oblast | Claude (`sondy/ms-maily/README.md`) | Copilot CLI |
|---|---|---|
| kde tlačítko | panel „Poslat mailem“ v appce Evidence, adresa z pole | pevný příjemce z konstanty v kódu (podle zadání) |
| čtení skriptu | ne | četl `appka.mjs` ř. 200–480 a nápovědy m365 (nic neupravil) |
| 403 | žebřík kroky 1–6 vč. věty pro IT | kroky 2, 5 a „IT“ bez věty |

**Výsledek: ✅ prošlo** – kód, nasazení i skutečné odeslání s přílohou ověřeny klikem v labu.

## Dodatek: sekce „PDF + mail jedním tlačítkem“ včetně LibreOffice (24. 11. 2026)

Copilot CLI (výchozí model), skilly `egd-maily`, `egd-dokumenty`, `egd-prvni-appka` bez `TEST*.md`, projekt `prvni-appka` ze šablony, `node_modules` jako APFS klon (+ `npm install` doplnil 158 balíčků, `tools/apfs-dedupe.py`), CLI 11 přes `--cli`, přihlášení labu zkopírované. Zadání (bez návodu na kód): panel „PDF mailem“, tlačítko 1 PDF z hlasů přímo z prohlížeče, tlačítko 2 Word → převodní API (Container App, adresa a appId v zadání) → PDF mailem, adresu API číst z `assets/prevod-api.json` v knihovně, nasadit na `egd-sonda-ms-maily` jako stránku `pdf-mail-copilot`, mail sám neposílat. Důkazy: [audit/test-copilot/beh-maily](../../audit/test-copilot/beh-maily/).

| Krok | Výsledek |
|---|---|
| Skilly načteny (`egd-maily`, `egd-dokumenty`) | ✅ |
| Varianta A (pdf-lib + font z knihovny, `Mail.Send`) v kódu | ✅ postavil `pdf-lib@1.17.1`, `@pdf-lib/fontkit`, font `assets/Roboto-Regular.ttf` z knihovny |
| Varianta C1 (Word `docx` → `AadHttpClient` POST `/api/pdf?ext=docx` → mail) v kódu | ✅, `egd-ca-dokumenty` / `access_as_user` v `package-solution.json`, `assets/prevod-api.json` (už v knihovně, znovu použil po kontrole) |
| Build, nasazení jen na zadaný web, stránka publikována (verze 1.0.0.2) | ✅ (`log.txt`) |
| Klik 1 jako Tomáš → Eva: **202**, `Mail.Send` v tokenu, UI „Odesláno: spokojenost-2026-11-24.pdf“ | ✅ 1,9 s; doručeno, `%PDF-1.7`, Producer pdf-lib, font Roboto vložený, čeština ✅ (`doruceni.log`, `prijato-spokojenost-2026-11-24.pdf`) |
| Klik 2 (LibreOffice): **202**, UI „Odesláno: spokojenost-lo-…pdf“ | ✅ 21,9 s (studený start převodní služby); doručeno, `%PDF-1.6`, Producer LibreOffice 7.4, Liberation Serif, čeština ✅ |
| Soubory skillů po běhu | ✅ beze změny |
| Mail sám neposlal | ✅ (klikl jsem já, adresát lab účet Eva) |
| Schválení `Mail.Send` / `access_as_user` | beze změny: v labu už schváleno (tenantově), Copilot nic neschvaloval ✅; v E.ON ⛔ chce správce |

Drobnosti: Copilot spustil `npm install` omylem v nadřazené složce (vznikly kořenové soubory, sám je odstranil), `m365 spo page clientsidewebpart add` mu dvakrát spadl na `Invalid section '1'`, pak to vyřešil (stránka běží). Cena 6,56 AI Credits, 7 min 34 s.
**Závěr:** obě tlačítka (A i C1) prošla od zadání po doručené PDF ✅; varianta B (Word → PDF přes Graph) a C2 (OBO) nezadány ❓.
