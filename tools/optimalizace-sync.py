#!/usr/bin/env python3
"""Inkrementální synchronizace seznamu do lokální cache (vzor pro SPFx appku: IndexedDB / localStorage) přes změnové tokeny.

Postup (stejný, který by dělal prohlížeč):
  1. první načtení: přečti CurrentChangeToken (PŘED čtením), pak všechny položky paralelně po rozsazích ID (indexovaný sloupec ID),
     ulož {token, items} do cache souboru
  2. další načtení: GetChanges od uloženého tokenu (Add/Update/DeleteObject, po 1000 změnách na volání, další stránka od posledního tokenu),
     změněné ID dočti přes $filter=ID eq .. or ID eq .. a promítni do cache, smazané odstraň, ulož nový token
  3. --verify: znovu přečti celý seznam ze serveru a porovnej s cache (shoda ID a hodnot sloupců)
  --demo: mezi 1. a 2. krokem sám provede změny (3 nové položky, --upd úprav) v seznamu --list (jen lab, nic nemaže)
Výstup JSON řádky s časy. Cache soubor: --cache (výchozí v adresáři s dočasnými soubory).
"""
import argparse, concurrent.futures as cf, json, os, sys, tempfile, time, uuid
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import optimalizace_lib as L

p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
p.add_argument("--list", default="Velky"); p.add_argument("--cache", default=os.path.join(tempfile.gettempdir(), "optimalizace-cache.json"))
p.add_argument("--select", default="Id,Title,Kategorie,Castka,Stav,Neindexovano"); p.add_argument("--demo", action="store_true")
p.add_argument("--upd", type=int, default=5); p.add_argument("--verify", action="store_true"); p.add_argument("--reset", action="store_true")
a = p.parse_args()
LP = L.list_path(a.list)
COLS = a.select.split(",")


def read_range(lo, hi):
    s, j, t = L.req("GET", f"{LP}/items?$select={a.select}&$filter=ID ge {lo} and ID lt {hi}&$top=1000")
    assert s == 200, (s, L.err(j))
    return j["value"]


def read_all():
    s, j, _ = L.req("GET", f"{LP}/items?$select=Id&$orderby=ID desc&$top=1"); mx = j["value"][0]["Id"]
    with cf.ThreadPoolExecutor(8) as ex: parts = list(ex.map(lambda lo: read_range(lo, lo + 1000), range(1, mx + 1, 1000)))
    return {x["Id"]: {c: x.get(c) for c in COLS} for part in parts for x in part}


def token():
    s, j, _ = L.req("GET", f"{LP}?$select=CurrentChangeToken"); return j["CurrentChangeToken"]["StringValue"]


def full():
    t0 = time.perf_counter(); tk = token(); items = read_all()
    json.dump({"token": tk, "items": {str(k): v for k, v in items.items()}}, open(a.cache, "w"))
    L.out(krok="prvni_nacteni", polozek=len(items), sec=round(time.perf_counter() - t0, 2), bytes_cache=os.path.getsize(a.cache))


def incremental():
    t0 = time.perf_counter(); c = json.load(open(a.cache)); tk = c["token"]; items = {int(k): v for k, v in c["items"].items()}
    changed, deleted, calls = set(), set(), 0
    new_tk = tk
    while True:
        s, j, t = L.req("POST", LP + "/GetChanges", {"query": {"Add": True, "Update": True, "DeleteObject": True, "Item": True, "ChangeTokenStart": {"StringValue": new_tk}}})
        assert s == 200, (s, L.err(j)); calls += 1
        for ch in j["value"]:
            (deleted if ch["ChangeType"] == 3 else changed).add(ch["ItemId"])
        if len(j["value"]) < 1000: break
        new_tk = j["value"][-1]["ChangeToken"]["StringValue"]
    new_tk_end = token()
    t_changes = time.perf_counter() - t0
    ids = sorted(changed - deleted)
    for i in range(0, len(ids), 30):
        flt = " or ".join(f"ID eq {x}" for x in ids[i:i + 30])
        s, j, t = L.req("GET", f"{LP}/items?$select={a.select}&$filter={flt}&$top=100")
        assert s == 200, (s, L.err(j))
        for x in j["value"]: items[x["Id"]] = {cc: x.get(cc) for cc in COLS}
    for d in deleted: items.pop(d, None)
    json.dump({"token": new_tk_end, "items": {str(k): v for k, v in items.items()}}, open(a.cache, "w"))
    L.out(krok="inkrementalni_nacteni", zmen_zaznamu=len(changed) + len(deleted), volani_GetChanges=calls, sec_GetChanges=round(t_changes, 2), sec_celkem=round(time.perf_counter() - t0, 2), polozek_v_cache=len(items))


def demo():
    for k in range(3): L.req("POST", LP + "/items", {"Title": "sync-nova " + uuid.uuid4().hex[:4], "Kategorie": "K97", "Castka": k, "Stav": "Nový", "Neindexovano": "sync"})
    for i in range(100, 100 + a.upd): L.req("POST", f"{LP}/items({i})", {"Neindexovano": "sync-" + uuid.uuid4().hex[:4]}, headers={"IF-MATCH": "*", "X-HTTP-Method": "MERGE"})
    L.out(krok="demo_zmeny", nove=3, upravene=a.upd); time.sleep(3)


def verify():
    t0 = time.perf_counter(); srv = read_all(); c = json.load(open(a.cache))["items"]
    bad = [k for k, v in srv.items() if c.get(str(k)) != v]
    L.out(krok="overeni", server=len(srv), cache=len(c), neshod=len(bad) + len(set(map(int, c)) - set(srv)), sec=round(time.perf_counter() - t0, 2))


if a.reset or not os.path.exists(a.cache): full()
if a.demo: demo()
incremental()
if a.verify: verify()
