# Container App: práva na jednotlivé položky přes backend a `AadHttpClient` ze SPFx na DB API

Funkce sdíleného serveru (viz [../../10-container-app.md](../../10-container-app.md)): **zadavatel nasdílí jednu položku
SharePoint seznamu vybranému kolegovi**, i když sám právo `ManagePermissions` nemá. Změnu práv dělá API svou identitou,
o tom, kdo smí, rozhoduje token volajícího. Druhá část: web part v SharePointu volá DB API přes `AadHttpClient`.

Měřeno v labu (tenant `pavelchocholousgmail`) 24. 11. 2026 v noci, session `ca-prava-db`. Značky: ✅ změřeno v labu
s odkazem na surový důkaz · 📘 dokumentace · ❓ neověřeno (📘 a ❓ jsou jen mezistav, viz [../../CLAUDE.md](../../CLAUDE.md)).
Navazuje na [../data-prava.md](../data-prava.md) (cesta C, API `ca-egd-data-api`). Surové důkazy jsou v [prava-db/](prava-db/).

## Shrnutí

| Co | Stav | Důkaz |
|---|---|---|
| Zadavatel A nasdílí svou položku kolegovi B přes API → B ji vidí, C ne | ✅ 200; B 200, C 404 (v seznamu 0 položek) | [08-test-sdileni.jsonl](prava-db/08-test-sdileni.jsonl) kroky 3–4 |
| C (zadavatel, cizí položka) chce sdílet → 403; B (Schvalovatel) → 403; bez app role → 403; bez tokenu → 401 | ✅ | tamtéž, kroky 2 |
| Spravce (app role) smí sdílet cizí položku → 200 | ✅ | tamtéž, krok 6 |
| Bez backendu to nejde: C rozbije dědičnost na **vlastní** položce přímo v SharePointu → 403 | ✅ `Access is denied` | tamtéž, krok 5 |
| B s právem Čtení položku nezmění (PATCH) → 403 | ✅ | tamtéž, krok `4-B-nesmi-upravit-PATCH` |
| Celý test 23 volání, všechna podle očekávání | ✅ 23/23 `sedi: true` | [08-test-sdileni.jsonl](prava-db/08-test-sdileni.jsonl) |
| Identita API: user-assigned managed identity + `Sites.Selected` (SharePoint) + `fullcontrol` jen na lab web | ✅ | [02-identita-setup.log](prava-db/02-identita-setup.log) |
| SPFx web part → `AadHttpClient` → DB API: whoami, žádosti z SQL, seznam položek, Sdílet | ✅ pod 3 účty v prohlížeči | [14-tomas-klik.log](prava-db/14-tomas-klik.log) + [png](prava-db/14-tomas-sdili-evu.png), [15-eva](prava-db/15-eva-klik.log) + [png](prava-db/15-eva-vidi.png), [16-jakub](prava-db/16-jakub-klik.log) + [png](prava-db/16-jakub-403.png) |
| Práva podle oddělení a nadřízeného (4.3 B): nadřízený vidí žádosti podřízeného, kolega z jiného oddělení ne | ✅ 5/5 (v0.3, sekce níže) | [23-test-org.jsonl](prava-db/23-test-org.jsonl) |
| Stávající endpointy DB API po redeployi beze změny chování | ✅ 14/14 stejné HTTP kódy před (0.1) a po (0.2) | [04-regrese-pred-0.1.jsonl](prava-db/04-regrese-pred-0.1.jsonl), [09-regrese-po-0.2.jsonl](prava-db/09-regrese-po-0.2.jsonl) |

Tím je doplněn i chybějící surový důkaz DB API z [../data-prava.md](../data-prava.md) (C): oba regresní běhy jsou uložené
a SPFx `AadHttpClient` proti tomuto API je ✅ (předtím ❓).

## Architektura

```
SPFx web part (uživatel)
  ├─ AadHttpClient (token v2, aud = appId API, app role v `roles`) ──► ca-egd-data-api (Container App, Node)
  │                                                                    ├─ ověří JWT (jose, JWKS tenantu)
  │                                                                    ├─ /api/zadosti… → Azure SQL (beze změny)
  │                                                                    └─ /api/sp/polozky/{id}/sdilet → kontrola vlastník/Spravce
  │                                                                         → token managed identity (IDENTITY_ENDPOINT)
  │                                                                         → SharePoint REST: breakroleinheritance, ensureuser, addroleassignment
  └─ fetch /_api/… s cookie (co vidí sám uživatel; SharePoint práva vynucuje sám)
```

