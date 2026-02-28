import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:3456', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/tmp/holi-splash-preview.png', fullPage: false });
console.log('Screenshot done');
await browser.close();
