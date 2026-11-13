/** A world's level path. */
import { store } from '../core/storage.ts';
import { sound } from '../core/audio.ts';
import { voice } from '../core/voice.ts';
import { namespaceIds, sceneMarkup, nextPrefix } from '../core/scene.ts';
import { getBuddy } from '../identity/buddies.ts';
import { icon } from '../identity/icons.ts';
import { findWorld } from '../worlds/registry.ts';
import { button, h, pulse, svg } from '../ui/dom.ts';
import { go, type Screen } from '../ui/router.ts';
import { playerChip } from './worlds.ts';

const LANDSCAPE: [number, number][] = [
  [0.12, 0.66],
  [0.31, 0.36],
  [0.5, 0.64],
  [0.69, 0.36],
  [0.88, 0.62],
];
const PORTRAIT: [number, number][] = [
  [0.3, 0.12],
  [0.7, 0.31],
  [0.32, 0.5],
  [0.68, 0.69],
  [0.4, 0.88],
];

export function mapScreen(pid: string, wid: string): Screen {
  const world = findWorld(wid);
  const profile = store.profile(pid);
  if (!world || !profile) throw new Error(`Unknown world ${wid}`);
  const buddy = getBuddy(profile.buddy);
  const levels = world.levels;
  const unlocked = (i: number) => i === 0 || store.isDone(pid, levels[i - 1].id);
  const doneCount = levels.filter((l) => store.isDone(pid, l.id)).length;
  const currentIndex = levels.findIndex((l, i) => unlocked(i) && !store.isDone(pid, l.id));

  const el = h('div', { class: 'screen map', '--accent': world.theme.accent, '--sky1': world.theme.sky[0], '--sky2': world.theme.sky[1], '--deep': world.theme.deep, '--path': world.theme.path });
  const art = h('div', { class: 'map-art' });
  if (world.mapArt) art.append(svg(namespaceIds(world.mapArt(), nextPrefix('m')), '0 0 1200 800', 'map-svg', { preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' }));
  else art.append(svg(namespaceIds(world.cover(), nextPrefix('m')), '0 0 800 600', 'map-svg faded', { preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' }));

  const top = h(
    'header',
    { class: 'topbar' },
    button({ label: 'Back to worlds', icon: 'back', cls: 'btn-round', onTap: () => go({ name: 'worlds', pid }) }),
    h('div', { class: 'map-title' }, h('span', { class: 'map-name' }, world.name), h('span', { class: 'map-count', html: `${icon('star')}<b>${doneCount}/${levels.length}</b>` })),
    playerChip(pid),
  );

  const area = h('div', { class: 'path-area' });
  const pathSvg = svg('', '0 0 100 100', 'path-line', { preserveAspectRatio: 'none', 'aria-hidden': 'true' });
  area.append(pathSvg);

  const nodes = levels.map((level, i) => {
    const isDone = store.isDone(pid, level.id);
    const open = unlocked(i);
    const node = h('button', {
      type: 'button',
      class: `level-node ${isDone ? 'done' : open ? 'current' : 'locked'}`,
      'aria-label': open ? `Level ${i + 1}: ${level.title}${isDone ? ' (done)' : ''}` : `Level ${i + 1} (locked)`,
      style: { animationDelay: `${i * 70}ms` },
    });
    const face = h('span', { class: 'node-face' });
    if (open) face.append(svg(sceneMarkup(level, new Set(), nextPrefix('t')), '0 0 800 600', 'node-thumb', { preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' }));
    else face.innerHTML = `<span class="node-lock">${icon('lock')}</span>`;
    node.append(face, h('span', { class: 'node-num' }, String(i + 1)));
    if (isDone) node.append(h('span', { class: 'node-star', html: icon('star') }));
    node.addEventListener('click', () => {
      if (!open) {
        sound.tap();
        pulse(node, 'wiggle', 600);
        if (currentIndex >= 0) pulse(nodes[currentIndex], 'hop', 700);
        voice.say('This one is still a secret! Try the glowing one first.');
        return;
      }
      sound.tap();
      pulse(node, 'squish', 420);
      voice.say(level.title);
      window.setTimeout(() => go({ name: 'play', pid, lid: level.id }), 260);
    });
    area.append(node);
    return node;
  });

  const buddyEl = h('div', { class: 'map-buddy' }, svg(buddy.draw(currentIndex === -1 ? 'joy' : 'happy'), '0 0 200 200'));
  area.append(buddyEl);

  function layout(): void {
    const W = area.clientWidth;
    const H = area.clientHeight;
    if (!W || !H) return;
    const pts = W / H >= 1.05 ? LANDSCAPE : PORTRAIT;
    const size = Math.round(Math.max(78, Math.min(150, Math.min(W, H) * (W / H >= 1.05 ? 0.24 : 0.17))));
    area.style.setProperty('--node', `${size}px`);
    const n = Math.min(nodes.length, pts.length);
    const abs = pts.slice(0, n).map(([x, y]) => [x * W, y * H] as [number, number]);
    nodes.forEach((node, i) => {
      const p = abs[Math.min(i, abs.length - 1)];
      node.style.left = `${p[0]}px`;
      node.style.top = `${p[1]}px`;
    });
    // Smooth path through the nodes (Catmull-Rom → cubic Bézier), in percentage space.
    const pct = pts.slice(0, n).map(([x, y]) => [x * 100, y * 100]);
    let d = pct.length ? `M${pct[0][0]} ${pct[0][1]}` : '';
    for (let i = 0; i < pct.length - 1; i++) {
      const p0 = pct[Math.max(0, i - 1)];
      const p1 = pct[i];
      const p2 = pct[i + 1];
      const p3 = pct[Math.min(pct.length - 1, i + 2)];
      d += `C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
    }
    pathSvg.innerHTML = `<path d="${d}" class="trail-shadow"/><path d="${d}" class="trail"/>`;
    const bi = currentIndex === -1 ? n - 1 : currentIndex;
    const bp = abs[Math.max(0, bi)];
    if (bp) {
      const left = bp[0] + size * 0.62 > W - size * 0.4 ? bp[0] - size * 0.95 : bp[0] + size * 0.62;
      buddyEl.style.left = `${left}px`;
      buddyEl.style.top = `${bp[1] - size * 0.18}px`;
      buddyEl.style.setProperty('--b', `${Math.round(size * 0.62)}px`);
    }
  }
  const ro = new ResizeObserver(layout);
  ro.observe(area);

  el.append(art, h('div', { class: 'map-veil' }), top, area);
  return {
    el,
    music: world.music,
    enter() {
      layout();
      if (currentIndex >= 0 && doneCount === 0) voice.say(`Welcome to ${world.name}! Tap the glowing picture to start.`);
      else if (currentIndex === -1) voice.say(`You finished every picture in ${world.name}! Play any one again.`);
    },
    destroy() {
      ro.disconnect();
    },
  };
}
