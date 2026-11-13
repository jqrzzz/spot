/**
 * UI icon set: chunky, rounded, friendly. Each icon is full <svg> markup, viewBox 0 0 48 48,
 * drawn with currentColor (stroke 4.5, round caps and joins, a few filled accents) so CSS can
 * tint it. Shapes are chosen so a six-year-old recognises them instantly: a house for home, a
 * big arrow for back, a triangle for play, an open sticker book for stickers, a gear for the
 * grown-ups corner, a magnifier with a minus for zoom out.
 */
export type IconName =
  | 'home'
  | 'back'
  | 'play'
  | 'next'
  | 'replay'
  | 'map'
  | 'book'
  | 'gear'
  | 'zoom-out'
  | 'sound'
  | 'sound-off'
  | 'music'
  | 'music-off'
  | 'voice'
  | 'voice-off'
  | 'lock'
  | 'check'
  | 'plus'
  | 'close'
  | 'pencil'
  | 'star'
  | 'sparkle';

/** Every icon name, in a sensible display order (handy for previews and tests). */
export const ICON_NAMES: IconName[] = [
  'home',
  'back',
  'play',
  'next',
  'replay',
  'map',
  'book',
  'gear',
  'zoom-out',
  'sound',
  'sound-off',
  'music',
  'music-off',
  'voice',
  'voice-off',
  'lock',
  'check',
  'plus',
  'close',
  'pencil',
  'star',
  'sparkle',
];

const r2 = (v: number): number => Math.round(v * 100) / 100;

