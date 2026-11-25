#!/usr/bin/env bash
# Sonda LLM gateway (Container App za Easy Auth): získá delegovaný token přes az a zavolá endpoint, vypíše HTTP kód a latenci.
set -euo pipefail
usage() { cat <<'U'
Použití: tools/ai-gateway-probe.sh <whoami|kvota|chat|vision|ocr|image|neprihlaseny> [argument]
  Proměnné (povinné): GW_FQDN (host gateway), GW_APP_ID (appId API registrace; scope Gateway.Use)
  Volitelné: GW_APP_KEY (hlavička X-App-Id), GW_TOKEN (hotový token místo az get-access-token)
  Příklady:
    GW_FQDN=… GW_APP_ID=… tools/ai-gateway-probe.sh chat "Shrň: SharePoint je …"
    … tools/ai-gateway-probe.sh vision cesta/foto.png        # obrázek do chat modelu
    … tools/ai-gateway-probe.sh ocr cesta/faktura.png [prebuilt-read|prebuilt-layout|prebuilt-invoice]
  Token získává `az account get-access-token --scope api://$GW_APP_ID/Gateway.Use` (az CLI musí být předautorizovaný na API).
U
}
[ "${1:-}" = "--help" ] || [ $# -eq 0 ] && { usage; exit 0; }
: "${GW_FQDN:?chybí GW_FQDN}"; : "${GW_APP_ID:?chybí GW_APP_ID}"
TOK="${GW_TOKEN:-$(az account get-access-token --scope "api://$GW_APP_ID/Gateway.Use" --query accessToken -o tsv)}"
H=(-H "Authorization: Bearer $TOK" -H 'Content-Type: application/json'); [ -n "${GW_APP_KEY:-}" ] && H+=(-H "X-App-Id: $GW_APP_KEY")
U="https://$GW_FQDN"; W='\n[HTTP %{http_code}, %{time_total}s]\n'
case "$1" in
  whoami|kvota) curl -s -w "$W" "${H[@]}" "$U/api/$1" ;;
  chat) jq -n --arg p "${2:?prompt}" '{prompt:$p,max_tokens:300}' | curl -s -w "$W" "${H[@]}" -d @- "$U/api/chat" ;;
  vision) TMPB=$(mktemp); base64 < "${2:?soubor}" | tr -d '\n' > "$TMPB"; M=$(file -b --mime-type "$2")   # --rawfile: velké soubory neprojdou přes argument
    jq -n --arg m "$M" --rawfile b "$TMPB" '{messages:[{role:"user",content:[{type:"text",text:"Co je na obrázku? Přepiš veškerý text."},{type:"image_url",image_url:{url:("data:"+$m+";base64,"+$b)}}]}],max_tokens:400}' \
      | curl -s -w "$W" "${H[@]}" -d @- "$U/api/chat" ;;
  ocr) TMPB=$(mktemp); base64 < "${2:?soubor}" | tr -d '\n' > "$TMPB"; jq -n --rawfile b "$TMPB" --arg m "${3:-prebuilt-read}" '{base64:$b,model:$m}' | curl -s -w "$W" "${H[@]}" -d @- "$U/api/ocr" ;;
  image) jq -n --arg p "${2:?prompt}" '{prompt:$p}' | curl -s -w "$W" "${H[@]}" -d @- "$U/api/image" ;;
  neprihlaseny) curl -s -w "$W" "$U/api/whoami" ;;
  *) usage; exit 2 ;;
esac
