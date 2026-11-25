#!/usr/bin/env python3
"""Přehodí licence v lab tenantu z jednoho SKU na jiné (např. konec trialu SPE_E5 → nový trial).

Výchozí režim je NÁHLED: jen vypíše, komu by co přidal/odebral, a zkontroluje volná místa.
Zápis až s --provest (a jen po výslovném ano Pavla). Účty egd01–egd10 přeskakuje
(ty řeší tools/lab-ucty-licence.py), pokud nezadáš --vcetne-egd.

Použití:
  tools/lab-licence-prehod.py --z SPE_E5 --na SPE_E3                 # náhled
  tools/lab-licence-prehod.py --z SPE_E5 --na SPE_E3 --provest       # přidá SPE_E3, E5 nechá
  tools/lab-licence-prehod.py --z SPE_E5 --na SPE_E3 --odebrat-z --provest   # přidá a E5 odebere
  tools/lab-licence-prehod.py --sku                                  # vypíše SKU v tenantu

Graph přes `az rest` (az musí být přihlášené do tenantu 972a674c-…, role s User.ReadWrite.All).
"""
import argparse
import json
import subprocess
import sys

TENANT = "972a674c-7b85-4e56-a31f-b2f95b42fd1e"
GRAPH = "https://graph.microsoft.com/v1.0"


def az(method, url, body=None):
    cmd = ["az", "rest", "--method", method, "--url", url]
    if body is not None:
        cmd += ["--body", json.dumps(body), "--headers", "Content-Type=application/json"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"az rest selhal ({method} {url}):\n{r.stderr}")
    return json.loads(r.stdout) if r.stdout.strip() else {}


def kontrola_tenantu():
    r = subprocess.run(["az", "account", "show", "--query", "tenantId", "-o", "tsv"],
                       capture_output=True, text=True)
    if r.stdout.strip() != TENANT:
        sys.exit(f"az není v lab tenantu (je v '{r.stdout.strip()}'), končím.")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--z", help="skuPartNumber, které uživatelé mají teď (např. SPE_E5)")
    p.add_argument("--na", help="skuPartNumber, které dostanou (např. SPE_E3)")
    p.add_argument("--odebrat-z", action="store_true", help="v témže kroku odebrat SKU --z")
    p.add_argument("--vcetne-egd", action="store_true", help="zahrnout i účty egd01–egd10")
    p.add_argument("--provest", action="store_true", help="opravdu zapsat (bez toho jen náhled)")
    p.add_argument("--sku", action="store_true", help="jen vypsat SKU v tenantu a volná místa")
    a = p.parse_args()
    kontrola_tenantu()

    skus = {s["skuPartNumber"]: s for s in az("get", f"{GRAPH}/subscribedSkus")["value"]}
    if a.sku or not (a.z and a.na):
        for n, s in skus.items():
            print(f"{n:60} {s['capabilityStatus']:10} {s['consumedUnits']:>5}/{s['prepaidUnits']['enabled']}")
        return
    for n in (a.z, a.na):
        if n not in skus:
            sys.exit(f"SKU {n} v tenantu není (viz --sku).")
    z_id, na_id = skus[a.z]["skuId"], skus[a.na]["skuId"]

    url = f"{GRAPH}/users?$select=id,userPrincipalName,assignedLicenses&$top=999"
    users = az("get", url)["value"]
    cil = [u for u in users
           if any(l["skuId"] == z_id for l in u["assignedLicenses"])
           and (a.vcetne_egd or not u["userPrincipalName"].lower().startswith("egd"))]
    pridat = [u for u in cil if not any(l["skuId"] == na_id for l in u["assignedLicenses"])]
    volno = skus[a.na]["prepaidUnits"]["enabled"] - skus[a.na]["consumedUnits"]
    print(f"{a.z} → {a.na}: {len(cil)} účtů, přidat {len(pridat)}, volných míst {a.na}: {volno}")
    for u in cil:
        print("  ", u["userPrincipalName"], "(už má)" if u not in pridat else "")
    if len(pridat) > volno:
        sys.exit("Málo volných míst v cílovém SKU, nic neměním.")
    if not a.provest:
        print("NÁHLED — nic nezapsáno. Zápis: přidej --provest.")
        return
    for u in cil:
        body = {"addLicenses": [{"skuId": na_id, "disabledPlans": []}] if u in pridat else [],
                "removeLicenses": [z_id] if a.odebrat_z else []}
        if body["addLicenses"] or body["removeLicenses"]:
            az("post", f"{GRAPH}/users/{u['id']}/assignLicense", body)
            print("  hotovo:", u["userPrincipalName"])


if __name__ == "__main__":
    main()
