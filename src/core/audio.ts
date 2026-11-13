/**
 * All sound is synthesised with the Web Audio API: no audio files to download, instant start.
 * Gentle bells for discoveries, soft pops for buttons, and a quiet music-box loop per world.
 * Wrong taps make no sound by design.
 */
import type { MusicStyle } from './types.ts';

export type Track = MusicStyle | 'home';

const midi = (m: number): number => 440 * Math.pow(2, (m - 69) / 12);

interface Song {
  bpm: number;
  /** Chord per bar as MIDI notes (root first). */
  chords: number[][];
  /** Called for every eighth-note step with the step's audio time. */
  play(step: number, chord: number[], t: number, beat: number): void;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private noiseBuf: AudioBuffer | null = null;
  private sfxOn = true;
  private musicOn = true;
  private track: Track | null = null;
  private song: Song | null = null;
  private timer = 0;
  private nextTime = 0;
  private step = 0;
  private duckLevel = 1;

  /** Must be called from a user gesture (tap/click/key) before any sound can play. */
  unlock(): void {
    if (!this.ctx) {
      const AC: typeof AudioContext | undefined = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC({ latencyHint: 'interactive' });
      } catch {
        return;
      }
      const ctx = this.ctx;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      this.master = ctx.createGain();
      this.master.gain.value = 0.85;
      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = this.sfxOn ? 1 : 0;
      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = 0;
      this.sfxBus.connect(this.master);
      this.musicBus.connect(this.master);
      this.master.connect(comp).connect(ctx.destination);
      const len = Math.floor(ctx.sampleRate * 0.5);
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      let seed = 7;
      for (let i = 0; i < len; i++) {
        seed = (seed * 16807) % 2147483647;
        d[i] = (seed / 2147483647) * 2 - 1;
      }
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.visibilityState === 'hidden') this.ctx.suspend().catch(() => {});
        else this.ctx.resume().catch(() => {});
      });
    }
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    if (this.track && !this.timer) this.startSequencer();
  }

  get ready(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }

  setSfx(on: boolean): void {
    this.sfxOn = on;
    if (this.ctx) this.sfxBus.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.02);
  }

  setMusic(on: boolean): void {
    this.musicOn = on;
    this.applyMusicLevel(0.3);
  }

  /** Lower the music while the child is concentrating. */
  duck(level: number): void {
    this.duckLevel = level;
    this.applyMusicLevel(0.6);
  }

  private applyMusicLevel(tc: number): void {
    if (!this.ctx) return;
    const target = this.musicOn && this.track ? 0.42 * this.duckLevel : 0;
    this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicBus.gain.setTargetAtTime(target, this.ctx.currentTime, tc);
  }

  /* ------------------------------------------------------------ instruments */

  private voice(type: OscillatorType, freq: number, t: number, attack: number, decay: number, peak: number, bus: AudioNode, glideTo?: number): void {
    const ctx = this.ctx;
    if (!ctx || peak <= 0) return;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + attack + decay * 0.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + attack + decay + 0.05);
  }

  /** Music-box / celesta bell. */
  private bell(freq: number, t: number, decay = 1.1, peak = 0.16, bus: AudioNode = this.sfxBus): void {
    this.voice('sine', freq, t, 0.004, decay, peak, bus);
    this.voice('sine', freq * 2, t, 0.004, decay * 0.45, peak * 0.32, bus);
    this.voice('triangle', freq * 3.01, t, 0.003, decay * 0.18, peak * 0.1, bus);
  }

  private noise(t: number, dur: number, peak: number, filter: BiquadFilterType, from: number, to: number, bus: AudioNode = this.sfxBus): void {
    const ctx = this.ctx;
    if (!ctx || !this.noiseBuf) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(bus);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  private now(): number | null {
    if (!this.ctx || this.ctx.state !== 'running' || !this.sfxOn) return null;
    return this.ctx.currentTime + 0.01;
  }

  /* ------------------------------------------------------------ sound effects */

  /** Soft, squishy button press. */
  tap(): void {
    const t = this.now();
    if (t === null) return;
    this.voice('sine', 560, t, 0.005, 0.12, 0.13, this.sfxBus, 360);
    this.voice('triangle', 1120, t, 0.003, 0.05, 0.03, this.sfxBus);
  }

  /** A discovery: rising pentatonic bell + sparkle trill. `index` = how many found so far (0-based). */
  found(index: number): void {
    const t = this.now();
    if (t === null) return;
    const scale = [72, 74, 76, 79, 81, 84, 86, 88];
    const m = scale[Math.min(index, scale.length - 1)];
    this.bell(midi(m), t, 1.2, 0.2);
    this.bell(midi(m + 7), t + 0.08, 1.0, 0.13);
    [12, 16, 19, 24].forEach((iv, k) => this.voice('sine', midi(m + iv), t + 0.16 + k * 0.045, 0.003, 0.25, 0.045, this.sfxBus));
    this.noise(t, 0.35, 0.025, 'highpass', 6000, 9000);
  }

  /** Counting tick: 1, 2, 3… rising. */
  count(k: number): void {
    const t = this.now();
    if (t === null) return;
    const scale = [76, 79, 81, 84, 86, 88, 91];
    this.voice('sine', midi(scale[Math.min(k, scale.length - 1)]), t, 0.004, 0.22, 0.11, this.sfxBus);
    this.voice('triangle', 2400, t, 0.002, 0.03, 0.02, this.sfxBus);
  }

  /** Gentle "look here" shimmer for hints. */
  hint(): void {
    const t = this.now();
    if (t === null) return;
    this.noise(t, 0.6, 0.04, 'bandpass', 500, 3200);
    this.bell(midi(88), t + 0.25, 0.9, 0.07);
    this.bell(midi(91), t + 0.38, 0.9, 0.06);
  }

  /** Level complete. */
  fanfare(): void {
    const t = this.now();
    if (t === null) return;
    [72, 76, 79, 84].forEach((m, i) => this.bell(midi(m), t + i * 0.12, 1.1, 0.17));
    [72, 76, 79, 84, 88].forEach((m) => this.bell(midi(m), t + 0.56, 2.2, 0.08));
    [96, 93, 91, 88, 91, 96, 100].forEach((m, i) => this.voice('sine', midi(m), t + 0.7 + i * 0.07, 0.003, 0.3, 0.035, this.sfxBus));
    this.noise(t + 0.5, 1.2, 0.03, 'highpass', 5000, 9000);
  }

  /** A sticker or badge appears. */
  reward(): void {
    const t = this.now();
    if (t === null) return;
    [79, 81, 84, 86, 88, 91, 93, 96].forEach((m, i) => this.bell(midi(m), t + i * 0.045, 0.6, 0.07));
    this.bell(midi(96), t + 0.42, 1.6, 0.14);
    this.bell(midi(91), t + 0.42, 1.6, 0.08);
  }

  /** Soft whoosh for screen changes. */
  whoosh(): void {
    const t = this.now();
    if (t === null) return;
    this.noise(t, 0.35, 0.018, 'bandpass', 700, 2600);
  }

  /* ------------------------------------------------------------ music */

  /** Switch the background loop (null = silence). Crossfades. */
  music(track: Track | null): void {
    if (track === this.track) return;
    this.track = track;
    if (!this.ctx) return;
    const ctx = this.ctx;
    this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
    this.musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    window.setTimeout(() => {
      if (this.track !== track) return;
      this.song = track ? SONGS[track](this) : null;
      this.step = 0;
      this.nextTime = ctx.currentTime + 0.1;
      this.applyMusicLevel(0.5);
      if (track && !this.timer) this.startSequencer();
    }, 450);
  }

  private startSequencer(): void {
    if (!this.ctx || this.timer) return;
    if (!this.song && this.track) this.song = SONGS[this.track](this);
    this.nextTime = Math.max(this.nextTime, this.ctx.currentTime + 0.1);
    this.applyMusicLevel(0.5);
    this.timer = window.setInterval(() => this.schedule(), 60);
  }

  private schedule(): void {
    const ctx = this.ctx;
    const song = this.song;
    if (!ctx || !song) return;
    if (ctx.state !== 'running') return;
    const eighth = 60 / song.bpm / 2;
    // If we fell far behind (tab was hidden), jump ahead instead of spamming notes.
    if (this.nextTime < ctx.currentTime - 0.5) this.nextTime = ctx.currentTime + 0.05;
    while (this.nextTime < ctx.currentTime + 0.3) {
      const bar = Math.floor(this.step / 8) % song.chords.length;
      if (this.musicOn) song.play(this.step, song.chords[bar], this.nextTime, this.step % 8);
      this.nextTime += eighth;
      this.step++;
    }
  }

  /* Instrument access for songs */
  mBell(m: number, t: number, decay: number, peak: number): void {
    this.bell(midi(m), t, decay, peak, this.musicBus);
  }
  mTone(type: OscillatorType, m: number, t: number, attack: number, decay: number, peak: number): void {
    this.voice(type, midi(m), t, attack, decay, peak, this.musicBus);
  }
  mHat(t: number, peak: number): void {
    this.noise(t, 0.05, peak, 'highpass', 7000, 9000, this.musicBus);
  }
}

