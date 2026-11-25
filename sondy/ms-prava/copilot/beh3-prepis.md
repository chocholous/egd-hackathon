# Copilot CLI Session

> [!NOTE]
> - **Session ID:** `63bf6377-6483-40ac-a5b9-6d41dd01cc7f`  
> - **Started:** 11/23/2026, 11:05:12 AM  
> - **Duration:** 4m 13s  
> - **Exported:** 11/23/2026, 11:09:26 AM  

---

<sub>2s</sub>

### Info

Copilot Fusion selected GPT-6 Luna because it was the best choice out of the models available in your plan.

---

<sub>2s</sub>

### User

Jsem vlastník webu https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava. Na seznamu PozadavkyCopilot3 nastav role pro appku s názvem Nákupy: zadavatelka jana.svobodova@pavelchocholousgmail.onmicrosoft.com, schvalovatel tomas.prochazka@pavelchocholousgmail.onmicrosoft.com, schvalovatel nesmí mazat. Zadavatel vidí jen své, schvalovatel všechno. Úrovně oprávnění pro tuhle appku založ nové a pojmenuj je s předponou Nákupy (stávající úrovně EGD nepoužívej). Udělej to sám přes m365 CLI (jsem přihlášený), nic nemaž a na konci ověř nastavení. Souhlasím se zápisem.

---

<sub>5s</sub>

### `skill`

**egd-prava-role**

<details>
<summary>Arguments</summary>

```json
{
  "skill": "egd-prava-role"
}
```

</details>

```
Skill "egd-prava-role" loaded successfully. Follow the instructions in the skill context.
```


---

<sub>8s</sub>

### Copilot

Nejprve ověřím přihlášený účet a skript pro role; pak nastavím pouze seznam a nové úrovně „Nákupy“ a načtu zpět výsledná oprávnění.

---

<sub>9s</sub>

### `bash`

**Ověření přihlášení M365 CLI**

`$ m365 status --output json`

<details>
<summary>9 lines</summary>

```
{
  "connectionName": "3b095dc0-5542-4cd1-8ff2-5d1ca41c7cca",
  "connectedAs": "pavel.admin@pavelchocholousgmail.onmicrosoft.com",
  "authType": "deviceCode",
  "appId": "12f19539-b70a-499d-b6dc-517a32c0e904",
  "appTenant": "972a674c-7b85-4e56-a31f-b2f95b42fd1e",
  "cloudType": "Public"
}
<shellId: 1 completed with exit code 0>
```

</details>


---

<sub>8s</sub>

### `view` — Failed

**view the file at /private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/8ec15af4-f174-4d61-b85a-55075ed615ce/scratchpad/cop3/home/egd-workshop/tools/prava-role-cli.sh.**

`/private/tmp/claude-501/-Users-chocholous-Projects-egd-workshop/8ec15af4-f174-4d61-b85a-55075ed615ce/scratchpad/cop3/home/egd-workshop/tools/prava-role-cli.sh`

```
Path does not exist
```


---

<sub>8s</sub>

### `bash`

**Kontrola pracovní složky**

`$ ls -la`

```
total 0
drwxr-xr-x@ 2 chocholous  wheel   64 Nov 23 11:04 .
drwxr-xr-x@ 9 chocholous  wheel  288 Nov 23 11:05 ..
<shellId: 0 completed with exit code 0>
```


---

<sub>15s</sub>

### `bash`

**Načtení skupin a metadat webu**

`$ m365 spo web get --url https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --withGroups --output json`

<details>
<summary>120 lines</summary>

```
{
  "AssociatedMemberGroup": {
    "Id": 5,
    "IsHiddenInUI": false,
    "LoginName": "Členové webu EGD sonda ms-prava",
    "Title": "Členové webu EGD sonda ms-prava",
    "PrincipalType": 8,
    "AllowMembersEditMembership": true,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": false,
    "OwnerTitle": "Vlastníci webu EGD sonda ms-prava",
    "RequestToJoinLeaveEmailSetting": ""
  },
  "AssociatedOwnerGroup": {
    "Id": 3,
    "IsHiddenInUI": false,
    "LoginName": "Vlastníci webu EGD sonda ms-prava",
    "Title": "Vlastníci webu EGD sonda ms-prava",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": false,
    "OwnerTitle": "Vlastníci webu EGD sonda ms-prava",
    "RequestToJoinLeaveEmailSetting": ""
  },
  "AssociatedVisitorGroup": {
    "Id": 4,
    "IsHiddenInUI": false,
    "LoginName": "Návštěvníci webu EGD sonda ms-prava",
    "Title": "Návštěvníci webu EGD sonda ms-prava",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": false,
    "OwnerTitle": "Vlastníci webu EGD sonda ms-prava",
    "RequestToJoinLeaveEmailSetting": ""
  },
  "AllowRssFeeds": true,
  "AlternateCssUrl": "",
  "AppInstanceId": "00000000-0000-0000-0000-000000000000",
  "ClassicWelcomePage": null,
  "Configuration": 0,
  "Created": "2026-11-22T18:54:22.723",
  "CurrentChangeToken": {
    "StringValue": "1;2;0073c481-9b23-45c9-9b98-38a40d8f3607;639310251279800000;1478503940"
  },
  "CustomMasterUrl": "/sites/egd-sonda-ms-prava/_catalogs/masterpage/seattle.master",
  "Description": "",
  "DesignPackageId": "00000000-0000-0000-0000-000000000000",
  "DocumentLibraryCalloutOfficeWebAppPreviewersDisabled": false,
  "EnableMinimalDownload": false,
  "FontOptionForSiteFooterNav": null,
  "FontOptionForSiteFooterTitle": null,
  "FontOptionForSiteNav": null,
  "FontOptionForSiteTitle": null,
  "FooterAlignment": 0,
  "FooterBackgroundFocalPoint": null,
  "FooterBlur": 0,
  "FooterColorIndexInDarkMode": -1,
  "FooterColorIndexInLightMode": -1,
  "FooterEmphasis": 0,
  "FooterEnabled": true,
  "FooterLayout": 0,
  "FooterOverlayColor": -1,
  "FooterOverlayGradientDirection": 0,
  "FooterOverlayOpacity": 0,
  "HasFooterBackgroundImage": false,
  "HasHeaderBackgroundImage": false,
  "HeaderColorIndexInDarkMode": -1,
  "HeaderColorIndexInLightMode": -1,
  "HeaderEmphasis": 0,
  "HeaderLayout": 2,
  "HeaderOverlayColor": -1,
  "HeaderOverlayGradientDirection": 0,
  "HeaderOverlayOpacity": 0,
  "HideTitleInHeader": false,
  "HorizontalQuickLaunch": false,
  "Id": "0073c481-9b23-45c9-9b98-38a40d8f3607",
  "IsEduClass": false,
  "IsEduClassProvisionChecked": false,
  "IsEduClassProvisionPending": false,
  "IsHomepageModernized": false,
  "IsMultilingual": true,
  "IsRevertHomepageLinkHidden": false,
  "Language": 1029,
  "LastItemModifiedDate": "2026-11-23T10:04:49Z",
  "LastItemUserModifiedDate": "2026-11-23T10:04:49Z",
  "LogoAlignment": 0,
  "MasterUrl": "/sites/egd-sonda-ms-prava/_catalogs/masterpage/seattle.master",
  "MegaMenuEnabled": true,
  "NavAudienceTargetingEnabled": false,
  "NoCrawl": false,
  "ObjectCacheEnabled": false,
  "OverwriteTranslationsOnChange": false,
  "ResourcePath": {
    "DecodedUrl": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava"
  },
  "QuickLaunchEnabled": true,
  "RecycleBinEnabled": true,
  "SearchScope": 0,
  "ServerRelativeUrl": "/sites/egd-sonda-ms-prava",
  "ShouldExtendHeaderBgImageToNav": "",
  "SiteLogoUrl": null,
  "SyndicationEnabled": true,
  "TenantAdminMembersCanShare": 0,
  "Title": "EGD sonda ms-prava",
  "TreeViewEnabled": false,
  "UIVersion": 15,
  "UIVersionConfigurationEnabled": false,
  "Url": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava",
  "WebTemplate": "SITEPAGEPUBLISHING",
  "WelcomePage": "SitePages/Home.aspx"
}
<shellId: 2 completed with exit code 0>
```

</details>


---

<sub>15s</sub>

### `bash`

**Načtení nastavení seznamu**

`$ m365 spo list get --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --title PozadavkyCopilot3 --properties "Id,Title,ReadSecurity,WriteSecurity,HasUniqueRoleAssignments" --output json`

<details>
<summary>8 lines</summary>

```
{
  "HasUniqueRoleAssignments": false,
  "Id": "758c9685-041d-4127-b568-7a84d80a729f",
  "ReadSecurity": 1,
  "Title": "PozadavkyCopilot3",
  "WriteSecurity": 1
}
<shellId: 3 completed with exit code 0>
```

</details>


---

<sub>15s</sub>

### `bash`

**Načtení stávajících úrovní oprávnění**

`$ m365 spo roledefinition list --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --output json`

<details>
<summary>388 lines</summary>

