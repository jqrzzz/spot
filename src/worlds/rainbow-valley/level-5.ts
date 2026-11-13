/**
 * Level 5 — The Rainbow Festival.
 * Story: At sunset the whole valley gathers under the great rainbow. Pomi sings on the bandstand,
 * Tilly guards the festival cake, Minty holds the balloons and Bo carries a lantern. The richest
 * scene: counting, shapes, colours, music and "one more" details.
 */
import type { Level, Point } from '../../core/types.ts';
import { P, circle, defs, ellipse, heart, linear, n, path, rainbow, shadow, sparkle, star, stroke, url } from '../../art/kit.ts';
import { bo, bow, puffcorn, tilly } from './characters.ts';
import {
  CAKE_CANDLES,
  bird,
  bunting,
  daisy,
  farTree,
  festivalCake,
  firework,
  frog,
  glow,
  glowDef,
  lanternPost,
  meadowDots,
  moon,
  musicNote,
  paperLantern,
  partyBalloon,
  present,
  snail,
  sparkles,
  tufts,
  tulip,
} from './props.ts';

const CAKE = { x: 140, y: 478 };
const candlePts = (k: number): Point[] => CAKE_CANDLES.slice(0, k).map((dx) => [CAKE.x + dx, CAKE.y - 174] as Point);

const NOTES: Point[] = [
  [466, 340],
  [506, 306],
];
const NOTE_3: Point = [548, 340];

const MINTY = { coat: '#E8FFF3', line: '#6CC69A', mane: ['#FFE38F', '#FFB8D6', '#B3EECB'] as [string, string, string] };
const LEMONY = { coat: '#FFF8DC', line: '#DDB45C', mane: ['#A8D8FF', '#D8C6FF', '#FFC8E4'] as [string, string, string] };

function bandstand(topper: 'heart' | 'star'): { back: string; front: string } {
  const cx = 400;
  const baseY = 276;
  const apexY = 180;
  const left = 272;
  const right = 528;
  const floor =
    ellipse(cx, 440, 132, 24, '#FFF4FA', stroke('#D9A3C8', 3.4)) +
    ellipse(cx, 438, 104, 15, '#FFE7F2') +
    path(`M${cx - 132} 440V458A132 24 0 0 0 ${cx + 132} 458V440A132 24 0 0 1 ${cx - 132} 440Z`, '#FFC9E0', stroke('#D9A3C8', 3.4));
  let scallopFront = '';
  for (let i = 0; i < 11; i++) {
    const x = cx - 120 + i * 24;
    scallopFront += circle(x, 466, 6, i % 2 ? '#FFFFFF' : '#C9B2FF', stroke('#B79BE0', 1.6));
  }
  const post = (x: number, top: number, bottom: number, w: number, fill: string) => `<rect x="${n(x - w / 2)}" y="${top}" width="${w}" height="${bottom - top}" rx="${w / 2}" fill="${fill}" stroke="#C9A3C0" stroke-width="3"/>`;
  const backPosts = post(348, baseY, 434, 10, '#F4E6F0') + post(452, baseY, 434, 10, '#F4E6F0');
  const frontPosts = post(290, baseY, 452, 14, '#FFFFFF') + post(510, baseY, 452, 14, '#FFFFFF') + path('M290 300c0 -10 8 -18 16 -20M510 300c0 -10 -8 -18 -16 -20', 'none', stroke('#FFFFFF', 4));
  // striped roof cone
  let roof = '';
  const segs = 8;
  for (let i = 0; i < segs; i++) {
    const x0 = left + ((right - left) / segs) * i;
    const x1 = left + ((right - left) / segs) * (i + 1);
    roof += path(`M${cx} ${apexY}L${n(x0)} ${baseY}L${n(x1)} ${baseY}Z`, i % 2 ? '#FFFFFF' : '#FF9FC6');
  }
  let scallops = '';
  const sr = (right - left) / 20;
  for (let i = 0; i < 10; i++) {
    const x = left + sr + i * sr * 2;
    scallops += path(`M${n(x - sr)} ${baseY}A${n(sr)} ${n(sr)} 0 0 0 ${n(x + sr)} ${baseY}Z`, i % 2 ? '#FFFFFF' : '#FFC2DD', stroke('#E58BB5', 2.6));
  }
  const roofArt =
    roof +
    path(`M${cx} ${apexY}L${left} ${baseY}H${right}Z`, 'none', stroke('#E58BB5', 3.6)) +
    scallops +
    path(`M${cx - 30} ${apexY + 22}Q${cx - 50} ${apexY + 50} ${cx - 70} ${apexY + 76}`, 'none', { ...stroke('#FFFFFF', 4), opacity: 0.55 }) +
    path(`M${cx} ${apexY}V${apexY - 14}`, 'none', stroke(P.goldDeep, 4)) +
    (topper === 'heart'
      ? heart(cx, apexY - 32, 23, '#FF7FAE', stroke('#D9578C', 3.6)) + circle(cx - 8, apexY - 40, 3.6, '#fff', { opacity: 0.8 })
      : star(cx, apexY - 32, 27, P.lemon, { outline: P.lemonDeep, width: 4.4 }) + circle(cx - 6, apexY - 40, 3.6, '#fff', { opacity: 0.8 })) +
    paperLantern(290, 306, 0.7, '#FFE38F') +
    paperLantern(510, 306, 0.7, '#A8E6FF');
  return { back: floor + backPosts, front: scallopFront + frontPosts + roofArt };
}

