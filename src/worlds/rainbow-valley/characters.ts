/**
 * Rainbow Valley — the recurring cast. Same designs in every level so the world feels like a show.
 *
 *  - Pomi   — a puffcorn: a round, marshmallow-soft creature with a candy-cloud mane, cloud-puff
 *             ankle socks and a tiny golden spiral horn. Curious and brave. (Pink-white coat.)
 *  - Tilly  — a hopleaf: a peach bunny-like friend whose long ears are two green leaves. Kind,
 *             always carrying something for someone.
 *  - Bo     — a bumbleberry: a round lemon bee with lilac stripes and heart-tipped antennae.
 *             Buzzes ahead to point the way.
 *  - puffcorn() also draws Pomi's friends in other coat/mane colours.
 *
 * Every character is drawn in local units (origin = ground point under the feet, facing right)
 * and placed with x, y, s (scale) and flip.
 */
import type { Mood } from '../../art/kit.ts';
import { P, circle, darken, ellipse, face, g, lighten, mix, n, path, puff, shadow, shine, stroke } from '../../art/kit.ts';

const place = (x: number, y: number, s: number, flip = false, rot = 0): string =>
  `translate(${n(x)} ${n(y)})${rot ? ` rotate(${n(rot)})` : ''} scale(${n(flip ? -s : s)} ${n(s)})`;

/* ------------------------------------------------------------------ small accessories */

/** A ribbon bow centred on (x, y). `size` ≈ half-width. */
export function bow(x: number, y: number, size: number, color: string, rot = 0): string {
  const s = size / 20;
  const line = darken(color, 0.32);
  const wing = (dir: 1 | -1) =>
    path(`M0 0C${dir * 6} -14 ${dir * 20} -16 ${dir * 21} -6C${dir * 22} 4 ${dir * 10} 10 0 0Z`, color, stroke(line, 3));
  const tail = (dir: 1 | -1) => path(`M0 2L${dir * 8} 18L${dir * 2} 16L0 2Z`, color, stroke(line, 3));
  const art =
    tail(-1) +
    tail(1) +
    wing(-1) +
    wing(1) +
    path('M-13 -5q4 -4 8 -2', 'none', stroke(lighten(color, 0.6), 2.4)) +
    path('M13 -5q-4 -4 -8 -2', 'none', stroke(lighten(color, 0.6), 2.4)) +
    ellipse(0, -1, 6, 6.5, color, stroke(line, 3)) +
    circle(-1.6, -3, 1.8, '#fff', { opacity: 0.8 });
  return g(art, { transform: `translate(${n(x)} ${n(y)}) rotate(${n(rot)}) scale(${n(s)})` });
}

/** A tiny five-petal flower (for crowns, ears and meadows). */
export function blossom(x: number, y: number, r: number, color: string, center: string = P.lemon): string {
  let out = '';
  for (let i = 0; i < 5; i++) {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    out += circle(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.5, color, stroke(darken(color, 0.25), Math.max(1.2, r * 0.14)));
  }
  return out + circle(x, y, r * 0.36, center, stroke(darken(center, 0.25), Math.max(1, r * 0.12)));
}

/* ------------------------------------------------------------------ puffcorn */

export interface PuffcornOpts {
  x: number;
  y: number;
  s?: number;
  /** Face left instead of right. */
  flip?: boolean;
  mood?: Mood;
  look?: number;
  coat?: string;
  line?: string;
  /** Candy-cloud mane: base, swirl, swirl. */
  mane?: [string, string, string];
  horn?: string;
  pose?: 'stand' | 'sit' | 'hop';
  /** Ribbon bow on the mane (colour) — or false. */
  bow?: string | false;
  bowSize?: number;
  scarf?: string | false;
  crown?: boolean;
  /** Tilt the head a little (degrees). */
  tilt?: number;
  noShadow?: boolean;
  /** Extra art drawn in local units after the body (e.g. something held). */
  extra?: string;
}

export const POMI = {
  coat: '#FFF4FA',
  line: '#D58AB4',
  mane: ['#CDB8FF', '#FFC2E0', '#AEE6FF'] as [string, string, string],
  horn: P.lemon,
};

