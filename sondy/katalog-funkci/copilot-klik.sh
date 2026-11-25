#!/usr/bin/env bash
# Karta „Copilot přes OBO“ v Chrome účastníka: Retrieval přes OBO, Retrieval přímo z SPFx, Chat přes OBO.
# Použití: copilot-klik.sh <profil> <složka> ["dotaz"]   (profil e2e-egd09 | e2e-egd10; Chrome musí běžet přihlášený)
set -euo pipefail
[ "${1:-}" = "--help" ] || [ $# -lt 2 ] && { sed -n 2,3p "$0"; exit 0; }
DIR=$(cd "$(dirname "$0")" && pwd)
WEB=${WEB:-https://pavelchocholousgmail.sharepoint.com/sites/egd-ukazky}
Q='document.querySelectorAll("[data-sp-web-part-id=\"f6aa9c1a-afda-448e-a188-96437bc2bd7c\"]")[1]'
DOTAZ=${3:-}
kroky=(wait:3000 rozbal:4000)
[ -n "$DOTAZ" ] && kroky+=("eval:$Q.querySelector('#q').value=$(jq -Rn --arg d "$DOTAZ" '$d')")
for b in retr pretr chat; do
  kroky+=("eval:$Q.querySelector('#$b').click()" "eval:new Promise(r=>{const t=Date.now();const i=setInterval(()=>{const s=$Q.querySelector('#o').innerText;if(!s.startsWith('volám')||Date.now()-t>90000){clearInterval(i);r(s.length)}},500)})"
          "eval:$Q.querySelector('#o').innerText" "eval:$Q.querySelector('#o').scrollIntoView({block:'center'})" "shotv:$b")
done
node "$DIR/klik.mjs" "$1" "$WEB/SitePages/graph.aspx" "$2" "${kroky[@]}"
