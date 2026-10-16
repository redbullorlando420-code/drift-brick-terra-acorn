import test from "node:test";
import assert from "node:assert/strict";
import { CompactPostings } from "./compact-postings.ts";
import { createSearchTokenQuery } from "./search-token-query.ts";
test("prefix, substring, AND, duplicate tokens and rare matches preserve catalog order", () => {
  const postings = new CompactPostings();
  [
    ["archive", "science"],
    ["archival", "science-fiction"],
    ["archive", "travel"],
    ["space-science"],
  ].forEach((tags, id) => tags.forEach((tag) => postings.add(tag, id)));
  const query = createSearchTokenQuery(postings, () => 4);
  assert.deepEqual([...query.search(["arch", "science"])], [0, 1]);
  assert.deepEqual([...query.search(["science", "science"])], [0, 1, 3]);
  assert.deepEqual([...query.search(["scie"])], [0, 1, 3]);
  assert.deepEqual([...query.search(["cie"])], []);
  assert.deepEqual([...query.search(["none", "science"])], []);
});
test("common words in subsequent searches reuse compact expansions under a fixed budget", () => {
  const postings = new CompactPostings();
  for (let id = 0; id < 100_000; id++) {
    postings.add("archive", id);
    postings.add("science", id);
    postings.add(String(id), id);
  }
  const query = createSearchTokenQuery(postings, () => 100_000);
  assert.deepEqual([...query.search(["archive", "99999"])], [99999]);
  const scans = query.diagnostics().dictionaryScans;
  assert.deepEqual([...query.search(["archive", "99998"])], [99998]);
  assert.equal(query.diagnostics().dictionaryScans, scans + 1);
  assert.ok(query.diagnostics().hits > 0);
  assert.ok(query.diagnostics().cachedBytes <= 2 * 1024 * 1024);
});
test("cache eviction and index mutation cannot return stale matches or detached buffers", () => {
  const postings = new CompactPostings();
  ["a", "b", "c"].forEach((tag, id) => postings.add(tag, id));
  let size = 3;
  const query = createSearchTokenQuery(postings, () => size, 8, 2);
  const transferred = query.search(["a"]);
  structuredClone(transferred, { transfer: [transferred.buffer] });
  assert.deepEqual([...query.search(["a"])], [0]);
  query.search(["b"]);
  query.search(["c"]);
  assert.equal(query.diagnostics().cachedTerms, 2);
  assert.ok(query.diagnostics().cachedBytes <= 8);
  postings.add("a", 3);
  size = 4;
  query.clear();
  assert.deepEqual([...query.search(["a"])], [0, 3]);
});
