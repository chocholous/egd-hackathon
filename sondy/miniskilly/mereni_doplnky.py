#!/usr/bin/env python3
"""Doplňková měření pro egd-data-seznamy (audit 22. 11.): řazení Created/Modified/ID, AuthorId nad 5000,
index pod rolí Člen (jakub.kucera) a Návštěvník (karolina.mala). Výstup JSON řádky na stdout.
Web /sites/egd-sonda-miniskilly, seznamy Pozadavky (6000+, index Stav a Author) a IndexTest (6009)."""
import json, os, subprocess, sys, time, urllib.parse, urllib.request, urllib.error

W = "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-miniskilly"
ROOT = os.path.dirname(os.path.abspath(__file__)) + "/../.."
TOK = {}


def tok(who):
    if who not in TOK:
        if who == "admin":
            r = subprocess.run(["m365", "util", "accesstoken", "get", "--resource", "https://pavelchocholousgmail.sharepoint.com"],
                               capture_output=True, text=True, env={**os.environ, "HOME": os.path.expanduser("~/.m365-osobni")})
            TOK[who] = r.stdout.strip().strip('"')
        else:
            r = subprocess.run([sys.executable, ROOT + "/tools/data-prava-token.py", who], capture_output=True, text=True)
            TOK[who] = r.stdout.strip()
    return TOK[who]


def req(who, method, path, body=None, extra=None):
    url = urllib.parse.quote(W + path, safe=":/?&=$,()'|@%")
    h = {"Authorization": "Bearer " + tok(who), "Accept": "application/json;odata=nometadata"}
    data = None
    if body is not None:
        h["Content-Type"] = "application/json;odata=nometadata"; data = json.dumps(body).encode()
    h.update(extra or {})
    t = time.time()
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data, h, method=method)) as r:
            txt = r.read().decode(); s = r.status
    except urllib.error.HTTPError as e:
        txt = e.read().decode(); s = e.code
    try: j = json.loads(txt) if txt else {}
    except Exception: j = txt
    return s, j, round(time.time() - t, 2)


def err(j):
    if isinstance(j, dict) and ("odata.error" in j or "error" in j):
        e = j.get("odata.error") or j.get("error"); m = e.get("message"); m = m.get("value") if isinstance(m, dict) else m
        return (e.get("code", "") + " " + (m or ""))[:160]
    return ""


def out(**k): print(json.dumps(k, ensure_ascii=False), flush=True)


P = "/_api/web/lists/getbytitle('Pozadavky')"
IT = "/_api/web/lists/getbytitle('IndexTest')"

# 1) řazení
for who in ("admin",):
    for ob in ("Created desc", "Modified desc", "ID desc"):
        s, j, sec = req(who, "GET", f"{P}/items?$select=Id,Created&$top=3&$orderby={ob}")
        out(krok="razeni", seznam="Pozadavky", orderby=ob, who=who, status=s, sec=sec, err=err(j),
            prvni=[(x["Id"], x["Created"]) for x in j.get("value", [])] if s == 200 else None)
# ID desc = nejnovější první: Created u ID desc musí být neklesající s rostoucím ID (posledních 50)
s, j, _ = req("admin", "GET", f"{P}/items?$select=Id,Created&$top=50&$orderby=ID desc")
v = j.get("value", [])
out(krok="ID desc vs Created", n=len(v), poradi_sedi=all(v[i]["Created"] >= v[i + 1]["Created"] for i in range(len(v) - 1)))

# 2) AuthorId nad 5000
s, j, _ = req("admin", "GET", "/_api/web/currentuser?$select=Id"); admin_id = j["Id"]
s, j, _ = req("jakub.kucera", "GET", "/_api/web/currentuser?$select=Id"); jakub_id = j.get("Id")
out(krok="ucty", admin_id=admin_id, jakub_id=jakub_id, jakub_status=s)
s, j, sec = req("jakub.kucera", "POST", f"{P}/items", {"Title": "Požadavek Jakuba (měření)", "Popis": "AuthorId nad 5000", "Stav": "Nový"})
out(krok="jakub (Člen) přidá položku", status=s, sec=sec, err=err(j))
for who, uid in (("admin", admin_id), ("jakub.kucera", jakub_id)):
    s, j, sec = req(who, "GET", f"{P}/items?$select=Id&$top=1000&$orderby=ID desc&$filter=AuthorId eq {uid}")
    out(krok="AuthorId eq já (index Author)", who=who, status=s, sec=sec, n=len(j.get("value", [])) if s == 200 else None, err=err(j))
s, j, sec = req("admin", "GET", f"{P}/items?$select=Id&$top=1000&$filter=Stav eq 'Nový' and AuthorId eq {admin_id}")
out(krok="Stav eq Nový and AuthorId eq admin", status=s, sec=sec, n=len(j.get("value", [])) if s == 200 else None, err=err(j))

# 3) index pod rolí Člen a Návštěvník (sloupec T10 na IndexTest, pak vrátit)
for who in ("jakub.kucera", "karolina.mala"):
    s, j, sec = req(who, "POST", f"{IT}/fields/getbyinternalnameortitle('_x0054_10')", {"Indexed": True},
                    {"IF-MATCH": "*", "X-HTTP-Method": "MERGE"})
    out(krok="index pod rolí", who=who, role={"jakub.kucera": "Člen", "karolina.mala": "Návštěvník"}[who], status=s, sec=sec, err=err(j))
    s2, j2, _ = req("admin", "GET", f"{IT}/fields/getbyinternalnameortitle('_x0054_10')?$select=Indexed")
    out(krok="kontrola", indexed=j2.get("Indexed"))
    if j2.get("Indexed"):
        req("admin", "POST", f"{IT}/fields/getbyinternalnameortitle('_x0054_10')", {"Indexed": False}, {"IF-MATCH": "*", "X-HTTP-Method": "MERGE"})
s, j, sec = req("karolina.mala", "POST", f"{P}/items", {"Title": "Návštěvník zkouší zápis"})
out(krok="Návštěvník přidá položku", status=s, sec=sec, err=err(j))