```
[
  {
    "BasePermissions": {
      "High": 2147483647,
      "Low": 4294967295
    },
    "Description": "Umožňuje úplné řízení.",
    "Hidden": false,
    "Id": 1073741829,
    "Name": "Úplné řízení",
    "Order": 1,
    "RoleTypeKind": 5,
    "BasePermissionsValue": [
      "ViewListItems",
      "AddListItems",
      "EditListItems",
      "DeleteListItems",
      "ApproveItems",
      "OpenItems",
      "ViewVersions",
      "DeleteVersions",
      "CancelCheckout",
      "ManagePersonalViews",
      "ManageLists",
      "ViewFormPages",
      "AnonymousSearchAccessList",
      "Open",
      "ViewPages",
      "AddAndCustomizePages",
      "ApplyThemeAndBorder",
      "ApplyStyleSheets",
      "ViewUsageData",
      "CreateSSCSite",
      "ManageSubwebs",
      "CreateGroups",
      "ManagePermissions",
      "BrowseDirectories",
      "BrowseUserInfo",
      "AddDelPrivateWebParts",
      "UpdatePersonalWebParts",
      "ManageWeb",
      "AnonymousSearchAccessWebLists",
      "UseClientIntegration",
      "UseRemoteAPIs",
      "ManageAlerts",
      "CreateAlerts",
      "EditMyUserInfo",
      "EnumeratePermissions"
    ],
    "RoleTypeKindValue": "Administrator"
  },
  {
    "BasePermissions": {
      "High": 432,
      "Low": 1012866047
    },
    "Description": "Umožňuje zobrazit, přidat, aktualizovat, odstranit, schválit a upravit položky.",
    "Hidden": false,
    "Id": 1073741828,
    "Name": "Návrh",
    "Order": 32,
    "RoleTypeKind": 4,
    "BasePermissionsValue": [
      "ViewListItems",
      "AddListItems",
      "EditListItems",
      "DeleteListItems",
      "ApproveItems",
      "OpenItems",
      "ViewVersions",
      "DeleteVersions",
      "CancelCheckout",
      "ManagePersonalViews",
      "ManageLists",
      "ViewFormPages",
      "Open",
      "ViewPages",
      "AddAndCustomizePages",
      "ApplyThemeAndBorder",
      "ApplyStyleSheets",
      "CreateSSCSite",
      "BrowseDirectories",
      "BrowseUserInfo",
      "AddDelPrivateWebParts",
      "UpdatePersonalWebParts",
      "UseClientIntegration",
      "UseRemoteAPIs",
      "CreateAlerts",
      "EditMyUserInfo"
    ],
    "RoleTypeKindValue": "WebDesigner"
  },
  {
    "BasePermissions": {
      "High": 432,
      "Low": 1011030767
    },
    "Description": "Umožňuje přidávat, upravovat a odstraňovat seznamy. Taky umožňuje zobrazovat, přidávat, aktualizovat a odstraňovat položky seznamů a dokumenty.",
    "Hidden": false,
    "Id": 1073741830,
    "Name": "Úpravy",
    "Order": 48,
    "RoleTypeKind": 6,
    "BasePermissionsValue": [
      "ViewListItems",
      "AddListItems",
      "EditListItems",
      "DeleteListItems",
      "OpenItems",
      "ViewVersions",
      "DeleteVersions",
      "ManagePersonalViews",
      "ManageLists",
      "ViewFormPages",
      "Open",
      "ViewPages",
      "CreateSSCSite",
      "BrowseDirectories",
      "BrowseUserInfo",
      "AddDelPrivateWebParts",
      "UpdatePersonalWebParts",
      "UseClientIntegration",
      "UseRemoteAPIs",
      "CreateAlerts",
      "EditMyUserInfo"
    ],
    "RoleTypeKindValue": "Editor"
  },
  {
    "BasePermissions": {
      "High": 432,
      "Low": 1011028719
    },
    "Description": "Umožňuje zobrazit, přidat, aktualizovat či odstranit položky seznamu a dokumenty.",
    "Hidden": false,
    "Id": 1073741827,
    "Name": "Přispívání",
    "Order": 64,
    "RoleTypeKind": 3,
    "BasePermissionsValue": [
      "ViewListItems",
      "AddListItems",
      "EditListItems",
      "DeleteListItems",
      "OpenItems",
      "ViewVersions",
      "DeleteVersions",
      "ManagePersonalViews",
      "ViewFormPages",
      "Open",
      "ViewPages",
      "CreateSSCSite",
      "BrowseDirectories",
      "BrowseUserInfo",
      "AddDelPrivateWebParts",
      "UpdatePersonalWebParts",
      "UseClientIntegration",
      "UseRemoteAPIs",
      "CreateAlerts",
      "EditMyUserInfo"
    ],
    "RoleTypeKindValue": "Contributor"
  },
  {
    "BasePermissions": {
      "High": 176,
      "Low": 138612833
    },
    "Description": "Umožňuje zobrazit stránky a položky seznamu a stáhnout dokumenty.",
    "Hidden": false,
    "Id": 1073741826,
    "Name": "Čtení",
    "Order": 128,
    "RoleTypeKind": 2,
    "BasePermissionsValue": [
      "ViewListItems",
      "OpenItems",
      "ViewVersions",
      "ViewFormPages",
      "Open",
      "ViewPages",
      "CreateSSCSite",
      "BrowseUserInfo",
      "UseClientIntegration",
      "UseRemoteAPIs",
      "CreateAlerts"
    ],
    "RoleTypeKindValue": "Reader"
  },
  {
    "BasePermissions": {
      "High": 48,
      "Low": 134287360
    },
    "Description": "Po udělení příslušných oprávnění umožňuje zobrazit určité seznamy, knihovny dokumentů a položky seznamu.",
    "Hidden": true,
    "Id": 1073741825,
    "Name": "Omezený přístup",
    "Order": 160,
    "RoleTypeKind": 1,
    "BasePermissionsValue": [
      "ViewFormPages",
      "Open",
      "BrowseUserInfo",
      "UseClientIntegration",
      "UseRemoteAPIs"
    ],
    "RoleTypeKindValue": "Guest"
  },
  {
    "BasePermissions": {
      "High": 432,
      "Low": 1011028975
    },
    "Description": "",
    "Hidden": false,
    "Id": 1073741924,
    "Name": "EGD Schvalovatel",
    "Order": 2147483647,
    "RoleTypeKind": 0,
    "BasePermissionsValue": [
      "ViewListItems",
      "AddListItems",
      "EditListItems",
      "DeleteListItems",
      "OpenItems",
      "ViewVersions",
      "DeleteVersions",
      "CancelCheckout",
      "ManagePersonalViews",
      "ViewFormPages",
      "Open",
      "ViewPages",
      "CreateSSCSite",
      "BrowseDirectories",
      "BrowseUserInfo",
      "AddDelPrivateWebParts",
      "UpdatePersonalWebParts",
      "UseClientIntegration",
      "UseRemoteAPIs",
      "CreateAlerts",
      "EditMyUserInfo"
    ],
    "RoleTypeKindValue": "None"
  },
  {
    "BasePermissions": {
      "High": 432,
      "Low": 1011028719
    },
    "Description": "",
    "Hidden": false,
    "Id": 1073741925,
    "Name": "EGD Zadavatel",
    "Order": 2147483647,
    "RoleTypeKind": 0,
    "BasePermissionsValue": [
      "ViewListItems",
      "AddListItems",
      "EditListItems",
      "DeleteListItems",
      "OpenItems",
      "ViewVersions",
      "DeleteVersions",
      "ManagePersonalViews",
      "ViewFormPages",
      "Open",
      "ViewPages",
      "CreateSSCSite",
      "BrowseDirectories",
      "BrowseUserInfo",
      "AddDelPrivateWebParts",
      "UpdatePersonalWebParts",
      "UseClientIntegration",
      "UseRemoteAPIs",
      "CreateAlerts",
      "EditMyUserInfo"
    ],
    "RoleTypeKindValue": "None"
  },
  {
    "BasePermissions": {
      "High": 432,
      "Low": 1011028967
    },
    "Description": "",
    "Hidden": false,
    "Id": 1073741926,
    "Name": "EGD Schvalovatel bez mazání",
    "Order": 2147483647,
    "RoleTypeKind": 0,
    "BasePermissionsValue": [
      "ViewListItems",
      "AddListItems",
      "EditListItems",
      "OpenItems",
      "ViewVersions",
      "DeleteVersions",
      "CancelCheckout",
      "ManagePersonalViews",
      "ViewFormPages",
      "Open",
      "ViewPages",
      "CreateSSCSite",
      "BrowseDirectories",
      "BrowseUserInfo",
      "AddDelPrivateWebParts",
      "UpdatePersonalWebParts",
      "UseClientIntegration",
      "UseRemoteAPIs",
      "CreateAlerts",
      "EditMyUserInfo"
    ],
    "RoleTypeKindValue": "None"
  },
  {
    "BasePermissions": {
      "High": 432,
      "Low": 1011028719
    },
    "Description": "",
    "Hidden": false,
    "Id": 1073741927,
    "Name": "EGD Zadavatel CLI2",
    "Order": 2147483647,
    "RoleTypeKind": 0,
    "BasePermissionsValue": [
      "ViewListItems",
      "AddListItems",
      "EditListItems",
      "DeleteListItems",
      "OpenItems",
      "ViewVersions",
      "DeleteVersions",
      "ManagePersonalViews",
      "ViewFormPages",
      "Open",
      "ViewPages",
      "CreateSSCSite",
      "BrowseDirectories",
      "BrowseUserInfo",
      "AddDelPrivateWebParts",
      "UpdatePersonalWebParts",
      "UseClientIntegration",
      "UseRemoteAPIs",
      "CreateAlerts",
      "EditMyUserInfo"
    ],
    "RoleTypeKindValue": "None"
  },
  {
    "BasePermissions": {
      "High": 432,
      "Low": 1011028975
    },
    "Description": "",
    "Hidden": false,
    "Id": 1073741928,
    "Name": "EGD Schvalovatel CLI2",
    "Order": 2147483647,
    "RoleTypeKind": 0,
    "BasePermissionsValue": [
      "ViewListItems",
      "AddListItems",
      "EditListItems",
      "DeleteListItems",
      "OpenItems",
      "ViewVersions",
      "DeleteVersions",
      "CancelCheckout",
      "ManagePersonalViews",
      "ViewFormPages",
      "Open",
      "ViewPages",
      "CreateSSCSite",
      "BrowseDirectories",
      "BrowseUserInfo",
      "AddDelPrivateWebParts",
      "UpdatePersonalWebParts",
      "UseClientIntegration",
      "UseRemoteAPIs",
      "CreateAlerts",
      "EditMyUserInfo"
    ],
    "RoleTypeKindValue": "None"
  }
]
<shellId: 4 completed with exit code 0>
```

