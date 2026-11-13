// Serves the production build (dist/) with the same headers as vercel.json, then checks in Chromium
// that the game loads under the Content-Security-Policy, plays, and works offline after one visit.
// Usage: npm run build && npm run prodcheck
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('../dist/', import.meta.url).pathname;
const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };

const toRegex = (src) => new RegExp('^' + src.replace(/\(\.\*\)/g, '.*') + '$');
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  for (const rule of vercel.headers) if (toRegex(rule.source).test(path)) for (const hd of rule.headers) res.setHeader(hd.key, hd.value);
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
  } catch {
    file = join(root, 'index.html');
  }
  try {
    const body = await readFile(file);
    res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
    res.writeHead(200).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
let problems = 0;
const bad = (m) => (problems++, console.log('  ✖ ' + m));
try {
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => (m.type() === 'error' || /Content Security Policy|Refused to/.test(m.text())) && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${base}/`);
  await page.waitForSelector('.profile-card', { timeout: 15000 });
  const font = await page.evaluate(async () => (await document.fonts.ready, [...document.fonts].some((f) => f.family.includes('Fredoka') && f.status === 'loaded')));
  if (!font) bad('Fredoka font did not load');
  await page.locator('.profile-card').first().tap();
  await page.waitForSelector('.world-card');
  await page.locator('.world-card').first().tap();
  await page.waitForSelector('.level-node.current');
  await page.locator('.level-node.current').first().tap();
  await page.waitForSelector('.screen.play .pane svg');
  await page.waitForTimeout(800);
  console.log('  ✔ production build loads and reaches the play screen');
  // Service worker + offline
  const sw = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'unsupported';
    const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((r) => setTimeout(() => r(null), 8000))]);
    return reg ? 'ready' : 'timeout';
  });
  if (sw !== 'ready') bad(`service worker: ${sw}`);
  else {
    await page.waitForTimeout(1500);
    await ctx.setOffline(true);
    await page.goto(`${base}/#/`);
    try {
      await page.waitForSelector('.profile-card', { timeout: 8000 });
      console.log('  ✔ works offline after the first visit');
    } catch {
      bad('did not load offline');
    }
    await ctx.setOffline(false);
  }
  for (const e of errors) bad(e);
  const sizes = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => ({ name: r.name.split('/').pop(), kb: Math.round((r.encodedBodySize || 0) / 1024) })));
  console.log('  resources:', sizes.filter((s) => s.kb > 0).map((s) => `${s.name} ${s.kb}KB`).join(', '));
} finally {
  await browser.close();
  server.close();
}
console.log(problems ? `${problems} problem(s)` : 'Production check passed');
process.exit(problems ? 1 : 0);
