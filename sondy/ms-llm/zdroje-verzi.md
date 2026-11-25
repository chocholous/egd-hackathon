# Zdroje měřených bundlů

- **Spokojenost** (`spokojenost-ai`): `zdroj-spokojenost.diff` = rozdíl proti šabloně `skills/egd-prvni-appka/templates/spokojenost`
  ve stavu zdrojáku 22. 11. ~21:00 (GATEWAY_URL = lab gateway). Verze: 1.0.0.0 bez `_aiGet` a bez větve simulace (e2e-spokojenost);
  1.0.0.1 + `_aiGet` a tlačítko kvóty (e2e-spokojenost-3mb, -velky); 1.0.0.2 = tento diff s `GATEWAY_URL = ''` (e2e-simulace);
  1.0.0.3 = tento diff (postaveno a nasazeno 23. 11. → e2e-1.0.0.3). Větev `if (!GATEWAY_URL)` přibyla v 1.0.0.2; s vyplněnou URL se neuplatní.
- **Evidence** (`prvni-appka`, starší šablona, už není v `egd-prvni-appka`): `zdroj-evidence-1.0.0.4.ts` = poslední stav (APP_KEY 'tiny').
  Má `_ai`, `_shrn`, `_ocr`, **nemá `_aiGet`**. Testovací verze se lišily jen konstantami:
  1.0.0.0 a 1.0.0.3: API_APP_ID = 7b59591a… (gateway), APP_KEY = demo → e2e-1;
  1.0.0.1: API_APP_ID = 4a212388-1e08-4d67-83a8-0fa6eca855a7 (egd-overeni-api, SPFx má grant Test.Read) → e2e-401-jine-api;
  1.0.0.2: API_APP_ID = fec3e01a-6ce4-4f9e-9dff-a61b354151fb (egd-sonda-data-api, SPFx bez grantu) → e2e-aadsts65001;
  1.0.0.4: APP_KEY = tiny → e2e-429. Vše pod lab uživatelem tomas.prochazka@pavelchocholousgmail.onmicrosoft.com (kopie Chrome profilu).
