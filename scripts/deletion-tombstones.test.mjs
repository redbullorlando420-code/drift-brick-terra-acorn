import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, n) {
    if (s.startsWith("@/"))
      return n(new URL("../src/" + s.slice(2) + ".ts", import.meta.url).href, c);
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});
const { emptyDeletions, readDeletions, deletionKeys, deletedBy, deletionCard, DELETION_LIMIT } =
  await import("../src/lib/videos/deletion-tombstones.ts");
const video = {
  id: "saved-id",
  folderId: "yt:one",
  name: "Saved title",
  path: "",
  mime: "video/youtube",
  extension: "yt",
  size: 0,
  addedAt: 1,
  remote: { kind: "youtube", videoId: "abcdefghijk" },
};
const entry = {
  id: video.id,
  keys: deletionKeys(video),
  at: 1,
  reason: "manual",
  private: false,
  video,
};
test("canonical provider identity suppresses a different saved row ID without matching another video by title", () => {
  const ledger = { version: 1, revision: 1, entries: [entry] };
  assert.equal(deletedBy(ledger, { ...video, id: "late-response" }), entry);
  assert.equal(
    deletedBy(ledger, {
      ...video,
      id: "another",
      remote: { kind: "youtube", videoId: "zzzzzzzzzzz" },
    }),
    undefined,
  );
});
test("deletion recovery rejects future, duplicate, malformed and over-budget records without normalizing them away", () => {
  assert.deepEqual(readDeletions(undefined), emptyDeletions());
  assert.equal(readDeletions({ version: 1, revision: 1, entries: [entry] }).entries[0], entry);
  for (const value of [
    null,
    { version: 2, revision: 1, entries: [] },
    { version: 1, revision: -1, entries: [] },
    { version: 1, revision: 1, entries: [entry, entry] },
    { version: 1, revision: 1, entries: [{ ...entry, private: undefined }] },
    { version: 1, revision: 1, entries: Array(DELETION_LIMIT + 1).fill(entry) },
  ])
    assert.throws(() => readDeletions(value));
});
test("recovery cards omit blobs, transient URLs and provider transcripts while retaining verified clip aliases", () => {
  const card = deletionCard({
    ...video,
    src: "blob:temporary",
    poster: "data:image/png;base64,large",
    description: "large transcript",
    remote: { ...video.remote, comments: [{ id: "one", body: "private transcript" }] },
  });
  assert.equal(card.src, undefined);
  assert.equal(card.poster, undefined);
  assert.equal(card.description, undefined);
  assert.equal(card.remote.comments, undefined);
  assert.equal(card.remote.videoId, video.remote.videoId);
  assert.throws(() => deletionCard({ ...video, name: "x".repeat(20 * 1024) }), /budget/);
});
