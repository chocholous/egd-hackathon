#!/usr/bin/env bash
# Opakuje „1. volání po nasazení → 502“: vedle živé gateway založí NOVOU kopii Container App (stejný image, nová managed identita),
# hned po přiřazení rolí a zapnutí Easy Auth volá /api/chat v časech +0, +30, +60, +120, +240 s a zapisuje HTTP kód.
# Kopie se NEMAŽE (nic nemažeme); scale-to-zero, ≈ 0 USD. Použití: overeni-gateway-502.sh <jméno-kopie>   (env: GW_APP_ID, ENV_ID, IMAGE)
set -uo pipefail
[[ "${1:-}" == --help || $# -lt 1 ]] && { sed -n 2,5p "$0"; exit 0; }
: "${GW_APP_ID:?}" "${ENV_ID:?}" "${IMAGE:?}"; APP=$1; RG=rg-egd-sonda-ai; P=egd-sonda-ai; SUB=05a636d8-d8e3-49d2-a450-4b3ff7cc0a13
AOAI=aoai-$P; DI=di-$P; SA=stegdsondaai; ACR=acregdsondaai; TENANT=$(az account show --subscription $SUB --query tenantId -o tsv)
az() { command az "$@" --subscription $SUB; }
ts(){ date -u +%T; }
echo "$(ts) create"; 
az containerapp create -n "$APP" -g "$RG" --environment "$ENV_ID" --image "$IMAGE" --registry-server "$ACR.azurecr.io" --registry-identity system --system-assigned --ingress external --target-port 8080 \
  --cpu 0.25 --memory 0.5Gi --min-replicas 0 --max-replicas 1 --tags ucel=egd-workshop --env-vars "AOAI_ENDPOINT=https://$AOAI.openai.azure.com" AOAI_CHAT_DEPLOYMENT=gpt-41-mini "DI_ENDPOINT=https://$DI.cognitiveservices.azure.com" DI_API_VERSION=2024-11-30 \
  "TABLE_ENDPOINT=https://$SA.table.core.windows.net" TABLE_NAME=kvota 'APPS_JSON={"demo":{"tokensPerDay":50000}}' DEFAULT_TOKENS_PER_DAY=200000 \
  'PRICES_JSON={"chatInPerM":0.40,"chatOutPerM":1.60,"ocrPer1000Pages":1.5,"prebuiltPer1000Pages":10}' REQUIRED_SCOPE=Gateway.Use REQUIRED_ROLE=Gateway.App -o none || exit 1
MI=$(az containerapp show -n "$APP" -g "$RG" --query identity.principalId -o tsv)
for pair in "Cognitive Services OpenAI User:$AOAI" "Cognitive Services User:$DI"; do
  az role assignment create --assignee-object-id "$MI" --assignee-principal-type ServicePrincipal --role "${pair%%:*}" --scope "$(az cognitiveservices account show -n "${pair##*:}" -g "$RG" --query id -o tsv)" -o none; done
az role assignment create --assignee-object-id "$MI" --assignee-principal-type ServicePrincipal --role "Storage Table Data Contributor" --scope "$(az storage account show -n "$SA" -g "$RG" --query id -o tsv)" -o none
az containerapp auth microsoft update -n "$APP" -g "$RG" --client-id "$GW_APP_ID" --issuer "https://login.microsoftonline.com/$TENANT/v2.0" --allowed-token-audiences "api://$GW_APP_ID,$GW_APP_ID" --yes -o none
az containerapp auth update -n "$APP" -g "$RG" --enabled true --unauthenticated-client-action Return401 --require-https true --excluded-paths /healthz -o none
FQDN=$(az containerapp show -n "$APP" -g "$RG" --query properties.configuration.ingress.fqdn -o tsv); T0=$(date +%s)
echo "$(ts) role přiřazeny, Easy Auth zapnuta, fqdn=$FQDN"
for at in 0 30 60 120 240; do
  while [ $(( $(date +%s) - T0 )) -lt $at ]; do sleep 2; done
  TOK=$(command az account get-access-token --scope "api://$GW_APP_ID/Gateway.Use" --query accessToken -o tsv)
  r=$(curl -s -o /tmp/gw502.$$ -w '%{http_code} %{time_total}s' -H "Authorization: Bearer $TOK" -H 'Content-Type: application/json' -d '{"prompt":"Řekni ahoj.","max_tokens":20}' "https://$FQDN/api/chat")
  echo "$(ts) +${at}s chat → $r $(head -c 160 /tmp/gw502.$$ | tr '\n' ' ')"
done; rm -f /tmp/gw502.$$
