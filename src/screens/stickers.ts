/** The sticker book: one sticker per finished picture, one badge per finished world. */
import { store } from '../core/storage.ts';
import { sound } from '../core/audio.ts';
import { voice } from '../core/voice.ts';
import { icon } from '../identity/icons.ts';
import { WORLDS } from '../worlds/registry.ts';
import { button, h, pulse, svg } from '../ui/dom.ts';
import { emptyStickerMarkup, stickerMarkup } from '../ui/sticker.ts';
import { go, type Screen } from '../ui/router.ts';
import { playerChip } from './worlds.ts';

export function stickersScreen(pid: string): Screen {
  const el = h('div', { class: 'screen book' });
  const all = WORLDS.flatMap((w) => [w.badge, ...w.levels.map((l) => l.sticker)]);
  const have = all.filter((s) => store.hasSticker(pid, s.id)).length;

  const top = h(
    'header',
    { class: 'topbar' },
    button({ label: 'Back to worlds', icon: 'back', cls: 'btn-round', onTap: () => go({ name: 'worlds', pid }) }),
    h('div', { class: 'map-title' }, h('span', { class: 'map-name' }, 'My Stickers'), h('span', { class: 'map-count', html: `${icon('star')}<b>${have}/${all.length}</b>` })),
    playerChip(pid),
  );

  const pages = h('div', { class: 'book-pages' });
  for (const w of WORLDS) {
    const grid = h('div', { class: 'sticker-grid' });
    const items = [...w.levels.map((l) => ({ s: l.sticker, badge: false })), { s: w.badge, badge: true }];
    for (const { s, badge } of items) {
      const earned = store.hasSticker(pid, s.id);
      const slot = h(
        'button',
        { type: 'button', class: `sticker-slot ${earned ? 'earned' : 'empty'} ${badge ? 'is-badge' : ''}`, 'aria-label': earned ? s.name : 'Not found yet' },
        svg(earned ? stickerMarkup(s, badge ? w.theme.sky[1] : w.theme.sky[0]) : emptyStickerMarkup(), '0 0 200 200'),
        h('span', { class: 'sticker-name' }, earned ? s.name : ''),
      );
      slot.addEventListener('click', () => {
        if (!earned) {
          pulse(slot, 'wiggle', 600);
          voice.say('Finish more pictures to find this sticker!');
          return;
        }
        sound.reward();
        pulse(slot, 'spin', 900);
        voice.say(s.name);
      });
      grid.append(slot);
    }
    pages.append(h('section', { class: 'book-world', '--accent': w.theme.accent, '--deep': w.theme.deep, '--sky1': w.theme.sky[0], '--sky2': w.theme.sky[1] }, h('h2', {}, w.name), grid));
  }

  el.append(h('div', { class: 'soft-bg' }), top, pages);
  return { el, music: 'home', enter: () => voice.say(have ? `You have ${have} sticker${have === 1 ? '' : 's'}!` : 'Finish a picture to get your first sticker!') };
}
