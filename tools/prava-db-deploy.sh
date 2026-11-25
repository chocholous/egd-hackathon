#!/usr/bin/env bash
# Nasadí novou verzi DB API (ca-egd-data-api) s endpointy pro práva na položkách SharePointu:
#   image z ACR + env SP_SITE_URL / SP_LIST / SP_MI_CLIENT_ID + CORS pro origin SharePointu (volání z SPFx přes AadHttpClient).
# Min. repliky se nemění (lab: 0). Image postav předem: tools/data-prava-docker-push.sh <acr> sondy/data-prava/api egd-sonda-data-api:<tag>
set -euo pipefail
if [ "${1:-}" = "--help" ] || [ $# -lt 5 ]; then cat <<'U'
Použití: tools/prava-db-deploy.sh <rg> <container-app> <image> <url-webu> <název-seznamu> [<clientId-identity>]
  Příklad (lab): tools/prava-db-deploy.sh rg-egd-sonda-data-prava ca-egd-data-api \
      acrppfroomsca3lbgs.azurecr.io/egd-sonda-data-api:0.2 \
      https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-data-prava Sdileni ee4fc785-219b-4c3e-b346-72891ada0b52
  clientId identity vynech → vezme se identita id-egd-data-sp z téže RG (založí ji tools/prava-db-identita.sh).
  Proměnná SUB = subscription (výchozí lab). CORS: povolí jen origin webu (https://<tenant>.sharepoint.com).
U
exit 0; fi
RG=$1; APP=$2; IMG=$3; SITE=$4; LIST=$5; CID=${6:-}
SUB=${SUB:-05a636d8-d8e3-49d2-a450-4b3ff7cc0a13}
[ -n "$CID" ] || CID=$(az identity show -g "$RG" -n id-egd-data-sp --subscription "$SUB" --query clientId -o tsv)
ORIGIN=$(echo "$SITE" | sed -E 's#^(https://[^/]+).*#\1#')
# Pojistka (lab 24. 11.: build selhal a deploy neexistující image shodil API): image musí v ACR existovat.
REG=${IMG%%.*}; REPO=${IMG#*/}; TAG=${REPO##*:}; REPO=${REPO%:*}
az acr repository show-tags -n "$REG" --repository "$REPO" --subscription "$SUB" -o tsv | grep -qx "$TAG" \
  || { echo "CHYBA: image $IMG v ACR není, nic nenasazuji" >&2; exit 3; }
az containerapp update -g "$RG" -n "$APP" --subscription "$SUB" --image "$IMG" \
  --set-env-vars "SP_SITE_URL=$SITE" "SP_LIST=$LIST" "SP_MI_CLIENT_ID=$CID" \
  --query "{rev:properties.latestRevisionName,img:properties.template.containers[0].image,min:properties.template.scale.minReplicas}" -o json
az containerapp ingress cors enable -g "$RG" -n "$APP" --subscription "$SUB" --allowed-origins "$ORIGIN" \
  --allowed-methods GET POST DELETE OPTIONS --allowed-headers authorization content-type --max-age 600 -o json
az containerapp revision list -g "$RG" -n "$APP" --subscription "$SUB" --query "[?properties.active].{rev:name,img:properties.template.containers[0].image,stav:properties.runningState,traffic:properties.trafficWeight}" -o table
