#!/usr/bin/env bash
# Lab GitHub: kroky přes gh/API po založení Enterprise trialu (Pavel trial zakládá sám v prohlížeči).
# Výchozí je suchý běh (jen vypíše, co by udělal); zápis až s --apply. Nic nemaže.
# shellcheck disable=SC2016  # $ v GraphQL dotazech je záměrně v jednoduchých uvozovkách
set -euo pipefail

usage() {
  cat <<'EOF'
Použití: tools/lab-github-org.sh <příkaz> [volby] [--apply]

Příkazy (vše jen vypíše plán, dokud není --apply; kromě check, ten jen čte):
  check                                  kdo jsem, jaké scopes, jaké enterprise vidím
  create-org  --enterprise SLUG --org LOGIN --admin GH_LOGIN
                                         GraphQL createEnterpriseOrganization (trial: max 3 organizace)
  invite      --org LOGIN --file SOUBOR  pozvánky do org (jen NE-EMU trial); v souboru na řádek
                                         jeden e-mail nebo GitHub login; role direct_member
  repo        --org LOGIN --name NAZEV   založí privátní repo v org
  copilot     --org LOGIN --file SOUBOR  přidělí Copilot seat (jen když org má Copilot Business;
                                         v trialu Copilot není!); v souboru GitHub loginy

Přihlášení: použije `gh` (GH_HOST, výchozí github.com). Pro enterprise potřebuje token classic PAT
se scopes admin:org, admin:enterprise (u EMU přihlášený jako SHORTCODE_admin), pro Copilot navíc
manage_billing:copilot. Token dej do GH_TOKEN (nikdy ho nevypisuj ani neukládej do repa); nejlépe
vlastní adresář konfigurace: GH_CONFIG_DIR=~/.config/gh-egd-lab.

Příklad:
  GH_TOKEN=... tools/lab-github-org.sh check
  GH_TOKEN=... tools/lab-github-org.sh create-org --enterprise egdlab --org egdlab-dev --admin pavel-admin --apply
Stav ověření: ❓ skript nebyl proti skutečnému enterprise zkoušen (trial ještě neexistuje);
GraphQL mutace createEnterpriseOrganization je ověřená jen ve schématu (introspekce 2026-11-22).
EOF
}

APPLY=0; CMD="${1:-}"; [ $# -gt 0 ] && shift || true
ENTERPRISE=""; ORG=""; ADMIN=""; FILE=""; NAME=""
while [ $# -gt 0 ]; do
  case "$1" in
    --enterprise) ENTERPRISE="$2"; shift 2;;
    --org) ORG="$2"; shift 2;;
    --admin) ADMIN="$2"; shift 2;;
    --file) FILE="$2"; shift 2;;
    --name) NAME="$2"; shift 2;;
    --apply) APPLY=1; shift;;
    -h|--help) usage; exit 0;;
    *) echo "neznámá volba: $1" >&2; usage >&2; exit 2;;
  esac
done
case "$CMD" in ""|-h|--help|help) usage; exit 0;; esac

need() { [ -n "${!1}" ] || { echo "chybí --$2" >&2; exit 2; }; }
run() { # run <popis> <příkaz...>
  if [ "$APPLY" = 1 ]; then echo "+ $1"; shift; "$@"; else echo "[suchý běh] $1"; fi
}
lines() { grep -v '^[[:space:]]*\(#\|$\)' "$FILE"; }

case "$CMD" in
  check)
    gh api user --jq '"přihlášen jako: " + .login'
    gh api -i user 2>/dev/null | grep -i '^x-oauth-scopes' || echo "scopes: (fine-grained token, nebo gh je nevrací)"
    gh api graphql -f query='{viewer{enterprises(first:10){nodes{slug name id viewerIsAdmin}}}}' \
      --jq '.data.viewer.enterprises.nodes[] | "enterprise: \(.slug) (\(.name)) admin=\(.viewerIsAdmin)"' \
      2>&1 | grep -v '^{' | head -3 || true
    echo "(enterprise vidí jen token se scope read:enterprise; bez něj je to chyba INSUFFICIENT_SCOPES)"
    ;;
  create-org)
    need ENTERPRISE enterprise; need ORG org; need ADMIN admin
    eid=$(gh api graphql -f query='query($s:String!){enterprise(slug:$s){id}}' -f s="$ENTERPRISE" --jq .data.enterprise.id)
    run "createEnterpriseOrganization $ORG v $ENTERPRISE (admin $ADMIN)" \
      gh api graphql -f query='mutation($e:ID!,$l:String!,$a:String!,$m:[String!]!){createEnterpriseOrganization(input:{enterpriseId:$e,login:$l,profileName:$l,billingEmail:$a,adminLogins:$m}){organization{login url}}}' \
      -f e="$eid" -f l="$ORG" -f a="${LAB_GITHUB_BILLING_EMAIL:?nastav LAB_GITHUB_BILLING_EMAIL}" -f 'm[]'="$ADMIN"
    ;;
  invite)
    need ORG org; need FILE file
    while IFS= read -r who; do
      if [[ "$who" == *@* ]]; then field=email; else field=invitee_login; fi
      if [ "$field" = email ]; then
        run "pozvánka $who → $ORG" gh api -X POST "/orgs/$ORG/invitations" -f email="$who" -f role=direct_member
      else
        id=$(gh api "/users/$who" --jq .id)
        run "pozvánka $who → $ORG" gh api -X POST "/orgs/$ORG/invitations" -F invitee_id="$id" -f role=direct_member
      fi
    done < <(lines)
    ;;
  repo)
    need ORG org; need NAME name
    run "privátní repo $ORG/$NAME" gh api -X POST "/orgs/$ORG/repos" -f name="$NAME" -F private=true
    ;;
  copilot)
    need ORG org; need FILE file
    mapfile -t users < <(lines)
    args=(); for u in "${users[@]}"; do args+=(-f 'selected_usernames[]='"$u"); done
    run "Copilot seaty v $ORG: ${users[*]}" gh api -X POST "/orgs/$ORG/copilot/billing/selected_users" "${args[@]}"
    ;;
  *) echo "neznámý příkaz: $CMD" >&2; usage >&2; exit 2;;
esac
