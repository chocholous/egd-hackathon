export default async (p, { shot }) => {
  await p.waitForTimeout(25000); await p.bringToFront(); const k = p.keyboard;
  await p.mouse.click(125, 154); await p.waitForTimeout(400); await k.press('Delete'); await p.waitForTimeout(400);
  await k.type('Cena v Kč', { delay: 80 }); await k.press('Enter');
  await p.mouse.click(125, 222); await p.waitForTimeout(400);
  await p.waitForTimeout(6000); await shot('excel-oprava');
  const fr = p.frames().find((f) => /WacFrame_Excel/.test(f.name()));
  console.log('B5 vzorec:', await fr.locator('#formulaBarTextDivId_textElement, [aria-label="Řádek vzorců"]').first().innerText().catch(() => '?'));
};
