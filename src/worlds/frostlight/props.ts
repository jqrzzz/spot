/**
 * Frostlight Kingdom — scenery & props.
 *
 * Everything returns SVG markup. Props are drawn in scene units around an anchor point
 * (usually the ground contact point) and take the bits that can vary as parameters, so a
 * level can switch a difference by passing a different argument.
 *
 * Shared gradients live in `frostDefs()`; every scene/cover/sticker that uses these props
 * must include it once (ids are namespaced per picture by the game).
 */
import {
  P,
  circle,
  darken,
  ellipse,
  face,
  g,
  lighten,
  linear,
  n,
  path,
  polar,
  puff,
  radial,
  range,
  rect,
  rng,
  scatter,
  shine,
  sparkle,
  star,
  stroke,
  url,
} from '../../art/kit.ts';
import type { Attrs, Mood } from '../../art/kit.ts';

/* ------------------------------------------------------------------ palette */

/** Frostlight tones (pastel ice + warm lights). */
export const F = {
  snow: '#F8FAFF',
  snowShade: '#DDE3FA',
  snowLine: '#A7B3E3',
  snowLilac: '#E6DEFA',
  ice: '#D9F0FF',
  iceMid: '#B5DCF7',
  iceLine: '#7EAEE0',
  pine: '#8ED3C6',
  pineDeep: '#5BA9A3',
  pineLine: '#3F7D86',
  wall: '#DCEEFF',
  wallShade: '#B6D3F3',
  wallLine: '#7E9FD6',
  roof: '#BBA6F5',
  roofLine: '#7F68C9',
  roofPink: '#F6B3D3',
  roofPinkLine: '#C6739F',
  glow: '#FFE7A3',
  glowDeep: '#FFC46E',
  lamp: '#FFF3C8',
  peach: '#FFC2A0',
  berry: '#FF8FAE',
  plumSoft: '#8A78B8',
} as const;

/* ------------------------------------------------------------------ helpers */

/** Lilac-tinted ground shadow (softer and more magical than grey). */
export const lshadow = (cx: number, cy: number, rx: number, ry: number, opacity = 0.2): string =>
  ellipse(cx, cy, rx, ry, '#8E7CD6', { opacity });

/** Soft round glow using a radial gradient id from frostDefs(). */
export const glow = (cx: number, cy: number, r: number, id = 'fkGlow', opacity = 1): string =>
  circle(cx, cy, r, url(id), { opacity: opacity === 1 ? undefined : opacity });

/** Mirror the art horizontally around x = cx. */
export const mirror = (art: string, cx: number): string => g(art, { transform: `translate(${n(cx * 2)} 0) scale(-1 1)` });

/** Place art drawn around (0,0) at (x, y) with scale and optional horizontal flip. */
export function place(art: string, x: number, y: number, s = 1, flip = false, rot = 0): string {
  const t = `translate(${n(x)} ${n(y)})${rot ? ` rotate(${n(rot)})` : ''}${s !== 1 || flip ? ` scale(${n(flip ? -s : s)} ${n(s)})` : ''}`;
  return g(art, { transform: t });
}

/* ------------------------------------------------------------------ gradients */

/** Shared Frostlight gradients. Include once per picture. */
export function frostDefs(): string {
  return (
    linear('fkSnow', [
      [0, '#FFFFFF'],
      [0.55, '#F3F5FF'],
      [1, '#DCE2F8'],
    ]) +
    linear('fkSnowWarm', [
      [0, '#FFFFFF'],
      [0.6, '#FBF1FA'],
      [1, '#E8DEF6'],
    ]) +
    linear('fkIce', [
      [0, '#F2FAFF'],
      [0.5, '#CBE8FB'],
      [1, '#A6D0F2'],
    ]) +
    linear(
      'fkIcicle',
      [
        [0, '#FFFFFF'],
        [0.45, '#E3F4FF'],
        [1, '#A9D4F4'],
      ],
      0,
      0,
      1,
      0,
    ) +
    linear('fkWall', [
      [0, '#EEF7FF'],
      [1, '#C3DCF7'],
    ]) +
    linear('fkWallDeep', [
      [0, '#D5E9FF'],
      [1, '#A9C8EE'],
    ]) +
    linear('fkRoof', [
      [0, '#D8CBFF'],
      [1, '#A88FEA'],
    ]) +
    linear('fkRoofPink', [
      [0, '#FFD3E6'],
      [1, '#EE9CC4'],
    ]) +
    linear('fkPine', [
      [0, '#A6E2D3'],
      [1, '#62AFA8'],
    ]) +
    linear('fkWindow', [
      [0, '#FFF6CF'],
      [1, '#FFC979'],
    ]) +
    linear('fkWood', [
      [0, '#F0C9A2'],
      [1, '#D29E78'],
    ]) +
    linear(
      'fkCrystal',
      [
        [0, '#F4FCFF'],
        [0.5, '#B6EAF6'],
        [1, '#9FC2F5'],
      ],
      0,
      0,
      1,
      1,
    ) +
    linear(
      'fkCrystalPink',
      [
        [0, '#FFF4FA'],
        [0.5, '#FFC8E2'],
        [1, '#D9A8F2'],
      ],
      0,
      0,
      1,
      1,
    ) +
    linear(
      'fkCrystalLilac',
      [
        [0, '#FAF6FF'],
        [0.5, '#D9CBFF'],
        [1, '#A9B4F5'],
      ],
      0,
      0,
      1,
      1,
    ) +
    radial('fkGlow', [
      [0, '#FFF6CF', 0.95],
      [0.35, '#FFE39A', 0.55],
      [1, '#FFD27A', 0],
    ]) +
    radial('fkGlowPink', [
      [0, '#FFE3EF', 0.9],
      [0.4, '#FFC2DD', 0.45],
      [1, '#FFB0D2', 0],
    ]) +
    radial('fkGlowBlue', [
      [0, '#F2FCFF', 0.95],
      [0.4, '#C5EEFF', 0.5],
      [1, '#A8E2FF', 0],
    ]) +
    radial('fkGlowLilac', [
      [0, '#F6F0FF', 0.9],
      [0.45, '#DCCBFF', 0.45],
      [1, '#C8B4FF', 0],
    ]) +
    radial('fkMoon', [
      [0, '#FFFDF1'],
      [0.7, '#FFF2C6'],
      [1, '#FFE29A'],
    ]) +
    radial('fkSun', [
      [0, '#FFFBE0'],
      [0.6, '#FFE590'],
      [1, '#FFC871'],
    ])
  );
}

/* ------------------------------------------------------------------ sky & weather */

/** Deterministic falling snow: soft dots plus a few tiny flakes. Identical in both pictures. */
export function fallingSnow(seed: number, count: number, box: { x: number; y: number; w: number; h: number }, o: { color?: string; opacity?: number; big?: number } = {}): string {
  const r = rng(seed);
  const color = o.color ?? '#FFFFFF';
  const pts = scatter(seed + 101, count, box, 26);
  let out = '';
  pts.forEach(([x, y], i) => {
    const s = 1.6 + r() * 2.6;
    if (o.big && i % o.big === 0) out += miniFlake(x, y, 5 + r() * 3, color);
    else out += circle(x, y, s, color, { opacity: n((o.opacity ?? 0.9) - r() * 0.3) });
  });
  return g(out);
}

/** A tiny 6-arm flake (decoration). */
export function miniFlake(x: number, y: number, r: number, color = '#FFFFFF', opacity = 0.95): string {
  let d = '';
  for (let i = 0; i < 3; i++) {
    const [ax, ay] = polar(x, y, r, i * 60 - 90);
    const [bx, by] = polar(x, y, r, i * 60 + 90);
    d += `M${n(ax)} ${n(ay)}L${n(bx)} ${n(by)}`;
  }
  return path(d, 'none', { ...stroke(color, Math.max(1.4, r * 0.28)), opacity });
}

/** Big friendly sun with a soft halo and a happy face. */
export function sun(x: number, y: number, r: number, mood: Mood | false = 'happy', glowK = 2.1): string {
  const rays = range(12)
    .map((i) => {
      const [ax, ay] = polar(x, y, r * 1.22, i * 30);
      const [bx, by] = polar(x, y, r * 1.48, i * 30);
      return `M${n(ax)} ${n(ay)}L${n(bx)} ${n(by)}`;
    })
    .join('');
  return g(
    circle(x, y, r * glowK, url('fkGlow'), { opacity: 0.8 }) +
      path(rays, 'none', stroke('#FFD27A', r * 0.13)) +
      circle(x, y, r, url('fkSun'), stroke('#F2B65A', 4)) +
      shine(x - r * 0.38, y - r * 0.4, r * 0.3, r * 0.18) +
      (mood ? face({ x, y: y - r * 0.08, s: r / 46, mood, blush: '#FF9F8F' }) : ''),
  );
}

