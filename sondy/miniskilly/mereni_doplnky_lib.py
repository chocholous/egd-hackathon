"""Sdílené funkce měření (z mereni_doplnky.py): tokeny admin / lab uživatel, req, err, out."""
import json, os, subprocess, sys, time, urllib.parse, urllib.request, urllib.error

W = "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-miniskilly"
ROOT = os.path.dirname(os.path.abspath(__file__)) + "/../.."
TOK = {}


def tok(who):
    if who not in TOK:
        if who == "admin":
            r = subprocess.run(["m365", "util", "accesstoken", "get", "--resource", "https://pavelchocholousgmail.sharepoint.com"],
                               capture_output=True, text=True, env={**os.environ, "HOME": os.path.expanduser("~/.m365-osobni")})
            TOK[who] = r.stdout.strip().strip('"')
        else:
            r = subprocess.run([sys.executable, ROOT + "/tools/data-prava-token.py", who], capture_output=True, text=True)
            TOK[who] = r.stdout.strip()
    return TOK[who]


def req(who, method, path, body=None, extra=None):
    url = urllib.parse.quote(W + path, safe=":/?&=$,()'|@%+")
    h = {"Authorization": "Bearer " + tok(who), "Accept": "application/json;odata=nometadata"}
    data = None
    if body is not None:
        h["Content-Type"] = "application/json;odata=nometadata"; data = json.dumps(body).encode()
    h.update(extra or {})
    t = time.time()
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data, h, method=method)) as r:
            txt = r.read().decode(); s = r.status
    except urllib.error.HTTPError as e:
        txt = e.read().decode(); s = e.code
    try: j = json.loads(txt) if txt else {}
    except Exception: j = txt
    return s, j, round(time.time() - t, 2)


def err(j):
    if isinstance(j, dict) and ("odata.error" in j or "error" in j):
        e = j.get("odata.error") or j.get("error"); m = e.get("message"); m = m.get("value") if isinstance(m, dict) else m
        return (e.get("code", "") + " " + (m or ""))[:160]
    return ""


def out(**k): print(json.dumps(k, ensure_ascii=False), flush=True)


