// Ukázková data seznamu "Revize zařízení" (diakritika záměrně: ě š č ř ž ý á í é ú ů ď ť ň Ě Š Č Ř Ž)
export const title = 'Přehled revizí rozvaděčů – příští čtvrtletí';
export const rows = [
  { id: 1, zarizeni: 'Trafostanice Říčany – věž', technik: 'Jiří Dvořák', termin: '2026-12-03', stav: 'Naplánováno', naklad: 18500 },
  { id: 2, zarizeni: 'Rozvaděč NN Žďár nad Sázavou', technik: 'Ing. Zdeňka Čermáková', termin: '2026-12-10', stav: 'Probíhá', naklad: 42300 },
  { id: 3, zarizeni: 'Vedení VN č. 214 – úsek Šumperk', technik: 'Ondřej Řezníček', termin: '2027-01-14', stav: 'Naplánováno', naklad: 129900 },
  { id: 4, zarizeni: 'Stanice Ústí – ochrana ESD', technik: 'Šárka Nováková', termin: '2027-01-21', stav: 'Dokončeno', naklad: 7650 },
  { id: 5, zarizeni: 'Přípojková skříň Česká Třebová', technik: 'Ťuk Ďábelský', termin: '2027-02-02', stav: 'Naplánováno', naklad: 3200 },
];
export const sum = rows.reduce((a, r) => a + r.naklad, 0);
export const fmtKc = (n) => new Intl.NumberFormat('cs-CZ').format(n) + ' Kč';
export const fmtDate = (s) => { const [y, m, d] = s.split('-'); return `${+d}. ${+m}. ${y}`; };
export const pangram = 'Příliš žluťoučký kůň úpěl ďábelské ódy. PŘÍLIŠ ŽLUŤOUČKÝ KŮŇ ÚPĚL ĎÁBELSKÉ ÓDY.';