/** Puffy snow cloud (lilac-shaded) with optional falling flakes underneath. */
export function snowCloud(x: number, y: number, s = 1, flakes = true, fill = '#FFFFFF', shade = '#D9D6F6'): string {
  const body = (dy: number, c: string, line = false) =>
    puff(
      [
        [x - 52 * s, y + 8 * s + dy, 28 * s],
        [x - 18 * s, y - 14 * s + dy, 38 * s],
        [x + 26 * s, y - 6 * s + dy, 33 * s],
        [x + 56 * s, y + 10 * s + dy, 24 * s],
        [x, y + 14 * s + dy, 30 * s],
      ],
      c,
      line ? '#B1A9E2' : false,
      4,
    );
  let fl = '';
  if (flakes) {
    const pts: [number, number][] = [
      [-46, 62],
      [-14, 78],
      [22, 60],
      [50, 80],
      [-30, 100],
      [6, 104],
      [38, 108],
    ];
    fl = pts.map(([dx, dy], i) => (i % 2 ? circle(x + dx * s, y + dy * s, 4 * s, '#FFFFFF', stroke('#B9B4E8', 1.6)) : miniFlake(x + dx * s, y + dy * s, 8 * s, '#9FA8E6', 1))).join('');
  }
  return g(fl + body(6 * s, shade, true) + body(0, fill) + shine(x - 26 * s, y - 24 * s, 16 * s, 8 * s, -20, 0.9));
}

/** Plain soft cloud (no outline) for skies. */
export function softCloud(x: number, y: number, s = 1, fill = '#FFFFFF', opacity = 0.9): string {
  return g(
    puff(
      [
        [x - 40 * s, y + 6 * s, 22 * s],
        [x - 12 * s, y - 8 * s, 28 * s],
        [x + 22 * s, y - 2 * s, 24 * s],
        [x + 46 * s, y + 8 * s, 16 * s],
        [x, y + 10 * s, 22 * s],
      ],
      fill,
    ),
    { opacity },
  );
}

/** Aurora ribbon: a wavy curtain fading downward. `id` must be unique in the scene. */
export function aurora(id: string, pts: [number, number][], height: number, colors: [string, string], opacity = 0.6): string {
  // top edge follows pts; bottom edge is the same curve shifted down by `height`
  const curve = (dy: number, rev = false): string => {
    const p = rev ? [...pts].reverse() : pts;
    let d = `${n(p[0][0])} ${n(p[0][1] + dy)}`;
    for (let i = 1; i < p.length; i++) {
      const [x0, y0] = p[i - 1];
      const [x1, y1] = p[i];
      const mx = (x0 + x1) / 2;
      d += `C${n(mx)} ${n(y0 + dy)} ${n(mx)} ${n(y1 + dy)} ${n(x1)} ${n(y1 + dy)}`;
    }
    return d;
  };
  const d = `M${curve(0)}L${curve(height, true)}Z`;
  return (
    linear(id, [
      [0, colors[0], 0],
      [0.25, colors[0], opacity],
      [0.6, colors[1], opacity * 0.6],
      [1, colors[1], 0],
    ]) + path(d, url(id))
  );
}

/** Crescent or full moon. */
export function moon(x: number, y: number, r: number, full: boolean, skyColor: string): string {
  const halo = circle(x, y, r * 2.2, url('fkGlow'), { opacity: 0.55 });
  if (full) {
    return g(
      halo +
        circle(x, y, r, url('fkMoon'), stroke('#EBC77A', 3.5)) +
        circle(x - r * 0.3, y + r * 0.25, r * 0.16, '#F5DFA0', { opacity: 0.7 }) +
        circle(x + r * 0.32, y - r * 0.1, r * 0.11, '#F5DFA0', { opacity: 0.7 }) +
        circle(x + r * 0.1, y + r * 0.45, r * 0.08, '#F5DFA0', { opacity: 0.7 }) +
        shine(x - r * 0.4, y - r * 0.42, r * 0.28, r * 0.14),
    );
  }
  // crescent: outer circle minus offset circle (drawn as a path with two arcs)
  const off = r * 0.62;
  const ri = r * 0.86;
  // intersection points of circle (x,y,r) and circle (x+off, y-off*0.35, ri)
  const cx2 = x + off;
  const cy2 = y - off * 0.35;
  const dx = cx2 - x;
  const dy = cy2 - y;
  const d = Math.hypot(dx, dy);
  const a = (r * r - ri * ri + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r * r - a * a));
  const px = x + (a * dx) / d;
  const py = y + (a * dy) / d;
  const ix1 = px + (h * dy) / d;
  const iy1 = py - (h * dx) / d;
  const ix2 = px - (h * dy) / d;
  const iy2 = py + (h * dx) / d;
  const dPath = `M${n(ix1)} ${n(iy1)}A${n(r)} ${n(r)} 0 1 0 ${n(ix2)} ${n(iy2)}A${n(ri)} ${n(ri)} 0 0 1 ${n(ix1)} ${n(iy1)}Z`;
  void skyColor;
  return g(halo + path(dPath, url('fkMoon'), stroke('#EBC77A', 3.5)) + shine(x - r * 0.55, y - r * 0.2, r * 0.18, r * 0.1, -60));
}

/* ------------------------------------------------------------------ snowflakes & ice */

export interface FlakeOpts {
  arms?: number;
  color?: string;
  line?: string;
  width?: number;
  rot?: number;
  /** Arm indices drawn without side branches (for symmetry differences). */
  plain?: number[];
  /** Arm indices that are missing entirely. */
  missing?: number[];
  /** Arm indices drawn shorter (0.55 length). */
  short?: number[];
  glowId?: string | false;
  tips?: 'dot' | 'heart' | 'none';
  tipColor?: string;
}

/** Big decorative snowflake with branched arms and an outline. */
export function snowflake(x: number, y: number, r: number, o: FlakeOpts = {}): string {
  const arms = o.arms ?? 6;
  const color = o.color ?? '#FFFFFF';
  const line = o.line ?? '#7FA3E0';
  const w = o.width ?? Math.max(3, r * 0.11);
  const rot = o.rot ?? 0;
  let d = '';
  const tips: string[] = [];
  for (let i = 0; i < arms; i++) {
    if (o.missing?.includes(i)) continue;
    const ang = rot - 90 + (i * 360) / arms;
    const len = o.short?.includes(i) ? r * 0.55 : r;
    const [tx, ty] = polar(x, y, len, ang);
    d += `M${n(x)} ${n(y)}L${n(tx)} ${n(ty)}`;
    if (!o.plain?.includes(i) && !o.short?.includes(i)) {
      for (const [at, bl] of [
        [0.5, 0.32],
        [0.78, 0.2],
      ] as const) {
        const [bx, by] = polar(x, y, r * at, ang);
        const [l1x, l1y] = polar(bx, by, r * bl, ang - 52);
        const [l2x, l2y] = polar(bx, by, r * bl, ang + 52);
        d += `M${n(l1x)} ${n(l1y)}L${n(bx)} ${n(by)}L${n(l2x)} ${n(l2y)}`;
      }
    }
    if ((o.tips ?? 'dot') === 'dot') tips.push(circle(tx, ty, w * 0.95, o.tipColor ?? color, stroke(line, w * 0.45)));
    else if (o.tips === 'heart') {
      const [hx, hy] = polar(x, y, len + w * 0.6, ang);
      tips.push(g(`<path d="M0 ${n(w * 1.6)}C${n(-w * 2.2)} 0 ${n(-w * 1.6)} ${n(-w * 1.7)} 0 ${n(-w * 0.6)}C${n(w * 1.6)} ${n(-w * 1.7)} ${n(w * 2.2)} 0 0 ${n(w * 1.6)}Z" fill="${o.tipColor ?? P.pink}" stroke="${line}" stroke-width="${n(w * 0.4)}" stroke-linejoin="round"/>`, { transform: `translate(${n(hx)} ${n(hy)}) rotate(${n(ang + 90)})` }));
    }
  }
  const hex = range(6)
    .map((i) => polar(x, y, r * 0.17, rot - 90 + i * 60))
    .map(([px, py], i) => `${i ? 'L' : 'M'}${n(px)} ${n(py)}`)
    .join('');
  return g(
    (o.glowId === false ? '' : circle(x, y, r * 1.35, url(o.glowId ?? 'fkGlowBlue'), { opacity: 0.9 })) +
      path(d, 'none', stroke(line, w + 3.6)) +
      path(d, 'none', stroke(color, w)) +
      path(hex + 'Z', color, stroke(line, 2.6)) +
      tips.join('') +
      circle(x, y, r * 0.07, line, { opacity: 0.6 }),
  );
}

