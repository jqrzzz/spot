/**
 * Level 1 — First Day at Pop Academy.
 * Story: it's Plinky's first day! She bounces down the sparkly hallway with a balloon, waving
 * hello. Tumtum greets her with his little drum, Fizz waves from on top of the lockers, and
 * through the big doorway Lolo is already dancing on the practice stage.
 */
import type { Level } from '../../core/types.ts';
import { P, circle, darken, defs, ellipse, heart, lighten, linear, path, radial, rect, sparkle, star, stroke, url } from '../../art/kit.ts';
import { fizz, lolo, plinky, tumtum } from './characters.ts';
import { balloon, beam, bulb, bunting, checkerFloor, dust, note, patternDef, plant, snare, speaker, starSign } from './props.ts';

type Sticker = 'star' | 'heart' | 'note' | 'moon';

/** A school locker with vents, handle and a little sticker. */
function locker(x: number, y: number, w: number, h: number, color: string, sticker: Sticker): string {
  const lc = darken(color, 0.38);
  const cx = x + w / 2;
  const sy = y + h * 0.42;
  let st = '';
  if (sticker === 'star') st = star(cx, sy, 11, '#fff', { outline: lighten(color, 0.2), width: 2 });
  else if (sticker === 'heart') st = heart(cx, sy, 10, '#fff');
  else if (sticker === 'note') st = note(cx - 4, sy + 10, 0.42, '#fff', 'eighth', 0, lighten(color, 0.1));
  else st = path(`M${cx + 4} ${sy - 11}A11 11 0 1 0 ${cx + 6} ${sy + 9}A8 8 0 1 1 ${cx + 4} ${sy - 11}Z`, '#fff');
  return (
    rect(x, y, w, h, 7, color, stroke(lc, 4)) +
    rect(x + 7, y + 8, w - 14, h - 16, 5, 'none', { stroke: lighten(color, 0.4), 'stroke-width': 3 }) +
    rect(cx - 14, y + 18, 28, 4.5, 2.2, lc, { opacity: 0.5 }) +
    rect(cx - 14, y + 27, 28, 4.5, 2.2, lc, { opacity: 0.5 }) +
    rect(cx - 14, y + 36, 28, 4.5, 2.2, lc, { opacity: 0.5 }) +
    rect(x + w - 15, y + h * 0.55, 7, 24, 3.5, '#fff', stroke(lc, 2.5)) +
    st +
    rect(x + 10, y + h - 60, 6, 40, 3, '#fff', { opacity: 0.35 })
  );
}

/** A bank of lockers with a top cap and a base. */
function lockerBank(x: number, y: number, w: number, h: number, colors: string[], stickers: Sticker[]): string {
  const lw = w / colors.length;
  return (
    rect(x - 8, y - 16, w + 16, 22, 8, '#C9B3F2', stroke('#8E73CF', 4)) +
    colors.map((c, i) => locker(x + i * lw + 2, y + 6, lw - 4, h - 6, c, stickers[i % stickers.length])).join('') +
    rect(x - 4, y + h - 2, w + 8, 12, 5, '#B39CE8', stroke('#8E73CF', 3))
  );
}

/** The big arched doorway to the practice stage, with Lolo dancing inside. */
function doorway(): string {
  const arch = 'M318 402V200Q318 128 400 128Q482 128 482 200V402Z';
  return (
    path(arch, url('doorIn')) +
    // a peek at the stage: back curtain, spotlight, stage edge
    path('M330 402V210Q330 142 400 142Q470 142 470 210V402Z', url('doorIn')) +
    path('M326 250Q360 240 380 330L372 402H326Z', '#F59AC4', { opacity: 0.55 }) +
    path('M474 250Q440 240 420 330L428 402H474Z', '#F59AC4', { opacity: 0.55 }) +
    beam('l1beam', 400, 140, 400, 380, 10, 58, '#FFFFFF', 0.6) +
    rect(318, 372, 164, 30, 0, '#C79BEA') +
    path('M318 372H482', 'none', stroke('#A779D8', 3)) +
    bulb(338, 386, 4.5, P.lemon) +
    bulb(370, 386, 4.5, P.pink) +
    bulb(400, 386, 4.5, P.aqua) +
    bulb(430, 386, 4.5, P.lemon) +
    bulb(462, 386, 4.5, P.pink) +
    lolo({ x: 400, y: 378, s: 0.5, mood: 'joy', armL: 'cheer', armR: 'cheer' }) +
    sparkle(352, 196, 7, '#fff') +
    sparkle(452, 226, 6, '#fff') +
    // door frame
    path(arch, 'none', stroke('#F0A35E', 18)) +
    path(arch, 'none', stroke('#FFC98E', 11)) +
    path('M318 402V200Q318 128 400 128Q482 128 482 200V402', 'none', stroke('#FFE4BF', 3))
  );
}

const ROWS = [404, 420, 442, 472, 512, 564, 632];

