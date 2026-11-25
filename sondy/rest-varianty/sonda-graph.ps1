# Sonda: co umi Microsoft Graph (PowerShell SDK, delegovane, appId Microsoft Graph Command Line Tools) na webu pro appku.
# Predpoklad: clovek se predtim prihlasil (Connect-MgGraph -UseDeviceAuthentication -ContextScope CurrentUser).
# Pouziti: pwsh -File sonda-graph.ps1 -Web <url> -Sppkg <cesta> [-Seznam SpokojenostGraph] [-Ano]
param([Parameter(Mandatory)][string]$Web, [Parameter(Mandatory)][string]$Sppkg, [string]$Seznam = 'SpokojenostGraph', [switch]$Ano)
Connect-MgGraph -NoWelcome -ContextScope CurrentUser | Out-Null
function Try-Call($k, [scriptblock]$b) { try { $r = & $b; Write-Output "OK  ${k}"; return $r } catch { $m = ($_.ErrorDetails.Message, $_.Exception.Message | Where-Object { $_ } | Select-Object -First 1); Write-Output ("ERR {0}: {1}" -f $k, $m.Substring(0, [Math]::Min(220, $m.Length))); return $null } }
$u = [uri]$Web
$site = Try-Call 'site' { Invoke-MgGraphRequest -Method GET -Uri ("https://graph.microsoft.com/v1.0/sites/{0}:{1}" -f $u.Host, $u.AbsolutePath) }
if (-not $site) { exit 1 }
$sid = $site.id; Write-Output "site id: $sid"
if (-not $Ano) { Write-Output 'plan: bez -Ano jen cteni'; exit 10 }
$body = @{ displayName = $Seznam; list = @{ template = 'genericList' }; columns = @(
  @{ name = 'Hodnoceni'; number = @{ decimalPlaces = 'none'; minimum = 1; maximum = 5 }; required = $true },
  @{ name = 'DenCislo'; number = @{ decimalPlaces = 'none' }; required = $true; indexed = $true },
  @{ name = 'Klic'; text = @{}; required = $true; indexed = $true; enforceUniqueValues = $true }) } | ConvertTo-Json -Depth 8
$l = Try-Call 'seznam + sloupce' { Invoke-MgGraphRequest -Method POST -Uri "https://graph.microsoft.com/v1.0/sites/$sid/lists" -Body $body -ContentType 'application/json' }
if ($l) { $cols = Try-Call 'sloupce zpet' { Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/sites/$sid/lists/$($l.id)/columns?`$select=name,indexed,enforceUniqueValues" }
  if ($cols) { $cols.value | Where-Object { $_.name -in 'DenCislo', 'Klic' } | ForEach-Object { "  $($_.name): indexed=$($_.indexed) unique=$($_.enforceUniqueValues)" } } }
$drives = Try-Call 'knihovny webu' { Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/sites/$sid/drives?`$select=id,name" }
$cat = $drives.value | Where-Object { $_.name -match 'AppCatalog|Aplikace pro SharePoint|Apps for SharePoint' } | Select-Object -First 1
Write-Output ("knihovna katalogu: {0}" -f ($cat.name))
if ($cat) { Try-Call 'upload .sppkg do katalogu' { Invoke-MgGraphRequest -Method PUT -Uri "https://graph.microsoft.com/v1.0/drives/$($cat.id)/root:/spokojenost-graph-sonda.sppkg:/content" -InputFilePath $Sppkg -ContentType 'application/octet-stream' } | Out-Null }
Try-Call 'stranka (sitePage)' { Invoke-MgGraphRequest -Method POST -Uri "https://graph.microsoft.com/v1.0/sites/$sid/pages" -Body (@{ '@odata.type' = '#microsoft.graph.sitePage'; name = 'graph-sonda.aspx'; title = 'Graph sonda' } | ConvertTo-Json) -ContentType 'application/json' } | Out-Null
Write-Output 'Deploy / Install balicku: v Graphu endpoint neexistuje, kontrola pres SharePoint REST nize'
