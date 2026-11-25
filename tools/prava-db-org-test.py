#!/usr/bin/env python3
"""Test práv podle oddělení a nadřízeného v DB API (ca-egd-data-api v0.3): /api/org/sync, /api/org/me, /api/zadosti/tym.

Scénář (lab, výchozí účty): nadřízený N (jakub) má podřízeného P (tomas, manager v Entra), oba oddělení „PPF Gate“;
J (karolina) je z jiného oddělení; S (eva, Schvalovatel) je z oddělení N a P; SP (petra) je Spravce.
Každý z P, N, J založí žádost; pak každý čte /api/zadosti/tym a test porovná, které ze tří nových žádostí vidí, s očekáváním:
  P: jen svou · N: svou + P (podřízený) · J: jen svou · S: P + N (oddělení), ne J · SP: všechny.
Výstup: JSON řádky (http, čas, tělo; u čtení `vidi`, `ocekavano`, `sedi`). Tokeny ROPC přes tools/data-prava-token.py.
Příklad: python3 tools/prava-db-org-test.py > sondy/container-app/prava-db/23-test-org.jsonl
"""
import argparse, json, os, subprocess, sys, time, urllib.error, urllib.request

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--base", default="https://ca-egd-data-api.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io")
ap.add_argument("--app", default="fec3e01a-6ce4-4f9e-9dff-a61b354151fb")
ap.add_argument("--podrizeny", default="tomas.prochazka"); ap.add_argument("--nadrizeny", default="jakub.kucera")
ap.add_argument("--jine", default="karolina.mala", help="zadavatel z jiného oddělení")
ap.add_argument("--schvalovatel", default="eva.vesela"); ap.add_argument("--spravce", default="petra.novakova")
a = ap.parse_args(); here = os.path.dirname(os.path.abspath(__file__)); _t = {}


def tok(u):
    if u not in _t:
        o = subprocess.run([sys.executable, f"{here}/data-prava-token.py", u, "--resource", f"api://{a.app}", "--client", a.app], capture_output=True, text=True)
        if o.returncode: sys.exit(f"token {u}: {o.stderr[:300]}")
        _t[u] = o.stdout.strip()
    return _t[u]


def call(krok, who, method, path, body=None, exp=None, extra=None):
    h = {"Content-Type": "application/json", "Authorization": "Bearer " + tok(who)}
    t0 = time.time()
    try:
        r = urllib.request.urlopen(urllib.request.Request(a.base + path, json.dumps(body).encode() if body is not None else None, h, method=method), timeout=150)
        code, txt = r.status, r.read().decode()
    except urllib.error.HTTPError as e: code, txt = e.code, e.read().decode()
    try: j = json.loads(txt)
    except Exception: j = txt
    rec = {"krok": krok, "kdo": who, "volani": f"{method} {path}", "http": code, "sec": round(time.time() - t0, 2)}
    if exp is not None: rec.update(ocekavano_http=exp, sedi_http=code == exp)
    rec.update(extra or {}); rec["telo"] = j if len(txt) < 3000 else txt[:3000]
    print(json.dumps(rec, ensure_ascii=False), flush=True)
    return code, j


P, N, J, S, SP = a.podrizeny, a.nadrizeny, a.jine, a.schvalovatel, a.spravce
call("0-me", N, "GET", "/api/me", exp=200)
call("1-sync-bez-prava", P, "POST", "/api/org/sync", exp=403)
call("1-sync", SP, "POST", "/api/org/sync", exp=200)
for u in (P, N, J, S): call("2-org-me", u, "GET", "/api/org/me", exp=200)
stamp = time.strftime("%H%M%S"); ids = {}
for u in (P, N, J):
    code, j = call("3-zaklada", u, "POST", "/api/zadosti", {"nazev": f"org-{stamp}-{u.split('.')[0]}", "castka": 1}, exp=201)
    ids[u] = j.get("id") if isinstance(j, dict) else None
ocek = {P: {P}, N: {N, P}, J: {J}, S: {P, N}, SP: {P, N, J}}
vysl = []
for u, exp_who in ocek.items():
    code, j = call("4-tym", u, "GET", "/api/zadosti/tym", exp=200)
    seen = {w for w, i in ids.items() if isinstance(j, list) and any(x["Id"] == i for x in j)}
    duvod = {w: next((x["Duvod"] for x in j if x["Id"] == ids[w]), None) for w in seen} if isinstance(j, list) else {}
    ok = seen == exp_who; vysl.append(ok)
    print(json.dumps({"krok": "4-vyhodnoceni", "kdo": u, "vidi": sorted(seen), "ocekavano": sorted(exp_who), "duvod": duvod, "sedi": ok}, ensure_ascii=False), flush=True)
# původní /api/zadosti se nemění: nadřízený (Zadavatel) v něm podřízeného nevidí
code, j = call("5-puvodni-endpoint", N, "GET", "/api/zadosti", exp=200)
print(json.dumps({"krok": "5-vyhodnoceni", "kdo": N, "vidi_podrizeneho_v_/api/zadosti": isinstance(j, list) and any(x["Id"] == ids[P] for x in j), "ocekavano": False}, ensure_ascii=False))
print(json.dumps({"krok": "souhrn", "sedi": sum(vysl), "z": len(vysl), "zadosti": ids}, ensure_ascii=False))
