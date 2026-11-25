#!/usr/bin/env python3
"""Výdejní web appka lab účtů EG.D (Azure Static Web Apps Free + Table Storage) — založení, nasazení, správa.

Kód appky je v lab/vydej-app/ (bez tajemství). Hesla účtů a společné heslo bere z lab/ucastnici.secrets.json
(klíč "vydej" doplní: spolecne_heslo, admin_heslo, podpis_klic) a do Azure je posílá jen jako app settings.

Použití:
  tools/lab-vydej.py zalozit     # RG, storage + tabulka, SWA Free, app settings (idempotentní)
  tools/lab-vydej.py nasadit     # nahraje lab/vydej-app (frontend + API) do produkce SWA
  tools/lab-vydej.py stav        # URL, SKU, rezervace (bez hesel)
  tools/lab-vydej.py uvolnit egd03   # zruší rezervaci účtu
  tools/lab-vydej.py uvolnit-vse     # zruší všechny rezervace (po testech)
  tools/lab-vydej.py smazat      # vypíše příkaz pro smazání celé RG (sám nic nemaže)

Proměnné prostředí (výchozí hodnoty v závorce):
  EGD_VYDEJ_RG (rg-egd-vydej), EGD_VYDEJ_LOKACE (eastus2, SWA), EGD_VYDEJ_LOKACE_ST (swedencentral, storage), EGD_VYDEJ_SAS_DNY (30),
  EGD_VYDEJ_SEZENI_HODIN (12), EGD_LAB_SUB (lab subscription z CLAUDE.md),
  EGD_VYDEJ_CLI_APPID (appId CLI aplikace pro `m365 login`; bez něj se dohledá v Entra podle názvu),
  EGD_VYDEJ_CLI_APPNAZEV (m365-cli-spfx-lab), EGD_LAB_DOMENA (pavelchocholousgmail.onmicrosoft.com, tenant v příkazu)
"""
import json, os, secrets, stat, subprocess, sys, tempfile, hashlib, datetime, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEC = ROOT / "lab/ucastnici.secrets.json"
APP = ROOT / "lab/vydej-app"
SUB = os.environ.get("EGD_LAB_SUB", "05a636d8-d8e3-49d2-a450-4b3ff7cc0a13")
RG = os.environ.get("EGD_VYDEJ_RG", "rg-egd-vydej")
LOK = os.environ.get("EGD_VYDEJ_LOKACE", "eastus2")  # SWA Free: centralus, eastus2, westus2, westeurope, eastasia; westeurope 23. 11. odmítl (RequestDisallowedByAzure)
LOK_ST = os.environ.get("EGD_VYDEJ_LOKACE_ST", "swedencentral")  # westeurope storage odmítá (23. 11.: RequestDisallowedByAzure)
SAS_DNY = int(os.environ.get("EGD_VYDEJ_SAS_DNY", "30"))
SEZENI_HODIN = os.environ.get("EGD_VYDEJ_SEZENI_HODIN", "12")
SP_HOST = os.environ.get("EGD_LAB_SP_HOST", "https://pavelchocholousgmail.sharepoint.com")
CLI_APPNAZEV = os.environ.get("EGD_VYDEJ_CLI_APPNAZEV", "m365-cli-spfx-lab")  # lab appka s consentem pro všechny (08)
DOMENA = os.environ.get("EGD_LAB_DOMENA", "pavelchocholousgmail.onmicrosoft.com")
TAG = "ucel=egd-workshop"
SWA = "swa-egd-vydej"
ST = "stegdvydej" + hashlib.sha256(SUB.encode()).hexdigest()[:8]  # globálně unikátní, stabilní
TABULKA = "rezervace"
SLOVA = ["proud", "napeti", "sit", "kabel", "trafo", "elektron", "jistic", "vedeni", "zdroj", "vypinac",
         "faze", "uzel", "rozvod", "stozar", "izolant", "civka", "obvod", "sber", "dioda", "zarovka"]


def az(*a, js=True, check=True):
    r = subprocess.run(["az", *a, "--subscription", SUB, *(["-o", "json"] if js else [])], capture_output=True, text=True)
    if r.returncode and check:
        sys.exit(f"az {' '.join(a[:3])} selhal:\n{r.stderr.strip()}")
    if r.returncode:
        return None
    return json.loads(r.stdout) if js and r.stdout.strip() else r.stdout.strip()