/** A puffcorn. Pomi by default; pass coat/mane for her friends. */
export function puffcorn(o: PuffcornOpts): string {
  const coat = o.coat ?? POMI.coat;
  const line = o.line ?? POMI.line;
  const mane = o.mane ?? POMI.mane;
  const hornC = o.horn ?? POMI.horn;
  const pose = o.pose ?? 'stand';
  const maneLine = darken(mane[0], 0.32);
  const far = mix(coat, line, 0.18);
  const sw = 3.6;

  const lift = pose === 'hop' ? -14 : 0;
  const bodyY = pose === 'sit' ? -34 : -40 + lift;
  const headY = pose === 'sit' ? -82 : -88 + lift;

  // ---- stubby legs with cloud-puff socks (drawn behind the body so they peek out underneath)
  const leg = (lx: number, fill: string, bottom: number): string => {
    const sock = puff(
      [
        [lx - 5.5, bottom - 4.5, 5.5],
        [lx + 5.5, bottom - 4.5, 5.5],
        [lx, bottom - 7, 7],
      ],
      mane[0],
      maneLine,
      2.6,
    );
    return path(`M${lx - 8} ${bottom - 30}V${bottom - 8}Q${lx - 8} ${bottom} ${lx} ${bottom}Q${lx + 8} ${bottom} ${lx + 8} ${bottom - 8}V${bottom - 30}Z`, fill, stroke(line, sw)) + sock;
  };
  let farLegs = '';
  let nearLegs = '';
  let haunch = '';
  if (pose === 'stand' || pose === 'hop') {
    const b = pose === 'hop' ? -8 + lift : 0;
    farLegs = leg(-20, far, b - 2) + leg(22, far, b - 2);
    nearLegs = leg(-36, coat, b + 1) + leg(6, coat, b + 1);
  } else {
    // sitting: front legs straight, back haunch folded with the sock peeking forward
    farLegs = leg(26, far, -1);
    nearLegs = leg(8, coat, 2);
    haunch =
      ellipse(-26, -16, 22, 16, coat, stroke(line, sw)) +
      puff(
        [
          [-8, -6, 6],
          [-14, -3, 5.5],
          [-3, -3, 5],
        ],
        mane[0],
        maneLine,
        2.6,
      );
  }

  // ---- tail (candy cloud)
  const tail = puff(
    [
      [-54, bodyY - 14, 13],
      [-64, bodyY - 2, 11],
      [-55, bodyY + 6, 10],
      [-66, bodyY - 16, 9],
    ],
    mane[0],
    maneLine,
    3,
  ) + circle(-60, bodyY - 12, 6, mane[1], { opacity: 0.9 }) + circle(-60, bodyY + 4, 4.5, mane[2], { opacity: 0.9 });

  // ---- body
  const body =
    ellipse(-6, bodyY, 46, 32, coat, stroke(line, sw)) +
    ellipse(-6, bodyY + 18, 30, 10, lighten(line, 0.82), { opacity: 0.5 }) +
    shine(-28, bodyY - 14, 14, 7, -20, 0.7) +
    haunch;

  // ---- head
  const hx = 20;
  const hy = headY;
  const earL = path(`M${hx - 30} ${hy - 22}Q${hx - 34} ${hy - 50} ${hx - 22} ${hy - 50}Q${hx - 12} ${hy - 44} ${hx - 10} ${hy - 32}Z`, coat, stroke(line, sw));
  const earR = path(`M${hx + 30} ${hy - 22}Q${hx + 36} ${hy - 50} ${hx + 24} ${hy - 50}Q${hx + 13} ${hy - 44} ${hx + 11} ${hy - 32}Z`, coat, stroke(line, sw));
  const earInner =
    path(`M${hx - 26} ${hy - 28}Q${hx - 28} ${hy - 44} ${hx - 21} ${hy - 44}Q${hx - 16} ${hy - 40} ${hx - 15} ${hy - 33}Z`, mane[1]) +
    path(`M${hx + 26} ${hy - 28}Q${hx + 30} ${hy - 44} ${hx + 23} ${hy - 44}Q${hx + 17} ${hy - 40} ${hx + 16} ${hy - 33}Z`, mane[1]);
  const head = circle(hx, hy, 40, coat, stroke(line, sw)) + shine(hx - 12, hy - 16, 9, 5.5, -35, 0.75);

  // ---- mane: a candy-cloud cap over the crown and down the back of the head
  const mane0 = puff(
    [
      [hx - 4, hy - 37, 14],
      [hx + 12, hy - 38, 11],
      [hx - 22, hy - 31, 14],
      [hx - 35, hy - 15, 13],
      [hx - 40, hy + 3, 12],
      [hx - 37, hy + 21, 10],
    ],
    mane[0],
    maneLine,
    3,
  );
  const maneSwirl =
    circle(hx - 5, hy - 39, 6.5, mane[1], { opacity: 0.95 }) +
    circle(hx - 36, hy - 16, 6, mane[2], { opacity: 0.95 }) +
    circle(hx + 13, hy - 40, 4.5, mane[2], { opacity: 0.95 }) +
    circle(hx - 41, hy + 5, 5, mane[1], { opacity: 0.95 }) +
    circle(hx - 24, hy - 34, 4.5, '#fff', { opacity: 0.65 });
  const forelock = puff(
    [
      [hx + 20, hy - 31, 8],
      [hx + 28, hy - 25, 6.5],
    ],
    mane[1],
    maneLine,
    2.6,
  );

  // ---- little candy-striped spiral horn
  const hl = darken(hornC, 0.3);
  const hornD = `M${hx + 1} ${hy - 44}Q${hx + 6} ${hy - 62} ${hx + 9} ${hy - 72}Q${hx + 12} ${hy - 62} ${hx + 17} ${hy - 44}Q${hx + 9} ${hy - 40} ${hx + 1} ${hy - 44}Z`;
  const horn =
    path(hornD, hornC) +
    path(`M${hx + 2} ${hy - 48}Q${hx + 10} ${hy - 46} ${hx + 16} ${hy - 53}L${hx + 14.6} ${hy - 58}Q${hx + 9} ${hy - 52} ${hx + 3.4} ${hy - 53}Z`, P.pink) +
    path(`M${hx + 4.5} ${hy - 59}Q${hx + 10} ${hy - 58} ${hx + 13.6} ${hy - 63}L${hx + 12.4} ${hy - 67}Q${hx + 9} ${hy - 63} ${hx + 6} ${hy - 64}Z`, P.pink) +
    path(hornD, 'none', stroke(hl, 3)) +
    path(`M${hx + 5.5} ${hy - 46}Q${hx + 6.5} ${hy - 57} ${hx + 8.5} ${hy - 65}`, 'none', { ...stroke('#fff', 2), opacity: 0.8 }) +
    circle(hx + 9, hy - 73, 2.2, '#fff', { opacity: 0.9 });

  const faceArt = face({ x: hx + 4, y: hy + 4, s: 0.92, mood: o.mood ?? 'happy', look: o.look ?? 0.3 });

  let acc = '';
  if (o.scarf) {
    const sc = o.scarf;
    const sl = darken(sc, 0.3);
    acc +=
      path(`M${hx - 30} ${hy + 30}Q${hx} ${hy + 46} ${hx + 32} ${hy + 30}L${hx + 34} ${hy + 42}Q${hx} ${hy + 60} ${hx - 30} ${hy + 42}Z`, sc, stroke(sl, 3)) +
      path(`M${hx - 18} ${hy + 44}L${hx - 26} ${hy + 66}L${hx - 12} ${hy + 64}L${hx - 6} ${hy + 46}Z`, sc, stroke(sl, 3)) +
      path(`M${hx - 20} ${hy + 40}L${hx - 16} ${hy + 50}M${hx + 2} ${hy + 44}L${hx + 4} ${hy + 54}M${hx + 22} ${hy + 40}L${hx + 22} ${hy + 50}`, 'none', stroke(lighten(sc, 0.55), 3));
  }
  if (o.crown) {
    acc +=
      blossom(hx - 22, hy - 32, 8, P.pink) + blossom(hx - 6, hy - 42, 8, P.lemon, P.peach) + blossom(hx + 26, hy - 38, 7, P.sky) + circle(hx + 12, hy - 46, 3, P.leaf) + circle(hx - 32, hy - 20, 3, P.leaf);
  }
  if (o.bow) acc += bow(hx - 36, hy - 24, o.bowSize ?? 18, o.bow, -28);

  const headGroup = g(earL + earR + earInner + head + mane0 + maneSwirl + faceArt + forelock + horn, o.tilt ? { transform: `rotate(${n(o.tilt)} ${hx} ${hy + 30})` } : {});

  const art =
    (o.noShadow ? '' : pose === 'hop' ? shadow(-6, 2, 44, 7, 0.1) : shadow(-6, 2, 58, 9)) +
    tail +
    farLegs +
    nearLegs +
    body +
    (o.extra ?? '') +
    headGroup +
    (o.tilt ? g(acc, { transform: `rotate(${n(o.tilt)} ${hx} ${hy + 30})` }) : acc);
  return g(art, { transform: place(o.x, o.y, o.s ?? 1, o.flip) });
}

