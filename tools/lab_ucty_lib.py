"""Sdílené funkce pro skripty tools/lab-ucty-*.py (účty, weby a licence účastníků workshopu EG.D).

Konfigurace má výchozí hodnoty ze zadání (lab tenant Pavla) a jde přepsat proměnnými prostředí
EGD_LAB_*. Graph volá tokenem z `az` (přihlášený do lab tenantu), SharePoint přes
`HOME=~/.m365-osobni m365`. Hesla jsou jen v lab/ucastnici.secrets.json (0600).
"""
from __future__ import annotations

import json
import os
import secrets
import string
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# --- konfigurace (přepsatelná env proměnnými) ---------------------------------------------------
TENANT_ID = os.environ.get("EGD_LAB_TENANT_ID", "972a674c-7b85-4e56-a31f-b2f95b42fd1e")
DOMENA = os.environ.get("EGD_LAB_DOMENA", "pavelchocholousgmail.onmicrosoft.com")
SP_HOST = os.environ.get("EGD_LAB_SP_HOST", "https://pavelchocholousgmail.sharepoint.com")
SPRAVCE = os.environ.get("EGD_LAB_SPRAVCE", f"pavel.admin@{DOMENA}")
PREFIX = os.environ.get("EGD_LAB_PREFIX", "egd")
POCET = int(os.environ.get("EGD_LAB_POCET", "10"))
PROSTREDI = ("dev", "test", "prod")
SKUPINA = os.environ.get("EGD_LAB_SKUPINA", "EGD workshop účastníci")
LCID = os.environ.get("EGD_LAB_LCID", "1029")  # čeština
M365_HOME = os.path.expanduser(os.environ.get("EGD_LAB_M365_HOME", "~/.m365-osobni"))

ROOT = Path(__file__).resolve().parent.parent
SECRETS = ROOT / "lab" / "ucastnici.secrets.json"
GRAPH = "https://graph.microsoft.com/v1.0"


def ucty() -> list[str]:
    """Krátká jména účtů: egd01 … egd10."""
    return [f"{PREFIX}{i:02d}" for i in range(1, POCET + 1)]


def upn(alias: str) -> str:
    return f"{alias}@{DOMENA}"


def web_url(alias: str, env: str) -> str:
    return f"{SP_HOST}/sites/{alias}-{env}"


def vyber_ucty(arg: str | None) -> list[str]:
    """--ucty "egd01,egd03" → seznam; nic → všechny."""
    if not arg:
        return ucty()
    vse = set(ucty())
    out = []
    for a in arg.split(","):
        a = a.strip()
        if a.isdigit():
            a = f"{PREFIX}{int(a):02d}"
        if a not in vse:
            raise SystemExit(f"neznámý účet: {a}")
        out.append(a)
    return out


def heslo() -> str:
    """Silné náhodné heslo bez snadno zaměnitelných znaků (l/1/O/0), 20 znaků."""
    abc = "".join(c for c in string.ascii_letters + string.digits if c not in "lI1O0o")
    jadro = "".join(secrets.choice(abc) for _ in range(16))
    return f"Egd-{jadro}!{secrets.choice('23456789')}"


def vydejni_kod() -> str:
    """Výdejní kód pro stránku: 8 znaků Crockford base32 bez I/L/O/U (40 bitů), např. K7M4-9QXP."""
    abc = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
    k = "".join(secrets.choice(abc) for _ in range(8))
    return f"{k[:4]}-{k[4:]}"


# --- tajemství -----------------------------------------------------------------------------------
def load_secrets() -> dict:
    if SECRETS.exists():
        return json.loads(SECRETS.read_text())
    return {}


def save_secrets(data: dict) -> None:
    SECRETS.parent.mkdir(parents=True, exist_ok=True)
    tmp = SECRETS.with_suffix(".tmp")
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.chmod(tmp, 0o600)
    tmp.replace(SECRETS)


# --- Graph přes token z az -------------------------------------------------------------------------
_token: tuple[str, float] | None = None