## Endpointy (API v0.2, `sondy/data-prava/api/server.mjs`)

Všechny chtějí `Authorization: Bearer <token pro api://fec3e01a-…>` s aspoň jednou app rolí (`Zadavatel` / `Schvalovatel` / `Spravce`).

| Metoda a cesta | Kdo smí | Co dělá |
|---|---|---|
| `GET /healthz` | kdokoli | `{ok:true}` |
| `GET /api/me` | s app rolí | `{upn, oid, roles, ver:"0.2"}`; **nově bez dotazu na SQL** (v 0.1 čekal na probuzení SQL, až 33 s) |
| `GET/POST /api/zadosti`, `POST /api/zadosti/{id}/stav`, `DELETE /api/zadosti/{id}` | beze změny, viz [../data-prava.md](../data-prava.md) | SQL |
| `POST /api/sp/polozky/{id}/sdilet` body `{komu: "<UPN>", role: "Read"\|"Edit"\|"Contribute"}` | vlastník položky (Author) nebo app role `Spravce` | při **prvním** sdílení `breakroleinheritance(copyRoleAssignments=false, clearSubscopes=true)` a autorovi `Contribute` (položka se uzavře: vidí ji jen autor a ti, komu ji nasdílí), pak `ensureuser` + `addroleassignment`. Vrací `kroky` s HTTP kódem každého volání SharePointu |
| `GET /api/sp/polozky/{id}/prava` | vlastník nebo `Spravce` | výpis přiřazení rolí položky |
| `POST /api/org/sync` (v0.3) | `Spravce` | zkopíruje `department` a `manager` všech uživatelů z Graphu do `dbo.OrgUzivatel` |
| `GET /api/org/me` (v0.3) | s app rolí | moje oddělení, nadřízený, přímí podřízení |
| `GET /api/zadosti/tym` (v0.3) | s app rolí | vlastní + podřízených + (Schvalovatel) svého oddělení + (Spravce) vše, se sloupcem `Duvod` |

Chyby: 400 špatný vstup / neznámý uživatel, 403 ani vlastník ani Spravce (`{ja, vlastnik}`), 404 položka neexistuje,
502 SharePoint odmítl (`sp_status`, `sp`), 501 chybí konfigurace. Vlastník = porovnání UPN z tokenu (`preferred_username`)
s `Author/Name` (claims login) nebo `Author/EMail`; SharePoint `oid` nevrací.

Konfigurace jen z prostředí Container App (žádné pevné hodnoty v kódu): `SP_SITE_URL`, `SP_LIST`, `SP_MI_CLIENT_ID`
(clientId identity, protože app má dvě user-assigned identity; druhá `id-egd-data-pull` je jen pro ACR). Token identity:
`GET $IDENTITY_ENDPOINT?resource=https://<tenant>.sharepoint.com&api-version=2019-08-01&client_id=$SP_MI_CLIENT_ID`
s hlavičkou `X-IDENTITY-HEADER`, kešuje se do 5 min před vypršením.

## Postup krok za krokem (lab, všechno ✅ prošlo)

1. **Identita a práva na web**: `tools/prava-db-identita.sh rg-egd-sonda-data-prava ca-egd-data-api id-egd-data-sp https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-data-prava`
   - založí UAMI `id-egd-data-sp` (tag `ucel=egd-workshop`), přiřadí ji k app,
   - přidá app roli **`Sites.Selected` na „Office 365 SharePoint Online“** (ne na Microsoft Graph: SharePoint REST kontroluje roli své vlastní aplikace),
   - přidá na web grant `fullcontrol` (`POST graph /sites/{id}/permissions`). `ManagePermissions` je jen ve Full Control; `read/write/manage` nestačí 📘 (nezkoušeno, viz Neověřeno).
   - Past ✅ ([02-identita-setup.log](prava-db/02-identita-setup.log), první běhy): `m365 spo site apppermission add --appId` (CLI v11.11.0) končí `Insufficient privileges`, protože si appku dohledává v adresáři; skript proto volá Graph přímo tokenem m365 CLI. Ten token musí mít delegované `Sites.FullControl.All` – v labu jsem ho přidal do grantu appky `m365-cli-spfx-lab` ([03-m365cli-grant.log](prava-db/03-m365cli-grant.log)) a token obnovil `util accesstoken get --new`.
