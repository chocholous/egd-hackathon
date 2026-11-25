async ({ web, SP, args }) => {
  const j = { Accept: 'application/json;odata=nometadata' }; const jm = args.jmeno; const r = {};
  const t0 = performance.now();
  const digest = (await (await fetch(web + '/_api/contextinfo', { method: 'POST', headers: j })).json()).FormDigestValue;
  const bin = Uint8Array.from(atob(args.b64[jm]), c => c.charCodeAt(0));
  const add = await fetch(`${web}/_api/web/sitecollectionappcatalog/Add(overwrite=true,url='${jm}')`, { method: 'POST', headers: { ...j, 'X-RequestDigest': digest }, body: bin });
  r.nahrani = { status: add.status, ms: Math.round(performance.now() - t0), telo: add.ok ? 'ok' : (await add.text()).slice(0, 300) };
  const apps = (await (await fetch(`${web}/_api/web/sitecollectionappcatalog/AvailableApps`, { headers: j })).json()).value || [];
  r.aplikace_v_katalogu = apps.map(a => ({ id: a.ID, titulek: a.Title, nasazena: a.Deployed, verze: a.AppCatalogVersion, skipFeature: a.SkipDeploymentFeature }));
  const a = apps.find(x => x.Title && x.Title.toLowerCase().includes(args.hledej));
  if (a) {
    const t1 = performance.now();
    const dep = await fetch(`${web}/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${a.ID}')/Deploy`, { method: 'POST', headers: { ...j, 'Content-Type': 'application/json;odata=nometadata', 'X-RequestDigest': digest }, body: JSON.stringify({ skipFeatureDeployment: false }) });
    r.nasazeni = { status: dep.status, ms: Math.round(performance.now() - t1), telo: dep.ok ? 'ok' : (await dep.text()).slice(0, 300) };
    const po = await (await fetch(`${web}/_api/web/sitecollectionappcatalog/AvailableApps/GetById('${a.ID}')`, { headers: j })).json();
    r.po_nasazeni = { nasazena: po.Deployed, verze: po.InstalledVersion || po.AppCatalogVersion, id: a.ID };
  }
  return r;
}
