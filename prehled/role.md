# Role sessions (stálý tým)

Hlavní session rozděluje práci rolím přes `SendMessage` (`to` = session id) a nové sessions zakládá jen
pro práci, kterou nepokrývá žádná role. Role si drží kontext své oblasti. Když role dokončí úkol a další
úkol je z jiné oblasti, hlavní session ji vyčistí (`clear_session`) a pošle jí nový brief s odkazem
na CLAUDE.md. Uvolněnou roli lze přepsat na jinou (nový titul).

| Role | Session id | Vlastní (smí editovat) | Typická práce |
|---|---|---|---|
| Správce labu (účty, weby, Entra) | `local_2c1aae9c-2876-4149-9746-2f366dee3093` | `08-ucty-ucastniku.md`, `tools/lab-ucty-*` | účty, weby, MFA, výdej, úklid, ověření pod účastníkem |
| Licence, trialy a Azure náklady | `local_13beae5b-7a4e-47ee-af87-cc2dd77a37a8` | `07-lab-trial-plan.md`, `06-azure-inventar.md`, `tools/lab-licence-*`, `tools/azure-inventory.sh` | konec trialů, licence, rozpočet, inventura |
| GitHub a Copilot licence | `local_74489c1b-fcb1-4c92-afe0-a419e500aad0` | `09-github-ucastnici.md`, `tools/lab-github-*` | GitHub Enterprise, Copilot licence |
| Prereq skill | `local_8267fb24-36a1-4ea1-8d74-2cda4ebd0f6f` | `skills/egd-pripravenost/` | jediný editor prereq skillu |
| Copilot tester | `local_82dab511-94ca-4e9c-a377-29832e5308d6` | `tools/copilot-*`, `skills/*/TEST-copilot.md` (jen pro egd-pripravenost) | tooling Copilota, testy skillů v Copilotu |
| Skill první appka | `local_4be01f58-5370-4b91-bcb5-09ee79da456f` | `skills/egd-prvni-appka/` | první appka v labu |
| Miniskilly (koordinátor) | `local_3c2cbc25-879d-4280-abd2-7fa37048dfee` (+ jeho ms-* sessions) | `skills/egd-*` mimo dvě výše, `prehled/pozadavky/` přes `tools/pozadavek.sh` | miniskill na každý požadavek |
| Power Automate | `local_4fe130bb-d96c-4daa-8843-f999c1294018` | `sondy/power-automate*`, `tools/pa-*` | Power Automate alternativy |
| Auditor ověření | `local_81d49b45-9bb4-4ca0-9911-621f74efa332` | `audit/` | kontrola kánonu, požadavky autorům |
| Redaktor podkladů | `local_1ac89249-6ab9-4c5c-b7b6-caaf54e9f68a` | `00–06`, `10`, `sondy/_zadani-spolecne.md`, text `sondy/{ai,dokumenty,data-prava,napojeni}.md` | opravy podle auditu, aktuálnost podkladů |
| Ověřovatel sond | `local_5898b4f6-adf1-48d7-818d-cd8cb14dd1ad` | `sondy/overeni/`, `tools/overeni-*` | doměření tvrzení bez důkazu, surové výstupy |
| Hlavní session | – | `README.md`, `CLAUDE.md`, `tools/README.md`, `prehled/` | řízení, přehled, synchronizace |