export function drawFestival(c: { on(id: string): boolean; pick<T>(id: string, a: T, b: T): T }): string {
  const d = defs(
    linear('sky', [
      [0, '#B4C3FF'],
      [0.32, '#D9C6FF'],
      [0.6, '#FFC4DD'],
      [0.82, '#FFD7B9'],
      [1, '#FFE7B5'],
    ]),
    glowDef('sunGlow', '#FFF0B0', 0.95),
    linear('far', [
      [0, '#E6C3E6'],
      [1, '#D9B9E3'],
    ]),
    linear('ground', [
      [0, '#B7E3A6'],
      [0.5, '#A3D99D'],
      [1, '#90CE95'],
    ]),
  );

  const sky =
    `<rect width="800" height="600" fill="${url('sky')}"/>` +
    star(190, 44, 7, '#FFF6C9', { outline: '#FFF6C9', width: 2 }) +
    star(262, 104, 5, '#FFF6C9', { outline: '#FFF6C9', width: 2 }) +
    star(540, 46, 6, '#FFF6C9', { outline: '#FFF6C9', width: 2 }) +
    star(600, 150, 4.5, '#FFF6C9', { outline: '#FFF6C9', width: 2 }) +
    star(36, 170, 5, '#FFF6C9', { outline: '#FFF6C9', width: 2 }) +
    sparkles(57, { x: 150, y: 20, w: 460, h: 120 }, 6, '#FFFFFF', 7, 60) +
    moon(88, 80, 34, c.on('moon')) +
    (c.on('firework') ? firework(700, 96, 50, '#FF8FC0', '#FFD45E') : '') +
    // the great festival rainbow
    rainbow(400, 470, 382, 18, P.rainbow, 0.9) +
    glow(400, 352, 220, 'sunGlow') +
    circle(400, 352, 62, '#FFE79A', stroke('#FFD06B', 4)) +
    circle(400, 352, 48, '#FFF0B8', { opacity: 0.8 });

  const land =
    path('M0 364C90 344 190 350 280 362C380 340 480 342 560 360C660 342 740 346 800 352V420H0Z', url('far')) +
    farTree(60, 360, 0.6, '#F6C9DE') +
    farTree(640, 356, 0.6, '#D9CCFF') +
    farTree(668, 360, 0.45, '#FFE3A6') +
    path('M0 404C140 390 300 396 420 402C560 410 680 396 800 392V600H0Z', url('ground')) +
    meadowDots(81, { x: 20, y: 410, w: 760, h: 40 }, 14, ['#FFFFFF', '#FFD3E6', '#FFF1A8', '#E2D6FF'], 2.8, 34) +
    tufts(82, { x: 20, y: 470, w: 760, h: 110 }, 12, '#68B97A', 1, 56);

  const flagColors = ['#FF9FC6', '#FFE38F', '#A8E6FF', '#B8EBA6', '#D8C6FF'];
  const decorations = bunting(0, 196, 276, 280, 24, flagColors, 7) + bunting(524, 270, 800, 170, 20, flagColors, 7);

  const stand = bandstand(c.pick('topper', 'heart', 'star'));
  const pomi = puffcorn({ x: 404, y: 438, s: 0.88, mood: 'joy', look: 1, crown: true });
  const notes = (c.on('notes') ? [...NOTES, NOTE_3] : NOTES).map(([x, y], i) => musicNote(x, y, 1.55, ['#B79BFF', '#FF9FC6', '#8ED0FF'][i])).join('');

  // cake table (left)
  const cake =
    path('M56 476Q140 462 224 476L232 556Q140 572 48 556Z', '#FFFFFF', stroke('#D9A3C8', 3.4)) +
    path('M48 556Q60 568 72 556Q84 568 96 556Q108 568 120 556Q132 568 144 556Q156 568 168 556Q180 568 192 556Q204 568 216 556Q226 566 232 556', 'none', stroke('#FF9FC6', 5)) +
    ellipse(140, 476, 86, 16, '#FFF4FA', stroke('#D9A3C8', 3.4)) +
    festivalCake(CAKE.x, CAKE.y, 1.0, c.on('candles') ? 4 : 3);

  const tillyArt =
    tilly({ x: 262, y: 552, s: 1.06, flip: true, pose: 'cheer', mood: 'joy' }) +
    // party hat
    path('M250 438L274 438L262 404Z', '#A8E6FF', stroke('#5FB3DE', 2.8)) +
    path('M256 428L268 428M259 418L265 418', 'none', stroke('#FFFFFF', 3)) +
    circle(262, 402, 5, '#FF9FC6', stroke('#D9578C', 2));

  // Minty with balloons tied to her horn (right)
  const knot: Point = [651, 388];
  const balloon = (x: number, y: number, r: number, fill: string) => partyBalloon(x, y, r, fill, knot[0] - x, knot[1] - (y + r * 1.15));
  const minty =
    balloon(620, 318, 24, '#FFB8D6') +
    balloon(718, 326, 23, '#FFE38F') +
    balloon(670, 296, 27, c.pick('balloons', '#8EC5FF', '#8FE0A0')) +
    shadow(680, 550, 50, 8) +
    puffcorn({
      x: 680,
      y: 548,
      s: 1.0,
      flip: true,
      mood: 'joy',
      ...MINTY,
      bow: '#FF8FB8',
      bowSize: 17,
      noShadow: true,
      extra: c.on('bow') ? bow(-60, -64, 25, '#FF8FB8', 22) : '',
    });

  const lemony = puffcorn({ x: 578, y: 436, s: 0.52, flip: true, mood: 'happy', ...LEMONY, crown: true });

  const boArt = bo({ x: 296, y: 150, s: 0.85, mood: 'happy', look: 1, carry: paperLantern(0, 46, 0.62, '#FFB8D6') });

  let fireflies = '';
  const ff: Point[] = [
    [330, 520],
    [470, 500],
    [560, 560],
    [40, 430],
    [770, 430],
    [600, 470],
    [372, 578],
  ];
  for (const [x, y] of ff) fireflies += circle(x, y, 9, '#FFF6B0', { opacity: 0.35 }) + circle(x, y, 3.4, '#FFF3A0');

  const audience = frog(336, 572, 0.82, '#A4E8A0', 'joy') + bird(440, 556, 0.95, '#9CCBFF', { flip: true, mood: 'joy', wingUp: true }) + snail(500, 592, 0.7, '#FFB3CF', '#FFE4C4', 'happy');

  const foreground =
    audience +
    lanternPost(26, 604, 1.0, '#FFB8D6') +
    present(560, 590, 52, 40, '#A8E6FF', '#FF9FC6') +
    present(604, 594, 38, 30, '#FFE38F', '#B79BFF') +
    daisy(330, 604, 0.6, '#FFFFFF') +
    daisy(452, 606, 0.55, '#FFD3E6') +
    tulip(480, 606, 0.6, '#C9B2FF') +
    tulip(774, 606, 0.7, '#FFB0CC') +
    tulip(752, 606, 0.55, '#FFE38F') +
    fireflies;

  return d + sky + land + decorations + stand.back + pomi + stand.front + notes + lemony + cake + tillyArt + minty + boArt + foreground;
}

