/**
 * Monster Pop Academy — props: instruments, music symbols, lights and stage pieces.
 * All helpers take the bits a difference might change as parameters.
 */
import { P, circle, darken, ellipse, g, heart, lighten, line, n, path, rect, rng, shine, sparkle, star, stroke } from '../../art/kit.ts';

/* ------------------------------------------------------------------ music symbols */

export type NoteKind = 'eighth' | 'beamed' | 'quarter';

/** A chunky music note with one clean outline. (x, y) = centre of the (first) note head. */
export function note(x: number, y: number, s: number, fill: string, kind: NoteKind = 'eighth', rot = 0, outline = darken(fill, 0.38)): string {
  const head = (hx: number, hy: number, layer: 'o' | 'f') =>
    ellipse(hx, hy, 11, 8, layer === 'o' ? outline : fill, { transform: `rotate(-22 ${hx} ${hy})`, ...(layer === 'o' ? stroke(outline, 7) : {}) });
  const stem = (sx: number, y1: number, y2: number, layer: 'o' | 'f') => line(sx, y1, sx, y2, layer === 'o' ? outline : fill, layer === 'o' ? 11 : 4.5);
  let parts: (l: 'o' | 'f') => string;
  if (kind === 'beamed') {
    parts = (l) =>
      head(0, 0, l) +
      head(32, -6, l) +
      stem(9, -2, -44, l) +
      stem(41, -8, -50, l) +
      path('M9 -44L41 -50L41 -40L9 -34Z', l === 'o' ? outline : fill, l === 'o' ? stroke(outline, 7) : {});
  } else if (kind === 'quarter') {
    parts = (l) => head(0, 0, l) + stem(9, -2, -44, l);
  } else {
    parts = (l) =>
      head(0, 0, l) + stem(9, -2, -44, l) + path('M9 -46Q12 -32 26 -26Q20 -20 22 -12Q16 -26 9 -28Z', l === 'o' ? outline : fill, l === 'o' ? stroke(outline, 7) : {});
  }
  const art = parts('o') + parts('f') + ellipse(-4, -3, 4, 2.4, '#fff', { opacity: 0.7, transform: 'rotate(-22 -4 -3)' });
  return g(art, { transform: `translate(${n(x)} ${n(y)})${rot ? ` rotate(${n(rot)})` : ''} scale(${n(s)})` });
}

/* ------------------------------------------------------------------ lights */

/** A glowing marquee bulb (on) or a dim one (off). */
export function bulb(x: number, y: number, r: number, color: string = P.lemon, on = true): string {
  if (!on) return circle(x, y, r, '#E8DCCF', stroke('#B9A48F', Math.max(1.5, r * 0.28)));
  return circle(x, y, r * 2.3, color, { opacity: 0.28 }) + circle(x, y, r, lighten(color, 0.55), stroke(darken(color, 0.15), Math.max(1.5, r * 0.28))) + circle(x - r * 0.3, y - r * 0.32, r * 0.32, '#fff');
}

/** Bulbs evenly spaced along a straight run. */
export function bulbRow(x1: number, y1: number, x2: number, y2: number, count: number, r: number, colors: string[], on: (i: number) => boolean = () => true): string {
  let out = '';
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    out += bulb(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, r, colors[i % colors.length], on(i));
  }
  return out;
}

/** userSpaceOnUse gradient along a beam (colour → transparent). */
export function beamGrad(id: string, x1: number, y1: number, x2: number, y2: number, color: string, op = 0.5): string {
  return (
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}">` +
    `<stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset="0.7" stop-color="${color}" stop-opacity="${n(op * 0.35)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`
  );
}

/** A translucent spotlight beam from (x, y) to a pool centred at (tx, ty). */
export function beam(id: string, x: number, y: number, tx: number, ty: number, w0: number, w1: number, color: string, op = 0.5): string {
  const dx = tx - x;
  const dy = ty - y;
  const len = Math.hypot(dx, dy);
  const px = -dy / len;
  const py = dx / len;
  const d = `M${n(x + px * w0)} ${n(y + py * w0)}L${n(tx + px * w1)} ${n(ty + py * w1)}L${n(tx - px * w1)} ${n(ty - py * w1)}L${n(x - px * w0)} ${n(y - py * w0)}Z`;
  return `<defs>${beamGrad(id, x, y, tx, ty, color, op)}</defs>` + path(d, `url(#${id})`);
}

