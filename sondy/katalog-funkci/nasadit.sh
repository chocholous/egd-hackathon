#!/usr/bin/env bash
# Katalog funkcí EG.D: komunikační web s katalogem aplikací, nasazení hotových .sppkg ze sond (beze změny),
# stránky po oblastech s textem „Co se děje na pozadí“ a rozcestník. Vše jako pavel.admin přes tools/lab-m365.sh.
set -euo pipefail
ROOT=$(cd "$(dirname "$0")/../.." && pwd)
DIR="$ROOT/sondy/katalog-funkci"
if [ "${1:-}" = "--help" ] || [ $# -lt 1 ]; then cat <<'U'
Použití: sondy/katalog-funkci/nasadit.sh <krok> [--ano]
  kroky:  vse       web + balicky + seznamy + stranky + vzhled (obnova po rozbití: vlastníci můžou stránky i seznamy měnit)
          web       založí komunikační web $WEB (lcid 1029) s katalogem aplikací webu, přidá členy $CLENOVE
                    a vlastníky $VLASTNICI (skupina Vlastníci webu)
          balicky   nahraje a nasadí všechny .sppkg z balicky.tsv do katalogu WEBU a nainstaluje je
          seznamy   založí seznamy, které web party potřebují (seznamy.sh)
          stranky   založí / přepíše stránky z stranky/*.json (text + web part) a rozcestník
          vzhled    téma EG.D z tokenů _znacka.scss jen na tento web + záhlaví v barvě akce (stylovat.py)
          stav      jen čtení: katalog webu, instalace, stránky
  Bez --ano jen vypíše plán (rc 10).
  Proměnné: WEB (výchozí https://pavelchocholousgmail.sharepoint.com/sites/egd-ukazky),
            CLENOVE (výchozí "egd09 egd10"), VLASTNICI (výchozí egd01 … egd10), DOMENA (výchozí pavelchocholousgmail.onmicrosoft.com)
U
exit 0; fi
KROK=$1; ANO=${2:-}
WEB=${WEB:-https://pavelchocholousgmail.sharepoint.com/sites/egd-ukazky}
CLENOVE=${CLENOVE:-"egd09 egd10"}
# Pavel 24. 11.: web smí upravovat všichni účastníci → egd01–egd10 jsou vlastníci (užší než „všichni v tenantu“).
VLASTNICI=${VLASTNICI:-"egd01 egd02 egd03 egd04 egd05 egd06 egd07 egd08 egd09 egd10"}
DOMENA=${DOMENA:-pavelchocholousgmail.onmicrosoft.com}
m() { "$ROOT/tools/lab-m365.sh" "$@"; }
plan() { echo "PLÁN: $*"; }
run() { if [ "$ANO" = "--ano" ]; then echo "+ $*"; "$@"; else plan "$@"; fi; }

case "$KROK" in
web)
  if m spo site get --url "$WEB" -o json 2>/dev/null | jq -e .Url >/dev/null 2>&1; then echo "web existuje: $WEB"
  else run m spo site add --type CommunicationSite --url "$WEB" --title "Katalog funkcí EG.D" --lcid 1029 --siteDesign Blank \
         --description "Ukázky funkcí ověřených v labu: každá karta = jedna funkce" --withAppCatalog; fi
  # Nové weby mají pásmo (UTC-08:00) Tichomoří USA → datum zapsané jako půlnoc UTC se zobrazí o den dřív (README, Past 8)
  if [ "$ANO" = "--ano" ]; then M365="$ROOT/tools/lab-m365.sh" "$ROOT/tools/spo-web-pasmo.sh" "$WEB" 6 --ano
  else plan "časové pásmo webu → 6 (Praha) přes tools/spo-web-pasmo.sh"; fi
  if m spo site appcatalog list -o json | jq -e --arg u "${WEB,,}" 'any(.[]; (.AbsoluteUrl|ascii_downcase)==$u)' >/dev/null 2>&1; then
    echo "katalog webu existuje"
  else run m spo site appcatalog add --siteUrl "$WEB"; fi
  if [ "$ANO" = "--ano" ]; then
    gid=$(m spo group list --webUrl "$WEB" --associatedGroupsOnly -o json | jq -r .AssociatedMemberGroup.Id)
    upns=$(for u in $CLENOVE; do printf '%s@%s,' "$u" "$DOMENA"; done); upns=${upns%,}
    m spo group member add --webUrl "$WEB" --groupId "$gid" --userNames "$upns" -o none || echo "členové už jsou?"
  else plan "členové $CLENOVE do skupiny Členové webu"; fi
  if [ "$ANO" = "--ano" ]; then
    oid=$(m spo group list --webUrl "$WEB" --associatedGroupsOnly -o json | jq -r .AssociatedOwnerGroup.Id)
    upns=$(for u in $VLASTNICI; do printf '%s@%s,' "$u" "$DOMENA"; done); upns=${upns%,}
    m spo group member add --webUrl "$WEB" --groupId "$oid" --userNames "$upns" -o none || echo "vlastníci už jsou?"
  else plan "vlastníci $VLASTNICI do skupiny Vlastníci webu"; fi ;;
vse)
  for k in web balicky seznamy stranky vzhled; do "$0" "$k" "$ANO" || [ $? = 10 ]; done ;;
balicky)
  while IFS=$'\t' read -r karta pkg; do
    [[ -z "$karta" || "$karta" == \#* ]] && continue
    f="$ROOT/$pkg"; n=$(basename "$pkg")
    id=$(python3 "$DIR/sppkg-info.py" "$f" --json | jq -r '.[0].solutionId')
    # V katalogu webu se balíček pozná podle ProductId (názvy souborů se opakují: prvni-appka.sppkg).
    cil="$karta-$n"
    echo "== $karta: $pkg (solution $id) → $cil"
    if [ "$ANO" = "--ano" ]; then
      tmp=$(mktemp -d); cp "$f" "$tmp/$cil"
      appid=$(m spo app add --filePath "$tmp/$cil" --appCatalogScope sitecollection --appCatalogUrl "$WEB" --overwrite -o json | jq -r .UniqueId)
      m spo app deploy --id "$appid" --appCatalogScope sitecollection --appCatalogUrl "$WEB"
      if m spo app instance list --siteUrl "$WEB" -o json | jq -e --arg p "$id" 'any(.[]; (.ProductId|ascii_downcase)==($p|ascii_downcase))' >/dev/null; then
        m spo app upgrade --id "$appid" --siteUrl "$WEB" --appCatalogScope sitecollection || true
      else m spo app install --id "$appid" --siteUrl "$WEB" --appCatalogScope sitecollection; fi
      echo "   app $appid nasazena a nainstalována"
    else plan "spo app add/deploy/install $cil (sitecollection, $WEB)"; fi
  done < "$DIR/balicky.tsv" ;;
seznamy)
  if [ "$ANO" = "--ano" ]; then WEB="$WEB" bash "$DIR/seznamy.sh"; else plan "WEB=$WEB bash $DIR/seznamy.sh"; fi ;;
stranky)
  if [ "$ANO" = "--ano" ]; then WEB="$WEB" python3 "$DIR/stranky.py" --ano; else WEB="$WEB" python3 "$DIR/stranky.py"; fi ;;
vzhled)
  if [ "$ANO" = "--ano" ]; then WEB="$WEB" python3 "$DIR/stylovat.py" --ano; else WEB="$WEB" python3 "$DIR/stylovat.py" || [ $? = 10 ]; fi ;;
stav)
  echo "== katalog webu"; m spo app list --appCatalogScope sitecollection --appCatalogUrl "$WEB" -o json | jq -r '.[] | [.Title, .Deployed, .InstalledVersion, .AppCatalogVersion] | @tsv'
  echo "== stránky"; m spo page list --webUrl "$WEB" -o json | jq -r '.[] | .Name // .Title' ;;
*) echo "neznámý krok $KROK" >&2; exit 2 ;;
esac
[ "$ANO" = "--ano" ] || [ "$KROK" = stav ] || exit 10
