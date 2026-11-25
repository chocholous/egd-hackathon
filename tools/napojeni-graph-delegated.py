#!/usr/bin/env python3
"""Delegovaný Graph jako lab uživatel (ROPC, heslo z ppf-rooms lab.secrets.json, nikam se neukládá).
Podpříkazy:
  token  <user>                                  vypíše access token (scope Mail.Send Mail.Read)
  send   <user> <to> [--attach SOUBOR]           POST /me/sendMail (volitelně s přílohou); vypíše HTTP kód
  inbox  <user> [--top N] [--subject TEXT]       vypíše poslední zprávy včetně příloh (Mail.Read)
Povinné: --client <appId> (nebo env EGD_CLIENT_ID; appId z napojeni-delegated-app.sh). <user> = alias nebo UPN."""
import argparse, base64, json, os, sys, urllib.error, urllib.parse, urllib.request
SEC = os.path.expanduser("~/Projects/ppf-rooms/lab/lab.secrets.json")
TENANT = "972a674c-7b85-4e56-a31f-b2f95b42fd1e"; DOM = "pavelchocholousgmail.onmicrosoft.com"
ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--client", default=os.environ.get("EGD_CLIENT_ID"))
sp = ap.add_subparsers(dest="cmd", required=True)
sp.add_parser("token").add_argument("user")
s = sp.add_parser("send"); s.add_argument("user"); s.add_argument("to"); s.add_argument("--attach")
i = sp.add_parser("inbox"); i.add_argument("user"); i.add_argument("--top", type=int, default=5); i.add_argument("--subject")
a = ap.parse_args()
if not a.client: sys.exit("chybí --client / EGD_CLIENT_ID")
upn = a.user if "@" in a.user else f"{a.user}@{DOM}"
pw = json.load(open(SEC))["hesla"].get(upn) or sys.exit(f"{upn}: heslo není v lab.secrets.json")
def call(url, data=None, h=None, m=None):
    r = urllib.request.Request(url, data=data, headers=h or {}, method=m)
    try:
        with urllib.request.urlopen(r, timeout=60) as x: return x.status, x.read()
    except urllib.error.HTTPError as e: return e.code, e.read()
st, b = call(f"https://login.microsoftonline.com/{TENANT}/oauth2/v2.0/token", urllib.parse.urlencode({
    "grant_type": "password", "client_id": a.client, "username": upn, "password": pw,
    "scope": "https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.Read"}).encode())
if st != 200: sys.exit(f"token {st}: {b[:500].decode()}")
tok = json.loads(b)["access_token"]
H = {"Authorization": "Bearer " + tok, "Content-Type": "application/json"}
if a.cmd == "token": print(tok)
elif a.cmd == "send":
    msg = {"subject": "Sonda napojeni: delegovaný sendMail", "body": {"contentType": "Text", "content": f"Odesláno jménem {upn} přes /me/sendMail."},
           "toRecipients": [{"emailAddress": {"address": a.to if "@" in a.to else f"{a.to}@{DOM}"}}]}
    if a.attach:
        msg["attachments"] = [{"@odata.type": "#microsoft.graph.fileAttachment", "name": os.path.basename(a.attach),
                               "contentBytes": base64.b64encode(open(a.attach, "rb").read()).decode()}]
    st, b = call("https://graph.microsoft.com/v1.0/me/sendMail", json.dumps({"message": msg, "saveToSentItems": True}).encode(), H, "POST")
    print(st, b[:300].decode())
else:
    q = f"https://graph.microsoft.com/v1.0/me/messages?$top={a.top}&$orderby=receivedDateTime desc&$select=subject,from,sender,receivedDateTime,hasAttachments,id"
    st, b = call(q.replace(" ", "%20"), h=H)
    if st != 200: sys.exit(f"{st} {b[:300].decode()}")
    for m in json.loads(b)["value"]:
        if a.subject and a.subject not in m["subject"]: continue
        print(m["receivedDateTime"], "| od:", m["from"]["emailAddress"]["address"], "| odesílatel:", m["sender"]["emailAddress"]["address"], "|", m["subject"], "| příloha:", m["hasAttachments"])
        if m["hasAttachments"]:
            st2, b2 = call(f"https://graph.microsoft.com/v1.0/me/messages/{m['id']}/attachments?$select=name,size,contentType", h=H)
            for x in json.loads(b2)["value"]: print("    příloha:", x["name"], x["size"], "B", x["contentType"])