/** Stage spotlight can (pointing at angle deg, 90 = straight down). */
export function spotCan(x: number, y: number, deg: number, color: string, s = 1): string {
  const body = darken('#8E7BB8', 0.1);
  return g(
    rect(-16, -14, 32, 34, 8, '#7D6AA6', stroke(P.ink, 3.5)) +
      path('M-18 18L18 18L22 30L-22 30Z', body, stroke(P.ink, 3.5)) +
      ellipse(0, 30, 22, 6, lighten(color, 0.5), stroke(P.ink, 3)) +
      rect(-10, -8, 6, 18, 3, '#A796D0'),
    { transform: `translate(${n(x)} ${n(y)}) rotate(${n(deg - 90)}) scale(${n(s)})` },
  );
}

/* ------------------------------------------------------------------ decorations */

/** Point on a sagging string (quadratic) between two pins. */
export function sagPoint(x1: number, y1: number, x2: number, y2: number, sag: number, t: number): [number, number] {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + sag * 2;
  const u = 1 - t;
  return [u * u * x1 + 2 * u * t * cx + t * t * x2, u * u * y1 + 2 * u * t * cy + t * t * y2];
}

/** Pennant bunting along a sagging string. `shape(i)` lets a difference swap one pennant. */
export function bunting(x1: number, y1: number, x2: number, y2: number, sag: number, count: number, colors: string[], size = 22): string {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + sag * 2;
  let out = path(`M${n(x1)} ${n(y1)}Q${n(cx)} ${n(cy)} ${n(x2)} ${n(y2)}`, 'none', stroke(P.inkSoft, 2.5));
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const [px, py] = sagPoint(x1, y1, x2, y2, sag, t);
    const c = colors[i % colors.length];
    out += path(`M${n(px - size * 0.55)} ${n(py)}L${n(px + size * 0.55)} ${n(py)}L${n(px)} ${n(py + size)}Z`, c, stroke(darken(c, 0.25), 2.5));
  }
  return out;
}

/** Sparkle dust (deterministic). */
export function dust(seed: number, count: number, box: { x: number; y: number; w: number; h: number }, colors: string[] = ['#fff'], min = 3, max = 8, op = 0.9): string {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = box.x + r() * box.w;
    const y = box.y + r() * box.h;
    const s = min + r() * (max - min);
    out += sparkle(x, y, s, colors[i % colors.length], op);
  }
  return out;
}

/* ------------------------------------------------------------------ instruments */

/** Handheld microphone. (x, y) = grip point; deg rotates (0 = straight up). */
export function mic(x: number, y: number, color: string, deg = 0, s = 1, head?: string): string {
  const lc = darken(color, 0.4);
  const hc = head ?? '#D9D3E6';
  return g(
    path('M-6 6L-8 -26L8 -26L6 6Q0 10 -6 6Z', color, stroke(lc, 3.2)) +
      rect(-10, -32, 20, 8, 3, P.gold, stroke(P.goldDeep, 2.6)) +
      circle(0, -44, 14, hc, stroke(head ? darken(head, 0.4) : P.inkSoft, 3.2)) +
      path('M-10 -48H10M-12 -42H12M-9 -36H9M-4 -56V-32M4 -56V-32', 'none', stroke(head ? darken(head, 0.18) : '#B5ABC9', 1.6)) +
      circle(-5, -50, 3.6, '#fff', { opacity: 0.8 }) +
      ellipse(-3, -12, 2, 7, '#fff', { opacity: 0.5 }),
    { transform: `translate(${n(x)} ${n(y)}) rotate(${n(deg)}) scale(${n(s)})` },
  );
}

/** Maraca. (x, y) = hand; deg tilts. */
export function maraca(x: number, y: number, color: string, deg = 0, s = 1): string {
  const lc = darken(color, 0.38);
  return g(
    rect(-4.5, -18, 9, 30, 4.5, P.wood, stroke(P.woodDeep, 3)) +
      ellipse(0, -34, 15, 19, color, stroke(lc, 3.2)) +
      path('M-14 -30Q0 -24 14 -30', 'none', stroke('#fff', 3)) +
      path('M-12 -40Q0 -34 12 -40', 'none', stroke(lighten(color, 0.5), 2.4)) +
      ellipse(-6, -42, 4, 6, '#fff', { opacity: 0.6, transform: 'rotate(-25 -6 -42)' }),
    { transform: `translate(${n(x)} ${n(y)}) rotate(${n(deg)}) scale(${n(s)})` },
  );
}

