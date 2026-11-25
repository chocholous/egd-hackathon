#!/usr/bin/env python3
"""Sonda dotazů SharePoint REST / CAML / RenderListDataAsStream nad velkým seznamem (výchozí Velky, 12000 položek).

Podpříkazy (každý vypisuje JSON řádky: test, status, sec, rows|chyba, bytes):
  rest      REST $filter/$orderby/$top/$skiptoken: co obejde limit 5000 a co ne
  caml      CAML přes GetItems (RowLimit, Paged, ListItemCollectionPosition) a RenderListDataAsStream
  stranky   načtení celého seznamu: nextLink po 1000 vs RenderListDataAsStream vs paralelně po ID rozsazích
  agregace  počty a součty bez stažení všeho (ItemCount, filtrovaný počet, Aggregations, GroupBy, Search)
  zmeny     inkrementální načtení: GetChanges, GetListItemChangesSinceToken (po 1 přidané/změněné položce)
  zapis     zápis: sekvenčně vs $batch (create a MERGE) do seznamu Zapis
  velikost  $select vs vše, nometadata vs verbose, gzip, ETag/If-None-Match
Parametry: --list (výchozí Velky), --who (alias lab uživatele; výchozí admin = vlastník webu). Jen lab; nic nemaže.
"""
import argparse, concurrent.futures as cf, gzip, json, os, sys, time, urllib.error, urllib.parse, urllib.request, uuid
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import optimalizace_lib as L

p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
p.add_argument("cmd", choices="rest caml stranky agregace zmeny zapis velikost".split())
p.add_argument("--list", default="Velky"); p.add_argument("--who", default=None)
a = p.parse_args()
LP = L.list_path(a.list)
ROOT = f"/sites/egd-sonda-optimalizace/Lists/{a.list}"


def T(name, method, url, body=None, rows=None, headers=None, **kw):
    s, j, t = L.req(method, url, body, who=a.who, headers=headers, **kw)
    r = {"test": name, "status": s, "sec": t}
    if s in (200, 201):
        if isinstance(j, dict):
            v = j.get("value") if "value" in j else j.get("Row")
            r["rows"] = len(v) if isinstance(v, list) else None
            if isinstance(v, list) and v and isinstance(v[0], dict): r["id_prvni_posledni"] = [v[0].get("Id", v[0].get("ID")), v[-1].get("Id", v[-1].get("ID"))]
            if "odata.nextLink" in j: r["nextLink"] = True
            if rows: r.update(rows(j))
        else:
            r["body"] = str(j)[:150]
    else:
        r["chyba"] = L.err(j, 140)
    if L.RETRIES[0]: r["retries_429"] = L.RETRIES[0]; L.RETRIES[0] = 0
    L.out(**r)
    return s, j


