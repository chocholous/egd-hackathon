# Cesty A/B – stav v labu (2026-11-22, session ms-llm)

## Licence v tenantu (Graph `subscribedSkus`, `licence.json`)
- `BUSINESS_PREMIUM_AND_MICROSOFT_365_COPILOT_FOR_BUSINESS`: 1 licence, přiřazená jen `alice@…` (Graph filtr assignedLicenses).
- `SPE_E5` 25 (23 použito): Power Automate/Power Apps jen `FLOW_O365_P3` / `POWERAPPS_O365_P3` (seeded, standardní konektory).
- `FLOW_FREE` (viral) 10000, `AGENT_365` 25. **Žádný servisní plán AI Builder ani Power Automate Premium** (hledáno `AI_BUILDER`, `FLOW`, `SYNTEX`, `POWERAPPS`, `COPILOT` v názvech plánů).

## Cesta A: Microsoft 365 Copilot Chat API (Graph beta `/copilot/conversations`)
- az CLI token (host pavel.chocholous, bez Copilot licence): `POST /beta/copilot/conversations` → HTTP 401 `UnknownError`.
- Lab uživatel tomas.prochazka (bez Copilot licence), ROPC token klienta Microsoft Graph PowerShell → HTTP 403:
  `Required scopes = [Sites.Read.All, Mail.Read, People.Read.All, OnlineMeetingTranscript.Read.All, Chat.Read, ChannelMessage.Read.All, ExternalItem.Read.All]`.
- Závěr ✅: API vyžaduje 7 širokých delegovaných oprávnění (pošta, chaty, přepisy schůzek). Pro SPFx by je SharePoint admin musel udělit
  principalu „SharePoint Online Web Client Extensibility“ = **všem SPFx appkám v tenantu**. Volání s licencí (alice) neověřeno: heslo alice není v lab.secrets.json.

## Cesta B: Power Platform (katalog konektorů výchozího prostředí, `pa-konektory-ai.md`)
- Filtr „AI Builder“ / „aibuilder“: **žádný konektor** v katalogu ✅ (AI Builder akce nejsou konektor; prostředí bez Dataverse – `m365 pp environment list` v labu padá na AADSTS65001 pro appId CLI, prostředí tedy nečteno ❓).
- `Azure AI Foundry Inference` = **Standard** ✅, `Azure OpenAI` = **Premium** ✅, `Microsoft Copilot Studio` = Standard ✅.
- Funkční varianta B2 (Foundry Inference ve flow, Standard) ✅ změřena v `sondy/power-automate.md` ř. 13 – ale model i klíč jsou pořád Azure.
- AI Builder („Run a prompt“, „Text recognition“) v labu nezměřen: tenant nemá servisní plán AI Builder ani Copilot Credits (licence.json) ❓.
