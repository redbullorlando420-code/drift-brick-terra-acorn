import test from "node:test";
import assert from "node:assert/strict";
import { describeSearchCount, type SearchCountEvidence } from "./search-count-evidence.ts";
const base: SearchCountEvidence = {
  version: 1,
  kind: "snapshot",
  value: 120,
  scope: "saved catalog",
  complete: true,
};
test("completed snapshot, pending index, loaded page and provider estimate carry different evidence", () => {
  assert.match(describeSearchCount(base).label, /120 matches in the loaded catalog/);
  assert.match(describeSearchCount({ ...base, complete: false }).label, /provisional/);
  assert.match(describeSearchCount({ ...base, kind: "pending" }).label, /pending/);
  assert(!describeSearchCount({ ...base, kind: "pending" }).label.includes("120"));
  assert.match(
    describeSearchCount({ ...base, kind: "page", scope: "YouTube", hasMore: true }).detail,
    /complete total is unknown/,
  );
  assert.match(
    describeSearchCount({ ...base, kind: "estimate", scope: "YouTube" }).label,
    /About 120/,
  );
  assert.match(
    describeSearchCount({ ...base, kind: "estimate", scope: "YouTube" }).detail,
    /not a verified complete total/,
  );
});
test("unknown, malformed and future evidence never fabricates zero or a complete total", () => {
  for (const row of [
    { ...base, version: 2 },
    { ...base, value: NaN },
    { ...base, value: -1 },
    { ...base, value: 1.5 },
    { ...base, kind: "other" },
    { ...base, kind: "unavailable", value: undefined },
  ])
    assert.match(describeSearchCount(row as SearchCountEvidence).label, /unavailable/);
  assert.match(
    describeSearchCount({ ...base, kind: "page", hasMore: false }).detail,
    /No complete provider total/,
  );
});
