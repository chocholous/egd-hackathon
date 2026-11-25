#!/usr/bin/env python3
"""Měření indexů SharePoint seznamu nad limitem 5000 (miniskill egd-data-seznamy).

Jen lab tenant pavelchocholousgmail, admin token z m365 CLI (HOME=~/.m365-osobni).
Výstup: JSON řádky na stdout (ukládej přesměrováním do sondy/miniskilly/*.jsonl).

Podpříkazy:
  setup   --web W [--list IndexTest]            založí seznam a sloupce všech typů (Txt, Volba, Datum, Cislo,
                                                Osoba, Odkaz, Vice, Pozn, T01..T25); idempotentní
  fill    --web W [--list ..] --count N         vloží N položek přes $batch (hodnoty ve všech sloupcích)
  status  --web W [--list ..]                   ItemCount a seznam indexovaných sloupců
  query   --web W [--list ..] --filter F [--orderby O]   jeden dotaz, HTTP kód a čas
  index   --web W [--list ..] --field F --via cli|rest [--off]
                                                zapne (vypne) index a hned pak opakuje dotaz $filter na ten sloupec,
                                                dokud neprojde (max --wait s), měří časy
  max     --web W [--list ..] --fields T01,T02,...  postupně indexuje sloupce, hlásí první chybu

Příklad:
  python3 tools/miniskilly-indexy.py index --web https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-miniskilly --field Txt --via cli
"""
import argparse, json, os, subprocess, sys, time, urllib.parse, urllib.request, urllib.error, uuid
from concurrent.futures import ThreadPoolExecutor

TENANT = "pavelchocholousgmail.sharepoint.com"
M365_ENV = {**os.environ, "HOME": os.path.expanduser("~/.m365-osobni")}
_tok = {}


def out(**k):
    print(json.dumps({"t": time.strftime("%H:%M:%S"), **k}, ensure_ascii=False), flush=True)


def token():
    if "a" not in _tok:
        r = subprocess.run(["m365", "util", "accesstoken", "get", "--resource", "https://" + TENANT], capture_output=True, text=True, env=M365_ENV)
        if r.returncode: sys.exit(r.stderr)
        _tok["a"] = r.stdout.strip().strip('"')
    return _tok["a"]


def req(web, method, path, body=None, extra=None, raw=None):
    url = path if path.startswith("http") else web + path
    url = urllib.parse.quote(url, safe=":/?&=$,()'|@%")
    h = {"Authorization": "Bearer " + token(), "Accept": "application/json;odata=nometadata"}
    data = raw
    if body is not None:
        h["Content-Type"] = "application/json;odata=nometadata"; data = json.dumps(body).encode()
    if method != "GET":
        if "d" not in _tok:
            r = urllib.request.Request(web + "/_api/contextinfo", b"", {"Authorization": h["Authorization"], "Accept": "application/json;odata=nometadata"})
            _tok["d"] = json.load(urllib.request.urlopen(r))["FormDigestValue"]
        h["X-RequestDigest"] = _tok["d"]
    h.update(extra or {})
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data, h, method=method)) as resp:
            t = resp.read().decode()
            return resp.status, (json.loads(t) if t and "json" in resp.headers.get("Content-Type", "") else t)
    except urllib.error.HTTPError as e:
        t = e.read().decode()
        try: return e.code, json.loads(t)
        except Exception: return e.code, t


def err(j):
    if isinstance(j, dict):
        e = j.get("odata.error") or j.get("error") or {}
        m = e.get("message"); m = m.get("value") if isinstance(m, dict) else m
        return (e.get("code", "") + " " + (m or ""))[:200]
    return str(j)[:200]


def L(a): return f"/_api/web/lists/getbytitle('{a.list}')"


TYPES = {
    "Txt": '<Field Type="Text" DisplayName="Txt" Name="Txt" StaticName="Txt"/>',
    "Volba": '<Field Type="Choice" DisplayName="Volba" Name="Volba" StaticName="Volba"><CHOICES><CHOICE>A</CHOICE><CHOICE>B</CHOICE><CHOICE>C</CHOICE></CHOICES></Field>',
    "Datum": '<Field Type="DateTime" Format="DateOnly" DisplayName="Datum" Name="Datum" StaticName="Datum"/>',
    "Cislo": '<Field Type="Number" DisplayName="Cislo" Name="Cislo" StaticName="Cislo"/>',
    "Osoba": '<Field Type="User" UserSelectionMode="PeopleOnly" DisplayName="Osoba" Name="Osoba" StaticName="Osoba"/>',
    "Vice": '<Field Type="MultiChoice" DisplayName="Vice" Name="Vice" StaticName="Vice"><CHOICES><CHOICE>X</CHOICE><CHOICE>Y</CHOICE></CHOICES></Field>',
    "Pozn": '<Field Type="Note" DisplayName="Pozn" Name="Pozn" StaticName="Pozn" NumLines="3" RichText="FALSE"/>',
}