/* ------------------------------------------------------------------ Tilly the hopleaf */

export interface TillyOpts {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  mood?: Mood;
  look?: number;
  /** 'stand' (arms down), 'wave' (right arm up), 'hold' (both paws in front: draw `held` there), 'cheer' (both up). */
  pose?: 'stand' | 'wave' | 'hold' | 'cheer' | 'sit';
  /** Art in local units drawn between the paws (pose 'hold'); centre around (0, -34). */
  held?: string;
  bow?: string | false;
  /** Flower tucked by the ear (colour) — or false. */
  flower?: string | false;
  noShadow?: boolean;
}

export const TILLY = { coat: '#FFDCC2', line: '#D7926F', belly: '#FFF2E4', leaf: '#86D98F', leafLine: '#4FAF6A' };

export function tilly(o: TillyOpts): string {
  const { coat, line, belly, leaf, leafLine } = TILLY;
  const pose = o.pose ?? 'stand';
  const sw = 3.6;
  const sit = pose === 'sit';
  const by = sit ? -24 : -30;
  const hy = sit ? -64 : -72;

  const leafEar = (bx: number, rot: number, len = 54, w = 17): string => {
    const d = `M0 0C${w} ${-len * 0.3} ${w * 0.9} ${-len * 0.75} 0 ${-len}C${-w * 0.9} ${-len * 0.75} ${-w} ${-len * 0.3} 0 0Z`;
    const vein = `M0 -4L0 ${-len + 10}M0 ${-len * 0.35}l7 -8M0 ${-len * 0.35}l-7 -8M0 ${-len * 0.6}l6 -7M0 ${-len * 0.6}l-6 -7`;
    return g(path(d, leaf, stroke(leafLine, sw)) + path(d, lighten(leaf, 0.35), { transform: 'scale(0.55 0.8) translate(0 -8)', opacity: 0.8 }) + path(vein, 'none', stroke(leafLine, 2.2)), {
      transform: `translate(${bx} ${hy - 26}) rotate(${rot})`,
    });
  };

  const feet = sit
    ? ellipse(-16, -6, 13, 8, coat, stroke(line, sw)) + ellipse(16, -6, 13, 8, coat, stroke(line, sw)) + ellipse(-16, -6, 6, 4, P.pink, { opacity: 0.8 }) + ellipse(16, -6, 6, 4, P.pink, { opacity: 0.8 })
    : ellipse(-13, -5, 13, 7, coat, stroke(line, sw)) + ellipse(13, -5, 13, 7, coat, stroke(line, sw));
  const tail = puff(
    [
      [-27, by + 6, 9],
      [-32, by - 2, 7],
    ],
    '#FFFFFF',
    line,
    3,
  );
  const body = ellipse(0, by, 28, 27, coat, stroke(line, sw)) + ellipse(2, by + 4, 16, 16, belly) + shine(-14, by - 10, 8, 5, -30, 0.6);

  const arm = (ax: number, ay: number, rot: number): string => ellipse(ax, ay, 7.5, 12, coat, { ...stroke(line, sw), transform: `rotate(${rot} ${ax} ${ay})` });
  let arms = '';
  let armsFront = '';
  if (pose === 'stand' || sit) arms = arm(-25, by - 2, 18) + arm(25, by - 2, -18);
  else if (pose === 'wave') arms = arm(-25, by - 2, 18) + arm(30, by - 26, -150);
  else if (pose === 'cheer') arms = arm(-30, by - 26, 150) + arm(30, by - 26, -150);
  else if (pose === 'hold') armsFront = (o.held ?? '') + arm(-14, by - 4, -30) + arm(14, by - 4, 30);

  const head = circle(0, hy, 33, coat, stroke(line, sw)) + shine(-13, hy - 15, 9, 5.5, -35, 0.75);
  const tuft = path(`M-6 ${hy - 31}q2 -12 9 -10q-6 3 -2 9`, coat, stroke(line, 3));
  const faceArt = face({ x: 0, y: hy + 3, s: 0.82, mood: o.mood ?? 'happy', look: o.look ?? 0 });
  const nose = ellipse(0, hy + 8, 3, 2.2, P.rose);

  let acc = '';
  if (o.flower) acc += blossom(-22, hy - 22, 9, o.flower);
  if (o.bow) acc += bow(18, hy - 26, 13, o.bow, 14);

  const art =
    (o.noShadow ? '' : shadow(0, 1, 38, 7)) +
    leafEar(-13, -16) +
    leafEar(13, 16) +
    tail +
    feet +
    body +
    arms +
    head +
    tuft +
    faceArt +
    nose +
    armsFront +
    acc;
  return g(art, { transform: place(o.x, o.y, o.s ?? 1, o.flip) });
}