def rest():
    I = LP + "/items"
    for n, q in [
        ("top1000", "$select=Id&$top=1000"), ("top5000_bez_filtru", "$select=Id&$top=5000"), ("top5001_bez_filtru", "$select=Id&$top=5001"),
        ("filtr_indexovany_600", "$select=Id&$filter=Kategorie eq 'K01'&$top=5000"),
        ("filtr_indexovany_vic_nez_5000_(Castka ge 0)", "$select=Id&$filter=Castka ge 0&$top=100"),
        ("filtr_indexovany_vic_nez_5000_(Castka lt 500)", "$select=Id&$filter=Castka lt 500&$top=100"),
        ("filtr_neindexovany_top10", "$select=Id&$filter=Neindexovano eq 'N1'&$top=10"),
        ("filtr_indexovany_+_neindexovany", "$select=Id&$filter=Kategorie eq 'K01' and Neindexovano eq 'N1'&$top=100"),
        ("filtr_neindexovany_+_indexovany_(opacne_poradi)", "$select=Id&$filter=Neindexovano eq 'N1' and Kategorie eq 'K01'&$top=100"),
        ("orderby_neindexovany", "$select=Id&$orderby=Neindexovano&$top=10"),
        ("orderby_Created_desc", "$select=Id&$orderby=Created desc&$top=10"),
        ("orderby_Modified_desc", "$select=Id&$orderby=Modified desc&$top=10"),
        ("orderby_ID_desc", "$select=Id&$orderby=ID desc&$top=10"),
        ("orderby_Datum_indexovany", "$select=Id&$orderby=Datum desc&$top=10"),
        ("orderby_Castka_indexovany", "$select=Id&$orderby=Castka desc&$top=10"),
        ("filtr_indexovany_+_orderby_neindexovany", "$select=Id&$filter=Kategorie eq 'K01'&$orderby=Neindexovano&$top=10"),
        ("filtr_indexovany_+_orderby_Created", "$select=Id&$filter=Kategorie eq 'K01'&$orderby=Created desc&$top=10"),
        ("filtr_ID_rozsah_1000", "$select=Id&$filter=ID ge 5001 and ID le 6000&$top=1000"),
        ("filtr_ID_gt_0_top100", "$select=Id&$filter=ID gt 0&$top=100"),
        ("filtr_ID_gt_10000_top5000", "$select=Id&$filter=ID gt 10000&$top=5000"),
        ("Kategorie_ne_K01 (>5000 shod)", "$select=Id&$filter=Kategorie ne 'K01'&$top=100"),
        ("startswith(Kategorie,'K01')", "$select=Id&$filter=startswith(Kategorie,'K01')&$top=100"),
        ("substringof('01',Kategorie)", "$select=Id&$filter=substringof('01',Kategorie)&$top=100"),
        ("or_dvou_indexovanych", "$select=Id&$filter=Kategorie eq 'K01' or Stav eq 'Nový'&$top=100"),
        ("or_indexovany_a_neindexovany", "$select=Id&$filter=Kategorie eq 'K01' or Neindexovano eq 'N1'&$top=100"),
        ("filtr_Datum_rozsah_indexovany", "$select=Id&$filter=Datum ge datetime'2024-03-01T00:00:00Z' and Datum lt datetime'2024-03-08T00:00:00Z'&$top=5000"),
        ("filtr_Created_neindexovany", "$select=Id&$filter=Created ge datetime'2024-03-01T00:00:00Z'&$top=100"),
        ("skip_5000", "$select=Id&$skip=5000&$top=100"),
        ("skiptoken_rucne_p_ID=5000", "$select=Id&$top=100&$skiptoken=Paged%3dTRUE%26p_ID%3d5000"),
        ("skiptoken_rucne_p_ID=11000", "$select=Id&$top=100&$skiptoken=Paged%3dTRUE%26p_ID%3d11000"),
    ]:
        T(n, "GET", f"{I}?{q}")


def caml_body(view, paging=None):
    q = {"ViewXml": view}
    if paging: q["ListItemCollectionPosition"] = {"PagingInfo": paging}
    return {"query": q}


