/**
 * Monster Pop Academy — world cover, level-map backdrop and the world badge.
 */
import { P, circle, cloud, darken, defs, ellipse, face, g, heart, lighten, linear, path, puff, radial, rect, rng, shine, sparkle, star, stroke, url } from '../../art/kit.ts';
import { fizz, lolo, plinky, tumtum } from './characters.ts';
import { balloon, beam, bulb, bunting, dust, keytar, maraca, mic, note, snare, speaker, starSign, stick, tambourine, valance } from './props.ts';

/* ---------------------------------------------------------------- the academy building */

/** Gumdrop turret with a pennant. */
function turret(x: number, y: number, w: number, h: number, wall: string, roof: string, flag: string): string {
  const lw = darken(wall, 0.35);
  const lr = darken(roof, 0.35);
  return (
    rect(x - w / 2, y - h, w, h, 10, wall, stroke(lw, 4)) +
    path(`M${x - w / 2 - 10} ${y - h + 4}Q${x - w / 2 - 6} ${y - h - 70} ${x} ${y - h - 84}Q${x + w / 2 + 6} ${y - h - 70} ${x + w / 2 + 10} ${y - h + 4}Z`, roof, stroke(lr, 4)) +
    path(`M${x - w / 2 - 4} ${y - h - 6}Q${x} ${y - h + 6} ${x + w / 2 + 4} ${y - h - 6}`, 'none', stroke(lighten(roof, 0.35), 4)) +
    shine(x - w * 0.2, y - h - 46, 8, 16, 20, 0.45) +
    path(`M${x} ${y - h - 84}V${y - h - 122}`, 'none', stroke(P.inkSoft, 3)) +
    path(`M${x} ${y - h - 122}L${x + 30} ${y - h - 112}L${x} ${y - h - 102}Z`, flag, stroke(darken(flag, 0.3), 2.5)) +
    circle(x, y - h - 124, 4, P.gold) +
    circle(x, y - h * 0.62, w * 0.26, '#FFF3C4', stroke(lw, 4)) +
    path(`M${x - w * 0.26} ${y - h * 0.62}H${x + w * 0.26}M${x} ${y - h * 0.62 - w * 0.26}V${y - h * 0.62 + w * 0.26}`, 'none', stroke(lw, 3)) +
    heart(x, y - h * 0.24, 9, lighten(wall, 0.5))
  );
}

/** The academy: a jukebox-shaped hall with a rainbow arch, a marquee door and turrets. */
function academy(): string {
  const cx = 400;
  const base = 432;
  let arcs = '';
  const cols = ['#FF9FC6', '#FFC59E', '#FFE89A', '#B8EBA6', '#A3D8F7', '#C6B3FF'];
  cols.forEach((c, i) => {
    const r = 168 - i * 12;
    arcs += path(`M${cx - r} 262A${r} ${r} 0 0 1 ${cx + r} 262`, 'none', stroke(c, 12.5));
  });
  const doorBulbs: string[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + (i / 10) * Math.PI;
    doorBulbs.push(bulb(cx + Math.cos(a) * 66, 330 + Math.sin(a) * 66, 4.5, ['#FFE27A', '#FF9FC6', '#9FE8FF'][i % 3]));
  }
  return (
    // side wings
    turret(156, base, 92, 150, '#FFC4DD', '#B79BFF', '#FFE27A') +
    turret(644, base, 92, 150, '#FFC4DD', '#B79BFF', '#9FE8FF') +
    rect(196, 318, 120, 114, 0, '#FFD9E8', stroke('#E07FAE', 4)) +
    rect(484, 318, 120, 114, 0, '#FFD9E8', stroke('#E07FAE', 4)) +
    path('M190 320Q206 340 222 320Q238 340 254 320Q270 340 286 320Q302 340 318 320', '#9FE8DC', stroke('#3BB2AA', 3.5)) +
    path('M482 320Q498 340 514 320Q530 340 546 320Q562 340 578 320Q594 340 610 320', '#9FE8DC', stroke('#3BB2AA', 3.5)) +
    rect(214, 352, 36, 44, 18, '#FFF3C4', stroke('#E07FAE', 3.5)) +
    rect(262, 352, 36, 44, 18, '#FFF3C4', stroke('#E07FAE', 3.5)) +
    rect(502, 352, 36, 44, 18, '#FFF3C4', stroke('#E07FAE', 3.5)) +
    rect(550, 352, 36, 44, 18, '#FFF3C4', stroke('#E07FAE', 3.5)) +
    // main hall (jukebox)
    path(`M${cx - 184} ${base}V262A184 184 0 0 1 ${cx + 184} 262V${base}Z`, '#D9C8FF', stroke('#8E73CF', 5)) +
    arcs +
    path(`M${cx - 120} ${base}V270A120 120 0 0 1 ${cx + 120} 270V${base}Z`, url('hall'), stroke('#8E73CF', 4)) +
    shine(cx - 120, 160, 30, 12, -40, 0.4) +
    // little "speaker" circles on the hall front
    circle(cx - 88, 380, 18, '#B79BFF', stroke('#7F60D8', 3.5)) +
    circle(cx - 88, 380, 8, '#E4D8FF') +
    circle(cx + 88, 380, 18, '#B79BFF', stroke('#7F60D8', 3.5)) +
    circle(cx + 88, 380, 8, '#E4D8FF') +
    // marquee doorway
    path(`M${cx - 54} ${base}V330A54 54 0 0 1 ${cx + 54} 330V${base}Z`, url('doorGlow'), stroke('#E07FAE', 5)) +
    doorBulbs.join('') +
    // star on top
    starSign(cx, 78, 62, '#FFB3D6') +
    // steps
    rect(cx - 80, base - 4, 160, 12, 5, '#F7B5D2', stroke('#E07FAE', 3)) +
    rect(cx - 96, base + 6, 192, 12, 5, '#F7B5D2', stroke('#E07FAE', 3))
  );
}

