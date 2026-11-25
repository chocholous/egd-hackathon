# OBO na Container App: Graph jménem uživatele s oprávněním, které SPFx nemá

Sonda `ca-obo`, 24. 11. 2026, egd lab (tenant `pavelchocholousgmail.onmicrosoft.com`). Nadřazené: [../../10-container-app.md](../../10-container-app.md).
Značky: ✅ změřeno v labu (odkaz na surový důkaz v [obo/dukazy/](obo/dukazy/)) · 📘 dokumentace · ❓ neověřeno · ⛔ v labu neověřitelné.

## Výsledek

| Co | Stav | Důkaz |
|---|---|---|
| SPFx web part → `AadHttpClient` → Container App → OBO → Graph `/me/messages`, v prohlížeči pod lab profilem Tomáše | ✅ 200, 486 ms v web partu (OBO výměna 285 ms, Graph 104 ms), `azp` = SharePoint Online Web Client Extensibility (`08e18876-…`) | [spfx/tomas.prochazka.json](obo/dukazy/spfx/tomas.prochazka.json), [screenshot](obo/dukazy/spfx/tomas.prochazka-posta.png) |
| Totéž přímo z prohlížeče (`MSGraphClientV3`, bez serveru) | ✅ **403 `ErrorAccessDenied`**: SPFx principal `Mail.ReadBasic` nemá | [screenshot](obo/dukazy/spfx/tomas.prochazka-primo.png), síťový log v [tomas.prochazka.json](obo/dukazy/spfx/tomas.prochazka.json) |
| OBO **bez tajemství**: federated credential na uživatelem přiřazenou managed identitu (vzor ppf-rooms), Container App ve **stávajícím** prostředí `ca-ppf-rooms-env`, min. repliky 0 | ✅ tomas, petra 200 tokenem z ROPC i ze SPFx | [matice-mi-1.jsonl](obo/dukazy/matice-mi-1.jsonl), [matice-mi-2.jsonl](obo/dukazy/matice-mi-2.jsonl), [containerapp-config.json](obo/dukazy/containerapp-config.json) |
| OBO s **client secret v Key Vaultu** (Container App secret `keyvaultref` + identita) | ✅ funguje (po 15 min 30/30 200), **ale** viz pasti: (1) koncový `\n` v uloženém tajemství, (2) v prvních minutách po založení tajemství občasné `AADSTS7000215` | [matice-secret.jsonl](obo/dukazy/matice-secret.jsonl), [opakuj-secret.jsonl](obo/dukazy/opakuj-secret.jsonl), [opakuj-secret-po15min.jsonl](obo/dukazy/opakuj-secret-po15min.jsonl) |
| Bez tokenu | ✅ 401 `chybí token` | matice-*.jsonl |
| Nesmysl v `Authorization` | ✅ 401 `ERR_JWS_INVALID` | matice-*.jsonl |
| Token pro jinou audience: SharePoint | ✅ 401 `ERR_JWS_SIGNATURE_VERIFICATION_FAILED` | matice-*.jsonl |
| Token pro jinou audience: jiné vlastní API stejného tenantu, platný podpis (`egd-sonda-data-api`) | ✅ 401 `ERR_JWT_CLAIM_VALIDATION_FAILED` (aud) | [matice-mi-2.jsonl](obo/dukazy/matice-mi-2.jsonl) |
| Uživatel bez souhlasu (lucie: souhlas API→Graph jen pro tomas a petra) | ✅ API 403, Entra `invalid_grant` **AADSTS65001**; ROPC i SPFx v prohlížeči | matice-*.jsonl, [spfx/lucie.dvorakova.json](obo/dukazy/spfx/lucie.dvorakova.json) |
| Může si uživatel souhlas dát sám? | ✅ **ne**: obrazovka „Need admin approval … only an admin can grant“ (politika tenantu `microsoft-user-default-low`) | [souhlas/lucie.dvorakova-souhlas.png](obo/dukazy/souhlas/lucie.dvorakova-souhlas.png), [json](obo/dukazy/souhlas/lucie.dvorakova-souhlas.json) |
| Admin consent pro celý tenant (AllPrincipals) → lucie 200 | ✅ okamžitě (3/3 volání 200) | [consent-all-lucie.jsonl](obo/dukazy/consent-all-lucie.jsonl) |
| Odebrání souhlasu → lucie zase 403 | ✅ do 92 s (grant smazán 00:57:10 UTC; v prvních sekundách ještě 1× 200, v 00:58:42 už 3/3 `AADSTS65001`) | [consent-revoke-lucie.jsonl](obo/dukazy/consent-revoke-lucie.jsonl), [consent-revoke.poznamka.txt](obo/dukazy/consent-revoke.poznamka.txt) |
| Studený start (min. repliky 0) | ✅ `/healthz` 20,3 s; první OBO po startu 4,2 s (token identity + JWKS), další 0,4–0,9 s | [matice-mi-1.jsonl](obo/dukazy/matice-mi-1.jsonl) |

