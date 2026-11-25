#!/usr/bin/env bash
# azure-inventory.sh — read-only inventura lab tenantu: kdy co vyprsi, kolik to stoji, co tam bezi.
# Jen cteni (GET + POST na Cost Management /query, ktery nic nemeni). Nic nezaklada, nic nemaze.

set -u

# ---- vychozi hodnoty (prepis env promennou nebo parametrem) -------------------------------------
LAB_TENANT_ID="${LAB_TENANT_ID:-972a674c-7b85-4e56-a31f-b2f95b42fd1e}"
LAB_SUBSCRIPTION_ID="${LAB_SUBSCRIPTION_ID:-05a636d8-d8e3-49d2-a450-4b3ff7cc0a13}"
LAB_ACCOUNT_HINT="${LAB_ACCOUNT_HINT:-pavel.chocholous@gmail.com}"   # jen pro hlasky
OTHER_TENANT_ID="${OTHER_TENANT_ID:-1f59a485-a0a7-4b68-aa03-d8aa133dd708}"  # demo/hackathon tenant (LabAdmin2)
COST_WINDOW_DAYS="${COST_WINDOW_DAYS:-30}"          # okno pro "naklady po zdrojich"
SONDA_RG_PREFIX="${SONDA_RG_PREFIX:-rg-egd-sonda-}" # RG ze sond, jen se oznaci
SONDA_TAG="${SONDA_TAG:-ucel=egd-workshop}"
EXPIRY_WARN_DAYS="${EXPIRY_WARN_DAYS:-14}"          # co je blize nez N dni, dostane vykricnik
OTHER_AZURE_CONFIG_DIR="${OTHER_AZURE_CONFIG_DIR:-}"  # volitelne: samostatny az profil pro druhy tenant (jinak vychozi ~/.azure)
OUTPUT_FILE="${OUTPUT_FILE:-}"                      # prazdne = stdout
# -------------------------------------------------------------------------------------------------

ARM="https://management.azure.com"
GRAPH="https://graph.microsoft.com/v1.0"

usage() {
  cat <<EOF
Pouziti: ${0##*/} [volby]

Read-only inventura Azure subscription + M365 predplatnych lab tenantu. Vystup: markdown.

Volby:
  -t, --tenant ID          lab tenant            (vychozi: LAB_TENANT_ID = $LAB_TENANT_ID)
  -s, --subscription ID    Azure subscription    (vychozi: LAB_SUBSCRIPTION_ID = $LAB_SUBSCRIPTION_ID)
  -o, --output SOUBOR      zapsat markdown do souboru misto na stdout
      --other-tenant ID    druhy tenant k pokusu o directory/subscriptions (vychozi: $OTHER_TENANT_ID)
      --no-other-tenant    druhy tenant preskocit
  Env: OTHER_AZURE_CONFIG_DIR=cesta  samostatny az profil pro druhy tenant (az login ho tam nezamicha s gmailem)
      --days N             okno pro naklady po zdrojich (vychozi: $COST_WINDOW_DAYS)
  -h, --help               tato napoveda

Predpoklady: az (prihlaseny jako $LAB_ACCOUNT_HINT), jq, curl, python3.
Druhy tenant potrebuje vlastni interaktivni prihlaseni; skript vypise presny prikaz.
Chyby jednotlivych dotazu skript nepreruší: sekce dostane znacku "❓ nezjisteno" s duvodem.
Znacky: ✅ zjisteno dotazem   📘 dokumentace   ❓ nezjisteno
EOF
}

SKIP_OTHER=0
while [ $# -gt 0 ]; do
  case "$1" in
    -t|--tenant) LAB_TENANT_ID="$2"; shift 2 ;;
    -s|--subscription) LAB_SUBSCRIPTION_ID="$2"; shift 2 ;;
    -o|--output) OUTPUT_FILE="$2"; shift 2 ;;
    --other-tenant) OTHER_TENANT_ID="$2"; shift 2 ;;
    --no-other-tenant) SKIP_OTHER=1; shift ;;
    --days) COST_WINDOW_DAYS="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Neznama volba: $1" >&2; usage >&2; exit 2 ;;
  esac
done

for bin in az jq curl python3; do
  command -v "$bin" >/dev/null || { echo "Chybi nastroj: $bin" >&2; exit 3; }
done

if [ -n "$OUTPUT_FILE" ]; then
  exec 3>&1 1>"$OUTPUT_FILE"   # stdout -> soubor, stderr zustava na terminalu
