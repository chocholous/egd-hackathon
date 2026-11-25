#!/usr/bin/env bash
# Lokální build (OrbStack docker, linux/amd64) a push do ACR, když ACR Tasks nejsou v lab předplatném povolené
# (TasksOperationsNotAllowed). Použití: data-prava-docker-push.sh <acr-název> <adresář-s-Dockerfile> <image:tag>
# Vypíše úplnou referenci image. Subscription lab pevně (viz CLAUDE.md projektu).
set -euo pipefail
if [[ "${1:-}" == "--help" || $# -ne 3 ]]; then sed -n '2,5p' "$0"; exit $([[ "${1:-}" == "--help" ]] && echo 0 || echo 2); fi
ACR=$1; DIR=$2; IMG=$3; SUB=05a636d8-d8e3-49d2-a450-4b3ff7cc0a13
DOCKER="${DOCKER:-$HOME/.orbstack/bin/docker}"
az acr login --subscription "$SUB" -n "$ACR" --expose-token --query accessToken -o tsv | "$DOCKER" login "$ACR.azurecr.io" -u 00000000-0000-0000-0000-000000000000 --password-stdin
"$DOCKER" buildx build --platform linux/amd64 -t "$ACR.azurecr.io/$IMG" --push "$DIR"
echo "$ACR.azurecr.io/$IMG"
