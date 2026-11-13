/**
 * Level 4 — Rehearsal on Stage.
 * Story: the day before the big concert the band practises on the real stage. Plinky sings into
 * the boom mic, Lolo waves to the empty seats, Tumtum drums on the riser, and Fizz — the stage
 * helper — cheers from a speaker. Paper lanterns glow in a pink-yellow-blue pattern overhead.
 */
import type { Level } from '../../core/types.ts';
import { P, circle, cloud, darken, defs, ellipse, g, heart, line, linear, path, radial, rect, sparkle, star, stroke, url } from '../../art/kit.ts';
import { fizz, lolo, plinky, tumtum, type Shoe } from './characters.ts';
import { bassDrum, beam, checkerFloor, curtain, cymbal, dust, mic, sagPoint, snare, speaker, spotCan, stick, valance } from './props.ts';

/** Round paper lantern. */
function lantern(x: number, y: number, color: string): string {
  const lc = darken(color, 0.35);
  return (
    line(x, y - 40, x, y - 26, P.inkSoft, 2.5) +
    circle(x, y, 36, color, { opacity: 0.25 }) +
    rect(x - 11, y - 32, 22, 8, 3, P.gold, stroke(P.goldDeep, 2.5)) +
    ellipse(x, y, 24, 27, color, stroke(lc, 3.5)) +
    path(`M${x} ${y - 26}Q${x - 14} ${y} ${x} ${y + 26}M${x} ${y - 26}Q${x + 14} ${y} ${x} ${y + 26}M${x - 23} ${y}H${x + 23}`, 'none', stroke(lc, 2.2)) +
    rect(x - 9, y + 24, 18, 7, 3, P.gold, stroke(P.goldDeep, 2.5)) +
    line(x, y + 31, x, y + 42, lc, 2.5) +
    ellipse(x - 9, y - 10, 5, 9, '#fff', { opacity: 0.55, transform: `rotate(20 ${x - 9} ${y - 10})` })
  );
}

/** Easel sign with a big arrow (pointing right, or left). */
function arrowSign(left: boolean): string {
  const x = 98;
  const y = 334;
  const arrow = `M${x - 26} ${y - 9}H${x + 2}V${y - 22}L${x + 28} ${y}L${x + 2} ${y + 22}V${y + 9}H${x - 26}Z`;
  return (
    ellipse(x, 530, 44, 7, P.ink, { opacity: 0.14 }) +
    path(`M${x - 34} 528L${x - 6} ${y + 20}M${x + 34} 528L${x + 6} ${y + 20}M${x} ${y + 30}L${x + 4} 526`, 'none', stroke(P.woodDeep, 7)) +
    path(`M${x - 34} 528L${x - 6} ${y + 20}M${x + 34} 528L${x + 6} ${y + 20}`, 'none', stroke(P.wood, 3)) +
    circle(x, y, 46, '#FFF4DC', stroke(P.woodDeep, 5)) +
    circle(x, y, 38, 'none', { ...stroke('#F4C98F', 3), 'stroke-dasharray': '3 9' }) +
    g(path(arrow, '#FF8FBF', stroke('#D2669C', 4)) + path(`M${x - 20} ${y - 3}H${x + 4}`, 'none', stroke('#FFC4DD', 3)), left ? { transform: `translate(${x * 2} 0) scale(-1 1)` } : {})
  );
}

/** Boom mic stand; the mic itself can change colour. */
function boomMic(color: string): string {
  return (
    ellipse(392, 530, 40, 7, P.ink, { opacity: 0.16 }) +
    path('M362 530L392 512L422 530', 'none', stroke('#6F5E92', 6)) +
    line(392, 516, 392, 452, '#7F6E9E', 7) +
    line(392, 516, 392, 452, '#B9AED0', 2.5) +
    circle(392, 452, 6, '#6F5E92') +
    line(392, 452, 362, 444, '#7F6E9E', 6) +
    path('M392 516Q420 540 470 530Q520 520 540 532', 'none', stroke('#6F5E92', 4)) +
    mic(366, 444, color, -40, 1.32, color)
  );
}

/** Light-up panel on the stage front. */
function panel(x: number, color: string): string {
  return rect(x, 542, 96, 28, 10, color, stroke(darken(color, 0.35), 3)) + rect(x + 8, 546, 80, 8, 4, '#fff', { opacity: 0.55 }) + sparkle(x + 82, 562, 5, '#fff');
}

