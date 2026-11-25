#!/usr/bin/env bash
# Seznamy a soubory, které potřebují web party Katalogu funkcí. Schémata jsou zkopírovaná z původních webů sond
# (spo field list, 24. 11.): Pozadavky (egd-sonda-miniskilly), Spokojenost (egd-sonda-ms-dokumenty), Revize (egd-sonda-dokumenty).
# Idempotentní: co existuje, přeskočí. Spouští nasadit.sh seznamy --ano.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
[ "${1:-}" = "--help" ] && { sed -n 2,4p "$0"; exit 0; }
WEB=${WEB:?nastav WEB}
DOMENA=${DOMENA:-pavelchocholousgmail.onmicrosoft.com}
ZADAVATEL=${ZADAVATEL:-egd09@$DOMENA}; SCHVALOVATEL=${SCHVALOVATEL:-egd10@$DOMENA}
SP=https://pavelchocholousgmail.sharepoint.com
m() { "$ROOT/tools/lab-m365.sh" "$@"; }
TMP=$(mktemp -d)
ma_seznam() { m spo list get --webUrl "$WEB" --title "$1" -o json >/dev/null 2>&1; }
ma_pole() { m spo field get --webUrl "$WEB" --listTitle "$1" --internalName "$2" -o json >/dev/null 2>&1; }
# Past (✅ 24. 11.): AddFieldAsXml odvodí interní název z DisplayName, s diakritikou vznikne Koment_x00e1__x0159_….
# Proto se sloupec zakládá s DisplayName = interní název (ASCII) a zobrazovaný název se nastaví až potom (4. parametr).
pole() { # seznam internalName xml [zobrazovaný název]
  if ma_pole "$1" "$2"; then echo "= $1.$2 existuje"
  else m spo field add --webUrl "$WEB" --listTitle "$1" --xml "$(sed -E "s/DisplayName=\"[^\"]*\"/DisplayName=\"$2\"/" <<<"$3")" -o none; echo "+ $1.$2"; fi
  if [ -n "${4:-}" ]; then m spo field set --webUrl "$WEB" --listTitle "$1" --internalName "$2" --Title "$4" >/dev/null; fi; }
seznam() { if ma_seznam "$1"; then echo "= seznam $1 existuje"; else m spo list add --webUrl "$WEB" --title "$1" --baseTemplate GenericList -o none; echo "+ seznam $1"; fi; }

# --- Pozadavky: Evidence požadavků (karty data-etag, mail, ai-llm, dok-evidence)
seznam Pozadavky
m spo field set --webUrl "$WEB" --listTitle Pozadavky --internalName Title --Title "Požadavek" >/dev/null
pole Pozadavky Popis '<Field Type="Note" Name="Popis" StaticName="Popis" DisplayName="Popis" NumLines="6" RichText="FALSE" />'
pole Pozadavky Stav '<Field Type="Choice" Name="Stav" StaticName="Stav" DisplayName="Stav" Format="Dropdown"><Default>Nový</Default><CHOICES><CHOICE>Nový</CHOICE><CHOICE>Schváleno</CHOICE><CHOICE>Zamítnuto</CHOICE></CHOICES></Field>'
pole Pozadavky Komentar '<Field Type="Note" Name="Komentar" StaticName="Komentar" DisplayName="Komentar" NumLines="6" RichText="FALSE" />' "Komentář schvalovatele"
# Schvalovat v etag-appce smí, kdo má ApproveItems (0x10). Účastníci jsou Členové (Přispívání, bez 0x10),
# proto na seznamu Pozadavky dostanou úroveň „Návrh“ (viz README, karta Data).
if [ "$(m spo list get --webUrl "$WEB" --title Pozadavky --properties HasUniqueRoleAssignments -o json | jq -r .HasUniqueRoleAssignments)" != true ]; then
  m spo list roleinheritance break --webUrl "$WEB" --listTitle Pozadavky --force -o none; echo "+ Pozadavky: vlastní práva (kopie zděděných)"; fi
