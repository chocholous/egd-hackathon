#!/usr/bin/env bash
# Nasadí .sppkg do tenant app catalogu a nainstaluje/upgraduje ho na jeden web, volitelně založí stránku s web partem a PUBLIKUJE ji.
# Vždy HOME=~/.m365-osobni (lab). Past: stránka s web partem musí být publikovaná (spo page set --publish), jinak je prázdná.
set -euo pipefail
if [ "${1:-}" = "--help" ] || [ $# -lt 2 ]; then cat <<'U'
Použití: tools/ai-spfx-deploy.sh <soubor.sppkg> <url-webu> [<webPartId> <název-stránky.aspx> '<json vlastností web partu>']
  Proměnná CAT = URL tenant app catalogu (výchozí lab https://pavelchocholousgmail.sharepoint.com/sites/apps)
  Příklad: tools/ai-spfx-deploy.sh sondy/ai/spfx/sharepoint/solution/egd-ai-gateway.sppkg https://…/sites/egd-sonda-ai \
           5b0b4f5c-2d3a-4a51-9d0e-6a1f3c7e8b24 ai.aspx '{"gatewayUrl":"https://…","apiAppId":"…","appKey":"demo"}'
  Schválení API access (webApiPermissionRequests) tohle NEDĚLÁ: viz tools/ai-spfx-api-grant.sh nebo m365 spo serviceprincipal permissionrequest approve.
U
exit 0; fi
PKG=$1; SITE=$2; WP=${3:-}; PAGE=${4:-}; PROPS=${5:-{\}}; CAT=${CAT:-https://pavelchocholousgmail.sharepoint.com/sites/apps}
m() { HOME=$HOME/.m365-osobni m365 "$@"; }
NAME=$(basename "$PKG")
ID=$(m spo app add --filePath "$PKG" --appCatalogScope tenant --appCatalogUrl "$CAT" --overwrite --output json | jq -r .UniqueId)
m spo app deploy --name "$NAME" --appCatalogScope tenant --appCatalogUrl "$CAT"
if m spo app instance list --siteUrl "$SITE" --output json | jq -e --arg n "${NAME%.sppkg}" 'any(.[]; .Title==$n)' >/dev/null; then
  m spo app upgrade --id "$ID" --siteUrl "$SITE" --appCatalogScope tenant
else m spo app install --id "$ID" --siteUrl "$SITE" --appCatalogScope tenant; fi
echo "app id $ID nainstalována na $SITE (po instalaci počkej ~1 min na propagaci web partů)"
if [ -n "$WP" ]; then
  m spo page add --webUrl "$SITE" --name "$PAGE" --layoutType Article --publish --output none
  m spo page section add --webUrl "$SITE" --pageName "$PAGE" --sectionTemplate OneColumn --order 1
  m spo page clientsidewebpart add --webUrl "$SITE" --pageName "$PAGE" --webPartId "$WP" --section 1 --column 1 --webPartProperties "$PROPS"
  m spo page set --webUrl "$SITE" --name "$PAGE" --publish
  echo "stránka $SITE/SitePages/$PAGE"
fi
