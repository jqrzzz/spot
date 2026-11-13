/**
 * Buddies — the player's companion creatures (one per profile).
 *
 * Six original chibi creatures that share one family build: a round "mochi" body with the
 * Little Wonder face low and big, stubby arms, two little feet and a soft cel shade on the
 * lower right (light from the upper left). Each one has a single, bold signature feature so
 * it still reads at 48px: Puff's cloud mane + golden horn, Zing's wings + star tail, Bop's
 * fuzzy outline + horns, Flurry's fox ears + scarf, Mochi's long floppy ears, Pip's star crest.
 *
 * Drawings use flat fills only (no gradient/clip ids), so any number of buddies can be placed
 * in one document — including hidden ones — without id collisions.
 */
import { circle, ellipse, face, g, heart, n, path, shadow, shine, sparkle, star, stroke } from '../art/kit.ts';

export type BuddyId = 'puff' | 'zing' | 'bop' | 'flurry' | 'mochi' | 'pip';
export type BuddyMood = 'happy' | 'joy' | 'love' | 'surprised' | 'sleepy' | 'wink';

export interface Buddy {
  id: BuddyId;
  name: string;
  /** Short description, e.g. 'cloud unicorn'. */
  kind: string;
  /** Main body colour (used to tint UI around the buddy). */
  color: string;
  /** Very light tint for cards/backgrounds. */
  soft: string;
  /** SVG markup for viewBox 0 0 200 200: character centred, resting on y ≈ 185. */
  draw(mood?: BuddyMood): string;
}

/* ================================================================== geometry */

type Pt = [number, number];
type Circ = [number, number, number];
type Bez = [Pt, Pt, Pt, Pt];

const CX = 100;
/** Outline width for every buddy (≈ 1.2px at 48px, 5px at 200px). */
const W = 5;
const INK = '#3D2C52';

const pt = (p: Pt): string => `${n(p[0])} ${n(p[1])}`;

/** Smooth closed (or open) curve through points (Catmull-Rom → cubic Bézier). */
function smooth(pts: Pt[], closed = true): string {
  const N = pts.length;
  const at = (i: number): Pt => (closed ? pts[(i + N) % N] : pts[Math.max(0, Math.min(N - 1, i))]);
  let d = `M${pt(pts[0])}`;
  const last = closed ? N : N - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d + (closed ? 'Z' : '');
}

/** One point on the chubby "mochi" body outline (a squircle that is a little wider at the bottom). */
function blobAt(t: number, cx: number, cy: number, hw: number, hh: number, taper = 0.08, sq = 2.3): Pt {
  const e = 2 / sq;
  const c = Math.cos(t);
  const s = Math.sin(t);
  const x = Math.sign(c) * Math.abs(c) ** e;
  const y = Math.sign(s) * Math.abs(s) ** e;
  return [cx + hw * (1 + taper * y) * x, cy + hh * y];
}

function blobPts(cx: number, cy: number, hw: number, hh: number, taper = 0.08, sq = 2.3, steps = 28): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < steps; i++) out.push(blobAt((i / steps) * Math.PI * 2, cx, cy, hw, hh, taper, sq));
  return out;
}

const bez = (c: Bez, t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return [a * c[0][0] + b * c[1][0] + d * c[2][0] + e * c[3][0], a * c[0][1] + b * c[1][1] + d * c[2][1] + e * c[3][1]];
};
const bezTan = (c: Bez, t: number): Pt => {
  const u = 1 - t;
  const x = 3 * u * u * (c[1][0] - c[0][0]) + 6 * u * t * (c[2][0] - c[1][0]) + 3 * t * t * (c[3][0] - c[2][0]);
  const y = 3 * u * u * (c[1][1] - c[0][1]) + 6 * u * t * (c[2][1] - c[1][1]) + 3 * t * t * (c[3][1] - c[2][1]);
  const l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
};

/** An organic tapered shape (ear, tail, horn) along a cubic centre line, widths base → middle → tip. */
function tapered(c: Bez, w0: number, w1: number, w2: number, steps = 12): string {
  const wm = 2 * w1 - (w0 + w2) / 2;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = bez(c, t);
    const [tx, ty] = bezTan(c, t);
    const w = ((1 - t) * (1 - t) * w0 + 2 * (1 - t) * t * wm + t * t * w2) / 2;
    L.push([p[0] - ty * w, p[1] + tx * w]);
    R.push([p[0] + ty * w, p[1] - tx * w]);
  }
  const end = bez(c, 1);
  const [tx, ty] = bezTan(c, 1);
  const cap: Pt = [end[0] + tx * w2 * 0.5, end[1] + ty * w2 * 0.5];
  return smooth([...L, cap, ...R.reverse()]);
}

