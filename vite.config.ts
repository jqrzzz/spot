import { defineConfig } from 'vite';

// Little Wonder — static single-page game. `lab.html` is a dev-only level lab
// (preview + pixel validation) and is intentionally excluded from production builds.
export default defineConfig({
  base: '/',
  build: {
    target: ['es2020', 'safari14'],
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      input: { main: 'index.html' },
    },
  },
  server: { host: true },
});