/* ------------------------------------------------------------ songs */

type SongFactory = (a: AudioEngine) => Song;

const SONGS: Record<Track, SongFactory> = {
  // Lullaby music box (C major): home screen.
  home: (a) => ({
    bpm: 84,
    chords: [
      [48, 60, 64, 67],
      [45, 57, 60, 64],
      [41, 53, 57, 60],
      [43, 55, 59, 62],
    ],
    play(step, ch, t, beat) {
      const arp = [0, 1, 2, 3, 2, 1, 2, 3];
      const tones = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[1] + 24];
      a.mBell(tones[arp[beat]], t, 1.3, beat === 0 ? 0.075 : 0.05);
      if (beat === 0) a.mTone('sine', ch[0], t, 0.02, 1.6, 0.07);
      if (beat === 4) a.mTone('sine', ch[0] + 7, t, 0.02, 1.2, 0.045);
      const phrase = Math.floor(step / 32) % 2;
      if (phrase === 1 && (beat === 0 || beat === 5)) a.mBell(tones[(step >> 3) % 4] + 12, t, 1.8, 0.035);
    },
  }),
  // Rainbow Valley: bright, skipping music box.
  valley: (a) => ({
    bpm: 96,
    chords: [
      [48, 60, 64, 67],
      [45, 57, 60, 64],
      [41, 53, 57, 60],
      [43, 55, 59, 62],
      [48, 60, 64, 67],
      [45, 57, 60, 64],
      [41, 53, 57, 60],
      [43, 55, 59, 62],
    ],
    play(step, ch, t, beat) {
      const pat = Math.floor(step / 64) % 2 === 0 ? [0, 2, 1, 3, 2, 1, 3, 2] : [0, 1, 2, 3, 3, 2, 1, 2];
      const tones = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[1] + 24];
      a.mBell(tones[pat[beat]], t, 1.0, 0.05);
      if (beat === 0 || beat === 4) a.mTone('sine', beat === 0 ? ch[0] : ch[0] + 12, t, 0.015, 0.9, 0.065);
      // little melody on bars 5–8
      const bar = Math.floor(step / 8) % 8;
      const mel: Record<number, number[]> = { 4: [88, -1, 91, -1, 93, -1, 91, -1], 5: [88, -1, -1, 84, 86, -1, -1, -1], 6: [84, -1, 81, -1, 84, -1, 89, -1], 7: [88, -1, 86, -1, -1, -1, -1, -1] };
      const m = mel[bar]?.[beat];
      if (m && m > 0) a.mBell(m, t, 1.4, 0.05);
    },
  }),
  // Monster Pop Academy: soft pop groove (I–V–vi–IV in F).
  pop: (a) => ({
    bpm: 104,
    chords: [
      [41, 65, 69, 72],
      [48, 64, 67, 72],
      [50, 65, 69, 74],
      [46, 65, 70, 74],
    ],
    play(step, ch, t, beat) {
      const bass = [ch[0], -1, -1, ch[0] + 12, ch[0], -1, ch[0] + 7, -1];
      if (bass[beat] > 0) a.mTone('triangle', bass[beat], t, 0.01, 0.32, 0.12);
      if (beat === 2 || beat === 6) ch.slice(1).forEach((m) => a.mTone('triangle', m, t, 0.005, 0.18, 0.028));
      a.mHat(t, beat % 2 === 0 ? 0.012 : 0.007);
      const hook = [84, -1, 81, 84, 86, -1, 84, -1];
      if (Math.floor(step / 32) % 2 === 1 && hook[beat] > 0) a.mBell(hook[beat] + (ch[0] === 46 ? -2 : 0), t, 0.7, 0.04);
    },
  }),
  // Frostlight Kingdom: slow celesta with shimmering high notes.
  frost: (a) => ({
    bpm: 72,
    chords: [
      [50, 66, 69, 73],
      [47, 62, 66, 69],
      [43, 62, 66, 71],
      [45, 64, 67, 73],
    ],
    play(step, ch, t, beat) {
      if (beat % 2 === 0) a.mBell(ch[1 + ((beat / 2) % 3)] + 12, t, 2.2, 0.05);
      if (beat === 0) {
        a.mTone('sine', ch[0], t, 0.4, 3.2, 0.05);
        a.mTone('sine', ch[0] + 12, t, 0.6, 3.0, 0.025);
      }
      const sparkle = (step * 7) % 23;
      if (beat === 5 && sparkle < 9) a.mBell(ch[3] + 24, t, 1.6, 0.025);
    },
  }),
};

export const sound = new AudioEngine();

/** Tiny vibration on devices that support it (Android). */
export function buzz(ms = 12): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* unsupported */
  }
}
