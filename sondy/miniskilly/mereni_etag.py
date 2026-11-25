#!/usr/bin/env python3
"""Galík 1.3: souběžná editace jedné položky dvěma uživateli (A, B) přes SP REST, jako SPFx.
Seznam `SoubeznaEditace` na webu miniskilly (založí ho admin, pokud chybí; Spokojenost se nemění).
Scénář: A i B načtou položku (oba vidí ETag), A uloží změnu, pak B uloží svou:
  1) B s `IF-MATCH: *` (jako šablona)   → očekávání: 204, A-ho změna tiše ztracena
  2) B s ETagem z načtení               → očekávání: 412, A-ho změna zůstane; B načte znovu a uloží → 204
Výstup JSON řádky: sondy/miniskilly/etag.jsonl
Použití: mereni_etag.py <upnA> <upnB> [název scénáře …]
  3) B s `*`, ale posílá jen pole, která změnil → A-ho změna jiného pole přežije (stejné pole ne)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mereni_doplnky_lib import req, err, out  # noqa: E402

A, B = sys.argv[1], sys.argv[2]
L = "/_api/web/lists/getbytitle('SoubeznaEditace')"
s, j, _ = req("admin", "GET", L + "?$select=Id")
if s == 404:
    s, j, _ = req("admin", "POST", "/_api/web/lists", {"Title": "SoubeznaEditace", "BaseTemplate": 100})
    out(krok="zalozen seznam", status=s, err=err(j))
    for f in ("Popis", "Stav"):
        s, j, _ = req("admin", "POST", L + "/fields", {"Title": f, "FieldTypeKind": 2})
        out(krok="sloupec", pole=f, status=s, err=err(j))


def nacti(who, iid):
    s, j, _ = req(who, "GET", f"{L}/items({iid})?$select=Id,Title,Popis,Stav,Editor/Title&$expand=Editor",
                  extra={"OData-Version": "4.0"})
    return s, j


def uloz(who, iid, data, ifmatch):
    s, j, _ = req(who, "POST", f"{L}/items({iid})", data, extra={"IF-MATCH": ifmatch, "X-HTTP-Method": "MERGE"})
    return s, err(j)


SCEN = (("IF-MATCH *", "*"), ("ETag", None), ("IF-MATCH * jen zmenene pole", "*"))
vyber = sys.argv[3:]  # volitelně názvy scénářů
for scen, b_ifmatch in [x for x in SCEN if not vyber or x[0] in vyber]:
    s, j, _ = req("admin", "POST", L + "/items", {"Title": f"Žádost {scen}", "Popis": "puvodni", "Stav": "Nova"})
    iid = j.get("Id"); out(scen=scen, krok="nova polozka", status=s, id=iid, err=err(j))
    sa, ja = nacti(A, iid); sb, jb = nacti(B, iid)
    out(scen=scen, krok="nacteni", A=sa, etagA=ja.get("@odata.etag"), B=sb, etagB=jb.get("@odata.etag"))
    s, e = uloz(A, iid, {"Stav": "Schvaleno"}, ja.get("@odata.etag"))
    out(scen=scen, krok="A uklada Stav=Schvaleno", ifmatch=ja.get("@odata.etag"), status=s, err=e)
    # B ve formuláři změnil Popis, ale posílá celý formulář včetně starého Stavu (jak to dělá appka s formulářem)
    data_b = {"Popis": "doplneno B"} if "jen zmenene" in scen else {"Popis": "doplneno B", "Stav": jb.get("Stav")}
    s, e = uloz(B, iid, data_b, b_ifmatch or jb.get("@odata.etag"))
    out(scen=scen, krok="B uklada " + ("jen Popis" if "jen zmenene" in scen else "Popis + starý Stav"), ifmatch=b_ifmatch or jb.get("@odata.etag"), status=s, err=e)
    if s == 412:
        s2, jb2 = nacti(B, iid)
        out(scen=scen, krok="B nacita znovu", status=s2, etag=jb2.get("@odata.etag"), Stav=jb2.get("Stav"))
        s, e = uloz(B, iid, {"Popis": "doplneno B", "Stav": jb2.get("Stav")}, jb2.get("@odata.etag"))
        out(scen=scen, krok="B uklada znovu s novym ETagem", status=s, err=e)
    s, j = nacti("admin", iid)
    out(scen=scen, krok="vysledek", Popis=j.get("Popis"), Stav=j.get("Stav"), naposledy=(j.get("Editor") or {}).get("Title"),
        etag=j.get("@odata.etag"), zmena_A_prezila=j.get("Stav") == "Schvaleno")
