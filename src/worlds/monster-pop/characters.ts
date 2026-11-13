/**
 * Monster Pop Academy — the recurring cast.
 *
 *  - Plinky  pink singer with big grape-coloured hair puffs, tiny gold horns and an aqua sparkle dress.
 *  - Tumtum  big fuzzy mint drummer with an antenna, a peach hair tuft and a lilac neckerchief.
 *  - Lolo    tall sky-blue dancer with curly star antennae, a lemon quiff and a pink sequin jacket.
 *  - Fizz    tiny lemon monster with fairy wings and a pink tuft — the littlest member.
 *
 * Every character is drawn in local coordinates (feet on y = 0, facing the viewer) and placed with
 * x / y / s. Anything a difference may change (mood, arm poses, held items, shoes, accessories,
 * colours) is a parameter, so the rest of the figure stays pixel-identical.
 */
import { P, circle, darken, ellipse, face, g, heart, lighten, n, path, puff, radial, shine, sparkle, star, stroke, type Mood } from '../../art/kit.ts';

/* ------------------------------------------------------------------ shared bits */

/** Soft volume gradient for a colour (light from the upper left). Duplicated defs are harmless. */
const gid = (c: string): string => 'mpv' + c.replace('#', '').toLowerCase();
export const volDef = (c: string): string =>
  radial(gid(c), [
    [0, lighten(c, 0.5)],
    [0.45, lighten(c, 0.15)],
    [1, c],
  ], 0.4, 0.36, 0.72, 0.32, 0.26);
export const vol = (c: string): string => `url(#${gid(c)})`;
export const volDefs = (...cs: string[]): string => `<defs>${[...new Set(cs)].map(volDef).join('')}</defs>`;

export type Arm = 'down' | 'out' | 'up' | 'wave' | 'cheer' | 'hold' | 'front' | 'hip' | 'drum';
export type ShoePattern = 'plain' | 'stars' | 'stripes' | 'dots' | 'hearts';
export interface Shoe {
  color: string;
  pattern?: ShoePattern;
  /** Colour of the pattern marks. */
  mark?: string;
}

/** Something held in a hand. Drawn in the character's local space at the hand position. */
export type Item = (hx: number, hy: number, side: -1 | 1) => string;

export interface MonsterOpts {
  x: number;
  y: number;
  s?: number;
  mood?: Mood;
  look?: number;
  /** Arm on the picture's left / right side. */
  armL?: Arm;
  armR?: Arm;
  holdL?: Item;
  holdR?: Item;
  /** Shoe on the picture's left / right side. */
  shoeL?: Shoe;
  shoeR?: Shoe;
  /** Main outfit colour override. */
  outfit?: string;
  /** Outfit decoration pattern. */
  print?: 'stars' | 'hearts' | 'dots' | 'plain';
  /** Accessory colour override (bow, neckerchief, band…). */
  acc?: string;
  /** Extra accessory. */
  extra?: 'none' | 'bow' | 'headphones' | 'crown' | 'flower';
  /** Drawn behind the body (backpack, cape…), local coords. */
  back?: string;
  /** Drawn after the body and face but under the arms (an instrument held in front), local coords. */
  mid?: string;
  /** Drawn over everything, local coords. */
  front?: string;
  /** Mirror the whole figure (moods stay readable). */
  flip?: boolean;
  shadow?: boolean;
}

/** Character placement transform. */
function place(o: MonsterOpts, content: string): string {
  const s = o.s ?? 1;
  return g(content, { transform: `translate(${n(o.x)} ${n(o.y)}) scale(${n(o.flip ? -s : s)} ${n(s)})` });
}

/** Arm poses for the picture-left arm (mirrored for the right), relative to the shoulder. */
const ARMS: Record<Arm, { e: [number, number]; h: [number, number] }> = {
  down: { e: [-12, 18], h: [-16, 38] },
  out: { e: [-20, 2], h: [-40, -6] },
  up: { e: [-26, -10], h: [-42, -36] },
  wave: { e: [-28, -6], h: [-44, -40] },
  cheer: { e: [-14, -26], h: [-18, -54] },
  hold: { e: [-12, 24], h: [8, 12] },
  front: { e: [-12, 18], h: [8, 30] },
  hip: { e: [-24, 16], h: [-6, 30] },
  drum: { e: [-22, 10], h: [-24, 30] },
};