/** Tambourine (front view). */
export function tambourine(x: number, y: number, r: number, rim: string = P.coral): string {
  let jingles = '';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    jingles += ellipse(x + Math.cos(a) * r * 0.88, y + Math.sin(a) * r * 0.88, r * 0.16, r * 0.11, P.gold, { ...stroke(P.goldDeep, 2), transform: `rotate(${n((a * 180) / Math.PI + 90)} ${n(x + Math.cos(a) * r * 0.88)} ${n(y + Math.sin(a) * r * 0.88)})` });
  }
  return (
    circle(x, y, r, rim, stroke(darken(rim, 0.38), 4)) +
    circle(x, y, r * 0.72, P.cream, stroke(darken(rim, 0.3), 3)) +
    jingles +
    star(x, y, r * 0.3, P.pink, { outline: P.pinkDeep, width: 2 }) +
    shine(x - r * 0.35, y - r * 0.35, r * 0.18, r * 0.1)
  );
}

/** Musical triangle with a beater. */
export function triangleInst(x: number, y: number, s = 1, color = '#B9C4DA'): string {
  return g(
    line(0, -48, 0, -40, P.coralDeep, 3) +
      path('M0 -40L-26 6L22 6', 'none', stroke(darken(color, 0.35), 9)) +
      path('M0 -40L-26 6L22 6', 'none', stroke(color, 4.5)) +
      line(10, -30, 34, -6, P.woodDeep, 5) +
      circle(34, -6, 4.5, P.gold, stroke(P.goldDeep, 2)),
    { transform: `translate(${n(x)} ${n(y)}) scale(${n(s)})` },
  );
}

/** Drumstick in a hand; deg 0 points up. */
export function stick(x: number, y: number, deg: number, s = 1): string {
  return g(line(0, 8, 0, -44, P.woodDeep, 8) + line(0, 8, 0, -44, P.wood, 4.5) + circle(0, -46, 5.5, P.cream, stroke(P.woodDeep, 2.5)), {
    transform: `translate(${n(x)} ${n(y)}) rotate(${n(deg)}) scale(${n(s)})`,
  });
}

export type DrumDeco = 'star' | 'heart' | 'note' | 'dot';

/** Bass drum, front view, with emblem decorations at relative positions. */
export function bassDrum(x: number, y: number, r: number, shell: string, decos: Array<[number, number, DrumDeco, string, number?]>): string {
  const lc = darken(shell, 0.4);
  let lugs = '';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    lugs += circle(x + Math.cos(a) * (r - 6), y + Math.sin(a) * (r - 6), 4.2, '#E9E3F2', stroke(P.inkSoft, 1.8));
  }
  const d = decos
    .map(([dx, dy, kind, c, size]) => {
      const px = x + dx * r;
      const py = y + dy * r;
      const k = size ?? 1;
      if (kind === 'star') return star(px, py, r * 0.16 * k, c, { outline: darken(c, 0.3), width: 3 });
      if (kind === 'heart') return heart(px, py, r * 0.14 * k, c, stroke(darken(c, 0.3), 3));
      if (kind === 'note') return note(px - r * 0.04 * k, py + r * 0.1 * k, r * 0.0075 * k, c, 'eighth');
      return circle(px, py, r * 0.07 * k, c, stroke(darken(c, 0.3), 2));
    })
    .join('');
  return (
    ellipse(x, y + r + 4, r * 0.9, 9, P.ink, { opacity: 0.14 }) +
    path(`M${x - r * 0.7} ${y + r * 0.6}L${x - r * 0.95} ${y + r + 4}M${x + r * 0.7} ${y + r * 0.6}L${x + r * 0.95} ${y + r + 4}`, 'none', stroke('#9A8BB8', 5)) +
    circle(x, y, r, shell, stroke(lc, 4.5)) +
    circle(x, y, r - 13, '#FFFAF2', stroke(lc, 3.5)) +
    lugs +
    d +
    shine(x - r * 0.42, y - r * 0.42, r * 0.22, r * 0.11, -40, 0.7)
  );
}

