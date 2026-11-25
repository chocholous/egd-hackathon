"""Úprava appky Evidence (etag-appka): zápis změny s ETagem místo IF-MATCH: *, hláška při 412,
oprava čtení další stránky (@odata.nextLink). Spouštět jednou nad čistou kopií."""
import sys
p = sys.argv[1]
t = open(p, encoding="utf-8").read()


def rep(old, new):
    global t
    assert old in t, old[:80]
    t = t.replace(old, new, 1)


rep("  AuthorId: number;\n  Author?: { Title: string };\n}",
    "  AuthorId: number;\n  Author?: { Title: string };\n  '@odata.etag'?: string; // verze položky v okamžiku načtení\n}")
rep("""      const j = (await r.json()) as { value: T[]; 'odata.nextLink'?: string };
      vysledek.push(...j.value);
      url = j['odata.nextLink'];""",
    """      const j = (await r.json()) as { value: T[]; '@odata.nextLink'?: string; 'odata.nextLink'?: string };
      vysledek.push(...j.value);
      url = j['@odata.nextLink'] ?? j['odata.nextLink'];""")
rep("""  private async _zapis(cesta: string, telo: object, merge = false): Promise<void> {
    const headers: Record<string, string> = { ...JSON_HLAVICKY };
    if (merge) { headers['IF-MATCH'] = '*'; headers['X-HTTP-Method'] = 'MERGE'; }""",
    """  // etag = verze z načtení ('"3"'); bez etagu jen nová položka. '*' by tiše přepsalo cizí změnu.
  private async _zapis(cesta: string, telo: object, etag?: string): Promise<void> {
    const headers: Record<string, string> = { ...JSON_HLAVICKY };
    if (etag) { headers['IF-MATCH'] = etag; headers['X-HTTP-Method'] = 'MERGE'; }""")
rep("""    if (r.status === 403) return""",
    """    if (r.status === 412) return 'Mezitím položku změnil někdo jiný. Načetl jsem aktuální stav, zkontrolujte ho a rozhodněte znovu.';
    if (r.status === 403) return""")
rep("""      this._zapis(`/items(${p.Id})`, { Stav: stav, Komentar: komentar.value.trim() }, true)
        .then(async () => { await this._nacti(); this._zprava = `"${p.Title}": ${stav}.`; this.render(); })
        .catch((e: Error) => { this._chyba = e.message; this.render(); });""",
    """      this._zapis(`/items(${p.Id})`, { Stav: stav, Komentar: komentar.value.trim() }, p['@odata.etag'])
        .then(async () => { await this._nacti(); this._zprava = `"${p.Title}": ${stav}.`; this.render(); })
        .catch(async (e: Error) => { await this._nacti(); this._chyba = e.message; this.render(); });""")
open(p, "w", encoding="utf-8").write(t)
print("ok")
