/** Choose a world. */
import { store } from '../core/storage.ts';
import { sound } from '../core/audio.ts';
import { voice } from '../core/voice.ts';
import { getBuddy } from '../identity/buddies.ts';
import { icon } from '../identity/icons.ts';
import { WORLDS } from '../worlds/registry.ts';
import { button, h, pulse, svg } from '../ui/dom.ts';
import { stickerMarkup } from '../ui/sticker.ts';
import { namespaceIds, nextPrefix } from '../core/scene.ts';
import { go, type Screen } from '../ui/router.ts';

export function playerChip(pid: string): HTMLElement {
  const p = store.profile(pid)!;
  const b = getBuddy(p.buddy);
  return h('div', { class: 'player-chip', '--tint': b.soft }, svg(b.draw('happy'), '0 0 200 200', 'chip-buddy'), h('span', {}, p.name));
}

export function worldsScreen(pid: string): Screen {
  const el = h('div', { class: 'screen worlds' });
  const top = h(
    'header',
    { class: 'topbar' },
    button({ label: 'Change player', icon: 'home', cls: 'btn-round', onTap: () => go({ name: 'home' }) }),
    playerChip(pid),
    button({ label: 'My stickers', icon: 'book', cls: 'btn-round', onTap: () => go({ name: 'stickers', pid }) }),
  );

  const list = h('div', { class: 'world-list' });
  WORLDS.forEach((w, i) => {
    const total = w.levels.length;
    const done = w.levels.filter((l) => store.isDone(pid, l.id)).length;
    const dots = h('span', { class: 'world-dots', 'aria-label': `${done} of ${total} done` });
    for (let k = 0; k < total; k++) dots.append(h('i', { class: k < done ? 'on' : '', html: icon('star') }));
    const hasBadge = store.hasSticker(pid, w.badge.id);
    const card = h(
      'button',
      { type: 'button', class: 'world-card', '--accent': w.theme.accent, '--sky1': w.theme.sky[0], '--sky2': w.theme.sky[1], '--deep': w.theme.deep, style: { animationDelay: `${i * 90}ms` }, 'aria-label': `${w.name}. ${done} of ${total} done.` },
      h('span', { class: 'world-cover' }, svg(namespaceIds(w.cover(), nextPrefix('c')), '0 0 800 600', 'cover-svg', { preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' })),
      h('span', { class: 'world-info' }, h('span', { class: 'world-name' }, w.name), h('span', { class: 'world-tag' }, w.tagline), dots),
      hasBadge ? h('span', { class: 'world-badge' }, svg(stickerMarkup(w.badge, w.theme.sky[0]), '0 0 200 200')) : null,
    );
    card.addEventListener('click', () => {
      if (!total) return;
      sound.tap();
      pulse(card, 'squish', 420);
      voice.say(w.name);
      window.setTimeout(() => go({ name: 'map', pid, wid: w.id }), 280);
    });
    list.append(card);
  });

  el.append(h('div', { class: 'soft-bg' }), top, h('h1', { class: 'screen-title' }, 'Where shall we explore?'), list);
  return { el, music: 'home' };
}
