# Brief: E2E běh účastníka v GitHub Copilot (druhý běh podle kánonu)

Pro: Copilot tester (`local_82dab511…`). Napsal: e2e-ucastnik (Claude běh), 24. 11. 2026.
Vzor a pasti: [../README.md](../README.md) (běh v Claude pod egd10, 23 min, celý ✅). Pravidla: `CLAUDE.md`.
Stav hlásit `tools/stav.sh e2e-copilot … -o lab`. Výstup: `sondy/e2e/copilot/README.md` (stejná časová osa jako v Claude
běhu: krok, čas, co účastník viděl, ✅/❌, důkaz, minuty) a `sondy/e2e/copilot/dukazy/`. Necommitovat.

## Co se testuje

Copilot jako agent účastníka projde **egd-pripravenost → egd-prvni-appka** na webu účastníka, od zadání po nasazenou appku.
Orchestrace (výdej, okno prohlížeče, ověření v prohlížeči, úklid) dělá tester, ne Copilot – v Claude běhu to dělal agent
za „člověka“ stejně.

## 0. Příprava (tester + Pavel, mimo Copilot)

1. Volný účet: `tools/lab-vydej.py stav`. Navrhuji **egd09** (egd10 nechat jako důkaz Claude běhu).
2. Okno účastníka: `sondy/e2e/okno.sh e2e-egd09 https://witty-pond-0f3afad0f.4.azurestaticapps.net`
   (viditelný Chrome, čistý profil, CDP na náhodném portu).
3. Rezervace: `node sondy/e2e/rezervuj.mjs e2e-egd09 egd09 "E2E Copilot" sondy/e2e/copilot/dukazy https://pavelchocholousgmail.sharepoint.com/sites/egd09-dev`
   – čeká, až **Pavel** zadá společné heslo, pak sám klikne „Beru tenhle“ a otevře web. Snímek výdeje má heslo zamaskované.
   ⚠️ Nikdy nevypisovat `innerText` výdejní stránky (Z1 v Claude běhu: heslo prosáklo do logu).
4. Pavel se v okně přihlásí do M365 jako egd09 (heslo z výdejní stránky nebo
   `jq -r '.hesla["egd09@pavelchocholousgmail.onmicrosoft.com"]' lab/ucastnici.secrets.json | pbcopy`).
5. Pavel přihlásí **m365 v11** do vlastního HOME (CLI 12 v izolovaném HOME na macOS padá na keychainu – Z2b; symlink
   keychainu NE, přepsal by v12 login ostatním):
   ```
   mkdir -p ~/.m365-e2e-egd09 && HOME=~/.m365-e2e-egd09 node /opt/homebrew/lib/node_modules/@pnp/cli-microsoft365/dist/index.js login --authType deviceCode --appId 12f19539-b70a-499d-b6dc-517a32c0e904 --tenant pavelchocholousgmail.onmicrosoft.com
   ```
   Kód zadat na `https://microsoft.com/devicelogin` v okně `e2e-egd09`. Ověření bez sítě: `ls ~/.m365-e2e-egd09/.cli-m365-*.json`.

## 1. Běh Copilota – skilly z balíčku ZIP (aktualizováno 24. 11. 12:30)

**Instaluje se z `dist/egd-skills.zip`, ne z `skills/` v repu** (hlavní session 24. 11.). Claude běh nad ZIPem:
[../balicek/README.md](../balicek/README.md).

1a. ZIP rozbalit do nové prázdné složky mimo repo a zapsat SHA-256 (verze se mění, 12:21 = `166fc7fd…` z `a4cac70`):
```
mkdir -p ~/egd-e2e-copilot/rozbaleno && cp dist/egd-skills.zip ~/egd-e2e-copilot/ && shasum -a 256 ~/egd-e2e-copilot/egd-skills.zip
unzip -q ~/egd-e2e-copilot/egd-skills.zip -d ~/egd-e2e-copilot/rozbaleno
```
1b. Instalaci udělá **Copilot sám** podle instalačního promptu z `dist/EMAIL-instalace-skillu.md`, upraveného na 10 skillů
(text, který prošel v Claude: `~/egd-e2e-balicek/prompt-instalace.txt`; pro Copilot cíl `<HOME>/.copilot/skills/`,
tj. `$SB/home/.copilot/skills`). Bez `--skill`:
```
SB=~/egd-e2e-copilot/sandbox   # mimo repo! v repu Copilot načte CLAUDE.md a volá tools/stav.sh (Z-C1)
tools/copilot-run.sh --sandbox "$SB" --timeout 600 --prompt-file <upravený prompt se zdrojem ~/egd-e2e-copilot/rozbaleno a cílem $SB/home/.copilot/skills>
diff -rq ~/egd-e2e-copilot/rozbaleno "$SB/home/.copilot/skills"   # musí být shodné
```
1c. Nový běh ve **stejném sandboxu bez `--continue`** (nová relace = skilly se načtou), přihlášení kopií z HOME od Pavla
a **CLI v11 přes proměnnou** (skripty obou skillů ji upřednostní před lokální v12 z `cli-instalace`; `copilot-run.sh`
prostředí předává dál a HOME = sandbox, kam `--m365-from` zkopíruje soubory v11):

