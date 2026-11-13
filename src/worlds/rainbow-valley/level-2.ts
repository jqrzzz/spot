/**
 * Level 2 — Rainbow Bridge Crossing.
 * Story: Pomi trots over the rainbow bridge across Sparkle Stream while Tilly waves from the bank
 * and Mama Duck leads her ducklings underneath. Introduces counting (ducklings, stripes, birds).
 */
import type { Level, Point } from '../../core/types.ts';
import { P, circle, cloud, defs, g, linear, n, path, puff, rainbow, shine, sparkle, stroke, url } from '../../art/kit.ts';
import { bo, puffcorn, tilly } from './characters.ts';
import {
  bird,
  bush,
  candyTree,
  daisy,
  duck,
  duckling,
  farTree,
  frog,
  leapingFish,
  lilyPad,
  meadowDots,
  mushroom,
  puffCloud,
  reeds,
  ripple,
  sparkles,
  splash,
  tufts,
  tulip,
} from './props.ts';

/* ---- rainbow in the sky (5 or 6 stripes) */
const RB = { cx: 155, cy: 250, r: 140, band: 20 };
const stripePoint = (i: number): Point => {
  const rr = RB.r - RB.band / 2 - i * RB.band;
  const a = ((i % 2 === 0 ? 125 : 55) * Math.PI) / 180;
  return [Math.round(RB.cx + Math.cos(a) * rr), Math.round(RB.cy - Math.sin(a) * rr)];
};
const STRIPES_A = [0, 1, 2, 3, 4].map(stripePoint);
const STRIPES_B = [0, 1, 2, 3, 4, 5].map(stripePoint);

/* ---- ducklings (2 or 3) */
const DUCKLINGS: Point[] = [
  [532, 486],
  [576, 494],
];
const DUCKLING_3: Point = [620, 502];
const duckCount = (pts: Point[]): Point[] => pts.map(([x, y]) => [x - 6, y - 22]);

/* ---- birds (2 or 3) */
const BIRDS: Point[] = [
  [598, 104],
  [664, 74],
];
const BIRD_3: Point = [728, 112];

const RIVER =
  'M372 262C352 300 300 330 292 370C284 410 230 460 200 510C186 540 176 570 170 600L790 600C720 540 660 480 610 430C560 380 470 320 432 262Z';

/** Quadratic bridge curve point. */
const bq = (t: number, dy = 0): Point => {
  const A: Point = [232, 392];
  const C: Point = [405, 236];
  const B: Point = [578, 392];
  const u = 1 - t;
  return [u * u * A[0] + 2 * u * t * C[0] + t * t * B[0], u * u * A[1] + 2 * u * t * C[1] + t * t * B[1] + dy];
};

function rainbowBridge(): string {
  const curve = (dy: number) => `M232 ${392 + dy}Q405 ${236 + dy} 578 ${392 + dy}`;
  const stripes = P.rainbow.map((col, i) => path(curve(4 + i * 7.2), 'none', { stroke: col, 'stroke-width': 8 })).join('');
  const edge = path(curve(0), 'none', stroke('#FFFFFF', 5)) + path(curve(47), 'none', stroke('#B7A2E6', 4));
  const foot = (x: number) =>
    puff(
      [
        [x - 26, 398, 18],
        [x, 388, 24],
        [x + 26, 398, 18],
        [x, 404, 18],
      ],
      '#FFFFFF',
      '#C8D7F2',
      3.4,
    ) + shine(x - 10, 380, 9, 5);
  return stripes + edge + foot(232) + foot(578);
}

function bridgeRailing(): string {
  const curve = (dy: number) => `M232 ${392 + dy}Q405 ${236 + dy} 578 ${392 + dy}`;
  let posts = '';
  for (let i = 1; i < 10; i++) {
    const [x, y] = bq(i / 10);
    posts += path(`M${n(x)} ${n(y)}V${n(y - 24)}`, 'none', stroke('#FFFFFF', 6)) + circle(x, y - 27, 5.2, P.lemon, stroke(P.lemonDeep, 2.4));
  }
  return path(curve(-22), 'none', stroke('#FFFFFF', 5.5)) + path(curve(-22), 'none', { ...stroke('#CDB9F0', 1.6), opacity: 0.9 }) + posts;
}

