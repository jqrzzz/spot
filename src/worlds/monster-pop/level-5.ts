/**
 * Level 5 — The Big Sparkle Concert.
 * Story: showtime! The whole band performs under the giant marquee star: Plinky sings, Lolo
 * plays the keytar, Tumtum drums on the riser and Fizz flies overhead with a magic wand.
 * Little monster fans cheer from the front row with glow sticks and signs.
 */
import type { Level, Point } from '../../core/types.ts';
import { P, circle, darken, shine, defs, ellipse, g, heart, lighten, line, linear, path, puff, radial, rect, rng, sparkle, star, stroke, url, face } from '../../art/kit.ts';
import { fizz, lolo, plinky, tumtum } from './characters.ts';
import { bassDrum, beam, bulbRow, cymbal, discoBall, dust, keytar, mic, note, snare, spotCan, starSign, stick } from './props.ts';

/* ---------------------------------------------------------------- local art */

/** Heart-shaped sunglasses for Lolo (local to Lolo). */
const GLASSES =
  path('M-12 -158Q0 -164 12 -158', 'none', stroke('#C24E86', 4)) +
  heart(-22, -156, 17, '#FF7FB8', { ...stroke('#C24E86', 3.5), opacity: 0.95 }) +
  heart(22, -156, 17, '#FF7FB8', { ...stroke('#C24E86', 3.5), opacity: 0.95 }) +
  path('M-38 -160L-48 -166M38 -160L48 -166', 'none', stroke('#C24E86', 4)) +
  ellipse(-27, -161, 4, 2.6, '#fff', { opacity: 0.85 }) +
  ellipse(17, -161, 4, 2.6, '#fff', { opacity: 0.85 });

/** Magic wand with a star or a moon. Drawn in Fizz's local space at the hand. */
function wand(moon: boolean): (hx: number, hy: number) => string {
  return (hx, hy) => {
    const tx = hx + 8;
    const ty = hy - 58;
    const tip = moon
      ? path(`M${tx + 8} ${ty - 32}A32 32 0 1 0 ${tx + 14} ${ty + 30}A24 24 0 1 1 ${tx + 8} ${ty - 32}Z`, '#FFE27A', stroke(P.goldDeep, 3.5))
      : star(tx, ty, 33, '#FFE27A', { outline: P.goldDeep, width: 3.5 });
    return line(hx, hy, tx, ty + 16, '#B79BFF', 7) + line(hx, hy, tx, ty + 16, '#E4D8FF', 3) + circle(tx, ty, 36, '#FFF3B0', { opacity: 0.3 }) + tip + circle(tx - 6, ty - 6, 4, '#fff', { opacity: 0.8 });
  };
}

interface Fan {
  x: number;
  color: string;
  ears: 'horns' | 'ears' | 'antenna' | 'antennae' | 'bow' | 'tuft';
}

/** A fan in the front row, seen from behind: round head on little shoulders. */
function fan(f: Fan): string {
  const { x, color } = f;
  const lc = darken(color, 0.35);
  const hy = 546;
  let top = '';
  if (f.ears === 'horns')
    top = path(`M${x - 34} ${hy - 30}Q${x - 50} ${hy - 62} ${x - 36} ${hy - 72}Q${x - 26} ${hy - 54} ${x - 18} ${hy - 44}Z`, '#FFF3E0', stroke(lc, 3.5)) + path(`M${x + 34} ${hy - 30}Q${x + 50} ${hy - 62} ${x + 36} ${hy - 72}Q${x + 26} ${hy - 54} ${x + 18} ${hy - 44}Z`, '#FFF3E0', stroke(lc, 3.5));
  else if (f.ears === 'ears')
    top = ellipse(x - 40, hy - 36, 15, 25, color, { ...stroke(lc, 3.5), transform: `rotate(-24 ${x - 40} ${hy - 36})` }) + ellipse(x + 40, hy - 36, 15, 25, color, { ...stroke(lc, 3.5), transform: `rotate(24 ${x + 40} ${hy - 36})` });
  else if (f.ears === 'antenna') top = antenna(x, hy - 46, 0, lc);
  else if (f.ears === 'antennae') top = antenna(x - 16, hy - 44, -1, lc) + antenna(x + 16, hy - 44, 1, lc);
  else if (f.ears === 'tuft') top = puff([[x - 10, hy - 50, 11], [x + 4, hy - 56, 13], [x + 16, hy - 49, 10]], lighten(color, 0.3), lc, 3);
  const bowArt = f.ears === 'bow' ? path(`M${x + 22} ${hy - 40}l-20 -12q-5 12 0 24zM${x + 22} ${hy - 40}l20 -12q5 12 0 24z`, '#FF9FC6', stroke('#C24E86', 3)) + circle(x + 22, hy - 40, 6, '#FFC4DD', stroke('#C24E86', 3)) : '';
  return (
    ellipse(x, 612, 70, 44, darken(color, 0.1), stroke(lc, 4)) +
    top +
    circle(x, hy, 50, color, stroke(lc, 4)) +
    path(`M${x - 38} ${hy - 22}Q${x - 18} ${hy - 46} ${x + 12} ${hy - 46}`, 'none', { ...stroke('#FFF3FA', 4), opacity: 0.55 }) +
    path(`M${x - 10} ${hy + 6}q4 -4 8 0M${x + 14} ${hy + 18}q4 -4 8 0M${x - 26} ${hy + 22}q4 -4 8 0`, 'none', { ...stroke(lc, 2.5), opacity: 0.5 }) +
    bowArt
  );
}

