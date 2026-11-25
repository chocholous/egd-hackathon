#!/usr/bin/env bash
# Připraví lab pro práva podle oddělení a nadřízeného v DB API (ca-egd-data-api v0.3):
#   1) nadřízený v Entra (PUT /users/{podřízený}/manager/$ref), 2) app role API pro další testovací uživatele,
#   3) Graph app role User.Read.All pro managed identitu API (čte department a manager všech uživatelů při /api/org/sync).
# Oddělení (department) bere z Entra tak, jak je — v labu je sdílí ppf-rooms, proto je skript NEMĚNÍ. Idempotentní.
set -euo pipefail
if [ "${1:-}" = "--help" ] || [ $# -lt 1 ]; then cat <<'U'
Použití: tools/prava-db-org-setup.sh <MI-principalId> [podřízený=nadřízený ...] [--role upn=Role ...]
  Příklad (lab): tools/prava-db-org-setup.sh 8eb625a2-5d93-40cf-8b81-648ca551c86e tomas.prochazka=jakub.kucera \
                 --role ondrej.horak=Zadavatel --role karolina.mala=Zadavatel
  Uživatel bez @ se doplní o @pavelchocholousgmail.onmicrosoft.com (DOM=… přepíše). API appId: API=… (výchozí lab fec3e01a-…).
  Vyžaduje az přihlášené jako Global Admin (app role pro MI, zápis manageru).
U
exit 0; fi
MIPID=$1; shift
DOM=${DOM:-pavelchocholousgmail.onmicrosoft.com}; API=${API:-fec3e01a-6ce4-4f9e-9dff-a61b354151fb}
G=https://graph.microsoft.com/v1.0
u() { case $1 in *@*) echo "$1";; *) echo "$1@$DOM";; esac; }
oid() { az rest --method get --url "$G/users/$(u "$1")?\$select=id" --query id -o tsv; }
API_SP=$(az rest --method get --url "$G/servicePrincipals?\$filter=appId eq '$API'&\$select=id,appRoles" -o json)
API_SPID=$(echo "$API_SP" | jq -r '.value[0].id')
while [ $# -gt 0 ]; do
  if [ "$1" = "--role" ]; then
    who=${2%%=*}; role=${2#*=}; shift 2
    RID=$(echo "$API_SP" | jq -r --arg r "$role" '.value[0].appRoles[] | select(.value==$r) | .id')
    P=$(oid "$who")
    if az rest --method get --url "$G/servicePrincipals/$API_SPID/appRoleAssignedTo" -o json | jq -e --arg p "$P" --arg r "$RID" 'any(.value[]; .principalId==$p and .appRoleId==$r)' >/dev/null; then
      echo "role $role pro $who už je"
    else
      az rest --method post --url "$G/servicePrincipals/$API_SPID/appRoleAssignedTo" --headers Content-Type=application/json \
        --body "{\"principalId\":\"$P\",\"resourceId\":\"$API_SPID\",\"appRoleId\":\"$RID\"}" --query "{kdo:principalDisplayName,role:appRoleId}" -o json
    fi
  else
    sub=${1%%=*}; mgr=${1#*=}; shift
    az rest --method put --url "$G/users/$(u "$sub")/manager/\$ref" --headers Content-Type=application/json \
      --body "{\"@odata.id\":\"$G/users/$(oid "$mgr")\"}" -o none
    echo "manager $(u "$sub") → $(az rest --method get --url "$G/users/$(u "$sub")/manager?\$select=userPrincipalName" --query userPrincipalName -o tsv)"
  fi
done
GRAPH=$(az rest --method get --url "$G/servicePrincipals?\$filter=appId eq '00000003-0000-0000-c000-000000000000'&\$select=id,appRoles" -o json)
GID=$(echo "$GRAPH" | jq -r '.value[0].id'); ROLE=$(echo "$GRAPH" | jq -r '.value[0].appRoles[] | select(.value=="User.Read.All") | .id')
if az rest --method get --url "$G/servicePrincipals/$MIPID/appRoleAssignments" -o json | jq -e --arg r "$ROLE" 'any(.value[]; .appRoleId==$r)' >/dev/null; then
  echo "User.Read.All pro MI už je"
else
  az rest --method post --url "$G/servicePrincipals/$MIPID/appRoleAssignments" --headers Content-Type=application/json \
    --body "{\"principalId\":\"$MIPID\",\"resourceId\":\"$GID\",\"appRoleId\":\"$ROLE\"}" --query "{res:resourceDisplayName,role:appRoleId}" -o json
fi
echo "HOTOVO (token MI může nové role dostat až za několik minut)"
