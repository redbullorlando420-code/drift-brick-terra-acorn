export type PullSettings = {
  requestGapMs: number;
  concurrentRequests: number;
  youtubeBatchVideos: number;
  youtubeSourcesPerSweep: number;
  youtubeIntervalSeconds: number;
  adultBatchVideos: number;
  adultIntervalSeconds: number;
  adultCatalogTarget: number;
  automaticPulls: boolean;
  pauseWhileWatching: boolean;
};
export const DEFAULT_PULL_SETTINGS: Readonly<PullSettings> = Object.freeze({
  requestGapMs: 1500, concurrentRequests: 1, youtubeBatchVideos: 100,
  youtubeSourcesPerSweep: 32, youtubeIntervalSeconds: 300, adultBatchVideos: 160,
  adultIntervalSeconds: 120, adultCatalogTarget: 100_000,
  automaticPulls: true, pauseWhileWatching: true,
});
const limits: Record<Exclude<keyof PullSettings, 'automaticPulls' | 'pauseWhileWatching'>, [number, number]> = {
  requestGapMs: [250, 60_000], concurrentRequests: [1, 3], youtubeBatchVideos: [30, 500],
  youtubeSourcesPerSweep: [1, 1024], youtubeIntervalSeconds: [60, 3600], adultBatchVideos: [20, 1000],
  adultIntervalSeconds: [30, 3600], adultCatalogTarget: [1000, 1_000_000],
};
export function normalizePullSettings(raw: unknown): PullSettings {
  const input = raw && typeof raw === 'object' ? raw as Partial<PullSettings> : {};
  const next = { ...DEFAULT_PULL_SETTINGS };
  for (const key of Object.keys(limits) as Array<keyof typeof limits>) {
    const value = Number(input[key]);
    if (input[key] !== undefined && Number.isFinite(value)) next[key] = Math.max(limits[key][0], Math.min(limits[key][1], Math.floor(value)));
  }
  for (const key of ['automaticPulls', 'pauseWhileWatching'] as const) if (typeof input[key] === 'boolean') next[key] = input[key];
  return next;
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
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* Session settings still apply. */ }
  for (const listener of listeners) listener();
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
