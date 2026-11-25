#!/usr/bin/env bash
# Zapíše stav jednoho z Tomášových (Galíkových) požadavků do přehledu (prehled/pozadavky/<n>.json).
# Hlavní session soubory promítá do artefaktu „EG.D hackathon – stav prací“ (sekce Požadavky).
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)/prehled/pozadavky"
usage() { cat <<'U'
Použití: tools/pozadavek.sh <číslo 1-7> [volby]   (nezadané volby zůstanou z minula)
  -n "<název>"     název požadavku
  -r <reálné>      ano | castecne | ne | nevime          – jde to v prostředí EG.D?
  -t <test>        lab | dokumentace | bezi | ne         – jak je to ověřené
  -s <skill>       ano | rozpracovany | ne               – máme na to miniskill?
  -c "<cesta>"     doporučená cesta jednou větou
  -x "<pozn.>"     háček / co chybí
  -z "<zdroj>"     soubor s důkazy (např. sondy/dokumenty.md)
  -k "<skill>"     cesta ke skillu
Příklad: tools/pozadavek.sh 3 -r ano -t lab -s ne -c "SPFx v prohlížeči + Graph PDF" -z sondy/dokumenty.md
U
}
[[ "${1:-}" == "-h" || "${1:-}" == "--help" || $# -lt 1 ]] && { usage; exit 0; }
n="$1"; shift
[[ "$n" =~ ^[1-9]$ ]] || { echo "Chyba: číslo požadavku 1-9" >&2; exit 2; }
declare -A v=()
while getopts "n:r:t:s:c:x:z:k:" o; do case "$o" in
  n) v[nazev]="$OPTARG";; r) v[realne]="$OPTARG";; t) v[test]="$OPTARG";; s) v[skill]="$OPTARG";;
  c) v[cesta]="$OPTARG";; x) v[poznamka]="$OPTARG";; z) v[zdroj]="$OPTARG";; k) v[skill_cesta]="$OPTARG";;
  *) usage; exit 2;; esac; done
case "${v[realne]:-ano}" in ano|castecne|ne|nevime) ;; *) echo "Chyba: -r ano|castecne|ne|nevime" >&2; exit 2;; esac
case "${v[test]:-lab}" in lab|dokumentace|bezi|ne) ;; *) echo "Chyba: -t lab|dokumentace|bezi|ne" >&2; exit 2;; esac
case "${v[skill]:-ne}" in ano|rozpracovany|ne) ;; *) echo "Chyba: -s ano|rozpracovany|ne" >&2; exit 2;; esac
mkdir -p "$DIR"; f="$DIR/$n.json"; [[ -s "$f" ]] || echo '{}' > "$f"
args=(); for k in "${!v[@]}"; do args+=(--arg "$k" "${v[$k]}"); done
tmp="$(mktemp "$DIR/.tmp.XXXXXX")"
jq "${args[@]}" --arg cislo "$n" --arg t "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '. + ($ARGS.named | del(.t)) + {cislo: ($cislo|tonumber), aktualizovano: $t}' "$f" > "$tmp"
mv "$tmp" "$f"; echo "zapsáno: požadavek $n"