/** Icicle hanging from (x, top). */
export function icicle(x: number, top: number, len: number, w: number, o: { line?: string } = {}): string {
  const hw = w / 2;
  const tipY = top + len;
  const d =
    `M${n(x - hw)} ${n(top)}` +
    `C${n(x - hw)} ${n(top + len * 0.35)} ${n(x - hw * 0.35)} ${n(top + len * 0.62)} ${n(x - hw * 0.12)} ${n(tipY - 3)}` +
    `Q${n(x)} ${n(tipY + 2)} ${n(x + hw * 0.12)} ${n(tipY - 3)}` +
    `C${n(x + hw * 0.4)} ${n(top + len * 0.55)} ${n(x + hw)} ${n(top + len * 0.3)} ${n(x + hw)} ${n(top)}Z`;
  return g(
    path(d, url('fkIcicle'), stroke(o.line ?? F.iceLine, 2.6)) +
      path(`M${n(x - hw * 0.45)} ${n(top + 4)}Q${n(x - hw * 0.35)} ${n(top + len * 0.4)} ${n(x - hw * 0.1)} ${n(top + len * 0.7)}`, 'none', { ...stroke('#FFFFFF', Math.max(1.6, w * 0.16)), opacity: 0.9 }),
  );
}

/** A row of icicles along a roof edge; `lens` gives each length. */
export function icicleRow(x0: number, x1: number, top: number, lens: number[], w = 10): string {
  const step = (x1 - x0) / Math.max(1, lens.length - 1);
  return lens.map((l, i) => icicle(x0 + i * step, top, l, w)).join('');
}

/** Snow bank / drift: a puffy mound with one clean outline. */
export function snowBank(circles: [number, number, number][], o: { fill?: string; line?: string; width?: number } = {}): string {
  return puff(circles, o.fill ?? url('fkSnow'), o.line ?? F.snowLine, o.width ?? 4);
}

/** Snow ground: a filled shape from a top curve down to the bottom of the scene. */
export function snowGround(d: string, bottom = 600, fill = url('fkSnow'), line: string | false = F.snowLine, w = 800): string {
  return path(`${d}V${bottom}H0Z`, fill) + (line ? path(d, 'none', { ...stroke(line, 4), opacity: 0.85 }) : '') + (w ? '' : '');
}

/** Little snow sparkles sitting on the ground (identical in both pictures). */
export function groundSparkles(seed: number, count: number, box: { x: number; y: number; w: number; h: number }, color = '#FFFFFF'): string {
  const r = rng(seed);
  return scatter(seed, count, box, 40)
    .map(([x, y]) => (r() > 0.5 ? sparkle(x, y, 5 + r() * 5, color, 0.95) : path(`M${n(x - 8)} ${n(y)}q8 -5 16 0`, 'none', { ...stroke('#B9C2EC', 2.4), opacity: 0.7 })))
    .join('');
}

/* ------------------------------------------------------------------ trees */

/** Snowy pastel pine tree standing on (x, base). */
export function pine(x: number, base: number, h: number, o: { fill?: string; line?: string; topStar?: boolean; lights?: boolean; shadow?: boolean; seed?: number } = {}): string {
  const fill = o.fill ?? url('fkPine');
  const line = o.line ?? F.pineLine;
  const w = h * 0.62;
  const trunkH = h * 0.12;
  let out = (o.shadow === false ? '' : lshadow(x, base, w * 0.55, h * 0.05)) + rect(x - h * 0.05, base - trunkH - 4, h * 0.1, trunkH + 4, 3, url('fkWood'), stroke(darken(P.wood, 0.35), 3));
  const tiers = 3;
  for (let i = 0; i < tiers; i++) {
    const tb = base - trunkH - i * h * 0.24; // tier bottom
    const tt = tb - h * 0.42; // tier top
    const hw = (w / 2) * (1 - i * 0.24);
    const th = tb - tt;
    const body = `M${n(x)} ${n(tt)}L${n(x + hw)} ${n(tb - 4)}Q${n(x + hw * 0.5)} ${n(tb + 6)} ${n(x)} ${n(tb + 1)}Q${n(x - hw * 0.5)} ${n(tb + 6)} ${n(x - hw)} ${n(tb - 4)}Z`;
    out += path(body, fill, stroke(line, 3.5));
    const sy = tt + th * 0.5;
    const sw = hw * 0.5;
    const cap =
      `M${n(x)} ${n(tt - 2)}L${n(x + sw + 3)} ${n(sy)}` +
      `Q${n(x + sw * 0.7)} ${n(sy + 9)} ${n(x + sw * 0.4)} ${n(sy + 1)}` +
      `Q${n(x + sw * 0.15)} ${n(sy + 12)} ${n(x - sw * 0.12)} ${n(sy + 2)}` +
      `Q${n(x - sw * 0.45)} ${n(sy + 10)} ${n(x - sw * 0.7)} ${n(sy + 2)}` +
      `L${n(x - sw - 3)} ${n(sy)}Z`;
    out += path(cap, url('fkSnow'), stroke(F.snowLine, 2.6));
    // snow lip along the bottom of each tier
    out += path(`M${n(x - hw + 6)} ${n(tb - 6)}Q${n(x - hw * 0.5)} ${n(tb + 2)} ${n(x - hw * 0.15)} ${n(tb - 3)}`, 'none', { ...stroke('#FFFFFF', 4), opacity: 0.85 });
  }
  if (o.lights) {
    const r = rng(o.seed ?? 3);
    const cols = ['#FFE07A', '#FF9FC4', '#9FE3FF', '#C7B3FF'];
    for (let i = 0; i < 9; i++) {
      const tier = i % 3;
      const tb = base - trunkH - tier * h * 0.24;
      const hw = (w / 2) * (1 - tier * 0.24);
      const yy = tb - 8 - r() * 14;
      const xx = x + (r() - 0.5) * hw * 1.3;
      out += circle(xx, yy, 7, url('fkGlow'), { opacity: 0.8 }) + circle(xx, yy, 3.4, cols[i % 4], stroke(darken(cols[i % 4], 0.3), 1.4));
    }
  }
  if (o.topStar) {
    const ty = base - trunkH - 2 * h * 0.24 - h * 0.42 - 8;
    out += glow(x, ty, 38) + star(x, ty - 2, 22, P.gold, { outline: P.goldDeep, width: 4.5 }) + shine(x - 6, ty - 8, 5, 3);
  }
  return g(out);
}

/** Simple far pine silhouette (no outline) for backgrounds. */
export function farPine(x: number, base: number, h: number, fill: string, snow = '#FFFFFF'): string {
  const w = h * 0.5;
  const d = `M${n(x)} ${n(base - h)}L${n(x + w * 0.32)} ${n(base - h * 0.62)}L${n(x + w * 0.22)} ${n(base - h * 0.62)}L${n(x + w * 0.5)} ${n(base - h * 0.15)}L${n(x - w * 0.5)} ${n(base - h * 0.15)}L${n(x - w * 0.22)} ${n(base - h * 0.62)}L${n(x - w * 0.32)} ${n(base - h * 0.62)}Z`;
  const cap = `M${n(x)} ${n(base - h)}L${n(x + w * 0.2)} ${n(base - h * 0.76)}Q${n(x)} ${n(base - h * 0.7)} ${n(x - w * 0.2)} ${n(base - h * 0.76)}Z`;
  return path(d, fill, { 'stroke-linejoin': 'round', stroke: fill, 'stroke-width': 3 }) + path(cap, snow, { opacity: 0.9 }) + rect(x - 2.5, base - h * 0.16, 5, h * 0.16, 1, fill);
}

/** One faceted crystal shard from base (x,y) pointing at angle `ang` (deg, -90 = up). */
export function shard(x: number, y: number, len: number, w: number, ang: number, fill: string, line: string): string {
  const [tx, ty] = polar(x, y, len, ang);
  const [mx, my] = polar(x, y, len * 0.72, ang);
  const [lx, ly] = polar(mx, my, w / 2, ang - 90);
  const [rx, ry] = polar(mx, my, w / 2, ang + 90);
  const [blx, bly] = polar(x, y, w * 0.42, ang - 90);
  const [brx, bry] = polar(x, y, w * 0.42, ang + 90);
  const body = `M${n(blx)} ${n(bly)}L${n(lx)} ${n(ly)}L${n(tx)} ${n(ty)}L${n(rx)} ${n(ry)}L${n(brx)} ${n(bry)}Z`;
  const facet = `M${n(x)} ${n(y)}L${n(mx)} ${n(my)}L${n(tx)} ${n(ty)}L${n(lx)} ${n(ly)}L${n(blx)} ${n(bly)}Z`;
  return path(body, fill, stroke(line, 3)) + path(facet, '#FFFFFF', { opacity: 0.45 }) + path(`M${n(x)} ${n(y)}L${n(mx)} ${n(my)}L${n(tx)} ${n(ty)}`, 'none', { ...stroke(line, 1.6), opacity: 0.5 });
}