UROVEN="Návrh"   # vestavěná úroveň Návrh má ApproveItems (0x10), BasePermissions.Low 1012866047 ověřeno 24. 11.
for u in "$ZADAVATEL" "$SCHVALOVATEL"; do
  m spo list roleassignment add --webUrl "$WEB" --listTitle Pozadavky --upn "$u" --roleDefinitionName "$UROVEN" -o none; echo "+ Pozadavky: $u → $UROVEN"; done
# ukázková data (3 položky, jen když je seznam prázdný)
if [ "$(m spo listitem list --webUrl "$WEB" --listTitle Pozadavky --fields Id -o json | jq length)" = 0 ]; then
  m spo listitem add --webUrl "$WEB" --listTitle Pozadavky --Title "Nový notebook pro technika" --Popis "Technik v terénu potřebuje odolný notebook s LTE, protože stávající po třech letech nevydrží celou směnu na baterii a padá mu VPN." -o none
  m spo listitem add --webUrl "$WEB" --listTitle Pozadavky --Title "Školení BOZP pro nové kolegy" --Popis "Tři noví kolegové nastupují 1. 12., potřebují vstupní školení BOZP a práce ve výškách před prvním výjezdem." -o none
  m spo listitem add --webUrl "$WEB" --listTitle Pozadavky --Title "Oprava klimatizace v dispečinku" --Popis "Klimatizace v dispečinku Brno hlásí chybu E4, v místnosti je přes 28 °C." -o none
  echo "+ Pozadavky: 3 ukázkové položky"; fi

# --- PozadavkyPrava: Evidence s rolemi (karta prava-role), práva nastaví tools/prava-role-cli.sh
seznam PozadavkyPrava
m spo field set --webUrl "$WEB" --listTitle PozadavkyPrava --internalName Title --Title "Požadavek" >/dev/null
pole PozadavkyPrava Popis '<Field Type="Note" Name="Popis" StaticName="Popis" DisplayName="Popis" NumLines="6" RichText="FALSE" />'
pole PozadavkyPrava Stav '<Field Type="Choice" Name="Stav" StaticName="Stav" DisplayName="Stav" Format="Dropdown"><Default>Nový</Default><CHOICES><CHOICE>Nový</CHOICE><CHOICE>Schváleno</CHOICE><CHOICE>Zamítnuto</CHOICE></CHOICES></Field>'
pole PozadavkyPrava Komentar '<Field Type="Note" Name="Komentar" StaticName="Komentar" DisplayName="Komentar" NumLines="6" RichText="FALSE" />' "Komentář schvalovatele"
if [ "$(m spo list get --webUrl "$WEB" --title PozadavkyPrava --properties HasUniqueRoleAssignments -o json | jq -r .HasUniqueRoleAssignments)" != true ]; then
  M365="$ROOT/tools/lab-m365.sh" bash "$ROOT/tools/prava-role-cli.sh" --web "$WEB" --seznam PozadavkyPrava --appka "Katalog" \
    --zadavatele "$ZADAVATEL" --schvalovatele "$SCHVALOVATEL" --ano
else echo "= PozadavkyPrava: práva už nastavená"; fi
# Účastníci jsou vlastníci webu (Pavel 24. 11.). Skupina Vlastníci by na PozadavkyPrava měla Úplné řízení a appka
# by všem ukázala roli Správce. Proto ji ze seznamu odebereme; úplné řízení tam drží jen správce kolekce webu.
OWN_ID=$(m spo group list --webUrl "$WEB" --associatedGroupsOnly -o json | jq -r .AssociatedOwnerGroup.Id)
m spo list roleassignment remove --webUrl "$WEB" --listTitle PozadavkyPrava --principalId "$OWN_ID" --force -o none 2>/dev/null \
  && echo "- PozadavkyPrava: skupina Vlastníci odebrána" || echo "= PozadavkyPrava: Vlastníci na seznamu nejsou"