/**
 * One outlined arm (two stacked strokes make a capsule with a clean outline) and its hand.
 * Returns markup and the hand position.
 */
export function arm(sx: number, sy: number, side: -1 | 1, pose: Arm, fill: string, lineC: string, k = 1): { art: string; hand: [number, number] } {
  const a = ARMS[pose];
  const mx = (v: number) => (side === -1 ? v : -v);
  const e: [number, number] = [sx + mx(a.e[0]) * k, sy + a.e[1] * k];
  const h: [number, number] = [sx + mx(a.h[0]) * k, sy + a.h[1] * k];
  const d = `M${n(sx)} ${n(sy)}Q${n(e[0])} ${n(e[1])} ${n(h[0])} ${n(h[1])}`;
  let art =
    path(d, 'none', stroke(lineC, 21 * k)) +
    circle(h[0], h[1], 12.5 * k, lineC) +
    path(d, 'none', stroke(fill, 13.5 * k)) +
    circle(h[0], h[1], 8.8 * k, fill);
  if (pose === 'wave') {
    const wx = h[0] + mx(-16) * k;
    art +=
      path(`M${n(wx)} ${n(h[1] - 12 * k)}q${n(mx(-6) * k)} ${n(10 * k)} 0 ${n(22 * k)}`, 'none', stroke(lineC, 3 * k)) +
      path(`M${n(wx + mx(-8) * k)} ${n(h[1] - 18 * k)}q${n(mx(-8) * k)} ${n(16 * k)} 0 ${n(32 * k)}`, 'none', stroke(lineC, 3 * k));
  }
  return { art, hand: h };
}

/** Pattern marks on a shoe upper (shoe local coords, toe pointing left). */
function shoeMarks(p: ShoePattern, c: string): string {
  switch (p) {
    case 'stars':
      return star(-8, -12, 5.8, c, { width: 1.6, inner: 0.5 }) + star(6, -14.5, 4.6, c, { width: 1.4, inner: 0.5 });
    case 'stripes':
      return path('M-14 -6L-8 -18M-6 -5L0 -19M2 -5L8 -20', 'none', stroke(c, 3.6));
    case 'dots':
      return circle(-11, -10, 2.8, c) + circle(-2, -14, 2.8, c) + circle(7, -11, 2.8, c) + circle(-4, -7.5, 2.2, c);
    case 'hearts':
      return heart(-8, -11.5, 5.2, c) + heart(5, -14, 4.4, c);
    default:
      return '';
  }
}

/** A chunky sneaker. (x, y) = bottom centre; dir -1 = toe to the left. */
export function sneaker(x: number, y: number, dir: -1 | 1, sh: Shoe, k = 1): string {
  const lineC = darken(sh.color, 0.42);
  const upper = 'M-21 -5C-26 -11 -21 -19 -10 -19L1 -21C7 -29 17 -26 18 -17C20 -11 19 -7 17 -5Z';
  const art =
    path(upper, sh.color, stroke(lineC, 3.2)) +
    shoeMarks(sh.pattern ?? 'plain', sh.mark ?? '#fff') +
    path('M-1 -21l2 6M4 -22l2 6', 'none', stroke('#fff', 2.4)) +
    path('M-23 -6H18Q22 -6 21 -2Q20 2 15 2H-19Q-25 2 -23 -3Z', '#FFFDF8', stroke(lineC, 3.2)) +
    ellipse(-12, -15, 5, 2.4, '#fff', { opacity: 0.6, transform: 'rotate(-20 -12 -15)' });
  return g(art, { transform: `translate(${n(x)} ${n(y)}) scale(${n(-dir * k)} ${n(k)})` });
}

