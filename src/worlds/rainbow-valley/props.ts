/**
 * Rainbow Valley — world props. Every helper returns SVG markup and takes the bits that can vary
 * (colour, count, pattern, direction…) as parameters so levels can turn them into differences.
 * Light comes from the upper left; outlines are a deeper tone of the fill.
 */
import type { Point } from '../../core/types.ts';
import {
  P,
  circle,
  darken,
  ellipse,
  face,
  g,
  lighten,
  line,
  n,
  path,
  puff,
  radial,
  rect,
  rng,
  scatter,
  shadow,
  shine,
  sparkle,
  heart,
  star,
  stroke,
  url,
} from '../../art/kit.ts';
import type { Mood } from '../../art/kit.ts';

export const tf = (x: number, y: number, s = 1, rot = 0, flip = false): string =>
  `translate(${n(x)} ${n(y)})${rot ? ` rotate(${n(rot)})` : ''}${s !== 1 || flip ? ` scale(${n(flip ? -s : s)} ${n(s)})` : ''}`;

/* ------------------------------------------------------------------ sky & light */

/** Radial glow definition: colour fading to transparent. Use with glow(). */
export const glowDef = (id: string, color: string, strength = 0.8): string =>
  radial(id, [
    [0, color, strength],
    [0.45, color, strength * 0.45],
    [1, color, 0],
  ]);
export const glow = (x: number, y: number, r: number, id: string, a: Record<string, string | number> = {}): string => circle(x, y, r, url(id), a);

/** Friendly sun with soft rays and a face. */
export function sun(x: number, y: number, r: number, mood: Mood = 'calm', rayColor: string = P.gold): string {
  let rays = '';
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const r1 = r + 9;
    const r2 = r + (i % 2 ? 20 : 28);
    rays += line(x + Math.cos(a) * r1, y + Math.sin(a) * r1, x + Math.cos(a) * r2, y + Math.sin(a) * r2, rayColor, 7, { opacity: 0.85 });
  }
  return rays + circle(x, y, r, P.lemon, stroke(P.lemonDeep, 4)) + shine(x - r * 0.38, y - r * 0.4, r * 0.3, r * 0.18) + face({ x, y: y - r * 0.05, s: r / 44, mood, blush: '#FFA88F' });
}

/** Small round soft cloud (for distant skies). */
export function puffCloud(x: number, y: number, s: number, fill = '#FFFFFF', opacity = 1): string {
  return g(
    puff(
      [
        [-24, 4, 16],
        [0, -6, 22],
        [24, 2, 17],
        [40, 9, 11],
        [-40, 10, 10],
      ],
      fill,
    ) + rect(-48, 6, 96, 16, 8, fill),
    { transform: tf(x, y, s), opacity: opacity === 1 ? undefined : opacity },
  );
}

/** Scattered sparkles in a box. */
export function sparkles(seed: number, box: { x: number; y: number; w: number; h: number }, count: number, color = '#fff', size = 8, minDist = 40): string {
  const r = rng(seed + 99);
  return scatter(seed, count, box, minDist)
    .map(([x, y]) => sparkle(x, y, size * (0.6 + r() * 0.6), color, 0.65 + r() * 0.35))
    .join('');
}

/* ------------------------------------------------------------------ ground texture */

/** Little grass tufts. */
export function tufts(seed: number, box: { x: number; y: number; w: number; h: number }, count: number, color: string, size = 1, minDist = 26): string {
  return scatter(seed, count, box, minDist)
    .map(([x, y]) => path(`M${n(x - 7 * size)} ${n(y)}q${n(3 * size)} ${n(-4 * size)} ${n(4 * size)} ${n(-11 * size)}M${n(x)} ${n(y)}q0 ${n(-7 * size)} ${n(2 * size)} ${n(-14 * size)}M${n(x + 7 * size)} ${n(y)}q${n(-3 * size)} ${n(-4 * size)} ${n(-3 * size)} ${n(-10 * size)}`, 'none', stroke(color, 2.6 * Math.min(1.2, size))))
    .join('');
}

/** Tiny dot flowers for meadows (background texture). */
export function meadowDots(seed: number, box: { x: number; y: number; w: number; h: number }, count: number, colors: string[], r = 3.2, minDist = 18): string {
  const rr = rng(seed + 7);
  return scatter(seed, count, box, minDist)
    .map(([x, y]) => {
      const c = colors[Math.floor(rr() * colors.length)];
      return circle(x, y, r, c) + circle(x, y, r * 0.38, '#FFF6C9');
    })
    .join('');
}

/* ------------------------------------------------------------------ plants */

/** A tulip on a stem. (x, y) = base on the ground. */
export function tulip(x: number, y: number, s: number, color: string, lean = 0): string {
  const l = darken(color, 0.3);
  const head =
    path('M-15 -6C-17 -22 -12 -32 -8 -34L-2 -24L4 -36L9 -24L15 -34C19 -28 18 -14 14 -6C9 2 -10 2 -15 -6Z', color, stroke(l, 3.2)) +
    path('M-8 -26Q-9 -12 -5 -4', 'none', { ...stroke('#fff', 2.4), opacity: 0.6 });
  return g(
    path(`M0 0Q${-2 + lean * 0.3} -30 ${lean} -60`, 'none', stroke(P.grassDeep, 4.2)) +
      path('M0 -4C-22 -14 -26 -36 -20 -48C-10 -36 -4 -22 0 -4Z', P.leaf, stroke(P.grassDeep, 3)) +
      path('M1 -8C18 -18 24 -34 20 -44C8 -34 4 -22 1 -8Z', P.leaf, stroke(P.grassDeep, 3)) +
      g(head, { transform: `translate(${lean} -58)` }),
    { transform: tf(x, y, s) },
  );
}

/** A daisy-type flower on a stem. */
export function daisy(x: number, y: number, s: number, petal: string, center: string = P.lemon, stemH = 46, petals = 8): string {
  const l = darken(petal, 0.25);
  let pet = '';
  for (let i = 0; i < petals; i++) {
    const a = (i * 360) / petals;
    pet += ellipse(0, -11, 6.2, 11, petal, { ...stroke(l, 2.4), transform: `rotate(${n(a)})` });
  }
  return g(
    path(`M0 0Q-3 ${-stemH / 2} 0 ${-stemH}`, 'none', stroke(P.grassDeep, 3.6)) +
      ellipse(-9, -stemH * 0.4, 9, 4.5, P.leaf, { ...stroke(P.grassDeep, 2.4), transform: `rotate(-30 -9 ${-stemH * 0.4})` }) +
      g(pet + circle(0, 0, 7.5, center, stroke(darken(center, 0.25), 2.4)) + circle(-2, -2, 2.4, '#fff', { opacity: 0.7 }), { transform: `translate(0 ${-stemH})` }),
    { transform: tf(x, y, s) },
  );
}

