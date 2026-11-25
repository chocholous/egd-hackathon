#!/usr/bin/env python3
"""Sonda SharePoint Search (/_api/search/query) nad velkým seznamem: počet, stránkování, filtr přes managed properties, řazení, refinery, práva.

Podpříkazy:
  dotazy   TotalRows seznamu, stránkování po 500 (startrow), filtr KategorieOWSTEXT / CastkaOWSNMBR, řazení, refinery
  prava    security trimming: stejný dotaz pod adminem (vlastník), členy webu (tomas, jakub) a uživatelem bez přístupu (lucie)
  schema   výpis crawled/managed properties vytvořených ze sloupců seznamu (lze-li je dotazem zjistit)
Výstup JSON řádky. Předpoklad: web a seznamy jsou už v indexu (viz optimalizace-search-lag.py). Jen lab.
"""
import argparse, json, os, sys, time, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import optimalizace_lib as L
p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
p.add_argument("cmd", choices="dotazy prava schema".split()); p.add_argument("--list", default="Velky"); p.add_argument("--lists", default="Zadosti"); p.add_argument("--kat", default="K01", help="hodnota Kategorie pro filtr"); p.add_argument("--castka", default="990", help="práh Castka pro rozsahový dotaz")
a = p.parse_args()
PATH = f'path:"{L.WEB}/Lists/{a.list}"'


def q(name, text, who=None, rows=10, start=0, select="Title,Path", extra=""):
    url = f"/_api/search/query?querytext='{text}'&rowlimit={rows}&startrow={start}&selectproperties='{select}'&trimduplicates=false{extra}"
    s, j, t = L.req("GET", url, who=who)
    r = {"test": name, "status": s, "sec": t}
    if s == 200:
        rr = j["PrimaryQueryResult"]["RelevantResults"]
        r["TotalRows"] = rr["TotalRows"]; r["TotalRowsIncludingDuplicates"] = rr.get("TotalRowsIncludingDuplicates"); r["vraceno"] = rr["RowCount"]
        rows_ = [{c["Key"]: c["Value"] for c in x["Cells"]} for x in rr["Table"]["Rows"]]
        r["prvni"] = [{k: v for k, v in x.items() if k in select.split(",") and k != "Path"} for x in rows_[:2]]
        ref = (j["PrimaryQueryResult"].get("RefinementResults") or {}).get("Refiners")
        if ref: r["refinery"] = [(x["Name"], [(e["RefinementName"], e["RefinementCount"]) for e in x["Entries"][:6]]) for x in ref]
        r["_rows"] = rows_
    else: r["chyba"] = L.err(j, 200)
    return r


def pr(r):
    r = dict(r); r.pop("_rows", None); L.out(**r)


def dotazy():
    pr(q("TotalRows_seznamu", PATH, rows=1))
    pr(q(f"Kategorie={a.kat} (KategorieOWSTEXT)", PATH + f" KategorieOWSTEXT:{a.kat}", rows=1, select="Title,KategorieOWSTEXT,CastkaOWSNMBR"))
    pr(q(f"Castka>={a.castka} (CastkaOWSNMBR)", PATH + f" CastkaOWSNMBR>={a.castka}", rows=3, select="Title,CastkaOWSNMBR"))
    pr(q("Neindexovano=N1 (NeindexovanoOWSTEXT)", PATH + " NeindexovanoOWSTEXT:N1", rows=1, select="Title,NeindexovanoOWSTEXT"))
    pr(q(f"kombinace Kategorie={a.kat} AND Castka={a.castka}", PATH + f" KategorieOWSTEXT:{a.kat} AND CastkaOWSNMBR:{a.castka}", rows=1, select="Title"))
    pr(q("fulltext_Polozka 4588", PATH + " Polozka 4588", rows=3))
    pr(q("Castka=4588 (CastkaOWSNMBR)", PATH + " CastkaOWSNMBR=4588", rows=3, select="Title,CastkaOWSNMBR"))
    pr(q("Castka<=5 (CastkaOWSNMBR)", PATH + " CastkaOWSNMBR<=5", rows=3, select="Title,CastkaOWSNMBR"))
    t0, tot, n = time.perf_counter(), None, 0
    for start in range(0, 60000, 500):
        r = q("stranka", PATH, rows=500, start=start)
        if r["status"] != 200: pr({**r, "test": f"stranka startrow={start}"}); break
        tot = r["TotalRows"]; n += r["vraceno"]
        if r["vraceno"] < 500: break
    L.out(test="stranky_po_500_startrow_0_az_konec", TotalRows=tot, stazeno=n, sec=round(time.perf_counter() - t0, 2))
    for st in (5000, 5500, 49500, 50500):
        pr(q(f"startrow={st}", PATH, rows=10, start=st))
    pr(q("rowlimit=1000", PATH, rows=1000))
    pr(q("sort_CastkaOWSNMBR_desc", PATH, rows=3, select="Title,CastkaOWSNMBR", extra="&sortlist='CastkaOWSNMBR:descending'"))
    pr(q("sort_Created_desc", PATH, rows=3, select="Title,Created", extra="&sortlist='Created:descending'"))
    pr(q("sort_LastModifiedTime_desc", PATH, rows=3, select="Title,LastModifiedTime", extra="&sortlist='LastModifiedTime:descending'"))
    pr(q("sort_Title_asc", PATH, rows=3, select="Title", extra="&sortlist='Title:ascending'"))
    for ref in ("KategorieOWSTEXT", "CastkaOWSNMBR", "Author", "ContentTypeId", "FileType", "LastModifiedTime", "RefinableString00"):
        pr(q(f"refiner_{ref}", PATH, rows=1, extra=f"&refiners='{ref}'"))


def prava():
    """Security trimming: stejný dotaz (cesta seznamu) pod různými uživateli. Seznamy přes --lists (výchozí Zadosti)."""
    for who in (None, "tomas.prochazka", "jakub.kucera", "eva.vesela", "petra.novakova", "lucie.dvorakova"):
        for lst in a.lists.split(","):
            r = q(f"{who or 'admin'}__{lst}", f'path:"{L.WEB}/Lists/{lst}"', who=who, rows=500, select="Title,Author")
            L.out(**{k: v for k, v in r.items() if k not in ("_rows", "prvni")}, autori=sorted({x.get("Author") for x in r.get("_rows", [])}))


def schema():
    r = q("zakladni_props_polozky", PATH, rows=1, select="Title,KategorieOWSTEXT,CastkaOWSNMBR,StavOWSTEXT,DatumOWSDATE,NeindexovanoOWSTEXT,ListItemID,ListID,Created,Modified,ContentTypeId")
    L.out(test="sloupce_z_prvniho_radku", status=r["status"], radek=r.get("_rows", [None])[0])


{"dotazy": dotazy, "prava": prava, "schema": schema}[a.cmd]()
