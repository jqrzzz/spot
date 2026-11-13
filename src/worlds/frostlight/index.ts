/**
 * Frostlight Kingdom — world definition.
 *
 * A pastel-blue winter kingdom of ice castles, glowing crystal trees and cosy snow villages.
 * Recurring friends: Pip the frost-fox, Pebble the penguin, Luma the snowy owl and Mochi the
 * seal pup (see characters.ts). Learning themes: seasons, weather, shapes, symmetry, counting
 * and simple observations about nature.
 */
import type { World } from '../../core/types.ts';
import { P, circle, darken, defs, ellipse, face, g, linear, n, path, polar, radial, range, rect, sparkle, star, stroke, url } from '../../art/kit.ts';
import { bunny, chick, luma, mochi, pebble, pip } from './characters.ts';
import {
  F,
  aurora,
  castle,
  cottage,
  crystalCluster,
  crystalTree,
  fallingSnow,
  farPine,
  frostDefs,
  lantern,
  moon,
  mountains,
  pine,
  skyStars,
  sled,
  snowBank,
  snowflake,
  snowman,
} from './props.ts';
import { level1 } from './level-1.ts';
import { level2 } from './level-2.ts';
import { level3 } from './level-3.ts';
import { level4 } from './level-4.ts';
import { level5 } from './level-5.ts';

/* ------------------------------------------------------------------ cover */

function cover(): string {
  let s = defs(
    frostDefs(),
    linear('cvSky', [
      [0, '#8F9AE4'],
      [0.32, '#B6A8EE'],
      [0.56, '#EEBEDF'],
      [0.72, '#FFD8CC'],
    ]),
    linear('cvHill', [
      [0, '#F4F2FF'],
      [1, '#DCD9F7'],
    ]),
    linear('cvFront', [
      [0, '#FFFFFF'],
      [0.5, '#F2EEFF'],
      [1, '#DCD6F6'],
    ]),
    radial('cvCastleGlow', [
      [0, '#FFF4E0', 0.95],
      [0.45, '#FFD9EC', 0.5],
      [1, '#E8D4FF', 0],
    ]),
  );
  s += rect(0, 0, 800, 600, 0, url('cvSky'));
  s += skyStars(5, 40, { x: 14, y: 10, w: 772, h: 240 });
  s += aurora(
    'cvAu1',
    [
      [-20, 76],
      [160, 34],
      [360, 90],
      [560, 30],
      [820, 70],
    ],
    130,
    ['#A4F2DA', '#C6B3FF'],
    0.55,
  );
  s += aurora(
    'cvAu2',
    [
      [-20, 140],
      [220, 110],
      [440, 150],
      [640, 104],
      [820, 136],
    ],
    90,
    ['#FFC6E3', '#B4DAFF'],
    0.42,
  );
  // moon with a sleepy smile
  s += moon(104, 92, 44, true, '') + face({ x: 104, y: 92, s: 0.9, mood: 'sleepy', blush: '#FFB3A6' });

  // distant mountains + castle on its hill
  s += mountains(
    [
      [70, 236, 150],
      [250, 222, 140],
      [580, 226, 150],
      [760, 214, 140],
    ],
    330,
    '#C9C2EE',
    '#F4F1FF',
  );
  s += circle(420, 210, 240, url('cvCastleGlow'));
  s += path('M150 352Q290 296 420 300Q560 296 690 352Z', url('cvHill'));
  s += castle(420, 324, 0.7, { flags: ['#FFB8D6', '#FFE07A', '#B3EECB'] });
  for (const [x, h] of [
    [178, 46],
    [204, 60],
    [232, 42],
    [606, 44],
    [632, 58],
    [660, 40],
  ] as const)
    s += farPine(x, 346, h, '#9AA6DE', '#F1EEFF');

  // floating giant snowflakes
  s += snowflake(212, 222, 30, { color: '#FFFFFF', line: '#7E9BE0', width: 5, glowId: 'fkGlowBlue', tipColor: '#FFD3EA' });
  s += snowflake(636, 178, 24, { color: '#FFFFFF', line: '#9C86DA', width: 4.5, rot: 12, glowId: 'fkGlowLilac', tipColor: '#CFE9FF' });
  s += snowflake(560, 84, 16, { color: '#FFFFFF', line: '#7E9BE0', width: 3.5, rot: 20, glowId: 'fkGlowBlue' });

  // snowfield with a winding sparkly path to the castle gate
  s += path('M0 372Q200 340 420 360T800 356V600H0Z', url('fkSnow')) + path('M0 372Q200 340 420 360T800 356', 'none', { ...stroke(F.snowLine, 3.5), opacity: 0.6 });
  s += path('M404 324Q390 360 430 384Q480 412 400 444Q330 472 380 520Q410 548 400 600H470Q480 548 452 520Q412 480 470 452Q548 416 470 380Q438 360 436 324Z', '#ECE6FF', { opacity: 0.85 });
  s += sparkle(430, 400, 6) + sparkle(400, 470, 7) + sparkle(440, 560, 6);

  // crystal trees + cottages at the sides
  s += crystalTree(90, 440, 230, 'pink', { seed: 21 }) + crystalTree(724, 432, 210, 'blue', { seed: 22 });
  s += cottage(196, 400, 0.46, { wall: '#FFD3C2', roof: '#B7A3F0' }) + cottage(640, 398, 0.44, { wall: '#C9EEDC', roof: '#F6B3D3' });

  // foreground drift where the friends gather
  s += path('M0 470Q160 444 320 470T620 468T800 460V600H0Z', url('cvFront')) + path('M0 470Q160 444 320 470T620 468T800 460', 'none', { ...stroke(F.snowLine, 4), opacity: 0.75 });
  s += ellipse(420, 560, 260, 26, url('fkGlow'), { opacity: 0.35 });
  s += sled(470, 590, 0.9, '#F07C96');
  s += pip(286, 566, { s: 1.32, pose: 'cheer', mood: 'joy', scarf: P.pinkDeep, look: 1 });
  s += pebble(452, 562, { s: 1.2, pose: 'wave', mood: 'joy', hat: '#6DD3A8', scarf: '#FFD66B' });
  s += luma(606, 566, { s: 1.14, pose: 'hold', mood: 'happy', specs: true, scarf: '#B3EECB', holding: lantern(56, -92, 0.9, { color: '#9C86DA' }) });
  s += chick(372, 586, 0.8, { mood: 'joy', hat: '#FF9DBB' }) + bunny(700, 584, 0.78, { mood: 'happy', flip: true, earmuffs: '#9CC9FF' });

  // framing corners: Mochi in the snow (left), pines + crystals (right)
  s += pine(-6, 520, 250, { shadow: false }) + pine(808, 528, 260, { shadow: false });
  s += snowBank([
    [40, 600, 60],
    [110, 616, 40],
  ]);
  s += mochi(124, 590, { s: 0.92, mood: 'joy', hat: '#FFCF5C', flip: true });
  s += snowBank([[770, 604, 54]]);
  s += crystalCluster(756, 590, 0.85, 'lilac');
  s += fallingSnow(9, 30, { x: 10, y: 10, w: 780, h: 560 }, { big: 5, opacity: 0.85 });
  return s;
}