/** Rounded bush with optional little blossoms. */
export function bush(x: number, y: number, s: number, fill: string = P.grass, blossoms: string | false = false, seed = 1): string {
  const l = darken(fill, 0.3);
  const circles: Array<[number, number, number]> = [
    [-46, -20, 26],
    [-16, -38, 32],
    [20, -34, 30],
    [48, -16, 24],
    [0, -14, 34],
  ];
  let fl = '';
  if (blossoms) {
    const pts = scatter(seed, 6, { x: -56, y: -60, w: 108, h: 44 }, 20);
    fl = pts.map(([bx, by]) => circle(bx, by, 4.6, blossoms, stroke(darken(blossoms, 0.25), 1.6)) + circle(bx, by, 1.8, '#FFF6C9')).join('');
  }
  return g(
    shadow(0, 2, 70, 9, 0.1) +
      puff(circles, fill, l, 4) +
      puff(
        [
          [-20, -44, 18],
          [16, -42, 16],
          [-44, -26, 12],
        ],
        lighten(fill, 0.25),
      ) +
      rect(-70, -2, 140, 6, 3, fill) +
      path('M-30 -22q4 -6 9 -3M10 -18q4 -6 9 -3M34 -30q4 -6 9 -3', 'none', stroke(l, 2.6)) +
      fl,
    { transform: tf(x, y, s) },
  );
}

/** Apple tree. (x, y) = trunk base. `apples` in absolute scene coordinates. */
export function appleTree(x: number, y: number, s: number, apples: Point[], appleR = 18, leafFill: string = P.grass): string {
  const l = darken(leafFill, 0.34);
  const trunk = g(
    path('M-26 0C-16 -30 -16 -70 -22 -110L22 -110C16 -70 16 -30 26 0Z', P.wood, stroke(P.woodDeep, 4.5)) +
      path('M-14 -100C-30 -120 -46 -128 -60 -130M14 -96C30 -116 44 -122 56 -124', 'none', stroke(P.woodDeep, 13)) +
      path('M-14 -100C-30 -120 -46 -128 -60 -130M14 -96C30 -116 44 -122 56 -124', 'none', stroke(P.wood, 6)) +
      path('M-6 -20q-4 -20 2 -40M7 -50q3 -14 -1 -26', 'none', stroke(P.woodDeep, 2.6)) +
      ellipse(-8, -70, 4, 7, P.woodDeep, { opacity: 0.55 }),
    {},
  );
  const canopy =
    puff(
      [
        [-92, -170, 54],
        [-40, -224, 66],
        [36, -228, 64],
        [92, -172, 56],
        [52, -134, 52],
        [-48, -132, 52],
        [0, -166, 70],
      ],
      leafFill,
      l,
      5,
    ) +
    puff(
      [
        [-50, -238, 40],
        [10, -250, 36],
        [-90, -192, 28],
      ],
      lighten(leafFill, 0.22),
    ) +
    shine(-56, -256, 26, 12, -18, 0.5) +
    path('M-96 -150q8 -10 18 -4M-24 -186q8 -10 18 -4M56 -200q8 -10 18 -4M70 -146q8 -10 18 -4M-50 -128q8 -10 18 -4M18 -142q8 -10 18 -4', 'none', stroke(l, 3));
  const fruit = apples.map(([ax, ay]) => apple(ax, ay, appleR)).join('');
  return g(shadow(0, 2, 110, 14, 0.13) + trunk + canopy, { transform: tf(x, y, s) }) + fruit;
}

/** A shiny apple (absolute coordinates). */
export function apple(x: number, y: number, r = 18, fill = '#FF7F95'): string {
  const l = darken(fill, 0.3);
  return (
    path(`M${n(x)} ${n(y - r * 0.72)}C${n(x - r * 0.4)} ${n(y - r * 1.05)} ${n(x - r * 1.08)} ${n(y - r * 0.8)} ${n(x - r)} ${n(y)}C${n(x - r * 0.95)} ${n(y + r * 0.8)} ${n(x - r * 0.35)} ${n(y + r * 1.02)} ${n(x)} ${n(y + r * 0.86)}C${n(x + r * 0.35)} ${n(y + r * 1.02)} ${n(x + r * 0.95)} ${n(y + r * 0.8)} ${n(x + r)} ${n(y)}C${n(x + r * 1.08)} ${n(y - r * 0.8)} ${n(x + r * 0.4)} ${n(y - r * 1.05)} ${n(x)} ${n(y - r * 0.72)}Z`, fill, stroke(l, 3.2)) +
    shine(x - r * 0.42, y - r * 0.3, r * 0.26, r * 0.17, -40, 0.8) +
    path(`M${n(x)} ${n(y - r * 0.66)}q${n(r * 0.06)} ${n(-r * 0.4)} ${n(r * 0.3)} ${n(-r * 0.52)}`, 'none', stroke(P.woodDeep, 3)) +
    ellipse(x + r * 0.5, y - r * 1.02, r * 0.36, r * 0.18, P.leaf, { ...stroke(P.grassDeep, 2), transform: `rotate(-25 ${n(x + r * 0.5)} ${n(y - r * 1.02)})` })
  );
}

/** A distant round "lollipop" tree for far hills. */
export function farTree(x: number, y: number, s: number, fill: string, trunk = '#D9B8A0'): string {
  return g(rect(-3, -22, 6, 22, 3, trunk) + circle(0, -34, 18, fill) + circle(-6, -40, 7, '#fff', { opacity: 0.35 }), { transform: tf(x, y, s) });
}

/** Magical candy tree: swirly round canopy with blossoms. */
export function candyTree(x: number, y: number, s: number, fill: string, accent: string): string {
  const l = darken(fill, 0.28);
  return g(
    shadow(0, 2, 46, 8, 0.12) +
      path('M-10 0Q-6 -40 -12 -70L12 -70Q6 -40 10 0Z', P.wood, stroke(P.woodDeep, 3.6)) +
      puff(
        [
          [-34, -88, 30],
          [0, -112, 40],
          [34, -90, 30],
          [0, -76, 32],
        ],
        fill,
        l,
        4,
      ) +
      path('M-18 -104q18 -16 34 0q-14 14 -28 4', 'none', stroke(lighten(fill, 0.5), 4)) +
      circle(-26, -84, 5, accent, stroke(darken(accent, 0.25), 1.8)) +
      circle(24, -100, 5, accent, stroke(darken(accent, 0.25), 1.8)) +
      circle(8, -78, 4.5, accent, stroke(darken(accent, 0.25), 1.8)) +
      circle(-6, -128, 4.5, accent, stroke(darken(accent, 0.25), 1.8)) +
      shine(-18, -124, 12, 6),
    { transform: tf(x, y, s) },
  );
}

/** Mushroom with spotty cap. */
export function mushroom(x: number, y: number, s: number, cap: string, spots = '#FFFFFF', face_: Mood | false = false): string {
  const l = darken(cap, 0.3);
  return g(
    shadow(0, 2, 30, 6, 0.12) +
      path('M-12 0Q-14 -20 -10 -34L10 -34Q14 -20 12 0Q0 4 -12 0Z', P.cream, stroke(darken(P.cream, 0.28), 3.2)) +
      path('M-36 -30C-36 -62 -14 -74 0 -74C14 -74 36 -62 36 -30Q0 -22 -36 -30Z', cap, stroke(l, 3.6)) +
      ellipse(-18, -50, 6.5, 5, spots) +
      ellipse(4, -62, 7, 5, spots) +
      ellipse(20, -44, 6, 4.5, spots) +
      ellipse(-2, -40, 4, 3, spots) +
      shine(-20, -62, 8, 4) +
      (face_ ? face({ x: 0, y: -18, s: 0.42, mood: face_ }) : ''),
    { transform: tf(x, y, s) },
  );
}

/* ------------------------------------------------------------------ critters */

