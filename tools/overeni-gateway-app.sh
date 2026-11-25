#!/usr/bin/env bash
# Aplikační (client credentials) token pro LLM gateway a volání jejího endpointu BEZ uživatele.
# Použití: overeni-gateway-app.sh token-info | <GET|POST> <cesta> [json-tělo] [X-App-Id]
#   env: GW_FQDN, GW_APP_ID (appId API), GWAPP_SECRETS (výchozí ~/.config/egd-overeni/gwapp.secrets.json: appId, password, tenant)
# Token ani secret se nikdy nevypisují (token-info ukáže jen claims aud/roles/appid).
set -euo pipefail
[[ "${1:-}" == --help || $# -eq 0 ]] && { sed -n 2,6p "$0"; exit 0; }
: "${GW_FQDN:?}" "${GW_APP_ID:?}"; SEC=${GWAPP_SECRETS:-$HOME/.config/egd-overeni/gwapp.secrets.json}
CID=$(jq -r .appId "$SEC"); TEN=$(jq -r .tenant "$SEC")
RESP=$(curl -s -m 30 -d "grant_type=client_credentials&client_id=$CID&scope=api://$GW_APP_ID/.default" --data-urlencode "client_secret=$(jq -r .password "$SEC")" "https://login.microsoftonline.com/$TEN/oauth2/v2.0/token")
TOK=$(echo "$RESP" | jq -r '.access_token // empty')
if [[ -z "$TOK" ]]; then echo "TOKEN-CHYBA: $(echo "$RESP" | jq -r '.error_description // .error' | tr '\n' ' ' | cut -c1-300)"; exit 3; fi
if [[ "$1" == token-info ]]; then echo "$TOK" | cut -d. -f2 | tr '_-' '/+' | { read -r p; printf '%s%s' "$p" "$(printf '=%.0s' 1 2 3)"; } | base64 -d 2>/dev/null | jq '{aud,appid,roles,idtyp,tid}' ; exit 0; fi
H=(-H "Authorization: Bearer $TOK" -H 'Content-Type: application/json'); [[ -n "${4:-}" ]] && H+=(-H "X-App-Id: $4")
if [[ "$1" == POST ]]; then curl -s -m 90 -w '\n[HTTP %{http_code}, %{time_total}s]\n' "${H[@]}" -d "${3:-{\}}" "https://$GW_FQDN$2"; else curl -s -m 90 -w '\n[HTTP %{http_code}, %{time_total}s]\n' "${H[@]}" "https://$GW_FQDN$2"; fi