```
export PRIPRAVENOST_M365_CLI=/opt/homebrew/lib/node_modules/@pnp/cli-microsoft365/dist/index.js
export PRVNI_APPKA_M365_CLI=$PRIPRAVENOST_M365_CLI
tools/copilot-run.sh --sandbox "$SB" \
  --m365-from ~/.m365-e2e-egd09 --timeout 1800 \
  --prompt "zkontroluj připravenost na workshop"
```

- Prompt bez nápovědy ke značce, appId ani cestě (Copilot vzal „ne E.ON“ jako odpověď na dotaz na značku).
- Na dotazy odpovídat `--extra "--continue"` se stejným `--sandbox` a krátkou odpovědí účastníka:
  - krok 0: „Jméno: e2e-copilot. DEV web: https://pavelchocholousgmail.sharepoint.com/sites/egd09-dev (zkušební tenant
    pavelchocholousgmail.onmicrosoft.com, ne E.ON). V ITSM jsem nic nezadával, weby mám od lektora.“;
  - nabídka appky na konci připravenosti: „Ano, postav mi první appku, ale přes skill egd-prvni-appka.“ – bez toho
    připravenost postaví svou starší vestavěnou appku `SpokojenostHodnoceni` bez značky a režimu (nález B1 v Claude běhu);
    zapsat, co Copilot nabídl;
  - značka: „EG.D“; režim: „single“ (Claude běh pokryl E.ON + open); nadpis: „ponech výchozí“;
  - appId / přihlášení (skill chce `prihlaseni-prikaz`): „Přihlásil jsem se, appId je 12f19539-b70a-499d-b6dc-517a32c0e904, hotovo.“
    (Účastník appId v labu jinak nemá odkud vzít – Z3; zapsat, jestli se Copilot ptal);
  - plán zápisu (`zkouska`, `seznam`, `nasadit`): „ano“ – jen pokud plán míří na `/sites/egd09-dev` a katalog toho webu;
  - Copilot licence/ITSM/GitHub: „nevím, přeskoč“.
- Zapsat: kolik dotazů, jestli Copilot pustil `cesta` a dostal **A**, kterou variantu žebříku zapsal, čas každého kroku.

### Disk (CLAUDE.md, pravidlo node_modules)

Copilot podle skillu pustí `cli-instalace` (~240 MB) a `novy` s `npm ci` (~0,7 GB) od nuly – to je realistické a v Claude běhu
**neměřené** (Z4), proto ho nechat proběhnout a změřit čas. Předtím `df -h /` (24. 11. 11:15 bylo volno 26 GiB). Po běhu
sloučit: `tools/apfs-dedupe.py "$SB/home/egd-workshop/node_modules" ~/Projects/m365-cli-12/node_modules` a
`tools/apfs-dedupe.py "$SB/home/egd-workshop/prvni-appka/node_modules" ~/Projects/egd-workshop/sondy/overeni/node24/prvni-appka/node_modules`.
Sandbox je pod `sondy/e2e/copilot/` – ověřit, že ho `.gitignore` kryje (`git check-ignore -q`), jinak ho dát mimo repo.

## 2. Ověření v prohlížeči (tester)

```
U='https://pavelchocholousgmail.sharepoint.com/sites/egd09-dev/SitePages/prvni-appka.aspx?env=WebView'
node sondy/e2e/cdp.mjs e2e-egd09 tab:egd09-dev "goto:$U" wait:8000 shot:sondy/e2e/copilot/dukazy/30-appka.png
node sondy/e2e/cdp.mjs e2e-egd09 tab:prvni-appka "click:Spíš spokojen" wait:4000 shot:sondy/e2e/copilot/dukazy/31-hlas-4.png text
node sondy/e2e/cdp.mjs e2e-egd09 tab:prvni-appka "click:Spíš nespokojen" wait:4000 shot:sondy/e2e/copilot/dukazy/32-zmena-2.png text
```
Hotovo = „Zapsáno: 4“, pak „Změněno na 2“, hlasů dnes 1. Čtení zpět: `over` v sandboxu (Copilot, nebo ručně
`HOME=$SB/home node <appka.mjs> over --web … --slozka prvni-appka` z `$SB/home/egd-workshop`) a REST jako v Claude běhu (35-*).
Spolužák: `node tools/lab-spo-stranka.mjs egd01 "$U" wait:6000 --shot …` – v režimu **single** čekáme „You need access“
(skill už má sekci o sdílení, Z5 vyřešeno; sdílení jen podle ní a s odškrtnutým „Send email“, Z9).

## 3. Úklid

`tools/lab-vydej.py uvolnit egd09`. Appka a seznamy zůstávají; mazání jen po výslovném ano Pavla.
Sandbox po dedupe nechat jako důkaz, nebo `/usr/bin/trash` po dohodě (nikdy `rm -rf`).
