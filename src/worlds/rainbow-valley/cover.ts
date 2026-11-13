/**
 * Rainbow Valley — cover illustration, level-map backdrop and the world badge.
 */
import type { Sticker } from '../../core/types.ts';
import { P, circle, cloud, defs, ellipse, g, heart, linear, path, rainbow, radial, shine, sparkle, star, stroke, url } from '../../art/kit.ts';
import { blossom, bo, puffcorn, tilly } from './characters.ts';
import {
  appleTree,
  bush,
  butterfly,
  candyTree,
  daisy,
  farTree,
  glow,
  glowDef,
  hotAirBalloon,
  kite,
  meadowDots,
  mushroom,
  puffCloud,
  sparkles,
  sun,
  tufts,
  tulip,
  windmill,
} from './props.ts';

/* ------------------------------------------------------------------ cover (800 × 600) */

export function cover(): string {
  const d = defs(
    linear('rvCoverSky', [
      [0, '#B3DEFF'],
      [0.45, '#D9E3FF'],
      [0.75, '#FBE4F4'],
      [1, '#FFEFE4'],
    ]),
    glowDef('rvCoverSun', '#FFF3B8', 0.9),
    glowDef('rvCoverHero', '#FFFFFF', 0.75),
    linear('rvCoverFar', [
      [0, '#D3EFE0'],
      [1, '#C3E8D2'],
    ]),
    linear('rvCoverMid', [
      [0, '#B9EDB3'],
      [1, '#9ADF9C'],
    ]),
    linear('rvCoverFront', [
      [0, '#A6E5A0'],
      [1, '#86D18B'],
    ]),
  );

  const sky =
    `<rect width="800" height="600" fill="${url('rvCoverSky')}"/>` +
    glow(90, 84, 180, 'rvCoverSun') +
    sun(90, 84, 38, 'calm') +
    puffCloud(300, 64, 0.95) +
    cloud(700, 74, 0.6) +
    puffCloud(520, 150, 0.5, '#FFFFFF', 0.85) +
    sparkles(91, { x: 220, y: 20, w: 560, h: 140 }, 7, '#FFFFFF', 8, 70) +
    rainbow(430, 430, 352, 22, P.rainbow, 0.95) +
    hotAirBalloon(666, 196, 0.52, ['#FFB0CC', '#FFE69A', '#A9DCFF']);

  const far =
    path('M0 340C110 312 220 318 320 332C430 306 560 308 660 326C730 316 770 318 800 322V460H0Z', url('rvCoverFar')) +
    farTree(268, 330, 0.62, '#F9C6DD') +
    farTree(292, 334, 0.48, '#D4C4FF') +
    farTree(472, 318, 0.6, '#FFE3A6') +
    farTree(610, 322, 0.6, '#C6E6FF') +
    windmill(740, 348, 0.55);

  const mid =
    path('M0 400C60 352 180 340 280 380C380 418 520 420 640 400C720 388 770 392 800 396V600H0Z', url('rvCoverMid')) +
    meadowDots(92, { x: 280, y: 400, w: 500, h: 40 }, 12, ['#FFFFFF', '#FFD3E6', '#FFF1A8'], 2.8, 34) +
    appleTree(118, 392, 0.62, [
      [80, 254],
      [130, 230],
      [158, 276],
    ], 13) +
    candyTree(700, 430, 0.75, '#FFC2DD', P.lemon) +
    candyTree(770, 444, 0.6, '#CDB8FF', '#FFC2DD');

  const kiteArt =
    path('M258 452Q262 340 236 262', 'none', { ...stroke('#FFFFFF', 2.2), opacity: 0.95 }) + kite(236, 236, 0.75, '#FF9FC6', 'stripes', [P.lemon, P.sky, P.lemon], -16);

  const front =
    path('M0 488C150 450 330 446 470 462C610 478 720 466 800 452V600H0Z', url('rvCoverFront')) +
    tufts(93, { x: 20, y: 490, w: 760, h: 90 }, 12, '#5DB46F', 1.1, 60) +
    glow(452, 470, 190, 'rvCoverHero');

  const cast =
    tilly({ x: 210, y: 540, s: 1.32, pose: 'wave', mood: 'joy', flower: P.pink, look: 1 }) +
    puffcorn({ x: 452, y: 552, s: 1.62, mood: 'joy', look: 0.6 }) +
    bo({ x: 646, y: 352, s: 1.25, flip: true, mood: 'happy', look: -1, trail: true }) +
    heart(560, 330, 9, '#FF8FB6') +
    heart(592, 300, 6, '#FFB3CF') +
    heart(330, 330, 7, '#FFB3CF') +
    sparkle(382, 272, 10) +
    sparkle(560, 404, 8) +
    sparkle(318, 420, 7);

  const corners =
    tulip(40, 606, 1.1, '#FF8FB6', -4) +
    tulip(78, 610, 1.3, '#FFD95A', 3) +
    tulip(118, 606, 0.95, '#C9B2FF', 6) +
    mushroom(700, 590, 0.9, '#FF8C9E') +
    mushroom(744, 600, 0.6, '#86BFFF') +
    bush(812, 616, 0.95, '#93DB93', '#FFFFFF', 3) +
    daisy(612, 604, 0.7, '#FFFFFF') +
    daisy(320, 602, 0.55, '#FFD3E6') +
    butterfly(130, 452, 0.5, P.lilac, 'dots', -14) +
    butterfly(740, 300, 0.45, '#FFC59E', 'hearts', 16);

  return d + sky + far + mid + kiteArt + front + cast + corners;
}

/* ------------------------------------------------------------------ map backdrop (1200 × 800) */