def caml():
    G = LP + "/GetItems?$select=Id"
    for n, v in [
        ("RowLimit_1000", "<View><RowLimit>1000</RowLimit></View>"),
        ("RowLimit_5000", "<View><RowLimit>5000</RowLimit></View>"),
        ("RowLimit_5001", "<View><RowLimit>5001</RowLimit></View>"),
        ("RowLimit_6000_Paged", '<View><RowLimit Paged="TRUE">6000</RowLimit></View>'),
        ("Where_neindexovany", "<View><Query><Where><Eq><FieldRef Name='Neindexovano'/><Value Type='Text'>N1</Value></Eq></Where></Query><RowLimit>10</RowLimit></View>"),
        ("Where_indexovany", "<View><Query><Where><Eq><FieldRef Name='Kategorie'/><Value Type='Text'>K01</Value></Eq></Where></Query><RowLimit>1000</RowLimit></View>"),
        ("Where_indexovany_+_OrderBy_neindexovany", "<View><Query><Where><Eq><FieldRef Name='Kategorie'/><Value Type='Text'>K01</Value></Eq></Where><OrderBy><FieldRef Name='Neindexovano'/></OrderBy></Query><RowLimit>10</RowLimit></View>"),
        ("OrderBy_ID_desc", "<View><Query><OrderBy><FieldRef Name='ID' Ascending='FALSE'/></OrderBy></Query><RowLimit>10</RowLimit></View>"),
        ("OrderBy_Created", "<View><Query><OrderBy><FieldRef Name='Created' Ascending='FALSE'/></OrderBy></Query><RowLimit>10</RowLimit></View>"),
        ("QueryThrottleMode_Override_RowLimit_6000", '<View QueryThrottleMode="Override"><RowLimit>6000</RowLimit></View>'),
        ("QueryThrottleMode_Override_neindexovany", "<View QueryThrottleMode='Override'><Query><Where><Eq><FieldRef Name='Neindexovano'/><Value Type='Text'>N1</Value></Eq></Where></Query><RowLimit>10</RowLimit></View>"),
        ("Scope_RecursiveAll_RowLimit_5000", '<View Scope="RecursiveAll"><RowLimit>5000</RowLimit></View>'),
    ]:
        T("GetItems_" + n, "POST", G, caml_body(v), rows=lambda j: {"nextLink_pozice": bool(j.get("odata.nextLink"))})
    # stránkování GetItems: odpověď nevrací nextLink, PagingInfo se skládá ručně z posledního ID ("Paged=TRUE&p_ID=<poslední ID>")
    paging, n, t0, pages = None, 0, time.perf_counter(), 0
    for i in range(20):
        s, j, t = L.req("POST", G, caml_body('<View><RowLimit Paged="TRUE">1000</RowLimit></View>', paging), who=a.who)
        if s != 200: L.out(test="GetItems_PagingInfo", status=s, chyba=L.err(j)); break
        if not j["value"]: break
        n += len(j["value"]); pages += 1; paging = f"Paged=TRUE&p_ID={j['value'][-1]['Id']}"
    L.out(test="GetItems_stranky_po_1000_PagingInfo_p_ID", status=s, rows=n, stranek=pages, sec=round(time.perf_counter() - t0, 2))
    # RenderListDataAsStream
    R = LP + "/RenderListDataAsStream"
    def rb(view, extra=None):
        d = {"parameters": {"RenderOptions": 2, "ViewXml": view}}
        if extra: d["parameters"].update(extra)
        return d
    for n, v in [
        ("RowLimit_1000", "<View><RowLimit>1000</RowLimit></View>"),
        ("RowLimit_5000", "<View><RowLimit>5000</RowLimit></View>"),
        ("RowLimit_5001", "<View><RowLimit>5001</RowLimit></View>"),
        ("Where_neindexovany", "<View><Query><Where><Eq><FieldRef Name='Neindexovano'/><Value Type='Text'>N1</Value></Eq></Where></Query><RowLimit>10</RowLimit></View>"),
        ("Where_indexovany", "<View><Query><Where><Eq><FieldRef Name='Kategorie'/><Value Type='Text'>K01</Value></Eq></Where></Query><RowLimit>1000</RowLimit></View>"),
        ("OrderBy_Created", "<View><Query><OrderBy><FieldRef Name='Created' Ascending='FALSE'/></OrderBy></Query><RowLimit>10</RowLimit></View>"),
        ("RowLimit_Paged_1000", '<View><RowLimit Paged="TRUE">1000</RowLimit></View>'),
    ]:
        T("RenderListDataAsStream_" + n, "POST", R, rb(v), rows=lambda j: {"NextHref": (j.get("NextHref") or "")[:60], "RowCount": j.get("LastRow")})


    # RenderListDataAsStream s NEindexovaným filtrem nehlásí chybu, ale tiše prohledá jen začátek seznamu: najdi hranici
    titles = {}
    for lo in (4900, 5100):
        s_, j_, _ = L.req("GET", f"{LP}/items?$select=Id,Title&$filter=ID ge {lo} and ID lt {lo + 200}&$top=200", who=a.who)
        for x in j_["value"]: titles[x["Id"]] = x["Title"]
    s_, j_, _ = L.req("GET", f"{LP}/items?$select=Id,Title&$filter=ID ge 10900 and ID lt 10930&$top=50", who=a.who)
    for x in j_["value"]: titles[x["Id"]] = x["Title"]
    for iid in (1, 2803, 4802, 4990, 5000, 5001, 5010, 5100, 5200, 5400, 10914):
        if iid not in titles:
            s_, j_, _ = L.req("GET", f"{LP}/items({iid})?$select=Id,Title", who=a.who); titles[iid] = j_["Title"]
        w = f"<Eq><FieldRef Name='Title'/><Value Type='Text'>{titles[iid]}</Value></Eq>"
        s_, j_, t_ = L.req("POST", LP + "/RenderListDataAsStream", {"parameters": {"RenderOptions": 2, "ViewXml": f"<View><Query><Where>{w}</Where></Query><RowLimit>5</RowLimit></View>"}}, who=a.who)
        L.out(test="RenderListDataAsStream_neindexovany_Title_hledam_ID", hledane_ID=iid, status=s_, nalezeno=len(j_["Row"]) if s_ == 200 else L.err(j_), sec=t_)
        s_, j_, t_ = L.req("POST", LP + "/GetItems?$select=Id", {"query": {"ViewXml": f"<View><Query><Where>{w}</Where></Query><RowLimit>5</RowLimit></View>"}}, who=a.who)
        L.out(test="GetItems_neindexovany_Title_hledam_ID", hledane_ID=iid, status=s_, nalezeno=len(j_["value"]) if s_ == 200 else L.err(j_), sec=t_)

    # tatáž hledání, ale RowLimit Paged="TRUE" a následování NextHref (RenderListDataAsStream vrací NextHref i u prázdné stránky)
    for title in ("Položka 3000", "Položka 5499", "Položka 11000", "Položka NEEXISTUJE"):
        w = f"<Eq><FieldRef Name='Title'/><Value Type='Text'>{title}</Value></Eq>"
        nxt, found, pg, t0 = "", [], 0, time.perf_counter()
        while pg < 30:
            s_, j_, t_ = L.req("POST", LP + "/RenderListDataAsStream" + nxt, {"parameters": {"RenderOptions": 2, "ViewXml": f"<View><Query><Where>{w}</Where></Query><RowLimit Paged='TRUE'>10</RowLimit></View>"}}, who=a.who)
            if s_ != 200: L.out(test="RLDAS_Paged_neindexovany", chyba=L.err(j_)); break
            found += [r["ID"] for r in j_["Row"]]; pg += 1; nxt = j_.get("NextHref") or ""
            if not nxt: break
        L.out(test=f"RenderListDataAsStream_Paged_NextHref_neindexovany_Title='{title}'", nalezeno=found, stranek=pg, sec=round(time.perf_counter() - t0, 2))