/** Stroked outline. */
const S = 'fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"';
/** Filled shape with softly rounded corners. */
const F = (w = 3) => `fill="currentColor" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

function starPath(cx: number, cy: number, r: number, inner: number, pts = 5, rot = 0): string {
  let d = '';
  for (let i = 0; i < pts * 2; i++) {
    const rr = i % 2 === 0 ? r : r * inner;
    const a = ((rot - 90) * Math.PI) / 180 + (i * Math.PI) / pts;
    d += `${i === 0 ? 'M' : 'L'}${r2(cx + Math.cos(a) * rr)} ${r2(cy + Math.sin(a) * rr)}`;
  }
  return d + 'Z';
}

function gearPath(cx: number, cy: number, teeth: number, rOut: number, rIn: number): string {
  const step = 360 / teeth;
  const tip = step * 0.17;
  const root = step * 0.3;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = i * step - 90;
    const pts: Array<[number, number]> = [
      [a - root, rIn],
      [a - tip, rOut],
      [a + tip, rOut],
      [a + root, rIn],
    ];
    for (const [deg, rr] of pts) {
      const rad = (deg * Math.PI) / 180;
      d += `${d ? 'L' : 'M'}${r2(cx + Math.cos(rad) * rr)} ${r2(cy + Math.sin(rad) * rr)}`;
    }
  }
  return d + 'Z';
}

/** Four-point twinkle. */
function twinkle(x: number, y: number, s: number): string {
  const k = s * 0.22;
  return `M${x} ${y - s}Q${r2(x + k)} ${r2(y - k)} ${x + s} ${y}Q${r2(x + k)} ${r2(y + k)} ${x} ${y + s}Q${r2(x - k)} ${r2(y + k)} ${x - s} ${y}Q${r2(x - k)} ${r2(y - k)} ${x} ${y - s}Z`;
}

function heartPath(x: number, y: number, s: number): string {
  return (
    `M${x} ${r2(y + s * 0.85)}` +
    `C${r2(x - s * 1.25)} ${r2(y + s * 0.05)} ${r2(x - s * 0.95)} ${r2(y - s * 0.95)} ${x} ${r2(y - s * 0.38)}` +
    `C${r2(x + s * 0.95)} ${r2(y - s * 0.95)} ${r2(x + s * 1.25)} ${r2(y + s * 0.05)} ${x} ${r2(y + s * 0.85)}Z`
  );
}

const SPEAKER = `<path d="M7.5 20.5a2.5 2.5 0 0 1 2.5-2.5h5.5L24 10.5v27L15.5 30H10a2.5 2.5 0 0 1-2.5-2.5z" ${F(3.5)}/>`;
const NOTES =
  `<path d="M17.5 34.5V13.5L37 9v21" ${S}/>` +
  `<ellipse cx="12.5" cy="35" rx="6" ry="4.8" transform="rotate(-18 12.5 35)" ${F(2.5)}/>` +
  `<ellipse cx="32" cy="30.5" rx="6" ry="4.8" transform="rotate(-18 32 30.5)" ${F(2.5)}/>`;
const BUBBLE = `<path d="M11 8.5h26a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5H24l-9 7.5v-7.5h-4a5 5 0 0 1-5-5v-14a5 5 0 0 1 5-5z" ${S}/>`;
const DOTS = `<circle cx="16" cy="20.5" r="2.9" fill="currentColor"/><circle cx="24" cy="20.5" r="2.9" fill="currentColor"/><circle cx="32" cy="20.5" r="2.9" fill="currentColor"/>`;
const SLASH = `<path d="M8 8l32 32" ${S}/>`;

const PATHS: Record<IconName, string> = {
  home:
    `<path d="M5.5 23 24 8 42.5 23" ${S}/>` +
    `<path d="M11.5 20.5V36a4 4 0 0 0 4 4h17a4 4 0 0 0 4-4V20.5" ${S}/>` +
    `<path d="M20 40v-7.5a4 4 0 0 1 8 0V40" ${S}/>`,
  back: `<path d="M41 24H9M21.5 11 8.5 24l13 13" ${S}/>`,
  play: `<path d="M17 11.5 37.5 24 17 36.5z" ${F(5)}/>`,
  next: `<path d="M7 24h32M26.5 11l13 13-13 13" ${S}/>`,
  replay:
    `<path d="M36.5 26A13 13 0 1 1 31.8 14.2" ${S}/>` +
    `<path d="M26.4 8.4 36.4 10.6 33.2 20.2z" ${F(3.5)}/>`,
  map:
    `<path d="M6 12.5 17 8l14 4.5L42 8v27.5L31 40l-14-4.5L6 40z" ${S}/>` +
    `<path d="M17 8v27.5M31 12.5V40" ${S}/>`,
  book:
    `<path d="M24 13.5c-5-4-12-4.5-18-3V37c6-1.5 13-1 18 2.5 5-3.5 12-4 18-2.5V10.5c-6-1.5-13-1-18 3z" ${S}/>` +
    `<path d="M24 13.5v26" ${S}/>` +
    `<path d="${starPath(14.6, 23, 5.6, 0.5)}" ${F(2.2)}/>` +
    `<path d="${heartPath(33.4, 23, 5.4)}" ${F(2.2)}/>`,
  gear: `<path d="${gearPath(24, 24, 8, 18.5, 13.5)}" ${S}/><circle cx="24" cy="24" r="5" ${S}/>`,
  'zoom-out': `<circle cx="21" cy="21" r="13" ${S}/><path d="M15 21h12" ${S}/><path d="M31 31l9 9" fill="none" stroke="currentColor" stroke-width="6.5" stroke-linecap="round"/>`,
  sound: SPEAKER + `<path d="M30.5 18.5a8 8 0 0 1 0 11M35.5 13.5a15 15 0 0 1 0 21" ${S}/>`,
  'sound-off': SPEAKER + `<path d="M31.5 19l9 10M40.5 19l-9 10" ${S}/>`,
  music: NOTES,
  'music-off': NOTES + SLASH,
  voice: BUBBLE + DOTS,
  'voice-off': BUBBLE + SLASH,
  lock:
    `<path d="M16 21.5V16a8 8 0 0 1 16 0v5.5" ${S}/>` +
    `<rect x="10.5" y="21.5" width="27" height="19" rx="5" ${S}/>` +
    `<circle cx="24" cy="29.5" r="3" fill="currentColor"/><path d="M24 30v4.5" ${S}/>`,
  check: `<path d="M10 25.5l9 9L38.5 14" ${S}/>`,
  plus: `<path d="M24 10v28M10 24h28" ${S}/>`,
  close: `<path d="M13.5 13.5l21 21M34.5 13.5l-21 21" ${S}/>`,
  pencil:
    `<path d="M10 38l2.4-9.6L31 9.8a3.6 3.6 0 0 1 5.1 0l2.1 2.1a3.6 3.6 0 0 1 0 5.1L19.6 35.6z" ${S}/>` +
    `<path d="M27 13.8l7.2 7.2M12.4 28.4l7.2 7.2" ${S}/>`,
  star: `<path d="${starPath(24, 25.5, 18, 0.5)}" ${F(4)}/>`,
  sparkle: `<path d="${twinkle(21, 26, 15)}" ${F(2.5)}/><path d="${twinkle(37, 11, 6.5)}" ${F(2)}/>`,
};

export function icon(name: IconName): string {
  return `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;
}
