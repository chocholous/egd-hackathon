#!/usr/bin/env bash
# Jen pro hlavní session: vypíše JSON pole zápisů pro ArtifactData batch (kolekce ukoly)
# pro zadaná id, s if_version z prehled/.verze. Použití: tools/prehled-sync-plan.sh id1 id2 ...
# Po úspěšném batchi: tools/prehled-sync-plan.sh --zapsano id1=verze id2=verze ...
set -euo pipefail
P="$(cd "$(dirname "$0")/.." && pwd)/prehled"
[[ "${1:-}" == "-h" || "${1:-}" == "--help" || $# -eq 0 ]] && { sed -n '2,4p' "$0"; exit 0; }
if [[ "$1" == "--zapsano" ]]; then shift
  for kv in "$@"; do id="${kv%%=*}"; v="${kv#*=}"
    if grep -q "^$id " "$P/.verze"; then sed -i '' "s/^$id .*/$id $v/" "$P/.verze"; else echo "$id $v" >> "$P/.verze"; fi; done
  echo "verze uloženy"; exit 0; fi
# id bez dvojtečky = kolekce ukoly (prehled/stav/<id>.json); "pozadavky:3" nebo "cile:prereq" = jiná kolekce.
for key in "$@"; do v=$(awk -v i="$key" '$1==i{print $2}' "$P/.verze")
  if [[ "$key" == *:* ]]; then col="${key%%:*}"; id="${key#*:}"; f="$P/$col/$id.json"; else col=ukoly; id="$key"; f="$P/stav/$id.json"; fi
  jq -nc --arg c "$col" --arg id "$id" --arg f "$f" --arg v "${v:-}" \
    '{op:"set",collection:$c,doc_id:$id,file_path:$f} + (if $v=="" then {} else {if_version:($v|tonumber)} end)'
done | jq -sc .
