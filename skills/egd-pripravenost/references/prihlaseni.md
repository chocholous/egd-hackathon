# Přihlášení CLI for Microsoft 365 v tenantu E.ON

## Fakta

| Fakt | Stav |
|---|---|
| Tenant E.ON (doména `egd.cz`) = `b914a242-e718-443b-a47c-6b4c649d8c0a` | ✅ veřejný OIDC endpoint `login.microsoftonline.com/egd.cz/v2.0/.well-known/openid-configuration`, 22. 11. 2026 |
| SharePoint E.ON = `eonos.sharepoint.com` | ✅ odpovídá (bez přihlášení HTTP 403) |
| CLI 11 i 12 vyžaduje appId (`--appId`, konfigurace nebo proměnná `CLIMICROSOFT365_ENTRAAPPID`) | 📘 `m365 login --help remarks` (CLI 12.0.0) |
| Výchozí `authType` je `deviceCode`; pro člověka je druhá možnost `browser` | 📘 tamtéž |
| `m365 setup` umí založit registraci aplikace (přihlásí se jako Azure CLI a vytvoří ji) | 📘 `m365 setup --help full` |
| Existuje v E.ON už schválená aplikace pro CLI / PnP? | ❓ zeptat se IT |
| Smí běžný uživatel v E.ON registrovat aplikace a dát si souhlas? | ❓ nejspíš ne |
| Blokuje Conditional Access v E.ON device code? | ⛔ jen E.ON; v labu nejde. Ověření: `varianty` a první pokus o přihlášení, AADSTS53003/50097 |
| Aplikace se souhlasem správce u E.ON (pro `spo app add`) | ⛔ jen E.ON; zdroj: mail E.ON 12. 11. (SHO-5032) mluví jen o app catalogu, ne o appId |
| Přihlášení CLI v labu | ✅ pod `pavel.admin`; pod `egd01` do 24. 11. AADSTS65001, od 24. 11. (souhlas správce pro celý tenant v labu) prošel login i zápisy účastník `egd10` ✅ (E2E zpráva, neověřoval jsem sám); běžný uživatel bez admina: „Need admin approval“ (politika souhlasu tenantu `microsoft-user-default-low` nepokrývá `AllSites.FullControl` / `Sites.FullControl.All`) ✅ 24. 11. – bez souhlasu správce pro appId se CLI nepřihlásí, proto je „appId od IT se souhlasem správce“ položka, kterou má účastník mít od IT před workshopem, a mezitím jede cesta A3 / A2; AADSTS700016 ✅ |

## Možnosti appId (od nejjednodušší pro účastníka; celý žebřík je v [zebrik.md](zebrik.md))

1. **appId od IT** – aplikace už registrovaná v tenantu E.ON se souhlasem správce:
   `node "<S>" prihlaseni-prikaz --appId <id>`.
2. **Nová registrace přes ServiceNow** (věta níže). Co musí mít: delegovaná oprávnění
   **SharePoint `AllSites.FullControl`** (oprávnění lab aplikace, se kterým nasazení v labu prošlo ✅; že je to **nejmenší** potřebné oprávnění, není ověřeno ❓ – IT může zvolit jiné, věta ho proto jen navrhuje) a
   **Microsoft Graph `User.Read`**, souhlas správce, zapnuté **Allow public client flows** (device code)
   a pro `--authType browser` redirect URI `http://localhost` typu „Mobile and desktop applications“ ❓.
3. **`m365 setup`** – založí registraci sám, ale je to **zápis do Entra ID E.ON**. Jen se svolením IT,
   ne na vlastní pěst; v E.ON nejspíš skončí na právech ❓.
4. **Bez CLI** (když do středy nic z toho nevyjde): SharePoint jde ověřit v prohlížeči (příkaz
   `prohlizec`); první appka pak bude bez nasazování kódu (seznam + formátování), nebo s ručním
   nahráním `.sppkg` do katalogu v prohlížeči (tak to EG.D už jednou udělala).

## Registrace Authenticatoru (MFA) – může zastavit první přihlášení

Po zadání hesla se může objevit obrazovka „Let's keep your account secure“ s výzvou nainstalovat Microsoft Authenticator.
Pokud ji uvidíš, zvol **„Set up a different authentication app“** a zaregistruj libovolnou TOTP aplikaci (Microsoft
Authenticator, Google Authenticator, 1Password), nebo zavolej lektora: přeskočit ji nejde.

Fakta z labu: skupina účastníků je
vyjmutá z CA politiky MFA a výzva je registrační nastavení mimo CA. U `egd01` přišla ve 3 z 6 přihlášení (první běh) a v 0 z 6
(druhý běh). V E.ON se to může stát také ⛔.

Nejde-li to ani tak, věta pro IT: „Prosím o dokončení registrace vícefaktorového ověření (MFA) pro můj účet, přihlášení do Microsoft 365 se zastavuje na registraci Microsoft Authenticator.“

## Věty pro ServiceNow

Doplň `<…>`. Jedna věta = jeden požadavek.

- **appId:** „Prosím o appId registrované aplikace v Entra ID tenantu E.ON, přes kterou se smím přihlásit
  nástrojem CLI for Microsoft 365 (device code) k SharePointu; delegovaná oprávnění pro SharePoint a Microsoft Graph podle potřeby CLI (v labu fungovalo SharePoint AllSites.FullControl a Graph User.Read; minimum určí IT) se souhlasem správce a povolené public client flows.
  Účel: nasazování SharePoint Framework aplikací na můj web <URL> (workshop EG.D).“
- **Souhlas pro existující appId (AADSTS65001 / 90094 / 90095):** „Prosím o udělení souhlasu správce
  (admin consent) pro aplikaci s appId <appId> v tenantu E.ON pro delegovaná oprávnění, která CLI for Microsoft 365
  potřebuje (SharePoint a Microsoft Graph User.Read; v labu AllSites.FullControl, minimum určí IT).“
- **Public client flows (AADSTS7000218):** „Prosím o zapnutí Allow public client flows u registrace aplikace
  <appId> (přihlášení CLI for Microsoft 365 metodou device code).“
- **Conditional Access (AADSTS53003 / 50097):** „Prosím o postup nebo výjimku pro přihlášení nástroje CLI for
  Microsoft 365 k SharePointu z mého firemního počítače; přihlášení blokuje Conditional Access (kód <AADSTS…>).“
