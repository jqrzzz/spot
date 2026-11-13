/** Title screen + "Who's playing?" */
import { store } from '../core/storage.ts';
import { sound } from '../core/audio.ts';
import { voice } from '../core/voice.ts';
import { getBuddy } from '../identity/buddies.ts';
import { icon } from '../identity/icons.ts';
import { logo, titleArt } from '../identity/logo.ts';
import { button, h, pulse, svg } from '../ui/dom.ts';
import { go, type Screen } from '../ui/router.ts';
import { openSettings } from './settings.ts';

export function homeScreen(): Screen {
  const el = h('div', { class: 'screen home' });
  const bg = h('div', { class: 'bg-art' });
  bg.append(svg(titleArt(), '0 0 1200 800', 'bg-svg', { preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' }));

  const gear = button({
    label: 'Grown-ups: settings',
    icon: 'gear',
    cls: 'btn-round btn-soft corner-tr',
    onTap: () => openSettings(() => go({ name: 'home' }, { replace: true })),
  });

  const cards = h('div', { class: 'profiles' });
  let leaving = false;
  for (const p of store.profiles) {
    const b = getBuddy(p.buddy);
    const stickers = store.progress(p.id).stickers.length;
    const happy = svg(b.draw('happy'), '0 0 200 200', 'mood mood-happy');
    const joy = svg(b.draw('joy'), '0 0 200 200', 'mood mood-joy');
    const card = h(
      'button',
      { type: 'button', class: 'profile-card', '--tint': b.soft, '--tint-deep': b.color, 'aria-label': `Play as ${p.name}` },
      h('span', { class: 'profile-buddy' }, happy, joy),
      h('span', { class: 'profile-name' }, p.name),
      stickers ? h('span', { class: 'profile-stickers', html: `${icon('star')}<b>${stickers}</b>` }) : null,
    );
    card.addEventListener('click', () => {
      if (leaving) return;
      leaving = true;
      sound.tap();
      card.classList.add('chosen');
      pulse(card, 'squish', 420);
      voice.say(`Hi ${p.name}! Let's explore!`);
      window.setTimeout(() => go({ name: 'worlds', pid: p.id }), 650);
    });
    cards.append(card);
  }

  el.append(
    bg,
    gear,
    h(
      'main',
      { class: 'home-center' },
      h(
        'div',
        { class: 'brand' },
        h('h1', { class: 'logo-wrap', 'aria-label': 'Little Wonder' }, svg(logo(), '0 0 600 260', 'logo', { 'aria-hidden': 'true' })),
        h('p', { class: 'tagline' }, 'A World of Tiny Discoveries'),
      ),
      h('div', { class: 'chooser' }, h('h2', { class: 'who' }, 'Who’s playing?'), cards),
    ),
  );
  return { el, music: 'home' };
}
