#!/usr/bin/env bash
# Změří, co smí uživatel s rolí Visitors (jen čtení) na webu: čtení, zápis položky, nahrání souboru, založení seznamu.
# Použití: overeni-visitor.sh <alias|upn> <webUrl> [--lib "Apps for SharePoint"] [--file cesta.sppkg]
# Token přes data-prava-token.py (ROPC, heslo z lab.secrets.json). Výstup: řádky "test<TAB>HTTP kód<TAB>zkrácená odpověď".
if [[ "$1" == "--help" || $# -lt 2 ]]; then sed -n 2,5p "$0"; exit 0; fi
USER_=$1; WEB=${2%/}; LIB="Apps for SharePoint"; FILE=""
shift 2; while [[ $# -gt 0 ]]; do case $1 in --lib) LIB=$2; shift 2;; --file) FILE=$2; shift 2;; *) echo "?? $1"; exit 2;; esac; done
HERE=$(cd "$(dirname "$0")" && pwd)
HOST=$(echo "$WEB" | sed -E 's#(https://[^/]+)/.*#\1#')
TOK=$(python3 "$HERE/data-prava-token.py" "$USER_" --resource "$HOST") || { echo "token: $TOK"; exit 1; }
H=(-H "Authorization: Bearer $TOK" -H "Accept: application/json;odata=nometadata")
call() { # název metoda url [curl args...]
  local n=$1 m=$2 u=$3; shift 3
  local out; out=$(curl -s -o /tmp/ov.$$ -w '%{http_code}' -X "$m" "${H[@]}" "$@" "$u")
  printf '%s\t%s\t%s\n' "$n" "$out" "$(head -c 160 /tmp/ov.$$ | tr '\n' ' ')"; rm -f /tmp/ov.$$
}
echo "# uživatel=$USER_ web=$WEB $(date -u +%FT%TZ)"
call "web-title (čtení webu)" GET "$WEB/_api/web?\$select=Title,Url"
call "effective-perms (EffectiveBasePermissions web)" GET "$WEB/_api/web/EffectiveBasePermissions"
call "lists (čtení seznamů)" GET "$WEB/_api/web/lists?\$select=Title&\$top=3"
call "knihovna-polozky (čtení knihovny $LIB)" GET "$WEB/_api/web/lists/getbytitle('$(printf %s "$LIB" | sed 's/ /%20/g')')/items?\$top=3&\$select=Id"
DIG=$(curl -s -X POST -H "Content-Length: 0" -H "Authorization: Bearer $TOK" -H "Accept: application/json;odata=verbose" "$WEB/_api/contextinfo" | jq -r .d.GetContextWebInformation.FormDigestValue)
[[ -n "$DIG" && "$DIG" != null ]] || echo "!! digest se nezískal (zápisové testy nejsou průkazné)"
call "zalozit-seznam (POST lists)" POST "$WEB/_api/web/lists" "${H[@]:0:0}" -H "X-RequestDigest: $DIG" -H "Content-Type: application/json;odata=nometadata" -d '{"Title":"overeni-visitor-test","BaseTemplate":100}'
if [[ -n "$FILE" ]]; then
  call "upload-souboru (add do knihovny)" POST "$WEB/_api/web/lists/getbytitle('$(printf %s "$LIB" | sed 's/ /%20/g')')/rootfolder/files/add(url='ov-test.sppkg',overwrite=true)" -H "X-RequestDigest: $DIG" --data-binary "@$FILE"
fi