/** Snare/tom drum, 3/4 view cylinder. (x, y) = centre of the top skin. */
export function snare(x: number, y: number, w: number, h: number, shell: string): string {
  const lc = darken(shell, 0.4);
  let zig = `M${x - w + 4} ${y + 8}`;
  const steps = 8;
  for (let i = 1; i <= steps; i++) zig += `L${n(x - w + 4 + ((2 * w - 8) * i) / steps)} ${i % 2 ? y + h - 4 : y + 8}`;
  return (
    path(`M${x - w} ${y}V${y + h}A${w} ${w * 0.3} 0 0 0 ${x + w} ${y + h}V${y}Z`, shell, stroke(lc, 4)) +
    path(zig, 'none', stroke('#fff', 3)) +
    ellipse(x, y, w, w * 0.3, '#FFFAF2', stroke(lc, 4)) +
    ellipse(x - w * 0.3, y - 2, w * 0.25, w * 0.07, '#fff', { opacity: 0.8 })
  );
}

/** Cymbal on a stand. */
export function cymbal(x: number, y: number, w: number, standH: number): string {
  return (
    line(x, y, x, y + standH, '#8C7BAE', 5) +
    path(`M${x - 18} ${y + standH}L${x} ${y + standH - 16}L${x + 18} ${y + standH}`, 'none', stroke('#8C7BAE', 4)) +
    ellipse(x, y, w, w * 0.22, P.gold, stroke(P.goldDeep, 3.5)) +
    ellipse(x, y - 1, w * 0.62, w * 0.12, '#FFE9A6') +
    circle(x, y - 3, 5, P.goldDeep) +
    sparkle(x - w * 0.5, y - 8, 7, '#fff')
  );
}

/** Keytar body. (x, y) = centre; deg tilt. `keys` = colour of the accent keys. */
export function keytar(x: number, y: number, color: string, deg = -18, s = 1, accent: string = P.lemon): string {
  const lc = darken(color, 0.4);
  let keys = '';
  for (let i = 0; i < 9; i++) keys += rect(-46 + i * 9, -6, 8, 18, 2, '#fff', stroke('#CFC4E2', 1.4));
  for (const i of [0, 1, 3, 4, 5, 7]) keys += rect(-41 + i * 9, -6, 5, 10, 1.5, P.inkSoft);
  return g(
    path('M-62 -14Q-66 18 -50 18L40 18Q52 18 58 6L84 -8Q92 -14 84 -20L60 -14Z', color, stroke(lc, 3.5)) +
      keys +
      circle(58, -2, 4, accent, stroke(darken(accent, 0.3), 1.6)) +
      circle(70, -8, 4, P.mint, stroke(P.mintDeep, 1.6)) +
      shine(-40, -10, 10, 3, -5, 0.6),
    { transform: `translate(${n(x)} ${n(y)}) rotate(${n(deg)}) scale(${n(s)})` },
  );
}

/* ------------------------------------------------------------------ stage & room pieces */

/** Floor speaker / monitor with two cones. */
export function speaker(x: number, y: number, w: number, h: number, color = '#7A68A6'): string {
  const lc = darken(color, 0.4);
  const cone = (cx: number, cy: number, r: number) => circle(cx, cy, r, '#5A4A80', stroke(lc, 3)) + circle(cx, cy, r * 0.62, '#8C7BC0', stroke(lc, 2.5)) + circle(cx, cy, r * 0.25, '#C7B8F0') + circle(cx - r * 0.3, cy - r * 0.35, r * 0.12, '#fff', { opacity: 0.7 });
  return (
    ellipse(x + w / 2, y + h + 2, w * 0.6, 9, P.ink, { opacity: 0.14 }) +
    rect(x, y, w, h, 12, color, stroke(lc, 4)) +
    rect(x + 6, y + 6, w - 12, 8, 4, lighten(color, 0.25)) +
    cone(x + w / 2, y + h * 0.34, w * 0.24) +
    cone(x + w / 2, y + h * 0.74, w * 0.3)
  );
}

/** Potted plant with round leaves. (x, y) = floor point. */
export function plant(x: number, y: number, s = 1, pot: string = P.coral): string {
  const lc = darken(pot, 0.38);
  const leaf = (lx: number, ly: number, r: number, rot: number) => ellipse(lx, ly, r, r * 0.62, P.grass, { ...stroke(P.grassDeep, 3.5), transform: `rotate(${rot} ${lx} ${ly})` });
  return g(
    ellipse(0, 0, 44, 9, P.ink, { opacity: 0.14 }) +
      path('M0 -60Q-4 -110 -16 -150M0 -60Q8 -120 22 -168M0 -60Q-10 -90 -40 -110M0 -60Q14 -86 44 -104', 'none', stroke(P.grassDeep, 4.5)) +
      leaf(-16, -152, 20, -60) +
      leaf(22, -170, 22, -110) +
      leaf(-42, -112, 22, -20) +
      leaf(46, -106, 22, 20) +
      leaf(-24, -128, 16, 20) +
      leaf(26, -136, 16, -30) +
      path('M-34 -62H34L26 0H-26Z', pot, stroke(lc, 4)) +
      rect(-40, -70, 80, 16, 7, lighten(pot, 0.2), stroke(lc, 4)) +
      heart(0, -32, 9, lighten(pot, 0.5)),
    { transform: `translate(${n(x)} ${n(y)}) scale(${n(s)})` },
  );
}

