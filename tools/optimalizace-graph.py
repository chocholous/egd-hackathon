#!/usr/bin/env python3
"""Sonda Microsoft Graph nad velkým seznamem: /sites/{id}/lists/{id}/items s $expand=fields, $filter, paging, delta, $batch.

Token: lab uživatel přes ROPC s vlastním veřejným klientem z optimalizace-entra-graph.py (delegované Sites.ReadWrite.All),
heslo z lab.secrets.json (data-prava-token.py). Výchozí uživatel tomas.prochazka (Visitor webu, nevlastník).
Podpříkazy:
  filtr    $filter/$orderby/$top nad indexovaným a neindexovaným sloupcem, s hlavičkou Prefer HonorNonIndexedQueriesWarningMayFailRandomly a bez ní
  uplnost  vrací filtr na neindexovaný sloupec s hlavičkou Prefer úplný výsledek? (nextLink do konce, hledání položky za pozicí 5000)
  stranky  celý seznam přes @odata.nextLink (999) a přes delta
  delta    delta=latest, změna, delta znovu (inkrementální načtení)
  batch    Graph $batch: 20 požadavků na zápis do seznamu Zapis
Výstup JSON řádky. Jen lab.
"""
import argparse, json, os, subprocess, sys, time, urllib.error, urllib.parse, urllib.request, uuid
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import optimalizace_lib as L

p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
p.add_argument("cmd", choices="filtr uplnost stranky delta batch".split()); p.add_argument("--list", default="Velky")
p.add_argument("--who", default="tomas.prochazka"); p.add_argument("--client", default="1be6cab2-e345-4037-a382-7eac8a7ba603")
a = p.parse_args()
G = "https://graph.microsoft.com/v1.0"
PREFER = {"Prefer": "HonorNonIndexedQueriesWarningMayFailRandomly"}
_t = {}


def tok():
    if "t" not in _t:
        o = subprocess.run([sys.executable, os.path.join(L.TOOLS, "data-prava-token.py"), a.who, "--resource", "https://graph.microsoft.com", "--client", a.client], capture_output=True, text=True)
        if o.returncode: sys.exit(o.stderr[:300])
        _t["t"] = o.stdout.strip()
    return _t["t"]


def g(method, url, body=None, headers=None):
    full = url if url.startswith("http") else G + url
    full = urllib.parse.quote(full, safe=":/?&=$,()'|@%;*+!")
    h = {"Authorization": "Bearer " + tok(), "Accept": "application/json"}
    data = None
    if body is not None: h["Content-Type"] = "application/json"; data = json.dumps(body).encode()
    h.update(headers or {})
    t = time.perf_counter()
    try:
        with urllib.request.urlopen(urllib.request.Request(full, data, h, method=method), timeout=300) as r:
            txt = r.read().decode(); return r.status, (json.loads(txt) if txt else {}), round(time.perf_counter() - t, 3)
    except urllib.error.HTTPError as e:
        txt = e.read().decode()
        try: j = json.loads(txt)
        except Exception: j = txt
        return e.code, j, round(time.perf_counter() - t, 3)


def gerr(j): return (j.get("error", {}).get("message") if isinstance(j, dict) else str(j))[:170]


s, j, _ = g("GET", "/sites/pavelchocholousgmail.sharepoint.com:/sites/egd-sonda-optimalizace"); SITE = j["id"]
s, j, _ = g("GET", f"/sites/{SITE}/lists?$filter=displayName eq '{a.list}'&$select=id"); LID = j["value"][0]["id"]
BASE = f"/sites/{SITE}/lists/{LID}/items"


def T(name, url, headers=None):
    s, j, t = g("GET", url, headers=headers)
    r = {"test": name, "status": s, "sec": t}
    if s == 200: r["rows"] = len(j.get("value", [])); r["nextLink"] = "@odata.nextLink" in j; r["ukazka"] = (j["value"][0].get("fields") if j.get("value") else None)
    else: r["chyba"] = gerr(j)
    L.out(**r)
    return s, j


