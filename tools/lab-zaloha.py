#!/usr/bin/env python3
"""Záloha nastavení a účtů lab tenantu M365 (jen čtení) do JSON souborů.

Použití: lab-zaloha.py [--out DIR] [--bez-polozek] [--jen CAST,...]
  --out DIR       cílová složka (výchozí $EGD_LAB_ZALOHA_DIR nebo ~/egd-lab-zaloha/<UTC čas>)
  --bez-polozek   u SharePoint seznamů neukládat položky, jen definice (sloupce, views)
  --jen           jen vybrané části: entra,sharepoint,flow

Tokeny bere z `az account get-access-token` (přihlášení az do lab tenantu, viz CLAUDE.md).
Nic nezapisuje do tenantu. Chybu endpointu (403/404) zapíše do _chyby.json a pokračuje.
"""
import argparse, json, os, subprocess, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

TENANT = "972a674c-7b85-4e56-a31f-b2f95b42fd1e"
SPO_ROOT = "https://pavelchocholousgmail.sharepoint.com"
G = "https://graph.microsoft.com"
CHYBY = []
_tok = {}


def token(resource):
    if resource not in _tok and resource.startswith("m365:"):
        # m365 v11 přes tools/lab-m365.sh (pavel.admin, SharePoint admin): weby a SPO REST
        r = resource[5:]
        out = subprocess.run([os.path.join(os.path.dirname(os.path.abspath(__file__)), "lab-m365.sh"),
                              "util", "accesstoken", "get", "--resource", r, "--output", "text"], capture_output=True, text=True)
        if out.returncode or not out.stdout.startswith("ey"):
            raise SystemExit(f"m365 token pro {r} selhal: {(out.stdout + out.stderr).strip()[:300]}")
        _tok[resource] = out.stdout.strip()
    if resource not in _tok:
        out = subprocess.run(["az", "account", "get-access-token", "--tenant", TENANT, "--resource", resource,
                              "--query", "accessToken", "-o", "tsv"], capture_output=True, text=True)
        if out.returncode:
            raise SystemExit(f"token pro {resource} selhal: {out.stderr.strip()}")
        _tok[resource] = out.stdout.strip()
    return _tok[resource]


