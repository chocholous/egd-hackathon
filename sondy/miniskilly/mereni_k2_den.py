#!/usr/bin/env python3
"""Bod 4 auditu (2. kolo): přesné počty hlasů za období na seznamu Spokojenost s indexem Den,
stránkování $top=1000 přes @odata.nextLink s hlavičkou OData-Version: 4.0 (jako SPFx configurations.v1).
Výstup JSON řádky (sondy/miniskilly/k2-den.jsonl)."""
import datetime, sys, os, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mereni_doplnky_lib import req, err, out, W  # noqa: E402

L = "/_api/web/lists/getbytitle('Spokojenost')"
s, j, _ = req("admin", "GET", f"{L}/fields/getbyinternalnameortitle('Den')?$select=Indexed")
out(krok="index Den", indexed=j.get("Indexed"))
s, j, _ = req("admin", "GET", f"{L}/ItemCount"); out(krok="ItemCount", n=j.get("value"))
dnes = datetime.date.today()
for dni in (7, 30, 49, 50, 51, 55):
    od = (dnes - datetime.timedelta(days=dni - 1)).isoformat()
    path = f"{L}/items?$select=Id&$top=1000&$orderby=ID desc&$filter=Den ge '{od}'"
    n = stranky = 0; status = None; e = ""; sec = 0.0
    while path:
        status, j, t = req("admin", "GET", path, extra={"OData-Version": "4.0"}); sec += t
        if status != 200:
            e = err(j); break
        n += len(j["value"]); stranky += 1
        nxt = j.get("@odata.nextLink")
        path = nxt[len(W):] if nxt else None
    out(krok="Den ge", dni=dni, od=od, status=status, n=n, stranky=stranky, sec=round(sec, 2), err=e)
