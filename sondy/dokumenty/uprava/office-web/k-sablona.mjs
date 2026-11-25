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
  await t('Potvrzení o účasti na workshopu'); await k.press('Enter');
  await t('Jméno účastníka: {{jmeno}}'); await k.press('Enter');
  // rozdělený zástupný text: „{{ut“ normálně, „va“ tučně, „r}}“ normálně
  await t('Útvar: {{ut'); await b(); await t('va'); await b(); await t('r}}'); await k.press('Enter');
  // rozdělený přes kurzívu a opravu překlepu
  await t('Datum: {{dat'); await i(); await t('um'); await i(); await t('}}'); await k.press('Enter');
  // překlep a oprava backspacem uvnitř zástupného textu
  await t('Hodnocení: {{hodnoceniX'); await k.press('Backspace'); await t('}} z 5'); await k.press('Enter');
  await t('Děkujeme, tým EG.D'); await p.waitForTimeout(8000);
  await shot('sablona-napsano');
};