def get(url, resource=G, accept="application/json"):
    url = url.replace(" ", "%20")
    for pokus in range(5):
        req = urllib.request.Request(url, headers={"Authorization": "Bearer " + token(resource), "Accept": accept,
                                                   "ConsistencyLevel": "eventual"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 503, 504) and pokus < 4:
                time.sleep(int(e.headers.get("Retry-After", 5)))
                continue
            CHYBY.append({"url": url, "status": e.code, "body": e.read().decode(errors="replace")[:500]})
            return None
        except Exception as e:  # síť
            if pokus < 4:
                time.sleep(3); continue
            CHYBY.append({"url": url, "status": "exc", "body": str(e)})
            return None


def vse(url, resource=G):
    """Stránkování přes @odata.nextLink (Graph) i odata.nextLink / __next (SPO)."""
    hodnoty = []
    while url:
        d = get(url, resource)
        if d is None:
            return None if not hodnoty else hodnoty
        hodnoty += d.get("value", d.get("d", {}).get("results", []))
        url = d.get("@odata.nextLink") or d.get("odata.nextLink")
    return hodnoty


def uloz(out, jmeno, data):
    p = os.path.join(out, jmeno)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    n = len(data) if isinstance(data, list) else ("ok" if data is not None else "CHYBA")
    print(f"  {jmeno}: {n}", flush=True)


def entra(out, pool):
    print("== Entra / Graph")
    jednoduche = {
        "organization": "/v1.0/organization", "domains": "/v1.0/domains", "subscribedSkus": "/v1.0/subscribedSkus",
        "users": "/beta/users?$top=999",
        "groups": "/beta/groups?$top=999",
        "applications": "/beta/applications?$top=999",
        "servicePrincipals": "/beta/servicePrincipals?$top=999",
        "oauth2PermissionGrants": "/v1.0/oauth2PermissionGrants",
        "directoryRoles": "/v1.0/directoryRoles",
        "roleDefinitions": "/v1.0/roleManagement/directory/roleDefinitions",
        "roleAssignments": "/v1.0/roleManagement/directory/roleAssignments",
        "roleEligibilitySchedules": "/v1.0/roleManagement/directory/roleEligibilitySchedules",
        "conditionalAccessPolicies": "/v1.0/identity/conditionalAccess/policies",
        "namedLocations": "/v1.0/identity/conditionalAccess/namedLocations",
        "authenticationMethodsPolicy": "/beta/policies/authenticationMethodsPolicy",
        "authorizationPolicy": "/beta/policies/authorizationPolicy",
        "securityDefaults": "/v1.0/policies/identitySecurityDefaultsEnforcementPolicy",
        "crossTenantAccessPolicy": "/v1.0/policies/crossTenantAccessPolicy",
        "crossTenantPartners": "/v1.0/policies/crossTenantAccessPolicy/partners",
        "adminConsentRequestPolicy": "/v1.0/policies/adminConsentRequestPolicy",
        "tokenLifetimePolicies": "/v1.0/policies/tokenLifetimePolicies",
        "groupSettings": "/beta/groupSettings",
        "administrativeUnits": "/v1.0/directory/administrativeUnits",
        "sharepointSettings": "/v1.0/admin/sharepoint/settings",
        "deletedUsers": "/v1.0/directory/deletedItems/microsoft.graph.user",
        "deletedGroups": "/v1.0/directory/deletedItems/microsoft.graph.group",
        "deletedApplications": "/v1.0/directory/deletedItems/microsoft.graph.application",
        "registrationCampaign": "/beta/policies/authenticationMethodsPolicy",
    }
    res = {}
    for k, path in jednoduche.items():
        d = get(G + path)
        res[k] = d.get("value", d) if isinstance(d, dict) and "value" in d and "@odata.nextLink" not in d else (vse(G + path) if d else None)
        uloz(out, f"entra/{k}.json", res[k])

    users, groups, sps = res.get("users") or [], res.get("groups") or [], res.get("servicePrincipals") or []
    apps = res.get("applications") or []

    def per(ids, tmpl, jmeno):
        r = dict(zip(ids, pool.map(lambda i: vse(G + tmpl.format(i)), ids)))
        uloz(out, f"entra/{jmeno}.json", r)

    per([u["id"] for u in users], "/v1.0/users/{}/memberOf", "users-memberOf")
    per([u["id"] for u in users], "/v1.0/users/{}/authentication/methods", "users-authMethods")
    per([u["id"] for u in users], "/v1.0/users/{}/licenseDetails", "users-licenseDetails")
    per([u["id"] for u in users], "/v1.0/users/{}/manager", "users-manager")
    per([g["id"] for g in groups], "/v1.0/groups/{}/members", "groups-members")
    per([g["id"] for g in groups], "/v1.0/groups/{}/owners", "groups-owners")
    per([a["id"] for a in apps], "/v1.0/applications/{}/owners", "applications-owners")
    per([a["id"] for a in apps], "/v1.0/applications/{}/federatedIdentityCredentials", "applications-fic")
    per([s["id"] for s in sps], "/v1.0/servicePrincipals/{}/appRoleAssignedTo", "servicePrincipals-appRoleAssignedTo")
    per([s["id"] for s in sps], "/v1.0/servicePrincipals/{}/appRoleAssignments", "servicePrincipals-appRoleAssignments")
    per([r["id"] for r in res.get("directoryRoles") or []], "/v1.0/directoryRoles/{}/members", "directoryRoles-members")


def sharepoint(out, pool, polozky):
    print("== SharePoint")
    MG = "m365:" + G
    sites = vse(G + "/v1.0/sites/getAllSites?$top=999", MG) or vse(G + "/v1.0/sites?search=*", MG)
    uloz(out, "sharepoint/sites.json", sites)
    spo = "m365:" + SPO_ROOT

    def web(s):
        url = s.get("webUrl")
        if not url or "/personal/" in url:
            return None
        sid = s["id"]
        r = {"site": s,
             "graphLists": vse(f"{G}/v1.0/sites/{sid}/lists?$expand=columns", MG),
             "permissions": vse(f"{G}/v1.0/sites/{sid}/permissions", MG),
             "web": get(f"{url}/_api/web?$expand=RegionalSettings,AssociatedOwnerGroup,AssociatedMemberGroup,AssociatedVisitorGroup", spo, "application/json;odata=nometadata"),
             "siteGroups": vse(f"{url}/_api/web/sitegroups?$expand=Users", spo),
             "roleAssignments": vse(f"{url}/_api/web/roleassignments?$expand=Member,RoleDefinitionBindings", spo),
             "roleDefinitions": vse(f"{url}/_api/web/roledefinitions", spo),
             "features": vse(f"{url}/_api/web/features", spo),
             "siteFeatures": vse(f"{url}/_api/site/features", spo),
             "userCustomActions": vse(f"{url}/_api/web/usercustomactions", spo),
             "navigation": vse(f"{url}/_api/web/navigation/quicklaunch", spo),
             "subwebs": vse(f"{url}/_api/web/webs", spo),
             "appCatalogApps": vse(f"{url}/_api/web/sitecollectionappcatalog/AvailableApps", spo),
             "tenantApps": vse(f"{url}/_api/web/tenantappcatalog/AvailableApps", spo) if url.rstrip("/").endswith("/sites/appcatalog") else None,
             "lists": {}}
        rest = vse(f"{url}/_api/web/lists?$select=Id,Title,BaseTemplate,ItemCount,Hidden,EnableVersioning,HasUniqueRoleAssignments,RootFolder/ServerRelativeUrl&$expand=RootFolder", spo) or []
        for l in rest:
            if l.get("Hidden"):
                continue
            lid = l["Id"]
            d = {"meta": l,
                 "fields": vse(f"{url}/_api/web/lists(guid'{lid}')/fields?$filter=Hidden eq false", spo),
                 "views": vse(f"{url}/_api/web/lists(guid'{lid}')/views?$expand=ViewFields", spo)}
            if l.get("HasUniqueRoleAssignments"):
                d["roleAssignments"] = vse(f"{url}/_api/web/lists(guid'{lid}')/roleassignments?$expand=Member,RoleDefinitionBindings", spo)
            if polozky and l.get("BaseTemplate") == 100:
                d["items"] = vse(f"{url}/_api/web/lists(guid'{lid}')/items?$top=5000", spo)
            if l.get("BaseTemplate") == 101:
                d["files"] = vse(f"{url}/_api/web/lists(guid'{lid}')/items?$select=Id,FileRef,FileLeafRef,Modified,File/Length,Editor/Title&$expand=File,Editor&$top=5000", spo)
            r["lists"][l["Title"]] = d
        return r

    vysl = list(pool.map(web, sites or []))
    for s, r in zip(sites or [], vysl):
        if r:
            jm = s["webUrl"].replace("https://", "").replace("/", "_")
            uloz(out, f"sharepoint/weby/{jm}.json", r)
    uloz(out, "sharepoint/tenantSettings.json",
         get(f"{SPO_ROOT.replace('.sharepoint', '-admin.sharepoint')}/_api/SPO.Tenant", "m365:" + SPO_ROOT.replace('.sharepoint', '-admin.sharepoint'),
             "application/json;odata=nometadata"))


def flow(out, pool):
    print("== Power Automate")
    F = "https://api.flow.microsoft.com"
    res = "https://service.flow.microsoft.com/"
    envs = vse(f"{F}/providers/Microsoft.ProcessSimple/environments?api-version=2016-11-01", res)
    uloz(out, "flow/environments.json", envs)
    for e in envs or []:
        n = e["name"]
        flows = vse(f"{F}/providers/Microsoft.ProcessSimple/scopes/admin/environments/{n}/v2/flows?api-version=2016-11-01", res) \
            or vse(f"{F}/providers/Microsoft.ProcessSimple/environments/{n}/flows?api-version=2016-11-01", res) or []
        uloz(out, f"flow/{n}/flows.json", flows)
        defs = list(pool.map(lambda f: get(f"{F}/providers/Microsoft.ProcessSimple/environments/{n}/flows/{f['name']}?api-version=2016-11-01&$expand=properties.definition,properties.connectionReferences", res), flows))
        uloz(out, f"flow/{n}/flow-definitions.json", defs)
        uloz(out, f"flow/{n}/connections.json",
             vse(f"https://api.powerapps.com/providers/Microsoft.PowerApps/connections?api-version=2016-11-01&$filter=environment%20eq%20%27{n}%27", "https://service.powerapps.com/"))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out")
    ap.add_argument("--bez-polozek", action="store_true")
    ap.add_argument("--jen", default="entra,sharepoint,flow")
    ap.add_argument("--vlakna", type=int, default=max(2, (os.cpu_count() or 4) - 2))
    a = ap.parse_args()
    cas = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = a.out or os.path.join(os.environ.get("EGD_LAB_ZALOHA_DIR", os.path.expanduser("~/egd-lab-zaloha")), cas)
    os.makedirs(out, exist_ok=True)
    os.chmod(out, 0o700)
    print("cíl:", out)
    casti = a.jen.split(",")
    with ThreadPoolExecutor(a.vlakna) as pool:
        for c in casti:
            try:
                {"entra": lambda: entra(out, pool), "sharepoint": lambda: sharepoint(out, pool, not a.bez_polozek),
                 "flow": lambda: flow(out, pool)}[c]()
            except SystemExit as e:
                CHYBY.append({"cast": c, "chyba": str(e)}); print("!!", c, e)
    uloz(out, "_chyby.json", CHYBY)
    print(f"hotovo, chyb {len(CHYBY)}: {out}")


if __name__ == "__main__":
    main()