def tajne():
    d = json.loads(SEC.read_text())
    v = d.setdefault("vydej", {})
    zmena = False
    if not v.get("spolecne_heslo"):
        v["spolecne_heslo"] = f"{secrets.choice(SLOVA)}-{secrets.choice(SLOVA)}-{secrets.randbelow(9000) + 1000}"; zmena = True
    for k, n in (("admin_heslo", 18), ("podpis_klic", 32)):
        if not v.get(k):
            v[k] = secrets.token_urlsafe(n); zmena = True
    if zmena:
        SEC.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
        os.chmod(SEC, 0o600)
    return d


def klic():
    return az("storage", "account", "keys", "list", "-g", RG, "-n", ST, "--query", "[0].value", "-o", "tsv", js=False)


def zalozit():
    d = tajne()
    if not az("group", "show", "-n", RG, check=False):
        az("group", "create", "-n", RG, "-l", LOK_ST, "--tags", TAG)
    if not az("storage", "account", "show", "-g", RG, "-n", ST, check=False):
        az("storage", "account", "create", "-g", RG, "-n", ST, "-l", LOK_ST, "--sku", "Standard_LRS", "--kind", "StorageV2",
           "--min-tls-version", "TLS1_2", "--allow-blob-public-access", "false", "--tags", TAG)
    k = klic()
    az("storage", "table", "create", "--name", TABULKA, "--account-name", ST, "--account-key", k)
    exp = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=SAS_DNY)).strftime("%Y-%m-%dT%H:%MZ")
    sas = az("storage", "table", "generate-sas", "--name", TABULKA, "--account-name", ST, "--account-key", k,
             "--permissions", "raud", "--expiry", exp, "--https-only", "-o", "tsv", js=False)
    if not az("staticwebapp", "show", "-g", RG, "-n", SWA, check=False):
        az("staticwebapp", "create", "-g", RG, "-n", SWA, "-l", LOK, "--sku", "Free", "--tags", TAG)
    cli_app = os.environ.get("EGD_VYDEJ_CLI_APPID") or subprocess.run(  # az ad nebere --subscription, proto ne přes az()
        ["az", "ad", "app", "list", "--display-name", CLI_APPNAZEV, "--query", "[0].appId", "-o", "tsv"],
        capture_output=True, text=True, check=True).stdout.strip()
    if not cli_app:
        sys.exit(f"CLI appka {CLI_APPNAZEV!r} v tenantu není; nastav EGD_VYDEJ_CLI_APPID")
    ucty = {upn.split("@")[0]: {"upn": upn, "heslo": h} for upn, h in sorted(d["hesla"].items())}
    v = d["vydej"]
    props = {"SPOLECNE_HESLO": v["spolecne_heslo"], "ADMIN_HESLO": v["admin_heslo"], "PODPIS_KLIC": v["podpis_klic"],
             "UCTY_JSON": json.dumps(ucty, ensure_ascii=False), "TABLE_URL": f"https://{ST}.table.core.windows.net/{TABULKA}",
             "TABLE_SAS": sas, "SEZENI_HODIN": SEZENI_HODIN, "SP_HOST": SP_HOST,
             "CLI_APP_ID": cli_app, "CLI_TENANT": DOMENA}
    fd, cesta = tempfile.mkstemp(suffix=".json")
    try:
        os.fchmod(fd, stat.S_IRUSR | stat.S_IWUSR)
        with os.fdopen(fd, "w") as f:
            json.dump({"properties": props}, f)
        url = f"https://management.azure.com/subscriptions/{SUB}/resourceGroups/{RG}/providers/Microsoft.Web/staticSites/{SWA}/config/appsettings?api-version=2022-03-01"
        r = subprocess.run(["az", "rest", "--method", "put", "--url", url, "--body", "@" + cesta, "-o", "none"], capture_output=True, text=True)
        if r.returncode:
            sys.exit("app settings selhaly:\n" + r.stderr.strip())
    finally:
        subprocess.run(["/usr/bin/trash", cesta])
    print(f"založeno: {RG} / {ST} (tabulka {TABULKA}, SAS do {exp}) / {SWA}; app settings: {', '.join(props)}")
    stav()