def _get_token() -> str:
    global _token
    if _token and _token[1] > time.time() + 120:
        return _token[0]
    r = subprocess.run(["az", "account", "get-access-token", "--resource-type", "ms-graph",
                        "--tenant", TENANT_ID, "-o", "json"], capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(f"az token selhal: {r.stderr.strip()}")
    j = json.loads(r.stdout)
    _token = (j["accessToken"], float(j.get("expires_on", time.time() + 3000)))
    return _token[0]


def graph(method: str, path: str, body: dict | None = None, ok404: bool = False):
    url = path if path.startswith("http") else GRAPH + path
    url = urllib.parse.quote(url, safe=":/?&=$,'()@%+")
    data = json.dumps(body).encode() if body is not None else None
    for pokus in range(5):
        req = urllib.request.Request(url, data=data, method=method, headers={
            "Authorization": f"Bearer {_get_token()}", "Content-Type": "application/json",
            "ConsistencyLevel": "eventual"})
        try:
            with urllib.request.urlopen(req) as resp:
                txt = resp.read().decode()
                return json.loads(txt) if txt else {}
        except urllib.error.HTTPError as e:
            txt = e.read().decode()
            if e.code == 404 and ok404:
                return None
            if e.code == 404 and pokus < 4:  # čerstvě založený objekt se ještě replikuje
                time.sleep(4 * (pokus + 1))
                continue
            if e.code in (429, 503, 504) or (e.code == 400 and "replicat" in txt.lower()):
                time.sleep(3 * (pokus + 1))
                continue
            raise SystemExit(f"Graph {method} {path} → {e.code}: {txt[:500]}")
    raise SystemExit(f"Graph {method} {path}: opakovaně selhalo")


def assert_tenant() -> None:
    org = graph("GET", "/organization?$select=id")["value"][0]["id"]
    if org != TENANT_ID:
        raise SystemExit(f"az je přihlášen do jiného tenantu ({org}), čekám {TENANT_ID}")


def najdi_uzivatele(alias: str, select: str = "id,userPrincipalName,accountEnabled,assignedLicenses"):
    r = graph("GET", f"/users?$filter=userPrincipalName eq '{upn(alias)}'&$select={select}")
    return r["value"][0] if r["value"] else None


def najdi_skupinu() -> dict | None:
    """Skupinu hledá nejdřív podle id uloženého v secrets (Entra replikuje filtr se zpožděním)."""
    gid = load_secrets().get("skupinaId")
    if gid:
        g = graph("GET", f"/groups/{gid}?$select=id,displayName", ok404=True)
        if g:
            return g
    r = graph("GET", f"/groups?$filter=displayName eq '{SKUPINA}'&$select=id,displayName")
    return r["value"][0] if r["value"] else None


def sku_id(part: str) -> str:
    for s in graph("GET", "/subscribedSkus")["value"]:
        if s["skuPartNumber"] == part:
            return s["skuId"]
    raise SystemExit(f"SKU {part} v tenantu není")


# --- m365 CLI (osobní HOME → lab tenant) ---------------------------------------------------------
M365_WRAPPER = ROOT / "tools/lab-m365.sh"  # hlídá v11 a obnovuje token cache (CLAUDE.md § Lab)


def m365(*args: str, check: bool = True, as_json: bool = True):
    extra = ["-o", "json"] if as_json else []
    if M365_HOME == os.path.expanduser("~/.m365-osobni"):
        cmd, env = [str(M365_WRAPPER), *args, *extra], None  # sdílené HOME jen přes wrapper
    else:
        cmd, env = ["m365", *args, *extra], dict(os.environ, HOME=M365_HOME)
    r = subprocess.run(cmd, capture_output=True, text=True, env=env)
    if r.returncode and check:
        raise SystemExit(f"m365 {' '.join(args)} selhal:\n{r.stderr.strip()}")
    if r.returncode:
        return None
    out = r.stdout.strip()
    if as_json and out:
        try:
            return json.loads(out)
        except json.JSONDecodeError:
            return out
    return out


def assert_m365_tenant() -> None:
    st = m365("status")
    if not isinstance(st, dict) or st.get("appTenant") != TENANT_ID or not str(st.get("connectedAs", "")).endswith(DOMENA):
        raise SystemExit(f"m365 (HOME={M365_HOME}) není přihlášen do lab tenantu: {st}")


def log(*a) -> None:
    print(*a, file=sys.stderr, flush=True)
