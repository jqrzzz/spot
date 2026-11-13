/**
 * Level 1 — Snow-Friend Building Day.
 * Pip and Pebble have built a snow-friend on a bright winter morning; the castle glitters
 * far away and a bunny watches from the snow bank. Big, bold differences.
 */
import type { Level } from '../../core/types.ts';
import { P, circle, defs, ellipse, g, linear, path, rect, sparkle, stroke, url } from '../../art/kit.ts';
import { bunny, pebble, pip } from './characters.ts';
import {
  F,
  castle,
  cottage,
  farPine,
  frostDefs,
  groundSparkles,
  lshadow,
  mountains,
  pine,
  sled,
  snowBank,
  snowCloud,
  snowman,
  softCloud,
  sun,
} from './props.ts';

const SUN: [number, number] = [682, 108];

/** Little footprints trail (penguin: arrows, fox: dots). */
function prints(pts: [number, number][], kind: 'fox' | 'penguin'): string {
  return pts
    .map(([x, y], i) =>
      kind === 'fox'
        ? ellipse(x + (i % 2 ? 7 : -7), y, 5, 3.2, '#B9B3E6', { opacity: 0.75 })
        : path(`M${x - 6 + (i % 2 ? 8 : -8)} ${y + 3}L${x + (i % 2 ? 8 : -8)} ${y - 4}L${x + 6 + (i % 2 ? 8 : -8)} ${y + 3}`, 'none', { ...stroke('#B9B3E6', 2.6), opacity: 0.8 }),
    )
    .join('');
}

