export default async (p, { shot }) => {
  await p.waitForTimeout(25000); await p.bringToFront(); const k = p.keyboard;
  await p.mouse.click(125, 222); await p.waitForTimeout(400); await k.press('Delete'); await p.waitForTimeout(300);
  await k.type('=SUMA(B2:B4)', { delay: 80 }); await k.press('Enter');
  await p.mouse.click(125, 222); await p.waitForTimeout(6000); await shot('excel-suma');
};