/* ------------------------------------------------------------------ Bo the bumbleberry */

export interface BoOpts {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  mood?: Mood;
  look?: number;
  rot?: number;
  /** Dotted flight trail behind Bo. */
  trail?: boolean;
  /** Art held below Bo (local units, centre around (0, 30)). */
  carry?: string;
}

export function bo(o: BoOpts): string {
  const body = P.lemon;
  const line = '#D9A13A';
  const stripe = '#B89BE8';
  const wing = (dir: 1 | -1) =>
    ellipse(dir * 22, -20, 17, 11, '#FFFFFF', { ...stroke('#9FCBF2', 3), opacity: 0.92, transform: `rotate(${dir * -32} ${dir * 22} -20)` }) +
    ellipse(dir * 17, -12, 11, 7, '#FFFFFF', { ...stroke('#9FCBF2', 2.6), opacity: 0.92, transform: `rotate(${dir * -8} ${dir * 17} -12)` }) +
    ellipse(dir * 24, -23, 7, 3.4, '#E3F2FF', { transform: `rotate(${dir * -32} ${dir * 24} -23)` });
  const antenna = (dir: 1 | -1) =>
    path(`M${dir * 7} -18Q${dir * 10} -32 ${dir * 16} -36`, 'none', stroke(P.ink, 2.6)) + circle(dir * 16.5, -37, 3.6, P.pinkDeep, stroke(P.ink, 1.6));
  const trail = o.trail
    ? path('M-34 6q-22 -14 -40 2t-38 -2', 'none', { ...stroke('#FFFFFF', 3), 'stroke-dasharray': '1 8', opacity: 0.95 })
    : '';
  const art =
    trail +
    wing(-1) +
    wing(1) +
    antenna(-1) +
    antenna(1) +
    (o.carry ?? '') +
    circle(0, 0, 21, body, stroke(line, 3.4)) +
    path('M-19.5 6Q0 15 19.5 6L18 12Q0 21 -18 12Z', stripe) +
    path('M-14.5 15Q0 22 14.5 15L11 19Q0 25 -11 19Z', stripe) +
    shine(-8, -10, 6, 4, -35, 0.8) +
    face({ x: 0, y: -4, s: 0.55, mood: o.mood ?? 'happy', look: o.look ?? 0, gap: 14 });
  return g(art, { transform: place(o.x, o.y, o.s ?? 1, o.flip, o.rot ?? 0) });
}
