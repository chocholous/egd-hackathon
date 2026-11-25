# Průvodní text k rozeslání (koncept, nic se neposílá)

**Předmět:** Příprava na vibecoding workshop EG.D (středa 25. 11.): zkontrolujte si počítač

Dobrý den,

ve středu 25. 11. 2026 se uvidíme na vibecoding workshopu. Aby se první hodina nespotřebovala instalacemi a hledáním práv, posíláme vám malý **skill** (balíček pokynů pro AI agenta), který za vás zkontroluje, co už máte připravené, a vyrobí krátkou zprávu o výsledku.

## Co máte udělat (asi 20–40 minut, většinu času se čeká na stahování)

1. Rozbalte přiloženou složku `egd-pripravenost` do `%USERPROFILE%\.copilot\skills\` (pro Copilot) nebo podle `README.md` pro Claude Code. Název složky nechte přesně takto.
2. Otevřete svého AI agenta (VS Code s GitHub Copilot Chatem v režimu Agent, GitHub Copilot CLI, nebo Claude Code) a napište: „zkontroluj připravenost na workshop“.
3. Agent vás provede kroky. **Přihlášení k Microsoft 365 děláte vždy vy sami** (v prohlížeči nebo kódem v terminálu); heslo ani kód agentovi nikdy nepište.
4. Na konci vznikne soubor `pripravenost-<vaše jméno>.md`. **Pošlete nám ho zpátky** co nejdřív, ať zbyde čas objednávky vyřídit [TERMÍN DOPLNÍ LEKTOR]. Najdete v něm doporučený postup a u všeho, co nefunguje, hotovou větu pro E.ON ITSM.

## Co agent smí a nesmí

- Nic nemaže a nic nenastavuje pro celou firmu.
- Zapisuje jen na váš DEV web a až po vašem výslovném „ano“: zkušební seznam s jednou položkou a nakonec malou appku (seznam a balíček v katalogu aplikací vašeho webu).
- Nic neposílá nikam ven.

## Co si objednejte předem (E.ON ITSM, ať stihnete schválení)

- licenci **GitHub Copilot** (a přístup do firemní organizace GitHub),
- **tři weby** DEV / TEST / PROD, pokud je ještě nemáte,
- **katalog aplikací** na vašem DEV webu (u nového webu se zakládá ručně na žádost na sharepoint@eon.com),
- počítejte s tím, že povolení vlastních skriptů na webu trvá až 24 hodin.

Přesné věty žádostí najdete ve zprávě, kterou skill vyrobí.

## Důležité: co jsme nestihli ověřit

Skill jsme testovali v našem zkušebním prostředí. Nebuďte proto překvapeni, když na něco narazíte; je to přesně ten důvod, proč vás prosíme o zprávu předem.

1. **Windows a PowerShell 5.1 jsme nikdy nespustili.** Skill i postupy jsme zkoušeli na počítači s macOS a Windows kroky (včetně portable Node, příkazů PowerShellu a omezení zásad skriptů) máme jen z dokumentace. Na Windows tedy může něco selhat; zprávu o tom prosím přiložte.
2. **Celý běh šel jen pod správcovským účtem našeho zkušebního tenantu.** Pod běžným účastnickým účtem (role Člen, vaše podmínky přihlášení, MFA, Conditional Access) jsme ho neověřili. Na tenantu E.ON jsme nic nespouštěli, takže postupy označené ⛔ se ověří až u vás.
3. **Vykreslení appky jsme v prohlížeči viděli jen ve zkušebním tenantu** (hlasování pod testovacím účtem role Člen). Na vašem tenantu a vašich počítačích to ověřeno není: nasazení, seznam a indexy jsme ověřili skriptem, ale to, že se appka zobrazí a tlačítka fungují, ověřte prosím při posledním kroku vlastníma očima.

Ještě neověřeno: VS Code Agent mode (Copilot CLI jsme ověřili), Copilot na bezplatném osobním účtu a ruční nahrání appky v prohlížeči, když CLI nejde.

Značky ve skillu: ✅ změřeno v našem prostředí, 📘 podle dokumentace, ❓ neověřeno, ⛔ ověří se až u vás.

## Když něco nejde

Pošlete nám soubor `pripravenost-<jméno>.md` i s tím, co nejde, nebo nám napište chybovou hlášku (bez hesel a kódů).

Děkujeme a těšíme se na středu.
