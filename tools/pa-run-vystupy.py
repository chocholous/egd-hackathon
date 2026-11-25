#!/usr/bin/env python3
"""pa-run-vystupy.py — výstupy akcí jednoho běhu Power Automate flow (lab tenant), jako licencovaný lab uživatel.

Doplňuje tools/pa-flow.py (ten ukáže jen stav akcí). Pro každou akci běhu stáhne outputsLink a vypíše:
stav, HTTP statusCode akce, počet položek v body.value (u Get items) a chybovou hlášku, je-li.

Použití:
  .venv/bin/python tools/pa-run-vystupy.py FLOW_ID RUN_ID [--akce NAZEV] [--json SOUBOR] [--as-user tomas.prochazka]

  --akce   jen akce s tímto názvem (lze opakovat)
  --json   uloží souhrn (bez samotných položek) do souboru jako JSON
Heslo se čte z ~/Projects/ppf-rooms/lab/lab.secrets.json a nikam se neukládá ani nevypisuje.
Prostředí: Default-<tenantId> z `az account show`; přepsat --env. Jen čtení.
"""
import argparse, json, os, subprocess, urllib.error, urllib.parse, urllib.request

DEFAULT_CLIENT = os.environ.get("PA_CLIENT_ID", "28929f82-8763-4340-a2b8-6e6eeed15d32")  # egd-sonda napojeni (flow), stejné jako pa-flow.py
DEFAULT_USER = os.environ.get("PA_USER", "tomas.prochazka")
DOMAIN = os.environ.get("PA_DOMAIN", "pavelchocholousgmail.onmicrosoft.com")
SECRETS = os.path.expanduser("~/Projects/ppf-rooms/lab/lab.secrets.json")

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("flow")
ap.add_argument("run")
ap.add_argument("--akce", action="append")
ap.add_argument("--json")
ap.add_argument("--as-user", default=DEFAULT_USER)
ap.add_argument("--client", default=DEFAULT_CLIENT)
ap.add_argument("--env")
a = ap.parse_args()

tid = subprocess.run(["az", "account", "show", "--query", "tenantId", "-o", "tsv"], capture_output=True, text=True, check=True).stdout.strip()
env = a.env or f"Default-{tid}"
upn = a.as_user if "@" in a.as_user else f"{a.as_user}@{DOMAIN}"
pw = json.load(open(SECRETS))["hesla"][upn]
body = urllib.parse.urlencode({"grant_type": "password", "client_id": a.client, "username": upn, "password": pw,
                               "scope": "https://service.flow.microsoft.com/.default"}).encode()
tok = json.load(urllib.request.urlopen(urllib.request.Request(f"https://login.microsoftonline.com/{tid}/oauth2/v2.0/token", body)))["access_token"]


def get(url, auth=True):
    h = {"Authorization": "Bearer " + tok} if auth else {}
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=h)) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw or b"{}")
        except ValueError:
            return e.code, {"raw": raw.decode(errors="replace")[:800]}


F = f"https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/{env}"
s, d = get(f"{F}/flows/{a.flow}/runs/{a.run}?api-version=2016-11-01&$expand=properties/actions")
if s >= 300:
    print(s, json.dumps(d, ensure_ascii=False)[:1500])
    raise SystemExit(1)
souhrn = {"flow": a.flow, "run": a.run, "status": d["properties"].get("status"), "startTime": d["properties"].get("startTime"), "akce": {}}
for name, v in sorted(d["properties"].get("actions", {}).items()):
    if a.akce and name not in a.akce:
        continue
    r = {"status": v.get("status"), "code": v.get("code")}
    link = (v.get("outputsLink") or {}).get("uri")
    if link:
        s2, o = get(link, auth=False)  # outputsLink je SAS URL, Bearer nepatří
        r["statusCode"] = o.get("statusCode")
        b = o.get("body")
        if isinstance(b, dict) and isinstance(b.get("value"), list):
            r["pocet"] = len(b["value"])
            stavy = {}
            for it in b["value"]:
                st = it.get("Stav")
                st = st.get("Value") if isinstance(st, dict) else st
                stavy[str(st)] = stavy.get(str(st), 0) + 1
            r["stavy"] = stavy
            r["nextLink"] = bool(b.get("@odata.nextLink"))
        elif isinstance(b, dict) and (b.get("message") or b.get("error")):
            r["chyba"] = (b.get("message") or json.dumps(b.get("error"), ensure_ascii=False))[:500]
        elif b is not None and not isinstance(b, (dict, list)):
            r["body"] = str(b)[:300]
    if v.get("error"):
        r["error"] = json.dumps(v["error"], ensure_ascii=False)[:500]
    souhrn["akce"][name] = r
    print(name, json.dumps(r, ensure_ascii=False))
if a.json:
    json.dump(souhrn, open(a.json, "w"), ensure_ascii=False, indent=1)
    print("ulozeno:", a.json)
