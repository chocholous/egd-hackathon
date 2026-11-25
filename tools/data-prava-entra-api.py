#!/usr/bin/env python3
"""Entra: registrace API appky 'egd-sonda-data-api' s app rolemi Zadavatel/Schvalovatel/Spravce a scope access_as_user,
přiřazení lab uživatelů k rolím (tomas, jakub = Zadavatel; eva = Schvalovatel; petra = Spravce; lucie bez role),
admin consent pro ROPC test. Idempotentní. Jen lab tenant (kontroluje tenant). Výstup: JSON s appId.
Použití: data-prava-entra-api.py [--name egd-sonda-data-api]   (potřebuje `az login` do lab tenantu)"""
import argparse, json, subprocess, sys, uuid
p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter); p.add_argument("--name", default="egd-sonda-data-api"); a = p.parse_args()
SUB = "05a636d8-d8e3-49d2-a450-4b3ff7cc0a13"; TENANT = "972a674c-7b85-4e56-a31f-b2f95b42fd1e"; DOM = "pavelchocholousgmail.onmicrosoft.com"
def g(method, url, body=None):
    cmd = ["az", "rest", "--subscription", SUB, "--method", method, "--url", "https://graph.microsoft.com/v1.0" + url, "--headers", "Content-Type=application/json"]
    if body is not None: cmd += ["--body", json.dumps(body)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: sys.exit(f"{method} {url}: {r.stderr}")
    return json.loads(r.stdout) if r.stdout.strip() else {}
tid = subprocess.run(["az", "account", "show", "--subscription", SUB, "--query", "tenantId", "-o", "tsv"], capture_output=True, text=True).stdout.strip()
assert tid == TENANT, tid
apps = g("GET", f"/applications?$filter=displayName eq '{a.name}'")["value"]
roles = {n: str(uuid.uuid4()) for n in ("Zadavatel", "Schvalovatel", "Spravce")}
scope_id = str(uuid.uuid4())
if not apps:
    app = g("POST", "/applications", {"displayName": a.name, "signInAudience": "AzureADMyOrg", "isFallbackPublicClient": True,
        "api": {"requestedAccessTokenVersion": 2, "oauth2PermissionScopes": [{"id": scope_id, "value": "access_as_user", "type": "User", "isEnabled": True,
                 "adminConsentDisplayName": "Přístup k API jako uživatel", "adminConsentDescription": "Přístup k API jako přihlášený uživatel",
                 "userConsentDisplayName": "Přístup k API", "userConsentDescription": "Přístup k API"}]},
        "appRoles": [{"id": i, "value": n, "displayName": n, "description": f"Role {n}", "allowedMemberTypes": ["User"], "isEnabled": True} for n, i in roles.items()]})
    g("PATCH", f"/applications/{app['id']}", {"identifierUris": [f"api://{app['appId']}"]})
else:
    app = apps[0]
app = g("GET", f"/applications/{app['id']}")
sps = g("GET", f"/servicePrincipals?$filter=appId eq '{app['appId']}'")["value"]
sp = sps[0] if sps else g("POST", "/servicePrincipals", {"appId": app["appId"]})
rid = {r["value"]: r["id"] for r in app["appRoles"]}
assign = {"tomas.prochazka": "Zadavatel", "jakub.kucera": "Zadavatel", "eva.vesela": "Schvalovatel", "petra.novakova": "Spravce"}
have = {(x["principalId"]) for x in g("GET", f"/servicePrincipals/{sp['id']}/appRoleAssignedTo")["value"]}
for u, role in assign.items():
    uid = g("GET", f"/users/{u}@{DOM}?$select=id")["id"]
    if uid not in have:
        g("POST", f"/servicePrincipals/{sp['id']}/appRoleAssignedTo", {"principalId": uid, "resourceId": sp["id"], "appRoleId": rid[role]})
grants = g("GET", f"/oauth2PermissionGrants?$filter=clientId eq '{sp['id']}'")["value"]
if not grants:
    g("POST", "/oauth2PermissionGrants", {"clientId": sp["id"], "consentType": "AllPrincipals", "resourceId": sp["id"], "scope": "access_as_user"})
print(json.dumps({"appId": app["appId"], "spObjectId": sp["id"], "audience": f"api://{app['appId']}", "roles": list(rid), "assigned": assign}, ensure_ascii=False))
