#!/usr/bin/env python3
"""Naplní seznam z egd-prvni-appka („Pozadavky“ nebo „Spokojenost“) N zkušebními položkami přes SP REST $batch.

Účel: zkouška limitu 5000 (list view threshold) a miniskillu egd-data-seznamy v labu.
Jen lab tenant pavelchocholousgmail; admin token z m365 CLI (HOME=~/.m365-osobni).
Stav: každá 20. položka „Nový“, každá 7. „Zamítnuto“, jinak „Schváleno“.

Příklad:
  python3 tools/miniskilly-naplnit-seznam.py --web https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-miniskilly --count 6000
  python3 tools/miniskilly-naplnit-seznam.py --web ... --count 6000 --plan     # jen vypíše, co by udělal
"""
import argparse, json, os, subprocess, sys, time, urllib.request, urllib.error, uuid
from concurrent.futures import ThreadPoolExecutor

TENANT = "pavelchocholousgmail.sharepoint.com"


def token(origin):
    out = subprocess.run(["m365", "util", "accesstoken", "get", "--resource", origin], capture_output=True, text=True,
                         env={**os.environ, "HOME": os.path.expanduser("~/.m365-osobni")})
    if out.returncode:
        sys.exit(out.stderr)
    return out.stdout.strip().strip('"')


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--web", required=True)
    p.add_argument("--typ", choices=["pozadavky", "spokojenost"], default="pozadavky",
                   help="pozadavky: Title/Popis/Stav (Evidence); spokojenost: Den/Hodnoceni (egd-prvni-appka, hlasy rozložené do --dni dnů zpět)")
    p.add_argument("--dni", type=int, default=60, help="jen spokojenost: přes kolik dnů zpět rozložit hlasy")
    p.add_argument("--list", default=None, help="název seznamu (výchozí Pozadavky / Spokojenost podle --typ)")
    p.add_argument("--count", type=int, required=True)
    p.add_argument("--per-batch", type=int, default=100)
    p.add_argument("--parallel", type=int, default=4)
    p.add_argument("--plan", action="store_true", help="jen plán, nic nezapisuje")
    a = p.parse_args()
    a.list = a.list or ("Spokojenost" if a.typ == "spokojenost" else "Pozadavky")
    if TENANT not in a.web:
        sys.exit(f"jen lab tenant {TENANT}")
    origin = "https://" + TENANT
    if a.typ == "spokojenost":
        import datetime
        dnes = datetime.date.today()
        den = lambda i: (dnes - datetime.timedelta(days=1 + i % a.dni)).isoformat()   # dnešek nechá volný pro ruční hlas
        bodies = [{"Title": den(i), "Den": den(i), "Hodnoceni": 1 + (i * 7) % 5} for i in range(a.count)]
        info = {"dni_zpet": a.dni, "na_den": a.count // a.dni}
    else:
        stavy = lambda i: "Nový" if i % 20 == 0 else ("Zamítnuto" if i % 7 == 0 else "Schváleno")
        bodies = [{"Title": f"Zkušební požadavek {i}", "Popis": "Plnění pro zkoušku limitu 5000", "Stav": stavy(i)} for i in range(a.count)]
        info = {"z_toho_Novy": sum(1 for b in bodies if b["Stav"] == "Nový")}
    print(json.dumps({"plan": "vložit položky", "typ": a.typ, "web": a.web, "list": a.list, "count": a.count, **info}, ensure_ascii=False))
    if a.plan:
        return 10
    tok = token(origin)
    r = urllib.request.Request(a.web + "/_api/contextinfo", b"", {"Authorization": "Bearer " + tok, "Accept": "application/json;odata=nometadata"})
    digest = json.load(urllib.request.urlopen(r))["FormDigestValue"]
    lst = a.list.replace("'", "''")

    def batch(chunk):
        bd, cs = "batch_" + uuid.uuid4().hex, "changeset_" + uuid.uuid4().hex
        parts = "".join(
            f"--{cs}\r\nContent-Type: application/http\r\nContent-Transfer-Encoding: binary\r\n\r\n"
            f"POST {a.web}/_api/web/lists/getbytitle('{lst}')/items HTTP/1.1\r\n"
            f"Accept: application/json;odata=nometadata\r\nContent-Type: application/json;odata=nometadata\r\n\r\n{json.dumps(b)}\r\n"
            for b in chunk)
        raw = (f"--{bd}\r\nContent-Type: multipart/mixed; boundary={cs}\r\n\r\n" + parts + f"--{cs}--\r\n--{bd}--\r\n").encode()
        h = {"Authorization": "Bearer " + tok, "X-RequestDigest": digest, "Content-Type": f"multipart/mixed; boundary={bd}", "Accept": "application/json"}
        for pokus in range(6):
            try:
                with urllib.request.urlopen(urllib.request.Request(a.web + "/_api/$batch", raw, h, method="POST")) as resp:
                    return resp.read().decode().count("HTTP/1.1 201")
            except urllib.error.HTTPError as e:
                if e.code in (429, 503):
                    time.sleep(5 * (pokus + 1)); continue
                print("chyba", e.code, e.read().decode()[:300], file=sys.stderr); return 0
        return 0

    chunks = [bodies[i:i + a.per_batch] for i in range(0, len(bodies), a.per_batch)]
    t = time.time()
    with ThreadPoolExecutor(a.parallel) as ex:
        ok = sum(ex.map(batch, chunks))
    print(json.dumps({"vlozeno": ok, "z": a.count, "sec": round(time.time() - t, 1)}))
    return 0 if ok == a.count else 1


if __name__ == "__main__":
    sys.exit(main())
