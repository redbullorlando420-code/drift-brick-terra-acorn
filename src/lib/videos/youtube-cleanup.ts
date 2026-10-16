import { forEachCatalogEntry, forEachCatalogSlice } from '../catalog-work.ts';
import { createBoundedPicks } from './bounded-picks.ts';
import { youtubeVideoKey } from '../remote/youtube-sources.ts';
import { youtubePublicationTime } from './youtube-metadata.ts';
import { normalizeRating } from './ranking-core.ts';
import type { LibraryVideo } from './types.ts';
import { entryGroup, remainingEntrySlots, type EntryCounts } from './entry-limits.ts';
import type { PullSettings } from '../pull-settings.ts';

export const YOUTUBE_RETIRED_KEY_LIMIT = 10_000;
const TOTAL_RETIRED_KEY_LIMIT = YOUTUBE_RETIRED_KEY_LIMIT * 4;
export type CleanupGroup = 'youtube' | 'twitch' | 'adult';
export const CLEANUP_GROUPS: readonly CleanupGroup[] = ['youtube', 'twitch', 'adult'];
export type CleanupBudgets = Record<CleanupGroup, number>;
const spentBudgets = new WeakMap<CleanupBudgets, CleanupBudgets>();
export const cleanupBudgets = (settings: Readonly<PullSettings>): CleanupBudgets => {
  const budgets = { youtube: settings.youtubeCleanupBatch, twitch: settings.twitchCleanupBatch, adult: settings.adultCleanupBatch };
  spentBudgets.set(budgets, { youtube: 0, twitch: 0, adult: 0 });
  return budgets;
};
export function cleanupBudgetAvailable(budgets: CleanupBudgets, settings: Readonly<PullSettings>, group: CleanupGroup) {
  return Math.max(0, Math.min(budgets[group], settings[`${group}CleanupBatch`] - (spentBudgets.get(budgets)?.[group] ?? 0)));
}
export function consumeCleanupBudget(budgets: CleanupBudgets, group: CleanupGroup, removed: number) {
  const spent = spentBudgets.get(budgets) ?? { youtube: 0, twitch: 0, adult: 0 };
  spent[group] += removed; spentBudgets.set(budgets, spent); budgets[group] = Math.max(0, budgets[group] - removed);
}
export const cleanupLabel = (group: CleanupGroup) => group === 'youtube' ? 'YouTube' : group === 'twitch' ? 'Twitch' : 'Adult';
export function cleanupPolicy(settings: Readonly<PullSettings>, group: CleanupGroup) {
  return { enabled: settings[`${group}AutoCleanup`], batch: settings[`${group}CleanupBatch`], minAgeDays: settings[`${group}CleanupMinAgeDays`] };
}
// Keep the original journal name/key so existing cleanup history survives upgrades.
export type CleanupStats = { removedCount: number; lastRemoved: number; lastAt: number };
export type YoutubeCleanupJournal = CleanupStats & { recentKeys: string[]; groups?: Partial<Record<CleanupGroup, CleanupStats>> };
export const emptyYoutubeCleanup = (): YoutubeCleanupJournal => ({ recentKeys: [], removedCount: 0, lastRemoved: 0, lastAt: 0 });
const adultKeyPrefixes = new Set(['eporner', 'redtube', 'chaturbate', 'myfreecams', 'reddit', 'booru', 'redgifs']);
function boundedRetiredKeys(keys: readonly string[]) {
  const counts = { youtube: 0, twitch: 0, adult: 0, legacy: 0 }, seen = new Set<string>(), retained: string[] = [];
  for (let i = keys.length - 1; i >= 0 && retained.length < TOTAL_RETIRED_KEY_LIMIT; i--) {
    const key = keys[i];
    if (seen.has(key)) continue;
    const prefix = key.slice(0, key.indexOf(':'));
    const group = prefix === 'yt' ? 'youtube' : prefix === 'tw' || prefix === 'twitch' ? 'twitch' : adultKeyPrefixes.has(prefix) ? 'adult' : 'legacy';
    if (counts[group] >= YOUTUBE_RETIRED_KEY_LIMIT) continue;
    counts[group]++; seen.add(key); retained.push(key);
  }
  return retained.reverse();
}
const cleanupCount = (n: unknown) => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0 ? n : 0;
export function normalizeYoutubeCleanup(raw: unknown): YoutubeCleanupJournal {
  const value = raw && typeof raw === 'object' ? raw as Partial<YoutubeCleanupJournal> : {};
  const recentKeys = Array.isArray(value.recentKeys) ? boundedRetiredKeys(value.recentKeys.slice(-TOTAL_RETIRED_KEY_LIMIT).filter((key): key is string => typeof key === 'string')) : [];
  const result: YoutubeCleanupJournal = { recentKeys, removedCount: cleanupCount(value.removedCount), lastRemoved: cleanupCount(value.lastRemoved), lastAt: cleanupCount(value.lastAt) };
  if (value.groups && typeof value.groups === 'object') {
    result.groups = {};
    for (const group of CLEANUP_GROUPS) {
      const row = value.groups[group];
      if (row && typeof row === 'object') result.groups[group] = { removedCount: cleanupCount(row.removedCount), lastRemoved: cleanupCount(row.lastRemoved), lastAt: cleanupCount(row.lastAt) };
    }
  }
  return result;
}
export const cleanupKey = (video: LibraryVideo) => youtubeVideoKey(video) ?? video.id;
const keyCache = new WeakMap<string[], ReadonlySet<string>>();
export function retiredYoutubeKeys(journal: YoutubeCleanupJournal) {
  let keys = keyCache.get(journal.recentKeys);
  if (!keys) { keys = new Set(journal.recentKeys); keyCache.set(journal.recentKeys, keys); }
  return keys;
}
export function recordYoutubeCleanup(previous: YoutubeCleanupJournal, removed: readonly LibraryVideo[], now: number): YoutubeCleanupJournal {
  const keys = new Set(removed.map(cleanupKey));
  const counts: CleanupBudgets = { youtube: 0, twitch: 0, adult: 0 }, groups = { ...previous.groups };
  for (const video of removed) { const group = entryGroup(video); if (group && group !== 'other') counts[group]++; }
  for (const group of CLEANUP_GROUPS) if (counts[group]) groups[group] = { removedCount: (groups[group]?.removedCount ?? 0) + counts[group], lastRemoved: counts[group], lastAt: now };
  return { recentKeys: boundedRetiredKeys([...previous.recentKeys.filter(key => !keys.has(key)), ...keys]), groups,
    removedCount: previous.removedCount + removed.length, lastRemoved: removed.length, lastAt: now };
}
type Signals = { favorites: Record<string, true>; likes: Record<string, true>; activeId: string | null; previewId: string | null; rating: (id: string) => number; managed?: (id: string) => boolean };
export function youtubeCleanupProtected(video: LibraryVideo, signals: Signals) {
  const alias = cleanupKey(video);
  return Boolean(signals.favorites[video.id] || signals.likes[video.id] || signals.favorites[alias] || signals.likes[alias]
    || signals.managed?.(video.id) || signals.managed?.(alias) || video.remote?.live || video.remote?.youtubeType === 'live' || video.remote?.youtubeType === 'upcoming'
    || normalizeRating(signals.rating(video.id)) >= 3 || alias !== video.id && normalizeRating(signals.rating(alias)) >= 3
    || signals.activeId === video.id || signals.previewId === video.id || signals.activeId === alias || signals.previewId === alias);
}
export function rotationAvailable(counts: EntryCounts, settings: Readonly<PullSettings>, group: CleanupGroup, remaining = cleanupPolicy(settings, group).batch) {
  return cleanupPolicy(settings, group).enabled && settings[`${group}MaxEntries`] > 0 && settings.remoteMaxEntries > 0
    && remaining > 0;
}
/** A lowered cap can recover gradually. Actual retirement still requires a
 * successful provider response containing fresh, unretired identities. */
