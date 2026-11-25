async ({ web, SP, args }) => {
  const j = { Accept: 'application/json;odata=nometadata' }; const r = {};
  const digest = (await (await fetch(web + '/_api/contextinfo', { method: 'POST', headers: j })).json()).FormDigestValue;
  for (const [jm, b64] of Object.entries(args.b64)) {
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const x = await fetch(`${web}/_api/web/GetFolderByServerRelativeUrl('${new URL(web).pathname}/Shared Documents')/Files/Add(url='${jm}',overwrite=true)`, { method: 'POST', headers: { ...j, 'X-RequestDigest': digest }, body: bin });
    r[jm] = x.status;
  }
  return r;
}
