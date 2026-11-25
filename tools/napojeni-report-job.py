#!/usr/bin/env python3
"""Denní report: stáhne kurzy ČNB (veřejné API bez CORS), vyrobí CSV a pošle ho e-mailem s přílohou
přes Microsoft Graph sendMail s identitou managed identity (Container Apps Job). Jen standardní knihovna.

Konfigurace z prostředí (žádné pevné hodnoty v kódu):
  MAIL_SENDER   schránka, ze které se odesílá (musí na ni mít MI Exchange RBAC Application Mail.Send)
  MAIL_TO       příjemce (čárkou)
  MAIL_NEGATIVE_SENDER  (volitelné) jiná schránka; skript zkusí odeslat i z ní a očekává 403 (důkaz omezení RBAC)
  CNB_URL       zdroj dat (povinné; např. https://api.cnb.cz/cnbapi/exrates/daily?lang=EN)
Token: Container Apps (IDENTITY_ENDPOINT + IDENTITY_HEADER), lokálně --token <jwt> nebo env GRAPH_TOKEN.
Použití: napojeni-report-job.py [--dry-run] [--token JWT]   (--dry-run jen stáhne a vypíše CSV)"""
import argparse, base64, csv, io, json, os, sys, urllib.error, urllib.parse, urllib.request

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--dry-run", action="store_true"); ap.add_argument("--token")
a = ap.parse_args()

def need(n):
    v = os.environ.get(n)
    if not v and not a.dry_run: sys.exit(f"chybí proměnná prostředí {n}")
    return v

def http(url, data=None, headers=None, method=None):
    r = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(r, timeout=60) as x: return x.status, x.read()
    except urllib.error.HTTPError as e: return e.code, e.read()

def graph_token():
    if a.token or os.environ.get("GRAPH_TOKEN"): return a.token or os.environ["GRAPH_TOKEN"]
    ep, hd = os.environ["IDENTITY_ENDPOINT"], os.environ["IDENTITY_HEADER"]
    s, b = http(f"{ep}?resource=https://graph.microsoft.com&api-version=2019-08-01", headers={"X-IDENTITY-HEADER": hd})
    if s != 200: sys.exit(f"token MI selhal {s}: {b[:300]}")
    return json.loads(b)["access_token"]

cnb = os.environ.get("CNB_URL") or sys.exit("chybí proměnná prostředí CNB_URL")
s, b = http(cnb)
if s != 200: sys.exit(f"ČNB {s}: {b[:300]}")
rates = json.loads(b)["rates"]
buf = io.StringIO(); w = csv.writer(buf, delimiter=";")
w.writerow(["validFor", "country", "currency", "amount", "code", "rate_CZK"])
for r in rates: w.writerow([r["validFor"], r["country"], r["currency"], r["amount"], r["currencyCode"], r["rate"]])
csv_bytes = buf.getvalue().encode("utf-8-sig")
day = rates[0]["validFor"]
top = {r["currencyCode"]: r["rate"] / r["amount"] for r in rates if r["currencyCode"] in ("EUR", "USD", "GBP", "PLN")}
print(f"staženo {len(rates)} kurzů pro {day}; CSV {len(csv_bytes)} B; {top}")
if a.dry_run: sys.stdout.write(buf.getvalue()[:400]); sys.exit(0)

def send(sender):
    body = {"message": {
        "subject": f"Denní report kurzů ČNB {day} (sonda napojeni)",
        "body": {"contentType": "HTML", "content": "<p>Report vygenerovaný Container Apps Jobem.</p><ul>" +
                 "".join(f"<li>{k}: {v:.3f} CZK</li>" for k, v in top.items()) + f"</ul><p>{len(rates)} měn v příloze.</p>"},
        "toRecipients": [{"emailAddress": {"address": t.strip()}} for t in need("MAIL_TO").split(",")],
        "attachments": [{"@odata.type": "#microsoft.graph.fileAttachment", "name": f"kurzy-cnb-{day}.csv",
                         "contentType": "text/csv", "contentBytes": base64.b64encode(csv_bytes).decode()}]},
        "saveToSentItems": False}
    return http(f"https://graph.microsoft.com/v1.0/users/{urllib.parse.quote(sender)}/sendMail",
                json.dumps(body).encode(), {"Authorization": "Bearer " + graph_token(), "Content-Type": "application/json"}, "POST")

sender = need("MAIL_SENDER")
s, b = send(sender); print(f"sendMail jako {sender}: HTTP {s} {b[:300].decode(errors='replace')}")
neg = os.environ.get("MAIL_NEGATIVE_SENDER")
if neg:
    s2, b2 = send(neg); print(f"NEGATIVNÍ test sendMail jako {neg}: HTTP {s2} {b2[:300].decode(errors='replace')}")
sys.exit(0 if s == 202 else 1)
