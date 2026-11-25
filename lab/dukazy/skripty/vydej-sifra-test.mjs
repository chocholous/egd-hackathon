import fs from "fs";
const html = fs.readFileSync(process.argv[2], "utf8");
const sec = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const STAV = JSON.parse(html.match(/<script type="application\/json" id="stav">([\s\S]*?)<\/script>/)[1]);
const normKod = (k) => k.toUpperCase().replace(/[\s-]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
const unb64 = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function odemkni(u, kod) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(normKod(kod)), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: unb64(u.sifra.s), iterations: STAV.iterace }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(u.sifra.i), additionalData: new TextEncoder().encode(u.alias) }, key, unb64(u.sifra.c));
  return JSON.parse(new TextDecoder().decode(pt));
}
let ok = 0, spatne = 0;
for (const u of STAV.ucty) {
  const t0 = Date.now();
  const r = await odemkni(u, sec.kody[u.alias].toLowerCase().replace("-", " "));
  if (r.heslo === sec.hesla[u.upn]) ok++;
  try { await odemkni(u, sec.kody[STAV.ucty[(STAV.ucty.indexOf(u)+1)%10].alias]); } catch { spatne++; }
  if (u.alias === "egd01") console.log("ms na odemceni:", Date.now() - t0);
}
console.log("spravny kod ok:", ok, "/10; cizi kod odmitnut:", spatne, "/10");
// syntax check of page script
const js = html.match(/<script id="kod">([\s\S]*?)<\/script>/)[1];
new Function(js); console.log("syntax ok");
