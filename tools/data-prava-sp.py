#!/usr/bin/env python3
"""Sonda data-prava: SharePoint seznam se 3 rolemi, item-level security a měření v labu.

Pracuje jen s labem (tenant pavelchocholousgmail) a webem /sites/egd-sonda-data-prava.
Admin token: m365 CLI (HOME=~/.m365-osobni, `util accesstoken get`); uživatelé: ROPC přes
data-prava-token.py (hesla z ~/Projects/ppf-rooms/lab/lab.secrets.json, nikam se neukládají).

Podpříkazy:
  setup      skupiny, úroveň oprávnění, seznam Zadosti (ReadSecurity/WriteSecurity=2), práva
  matrix     co kdo vidí a smí (čtení, přidání, úprava, mazání cizí položky, EffectiveBasePermissions)
  extras     přílohy, verze, unique permissions na položku, EffectiveBasePermissions položky
  bulk       vloží N položek do seznamu Velky (výchozí 6000) přes SP $batch a změří čas
  threshold  dotazy nad Velky: bez filtru, filtr indexovaný/neindexovaný sloupec, stránkování
Výsledky jdou na stdout jako JSON řádky (ukládej přesměrováním).
"""
import argparse, json, os, subprocess, sys, time, urllib.error, urllib.parse, urllib.request, uuid
from concurrent.futures import ThreadPoolExecutor

TENANT_DOM = "pavelchocholousgmail.onmicrosoft.com"
ORIGIN = "https://pavelchocholousgmail.sharepoint.com"
WEB = ORIGIN + "/sites/egd-sonda-data-prava"
TOKEN_TOOL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data-prava-token.py")
# role -> lab účet (alice/bob nemají heslo v lab.secrets.json, proto jiné účty)
USERS = {
    "zadavatel1": "tomas.prochazka", "zadavatel2": "jakub.kucera",
    "schvalovatel": "eva.vesela", "schvalovatel_edit": "martina.cerna",
    "spravce": "petra.novakova", "cizi": "lucie.dvorakova",
}
GROUPS = {"Zadavatele": "Zadavatelé", "Schvalovatele": "Schvalovatelé", "Spravci": "Správci", "SchvalovateleEdit": "Schvalovatelé (Edit)"}

KIND = {"ViewListItems": 1, "AddListItems": 2, "EditListItems": 3, "DeleteListItems": 4, "ApproveItems": 5, "OpenItems": 6,
        "ViewVersions": 7, "CancelCheckout": 9, "ManageLists": 12, "ViewFormPages": 13, "Open": 17, "ViewPages": 18,
        "ManagePermissions": 26, "BrowseUserInfo": 28, "UseClientIntegration": 37, "UseRemoteAPIs": 38}
SCHV_RIGHTS = ["ViewListItems", "AddListItems", "EditListItems", "DeleteListItems", "CancelCheckout", "ViewVersions", "OpenItems",
               "ViewFormPages", "Open", "ViewPages", "BrowseUserInfo", "UseRemoteAPIs", "UseClientIntegration"]
ZAD_RIGHTS = [r for r in SCHV_RIGHTS if r not in ("CancelCheckout",)]  # = Contribute-like, bez override


def mask(names):
    m = 0
    for n in names: m |= 1 << (KIND[n] - 1)
    return m


def names_of(low, high=0):
    v = (int(high) << 32) | int(low)
    return [n for n, k in KIND.items() if v & (1 << (k - 1))]


_tok = {}
def token(who=None):
    key = who or "_admin"
    if key not in _tok:
        if who is None:
            out = subprocess.run(["m365", "util", "accesstoken", "get", "--resource", ORIGIN], capture_output=True, text=True,
                                 env={**os.environ, "HOME": os.path.expanduser("~/.m365-osobni")})
            if out.returncode: sys.exit(out.stderr)
            _tok[key] = out.stdout.strip().strip('"')
        else:
            out = subprocess.run([sys.executable, TOKEN_TOOL, USERS.get(who, who)], capture_output=True, text=True)
            if out.returncode: sys.exit(out.stderr)
            _tok[key] = out.stdout.strip()
    return _tok[key]


