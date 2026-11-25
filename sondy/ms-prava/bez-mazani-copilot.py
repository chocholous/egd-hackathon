"""Použití: bez-mazani-copilot.py [seznam] [zadavatel] [schvalovatel] (UPN bez domény). Měření: schvalovatel s úrovní bez DeleteListItems (seznam z argumentu, výchozí PozadavkyCopilot). Zapisuje položky v labu."""
import importlib.util, json, sys, time
spec = importlib.util.spec_from_file_location('o', '/Users/chocholous/Projects/egd-workshop/tools/prava-role-over.py'); o = importlib.util.module_from_spec(spec); spec.loader.exec_module(o)
W = 'https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava'; L = f"{W}/_api/web/lists/getbytitle('{sys.argv[1] if len(sys.argv) > 1 else "PozadavkyCopilot"}')"
R = 'https://pavelchocholousgmail.sharepoint.com'
ZAD = sys.argv[2] if len(sys.argv) > 2 else 'jana.svobodova'; SCHV = sys.argv[3] if len(sys.argv) > 3 else 'tomas.prochazka'
t = {u: o.token(u, R) for u in (ZAD, SCHV)}
def log(**k): k['cas'] = time.strftime('%H:%M:%S'); print(json.dumps(k, ensure_ascii=False)); sys.stdout.flush()
s, j = o.call(f'{L}/items', t[ZAD], 'POST', {'Title': 'Jana cizí pro mazání'}); jid = j['Id'] if s < 300 else None; log(krok='jana pridava', http=s, id=jid)
s, j = o.call(f'{L}/items', t[SCHV], 'POST', {'Title': 'Tomas vlastní'}); tid = j['Id'] if s < 300 else None; log(krok='tomas pridava svou', http=s, id=tid)
s, j = o.call(f'{L}/EffectiveBasePermissions', t[SCHV]); low = int(j['Low']); log(krok='tomas bity', low=hex(low), CancelCheckout=bool(low & 0x100), DeleteListItems=bool(low & 0x8))
s, j = o.call(f'{L}/items?$select=Id,Title', t[SCHV]); log(krok='tomas vidi', http=s, polozky=[i['Title'] for i in j['value']] if s == 200 else j)
s, j = o.call(f'{L}/items({jid})', t[SCHV], 'POST', {'Title': 'Jana cizí - upravil schvalovatel'}, {'IF-MATCH': '*', 'X-HTTP-Method': 'MERGE'}); log(krok='tomas schvaluje cizi (MERGE)', http=s, chyba=j if s >= 300 else None)
s, j = o.call(f'{L}/items({jid})', t[SCHV], 'POST', None, {'IF-MATCH': '*', 'X-HTTP-Method': 'DELETE'}); log(krok='tomas maze cizi', http=s, chyba=j if s >= 300 else None)
s, j = o.call(f'{L}/items({tid})', t[SCHV], 'POST', None, {'IF-MATCH': '*', 'X-HTTP-Method': 'DELETE'}); log(krok='tomas maze svou', http=s, chyba=j if s >= 300 else None)
s, j = o.call(f'{L}/items({jid})/recycle()', t[SCHV], 'POST'); log(krok='tomas recycle cizi', http=s, chyba=j if s >= 300 else None)
s, j = o.call(f'{L}/items?$select=Id,Title', t[ZAD]); log(krok='jana vidi', http=s, polozky=[(i['Title']) for i in j['value']] if s == 200 else j)
