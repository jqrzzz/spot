// Automated play-test: a robot child plays the first level(s) on several screen sizes.
// Usage: npm run playtest [-- --out <dir>] [--only ipad-land,phone-port] [--world <index>] [--levels 2]
import { mkdirSync } from 'node:fs';
import { parseArgs, startHarness } from './_harness.mjs';

const args = parseArgs(process.argv.slice(2));
const out = args.out ?? 'test-results/playtest';
mkdirSync(out, { recursive: true });

const VIEWPORTS = {
  'ipad-land': { width: 1180, height: 820, touch: true },
  'ipad-port': { width: 820, height: 1180, touch: true },
  'phone-port': { width: 390, height: 844, touch: true },
  'phone-land': { width: 844, height: 390, touch: true },
  desktop: { width: 1440, height: 900, touch: false },
};
const only = args.only ? String(args.only).split(',') : Object.keys(VIEWPORTS);
const worldIndex = Number(args.world ?? 0);
const levelsToPlay = Number(args.levels ?? 1);

const h = await startHarness();
let failures = 0;
const fail = (vp, msg) => {
  failures++;
  console.log(`  ✖ [${vp}] ${msg}`);
};

try {
  for (const name of only) {
    const vp = VIEWPORTS[name];
    if (!vp) continue;
    console.log(`\n▶ ${name} ${vp.width}×${vp.height}`);
    const ctx = await h.browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: vp.touch, isMobile: vp.touch, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
    const tap = async (x, y) => (vp.touch ? page.touchscreen.tap(x, y) : page.mouse.click(x, y));
    const tapEl = async (sel) => {
      const box = await page.locator(sel).first().boundingBox();
      if (!box) throw new Error(`not visible: ${sel}`);
      await tap(box.x + box.width / 2, box.y + box.height / 2);
    };
    const shot = (label) => page.screenshot({ path: `${out}/${name}-${label}.png` });

    await page.goto(`${h.base}/#/`);
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${h.base}/#/`);
    await page.waitForSelector('.profile-card');
    await page.waitForTimeout(700);
    await shot('1-home');

    await tapEl('.profile-card');
    await page.waitForSelector('.screen.worlds .world-card');
    await page.waitForTimeout(800);
    await shot('2-worlds');

    await tapEl(`.world-card >> nth=${worldIndex}`);
    await page.waitForSelector('.screen.map .level-node.current');
    await page.waitForTimeout(900);
    await shot('3-map');

    for (let lv = 0; lv < levelsToPlay; lv++) {
      if (lv === 0) await tapEl('.level-node.current');
      await page.waitForSelector('.screen.play:not(.screen-exit) .pane');
      await page.waitForTimeout(900);
      if (await page.locator('.first-tip').count()) {
        await shot(`4-l${lv + 1}-tip`);
        await tap(vp.width / 2, vp.height / 2);
        await page.waitForTimeout(500);
      }
      await shot(`5-l${lv + 1}-start`);
      const info = await page.evaluate(() => window.__lw && { level: window.__lw.level, diffs: window.__lw.diffs });
      if (!info) {
        fail(name, 'no __lw debug hook');
        break;
      }
      // A miss far from every difference must not count.
      const panes = await page.locator('.screen.play:not(.screen-exit) .pane').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
      const toScreen = (pane, [x, y]) => [pane.x + (x / 800) * pane.width, pane.y + (y / 600) * pane.height];
      const far = [[12, 588], [788, 12], [12, 12], [788, 588]].find(([x, y]) => info.diffs.every((d) => Math.hypot(d.ring.cx - x, d.ring.cy - y) > Math.max(d.ring.rx, d.ring.ry) + 60));
      if (far) {
        const [mx, my] = toScreen(panes[0], far);
        await tap(mx, my);
        await page.waitForTimeout(300);
        const filled = await page.locator('.screen.play:not(.screen-exit) .slot.filled').count();
        if (filled !== 0) fail(name, `miss tap counted as a find (${filled})`);
      }
      for (let i = 0; i < info.diffs.length; i++) {
        const d = info.diffs[i];
        const pane = panes[i % 2];
        const [x, y] = toScreen(pane, [d.ring.cx, d.ring.cy]);
        await tap(x, y);
        await page.waitForTimeout(i === 0 ? 900 : 650);
        if (i === 0) await shot(`6-l${lv + 1}-first-find`);
        const filled = await page.locator('.screen.play:not(.screen-exit) .slot.filled').count();
        if (filled !== i + 1) fail(name, `${info.level}: after tapping "${d.id}" expected ${i + 1} found, got ${filled}`);
      }
      await page.waitForTimeout(2600);
      await shot(`7-l${lv + 1}-celebrate`);
      if (!(await page.locator('.celebrate .reward-card').count())) fail(name, `${info.level}: no celebration`);
      else console.log(`  ✔ ${info.level}: found ${info.diffs.length}/${info.diffs.length}, celebrated`);
      if (lv < levelsToPlay - 1) {
        await tapEl('.celebrate .btn-primary');
        await page.waitForTimeout(700);
      }
    }

    // Sticker book renders.
    await page.goto(`${h.base}/#/p/jett/stickers`);
    await page.waitForSelector('.sticker-slot');
    await page.waitForTimeout(600);
    await shot('8-stickers');
    const earned = await page.locator('.sticker-slot.earned').count();
    if (earned < 1) fail(name, 'sticker book shows no earned sticker');
    // Resume after reload + zoom (wheel on desktop, two-finger pinch on touch).
    {
      await page.evaluate(() => localStorage.removeItem('little-wonder/v1'));
      await page.goto(`${h.base}/#/p/june/play/rv-1`);
      await page.waitForSelector('.screen.play .pane');
      await page.waitForTimeout(700);
      if (await page.locator('.first-tip').count()) {
        await tap(vp.width / 2, vp.height / 2);
        await page.waitForTimeout(500);
      }
      const panesNow = async () => page.locator('.screen.play:not(.screen-exit) .pane').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
      const info = await page.evaluate(() => ({ diffs: window.__lw.diffs }));
      let panes = await panesNow();
      const s = (pane, [x, y], view = { x: 0, y: 0, w: 800, h: 600 }) => [pane.x + ((x - view.x) / view.w) * pane.width, pane.y + ((y - view.y) / view.h) * pane.height];
      await tap(...s(panes[1], [info.diffs[0].ring.cx, info.diffs[0].ring.cy]));
      await page.waitForTimeout(800);
      await page.reload();
      await page.waitForSelector('.screen.play .pane');
      await page.waitForTimeout(900);
      const resumed = await page.locator('.screen.play .slot.filled').count();
      const marks = await page.locator('.screen.play .mark').count();
      if (resumed !== 1 || marks !== 2) fail(name, `resume after reload: ${resumed} found / ${marks} marks (expected 1 / 2)`);
      else console.log('  ✔ resume after reload');
      panes = await panesNow();
      const d2 = info.diffs[1];
      const [zx, zy] = s(panes[0], [d2.ring.cx, d2.ring.cy]);
      if (vp.touch) {
        const cdp = await ctx.newCDPSession(page);
        const pts = (d) => [{ x: zx - d, y: zy, id: 0 }, { x: zx + d, y: zy, id: 1 }];
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(30) });
        for (let k = 1; k <= 8; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(30 + k * 12) });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      } else {
        await page.mouse.move(zx, zy);
        await page.mouse.wheel(0, -500);
      }
      await page.waitForTimeout(400);
      const view = await page.evaluate(() => window.__lw.view());
      if (!(view.w < 760)) fail(name, `zoom did not zoom in (view width ${view.w})`);
      else {
        panes = await panesNow();
        await tap(...s(panes[0], [d2.ring.cx, d2.ring.cy], view));
        await page.waitForTimeout(700);
        const n = await page.locator('.screen.play .slot.filled').count();
        if (n !== 2) fail(name, `tap while zoomed did not register (${n} found)`);
        else console.log(`  ✔ ${vp.touch ? 'pinch' : 'wheel'} zoom ×${(800 / view.w).toFixed(1)} + tap while zoomed`);
        await shot('9-zoomed');
        await tapEl('.zoom-reset');
        await page.waitForTimeout(500);
        const v2 = await page.evaluate(() => window.__lw.view());
        if (v2.w < 799) fail(name, 'zoom-out button did not reset the view');
      }
    }

    for (const e of errors) fail(name, e);
    await ctx.close();
  }
} finally {
  await h.close();
}
console.log(failures ? `\n${failures} problem(s)` : '\nAll play-tests passed');
process.exit(failures ? 1 : 0);