/** Pointed-rounded leaf from base centre to tip (unicorn ears, wings, feathers). */
function leaf(b: Pt, t: Pt, w: number, bulge = 0.3): string {
  const dx = t[0] - b[0];
  const dy = t[1] - b[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const k = 1 + bulge;
  const bl: Pt = [b[0] + px * w, b[1] + py * w];
  const br: Pt = [b[0] - px * w, b[1] - py * w];
  const c1: Pt = [b[0] + ux * len * 0.55 + px * w * k, b[1] + uy * len * 0.55 + py * w * k];
  const c2: Pt = [b[0] + ux * len * 0.55 - px * w * k, b[1] + uy * len * 0.55 - py * w * k];
  return `M${pt(bl)}Q${pt(c1)} ${pt(t)}Q${pt(c2)} ${pt(br)}Z`;
}

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const poly = (ps: Pt[]): string => `M${ps.map(pt).join('L')}Z`;

/* ================================================================== painting */

interface Skin {
  body: string;
  shade: string;
  line: string;
}

/** Body with a soft cel shade on the lower right and one clean outline on top. */
function shaded(d: string, s: Skin, cx: number, cy: number, k = 0.94, dx = -3, dy = -4): string {
  const tx = cx - k * cx + dx;
  const ty = cy - k * cy + dy;
  return path(d, s.shade) + path(d, s.body, { transform: `translate(${n(tx)} ${n(ty)}) scale(${k})` }) + path(d, 'none', stroke(s.line, W));
}

const outlined = (d: string, fill: string, lineColor: string, w = W): string => path(d, fill, stroke(lineColor, w));

/**
 * Fluffy cloud cluster with one outer outline and a soft shade crescent on every puff.
 * Circles may carry their own colour (rainbow tufts).
 */
function cloudPuffs(cs: Array<[number, number, number, string?, string?]>, fill: string, shade: string, lineColor: string): string {
  let back = '';
  let mid = '';
  let front = '';
  for (const [x, y, r, c, sh] of cs) {
    back += circle(x, y, r + W / 2, lineColor);
    mid += circle(x, y, r - W / 2, sh ?? (c ? mixShade(c) : shade));
    front += circle(x - r * 0.1, y - r * 0.13, r * 0.8, c ?? fill);
  }
  return back + mid + front;
}
/** Shade tone for a pastel. */
function mixShade(c: string): string {
  const h = c.replace('#', '');
  const v = parseInt(h, 16);
  const ch = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((x, i) => Math.round(x * 0.88 + [61, 44, 82][i] * 0.12 - 6));
  return '#' + ch.map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('');
}

/** Capsule limb (arm/leg) with outline. */
function limb(a: Pt, b: Pt, r: number, s: Skin): string {
  const d = `M${pt(a)}L${pt(b)}`;
  return (
    path(d, 'none', { stroke: s.line, 'stroke-width': 2 * r + W, 'stroke-linecap': 'round' }) +
    path(d, 'none', { stroke: s.body, 'stroke-width': 2 * r - W, 'stroke-linecap': 'round' })
  );
}

/* ================================================================== mood poses & effects */

interface Pose {
  /** Arm angles in degrees: 0 = hanging down, 90 = straight out, 180 = straight up. l = viewer's left. */
  l: number;
  r: number;
  /** Paws held in front, hugging a heart. */
  hug?: boolean;
  /** Little hop (joy). */
  lift?: number;
  /** Whole-body tilt (sleepy). */
  tilt?: number;
}

const POSE: Record<BuddyMood, Pose> = {
  happy: { l: 34, r: 34 },
  joy: { l: 136, r: 136, lift: 6 },
  love: { l: 20, r: 20, hug: true },
  surprised: { l: 112, r: 112 },
  sleepy: { l: 18, r: 18, tilt: -5 },
  wink: { l: 142, r: 34 },
};

const GOLD = '#FFD45C';
const GOLD_LINE = '#E3A23B';
const HEART = '#FF7BA9';
const HEART_LINE = '#E2558A';

const twinkle = (x: number, y: number, s: number, fill = GOLD, line = GOLD_LINE): string =>
  g(sparkle(x, y, s, fill), { stroke: line, 'stroke-width': Math.max(1.6, s * 0.2), 'stroke-linejoin': 'round' });

const lilHeart = (x: number, y: number, s: number, rot = 0): string =>
  g(heart(0, 0, s, HEART, stroke(HEART_LINE, Math.max(2, s * 0.26))) + ellipse(-s * 0.42, -s * 0.2, s * 0.22, s * 0.14, '#fff', { opacity: 0.8, transform: `rotate(-35 ${n(-s * 0.42)} ${n(-s * 0.2)})` }), {
    transform: `translate(${n(x)} ${n(y)}) rotate(${rot})`,
  });

const zee = (x: number, y: number, s: number): string =>
  path(`M${n(x - s)} ${n(y - s)}H${n(x + s)}L${n(x - s)} ${n(y + s)}H${n(x + s)}`, 'none', { ...stroke('#8C7BB8', s * 0.42) });

/** Mood decorations, kept to the top corners so they never cover a buddy's features. */
function moodFx(mood: BuddyMood): string {
  switch (mood) {
    case 'joy':
      return twinkle(26, 50, 11) + twinkle(176, 40, 9) + twinkle(14, 84, 6, '#FFC2DD', '#E58AB3') + twinkle(188, 76, 6, '#C9E8FF', '#7FB4E8');
    case 'love':
      return lilHeart(170, 46, 11, 14) + lilHeart(186, 74, 7, 22) + lilHeart(26, 52, 8, -16);
    case 'surprised':
      return path('M160 52l9-12M170 64l14-5M152 44l2-14', 'none', stroke('#8C7BB8', 4)) + path('M40 52l-9-12M30 64l-14-5M48 44l-2-14', 'none', stroke('#8C7BB8', 4));
    case 'sleepy':
      return zee(158, 50, 7) + zee(176, 28, 5) + zee(189, 12, 3.4);
    case 'wink':
      return twinkle(172, 52, 10) + twinkle(186, 78, 5.5, '#FFC2DD', '#E58AB3');
    default:
      return twinkle(178, 48, 6, '#FFFFFF', '#C8B8EA');
  }
}

/* ================================================================== the shared build */

interface Spec {
  skin: Skin;
  cy: number;
  hw: number;
  hh: number;
  taper?: number;
  sq?: number;
  faceY: number;
  faceS?: number;
  blush?: string;
  armR?: number;
  /** Behind the body: tails, wings, ears, horns. */
  back?: (m: BuddyMood) => string;
  /** On the body, under the face: belly, bib, spots. */
  belly?: (m: BuddyMood) => string;
  /** Over the face area: manes, scarf, crest pieces. */
  top?: (m: BuddyMood) => string;
  /** Extra mouth detail drawn over face() (tooth, beak). */
  mouth?: (m: BuddyMood, x: number, my: number, s: number) => string;
  /** Custom body (e.g. fuzzy). Receives the body path. */
  body?: (d: string) => string;
  /** Custom arm (e.g. wings). side −1 = viewer left. */
  arm?: (side: -1 | 1, angle: number, sh: Pt) => string;
  feet?: () => string;
  /** Override where hug paws/heart sit. */
  hugY?: number;
}

function build(sp: Spec, mood: BuddyMood): string {
  const s = sp.skin;
  const pose = POSE[mood];
  const { cy, hw, hh } = sp;
  const d = smooth(blobPts(CX, cy, hw, hh, sp.taper ?? 0.08, sp.sq ?? 2.3));
  const r = sp.armR ?? 10.5;

  const arm = (side: -1 | 1, angle: number): string => {
    const sh: Pt = [CX + side * (hw - 18), cy + 4];
    if (sp.arm) return sp.arm(side, angle, sh);
    const a = (angle * Math.PI) / 180;
    const L = angle > 90 ? 45 : 36;
    return limb(sh, [sh[0] + side * L * Math.sin(a), sh[1] + L * Math.cos(a)], r, s);
  };

  const feet =
    sp.feet?.() ??
    ellipse(CX - 25, 176.5, 16, 9.5, s.body, stroke(s.line, W)) +
      ellipse(CX + 25, 176.5, 16, 9.5, s.body, stroke(s.line, W)) +
      ellipse(CX - 29, 173.5, 6, 3, '#fff', { opacity: 0.45 }) +
      ellipse(CX + 21, 173.5, 6, 3, '#fff', { opacity: 0.45 });

  const fs = sp.faceS ?? 1.55;
  const my = sp.faceY + 12 * fs;

  let hug = '';
  if (pose.hug) {
    const hy = sp.hugY ?? cy + 32;
    hug =
      lilHeart(CX, hy - 2, 17) +
      ellipse(CX - 19, hy + 2, 10.5, 9, s.body, { ...stroke(s.line, W), transform: `rotate(-25 ${CX - 19} ${hy + 2})` }) +
      ellipse(CX + 19, hy + 2, 10.5, 9, s.body, { ...stroke(s.line, W), transform: `rotate(25 ${CX + 19} ${hy + 2})` });
  }

  const figure =
    (sp.back?.(mood) ?? '') +
    (pose.hug ? '' : arm(-1, pose.l) + arm(1, pose.r)) +
    (sp.body ? sp.body(d) : shaded(d, s, CX, cy)) +
    feet +
    (sp.belly?.(mood) ?? '') +
    shine(CX - hw * 0.5, cy - hh * 0.62, hw * 0.2, hh * 0.11, -28, 0.6) +
    circle(CX - hw * 0.68, cy - hh * 0.4, 3.2, '#fff', { opacity: 0.7 }) +
    face({ x: CX, y: sp.faceY, s: fs, mood, blush: sp.blush }) +
    (sp.mouth?.(mood, CX, my, fs) ?? '') +
    (sp.top?.(mood) ?? '') +
    hug;

  let body = figure;
  if (pose.tilt) body = g(body, { transform: `rotate(${pose.tilt} ${CX} 182)` });
  if (pose.lift) body = g(body, { transform: `translate(0 ${-pose.lift})` });
  const shadowW = pose.lift ? 46 : 56;
  return g(shadow(CX, 185, shadowW, 7.5, 0.13) + body + moodFx(mood));
}

/* ================================================================== Puff — cloud unicorn */

const PUFF: Skin = { body: '#DCCBFF', shade: '#C5AEF8', line: '#8A68D4' };

/** Lengthwise-striped rainbow ribbon along one centre line (Puff's tail). */
function rainbowRibbon(c: Bez, w0: number, w1: number, w2: number, colors: string[], lineColor: string): string {
  const d0 = tapered(c, w0, w1, w2);
  let out = path(d0, colors[0], stroke(lineColor, W));
  colors.slice(1).forEach((col, i) => {
    const k = 1 - (i + 1) / colors.length;
    out += path(tapered(c, w0 * k, w1 * k, w2 * k), col);
  });
  return out;
}

const MANE_SHADES = ['#FFC8E2', '#D8CBFF', '#C2E1FF', '#FFE6A8'];

const puffSpec: Spec = {
  skin: PUFF,
  cy: 125,
  hw: 63,
  hh: 57,
  faceY: 118,
  back: () => {
    const ear = (side: -1 | 1): string =>
      outlined(leaf([CX + side * 28, 74], [CX + side * 46, 46], 13, 0.95), PUFF.body, PUFF.line) +
      path(leaf([CX + side * 30, 72], [CX + side * 43, 52], 6, 0.9), '#FFC3E1');
    const tail = rainbowRibbon(
      [
        [140, 162],
        [178, 176],
        [198, 134],
        [172, 100],
      ],
      30,
      26,
      9,
      ['#FFB0C8', '#FFE18F', '#BDEBA8', '#A9D6FA'],
      PUFF.line,
    );
    return tail + ear(-1) + ear(1);
  },
  top: () => {
    const horn =
      outlined('M90 46Q94 27 100 9Q106 27 110 46Z', GOLD, GOLD_LINE, 4.5) +
      path('M92.5 39L107 33M94.8 29.5L105 25M97.2 20.5L102.2 18', 'none', stroke(GOLD_LINE, 2.6)) +
      path('M96 42Q97 30 100 17', 'none', { ...stroke('#fff', 2.4), opacity: 0.75 });
    const sh = (i: number) => MANE_SHADES[i % MANE_SHADES.length];
    const puffs: Array<[number, number, number, string?, string?]> = [
      // cascade down the left side of the face
      [41, 120, 9.5, '#fff', sh(3)],
      [43, 105, 11, '#fff', sh(2)],
      [50, 89, 12.5, '#fff', sh(1)],
      // top
      [126, 66, 13, '#fff', sh(2)],
      [62, 72, 14, '#fff', sh(0)],
      [111, 54, 14, '#fff', sh(3)],
      [82, 58, 17, '#fff', sh(1)],
      [101, 64, 18, '#fff', sh(0)],
      [91, 44, 11.5, '#fff', sh(2)],
      // forelock curls
      [80, 79, 11, '#fff', sh(3)],
      [97, 82, 11.5, '#fff', sh(1)],
      [114, 77, 9.5, '#fff', sh(0)],
    ];
    return horn + cloudPuffs(puffs, '#fff', '#eee', PUFF.line);
  },
};

/* ================================================================== Zing — baby sky dragon */

const ZING: Skin = { body: '#A9D8FF', shade: '#89C1F2', line: '#4C88CF' };
const WING = '#FFD5EC';
const WING_LINE = '#DA79AE';

function dragonWing(side: -1 | 1): string {
  const ox = CX + side * 46;
  const oy = 98;
  const f = (x: number, y: number): string => `${n(ox - side * x)} ${n(oy + y)}`;
  const d = `M${f(0, 8)}C${f(-2, -14)} ${f(-14, -32)} ${f(-40, -40)}Q${f(-34, -28)} ${f(-42, -18)}Q${f(-30, -14)} ${f(-32, -4)}Q${f(-20, -4)} ${f(-16, 8)}Z`;
  const ribs = `M${f(-4, 2)}L${f(-36, -34)}M${f(-6, 4)}L${f(-36, -18)}M${f(-8, 6)}L${f(-28, -5)}`;
  return outlined(d, WING, WING_LINE, 4.5) + path(ribs, 'none', { ...stroke(WING_LINE, 2.4), opacity: 0.65 });
}

const zingSpec: Spec = {
  skin: ZING,
  cy: 125,
  hw: 62,
  hh: 57,
  faceY: 116,
  back: () => {
    const horn = (side: -1 | 1): string =>
      outlined(
        tapered(
          [
            [CX + side * 22, 78],
            [CX + side * 23, 66],
            [CX + side * 26, 57],
            [CX + side * 33, 49],
          ],
          15,
          10,
          5,
        ),
        '#FFF0C4',
        GOLD_LINE,
        4.5,
      );
    const crest = outlined('M90 72Q94 58 100 55Q106 58 110 72Z', WING, WING_LINE, 4.5);
    const tail =
      outlined(
        tapered(
          [
            [138, 160],
            [166, 174],
            [186, 150],
            [180, 118],
          ],
          26,
          16,
          8,
        ),
        ZING.body,
        ZING.line,
      ) + star(181, 108, 14, GOLD, { outline: GOLD_LINE, width: 4.5, rot: 10, inner: 0.52 });
    return tail + dragonWing(-1) + dragonWing(1) + crest + horn(-1) + horn(1);
  },
  belly: () =>
    ellipse(CX, 159, 30, 19, '#FFF4D9', stroke('#EED3A0', 3.5)) +
    path('M80 155Q100 161 120 155M85 165Q100 170 115 165', 'none', stroke('#F1DDB4', 3)),
  feet: () =>
    ellipse(CX - 25, 176.5, 16, 9.5, ZING.body, stroke(ZING.line, W)) +
    ellipse(CX + 25, 176.5, 16, 9.5, ZING.body, stroke(ZING.line, W)) +
    [CX - 33, CX - 25, CX - 17, CX + 17, CX + 25, CX + 33].map((x) => circle(x, 182, 2.6, '#FFF4D9')).join(''),
};

/* ================================================================== Bop — pop monster */

const BOP: Skin = { body: '#ADEEC9', shade: '#86DBAF', line: '#3FA577' };

function fuzzyBody(cy: number, hw: number, hh: number): (d: string) => string {
  return (d: string) => {
    const fz: Circ[] = [];
    const steps = 40;
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      // keep the bottom (where the feet are) smooth
      const fromBottom = Math.abs(((t - Math.PI / 2 + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (fromBottom < 0.62) continue;
      const c = Math.cos(t);
      const s = Math.sin(t);
      const e = 2 / 2.3;
      const x = Math.sign(c) * Math.abs(c) ** e;
      const y = Math.sign(s) * Math.abs(s) ** e;
      fz.push([CX + hw * (1 + 0.08 * y) * x, cy + hh * y, i % 2 ? 7 : 8.5]);
    }
    const lit = (x: number, y: number) => (x - CX) * 0.6 + (y - cy) * 0.8 < 10;
    const k = 0.94;
    const tx = CX - k * CX - 3;
    const ty = cy - k * cy - 4;
    return (
      path(d, BOP.line, stroke(BOP.line, W * 2)) +
      fz.map(([x, y, r]) => circle(x, y, r + W, BOP.line)).join('') +
      path(d, BOP.shade) +
      fz.map(([x, y, r]) => circle(x, y, r, lit(x, y) ? BOP.body : BOP.shade)).join('') +
      path(d, BOP.body, { transform: `translate(${n(tx)} ${n(ty)}) scale(${k})` })
    );
  };
}

const bopSpec: Spec = {
  skin: BOP,
  cy: 126,
  hw: 60,
  hh: 54,
  faceY: 118,
  back: () => {
    const horn = (side: -1 | 1): string =>
      outlined(
        tapered(
          [
            [CX + side * 24, 80],
            [CX + side * 26, 66],
            [CX + side * 30, 56],
            [CX + side * 38, 46],
          ],
          18,
          12,
          6,
        ),
        '#D9C6FF',
        '#8A68D4',
        4.5,
      ) + path(`M${CX + side * 23} 64Q${CX + side * 29} 62 ${CX + side * 33} 58`, 'none', stroke('#B79BFF', 3));
    return horn(-1) + horn(1);
  },
  body: fuzzyBody(126, 60, 54),
  belly: () =>
    circle(56, 146, 6.5, '#D6F9E6') + circle(146, 138, 5.5, '#D6F9E6') + circle(141, 156, 4, '#D6F9E6') + circle(62, 128, 3.5, '#D6F9E6') + circle(124, 158, 3, '#D6F9E6'),
  mouth: (m, x, my, s) => {
    const tooth = (tx: number, ty: number, w: number, h: number): string =>
      path(`M${n(tx)} ${n(ty)}h${n(w)}v${n(h - w / 2)}a${n(w / 2)} ${n(w / 2)} 0 0 1 ${n(-w)} 0Z`, '#fff', stroke(INK, 2));
    switch (m) {
      case 'joy':
        return tooth(x + 1.5, my - 0.6, 7, 6.5);
      case 'surprised':
        return tooth(x - 3, my - 1.2, 6, 5.5);
      case 'sleepy':
        return tooth(x + 1, my + 1.2 * s, 5.5, 5.5);
      default:
        return tooth(x + 1.5, my + 2.2 * s, 7, 7.5);
    }
  },
};

/* ================================================================== Flurry — snow fox kit */

const FLURRY: Skin = { body: '#F7FBFF', shade: '#D9E8F7', line: '#7DA2D2' };
const ICE_CAP = '#CFE5FC';
const LILAC_TIP = '#C4ABFF';
const SCARF = '#FF9EC3';
const SCARF_LINE = '#DD6E9E';
const FOX = { cy: 125, hw: 62, hh: 57 };

function foxEar(side: -1 | 1): string {
  const b1: Pt = [CX + side * 16, 84];
  const b2: Pt = [CX + side * 56, 100];
  const tip: Pt = [CX + side * 49, 32];
  const tipA = lerp(tip, b1, 0.42);
  const tipB = lerp(tip, b2, 0.42);
  const in1 = lerp(b1, tip, 0.14);
  const in2 = lerp(b2, tip, 0.14);
  const inTip = lerp(tip, lerp(b1, b2, 0.5), 0.46);
  return (
    path(poly([b1, tip, b2]), ICE_CAP) +
    path(poly([tip, tipA, tipB]), LILAC_TIP) +
    path(poly([lerp(in1, in2, 0.2), inTip, lerp(in1, in2, 0.8)]), '#FFD6E8', stroke('#FFD6E8', 5)) +
    path(poly([b1, tip, b2]), 'none', stroke(FLURRY.line, W))
  );
}

/** White fox body with an ice-blue cap that dips between the eyes (the classic fox mask). */
function foxBody(d: string): string {
  const { cy, hw, hh } = FOX;
  const outer: Pt[] = [];
  for (let a = 196; a <= 344; a += 8) outer.push(blobAt((a * Math.PI) / 180, CX, cy, hw + 1, hh + 1));
  const inner: Pt[] = [
    [150, 95],
    [134, 90],
    [116, 94],
    [100, 104],
    [84, 94],
    [66, 90],
    [50, 95],
  ];
  const cap = smooth([...outer, ...inner]);
  return shaded(d, FLURRY, CX, cy).replace(/<path d="[^"]*" fill="none"[^>]*\/>$/, '') + path(cap, ICE_CAP) + path(d, 'none', stroke(FLURRY.line, W));
}

const flurrySpec: Spec = {
  skin: FLURRY,
  ...FOX,
  faceY: 112,
  hugY: 158,
  body: foxBody,
  back: () => {
    const tailD = 'M144 176C186 182 204 136 182 92C176 120 160 136 138 146Z';
    const tipD = 'M182 92C190 108 193 122 190 134C182 130 172 132 166 128C174 118 180 106 182 92Z';
    const tail = path(tailD, ICE_CAP) + path(tipD, '#fff') + path(tailD, 'none', stroke(FLURRY.line, W));
    const tufts = outlined('M48 104L25 111L40 119L24 129L46 135Z', FLURRY.body, FLURRY.line) + outlined('M152 104L175 111L160 119L176 129L154 135Z', FLURRY.body, FLURRY.line);
    return tail + tufts + foxEar(-1) + foxEar(1);
  },
  feet: () =>
    ellipse(CX - 25, 176.5, 16, 9.5, FLURRY.body, stroke(FLURRY.line, W)) +
    ellipse(CX + 25, 176.5, 16, 9.5, FLURRY.body, stroke(FLURRY.line, W)) +
    ellipse(CX - 25, 181, 9, 3.6, ICE_CAP) +
    ellipse(CX + 25, 181, 9, 3.6, ICE_CAP),
  top: () => {
    const band = 'M36 140Q100 160 164 140Q170 148 166 156Q100 178 34 156Q30 148 36 140Z';
    const end = 'M120 156L144 152L150 184L128 186Z';
    return (
      outlined(end, SCARF, SCARF_LINE, 4.5) +
      path('M124 165L146 162M126 175L148 172', 'none', stroke('#fff', 4)) +
      path('M131 186v5M138 185.5v5.5M145 185v5', 'none', stroke(SCARF_LINE, 3)) +
      outlined(band, SCARF, SCARF_LINE, 4.5) +
      path('M58 151l-4 12M80 156l-2 13M102 158v13M124 156l2 13M146 151l4 12', 'none', stroke('#fff', 4.5)) +
      ellipse(70, 150, 12, 3, '#fff', { opacity: 0.45, transform: 'rotate(8 70 150)' })
    );
  },
};

/* ================================================================== Mochi — cloud bunny */

const MOCHI: Skin = { body: '#FFC6DF', shade: '#F7A6CA', line: '#DC72A6' };

function bunnyEar(c: Bez, w: [number, number, number]): string {
  const outer = tapered(c, w[0], w[1], w[2]);
  const inner = tapered(c, w[0] * 0.38, w[1] * 0.46, w[2] * 0.3);
  return outlined(outer, MOCHI.body, MOCHI.line) + path(inner, '#FF9CC6');
}

const mochiSpec: Spec = {
  skin: MOCHI,
  cy: 127,
  hw: 68,
  hh: 55,
  sq: 2.15,
  taper: 0.06,
  faceY: 121,
  blush: '#FF6FA6',
  back: () =>
    bunnyEar(
      [
        [82, 82],
        [74, 40],
        [56, 18],
        [30, 40],
      ],
      [24, 27, 14],
    ) +
    bunnyEar(
      [
        [118, 82],
        [126, 42],
        [146, 18],
        [170, 40],
      ],
      [24, 27, 14],
    ),
  top: () =>
    cloudPuffs(
      [
        [100, 74, 10],
        [89, 78, 8],
        [111, 78, 8],
        [94, 66, 7.5],
        [107, 66, 7.5],
      ],
      '#FFFFFF',
      '#F6E2EE',
      MOCHI.line,
    ),
};

/* ================================================================== Pip — star chick */

const PIP: Skin = { body: '#FFE58C', shade: '#F7CF63', line: '#D99A33' };
const BEAK = '#FFAA5A';
const BEAK_LINE = '#DB7A33';

const pipSpec: Spec = {
  skin: PIP,
  cy: 127,
  hw: 63,
  hh: 55,
  faceY: 119,
  back: () =>
    star(100, 50, 25, GOLD, { outline: GOLD_LINE, width: W, rot: -6, inner: 0.55 }) +
    path('M93 41Q96 37 100 37', 'none', { ...stroke('#fff', 3), opacity: 0.85 }),
  belly: () => ellipse(CX, 154, 30, 21, '#FFF5CC'),
  arm: (side, angle, sh) => {
    const a = side * angle;
    const s: Pt = [sh[0] + side * 4, sh[1] - 6];
    return g(
      outlined(leaf([0, 0], [0, 40], 14, 0.15), PIP.body, PIP.line) + path('M-5 26Q0 31 5 26M-5 17Q0 22 5 17', 'none', stroke(PIP.line, 2.6)),
      { transform: `translate(${n(s[0])} ${n(s[1])}) rotate(${n(-a)})` },
    );
  },
  mouth: (m, x, my) => {
    if (m === 'joy' || m === 'surprised') {
      const open = m === 'joy' ? 1 : 0.75;
      return (
        ellipse(x, my + 5, 9 * open + 2, 9 * open, '#FF7A9C', stroke(INK, 2.5)) +
        outlined(`M${x - 13} ${my - 1}Q${x} ${my - 9} ${x + 13} ${my - 1}Q${x} ${my + 6} ${x - 13} ${my - 1}Z`, BEAK, BEAK_LINE, 3) +
        outlined(`M${x - 9} ${my + 8 + 4 * open}Q${x} ${my + 18 + 6 * open} ${x + 9} ${my + 8 + 4 * open}Q${x} ${my + 12 + 4 * open} ${x - 9} ${my + 8 + 4 * open}Z`, BEAK, BEAK_LINE, 3)
      );
    }
    return (
      outlined(`M${x - 13} ${my - 1}Q${x} ${my - 9} ${x + 13} ${my - 1}Q${x + 4} ${my + 12} ${x} ${my + 12}Q${x - 4} ${my + 12} ${x - 13} ${my - 1}Z`, BEAK, BEAK_LINE, 3) +
      path(`M${x - 8} ${my + 2}Q${x} ${my + 5} ${x + 8} ${my + 2}`, 'none', stroke(BEAK_LINE, 2.4)) +
      ellipse(x - 4, my - 2.5, 4, 1.8, '#fff', { opacity: 0.6 })
    );
  },
  feet: () => {
    const foot = (x: number): string => {
      const d = `M${x} 170L${x - 10} 184M${x} 170L${x} 186M${x} 170L${x + 10} 184`;
      return path(d, 'none', { ...stroke(BEAK_LINE, 11) }) + path(d, 'none', { ...stroke(BEAK, 5) });
    };
    return foot(CX - 24) + foot(CX + 24);
  },
};

/* ================================================================== registry */

const make = (spec: Spec) => (mood: BuddyMood = 'happy'): string => build(spec, mood);

export const BUDDIES: Buddy[] = [
  { id: 'puff', name: 'Puff', kind: 'cloud unicorn', color: '#D8C6FF', soft: '#F4EEFF', draw: make(puffSpec) },
  { id: 'zing', name: 'Zing', kind: 'baby sky dragon', color: '#A9D8FF', soft: '#EAF6FF', draw: make(zingSpec) },
  { id: 'bop', name: 'Bop', kind: 'pop monster', color: '#ADEEC9', soft: '#E9FBF1', draw: make(bopSpec) },
  { id: 'flurry', name: 'Flurry', kind: 'snow fox kit', color: '#CFE6FF', soft: '#F1F8FF', draw: make(flurrySpec) },
  { id: 'mochi', name: 'Mochi', kind: 'cloud bunny', color: '#FFC6DF', soft: '#FFF0F7', draw: make(mochiSpec) },
  { id: 'pip', name: 'Pip', kind: 'star chick', color: '#FFE58C', soft: '#FFFAE3', draw: make(pipSpec) },
];

/** Starting buddies for the two first players (Jett plays with Zing, June with Puff). */
export const DEFAULT_BUDDY = { jett: 'zing', june: 'puff' } as const satisfies Record<string, BuddyId>;

export function getBuddy(id: string): Buddy {
  return BUDDIES.find((b) => b.id === id) ?? BUDDIES[0];
}
