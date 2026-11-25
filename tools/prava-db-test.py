#!/usr/bin/env python3
"""Test práv na jednotlivé položky SharePointu přes backend (ca-egd-data-api v0.2, endpoint /api/sp/polozky/{id}/sdilet).

Podpříkazy:
  setup   (admin, m365 CLI lab) seznam SP_LIST s ReadSecurity=1 a vlastními právy: vlastníci webu Full Control,
          skupiny Zadavatelé a Schvalovatelé Contribute (každý vidí vše, dokud položka není „uzavřená“). Idempotentní.
  test    scénář pod reálnými účty: A založí položku → C (cizí zadavatel) ji chce sdílet → 403, bez role → 403,
          A nasdílí B (Read) → B vidí, C ne; C zkusí rozbít dědičnost přímo v SharePointu (bez backendu) → 403;
          Spravce nasdílí cizí položku → 200. Každé volání = JSON řádek (http, čas, tělo) na stdout.
Tokeny: ROPC přes tools/data-prava-token.py (hesla z lab.secrets.json, nic se neukládá). Admin: m365 util accesstoken get.
Příklad: python3 tools/prava-db-test.py test > sondy/container-app/prava-db/07-test.jsonl
"""
import argparse, json, os, subprocess, sys, time, urllib.error, urllib.parse, urllib.request

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("cmd", choices=["setup", "test"])
ap.add_argument("--base", default="https://ca-egd-data-api.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io")
ap.add_argument("--app", default="fec3e01a-6ce4-4f9e-9dff-a61b354151fb", help="appId API (egd-sonda-data-api)")
ap.add_argument("--web", default="https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-data-prava")
ap.add_argument("--list", default="Sdileni")
ap.add_argument("--a", default="tomas.prochazka", help="zadavatel A (vlastník položky)")
ap.add_argument("--b", default="eva.vesela", help="kolega B (dostane Read)")
ap.add_argument("--c", default="jakub.kucera", help="cizí zadavatel C")
ap.add_argument("--spravce", default="petra.novakova")
ap.add_argument("--bezrole", default="lucie.dvorakova")
a = ap.parse_args()
DOM = "pavelchocholousgmail.onmicrosoft.com"
here = os.path.dirname(os.path.abspath(__file__))
upn = lambda u: u if "@" in u else f"{u}@{DOM}"
_t = {}


def tok(who, kind):
    k = (who, kind)
    if k not in _t:
        if who == "admin":
            o = subprocess.run(["m365", "util", "accesstoken", "get", "--resource", urllib.parse.urlsplit(a.web)._replace(path="").geturl()],
                               capture_output=True, text=True, env={**os.environ, "HOME": os.path.expanduser("~/.m365-osobni")})
        elif kind == "api":
            o = subprocess.run([sys.executable, f"{here}/data-prava-token.py", who, "--resource", f"api://{a.app}", "--client", a.app], capture_output=True, text=True)
        else:
            o = subprocess.run([sys.executable, f"{here}/data-prava-token.py", who], capture_output=True, text=True)
        if o.returncode: sys.exit(f"token {who}/{kind}: {o.stderr[:300]}")
        _t[k] = o.stdout.strip().strip('"')
    return _t[k]


def http(method, url, token=None, body=None, extra=None):
    h = {"Accept": "application/json;odata=nometadata", **(extra or {})}
    if token: h["Authorization"] = "Bearer " + token
    data = None
    if body is not None: h["Content-Type"] = "application/json;odata=nometadata"; data = json.dumps(body).encode()
    t0 = time.time()
    try:
        with urllib.request.urlopen(urllib.request.Request(url.replace(" ", "%20"), data, h, method=method), timeout=120) as r: code, txt = r.status, r.read().decode()
    except urllib.error.HTTPError as e: code, txt = e.code, e.read().decode()
    try: j = json.loads(txt) if txt else None
    except Exception: j = txt
    return code, j, round(time.time() - t0, 2)


def log(krok, who, call, code, j, sec, ocekavano=None):
    rec = {"krok": krok, "kdo": who, "volani": call, "http": code, "sec": sec}
    if ocekavano is not None: rec["ocekavano"] = ocekavano; rec["sedi"] = code == ocekavano
    rec["telo"] = j if (isinstance(j, dict) and len(json.dumps(j)) < 1500) else str(j)[:400]
    print(json.dumps(rec, ensure_ascii=False), flush=True)
    return code, j


L = lambda: f"{a.web}/_api/web/lists/getbytitle('{a.list}')"


def sp(krok, who, method, path, body=None, exp=None):
    code, j, s = http(method, path if path.startswith("http") else a.web + "/_api/" + path, tok(who, "sp"), body)
    return log(krok, who, f"SP {method} {path.replace(a.web, '')}", code, j, s, exp)


def api(krok, who, method, path, body=None, exp=None):
    code, j, s = http(method, a.base + path, tok(who, "api") if who else None, body)
    return log(krok, who or "-", f"API {method} {path}", code, j, s, exp)