def stranky():
    # a) REST nextLink po 1000
    t0, n, url = time.perf_counter(), 0, f"{LP}/items?$select=Id,Title,Kategorie,Castka,Stav,Datum&$top=1000"
    pages = 0
    while url:
        s, j, t = L.req("GET", url, who=a.who)
        if s != 200: L.out(test="nextLink", status=s, chyba=L.err(j)); break
        n += len(j["value"]); pages += 1; url = j.get("odata.nextLink")
    L.out(test="REST_nextLink_po_1000", rows=n, stranek=pages, sec=round(time.perf_counter() - t0, 2))
    # b) RenderListDataAsStream: NextHref
    t0, n, pages, nxt = time.perf_counter(), 0, 0, ""
    while True:
        view = '<View><ViewFields><FieldRef Name="ID"/><FieldRef Name="Title"/><FieldRef Name="Kategorie"/><FieldRef Name="Castka"/><FieldRef Name="Stav"/><FieldRef Name="Datum"/></ViewFields><RowLimit Paged="TRUE">1000</RowLimit></View>'
        s, j, t = L.req("POST", LP + "/RenderListDataAsStream" + nxt, {"parameters": {"RenderOptions": 2, "ViewXml": view}}, who=a.who)
        if s != 200: L.out(test="RenderListDataAsStream_strankovani", status=s, chyba=L.err(j)); break
        n += len(j["Row"]); pages += 1
        nh = j.get("NextHref")
        if not nh: break
        nxt = nh
    L.out(test="RenderListDataAsStream_NextHref_po_1000", rows=n, stranek=pages, sec=round(time.perf_counter() - t0, 2))
    # c) paralelně po ID rozsazích (1000 ID na dotaz), 6 vláken
    s, j, _ = L.req("GET", f"{LP}/items?$select=Id&$orderby=ID desc&$top=1", who=a.who); mx = j["value"][0]["Id"]
    def one(lo):
        s, j, t = L.req("GET", f"{LP}/items?$select=Id,Title,Kategorie,Castka,Stav,Datum&$filter=ID ge {lo} and ID lt {lo + 1000}&$top=1000", who=a.who)
        return len(j["value"]) if s == 200 else -1
    for vl in (1, 4, 8):
        t0 = time.perf_counter()
        with cf.ThreadPoolExecutor(vl) as ex: res = list(ex.map(one, range(1, mx + 1, 1000)))
        L.out(test=f"ID_rozsahy_po_1000_vlaken_{vl}", rows=sum(r for r in res if r > 0), chyby=sum(1 for r in res if r < 0), sec=round(time.perf_counter() - t0, 2))
    # d) $top=5000 bez filtru (jednou) pro srovnání
    T("top5000_jedno_volani", "GET", f"{LP}/items?$select=Id,Title,Kategorie,Castka,Stav,Datum&$top=5000")


