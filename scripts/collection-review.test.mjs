import assert from "node:assert/strict";
import test from "node:test";
import { PROFILE_ARRIVAL_KEY } from "../src/lib/local-profile-storage.ts";
import { stageProfileArrival, takeProfileArrival } from "../src/lib/profile-arrival.ts";
import {
  changeBulkTags, readBulkTagReceipt, reverseBulkTag, tagSnapshot,
} from "../src/lib/videos/bulk-tags.ts";
import {
  emptyPhotoDecisions, groupPhotoEvidence, hideReviewedPhotos, restoreReviewedPhoto,
  similarPhotos, undoReviewedPhotos, visualSignature,
} from "../src/lib/photo-duplicates.ts";
import { mergeMissionPlan, MISSION_PLAN_REVISION } from "../src/lib/mission-plan.ts";
import { NEXT_WAVE_MISSIONS } from "../src/lib/mission-next-wave.ts";

test("profile focus is one-use, expires, and cannot carry a stale media target", () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key) };
  const other = "p-00000000-0000-4000-a000-000000000104";
  stageProfileArrival(storage, other, 1000);
  assert.equal(takeProfileArrival(storage, other, 1001), true);
  assert.equal(takeProfileArrival(storage, other, 1002), false);
  stageProfileArrival(storage, other, 2000);
  assert.equal(takeProfileArrival(storage, "default", 2001), false);
  assert.equal(takeProfileArrival(storage, other, 2002), false);
  stageProfileArrival(storage, other, 3000);
  assert.equal(takeProfileArrival(storage, other, 123000), false);
  storage.setItem(PROFILE_ARRIVAL_KEY, JSON.stringify({ version: 1, destination: other, target: "private-item", at: 1 }));
  assert.equal(takeProfileArrival(storage, other, 2), false);
  assert.equal(values.size, 0);
});

test("similarity requires structure; explicit photo restores only affect duplicate visibility", () => {
  const pattern = Array.from({ length: 81 * 4 }, (_, i) => i % 4 === 3 ? 255 : Math.floor(i / 4) % 3 ? 20 : 225);
  const flat = Array.from({ length: 81 * 4 }, (_, i) => i % 4 === 3 ? 255 : 90);
  const visual = visualSignature(pattern, 90, 90);
  const resized = visualSignature(pattern, 180, 180);
  assert(similarPhotos(visual, resized));
  assert(!similarPhotos(visual, visualSignature(pattern, 180, 90)));
  assert(!similarPhotos(visualSignature(flat, 90, 90), visualSignature(flat, 90, 90)));
  const row = (id, digest, signature) => ({ photo: { id }, bytes: 10, digest, visual: signature });
  const groups = groupPhotoEvidence([row("original", "a", visual), row("copy", "a", visual), row("resized", "b", resized)]);
  assert.deepEqual(groups.map(group => [group.kind, group.rows.map(item => item.photo.id)]),
    [["exact", ["original", "copy"]], ["similar", ["original", "resized"]]]);
  assert.throws(() => hideReviewedPhotos(emptyPhotoDecisions(), ["favorite"], () => false));
  const first = hideReviewedPhotos(emptyPhotoDecisions(), ["copy"], () => true);
  const second = hideReviewedPhotos(first, ["resized"], () => true);
  assert.deepEqual(undoReviewedPhotos(second).hidden, ["copy"]);
  assert.deepEqual(restoreReviewedPhoto(second, "copy").hidden, ["resized"]);
});

test("bulk undo only changes the reviewed tag and rejects another profile's receipt", () => {
  const before = ["local", "racing", "provider"];
  const after = changeBulkTags(before, "remove", "racing");
  assert.deepEqual(after, ["local", "provider"]);
  assert.deepEqual(reverseBulkTag([...after, "new-provider-tag"], before, "racing"),
    ["local", "racing", "provider", "new-provider-tag"]);
  assert.deepEqual(reverseBulkTag(["local", "racing", "new-provider-tag"], ["local"], "racing"),
    ["local", "new-provider-tag"]);
  const entry = { id: "reviewed", identity: "local:fixture", title: "Title",
    before: tagSnapshot(before), after: tagSnapshot(after) };
  const receipt = { version: 1, id: "operation", revision: 1, profileId: "default", collectionRevision: 7,
    mode: "remove", tag: "racing", total: 2, entries: [entry] };
  assert.deepEqual(readBulkTagReceipt(receipt, "default"), receipt);
  assert.throws(() => readBulkTagReceipt(receipt, "other"));
  assert.throws(() => readBulkTagReceipt({ ...receipt, entries: [entry, entry] }, "default"));
});

test("revision 104 completes exactly this trio once without changing existing decisions", () => {
  const completed = ["next-156", "next-157", "next-159"];
  const saved = NEXT_WAVE_MISSIONS.map(row => ({
    ...row,
    ...(completed.includes(row.id) || row.id === "next-155" ? { done: false, status: "blocked" } : {}),
  }));
  const merged = mergeMissionPlan(saved, NEXT_WAVE_MISSIONS, 103);
  assert.deepEqual(merged.filter((row, index) => row.done !== saved[index].done).map(row => row.id), completed);
  const reopened = merged.map(row => row.id === "next-157" ? { ...row, done: false, status: "planned" } : row);
  assert.equal(mergeMissionPlan(reopened, NEXT_WAVE_MISSIONS, MISSION_PLAN_REVISION).find(row => row.id === "next-157").done, false);
});
