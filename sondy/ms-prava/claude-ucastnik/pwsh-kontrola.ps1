# Ověření příkazů ze SKILL.md egd-prava-role (varianta B, PowerShell): výraz pro úroveň bez mazání a kontrola přiřazení.
# V labu místo m365 volá tools/lab-m365.sh (globální v11, sdílené HOME labu).
function m365 { & /Users/chocholous/Projects/egd-workshop/tools/lab-m365.sh @args }
$W = "https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-ms-prava"; $S = "PozadavkyClaude"
$Z = "ViewListItems,AddListItems,EditListItems,DeleteListItems,OpenItems,ViewVersions,DeleteVersions,ManagePersonalViews,ViewFormPages,Open,ViewPages,CreateSSCSite,BrowseDirectories,BrowseUserInfo,AddDelPrivateWebParts,UpdatePersonalWebParts,UseClientIntegration,UseRemoteAPIs,CreateAlerts,EditMyUserInfo"
$ZS = ($Z -replace ",DeleteListItems", "") + ",CancelCheckout"
"PowerShell $($PSVersionTable.PSVersion)"
"ZS obsahuje DeleteListItems: $($ZS -match 'DeleteListItems'); CancelCheckout: $($ZS -match 'CancelCheckout')"
"--- kontrola přiřazení na seznamu"
m365 request --url "$W/_api/web/lists/getbytitle('$S')/roleassignments?`$expand=Member,RoleDefinitionBindings" --output json |
  ConvertFrom-Json | ForEach-Object { $_.value } |
  ForEach-Object { "{0} = {1}" -f $_.Member.Title, (($_.RoleDefinitionBindings | ForEach-Object Name) -join ", ") }
