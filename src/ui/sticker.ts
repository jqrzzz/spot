import type { Sticker } from '../core/types.ts';
import { namespaceIds, nextPrefix } from '../core/scene.ts';

/** Die-cut sticker frame around a sticker's art (viewBox 0 0 200 200). */
export function stickerMarkup(s: Sticker, tint = '#F4EEFF'): string {
  const p = nextPrefix('k');
  return (
    `<defs><radialGradient id="${p}-bg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${tint}"/></radialGradient></defs>` +
    `<circle cx="102" cy="106" r="94" fill="#3D2C52" opacity=".12"/>` +
    `<circle cx="100" cy="100" r="94" fill="#fff"/>` +
    `<circle cx="100" cy="100" r="85" fill="url(#${p}-bg)"/>` +
    `<g>${namespaceIds(s.draw(), p)}</g>` +
    `<path d="M38 70A66 66 0 0 1 86 36" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>`
  );
}

/** A sticker slot not earned yet. */
export function emptyStickerMarkup(): string {
  return (
    `<circle cx="100" cy="100" r="90" fill="#ffffff" opacity=".55"/>` +
    `<circle cx="100" cy="100" r="84" fill="none" stroke="#B9A6E6" stroke-width="5" stroke-dasharray="14 12" stroke-linecap="round"/>` +
    `<text x="100" y="126" text-anchor="middle" font-family="Fredoka, ui-rounded, sans-serif" font-weight="600" font-size="78" fill="#C9B9EE">?</text>`
  );
}
