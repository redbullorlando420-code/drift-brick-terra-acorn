import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, n) {
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});
const { consumeCatalogPages } = await import("../src/lib/videos/catalog-page-reader.ts");
const { withoutWatchHistory } = await import("../src/lib/videos/history-reset.ts");
const { readSourceVisibility } = await import("../src/lib/videos/source-visibility.ts");
test("consumer acknowledgement prevents a second read while admission is slow", async () => {
  let reads = 0,
    release;
  const paused = new Promise((r) => (release = r)),
    admitted = [];
  const run = consumeCatalogPages(
    async (after, size) => {
      reads++;
      const start = (after ?? -1) + 1;
      return { keys: [start, start + 1], rows: [start, start + 1] };
    },
    {
      pageSize: 2,
      accept: async (rows) => {
        admitted.push(...rows);
        if (admitted.length === 2) await paused;
        else throw Error("stop");
      },
    },
  );
  await new Promise((r) => setImmediate(r));
  assert.equal(reads, 1);
  assert.deepEqual(admitted, [0, 1]);
  release();
  await assert.rejects(run, /stop/);
  assert.equal(reads, 2);
});
test("100k records pause, cancel mid-page and resume from the last acknowledged cursor exactly once", async () => {
  const total = 100000,
    seen = [],
    controller = new AbortController();
  let checkpoint,
    highest = 0;
  const read = async (after, size) => {
    const start = (after ?? -1) + 1,
      rows = Array.from({ length: Math.min(size, total - start) }, (_, i) => start + i);
    return { keys: rows, rows };
  };
  await assert.rejects(
    consumeCatalogPages(read, {
      signal: controller.signal,
      progress: (p) => {
        highest = Math.max(highest, p.pending);
        if (!p.pending) checkpoint = p.after;
      },
      accept: async (rows) => {
        if (seen.length >= 1024) {
          controller.abort();
          controller.signal.throwIfAborted();
        }
        seen.push(...rows);
      },
    }),
  );
  assert.equal(seen.length, 1024);
  assert.equal(checkpoint, 1023);
  await consumeCatalogPages(read, {
    after: checkpoint,
    accept: async (rows) => {
      seen.push(...rows);
    },
  });
  assert.equal(seen.length, total);
  assert.equal(new Set(seen).size, total);
  assert.equal(seen.at(-1), 99999);
  assert.equal(highest, 1);
});
test("cancellation while waiting for permission to read creates no new page", async () => {
  let reads = 0;
  const c = new AbortController();
  await assert.rejects(
    consumeCatalogPages(
      async () => {
        reads++;
        return { keys: [], rows: [] };
      },
      { signal: c.signal, beforeRead: async () => c.abort(), accept: async () => {} },
    ),
  );
  assert.equal(reads, 0);
});
test("invalid pages and stalled cursors reject instead of spinning", async () => {
  await assert.rejects(
    consumeCatalogPages(async () => ({ keys: [1], rows: [] }), { accept: async () => {} }),
    /Invalid/,
  );
  await assert.rejects(
    consumeCatalogPages(async () => ({ keys: [2], rows: [2] }), {
      after: 2,
      accept: async () => {},
    }),
    /advance/,
  );
});
test("watch history reset preserves all unrelated personal fields and does not mutate its recovery snapshot", () => {
  const rows = [
      {
        store: "activity",
        key: "preferences",
        value: { history: [{ id: "v" }], tags: { v: ["racing"] } },
      },
      {
        store: "activity",
        key: "primary",
        value: { history: [{ id: "v" }], viewCounts: { v: 9 } },
      },
      { store: "activity", key: "history", value: { entries: [{ id: "v" }] } },
      { store: "activity", key: "resume", value: { resumeProgress: { v: { t: 20 } } } },
      { store: "activity-journal", key: "a", value: { key: "a" } },
    ],
    before = {
      version: 1,
      rows,
      mirrors: { "reelcase.prefs.v4": "old", "reelcase.history.v1": "old" },
    };
  const result = withoutWatchHistory(before, 100);
  assert.deepEqual(result.rows.find((r) => r.key === "history").value.entries, []);
  assert.deepEqual(result.rows.find((r) => r.key === "primary").value.viewCounts, { v: 9 });
  assert.deepEqual(result.rows.find((r) => r.key === "preferences").value.tags, { v: ["racing"] });
  assert.equal(
    result.rows.find((r) => r.key === "resume"),
    rows[3],
  );
  assert.equal(result.rows.length, 4);
  assert.equal(rows[0].value.history.length, 1);
  assert.equal(before.mirrors["reelcase.prefs.v4"], "old");
  assert.equal(result.mirrors["reelcase.prefs.v4"], null);
});
test("hidden source ledger rejects future versions, duplicate identities and oversized journals", () => {
  const row = { id: "dir:one", at: 1, folder: { id: "dir:one", name: "One", kind: "directory" } };
  assert.equal(readSourceVisibility(undefined).hidden.length, 0);
  assert.equal(
    readSourceVisibility({ version: 1, revision: 0, hidden: [row] }).hidden[0].id,
    "dir:one",
  );
  for (const raw of [
    { version: 2, hidden: [] },
    { version: 1, revision: 0, hidden: [row, row] },
    {
      version: 1,
      revision: 0,
      hidden: Array.from({ length: 257 }, (_, i) => ({
        ...row,
        id: String(i),
        folder: { ...row.folder, id: String(i) },
      })),
    },
  ])
    assert.throws(() => readSourceVisibility(raw));
});

test('hidden private folders keep retained titles outside public surfaces even when the visible folder array is unchanged',async()=>{
 const {setHiddenPrivateSources}=await import('../src/lib/videos/hidden-source-privacy.ts'),{adultFolderIds}=await import('../src/lib/videos/adult-providers.ts');
 const folders=[];const before=adultFolderIds(folders);assert(!before.has('dir:private'));setHiddenPrivateSources(['dir:private']);assert(adultFolderIds(folders).has('dir:private'));setHiddenPrivateSources([]);assert(!adultFolderIds(folders).has('dir:private'));
});
