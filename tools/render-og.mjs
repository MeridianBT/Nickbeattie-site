// Renders og-image.png, favicon.png and apple-touch-icon.png with Playwright.
// Usage (from the site root):  npx playwright@1 --version >/dev/null && node tools/render-og.mjs
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
const browser = await chromium.launch(launchOpts);

const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(path.join(here, 'og-template.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, 'assets/img/og-image.png') });

for (const [size, name] of [[64, 'favicon.png'], [180, 'apple-touch-icon.png']]) {
  const p = await browser.newPage({ viewport: { width: size, height: size } });
  const svg = readFileSync(path.join(root, 'assets/img/favicon.svg'), 'utf8')
    .replace('<svg ', `<svg width="${size}" height="${size}" style="display:block" `);
  await p.setContent(`<html><body style="margin:0;background:#FBFAF8">${svg}</body></html>`);
  await p.screenshot({ path: path.join(root, 'assets/img', name), omitBackground: size < 100 });
}
await browser.close();
console.log('Rendered og-image.png, favicon.png, apple-touch-icon.png');
