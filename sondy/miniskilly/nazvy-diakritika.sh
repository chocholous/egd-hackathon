#!/usr/bin/env bash
# Sonda: co udělá diakritika a mezera v názvu seznamu a sloupce (lab, web egd-sonda-miniskilly).
# Použití: sondy/miniskilly/nazvy-diakritika.sh [web-url]  > nazvy-diakritika.out
# Založí 2 testovací seznamy, změří interní názvy / URL / REST dotaz, pak je přesune do koše webu (--recycle).
set -u
cd "$(dirname "$0")/../.."
W="${1:-https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-miniskilly}"
M=tools/lab-m365.sh
krok() { echo; echo "## $*"; }

krok "A: seznam 'Test Žádosti o volno', sloupec DisplayName 'Komentář schvalovatele'"
$M spo list add --webUrl "$W" --title "Test Žádosti o volno" --baseTemplate GenericList --output json | jq -c '{Title, Id}'
$M spo list get --webUrl "$W" --title "Test Žádosti o volno" --properties "Title,RootFolder/ServerRelativeUrl" --output json | jq -c '{Title, url: .RootFolder.ServerRelativeUrl}'
$M spo field add --webUrl "$W" --listTitle "Test Žádosti o volno" --xml '<Field Type="Text" DisplayName="Komentář schvalovatele" />' --output json | jq -c '{Title, InternalName, StaticName}'
echo "REST \$select=Komentar:"
$M request --url "$W/_api/web/lists/getbytitle('Test%20%C5%BD%C3%A1dosti%20o%20volno')/items?\$select=Komentar" 2>&1 | head -c 300; echo

krok "B: seznam 'TestZadosti', sloupec DisplayName 'Komentar', pak Title 'Komentář schvalovatele'"
$M spo list add --webUrl "$W" --title "TestZadosti" --baseTemplate GenericList --output json | jq -c '{Title, Id}'
$M spo list get --webUrl "$W" --title "TestZadosti" --properties "Title,RootFolder/ServerRelativeUrl" --output json | jq -c '{Title, url: .RootFolder.ServerRelativeUrl}'
$M spo field add --webUrl "$W" --listTitle "TestZadosti" --xml '<Field Type="Text" DisplayName="Komentar" />' --output json | jq -c '{Title, InternalName}'
$M spo field set --webUrl "$W" --listTitle "TestZadosti" --internalName Komentar --Title "Komentář schvalovatele"
$M spo field get --webUrl "$W" --listTitle "TestZadosti" --internalName Komentar --output json | jq -c '{Title, InternalName}'
$M spo listitem add --webUrl "$W" --listTitle "TestZadosti" --Title "pokus" --Komentar "ahoj" --output json | jq -c '{Id}'
echo "REST \$select=Komentar:"
$M request --url "$W/_api/web/lists/getbytitle('TestZadosti')/items?\$select=Title,Komentar" 2>&1 | head -c 300; echo

krok "Úklid: oba seznamy do koše webu"
$M spo list remove --webUrl "$W" --title "Test Žádosti o volno" --recycle --force && echo "A v koši"
$M spo list remove --webUrl "$W" --title "TestZadosti" --recycle --force && echo "B v koši"
