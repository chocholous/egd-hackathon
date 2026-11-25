#!/usr/bin/env python3
"""pa-connection.py — připojení (connections) Power Automate přes API, jako lab uživatel.

  list                                   připojení uživatele ve výchozím prostředí (stav Connected/Error)
  apis [--filter TEXT]                   katalog konektorů prostředí s tierem (Standard/Premium)
  params API                             parametry připojení konektoru (typ: oauth / apikey / …)
  create API NAME --param k=v [--param …] [--param-env k=ENVVAR]
                                         založí připojení s parametry (jen pro konektory bez OAuth, např. API klíč);
                                         tajné hodnoty dávej přes --param-env, ať nejsou v historii shellu
Pozn.: OAuth připojení (SharePoint, Outlook, Word Online…) se přes API založí, ale ve stavu Error
(nepřihlášené). Přihlásit je smí jen člověk v make.powerautomate.com → Data → Připojení → Opravit.
Společné: --as-user (výchozí tomas.prochazka), --client (výchozí PA_CLIENT_ID z pa-flow.py).
"""
import argparse, json, os, runpy, sys

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("cmd", choices=["list", "apis", "params", "create"])
ap.add_argument("args", nargs="*")
ap.add_argument("--filter", default="")
ap.add_argument("--param", action="append", default=[])
ap.add_argument("--param-env", action="append", default=[])
ap.add_argument("--as-user"); ap.add_argument("--client"); ap.add_argument("--env")
a = ap.parse_args()
sys.argv = ["pa-flow.py", "list"] + (["--as-user", a.as_user] if a.as_user else []) + (["--client", a.client] if a.client else []) + (["--env", a.env] if a.env else [])
import io, contextlib
with contextlib.redirect_stdout(io.StringIO()):
    ns = runpy.run_path(os.path.join(os.path.dirname(os.path.abspath(__file__)), "pa-flow.py"))
call, env, token = ns["call"], ns["env"], ns["token"]
t = token("https://service.powerapps.com/")
P = "https://api.powerapps.com/providers/Microsoft.PowerApps"
E = f"%24filter=environment%20eq%20'{env}'"
if a.cmd == "list":
    s, d = call(f"{P}/connections?api-version=2016-11-01&{E}", t)
    for c in d.get("value", []):
        p = c["properties"]
        print(c["name"], p.get("apiId", "").rsplit("/", 1)[-1], [x.get("status") for x in p.get("statuses", [])], p.get("displayName"))
elif a.cmd == "apis":
    s, d = call(f"{P}/apis?api-version=2016-11-01&{E}%20and%20isCustomApi%20eq%20false&%24top=500", t)
    for v in d.get("value", []):
        p = v["properties"]
        if a.filter.lower() in (p.get("displayName") or "").lower() or a.filter.lower() in v["name"]:
            print(v["name"], p.get("tier"), p.get("displayName"))
elif a.cmd == "params":
    s, d = call(f"{P}/apis/{a.args[0]}?api-version=2016-11-01&{E}", t)
    p = d["properties"]
    print(json.dumps({"connectionParameters": {k: [v.get("type"), v.get("uiDefinition", {}).get("displayName")] for k, v in p.get("connectionParameters", {}).items()},
                      "connectionParameterSets": [x.get("name") for x in (p.get("connectionParameterSets") or {}).get("values", [])]}, ensure_ascii=False, indent=1))
elif a.cmd == "create":
    api, name = a.args[0], a.args[1]
    pv = dict(x.split("=", 1) for x in a.param)
    pv.update({x.split("=", 1)[0]: os.environ[x.split("=", 1)[1]] for x in a.param_env})
    s, d = call(f"{P}/apis/{api}/connections/{name}?api-version=2016-11-01&{E}", t,
                {"properties": {"environment": {"name": env}, "connectionParameters": pv}}, "PUT")
    print(s, [x.get("status") for x in d.get("properties", {}).get("statuses", [])] or json.dumps(d, ensure_ascii=False)[:800])
