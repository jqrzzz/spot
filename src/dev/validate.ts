/**
 * Level quality gate (runs in the browser, used by lab.html and `npm run validate`).
 *
 * For every level it renders the scene with each difference switched on alone and with all of
 * them on, rasterises to pixels, and checks that:
 *  - every difference produces a clearly visible change (big enough for a six-year-old),
 *  - nothing changes outside that difference's hit area (no accidental differences),
 *  - hit areas are inside the scene, generous but not huge, and never overlap,
 *  - draw() is deterministic and only uses known difference ids.
 */
import type { HitShape, Level, Sticker, World } from '../core/types.ts';
import { SCENE_H, SCENE_W } from '../core/types.ts';
import { makeCtx, svgDocument } from '../core/scene.ts';
import { shapeArea, shapeBounds, shapeDistance } from '../core/hit.ts';

export interface DiffStat {
  id: string;
  visiblePx: number;
  anyPx: number;
  leakPx: number;
  bbox: [number, number, number, number] | null;
}

export interface LevelReport {
  world: string;
  level: string;
  title: string;
  errors: string[];
  warnings: string[];
  diffs: DiffStat[];
}

export interface WorldReport {
  world: string;
  errors: string[];
  warnings: string[];
  levels: LevelReport[];
}

export const LIMITS = {
  VISIBLE_DELTA: 40, // per-channel change that reads as clearly visible
  ANY_DELTA: 10, // smallest change we treat as "different"
  MIN_VISIBLE_PX: 450, // error below this: too subtle for young children
  SUBTLE_PX: 1100, // warning below this
  LEAK_MARGIN: 6, // scene units of slack outside a hit area (anti-aliasing)
  LEAK_TOLERANCE_PX: 6, // stray pixels tolerated
  MIN_HIT_SIZE: 56, // smallest hit-area dimension before a warning
  MAX_HIT_FRACTION: 0.1, // a single hit area may not cover more than 10% of the scene
};

export async function rasterize(markup: string, w = SCENE_W, h = SCENE_H, viewW = SCENE_W, viewH = SCENE_H): Promise<Uint8ClampedArray> {
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgDocument(markup, w, h, viewW, viewH));
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('no 2d context');
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data;
}

function drawWith(level: Level, on: Iterable<string>): string {
  return level.draw(makeCtx(level, new Set(on), true));
}

interface Changed {
  any: number;
  visible: number;
  leak: number;
  leakBox: [number, number, number, number] | null;
  box: [number, number, number, number] | null;
}

/** Compare two rasters; count changed pixels and those outside `allowed` shapes. */
function compare(a: Uint8ClampedArray, b: Uint8ClampedArray, allowed: HitShape[]): Changed {
  let any = 0;
  let visible = 0;
  let leak = 0;
  let box: [number, number, number, number] | null = null;
  let leakBox: [number, number, number, number] | null = null;
  const grow = (bx: [number, number, number, number] | null, x: number, y: number): [number, number, number, number] =>
    bx ? [Math.min(bx[0], x), Math.min(bx[1], y), Math.max(bx[2], x), Math.max(bx[3], y)] : [x, y, x, y];
  for (let i = 0, p = 0; i < a.length; i += 4, p++) {
    const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]), Math.abs(a[i + 3] - b[i + 3]));
    if (d <= LIMITS.ANY_DELTA) continue;
    const x = p % SCENE_W;
    const y = (p / SCENE_W) | 0;
    any++;
    if (d > LIMITS.VISIBLE_DELTA) {
      visible++;
      box = grow(box, x, y);
    }
    const pt: [number, number] = [x + 0.5, y + 0.5];
    if (!allowed.some((s) => shapeDistance(s, pt) <= LIMITS.LEAK_MARGIN)) {
      leak++;
      leakBox = grow(leakBox, x, y);
    }
  }
  return { any, visible, leak, leakBox, box };
}

const fmtBox = (b: [number, number, number, number] | null): string => (b ? `x ${b[0]}–${b[2]}, y ${b[1]}–${b[3]}` : '');