export function replacementRequestBudget(counts: EntryCounts, settings: Readonly<PullSettings>, group: CleanupGroup, budgets = cleanupBudgets(settings)) {
  const capacity = remainingEntrySlots(counts, settings, group);
  if (!cleanupPolicy(settings, group).enabled || settings[`${group}MaxEntries`] <= 0 || settings.remoteMaxEntries <= 0) return capacity;
  const own = cleanupBudgetAvailable(budgets, settings, group);
  let shared = 0;
  if (settings.sharedCapCleanup) for (const donor of CLEANUP_GROUPS) {
    const available = cleanupBudgetAvailable(budgets, settings, donor);
    if (donor !== group && counts[donor] && rotationAvailable(counts, settings, donor, available)) shared += available;
  }
  const sourceRoom = Math.max(0, settings[`${group}MaxEntries`] - counts[group] + own - capacity);
  return capacity + Math.max(own, Math.min(own + shared, sourceRoom));
}
export const canRotateForGroup = (counts: EntryCounts, settings: Readonly<PullSettings>, group: CleanupGroup, budgets = cleanupBudgets(settings)) => replacementRequestBudget(counts, settings, group, budgets) > remainingEntrySlots(counts, settings, group);
const adultPolicies = new WeakMap<Readonly<PullSettings>, Readonly<PullSettings>>();
export function adultAdmissionPolicy(settings: Readonly<PullSettings>, automatic = false): Readonly<PullSettings> {
  if (!automatic || settings.adultCatalogTarget >= settings.adultMaxEntries) return settings;
  let policy = adultPolicies.get(settings);
  if (!policy) { policy = Object.freeze({ ...settings, adultMaxEntries: Math.min(settings.adultMaxEntries, settings.adultCatalogTarget) }); adultPolicies.set(settings, policy); }
  return policy;
}
export const youtubeRotationAvailable = (counts: EntryCounts, settings: Readonly<PullSettings>, remaining = settings.youtubeCleanupBatch) => rotationAvailable(counts, settings, 'youtube', remaining);
export function cleanupAge(video: LibraryVideo) {
  if (video.remote?.kind === 'youtube') return youtubePublicationTime(video);
  const at = video.addedAt;
  return Number.isFinite(at) && at > Date.UTC(2000, 0, 1) ? at : 0;
}
export const cleanupSourceKeys = (video: LibraryVideo) => [video.folderId, ...(video.remote?.sourceIds ?? []), ...(video.remote?.channelId ? [`${video.remote.kind}:creator:${video.remote.channelId}`] : [])];
/** Smallest rating first, then oldest known publication. No complete sort or
 * scored catalog copy; source representatives and positive user signals stay. */
