"""Měření: schvalovatel s úrovní bez DeleteListItems (seznam PozadavkyCLI). Zapisuje položky v labu."""
import importlib.util, json, sys, time
spec = importlib.util.spec_from_file_location('o', '/Users/chocholous/Projects/egd-workshop/tools/prava-role-over.py'); o = importlib.util.module_from_spec(spec); spec.loader.exec_module(o)
W = 'https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava'; L = f"{W}/_api/web/lists/getbytitle('PozadavkyCLI')"
R = 'https://pavelchocholousgmail.sharepoint.com'
t = {u: o.token(u, R) for u in ('jana.svobodova', 'tomas.prochazka')}
def log(**k): k['cas'] = time.strftime('%H:%M:%S'); print(json.dumps(k, ensure_ascii=False)); sys.stdout.flush()
s, j = o.call(f'{L}/items', t['jana.svobodova'], 'POST', {'Title': 'Jana cizí pro mazání'}); jid = j['Id'] if s < 300 else None; log(krok='jana pridava', http=s, id=jid)
s, j = o.call(f'{L}/items', t['tomas.prochazka'], 'POST', {'Title': 'Tomas vlastní'}); tid = j['Id'] if s < 300 else None; log(krok='tomas pridava svou', http=s, id=tid)
s, j = o.call(f'{L}/EffectiveBasePermissions', t['tomas.prochazka']); low = int(j['Low']); log(krok='tomas bity', low=hex(low), CancelCheckout=bool(low & 0x100), DeleteListItems=bool(low & 0x8))
s, j = o.call(f'{L}/items?$select=Id,Title', t['tomas.prochazka']); log(krok='tomas vidi', http=s, polozky=[i['Title'] for i in j['value']] if s == 200 else j)
s, j = o.call(f'{L}/items({jid})', t['tomas.prochazka'], 'POST', {'Title': 'Jana cizí - upravil schvalovatel'}, {'IF-MATCH': '*', 'X-HTTP-Method': 'MERGE'}); log(krok='tomas schvaluje cizi (MERGE)', http=s, chyba=j if s >= 300 else None)
s, j = o.call(f'{L}/items({jid})', t['tomas.prochazka'], 'POST', None, {'IF-MATCH': '*', 'X-HTTP-Method': 'DELETE'}); log(krok='tomas maze cizi', http=s, chyba=j if s >= 300 else None)
s, j = o.call(f'{L}/items({tid})', t['tomas.prochazka'], 'POST', None, {'IF-MATCH': '*', 'X-HTTP-Method': 'DELETE'}); log(krok='tomas maze svou', http=s, chyba=j if s >= 300 else None)
s, j = o.call(f'{L}/items({jid})/recycle()', t['tomas.prochazka'], 'POST'); log(krok='tomas recycle cizi', http=s, chyba=j if s >= 300 else None)
s, j = o.call(f'{L}/items?$select=Id,Title', t['jana.svobodova']); log(krok='jana vidi', http=s, polozky=[(i['Title']) for i in j['value']] if s == 200 else j)
