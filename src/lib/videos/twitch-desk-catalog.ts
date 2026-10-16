import { collectCatalogRows, forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import { isTwitchClip } from './twitch-clips.ts';
import { isOfflineTwitchCatalogCard } from './twitch-catalog-order.ts';
import type { FollowedChannel, LibraryVideo } from './types';

type Coverage = { count: number; oldest: number; newest: number; clips: number };
const emptyCoverage = (): Coverage => ({ count: 0, oldest: 0, newest: 0, clips: 0 });
const creatorName = (video: LibraryVideo) => video.remote?.channelName?.trim() || 'Unknown creator';

/** Coverage is catalog-only: saves, ratings, sort modes and shuffle seeds must
 * never rescan it. Clip offsets take four bytes each, without cloned videos. */
export async function prepareTwitchDeskIndex(videos: readonly LibraryVideo[], turn: () => Promise<void>) {
  const coverage = new Map<string, Coverage>(), liveRows: LibraryVideo[] = [], offsets: number[] = [];
  let total = 0;
  await forEachCatalogSlice(videos, (video, offset) => {
    if (video.remote?.kind !== 'twitch') return;
    if (video.remote.live) { liveRows.push(video); return; }
    const clip = isTwitchClip(video);
    if (!clip && isOfflineTwitchCatalogCard(video)) return;
    const name = creatorName(video), row = coverage.get(name) ?? emptyCoverage();
    if (clip) { row.clips++; offsets.push(offset); }
    else {
      row.count++; total++;
      row.oldest = row.count === 1 ? video.addedAt : Math.min(row.oldest, video.addedAt);
      row.newest = Math.max(row.newest, video.addedAt);
    }
    coverage.set(name, row);
  }, turn);
  const clips = new Uint32Array(offsets.length);
  await forEachCatalogSlice(offsets, (offset, i) => { clips[i] = offset; }, turn);
  const live = await sortCatalogRows(liveRows, (a, b) => (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0), turn);
  await turn();
  return { coverage, clips, live, total };
}
export type TwitchDeskIndex = Awaited<ReturnType<typeof prepareTwitchDeskIndex>>;

export async function prepareTwitchCoverage(index: TwitchDeskIndex, follows: readonly FollowedChannel[], turn: () => Promise<void>) {
  const rows = [] as Array<FollowedChannel & Coverage & { name: string; retryAt?: number }>;
  let sparse = 0;
  await forEachCatalogSlice(follows, channel => {
    if (channel.kind !== 'twitch') return;
    const coverage = index.coverage.get(channel.title) ?? emptyCoverage();
    if (coverage.count < 24) sparse++;
    rows.push({ ...channel, ...coverage, name: channel.title, retryAt: channel.twitchArchiveRetry?.retryAt });
  }, turn);
  const channels = await sortCatalogRows(rows, (a, b) => a.count - b.count || a.name.localeCompare(b.name), turn);
  await turn();
  return { total: index.total, sparse, channels };
}

/** Aggregate creator taste once per ranked catalog/activity snapshot. No
 * per-creator VOD arrays survive this pass; only exact counts and sums. */
export async function prepareTwitchCreatorScores(vods: readonly LibraryVideo[], score: (video: LibraryVideo) => number,
  turn: () => Promise<void>) {
  const groups = new Map<string, { creator: string; count: number; score: number }>();
  await forEachCatalogSlice(vods, video => {
    const creator = creatorName(video), group = groups.get(creator) ?? { creator, count: 0, score: 0 };
    group.count++; group.score += score(video); groups.set(creator, group);
  }, turn);
  return collectCatalogRows(groups.values(), turn);
}
export type TwitchCreatorScores = Awaited<ReturnType<typeof prepareTwitchCreatorScores>>;

function creatorRank(id: string, seed: number) {
  let value = seed >>> 0;
  for (let i = 0; i < id.length; i++) value = Math.imul(value ^ id.charCodeAt(i), 0x45d9f3b);
  return value >>> 0;
}

/** Retain complete rails only for the displayed 12 creators and 8 live
 * creators. Every other VOD remains available in the full catalog grid. */
export async function prepareTwitchCreatorShelves(vods: readonly LibraryVideo[], scores: TwitchCreatorScores,
  ordered: readonly LibraryVideo[], seed: number, turn: () => Promise<void>) {
  // Sort a copy: prior completed score snapshots are immutable and reusable.
  const ranked = await sortCatalogRows(await collectCatalogRows(scores, turn), (a, b) => b.score / Math.max(b.count, 1)
    - a.score / Math.max(a.count, 1) || creatorRank(a.creator, seed) - creatorRank(b.creator, seed)
    || a.creator.localeCompare(b.creator), turn);
  const channels = ranked.slice(0, 12).map(row => ({ ...row, vods: [] as LibraryVideo[] }));
  const selected = new Map(channels.map(row => [row.creator, row]));
  const eligibleLive = new Set<string>();
  await forEachCatalogSlice(scores, row => { eligibleLive.add(row.creator.toLowerCase()); }, turn);
  const live = new Map<string, { creator: string; live: LibraryVideo; vods: LibraryVideo[] }>();
  await forEachCatalogSlice(ordered, video => {
    const creator = video.remote?.channelName?.trim(), key = creator?.toLowerCase();
    if (live.size < 8 && video.remote?.live && key && eligibleLive.has(key) && !live.has(key))
      live.set(key, { creator: creator!, live: video, vods: [] });
  }, turn);
  await forEachCatalogSlice(vods, video => {
    const creator = creatorName(video);
    selected.get(creator)?.vods.push(video);
    live.get(creator.toLowerCase())?.vods.push(video);
  }, turn);
  await turn();
  return { channels, live: await collectCatalogRows(live.values(), turn) };
}