export function mapArt(): string {
  const d = defs(
    linear('rvMapSky', [
      [0, '#BDE4FF'],
      [0.5, '#E6E6FF'],
      [1, '#FFEFF4'],
    ]),
    glowDef('rvMapSun', '#FFF3B8', 0.85),
    linear('rvMapFar', [
      [0, '#DDF3E4'],
      [1, '#D2EFDC'],
    ]),
    linear('rvMapMeadow', [
      [0, '#CBF0C3'],
      [0.5, '#C2ECBC'],
      [1, '#B5E6B0'],
    ]),
    linear('rvMapFront', [
      [0, '#AEE6A6'],
      [1, '#93D893'],
    ]),
  );
  const sky =
    `<rect width="1200" height="800" fill="${url('rvMapSky')}"/>` +
    glow(140, 110, 220, 'rvMapSun') +
    sun(140, 110, 44, 'calm') +
    rainbow(600, 360, 330, 16, P.rainbow, 0.45) +
    puffCloud(420, 80, 1.0, '#FFFFFF', 0.9) +
    cloud(820, 70, 0.7) +
    puffCloud(1060, 150, 0.8, '#FFFFFF', 0.95) +
    hotAirBalloon(980, 150, 0.6, ['#FFB0CC', '#FFE69A', '#A9DCFF']) +
    sparkles(101, { x: 300, y: 30, w: 760, h: 140 }, 8, '#FFFFFF', 9, 90);
  const land =
    path('M0 300C180 270 360 282 540 296C720 272 920 274 1200 292V420H0Z', url('rvMapFar')) +
    farTree(90, 300, 0.7, '#F9C6DD') +
    farTree(120, 304, 0.55, '#D4C4FF') +
    farTree(1080, 290, 0.7, '#FFE3A6') +
    farTree(1112, 296, 0.55, '#C6E6FF') +
    windmill(1150, 330, 0.6) +
    path('M0 340C240 318 480 326 640 336C820 346 1000 326 1200 330V800H0Z', url('rvMapMeadow')) +
    meadowDots(102, { x: 20, y: 360, w: 1160, h: 400 }, 40, ['#FFFFFF', '#FFE3EF', '#FFF6C9'], 2.6, 70);
  const edges =
    // left edge: apple tree & tulips
    appleTree(80, 560, 0.8, [
      [40, 370],
      [100, 340],
      [124, 400],
    ], 15) +
    bush(250, 806, 1.0, '#9EDF9C', '#FFD3E6', 6) +
    tulip(40, 800, 1.5, '#FF8FB6', -4) +
    tulip(92, 806, 1.75, '#FFD95A', 3) +
    tulip(146, 802, 1.3, '#C9B2FF', 6) +
    mushroom(196, 792, 0.9, '#FF8C9E') +
    // right edge: candy trees, bushes
    candyTree(1110, 560, 1.0, '#FFC2DD', P.lemon) +
    candyTree(1180, 600, 0.8, '#CDB8FF', '#FFC2DD') +
    bush(1140, 806, 1.1, '#93DB93', '#FFFFFF', 3) +
    mushroom(1010, 790, 0.8, '#86BFFF') +
    // bottom band: soft foreground flowers
    path('M0 720C300 700 600 712 900 704C1020 700 1120 706 1200 712V800H0Z', url('rvMapFront')) +
    daisy(330, 796, 0.7, '#FFFFFF') +
    daisy(470, 800, 0.6, '#FFD3E6') +
    daisy(690, 798, 0.65, '#E2D6FF') +
    daisy(860, 800, 0.7, '#FFFFFF') +
    butterfly(250, 640, 0.5, P.lilac, 'dots', -14) +
    butterfly(960, 560, 0.45, '#FFC59E', 'hearts', 16) +
    bo({ x: 1040, y: 420, s: 0.9, flip: true, mood: 'happy', trail: true });
  return d + sky + land + edges;
}

/* ------------------------------------------------------------------ badge (200 × 200) */

export const badge: Sticker = {
  id: 'badge-rv',
  name: 'Rainbow Valley Medal',
  draw: () => {
    const d = defs(
      radial('rvBadgeFace', [
        [0, '#E9F6FF'],
        [1, '#BFE3FF'],
      ], 0.4, 0.35, 0.7),
    );
    let rosette = '';
    for (let i = 0; i < 16; i++) {
      const a = (i * 360) / 16;
      rosette += ellipse(100, 30, 16, 22, i % 2 ? '#FFD66B' : '#FFE79A', { ...stroke('#E5A83A', 3), transform: `rotate(${a} 100 92)` });
    }
    const tails =
      path('M74 132L56 192L78 180L90 196L98 140Z', '#FF9FC6', stroke('#D9578C', 3.4)) + path('M126 132L144 192L122 180L110 196L102 140Z', '#B79BFF', stroke('#7F63D6', 3.4));
    const face =
      circle(100, 92, 52, url('rvBadgeFace'), stroke('#E5A83A', 4)) +
      `<clipPath id="rvBadgeClip"><circle cx="100" cy="92" r="50"/></clipPath>` +
      g(rainbow(100, 118, 44, 8, P.rainbow) + puffCloud(62, 118, 0.42) + puffCloud(138, 118, 0.42) + circle(100, 150, 30, '#A3E3A4'), { 'clip-path': url('rvBadgeClip') }) +
      star(100, 76, 15, P.lemon, { outline: P.lemonDeep, width: 3.4 }) +
      shine(76, 62, 12, 7);
    return d + tails + rosette + face + blossom(150, 52, 9, P.pink) + sparkle(46, 46, 9, '#FFFFFF') + sparkle(160, 148, 7, '#FFF6C9');
  },
};
