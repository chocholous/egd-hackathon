#!/usr/bin/env python3
"""Matice volání cesty C (Container App + Azure SQL + app role z tokenu): co smí kdo, s časy. Výstup JSON řádky na stdout.
Použití: overeni-data-api-matrix.py [--base URL]   (tokeny ROPC přes data-prava-token.py; hesla z lab.secrets.json)
Zakládá 2 testovací žádosti (Nazev 'overeni-…'); nic nemaže (Spravce DELETE se netestuje, jen 403 pro Schvalovatele)."""
import argparse, json, os, subprocess, sys, time, urllib.request, urllib.error
ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--base", default="https://ca-egd-data-api.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io")
ap.add_argument("--app", default="fec3e01a-6ce4-4f9e-9dff-a61b354151fb")
a = ap.parse_args(); here = os.path.dirname(os.path.abspath(__file__))
def tok(u): return subprocess.run([sys.executable, f"{here}/data-prava-token.py", u, "--resource", f"api://{a.app}", "--client", a.app], capture_output=True, text=True).stdout.strip()
def call(user, method, path, body=None, token=None):
    t = tok(user) if token is None and user else token
    h = {"Content-Type": "application/json"}; 
    if t: h["Authorization"] = "Bearer " + t
    r = urllib.request.Request(a.base + path, json.dumps(body).encode() if body is not None else None, h, method=method)
    t0 = time.time()
    try: resp = urllib.request.urlopen(r, timeout=120); code, txt = resp.status, resp.read().decode()
    except urllib.error.HTTPError as e: code, txt = e.code, e.read().decode()
    rec = {"user": user or "-", "call": f"{method} {path}", "http": code, "sec": round(time.time() - t0, 2), "body": txt[:200]}
    print(json.dumps(rec, ensure_ascii=False), flush=True); return code, txt
call(None, "GET", "/healthz")
call(None, "GET", "/api/zadosti")
call("lucie.dvorakova", "GET", "/api/zadosti")
call("tomas.prochazka", "GET", "/api/me")
c1, t1 = call("tomas.prochazka", "POST", "/api/zadosti", {"nazev": "overeni-tomas", "castka": 100})
c2, t2 = call("jakub.kucera", "POST", "/api/zadosti", {"nazev": "overeni-jakub", "castka": 200})
call("tomas.prochazka", "GET", "/api/zadosti")
call("jakub.kucera", "GET", "/api/zadosti")
call("eva.vesela", "GET", "/api/zadosti")
i1 = json.loads(t1).get("id") if c1 == 201 else 0
call("tomas.prochazka", "POST", f"/api/zadosti/{i1}/stav", {"stav": "Schvaleno"})
call("eva.vesela", "POST", f"/api/zadosti/{i1}/stav", {"stav": "Schvaleno"})
call("eva.vesela", "POST", "/api/zadosti", {"nazev": "overeni-eva"})
call("eva.vesela", "DELETE", f"/api/zadosti/{i1}")
call("petra.novakova", "GET", "/api/me")