function antenna(x: number, y: number, dir: number, lc: string): string {
  const tx = x + dir * 12;
  const ty = y - 34;
  return path(`M${x} ${y}Q${x + dir * 2} ${y - 20} ${tx} ${ty}`, 'none', stroke(lc, 8)) + path(`M${x} ${y}Q${x + dir * 2} ${y - 20} ${tx} ${ty}`, 'none', stroke('#B6E8D2', 3.5)) + circle(tx, ty - 6, 9, '#FFE27A', stroke(P.goldDeep, 3));
}

/** A fan's raised arm holding something. */
function raisedArm(x0: number, y0: number, x1: number, y1: number, color: string): string {
  const lc = darken(color, 0.35);
  return path(`M${x0} ${y0}Q${x0} ${(y0 + y1) / 2} ${x1} ${y1}`, 'none', stroke(lc, 20)) + path(`M${x0} ${y0}Q${x0} ${(y0 + y1) / 2} ${x1} ${y1}`, 'none', stroke(color, 13)) + circle(x1, y1, 12, lc) + circle(x1, y1, 8.5, color);
}

/** Glow stick held at (x, y). */
function glowStick(x: number, y: number, color: string, rot: number): string {
  return g(
    rect(-14, -44, 28, 76, 14, color, { opacity: 0.45 }) + rect(-9, -40, 18, 62, 9, lighten(color, 0.35), stroke(darken(color, 0.15), 3)) + rect(-4, -34, 6, 40, 3, '#fff', { opacity: 0.8 }) + rect(-10, 18, 20, 14, 5, '#8E78C8', stroke('#6F5E92', 2.5)),
    { transform: `translate(${x} ${y}) rotate(${rot})` },
  );
}

/** Round fan sign on a stick with a heart or a star. */
function fanSign(starShape: boolean): string {
  const x = 118;
  const y = 446;
  return (
    line(x + 4, y + 40, x + 8, y + 104, P.woodDeep, 8) +
    line(x + 4, y + 40, x + 8, y + 104, P.wood, 3.5) +
    circle(x, y, 46, '#FFF4FA', stroke('#E07FAE', 5)) +
    circle(x, y, 38, 'none', { ...stroke('#FFC4DD', 3), 'stroke-dasharray': '2 8' }) +
    (starShape ? star(x, y + 2, 31, '#FFD24D', { outline: P.goldDeep, width: 4 }) : heart(x, y + 2, 30, '#FF7FB8', stroke('#C24E86', 4))) +
    sparkle(x + 30, y - 30, 7, P.gold)
  );
}

const ANT_A: Point[] = [[330, 460]];
const ANT_B: Point[] = [
  [302, 462],
  [358, 462],
];

/* ---------------------------------------------------------------- the level */