/* ------------------------------------------------------------------ map backdrop (1200×800) */

function mapArt(): string {
  let s = defs(
    frostDefs(),
    linear('mpSky', [
      [0, '#B4C4F4'],
      [0.18, '#D6D2F8'],
      [0.32, '#F3E2F6'],
      [0.45, '#F4F6FF'],
      [1, '#E6E8FB'],
    ]),
    linear('mpSnow', [
      [0, '#F7F8FF'],
      [1, '#E9EAFB'],
    ]),
  );
  s += rect(0, 0, 1200, 800, 0, url('mpSky'));
  s += skyStars(71, 24, { x: 20, y: 10, w: 1160, h: 140 });
  s += aurora(
    'mpAu',
    [
      [-20, 40],
      [300, 10],
      [600, 50],
      [900, 12],
      [1220, 40],
    ],
    110,
    ['#AEF0DC', '#C6B3FF'],
    0.45,
  );
  s += moon(1086, 70, 34, false, '');
  // far mountains + small castle at the top centre (soft)
  s += mountains(
    [
      [100, 150, 160],
      [330, 130, 170],
      [880, 136, 170],
      [1110, 150, 160],
    ],
    250,
    '#D4D2F4',
    '#FAFAFF',
  );
  s += g(castle(600, 240, 0.42, { flags: ['#FFB8D6', '#FFE07A', '#B3EECB'] }), { opacity: 0.9 });
  // calm snowfield (centre band stays quiet)
  s += path('M0 250Q300 220 600 244T1200 240V800H0Z', url('mpSnow'));
  s += path('M0 250Q300 220 600 244T1200 240', 'none', { ...stroke('#C9CDEE', 3), opacity: 0.6 });
  s += path('M300 470Q420 440 540 470M640 360Q760 330 880 360M360 640Q480 610 600 640', 'none', { ...stroke('#DADCF5', 5), opacity: 0.8 });
  s += g(
    [
      [520, 400],
      [700, 520],
      [480, 560],
      [760, 300],
      [420, 320],
    ]
      .map(([x, y]) => sparkle(x, y, 7, '#FFFFFF', 0.9))
      .join(''),
  );

  // left edge: crystal tree, pines, cottage, snow-friend
  s += crystalTree(90, 430, 250, 'pink', { seed: 31 }) + pine(210, 330, 150) + pine(36, 610, 230);
  s += cottage(160, 760, 0.7, { wall: '#FFD3C2', roof: '#B7A3F0', wreath: true });
  s += snowman(70, 780, 0.6, { buttons: 3, hat: '#A58AF0', scarf: '#7CC4F4', mood: 'joy' });
  // right edge: crystal tree, pines, little frozen pond with Pebble
  s += crystalTree(1110, 440, 240, 'blue', { seed: 32 }) + pine(990, 320, 140) + pine(1170, 640, 220);
  s += ellipse(1030, 720, 120, 34, '#FFFFFF', stroke(F.snowLine, 3)) + ellipse(1030, 722, 110, 28, url('fkIce'));
  s += pebble(1030, 730, { s: 0.75, pose: 'wave', mood: 'joy', skates: true, hat: '#6DD3A8', shadow: false });
  // corner friends: Pip (bottom-left), Luma (top-left), Mochi (bottom-right)
  s += pip(300, 790, { s: 0.8, pose: 'wave', mood: 'joy', scarf: P.pinkDeep, look: 1 });
  s += luma(300, 300, { s: 0.62, pose: 'hold', mood: 'calm', specs: true, holding: lantern(56, -92, 0.9) });
  s += mochi(900, 790, { s: 0.7, mood: 'sleepy', hat: '#FFCF5C', flip: true });
  s += snowBank([
    [-10, 800, 60],
    [1210, 800, 60],
  ]);
  s += crystalCluster(1180, 300, 0.8, 'lilac') + crystalCluster(24, 330, 0.8, 'blue');
  s += fallingSnow(13, 30, { x: 10, y: 10, w: 1180, h: 780 }, { big: 5, opacity: 0.7 });
  return s;
}

