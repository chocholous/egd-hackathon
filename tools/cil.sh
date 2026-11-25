#!/usr/bin/env bash
# Jen hlavní session: zapíše stav jednoho cíle workshopu (prehled/cile/<id>.json) pro sekci „Jak blízko jsme cíli“.
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)/prehled/cile"
usage() { cat <<'U'
Použití: tools/cil.sh <id> [volby]   (nezadané volby zůstanou z minula)
  -n "<název>"   cíl (co musí platit ve středu)
  -o <pořadí>    číslo pro řazení
  -d "<termín>"  do kdy, lidsky (např. "po 23. 11. 12:00")
  -s <stav>      hotovo | jde | ceka | riziko | nezahajeno
  -p <0-100>     pokrok v %
  -c "<chybí>"   co ještě chybí jednou větou
  -k "<kdo>"     kdo je na tahu
U
}
[[ "${1:-}" == "-h" || "${1:-}" == "--help" || $# -lt 1 ]] && { usage; exit 0; }
id="$1"; shift; [[ "$id" =~ ^[a-z0-9-]{1,60}$ ]] || { echo "Chyba: id a-z0-9-" >&2; exit 2; }
declare -A v=()
while getopts "n:o:d:s:p:c:k:" o; do case "$o" in
  n) v[nazev]="$OPTARG";; o) v[poradi]="$OPTARG";; d) v[termin]="$OPTARG";; s) v[stav]="$OPTARG";;
  p) v[pokrok]="$OPTARG";; c) v[chybi]="$OPTARG";; k) v[kdo]="$OPTARG";; *) usage; exit 2;; esac; done
case "${v[stav]:-jde}" in hotovo|jde|ceka|riziko|nezahajeno) ;; *) echo "Chyba: -s hotovo|jde|ceka|riziko|nezahajeno" >&2; exit 2;; esac
mkdir -p "$DIR"; f="$DIR/$id.json"; [[ -s "$f" ]] || echo '{}' > "$f"
args=(); for k in "${!v[@]}"; do args+=(--arg "$k" "${v[$k]}"); done
tmp="$(mktemp "$DIR/.tmp.XXXXXX")"
jq "${args[@]}" --arg t "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '. + ($ARGS.named | del(.t)) + {aktualizovano:$t}
   | if .pokrok then .pokrok |= tonumber else . end | if .poradi then .poradi |= tonumber else . end' "$f" > "$tmp"
mv "$tmp" "$f"; echo "zapsáno: cíl $id"
