/**
 * Frostlight Kingdom — the recurring cast.
 *
 *  - Pip   — a little apricot frost-fox with a fluffy white-tipped tail and a knitted scarf.
 *  - Pebble — a round periwinkle penguin who loves skating; bobble hat.
 *  - Luma  — a wise, cuddly snowy owl who carries a warm lantern.
 *  - Mochi — a dreamy seal pup with a bobble hat who pops up through ice holes.
 * Plus small friends: penguin chicks, snow bunnies and round snow-finches.
 *
 * Every character is drawn around its ground point (0,0) in local units and placed with
 * `place(x, y, s, flip)`. All faces come from the shared `face()`.
 */
import { P, circle, darken, ellipse, face, g, lighten, path, rect, shine, stroke } from '../../art/kit.ts';
import type { Mood } from '../../art/kit.ts';
import { F, lshadow, place } from './props.ts';

export interface CharOpts {
  s?: number;
  mood?: Mood;
  look?: number;
  flip?: boolean;
  /** Scarf colour, or false for none. */
  scarf?: string | false;
  /** Stripe colour on the scarf (or 'none'). */
  scarfStripe?: string;
  /** Hat colour, or false for none. */
  hat?: string | false;
  hatStripe?: string;
  pose?: 'stand' | 'wave' | 'hold' | 'cheer';
  /** Something held in front (already positioned in local coords, drawn over the body, under the arms). */
  holding?: string;
  shadow?: boolean;
}

/* ------------------------------------------------------------------ shared knitwear */

/** Knitted scarf around a neck centred on (0, y) with half-width hw; tail hangs on the right. */
function scarf(y: number, hw: number, color: string, stripe: string | undefined, tailSide: 1 | -1 = 1): string {
  const ln = darken(color, 0.32);
  const st = stripe === 'none' ? '' : stripe ?? lighten(color, 0.55);
  const tx = hw * 0.45 * tailSide;
  const tail = `M${tx - 8 * tailSide} ${y + 6}L${tx - 2 * tailSide} ${y + 40}L${tx + 15 * tailSide} ${y + 37}L${tx + 10 * tailSide} ${y + 2}Z`;
  return (
    path(tail, color, stroke(ln, 3.5)) +
    (st ? path(`M${tx - 4 * tailSide} ${y + 18}L${tx + 12 * tailSide} ${y + 16}M${tx - 3 * tailSide} ${y + 28}L${tx + 13 * tailSide} ${y + 26}`, 'none', stroke(st, 4)) : '') +
    path(`M${tx} ${y + 40}l-1 7M${tx + 6 * tailSide} ${y + 40}l0 7M${tx + 12 * tailSide} ${y + 38}l1 7`, 'none', stroke(ln, 2.6)) +
    path(`M${-hw} ${y - 6}Q0 ${y + 8} ${hw} ${y - 6}L${hw + 2} ${y + 6}Q0 ${y + 22} ${-hw - 2} ${y + 6}Z`, color, stroke(ln, 3.5)) +
    (st ? path(`M${-hw * 0.55} ${y + 1}L${-hw * 0.55} ${y + 12}M${-hw * 0.1} ${y + 4}V${y + 15}M${hw * 0.35} ${y + 3}V${y + 14}`, 'none', stroke(st, 4)) : '')
  );
}

/** Bobble hat sitting on a head whose top is at y, half-width hw. */
function bobbleHat(y: number, hw: number, color: string, stripe?: string): string {
  const ln = darken(color, 0.32);
  const st = stripe ?? lighten(color, 0.5);
  return (
    path(`M${-hw} ${y + 14}C${-hw} ${y - hw * 1.05} ${hw} ${y - hw * 1.05} ${hw} ${y + 14}Z`, color, stroke(ln, 3.5)) +
    path(`M${-hw * 0.6} ${y - 4}Q0 ${y - 14} ${hw * 0.6} ${y - 4}`, 'none', stroke(st, 5)) +
    rect(-hw - 5, y + 6, hw * 2 + 10, 16, 8, lighten(color, 0.45), stroke(ln, 3.5)) +
    circle(0, y - hw * 0.82, hw * 0.3, '#FFFFFF', stroke(ln, 3)) +
    shine(-hw * 0.1, y - hw * 0.9, hw * 0.1, hw * 0.06)
  );
}

/* ------------------------------------------------------------------ Pip the frost-fox */

