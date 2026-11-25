#!/usr/bin/env bash
# Spusti Copilot CLI neinteraktivne jako novy ucastnik: izolovany HOME, COPILOT_HOME a pracovni slozka.
set -euo pipefail

usage() {
  cat <<'H'
copilot-run.sh --prompt "<text>" [--skill DIR] [volby]

Vytvori izolovany "pocitac ucastnika" (HOME, COPILOT_HOME, pracovni slozka), nainstaluje skill
(copilot-skill-install.sh), spusti `copilot -p` a ulozi log a prepis.
  --prompt TEXT        co ucastnik rekne (povinne; nebo --prompt-file F)
  --skill DIR          slozka skillu k instalaci do <HOME>/.copilot/skills (muze byt vic, opakovat)
  --sandbox DIR        koren izolace (vychozi: nova slozka v ${TMPDIR:-/tmp}/copilot-ucastnik-<cas>)
                       HOME=<DIR>/home  COPILOT_HOME=<DIR>/home/.copilot  cwd=<DIR>/home/egd-workshop
  --token gh|env|none  prihlaseni Copilota: gh = `gh auth token` (github.com) -> COPILOT_GITHUB_TOKEN,
                       env = uz nastaveny COPILOT_GITHUB_TOKEN, none = nic. Vychozi gh.
                       Token se predava jen v prostredi a je v --secret-env-vars.
  --m365-from DIR      zkopiruje prihlaseni m365 CLI (.cli-m365-*.json) z DIR (napr. ~/.m365-osobni)
                       do izolovaneho HOME = ucastnik uz "udelal device code". Jen lab!
  --model M            model (vychozi: nechat Copilotu)
  --allow MODE         tools = --allow-all-tools --allow-all-paths (vychozi; -p se nema koho ptat, bez cest zamitne i skill v ~/.copilot), yolo = --yolo,
                       none = nic nepovoli
  --deny-tool RULE     pridat --deny-tool (opakovat), napr. 'shell(m365 login)'
  --timeout SEC        limit behu (vychozi 900)
  --copilot BIN        binarka (vychozi copilot)
  --extra "ARGS"       dalsi argumenty copilotu
Vystup v <sandbox>/vystup: log.txt (stdout+stderr), prepis.jsonl (--output-format json),
  prepis.md (--share), usage.json, prikaz.txt. Na konci vypise cestu a navratovy kod.
H
}

PROMPT="" PFILE="" SKILLS=() SB="" TOKEN="gh" M365="" MODEL="" ALLOW="tools" DENY=() TMO=900 BIN="copilot" EXTRA=""
while [ $# -gt 0 ]; do
  case "$1" in
    --prompt) PROMPT="$2"; shift 2;;
    --prompt-file) PFILE="$2"; shift 2;;
    --skill) SKILLS+=("$2"); shift 2;;
    --sandbox) SB="$2"; shift 2;;
    --token) TOKEN="$2"; shift 2;;
    --m365-from) M365="$2"; shift 2;;
    --model) MODEL="$2"; shift 2;;
    --allow) ALLOW="$2"; shift 2;;
    --deny-tool) DENY+=("$2"); shift 2;;
    --timeout) TMO="$2"; shift 2;;
    --copilot) BIN="$2"; shift 2;;
    --extra) EXTRA="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "neznama volba: $1" >&2; usage >&2; exit 2;;
  esac
done
[ -n "$PFILE" ] && PROMPT="$(cat "$PFILE")"
[ -n "$PROMPT" ] || { echo "chybi --prompt" >&2; usage >&2; exit 2; }

TOOLS_DIR="$(cd "$(dirname "$0")" && pwd)"
[ -n "$SB" ] || SB="$(mktemp -d "${TMPDIR:-/tmp}/copilot-ucastnik-XXXXXX")"
mkdir -p "$SB/home/.copilot" "$SB/home/egd-workshop" "$SB/vystup"
SB="$(cd "$SB" && pwd)"
H="$SB/home"; W="$H/egd-workshop"; O="$SB/vystup"

for s in ${SKILLS[@]+"${SKILLS[@]}"}; do
  "$TOOLS_DIR/copilot-skill-install.sh" --skill "$s" --copilot-home "$H/.copilot" --home "$H" --copilot "$BIN" | tee -a "$O/instalace.txt"
done
if [ -n "$M365" ]; then
  for f in "$M365"/.cli-m365-*.json; do [ -f "$f" ] && cp "$f" "$H/"; done
  echo "m365 prihlaseni zkopirovano z $M365"
fi

ENVV=(HOME="$H" COPILOT_HOME="$H/.copilot" NO_COLOR=1)
# prostredi Claude Code se nesmi dostat k ucastnikovi (skript podle CLAUDECODE hlasi "spusteno z Claude Code")
UNSET=(); while IFS= read -r v; do UNSET+=(-u "$v"); done < <(env | sed -n 's/^\(CLAUDE[A-Za-z0-9_]*\)=.*/\1/p')
case "$TOKEN" in
  gh) T="$(gh auth token --hostname github.com)"; ENVV+=(COPILOT_GITHUB_TOKEN="$T");;
  env) :;;
  none) ENVV+=(COPILOT_GITHUB_TOKEN=);;
  *) echo "--token gh|env|none" >&2; exit 2;;
esac

ARGS=(-p "$PROMPT" --share "$O/prepis.md" --usage-output-file "$O/usage.json" --secret-env-vars COPILOT_GITHUB_TOKEN --log-dir "$O/copilot-logs" --log-level info)
[ -n "$MODEL" ] && ARGS+=(--model "$MODEL")
case "$ALLOW" in tools) ARGS+=(--allow-all-tools --allow-all-paths);; yolo) ARGS+=(--yolo);; none) :;; *) echo "--allow tools|yolo|none" >&2; exit 2;; esac
for d in ${DENY[@]+"${DENY[@]}"}; do ARGS+=(--deny-tool "$d"); done
# shellcheck disable=SC2206
[ -n "$EXTRA" ] && ARGS+=($EXTRA)

printf '%q ' "$BIN" "${ARGS[@]}" > "$O/prikaz.txt"; echo >> "$O/prikaz.txt"
echo "sandbox: $SB  (cwd: $W)"
set +e
( cd "$W" && timeout "$TMO" env ${UNSET[@]+"${UNSET[@]}"} "${ENVV[@]}" "$BIN" "${ARGS[@]}" ) > "$O/log.txt" 2>&1
RC=$?
set -e
# JSON prepis spustit zvlast neumime bez druheho behu; --share dava markdown prepis
echo "navratovy kod copilotu: $RC"; echo "log: $O/log.txt  prepis: $O/prepis.md"
exit "$RC"
