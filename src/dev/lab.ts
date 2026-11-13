/**
 * Level Lab (dev only): lab.html?world=<id|all>&level=<id>&mode=<sheet|validate>&scale=0.5
 *  - sheet: original | changed (first-play set) | all candidates with hit areas | pixel diff
 *  - validate: runs the quality gate and exposes window.__report for scripts/validate-levels.mjs
 */
import type { Level, World } from '../core/types.ts';
import { SCENE_H, SCENE_W } from '../core/types.ts';
import { nextPrefix, sceneMarkup } from '../core/scene.ts';
import { shapeBounds } from '../core/hit.ts';
import { rasterize, validateWorld, type WorldReport } from './validate.ts';

declare global {
  interface Window {
    __report?: { ok: boolean; worlds: WorldReport[]; fatal?: string };
  }
}

const params = new URLSearchParams(location.search);
const worldParam = params.get('world') ?? 'all';
const levelParam = params.get('level');
const mode = params.get('mode') ?? 'sheet';
const scale = Number(params.get('scale') ?? '0.5');
const root = document.getElementById('lab')!;

const modules = import.meta.glob<{ default: World }>('../worlds/*/index.ts');

async function loadWorlds(): Promise<{ id: string; world?: World; error?: string }[]> {
  const entries = Object.entries(modules)
    .map(([path, load]) => ({ id: path.split('/')[2], load }))
    .filter((e) => (worldParam === 'all' ? e.id !== 'example' : e.id === worldParam));
  const out: { id: string; world?: World; error?: string }[] = [];
  for (const e of entries) {
    try {
      out.push({ id: e.id, world: (await e.load()).default });
    } catch (err) {
      out.push({ id: e.id, error: (err as Error).message });
    }
  }
  return out;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function svgBox(inner: string, w: number, h: number, vw = SCENE_W, vh = SCENE_H): string {
  return `<svg viewBox="0 0 ${vw} ${vh}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

function hitOverlay(level: Level): string {
  return level.differences
    .map((d, i) => {
      const first = i < level.findCount;
      const color = first ? '#ff2d87' : '#2d7dff';
      const dash = first ? '' : ' stroke-dasharray="10 7"';
      const s = d.hit;
      let shape = '';
      if (s.type === 'circle') shape = `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}"`;
      else if (s.type === 'ellipse') shape = `<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}"`;
      else if (s.type === 'rect') shape = `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}"`;
      else shape = `<polygon points="${s.points.map((p) => p.join(',')).join(' ')}"`;
      const b = shapeBounds(s);
      const count = d.count
        ? d.count.b.map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="9" fill="#fff" stroke="${color}" stroke-width="3"/><text x="${x}" y="${y + 4}" font-size="11" text-anchor="middle" font-family="sans-serif" fill="${color}">${k + 1}</text>`).join('')
        : '';
      return (
        `${shape} fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-width="4"${dash}/>` +
        `<text x="${b.x + b.w / 2}" y="${b.y - 6}" font-size="20" font-weight="700" text-anchor="middle" font-family="sans-serif" fill="${color}" stroke="#fff" stroke-width="4" paint-order="stroke">${i + 1}. ${esc(d.id)}</text>` +
        count
      );
    })
    .join('');
}

async function diffCanvas(level: Level, w: number, h: number): Promise<HTMLCanvasElement> {
  const a = await rasterize(level.draw({ on: () => false, pick: (_i, x) => x }));
  const allIds = new Set(level.differences.map((d) => d.id));
  const b = await rasterize(level.draw({ on: (id) => allIds.has(id), pick: (id, x, y) => (allIds.has(id) ? y : x) }));
  const canvas = document.createElement('canvas');
  canvas.width = SCENE_W;
  canvas.height = SCENE_H;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext('2d')!;
  const out = ctx.createImageData(SCENE_W, SCENE_H);
  for (let i = 0; i < a.length; i += 4) {
    const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]));
    const grey = (a[i] + a[i + 1] + a[i + 2]) / 3;
    if (d > 10) {
      out.data[i] = 255;
      out.data[i + 1] = 0;
      out.data[i + 2] = 140;
    } else {
      out.data[i] = out.data[i + 1] = out.data[i + 2] = 200 + grey * 0.2;
    }
    out.data[i + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);
  return canvas;
}

async function renderSheet(): Promise<void> {
  const worlds = await loadWorlds();
  const w = Math.round(SCENE_W * scale);
  const h = Math.round(SCENE_H * scale);
  for (const entry of worlds) {
    const section = document.createElement('section');
    if (!entry.world) {
      section.innerHTML = `<h1>${esc(entry.id)}</h1><pre class="err">${esc(entry.error ?? 'failed to load')}</pre>`;
      root.append(section);
      continue;
    }
    const world = entry.world;
    section.innerHTML = `<h1>${esc(world.name)} <small>${esc(world.id)} · ${world.levels.length} levels</small></h1>`;
    root.append(section);
    for (const level of world.levels) {
      if (levelParam && level.id !== levelParam) continue;
      const block = document.createElement('div');
      block.className = 'level';
      const first = new Set(level.differences.slice(0, level.findCount).map((d) => d.id));
      const all = new Set(level.differences.map((d) => d.id));
      let a = '';
      let b = '';
      let hits = '';
      let err = '';
      try {
        a = sceneMarkup(level, new Set(), nextPrefix('a'), true);
        b = sceneMarkup(level, first, nextPrefix('b'), true);
        hits = sceneMarkup(level, all, nextPrefix('h'), true) + `<rect width="800" height="600" fill="#fff" opacity=".35"/>` + hitOverlay(level);
      } catch (e) {
        err = (e as Error).message;
      }
      block.innerHTML =
        `<h2>${esc(level.id)} · ${esc(level.title)} <small>find ${level.findCount} of ${level.differences.length} candidates</small></h2>` +
        (err
          ? `<pre class="err">${esc(err)}</pre>`
          : `<div class="row">` +
            `<figure>${svgBox(a, w, h)}<figcaption>Original</figcaption></figure>` +
            `<figure>${svgBox(b, w, h)}<figcaption>Changed (first play: ${level.findCount})</figcaption></figure>` +
            `<figure>${svgBox(hits, w, h)}<figcaption>All candidates + hit areas (pink = first play, blue = extras)</figcaption></figure>` +
            `<figure class="diff"><figcaption>Pixel difference (all on vs off)</figcaption></figure>` +
            `</div>`) +
        `<ol class="labels">${level.differences
          .map((d) => `<li><b>${esc(d.id)}</b> <i>${d.kind} · ${d.theme}</i> — “${esc(d.label)}” <span>🔊 ${esc(d.say ?? d.label)}</span></li>`)
          .join('')}</ol>` +
        `<div class="sticker">${svgBox(level.sticker.draw(), 140, 140, 200, 200)}<span>${esc(level.sticker.name)}</span></div>`;
      section.append(block);
      if (!err) {
        try {
          block.querySelector('.diff')!.prepend(await diffCanvas(level, w, h));
        } catch (e) {
          block.querySelector('.diff')!.prepend(Object.assign(document.createElement('pre'), { className: 'err', textContent: (e as Error).message }));
        }
      }
    }
    if (!levelParam) {
      const extra = document.createElement('div');
      extra.className = 'level';
      let cover = '';
      try {
        cover = world.cover();
      } catch (e) {
        cover = `<text x="20" y="40">${esc((e as Error).message)}</text>`;
      }
      const map = world.mapArt ? svgBox(world.mapArt(), Math.round(1200 * scale * 0.66), Math.round(800 * scale * 0.66), 1200, 800) : '';
      extra.innerHTML =
        `<h2>World cover, map art & badge</h2><div class="row"><figure>${svgBox(cover, w, h)}<figcaption>Cover</figcaption></figure>` +
        (map ? `<figure>${map}<figcaption>Map art</figcaption></figure>` : '') +
        `<figure>${svgBox(world.badge.draw(), 200, 200, 200, 200)}<figcaption>${esc(world.badge.name)}</figcaption></figure>` +
        `<figure class="swatch" style="background:linear-gradient(${world.theme.sky[0]},${world.theme.sky[1]});color:${world.theme.deep}"><b style="background:${world.theme.accent}">accent</b> theme</figure></div>`;
      section.append(extra);
    }
  }
  document.body.dataset.ready = '1';
}

async function renderValidate(): Promise<void> {
  const worlds = await loadWorlds();
  const reports: WorldReport[] = [];
  let ok = true;
  for (const entry of worlds) {
    if (!entry.world) {
      reports.push({ world: entry.id, errors: [`failed to load: ${entry.error}`], warnings: [], levels: [] });
      ok = false;
      continue;
    }
    const r = await validateWorld(entry.world, levelParam);
    if (r.errors.length || r.levels.some((l) => l.errors.length)) ok = false;
    reports.push(r);
  }
  root.innerHTML = reports
    .map(
      (r) =>
        `<section><h1>${esc(r.world)}</h1>` +
        r.errors.map((e) => `<p class="err">✖ ${esc(e)}</p>`).join('') +
        r.warnings.map((e) => `<p class="warn">⚠ ${esc(e)}</p>`).join('') +
        r.levels
          .map(
            (l) =>
              `<div class="level"><h2>${l.errors.length ? '✖' : '✔'} ${esc(l.level)} · ${esc(l.title)}</h2>` +
              l.errors.map((e) => `<p class="err">✖ ${esc(e)}</p>`).join('') +
              l.warnings.map((e) => `<p class="warn">⚠ ${esc(e)}</p>`).join('') +
              `<table>${l.diffs.map((d) => `<tr><td>${esc(d.id)}</td><td>${d.visiblePx}px visible</td><td>${d.leakPx}px outside</td></tr>`).join('')}</table></div>`,
          )
          .join('') +
        `</section>`,
    )
    .join('');
  window.__report = { ok, worlds: reports };
  document.body.dataset.ready = '1';
}

(mode === 'validate' ? renderValidate() : renderSheet()).catch((e: Error) => {
  root.innerHTML = `<pre class="err">${esc(e.stack ?? e.message)}</pre>`;
  window.__report = { ok: false, worlds: [], fatal: e.message };
  document.body.dataset.ready = '1';
});