def cmd_setup(a):
    s, j = req(a.web, "GET", L(a) + "?$select=Id")
    if s == 404:
        s, j = req(a.web, "POST", "/_api/web/lists", {"Title": a.list, "BaseTemplate": 100})
        out(step="list add", status=s, err=err(j) if s >= 300 else "")
    s, j = req(a.web, "GET", "/_api/web/lists/getbytitle('Pozadavky')?$select=Id")
    lookup_list = j.get("Id") if s == 200 else None
    defs = dict(TYPES)
    if lookup_list:
        defs["Odkaz"] = f'<Field Type="Lookup" DisplayName="Odkaz" Name="Odkaz" StaticName="Odkaz" List="{{{lookup_list}}}" ShowField="Title"/>'
    for i in range(1, 26):
        n = f"T{i:02d}"; defs[n] = f'<Field Type="Text" DisplayName="{n}" Name="{n}" StaticName="{n}"/>'
    s, j = req(a.web, "GET", L(a) + "/fields?$select=InternalName")
    have = {f["InternalName"] for f in j.get("value", [])}
    for n, x in defs.items():
        if n in have: continue
        s, j = req(a.web, "POST", L(a) + "/fields/CreateFieldAsXml", {"parameters": {"SchemaXml": x, "Options": 8}})
        out(step="field add", field=n, status=s, err=err(j) if s >= 300 else "")


def cmd_fill(a):
    s, j = req(a.web, "GET", "/_api/web/currentuser?$select=Id"); me = j["Id"]
    s, j = req(a.web, "GET", "/_api/web/lists/getbytitle('Pozadavky')/items?$select=Id&$top=50&$orderby=ID")
    look = [x["Id"] for x in j.get("value", [])] or [None]
    body = lambda i: {k: v for k, v in {
        "Title": f"Radek {i}", "Txt": f"t{i % 100}", "Volba": "ABC"[i % 3], "Datum": f"2026-{1 + i % 12:02d}-{1 + i % 28:02d}T00:00:00Z",
        "Cislo": i, "OsobaId": me, "OdkazId": look[i % len(look)], "Vice": ["X"] if i % 2 else ["X", "Y"],
        "Pozn": f"poznamka {i % 50}", **{f"OData__x0054_{k:02d}": f"v{i % 10}" for k in range(1, 26)}}.items() if v is not None}
    bodies = [body(i) for i in range(a.count)]
    lst = a.list.replace("'", "''")

    def batch(chunk):
        bd, cs = "batch_" + uuid.uuid4().hex, "changeset_" + uuid.uuid4().hex
        parts = "".join(f"--{cs}\r\nContent-Type: application/http\r\nContent-Transfer-Encoding: binary\r\n\r\nPOST {a.web}/_api/web/lists/getbytitle('{lst}')/items HTTP/1.1\r\n"
                        f"Accept: application/json;odata=nometadata\r\nContent-Type: application/json;odata=nometadata\r\n\r\n{json.dumps(b)}\r\n" for b in chunk)
        raw = (f"--{bd}\r\nContent-Type: multipart/mixed; boundary={cs}\r\n\r\n" + parts + f"--{cs}--\r\n--{bd}--\r\n").encode()
        for p in range(6):
            s, t = req(a.web, "POST", "/_api/$batch", raw=raw, extra={"Content-Type": f"multipart/mixed; boundary={bd}", "Accept": "application/json"})
            if s in (429, 503): time.sleep(5 * (p + 1)); continue
            ok = t.count("HTTP/1.1 201") if isinstance(t, str) else 0
            if ok != len(chunk): out(step="batch chyba", status=s, sample=(t if isinstance(t, str) else str(t))[:300])
            return ok
        return 0
    req(a.web, "GET", "/_api/web?$select=Id"); req(a.web, "POST", "/_api/contextinfo")  # digest
    t = time.time()
    with ThreadPoolExecutor(a.parallel) as ex:
        ok = sum(ex.map(batch, [bodies[i:i + a.per_batch] for i in range(0, len(bodies), a.per_batch)]))
    out(step="fill", vlozeno=ok, z=a.count, sec=round(time.time() - t, 1))