**Licence Copilot OBO nepotřebuje.** Všechno v tabulce výše (OBO pošta, `User.Read Mail.ReadBasic`) funguje bez licence
Microsoft 365 Copilot ✅. Totéž platí pro kartu OBO v katalogu funkcí (egd10, 200).

### Samostatná varianta: Microsoft 365 Copilot API přes OBO

Jde o jiný pokus nad stejným tunelem, se samostatnými Graph scopy, a vztahuje se jen na Copilot Retrieval a Chat API.
Výsledek: ⛔ **funguje jen s licencí Copilot u uživatele**. OBO dá 8 Copilot scopů jen naší API registraci ✅. S licencí (egd10, 24. 11. večer)
Chat přes OBO odpovídá ✅ (správný údaj z dokumentů ale jen 1× ze 6). Retrieval přes OBO vrací 0 úryvků, přímo ze SPFx 4. Příčinou je OBO token, ne scopy ani parametry, nejspíš aplikace v tokenu ❓. Bez licence vrací Retrieval 403 a Chat prázdnou odpověď. Granty jsou vrácené (24. 11.).
Podrobnosti: [obo-copilot.md](obo-copilot.md).

## Proč zrovna pošta (`Mail.ReadBasic`)

Cíl byl ukázat něco, co SPFx v prohlížeči **nedostane**. V labu má principal „SharePoint Online Web Client
Extensibility“ (přes něj jdou všechny SPFx tokeny) už schválené mimo jiné `GroupMember.Read.All`,
`Files.Read.All`, `Sites.Read.All`, `Mail.Send` (✅ výpis grantů, [entra-stav.txt](obo/dukazy/entra-stav.txt) a
výpis v transkriptu), takže `/me/memberOf` ani OneDrive by rozdíl neukázaly. `Mail.ReadBasic` (předmět,
odesílatel, čas, bez těla) tam není a je to nejnižší „poštovní“ oprávnění.

Hlavní důvod OBO pro EG.D ale není „SPFx nemůže nikdy“: SPFx principal **může** dostat cokoli, jenže
schválení `webApiPermissionRequests` platí pro **všechny SPFx řešení v tenantu** (📘, sdílený principal; že
granty v labu jsou jedny pro všechny web party, ✅ vidět ve výpisu). Přes OBO dostane oprávnění **jen jedno
API**, a server rozhoduje, co z dat vrátí (tady jen 5 předmětů, ne obsah). To je argument pro IT E.ON.

## Jak to funguje

```
SPFx web part ──AadHttpClient.getClient(<API appId>)──▶ token v2, aud = <API appId>, scp = access_as_user, azp = SPFx principal
      │ GET https://ca-egd-obo…/api/posta  (Authorization: Bearer …)
      ▼
Container App ca-egd-obo (Node 22, jose)
  1. ověří JWT (podpis z JWKS tenantu, issuer v2, audience = API appId, scp access_as_user)
  2. důkaz „jsem API“: token managed identity pro api://AzureADTokenExchange  (varianta MI)
                      nebo client secret z Key Vaultu                           (varianta secret)
  3. POST /oauth2/v2.0/token  grant_type=jwt-bearer, requested_token_use=on_behalf_of, assertion=<token uživatele>
     → token Graphu jménem uživatele (scope Mail.ReadBasic User.Read)
  4. GET /me/messages?$top=5&$select=subject,from,receivedDateTime → vrátí jen předměty
```

Kód: [obo/api/server.mjs](obo/api/server.mjs) (~100 řádků, jediná závislost `jose`). Chyby výměny mapuje:
`AADSTS65001`/`consent_required` → 403 (chybí souhlas), `interaction_required` → 401 s `claims` (Conditional
Access, MFA; ❓ v labu nevyvoláno), ostatní → 502. SPFx: [obo/spfx/src/webparts/oboPosta/OboPostaWebPart.ts](obo/spfx/src/webparts/oboPosta/OboPostaWebPart.ts).

## Postup (prošel v labu, skript [tools/ca-obo.sh](../../tools/ca-obo.sh))

