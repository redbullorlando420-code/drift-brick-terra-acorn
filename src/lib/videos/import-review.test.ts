import test from "node:test";
import assert from "node:assert/strict";
import { heldImportBatch, emptyImportReview, importReviewRow } from "./import-review.ts";
test("held-name catch-up is explicit, filtered, bounded and preserves exclusions, failures and verified identities", () => {
  const queries = Array.from({ length: 10000 }, (_, i) => "Creator Name " + i),
    state = emptyImportReview();
  state.choices["creator name 0"] = "skip";
  state.choices["creator name 1"] = "failed";
  state.failures["creator name 1"] = "Ambiguous identity";
  const resolved = new Set(["creator name 2"]);
  const batch = heldImportBatch("youtube", queries, state, resolved);
  assert.equal(batch.length, 50);
  assert.equal(batch[0]!.query, "Creator Name 3");
  assert.equal(
    importReviewRow("youtube", queries[3]!, state, resolved).status,
    "held",
    "planning does not silently include names",
  );
  state.filter = "Name 9999";
  assert.deepEqual(
    heldImportBatch("youtube", queries, state, resolved).map((row) => row.query),
    ["Creator Name 9999"],
  );
  assert.deepEqual(heldImportBatch("twitch", ["notyoda"], state, resolved), []);
});