const level: Level = {
  id: 'mp-1',
  title: 'First Day at Pop Academy',
  findCount: 3,
  differences: [
    {
      id: 'fizz',
      kind: 'add',
      theme: 'memory',
      hit: { type: 'circle', cx: 612, cy: 128, r: 74 },
      label: 'Little monster or no monster',
      say: 'Little Fizz is sitting on the lockers… in one picture!',
    },
    {
      id: 'balloon',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'circle', cx: 296, cy: 222, r: 58 },
      label: 'Pink balloon, yellow balloon',
      say: 'A pink balloon… and a yellow balloon!',
    },
    {
      id: 'sign-note',
      kind: 'remove',
      theme: 'music',
      hit: { type: 'circle', cx: 132, cy: 92, r: 62 },
      label: 'Music note or no note',
      say: 'The music note has disappeared from the sign!',
    },
    // Extra candidates (replays)
    {
      id: 'drum',
      kind: 'color',
      theme: 'music',
      hit: { type: 'ellipse', cx: 640, cy: 470, rx: 74, ry: 56 },
      label: 'Pink drum, blue drum',
      say: "Tumtum's drum is pink… or blue!",
    },
    {
      id: 'locker',
      kind: 'color',
      theme: 'colors',
      hit: { type: 'rect', x: 22, y: 172, w: 82, h: 236 },
      label: 'Green locker, pink locker',
      say: 'One locker is green… and one is pink!',
    },
  ],
  draw(c) {
    const leftColors = [c.pick('locker', '#A9E8C4', '#FFA8CB'), '#FFCFA6', '#FFE58F', '#CDB8FF'];
    const rightColors = ['#A9D6FF', '#FFB7D2', '#A8EDE3', '#FFD39C'];
    return (
      defs(
        linear('wall', [
          [0, '#E3D3FF'],
          [0.55, '#F2DDFB'],
          [1, '#FFE0EE'],
        ]),
        linear('doorIn', [
          [0, '#FFE9B8'],
          [0.5, '#FFD1E4'],
          [1, '#F4B8E6'],
        ]),
        radial('spill', [
          [0, '#FFF2C9', 0.85],
          [1, '#FFF2C9', 0],
        ]),
        linear('gloss', [
          [0, '#fff', 0.55],
          [1, '#fff', 0],
        ]),
        patternDef('wp', 56, 56, sparkle(14, 14, 5, '#fff', 0.7) + circle(42, 42, 3, '#fff', { opacity: 0.55 })),
      ) +
      // back wall
      rect(0, 0, 800, 404, 0, url('wall')) +
      rect(0, 0, 800, 404, 0, url('wp')) +
      rect(0, 0, 800, 12, 0, '#C2A8F0') +
      // floor
      checkerFloor({ top: 404, bottom: 600, vx: 400, vy: 250, spacing: 110, rows: ROWS, base: '#FFE2EF', alt: '#F7CBE3' }) +
      ellipse(400, 420, 190, 34, url('spill')) +
      rect(0, 404, 800, 70, 0, url('gloss'), { opacity: 0.5 }) +
      rect(0, 396, 800, 12, 0, '#C9B3F2') +
      path('M0 396H800', 'none', stroke('#9F86DA', 3)) +
      dust(11, 14, { x: 20, y: 430, w: 760, h: 150 }, ['#fff'], 4, 9) +
      // garlands
      bunting(-10, 6, 330, 20, 16, 9, ['#FF9FBF', '#FFD66B', '#9FDCFF', '#B9F0C9', '#C9B3FF']) +
      bunting(470, 20, 810, 6, 16, 9, ['#C9B3FF', '#B9F0C9', '#9FDCFF', '#FFD66B', '#FF9FBF']) +
      // academy star sign over the door
      starSign(400, 70, 56, '#FFC6E0') +
      // music sign on the left wall
      path('M106 30L132 14L158 30', 'none', stroke(P.inkSoft, 2.5)) +
      circle(132, 14, 4, P.gold, stroke(P.goldDeep, 2)) +
      circle(132, 92, 50, '#FFD66B', stroke(P.goldDeep, 4)) +
      circle(132, 92, 40, '#F6EEFF', stroke('#E1B95A', 3)) +
      (c.on('sign-note') ? '' : note(114, 110, 1.18, '#B48CFF', 'beamed', -6)) +
      sparkle(98, 60, 6, P.gold) +
      sparkle(166, 124, 5, P.gold) +
      // lockers
      lockerBank(30, 166, 248, 236, leftColors, ['star', 'note', 'heart', 'moon']) +
      lockerBank(522, 166, 248, 236, rightColors, ['heart', 'star', 'moon', 'note']) +
      // doorway with Lolo
      doorway() +
      // floating notes from the doorway
      note(500, 248, 0.62, '#FF9FC6', 'eighth', 12) +
      note(296, 330, 0.5, '#8CC8FF', 'eighth', -10) +
      sparkle(510, 196, 6, '#fff') +
      // Fizz on top of the right lockers
      (c.on('fizz') ? '' : fizz({ x: 612, y: 188, s: 0.74, mood: 'joy', armL: 'wave', armR: 'down', shadow: false })) +
      // foreground props
      speaker(700, 452, 86, 122, '#8D7BC2') +
      plant(52, 600, 1.05, '#FF9FB8') +
      // Tumtum with his little drum
      tumtum({
        x: 640,
        y: 552,
        s: 1,
        mood: 'happy',
        look: -0.6,
        armL: 'front',
        armR: 'front',
        mid: snare(0, -86, 50, 44, c.pick('drum', '#FF9FBF', '#8DC6FF')) + path('M-34 -76Q0 -62 34 -76', 'none', stroke('#fff', 2.5)),
      }) +
      // Plinky arriving with her balloon
      balloon(296, 218, 34, c.pick('balloon', '#FF8FBF', '#FFD84D'), 308, 416) +
      plinky({
        x: 222,
        y: 566,
        s: 1.2,
        mood: 'joy',
        armL: 'wave',
        armR: 'up',
      }) +
      sparkle(330, 470, 8, '#fff') +
      heart(484, 300, 7, '#FFB3D1')
    );
  },
  sticker: {
    id: 'st-mp-1',
    name: 'Plinky Says Hi',
    draw: () =>
      balloon(150, 52, 24, '#FF8FBF', 146, 116) +
      plinky({ x: 96, y: 184, s: 0.62, mood: 'joy', armL: 'wave', armR: 'up' }),
  },
};

export default level;
