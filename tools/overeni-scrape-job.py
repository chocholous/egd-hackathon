#!/usr/bin/env python3
"""Scraping HTML stránky v Container Apps Jobu: stáhne stránku (URL z env SCRAPE_URL), rozparsuje <table>
(jen standardní knihovna) a vypíše tabulky jako JSON řádky do stdout (log Jobu). Nic neposílá, nic nezapisuje.
Konfigurace z prostředí: SCRAPE_URL (povinné), SCRAPE_UA (volitelné, výchozí egd-workshop-sonda).
SCRAPE_CA_PEM (volitelné): PEM kořenové CA navíc k systémovým (když image CA nezná, např. ISRG Root X2 u OTE).
Použití lokálně: SCRAPE_URL=https://… tools/overeni-scrape-job.py"""
import json, os, ssl, sys, time, urllib.request
from html.parser import HTMLParser
if "--help" in sys.argv or "-h" in sys.argv: print(__doc__); sys.exit(0)
url = os.environ.get("SCRAPE_URL") or sys.exit("chybí SCRAPE_URL")
class P(HTMLParser):
    def __init__(s): super().__init__(); s.t = []; s.row = None; s.cell = None
    def handle_starttag(s, tag, a):
        if tag == "table": s.t.append([])
        if tag == "tr" and s.t: s.row = []
        if tag in ("td", "th") and s.row is not None: s.cell = ""
    def handle_endtag(s, tag):
        if tag in ("td", "th") and s.cell is not None: s.row.append(" ".join(s.cell.split())); s.cell = None
        if tag == "tr" and s.row is not None and s.t: s.t[-1].append(s.row); s.row = None
    def handle_data(s, d):
        if s.cell is not None: s.cell += d
t0 = time.time()
ctx = ssl.create_default_context()
print(json.dumps({"ssl_paths": str(ssl.get_default_verify_paths().cafile), "ca_nacteno": len(ctx.get_ca_certs())}))
if os.environ.get("SCRAPE_CA_PEM"): ctx.load_verify_locations(cadata=os.environ["SCRAPE_CA_PEM"])
r = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": os.environ.get("SCRAPE_UA", "egd-workshop-sonda")}), timeout=30, context=ctx)
html = r.read().decode(r.headers.get_content_charset() or "utf-8")
print(json.dumps({"url": url, "http": r.status, "bytes": len(html), "ms": int((time.time() - t0) * 1000)}, ensure_ascii=False))
p = P(); p.feed(html)
print(json.dumps({"tabulek": len(p.t), "radku": [len(t) for t in p.t]}, ensure_ascii=False))
for i, t in enumerate(p.t):
    for row in t[:6]: print(json.dumps({"tabulka": i, "radek": row}, ensure_ascii=False))
