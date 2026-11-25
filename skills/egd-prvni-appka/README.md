# egd-prvni-appka

Skill pro AI agenta (Claude Code nebo GitHub Copilot), se kterým si na workshopu EG.D postavíte
první appku na SharePointu: **Spokojenost s prostředím kanceláře dnes** - každý jedním kliknutím
ohodnotí den 1–5 a pod tím vidí malý dashboard (dnešní počet hlasů, průměr, rozložení a 7 dní). Agent zvolí nejjednodušší cestu, která na vašem počítači a webu funguje:

- **A** - vlastní SharePoint Framework (SPFx) web part nasazený skriptem na váš web,
- **A2** - stejná appka, jen ji do SharePointu nahrajete ručně v prohlížeči,
- **B** - bez kódu: SharePoint seznam s formátováním, volitelně formulář z Power Apps.

Navazuje na skill **egd-pripravenost** (kontrola počítače). Ten pusťte jako první; tenhle skill
převezme jeho výsledek ze stejné pracovní složky.

## Co je ve složce

```
egd-prvni-appka\
  SKILL.md                    návod pro agenta
  scripts\appka.mjs           pomocný skript (Node, bez závislostí)
  templates\spokojenost\      hotový SPFx 1.24.1 projekt (zdroják appky + package-lock.json)
  references\                 podrobnosti: ruční nahrání, cesta bez kódu, úpravy, chyby
```

## Instalace na Windows (bez admin práv)

Rozbalte ZIP tak, aby `SKILL.md` ležel **přímo** ve složce `egd-prvni-appka`
(ne `egd-prvni-appka\egd-prvni-appka\SKILL.md`). V PowerShellu (upravte cestu k ZIPu):

**Claude Code** (osobní skill, platí pro všechny složky):

```powershell
Expand-Archive -Path "$env:USERPROFILE\Downloads\egd-prvni-appka.zip" -DestinationPath "$env:USERPROFILE\.claude\skills" -Force
Test-Path "$env:USERPROFILE\.claude\skills\egd-prvni-appka\SKILL.md"
```

**GitHub Copilot** (VS Code v režimu Agent, Copilot CLI) - osobní skill:

```powershell
Expand-Archive -Path "$env:USERPROFILE\Downloads\egd-prvni-appka.zip" -DestinationPath "$env:USERPROFILE\.copilot\skills" -Force
Test-Path "$env:USERPROFILE\.copilot\skills\egd-prvni-appka\SKILL.md"
```

nebo jen pro jednu složku (projekt): `<složka>\.github\skills\egd-prvni-appka\` 📘
([GitHub Docs: About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)).
Copilot čte i `.claude\skills` v projektu a osobní `~\.agents\skills` 📘.

`Test-Path` musí vypsat `True`. Stejně nainstalujte `egd-pripravenost`.

### Ověření, že ho agent vidí

| Nástroj | Jak |
|---|---|
| Claude Code | nová konverzace, napište `/egd-prvni-appka` (nebo „postav mi první appku“) |
| VS Code + Copilot | Chat v režimu **Agent**, napište `/` - skill musí být v nabídce 📘 |
| Copilot CLI | `/skills list`; po instalaci za běhu `/skills reload` 📘 |

## Spuštění

1. Otevřete pracovní složku z kontroly připravenosti (obvykle `%USERPROFILE%\egd-workshop`) -
   ve VS Code **Soubor → Otevřít složku**, v Claude Code ji vyberte jako složku projektu.
2. Napište agentovi: **„Postav mi první appku na můj web <adresa webu>.“**
3. Agent vám před každým zápisem do SharePointu ukáže plán a zeptá se. Zapisuje jen na váš web.
4. Na konci dostanete odkaz `.../SitePages/prvni-appka.aspx?env=WebView` - otevřete ho a klikněte
   na číslo 1–5; hlas se hned objeví v dashboardu.

## Co je potřeba

| | Cesta A | A2 | B |
|---|---|---|---|
| Node.js 22 (22.14+) nebo 24, ověřeno na 24.22.3 a 22.23.5 (portable zip stačí) | ano | ano | ne |
| npm k registry (případně certifikát proxy) | ano | ano | ne |
| CLI for Microsoft 365 přihlášené (appId od IT) | ano | ne | ne (pomůže) |
| web s vlastním katalogem aplikací | ano | ano | ne |
| role Člen nebo Vlastník na webu | ano | ano | Člen |

Co chybí, za vás agent zformuluje jako větu pro ServiceNow.

## Stav ověření

Viz `TEST.md` (v repu workshopu). Ověřeno v testovacím tenantu na macOS (Node 22.23.5, build šablony i na 24.22.3, CLI for Microsoft 365
11.11). **Na Windows a v tenantu E.ON neověřeno** - lab je macOS a vlastní tenant. Instalace výše
(`Expand-Archive`, `Test-Path`, cesty `%USERPROFILE%`) je **na Windows nezkoušená**; ověřit na
Windows VM nebo notebooku EG.D. Seznam všeho neověřeného je v `TEST.md` (v repu workshopu), sekce Neověřeno.

## Srovnání cest

| | A (SPFx + skript) | A2 (SPFx ručně) | B (bez kódu) |
|---|---|---|---|
| ověřeno v labu | ✅ celý řetězec (TEST.md) | ✅ v Claude pod egd01 (TEST.md, „Celá cesta A2“); v Copilotu nespuštěno | ✅ jen seznam přes CLI |
| výsledek | vlastní appka na celé okno, dashboard | stejná appka | seznam s přehledem po dnech |
| od IT E.ON | katalog na webu, role Člen, Node 22 (22.14+) nebo 24, npm, appId pro CLI | totéž bez appId | role Člen |
| obtížnost pro citizen developera | nízká (agent dělá vše) | střední (5 kliknutí v SharePointu) | nízká |
| proti | nejvíc předpokladů | ruční kroky, chyby v klikání | žádný vlastní dashboard |
