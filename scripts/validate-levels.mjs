// Usage: npm run validate [-- --world rainbow-valley] [--level rv-1] [--strict]
// Renders every level in headless Chromium and runs the pixel-level quality gate.
import { parseArgs, startHarness } from './_harness.mjs';

const args = parseArgs(process.argv.slice(2));
const world = args.world ?? 'all';
const h = await startHarness();
let exitCode = 0;
try {
  const page = await h.browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  const q = new URLSearchParams({ mode: 'validate', world, ...(args.level ? { level: args.level } : {}) });
  await page.goto(`${h.base}/lab.html?${q}`);
  await page.waitForFunction(() => window.__report, null, { timeout: 240000 });
  const report = await page.evaluate(() => window.__report);
  if (report.fatal) console.error('FATAL:', report.fatal);
  let errors = 0;
  let warnings = 0;
  for (const w of report.worlds) {
    console.log(`\n■ ${w.world}`);
    for (const e of w.errors) (errors++, console.log(`  ✖ ${e}`));
    for (const e of w.warnings) (warnings++, console.log(`  ⚠ ${e}`));
    for (const l of w.levels) {
      console.log(`  ${l.errors.length ? '✖' : '✔'} ${l.level} · ${l.title}`);
      for (const e of l.errors) (errors++, console.log(`      ✖ ${e}`));
      for (const e of l.warnings) (warnings++, console.log(`      ⚠ ${e}`));
      for (const d of l.diffs) console.log(`        · ${d.id}: ${d.visiblePx}px visible, ${d.leakPx}px outside`);
    }
  }
  console.log(`\n${errors} error(s), ${warnings} warning(s)`);
  if (!report.ok || errors > 0 || (args.strict && warnings > 0)) exitCode = 1;
} finally {
  await h.close();
}
process.exit(exitCode);
