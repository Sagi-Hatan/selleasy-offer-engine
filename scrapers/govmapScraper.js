import puppeteer from 'puppeteer';

export async function scrapeGovMap(address) {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://www.govmap.gov.il/?c=185583.99,676102.72&z=13&q=${encodedAddress}&lay=16`;

  const browser = await puppeteer.launch({ headless: true, defaultViewport: null });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 5000));

  const clickPositions = [
    { x: 500, y: 400 },
    { x: 530, y: 400 },
    { x: 480, y: 390 },
    { x: 510, y: 410 },
    { x: 495, y: 395 },
  ];

  let tableLoaded = false;
  for (const pos of clickPositions) {
    try {
      await page.mouse.click(pos.x, pos.y);
      await page.waitForSelector('div.MuiTableContainer-root table.MuiTable-root', { timeout: 7000 });
      tableLoaded = true;
      break;
    } catch {}
  }

  if (!tableLoaded) {
    await browser.close();
    throw new Error('לא הצלחנו ללחוץ על המצלוע הכחול ולטעון את הטבלה');
  }

  const data = await page.evaluate(() => {
    const table = document.querySelector('div.MuiTableContainer-root table.MuiTable-root');
    if (!table) return [];

    const rows = Array.from(table.querySelectorAll('tbody tr'));
    return rows.map(row => {
      const cells = row.querySelectorAll('td');
      return {
        address: cells[0]?.innerText.trim() || '',
        dealDate: cells[1]?.innerText.trim() || '',
        parcelBlock: cells[2]?.innerText.trim() || '',
        propertyType: cells[3]?.innerText.trim() || '',
        rooms: cells[4]?.innerText.trim() || '',
        floor: cells[5]?.innerText.trim() || '',
        squareMeter: cells[6]?.innerText.trim() || '',
        dealPrice: cells[7]?.innerText.trim() || ''
      };
    });
  });

  await browser.close();
  return data;
}
