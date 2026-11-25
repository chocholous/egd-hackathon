#!/usr/bin/env python3
"""Založí v sonda webu /sites/egd-sonda-optimalizace seznam se sloupci a indexy (idempotentní) a umí ho naplnit.

Seznam má sloupce: Kategorie (text, K00..K19), Castka (číslo 0..999), Stav (text), Datum (datum),
Oddeleni (text, D0..D9), Neindexovano (text, bez indexu). Indexy: Kategorie, Castka, Stav, Datum, Oddeleni
(zakládají se na PRÁZDNÉM seznamu; index nad 5000 měří session miniskilly).
Podpříkazy:
  create --list Velky [--folders N]   založí seznam, sloupce, indexy (volitelně i N složek S1..)
  fill   --list Velky --count 12000   vloží položky přes REST $batch (changeset po 100, 4 paralelně)
  count  --list Velky                 ItemCount seznamu
Web lze změnit proměnnou OPT_WEB (jen lab tenant). Nic nemaže.
"""
import argparse, concurrent.futures as cf, datetime, json, os, sys, time, urllib.request, urllib.error, uuid
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import optimalizace_lib as L

FIELDS = [
    ("Kategorie", '<Field Type="Text" DisplayName="Kategorie" Name="Kategorie" StaticName="Kategorie" />'),
    ("Castka", '<Field Type="Number" DisplayName="Castka" Name="Castka" StaticName="Castka" />'),
    ("Stav", '<Field Type="Text" DisplayName="Stav" Name="Stav" StaticName="Stav" />'),
    ("Datum", '<Field Type="DateTime" DisplayName="Datum" Name="Datum" StaticName="Datum" Format="DateOnly" />'),
    ("Oddeleni", '<Field Type="Text" DisplayName="Oddeleni" Name="Oddeleni" StaticName="Oddeleni" />'),
    ("Neindexovano", '<Field Type="Text" DisplayName="Neindexovano" Name="Neindexovano" StaticName="Neindexovano" />'),
]
INDEXED = ["Kategorie", "Castka", "Stav", "Datum", "Oddeleni"]
BASE = datetime.date(2024, 1, 1)


def row(i):
    """Deterministické hodnoty: Kategorie K(i%20), Castka (i*7)%1000, Stav Nový každá 20., Datum po dnech."""
    stav = "Nový" if i % 20 == 0 else ("Zamítnuto" if i % 7 == 0 else "Schváleno")
    return {"Title": f"Položka {i}", "Kategorie": f"K{i % 20:02d}", "Castka": (i * 7) % 1000, "Stav": stav,
            "Datum": (BASE + datetime.timedelta(days=i % 700)).isoformat() + "T00:00:00Z", "Oddeleni": f"D{i % 10}",
            "Neindexovano": f"N{i % 50}"}


def create(a):
    lp = L.list_path(a.list)
    s, j, _ = L.req("GET", lp + "?$select=Id,ItemCount")
    if s != 200:
        s, j, _ = L.req("POST", "/_api/web/lists", {"BaseTemplate": 100, "Title": a.list, "Description": "sonda optimalizace", "EnableFolderCreation": bool(a.folders)})
        L.out(krok="list", status=s, chyba=None if s in (200, 201) else L.err(j))
        if s not in (200, 201): sys.exit(1)
    for name, xml in FIELDS:
        s, j, _ = L.req("POST", lp + "/fields/createfieldasxml", {"parameters": {"SchemaXml": xml, "Options": 8}})
        L.out(krok="field", name=name, status=s, chyba=None if s in (200, 201) else L.err(j))
    for name in INDEXED:
        s, j, _ = L.req("POST", lp + f"/fields/getbyinternalnameortitle('{name}')", {"Indexed": True}, headers={"X-HTTP-Method": "MERGE", "IF-MATCH": "*"})
        L.out(krok="index", name=name, status=s, chyba=None if s in (200, 204) else L.err(j))
    for k in range(1, a.folders + 1):  # složka jako položka seznamu: název jde přes FileLeafRef, UnderlyingObjectType=1
        body = {"listItemCreateInfo": {"FolderPath": {"DecodedUrl": f"/sites/egd-sonda-optimalizace/Lists/{a.list}"}, "UnderlyingObjectType": 1},
                "formValues": [{"FieldName": "FileLeafRef", "FieldValue": f"S{k}"}]}
        s, j, _ = L.req("POST", lp + "/AddValidateUpdateItemUsingPath", body)
        L.out(krok="slozka", n=k, status=s, chyba=None if s in (200, 201) else L.err(j))