# --- Spokojenost (karty dok-spokojenost, ai-spokojenost)
seznam Spokojenost
pole Spokojenost Hodnoceni '<Field Type="Number" Name="Hodnoceni" StaticName="Hodnoceni" DisplayName="Hodnoceni" Min="1" Max="5" Decimals="0" />' "Hodnocení"
pole Spokojenost Den '<Field Type="Text" Name="Den" StaticName="Den" DisplayName="Den" MaxLength="10" />'

# --- Revize (karta dok-generator, natvrdo v kódu) + 5 položek z sondy/dokumenty/src/data.mjs
seznam Revize
pole Revize Technik '<Field Type="Text" Name="Technik" StaticName="Technik" DisplayName="Technik" />'
pole Revize Termin '<Field Type="DateTime" Name="Termin" StaticName="Termin" DisplayName="Termin" Format="DateOnly" />'
pole Revize Stav '<Field Type="Text" Name="Stav" StaticName="Stav" DisplayName="Stav" />'
pole Revize Naklad '<Field Type="Number" Name="Naklad" StaticName="Naklad" DisplayName="Naklad" />'
if [ "$(m spo listitem list --webUrl "$WEB" --listTitle Revize --fields Id -o json | jq length)" = 0 ]; then
  # SharePoint s lcid 1029 chce datum ve tvaru 23.02.2012 (ISO vrací „Zadejte datum takhle“)
  while IFS='|' read -r t te d s n; do
    m spo listitem add --webUrl "$WEB" --listTitle Revize --Title "$t" --Technik "$te" --Termin "$(IFS=- read -r y mo dd <<<"$d"; printf %02d.%02d.%s "$((10#$dd))" "$((10#$mo))" "$y")" --Stav "$s" --Naklad "$n" -o none
  done <<'R'
Trafostanice Říčany – věž|Jiří Dvořák|2026-12-03|Naplánováno|18500
Rozvaděč NN Žďár nad Sázavou|Ing. Zdeňka Čermáková|2026-12-10|Probíhá|42300
Vedení VN č. 214 – úsek Šumperk|Ondřej Řezníček|2027-01-14|Naplánováno|129900
Stanice Ústí – ochrana ESD|Šárka Nováková|2027-01-21|Dokončeno|7650
Přípojková skříň Česká Třebová|Ťuk Ďábelský|2027-02-02|Naplánováno|3200
R
  echo "+ Revize: 5 položek"; fi

# --- Soubory v knihovně Dokumenty: šablona a font zkopírované z původních webů
LIB=$(m spo list get --webUrl "$WEB" --title Dokumenty --properties RootFolder/ServerRelativeUrl -o json | jq -r .RootFolder.ServerRelativeUrl)
LIBREL=${LIB#/sites/*/}
stahni() { m spo file get --webUrl "$1" --url "$2" --asFile --path "$3" >/dev/null; }
stahni "$SP/sites/egd-sonda-dokumenty" "/sites/egd-sonda-dokumenty/Sdilene dokumenty/sonda/assets/sablona.docx" "$TMP/sablona.docx"
stahni "$SP/sites/egd-sonda-ms-dokumenty" "/sites/egd-sonda-ms-dokumenty/Sdilene dokumenty/assets/Roboto-Regular.ttf" "$TMP/Roboto-Regular.ttf"
for f in "sonda" "sonda/assets" "assets"; do
  m spo folder get --webUrl "$WEB" --url "$LIB/$f" -o json >/dev/null 2>&1 || { m spo folder add --webUrl "$WEB" --parentFolderUrl "$LIB/$(dirname "$f" | sed 's/^\.$//')" --name "$(basename "$f")" -o none; echo "+ složka $f"; }
done
m spo file add --webUrl "$WEB" --folder "$LIBREL/sonda/assets" --path "$TMP/sablona.docx" -o none
m spo file add --webUrl "$WEB" --folder "$LIBREL/sonda/assets" --path "$TMP/Roboto-Regular.ttf" -o none
m spo file add --webUrl "$WEB" --folder "$LIBREL/assets" --path "$TMP/Roboto-Regular.ttf" -o none
echo "+ šablona a font v $LIB/sonda/assets a $LIB/assets"
ls -la "$TMP"
