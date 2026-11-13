/**
 * Brand art: the "Little Wonder" wordmark, the app icon (+ maskable variant and favicon) and the
 * title-screen backdrop.
 *
 * Gradient/clip ids are made unique on every call (`lw-<name>-<n>`), so several copies — even
 * hidden ones — can live in one document without `url(#id)` collisions. The pictures themselves
 * are fully deterministic.
 */
import { P, circle, cloud, ellipse, g, heart, mix, n, path, rainbow, rng, sparkle, star, stroke } from '../art/kit.ts';
import { getBuddy } from './buddies.ts';

/* ------------------------------------------------------------------ helpers */

let seq = 0;
function ids<K extends string>(...names: K[]): Record<K, string> {
  seq += 1;
  const tag = seq.toString(36);
  const out = {} as Record<K, string>;
  for (const nm of names) out[nm] = `lw-${nm}-${tag}`;
  return out;
}

type Stop = [offset: number, color: string, opacity?: number];
const stopsOf = (s: Stop[]): string =>
  s.map(([o, c, op]) => `<stop offset="${n(o)}" stop-color="${c}"${op === undefined ? '' : ` stop-opacity="${n(op)}"`}/>`).join('');

/** Linear gradient in user space (absolute coordinates). */
const lin = (id: string, x1: number, y1: number, x2: number, y2: number, s: Stop[]): string =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}">${stopsOf(s)}</linearGradient>`;
/** Radial gradient in user space. */
const rad = (id: string, cx: number, cy: number, r: number, s: Stop[]): string =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}">${stopsOf(s)}</radialGradient>`;
const u = (id: string): string => `url(#${id})`;

function starD(x: number, y: number, r: number, inner = 0.5, rot = 0, pts = 5): string {
  let d = '';
  for (let i = 0; i < pts * 2; i++) {
    const rr = i % 2 === 0 ? r : r * inner;
    const a = ((rot - 90) * Math.PI) / 180 + (i * Math.PI) / pts;
    d += `${i === 0 ? 'M' : 'L'}${n(x + Math.cos(a) * rr)} ${n(y + Math.sin(a) * rr)}`;
  }
  return d + 'Z';
}

/** Gold sparkle with a white rim — reads on any background. */
const glint = (x: number, y: number, s: number, fill = '#FFD45C', rim = '#FFFFFF'): string =>
  g(sparkle(x, y, s, fill), { stroke: rim, 'stroke-width': n(Math.max(2, s * 0.28)), 'stroke-linejoin': 'round', 'paint-order': 'stroke' });

/* ------------------------------------------------------------------ logo */

const FONT = `font-family="Fredoka, 'Baloo 2', Nunito, 'Arial Rounded MT Bold', system-ui, sans-serif"`;
const OUTER = '#7B58CF'; // sticker border (soft violet, never black)
const SHADOW = '#5A3F9E';

function word(x: number, y: number, size: number, weight: number, text: string, extra: string): string {
  return `<text x="${x}" y="${y}" text-anchor="middle" ${FONT} font-size="${size}" font-weight="${weight}" ${extra}>${text}</text>`;
}

/** Text as a layered sticker: soft offset shadow, violet border, white rim, gradient fill, top gloss. */
function stickerWord(x: number, y: number, size: number, weight: number, text: string, fill: string, gloss: string, outerW: number, rimW: number, drop: number): string {
  const join = 'stroke-linejoin="round"';
  return (
    word(x + drop * 0.25, y + drop, size, weight, text, `fill="${SHADOW}" stroke="${SHADOW}" stroke-width="${outerW}" ${join} opacity="0.22"`) +
    word(x, y, size, weight, text, `fill="${OUTER}" stroke="${OUTER}" stroke-width="${outerW}" ${join}`) +
    word(x, y, size, weight, text, `fill="#fff" stroke="#fff" stroke-width="${rimW}" ${join}`) +
    word(x, y, size, weight, text, `fill="${fill}"`) +
    word(x, y, size, weight, text, `fill="${gloss}"`)
  );
}

