import test from "node:test";
import assert from "node:assert/strict";
import { createDeskTasteStore } from "./desk-taste-store.ts";
import { createProfileStorage } from "./local-profile-storage.ts";
import {
  DESK_TASTE_KEY,
  emptyDeskTaste,
  readDeskTaste,
  resolveDeskTaste,
  validateDeskTaste,
} from "./videos/desk-taste.ts";
const base = { weights: { favorite: 3, like: 2, topic: 1 }, novelty: 0 };
function storage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    clear: () => map.clear(),
  };
}
test("temporary, saved and shared precedence; reset touches one desk only", () => {
  const disk = storage(),
    store = createDeskTasteStore(disk);
  store.load();
  disk.setItem("feedback", "keep");
  store.save("movies", base);
  store.save("twitch", { ...base, novelty: 2 });
  assert.equal(resolveDeskTaste(store.getSnapshot().saved, {}, "twitch").novelty, 2);
  store.apply("twitch", { ...base, novelty: -2 });
  const before = disk.getItem(DESK_TASTE_KEY);
  assert.equal(
    resolveDeskTaste(store.getSnapshot().saved, store.getSnapshot().temporary, "twitch").origin,
    "temporary desk mix",
  );
  const reload = createDeskTasteStore(disk);
  reload.load();
  assert.equal(
    resolveDeskTaste(reload.getSnapshot().saved, reload.getSnapshot().temporary, "twitch").novelty,
    2,
  );
  assert.equal(before, disk.getItem(DESK_TASTE_KEY));
  store.reset("twitch");
  assert.deepEqual(store.getSnapshot().saved.desks.movies, base);
  assert.equal(disk.getItem("feedback"), "keep");
  assert.equal(
    resolveDeskTaste(store.getSnapshot().saved, store.getSnapshot().temporary, "twitch").origin,
    "shared Guide preset",
  );
});
test("strict version/fields/ranges reject unknown formats without replacement writes", () => {
  for (const raw of [
    "{}",
    "null",
    '{"version":2,"desks":{}}',
    '{"version":1,"desks":{"adults":{}}}',
  ])
    assert.throws(() => readDeskTaste(raw));
  for (const value of [
    { ...base, novelty: 3 },
    { ...base, novelty: 0.5 },
    { ...base, weights: { ...base.weights, topic: 4 } },
    { ...base, extra: true },
  ])
    assert.throws(() => validateDeskTaste(value));
  const disk = storage();
  disk.setItem(DESK_TASTE_KEY, '{"version":2,"desks":{}}');
  const store = createDeskTasteStore(disk);
  store.load();
  assert(store.getSnapshot().error);
  assert.throws(() => store.save("twitch", base));
  assert.equal(disk.getItem(DESK_TASTE_KEY), '{"version":2,"desks":{}}');
});
test("quota and concurrent edits retain active choices and exact prior bytes", () => {
  const disk = storage(),
    store = createDeskTasteStore(disk);
  store.load();
  store.save("twitch", base);
  store.apply("twitch", { ...base, novelty: 1 });
  const prior = store.getSnapshot(),
    bytes = disk.getItem(DESK_TASTE_KEY),
    set = disk.setItem;
  disk.setItem = () => {
    throw Error("quota");
  };
  assert.throws(() => store.save("twitch", { ...base, novelty: 2 }), /quota/);
  assert.equal(store.getSnapshot(), prior);
  assert.equal(disk.getItem(DESK_TASTE_KEY), bytes);
  disk.setItem = set;
  disk.setItem(DESK_TASTE_KEY, JSON.stringify(emptyDeskTaste()));
  assert.throws(() => store.reset("twitch"), /another tab/);
  assert.equal(store.getSnapshot(), prior);
});
test("same browser profile namespaces remain isolated", () => {
  const disk = storage(),
    a = createDeskTasteStore(createProfileStorage(() => disk, "default")),
    b = createDeskTasteStore(
      createProfileStorage(() => disk, "p-11111111-1111-1111-1111-111111111111"),
    );
  a.load();
  b.load();
  a.save("twitch", { ...base, novelty: 2 });
  assert.deepEqual(b.load().saved, emptyDeskTaste());
  b.save("youtube", base);
  assert.equal(a.load().saved.desks.youtube, undefined);
  assert.equal(a.getSnapshot().saved.desks.twitch?.novelty, 2);
});
