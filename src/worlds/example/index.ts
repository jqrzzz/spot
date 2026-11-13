/**
 * PATTERN REFERENCE ONLY — not part of the game. Shows how a world and a level are written:
 *  - small art helpers (tree, apple, friend…) that take the varying bits as parameters,
 *  - one draw(c) that composes the scene back-to-front and asks c.on()/c.pick() for each difference,
 *  - an explicit differences list whose hit shapes cover exactly where the pictures differ.
 * Real worlds should go well beyond this in richness, storytelling and charm.
 */
import type { Level, Point, World } from '../../core/types.ts';
import {
  P,
  circle,
  cloud,
  darken,
  defs,
  ellipse,
  face,
  g,
  linear,
  path,
  puff,
  rainbow,
  radial,
  scatter,
  shadow,
  shine,
  sparkle,
  star,
  stroke,
  url,
} from '../../art/kit.ts';

/* ---------------------------------------------------------------- art helpers */

function apple([x, y]: Point): string {
  return g(
    circle(x, y, 15, '#FF8FA0', stroke('#DC6580', 3)) +
      shine(x - 5, y - 5, 5, 3.4) +
      path(`M${x} ${y - 13}q1 -7 6 -9`, 'none', stroke(P.woodDeep, 3)) +
      ellipse(x + 8, y - 19, 6.5, 3.2, P.leaf, { transform: `rotate(-25 ${x + 8} ${y - 19})` }),
  );
}

function tree(x: number, y: number, apples: Point[]): string {
  const trunk = path(
    `M${x - 20} ${y + 130}Q${x - 10} ${y + 60} ${x - 14} ${y + 10}L${x + 14} ${y + 10}Q${x + 10} ${y + 60} ${x + 20} ${y + 130}Z`,
    P.wood,
    stroke(P.woodDeep, 4),
  );
  const canopy = puff(
    [
      [x - 62, y - 8, 52],
      [x + 58, y - 14, 56],
      [x, y - 58, 66],
      [x - 24, y + 18, 50],
      [x + 34, y + 22, 48],
    ],
    P.grass,
    P.grassDeep,
    5,
  );
  return shadow(x, y + 132, 70, 12) + trunk + canopy + shine(x - 30, y - 80, 26, 12) + apples.map(apple).join('');
}

function friend(x: number, y: number, bow: boolean): string {
  const body = puff(
    [
      [x, y, 58],
      [x - 40, y + 20, 30],
      [x + 40, y + 20, 30],
    ],
    '#FFF4FA',
    P.pinkDeep,
    4,
  );
  const ears =
    ellipse(x - 34, y - 50, 14, 22, '#FFF4FA', { ...stroke(P.pinkDeep, 4), transform: `rotate(-18 ${x - 34} ${y - 50})` }) +
    ellipse(x + 34, y - 50, 14, 22, '#FFF4FA', { ...stroke(P.pinkDeep, 4), transform: `rotate(18 ${x + 34} ${y - 50})` }) +
    ellipse(x - 34, y - 48, 6, 12, P.pink, { transform: `rotate(-18 ${x - 34} ${y - 48})` }) +
    ellipse(x + 34, y - 48, 6, 12, P.pink, { transform: `rotate(18 ${x + 34} ${y - 48})` });
  const ribbon = bow
    ? g(
        path(`M${x + 30} ${y - 46}l-22 -14v28z`, P.lilac, stroke(P.lilacDeep, 3.5)) +
          path(`M${x + 30} ${y - 46}l22 -14v28z`, P.lilac, stroke(P.lilacDeep, 3.5)) +
          circle(x + 30, y - 46, 7, P.grape, stroke(P.lilacDeep, 3)),
      )
    : '';
  return shadow(x, y + 56, 72, 12) + ears + body + shine(x - 22, y - 26, 18, 10) + face({ x, y: y - 6, s: 1.15, mood: 'happy' }) + ribbon;
}

function flower(x: number, y: number, color: string): string {
  const petals = [0, 72, 144, 216, 288]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      return ellipse(x + Math.cos(r) * 17, y + Math.sin(r) * 17, 15, 11, color, { ...stroke(darken(color, 0.28), 3), transform: `rotate(${a} ${x + Math.cos(r) * 17} ${y + Math.sin(r) * 17})` });
    })
    .join('');
  return (
    path(`M${x} ${y + 10}q-6 40 2 70`, 'none', stroke(P.grassDeep, 5)) +
    ellipse(x - 12, y + 52, 13, 6, P.leaf, { transform: `rotate(-30 ${x - 12} ${y + 52})` }) +
    petals +
    circle(x, y, 10, P.lemon, stroke(P.lemonDeep, 3))
  );
}

/* ---------------------------------------------------------------- the level */

const APPLES: Point[] = [
  [566, 226],
  [628, 212],
  [604, 272],
];
const APPLE_EXTRA: Point = [652, 266];

