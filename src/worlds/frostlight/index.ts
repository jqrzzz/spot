/**
 * Frostlight Kingdom — world definition.
 */
import type { World } from '../../core/types.ts';
import { P, face, star } from '../../art/kit.ts';
import { level1 } from './level-1.ts';
import { level2 } from './level-2.ts';
import { level3 } from './level-3.ts';
import { level4 } from './level-4.ts';

const world: World = {
  id: 'frostlight',
  name: 'Frostlight Kingdom',
  tagline: 'Seasons, snowflakes & symmetry',
  theme: { sky: ['#D3EEFF', '#F1E9FF'], accent: '#6FB7F0', deep: '#2F3F66', path: '#FFFFFF' },
  music: 'frost',
  cover: () => level1.draw({ on: () => false, pick: (_id, a) => a }),
  levels: [level1, level2, level3, level4],
  badge: {
    id: 'badge-fk',
    name: 'Frostlight Kingdom Badge',
    draw: () => star(100, 104, 70, P.gold, { outline: P.goldDeep, width: 8 }) + face({ x: 100, y: 104, s: 1.4 }),
  },
};

export default world;