const FOX = { fur: '#FFB98C', furLine: '#C9806A', cream: '#FFF4E8', paw: '#FFE2CC', ear: '#FFB8D0' };

/** Pip the frost-fox (≈ 175 tall at s = 1, tail to her left side). */
export function pip(x: number, y: number, o: CharOpts = {}): string {
  const s = o.s ?? 1;
  const L = FOX.furLine;
  const pose = o.pose ?? 'stand';
  let a = o.shadow === false ? '' : lshadow(6, 0, 56, 10, 0.24);
  // tail (sweeps up behind, to the left)
  const tail = 'M-14 -26C-56 -14 -84 -50 -74 -92C-68 -116 -44 -122 -40 -104C-38 -86 -54 -66 -30 -48Z';
  const tip = 'M-74 -92C-68 -116 -44 -122 -40 -104C-44 -96 -56 -92 -60 -84C-66 -82 -72 -86 -74 -92Z';
  a += path(tail, FOX.fur, stroke(L, 4)) + path(tip, FOX.cream) + path(tail, 'none', stroke(L, 4));
  a += path('M-62 -64C-66 -80 -62 -92 -56 -98', 'none', { ...stroke('#FFFFFF', 3.5), opacity: 0.6 });
  // feet
  a += ellipse(-15, -6, 13, 8, FOX.paw, stroke(L, 3.5)) + ellipse(15, -6, 13, 8, FOX.paw, stroke(L, 3.5));
  // body
  a += path('M-26 -8C-36 -40 -24 -74 0 -74C24 -74 36 -40 26 -8Q0 2 -26 -8Z', FOX.fur, stroke(L, 4));
  a += ellipse(0, -34, 16, 22, FOX.cream);
  if (o.holding) a += o.holding;
  // arms: stroked limbs from the shoulder to a cream paw
  const arm = (x0: number, y0: number, x1: number, y1: number, bend: number): string => {
    const mx = (x0 + x1) / 2 + bend;
    const my = (y0 + y1) / 2;
    const d = `M${x0} ${y0}Q${mx} ${my} ${x1} ${y1}`;
    return path(d, 'none', stroke(L, 18)) + path(d, 'none', stroke(FOX.fur, 11)) + circle(x1, y1, 7.5, FOX.paw, stroke(L, 3));
  };
  if (pose === 'wave') a += arm(-20, -60, -30, -34, -4) + arm(20, -62, 58, -110, 12);
  else if (pose === 'cheer') a += arm(-20, -62, -58, -110, -12) + arm(20, -62, 58, -110, 12);
  else if (pose === 'hold') a += arm(-20, -60, -8, -40, -8) + arm(20, -60, 8, -40, 8);
  else a += arm(-20, -60, -30, -34, -4) + arm(20, -60, 30, -34, 4);
  // scarf
  if (o.scarf !== false) a += scarf(-74, 30, o.scarf ?? P.pinkDeep, o.scarfStripe, 1);
  // ears
  for (const sx of [-1, 1]) {
    a += path(`M${sx * 40} -118Q${sx * 50} -160 ${sx * 36} -172Q${sx * 18} -156 ${sx * 12} -136Z`, FOX.fur, stroke(L, 4));
    a += path(`M${sx * 36} -126Q${sx * 42} -152 ${sx * 34} -160Q${sx * 24} -150 ${sx * 20} -136Z`, FOX.ear);
  }
  // head with cheek tufts
  a += path('M-40 -104C-42 -132 -20 -144 0 -144C20 -144 42 -132 40 -104L52 -94L36 -88C26 -70 -26 -70 -36 -88L-52 -94Z', FOX.fur, stroke(L, 4));
  a += path('M-50 -94L-36 -88C-26 -70 26 -70 36 -88L50 -94C34 -96 24 -100 0 -97C-24 -100 -34 -96 -50 -94Z', FOX.cream);
  a += path('M-8 -144Q0 -132 8 -144', 'none', { ...stroke(L, 3), opacity: 0.7 });
  a += shine(-20, -128, 11, 6, -25, 0.5);
  a += face({ x: 0, y: -112, s: 1, mood: o.mood ?? 'happy', look: o.look, gap: 17 });
  a += path('M-5 -104Q0 -100 5 -104Q5 -99 0 -97Q-5 -99 -5 -104Z', P.ink, stroke(P.ink, 2.4));
  if (o.hat) a += bobbleHat(-146, 30, o.hat, o.hatStripe);
  return place(a, x, y, s, o.flip);
}

