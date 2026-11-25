#!/usr/bin/env bash
# Nasadí appku Úprava dokumentů na web sondy přes tools/lab-m365.sh (katalog webu, instalace, stránka uprava.aspx).
set -u
cd ~/Projects/egd-workshop
M=tools/lab-m365.sh
W=https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-dokumenty
PKG=sondy/dokumenty/uprava/appka-uprava/sharepoint/solution/egd-uprava-dokumentu.sppkg
WP=06c70ffb-41d3-4ba2-8ab2-bc612a68e48c
PAGE=uprava.aspx
ID=$($M spo app add --filePath "$PKG" --appCatalogScope sitecollection --appCatalogUrl $W --overwrite --output json | jq -r .UniqueId)
echo "appId=$ID"
$M spo app deploy --id $ID --appCatalogScope sitecollection --appCatalogUrl $W; echo "deploy rc=$?"
if [ "${1:-}" != "--upgrade" ]; then
  $M spo app install --id $ID --siteUrl $W --appCatalogScope sitecollection; echo "install rc=$?"
  $M spo page add --webUrl $W --name $PAGE --title "Úprava dokumentů" --layoutType Article --output json >/dev/null; echo "page rc=$?"
  $M spo page section add --webUrl $W --pageName $PAGE --sectionTemplate OneColumn --order 1; echo "section rc=$?"
  for i in 1 2 3 4 5 6 7 8 9 10; do
    if $M spo page clientsidewebpart add --webUrl $W --pageName $PAGE --webPartId $WP --section 1 --column 1 \
         --webPartProperties '{"slozka":"Sdilene dokumenty/uprava"}'; then echo "webpart ok (pokus $i)"; break; fi
    echo "webpart pokus $i selhal, čekám 30 s"; sleep 30
  done
  $M spo page set --webUrl $W --name $PAGE --publish; echo "set rc=$?"
else
  $M spo app upgrade --id $ID --siteUrl $W --appCatalogScope sitecollection; echo "upgrade rc=$?"
fi