/** Butterfly. pattern: dots | stripes | hearts | plain. (x, y) = body centre. */
export function butterfly(x: number, y: number, s: number, wing: string, pattern: 'dots' | 'stripes' | 'hearts' | 'plain' = 'dots', rot = 0, mark: string = '#FFFFFF'): string {
  const l = darken(wing, 0.32);
  const upper = (d: 1 | -1) => path(`M0 -4C${d * 10} -34 ${d * 46} -40 ${d * 44} -14C${d * 42} 4 ${d * 18} 6 0 0Z`, wing, stroke(l, 3));
  const lower = (d: 1 | -1) => path(`M0 2C${d * 22} 4 ${d * 36} 16 ${d * 28} 30C${d * 20} 40 ${d * 6} 28 0 6Z`, lighten(wing, 0.18), stroke(l, 3));
  let marks = '';
  for (const d of [-1, 1] as const) {
    if (pattern === 'dots') marks += circle(d * 26, -20, 6.5, mark, stroke(l, 1.6)) + circle(d * 14, -10, 4, mark, stroke(l, 1.4)) + circle(d * 18, 18, 4.5, mark, stroke(l, 1.4));
    else if (pattern === 'stripes')
      marks += path(`M${d * 14} -30Q${d * 22} -18 ${d * 18} -2M${d * 28} -30Q${d * 36} -20 ${d * 32} -8M${d * 12} 12Q${d * 20} 18 ${d * 18} 28`, 'none', stroke(mark, 4.4)) ;
    else if (pattern === 'hearts') marks += heart(d * 24, -18, 8, mark, stroke(l, 1.4)) + heart(d * 17, 17, 5.5, mark, stroke(l, 1.2));
  }
  const body =
    ellipse(0, 4, 5, 18, '#8C6FA8', stroke(P.ink, 2.2)) +
    circle(0, -16, 6.5, '#8C6FA8', stroke(P.ink, 2.2)) +
    path('M-2 -21q-5 -10 -10 -12M2 -21q5 -10 10 -12', 'none', stroke(P.ink, 2)) +
    circle(-12, -33, 2.2, P.ink) +
    circle(12, -33, 2.2, P.ink);
  return g(lower(-1) + lower(1) + upper(-1) + upper(1) + marks + body, { transform: tf(x, y, s, rot) });
}

/** Round little bird. (x, y) = body centre; faces right. */
export function bird(x: number, y: number, s: number, color: string, o: { flip?: boolean; mood?: Mood; wingUp?: boolean; belly?: string } = {}): string {
  const l = darken(color, 0.3);
  const wing = o.wingUp
    ? path('M-4 -6C-14 -30 -30 -32 -30 -20C-28 -10 -16 -4 -4 -2Z', lighten(color, 0.2), stroke(l, 3))
    : path('M-14 -2C-24 4 -24 16 -12 16C-4 14 0 6 -2 0Z', lighten(color, 0.2), stroke(l, 3));
  return g(
    path('M-18 2L-32 -6L-30 8Z', color, stroke(l, 3)) +
      circle(0, 0, 18, color, stroke(l, 3.4)) +
      ellipse(4, 7, 11, 9, o.belly ?? lighten(color, 0.6)) +
      path('M16 -2L26 2L16 6Z', P.gold, stroke(P.goldDeep, 2.4)) +
      wing +
      path('M-2 -17q4 -9 10 -6', 'none', stroke(l, 3)) +
      face({ x: 6, y: -4, s: 0.38, mood: o.mood ?? 'happy', gap: 16, blush: P.blush }) +
      shine(-6, -9, 5, 3),
    { transform: tf(x, y, s, 0, o.flip) },
  );
}

/* ------------------------------------------------------------------ picnic */

/** Bilinear point inside quad (bl, br, fr, fl) — u across, v front-to-back→front. */
function quadPt(q: [Point, Point, Point, Point], u: number, v: number): Point {
  const [bl, br, fr, fl] = q;
  const tx = bl[0] + (br[0] - bl[0]) * u;
  const ty = bl[1] + (br[1] - bl[1]) * u;
  const bx = fl[0] + (fr[0] - fl[0]) * u;
  const by = fl[1] + (fr[1] - fl[1]) * u;
  return [tx + (bx - tx) * v, ty + (by - ty) * v];
}

/** Checked picnic blanket on the ground in perspective. q = [backLeft, backRight, frontRight, frontLeft]. */
export function blanket(q: [Point, Point, Point, Point], check: string, base = '#FFFDF7', cols = 7, rows = 4): string {
  const pts = (arr: Point[]) => arr.map(([px, py]) => `${n(px)} ${n(py)}`).join('L');
  const l = darken(check, 0.25);
  let cells = '';
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      if ((i + j) % 2) continue;
      const a = quadPt(q, i / cols, j / rows);
      const b = quadPt(q, (i + 1) / cols, j / rows);
      const c = quadPt(q, (i + 1) / cols, (j + 1) / rows);
      const d = quadPt(q, i / cols, (j + 1) / rows);
      cells += `M${pts([a, b, c, d])}Z`;
    }
  // lighter half-tone stripes between cells (gingham feel)
  let soft = '';
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      if ((i + j) % 2 === 0) continue;
      if (j % 2 === 0) continue;
      const a = quadPt(q, i / cols, j / rows);
      const b = quadPt(q, (i + 1) / cols, j / rows);
      const c = quadPt(q, (i + 1) / cols, (j + 1) / rows);
      const d = quadPt(q, i / cols, (j + 1) / rows);
      soft += `M${pts([a, b, c, d])}Z`;
    }
  const outline = `M${pts(q as unknown as Point[])}Z`;
  const [, , fr, fl] = q;
  const hem = path(`M${n(fl[0])} ${n(fl[1])}L${n(fr[0])} ${n(fr[1])}L${n(fr[0] - 4)} ${n(fr[1] + 10)}L${n(fl[0] + 4)} ${n(fl[1] + 10)}Z`, darken(check, 0.12), stroke(l, 3));
  return (
    path(`M${n(fl[0] + 10)} ${n(fl[1] + 16)}L${n(fr[0] - 10)} ${n(fr[1] + 16)}L${n(fr[0] + 6)} ${n(fr[1] - 10)}L${n(fl[0] - 6)} ${n(fl[1] - 10)}Z`, P.ink, { opacity: 0.1 }) +
    hem +
    path(outline, base) +
    path(soft, lighten(check, 0.62)) +
    path(cells, check) +
    path(outline, 'none', stroke(l, 3.6))
  );
}

/** Wicker picnic basket. (x, y) = bottom centre. */
export function basket(x: number, y: number, s: number, cloth: string = P.lemon): string {
  const w = P.wood;
  const wl = P.woodDeep;
  let weave = '';
  for (let i = -3; i <= 3; i++) weave += `M${i * 11} -6V-40`;
  return g(
    shadow(0, 2, 52, 8, 0.14) +
      path('M-34 -48Q-30 -96 0 -96Q30 -96 34 -48', 'none', stroke(wl, 10)) +
      path('M-34 -48Q-30 -96 0 -96Q30 -96 34 -48', 'none', stroke(w, 5)) +
      path('M-40 -46L40 -46L34 -4Q0 6 -34 -4Z', w, stroke(wl, 4)) +
      path(weave, 'none', stroke(wl, 2.2)) +
      path('M-38 -32Q0 -26 38 -32M-36 -18Q0 -12 36 -18', 'none', stroke(wl, 2.4)) +
      path('M-30 -46C-28 -60 -10 -62 -2 -52C6 -62 26 -60 30 -46Z', cloth, stroke(darken(cloth, 0.28), 3)) +
      path('M-14 -52l4 4M4 -54l4 4M18 -52l4 4', 'none', stroke(darken(cloth, 0.2), 2)) +
      rect(-44, -52, 88, 10, 5, w, stroke(wl, 4)) +
      shine(-24, -24, 8, 4),
    { transform: tf(x, y, s) },
  );
}

