#!/usr/bin/env python3
"""Sonda souhrnného seznamu (čítač): lze počty/součty držet v malém seznamu 'Soucty' a aktualizovat je při každém zápisu?

Měří souběžné navýšení čítače N vlákny: (a) naivně read-modify-write s IF-MATCH:* (ztráty), (b) s ETagem a opakováním při 409/412/500.
Seznam Soucty (Title, Pocet:číslo) a položka čítače se zakládají, pokud chybí. Jen lab, nic nemaže.
"""
import argparse, concurrent.futures as cf, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import optimalizace_lib as L
p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
p.add_argument("--n", type=int, default=20); p.add_argument("--threads", type=int, default=8)
a = p.parse_args()
LP = L.list_path("Soucty")
s, _, _ = L.req("GET", LP + "?$select=Id")
if s != 200:
    L.req("POST", "/_api/web/lists", {"BaseTemplate": 100, "Title": "Soucty"})
    L.req("POST", LP + "/fields/createfieldasxml", {"parameters": {"SchemaXml": '<Field Type="Number" DisplayName="Pocet" Name="Pocet" StaticName="Pocet" />', "Options": 8}})


def new_counter(name):
    s, j, _ = L.req("POST", LP + "/items", {"Title": name, "Pocet": 0}); return j["Id"]


def naive(i):
    s, j, _ = L.req("GET", f"{LP}/items({i})?$select=Pocet"); v = j["Pocet"]
    s, j, _ = L.req("POST", f"{LP}/items({i})", {"Pocet": v + 1}, headers={"IF-MATCH": "*", "X-HTTP-Method": "MERGE"}); return s


def etag(i):
    """Vrací počet neúspěšných pokusů (409 save conflict, 412 ETag, 500 při souběhu) před úspěchem; -1 = vzdáno."""
    for pokus in range(80):
        s, j, _ = L.req("GET", f"{LP}/items({i})?$select=Pocet", verbose=True); v = j["d"]["Pocet"]; et = j["d"]["__metadata"]["etag"]
        s, j, _ = L.req("POST", f"{LP}/items({i})", {"Pocet": v + 1}, headers={"IF-MATCH": et, "X-HTTP-Method": "MERGE"})
        if s in (200, 204): return pokus
        if s not in (409, 412, 500): return -1
    return -1


for name, fn in (("naivni_IF-MATCH_*", naive), ("ETag_a_opakovani_pri_412", etag)):
    cid = new_counter(name)
    with cf.ThreadPoolExecutor(a.threads) as ex: res = list(ex.map(lambda _: fn(cid), range(a.n)))
    s, j, _ = L.req("GET", f"{LP}/items({cid})?$select=Pocet")
    L.out(test=name, pozadovano=a.n, vysledna_hodnota=j["Pocet"], ztraceno=a.n - j["Pocet"], neuspesne_pokusy_celkem=sum(r for r in res if r > 0) if fn is etag else None, vzdano=sum(1 for r in res if r < 0) if fn is etag else None)
