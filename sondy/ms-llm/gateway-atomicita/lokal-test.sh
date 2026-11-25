#!/usr/bin/env bash
set -u; S=$(dirname "$0"); G=$HOME/Projects/egd-workshop/sondy/ai/gateway
node "$S/mock.mjs" & MP=$!; sleep 0.5
P=$(printf '{"claims":[{"typ":"oid","val":"app-oid-1"},{"typ":"roles","val":"Gateway.App"},{"typ":"appid","val":"bdb6"}]}' | base64)
for V in fix old; do
  F=$G/server.mjs; [ $V = old ] && F=$S/server-v2.mjs
  PORT=9912 IDENTITY_ENDPOINT=http://localhost:9911/mi IDENTITY_HEADER=x AOAI_ENDPOINT=http://localhost:9911 AOAI_CHAT_DEPLOYMENT=m DI_ENDPOINT=http://localhost:9911 DI_API_VERSION=x TABLE_ENDPOINT=http://localhost:9911 TABLE_NAME=t$V APPS_JSON='{"tiny":{"tokensPerDay":60}}' DEFAULT_TOKENS_PER_DAY=50000 PRICES_JSON='{"chatInPerM":0.4,"chatOutPerM":1.6,"ocrPer1000Pages":1.5,"prebuiltPer1000Pages":10}' REQUIRED_SCOPE=Gateway.Use REQUIRED_ROLE=Gateway.App QUOTA_MAX_RETRIES=20 QUOTA_RETRY_BACKOFF_MS=25 node "$F" > "$S/gw-$V.log" 2>&1 & GP=$!
  sleep 0.8; pids=()
  for i in $(seq 12); do curl -s -o "$S/r-$V-$i" -w '%{http_code}\n' -H "x-ms-client-principal: $P" -H 'x-app-id: tiny' -H 'content-type: application/json' -d '{"prompt":"x","max_tokens":20}' localhost:9912/api/chat > "$S/c-$V-$i" & pids+=($!); done
  wait "${pids[@]}"
  echo "[$V] $(cat "$S"/c-$V-* | sort | uniq -c | tr '\n' ' ') součet tokenů 200: $(cat "$S"/r-$V-* | jq -s '[.[].usage.total_tokens // 0] | add') kvóta: $(curl -s -H "x-ms-client-principal: $P" -H 'x-app-id: tiny' localhost:9912/api/kvota | jq -c .spotreba)"
  kill $GP
done
kill $MP
