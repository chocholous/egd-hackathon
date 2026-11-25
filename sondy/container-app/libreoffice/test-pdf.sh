#!/usr/bin/env bash
# Pošle soubory na POST /api/pdf s tokenem lab uživatele, uloží PDF, změří čas a zkontroluje diakritiku přes pdftotext.
# Použití: test-pdf.sh <base-url> <out-dir> <soubor>...      proměnné: USER_A (tomas.prochazka), API (appId API)
# Výstup: jeden JSON řádek na soubor (stdout), PDF + .txt + .fonts do out-dir.
set -euo pipefail
if [ "${1:-}" = "--help" ] || [ $# -lt 3 ]; then sed -n '2,4p' "$0"; exit 0; fi
BASE=${1%/}; OUT=$2; shift 2; mkdir -p "$OUT"
USER_A=${USER_A:-tomas.prochazka}; API=${API:-54c0b31d-b482-4d3f-900c-3e6c0e5fe870}
T=$(python3 "$(dirname "$0")/../../../tools/data-prava-token.py" "$USER_A" --client "$API" --resource "api://$API")
VETA='Příliš žluťoučký kůň úpěl ďábelské ódy'
for F in "$@"; do
  N=$(basename "$F"); EXT=${N##*.}; P=$OUT/$N.pdf
  W=$(curl -sS -o "$P" -D "$OUT/$N.headers" -w '%{http_code} %{time_total} %{time_starttransfer}' \
      -H "Authorization: Bearer $T" -H 'Content-Type: application/octet-stream' --data-binary "@$F" "$BASE/api/pdf?ext=$EXT")
  read -r CODE TOT TTFB <<<"$W"
  CMS=$(awk -F': ' 'tolower($1)=="x-convert-ms"{gsub("\r","",$2);print $2}' "$OUT/$N.headers")
  NCONV=$(awk -F': ' 'tolower($1)=="x-convert-count"{gsub("\r","",$2);print $2}' "$OUT/$N.headers")
  if [ "$CODE" = 200 ]; then
    pdftotext -layout "$P" "$OUT/$N.txt"; pdffonts "$P" > "$OUT/$N.fonts"
    PAGES=$(pdfinfo "$P" | awk '/^Pages:/{print $2}')
    VETAOK=$(tr -s ' \n' ' ' < "$OUT/$N.txt" | rg -c -F "$VETA" || true)
    DIA=$({ rg -o '[ěščřžýáíéůúťďňóĚŠČŘŽÝÁÍÉŮÚŤĎŇÓ]' "$OUT/$N.txt" || true; } | wc -l | tr -d ' ')
    QM=$(rg -c -F '?' "$OUT/$N.txt" || true)
    FONTS=$(awk 'NR>2{print $1}' "$OUT/$N.fonts" | sed 's/^[A-Z]*+//' | sort -u | paste -sd, -)
  else PAGES=0; VETAOK=0; DIA=0; QM=0; FONTS=""; fi
  jq -cn --arg f "$N" --arg code "$CODE" --arg tot "$TOT" --arg ttfb "$TTFB" --arg cms "${CMS:-}" --arg n "${NCONV:-}" \
     --arg pages "$PAGES" --arg veta "${VETAOK:-0}" --arg dia "$DIA" --arg qm "${QM:-0}" --arg fonts "$FONTS" \
     --arg inb "$(stat -f %z "$F")" --arg outb "$(stat -f %z "$P")" --arg ts "$(date -u +%FT%TZ)" \
     '{ts:$ts,file:$f,http:($code|tonumber),wall_s:($tot|tonumber),ttfb_s:($ttfb|tonumber),convert_ms:$cms,convert_count:$n,in_bytes:($inb|tonumber),out_bytes:($outb|tonumber),pages:($pages|tonumber),veta_radku:($veta|tonumber),diakritika_znaku:($dia|tonumber),otazniku_radku:($qm|tonumber),fonty:$fonts}'
done