const level: Level = {
  id: 'mp-5',
  title: 'The Big Sparkle Concert',
  findCount: 5,
  differences: [
    {
      id: 'sign',
      kind: 'shape',
      theme: 'shapes',
      hit: { type: 'circle', cx: 118, cy: 446, r: 60 },
      label: 'Heart sign, star sign',
      say: 'A fan holds up a heart… and a star!',
    },
    {
      id: 'glasses',
      kind: 'add',
      theme: 'memory',
      hit: { type: 'circle', cx: 214, cy: 298, r: 56 },
      label: 'Heart glasses or no glasses',
      say: 'Lolo is wearing heart glasses… in one picture!',
    },
    {
      id: 'emblem',
      kind: 'shape',
      theme: 'music',
      hit: { type: 'circle', cx: 400, cy: 152, r: 44 },
      label: 'Music note or heart',
      say: 'In the big star: a music note… and a heart!',
    },
    {
      id: 'glowstick',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'circle', cx: 660, cy: 452, r: 54 },
      label: 'Pink glow stick, green one',
      say: 'A pink glow stick… and a green glow stick!',
    },
    {
      id: 'plinky-face',
      kind: 'expression',
      theme: 'emotions',
      hit: { type: 'circle', cx: 400, cy: 300, r: 62 },
      label: 'Laughing or surprised',
      say: 'Plinky is laughing… and Plinky looks surprised!',
    },
    // Extra candidates (replays)
    {
      id: 'antennae',
      kind: 'count',
      theme: 'counting',
      hit: { type: 'circle', cx: 330, cy: 474, r: 50 },
      label: '1 antenna and 2 antennae',
      say: 'One fan has one antenna… and two antennae!',
      count: { a: ANT_A, b: ANT_B },
    },
    {
      id: 'wand',
      kind: 'shape',
      theme: 'shapes',
      hit: { type: 'circle', cx: 166, cy: 98, r: 50 },
      label: 'Star wand, moon wand',
      say: "Fizz's magic wand has a star… and a moon!",
    },
  ],
  draw(c) {
    const r = rng(55);
    let confetti = '';
    const cols = ['#FF9FC6', '#FFE27A', '#8FD8FF', '#B7F0C9', '#D2BDFF'];
    for (let i = 0; i < 46; i++) {
      const x = 20 + r() * 760;
      const y = 20 + r() * 330;
      const col = cols[i % cols.length];
      const k = r();
      confetti += k < 0.5 ? rect(x, y, 9, 5, 1.5, col, { transform: `rotate(${Math.round(r() * 180)} ${x + 4} ${y + 2})` }) : circle(x, y, 3.5, col);
    }
    return (
      defs(
        linear('night', [
          [0, '#5B4AA6'],
          [0.55, '#8B6CC8'],
          [1, '#C38FD8'],
        ]),
        linear('stage5', [
          [0, '#E7C4F2'],
          [1, '#C8A2EA'],
        ]),
        radial('halo5', [
          [0, '#FFF0C9', 0.85],
          [1, '#FFF0C9', 0],
        ]),
        linear('crowd', [
          [0, '#5B4AA6', 0],
          [1, '#5B4AA6', 0.5],
        ]),
      ) +
      // night backdrop
      rect(0, 0, 800, 400, 0, url('night')) +
      dust(51, 26, { x: 10, y: 10, w: 780, h: 300 }, ['#fff', '#FFE7A0', '#FFC4DD'], 3, 8, 0.9) +
      circle(400, 170, 190, url('halo5')) +
      // beams from the truss
      beam('b51', 90, 34, 230, 420, 12, 70, '#FF9FD0', 0.42) +
      beam('b52', 270, 34, 380, 430, 12, 70, '#9FE8FF', 0.4) +
      beam('b53', 530, 34, 420, 430, 12, 70, '#FFE38A', 0.42) +
      beam('b54', 710, 34, 600, 420, 12, 70, '#C7A8FF', 0.42) +
      // giant marquee star with the emblem
      starSign(400, 152, 112, '#FFB3D6') +
      circle(400, 154, 36, '#FFF4FA', stroke('#E07FAE', 4)) +
      (c.on('emblem') ? heart(400, 156, 24, '#FF7FB8', stroke('#C24E86', 3.5)) : note(390, 168, 0.92, '#B48CFF', 'eighth')) +
      // truss & lights
      rect(0, 14, 800, 18, 6, '#7D6AB8', stroke('#5E4C96', 3)) +
      path('M20 16L40 30L60 16L80 30L100 16L120 30L140 16L160 30L180 16L200 30L220 16L240 30L260 16L280 30L300 16L320 30L340 16L360 30L380 16L400 30L420 16L440 30L460 16L480 30L500 16L520 30L540 16L560 30L580 16L600 30L620 16L640 30L660 16L680 30L700 16L720 30L740 16L760 30L780 16', 'none', stroke('#A796D0', 2.5)) +
      spotCan(90, 34, 70, '#FF9FD0', 0.8) +
      spotCan(270, 34, 78, '#9FE8FF', 0.8) +
      spotCan(530, 34, 102, '#FFE38A', 0.8) +
      spotCan(710, 34, 110, '#C7A8FF', 0.8) +
      discoBall(612, 104, 32, 32) +
      // stage
      rect(0, 382, 800, 92, 0, url('stage5')) +
      ellipse(400, 420, 330, 48, url('halo5')) +
      path('M0 382H800', 'none', stroke('#B48CD9', 4)) +
      dust(52, 14, { x: 20, y: 390, w: 760, h: 70 }, ['#fff'], 3, 7) +
      confetti +
      // riser + Tumtum (back right)
      rect(500, 330, 196, 54, 8, '#8FCBFF', stroke('#4F86D6', 4)) +
      rect(500, 330, 196, 10, 5, '#C2E2FF', stroke('#4F86D6', 3)) +
      cymbal(520, 250, 30, 80) +
      snare(674, 296, 28, 26, '#FF9FC6') +
      tumtum({ x: 598, y: 334, s: 0.8, mood: 'joy', armL: 'up', armR: 'up', holdL: (x, y) => stick(x, y, -30), holdR: (x, y) => stick(x, y, 30), shadow: false }) +
      bassDrum(598, 326, 50, '#FF9FC6', [
        [-0.3, 0, 'heart', '#FFE27A', 1.8],
        [0.3, 0, 'heart', '#FFE27A', 1.8],
      ]) +
      // Lolo on keytar (left)
      lolo({
        x: 214,
        y: 456,
        s: 1.02,
        mood: 'joy',
        armL: 'front',
        armR: 'front',
        mid: keytar(-2, -66, '#C9B3FF', -16, 1.0, '#FF9FC6'),
        front: c.on('glasses') ? GLASSES : '',
      }) +
      // Plinky centre stage
      plinky({ x: 400, y: 462, s: 1.16, mood: c.pick('plinky-face', 'joy', 'surprised'), armL: 'up', armR: 'hold', holdR: (x, y) => mic(x, y, '#FFD24D', 16, 1.1, '#FFE27A'), extra: 'crown' }) +
      // Fizz flying with the wand (top left)
      fizz({ x: 124, y: 214, s: 0.76, mood: 'joy', armL: 'down', armR: 'cheer', holdR: wand(c.on('wand')), shadow: false }) +
      // stage front marquee bulbs
      rect(0, 470, 800, 26, 0, '#7D6AB8') +
      bulbRow(20, 483, 780, 483, 20, 6, ['#FFE27A', '#FF9FC6', '#8FD8FF']) +
      note(300, 230, 0.5, '#FFE27A', 'eighth', -10) +
      note(500, 236, 0.5, '#9FE8FF', 'beamed', 10) +
      // the audience
      rect(0, 496, 800, 104, 0, '#6E5BB0') +
      rect(0, 496, 800, 104, 0, url('crowd')) +
      fanSign(c.on('sign')) +
      fan({ x: 66, color: '#E39BC4', ears: 'horns' }) +
      raisedArm(116, 604, 128, 528, '#E39BC4') +
      fan({ x: 214, color: '#8FA8E6', ears: 'ears' }) +
      fan({ x: 330, color: '#86C9B0', ears: c.on('antennae') ? 'antennae' : 'antenna' }) +
      fan({ x: 452, color: '#B9A3E8', ears: 'bow' }) +
      glowStick(514, 462, '#FFE27A', 12) +
      raisedArm(508, 604, 516, 492, '#B9A3E8') +
      fan({ x: 598, color: '#E8AE94', ears: 'tuft' }) +
      glowStick(660, 458, c.pick('glowstick', '#FF8FC6', '#7FE0A0'), 10) +
      raisedArm(652, 604, 662, 488, '#E8AE94') +
      // a fan turned around, waving at us
      ellipse(726, 614, 66, 42, darken('#E6CF7E', 0.1), stroke(darken('#E6CF7E', 0.35), 4)) +
      path('M694 516Q680 484 696 474Q706 494 712 506Z', '#FFF3E0', stroke(darken('#E6CF7E', 0.35), 3.5)) +
      path('M758 516Q772 484 756 474Q746 494 740 506Z', '#FFF3E0', stroke(darken('#E6CF7E', 0.35), 3.5)) +
      circle(726, 548, 50, '#E6CF7E', stroke(darken('#E6CF7E', 0.35), 4)) +
      shine(708, 522, 12, 7) +
      face({ x: 726, y: 548, s: 1.2, mood: 'love' }) +
      sparkle(40, 440, 8, '#fff') +
      sparkle(770, 430, 8, '#fff')
    );
  },
  sticker: {
    id: 'st-mp-5',
    name: 'Tumtum Rocks',
    draw: () =>
      tumtum({ x: 100, y: 182, s: 0.58, mood: 'joy', armL: 'up', armR: 'up', holdL: (x, y) => stick(x, y, -28), holdR: (x, y) => stick(x, y, 28), mid: snare(0, -84, 50, 42, '#FF9FBF') }) +
      note(36, 70, 0.5, '#B48CFF', 'eighth', -12) +
      note(150, 54, 0.45, '#FF8FBF', 'beamed', 10) +
      sparkle(160, 120, 7, '#FFD66B') +
      sparkle(40, 128, 6, '#FFD66B'),
  },
};

export default level;
