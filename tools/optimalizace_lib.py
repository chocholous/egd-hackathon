"""Společná knihovna sond optimalizace (web /sites/egd-sonda-optimalizace, lab pavelchocholousgmail).
Tokeny: admin = m365 CLI (HOME=~/.m365-osobni), uživatelé = data-prava-token.py (ROPC, hesla z lab.secrets.json).
Nic se neukládá na disk. Import: sys.path.insert(0, <tools>); import optimalizace_lib as L"""
import json, os, subprocess, sys, time, urllib.error, urllib.parse, urllib.request, uuid

ORIGIN = "https://pavelchocholousgmail.sharepoint.com"
WEB = os.environ.get("OPT_WEB", ORIGIN + "/sites/egd-sonda-optimalizace")
TOOLS = os.path.dirname(os.path.abspath(__file__))
TENANT_DOM = "pavelchocholousgmail.onmicrosoft.com"
_tok, _dig = {}, {}
RETRIES = [0]  # počet opakování po 429/503


def token(who=None, resource=ORIGIN):
    key = (who, resource)
    if key not in _tok:
        if who is None:
            o = subprocess.run(["m365", "util", "accesstoken", "get", "--resource", resource], capture_output=True, text=True,
                               env={**os.environ, "HOME": os.path.expanduser("~/.m365-osobni")})
        else:
            o = subprocess.run([sys.executable, os.path.join(TOOLS, "data-prava-token.py"), who, "--resource", resource], capture_output=True, text=True)
        if o.returncode: sys.exit(o.stderr[:500])
        _tok[key] = o.stdout.strip().strip('"')
    return _tok[key]


def req(method, url, body=None, who=None, headers=None, raw=None, web=None, verbose=False, timeout=300):
    """Vrací (status, json|text, sec). url: /_api/... (relativně k webu) nebo plná URL."""
    web = web or WEB
    full = url if url.startswith("http") else web + url
    full = urllib.parse.quote(full, safe=":/?&=$,()'|@%;*+!")
    odata = "verbose" if verbose else "nometadata"
    h = {"Authorization": "Bearer " + token(who), "Accept": f"application/json;odata={odata}"}
    data = raw
    if body is not None:
        h["Content-Type"] = f"application/json;odata={odata}"
        data = json.dumps(body).encode()
    if method != "GET":
        k = (who, web)
        if k not in _dig:
            r = urllib.request.Request(web + "/_api/contextinfo", b"", {"Authorization": h["Authorization"], "Accept": "application/json;odata=nometadata"}, method="POST")
            _dig[k] = json.load(urllib.request.urlopen(r))["FormDigestValue"]
        h["X-RequestDigest"] = _dig[k]
    h.update(headers or {})
    for pokus in range(8):  # 429/503: čekej Retry-After (SharePoint throttling), čas měř jen posledního pokusu
        t = time.perf_counter()
        try:
            with urllib.request.urlopen(urllib.request.Request(full, data, h, method=method), timeout=timeout) as resp:
                txt = resp.read().decode()
                ct = resp.headers.get("Content-Type", "")
                return resp.status, (json.loads(txt) if txt and "json" in ct else txt), round(time.perf_counter() - t, 3)
        except urllib.error.URLError as e:
            if not isinstance(e, urllib.error.HTTPError):  # reset spojení apod.: zopakuj
                RETRIES[0] += 1; time.sleep(2); continue
            txt = e.read().decode()
            if e.code == 401 and pokus < 2:  # vypršel token (~1 h): vyžádej nový a zopakuj
                _tok.pop((who, ORIGIN), None); _dig.clear(); h["Authorization"] = "Bearer " + token(who); continue
            if e.code in (429, 503) and pokus < 7:
                RETRIES[0] += 1
                time.sleep(min(int(e.headers.get("Retry-After", "5")), 60)); continue
            try: j = json.loads(txt)
            except Exception: j = txt
            return e.code, j, round(time.perf_counter() - t, 3)


def err(j, n=200):
    if isinstance(j, dict):
        e = j.get("odata.error") or j.get("error") or {}
        m = e.get("message"); m = m.get("value") if isinstance(m, dict) else m
        return (m or json.dumps(j))[:n]
    return str(j)[:n]


def out(**kw):
    print(json.dumps(kw, ensure_ascii=False), flush=True)


def list_path(title):
    return f"/_api/web/lists/getbytitle('{title}')"