/* ---------------------------------------------------------------- cover */

export function cover(): string {
  return (
    defs(
      linear('csky', [
        [0, '#A99AF0'],
        [0.5, '#E8B6E6'],
        [1, '#FFD7C6'],
      ]),
      linear('hall', [
        [0, '#FFE6F2'],
        [1, '#F6D2F0'],
      ]),
      linear('doorGlow', [
        [0, '#FFF3C4'],
        [1, '#FFC4DD'],
      ]),
      linear('plaza', [
        [0, '#FFD3E6'],
        [1, '#F6B7D6'],
      ]),
      radial('cglow', [
        [0, '#FFF6D8', 0.9],
        [1, '#FFF6D8', 0],
      ]),
    ) +
    rect(0, 0, 800, 600, 0, url('csky')) +
    dust(71, 30, { x: 10, y: 6, w: 780, h: 250 }, ['#fff', '#FFF1B8'], 3, 8, 0.9) +
    // crescent moon
    path('M98 52A40 40 0 1 0 128 124A32 32 0 1 1 98 52Z', '#FFF3C4', stroke('#F2C04A', 3)) +
    // searchlight beams behind the academy
    beam('cb1', 300, 420, 120, -20, 16, 70, '#FFFFFF', 0.4) +
    beam('cb2', 500, 420, 690, -20, 16, 70, '#FFFFFF', 0.4) +
    beam('cb3', 400, 420, 400, -40, 14, 60, '#FFE6A8', 0.35) +
    cloud(660, 120, 0.8, { fill: '#FFF0F7', shade: '#F3D2EC' }) +
    cloud(150, 230, 0.6, { fill: '#FFF0F7', shade: '#F3D2EC' }) +
    circle(400, 300, 260, url('cglow')) +
    academy() +
    // plaza
    path('M0 440Q400 410 800 440V600H0Z', url('plaza')) +
    path('M0 440Q400 410 800 440', 'none', stroke('#E07FAE', 4)) +
    path('M330 446Q400 440 470 446L560 600H240Z', '#FFE8F2', { opacity: 0.8 }) +
    dust(72, 16, { x: 20, y: 460, w: 760, h: 130 }, ['#fff'], 4, 9) +
    // garlands from the turrets
    bunting(156, 236, 400, 226, 22, 9, ['#FF9FC6', '#FFE27A', '#9FE8FF', '#B8EBA6', '#C9B3FF']) +
    bunting(400, 226, 644, 236, 22, 9, ['#C9B3FF', '#B8EBA6', '#9FE8FF', '#FFE27A', '#FF9FC6']) +
    // balloons at the edges
    balloon(40, 330, 26, '#FF9FC6', 70, 470) +
    balloon(86, 296, 24, '#9FE8FF', 74, 470) +
    balloon(756, 320, 26, '#FFE27A', 730, 470) +
    balloon(712, 290, 24, '#C9B3FF', 726, 470) +
    // floating notes
    note(250, 196, 0.8, '#FF8FBF', 'eighth', -12) +
    note(560, 176, 0.9, '#7FC4FF', 'beamed', 10) +
    note(712, 420, 0.6, '#B48CFF', 'eighth', 8) +
    // the band
    tumtum({ x: 184, y: 586, s: 1.08, mood: 'joy', armL: 'up', armR: 'up', holdL: (x, y) => stick(x, y, -28), holdR: (x, y) => stick(x, y, 28), mid: snare(0, -84, 52, 44, '#FF9FBF') }) +
    lolo({ x: 622, y: 584, s: 1.04, mood: 'wink', armL: 'wave', armR: 'hip', mid: keytar(0, -66, '#C9B3FF', -16, 0.9, '#FF9FC6') }) +
    plinky({ x: 404, y: 592, s: 1.28, mood: 'joy', armL: 'up', armR: 'hold', holdR: (x, y) => mic(x, y, '#FFD24D', 16, 1.1, '#FFE27A'), extra: 'crown' }) +
    fizz({ x: 552, y: 330, s: 0.78, mood: 'love', armL: 'cheer', armR: 'cheer', holdL: (x, y) => maraca(x, y, '#FF8FBF', -22, 1.3), holdR: (x, y) => maraca(x, y, '#FFD84D', 22, 1.3), shadow: false }) +
    sparkle(300, 470, 10, '#fff') +
    sparkle(520, 500, 8, '#fff') +
    heart(468, 300, 8, '#FF9FC6') +
    heart(330, 330, 6, '#fff')
  );
}