fi

TMP="$(mktemp -d "${TMPDIR:-/tmp}/azinv.XXXXXX")"
trap '/usr/bin/trash "$TMP" 2>/dev/null || true' EXIT

NOW_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
TODAY="$(date -u +%Y-%m-%d)"
if date -u -v-1d +%Y-%m-%d >/dev/null 2>&1; then
  FROM_DATE="$(date -u -v-"${COST_WINDOW_DAYS}"d +%Y-%m-%d)"
else
  FROM_DATE="$(date -u -d "-${COST_WINDOW_DAYS} days" +%Y-%m-%d)"
fi
MONTH_START="$(date -u +%Y-%m-01)"

# az_get URL [resource] -> JSON na stdout; pri chybe rc!=0 a duvod v $TMP/err
az_get() {
  local url="$1" res="${2:-}"
  if [ -n "$res" ]; then
    az rest --method get --resource "$res" --url "$url" -o json 2>"$TMP/err"
  else
    az rest --method get --url "$url" -o json 2>"$TMP/err"
  fi
}
az_post() { az rest --method post --url "$1" --body "$2" -o json 2>"$TMP/err"; }
unknown() { # duvod z posledniho dotazu, jednoradkove
  printf '❓ nezjisteno: %s\n' "$(head -c 300 "$TMP/err" | tr '\n' ' ')"
}
days_left() { python3 - "$1" <<'PY'
import sys, datetime as d
s = sys.argv[1]
t = d.datetime.fromisoformat(s.replace('Z', '+00:00'))
print((t - d.datetime.now(d.timezone.utc)).days)
PY
}
flag() { # flag ISO -> "(za N dni)" s vykricnikem kdyz je blizko
  local n; n="$(days_left "$1")"
  if [ "$n" -lt 0 ]; then echo "⚠️ vyprselo pred $((-n)) dny"
  elif [ "$n" -le "$EXPIRY_WARN_DAYS" ]; then echo "⚠️ za $n dni"
  else echo "za $n dni"; fi
}

SUB="$LAB_SUBSCRIPTION_ID"
echo "# Azure inventura — stav k $NOW_ISO"
echo
echo "Tenant \`$LAB_TENANT_ID\`, subscription \`$SUB\`. Generovano \`tools/azure-inventory.sh\` (read-only)."
echo

# ---- 1. subscription -----------------------------------------------------------------------------
echo "## 1. Azure subscription a kredit"
echo
if az_get "$ARM/subscriptions/$SUB?api-version=2022-12-01" >"$TMP/sub.json"; then
  jq -r '"✅ Nazev: **\(.displayName)**, stav: **\(.state)**, quotaId: `\(.subscriptionPolicies.quotaId)`, spending limit: **\(.subscriptionPolicies.spendingLimit)**"' "$TMP/sub.json"
  jq -r '(.promotions // [])[] | "✅ Promo `\(.category)` do \(.endDateTime)  (freetier = 12 mesicu free sluzeb, plati az po prechodu na pay-as-you-go 📘)"' "$TMP/sub.json"