/** Two short legs + sneakers. */
function legsAndShoes(spread: number, legTop: number, fill: string, lineC: string, o: MonsterOpts, k = 1, defShoe: Shoe): string {
  const L = o.shoeL ?? defShoe;
  const R = o.shoeR ?? defShoe;
  const leg = (x: number) => path(`M${x} ${legTop}L${x} -12`, 'none', stroke(lineC, 20 * k)) + path(`M${x} ${legTop}L${x} -12`, 'none', stroke(fill, 12.5 * k));
  return leg(-spread) + leg(spread) + sneaker(-spread - 6 * k, 0, -1, L, k) + sneaker(spread + 6 * k, 0, 1, R, k);
}

/** Tiny decorations scattered on a garment. Positions are local. */
function printMarks(kind: MonsterOpts['print'], pts: [number, number][], c: string, size = 5): string {
  if (!kind || kind === 'plain') return '';
  return pts
    .map(([x, y], i) => {
      if (kind === 'stars') return star(x, y, size, c, { width: 1.2, rot: i * 13 });
      if (kind === 'hearts') return heart(x, y, size * 0.95, c);
      return circle(x, y, size * 0.55, c);
    })
    .join('');
}

function extraAcc(kind: MonsterOpts['extra'], x: number, y: number, c: string, k = 1): string {
  switch (kind) {
    case 'bow':
      return g(
        path(`M${x} ${y}l-18 -11q-5 11 0 22z`, c, stroke(darken(c, 0.35), 3)) +
          path(`M${x} ${y}l18 -11q5 11 0 22z`, c, stroke(darken(c, 0.35), 3)) +
          circle(x, y, 5.5, lighten(c, 0.2), stroke(darken(c, 0.35), 3)),
        { transform: k !== 1 ? `translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})` : undefined },
      );
    case 'crown':
      return path(`M${x - 18} ${y + 6}L${x - 20} ${y - 12}L${x - 9} ${y - 3}L${x} ${y - 17}L${x + 9} ${y - 3}L${x + 20} ${y - 12}L${x + 18} ${y + 6}Z`, P.gold, stroke(P.goldDeep, 3)) + circle(x, y - 1, 3, P.pinkDeep);
    case 'flower':
      return [0, 72, 144, 216, 288].map((a) => circle(x + Math.cos((a * Math.PI) / 180) * 7, y + Math.sin((a * Math.PI) / 180) * 7, 6, c, stroke(darken(c, 0.3), 2))).join('') + circle(x, y, 4.5, P.lemon);
    default:
      return '';
  }
}

/* ------------------------------------------------------------------ Plinky */

export const PLINKY = {
  body: '#FFB6D3',
  line: '#D2669C',
  hair: '#B89CFF',
  hairLine: '#7E60D8',
  dress: '#9DE9E1',
  dressLine: '#3BB2AA',
  shoe: { color: '#FFFFFF', pattern: 'hearts', mark: '#FF8FB8' } as Shoe,
};

