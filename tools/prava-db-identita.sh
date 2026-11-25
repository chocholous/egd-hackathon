#!/usr/bin/env bash
# Dá Container App identitu, která smí měnit práva na položkách JEDNOHO SharePoint webu (ManagePermissions):
#   user-assigned managed identity → app role Sites.Selected na „Office 365 SharePoint Online“ → fullcontrol jen na zadaný web.
# Idempotentní. Vyžaduje az přihlášené jako Global Admin (app role pro MI) a lab m365 CLI v11 (tools/lab-m365.sh) pro grant webu.
set -euo pipefail
if [ "${1:-}" = "--help" ] || [ $# -lt 4 ]; then cat <<'U'
Použití: tools/prava-db-identita.sh <resource-group> <container-app> <název-identity> <url-webu> [--sub <subscription>]
  Příklad (lab): tools/prava-db-identita.sh rg-egd-sonda-data-prava ca-egd-data-api id-egd-data-sp \
                 https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-data-prava
  Kroky: 1) az identity create (tag ucel=egd-workshop)  2) az containerapp identity assign --user-assigned
         3) Graph appRoleAssignment Sites.Selected (SharePoint, ne Graph!)  4) m365 spo site apppermission add --permission fullcontrol
  Vypíše clientId identity — ten dej do env SP_MI_CLIENT_ID Container App (víc identit = musí se říct, kterou použít).
  Proč fullcontrol: ManagePermissions (breakroleinheritance, addroleassignment) je jen v Full Control; read/write/manage nestačí.
U
exit 0; fi
RG=$1; APP=$2; MI=$3; SITE=$4; shift 4
SUB=05a636d8-d8e3-49d2-a450-4b3ff7cc0a13; [ "${1:-}" = "--sub" ] && SUB=$2
G=https://graph.microsoft.com/v1.0
SPO_APPID=00000003-0000-0ff1-ce00-000000000000   # Office 365 SharePoint Online (well-known appId)
here=$(cd "$(dirname "$0")" && pwd)

echo "== 1) identita $MI"
az identity show -g "$RG" -n "$MI" --subscription "$SUB" -o none 2>/dev/null \
  || az identity create -g "$RG" -n "$MI" --subscription "$SUB" --tags ucel=egd-workshop -o none
IDJ=$(az identity show -g "$RG" -n "$MI" --subscription "$SUB" -o json)
CID=$(echo "$IDJ" | jq -r .clientId); PID=$(echo "$IDJ" | jq -r .principalId); MID=$(echo "$IDJ" | jq -r .id)
echo "clientId=$CID principalId=$PID"

echo "== 2) přiřazení k $APP"
az containerapp identity assign -g "$RG" -n "$APP" --subscription "$SUB" --user-assigned "$MID" --query "userAssignedIdentities|keys(@)" -o json

echo "== 3) Sites.Selected (SharePoint) pro MI"
RES=$(az rest --method get --url "$G/servicePrincipals?\$filter=appId eq '$SPO_APPID'&\$select=id,appRoles" -o json)
RID=$(echo "$RES" | jq -r '.value[0].id')
ROLE=$(echo "$RES" | jq -r '.value[0].appRoles[] | select(.value=="Sites.Selected") | .id')
# SP managed identity se v Entra objeví se zpožděním
for i in 1 2 3 4 5 6; do az rest --method get --url "$G/servicePrincipals/$PID" -o none 2>/dev/null && break; echo "čekám na SP identity ($i)"; sleep 10; done
if az rest --method get --url "$G/servicePrincipals/$PID/appRoleAssignments" -o json | jq -e --arg r "$ROLE" 'any(.value[]; .appRoleId==$r)' >/dev/null; then
  echo "Sites.Selected už přiřazeno"
else
  az rest --method post --url "$G/servicePrincipals/$PID/appRoleAssignments" --headers Content-Type=application/json \
    --body "{\"principalId\":\"$PID\",\"resourceId\":\"$RID\",\"appRoleId\":\"$ROLE\"}" --query "{id:id,role:appRoleId,res:resourceDisplayName}" -o json
fi

echo "== 4) fullcontrol na $SITE"
# Pozn. (lab, m365 v11.11.0): `m365 spo site apppermission add --appId` končí „Insufficient privileges“, protože si
# dohledává appku v adresáři (Application.Read.All), které lab login nemá. Proto přímo Graph s tokenem m365 CLI;
# token musí mít delegované Sites.FullControl.All (v labu přidáno do grantu m365-cli-spfx-lab, viz prava-db.md).
M365=("$here/lab-m365.sh"); [ -x "${M365[0]}" ] || M365=(env HOME="$HOME/.m365-osobni" m365)
GT=$("${M365[@]}" util accesstoken get --resource https://graph.microsoft.com --new | tr -d '"')
HOSTP=$(echo "$SITE" | sed -E 's#https://([^/]+)(/.*)#\1:\2#')
SID=$(curl -sS -H "Authorization: Bearer $GT" "$G/sites/$HOSTP?\$select=id" | jq -r .id)
echo "siteId=$SID"
EX=$(curl -sS -H "Authorization: Bearer $GT" "$G/sites/$SID/permissions")
echo "$EX" | jq -c '.error // empty'
PERMID=$(echo "$EX" | jq -r --arg a "$CID" '[.value[]? | select(any(.grantedToIdentitiesV2[]?; .application.id==$a))][0].id // empty')
if [ -z "$PERMID" ]; then
  curl -sS -X POST -H "Authorization: Bearer $GT" -H "Content-Type: application/json" "$G/sites/$SID/permissions" \
    -d "{\"roles\":[\"fullcontrol\"],\"grantedToIdentities\":[{\"application\":{\"id\":\"$CID\",\"displayName\":\"$MI\"}}]}" | tee /dev/stderr | jq -e .id >/dev/null
  PERMID=$(curl -sS -H "Authorization: Bearer $GT" "$G/sites/$SID/permissions" | jq -r --arg a "$CID" '[.value[] | select(any(.grantedToIdentitiesV2[]?; .application.id==$a))][0].id')
fi
echo "grant na webu:"; curl -sS -H "Authorization: Bearer $GT" "$G/sites/$SID/permissions/$PERMID" | jq -c '{id,roles,app:.grantedToIdentitiesV2[0].application}'
echo "HOTOVO: nastav env SP_MI_CLIENT_ID=$CID"
