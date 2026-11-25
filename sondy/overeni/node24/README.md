# I5: build šablony první appky na Node 24 vs. 22 (Ověřovatel, 24. 11. 2026)

Šablona `skills/egd-prvni-appka/templates/spokojenost` (SPFx 1.24.1, `engines`: 22.14–<23, 24, 26), projekt `prvni-appka/` (gitignored). Stroj: macOS arm64.

## Postup (vše v logu)
1. `node …/appka.mjs novy --bez-instalace` ([01](01-novy-bez-instalace.txt)): 0,08 s, zámek shodný se šablonou.
2. `node_modules`: **shodný vzor se zámkem šablony v projektu není** (všechny vzory mají SPFx 1.23.2, šablona 1.24.1). Klon nejbližšího vzoru `sondy/container-app/libreoffice/spfx/node_modules` přes `cp -c -R` ([02](02-klon-node_modules.txt), 69 s) a `npm install` (rozdíly: +158, −76, ~112 balíků, 35 s) na Node 24 ([03](03-npm-install-node24.txt)). Pak `apfs-dedupe` ([04](04-apfs-dedupe.txt)): 17 min, 58 159 souborů nahrazeno klonem, 174 MB logicky; volné místo vzrostlo z 3,7 na 3,9 GiB. Instalace probíhala pod Node 24 a oba buildy sdílejí tento strom.
3. Build: `node …/appka.mjs build` (`heft test --clean --production && heft package-solution --production`) s Node 24 a s Node 22.

## Verze a časy

| Node | Zdroj | Build 1 | Build 2 | `.sppkg` | Stav | Důkaz |
|---|---|---|---|---|---|---|
| **24.22.3** (přenosný, `darwin-arm64.tar.gz`, SHA256 `ff6e17d4…0307fd` ověřen proti `SHASUMS256.txt` z nodejs.org) | nodejs.org, rozbaleno mimo repo | **10,2 s** | **11,3 s** | 12 064 / 12 066 B | ✅ build prošel oba | [05](05-build-node24.txt), [07](07-build-node24-opakovani.txt) |
| **22.23.5** (systémový; splňuje 22.14+) | již nainstalovaný | 32,0 s (první běh po Node 24) | 14,1 s | 12 065 / 12 062 B | ✅ build prošel oba | [06](06-build-node22.txt), [08](08-build-node22-opakovani.txt) |
| 22.14.0 (přesně spodní hranice) | – | – | – | – | ❓ neměřeno (testována 22.23.5) | – |

Pořadí běhů: Node 24 (10,2) → Node 22 (32,0) → Node 24 (11,3) → Node 22 (14,1). Rozdíly 22 vs. 24 jsou v řádu šumu cache disku (první běh po přepnutí je pomalejší), žádný systematický rozdíl jsem neprokázal; build na obou trvá ≈ 10–14 s. Velikost `.sppkg` se mezi běhy liší o jednotky bajtů (nedeterminismus balíčku), obsah jsem neporovnával.

## Závěr
- ✅ Šablona se na přenosném Node 24.22.3 postaví (`npm install` i `npm run build` bez chyb, `.sppkg` 12 KB) i na Node 22.23.5.
- Nepřímý poznatek: nejde-li shodný vzor, `npm install` nad klonem přidá/změní ≈ 300 balíků; místo na disku nevrátil `apfs-dedupe` (17 min), ale stálo to ≈ 3,6 GiB (viz volno 7,3 → 3,7 GiB) i při `cp -c`.
- Rozpor v `SKILL.md` (ř. 86: Node 22.14+/24/26; ř. 100: 24/26) opraví skill-prvni-appka; měření ukazuje, že 22 funguje, takže ř. 100 je přísnější než `engines` v šabloně.
