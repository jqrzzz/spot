/** Grown-ups panel: sound/music/voice switches and player management. */
import { store, type Settings } from '../core/storage.ts';
import { sound } from '../core/audio.ts';
import { voice } from '../core/voice.ts';
import { BUDDIES, getBuddy } from '../identity/buddies.ts';
import type { IconName } from '../identity/icons.ts';
import { button, h, svg } from '../ui/dom.ts';

export function applySettings(): void {
  const s = store.settings;
  sound.setSfx(s.sfx);
  sound.setMusic(s.music);
  voice.enabled = s.voice;
}

export function openSettings(onClose: () => void): void {
  const overlay = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Grown-ups settings' });
  const card = h('div', { class: 'modal-card' });
  overlay.append(card);

  const close = () => {
    overlay.classList.add('out');
    window.setTimeout(() => overlay.remove(), 250);
    onClose();
  };
  overlay.addEventListener('click', (e) => e.target === overlay && close());

  const toggle = (key: keyof Settings, label: string, on: IconName, off: IconName) => {
    const b = button({
      label,
      icon: store.settings[key] ? on : off,
      text: label,
      cls: `toggle ${store.settings[key] ? 'on' : ''}`,
      onTap: () => {
        store.setSetting(key, !store.settings[key]);
        applySettings();
        render();
      },
    });
    b.setAttribute('aria-pressed', String(store.settings[key]));
    return b;
  };

  function render(): void {
    card.replaceChildren(
      h(
        'div',
        { class: 'modal-head' },
        h('h2', {}, 'Grown-ups'),
        button({ label: 'Close', icon: 'close', cls: 'btn-round btn-small', onTap: close }),
      ),
      h('div', { class: 'toggles' }, toggle('sfx', 'Sounds', 'sound', 'sound-off'), toggle('music', 'Music', 'music', 'music-off'), toggle('voice', 'Voice', 'voice', 'voice-off')),
      h('h3', {}, 'Players'),
      ...store.profiles.map((p) => playerRow(p.id)),
      button({
        label: 'Add a player',
        icon: 'plus',
        text: 'Add a player',
        cls: 'btn-pill',
        onTap: () => {
          const used = new Set(store.profiles.map((x) => x.buddy));
          const free = BUDDIES.find((b) => !used.has(b.id)) ?? BUDDIES[0];
          store.addProfile('Friend', free.id);
          render();
          const inputs = card.querySelectorAll<HTMLInputElement>('input.name-input');
          inputs[inputs.length - 1]?.select();
        },
      }),
      h('p', { class: 'fine' }, 'Little Wonder v0.1 · No ads, no accounts. Progress is saved on this device only.'),
    );
  }

  function playerRow(id: string): HTMLElement {
    const p = store.profile(id)!;
    const input = h('input', { class: 'name-input', value: p.name, maxlength: 24, 'aria-label': 'Player name', autocomplete: 'off', spellcheck: 'false' });
    input.addEventListener('change', () => {
      store.updateProfile(id, { name: input.value });
      input.value = store.profile(id)!.name;
    });
    const buddies = h('div', { class: 'buddy-pick', role: 'radiogroup', 'aria-label': 'Buddy' });
    for (const b of BUDDIES) {
      const opt = h('button', { type: 'button', class: `buddy-opt ${p.buddy === b.id ? 'on' : ''}`, role: 'radio', 'aria-checked': String(p.buddy === b.id), 'aria-label': `${b.name} the ${b.kind}`, '--tint': b.soft });
      opt.append(svg(b.draw('happy'), '0 0 200 200'));
      opt.addEventListener('click', () => {
        sound.tap();
        store.updateProfile(id, { buddy: b.id });
        render();
      });
      buddies.append(opt);
    }
    let armed: 'reset' | 'remove' | null = null;
    const reset = button({
      label: 'Reset progress',
      text: 'Reset progress',
      cls: 'btn-pill btn-quiet',
      onTap: () => {
        if (armed !== 'reset') {
          armed = 'reset';
          reset.querySelector('.btn-text')!.textContent = 'Tap again to reset';
          return;
        }
        store.resetProgress(id);
        render();
      },
    });
    const remove =
      store.profiles.length > 1
        ? button({
            label: 'Remove player',
            text: 'Remove',
            cls: 'btn-pill btn-quiet',
            onTap: () => {
              if (armed !== 'remove') {
                armed = 'remove';
                remove!.querySelector('.btn-text')!.textContent = 'Tap again to remove';
                return;
              }
              store.removeProfile(id);
              render();
            },
          })
        : null;
    const b = getBuddy(p.buddy);
    return h(
      'div',
      { class: 'player-row', '--tint': b.soft },
      h('div', { class: 'player-row-top' }, svg(b.draw('happy'), '0 0 200 200', 'row-buddy'), input),
      buddies,
      h('div', { class: 'player-row-actions' }, reset, remove),
    );
  }

  render();
  document.body.append(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
}