</details>


---

<sub>15s</sub>

### `bash`

**Načtení skupin webu**

`$ m365 spo group list --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --output json`

<details>
<summary>213 lines</summary>

```
[
  {
    "Id": 30,
    "IsHiddenInUI": false,
    "LoginName": "CLI2 Schvalovatelé",
    "Title": "CLI2 Schvalovatelé",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": true,
    "OwnerTitle": "Pavel Admin (lab)",
    "RequestToJoinLeaveEmailSetting": null
  },
  {
    "Id": 31,
    "IsHiddenInUI": false,
    "LoginName": "CLI2 Správci",
    "Title": "CLI2 Správci",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": true,
    "OwnerTitle": "Pavel Admin (lab)",
    "RequestToJoinLeaveEmailSetting": null
  },
  {
    "Id": 29,
    "IsHiddenInUI": false,
    "LoginName": "CLI2 Zadavatelé",
    "Title": "CLI2 Zadavatelé",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": true,
    "OwnerTitle": "Pavel Admin (lab)",
    "RequestToJoinLeaveEmailSetting": null
  },
  {
    "Id": 25,
    "IsHiddenInUI": false,
    "LoginName": "CLI Návrh",
    "Title": "CLI Návrh",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": true,
    "OwnerTitle": "Pavel Admin (lab)",
    "RequestToJoinLeaveEmailSetting": null
  },
  {
    "Id": 23,
    "IsHiddenInUI": false,
    "LoginName": "CLI Schvalovatelé",
    "Title": "CLI Schvalovatelé",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": true,
    "OwnerTitle": "Pavel Admin (lab)",
    "RequestToJoinLeaveEmailSetting": null
  },
  {
    "Id": 24,
    "IsHiddenInUI": false,
    "LoginName": "CLI Správci",
    "Title": "CLI Správci",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": true,
    "OwnerTitle": "Pavel Admin (lab)",
    "RequestToJoinLeaveEmailSetting": null
  },
  {
    "Id": 20,
    "IsHiddenInUI": false,
    "LoginName": "CLI Zadavatelé",
    "Title": "CLI Zadavatelé",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": true,
    "OwnerTitle": "Pavel Admin (lab)",
    "RequestToJoinLeaveEmailSetting": null
  },
  {
    "Id": 28,
    "IsHiddenInUI": false,
    "LoginName": "Copilot Schvalovatelé",
    "Title": "Copilot Schvalovatelé",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": "Schvalovatelé aplikace Copilot",
    "OnlyAllowMembersViewMembership": true,
    "OwnerTitle": "Pavel Admin (lab)",
    "RequestToJoinLeaveEmailSetting": null
  },
  {
    "Id": 27,
    "IsHiddenInUI": false,
    "LoginName": "Copilot Zadavatelé",
    "Title": "Copilot Zadavatelé",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": "Zadavatelé aplikace Copilot",
    "OnlyAllowMembersViewMembership": true,
    "OwnerTitle": "Pavel Admin (lab)",
    "RequestToJoinLeaveEmailSetting": null
  },
  {
    "Id": 5,
    "IsHiddenInUI": false,
    "LoginName": "Členové webu EGD sonda ms-prava",
    "Title": "Členové webu EGD sonda ms-prava",
    "PrincipalType": 8,
    "AllowMembersEditMembership": true,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": false,
    "OwnerTitle": "Vlastníci webu EGD sonda ms-prava",
    "RequestToJoinLeaveEmailSetting": ""
  },
  {
    "Id": 13,
    "IsHiddenInUI": false,
    "LoginName": "Evidence Schvalovatelé",
    "Title": "Evidence Schvalovatelé",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": "",
    "OnlyAllowMembersViewMembership": true,
    "OwnerTitle": "Malá Karolína",
    "RequestToJoinLeaveEmailSetting": null
  },
  {
    "Id": 14,
    "IsHiddenInUI": false,
    "LoginName": "Evidence Správci",
    "Title": "Evidence Správci",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": "",
    "OnlyAllowMembersViewMembership": true,
    "OwnerTitle": "Malá Karolína",
    "RequestToJoinLeaveEmailSetting": null
  },
  {
    "Id": 12,
    "IsHiddenInUI": false,
    "LoginName": "Evidence Zadavatelé",
    "Title": "Evidence Zadavatelé",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": "",
    "OnlyAllowMembersViewMembership": true,
    "OwnerTitle": "Malá Karolína",
    "RequestToJoinLeaveEmailSetting": null
  },
  {
    "Id": 4,
    "IsHiddenInUI": false,
    "LoginName": "Návštěvníci webu EGD sonda ms-prava",
    "Title": "Návštěvníci webu EGD sonda ms-prava",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": false,
    "OwnerTitle": "Vlastníci webu EGD sonda ms-prava",
    "RequestToJoinLeaveEmailSetting": ""
  },
  {
    "Id": 3,
    "IsHiddenInUI": false,
    "LoginName": "Vlastníci webu EGD sonda ms-prava",
    "Title": "Vlastníci webu EGD sonda ms-prava",
    "PrincipalType": 8,
    "AllowMembersEditMembership": false,
    "AllowRequestToJoinLeave": false,
    "AutoAcceptRequestToJoinLeave": false,
    "Description": null,
    "OnlyAllowMembersViewMembership": false,
    "OwnerTitle": "Vlastníci webu EGD sonda ms-prava",
    "RequestToJoinLeaveEmailSetting": ""
  }
]
<shellId: 5 completed with exit code 0>
```

</details>


---

<sub>28s</sub>

### `bash`

**Zjištění parametrů pro nové úrovně**

`$ m365 spo roledefinition add --help`

<details>
<summary>25 lines</summary>

```
SPO ROLEDEFINITION ADD
======================

Adds a new roledefinition to web


USAGE

  m365 spo roledefinition add [options]


OPTIONS

  -u, --webUrl <webUrl>
    URL of the site to which role should be added.

  -n, --name <name>
    role definition name.

  -d, --description [description]
    role definition description.

  --rights [rights]
    A case-sensitive string array that contain the permissions needed for the custom action. Allowed values EmptyMask, ViewListItems, AddListItems, EditListItems, DeleteListItems, ApproveItems, OpenItems, ViewVersions, DeleteVersions, CancelCheckout, ManagePersonalViews, ManageLists, ViewFormPages, AnonymousSearchAccessList, Open, ViewPages, AddAndCustomizePages, ApplyThemeAndBorder, ApplyStyleSheets, ViewUsageData, CreateSSCSite, ManageSubwebs, CreateGroups, ManagePermissions, BrowseDirectories, BrowseUserInfo, AddDelPrivateWebParts,UpdatePersonalWebParts, ManageWeb, AnonymousSearchAccessWebLists, UseClientIntegration, UseRemoteAPIs, ManageAlerts, CreateAlerts, EditMyUserInfo, EnumeratePermissions, FullMask. Default EmptyMask.

  -h, --help [help]
    Output usage information. Optionally, specify which section of command's help you want to see. Allowed values are options, examples, remarks, permissions, response, full. Default is options.

  --query [query]
    JMESPath query string. See http://jmespath.org/ for more information and examples.

  -o, --output [output]
    Output type. json, text, csv, md, none. Default json.

  --verbose
    Runs command with verbose logging.

  --debug
    Runs command with debug logging.
<shellId: 6 completed with exit code 0>
```

</details>


---

<sub>30s</sub>

### `bash`

**Zjištění parametrů pro skupiny a členy**

`$ m365 spo group add --help && m365 spo group member add --help && m365 spo group member list --help`

<details>
<summary>87 lines</summary>