```bash
tools/ca-obo.sh entra            # API registrace + testovací klient + souhlasy
tools/ca-obo.sh azure            # RG rg-egd-ca-obo, UAMI id-egd-ca-obo (AcrPull + federated credential)
tools/ca-obo.sh build 0.1        # docker buildx linux/amd64 + push (ACR Tasks jsou v labu zakázané)
tools/ca-obo.sh deploy 0.1 mi    # Container App ve stávajícím ca-ppf-rooms-env, min 0 / max 1 replika
tools/ca-obo.sh test dukazy/x.jsonl
tools/ca-obo.sh kv && tools/ca-obo.sh deploy 0.1 secret   # varianta s Key Vaultem
tools/ai-spfx-api-grant.sh <API appId> access_as_user      # „API access → Approve“ pro SPFx
tools/ai-spfx-deploy.sh obo/spfx/sharepoint/solution/egd-ca-obo.sppkg <web> f6aa9c1a-… obo.aspx '{"apiUrl":…,"apiAppId":…}'
node tools/ca-obo-klik.mjs tomas.prochazka <url stránky> dukazy/spfx
```

### Entra nastavení (✅ [entra-api-app.json](obo/dukazy/entra-api-app.json), [entra-stav.txt](obo/dukazy/entra-stav.txt))

| Objekt | Nastavení | Kdo to dělá |
|---|---|---|
| Registrace API `egd-ca-obo-api` | `identifierUris = api://<appId>`, `requestedAccessTokenVersion = 2`, scope `access_as_user` (typ User), `requiredResourceAccess` Graph delegované `User.Read`, `Mail.ReadBasic` | vývojář s právem registrovat appky (v labu Global Admin) |
| Federated credential na registraci API | issuer `https://login.microsoftonline.com/<tenant>/v2.0`, subject = **objectId (principalId) UAMI**, audience `api://AzureADTokenExchange` | vlastník registrace |
| Service principal API | tag `WindowsAzureActiveDirectoryIntegratedApp` (jinak ho SharePoint „API access“ nenajde, past z [ai.md](../ai.md)) | Entra admin |
| Souhlas SPFx → API | `oauth2PermissionGrant` SharePoint Online Web Client Extensibility → API, `access_as_user`, AllPrincipals (= „API access → Approve“ v SharePoint admin centru) | změřeno ✅ Global Admin; role SharePoint admin ❓ |
| **Souhlas API → Graph** (to, co OBO potřebuje) | `oauth2PermissionGrant` API → Microsoft Graph `User.Read Mail.ReadBasic`; v labu `Principal` jen pro tomas a petra (negativní test), ověřeno i `AllPrincipals` | admin s právem udělit souhlas za organizaci (📘 Cloud Application Administrator / Application Administrator / Global Admin; v labu udělil Global Admin přes Graph). Uživatel sám **nemůže** ✅ |
| Testovací public klient `egd-ca-obo-klient` | jen pro ROPC test mimo prohlížeč (`isFallbackPublicClient`), v E.ON nepotřeba | – |

Pozor na rozdíl: souhlas **SPFx → API** nestačí. Bez souhlasu **API → Graph** projde `whoami` (200), ale
výměna OBO skončí `AADSTS65001` ✅ (lucie).

### Azure

| Zdroj | Nastavení |
|---|---|
| `rg-egd-ca-obo` | tag `ucel=egd-workshop` |
| `id-egd-ca-obo` (UAMI) | AcrPull na `acrppfroomsca3lbgs`; je subjektem federated credential; Key Vault Secrets User na KV. Sama k Graphu nic nesmí |
| `ca-egd-obo` | prostředí `ca-ppf-rooms-env` (sdílené, nové se nezakládalo), ingress external 8080, 0,25 CPU / 0,5 GiB, min 0 / max 1, env `TENANT_ID`, `API_CLIENT_ID`, `OBO_MODE`, `MI_CLIENT_ID`, `GRAPH_SCOPES`, `ALLOWED_ORIGIN` (CORS pro SharePoint) |
| `kv-egd-ca-obo-bbc29a` | jen varianta secret: RBAC, secret `obo-client-secret` (platnost do 31. 12. 2026), Container App ho čte `keyvaultref` + `identityref` UAMI |

Proč UAMI a ne systémová identita: federated credential potřebuje pevný subject předem; tak to dělá i ppf-rooms
([obo.md](../../../ppf-rooms/docs/obo.md), oponentura „jen s uživatelem přiřazenou“). Systémovou identitu jsem
nezkoušel ❓ (viz Neověřeno).