export type CrystalTone = 'blue' | 'pink' | 'lilac';
const CRYSTAL: Record<CrystalTone, { fill: string; line: string; glow: string }> = {
  blue: { fill: url('fkCrystal'), line: '#6E9CD8', glow: 'fkGlowBlue' },
  pink: { fill: url('fkCrystalPink'), line: '#C979AE', glow: 'fkGlowPink' },
  lilac: { fill: url('fkCrystalLilac'), line: '#8C7BD6', glow: 'fkGlowLilac' },
};

/** Glowing crystal tree on (x, base). `h` ≈ total height. */
export function crystalTree(x: number, base: number, h: number, tone: CrystalTone = 'blue', o: { glow?: boolean; seed?: number } = {}): string {
  const c = CRYSTAL[tone];
  const s = h / 200;
  const X = (v: number) => n(x + v * s);
  const Y = (v: number) => n(base + v * s);
  let out = o.glow === false ? '' : circle(x, base - h * 0.62, h * 0.62, url(c.glow), { opacity: 0.85 });
  out += lshadow(x, base, 50 * s, 9 * s, 0.22);
  // trunk that splits into three branches
  const br = `M${X(0)} ${Y(-14)}L${X(0)} ${Y(-76)}M${X(0)} ${Y(-74)}Q${X(-24)} ${Y(-86)} ${X(-50)} ${Y(-112)}M${X(0)} ${Y(-74)}Q${X(24)} ${Y(-86)} ${X(50)} ${Y(-112)}M${X(0)} ${Y(-74)}L${X(0)} ${Y(-136)}`;
  out += path(br, 'none', stroke('#8C7BD6', 17 * s + 3)) + path(br, 'none', stroke('#D9CBFF', 17 * s - 3));
  out += path(`M${X(-4)} ${Y(-8)}L${X(-4)} ${Y(-70)}`, 'none', { ...stroke('#FFFFFF', 4 * s), opacity: 0.6 });
  out += path(`M${X(-20)} ${Y(1)}Q${X(-9)} ${Y(-4)} ${X(-9)} ${Y(-26)}L${X(9)} ${Y(-26)}Q${X(9)} ${Y(-4)} ${X(20)} ${Y(1)}Z`, '#D9CBFF', stroke('#8C7BD6', 3));
  // clusters of shards at the branch ends
  const clusters: [number, number, [number, number, number][]][] = [
    [-50, -112, [[-168, 44, 24], [-136, 58, 28], [-104, 46, 24]]],
    [50, -112, [[-76, 46, 24], [-44, 58, 28], [-12, 44, 24]]],
    [0, -134, [[-122, 52, 26], [-58, 52, 26], [-90, 72, 32]]],
  ];
  for (const [bx, by, list] of clusters) for (const [a, len, w] of list) out += shard(x + bx * s, base + by * s, len * s, w * s, a, c.fill, c.line);
  // hanging glow-drops
  for (const [hx, hy] of [
    [-30, -96],
    [30, -96],
    [-70, -96],
    [70, -96],
  ] as const)
    out += path(`M${X(hx)} ${Y(hy - 8)}V${Y(hy)}`, 'none', stroke('#8C7BD6', 2)) + circle(x + hx * s, base + (hy + 6) * s, 12 * s, url('fkGlow')) + circle(x + hx * s, base + (hy + 6) * s, 5 * s, '#FFF3C2', stroke('#E5B962', 1.6));
  const r = rng(o.seed ?? 5);
  for (let i = 0; i < 3; i++) out += sparkle(x + (r() - 0.5) * 150 * s, base - (150 + r() * 50) * s, 6 + r() * 4, '#FFFFFF');
  return g(out);
}

/** Small crystal cluster growing out of the snow. */
export function crystalCluster(x: number, base: number, s: number, tone: CrystalTone = 'blue'): string {
  const c = CRYSTAL[tone];
  return g(
    glow(x, base - 26 * s, 44 * s, c.glow, 0.8) +
      shard(x - 14 * s, base, 38 * s, 16 * s, -122, c.fill, c.line) +
      shard(x + 14 * s, base, 34 * s, 15 * s, -60, c.fill, c.line) +
      shard(x, base + 2 * s, 56 * s, 20 * s, -90, c.fill, c.line),
  );
}

/* ------------------------------------------------------------------ snowman */

export interface SnowmanOpts {
  buttons?: number;
  buttonColors?: string[];
  /** Button radius (local units, default 10.5). */
  buttonR?: number;
  /** Custom button positions (local units); defaults to SNOWMAN_BUTTON_SLOTS. */
  buttonSlots?: [number, number][];
  hat?: string | false;
  scarf?: string | false;
  scarfStripe?: string;
  mood?: Mood;
  arms?: boolean;
  /** Draws a mitten on the raised arm. */
  mitten?: string | false;
}

/** Fixed button slots so that adding a button never moves the others. */
export const SNOWMAN_BUTTON_SLOTS: [number, number][] = [
  [0, -86],
  [0, -62],
  [0, -38],
  [0, -14],
];

/** Two-ball snow-friend standing on (x, base). `s` = scale (1 ≈ 190 tall). */
export function snowman(x: number, base: number, s: number, o: SnowmanOpts): string {
  const L = F.snowLine;
  const body = (cx: number, cy: number, r: number) => circle(cx, cy, r, url('fkSnow'), stroke(L, 4)) + shine(cx - r * 0.42, cy - r * 0.45, r * 0.3, r * 0.17, -35, 0.9);
  let art = lshadow(0, 0, 78, 13, 0.24);
  if (o.arms !== false) {
    art +=
      path('M-52 -100L-96 -138M-82 -126L-96 -122M-86 -130L-84 -148', 'none', stroke(P.woodDeep, 6)) +
      path('M52 -100L98 -122M84 -116L100 -104M88 -118L104 -132', 'none', stroke(P.woodDeep, 6));
    if (o.mitten) art += g(path('M-6 10C-14 0 -12 -16 0 -18C10 -18 14 -6 10 6Z', o.mitten, stroke(darken(o.mitten, 0.3), 3)) + path('M-8 -6C-16 -10 -16 -18 -10 -18', 'none', stroke(darken(o.mitten, 0.3), 3)) + rect(-8, 4, 18, 7, 3, lighten(o.mitten, 0.5), stroke(darken(o.mitten, 0.3), 2.6)), { transform: 'translate(-100 -150) rotate(-20)' });
  }
  art += body(0, -66, 66) + path('M-40 -18Q0 6 40 -18', 'none', { ...stroke('#C9D0F0', 3), opacity: 0.8 });
  art += body(0, -160, 46);
  // buttons
  const nb = o.buttons ?? 3;
  const bc = o.buttonColors ?? ['#FF9DBB', '#9CC9FF', '#FFD66B', '#B3EECB'];
  (o.buttonSlots ?? SNOWMAN_BUTTON_SLOTS).slice(0, nb).forEach(([bx, by], i) => {
    const br = o.buttonR ?? 10.5;
    art += circle(bx, by, br, bc[i % bc.length], stroke(darken(bc[i % bc.length], 0.35), 3.2)) + circle(bx - br * 0.3, by - br * 0.3, br * 0.28, '#fff', { opacity: 0.8 });
  });
  // face
  art += face({ x: 0, y: -166, s: 1.05, mood: o.mood ?? 'happy', gap: 16 });
  // little carrot nose
  art += path('M-4 -164Q8 -162 17 -155Q6 -153 -4 -154Q-8 -159 -4 -164Z', P.peachDeep, stroke(darken(P.peachDeep, 0.3), 2.4)) + path('M5 -160l1 3', 'none', stroke(darken(P.peachDeep, 0.3), 1.6));
  if (o.scarf) {
    const sc = o.scarf;
    const ln = darken(sc, 0.32);
    const st = o.scarfStripe ?? lighten(sc, 0.55);
    art +=
      path('M-44 -124Q0 -100 44 -124L46 -108Q0 -86 -46 -108Z', sc, stroke(ln, 3.5)) +
      path('M18 -108L26 -62L44 -66L38 -114Z', sc, stroke(ln, 3.5)) +
      path('M22 -86L41 -90M24 -74L43 -78', 'none', stroke(st, 4)) +
      path('M-24 -110L-24 -98M-6 -104L-6 -92', 'none', stroke(st, 4)) +
      path('M27 -62l-2 8M33 -63l-1 9M39 -65l1 8', 'none', stroke(ln, 2.6));
  }
  if (o.hat) {
    const hc = o.hat;
    const ln = darken(hc, 0.32);
    art +=
      path('M-42 -196C-44 -244 44 -244 42 -196Z', hc, stroke(ln, 4)) +
      path('M-26 -216Q-22 -226 -14 -232M0 -208V-236M14 -232Q22 -226 26 -216', 'none', { ...stroke(lighten(hc, 0.45), 4), opacity: 0.9 }) +
      rect(-48, -206, 96, 20, 10, lighten(hc, 0.55), stroke(ln, 4)) +
      path('M-36 -192v-8M-24 -192v-8M-12 -192v-8M0 -192v-8M12 -192v-8M24 -192v-8M36 -192v-8', 'none', { ...stroke(ln, 2.2), opacity: 0.45 }) +
      circle(0, -244, 15, '#FFFFFF', stroke(ln, 3.5)) +
      shine(-5, -249, 5, 3);
  }
  return place(art, x, base, s);
}

