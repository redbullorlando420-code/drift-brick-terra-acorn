import { test } from "node:test";
import assert from "node:assert/strict";
import { boundedRecord } from "./bounded-record.ts";

test("thumbnail count and byte budgets apply together", () => {
  const record = { oldest: "x".repeat(100), next: "xx", newest: "xxxx" };
  assert.deepEqual(boundedRecord(record, 2, 12, value => value.length * 2), { next: "xx", newest: "xxxx" });
  assert.deepEqual(boundedRecord(record, 1), { newest: "xxxx" });
});
test("unchanged caches reuse their reference and oversized artwork cannot evict every small image", () => {
  const small = { a: "xx", b: "xx" };
  assert.equal(boundedRecord(small, 3, 20, value => value.length * 2), small);
  assert.deepEqual(boundedRecord({ ...small, giant: "x".repeat(100) }, 3, 20, value => value.length * 2), small);
});
