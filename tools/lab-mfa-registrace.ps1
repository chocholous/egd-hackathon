#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Vyjme skupinu „EGD workshop účastníci“ z kampaně registrace Authenticatoru (Authentication methods →
  Registration campaign) v lab tenantu, nebo výjimku vrátí. Spouští Pavel jako admin labu.

.DESCRIPTION
  Přihlásí se do Microsoft Graph (okno prohlížeče, účet admina labu, scope
  Policy.ReadWrite.AuthenticationMethod), přečte authenticationMethodsPolicy.registrationEnforcement
  a upraví jen excludeTargets kampaně. Nic jiného nemění. Před a po změně vypíše stav.

  Druhé možné místo, které nutí registraci, je ID Protection → „Multifactor authentication registration
  policy“. Pro to Graph API není, skript vypíše odkaz do portálu a postup.

.PARAMETER Stav     Jen vypíše současné nastavení (nic nemění).
.PARAMETER Vyjmout  Přidá skupinu do excludeTargets kampaně.
.PARAMETER Vratit   Odebere skupinu z excludeTargets (úklid po workshopu).

.EXAMPLE
  pwsh tools/lab-mfa-registrace.ps1 -Stav
  pwsh tools/lab-mfa-registrace.ps1 -Vyjmout
  pwsh tools/lab-mfa-registrace.ps1 -Vratit
#>
param([switch]$Stav, [switch]$Vyjmout, [switch]$Vratit, [switch]$Help)
$ErrorActionPreference = 'Stop'
if ($Help -or -not ($Stav -or $Vyjmout -or $Vratit)) { Get-Help $PSCommandPath -Detailed; exit 0 }

# Lab tenant a skupina (z 03-lab.md a 08-ucty-ucastniku.md); přepiš proměnnými prostředí, chceš-li jinam.
$Tenant  = $env:LAB_TENANT_ID   ?? '972a674c-7b85-4e56-a31f-b2f95b42fd1e'
$Skupina = $env:LAB_SKUPINA_ID  ?? '4f80b979-22ca-493e-a0c4-a5eeccbe4cc5'   # EGD workshop účastníci
$Url     = 'https://graph.microsoft.com/v1.0/policies/authenticationMethodsPolicy'

Import-Module Microsoft.Graph.Authentication
$scope = if ($Stav) { 'Policy.Read.All' } else { 'Policy.ReadWrite.AuthenticationMethod' }
Connect-MgGraph -TenantId $Tenant -Scopes $scope -NoWelcome
$ctx = Get-MgContext
if (-not $ctx.Account) { throw "Přihlášení neproběhlo. Spusť skript v terminálu, kde se může otevřít okno prohlížeče (ne přes ! v chatu)." }
Write-Host "Přihlášen: $($ctx.Account) v tenantu $($ctx.TenantId)"
if ($ctx.TenantId -ne $Tenant) { throw "Jiný tenant než lab ($Tenant), končím." }

function Ukaz($p) {
  $c = $p.registrationEnforcement.authenticationMethodsRegistrationCampaign
  Write-Host "Kampaň: state=$($c.state) snoozeDurationInDays=$($c.snoozeDurationInDays) enforceRegistrationAfterAllowedSnoozes=$($c.enforceRegistrationAfterAllowedSnoozes)"
  Write-Host "  includeTargets: $(($c.includeTargets | ForEach-Object { "$($_.targetType):$($_.id)" }) -join ', ')"
  Write-Host "  excludeTargets: $(($c.excludeTargets | ForEach-Object { "$($_.targetType):$($_.id)" }) -join ', ')"
  $je = @($c.excludeTargets | Where-Object { $_.id -eq $Skupina }).Count -gt 0
  Write-Host "  Skupina účastníků je vyjmutá: $je"
  return $c
}

$pol = Invoke-MgGraphRequest -Method GET -Uri $Url
$c = Ukaz $pol

if ($Vyjmout -or $Vratit) {
  $ex = @($c.excludeTargets | Where-Object { $_.id -ne $Skupina } | ForEach-Object { @{ id = $_.id; targetType = $_.targetType } })
  if ($Vyjmout) { $ex += @{ id = $Skupina; targetType = 'group' } }
  # Prázdná (null) pole Graph odmítne („The configured RegistrationEnforcement is invalid“, 400) → vynechat.
  $kamp = @{ excludeTargets = $ex
      includeTargets = @($c.includeTargets | ForEach-Object {
        $t = @{ id = $_.id; targetType = $_.targetType }
        # Kampaň registruje jen Authenticator; Graph u cíle bez metody vrací 400 → doplnit.
        $t.targetedAuthenticationMethod = $_.targetedAuthenticationMethod ?? 'microsoftAuthenticator'
        $t }) }
  foreach ($k in 'state','snoozeDurationInDays','enforceRegistrationAfterAllowedSnoozes') {
    if ($null -ne $c.$k -and "$($c.$k)" -ne '') { $kamp[$k] = $c.$k } }
  $body = @{ registrationEnforcement = @{ authenticationMethodsRegistrationCampaign = $kamp } } | ConvertTo-Json -Depth 8
  Write-Host "Posílám: $body"
  Invoke-MgGraphRequest -Method PATCH -Uri $Url -Body $body -ContentType 'application/json' | Out-Null
  Write-Host "`nPo změně:"; Ukaz (Invoke-MgGraphRequest -Method GET -Uri $Url) | Out-Null
}

Write-Host @"

Druhé místo (Graph API pro něj není, udělej ručně):
  https://portal.azure.com/#view/Microsoft_AAD_IAM/IdentityProtectionMenuBlade/~/MfaRegistration
  → Users → Exclude → vyber skupinu „EGD workshop účastníci“ → Save.
  (Policy existuje jen s licencí Entra ID P2; v E5 trialu ano.)
Třetí možnost, pokud by to nebylo ani jedno: Protection → Password reset → Registration →
  „Require users to register when signing in“ (jen pro SSPR, ukazuje „More information required“).
"@
