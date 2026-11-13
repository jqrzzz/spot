/**
 * Level 5 — Frostlight Castle Festival.
 * Under swirling aurora ribbons the whole kingdom celebrates in front of the glowing ice
 * castle: Pebble wears the festival crown, Luma and Pip cheer, Mochi wiggles, chicks and
 * bunnies dance around the snowflake tree. The richest scene; subtler but clear differences.
 */
import type { Level, Point } from '../../core/types.ts';
import { P, circle, darken, defs, ellipse, g, linear, n, path, polar, range, rect, rng, sparkle, stroke, url } from '../../art/kit.ts';
import { bunny, chick, luma, mochi, pebble, pip } from './characters.ts';
import {
  aurora,
  buntingPoint,
  castle,
  castleExtraWindowAt,
  crystalCluster,
  fallingSnow,
  farPine,
  frostDefs,
  gift,
  glow,
  lantern,
  pine,
  skyStars,
  snowBank,
  snowflake,
  snowman,
} from './props.ts';

/* castle placement */
const CX = 400;
const CB = 392;
const CS = 0.92;
const WIN = castleExtraWindowAt(CX, CB, CS, 'right');

/* the snow-friend with big buttons (left foreground) */
const SM: [number, number, number] = [74, 590, 1.28];
const SM_SLOTS: [number, number][] = [
  [0, -116],
  [0, -84],
  [0, -52],
  [0, -20],
];
const buttonAt = (i: number): Point => [SM[0] + SM_SLOTS[i][0] * SM[2], SM[1] + SM_SLOTS[i][1] * SM[2]];

/* bunting (left), five flags in a pink-blue pattern; flag 4 breaks the pattern */
const BUNT: [number, number, number, number, number] = [18, 150, 262, 196, 44];
const FLAG_T = [0.1, 0.3, 0.5, 0.7, 0.9];
const FLAG = 3;

/* festival tree topper */
const TOP: [number, number] = [694, 214];

/** Firework burst (static decoration). */
function firework(x: number, y: number, r: number, color: string, seed: number): string {
  const rr = rng(seed);
  let d = '';
  let dots = '';
  for (const i of range(12)) {
    const a = i * 30 + rr() * 8;
    const [x1, y1] = polar(x, y, r * 0.35, a);
    const [x2, y2] = polar(x, y, r * 0.85, a);
    const [x3, y3] = polar(x, y, r, a);
    d += `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`;
    dots += circle(x3, y3, 2.6, '#FFFFFF');
  }
  return circle(x, y, r * 1.1, url('fkGlowPink'), { opacity: 0.6 }) + path(d, 'none', { ...stroke(color, 3.4), opacity: 0.9 }) + dots + sparkle(x, y, r * 0.22, '#FFFFFF');
}

/** Shooting star with a soft golden trail. */
function shootingStar(x: number, y: number): string {
  return g(
    path(`M${x} ${y}L${x - 96} ${y - 40}L${x - 92} ${y - 30}Z`, url('l5trail')) +
    path(`M${x} ${y}L${x - 86} ${y - 28}`, 'none', { ...stroke('#FFF3C8', 3), opacity: 0.8 }) +
    glow(x, y, 22) +
    path(`M${x} ${y - 16}L${x + 5} ${y - 5}L${x + 16} ${y - 4}L${x + 8} ${y + 4}L${x + 10} ${y + 15}L${x} ${y + 9}L${x - 10} ${y + 15}L${x - 8} ${y + 4}L${x - 16} ${y - 4}L${x - 5} ${y - 5}Z`, P.gold, stroke(P.goldDeep, 3)),
    { transform: `translate(${x} ${y}) scale(1.4) translate(${-x} ${-y})` },
  );
}

