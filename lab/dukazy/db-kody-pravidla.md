# db výdejní stránky: kolekce `kody` (2026-11-22, ArtifactData, artefakt A1rabZHmzw2xYZ3iEcrvb7)

Pravidla publikované verze: `{"db":{"rules":[{"path":"","read":"owner","write":"owner"}]}}`.

| Čtení `kody` | Výsledek |
|---|---|
| jako vlastník (Pavel) | 10 dokumentů egd01–egd10, každý 80 B, version 1 (obsah neukládám, jsou to kódy) |
| `as_level: admin` (Editor) | No documents matched |
| `as_level: interact` (Contributor) | No documents matched |
| `as_level: view` (Viewer, host přes odkaz) | No documents matched |

Zápis s `as_level: view` (do `sonda/zapis-view` i do vlastního `data/users/me`) odmítl už nástroj
ArtifactData: „nothing can be written at as_level 'view', your own data/users subtree included“.
Je to chování platformy pro úroveň `view`. Že host zvenku úroveň `view` skutečně dostane, je pořád jen
z kontraktu (📘); pokus s externím účtem viz 08 → Neověřeno.
