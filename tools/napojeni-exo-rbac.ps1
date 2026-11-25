<#
.SYNOPSIS
  Exchange RBAC for Applications: omezí identitu (managed identity / app) na Mail.Send z JEDNÉ schránky.
  Volitelně založí sdílenou schránku (bez licence). Idempotentní. V Entra ID se nepřiděluje žádné Graph oprávnění.
.DESCRIPTION
  Vyžaduje EXO_TOKEN (az account get-access-token --resource https://outlook.office365.com) a roli správce.
.EXAMPLE
  $env:EXO_TOKEN=$(az account get-access-token --resource https://outlook.office365.com --query accessToken -o tsv)
  pwsh napojeni-exo-rbac.ps1 -Organization x.onmicrosoft.com -Mailbox egd-report@x.onmicrosoft.com `
     -AppId <miAppId> -ObjectId <miObjectId> -Name "egd-report job" -CreateSharedMailbox
  Přepínač -Check jen otestuje rozsah (Test-ServicePrincipalAuthorization) pro další adresy: -CheckMailboxes a@x,b@x
#>
param(
  [Parameter(Mandatory)][string]$Organization, [Parameter(Mandatory)][string]$Mailbox,
  [Parameter(Mandatory)][string]$AppId, [Parameter(Mandatory)][string]$ObjectId, [Parameter(Mandatory)][string]$Name,
  [string]$ScopeName = ("egd-sonda: odesilani " + $Mailbox.Split("@")[0]), [switch]$CreateSharedMailbox, [string[]]$CheckMailboxes = @()
)
$ErrorActionPreference = 'Stop'
if (-not $env:EXO_TOKEN) { throw 'chybí EXO_TOKEN (viz .EXAMPLE)' }
Import-Module ExchangeOnlineManagement
Connect-ExchangeOnline -AccessToken $env:EXO_TOKEN -Organization $Organization -ShowBanner:$false
if ($CreateSharedMailbox -and -not (Get-Mailbox -Identity $Mailbox -ErrorAction SilentlyContinue)) {
  $alias = $Mailbox.Split('@')[0]
  New-Mailbox -Shared -Name $alias -DisplayName "EGD report (sonda)" -PrimarySmtpAddress $Mailbox | Out-Null
  Write-Host "sdílená schránka: $Mailbox"
}
if (-not (Get-ManagementScope -Identity $ScopeName -ErrorAction SilentlyContinue)) {
  New-ManagementScope -Name $ScopeName -RecipientRestrictionFilter "PrimarySmtpAddress -eq '$Mailbox'" | Out-Null
  Write-Host "scope: $ScopeName"
}
if (-not (Get-ServicePrincipal -Identity $ObjectId -ErrorAction SilentlyContinue)) {
  New-ServicePrincipal -AppId $AppId -ObjectId $ObjectId -DisplayName $Name | Out-Null
  Write-Host "service principal v Exchange: $Name"
}
$have = Get-ManagementRoleAssignment -RoleAssignee $ObjectId -Role 'Application Mail.Send' -ErrorAction SilentlyContinue | Where-Object CustomResourceScope -eq $ScopeName
if (-not $have) { New-ManagementRoleAssignment -App $ObjectId -Role 'Application Mail.Send' -CustomResourceScope $ScopeName | Out-Null; Write-Host "přiřazeno Application Mail.Send -> $ScopeName" }
foreach ($m in @($Mailbox) + $CheckMailboxes) {
  Test-ServicePrincipalAuthorization -Identity $ObjectId -Resource $m | Select-Object @{n='Schranka';e={$m}}, RoleName, InScope | Format-Table | Out-String | Write-Host
}
Disconnect-ExchangeOnline -Confirm:$false