/** Big DJ-style headphones on Tumtum's head (local to Tumtum). */
const HEADPHONES =
  path('M-62 -132Q-62 -206 0 -208Q62 -206 62 -132', 'none', stroke('#6F5E92', 12)) +
  path('M-62 -132Q-62 -206 0 -208Q62 -206 62 -132', 'none', stroke('#FF8FBF', 6)) +
  rect(-80, -152, 26, 44, 12, '#FF8FBF', stroke('#C24E86', 4)) +
  rect(54, -152, 26, 44, 12, '#FF8FBF', stroke('#C24E86', 4)) +
  star(-67, -130, 7, '#fff', { width: 1.5 }) +
  star(67, -130, 7, '#fff', { width: 1.5 });

const SEQ = ['#FF9FC6', '#FFDA6B', '#8FCBFF'];
const PANEL_SEQ = ['#FF9FC6', '#FFE27A', '#9FE8DC'];

const STAR_SHOE: Shoe = { color: '#FF9FC6', pattern: 'stars', mark: '#FFFFFF' };
const STRIPE_SHOE: Shoe = { color: '#FFE27A', pattern: 'stripes', mark: '#FF7FAF' };

const level: Level = {
  id: 'mp-4',
  title: 'Rehearsal on Stage',
  findCount: 5,
  differences: [
    {
      id: 'mic',
      kind: 'color',
      theme: 'music',
      hit: { type: 'circle', cx: 352, cy: 420, r: 46 },
      label: 'Pink mic, blue mic',
      say: 'The microphone is pink… and blue!',
    },
    {
      id: 'wave',
      kind: 'direction',
      theme: 'left-right',
      hit: { type: 'ellipse', cx: 562, cy: 404, rx: 118, ry: 74 },
      label: 'Waving left hand, right hand',
      say: 'Lolo waves with one hand… and then with the other hand!',
    },
    {
      id: 'arrow',
      kind: 'direction',
      theme: 'left-right',
      hit: { type: 'circle', cx: 98, cy: 334, r: 60 },
      label: 'Arrow left, arrow right',
      say: 'The arrow points one way… and the other way!',
    },
    {
      id: 'lanterns',
      kind: 'pattern',
      theme: 'sequences',
      hit: { type: 'circle', cx: 474, cy: 118, r: 46 },
      label: 'Yellow lantern, pink lantern',
      say: 'Pink, yellow, blue… one lantern broke the pattern!',
    },
    {
      id: 'shoes',
      kind: 'pattern',
      theme: 'left-right',
      hit: { type: 'ellipse', cx: 268, cy: 506, rx: 72, ry: 30 },
      label: 'Shoes swapped left and right',
      say: "Plinky's star shoe and stripy shoe swapped feet!",
    },
    // Extra candidates (replays)
    {
      id: 'headphones',
      kind: 'add',
      theme: 'music',
      hit: { type: 'circle', cx: 400, cy: 240, r: 68 },
      label: 'Headphones or no headphones',
      say: 'Tumtum is wearing big headphones… in one picture!',
    },
    {
      id: 'panels',
      kind: 'pattern',
      theme: 'sequences',
      hit: { type: 'rect', x: 510, y: 532, w: 112, h: 50 },
      label: 'Yellow light, blue light',
      say: 'Pink, yellow, green… one stage light broke the pattern!',
    },
  ],
  draw(c) {
    const lanternColors = SEQ.concat(SEQ, SEQ).slice(0, 7);
    if (c.on('lanterns')) lanternColors[4] = '#FF9FC6';
    const lanterns = lanternColors
      .map((col, i) => {
        const [x, y] = sagPoint(150, 78, 650, 78, 12, (i + 0.5) / 7);
        return lantern(x, y + 40, col);
      })
      .join('');
    const panels = [0, 1, 2, 3, 4, 5]
      .map((i) => panel(78 + i * 110, c.on('panels') && i === 4 ? '#8FCBFF' : PANEL_SEQ[i % 3]))
      .join('');
    const shoeL = c.pick('shoes', STAR_SHOE, STRIPE_SHOE);
    const shoeR = c.pick('shoes', STRIPE_SHOE, STAR_SHOE);
    return (
      defs(
        linear('drop', [
          [0, '#A897EE'],
          [0.6, '#D3B6F3'],
          [1, '#F2C9EA'],
        ]),
        radial('halo4', [
          [0, '#FFF3C4', 0.8],
          [1, '#FFF3C4', 0],
        ]),
      ) +
      // backdrop
      rect(0, 0, 800, 400, 0, url('drop')) +
      circle(400, 250, 170, url('halo4')) +
      star(400, 236, 120, '#E8D9FF', { outline: '#D4BFFA', width: 6, inner: 0.5 }) +
      star(400, 236, 84, '#F2E9FF', { inner: 0.5, width: 1 }) +
      cloud(170, 360, 0.9, { fill: '#F6E6FF', shade: '#E4CFF7' }) +
      cloud(640, 368, 1, { fill: '#F6E6FF', shade: '#E4CFF7' }) +
      dust(41, 18, { x: 120, y: 160, w: 560, h: 180 }, ['#fff', '#FFE7A0'], 4, 9, 0.85) +
      // stage floor
      checkerFloor({ top: 392, bottom: 534, vx: 400, vy: 120, spacing: 64, rows: [392, 534], base: '#F3C99A', alt: '#EDBA85', line: '#D59A66' }) +
      ellipse(400, 470, 330, 54, url('halo4')) +
      path('M0 392H800', 'none', stroke('#C88D5E', 3)) +
      // tape marks on the floor
      path('M300 452l10 10M310 452l-10 10M500 456l10 10M510 456l-10 10', 'none', stroke('#FF8FBF', 4)) +
      // riser with Tumtum and his kit
      rect(296, 336, 208, 60, 8, '#FF9FC6', stroke('#D2669C', 4)) +
      rect(296, 336, 208, 12, 6, '#FFC4DD', stroke('#D2669C', 3)) +
      star(330, 372, 9, '#fff', { width: 1.5 }) +
      star(470, 372, 9, '#fff', { width: 1.5 }) +
      cymbal(326, 254, 34, 86) +
      snare(474, 300, 30, 28, '#9FD8FF') +
      tumtum({
        x: 400,
        y: 342,
        s: 0.82,
        mood: 'happy',
        armL: 'up',
        armR: 'drum',
        holdL: (x, y) => stick(x, y, -28),
        holdR: (x, y) => stick(x, y, 108),
        shadow: false,
        mid: c.on('headphones') ? HEADPHONES : '',
      }) +
      bassDrum(400, 330, 52, '#8FCBFF', [
        [0, 0, 'heart', '#FF9FC6', 2.2],
        [-0.55, -0.1, 'dot', '#FFD24D', 1.2],
        [0.55, -0.1, 'dot', '#FFD24D', 1.2],
      ]) +
      // curtains + valance + lanterns
      curtain(0, 30, 534, 136, -1, '#F27FB0', 300) +
      curtain(800, 30, 534, 136, 1, '#F27FB0', 300) +
      path('M150 78Q400 102 650 78', 'none', stroke(P.inkSoft, 2.5)) +
      lanterns +
      valance(0, 800, 44, 42, 8, '#E86FA6') +
      spotCan(196, 40, 70, '#FFF6C9', 0.9) +
      spotCan(604, 40, 110, '#FFF6C9', 0.9) +
      beam('l4b1', 210, 70, 270, 470, 14, 84, '#FFF6D0', 0.45) +
      beam('l4b2', 590, 70, 560, 470, 14, 84, '#FFF6D0', 0.45) +
      // stage front with light-up panels
      rect(0, 532, 800, 68, 0, '#8E78C8') +
      rect(0, 530, 800, 8, 0, '#B9A6E8') +
      panels +
      // arrow sign on the left
      arrowSign(c.on('arrow')) +
      // Plinky at the boom mic
      boomMic(c.pick('mic', '#FF8FBF', '#7CC8FF')) +
      plinky({ x: 268, y: 524, s: 1.1, mood: 'joy', armL: 'down', armR: 'hip', shoeL, shoeR }) +
      // Lolo waving
      lolo({
        x: 560,
        y: 524,
        s: 1.05,
        mood: 'happy',
        armL: c.pick('wave', 'wave', 'hip'),
        armR: c.pick('wave', 'hip', 'wave'),
      }) +
      // Fizz on the speaker
      speaker(694, 436, 92, 96, '#7D6AB8') +
      fizz({ x: 740, y: 440, s: 0.74, mood: 'love', armL: 'cheer', armR: 'cheer', shadow: false }) +
      heart(700, 344, 9, '#FF9FC6') +
      heart(786, 360, 7, '#FF9FC6') +
      sparkle(150, 230, 8, '#fff') +
      sparkle(660, 250, 9, '#fff')
    );
  },
  sticker: {
    id: 'st-mp-4',
    name: 'Lolo Waves Hello',
    draw: () => lolo({ x: 100, y: 190, s: 0.62, mood: 'joy', armL: 'wave', armR: 'hip' }),
  },
};

export default level;
