import type { HitShape, Point } from './types.ts';

/**
 * Pure hit-testing helpers. Rendering never decides whether a tap is correct: only the explicit
 * difference data does. All values are in scene units (viewBox 800 x 600).
 */

/** Distance from point p to the shape: 0 when inside, otherwise distance to its edge (ellipse is approximated). */
export function shapeDistance(shape: HitShape, p: Point): number {
  const [x, y] = p;
  switch (shape.type) {
    case 'circle': {
      const d = Math.hypot(x - shape.cx, y - shape.cy) - shape.r;
      return Math.max(0, d);
    }
    case 'ellipse': {
      const nx = (x - shape.cx) / shape.rx;
      const ny = (y - shape.cy) / shape.ry;
      const k = Math.hypot(nx, ny);
      if (k <= 1) return 0;
      // Distance along the ray from the centre — a close, monotonic approximation.
      const ray = Math.hypot(x - shape.cx, y - shape.cy);
      return ray * (1 - 1 / k);
    }
    case 'rect': {
      const dx = Math.max(shape.x - x, 0, x - (shape.x + shape.w));
      const dy = Math.max(shape.y - y, 0, y - (shape.y + shape.h));
      return Math.hypot(dx, dy);
    }
    case 'poly': {
      if (pointInPolygon(shape.points, x, y)) return 0;
      let best = Infinity;
      const pts = shape.points;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        best = Math.min(best, segmentDistance(a, b, x, y));
      }
      return best;
    }
  }
}

function pointInPolygon(pts: readonly Point[], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function segmentDistance(a: Point, b: Point, x: number, y: number): number {
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
}

/** Axis-aligned bounds of a shape. */
export function shapeBounds(shape: HitShape): { x: number; y: number; w: number; h: number } {
  switch (shape.type) {
    case 'circle':
      return { x: shape.cx - shape.r, y: shape.cy - shape.r, w: shape.r * 2, h: shape.r * 2 };
    case 'ellipse':
      return { x: shape.cx - shape.rx, y: shape.cy - shape.ry, w: shape.rx * 2, h: shape.ry * 2 };
    case 'rect':
      return { x: shape.x, y: shape.y, w: shape.w, h: shape.h };
    case 'poly': {
      const xs = shape.points.map((p) => p[0]);
      const ys = shape.points.map((p) => p[1]);
      const x = Math.min(...xs);
      const y = Math.min(...ys);
      return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
    }
  }
}

/** Centre and radii used to draw the "found" ring around a shape. */
export function shapeRing(shape: HitShape): { cx: number; cy: number; rx: number; ry: number } {
  if (shape.type === 'circle') return { cx: shape.cx, cy: shape.cy, rx: shape.r, ry: shape.r };
  if (shape.type === 'ellipse') return { cx: shape.cx, cy: shape.cy, rx: shape.rx, ry: shape.ry };
  const b = shapeBounds(shape);
  // Ellipse that circumscribes the box, slightly relaxed so it doesn't look oversized.
  return { cx: b.x + b.w / 2, cy: b.y + b.h / 2, rx: (b.w / 2) * 1.2, ry: (b.h / 2) * 1.2 };
}

/** Approximate area of a shape, in square scene units. */
export function shapeArea(shape: HitShape): number {
  switch (shape.type) {
    case 'circle':
      return Math.PI * shape.r * shape.r;
    case 'ellipse':
      return Math.PI * shape.rx * shape.ry;
    case 'rect':
      return shape.w * shape.h;
    case 'poly': {
      let a = 0;
      const p = shape.points;
      for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]);
      return Math.abs(a / 2);
    }
  }
}

/**
 * Pick the candidate the tap most plausibly meant: the closest shape whose distance is within
 * `tolerance` (scene units). Returns its index or -1.
 */
export function pickHit<T extends { hit: HitShape }>(candidates: readonly T[], p: Point, tolerance: number): number {
  let best = -1;
  let bestD = Infinity;
  candidates.forEach((c, i) => {
    const d = shapeDistance(c.hit, p);
    if (d <= tolerance && d < bestD) {
      best = i;
      bestD = d;
    }
  });
  return best;
}
