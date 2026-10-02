import { test } from 'node:test';
import assert from 'node:assert/strict';
import { admitRemoteEntries, remoteEntryCounts, holdEntryLimitCursors } from './entry-limits.ts';
import { mergeRemoteCatalogAsync } from './remote-merge.ts';
import { DEFAULT_PULL_SETTINGS, normalizePullSettings } from '../pull-settings.ts';
import type { LibraryVideo, FollowedChannel } from './types';
const card = (id: string, kind = 'youtube', videoId = id): LibraryVideo => ({ id, folderId: `${kind}:creator`, name: id, addedAt: 1, extension: 'mp4', mime: 'video/mp4', remote: { kind, videoId } } as LibraryVideo);

test('source and combined caps apply together, including images, live and hidden retained entries', async () => {
  const existing = [card('yt'), card('adult', 'booru'), { ...card('sample'), isSample: true }, { ...card('local'), remote: undefined }];
  const counts = await remoteEntryCounts(existing);
  assert.deepEqual(counts, { total: 2, youtube: 1, twitch: 0, adult: 1, other: 0 });
  const result = await admitRemoteEntries(existing, [card('yt-2'), card('yt-3'), card('tw', 'twitch'), card('adult-2', 'redgifs')], { ...DEFAULT_PULL_SETTINGS, remoteMaxEntries: 4, youtubeMaxEntries: 2 });
  assert.deepEqual(result.videos.map(v => v.id), ['yt-2', 'tw']);
  assert.equal(result.skipped, 2);
  assert.equal(result.added, 2);
  assert.equal(result.counts.total, 4);
  assert.deepEqual(existing.map(v => v.id), ['yt', 'adult', 'sample', 'local']);
});

test('zero and lowered limits hold additions but allow existing identities and YouTube aliases to refresh', async () => {
  const existing = [card('original', 'youtube', 'shared')];
  const result = await admitRemoteEntries(existing, [card('alias', 'youtube', 'shared'), card('new'), card('adult', 'eporner')], { ...DEFAULT_PULL_SETTINGS, remoteMaxEntries: 0 });
  assert.deepEqual(result.videos.map(v => v.id), ['original']);
  assert.equal(result.added, 0);
  assert.equal(result.skipped, 2);
  assert.equal((await mergeRemoteCatalogAsync(existing, result.videos)).length, 1);
});

test('duplicate YouTube aliases in one provider batch occupy a single slot and canonical metadata identity', async () => {
  const result = await admitRemoteEntries([], [card('first', 'youtube', 'shared'), card('second', 'youtube', 'shared'), card('third')], { ...DEFAULT_PULL_SETTINGS, youtubeMaxEntries: 1 });
  assert.equal(result.added, 1);
  assert.equal(result.counts.youtube, 1);
  assert.deepEqual(result.videos.map(v => v.id), ['first', 'first']);
  const merged = await mergeRemoteCatalogAsync([], result.videos);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, 'first');
});

test('partially admitted pages keep their old cursor and watermark; raising the limit admits their tail', async () => {
  const old = { id: 'youtube:creator', catalogCursor: 'page-before', newestVideoId: 'old' } as FollowedChannel;
  const fresh = { ...old, catalogCursor: 'page-after', newestVideoId: 'new', catalogExhaustedAt: 123, lastCheckedAt: 456 };
  const result = await admitRemoteEntries([], [card('first'), card('second')], { ...DEFAULT_PULL_SETTINGS, youtubeMaxEntries: 1 });
  const held = holdEntryLimitCursors([old], [fresh], result.skippedSources)[0];
  assert.equal(held.catalogCursor, 'page-before');
  assert.equal(held.catalogExhaustedAt, undefined);
  assert.equal(held.newestVideoId, 'old');
  assert.equal(held.lastCheckedAt, 456);
  const stored = await mergeRemoteCatalogAsync([], result.videos);
  const resumed = await admitRemoteEntries(stored, [card('first'), card('second')], { ...DEFAULT_PULL_SETTINGS, youtubeMaxEntries: 2 });
  assert.equal(resumed.skipped, 0);
  assert.equal(resumed.added, 1);
  assert.equal(holdEntryLimitCursors([old], [fresh], resumed.skippedSources)[0].catalogCursor, 'page-after');
});

test('large catalog counting shares concurrent work and yields to UI tasks', async () => {
  const videos = Array.from({ length: 60000 }, (_, i) => card(String(i), i % 2 ? 'youtube' : 'twitch'));
  let uiTurn = false;
  const first = remoteEntryCounts(videos);
  assert.equal(remoteEntryCounts(videos), first);
  setTimeout(() => { uiTurn = true; }, 0);
  const counts = await first;
  assert.equal(uiTurn, true);
  assert.equal(counts.total, 60000);
  assert.equal(counts.youtube, 30000);
  assert.equal(await remoteEntryCounts(videos), counts);
  const changed = [...videos, card('new', 'booru')];
  assert.equal((await remoteEntryCounts(changed)).adult, 1);
});

test('legacy pull preferences migrate without resetting pacing; limits accept zero and clamp malformed values', () => {
  const migrated = normalizePullSettings({ requestGapMs: 4500, adultBatchVideos: 4000 });
  assert.equal(migrated.requestGapMs, 4500);
  assert.equal(migrated.adultBatchVideos, 4000);
  assert.equal(migrated.youtubeMaxEntries, 100000);
  const normalized = normalizePullSettings({ youtubeMaxEntries: 0, adultMaxEntries: -5, remoteMaxEntries: 99999999, twitchMaxEntries: NaN });
  assert.equal(normalized.youtubeMaxEntries, 0);
  assert.equal(normalized.adultMaxEntries, 0);
  assert.equal(normalized.remoteMaxEntries, 1000000);
  assert.equal(normalized.twitchMaxEntries, DEFAULT_PULL_SETTINGS.twitchMaxEntries);
});
