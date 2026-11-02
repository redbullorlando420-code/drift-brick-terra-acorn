import {profileLocalStorage as localStorage} from "./local-profile-storage.ts";
export type PullSettings = {
  requestGapMs: number;
  youtubeRequestGapMs: number;
  concurrentRequests: number;
  youtubeBatchVideos: number;
  youtubeSourcesPerSweep: number;
  youtubeIntervalSeconds: number;
  adultBatchVideos: number;
  adultIntervalSeconds: number;
  adultCatalogTarget: number;
  automaticPulls: boolean;
  pauseWhileWatching: boolean;
  remoteMaxEntries: number;
  sharedCapCleanup: boolean;
  youtubeMaxEntries: number;
  youtubeAutoCleanup: boolean;
  youtubeCleanupBatch: number;
  youtubeCleanupMinAgeDays: number;
  twitchMaxEntries: number;
  twitchAutoCleanup: boolean;
  twitchCleanupBatch: number;
  twitchCleanupMinAgeDays: number;
  adultMaxEntries: number;
  adultAutoCleanup: boolean;
  adultCleanupBatch: number;
  adultCleanupMinAgeDays: number;
  otherMaxEntries: number;
};
export const DEFAULT_PULL_SETTINGS: Readonly<PullSettings> = Object.freeze({
  requestGapMs: 1500, youtubeRequestGapMs: 80, concurrentRequests: 1, youtubeBatchVideos: 100,
  youtubeSourcesPerSweep: 32, youtubeIntervalSeconds: 300, adultBatchVideos: 10_000,
  adultIntervalSeconds: 60, adultCatalogTarget: 250_000,
  automaticPulls: true, pauseWhileWatching: true, sharedCapCleanup: true,
  remoteMaxEntries: 500_000, youtubeMaxEntries: 100_000, twitchMaxEntries: 25_000,
  adultMaxEntries: 300_000, otherMaxEntries: 25_000,
  youtubeAutoCleanup: true, youtubeCleanupBatch: 100, youtubeCleanupMinAgeDays: 30,
  twitchAutoCleanup: true, twitchCleanupBatch: 100, twitchCleanupMinAgeDays: 30,
  adultAutoCleanup: true, adultCleanupBatch: 100, adultCleanupMinAgeDays: 30,
});
const limits: Record<Exclude<keyof PullSettings, 'automaticPulls' | 'pauseWhileWatching' | 'sharedCapCleanup' | 'youtubeAutoCleanup' | 'twitchAutoCleanup' | 'adultAutoCleanup'>, [number, number]> = {
  requestGapMs: [250, 60_000], youtubeRequestGapMs: [0, 60_000], concurrentRequests: [1, 3], youtubeBatchVideos: [30, 500],
  youtubeSourcesPerSweep: [1, 1024], youtubeIntervalSeconds: [60, 3600], adultBatchVideos: [20, 50_000],
  adultIntervalSeconds: [30, 3600], adultCatalogTarget: [1000, 1_000_000],
  remoteMaxEntries: [0, 1_000_000], youtubeMaxEntries: [0, 1_000_000], twitchMaxEntries: [0, 1_000_000],
  adultMaxEntries: [0, 1_000_000], otherMaxEntries: [0, 1_000_000],
  youtubeCleanupBatch: [1, 1000], youtubeCleanupMinAgeDays: [0, 3650],
  twitchCleanupBatch: [1, 1000], twitchCleanupMinAgeDays: [0, 3650],
  adultCleanupBatch: [1, 1000], adultCleanupMinAgeDays: [0, 3650],
};
export function normalizePullSettings(raw: unknown): PullSettings {
  const input = raw && typeof raw === 'object' ? raw as Partial<PullSettings> : {};
  const next = { ...DEFAULT_PULL_SETTINGS };
  for (const key of Object.keys(limits) as Array<keyof typeof limits>) {
    const value = Number(input[key]);
    if (input[key] !== undefined && Number.isFinite(value)) next[key] = Math.max(limits[key][0], Math.min(limits[key][1], Math.floor(value)));
  }
  for (const key of ['automaticPulls', 'pauseWhileWatching', 'sharedCapCleanup', 'youtubeAutoCleanup', 'twitchAutoCleanup', 'adultAutoCleanup'] as const) if (typeof input[key] === 'boolean') next[key] = input[key];
  return next;
}
export function adultGrowthPreset(current: Readonly<PullSettings>): Partial<PullSettings> {
  const adultMaxEntries = current.adultMaxEntries === 0 ? 0 : Math.max(current.adultMaxEntries, 300_000);
  return { adultBatchVideos: Math.max(current.adultBatchVideos, 10_000), adultIntervalSeconds: Math.min(current.adultIntervalSeconds, 60),
    adultCatalogTarget: Math.max(current.adultCatalogTarget, 250_000), adultMaxEntries,
    remoteMaxEntries: current.remoteMaxEntries === 0 ? 0 : Math.min(1_000_000, Math.max(current.remoteMaxEntries, adultMaxEntries + current.youtubeMaxEntries + current.twitchMaxEntries + current.otherMaxEntries)) };
}
const KEY = 'reelcase.pull-settings.v1';
let settings = DEFAULT_PULL_SETTINGS;
let hydrated = false;
const listeners = new Set<() => void>();
export function getPullSettings(): Readonly<PullSettings> {
  if (!hydrated && typeof window !== 'undefined') {
    hydrated = true;
    try { settings = Object.freeze(normalizePullSettings(JSON.parse(localStorage.getItem(KEY) ?? 'null'))); } catch { /* Defaults remain usable. */ }
  }
  return settings;
}
export const subscribePullSettings = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function updatePullSettings(patch: Partial<PullSettings>) {
  settings = Object.freeze(normalizePullSettings({ ...getPullSettings(), ...patch }));
  let saved=true;
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { saved=false; /* Session settings still apply. */ }
  for (const listener of listeners) listener();
  return saved;
}
if (typeof window !== 'undefined') {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    try { settings = Object.freeze(normalizePullSettings(JSON.parse(event.newValue ?? 'null'))); }
    catch { settings = DEFAULT_PULL_SETTINGS; }
    hydrated = true;
    for (const listener of listeners) listener();
  };
  window.addEventListener('storage', onStorage);
  import.meta.hot?.dispose(() => window.removeEventListener('storage', onStorage));
}
