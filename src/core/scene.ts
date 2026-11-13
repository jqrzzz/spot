import type { DrawCtx, Level } from './types.ts';
import { SCENE_H, SCENE_W } from './types.ts';

/**
 * Build the context handed to Level.draw(). `on` is the set of difference ids that show their
 * changed ("b") version in this picture. In strict mode an unknown id throws, which the level
 * lab uses to catch typos.
 */
export function makeCtx(level: Level, on: ReadonlySet<string>, strict = false): DrawCtx {
  const known = new Set(level.differences.map((d) => d.id));
  const check = (id: string) => {
    if (known.has(id)) return;
    const msg = `[${level.id}] draw() used unknown difference id "${id}"`;
    if (strict) throw new Error(msg);
    console.warn(msg);
  };
  return {
    on(id) {
      check(id);
      return on.has(id);
    },
    pick<T>(id: string, a: T, b: T): T {
      check(id);
      return on.has(id) ? b : a;
    },
  };
}

/**
 * Several SVGs live in one document (two pictures, thumbnails…), and `url(#id)` resolves
 * document-wide. Prefix every id and reference so each rendered picture is self-contained.
 */
export function namespaceIds(markup: string, prefix: string): string {
  return markup
    .replace(/(\s)id="([^"]+)"/g, (_m, sp: string, id: string) => `${sp}id="${prefix}-${id}"`)
    .replace(/url\(\s*#([^)\s]+)\s*\)/g, (_m, id: string) => `url(#${prefix}-${id})`)
    .replace(/(\s)(xlink:href|href)="#([^"]+)"/g, (_m, sp: string, attr: string, id: string) => `${sp}${attr}="#${prefix}-${id}"`);
}

let uid = 0;
/** Unique, short prefix for namespacing. */
export function nextPrefix(tag = 's'): string {
  uid += 1;
  return `${tag}${uid.toString(36)}`;
}

/** Scene markup (inner SVG) for a level with the given difference ids switched on. */
export function sceneMarkup(level: Level, on: ReadonlySet<string>, prefix: string, strict = false): string {
  return namespaceIds(level.draw(makeCtx(level, on, strict)), prefix);
}

/** A standalone SVG document (for rasterising / data URLs). */
export function svgDocument(inner: string, w = SCENE_W, h = SCENE_H, viewW = SCENE_W, viewH = SCENE_H): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `viewBox="0 0 ${viewW} ${viewH}" width="${w}" height="${h}">${inner}</svg>`
  );
}