```
SPO GROUP ADD
=============

Creates group in the specified site


USAGE

  m365 spo group add [options]


OPTIONS

  -u, --webUrl <webUrl>
    URL of the site where the group should be added.

  -n, --name <name>
    Name of the group to add.

  --description [description]
    The description for the group.

  --allowMembersEditMembership [allowMembersEditMembership]
    Who can edit the membership of the group? When true members can edit membership, otherwise only owners can do this. Default false.

  --onlyAllowMembersViewMembership [onlyAllowMembersViewMembership]
    Who can view the membership of the group? When false everyone can view the group membership, otherwise only group members can. Default true.

  --allowRequestToJoinLeave [allowRequestToJoinLeave]
    Specify whether to allow users to request membership in this group and allow users to request to leave the group. Default false.

  --autoAcceptRequestToJoinLeave [autoAcceptRequestToJoinLeave]
    If auto-accept is enabled, users will automatically be added or removed when they make a request. Default false.

  --requestToJoinLeaveEmailSetting [requestToJoinLeaveEmailSetting]
    All membership requests will be sent to the email address specified.

  -h, --help [help]
    Output usage information. Optionally, specify which section of command's help you want to see. Allowed values are options, examples, remarks, permissions, response, full. Default is options.

  --query [query]
    JMESPath query string. See http://jmespath.org/ for more information and examples.

  -o, --output [output]
    Output type. json, text, csv, md, none. Default json.

  --verbose
    Runs command with verbose logging.

  --debug
    Runs command with debug logging.

SPO GROUP MEMBER ADD
====================

Adds members to a SharePoint Group


USAGE

  m365 spo group member add [options]


OPTIONS

  -u, --webUrl <webUrl>
    URL of the site where the SharePoint group is available.

  --groupId [groupId]
    Id of the SharePoint Group to which the user needs to be added. Specify either groupId or groupName.

  --groupName [groupName]
    Name of the SharePoint Group to which the user needs to be added. Specify either groupId or groupName.

  --userNames [userNames]
    User's UPN (user principal name, eg. megan.bowen@contoso.com). If multiple users need to be added, they have to be comma-separated (e.g. megan.bowen@contoso.com,alex.wilber@contoso.com). Specify either userIds, userNames, emails, entraGroupIds or entraGroupNames.

  --emails [emails]
    User's email (eg. megan.bowen@contoso.com). If multiple users need to be added, they have to be comma-separated (e.g. megan.bowen@contoso.com,alex.wilber@contoso.com). Specify either userIds, userNames, emails, entraGroupIds or entraGroupNames.

  --userIds [userIds]
    The user Id of the user to add as a member. (Id of the site user, for example: 14). If multiple users need to be added, the Ids have to be comma-separated. Specify either userIds, userNames, emails, entraGroupIds or entraGroupNames.

  --entraGroupIds [entraGroupIds]
    The object Id of the Entra group to add as a member. If multiple groups need to be added, the Ids have to be comma-separated. Specify either userIds, userNames, emails, entraGroupIds or entraGroupNames.

  --entraGroupNames [entraGroupNames]
    The name of the Entra group to add as a member. If multiple groups need to be added, they have to be comma-separated. Specify either userIds, userNames, emails, entraGroupIds or entraGroupNames.

  -h, --help [help]
    Output usage information. Optionally, specify which section of command's help you want to see. Allowed values are options, examples, remarks, permissions, response, full. Default is options.

  --query [query]
    JMESPath query string. See http://jmespath.org/ for more information and examples.

  -o, --output [output]
    Output type. json, text, csv, md, none. Default json.

  --verbose
    Runs command with verbose logging.

  --debug
    Runs command with debug logging.

SPO GROUP MEMBER LIST
=====================

Lists the members of a SharePoint Group


USAGE

  m365 spo group member list [options]


OPTIONS

  -u, --webUrl <webUrl>
    URL of the SharePoint site.

  --groupId [groupId]
    Id of the SharePoint group. Specify either groupName or groupId, but not both.

  --groupName [groupName]
    Name of the SharePoint group. Specify either groupName or groupId, but not both.

  -h, --help [help]
    Output usage information. Optionally, specify which section of command's help you want to see. Allowed values are options, examples, remarks, permissions, response, full. Default is options.

  --query [query]
    JMESPath query string. See http://jmespath.org/ for more information and examples.

  -o, --output [output]
    Output type. json, text, csv, md, none. Default json.

  --verbose
    Runs command with verbose logging.

  --debug
    Runs command with debug logging.
<shellId: 7 completed with exit code 0>
```

</details>


---

<sub>32s</sub>

### `bash`

**Zjištění parametrů přiřazení a seznamu**

`$ m365 spo web roleassignment add --help && m365 spo list roleassignment add --help && m365 spo list roleinheritance break --help && m365 spo list set --help`

<details>
<summary>249 lines</summary>

