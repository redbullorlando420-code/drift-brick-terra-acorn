import test from "node:test";
import assert from "node:assert/strict";
import { createWeakSnapshotCache } from "./weak-snapshot-cache.ts";
test("a new component scope reuses exact input fields; activity or feedback changes invalidate it", () => {
  const scope = { videos: [], tags: {}, views: {} };
  const result = { titles: 2 };
  const cache = createWeakSnapshotCache<typeof scope, typeof result>(60_000, {
    setTimer: () => 1,
    clearTimer: () => {},
  });
  cache.put(scope, 5, result);
  assert.equal(cache.get({ ...scope }, 5), result);
  assert.equal(cache.get({ ...scope, unavailable: {} } as typeof scope, 5), undefined);
  assert.equal(cache.get({ videos: scope.videos, tags: scope.tags } as typeof scope, 5), undefined);
  assert.equal(cache.get({ ...scope, videos: [] }, 5), undefined);
  assert.equal(cache.get({ ...scope, views: { one: 1 } }, 5), undefined);
  assert.equal(cache.get(scope, 6), undefined);
  cache.clear();
  assert.equal(cache.get(scope, 5), undefined);
});
test("automatic retirement releases a completed snapshot without needing another page visit", () => {
  let now = 0,
    expire = () => {},
    clears = 0;
  const cache = createWeakSnapshotCache<{ videos: object }, { titles: number }>(60_000, {
    now: () => now,
    setTimer: (work) => {
      expire = work;
      return 1;
    },
    clearTimer: () => {
      clears++;
    },
  });
  const scope = { videos: [] };
  cache.put(scope, 0, { titles: 2 });
  now = 59_999;
  assert.ok(cache.get(scope, 0));
  expire();
  assert.equal(cache.get(scope, 0), undefined);
  assert.ok(clears > 0);
  cache.put(scope, 0, { titles: 3 });
  now = 120_000;
  assert.equal(cache.get(scope, 0), undefined);
});
