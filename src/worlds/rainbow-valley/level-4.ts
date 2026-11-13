/**
 * Level 4 — Kite Day on Cloud-Puff Meadow.
 * Story: A breezy day! Pomi flies a kite tied to her little horn, Tilly flies hers, and Bo plays
 * hide-and-seek with a cloud. Themes: patterns, position (up/down, above/below) and direction.
 */
import type { Level } from '../../core/types.ts';
import { P, cloud, defs, linear, path, rainbow, shadow, sparkle, stroke, url } from '../../art/kit.ts';
import { bo, puffcorn, tilly } from './characters.ts';
import {
  bird,
  bush,
  cloudPuffPlant,
  daisy,
  dandelion,
  farTree,
  fence,
  kite,
  meadowDots,
  puffCloud,
  signpost,
  sparkles,
  swoosh,
  tufts,
  tulip,
  windmill,
} from './props.ts';

const MINTY = { coat: '#E8FFF3', line: '#6CC69A', mane: ['#FFE38F', '#FFB8D6', '#B3EECB'] as [string, string, string] };
const PINKF = '#FFAFCF';
const YELLOWF = '#FFE07A';

export function drawKiteDay(c: { on(id: string): boolean; pick<T>(id: string, a: T, b: T): T }): string {
  const d = defs(
    linear('sky', [
      [0, '#A9DBFF'],
      [0.5, '#D3E5FF'],
      [0.8, '#F1E6FF'],
      [1, '#FFEFF4'],
    ]),
    linear('far', [
      [0, '#CBEBDD'],
      [1, '#BDE6CF'],
    ]),
    linear('meadow', [
      [0, '#BDEDB0'],
      [0.6, '#A3E29E'],
      [1, '#8CD58E'],
    ]),
  );

  const sky =
    `<rect width="800" height="600" fill="${url('sky')}"/>` +
    cloud(330, 64, 0.62) +
    puffCloud(560, 54, 0.6, '#FFFFFF', 0.9) +
    swoosh(240, 60, 90) +
    swoosh(560, 210, 110) +
    swoosh(300, 230, 70, 0.7) +
    swoosh(40, 250, 80, 0.7) +
    sparkles(47, { x: 220, y: 90, w: 360, h: 120 }, 5, '#FFFFFF', 8, 70);

  // Bo plays above / below a little cloud
  const boY = c.pick('bo', 104, 206);
  const boCloud =
    bo({ x: 690, y: boY, s: 0.95, flip: true, mood: c.pick('bo', 'joy', 'wink'), look: -1 }) + puffCloud(690, 154, 0.95, '#FFF4FA');

  const land =
    // low cloud banks resting on the far hills (Cloud-Puff Meadow)
    puffCloud(120, 286, 1.2, '#FFFFFF', 0.95) +
    puffCloud(420, 280, 1.0, '#FFFFFF', 0.9) +
    puffCloud(650, 288, 1.3, '#FFFFFF', 0.95) +
    rainbow(560, 300, 70, 9, P.rainbow, 0.75) +
    path('M0 300C100 282 220 286 320 300C440 280 580 282 680 298C740 290 780 290 800 294V380H0Z', url('far')) +
    farTree(300, 300, 0.6, '#F9C6DD') +
    farTree(320, 304, 0.45, '#D4C4FF') +
    windmill(738, 330, 0.72) +
    path('M0 350C150 326 320 330 460 344C600 358 720 340 800 334V600H0Z', url('meadow')) +
    meadowDots(71, { x: 20, y: 360, w: 760, h: 60 }, 16, ['#FFFFFF', '#FFD3E6', '#FFF1A8', '#E2D6FF'], 3, 30) +
    tufts(72, { x: 20, y: 380, w: 760, h: 200 }, 18, '#68C07A', 1, 52) +
    cloudPuffPlant(330, 396, 0.9) +
    cloudPuffPlant(352, 404, 0.7) +
    cloudPuffPlant(620, 392, 0.85) +
    cloudPuffPlant(120, 452, 0.8);

  // kite strings first (behind kites and characters)
  const strings =
    path('M218 292Q216 200 150 136', 'none', stroke('#FFFFFF', 2.2)) +
    path('M218 292Q216 200 150 136', 'none', { ...stroke(P.inkSoft, 1.2), opacity: 0.6 }) +
    path('M532 400Q520 240 470 126', 'none', stroke('#FFFFFF', 2.2)) +
    path('M532 400Q520 240 470 126', 'none', { ...stroke(P.inkSoft, 1.2), opacity: 0.6 });

  const kites =
    kite(150, 132, 1.5, '#FF9FC6', c.pick('kite', 'stripes', 'dots'), [P.lemon, P.sky, P.lemon], -14, '#FFFFFF', 1) +
    kite(470, 118, 1.05, '#8FD3FF', 'zigzag', [P.pink, P.lemon, P.pink], 10, '#FFFFFF', -1);

  const middle =
    dandelion(76, 474, 1.0, c.on('dandelion')) +
    signpost(410, 470, 1.3, c.pick('sign', -1, 1) as 1 | -1, '#FFD9B0', rainbow(0, 9, 14, 3.6, P.rainbow.slice(0, 4))) +
    puffcorn({ x: 250, y: 470, s: 1.12, flip: true, mood: 'joy', look: 0.5 }) +
    tilly({ x: 572, y: 472, s: 1.1, flip: true, pose: 'wave', mood: 'happy', look: 1 }) +
    shadow(700, 568, 46, 8) +
    puffcorn({ x: 700, y: 566, s: 0.78, flip: c.pick('minty', true, false), mood: 'happy', ...MINTY, scarf: '#FFC2DD', noShadow: true });

  const flowerColors = [PINKF, YELLOWF, PINKF, c.pick('flowers', YELLOWF, PINKF), PINKF];
  const foreground =
    fence(20, 224, 584, 64) +
    bird(c.pick('bird', 156, 162), c.pick('bird', 500, 562), 1.0, '#9CCBFF', { mood: 'happy', flip: true }) +
    flowerColors.map((col, i) => daisy(290 + i * 52, 604, 1.15, col, P.lemon, 46, 8)).join('') +
    bush(800, 600, 0.8, '#97DB98', '#FFFFFF', 12) +
    tulip(580, 604, 0.7, '#C9B2FF') +
    tulip(604, 606, 0.55, '#FFB0CC') +
    sparkle(612, 452, 6);

  return d + sky + land + boCloud + strings + kites + middle + foreground;
}

