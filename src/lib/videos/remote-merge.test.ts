import test from "node:test";
import assert from "node:assert/strict";
import type { LibraryVideo } from "./types.ts";
import { mergeRemoteCatalog, mergeRemoteCatalogAsync, prepareIndexedRemoteCatalog, prepareRefreshSavedIds, mergeRemoteRefresh, mergeRemoteRefreshAsync } from "./remote-merge.ts";
import { patchSparseRecord, removeSparseRecordKeys } from '../sparse-record.ts';
import { youtubeVideoKey } from '../remote/youtube-sources.ts';

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
  assert.equal(merged[0].tagline, "Completed YouTube stream");
  assert.equal(merged[0].remote?.youtubeType, 'replay');
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
 const previous = {...archivedYoutubeVideo(),addedAt:1800000000000,remote:{...archivedYoutubeVideo().remote!,publishedSource:'rss' as const}};
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

test('indexed sweep preparation yields before reads, never scans its index, and reuses unchanged catalogs', async () => {
  const rows = Array.from({ length: 100_000 }, (_, i) => ({ ...archivedYoutubeVideo(), id: `v${i}`, remote: undefined }));
  let turns = 0, reads = 0;
  const existing = new Proxy(rows, { get(target, key, receiver) {
    if (/^\d+$/.test(String(key))) { assert.ok(turns > 0); reads++; }
    if (key === 'slice') throw Error('Synchronous catalog copy');
    return Reflect.get(target, key, receiver);
  } });
  const index = new Map([[rows[99999].id, 99999]]);
  index.entries = () => { throw Error('Entire index exported'); };
  const work = prepareIndexedRemoteCatalog(existing, [{ ...rows[99999] }], index, async () => { turns++; });
  assert.equal(reads, 0);
  const plan = await work;
  assert.equal(plan.videos, existing); assert.equal(plan.rows[0], rows[99999]);
  assert.equal(plan.positionChanges.size, 0); assert.equal(reads, 1);
});

test('indexed sweep staging matches sequential merges, canonical aliases and duplicate page rows', async () => {
  const original = archivedYoutubeVideo(), live = { ...original, id: 'live', remote: { ...original.remote!, videoId: 'live', live: true, observedAt: 20 } };
  const existing = [original, live];
  const positions = new Map<string, number>();
  existing.forEach((v,i)=>{positions.set(v.id,i);positions.set(youtubeVideoKey(v)!,i);});
  const added = { ...original, id: 'new', remote: { ...original.remote!, videoId: 'new', sourceIds: ['yt:first'] } };
  const incoming = [{ ...original, name: 'Updated' }, added, { ...added, id: 'wrapper', folderId: 'ytpl:list', name: 'Latest', remote: { ...added.remote, sourceIds: ['ytpl:list'] } }, { ...live, name: 'Old live', remote: { ...live.remote, observedAt: 10 } }];
  const expectedPositions = new Map(positions), expectedRows: LibraryVideo[] = [];
  const expected = mergeRemoteCatalog(existing, incoming, expectedPositions, expectedRows);
  const plan = await prepareIndexedRemoteCatalog(existing, incoming, positions, async () => {});
  assert.deepEqual(plan.videos, expected); assert.deepEqual(plan.rows, expectedRows);
  assert.equal(positions.size, 4, 'shared index is untouched until publication');
  for (const [key,value] of plan.positionChanges) positions.set(key,value);
  assert.deepEqual(positions, expectedPositions);
  assert.equal(plan.videos[1], live); assert.equal(existing[0], original);
});

test('cancelled indexed copies leave the original catalog and every index position intact', async () => {
  const existing = Array.from({ length: 100_000 }, (_,i)=>({ ...archivedYoutubeVideo(), id: String(i), remote: undefined }));
  const positions = new Map([['0',0]]); let turns = 0;
  await assert.rejects(prepareIndexedRemoteCatalog(existing, [{ ...existing[0], name: 'Changed' }, { ...existing[0], id: 'added' }], positions, async () => {
    if (++turns === 5) throw Error('cancel');
  }), /cancel/);
  assert.equal(existing[0].name, 'Older upload'); assert.equal(existing.length, 100_000);
  assert.deepEqual([...positions], [['0',0]]);
});

test('saved refresh preparation handles dense sparse ledgers without sorting/exporting their patch keys', async () => {
  let likes = patchSparseRecord<true>({}, Array.from({length:100_000},(_,i)=>[`saved-${i}`,true] as const));
  likes = removeSparseRecordKeys(likes, ['saved-1']);
  const favorites = Object.create({ inherited: true }) as Record<string,true>;
  Object.defineProperty(favorites,'__proto__',{value:true,enumerable:true});
  favorites.favorite = true;
  let turns = 0; const sort = Array.prototype.sort;
  Array.prototype.sort = function(compare) { assert.ok(this.length < 1000, 'Sparse patch keys exported'); return sort.call(this,compare); };
  try {
    const ids = await prepareRefreshSavedIds(favorites, likes, [{id:'history-only',at:1},{id:'favorite',at:2}], async()=>{turns++;});
    assert.equal(ids.size,100_002); assert.ok(turns>100);
    assert.equal(ids.has('saved-1'),false); assert.equal(ids.has('inherited'),false);
    assert.equal(ids.has('__proto__'),true); assert.equal(ids.has('history-only'),true);
  } finally { Array.prototype.sort=sort; }
});

test('routine refresh cancellation reaches prefix materialization and preserves all existing cards', async () => {
  const existing = Array.from({length:5000},(_,i)=>({ ...archivedYoutubeVideo(),id:String(i),remote:undefined }));
  const positions = new Map(existing.map(v=>[v.id,v])); let turns = 0;
  await assert.rejects(mergeRemoteRefreshAsync(existing,[{...existing[0],name:'Changed'}],[],new Set(),{index:positions,turn:async()=>{
    if(++turns===4)throw Error('cancel prefix');
  }}),/cancel prefix/);
  assert.equal(existing[0].name,'Older upload');
});
