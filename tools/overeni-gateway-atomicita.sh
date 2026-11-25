#!/usr/bin/env bash
# Atomicita kvóty gateway: N souběžných POST /api/chat na appku s malým limitem pod aplikačním klientem
# (nová identita = čistá kvóta). Porovná počet 200/429, součet tokenů z odpovědí a zapsanou spotřebu (/api/kvota).
# Použití: overeni-gateway-atomicita.sh [N=12] [appKey=tiny]   env: GW_FQDN, GW_APP_ID (+ viz overeni-gateway-app.sh)
set -euo pipefail
[[ "${1:-}" == --help || "${1:-}" == -h ]] && { sed -n 2,4p "$0"; exit 0; }
N=${1:-12}; KEY=${2:-tiny}; DIR=$(cd "$(dirname "$0")" && pwd); T=$(mktemp -d)
echo "N=$N appKey=$KEY $(date -u +%FT%TZ)"
echo "kvóta před:"; "$DIR/overeni-gateway-app.sh" GET /api/kvota "" "$KEY" | head -1
for i in $(seq 1 "$N"); do ( "$DIR/overeni-gateway-app.sh" POST /api/chat '{"prompt":"Řekni jedno slovo.","max_tokens":20}' "$KEY" > "$T/$i.out" 2>&1 ) & done; wait
echo "výsledky:"; for i in $(seq 1 "$N"); do tail -1 "$T/$i.out"; done | sed 's/\[HTTP //; s/\]//' | awk -F, '{print $1}' | sort | uniq -c
SUM=0; for i in $(seq 1 "$N"); do t=$(head -1 "$T/$i.out" | jq -r '.usage.total_tokens // empty' 2>/dev/null || true); [ -n "$t" ] && SUM=$((SUM+t)); done
echo "součet tokenů v odpovědích 200: $SUM"
echo "kvóta po:"; "$DIR/overeni-gateway-app.sh" GET /api/kvota "" "$KEY" | head -1
/usr/bin/trash "$T"