/** Plinky — the pink lead singer. ~250 tall at s = 1. */
export function plinky(o: MonsterOpts): string {
  const C = PLINKY;
  const dress = o.outfit ?? C.dress;
  const dLine = darken(dress, 0.38);
  const headY = -146;
  const shL = arm(-30, -88, -1, o.armL ?? 'down', C.body, C.line);
  const shR = arm(30, -88, 1, o.armR ?? 'down', C.body, C.line);
  const horn = (x: number, dir: number) =>
    path(`M${x - 8} ${-188}Q${x - 4 + dir * 6} ${-222} ${x + dir * 10} ${-226}Q${x + 6 + dir * 2} ${-206} ${x + 9} ${-190}Z`, P.lemon, stroke(P.goldDeep, 3.5));
  const hairBack = puff(
    [
      [-58, -176, 30],
      [58, -176, 30],
      [-66, -146, 20],
      [66, -146, 20],
    ],
    C.hair,
    C.hairLine,
    4,
  );
  const bangs = puff(
    [
      [-38, -184, 20],
      [-14, -196, 23],
      [14, -197, 23],
      [38, -185, 20],
      [0, -190, 22],
    ],
    C.hair,
    C.hairLine,
    4,
  );
  const art =
    volDefs(C.body, dress) +
    (o.shadow === false ? '' : ellipse(0, 0, 60, 10, P.ink, { opacity: 0.13 })) +
    (o.back ?? '') +
    legsAndShoes(16, -40, C.body, C.line, o, 1, C.shoe) +
    // body
    ellipse(0, -66, 38, 34, vol(C.body), stroke(C.line, 4)) +
    // dress: bodice + flared, scalloped skirt
    path(`M-30 -92Q0 -104 30 -92L33 -62Q52 -46 58 -28Q46 -20 36 -26Q24 -18 12 -25Q0 -17 -12 -25Q-24 -18 -36 -26Q-46 -20 -58 -28Q-52 -46 -33 -62Z`, vol(dress), stroke(dLine, 4)) +
    path('M-33 -62Q0 -54 33 -62', 'none', stroke(dLine, 3)) +
    printMarks(o.print ?? 'stars', [[-36, -40], [-12, -44], [14, -40], [38, -38], [0, -78], [-18, -84], [18, -84]], P.lemon, 4.4) +
    sparkle(-24, -72, 4, '#fff') +
    sparkle(26, -54, 4, '#fff') +
    shine(-14, -86, 9, 4, -15, 0.6) +
    hairBack +
    horn(-24, -1) +
    horn(24, 1) +
    circle(0, headY, 56, vol(C.body), stroke(C.line, 4)) +
    shine(-26, headY - 22, 14, 8, -35, 0.6) +
    bangs +
    shine(-18, -204, 10, 5, -20, 0.5) +
    extraAcc(o.extra ?? 'none', 40, -200, o.acc ?? P.pinkDeep) +
    face({ x: 0, y: headY + 8, s: 1.6, mood: o.mood ?? 'happy', look: o.look }) +
    (o.mid ?? '') +
    shL.art +
    shR.art +
    (o.holdL ? o.holdL(shL.hand[0], shL.hand[1], -1) : '') +
    (o.holdR ? o.holdR(shR.hand[0], shR.hand[1], 1) : '') +
    (o.front ?? '');
  return place(o, art);
}

/* ------------------------------------------------------------------ Tumtum */

export const TUMTUM = {
  body: '#AEEBC6',
  line: '#3FA77A',
  belly: '#E3FAEC',
  tuft: '#FFB991',
  tuftLine: '#DE7D57',
  scarf: '#C9B2FF',
  shoe: { color: '#FF9FA6', pattern: 'stripes', mark: '#FFFFFF' } as Shoe,
};

