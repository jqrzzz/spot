/**
 * Level 3 — The Costume Room.
 * Story: Plinky tries on her show costume on a little podium while Lolo holds up a heart mirror
 * for her. A cape waits on the dress form, the vanity mirror glows with bulbs — and little Fizz
 * has curled up for a nap inside a hat box.
 */
import type { Level } from '../../core/types.ts';
import { P, circle, darken, defs, ellipse, g, heart, lighten, line, linear, path, radial, rect, sparkle, star, stroke, url } from '../../art/kit.ts';
import { fizz, lolo, plinky } from './characters.ts';
import { beam, bulb, dust, patternDef, sagPoint } from './props.ts';

/* ---------------------------------------------------------------- local art */

type Garment = 'dress' | 'jacket' | 'tutu' | 'skirt';

/** A costume on a hanger. (x, y) = top of the hook on the rail. `print` is a pattern id. */
function garment(x: number, y: number, kind: Garment, color: string, print: string): string {
  const lc = darken(color, 0.38);
  let shape = '';
  if (kind === 'dress') shape = 'M-18 18L18 18L14 62Q36 120 40 150Q20 160 0 152Q-20 160 -40 150Q-36 120 -14 62Z';
  else if (kind === 'jacket') shape = 'M-24 18L24 18L36 30L40 108L26 112L24 70L22 126L-22 126L-24 70L-26 112L-40 108L-36 30Z';
  else if (kind === 'tutu') shape = 'M-14 18L14 18L12 60L-12 60Z';
  else shape = 'M-22 26L22 26L42 118Q0 128 -42 118Z';
  const t = `translate(${x} ${y})`;
  const hook = path('M0 0q0 -9 6 -9q6 0 5 6', 'none', stroke('#9C8BBE', 3)) + path('M-26 20L0 6L26 20', 'none', stroke('#9C8BBE', 4));
  let body = path(shape, color, stroke(lc, 3.5)) + path(shape, url(print));
  if (kind === 'tutu') {
    const puffs: Array<[number, number, number]> = [
      [-30, 72, 16],
      [-12, 76, 18],
      [8, 76, 18],
      [28, 72, 16],
      [-20, 88, 15],
      [18, 88, 15],
      [0, 92, 15],
    ];
    body += puffs.map(([px, py, r]) => circle(px, py, r + 2, lc)).join('') + puffs.map(([px, py, r]) => circle(px, py, r - 1.5, lighten(color, 0.25))).join('') + puffs.slice(0, 4).map(([px, py]) => sparkle(px, py - 4, 4, '#fff')).join('');
  }
  if (kind === 'jacket') body += path('M0 18V126', 'none', stroke(lc, 3)) + circle(-6, 50, 3, P.gold) + circle(-6, 80, 3, P.gold);
  if (kind === 'skirt') body = path('M-24 24L-24 14M24 24L24 14', 'none', stroke('#9C8BBE', 4)) + body + rect(-24, 22, 48, 10, 4, lighten(color, 0.3), stroke(lc, 3));
  return `<g transform="${t}">${hook}${body}</g>`;
}

/** A hair bow. */
function bow(x: number, y: number, color: string, s = 1): string {
  const lc = darken(color, 0.38);
  return g(
    path('M0 0L-22 -13Q-28 0 -22 13Z', color, stroke(lc, 3.2)) +
      path('M0 0L22 -13Q28 0 22 13Z', color, stroke(lc, 3.2)) +
      path('M-3 4L-10 22M3 4L10 22', 'none', stroke(lc, 5)) +
      path('M-3 4L-10 22M3 4L10 22', 'none', stroke(color, 2)) +
      circle(0, 0, 6.5, lighten(color, 0.3), stroke(lc, 3)),
    { transform: `translate(${x} ${y}) scale(${s})` },
  );
}

