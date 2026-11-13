/**
 * Level 1 — Apple Hill Picnic.
 * Story: Tilly brings Pomi a fresh apple from the big tree on Apple Hill while Bo buzzes over
 * their picnic. Big, bold changes: a blanket colour, a hot-air balloon, Pomi's bow.
 */
import type { Level, Point } from '../../core/types.ts';
import { P, cloud, defs, g, heart, linear, path, rainbow, sparkle, url } from '../../art/kit.ts';
import { bo, puffcorn, tilly } from './characters.ts';
import {
  apple,
  appleTree,
  basket,
  blanket,
  bush,
  butterfly,
  cupcake,
  daisy,
  farTree,
  glow,
  glowDef,
  hotAirBalloon,
  meadowDots,
  plate,
  puffCloud,
  sparkles,
  sun,
  teapot,
  tufts,
  tulip,
} from './props.ts';

const APPLES: Point[] = [
  [106, 160],
  [198, 120],
  [250, 196],
];
const APPLE_4: Point = [154, 222];

const BLANKET: [Point, Point, Point, Point] = [
  [282, 412],
  [552, 412],
  [590, 506],
  [246, 506],
];

export function drawAppleHill(c: { on(id: string): boolean; pick<T>(id: string, a: T, b: T): T }): string {
  const sky = defs(
    linear('sky', [
      [0, '#B6E0FF'],
      [0.5, '#DDE6FF'],
      [0.82, '#FFE7F1'],
      [1, '#FFF1E4'],
    ]),
    glowDef('sunGlow', '#FFF3B8', 0.9),
    linear('farHill', [
      [0, '#CDEFD9'],
      [1, '#BDE5CB'],
    ]),
    linear('hill', [
      [0, '#B4EBAE'],
      [1, '#8FD892'],
    ]),
    linear('front', [
      [0, '#A2E39E'],
      [1, '#86D18A'],
    ]),
  );

  const background =
    `<rect width="800" height="600" fill="${url('sky')}"/>` +
    glow(66, 64, 170, 'sunGlow') +
    sun(66, 64, 36, 'calm') +
    puffCloud(338, 64, 0.9, '#FFFFFF', 0.95) +
    cloud(712, 70, 0.55) +
    puffCloud(262, 168, 0.5, '#FFFFFF', 0.8) +
    sparkles(11, { x: 300, y: 20, w: 480, h: 130 }, 6, '#FFFFFF', 8, 70) +
    rainbow(612, 352, 228, 17, P.rainbow, 0.92) +
    // far hills with lollipop trees
    path('M0 318C90 292 170 300 250 316C360 280 470 286 560 306C650 286 740 290 800 300V420H0Z', url('farHill')) +
    farTree(392, 300, 0.8, '#F9C6DD') +
    farTree(420, 304, 0.62, '#D4C4FF') +
    farTree(612, 298, 0.75, '#C6E6FF') +
    farTree(706, 296, 0.62, '#F9C6DD') +
    farTree(740, 300, 0.8, '#FFE3A6') +
    // Apple Hill
    path('M0 318C80 288 220 288 330 330C460 378 620 372 800 352V600H0Z', url('hill')) +
    meadowDots(4, { x: 330, y: 360, w: 460, h: 40 }, 12, ['#FFFFFF', '#FFD3E6', '#FFF1A8'], 2.8, 32) +
    tufts(21, { x: 20, y: 330, w: 760, h: 200 }, 26, '#6CC37C', 1, 46);

  // ---- the balloon (difference)
  const balloon = c.on('balloon')
    ? hotAirBalloon(492, 116, 0.95, ['#FFB0CC', '#FFE69A', '#A9DCFF']) + sparkle(552, 82, 7) + sparkle(434, 160, 6)
    : '';

  const apples = c.on('apples') ? [...APPLES, APPLE_4] : APPLES;

  const tree = appleTree(170, 318, 0.92, [], 19) + apples.map(([x, y]) => apple(x, y, 27)).join('');

  // ---- picnic
  const picnic =
    blanket(BLANKET, c.pick('blanket', '#FF9DBE', '#86C5FF'), '#FFFDF7', 7, 4) +
    basket(330, 452, 0.95, P.lemon) +
    teapot(432, 436, 0.85, P.aqua) +
    plate(498, 472, 40) +
    cupcake(482, 476, 0.8, P.pink) +
    cupcake(514, 478, 0.8, P.lilac, P.lemon) +
    plate(396, 486, 26, '#FFFFFF', P.pink) +
    apple(396, 476, 13);

  const pomi = puffcorn({
    x: 668,
    y: 498,
    s: 1.3,
    flip: true,
    pose: 'sit',
    mood: 'joy',
    bow: c.on('bow') ? '#FF7FAE' : false,
    bowSize: 31,
  });

  const tillyArt = tilly({
    x: 214,
    y: 498,
    s: 1.28,
    pose: 'hold',
    mood: 'happy',
    look: 1,
    held: apple(0, -42, 14),
  });

  const foreground =
    path('M0 548C160 530 300 540 420 556C560 574 700 556 800 540V600H0Z', url('front')) +
    tufts(5, { x: 160, y: 556, w: 560, h: 34 }, 9, '#5DB46F', 1.1, 60) +
    // tulips (difference: colour)
    g(
      tulip(46, 588, 1.05, c.pick('tulips', '#FF8FB6', '#FFD95A'), -4) +
        tulip(88, 592, 1.25, c.pick('tulips', '#FF8FB6', '#FFD95A'), 3) +
        tulip(128, 590, 0.95, c.pick('tulips', '#FF8FB6', '#FFD95A'), 6),
    ) +
    bush(744, 596, 0.95, '#93DB93', '#FFFFFF', 3) +
    daisy(650, 592, 0.8, '#FFFFFF', P.lemon) +
    daisy(300, 594, 0.6, '#FFFFFF', P.lemon) +
    daisy(330, 598, 0.48, '#FFD3E6', P.lemon) +
    daisy(512, 596, 0.55, '#E2D6FF', P.lemon) +
    daisy(682, 596, 0.65, '#FFD3E6', P.lemon) +
    butterfly(178, 552, 0.5, P.lilac, 'dots', -16) +
    butterfly(610, 262, 0.42, '#FFC59E', 'dots', 18);

  const air =
    bo({ x: 408, y: 318, s: 1.05, flip: true, mood: 'joy', trail: false }) +
    path('M444 322q22 -16 40 -2t36 -4', 'none', { stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '1 8' }) +
    heart(612, 336, 7, '#FF8FB6') +
    heart(700, 318, 5.5, '#FFB3CF') +
    sparkle(586, 360, 7, '#FFFFFF');

  return sky + background + balloon + tree + picnic + tillyArt + pomi + air + foreground;
}