def agregace():
    T("ItemCount_seznamu", "GET", f"{LP}?$select=ItemCount")
    def cnt(j): return {"pocet": len(j["value"])}
    T("pocet_filtrovane_pres_items_(Stav=Nový,$select=Id)", "GET", f"{LP}/items?$select=Id&$filter=Stav eq 'Nový'&$top=5000", rows=cnt)
    T("$count_v_REST", "GET", f"{LP}/items?$count=true&$top=1&$select=Id")
    T("$inlinecount", "GET", f"{LP}/items?$inlinecount=allpages&$top=1&$select=Id")
    T("items/$count", "GET", f"{LP}/items/$count")
    T("ItemCount_pres_GetItemById?", "GET", f"{LP}/ItemCount")
    R = LP + "/RenderListDataAsStream"
    where = "<Query><Where><Eq><FieldRef Name='Kategorie'/><Value Type='Text'>K01</Value></Eq></Where></Query>"
    vf = '<ViewFields><FieldRef Name="ID"/><FieldRef Name="Castka"/></ViewFields>'
    dat = "<Where><And><Geq><FieldRef Name='Datum'/><Value Type='DateTime'>2024-03-01T00:00:00Z</Value></Geq><Lt><FieldRef Name='Datum'/><Value Type='DateTime'>2024-04-01T00:00:00Z</Value></Lt></And></Where>"
    def rl(name, view):
        s, j, t = L.req("POST", R, {"parameters": {"RenderOptions": 2, "ViewXml": view}}, who=a.who)
        r = {"test": "RenderListDataAsStream_" + name, "status": s, "sec": t}
        if s == 200:
            rows = j.get("Row", []); r["radku"] = len(rows)
            r["agregaty_prvni_radek"] = {k: v for k, v in (rows[0] if rows else {}).items() if k.endswith((".SUM", ".COUNT", ".AVG", ".MAX", ".MIN", ".agg", ".group"))}
            r["skupiny"] = [(x.get("Kategorie"), x.get("Kategorie.COUNT.group"), x.get("Castka.SUM.agg")) for x in rows if "Kategorie.COUNT.group" in x][:25]
        else: r["chyba"] = L.err(j, 160)
        L.out(**r)
    K01 = "<Query><Where><Eq><FieldRef Name='Kategorie'/><Value Type='Text'>K01</Value></Eq></Where></Query>"
    for fn in ("SUM", "COUNT", "AVG", "MAX", "MIN"):
        rl(f"{fn}_Castka_filtr_Kategorie=K01", f'<View>{vf}{K01}<Aggregations Value="On"><FieldRef Name="Castka" Type="{fn}"/></Aggregations><RowLimit>1</RowLimit></View>')
    rl("SUM_Castka_bez_filtru", f'<View>{vf}<Aggregations Value="On"><FieldRef Name="Castka" Type="SUM"/></Aggregations><RowLimit>1</RowLimit></View>')
    rl("SUM_Castka_Castka_lt_500_(vic_nez_5000_shod)", f"<View>{vf}<Query><Where><Lt><FieldRef Name='Castka'/><Value Type='Number'>500</Value></Lt></Where></Query><Aggregations Value='On'><FieldRef Name='Castka' Type='SUM'/></Aggregations><RowLimit>1</RowLimit></View>")
    rl("GroupBy_Kategorie_filtr_Datum_unor-brezen_(indexovany)", f'<View>{vf}<Query>{dat}<GroupBy Collapse="TRUE" GroupLimit="30"><FieldRef Name="Kategorie"/></GroupBy></Query><Aggregations Value="On"><FieldRef Name="Castka" Type="SUM"/></Aggregations><RowLimit>30</RowLimit></View>')
    rl("GroupBy_Kategorie_bez_filtru", f'<View>{vf}<Query><GroupBy Collapse="TRUE" GroupLimit="30"><FieldRef Name="Kategorie"/></GroupBy></Query><Aggregations Value="On"><FieldRef Name="Castka" Type="SUM"/></Aggregations><RowLimit>30</RowLimit></View>')
    # kontrola proti skutečnosti (stažení po ID rozsazích, 8 vláken)
    def one(lo):
        s_, j_, _ = L.req("GET", f"{LP}/items?$select=Kategorie,Castka,Datum&$filter=ID ge {lo} and ID lt {lo + 1000}&$top=1000", who=a.who); return j_["value"]
    with cf.ThreadPoolExecutor(8) as ex: allv = [x for part in ex.map(one, range(1, 12001, 1000)) for x in part]
    k01 = [x["Castka"] for x in allv if x["Kategorie"] == "K01"]
    mar = {}
    s_, j_, _ = L.req("GET", f"{LP}/items?$select=Kategorie,Castka&$filter=Datum ge datetime'2024-03-01T00:00:00Z' and Datum lt datetime'2024-04-01T00:00:00Z'&$top=5000", who=a.who)
    for x in j_["value"]: mar.setdefault(x["Kategorie"], [0, 0]); mar[x["Kategorie"]][0] += 1; mar[x["Kategorie"]][1] += x["Castka"]
    sg, jg, _ = L.req("POST", R, {"parameters": {"RenderOptions": 2, "ViewXml": f'<View>{vf}<Query>{dat}<GroupBy Collapse="TRUE" GroupLimit="30"><FieldRef Name="Kategorie"/></GroupBy></Query><Aggregations Value="On"><FieldRef Name="Castka" Type="SUM"/></Aggregations><RowLimit>30</RowLimit></View>'}}, who=a.who)
    agg = {x["Kategorie"]: [int(x["Kategorie.COUNT.group"]), float(x["Castka.SUM.agg"].replace("\xa0", ""))] for x in jg["Row"]}
    L.out(test="GroupBy_porovnani_s_REST_filtrem", skupin_agregace=len(agg), skupin_REST=len(mar), neshody={k: {"agregace": agg.get(k), "REST": v} for k, v in mar.items() if agg.get(k) != v})
    L.out(test="kontrola_skutecne_hodnoty", K01_pocet=len(k01), K01_soucet=sum(k01), K01_avg=sum(k01) / len(k01), K01_max=max(k01), K01_min=min(k01),
          soucet_vse=sum(x["Castka"] for x in allv), soucet_Castka_lt_500=sum(x["Castka"] for x in allv if x["Castka"] < 500), pocet_zaznamu_brezen=sum(v[0] for v in mar.values()))
    # Search: počet přes TotalRows bez stahování (pokud je web v indexu)
    s, j, t = L.req("GET", "/_api/search/query?querytext='path:\"" + L.WEB + "/Lists/" + a.list + "\"'&rowlimit=1&selectproperties='Title'", who=a.who)
    L.out(test="Search_TotalRows_pro_seznam", status=s, sec=t, total=j["PrimaryQueryResult"]["RelevantResults"]["TotalRows"] if s == 200 else L.err(j))