/** Tumtum — the big fuzzy mint drummer. ~240 tall at s = 1. */
export function tumtum(o: MonsterOpts): string {
  const C = TUMTUM;
  const cx = 0;
  const cy = -100;
  const rx = 66;
  const ry = 80;
  // fuzzy outline: bumps around the egg
  const bumps: Array<[number, number, number]> = [];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    bumps.push([cx + Math.cos(a) * (rx - 4), cy + Math.sin(a) * (ry - 4), 10]);
  }
  const fur =
    bumps.map(([x, y, r]) => circle(x, y, r + 2, C.line)).join('') +
    ellipse(cx, cy, rx + 2, ry + 2, C.line) +
    bumps.map(([x, y, r]) => circle(x, y, r - 2, C.body)).join('') +
    ellipse(cx, cy, rx - 2, ry - 2, vol(C.body));
  const scarf = o.acc ?? C.scarf;
  const shL = arm(-58, -96, -1, o.armL ?? 'down', C.body, C.line, 1.05);
  const shR = arm(58, -96, 1, o.armR ?? 'down', C.body, C.line, 1.05);
  const art =
    volDefs(C.body, C.belly) +
    (o.shadow === false ? '' : ellipse(0, 0, 70, 11, P.ink, { opacity: 0.13 })) +
    (o.back ?? '') +
    legsAndShoes(26, -30, C.body, C.line, o, 1.1, C.shoe) +
    // antenna + tuft
    path('M10 -176Q14 -200 26 -214', 'none', stroke(C.line, 9)) +
    path('M10 -176Q14 -200 26 -214', 'none', stroke(C.body, 4)) +
    circle(28, -218, 11, P.lemon, stroke(P.goldDeep, 3.5)) +
    shine(24, -222, 4, 2.5) +
    // little horns
    path('M-44 -150Q-58 -172 -48 -184Q-36 -170 -30 -158Z', P.lilac, stroke(P.lilacDeep, 3.5)) +
    path('M44 -150Q58 -172 48 -184Q36 -170 30 -158Z', P.lilac, stroke(P.lilacDeep, 3.5)) +
    fur +
    ellipse(0, -60, 42, 34, vol(C.belly)) +
    path('M-18 -54q4 -4 8 0M8 -44q4 -4 8 0M-6 -72q4 -4 8 0', 'none', stroke(darken(C.belly, 0.18), 2.6)) +
    shine(-34, -148, 16, 9, -35, 0.55) +
    puff(
      [
        [-14, -176, 11],
        [0, -184, 13],
        [-26, -170, 9],
      ],
      C.tuft,
      C.tuftLine,
      3.5,
    ) +
    // neckerchief
    path('M-34 -94Q0 -82 34 -94L6 -70Q0 -66 -6 -70Z', scarf, stroke(darken(scarf, 0.35), 3.5)) +
    circle(0, -88, 6, lighten(scarf, 0.25), stroke(darken(scarf, 0.35), 3)) +
    extraAcc(o.extra ?? 'none', -40, -176, o.acc ?? P.pinkDeep) +
    face({ x: 0, y: -130, s: 1.6, mood: o.mood ?? 'happy', look: o.look, gap: 17 }) +
    (o.mid ?? '') +
    shL.art +
    shR.art +
    (o.holdL ? o.holdL(shL.hand[0], shL.hand[1], -1) : '') +
    (o.holdR ? o.holdR(shR.hand[0], shR.hand[1], 1) : '') +
    (o.front ?? '');
  return place(o, art);
}

/* ------------------------------------------------------------------ Lolo */

export const LOLO = {
  body: '#A3CDFF',
  line: '#4F86D6',
  hair: '#FFE27A',
  hairLine: '#E0A92F',
  jacket: '#FF9CC6',
  shoe: { color: '#C9B4FF', pattern: 'stars', mark: '#FFF3B0' } as Shoe,
};

/** Lolo — the tall blue dancer. ~270 tall at s = 1. */
export function lolo(o: MonsterOpts): string {
  const C = LOLO;
  const jacket = o.outfit ?? C.jacket;
  const jLine = darken(jacket, 0.38);
  const headY = -160;
  const shL = arm(-28, -100, -1, o.armL ?? 'down', C.body, C.line);
  const shR = arm(28, -100, 1, o.armR ?? 'down', C.body, C.line);
  const antenna = (dir: number) =>
    path(`M${dir * 18} -206Q${dir * 22} -238 ${dir * 44} -246Q${dir * 60} -250 ${dir * 58} -236`, 'none', stroke(C.line, 8)) +
    path(`M${dir * 18} -206Q${dir * 22} -238 ${dir * 44} -246Q${dir * 60} -250 ${dir * 58} -236`, 'none', stroke(C.body, 3.5)) +
    star(dir * 58, -232, 10, P.lemon, { outline: P.goldDeep, width: 3, rot: dir * 12 });
  const art =
    volDefs(C.body, jacket) +
    (o.shadow === false ? '' : ellipse(0, 0, 56, 10, P.ink, { opacity: 0.13 })) +
    (o.back ?? '') +
    legsAndShoes(14, -50, C.body, C.line, o, 1, C.shoe) +
    ellipse(0, -78, 33, 40, vol(C.body), stroke(C.line, 4)) +
    // sequin jacket (open, with collar)
    path('M-28 -104Q-38 -80 -32 -48Q-20 -42 -10 -46L-8 -98Z', vol(jacket), stroke(jLine, 3.5)) +
    path('M28 -104Q38 -80 32 -48Q20 -42 10 -46L8 -98Z', vol(jacket), stroke(jLine, 3.5)) +
    printMarks(o.print ?? 'dots', [[-22, -84], [-18, -64], [-26, -58], [22, -84], [18, -64], [26, -58], [-24, -96], [24, -96]], '#fff', 5) +
    star(0, -74, 9, P.lemon, { outline: P.goldDeep, width: 2.6 }) +
    antenna(-1) +
    antenna(1) +
    ellipse(0, headY, 50, 54, vol(C.body), stroke(C.line, 4)) +
    shine(-22, headY - 28, 13, 8, -35, 0.6) +
    // lemon quiff
    puff(
      [
        [-34, -194, 15],
        [-14, -206, 19],
        [10, -210, 19],
        [30, -200, 15],
        [44, -186, 11],
        [-44, -180, 10],
      ],
      C.hair,
      C.hairLine,
      3.5,
    ) +
    shine(-8, -216, 9, 4, -15, 0.6) +
    extraAcc(o.extra ?? 'none', -38, -202, o.acc ?? P.pinkDeep) +
    face({ x: 0, y: headY + 6, s: 1.5, mood: o.mood ?? 'happy', look: o.look, gap: 14 }) +
    (o.mid ?? '') +
    shL.art +
    shR.art +
    (o.holdL ? o.holdL(shL.hand[0], shL.hand[1], -1) : '') +
    (o.holdR ? o.holdR(shR.hand[0], shR.hand[1], 1) : '') +
    (o.front ?? '');
  return place(o, art);
}

