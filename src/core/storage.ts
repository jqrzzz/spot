/**
 * Local-only persistence. Everything lives in localStorage on this device; if storage is
 * unavailable (private mode, quota) the game keeps working in memory.
 */
import type { BuddyId } from '../identity/buddies.ts';
import { BUDDIES } from '../identity/buddies.ts';

export interface Profile {
  id: string;
  name: string;
  buddy: BuddyId;
}

export interface LevelRecord {
  plays: number;
  firstAt: number;
  lastAt: number;
}

/** A level that was started but not finished, so a reload can resume it. */
export interface InProgress {
  levelId: string;
  play: number;
  seed: number;
  found: string[];
}

export interface ProfileProgress {
  levels: Record<string, LevelRecord>;
  /** Sticker and badge ids earned. */
  stickers: string[];
  current: InProgress | null;
}

export interface Settings {
  sfx: boolean;
  music: boolean;
  voice: boolean;
}

interface SaveData {
  v: 1;
  profiles: Profile[];
  progress: Record<string, ProfileProgress>;
  settings: Settings;
}

const KEY = 'little-wonder/v1';
const BUDDY_IDS = new Set<string>(BUDDIES.map((b) => b.id));

const emptyProgress = (): ProfileProgress => ({ levels: {}, stickers: [], current: null });

function defaults(): SaveData {
  return {
    v: 1,
    profiles: [
      { id: 'jett', name: 'Jett', buddy: 'zing' },
      { id: 'june', name: 'June', buddy: 'puff' },
    ],
    progress: { jett: emptyProgress(), june: emptyProgress() },
    settings: { sfx: true, music: true, voice: true },
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Defensive parse: anything malformed falls back to sensible defaults instead of crashing. */
function sanitize(raw: unknown): SaveData {
  const base = defaults();
  if (!isObj(raw) || raw.v !== 1) return base;
  const profiles: Profile[] = Array.isArray(raw.profiles)
    ? raw.profiles
        .filter(isObj)
        .map((p) => ({
          id: String(p.id ?? '').slice(0, 40),
          name: String(p.name ?? '').slice(0, 24) || 'Friend',
          buddy: (BUDDY_IDS.has(String(p.buddy)) ? String(p.buddy) : 'puff') as BuddyId,
        }))
        .filter((p) => p.id)
    : [];
  const progress: Record<string, ProfileProgress> = {};
  const rawProgress = isObj(raw.progress) ? raw.progress : {};
  for (const p of profiles) {
    const r = rawProgress[p.id];
    if (!isObj(r)) {
      progress[p.id] = emptyProgress();
      continue;
    }
    const levels: Record<string, LevelRecord> = {};
    if (isObj(r.levels))
      for (const [k, v] of Object.entries(r.levels))
        if (isObj(v)) levels[k] = { plays: Math.max(1, Number(v.plays) || 1), firstAt: Number(v.firstAt) || 0, lastAt: Number(v.lastAt) || 0 };
    const cur = isObj(r.current) && typeof r.current.levelId === 'string'
      ? {
          levelId: r.current.levelId,
          play: Number(r.current.play) || 0,
          seed: Number(r.current.seed) || 1,
          found: Array.isArray(r.current.found) ? r.current.found.map(String) : [],
        }
      : null;
    progress[p.id] = { levels, stickers: Array.isArray(r.stickers) ? [...new Set(r.stickers.map(String))] : [], current: cur };
  }
  const s = isObj(raw.settings) ? raw.settings : {};
  return {
    v: 1,
    profiles: profiles.length ? profiles : base.profiles,
    progress: profiles.length ? progress : base.progress,
    settings: { sfx: s.sfx !== false, music: s.music !== false, voice: s.voice !== false },
  };
}

function read(): SaveData {
  try {
    const txt = localStorage.getItem(KEY);
    return txt ? sanitize(JSON.parse(txt)) : defaults();
  } catch {
    return defaults();
  }
}

let data = read();
let timer = 0;

function persist(now = false): void {
  const write = () => {
    timer = 0;
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable: keep playing in memory */
    }
  };
  if (now) {
    if (timer) clearTimeout(timer);
    write();
    return;
  }
  if (!timer) timer = window.setTimeout(write, 120);
}

// Make sure nothing is lost when the tab is hidden or closed.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => persist(true));
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && persist(true));
}

export const store = {
  get profiles(): Profile[] {
    return data.profiles;
  },
  profile(id: string): Profile | undefined {
    return data.profiles.find((p) => p.id === id);
  },
  progress(id: string): ProfileProgress {
    return (data.progress[id] ??= emptyProgress());
  },
  get settings(): Settings {
    return data.settings;
  },
  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
    data.settings[key] = value;
    persist();
  },
  isDone(pid: string, levelId: string): boolean {
    return !!this.progress(pid).levels[levelId];
  },
  plays(pid: string, levelId: string): number {
    return this.progress(pid).levels[levelId]?.plays ?? 0;
  },
  hasSticker(pid: string, stickerId: string): boolean {
    return this.progress(pid).stickers.includes(stickerId);
  },
  /** Records a completed level. Returns true when the sticker is new. */
  completeLevel(pid: string, levelId: string, stickerId: string): boolean {
    const pr = this.progress(pid);
    const now = Date.now();
    const rec = pr.levels[levelId];
    pr.levels[levelId] = rec ? { ...rec, plays: rec.plays + 1, lastAt: now } : { plays: 1, firstAt: now, lastAt: now };
    pr.current = null;
    const isNew = !pr.stickers.includes(stickerId);
    if (isNew) pr.stickers.push(stickerId);
    persist(true);
    return isNew;
  },
  /** Awards a badge once. Returns true when newly earned. */
  award(pid: string, badgeId: string): boolean {
    const pr = this.progress(pid);
    if (pr.stickers.includes(badgeId)) return false;
    pr.stickers.push(badgeId);
    persist(true);
    return true;
  },
  setCurrent(pid: string, cur: InProgress | null): void {
    this.progress(pid).current = cur;
    persist();
  },
  addProfile(name: string, buddy: BuddyId): Profile {
    const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'friend';
    let id = base;
    for (let i = 2; data.profiles.some((p) => p.id === id); i++) id = `${base}-${i}`;
    const p: Profile = { id, name: name.trim().slice(0, 24) || 'Friend', buddy };
    data.profiles.push(p);
    data.progress[id] = emptyProgress();
    persist(true);
    return p;
  },
  updateProfile(id: string, patch: Partial<Pick<Profile, 'name' | 'buddy'>>): void {
    const p = this.profile(id);
    if (!p) return;
    if (patch.name !== undefined) p.name = patch.name.trim().slice(0, 24) || p.name;
    if (patch.buddy) p.buddy = patch.buddy;
    persist(true);
  },
  removeProfile(id: string): void {
    if (data.profiles.length <= 1) return;
    data.profiles = data.profiles.filter((p) => p.id !== id);
    delete data.progress[id];
    persist(true);
  },
  resetProgress(id: string): void {
    data.progress[id] = emptyProgress();
    persist(true);
  },
};
