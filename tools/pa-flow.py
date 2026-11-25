#!/usr/bin/env python3
"""pa-flow.py — práce s Power Automate flow přes Flow API (lab tenant), jako licencovaný lab uživatel.

Podpříkazy:
  list                         seznam flow uživatele
  get ID                       stav flow (definice zkrácená; --full vypíše vše)
  create SOUBOR.json           založí flow z JSON {"displayName":…, "definition":…, "connectionReferences":…, "state":…}
  stop ID | start ID           vypne / zapne flow
  url ID [--trigger manual]    callback URL triggeru „When an HTTP request is received“ (obsahuje SAS podpis = tajemství!)
  runs ID [--top N]            poslední běhy (stav, chyba)
  run-actions ID RUN           stav jednotlivých akcí jednoho běhu
  run ID [--trigger Recurrence]  ručně spustí trigger (Recurrence/Button); u Recurrence „spustit teď“
  tiers ID                     jaké konektory/akce flow používá a jejich tier (Standard/Premium) podle API

Společné: --as-user alias (výchozí tomas.prochazka) --client appId (výchozí egd-sonda napojeni (flow)).
Heslo se čte z ~/Projects/ppf-rooms/lab/lab.secrets.json a nikam se neukládá ani nevypisuje.
Prostředí: Default-<tenantId> z `az account show`; přepsat --env.
"""
import argparse, json, os, subprocess, sys, urllib.error, urllib.parse, urllib.request

DEFAULT_CLIENT = os.environ.get("PA_CLIENT_ID", "28929f82-8763-4340-a2b8-6e6eeed15d32")  # egd-sonda napojeni (flow)
DEFAULT_USER = os.environ.get("PA_USER", "tomas.prochazka")
DOMAIN = os.environ.get("PA_DOMAIN", "pavelchocholousgmail.onmicrosoft.com")
SECRETS = os.path.expanduser("~/Projects/ppf-rooms/lab/lab.secrets.json")

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("cmd", choices=["list", "get", "create", "stop", "start", "url", "runs", "run-actions", "run", "tiers"])
ap.add_argument("args", nargs="*")
ap.add_argument("--as-user", default=DEFAULT_USER)
ap.add_argument("--client", default=DEFAULT_CLIENT)
ap.add_argument("--env")
ap.add_argument("--trigger", default="manual")  # pro `run` zadej např. Recurrence
ap.add_argument("--top", type=int, default=5)
ap.add_argument("--full", action="store_true")
a = ap.parse_args()

tid = subprocess.run(["az", "account", "show", "--query", "tenantId", "-o", "tsv"], capture_output=True, text=True, check=True).stdout.strip()
env = a.env or f"Default-{tid}"


def token(res):
    upn = a.as_user if "@" in a.as_user else f"{a.as_user}@{DOMAIN}"
    pw = json.load(open(SECRETS))["hesla"][upn]
    body = urllib.parse.urlencode({"grant_type": "password", "client_id": a.client, "username": upn, "password": pw,
                                   "scope": res.rstrip("/") + "/.default"}).encode()
    return json.load(urllib.request.urlopen(urllib.request.Request(f"https://login.microsoftonline.com/{tid}/oauth2/v2.0/token", body)))["access_token"]


def call(url, tok, body=None, method=None):
    r = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None,
                               method=method or ("POST" if body is not None else "GET"),
                               headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(r, timeout=90) as x:
            raw = x.read()
            return x.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw or b"{}")
        except ValueError:
            return e.code, {"raw": raw.decode(errors="replace")[:800]}


F = f"https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/{env}"
V = "api-version=2016-11-01"
tok = token("https://service.flow.microsoft.com/")
cmd, ar = a.cmd, a.args


def need(n):
    if len(ar) < n:
        ap.error(f"{cmd}: chybí argument")


def pj(o):
    print(json.dumps(o, ensure_ascii=False, indent=1))


if cmd == "list":
    s, d = call(f"{F}/flows?{V}", tok)
    for f in d.get("value", []):
        p = f["properties"]
        print(f["name"], p.get("state"), p.get("displayName"))
    if s >= 300:
        pj(d)
elif cmd == "get":
    need(1)
    s, d = call(f"{F}/flows/{ar[0]}?{V}", tok)
    p = d.get("properties", {})
    if a.full or s >= 300:
        pj(d)
    else:
        pj({"status": s, "displayName": p.get("displayName"), "state": p.get("state"), "triggers": list(p.get("definition", {}).get("triggers", {})),
            "actions": list(p.get("definition", {}).get("actions", {})), "connectionReferences": p.get("connectionReferences"),
            "flowTriggerUri": p.get("flowTriggerUri")})
elif cmd == "create":
    need(1)
    props = json.load(open(ar[0]))
    props.setdefault("state", "Started")
    s, d = call(f"{F}/flows?{V}", tok, {"properties": props})
    print(s, d.get("name"), d.get("properties", {}).get("state") if s < 300 else json.dumps(d, ensure_ascii=False)[:2000])
elif cmd in ("stop", "start"):
    need(1)
    s, d = call(f"{F}/flows/{ar[0]}/{cmd}?{V}", tok, {})
    print(s, d if s >= 300 else "ok")
elif cmd == "url":
    need(1)
    s, d = call(f"{F}/flows/{ar[0]}/triggers/{a.trigger}/listCallbackUrl?{V}", tok, {})
    print(s, d.get("response", {}).get("value") or json.dumps(d, ensure_ascii=False)[:1500])
elif cmd == "run":
    need(1)
    s, d = call(f"{F}/flows/{ar[0]}/triggers/{a.trigger}/run?{V}", tok, {})
    print(s, "ok" if s < 300 else json.dumps(d, ensure_ascii=False)[:1500])
elif cmd == "runs":
    need(1)
    s, d = call(f"{F}/flows/{ar[0]}/runs?{V}&$top={a.top}", tok)
    for r in d.get("value", [])[: a.top]:
        p = r["properties"]
        print(r["name"], p.get("status"), p.get("startTime"), json.dumps(p.get("code") or p.get("error") or "", ensure_ascii=False)[:200])
    if s >= 300:
        pj(d)
elif cmd == "run-actions":
    need(2)
    s, d = call(f"{F}/flows/{ar[0]}/runs/{ar[1]}?{V}&$expand=properties/actions", tok)
    acts = d.get("properties", {}).get("actions", {})
    if not a.full:
        for k, v in acts.items():
            print(k, v.get("status"), v.get("code") or "", json.dumps(v.get("error") or "", ensure_ascii=False)[:300])
    if not acts or a.full:
        pj(d)
elif cmd == "tiers":
    need(1)
    s, d = call(f"{F}/flows/{ar[0]}?{V}", tok)
    p = d.get("properties", {})
    pj({"connectionReferences": {k: v.get("tier") for k, v in (p.get("connectionReferences") or {}).items()},
        "apiOperations_summary": p.get("definitionSummary", {}).get("actions") or p.get("definitionSummary"),
        "triggers": {k: v.get("type") for k, v in p.get("definition", {}).get("triggers", {}).items()}})