def nasadit():
    token = az("staticwebapp", "secrets", "list", "-g", RG, "-n", SWA, "--query", "properties.apiKey", "-o", "tsv", js=False)
    env = dict(os.environ, SWA_CLI_DEPLOYMENT_TOKEN=str(token))
    swa = ["npx", "-y", "@azure/static-web-apps-cli@2.1.0", "deploy", "app", "--api-location", "api",
           "--api-language", "node", "--api-version", "20", "--env", "production"]
    # StaticSitesClient má jen x86_64 binárku: na Apple Silicon bez Rosetty padá „spawn Unknown system error -86“,
    # proto výchozí cesta přes linux/amd64 kontejner (OrbStack/Docker). EGD_VYDEJ_BEZ_DOCKERU=1 = přímo.
    if os.environ.get("EGD_VYDEJ_BEZ_DOCKERU"):
        r = subprocess.run(swa, env=env, cwd=APP)
    else:
        docker = os.environ.get("DOCKER", os.path.expanduser("~/.orbstack/bin/docker"))
        r = subprocess.run([docker, "run", "--rm", "--platform", "linux/amd64", "-e", "SWA_CLI_DEPLOYMENT_TOKEN", "-e", "DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1",
                            "-v", f"{APP}:/src:ro", "node:20-bookworm", "sh", "-c",
                            "cp -r /src /w && cd /w && " + " ".join(swa)], env=env)
    sys.exit(r.returncode) if r.returncode else stav()


def _tabulka():
    k = klic()
    sas = az("storage", "table", "generate-sas", "--name", TABULKA, "--account-name", ST, "--account-key", k, "--permissions", "rd",
             "--expiry", (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)).strftime("%Y-%m-%dT%H:%MZ"),
             "--https-only", "-o", "tsv", js=False)
    return f"https://{ST}.table.core.windows.net/{TABULKA}", sas


def _rezervace(base, sas):
    q = urllib.request.Request(f"{base}()?{sas}", headers={"Accept": "application/json;odata=nometadata", "x-ms-version": "2019-02-02"})
    return json.load(urllib.request.urlopen(q))["value"]


def _smaz(base, sas, ucet):
    q = urllib.request.Request(f"{base}(PartitionKey='u',RowKey='{ucet}')?{sas}", method="DELETE",
                               headers={"If-Match": "*", "x-ms-version": "2019-02-02", "Content-Type": "application/json", "Accept": "application/json;odata=nometadata"})
    urllib.request.urlopen(q)


def stav():
    s = az("staticwebapp", "show", "-g", RG, "-n", SWA, check=False)
    if not s:
        return print(f"{SWA} v {RG} neexistuje")
    print(f"URL: https://{s['defaultHostname']}  SKU: {s['sku']['name']}  lokace: {s['location']}")
    base, sas = _tabulka()
    rez = _rezervace(base, sas)
    print(f"rezervace ({len(rez)}): " + (", ".join(f"{x['RowKey']}={x.get('jmeno', '')}" for x in sorted(rez, key=lambda x: x["RowKey"])) or "žádné"))


def uvolnit(ucty):
    base, sas = _tabulka()
    if ucty == ["*"]:
        ucty = [x["RowKey"] for x in _rezervace(base, sas)]
    for u in ucty:
        try:
            _smaz(base, sas, u); print("uvolněno:", u)
        except urllib.error.HTTPError as e:
            print(f"{u}: {e.code} (nebyl rezervován)" if e.code == 404 else f"{u}: chyba {e.code}")


def main():
    a = sys.argv[1:]
    if not a or a[0] in ("-h", "--help"):
        return print(__doc__)
    if a[0] == "zalozit": zalozit()
    elif a[0] == "nasadit": nasadit()
    elif a[0] == "stav": stav()
    elif a[0] == "uvolnit" and len(a) > 1: uvolnit(a[1:])
    elif a[0] == "uvolnit-vse": uvolnit(["*"])
    elif a[0] == "smazat":
        print(f"Smaže appku, tabulku i rezervace (nevratně, rozhodne Pavel):\n  az group delete -n {RG} --subscription {SUB} --yes")
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
