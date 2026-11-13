/**
 * Rainbow Valley — world definition.
 */
import type { World } from '../../core/types.ts';
import { P, face, star } from '../../art/kit.ts';
import { level1 } from './level-1.ts';
import { level2 } from './level-2.ts';
import { level3 } from './level-3.ts';
import { level4 } from './level-4.ts';

const world: World = {
  id: 'rainbow-valley',
  name: 'Rainbow Valley',
  tagline: 'Colours, counting & shapes',
  theme: { sky: ['#C6E9FF', '#FFE3F1'], accent: '#FF8FB8', deep: '#4A3463', path: '#FFFFFF' },
  music: 'valley',
  cover: () => `<rect width="800" height="600" fill="#C6E9FF"/>` + face({ x: 400, y: 300, s: 2.4 }),
  levels: [level1, level2, level3, level4],
  badge: { id: 'badge-rv', name: 'Rainbow Valley Badge', draw: () => star(100, 104, 70, P.gold, { outline: P.goldDeep, width: 8 }) },
};

export default world;