/* ------------------------------------------------------------------ badge */

function badgeArt(): string {
  const rib = (side: 1 | -1, col: string) =>
    path(`M${100 + side * 12} 140L${100 + side * 44} 192L${100 + side * 30} 186L${100 + side * 22} 198L${100 + side * 2} 148Z`, col, stroke(darken(col, 0.3), 3.5));
  const rays = range(16)
    .map((i) => {
      const [x1, y1] = polar(100, 92, 72, i * 22.5);
      const [x2, y2] = polar(100, 92, 84, i * 22.5 + 11.25);
      const [x3, y3] = polar(100, 92, 72, i * 22.5 + 22.5);
      return `${i ? 'L' : 'M'}${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}L${n(x3)} ${n(y3)}`;
    })
    .join('');
  return (
    defs(
      frostDefs(),
      radial('bgFace', [
        [0, '#F4FBFF'],
        [0.7, '#CFE8FF'],
        [1, '#B5CDF6'],
      ]),
    ) +
    rib(-1, '#FF9DC4') +
    rib(1, '#8FC0F6') +
    path(rays + 'Z', P.gold, stroke(P.goldDeep, 4)) +
    circle(100, 92, 66, '#FFE89A', stroke(P.goldDeep, 4)) +
    circle(100, 92, 56, url('bgFace'), stroke('#7E9FD6', 3.5)) +
    g(castle(100, 128, 0.2, { flags: ['#FFB8D6', '#FFE07A', '#B3EECB'] }), { opacity: 0.35 }) +
    snowflake(100, 90, 40, { color: '#FFFFFF', line: '#5B7DD2', width: 6, glowId: false, tipColor: '#FFC6E2' }) +
    circle(100, 90, 9, '#FFB0CF', stroke('#C6739F', 2.4)) +
    star(42, 36, 9, '#FFF3C8', { outline: P.goldDeep, width: 2.4 }) +
    star(160, 40, 7, '#FFF3C8', { outline: P.goldDeep, width: 2.2 }) +
    sparkle(30, 120, 7) +
    sparkle(172, 128, 6) +
    ellipse(76, 52, 14, 7, '#FFFFFF', { opacity: 0.6, transform: 'rotate(-30 76 52)' })
  );
}

const world: World = {
  id: 'frostlight',
  name: 'Frostlight Kingdom',
  tagline: 'Seasons, snowflakes & symmetry',
  theme: { sky: ['#CFE4FF', '#F2E6FF'], accent: '#7C8FEA', deep: '#2F3566', path: '#9A86E6' },
  music: 'frost',
  cover,
  mapArt,
  levels: [level1, level2, level3, level4, level5],
  badge: {
    id: 'badge-fk',
    name: 'Frostlight Star Medal',
    draw: badgeArt,
  },
};

export default world;