export function drawBridge(c: { on(id: string): boolean; pick<T>(id: string, a: T, b: T): T }): string {
  const d = defs(
    linear('sky', [
      [0, '#B2DDFF'],
      [0.45, '#D9E2FF'],
      [0.75, '#F6E4FA'],
      [1, '#FFEFE6'],
    ]),
    linear('far', [
      [0, '#D4E9F4'],
      [1, '#C9E7DE'],
    ]),
    linear('land', [
      [0, '#B8EBB2'],
      [0.5, '#9FE09F'],
      [1, '#8AD48E'],
    ]),
    linear('water', [
      [0, '#D3F6FF'],
      [0.45, '#A8E6F7'],
      [1, '#7FD2EE'],
    ]),
    `<clipPath id="riverClip"><path d="${RIVER}"/></clipPath>`,
  );

  const stripeColors = c.on('rainbow') ? P.rainbow : P.rainbow.slice(0, 5);
  const sky =
    `<rect width="800" height="600" fill="${url('sky')}"/>` +
    puffCloud(330, 64, 0.85) +
    cloud(470, 132, 0.45, { opacity: 0.9 }) +
    puffCloud(40, 70, 0.6, '#FFFFFF', 0.85) +
    sparkles(23, { x: 280, y: 20, w: 260, h: 160 }, 5, '#FFFFFF', 8, 60) +
    rainbow(RB.cx, RB.cy, RB.r, RB.band, stripeColors) +
    (c.on('birds') ? [...BIRDS, BIRD_3] : BIRDS).map(([x, y], i) => bird(x, y, 1.18, ['#9CCBFF', '#FFB3CF', '#B8EBA6'][i], { wingUp: i % 2 === 0, mood: i === 1 ? 'joy' : 'happy' })).join('');

  const land =
    path('M0 256C60 250 140 252 210 254C300 228 400 232 470 250C560 226 680 228 800 246V330H0Z', url('far')) +
    farTree(300, 258, 0.7, '#F6C9DE') +
    farTree(330, 262, 0.55, '#D9CCFF') +
    farTree(512, 254, 0.7, '#FFE3A6') +
    farTree(548, 258, 0.55, '#C6E6FF') +
    farTree(36, 254, 0.6, '#D9CCFF') +
    farTree(760, 250, 0.68, '#F6C9DE') +
    path('M0 292C120 272 260 274 380 262L430 262C540 270 680 268 800 282V600H0Z', url('land')) +
    meadowDots(31, { x: 20, y: 300, w: 240, h: 60 }, 10, ['#FFFFFF', '#FFD3E6', '#FFF1A8'], 2.8, 28) +
    meadowDots(32, { x: 560, y: 300, w: 230, h: 60 }, 10, ['#FFFFFF', '#E2D6FF', '#FFF1A8'], 2.8, 28) +
    tufts(41, { x: 10, y: 310, w: 200, h: 260 }, 10, '#68C07A', 1, 44) +
    tufts(42, { x: 620, y: 310, w: 170, h: 200 }, 7, '#68C07A', 1, 44);

  const water =
    path(RIVER, 'none', { ...stroke('#FFF4DA', 12) }) +
    path(RIVER, url('water')) +
    g(
      // soft rainbow reflection of the bridge
      P.rainbow.map((col, i) => path(`M232 ${396 + i * 7.2}Q405 ${560 - i * 7.2} 578 ${396 + i * 7.2}`, 'none', { stroke: col, 'stroke-width': 7, opacity: 0.32 })).join('') +
        ripple(404, 300, 26) +
        ripple(330, 420, 34) +
        ripple(520, 420, 30) +
        ripple(280, 560, 40) +
        ripple(700, 580, 36) +
        ripple(470, 590, 30),
      { 'clip-path': url('riverClip') },
    ) +
    sparkle(352, 476, 6) +
    sparkle(560, 446, 7) +
    sparkle(640, 560, 6) +
    sparkle(250, 584, 6);

  const bridge = rainbowBridge();

  const leftBank =
    candyTree(92, 404, 0.95, '#FFC2DD', P.lemon) +
    bush(30, 470, 0.7, '#9EDF9C', '#FFFFFF', 8) +
    tilly({ x: 160, y: 470, s: 1.12, pose: 'wave', mood: 'joy', look: 1 }) +
    daisy(224, 424, 0.55, '#FFFFFF') +
    daisy(206, 446, 0.45, '#FFD3E6');

  const rightBank =
    candyTree(712, 392, 1.0, '#CDB8FF', '#FFC2DD') +
    bush(770, 448, 0.75, '#9EDF9C', '#FFD3E6', 4) +
    tulip(650, 400, 0.6, '#FFB0CC') +
    tulip(672, 404, 0.5, '#FFD95A');

  const pomi = puffcorn({ x: 398, y: 318, s: 0.8, mood: 'happy', look: 1, scarf: '#A8E6FF' });

  const lily =
    lilyPad(300, 458, 36) +
    (c.on('frog') ? frog(302, 456, 0.9, '#A4E8A0', 'happy') : '') +
    lilyPad(250, 520, 26, '#9BE0A0') +
    puff(
      [
        [244, 512, 7],
        [254, 512, 7],
        [249, 505, 7.5],
      ],
      '#FFC2DD',
      '#E58BB5',
      2.4,
    ) +
    circle(249, 510, 3, P.lemon);

  const ducks =
    duck(476, 476, 1.0, { hat: '#FFC2DD' }) +
    (c.on('ducklings') ? [...DUCKLINGS, DUCKLING_3] : DUCKLINGS).map(([x, y]) => duckling(x, y, 1.3)).join('');

  const fish = c.on('fish') ? splash(398, 566, 1.1) + leapingFish(378, 522, 1.05, '#FFB08F', '#FF8FB6', -28) + sparkle(430, 486, 7) + sparkle(344, 488, 5) : ripple(398, 566, 36);

  const air = bo({ x: 506, y: 232, s: 0.9, mood: 'happy', look: 1 }) + path('M470 236q-18 -12 -34 0t-30 2', 'none', { ...stroke('#FFFFFF', 3), 'stroke-dasharray': '1 8' });

  const foreground =
    g(mushroom(76, 584, 1.18, c.pick('mushroom', '#FF8C9E', '#86BFFF')) + mushroom(132, 592, 0.66, '#FFD27A')) +
    reeds(752, 604, 1.0, true) +
    reeds(640, 610, 0.7) +
    tulip(704, 600, 0.75, '#C9B2FF') +
    daisy(198, 598, 0.55, '#FFFFFF');

  return d + sky + land + water + bridge + bridgeRailing() + pomi + air + leftBank + rightBank + lily + ducks + fish + foreground;
}

