// mock: Table Storage (ETag/If-Match/412, Insert 409), MI token endpoint, AOAI chat (zpoždění, 18 tokenů)
import http from 'node:http';
const rows = new Map(); let ver = 0;
http.createServer(async (req, res) => {
  let b = ''; for await (const c of req) b += c;
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/mi') { res.end(JSON.stringify({ access_token: 't', expires_on: String(Math.floor(Date.now() / 1000) + 3600) })); return; }
  if (u.pathname === '/openai/v1/chat/completions') { await new Promise(r => setTimeout(r, 300 + Math.random() * 300));
    res.end(JSON.stringify({ model: 'mock', choices: [{ message: { content: 'Ahoj' } }], usage: { prompt_tokens: 15, completion_tokens: 3, total_tokens: 18 } })); return; }
  const m = decodeURIComponent(u.pathname).match(/^\/(\w+)\(PartitionKey='([^']+)',RowKey='([^']+)'\)$/);
  await new Promise(r => setTimeout(r, Math.random() * 30));
  if (m) { const k = m[2] + '|' + m[3];
    if (req.method === 'GET') { const e = rows.get(k); if (!e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { etag: e.etag }); res.end(JSON.stringify(e.d)); return; }
    if (req.method === 'PUT') { const e = rows.get(k); if (!e || e.etag !== req.headers['if-match']) { res.writeHead(412); res.end('precondition'); return; }
      rows.set(k, { d: JSON.parse(b), etag: `W/"${++ver}"` }); res.writeHead(204); res.end(); return; } }
  if (req.method === 'POST' && /^\/\w+$/.test(u.pathname)) { const d = JSON.parse(b); const k = d.PartitionKey + '|' + d.RowKey;
    if (rows.has(k)) { res.writeHead(409); res.end('exists'); return; } rows.set(k, { d, etag: `W/"${++ver}"` }); res.writeHead(204); res.end(); return; }
  res.writeHead(400); res.end('?');
}).listen(9911);
