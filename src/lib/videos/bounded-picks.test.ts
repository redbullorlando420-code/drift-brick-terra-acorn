import { test } from "node:test";
import assert from "node:assert/strict";
import { takeBestMapped } from "./bounded-picks.ts";

test("bounded picks match a full sort while retaining only the requested window", () => {
  const values = Array.from({ length: 100_000 }, (_, index) => ((index * 7919) % 100_003));
  const expected = values.filter((value) => value % 3 !== 0).sort((a, b) => b - a).slice(0, 48);
  assert.deepEqual(takeBestMapped(values, 48, (value) => value % 3 ? value : null, (a, b) => b - a), expected);
  assert.deepEqual(takeBestMapped([3, 1, 2], 0, (value) => value, (a, b) => a - b), []);
  assert.deepEqual(takeBestMapped([3, 1, 2], 5, (value) => value, (a, b) => a - b), [1, 2, 3]);
});
