// Napíše šablonu ve Wordu pro web: zástupné texty {{…}}, některé rozdělené formátováním do více runů.
export default async (p, { shot }) => {
  await p.waitForTimeout(20000);
  const k = p.keyboard;
  await p.bringToFront();
  const fr = p.frames().find((f) => f.name() === 'WacFrame_Word_Inline');
  const ed = fr.locator('#WACViewPanel_EditingElement');
  await ed.getByText('x', { exact: true }).first().click();
  await p.waitForTimeout(1500);
  console.log(await fr.evaluate(() => 'active=' + document.activeElement?.id + ' hasFocus=' + document.hasFocus()));
  await k.press('End'); await k.press('Backspace'); await p.waitForTimeout(800);
  await shot('sablona-po-kliku');
  const t = async (s) => { await k.type(s, { delay: 30 }); };
  const b = async () => { await k.press('ControlOrMeta+B'); };
  const i = async () => { await k.press('ControlOrMeta+I'); };
  await t('Smlouva o dílo č. 2026/118'); await k.press('Enter');
  await t('Objednatel: EG.D, a.s., Lidická 1873/36, Brno'); await k.press('Enter');
  await t('Zhotovitel: Stavby Morava s.r.o.'); await k.press('Enter');
  await t('Cena díla činí 480 000 Kč bez DPH. Termín dokončení je 31. 3. 2027.'); await k.press('Enter');
  await t('Za '); await b(); await t('Stavby Morava'); await b(); await t(' podepisuje jednatel.');
  await p.waitForTimeout(8000);
  await shot('smlouva-napsano');
};
