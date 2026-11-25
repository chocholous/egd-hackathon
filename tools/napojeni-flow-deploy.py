#!/usr/bin/env python3
"""Založí v lab prostředí Power Automate flow „denní report“: Recurrence → SharePoint (Get file content by path)
→ Office 365 Outlook (Send an email V2 s přílohou). Všechno STANDARD konektory. Tokeny z `az` (správce lab tenantu).
Připojení (OAuth) se založí přes API, ale zůstanou `Unauthenticated`, dokud se do nich člověk nepřihlásí v portálu
(Power Automate → Připojení → Opravit) — programově to nejde. Flow se bez přihlášených připojení uloží, ale nedoběhne.
Použití: napojeni-flow-deploy.py --site https://x.sharepoint.com/sites/s --file "/Shared Documents/f.csv" --to a@x \
         [--name "EGD sonda: denní report"] [--hour 6] [--tz "Central Europe Standard Time"] [--env Default-<tenantId>]
         [--as-user alias --client appId] [--dry-run] [--get NAME_OR_ID]   (--get jen vypíše stav existujícího flow)"""
import argparse, json, subprocess, sys, urllib.error, urllib.request
ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--site"); ap.add_argument("--file"); ap.add_argument("--to"); ap.add_argument("--name", default="EGD sonda: denní report")
ap.add_argument("--hour", type=int, default=6); ap.add_argument("--tz", default="Central Europe Standard Time")
ap.add_argument("--env"); ap.add_argument("--as-user", help="alias/UPN lab uživatele s licencí (jinak token z az)"); ap.add_argument("--client", help="appId s Flow/PowerApps scopy (napojeni-delegated-app.sh)"); ap.add_argument("--dry-run", action="store_true"); ap.add_argument("--get")
a = ap.parse_args()
def az(res):
    if a.as_user:  # ROPC jako lab uživatel s licencí Power Automate (heslo z lab.secrets.json, nikam se neukládá)
        import os, urllib.parse
        upn = a.as_user if "@" in a.as_user else a.as_user + "@pavelchocholousgmail.onmicrosoft.com"
        pw = json.load(open(os.path.expanduser("~/Projects/ppf-rooms/lab/lab.secrets.json")))["hesla"][upn]
        r = urllib.request.urlopen(urllib.request.Request(f"https://login.microsoftonline.com/{tid}/oauth2/v2.0/token", urllib.parse.urlencode({
            "grant_type": "password", "client_id": a.client, "username": upn, "password": pw, "scope": res.rstrip("/") + "/.default"}).encode()))
        return json.load(r)["access_token"]
    return az_cli(res)
def az_cli(res): return subprocess.run(["az", "account", "get-access-token", "--resource", res, "--query", "accessToken", "-o", "tsv"], capture_output=True, text=True, check=True).stdout.strip()
def call(url, tok, body=None, m=None):
    r = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None, method=m or ("POST" if body is not None else "GET"),
                               headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(r, timeout=60) as x: return x.status, json.loads(x.read() or b"{}")
    except urllib.error.HTTPError as e: return e.code, json.loads(e.read() or b"{}")
tid = subprocess.run(["az", "account", "show", "--query", "tenantId", "-o", "tsv"], capture_output=True, text=True, check=True).stdout.strip()
env = a.env or f"Default-{tid}"
FAPI = f"https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/{env}"
PAPI = "https://api.powerapps.com/providers/Microsoft.PowerApps"
if a.get:
    s, d = call(f"{FAPI}/flows/{a.get}?api-version=2016-11-01", az("https://service.flow.microsoft.com/")); print(s, json.dumps(d, ensure_ascii=False, indent=1)[:3000]); sys.exit(0)
if not (a.site and a.file and a.to): ap.error("--site, --file a --to jsou povinné")
H = lambda api, conn: {"apiId": f"/providers/Microsoft.PowerApps/apis/{api}", "connectionName": conn, "operationId": None}
d = {"$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#", "contentVersion": "1.0.0.0",
     "parameters": {"$connections": {"defaultValue": {}, "type": "Object"}, "$authentication": {"defaultValue": {}, "type": "SecureObject"}},
     "triggers": {"Recurrence": {"type": "Recurrence", "recurrence": {"frequency": "Day", "interval": 1, "timeZone": a.tz, "schedule": {"hours": [str(a.hour)], "minutes": [0]}}}},
     "actions": {
       "Nacti_soubor": {"type": "OpenApiConnection", "runAfter": {}, "inputs": {"host": {**H("shared_sharepointonline", "shared_sharepointonline"), "operationId": "GetFileContentByPath"},
                        "parameters": {"dataset": a.site, "path": a.file, "inferContentType": True}, "authentication": "@parameters('$authentication')"}},
       "Posli_email": {"type": "OpenApiConnection", "runAfter": {"Nacti_soubor": ["Succeeded"]}, "inputs": {"host": {**H("shared_office365", "shared_office365"), "operationId": "SendEmailV2"},
                        "parameters": {"emailMessage/To": a.to, "emailMessage/Subject": "Denní report (Power Automate, sonda napojeni)", "emailMessage/Body": "<p>Příloha ze SharePointu.</p>",
                                       "emailMessage/Attachments": [{"Name": "report.csv", "ContentBytes": "@body('Nacti_soubor')"}]}, "authentication": "@parameters('$authentication')"}}}, "outputs": {}}
refs = {k: {"id": f"/providers/Microsoft.PowerApps/apis/{k}", "tier": "NotSpecified", "connectionName": "", "source": "Embedded"} for k in ("shared_sharepointonline", "shared_office365")}
if a.dry_run: print(json.dumps({"properties": {"displayName": a.name, "definition": d, "state": "Started", "connectionReferences": refs}}, ensure_ascii=False, indent=1)); sys.exit(0)
tp = az("https://service.powerapps.com/")
for api in refs:
    name = f"egd-sonda-{api.replace('shared_', '')}"
    s, r = call(f"{PAPI}/apis/{api}/connections/{name}?api-version=2016-11-01&$filter=environment%20eq%20'{env}'", tp, {"properties": {"environment": {"name": env}}}, "PUT")
    print("připojení", name, s, [x.get("status") for x in r.get("properties", {}).get("statuses", [])] or r)
    if s < 300: refs[api]["connectionName"] = name
s, r = call(f"{FAPI}/flows?api-version=2016-11-01", az("https://service.flow.microsoft.com/"), {"properties": {"displayName": a.name, "definition": d, "state": "Started", "connectionReferences": refs}})
print("flow:", s, r.get("name"), r.get("properties", {}).get("state") if s < 300 else json.dumps(r, ensure_ascii=False)[:1500])
