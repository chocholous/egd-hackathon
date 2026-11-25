#!/usr/bin/env bash
# Ověří appRoleAssignmentRequired na API gateway: čerstvý ROPC token (bez cache) pro přiřazeného a nepřiřazeného uživatele,
# a volání gateway s tokenem. Přepíná appRoleAssignmentRequired na SP gateway (true → test → původní hodnota).
# Použití: overeni-gateway-role.sh <nepřiřazený-alias> <přiřazený-alias>   (env: GW_FQDN, GW_APP_ID; az přihlášený jako správce labu)
set -uo pipefail
[[ "${1:-}" == --help || $# -lt 2 ]] && { sed -n 2,5p "$0"; exit 0; }
NA=$1; OK=$2; G=https://graph.microsoft.com/v1.0; HERE=$(cd "$(dirname "$0")" && pwd)
SP=$(az rest --method get --url "$G/servicePrincipals?\$filter=appId eq '$GW_APP_ID'&\$select=id,appRoleAssignmentRequired" --query 'value[0]' -o json)
SPID=$(jq -r .id <<<"$SP"); ORIG=$(jq -r .appRoleAssignmentRequired <<<"$SP")
setreq(){ az rest --method patch --url "$G/servicePrincipals/$SPID" --headers Content-Type=application/json --body "{\"appRoleAssignmentRequired\":$1}" -o none; }
tokenfor(){ python3 "$HERE/data-prava-token.py" "$1" --resource "api://$GW_APP_ID" --client 04b07795-8ddb-461a-bbee-02f9e1bf7b46 2>&1; }
probe(){ # alias: token → whoami
  local t; t=$(tokenfor "$1"); if [[ "$t" == eyJ* ]]; then
    echo "  $1: token vydán; gateway /api/whoami → $(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $t" "https://$GW_FQDN/api/whoami")"
  else echo "  $1: token NEvydán: $(echo "$t" | grep -oE 'AADSTS[0-9]+[^"]{0,140}' | head -1)"; fi; }
echo "# $(date -u +%FT%TZ) původní appRoleAssignmentRequired=$ORIG"
echo "## A) required=$ORIG (výchozí)"; probe "$NA"; probe "$OK"
echo "## B) required=true"; setreq true; sleep 20; probe "$NA"; probe "$OK"
echo "## C) vracím required=$ORIG"; setreq "$ORIG"; echo "  hotovo: $(az rest --method get --url "$G/servicePrincipals/$SPID?\$select=appRoleAssignmentRequired" --query appRoleAssignmentRequired -o tsv)"
