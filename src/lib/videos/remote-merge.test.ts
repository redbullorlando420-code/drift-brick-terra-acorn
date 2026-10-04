import test from "node:test";
import assert from "node:assert/strict";
import type { LibraryVideo } from "./types.ts";
import { mergeRemoteCatalog, mergeRemoteCatalogAsync, mergeRemoteRefresh, mergeRemoteRefreshAsync } from "./remote-merge.ts";

function archivedYoutubeVideo(): LibraryVideo {
  return {
    id: "yt-old-upload",
    folderId: "yt:UCcreator",
    name: "Older upload",
    path: "https://www.youtube.com/watch?v=yt-old-upload",
    extension: "mp4",
    mime: "video/mp4",
    size: 0,
    addedAt: 1,
    remote: { kind: "youtube", videoId: "yt-old-upload", channelName: "Creator", live: false },
  };
}

test("routine refreshes keep historical YouTube uploads that were not repeated by the provider", () => {
  const archived = archivedYoutubeVideo();
  const merged = mergeRemoteRefresh([archived], [], [archived.folderId], new Set());
  assert.deepEqual(merged, [archived]);
  assert.equal(merged[0], archived);
});

test("a successful live check reports stale broadcast cards while marking them offline", () => {
  const live: LibraryVideo = {
    ...archivedYoutubeVideo(),
    id: "yt-live-stream",
    name: "Creator live",
    remote: { kind: "youtube", videoId: "live-stream", channelName: "Creator", live: true, observedAt: 10 },
  };
  const staleLiveIds: string[] = [];
  const merged = mergeRemoteRefresh([live], [], [live.folderId], new Set(), { staleLiveIds });
  assert.deepEqual(staleLiveIds, [live.id]);
  assert.equal(merged[0].remote?.live, false);
  assert.equal(merged[0].tagline, "Offline · saved channel");
});

test("catalog sweeps reuse unchanged rows and append new uploads without dropping saved details", () => {
  const archived = archivedYoutubeVideo();
  const withComments = { ...archived, remote: { ...archived.remote!, comments: [{ id: "comment-1", author: "Viewer", body: "Saved", kind: "comment" as const }] } } as LibraryVideo;
  const positions = new Map([[withComments.id, 0]]);
  const firstRows: LibraryVideo[] = [];
  const same = mergeRemoteCatalog([withComments], [archived], positions, firstRows);
  assert.equal(same[0].remote?.comments?.length, 1);
  assert.equal(firstRows[0], same[0]);
  const nextRows: LibraryVideo[] = [];
  const newer = { ...archived, id: "yt-new-upload", name: "New upload" };
  const merged = mergeRemoteCatalog(same, [newer], positions, nextRows);
  assert.equal(merged.length, 2);
  assert.equal(merged[0], same[0]);
  assert.equal(positions.get(newer.id), 1);
  assert.equal(nextRows[0], merged[1]);
});

test("an archive row with an unknown date retains a known feed publication date", () => {
 const previous = {...archivedYoutubeVideo(),addedAt:1800000000000};
 const incoming = {...previous,addedAt:0};
 const merged = mergeRemoteCatalog([previous],[incoming],new Map([[previous.id,0]]),[]);
 assert.equal(merged[0].addedAt,previous.addedAt);
});

test('compact YouTube archive rows retain known views and duration while accepting explicit fresh values', () => {
  const previous = { ...archivedYoutubeVideo(), duration: 120, remote: { ...archivedYoutubeVideo().remote!, views: 1500 } };
  const incoming = { ...previous, duration: undefined, remote: { ...previous.remote, views: undefined } };
  const kept = mergeRemoteCatalog([previous], [incoming], new Map([[previous.id, 0]]), [])[0];
  assert.equal(kept.duration, 120);
  assert.equal(kept.remote?.views, 1500);
  const updated = mergeRemoteCatalog([kept], [{ ...incoming, duration: 90, remote: { ...incoming.remote, views: 0 } }], new Map([[previous.id, 0]]), [])[0];
  assert.equal(updated.duration, 90);
  assert.equal(updated.remote?.views, 0);
});

