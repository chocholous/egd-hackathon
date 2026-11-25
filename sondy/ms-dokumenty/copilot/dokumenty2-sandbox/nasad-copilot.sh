#!/usr/bin/env bash
# Nasadí appku Copilota na EN web sondy přes tools/lab-m365.sh (seznam, katalog, instalace, stránka).
set -u
cd ~/Projects/egd-workshop
M=tools/lab-m365.sh
W=https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-dokumenty-en
SB=$(cat sondy/ms-dokumenty/copilot/sandbox2.txt)
PKG=$SB/home/egd-workshop/spokojenost/sharepoint/solution/spokojenost.sppkg
WP=6cb71949-befa-4069-a54c-93cbcbbf3fa3
PAGE=spokojenost-copilot.aspx

$M spo list add --webUrl $W --title Spokojenost --baseTemplate GenericList --onQuickLaunch true --output json | jq -r '"seznam: \(.Title)"'; echo "list rc=${PIPESTATUS[0]}"
$M spo field add --webUrl $W --listTitle Spokojenost --xml '<Field Type="Number" DisplayName="Hodnocení" Name="Hodnoceni" StaticName="Hodnoceni" Min="1" Max="5" Decimals="0" Required="TRUE" />' --options AddFieldInternalNameHint,AddFieldToDefaultView --output json | jq -r '"sloupec: \(.InternalName)"'
$M spo field add --webUrl $W --listTitle Spokojenost --xml '<Field Type="Text" DisplayName="Den" Name="Den" StaticName="Den" MaxLength="10" Required="TRUE" />' --options AddFieldInternalNameHint,AddFieldToDefaultView --output json | jq -r '"sloupec: \(.InternalName)"'

ID=$($M spo app add --filePath "$PKG" --appCatalogScope sitecollection --appCatalogUrl $W --overwrite --output json | jq -r .UniqueId)
echo "appId=$ID"
$M spo app deploy --id $ID --appCatalogScope sitecollection --appCatalogUrl $W; echo "deploy rc=$?"
$M spo app install --id $ID --siteUrl $W --appCatalogScope sitecollection; echo "install rc=$?"

$M spo page add --webUrl $W --name $PAGE --title "Spokojenost (Copilot)" --layoutType Article --output json >/dev/null; echo "page rc=$?"
$M spo page section add --webUrl $W --pageName $PAGE --sectionTemplate OneColumn --order 1; echo "section rc=$?"
for i in 1 2 3 4 5 6 7 8 9 10; do
  if $M spo page clientsidewebpart add --webUrl $W --pageName $PAGE --webPartId $WP --section 1 --column 1 \
       --webPartProperties '{"nadpis":"Spokojenost (Copilot)","seznam":"Spokojenost"}'; then echo "webpart ok (pokus $i)"; break; fi
  echo "webpart pokus $i selhal, čekám 30 s"; sleep 30
done
$M spo page set --webUrl $W --name $PAGE --layoutType SingleWebPartAppPage --publish; echo "set rc=$?"
$M spo page get --webUrl $W --name $PAGE --output json | jq -r '"stránka: \(.layoutType // .PageLayoutType) wp=\(tostring | ascii_downcase | contains("'$WP'"))"'