/* ------------------------------------------------------------------ Pebble the penguin */

const PEN = { back: '#7F8FD9', line: '#55589E', belly: '#FFFDF8', beak: '#FFB47A', feet: '#FFAE7A' };

/** Pebble the penguin (≈ 130 tall at s = 1). */
export function pebble(x: number, y: number, o: CharOpts & { skates?: boolean } = {}): string {
  const s = o.s ?? 1;
  const L = PEN.line;
  const pose = o.pose ?? 'stand';
  let a = o.shadow === false ? '' : lshadow(0, 0, 50, 9, 0.24);
  // feet / skates
  if (o.skates) {
    a += path('M-34 6H-2M2 6H34', 'none', stroke('#9AA6C9', 4)) + path('M-34 6q-6 0 -6 -6M2 6q-6 0 -6 -6', 'none', stroke('#9AA6C9', 4));
    a += rect(-32, -12, 26, 14, 6, '#FFFFFF', stroke('#9AA6C9', 3)) + rect(6, -12, 26, 14, 6, '#FFFFFF', stroke('#9AA6C9', 3));
  } else a += ellipse(-16, -3, 14, 6.5, PEN.feet, stroke(darken(PEN.feet, 0.3), 3)) + ellipse(16, -3, 14, 6.5, PEN.feet, stroke(darken(PEN.feet, 0.3), 3));
  // flippers behind
  const flip = (sx: number, up: boolean) =>
    up
      ? path(`M${sx * 40} -70C${sx * 60} -86 ${sx * 70} -104 ${sx * 66} -116C${sx * 56} -108 ${sx * 44} -94 ${sx * 36} -82Z`, PEN.back, stroke(L, 3.5))
      : path(`M${sx * 44} -66C${sx * 62} -52 ${sx * 66} -32 ${sx * 58} -22C${sx * 50} -30 ${sx * 44} -44 ${sx * 40} -50Z`, PEN.back, stroke(L, 3.5));
  // body
  a += path('M0 -126C36 -126 52 -82 50 -46C48 -12 28 0 0 0C-28 0 -48 -12 -50 -46C-52 -82 -36 -126 0 -126Z', PEN.back, stroke(L, 4));
  a += path('M0 -106C10 -116 32 -112 32 -90C34 -70 38 -40 28 -16C20 -5 -20 -5 -28 -16C-38 -40 -34 -70 -32 -90C-32 -112 -10 -116 0 -106Z', PEN.belly);
  a += path('M-26 -30Q0 -14 26 -30', 'none', { ...stroke('#DCE0F7', 3), opacity: 0.8 });
  a += shine(-26, -108, 10, 6, -30, 0.45);
  if (o.holding) a += o.holding;
  a += flip(-1, pose === 'wave' || pose === 'cheer') + flip(1, pose === 'cheer');
  if (o.scarf) a += scarf(-60, 34, o.scarf, o.scarfStripe, -1);
  a += face({ x: 0, y: -88, s: 0.95, mood: o.mood ?? 'happy', look: o.look, gap: 15 });
  a += path('M-6 -86Q0 -84 6 -86L0 -78Z', PEN.beak, stroke(darken(PEN.beak, 0.3), 2.4));
  if (o.hat) a += bobbleHat(-128, 32, o.hat, o.hatStripe);
  return place(a, x, y, s, o.flip);
}

/* ------------------------------------------------------------------ Luma the snowy owl */

const OWL = { body: '#F6F3FF', line: '#9A8FD0', wing: '#DCD4FB', mark: '#B9AEE8', beak: '#FFC27A', feet: '#FFC27A' };

