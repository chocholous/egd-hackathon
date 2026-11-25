Gateway https://ca-egd-llm-gateway.purplebeach-ef4cada1.swedencentral.azurecontainerapps.io, 2026-11-22T18:58:48Z, volající: pavel.chocholous@gmail.com

| Případ | HTTP + čas [s] | Tělo (zkráceno) |
|---|---|---|
| healthz (bez přihlášení) | 200 0.163982 | `{"ok":true}` |
| whoami bez tokenu | 401 0.156064 | `` |
| whoami s tokenem pro Graph (jiné API) | 401 0.410785 | `` |
| whoami se správným tokenem | 200 0.273356 | `{"who":{"oid":"4a9b2f9a-24ff-4092-800b-e71f91b307b0","upn":"pavel.chocholous@gmail.com","clientAppId":"04b07795-8ddb-461a-bbee-02f9e1bf7b46","scopes":["Gateway.` |
| chat s neznámým X-App-Id (neexistuje-1795373889) | 403 0.205840 | `{"error":"Neznámá appka neexistuje-1795373889"}` |
| neznámý endpoint | 404 0.167754 | `{"error":"Neznámý endpoint"}` |
| chat X-App-Id tiny, pokus 1 | 429 0.240192 | `{"error":"Denní kvóta tokenů vyčerpána (69/60)"}` |
| chat X-App-Id tiny, pokus 2 | 429 0.299702 | `{"error":"Denní kvóta tokenů vyčerpána (69/60)"}` |
| chat X-App-Id tiny, pokus 3 | 429 0.234068 | `{"error":"Denní kvóta tokenů vyčerpána (69/60)"}` |
| kvota X-App-Id tiny | 200 0.229856 | `{"den":"2026-11-22","appKey":"tiny","spotreba":{"tokens":69,"calls":1,"costUsd":0.00008880000000000002,"pages":0},"limitTokenuZaDen":60}` |

| CORS preflight (OPTIONS /api/chat) | HTTP | access-control-allow-origin |
|---|---|---|
| Origin https://pavelchocholousgmail.sharepoint.com | 200 | access-control-allow-origin: https://pavelchocholousgmail.sharepoint.com |
| Origin https://example.com | 401 | (chybí) |
