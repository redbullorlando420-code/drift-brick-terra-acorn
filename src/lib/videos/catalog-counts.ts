import { videoIsPrivate } from './public-visibility.ts';
export type CatalogCounts = { publicCount: number; ytCount: number; twitchCount: number; liveCount: number; favCount: number; historyCount: number; adultCount: number };
export const emptyCatalogCounts = (): CatalogCounts => ({ publicCount: 0, ytCount: 0, twitchCount: 0, liveCount: 0, favCount: 0, historyCount: 0, adultCount: 0 });
import type { LibraryVideo } from './types';
import type { HistoryEntry } from './types';
import { forEachCatalogEntry, forEachCatalogSlice } from '../catalog-work.ts';
import { savedRecordScan } from './saved-library.ts';
// A packet carries numeric flags and history multiplicity, never video metadata.
export type CountRow = [flags: number, historyEvents: number];
export function catalogCountFlags(video: LibraryVideo, adultIds: ReadonlySet<string>, hidden: Record<string, true>, hideDemo: boolean) {
  const visible = !hidden[video.id] && !(hideDemo && video.isSample);
  if (videoIsPrivate(adultIds,video)) return visible ? 32 : 0;
  return (visible ? 1 : 0) | (video.remote?.kind === 'youtube' ? 2 : 0)
    | (video.remote?.kind === 'twitch' ? 4 : 0) | (video.remote?.live ? 8 : 0);
}
export function applyCatalogFlags(counts: CatalogCounts, flags: number, direction = 1) {
  if (flags & 1) counts.publicCount += direction;
  if (flags & 2) counts.ytCount += direction;
  if (flags & 4) counts.twitchCount += direction;
  if (flags & 8) counts.liveCount += direction;
  if (flags & 32) counts.adultCount += direction;
}
export function addCountBatch(counts: CatalogCounts, rows: CountRow[]) {
  for (const [flags, events] of rows) {
    if (flags & 1) counts.publicCount++;
    if (flags & 2) counts.ytCount++;
    if (flags & 4) counts.twitchCount++;
    if (flags & 8) counts.liveCount++;
    if (flags & 16) counts.favCount++;
    if (flags & 32) counts.adultCount++;
    counts.historyCount += events;
  }
  return counts;
}

export function countActivityMatches(matches: ReadonlyMap<string, readonly LibraryVideo[]>, saved: ReadonlySet<string>, events: ReadonlyMap<string, number>, adultIds: ReadonlySet<string>, hidden: Record<string, true>, hideDemo: boolean) {
  let favCount = 0, historyCount = 0;
  for (const [id, cards] of matches) for (const card of cards) {
    if (card.id !== id || videoIsPrivate(adultIds,card) || hidden[id] || hideDemo && card.isSample) continue;
    if (saved.has(id)) favCount++;
    historyCount += events.get(id) ?? 0;
  }
  return { favCount, historyCount };
}

export async function prepareActivityCounts(favorites: Record<string, true>, likes: Record<string, true>, history: readonly HistoryEntry[], turn: () => Promise<void>) {
  const saved = new Set<string>(), events = new Map<string, number>();
  await forEachCatalogEntry(savedRecordScan(favorites), id => { if (id !== undefined) saved.add(id); }, turn);
  await forEachCatalogEntry(savedRecordScan(likes), id => { if (id !== undefined) saved.add(id); }, turn);
  await forEachCatalogSlice(history, entry => { events.set(entry.id, (events.get(entry.id) ?? 0) + 1); }, turn);
  function* keys() { yield* saved; yield* events.keys(); }
  return { saved, events, keys: keys() };
}
export async function countActivityMatchesAsync(matches: ReadonlyMap<string, readonly LibraryVideo[]>, saved: ReadonlySet<string>, events: ReadonlyMap<string, number>, adultIds: ReadonlySet<string>, hidden: Record<string, true>, hideDemo: boolean, turn: () => Promise<void>) {
  let favCount = 0, historyCount = 0;
  function* rows() { for (const [id, cards] of matches) for (const card of cards) yield { id, card }; }
  await forEachCatalogEntry(rows(), ({ id, card }) => {
    if (card.id !== id || videoIsPrivate(adultIds,card) || hidden[id] || hideDemo && card.isSample) return;
    if (saved.has(id)) favCount++;
    historyCount += events.get(id) ?? 0;
  }, turn);
  return { favCount, historyCount };
}
