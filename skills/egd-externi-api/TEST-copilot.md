# TEST: egd-externi-api v GitHub Copilot CLI

22. 11. 2026, GitHub Copilot CLI 1.0.114, macOS, izolovaný „počítač účastníka“ (`tools/copilot-run.sh`,
skilly `egd-externi-api` a `egd-dokumenty` v `~/.copilot/skills`). Model vybral Copilot sám (MAI Code 2 Flash).
Záznamy (zkopírované do repa): `sondy/ms-dokumenty/copilot/externi-api-log.txt`, `externi-api-prepis.md`, `externi-api-sandbox/`.

## Scénář

Prompt: „Chci do své SharePoint appky (web …/sites/egd-sonda-ms-dokumenty) načítat data z ARES (…/00177041)
a denní kurzy ČNB (https://api.cnb.cz/cnbapi/exrates/daily?lang=CZ). Zjisti, jestli to z appky půjde,
a řekni mi, co z toho mám udělat a jak. Nic neměň a nenasazuj.“

## Výsledek

| Krok | Stav | Důkaz |
|---|---|---|
| Sám vybral skill `egd-externi-api` | ✅ | `● skill(egd-externi-api)` |
| Spustil kontrolu CORS z originu webu (GET i preflight) | ✅ | 4× `curl.exe` → `command not found` (macOS), pak sám přešel na `curl` |
| Verdikt ARES ano (`*`, preflight OK), ČNB ne (bez hlavičky; preflight 403) | ✅ | shoduje se s měřením v prohlížeči (`sondy/ms-dokumenty/konzole-cz.log`) |
| Kód pro ARES přes `this.context.httpClient` a `HttpClient.configurations.v1` | ✅ | odpovídá skillu |
| U ČNB nabídl server / ruční data / Power Automate (Premium) a větu pro IT | ✅ | |
| Nic nezměnil | ✅ | `Changes +0 -0` |
| Cena / čas | 0,39 AI Credits, 30 s | |

## Rozdíly Copilot vs. Claude

- Copilot jako první doporučil Container Apps Job, i když zápis Jobu do seznamu je ve skillu ❓. Proto
  skill teď v žebříku řadí **ruční data (D2) před Job (D3)** a u Jobu píše ⚠.
- `curl.exe` na macOS neexistuje: skill teď výslovně říká `curl` a `/dev/null` pro macOS/Linux.
- Claude (tato session) navíc ověřil kód v nasazeném web partu a hlášku v konzoli; Copilot jen radil a měřil `curl`.
