/**
 * Level 4 — The Glowing Crystal Forest.
 * Luma lights the way with her lantern as Pip follows the sparkly path to the Crystal Arch,
 * crowned by a giant glowing snowflake. Frost butterflies flutter, bunnies peep at glowing
 * mushrooms, and icicles drip from the frosty cliff. Themes: symmetry and size.
 */
import type { Level, Point } from '../../core/types.ts';
import { P, circle, defs, ellipse, g, linear, path, rect, sparkle, stroke, url } from '../../art/kit.ts';
import { bunny, luma, pip } from './characters.ts';
import {
  F,
  aurora,
  butterfly,
  crystalCluster,
  crystalTree,
  fallingSnow,
  frostDefs,
  glow,
  icicle,
  lantern,
  lshadow,
  mushroom,
  skyStars,
  snowBank,
  snowflake,
} from './props.ts';

const BUNNIES: [number, number][] = [
  [498, 512],
  [548, 518],
];
const BUNNY_EXTRA: [number, number] = [598, 522];
const bunnyCentre = ([x, y]: [number, number]): Point => [x, y - 44];

/** Snow-capped lilac cliff with an overhanging ledge (icicles hang from y = 186). */
function cliff(): string {
  const rockL = '#7F78C4';
  return (
    path('M-10 440V176Q30 150 80 158Q140 140 214 168Q232 174 226 196Q214 236 232 270Q244 300 226 330Q212 360 236 392Q246 420 230 440Z', '#A9A2DE', stroke(rockL, 4)) +
    path('M226 200Q204 240 222 272Q232 300 214 330Q200 360 222 394Q228 418 216 440H170Q186 400 176 360Q168 320 184 290Q196 250 178 214Z', '#9790D4') +
    path('M20 236L60 256L50 300M120 230L150 270L132 320M40 340L90 360L76 410M150 360L180 390', 'none', { ...stroke(rockL, 3), opacity: 0.4 }) +
    path('M30 250Q40 290 34 330M100 250Q110 300 104 360', 'none', { ...stroke('#C7C1EE', 5), opacity: 0.6 }) +
    path('M-10 230Q60 214 120 226T224 220V196H-10Z', '#9C95D8', { opacity: 0.5 }) +
    // ledge underside
    path('M-10 186Q100 196 226 188L224 200Q100 210 -10 200Z', '#8E87CF') +
    // snow cap
    path('M-14 186Q-16 150 30 146Q90 128 150 138Q220 140 234 176Q238 196 220 194Q200 200 186 192Q168 202 150 192Q126 204 104 194Q80 204 60 194Q36 204 16 194Q-2 202 -14 186Z', url('fkSnow'), stroke(F.snowLine, 3.5)) +
    path('M20 156Q70 140 120 146', 'none', { ...stroke('#FFFFFF', 5), opacity: 0.9 })
  );
}

/** The Crystal Arch with a glowing magic doorway. */
function crystalArch(): string {
  const outer = 'M286 392V300A114 114 0 0 1 514 300V392H474V300A74 74 0 0 0 326 300V392Z';
  let s = path('M326 392V300A74 74 0 0 1 474 300V392Z', url('l4portal'));
  s += circle(400, 318, 70, url('fkGlowPink'), { opacity: 0.8 });
  s += sparkle(380, 300, 7) + sparkle(420, 344, 5) + sparkle(404, 270, 4);
  s += path(outer, url('fkIce'), stroke(F.iceLine, 4));
  // ice blocks
  for (const a of [200, 225, 250, 270, 290, 315, 340]) {
    const r1 = 74;
    const r2 = 114;
    const ca = Math.cos((a * Math.PI) / 180);
    const sa = Math.sin((a * Math.PI) / 180);
    s += path(`M${400 + ca * r1} ${300 + sa * r1}L${400 + ca * r2} ${300 + sa * r2}`, 'none', { ...stroke(F.iceLine, 2.6), opacity: 0.6 });
  }
  s += path('M286 340H326M286 368H326M474 340H514M474 368H514', 'none', { ...stroke(F.iceLine, 2.6), opacity: 0.6 });
  s += path('M296 300A104 104 0 0 1 330 222', 'none', { ...stroke('#FFFFFF', 5), opacity: 0.7 });
  // snow on the arch
  s += path('M300 230Q330 190 380 182Q440 178 478 204Q498 218 494 232Q470 214 440 212Q420 200 400 206Q370 200 350 214Q320 214 300 230Z', '#FFFFFF', stroke(F.snowLine, 3));
  // crystal feet
  s += crystalCluster(292, 396, 0.7, 'lilac') + crystalCluster(508, 396, 0.7, 'pink');
  return s;
}

