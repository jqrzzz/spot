/**
 * Monster Pop Academy — a sparkly music school for friendly little monsters.
 *
 * Cast (see characters.ts): Plinky the singer, Tumtum the drummer, Lolo the dancer and tiny Fizz.
 * Learning themes: visual memory, patterns & sequences, music objects, matching, feelings and
 * left & right.
 */
import type { World } from '../../core/types.ts';
import { badgeArt, cover, mapArt } from './art.ts';
import level1 from './level-1.ts';
import level2 from './level-2.ts';
import level3 from './level-3.ts';
import level4 from './level-4.ts';
import level5 from './level-5.ts';

const world: World = {
  id: 'monster-pop',
  name: 'Monster Pop Academy',
  tagline: 'Music, feelings & patterns',
  theme: { sky: ['#E3D4FF', '#FFD6EC'], accent: '#E36FAE', deep: '#3F2A5E', path: '#FFFFFF' },
  music: 'pop',
  cover,
  mapArt,
  levels: [level1, level2, level3, level4, level5],
  badge: {
    id: 'badge-mp',
    name: 'Pop Academy Star',
    draw: badgeArt,
  },
};

export default world;
