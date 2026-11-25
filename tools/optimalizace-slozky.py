#!/usr/bin/env python3
"""Sonda složek: dělí složka seznam tak, že limit 5000 platí jen na obsah jedné složky? (seznam Slozky: 3 složky S1..S3 po ~2400 položkách)

Měří dotazy nad celým seznamem (rekurzivně) a nad jednou složkou (RootFolder / FolderServerRelativeUrl), s indexovaným i neindexovaným
filtrem a řazením. Výstup JSON řádky. Seznam založ a naplň: optimalizace-setup.py create --list Slozky --folders 3; fill --list Slozky --count 7200 --folders 3
"""
import argparse, json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import optimalizace_lib as L
p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
p.add_argument("--list", default="Slozky"); p.add_argument("--who", default=None)
a = p.parse_args()
LP = L.list_path(a.list); ROOT = f"/sites/egd-sonda-optimalizace/Lists/{a.list}"
R = LP + "/RenderListDataAsStream"
G = LP + "/GetItems?$select=Id"
N1 = "<Where><Eq><FieldRef Name='Neindexovano'/><Value Type='Text'>N1</Value></Eq></Where>"
K1 = "<Where><Eq><FieldRef Name='Kategorie'/><Value Type='Text'>K01</Value></Eq></Where>"
OB = "<OrderBy><FieldRef Name='Created' Ascending='FALSE'/></OrderBy>"

s, j, _ = L.req("GET", LP + "?$select=ItemCount", who=a.who); L.out(test="ItemCount_seznamu_(vcetne_slozek_a_polozek_ve_slozkach)", ItemCount=j["ItemCount"])
for f in ("S1", "S2", "S3"):
    s, j, _ = L.req("GET", f"/_api/web/GetFolderByServerRelativeUrl('{ROOT}/{f}')?$select=ItemCount,Name", who=a.who); L.out(test=f"Folder_{f}_ItemCount", ItemCount=j.get("ItemCount"))


def caml(name, view, folder=None, scope=None):
    q = {"ViewXml": view}
    if folder: q["FolderServerRelativeUrl"] = folder
    s, j, t = L.req("POST", G, {"query": q}, who=a.who)
    L.out(test="GetItems_" + name, status=s, sec=t, rows=len(j["value"]) if s == 200 else None, chyba=None if s == 200 else L.err(j, 100))


def rl(name, view, folder=None):
    url = R + (f"?RootFolder={ROOT}/{folder}" if folder else "")
    s, j, t = L.req("POST", url, {"parameters": {"RenderOptions": 2, "ViewXml": view}}, who=a.who)
    L.out(test="RLDAS_" + name, status=s, sec=t, rows=len(j["Row"]) if s == 200 else None, chyba=None if s == 200 else L.err(j, 100))


for lab, folder in (("koren_(slozky)", None), ("slozka_S1", f"{ROOT}/S1")):
    caml(f"{lab}_RowLimit_5000", "<View><RowLimit>5000</RowLimit></View>", folder)
    caml(f"{lab}_neindexovany_filtr", f"<View><Query>{N1}</Query><RowLimit>100</RowLimit></View>", folder)
    caml(f"{lab}_neindexovany_filtr_+_orderby_Created", f"<View><Query>{N1}{OB}</Query><RowLimit>100</RowLimit></View>", folder)
    caml(f"{lab}_orderby_Created", f"<View><Query>{OB}</Query><RowLimit>100</RowLimit></View>", folder)
caml("rekurzivne_Scope_RecursiveAll_RowLimit_5000", '<View Scope="RecursiveAll"><RowLimit>5000</RowLimit></View>')
caml("rekurzivne_Scope_RecursiveAll_neindexovany_filtr", f'<View Scope="RecursiveAll"><Query>{N1}</Query><RowLimit>100</RowLimit></View>')
caml("rekurzivne_Scope_RecursiveAll_indexovany_filtr", f'<View Scope="RecursiveAll"><Query>{K1}</Query><RowLimit>100</RowLimit></View>')
caml("rekurzivne_Scope_RecursiveAll_orderby_Created", f'<View Scope="RecursiveAll"><Query>{OB}</Query><RowLimit>100</RowLimit></View>')
caml("slozka_S1_Scope_RecursiveAll_neindexovany_filtr", f'<View Scope="RecursiveAll"><Query>{N1}</Query><RowLimit>100</RowLimit></View>', f"{ROOT}/S1")
rl("slozka_S1_RowLimit_2000", "<View><RowLimit>2000</RowLimit></View>", "S1")
rl("slozka_S1_neindexovany_filtr_+_orderby_Created", f"<View><Query>{N1}{OB}</Query><RowLimit>100</RowLimit></View>", "S1")
rl("rekurzivne_neindexovany_filtr_+_orderby_Created", f'<View Scope="RecursiveAll"><Query>{N1}{OB}</Query><RowLimit>100</RowLimit></View>')
# REST: položky jedné složky přes FileDirRef (neindexovaný) a přes složku
s, j, t = L.req("GET", f"{LP}/items?$select=Id&$filter=FileDirRef eq '{ROOT}/S1'&$top=100", who=a.who); L.out(test="REST_filter_FileDirRef_slozka_S1", status=s, sec=t, rows=len(j["value"]) if s == 200 else None, chyba=None if s == 200 else L.err(j, 100))
s, j, t = L.req("GET", f"/_api/web/GetFolderByServerRelativeUrl('{ROOT}/S1')/Folders?$select=Name", who=a.who); L.out(test="REST_podslozky_S1", status=s, sec=t)
