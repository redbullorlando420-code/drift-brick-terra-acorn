import { test } from "node:test";
import assert from "node:assert/strict";
import { lookupVideo, lookupVideos } from "./video-lookup.ts";
import type { LibraryVideo } from "./types";

test("playback updates reuse requested cards without scanning a large snapshot again", () => {
  let reads = 0;
  const videos = Array.from({ length: 90_000 }, (_, index) => ({ get id() { reads++; return String(index); } } as LibraryVideo));
  assert.equal(lookupVideo(videos, "89999"), videos[89999]);
  const afterOpen = reads;
  for (let tick = 0; tick < 100; tick++) assert.equal(lookupVideo(videos, "89999"), videos[89999]);
  assert.equal(reads, afterOpen);
  assert.deepEqual(lookupVideos(videos, ["1", "2", "89999"]), [videos[1], videos[2], videos[89999]]);
  assert.ok(reads - afterOpen < 10);
});

test("missing cards and changed card objects invalidate with a new immutable snapshot", () => {
  const old = [{ id: "one" }] as LibraryVideo[];
  assert.equal(lookupVideo(old, "missing"), undefined);
  const added = { id: "missing" } as LibraryVideo;
  const replacement = { id: "one", name: "Updated" } as LibraryVideo;
  const next = [replacement, added];
  assert.equal(lookupVideo(next, "missing"), added);
  assert.equal(lookupVideo(next, "one"), replacement);
  assert.equal(lookupVideo(old, "one"), old[0]);
  assert.equal(lookupVideo(next, null), undefined);
});

test("bounded lookup eviction retains every card in the current batched request", () => {
  const videos = Array.from({ length: 140 }, (_, index) => ({ id: String(index) } as LibraryVideo));
  for (let index = 0; index < 128; index++) lookupVideo(videos, String(index));
  assert.deepEqual(lookupVideos(videos, ["0", "128", "139", "missing"]), [videos[0], videos[128], videos[139], undefined]);
});
test('position hints keep playback lookup bounded across provider merges and validate moved or changed rows', () => {
  let reads = 0;
  const rows = Array.from({ length: 100_000 }, (_, i) => ({ get id() { reads++; return `position:${i}`; } } as LibraryVideo));
  const id = 'position:99999';
  assert.equal(lookupVideo(rows, id), rows[99999]);
  const coldReads = reads;
  for (let i = 0; i < 50; i++) assert.equal(lookupVideo([...rows, { id: `new:${i}` } as LibraryVideo], id), rows[99999]);
  assert.ok(reads - coldReads <= 50, 'new catalog snapshots inspect one position, not the full 100k prefix');
  const replacement = { id, name: 'Refreshed' } as LibraryVideo;
  const changed = [...rows]; changed[99999] = replacement;
  assert.equal(lookupVideo(changed, id), replacement);
  const moved = [replacement, ...rows.slice(0, 99999)];
  assert.equal(lookupVideo(moved, id), replacement);
  assert.equal(lookupVideo(rows.slice(0, 500), id), undefined);
});
