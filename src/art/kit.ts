/**
 * Little Wonder — shared art kit.
 *
 * Every function returns SVG markup (a string) so scenes can be composed with template
 * literals. Style rules this kit encodes:
 *  - Soft pastel palette, never pure black: outlines and eyes use plum `P.ink`.
 *  - Rounded everything: round joins/caps, puffy silhouettes.
 *  - Light from the upper left: a soft white `shine()` on rounded forms, a soft `shadow()` below.
 *  - Faces come from `face()` so every creature in every world shares one family look.
 */

export const P = {
  ink: '#3D2C52', // plum ink: eyes, outlines, details
  inkSoft: '#6E5B8C',
  white: '#FFFFFF',
  cream: '#FFF8EE',
  blush: '#FF8FB1',
  tongue: '#FF7A9C',

  pink: '#FFB8D6',
  pinkDeep: '#EE7FB0',
  rose: '#FF9DBB',
  peach: '#FFCBA8',
  peachDeep: '#F29A72',
  coral: '#FFA3A3',
  coralDeep: '#E86F7E',
  lemon: '#FFE78F',
  lemonDeep: '#F2C04A',
  gold: '#FFD66B',
  goldDeep: '#E5A83A',
  mint: '#B3EECB',
  mintDeep: '#5FC797',
  grass: '#A3E3A4',
  grassDeep: '#62BE78',
  leaf: '#7FD18D',
  aqua: '#A8EFE8',
  aquaDeep: '#4ECBC1',
  sky: '#C2E7FF',
  skyDeep: '#72B6F2',
  blue: '#9CC9FF',
  blueDeep: '#5B95E6',
  lilac: '#D8C6FF',
  lilacDeep: '#9C7EEB',
  lavender: '#EEE6FF',
  grape: '#B79BFF',
  ice: '#E6F5FF',
  iceDeep: '#9DCBF0',
  snow: '#F8FCFF',
  wood: '#E7B98F',
  woodDeep: '#B9825C',

  /** Pastel rainbow, outermost band first. */
  rainbow: ['#FF9FAE', '#FFC59E', '#FFE89A', '#B8EBA6', '#A3D8F7', '#C6B3FF'] as string[],
} as const;

/* ------------------------------------------------------------------ basics */

/** Round to 2 decimals to keep markup small. */
export const n = (v: number): number => Math.round(v * 100) / 100;

export type Attrs = Record<string, string | number | undefined | null | false>;

export function attrs(a: Attrs = {}): string {
  let out = '';
  for (const k in a) {
    const v = a[k];
    if (v === undefined || v === null || v === false) continue;
    out += ` ${k}="${typeof v === 'number' ? n(v) : v}"`;
  }
  return out;
}

export const g = (content: string, a: Attrs = {}): string => `<g${attrs(a)}>${content}</g>`;
export const circle = (cx: number, cy: number, r: number, fill: string, a: Attrs = {}): string =>
  `<circle${attrs({ cx, cy, r, fill, ...a })}/>`;
export const ellipse = (cx: number, cy: number, rx: number, ry: number, fill: string, a: Attrs = {}): string =>
  `<ellipse${attrs({ cx, cy, rx, ry, fill, ...a })}/>`;
export const rect = (x: number, y: number, w: number, h: number, rx: number, fill: string, a: Attrs = {}): string =>
  `<rect${attrs({ x, y, width: w, height: h, rx, fill, ...a })}/>`;
export const path = (d: string, fill: string, a: Attrs = {}): string => `<path${attrs({ d, fill, ...a })}/>`;
export const line = (x1: number, y1: number, x2: number, y2: number, color: string, width = 4, a: Attrs = {}): string =>
  `<line${attrs({ x1, y1, x2, y2, stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', ...a })}/>`;

/** Rounded outline attributes: `path(d, fill, stroke(P.ink, 4))`. */
export const stroke = (color: string, width = 4): Attrs => ({
  stroke: color,
  'stroke-width': width,
  'stroke-linejoin': 'round',
  'stroke-linecap': 'round',
});

