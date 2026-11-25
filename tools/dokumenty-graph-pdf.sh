#!/usr/bin/env bash
# dokumenty-graph-pdf.sh — nahraje soubor do knihovny labového webu a přes Graph ho převede na PDF
set -euo pipefail
usage() { cat <<'U'
Použití: dokumenty-graph-pdf.sh [--user ALIAS] [--site-path /sites/xyz] [--client APPID] [--keep] SOUBOR [VYSTUP.pdf]
Nahraje SOUBOR do výchozí knihovny webu (default /sites/egd-sonda-dokumenty), zavolá
GET /drives/{drive}/items/{id}/content?format=pdf (delegovaný token lab uživatele, ROPC),
uloží PDF (default SOUBOR.pdf) a vypíše HTTP kód, redirect a velikost. Bez --keep nic nemaže (nemažeme nikdy; --keep jen no-op).
Token: ~/Projects/egd-workshop/tools/data-prava-token.py, appka egd-sonda-dokumenty-graph (Files+Sites ReadWrite.All).
Výchozí --user jana.svobodova, --client 42df0072-be8f-47a4-88b2-84f8b6ada0c6
U
}
USER_A=jana.svobodova; SITE=/sites/egd-sonda-dokumenty; CLIENT=42df0072-be8f-47a4-88b2-84f8b6ada0c6
while [ $# -gt 0 ]; do case $1 in -h|--help) usage; exit 0;; --user) USER_A=$2; shift 2;; --site-path) SITE=$2; shift 2;; --client) CLIENT=$2; shift 2;; --keep) shift;; *) break;; esac; done
[ $# -ge 1 ] || { usage; exit 2; }
F=$1; OUT=${2:-$F.pdf}; N=$(basename "$F"); G=https://graph.microsoft.com/v1.0
T=$(python3 "$(dirname "$0")/data-prava-token.py" "$USER_A" --resource https://graph.microsoft.com --client "$CLIENT")
H=(-H "Authorization: Bearer $T")
SID=$(curl -sS "${H[@]}" "$G/sites/pavelchocholousgmail.sharepoint.com:$SITE?\$select=id" | jq -r .id)
ID=$(curl -sS "${H[@]}" -X PUT -H "Content-Type: application/octet-stream" --data-binary "@$F" "$G/sites/$SID/drive/root:/sonda/$N:/content" | jq -r .id)
echo "uploaded $N id=$ID"
curl -sS "${H[@]}" -o "$OUT" -w "convert: http=%{http_code} redirects=%{num_redirects} size=%{size_download} time=%{time_total}s\n" -L "$G/sites/$SID/drive/items/$ID/content?format=pdf"
file "$OUT"