/** Top hat or crown, sitting on the shelf at (x, y). */
function hat(x: number, y: number, crown: boolean): string {
  if (crown)
    return (
      path(`M${x - 34} ${y}L${x - 40} ${y - 46}L${x - 18} ${y - 24}L${x} ${y - 58}L${x + 18} ${y - 24}L${x + 40} ${y - 46}L${x + 34} ${y}Z`, P.gold, stroke(P.goldDeep, 4)) +
      rect(x - 36, y - 12, 72, 12, 4, '#FFE7A0', stroke(P.goldDeep, 3)) +
      circle(x, y - 26, 6, P.pinkDeep, stroke('#C24E86', 2)) +
      circle(x - 22, y - 6, 4, P.aquaDeep) +
      circle(x + 22, y - 6, 4, P.aquaDeep) +
      circle(x - 40, y - 48, 5, P.pink, stroke(P.pinkDeep, 2)) +
      circle(x + 40, y - 48, 5, P.pink, stroke(P.pinkDeep, 2)) +
      circle(x, y - 60, 5, P.pink, stroke(P.pinkDeep, 2))
    );
  return (
    ellipse(x, y - 4, 42, 9, '#6E5B9C', stroke(P.ink, 3.5)) +
    path(`M${x - 26} ${y - 6}L${x - 24} ${y - 60}Q${x} ${y - 68} ${x + 24} ${y - 60}L${x + 26} ${y - 6}Q${x} ${y} ${x - 26} ${y - 6}Z`, '#7E6BB0', stroke(P.ink, 3.5)) +
    path(`M${x - 25} ${y - 22}Q${x} ${y - 16} ${x + 25} ${y - 22}L${x + 25} ${y - 32}Q${x} ${y - 26} ${x - 25} ${y - 32}Z`, P.pinkDeep) +
    star(x + 12, y - 27, 7, P.gold, { width: 1.5 }) +
    ellipse(x - 14, y - 44, 4, 10, '#fff', { opacity: 0.3 })
  );
}

/** Sleepy "z" drawn as a shape. */
function zz(x: number, y: number, s: number): string {
  return path(`M${x - 6 * s} ${y - 6 * s}H${x + 6 * s}L${x - 6 * s} ${y + 6 * s}H${x + 6 * s}`, 'none', stroke('#9C82DE', 3.4 * Math.max(0.8, s * 0.8)));
}

/** Round hat box with Fizz inside. */
function hatBox(asleep: boolean): string {
  const x = 596;
  const y = 488;
  return (
    ellipse(x + 8, 586, 100, 14, P.ink, { opacity: 0.14 }) +
    ellipse(x, y, 82, 22, '#E07FAE', stroke(P.pinkDeep, 4)) +
    fizz({ x, y: y + 46, s: 1.3, mood: asleep ? 'sleepy' : 'surprised', armL: 'front', armR: 'front', shadow: false }) +
    path(`M${x - 82} ${y}V${y + 84}Q${x} ${y + 112} ${x + 82} ${y + 84}V${y}Q${x} ${y + 26} ${x - 82} ${y}Z`, '#FFB8D6', stroke(P.pinkDeep, 4)) +
    path(`M${x - 82} ${y + 70}Q${x} ${y + 98} ${x + 82} ${y + 70}`, 'none', stroke('#fff', 5)) +
    path(`M${x - 82} ${y + 58}Q${x} ${y + 86} ${x + 82} ${y + 58}`, 'none', stroke('#B79BFF', 5)) +
    heart(x - 40, y + 40, 10, '#fff', { opacity: 0.9 }) +
    heart(x + 6, y + 48, 12, '#fff', { opacity: 0.9 }) +
    heart(x + 50, y + 38, 10, '#fff', { opacity: 0.9 }) +
    ellipse(x - 56, y + 30, 6, 18, '#fff', { opacity: 0.4 }) +
    (asleep ? zz(x + 50, y - 40, 1.5) + zz(x + 64, y - 62, 1.05) : sparkle(x + 56, y - 56, 10, P.gold) + sparkle(x - 58, y - 52, 8, P.gold))
  );
}

