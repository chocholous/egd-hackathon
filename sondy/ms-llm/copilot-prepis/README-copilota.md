# Spokojenost s AI

SPFx web part používá variantu 1: sdílenou LLM gateway přes `AadHttpClient` a přihlášený účet. API klíč k modelu není v aplikaci; `X-App-Id: demo` je identifikátor aplikace pro kvótu gateway.

AI shrnutí odesílá pouze anonymní souhrnné počty a průměr z dnešního dashboardu. OCR odesílá obsah vybraného PDF nebo obrázku; aplikace omezuje soubor na 3 MB. Výstup AI je návrh k ověření uživatelem.

Balíček požaduje oprávnění API `Gateway.Use` pro uvedenou registraci gateway. Správce SharePointu musí žádost schválit v API access. Gateway uvedená pro tuto ukázku přijímá pouze tokeny svého lab tenantu; pokud web běží v jiném tenantovi, IT musí poskytnout odpovídající gateway a registraci API.
