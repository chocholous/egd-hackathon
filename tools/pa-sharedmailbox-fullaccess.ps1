<#
.SYNOPSIS
  Přidá uživateli FullAccess na sdílenou schránku (AutoMapping vypnutý). Idempotentní. Lab: ověřit, jestli akce „Send an email from a shared mailbox (V2)“ potřebuje i FullAccess.
.EXAMPLE
  $env:EXO_TOKEN=$(az account get-access-token --resource https://outlook.office365.com --query accessToken -o tsv)
  pwsh tools/pa-sharedmailbox-fullaccess.ps1 -Organization x.onmicrosoft.com -Mailbox egd-report@x.onmicrosoft.com -User tomas.prochazka@x.onmicrosoft.com
#>
param([Parameter(Mandatory)][string]$Organization, [Parameter(Mandatory)][string]$Mailbox, [Parameter(Mandatory)][string]$User)
$ErrorActionPreference = 'Stop'
if (-not $env:EXO_TOKEN) { throw 'chybí EXO_TOKEN (viz .EXAMPLE)' }
Import-Module ExchangeOnlineManagement
Connect-ExchangeOnline -AccessToken $env:EXO_TOKEN -Organization $Organization -ShowBanner:$false
$has = Get-MailboxPermission -Identity $Mailbox -User $User -ErrorAction SilentlyContinue | Where-Object { $_.AccessRights -contains 'FullAccess' }
if (-not $has) { Add-MailboxPermission -Identity $Mailbox -User $User -AccessRights FullAccess -AutoMapping:$false -Confirm:$false | Out-Null; Write-Host "FullAccess přidáno: $User -> $Mailbox" } else { Write-Host "FullAccess už je: $User -> $Mailbox" }
Get-MailboxPermission -Identity $Mailbox -User $User | Format-Table User, AccessRights, IsInherited
Disconnect-ExchangeOnline -Confirm:$false
