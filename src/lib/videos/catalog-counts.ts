export type CatalogCounts = { publicCount: number; ytCount: number; twitchCount: number; liveCount: number; favCount: number; historyCount: number; adultCount: number };
export const emptyCatalogCounts = (): CatalogCounts => ({ publicCount: 0, ytCount: 0, twitchCount: 0, liveCount: 0, favCount: 0, historyCount: 0, adultCount: 0 });
import type { LibraryVideo } from './types';
// A packet carries numeric flags and history multiplicity, never video metadata.
export type CountRow = [flags: number, historyEvents: number];
export function catalogCountFlags(video: LibraryVideo, adultIds: ReadonlySet<string>, hidden: Record<string, true>, hideDemo: boolean) {
  const visible = !hidden[video.id] && !(hideDemo && video.isSample);
  if (adultIds.has(video.folderId)) return visible ? 32 : 0;
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
    if (card.id !== id || adultIds.has(card.folderId) || hidden[id] || hideDemo && card.isSample) continue;
    if (saved.has(id)) favCount++;
    historyCount += events.get(id) ?? 0;
  }
  return { favCount, historyCount };
}