export const level1: Level = {
  id: 'fk-1',
  title: 'Snow-Friend Building Day',
  findCount: 3,
  differences: [
    {
      id: 'hat',
      kind: 'add',
      theme: 'seasons',
      hit: { type: 'ellipse', cx: 412, cy: 262, rx: 80, ry: 62 },
      label: 'Hat and no hat',
      say: 'One snow-friend has a cosy hat!',
    },
    {
      id: 'sun',
      kind: 'shape',
      theme: 'weather',
      hit: { type: 'circle', cx: SUN[0], cy: SUN[1] + 4, r: 84 },
      label: 'Sunshine and a snow cloud',
      say: 'A sunny sky… and a snowy cloud!',
    },
    {
      id: 'scarf',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'ellipse', cx: 248, cy: 446, rx: 70, ry: 66 },
      label: 'Pink scarf and green scarf',
      say: "Pip's scarf is pink… and green!",
    },
    // replay extras
    {
      id: 'bunny',
      kind: 'add',
      theme: 'nature',
      hit: { type: 'circle', cx: 92, cy: 494, r: 70 },
      label: 'Bunny and no bunny',
      say: 'Peekaboo! A little bunny is hiding.',
    },
    {
      id: 'sled',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'ellipse', cx: 652, cy: 552, rx: 92, ry: 32 },
      label: 'Pink sled and blue sled',
      say: 'A pink sled… and a blue sled!',
    },
  ],
  draw(c) {
    const sky = linear('l1sky', [
      [0, '#B4D9FA'],
      [0.42, '#D9EAFF'],
      [0.62, '#F3E8FB'],
      [0.8, '#FFE6EE'],
    ]);
    let s = defs(frostDefs(), sky) + rect(0, 0, 800, 600, 0, url('l1sky'));

    // ---- sky
    s += softCloud(150, 82, 0.8) + softCloud(440, 56, 0.6, '#FFFFFF', 0.85) + softCloud(300, 140, 0.45, '#FFFFFF', 0.7);
    s += sparkle(250, 44, 7) + sparkle(560, 70, 6) + sparkle(36, 150, 6) + sparkle(520, 160, 5, '#FFFFFF', 0.8);
    s += c.on('sun') ? snowCloud(SUN[0], SUN[1] - 6, 0.78) : sun(SUN[0], SUN[1], 40, 'happy', 1.7);

    // ---- far mountains + castle
    s += mountains(
      [
        [60, 206, 130],
        [232, 176, 130],
        [400, 214, 120],
        [560, 196, 140],
        [748, 204, 140],
      ],
      306,
      '#D9DEF8',
    );
    s += mountains(
      [
        [330, 238, 110],
        [520, 246, 100],
      ],
      310,
      '#C8CFF2',
    );
    s += path('M0 300Q130 280 260 294T520 290T800 296V340H0Z', '#EEF2FF');
    s += castle(150, 306, 0.38);
    for (const [x, h] of [
      [284, 40],
      [306, 52],
      [330, 38],
      [470, 44],
      [492, 56],
      [515, 40],
    ] as const)
      s += farPine(x, 304, h, '#A8D3D5');

    // ---- midground hill, cottage, pines
    s += path('M0 368Q150 334 330 356T640 344T800 350V460H0Z', url('fkSnow')) + path('M0 368Q150 334 330 356T640 344T800 350', 'none', { ...stroke(F.snowLine, 3.5), opacity: 0.7 });
    s += cottage(676, 356, 0.6, { wall: '#FFD6C4', roof: '#C3B0F6', wreath: true });
    s += pine(16, 420, 190) + pine(84, 404, 104);
    s += pine(778, 392, 150);

    // ---- foreground snow field
    s += path('M0 444Q190 414 400 432T800 434V600H0Z', url('fkSnowWarm')) + path('M0 444Q190 414 400 432T800 434', 'none', { ...stroke(F.snowLine, 4), opacity: 0.75 });
    s += groundSparkles(11, 12, { x: 20, y: 452, w: 760, h: 130 });
    s += prints(
      [
        [196, 596],
        [212, 578],
        [226, 560],
        [238, 543],
      ],
      'fox',
    );
    s += prints(
      [
        [770, 520],
        [742, 514],
        [714, 512],
        [688, 516],
      ],
      'penguin',
    );

    // spare snowballs by the snow-friend
    s += lshadow(330, 522, 22, 5) + circle(330, 508, 17, url('fkSnow'), stroke(F.snowLine, 3)) + lshadow(498, 528, 16, 4) + circle(498, 518, 12, url('fkSnow'), stroke(F.snowLine, 3));

    // ---- the snow-friend (focal point)
    s += snowman(412, 512, 1.1, { buttons: 3, scarf: '#7CC4F4', hat: c.on('hat') ? false : '#A58AF0', mood: 'joy' });

    // ---- Pip (left) and Pebble (right)
    s += pip(246, 532, { s: 1.32, pose: 'wave', mood: 'joy', scarf: c.pick('scarf', P.pinkDeep, '#4FC08D'), look: 1 });
    const snowball = circle(0, -44, 19, url('fkSnow'), stroke(F.snowLine, 3)) + ellipse(-6, -50, 5, 3, '#FFFFFF');
    s += pebble(590, 520, { s: 1.2, pose: 'stand', mood: 'happy', hat: '#6DD3A8', holding: snowball, look: -1 });

    // ---- foreground: bunny peeking from a snow bank (left), sled (right)
    if (c.on('bunny')) s += bunny(92, 566, 1.5, { body: false, mood: 'happy' });
    s += snowBank([
      [-6, 566, 50],
      [52, 568, 40],
      [108, 586, 40],
      [150, 606, 30],
      [30, 610, 50],
    ]);
    if (c.on('bunny')) s += ellipse(76, 530, 9, 6, '#FFFFFF', stroke('#B3A6DE', 2.6)) + ellipse(108, 530, 9, 6, '#FFFFFF', stroke('#B3A6DE', 2.6));
    s += sparkle(30, 548, 7) + sparkle(128, 580, 5);
    s += sled(656, 576, 0.95, c.pick('sled', '#F07C96', '#5B95E6'));
    s += snowBank([
      [800, 600, 46],
      [770, 612, 30],
    ]);

    // ---- sparkly air ("diamond dust")
    s += g(
      [
        [60, 250],
        [196, 210],
        [470, 300],
        [600, 236],
        [770, 236],
        [350, 120],
        [140, 330],
      ]
        .map(([x, y], i) => sparkle(x, y, 5 + (i % 3) * 2, '#FFFFFF', 0.9))
        .join(''),
    );
    return s;
  },
  sticker: {
    id: 'st-fk-1',
    name: 'Snow-Friend',
    draw: () =>
      defs(frostDefs()) +
      g(snowman(0, 0, 0.66, { buttons: 3, scarf: '#7CC4F4', hat: '#A58AF0', mitten: P.coral, mood: 'joy' }), { transform: 'translate(100 186)' }) +
      sparkle(40, 60, 10) +
      sparkle(162, 92, 8),
  },
};
