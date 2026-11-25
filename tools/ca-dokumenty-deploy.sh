#!/usr/bin/env bash
# Container App „Dokumenty“ (LibreOffice headless → PDF): Entra API registrace, lokální build+push image, deploy do SDÍLENÉHO env.
# Ověřeno v labu 2026-11-24 (sonda sondy/container-app/libreoffice.md). Kroky jsou idempotentní.
set -euo pipefail
usage() { cat <<'U'
Použití: tools/ca-dokumenty-deploy.sh <krok> [volby]
  kroky:  entra   – Entra appka API (scope access_as_user, app role Dokumenty.App, v2 tokeny, api://<appId>, consent pro ROPC test); vypíše appId
          push    – lokální docker buildx linux/amd64 + push do ACR (ACR Tasks jsou v labu zakázané)
          deploy  – RG + user identity s AcrPull + Container App (min 0 replik), vypíše URL
          all     – entra, push, deploy
  volby (výchozí = lab):
    --src DIR        adresář s Dockerfile+server.mjs   [sondy/container-app/libreoffice/app]
    --tag TAG        tag image                          [0.3]
    --rg RG          resource group                     [rg-egd-ca-dokumenty]
    --app NAME       Container App                      [ca-egd-dokumenty]
    --api-name NAME  Entra appka                        [egd-ca-dokumenty]
    --acr NAME       existující ACR                     [acrppfroomsca3lbgs]
    --env NAME       existující Container Apps env      [jediné v subscription, zjistí se samo]
    --cors ORIGINS   povolené originy (čárkou)          [https://pavelchocholousgmail.sharepoint.com]
    --cpu/--mem      velikost repliky                   [1.0 / 2Gi]
    --max-bytes N    limit vstupu v bajtech             [26214400 = 25 MB]
    --timeout-ms N   limit jednoho převodu              [120000]
  Proměnné: SUB (lab 05a636d8-…), DOCKER (~/.orbstack/bin/docker). Vyžaduje: az (přihlášený do lab tenantu), docker, jq.
  Po „entra“ zbývá souhlas pro SPFx: tools/ai-spfx-api-grant.sh <appId> access_as_user
U
}
[ $# -ge 1 ] || { usage; exit 2; }
STEP=$1; shift
case $STEP in -h|--help) usage; exit 0;; entra|push|deploy|all) ;; *) usage; exit 2;; esac
ROOT=$(cd "$(dirname "$0")/.." && pwd)
SRC=$ROOT/sondy/container-app/libreoffice/app; TAG=0.3; RG=rg-egd-ca-dokumenty; APP=ca-egd-dokumenty; API=egd-ca-dokumenty
ACR=acrppfroomsca3lbgs; ENVN=""; CORS=https://pavelchocholousgmail.sharepoint.com; CPU=1.0; MEM=2Gi; MAXB=26214400; TMO=120000
while [ $# -gt 0 ]; do case $1 in
  --src) SRC=$2;; --tag) TAG=$2;; --rg) RG=$2;; --app) APP=$2;; --api-name) API=$2;; --acr) ACR=$2;; --env) ENVN=$2;;
  --cors) CORS=$2;; --cpu) CPU=$2;; --mem) MEM=$2;; --max-bytes) MAXB=$2;; --timeout-ms) TMO=$2;; *) usage; exit 2;; esac; shift 2; done
SUB=${SUB:-05a636d8-d8e3-49d2-a450-4b3ff7cc0a13}; DOCKER=${DOCKER:-$HOME/.orbstack/bin/docker}
G=https://graph.microsoft.com/v1.0; IMG=$ACR.azurecr.io/$APP:$TAG
azs() { az "$@" --subscription "$SUB"; }
TENANT=$(azs account show --query tenantId -o tsv)
gr() { local m=$1 u=$2; shift 2; azs rest --method "$m" --url "$G$u" --headers Content-Type=application/json "$@"; }

api_appid() { gr get "/applications?\$filter=displayName eq '$API'&\$select=appId" --query 'value[0].appId' -o tsv; }

