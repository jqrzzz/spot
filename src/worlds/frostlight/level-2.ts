/**
 * Level 2 — Skating on Twinkle Pond.
 * Pebble glides across the frozen pond with a line of little chicks behind him, Mochi pops
 * up through the ice to say hello, and Pip watches from the bank with warm cocoa.
 * Introduces counting (chicks, lanterns).
 */
import type { Level, Point } from '../../core/types.ts';
import { P, circle, defs, ellipse, linear, n, path, rect, sparkle, stroke, url } from '../../art/kit.ts';
import { chick, iceHole, mochi, pebble, pip, snowFinch } from './characters.ts';
import {
  F,
  bench,
  buntingPoint,
  cottage,
  crystalCluster,
  fallingSnow,
  farPine,
  frostDefs,
  lantern,
  mountains,
  mug,
  pine,
  snowBank,
  softCloud,
} from './props.ts';

/* chick line (feet points); the fourth only appears in the changed picture */
const CHICKS: [number, number][] = [
  [312, 490],
  [362, 494],
  [412, 497],
];
const CHICK_EXTRA: [number, number] = [462, 499];
const chickCentre = ([x, y]: [number, number]): Point => [x, y - 26];

/* lantern string between two lamp posts */
const STR: [number, number, number, number, number] = [292, 222, 560, 216, 30];
const LANTERN_T = [0.13, 0.32, 0.68, 0.87];
const LANTERN_EXTRA_T = 0.5;
const lanternAt = (t: number): [number, number] => buntingPoint(STR[0], STR[1], STR[2], STR[3], STR[4], t);

/** Wooden pole with a snow cap that holds the lantern string. */
function pole(x: number, base: number, h: number): string {
  return (
    ellipse(x, base, 14, 4, '#8E7CD6', { opacity: 0.2 }) +
    rect(x - 5, base - h, 10, h, 4, url('fkWood'), stroke('#B9825C', 3)) +
    path(`M${x - 9} ${base - h + 3}Q${x} ${base - h - 12} ${x + 9} ${base - h + 3}Z`, '#FFFFFF', stroke(F.snowLine, 2.4)) +
    circle(x, base - h + 12, 4, 'none', stroke('#8E7BC9', 2.4))
  );
}

/** Skate trail drawn into the ice: a heart or a star outline. */
function trail(cx: number, cy: number, shape: 'heart' | 'star'): string {
  let d = '';
  if (shape === 'heart') {
    const s = 42;
    d = `M${n(cx)} ${n(cy + s * 0.9)}C${n(cx - s * 1.35)} ${n(cy + s * 0.05)} ${n(cx - s * 1.0)} ${n(cy - s * 1.05)} ${n(cx)} ${n(cy - s * 0.4)}C${n(cx + s * 1.0)} ${n(cy - s * 1.05)} ${n(cx + s * 1.35)} ${n(cy + s * 0.05)} ${n(cx)} ${n(cy + s * 0.9)}Z`;
  } else {
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 50 : 22;
      const a = ((-90 + i * 36) * Math.PI) / 180;
      d += `${i ? 'L' : 'M'}${n(cx + Math.cos(a) * r)} ${n(cy + 4 + Math.sin(a) * r * 0.82)}`;
    }
    d += 'Z';
  }
  return path(d, 'none', { ...stroke('#8DB6E6', 9), opacity: 0.9 }) + path(d, 'none', stroke('#FFFFFF', 4));
}