/* ------------------------------------------------------------------ buildings */

/** Glowing window with panes, snowy sill and a soft glow. Shapes: arch, round, square, heart, star. */
export function windowGlow(cx: number, cy: number, w: number, h: number, shape: 'arch' | 'round' | 'square' | 'heart' | 'star' = 'arch', o: { frame?: string; lit?: boolean; sill?: boolean; panes?: boolean } = {}): string {
  const frame = o.frame ?? '#B58A6A';
  const lit = o.lit !== false;
  const fill = lit ? url('fkWindow') : '#8E97C9';
  const hw = w / 2;
  const hh = h / 2;
  let shapeEl = '';
  let panes = '';
  switch (shape) {
    case 'round':
      shapeEl = ellipse(cx, cy, hw, hh, fill, stroke(frame, 4));
      panes = `M${n(cx)} ${n(cy - hh)}V${n(cy + hh)}`;
      break;
    case 'square':
      shapeEl = rect(cx - hw, cy - hh, w, h, 4, fill, stroke(frame, 4));
      panes = `M${n(cx)} ${n(cy - hh)}V${n(cy + hh)}M${n(cx - hw)} ${n(cy)}H${n(cx + hw)}`;
      break;
    case 'heart': {
      const s = hw;
      shapeEl = path(
        `M${n(cx)} ${n(cy + s * 0.95)}C${n(cx - s * 1.3)} ${n(cy + s * 0.05)} ${n(cx - s * 1.0)} ${n(cy - s * 1.05)} ${n(cx)} ${n(cy - s * 0.42)}C${n(cx + s * 1.0)} ${n(cy - s * 1.05)} ${n(cx + s * 1.3)} ${n(cy + s * 0.05)} ${n(cx)} ${n(cy + s * 0.95)}Z`,
        fill,
        stroke(frame, 4),
      );
      panes = '';
      break;
    }
    case 'star':
      shapeEl = star(cx, cy, hw * 1.15, fill, { outline: frame, width: 4, inner: 0.52 });
      panes = '';
      break;
    default:
      shapeEl = path(`M${n(cx - hw)} ${n(cy + hh)}V${n(cy - hh + hw)}A${n(hw)} ${n(hw)} 0 0 1 ${n(cx + hw)} ${n(cy - hh + hw)}V${n(cy + hh)}Z`, fill, stroke(frame, 4));
      panes = `M${n(cx)} ${n(cy - hh + 2)}V${n(cy + hh)}M${n(cx - hw)} ${n(cy + hh * 0.1)}H${n(cx + hw)}`;
  }
  const sill = o.sill === false ? '' : path(`M${n(cx - hw - 7)} ${n(cy + hh + 2)}Q${n(cx)} ${n(cy + hh - 7)} ${n(cx + hw + 7)} ${n(cy + hh + 2)}Q${n(cx + hw + 4)} ${n(cy + hh + 9)} ${n(cx)} ${n(cy + hh + 8)}Q${n(cx - hw - 4)} ${n(cy + hh + 9)} ${n(cx - hw - 7)} ${n(cy + hh + 2)}Z`, '#FFFFFF', stroke(F.snowLine, 2.4));
  return g(
    (lit ? circle(cx, cy, Math.max(w, h) * 1.05, url('fkGlow'), { opacity: 0.75 }) : '') +
      shapeEl +
      (panes && o.panes !== false ? path(panes, 'none', stroke(frame, 3)) : '') +
      (lit ? ellipse(cx - hw * 0.35, cy - hh * 0.3, hw * 0.22, hh * 0.18, '#FFFFFF', { opacity: 0.7 }) : '') +
      sill,
  );
}

/** Puffy snow cap that sits along a line from (x0,y) to (x1,y). */
export function snowCap(x0: number, x1: number, y: number, thick = 14, drips = true): string {
  const w = x1 - x0;
  const k = Math.max(3, Math.round(w / 34));
  let d = `M${n(x0 - 6)} ${n(y + 2)}`;
  d += `Q${n(x0 - 8)} ${n(y - thick)} ${n(x0 + w * 0.2)} ${n(y - thick)}`;
  d += `Q${n(x0 + w * 0.5)} ${n(y - thick * 1.35)} ${n(x0 + w * 0.8)} ${n(y - thick)}`;
  d += `Q${n(x1 + 8)} ${n(y - thick)} ${n(x1 + 6)} ${n(y + 2)}`;
  // scalloped drips back along the bottom
  for (let i = k; i >= 1; i--) {
    const xa = x0 + (w * i) / k;
    const xb = x0 + (w * (i - 1)) / k;
    const dip = drips && i % 2 === 0 ? 9 : 4;
    d += `Q${n((xa + xb) / 2)} ${n(y + dip + 4)} ${n(xb)} ${n(y + 2)}`;
  }
  return path(d + 'Z', url('fkSnow'), stroke(F.snowLine, 3));
}

export interface CottageOpts {
  wall?: string;
  roof?: string;
  door?: string;
  windowShape?: 'arch' | 'round' | 'square' | 'heart' | 'star';
  /** Window shape on the right side (lets a level change just one). */
  windowShapeR?: 'arch' | 'round' | 'square' | 'heart' | 'star';
  wreath?: boolean;
  smoke?: boolean;
  icicles?: number[];
  chimney?: boolean;
}

/** Cosy snow cottage standing on (x, base). Width ≈ 170·s. */
export function cottage(x: number, base: number, s: number, o: CottageOpts = {}): string {
  const wall = o.wall ?? '#FFD3C2';
  const wl = darken(wall, 0.35);
  const roof = o.roof ?? '#B7A3F0';
  const rl = darken(roof, 0.32);
  let a = lshadow(0, 2, 100, 12, 0.24);
  // chimney
  if (o.chimney !== false) {
    if (o.smoke !== false) a += path('M46 -186C36 -200 58 -208 48 -222C40 -232 60 -240 54 -256', 'none', { ...stroke('#FFFFFF', 9), opacity: 0.6 });
    a += rect(34, -186, 24, 50, 3, '#E9A9A0', stroke(darken('#E9A9A0', 0.35), 3.5)) + path('M30 -190h32', 'none', stroke(darken('#E9A9A0', 0.35), 4)) + snowCap(32, 60, -192, 8, false);
  }
  // walls
  a += rect(-70, -112, 140, 112, 6, wall, stroke(wl, 4));
  a += path('M-70 -30H70M-70 -60H70', 'none', { ...stroke(wl, 2), opacity: 0.25 });
  // roof
  a += path('M-92 -104L0 -176L92 -104Z', roof, stroke(rl, 4));
  a += path('M-60 -118L0 -164L60 -118', 'none', { ...stroke(lighten(roof, 0.4), 3), opacity: 0.6 });
  // heavy snow on the roof
  a += path('M-100 -100Q-104 -114 -86 -118L-4 -184Q4 -190 12 -184L88 -120Q104 -114 98 -98Q88 -90 78 -98Q66 -88 54 -98Q42 -90 30 -100Q18 -90 6 -100Q-6 -90 -18 -100Q-30 -90 -42 -100Q-54 -90 -66 -100Q-80 -90 -100 -100Z', url('fkSnow'), stroke(F.snowLine, 3.5));
  a += shine(-40, -146, 22, 6, -38, 0.9);
  // windows
  a += windowGlow(-40, -60, 34, 38, o.windowShape ?? 'arch');
  a += windowGlow(42, -64, 28, 30, o.windowShapeR ?? o.windowShape ?? 'round');
  // door
  const door = o.door ?? '#C99872';
  a += path('M-14 0V-54Q0 -70 14 -54V0Z', door, stroke(darken(door, 0.35), 3.5)) + circle(8, -26, 2.6, P.gold);
  if (o.wreath) a += circle(0, -52, 9, 'none', stroke('#6CC29A', 6)) + circle(0, -45, 3.4, P.coralDeep);
  // doorstep snow
  a += path('M-26 2Q0 -10 26 2Z', '#FFFFFF', stroke(F.snowLine, 2.5));
  if (o.icicles) a += icicleRow(-84, 84, -100, o.icicles, 8);
  return place(a, x, base, s);
}