```
SPO WEB ROLEASSIGNMENT ADD
==========================

Adds a role assignment to web permissions.


USAGE

  m365 spo web roleassignment add [options]


OPTIONS

  -u, --webUrl <webUrl>
    URL of the site.

  --principalId [principalId]
    SharePoint ID of principal it may be either user id or group id we want to add permissions to. Specify either principalId, upn, groupName, entraGroupId or entraGroupName but not multiple.

  --upn [upn]
    The upn/email of user to assign role to. Specify either principalId, upn, groupName, entraGroupId or entraGroupName but not multiple.

  --groupName [groupName]
    The group name of the SharePoint group. Use this option exclusively for SharePoint Online groups. Specify either principalId, upn, groupName, entraGroupId or entraGroupName but not multiple.

  --entraGroupId [entraGroupId]
    ID of the Microsoft Entra group to add. Specify either principalId, upn, groupName, entraGroupId or entraGroupName but not multiple.

  --entraGroupName [entraGroupName]
    Display name of the Microsoft Entra group to add. Specify either principalId, upn, groupName, entraGroupId or entraGroupName but not multiple.

  --roleDefinitionId [roleDefinitionId]
    ID of role definition. Specify either roleDefinitionId or roleDefinitionName but not both.

  --roleDefinitionName [roleDefinitionName]
    The name of a role definition, like 'Contribute', 'Read', etc. Specify either roleDefinitionId or roleDefinitionName but not both.

  -h, --help [help]
    Output usage information. Optionally, specify which section of command's help you want to see. Allowed values are options, examples, remarks, permissions, response, full. Default is options.

  --query [query]
    JMESPath query string. See http://jmespath.org/ for more information and examples.

  -o, --output [output]
    Output type. json, text, csv, md, none. Default json.

  --verbose
    Runs command with verbose logging.

  --debug
    Runs command with debug logging.

SPO LIST ROLEASSIGNMENT ADD
===========================

Adds a role assignment to list permissions


USAGE

  m365 spo list roleassignment add [options]


OPTIONS

  -u, --webUrl <webUrl>
    URL of the site where the list is located.

  -i, --listId [listId]
    ID of the list. Specify either listId, listTitle, or listUrl but not multiple.

  -t, --listTitle [listTitle]
    Title of the list. Specify either listId, listTitle, or listUrl but not multiple.

  --listUrl [listUrl]
    Relative URL of the list. Specify either listId, listTitle, or listUrl but not multiple.

  --principalId [principalId]
    SharePoint ID of principal it may be either user id or group id we want to add permissions to. Specify either principalId, upn, groupName, entraGroupId, or entraGroupName.

  --upn [upn]
    The upn/email of user to assign role to. Specify either principalId, upn, groupName, entraGroupId, or entraGroupName.

  --entraGroupId [entraGroupId]
    ID of the Microsoft Entra group to assign permissions to. Specify either principalId, upn, groupName, entraGroupId, or entraGroupName.

  --entraGroupName [entraGroupName]
    Display name of the Microsoft Entra group to assign permissions to. Specify either principalId, upn, groupName, entraGroupId, or entraGroupName.

  --groupName [groupName]
    The group name of the SharePoint group. Specify either principalId, upn, groupName, entraGroupId, or entraGroupName.

  --roleDefinitionId [roleDefinitionId]
    ID of role definition. Specify either roleDefinitionId or roleDefinitionName but not both.

  --roleDefinitionName [roleDefinitionName]
    The name of a role definition, like 'Contribute', 'Read', etc. Specify either roleDefinitionId or roleDefinitionName but not both.

  -h, --help [help]
    Output usage information. Optionally, specify which section of command's help you want to see. Allowed values are options, examples, remarks, permissions, response, full. Default is options.

  --query [query]
    JMESPath query string. See http://jmespath.org/ for more information and examples.

  -o, --output [output]
    Output type. json, text, csv, md, none. Default json.

  --verbose
    Runs command with verbose logging.

  --debug
    Runs command with debug logging.

SPO LIST ROLEINHERITANCE BREAK
==============================

Breaks role inheritance on list or library


USAGE

  m365 spo list roleinheritance break [options]


OPTIONS

  -u, --webUrl <webUrl>
    URL of the site where the list is located.

  -i, --listId [listId]
    ID of the list. Specify either listTitle, listId, or listUrl.

  -t, --listTitle [listTitle]
    Title of the list. Specify either listTitle, listId, or listUrl.

  --listUrl [listUrl]
    Server- or site-relative URL of the list. Specify either listTitle, listId, or listUrl.

  -c, --clearExistingPermissions
    Flag if used clears all roles from the list.

  -f, --force
    Do not prompt for confirmation before breaking role inheritance.

  -h, --help [help]
    Output usage information. Optionally, specify which section of command's help you want to see. Allowed values are options, examples, remarks, permissions, response, full. Default is options.

  --query [query]
    JMESPath query string. See http://jmespath.org/ for more information and examples.

  -o, --output [output]
    Output type. json, text, csv, md, none. Default json.

  --verbose
    Runs command with verbose logging.

  --debug
    Runs command with debug logging.

SPO LIST SET
============

Updates the settings of the specified list


USAGE

  m365 spo list set [options]


OPTIONS

  -u, --webUrl <webUrl>
    URL of the site.

  --id [id]
    ID of the list. Specify either id, title, or url but not multiple.

  --title [title]
    Title of the list. Specify either id, title, or url but not multiple.

  --url [url]
    Relative URL of the list. Specify either id, title, or url but not multiple.

  --newTitle [newTitle]
    New title for the list.

  --allowDeletion [allowDeletion]
    Boolean value specifying whether the list can be deleted. Valid values are true, false.

  --allowEveryoneViewItems [allowEveryoneViewItems]
    Boolean value specifying whether everyone can view documents in the documentlibrary or attachments to items in the list. Valid values are true, false.

  --allowMultiResponses [allowMultiResponses]
    Boolean value specifying whether users are allowed to give multiple responses to the survey. Valid values are true, false.

  --contentTypesEnabled [contentTypesEnabled]
    Boolean value specifying whether content types are enabled for the list. Valid values are true, false.

  --crawlNonDefaultViews [crawlNonDefaultViews]
    Boolean value specifying whether to crawl non default views. Valid values are true, false.

  --defaultContentApprovalWorkflowId [defaultContentApprovalWorkflowId]
    Value that specifies the default workflow identifier for content approval on the list (GUID).

  --defaultDisplayFormUrl [defaultDisplayFormUrl]
    Value that specifies the location of the default display form for the list.

  --defaultEditFormUrl [defaultEditFormUrl]
    Value that specifies the URL of the edit form to use for list items in the list.

  --description [description]
    The description for the list.

  --direction [direction]
    Value that specifies the reading order of the list. Valid values are NONE, LTR, RTL.

  --disableCommenting [disableCommenting]
    Property for enabling or disabling commenting on the list. Valid values are true, false.

  --disableGridEditing [disableGridEditing]
    Property for assigning or retrieving grid editing on the list. Valid values are true, false.

  --draftVersionVisibility [draftVersionVisibility]
    Value that specifies the minimum permission required to view minor versions and drafts within the list. Allowed values Reader, Author, Approver.

  --emailAlias [emailAlias]
    If e-mail notification is enabled, gets or sets the e-mail address to use tonotify to the owner of an item when an assignment has changed or the item has been updated.

  --enableAssignToEmail [enableAssignToEmail]
    Boolean value specifying whether e-mail notification is enabled for the list. Valid values are true, false.

  --enableAttachments [enableAttachments]
    Boolean value that specifies whether attachments can be added to items in the list. Valid values are true, false.

  --enableDeployWithDependentList [enableDeployWithDependentList]
    Boolean value that specifies whether the list can be deployed with a dependent list. Valid values are true, false.

  --enableFolderCreation [enableFolderCreation]
    Boolean value that specifies whether folders can be created for the list. Valid values are true, false.

  --enableMinorVersions [enableMinorVersions]
    Boolean value that specifies whether minor versions are enabled when versioning is enabled for the document library. Valid values are true, false.

  --enableModeration [enableModeration]
    Boolean value that specifies whether Content Approval is enabled for the list. Valid values are true, false.

  --enablePeopleSelector [enablePeopleSelector]
    Enable user selector on event list. Valid values are true, false.

  --enableResourceSelector [enableResourceSelector]
    Enables resource selector on an event list. Valid values are true, false.

  --enableSchemaCaching [enableSchemaCaching]
    Boolean value specifying whether schema caching is enabled for the list. Valid values are true, false.

  --enableSyndication [enableSyndication]
    Boolean value that specifies whether RSS syndication is enabled for the list. Valid values are true, false.

  --enableThrottling [enableThrottling]
    Indicates whether throttling for this list is enabled or not. Valid values are true, false.

  --enableVersioning [enableVersioning]
    Boolean value that specifies whether versioning is enabled for the document library. Valid values are true, false.

  --enforceDataValidation [enforceDataValidation]
    Value that indicates whether certain field properties are enforced when an item is added or updated. Valid values are true, false.

  --excludeFromOfflineClient [excludeFromOfflineClient]
    Value that indicates whether the list should be downloaded to the client during offline synchronization. Valid values are true, false.

  --fetchPropertyBagForListView [fetchPropertyBagForListView]
    Specifies whether property bag information, as part of the list schema JSON,is retrieved when the list is being rendered on the client. Valid values are true, false.

  --followable [followable]
    Can a list be followed in an activity feed?. Valid values are true, false.

  --forceCheckout [forceCheckout]
    Boolean value that specifies whether forced checkout is enabled for the document library. Valid values are true, false.

  --forceDefaultContentType [forceDefaultContentType]
    Specifies whether we want to return the default Document root content type. Valid values are true, false.

  --hidden [hidden]
    Boolean value that specifies whether the list is hidden. Valid values are true, false.

  --includedInMyFilesScope [includedInMyFilesScope]
    Specifies whether this list is accessible to an app principal that has been granted an OAuth scope that contains the string "myfiles" by a case-insensitive comparison when the current user is a site collection administrator of the personal site that contains the list.

  --irmEnabled [irmEnabled]
    Gets or sets a Boolean value that specifies whether Information Rights Management (IRM) is enabled for the list.

  --irmExpire [irmExpire]
    Gets or sets a Boolean value that specifies whether Information Rights Management (IRM) expiration is enabled for the list.

  --irmReject [irmReject]
    Gets or sets a Boolean value that specifies whether Information Rights Management (IRM) rejection is enabled for the list.

  --isApplicationList [isApplicationList]
    Indicates whether this list should be treated as a top level navigation object or not.

  --listExperienceOptions [listExperienceOptions]
    Gets or sets the list experience for the list. Allowed values Auto, NewExperience, ClassicExperience.

  --majorVersionLimit [majorVersionLimit]
    Gets or sets the maximum number of major versions allowed for an item in a document library that uses version control with major versions only. When specified, versioning is automatically enabled.

  --majorWithMinorVersionsLimit [majorWithMinorVersionsLimit]
    Gets or sets the maximum number of major versions that are allowed for an item in a document library that uses version control with both major and minor versions.

  --multipleDataList [multipleDataList]
    Gets or sets a Boolean value that specifies whether the list in a Meeting Workspace sitecontains data for multiple meeting instances within the site.

  --navigateForFormsPages [navigateForFormsPages]
    Indicates whether to navigate for forms pages or use a modal dialog.

  --needUpdateSiteClientTag [needUpdateSiteClientTag]
    A boolean value that determines whether to editing documents in this list should increment the ClientTag for the site. The tag is used to allow clients to cache JS/CSS/resources that are retrieved from the Content DB, including custom CSR templates.

  --noCrawl [noCrawl]
    Gets or sets a Boolean value specifying whether crawling is enabled for the list.

  --onQuickLaunch [onQuickLaunch]
    Gets or sets a Boolean value that specifies whether the list appears on the Quick Launch area of the home page.

  --ordered [ordered]
    Gets or sets a Boolean value that specifies whether the option to allow users to reorder items in the list is available on the Edit View page for the list.

  --parserDisabled [parserDisabled]
    Gets or sets a Boolean value that specifies whether the parser should be disabled.

  --readOnlyUI [readOnlyUI]
    A boolean value that indicates whether the UI for this list should be presented in a read-only fashion. This will not affect security nor will it actually prevent changes to the list from occurring - it only affects the way the UI is displayed.

  --readSecurity [readSecurity]
    Gets or sets the Read security setting for the list. Valid values are 1 (All users have Read access to all items)|2 (Users have Read access only to items that they create).

  --requestAccessEnabled [requestAccessEnabled]
    Gets or sets a Boolean value that specifies whether the option to allow users to request access to the list is available.

  --restrictUserUpdates [restrictUserUpdates]
    A boolean value that indicates whether the this list is a restricted one or not The value can't be changed if there are existing items in the list.

  --sendToLocationName [sendToLocationName]
    Gets or sets a file name to use when copying an item in the list to another document library.

  --sendToLocationUrl [sendToLocationUrl]
    Gets or sets a URL to use when copying an item in the list to another document library.

  --showUser [showUser]
    Gets or sets a Boolean value that specifies whether names of users are shown in the results of the survey.

  --templateFeatureId [templateFeatureId]
    The globally unique identifier (GUID) of a template feature that is associated with the list.

  --useFormsForDisplay [useFormsForDisplay]
    Indicates whether forms should be considered for display context or not.

  --validationFormula [validationFormula]
    Gets or sets a formula that is evaluated each time that a list item is added or updated.

  --validationMessage [validationMessage]
    Gets or sets the message that is displayed when validation fails for a list item.

  --versionAutoExpireTrim [versionAutoExpireTrim]
    Boolean that indicates whether the automatic version trim should be enabled. Cannot be used together with versionExpireAfterDays unless set to false. Valid values are true, false.

  --versionExpireAfterDays [versionExpireAfterDays]
    Number that defines how many days a version should be removed after. When using this option, be sure to also set majorVersionLimit. Cannot be used together with versionAutoExpireTrim set to true.

  --writeSecurity [writeSecurity]
    Gets or sets the Write security setting for the list. Valid values are 1 (All users can modify all items)|2 (Users can modify only items that they create)|4 (Users cannot modify any list item).

  -h, --help [help]
    Output usage information. Optionally, specify which section of command's help you want to see. Allowed values are options, examples, remarks, permissions, response, full. Default is options.

  --query [query]
    JMESPath query string. See http://jmespath.org/ for more information and examples.

  -o, --output [output]
    Output type. json, text, csv, md, none. Default json.

  --verbose
    Runs command with verbose logging.

  --debug
    Runs command with debug logging.
<shellId: 8 completed with exit code 0>
```

</details>


---

<sub>28s</sub>

### `bash`

**Kontrola členů skupiny vlastníků**

`$ m365 spo group member list --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --groupName "Vlastníci webu EGD sonda ms-prava" --output json`

<details>
<summary>54 lines</summary>

```
[
  {
    "Id": 11,
    "IsHiddenInUI": false,
    "LoginName": "i:0#.f|membership|karolina.mala@pavelchocholousgmail.onmicrosoft.com",
    "Title": "Malá Karolína",
    "PrincipalType": 1,
    "Email": "karolina.mala@pavelchocholousgmail.onmicrosoft.com",
    "Expiration": "",
    "IsEmailAuthenticationGuestUser": false,
    "IsShareByEmailGuestUser": false,
    "IsSiteAdmin": false,
    "UserId": {
      "NameId": "1003200668261461",
      "NameIdIssuer": "urn:federation:microsoftonline"
    },
    "UserPrincipalName": "karolina.mala@pavelchocholousgmail.onmicrosoft.com"
  },
  {
    "Id": 10,
    "IsHiddenInUI": false,
    "LoginName": "i:0#.f|membership|petra.novakova@pavelchocholousgmail.onmicrosoft.com",
    "Title": "Nováková Petra",
    "PrincipalType": 1,
    "Email": "petra.novakova@pavelchocholousgmail.onmicrosoft.com",
    "Expiration": "",
    "IsEmailAuthenticationGuestUser": false,
    "IsShareByEmailGuestUser": false,
    "IsSiteAdmin": false,
    "UserId": {
      "NameId": "1003200667226d21",
      "NameIdIssuer": "urn:federation:microsoftonline"
    },
    "UserPrincipalName": "petra.novakova@pavelchocholousgmail.onmicrosoft.com"
  },
  {
    "Id": 6,
    "IsHiddenInUI": false,
    "LoginName": "i:0#.f|membership|pavel.admin@pavelchocholousgmail.onmicrosoft.com",
    "Title": "Pavel Admin (lab)",
    "PrincipalType": 1,
    "Email": "pavel.admin@pavelchocholousgmail.onmicrosoft.com",
    "Expiration": "",
    "IsEmailAuthenticationGuestUser": false,
    "IsShareByEmailGuestUser": false,
    "IsSiteAdmin": true,
    "UserId": {
      "NameId": "100320065e5b0ab9",
      "NameIdIssuer": "urn:federation:microsoftonline"
    },
    "UserPrincipalName": "pavel.admin@pavelchocholousgmail.onmicrosoft.com"
  }
]
<shellId: 9 completed with exit code 0>
```

