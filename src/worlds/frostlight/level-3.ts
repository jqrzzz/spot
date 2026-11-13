/**
 * Level 3 — Cocoa Evening in Snowdrop Village.
 * The windows glow, the first stars come out, and Luma the owl serves warm cocoa from her
 * little stand. Pip and Pebble have come for a cup; Mochi is snuggled by the lamp post.
 * Themes: shapes, weather and nature.
 */
import type { Level, Point } from '../../core/types.ts';
import { P, circle, darken, defs, ellipse, g, linear, n, path, rect, sparkle, star, stroke, url } from '../../art/kit.ts';
import { luma, mochi, pebble, pip } from './characters.ts';
import {
  F,
  castle,
  cottage,
  crocus,
  fallingSnow,
  farPine,
  fence,
  frostDefs,
  lampPost,
  moon,
  mug,
  pine,
  skyStars,
  snowBank,
  snowCloud,
} from './props.ts';

const MUGS: [number, number, string][] = [
  [308, 380, '#9CC9FF'],
  [344, 380, '#FFB0CF'],
  [456, 380, '#B3EECB'],
];
const MUG_EXTRA: [number, number, string] = [492, 380, '#FFD66B'];
const mugCentre = ([x, y]: [number, number, string]): Point => [x, y - 6];

/** Luma's cocoa stand: back panel, posts, striped awning. Counter is drawn separately (in front of Luma). */
function standBack(): string {
  const wd = darken(P.wood, 0.35);
  let s = rect(296, 284, 208, 136, 6, '#E8C2A0', stroke(wd, 3.5));
  s += path('M300 320H500M300 356H500', 'none', { ...stroke(wd, 2), opacity: 0.3 });
  s += rect(294, 284, 12, 192, 4, url('fkWood'), stroke(wd, 3)) + rect(494, 284, 12, 192, 4, url('fkWood'), stroke(wd, 3));
  // sign post (the sign itself is a difference)
  s += rect(396, 218, 8, 64, 3, url('fkWood'), stroke(wd, 2.6));
  return s;
}

/** Striped, scalloped awning with fairy lights (drawn in front of Luma's head). */
function awning(): string {
  let s = '';
  const top = 262;
  const bot = 300;
  s += path(`M284 ${bot}L300 ${top}H500L516 ${bot}Z`, '#FFFFFF', stroke('#C6739F', 3.5));
  for (let i = 0; i < 6; i++) {
    const x0 = 300 + i * 33.3;
    if (i % 2 === 0) s += path(`M${n(x0)} ${top}H${n(x0 + 33.3)}L${n(284 + (i + 1) * 38.7)} ${bot}H${n(284 + i * 38.7)}Z`, '#F7A8CB');
  }
  let sc = `M284 ${bot}`;
  for (let i = 0; i < 6; i++) sc += `Q${n(284 + i * 38.7 + 19.35)} ${bot + 22} ${n(284 + (i + 1) * 38.7)} ${bot}`;
  s += path(sc + 'Z', '#FFFFFF', stroke('#C6739F', 3));
  for (let i = 0; i < 6; i++) if (i % 2 === 0) s += path(`M${n(284 + i * 38.7)} ${bot}Q${n(284 + i * 38.7 + 19.35)} ${bot + 22} ${n(284 + (i + 1) * 38.7)} ${bot}Z`, '#F7A8CB', stroke('#C6739F', 2.4));
  s += path(`M284 ${bot}L300 ${top}H500L516 ${bot}`, 'none', stroke('#C6739F', 3.5));
  // snow on the awning
  s += path(`M292 ${top + 4}Q290 ${top - 12} 312 ${top - 10}Q360 ${top - 18} 400 ${top - 12}Q450 ${top - 18} 490 ${top - 10}Q512 ${top - 12} 508 ${top + 4}Q496 ${top + 10} 486 ${top + 3}Q470 ${top + 12} 452 ${top + 3}Q420 ${top + 10} 400 ${top + 3}Q370 ${top + 12} 346 ${top + 3}Q326 ${top + 10} 312 ${top + 3}Q300 ${top + 10} 292 ${top + 4}Z`, url('fkSnow'), stroke(F.snowLine, 2.6));
  // fairy lights along the scallops
  const cols = ['#FFE07A', '#FF9FC4', '#9FE3FF', '#C7B3FF'];
  for (let i = 0; i <= 6; i++) {
    const x = 284 + i * 38.7;
    s += circle(x, bot + 4, 9, url('fkGlow')) + circle(x, bot + 4, 4, cols[i % 4], stroke(darken(cols[i % 4], 0.3), 1.6));
  }
  return s;
}

