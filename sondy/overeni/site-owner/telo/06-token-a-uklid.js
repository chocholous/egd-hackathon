async ({ web, SP, args }) => {
  const j = { Accept: 'application/json;odata=nometadata' }; const r = {};
  const digest = (await (await fetch(web + '/_api/contextinfo', { method: 'POST', headers: j })).json()).FormDigestValue; const H = { ...j, 'Content-Type': 'application/json;odata=nometadata', 'X-RequestDigest': digest };
  // pokus o token pro API bez schváleného souhlasu (stejné volání, jaké dělá AadHttpClient v SPFx)
  for (const [n, res] of Object.entries(args.zdroje)) {
    const x = await fetch(`${SP}/_api/SP.OAuth.Token/Acquire`, { method: 'POST', headers: H, body: JSON.stringify({ resource: res }) });
    const t = await x.text(); r['token_' + n] = { s: x.status, telo: t.slice(0, 350) };
  }
  // úklid: Retract nasazených balíčků (nemaže)
  const apps = (await (await fetch(`${web}/_api/web/sitecollectionappcatalog/AvailableApps`, { headers: j })).json()).value || [];
  r.katalog_pred = apps.map(a => `${a.Title}:${a.Deployed}`);
  if (args.retract) for (const a of apps) { const x = await fetch(`${web}/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${a.ID}')/Retract`, { method: 'POST', headers: H }); r['retract_' + a.Title] = x.status; }
  const po = (await (await fetch(`${web}/_api/web/sitecollectionappcatalog/AvailableApps`, { headers: j })).json()).value || [];
  r.katalog_po = po.map(a => `${a.Title}:${a.Deployed}`);
  return r;
}