else unknown; fi
echo
if az_get "$ARM/subscriptions/$SUB/providers/Microsoft.Billing/billingProperty/default?api-version=2020-05-01" >"$TMP/bp.json"; then
  BP_ID="$(jq -r '.properties.billingProfileId' "$TMP/bp.json")"
  jq -r '"✅ Billing: ucet **\(.properties.billingAccountDisplayName)**, profil `\(.properties.billingProfileId|split("/")|last)`, produkt \(.properties.productName), spending limit na profilu: **\(.properties.billingProfileSpendingLimit)**"' "$TMP/bp.json"
  echo
  if az_get "$ARM$BP_ID?api-version=2024-04-01" >"$TMP/prof.json"; then
    jq -r '.properties as $p | "✅ Mena faktury: \($p.currency). Spending limit detail:", ($p.spendingLimitDetails // [] | .[] | "- typ **\(.type)**, \(.amount) \(.currency), \(.startDate[:10]) → **\(.endDate[:10])**, stav \(.status)")' "$TMP/prof.json"
    CREDIT_END="$(jq -r '(.properties.spendingLimitDetails // [])[0].endDate // empty' "$TMP/prof.json")"
    [ -n "$CREDIT_END" ] && echo "- konec kreditu: $(flag "$CREDIT_END")"
  else unknown; fi
  echo
  if az_get "$ARM$BP_ID/providers/Microsoft.Consumption/lots?api-version=2024-08-01" >"$TMP/lots.json"; then
    echo "✅ Kreditni loty:"
    jq -r '.value[] | .properties | "- \(.source): puvodne \(.originalAmount.value) \(.originalAmount.currency), zbyva (uzavrena bilance) **\(.closedBalance.value) \(.closedBalance.currency)** (≈ \(.closedBalanceInBillingCurrency.value|.*100|round/100) \(.closedBalanceInBillingCurrency.currency)), plati \(.startDate[:10]) → **\(.expirationDate[:10])**"' "$TMP/lots.json"
  else unknown; fi
  if az_get "$ARM$BP_ID/providers/Microsoft.Consumption/credits/balanceSummary?api-version=2019-10-01" >"$TMP/bal.json"; then
    jq -r '.properties | "✅ Zustatek kreditu: aktualni \(.balanceSummary.currentBalance.value) \(.balanceSummary.currentBalance.currency), odhad po neuctovanych poplatcich **\(.balanceSummary.estimatedBalance.value) \(.balanceSummary.estimatedBalance.currency)** (cekajici poplatky \(.pendingEligibleCharges.value))"' "$TMP/bal.json"
  else unknown; fi
  BACC="$(jq -r '.properties.billingAccountId' "$TMP/bp.json")"
  if az_get "$ARM$BACC/billingSubscriptions?api-version=2024-04-01" >"$TMP/bsub.json"; then
    echo
    echo "✅ Billing subscriptions na uctu:"
    jq -r '.value[].properties | "- \(.displayName) (\(.productType), stav \(.status), koupeno \(.purchaseDate[:10]), autoRenew \(.autoRenew))"' "$TMP/bsub.json"
  else unknown; fi
  if az_get "$ARM$BP_ID/invoices?api-version=2024-04-01&periodStartDate=${TODAY:0:4}-01-01&periodEndDate=${TODAY:0:4}-12-31" >"$TMP/inv.json"; then
    echo
    echo "✅ Faktury (rok ${TODAY:0:4}):"
    jq -r '.value[]?.properties | "- \(.invoicePeriodStartDate[:10]) → \(.invoicePeriodEndDate[:10]): fakturovano \(.billedAmount.value) \(.billedAmount.currency), kredit \(.creditAmount.value), k uhrade \(.amountDue.value), stav \(.status)"' "$TMP/inv.json"
  else unknown; fi
else unknown; fi
echo

# ---- 2. naklady ----------------------------------------------------------------------------------
echo "## 2. Naklady (Cost Management, ActualCost)"
echo
COSTURL="$ARM/subscriptions/$SUB/providers/Microsoft.CostManagement/query?api-version=2023-11-01"
body_mtd='{"type":"ActualCost","timeframe":"Custom","timePeriod":{"from":"'"$MONTH_START"'T00:00:00Z","to":"'"$TODAY"'T23:59:59Z"},"dataset":{"granularity":"None","aggregation":{"totalCost":{"name":"Cost","function":"Sum"}}}}'
body_all='{"type":"ActualCost","timeframe":"Custom","timePeriod":{"from":"2026-01-01T00:00:00Z","to":"'"$TODAY"'T23:59:59Z"},"dataset":{"granularity":"None","aggregation":{"totalCost":{"name":"Cost","function":"Sum"}}}}'
body_res='{"type":"ActualCost","timeframe":"Custom","timePeriod":{"from":"'"$FROM_DATE"'T00:00:00Z","to":"'"$TODAY"'T23:59:59Z"},"dataset":{"granularity":"None","aggregation":{"totalCost":{"name":"Cost","function":"Sum"}},"grouping":[{"type":"Dimension","name":"ResourceId"}]}}'
body_day='{"type":"ActualCost","timeframe":"Custom","timePeriod":{"from":"'"$FROM_DATE"'T00:00:00Z","to":"'"$TODAY"'T23:59:59Z"},"dataset":{"granularity":"Daily","aggregation":{"totalCost":{"name":"Cost","function":"Sum"}}}}'

if az_post "$COSTURL" "$body_mtd" >"$TMP/c_mtd.json"; then
  jq -r '"✅ Tento mesic (od '"$MONTH_START"'): **\(.properties.rows[0][0]//0|.*100|round/100) \(.properties.rows[0][1]//"EUR")**"' "$TMP/c_mtd.json" 2>/dev/null \
    || jq -r '"✅ Tento mesic: \(.properties.rows)"' "$TMP/c_mtd.json"
