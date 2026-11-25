#!/usr/bin/env python3
"""Změří zpoždění SharePoint Search indexace: za jak dlouho se po zápisu objeví položka ve /_api/search/query.

Scénáře (každý s unikátním tokenem v Title, dotaz se opakuje po --interval s, max --timeout s):
  nova      přidání nové položky do seznamu --list
  uprava    změna Title existující položky (hledá se nový token)
  nova2     druhé přidání po tom, co web už je v indexu (ustálené zpoždění)
Navíc u každého dotazu loguje TotalRows pro cestu seznamu --progress-list (postup crawlu hromadně vložených položek).
Výstup: JSON řádky na stdout. Web: OPT_WEB (výchozí /sites/egd-sonda-optimalizace). Jen lab.
"""
import argparse, os, sys, time, uuid
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import optimalizace_lib as L

p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
p.add_argument("--list", default="Lag"); p.add_argument("--progress-list", default="Velky")
p.add_argument("--interval", type=int, default=10); p.add_argument("--timeout", type=int, default=3600)
p.add_argument("--who", default=None, help="UPN/alias uživatele pro dotaz (výchozí admin)")
a = p.parse_args()


def search(q, rows=5):
    s, j, t = L.req("GET", f"/_api/search/query?querytext='{q}'&rowlimit={rows}&trimduplicates=false&selectproperties='Title,Path'", who=a.who)
    if s != 200: return s, None, L.err(j), t
    rr = j["PrimaryQueryResult"]["RelevantResults"]
    return s, rr["TotalRows"], rr["Table"]["Rows"], t


def wait(token, label, t0):
    while time.time() - t0 < a.timeout:
        s, n, rows, t = search(token)
        _, nprog, _, _ = search(f'path:"{L.WEB}/Lists/{a.progress_list}"', 1)
        L.out(scenar=label, token=token, sec_od_zapisu=round(time.time() - t0), status=s, nalezeno=n, search_sec=t, velky_v_indexu=nprog)
        if s == 200 and n: return round(time.time() - t0)
        time.sleep(a.interval)
    return None


lp = L.list_path(a.list)
tok = "lagA" + uuid.uuid4().hex[:10]
s, j, _ = L.req("POST", lp + "/items", {"Title": tok}); t0 = time.time(); item = j["Id"]
L.out(zapis="nova", status=s, id=item, token=tok)
L.out(vysledek="nova", sec=wait(tok, "nova", t0))
tok2 = "lagB" + uuid.uuid4().hex[:10]
s, j, _ = L.req("POST", lp + f"/items({item})", {"Title": tok2}, headers={"IF-MATCH": "*", "X-HTTP-Method": "MERGE"}); t0 = time.time()
L.out(zapis="uprava", status=s, token=tok2)
L.out(vysledek="uprava", sec=wait(tok2, "uprava", t0))
tok3 = "lagC" + uuid.uuid4().hex[:10]
s, j, _ = L.req("POST", lp + "/items", {"Title": tok3}); t0 = time.time()
L.out(zapis="nova2", status=s, token=tok3)
L.out(vysledek="nova2", sec=wait(tok3, "nova2", t0))