/** Luma the snowy owl (≈ 150 tall at s = 1). `holding` e.g. a lantern drawn in local coords. */
export function luma(x: number, y: number, o: CharOpts & { specs?: boolean; lanternLit?: boolean } = {}): string {
  const s = o.s ?? 1;
  const L = OWL.line;
  let a = o.shadow === false ? '' : lshadow(0, 0, 52, 9, 0.24);
  // feet
  a += path('M-22 -4l-6 6M-18 -4v8M-14 -4l6 6M14 -4l-6 6M18 -4v8M22 -4l6 6', 'none', stroke(darken(OWL.feet, 0.25), 3.5));
  // body
  a += path('M0 -150C44 -150 58 -100 56 -60C54 -18 34 -2 0 -2C-34 -2 -54 -18 -56 -60C-58 -100 -44 -150 0 -150Z', OWL.body, stroke(L, 4));
  // ear tufts
  a += path('M-38 -132L-44 -160L-20 -144Z', OWL.body, stroke(L, 3.5)) + path('M38 -132L44 -160L20 -144Z', OWL.body, stroke(L, 3.5));
  a += path('M-38 -132Q0 -146 38 -132', 'none', stroke(OWL.body, 6));
  // belly markings
  for (const [mx, my] of [
    [-16, -56],
    [0, -50],
    [16, -56],
    [-8, -36],
    [8, -36],
    [-20, -76],
    [20, -76],
  ] as const)
    a += path(`M${mx - 5} ${my - 3}L${mx} ${my + 2}L${mx + 5} ${my - 3}`, 'none', stroke(OWL.mark, 2.6));
  // face disc
  a += path('M0 -88C-10 -78 -44 -80 -44 -108C-44 -132 -16 -136 0 -122C16 -136 44 -132 44 -108C44 -80 10 -78 0 -88Z', '#FFFFFF', { ...stroke(OWL.mark, 2.6) });
  a += shine(-30, -136, 9, 5, -30, 0.6);
  if (o.holding) a += o.holding;
  // wings
  const pose = o.pose ?? 'stand';
  if (pose === 'wave' || pose === 'cheer')
    a += path('M-50 -80C-76 -96 -84 -122 -76 -134C-64 -122 -52 -110 -44 -100Z', OWL.wing, stroke(L, 3.5));
  else a += path('M-50 -92C-68 -76 -68 -40 -48 -24C-40 -40 -40 -70 -50 -92Z', OWL.wing, stroke(L, 3.5));
  if (pose === 'cheer') a += path('M50 -80C76 -96 84 -122 76 -134C64 -122 52 -110 44 -100Z', OWL.wing, stroke(L, 3.5));
  else if (pose === 'hold') a += path('M48 -92C66 -82 70 -60 58 -48C50 -60 44 -76 48 -92Z', OWL.wing, stroke(L, 3.5));
  else a += path('M50 -92C68 -76 68 -40 48 -24C40 -40 40 -70 50 -92Z', OWL.wing, stroke(L, 3.5));
  a += face({ x: 0, y: -108, s: 1.1, mood: o.mood ?? 'calm', look: o.look, gap: 19, blush: P.pink });
  a += path('M-5 -101L5 -101L0 -92Z', OWL.beak, stroke(darken(OWL.beak, 0.3), 2.4));
  if (o.specs) a += circle(-21, -108, 13, 'none', stroke(P.goldDeep, 2.6)) + circle(21, -108, 13, 'none', stroke(P.goldDeep, 2.6)) + path('M-8 -110Q0 -114 8 -110', 'none', stroke(P.goldDeep, 2.6));
  if (o.scarf) a += scarf(-84, 40, o.scarf, o.scarfStripe, 1);
  if (o.hat) a += bobbleHat(-148, 30, o.hat, o.hatStripe);
  return place(a, x, y, s, o.flip);
}

/* ------------------------------------------------------------------ Mochi the seal pup */

const SEAL = { body: '#D9DDF5', line: '#8D93C7', spot: '#C3C8EE', belly: '#F4F5FF' };

