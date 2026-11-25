#!/usr/bin/env bash
# Sestaví ZIP se skilly pro účastníky (bez testů a důkazů) a vypíše jeho obsah a SHA-256.
# Použití: tools/balicek-skillu.sh <výstup.zip> [skill …]   (bez výčtu = všechny skills/egd-*)
# Vynechá: test-dukazy/, TEST*.md, node_modules/, *.secrets*, .DS_Store. Ověří, že každý skill má SKILL.md,
# a vypíše odkazy, které v balíčku nevedou nikam (tools/balicek-kontrola-odkazu.py).
set -euo pipefail
[[ "${1:-}" == --help || "${1:-}" == -h || $# -lt 1 ]] && { sed -n 2,5p "$0"; exit 0; }
out="$1"; shift
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root/skills"
if [[ $# -gt 0 ]]; then skilly=("$@"); else skilly=(egd-*); fi
for s in "${skilly[@]}"; do
  [[ -f "$s/SKILL.md" ]] || { echo "chybí $s/SKILL.md" >&2; exit 1; }
done
case "$out" in /*) ;; *) out="$root/$out" ;; esac
mkdir -p "$(dirname "$out")"
[[ -e "$out" ]] && /usr/bin/trash "$out"
zip -q -r -X "$out" "${skilly[@]}" \
  -x '*/test-dukazy/*' '*/TEST*.md' '*/node_modules/*' '*.secrets*' '*/.DS_Store'
echo "balíček: $out"
echo "skilly (${#skilly[@]}): ${skilly[*]}"
unzip -l "$out" | tail -1
if unzip -l "$out" | rg -q 'test-dukazy|TEST.*\.md|node_modules|secrets'; then echo "CHYBA: v balíčku je vynechaný soubor" >&2; exit 1; fi
shasum -a 256 "$out"
# Kontrola odkazů v rozbaleném balíčku (jen upozornění: odkazy na soubory, které v balíčku nejsou)
tmp="$(mktemp -d)"; unzip -q "$out" -d "$tmp"
echo "--- odkazy mimo balíček (souhrn):"
python3 -I "$root/tools/balicek-kontrola-odkazu.py" "$tmp" > "$tmp.odkazy" 2>&1 || true
rg '^  egd-' "$tmp.odkazy" || echo "  žádné"
echo "  podrobně: $(rg -c '^egd-' "$tmp.odkazy" || echo 0) řádků; spusť tools/balicek-kontrola-odkazu.py nad rozbaleným balíčkem"
/usr/bin/trash "$tmp.odkazy"
/usr/bin/trash "$tmp"