test('unchanged million-entry pages visit the catalog once without copying it', async () => {
  const rows = Array.from({ length: 1_000_000 }, (_, id) => ({ ...archivedYoutubeVideo(), id: `row-${id}`, remote: undefined }));
  let reads = 0, turns = 0;
  const existing = new Proxy(rows, { get(target, key, receiver) { if (typeof key === 'string' && /^\d+$/.test(key)) reads++; return Reflect.get(target, key, receiver); } });
  const result = await mergeRemoteCatalogAsync(existing, [{ ...rows[511] }], { turn: async () => { turns++; } });
  assert.equal(result, existing);
  assert.equal(reads, rows.length + 1, 'no full reference copy on unchanged input');
  assert.ok(turns >= Math.ceil(rows.length / 512));
});

test('staged changes preserve sequential duplicates, canonical identity and newer live observations', async () => {
  const original = archivedYoutubeVideo(), existing = [original];
  const added = { ...original, id: 'fresh', remote: { ...original.remote!, videoId: 'fresh', sourceIds: ['yt:first'] } };
  const wrapper = { ...added, id: 'legacy-wrapper', folderId: 'ytpl:list', name: 'Latest', remote: { ...added.remote, sourceIds: ['ytpl:list'] } };
  const merged = await mergeRemoteCatalogAsync(existing, [{ ...original, name: 'Edit one' }, { ...original, name: 'Edit two' }, added, wrapper], { turn: async () => {} });
  assert.equal(merged.length, 2); assert.equal(existing[0], original);
  assert.equal(merged[0].name, 'Edit two'); assert.equal(merged[1].name, 'Latest');
  assert.equal(merged[1].id, 'fresh'); assert.deepEqual(merged[1].remote?.sourceIds, ['yt:first', 'yt:UCcreator', 'ytpl:list']);
  const live = { ...original, remote: { ...original.remote!, live: true, observedAt: 20 } };
  assert.equal((await mergeRemoteCatalogAsync([live], [{ ...live, name: 'Stale', remote: { ...live.remote, observedAt: 10 } }], { turn: async () => {} }))[0], live);
});

test('async refreshes share unchanged arrays and preserve removals, live transitions and new rows', async () => {
  const archived = archivedYoutubeVideo(), unchanged = [archived];
  assert.equal(await mergeRemoteRefreshAsync(unchanged, [], [archived.folderId], new Set(), { index: new Map([[archived.id, archived]]) }), unchanged);
  const live = { ...archived, id: 'live', remote: { ...archived.remote!, live: true } };
  const removed = { ...archived, id: 'gone', folderId: 'other', remote: { kind: 'redtube' as const } };
  const added = { ...archived, id: 'new', remote: { ...archived.remote!, videoId: 'new' } };
  const old = [archived, live, removed];
  const expected = mergeRemoteRefresh(old, [added], [live.folderId, removed.folderId], new Set());
  assert.deepEqual(await mergeRemoteRefreshAsync(old, [added], [live.folderId, removed.folderId], new Set()), expected);
  assert.equal(live.remote.live, true);
});

test('cancellation of staged catalog work leaves all original references intact', async () => {
  const old = [archivedYoutubeVideo()]; let turns = 0;
  await assert.rejects(mergeRemoteCatalogAsync(old, [{ ...old[0], name: 'Changed' }], { turn: async () => { if (++turns === 4) throw new Error('cancel'); } }), /cancel/);
  assert.equal(old[0].name, 'Older upload');
});

test('large change batches and late removals match sequential merge behavior without mutating the input', async () => {
  const rows = Array.from({ length: 5000 }, (_, id) => ({ ...archivedYoutubeVideo(), id: `row-${id}`, remote: undefined }));
  const incoming = rows.map(row => ({ ...row, name: 'Updated' }));
  const result = await mergeRemoteCatalogAsync(rows, incoming, { turn: async () => {} });
  assert.ok(result.every(row => row.name === 'Updated')); assert.equal(rows[4999].name, 'Older upload');
  const provider = { ...archivedYoutubeVideo(), id: 'expired', folderId: 'adult', remote: { kind: 'redtube' as const } };
  const catalog = [...rows, provider];
  assert.deepEqual(await mergeRemoteRefreshAsync(catalog, [], ['adult'], new Set()), rows);
  assert.deepEqual(await mergeRemoteRefreshAsync(Array.from({ length: 5000 }, (_, i) => ({ ...provider, id: `adult-${i}` })), [], ['adult'], new Set()), []);
});