def zmeny():
    s, j, _ = L.req("GET", f"{LP}?$select=CurrentChangeToken,Id", who=a.who)
    tok = j["CurrentChangeToken"]["StringValue"]; L.out(krok="CurrentChangeToken", token=tok)
    # a) kolik stojí GetChanges od začátku (bez tokenu), 1 stránka
    s, j, t = L.req("POST", LP + "/GetChanges", {"query": {"Add": True, "Update": True, "DeleteObject": True, "Item": True}}, who=a.who)
    L.out(test="GetChanges_bez_tokenu_prvni_stranka", status=s, sec=t, zmen=len(j["value"]) if s == 200 else None, chyba=None if s == 200 else L.err(j))
    # b) změna: 2 nové, 3 úpravy
    ids = []
    for k in range(2):
        s, j, _ = L.req("POST", LP + "/items", {"Title": "změna-nová", "Kategorie": "K99", "Castka": 1, "Stav": "Nový"}); ids.append(j["Id"])
    for i in (10, 20, 30):
        L.req("POST", f"{LP}/items({i})", {"Neindexovano": "zmeneno-" + uuid.uuid4().hex[:4]}, headers={"IF-MATCH": "*", "X-HTTP-Method": "MERGE"})
    time.sleep(2)
    s, j, t = L.req("POST", LP + "/GetChanges", {"query": {"Add": True, "Update": True, "DeleteObject": True, "Item": True, "ChangeTokenStart": {"StringValue": tok}}}, who=a.who)
    L.out(test="GetChanges_od_tokenu", status=s, sec=t, zmen=len(j["value"]) if s == 200 else None,
          vzorek=[{"ItemId": c.get("ItemId"), "Typ": c.get("ChangeType")} for c in j["value"]][:8] if s == 200 else L.err(j))
    # c) GetListItemChangesSinceToken
    body = {"query": {"__metadata": {"type": "SP.ChangeLogItemQuery"}, "Query": None, "QueryOptions": "<QueryOptions><IncludeMandatoryColumns>FALSE</IncludeMandatoryColumns></QueryOptions>", "RowLimit": "100", "ChangeToken": None, "ViewName": "", "Contains": None}}
    s, j, t = L.req("POST", LP + "/GetListItemChangesSinceToken", body, who=a.who, verbose=True)
    txt = j if isinstance(j, str) else json.dumps(j)
    L.out(test="GetListItemChangesSinceToken_bez_tokenu_RowLimit100", status=s, sec=t, delka=len(txt), vzorek=txt[:200] if s == 200 else L.err(j))
    if s == 200:
        import re
        m = re.search(r'ChangeToken="?([^" ]+)', txt.replace("&quot;", '"')); tk2 = m.group(1) if m else None
        L.out(krok="ChangeToken z odpovedi", token=tk2)
        if tk2:
            L.req("POST", f"{LP}/items({ids[0]})", {"Title": "změna-2"}, headers={"IF-MATCH": "*", "X-HTTP-Method": "MERGE"}); time.sleep(2)
            body["query"]["ChangeToken"] = tk2
            s, j, t = L.req("POST", LP + "/GetListItemChangesSinceToken", body, who=a.who, verbose=True)
            txt = j if isinstance(j, str) else json.dumps(j)
            L.out(test="GetListItemChangesSinceToken_s_tokenem_po_1_zmene", status=s, sec=t, delka=len(txt), vzorek=txt[:300] if s == 200 else L.err(j))


