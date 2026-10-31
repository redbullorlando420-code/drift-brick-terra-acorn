import test from "node:test";
import assert from "node:assert/strict";
import { readHubStore } from "./hub-storage.ts";
const item = {
  name: "Saved print.stl",
  path: "Prints/saved.stl",
  size: 100,
  addedAt: 1,
  id: "blob:kept",
};
const fallback = { prints: [item], games: [] };
test("invalid top-level hub values recover without mutating the saved input", () => {
  for (const value of [null, 0, "bad", [], true])
    assert.deepEqual(readHubStore(value, fallback), fallback);
});
test("partial legacy stores recover each collection independently and keep explicit empty arrays", () => {
  assert.deepEqual(readHubStore({ games: [item] }, fallback), { prints: [item], games: [item] });
  assert.deepEqual(readHubStore({ prints: [], games: {} }, fallback), { prints: [], games: [] });
});
test("damaged individual entries cannot crash a workspace or displace valid records", () => {
  const value = {
    prints: [
      null,
      {},
      item,
      { ...item, name: 7 },
      { ...item, size: NaN },
      { ...item, path: "" },
      { ...item, addedAt: -1 },
      { ...item, id: 4 },
    ],
    games: "wrong",
  };
  const before = structuredClone(value);
  assert.deepEqual(readHubStore(value, fallback), { prints: [item], games: [] });
  assert.deepEqual(value, before);
});
test("print blob references, sample sources, launch URLs and zero-byte shortcuts survive", () => {
  const game = {
    ...item,
    size: 0,
    launchUrl: "steam://run/10",
    iconData: "data:image/png;base64,AA==",
  };
  const sample = { ...item, sampleSrc: "/samples/prints/cube.stl" };
  assert.deepEqual(readHubStore({ prints: [sample], games: [game] }, fallback), {
    prints: [sample],
    games: [game],
  });
});
