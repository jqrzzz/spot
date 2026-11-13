/**
 * Level 3 — The Butterfly Garden.
 * Story: Tilly waters the sunflower while Pomi meets a big butterfly resting on a giant flower.
 * Themes: shapes (star/circle, stepping stones), size (sunflower), patterns & colours.
 */
import type { Level } from '../../core/types.ts';
import { P, circle, cloud, defs, ellipse, linear, path, puff, shine, sparkle, star, stroke, url } from '../../art/kit.ts';
import { blossom, bo, puffcorn, tilly } from './characters.ts';
import {
  butterfly,
  daisy,
  droplets,
  farTree,
  flowerPot,
  giantFlower,
  hedge,
  meadowDots,
  puffCloud,
  snail,
  sparkles,
  stone,
  sunflower,
  tufts,
  tulip,
  wateringCan,
} from './props.ts';

function gardenArch(top: string): string {
  const wood = '#FFF4E6';
  const wl = '#D9B79A';
  let lattice = '';
  for (let y = 214; y < 350; y += 22) lattice += `M322 ${y}l16 12M462 ${y}l16 12`;
  const vine: Array<[number, number, number]> = [];
  for (let a = 180; a >= 0; a -= 15) {
    const r = (a * Math.PI) / 180;
    vine.push([400 + Math.cos(r) * 70, 196 - Math.sin(r) * 70, 13]);
  }
  for (let y = 222; y <= 330; y += 27) vine.push([328, y, 11], [472, y + 12, 11]);
  const blooms = [
    [340, 152, P.pink],
    [372, 132, P.lemon],
    [428, 130, P.pink],
    [458, 150, P.sky],
    [330, 196, P.lilac],
    [470, 198, P.pink],
    [326, 252, P.pink],
    [474, 276, P.lemon],
    [330, 306, P.lemon],
    [470, 330, P.lilac],
  ] as Array<[number, number, string]>;
  return (
    rect2(318, 196, 22, 158, wood, wl) +
    rect2(460, 196, 22, 158, wood, wl) +
    path(lattice, 'none', stroke(wl, 2)) +
    path('M320 196A80 80 0 0 1 480 196L460 196A60 60 0 0 0 340 196Z', wood, stroke(wl, 3.4)) +
    puff(vine, P.leaf, P.grassDeep, 3.4) +
    path('M346 168q6 -6 12 -2M396 128q6 -6 12 -2M446 160q6 -6 12 -2M324 280q6 -6 12 -2M468 236q6 -6 12 -2', 'none', stroke(P.grassDeep, 2.4)) +
    blooms.map(([x, y, col]) => blossom(x, y, 9, col)).join('') +
    top
  );
}
function pebbles(): string {
  let out = '';
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const ly = 362 + t * 230;
    const lx = 372 - 12 * t - 60 * t * t + 8;
    const rx = 428 + 30 * t + 118 * t * t - 10;
    out += ellipse(lx + 6 * t, ly, 5 + 5 * t, 3 + 2.6 * t, i % 2 ? '#FFFFFF' : '#F4D8B8') + ellipse(rx - 4 * t, ly + 8, 4 + 5 * t, 2.6 + 2.4 * t, i % 2 ? '#F4D8B8' : '#FFFFFF');
  }
  return out;
}
const rect2 = (x: number, y: number, w: number, h: number, fill: string, l: string): string =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${l}" stroke-width="3.4" stroke-linejoin="round"/>`;

