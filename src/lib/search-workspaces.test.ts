import test from "node:test";
import assert from "node:assert/strict";
import {
  createSearchWorkspaceStore,
  readSearchWorkspaces,
  reorderWorkspace,
  SEARCH_WORKSPACES_KEY,
  type SearchWorkspaces,
} from "./search-workspaces.ts";
import { createProfileStorage } from "./local-profile-storage.ts";
import { emptySearchQuery } from "./videos/search-query.ts";
const value = (id = "one"): SearchWorkspaces => ({
  version: 1,
  entries: [
    { id, name: "Night racing", scope: "public", query: { ...emptySearchQuery(), text: "racing" } },
  ],
});
function storage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, v: string) => {
      map.set(key, v);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    clear: () => map.clear(),
  };
}
test("create, rename, reorder and removal round-trip without any catalog storage writes", () => {
  const disk = storage(),
    repo = createSearchWorkspaceStore(disk);
  repo.load();
  repo.save(value());
  repo.save({ ...value(), entries: [...value().entries, ...value("two").entries] });
  repo.save(
    reorderWorkspace(
      { ...value(), entries: [...value().entries, ...value("two").entries] },
      "two",
      -1,
    ),
  );
  assert.deepEqual(
    repo.load().entries.map((row) => row.id),
    ["two", "one"],
  );
  repo.save({ version: 1, entries: [{ ...value().entries[0]!, name: "Renamed" }] });
  assert.equal(repo.load().entries[0]?.name, "Renamed");
  repo.save({ version: 1, entries: [] });
  assert.equal(repo.load().entries.length, 0);
  assert.equal(disk.length, 1);
  assert.equal(disk.key(0), SEARCH_WORKSPACES_KEY);
});
test("profile storage cannot read or overwrite another profile saved searches", () => {
  const disk = storage(),
    a = createSearchWorkspaceStore(createProfileStorage(() => disk, "default")),
    b = createSearchWorkspaceStore(
      createProfileStorage(() => disk, "p-11111111-1111-1111-1111-111111111111"),
    );
  a.load();
  b.load();
  a.save(value());
  assert.equal(b.load().entries.length, 0);
  b.save(value("two"));
  assert.equal(a.load().entries[0]?.id, "one");
  assert.equal(b.load().entries[0]?.id, "two");
});

test('reordering follows the visible scope and leaves hidden-scope entries in place',()=>{
 const entries=[value('first').entries[0]!,{...value('private').entries[0]!,scope:'private' as const},value('second').entries[0]!];
 const model:SearchWorkspaces={version:1,entries};
 const moved=reorderWorkspace(model,'first',1);
 assert.deepEqual(moved.entries.map(row=>row.id),['second','private','first']);
 assert.equal(moved.entries[1],entries[1]);
 assert.equal(reorderWorkspace(moved,'first',1),moved);
 assert.equal(reorderWorkspace(model,'private',1),model);
});
test("quota and concurrent-tab failure retain earlier bytes and refuse silent overwrites", () => {
  const disk = storage(),
    repo = createSearchWorkspaceStore(disk);
  repo.load();
  repo.save(value());
  const before = disk.getItem(SEARCH_WORKSPACES_KEY);
  const second = createSearchWorkspaceStore(disk);
  second.load();
  repo.save(value("new"));
  assert.throws(() => second.save(value("lost")), /another tab/);
  assert.equal(repo.load().entries[0]?.id, "new");
  const failed = createSearchWorkspaceStore({
    getItem: () => before,
    setItem: () => {
      throw Error("Quota exceeded");
    },
  });
  failed.load();
  assert.throws(() => failed.save(value("changed")), /Quota/);
  assert.equal(failed.load().entries[0]?.id, "one");
});
test("future, tampered and oversized query envelopes fail closed without rewriting saved data", () => {
  for (const raw of [
    JSON.stringify({ ...value(), version: 2 }),
    JSON.stringify({ ...value(), extra: true }),
    JSON.stringify({ ...value(), entries: [...value().entries, ...value().entries] }),
    JSON.stringify({
      ...value(),
      entries: [{ ...value().entries[0], query: { ...emptySearchQuery(), source: "unknown" } }],
    }),
    "x".repeat(96001),
  ]) {
    let writes = 0;
    const repo = createSearchWorkspaceStore({
      getItem: () => raw,
      setItem: () => {
        writes++;
      },
    });
    assert.throws(() => repo.load());
    assert.equal(writes, 0);
    assert.throws(() => readSearchWorkspaces(raw));
  }
});