def filtr():
    for pf, hd in (("bez_Prefer", None), ("s_Prefer", PREFER)):
        for n, q in [
            ("filtr_indexovany_600", "$expand=fields($select=Kategorie,Castka)&$filter=fields/Kategorie eq 'K01'&$top=999"),
            ("filtr_indexovany_vic_nez_5000_(Castka ge 0)", "$expand=fields($select=Castka)&$filter=fields/Castka ge 0&$top=100"),
            ("filtr_neindexovany", "$expand=fields($select=Neindexovano)&$filter=fields/Neindexovano eq 'N1'&$top=100"),
            ("filtr_indexovany_+_neindexovany", "$expand=fields($select=Kategorie,Neindexovano)&$filter=fields/Kategorie eq 'K01' and fields/Neindexovano eq 'N1'&$top=100"),
            ("filtr_Created_neindexovany", "$expand=fields($select=Kategorie)&$filter=createdDateTime ge 2024-03-01T00:00:00Z&$top=100"),
            ("filtr_Stav_indexovany", "$expand=fields($select=Stav)&$filter=fields/Stav eq 'Nový'&$top=999"),
        ]:
            T(f"{pf}_{n}", f"{BASE}?{q}", hd)
    for n, q in [
        ("top999_s_fields", "$expand=fields($select=Kategorie,Castka)&$top=999"), ("top5000", "$expand=fields($select=Kategorie)&$top=5000"),
        ("orderby_fields_Castka_(indexovany)", "$expand=fields($select=Castka)&$orderby=fields/Castka&$top=10"),
        ("orderby_createdDateTime", "$expand=fields($select=Castka)&$orderby=createdDateTime desc&$top=10"),
        ("orderby_lastModifiedDateTime_(s_Prefer)", "$expand=fields($select=Castka)&$orderby=lastModifiedDateTime desc&$top=10"),
        ("$count=true", "$count=true&$top=1"), ("bez_expand_top999", "$top=999"), ("select_id_jen", "$select=id&$top=999"),
    ]:
        T(n, f"{BASE}?{q}", PREFER if "Prefer" in n else None)
        if "Prefer" not in n: pass
    T("orderby_createdDateTime_s_Prefer", f"{BASE}?$expand=fields($select=Castka)&$orderby=createdDateTime desc&$top=10", PREFER)
    T("count_s_ConsistencyLevel", f"{BASE}?$count=true&$top=1", {"ConsistencyLevel": "eventual"})


def pages(url, hd):
    n, k, t0, ids = 0, 0, time.perf_counter(), []
    while url:
        s, j, t = g("GET", url, headers=hd)
        if s != 200: return {"status": s, "chyba": gerr(j), "rows_do_chyby": n, "stranek": k, "sec": round(time.perf_counter() - t0, 2)}
        n += len(j["value"]); k += 1; url = j.get("@odata.nextLink"); ids += [int(v["id"]) for v in j["value"]]
    return {"status": 200, "rows": n, "stranek": k, "max_id": max(ids) if ids else None, "sec": round(time.perf_counter() - t0, 2)}


def uplnost():
    L.out(test="neindexovany_Neindexovano=N1_s_Prefer_vsechny_stranky_(skutecne_240)", **pages(f"{BASE}?$select=id&$expand=fields($select=Neindexovano)&$filter=fields/Neindexovano eq 'N1'&$top=100", PREFER))
    L.out(test="indexovany_Castka_ge_0_vsechny_stranky_(skutecne_12000+)", **pages(f"{BASE}?$select=id&$expand=fields($select=Castka)&$filter=fields/Castka ge 0&$top=999", None))
    L.out(test="indexovany_Castka_ge_0_vsechny_stranky_s_Prefer", **pages(f"{BASE}?$select=id&$expand=fields($select=Castka)&$filter=fields/Castka ge 0&$top=999", PREFER))
    for title in ("Položka 3000", "Položka 5499", "Položka 11000", "Položka NEEXISTUJE"):
        s, j, t = g("GET", f"{BASE}?$select=id&$expand=fields($select=Title)&$filter=fields/Title eq '{title}'&$top=10", headers=PREFER)
        prvni = len(j["value"]) if s == 200 else gerr(j)
        r = pages(f"{BASE}?$select=id&$expand=fields($select=Title)&$filter=fields/Title eq '{title}'&$top=10", PREFER)
        L.out(test=f"neindexovany_Title='{title}'_Prefer", prvni_stranka_nalezeno=prvni, prvni_stranka_ma_nextLink="@odata.nextLink" in j if s == 200 else None, po_dojeti_nextLink=r)