const exampleLevel: Level = {
  id: 'ex-1',
  title: 'Example Meadow',
  findCount: 4,
  differences: [
    {
      id: 'apples',
      kind: 'count',
      theme: 'counting',
      hit: { type: 'circle', cx: 610, cy: 240, r: 72 },
      label: '3 apples and 4 apples',
      say: 'Three apples… and four apples!',
      count: { a: APPLES, b: [...APPLES, APPLE_EXTRA] },
    },
    {
      id: 'sky-shape',
      kind: 'shape',
      theme: 'shapes',
      hit: { type: 'circle', cx: 420, cy: 110, r: 48 },
      label: 'Yellow star, blue circle',
      say: 'A yellow star… and a blue circle!',
    },
    {
      id: 'bow',
      kind: 'add',
      theme: 'matching',
      hit: { type: 'circle', cx: 358, cy: 414, r: 44 },
      label: 'Bow or no bow?',
      say: 'One friend is wearing a bow!',
    },
    {
      id: 'flower',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'circle', cx: 708, cy: 498, r: 52 },
      label: 'Pink flower, purple flower',
      say: 'A pink flower… and a purple flower!',
    },
    // Extra candidates (used on replays)
    {
      id: 'cloud',
      kind: 'add',
      theme: 'weather',
      hit: { type: 'ellipse', cx: 150, cy: 84, rx: 78, ry: 46 },
      label: 'One more cloud',
      say: 'Look! One more fluffy cloud.',
    },
    {
      id: 'stripes',
      kind: 'count',
      theme: 'colors',
      hit: { type: 'ellipse', cx: 190, cy: 300, rx: 70, ry: 42 },
      label: '6 stripes and 7 stripes',
      say: 'Six rainbow stripes… and seven!',
    },
  ],
  draw(c) {
    const grassDots = scatter(7, 26, { x: 20, y: 440, w: 760, h: 140 }, 30)
      .map(([x, y]) => path(`M${x} ${y}q3 -9 6 0`, 'none', stroke(P.grassDeep, 3)))
      .join('');
    const stripes = c.on('stripes') ? [...P.rainbow, '#FFB3D6'] : P.rainbow;
    return (
      defs(
        linear('sky', [
          [0, '#BFE6FF'],
          [0.65, '#F3E6FF'],
          [1, '#FFE6F1'],
        ]),
        radial('sun', [
          [0, '#FFF6C9'],
          [0.6, '#FFE38A'],
          [1, '#FFD36B'],
        ]),
        linear('hillFar', [
          [0, '#C9F0CF'],
          [1, '#B2E6BD'],
        ]),
        linear('hillNear', [
          [0, '#A8E4A9'],
          [1, '#8ED69A'],
        ]),
      ) +
      // sky
      `<rect width="800" height="600" fill="${url('sky')}"/>` +
      circle(690, 92, 46, url('sun')) +
      sparkle(620, 60, 9) +
      sparkle(760, 150, 7) +
      cloud(560, 70, 0.75) +
      (c.on('cloud') ? cloud(150, 86, 0.82) : '') +
      // star → circle
      (c.on('sky-shape') ? circle(420, 110, 26, P.blue, stroke(P.blueDeep, 4)) + shine(412, 102, 8, 5) : star(420, 112, 30, P.lemon, { outline: P.lemonDeep, width: 5 })) +
      // rainbow behind the hills
      rainbow(190, 330, 172, 17, stripes) +
      // far + near hills
      path('M0 330Q160 270 330 320T640 300T800 300V600H0Z', url('hillFar')) +
      path('M0 420Q200 360 420 400T800 380V600H0Z', url('hillNear')) +
      grassDots +
      // characters & props
      tree(610, 250, c.on('apples') ? [...APPLES, APPLE_EXTRA] : APPLES) +
      friend(330, 470, c.on('bow')) +
      flower(708, 498, c.pick('flower', '#FFB0CF', '#C9B2FF'))
    );
  },
  sticker: {
    id: 'st-ex-1',
    name: 'Example Apple',
    draw: () => g(circle(100, 108, 62, '#FF8FA0', stroke('#DC6580', 6)) + shine(80, 86, 18, 12) + face({ x: 100, y: 108, s: 1.6, mood: 'joy' }), {}),
  },
};

const example: World = {
  id: 'example',
  name: 'Example World',
  tagline: 'Pattern reference',
  theme: { sky: ['#C2E7FF', '#FFE6F1'], accent: '#9C7EEB', deep: '#3D2C52', path: '#FFFFFF' },
  music: 'valley',
  cover: () => exampleLevel.draw({ on: () => false, pick: (_id, a) => a }),
  levels: [exampleLevel],
  badge: {
    id: 'badge-ex',
    name: 'Example Badge',
    draw: () => star(100, 104, 70, P.gold, { outline: P.goldDeep, width: 8 }) + face({ x: 100, y: 104, s: 1.4, mood: 'happy' }),
  },
};

export default example;