export const level2: Level = {
  id: 'fk-2',
  title: 'Skating on Twinkle Pond',
  findCount: 4,
  differences: [
    {
      id: 'mochi-hat',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'circle', cx: 624, cy: 334, r: 50 },
      label: 'Yellow hat and pink hat',
      say: "Mochi's hat is yellow… and pink!",
    },
    {
      id: 'tree-star',
      kind: 'add',
      theme: 'shapes',
      hit: { type: 'circle', cx: 704, cy: 112, r: 46 },
      label: 'Star and no star',
      say: 'Look at the top of the tree. A shiny star!',
    },
    {
      id: 'chicks',
      kind: 'count',
      theme: 'counting',
      hit: { type: 'rect', x: 284, y: 432, w: 206, h: 82 },
      label: '3 chicks and 4 chicks',
      say: 'Three little chicks… and four little chicks!',
      count: { a: CHICKS.map(chickCentre), b: [...CHICKS, CHICK_EXTRA].map(chickCentre) },
    },
    {
      id: 'trail',
      kind: 'shape',
      theme: 'shapes',
      hit: { type: 'circle', cx: 108, cy: 470, r: 62 },
      label: 'Heart trail and star trail',
      say: 'Skating made a heart… and a star!',
    },
    // replay extras
    {
      id: 'finch',
      kind: 'add',
      theme: 'nature',
      hit: { type: 'circle', cx: 600, cy: 500, r: 46 },
      label: 'Bird and no bird',
      say: 'A little bird came to sit on the bench!',
    },
    {
      id: 'lanterns',
      kind: 'count',
      theme: 'counting',
      hit: { type: 'rect', x: 308, y: 212, w: 236, h: 98 },
      label: '4 lanterns and 5 lanterns',
      say: 'Four glowing lanterns… and five!',
      count: {
        a: LANTERN_T.map((t) => {
          const [x, y] = lanternAt(t);
          return [x, y + 38] as Point;
        }),
        b: [...LANTERN_T.slice(0, 2), LANTERN_EXTRA_T, ...LANTERN_T.slice(2)].map((t) => {
          const [x, y] = lanternAt(t);
          return [x, y + 38] as Point;
        }),
      },
    },
  ],
  draw(c) {
    let s = defs(
      frostDefs(),
      linear('l2sky', [
        [0, '#BBD7FA'],
        [0.4, '#DCE3FF'],
        [0.62, '#F7E1F4'],
        [0.78, '#FFE2E2'],
      ]),
      linear('l2pond', [
        [0, '#CDEBFF'],
        [0.5, '#B4DBF8'],
        [1, '#C9E6FF'],
      ]),
    );
    s += rect(0, 0, 800, 600, 0, url('l2sky'));
    s += circle(420, 300, 260, url('fkGlowPink'), { opacity: 0.55 });
    s += softCloud(110, 70, 0.7) + softCloud(470, 96, 0.55, '#FFFFFF', 0.8) + softCloud(300, 40, 0.4, '#FFFFFF', 0.7);

    // far hills
    s += mountains(
      [
        [80, 214, 140],
        [300, 196, 150],
        [520, 222, 130],
        [690, 200, 150],
      ],
      300,
      '#D8DCF7',
    );
    s += path('M0 296Q160 270 330 290T640 280T800 290V360H0Z', '#EDF1FF');
    for (const [x, h] of [
      [210, 44],
      [236, 58],
      [262, 40],
      [430, 50],
      [452, 38],
      [610, 46],
    ] as const)
      s += farPine(x, 300, h, '#A9D2D6');

    // back bank
    s += path('M0 330Q200 304 400 320T800 318V600H0Z', url('fkSnow')) + path('M0 330Q200 304 400 320T800 318', 'none', { ...stroke(F.snowLine, 3.5), opacity: 0.7 });
    s += cottage(96, 344, 0.56, { wall: '#C9EEDC', roof: '#F6B3D3', icicles: [16, 24, 12, 20, 14, 22, 12] });
    s += pine(700, 334, 206, { lights: true, seed: 9, topStar: c.on('tree-star') });
    s += pine(770, 350, 120);

    // lamp posts + lantern string
    s += pole(STR[0], 352, 136) + pole(STR[2], 346, 136);
    s += path(`M${STR[0]} ${STR[1] + 12}L${STR[0]} ${STR[1]}Q${(STR[0] + STR[2]) / 2} ${(STR[1] + STR[3]) / 2 + STR[4]} ${STR[2]} ${STR[3]}L${STR[2]} ${STR[3] + 12}`, 'none', stroke('#8E7BC9', 2.6));
    const lts = c.on('lanterns') ? [...LANTERN_T, LANTERN_EXTRA_T] : LANTERN_T;
    lts.forEach((t, i) => {
      const [x, y] = lanternAt(t);
      s += lantern(x, y + 8, 0.98, { color: i % 2 ? '#F29AC0' : '#9C86DA', glowR: 40 });
    });

    // the pond
    s += ellipse(400, 458, 356, 104, '#FFFFFF', stroke(F.snowLine, 4));
    s += ellipse(400, 462, 344, 94, url('l2pond'), stroke('#8DB6E6', 3));
    s += path('M120 420Q260 396 420 404', 'none', { ...stroke('#FFFFFF', 7), opacity: 0.55 });
    s += path('M170 528Q330 548 520 532', 'none', { ...stroke('#FFFFFF', 5), opacity: 0.45 });
    s += path('M520 404Q620 410 700 430', 'none', { ...stroke('#FFFFFF', 4), opacity: 0.5 });
    // swirly skate marks (always there)
    s += path('M190 512C230 520 250 500 290 506C330 512 350 522 420 520', 'none', { ...stroke('#FFFFFF', 3), opacity: 0.8 });
    s += sparkle(250, 430, 7) + sparkle(470, 440, 6) + sparkle(560, 520, 6) + sparkle(160, 520, 5);

    s += trail(108, 470, c.pick('trail', 'heart', 'star'));

    // Mochi pops up through the ice
    s += iceHole(624, 456, 52, 15);
    s += mochi(624, 458, { s: 1.08, peek: true, mood: 'joy', hat: c.pick('mochi-hat', '#FFCF5C', '#EE7FB0'), hatStripe: '#FFFFFF' });

    // Pebble skating, chicks following
    s += pebble(232, 478, { s: 1.12, pose: 'wave', mood: 'joy', skates: true, scarf: P.coralDeep, hat: '#6DD3A8', flip: true, shadow: false });
    s += ellipse(232, 480, 52, 8, '#8E7CD6', { opacity: 0.16 });
    const chicks = c.on('chicks') ? [...CHICKS, CHICK_EXTRA] : CHICKS;
    chicks.forEach(([x, y], i) => (s += chick(x, y, 1.05, { mood: i === 1 ? 'joy' : 'happy', flip: true, hat: i === 2 ? '#FF9DBB' : undefined })));

    // front bank
    s += path('M0 560Q140 530 300 548T560 552T800 540V600H0Z', url('fkSnowWarm')) + path('M0 560Q140 530 300 548T560 552T800 540', 'none', { ...stroke(F.snowLine, 4), opacity: 0.8 });
    s += snowBank([
      [-4, 560, 40],
      [36, 586, 34],
    ]);
    s += crystalCluster(30, 560, 0.9, 'lilac');
    s += bench(562, 594, 0.84);
    if (c.on('finch')) s += snowFinch(596, 522, 1.3, { color: '#B9A8F0' });
    s += pip(712, 594, { s: 1.04, pose: 'hold', mood: 'happy', scarf: '#8FA8F0', flip: true, holding: mug(0, -40, 0.8, '#F49AC0', { marsh: 2 }) });

    s += fallingSnow(22, 26, { x: 20, y: 20, w: 760, h: 300 }, { big: 6 });
    s += sparkle(380, 160, 6) + sparkle(760, 250, 6);
    return s;
  },
  sticker: {
    id: 'st-fk-2',
    name: 'Peekaboo Mochi',
    draw: () =>
      defs(frostDefs()) +
      iceHole(100, 170, 56, 16) +
      mochi(100, 172, { s: 1.04, peek: true, mood: 'joy', hat: '#FFCF5C', hatStripe: '#FFFFFF' }) +
      sparkle(34, 70, 9) +
      sparkle(168, 92, 7),
  },
};
