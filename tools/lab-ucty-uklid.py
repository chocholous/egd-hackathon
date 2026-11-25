#!/usr/bin/env python3
"""Po workshopu: zablokuje přihlášení účastnických účtů a vrátí lab do bezpečného stavu.

Výchozí běh (vratné kroky, nic nemaže):
  1. accountEnabled=false u egd01 … egd10 a zneplatnění jejich přihlášení,
  2. vrácení MFA výjimky (tools/lab-ucty-mfa.py --vratit),
  3. volitelně --odebrat-licence SKU (uvolní licence),
  4. volitelně --nova-hesla (přegeneruje hesla, ať stará z výdejní stránky nic neotevřou).
Weby egdNN-* ani účty NEMAŽE — to jen na výslovné ano; skript vypíše příkazy (--vypis-mazani).

Použití:
  tools/lab-ucty-uklid.py --dry-run
  tools/lab-ucty-uklid.py --nova-hesla --odebrat-licence SPE_E5
  tools/lab-ucty-uklid.py --odblokovat      # vrátí accountEnabled=true (omyl, další kolo)
  tools/lab-ucty-uklid.py --vypis-mazani    # jen vypíše příkazy pro trvalé smazání
"""
import argparse
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lab_ucty_lib as L  # noqa: E402

TOOLS = Path(__file__).resolve().parent


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--odebrat-licence", metavar="SKU")
    ap.add_argument("--nova-hesla", action="store_true")
    ap.add_argument("--odblokovat", action="store_true")
    ap.add_argument("--vypis-mazani", action="store_true")
    a = ap.parse_args()

    if a.vypis_mazani:
        print("# Trvalé smazání — spouštět jen po výslovném ano Pavla:")
        for alias in L.ucty():
            for env in L.PROSTREDI:
                print(f"HOME=~/.m365-osobni m365 spo site remove --url {L.web_url(alias, env)} --force")
            print(f"az rest --method delete --url https://graph.microsoft.com/v1.0/users/{L.upn(alias)}")
        print("# skupina: az rest --method delete --url https://graph.microsoft.com/v1.0/groups/<skupinaId ze secrets>")
        return

    L.assert_tenant()
    for alias in L.ucty():
        u = L.najdi_uzivatele(alias)
        if not u:
            print("chybí:", alias)
            continue
        cil = bool(a.odblokovat)
        if a.dry_run:
            print(f"{alias}: accountEnabled → {cil}")
            continue
        L.graph("PATCH", f"/users/{u['id']}", {"accountEnabled": cil})
        if not cil:
            L.graph("POST", f"/users/{u['id']}/revokeSignInSessions")
        print(f"{alias}: {'odblokován' if cil else 'zablokován, přihlášení zneplatněna'}")
    if a.dry_run or a.odblokovat:
        return
    subprocess.run([sys.executable, str(TOOLS / "lab-ucty-mfa.py"), "--vratit"], check=True)
    if a.nova_hesla:
        subprocess.run([sys.executable, str(TOOLS / "lab-ucty-reset.py"), "--vse"], check=True)
    if a.odebrat_licence:
        subprocess.run([sys.executable, str(TOOLS / "lab-ucty-licence.py"), "--jen-odebrat", a.odebrat_licence],
                       check=True)
    print("hotovo; weby a účty zůstaly (mazání: --vypis-mazani)")


if __name__ == "__main__":
    main()
