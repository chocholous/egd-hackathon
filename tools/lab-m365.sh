#!/usr/bin/env bash
# lab-m365.sh — m365 CLI v11 na sdílené přihlášení labu (HOME=~/.m365-osobni), se zálohou tokenu.
#
# Proč (23. 11. 2026): test CLI 12 spuštěný nad sdíleným ~/.m365-osobni smazal v11 cache
# .cli-m365-msal.json (refresh token) a Pavel se musel znovu přihlašovat. CLI 12 drží tokeny
# v keychainu a soubor v11 při startu maže. Tenhle wrapper:
#   1. pouští jen globální `m365` v11 (ten má zámek a atomický zápis cache, viz ~/Projects/m365-cli),
#   2. když cache chybí nebo je rozbitá a existuje platná záloha, obnoví ji (a řekne to na stderr),
#   3. po úspěšném běhu uloží platnou cache do zálohy,
#   4. odmítne běžet, když v HOME najde stopu CLI 12 (Library/Keychains).
# CLI 12 a lokální instalace z node_modules patří do vlastního HOME, nikdy do ~/.m365-osobni.
set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  cat <<'EOF'
Použití: tools/lab-m365.sh <argumenty m365>        např. tools/lab-m365.sh spo web get --url …
         tools/lab-m365.sh --stav                   zdraví přihlášení bez volání sítě

Spustí globální m365 v11 s HOME=~/.m365-osobni (lab tenant). Před během obnoví ztracenou
token cache ze zálohy, po úspěšném běhu zálohu aktualizuje. Odmítne CLI jiné verze než 11
a HOME se stopou CLI 12. Přihlášení dělá jen Pavel: tools/lab-m365.sh login --authType deviceCode …
EOF
  exit 0
fi

LAB_HOME="$HOME/.m365-osobni"
CACHE="$LAB_HOME/.cli-m365-msal.json"
ZALOHA="$LAB_HOME/.cli-m365-msal.json.zaloha"

platna() { # platná v11 cache = JSON s aspoň jedním refresh tokenem
  [[ -s "$1" ]] && jq -e '(.RefreshToken // {}) | length > 0' "$1" >/dev/null 2>&1
}

if [[ -e "$LAB_HOME/Library/Keychains" ]]; then
  echo "lab-m365: v $LAB_HOME je Library/Keychains = stopa CLI 12. CLI 12 do sdíleného HOME nepatří;" >&2
  echo "          přesuň ten symlink pryč (mv, ne trash) a CLI 12 spouštěj s vlastním HOME." >&2
  exit 3
fi

M365_BIN="$(type -P m365)"
VERZE="$(HOME="$LAB_HOME" "$M365_BIN" version --output text | tr -d 'v[:space:]' || true)"
if [[ "${VERZE%%.*}" != "11" ]]; then
  echo "lab-m365: globální m365 je verze '${VERZE:-?}', čekám 11.x. Sdílené přihlášení labu je jen pro v11." >&2
  exit 3
fi

if ! platna "$CACHE" && platna "$ZALOHA"; then
  cp -p "$ZALOHA" "$CACHE.obnova.$$" && mv -f "$CACHE.obnova.$$" "$CACHE"
  echo "lab-m365: token cache chyběla nebo byla rozbitá — obnovena ze zálohy ($(stat -f %Sm "$ZALOHA"))." >&2
fi

if [[ "${1:-}" == "--stav" ]]; then
  if platna "$CACHE"; then echo "cache: OK ($(stat -f %Sm "$CACHE"))"; else echo "cache: CHYBÍ refresh token → Pavel: login"; fi
  if platna "$ZALOHA"; then echo "záloha: OK ($(stat -f %Sm "$ZALOHA"))"; else echo "záloha: žádná"; fi
  jq -r '"spojení: \(.identityName // "?") / tenant \(.identityTenantId // "?") / appId \(.appId // "?")"' \
    "$LAB_HOME/.cli-m365-connection.json" 2>/dev/null || echo "spojení: žádné"
  platna "$CACHE"; exit $?
fi

set +e
HOME="$LAB_HOME" "$M365_BIN" "$@"
rc=$?
set -e

if [[ $rc -eq 0 ]] && platna "$CACHE"; then
  cp -p "$CACHE" "$ZALOHA.$$" && chmod 600 "$ZALOHA.$$" && mv -f "$ZALOHA.$$" "$ZALOHA"
fi
exit $rc