2. **Image**: `tools/data-prava-docker-push.sh acrppfroomsca3lbgs sondy/data-prava/api egd-sonda-data-api:0.2` ([05-build-0.2.log](prava-db/05-build-0.2.log)).
3. **Deploy**: `tools/prava-db-deploy.sh rg-egd-sonda-data-prava ca-egd-data-api acrppfroomsca3lbgs.azurecr.io/egd-sonda-data-api:0.2 https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-data-prava Sdileni` – image, env, CORS jen pro `https://pavelchocholousgmail.sharepoint.com` (hlavičky `authorization content-type`). Min. repliky zůstaly 0 ([06-deploy-0.2.log](prava-db/06-deploy-0.2.log)).
4. **Seznam**: `python3 tools/prava-db-test.py setup` – seznam `Sdileni`, vlastní práva: vlastníci webu Úplné řízení, Zadavatelé a Schvalovatelé Přispívání ([07-setup-seznam.jsonl](prava-db/07-setup-seznam.jsonl)).
5. **Test API**: `python3 tools/prava-db-test.py test > 08-test-sdileni.jsonl` (A = tomas Zadavatel, B = eva Schvalovatel, C = jakub Zadavatel, Spravce = petra, bez role = lucie).
6. **Regrese**: `python3 tools/overeni-data-api-matrix.py` před a po deployi.
7. **SPFx** ([spfx/](prava-db/spfx/), web part „DB API a sdílení“, id `e11ebff0-…`): `npm run build`, pak
   `tools/ai-spfx-deploy.sh …/egd-prava-db.sppkg <web> e11ebff0-d972-4f4a-8401-aaf1bbf40fb9 prava-db.aspx '{"apiUrl":"…","apiAppId":"fec3e01a-…","listTitle":"Sdileni"}'`.
   Past ✅ ([11-spfx-deploy.log](prava-db/11-spfx-deploy.log)): hned po instalaci `There is no available WebPart`; po ~1 min `clientsidewebpart add` + `page set --publish` prošly.
8. **Souhlas správce** pro `webApiPermissionRequests` (`fec3e01a-… / access_as_user`), viz varianty níže ([12-api-consent.log](prava-db/12-api-consent.log)).
9. **Odkliknutí** pod uloženými profily: `node tools/spo-webpart-konzole.mjs <profil> '<web>/SitePages/prava-db.aspx?env=WebView' me zadosti polozky --pred … --eval … --shot …`.

Výsledek v prohlížeči ✅: tomas `Kdo jsem` 200 (roles `Zadavatel`), `Žádosti` 200 (jen své), `Položky` 200, `Sdílet` položku 6 Evě
→ 200 se třemi kroky; eva vidí položku 6 v seznamu; jakub položku 6 v seznamu nemá a `Sdílet` → **403 „sdílet smí jen vlastník
položky nebo Spravce“**. První volání `AadHttpClient` v nové relaci trvalo **26,9 s** (získání tokenu + případně studený start;
API bylo předtím volané, takže většina připadá na token ❓ nerozlišeno), další 0,1–4,6 s ([14-tomas-klik.log](prava-db/14-tomas-klik.log)).

## Jak volat ze SPFx

```ts
// package-solution.json: "webApiPermissionRequests": [{ "resource": "<appId API>", "scope": "access_as_user" }]
const client = await this.context.aadHttpClientFactory.getClient('<appId API>');
const r = await client.post(`${apiUrl}/api/sp/polozky/${id}/sdilet`, AadHttpClient.configurations.v1,
  { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ komu: 'eva@…', role: 'Read' }) });
```

Podmínky ✅: souhlas správce (scope `access_as_user` pro „SharePoint Online Web Client Extensibility“), CORS na ingressu pro
origin SharePointu, API přijímá token v2 (`requestedAccessTokenVersion: 2`, `aud` = appId). Seznam položek web part čte
přímo SharePointem pod uživatelem (`fetch` s cookie), aby bylo vidět, co mu SharePoint skutečně ukáže.

