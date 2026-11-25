async ({ web }) => {
  const j = { Accept: 'application/json;odata=nometadata' }; const r = {};
  const u = await (await fetch(web + '/_api/web/currentuser?$select=LoginName,Title,IsSiteAdmin,Email', { headers: j })).json(); r.currentuser = u;
  const l = await (await fetch(web + "/_api/web/lists/getbytitle('OverEni-site-owner')?$select=Title,HasUniqueRoleAssignments", { headers: j })).json(); r.seznam = l;
  return r;
}
