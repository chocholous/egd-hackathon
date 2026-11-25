#!/usr/bin/env bash
# Nastaví (nebo jen přečte) časové pásmo SharePoint webu. CLI for Microsoft 365 v11 to nemá
# (spo site add --timeZone jen pro ClassicSite), proto standardní CSOM volání ProcessQuery přes `m365 request`.
set -euo pipefail
if [ "${1:-}" = "--help" ] || [ $# -lt 1 ]; then cat <<'U'
Použití: tools/spo-web-pasmo.sh <url-webu> [<id-pásma>] [--ano]
  bez id jen vypíše aktuální pásmo; s id a bez --ano vypíše plán (rc 10).
  id-pásma: SharePoint TimeZone Id. Praha = 6 „(UTC+01:00) Praha, Bratislava, …“; seznam:
            m365 request --url "<web>/_api/web/RegionalSettings/TimeZones" --accept 'application/json;odata=nometadata'
  Proměnná M365 = příkaz CLI (výchozí m365; v labu M365=tools/lab-m365.sh).
Proč: nové weby v labu mají pásmo (UTC-08:00) Tichomoří USA (Id 13). Datum zapsané jako půlnoc UTC
pak web zobrazí o den dřív (✅ 24. 11., sondy/katalog-funkci/dukazy/datum.log).
U
exit 0; fi
M365=${M365:-m365}; WEB=$1; ID=${2:-}; ANO=${3:-}
ted() { $M365 request --url "$WEB/_api/web/RegionalSettings/TimeZone" --accept 'application/json;odata=nometadata' -o json | jq -r '"\(.Id) \(.Description)"'; }
echo "nyní: $(ted)"
[ -z "$ID" ] && exit 0
[[ "$ID" =~ ^[0-9]+$ ]] || { echo "id pásma musí být číslo" >&2; exit 2; }
if [ "$(ted | cut -d' ' -f1)" = "$ID" ]; then echo "už nastaveno"; exit 0; fi
[ "$ANO" = "--ano" ] || { echo "PLÁN: nastavit pásmo $ID na $WEB (přidej --ano)"; exit 10; }
X='<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="egd-pasmo" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009"><Actions><SetProperty Id="10" ObjectPathId="3" Name="TimeZone"><Parameter ObjectPathId="5" /></SetProperty><Method Name="Update" Id="11" ObjectPathId="3" /></Actions><ObjectPaths><StaticProperty Id="1" TypeId="{3747adcd-a3c3-41b9-bfab-4a64dd2f1e0a}" Name="Current" /><Property Id="2" ParentId="1" Name="Web" /><Property Id="3" ParentId="2" Name="RegionalSettings" /><Property Id="4" ParentId="3" Name="TimeZones" /><Method Id="5" ParentId="4" Name="GetById"><Parameters><Parameter Type="Int32">'"$ID"'</Parameter></Parameters></Method></ObjectPaths></Request>'
r=$($M365 request --method post --url "$WEB/_vti_bin/client.svc/ProcessQuery" --content-type 'text/xml' --body "$X" -o json)
jq -e '.[0].ErrorInfo == null' >/dev/null <<<"$r" || { echo "CHYBA: $r" >&2; exit 1; }
echo "po změně: $(ted)"
