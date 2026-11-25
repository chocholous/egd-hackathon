#!/usr/bin/env python3
"""Založí účty účastníků workshopu EG.D (egd01 … egd10) a bezpečnostní skupinu „EGD workshop účastníci“.

Idempotentní: existující účty přeskočí (heslo nemění — na to je lab-ucty-reset.py).
Bez admin rolí, usageLocation CZ, bez vynucené změny hesla (zdůvodnění v 08-ucty-ucastniku.md).
Hesla jdou jen do lab/ucastnici.secrets.json (0600), na výstup se nevypisují.
Licence řeší lab-ucty-licence.py, weby lab-ucty-weby.py.

Použití:
  tools/lab-ucty-zalozit.py              # všech 10
  tools/lab-ucty-zalozit.py --ucty 1,2   # jen egd01, egd02
  tools/lab-ucty-zalozit.py --dry-run
Proměnné EGD_LAB_* viz tools/lab_ucty_lib.py.
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lab_ucty_lib as L  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--ucty", help="čárkami oddělená čísla nebo aliasy (výchozí všechny)")
    ap.add_argument("--dry-run", action="store_true", help="jen vypiš, co by se udělalo")
    a = ap.parse_args()

    L.assert_tenant()
    sec = L.load_secrets()
    hesla = sec.setdefault("hesla", {})

    g = L.najdi_skupinu()
    if not g:
        if a.dry_run:
            print("založil bych skupinu:", L.SKUPINA)
        else:
            g = L.graph("POST", "/groups", {
                "displayName": L.SKUPINA, "description": "Lab účty účastníků workshopu EG.D 25. 11. 2026",
                "mailEnabled": False, "mailNickname": f"{L.PREFIX}-workshop-ucastnici", "securityEnabled": True})
            sec["skupinaId"] = g["id"]
            L.save_secrets(sec)
            print("skupina založena:", L.SKUPINA)
    if g and not a.dry_run and sec.get("skupinaId") != g["id"]:
        sec["skupinaId"] = g["id"]
    clenove = set()
    if g:
        clenove = {m["id"] for m in L.graph("GET", f"/groups/{g['id']}/members?$select=id&$top=999")["value"]}

    for alias in L.vyber_ucty(a.ucty):
        p = L.upn(alias)
        u = L.najdi_uzivatele(alias)
        if not u:
            if a.dry_run:
                print("založil bych:", p)
                continue
            pw = L.heslo()
            cislo = alias[len(L.PREFIX):]
            u = L.graph("POST", "/users", {
                "accountEnabled": True,
                "displayName": f"Účastník {cislo}",
                "givenName": "Účastník", "surname": cislo,
                "mailNickname": alias, "userPrincipalName": p, "usageLocation": "CZ",
                "jobTitle": "Účastník workshopu EG.D", "department": "EG.D workshop",
                "passwordProfile": {"password": pw, "forceChangePasswordNextSignIn": False},
            })
            hesla[p] = pw
            L.save_secrets(sec)
            print("založen:", p)
        else:
            if p not in hesla:
                print(f"POZOR: {p} existuje, ale heslo v secrets chybí → tools/lab-ucty-reset.py --ucty {alias}")
            else:
                print("existuje:", p)
        if g and u["id"] not in clenove and not a.dry_run:
            L.graph("POST", f"/groups/{g['id']}/members/$ref",
                    {"@odata.id": f"{L.GRAPH}/directoryObjects/{u['id']}"})
            print("  přidán do skupiny")
    if not a.dry_run:
        L.save_secrets(sec)
    print("hotovo; hesla v", L.SECRETS)


if __name__ == "__main__":
    main()
