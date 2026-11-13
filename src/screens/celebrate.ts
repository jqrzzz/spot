/** End-of-level celebration: confetti, a cheering buddy, and the sticker reward. */
import type { Level, Sticker, World } from '../core/types.ts';
import type { Buddy } from '../identity/buddies.ts';
import type { Profile } from '../core/storage.ts';
import { sound } from '../core/audio.ts';
import { voice } from '../core/voice.ts';
import { button, h, svg } from '../ui/dom.ts';
import { confetti } from '../ui/confetti.ts';
import { stickerMarkup } from '../ui/sticker.ts';

export interface CelebrateOpts {
  host: HTMLElement;
  world: World;
  level: Level;
  index: number;
  profile: Profile;
  buddy: Buddy;
  newSticker: boolean;
  badge: Sticker | null;
  onNext(): void;
  onMap(): void;
  onReplay(): void;
}

const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const b = a + Math.PI / 12;
  return `<path d="M100 100L${100 + Math.cos(a) * 140} ${100 + Math.sin(a) * 140}L${100 + Math.cos(b) * 140} ${100 + Math.sin(b) * 140}Z"/>`;
}).join('');

export function celebrate(o: CelebrateOpts): () => void {
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  const isLast = o.index >= o.world.levels.length - 1;

  const overlay = h('div', { class: 'celebrate', role: 'dialog', 'aria-label': 'Level complete' });
  const stopConfetti = confetti(overlay);

  const cheerBuddy = svg(o.buddy.draw('joy'), '0 0 200 200', 'cheer-buddy');
  const headline = h('h2', { class: 'reward-title' }, o.newSticker ? 'New sticker!' : 'You did it!');
  const stickerWrap = h(
    'div',
    { class: 'reward-sticker' },
    svg(RAYS, '0 0 200 200', 'rays'),
    svg(stickerMarkup(o.level.sticker, o.world.theme.sky[0]), '0 0 200 200', 'sticker-art'),
  );
  const name = h('p', { class: 'reward-name' }, o.level.sticker.name);
  const badgeRow = h('div', { class: 'reward-badge' });

  const next = button({
    label: isLast ? 'Back to the map' : 'Next level',
    icon: isLast ? 'map' : 'play',
    text: isLast ? 'Map' : 'Next',
    cls: 'btn-primary btn-big',
    onTap: () => o.onNext(),
  });
  const actions = h(
    'div',
    { class: 'reward-actions' },
    isLast ? null : button({ label: 'Back to the map', icon: 'map', cls: 'btn-round', onTap: () => o.onMap() }),
    next,
    button({ label: 'Play this picture again', icon: 'replay', cls: 'btn-round', onTap: () => o.onReplay() }),
  );

  const card = h('div', { class: 'reward-card' }, cheerBuddy, headline, stickerWrap, name, badgeRow, actions);
  overlay.append(card);
  o.host.append(overlay);

  requestAnimationFrame(() => overlay.classList.add('show'));
  const cheer = `Hooray, ${o.profile.name}! You found them all!`;
  voice.say(o.newSticker ? `${cheer} You got the ${o.level.sticker.name} sticker!` : cheer);
  later(() => {
    sound.reward();
    stickerWrap.classList.add('in');
  }, 550);

  if (o.badge) {
    const badge = o.badge;
    later(() => {
      badgeRow.append(
        svg(stickerMarkup(badge, o.world.theme.sky[1]), '0 0 200 200', 'badge-art'),
        h('div', {}, h('strong', {}, `${o.world.name} complete!`), h('span', {}, badge.name)),
      );
      badgeRow.classList.add('in');
      sound.reward();
      voice.say(`Wow! You finished ${o.world.name}! Here is your special badge!`, { interrupt: false });
      confetti(overlay, 2400);
    }, 2300);
  }

  return () => {
    timers.forEach((t) => clearTimeout(t));
    stopConfetti();
  };
}
