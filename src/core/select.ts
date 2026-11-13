import type { Difference, Level } from './types.ts';

/** One play of a level: which differences are hidden, and which picture shows each change. */
export interface Round {
  level: Level;
  play: number;
  seed: number;
  /** Differences to find, in curated (easiest-first) order. */
  diffs: Difference[];
  /** For each difference: true → the LEFT/TOP picture shows the changed ("b") version. */
  flips: Map<string, boolean>;
}

/** Seeded PRNG (mulberry32) — rounds are reproducible so a reload can resume the same round. */
export function prng(seed: number): () => number {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const newSeed = (): number => (Math.floor(Math.random() * 0x7fffffff) || 1) >>> 0;

/**
 * First play uses the curated set, with every change in the second picture. Replays pick a
 * fresh mix from all candidates and randomly swap which picture holds each change, so a
 * favourite level keeps offering new secrets.
 */
export function planRound(level: Level, play: number, seed: number): Round {
  const n = Math.min(level.findCount, level.differences.length);
  if (play <= 0 || level.differences.length <= n) {
    const diffs = level.differences.slice(0, n);
    return { level, play, seed, diffs, flips: new Map(diffs.map((d) => [d.id, false])) };
  }
  const rand = prng(seed);
  const idx = level.differences.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const chosen = idx.slice(0, n).sort((a, b) => a - b);
  const diffs = chosen.map((i) => level.differences[i]);
  return { level, play, seed, diffs, flips: new Map(diffs.map((d) => [d.id, rand() < 0.5])) };
}

/** Difference ids that show their changed version in the given picture (0 = left/top, 1 = right/bottom). */
export function changedIn(round: Round, picture: 0 | 1): Set<string> {
  return new Set(round.diffs.filter((d) => (round.flips.get(d.id) ?? false) === (picture === 0)).map((d) => d.id));
}