/** Transform helper: `g(art, at(100, 200, 1.5, -10))`. */
export const at = (x: number, y: number, scale = 1, rotate = 0): Attrs => ({
  transform: `translate(${n(x)} ${n(y)})${rotate ? ` rotate(${n(rotate)})` : ''}${scale !== 1 ? ` scale(${n(scale)})` : ''}`,
});

/** Mirror art horizontally around x = cx (e.g. to make a creature face the other way). */
export const flipX = (cx: number): Attrs => ({ transform: `translate(${n(cx * 2)} 0) scale(-1 1)` });

/* ------------------------------------------------------------------ colour */

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const v = parseInt(h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/** Mix two hex colours: t = 0 → a, t = 1 → b. */
export function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
/** Deeper tone of a colour (towards plum ink) — use for outlines and shading of that colour. */
export const darken = (c: string, t = 0.3): string => mix(c, P.ink, t);
/** Lighter tone of a colour (towards white). */
export const lighten = (c: string, t = 0.4): string => mix(c, '#ffffff', t);

/* ------------------------------------------------------------------ gradients */

type Stop = [offset: number, color: string] | [offset: number, color: string, opacity: number];
const stops = (s: Stop[]): string =>
  s.map(([o, c, op]) => `<stop offset="${n(o)}" stop-color="${c}"${op === undefined ? '' : ` stop-opacity="${n(op)}"`}/>`).join('');

/** Linear gradient definition (place inside defs()). Default direction: top → bottom. */
export const linear = (id: string, s: Stop[], x1 = 0, y1 = 0, x2 = 0, y2 = 1): string =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;

/** Radial gradient definition (place inside defs()). */
export const radial = (id: string, s: Stop[], cx = 0.5, cy = 0.5, r = 0.5, fx = cx, fy = cy): string =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" fx="${fx}" fy="${fy}">${stops(s)}</radialGradient>`;

export const defs = (...items: string[]): string => `<defs>${items.join('')}</defs>`;

/** Fill reference for a gradient id: `fill="${url('sky')}"`. */
export const url = (id: string): string => `url(#${id})`;

/**
 * A puffy silhouette made of overlapping circles with ONE clean outer outline (no inner seams):
 * tree canopies, bushes, fluffy bodies, cloud-like hair. Circles are [cx, cy, r].
 */
export function puff(circles: Array<[number, number, number]>, fill: string, outline: string | false = false, width = 4): string {
  const back = outline ? circles.map(([cx, cy, r]) => circle(cx, cy, r + width / 2, outline)).join('') : '';
  const front = circles.map(([cx, cy, r]) => circle(cx, cy, r - (outline ? width / 2 : 0), fill)).join('');
  return g(back + front);
}

/* ------------------------------------------------------------------ light & shadow */

/** Soft ground/contact shadow. */
export const shadow = (cx: number, cy: number, rx: number, ry: number, opacity = 0.12): string =>
  ellipse(cx, cy, rx, ry, P.ink, { opacity });

/** Soft highlight on a rounded form (light comes from the upper left). */
export const shine = (cx: number, cy: number, rx: number, ry: number, rot = -30, opacity = 0.55): string =>
  ellipse(cx, cy, rx, ry, '#fff', { opacity, transform: `rotate(${rot} ${n(cx)} ${n(cy)})` });

/* ------------------------------------------------------------------ magic bits */

/** Four-point twinkle. */
export function sparkle(x: number, y: number, size = 10, color = '#fff', opacity = 1): string {
  const s = size;
  const k = s * 0.2;
  const d = `M${n(x)} ${n(y - s)}Q${n(x + k)} ${n(y - k)} ${n(x + s)} ${n(y)}Q${n(x + k)} ${n(y + k)} ${n(x)} ${n(y + s)}Q${n(x - k)} ${n(y + k)} ${n(x - s)} ${n(y)}Q${n(x - k)} ${n(y - k)} ${n(x)} ${n(y - s)}Z`;
  return path(d, color, { opacity: opacity === 1 ? undefined : opacity });
}

/** Rounded star. `points` tips, `inner` = inner radius ratio. */
export function star(
  x: number,
  y: number,
  r: number,
  fill: string,
  o: { points?: number; inner?: number; rot?: number; outline?: string; width?: number; opacity?: number } = {},
): string {
  const pts = o.points ?? 5;
  const inner = o.inner ?? 0.5;
  const rot = ((o.rot ?? 0) - 90) * (Math.PI / 180);
  let d = '';
  for (let i = 0; i < pts * 2; i++) {
    const rr = i % 2 === 0 ? r : r * inner;
    const a = rot + (i * Math.PI) / pts;
    d += `${i === 0 ? 'M' : 'L'}${n(x + Math.cos(a) * rr)} ${n(y + Math.sin(a) * rr)}`;
  }
  d += 'Z';
  const outline = o.outline ?? fill;
  return path(d, fill, { ...stroke(outline, o.width ?? Math.max(2, r * 0.22)), opacity: o.opacity });
}

/** Heart centred on (x, y); `size` ≈ half-width. */
export function heart(x: number, y: number, size: number, fill: string, a: Attrs = {}): string {
  const s = size;
  const d =
    `M${n(x)} ${n(y + s * 0.85)}` +
    `C${n(x - s * 1.25)} ${n(y + s * 0.05)} ${n(x - s * 0.95)} ${n(y - s * 0.95)} ${n(x)} ${n(y - s * 0.38)}` +
    `C${n(x + s * 0.95)} ${n(y - s * 0.95)} ${n(x + s * 1.25)} ${n(y + s * 0.05)} ${n(x)} ${n(y + s * 0.85)}Z`;
  return path(d, fill, a);
}

/** Puffy cloud centred on (x, y). Base width ≈ 150 * scale. */
export function cloud(x: number, y: number, scale = 1, o: { fill?: string; shade?: string; opacity?: number } = {}): string {
  const fill = o.fill ?? '#FFFFFF';
  const shade = o.shade ?? '#E4ECFF';
  const body = (dy: number, c: string) =>
    `<g fill="${c}">` +
    `<rect x="-70" y="${-6 + dy}" width="140" height="34" rx="17"/>` +
    `<circle cx="-36" cy="${4 + dy}" r="26"/>` +
    `<circle cx="-6" cy="${-12 + dy}" r="34"/>` +
    `<circle cx="30" cy="${-2 + dy}" r="28"/>` +
    `<circle cx="52" cy="${10 + dy}" r="18"/>` +
    `</g>`;
  return g(body(7, shade) + body(0, fill) + ellipse(-14, -24, 14, 7, '#fff', { opacity: 0.9, transform: 'rotate(-20 -14 -24)' }), {
    transform: `translate(${n(x)} ${n(y)}) scale(${n(scale)})`,
    opacity: o.opacity,
  });
}

/**
 * Rainbow arc centred on (cx, cy) (the arc's ground line). `r` = outer radius, `band` = stripe
 * width. Pass fewer/more colours to change the number of stripes.
 */
export function rainbow(cx: number, cy: number, r: number, band: number, colors: string[] = P.rainbow, opacity = 1): string {
  let out = '';
  colors.forEach((c, i) => {
    const rr = r - band / 2 - i * band;
    if (rr <= 0) return;
    out += `<path d="M${n(cx - rr)} ${n(cy)}A${n(rr)} ${n(rr)} 0 0 1 ${n(cx + rr)} ${n(cy)}" fill="none" stroke="${c}" stroke-width="${n(band + 0.6)}"/>`;
  });
  return g(out, { opacity: opacity === 1 ? undefined : opacity });
}

/* ------------------------------------------------------------------ faces */

export type Mood =
  | 'happy' // open eyes, gentle smile (default)
  | 'joy' // ^ ^ eyes, open laughing mouth
  | 'surprised' // big eyes, round "o" mouth, raised brows
  | 'sleepy' // closed eyes, tiny smile
  | 'sad' // worried brows, small frown
  | 'wink' // one eye closed
  | 'silly' // tongue out
  | 'love' // heart eyes
  | 'grumpy' // cute pout, slanted brows
  | 'calm'; // soft closed-smile eyes, small smile

export interface FaceOpts {
  x: number;
  y: number;
  /** Scale: 1 ≈ eyes 12 wide, face ~70 wide. */
  s?: number;
  mood?: Mood;
  /** Pupils/eye-shine shift: -1 looks left, 1 looks right. */
  look?: number;
  /** Cheek blush colour, or false for none. */
  blush?: string | false;
  /** Half-distance between eyes (before scaling). */
  gap?: number;
  ink?: string;
}

/**
 * The shared Little Wonder face. Eyes sit on y; the mouth sits ~12·s below.
 * For "emotions" differences pick moods that change a lot of pixels, e.g. joy↔love, joy↔surprised,
 * happy↔sleepy or happy↔sad. happy↔surprised alone is too subtle unless the face is drawn large.
 */
export function face(o: FaceOpts): string {
  const { x, y } = o;
  const s = o.s ?? 1;
  const mood = o.mood ?? 'happy';
  const ink = o.ink ?? P.ink;
  const gap = (o.gap ?? 15) * s;
  const look = (o.look ?? 0) * 2.2 * s;
  const lx = x - gap;
  const rx = x + gap;
  const sw = n(2.8 * s);
  const strokeA = `fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;

  const openEye = (cx: number, big = 1): string => {
    const w = 6.2 * s * big;
    const h = 8 * s * big;
    return (
      ellipse(cx, y, w, h, ink) +
      circle(cx + look + 2 * s * big, y - 3 * s * big, 2.7 * s * big, '#fff') +
      circle(cx + look - 2.1 * s * big, y + 3.1 * s * big, 1.25 * s * big, '#fff', { opacity: 0.85 })
    );
  };
  const happyEye = (cx: number): string =>
    `<path d="M${n(cx - 6.5 * s)} ${n(y + 2.5 * s)}Q${n(cx)} ${n(y - 6.5 * s)} ${n(cx + 6.5 * s)} ${n(y + 2.5 * s)}" ${strokeA}/>`;
  const closedEye = (cx: number): string =>
    `<path d="M${n(cx - 6.5 * s)} ${n(y - 1 * s)}Q${n(cx)} ${n(y + 5.5 * s)} ${n(cx + 6.5 * s)} ${n(y - 1 * s)}" ${strokeA}/>`;
  const brow = (cx: number, tilt: number, lift = 0): string =>
    `<path d="M${n(cx - 5.5 * s)} ${n(y - 13 * s - lift + tilt * s)}L${n(cx + 5.5 * s)} ${n(y - 13 * s - lift - tilt * s)}" ${strokeA}/>`;

  const my = y + 12 * s; // mouth line
  const smile = (w = 7, depth = 6.5): string =>
    `<path d="M${n(x - w * s)} ${n(my)}Q${n(x)} ${n(my + depth * s)} ${n(x + w * s)} ${n(my)}" ${strokeA}/>`;

  let eyes = '';
  let mouth = '';
  let extra = '';
  switch (mood) {
    case 'happy':
      eyes = openEye(lx) + openEye(rx);
      mouth = smile();
      break;
    case 'joy':
      eyes = happyEye(lx) + happyEye(rx);
      mouth =
        `<path d="M${n(x - 9 * s)} ${n(my - 1 * s)}Q${n(x)} ${n(my + 15 * s)} ${n(x + 9 * s)} ${n(my - 1 * s)}Z" fill="${ink}" stroke="${ink}" stroke-width="${n(1.5 * s)}" stroke-linejoin="round"/>` +
        ellipse(x, my + 6.2 * s, 4.6 * s, 2.6 * s, P.tongue);
      break;
    case 'surprised':
      eyes = openEye(lx, 1.15) + openEye(rx, 1.15);
      extra = brow(lx, 0, 3 * s) + brow(rx, 0, 3 * s);
      mouth = ellipse(x, my + 3 * s, 3.8 * s, 4.8 * s, ink);
      break;
    case 'sleepy':
      eyes = closedEye(lx) + closedEye(rx);
      mouth = smile(4.5, 3.5);
      break;
    case 'sad':
      eyes = openEye(lx) + openEye(rx);
      extra = brow(lx, -2.2) + brow(rx, 2.2);
      mouth = `<path d="M${n(x - 6 * s)} ${n(my + 5 * s)}Q${n(x)} ${n(my - 1.5 * s)} ${n(x + 6 * s)} ${n(my + 5 * s)}" ${strokeA}/>`;
      break;
    case 'wink':
      eyes = openEye(lx) + happyEye(rx);
      mouth = smile(8, 7);
      break;
    case 'silly':
      eyes = openEye(lx) + openEye(rx);
      mouth = smile(8, 6) + `<path d="M${n(x - 1 * s)} ${n(my + 3.5 * s)}q${n(1 * s)} ${n(9 * s)} ${n(7 * s)} ${n(3 * s)}l${n(-1 * s)} ${n(-4.5 * s)}Z" fill="${P.tongue}" stroke="${ink}" stroke-width="${n(1.6 * s)}" stroke-linejoin="round"/>`;
      break;
    case 'love':
      eyes = heart(lx, y, 7.5 * s, '#FF6F9F') + heart(rx, y, 7.5 * s, '#FF6F9F') + circle(lx - 2 * s, y - 2.5 * s, 1.6 * s, '#fff', { opacity: 0.9 }) + circle(rx - 2 * s, y - 2.5 * s, 1.6 * s, '#fff', { opacity: 0.9 });
      mouth = smile(8, 7);
      break;
    case 'grumpy':
      eyes = openEye(lx, 0.92) + openEye(rx, 0.92);
      extra = brow(lx, 2.4, -1 * s) + brow(rx, -2.4, -1 * s);
      mouth = `<path d="M${n(x - 6 * s)} ${n(my + 3.5 * s)}Q${n(x)} ${n(my + 0.5 * s)} ${n(x + 6 * s)} ${n(my + 3.5 * s)}" ${strokeA}/>`;
      break;
    case 'calm':
      eyes = happyEye(lx) + happyEye(rx);
      mouth = smile(5.5, 4.5);
      break;
  }

  const blush = o.blush === false ? '' : ellipse(lx - 9 * s, y + 9.5 * s, 6.8 * s, 4.2 * s, o.blush ?? P.blush, { opacity: 0.55 }) + ellipse(rx + 9 * s, y + 9.5 * s, 6.8 * s, 4.2 * s, o.blush ?? P.blush, { opacity: 0.55 });
  return g(blush + eyes + extra + mouth);
}

/* ------------------------------------------------------------------ determinism helpers */

/** Seeded random generator (mulberry32). Use instead of Math.random so pictures stay identical. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const range = (count: number): number[] => Array.from({ length: count }, (_, i) => i);

/** Point on a circle. `deg` 0 = right, 90 = down. */
export const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => [
  cx + Math.cos((deg * Math.PI) / 180) * r,
  cy + Math.sin((deg * Math.PI) / 180) * r,
];

/** Deterministic scatter of points inside a box, keeping `minDist` apart where possible. */
export function scatter(seed: number, count: number, box: { x: number; y: number; w: number; h: number }, minDist = 0): [number, number][] {
  const r = rng(seed);
  const out: [number, number][] = [];
  let tries = 0;
  while (out.length < count && tries < count * 60) {
    tries++;
    const p: [number, number] = [box.x + r() * box.w, box.y + r() * box.h];
    if (minDist > 0 && out.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < minDist)) continue;
    out.push(p);
  }
  return out;
}
