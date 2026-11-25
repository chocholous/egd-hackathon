#!/usr/bin/env python3
"""Založí každému účastníkovi tři SharePoint weby egdNN-dev / -test / -prod se site app catalogem.

Komunikační web (šablona Blank, čeština): nemá M365 skupinu, Teams ani poštu, takže vlastnictví
je jen v SharePointu a nic se nesdílí se „všemi“. Účastník = primární správce kolekce webů
a člen skupiny Vlastníci; správce labu (pavel.admin) zůstává sekundární správce.
Idempotentní: chybějící kroky doplní, existující přeskočí. Nic nemaže.

Použití:
  tools/lab-ucty-weby.py                  # všech 30 webů
  tools/lab-ucty-weby.py --ucty 1         # jen egd01-dev/test/prod
  tools/lab-ucty-weby.py --kontrola       # jen ověří stav (správci, katalog, prázdní návštěvníci)
Potřebuje: HOME=~/.m365-osobni m365 přihlášený jako globální správce lab tenantu.
"""
import argparse
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lab_ucty_lib as L  # noqa: E402

PROSTREDI_NAZEV = {"dev": "DEV", "test": "TEST", "prod": "PROD"}


def katalogy() -> set[str]:
    return {c["AbsoluteUrl"].lower() for c in (L.m365("spo", "site", "appcatalog", "list") or [])}


def admini(url: str) -> dict[str, bool]:
    r = L.m365("spo", "site", "admin", "list", "--siteUrl", url, "--asAdmin") or []
    return {a["LoginName"].split("|")[-1].lower(): a.get("IsPrimaryAdmin", False) for a in r}


def jeden_web(alias: str, env: str, kat: set[str], kontrola: bool) -> str:
    url = L.web_url(alias, env)
    cislo = alias[len(L.PREFIX):]
    zprava = []
    existuje = isinstance(L.m365("spo", "site", "get", "--url", url, check=False), dict)
    if not existuje:
        if kontrola:
            return f"{url}: CHYBÍ"
        L.m365("spo", "site", "add", "--type", "CommunicationSite", "--url", url,
               "--title", f"Účastník {cislo} – {PROSTREDI_NAZEV[env]}", "--lcid", L.LCID,
               "--siteDesign", "Blank", "--withAppCatalog")
        zprava.append("založen")
        kat = katalogy()
    if url.lower() not in kat:
        if kontrola:
            zprava.append("CHYBÍ app catalog")
        else:
            L.m365("spo", "site", "appcatalog", "add", "--siteUrl", url, as_json=False)
            zprava.append("app catalog")
    ad = admini(url)
    ucastnik, spravce = L.upn(alias).lower(), L.SPRAVCE.lower()
    if not ad.get(ucastnik):
        if kontrola:
            zprava.append("účastník NENÍ primární správce")
        else:
            L.m365("spo", "site", "admin", "add", "--siteUrl", url, "--userName", L.upn(alias),
                   "--primary", "--asAdmin", as_json=False)
            zprava.append("účastník = primární správce")
    if spravce not in ad and not kontrola:
        L.m365("spo", "site", "admin", "add", "--siteUrl", url, "--userName", L.SPRAVCE, "--asAdmin", as_json=False)
        zprava.append("správce labu doplněn")
    web = L.m365("spo", "web", "get", "--url", url, "--withGroups")
    own, vis, mem = (web["AssociatedOwnerGroup"]["Id"], web["AssociatedVisitorGroup"]["Id"],
                     web["AssociatedMemberGroup"]["Id"])
    vlastnici = {m["LoginName"].split("|")[-1].lower()
                 for m in L.m365("spo", "group", "member", "list", "--webUrl", url, "--groupId", str(own))}
    if ucastnik not in vlastnici:
        if kontrola:
            zprava.append("účastník NENÍ ve Vlastnících")
        else:
            L.m365("spo", "group", "member", "add", "--webUrl", url, "--groupId", str(own),
                   "--userNames", L.upn(alias))
            zprava.append("účastník ve Vlastnících")
    cizi = []
    for gid in (vis, mem):
        for m in L.m365("spo", "group", "member", "list", "--webUrl", url, "--groupId", str(gid)):
            cizi.append(m["LoginName"])
    if cizi:
        zprava.append(f"POZOR návštěvníci/členové: {cizi}")
    return f"{url}: {', '.join(zprava) or 'OK'}"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--ucty", help="čárkami oddělená čísla nebo aliasy (výchozí všechny)")
    ap.add_argument("--prostredi", default="dev,test,prod", help="výchozí dev,test,prod")
    ap.add_argument("--kontrola", action="store_true", help="nic neměnit, jen ověřit")
    ap.add_argument("--paralelne", type=int, default=6,
                    help="počet souběžných webů (výchozí 6; SharePoint při víc throttluje)")
    a = ap.parse_args()

    L.assert_m365_tenant()
    kat = katalogy()
    prace = [(u, e) for u in L.vyber_ucty(a.ucty) for e in a.prostredi.split(",")]
    with ThreadPoolExecutor(max_workers=a.paralelne) as ex:
        for r in ex.map(lambda p: jeden_web(p[0], p[1], kat, a.kontrola), prace):
            print(r, flush=True)


if __name__ == "__main__":
    main()