## Varianty

### Identita, která mění práva (ManagePermissions)

| Varianta | Ověřeno | Pro | Proti | Co chce od IT E.ON | Náročnost pro citizen dev |
|---|---|---|---|---|---|
| **1. User-assigned MI + `Sites.Selected` (SharePoint) + `fullcontrol` jen na web** (zvoleno) | ✅ | žádné tajemství ani certifikát; právo jen na jeden web; identita přežije smazání/přestavbu app; IT ji může předpřipravit | grant na web umí jen někdo s `Sites.FullControl.All` (Graph); `fullcontrol` = appka smí na webu vše | založit UAMI, přiřadit app roli `Sites.Selected` (Privileged Role Admin / Global Admin), grant `fullcontrol` na web (SharePoint admin) | nízká (dostane hotovou identitu a clientId) |
| 2. System-assigned MI, jinak totéž | ❓ (stejný mechanismus, nezkoušeno) | o zdroj méně | identita zanikne s app; grant se musí opakovat při nové app | totéž | nízká |
| 3. Registrace appky s certifikátem + `Sites.Selected` | ❓ | funguje i mimo Azure (Power Automate, lokálně) | certifikát v Key Vaultu a jeho rotace; client secret SharePoint REST app-only odmítá 📘 | registrace, certifikát, grant | střední |
| 4. MI s `Sites.FullControl.All` (celý tenant) | ❓ | žádný grant na web | appka smí měnit práva ve všech webech – pro E.ON nepřijatelné | Global Admin souhlas | nízká, ale bezpečnostně špatně |
| 5. Power Automate „Send HTTP request to SharePoint“ pod servisním účtem | ❓ (sonda D v [../data-prava.md](../data-prava.md)) | bez Azure | účet s Full Control a licencí, ladění v PA | servisní účet, licence, DLP | střední |
| 6. OBO / token uživatele | ✅ nefunguje: uživatel `ManagePermissions` nemá (krok `5-C-rozbiji-sam` → 403) | – | – | – | – |

Doporučení (stojí na ✅): varianta 1. Pro EG.D jedna sdílená identita API na jeden „aplikační“ web, ne na celý tenant.

### Souhlas správce pro `webApiPermissionRequests`

| Varianta | Ověřeno | Poznámka |
|---|---|---|
| `m365 spo serviceprincipal permissionrequest list/approve` (CLI v11.11.0, lab admin) | ✅ **403** | [12-api-consent.log](prava-db/12-api-consent.log); v labu nejde, příčina neověřena |
| Graph `oauth2PermissionGrant` pro „SharePoint Online Web Client Extensibility“ (`tools/ai-spfx-api-grant.sh`) | ✅ | grant `access_as_user`, web part pak volá API |
| SharePoint admin center → API access → Approve (klikání) | viz [../ai.md](../ai.md) a `tools/overeni-ui-approve.mjs` (ověřeno pro jiné API) | v této sondě nezkoušeno |

### Kde je logika „kdo smí sdílet“

| Varianta | Stav |
|---|---|
| API: vlastník podle `Author` + app role `Spravce` (implementováno) | ✅ |
| Rozšíření: smí i ten, komu byla položka nasdílena s `Edit`; skupina místo jednotlivce (`ensureuser` na skupinu) | ❓ neimplementováno |

## 4.3 B: práva podle oddělení a nadřízeného (díra 9 v `prehled/varianty.md`)

Měřeno 24. 11. 2026 ~03:20–03:30 SEČ, API **v0.3** (revize `ca-egd-data-api--0000004`).

### Výsledek: ✅

| Kdo (role, oddělení v Entra) | Vidí v `GET /api/zadosti/tym` ze tří nových žádostí (tomas, jakub, karolina) | Očekáváno | Důvod z API |
|---|---|---|---|
| tomas (Zadavatel, PPF Gate, nadřízený = jakub) | jen svou | jen svou | `vlastni` |
| **jakub (Zadavatel, PPF Gate, nadřízený tomase)** | **svou + tomasovu** | svou + podřízeného | `vlastni`, `podrizeny` |
| **karolina (Zadavatel, „PPF Gate – recepce“)** | **jen svou** (tomasovu ani jakubovu ne) | jen svou | `vlastni` |
| eva (Schvalovatel, PPF Gate) | tomasovu + jakubovu, karolininu ne | celé své oddělení | `oddeleni` |
| petra (Spravce) | všechny tři | vše | `spravce` |