function overlapCells(a: HitShape, b: HitShape): number {
  const ba = shapeBounds(a);
  const bb = shapeBounds(b);
  const x0 = Math.max(ba.x, bb.x);
  const y0 = Math.max(ba.y, bb.y);
  const x1 = Math.min(ba.x + ba.w, bb.x + bb.w);
  const y1 = Math.min(ba.y + ba.h, bb.y + bb.h);
  if (x1 <= x0 || y1 <= y0) return 0;
  let cells = 0;
  for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) if (shapeDistance(a, [x, y]) === 0 && shapeDistance(b, [x, y]) === 0) cells++;
  return cells;
}

export async function validateLevel(world: World, level: Level): Promise<LevelReport> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const diffs: DiffStat[] = [];
  const report: LevelReport = { world: world.id, level: level.id, title: level.title, errors, warnings, diffs };

  // ---------- structure
  if (!/^[a-z]{2}-\d+$/.test(level.id)) warnings.push(`level id "${level.id}" should look like "rv-1"`);
  if (!level.title?.trim()) errors.push('missing title');
  if (!(level.findCount >= 3 && level.findCount <= 6)) errors.push(`findCount ${level.findCount} is outside 3–6`);
  if (level.differences.length < level.findCount) errors.push(`only ${level.differences.length} differences for findCount ${level.findCount}`);
  else if (level.differences.length < level.findCount + 2) warnings.push(`${level.differences.length} candidates — aim for findCount + 2 (${level.findCount + 2}) so replays feel fresh`);

  const ids = new Set<string>();
  for (const d of level.differences) {
    if (ids.has(d.id)) errors.push(`duplicate difference id "${d.id}"`);
    ids.add(d.id);
    const b = shapeBounds(d.hit);
    if (b.x < 0 || b.y < 0 || b.x + b.w > SCENE_W || b.y + b.h > SCENE_H) errors.push(`"${d.id}" hit area goes outside the scene (${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.w)}×${Math.round(b.h)})`);
    if (Math.min(b.w, b.h) < LIMITS.MIN_HIT_SIZE) warnings.push(`"${d.id}" hit area is small (${Math.round(b.w)}×${Math.round(b.h)}); aim for ≥ ${LIMITS.MIN_HIT_SIZE}`);
    if (shapeArea(d.hit) > LIMITS.MAX_HIT_FRACTION * SCENE_W * SCENE_H) errors.push(`"${d.id}" hit area is too large (${Math.round((shapeArea(d.hit) / (SCENE_W * SCENE_H)) * 100)}% of the scene)`);
    if (!d.label?.trim()) errors.push(`"${d.id}" has no label`);
    else if (d.label.length > 32) warnings.push(`"${d.id}" label is long (${d.label.length} chars): "${d.label}"`);
    if (d.kind === 'count' && !d.count) warnings.push(`"${d.id}" is a counting difference without count points`);
    if (d.count) {
      for (const [x, y] of [...d.count.a, ...d.count.b]) if (x < 0 || y < 0 || x > SCENE_W || y > SCENE_H) errors.push(`"${d.id}" count point (${x},${y}) is outside the scene`);
      if (d.count.a.length === d.count.b.length) warnings.push(`"${d.id}" count points have the same length in both versions`);
    }
  }
  for (let i = 0; i < level.differences.length; i++)
    for (let j = i + 1; j < level.differences.length; j++) {
      const c = overlapCells(level.differences[i].hit, level.differences[j].hit);
      if (c > 0) errors.push(`hit areas "${level.differences[i].id}" and "${level.differences[j].id}" overlap`);
    }

  // ---------- rendering
  let base: Uint8ClampedArray;
  try {
    const m1 = drawWith(level, []);
    const m2 = drawWith(level, []);
    if (m1 !== m2) errors.push('draw() is not deterministic (two renders differ) — use rng(seed), never Math.random/Date');
    if (/<text[\s>]/.test(m1)) warnings.push('scene contains <text>; prefer drawn shapes (fonts differ across devices)');
    if (/<filter[\s>]/.test(m1)) warnings.push('scene uses SVG filters; these are slow on phones — prefer gradients/opacity');
    const elements = (m1.match(/<(path|circle|ellipse|rect|polygon|polyline|line|use)\b/g) ?? []).length;
    if (elements > 1400) warnings.push(`scene is heavy (${elements} elements); keep under ~1400 for smooth phones`);
    base = await rasterize(m1);
  } catch (e) {
    errors.push(`draw() failed: ${(e as Error).message}`);
    return report;
  }

  for (const d of level.differences) {
    try {
      const img = await rasterize(drawWith(level, [d.id]));
      const c = compare(base, img, [d.hit]);
      diffs.push({ id: d.id, visiblePx: c.visible, anyPx: c.any, leakPx: c.leak, bbox: c.box });
      if (c.visible < LIMITS.MIN_VISIBLE_PX) errors.push(`"${d.id}" is too subtle: ${c.visible}px clearly changed (need ≥ ${LIMITS.MIN_VISIBLE_PX})`);
      else if (c.visible < LIMITS.SUBTLE_PX) warnings.push(`"${d.id}" is subtle: ${c.visible}px clearly changed`);
      if (c.leak > LIMITS.LEAK_TOLERANCE_PX) errors.push(`"${d.id}" changes ${c.leak}px OUTSIDE its hit area (${fmtBox(c.leakBox)}) — enlarge/move the hit area or keep the change inside it`);
      if (c.visible > 0 && shapeArea(d.hit) > c.visible * 16) warnings.push(`"${d.id}" hit area is much larger than the visible change (${Math.round(shapeArea(d.hit))} vs ${c.visible}px)`);
    } catch (e) {
      errors.push(`"${d.id}" render failed: ${(e as Error).message}`);
    }
  }
  try {
    const all = await rasterize(drawWith(level, level.differences.map((d) => d.id)));
    const c = compare(base, all, level.differences.map((d) => d.hit));
    if (c.leak > LIMITS.LEAK_TOLERANCE_PX) errors.push(`with all differences on, ${c.leak}px change outside every hit area (${fmtBox(c.leakBox)})`);
  } catch (e) {
    errors.push(`all-on render failed: ${(e as Error).message}`);
  }
  return report;
}