/* ---------------------------------------------------------------- level-map backdrop */

export function mapArt(): string {
  const r = rng(808);
  let bokeh = '';
  for (let i = 0; i < 16; i++) {
    const x = r() * 1200;
    const y = 200 + r() * 420;
    bokeh += circle(x, y, 20 + r() * 40, ['#FFFFFF', '#FFE8F4', '#EDE4FF'][i % 3], { opacity: 0.22 });
  }
  return (
    defs(
      linear('msky', [
        [0, '#D7C6FF'],
        [0.5, '#F1DDFB'],
        [1, '#FFD9EA'],
      ]),
      radial('mglow', [
        [0, '#FFFFFF', 0.6],
        [1, '#FFFFFF', 0],
      ]),
      linear('mfloor', [
        [0, '#F7C9E2'],
        [1, '#EFB3D6'],
      ]),
    ) +
    rect(0, 0, 1200, 800, 0, url('msky')) +
    ellipse(600, 420, 520, 300, url('mglow')) +
    bokeh +
    dust(81, 40, { x: 0, y: 160, w: 1200, h: 480 }, ['#fff'], 3, 7, 0.55) +
    // soft beams from the top corners (low contrast)
    beam('mb1', 60, 40, 420, 760, 16, 120, '#FFFFFF', 0.28) +
    beam('mb2', 1140, 40, 780, 760, 16, 120, '#FFFFFF', 0.28) +
    // top: valance, string lights & star
    valance(0, 1200, 56, 52, 12, '#E86FA6') +
    bunting(80, 96, 600, 104, 18, 11, ['#FF9FC6', '#FFE27A', '#9FE8FF', '#B8EBA6', '#C9B3FF']) +
    bunting(600, 104, 1120, 96, 18, 11, ['#C9B3FF', '#B8EBA6', '#9FE8FF', '#FFE27A', '#FF9FC6']) +
    // friends peeking from the wings
    lolo({ x: 1146, y: 680, s: 0.9, mood: 'joy', armL: 'wave', armR: 'down', shadow: false }) +
    tumtum({ x: 70, y: 640, s: 0.86, mood: 'wink', armL: 'down', armR: 'wave', shadow: false }) +
    // corner curtains
    path('M0 40H120Q100 200 40 300Q20 500 70 800H0Z', '#F27FB0', stroke('#C24E86', 4)) +
    path('M30 60Q60 220 24 330M70 60Q80 200 40 320', 'none', stroke('#F9A9CC', 5)) +
    path('M1200 40H1080Q1100 200 1160 300Q1180 500 1130 800H1200Z', '#F27FB0', stroke('#C24E86', 4)) +
    path('M1170 60Q1140 220 1176 330M1130 60Q1120 200 1160 320', 'none', stroke('#F9A9CC', 5)) +
    // bottom: stage edge with bulbs
    path('M0 690Q600 650 1200 690V800H0Z', url('mfloor')) +
    path('M0 690Q600 650 1200 690', 'none', stroke('#E07FAE', 5)) +
    path('M0 720Q600 680 1200 720', 'none', stroke('#F7B5D2', 3)) +
    Array.from({ length: 15 }, (_, i) => {
      const t = (i + 0.5) / 15;
      const x = t * 1200;
      const y = 690 - Math.sin(t * Math.PI) * 40 + 14;
      return bulb(x, y, 6, ['#FFE27A', '#FF9FC6', '#9FE8FF'][i % 3]);
    }).join('') +
    // corner vignettes
    g(starSign(0, 0, 70, '#FFB3D6'), { transform: 'translate(1060 220) rotate(10)' }) +
    g(fizz({ x: 0, y: 0, s: 0.9, mood: 'joy', armL: 'wave', armR: 'cheer', shadow: false }), { transform: 'translate(190 300)' }) +
    note(130, 440, 1, '#B48CFF', 'beamed', -10) +
    note(1080, 440, 0.9, '#FF8FBF', 'eighth', 12) +
    speaker(52, 560, 110, 150, '#8D7BC2') +
    tambourine(250, 744, 40) +
    maraca(330, 760, '#FF9FC6', 30, 1.2) +
    g(snare(0, 0, 60, 50, '#8FCBFF'), { transform: 'translate(880 716)' }) +
    stick(950, 704, 40) +
    stick(974, 708, 70) +
    keytar(1076, 742, '#C9B3FF', -12, 1.1, '#FF9FC6') +
    heart(400, 160, 10, '#FF9FC6', { opacity: 0.7 }) +
    heart(820, 170, 8, '#FFFFFF', { opacity: 0.7 }) +
    sparkle(500, 190, 9, '#fff') +
    sparkle(720, 640, 8, '#fff')
  );
}

