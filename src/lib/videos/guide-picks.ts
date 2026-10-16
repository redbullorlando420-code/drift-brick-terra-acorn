import { forEachCatalogEntry, forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import { sparseRecordScan } from '../sparse-record.ts';
import { createBoundedPicks } from './bounded-picks.ts';
import { hasFreshViewerCount, type LibraryVideo } from './types.ts';

export type GuideInput = {
  videos: readonly LibraryVideo[];
  tags: Record<string, string[]>;
  favorites: Record<string, true>;
  likes: Record<string, true>;
  history: readonly { id: string }[];
};
export type GuideSnapshot = {
  picks: LibraryVideo[]; live: LibraryVideo[];
  historyCount: number; favoriteCount: number; tagCount: number;
};
function shuffleRank(id: string, seed: number) {
  let value = seed >>> 0;
  // Preserve the guide's code-point traversal, including emoji IDs.
  for (const char of id) value = Math.imul(value ^ char.charCodeAt(0), 0x45d9f3b);
  return value >>> 0;
}

/** Retain twelve scored candidates rather than sorting/cloning the catalog.
 * All scans (including saved signals and live sorting) yield to current input. */
export async function prepareGuide(input: GuideInput, seed: number, now: number, turn: () => Promise<void>): Promise<GuideSnapshot> {
  const { videos, favorites, likes, tags, history } = input;
  const favoredTags = new Set<string>(), watched = new Set<string>(), live: LibraryVideo[] = [];
  let favoriteCount = 0, tagCount = 0;
  await forEachCatalogSlice(history, entry => { watched.add(entry.id); }, turn);
  await forEachCatalogEntry(sparseRecordScan(favorites, false), row => { if (row) favoriteCount++; }, turn);
  await forEachCatalogEntry(sparseRecordScan(tags), row => { if (row) tagCount += row[1].length; }, turn);
  await forEachCatalogSlice(videos, video => {
    if (favorites[video.id] || likes[video.id]) for (const tag of tags[video.id] ?? []) favoredTags.add(tag);
    if (video.remote?.kind === 'twitch' && video.remote.live) live.push(video);
  }, turn);
  const best = createBoundedPicks<{ video: LibraryVideo; score: number; rank: number; index: number }>(12,
    (a, b) => b.score - a.score || a.rank - b.rank || a.index - b.index);
  await forEachCatalogSlice(videos, (video, index) => {
    if (watched.has(video.id)) return;
    let score = (favorites[video.id] ? 3 : 0) + (likes[video.id] ? 2 : 0);
    for (const tag of tags[video.id] ?? []) if (favoredTags.has(tag)) score++;
    best.add({ video, score, rank: shuffleRank(video.id, seed), index });
  }, turn);
  const viewers = (video: LibraryVideo) => hasFreshViewerCount(video.remote, now) ? video.remote!.viewers! : 0;
  const orderedLive = await sortCatalogRows(live, (a, b) => viewers(b) - viewers(a), turn);
  return { picks: best.finish().map(row => row.video), live: orderedLive, historyCount: history.length, favoriteCount, tagCount };
}

/** Asking reads only prepared short lists and never rescans the library. */
export function guideAnswer(prompt: string, snapshot: GuideSnapshot, tags: GuideInput['tags']) {
  if (/live|twitch|stream/i.test(prompt) && snapshot.live.length)
    return `Live on your followed Twitch channels:\n${snapshot.live.slice(0, 4).map((video, index) => `${index + 1}. ${video.remote?.channelName ?? video.name}${hasFreshViewerCount(video.remote) ? ` · ${video.remote?.viewers?.toLocaleString()} viewers` : ''}`).join('\n')}\n\nLive status comes from the latest refresh in Realhub. Open a card to watch it.`;
  return snapshot.picks.length ? `Local recommendation${snapshot.picks.length === 1 ? '' : 's'} for “${prompt}”:\n${snapshot.picks.slice(0, 3).map((video, index) => `${index + 1}. ${video.name} — ${video.genre ?? 'a library pick'}${(tags[video.id] ?? []).length ? ` · ${(tags[video.id] ?? []).slice(0, 2).join(', ')}` : ''}`).join('\n')}\n\nThe optional cloud guide is unavailable, so these picks were ranked privately from your library signals.` : 'Add a few titles, tags, likes, or favorites and the local guide will start making picks.';
}