/** Round teapot. (x, y) = bottom centre. */
export function teapot(x: number, y: number, s: number, fill: string, dots = '#FFFFFF'): string {
  const l = darken(fill, 0.3);
  return g(
    shadow(0, 2, 34, 6, 0.14) +
      path('M24 -24C38 -26 42 -40 52 -44', 'none', stroke(l, 10)) +
      path('M24 -24C38 -26 42 -40 52 -44', 'none', stroke(fill, 4.5)) +
      path('M-26 -36C-46 -36 -46 -12 -24 -14', 'none', stroke(l, 9)) +
      path('M-26 -36C-46 -36 -46 -12 -24 -14', 'none', stroke(fill, 4)) +
      ellipse(0, -24, 30, 24, fill, stroke(l, 3.6)) +
      ellipse(0, -46, 16, 5, fill, stroke(l, 3)) +
      circle(0, -54, 5, P.gold, stroke(P.goldDeep, 2.4)) +
      circle(-12, -28, 4, dots) +
      circle(8, -18, 4, dots) +
      circle(14, -34, 3.4, dots) +
      circle(-4, -10, 3, dots) +
      shine(-12, -36, 8, 5),
    { transform: tf(x, y, s) },
  );
}

/** Cupcake. (x, y) = bottom centre. */
export function cupcake(x: number, y: number, s: number, frosting: string, cup: string = P.sky): string {
  const fl = darken(frosting, 0.25);
  const cl = darken(cup, 0.3);
  return g(
    path('M-16 -20L16 -20L12 0L-12 0Z', cup, stroke(cl, 3)) +
      path('M-8 -18L-6 -2M0 -18V-2M8 -18L6 -2', 'none', stroke(cl, 2)) +
      puff(
        [
          [-10, -24, 9],
          [10, -24, 9],
          [0, -32, 11],
          [0, -22, 10],
        ],
        frosting,
        fl,
        3,
      ) +
      circle(0, -44, 5.5, '#FF6F8E', stroke('#C94C6B', 2)) +
      path('M0 -49q3 -6 7 -7', 'none', stroke(P.woodDeep, 2)) +
      circle(-6, -30, 1.6, P.lemon) +
      circle(6, -27, 1.6, P.aqua) +
      circle(3, -36, 1.6, P.lilac) +
      shine(-6, -34, 4, 2.4),
    { transform: tf(x, y, s) },
  );
}

/** Plate seen in perspective. */
export function plate(x: number, y: number, rx: number, fill = '#FFFFFF', rim: string = P.lilac): string {
  return ellipse(x, y + 3, rx, rx * 0.34, P.ink, { opacity: 0.1 }) + ellipse(x, y, rx, rx * 0.32, fill, stroke(darken(rim, 0.2), 3)) + ellipse(x, y, rx * 0.66, rx * 0.2, 'none', stroke(rim, 2.4));
}

/* ------------------------------------------------------------------ sky things */

/** Striped hot-air balloon. (x, y) = envelope centre. colors = [outer, middle, centre]. */
export function hotAirBalloon(x: number, y: number, s: number, colors: [string, string, string], passenger = ''): string {
  const [a, b, c] = colors;
  const env = 'M-14 44C-46 24 -50 -42 0 -46C50 -42 46 24 14 44Z';
  return g(
    path('M-12 46L-11 64M12 46L11 64', 'none', stroke(P.woodDeep, 2.4)) +
      passenger +
      path('M-14 60L14 60L12 80Q0 84 -12 80Z', P.wood, stroke(P.woodDeep, 3)) +
      path('M-12 68H12', 'none', stroke(P.woodDeep, 2)) +
      path(env, a) +
      path('M0 -46C-30 -42 -30 22 -8 44L8 44C30 22 30 -42 0 -46Z', b) +
      path('M0 -46C-12 -40 -12 24 -3 44L3 44C12 24 12 -40 0 -46Z', c) +
      path(env, 'none', stroke(darken(a, 0.3), 3.6)) +
      path('M-44 -6Q0 8 44 -6', 'none', stroke(darken(a, 0.18), 2.4)) +
      rect(-15, 41, 30, 7, 3.5, darken(a, 0.1), stroke(darken(a, 0.3), 2.6)) +
      shine(-24, -24, 9, 15, 20, 0.55),
    { transform: tf(x, y, s) },
  );
}

/** Diamond kite. (x, y) = kite centre. pattern: stripes | dots | plain | zigzag. Tail = bow colours. */
export function kite(x: number, y: number, s: number, fill: string, pattern: 'stripes' | 'dots' | 'plain' | 'zigzag' | 'hearts', tail: string[], rot = 0, mark = '#FFFFFF', tailWave = 1): string {
  const l = darken(fill, 0.3);
  const d = 'M0 -46L32 -4L0 50L-32 -4Z';
  let marks = '';
  if (pattern === 'stripes') marks = path('M-24 -16L24 -16M-30 4L30 4M-22 24L22 24', 'none', stroke(mark, 8));
  else if (pattern === 'dots') marks = circle(0, -24, 6.5, mark) + circle(-15, -2, 6.5, mark) + circle(15, -2, 6.5, mark) + circle(0, 22, 6.5, mark);
  else if (pattern === 'zigzag') marks = path('M-26 -4L-13 -14L0 -4L13 -14L26 -4M-20 14L-10 6L0 14L10 6L20 14', 'none', stroke(mark, 4.4));
  else if (pattern === 'hearts') marks = heart(0, -16, 7, mark) + heart(-13, 6, 6, mark) + heart(13, 6, 6, mark) + heart(0, 26, 6, mark);
  let tailArt = path(`M0 50C${-14 * tailWave} 70 ${16 * tailWave} 90 ${2 * tailWave} 112C${-10 * tailWave} 130 ${10 * tailWave} 150 ${-2 * tailWave} 170`, 'none', stroke(P.inkSoft, 2.4));
  const pts: Point[] = [
    [-3 * tailWave, 74],
    [5 * tailWave, 104],
    [-2 * tailWave, 136],
    [2 * tailWave, 164],
  ];
  tail.slice(0, 4).forEach((c, i) => {
    const [bx, by] = pts[i];
    tailArt += path(`M${bx} ${by}l-11 -7v14zM${bx} ${by}l11 -7v14z`, c, stroke(darken(c, 0.3), 2.4)) + circle(bx, by, 3.4, c, stroke(darken(c, 0.3), 2));
  });
  return g(
    tailArt +
      path(d, fill, stroke(l, 4)) +
      `<clipPath id="kc${Math.round(x)}x${Math.round(y)}"><path d="${d}"/></clipPath>` +
      g(marks, { 'clip-path': `url(#kc${Math.round(x)}x${Math.round(y)})` }) +
      path('M0 -46V50M-32 -4H32', 'none', stroke(l, 2.4)) +
      path(d, 'none', stroke(l, 4)) +
      shine(-12, -22, 6, 10, 30, 0.5),
    { transform: tf(x, y, s, rot) },
  );
}