def zapis():
    z = "Zapis"
    s, _, _ = L.req("GET", L.list_path(z) + "?$select=Id")
    if s != 200:
        s, j, _ = L.req("POST", "/_api/web/lists", {"BaseTemplate": 100, "Title": z}); L.out(krok="seznam Zapis", status=s)
        for nm in ("Kategorie", "Castka"):
            L.req("POST", L.list_path(z) + "/fields/createfieldasxml", {"parameters": {"SchemaXml": f'<Field Type="{"Number" if nm=="Castka" else "Text"}" DisplayName="{nm}" Name="{nm}" StaticName="{nm}"/>', "Options": 8}})
    ZP = L.list_path(z)
    N = 100
    t0 = time.perf_counter(); ids = []
    for i in range(N):
        s, j, _ = L.req("POST", ZP + "/items", {"Title": f"seq {i}", "Kategorie": "S"})
        if s == 201: ids.append(j["Id"])
    L.out(test="sekvencne_POST_100_polozek", ok=len(ids), sec=round(time.perf_counter() - t0, 2))
    t0 = time.perf_counter()
    with cf.ThreadPoolExecutor(4) as ex: r = list(ex.map(lambda i: L.req("POST", ZP + "/items", {"Title": f"par {i}", "Kategorie": "P"})[0], range(N)))
    L.out(test="paralelne_4_vlakna_POST_100_polozek", ok=sum(1 for x in r if x == 201), sec=round(time.perf_counter() - t0, 2))
    tok, web = L.token(who=a.who), L.WEB
    L.req("POST", "/_api/contextinfo", who=a.who); dig = L._dig[(a.who, web)]
    def batch(reqs, changeset=True):
        bd, cs = "batch_" + uuid.uuid4().hex, "changeset_" + uuid.uuid4().hex
        parts = "".join(f"--{cs}\r\nContent-Type: application/http\r\nContent-Transfer-Encoding: binary\r\n\r\n{m} {web}{u} HTTP/1.1\r\nAccept: application/json;odata=nometadata\r\nContent-Type: application/json;odata=nometadata\r\n{extra}\r\n{json.dumps(b)}\r\n" for m, u, b, extra in reqs)
        raw = (f"--{bd}\r\nContent-Type: multipart/mixed; boundary={cs}\r\n\r\n" + parts + f"--{cs}--\r\n--{bd}--\r\n").encode()
        h = {"Authorization": "Bearer " + tok, "X-RequestDigest": dig, "Content-Type": f"multipart/mixed; boundary={bd}", "Accept": "application/json"}
        t = time.perf_counter()
        try:
            with urllib.request.urlopen(urllib.request.Request(web + "/_api/$batch", raw, h, method="POST"), timeout=300) as resp: txt = resp.read().decode()
        except urllib.error.HTTPError as e: txt = e.read().decode()
        return txt, round(time.perf_counter() - t, 2)
    txt, sec = batch([("POST", f"{ZP}/items", {"Title": f"batch {i}", "Kategorie": "B"}, "") for i in range(N)])
    L.out(test="batch_changeset_100_POST", ok=txt.count("HTTP/1.1 201"), sec=sec)
    txt, sec = batch([("PATCH", f"{ZP}/items({i})", {"Kategorie": "M"}, "IF-MATCH: *\r\n") for i in ids[:N]])
    L.out(test="batch_changeset_100_MERGE", ok=txt.count("HTTP/1.1 204"), sec=sec, ukazka=txt[-200:] if txt.count("HTTP/1.1 204") != N else "")
    t0 = time.perf_counter()
    with cf.ThreadPoolExecutor(4) as ex: okb = sum(ex.map(lambda k: batch([("POST", f"{ZP}/items", {"Title": f"pbatch {k}-{i}", "Kategorie": "PB"}, "") for i in range(N)])[0].count("HTTP/1.1 201"), range(4)))
    L.out(test="4_batche_po_100_paralelne_POST", ok=okb, sec=round(time.perf_counter() - t0, 2))
    t0 = time.perf_counter()
    with cf.ThreadPoolExecutor(4) as ex: r = list(ex.map(lambda i: L.req("POST", f"{ZP}/items({i})", {"Kategorie": "M2"}, headers={"IF-MATCH": "*", "X-HTTP-Method": "MERGE"})[0], ids[:N]))
    L.out(test="paralelne_4_vlakna_MERGE_100", ok=sum(1 for x in r if x in (200, 204)), sec=round(time.perf_counter() - t0, 2))


