#!/usr/bin/env bash
# Zapíše stav jednoho úkolu do živého přehledu prací (prehled/stav/<id>.json).
# Hlavní session soubory promítá do artefaktu „EG.D hackathon – stav prací“.
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)/prehled/stav"
usage() { cat <<'U'
Použití: tools/stav.sh <id> <stav> "<název>" [volby]
  id      krátké stabilní id úkolu (a-z0-9-), např. sonda-ai
  stav    planovano | bezi | ceka | hotovo
  název   lidský název úkolu
Volby:
  -p "<popis>"    co se právě děje / výsledek jednou větou
  -o "<oblast>"   skupina: skills | sondy | lab | podklady | infra
  -k "<kdo>"      kdo na tom dělá (např. "agent Sonnet")
  -v "<výstup>"   cesta k souboru nebo URL s výsledkem
Příklad:
  tools/stav.sh sonda-ai bezi "Sonda AI: OCR a LLM gateway" -p "Zakládám Azure OpenAI" -o sondy -k "agent Sonnet"
Volej při startu, při každém větším kroku a na konci (stav hotovo nebo ceka).
Přehled ukazuje poslední krok, počet kroků, dobu běhu a historii posledních 8 kroků.
Oblast, kdo a výstup se pamatují z minulého volání.
U
}
[[ "${1:-}" == "-h" || "${1:-}" == "--help" || $# -lt 3 ]] && { usage; exit 0; }
id="$1"; stav="$2"; nazev="$3"; shift 3
[[ "$id" =~ ^[a-z0-9-]{1,60}$ ]] || { echo "Chyba: id smí mít jen a-z, 0-9 a pomlčku" >&2; exit 2; }
case "$stav" in planovano|bezi|ceka|hotovo) ;; *) echo "Chyba: stav musí být planovano|bezi|ceka|hotovo" >&2; exit 2;; esac
popis=""; oblast=""; kdo=""; vystup=""
while getopts "p:o:k:v:" o; do case "$o" in p) popis="$OPTARG";; o) oblast="$OPTARG";; k) kdo="$OPTARG";; v) vystup="$OPTARG";; *) usage; exit 2;; esac; done
mkdir -p "$DIR"
tmp="$(mktemp "$DIR/.tmp.XXXXXX")"
prev="$DIR/$id.json"; [[ -s "$prev" ]] || prev=/dev/null
# Zachová začátek, počítá kroky (každé volání = krok) a drží posledních 8 kroků v historii.
# Prázdné -o/-k/-v převezme z minulého zápisu, takže stačí volat jen se stavem a popisem.
jq -n --slurpfile old <(cat "$prev" 2>/dev/null || true) \
      --arg nazev "$nazev" --arg stav "$stav" --arg popis "$popis" --arg oblast "$oblast" \
      --arg kdo "$kdo" --arg vystup "$vystup" --arg t "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '($old[0] // {}) as $o
   | {nazev:$nazev, stav:$stav, popis:$popis,
      oblast:(if $oblast=="" then ($o.oblast//"") else $oblast end),
      kdo:(if $kdo=="" then ($o.kdo//"") else $kdo end),
      vystup:(if $vystup=="" then ($o.vystup//"") else $vystup end),
      aktualizovano:$t, zacatek:($o.zacatek // $o.aktualizovano // $t),
      kroky:(($o.kroky // (if $o.stav then 1 else 0 end)) + 1),
      historie:((($o.historie // []) + [{t:$t, stav:$stav, popis:$popis}]) | .[-8:])}
   | with_entries(select(.value != ""))' > "$tmp"
mv "$tmp" "$DIR/$id.json"
echo "zapsáno: $id → $stav"