else unknown; fi
if az_post "$COSTURL" "$body_all" >"$TMP/c_all.json"; then
  jq -r '"✅ Celkem od 1. 1. (tj. od zalozeni): **\(.properties.rows[0][0]//0|.*100|round/100) \(.properties.rows[0][1]//"EUR")**"' "$TMP/c_all.json" 2>/dev/null || true
else unknown; fi
if az_post "$COSTURL" "$body_day" >"$TMP/c_day.json"; then
  # prumer poslednich 7 plnych dni (vynecha dnesek) -> odhad za 30 dni
  python3 - "$TMP/c_day.json" <<'PY'
import json, sys
rows = json.load(open(sys.argv[1]))["properties"]["rows"]
rows = sorted(rows, key=lambda r: r[1])
full = rows[:-1] if len(rows) > 1 else rows   # posledni = dnesni nekompletni den
last = [r[0] for r in full[-7:]]
if last:
    avg = sum(last) / len(last)
    cur = rows[0][2] if rows else "EUR"
    print(f"✅ Denni run-rate (prumer poslednich {len(last)} plnych dni): **{avg:.2f} {cur}/den**, odhad na 30 dni: **{avg*30:.0f} {cur}**")
PY
else unknown; fi
echo
if az_get "$ARM/subscriptions/$SUB/providers/Microsoft.Consumption/budgets?api-version=2023-05-01" >"$TMP/bud.json"; then
  echo "✅ Budgety:"
  jq -r '.value[]? | .name as $n | .properties | "- \($n): limit \(.amount) (\(.timeGrain)), aktualne \(.currentSpend.amount|.*100|round/100) \(.currentSpend.unit), forecast \(.forecastSpend.amount|.*100|round/100) — notifikace: \(.notifications|keys|join(", "))"' "$TMP/bud.json"
else unknown; fi
echo

# ---- 3. inventura zdroju -------------------------------------------------------------------------
echo "## 3. Inventura zdroju po resource group"
echo
if az resource list --subscription "$SUB" -o json --query '[].{id:id,n:name,t:type,rg:resourceGroup,l:location,sku:sku.name,tags:tags,c:createdTime}' >"$TMP/res.json" 2>"$TMP/err" \
   && az_post "$COSTURL" "$body_res" >"$TMP/c_res.json" \
   && az group list --subscription "$SUB" -o json --query '[].{n:name,l:location,t:tags}' >"$TMP/rg.json" 2>"$TMP/err" \
   && az rest --method get --url "$ARM/subscriptions/$SUB/resources?api-version=2021-04-01&\$expand=createdTime" -o json --query 'value[].{id:id,c:createdTime}' >"$TMP/created.json" 2>"$TMP/err"; then
  # sluzby s plynulym nakladem 24/7 (kdyz bezi) — heuristika podle typu; ✅ jen kdyz jsou i v nakladech > 0
  SONDA_RG_PREFIX="$SONDA_RG_PREFIX" SONDA_TAG="$SONDA_TAG" EXPIRY_WARN_DAYS="$EXPIRY_WARN_DAYS" python3 - "$TMP" <<'PY'
import json, os, sys, collections
tmp = sys.argv[1]
res = json.load(open(f"{tmp}/res.json"))
rgs = {g["n"]: g for g in json.load(open(f"{tmp}/rg.json"))}
created = {x["id"].lower(): x["c"] for x in json.load(open(f"{tmp}/created.json"))}
cost = {}
cur = "EUR"
for r in json.load(open(f"{tmp}/c_res.json"))["properties"]["rows"]:
    cost[r[1].lower()] = cost.get(r[1].lower(), 0) + r[0]; cur = r[2]
prefix = os.environ["SONDA_RG_PREFIX"]
tagk, _, tagv = os.environ["SONDA_TAG"].partition("=")
# typy, ktere stoji i bez provozu / bezi 24/7 (📘 cenove modely)
ALWAYS = {
 "microsoft.web/serverfarms": "App Service plan: plati se za hodiny planu (mimo Free/Flex/Consumption)",
 "microsoft.dbforpostgresql/flexibleservers": "Postgres Flexible: plati se za bezici server + disk",
 "microsoft.network/privateendpoints": "Private Endpoint: hodinova sazba 24/7",
 "microsoft.containerregistry/registries": "ACR: denni poplatek za SKU",
 "microsoft.network/privatednszones": "Private DNS zona: mesicni poplatek",
 "microsoft.operationalinsights/workspaces": "Log Analytics: plati se za ingest/retenci",
 "microsoft.keyvault/vaults": "Key Vault: za operace (zanedbatelne)",
}
by_rg = collections.defaultdict(list)
for r in res: by_rg[r["rg"]].append(r)
for g in rgs:
    by_rg.setdefault(g, [])
