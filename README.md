# Little Wonder — A World of Tiny Discoveries

An original, ad-free spot-the-difference game for young children (first made for Jett and June).
Children compare two illustrations, tap what is different, and collect stickers — quietly practising
counting, colours, shapes, patterns, feelings, left & right, seasons and symmetry along the way.

- **Three worlds:** Rainbow Valley · Monster Pop Academy · Frostlight Kingdom (5 pictures each)
- **Pressure-free:** no timers, no lives, no scores, no ads, no accounts. Wrong taps are silent.
- **Made for small hands:** big forgiving tap areas, synced pinch-zoom on both pictures, a buddy who gives gentle hints.
- **Learns while playing:** each discovery is spoken aloud ("Three apples… and four apples!") and counting
  differences pop number badges in both pictures.
- **Works everywhere:** phones, tablets and desktop; installable to the home screen; plays offline after the first visit.
- **Private by design:** progress lives only in the device's local storage.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173  (level lab: /lab.html)
```

```bash
npm run build      # type-check + production build into dist/
```

## Quality gates

| command | what it checks |
| --- | --- |
| `npm test` | unit tests for tap detection, round planning, namespacing and saving |
| `npm run validate` | renders every level and compares pixels: each difference must be clearly visible, nothing may change outside its tap area, tap areas never overlap |
| `npm run playtest` | a robot child plays on iPad, phone and desktop sizes (taps, misses, zoom/pinch, resume after reload, celebration, sticker book) |
| `npm run prodcheck` | serves the production build with the real security headers and checks it loads, plays and works offline |
| `npm run snap -- --world rainbow-valley --level rv-1 --out sheet.png` | contact sheet for visual review |

## How a level works

Each level is **one** illustration drawn by code (`draw(ctx)` returns SVG for a 800×600 scene). The game
renders it twice with different difference switches, so the two pictures are identical by construction
except for the intended differences. Each difference declares its tap area explicitly; taps are never
judged by comparing images at play time.

```ts
const level: Level = {
  id: 'rv-1',
  title: 'Picnic on Apple Hill',
  findCount: 3, // found per play; extra candidates make replays fresh
  differences: [
    { id: 'apples', kind: 'count', theme: 'counting', hit: { type: 'circle', cx: 610, cy: 240, r: 70 },
      label: '3 apples and 4 apples', say: 'Three apples… and four apples!',
      count: { a: [...], b: [...] } },
    // …
  ],
  draw: (c) => `…${tree(c.pick('apples', 3, 4))}…`,
  sticker: { id: 'st-rv-1', name: 'Apple Puffcorn', draw: () => '…' },
};
```

Contracts live in `src/core/types.ts`; shared art primitives (palette, the family `face()`, clouds, rainbows,
sparkles…) in `src/art/kit.ts`; worlds in `src/worlds/<world>/`. See `src/worlds/example/` for a compact pattern.

## Project layout

```
src/core      types, hit-testing, round planning, storage, audio synth, voice
src/art       shared SVG art kit
src/worlds    the three worlds (characters, props, levels, covers, stickers)
src/identity  buddies, logo, title art, UI icons
src/screens   home, worlds, map, play, celebration, sticker book, grown-ups panel
src/ui        router, DOM helpers, confetti, sticker frames
src/dev       level lab + validator (dev only, never shipped)
public        manifest, service worker, icons, font
```

Fonts: Fredoka (SIL Open Font License, `public/fonts/OFL-Fredoka.txt`). All artwork is original.
