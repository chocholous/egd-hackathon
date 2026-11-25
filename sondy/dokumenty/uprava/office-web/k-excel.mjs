// Vyplní rozpočet v Excelu pro web: řádky, vzorec SUM, tučná hlavička.
export default async (p, { shot }) => {
  await p.waitForTimeout(25000); await p.bringToFront();
  console.log(p.frames().map((f) => f.name()).filter(Boolean).join(' | '));
  const fr = p.frames().find((f) => /WacFrame_Excel/.test(f.name())) || p.mainFrame();
  const k = p.keyboard;
  const X = { A: 70, B: 125, D: 272 }; const Y = (r) => 154 + 17 * (r - 1);
  const jdi = async (bunka) => {
    const [z, k2] = bunka.split(':'); const m = z.match(/([A-Z])(\d+)/);
    await p.mouse.click(X[m[1]], Y(+m[2])); await p.waitForTimeout(300);
    if (k2) { const n = k2.match(/([A-Z])(\d+)/); await k.down('Shift'); await p.mouse.click(X[n[1]], Y(+n[2])); await k.up('Shift'); }
    await p.waitForTimeout(300);
  };
  await shot('excel-start');
  const X2 = { ...X, C: 191 };
  await p.mouse.click(70, 154); await k.down('Shift'); await p.mouse.click(272, Y(6)); await k.up('Shift'); await k.press('Delete'); await p.waitForTimeout(800);
  const bunky = [['A1', 'Položka'], ['B1', 'Částka'], ['A2', 'Materiál'], ['B2', '120000'], ['A3', 'Práce'], ['B3', '300000'],
    ['A4', 'Doprava'], ['B4', '60000'], ['A5', 'Celkem'], ['B5', '=SUM(B2:B4)'], ['D1', 'Poznámka: rozpočet akce 2026']];
  for (const [c, v] of bunky) { await jdi(c); await p.waitForTimeout(400); await k.type(v, { delay: 60 }); await k.press('Enter'); await p.waitForTimeout(400); }
  await jdi('A1:B1'); await k.press('ControlOrMeta+B');
  await jdi('A5:B5'); await k.press('ControlOrMeta+B');
  await p.waitForTimeout(8000); await shot('excel-napsano');
};