/** A party balloon on a string. (x, y) = balloon centre; string goes to (x + sx, y + sy). */
export function partyBalloon(x: number, y: number, r: number, fill: string, sx = 0, sy = 90): string {
  const l = darken(fill, 0.3);
  return (
    path(`M${n(x)} ${n(y + r * 1.15)}q${n(sx * 0.5 - 8)} ${n(sy * 0.4)} ${n(sx * 0.5)} ${n(sy * 0.5)}t${n(sx * 0.5)} ${n(sy * 0.5)}`, 'none', stroke(P.inkSoft, 2.2)) +
    ellipse(x, y, r, r * 1.15, fill, stroke(l, 3.4)) +
    path(`M${n(x - 5)} ${n(y + r * 1.15 + 6)}L${n(x)} ${n(y + r * 1.12)}L${n(x + 5)} ${n(y + r * 1.15 + 6)}Z`, fill, stroke(l, 2.6)) +
    shine(x - r * 0.38, y - r * 0.42, r * 0.22, r * 0.36, 20, 0.7)
  );
}

/* ------------------------------------------------------------------ misc */

export { star, heart, sparkle };

/** Wooden signpost with one arrow board pointing left (-1) or right (1). (x, y) = post base. */
export function signpost(x: number, y: number, s: number, dir: 1 | -1, board: string = P.wood, symbol = ''): string {
  const l = darken(board, 0.3);
  const arrow = dir === 1 ? 'M-44 -14H24L42 0L24 14H-44Z' : 'M44 -14H-24L-42 0L-24 14H44Z';
  return g(
    shadow(0, 2, 22, 5, 0.14) +
      rect(-6, -100, 12, 100, 4, P.wood, stroke(P.woodDeep, 3.4)) +
      g(path(arrow, board, stroke(l, 3.6)) + path(dir === 1 ? 'M-34 -4H14' : 'M34 -4H-14', 'none', { ...stroke(lighten(board, 0.5), 3), opacity: 0.8 }) + symbol, { transform: 'translate(0 -80)' }),
    { transform: tf(x, y, s) },
  );
}

/** Rainbow bunting between two points. colors cycle. */
export function bunting(x1: number, y1: number, x2: number, y2: number, sag: number, colors: string[], count: number, flagH = 26): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + sag;
  const bez = (t: number): Point => [(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2];
  let flags = '';
  for (let i = 0; i < count; i++) {
    const t0 = (i + 0.15) / count;
    const t1 = (i + 0.85) / count;
    const a = bez(t0);
    const b = bez(t1);
    const c = colors[i % colors.length];
    const cx = (a[0] + b[0]) / 2;
    const cy = (a[1] + b[1]) / 2;
    flags += path(`M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}L${n(cx)} ${n(cy + flagH)}Z`, c, stroke(darken(c, 0.28), 2.6));
  }
  return path(`M${x1} ${y1}Q${n(mx)} ${n(my)} ${x2} ${y2}`, 'none', stroke(P.inkSoft, 2.4)) + flags;
}

/** Simple wooden fence segment from x1 to x2 at ground y. */
export function fence(x1: number, x2: number, y: number, h = 50, fill = '#FFF3E4'): string {
  const l = darken(fill, 0.3);
  let posts = '';
  for (let x = x1; x <= x2; x += 34) posts += path(`M${x - 8} ${y}V${y - h + 8}L${x} ${y - h}L${x + 8} ${y - h + 8}V${y}Z`, fill, stroke(l, 3));
  return rect(x1 - 6, y - h * 0.72, x2 - x1 + 12, 9, 4, fill, stroke(l, 3)) + rect(x1 - 6, y - h * 0.34, x2 - x1 + 12, 9, 4, fill, stroke(l, 3)) + posts;
}

/** Soft ripples on water. */
export function ripple(x: number, y: number, w: number, color = '#FFFFFF', opacity = 0.7): string {
  return path(`M${n(x - w / 2)} ${n(y)}q${n(w / 4)} ${n(-w * 0.12)} ${n(w / 2)} 0t${n(w / 2)} 0`, 'none', { ...stroke(color, 3), opacity });
}

/* ------------------------------------------------------------------ water friends */

/** Mama duck swimming (faces left). (x, y) = water line under her. */
export function duck(x: number, y: number, s: number, o: { body?: string; mood?: Mood; hat?: string | false } = {}): string {
  const body = o.body ?? '#FFFDF6';
  const l = '#B7A9CC';
  return g(
    ellipse(0, 2, 40, 7, '#FFFFFF', { opacity: 0.5 }) +
      path('M30 -14L44 -30L40 -8Z', body, stroke(l, 3.2)) +
      path('M-30 -4C-32 -26 -6 -34 22 -28C40 -24 44 -6 34 2Q0 8 -30 -4Z', body, stroke(l, 3.4)) +
      path('M0 -18C10 -26 26 -24 30 -14C22 -8 10 -8 0 -18Z', '#F1ECFA', stroke(l, 2.6)) +
      circle(-20, -40, 17, body, stroke(l, 3.4)) +
      path('M-36 -38C-50 -40 -54 -32 -48 -28C-44 -26 -38 -30 -35 -31Z', '#FFB36B', stroke('#E08B45', 2.6)) +
      face({ x: -22, y: -42, s: 0.4, mood: o.mood ?? 'happy', gap: 15, blush: P.blush }) +
      (o.hat ? path('M-34 -54C-34 -66 -6 -66 -6 -54Z', o.hat, stroke(darken(o.hat, 0.3), 2.6)) + ellipse(-20, -54, 20, 4.5, o.hat, stroke(darken(o.hat, 0.3), 2.6)) + circle(-12, -60, 3.4, P.pink) : '') +
      shine(-26, -48, 5, 3) +
      path('M-28 6q10 -5 20 0t20 0t20 0', 'none', { ...stroke('#FFFFFF', 3), opacity: 0.85 }),
    { transform: tf(x, y, s) },
  );
}

/** Duckling swimming (faces left). (x, y) = water line under it. */
export function duckling(x: number, y: number, s: number, fill: string = P.lemon): string {
  const l = darken(fill, 0.34);
  return g(
    ellipse(0, 2, 26, 5, '#FFFFFF', { opacity: 0.5 }) +
      path('M14 -10L24 -20L22 -4Z', fill, stroke(l, 2.8)) +
      path('M-20 -2C-22 -18 -2 -24 14 -18C26 -14 26 -2 20 2Q0 6 -20 -2Z', fill, stroke(l, 3)) +
      path('M0 -12C6 -18 14 -16 16 -10C12 -6 6 -6 0 -12Z', lighten(fill, 0.4), stroke(l, 2.2)) +
      circle(-12, -28, 12.5, fill, stroke(l, 3)) +
      path('M-13 -40q-2 -7 3 -9q-1 5 2 7', fill, stroke(l, 2.4)) +
      path('M-24 -27C-33 -28 -35 -22 -31 -19C-28 -18 -25 -21 -23 -22Z', '#FFB36B', stroke('#E08B45', 2.2)) +
      face({ x: -13, y: -30, s: 0.3, mood: 'happy', gap: 15, blush: P.blush }) +
      shine(-17, -34, 3.6, 2.4) +
      path('M-18 5q8 -4 16 0t16 0', 'none', { ...stroke('#FFFFFF', 2.6), opacity: 0.85 }),
    { transform: tf(x, y, s) },
  );
}