/** Cosy lantern; `lit` false makes it an unlit blue lantern. Hangs from (x, y top). */
export function lantern(x: number, y: number, s = 1, o: { lit?: boolean; color?: string; glowR?: number; hook?: boolean } = {}): string {
  const lit = o.lit !== false;
  const frame = o.color ?? '#8E7BC9';
  const fl = darken(frame, 0.3);
  const body = lit ? url('fkWindow') : '#A7B2DD';
  return g(
    (lit ? circle(0, 30, o.glowR ?? 52, url('fkGlow')) : '') +
      (o.hook !== false ? path('M0 -6V4', 'none', stroke(fl, 3)) + circle(0, -8, 4, 'none', stroke(fl, 2.6)) : '') +
      path('M-12 8L12 8L16 16H-16Z', frame, stroke(fl, 3)) +
      rect(-14, 16, 28, 30, 7, body, stroke(fl, 3)) +
      path('M-5 18V44M5 18V44', 'none', { ...stroke(fl, 1.8), opacity: 0.55 }) +
      (lit ? ellipse(0, 32, 5, 8, '#FFFFFF', { opacity: 0.8 }) : '') +
      path('M-16 46H16L12 53H-12Z', frame, stroke(fl, 3)),
    { transform: `translate(${n(x)} ${n(y)}) scale(${n(s)})` },
  );
}

/** Lamp post with a lantern on top, standing on (x, base). */
export function lampPost(x: number, base: number, h: number, o: { lit?: boolean; color?: string; snow?: boolean } = {}): string {
  const c = o.color ?? '#8E7BC9';
  const cl = darken(c, 0.3);
  return g(
    lshadow(x, base, 20, 5) +
      rect(x - 4, base - h, 8, h, 3, c, stroke(cl, 3)) +
      rect(x - 10, base - 8, 20, 9, 3, c, stroke(cl, 3)) +
      path(`M${n(x - 4)} ${n(base - h + 4)}Q${n(x - 22)} ${n(base - h - 6)} ${n(x - 20)} ${n(base - h + 12)}`, 'none', stroke(cl, 3)) +
      lantern(x, base - h - 58, 1, { lit: o.lit, color: c, hook: false }) +
      (o.snow === false ? '' : path(`M${n(x - 18)} ${n(base - h - 52)}Q${n(x)} ${n(base - h - 68)} ${n(x + 18)} ${n(base - h - 52)}Z`, '#FFFFFF', stroke(F.snowLine, 2.2))),
  );
}

/* ------------------------------------------------------------------ castle */

/** Pointed tower roof (cone) with snow cap and a flag. */
export function coneRoof(cx: number, baseY: number, w: number, h: number, fill: string, line: string, flag?: string): string {
  const hw = w / 2;
  const tipY = baseY - h;
  let out = '';
  if (flag) out += path(`M${n(cx)} ${n(tipY)}V${n(tipY - 30)}`, 'none', stroke(line, 3)) + path(`M${n(cx + 1)} ${n(tipY - 30)}Q${n(cx + 14)} ${n(tipY - 32)} ${n(cx + 24)} ${n(tipY - 24)}Q${n(cx + 12)} ${n(tipY - 20)} ${n(cx + 1)} ${n(tipY - 19)}Z`, flag, stroke(darken(flag, 0.3), 2.4));
  out += path(`M${n(cx - hw - 6)} ${n(baseY)}Q${n(cx - hw * 0.3)} ${n(baseY - h * 0.45)} ${n(cx)} ${n(tipY)}Q${n(cx + hw * 0.3)} ${n(baseY - h * 0.45)} ${n(cx + hw + 6)} ${n(baseY)}Z`, fill, stroke(line, 3.5));
  out += path(`M${n(cx - hw * 0.4)} ${n(baseY - 6)}Q${n(cx - hw * 0.2)} ${n(baseY - h * 0.5)} ${n(cx)} ${n(tipY + 8)}`, 'none', { ...stroke('#FFFFFF', 3), opacity: 0.5 });
  // snow at the brim
  out += path(`M${n(cx - hw - 10)} ${n(baseY + 2)}Q${n(cx - hw - 6)} ${n(baseY - 12)} ${n(cx - hw * 0.4)} ${n(baseY - 10)}Q${n(cx)} ${n(baseY - 16)} ${n(cx + hw * 0.4)} ${n(baseY - 10)}Q${n(cx + hw + 6)} ${n(baseY - 12)} ${n(cx + hw + 10)} ${n(baseY + 2)}Q${n(cx + hw * 0.5)} ${n(baseY + 9)} ${n(cx)} ${n(baseY + 4)}Q${n(cx - hw * 0.5)} ${n(baseY + 9)} ${n(cx - hw - 10)} ${n(baseY + 2)}Z`, '#FFFFFF', stroke(F.snowLine, 2.6));
  out += circle(cx, tipY, 4, P.gold, stroke(P.goldDeep, 2));
  return out;
}

/** Tower body with a snowy, crenellated top. */
export function tower(x0: number, x1: number, top: number, base: number, fill = url('fkWall'), line: string = F.wallLine): string {
  return rect(x0, top, x1 - x0, base - top, 4, fill, stroke(line, 3.5)) + path(`M${n(x0 + 6)} ${n(top + 10)}V${n(base - 6)}`, 'none', { ...stroke('#FFFFFF', 4), opacity: 0.6 });
}

export interface CastleOpts {
  /** Light one extra window on the left or right tall tower (a level difference). */
  extraWindow?: 'left' | 'right' | false;
  flags?: [string, string, string];
  /** Draw the gate open and glowing. */
  gateGlow?: boolean;
}

/**
 * Frostlight Castle centred on x, standing on `base`. `s` = scale (1 ≈ 440 wide, 400 tall).
 * The optional extra window sits at local (±140, -112) on a tall tower, see castleExtraWindowAt().
 */