</details>


---

<sub>51s</sub>

### Copilot

Přihlášení je pod vlastníkem webu. Seznam nyní dědí přístup a má `ReadSecurity=1`, `WriteSecurity=1`; pro omezení na vlastní položky musím přerušit dědění, ponechat vlastníkům Úplné řízení a přidat jen dvě nové skupiny Nákupy. Založím úrovně bez mazání pro schvalovatele a pro zadavatele odděleně; stávajících EGD úrovní se nedotknu.

---

<sub>1m 2s</sub>

### `bash`

**Založení úrovní, skupin, členství a čtení webu**

`$ m365 spo roledefinition add --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --name "Nákupy Zadavatel" --description "Zadávání vlastních požadavků v aplikaci Nákupy" --rights "ViewListItems,AddListItems,EditListItems,DeleteListItems,OpenItems,ViewVersions,DeleteVersions,ManagePersonalViews,ViewFormPages,Open,ViewPages,CreateSSCSite,BrowseDirectories,BrowseUserInfo,AddDelPrivateWebParts,UpdatePersonalWebParts,UseClientIntegration,UseRemoteAPIs,CreateAlerts,EditMyUserInfo" --output none && m365 spo roledefinition add --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --name "Nákupy Schvalovatel bez mazání" --description "Schvalování požadavků bez oprávnění mazat položky" --rights "ViewListItems,AddListItems,EditListItems,OpenItems,ViewVersions,DeleteVersions,CancelCheckout,ManagePersonalViews,ViewFormPages,Open,ViewPages,CreateSSCSite,BrowseDirectories,BrowseUserInfo,AddDelPrivateWebParts,UpdatePersonalWebParts,UseClientIntegration,UseRemoteAPIs,CreateAlerts,EditMyUserInfo" --output none && m365 spo group add --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --name "Nákupy Zadavatelé" --description "Zadavatelky aplikace Nákupy" --output none && m365 spo group add --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --name "Nákupy Schvalovatelé" --description "Schvalovatelé aplikace Nákupy" --output none && m365 spo group member add --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --groupName "Nákupy Zadavatelé" --userNames jana.svobodova@pavelchocholousgmail.onmicrosoft.com --output none && m365 spo group member add --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --groupName "Nákupy Schvalovatelé" --userNames tomas.prochazka@pavelchocholousgmail.onmicrosoft.com --output none && m365 spo web roleassignment add --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --groupName "Nákupy Zadavatelé" --roleDefinitionName "Čtení" --output none && m365 spo web roleassignment add --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --groupName "Nákupy Schvalovatelé" --roleDefinitionName "Čtení" --output none`

```

<shellId: 10 completed with exit code 0>
```


---

<sub>1m 7s</sub>

### `bash`

**Ověření členství zadavatelské skupiny**

`$ m365 spo group member list --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --groupName "Nákupy Zadavatelé" --output json`

<details>
<summary>20 lines</summary>

```
[
  {
    "Id": 22,
    "IsHiddenInUI": false,
    "LoginName": "i:0#.f|membership|jana.svobodova@pavelchocholousgmail.onmicrosoft.com",
    "Title": "Svobodová Jana",
    "PrincipalType": 1,
    "Email": "jana.svobodova@pavelchocholousgmail.onmicrosoft.com",
    "Expiration": "",
    "IsEmailAuthenticationGuestUser": false,
    "IsShareByEmailGuestUser": false,
    "IsSiteAdmin": false,
    "UserId": {
      "NameId": "1003200667226d46",
      "NameIdIssuer": "urn:federation:microsoftonline"
    },
    "UserPrincipalName": "jana.svobodova@pavelchocholousgmail.onmicrosoft.com"
  }
]
<shellId: 11 completed with exit code 0>
```

</details>


---

<sub>1m 7s</sub>

### `bash`

**Ověření členství schvalovatelské skupiny**

`$ m365 spo group member list --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --groupName "Nákupy Schvalovatelé" --output json`

<details>
<summary>20 lines</summary>

```
[
  {
    "Id": 21,
    "IsHiddenInUI": false,
    "LoginName": "i:0#.f|membership|tomas.prochazka@pavelchocholousgmail.onmicrosoft.com",
    "Title": "Procházka Tomáš",
    "PrincipalType": 1,
    "Email": "tomas.prochazka@pavelchocholousgmail.onmicrosoft.com",
    "Expiration": "",
    "IsEmailAuthenticationGuestUser": false,
    "IsShareByEmailGuestUser": false,
    "IsSiteAdmin": false,
    "UserId": {
      "NameId": "1003200667226d60",
      "NameIdIssuer": "urn:federation:microsoftonline"
    },
    "UserPrincipalName": "tomas.prochazka@pavelchocholousgmail.onmicrosoft.com"
  }
]
<shellId: 12 completed with exit code 0>
```

</details>


---

<sub>1m 7s</sub>

### `bash`

**Ověření nových úrovní oprávnění**

`$ m365 spo roledefinition list --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --query "[?starts_with(Name, 'Nákupy')].[Name,BasePermissionsValue]" --output json`

<details>
<summary>53 lines</summary>

```
[
  [
    "Nákupy Zadavatel",
    [
      "ViewListItems",
      "AddListItems",
      "EditListItems",
      "DeleteListItems",
      "OpenItems",
      "ViewVersions",
      "DeleteVersions",
      "ManagePersonalViews",
      "ViewFormPages",
      "Open",
      "ViewPages",
      "CreateSSCSite",
      "BrowseDirectories",
      "BrowseUserInfo",
      "AddDelPrivateWebParts",
      "UpdatePersonalWebParts",
      "UseClientIntegration",
      "UseRemoteAPIs",
      "CreateAlerts",
      "EditMyUserInfo"
    ]
  ],
  [
    "Nákupy Schvalovatel bez mazání",
    [
      "ViewListItems",
      "AddListItems",
      "EditListItems",
      "OpenItems",
      "ViewVersions",
      "DeleteVersions",
      "CancelCheckout",
      "ManagePersonalViews",
      "ViewFormPages",
      "Open",
      "ViewPages",
      "CreateSSCSite",
      "BrowseDirectories",
      "BrowseUserInfo",
      "AddDelPrivateWebParts",
      "UpdatePersonalWebParts",
      "UseClientIntegration",
      "UseRemoteAPIs",
      "CreateAlerts",
      "EditMyUserInfo"
    ]
  ]
]
<shellId: 13 completed with exit code 0>
```

</details>


---

<sub>3m 13s</sub>

### `bash`

**Nastavení jedinečných oprávnění seznamu**

`$ m365 spo list roleinheritance break --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --listTitle PozadavkyCopilot3 --clearExistingPermissions --force --output none && m365 spo list roleassignment add --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --listTitle PozadavkyCopilot3 --groupName "Vlastníci webu EGD sonda ms-prava" --roleDefinitionName "Úplné řízení" --output none && m365 spo list roleassignment add --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --listTitle PozadavkyCopilot3 --groupName "Nákupy Zadavatelé" --roleDefinitionName "Nákupy Zadavatel" --output none && m365 spo list roleassignment add --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --groupName "Nákupy Schvalovatelé" --roleDefinitionName "Nákupy Schvalovatel bez mazání" --output none && m365 spo list set --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --title PozadavkyCopilot3 --readSecurity 2 --writeSecurity 2 --output none`

<details>
<summary>7 lines</summary>

```
🌶️  Please specify one of the following options:
? Option to use:
❯ listId
  listTitle
  listUrl

↑↓ navigate • ⏎ select
<command with shellId: 14 is still running after 120 seconds. The command is still running. You will be automatically notified when it completes; if you need the command to complete end your response with no tool calls to wait for the notification. Use stop_bash to stop it.>
```

</details>


---

<sub>3m 16s</sub>

### `stop_bash`

<details>
<summary>Arguments</summary>

```json
{
  "shellId": "14"
}
```

</details>

```
<command with id: 14 stopped>
```


---

<sub>3m 20s</sub>

### `bash`

**Kontrola seznamu po přerušeném pokusu**

`$ m365 spo list get --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --title PozadavkyCopilot3 --properties "Id,Title,ReadSecurity,WriteSecurity,HasUniqueRoleAssignments" --output json`

<details>
<summary>8 lines</summary>

```
{
  "HasUniqueRoleAssignments": true,
  "Id": "758c9685-041d-4127-b568-7a84d80a729f",
  "ReadSecurity": 1,
  "Title": "PozadavkyCopilot3",
  "WriteSecurity": 1
}
<shellId: 15 completed with exit code 0>
```

</details>


---

<sub>3m 26s</sub>

### `bash`

**Zjištění příkazu pro kontrolu oprávnění seznamu**

`$ m365 spo list roleassignment list --help`

<details>
<summary>43 lines</summary>