export const level4: Level = {
  id: 'fk-4',
  title: 'The Glowing Crystal Forest',
  findCount: 5,
  differences: [
    {
      id: 'butterfly',
      kind: 'color',
      theme: 'symmetry',
      hit: { type: 'ellipse', cx: 650, cy: 120, rx: 82, ry: 66 },
      label: 'Matching wings, different wings',
      say: 'Both wings match… and now one wing is different!',
    },
    {
      id: 'mushroom',
      kind: 'size',
      theme: 'size',
      hit: { type: 'circle', cx: 712, cy: 506, r: 56 },
      label: 'Big mushroom, small mushroom',
      say: 'A big mushroom… and a small mushroom!',
    },
    {
      id: 'bunnies',
      kind: 'count',
      theme: 'counting',
      hit: { type: 'rect', x: 462, y: 432, w: 176, h: 108 },
      label: '2 bunnies and 3 bunnies',
      say: 'Two bunnies… and three bunnies!',
      count: { a: BUNNIES.map(bunnyCentre), b: [...BUNNIES, BUNNY_EXTRA].map(bunnyCentre) },
    },
    {
      id: 'icicle',
      kind: 'size',
      theme: 'size',
      hit: { type: 'rect', x: 108, y: 176, w: 66, h: 168 },
      label: 'Long icicle, short icicle',
      say: 'A long icicle… and a short icicle!',
    },
    {
      id: 'snowflake',
      kind: 'shape',
      theme: 'symmetry',
      hit: { type: 'circle', cx: 400, cy: 162, r: 82 },
      label: 'Matching arms, one short arm',
      say: 'All the snowflake arms match… but one is short!',
    },
    // replay extras
    {
      id: 'tree-tone',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'ellipse', cx: 690, cy: 282, rx: 94, ry: 66 },
      label: 'Blue tree and pink tree',
      say: 'A blue crystal tree… and a pink one!',
    },
    {
      id: 'hat',
      kind: 'add',
      theme: 'seasons',
      hit: { type: 'circle', cx: 262, cy: 386, r: 50 },
      label: 'Hat and no hat',
      say: 'Pip put on a warm hat!',
    },
  ],
  draw(c) {
    let s = defs(
      frostDefs(),
      linear('l4sky', [
        [0, '#7480D2'],
        [0.4, '#9D92E2'],
        [0.7, '#CDA8E8'],
        [0.9, '#F2C3DE'],
      ]),
      linear('l4ground', [
        [0, '#E9E4FF'],
        [0.5, '#DAD6F8'],
        [1, '#CAC8F2'],
      ]),
      linear('l4portal', [
        [0, '#FFE6F4'],
        [0.6, '#E8D8FF'],
        [1, '#CFE9FF'],
      ]),
      linear('l4path', [
        [0, '#F6F0FF'],
        [1, '#E2DAFB'],
      ]),
    );
    s += rect(0, 0, 800, 600, 0, url('l4sky'));
    s += skyStars(41, 30, { x: 20, y: 14, w: 760, h: 240 });
    s += aurora(
      'l4au1',
      [
        [-20, 70],
        [160, 40],
        [340, 86],
        [520, 46],
        [820, 80],
      ],
      90,
      ['#A8F0DC', '#C6B3FF'],
      0.5,
    );
    s += aurora(
      'l4au2',
      [
        [-20, 120],
        [200, 100],
        [420, 130],
        [640, 96],
        [820, 120],
      ],
      70,
      ['#FFC6E2', '#B9D8FF'],
      0.35,
    );

    // far forest: soft crystal trees
    s += g(crystalTree(220, 352, 150, 'blue', { glow: false, seed: 2 }) + crystalTree(560, 344, 170, 'lilac', { glow: false, seed: 3 }) + crystalTree(470, 330, 110, 'pink', { glow: false, seed: 4 }), { opacity: 0.55 });
    s += path('M0 352Q200 322 400 340T800 336V600H0Z', url('l4ground')) + path('M0 352Q200 322 400 340T800 336', 'none', { ...stroke('#A9A6E2', 3.5), opacity: 0.7 });

    // the arch + giant snowflake keystone
    s += crystalArch();
    s += circle(400, 162, 80, url('fkGlowLilac'), { opacity: 0.7 });
    s += snowflake(400, 162, 66, { color: '#EAF5FF', line: '#5B7DD2', width: 10, short: c.on('snowflake') ? [1] : [], glowId: false, tipColor: '#FFC6E2' });

    // path to the arch
    s += path('M350 600Q380 500 382 396H418Q420 500 470 600Z', url('l4path'), { opacity: 0.9 });
    s += sparkle(400, 430, 6) + sparkle(392, 500, 7) + sparkle(430, 560, 6) + sparkle(380, 580, 5);

    // the icicle cliff (left)
    s += cliff();
    s += icicle(46, 190, 88, 28) + icicle(92, 192, 62, 24) + icicle(140, 192, c.pick('icicle', 132, 46), 36) + icicle(188, 190, 74, 26);

    // the tone-changing crystal tree (right) with a steady glow behind it
    s += glow(690, 300, 110, 'fkGlowLilac', 0.7);
    s += crystalTree(690, 392, 150, c.pick('tree-tone', 'blue', 'pink'), { glow: false, seed: 8 });

    // frost butterfly (top right) and a small static one
    s += butterfly(650, 120, 1.05, { left: '#FFB0D6', right: c.pick('butterfly', '#FFB0D6', '#8FC8FF'), leftDots: '#FFF1F8', rightDots: c.pick('butterfly', '#FFF1F8', '#E6F4FF'), rot: -8 });
    s += butterfly(560, 250, 0.45, { left: '#BFE6FF', right: '#BFE6FF', rot: 14 });

    // crystal clusters and glowing mushrooms
    s += crystalCluster(250, 432, 0.7, 'blue') + crystalCluster(560, 418, 0.55, 'lilac');
    s += crystalCluster(334, 480, 0.5, 'pink') + crystalCluster(462, 470, 0.45, 'blue') + crystalCluster(40, 470, 0.8, 'pink');
    s += snowBank([
      [300, 520, 22],
      [324, 526, 18],
    ]);
    s += mushroom(648, 560, 0.7, '#C9B3FF') + mushroom(770, 566, 0.6, '#9FD8FF');
    s += glow(712, 520, 64, 'fkGlowPink', 0.8);
    s += mushroom(712, 552, c.pick('mushroom', 1.45, 0.8), '#FFB3CF');

    // bunnies peeping
    const bunnies = c.on('bunnies') ? [...BUNNIES, BUNNY_EXTRA] : BUNNIES;
    bunnies.forEach(([x, y], i) => (s += bunny(x, y, 0.92, { mood: i === 1 ? 'joy' : 'happy', flip: i === 0, earmuffs: i === 2 ? '#FFB0CF' : undefined })));

    // Luma lights the way, Pip follows
    s += luma(140, 556, { s: 1.0, pose: 'hold', mood: 'happy', scarf: '#B3EECB', holding: lantern(58, -92, 0.9, { color: '#9C86DA' }) });
    s += pip(262, 556, { s: 1.06, pose: 'wave', mood: 'surprised', scarf: P.pinkDeep, hat: c.on('hat') ? '#8FA8F0' : false, look: 1 });

    // foreground framing
    s += snowBank([
      [-10, 600, 44],
      [30, 612, 30],
    ]);
    s += crystalCluster(30, 596, 0.9, 'lilac');
    s += snowBank([
      [800, 596, 40],
    ]);
    s += lshadow(400, 596, 60, 6, 0.1);
    s += g(
      [
        [80, 300],
        [300, 230],
        [520, 200],
        [760, 220],
        [480, 300],
        [160, 470],
        [600, 380],
        [40, 410],
      ]
        .map(([x, y], i) => circle(x, y, 9, url('fkGlow')) + circle(x, y, 2.6, i % 2 ? '#FFF6C8' : '#FFE0F0'))
        .join(''),
    );
    s += fallingSnow(53, 16, { x: 20, y: 200, w: 760, h: 380 }, { big: 4, opacity: 0.8 });
    return s;
  },
  sticker: {
    id: 'st-fk-4',
    name: 'Frost Butterfly',
    draw: () => defs(frostDefs()) + glow(100, 104, 86, 'fkGlowPink', 0.9) + butterfly(100, 108, 1.32, { left: '#FFB0D6', right: '#FFB0D6', leftDots: '#FFF1F8', rightDots: '#FFF1F8', rot: -6 }) + sparkle(40, 56, 9) + sparkle(162, 150, 8),
  },
};
