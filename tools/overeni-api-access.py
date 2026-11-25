#!/usr/bin/env python3
"""SharePoint admin centrum → API access přes CSOM (to, co dělá UI), bez Graph volání, která m365 CLI 11.x přidává.
Použití: overeni-api-access.py list | approve <id> | deny <id>
Token: m365 (HOME=~/.m365-osobni, pavel.admin) pro admin URL tenantu; jen lab. --help vypíše tento text."""
import json, os, re, subprocess, sys, urllib.request
ADMIN = "https://pavelchocholousgmail-admin.sharepoint.com"
if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"): print(__doc__); sys.exit(0)
env = dict(os.environ, HOME=os.path.expanduser("~/.m365-osobni"))
tok = subprocess.run(["m365", "util", "accesstoken", "get", "--resource", ADMIN], env=env, capture_output=True, text=True).stdout.strip().strip(chr(34))
def post(url, data, extra=None):
    h = {"Authorization": "Bearer " + tok, "Content-Type": "text/xml", "Accept": "application/json"}; h.update(extra or {})
    r = urllib.request.Request(url, data if isinstance(data, bytes) else data.encode(), h, method="POST")
    try: return urllib.request.urlopen(r).read().decode()
    except urllib.error.HTTPError as e: return f"HTTP {e.code}: {e.read().decode()[:400]}"
dig = json.loads(post(ADMIN + "/_api/contextinfo", b"", {"Accept": "application/json;odata=nometadata"}))["FormDigestValue"]
HEAD = '<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="overeni" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009">'
def q(xml): return post(ADMIN + "/_vti_bin/client.svc/ProcessQuery", HEAD + xml + "</Request>", {"X-RequestDigest": dig})
cmd = sys.argv[1]
if cmd == "list":
    out = q('<Actions><ObjectPath Id="10" ObjectPathId="9" /><ObjectPath Id="12" ObjectPathId="11" /><Query Id="13" ObjectPathId="11"><Query SelectAllProperties="true"><Properties /></Query><ChildItemQuery SelectAllProperties="true"><Properties /></ChildItemQuery></Query></Actions><ObjectPaths><Constructor Id="9" TypeId="{104e8f06-1e00-4675-99c6-1b9b504ed8d8}" /><Property Id="11" ParentId="9" Name="PermissionRequests" /></ObjectPaths>')
    try:
        for r in json.loads(out)[-1]["_Child_Items_"]: print(json.dumps({k: r.get(k) for k in ("Id", "Resource", "ResourceId", "Scope", "PackageName", "Status")}))
    except Exception: print(out[:600])
elif cmd in ("approve", "deny"):
    gid = sys.argv[2]; m = "Approve" if cmd == "approve" else "Deny"
    print(q(f'<Actions><ObjectPath Id="16" ObjectPathId="15" /><ObjectPath Id="18" ObjectPathId="17" /><ObjectPath Id="20" ObjectPathId="19" /><ObjectPath Id="22" ObjectPathId="21" /><Query Id="23" ObjectPathId="21"><Query SelectAllProperties="true"><Properties /></Query></Query></Actions><ObjectPaths><Constructor Id="15" TypeId="{{104e8f06-1e00-4675-99c6-1b9b504ed8d8}}" /><Property Id="17" ParentId="15" Name="PermissionRequests" /><Method Id="19" ParentId="17" Name="GetById"><Parameters><Parameter Type="Guid">{{{gid}}}</Parameter></Parameters></Method><Method Id="21" ParentId="19" Name="{m}" /></ObjectPaths>')[:900])
else: sys.exit("neznámý příkaz")
