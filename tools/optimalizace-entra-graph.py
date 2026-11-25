#!/usr/bin/env python3
"""Entra appka 'egd-sonda-optimalizace-graph' (veřejný klient, delegované Sites.ReadWrite.All + admin consent pro všechny uživatele)
pro měření Microsoft Graph nad SharePoint seznamy (ROPC s lab uživatelem). Idempotentní. Jen lab tenant (kontroluje).
Použití: optimalizace-entra-graph.py     (potřebuje `az login` do lab tenantu). Vypíše appId na stdout."""
import argparse, json, subprocess, sys
p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter); p.add_argument("--name", default="egd-sonda-optimalizace-graph"); a = p.parse_args()
SUB = "05a636d8-d8e3-49d2-a450-4b3ff7cc0a13"; TENANT = "972a674c-7b85-4e56-a31f-b2f95b42fd1e"; GRAPH = "00000003-0000-0000-c000-000000000000"
def g(method, url, body=None):
    cmd = ["az", "rest", "--subscription", SUB, "--method", method, "--url", "https://graph.microsoft.com/v1.0" + url, "--headers", "Content-Type=application/json"]
    if body is not None: cmd += ["--body", json.dumps(body)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: sys.exit(f"{method} {url}: {r.stderr}")
    return json.loads(r.stdout) if r.stdout.strip() else {}
tid = subprocess.run(["az", "account", "show", "--subscription", SUB, "--query", "tenantId", "-o", "tsv"], capture_output=True, text=True).stdout.strip()
assert tid == TENANT, tid
gsp = g("GET", f"/servicePrincipals?$filter=appId eq '{GRAPH}'&$select=id,oauth2PermissionScopes")["value"][0]
scope = next(s for s in gsp["oauth2PermissionScopes"] if s["value"] == "Sites.ReadWrite.All")
apps = g("GET", f"/applications?$filter=displayName eq '{a.name}'")["value"]
app = apps[0] if apps else g("POST", "/applications", {"displayName": a.name, "signInAudience": "AzureADMyOrg", "isFallbackPublicClient": True,
      "requiredResourceAccess": [{"resourceAppId": GRAPH, "resourceAccess": [{"id": scope["id"], "type": "Scope"}]}]})
sps = g("GET", f"/servicePrincipals?$filter=appId eq '{app['appId']}'")["value"]
sp = sps[0] if sps else g("POST", "/servicePrincipals", {"appId": app["appId"]})
if not g("GET", f"/oauth2PermissionGrants?$filter=clientId eq '{sp['id']}'")["value"]:
    g("POST", "/oauth2PermissionGrants", {"clientId": sp["id"], "consentType": "AllPrincipals", "resourceId": gsp["id"], "scope": "Sites.ReadWrite.All"})
print(app["appId"])
