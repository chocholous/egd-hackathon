#!/usr/bin/env bash
# Souhlas správce pro SPFx → vlastní API (ekvivalent „API access → Approve“) přes Graph oauth2PermissionGrant pro
# principal „SharePoint Online Web Client Extensibility“ (AllPrincipals). Použij, když `m365 spo serviceprincipal permissionrequest approve`
# skončí „service principal … could not be found“ (tak to dopadlo v sondě ai). Jen lab; vyžaduje Global Admin v az.
set -euo pipefail
if [ "${1:-}" = "--help" ] || [ $# -lt 2 ]; then cat <<'U'
Použití: tools/ai-spfx-api-grant.sh <API-appId> <scope>      např. 7b59591a-… Gateway.Use
  Nejdřív zajistí tag WindowsAzureActiveDirectoryIntegratedApp na SP API, pak vytvoří/rozšíří grant. Idempotentní.
U
exit 0; fi
API=$1; SCOPE=$2; G=https://graph.microsoft.com/v1.0
RES=$(az rest --method get --url "$G/servicePrincipals?\$filter=appId eq '$API'&\$select=id" --query 'value[0].id' -o tsv)
CLI=$(az rest --method get --url "$G/servicePrincipals?\$filter=displayName eq 'SharePoint Online Web Client Extensibility'&\$select=id" --query 'value[0].id' -o tsv)
az rest --method patch --url "$G/servicePrincipals/$RES" --headers Content-Type=application/json --body '{"tags":["WindowsAzureActiveDirectoryIntegratedApp"]}' -o none
EX=$(az rest --method get --url "$G/oauth2PermissionGrants?\$filter=clientId eq '$CLI' and resourceId eq '$RES'" --query 'value[0].{id:id,s:scope}' -o json)
if [ "$EX" = "null" ] || [ -z "$EX" ]; then
  az rest --method post --url "$G/oauth2PermissionGrants" --headers Content-Type=application/json --body "{\"clientId\":\"$CLI\",\"consentType\":\"AllPrincipals\",\"resourceId\":\"$RES\",\"scope\":\"$SCOPE\"}" --query '{id:id,scope:scope}' -o json
else
  ID=$(echo "$EX" | jq -r .id); S=$(echo "$EX" | jq -r .s)
  case " $S " in *" $SCOPE "*) echo "scope už je udělený: $S";; *) az rest --method patch --url "$G/oauth2PermissionGrants/$ID" --headers Content-Type=application/json --body "{\"scope\":\"$S $SCOPE\"}" -o none; echo "přidáno: $S $SCOPE";; esac
fi
