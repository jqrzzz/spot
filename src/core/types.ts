/**
 * Little Wonder — core content contracts.
 *
 * A level is ONE illustration drawn from code. The two pictures the child compares are the
 * same draw() call rendered twice with different difference states, so everything that is not
 * an intentional difference is pixel-identical by construction.
 *
 * All coordinates use the scene viewBox: 0 0 800 600 (4:3).
 */

export const SCENE_W = 800;
export const SCENE_H = 600;

export type Point = readonly [number, number];

/** Clickable area of a difference, in scene units. Keep areas generous but never overlapping. */
export type HitShape =
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { type: 'rect'; x: number; y: number; w: number; h: number }
  | { type: 'poly'; points: readonly Point[] };

/** What kind of change it is (used for difficulty modelling). */
export type DiffKind =
  | 'add' // something appears in one picture only
  | 'remove'
  | 'color'
  | 'count' // different number of things
  | 'shape'
  | 'size'
  | 'pattern'
  | 'position'
  | 'direction' // facing / pointing left vs right
  | 'expression'; // a face shows a different feeling

/** The learning idea a difference quietly practises. */
export type LearnTheme =
  | 'colors'
  | 'counting'
  | 'shapes'
  | 'patterns'
  | 'position'
  | 'size'
  | 'memory'
  | 'music'
  | 'sequences'
  | 'matching'
  | 'emotions'
  | 'left-right'
  | 'seasons'
  | 'weather'
  | 'symmetry'
  | 'nature';

export interface Difference {
  /** Unique within the level, kebab-case, e.g. 'apples'. Used by draw() via ctx.on(id). */
  id: string;
  hit: HitShape;
  kind: DiffKind;
  theme: LearnTheme;
  /**
   * Short caption shown in a bubble when found. Must read correctly whichever picture is
   * tapped, so describe BOTH versions neutrally: "3 apples and 4 apples", "Star or circle?".
   * Max ~30 characters.
   */
  label: string;
  /** Spoken version for pre-readers (Web Speech). Defaults to `label`. Warm and short. */
  say?: string;
  /**
   * Optional counting badges. Centre points (scene units) of each counted object in the
   * original (a) and changed (b) version. The game pops 1, 2, 3… on them in each picture.
   */
  count?: { a: readonly Point[]; b: readonly Point[] };
}

/** Passed to Level.draw(). */
export interface DrawCtx {
  /** True when difference `id` shows its changed ("b") version in the picture being drawn. */
  on(id: string): boolean;
  /** Returns `a` for the original version of difference `id`, `b` for the changed version. */
  pick<T>(id: string, a: T, b: T): T;
}

export interface Sticker {
  id: string;
  name: string;
  /** SVG markup for viewBox 0 0 200 200, artwork centred, transparent background. */
  draw(): string;
}

export interface Level {
  /** e.g. 'rv-1' */
  id: string;
  /** Short, story-like title, e.g. 'Apple Hill Picnic'. */
  title: string;
  /** How many differences a child finds in one play (3–6). */
  findCount: number;
  /**
   * Candidate differences. The first `findCount` entries are the curated first-play set
   * (easiest first). Extra candidates (ideally 2) make replays feel fresh.
   */
  differences: Difference[];
  /** Deterministic SVG markup for viewBox 0 0 800 600. No Math.random, no Date. */
  draw(ctx: DrawCtx): string;
  /** Collectible earned the first time the level is completed. */
  sticker: Sticker;
}

export interface WorldTheme {
  /** Background gradient (top, bottom) for this world's screens. */
  sky: [string, string];
  /** Accent colour for buttons/highlights on this world's screens. */
  accent: string;
  /** Dark text/ink colour that reads well on `sky`. */
  deep: string;
  /** Colour of the dotted level path on the world map. */
  path: string;
}

export type MusicStyle = 'valley' | 'pop' | 'frost';

export interface World {
  id: string;
  name: string;
  /** e.g. 'Colours, counting & shapes' */
  tagline: string;
  theme: WorldTheme;
  music: MusicStyle;
  /** Cover illustration, SVG markup for viewBox 0 0 800 600. */
  cover(): string;
  /** Optional backdrop for the level-map screen, SVG markup for viewBox 0 0 1200 800 (cropped to fill). */
  mapArt?(): string;
  levels: Level[];
  /** Awarded when every level in the world is complete. */
  badge: Sticker;
}
