// Generates the PWA / home-screen icons and the favicon from the identity art
// (src/identity/logo.ts) by rendering iconlab.html?only=… in headless Chromium.
//
//   node scripts/icons.mjs
//
// Writes:
//   public/icons/icon-192.png            app icon, 192×192
//   public/icons/icon-512.png            app icon, 512×512
//   public/icons/icon-maskable-512.png   maskable app icon (art inside the 80% safe zone)
//   public/icons/apple-touch-icon.png    180×180, opaque
//   public/favicon.svg                   simplified favicon
import { mkdirSync, writeFileSync } from 'node:fs';
import { startHarness } from './_harness.mjs';

const root = new URL('..', import.meta.url).pathname;
const iconDir = `${root}public/icons`;
mkdirSync(iconDir, { recursive: true });

const jobs = [
  { file: 'icon-192.png', only: 'app', size: 192 },
  { file: 'icon-512.png', only: 'app', size: 512 },
  { file: 'icon-maskable-512.png', only: 'maskable', size: 512 },
  { file: 'apple-touch-icon.png', only: 'app', size: 180 },
];

const h = await startHarness();
try {
  let favicon = '';
  for (const job of jobs) {
    const page = await h.browser.newPage({ viewport: { width: job.size, height: job.size }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error('page error:', e.message));
    await page.goto(`${h.base}/iconlab.html?only=${job.only}&size=${job.size}`);
    await page.waitForSelector('body[data-ready="1"]', { timeout: 60000 });
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${iconDir}/${job.file}`, clip: { x: 0, y: 0, width: job.size, height: job.size } });
    favicon ||= await page.evaluate(() => window.__favicon ?? '');
    await page.close();
    console.log(`saved public/icons/${job.file}`);
  }
  if (!favicon.startsWith('<svg')) throw new Error('favicon markup missing (window.__favicon)');
  writeFileSync(`${root}public/favicon.svg`, favicon + '\n');
  console.log('saved public/favicon.svg');
} finally {
  await h.close();
}