5/5 podle očekávání, plus: synchronizaci smí jen Spravce (tomas → 403), původní `GET /api/zadosti` se nemění (jakub v něm tomasovu žádost nevidí).
Surově: [23-test-org.jsonl](prava-db/23-test-org.jsonl). Synchronizace 65 uživatelů z Graphu trvala 5,6 s.
Regrese po 0.3: SQL matice 14/14 stejně jako 0.1 ([25-regrese-po-0.3.jsonl](prava-db/25-regrese-po-0.3.jsonl)),
sdílení položek 23/23 ([26-test-sdileni-0.3.jsonl](prava-db/26-test-sdileni-0.3.jsonl)).

### Jak to funguje

- **Zdroj pravdy je Entra**: `department` a `manager` uživatele. V labu oddělení už vyplněná byla (sdílí je ppf-rooms, proto
  jsem je neměnil); doplnil jsem jen nadřízeného `tomas → jakub` ([20-org-setup.log](prava-db/20-org-setup.log)).
- **Tabulka v SQL** `dbo.OrgUzivatel (Oid, Upn, Oddeleni, NadrizenyOid, Synchronizovano)` – kopie z Entra.
  Plní ji `POST /api/org/sync` (jen Spravce): stejná managed identita `id-egd-data-sp` s Graph app rolí **`User.Read.All`**
  čte `GET /users?$select=id,userPrincipalName,department&$expand=manager($select=id)` (stránkuje) a v transakci tabulku přepíše.
- **Pravidlo viditelnosti** (`GET /api/zadosti/tym`, jeden SQL dotaz s rekurzivním CTE přes `NadrizenyOid`, max. 20 úrovní):
  vlastní + všech podřízených (přímých i nepřímých) + u role Schvalovatel celého vlastního oddělení + u Spravce vše.
  Každý řádek nese `Duvod` (`vlastni` / `podrizeny` / `oddeleni` / `spravce`), takže je vidět, proč ho uživatel vidí.
- `GET /api/org/me`: moje oddělení, nadřízený, přímí podřízení, čas synchronizace.
- Původní endpointy (`/api/zadosti` atd.) zůstaly beze změny; nové chování je jen v novém endpointu.

### Varianty (kde vzít oddělení a nadřízeného)

| Varianta | Ověřeno | Pro | Proti | IT E.ON | Náročnost |
|---|---|---|---|---|---|
| **A. Graph → kopie v SQL (`/api/org/sync`)** (implementováno) | ✅ | rekurze a join v jednom dotazu, rychlé čtení (0,15–0,2 s), funguje i pro „vidí moje oddělení“ | data jsou stará do další synchronizace (spouští Spravce; plánovač ❓ neimplementován); `User.Read.All` čte celý adresář | Graph app role `User.Read.All` pro identitu API (Global/Privileged Role Admin); **správně vyplněné `department` a `manager` v Entra** | nízká, pokud IT drží Entra data |
| B. Graph živě při každém dotazu (`/me/directReports`, transitivně) | ❓ nezkoušeno | vždy aktuální | N volání Graphu na dotaz, pomalejší; oddělení autorů by se stejně muselo ukládat k žádosti | totéž | střední |
| C. `groups` claim v tokenu (skupina = oddělení/tým) | ✅ claim funguje: po `groupMembershipClaims=SecurityGroup` nese token tomase `groups: ["6f9cfe74-…"]` (skupina `zr-zamestnanci`); API ho zatím nepoužívá, nastavení jsem vrátil na `null` ([24-groups-claim.log](prava-db/24-groups-claim.log)) | bez Graphu, bez synchronizace, skupiny spravuje IT | jen GUID, ne názvy; nadřízeného nevyjádří; nad 200 skupin přijde místo seznamu odkaz na Graph (overage 📘) | skupina na oddělení (nebo dynamické skupiny podle `department`), zapnutí claimu na registraci API | nízká |
| D. `department` přímo v tokenu | ✅ **nejde bez dalšího**: claim chybí i po zapnutí skupin (tamtéž, `department: null`); optional claims v2 ho nenabízejí 📘, zbývá claims mapping policy | – | claims mapping policy na aplikaci vyžaduje vlastní podpisový klíč nebo `acceptMappedClaims` 📘, nezkoušeno | Global Admin | vysoká |
| E. Ruční tabulka oddělení v SQL (bez Entra) | ❓ nezkoušeno (stačí naplnit `dbo.OrgUzivatel` jinak) | funguje, i když Entra data nejsou vyplněná | ruční údržba, rozjede se s realitou | nic | nízká, ale pracná |