export const level5: Level = {
  id: 'fk-5',
  title: 'Frostlight Castle Festival',
  findCount: 5,
  differences: [
    {
      id: 'crown',
      kind: 'shape',
      theme: 'matching',
      hit: { type: 'circle', cx: 330, cy: 410, r: 52 },
      label: 'Bobble hat and crown',
      say: 'Pebble wears a bobble hat… and a golden crown!',
    },
    {
      id: 'window',
      kind: 'add',
      theme: 'shapes',
      hit: { type: 'circle', cx: Math.round(WIN[0]), cy: Math.round(WIN[1]), r: 50 },
      label: 'One more castle window',
      say: 'The castle has one more glowing window!',
    },
    {
      id: 'snowflake',
      kind: 'shape',
      theme: 'shapes',
      hit: { type: 'circle', cx: TOP[0], cy: TOP[1], r: 54 },
      label: '6 arms and 8 arms',
      say: 'Real snowflakes have six arms… this one has eight!',
    },
    {
      id: 'buttons',
      kind: 'count',
      theme: 'counting',
      hit: { type: 'rect', x: 38, y: 422, w: 72, h: 162 },
      label: '3 buttons and 4 buttons',
      say: 'Three buttons… and four buttons!',
      count: { a: [0, 1, 2].map(buttonAt), b: [0, 1, 2, 3].map(buttonAt) },
    },
    {
      id: 'flags',
      kind: 'pattern',
      theme: 'patterns',
      hit: { type: 'circle', cx: 189, cy: 224, r: 44 },
      label: 'Blue flag and pink flag',
      say: 'Pink, blue, pink, blue… one flag broke the pattern!',
    },
    // replay extras
    {
      id: 'shooting-star',
      kind: 'add',
      theme: 'nature',
      hit: {
        type: 'poly',
        points: [
          [496, 30],
          [530, 22],
          [640, 56],
          [694, 78],
          [694, 122],
          [652, 142],
          [600, 130],
          [494, 62],
        ],
      },
      label: 'A shooting star',
      say: 'Make a wish! A shooting star!',
    },
    {
      id: 'scarf',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'ellipse', cx: 578, cy: 544, rx: 52, ry: 40 },
      label: 'Mint scarf and lilac scarf',
      say: "Mochi's scarf is mint… and lilac!",
    },
  ],
  draw(c) {
    let s = defs(
      frostDefs(),
      linear('l5sky', [
        [0, '#5F69C6'],
        [0.35, '#8B86DC'],
        [0.62, '#C3A1E2'],
        [0.8, '#F2BEDA'],
      ]),
      linear('l5plaza', [
        [0, '#EDE8FF'],
        [0.5, '#DFDAFA'],
        [1, '#CFCBF4'],
      ]),
      linear(
        'l5trail',
        [
          [0, '#FFF3C8', 0.9],
          [1, '#FFF3C8', 0],
        ],
        1,
        0,
        0,
        0,
      ),
    );
    s += rect(0, 0, 800, 600, 0, url('l5sky'));
    s += skyStars(61, 44, { x: 16, y: 10, w: 768, h: 250 });
    s += aurora(
      'l5au1',
      [
        [-20, 60],
        [150, 24],
        [330, 74],
        [520, 30],
        [820, 64],
      ],
      120,
      ['#9EF2D6', '#C6B3FF'],
      0.55,
    );
    s += aurora(
      'l5au2',
      [
        [-20, 120],
        [180, 96],
        [400, 132],
        [600, 90],
        [820, 116],
      ],
      90,
      ['#FFC3E1', '#A9D8FF'],
      0.4,
    );
    s += firework(470, 58, 30, '#FFD3EA', 3) + firework(90, 64, 26, '#BFF0E0', 4) + firework(764, 176, 22, '#FFE7A3', 5);
    if (c.on('shooting-star')) s += shootingStar(646, 96);

    // distant hills with tiny pines
    s += path('M0 300Q160 266 300 284T560 278T800 286V400H0Z', '#B9B0EA');
    for (const [x, h] of [
      [30, 40],
      [56, 54],
      [740, 50],
      [766, 38],
      [176, 36],
      [620, 40],
    ] as const)
      s += farPine(x, 292, h, '#8E98D6', '#EDEAFF');

    // the castle
    s += castle(CX, CB, CS, { extraWindow: c.on('window') ? 'right' : false, flags: ['#FFB8D6', '#FFE07A', '#B3EECB'] });

    // plaza
    s += path('M0 380Q200 364 400 384T800 376V600H0Z', url('l5plaza')) + path('M0 380Q200 364 400 384T800 376', 'none', { ...stroke('#A9A6E2', 3.5), opacity: 0.7 });
    s += path('M352 386Q330 480 280 600H520Q470 480 448 386Z', '#F6F2FF', { opacity: 0.7 });
    s += ellipse(400, 404, 120, 18, url('fkGlow'), { opacity: 0.8 });

    // bunting (left), pink-blue pattern
    s += path(`M${BUNT[0]} ${BUNT[1]}Q${(BUNT[0] + BUNT[2]) / 2} ${(BUNT[1] + BUNT[3]) / 2 + BUNT[4]} ${BUNT[2]} ${BUNT[3]}`, 'none', stroke('#8E7BC9', 3));
    FLAG_T.forEach((t, i) => {
      const [x, y] = buntingPoint(BUNT[0], BUNT[1], BUNT[2], BUNT[3], BUNT[4], t);
      const pink = i % 2 === 0 || (i === FLAG && c.on('flags'));
      const col = pink ? '#FF9DC4' : '#8FC0F6';
      s += path(`M${n(x - 21)} ${n(y)}L${n(x + 21)} ${n(y)}L${n(x)} ${n(y + 46)}Z`, col, stroke(darken(col, 0.32), 3));
      s += circle(x, y + 16, 5, '#FFFFFF', { opacity: 0.85 });
    });
    // lantern string (right) from the castle turret to the tree
    s += path('M590 252Q650 290 722 268', 'none', stroke('#8E7BC9', 2.6));
    for (const [lx, ly, col] of [
      [612, 266, '#9C86DA'],
      [646, 276, '#F29AC0'],
      [690, 276, '#9C86DA'],
    ] as const)
      s += lantern(lx, ly, 0.6, { color: col, glowR: 40 });

    // festival tree with gifts and the snowflake topper
    s += pine(TOP[0], 470, 226, { lights: true, seed: 12 });
    s += circle(TOP[0], TOP[1], 46, url('fkGlowBlue'));
    s += snowflake(TOP[0], TOP[1], 34, { arms: c.pick('snowflake', 6, 8), color: '#FFF6D8', line: '#D79A3A', width: 6, glowId: false, tipColor: '#FFE07A' });
    s += gift(640, 492, 40, 34, '#FFB0CF', '#FFE07A') + gift(748, 496, 44, 38, '#B3EECB', '#FF9DBB') + gift(690, 500, 34, 28, '#C6B3FF', '#FFFFFF');
    s += chick(640, 452, 0.82, { mood: 'joy', hat: '#FFE07A' }) + chick(748, 452, 0.78, { mood: 'happy', flip: true });

    // ice sculptures flanking the gate
    s += crystalCluster(262, 404, 0.8, 'blue') + crystalCluster(540, 404, 0.8, 'pink');

    // little dancers
    s += bunny(552, 448, 0.74, { mood: 'happy', flip: true, scarf: '#FFB0CF' });

    // the friends
    s += luma(460, 566, { s: 0.98, pose: 'cheer', mood: 'joy', scarf: '#FFB0CF' });
    s += pebble(330, 566, { s: 1.06, pose: 'wave', mood: 'joy', crown: c.on('crown'), hat: '#6DD3A8', scarf: '#FFD66B' });
    s += pip(216, 572, { s: 1.06, pose: 'cheer', mood: 'joy', scarf: P.pinkDeep, look: 1 });
    s += mochi(596, 568, { s: 1.0, mood: 'joy', scarf: c.pick('scarf', '#7FE0B8', '#B79BFF'), flip: false });

    // the big-button snow-friend (left foreground)
    s += snowman(SM[0], SM[1], SM[2], { buttons: c.on('buttons') ? 4 : 3, buttonR: 14, buttonSlots: SM_SLOTS, buttonColors: ['#FF9DBB', '#9CC9FF', '#FFD66B', '#B3EECB'], hat: '#B79BFF', mood: 'happy', arms: false });

    // foreground framing + confetti
    s += snowBank([
      [806, 590, 50],
      [760, 610, 34],
    ]);
    s += crystalCluster(780, 590, 0.9, 'lilac');
    const conf = rng(77);
    s += g(
      range(28)
        .map(() => {
          const x = 140 + conf() * 620;
          const y = 300 + conf() * 280;
          const col = ['#FF9DC4', '#8FC0F6', '#FFE07A', '#9EF2D6', '#C6B3FF'][Math.floor(conf() * 5)];
          const r = Math.floor(conf() * 180);
          return rect(x - 4, y - 2, 8, 4, 1.5, col, { transform: `rotate(${r} ${n(x)} ${n(y)})` });
        })
        .join(''),
    );
    s += fallingSnow(91, 18, { x: 20, y: 160, w: 760, h: 420 }, { big: 4, opacity: 0.8 });
    return s;
  },
  sticker: {
    id: 'st-fk-5',
    name: 'King Pebble',
    draw: () => defs(frostDefs()) + glow(100, 110, 90, 'fkGlow', 0.8) + pebble(104, 182, { s: 0.94, pose: 'wave', mood: 'joy', crown: true, scarf: '#FFD66B' }) + sparkle(36, 64, 9) + sparkle(166, 80, 8),
  },
};
