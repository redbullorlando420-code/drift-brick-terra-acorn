import { forEachCatalogEntry, forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import type { HistoryEntry, LibraryVideo } from './types';

export type HistorySource = 'all' | 'open' | 'progress' | 'watch-room';
export type HistoryWindow = 'all' | 'day' | 'week';
export type HistoryIndex = Awaited<ReturnType<typeof prepareHistoryIndex>>;

/** Uses the already visibility-scoped recovery cards, never the whole catalog.
 * Indexing activity does not change or deduplicate the underlying event log. */
export async function prepareHistoryIndex(history: HistoryEntry[], videos: LibraryVideo[], now: number, turn: () => Promise<void>) {
  const byId = new Map<string, LibraryVideo>(), playedAt: Record<string, number> = Object.create(null);
  await forEachCatalogSlice(videos, video => { byId.set(video.id, video); }, turn, 4096);
  const sources = { open: 0, progress: 0, watchRoom: 0 };
  let resumable = 0, lastDay = 0, orphans = 0;
  await forEachCatalogSlice(history, entry => {
    if (playedAt[entry.id] == null) playedAt[entry.id] = entry.at;
    if (entry.at > now - 86_400_000) lastDay++;
    if (!byId.has(entry.id) && entry.url) orphans++;
    if (entry.source === 'watch-room') sources.watchRoom++;
    else if (entry.source === 'progress') sources.progress++;
    else sources.open++;
    if ((entry.position ?? 0) > 1 && (entry.duration ?? 0) > 0 && (entry.position ?? 0) < (entry.duration ?? 0) * 0.985) resumable++;
  }, turn, 4096);
  return { history, videos, byId, playedAt, lastDay, orphans, recovery: { sources, resumable } };
}

export async function prepareHistoryTags(history: HistoryEntry[], tags: Record<string, string[]>, turn: () => Promise<void>) {
  const counts = new Map<string, number>();
  await forEachCatalogSlice(history, entry => {
    for (const tag of tags[entry.id] ?? []) if (!/^year-|^month-|^type-|^format-|^https$|^youtube$|^twitch$/.test(tag)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }, turn, 4096);
  const rows: [string, number][] = [];
  await forEachCatalogEntry(counts, row => { rows.push(row); }, turn);
  return (await sortCatalogRows(rows, (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]), turn)).slice(0, 12);
}

export async function filterHistory(index: HistoryIndex, source: HistorySource, window: HistoryWindow, now: number, turn: () => Promise<void>) {
  if (source === 'all' && window === 'all') return { entries: index.history, videos: index.videos };
  const cutoff = window === 'day' ? now - 86_400_000 : window === 'week' ? now - 604_800_000 : 0;
  const entries: HistoryEntry[] = [], ids = new Set<string>(), videos: LibraryVideo[] = [];
  await forEachCatalogSlice(index.history, entry => {
    if (entry.at >= cutoff && (source === 'all' || (entry.source ?? 'open') === source)) { entries.push(entry); ids.add(entry.id); }
  }, turn, 4096);
  await forEachCatalogSlice(index.videos, video => { if (ids.has(video.id)) videos.push(video); }, turn, 4096);
  return { entries, videos };
}

/** Encode bounded chunks directly into Blob parts. No full JSON string or
 * second 60k-row object graph; the browser can paint/cancel between chunks. */
export async function historyExportBlob(entries: HistoryEntry[], byId: ReadonlyMap<string, LibraryVideo>, turn: () => Promise<void>) {
  await turn();
  const dateFormat = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
  const parts: Blob[] = [];
  let chunk = '[', visited = 0;
  await forEachCatalogSlice(entries, entry => {
    const date = new Date(entry.at);
    const row = { id: entry.id, eventId: entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? 'open'}`,
      occurredAt: date.toISOString(), localTime: dateFormat.format(date), source: entry.source ?? 'open',
      positionSeconds: entry.position ?? null, durationSeconds: entry.duration ?? null, url: entry.url ?? null,
      title: byId.get(entry.id)?.name ?? 'Recovered activity' };
    chunk += `${visited ? ',' : ''}\n${JSON.stringify(row, null, 2).replace(/^/gm, '  ')}`;
    if (++visited % 64 === 0) { parts.push(new Blob([chunk])); chunk = ''; }
  }, turn, 128);
  chunk += `${visited ? '\n' : ''}]`;
  parts.push(new Blob([chunk]));
  await turn();
  return new Blob(parts, { type: 'application/json' });
}