if a.cmd == "setup":
    code, j = sp("list-get", "admin", "GET", f"web/lists/getbytitle('{a.list}')?$select=Id,ReadSecurity,HasUniqueRoleAssignments")
    if code == 404:
        sp("list-create", "admin", "POST", "web/lists", {"Title": a.list, "BaseTemplate": 100, "Description": "sonda ca-prava-db: ACL na položku přes backend"}, 201)
    code, j = sp("list-unique?", "admin", "GET", f"web/lists/getbytitle('{a.list}')?$select=HasUniqueRoleAssignments")
    if not j.get("HasUniqueRoleAssignments"):
        sp("list-break", "admin", "POST", f"web/lists/getbytitle('{a.list}')/breakroleinheritance(copyRoleAssignments=false,clearSubscopes=true)", None, 200)
    _, g = sp("groups", "admin", "GET", "web/sitegroups?$select=Id,Title")
    gid = {x["Title"]: x["Id"] for x in g["value"]}
    _, og = sp("owners", "admin", "GET", "web/associatedownergroup?$select=Id,Title")
    _, full = sp("rd-full", "admin", "GET", "web/roledefinitions/getbytype(5)?$select=Id,Name")
    _, contrib = sp("rd-contribute", "admin", "GET", "web/roledefinitions/getbytype(3)?$select=Id,Name")
    for pid, rid in [(og["Id"], full["Id"]), (gid["Zadavatelé"], contrib["Id"]), (gid["Schvalovatelé"], contrib["Id"])]:
        sp("list-grant", "admin", "POST", f"web/lists/getbytitle('{a.list}')/roleassignments/addroleassignment(principalid={pid},roledefid={rid})", None, 200)
    sp("list-prava", "admin", "GET", f"web/lists/getbytitle('{a.list}')/roleassignments?$expand=Member,RoleDefinitionBindings&$select=Member/Title,RoleDefinitionBindings/Name")
    sys.exit(0)

# ---- test -----------------------------------------------------------------------------------------------------
A, B, C, S, X = a.a, a.b, a.c, a.spravce, a.bezrole
stamp = time.strftime("%H%M%S")
api("0-teplo", None, "GET", "/healthz", exp=200)
api("0-me", A, "GET", "/api/me", exp=200)
code, it = sp("1-A-zaklada", A, "POST", f"{L()}/items", {"Title": f"prava-db {stamp} (A)"}, 201)
iid = it["Id"]
sp("1-B-vidi-pred", B, "GET", f"{L()}/items({iid})?$select=Id,Title", exp=200)
sp("1-C-vidi-pred", C, "GET", f"{L()}/items({iid})?$select=Id,Title", exp=200)
api("2-bez-tokenu", None, "POST", f"/api/sp/polozky/{iid}/sdilet", {"komu": upn(C)}, exp=401)
api("2-bez-role", X, "POST", f"/api/sp/polozky/{iid}/sdilet", {"komu": upn(X)}, exp=403)
api("2-C-sdili-cizi", C, "POST", f"/api/sp/polozky/{iid}/sdilet", {"komu": upn(C), "role": "Edit"}, exp=403)
api("2-B-sdili-cizi", B, "POST", f"/api/sp/polozky/{iid}/sdilet", {"komu": upn(B)}, exp=403)
api("3-A-sdili-B", A, "POST", f"/api/sp/polozky/{iid}/sdilet", {"komu": upn(B), "role": "Read"}, exp=200)
api("3-A-prava", A, "GET", f"/api/sp/polozky/{iid}/prava", exp=200)
sp("4-A-vidi", A, "GET", f"{L()}/items({iid})?$select=Id,Title", exp=200)
sp("4-B-vidi", B, "GET", f"{L()}/items({iid})?$select=Id,Title", exp=200)
sp("4-C-nevidi", C, "GET", f"{L()}/items({iid})?$select=Id,Title", exp=404)
sp("4-C-seznam", C, "GET", f"{L()}/items?$select=Id&$filter=Id eq {iid}", exp=200)
code, j, s = http("PATCH", f"{L()}/items({iid})", tok(B, "sp"), {"Title": "B prepsal"}, {"If-Match": "*"})
log("4-B-nesmi-upravit-PATCH", B, f"SP PATCH items({iid})", code, j, s, 403)
# bez backendu: C nemá ManagePermissions ani na vlastní položce
code, own = sp("5-C-zaklada-vlastni", C, "POST", f"{L()}/items", {"Title": f"prava-db {stamp} (C)"}, 201)
sp("5-C-rozbiji-sam", C, "POST", f"{L()}/items({own['Id']})/breakroleinheritance(copyRoleAssignments=false,clearSubscopes=true)", None, 403)
# Spravce smí sdílet cizí položku
api("6-spravce-sdili-C", S, "POST", f"/api/sp/polozky/{iid}/sdilet", {"komu": upn(C), "role": "Read"}, exp=200)
sp("6-C-vidi-po-spravci", C, "GET", f"{L()}/items({iid})?$select=Id,Title", exp=200)
api("6-prava-konec", S, "GET", f"/api/sp/polozky/{iid}/prava", exp=200)
api("7-neexistujici", A, "POST", "/api/sp/polozky/999999/sdilet", {"komu": upn(B)}, exp=404)
api("7-spatny-vstup", A, "POST", f"/api/sp/polozky/{iid}/sdilet", {"komu": "nikdo"}, exp=400)
