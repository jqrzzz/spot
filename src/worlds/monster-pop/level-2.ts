/**
 * Level 2 — Drum & Dance Class.
 * Story: Tumtum keeps the beat on his big star drum while Lolo twirls a ribbon in front of the
 * studio mirror and little Fizz shakes her maracas. Music notes bounce up out of the drums.
 */
import type { Level, Point } from '../../core/types.ts';
import { P, circle, cloud, darken, defs, ellipse, heart, lighten, line, linear, path, radial, rainbow, rect, sparkle, stroke, url } from '../../art/kit.ts';
import { fizz, lolo, tumtum } from './characters.ts';
import { bassDrum, bulb, checkerFloor, cymbal, dust, maraca, note, patternDef, sagPoint, snare, stick, tambourine, triangleInst } from './props.ts';

/** Round window with sky; shows a sun or a rainbow. */
function windowView(rainbowOn: boolean): string {
  const x = 100;
  const y = 98;
  return (
    circle(x, y, 58, '#FFC9A8', stroke('#E69373', 4)) +
    circle(x, y, 46, url('sky2')) +
    cloud(x - 16, y + 26, 0.32) +
    cloud(x + 26, y + 34, 0.26) +
    (rainbowOn
      ? rainbow(x, y + 30, 40, 7, ['#FF9FAE', '#FFC59E', '#FFE89A', '#B8EBA6', '#A3D8F7'])
      : circle(x + 6, y - 6, 18, '#FFE07A', stroke('#F2B843', 3)) + circle(x + 1, y - 11, 5, '#fff', { opacity: 0.7 })) +
    path(`M${x - 46} ${y}H${x + 46}M${x} ${y - 46}V${y + 46}`, 'none', stroke('#FFC9A8', 6)) +
    circle(x, y, 46, 'none', stroke('#E69373', 4)) +
    ellipse(x - 20, y - 24, 10, 5, '#fff', { opacity: 0.5, transform: `rotate(-35 ${x - 20} ${y - 24})` })
  );
}

/** Wall shelf with an instrument on it. */
function shelf(triangle: boolean): string {
  return (
    rect(28, 290, 150, 14, 6, P.wood, stroke(P.woodDeep, 3.5)) +
    path('M48 304l10 22M158 304l-10 22', 'none', stroke(P.woodDeep, 5)) +
    // bongos (stay the same)
    snare(146, 266, 18, 22, '#9FDCFF') +
    // the instrument that changes
    (triangle ? triangleInst(84, 284, 1.05, '#B5C2DD') : tambourine(80, 254, 34, '#FF9FB0'))
  );
}

/** Dance-step footprints painted on the floor. */
function footprint(x: number, y: number, color: string, rot: number): string {
  return g2(ellipse(0, 0, 9, 13, color) + circle(-6, -17, 3.2, color) + circle(0, -19, 3.4, color) + circle(6, -17, 3.2, color), x, y, rot);
}
const g2 = (art: string, x: number, y: number, rot: number) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(1 0.55)" opacity="0.7">${art}</g>`;

const RIBBON = 'M592 356C624 326 694 338 692 298C690 262 634 266 642 234C650 202 718 214 724 180C730 150 694 128 670 148';

/** Lolo's dance ribbon: a loopy satin band. */
function ribbon(color: string): string {
  return (
    path(RIBBON, 'none', stroke(darken(color, 0.25), 12)) +
    path(RIBBON, 'none', stroke(color, 7)) +
    path(RIBBON, 'none', { ...stroke(lighten(color, 0.55), 2), opacity: 0.9, 'stroke-dasharray': '30 22' })
  );
}

const STARS_A: Point[] = [
  [212, 474],
  [272, 474],
];
const STAR_EXTRA: Point = [242, 528];

