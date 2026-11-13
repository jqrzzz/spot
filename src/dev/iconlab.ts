/**
 * Identity Lab (dev only): iconlab.html
 *  - default: review sheet — buddies (all moods, 200px and 48px), logo, title art, app icon, UI icons
 *  - ?only=app|maskable|favicon&size=512: renders ONLY that icon, full-bleed, at the given pixel size
 *    (used by scripts/icons.mjs for the PNG exports). window.__favicon holds the favicon SVG source.
 */
import { BUDDIES, type BuddyMood } from '../identity/buddies.ts';
import { ICON_NAMES, icon } from '../identity/icons.ts';
import { appIcon, appIconMaskable, faviconSvg, logo, titleArt } from '../identity/logo.ts';

declare global {
  interface Window {
    __favicon?: string;
  }
}

const params = new URLSearchParams(location.search);
const only = params.get('only');
const size = Number(params.get('size') ?? '512');
const root = document.getElementById('lab')!;

const svg = (inner: string, vw: number, vh: number, w: number, h: number, extra = ''): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" width="${w}" height="${h}" ${extra}>${inner}</svg>`;

const MOODS: BuddyMood[] = ['happy', 'joy', 'love', 'surprised', 'sleepy', 'wink'];

function sheet(): string {
  let html = `<h1>Little Wonder — identity lab</h1>`;

  // Logo on the title art, as the title screen will compose it
  html += `<section data-sec="title">`;
  html += `<h2>Title screen <small>titleArt() 1200×800 with logo() and two player-card placeholders</small></h2>`;
  html +=
    `<div class="row"><div style="position:relative;width:1050px;height:700px;border-radius:18px;overflow:hidden">` +
    svg(titleArt(), 1200, 800, 1050, 700, 'preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0"') +
    `<div style="position:absolute;left:50%;top:36px;transform:translateX(-50%)">${svg(logo(), 600, 260, 520, 225)}</div>` +
    `<div style="position:absolute;left:50%;top:300px;transform:translateX(-50%);display:flex;gap:40px">` +
    ['zing', 'puff']
      .map((id) => {
        const b = BUDDIES.find((x) => x.id === id)!;
        return `<div style="width:230px;height:290px;border-radius:32px;background:#fff;box-shadow:0 10px 30px #3d2c5222;display:grid;place-items:center;border:6px solid ${b.color}">${svg(b.draw('happy'), 200, 200, 190, 190)}<div style="font-size:30px;font-weight:600;margin-top:-30px">${id === 'zing' ? 'Jett' : 'June'}</div></div>`;
      })
      .join('') +
    `</div></div>` +
    `<div style="position:relative;width:330px;height:700px;border-radius:18px;overflow:hidden">` +
    svg(titleArt(), 1200, 800, 330, 700, 'preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0"') +
    `<div style="position:absolute;left:50%;top:30px;transform:translateX(-50%)">${svg(logo(), 600, 260, 300, 130)}</div>` +
    `</div></div>`;

  html += `</section><section data-sec="logo">`;
  html += `<h2>Logo <small>on white and on lilac</small></h2><div class="row">`;
  html += `<div class="card">${svg(logo(), 600, 260, 600, 260)}</div>`;
  html += `<div class="card" style="background:#E9DEFF">${svg(logo(), 600, 260, 300, 130)}</div>`;
  html += `<div class="card" style="background:#DDF0FF">${svg(logo(), 600, 260, 200, 87)}</div>`;
  html += `</div>`;

  html += `</section><section data-sec="buddies">`;
  html += `<h2>Buddies <small>draw(mood) at 200px</small></h2>`;
  for (const b of BUDDIES) {
    html += `<div class="row" style="margin-bottom:10px">`;
    for (const m of MOODS) {
      html += `<div><div class="buddy" style="background:${b.soft}">${svg(b.draw(m), 200, 200, 200, 200)}</div><div class="cap">${b.name} · ${m}</div></div>`;
    }
    html += `</div>`;
  }

  html += `</section><section data-sec="small">`;
  html += `<h2>Buddies at 48px <small>top-bar hint helper</small></h2>`;
  for (const bg of ['#FFFFFF', '#FBE7F3', '#5B4A7E']) {
    html += `<div class="bar" style="background:${bg};margin-bottom:8px">`;
    for (const b of BUDDIES) for (const m of ['happy', 'joy', 'love'] as BuddyMood[]) html += svg(b.draw(m), 200, 200, 48, 48);
    html += `</div>`;
  }
  html += `<h2>Avatars at 150px <small>profile cards</small></h2><div class="row">`;
  for (const b of BUDDIES) {
    html += `<div style="width:170px;height:170px;border-radius:50%;background:${b.soft};display:grid;place-items:center;box-shadow:inset 0 0 0 6px ${b.color}">${svg(b.draw('happy'), 200, 200, 150, 150)}</div>`;
  }
  html += `</div>`;

  html += `</section><section data-sec="app">`;
  html += `<h2>App icon <small>512 (rounded preview), maskable (circle crop), small sizes, favicon</small></h2><div class="row">`;
  html += `<div><div class="sq">${svg(appIcon(), 512, 512, 300, 300)}</div><div class="cap">appIcon()</div></div>`;
  html += `<div><div class="mask">${svg(appIconMaskable(), 512, 512, 300, 300)}</div><div class="cap">maskable, circle crop</div></div>`;
  html += `<div><div style="position:relative">${svg(appIcon(), 512, 512, 300, 300)}<div style="position:absolute;inset:30px;border:2px dashed #f0f;border-radius:50%"></div></div><div class="cap">80% safe zone</div></div>`;
  html += `<div><div class="sq">${svg(appIcon(), 512, 512, 96, 96)}</div><div class="cap">96</div></div>`;
  html += `<div><div class="sq">${svg(appIcon(), 512, 512, 48, 48)}</div><div class="cap">48</div></div>`;
  const fav = faviconSvg();
  for (const s of [64, 32, 16]) html += `<div><img src="data:image/svg+xml,${encodeURIComponent(fav)}" width="${s}" height="${s}"/><div class="cap">fav ${s}</div></div>`;
  html += `</div>`;

  html += `</section><section data-sec="icons">`;
  html += `<h2>UI icons <small>icon(name), currentColor — 40px and 24px</small></h2>`;
  const swatches: Array<[string, string, string]> = [
    ['#FFFFFF', '#3D2C52', ''],
    ['#FF8FB8', '#FFFFFF', 'btn'],
    ['#8FD0FF', '#FFFFFF', 'btn'],
    ['#FFF4D6', '#9C6A1E', ''],
  ];
  for (const [bg, fg, cls] of swatches) {
    html += `<div class="icons" style="margin-bottom:10px">`;
    for (const name of ICON_NAMES) html += `<div class="ic ${cls}" title="${name}" style="background:${bg};color:${fg}">${icon(name)}</div>`;
    html += `</div>`;
  }
  html += `<div class="icons" style="margin-bottom:10px">`;
  for (const name of ICON_NAMES) html += `<div class="ic sm" style="background:#fff;color:#3D2C52">${icon(name)}</div>`;
  html += `</div><div class="icons">`;
  for (const name of ICON_NAMES) html += `<div class="cap" style="width:64px">${name}</div>`;
  html += `</div>`;

  html += `</section><section data-sec="art">`;
  html += `<h2>Title art alone</h2>${svg(titleArt(), 1200, 800, 1200, 800, 'style="border-radius:18px"')}</section>`;
  return html;
}

window.__favicon = faviconSvg();

if (only) {
  document.body.classList.add('only');
  const art = only === 'maskable' ? appIconMaskable() : only === 'favicon' ? '' : appIcon();
  root.innerHTML =
    only === 'favicon'
      ? `<img src="data:image/svg+xml,${encodeURIComponent(faviconSvg())}" width="${size}" height="${size}" style="display:block"/>`
      : svg(art, 512, 512, size, size);
} else {
  root.innerHTML = sheet();
}

document.fonts.ready.then(() => {
  document.body.dataset.ready = '1';
});
