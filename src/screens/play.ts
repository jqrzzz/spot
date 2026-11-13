/**
 * The game screen. Two renders of the same scene sit side by side (or stacked on tall
 * screens). Taps are resolved purely from each level's explicit difference data.
 */
import type { Difference, Point } from '../core/types.ts';
import { SCENE_H, SCENE_W } from '../core/types.ts';
import { findLevel } from '../worlds/registry.ts';
import { changedIn, newSeed, planRound, type Round } from '../core/select.ts';
import { pickHit, shapeRing } from '../core/hit.ts';
import { nextPrefix, sceneMarkup } from '../core/scene.ts';
import { store } from '../core/storage.ts';
import { buzz, sound } from '../core/audio.ts';
import { voice } from '../core/voice.ts';
import { getBuddy } from '../identity/buddies.ts';
import { icon } from '../identity/icons.ts';
import { button, h, pulse, reducedMotion, svg, svgNode, wait } from '../ui/dom.ts';
import { go, type Screen } from '../ui/router.ts';
import { celebrate } from './celebrate.ts';

interface View {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Pane {
  index: 0 | 1;
  el: HTMLDivElement;
  svg: SVGSVGElement;
  fx: SVGGElement;
  prefix: string;
  changed: Set<string>;
}

const FULL: View = { x: 0, y: 0, w: SCENE_W, h: SCENE_H };
const MIN_VIEW_W = SCENE_W / 3; // up to 3× zoom
const TOUCH_SLOP_PX = 24; // forgiving finger taps
const MOUSE_SLOP_PX = 10;
const NUDGE_AFTER_MS = 35000;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const choose = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

export function playScreen(pid: string, lid: string): Screen {
  const found = findLevel(lid);
  const player = store.profile(pid);
  if (!found || !player) throw new Error(`Unknown level or player: ${lid}`);
  const profile = player;
  const { world, index } = found;
  const level = world.levels[index];
  const buddy = getBuddy(profile.buddy);

  /* ---------------------------------------------------------------- round */
  const progress = store.progress(pid);
  const firstEver = Object.keys(progress.levels).length === 0 && !progress.current;
  let round: Round;
  let resumeIds: string[] = [];
  if (progress.current && progress.current.levelId === lid) {
    round = planRound(level, progress.current.play, progress.current.seed);
    const ids = new Set(round.diffs.map((d) => d.id));
    resumeIds = progress.current.found.filter((id) => ids.has(id));
  } else {
    round = planRound(level, store.plays(pid, lid), newSeed());
    store.setCurrent(pid, { levelId: lid, play: round.play, seed: round.seed, found: [] });
  }
  const foundIds = new Set<string>();

  /* ---------------------------------------------------------------- state */
  let view: View = { ...FULL };
  let done = false;
  let destroyed = false;
  let calmUntil = 0;
  const misses: number[] = [];
  let lastHintAt = 0;
  let lastFindAt = performance.now();
  let bubble: HTMLElement | null = null;
  let stopCelebrate: (() => void) | null = null;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (!destroyed) fn();
    }, ms);
    timers.add(id);
  };

  /* ---------------------------------------------------------------- DOM */
  const el = h('div', {
    class: 'screen play',
    '--accent': world.theme.accent,
    '--sky1': world.theme.sky[0],
    '--sky2': world.theme.sky[1],
    '--deep': world.theme.deep,
  });

  const mapBtn = button({ label: 'Back to the map', icon: 'map', cls: 'btn-round', onTap: () => go({ name: 'map', pid, wid: world.id }) });
  const progressEl = h('div', { class: 'progress', role: 'status', 'aria-live': 'polite', 'aria-label': `0 of ${round.diffs.length} found` });
  const slots = round.diffs.map(() => {
    const s = h('span', { class: 'slot', html: icon('star') });
    progressEl.append(s);
    return s;
  });
  const buddyBtn = h('button', { type: 'button', class: 'buddy-btn', 'aria-label': `Ask ${buddy.name} for a hint`, title: `Hint from ${buddy.name}` });
  const buddyHappy = svg(buddy.draw('happy'), '0 0 200 200', 'mood mood-happy');
  const buddyJoy = svg(buddy.draw('joy'), '0 0 200 200', 'mood mood-joy');
  buddyBtn.append(h('span', { class: 'buddy-glow' }), buddyHappy, buddyJoy, h('span', { class: 'buddy-tip', html: icon('sparkle') }));

  const bar = h('header', { class: 'play-bar' }, mapBtn, progressEl, buddyBtn);
  const stage = h('div', { class: 'stage' });
  const panes: Pane[] = [makePane(0), makePane(1)];
  const zoomBtn = button({ label: 'Zoom out', icon: 'zoom-out', cls: 'btn-round zoom-reset', onTap: () => animateView(FULL) });
  stage.append(panes[0].el, panes[1].el, zoomBtn);
  const bg = h('div', { class: 'play-bg', 'aria-hidden': 'true' });
  [[4, 12], [12, 88], [22, 6], [34, 94], [50, 4], [63, 92], [76, 8], [88, 90], [96, 22], [93, 70], [3, 55], [52, 96]].forEach(([x, y], i) =>
    bg.append(h('i', { class: 'twinkle', html: icon('sparkle'), style: { left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 0.73) % 4.4}s` } })),
  );
  el.append(bg, bar, stage);

  function makePane(i: 0 | 1): Pane {
    const changed = changedIn(round, i);
    const prefix = nextPrefix(i ? 'r' : 'l');
    const pic = svg(
      `<g class="scene">${sceneMarkup(level, changed, prefix)}</g><g class="fx">` +
        `<defs><linearGradient id="${prefix}-ring" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0" stop-color="#FF7EB6"/><stop offset=".33" stop-color="#FFC94D"/><stop offset=".66" stop-color="#5ED6A6"/><stop offset="1" stop-color="#8F6BF0"/>` +
        `</linearGradient><radialGradient id="${prefix}-glow"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".55" stop-color="#FFF3B0" stop-opacity=".45"/><stop offset="1" stop-color="#FFE07A" stop-opacity="0"/></radialGradient></defs></g>`,
      `0 0 ${SCENE_W} ${SCENE_H}`,
      'pic',
      { role: 'img', 'aria-label': i === 0 ? 'First picture' : 'Second picture' },
    );
    const paneEl = h('div', { class: `pane pane-${i}` });
    paneEl.append(pic);
    const pane: Pane = { index: i, el: paneEl, svg: pic, fx: pic.querySelector('.fx') as SVGGElement, prefix, changed };
    bindPointers(pane);
    return pane;
  }

  /* ---------------------------------------------------------------- layout */
  function layout(): void {
    const W = stage.clientWidth;
    const H = stage.clientHeight - (parseFloat(getComputedStyle(stage).paddingBottom) || 0);
    if (!W || H <= 0) return;
    const gap = Math.round(clamp(Math.min(W, H) * 0.022, 8, 20));
    const side = Math.min((W - gap * 3) / 2, ((H - gap * 2) * 4) / 3);
    const stack = Math.min(W - gap * 2, (((H - gap * 3) / 2) * 4) / 3);
    const stacked = stack > side * 1.04;
    const pw = Math.floor(stacked ? stack : side);
    stage.classList.toggle('stacked', stacked);
    stage.style.setProperty('--pw', `${pw}px`);
    stage.style.setProperty('--ph', `${Math.floor(pw * 0.75)}px`);
    stage.style.setProperty('--gap', `${gap}px`);
  }
  const ro = new ResizeObserver(layout);
  ro.observe(stage);

  /* ---------------------------------------------------------------- zoom & pan */
  function setView(v: View): void {
    const w = clamp(v.w, MIN_VIEW_W, SCENE_W);
    const hh = (w * SCENE_H) / SCENE_W;
    view = { x: clamp(v.x, 0, SCENE_W - w), y: clamp(v.y, 0, SCENE_H - hh), w, h: hh };
    const vb = `${view.x.toFixed(2)} ${view.y.toFixed(2)} ${view.w.toFixed(2)} ${view.h.toFixed(2)}`;
    for (const p of panes) p.svg.setAttribute('viewBox', vb);
    el.classList.toggle('zoomed', view.w < SCENE_W - 0.5);
  }

  let viewAnim = 0;
  function animateView(target: View): void {
    cancelAnimationFrame(viewAnim);
    const from = { ...view };
    const t0 = performance.now();
    const dur = reducedMotion() ? 1 : 280;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setView({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, w: from.w + (target.w - from.w) * e, h: 0 });
      if (k < 1) viewAnim = requestAnimationFrame(step);
    };
    viewAnim = requestAnimationFrame(step);
  }

  function zoomAt(pane: Pane, clientX: number, clientY: number, newW: number, base: View = view): void {
    const r = pane.svg.getBoundingClientRect();
    const fx = clamp((clientX - r.left) / r.width, 0, 1);
    const fy = clamp((clientY - r.top) / r.height, 0, 1);
    const sx = base.x + fx * base.w;
    const sy = base.y + fy * base.h;
    const w = clamp(newW, MIN_VIEW_W, SCENE_W);
    const hh = (w * SCENE_H) / SCENE_W;
    setView({ x: sx - fx * w, y: sy - fy * hh, w, h: hh });
  }

  /* ---------------------------------------------------------------- input */
  interface Ptr {
    x: number;
    y: number;
    sx: number;
    sy: number;
    t: number;
    type: string;
  }
  const ptrs = new Map<number, Ptr>();
  let mode: 'none' | 'tap' | 'pan' | 'pinch' = 'none';
  let panBase: { view: View; x: number; y: number } | null = null;
  let pinchBase: { dist: number; view: View; mx: number; my: number; pane: Pane } | null = null;

  function bindPointers(pane: Pane): void {
    const target = pane.el;
    target.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), type: e.pointerType });
      if (ptrs.size === 1) mode = 'tap';
      else if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        pinchBase = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, view: { ...view }, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, pane };
        mode = 'pinch';
      }
    });
    target.addEventListener('pointermove', (e) => {
      const p = ptrs.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX;
      p.y = e.clientY;
      if (mode === 'tap') {
        if (Math.hypot(p.x - p.sx, p.y - p.sy) > 12) {
          if (view.w < SCENE_W - 0.5) {
            mode = 'pan';
            panBase = { view: { ...view }, x: p.x, y: p.y };
          } else mode = 'none';
        }
      } else if (mode === 'pan' && panBase) {
        const r = pane.svg.getBoundingClientRect();
        const k = view.w / r.width;
        setView({ ...panBase.view, x: panBase.view.x - (p.x - panBase.x) * k, y: panBase.view.y - (p.y - panBase.y) * k });
      } else if (mode === 'pinch' && pinchBase && ptrs.size >= 2) {
        const [a, b] = [...ptrs.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        // Zoom around the pinch centre, then follow the fingers as they move.
        zoomAt(pinchBase.pane, pinchBase.mx, pinchBase.my, pinchBase.view.w * (pinchBase.dist / dist), pinchBase.view);
        const r = pinchBase.pane.svg.getBoundingClientRect();
        const k = view.w / r.width;
        setView({ ...view, x: view.x - (mx - pinchBase.mx) * k, y: view.y - (my - pinchBase.my) * k });
      }
    });
    const end = (e: PointerEvent) => {
      const p = ptrs.get(e.pointerId);
      if (!p) return;
      ptrs.delete(e.pointerId);
      if (e.type === 'pointerup' && mode === 'tap' && performance.now() - p.t < 1000) handleTap(pane, e.clientX, e.clientY, p.type);
      if (ptrs.size === 0) {
        mode = 'none';
        panBase = null;
        pinchBase = null;
      } else if (mode === 'pinch') mode = 'none';
    };
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
    target.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const factor = Math.exp(e.deltaY * (e.ctrlKey ? 0.012 : 0.0016));
        zoomAt(pane, e.clientX, e.clientY, view.w * factor);
      },
      { passive: false },
    );
    target.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  function toScene(pane: Pane, cx: number, cy: number): { p: Point; upp: number } {
    const r = pane.svg.getBoundingClientRect();
    const upp = view.w / (r.width || 1);
    return { p: [view.x + (cx - r.left) * upp, view.y + (cy - r.top) * upp], upp };
  }

  function handleTap(pane: Pane, cx: number, cy: number, pointerType: string): void {
    if (done || destroyed) return;
    const now = performance.now();
    if (now < calmUntil) return;
    const { p, upp } = toScene(pane, cx, cy);
    const unfound = round.diffs.filter((d) => !foundIds.has(d.id));
    const i = pickHit(unfound, p, (pointerType === 'mouse' ? MOUSE_SLOP_PX : TOUCH_SLOP_PX) * upp);
    if (i >= 0) discover(unfound[i], pane);
    else miss(pane, p, upp, now);
  }

  /** Wrong taps: just a tiny neutral ripple. A burst of random tapping quietly pauses taps for a moment. */
  function miss(pane: Pane, p: Point, upp: number, now: number): void {
    misses.push(now);
    while (misses.length && now - misses[0] > 1800) misses.shift();
    if (misses.length >= 5) {
      calmUntil = now + 1300;
      misses.length = 0;
      return;
    }
    const outer = svgNode('g', { transform: `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})` });
    const ring = svgNode('circle', { r: (16 * upp).toFixed(2), class: 'ripple', fill: 'none', stroke: '#fff', 'stroke-width': (3 * upp).toFixed(2) });
    outer.append(ring);
    pane.fx.append(outer);
    later(() => outer.remove(), 520);
  }

  /* ---------------------------------------------------------------- discovery */
  function discover(d: Difference, tapped: Pane | null): void {
    foundIds.add(d.id);
    const k = foundIds.size - 1;
    const animate = tapped !== null;
    for (const p of panes) drawMarker(p, d, animate);
    const slot = slots[k];
    slot.classList.add('filled');
    if (animate) pulse(slot, 'pop', 700);
    progressEl.setAttribute('aria-label', `${foundIds.size} of ${round.diffs.length} found`);
    if (animate && tapped) {
      sound.found(k);
      buzz(14);
      cheer();
      showLearn(d, tapped);
      if (d.count) void countUp(d);
      lastFindAt = performance.now();
      buddyBtn.classList.remove('nudge');
      store.setCurrent(pid, { levelId: lid, play: round.play, seed: round.seed, found: [...foundIds] });
    }
    if (foundIds.size === round.diffs.length) void finish(animate);
  }

  function unitsPerPx(p: Pane): number {
    const w = p.svg.getBoundingClientRect().width;
    return w ? view.w / w : SCENE_W / 400;
  }

  function drawMarker(p: Pane, d: Difference, animate: boolean): void {
    const ring = shapeRing(d.hit);
    const upp = unitsPerPx(p);
    const rx = Math.max(ring.rx, 24 * upp) + 3;
    const ry = Math.max(ring.ry, 24 * upp) + 3;
    const g = svgNode('g', { class: animate ? 'mark pop' : 'mark', transform: `translate(${ring.cx} ${ring.cy})` });
    const inner = svgNode('g', { class: 'mark-inner' });
    if (animate) inner.append(svgNode('ellipse', { rx: rx * 1.3, ry: ry * 1.3, fill: `url(#${p.prefix}-glow)`, class: 'mark-glow' }));
    inner.append(
      svgNode('ellipse', { rx, ry, fill: 'none', stroke: '#fff', 'stroke-width': 10, 'vector-effect': 'non-scaling-stroke', opacity: 0.95 }),
      svgNode('ellipse', { rx, ry, fill: 'none', stroke: `url(#${p.prefix}-ring)`, 'stroke-width': 5.5, 'vector-effect': 'non-scaling-stroke', class: 'mark-ring', pathLength: 100 }),
    );
    g.append(inner);
    if (animate && !reducedMotion()) {
      const dist = Math.max(rx, ry) + 26 * upp;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        const s = (i % 2 ? 7 : 11) * upp;
        const spark = svgNode('path', {
          d: `M0 ${-s}Q${s * 0.2} ${-s * 0.2} ${s} 0Q${s * 0.2} ${s * 0.2} 0 ${s}Q${-s * 0.2} ${s * 0.2} ${-s} 0Q${-s * 0.2} ${-s * 0.2} 0 ${-s}Z`,
          fill: ['#FFD66B', '#FF8FB8', '#8CD9FF', '#B79BFF'][i % 4],
          class: 'spark',
          style: `--dx:${(Math.cos(a) * dist).toFixed(1)}px;--dy:${(Math.sin(a) * dist).toFixed(1)}px`,
        });
        g.append(spark);
        later(() => spark.remove(), 900);
      }
    }
    p.fx.append(g);
  }

  function showLearn(d: Difference, pane: Pane): void {
    voice.say(d.say ?? d.label);
    bubble?.remove();
    const ring = shapeRing(d.hit);
    const r = pane.svg.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const k = r.width / view.w;
    const cx = r.left - sr.left + (ring.cx - view.x) * k;
    const top = r.top - sr.top + (ring.cy - ring.ry - view.y) * k;
    const bottom = r.top - sr.top + (ring.cy + ring.ry - view.y) * k;
    const b = h('div', { class: 'learn' }, d.label);
    stage.append(b);
    const bw = b.offsetWidth;
    const bh = b.offsetHeight;
    const left = clamp(cx - bw / 2, 6, sr.width - bw - 6);
    let y = top - bh - 12;
    if (y < 4) y = Math.min(bottom + 12, sr.height - bh - 4);
    b.style.left = `${left}px`;
    b.style.top = `${y}px`;
    b.style.setProperty('--tail', `${clamp(cx - left, 18, bw - 18)}px`);
    bubble = b;
    later(() => b.classList.add('out'), 2600);
    later(() => b.remove(), 3000);
  }

  async function countUp(d: Difference): Promise<void> {
    if (!d.count) return;
    const counts = panes.map((p) => (p.changed.has(d.id) ? d.count!.b : d.count!.a));
    const total = Math.max(...counts.map((c) => c.length));
    const badges: SVGGElement[] = [];
    for (let k = 0; k < total; k++) {
      await wait(k === 0 ? 450 : 430);
      if (destroyed) return;
      sound.count(k);
      panes.forEach((p, i) => {
        const pt = counts[i][k];
        if (!pt) return;
        const upp = unitsPerPx(p);
        const g = svgNode('g', { transform: `translate(${pt[0]} ${pt[1]})` });
        const inner = svgNode('g', { class: 'count-badge' });
        inner.append(
          svgNode('circle', { r: 15 * upp, fill: '#fff', stroke: world.theme.accent, 'stroke-width': 3.5 * upp }),
          Object.assign(svgNode('text', { y: 6.2 * upp, 'text-anchor': 'middle', 'font-size': 18 * upp, 'font-weight': 700, fill: world.theme.deep }), { textContent: String(k + 1) }),
        );
        g.append(inner);
        p.fx.append(g);
        badges.push(g);
      });
    }
    await wait(2200);
    badges.forEach((b) => b.classList.add('fade'));
    await wait(450);
    badges.forEach((b) => b.remove());
  }

  /* ---------------------------------------------------------------- buddy */
  function cheer(): void {
    buddyBtn.classList.add('joy');
    pulse(buddyBtn, 'hop', 700);
    later(() => buddyBtn.classList.remove('joy'), 1300);
  }

  buddyBtn.addEventListener('click', () => {
    sound.tap();
    pulse(buddyBtn, 'hop', 700);
    if (done) return;
    const now = performance.now();
    if (now - lastHintAt < 3000) return;
    const target = round.diffs.find((d) => !foundIds.has(d.id));
    if (!target) return;
    lastHintAt = now;
    buddyBtn.classList.remove('nudge');
    sound.hint();
    voice.say(choose(['Look over here!', 'Try looking here!', 'Something is different here!', 'Look closely around here!']));
    // A soft glow around the area (not the exact spot) in both pictures.
    const ring = shapeRing(target.hit);
    const R = clamp(Math.max(ring.rx, ring.ry) * 2 + 30, 95, 165);
    const ang = Math.random() * Math.PI * 2;
    const off = Math.max(ring.rx, ring.ry) * 0.45;
    const cx = clamp(ring.cx + Math.cos(ang) * off, R * 0.6, SCENE_W - R * 0.6);
    const cy = clamp(ring.cy + Math.sin(ang) * off, R * 0.6, SCENE_H - R * 0.6);
    for (const p of panes) {
      const g = svgNode('g', { transform: `translate(${cx.toFixed(1)} ${cy.toFixed(1)})` });
      const inner = svgNode('g', { class: 'hint-glow' });
      inner.append(
        svgNode('circle', { r: R, fill: `url(#${p.prefix}-glow)` }),
        svgNode('circle', { r: R * 0.92, fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-dasharray': '2 14', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke', class: 'hint-dots' }),
      );
      g.append(inner);
      p.fx.prepend(g);
      later(() => g.remove(), 3400);
    }
  });

  const nudgeTimer = window.setInterval(() => {
    if (done || destroyed) return;
    const now = performance.now();
    if (now - lastFindAt > NUDGE_AFTER_MS && now - lastHintAt > NUDGE_AFTER_MS) buddyBtn.classList.add('nudge');
  }, 2000);

  /* ---------------------------------------------------------------- finish */
  async function finish(animate: boolean): Promise<void> {
    done = true;
    buddyBtn.classList.remove('nudge');
    const newSticker = store.completeLevel(pid, lid, level.sticker.id);
    const worldDone = world.levels.every((l) => store.isDone(pid, l.id));
    const newBadge = worldDone ? store.award(pid, world.badge.id) : false;
    await wait(animate ? 1100 : 250);
    if (destroyed) return;
    el.classList.add('complete');
    buddyBtn.classList.add('joy');
    sound.fanfare();
    stopCelebrate = celebrate({
      host: el,
      world,
      level,
      index,
      profile,
      buddy,
      newSticker,
      badge: newBadge ? world.badge : null,
      onNext: () => {
        const next = world.levels[index + 1];
        if (next) go({ name: 'play', pid, lid: next.id });
        else go({ name: 'map', pid, wid: world.id });
      },
      onMap: () => go({ name: 'map', pid, wid: world.id }),
      onReplay: () => go({ name: 'play', pid, lid }),
    });
  }

  /* ---------------------------------------------------------------- intro */
  function intro(): void {
    const n = round.diffs.length;
    if (resumeIds.length) {
      for (const id of resumeIds) {
        const d = round.diffs.find((x) => x.id === id);
        if (d) discover(d, null);
      }
      if (!done) voice.say(`Welcome back! ${n - foundIds.size} more to find!`);
      return;
    }
    slots.forEach((s, i) => later(() => pulse(s, 'appear', 600), 120 * i));
    if (firstEver) {
      const tip = h(
        'div',
        { class: 'first-tip', role: 'note' },
        h('div', { class: 'first-tip-card' }, svg(buddy.draw('joy'), '0 0 200 200', 'first-tip-buddy'), h('p', {}, 'Find what is different!'), h('p', { class: 'small' }, 'Tap it in either picture')),
      );
      el.append(tip);
      const close = () => {
        tip.classList.add('out');
        later(() => tip.remove(), 400);
      };
      tip.addEventListener('pointerdown', close, { once: true });
      later(close, 4200);
      voice.say(`Hi ${profile.name}! Look at the two pictures. Can you find ${n} things that are different? Tap them!`);
    } else voice.say(choose([`Can you find ${n} differences?`, `Find ${n} differences!`, `${n} little differences are hiding!`]));
  }

  // Dev-only hook for automated play-tests (stripped from production builds).
  if (import.meta.env.DEV) {
    (window as unknown as { __lw?: unknown }).__lw = {
      level: level.id,
      diffs: round.diffs.map((d) => ({ id: d.id, ring: shapeRing(d.hit) })),
      flips: Object.fromEntries(round.flips),
      view: () => ({ ...view }),
      found: () => [...foundIds],
    };
  }

  return {
    el,
    music: world.music,
    enter() {
      layout();
      setView(FULL);
      sound.duck(0.55);
      intro();
    },
    destroy() {
      destroyed = true;
      ro.disconnect();
      cancelAnimationFrame(viewAnim);
      clearInterval(nudgeTimer);
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      stopCelebrate?.();
      voice.stop();
      sound.duck(1);
    },
  };
}
