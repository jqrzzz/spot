/** Tiny DOM helpers — no framework needed. */
import { sound } from '../core/audio.ts';
import { icon, type IconName } from '../identity/icons.ts';

type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, unknown> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = String(v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = String(v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    else if (k.startsWith('--')) el.style.setProperty(k, String(v));
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Create an <svg> element from inner markup. */
export function svg(markup: string, viewBox: string, cls = '', extra: Record<string, string> = {}): SVGSVGElement {
  const el = document.createElementNS(SVG_NS, 'svg');
  el.setAttribute('viewBox', viewBox);
  el.setAttribute('xmlns', SVG_NS);
  if (cls) el.setAttribute('class', cls);
  for (const [k, v] of Object.entries(extra)) el.setAttribute(k, v);
  el.innerHTML = markup;
  return el;
}

export function svgNode<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

/** Retrigger a CSS animation class. */
export function pulse(el: Element, cls: string, ms = 600): void {
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
  window.setTimeout(() => el.classList.remove(cls), ms);
}

export interface ButtonOpts {
  label: string;
  icon?: IconName;
  text?: string;
  cls?: string;
  silent?: boolean;
  onTap: (e: MouseEvent) => void;
}

/** A squishy button with a soft press sound. */
export function button(o: ButtonOpts): HTMLButtonElement {
  const b = h('button', { type: 'button', class: `btn ${o.cls ?? ''}`.trim(), 'aria-label': o.label, title: o.label });
  if (o.icon) b.append(h('span', { class: 'btn-icon', html: icon(o.icon) }));
  if (o.text) b.append(h('span', { class: 'btn-text' }, o.text));
  b.addEventListener('click', (e) => {
    if (!o.silent) sound.tap();
    pulse(b, 'squish', 420);
    o.onTap(e);
  });
  return b;
}

export const wait = (ms: number): Promise<void> => new Promise((r) => window.setTimeout(r, ms));

export const reducedMotion = (): boolean => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
