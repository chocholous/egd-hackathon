#!/usr/bin/env bash
# lab-prihlaseni-stav.sh — jen čtení: zdraví všech přihlášení labu na jednom místě.
# Agent ho spustí DŘÍV, než Pavla požádá o přihlášení; Pavel pak dělá login jen tam, kde je ❌.
set -uo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  cat <<'EOF'
Použití: tools/lab-prihlaseni-stav.sh [--bez-profilu]

Zkontroluje (jen čtení, nic nepřihlašuje):
  az          účet, tenant, platnost tokenu
  m365        tools/lab-m365.sh --stav (token cache + záloha)
  PA relace   tools/pa-browser-session.mjs check (Tomáš, Power Automate)
  profily     každý ~/.config/ppf-rooms-lab/profily/* přes tools/lab-host-kontrola.mjs
              (klon profilu, /_api/web/currentuser; 200 + LoginName = přihlášen)
--bez-profilu přeskočí profily (jsou nejpomalejší).
Graph PowerShell se nekontroluje: tiché převzetí z cache v Bash nástroji nefunguje (viz tools/README).
EOF
  exit 0
fi

D="$(cd "$(dirname "$0")" && pwd)"
echo "== az"
az account show --query '[user.name, tenantId, id]' -o tsv | paste -sd' ' - || echo "❌ az: nepřihlášen → Pavel: az login"
az account get-access-token --query expiresOn -o tsv | sed 's/^/token do: /' || true

echo "== m365 (lab)"
"$D/lab-m365.sh" --stav || echo "❌ m365: Pavel → tools/lab-m365.sh login --authType deviceCode --appId … --tenant …"

echo "== Power Automate relace (tomas.prochazka)"
node "$D/pa-browser-session.mjs" check --ucet tomas.prochazka 2>&1 | tail -1

[[ "${1:-}" == "--bez-profilu" ]] && exit 0
echo "== profily prohlížeče"
OUT="$(mktemp -d)"
ls "$HOME/.config/ppf-rooms-lab/profily" | xargs -P "$(( $(sysctl -n hw.ncpu) - 2 ))" -I{} \
  sh -c "node '$D/lab-host-kontrola.mjs' {} / > '$OUT/{}.txt' 2>&1"
for f in "$OUT"/*.txt; do
  n="$(basename "$f" .txt)"
  r="$(grep -v 'kopie profilu' "$f" | tr '\t\n' '  ')"
  case "$r" in *" 200 "*) echo "✅ $n:${r#*200}";; *) echo "❌ $n: ${r:0:120}";; esac
done
# úklid klonů profilů (kopie vypisuje lab-host-kontrola.mjs)
grep -ho '/var/folders/[^"]*lab-host-[A-Za-z0-9]*' "$OUT"/*.txt | sort -u | xargs /usr/bin/trash
/usr/bin/trash "$OUT"