const level: Level = {
  id: 'mp-2',
  title: 'Drum & Dance Class',
  findCount: 4,
  differences: [
    {
      id: 'shelf',
      kind: 'shape',
      theme: 'music',
      hit: { type: 'rect', x: 26, y: 196, w: 102, h: 116 },
      label: 'Tambourine or triangle',
      say: 'A tambourine… and a triangle!',
    },
    {
      id: 'drum-stars',
      kind: 'count',
      theme: 'counting',
      hit: { type: 'circle', cx: 242, cy: 498, r: 66 },
      label: '2 stars and 3 stars',
      say: 'Two stars on the drum… and three stars!',
      count: { a: STARS_A, b: [...STARS_A, STAR_EXTRA] },
    },
    {
      id: 'maracas',
      kind: 'color',
      theme: 'matching',
      hit: { type: 'ellipse', cx: 692, cy: 430, rx: 92, ry: 62 },
      label: 'Matching maracas or not',
      say: "Fizz's maracas match… and in one picture they don't!",
    },
    {
      id: 'note',
      kind: 'remove',
      theme: 'music',
      hit: { type: 'circle', cx: 352, cy: 120, r: 52 },
      label: 'Floating note or no note',
      say: 'One music note floated away!',
    },
    // Extra candidates (replays)
    {
      id: 'ribbon',
      kind: 'color',
      theme: 'colors',
      hit: {
        type: 'poly',
        points: [
          [584, 360],
          [652, 352],
          [708, 322],
          [712, 270],
          [676, 248],
          [716, 236],
          [748, 202],
          [746, 146],
          [700, 116],
          [652, 134],
          [622, 196],
          [622, 252],
          [656, 288],
          [620, 318],
          [580, 338],
        ],
      },
      label: 'Pink ribbon, blue ribbon',
      say: "Lolo's twirly ribbon is pink… or blue!",
    },
    {
      id: 'window',
      kind: 'shape',
      theme: 'memory',
      hit: { type: 'circle', cx: 100, cy: 98, r: 66 },
      label: 'Sunshine or a rainbow',
      say: 'Out of the window: sunshine… or a rainbow!',
    },
  ],
  draw(c) {
    const lights: string[] = [];
    for (let i = 0; i < 9; i++) {
      const [x, y] = sagPoint(196, 10, 790, 10, 14, (i + 0.5) / 9);
      lights.push(line(x, y, x, y + 7, P.inkSoft, 2) + bulb(x, y + 12, 6, ['#FFD66B', '#FF9FC6', '#8FD8FF', '#A8EDC0'][i % 4]));
    }
    const stripes = patternDef('stripe', 44, 44, rect(0, 0, 22, 44, 0, '#fff', { opacity: 0.28 }));
    return (
      defs(
        linear('wall2', [
          [0, '#FFD6C4'],
          [1, '#FFEBD4'],
        ]),
        linear('sky2', [
          [0, '#9FD6FF'],
          [1, '#E3F4FF'],
        ]),
        linear('mirror', [
          [0, '#D9F0FF'],
          [0.5, '#EAF2FF'],
          [1, '#E3DAFF'],
        ], 0, 0, 1, 1),
        linear('wood2', [
          [0, '#F6CF9E'],
          [1, '#EDB57F'],
        ]),
        radial('pool', [
          [0, '#FFF6D8', 0.8],
          [1, '#FFF6D8', 0],
        ]),
        stripes,
      ) +
      // wall
      rect(0, 0, 800, 396, 0, url('wall2')) +
      rect(0, 0, 800, 330, 0, url('stripe')) +
      rect(0, 0, 800, 14, 0, '#F2A98C') +
      // mint wainscot
      rect(0, 326, 800, 70, 0, '#BDEBD5') +
      path('M0 326H800M0 340H800', 'none', stroke('#86CFAE', 3)) +
      path('M60 352V386M200 352V386M340 352V386M480 352V386M620 352V386M760 352V386', 'none', stroke('#9DDCBF', 3)) +
      // floor: honey planks
      checkerFloor({ top: 396, bottom: 600, vx: 420, vy: 200, spacing: 70, rows: [396, 600], base: '#F7D3A6', alt: '#F1C590', line: '#D9A06B' }) +
      path('M0 470H800', 'none', { stroke: '#D9A06B', 'stroke-width': 1.5, opacity: 0.4 }) +
      ellipse(520, 470, 300, 60, url('pool')) +
      path('M0 396H800', 'none', stroke('#86CFAE', 4)) +
      dust(21, 12, { x: 20, y: 420, w: 760, h: 160 }, ['#fff'], 4, 8) +
      footprint(430, 566, '#FF9FC6', -20) +
      footprint(462, 548, '#8FD0FF', 20) +
      footprint(500, 576, '#FF9FC6', -20) +
      footprint(560, 584, '#8FD0FF', 25) +
      // window & shelf
      windowView(c.on('window')) +
      shelf(c.on('shelf')) +
      // the big studio mirror and the barre
      rect(296, 54, 482, 276, 18, '#C9B3F2', stroke('#9C82DE', 4)) +
      rect(308, 66, 458, 252, 12, url('mirror')) +
      path('M360 66L300 160V200L400 66ZM470 66L330 318H368L508 66Z', '#fff', { opacity: 0.38 }) +
      path('M690 66L620 318H640L710 66Z', '#fff', { opacity: 0.3 }) +
      sparkle(740, 96, 9, '#fff') +
      sparkle(330, 290, 7, '#fff') +
      path('M300 272H776', 'none', stroke(P.woodDeep, 13)) +
      path('M300 272H776', 'none', stroke(P.wood, 7)) +
      path('M300 270H776', 'none', stroke('#FFE2C2', 2)) +
      path('M340 272V330M540 272V330M740 272V330', 'none', stroke('#B9A6D9', 6)) +
      lights.join('') +
      path('M196 10Q493 38 790 10', 'none', stroke(P.inkSoft, 2)) +
      // floating notes from the drum (the top one can float away)
      note(316, 304, 0.6, '#FF8FBF', 'eighth', -12) +
      note(268, 228, 0.78, '#7FC4FF', 'beamed', 8) +
      (c.on('note') ? '' : note(344, 136, 1.05, '#B48CFF', 'eighth', -8)) +
      sparkle(220, 170, 7, '#fff') +
      sparkle(396, 220, 6, '#FFD66B') +
      // drum kit: hi-hat, snare, Tumtum, bass drum
      cymbal(120, 378, 46, 176) +
      snare(374, 428, 42, 40, '#FFB0C8') +
      path('M350 466L340 560M398 466L408 560', 'none', stroke('#9A8BB8', 4)) +
      tumtum({
        x: 242,
        y: 476,
        s: 0.95,
        mood: 'joy',
        armL: 'up',
        armR: 'drum',
        holdL: (x, y) => stick(x, y, -25),
        holdR: (x, y) => stick(x, y, 112),
        shadow: false,
      }) +
      bassDrum(242, 498, 88, '#FF9FBF', [
        [-0.34, -0.27, 'star', '#FFD24D', 1.9],
        [0.34, -0.27, 'star', '#FFD24D', 1.9],
        ...(c.on('drum-stars') ? ([[0, 0.34, 'star', '#FFD24D', 1.9]] as Array<[number, number, 'star', string, number]>) : []),
        [-0.5, 0.3, 'dot', '#8FD0FF', 1.3],
        [0.5, 0.3, 'dot', '#8FD0FF', 1.3],
      ]) +
      // Lolo dancing with a ribbon
      lolo({ x: 500, y: 560, s: 1.12, mood: 'joy', armL: 'out', armR: 'up', holdR: (x, y) => path(`M${x} ${y + 6}L${x + 12} ${y - 42}`, 'none', stroke(P.woodDeep, 6)) + path(`M${x} ${y + 6}L${x + 12} ${y - 42}`, 'none', stroke(P.wood, 2.5)) + circle(x + 12, y - 43, 4, P.gold, stroke(P.goldDeep, 2)) }) +
      ribbon(c.pick('ribbon', '#FF8FC0', '#7CC4FF')) +
      // Fizz with maracas
      ellipse(690, 584, 40, 7, P.ink, { opacity: 0.12 }) +
      fizz({
        x: 690,
        y: 548,
        s: 0.88,
        mood: 'wink',
        armL: 'cheer',
        armR: 'cheer',
        holdL: (x, y) => maraca(x, y, '#FF8FBF', -22, 1.45),
        holdR: (x, y) => maraca(x, y, c.pick('maracas', '#FF8FBF', '#FFD84D'), 22, 1.45),
        shadow: false,
      }) +
      sparkle(612, 400, 7, '#fff') +
      sparkle(770, 380, 6, '#fff') +
      // foreground: water bottle & towel
      rect(24, 528, 90, 30, 12, '#C9B3FF', stroke('#9C82DE', 3.5)) +
      path('M30 540H108', 'none', stroke('#fff', 3)) +
      rect(108, 470, 34, 86, 12, '#9FE8D4', stroke('#4FB79A', 3.5)) +
      rect(114, 458, 22, 16, 5, '#FF9FC6', stroke(P.pinkDeep, 3)) +
      heart(125, 512, 8, '#fff') +
      ellipse(84, 560, 70, 8, P.ink, { opacity: 0.1 })
    );
  },
  sticker: {
    id: 'st-mp-2',
    name: 'Star Drum',
    draw: () =>
      bassDrum(100, 104, 74, '#FF9FBF', [
        [-0.34, -0.27, 'star', '#FFD24D', 1.9],
        [0.34, -0.27, 'star', '#FFD24D', 1.9],
        [0, 0.34, 'star', '#FFD24D', 1.9],
        [-0.5, 0.3, 'dot', '#8FD0FF', 1.3],
        [0.5, 0.3, 'dot', '#8FD0FF', 1.3],
      ]) +
      stick(40, 60, -30) +
      stick(160, 60, 30) +
      note(160, 40, 0.5, '#B48CFF', 'eighth'),
  },
};

export default level;
