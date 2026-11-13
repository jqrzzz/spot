/**
 * Friendly spoken words for children who are just learning to read (Web Speech API, on-device).
 * Silently does nothing where speech isn't available.
 */
const PREFERRED = ['Samantha', 'Ava', 'Allison', 'Karen', 'Moira', 'Tessa', 'Serena', 'Google US English', 'Google UK English Female', 'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Zira'];

class Voice {
  enabled = true;
  private voice: SpeechSynthesisVoice | null = null;
  private supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  constructor() {
    if (!this.supported) return;
    const pick = () => {
      const voices = speechSynthesis.getVoices().filter((v) => /^en(-|_|$)/i.test(v.lang));
      if (!voices.length) return;
      this.voice =
        PREFERRED.map((name) => voices.find((v) => v.name.includes(name))).find(Boolean) ??
        voices.find((v) => v.localService && /en-(US|GB|AU)/i.test(v.lang)) ??
        voices[0];
    };
    pick();
    speechSynthesis.addEventListener?.('voiceschanged', pick);
  }

  say(text: string, opts: { interrupt?: boolean; rate?: number; pitch?: number } = {}): void {
    if (!this.enabled || !this.supported || !text) return;
    try {
      if (opts.interrupt !== false) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/…/g, ', '));
      if (this.voice) u.voice = this.voice;
      u.lang = this.voice?.lang ?? 'en-US';
      u.rate = opts.rate ?? 0.92;
      u.pitch = opts.pitch ?? 1.12;
      u.volume = 1;
      speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  }

  stop(): void {
    if (!this.supported) return;
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

export const voice = new Voice();
