#!/usr/bin/env bash
# Zkusí Graph `?format=pdf` na soubor v knihovně webu pod lab uživatelem a danou appkou (scope) a vypíše
# scope z tokenu, HTTP kód a začátek chyby. Na důkaz „Files.Read nestačí, Files.Read.All ano“. Jen čtení.
set -euo pipefail
usage() { cat <<'U'
Použití: tools/dokumenty-graph-scope.sh --client APPID [--user ALIAS] [--site-path /sites/xyz] CESTA_V_KNIHOVNE
  CESTA_V_KNIHOVNE  cesta v výchozí knihovně webu, např. exporty/pozadavky.docx
  --client          appId veřejného klienta s delegovaným scope (lab: egd-sonda-dokumenty-graph-filesread
                    ac1ff591-…, -filesreadall 953de580-…)
  --user            lab uživatel s heslem v lab.secrets.json (výchozí petra.novakova)
  --site-path       výchozí /sites/egd-sonda-ms-dokumenty
  --site-id         host,siteId,webId (jako SPFx z pageContext); bez něj se dohledá Graphem (Files.Read na to nestačí)
Výstup: scp=<scope z tokenu> http=<kód> bytes=<velikost> [chyba]. Nic nezapisuje.
Token: tools/data-prava-token.py (ROPC), resource https://graph.microsoft.com.
U
}
HOST=${DOKUMENTY_SPO_HOST:-pavelchocholousgmail.sharepoint.com}   # lab tenant; jinak env DOKUMENTY_SPO_HOST
SID=""; CLIENT=""; USER_ALIAS=petra.novakova; SITE=/sites/egd-sonda-ms-dokumenty; FILE=""
while [ $# -gt 0 ]; do case "$1" in
  -h|--help) usage; exit 0;;
  --client) CLIENT=$2; shift 2;; --user) USER_ALIAS=$2; shift 2;; --site-path) SITE=$2; shift 2;; --site-id) SID=$2; shift 2;;
  *) FILE=$1; shift;; esac; done
[ -n "$CLIENT" ] && [ -n "$FILE" ] || { usage; exit 2; }
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOK=$("$ROOT/.venv/bin/python" "$ROOT/tools/data-prava-token.py" "$USER_ALIAS" --resource https://graph.microsoft.com --client "$CLIENT")
SCP=$(printf '%s' "$TOK" | python3 -c 'import sys,base64,json; p=sys.stdin.read().split(".")[1]; print(json.loads(base64.urlsafe_b64decode(p+"="*(-len(p)%4))).get("scp","?"))')
TMP=$(mktemp)
[ -n "$SID" ] || SID=$(curl -s -H "Authorization: Bearer $TOK" "https://graph.microsoft.com/v1.0/sites/$HOST:$SITE?\$select=id" | jq -r '.id // empty')
[ -n "$SID" ] || { echo "scp=$SCP web $SITE nenalezen (token nemá na web právo?)"; exit 1; }
CODE=$(curl -s -L -o "$TMP" -w '%{http_code}' -H "Authorization: Bearer $TOK" \
  "https://graph.microsoft.com/v1.0/sites/$SID/drive/root:/$FILE:/content?format=pdf")
SIZE=$(wc -c < "$TMP" | tr -d ' ')
ERR=""; [ "$CODE" = 200 ] || ERR=$(head -c 300 "$TMP")
echo "scp=$SCP http=$CODE bytes=$SIZE $ERR"