do_entra() {
  local id appid sp
  appid=$(api_appid)
  if [ -z "$appid" ] || [ "$appid" = "None" ]; then
    local sid; sid=$(uuidgen | tr 'A-Z' 'a-z')
    gr post /applications --body "{\"displayName\":\"$API\",\"signInAudience\":\"AzureADMyOrg\",\"isFallbackPublicClient\":true,
      \"api\":{\"requestedAccessTokenVersion\":2,\"oauth2PermissionScopes\":[{\"id\":\"$sid\",\"value\":\"access_as_user\",\"type\":\"User\",\"isEnabled\":true,
      \"adminConsentDisplayName\":\"Převod dokumentů jako uživatel\",\"adminConsentDescription\":\"Převod dokumentů do PDF jménem přihlášeného uživatele\",
      \"userConsentDisplayName\":\"Převod dokumentů\",\"userConsentDescription\":\"Převod dokumentů do PDF\"}]}}" -o none
    appid=$(api_appid)
  fi
  id=$(gr get "/applications?\$filter=appId eq '$appid'&\$select=id" --query 'value[0].id' -o tsv)
  gr patch "/applications/$id" --body "{\"identifierUris\":[\"api://$appid\"]}" -o none
  sp=$(gr get "/servicePrincipals?\$filter=appId eq '$appid'&\$select=id" --query 'value[0].id' -o tsv)
  if [ -z "$sp" ] || [ "$sp" = "None" ]; then sp=$(gr post /servicePrincipals --body "{\"appId\":\"$appid\"}" --query id -o tsv); fi
  gr patch "/servicePrincipals/$sp" --body '{"tags":["WindowsAzureActiveDirectoryIntegratedApp"]}' -o none
  # aplikační role pro volající bez uživatele (Container Apps Job, jiný server) přes managed identitu
  if [ "$(gr get "/applications/$id?\$select=appRoles" --query "length(appRoles[?value=='Dokumenty.App'])" -o tsv)" = "0" ]; then
    gr patch "/applications/$id" --body "{\"appRoles\":[{\"id\":\"$(uuidgen | tr 'A-Z' 'a-z')\",\"value\":\"Dokumenty.App\",\"displayName\":\"Dokumenty.App\",
      \"description\":\"Převod dokumentů aplikační identitou (Job, server)\",\"allowedMemberTypes\":[\"Application\"],\"isEnabled\":true}]}" -o none
  fi
  # consent appky sama na sebe = ROPC/CLI test s --client <appId> (veřejný klient); SPFx consent dělá ai-spfx-api-grant.sh
  if [ "$(gr get "/oauth2PermissionGrants?\$filter=clientId eq '$sp' and resourceId eq '$sp'" --query 'length(value)' -o tsv)" = "0" ]; then
    gr post /oauth2PermissionGrants --body "{\"clientId\":\"$sp\",\"consentType\":\"AllPrincipals\",\"resourceId\":\"$sp\",\"scope\":\"access_as_user\"}" -o none
  fi
  echo "entra: appId=$appid audience=api://$appid sp=$sp"
}

do_push() {
  azs acr login -n "$ACR" --expose-token --query accessToken -o tsv | "$DOCKER" login "$ACR.azurecr.io" -u 00000000-0000-0000-0000-000000000000 --password-stdin
  "$DOCKER" buildx build --platform linux/amd64 -t "$IMG" --push "$SRC"
  echo "push: $IMG"
}

do_deploy() {
  local appid envid acrid idj idid idcl url
  appid=$(api_appid); [ -n "$appid" ] && [ "$appid" != "None" ] || { echo "nejdřív krok entra" >&2; exit 1; }
  if [ -n "$ENVN" ]; then envid=$(azs containerapp env list --query "[?name=='$ENVN'].id | [0]" -o tsv)
  else envid=$(azs containerapp env list --query '[0].id' -o tsv); fi
  [ -n "$envid" ] || { echo "Container Apps env nenalezeno" >&2; exit 1; }
  local loc; loc=$(azs containerapp env show --ids "$envid" --query location -o tsv)
  azs group create -n "$RG" -l "$loc" --tags ucel=egd-workshop -o none
  idj=$(azs identity create -g "$RG" -n "id-$APP-pull" --tags ucel=egd-workshop -o json)
  idid=$(echo "$idj" | jq -r .id); local pid; pid=$(echo "$idj" | jq -r .principalId)
  acrid=$(azs acr show -n "$ACR" --query id -o tsv)
  if [ "$(azs role assignment list --assignee "$pid" --scope "$acrid" --role AcrPull --query 'length(@)' -o tsv)" = "0" ]; then
    azs role assignment create --assignee-object-id "$pid" --assignee-principal-type ServicePrincipal --scope "$acrid" --role AcrPull -o none
    echo "AcrPull přidělen, čekám 60 s na propagaci"; sleep 60
  fi
  local envs=(TENANT_ID="$TENANT" API_CLIENT_ID="$appid" REQUIRED_SCOPE=access_as_user REQUIRED_ROLE=Dokumenty.App MAX_BYTES="$MAXB" CONVERT_TIMEOUT_MS="$TMO" CORS_ORIGINS="$CORS")
  if azs containerapp show -g "$RG" -n "$APP" -o none 2>/dev/null; then
    azs containerapp update -g "$RG" -n "$APP" --image "$IMG" --cpu "$CPU" --memory "$MEM" --min-replicas 0 --max-replicas 2 \
      --set-env-vars "${envs[@]}" -o none
  else
    azs containerapp create -g "$RG" -n "$APP" --environment "$envid" --image "$IMG" --registry-server "$ACR.azurecr.io" --registry-identity "$idid" \
      --user-assigned "$idid" --ingress external --target-port 8080 --cpu "$CPU" --memory "$MEM" --min-replicas 0 --max-replicas 2 \
      --scale-rule-name http --scale-rule-type http --scale-rule-http-concurrency 4 --env-vars "${envs[@]}" --tags ucel=egd-workshop -o none
  fi
  url=https://$(azs containerapp show -g "$RG" -n "$APP" --query properties.configuration.ingress.fqdn -o tsv)
  echo "deploy: $url  (API appId $appid)"
}

case $STEP in entra) do_entra;; push) do_push;; deploy) do_deploy;; all) do_entra; do_push; do_deploy;; esac
