"""Varianta C: schvalovatel s vestavěnou úrovní Návrh na PozadavkyCLI (ReadSecurity=2). Zapisuje v labu."""
import importlib.util, json, time
spec = importlib.util.spec_from_file_location('o', '/Users/chocholous/Projects/egd-workshop/tools/prava-role-over.py'); o = importlib.util.module_from_spec(spec); spec.loader.exec_module(o)
W = 'https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava'; L = f"{W}/_api/web/lists/getbytitle('PozadavkyCLI')"
def log(**k): k['cas'] = time.strftime('%H:%M:%S'); print(json.dumps(k, ensure_ascii=False), flush=True)
t = o.token('lucie.dvorakova', 'https://pavelchocholousgmail.sharepoint.com')
s, j = o.call(f'{L}/EffectiveBasePermissions', t); low = int(j['Low']); log(krok='lucie Návrh bity', low=hex(low), CancelCheckout=bool(low & 0x100), ApproveItems=bool(low & 0x10), ManageLists=bool(low & 0x800))
s, j = o.call(f'{L}/items?$select=Id,Title,AuthorId', t); log(krok='lucie vidi', http=s, polozky=[i['Title'] for i in j['value']] if s == 200 else j)
s, j = o.call(f'{L}/items(1)', t, 'POST', {'Title': 'Jana cizí - upravila Návrh'}, {'IF-MATCH': '*', 'X-HTTP-Method': 'MERGE'}); log(krok='lucie upravi cizi', http=s, chyba=j if s >= 300 else None)
