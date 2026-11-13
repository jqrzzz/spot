/** Lightweight canvas confetti (no library). Returns a stop function. */
import { reducedMotion } from './dom.ts';

const COLORS = ['#FF8FB8', '#FFD66B', '#8CD9FF', '#B79BFF', '#7FDDB0', '#FFB38A', '#FFFFFF'];

interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  vr: number;
  s: number;
  c: string;
  shape: 0 | 1 | 2;
  wob: number;
}

export function confetti(host: HTMLElement, duration = 2800): () => void {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  host.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => canvas.remove();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = host.clientWidth || window.innerWidth;
  const H = host.clientHeight || window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const count = reducedMotion() ? 36 : Math.round(Math.min(170, 90 + W / 10));
  const bits: Bit[] = [];
  for (let i = 0; i < count; i++) {
    const left = i % 2 === 0;
    const speed = 9 + Math.random() * 9;
    const ang = (left ? -60 : -120) + (Math.random() - 0.5) * 40;
    bits.push({
      x: left ? -10 : W + 10,
      y: H * (0.65 + Math.random() * 0.25),
      vx: Math.cos((ang * Math.PI) / 180) * speed * (W / 900 + 0.5),
      vy: Math.sin((ang * Math.PI) / 180) * speed * (H / 700 + 0.4),
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      s: 6 + Math.random() * 7,
      c: COLORS[i % COLORS.length],
      shape: (i % 3) as 0 | 1 | 2,
      wob: Math.random() * 10,
    });
  }

  const start = performance.now();
  let raf = 0;
  const star = (s: number) => {
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const rr = k % 2 ? s * 0.45 : s;
      const a = (k * Math.PI) / 5 - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  };
  const frame = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, W, H);
    const fade = t > duration - 600 ? Math.max(0, (duration - t) / 600) : 1;
    ctx.globalAlpha = fade;
    for (const b of bits) {
      b.vy += 0.32;
      b.vx *= 0.985;
      b.vy *= 0.985;
      b.x += b.vx + Math.sin((t / 300) + b.wob) * 0.6;
      b.y += b.vy;
      b.r += b.vr;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.r);
      ctx.fillStyle = b.c;
      if (b.shape === 0) ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
      else if (b.shape === 1) {
        ctx.beginPath();
        ctx.arc(0, 0, b.s / 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else star(b.s / 1.6);
      ctx.restore();
    }
    if (t < duration) raf = requestAnimationFrame(frame);
    else canvas.remove();
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    canvas.remove();
  };
}
