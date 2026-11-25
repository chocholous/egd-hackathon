<#
.SYNOPSIS
  Přidá uživateli právo Send As na sdílenou schránku (aby ji Power Automate akce „Send an email from a shared mailbox“ mohla použít jako odesílatele). Idempotentní.
.EXAMPLE
  $env:EXO_TOKEN=$(az account get-access-token --resource https://outlook.office365.com --query accessToken -o tsv)
  pwsh tools/pa-sharedmailbox-sendas.ps1 -Organization x.onmicrosoft.com -Mailbox egd-report@x.onmicrosoft.com -User tomas.prochazka@x.onmicrosoft.com
#>
param([Parameter(Mandatory)][string]$Organization, [Parameter(Mandatory)][string]$Mailbox, [Parameter(Mandatory)][string]$User)
$ErrorActionPreference = 'Stop'
if (-not $env:EXO_TOKEN) { throw 'chybí EXO_TOKEN (viz .EXAMPLE)' }
Import-Module ExchangeOnlineManagement
Connect-ExchangeOnline -AccessToken $env:EXO_TOKEN -Organization $Organization -ShowBanner:$false
$has = Get-RecipientPermission -Identity $Mailbox -Trustee $User -ErrorAction SilentlyContinue | Where-Object { $_.AccessRights -contains 'SendAs' }
if (-not $has) { Add-RecipientPermission -Identity $Mailbox -Trustee $User -AccessRights SendAs -Confirm:$false | Out-Null; Write-Host "SendAs přidáno: $User -> $Mailbox" } else { Write-Host "SendAs už je: $User -> $Mailbox" }
Disconnect-ExchangeOnline -Confirm:$false
