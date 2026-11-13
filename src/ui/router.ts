/**
 * Hash routes keep the game reload-safe and let the browser back button work:
 *   #/                      → choose player
 *   #/p/<pid>               → choose world
 *   #/p/<pid>/w/<wid>       → world map
 *   #/p/<pid>/play/<lid>    → play a level
 *   #/p/<pid>/stickers      → sticker book
 */
import type { Track } from '../core/audio.ts';

export type Route =
  | { name: 'home' }
  | { name: 'worlds'; pid: string }
  | { name: 'map'; pid: string; wid: string }
  | { name: 'play'; pid: string; lid: string }
  | { name: 'stickers'; pid: string };

export interface Screen {
  el: HTMLElement;
  /** Background music for this screen. */
  music?: Track | null;
  /** Called after the screen is attached to the document. */
  enter?(): void;
  destroy?(): void;
}

export function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] === 'p' && parts[1]) {
    const pid = parts[1];
    if (parts[2] === 'w' && parts[3]) return { name: 'map', pid, wid: parts[3] };
    if (parts[2] === 'play' && parts[3]) return { name: 'play', pid, lid: parts[3] };
    if (parts[2] === 'stickers') return { name: 'stickers', pid };
    return { name: 'worlds', pid };
  }
  return { name: 'home' };
}

export function href(r: Route): string {
  const e = encodeURIComponent;
  switch (r.name) {
    case 'home':
      return '#/';
    case 'worlds':
      return `#/p/${e(r.pid)}`;
    case 'map':
      return `#/p/${e(r.pid)}/w/${e(r.wid)}`;
    case 'play':
      return `#/p/${e(r.pid)}/play/${e(r.lid)}`;
    case 'stickers':
      return `#/p/${e(r.pid)}/stickers`;
  }
}

type Render = (route: Route) => Screen;

let renderFn: Render | null = null;
let rootEl: HTMLElement | null = null;
let current: Screen | null = null;
let onScreen: ((s: Screen, r: Route) => void) | null = null;

/** Navigate. Navigating to the current route re-renders it (e.g. "play again"). */
export function go(r: Route, opts: { replace?: boolean } = {}): void {
  const target = href(r);
  if (location.hash === target) {
    show(r);
    return;
  }
  if (opts.replace) {
    history.replaceState(null, '', target);
    show(r);
  } else location.hash = target;
}

function show(r: Route): void {
  if (!renderFn || !rootEl) return;
  let next: Screen;
  try {
    next = renderFn(r);
  } catch (err) {
    console.error(err);
    if (r.name !== 'home') {
      history.replaceState(null, '', '#/');
      show({ name: 'home' });
    }
    return;
  }
  const prev = current;
  current = next;
  next.el.classList.add('screen-enter');
  rootEl.append(next.el);
  requestAnimationFrame(() => {
    next.enter?.();
    requestAnimationFrame(() => next.el.classList.remove('screen-enter'));
  });
  onScreen?.(next, r);
  if (prev) {
    prev.destroy?.();
    prev.el.classList.add('screen-exit');
    prev.el.setAttribute('aria-hidden', 'true');
    prev.el.style.pointerEvents = 'none';
    window.setTimeout(() => prev.el.remove(), 420);
  }
}

export function startRouter(root: HTMLElement, render: Render, screenChanged: (s: Screen, r: Route) => void): void {
  rootEl = root;
  renderFn = render;
  onScreen = screenChanged;
  window.addEventListener('hashchange', () => show(parse(location.hash)));
  show(parse(location.hash));
}
