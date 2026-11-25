#!/usr/bin/env python3
"""Vyjme skupinu „EGD workshop účastníci“ z CA politiky „LAB baseline: MFA all users“, nebo výjimku vrátí.

Bez výjimky musí každý účastník při prvním přihlášení zaregistrovat MFA (Authenticator) — na
workshopu by to stálo čas. Mění JEN pole excludeGroups této jedné politiky (o skupinu účastníků);
ostatní výjimky a nastavení nechává. Politika „block legacy auth“ platí dál.

Použití:
  tools/lab-ucty-mfa.py --stav
  tools/lab-ucty-mfa.py --vyjmout       # před workshopem
  tools/lab-ucty-mfa.py --vratit        # po workshopu (volá i lab-ucty-uklid.py)
"""
import argparse
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lab_ucty_lib as L  # noqa: E402

POLITIKA = os.environ.get("EGD_LAB_MFA_POLITIKA", "LAB baseline: MFA all users")


def najdi_politiku() -> dict:
    vse = L.graph("GET", "/identity/conditionalAccess/policies")["value"]
    p = [x for x in vse if x["displayName"] == POLITIKA]
    if len(p) != 1:
        raise SystemExit(f"politika „{POLITIKA}“ nalezena {len(p)}×")
    return p[0]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--stav", action="store_true")
    g.add_argument("--vyjmout", action="store_true")
    g.add_argument("--vratit", action="store_true")
    a = ap.parse_args()

    L.assert_tenant()
    sk = L.najdi_skupinu()
    if not sk:
        raise SystemExit("skupina účastníků neexistuje (tools/lab-ucty-zalozit.py)")
    p = najdi_politiku()
    ex = list(p["conditions"]["users"].get("excludeGroups") or [])
    je = sk["id"] in ex
    print(f"politika „{POLITIKA}“ ({p['state']}): skupina účastníků {'JE' if je else 'NENÍ'} vyjmutá")
    if a.stav:
        return
    if a.vyjmout and not je:
        ex.append(sk["id"])
    elif a.vratit and je:
        ex.remove(sk["id"])
    else:
        print("beze změny")
        return
    L.graph("PATCH", f"/identity/conditionalAccess/policies/{p['id']}",
            {"conditions": {"users": {"excludeGroups": ex}}})
    p = najdi_politiku()
    je = sk["id"] in (p["conditions"]["users"].get("excludeGroups") or [])
    print(f"po změně: skupina účastníků {'JE' if je else 'NENÍ'} vyjmutá")


if __name__ == "__main__":
    main()
