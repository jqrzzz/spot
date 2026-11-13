// Screenshot helper for visual review.
//   Level lab:  npm run snap -- --world rainbow-valley [--level rv-1] [--scale 0.5] --out /path/sheet.png
//   Game page:  npm run snap -- --path "/#/" --viewport 1180x820 --out /path/game.png [--wait 1200]
import { parseArgs, startHarness } from './_harness.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.out) {
  console.error('Missing --out <file.png>');
  process.exit(2);
}
const [vw, vh] = String(args.viewport ?? '1700x1000').split('x').map(Number);
const h = await startHarness();
try {
  const page = await h.browser.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: Number(args.dpr ?? 1), hasTouch: !!args.touch });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  page.on('console', (m) => m.type() === 'error' && console.error('console:', m.text()));
  if (args.path) {
    await page.goto(`${h.base}${args.path}`);
    await page.waitForTimeout(Number(args.wait ?? 1200));
  } else {
    const q = new URLSearchParams({ mode: args.mode ?? 'sheet', world: args.world ?? 'all', scale: String(args.scale ?? '0.5'), ...(args.level ? { level: args.level } : {}) });
    await page.goto(`${h.base}/lab.html?${q}`);
    await page.waitForSelector('body[data-ready="1"]', { timeout: 120000 });
    await page.waitForTimeout(150);
  }
  await page.screenshot({ path: args.out, fullPage: !args.path || !!args.full });
  console.log(`saved ${args.out}`);
} finally {
  await h.close();
}