```
Command 'spo list roleassignment list' was not found. Below you can find the commands and command groups you can use. For detailed information on a command group, use 'm365 [command group] --help'.

CLI for Microsoft 365 v11.11.0
Manage Microsoft 365 and SharePoint Framework projects on any platform 

Commands:

  docs [options]     Returns the CLI for Microsoft 365 docs webpage URL
  login [options]    Logs in to Microsoft 365
  logout [options]   Logs out from Microsoft 365
  request [options]  Executes the specified web request using CLI for Microsoft 365
  search [options]   Uses the Microsoft Search to query Microsoft 365 data
  setup [options]    Sets up CLI for Microsoft 365 based on your preferences
  status [options]   Shows Microsoft 365 login status
  version [options]  Shows CLI for Microsoft 365 version

Commands groups:

  adaptivecard *  1 command
  app *           4 commands
  booking *       2 commands
  cli *           14 commands
  connection *    4 commands
  context *       5 commands
  entra *         118 commands
  exo *           1 command
  external *      8 commands
  file *          5 commands
  flow *          19 commands
  graph *         16 commands
  onedrive *      8 commands
  onenote *       3 commands
  outlook *       34 commands
  pa *            13 commands
  planner *       31 commands
  pp *            30 commands
  purview *       21 commands
  search *        5 commands
  spe *           14 commands
  spfx *          9 commands
  spo *           383 commands
  spp *           6 commands
  teams *         72 commands
  tenant *        24 commands
  todo *          10 commands
  util *          1 command
  viva *          31 commands
<shellId: 16 completed with exit code 0>
```

</details>


---

<sub>3m 26s</sub>

### `bash`

**Zjištění syntaxe správy oprávnění seznamu**

`$ m365 spo list roleassignment --help`

<details>
<summary>6 lines</summary>

```
CLI for Microsoft 365 v11.11.0
Manage Microsoft 365 and SharePoint Framework projects on any platform 

Commands:

  spo list roleassignment add [options]     Adds a role assignment to list permissions
  spo list roleassignment remove [options]  Removes a role assignment from list permissions
<shellId: 17 completed with exit code 0>
```

</details>


---

<sub>3m 26s</sub>

### `bash`

**Ověření vlastníků pro obnovení přístupu**

`$ m365 spo group member list --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --groupName "Vlastníci webu EGD sonda ms-prava" --output json`

<details>
<summary>54 lines</summary>

```
[
  {
    "Id": 11,
    "IsHiddenInUI": false,
    "LoginName": "i:0#.f|membership|karolina.mala@pavelchocholousgmail.onmicrosoft.com",
    "Title": "Malá Karolína",
    "PrincipalType": 1,
    "Email": "karolina.mala@pavelchocholousgmail.onmicrosoft.com",
    "Expiration": "",
    "IsEmailAuthenticationGuestUser": false,
    "IsShareByEmailGuestUser": false,
    "IsSiteAdmin": false,
    "UserId": {
      "NameId": "1003200668261461",
      "NameIdIssuer": "urn:federation:microsoftonline"
    },
    "UserPrincipalName": "karolina.mala@pavelchocholousgmail.onmicrosoft.com"
  },
  {
    "Id": 10,
    "IsHiddenInUI": false,
    "LoginName": "i:0#.f|membership|petra.novakova@pavelchocholousgmail.onmicrosoft.com",
    "Title": "Nováková Petra",
    "PrincipalType": 1,
    "Email": "petra.novakova@pavelchocholousgmail.onmicrosoft.com",
    "Expiration": "",
    "IsEmailAuthenticationGuestUser": false,
    "IsShareByEmailGuestUser": false,
    "IsSiteAdmin": false,
    "UserId": {
      "NameId": "1003200667226d21",
      "NameIdIssuer": "urn:federation:microsoftonline"
    },
    "UserPrincipalName": "petra.novakova@pavelchocholousgmail.onmicrosoft.com"
  },
  {
    "Id": 6,
    "IsHiddenInUI": false,
    "LoginName": "i:0#.f|membership|pavel.admin@pavelchocholousgmail.onmicrosoft.com",
    "Title": "Pavel Admin (lab)",
    "PrincipalType": 1,
    "Email": "pavel.admin@pavelchocholousgmail.onmicrosoft.com",
    "Expiration": "",
    "IsEmailAuthenticationGuestUser": false,
    "IsShareByEmailGuestUser": false,
    "IsSiteAdmin": true,
    "UserId": {
      "NameId": "100320065e5b0ab9",
      "NameIdIssuer": "urn:federation:microsoftonline"
    },
    "UserPrincipalName": "pavel.admin@pavelchocholousgmail.onmicrosoft.com"
  }
]
<shellId: 18 completed with exit code 0>
```

</details>


---

<sub>3m 30s</sub>

### `bash`

**Zjištění syntaxe pro čtení role assignments přes REST**

`$ m365 request --help`

<details>
<summary>27 lines</summary>

```
REQUEST
=======

Executes the specified web request using CLI for Microsoft 365


USAGE

  m365 request [options]


OPTIONS

  -u, --url <url>
    The request URL.

  -m, --method [method]
    The HTTP request method. Accepted values are get, post, put, patch, delete, head, options. The default value is get.

  -r, --resource [resource]
    The resource uri for which the CLI should acquire a token from Microsoft Entra ID in order to access the service.

  -b, --body [body]
    The request body. Optionally use @example.json to load the body from a file.

  -p, --filePath [filePath]
    The file path to save the response to. This option can be used when downloading files.

  -h, --help [help]
    Output usage information. Optionally, specify which section of command's help you want to see. Allowed values are options, examples, remarks, permissions, response, full. Default is options.

  --query [query]
    JMESPath query string. See http://jmespath.org/ for more information and examples.

  -o, --output [output]
    Output type. json, text, csv, md, none. Default json.

  --verbose
    Runs command with verbose logging.

  --debug
    Runs command with debug logging.
<shellId: 19 completed with exit code 0>
```

</details>


---

<sub>3m 33s</sub>

### `bash`

**Načtení aktuálních přidělení seznamu**

`$ m365 request --url "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/web/lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments?$expand=Member,RoleDefinitionBindings&$select=Member/Id,Member/Title,RoleDefinitionBindings/Name" --output json`

<details>
<summary>24 lines</summary>

```
{
  "odata.metadata": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/$metadata#SP.ApiData.RoleAssignments",
  "value": [
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(3)",
      "odata.editLink": "Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(3)",
      "PrincipalId": 3
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(6)",
      "odata.editLink": "Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(6)",
      "PrincipalId": 6
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(33)",
      "odata.editLink": "Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(33)",
      "PrincipalId": 33
    }
  ]
}
<shellId: 20 completed with exit code 0>
```

</details>


---

<sub>3m 40s</sub>

### `bash`

**Zjištění ID nových skupin**

`$ m365 spo group list --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --query "[?starts_with(Title, 'Nákupy')].[Id,Title]" --output json`

<details>
<summary>11 lines</summary>

```
[
  [
    34,
    "Nákupy Schvalovatelé"
  ],
  [
    33,
    "Nákupy Zadavatelé"
  ]
]
<shellId: 21 completed with exit code 0>
```

</details>


---

<sub>3m 40s</sub>

### `bash`

**Kontrola role assignment vlastníků**

`$ m365 request --url "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/web/lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(3)?$expand=Member,RoleDefinitionBindings" --output json`

<details>
<summary>8 lines</summary>

```
{
  "odata.metadata": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/$metadata#SP.ApiData.RoleAssignments/@Element",
  "odata.type": "SP.RoleAssignment",
  "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(3)",
  "odata.editLink": "Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(3)",
  "PrincipalId": 3
}
<shellId: 22 completed with exit code 0>
```

</details>


---

<sub>3m 40s</sub>

### `bash`

**Kontrola přímého přístupu vlastníka CLI**

`$ m365 request --url "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/web/lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(6)?$expand=Member,RoleDefinitionBindings" --output json`

<details>
<summary>8 lines</summary>

```
{
  "odata.metadata": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/$metadata#SP.ApiData.RoleAssignments/@Element",
  "odata.type": "SP.RoleAssignment",
  "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(6)",
  "odata.editLink": "Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(6)",
  "PrincipalId": 6
}
<shellId: 23 completed with exit code 0>
```

</details>


---

<sub>3m 40s</sub>

### `bash`

**Kontrola prvního nového přidělení**

`$ m365 request --url "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/web/lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(33)?$expand=Member,RoleDefinitionBindings" --output json`

<details>
<summary>8 lines</summary>

```
{
  "odata.metadata": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/$metadata#SP.ApiData.RoleAssignments/@Element",
  "odata.type": "SP.RoleAssignment",
  "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(33)",
  "odata.editLink": "Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(33)",
  "PrincipalId": 33
}
<shellId: 24 completed with exit code 0>
```

</details>


---

<sub>3m 47s</sub>

### `bash`

**Dokončení role schvalovatele a omezení položek**

`$ m365 spo list roleassignment add --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --listId 758c9685-041d-4127-b568-7a84d80a729f --groupName "Nákupy Schvalovatelé" --roleDefinitionName "Nákupy Schvalovatel bez mazání" --output none && m365 spo list set --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --title PozadavkyCopilot3 --readSecurity 2 --writeSecurity 2 --output none`

```

<shellId: 25 completed with exit code 0>
```


---

<sub>3m 54s</sub>

### `bash`

**Ověření režimu přístupu k položkám**

`$ m365 spo list get --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --title PozadavkyCopilot3 --properties "Id,Title,ReadSecurity,WriteSecurity,HasUniqueRoleAssignments" --output json`

<details>
<summary>8 lines</summary>

```
{
  "HasUniqueRoleAssignments": true,
  "Id": "758c9685-041d-4127-b568-7a84d80a729f",
  "ReadSecurity": 2,
  "Title": "PozadavkyCopilot3",
  "WriteSecurity": 2
}
<shellId: 26 completed with exit code 0>
```

</details>


---

<sub>3m 54s</sub>

### `bash`

**Ověření oprávnění skupiny vlastníků na seznamu**

`$ m365 request --url "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/web/lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(3)/RoleDefinitionBindings" --output json`

<details>
<summary>21 lines</summary>

