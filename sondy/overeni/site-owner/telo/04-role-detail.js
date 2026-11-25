async ({ web, SP, args }) => {
  const j = { Accept: 'application/json;odata=nometadata' }; const jj = { ...j, 'Content-Type': 'application/json;odata=nometadata' }; const r = {};
  const digest = (await (await fetch(web + '/_api/contextinfo', { method: 'POST', headers: j })).json()).FormDigestValue; const H = { ...jj, 'X-RequestDigest': digest };
  const post = async (u) => (await fetch(u, { method: 'POST', headers: H })).status;
  const get = async (u) => (await (await fetch(u, { headers: j })).json());
  const lb = `${web}/_api/web/lists/getbytitle('${args.seznam}')`;
  const vis = (await get(`${web}/_api/web/associatedvisitorgroup?$select=Id`)).Id;
  const prava = async (n) => { const x = await get(`${lb}?$select=HasUniqueRoleAssignments`); const ra = await get(`${lb}/roleassignments?$expand=Member,RoleDefinitionBindings`); await new Promise(z => setTimeout(z, 500)); return { krok: n, unikatni: x.HasUniqueRoleAssignments, prirazeni: (ra.value || []).map(a => `${a.Member.Title}: ${a.RoleDefinitionBindings.map(b => b.Name).join(',')}`) }; };
  const web_ra = await get(`${web}/_api/web/roleassignments?$expand=Member,RoleDefinitionBindings`);
  r.web_role = (web_ra.value || []).map(a => `${a.Member.Title}: ${a.RoleDefinitionBindings.map(b => b.Name).join(',')}`);
  r.v0 = await prava('stav na začátku');
  r.break = await post(`${lb}/breakroleinheritance(copyRoleAssignments=false,clearSubscopes=true)`); r.v1 = await prava('po breakroleinheritance(copy=false)');
  r.add_read = await post(`${lb}/roleassignments/addroleassignment(principalid=${vis},roledefid=1073741826)`); r.v2 = await prava('po přidání skupiny Návštěvníci jako Read');
  r.reset = await post(`${lb}/resetroleinheritance`); r.v3 = await prava('po resetroleinheritance');
  return r;
}
