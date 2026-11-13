import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickHit, shapeArea, shapeDistance, shapeRing } from '../src/core/hit.ts';
import { changedIn, planRound } from '../src/core/select.ts';
import { namespaceIds, sceneMarkup } from '../src/core/scene.ts';
import type { Level } from '../src/core/types.ts';
import { store } from '../src/core/storage.ts';

const level: Level = {
  id: 'zz-1',
  title: 'Test',
  findCount: 3,
  differences: ['a', 'b', 'c', 'd', 'e'].map((id, i) => ({
    id,
    kind: 'add' as const,
    theme: 'colors' as const,
    label: id,
    hit: { type: 'circle' as const, cx: 80 + i * 150, cy: 300, r: 50 },
  })),
  draw: (c) => `<rect id="bg" fill="url(#bg)"/>${c.on('a') ? '<circle r="5"/>' : ''}`,
  sticker: { id: 'st', name: 'S', draw: () => '' },
};

test('shapeDistance: inside is 0, outside measures to the edge', () => {
  const c = { type: 'circle', cx: 100, cy: 100, r: 50 } as const;
  assert.equal(shapeDistance(c, [100, 100]), 0);
  assert.equal(shapeDistance(c, [100, 160]), 10);
  const r = { type: 'rect', x: 0, y: 0, w: 100, h: 50 } as const;
  assert.equal(shapeDistance(r, [50, 25]), 0);
  assert.equal(shapeDistance(r, [103, 54]), 5);
  const e = { type: 'ellipse', cx: 0, cy: 0, rx: 100, ry: 50 } as const;
  assert.equal(shapeDistance(e, [90, 0]), 0);
  assert.ok(Math.abs(shapeDistance(e, [110, 0]) - 10) < 1e-9);
  const p = { type: 'poly', points: [[0, 0], [100, 0], [0, 100]] } as const;
  assert.equal(shapeDistance(p, [10, 10]), 0);
  assert.ok(shapeDistance(p, [100, 100]) > 70);
});

test('pickHit picks the nearest shape within tolerance only', () => {
  const ds = level.differences;
  assert.equal(pickHit(ds, [80, 300], 0), 0);
  assert.equal(pickHit(ds, [80, 360], 5), -1);
  assert.equal(pickHit(ds, [80, 360], 12), 0);
  // Between two shapes: the closer one wins.
  assert.equal(pickHit(ds, [150, 300], 40), 0);
  assert.equal(pickHit(ds, [160, 300], 40), 1);
});

test('shapeRing and shapeArea', () => {
  assert.deepEqual(shapeRing({ type: 'circle', cx: 1, cy: 2, r: 3 }), { cx: 1, cy: 2, rx: 3, ry: 3 });
  assert.ok(Math.abs(shapeArea({ type: 'rect', x: 0, y: 0, w: 10, h: 20 }) - 200) < 1e-9);
});

test('first play uses the curated set with every change in the second picture', () => {
  const r = planRound(level, 0, 123);
  assert.deepEqual(r.diffs.map((d) => d.id), ['a', 'b', 'c']);
  assert.deepEqual([...changedIn(r, 0)], []);
  assert.deepEqual([...changedIn(r, 1)].sort(), ['a', 'b', 'c']);
});

test('replays pick a reproducible fresh mix and split changes across pictures', () => {
  const r1 = planRound(level, 2, 999);
  const r2 = planRound(level, 2, 999);
  assert.deepEqual(r1.diffs.map((d) => d.id), r2.diffs.map((d) => d.id));
  assert.equal(r1.diffs.length, 3);
  const left = changedIn(r1, 0);
  const right = changedIn(r1, 1);
  for (const d of r1.diffs) assert.ok(left.has(d.id) !== right.has(d.id), 'each difference lives in exactly one picture');
  // Across many seeds every candidate eventually appears.
  const seen = new Set<string>();
  for (let s = 1; s < 60; s++) planRound(level, 1, s).diffs.forEach((d) => seen.add(d.id));
  assert.equal(seen.size, 5);
});

test('ids are namespaced so two pictures never share gradient ids', () => {
  const m = namespaceIds('<linearGradient id="sky"/><rect fill="url(#sky)"/><use href="#sky"/>', 'p1');
  assert.equal(m, '<linearGradient id="p1-sky"/><rect fill="url(#p1-sky)"/><use href="#p1-sky"/>');
  assert.ok(sceneMarkup(level, new Set(['a']), 'x').includes('<circle'));
  assert.throws(() => sceneMarkup({ ...level, draw: (c) => String(c.on('nope')) }, new Set(), 'x', true));
});

test('storage: stickers are awarded once and new players get unique ids', () => {
  assert.equal(store.profiles.length, 2);
  assert.equal(store.completeLevel('jett', 'rv-1', 'st-rv-1'), true);
  assert.equal(store.completeLevel('jett', 'rv-1', 'st-rv-1'), false);
  assert.equal(store.plays('jett', 'rv-1'), 2);
  assert.equal(store.isDone('june', 'rv-1'), false);
  const a = store.addProfile('Jett', 'bop');
  assert.notEqual(a.id, 'jett');
  store.removeProfile(a.id);
  assert.equal(store.profiles.length, 2);
});