def indexed(a):
    s, j = req(a.web, "GET", L(a) + "/fields?$select=InternalName,TypeAsString,Indexed&$filter=Indexed eq true")
    return [f"{f['InternalName']}({f['TypeAsString']})" for f in j.get("value", [])] if s == 200 else err(j)


def cmd_status(a):
    s, j = req(a.web, "GET", L(a) + "?$select=ItemCount")
    out(step="status", items=j.get("ItemCount"), indexed=indexed(a))


def query(a, flt, orderby=None):
    q = f"{L(a)}/items?$select=Id&$top=100&$filter={flt}" + (f"&$orderby={orderby}" if orderby else "")
    t = time.time(); s, j = req(a.web, "GET", q)
    return s, round(time.time() - t, 2), (len(j["value"]) if s == 200 else err(j))


SAMPLE = {"Txt": "Txt eq 't3'", "Volba": "Volba eq 'B'", "Datum": "Datum eq datetime'2026-03-03T00:00:00Z'", "Cislo": "Cislo eq 42",
          "Osoba": "OsobaId eq {me}", "Odkaz": "OdkazId eq {look}", "Vice": "Vice eq 'Y'", "Pozn": "Pozn eq 'poznamka 3'", "Title": "Title eq 'Radek 7'"}


def sample_filter(a, field):
    f = SAMPLE.get(field, f"{field} eq 'v3'")
    if "{me}" in f:
        f = f.replace("{me}", str(req(a.web, "GET", "/_api/web/currentuser?$select=Id")[1]["Id"]))
    if "{look}" in f:
        s, j = req(a.web, "GET", "/_api/web/lists/getbytitle('Pozadavky')/items?$select=Id&$top=1&$orderby=ID")
        f = f.replace("{look}", str(j["value"][0]["Id"]))
    return f


def cmd_query(a):
    s, sec, n = query(a, a.filter, a.orderby)
    out(step="query", filter=a.filter, orderby=a.orderby, status=s, sec=sec, n=n)


def set_index(a, field, on, via):
    t = time.time()
    if via == "cli":
        r = subprocess.run(["m365", "spo", "field", "set", "--webUrl", a.web, "--listTitle", a.list, "--internalName", field,
                            "--Indexed", "true" if on else "false"], capture_output=True, text=True, env=M365_ENV)
        res = {"rc": r.returncode, "stdout": r.stdout.strip()[:200], "stderr": r.stderr.strip()[:300]}
    else:
        s, j = req(a.web, "POST", f"{L(a)}/fields/getbyinternalnameortitle('{field}')", {"Indexed": on},
                   extra={"IF-MATCH": "*", "X-HTTP-Method": "MERGE"})
        res = {"status": s, "err": err(j) if s >= 300 else ""}
    return res, round(time.time() - t, 2)


def cmd_index(a):
    flt = sample_filter(a, a.field)
    s, sec, n = query(a, flt)
    out(step="pred", field=a.field, filter=flt, status=s, sec=sec, n=n)
    res, sec = set_index(a, a.field, not a.off, a.via)
    out(step="index " + ("off" if a.off else "on"), field=a.field, via=a.via, sec=sec, **res)
    t0 = time.time()
    while True:
        s, sec, n = query(a, flt)
        out(step="po", field=a.field, after_sec=round(time.time() - t0, 1), status=s, sec=sec, n=n)
        if (s == 200) != a.off or time.time() - t0 > a.wait: break
        time.sleep(3)
    out(step="indexed", list=indexed(a))


def cmd_max(a):
    for f in a.fields.split(","):
        res, sec = set_index(a, f, True, "rest")
        out(step="max", field=f, sec=sec, **res, count=len(indexed(a)))
        if res.get("status", 0) >= 300: break


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = p.add_subparsers(dest="cmd", required=True)
    for c in ("setup", "fill", "status", "query", "index", "max"):
        x = sp.add_parser(c); x.add_argument("--web", required=True); x.add_argument("--list", default="IndexTest")
        if c == "fill":
            x.add_argument("--count", type=int, required=True); x.add_argument("--per-batch", type=int, default=100); x.add_argument("--parallel", type=int, default=4)
        if c == "query": x.add_argument("--filter", required=True); x.add_argument("--orderby")
        if c == "index":
            x.add_argument("--field", required=True); x.add_argument("--via", choices=["cli", "rest"], required=True)
            x.add_argument("--off", action="store_true"); x.add_argument("--wait", type=int, default=600)
        if c == "max": x.add_argument("--fields", required=True)
    a = p.parse_args()
    if TENANT not in a.web: sys.exit(f"jen lab tenant {TENANT}")
    globals()["cmd_" + a.cmd](a)


if __name__ == "__main__":
    main()
