#!/usr/bin/env bash
# Nahraje .sppkg do KATALOGU WEBU (site collection app catalog), nasadí a nainstaluje / upgraduje appku na tomtéž webu.
# Pro opakované nasazení testovacích verzí, když `appka.mjs nasadit` nejde použít (jiná šablona) nebo stránka už existuje.
# Vždy HOME=~/.m365-osobni (lab). Nic nemaže.
set -euo pipefail
if [ "${1:-}" = "--help" ] || [ $# -lt 2 ]; then cat <<'U'
Použití: tools/spfx-site-upgrade.sh <soubor.sppkg> <url-webu-s-katalogem>
  Proměnná CLI = cesta k @pnp/cli-microsoft365/dist/index.js (výchozí /opt/homebrew/lib/node_modules/@pnp/cli-microsoft365/dist/index.js)
  Vypíše čas nasazení (UTC) – hodí se k dohledání žádosti o API access (seznam Web Api Permission Requests v tenant catalogu).
  Po upgradu počkej ~1 min, než SharePoint servíruje nový bundle.
U
exit 0; fi
PKG=$1; SITE=$2; CLI=${CLI:-/opt/homebrew/lib/node_modules/@pnp/cli-microsoft365/dist/index.js}
# Sdílené HOME ~/.m365-osobni smí jen CLI v11 (CLAUDE.md § Lab: CLI 12 nad ním smazalo refresh token)
VER=$(jq -r .version "$(dirname "$CLI")/../package.json")
case "$VER" in 11.*) ;; *) echo "CLI $VER není v11 – nad sdíleným ~/.m365-osobni nespouštím (pravidlo Lab; použij tools/lab-m365.sh)" >&2; exit 2;; esac
m() { HOME=$HOME/.m365-osobni node "$CLI" "$@"; }
NAME=$(basename "$PKG")
ADD=$(m spo app add --filePath "$PKG" --appCatalogScope sitecollection --appCatalogUrl "$SITE" --overwrite --output json)
ID=$(echo "$ADD" | jq -r .UniqueId); TITLE=$(m spo app get --id "$ID" --appCatalogScope sitecollection --appCatalogUrl "$SITE" --output json | jq -r .Title)
m spo app deploy --name "$NAME" --appCatalogScope sitecollection --appCatalogUrl "$SITE"
if m spo app instance list --siteUrl "$SITE" --output json | jq -e --arg t "$TITLE" 'any(.[]; .Title==$t)' >/dev/null; then
  m spo app upgrade --id "$ID" --siteUrl "$SITE" --appCatalogScope sitecollection; echo "upgrade $ID"
else
  m spo app install --id "$ID" --siteUrl "$SITE" --appCatalogScope sitecollection; echo "install $ID"
fi
echo "nasazeno $(date -u +%FT%TZ): $NAME → $SITE"
