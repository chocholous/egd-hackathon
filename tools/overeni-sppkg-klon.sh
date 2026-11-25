#!/usr/bin/env bash
# Z hotového .sppkg udělá klon s novým ProductID, jménem a žádostí o API access (webApiPermissionRequests).
# Použití: overeni-sppkg-klon.sh <zdroj.sppkg> <nový.sppkg> <jméno> <resource> <scope>   (resource = displayName, appId nebo objectId API)
set -euo pipefail
[[ "${1:-}" == --help || $# -lt 5 ]] && { sed -n 2,4p "$0"; exit 0; }
SRC=$(cd "$(dirname "$1")" && pwd)/$(basename "$1"); OUT=$(cd "$(dirname "$2")" && pwd)/$(basename "$2"); NAME=$3; RES=$4; SCOPE=$5
T=$(mktemp -d); cd "$T"; unzip -q "$SRC"
OLDN=$(grep -oE ' Name="[^"]+"' AppManifest.xml | head -1 | cut -d'"' -f2); OLDR=$(grep -oE 'ResourceId="[^"]+"' AppManifest.xml | cut -d'"' -f2); OLDS=$(grep -oE 'Scope="[^"]+"' AppManifest.xml | cut -d'"' -f2)
for g in $(grep -rhoE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' . | sort -u | grep -vF "$OLDR"); do n=$(uuidgen | tr A-Z a-z); grep -rlF "$g" . | xargs sed -i '' "s/$g/$n/g"; find . -depth -name "*$g*" | while read -r p; do mv "$p" "$(dirname "$p")/$(basename "$p" | sed "s/$g/$n/")"; done; done
sed -i '' "s#ResourceId=\"$OLDR\" Scope=\"$OLDS\"#ResourceId=\"$RES\" Scope=\"$SCOPE\"#; s#Name=\"$OLDN\"#Name=\"$NAME\"#; s#<Title>$OLDN</Title>#<Title>$NAME</Title>#" AppManifest.xml
rm -f "$OUT"; zip -q -r -X "$OUT" '[Content_Types].xml' _rels .; echo "hotovo: $OUT ($NAME → $RES/$SCOPE)"
