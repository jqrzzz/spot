// Shared helper: start a throwaway Vite dev server + headless Chromium.
import { createServer } from 'vite';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

export async function startHarness() {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    console.error('Playwright is not available. Install it globally (npm i -g playwright) to run lab scripts.');
    process.exit(2);
  }
  const server = await createServer({
    configFile: new URL('../vite.config.ts', import.meta.url).pathname,
    root: new URL('..', import.meta.url).pathname,
    server: { port: 0, host: '127.0.0.1', strictPort: false, hmr: false, watch: null },
    logLevel: 'error',
    clearScreen: false,
  });
  await server.listen();
  const address = server.httpServer.address();
  const base = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch();
  return {
    base,
    browser,
    async close() {
      await browser.close().catch(() => {});
      await server.close().catch(() => {});
    },
  };
}
