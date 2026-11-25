#!/usr/bin/env bash
# Container Apps Job „řetěz“: ČNB → LLM gateway → docx → PDF (ca-egd-dokumenty) → e-mail s přílohou, jedna user-assigned MI.
# Ověřeno v labu 2026-11-24 (sondy/container-app/job-retez.md). Kroky idempotentní.
set -euo pipefail
usage() { cat <<'U'
Použití: tools/job-retez-deploy.sh <krok> [volby]
  kroky:  identita – RG, user-assigned MI, AcrPull, app role Gateway.App (LLM gateway) a Dokumenty.App (PDF API),
                     Exchange RBAC: Mail.Send jen ze schránky --sender (tools/napojeni-exo-rbac.ps1, pwsh)
          push     – lokální docker buildx linux/amd64 + push image jobu do ACR
          job      – Container Apps Job (trigger Manual; --cron přepne na Schedule) ve sdíleném env
          start    – spustí běh, počká na konec, vypíše stav a log kontejneru (Log Analytics)
  volby (výchozí = lab):
    --rg RG            [rg-egd-job-retez]        --name JOB        [job-egd-retez]
    --tag TAG          [0.1]                     --acr NAME        [acrppfroomsca3lbgs]
    --sender MAILBOX   [egd-report@pavelchocholousgmail.onmicrosoft.com]  (sdílená schránka, ze které Job posílá)
    --to ADRESY        [tomas.prochazka@pavelchocholousgmail.onmicrosoft.com]
    --gateway-app NAME [ca-egd-llm-gateway]  --gateway-rg RG [rg-egd-sonda-ai]  --app-key KEY [demo]
    --pdf-app NAME     [ca-egd-dokumenty]    --pdf-rg RG     [rg-egd-ca-dokumenty]
    --cron "0 6 * * *" (UTC) přepne trigger na Schedule; bez něj Manual
    --cnb-url URL      [https://api.cnb.cz/cnbapi/exrates/daily?lang=CZ]
  Proměnné: SUB (lab 05a636d8-…), DOCKER (~/.orbstack/bin/docker). Vyžaduje az, jq, docker, pwsh + ExchangeOnlineManagement.
U
}
[ $# -ge 1 ] || { usage; exit 2; }
STEP=$1; shift
case $STEP in -h|--help) usage; exit 0;; identita|push|job|start) ;; *) usage; exit 2;; esac
ROOT=$(cd "$(dirname "$0")/.." && pwd)
RG=rg-egd-job-retez; NAME=job-egd-retez; TAG=0.1; ACR=acrppfroomsca3lbgs; DOM=pavelchocholousgmail.onmicrosoft.com
SENDER=egd-report@$DOM; TO=tomas.prochazka@$DOM; GW=ca-egd-llm-gateway; GWRG=rg-egd-sonda-ai; KEY=demo
PDF=ca-egd-dokumenty; PDFRG=rg-egd-ca-dokumenty; CRON=""; CNB='https://api.cnb.cz/cnbapi/exrates/daily?lang=CZ'
while [ $# -gt 0 ]; do case $1 in
  --rg) RG=$2;; --name) NAME=$2;; --tag) TAG=$2;; --acr) ACR=$2;; --sender) SENDER=$2;; --to) TO=$2;;
  --gateway-app) GW=$2;; --gateway-rg) GWRG=$2;; --app-key) KEY=$2;; --pdf-app) PDF=$2;; --pdf-rg) PDFRG=$2;;
  --cron) CRON=$2;; --cnb-url) CNB=$2;; *) usage; exit 2;; esac; shift 2; done
SUB=${SUB:-05a636d8-d8e3-49d2-a450-4b3ff7cc0a13}; DOCKER=${DOCKER:-$HOME/.orbstack/bin/docker}
G=https://graph.microsoft.com/v1.0; IMG=$ACR.azurecr.io/$NAME:$TAG; MI=id-$NAME
azs() { az "$@" --subscription "$SUB"; }
gr() { local m=$1 u=$2; shift 2; azs rest --method "$m" --url "$G$u" --headers Content-Type=application/json "$@"; }
# appId API registrace: z audience Easy Auth (gateway) nebo z env API_CLIENT_ID (PDF API)
gw_appid() { azs containerapp auth show -g "$GWRG" -n "$GW" --query 'identityProviders.azureActiveDirectory.registration.clientId' -o tsv; }
pdf_appid() { azs containerapp show -g "$PDFRG" -n "$PDF" --query "properties.template.containers[0].env[?name=='API_CLIENT_ID'].value | [0]" -o tsv; }
fqdn() { echo "https://$(azs containerapp show -g "$2" -n "$1" --query properties.configuration.ingress.fqdn -o tsv)"; }

grant_role() { # $1 MI principalId, $2 appId API, $3 role value
  local sp rid
  sp=$(gr get "/servicePrincipals?\$filter=appId eq '$2'&\$select=id" --query 'value[0].id' -o tsv)
  rid=$(gr get "/servicePrincipals/$sp?\$select=appRoles" --query "appRoles[?value=='$3'].id | [0]" -o tsv)
  [ -n "$rid" ] && [ "$rid" != "None" ] || { echo "role $3 na $2 neexistuje" >&2; exit 1; }
  if [ "$(gr get "/servicePrincipals/$1/appRoleAssignments" --query "length(value[?appRoleId=='$rid'])" -o tsv)" = "0" ]; then
    gr post "/servicePrincipals/$1/appRoleAssignments" --body "{\"principalId\":\"$1\",\"resourceId\":\"$sp\",\"appRoleId\":\"$rid\"}" -o none
    echo "přiřazeno $3 ($2)"
  else echo "už přiřazeno $3"; fi
}

