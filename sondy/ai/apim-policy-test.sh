#!/usr/bin/env bash
# Změří, které politiky APIM přijme tier Consumption: vytvoří testovací API a zkouší uložit politiku po jedné (uložení politiky ji validuje).
# Použití: apim-policy-test.sh <apim> <rg>   (subscription lab)
set -euo pipefail
[ $# -eq 2 ] || { sed -n 2,3p "$0"; exit 2; }
APIM=$1; RG=$2; S=05a636d8-d8e3-49d2-a450-4b3ff7cc0a13
ID=$(az apim show -n "$APIM" -g "$RG" --subscription $S --query id -o tsv)
az apim api create --service-name "$APIM" -g "$RG" --subscription $S --api-id politiky --path politiky --display-name politiky --service-url https://example.org -o none
try() { # název, XML fragment inbound
  local body; body=$(jq -n --arg x "<policies><inbound><base />$2</inbound><backend><base /></backend><outbound><base /></outbound><on-error><base /></on-error></policies>" '{properties:{format:"rawxml",value:$x}}')
  local out; out=$(az rest --method put --url "https://management.azure.com$ID/apis/politiky/policies/policy?api-version=2022-08-01" --body "$body" -o json 2>&1) && echo "OK      $1" || echo "ODMÍTNUTO $1: $(echo "$out" | tr '\n' ' ' | grep -o '"message": *"[^"]*"' | head -1 | cut -c1-260)"
}
try llm-token-limit '<llm-token-limit counter-key="@(context.Request.IpAddress)" tokens-per-minute="1000" estimate-prompt-tokens="true" />'
try azure-openai-token-limit '<azure-openai-token-limit counter-key="@(context.Request.IpAddress)" tokens-per-minute="1000" estimate-prompt-tokens="true" />'
try llm-emit-token-metric '<llm-emit-token-metric namespace="llm"><dimension name="API ID" /></llm-emit-token-metric>'
try azure-openai-emit-token-metric '<azure-openai-emit-token-metric namespace="llm"><dimension name="API ID" /></azure-openai-emit-token-metric>'
try llm-semantic-cache-lookup '<llm-semantic-cache-lookup score-threshold="0.8" embeddings-backend-id="emb" embeddings-backend-auth="system-assigned" />'
try rate-limit-by-key '<rate-limit-by-key calls="10" renewal-period="60" counter-key="@(context.Request.IpAddress)" />'
try quota-by-key '<quota-by-key calls="100" renewal-period="3600" counter-key="@(context.Request.IpAddress)" />'
try rate-limit '<rate-limit calls="10" renewal-period="60" />'
try quota '<quota calls="100" renewal-period="3600" />'
try validate-azure-ad-token '<validate-azure-ad-token tenant-id="972a674c-7b85-4e56-a31f-b2f95b42fd1e"><client-application-ids><application-id>7b59591a-0058-4799-be76-0d1f5b79ca95</application-id></client-application-ids></validate-azure-ad-token>'
try validate-jwt '<validate-jwt header-name="Authorization"><openid-config url="https://login.microsoftonline.com/972a674c-7b85-4e56-a31f-b2f95b42fd1e/v2.0/.well-known/openid-configuration" /></validate-jwt>'
try set-header+authentication-managed-identity '<authentication-managed-identity resource="https://cognitiveservices.azure.com" />'
