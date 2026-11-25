#!/usr/bin/env python3
"""Stránky Katalogu funkcí EG.D: jedna stránka na oblast (text „Co se děje na pozadí“ + web part)
a rozcestník katalog.aspx s kartami (nastaví se jako domovská stránka webu).

Použití: WEB=<url> python3 stranky.py [--ano] [--jen <stranka.aspx>]
  bez --ano jen vypíše plán (rc 10). Texty jsou v texty.py (jen z důkazů v repu).
Volá tools/lab-m365.sh (pavel.admin). Existující stránku přesune do koše a založí znovu.
"""
import json, os, re, subprocess, sys, html, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from texty import OBLASTI, UVOD, REPO

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WEB = os.environ.get("WEB", "https://pavelchocholousgmail.sharepoint.com/sites/egd-ukazky")
ANO = "--ano" in sys.argv
JEN = sys.argv[sys.argv.index("--jen") + 1] if "--jen" in sys.argv else None


def m(*a, check=True):
    cmd = [os.path.join(ROOT, "tools", "lab-m365.sh"), *a]
    if not ANO:
        print("PLÁN:", " ".join(a[:6]), "…" if len(a) > 6 else ""); return ""
    for pokus in range(3):  # ECONNRESET / ETIMEDOUT z SharePointu bývají přechodné (✅ 24. 11.: 2× za sebou, pak OK)
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode == 0 or not re.search(r"ECONNRESET|ETIMEDOUT|socket hang up|EAI_AGAIN", r.stdout + r.stderr):
            break
        print(f"   síť selhala ({pokus + 1}/3), opakuji: {' '.join(a[:4])}"); time.sleep(5 * (pokus + 1))
    if check and r.returncode != 0:
        sys.exit(f"CHYBA {' '.join(a[:5])}: {r.stdout[-400:]} {r.stderr[-400:]}")
    return r.stdout


def odkaz(cesta, popis=None):
    return f'<a href="{REPO}/{cesta}">{html.escape(popis or cesta)}</a>'


def karta_html(k):
    h = [f"<h2>{html.escape(k['nazev'])}</h2>", f"<p>{k['co']}</p>", "<h3>Co se děje na pozadí</h3>", "<ol>"]
    h += [f"<li>{x}</li>" for x in k["kroky"]]
    h += ["</ol>", f"<p><strong>Proč (ne)potřebuje server:</strong> {k['server']}</p>"]
    h.append(f"<p><strong>Cesta přes Power Automate:</strong> {k['pa']}</p>")
    h.append(f"<p><strong>Co chce od IT E.ON:</strong> {k['it']}</p>")
    if k.get("tady"):
        h.append(f"<p><strong>Na tomto webu:</strong> {k['tady']}</p>")
    h.append(f"<p><strong>Jak to vyzkoušet:</strong> {k['zkus']}</p>")
    h.append("<p><strong>Důkazy:</strong> " + ", ".join(odkaz(*d) if isinstance(d, tuple) else odkaz(d) for d in k["dukazy"]) + "</p>")
    return "".join(h)


def stranka(o):
    name = o["stranka"]
    if JEN and JEN != name:
        return
    print(f"== {name}: {o['nazev']}")
    if ANO and m("spo", "file", "get", "--webUrl", WEB, "--url", f"{WEB.split('.com')[1]}/SitePages/{name}", "-o", "json", check=False).lstrip().startswith("{"):
        m("spo", "file", "remove", "--webUrl", WEB, "--url", f"{WEB.split('.com')[1]}/SitePages/{name}", "--recycle", "--force")
        print("   stará stránka v koši")
    m("spo", "page", "add", "--webUrl", WEB, "--name", name, "--title", o["nazev"], "--layoutType", "Article", "-o", "none")
    sekce = 1
    m("spo", "page", "section", "add", "--webUrl", WEB, "--pageName", name, "--sectionTemplate", "OneColumn", "--order", str(sekce))
    m("spo", "page", "text", "add", "--webUrl", WEB, "--pageName", name, "--section", str(sekce),
      "--text", f'<p><a href="{WEB}/SitePages/katalog.aspx">← Katalog funkcí</a></p><p>{o["uvod"]}</p>')
    for k in o["karty"]:
        sekce += 1
        m("spo", "page", "section", "add", "--webUrl", WEB, "--pageName", name, "--sectionTemplate", "OneColumn", "--order", str(sekce))
        m("spo", "page", "text", "add", "--webUrl", WEB, "--pageName", name, "--section", str(sekce), "--text", karta_html(k))
        if k.get("webpart"):
            m("spo", "page", "clientsidewebpart", "add", "--webUrl", WEB, "--pageName", name, "--section", str(sekce),
              "--webPartId", k["webpart"], "--webPartProperties", json.dumps(k.get("vlastnosti", {}), ensure_ascii=False))
    m("spo", "page", "set", "--webUrl", WEB, "--name", name, "--publish")
    print(f"   {WEB}/SitePages/{name}")


def rozcestnik():
    name = "katalog.aspx"
    if JEN and JEN != name:
        return
    print(f"== {name}: rozcestník")
    if ANO and m("spo", "file", "get", "--webUrl", WEB, "--url", f"{WEB.split('.com')[1]}/SitePages/{name}", "-o", "json", check=False).lstrip().startswith("{"):
        m("spo", "file", "remove", "--webUrl", WEB, "--url", f"{WEB.split('.com')[1]}/SitePages/{name}", "--recycle", "--force")
    m("spo", "page", "add", "--webUrl", WEB, "--name", name, "--title", "Katalog funkcí EG.D", "--layoutType", "Article", "-o", "none")
    m("spo", "page", "section", "add", "--webUrl", WEB, "--pageName", name, "--sectionTemplate", "OneColumn", "--order", "1")
    m("spo", "page", "text", "add", "--webUrl", WEB, "--pageName", name, "--section", "1", "--text", UVOD)
    # karty: tabulka 3 vedle sebe v jednom textovém web partu (CLI v11: sekce ThreeColumn vrací „Invalid column '2'“ ✅ 24. 11.)
    bunky = []
    for o in OBLASTI:
        funkce = "".join(f"<li>{html.escape(k['kratce'])}</li>" for k in o["karty"])
        bunky.append(f'<td width="33%" valign="top"><h3><a href="{WEB}/SitePages/{o["stranka"]}">{html.escape(o["nazev"])}</a></h3>'
                     f'<p>{o["karta"]}</p><ul>{funkce}</ul><p><a href="{WEB}/SitePages/{o["stranka"]}">Otevřít ukázku →</a></p></td>')
    radky = "".join("<tr>" + "".join(bunky[i:i + 3]) + "</tr>" for i in range(0, len(bunky), 3))
    m("spo", "page", "section", "add", "--webUrl", WEB, "--pageName", name, "--sectionTemplate", "OneColumn", "--order", "2")
    m("spo", "page", "text", "add", "--webUrl", WEB, "--pageName", name, "--section", "2", "--text", f'<table width="100%" style="width:100%"><tbody>' + f"{radky}</tbody></table>")
    m("spo", "page", "set", "--webUrl", WEB, "--name", name, "--publish")
    m("spo", "web", "set", "--url", WEB, "--welcomePage", "SitePages/katalog.aspx")
    print(f"   {WEB}/SitePages/{name} (domovská stránka)")


for o in OBLASTI:
    stranka(o)
rozcestnik()
if not ANO:
    sys.exit(10)