/** Balloon with a curly string ending at (sx, sy). */
export function balloon(x: number, y: number, r: number, color: string, sx: number, sy: number, heartShape = false): string {
  const lc = darken(color, 0.35);
  const body = heartShape ? heart(x, y, r * 1.15, color, stroke(lc, 3.5)) : ellipse(x, y, r, r * 1.18, color, stroke(lc, 3.5));
  const by = heartShape ? y + r * 0.98 : y + r * 1.18;
  return (
    path(`M${x} ${by + 4}Q${(x + sx) / 2 + 14} ${(by + sy) / 2} ${sx} ${sy}`, 'none', stroke(P.inkSoft, 2)) +
    path(`M${x - 5} ${by + 7}L${x} ${by - 1}L${x + 5} ${by + 7}Z`, color, stroke(lc, 2.5)) +
    body +
    ellipse(x - r * 0.38, y - r * 0.42, r * 0.22, r * 0.34, '#fff', { opacity: 0.6, transform: `rotate(30 ${x - r * 0.38} ${y - r * 0.42})` })
  );
}

/** Disco ball on a short chain. */
export function discoBall(x: number, y: number, r: number, chainTop: number): string {
  let tiles = '';
  for (let i = -2; i <= 2; i++) tiles += path(`M${x - Math.sqrt(r * r - (i * r * 0.36) ** 2)} ${y + i * r * 0.36}H${x + Math.sqrt(r * r - (i * r * 0.36) ** 2)}`, 'none', stroke('#A9A3C9', 1.6));
  for (let i = -2; i <= 2; i++) tiles += ellipse(x, y, Math.abs(i) * r * 0.36 + 0.01, r, 'none', stroke('#A9A3C9', 1.6));
  return (
    line(x, chainTop, x, y - r, P.inkSoft, 2.5) +
    circle(x, y, r, '#E6E3F5', stroke(P.inkSoft, 3.5)) +
    tiles +
    circle(x - r * 0.35, y - r * 0.35, r * 0.28, '#fff', { opacity: 0.85 }) +
    rect(x + r * 0.2, y + r * 0.1, r * 0.22, r * 0.22, 2, P.pink, { opacity: 0.8 }) +
    rect(x - r * 0.15, y + r * 0.42, r * 0.2, r * 0.2, 2, P.aqua, { opacity: 0.8 }) +
    rect(x + r * 0.45, y - r * 0.35, r * 0.18, r * 0.18, 2, P.lemon, { opacity: 0.8 }) +
    sparkle(x + r * 0.9, y - r * 0.8, r * 0.35, '#fff') +
    sparkle(x - r * 1.1, y + r * 0.6, r * 0.25, '#fff')
  );
}

/** Draped side curtain from the top edge. side -1 = left curtain. */
export function curtain(xEdge: number, top: number, bottom: number, width: number, side: -1 | 1, color: string, tieY: number): string {
  const lc = darken(color, 0.35);
  const inner = xEdge - side * width;
  const tieX = xEdge - side * width * 0.35;
  const d =
    `M${xEdge} ${top}L${inner} ${top}` +
    `Q${inner + side * 6} ${tieY - 60} ${tieX} ${tieY}` +
    `Q${tieX + side * 8} ${tieY + 50} ${xEdge - side * width * 0.55} ${bottom}L${xEdge} ${bottom}Z`;
  let folds = '';
  for (let i = 1; i <= 3; i++) {
    const fx = xEdge - side * width * (0.2 + i * 0.18);
    folds += path(`M${n(fx)} ${top + 4}Q${n(fx + side * 10)} ${tieY - 40} ${n(tieX + side * (14 + i * 6))} ${tieY - 4}`, 'none', { ...stroke(lighten(color, 0.3), 5), opacity: 0.55 });
    folds += path(`M${n(tieX + side * (10 + i * 8))} ${tieY + 10}Q${n(fx + side * 4)} ${tieY + 70} ${n(xEdge - side * width * (0.12 + i * 0.12))} ${bottom - 4}`, 'none', stroke(darken(color, 0.12), 5));
  }
  return path(d, color, stroke(lc, 4)) + folds + ellipse(tieX, tieY, 16, 10, P.gold, stroke(P.goldDeep, 3)) + path(`M${tieX - 4} ${tieY + 8}l-6 26M${tieX + 4} ${tieY + 8}l6 26`, 'none', stroke(P.goldDeep, 4));
}

