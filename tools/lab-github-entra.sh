#!/usr/bin/env bash
# Lab GitHub EMU: příprava na straně Entra lab tenantu (skupina účastníků pro SCIM).
# Výchozí je suchý běh; zápis jen s --apply. Účty egd01–10 nezakládá (to dělá lab_ucty_zalozit.py).
set -euo pipefail

usage() {
  cat <<'EOF'
Použití: tools/lab-github-entra.sh <plan|group> [--ucty "egd01,egd02"] [--skupina NAZEV] [--apply]

  plan     vypíše, co se děje v Entra a co musí udělat člověk (OIDC souhlas, SCIM token)
  group    zajistí bezpečnostní skupinu (výchozí grp-egd-github) a doplní do ní účty egdNN;
           bez --apply jen vypíše, co by udělal. Idempotentní, nic nemaže.

Proměnné: EGD_LAB_DOMENA (výchozí pavelchocholousgmail.onmicrosoft.com),
          EGD_LAB_POCET_UCTU (výchozí 10).
`az` musí být přihlášený do lab tenantu (kontrola podle domény); skupina musí být bezpečnostní
a bez vnoření, jinak ji GitHub SCIM nezpracuje (📘 docs.github.com, SCIM s Entra ID).
EOF
}

CMD="${1:-}"; [ $# -gt 0 ] && shift || true
APPLY=0; GROUP="grp-egd-github"; UCTY=""
while [ $# -gt 0 ]; do
  case "$1" in
    --apply) APPLY=1; shift;;
    --skupina) GROUP="$2"; shift 2;;
    --ucty) UCTY="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "neznámá volba: $1" >&2; usage >&2; exit 2;;
  esac
done
DOMENA="${EGD_LAB_DOMENA:-pavelchocholousgmail.onmicrosoft.com}"
POCET="${EGD_LAB_POCET_UCTU:-10}"
if [ -z "$UCTY" ]; then UCTY=$(for i in $(seq 1 "$POCET"); do printf 'egd%02d,' "$i"; done); UCTY="${UCTY%,}"; fi

case "$CMD" in
  ""|-h|--help|help) usage;;
  plan)
    cat <<EOF
1. (Pavel) GitHub: enterprise s EMU, shortcode, setup user SHORTCODE_admin, OIDC "Enable OIDC configuration".
2. (Pavel, Global Admin lab tenantu) souhlas s aplikací "GitHub Enterprise Managed User (OIDC)" v Entra.
3. (Pavel) PAT classic setup usera se scope scim:enterprise a bez expirace.
4. (agent, tento skript) skupina $GROUP s účty: $UCTY (@$DOMENA).
5. (Pavel/agent) Entra > Enterprise apps > "GitHub Enterprise Managed User (OIDC)" > Provisioning:
   Tenant URL https://api.github.com/scim/v2/enterprises/SLUG, Secret = PAT; přiřadit skupinu $GROUP; Start provisioning.
   Uživatelská jména na GitHubu: <část UPN před @>_<shortcode>, např. egd01_SHORTCODE.
EOF
    ;;
  group)
    dom=$(az rest --method get --url "https://graph.microsoft.com/v1.0/organization" --query "value[0].verifiedDomains[?isInitial].name | [0]" -o tsv)
    [ "$dom" = "$DOMENA" ] || { echo "az je v jiném tenantu ($dom), čekám $DOMENA" >&2; exit 1; }
    gid=$(az ad group list --display-name "$GROUP" --query '[0].id' -o tsv)
    if [ -z "$gid" ]; then
      if [ "$APPLY" = 1 ]; then
        gid=$(az ad group create --display-name "$GROUP" --mail-nickname "$GROUP" --description "EGD workshop: GitHub EMU (SCIM)" --query id -o tsv)
        echo "skupina založena: $GROUP ($gid)"
      else echo "[suchý běh] založil bych bezpečnostní skupinu $GROUP"; fi
    else echo "skupina existuje: $GROUP ($gid)"; fi
    IFS=',' read -ra arr <<< "${UCTY%,}"
    for u in "${arr[@]}"; do
      upn="$u@$DOMENA"
      uid=$(az ad user show --id "$upn" --query id -o tsv 2>/dev/null || true)
      if [ -z "$uid" ]; then echo "  $upn: účet neexistuje, přeskakuji"; continue; fi
      if [ -n "$gid" ] && [ "$(az ad group member check --group "$gid" --member-id "$uid" --query value -o tsv)" = "true" ]; then
        echo "  $upn: už je členem"
      elif [ "$APPLY" = 1 ]; then az ad group member add --group "$gid" --member-id "$uid" && echo "  $upn: přidán"
      else echo "  [suchý běh] přidal bych $upn"; fi
    done
    ;;
  *) echo "neznámý příkaz: $CMD" >&2; usage >&2; exit 2;;
esac