export function drawGarden(c: { on(id: string): boolean; pick<T>(id: string, a: T, b: T): T }): string {
  const d = defs(
    linear('sky', [
      [0, '#BCE2FF'],
      [0.55, '#E9E2FF'],
      [1, '#FFEAF0'],
    ]),
    linear('far', [
      [0, '#D2EEDC'],
      [1, '#C2E8CF'],
    ]),
    linear('lawn', [
      [0, '#B2E8A8'],
      [1, '#90D88E'],
    ]),
    linear('path', [
      [0, '#FFF2DC'],
      [1, '#FFE2C2'],
    ]),
  );

  const sky =
    `<rect width="800" height="600" fill="${url('sky')}"/>` +
    puffCloud(160, 70, 0.95) +
    cloud(640, 62, 0.6) +
    puffCloud(540, 140, 0.5, '#FFFFFF', 0.85) +
    sparkles(37, { x: 200, y: 20, w: 520, h: 110 }, 6, '#FFFFFF', 8, 70) +
    // distant hills seen through the arch
    path('M0 300C120 270 260 276 360 290C440 262 560 266 640 284C720 270 770 274 800 280V360H0Z', url('far')) +
    farTree(400, 300, 0.75, '#F9C6DD') +
    farTree(432, 296, 0.55, '#D4C4FF') +
    farTree(372, 298, 0.5, '#FFE3A6');

  const starTop = c.on('star')
    ? circle(400, 100, 25, '#8EC3FF', stroke('#5B95E6', 4.4)) + shine(392, 91, 8, 5)
    : star(400, 102, 30, P.lemon, { outline: P.lemonDeep, width: 5 }) + shine(392, 92, 6, 4);

  const garden =
    hedge(-10, 300, 352, 78, '#9ADBA6', 4, '#FFC2DD') +
    hedge(500, 810, 352, 78, '#9ADBA6', 9, '#FFC2DD') +
    path('M0 344H800V600H0Z', url('lawn')) +
    meadowDots(51, { x: 20, y: 356, w: 280, h: 30 }, 12, ['#FFC2DD', '#FFFFFF', '#FFE38F', '#CDB8FF'], 4, 22) +
    meadowDots(52, { x: 500, y: 356, w: 280, h: 30 }, 12, ['#FFC2DD', '#FFFFFF', '#FFE38F', '#CDB8FF'], 4, 22) +
    path('M372 350C360 420 330 500 300 600L580 600C520 500 450 420 428 350Z', url('path')) +
    path('M372 350C360 420 330 500 300 600M428 350C450 420 520 500 580 600', 'none', stroke('#F2D3AE', 3)) +
    tufts(61, { x: 20, y: 380, w: 260, h: 200 }, 9, '#68C07A', 1, 50) +
    tufts(62, { x: 560, y: 380, w: 220, h: 200 }, 8, '#68C07A', 1, 50) +
    gardenArch(starTop) +
    // stepping stones (shapes)
    pebbles() +
    stone(398, 366, 40, 'circle', '#FFC2DD') +
    stone(404, 398, 52, 'square', '#AEDCFF') +
    stone(414, 440, 66, 'heart', '#D9C8FF') +
    stone(428, 502, 88, c.pick('stone', 'triangle', 'square'), '#FFE38F') +
    stone(448, 584, 116, 'circle', '#A8E6E0');

  const left =
    giantFlower(282, 384, 262, 262, 34, '#FFB8D6', P.lemon, 6) +
    sunflower(112, 476, 296, c.on('sunflower') ? 30 : 46, 4, 'joy') +
    tilly({
      x: 238,
      y: 480,
      s: 1.14,
      flip: true,
      pose: 'hold',
      mood: 'happy',
      held: wateringCan(6, -16, 0.9, c.pick('can', '#86C8FF', '#FF8FB8')),
    }) +
    droplets(172, 424, 0.95) +
    bo({ x: 222, y: 140, s: 0.85, flip: true, mood: 'happy', trail: true });

  const right =
    giantFlower(522, 384, 534, 268, 30, '#FFD3A8', '#FFF1A8', 6) +
    giantFlower(694, 486, 652, 270, 52, '#C9B2FF', P.lemon, 6) +
    butterfly(652, 192, 1.55, '#FF9FC6', c.pick('butterfly', 'dots', 'stripes'), -4, '#FFF4A8') +
    puffcorn({ x: 560, y: 496, s: 1.04, mood: 'love', look: 1, tilt: -8 }) +
    sparkle(604, 300, 8) +
    sparkle(706, 150, 7);

  const foreground =
    flowerPot(50, 594, 0.85, '#F7A98A', P.pink) +
    flowerPot(112, 598, 1.0, '#F7A98A', P.lilac) +
    (c.on('snail') ? snail(716, 562, 1.15, '#FFB3CF') : '') +
    daisy(626, 598, 0.62, '#FFFFFF') +
    daisy(780, 596, 0.7, '#FFD3E6') +
    tulip(276, 602, 0.6, '#FFB0CC') +
    tulip(250, 600, 0.5, '#CDB8FF') +
    butterfly(310, 196, 0.42, '#A8E6FF', 'hearts', -18) +
    butterfly(760, 330, 0.4, '#FFE38F', 'dots', 14) +
    butterfly(150, 320, 0.36, '#C9B2FF', 'dots', 10);

  return d + sky + garden + left + right + foreground;
}

export const level3: Level = {
  id: 'rv-3',
  title: 'The Butterfly Garden',
  findCount: 4,
  differences: [
    {
      id: 'star',
      kind: 'shape',
      theme: 'shapes',
      hit: { type: 'circle', cx: 400, cy: 100, r: 46 },
      label: 'Yellow star, blue circle',
      say: 'A yellow star… and a blue circle!',
    },
    {
      id: 'butterfly',
      kind: 'pattern',
      theme: 'patterns',
      hit: { type: 'circle', cx: 652, cy: 188, r: 76 },
      label: 'Spots or stripes?',
      say: 'This butterfly has spots… and this one has stripes!',
    },
    {
      id: 'sunflower',
      kind: 'size',
      theme: 'size',
      hit: { type: 'circle', cx: 116, cy: 180, r: 70 },
      label: 'Big sunflower, small sunflower',
      say: 'A big sunflower… and a small sunflower!',
    },
    {
      id: 'can',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'circle', cx: 212, cy: 432, r: 50 },
      label: 'Blue can, pink can',
      say: 'A blue watering can… and a pink one!',
    },
    // ---- extra candidates
    {
      id: 'stone',
      kind: 'shape',
      theme: 'shapes',
      hit: { type: 'ellipse', cx: 428, cy: 504, rx: 64, ry: 40 },
      label: 'Triangle stone, square stone',
      say: 'A triangle stone… and a square stone!',
    },
    {
      id: 'snail',
      kind: 'add',
      theme: 'nature',
      hit: { type: 'ellipse', cx: 714, cy: 522, rx: 64, ry: 56 },
      label: 'Snail or no snail?',
      say: 'A slow little snail came to visit!',
    },
  ],
  draw: drawGarden,
  sticker: {
    id: 'st-rv-3',
    name: 'Spotty Butterfly',
    draw: () => butterfly(100, 104, 1.9, '#FF9FC6', 'dots', -6, '#FFF4A8') + sparkle(38, 46, 10, P.lemon) + sparkle(166, 160, 8, P.lemon),
  },
};