/* ---------------------------------------------------------------- badge */

export function badgeArt(): string {
  let bumps = '';
  const pts: Array<[number, number, number]> = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    pts.push([100 + Math.cos(a) * 62, 92 + Math.sin(a) * 62, 14]);
  }
  bumps = puff([[100, 92, 64], ...pts], '#C9B3FF', '#7F60D8', 5);
  let rim = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    rim += bulb(100 + Math.cos(a) * 50, 92 + Math.sin(a) * 50, 3.6, ['#FFE27A', '#FF9FC6', '#9FE8FF'][i % 3]);
  }
  return (
    // ribbon tails
    path('M70 126L52 188L72 178L84 194L98 134Z', '#FF9FC6', stroke('#C24E86', 4)) +
    path('M130 126L148 188L128 178L116 194L102 134Z', '#9FE8DC', stroke('#3BB2AA', 4)) +
    bumps +
    circle(100, 92, 56, '#FFD66B', stroke(P.goldDeep, 4)) +
    rim +
    // a tiny monster in the middle
    puff([[78, 76, 13], [122, 76, 13], [100, 66, 15]], '#B89CFF', '#7E60D8', 3) +
    path('M86 70Q84 54 90 50Q94 60 94 68Z', P.lemon, stroke(P.goldDeep, 2.5)) +
    path('M114 70Q116 54 110 50Q106 60 106 68Z', P.lemon, stroke(P.goldDeep, 2.5)) +
    circle(100, 96, 30, '#FFB6D3', stroke('#D2669C', 3.5)) +
    puff([[88, 72, 9], [100, 69, 10], [112, 72, 9]], '#B89CFF', '#7E60D8', 3) +
    face({ x: 100, y: 96, s: 0.85, mood: 'joy' }) +
    shine(84, 84, 6, 3.5) +
    note(132, 122, 0.42, '#B48CFF', 'eighth', 10) +
    star(64, 124, 9, '#fff', { outline: P.goldDeep, width: 2 }) +
    sparkle(160, 40, 9, '#fff') +
    sparkle(40, 44, 7, '#fff') +
    shine(70, 50, 12, 6, -40, 0.5)
  );
}