export const level2: Level = {
  id: 'rv-2',
  title: 'Rainbow Bridge Crossing',
  findCount: 4,
  differences: [
    {
      id: 'fish',
      kind: 'add',
      theme: 'nature',
      hit: {
        type: 'poly',
        points: [
          [344, 472],
          [404, 452],
          [462, 474],
          [462, 582],
          [332, 582],
          [328, 522],
        ],
      },
      label: 'Fish or no fish?',
      say: 'Splash! A happy fish jumps out of the water.',
    },
    {
      id: 'mushroom',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'circle', cx: 76, cy: 534, r: 52 },
      label: 'Pink mushroom, blue mushroom',
      say: 'A pink mushroom… and a blue mushroom!',
    },
    {
      id: 'ducklings',
      kind: 'count',
      theme: 'counting',
      hit: { type: 'ellipse', cx: 580, cy: 478, rx: 86, ry: 52 },
      label: '2 ducklings and 3 ducklings',
      say: 'Two ducklings… and three ducklings!',
      count: { a: duckCount(DUCKLINGS), b: duckCount([...DUCKLINGS, DUCKLING_3]) },
    },
    {
      id: 'rainbow',
      kind: 'count',
      theme: 'colors',
      hit: { type: 'ellipse', cx: 155, cy: 190, rx: 102, ry: 72 },
      label: '5 stripes and 6 stripes',
      say: 'Five rainbow stripes… and six! The new one is purple.',
      count: { a: STRIPES_A, b: STRIPES_B },
    },
    // ---- extra candidates
    {
      id: 'frog',
      kind: 'add',
      theme: 'nature',
      hit: { type: 'circle', cx: 298, cy: 432, r: 44 },
      label: 'Frog or no frog?',
      say: 'A little frog is sitting on the lily pad!',
    },
    {
      id: 'birds',
      kind: 'count',
      theme: 'counting',
      hit: { type: 'ellipse', cx: 664, cy: 96, rx: 100, ry: 58 },
      label: '2 birds and 3 birds',
      say: 'Two birds… and three birds!',
      count: { a: BIRDS, b: [...BIRDS, BIRD_3] },
    },
  ],
  draw: drawBridge,
  sticker: {
    id: 'st-rv-2',
    name: 'Dabble the Duckling',
    draw: () => duckling(108, 150, 3.0),
  },
};