/** A happy fish leaping out of the water. (x, y) = fish centre. */
export function leapingFish(x: number, y: number, s: number, fill: string, fin: string, rot = -24): string {
  const l = darken(fill, 0.3);
  return g(
    path('M30 0L56 -18Q50 0 56 18Z', fin, stroke(darken(fin, 0.3), 3)) +
      path('M-38 0C-30 -26 20 -30 34 0C20 30 -30 26 -38 0Z', fill, stroke(l, 3.6)) +
      path('M0 -24Q10 -36 20 -24', fin, stroke(darken(fin, 0.3), 3)) +
      path('M6 -4Q14 6 6 14', 'none', stroke(l, 2.4)) +
      path('M14 -12q6 -4 10 2M14 4q6 -4 10 2M20 -4q6 -4 10 2', 'none', { ...stroke(lighten(fill, 0.5), 2.4) }) +
      path('M-6 6Q4 16 -2 22L-10 12Z', fin, stroke(darken(fin, 0.3), 2.4)) +
      face({ x: -18, y: -4, s: 0.42, mood: 'joy', gap: 14, blush: P.blush }) +
      shine(-18, -16, 8, 4, -20),
    { transform: tf(x, y, s, rot) },
  );
}

/** Splash of water with droplets. (x, y) = water line centre. */
export function splash(x: number, y: number, s: number, water = '#FFFFFF'): string {
  return g(
    path('M-36 0Q-30 -16 -22 -4Q-14 -24 -4 -6Q4 -26 14 -6Q22 -20 30 -2Q34 2 36 0Z', water, { opacity: 0.85 }) +
      circle(-30, -26, 4, water, { opacity: 0.85 }) +
      circle(-12, -38, 3.4, water, { opacity: 0.85 }) +
      circle(24, -32, 4.2, water, { opacity: 0.85 }) +
      circle(40, -16, 3, water, { opacity: 0.85 }) +
      ellipse(0, 4, 44, 7, '#FFFFFF', { opacity: 0.45 }),
    { transform: tf(x, y, s) },
  );
}

/** Lily pad (ellipse centred on (x, y) with a notch on the right). */
export function lilyPad(x: number, y: number, rx: number, fill = '#8FDB97'): string {
  const ry = rx * 0.42;
  const l = darken(fill, 0.3);
  return (
    path(`M${n(x)} ${n(y)}L${n(x + rx * 0.94)} ${n(y - ry * 0.34)}A${n(rx)} ${n(ry)} 0 1 0 ${n(x + rx * 0.94)} ${n(y + ry * 0.34)}Z`, fill, stroke(l, 3)) +
    path(`M${n(x)} ${n(y)}L${n(x - rx * 0.6)} ${n(y - ry * 0.5)}M${n(x)} ${n(y)}L${n(x - rx * 0.5)} ${n(y + ry * 0.6)}M${n(x)} ${n(y)}L${n(x + rx * 0.1)} ${n(y + ry * 0.8)}`, 'none', { ...stroke(l, 2), opacity: 0.6 }) +
    ellipse(x - rx * 0.4, y - ry * 0.35, rx * 0.22, ry * 0.18, '#fff', { opacity: 0.35 })
  );
}

/** Little frog sitting (front view). (x, y) = bottom centre. */
export function frog(x: number, y: number, s: number, fill = '#9BE3A8', mood: Mood = 'happy'): string {
  const l = darken(fill, 0.34);
  return g(
    ellipse(-20, -4, 13, 7, fill, stroke(l, 3)) +
      ellipse(20, -4, 13, 7, fill, stroke(l, 3)) +
      ellipse(0, -18, 26, 20, fill, stroke(l, 3.4)) +
      ellipse(0, -12, 15, 11, lighten(fill, 0.5)) +
      circle(-13, -40, 11, fill, stroke(l, 3.2)) +
      circle(13, -40, 11, fill, stroke(l, 3.2)) +
      ellipse(0, -30, 23, 13, fill) +
      face({ x: 0, y: -39, s: 0.6, mood, gap: 22, blush: P.blush }) +
      shine(-16, -46, 4, 2.4) +
      ellipse(-9, -2, 6, 4, fill, stroke(l, 2.6)) +
      ellipse(9, -2, 6, 4, fill, stroke(l, 2.6)),
    { transform: tf(x, y, s) },
  );
}

/** Cattail reeds cluster. (x, y) = base. */
export function reeds(x: number, y: number, s: number, flip = false): string {
  const stem = (dx: number, h: number, bend: number) =>
    path(`M${dx} 0Q${dx + bend * 0.4} ${-h / 2} ${dx + bend} ${-h}`, 'none', stroke(P.grassDeep, 4)) +
    rect(dx + bend - 6, -h - 2, 12, 30, 6, '#C99A72', stroke('#9C6E4E', 2.6)) +
    path(`M${dx + bend} ${-h - 2}v-10`, 'none', stroke(P.grassDeep, 2.6));
  return g(
    path('M-18 0C-24 -40 -30 -70 -40 -96C-20 -70 -10 -40 -6 0Z', P.leaf, stroke(P.grassDeep, 3)) +
      stem(0, 120, -6) +
      stem(14, 96, 10) +
      path('M6 0C12 -40 26 -70 44 -86C26 -60 20 -30 20 0Z', P.leaf, stroke(P.grassDeep, 3)) +
      stem(-12, 80, -14),
    { transform: tf(x, y, s, 0, flip) },
  );
}

/* ------------------------------------------------------------------ garden */

/** Tall sunflower with a face. (x, y) = base; head centre at (x + lean, y - h); R = head size. */
export function sunflower(x: number, y: number, h: number, R: number, lean = 0, mood: Mood = 'happy'): string {
  const hx = x + lean;
  const hy = y - h;
  let petals = '';
  const count = 14;
  for (let i = 0; i < count; i++) {
    const a = (i * 360) / count;
    const rad = (a * Math.PI) / 180;
    const px = hx + Math.cos(rad) * R * 0.98;
    const py = hy + Math.sin(rad) * R * 0.98;
    petals += ellipse(px, py, R * 0.42, R * 0.2, '#FFD95A', { ...stroke('#E8AE3A', Math.max(2.4, R * 0.07)), transform: `rotate(${n(a)} ${n(px)} ${n(py)})` });
  }
  return (
    path(`M${x} ${y}Q${x - 6} ${n(y - h * 0.5)} ${n(hx)} ${n(hy)}`, 'none', stroke(P.grassDeep, 7)) +
    path(`M${x} ${y}Q${x - 6} ${n(y - h * 0.5)} ${n(hx)} ${n(hy)}`, 'none', stroke(P.leaf, 3)) +
    path(`M${x - 3} ${n(y - h * 0.32)}C${x - 30} ${n(y - h * 0.4)} ${x - 46} ${n(y - h * 0.3)} ${x - 50} ${n(y - h * 0.22)}C${x - 34} ${n(y - h * 0.18)} ${x - 16} ${n(y - h * 0.22)} ${x - 3} ${n(y - h * 0.32)}Z`, P.leaf, stroke(P.grassDeep, 3)) +
    path(`M${x - 2} ${n(y - h * 0.55)}C${x + 26} ${n(y - h * 0.64)} ${x + 42} ${n(y - h * 0.56)} ${x + 46} ${n(y - h * 0.48)}C${x + 30} ${n(y - h * 0.44)} ${x + 12} ${n(y - h * 0.48)} ${x - 2} ${n(y - h * 0.55)}Z`, P.leaf, stroke(P.grassDeep, 3)) +
    petals +
    circle(hx, hy, R * 0.66, '#E8A06A', stroke('#B8744A', Math.max(2.6, R * 0.08))) +
    circle(hx, hy, R * 0.5, '#F2B27E') +
    face({ x: hx, y: hy - R * 0.08, s: R / 62, mood, blush: '#FF8F8F' }) +
    shine(hx - R * 0.3, hy - R * 0.36, R * 0.16, R * 0.09)
  );
}

