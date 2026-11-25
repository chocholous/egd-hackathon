#!/usr/bin/env bash
# okno.sh - otevre VIDITELNY Chrome s cistym profilem ~/.config/ppf-rooms-lab/profily/<profil> a zapne
# CDP na nahodnem volnem portu (--remote-debugging-port=0; port Chrome zapise do <profil>/DevToolsActivePort).
# Okno patri cloveku (prihlaseni dela Pavel), agent se k nemu pripoji pres sondy/e2e/cdp.mjs.
# Pouziti: sondy/e2e/okno.sh <profil> [url]
set -euo pipefail
if [[ $# -lt 1 || "$1" == "--help" || "$1" == "-h" ]]; then
  sed -n '2,6p' "$0"; exit 2
fi
PROFIL_DIR="$HOME/.config/ppf-rooms-lab/profily/$1"
URL="${2:-about:blank}"
mkdir -p "$PROFIL_DIR"
nohup "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --user-data-dir="$PROFIL_DIR" --remote-debugging-port=0 --no-first-run --no-default-browser-check \
  "$URL" >"$PROFIL_DIR/../$1.chrome.log" 2>&1 &
echo "pid $! profil $PROFIL_DIR"