```
{
  "odata.metadata": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/$metadata#SP.ApiData.RoleDefinitions",
  "value": [
    {
      "odata.type": "SP.RoleDefinition",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleDefinitions(1073741829)",
      "odata.editLink": "Web/RoleDefinitions(1073741829)",
      "BasePermissions": {
        "High": "2147483647",
        "Low": "4294967295"
      },
      "Description": "Umožňuje úplné řízení.",
      "Hidden": false,
      "Id": 1073741829,
      "Name": "Úplné řízení",
      "Order": 1,
      "RoleTypeKind": 5
    }
  ]
}
<shellId: 27 completed with exit code 0>
```

</details>


---

<sub>3m 54s</sub>

### `bash`

**Ověření úrovně zadavatelů na seznamu**

`$ m365 request --url "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/web/lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(33)/RoleDefinitionBindings" --output json`

<details>
<summary>21 lines</summary>

```
{
  "odata.metadata": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/$metadata#SP.ApiData.RoleDefinitions",
  "value": [
    {
      "odata.type": "SP.RoleDefinition",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleDefinitions(1073741929)",
      "odata.editLink": "Web/RoleDefinitions(1073741929)",
      "BasePermissions": {
        "High": "432",
        "Low": "1011028719"
      },
      "Description": "Zadávání vlastních požadavků v aplikaci Nákupy",
      "Hidden": false,
      "Id": 1073741929,
      "Name": "Nákupy Zadavatel",
      "Order": 2147483647,
      "RoleTypeKind": 0
    }
  ]
}
<shellId: 28 completed with exit code 0>
```

</details>


---

<sub>3m 54s</sub>

### `bash`

**Ověření úrovně schvalovatelů na seznamu**

`$ m365 request --url "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/web/lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(34)/RoleDefinitionBindings" --output json`

<details>
<summary>21 lines</summary>

```
{
  "odata.metadata": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/$metadata#SP.ApiData.RoleDefinitions",
  "value": [
    {
      "odata.type": "SP.RoleDefinition",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleDefinitions(1073741930)",
      "odata.editLink": "Web/RoleDefinitions(1073741930)",
      "BasePermissions": {
        "High": "432",
        "Low": "1011028967"
      },
      "Description": "Schvalování požadavků bez oprávnění mazat položky",
      "Hidden": false,
      "Id": 1073741930,
      "Name": "Nákupy Schvalovatel bez mazání",
      "Order": 2147483647,
      "RoleTypeKind": 0
    }
  ]
}
<shellId: 29 completed with exit code 0>
```

</details>


---

<sub>3m 55s</sub>

### `bash`

**Ověření oprávnění Nákupy na webu**

`$ m365 request --url "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/web/RoleAssignments?$expand=Member,RoleDefinitionBindings" --output json`

<details>
<summary>114 lines</summary>

```
{
  "odata.metadata": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/$metadata#SP.ApiData.RoleAssignments",
  "value": [
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(3)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(3)",
      "PrincipalId": 3
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(4)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(4)",
      "PrincipalId": 4
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(5)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(5)",
      "PrincipalId": 5
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(6)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(6)",
      "PrincipalId": 6
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(12)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(12)",
      "PrincipalId": 12
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(13)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(13)",
      "PrincipalId": 13
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(14)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(14)",
      "PrincipalId": 14
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(20)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(20)",
      "PrincipalId": 20
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(23)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(23)",
      "PrincipalId": 23
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(24)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(24)",
      "PrincipalId": 24
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(25)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(25)",
      "PrincipalId": 25
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(27)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(27)",
      "PrincipalId": 27
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(28)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(28)",
      "PrincipalId": 28
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(29)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(29)",
      "PrincipalId": 29
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(30)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(30)",
      "PrincipalId": 30
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(31)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(31)",
      "PrincipalId": 31
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(33)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(33)",
      "PrincipalId": 33
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleAssignments/GetByPrincipalId(34)",
      "odata.editLink": "Web/RoleAssignments/GetByPrincipalId(34)",
      "PrincipalId": 34
    }
  ]
}
<shellId: 30 completed with exit code 0>
```

</details>


---

<sub>4m 5s</sub>

### `bash`

**Ověření úplného seznamu přístupových přiřazení**

`$ m365 request --url "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/web/lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments" --output json`

<details>
<summary>30 lines</summary>

```
{
  "odata.metadata": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/$metadata#SP.ApiData.RoleAssignments",
  "value": [
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(3)",
      "odata.editLink": "Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(3)",
      "PrincipalId": 3
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(6)",
      "odata.editLink": "Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(6)",
      "PrincipalId": 6
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(33)",
      "odata.editLink": "Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(33)",
      "PrincipalId": 33
    },
    {
      "odata.type": "SP.RoleAssignment",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(34)",
      "odata.editLink": "Web/Lists(guid'758c9685-041d-4127-b568-7a84d80a729f')/RoleAssignments/GetByPrincipalId(34)",
      "PrincipalId": 34
    }
  ]
}
<shellId: 31 completed with exit code 0>
```

</details>


---

<sub>4m 5s</sub>

### `bash`

**Ověření čtení webu pro zadavatelky**

`$ m365 request --url "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/web/RoleAssignments/GetByPrincipalId(33)/RoleDefinitionBindings" --output json`

<details>
<summary>36 lines</summary>

```
{
  "odata.metadata": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/$metadata#SP.ApiData.RoleDefinitions",
  "value": [
    {
      "odata.type": "SP.RoleDefinition",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleDefinitions(1073741826)",
      "odata.editLink": "Web/RoleDefinitions(1073741826)",
      "BasePermissions": {
        "High": "176",
        "Low": "138612833"
      },
      "Description": "Umožňuje zobrazit stránky a položky seznamu a stáhnout dokumenty.",
      "Hidden": false,
      "Id": 1073741826,
      "Name": "Čtení",
      "Order": 128,
      "RoleTypeKind": 2
    },
    {
      "odata.type": "SP.RoleDefinition",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleDefinitions(1073741825)",
      "odata.editLink": "Web/RoleDefinitions(1073741825)",
      "BasePermissions": {
        "High": "48",
        "Low": "134287360"
      },
      "Description": "Po udělení příslušných oprávnění umožňuje zobrazit určité seznamy, knihovny dokumentů a položky seznamu.",
      "Hidden": true,
      "Id": 1073741825,
      "Name": "Omezený přístup",
      "Order": 160,
      "RoleTypeKind": 1
    }
  ]
}
<shellId: 32 completed with exit code 0>
```

</details>


---

<sub>4m 5s</sub>

### `bash`

**Ověření čtení webu pro schvalovatele**

`$ m365 request --url "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/web/RoleAssignments/GetByPrincipalId(34)/RoleDefinitionBindings" --output json`

<details>
<summary>36 lines</summary>

```
{
  "odata.metadata": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/$metadata#SP.ApiData.RoleDefinitions",
  "value": [
    {
      "odata.type": "SP.RoleDefinition",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleDefinitions(1073741826)",
      "odata.editLink": "Web/RoleDefinitions(1073741826)",
      "BasePermissions": {
        "High": "176",
        "Low": "138612833"
      },
      "Description": "Umožňuje zobrazit stránky a položky seznamu a stáhnout dokumenty.",
      "Hidden": false,
      "Id": 1073741826,
      "Name": "Čtení",
      "Order": 128,
      "RoleTypeKind": 2
    },
    {
      "odata.type": "SP.RoleDefinition",
      "odata.id": "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava/_api/Web/RoleDefinitions(1073741825)",
      "odata.editLink": "Web/RoleDefinitions(1073741825)",
      "BasePermissions": {
        "High": "48",
        "Low": "134287360"
      },
      "Description": "Po udělení příslušných oprávnění umožňuje zobrazit určité seznamy, knihovny dokumentů a položky seznamu.",
      "Hidden": true,
      "Id": 1073741825,
      "Name": "Omezený přístup",
      "Order": 160,
      "RoleTypeKind": 1
    }
  ]
}
<shellId: 33 completed with exit code 0>
```

</details>


---

<sub>4m 6s</sub>

### `bash`

**Závěrečná kontrola členů obou skupin**

`$ m365 spo group member list --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --groupName "Nákupy Zadavatelé" --output text && m365 spo group member list --webUrl https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava --groupName "Nákupy Schvalovatelé" --output text`

<details>
<summary>9 lines</summary>

```
Email            : jana.svobodova@pavelchocholousgmail.onmicrosoft.com
Id               : 22
Title            : Svobodová Jana
UserPrincipalName: jana.svobodova@pavelchocholousgmail.onmicrosoft.com

Email            : tomas.prochazka@pavelchocholousgmail.onmicrosoft.com
Id               : 21
Title            : Procházka Tomáš
UserPrincipalName: tomas.prochazka@pavelchocholousgmail.onmicrosoft.com
<shellId: 34 completed with exit code 0>
```

</details>


---

<sub>4m 13s</sub>

### Copilot

Nastavení pro **Nákupy** je hotové a ověřené přes M365 CLI:

- Jana je ve skupině **Nákupy Zadavatelé**; ta má na webu Čtení a na seznamu novou úroveň **Nákupy Zadavatel**.
- Tomáš je ve skupině **Nákupy Schvalovatelé**; na seznamu má **Nákupy Schvalovatel bez mazání**. Tato úroveň obsahuje `CancelCheckout`, ale ne `DeleteListItems`.
- Seznam **PozadavkyCopilot3** má jedinečná oprávnění, `ReadSecurity=2` a `WriteSecurity=2`. Vlastníci webu mají Úplné řízení.

Položky ani skupiny jsem nemazal. Změnil jsem ale seznamu zděděná oprávnění a nahradil je uvedenými přístupy; ostatní dřívější skupiny už z tohoto seznamu přístup nemají. Ověřil jsem konfiguraci, nikoli chování přihlášením jako Jana a Tomáš.

---

<sub>Generated by [GitHub Copilot CLI](https://github.com/features/copilot/cli)</sub>