export async function planYoutubeCleanup(videos: LibraryVideo[], signals: Signals, options: {
  limit: number; minAgeDays: number; now: number; exclude?: ReadonlySet<string>; group?: CleanupGroup; replacementSources?: ReadonlySet<string>;
}, turn: () => Promise<void>) {
  const limit = Math.max(0, Math.min(1000, Math.floor(options.limit)));
  if (!limit) return { videos, removed: [] as LibraryVideo[] };
  const group = options.group ?? 'youtube';
  const keepers = new Map<string, { key: string; at: number }>();
  await forEachCatalogSlice(videos, video => {
    if (entryGroup(video) !== group) return;
    const key = cleanupKey(video), at = cleanupAge(video) || Number.MAX_SAFE_INTEGER;
    for (const source of cleanupSourceKeys(video)) {
      const before = keepers.get(source);
      if (!before || at > before.at) keepers.set(source, { key, at });
    }
  }, turn);
  const keptKeys = new Set<string>();
  await forEachCatalogEntry(keepers.entries(), ([source, row]) => { if (!options.replacementSources?.has(source)) keptKeys.add(row.key); }, turn);
  // A small reserve avoids a blocked/duplicated oldest identity starving
  // other eligible rows, without building a complete ranked catalog.
  const best = createBoundedPicks<{ video: LibraryVideo; rating: number; at: number; index: number }>(Math.min(2048, limit * 2 + 32),
    (a, b) => a.rating - b.rating || a.at - b.at || a.index - b.index);
  const cutoff = options.now - Math.max(0, options.minAgeDays) * 86_400_000;
  await forEachCatalogSlice(videos, (video, index) => {
    if (entryGroup(video) !== group) return;
    const key = cleanupKey(video), at = cleanupAge(video);
    if (!at || at > cutoff || keptKeys.has(key) || options.exclude?.has(key) || youtubeCleanupProtected(video, signals)) return;
    best.add({ video, rating: normalizeRating(signals.rating(video.id)), at, index });
  }, turn);
  const candidates = best.finish(), candidateKeys = new Set(candidates.map(row => cleanupKey(row.video))), blocked = new Set<string>();
  const rowCounts = new Map<string, number>();
  // Any positive alias protects the entire identity; duplicated row IDs must
  // not turn a small batch into an unlimited deletion or orphan disk details.
  await forEachCatalogSlice(videos, video => {
    if (entryGroup(video) !== group || !candidateKeys.has(cleanupKey(video))) return;
    const key = cleanupKey(video);
    rowCounts.set(key, (rowCounts.get(key) ?? 0) + 1);
    if (youtubeCleanupProtected(video, signals)) blocked.add(cleanupKey(video));
  }, turn);
  const removed: LibraryVideo[] = [], selectedKeys = new Set<string>();
  let count = 0;
  for (const { video } of candidates) {
    const key = cleanupKey(video);
    if (selectedKeys.has(key) || blocked.has(key) || count + rowCounts.get(key)! > limit) continue;
    selectedKeys.add(key); count += rowCounts.get(key)!;
  }
  if (!selectedKeys.size) return { videos, removed };
  const retained: LibraryVideo[] = [];
  await forEachCatalogSlice(videos, video => { if (selectedKeys.has(cleanupKey(video)) && entryGroup(video) === group) removed.push(video); else retained.push(video); }, turn);
  return { videos: retained, removed };
}