### Jak volat ze SPFx

`config/package-solution.json`:

```json
"webApiPermissionRequests": [{ "resource": "egd-ca-obo-api", "scope": "access_as_user" }]
```

Kód (celé v [OboPostaWebPart.ts](obo/spfx/src/webparts/oboPosta/OboPostaWebPart.ts)):

```ts
const client = await this.context.aadHttpClientFactory.getClient(apiAppId);   // appId API registrace
const r = await client.get(`${apiUrl}/api/posta`, AadHttpClient.configurations.v1);
```

Server musí povolit CORS pro `https://<tenant>.sharepoint.com` (hlavička `Authorization` → preflight) ✅.

## Varianty

| Varianta | Stav | Pro | Proti | Co chce IT E.ON | Náročnost pro citizen developera |
|---|---|---|---|---|---|
| **A) Container App + UAMI jako federated credential (bez tajemství)** | ✅ SPFx i ROPC | žádné tajemství k rotaci ani úniku; identita sama nic nesmí | federated credential na registraci appky (citlivé nastavení), UAMI navíc; první volání po startu 4,2 s | subscription, Container Apps env (jedno na předplatné), Entra registrace + FIC, **admin consent API → Graph**, schválení API pro SPFx | vysoká (nutný správce platformy; skript to zvládne za ~5 min) |
| **B) Container App + client secret v Key Vaultu** | ✅ funguje; past s `\n` ✅; občasné `AADSTS7000215` po založení tajemství (viz níž) | známý vzor, IT ho zná; jde i bez federated credentials | rotace tajemství (max. platnost dle politiky E.ON ⛔), Key Vault navíc, riziko úniku | totéž + Key Vault a politika tajemství | vysoká |
| B2) client **certifikát** v Key Vaultu | ❓ nezkoušeno | bez sdíleného hesla, IT politiky ho často chtějí | složitější kód (podpis client assertion), rotace | Key Vault, PKI/politika certifikátů | vysoká |
| C) Bez OBO: Graph přímo ze SPFx (`MSGraphClientV3`) | ✅ 403, dokud SPFx principal oprávnění nemá; se schválením 📘 projde | žádný server | schválení platí pro **všechny** SPFx v tenantu; server nemůže omezit, co appka čte | schválit Graph scope pro SharePoint Online Web Client Extensibility | nízká |
| D) Power Automate | ❓ (viz [10-container-app.md](../../10-container-app.md): konektory běží jako vlastník připojení, ne jako uživatel appky) | bez Azure | není to OBO uživatele appky | licence PA | střední |
| E) Function App místo Container App | ✅ jinde: ppf-rooms 14. 11. (Function App + UAMI) | levnější hosting ❓ | stejné nároky na identitu | subscription | vysoká |

**Doporučení:** A. Je změřená celá cesta ze SPFx, bez tajemství, a odpadá rotace. B nechat jako záložní, kdyby
IT E.ON federated credentials na registracích nepovolilo. C jen pro oprávnění, která IT stejně dává všem SPFx.

### Pasti (✅ změřeno)

1. **Koncový `\n` v tajemství.** `az rest … --query secretText -o tsv | az keyvault secret set --file /dev/stdin`
   uloží 41 znaků místo 40 (✅ délka ověřena bez výpisu hodnoty). Skript teď ořezává `tr -d "\r\n"`. Chyba
   se projevila jako `AADSTS7000215` ([matice-secret-chyba-newline.jsonl](obo/dukazy/matice-secret-chyba-newline.jsonl)).
2. **`AADSTS7000215` i se správnou hodnotou** v prvních minutách po založení tajemství (1 z 10, 2 z 3 volání
   [opakuj-secret.jsonl](obo/dukazy/opakuj-secret.jsonl), [consent-revoke-lucie.jsonl](obo/dukazy/consent-revoke-lucie.jsonl)).
   Po 15 minutách ✅ **30 z 30 volání 200** (petra, tomas; první volání 26,9 s = studený start, další 0,3–0,4 s),
   [opakuj-secret-po15min.jsonl](obo/dukazy/opakuj-secret-po15min.jsonl). Nové tajemství tedy počítat s propagací
   v Entra řádově minut (příčina 📘 replikace; přesná doba ❓) a při rotaci držet staré tajemství platné, dokud nové nepropaguje.