/** Scalloped valance (top drape) across the stage. */
export function valance(x1: number, x2: number, y: number, depth: number, count: number, color: string): string {
  const lc = darken(color, 0.35);
  const w = (x2 - x1) / count;
  let d = `M${x1} ${y - depth}H${x2}V${y}`;
  for (let i = count - 1; i >= 0; i--) d += `Q${n(x1 + w * (i + 0.5))} ${n(y + depth * 0.9)} ${n(x1 + w * i)} ${y}`;
  d += 'Z';
  let tassels = '';
  for (let i = 1; i < count; i++) tassels += circle(x1 + w * i, y + 4, 5, P.gold, stroke(P.goldDeep, 2));
  return path(d, color, stroke(lc, 4)) + path(`M${x1} ${y - depth + 10}H${x2}`, 'none', stroke(P.gold, 5)) + tassels;
}

/** A framed star-shaped marquee sign with bulbs around it. */
export function starSign(x: number, y: number, r: number, fill: string, bulbsOn = true): string {
  let bulbs = '';
  for (let i = 0; i < 10; i++) {
    const a = ((i * 36 - 90) * Math.PI) / 180;
    const rr = i % 2 === 0 ? r * 0.82 : r * 0.42;
    bulbs += bulb(x + Math.cos(a) * rr, y + Math.sin(a) * rr, r * 0.055, P.lemon, bulbsOn);
  }
  return star(x, y, r, fill, { outline: darken(fill, 0.35), width: r * 0.08, inner: 0.52 }) + star(x, y, r * 0.7, lighten(fill, 0.35), { inner: 0.52, width: 1 }) + bulbs;
}

/* ------------------------------------------------------------------ rooms */

/** A tiling pattern definition (place inside <defs>). */
export const patternDef = (id: string, w: number, h: number, content: string): string =>
  `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${content}</pattern>`;

/**
 * Perspective checker floor between `top` and `bottom`, converging on (vx, vy).
 * `rows` are the y positions of tile edges; columns are `spacing` apart at the bottom edge.
 * The alternate tiles are one path, so the floor costs only a few elements.
 */
export function checkerFloor(o: { top: number; bottom: number; vx: number; vy: number; spacing: number; rows: number[]; base: string; alt: string; line?: string; x0?: number; x1?: number }): string {
  const x0 = o.x0 ?? 0;
  const x1 = o.x1 ?? 800;
  const xAt = (X: number, y: number) => o.vx + ((X - o.vx) * (y - o.vy)) / (o.bottom - o.vy);
  const cols: number[] = [];
  for (let X = o.vx - o.spacing * 14; X <= o.vx + o.spacing * 14; X += o.spacing) cols.push(X);
  let d = '';
  for (let i = 0; i < o.rows.length - 1; i++) {
    const ya = o.rows[i];
    const yb = o.rows[i + 1];
    for (let j = 0; j < cols.length - 1; j++) {
      if ((i + j) % 2) continue;
      const a = xAt(cols[j], ya);
      const b = xAt(cols[j + 1], ya);
      const c = xAt(cols[j + 1], yb);
      const e = xAt(cols[j], yb);
      if (Math.max(a, b, c, e) < x0 - 40 || Math.min(a, b, c, e) > x1 + 40) continue;
      d += `M${n(a)} ${n(ya)}L${n(b)} ${n(ya)}L${n(c)} ${n(yb)}L${n(e)} ${n(yb)}Z`;
    }
  }
  let lines = '';
  if (o.line) {
    for (const X of cols) lines += `M${n(xAt(X, o.top))} ${o.top}L${n(X)} ${o.bottom}`;
    for (const y of o.rows) lines += `M${x0} ${y}H${x1}`;
  }
  return rect(x0, o.top, x1 - x0, o.bottom - o.top, 0, o.base) + path(d, o.alt) + (o.line ? path(lines, 'none', { stroke: o.line, 'stroke-width': 1.5, opacity: 0.5 }) : '');
}
