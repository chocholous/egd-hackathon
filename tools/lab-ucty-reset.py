#!/usr/bin/env python3
"""Nastaví účastníkovi nové náhodné heslo a nový výdejní kód, zneplatní jeho přihlášení.

Použij, když se účet uvolní a dostane ho někdo jiný (předchozí držitel heslo zná), nebo
když heslo uniklo. Nové heslo jde jen do lab/ucastnici.secrets.json. Pak přegeneruj data
výdejní stránky: tools/lab-ucty-vydej.py (a přepublikuj, viz 08-ucty-ucastniku.md).

Použití:
  tools/lab-ucty-reset.py --ucty 3          # egd03
  tools/lab-ucty-reset.py --ucty egd03,egd07
  tools/lab-ucty-reset.py --vse             # všech 10 (např. po workshopu)
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lab_ucty_lib as L  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--ucty", help="čárkami oddělená čísla nebo aliasy")
    g.add_argument("--vse", action="store_true")
    ap.add_argument("--bez-kodu", action="store_true", help="výdejní kód ponechat")
    a = ap.parse_args()

    L.assert_tenant()
    sec = L.load_secrets()
    for alias in L.vyber_ucty(None if a.vse else a.ucty):
        u = L.najdi_uzivatele(alias)
        if not u:
            print("chybí:", alias)
            continue
        pw = L.heslo()
        L.graph("PATCH", f"/users/{u['id']}",
                {"passwordProfile": {"password": pw, "forceChangePasswordNextSignIn": False}})
        sec.setdefault("hesla", {})[L.upn(alias)] = pw
        if not a.bez_kodu:
            sec.setdefault("kody", {})[alias] = L.vydejni_kod()
        L.save_secrets(sec)
        L.graph("POST", f"/users/{u['id']}/revokeSignInSessions")
        print(f"{alias}: nové heslo{'' if a.bez_kodu else ' a kód'}, přihlášení zneplatněna")


if __name__ == "__main__":
    main()
