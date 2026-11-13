import type { World } from '../core/types.ts';
import rainbowValley from './rainbow-valley/index.ts';
import monsterPop from './monster-pop/index.ts';
import frostlight from './frostlight/index.ts';

/** The worlds shown in the game, in display order. */
export const WORLDS: World[] = [rainbowValley, monsterPop, frostlight];

export function findWorld(id: string): World | undefined {
  return WORLDS.find((w) => w.id === id);
}

export function findLevel(levelId: string): { world: World; index: number } | undefined {
  for (const world of WORLDS) {
    const index = world.levels.findIndex((l) => l.id === levelId);
    if (index >= 0) return { world, index };
  }
  return undefined;
}