/** Giant candy flower on a curved stem. (x, y) = base; head at (hx, hy). */
export function giantFlower(x: number, y: number, hx: number, hy: number, r: number, petal: string, center: string = P.lemon, petals = 6): string {
  const l = darken(petal, 0.28);
  let pet = '';
  for (let i = 0; i < petals; i++) {
    const a = ((i * 360) / petals - 90) * (Math.PI / 180);
    pet += circle(hx + Math.cos(a) * r * 0.62, hy + Math.sin(a) * r * 0.62, r * 0.48, petal, stroke(l, 3.4));
  }
  const midX = (x + hx) / 2 + 30;
  return (
    path(`M${x} ${y}Q${n(midX)} ${n((y + hy) / 2)} ${hx} ${hy}`, 'none', stroke(P.grassDeep, 8)) +
    path(`M${x} ${y}Q${n(midX)} ${n((y + hy) / 2)} ${hx} ${hy}`, 'none', stroke(P.leaf, 3.4)) +
    path(`M${n(midX - 18)} ${n((y + hy) / 2 + 30)}c-26 -6 -44 -24 -46 -40c22 0 40 14 46 40z`, P.leaf, stroke(P.grassDeep, 3)) +
    pet +
    circle(hx, hy, r * 0.42, center, stroke(darken(center, 0.25), 3)) +
    circle(hx - r * 0.12, hy - r * 0.12, r * 0.12, '#fff', { opacity: 0.6 }) +
    shine(hx - r * 0.6, hy - r * 0.62, r * 0.18, r * 0.1)
  );
}

/** Watering can, spout pointing right. (x, y) = bottom centre of the can (local units if used inside a character). */
export function wateringCan(x: number, y: number, s: number, fill: string): string {
  const l = darken(fill, 0.32);
  return g(
    path('M14 -18L46 -40L50 -34L22 -8Z', fill, stroke(l, 3)) +
      ellipse(50, -38, 7, 5, fill, { ...stroke(l, 3), transform: 'rotate(-40 50 -38)' }) +
      path('M-14 -36Q0 -60 14 -36', 'none', stroke(l, 8)) +
      path('M-14 -36Q0 -60 14 -36', 'none', stroke(fill, 3.5)) +
      rect(-22, -38, 44, 38, 10, fill, stroke(l, 3.4)) +
      path('M-22 -26H22', 'none', stroke(lighten(fill, 0.45), 4)) +
      circle(-8, -14, 4, '#fff', { opacity: 0.8 }) +
      circle(6, -12, 3, '#fff', { opacity: 0.8 }) +
      shine(-12, -30, 6, 3.5),
    { transform: tf(x, y, s) },
  );
}

/** Water droplets falling. */
export function droplets(x: number, y: number, s = 1): string {
  const drop = (dx: number, dy: number, r: number) => path(`M${dx} ${dy - r * 1.8}Q${dx + r} ${dy - r * 0.3} ${dx} ${dy + r}Q${dx - r} ${dy - r * 0.3} ${dx} ${dy - r * 1.8}Z`, '#A8E6FF', stroke('#6FC4EA', 1.8));
  return g(drop(0, 0, 4) + drop(-10, 14, 3.5) + drop(6, 24, 3.2) + drop(-4, 36, 3.6), { transform: tf(x, y, s) });
}

/** Snail (faces left). (x, y) = base centre. */
export function snail(x: number, y: number, s: number, shell: string, body = '#FFE4C4', mood: Mood = 'happy'): string {
  const sl = darken(shell, 0.3);
  const bl = darken(body, 0.32);
  return g(
    shadow(0, 2, 44, 6, 0.12) +
      path('M-44 0C-48 -16 -40 -26 -30 -28L-26 -10L30 -6Q36 0 30 2Z', body, stroke(bl, 3.2)) +
      path('M-36 -26L-42 -46M-28 -26L-28 -48', 'none', stroke(bl, 3)) +
      circle(-42, -48, 4, body, stroke(bl, 2.4)) +
      circle(-28, -50, 4, body, stroke(bl, 2.4)) +
      face({ x: -33, y: -16, s: 0.34, mood, gap: 14, blush: P.blush }) +
      circle(4, -26, 24, shell, stroke(sl, 3.4)) +
      path('M4 -26m-3 0a3 3 0 1 1 6 0a7 7 0 1 1 -13 1a11 11 0 1 1 22 -2a15 15 0 1 1 -29 3', 'none', stroke(lighten(shell, 0.55), 3.6)) +
      shine(-6, -40, 6, 3.6),
    { transform: tf(x, y, s) },
  );
}

/** Flat stepping stone seen in perspective. */
export function stone(x: number, y: number, w: number, shape: 'circle' | 'square' | 'triangle' | 'heart' | 'star', fill: string): string {
  const h = w * 0.44;
  const l = darken(fill, 0.3);
  const side = darken(fill, 0.16);
  const d = (dy: number): string => {
    const yy = y + dy;
    switch (shape) {
      case 'circle':
        return `M${n(x - w / 2)} ${n(yy)}A${n(w / 2)} ${n(h / 2)} 0 1 1 ${n(x + w / 2)} ${n(yy)}A${n(w / 2)} ${n(h / 2)} 0 1 1 ${n(x - w / 2)} ${n(yy)}Z`;
      case 'square':
        return `M${n(x - w * 0.42)} ${n(yy - h / 2)}H${n(x + w * 0.42)}L${n(x + w / 2)} ${n(yy + h / 2)}H${n(x - w / 2)}Z`;
      case 'triangle':
        return `M${n(x)} ${n(yy - h / 2)}L${n(x + w / 2)} ${n(yy + h / 2)}H${n(x - w / 2)}Z`;
      case 'heart':
        return `M${n(x)} ${n(yy + h / 2)}C${n(x - w * 0.62)} ${n(yy)} ${n(x - w * 0.5)} ${n(yy - h * 0.72)} ${n(x)} ${n(yy - h * 0.22)}C${n(x + w * 0.5)} ${n(yy - h * 0.72)} ${n(x + w * 0.62)} ${n(yy)} ${n(x)} ${n(yy + h / 2)}Z`;
      case 'star': {
        let s = '';
        for (let i = 0; i < 10; i++) {
          const a = ((i * 36 - 90) * Math.PI) / 180;
          const rr = i % 2 ? 0.45 : 1;
          s += `${i ? 'L' : 'M'}${n(x + Math.cos(a) * (w / 2) * rr)} ${n(yy + Math.sin(a) * (h / 2) * rr * 1.1)}`;
        }
        return s + 'Z';
      }
    }
  };
  return path(d(5), side, stroke(l, 3)) + path(d(0), fill, { ...stroke(l, 3), 'stroke-linejoin': 'round' });
}