/** Dress form with a cape (spots or stripes). */
function dressForm(stripes: boolean): string {
  const x = 712;
  const cape = 'M672 176Q712 160 752 176L772 360Q712 376 652 360Z';
  return (
    ellipse(x, 504, 46, 9, P.ink, { opacity: 0.14 }) +
    path(`M${x} 380V492M${x - 34} 502L${x} 486L${x + 34} 502`, 'none', stroke(P.woodDeep, 7)) +
    ellipse(x, 150, 14, 10, P.wood, stroke(P.woodDeep, 3)) +
    path(`M${x - 40} 172Q${x} 150 ${x + 40} 172L${x + 34} 250Q${x + 40} 300 ${x + 28} 380H${x - 28}Q${x - 40} 300 ${x - 34} 250Z`, '#FFF1E2', stroke('#E2B99A', 3.5)) +
    path(cape, '#B79BFF', stroke('#7F60D8', 4)) +
    path(cape, url(stripes ? 'capeStripes' : 'capeDots')) +
    path('M672 176Q712 196 752 176', 'none', stroke('#7F60D8', 4)) +
    path(`M${x - 40} 176Q${x} 206 ${x + 40} 176L${x + 28} 168Q${x} 186 ${x - 28} 168Z`, P.gold, stroke(P.goldDeep, 3)) +
    star(x, 196, 9, P.gold, { outline: P.goldDeep, width: 2.5 })
  );
}

/** Vanity mirror with marquee bulbs and a table with little treasures. */
function vanity(): string {
  const bulbs: string[] = [];
  for (let i = 0; i < 6; i++) bulbs.push(bulb(452 + i * 36, 74, 6.5, P.lemon));
  for (let i = 0; i < 5; i++) bulbs.push(bulb(440, 102 + i * 36, 6.5, P.lemon) + bulb(644, 102 + i * 36, 6.5, P.lemon));
  return (
    rect(424, 58, 236, 252, 22, '#FFD9EA', stroke('#E07FAE', 4)) +
    rect(454, 92, 176, 206, 70, url('glass3'), stroke('#E07FAE', 3.5)) +
    path('M500 104L470 170V196L530 104ZM590 120L510 290H534L606 140Z', '#fff', { opacity: 0.4 }) +
    sparkle(600, 120, 9, '#fff') +
    bulbs.join('') +
    rect(410, 300, 264, 20, 8, '#F7B5D2', stroke('#E07FAE', 4)) +
    path('M418 320Q430 340 446 322Q462 342 478 322Q494 342 510 322Q526 342 542 322Q558 342 574 322Q590 342 606 322Q622 342 638 322Q654 342 666 320', '#FFD9EA', stroke('#E07FAE', 3.5)) +
    rect(420, 326, 244, 140, 0, '#FFD9EA') +
    path('M440 336V460M480 336V460M520 336V460M560 336V460M600 336V460M640 336V460', 'none', stroke('#F7B5D2', 6)) +
    // treasures on the table
    rect(588, 266, 26, 34, 8, '#A8EDE3', stroke('#3BB2AA', 3)) +
    circle(601, 260, 8, '#FFD66B', stroke(P.goldDeep, 2.5)) +
    path('M470 300V282Q470 270 482 270H498Q508 270 508 282V300Z', '#C9B3FF', stroke('#8E73CF', 3)) +
    heart(489, 286, 7, '#fff')
  );
}

/* ---------------------------------------------------------------- the level */

