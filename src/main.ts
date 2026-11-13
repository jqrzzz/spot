import './styles/app.css';
import { sound } from './core/audio.ts';
import { store } from './core/storage.ts';
import { findLevel, findWorld } from './worlds/registry.ts';
import { startRouter, type Route, type Screen } from './ui/router.ts';
import { homeScreen } from './screens/home.ts';
import { worldsScreen } from './screens/worlds.ts';
import { mapScreen } from './screens/map.ts';
import { playScreen } from './screens/play.ts';
import { stickersScreen } from './screens/stickers.ts';
import { applySettings } from './screens/settings.ts';

applySettings();

// Browsers only allow sound after a user gesture; unlock on the very first touch/click/key.
const unlock = () => sound.unlock();
for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'] as const) {
  window.addEventListener(type, unlock, { capture: true, passive: true });
}

// The pictures have their own pinch-zoom; stop iOS from zooming the whole page.
document.addEventListener('gesturestart', (e) => e.preventDefault());

function render(route: Route): Screen {
  if (route.name === 'home') return homeScreen();
  if (!store.profile(route.pid)) return homeScreen();
  switch (route.name) {
    case 'worlds':
      return worldsScreen(route.pid);
    case 'map':
      return findWorld(route.wid)?.levels.length ? mapScreen(route.pid, route.wid) : worldsScreen(route.pid);
    case 'play': {
      const f = findLevel(route.lid);
      if (!f) return worldsScreen(route.pid);
      const open = f.index === 0 || store.isDone(route.pid, f.world.levels[f.index - 1].id);
      return open ? playScreen(route.pid, route.lid) : mapScreen(route.pid, f.world.id);
    }
    case 'stickers':
      return stickersScreen(route.pid);
  }
}

startRouter(document.getElementById('app')!, render, (screen) => sound.music(screen.music ?? null));
document.documentElement.classList.add('ready');

// Offline play + installable app (production only).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        const urls = performance
          .getEntriesByType('resource')
          .map((e) => e.name)
          .filter((u) => u.startsWith(location.origin));
        reg.active?.postMessage({ type: 'precache', urls: ['/', ...urls] });
      })
      .catch(() => {});
  });
}
