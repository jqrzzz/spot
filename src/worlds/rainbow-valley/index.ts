/**
 * Rainbow Valley — world definition.
 *
 * A pastel valley of rolling hills, candy trees and rainbow bridges where Pomi the puffcorn,
 * Tilly the hopleaf and Bo the bumbleberry play. Learning themes: colours, counting, shapes,
 * patterns, position & direction, size.
 */
import type { World } from '../../core/types.ts';
import { badge, cover, mapArt } from './cover.ts';
import { level1 } from './level-1.ts';
import { level2 } from './level-2.ts';
import { level3 } from './level-3.ts';
import { level4 } from './level-4.ts';
import { level5 } from './level-5.ts';

const world: World = {
  id: 'rainbow-valley',
  name: 'Rainbow Valley',
  tagline: 'Colours, counting & shapes',
  theme: { sky: ['#C6E9FF', '#FFE3F1'], accent: '#F77FB3', deep: '#4A3463', path: '#FFFFFF' },
  music: 'valley',
  cover,
  mapArt,
  levels: [level1, level2, level3, level4, level5],
  badge,
};

export default world;
