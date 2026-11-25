#!/usr/bin/env python3
"""Měření ke 2. kolu auditu egd-data-seznamy (22. 11.). Výstup JSON řádky (sondy/miniskilly/k2.jsonl).
1) index pod úrovní oprávnění Contribute (Přispívání): karolina.mala dostane DOČASNĚ Contribute na web,
   zkusí index na IndexTest _x0054_10, pak se přiřazení odebere (vrací stav).
2) REST cesty pro složený index: /FieldIndexes, /Indexes -> status.
3) řazení Modified desc / Created desc na IndexTest (Modified, Created bez indexu) a na Pozadavky.
Seznam Spokojenost se tu nemění (běží na něm e2e)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mereni_doplnky_lib import req, err, out  # noqa: E402

IT = "/_api/web/lists/getbytitle('IndexTest')"
P = "/_api/web/lists/getbytitle('Pozadavky')"
F = f"{IT}/fields/getbyinternalnameortitle('_x0054_10')"
MERGE = {"IF-MATCH": "*", "X-HTTP-Method": "MERGE"}

# 1) Contribute
s, j, _ = req("admin", "GET", "/_api/web/roledefinitions/getbytype(3)?$select=Id,Name,BasePermissions")
rid = j["Id"]; out(krok="roledef Contribute", status=s, id=rid, name=j.get("Name"))
s, j, _ = req("admin", "POST", "/_api/web/ensureuser", {"logonName": "i:0#.f|membership|karolina.mala@pavelchocholousgmail.onmicrosoft.com"})
pid = j["Id"]; out(krok="ensureuser karolina", status=s, id=pid)
s, j, _ = req("admin", "POST", f"/_api/web/roleassignments/addroleassignment(principalid={pid},roledefid={rid})")
out(krok="pridat Contribute na web", status=s, err=err(j))
try:
    s, j, _ = req("karolina.mala", "GET", f"{IT}/EffectiveBasePermissions")
    out(krok="karolina EffectiveBasePermissions na IndexTest", status=s, perm=j)
    s, j, sec = req("karolina.mala", "POST", f"{IT}/items", {"Title": "Contribute zkouší zápis"})
    out(krok="Contribute přidá položku", status=s, sec=sec, err=err(j))
    if s == 201:
        req("admin", "POST", f"{IT}/items({j['Id']})", None, {"IF-MATCH": "*", "X-HTTP-Method": "DELETE"})
    s, j, sec = req("karolina.mala", "POST", F, {"Indexed": True}, MERGE)
    out(krok="Contribute vytvoří index", status=s, sec=sec, err=err(j))
    s2, j2, _ = req("admin", "GET", f"{F}?$select=Indexed"); out(krok="kontrola", indexed=j2.get("Indexed"))
    if j2.get("Indexed"):
        req("admin", "POST", F, {"Indexed": False}, MERGE)
finally:
    s, j, _ = req("admin", "POST", f"/_api/web/roleassignments/removeroleassignment(principalid={pid},roledefid={rid})")
    out(krok="odebrat Contribute z webu", status=s, err=err(j))

# 2) REST složený index
for path in ("/FieldIndexes", "/Indexes"):
    s, j, _ = req("admin", "GET", IT + path)
    out(krok="REST slozeny index", path=path, status=s, err=err(j))

# 3) řazení
for lst, base in (("IndexTest", IT), ("Pozadavky", P)):
    s, j, _ = req("admin", "GET", f"{base}/fields?$select=InternalName,Indexed&$filter=InternalName eq 'Modified' or InternalName eq 'Created'")
    out(krok="indexy systémových polí", seznam=lst, pole=j.get("value"))
    s, j, _ = req("admin", "GET", f"{base}/ItemCount")
    out(krok="počet", seznam=lst, n=j.get("value"))
    for ob in ("Modified desc", "Created desc", "ID desc"):
        s, j, sec = req("admin", "GET", f"{base}/items?$select=Id&$top=100&$orderby={ob}")
        out(krok="razeni", seznam=lst, orderby=ob, status=s, sec=sec, err=err(j))