/** A small shape given the same sticker treatment as the letters. */
function stickerShape(d: string, fill: string, outerW: number, rimW: number, drop: number): string {
  const j = { 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  return (
    path(d, SHADOW, { stroke: SHADOW, 'stroke-width': outerW, ...j, opacity: 0.22, transform: `translate(${n(drop * 0.25)} ${drop})` }) +
    path(d, OUTER, { stroke: OUTER, 'stroke-width': outerW, ...j }) +
    path(d, '#fff', { stroke: '#fff', 'stroke-width': rimW, ...j }) +
    path(d, fill, j)
  );
}

/**
 * "Little Wonder" wordmark — SVG markup for viewBox 0 0 600 260. Inline SVG, uses the page font
 * "Fredoka". The dot of the i is a golden star; a tiny magnifier hints at the game.
 */
export function logo(): string {
  const id = ids('w', 'l', 'gw', 'gl', 'star', 'lens', 'ring');
  // Fredoka metrics (em): "Lıttle" @600 is 2.33 wide, the dotless ı is centred at 0.675.
  const ls = 64;
  const ly = 106;
  const lx0 = 300 - (2.33 * ls) / 2;
  const iX = lx0 + 0.675 * ls;
  const iY = ly - 0.74 * ls;

  const defsMarkup =
    `<defs>` +
    lin(id.w, 76, 0, 524, 0, [
      [0, '#FF6FA8'],
      [0.19, '#FF8E7A'],
      [0.37, '#FFBD3A'],
      [0.5, '#93D65C'],
      [0.62, '#3FCB95'],
      [0.8, '#42A8F0'],
      [1, '#9474F2'],
    ]) +
    lin(id.l, 0, 52, 0, 108, [
      [0, '#B497FF'],
      [1, '#8A62EA'],
    ]) +
    lin(id.gw, 0, 132, 0, 228, [
      [0, '#fff', 0.6],
      [0.42, '#fff', 0.12],
      [0.43, '#fff', 0],
      [1, '#fff', 0],
    ]) +
    lin(id.gl, 0, 56, 0, 108, [
      [0, '#fff', 0.45],
      [0.45, '#fff', 0.08],
      [0.46, '#fff', 0],
      [1, '#fff', 0],
    ]) +
    lin(id.star, 0, iY - 14, 0, iY + 14, [
      [0, '#FFE58A'],
      [1, '#FFB938'],
    ]) +
    rad(id.lens, 420, 70, 22, [
      [0, '#FFFFFF'],
      [1, '#D7EEFF'],
    ]) +
    lin(id.ring, 0, 50, 0, 100, [
      [0, '#FFA9CF'],
      [1, '#F57AB2'],
    ]) +
    `</defs>`;

  // tiny magnifier to the right of "Little"
  const mx = 424;
  const my = 70;
  const handle = `M${mx + 13} ${my + 13}L${mx + 27} ${my + 27}`;
  const magnifier =
    path(`M${mx} ${my}m-17 0a17 17 0 1 0 34 0a17 17 0 1 0 -34 0`, 'none', { stroke: SHADOW, 'stroke-width': 22, opacity: 0.22, transform: 'translate(1.5 6)' }) +
    path(handle, 'none', { stroke: SHADOW, 'stroke-width': 26, 'stroke-linecap': 'round', opacity: 0.22, transform: 'translate(1.5 6)' }) +
    path(handle, 'none', { stroke: OUTER, 'stroke-width': 26, 'stroke-linecap': 'round' }) +
    circle(mx, my, 28, OUTER) +
    path(handle, 'none', { stroke: '#fff', 'stroke-width': 18, 'stroke-linecap': 'round' }) +
    circle(mx, my, 24, '#fff') +
    path(handle, 'none', { stroke: '#A47CF2', 'stroke-width': 10, 'stroke-linecap': 'round' }) +
    circle(mx, my, 17, u(id.lens), { stroke: u(id.ring), 'stroke-width': 7 }) +
    sparkle(mx + 1, my + 1, 8, '#FFC94D') +
    path(`M${mx - 10} ${my - 3}a11 11 0 0 1 7 -7`, 'none', { ...stroke('#fff', 3.2) });

  const starDot = stickerShape(starD(iX + 1, iY, 13.5, 0.52, -8), u(id.star), 13, 7, 5) + path(`M${n(iX - 4)} ${n(iY - 6)}l2.5 -3`, 'none', { ...stroke('#fff', 2.6), opacity: 0.9 });

  return (
    defsMarkup +
    // sparkles behind the letters
    glint(126, 74, 15) +
    glint(160, 40, 8, '#FFB3D1') +
    glint(492, 30, 9, '#A9D8FF') +
    glint(548, 132, 10) +
    glint(52, 150, 8, '#C9B4FF') +
    heart(506, 96, 7, '#FF8DB8', { stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' }) +
    magnifier +
    stickerWord(300, 226, 128, 700, 'Wonder', u(id.w), u(id.gw), 19, 10, 9) +
    stickerWord(300, ly, ls, 600, 'Lıttle', u(id.l), u(id.gl), 16, 8, 6) +
    starDot
  );
}

/* ------------------------------------------------------------------ app icon */

function iconBackground(id: { bg: string; glow: string }): string {
  return (
    `<defs>` +
    lin(id.bg, 0, 0, 0, 512, [
      [0, '#BDE2FF'],
      [0.5, '#E4D6FF'],
      [1, '#FFD3EA'],
    ]) +
    rad(id.glow, 236, 230, 270, [
      [0, '#FFFFFF', 0.85],
      [0.55, '#FFFFFF', 0.35],
      [1, '#FFFFFF', 0],
    ]) +
    `</defs>` +
    `<rect width="512" height="512" fill="${u(id.bg)}"/>` +
    `<rect width="512" height="512" fill="${u(id.glow)}"/>`
  );
}

function iconArt(id: { lens: string; glass: string; ring: string; handle: string }): string {
  const cx = 236;
  const cy = 230;
  const R = 112;
  const hs: [number, number] = [cx + R * 0.74, cy + R * 0.74];
  const he: [number, number] = [404, 398];
  const handle = `M${n(hs[0])} ${n(hs[1])}L${he[0]} ${he[1]}`;
  const puff = getBuddy('puff').draw('happy');
  return (
    `<defs>` +
    `<clipPath id="${id.lens}"><circle cx="${cx}" cy="${cy}" r="${R - 2}"/></clipPath>` +
    rad(id.glass, cx - 30, cy - 40, R * 1.2, [
      [0, '#FFFFFF'],
      [1, '#DDF0FF'],
    ]) +
    lin(id.ring, 0, cy - R, 0, cy + R, [
      [0, '#FFB3D4'],
      [1, '#F27AB2'],
    ]) +
    lin(id.handle, 300, 300, 420, 420, [
      [0, '#C3A6FF'],
      [1, '#9470EE'],
    ]) +
    `</defs>` +
    rainbow(256, 420, 236, 19, P.rainbow, 0.95) +
    cloud(92, 412, 1.05) +
    cloud(430, 424, 1.15) +
    // soft drop shadow of the magnifier
    path(handle, 'none', { stroke: '#5A3F9E', 'stroke-width': 62, 'stroke-linecap': 'round', opacity: 0.16, transform: 'translate(6 12)' }) +
    circle(cx + 6, cy + 12, R + 26, '#5A3F9E', { opacity: 0.16 }) +
    // handle
    path(handle, 'none', { stroke: OUTER, 'stroke-width': 62, 'stroke-linecap': 'round' }) +
    path(handle, 'none', { stroke: u(id.handle), 'stroke-width': 46, 'stroke-linecap': 'round' }) +
    path(`M${n(hs[0] + 18)} ${n(hs[1] + 4)}L${he[0] - 8} ${he[1] - 22}`, 'none', { stroke: '#fff', 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0.55 }) +
    // ring + glass
    circle(cx, cy, R + 24, OUTER) +
    circle(cx, cy, R + 8, u(id.ring)) +
    circle(cx, cy, R, u(id.glass)) +
    g(g(puff, { transform: `translate(${cx - 130} ${cy - 112}) scale(1.3)` }), { 'clip-path': u(id.lens) }) +
    // glass shine
    path(`M${cx - 78} ${cy - 30}A82 82 0 0 1 ${cx - 30} ${cy - 78}`, 'none', { stroke: '#fff', 'stroke-width': 14, 'stroke-linecap': 'round', opacity: 0.75 }) +
    circle(cx - 84, cy - 2, 7, '#fff', { opacity: 0.75 }) +
    path(`M${cx - 70} ${cy - R - 12}A${R + 12} ${R + 12} 0 0 1 ${cx + 30} ${cy - R - 8}`, 'none', { stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.6 }) +
    // sparkles
    glint(408, 112, 30) +
    glint(446, 196, 13, '#FFB3D1') +
    glint(88, 118, 16, '#A9D8FF') +
    glint(110, 300, 10, '#FFFFFF', '#C9B4FF')
  );
}

/** App icon art, viewBox 0 0 512 512, full-bleed (no transparency at the edges). */
export function appIcon(): string {
  const id = ids('bg', 'glow', 'lens', 'glass', 'ring', 'handle');
  return iconBackground(id) + iconArt(id);
}

/** Maskable variant: same full-bleed background, artwork shrunk into the 80% safe circle. */
export function appIconMaskable(): string {
  const id = ids('bg', 'glow', 'lens', 'glass', 'ring', 'handle');
  return iconBackground(id) + g(iconArt(id), { transform: 'translate(256 256) scale(0.78) translate(-252 -262)' });
}

/** Simplified favicon (complete standalone SVG document): a magnifier with a golden star. */
export function faviconSvg(): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A88AF2"/><stop offset="1" stop-color="#F27FB6"/></linearGradient></defs>` +
    `<rect width="64" height="64" rx="16" fill="url(#b)"/>` +
    `<path d="M38 38L51 51" stroke="#fff" stroke-width="10" stroke-linecap="round"/>` +
    `<circle cx="27" cy="27" r="15.5" fill="#EAF6FF" stroke="#fff" stroke-width="6"/>` +
    `<path d="${starD(27, 28, 10, 0.5)}" fill="#FFC93F" stroke="#FFC93F" stroke-width="2.5" stroke-linejoin="round"/>` +
    `</svg>`
  );
}

/* ------------------------------------------------------------------ title art */

/** Distant Rainbow Valley: rainbow-striped hills and a rainbow. */
function rainbowValley(): string {
  const hill = (cx: number, base: number, w: number, h: number, fill: string, bands: string[]): string => {
    const d = `M${cx - w} ${base}C${cx - w * 0.55} ${base - h * 1.32} ${cx + w * 0.55} ${base - h * 1.32} ${cx + w} ${base}Z`;
    let out = path(d, fill);
    bands.forEach((c, i) => {
      const k = 0.82 - i * 0.2;
      const hh = h * k;
      out += path(`M${cx - w * 0.92} ${base}C${n(cx - w * 0.5)} ${n(base - hh * 1.32)} ${n(cx + w * 0.5)} ${n(base - hh * 1.32)} ${cx + w * 0.92} ${base}`, 'none', { stroke: c, 'stroke-width': 9, 'stroke-linecap': 'round' });
    });
    return out;
  };
  const tree = (x: number, y: number, s: number, c: string): string =>
    path(`M${x} ${y}v${-16 * s}`, 'none', { stroke: '#D9B796', 'stroke-width': 4 * s, 'stroke-linecap': 'round' }) + circle(x, y - 22 * s, 11 * s, c);
  return (
    rainbow(250, 640, 190, 15, P.rainbow, 0.8) +
    hill(110, 680, 190, 92, '#C9EFC6', ['#E3F8D9', '#FFE6F0']) +
    hill(430, 690, 170, 78, '#FFE3EE', ['#FFF2C9', '#E4F6FF']) +
    hill(270, 700, 200, 70, '#FFF0C4', ['#D8F2CE', '#FFDDE9']) +
    tree(190, 642, 1, '#AEE6B0') +
    tree(214, 650, 0.8, '#FFC7DC') +
    tree(470, 628, 0.9, '#C8B6FF') +
    tree(60, 618, 0.8, '#FFE08F')
  );
}

/** Floating eighth note. */
const note = (x: number, y: number, s: number, c: string, rot = 0): string =>
  g(
    path('M0 0V-18L9 -21V-10', 'none', { stroke: c, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }) +
      ellipse(-3, 0, 4.6, 3.6, c, { transform: 'rotate(-20 -3 0)' }) +
      ellipse(6, -10, 4.6, 3.6, c, { transform: 'rotate(-20 6 -10)' }),
    { transform: `translate(${n(x)} ${n(y)}) rotate(${rot}) scale(${n(s)})` },
  );

/** Distant Monster Pop Academy: a little starry pop stage with spotlights and a tiny singer. */
function popStage(beam: string): string {
  const x = 700;
  const base = 640;
  const bulbs = Array.from({ length: 11 }, (_, i) => {
    const a = Math.PI + (i / 10) * Math.PI;
    return circle(x + Math.cos(a) * 64, base - 54 + Math.sin(a) * 60, 4.2, ['#FFE48A', '#FFB3D1', '#B9E4FF'][i % 3]);
  }).join('');
  const singer =
    path(`M${x - 9} ${base - 26}l-3 -9 8 5zM${x + 9} ${base - 26}l3 -9 -8 5z`, '#C9B2FF', { stroke: '#C9B2FF', 'stroke-width': 2, 'stroke-linejoin': 'round' }) +
    circle(x, base - 16, 14, '#A9EBC6') +
    circle(x - 5, base - 19, 2.2, '#5C4A8A') +
    circle(x + 5, base - 19, 2.2, '#5C4A8A') +
    ellipse(x, base - 11, 3, 3.6, '#5C4A8A') +
    ellipse(x - 17, base - 18, 3.5, 5, '#A9EBC6', { transform: `rotate(-30 ${x - 17} ${base - 18})` }) +
    ellipse(x + 17, base - 22, 3.5, 5, '#A9EBC6', { transform: `rotate(30 ${x + 17} ${base - 22})` });
  return (
    path(`M${x - 20} ${base - 60}L${x - 190} ${base - 360}L${x - 120} ${base - 372}Z`, beam) +
    path(`M${x + 20} ${base - 60}L${x + 190} ${base - 360}L${x + 120} ${base - 372}Z`, beam) +
    path(`M${x - 76} ${base}V${base - 54}A76 72 0 0 1 ${x + 76} ${base - 54}V${base}Z`, '#CDB8FF') +
    path(`M${x - 52} ${base}V${base - 52}A52 50 0 0 1 ${x + 52} ${base - 52}V${base}Z`, '#FFF0F7') +
    path(`M${x - 52} ${base}V${base - 52}Q${x - 50} ${base - 80} ${x - 30} ${base - 96}Q${x - 36} ${base - 44} ${x - 22} ${base}Z`, '#FFB0D2') +
    path(`M${x + 52} ${base}V${base - 52}Q${x + 50} ${base - 80} ${x + 30} ${base - 96}Q${x + 36} ${base - 44} ${x + 22} ${base}Z`, '#FFB0D2') +
    path(`M${x - 40} ${base - 6}Q${x - 38} ${base - 50} ${x - 32} ${base - 80}M${x + 40} ${base - 6}Q${x + 38} ${base - 50} ${x + 32} ${base - 80}`, 'none', { stroke: '#FF97C3', 'stroke-width': 3, 'stroke-linecap': 'round' }) +
    ellipse(x, base - 2, 30, 6, '#FFFFFF', { opacity: 0.8 }) +
    singer +
    bulbs +
    path(`M${x - 94} ${base}h188v18h-188z`, '#E7DCFF') +
    path(`M${x - 70} ${base + 4}v10M${x - 35} ${base + 4}v10M${x} ${base + 4}v10M${x + 35} ${base + 4}v10M${x + 70} ${base + 4}v10`, 'none', { stroke: '#D5C6FF', 'stroke-width': 8, 'stroke-linecap': 'round' }) +
    star(x, base - 142, 21, '#FFE07A', { width: 5 }) +
    star(x - 50, base - 120, 9, '#FFC4DD', { width: 3 }) +
    star(x + 54, base - 124, 10, '#B9E4FF', { width: 3 }) +
    star(x + 22, base - 180, 6, '#FFE07A', { width: 2.5 }) +
    star(x - 28, base - 186, 5, '#D7C6FF', { width: 2.5 }) +
    note(x - 104, base - 92, 1, '#C3A8FF', -12) +
    note(x + 108, base - 70, 0.85, '#FF9EC6', 10) +
    note(x - 80, base - 168, 0.7, '#8FCBF5', -6)
  );
}

/** Distant Frostlight Kingdom: an ice castle on a snowy hill. */
function iceCastle(): string {
  const x = 1000;
  const base = 628;
  const tower = (tx: number, top: number, w: number, roof: string): string =>
    path(`M${tx - w / 2} ${base}V${top}H${tx + w / 2}V${base}Z`, '#E6F4FF') +
    path(`M${tx + w / 6} ${base}V${top}H${tx + w / 2}V${base}Z`, '#D2E8FA') +
    path(`M${tx - w / 2 - 6} ${top + 2}L${tx} ${top - w * 1.35}L${tx + w / 2 + 6} ${top + 2}Z`, roof, { 'stroke-linejoin': 'round', stroke: roof, 'stroke-width': 4 }) +
    path(`M${tx - 5} ${top + 30}v-6a5 5 0 0 1 10 0v6z`, '#A9D0F2') +
    star(tx, top - w * 1.35 - 6, 5, '#FFF3B0', { width: 2 });
  return (
    ellipse(x, base + 30, 190, 52, '#F4FAFF') +
    tower(x - 88, 560, 30, '#BFD9F7') +
    tower(x + 92, 566, 30, '#BFD9F7') +
    path(`M${x - 74} ${base}V${582}H${x + 74}V${base}Z`, '#EAF6FF') +
    tower(x - 46, 528, 38, '#D3C3FF') +
    tower(x + 48, 534, 38, '#D3C3FF') +
    tower(x, 488, 48, '#C2B0FF') +
    path(`M${x - 14} ${base}v-26a14 14 0 0 1 28 0v26z`, '#BFDDF6') +
    ellipse(x, base + 6, 120, 14, '#FFFFFF') +
    sparkle(x - 120, 520, 9, '#FFFFFF') +
    sparkle(x + 128, 498, 12, '#FFFFFF') +
    sparkle(x + 30, 430, 7, '#FFFFFF')
  );
}

/** Title screen backdrop, viewBox 0 0 1200 800, cropped to fill the screen. */
export function titleArt(): string {
  const id = ids('sky', 'glow', 'haze', 'beam');
  const r = rng(20241113);

  // twinkles: sparse in the calm centre, a little denser towards the edges
  let twinkles = '';
  for (let i = 0; i < 70; i++) {
    const x = r() * 1200;
    const y = 20 + r() * 520;
    const centre = Math.abs(x - 600) < 300 && y > 120 && y < 520;
    if (centre && r() < 0.75) continue;
    const s = 3 + r() * (centre ? 4 : 9);
    const col = ['#FFFFFF', '#FFFFFF', '#FFE9A8', '#FFD3E6', '#D9CCFF'][Math.floor(r() * 5)];
    twinkles += r() < 0.55 ? sparkle(x, y, s, col, 0.55 + r() * 0.4) : circle(x, y, s * 0.35, col, { opacity: 0.6 });
  }

  const bank =
    [
      [40, 770, 90],
      [170, 790, 80],
      [300, 770, 95],
      [450, 800, 90],
      [600, 780, 100],
      [760, 800, 92],
      [900, 772, 96],
      [1040, 790, 84],
      [1170, 768, 92],
    ] as const;

  const bankBack = bank.map(([x, y, rr]) => circle(x + 40, y - 34, rr * 0.9, '#F6E6FA')).join('');
  const bankShade = bank.map(([x, y, rr]) => circle(x, y, rr, '#E9E1FF')).join('');
  const bankFront = bank.map(([x, y, rr]) => circle(x - 7, y - 9, rr - 8, '#FFFFFF')).join('');
  const bankLow = [60, 260, 470, 690, 900, 1110].map((x, i) => circle(x, 850, 110 + (i % 2) * 18, '#FFFFFF')).join('');

  return (
    `<defs>` +
    lin(id.sky, 0, 0, 0, 800, [
      [0, '#B9DDFF'],
      [0.38, '#DCE4FF'],
      [0.7, '#FDE3F2'],
      [1, '#FFEFE6'],
    ]) +
    rad(id.glow, 600, 330, 560, [
      [0, '#FFFFFF', 0.85],
      [0.45, '#FFFFFF', 0.4],
      [1, '#FFFFFF', 0],
    ]) +
    lin(id.beam, 0, 280, 0, 580, [
      [0, '#FFFFFF', 0],
      [1, '#FFFFFF', 0.55],
    ]) +
    lin(id.haze, 0, 440, 0, 700, [
      [0, '#FFF6FB', 0],
      [1, '#FFF6FB', 0.55],
    ]) +
    `</defs>` +
    `<rect width="1200" height="800" fill="${u(id.sky)}"/>` +
    // a very faint giant rainbow halo high behind the logo
    rainbow(600, 900, 820, 22, P.rainbow, 0.12) +
    `<rect width="1200" height="800" fill="${u(id.glow)}"/>` +
    twinkles +
    // sky clouds (kept to the sides)
    cloud(120, 150, 1.25, { opacity: 0.95 }) +
    cloud(310, 70, 0.6, { opacity: 0.7 }) +
    cloud(1080, 120, 1.45, { opacity: 0.95 }) +
    cloud(905, 250, 0.7, { opacity: 0.75 }) +
    cloud(60, 380, 0.85, { opacity: 0.8 }) +
    cloud(1150, 390, 0.9, { opacity: 0.8 }) +
    // distant worlds, softened by the haze
    g(rainbowValley() + popStage(u(id.beam)) + iceCastle(), { opacity: 0.9 }) +
    `<rect y="440" width="1200" height="360" fill="${u(id.haze)}"/>` +
    // dreamy cloud sea in front
    g(bankBack) +
    g(bankShade) +
    g(bankFront) +
    g(bankLow) +
    ellipse(240, 720, 60, 14, '#fff', { opacity: 0.9 }) +
    // a few brighter sparkles near the corners
    glint(70, 60, 14) +
    glint(1130, 300, 11, '#FFC4DD') +
    glint(190, 520, 9, '#C9E6FF') +
    glint(1000, 380, 8) +
    heart(1110, 560, 9, mix('#FF9DBB', '#ffffff', 0.25), { opacity: 0.85 }) +
    heart(80, 560, 7, mix('#C6B3FF', '#ffffff', 0.2), { opacity: 0.85 })
  );
}
