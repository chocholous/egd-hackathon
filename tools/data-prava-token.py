#!/usr/bin/env python3
"""Token SharePointu (nebo jiného zdroje) pro lab uživatele přes ROPC. Heslo bere z
~/Projects/ppf-rooms/lab/lab.secrets.json (nikam se neukládá, token jde jen na stdout).
Použití: data-prava-token.py <alias|upn> [--resource https://pavelchocholousgmail.sharepoint.com] [--client <appId>]
Pozn.: funguje jen pro účty, které mají heslo v lab.secrets.json (alice/bob ho tam nemají)."""
import argparse, json, os, sys, urllib.parse, urllib.request
p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
p.add_argument("user"); p.add_argument("--resource", default="https://pavelchocholousgmail.sharepoint.com")
p.add_argument("--client", default="9bc3ab49-b65d-410a-85ad-de819febfddc", help="public client; výchozí SPO Management Shell (Azure CLI klient SharePoint odmítá: 401 user_impersonation)")
p.add_argument("--secrets", default=os.path.expanduser("~/Projects/ppf-rooms/lab/lab.secrets.json"))
a = p.parse_args()
tenant = "972a674c-7b85-4e56-a31f-b2f95b42fd1e"
upn = a.user if "@" in a.user else f"{a.user}@pavelchocholousgmail.onmicrosoft.com"
pw = json.load(open(a.secrets))["hesla"].get(upn)
if not pw: sys.exit(f"{upn}: v lab.secrets.json není heslo")
d = urllib.parse.urlencode({"grant_type": "password", "client_id": a.client, "username": upn, "password": pw, "scope": a.resource.rstrip("/") + "/.default"}).encode()
try:
    r = json.load(urllib.request.urlopen(urllib.request.Request(f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token", d)))
    print(r["access_token"])
except urllib.error.HTTPError as e:
    sys.exit(e.read().decode()[:600])
