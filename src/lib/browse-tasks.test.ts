import test from "node:test";
import assert from "node:assert/strict";
import {
  createBrowseHistory,
  createBrowseBookmarkStore,
  validateBrowseTask,
  readBrowseBookmarks,
  resolveBrowseAnchor,
  BROWSE_BOOKMARKS_KEY,
  type BrowseTask,
} from "./browse-tasks.ts";
import { createProfileStorage } from "./local-profile-storage.ts";
const task = (source = "home", query = ""): BrowseTask => ({
  source,
  query,
  sort: "name",
  view: "grid",
  private: false,
  scroll: 0,
  options: {},
});
function storage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  };
}
test("three browse tasks restore exact filters, desk controls, sort, detail and logical anchor", () => {
  const first = {
    ...task("youtube", "source:youtube racing"),
    sort: "added" as const,
    scroll: 2200,
    options: { youtubeExploreVisible: true, youtubeTagFilter: "racing" },
    anchor: { ids: ["yt:1", "yt:2"], top: 104, grid: 0 },
  };
  const h = createBrowseHistory(first);
  h.push({ ...task("twitch", "source:twitch flying"), view: "list" });
  h.push({ ...task("favorites"), detail: "local:1" });
  assert.equal(h.move(-1)?.view, "list");
  assert.deepEqual(h.move(-1), first);
  assert.equal(h.move(-1), undefined);
  assert.equal(h.move(1)?.source, "twitch");
  h.push(task("history"));
  assert.equal(h.state().forward, false);
  assert.equal(h.current().source, "history");
});
test("history has 32 small snapshots, checkpoints do not add entries, private tasks purge on lock", () => {
  const h = createBrowseHistory(task());
  for (let i = 0; i < 100; i++) h.push(task("home", String(i)));
  assert.equal(h.state().length, 32);
  h.checkpoint({ ...h.current(), scroll: 200 });
  assert.equal(h.state().length, 32);
  h.push({ ...task("adults", "private query"), private: true });
  h.clearPrivate();
  assert.equal(h.current().source, "home");
  while (h.state().back) {
    assert.equal(h.move(-1)?.private, false);
  }
});
test("versioned places reject malformed/future data and oversized neighborhoods without writing", () => {
  for (const bad of [
    { version: 2, entries: [] },
    { version: 1, entries: [], future: true },
    { version: 1, entries: [{ id: "a", task: { ...task(), options: { unknown: true } } }] },
  ])
    assert.throws(() => readBrowseBookmarks(JSON.stringify(bad)));
  assert.throws(() =>
    validateBrowseTask({ ...task(), anchor: { ids: ["1", "2", "3", "4", "5"], top: 0, grid: 0 } }),
  );
  assert.throws(() => validateBrowseTask({ ...task(), scroll: NaN }));
  assert.throws(() => validateBrowseTask({ ...task(), options: { twitchSort: "illegal" } }));
  assert.throws(() => validateBrowseTask({ ...task(), title: "Stale title" }));
  const good = validateBrowseTask({
    ...task(),
    options: { twitchContentFilter: "past-broadcast" },
  });
  assert.equal(good.options.twitchContentFilter, "past-broadcast");
});
test("bookmark conflict and quota failures retain prior bytes; explicit removal never touches media", () => {
  const s = storage(),
    a = createBrowseBookmarkStore(s),
    b = createBrowseBookmarkStore(s);
  a.load();
  b.load();
  const value = { version: 1 as const, entries: [{ id: "a", task: task("youtube", "racing") }] };
  a.save(value);
  const old = s.getItem(BROWSE_BOOKMARKS_KEY);
  assert.throws(() => b.save({ version: 1, entries: [] }), /another tab/);
  assert.equal(s.getItem(BROWSE_BOOKMARKS_KEY), old);
  const quota = createBrowseBookmarkStore({
    getItem: s.getItem,
    setItem: () => {
      throw Error("Quota");
    },
  });
  quota.load();
  assert.throws(() => quota.save({ version: 1, entries: [] }), /Quota/);
  assert.equal(s.getItem(BROWSE_BOOKMARKS_KEY), old);
  a.save({ version: 1, entries: [] });
  assert.deepEqual(a.load().entries, []);
});
test("profile namespaces isolate saved places and future schemas preserve original bytes", () => {
  const native = storage(),
    id = "p-12345678-1234-1234-1234-123456789abc",
    a = createBrowseBookmarkStore(createProfileStorage(() => native, "default")),
    b = createBrowseBookmarkStore(createProfileStorage(() => native, id));
  a.load();
  a.save({ version: 1, entries: [{ id: "default", task: task("home", "private-to-profile") }] });
  assert.equal(b.load().entries.length, 0);
  native.setItem(BROWSE_BOOKMARKS_KEY, '{"version":3,"entries":[]}');
  assert.throws(() => a.load());
  assert.equal(native.getItem(BROWSE_BOOKMARKS_KEY), '{"version":3,"entries":[]}');
});
test("canonical identity wins after reorder or verified rename, then bounded neighbors; no title/path guessing", async () => {
  const anchor = { ids: ["old-local", "nearby"], grid: 0, top: 100 },
    canonical = (id: string) => (id === "old-local" ? "canonical" : id);
  const rows = (ids: string[]) => ids.map((id) => ({ id }));
  assert.deepEqual(
    await resolveBrowseAnchor(anchor, rows(["new-unverified", "nearby", "canonical"]), canonical),
    { index: 2, exact: true },
  );
  assert.deepEqual(await resolveBrowseAnchor(anchor, rows(["nearby"]), canonical), {
    index: 0,
    exact: false,
  });
  assert.equal(await resolveBrowseAnchor(anchor, rows(["unrelated"])), undefined);
});
test("large result identity scans yield and obsolete restores cancel before reading more rows", async () => {
  let turns = 0;
  const rows = Array.from({ length: 100000 }, (_, i) => ({ id: String(i) }));
  const anchor = { ids: ["99999"], top: 0, grid: 0 };
  assert.deepEqual(
    await resolveBrowseAnchor(
      anchor,
      rows,
      (id) => id,
      async () => {
        turns++;
      },
    ),
    { index: 99999, exact: true },
  );
  assert(turns >= 196);
  let visits = 0;
  await assert.rejects(
    () =>
      resolveBrowseAnchor(
        anchor,
        rows,
        (id) => {
          visits++;
          return id;
        },
        async () => {
          if (visits > 512) throw Error("Cancelled");
        },
      ),
    /Cancelled/,
  );
  assert(visits < 1026);
});
