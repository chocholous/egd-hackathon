#!/usr/bin/env python3
"""Vygeneruje definice zkušebních flow (sondy/power-automate/*.flow.json). Pak: tools/pa-flow.py create <soubor>."""
import json, os, sys
D = os.path.dirname(os.path.abspath(__file__))
DOM = "pavelchocholousgmail.onmicrosoft.com"
SITE = f"https://pavelchocholousgmail.sharepoint.com/sites/egd-sonda-power-automate"
LIST = "de1f2641-34f4-4b2f-a908-4ed6e5528514"  # seznam Zadosti
SCHEMA = "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#"
def ref(api, name): return {"id": f"/providers/Microsoft.PowerApps/apis/{api}", "tier": "NotSpecified", "connectionName": name, "source": "Embedded"}
def op(api, opid, params, after=None):
    return {"type": "OpenApiConnection", "runAfter": after or {}, "inputs": {"host": {"apiId": f"/providers/Microsoft.PowerApps/apis/{api}", "connectionName": api, "operationId": opid},
            "parameters": params, "authentication": "@parameters('$authentication')"}}
REC = {"Recurrence": {"type": "Recurrence", "recurrence": {"frequency": "Month", "interval": 12}}}
def flow(name, refs, trig, acts):
    return {"displayName": name, "connectionReferences": refs, "definition": {"$schema": SCHEMA, "contentVersion": "1.0.0.0",
            "parameters": {"$connections": {"defaultValue": {}, "type": "Object"}, "$authentication": {"defaultValue": {}, "type": "SecureObject"}},
            "triggers": trig, "actions": acts, "outputs": {}}}
SP, O365, OD, FI = "shared_sharepointonline", "shared_office365", "shared_onedriveforbusiness", "shared_azureaifoundryinference"
out = {}
out["mail-shared"] = flow("EGD PA sonda: e-mail ze sdílené schránky s přílohou", {O365: ref(O365, "egd-sonda-office365")}, REC, {
    "Posli": op(O365, "SharedMailboxSendEmailV2", {"emailMessage/MailboxAddress": f"egd-report@{DOM}", "emailMessage/To": f"tomas.prochazka@{DOM}",
        "emailMessage/Subject": "PA sonda: ze sdílené schránky", "emailMessage/Body": "<p>Příloha vznikla ve flow.</p>",
        "emailMessage/Attachments": [{"Name": "kurzy.csv", "ContentBytes": "@base64('mena;kurz\nEUR;24,3')"}]})})
out["queue-llm"] = flow("EGD PA sonda: fronta v seznamu → LLM → výsledek zpět", {SP: ref(SP, "egd-sonda-sharepointonline"), FI: ref(FI, "egd-sonda-foundry")},
    {"Nova_zadost": {"type": "OpenApiConnection", "recurrence": {"frequency": "Minute", "interval": 1}, "inputs": {"host": {"apiId": f"/providers/Microsoft.PowerApps/apis/{SP}", "connectionName": SP, "operationId": "GetOnNewItems"},
       "parameters": {"dataset": SITE, "table": LIST}, "authentication": "@parameters('$authentication')"}, "splitOn": "@triggerOutputs()?['body/value']"}}, {
    "LLM": op(FI, "ChatCompletion", {"api-version": "2024-10-21", "body": {"max_tokens": 150, "messages": [
        {"role": "system", "content": [{"type": "text", "text": "Odpovídej česky, stručně."}]},
        {"role": "user", "content": [{"type": "text", "text": "@{triggerOutputs()?['body/Title']}"}]}]}}),
    "Zapis": op(SP, "PatchItem", {"dataset": SITE, "table": LIST, "id": "@triggerOutputs()?['body/ID']",
        "item/Vysledek": "@{body('LLM')?['choices']?[0]?['message']?['content']}"}, {"LLM": ["Succeeded"]})})
out["grant"] = flow("EGD PA sonda: sdílení položky vybraným lidem", {SP: ref(SP, "egd-sonda-sharepointonline")}, REC, {
    "Sdilej": op(SP, "GrantAccess", {"dataset": SITE, "table": LIST, "id": 1, "parameter/recipients": f"eva.vesela@{DOM}", "parameter/roleValue": "Read", "parameter/sendEmail": False})})
out["convert-pdf"] = flow("EGD PA sonda: Word → PDF přes OneDrive Convert file (Standard)", {SP: ref(SP, "egd-sonda-sharepointonline"), OD: ref(OD, "egd-sonda-onedrive")}, REC, {
    "Nacti_docx": op(SP, "GetFileContentByPath", {"dataset": SITE, "path": "/Shared Documents/sablona-test.docx", "inferContentType": True}),
    "Do_OneDrive": op(OD, "CreateFile", {"folderPath": "/", "name": "sablona-test.docx", "body": "@body('Nacti_docx')"}, {"Nacti_docx": ["Succeeded"]}),
    "Na_PDF": op(OD, "ConvertFile", {"id": "@body('Do_OneDrive')?['Id']", "type": "PDF"}, {"Do_OneDrive": ["Succeeded"]}),
    "Do_SharePointu": op(SP, "CreateFile", {"dataset": SITE, "folderPath": "/Shared Documents", "name": "sablona-test.pdf", "body": "@body('Na_PDF')"}, {"Na_PDF": ["Succeeded"]})})
for k, v in out.items():
    json.dump(v, open(f"{D}/{k}.flow.json", "w"), ensure_ascii=False, indent=1)
print(list(out))