_dig = {}
def req(method, path, body=None, who=None, extra=None, raw=None, verbose=False, expect=None):
    """Vrací (status, json|text). path začíná /_api/... nebo je plná URL."""
    url = urllib.parse.quote(path if path.startswith("http") else WEB + path, safe=":/?&=$,()'|@%")
    h = {"Authorization": "Bearer " + token(who), "Accept": "application/json;odata=" + ("verbose" if verbose else "nometadata")}
    data = raw
    if body is not None:
        h["Content-Type"] = "application/json;odata=" + ("verbose" if verbose else "nometadata")
        data = json.dumps(body).encode()
    if method != "GET":
        key = who or "_admin"
        if key not in _dig:
            r = urllib.request.Request(WEB + "/_api/contextinfo", b"", {"Authorization": h["Authorization"], "Accept": "application/json;odata=nometadata"})
            try: _dig[key] = json.load(urllib.request.urlopen(r))["FormDigestValue"]
            except urllib.error.HTTPError as e: return e.code, "contextinfo: " + e.read().decode()[:200]
        h["X-RequestDigest"] = _dig[key]
    h.update(extra or {})
    r = urllib.request.Request(url, data, h, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            t = resp.read().decode()
            return resp.status, (json.loads(t) if t and "json" in resp.headers.get("Content-Type", "") else t)
    except urllib.error.HTTPError as e:
        t = e.read().decode()
        try: j = json.loads(t)
        except Exception: j = t
        return e.code, j


def err(j):
    if isinstance(j, dict):
        e = j.get("odata.error") or j.get("error") or {}
        m = e.get("message"); m = m.get("value") if isinstance(m, dict) else m
        return (m or "")[:160]
    return str(j)[:160]


def out(**kw):
    print(json.dumps(kw, ensure_ascii=False), flush=True)


def ensure_group(title):
    s, j = req("GET", f"/_api/web/sitegroups?$filter=Title eq '{title}'&$select=Id,Title")
    if s == 200 and j["value"]: return j["value"][0]["Id"]
    s, j = req("POST", "/_api/web/sitegroups", {"__metadata": {"type": "SP.Group"}, "Title": title, "Description": "sonda data-prava"}, verbose=True)
    assert s in (200, 201), (s, j)
    return j["d"]["Id"]


def add_member(gid, who):
    login = f"i:0#.f|membership|{USERS[who]}@{TENANT_DOM}"
    s, j = req("POST", f"/_api/web/sitegroups/getbyid({gid})/users", {"__metadata": {"type": "SP.User"}, "LoginName": login}, verbose=True)
    assert s in (200, 201), (who, s, err(j))


def ensure_level(name, rights):
    s, j = req("GET", f"/_api/web/roledefinitions?$filter=Name eq '{name}'&$select=Id,BasePermissions")
    if s == 200 and j["value"]: return j["value"][0]["Id"]
    m = mask(rights)
    s, j = req("POST", "/_api/web/roledefinitions", {"__metadata": {"type": "SP.RoleDefinition"}, "Name": name, "Description": "sonda data-prava",
               "Order": 1000 + len(name), "BasePermissions": {"__metadata": {"type": "SP.BasePermissions"}, "High": "0", "Low": str(m & 0xFFFFFFFF)}}, verbose=True)
    assert s in (200, 201), (s, err(j))
    return j["d"]["Id"]


def ensure_list(title, readsec=1, writesec=1):
    s, j = req("GET", f"/_api/web/lists?$filter=Title eq '{title}'&$select=Id")
    if not (s == 200 and j["value"]):
        s, j = req("POST", "/_api/web/lists", {"__metadata": {"type": "SP.List"}, "BaseTemplate": 100, "Title": title, "EnableAttachments": True,
                   "EnableVersioning": True}, verbose=True)
        assert s in (200, 201), (s, err(j))
    s, j = req("POST", f"/_api/web/lists/getbytitle('{title}')", {"__metadata": {"type": "SP.List"}, "ReadSecurity": readsec, "WriteSecurity": writesec,
               "EnableVersioning": True}, extra={"X-HTTP-Method": "MERGE", "IF-MATCH": "*"}, verbose=True)
    assert s in (200, 204), (s, err(j))


def ensure_field(lst, name, kind, indexed=False, choices=None):
    s, j = req("GET", f"/_api/web/lists/getbytitle('{lst}')/fields?$filter=InternalName eq '{name}'&$select=Id")
    if not (s == 200 and j["value"]):
        body = {"__metadata": {"type": "SP.FieldCreationInformation"}, "Title": name, "FieldTypeKind": kind}
        if choices: body["Choices"] = {"__metadata": {"type": "Collection(Edm.String)"}, "results": choices}
        s, j = req("POST", f"/_api/web/lists/getbytitle('{lst}')/fields/addfield", {"parameters": body}, verbose=True)
        assert s in (200, 201), (name, s, err(j))
    if indexed:
        s, j = req("POST", f"/_api/web/lists/getbytitle('{lst}')/fields/getbyinternalnameortitle('{name}')", {"Indexed": True},
                   extra={"X-HTTP-Method": "MERGE", "IF-MATCH": "*"})
        assert s in (200, 204), (name, s, err(j))


def set_perms(lst, assigns):
    api = f"/_api/web/lists/getbytitle('{lst}')"
    s, j = req("POST", api + "/breakroleinheritance(copyRoleAssignments=false,clearSubscopes=true)")
    assert s in (200, 204), (s, err(j))
    for pid, rid in assigns:
        s, j = req("POST", api + f"/roleassignments/addroleassignment(principalid={pid},roledefid={rid})")
        assert s in (200, 204), (pid, rid, s, err(j))


def cmd_setup(a):
    g = {k: ensure_group(v) for k, v in GROUPS.items()}
    out(step="groups", **g)
    for who, grp in [("zadavatel1", "Zadavatele"), ("zadavatel2", "Zadavatele"), ("schvalovatel", "Schvalovatele"),
                     ("schvalovatel_edit", "SchvalovateleEdit"), ("spravce", "Spravci")]:
        add_member(g[grp], who)
    s, j = req("GET", "/_api/web/roledefinitions?$select=Id,Name,RoleTypeKind")
    rd = {r["Name"]: r["Id"] for r in j["value"]}
    kind = {r["RoleTypeKind"]: r["Id"] for r in j["value"]}
    lv_zad = ensure_level("EGD Zadavatel", ZAD_RIGHTS)
    lv_schv = ensure_level("EGD Schvalovatel", SCHV_RIGHTS)
    out(step="levels", zadavatel=lv_zad, schvalovatel=lv_schv, read=kind[2], edit=kind[6], design=kind[4], full=kind[5])
    # web: všechny skupiny čtou (stránka/otevření), data řeší list
    for pid in g.values():
        req("POST", f"/_api/web/roleassignments/addroleassignment(principalid={pid},roledefid={kind[2]})")
    s, j = req("GET", "/_api/web/AssociatedOwnerGroup?$select=Id")
    owners = j["Id"]
    for ln, rs, ws in (("Zadosti", 2, 2), ("ZadostiW", 1, 2)):  # ZadostiW = jen WriteSecurity (vzor digi-podnety)
        ensure_list(ln, rs, ws)
        for n, k, ix, ch in [("Popis", 3, False, None), ("Castka", 9, True, None), ("Stav", 6, True, ["Nova", "Schvaleno", "Zamitnuto"]),
                             ("Oddeleni", 2, True, None), ("Pozn", 3, False, None)]:
            ensure_field(ln, n, k, ix, ch)
        set_perms(ln, [(owners, kind[5]), (g["Spravci"], kind[5]), (g["Zadavatele"], lv_zad), (g["Schvalovatele"], lv_schv),
                       (g["SchvalovateleEdit"], kind[6])])
        out(step=f"list {ln} hotov", readSecurity=rs, writeSecurity=ws)
    # velký seznam bez item-level security
    ensure_list("Velky", 1, 1)
    for n, k, ix, ch in [("Popis", 3, False, None), ("Castka", 9, True, None), ("Kategorie", 2, True, None), ("Neindexovano", 2, False, None)]:
        ensure_field("Velky", n, k, ix, ch)
    set_perms("Velky", [(owners, kind[5]), (g["Spravci"], kind[5]), (g["Zadavatele"], lv_zad), (g["Schvalovatele"], lv_schv)])
    out(step="list Velky hotov")


def cmd_matrix(a):
    LN = a.list
    LP = f"/_api/web/lists/getbytitle('{LN}')"
    # data: tomas a jakub založí po 2 položkách, admin jednu
    ids = {}
    for who in ("zadavatel1", "zadavatel2"):
        for i in range(2):
            s, j = req("POST", LP + "/items", {"Title": f"{who} #{i}", "Castka": 100 + i, "Stav": "Nova", "Oddeleni": "IT"}, who=who)
            out(step="add", who=who, status=s, err=err(j) if s >= 300 else "")
            if s < 300: ids.setdefault(who, []).append(j["Id"])
    s, j = req("POST", LP + "/items", {"Title": "admin polozka", "Stav": "Nova"})
    ids["admin"] = [j["Id"]]
    out(step="ids", **ids)
    foreign = {"zadavatel1": ids["zadavatel2"][0], "zadavatel2": ids["zadavatel1"][0]}
    for who in (a.only or ["zadavatel1", "zadavatel2", "schvalovatel", "schvalovatel_edit", "spravce", "cizi"]):
        r = {"who": who, "upn": USERS[who]}
        s, j = req("GET", LP + "/items?$select=Id,Title,Author/Title&$expand=Author", who=who)
        r["read_status"] = s
        r["sees"] = [i["Title"] for i in j["value"]] if s == 200 else err(j)
        s, j = req("GET", LP + "/EffectiveBasePermissions", who=who)
        r["list_perms"] = names_of(j["Low"], j["High"]) if s == 200 else (s, err(j))
        r["list_perms_ManageLists"] = "ManageLists" in r["list_perms"] if s == 200 else None
        s, j = req("POST", LP + "/items", {"Title": f"{who} novy"}, who=who)
        r["add"] = s if s >= 300 else 201
        if s < 300: r["_novy"] = j["Id"]
        tgt = foreign.get(who, ids["zadavatel1"][0])
        s, j = req("GET", f"{LP}/items({tgt})?$select=Id,Title", who=who)
        r["read_foreign_direct"] = s
        s, j = req("POST", f"{LP}/items({tgt})", {"Pozn": f"zasah {who}"}, who=who, extra={"X-HTTP-Method": "MERGE", "IF-MATCH": "*"})
        r["edit_foreign"] = s if s >= 300 else "OK"
        r["edit_foreign_err"] = err(j) if s >= 300 else ""
        if "_novy" in r:
            s, j = req("POST", f"{LP}/items({r['_novy']})", {"Pozn": "moje"}, who=who, extra={"X-HTTP-Method": "MERGE", "IF-MATCH": "*"})
            r["edit_own"] = s if s >= 300 else "OK"
            s, j = req("POST", f"{LP}/items({r['_novy']})", who=who, extra={"X-HTTP-Method": "DELETE", "IF-MATCH": "*"})
            r["delete_own"] = s if s >= 300 else "OK"
            del r["_novy"]
        s, j = req("POST", f"{LP}/items({tgt})/recycle" if False else f"{LP}/items({ids['admin'][0]})", who=who,
                   extra={"X-HTTP-Method": "DELETE", "IF-MATCH": "*"}) if who not in ("spravce",) else (None, None)
        r["delete_foreign(admin polozka)"] = s if s is None or s >= 300 else "OK (smazáno!)"
        if s and s < 300:
            s2, j2 = req("POST", LP + "/items", {"Title": "admin polozka"}); ids["admin"] = [j2["Id"]]
        out(**r)


def cmd_extras(a):
    L = "/_api/web/lists/getbytitle('Zadosti')"
    s, j = req("GET", L + "/items?$select=Id,Title&$orderby=Id", who="spravce")
    items = {i["Title"]: i["Id"] for i in j["value"]}
    mine = items["zadavatel1 #0"]; theirs = items["zadavatel2 #0"]
    # příloha: zadavatel1 přidá, ostatní zkusí číst
    s, j = req("POST", L + f"/items({mine})/AttachmentFiles/add(FileName='tajne.txt')", who="zadavatel1", raw=b"tajny obsah", extra={"Content-Type": "application/octet-stream"})
    out(step="attach add", status=s, err=err(j) if s >= 300 else "")
    url = f"/_api/web/lists/getbytitle('Zadosti')/items({mine})/AttachmentFiles('tajne.txt')/$value"
    for who in ["zadavatel1", "zadavatel2", "schvalovatel", "cizi", "spravce"]:
        s, j = req("GET", url, who=who)
        out(step="attach read (REST)", who=who, status=s, body=(j if s == 200 else err(j))[:30])
        s, j = req("GET", f"/_api/web/lists/getbytitle('Zadosti')/items({mine})/AttachmentFiles?$select=FileName", who=who)
        out(step="attach list", who=who, status=s, files=[f["FileName"] for f in j["value"]] if s == 200 else err(j))
    # přímá adresa souboru Lists/Zadosti/Attachments/<id>/tajne.txt
    for who in ["zadavatel2", "schvalovatel", "cizi"]:
        s, j = req("GET", f"{WEB}/Lists/Zadosti/Attachments/{mine}/tajne.txt", who=who)
        out(step="attach direct URL", who=who, status=s)
    # verze
    s, j = req("POST", L + f"/items({mine})", {"Pozn": "v2"}, who="zadavatel1", extra={"X-HTTP-Method": "MERGE", "IF-MATCH": "*"})
    for who in ["zadavatel1", "zadavatel2", "schvalovatel", "cizi"]:
        s, j = req("GET", L + f"/items({mine})/versions?$select=VersionLabel", who=who)
        out(step="versions of tomas item", who=who, status=s, n=len(j["value"]) if s == 200 else err(j))
    # EffectiveBasePermissions položky
    for who in ["zadavatel1", "zadavatel2", "schvalovatel", "schvalovatel_edit"]:
        for lab, iid in (("own", mine), ("foreign", theirs)):
            s, j = req("GET", L + f"/items({iid})/EffectiveBasePermissions", who=who)
            out(step="item EffectiveBasePermissions", who=who, item=lab, status=s,
                perms=[p for p in names_of(j["Low"], j["High"]) if p in ("ViewListItems", "EditListItems", "DeleteListItems", "CancelCheckout", "ManageLists")] if s == 200 else err(j))
    # unique permissions na položku: zadavatel1 sdílí svou položku se zadavatelem2 (čtení)
    s, j = req("GET", "/_api/web/siteusers?$select=Id,LoginName&$filter=substringof('jakub.kucera',LoginName)", who="spravce")
    uid = j["value"][0]["Id"]
    s, j = req("GET", "/_api/web/roledefinitions?$filter=RoleTypeKind eq 2&$select=Id")
    readid = j["value"][0]["Id"]
    s, j = req("POST", L + f"/items({mine})/breakroleinheritance(copyRoleAssignments=true,clearSubscopes=false)", who="zadavatel1")
    out(step="zadavatel1 break inheritance na vlastni polozce", status=s, err=err(j) if s >= 300 else "")
    s, j = req("POST", L + f"/items({mine})/breakroleinheritance(copyRoleAssignments=true,clearSubscopes=false)", who="spravce")
    out(step="spravce break inheritance", status=s, err=err(j) if s >= 300 else "")
    s, j = req("POST", L + f"/items({mine})/roleassignments/addroleassignment(principalid={uid},roledefid={readid})", who="spravce")
    out(step="share item s jakub (Read)", status=s, err=err(j) if s >= 300 else "")
    s, j = req("GET", L + f"/items({mine})?$select=Title", who="zadavatel2")
    out(step="jakub cte sdilenou polozku", status=s, title=j.get("Title") if s == 200 else err(j))
    s, j = req("GET", L + "/items?$select=Id", who="zadavatel2")
    out(step="jakub vidi ted pocet", n=len(j["value"]))
    # čas hromadného unique permissions
    t = time.time(); n = 0
    for i in range(30):
        s, j = req("POST", L + "/items", {"Title": f"uniq {i}"}, who="spravce")
        iid = j["Id"]
        s, j = req("POST", L + f"/items({iid})/breakroleinheritance(copyRoleAssignments=true,clearSubscopes=false)", who="spravce"); n += s < 300
    out(step="30 polozek + break inheritance", sec=round(time.time() - t, 1), ok=n)


def cmd_extras2(a):
    """Přímý přístup k příloze (soubor) a vzor ReadSecurity=1 + unikátní práva na položce (copyRoleAssignments=false)."""
    L = "/_api/web/lists/getbytitle('Zadosti')"
    s, j = req("GET", L + "/items?$select=Id,Title&$orderby=Id desc&$top=50", who="spravce")
    mine = next(i["Id"] for i in j["value"] if i["Title"] == "zadavatel1 #0")
    path = f"/sites/egd-sonda-data-prava/Lists/Zadosti/Attachments/{mine}/tajne.txt"
    for who in ["zadavatel1", "zadavatel2", "schvalovatel", "schvalovatel_edit", "spravce"]:
        s, j = req("GET", f"/_api/web/GetFileByServerRelativeUrl('{path}')/$value", who=who)
        out(step="priloha pres GetFileByServerRelativeUrl", who=who, status=s, body=(j[:12] if s == 200 else err(j)))
    s, j = req("GET", "/_api/web/siteusers?$select=Id,LoginName&$filter=substringof('tomas.prochazka',LoginName)", who="spravce"); tid = j["value"][0]["Id"]
    s, j = req("GET", "/_api/web/roledefinitions?$select=Id,Name,RoleTypeKind"); rd = {r["Name"]: r["Id"] for r in j["value"]}
    cid = rd["EGD Zadavatel"]
    # list s ReadSecurity=1: všichni zadavatelé mají Contribute-like na listu, ale položka dostane vlastní ACL
    ensure_list("ZadostiACL", 1, 1)
    ensure_field("ZadostiACL", "Pozn", 3)
    s, j = req("GET", "/_api/web/sitegroups?$select=Id,Title"); g = {x["Title"]: x["Id"] for x in j["value"]}
    s, j = req("GET", "/_api/web/AssociatedOwnerGroup?$select=Id"); owners = j["Id"]
    set_perms("ZadostiACL", [(owners, rd["Full Control"] if "Full Control" in rd else 1073741829), (g["Zadavatelé"], cid), (g["Schvalovatelé"], rd["EGD Schvalovatel"])])
    L2 = "/_api/web/lists/getbytitle('ZadostiACL')"
    s, j = req("GET", L2 + "/items?$select=Title")
    have = {i["Title"] for i in j["value"]} if s == 200 else set()
    for who in ("zadavatel1", "zadavatel2"):
        if f"acl {who}" not in have:
            s, j = req("POST", L2 + "/items", {"Title": f"acl {who}"}, who=who); out(step="ACL: zadavatel pridava", who=who, status=s)
    s, j = req("GET", L2 + "/items?$select=Id,Title", who=None); ids = {i["Title"]: i["Id"] for i in j["value"]}
    for ttl, iid in ids.items():
        who1 = "zadavatel1" if "zadavatel1" in ttl else "zadavatel2"
        s, j = req("GET", f"/_api/web/siteusers?$select=Id&$filter=substringof('{USERS[who1]}',LoginName)", who=None); uid = j["value"][0]["Id"]
        s, j = req("POST", L2 + f"/items({iid})/breakroleinheritance(copyRoleAssignments=false,clearSubscopes=false)", who=None)
        out(step="ACL: break (copy=false)", item=ttl, status=s)
        for pid, rid in ((owners, 1073741829), (g["Schvalovatelé"], rd["EGD Schvalovatel"]), (uid, cid)):
            req("POST", L2 + f"/items({iid})/roleassignments/addroleassignment(principalid={pid},roledefid={rid})", who=None)
    for who in ["zadavatel1", "zadavatel2", "schvalovatel", "schvalovatel_edit"]:
        s, j = req("GET", L2 + "/items?$select=Id,Title", who=who)
        out(step="ACL: kdo co vidi", who=who, status=s, sees=[i["Title"] for i in j["value"]] if s == 200 else err(j))
    s, j = req("POST", L2 + f"/items({ids['acl zadavatel1']})", {"Pozn": "x"}, who="zadavatel2", extra={"X-HTTP-Method": "MERGE", "IF-MATCH": "*"})
    out(step="ACL: zadavatel2 edituje cizi", status=s)
    s, j = req("POST", L2 + f"/items({ids['acl zadavatel1']})/breakroleinheritance(copyRoleAssignments=true,clearSubscopes=false)", who="zadavatel1")
    out(step="ACL: zadavatel sam rozbije dedicnost na sve polozce", status=s)
    s, j = req("GET", "/_api/web/lists/getbytitle('Velky')/items?$filter=Castka ge 0&$select=Id&$top=100", who=None)
    out(step="Velky: indexovany filtr s >5000 vysledky", status=s, err=err(j) if s >= 300 else "")
    s, j = req("GET", "/_api/web/lists/getbytitle('Velky')/items?$filter=Castka ge 0&$select=Id&$top=100", who="zadavatel1")
    out(step="Velky: indexovany filtr s >5000 vysledky (zadavatel)", status=s, err=err(j) if s >= 300 else "")


def batch(lst, bodies, who=None):
    bd, cs = "batch_" + uuid.uuid4().hex, "changeset_" + uuid.uuid4().hex
    parts = []
    for b in bodies:
        parts.append(f"--{cs}\r\nContent-Type: application/http\r\nContent-Transfer-Encoding: binary\r\n\r\nPOST {WEB}/_api/web/lists/getbytitle('{lst}')/items HTTP/1.1\r\n"
                     f"Accept: application/json;odata=nometadata\r\nContent-Type: application/json;odata=nometadata\r\n\r\n{json.dumps(b)}\r\n")
    raw = (f"--{bd}\r\nContent-Type: multipart/mixed; boundary={cs}\r\n\r\n" + "".join(parts) + f"--{cs}--\r\n--{bd}--\r\n").encode()
    for attempt in range(6):
        s, t = req("POST", "/_api/$batch", raw=raw, who=who, extra={"Content-Type": f"multipart/mixed; boundary={bd}", "Accept": "application/json"})
        if s in (429, 503):
            time.sleep(5 * (attempt + 1)); continue
        break
    ok = t.count("HTTP/1.1 201") if isinstance(t, str) else 0
    return s, ok, (t[:300] if s >= 300 or ok != len(bodies) else "")


def cmd_bulk(a):
    n, per, par = a.count, a.per_batch, a.parallel
    bodies = [{"Title": f"Polozka {i}", "Castka": i, "Kategorie": f"K{i % 20}", "Neindexovano": f"N{i % 20}", "Popis": "x" * 50} for i in range(n)]
    chunks = [bodies[i:i + per] for i in range(0, n, per)]
    token(None)
    t = time.time()
    with ThreadPoolExecutor(par) as ex: res = list(ex.map(lambda c: batch("Velky", c), chunks))
    dt = time.time() - t
    out(step="bulk", items=n, per_batch=per, parallel=par, sec=round(dt, 1), per_sec=round(n / dt, 1), created=sum(r[1] for r in res),
        statuses=sorted({r[0] for r in res}), sample_error=next((r[2] for r in res if r[2]), ""))


def cmd_threshold(a):
    V = "/_api/web/lists/getbytitle('Velky')"
    s, j = req("GET", V + "?$select=ItemCount")
    out(step="ItemCount", n=j.get("ItemCount"))
    for who in (None, "zadavatel1"):
        tests = [
            ("top=100 bez filtru", V + "/items?$top=100&$select=Id"),
            ("top=5000 bez filtru", V + "/items?$top=5000&$select=Id"),
            ("top=5001 bez filtru", V + "/items?$top=5001&$select=Id"),
            ("filtr indexovany Kategorie eq K3 (300 vysl.)", V + "/items?$filter=Kategorie eq 'K3'&$select=Id&$top=500"),
            ("filtr indexovany Castka lt 100", V + "/items?$filter=Castka lt 100&$select=Id&$top=500"),
            ("filtr NEindexovany eq N3", V + "/items?$filter=Neindexovano eq 'N3'&$select=Id&$top=500"),
            ("filtr NEindexovany + top=10", V + "/items?$filter=Neindexovano eq 'N3'&$select=Id&$top=10"),
            ("orderby neindexovany", V + "/items?$orderby=Neindexovano&$select=Id&$top=10"),
            ("orderby indexovany Castka", V + "/items?$orderby=Castka desc&$select=Id&$top=10"),
            ("filtr indexovany Kategorie + orderby neindexovany", V + "/items?$filter=Kategorie eq 'K3'&$orderby=Neindexovano&$select=Id&$top=10"),
            ("filtr indexovany Kategorie eq K3 + neindexovany Neindexovano eq N3", V + "/items?$filter=Kategorie eq 'K3' and Neindexovano eq 'N3'&$select=Id&$top=500"),
        ]
        for lab, p in tests:
            t = time.time(); s, j = req("GET", p, who=who)
            out(step=lab, who=who or "admin(vlastnik webu)", status=s, n=len(j["value"]) if s == 200 else None, sec=round(time.time() - t, 2), err=err(j) if s >= 300 else "")
        t = time.time(); n = 0; pages = 0; url = V + "/items?$select=Id&$top=1000"
        while url:
            s, j = req("GET", url, who=who)
            if s != 200: out(step="strankovani", status=s, err=err(j)); break
            n += len(j["value"]); pages += 1; url = j.get("odata.nextLink")
        out(step="stránkování všeho po 1000", who=who or "admin", n=n, pages=pages, sec=round(time.time() - t, 2))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = p.add_subparsers(dest="cmd", required=True)
    for c in ("setup", "extras", "extras2", "threshold"): sp.add_parser(c)
    m = sp.add_parser("matrix"); m.add_argument("--list", default="Zadosti"); m.add_argument("--only", nargs="*")
    b = sp.add_parser("bulk")
    b.add_argument("--count", type=int, default=6000); b.add_argument("--per-batch", type=int, default=100); b.add_argument("--parallel", type=int, default=4)
    a = p.parse_args()
    globals()["cmd_" + a.cmd](a)


if __name__ == "__main__":
    main()
