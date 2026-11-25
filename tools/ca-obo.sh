#!/usr/bin/env bash
# ca-obo.sh — on-behalf-of (OBO) na Container App v egd labu: Entra registrace, identita bez tajemství,
# nasazení, varianta s client secret v Key Vault a testovací matice. Idempotentní, jen lab tenant.
set -euo pipefail
usage() { cat <<'U'
Použití: tools/ca-obo.sh <krok> [argumenty]

Kroky (v tomto pořadí; každý je idempotentní):
  entra                 registrace API (scope access_as_user, delegované Graph User.Read + Mail.ReadBasic),
                        testovací public klient pro ROPC, souhlas klient→API (AllPrincipals) a souhlas API→Graph
                        JEN pro uživatele v CONSENT_USERS (consentType Principal; ostatní slouží jako negativní test)
  azure                 RG, uživatelem přiřazená managed identity (AcrPull + federated credential na API)
  build <tag>           docker build linux/amd64 + push do ACR (tools/data-prava-docker-push.sh)
  deploy <tag> [mi|secret]  vytvoří/aktualizuje Container App ve STÁVAJÍCÍM prostředí, min. repliky 0
  kv                    Key Vault (RBAC), client secret API do něj, role Key Vault Secrets User pro identitu
  consent-all           admin consent API→Graph pro celý tenant (AllPrincipals) — mění negativní test „bez souhlasu“
  test [výstup.jsonl]   matice volání tokeny lab uživatelů (tools/data-prava-token.py) včetně negativních případů
  opakuj <n> <uživatel> [výstup]  n× /api/posta jedním tokenem (stabilita a latence výměny)
  stav                  vypíše appId, FQDN, režim, granty
  copilot-grant         uloží stávající granty API (dukazy/copilot/grant-pred-<čas>.json) a přidá API→Graph scopy
                        COPILOT_SCOPES_DELEG (Chat + Retrieval API) a API→gateway Gateway.Use, JEN pro CONSENT_USERS
  copilot-revert [soubor]  vrátí uložené granty na uložený scope, smaže gateway granty, vrátí requiredResourceAccess;
                        jiné granty (přidané po uložení) nechá (výchozí soubor: poslední grant-pred-*)
  copilot-test <uživatel> [výstup.jsonl] [dotaz] [filtr]  ROPC token → /api/copilot/retrieval, /chat, /odpoved

Proměnné (výchozí = egd lab; přepiš env proměnnou):
  SUB, TENANT, RG=rg-egd-ca-obo, LOC=swedencentral, CA=ca-egd-obo, ENV_ID (stávající Container Apps env),
  ACR=acrppfroomsca3lbgs, MI=id-egd-ca-obo, KV=kv-egd-ca-obo-<suffix>, API_NAME=egd-ca-obo-api,
  CLIENT_NAME=egd-ca-obo-klient, CONSENT_USERS="tomas.prochazka petra.novakova", NOCONSENT_USER=lucie.dvorakova,
  ORIGIN=https://pavelchocholousgmail.sharepoint.com (CORS pro SPFx),
  COPILOT_SCOPES_DELEG (výchozí 7 scopů Chat API + Files.Read.All), GATEWAY_APPID, GATEWAY_URL (gateway LLM sondy ai)
Stav (appId atd.) se ukládá do sondy/container-app/obo/stav.json (bez tajemství).
U
}
[[ "${1:-}" == "--help" || "${1:-}" == "-h" || $# -lt 1 ]] && { usage; exit 0; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SUB=${SUB:-05a636d8-d8e3-49d2-a450-4b3ff7cc0a13}; TENANT=${TENANT:-972a674c-7b85-4e56-a31f-b2f95b42fd1e}
DOM=${DOM:-pavelchocholousgmail.onmicrosoft.com}
RG=${RG:-rg-egd-ca-obo}; LOC=${LOC:-swedencentral}; CA=${CA:-ca-egd-obo}
ENV_ID=${ENV_ID:-/subscriptions/$SUB/resourceGroups/rg-ppf-rooms-lab/providers/Microsoft.App/managedEnvironments/ca-ppf-rooms-env}
ACR=${ACR:-acrppfroomsca3lbgs}; MI=${MI:-id-egd-ca-obo}
API_NAME=${API_NAME:-egd-ca-obo-api}; CLIENT_NAME=${CLIENT_NAME:-egd-ca-obo-klient}
CONSENT_USERS=${CONSENT_USERS:-"tomas.prochazka petra.novakova"}; NOCONSENT_USER=${NOCONSENT_USER:-lucie.dvorakova}
ORIGIN=${ORIGIN:-https://pavelchocholousgmail.sharepoint.com}
GRAPH_APPID=00000003-0000-0000-c000-000000000000
GRAPH_SCOPES_DELEG="User.Read Mail.ReadBasic"
# Chat API (403 „Required scopes“ v sondy/ms-llm/copilot-graph.md ř. 2) + Files.Read.All pro Retrieval
COPILOT_SCOPES_DELEG=${COPILOT_SCOPES_DELEG:-"Sites.Read.All Mail.Read People.Read.All OnlineMeetingTranscript.Read.All Chat.Read ChannelMessage.Read.All ExternalItem.Read.All Files.Read.All"}
GATEWAY_APPID=${GATEWAY_APPID:-7b59591a-0058-4799-be76-0d1f5b79ca95}   # „EGD sonda AI gateway“ (tools/ai-gateway-deploy.sh)
GATEWAY_URL=${GATEWAY_URL:-https://ca-egd-llm-gateway.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io}
STAV="$ROOT/sondy/container-app/obo/stav.json"
G=https://graph.microsoft.com/v1.0
TAGS=(ucel=egd-workshop)

[ "$(az account show --subscription "$SUB" --query tenantId -o tsv)" = "$TENANT" ] || { echo "az míří na jiný tenant — konec"; exit 1; }
gr() { local m=$1 u=$2; shift 2; az rest --subscription "$SUB" --method "$m" --url "$G$u" --headers Content-Type=application/json "$@"; }
st() { [ -f "$STAV" ] && jq -r "$1 // empty" "$STAV" || true; }
st_set() { local tmp; tmp=$(mktemp); { [ -f "$STAV" ] && cat "$STAV" || echo '{}'; } | jq "$1" > "$tmp"; mv "$tmp" "$STAV"; }

sp_of() { gr GET "/servicePrincipals?\$filter=appId eq '$1'&\$select=id" --query 'value[0].id' -o tsv; }
ensure_sp() { local id; id=$(sp_of "$1"); [ -n "$id" ] && echo "$id" || gr POST /servicePrincipals --body "{\"appId\":\"$1\"}" --query id -o tsv; }
# grant: clientSp resourceSp scope consentType [principalId]
grant() {
  local cli=$1 res=$2 scope=$3 typ=$4 pid=${5:-}
  # Graph nepodporuje filtr podle consentType/principalId → filtr jen clientId, zbytek přes jq
  local ex; ex=$(gr GET "/oauth2PermissionGrants?\$filter=clientId eq '$cli'" -o json | \
    jq -r --arg r "$res" --arg t "$typ" --arg p "$pid" '[.value[] | select(.resourceId==$r and .consentType==$t and (($p=="") or .principalId==$p))][0].id // empty')
  if [ -n "$ex" ]; then gr PATCH "/oauth2PermissionGrants/$ex" --body "{\"scope\":\"$scope\"}" -o none; echo "grant $typ ${pid:-*} upraven: $scope"
  else
    local b; b=$(jq -nc --arg c "$cli" --arg r "$res" --arg s "$scope" --arg t "$typ" --arg p "$pid" \
      '{clientId:$c,resourceId:$r,scope:$s,consentType:$t} + (if $p=="" then {} else {principalId:$p} end)')
    gr POST /oauth2PermissionGrants --body "$b" -o none; echo "grant $typ ${pid:-*} vytvořen: $scope"
  fi
}

krok_entra() {
  local app; app=$(gr GET "/applications?\$filter=displayName eq '$API_NAME'" --query 'value[0].appId' -o tsv)
  local gsp; gsp=$(sp_of $GRAPH_APPID)
  local scopes_json; scopes_json=$(gr GET "/servicePrincipals/$gsp?\$select=oauth2PermissionScopes" -o json | \
    jq -c --arg w "$GRAPH_SCOPES_DELEG" '[.oauth2PermissionScopes[] | select(.value as $v | ($w|split(" ")|index($v))) | {id, type:"Scope"}]')
  if [ -z "$app" ]; then
    local sid; sid=$(uuidgen | tr A-Z a-z)
    app=$(gr POST /applications --body "$(jq -nc --arg n "$API_NAME" --arg s "$sid" --argjson ra "$scopes_json" '{displayName:$n, signInAudience:"AzureADMyOrg",
      tags:["ucel=egd-workshop"],
      api:{requestedAccessTokenVersion:2, oauth2PermissionScopes:[{id:$s, value:"access_as_user", type:"User", isEnabled:true,
        adminConsentDisplayName:"Přístup k OBO API jako uživatel", adminConsentDescription:"Appka volá OBO API jménem přihlášeného uživatele",
        userConsentDisplayName:"Přístup k OBO API", userConsentDescription:"Appka volá OBO API vaším jménem"}]},
      requiredResourceAccess:[{resourceAppId:"00000003-0000-0000-c000-000000000000", resourceAccess:$ra}]}')" --query appId -o tsv)
    local oid; oid=$(gr GET "/applications(appId='$app')" --query id -o tsv)
    gr PATCH "/applications/$oid" --body "{\"identifierUris\":[\"api://$app\"]}" -o none
    echo "API registrace vytvořena: $app"
  fi
  local apisp; apisp=$(ensure_sp "$app")
  # tag, aby šlo API schválit pro SPFx (SharePoint Online Web Client Extensibility) — viz tools/ai-spfx-api-grant.sh
  gr PATCH "/servicePrincipals/$apisp" --body '{"tags":["WindowsAzureActiveDirectoryIntegratedApp"]}' -o none
  local scope_id; scope_id=$(gr GET "/applications(appId='$app')" --query "api.oauth2PermissionScopes[?value=='access_as_user'].id | [0]" -o tsv)

  local cli; cli=$(gr GET "/applications?\$filter=displayName eq '$CLIENT_NAME'" --query 'value[0].appId' -o tsv)
  if [ -z "$cli" ]; then
    cli=$(gr POST /applications --body "$(jq -nc --arg n "$CLIENT_NAME" --arg a "$app" --arg s "$scope_id" '{displayName:$n, signInAudience:"AzureADMyOrg",
      tags:["ucel=egd-workshop"], isFallbackPublicClient:true, publicClient:{redirectUris:["http://localhost"]},
      requiredResourceAccess:[{resourceAppId:$a, resourceAccess:[{id:$s,type:"Scope"}]}]}')" --query appId -o tsv)
    echo "testovací klient vytvořen: $cli"
  fi
  local clisp; clisp=$(ensure_sp "$cli")
  grant "$clisp" "$apisp" access_as_user AllPrincipals
  for u in $CONSENT_USERS; do
    local uid; uid=$(gr GET "/users/$u@$DOM?\$select=id" --query id -o tsv)
    grant "$apisp" "$gsp" "$GRAPH_SCOPES_DELEG" Principal "$uid"
  done
  st_set ".apiAppId=\"$app\" | .apiSp=\"$apisp\" | .clientAppId=\"$cli\" | .graphSp=\"$gsp\""
  echo "entra hotovo: API $app, klient $cli"
}

krok_azure() {
  az group create --subscription "$SUB" -n "$RG" -l "$LOC" --tags "${TAGS[@]}" -o none
  az identity show --subscription "$SUB" -g "$RG" -n "$MI" -o none 2>/dev/null || az identity create --subscription "$SUB" -g "$RG" -n "$MI" -l "$LOC" --tags "${TAGS[@]}" -o none
  local mi_id mi_client mi_oid acr_id app
  mi_id=$(az identity show --subscription "$SUB" -g "$RG" -n "$MI" --query id -o tsv)
  mi_client=$(az identity show --subscription "$SUB" -g "$RG" -n "$MI" --query clientId -o tsv)
  mi_oid=$(az identity show --subscription "$SUB" -g "$RG" -n "$MI" --query principalId -o tsv)
  acr_id=$(az acr show --subscription "$SUB" -n "$ACR" --query id -o tsv)
  az role assignment list --subscription "$SUB" --assignee "$mi_oid" --scope "$acr_id" --role AcrPull --query '[0].id' -o tsv | grep -q . || \
    az role assignment create --subscription "$SUB" --assignee-object-id "$mi_oid" --assignee-principal-type ServicePrincipal --role AcrPull --scope "$acr_id" -o none
  app=$(st .apiAppId); [ -n "$app" ] || { echo "nejdřív krok entra"; exit 1; }
  if ! az ad app federated-credential list --id "$app" --query "[?subject=='$mi_oid'].name" -o tsv | grep -q .; then
    az ad app federated-credential create --id "$app" -o none --parameters "$(jq -nc --arg t "$TENANT" --arg s "$mi_oid" \
      '{name:"ca-egd-obo-mi", issuer:"https://login.microsoftonline.com/\($t)/v2.0", subject:$s,
        description:"Container App ca-egd-obo: OBO bez tajemství (UAMI id-egd-ca-obo)", audiences:["api://AzureADTokenExchange"]}')"
    echo "federated credential vytvořen (subject = $mi_oid)"
  fi
  st_set ".miId=\"$mi_id\" | .miClientId=\"$mi_client\" | .miObjectId=\"$mi_oid\" | .rg=\"$RG\""
  echo "azure hotovo: MI $mi_client"
}

krok_build() { local tag=${1:?tag}; "$ROOT/tools/data-prava-docker-push.sh" "$ACR" "$ROOT/sondy/container-app/obo/api" "egd-ca-obo:$tag"; }

krok_deploy() {
  local tag=${1:?tag} mode=${2:-mi} img="$ACR.azurecr.io/egd-ca-obo:${1}"
  local app mi_id mi_client; app=$(st .apiAppId); mi_id=$(st .miId); mi_client=$(st .miClientId)
  local scopes="https://graph.microsoft.com/User.Read https://graph.microsoft.com/Mail.ReadBasic"
  local cps="" s; for s in $COPILOT_SCOPES_DELEG; do cps+="https://graph.microsoft.com/$s "; done
  local envs=(TENANT_ID="$TENANT" API_CLIENT_ID="$app" OBO_MODE="$mode" MI_CLIENT_ID="$mi_client" GRAPH_SCOPES="$scopes" ALLOWED_ORIGIN="$ORIGIN"
    COPILOT_SCOPES="${cps% }" GATEWAY_URL="$GATEWAY_URL" GATEWAY_SCOPE="api://$GATEWAY_APPID/Gateway.Use")
  if [ "$mode" = secret ]; then envs+=(OBO_CLIENT_SECRET=secretref:obo-secret); fi
  if az containerapp show --subscription "$SUB" -g "$RG" -n "$CA" -o none 2>/dev/null; then
    if [ "$mode" = secret ]; then
      az containerapp secret set --subscription "$SUB" -g "$RG" -n "$CA" -o none \
        --secrets "obo-secret=keyvaultref:$(st .kvSecretUri),identityref:$mi_id"
    fi
    az containerapp update --subscription "$SUB" -g "$RG" -n "$CA" --image "$img" --replace-env-vars "${envs[@]}" -o none
    [ "$mode" = mi ] && az containerapp secret remove --subscription "$SUB" -g "$RG" -n "$CA" --secret-names obo-secret -o none 2>/dev/null || true
  else
    az containerapp create --subscription "$SUB" -g "$RG" -n "$CA" --environment "$ENV_ID" --image "$img" \
      --user-assigned "$mi_id" --registry-server "$ACR.azurecr.io" --registry-identity "$mi_id" \
      --ingress external --target-port 8080 --min-replicas 0 --max-replicas 1 --cpu 0.25 --memory 0.5Gi \
      --env-vars "${envs[@]}" --tags "${TAGS[@]}" -o none
  fi
  local fqdn; fqdn=$(az containerapp show --subscription "$SUB" -g "$RG" -n "$CA" --query properties.configuration.ingress.fqdn -o tsv)
  st_set ".fqdn=\"$fqdn\" | .mode=\"$mode\" | .image=\"$img\""
  echo "nasazeno: https://$fqdn (OBO_MODE=$mode, $img)"
}

krok_kv() {
  local app kv mi_oid; app=$(st .apiAppId); mi_oid=$(st .miObjectId)
  kv=$(st .kv); [ -n "$kv" ] || kv="kv-egd-ca-obo-$(openssl rand -hex 3)"
  az keyvault show --subscription "$SUB" -n "$kv" -o none 2>/dev/null || \
    az keyvault create --subscription "$SUB" -g "$RG" -n "$kv" -l "$LOC" --enable-rbac-authorization true --tags "${TAGS[@]}" -o none
  local kv_id me; kv_id=$(az keyvault show --subscription "$SUB" -n "$kv" --query id -o tsv)
  me=$(az ad signed-in-user show --query id -o tsv)
  for pair in "$me:User:Key Vault Secrets Officer" "$mi_oid:ServicePrincipal:Key Vault Secrets User"; do
    local oid=${pair%%:*} rest=${pair#*:}; local typ=${rest%%:*} role=${rest#*:}
    az role assignment list --subscription "$SUB" --assignee "$oid" --scope "$kv_id" --role "$role" --query '[0].id' -o tsv | grep -q . || \
      az role assignment create --subscription "$SUB" --assignee-object-id "$oid" --assignee-principal-type "$typ" --role "$role" --scope "$kv_id" -o none
  done
  if ! az keyvault secret show --vault-name "$kv" -n obo-client-secret -o none 2>/dev/null; then
    sleep 30  # propagace RBAC
    # tajemství jde rovnou z Graphu do Key Vaultu, nevypisuje se a nikam se neukládá
    gr POST "/applications(appId='$app')/addPassword" --body '{"passwordCredential":{"displayName":"ca-egd-obo kv varianta","endDateTime":"2026-12-31T00:00:00Z"}}' \
      --query secretText -o tsv | tr -d "\r\n" | az keyvault secret set --vault-name "$kv" -n obo-client-secret --file /dev/stdin -o none
    echo "client secret vytvořen a uložen do $kv (hodnota nevypsána)"
  fi
  local uri; uri=$(az keyvault secret show --vault-name "$kv" -n obo-client-secret --query id -o tsv); uri=${uri%/*}
  st_set ".kv=\"$kv\" | .kvSecretUri=\"$uri\""
  echo "kv hotovo: $kv, $uri"
}

krok_consent_all() { grant "$(st .apiSp)" "$(st .graphSp)" "$GRAPH_SCOPES_DELEG" AllPrincipals; }

krok_test() {
  local out=${1:-/dev/stdout} app cli fqdn; app=$(st .apiAppId); cli=$(st .clientAppId); fqdn=$(st .fqdn)
  local base="https://$fqdn" tok="$ROOT/tools/data-prava-token.py"
  call() { # popis token cesta
    local d=$1 t=$2 p=$3 t0 code body
    t0=$(python3 -c 'import time;print(int(time.time()*1000))')
    if [ -n "$t" ]; then body=$(curl -s -w '\n%{http_code}' -H "Authorization: Bearer $t" "$base$p"); else body=$(curl -s -w '\n%{http_code}' "$base$p"); fi
    code=${body##*$'\n'}; body=${body%$'\n'*}
    jq -nc --arg d "$d" --arg p "$p" --argjson c "$code" --arg ts "$(date -u +%FT%TZ)" --argjson ms "$(( $(python3 -c 'import time;print(int(time.time()*1000))') - t0 ))" \
      --arg b "$body" '{ts:$ts,popis:$d,cesta:$p,http:$c,wallMs:$ms,odpoved:($b|fromjson? // $b)}' | tee -a "$out" | jq -c '{popis,http,wallMs}'
  }
  call "healthz (probudí repliku)" "" /healthz
  call "bez tokenu" "" /api/posta
  call "nesmysl v Authorization" "abc.def.ghi" /api/posta
  local spo; spo=$(python3 "$tok" tomas.prochazka)
  call "tomas: token jiné audience (SharePoint)" "$spo" /api/posta
  # platně podepsaný v2 token pro JINÉ vlastní API stejného tenantu (OTHER_API, výchozí egd-sonda-data-api z sondy data-prava)
  local other=${OTHER_API:-fec3e01a-6ce4-4f9e-9dff-a61b354151fb}
  call "tomas: token jiné audience (jiné vlastní API, platný podpis)" "$(python3 "$tok" tomas.prochazka --resource "api://$other" --client "$other")" /api/posta
  for u in $CONSENT_USERS $NOCONSENT_USER; do
    local t; t=$(python3 "$tok" "$u" --resource "api://$app" --client "$cli")
    call "$u: whoami" "$t" /api/whoami
    call "$u: posta přes OBO" "$t" /api/posta
    call "$u: posta přes OBO (2. volání)" "$t" /api/posta
  done
  # přímé volání Graphu tokenem, který by měl SPFx (klient SharePoint Online Web Client Extensibility nemá Mail.ReadBasic)
  local gt; gt=$(python3 "$tok" tomas.prochazka --resource https://graph.microsoft.com)
  local code; code=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $gt" "https://graph.microsoft.com/v1.0/me/messages?\$top=1")
  jq -nc --arg c "$code" --arg ts "$(date -u +%FT%TZ)" '{ts:$ts,popis:"kontrola: tomas Graph /me/messages tokenem SPO Management Shell (ne přes OBO)",http:($c|tonumber)}' | tee -a "$out" | jq -c .
}

krok_opakuj() { # n uživatel výstup — n× /api/posta jedním tokenem (stabilita výměny, latence)
  local n=${1:?n} u=${2:?uživatel} out=${3:-/dev/stdout} t i
  t=$(python3 "$ROOT/tools/data-prava-token.py" "$u" --resource "api://$(st .apiAppId)" --client "$(st .clientAppId)")
  for i in $(seq 1 "$n"); do
    curl -s -w '\n%{http_code} %{time_total}' -H "Authorization: Bearer $t" "https://$(st .fqdn)/api/posta" | \
      python3 -c 'import sys,json; *b,l=sys.stdin.read().split("\n"); c,s=l.split(); j=json.loads("\n".join(b) or "{}"); print(json.dumps({"i":'"$i"',"user":"'"$u"'","http":int(c),"s":float(s),"mode":j.get("mode"),"oboMs":j.get("oboMs"),"aadsts":(j.get("detail") or {}).get("aadsts")}))' | tee -a "$out"
  done
}

krok_stav() {
  cat "$STAV"; local apisp gsp; apisp=$(st .apiSp); gsp=$(st .graphSp)
  gr GET "/oauth2PermissionGrants?\$filter=clientId eq '$apisp'" --query 'value[].{typ:consentType,principal:principalId,scope:scope}' -o table
  az ad app federated-credential list --id "$(st .apiAppId)" --query '[].{n:name,s:subject,a:audiences[0]}' -o table
}

krok_copilot_grant() {
  local apisp gsp gwsp app d f; apisp=$(st .apiSp); gsp=$(st .graphSp); app=$(st .apiAppId)
  gwsp=$(sp_of "$GATEWAY_APPID"); [ -n "$gwsp" ] || { echo "gateway SP nenalezen"; exit 1; }
  d="$ROOT/sondy/container-app/obo/dukazy/copilot"; mkdir -p "$d"; f="$d/grant-pred-$(date -u +%Y%m%dT%H%M%SZ).json"
  jq -n --argjson g "$(gr GET "/oauth2PermissionGrants?\$filter=clientId eq '$apisp'" -o json)" \
        --argjson r "$(gr GET "/applications(appId='$app')?\$select=requiredResourceAccess" -o json)" '{grants:$g.value, requiredResourceAccess:$r.requiredResourceAccess}' > "$f"
  echo "uloženo: $f (vrácení: tools/ca-obo.sh copilot-revert $f)"
  # requiredResourceAccess: deklarace Graph scopů (pro přehled v Entra; OBO s explicitními scopy jde i bez ní)
  local all="$GRAPH_SCOPES_DELEG $COPILOT_SCOPES_DELEG" ra gwscope
  ra=$(gr GET "/servicePrincipals/$gsp?\$select=oauth2PermissionScopes" -o json | jq -c --arg w "$all" '[.oauth2PermissionScopes[] | select(.value as $v | ($w|split(" ")|index($v))) | {id, type:"Scope"}]')
  gwscope=$(gr GET "/servicePrincipals/$gwsp?\$select=oauth2PermissionScopes" -o json | jq -r '.oauth2PermissionScopes[]|select(.value=="Gateway.Use").id')
  gr PATCH "/applications(appId='$app')" -o none --body "$(jq -nc --argjson ra "$ra" --arg gw "$GATEWAY_APPID" --arg gs "$gwscope" \
    '{requiredResourceAccess:[{resourceAppId:"00000003-0000-0000-c000-000000000000",resourceAccess:$ra},{resourceAppId:$gw,resourceAccess:[{id:$gs,type:"Scope"}]}]}')"
  local u uid
  for u in $CONSENT_USERS; do
    uid=$(gr GET "/users/$u@$DOM?\$select=id" --query id -o tsv)
    grant "$apisp" "$gsp" "$all" Principal "$uid"
    grant "$apisp" "$gwsp" Gateway.Use Principal "$uid"
  done
}

krok_copilot_revert() {
  local f=${1:-$(ls -t "$ROOT"/sondy/container-app/obo/dukazy/copilot/grant-pred-*.json | head -1)} apisp app id
  apisp=$(st .apiSp); app=$(st .apiAppId); echo "vracím podle $f"
  # uložené granty nastav na uložený scope; smaž JEN granty na gateway (ty přidal copilot-grant);
  # ostatní granty, které v souboru nejsou (přidané později jinou prací, např. egd10), nech být
  local gwsp; gwsp=$(sp_of "$GATEWAY_APPID")
  local g id res sc
  while read -r g; do
    id=$(jq -r .id <<<"$g"); res=$(jq -r .resourceId <<<"$g")
    sc=$(jq -r --arg i "$id" '.grants[]|select(.id==$i).scope' "$f")
    if [ -n "$sc" ]; then gr PATCH "/oauth2PermissionGrants/$id" --body "$(jq -nc --arg s "$sc" '{scope:$s}')" -o none; echo "grant $id → $sc"
    elif [ "$res" = "$gwsp" ]; then gr DELETE "/oauth2PermissionGrants/$id" -o none; echo "smazán gateway grant $id"
    else echo "ponechán (není v souboru, není gateway): $id $(jq -r '.principalId+" "+.scope' <<<"$g")"; fi
  done < <(gr GET "/oauth2PermissionGrants?\$filter=clientId eq '$apisp'" -o json | jq -c '.value[]')
  gr PATCH "/applications(appId='$app')" -o none --body "$(jq -c '{requiredResourceAccess}' "$f")"; echo "requiredResourceAccess vráceno"
}

krok_copilot_test() { # uživatel výstup dotaz filtr
  local u=${1:?uživatel} out=${2:-/dev/stdout} q=${3:-"Jaký je průměr spokojenosti s prostředím kanceláře?"} flt=${4:-} t p
  t=$(python3 "$ROOT/tools/data-prava-token.py" "$u" --resource "api://$(st .apiAppId)" --client "$(st .clientAppId)")
  for p in retrieval chat odpoved; do
    local b; b=$(jq -nc --arg q "$q" --arg f "$flt" '{dotaz:$q, raw:true} + (if $f=="" then {} else {filtr:$f} end)')
    curl -s -w '\n%{http_code} %{time_total}' -X POST -H "Authorization: Bearer $t" -H 'content-type: application/json' -d "$b" "https://$(st .fqdn)/api/copilot/$p" | \
      python3 -c 'import sys,json,datetime; *b,l=sys.stdin.read().split("\n"); c,s=l.split(); t="\n".join(b)
try: j=json.loads(t)
except Exception: j=t
print(json.dumps({"ts":datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),"user":sys.argv[1],"endpoint":sys.argv[2],"http":int(c),"wallS":float(s),"odpoved":j},ensure_ascii=False))' "$u" "$p" | tee -a "$out" | jq -c '{endpoint,http,wallS,g:(.odpoved.graphStatus // .odpoved.gatewayStatus),e:(.odpoved.graphChyba.error.message // .odpoved.detail.aadsts // .odpoved.error)}'
  done
}

k=$1; shift
case $k in
  entra) krok_entra "$@";; azure) krok_azure "$@";; build) krok_build "$@";; deploy) krok_deploy "$@";;
  kv) krok_kv "$@";; copilot-grant) krok_copilot_grant "$@";; copilot-revert) krok_copilot_revert "$@";; copilot-test) krok_copilot_test "$@";; opakuj) krok_opakuj "$@";; consent-all) krok_consent_all "$@";; test) krok_test "$@";; stav) krok_stav "$@";;
  *) usage; exit 2;;
esac
