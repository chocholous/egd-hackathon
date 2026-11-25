#!/usr/bin/env bash
# prava-role-cli.sh — agentská varianta skillu egd-prava-role: tři role na seznamu jen příkazy m365 CLI
# (stejné příkazy jdou na Windows v PowerShellu). Bez --ano jen vypíše plán.
set -euo pipefail

usage() {
  cat <<'EOF'
Použití: prava-role-cli.sh --web <url> --seznam <název> [volby] [--ano]

  --web URL              web (vlastník webu musí být přihlášený v m365 CLI)
  --seznam NÁZEV         existující seznam (např. Pozadavky)
  --appka NÁZEV          předpona skupin, výchozí "Evidence"  → "<appka> Zadavatelé/Schvalovatelé/Správci"
  --zadavatele UPN,..    členové skupiny Zadavatelé
  --schvalovatele UPN,.. členové skupiny Schvalovatelé
  --spravci UPN,..       členové skupiny Správci (volitelné)
  --bez-mazani           úroveň schvalovatele bez "Odstranit položky" (DeleteListItems)
  --uroven-schv NÁZEV    název úrovně schvalovatele, výchozí "EGD Schvalovatel" (s --bez-mazani "EGD Schvalovatel bez mazání")
  --uroven-zad NÁZEV     název úrovně zadavatele, výchozí "EGD Zadavatel"
  --ano                  opravdu provést (jinak jen plán)
  Proměnná M365 = příkaz CLI (výchozí "m365"; v labu: M365=tools/lab-m365.sh = globální v11 se sdíleným HOME a obnovou tokenu)

Kroky: 2 úrovně oprávnění (kopie Přispívání; schvalovatel + CancelCheckout), 3 skupiny + členové,
Čtení na webu pro všechny 3 skupiny (jinak neotevřou stránku appky), přerušení dědičnosti seznamu
bez kopie, Vlastníci webu + 3 skupiny na seznam, ReadSecurity=2 a WriteSecurity=2, kontrola čtením.
Nic nemaže (kromě toho, že přerušení dědičnosti s --clearExistingPermissions zahodí zděděná práva seznamu).
EOF
}

M365=${M365:-m365}
WEB= SEZNAM= APPKA=Evidence ZAD= SCHV= SPR= BEZMAZ=0 ANO=0 USCHV= UZAD=
while [ $# -gt 0 ]; do
  case $1 in
    --web) WEB=$2; shift 2;; --seznam) SEZNAM=$2; shift 2;; --appka) APPKA=$2; shift 2;;
    --zadavatele) ZAD=$2; shift 2;; --schvalovatele) SCHV=$2; shift 2;; --spravci) SPR=$2; shift 2;;
    --bez-mazani) BEZMAZ=1; shift;; --uroven-schv) USCHV=$2; shift 2;; --uroven-zad) UZAD=$2; shift 2;; --ano) ANO=1; shift;;
    -h|--help) usage; exit 0;; *) echo "neznámá volba $1" >&2; usage; exit 2;;
  esac
done
[ -n "$WEB" ] && [ -n "$SEZNAM" ] || { usage; exit 2; }

ZAKLAD="ViewListItems,AddListItems,EditListItems,OpenItems,ViewVersions,DeleteVersions,ManagePersonalViews,ViewFormPages,Open,ViewPages,CreateSSCSite,BrowseDirectories,BrowseUserInfo,AddDelPrivateWebParts,UpdatePersonalWebParts,UseClientIntegration,UseRemoteAPIs,CreateAlerts,EditMyUserInfo"
UZAD=${UZAD:-"EGD Zadavatel"}; RZAD="$ZAKLAD,DeleteListItems"
if [ $BEZMAZ = 1 ]; then USCHV=${USCHV:-"EGD Schvalovatel bez mazání"}; RSCHV="$ZAKLAD,CancelCheckout"
else USCHV=${USCHV:-"EGD Schvalovatel"}; RSCHV="$ZAKLAD,DeleteListItems,CancelCheckout"; fi
GZ="$APPKA Zadavatelé"; GS="$APPKA Schvalovatelé"; GP="$APPKA Správci"

run() { echo "+ m365 $*"; if [ $ANO = 1 ]; then $M365 "$@" --output json >/dev/null || { echo "CHYBA v: m365 $*" >&2; exit 1; }; fi; }
existuje_uroven() { $M365 spo roledefinition list --webUrl "$WEB" --output json | grep -q "\"Name\": *\"$1\""; }
existuje_skupina() { $M365 spo group get --webUrl "$WEB" --name "$1" --output json >/dev/null 2>&1; }

for u in "$UZAD|$RZAD" "$USCHV|$RSCHV"; do n=${u%%|*}; r=${u#*|}
  if [ $ANO = 1 ] && existuje_uroven "$n"; then echo "= úroveň $n už existuje"; else run spo roledefinition add --webUrl "$WEB" --name "$n" --rights "$r"; fi
done
for g in "$GZ|$ZAD" "$GS|$SCHV" "$GP|$SPR"; do n=${g%%|*}; m=${g#*|}
  if [ $ANO = 1 ] && existuje_skupina "$n"; then echo "= skupina $n už existuje"; else run spo group add --webUrl "$WEB" --name "$n"; fi
  [ -n "$m" ] && run spo group member add --webUrl "$WEB" --groupName "$n" --userNames "$m"
  run spo web roleassignment add --webUrl "$WEB" --groupName "$n" --roleDefinitionName "Čtení"
done
if [ $ANO = 1 ]; then OWN=$($M365 spo web get --url "$WEB" --withGroups --output json | python3 -c "import json,sys;print(json.load(sys.stdin)['AssociatedOwnerGroup']['Title'])"); else OWN="<Vlastníci webu>"; fi
run spo list roleinheritance break --webUrl "$WEB" --listTitle "$SEZNAM" --clearExistingPermissions --force
run spo list roleassignment add --webUrl "$WEB" --listTitle "$SEZNAM" --groupName "$OWN" --roleDefinitionName "Úplné řízení"
run spo list roleassignment add --webUrl "$WEB" --listTitle "$SEZNAM" --groupName "$GZ" --roleDefinitionName "$UZAD"
run spo list roleassignment add --webUrl "$WEB" --listTitle "$SEZNAM" --groupName "$GS" --roleDefinitionName "$USCHV"
run spo list roleassignment add --webUrl "$WEB" --listTitle "$SEZNAM" --groupName "$GP" --roleDefinitionName "Úplné řízení"
run spo list set --webUrl "$WEB" --title "$SEZNAM" --readSecurity 2 --writeSecurity 2
if [ $ANO = 1 ]; then
  echo "Kontrola:"; $M365 spo list get --webUrl "$WEB" --title "$SEZNAM" --properties "ReadSecurity,WriteSecurity,HasUniqueRoleAssignments" --output json
else echo "(plán; spusť s --ano)"; fi