for rg in sorted(by_rg, key=str.lower):
    g = rgs.get(rg, {})
    tags = g.get("t") or {}
    is_sonda = rg.lower().startswith(prefix.lower()) or tags.get(tagk) == tagv
    total = sum(cost.get(r["id"].lower(), 0) for r in by_rg[rg])
    mark = " — 🧪 sonda (nesahat, jine agenty ji muzou zakladat/mazat)" if is_sonda else ""
    print(f"### {rg} ({g.get('l','?')}){mark}")
    print(f"Tagy RG: `{json.dumps(tags, ensure_ascii=False)}` · naklady za okno: **{total:.2f} {cur}** · zdroju: {len(by_rg[rg])}")
    print()
    if not by_rg[rg]:
        print("_prazdna RG_\n"); continue
    print("| Zdroj | Typ | SKU | Region | Vytvoren | Naklady (okno) | Poznamka |")
    print("|---|---|---|---|---|---|---|")
    for r in sorted(by_rg[rg], key=lambda x: -cost.get(x["id"].lower(), 0)):
        c = cost.get(r["id"].lower(), 0)
        t = r["t"]; note = ""
        if t.lower() in ALWAYS and c > 0.05:
            note = "💸 prubezne naklady — " + ALWAYS[t.lower()]
        elif t.lower() in ALWAYS:
            note = "📘 potencialne prubezne — " + ALWAYS[t.lower()]
        tg = r.get("tags") or {}
        if tg: note = (note + " " if note else "") + f"tagy: {json.dumps(tg, ensure_ascii=False)}"
        cr = (created.get(r["id"].lower()) or r.get("c") or "?")[:10]
        print(f"| {r['n']} | {t} | {r.get('sku') or '—'} | {r['l']} | {cr} | {c:.2f} | {note} |")
    print()
PY
else unknown; fi

# stav bezicich kompute (jen cteni)
echo "### Stav kompute (✅ dotaz)"
echo
az appservice plan list --subscription "$SUB" -o json --query '[].{n:name,sku:sku.name,tier:sku.tier,sites:numberOfSites,rg:resourceGroup}' >"$TMP/asp.json" 2>"$TMP/err" \
  && jq -r '.[] | "- App Service plan `\(.n)` (\(.rg)): \(.tier) \(.sku), webapps: \(.sites)"' "$TMP/asp.json" || unknown
az webapp list --subscription "$SUB" -o json --query '[].{n:name,s:state,rg:resourceGroup}' >"$TMP/wa.json" 2>"$TMP/err" \
  && jq -r '.[] | "- webapp `\(.n)` (\(.rg)): \(.s)"' "$TMP/wa.json" || unknown
az postgres flexible-server list --subscription "$SUB" -o json --query '[].{n:name,s:state,sku:sku.name,tier:sku.tier}' >"$TMP/pg.json" 2>"$TMP/err" \
  && jq -r '.[] | "- Postgres `\(.n)`: \(.s), \(.tier) \(.sku)"' "$TMP/pg.json" || unknown
echo

