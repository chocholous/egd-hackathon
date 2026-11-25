#!/usr/bin/env python3
"""Vzhled EG.D pro web Katalogu funkcí: téma SharePointu (paleta Fluent) spočítané z tokenů
skills/egd-prvni-appka/templates/spokojenost/src/webparts/spokojenost/_znacka.scss (jediný zdroj barev,
nic natvrdo). Použije se jen na tento web (REST /_api/ThemeManager/ApplyTheme), do tenantových motivů
nic nepřidává (spo theme set by zapsal téma pro celý tenant).

Použití: WEB=<url> python3 stylovat.py [--ano] [--paleta]
  --paleta  jen vypíše spočítanou paletu (JSON)
  bez --ano vypíše plán (rc 10). Volá tools/lab-m365.sh (pavel.admin).
Web party mají vlastní styly v balíčcích (kód neměníme); téma mění rámec webu: záhlaví, navigaci, odkazy,
tlačítka a nadpisy textových web partů.
"""
import json, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ZNACKA = os.path.join(ROOT, "skills/egd-prvni-appka/templates/spokojenost/src/webparts/spokojenost/_znacka.scss")
WEB = os.environ.get("WEB", "https://pavelchocholousgmail.sharepoint.com/sites/egd-ukazky")
if "--help" in sys.argv:
    print(__doc__); sys.exit(0)


def tokeny():
    t = {}
    for name, val in re.findall(r"^\$egd-([a-z-]+):\s*(#[0-9A-Fa-f]{6})", open(ZNACKA, encoding="utf-8").read(), re.M):
        t[name] = val.upper()
    for k in ("akce", "inkoust", "plocha", "okraj", "tlumeny"):
        assert k in t, f"v {ZNACKA} chybí $egd-{k}"
    return t


def rgb(h): return [int(h[i:i + 2], 16) for i in (1, 3, 5)]
def hexs(c): return "#" + "".join(f"{max(0, min(255, round(x))):02x}" for x in c)
def mix(a, b, w):  # w = podíl barvy b
    return hexs([x * (1 - w) + y * w for x, y in zip(rgb(a), rgb(b))])


def paleta(t):
    W, B = "#ffffff", "#000000"
    a, ink, plo, okr, tlu = t["akce"], t["inkoust"], t["plocha"], t["okraj"], t["tlumeny"]
    # odstíny akce: poměry odpovídají generátoru motivů Fluent (lighter/darker podle podílu bílé/černé)
    return {
        "themePrimary": a,
        "themeLighterAlt": mix(a, W, .95), "themeLighter": mix(a, W, .85), "themeLight": mix(a, W, .72),
        "themeTertiary": mix(a, W, .45), "themeSecondary": mix(a, W, .15),
        "themeDarkAlt": mix(a, B, .10), "themeDark": mix(a, B, .24), "themeDarker": mix(a, B, .44),
        "neutralLighterAlt": mix(plo, W, .5), "neutralLighter": plo, "neutralLight": mix(plo, okr, .15),
        "neutralQuaternaryAlt": mix(plo, okr, .25), "neutralQuaternary": mix(plo, okr, .33),
        "neutralTertiaryAlt": mix(plo, okr, .5), "neutralTertiary": okr,
        "neutralSecondary": tlu, "neutralPrimaryAlt": mix(tlu, ink, .5), "neutralPrimary": ink,
        "neutralDark": mix(ink, B, .2), "black": mix(ink, B, .45), "white": W,
        "primaryBackground": W, "primaryText": ink, "bodyBackground": W, "bodyText": ink,
        "disabledBackground": plo, "disabledText": okr,
    }


p = paleta(tokeny())
if "--paleta" in sys.argv:
    print(json.dumps(p, indent=1)); sys.exit(0)
body = json.dumps({"name": "EG.D (Katalog funkcí)", "themeJson": json.dumps({"palette": p, "isInverted": False})})
if "--ano" not in sys.argv:
    print(f"PLÁN: ApplyTheme „EG.D (Katalog funkcí)“ na {WEB}, themePrimary {p['themePrimary']} z {os.path.relpath(ZNACKA, ROOT)}")
    sys.exit(10)
r = subprocess.run([os.path.join(ROOT, "tools/lab-m365.sh"), "request", "--method", "post", "--url", f"{WEB}/_api/ThemeManager/ApplyTheme",
                    "--accept", "application/json;odata=nometadata", "--content-type", "application/json;odata=nometadata",
                    "--body", body, "-o", "json"], capture_output=True, text=True)
print(r.stdout[-500:], r.stderr[-500:])
if r.returncode: sys.exit(r.returncode)
# záhlaví webu v barvě akce (headerEmphasis 3 = „silné“ = themePrimary), bílý text
r = subprocess.run([os.path.join(ROOT, "tools/lab-m365.sh"), "spo", "web", "set", "--url", WEB, "--headerEmphasis", "3"], capture_output=True, text=True)
print("záhlaví:", "ok" if r.returncode == 0 else r.stderr[-300:])
sys.exit(r.returncode)
