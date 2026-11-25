export default async (p, { shot }) => {
  await p.waitForTimeout(25000); await p.bringToFront(); const k = p.keyboard;
  await p.mouse.dblclick(417, 385); await p.waitForTimeout(800);
  await k.press('End'); await k.press('Backspace'); await p.waitForTimeout(300);
  for (const [i, s] of ['Stav projektu Rozvodna Sever', 'Hotovo: 3 z 5 milníků', 'Odpovídá: Jan Dvořák'].entries()) {
    if (i) await k.press('Enter'); await k.type(s, { delay: 50 });
  }
  await p.mouse.click(800, 700); await p.waitForTimeout(8000); await shot('ppt-napsano');
};