def velikost():
    I = LP + "/items"
    def raw(url, acc="application/json;odata=nometadata", gz=False, inm=None):
        full = urllib.parse.quote(L.WEB + url, safe=":/?&=$,()'|@%")
        h = {"Authorization": "Bearer " + L.token(a.who), "Accept": acc}
        if gz: h["Accept-Encoding"] = "gzip"
        if inm: h["If-None-Match"] = inm
        t = time.perf_counter()
        try:
            with urllib.request.urlopen(urllib.request.Request(full, headers=h), timeout=120) as r:
                b = r.read(); hd = dict(r.headers); st = r.status
        except urllib.error.HTTPError as e:
            b, hd, st = e.read(), dict(e.headers), e.code
        return st, len(b), round(time.perf_counter() - t, 3), hd
    for n, q, acc, gz in [
        ("bez_select_nometadata", "?$top=1000", "application/json;odata=nometadata", False),
        ("bez_select_verbose", "?$top=1000", "application/json;odata=verbose", False),
        ("select_3_sloupce_nometadata", "?$select=Id,Kategorie,Castka&$top=1000", "application/json;odata=nometadata", False),
        ("select_3_sloupce_minimalmetadata", "?$select=Id,Kategorie,Castka&$top=1000", "application/json;odata=minimalmetadata", False),
        ("select_3_sloupce_verbose", "?$select=Id,Kategorie,Castka&$top=1000", "application/json;odata=verbose", False),
        ("select_3_sloupce_nometadata_gzip", "?$select=Id,Kategorie,Castka&$top=1000", "application/json;odata=nometadata", True),
        ("bez_select_nometadata_gzip", "?$top=1000", "application/json;odata=nometadata", True),
    ]:
        st, b, t, hd = raw(f"{I}{q}", acc, gz); L.out(test=n, status=st, bytes=b, sec=t, content_encoding=hd.get("Content-Encoding"))
    st, b, t, hd = raw(f"{I}?$select=Id,Kategorie&$top=1000")
    L.out(test="hlavicky_cache", etag=hd.get("ETag"), cache_control=hd.get("Cache-Control"), last_modified=hd.get("Last-Modified"), vary=hd.get("Vary"))
    et = hd.get("ETag")
    if et:
        st, b, t, hd2 = raw(f"{I}?$select=Id,Kategorie&$top=1000", inm=et); L.out(test="If-None-Match_se_stejnym_ETag", status=st, bytes=b, sec=t)
    # ETag seznamu/položky
    st, b, t, hd = raw(f"{LP}/items(10)?$select=Id,Kategorie"); L.out(test="hlavicky_polozka", status=st, etag=hd.get("ETag"))
    # první dotaz + cache serveru: stejné volání 3x
    for i in range(3):
        st, b, t, _ = raw(f"{I}?$select=Id,Kategorie,Castka&$top=1000"); L.out(test=f"opakovane_volani_{i + 1}", sec=t, bytes=b)


{"rest": rest, "caml": caml, "stranky": stranky, "agregace": agregace, "zmeny": zmeny, "zapis": zapis, "velikost": velikost}[a.cmd]()
