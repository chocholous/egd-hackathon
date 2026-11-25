async ({ web, SP, args }) => {
  const j = { Accept: 'application/json;odata=nometadata' }; const jj = { ...j, 'Content-Type': 'application/json;odata=nometadata' }; const r = {};
  const digest = (await (await fetch(web + '/_api/contextinfo', { method: 'POST', headers: j })).json()).FormDigestValue; const H = { ...jj, 'X-RequestDigest': digest };
  const post = async (u, body, h = H) => { const x = await fetch(u, { method: 'POST', headers: h, body: body === undefined ? undefined : JSON.stringify(body) }); const t = await x.text(); let b; try { b = JSON.parse(t); } catch { b = t.slice(0, 200); } return { s: x.status, b }; };
  const get = async (u) => { const x = await fetch(u, { headers: j }); const t = await x.text(); let b; try { b = JSON.parse(t); } catch { b = t.slice(0, 200); } return { s: x.status, b }; };
  const L = args.seznam;
  // 3a seznam + sloupec + položka
  const sez = await post(`${web}/_api/web/lists`, { Title: L, BaseTemplate: 100, Description: 'Měření site ownera' });
  r.seznam_vytvoreni = { s: sez.s, id: sez.b.Id, chyba: sez.s >= 300 ? sez.b : undefined };
  const lid = sez.b.Id; const lb = `${web}/_api/web/lists(guid'${lid}')`;
  r.sloupec = (await post(`${lb}/fields`, { Title: 'Hodnoceni', FieldTypeKind: 9 })).s;
  const pol = await post(`${lb}/items`, { Title: 'prvni polozka' }); r.polozka = { s: pol.s, id: pol.b.Id };
  // 3b stránka
  const st = await post(`${web}/_api/sitepages/pages`, { Title: args.stranka, PageLayoutType: 'Article' });
  r.stranka_vytvoreni = { s: st.s, id: st.b.Id, chyba: st.s >= 300 ? st.b : undefined };
  if (st.b.Id) { const pub = await post(`${web}/_api/sitepages/pages(${st.b.Id})/publish`); r.stranka_publikace = { s: pub.s }; r.stranka_cteni = (await get(`${web}/_api/sitepages/pages(${st.b.Id})?$select=Title,AbsoluteUrl`)).b; }
  // 4 role na seznamu
  const vis = (await get(`${web}/_api/web/associatedvisitorgroup?$select=Id,Title`)).b;
  const prava = async () => { const x = await get(`${lb}?$select=HasUniqueRoleAssignments`); const ra = await get(`${lb}/roleassignments?$expand=Member,RoleDefinitionBindings&$select=Member/Title,RoleDefinitionBindings/Name`); return { unikatni: x.b.HasUniqueRoleAssignments, prirazeni: (ra.b.value || []).map(a => `${a.Member.Title}: ${a.RoleDefinitionBindings.map(b => b.Name).join(',')}`) }; };
  r.role_pred = await prava();
  r.rozbiti_dedicnosti = (await post(`${lb}/breakroleinheritance(copyRoleAssignments=true,clearSubscopes=true)`)).s;
  const rd = (await get(`${web}/_api/web/roledefinitions?$select=Id,Name`)).b.value; const dr = (n) => rd.find(x => x.Name === n)?.Id;
  r.role_definice = rd.map(x => x.Name);
  r.pridani_skupiny_navstevniku_contribute = (await post(`${lb}/roleassignments/addroleassignment(principalid=${vis.Id},roledefid=${dr('Contribute')})`)).s;
  r.role_po_pridani = await prava();
  r.odebrani_skupiny = (await post(`${lb}/roleassignments/removeroleassignment(principalid=${vis.Id},roledefid=${dr('Contribute')})`)).s;
  r.obnoveni_dedicnosti = (await post(`${lb}/resetroleinheritance`)).s;
  r.role_po_obnoveni = await prava();
  return r;
}
