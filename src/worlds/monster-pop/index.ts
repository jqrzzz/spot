/**
 * Monster Pop Academy — world definition. (WIP preview)
 */
import type { Level, World } from '../../core/types.ts';
import { P, face, star } from '../../art/kit.ts';
import { fizz, lolo, plinky, tumtum } from './characters.ts';
import level1 from './level-1.ts';
import level2 from './level-2.ts';
import level3 from './level-3.ts';
import { bassDrum, keytar, maraca, mic, note, tambourine, stick } from './props.ts';

export const preview: Level = {
  id: 'mp-1',
  title: 'Preview',
  findCount: 3,
  differences: [],
  draw: () =>
    `<rect width="800" height="600" fill="#F3EAFF"/>` +
    plinky({ x: 130, y: 400, mood: 'joy', armL: 'wave', armR: 'hold', holdR: (x, y) => mic(x, y, P.pinkDeep, -20) }) +
    tumtum({ x: 330, y: 400, mood: 'happy', armL: 'drum', armR: 'up', holdL: (x, y) => stick(x, y, -30), holdR: (x, y) => stick(x, y, 20) }) +
    lolo({ x: 520, y: 400, mood: 'wink', armL: 'cheer', armR: 'hip' }) +
    fizz({ x: 690, y: 400, mood: 'silly', armL: 'up', armR: 'out', holdL: (x, y) => maraca(x, y, P.pink, -20), holdR: (x, y) => maraca(x, y, P.lemon, 30) }) +
    bassDrum(120, 510, 70, P.coral, [[0, 0, 'star', P.gold], [-0.4, 0.3, 'heart', P.pink], [0.4, 0.3, 'heart', P.pink]]) +
    note(300, 540, 1, P.pinkDeep, 'eighth') +
    note(360, 540, 1, P.skyDeep, 'beamed') +
    tambourine(520, 520, 40) +
    keytar(680, 520, P.lilac),
  sticker: { id: 'st-mp-1', name: 'x', draw: () => star(100, 104, 70, P.gold) },
};

const world: World = {
  id: 'monster-pop',
  name: 'Monster Pop Academy',
  tagline: 'Music, feelings & patterns',
  theme: { sky: ['#E3D4FF', '#FFD6EC'], accent: '#B57CFF', deep: '#3F2A5E', path: '#FFFFFF' },
  music: 'pop',
  cover: () => `<rect width="800" height="600" fill="#E3D4FF"/>` + star(400, 300, 120, P.gold, { outline: P.goldDeep, width: 10 }) + face({ x: 400, y: 300, s: 2.4 }),
  levels: [level1, level2, level3],
  badge: {
    id: 'badge-mp',
    name: 'Monster Pop Academy Badge',
    draw: () => star(100, 104, 70, P.gold, { outline: P.goldDeep, width: 8 }) + face({ x: 100, y: 104, s: 1.4 }),
  },
};

export default world;