Doporučení (stojí na ✅): **A**, pokud má E.ON v Entra spolehlivě `department` a `manager` (ověřit u IT ⛔). Jinak C se skupinou na oddělení
(nadřízený pak musí být v SQL ručně, tj. E).

### Co jsem změnil v labu (4.3 B)

- Entra: nadřízený `tomas.prochazka → jakub.kucera` (dosud nikdo nadřízeného neměl); app role `Zadavatel` na `egd-sonda-data-api`
  pro `karolina.mala` a `ondrej.horak` (ondřej se do testu nedostal, v `lab.secrets.json` má heslo pod klíčem `ondrej.horakk`);
  Graph app role `User.Read.All` pro `id-egd-data-sp`; `groupMembershipClaims` krátce `SecurityGroup` a pak zpět `null`.
- Azure: image `egd-sonda-data-api:0.3`, revize `--0000004`. **Incident**: první pokus o 0.3 nasadil neexistující image (OrbStack byl
  zastavený, build selhal, deploy nebyl podmíněný). API bylo několik minut mimo provoz (délka neměřena), vráceno nasazením 0.2 ([22a-rollback-0.2.log](prava-db/22a-rollback-0.2.log)).
  Log prvního pokusu přepsal úspěšný `22-deploy-0.3.log`. `tools/prava-db-deploy.sh` teď nejdřív ověří, že image v ACR je (jinak exit 3).
  OrbStack jsem spustil jen na build a zase zastavil.
- SQL: tabulka `dbo.OrgUzivatel` (65 řádků), žádosti `org-…` Id 9–11 a další z regrese.

### Neověřeno (4.3 B)

| Tvrzení | Důvod | Návrh ověření |
|---|---|---|
| Nepřímí podřízení (víc úrovní) | v labu jen jedna úroveň (tomas → jakub) | nastavit `ondrej → tomas`, opravit klíč hesla, opakovat `prava-db-org-test.py` |
| Kolega ze stejného oddělení, který není nadřízený ani Schvalovatel | ondřej bez hesla; v testu jen „podřízený nevidí nadřízeného“ (tomas jakubovu ne ✅) | totéž |
| Automatická synchronizace (plánovač, Job) | neimplementováno | Container Apps Job s cronem, nebo synchronizace při startu |
| Kvalita `department`/`manager` v Entra E.ON | ⛔ jen v E.ON | `GET /users?$select=department&$expand=manager` pod účtem IT na vzorku |
| Varianty B, D, E | nezkoušeno | viz tabulka |

## Co chce od IT E.ON

0. Pro práva podle oddělení a nadřízeného: Graph app role `User.Read.All` pro identitu API a vyplněné `department` + `manager` v Entra (nebo skupiny na oddělení).
1. Azure: user-assigned managed identity v RG appky (nebo právo ji založit) a právo přiřadit ji k Container App.
2. Entra: app role **`Sites.Selected` na „Office 365 SharePoint Online“** pro tuto identitu (Privileged Role Admin / Global Admin).
3. SharePoint: grant `fullcontrol` pro clientId identity na **konkrétní** web (`POST /sites/{id}/permissions`, umí SharePoint/Global Admin nebo appka s `Sites.FullControl.All`).
4. Entra: registrace API s app rolemi a jejich přiřazení lidem/skupinám (jako dosud v cestě C), souhlas správce pro `webApiPermissionRequests` SPFx balíčku.
5. CORS na API pro `https://<tenant>.sharepoint.com` (děláme my skriptem).
6. Rozhodnutí, zda je „appka smí na jednom webu vše (fullcontrol)“ přijatelné; menší role `ManagePermissions` přes `Sites.Selected` nejde 📘.

