#!/usr/bin/env bash
# Vyrobí veřejnou kopii pracovního repa (HEAD) bez citlivých souborů a nahraje ji do veřejného GitHub repa.
set -euo pipefail
usage() { cat <<'U'
Použití: tools/verejne-repo.sh --repo VLASTNIK/JMENO --pracovni ADRESAR [--ano]

Z HEAD pracovního repa udělá kopii bez historie a bez:
  zdroje/  (výtahy z pošty a účtů), písem E.ON (*EON*.woff/ttf/otf), audit/hoste-*.json
Šablony SPFx s @font-face na E.ON Head přepne na src: local(...), aby šly sestavit bez písma.
README.md → README-podklady.md, verejne/README.md → README.md, verejne/index.html → docs/index.html.

  --repo       cílové veřejné repo (musí existovat, např. vytvořené: gh repo create X --public)
  --pracovni   prázdný nebo dřívější klon cílového repa (sem se klonuje a skládá kopie)
  --ano        commitne a pushne; bez něj jen složí kopii a vypíše, co by se změnilo
Kontroly: žádné písmo E.ON, žádné zdroje/, gitleaks bez nálezů (jinak konec bez pushe).
U
}
REPO=""; DIR=""; ANO=0
while [[ $# -gt 0 ]]; do case "$1" in
  --repo) REPO="$2"; shift 2;; --pracovni) DIR="$2"; shift 2;; --ano) ANO=1; shift;;
  -h|--help) usage; exit 0;; *) usage; exit 2;; esac; done
[[ -n "$REPO" && -n "$DIR" ]] || { usage; exit 2; }
ZDROJ="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -d "$DIR/.git" ]]; then gh repo clone "$REPO" "$DIR"; fi
git -C "$DIR" pull -q --ff-only 2>/dev/null || true

TMP="$(mktemp -d)"
git -C "$ZDROJ" archive HEAD | tar -x -C "$TMP"
/usr/bin/trash "$TMP/zdroje"
fd -H -I -t f -i 'eon.*\.(woff2?|ttf|otf)$' "$TMP" -X /usr/bin/trash
fd -H -I -t f '^hoste-.*\.json$' "$TMP/audit" -X /usr/bin/trash 2>/dev/null || true
rg -l --no-messages "url\('\./assets/EONScreen-Head\.woff'\)" "$TMP" | while read -r f; do
  sed -i '' "s#local('E.ON Head')#local('E.ON Head')#" "$f"; done
mv "$TMP/README.md" "$TMP/README-podklady.md"
cp "$TMP/verejne/README.md" "$TMP/README.md"
mkdir -p "$TMP/docs"; cp "$TMP/verejne/index.html" "$TMP/docs/index.html"; : > "$TMP/docs/.nojekyll"

# kontroly
if fd -H -I -t f -i 'eon.*\.(woff2?|ttf|otf)$' "$TMP" | rg -q .; then echo "CHYBA: v kopii zůstalo písmo E.ON" >&2; exit 1; fi
[[ ! -e "$TMP/zdroje" ]] || { echo "CHYBA: zdroje/ v kopii" >&2; exit 1; }
# gitleaks: povolené jsou jen GUID (appId, tenant) a klíče telemetrie Microsoftu (events.data.microsoft.com)
GL="$(mktemp)"
gitleaks dir "$TMP" --no-banner --report-format json --report-path "$GL" >/dev/null 2>&1 || true
ZBYVA=0
while IFS=$'\t' read -r f s; do
  [[ -z "$f" ]] && continue
  if [[ "$s" =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]]; then continue; fi
  if rg -F -- "$s" "$f" | rg -q 'events\.data\.microsoft\.com'; then continue; fi
  echo "NÁLEZ: ${f#$TMP/}" >&2; ZBYVA=$((ZBYVA+1))
done < <(jq -r '.[] | "\(.File)\t\(.Secret)"' "$GL")
/usr/bin/trash "$GL"
[[ $ZBYVA -eq 0 ]] || { echo "CHYBA: gitleaks má $ZBYVA nálezů mimo povolené vzory" >&2; exit 1; }

rsync -a --delete --exclude '.git' "$TMP/" "$DIR/"
/usr/bin/trash "$TMP"
git -C "$DIR" add -A
git -C "$DIR" status --short | tail -5
echo "změněných souborů: $(git -C "$DIR" status --short | wc -l | tr -d ' ')"
if [[ $ANO -eq 1 ]]; then
  git -C "$DIR" diff --cached --quiet || git -C "$DIR" commit -q -m "Veřejná kopie z egd-workshop $(git -C "$ZDROJ" rev-parse --short HEAD)"
  git -C "$DIR" push -q origin HEAD:main
  echo "nahráno do $REPO"
fi