/* ------------------------------------------------------------------ Fizz */

export const FIZZ = {
  body: '#FFE48A',
  line: '#DDA22C',
  tuft: '#FF9EC4',
  tuftLine: '#DE6A9B',
  wing: '#D7C8FF',
  shoe: { color: '#9FE8D0', pattern: 'dots', mark: '#FFFFFF' } as Shoe,
};

/** Fizz — the littlest monster, with fairy wings. ~140 tall at s = 1. */
export function fizz(o: MonsterOpts): string {
  const C = FIZZ;
  const cy = -66;
  const shL = arm(-34, -56, -1, o.armL ?? 'down', C.body, C.line, 0.8);
  const shR = arm(34, -56, 1, o.armR ?? 'down', C.body, C.line, 0.8);
  const wing = (dir: number) =>
    path(`M${dir * 26} -84Q${dir * 70} -120 ${dir * 78} -88Q${dir * 82} -62 ${dir * 36} -64Z`, C.wing, { ...stroke(darken(C.wing, 0.35), 3.2), opacity: 0.92 }) +
    path(`M${dir * 40} -80Q${dir * 60} -92 ${dir * 66} -84`, 'none', stroke('#fff', 3));
  const art =
    volDefs(C.body) +
    (o.shadow === false ? '' : ellipse(0, 0, 44, 8, P.ink, { opacity: 0.13 })) +
    (o.back ?? '') +
    wing(-1) +
    wing(1) +
    legsAndShoes(14, -24, C.body, C.line, o, 0.78, C.shoe) +
    // horn nubs
    path('M-26 -100Q-34 -118 -24 -122Q-16 -114 -14 -106Z', '#fff', stroke(darken(C.body, 0.4), 3)) +
    path('M26 -100Q34 -118 24 -122Q16 -114 14 -106Z', '#fff', stroke(darken(C.body, 0.4), 3)) +
    circle(0, cy, 46, vol(C.body), stroke(C.line, 4)) +
    shine(-20, cy - 22, 12, 7, -35, 0.65) +
    // tuft
    path('M-14 -108Q-18 -128 -6 -134Q-4 -122 0 -112Q4 -132 16 -132Q18 -118 10 -108Z', C.tuft, stroke(C.tuftLine, 3.5)) +
    extraAcc(o.extra ?? 'none', 24, -108, o.acc ?? P.pinkDeep, 0.8) +
    face({ x: 0, y: cy - 4, s: 1.25, mood: o.mood ?? 'happy', look: o.look, gap: 14 }) +
    (o.mid ?? '') +
    shL.art +
    shR.art +
    (o.holdL ? o.holdL(shL.hand[0], shL.hand[1], -1) : '') +
    (o.holdR ? o.holdR(shR.hand[0], shR.hand[1], 1) : '') +
    (o.front ?? '');
  return place(o, art);
}
