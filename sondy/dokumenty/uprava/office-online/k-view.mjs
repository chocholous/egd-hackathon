// Otevře soubor v Office Online (zobrazení), vypíše chybové hlášky a text, uloží snímek.
export default async (p, { shot }) => {
  await p.waitForTimeout(22000);
  const fr = p.frames().find((f) => /WacFrame/.test(f.name()));
  console.log('ramec', fr ? fr.name() : '-', 'url', p.url().slice(0, 120));
  const text = fr ? await Promise.race([fr.locator('body').innerText().catch(() => ''), new Promise((r) => setTimeout(() => r('(text nečitelný do 8 s)'), 8000))]) : '';
  const chyby = (text.match(/[^\n]*(nelze otevřít|poškoz|Omlouváme|problém s|opravit)[^\n]*/gi) || []).slice(0, 5);
  console.log('hlasky', JSON.stringify(chyby));
  console.log('text', text.replace(/\s+/g, ' ').slice(0, 600));
  await shot(process.env.NAZEV || 'view');
};
