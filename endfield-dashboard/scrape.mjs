import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const publicDir = 'H:/Projects/HADashboardTheme/endfield-dashboard/public/models';
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Intercept network requests
  page.on('response', async (response) => {
    const url = response.url();
    // Look for GLB, GLTF, OBJ, BIN or typical three.js model formats
    if (url.includes('.glb') || url.includes('.gltf') || url.includes('.obj') || url.includes('.bin')) {
      console.log(`Found 3D model: ${url}`);
      try {
        const buffer = await response.buffer();
        const fileName = path.basename(new URL(url).pathname);
        fs.writeFileSync(path.join(publicDir, fileName), buffer);
        console.log(`Saved ${fileName}`);
      } catch (e) {
        console.error(`Failed to save ${url}: ${e}`);
      }
    }
  });

  console.log('Navigating to https://endfield.gryphline.com/en-us ...');
  await page.goto('https://endfield.gryphline.com/en-us', { waitUntil: 'networkidle2', timeout: 60000 });

  console.log('Scrolling down the page...');
  for (let i = 0; i < 15; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('Clicking side buttons in the Lore container to load more models...');
  // Find all elements that might be navigation arrows or buttons inside the Lore/Models section
  const buttons = await page.$$('div[class*="swiper-button"], div[class*="arrow"], div[class*="next"], div[class*="prev"], div[data-key="lore"] ~ div button');
  for (const btn of buttons) {
    try {
      if (await btn.isVisible()) {
        await btn.click();
        await new Promise(r => setTimeout(r, 2500)); // wait for model to load
      }
    } catch(e) {}
  }
  
  await browser.close();
  console.log('Done scraping.');
})();