do_identita() {
  local loc envid idj pid cid acrid
  envid=$(azs containerapp env list --query '[0].id' -o tsv); loc=$(azs containerapp env show --ids "$envid" --query location -o tsv)
  azs group create -n "$RG" -l "$loc" --tags ucel=egd-workshop -o none
  idj=$(azs identity create -g "$RG" -n "$MI" --tags ucel=egd-workshop -o json)
  pid=$(echo "$idj" | jq -r .principalId); cid=$(echo "$idj" | jq -r .clientId)
  acrid=$(azs acr show -n "$ACR" --query id -o tsv)
  [ "$(azs role assignment list --assignee "$pid" --scope "$acrid" --role AcrPull --query 'length(@)' -o tsv)" != "0" ] ||
    azs role assignment create --assignee-object-id "$pid" --assignee-principal-type ServicePrincipal --scope "$acrid" --role AcrPull -o none
  grant_role "$pid" "$(gw_appid)" Gateway.App
  grant_role "$pid" "$(pdf_appid)" Dokumenty.App
  EXO_TOKEN=$(azs account get-access-token --resource https://outlook.office365.com --query accessToken -o tsv) \
    pwsh -NoProfile -File "$ROOT/tools/napojeni-exo-rbac.ps1" -Organization "${SENDER#*@}" -Mailbox "$SENDER" -AppId "$cid" -ObjectId "$pid" -Name "$NAME"
  echo "identita: $MI clientId=$cid principalId=$pid"
}

do_push() {
  azs acr login -n "$ACR" --expose-token --query accessToken -o tsv | "$DOCKER" login "$ACR.azurecr.io" -u 00000000-0000-0000-0000-000000000000 --password-stdin
  "$DOCKER" buildx build --platform linux/amd64 -t "$IMG" --push "$ROOT/sondy/container-app/job-retez/job"
  echo "push: $IMG"
}

do_job() {
  local envid loc idid cid trig
  envid=$(azs containerapp env list --query '[0].id' -o tsv); loc=$(azs containerapp env show --ids "$envid" --query location -o tsv)
  idid=$(azs identity show -g "$RG" -n "$MI" --query id -o tsv); cid=$(azs identity show -g "$RG" -n "$MI" --query clientId -o tsv)
  local envs=(AZURE_CLIENT_ID="$cid" CNB_URL="$CNB" GATEWAY_URL="$(fqdn "$GW" "$GWRG")" GATEWAY_APP_ID="$(gw_appid)" GATEWAY_APP_KEY="$KEY"
              PDF_URL="$(fqdn "$PDF" "$PDFRG")" PDF_APP_ID="$(pdf_appid)" MAIL_SENDER="$SENDER" MAIL_TO="$TO")
  if [ -n "$CRON" ]; then trig=(--trigger-type Schedule --cron-expression "$CRON"); else trig=(--trigger-type Manual); fi
  if azs containerapp job show -g "$RG" -n "$NAME" -o none 2>/dev/null; then
    azs containerapp job update -g "$RG" -n "$NAME" --image "$IMG" --set-env-vars "${envs[@]}" -o none
    [ -z "$CRON" ] || azs containerapp job update -g "$RG" -n "$NAME" --cron-expression "$CRON" -o none
  else
    azs containerapp job create -g "$RG" -n "$NAME" --environment "$envid" "${trig[@]}" --replica-timeout 600 --replica-retry-limit 0 \
      --parallelism 1 --replica-completion-count 1 --image "$IMG" --cpu 0.5 --memory 1Gi \
      --registry-server "$ACR.azurecr.io" --registry-identity "$idid" --mi-user-assigned "$idid" \
      --env-vars "${envs[@]}" --tags ucel=egd-workshop -o none
  fi
  echo "job: $NAME ($(azs containerapp job show -g "$RG" -n "$NAME" --query properties.configuration.triggerType -o tsv)) image $IMG"
}

do_start() {
  local ex st ws
  ex=$(azs containerapp job start -g "$RG" -n "$NAME" --query name -o tsv); echo "běh: $ex  start $(date -u +%T)"
  while :; do st=$(azs containerapp job execution show -g "$RG" -n "$NAME" --job-execution-name "$ex" --query properties.status -o tsv)
    case $st in Succeeded|Failed|Stopped|Degraded) break;; esac; sleep 10; done
  azs containerapp job execution show -g "$RG" -n "$NAME" --job-execution-name "$ex" --query '{name:name,status:properties.status,start:properties.startTime,end:properties.endTime}' -o json
  ws=$(azs containerapp env show --ids "$(azs containerapp job show -g "$RG" -n "$NAME" --query properties.environmentId -o tsv)" --query properties.appLogsConfiguration.logAnalyticsConfiguration.customerId -o tsv)
  echo "log (Log Analytics má zpoždění 1–5 min; opakuj: az monitor log-analytics query -w $ws …):"
  azs monitor log-analytics query -w "$ws" --analytics-query "ContainerAppConsoleLogs_CL | where ContainerGroupName_s startswith '$ex' | project TimeGenerated, Log_s | order by TimeGenerated asc" -o tsv 2>/dev/null || true
}

case $STEP in identita) do_identita;; push) do_push;; job) do_job;; start) do_start;; esac
