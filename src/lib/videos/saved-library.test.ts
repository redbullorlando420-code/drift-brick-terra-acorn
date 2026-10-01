import assert from "node:assert/strict";
import test from "node:test";
import { recoverSavedShelves, selectSavedCards } from "./saved-library.ts";
import { addCountBatch, emptyCatalogCounts, type CountRow } from "./catalog-counts.ts";
import type { LibraryVideo } from "./types";
const card = (id: string, folderId = "public", isSample = false): LibraryVideo => ({ id, folderId, name: id, path: id, size: 0, mime: "video/mp4", extension: "mp4", addedAt: 1, isSample });

test("All saved resolves hearts and likes once while preserving separate private shelves", () => {
  const rows = [card("heart"), card("like"), card("both"), card("private", "adult"), card("hidden"), card("demo", "public", true), card("unavailable")];
  const hearts: Record<string, true> = { heart: true, both: true, private: true, hidden: true, demo: true, unavailable: true, missingSource: true };
  const likes: Record<string, true> = { like: true, both: true, private: true };
  const privateIds = new Set(["adult"]);
  assert.deepEqual(selectSavedCards(rows, hearts, likes, privateIds, false, { hidden: true }, true).map(v => v.id), ["heart", "like", "both", "unavailable"]);
  assert.deepEqual(selectSavedCards(rows, hearts, likes, privateIds, true, {}, true).map(v => v.id), ["private"]);
  assert.equal(hearts.missingSource, true, "missing sources keep their saved intent");
});

test('warm saved shelves do not reread 100k unwatched titles when display or privacy changes', () => {
  let reads = 0;
  const rows = Array.from({ length: 100_000 }, (_, index) => {
    const video = card(String(index), index === 99_999 ? 'adult' : 'public');
    Object.defineProperty(video, 'id', { get: () => { reads++; return String(index); } });
    return video;
  });
  // An alias is not a favorite ID, even when the sparse lookup resolves it.
  rows[0] = { ...card('not-saved'), path: '50000' };
  const hearts: Record<string, true> = { '50000': true, '99999': true };
  const adults = new Set(['adult']);
  assert.deepEqual(selectSavedCards(rows, hearts, {}, adults, false, {}, false), [rows[50000]]);
  const coldReads = reads;
  for (let index = 0; index < 100; index++) {
    assert.deepEqual(selectSavedCards(rows, hearts, {}, adults, true, {}, true), [rows[99999]]);
    assert.deepEqual(selectSavedCards(rows, hearts, {}, adults, false, { '50000': true }, false), []);
  }
  assert.ok(reads - coldReads < 2000, 'warm work stays proportional to saved matches');
});

test("count packets aggregate a million entries without retaining metadata and remain partition invariant", () => {
  const packet: CountRow[] = Array.from({ length: 500 }, (_, i) => i % 2 ? [1 | 2 | 16, 2] : [32, 0]);
  const counts = emptyCatalogCounts();
  for (let i = 0; i < 2000; i++) addCountBatch(counts, packet);
  assert.deepEqual(counts, { publicCount: 500_000, ytCount: 500_000, twitchCount: 0, liveCount: 0, favCount: 500_000, historyCount: 1_000_000, adultCount: 500_000 });
  const split = emptyCatalogCounts();
  addCountBatch(split, packet.slice(0, 123)); addCountBatch(split, packet.slice(123));
  assert.deepEqual(split, addCountBatch(emptyCatalogCounts(), packet));
});

test("recovery keeps removals and empty shelves from the newest snapshot", () => {
  const old = { favorites: ["removed", "kept"], likes: ["removed-like"], savedAt: 10 };
  const next = { favorites: ["kept"], likes: [], savedAt: 20 };
  assert.deepEqual(recoverSavedShelves(old, next), { favorites: ["kept"], likes: [], authoritative: true });
  assert.deepEqual(recoverSavedShelves(next, old), { favorites: ["kept"], likes: [], authoritative: true });
  assert.deepEqual(recoverSavedShelves(next, { favorites: [], likes: [], savedAt: 30 }), { favorites: [], likes: [], authoritative: true });
  assert.deepEqual(recoverSavedShelves({ favorites: ["legacy"], likes: [] }, { favorites: ["other"], likes: [] }).favorites, ["legacy", "other"]);
});