/** Rounded clipped-hedge wall. */
export function hedge(x1: number, x2: number, y: number, h: number, fill: string, seed = 1, blossom: string | false = false): string {
  const circles: Array<[number, number, number]> = [];
  const r = rng(seed);
  for (let x = x1; x <= x2; x += 30) circles.push([x, y - h + 6 + r() * 8, 26 + r() * 6]);
  const l = darken(fill, 0.22);
  let fl = '';
  if (blossom) for (const [cx, cy] of circles) if (r() > 0.4) fl += circle(cx + (r() - 0.5) * 20, cy + 4 + r() * 14, 4, blossom, stroke(darken(blossom, 0.22), 1.4));
  return puff(circles, fill, l, 3.4) + rect(x1 - 28, y - h + 10, x2 - x1 + 56, h - 10, 0, fill) + path(`M${x1 - 28} ${y}H${x2 + 28}`, 'none', stroke(l, 3)) + fl;
}

/** Terracotta flower pot with a plant. (x, y) = bottom centre. */
export function flowerPot(x: number, y: number, s: number, pot: string, flower: string): string {
  const l = darken(pot, 0.3);
  return g(
    shadow(0, 2, 30, 6, 0.14) +
      path('M0 -40Q-6 -60 -2 -78', 'none', stroke(P.grassDeep, 4)) +
      ellipse(-12, -54, 10, 5, P.leaf, { ...stroke(P.grassDeep, 2.4), transform: 'rotate(-30 -12 -54)' }) +
      ellipse(10, -62, 10, 5, P.leaf, { ...stroke(P.grassDeep, 2.4), transform: 'rotate(30 10 -62)' }) +
      g(
        [0, 72, 144, 216, 288].map((a) => ellipse(0, -9, 7, 10, flower, { ...stroke(darken(flower, 0.25), 2.2), transform: `rotate(${a})` })).join('') + circle(0, 0, 5.5, P.lemon, stroke(P.lemonDeep, 2)),
        { transform: 'translate(-2 -82)' },
      ) +
      path('M-22 -36L22 -36L16 0L-16 0Z', pot, stroke(l, 3.4)) +
      rect(-26, -44, 52, 12, 5, pot, stroke(l, 3.4)) +
      shine(-10, -24, 4, 7, 10, 0.5),
    { transform: tf(x, y, s) },
  );
}

/* ------------------------------------------------------------------ windy meadow */

/** Pastel windmill with pinwheel sails. (x, y) = base. */
export function windmill(x: number, y: number, s: number, body = '#FFF4F8', roof: string = P.lilac, rot = 15): string {
  const l = darken(body, 0.3);
  const rl = darken(roof, 0.3);
  const sails = [0, 90, 180, 270]
    .map((a, i) => g(path('M0 0L8 -6L10 -58L-6 -54Z', [P.pink, P.lemon, P.sky, P.mint][i], stroke(darken([P.pink, P.lemon, P.sky, P.mint][i], 0.3), 2.6)), { transform: `rotate(${a + rot})` }))
    .join('');
  return g(
    path('M-26 0L-18 -84H18L26 0Z', body, stroke(l, 3.2)) +
      path('M-26 -84L0 -112L26 -84Z', roof, stroke(rl, 3.2)) +
      rect(-8, -26, 16, 26, 8, roof, stroke(rl, 2.6)) +
      circle(0, -58, 7, '#CDE9FF', stroke(l, 2.4)) +
      g(sails + circle(0, 0, 5, P.gold, stroke(P.goldDeep, 2)), { transform: 'translate(0 -92)' }),
    { transform: tf(x, y, s) },
  );
}

/** Dandelion: a yellow flower or a fluffy seed puff. (x, y) = base; head ~ (x - 4, y - 86·s). */
export function dandelion(x: number, y: number, s: number, seeds: boolean): string {
  let head = '';
  if (seeds) {
    let rays = '';
    for (let i = 0; i < 16; i++) {
      const a = (i * 360) / 16;
      rays += g(path('M0 0V-20', 'none', stroke('#D9D2EA', 1.6)) + circle(0, -22, 3.6, '#FFFFFF', stroke('#D9D2EA', 1.2)), { transform: `rotate(${a})` });
    }
    head = circle(0, 0, 22, '#FFFFFF', { opacity: 0.55 }) + rays + circle(0, 0, 4.5, '#E8D9B0');
    head += g(path('M0 0V-14', 'none', stroke('#D9D2EA', 1.4)) + circle(0, -16, 3, '#FFFFFF', stroke('#D9D2EA', 1)), { transform: 'translate(30 -24) rotate(40)' });
    head += g(path('M0 0V-14', 'none', stroke('#D9D2EA', 1.4)) + circle(0, -16, 3, '#FFFFFF', stroke('#D9D2EA', 1)), { transform: 'translate(-22 -34) rotate(-30)' });
  } else {
    let petals = '';
    for (let i = 0; i < 18; i++) petals += ellipse(0, -12, 3.6, 10, i % 2 ? '#FFE07A' : '#FFD34F', { ...stroke('#E3AE3A', 1.4), transform: `rotate(${i * 20})` });
    head = petals + circle(0, 0, 8, '#FFD34F', stroke('#E3AE3A', 2)) + circle(-2, -2, 2.6, '#fff', { opacity: 0.6 });
  }
  return g(
    path('M0 0Q4 -44 -4 -86', 'none', stroke(P.grassDeep, 4)) +
      path('M0 -4C-14 -10 -24 -24 -26 -34C-16 -30 -10 -26 -6 -20C-8 -26 -10 -30 -10 -36C-2 -28 2 -16 0 -4Z', P.leaf, stroke(P.grassDeep, 2.6)) +
      g(head, { transform: 'translate(-4 -88)' }),
    { transform: tf(x, y, s) },
  );
}

/** Fluffy "cloud-puff" plant from Cloud-Puff Meadow. */
export function cloudPuffPlant(x: number, y: number, s: number): string {
  return g(
    path('M0 0Q-2 -16 0 -30', 'none', stroke(P.grassDeep, 3.4)) +
      puff(
        [
          [-9, -36, 9],
          [9, -36, 9],
          [0, -44, 11],
          [0, -32, 9],
        ],
        '#FFFFFF',
        '#C9D6F0',
        2.6,
      ) +
      circle(-4, -46, 3, '#fff') +
      circle(3, -38, 2, '#E9E4FF'),
    { transform: tf(x, y, s) },
  );
}

/** Curly wind swoosh line. */
export function swoosh(x: number, y: number, w: number, opacity = 0.85): string {
  return path(`M${n(x)} ${n(y)}q${n(w * 0.3)} ${n(-w * 0.08)} ${n(w * 0.6)} 0t${n(w * 0.3)} -2q${n(w * 0.12)} ${n(-w * 0.1)} 0 ${n(-w * 0.14)}q${n(-w * 0.08)} ${n(-w * 0.02)} ${n(-w * 0.06)} ${n(w * 0.07)}`, 'none', { ...stroke('#FFFFFF', 3.4), opacity });
}
