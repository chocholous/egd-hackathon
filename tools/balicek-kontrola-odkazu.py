#!/usr/bin/env python3
"""kontrola-odkazu.py - najde v rozbalenem/nainstalovanem balicku skillu odkazy, ktere v nem neexistuji.

Pouziti: kontrola-odkazu.py <slozka-se-skilly> [--json]
Kontroluje v kazdem *.md:
  - markdown odkazy [text](cesta) bez http(s)/mailto/#  -> cil musi existovat relativne k souboru
  - cesty v backtickach, ktere vypadaji jako soubor v repu (sondy/, tools/, test-dukazy, TEST*.md, ../)
    -> hlasi se jako "mimo balicek" (agent je v balicku nenajde)
Vypis: skill, soubor:radek, druh, cil. Na konci souhrn po skillech. Nic nemeni.
"""
import json, re, sys
from pathlib import Path

if len(sys.argv) < 2 or sys.argv[1] in ('-h', '--help'):
    print(__doc__); sys.exit(2)
root = Path(sys.argv[1]).resolve()
LINK = re.compile(r'\[[^\]]*\]\(([^)\s]+)\)')
TICK = re.compile(r'`([^`\s]+)`')
REPOISH = re.compile(r'^(\.\./|sondy/|tools/|audit/|lab/|prehled/|zdroje/|skripty/)|test-dukazy|(^|/)TEST(-copilot)?\.md$')
out = []
for md in sorted(root.rglob('*.md')):
    if 'node_modules' in md.parts:
        continue
    skill = md.relative_to(root).parts[0]
    for i, line in enumerate(md.read_text(encoding='utf-8', errors='replace').splitlines(), 1):
        for m in LINK.finditer(line):
            t = m.group(1).split('#')[0]
            if not t or re.match(r'^(https?:|mailto:)', t):
                continue
            cil = (md.parent / t).resolve()
            try:
                uvnitr = cil.is_relative_to(root / skill)
            except AttributeError:
                uvnitr = str(cil).startswith(str(root / skill))
            if not cil.exists():
                out.append((skill, f'{md.relative_to(root)}:{i}', 'odkaz-neexistuje', t))
            elif not uvnitr:
                out.append((skill, f'{md.relative_to(root)}:{i}', 'odkaz-mimo-skill', t))
        for m in TICK.finditer(line):
            t = m.group(1).rstrip('.,;:')
            if REPOISH.search(t) and not (md.parent / t).exists() and not (root / skill / t).exists():
                out.append((skill, f'{md.relative_to(root)}:{i}', 'cesta-mimo-balicek', t))
if '--json' in sys.argv:
    print(json.dumps(out, ensure_ascii=False, indent=1))
else:
    for r in out:
        print('\t'.join(r))
souhrn = {}
for s, _, d, _ in out:
    souhrn.setdefault(s, {}).setdefault(d, 0)
    souhrn[s][d] += 1
print('\nSOUHRN', file=sys.stderr)
for s in sorted({p.name for p in root.iterdir() if p.is_dir()}):
    print(f'  {s}: {souhrn.get(s, {}) or "OK"}', file=sys.stderr)
