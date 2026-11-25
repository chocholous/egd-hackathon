#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Jednorázové přihlášení admina labu do Microsoft Graph PowerShell se širokými scopes. Token se uloží
  do cache (~/.mg), takže agenti pak spouštějí Graph skripty bez dalšího přihlášení.

.DESCRIPTION
  Spouští Pavel (okno prohlížeče, účet pavel.admin@… v lab tenantu). Scopes jsou záměrně široké
  (Pavel, 22. 11.). Přidat další jde kdykoli: -Pridat 'Scope.A','Scope.B' → nový souhlas jen na ně.
  Změny bezpečnostních politik (Policy.ReadWrite.*) tu nejsou; ty spouští Pavel vlastními skripty.

.PARAMETER Pridat  Další scopes navíc k výchozím (inkrementální souhlas).
.PARAMETER Stav    Jen vypíše, kdo je přihlášený a s jakými scopes.

.EXAMPLE
  pwsh tools/lab-graph-prihlaseni.ps1
  pwsh tools/lab-graph-prihlaseni.ps1 -Pridat 'Mail.Send'
  pwsh tools/lab-graph-prihlaseni.ps1 -Stav
#>
param([string[]]$Pridat = @(), [switch]$Stav, [switch]$Help)
$ErrorActionPreference = 'Stop'
if ($Help) { Get-Help $PSCommandPath -Detailed; exit 0 }

$Tenant = $env:LAB_TENANT_ID ?? '972a674c-7b85-4e56-a31f-b2f95b42fd1e'
# Výchozí sada: čtení všeho + zápis do uživatelů, skupin, aplikací, webů. Bez Policy.ReadWrite.*.
$Vychozi = @(
  'User.ReadWrite.All','Group.ReadWrite.All','GroupMember.ReadWrite.All','Directory.Read.All',
  'Application.ReadWrite.All','AppRoleAssignment.ReadWrite.All','DelegatedPermissionGrant.ReadWrite.All',
  'Sites.FullControl.All','Files.ReadWrite.All','Organization.Read.All','Policy.Read.All',
  'RoleManagement.Read.Directory','UserAuthenticationMethod.Read.All','AuditLog.Read.All',
  'Reports.Read.All','IdentityRiskyUser.Read.All','Domain.Read.All','LicenseAssignment.ReadWrite.All'
)

Import-Module Microsoft.Graph.Authentication
if (-not $Stav) {
  Connect-MgGraph -TenantId $Tenant -Scopes ($Vychozi + $Pridat | Select-Object -Unique) -NoWelcome
}
$ctx = Get-MgContext
if (-not $ctx) { Write-Host 'Nepřihlášen.'; exit 1 }
Write-Host "Přihlášen: $($ctx.Account) v tenantu $($ctx.TenantId)"
if ($ctx.TenantId -ne $Tenant) { Write-Warning "Jiný tenant než lab ($Tenant)!" }
Write-Host "Scopes ($($ctx.Scopes.Count)): $($ctx.Scopes -join ', ')"