function counter(): string {
  const wd = darken(P.wood, 0.35);
  return (
    rect(286, 394, 228, 86, 6, url('fkWood'), stroke(wd, 4)) +
    path('M300 420H500M300 448H500', 'none', { ...stroke(wd, 2), opacity: 0.3 }) +
    rect(280, 388, 240, 14, 6, '#F3D2B4', stroke(wd, 3.5)) +
    // a little mug painted on the front
    path('M384 426H410V450Q410 456 404 456H390Q384 456 384 450Z', '#FFFFFF', stroke('#C6739F', 3)) +
    path('M410 432Q420 432 420 440Q420 446 410 446', 'none', stroke('#C6739F', 3)) +
    path('M392 418q-3 -5 0 -9M402 418q-3 -5 0 -9', 'none', stroke('#FFFFFF', 2.6)) +
    path('M296 478Q300 470 318 472Q400 466 482 472Q500 470 504 478', 'none', { ...stroke('#FFFFFF', 5), opacity: 0.8 })
  );
}

/** Round or star-shaped sign with a cocoa-mug picture. */
function sign(cx: number, cy: number, shape: 'round' | 'star'): string {
  const fill = '#FFE3B8';
  const line = '#C98A5E';
  const board =
    shape === 'round'
      ? circle(cx, cy, 34, fill, stroke(line, 4)) + circle(cx, cy, 27, 'none', { ...stroke(line, 2), opacity: 0.4 })
      : star(cx, cy + 3, 44, fill, { outline: line, width: 4, inner: 0.58 });
  return (
    circle(cx, cy, 52, url('fkGlow'), { opacity: 0.55 }) +
    board +
    path(`M${cx - 10} ${cy - 6}H${cx + 8}V${cy + 8}Q${cx + 8} ${cy + 12} ${cx + 4} ${cy + 12}H${cx - 6}Q${cx - 10} ${cy + 12} ${cx - 10} ${cy + 8}Z`, '#B8846A', stroke(darken('#B8846A', 0.3), 2.4)) +
    path(`M${cx + 8} ${cy - 2}Q${cx + 14} ${cy - 2} ${cx + 14} ${cy + 3}Q${cx + 14} ${cy + 8} ${cx + 8} ${cy + 8}`, 'none', stroke(darken('#B8846A', 0.3), 2.4)) +
    circle(cx - 3, cy - 8, 3.2, '#FFFFFF') +
    circle(cx + 3, cy - 9, 2.8, '#FFFFFF')
  );
}