export const level1: Level = {
  id: 'rv-1',
  title: 'Apple Hill Picnic',
  findCount: 3,
  differences: [
    {
      id: 'blanket',
      kind: 'color',
      theme: 'colors',
      hit: {
        type: 'poly',
        points: [
          [270, 398],
          [566, 398],
          [606, 524],
          [228, 524],
        ],
      },
      label: 'Pink blanket, blue blanket',
      say: 'A pink blanket… and a blue blanket!',
    },
    {
      id: 'balloon',
      kind: 'add',
      theme: 'colors',
      hit: { type: 'circle', cx: 492, cy: 128, r: 74 },
      label: 'Balloon or no balloon?',
      say: 'Look! A hot-air balloon is floating by.',
    },
    {
      id: 'bow',
      kind: 'add',
      theme: 'matching',
      hit: { type: 'circle', cx: 690, cy: 358, r: 54 },
      label: 'Bow or no bow?',
      say: 'Pomi is wearing a pretty pink bow!',
    },
    // ---- extra candidates (replays)
    {
      id: 'apples',
      kind: 'count',
      theme: 'counting',
      hit: { type: 'ellipse', cx: 178, cy: 170, rx: 106, ry: 92 },
      label: '3 apples and 4 apples',
      say: 'Three apples… and four apples!',
      count: { a: APPLES, b: [...APPLES, APPLE_4] },
    },
    {
      id: 'tulips',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'rect', x: 18, y: 460, w: 140, h: 124 },
      label: 'Pink tulips, yellow tulips',
      say: 'Pink tulips… and yellow tulips!',
    },
  ],
  draw: drawAppleHill,
  sticker: {
    id: 'st-rv-1',
    name: 'Pomi the Puffcorn',
    draw: () => puffcorn({ x: 94, y: 168, s: 0.92, flip: true, pose: 'sit', mood: 'joy', bow: '#FF7FAE', bowSize: 24 }),
  },
};
