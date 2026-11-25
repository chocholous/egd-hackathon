#!/usr/bin/env python3
"""Kontrola rolí appky pod skutečnými lab účty (jen čtení).

Pro každý účet získá token (tools/data-prava-token.py, ROPC) a změří:
  - EffectiveBasePermissions seznamu a z nich roli tak, jak ji počítá appka
    (CancelCheckout 0x100 = schvalovatel, AddListItems 0x2 = smí přidat, ManageLists 0x800 = správce),
  - kolik položek seznamu vidí a čí (Author),
  - zda otevře stránku appky (GET položky v knihovně Stránky webu),
  - volitelně (--cizi ID) zda upraví cizí položku (MERGE na pole Komentar; ZAPISUJE).
Výstup: tabulka na stdout, s --jsonl i řádky JSON do souboru.

Použití:
  prava-role-over.py --web https://<tenant>.sharepoint.com/sites/<web> [--seznam Pozadavky]
                     [--stranka evidence.aspx] [--jsonl vystup.jsonl] [--cizi ID] ucet [ucet ...]
  ucet = alias nebo UPN s heslem v lab.secrets.json (viz data-prava-token.py --help)
"""
import argparse, json, os, subprocess, sys, time, urllib.error, urllib.parse, urllib.request

TOKEN = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data-prava-token.py')
BITY = {'CancelCheckout': 0x100, 'AddListItems': 0x2, 'ManageLists': 0x800, 'ApproveItems': 0x10,
        'EditListItems': 0x4, 'DeleteListItems': 0x8, 'ViewListItems': 0x1}


def token(ucet, resource):
    r = subprocess.run([sys.executable, TOKEN, ucet, '--resource', resource], capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(f'token pro {ucet} selhal: {r.stderr.strip()[:300]}')
    return r.stdout.strip()


def call(url, tok, method='GET', body=None, extra=None):
    h = {'Authorization': f'Bearer {tok}', 'Accept': 'application/json;odata=nometadata'}
    if extra:
        h.update(extra)
    data = json.dumps(body).encode() if body is not None else None
    if data:
        h['Content-Type'] = 'application/json;odata=nometadata'
    url = urllib.parse.quote(url, safe=":/?&=$'(),@%*")
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            t = r.read().decode()
            return r.status, (json.loads(t) if t else None)
    except urllib.error.HTTPError as e:
        t = e.read().decode(errors='replace')
        try:
            msg = json.loads(t).get('odata.error', {}).get('message', {}).get('value', t)
        except Exception:
            msg = t
        return e.code, str(msg)[:160]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--web', required=True)
    ap.add_argument('--seznam', default='Pozadavky')
    ap.add_argument('--stranka', default='evidence.aspx')
    ap.add_argument('--jsonl')
    ap.add_argument('--cizi', type=int, help='ID položky, kterou se každý účet pokusí upravit (zapisuje!)')
    ap.add_argument('ucty', nargs='+')
    a = ap.parse_args()
    res = '/'.join(a.web.split('/')[:3])
    lst = f"{a.web}/_api/web/lists/getbytitle('{urllib.parse.quote(a.seznam)}')"
    out = open(a.jsonl, 'a') if a.jsonl else None
    print(f"{'ucet':18} {'stranka':8} {'role v appce':14} {'bity':40} {'polozek':7} autori")
    for u in a.ucty:
        tok = token(u, res)
        st_page, _ = call(f"{a.web}/_api/web/GetFileByServerRelativeUrl('{urllib.parse.urlparse(a.web).path}/SitePages/{a.stranka}')?$select=Name", tok)
        st, perm = call(f'{lst}/EffectiveBasePermissions', tok)
        row = {'ucet': u, 'cas': time.strftime('%Y-%m-%dT%H:%M:%S'), 'stranka_http': st_page, 'perm_http': st}
        if st == 200:
            low = int(perm['Low'])
            bity = [k for k, v in BITY.items() if low & v]
            role = 'Správce' if low & 0x800 else 'Schvalovatel' if low & 0x100 else 'Zadavatel' if low & 0x2 else 'Jen čtení'
            row.update(low=hex(low), bity=bity, role=role)
            si, items = call(f'{lst}/items?$select=Id,Title,Author/Title&$expand=Author&$top=200', tok)
            if si == 200:
                row['polozky'] = [(i['Id'], i['Author']['Title']) for i in items['value']]
            else:
                row['polozky_http'] = si
        else:
            row.update(role='-', chyba=perm)
        if a.cizi:
            sc, msg = call(f'{lst}/items({a.cizi})', tok, 'POST', {'Komentar': f'zapis {u} {row["cas"]}'},
                           {'IF-MATCH': '*', 'X-HTTP-Method': 'MERGE'})
            row['uprava_cizi_http'] = sc
            if sc >= 300:
                row['uprava_cizi_chyba'] = msg
        autori = sorted({p[1] for p in row.get('polozky', [])})
        print(f"{u:18} {row['stranka_http']!s:8} {row['role']:14} {','.join(row.get('bity', []))[:40]:40} "
              f"{len(row.get('polozky', [])) if 'polozky' in row else row.get('polozky_http', row.get('perm_http'))!s:7} "
              f"{', '.join(autori)}" + (f"  uprava cizi={row['uprava_cizi_http']}" if a.cizi else ''))
        if out:
            out.write(json.dumps(row, ensure_ascii=False) + '\n')


if __name__ == '__main__':
    main()
