import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/"))
      return next(new URL("../src/" + specifier.slice(2) + ".ts", import.meta.url).href, context);
    try {
      return next(specifier, context);
    } catch (error) {
      if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier))
        return next(specifier + ".ts", context);
      throw error;
    }
  },
});
const {
  validCatalogOperation,
  validCatalogControl,
  CATALOG_OPERATION_LIMITS,
  createCatalogMutations,
} = await import("../src/lib/videos/catalog-mutations.ts");
const { SliceWriter } = await import("../src/lib/slice-writer.ts");
const video = { id: "one", folderId: "folder" },
  edit = {
    id: "one",
    nonce: "fixture",
    at: 1,
    tags: ["manual"],
    provenance: { tags: { manual: "manual" }, lockedFields: ["tags"], updatedAt: 1 },
  };
test("versioned operations accept bounded deltas, not future or oversized batches", () => {
  assert(validCatalogOperation({ version: 1, kind: "remote", rows: Array(64).fill(video) }));
  for (const value of [
    null,
    {},
    { version: 2, kind: "remote", rows: [] },
    { version: 1, kind: "unknown", rows: [] },
    { version: 1, kind: "remote", rows: Array(65).fill(video) },
    { version: 1, kind: "local", rows: [{ id: "no-folder" }] },
    { version: 1, kind: "cleanup", removed: Array(1001).fill("id"), cleanup: { recentKeys: [] } },
  ])
    assert.equal(validCatalogOperation(value), false);
  assert.deepEqual(CATALOG_OPERATION_LIMITS, {
    rows: 64,
    pending: 8,
    bytes: 8 * 1024 ** 2,
    mirror: 256,
  });
});
test("manual records validate paired tags, provenance, field clocks and category shape", () => {
  assert(validCatalogOperation({ version: 1, kind: "edit", edit }));
  assert(
    validCatalogOperation({
      version: 1,
      kind: "edit",
      edit: { ...edit, tags: [], category: "", field: "category" },
    }),
  );
  for (const patch of [
    { tags: [1] },
    { provenance: { tags: "bad" } },
    { provenance: { tags: {}, manualCategoryAt: NaN } },
    { provenance: { tags: {}, lockedFields: ["unknown"] } },
    { nonce: "" },
    { category: "x".repeat(81) },
    { field: "unknown" },
  ])
    assert.equal(
      validCatalogOperation({ version: 1, kind: "edit", edit: { ...edit, ...patch } }),
      false,
    );
});
test("unknown and corrupt control generations remain rejected instead of reset", () => {
  assert(validCatalogControl(undefined));
  assert(validCatalogControl({ version: 1, sequence: 0 }));
  assert(validCatalogControl({ version: 1, sequence: 4, committed: 3 }));
  for (const value of [
    { version: 2, sequence: 0 },
    { version: 1, sequence: "1" },
    { version: 1, sequence: -1 },
    { version: 1, sequence: Number.MAX_SAFE_INTEGER + 1 },
    { version: 1, sequence: 2, committed: NaN },
    null,
  ])
    assert.equal(validCatalogControl(value), false);
});
test("explicit snapshot retry invalidates only the slice writer reference cache", () => {
  const writer = new SliceWriter(),
    same = {},
    calls = [];
  writer.write("prefs", [same], () => calls.push("first"));
  writer.write("prefs", [same], () => calls.push("skipped"));
  writer.reset();
  writer.write("prefs", [same], () => calls.push("retried"));
  assert.deepEqual(calls, ["first", "retried"]);
});
test("field clocks restore category separately from newer automatic tags without walking base dictionaries", async () => {
  const saved = Object.fromEntries(
    ["localStorage", "IDBKeyRange"].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  const rows = [
    {
      ...edit,
      id: "one",
      at: 20,
      field: "category",
      category: "Racing",
      provenance: {
        tags: { old: "legacy" },
        category: "manual",
        lockedFields: ["category"],
        updatedAt: 20,
        manualCategoryAt: 20,
      },
    },
  ];
  let reads = 0;
  const db = {
    close() {},
    transaction(name) {
      assert.equal(name, "activity");
      return {
        objectStore() {
          return {
            getAll(range, limit) {
              reads++;
              assert.equal(limit, 256);
              const request = {};
              setImmediate(() => {
                request.result = structuredClone(rows);
                request.onsuccess();
              });
              return request;
            },
          };
        },
      };
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => null },
  });
  Object.defineProperty(globalThis, "IDBKeyRange", {
    configurable: true,
    value: { bound: (...args) => args },
  });
  try {
    const factory = createCatalogMutations(async () => db),
      base = {
        tags: { one: ["new-auto"] },
        metadataProvenance: {
          one: {
            tags: { "new-auto": "provider:youtube" },
            lockedFields: ["category"],
            category: "manual",
            updatedAt: 30,
            manualCategoryAt: 20,
          },
        },
        categories: { one: "old snapshot", unrelated: "keep" },
      };
    const result = await factory.restore(base);
    assert.deepEqual(result.tags.one, ["new-auto"]);
    assert.equal(result.categories.one, "Racing");
    assert.equal(result.categories.unrelated, "keep");
    assert.equal(base.categories.one, "old snapshot");
    assert.equal(result.metadataProvenance.one.updatedAt, 30);
    assert.equal(reads, 1);
    const newer = await factory.restore({
      ...base,
      metadataProvenance: { one: { ...base.metadataProvenance.one, manualCategoryAt: 40 } },
      categories: { one: "new manual" },
    });
    assert.equal(newer.categories.one, "new manual");
  } finally {
    for (const [key, descriptor] of Object.entries(saved))
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
  }
});
