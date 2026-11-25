"""Smí Člen webu (Úpravy) bez vlastnictví založit úroveň oprávnění a přerušit dědičnost? + High/Low bity."""
import importlib.util, json, time
spec = importlib.util.spec_from_file_location('o', '/Users/chocholous/Projects/egd-workshop/tools/prava-role-over.py'); o = importlib.util.module_from_spec(spec); spec.loader.exec_module(o)
W = 'https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava'; R = 'https://pavelchocholousgmail.sharepoint.com'
def log(**k): k['cas'] = time.strftime('%H:%M:%S'); print(json.dumps(k, ensure_ascii=False), flush=True)
tj = o.token('jana.svobodova', R)
s, j = o.call(f'{W}/_api/web/roledefinitions', tj, 'POST', {'Name': 'Test clen uroven', 'BasePermissions': {'Low': '1', 'High': '0'}}); log(krok='clen POST roledefinitions', http=s, odpoved=j if s >= 300 else 'vytvořeno')
s, j = o.call(f"{W}/_api/web/lists/getbytitle('TestDedicnost')/breakroleinheritance(copyRoleAssignments=false,clearSubscopes=true)", tj, 'POST'); log(krok='clen breakroleinheritance', http=s, odpoved=j if s >= 300 else 'přerušeno')
s, j = o.call(f'{W}/_api/web/sitegroups', tj, 'POST', {'Title': 'Test clen skupina'}); log(krok='clen POST sitegroups', http=s, odpoved=j if s >= 300 else 'vytvořeno')
s, j = o.call(f'{W}/_api/web/EffectiveBasePermissions', tj); log(krok='clen web bity', low=hex(int(j['Low'])), high=hex(int(j['High'])), ManagePermissions=bool(int(j['High']) & (1 << (25 - 32))) if False else None)
for u in ('eva.vesela', 'karolina.mala', 'jakub.kucera'):
    t = o.token(u, R); s, j = o.call(f"{W}/_api/web/lists/getbytitle('Pozadavky')/EffectiveBasePermissions", t)
    log(krok=f'{u} seznam Pozadavky bity', low=hex(int(j['Low'])), high=hex(int(j['High'])))
