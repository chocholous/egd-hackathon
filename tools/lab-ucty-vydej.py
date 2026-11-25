#!/usr/bin/env -S "${HOME}/Projects/egd-workshop/.venv/bin/python"
"""Vyrobí výdejní stránku účtů (HTML k publikaci jako claude.ai artefakt) a data výdejních kódů.

Stránka je veřejná pro každého s odkazem, i bez přihlášení do claude.ai. Heslo každého účtu je
v ní zašifrované (AES-GCM 256, klíč z PBKDF2-SHA256 600 000× z výdejního kódu účtu). Kód zná jen
správce: je v lab/ucastnici.secrets.json a po publikaci v db artefaktu (čte jen vlastník).

Výstupy (vše v lab/vydej/, gitignored *.secrets*):
  vydej-uctu.html            stránka k publikaci (jen šifrovaná hesla)
  db-kody.secrets/egdNN.json dokumenty pro ArtifactData batch do kolekce „kody“

Použití:
  tools/lab-ucty-vydej.py                       # nové kódy jen tam, kde chybí
  tools/lab-ucty-vydej.py --stav-z precteno.html  # převezme „vydáno komu“ z publikované verze
Potřebuje .venv s balíčkem cryptography (python3.13 -m venv .venv && .venv/bin/pip install cryptography).
"""
import argparse
import base64
import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lab_ucty_lib as L  # noqa: E402
from cryptography.hazmat.primitives import hashes  # noqa: E402
from cryptography.hazmat.primitives.ciphers.aead import AESGCM  # noqa: E402
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC  # noqa: E402

ITERACE = 600_000  # OWASP 2023 doporučení pro PBKDF2-SHA256; stránka musí použít stejné číslo
OUT = L.ROOT / "lab" / "vydej"
TEMPLATE = L.ROOT / "lab" / "vydej" / "vydej-uctu.template.html"
# Obal, kterým Artifact tool stránku při publikaci obalí; stránka ho musí při vlastní publikaci
# zopakovat. Přesné znění: Artifact read publikované verze → uložit do SKELETON (bez obsahu stránky).
SKELETON = L.ROOT / "lab" / "vydej" / "skeleton-head.html"
SKELETON_VYCHOZI = ('<!doctype html><html><head><meta charset=utf8><meta name=viewport '
                    'content="width=device-width,initial-scale=1,viewport-fit=cover"><style></style></head><body>')


def norm_kod(k: str) -> str:
    """Stejná normalizace jako ve stránce: velká písmena, bez pomlček/mezer, O→0, I/L→1."""
    k = re.sub(r"[\s-]", "", k.upper())
    return k.replace("O", "0").replace("I", "1").replace("L", "1")


def b64(b: bytes) -> str:
    return base64.b64encode(b).decode()


def zasifruj(alias: str, kod: str, heslo: str) -> dict:
    sul, iv = os.urandom(16), os.urandom(12)
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=sul, iterations=ITERACE)
    klic = kdf.derive(norm_kod(kod).encode())
    ct = AESGCM(klic).encrypt(iv, json.dumps({"heslo": heslo}).encode(), alias.encode())
    return {"s": b64(sul), "i": b64(iv), "c": b64(ct)}


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--stav-z", help="HTML publikované verze, ze které převzít, komu je co vydáno")
    a = ap.parse_args()

    sec = L.load_secrets()
    kody = sec.setdefault("kody", {})
    vydano = {}
    if a.stav_z:
        m = re.search(r'<script type="application/json" id="stav">(.*?)</script>', Path(a.stav_z).read_text(), re.S)
        if not m:
            raise SystemExit("ve zdrojovém HTML chybí <script id=stav>")
        for u in json.loads(m.group(1))["ucty"]:
            if u.get("vydano"):
                vydano[u["alias"]] = u["vydano"]
    ucty = []
    (OUT / "db-kody.secrets").mkdir(parents=True, exist_ok=True, mode=0o700)
    for alias in L.ucty():
        p = L.upn(alias)
        if p not in sec.get("hesla", {}):
            raise SystemExit(f"chybí heslo pro {p}")
        kody.setdefault(alias, L.vydejni_kod())
        ucty.append({
            "alias": alias, "cislo": alias[len(L.PREFIX):], "upn": p,
            "weby": {e: L.web_url(alias, e) for e in L.PROSTREDI},
            "sifra": zasifruj(alias, kody[alias], sec["hesla"][p]),
            "vydano": vydano.get(alias),
        })
        f = OUT / "db-kody.secrets" / f"{alias}.json"
        fd = os.open(f, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, "w") as fh:
            json.dump({"kod": kody[alias], "upn": p}, fh)
    L.save_secrets(sec)
    stav = {"iterace": ITERACE, "sp": L.SP_HOST, "ucty": ucty}
    js = json.dumps(stav, ensure_ascii=False).replace("</", "<\\/")
    tpl = TEMPLATE.read_text()
    top = tpl[:tpl.index('<style id="css">')]
    sk = SKELETON.read_text() if SKELETON.exists() else SKELETON_VYCHOZI
    esc = lambda s: json.dumps(s, ensure_ascii=False).replace("</", "<\\/")
    html = (tpl.replace("__STAV__", js).replace("__SKELETON_HEAD__", esc(sk)).replace("__TOP__", esc(top)))
    (OUT / "vydej-uctu.html").write_text(html)
    print("stránka:", OUT / "vydej-uctu.html")
    print("kódy pro db:", OUT / "db-kody.secrets")


if __name__ == "__main__":
    main()