const level: Level = {
  id: 'mp-3',
  title: 'The Costume Room',
  findCount: 4,
  differences: [
    {
      id: 'fizz-face',
      kind: 'expression',
      theme: 'emotions',
      hit: { type: 'circle', cx: 600, cy: 458, r: 80 },
      label: 'Sleepy Fizz, surprised Fizz',
      say: 'Fizz is sleepy… and Fizz is surprised!',
    },
    {
      id: 'cape',
      kind: 'pattern',
      theme: 'patterns',
      hit: { type: 'rect', x: 640, y: 164, w: 144, h: 206 },
      label: 'Spotty cape, stripy cape',
      say: 'A spotty cape… and a stripy cape!',
    },
    {
      id: 'plinky-face',
      kind: 'expression',
      theme: 'emotions',
      hit: { type: 'circle', cx: 288, cy: 352, r: 66 },
      label: 'Laughing or heart eyes',
      say: 'Plinky is laughing… and Plinky has heart eyes! She loves her costume.',
    },
    {
      id: 'bows',
      kind: 'pattern',
      theme: 'patterns',
      hit: { type: 'rect', x: 560, y: 16, w: 100, h: 66 },
      label: 'Blue bow, pink bow',
      say: 'Pink, blue, pink, blue… one bow broke the pattern!',
    },
    // Extra candidates (replays)
    {
      id: 'hat',
      kind: 'shape',
      theme: 'shapes',
      hit: { type: 'circle', cx: 196, cy: 64, r: 48 },
      label: 'Top hat or crown',
      say: 'A tall top hat… and a sparkly crown!',
    },
    {
      id: 'jacket',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'rect', x: 80, y: 128, w: 76, h: 156 },
      label: 'Green jacket, purple jacket',
      say: 'A green jacket… and a purple jacket!',
    },
  ],
  draw(c) {
    // bow garland across the top: pink, blue, pink, blue, pink (one may break the pattern)
    const bowColors = ['#FF9FC6', '#8FCBFF', '#FF9FC6', c.pick('bows', '#8FCBFF', '#FF9FC6'), '#FF9FC6'];
    const garland = bowColors
      .map((col, i) => {
        const [x, y] = sagPoint(374, 20, 710, 20, 12, (i + 0.5) / 5);
        return bow(x, y + 8, col, 1.18);
      })
      .join('');
    return (
      defs(
        linear('wall3', [
          [0, '#FFD3E4'],
          [1, '#FFE6EF'],
        ]),
        linear('glass3', [
          [0, '#E4F3FF'],
          [1, '#F1E4FF'],
        ], 0, 0, 1, 1),
        linear('carpet', [
          [0, '#D8C6FA'],
          [1, '#CDB6F5'],
        ]),
        radial('rug', [
          [0, '#FFE3F0'],
          [1, '#FFC6DE'],
        ]),
        patternDef('wp3', 48, 48, heart(12, 12, 5, '#fff', { opacity: 0.55 }) + circle(36, 36, 2.5, '#fff', { opacity: 0.5 })),
        patternDef('pStripe', 18, 18, rect(0, 0, 18, 8, 0, '#FF9FC6')),
        patternDef('pDots', 20, 20, circle(5, 5, 4, '#fff') + circle(15, 15, 4, '#fff')),
        patternDef('pStars', 26, 26, star(8, 8, 5, '#FFF4B8', { width: 1 }) + star(21, 20, 4, '#fff', { width: 1 })),
        patternDef('pZig', 20, 14, path('M0 10L5 4L10 10L15 4L20 10', 'none', stroke('#fff', 3))),
        patternDef('capeDots', 30, 30, circle(8, 8, 6.5, '#FFE27A') + circle(23, 23, 6.5, '#FFE27A')),
        patternDef('capeStripes', 30, 30, rect(0, 0, 30, 13, 0, '#FFE27A')),
      ) +
      // wall + floor
      rect(0, 0, 800, 410, 0, url('wall3')) +
      rect(0, 0, 800, 410, 0, url('wp3')) +
      rect(0, 0, 800, 12, 0, '#F49AC1') +
      rect(0, 410, 800, 190, 0, url('carpet')) +
      rect(0, 400, 800, 14, 0, '#F7B5D2', stroke('#E07FAE', 3)) +
      dust(31, 10, { x: 20, y: 430, w: 760, h: 150 }, ['#fff'], 4, 7, 0.8) +
      // soft spotlight on the podium
      beam('l3beam', 250, -10, 290, 520, 26, 110, '#FFF6C9', 0.55) +
      // hat shelf + hats
      rect(26, 92, 236, 14, 6, P.wood, stroke(P.woodDeep, 3.5)) +
      path('M50 106l10 18M238 106l-10 18', 'none', stroke(P.woodDeep, 5)) +
      path('M52 92V58Q52 50 60 50H112Q120 50 120 58V92Z', '#A8EDE3', stroke('#3BB2AA', 3.5)) +
      path('M48 58Q86 44 124 58', 'none', stroke('#3BB2AA', 4)) +
      heart(86, 74, 9, '#fff') +
      hat(196, 92, c.on('hat')) +
      // clothes rack with costumes
      path('M30 470V136M250 470V136', 'none', stroke('#B9A6D9', 7)) +
      path('M22 136H258', 'none', stroke('#9C82DE', 8)) +
      circle(30, 478, 9, '#9C82DE') +
      circle(250, 478, 9, '#9C82DE') +
      path('M30 440H250', 'none', stroke('#B9A6D9', 6)) +
      garment(62, 136, 'dress', '#FFE27A', 'pStripe') +
      garment(118, 136, 'jacket', c.pick('jacket', '#9FE8C8', '#C2A6FF'), 'pDots') +
      garment(174, 136, 'tutu', '#C9B3FF', 'pStars') +
      garment(228, 136, 'skirt', '#8FCBFF', 'pZig') +
      // shoe pairs under the rack
      path('M48 438Q48 424 62 424H78Q86 424 86 432V438Z', '#FF9FC6', stroke(P.pinkDeep, 3)) +
      path('M92 438Q92 424 106 424H122Q130 424 130 432V438Z', '#FF9FC6', stroke(P.pinkDeep, 3)) +
      path('M168 438Q168 424 182 424H198Q206 424 206 432V438Z', '#FFE27A', stroke(P.goldDeep, 3)) +
      path('M208 438Q208 424 222 424H236Q244 424 244 432V438Z', '#FFE27A', stroke(P.goldDeep, 3)) +
      // vanity + bow garland
      vanity() +
      path('M374 20Q542 68 710 20', 'none', stroke(P.inkSoft, 2.5)) +
      garland +
      // dress form with the cape
      dressForm(c.on('cape')) +
      // round rug + podium + Plinky
      ellipse(288, 552, 170, 40, url('rug'), stroke('#F49AC1', 4)) +
      ellipse(288, 552, 140, 30, 'none', { ...stroke('#fff', 3), 'stroke-dasharray': '2 12' }) +
      path('M218 520V546Q288 574 358 546V520Z', '#C9B3FF', stroke('#8E73CF', 4)) +
      ellipse(288, 520, 70, 16, '#E4D8FF', stroke('#8E73CF', 4)) +
      plinky({ x: 288, y: 528, s: 1.26, mood: c.pick('plinky-face', 'joy', 'love'), armL: 'hip', armR: 'up', print: 'stars', extra: 'bow', acc: '#FFD66B', shadow: false }) +
      sparkle(200, 300, 9, '#fff') +
      sparkle(380, 250, 7, '#fff') +
      sparkle(366, 470, 6, '#fff') +
      // Lolo with a heart hand-mirror
      lolo({
        x: 468,
        y: 566,
        s: 0.95,
        mood: 'wink',
        armL: 'out',
        armR: 'down',
        holdL: (x, y) => line(x, y, x - 12, y - 20, P.woodDeep, 6) + heart(x - 22, y - 36, 20, '#FFB8D6', stroke(P.pinkDeep, 3.5)) + heart(x - 22, y - 37, 12, '#E8F4FF') + circle(x - 27, y - 41, 3, '#fff'),
      }) +
      // the hat box with Fizz
      hatBox(!c.on('fizz-face'))
    );
  },
  sticker: {
    id: 'st-mp-3',
    name: 'Sleepy Fizz',
    draw: () => `<g transform="translate(100 100) scale(0.64) translate(-612 -474)">${hatBox(true)}</g>`,
  },
};

export default level;