3. Nová revize Container App chvíli běží vedle staré: první běh testu po `deploy … secret` ještě obsloužila
   stará revize (`mode: mi` v [matice-mi-2.jsonl](obo/dukazy/matice-mi-2.jsonl)). Test čekat, až je nová revize `Healthy` a stará `Deprovisioning`.
4. Graph neumí `$filter` na `oauth2PermissionGrants` podle `consentType`/`principalId` (`Request_UnsupportedQuery`), filtrovat jen podle `clientId`.
5. `sondy/ai/spfx/node_modules/string-argv/commonjs/package.json` je prázdný soubor, CoW kopie node_modules
   z AI sondy proto build neprošla (`ERR_INVALID_PACKAGE_CONFIG`); pomohlo čisté `npm ci`.

## Co chce IT E.ON

| Co | Proč | Lab |
|---|---|---|
| Registrace Entra appky pro API (scope, identifier URI) | token pro `AadHttpClient` | ✅ |
| **Admin consent API → Graph** pro potřebné delegované scope | bez něj OBO 403 `AADSTS65001`, uživatel souhlas dát nesmí (záleží na politice user consent E.ON ⛔) | ✅ |
| Schválení API pro SPFx (SharePoint admin → API access) | aby `AadHttpClient` dostal token | ✅ |
| Federated credential na registraci (varianta A), nebo Key Vault + politika tajemství (B) | důkaz identity API při výměně | ✅ obě |
| Container Apps env (jedno na předplatné), ACR, UAMI s AcrPull | hosting | ✅ |
| Conditional Access: API musí umět vrátit `claims` klientovi (`interaction_required`) | jinak uživatel s MFA/CA politikou dostane chybu | ❓ ⛔ v labu není CA politika, která by OBO zastavila |

Cena v labu: Container App min. 0 replik (platí se jen běh), Key Vault Standard za operace (centy) 📘; skutečná
útrata ❓ neodečtena (Azure Cost Management má zpoždění ~1 den).

## Neověřeno

| Co | Proč | Jak ověřit |
|---|---|---|
| Conditional Access / MFA při OBO (`interaction_required` + `claims`) | v labu žádná CA politika na Graph | ⛔ v E.ON, nebo v labu politika „MFA pro Office 365“ na testovacího uživatele a volání ze SPFx |
| Varianta B2 (certifikát) | čas | `az keyvault certificate create` + client assertion podepsaná certifikátem |
| Systémová managed identity jako federated credential | ppf-rooms ji vyloučil z dokumentace (📘), neměřeno | přidat system-assigned, FIC se subject = její principalId, `OBO_MODE=mi` s jejím tokenem |
| Politika user consent v E.ON | jiný tenant | ⛔ dotaz na IT E.ON (`policies/authorizationPolicy`, `permissionGrantPoliciesAssigned`) |
| Cache OBO tokenu na serveru | kód token necachuje (každé volání = výměna ~120–380 ms) | přidat cache podle `oid` + exp a změřit |

## Znovupoužitelné nástroje

| Skript | Co dělá |
|---|---|
| [tools/ca-obo.sh](../../tools/ca-obo.sh) | OBO na Container App: Entra registrace, UAMI + federated credential, build/deploy (mi/secret), Key Vault, souhlasy, testovací matice a opakovaná volání (`--help`) |
| [tools/ca-obo-klik.mjs](../../tools/ca-obo-klik.mjs) | klon Chrome profilu lab uživatele, klikne web part „OBO pošta“ a uloží log (výstup, síť) + screenshoty |
| [obo/souhlas-klik.mjs](obo/souhlas-klik.mjs) | otevře obrazovku uživatelského souhlasu pod profilem lab uživatele (jen sonda) |

## Co v labu vzniklo

Entra: `egd-ca-obo-api` (`9809454b-59c2-4d85-8bf6-dbd1481b1d6b`), `egd-ca-obo-klient` (`efe82d2b-…`), granty viz výš.
Azure (`rg-egd-ca-obo`): `id-egd-ca-obo`, `ca-egd-obo`, `kv-egd-ca-obo-bbc29a`; AcrPull na sdíleném ACR.
SharePoint: web `/sites/egd-ca-obo`, appka `egd-ca-obo.sppkg` v tenant katalogu, stránka `obo.aspx`; návštěvníci tomas, lucie, petra.
Stav (appId, FQDN, režim): [obo/stav.json](obo/stav.json). Container App po sondě běží ve variantě A (`OBO_MODE=mi`);
Key Vault s tajemstvím zůstal pro variantu B (`tools/ca-obo.sh deploy 0.1 secret`). Lucie zůstává bez souhlasu (negativní test).