export const level3: Level = {
  id: 'fk-3',
  title: 'Cocoa Evening in Snowdrop Village',
  findCount: 4,
  differences: [
    {
      id: 'moon',
      kind: 'shape',
      theme: 'nature',
      hit: { type: 'circle', cx: 112, cy: 92, r: 58 },
      label: 'Thin moon and round moon',
      say: 'A thin, curvy moon… and a big round moon!',
    },
    {
      id: 'lamp',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'circle', cx: 718, cy: 344, r: 62 },
      label: 'Lamp on and lamp off',
      say: 'One lamp is glowing… and one is not!',
    },
    {
      id: 'sign',
      kind: 'shape',
      theme: 'shapes',
      hit: { type: 'circle', cx: 400, cy: 200, r: 58 },
      label: 'Circle sign and star sign',
      say: 'The sign is a circle… and a star!',
    },
    {
      id: 'mugs',
      kind: 'count',
      theme: 'counting',
      hit: { type: 'rect', x: 282, y: 330, w: 236, h: 76 },
      label: '3 mugs and 4 mugs',
      say: 'Three cups of cocoa… and four!',
      count: { a: MUGS.map(mugCentre), b: [...MUGS, MUG_EXTRA].map(mugCentre) },
    },
    // replay extras
    {
      id: 'cloud',
      kind: 'add',
      theme: 'weather',
      hit: { type: 'circle', cx: 640, cy: 112, r: 84 },
      label: 'Snow cloud and starry sky',
      say: 'Here comes a snowy cloud!',
    },
    {
      id: 'crocus',
      kind: 'add',
      theme: 'seasons',
      hit: { type: 'ellipse', cx: 66, cy: 512, rx: 48, ry: 60 },
      label: 'Flower and no flower',
      say: 'A tiny spring flower is peeking out of the snow!',
    },
  ],
  draw(c) {
    let s = defs(
      frostDefs(),
      linear('l3sky', [
        [0, '#8F92DE'],
        [0.35, '#B7A3EA'],
        [0.62, '#EBB6DA'],
        [0.8, '#FFCFC7'],
      ]),
      linear('l3hill', [
        [0, '#C9C0F0'],
        [1, '#B3AAE8'],
      ]),
      linear('l3snow', [
        [0, '#F4F1FF'],
        [0.6, '#E6E4FA'],
        [1, '#D5D4F4'],
      ]),
    );
    s += rect(0, 0, 800, 600, 0, url('l3sky'));
    s += skyStars(31, 34, { x: 20, y: 16, w: 760, h: 200 });
    s += moon(112, 92, 40, c.on('moon'), '');
    if (c.on('cloud')) s += snowCloud(640, 98, 0.8, true, '#F7F5FF', '#D3CDF4');

    // far hills, castle silhouette
    s += path('M0 268Q120 226 250 250T520 240T800 252V340H0Z', url('l3hill'));
    s += castle(586, 262, 0.26, { flags: ['#FFB8D6', '#FFE07A', '#B3EECB'] });
    for (const [x, h] of [
      [40, 42],
      [64, 30],
      [196, 38],
      [222, 50],
      [700, 40],
      [726, 54],
      [752, 36],
    ] as const)
      s += farPine(x, 258, h, '#8F9BD8', '#E9E6FF');

    // village ground
    s += path('M0 330Q200 306 400 322T800 318V600H0Z', url('l3snow')) + path('M0 330Q200 306 400 322T800 318', 'none', { ...stroke('#A9A6E2', 3.5), opacity: 0.7 });
    // trodden path to the stand
    s += path('M330 600Q350 520 360 480H440Q450 520 470 600Z', '#DCD6F6', { opacity: 0.8 });

    // cottages
    s += cottage(130, 384, 0.92, { wall: '#FFCDB8', roof: '#B7A3F0', wreath: true, icicles: [14, 22, 12, 18, 10, 20, 12] });
    s += cottage(560, 330, 0.5, { wall: '#C9EEDC', roof: '#F6B3D3', smoke: true });
    s += cottage(676, 388, 0.84, { wall: '#D6E4FF', roof: '#F3A9C6', windowShape: 'round', windowShapeR: 'heart' });
    s += pine(258, 346, 120) + pine(780, 420, 150);
    s += fence(14, 70, 470, 46, 2) + fence(744, 790, 474, 46, 2);

    // warm light pool on the snow in front of the stand
    s += ellipse(400, 492, 190, 34, url('fkGlow'), { opacity: 0.55 });

    // the cocoa stand with Luma behind the counter
    s += standBack();
    s += sign(400, 200, c.pick('sign', 'round', 'star'));
    s += luma(400, 452, { s: 0.92, pose: 'wave', mood: 'joy', specs: true, shadow: false });
    s += awning();
    s += counter();
    const mugs = c.on('mugs') ? [...MUGS, MUG_EXTRA] : MUGS;
    mugs.forEach(([x, y, col]) => (s += mug(x, y, 0.95, col, { marsh: 2, steam: true })));

    // lamp post on the right (lit or not)
    s += lampPost(718, 474, 100, { lit: !c.on('lamp'), color: '#9C86DA' });

    // friends with their cocoa
    s += pip(214, 548, { s: 1.06, pose: 'hold', mood: 'calm', scarf: P.pinkDeep, look: 1, holding: mug(0, -40, 0.8, '#B79BFF', { marsh: 3 }) });
    s += pebble(590, 548, { s: 1.04, pose: 'hold', mood: 'happy', hat: '#6DD3A8', flip: true, holding: mug(0, -36, 0.78, '#FF9FAE', { marsh: 2, heart: true }) });
    s += mochi(722, 584, { s: 0.7, mood: 'sleepy', hat: '#FFCF5C', flip: true });

    // foreground snow + spring flower
    if (c.on('crocus')) s += crocus(54, 552, 1.25, '#C9A6FF') + crocus(78, 556, 0.9, '#FFB0CF');
    s += snowBank([
      [-10, 590, 40],
      [40, 604, 34],
    ]);
    s += snowBank([
      [430, 612, 36],
      [480, 606, 30],
    ]);
    s += g(sparkle(150, 560, 6) + sparkle(300, 590, 5) + sparkle(520, 580, 6) + sparkle(640, 470, 5));
    s += fallingSnow(37, 22, { x: 20, y: 140, w: 760, h: 440 }, { big: 5, opacity: 0.85 });
    return s;
  },
  sticker: {
    id: 'st-fk-3',
    name: 'Luma and Her Cocoa',
    draw: () => defs(frostDefs()) + luma(100, 184, { s: 1.04, pose: 'hold', mood: 'joy', specs: true, scarf: '#B3EECB', holding: mug(44, -66, 0.9, '#FFB0CF', { marsh: 3 }) }) + sparkle(36, 52, 9) + sparkle(168, 70, 7),
  },
};