export function castle(x: number, base: number, s: number, o: CastleOpts = {}): string {
  const W = url('fkWall');
  const WD = url('fkWallDeep');
  const L = F.wallLine;
  const roofs = [url('fkRoof'), url('fkRoofPink')];
  const rl = [F.roofLine, F.roofPinkLine];
  const flags = o.flags ?? [P.pink, P.gold, P.mint];
  let a = '';
  // glow behind
  a += circle(0, -220, 260, url('fkGlowBlue'), { opacity: 0.7 });
  // back central spire
  a += tower(-40, 40, -300, -150, WD, L) + coneRoof(0, -300, 92, 110, roofs[0], rl[0], flags[1]);
  a += windowGlow(0, -250, 22, 30, 'round', { frame: L, sill: false });
  // side towers (tall)
  for (const sx of [-1, 1]) {
    const x0 = sx < 0 ? -170 : 110;
    a += tower(x0, x0 + 60, -230, 0, W, L) + coneRoof(x0 + 30, -230, 76, 96, roofs[sx < 0 ? 1 : 1], rl[1], sx < 0 ? flags[0] : flags[2]);
    a += windowGlow(x0 + 30, -190, 20, 30, 'arch', { frame: L, sill: false });
  }
  // outer turrets
  for (const sx of [-1, 1]) {
    const x0 = sx < 0 ? -218 : 170;
    a += tower(x0, x0 + 48, -150, 0, WD, L) + coneRoof(x0 + 24, -150, 60, 74, roofs[0], rl[0]);
    a += windowGlow(x0 + 24, -112, 16, 22, 'round', { frame: L, sill: false });
  }
  // main hall
  a += rect(-110, -170, 220, 170, 6, W, stroke(L, 4));
  // crenellations, each with its own little snow cap
  a += path('M-106 -168H106', 'none', { ...stroke('#FFFFFF', 6), opacity: 0.9 });
  for (let i = 0; i < 6; i++) {
    const mx = -110 + i * 38.8;
    a += rect(mx, -192, 26, 26, 4, W, stroke(L, 3.5));
    a += path(`M${n(mx - 4)} ${-190}Q${n(mx + 13)} ${-206} ${n(mx + 30)} ${-190}Q${n(mx + 22)} ${-185} ${n(mx + 13)} ${-188}Q${n(mx + 4)} ${-185} ${n(mx - 4)} ${-190}Z`, '#FFFFFF', stroke(F.snowLine, 2.4));
  }
  // hall windows
  a += windowGlow(-62, -112, 26, 38, 'arch', { frame: L });
  a += windowGlow(62, -112, 26, 38, 'arch', { frame: L });
  a += windowGlow(0, -138, 30, 30, 'heart', { frame: L, sill: false });
  // gate
  a += path('M-34 0V-56Q0 -96 34 -56V0Z', o.gateGlow === false ? '#9DB2E6' : url('fkWindow'), stroke(L, 4));
  a += path('M-34 0V-56Q0 -96 34 -56V0', 'none', stroke('#FFFFFF', 2));
  a += path('M0 -82V0M-17 -70V0M17 -70V0', 'none', { ...stroke('#E3B66A', 2.6), opacity: 0.8 });
  a += ellipse(0, -2, 60, 7, url('fkGlow'), { opacity: 0.9 });
  // hall icicles
  a += icicleRow(-96, 96, -166, [18, 12, 22, 10, 16, 24, 12, 18], 7);
  // ice-crystal decorations on wall corners
  a += sparkle(-118, -178, 10) + sparkle(118, -178, 10);
  if (o.extraWindow) a += windowGlow(o.extraWindow === 'left' ? -140 : 140, -112, 30, 44, 'arch', { frame: L, sill: false });
  return place(a, x, base, s);
}

/** Scene position of the castle's optional extra window. */
export const castleExtraWindowAt = (x: number, base: number, s: number, side: 'left' | 'right'): [number, number] => [x + (side === 'left' ? -140 : 140) * s, base - 112 * s];

/* ------------------------------------------------------------------ cosy things */

/** Mug of cocoa with marshmallows and steam; drawn around (x, y) = mug centre. */
export function mug(x: number, y: number, s: number, color: string, o: { marsh?: number; steam?: boolean; heart?: boolean } = {}): string {
  const ln = darken(color, 0.35);
  let a = '';
  if (o.steam !== false) a += path('M-6 -24C-12 -32 0 -36 -6 -46M8 -24C2 -32 14 -36 8 -46', 'none', { ...stroke('#FFFFFF', 4), opacity: 0.75 });
  a += path('M15 -8C30 -10 30 12 15 10', 'none', stroke(ln, 7)) + path('M15 -8C30 -10 30 12 15 10', 'none', stroke(color, 3));
  a += path('M-17 -18H17V12Q17 20 9 20H-9Q-17 20 -17 12Z', color, stroke(ln, 3.5));
  a += ellipse(0, -18, 17, 5, '#A86F5A', stroke(ln, 3));
  const m = o.marsh ?? 2;
  const spots: [number, number][] = [
    [-7, -20],
    [6, -21],
    [0, -17],
  ];
  spots.slice(0, m).forEach(([mx, my]) => (a += rect(mx - 5, my - 5, 10, 8, 3, '#FFF4FA', stroke('#E2B6CF', 1.6))));
  if (o.heart) a += path('M0 8C-9 2 -8 -6 0 -3C8 -6 9 2 0 8Z', '#FFFFFF', { opacity: 0.9 });
  a += ellipse(-10, -4, 3, 7, '#FFFFFF', { opacity: 0.55 });
  return place(a, x, y, s);
}

/** Wooden sled resting on the snow at (x, base). */
export function sled(x: number, base: number, s: number, color: string): string {
  const ln = darken(color, 0.32);
  const runner = '#E5A83A';
  let a = lshadow(0, 4, 84, 10, 0.22);
  a += path('M-74 -2H62Q86 -2 86 -24Q86 -36 76 -36', 'none', stroke(darken(runner, 0.25), 9)) + path('M-74 -2H62Q86 -2 86 -24Q86 -36 76 -36', 'none', stroke(runner, 4.5));
  a += path('M-50 -2V-16M0 -2V-16M44 -2V-16', 'none', stroke(darken(runner, 0.25), 6));
  a += rect(-82, -34, 148, 22, 10, color, stroke(ln, 4));
  a += path('M-60 -30V-16M-30 -30V-16M0 -30V-16M30 -30V-16', 'none', { ...stroke(ln, 2.4), opacity: 0.5 });
  a += path('M-74 -28H40', 'none', { ...stroke('#FFFFFF', 3), opacity: 0.55 });
  a += path('M-78 -24Q-100 -40 -96 -60', 'none', stroke(P.woodDeep, 3)) + circle(-96, -62, 3, P.woodDeep);
  return place(a, x, base, s);
}

/** Frost butterfly with independently coloured wings (great for symmetry differences). */
export function butterfly(x: number, y: number, s: number, o: { left: string; right: string; leftDots?: string; rightDots?: string; leftDotCount?: number; rightDotCount?: number; rot?: number }): string {
  const wing = (side: 1 | -1, color: string, dotsColor: string, dots: number): string => {
    const ln = darken(color, 0.32);
    const up = `M0 -4C${18 * side} -44 ${62 * side} -44 ${56 * side} -12C${52 * side} 4 ${20 * side} 6 0 2Z`;
    const lo = `M0 2C${22 * side} 4 ${48 * side} 14 ${40 * side} 38C${30 * side} 52 ${8 * side} 36 0 8Z`;
    const ds: [number, number, number][] = [
      [34, -22, 7],
      [18, -10, 5],
      [26, 22, 6],
      [46, -30, 4],
    ];
    return (
      path(up, color, stroke(ln, 3.5)) +
      path(lo, lighten(color, 0.25), stroke(ln, 3.5)) +
      ds
        .slice(0, dots)
        .map(([dx, dy, r]) => circle(dx * side, dy, r, dotsColor, stroke(ln, 1.8)))
        .join('') +
      path(`M${6 * side} -8C${20 * side} -30 ${40 * side} -34 ${48 * side} -22`, 'none', { ...stroke('#FFFFFF', 2.6), opacity: 0.6 })
    );
  };
  const a =
    wing(-1, o.left, o.leftDots ?? '#FFFFFF', o.leftDotCount ?? 3) +
    wing(1, o.right, o.rightDots ?? '#FFFFFF', o.rightDotCount ?? 3) +
    ellipse(0, 6, 5.5, 22, P.inkSoft, stroke(P.ink, 2)) +
    circle(0, -18, 7, P.inkSoft, stroke(P.ink, 2)) +
    path('M-2 -24Q-8 -38 -14 -40M2 -24Q8 -38 14 -40', 'none', stroke(P.ink, 2.2)) +
    circle(-14, -40, 3, P.gold) +
    circle(14, -40, 3, P.gold);
  return place(a, x, y, s, false, o.rot ?? 0);
}

/** Bunting (string of triangle flags) along a sagging line from (x0,y0) to (x1,y1). */
export function bunting(x0: number, y0: number, x1: number, y1: number, sag: number, colors: string[], size = 22): string {
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2 + sag;
  const pt = (t: number): [number, number] => {
    const u = 1 - t;
    return [u * u * x0 + 2 * u * t * mx + t * t * x1, u * u * y0 + 2 * u * t * my + t * t * y1];
  };
  let out = path(`M${n(x0)} ${n(y0)}Q${n(mx)} ${n(my)} ${n(x1)} ${n(y1)}`, 'none', stroke('#8E7BC9', 2.6));
  colors.forEach((c, i) => {
    const t = (i + 0.5) / colors.length;
    const [px, py] = pt(t);
    out += path(`M${n(px - size / 2)} ${n(py)}L${n(px + size / 2)} ${n(py)}L${n(px)} ${n(py + size * 1.15)}Z`, c, stroke(darken(c, 0.3), 2.6));
  });
  return out;
}

/** Points along the bunting string (to place things on it). */
export function buntingPoint(x0: number, y0: number, x1: number, y1: number, sag: number, t: number): [number, number] {
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2 + sag;
  const u = 1 - t;
  return [u * u * x0 + 2 * u * t * mx + t * t * x1, u * u * y0 + 2 * u * t * my + t * t * y1];
}