export const level5: Level = {
  id: 'rv-5',
  title: 'The Rainbow Festival',
  findCount: 5,
  differences: [
    {
      id: 'balloons',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'circle', cx: 670, cy: 300, r: 44 },
      label: 'Blue balloon, green balloon',
      say: 'A blue balloon… and a green balloon!',
    },
    {
      id: 'moon',
      kind: 'shape',
      theme: 'shapes',
      hit: { type: 'circle', cx: 88, cy: 80, r: 52 },
      label: 'Thin moon, round moon',
      say: 'A thin crescent moon… and a big round moon!',
    },
    {
      id: 'bow',
      kind: 'add',
      theme: 'matching',
      hit: { type: 'circle', cx: 738, cy: 484, r: 46 },
      label: 'One bow or two bows?',
      say: 'Minty has one bow… and two bows!',
    },
    {
      id: 'candles',
      kind: 'count',
      theme: 'counting',
      hit: { type: 'rect', x: 70, y: 266, w: 140, h: 116 },
      label: '3 candles and 4 candles',
      say: 'Three candles… and four candles!',
      count: { a: candlePts(3), b: candlePts(4) },
    },
    {
      id: 'firework',
      kind: 'add',
      theme: 'colors',
      hit: { type: 'circle', cx: 700, cy: 96, r: 66 },
      label: 'Firework or no firework?',
      say: 'Pop! A sparkly firework in the sky!',
    },
    // ---- extra candidates
    {
      id: 'topper',
      kind: 'shape',
      theme: 'shapes',
      hit: { type: 'circle', cx: 400, cy: 148, r: 44 },
      label: 'Heart or star on top?',
      say: 'A heart on top… and a star on top!',
    },
    {
      id: 'notes',
      kind: 'count',
      theme: 'music',
      hit: { type: 'ellipse', cx: 520, cy: 298, rx: 80, ry: 66 },
      label: '2 notes and 3 notes',
      say: 'Pomi sings two notes… and three notes!',
      count: { a: NOTES, b: [...NOTES, NOTE_3] },
    },
  ],
  draw: drawFestival,
  sticker: {
    id: 'st-rv-5',
    name: 'Bo the Bumbleberry',
    draw: () => bo({ x: 100, y: 80, s: 1.5, mood: 'joy', carry: paperLantern(0, 44, 0.62, '#FFB8D6') }) + sparkle(36, 60, 9, P.lemon) + sparkle(164, 132, 7, P.lemon),
  },
};