## Co jsem v labu vytvořil nebo změnil

| Zdroj | Detail |
|---|---|
| Azure | UAMI `id-egd-data-sp` (clientId `ee4fc785-219b-4c3e-b346-72891ada0b52`) v `rg-egd-sonda-data-prava`, přiřazená k `ca-egd-data-api`; nová revize `ca-egd-data-api--0000001` s image `egd-sonda-data-api:0.2` (cizí ACR `acrppfroomsca3lbgs`), env `SP_*`, CORS. Min. repliky 0, nic trvale placeného (UAMI je zdarma) |
| Entra | app role `Sites.Selected` (SharePoint) pro `id-egd-data-sp`; grant `access_as_user` pro „SharePoint Online Web Client Extensibility“ na `egd-sonda-data-api`; **rozšířen delegovaný grant `m365-cli-spfx-lab` → Graph o `Sites.FullControl.All`** (Principal, pavel.admin; vratné PATCHem na `User.Read`) |
| SharePoint | grant `fullcontrol` pro `id-egd-data-sp` na `/sites/egd-sonda-data-prava`; seznam `Sdileni` (položky 1–6 jsou testovací, 2/4/6 s unikátními právy); app `egd-prava-db` v tenant app catalogu, nainstalovaná na web; stránka `SitePages/prava-db.aspx` |
| SQL | testovací žádosti z regresních běhů (`overeni-tomas`, `overeni-jakub`, Id 5–8) |

Nic jsem nemazal (rozbité `node_modules` kopie jsou v koši).

## Neověřeno (mezistav, důvod a návrh ověření)

| Tvrzení | Důvod | Návrh ověření |
|---|---|---|
| `Sites.Selected` s rolí `manage`/`write` na `breakroleinheritance` nestačí | nezkoušeno (zvolen rovnou `fullcontrol`) | změnit grant na `manage`, opakovat `prava-db-test.py test`, čekat 403/502 |
| System-assigned MI, appka s certifikátem, MI s `Sites.FullControl.All`, Power Automate | nezkoušeno | stejný test s jinou identitou |
| Rozklad 26,9 s prvního volání z prohlížeče (token vs. studený start) | jedno měření | dvakrát po sobě v nové relaci se zahřátým API |
| `m365 … permissionrequest approve` 403 – příčina | nezkoumáno | `--debug`, jiný účet s rolí SharePoint Admin |
| Totéž v tenantu E.ON (podmíněný přístup, politika Sites.Selected) | ⛔ jen v E.ON | stejné skripty pod účtem IT E.ON |
| Limit unikátních ACL v seznamu (5000 / 50 000) | jen 📘 | viz [../data-prava.md](../data-prava.md) |

## Znovupoužitelné nástroje (řádky do `tools/README.md` doplní hlavní session)

| Nástroj | Co dělá |
|---|---|
| `tools/prava-db-identita.sh` | UAMI + přiřazení k Container App + `Sites.Selected` (SharePoint) + `fullcontrol` na jeden web; idempotentní, `--help` |
| `tools/prava-db-deploy.sh` | nová image DB API + env `SP_*` + CORS pro origin SharePointu; `--help` |
| `tools/prava-db-test.py` | `setup` seznamu `Sdileni`, `test` scénáře A/B/C/Spravce (JSON řádky s očekávaným kódem a `sedi`); `--help` |
| `tools/prava-db-org-setup.sh` | nadřízený v Entra, app role API pro další uživatele, Graph `User.Read.All` pro identitu API; idempotentní, `--help` |
| `tools/prava-db-org-test.py` | test „nadřízený vidí podřízené, jiné oddělení ne, Schvalovatel své oddělení“ nad `/api/zadosti/tym`; `--help` |

## Soubory

- Tento dokument: `sondy/container-app/prava-db.md`; důkazy: `sondy/container-app/prava-db/` (01–16)
- Kód API: `sondy/data-prava/api/server.mjs` (v0.2), web part: `sondy/container-app/prava-db/spfx/`
- Neplatné pokusy ponechány: `08a-…` (chyba testu: mezera v URL), `08b-…` (PATCH bez `If-Match` → 412), `10a-npm-ci.log` (ENOSPC)
