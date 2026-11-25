#!/usr/bin/env bash
# Postaví LLM gateway: Azure OpenAI (gpt-4.1-mini, Global Standard) + Document Intelligence + Table Storage + ACR,
# image (lokální docker buildx, protože ACR Tasks jsou v lab subscription zakázané), Container App (scale-to-zero) ve SDÍLENÉM env,
# Entra registraci API (scope Gateway.Use, role Gateway.App, az CLI předautorizovaný), Easy Auth, CORS a role pro managed identitu.
# Postup přepsaný z ručního běhu sondy ai (2026-11-22); jako celek znovu neběžel, kroky jsou idempotentní tam, kde to az dovolí.
set -euo pipefail
usage() { cat <<'U'
Použití: tools/ai-gateway-deploy.sh --src <adresář s Dockerfile+server.mjs> [--rg rg-egd-sonda-ai] [--prefix egd-sonda-ai] [--cors https://<tenant>.sharepoint.com] [--tag v1]
  Proměnné: SUB (výchozí lab 05a636d8-d8e3-49d2-a450-4b3ff7cc0a13), ENV_ID (resource id sdíleného Container Apps env; lab: jen jedno env na subscription)
  Zdrojový kód gateway: sondy/ai/gateway/ (server.mjs). Kvóty/ceny/registr appek jsou proměnné prostředí kontejneru (viz hlavička server.mjs).
  Vyžaduje: az (přihlášený), docker (OrbStack), jq. Image se buildí pro linux/amd64.
U
}
SRC=""; RG=rg-egd-sonda-ai; P=egd-sonda-ai; CORS=""; TAG=v1; SUB=${SUB:-05a636d8-d8e3-49d2-a450-4b3ff7cc0a13}
while [ $# -gt 0 ]; do case $1 in --help|-h) usage; exit 0;; --src) SRC=$2; shift 2;; --rg) RG=$2; shift 2;; --prefix) P=$2; shift 2;; --cors) CORS=$2; shift 2;; --tag) TAG=$2; shift 2;; *) usage; exit 2;; esac; done
[ -n "$SRC" ] || { usage; exit 2; }; : "${ENV_ID:?chybí ENV_ID (resource id Container Apps env)}"
LOC=swedencentral; AOAI=aoai-$P; DI=di-$P; ACR=$(echo "acr$P" | tr -d -); SA=$(echo "st$P" | tr -d -); APP=ca-${P/sonda-ai/llm-gateway}
az() { command az "$@" --subscription "$SUB"; }
az group create -n "$RG" -l $LOC --tags ucel=egd-workshop -o none
az provider register -n Microsoft.CognitiveServices -o none
az cognitiveservices account create -n "$AOAI" -g "$RG" -l $LOC --kind OpenAI --sku S0 --custom-domain "$AOAI" --tags ucel=egd-workshop --yes -o none
az cognitiveservices account create -n "$DI" -g "$RG" -l $LOC --kind FormRecognizer --sku F0 --custom-domain "$DI" --tags ucel=egd-workshop --yes -o none
az cognitiveservices account deployment create -n "$AOAI" -g "$RG" --deployment-name gpt-41-mini --model-name gpt-4.1-mini --model-version 2025-04-14 --model-format OpenAI --sku-name GlobalStandard --sku-capacity 50 -o none
az storage account create -g "$RG" -n "$SA" -l $LOC --sku Standard_LRS --allow-blob-public-access false --tags ucel=egd-workshop -o none
az storage table create --account-name "$SA" -n kvota --auth-mode login -o none
az acr create -g "$RG" -n "$ACR" --sku Basic -l $LOC --tags ucel=egd-workshop -o none
az acr login -n "$ACR" --expose-token --query accessToken -o tsv | docker login "$ACR.azurecr.io" -u 00000000-0000-0000-0000-000000000000 --password-stdin
docker buildx build --platform linux/amd64 -t "$ACR.azurecr.io/egd-llm-gateway:$TAG" --push "$SRC"
# Entra: API registrace (v2 tokeny), scope pro uživatele, role pro aplikace, az CLI předautorizovaný
APPID=$(az ad app list --display-name "EGD sonda AI gateway" --query '[0].appId' -o tsv)
if [ -z "$APPID" ]; then
  SC=$(uuidgen | tr A-Z a-z); RL=$(uuidgen | tr A-Z a-z)
  az rest --method post --url https://graph.microsoft.com/v1.0/applications --headers Content-Type=application/json --body "{\"displayName\":\"EGD sonda AI gateway\",\"signInAudience\":\"AzureADMyOrg\",\"api\":{\"requestedAccessTokenVersion\":2,\"oauth2PermissionScopes\":[{\"id\":\"$SC\",\"value\":\"Gateway.Use\",\"type\":\"User\",\"isEnabled\":true,\"adminConsentDisplayName\":\"Use the LLM gateway\",\"adminConsentDescription\":\"Call the LLM gateway on behalf of the signed-in user.\",\"userConsentDisplayName\":\"Use the LLM gateway\",\"userConsentDescription\":\"Call the LLM gateway on your behalf.\"}]},\"appRoles\":[{\"id\":\"$RL\",\"value\":\"Gateway.App\",\"displayName\":\"Gateway caller (app)\",\"description\":\"Application caller of the LLM gateway\",\"allowedMemberTypes\":[\"Application\"],\"isEnabled\":true}]}" -o none
  APPID=$(az ad app list --display-name "EGD sonda AI gateway" --query '[0].appId' -o tsv)
  OID=$(az ad app show --id "$APPID" --query id -o tsv)
  az rest --method patch --url "https://graph.microsoft.com/v1.0/applications/$OID" --headers Content-Type=application/json --body "{\"identifierUris\":[\"api://$APPID\"],\"api\":{\"preAuthorizedApplications\":[{\"appId\":\"04b07795-8ddb-461a-bbee-02f9e1bf7b46\",\"delegatedPermissionIds\":[\"$SC\"]}]}}" -o none
  SPID=$(az ad sp create --id "$APPID" --query id -o tsv)
  # bez tohoto tagu SharePoint (API access) rozhraní/CLI službu nenajde ani nevidí
  az rest --method patch --url "https://graph.microsoft.com/v1.0/servicePrincipals/$SPID" --headers Content-Type=application/json --body '{"tags":["WindowsAzureActiveDirectoryIntegratedApp"]}' -o none
fi
TENANT=$(az account show --query tenantId -o tsv)
az containerapp create -n "$APP" -g "$RG" --environment "$ENV_ID" --image "$ACR.azurecr.io/egd-llm-gateway:$TAG" \
  --registry-server "$ACR.azurecr.io" --registry-identity system --system-assigned --ingress external --target-port 8080 \
  --cpu 0.25 --memory 0.5Gi --min-replicas 0 --max-replicas 2 --tags ucel=egd-workshop \
  --env-vars "AOAI_ENDPOINT=https://$AOAI.openai.azure.com" AOAI_CHAT_DEPLOYMENT=gpt-41-mini "DI_ENDPOINT=https://$DI.cognitiveservices.azure.com" DI_API_VERSION=2024-11-30 \
  "TABLE_ENDPOINT=https://$SA.table.core.windows.net" TABLE_NAME=kvota 'APPS_JSON={"demo":{"tokensPerDay":50000}}' DEFAULT_TOKENS_PER_DAY=200000 \
  'PRICES_JSON={"chatInPerM":0.40,"chatOutPerM":1.60,"ocrPer1000Pages":1.5,"prebuiltPer1000Pages":10}' REQUIRED_SCOPE=Gateway.Use REQUIRED_ROLE=Gateway.App -o none
MI=$(az containerapp show -n "$APP" -g "$RG" --query identity.principalId -o tsv)
for pair in "Cognitive Services OpenAI User:$AOAI" "Cognitive Services User:$DI"; do
  az role assignment create --assignee-object-id "$MI" --assignee-principal-type ServicePrincipal --role "${pair%%:*}" --scope "$(az cognitiveservices account show -n "${pair##*:}" -g "$RG" --query id -o tsv)" -o none; done
az role assignment create --assignee-object-id "$MI" --assignee-principal-type ServicePrincipal --role "Storage Table Data Contributor" --scope "$(az storage account show -n "$SA" -g "$RG" --query id -o tsv)" -o none
az containerapp auth microsoft update -n "$APP" -g "$RG" --client-id "$APPID" --issuer "https://login.microsoftonline.com/$TENANT/v2.0" --allowed-token-audiences "api://$APPID,$APPID" --yes -o none
az containerapp auth update -n "$APP" -g "$RG" --enabled true --unauthenticated-client-action Return401 --require-https true --excluded-paths /healthz -o none
[ -z "$CORS" ] || az containerapp ingress cors enable -n "$APP" -g "$RG" --allowed-origins "$CORS" --allowed-methods GET POST OPTIONS --allowed-headers authorization content-type x-app-id --max-age 600 -o none
echo "Gateway: https://$(az containerapp show -n "$APP" -g "$RG" --query properties.configuration.ingress.fqdn -o tsv)  API appId: $APPID"
echo "Role pro MI se propagují minuty: první volání chatu může skončit 502 (internal_server_error), druhé projde."
