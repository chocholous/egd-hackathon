async ({ web, SP, args }) => {
  const j = { Accept: 'application/json;odata=nometadata' }; const jm = args.jmeno; const r = {};
  const digest = (await (await fetch(web + '/_api/contextinfo', { method: 'POST', headers: j })).json()).FormDigestValue;
  const bin = Uint8Array.from(atob(args.b64[jm]), c => c.charCodeAt(0));
  const add = await fetch(`${web}/_api/web/sitecollectionappcatalog/Add(overwrite=true,url='${jm}')`, { method: 'POST', headers: { ...j, 'X-RequestDigest': digest }, body: bin });
  r.nahrani = { status: add.status, telo: add.ok ? 'ok' : (await add.text()).slice(0, 300) };
  const apps = (await (await fetch(`${web}/_api/web/sitecollectionappcatalog/AvailableApps`, { headers: j })).json()).value || [];
  const a = apps.find(x => x.Title && x.Title.toLowerCase().includes(args.hledej));
  if (a) {
    const dep = await fetch(`${web}/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${a.ID}')/Deploy`, { method: 'POST', headers: { ...j, 'Content-Type': 'application/json;odata=nometadata', 'X-RequestDigest': digest }, body: JSON.stringify({ skipFeatureDeployment: false }) });
    r.nasazeni = { status: dep.status, telo: dep.ok ? 'ok' : (await dep.text()).slice(0, 300) };
    r.aplikace = await (await fetch(`${web}/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${a.ID}')`, { headers: j })).json();
  }
  // co vidí site owner o žádostech o API (tenantní endpointy)
  const t = async (u) => { try { const x = await fetch(u, { headers: j }); return { s: x.status, b: (await x.text()).slice(0, 250) }; } catch (e) { return { chyba: String(e) }; } };
  r.permissionrequests_na_webu = await t(`${web}/_api/web/GetStorageEntity?key=x`);
  r.tenant_admin_api = await t(`${SP.replace('.sharepoint.com', '-admin.sharepoint.com')}/_api/SPOWebAppServicePrincipal/PermissionRequests`);
  r.tenant_admin_stranka = await t(`${SP.replace('.sharepoint.com', '-admin.sharepoint.com')}/_layouts/15/online/AdminHome.aspx`);
  return r;
}