def fill(a):
    lp = L.list_path(a.list)
    tok, web = L.token(), L.WEB
    L.req("POST", "/_api/contextinfo")  # naplní digest
    dig = L._dig[(None, web)]
    s, j, _ = L.req("GET", lp + "?$select=ItemCount"); start = j["ItemCount"] if s == 200 else 0
    root = f"/sites/egd-sonda-optimalizace/Lists/{a.list}"

    def batch(chunk):
        bd, cs = "batch_" + uuid.uuid4().hex, "changeset_" + uuid.uuid4().hex
        parts = "".join(
            f"--{cs}\r\nContent-Type: application/http\r\nContent-Transfer-Encoding: binary\r\n\r\n"
            f"POST {web}/_api/web/lists/getbytitle('{a.list}')/{endpoint} HTTP/1.1\r\nAccept: application/json;odata=nometadata\r\n"
            f"Content-Type: application/json;odata=nometadata\r\n\r\n{json.dumps(b)}\r\n" for b in chunk)
        rawb = (f"--{bd}\r\nContent-Type: multipart/mixed; boundary={cs}\r\n\r\n" + parts + f"--{cs}--\r\n--{bd}--\r\n").encode()
        h = {"Authorization": "Bearer " + tok, "X-RequestDigest": dig, "Content-Type": f"multipart/mixed; boundary={bd}", "Accept": "application/json"}
        for p in range(6):
            try:
                with urllib.request.urlopen(urllib.request.Request(web + "/_api/$batch", rawb, h, method="POST"), timeout=300) as r:
                    t_ = r.read().decode(); return t_.count("HTTP/1.1 201") + t_.count("HTTP/1.1 200")
            except urllib.error.HTTPError as e:
                if e.code in (429, 503): time.sleep(5 * (p + 1)); continue
                print("chyba", e.code, e.read().decode()[:300], file=sys.stderr); return 0
        return 0

    bodies = [row(i) for i in range(a.offset, a.offset + a.count)]
    if a.folders:  # položky rovnoměrně do složek S1..N (AddValidateUpdateItemUsingPath), bez sloupce Datum
        def fb(i, r):
            fv = [{"FieldName": k, "FieldValue": str(v)} for k, v in r.items() if k != "Datum"]
            return {"listItemCreateInfo": {"FolderPath": {"DecodedUrl": f"{root}/S{(i % a.folders) + 1}"}, "UnderlyingObjectType": 0},
                    "formValues": fv}
        bodies = [fb(a.offset + i, r) for i, r in enumerate(bodies)]
        endpoint = "AddValidateUpdateItemUsingPath"
    else:
        endpoint = "items"
    chunks = [bodies[i:i + 100] for i in range(0, len(bodies), 100)]
    t = time.time()
    with cf.ThreadPoolExecutor(4) as ex: ok = sum(ex.map(batch, chunks))
    L.out(vlozeno=ok, z=a.count, sec=round(time.time() - t, 1), polozek_za_s=round(ok / max(time.time() - t, 0.1), 1), pocet_pred=start)


def count(a):
    s, j, t = L.req("GET", L.list_path(a.list) + "?$select=ItemCount"); L.out(status=s, ItemCount=j.get("ItemCount") if s == 200 else L.err(j), sec=t)


p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
sp = p.add_subparsers(dest="cmd", required=True)
c = sp.add_parser("create"); c.add_argument("--list", default="Velky"); c.add_argument("--folders", type=int, default=0)
f = sp.add_parser("fill"); f.add_argument("--list", default="Velky"); f.add_argument("--count", type=int, default=12000); f.add_argument("--offset", type=int, default=0); f.add_argument("--folders", type=int, default=0)
n = sp.add_parser("count"); n.add_argument("--list", default="Velky")
a = p.parse_args()
{"create": create, "fill": fill, "count": count}[a.cmd](a)