/** Mochi the seal pup. pose 'peek' draws only what shows above an ice hole at y. */
export function mochi(x: number, y: number, o: CharOpts & { peek?: boolean } = {}): string {
  const s = o.s ?? 1;
  const L = SEAL.line;
  let a = '';
  if (!o.peek) {
    a += o.shadow === false ? '' : lshadow(0, 0, 66, 9, 0.24);
    // tail flippers
    a += path('M40 -10C60 -4 74 -14 78 -26C66 -24 58 -22 50 -26Z', SEAL.body, stroke(L, 3.5)) + path('M40 -6C58 4 72 0 80 -8C68 -12 58 -12 48 -16Z', SEAL.body, stroke(L, 3.5));
    // body lying, head up
    a += path('M-40 -60C-46 -30 -40 -2 0 -2C30 -2 52 -6 50 -24C48 -40 20 -40 10 -60Z', SEAL.body, stroke(L, 4));
    a += path('M-30 -40C-32 -18 -20 -8 6 -8C-14 -16 -22 -28 -22 -44Z', SEAL.belly);
    a += circle(24, -22, 4, SEAL.spot) + circle(34, -14, 3, SEAL.spot) + circle(14, -14, 3, SEAL.spot);
    a += path('M-30 -20C-44 -12 -46 0 -36 2C-28 -4 -24 -12 -22 -18Z', SEAL.body, stroke(L, 3.5));
  } else {
    // flippers resting on the ice edge
    a += path('M-44 -6C-60 -10 -66 0 -58 6C-50 8 -44 4 -38 0Z', SEAL.body, stroke(L, 3.5)) + path('M44 -6C60 -10 66 0 58 6C50 8 44 4 38 0Z', SEAL.body, stroke(L, 3.5));
    a += path('M-40 4C-44 -30 -34 -50 -18 -56L18 -56C34 -50 44 -30 40 4Z', SEAL.body, stroke(L, 4));
    a += ellipse(0, -14, 22, 16, SEAL.belly);
  }
  // head
  const hy = o.peek ? -66 : -74;
  const hx = o.peek ? 0 : -18;
  a += circle(hx, hy, 38, SEAL.body, stroke(L, 4));
  a += circle(hx + 22, hy - 18, 4, SEAL.spot) + circle(hx + 28, hy - 6, 3, SEAL.spot);
  a += shine(hx - 16, hy - 20, 11, 6, -30, 0.6);
  // snout
  a += ellipse(hx - 9, hy + 12, 11, 8, SEAL.belly) + ellipse(hx + 9, hy + 12, 11, 8, SEAL.belly);
  a += face({ x: hx, y: hy - 6, s: 1, mood: o.mood ?? 'happy', look: o.look, gap: 16 });
  a += ellipse(hx, hy + 4, 6, 4, P.ink);
  a += circle(hx - 13, hy + 11, 1.6, L) + circle(hx - 8, hy + 14, 1.6, L) + circle(hx + 13, hy + 11, 1.6, L) + circle(hx + 8, hy + 14, 1.6, L);
  if (o.scarf) a += g(scarf(hy + 30, 30, o.scarf, o.scarfStripe, 1), { transform: `translate(${hx} 0)` });
  if (o.hat) a += g(bobbleHat(hy - 36, 27, o.hat, o.hatStripe), { transform: `translate(${hx} 0)` });
  return place(a, x, y, s, o.flip);
}

/* ------------------------------------------------------------------ small friends */

/** Fluffy penguin chick (≈ 50 tall at s = 1). */
export function chick(x: number, y: number, s = 1, o: { mood?: Mood; flip?: boolean; color?: string; hat?: string } = {}): string {
  const c = o.color ?? '#A9B4E6';
  const L = darken(c, 0.4);
  const a =
    lshadow(0, 0, 22, 4.5, 0.22) +
    ellipse(-8, -2, 7, 3.5, PEN.feet, stroke(darken(PEN.feet, 0.3), 2)) +
    ellipse(8, -2, 7, 3.5, PEN.feet, stroke(darken(PEN.feet, 0.3), 2)) +
    path('M0 -50C16 -50 24 -40 24 -24C24 -6 14 0 0 0C-14 0 -24 -6 -24 -24C-24 -40 -16 -50 0 -50Z', c, stroke(L, 3)) +
    path('M-2 -50Q2 -60 8 -56M-2 -50Q-6 -58 -10 -56', 'none', stroke(L, 2.4)) +
    ellipse(0, -16, 13, 12, '#EEF0FF') +
    path('M-22 -24C-30 -18 -30 -10 -24 -8', 'none', stroke(L, 3)) +
    path('M22 -24C30 -18 30 -10 24 -8', 'none', stroke(L, 3)) +
    face({ x: 0, y: -32, s: 0.55, mood: o.mood ?? 'happy', gap: 14, blush: P.pink }) +
    path('M-3.5 -29L3.5 -29L0 -24Z', PEN.beak, stroke(darken(PEN.beak, 0.3), 1.6)) +
    shine(-10, -40, 5, 3) +
    (o.hat ? path('M-12 -46Q0 -62 12 -46Z', o.hat, stroke(darken(o.hat, 0.3), 2.4)) + circle(0, -58, 4, '#FFFFFF', stroke(darken(o.hat, 0.3), 2)) : '');
  return place(a, x, y, s, o.flip);
}

