#!/usr/bin/env bash
# Nasadí/aktualizuje Container Apps Job s denním reportem (napojeni-report-job.py) s managed identitou.
# Skript se do jobu dopraví base64 v env proměnné (bez ACR; pro produkci image z registru).
# Použití: napojeni-job-deploy.sh --rg RG --name JOB --env ENV_RESOURCE_ID --sender MAILBOX --to ADDR
#          --image IMG --cnb-url URL --location REGION [--cron "0 6 * * *"] [--negative MAILBOX] [--trigger Manual|Schedule]
# Subscription: AZ_SUB (povinné). Na konci vypíše principalId MI (potřebuje ho napojeni-exo-rbac.ps1).
# Pozn.: az CLI nepřijme --args "-c ..." (CLI 2.x, containerapp 1.3.0b6), proto se jde přes --yaml (JSON je platné YAML).
set -euo pipefail
usage() { sed -n '2,8p' "$0"; exit "${1:-0}"; }
CRON="0 6 * * *"; TRIG=Manual; NEG=""
while [ $# -gt 0 ]; do case "$1" in
  --rg) RG=$2; shift 2;; --name) NAME=$2; shift 2;; --env) ENVID=$2; shift 2;; --sender) SENDER=$2; shift 2;;
  --to) TO=$2; shift 2;; --cron) CRON=$2; shift 2;; --negative) NEG=$2; shift 2;; --cnb-url) CNB=$2; shift 2;;
  --image) IMG=$2; shift 2;; --trigger) TRIG=$2; shift 2;; --location) LOC=$2; shift 2;; -h|--help) usage 0;;
  *) echo "neznámý argument $1" >&2; usage 1;; esac; done
: "${AZ_SUB:?nastav AZ_SUB}"; : "${RG:?}" "${NAME:?}" "${ENVID:?}" "${SENDER:?}" "${TO:?}" "${IMG:?}" "${CNB:?}" "${LOC:?}"
DIR="$(cd "$(dirname "$0")" && pwd)"; Y=$(mktemp)
python3 - "$Y" "$DIR/napojeni-report-job.py" <<PY
import json, sys, base64, os
y, src = sys.argv[1:3]
env = [("S", base64.b64encode(open(src,'rb').read()).decode()), ("MAIL_SENDER","$SENDER"), ("MAIL_TO","$TO"), ("CNB_URL","$CNB")]
if "$NEG": env.append(("MAIL_NEGATIVE_SENDER","$NEG"))
cfg = {"triggerType": "$TRIG", "replicaTimeout": 300, "replicaRetryLimit": 0}
if "$TRIG" == "Schedule": cfg["scheduleTriggerConfig"] = {"cronExpression": "$CRON", "parallelism": 1, "replicaCompletionCount": 1}
else: cfg["manualTriggerConfig"] = {"parallelism": 1, "replicaCompletionCount": 1}
json.dump({"location": "$LOC", "identity": {"type": "SystemAssigned"}, "tags": {"ucel": "egd-workshop"},
  "properties": {"environmentId": "$ENVID", "configuration": cfg, "template": {"containers": [{
    "name": "report", "image": "$IMG", "command": ["python3"], "args": ["-c", "import os,base64;exec(base64.b64decode(os.environ['S']))"],
    "resources": {"cpu": 0.25, "memory": "0.5Gi"}, "env": [{"name": k, "value": v} for k, v in env]}]}}}, open(y, "w"))
PY
if az containerapp job show --subscription "$AZ_SUB" -g "$RG" -n "$NAME" -o none 2>/dev/null; then
  az containerapp job update --subscription "$AZ_SUB" -g "$RG" -n "$NAME" --yaml "$Y" -o none
else
  az containerapp job create --subscription "$AZ_SUB" -g "$RG" -n "$NAME" --yaml "$Y" -o none
fi
/usr/bin/trash "$Y"
az containerapp job show --subscription "$AZ_SUB" -g "$RG" -n "$NAME" --query "{principalId:identity.principalId,trigger:properties.configuration.triggerType,cron:properties.configuration.scheduleTriggerConfig.cronExpression}" -o json