async function stickerCoverage(s: Sticker): Promise<number> {
  const px = await rasterize(s.draw(), 200, 200, 200, 200);
  let filled = 0;
  for (let i = 3; i < px.length; i += 4) if (px[i] > 20) filled++;
  return filled / (200 * 200);
}

export async function validateWorld(world: World, only?: string | null): Promise<WorldReport> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const levels: LevelReport[] = [];
  if (!only) {
    if (world.levels.length !== 5) warnings.push(`world has ${world.levels.length} levels (Version 0.1 expects 5)`);
    const lids = new Set<string>();
    const sids = new Set<string>([world.badge.id]);
    world.levels.forEach((l, i) => {
      if (lids.has(l.id)) errors.push(`duplicate level id ${l.id}`);
      lids.add(l.id);
      if (sids.has(l.sticker.id)) errors.push(`duplicate sticker id ${l.sticker.id}`);
      sids.add(l.sticker.id);
      if (i > 0 && l.findCount < world.levels[i - 1].findCount) warnings.push(`${l.id} asks for fewer differences than the level before it`);
    });
    try {
      const cover = world.cover();
      if (!cover.trim()) errors.push('cover() is empty');
      else await rasterize(cover);
    } catch (e) {
      errors.push(`cover() failed: ${(e as Error).message}`);
    }
    for (const s of [world.badge, ...world.levels.map((l) => l.sticker)]) {
      try {
        const cov = await stickerCoverage(s);
        if (cov < 0.08) warnings.push(`sticker "${s.id}" covers only ${Math.round(cov * 100)}% of its 200×200 box`);
      } catch (e) {
        errors.push(`sticker "${s.id}" failed: ${(e as Error).message}`);
      }
    }
  }
  for (const level of world.levels) {
    if (only && level.id !== only) continue;
    levels.push(await validateLevel(world, level));
  }
  return { world: world.id, errors, warnings, levels };
}
