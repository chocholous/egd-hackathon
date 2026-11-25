# TEST v GitHub Copilot CLI: egd-data-seznamy (22. 11. 2026)

Copilot CLI 1.0.114 (`/opt/homebrew/bin/copilot`), model si vybral sám (Copilot Fusion, GPT-6 Luna).
Spuštěno přes `tools/copilot-run.sh` s izolovaným HOME a skilly `egd-data-seznamy` + `egd-prvni-appka`
v `~/.copilot/skills`, s přihlášením m365 z labu (`--m365-from ~/.m365-osobni`), `--timeout 1800`.
Web `https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-miniskilly`, seznam `Spokojenost`
se 6000 hlasy za 60 dní (100 za den, `tools/miniskilly-naplnit-seznam.py --typ spokojenost`),
index `Den` před každým během **vypnutý**.

Prompt (účastník, vše předem): projekt `prvni-appka` ze šablony Spokojenost, „dashboard ať ukazuje
hlasy za posledních 30 dní a funguje i s tisíci záznamy (bojím se limitu 5000)“, „nastav, co je
potřeba na seznamu“, postav a nasaď na stránku `spokojenost-copilot` / `spokojenost-copilot2`,
cesta k CLI přes `--cli`, seznam nezakládat.

## Výsledek: ✅ (2. běh), 1. běh našel chybu ve skillu

| Krok | Běh 1 | Běh 2 (skill opravený) |
|---|---|---|
| Skill sám načetl (`● skill(egd-data-seznamy)`, `● skill(egd-prvni-appka)`) | ✅ | ✅ |
| Zjistil, že `Den` nemá index, a zapnul ho CLI `spo field set … --Indexed true` (tvar ze skillu) | ✅ | ✅ |
| Přidal `_ctiVse` ze skillu (stránky po 1000, `_popisChyby` s `SPQueryThrottledException`) | ✅ | ✅ |
| Čtení další stránky | ❌ jen `odata.nextLink` (chyba ve skillu) | ✅ `@odata.nextLink ?? odata.nextLink` |
| Filtr na serveru | `Den ge '<před 29 dny>'` (jako skill) | 30× `Den eq '<den>'`, po 5 souběžně (vlastní volba) |
| Ověření REST před nasazením (curl s tokenem z CLI, všechny stránky) | ✅ 2900 hlasů, 3 stránky | ✅ 2900 |
| Build (`appka.mjs build`) | ✅ | ✅ po opravě vlastní chyby (`Array.flat` mimo ES2019 → `reduce`) |
| Nasazení a stránka (`appka.mjs nasadit … --ano`, `over`) | ✅ 1.0.0.1 | ✅ 1.0.0.2 |
| **Appka v prohlížeči** (`tools/lab-spo-stranka.mjs ondrej.horak`) | ❌ „**1000** hlasů za posledních 30 dní“ místo 2901 | ✅ dashboard 30 dní, klik na 4 → „Zapsáno: 4“, hned v přehledu |
| Ptal se / zastavil se | ne (prompt vše předal) | ne |
| Upravoval soubory skillu | ne | ne |

Důkazy: `sondy/miniskilly/ui/12-copilot-spokojenost-30dni.png` (běh 1, 1000), `ui/14-copilot2-30dni-hlas.png`
(běh 2), přepisy a prompty v `sondy/miniskilly/copilot-prepisy/beh1/` a `beh2/` (`prompt.txt`,
`vystup/log.txt`, `prepis.md`, `usage.json`; běh 1: 1,71 AI Credits, 3 min 49 s; běh 2: 1,9, 4 min 18 s).

## Nalezená chyba a oprava skillu

`spHttpClient.get(url, SPHttpClient.configurations.v1, …)` posílá hlavičku `OData-Version: 4.0`
(`@microsoft/sp-http-base`, `SPHttpClientHelper`: `defaultODataVersion`). SharePoint pak i při
`odata=nometadata` vrací další stránku pod klíčem **`@odata.nextLink`** ✅:

```
curl … -H "Accept: application/json;odata=nometadata"                        → {"odata.nextLink": …}
curl … -H "Accept: application/json;odata=nometadata" -H "OData-Version: 4.0" → {"@odata.context": …, "@odata.nextLink": …}
```

Ověření agenta curl-em (bez té hlavičky) proto prošlo, ale appka skončila po první stránce. Skill teď
čte oba klíče, v ověření chce hlavičku `OData-Version: 4.0` a porovnání počtu v appce s počtem z REST.
Tuto chybu měl i kód v dřívějším e2e (appka Evidence); nepoznalo se to, protože dotazy vracely pod 1000 položek.

## Rozdíly Copilot vs Claude

- Copilot skripty `appka.mjs` čte po částech (`Read … L1:220`) a `--help` bere jako chybu (kód 2); neškodí.
- V běhu 2 zvolil jiný tvar dotazu (dotaz na každý den) než skill; výsledek je správný.
- Vykreslení stránky sám neověří („je potřeba ověřit v prohlížeči“); proto ověření prohlížečem dělá tester.
- Claude: viz [TEST.md](TEST.md).

## Dodatek: sekce „ETag / souběžná editace“ (24. 11. 2026)

Copilot CLI (výchozí model, GPT-6 Luna), `tools/copilot-run.sh`, izolovaný HOME, skilly `egd-data-seznamy` a `egd-prvni-appka` bez `TEST*.md`.
Projekt: appka Evidence požadavků (`sondy/miniskilly/etag-EvidenceWebPart.orig.ts`, `IF-MATCH: *`), `node_modules` jako APFS klon ze vzoru + `npm ls` OK.
Zadání bez návodu: „když jeden schválí a druhý se starou stránkou zamítne, schválení se tiše ztratí; oprav, ať se cizí změna neztratí a druhý dostane hlášku a vidí aktuální stav; postav; nic nenasazuj“. Důkazy: [audit/test-copilot/beh-etag](../../audit/test-copilot/beh-etag/) (`log.txt`, `prepis.md`, `EvidenceWebPart.ts`, `zmeny.diff`).

| Krok | Výsledek |
|---|---|
| Skill sám načten (`● skill(egd-data-seznamy)`) | ✅ |
| `IF-MATCH: *` nahrazen ETagem z načtení (`p['@odata.etag']`), `X-HTTP-Method: MERGE` | ✅ (`zmeny.diff`) |
| 412 → srozumitelná hláška, znovunačtení seznamu, aktuální stav v hlášce | ✅, nad rámec skillu dopsal i čtení aktuálního stavu položky |
| Zápis bez ETagu u úpravy položky odmítnut (pojistka) | ✅ |
| `npm run build` | ✅ prošel (první pokus z nadřazené složky spadl na chybějícím `package.json`, opravil si cestu); `.sppkg` vznikl |
| Soubory skillu po běhu | ✅ beze změny (`diff -r`) |
| Nic nenasadil ani nezapsal | ✅ |
| Chování v prohlížeči (dva uživatelé, 412 v appce Copilota) | ❓ nenasazeno: `appka.mjs nasadit` umí jen web part Spokojenost. Stejný mechanismus je změřený v kódu Claude ✅ (viz SKILL.md) |
| Oprava čtení další stránky (`@odata.nextLink`) | ❓ nebylo zadáno a Copilot ji neudělal (jiná sekce skillu) |

Cena 1,14 AI Credits, 1 min 34 s. **Závěr:** nová sekce Copilotovi stačí, aby opravil souběh správně a build prošel; chování nasazené appky ❓.
