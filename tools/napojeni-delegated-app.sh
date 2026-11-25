#!/usr/bin/env bash
# Založí v lab tenantu veřejného klienta (app registrace) s delegovanými Graph scopy (výchozí Mail.Send Mail.Read)
# a udělí souhlas správce (oauth2PermissionGrant, všichni uživatelé). Idempotentní. Vypíše appId.
# Použití: napojeni-delegated-app.sh [--name "egd-sonda napojeni (delegated)"] [--scopes "Mail.Send Mail.Read"]
#   scope jiného API zapiš appId/scope, např. 7df0a125-d3be-4c96-aa54-591f83ff541c/Flows.Manage.All (Power Automate)
# Vyžaduje az přihlášený jako správce lab tenantu. Test tokenem: napojeni-graph-delegated.py
set -euo pipefail
NAME="egd-sonda napojeni (delegated)"; SCOPES="Mail.Send Mail.Read"
while [ $# -gt 0 ]; do case "$1" in --name) NAME=$2; shift 2;; --scopes) SCOPES=$2; shift 2;; -h|--help) sed -n '2,7p' "$0"; exit 0;; *) echo "?? $1" >&2; exit 1;; esac; done
GRAPH=00000003-0000-0000-c000-000000000000
APP=$(az ad app list --display-name "$NAME" --query "[0].appId" -o tsv)
if [ -z "$APP" ]; then
  APP=$(az ad app create --display-name "$NAME" --is-fallback-public-client true --sign-in-audience AzureADMyOrg --query appId -o tsv)
  az ad sp create --id "$APP" -o none
fi
for s in $SCOPES; do
  API=$GRAPH; [[ "$s" == */* ]] && { API=${s%%/*}; s=${s#*/}; }
  ID=$(az ad sp show --id $API --query "oauth2PermissionScopes[?value=='$s'].id | [0]" -o tsv)
  az ad app permission add --id "$APP" --api $API --api-permissions "$ID=Scope" -o none
done
sleep 5
az ad app permission admin-consent --id "$APP" -o none || { sleep 15; az ad app permission admin-consent --id "$APP" -o none; }
echo "$APP"