# ---- 4. M365 / Entra predplatna ------------------------------------------------------------------
graph_section() { # $1 = nazev tenantu, $2 = "az" (az rest) nebo "token" (curl s tokenem)
  local name="$1" mode="$2" tok="${3:-}"
  local ok=1
  if [ "$mode" = az ]; then
    az_get "$GRAPH/directory/subscriptions" https://graph.microsoft.com >"$TMP/dsub.json" || ok=0
  else
    curl -sS -f -H "Authorization: Bearer $tok" "$GRAPH/directory/subscriptions" >"$TMP/dsub.json" 2>"$TMP/err" || ok=0
  fi
  if [ $ok = 1 ]; then
    echo "✅ \`/directory/subscriptions\` ($name):"
    echo
    echo "| SKU | Trial | Stav | Vytvoreno | Dalsi lifecycle (konec) | Za kolik | Licenci |"
    echo "|---|---|---|---|---|---|---|"
    jq -r '.value[] | [.skuPartNumber, (.isTrial|tostring), .status, .createdDateTime[:10], (.nextLifecycleDateTime // "—"), (.totalLicenses|tostring)] | @tsv' "$TMP/dsub.json" \
    | while IFS=$'\t' read -r sku trial st cr nx tot; do
        if [ "$nx" != "—" ]; then lf="$(flag "$nx")"; else lf="—"; fi
        echo "| $sku | $trial | $st | $cr | ${nx:0:16} | $lf | $tot |"
      done
  else unknown; fi
  echo
  ok=1
  if [ "$mode" = az ]; then az_get "$GRAPH/subscribedSkus" https://graph.microsoft.com >"$TMP/skus.json" || ok=0
  else curl -sS -f -H "Authorization: Bearer $tok" "$GRAPH/subscribedSkus" >"$TMP/skus.json" 2>"$TMP/err" || ok=0; fi
  if [ $ok = 1 ]; then
    echo "✅ \`/subscribedSkus\` ($name):"
    echo
    echo "| SKU | Stav | Pouzito | Zakoupeno | Suspended | Warning |"
    echo "|---|---|---|---|---|---|"
    jq -r '.value[] | "| \(.skuPartNumber) | \(.capabilityStatus) | \(.consumedUnits) | \(.prepaidUnits.enabled) | \(.prepaidUnits.suspended) | \(.prepaidUnits.warning) |"' "$TMP/skus.json"
  else unknown; fi
}

echo "## 4. M365 / Entra licence — lab tenant"
echo
graph_section "lab tenant" az
echo
echo "### Power Platform (✅ dotaz / ❓)"
echo
if az_get "$ARM/subscriptions/$SUB/providers/Microsoft.PowerPlatform/accounts?api-version=2020-10-30-preview" >"$TMP/ppacc.json"; then
  jq -r '.value[] | "- ✅ Power Platform account (billing policy / PAYG) `\(.name)` v `\(.id|split("/")[4])`, vytvoren \(.systemData.createdAt[:10]) uzivatelem \(.systemData.createdBy)"' "$TMP/ppacc.json"
else unknown; fi
if az_get "https://api.bap.microsoft.com/providers/Microsoft.BusinessAppPlatform/scopes/admin/environments?api-version=2024-05-01" https://api.bap.microsoft.com >"$TMP/env.json"; then
  jq -r '.value[] | "- ✅ Prostredi `\(.properties.displayName)`: typ \(.properties.environmentSku), vytvoreno \(.properties.createdTime[:10]), expirace: \(.properties.expirationTime // "bez expirace (typ Default)")"' "$TMP/env.json"
else unknown; fi
echo "- ❓ Billing policy a trialy Power Apps / Power Automate / Copilot Studio: BAP endpointy billingPolicies vraci 404 s verejnym api-version; zjistitelne v Power Platform admin centru (Billing → Billing policies, Licenses)."
echo

# ---- 5. druhy tenant -----------------------------------------------------------------------------
if [ "$SKIP_OTHER" = 0 ]; then
  echo "## 5. Druhy tenant \`$OTHER_TENANT_ID\` (demo/hackathon, LabAdmin2)"
  echo
  OTOK="$(AZURE_CONFIG_DIR="${OTHER_AZURE_CONFIG_DIR:-${AZURE_CONFIG_DIR:-$HOME/.azure}}" az account get-access-token --tenant "$OTHER_TENANT_ID" --resource https://graph.microsoft.com --query accessToken -o tsv 2>"$TMP/err")"
  if [ -n "$OTOK" ]; then
    graph_section "druhy tenant" token "$OTOK"
  else
    unknown
    echo
    echo "Pavel musi spustit sam (interaktivni prihlaseni; pak skript znovu):"
    echo
    echo '```'
    echo "${OTHER_AZURE_CONFIG_DIR:+AZURE_CONFIG_DIR=$OTHER_AZURE_CONFIG_DIR }az login --tenant \"$OTHER_TENANT_ID\" --scope \"https://graph.microsoft.com/.default\""
    echo "# prihlasit se ucet z daneho tenantu (LabAdmin2@M365x04523031.OnMicrosoft.com), ne gmail"
    echo '```'
  fi
  echo
fi

echo "## Mimo rozsah"
echo
echo "Firemni tenanty (PPF 5ae9dff0-…, b287c0b1-…) skript neprochazi."
echo
echo "---"
echo "Obnova: \`tools/azure-inventory.sh -o <soubor>.md\`."

if [ -n "$OUTPUT_FILE" ]; then echo "Zapsano: $OUTPUT_FILE" >&3; fi
