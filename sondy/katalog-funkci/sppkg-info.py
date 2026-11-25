#!/usr/bin/env python3
"""Vypíše z .sppkg: solution id/název/verzi, web party (id, alias, výchozí vlastnosti) a webApiPermissionRequests.
Použití: sppkg-info.py <soubor.sppkg> [...] [--json]"""
import sys, zipfile, re, json
def info(p):
    z = zipfile.ZipFile(p); out = {"soubor": p, "webparty": []}
    for n in z.namelist():
        d = z.read(n)
        if n == "AppManifest.xml":
            t = d.decode("utf-8", "replace")
            out["solutionId"] = re.search(r'ProductID="([^"]+)"', t).group(1)
            out["nazev"] = re.search(r'Name="([^"]+)"', t).group(1)
            out["verze"] = re.search(r' Version="([^"]+)"', t).group(1)
            out["spfx"] = (re.search(r'Undefined-([0-9.]+)', t) or [None,None])[1]
            out["api"] = re.findall(r'<WebApiPermissionRequest ResourceId="([^"]+)" Scope="([^"]+)"', t)
            out["skipFeature"] = 'SkipFeatureDeployment="true"' in t or "IsClientSideSolution" in t and 'SkipFeatureDeployment="true"' in t
        if n.endswith(".xml") and b"ComponentManifest=" in d:
            import html
            t = d.decode("utf-8", "replace")
            m = re.search(r'ComponentManifest="(.*?)"', t, re.S)
            js = json.loads(html.unescape(m.group(1))) if m else None
            if js and js.get("componentType") == "WebPart":
                pe = js.get("preconfiguredEntries", [{}])[0]
                out["webparty"].append({"id": js["id"], "alias": js.get("alias"), "titulek": pe.get("title", {}).get("default"), "vlastnosti": pe.get("properties")})
    return out
if len(sys.argv) < 2 or "--help" in sys.argv:
    print(__doc__); sys.exit(0)
args=[a for a in sys.argv[1:] if a!="--json"]
res=[info(a) for a in args]
if "--json" in sys.argv: print(json.dumps(res, ensure_ascii=False, indent=1))
else:
    for r in res:
        print(f"== {r['soubor']}\n  {r.get('nazev')} {r.get('verze')} id={r.get('solutionId')} api={r.get('api')}")
        seen=set()
        for w in r["webparty"]:
            if w["id"] in seen: continue
            seen.add(w["id"]); print(f"   WP {w['id']} {w['alias']} '{w['titulek']}' {json.dumps(w['vlastnosti'],ensure_ascii=False)}")
