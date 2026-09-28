import assert from "node:assert/strict";
import test from "node:test";
import { mergeCreatorCollections, normalizeCreatorCollections } from "./follow-collections.ts";

test("recovery pack collection merge keeps existing membership and adds imported members", () => {
  const current = [{ id: "collection:1", name: "Favorites", followIds: ["yt:one"], createdAt: 1 }];
  const incoming = [{ id: "collection:1", name: "Favorites", followIds: ["tw:two"], createdAt: 1 }];
  assert.deepEqual(mergeCreatorCollections(current, incoming)[0]?.followIds, ["yt:one", "tw:two"]);
});

test("malformed collection data cannot enter the saved groups", () => {
  assert.deepEqual(normalizeCreatorCollections([{ id: "x", name: "", followIds: ["yt:one"] }, { id: "y", name: "OK", followIds: ["yt:one", "yt:one", null] }]), [
    { id: "y", name: "OK", followIds: ["yt:one"], createdAt: 0 },
  ]);
});
