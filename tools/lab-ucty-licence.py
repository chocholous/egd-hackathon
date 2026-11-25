#!/usr/bin/env python3
"""Přidělí účastníkům workshopu EG.D licenci (výchozí SPE_E5) a volitelně odebere jinou.

Po změně SKU (konec E5 trialu, řeší session lab-trial) přehraj s novým --sku BEZ --remove-sku
(účty mají chvíli obě licence) a starou odeber až po konci trialu přes --jen-odebrat. Idempotentní.
Mění jen účty egd01 … egd10.

Použití:
  tools/lab-ucty-licence.py                          # SPE_E5 všem
  tools/lab-ucty-licence.py --sku NOVE_SKU            # přidá novou, E5 nechá
  tools/lab-ucty-licence.py --jen-odebrat SPE_E5     # (úklid) jen odebere
  tools/lab-ucty-licence.py --stav                   # vypíše, kdo má co
  tools/lab-ucty-licence.py --sku X --vypnout-plan OFFICE_BUSINESS
      # přidá X s vypnutou službou: nutné, když se služba vylučuje s licencí, kterou účet už má
      # (24. 11.: Business Standard EEA vedle SPE_E5 → 400 „service plans … are mutually exclusive“,
      #  OFFICE_BUSINESS × OFFICESUBSCRIPTION)
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lab_ucty_lib as L  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--sku", default="SPE_E5", help="skuPartNumber k přidělení (výchozí SPE_E5)")
    ap.add_argument("--remove-sku", help="skuPartNumber k odebrání ve stejném kroku")
    ap.add_argument("--jen-odebrat", metavar="SKU", help="jen odebrat tohle SKU, nic nepřidávat")
    ap.add_argument("--ucty", help="čárkami oddělená čísla nebo aliasy (výchozí všechny)")
    ap.add_argument("--stav", action="store_true", help="jen vypsat přidělené licence")
    ap.add_argument("--vypnout-plan", action="append", default=[], metavar="PLAN",
                    help="servicePlanName v --sku, který se má vypnout (lze opakovat)")
    a = ap.parse_args()

    L.assert_tenant()
    sub = L.graph("GET", "/subscribedSkus")["value"]
    skus = {s["skuId"]: s["skuPartNumber"] for s in sub}
    vypnout = []
    if a.vypnout_plan:
        s = next((s for s in sub if s["skuPartNumber"] == a.sku), None)
        plany = {p["servicePlanName"]: p["servicePlanId"] for p in (s or {}).get("servicePlans", [])}
        chybi = [p for p in a.vypnout_plan if p not in plany]
        if chybi:
            raise SystemExit(f"plán {', '.join(chybi)} v {a.sku} není")
        vypnout = [plany[p] for p in a.vypnout_plan]
    if not a.stav and not a.jen_odebrat:
        # volná místa ověř předem, ať se nepřidělí jen část účtů
        s = next((s for s in sub if s["skuPartNumber"] == a.sku), None)
        if not s:
            raise SystemExit(f"SKU {a.sku} v tenantu není")
        volne = s["prepaidUnits"]["enabled"] - s["consumedUnits"]
        treba = 0
        for alias in L.vyber_ucty(a.ucty):
            u = L.najdi_uzivatele(alias)
            if u and s["skuId"] not in {x["skuId"] for x in u["assignedLicenses"]}:
                treba += 1
        print(f"{a.sku}: volných {volne}, potřeba {treba}")
        if treba > volne:
            raise SystemExit(f"málo licencí {a.sku}: volných {volne}, potřeba {treba} — nic nepřiděleno")
    for alias in L.vyber_ucty(a.ucty):
        u = L.najdi_uzivatele(alias)
        if not u:
            print("chybí účet:", alias)
            continue
        mam = {skus.get(x["skuId"], x["skuId"]) for x in u["assignedLicenses"]}
        if a.stav:
            print(f"{alias}: {', '.join(sorted(mam)) or '—'}")
            continue
        add, rem = [], []
        if a.jen_odebrat:
            if a.jen_odebrat in mam:
                rem.append(L.sku_id(a.jen_odebrat))
        else:
            if a.sku not in mam:
                add.append({"skuId": L.sku_id(a.sku), "disabledPlans": vypnout})
            if a.remove_sku and a.remove_sku in mam:
                rem.append(L.sku_id(a.remove_sku))
        if not add and not rem:
            print(f"{alias}: beze změny ({', '.join(sorted(mam))})")
            continue
        L.graph("PATCH", f"/users/{u['id']}", {"usageLocation": "CZ"})
        L.graph("POST", f"/users/{u['id']}/assignLicense", {"addLicenses": add, "removeLicenses": rem})
        print(f"{alias}: +{a.sku if add else '—'} −{a.jen_odebrat or a.remove_sku if rem else '—'}")


if __name__ == "__main__":
    main()
