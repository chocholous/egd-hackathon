#!/usr/bin/env bash
# Nainstaluje skill pro GitHub Copilot CLI tam, kde ho Copilot hleda, a overi, ze ho vidi.
set -euo pipefail

usage() {
  cat <<'H'
copilot-skill-install.sh --skill <slozka-skillu> [--copilot-home DIR | --project DIR] [--copilot BIN]

Zkopiruje slozku skillu (obsahuje SKILL.md) a pak overi pres `copilot skill list`.
  --skill DIR         slozka skillu (povinne), napr. skills/egd-pripravenost
  --copilot-home DIR  osobni umisteni: DIR/skills/<jmeno>   (vychozi: $COPILOT_HOME, jinak ~/.copilot)
  --project DIR       projektove umisteni: DIR/.github/skills/<jmeno>  (misto osobniho)
  --copilot BIN       binarka Copilot CLI (vychozi: copilot)
  --home DIR          HOME pro overovaci `copilot skill list` (izolovany ucastnik; vychozi aktualni)
Navratovy kod: 0 skill je v seznamu Copilota, 1 neni, 2 spatne pouziti.
H
}

SKILL="" CH="" PROJ="" BIN="copilot" HOME_OVR=""
while [ $# -gt 0 ]; do
  case "$1" in
    --skill) SKILL="$2"; shift 2;;
    --copilot-home) CH="$2"; shift 2;;
    --project) PROJ="$2"; shift 2;;
    --copilot) BIN="$2"; shift 2;;
    --home) HOME_OVR="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "neznama volba: $1" >&2; usage >&2; exit 2;;
  esac
done
[ -n "$SKILL" ] && [ -f "$SKILL/SKILL.md" ] || { echo "chybi --skill se SKILL.md" >&2; exit 2; }
NAME="$(sed -n 's/^name:[[:space:]]*//p' "$SKILL/SKILL.md" | head -1)"
[ -n "$NAME" ] || { echo "SKILL.md nema name:" >&2; exit 2; }

if [ -n "$PROJ" ]; then
  DEST="$PROJ/.github/skills/$NAME"; CWD="$PROJ"
else
  CH="${CH:-${COPILOT_HOME:-$HOME/.copilot}}"
  DEST="$CH/skills/$NAME"; CWD="$PWD"
fi
mkdir -p "$(dirname "$DEST")"
[ -e "$DEST" ] && /usr/bin/trash "$DEST"
cp -R "$SKILL" "$DEST"
echo "nainstalovano: $DEST"

ENVS=()
[ -n "$HOME_OVR" ] && ENVS+=("HOME=$HOME_OVR")
[ -z "$PROJ" ] && ENVS+=("COPILOT_HOME=$CH")
OUT="$(cd "$CWD" && env ${ENVS[@]+"${ENVS[@]}"} "$BIN" skill list 2>&1)" || true
if printf '%s\n' "$OUT" | grep -q "^[[:space:]]*${NAME}[[:space:]]*-"; then
  echo "OK: Copilot skill '$NAME' vidi"; printf '%s\n' "$OUT" | grep -n "$NAME" | cut -c1-160
else
  echo "CHYBA: skill '$NAME' v \`copilot skill list\` neni" >&2; printf '%s\n' "$OUT" | tail -15 >&2; exit 1
fi