export const level4: Level = {
  id: 'rv-4',
  title: 'Kite Day on Cloud-Puff Meadow',
  findCount: 5,
  differences: [
    {
      id: 'kite',
      kind: 'pattern',
      theme: 'patterns',
      hit: { type: 'circle', cx: 150, cy: 134, r: 76 },
      label: 'Stripy kite, spotty kite',
      say: 'A stripy kite… and a spotty kite!',
    },
    {
      id: 'sign',
      kind: 'direction',
      theme: 'left-right',
      hit: { type: 'rect', x: 336, y: 330, w: 148, h: 74 },
      label: 'Arrow left, arrow right',
      say: 'This arrow points left… and this one points right!',
    },
    {
      id: 'bo',
      kind: 'position',
      theme: 'position',
      hit: { type: 'ellipse', cx: 690, cy: 154, rx: 70, ry: 90 },
      label: 'Bee above or below cloud?',
      say: 'Bo the bee is above the cloud… and below the cloud!',
    },
    {
      id: 'bird',
      kind: 'position',
      theme: 'position',
      hit: { type: 'rect', x: 112, y: 468, w: 92, h: 116 },
      label: 'Bird up high, bird down low',
      say: 'The bird sits up on the fence… and down on the grass!',
    },
    {
      id: 'flowers',
      kind: 'pattern',
      theme: 'patterns',
      hit: { type: 'circle', cx: 446, cy: 552, r: 38 },
      label: 'Pink, yellow, pink… which?',
      say: 'Pink, yellow, pink, yellow… one flower broke the pattern!',
    },
    // ---- extra candidates
    {
      id: 'minty',
      kind: 'direction',
      theme: 'left-right',
      hit: { type: 'ellipse', cx: 700, cy: 500, rx: 72, ry: 76 },
      label: 'Minty looks left or right',
      say: 'Minty is looking one way… and the other way!',
    },
    {
      id: 'dandelion',
      kind: 'shape',
      theme: 'nature',
      hit: { type: 'circle', cx: 74, cy: 380, r: 54 },
      label: 'Flower or fluffy puff?',
      say: 'A yellow dandelion… and a fluffy seed puff!',
    },
  ],
  draw: drawKiteDay,
  sticker: {
    id: 'st-rv-4',
    name: 'Tilly the Hopleaf',
    draw: () => tilly({ x: 100, y: 184, s: 1.0, pose: 'cheer', mood: 'joy', flower: P.pink }),
  },
};