def stranky():
    t0, n, pages, url = time.perf_counter(), 0, 0, f"{BASE}?$expand=fields($select=Kategorie,Castka,Stav,Datum)&$top=999"
    while url:
        s, j, t = g("GET", url)
        if s != 200: L.out(test="nextLink", status=s, chyba=gerr(j)); break
        n += len(j["value"]); pages += 1; url = j.get("@odata.nextLink")
    L.out(test="Graph_nextLink_999_s_fields", rows=n, stranek=pages, sec=round(time.perf_counter() - t0, 2))
    t0, n, pages, url = time.perf_counter(), 0, 0, f"{BASE}/delta?$select=id&$expand=fields($select=Kategorie,Castka,Stav,Datum)"
    delta = None
    while url:
        s, j, t = g("GET", url)
        if s != 200: L.out(test="delta_plne_nacteni", status=s, chyba=gerr(j)); break
        n += len(j["value"]); pages += 1; url = j.get("@odata.nextLink"); delta = j.get("@odata.deltaLink", delta)
    L.out(test="Graph_delta_prvni_plne_nacteni", rows=n, stranek=pages, sec=round(time.perf_counter() - t0, 2), ma_deltaLink=bool(delta))


def delta():
    s, j, t = g("GET", f"{BASE}/delta?token=latest")
    L.out(test="delta_token=latest", status=s, sec=t, rows=len(j.get("value", [])) if s == 200 else None, ma_deltaLink="@odata.deltaLink" in j if s == 200 else gerr(j))
    if s != 200: return
    dl = j["@odata.deltaLink"]
    tok_ = L.token()  # změna přes SP REST adminem (vlastník webu)
    sp = L.list_path(a.list)
    st1, jj, _ = L.req("POST", sp + "/items", {"Title": "delta-nova", "Kategorie": "K98", "Castka": 5, "Stav": "Nový"})
    L.req("POST", sp + "/items(40)", {"Neindexovano": "delta-" + uuid.uuid4().hex[:4]}, headers={"IF-MATCH": "*", "X-HTTP-Method": "MERGE"})
    for i in range(4):
        time.sleep(5)
        s, j, t = g("GET", dl)
        n = len(j.get("value", [])) if s == 200 else None
        L.out(test=f"delta_po_zmene_pokus_{i + 1}", status=s, sec=t, rows=n, ids=[(v.get("id"), v.get("fields", {}).get("Title")) for v in j.get("value", [])][:5] if s == 200 else gerr(j))
        if n: break


def batch():
    s, j, _ = g("GET", f"/sites/{SITE}/lists?$filter=displayName eq 'Zapis'&$select=id"); zid = j["value"][0]["id"]
    reqs = [{"id": str(i), "method": "POST", "url": f"/sites/{SITE}/lists/{zid}/items", "headers": {"Content-Type": "application/json"}, "body": {"fields": {"Title": f"graph batch {i}", "Kategorie": "G"}}} for i in range(1, 21)]
    s, j, t = g("POST", "/$batch", {"requests": reqs})
    L.out(test="Graph_$batch_20_POST", status=s, sec=t, ok=sum(1 for r in j.get("responses", []) if r["status"] == 201) if s == 200 else None, chyby=[r for r in j.get("responses", []) if r["status"] != 201][:2] if s == 200 else gerr(j))
    t0 = time.perf_counter(); ok = 0
    for i in range(20):
        s, j, t = g("POST", f"/sites/{SITE}/lists/{zid}/items", {"fields": {"Title": f"graph seq {i}", "Kategorie": "GS"}}); ok += s == 201
    L.out(test="Graph_sekvencne_20_POST", ok=ok, sec=round(time.perf_counter() - t0, 2))


{"filtr": filtr, "uplnost": uplnost, "stranky": stranky, "delta": delta, "batch": batch}[a.cmd]()