/** Snowy mountains band: peaks [x, peakY, halfWidth]. */
export function mountains(peaks: [number, number, number][], base: number, fill: string, capFill = '#FFFFFF', a: Attrs = {}): string {
  let out = '';
  for (const [x, py, hw] of peaks) {
    const d = `M${n(x - hw)} ${n(base)}Q${n(x - hw * 0.35)} ${n(py + (base - py) * 0.25)} ${n(x - 8)} ${n(py + 4)}Q${n(x)} ${n(py - 4)} ${n(x + 8)} ${n(py + 4)}Q${n(x + hw * 0.35)} ${n(py + (base - py) * 0.25)} ${n(x + hw)} ${n(base)}Z`;
    const ch = (base - py) * 0.32;
    const cap = `M${n(x - 8)} ${n(py + 4)}Q${n(x)} ${n(py - 4)} ${n(x + 8)} ${n(py + 4)}L${n(x + hw * 0.32)} ${n(py + ch)}Q${n(x + hw * 0.2)} ${n(py + ch + 10)} ${n(x + hw * 0.1)} ${n(py + ch - 2)}Q${n(x)} ${n(py + ch + 12)} ${n(x - hw * 0.12)} ${n(py + ch)}Q${n(x - hw * 0.22)} ${n(py + ch + 8)} ${n(x - hw * 0.32)} ${n(py + ch)}Z`;
    out += path(d, fill) + path(cap, capFill, { opacity: 0.9 });
  }
  return g(out, a);
}

/** Snow-dusted rock / boulder. */
export function rock(x: number, base: number, w: number, h: number, fill = '#C9C6EC'): string {
  const ln = darken(fill, 0.32);
  return g(
    lshadow(x, base, w * 0.6, 6) +
      path(`M${n(x - w / 2)} ${n(base)}Q${n(x - w / 2)} ${n(base - h)} ${n(x)} ${n(base - h)}Q${n(x + w / 2)} ${n(base - h)} ${n(x + w / 2)} ${n(base)}Z`, fill, stroke(ln, 3.5)) +
      path(`M${n(x - w * 0.42)} ${n(base - h * 0.55)}Q${n(x - w * 0.2)} ${n(base - h * 1.12)} ${n(x + w * 0.1)} ${n(base - h * 0.98)}Q${n(x + w * 0.4)} ${n(base - h * 0.9)} ${n(x + w * 0.36)} ${n(base - h * 0.6)}Q${n(x + w * 0.1)} ${n(base - h * 0.72)} ${n(x - w * 0.1)} ${n(base - h * 0.6)}Q${n(x - w * 0.3)} ${n(base - h * 0.48)} ${n(x - w * 0.42)} ${n(base - h * 0.55)}Z`, '#FFFFFF', stroke(F.snowLine, 2.4)),
  );
}

/** Snowdrop / crocus flower peeking through snow (a hint of spring). */
export function crocus(x: number, base: number, s: number, color = '#C9A6FF'): string {
  const ln = darken(color, 0.32);
  const a =
    path('M0 0Q-2 -22 0 -40', 'none', stroke('#5FB98C', 4)) +
    path('M0 -6Q-18 -20 -14 -40Q-4 -26 0 -12Z', '#8FD8A8', stroke('#4E9E77', 2.4)) +
    path('M0 -40C-14 -44 -14 -66 -6 -74C-2 -66 2 -66 6 -74C14 -66 14 -44 0 -40Z', color, stroke(ln, 3)) +
    path('M0 -42C-6 -50 -4 -62 0 -66', 'none', { ...stroke(lighten(color, 0.5), 2.4), opacity: 0.8 }) +
    path('M-14 2Q0 -8 14 2Z', '#FFFFFF', stroke(F.snowLine, 2.2));
  return place(a, x, base, s);
}

/** Wooden bench with a snow cushion on top, standing on (x, base). */
export function bench(x: number, base: number, s: number): string {
  const wd = darken(P.wood, 0.35);
  const a =
    lshadow(0, 2, 76, 8) +
    rect(-62, -36, 8, 36, 3, P.woodDeep, stroke(wd, 3)) +
    rect(54, -36, 8, 36, 3, P.woodDeep, stroke(wd, 3)) +
    rect(-70, -44, 140, 12, 5, url('fkWood'), stroke(wd, 3.5)) +
    rect(-66, -78, 132, 11, 5, url('fkWood'), stroke(wd, 3.5)) +
    rect(-66, -62, 132, 11, 5, url('fkWood'), stroke(wd, 3.5)) +
    rect(-60, -78, 7, 36, 3, P.woodDeep, stroke(wd, 3)) +
    rect(53, -78, 7, 36, 3, P.woodDeep, stroke(wd, 3)) +
    path('M-72 -44Q-70 -56 -50 -54Q-20 -60 10 -54Q40 -58 70 -52Q76 -46 70 -42Q0 -38 -72 -44Z', '#FFFFFF', stroke(F.snowLine, 2.6)) +
    path('M-68 -78Q-60 -88 -30 -84Q0 -90 30 -84Q60 -88 68 -78Q0 -74 -68 -78Z', '#FFFFFF', stroke(F.snowLine, 2.4));
  return place(a, x, base, s);
}

/** Simple wooden fence segment with snow caps, from x0 to x1 on `base`. */
export function fence(x0: number, x1: number, base: number, h = 52, posts = 4): string {
  const wd = darken(P.wood, 0.35);
  let out = rect(x0, base - h * 0.72, x1 - x0, 9, 4, url('fkWood'), stroke(wd, 3)) + rect(x0, base - h * 0.38, x1 - x0, 9, 4, url('fkWood'), stroke(wd, 3));
  for (let i = 0; i < posts; i++) {
    const px = x0 + 8 + ((x1 - x0 - 16) * i) / Math.max(1, posts - 1);
    out += rect(px - 7, base - h, 14, h, 5, url('fkWood'), stroke(wd, 3)) + path(`M${n(px - 10)} ${n(base - h + 4)}Q${n(px)} ${n(base - h - 12)} ${n(px + 10)} ${n(base - h + 4)}Z`, '#FFFFFF', stroke(F.snowLine, 2.2));
  }
  return out;
}

/** Gift box (festival). */
export function gift(x: number, base: number, w: number, h: number, color: string, ribbon: string): string {
  const ln = darken(color, 0.32);
  const rl = darken(ribbon, 0.3);
  return g(
    lshadow(x, base, w * 0.6, 5) +
      rect(x - w / 2, base - h, w, h, 5, color, stroke(ln, 3.5)) +
      rect(x - w / 2 - 3, base - h - 8, w + 6, 12, 4, lighten(color, 0.2), stroke(ln, 3.2)) +
      rect(x - 5, base - h - 8, 10, h + 8, 2, ribbon, stroke(rl, 2)) +
      path(`M${n(x)} ${n(base - h - 8)}C${n(x - 18)} ${n(base - h - 24)} ${n(x - 20)} ${n(base - h - 6)} ${n(x)} ${n(base - h - 8)}C${n(x + 18)} ${n(base - h - 24)} ${n(x + 20)} ${n(base - h - 6)} ${n(x)} ${n(base - h - 8)}Z`, ribbon, stroke(rl, 2.6)),
  );
}

/** Mushroom with a snowy cap (crystal forest). */
export function mushroom(x: number, base: number, s: number, cap = '#FFB3CF'): string {
  const cl = darken(cap, 0.32);
  const a =
    lshadow(0, 0, 26, 5) +
    path('M-9 0Q-11 -18 -7 -26H7Q11 -18 9 0Z', '#FFF4EC', stroke('#C9A592', 3)) +
    path('M-30 -22Q-30 -52 0 -54Q30 -52 30 -22Q0 -16 -30 -22Z', cap, stroke(cl, 3.5)) +
    path('M-26 -36Q-16 -52 4 -52Q20 -50 26 -38Q12 -44 0 -44Q-14 -44 -26 -36Z', '#FFFFFF', stroke(F.snowLine, 2)) +
    circle(-14, -30, 3.5, '#FFFFFF', { opacity: 0.9 }) +
    circle(12, -28, 3, '#FFFFFF', { opacity: 0.9 });
  return place(a, x, base, s);
}

/** Glowing stars scattered in a box (identical in both pictures). */
export function skyStars(seed: number, count: number, box: { x: number; y: number; w: number; h: number }): string {
  const r = rng(seed);
  return scatter(seed, count, box, 34)
    .map(([x, y]) => {
      const k = r();
      return k > 0.72 ? sparkle(x, y, 6 + r() * 5, '#FFF8D8') : circle(x, y, 1.4 + r() * 1.8, '#FFFDF0', { opacity: n(0.6 + r() * 0.4) });
    })
    .join('');
}
