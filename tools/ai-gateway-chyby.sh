#!/usr/bin/env bash
# Vyvolá chybové stavy LLM gateway bez její změny (401 bez tokenu, 401 token pro jiné API, 403 neznámá appka,
# 429 kvóta u appky s malým limitem, CORS preflight z povoleného a nepovoleného originu) a vypíše HTTP kódy + těla.
# Jen čte / volá; gateway ani její Azure zdroje nemění. Výstup je markdown (vhodný jako důkaz do sondy).
set -euo pipefail
usage() { cat <<'U'
Použití: tools/ai-gateway-chyby.sh [--origin https://<tenant>.sharepoint.com] [--tiny <appKey s malým limitem>] [--neznamy <appKey>]
  Proměnné (povinné): GW_FQDN (host gateway), GW_APP_ID (appId API registrace, scope Gateway.Use)
  Token: `az account get-access-token` (az CLI musí být předautorizovaný na API; přihlášený účet = volající).
  --origin   origin, který má být v CORS gateway (výchozí: žádný → CORS test se přeskočí)
  --tiny     appKey z registru gateway s malým denním limitem (pro vyvolání 429); bez něj se 429 přeskočí
  --neznamy  appKey, který v registru NENÍ (výchozí: neexistuje-<čas>)
  Příklad: GW_FQDN=ca-….azurecontainerapps.io GW_APP_ID=7b59… tools/ai-gateway-chyby.sh --origin https://pavelchocholousgmail.sharepoint.com --tiny tiny
U
}
ORIGIN=""; TINY=""; NEZ="neexistuje-$(date +%s)"
while [ $# -gt 0 ]; do case $1 in -h|--help) usage; exit 0;; --origin) ORIGIN=$2; shift 2;; --tiny) TINY=$2; shift 2;; --neznamy) NEZ=$2; shift 2;; *) usage; exit 2;; esac; done
: "${GW_FQDN:?chybí GW_FQDN}"; : "${GW_APP_ID:?chybí GW_APP_ID}"
U="https://$GW_FQDN"
TOK=$(az account get-access-token --scope "api://$GW_APP_ID/Gateway.Use" --query accessToken -o tsv)
GRAPH=$(az account get-access-token --resource-type ms-graph --query accessToken -o tsv)
row() { # popis, curl argumenty...
  local d=$1; shift; local out; out=$(curl -s -w '\n%{http_code} %{time_total}' "$@")
  local code=${out##*$'\n'}; local body=${out%$'\n'*}
  printf '| %s | %s | `%s` |\n' "$d" "$code" "$(echo "$body" | tr -d '\n|' | cut -c1-160)"
}
echo "Gateway $U, $(date -u +%FT%TZ), volající: $(az account show --query user.name -o tsv)"
echo; echo '| Případ | HTTP + čas [s] | Tělo (zkráceno) |'; echo '|---|---|---|'
row 'healthz (bez přihlášení)' "$U/healthz"
row 'whoami bez tokenu' "$U/api/whoami"
row 'whoami s tokenem pro Graph (jiné API)' -H "Authorization: Bearer $GRAPH" "$U/api/whoami"
row 'whoami se správným tokenem' -H "Authorization: Bearer $TOK" "$U/api/whoami"
row "chat s neznámým X-App-Id ($NEZ)" -H "Authorization: Bearer $TOK" -H 'Content-Type: application/json' -H "X-App-Id: $NEZ" -d '{"prompt":"ahoj","max_tokens":5}' "$U/api/chat"
row 'neznámý endpoint' -H "Authorization: Bearer $TOK" "$U/api/nic"
if [ -n "$TINY" ]; then
  for i in 1 2 3; do row "chat X-App-Id $TINY, pokus $i" -H "Authorization: Bearer $TOK" -H 'Content-Type: application/json' -H "X-App-Id: $TINY" -d '{"prompt":"Napiš jedno slovo.","max_tokens":20}' "$U/api/chat"; done
  row "kvota X-App-Id $TINY" -H "Authorization: Bearer $TOK" -H "X-App-Id: $TINY" "$U/api/kvota"
fi
if [ -n "$ORIGIN" ]; then
  echo; echo '| CORS preflight (OPTIONS /api/chat) | HTTP | access-control-allow-origin |'; echo '|---|---|---|'
  for o in "$ORIGIN" "https://example.com"; do
    h=$(curl -s -o /dev/null -D - -X OPTIONS -H "Origin: $o" -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: authorization,content-type,x-app-id' "$U/api/chat")
    printf '| Origin %s | %s | %s |\n' "$o" "$(echo "$h" | head -1 | awk '{print $2}')" "$(echo "$h" | rg -i '^access-control-allow-origin' | tr -d '\r' || echo '(chybí)')"
  done
fi