/** Snow bunny (≈ 80 tall to the ear tips at s = 1). */
export function bunny(x: number, y: number, s = 1, o: { mood?: Mood; flip?: boolean; scarf?: string; earmuffs?: string; body?: boolean } = {}): string {
  const W = '#FFFFFF';
  const L = '#B3A6DE';
  let a = '';
  if (o.body !== false) a += lshadow(0, 0, 30, 5, 0.22) + path('M-22 0C-30 -10 -26 -36 0 -38C26 -36 30 -10 22 0Z', W, stroke(L, 3)) + circle(26, -10, 8, W, stroke(L, 3)) + ellipse(-10, -2, 8, 4.5, W, stroke(L, 2.6)) + ellipse(10, -2, 8, 4.5, W, stroke(L, 2.6));
  // ears
  a += ellipse(-10, -72, 7.5, 20, W, { ...stroke(L, 3), transform: 'rotate(-12 -10 -72)' }) + ellipse(-10, -72, 3.5, 13, P.pink, { transform: 'rotate(-12 -10 -72)' });
  a += ellipse(10, -72, 7.5, 20, W, { ...stroke(L, 3), transform: 'rotate(14 10 -72)' }) + ellipse(10, -72, 3.5, 13, P.pink, { transform: 'rotate(14 10 -72)' });
  a += circle(0, -44, 22, W, stroke(L, 3));
  a += shine(-9, -55, 6, 3.5);
  a += face({ x: 0, y: -46, s: 0.62, mood: o.mood ?? 'happy', gap: 15, blush: P.pink });
  a += ellipse(0, -42, 2.6, 2, P.pinkDeep);
  if (o.scarf) a += path('M-18 -26Q0 -18 18 -26L18 -20Q0 -12 -18 -20Z', o.scarf, stroke(darken(o.scarf, 0.3), 2.4)) + path('M8 -21L12 -8L18 -10L15 -23Z', o.scarf, stroke(darken(o.scarf, 0.3), 2.4));
  if (o.earmuffs) a += path('M-20 -56Q0 -78 20 -56', 'none', stroke(darken(o.earmuffs, 0.3), 3)) + circle(-21, -52, 7, o.earmuffs, stroke(darken(o.earmuffs, 0.3), 2.4)) + circle(21, -52, 7, o.earmuffs, stroke(darken(o.earmuffs, 0.3), 2.4));
  return place(a, x, y, s, o.flip);
}

/** Round snow-finch perched at (x, y) (feet point). */
export function snowFinch(x: number, y: number, s = 1, o: { color?: string; belly?: string; flip?: boolean; mood?: Mood; hat?: string } = {}): string {
  const c = o.color ?? '#B9A8F0';
  const L = darken(c, 0.35);
  const a =
    path('M-4 0v-6M4 0v-6', 'none', stroke(P.goldDeep, 2.4)) +
    path('M14 -18L32 -26L28 -14Z', c, stroke(L, 2.6)) +
    circle(0, -20, 18, c, stroke(L, 3)) +
    ellipse(-2, -13, 11, 9, o.belly ?? '#FFC9AE') +
    path('M4 -22C14 -22 16 -12 10 -8', 'none', stroke(L, 2.6)) +
    face({ x: -6, y: -26, s: 0.42, mood: o.mood ?? 'happy', gap: 13, blush: P.pink }) +
    path('M-21 -24L-28 -21L-21 -18Z', P.gold, stroke(P.goldDeep, 1.8)) +
    shine(-8, -32, 5, 3) +
    (o.hat ? path('M-12 -34Q0 -50 10 -36Z', o.hat, stroke(darken(o.hat, 0.3), 2)) + circle(-1, -46, 3, '#FFFFFF') : '');
  return place(a, x, y, s, o.flip);
}

/** Ice-hole for Mochi (an oval opening in the ice with a snowy rim). */
export function iceHole(x: number, y: number, rx: number, ry: number): string {
  return ellipse(x, y, rx + 8, ry + 6, '#FFFFFF', stroke(F.snowLine, 3)) + ellipse(x, y + 1, rx, ry, '#6FA6DA') + ellipse(x, y + 3, rx * 0.8, ry * 0.55, '#85BAE6') + path(`M${x - rx * 0.6} ${y}q${rx * 0.3} -4 ${rx * 0.6} 0`, 'none', { ...stroke('#FFFFFF', 2.4), opacity: 0.6 });
}
