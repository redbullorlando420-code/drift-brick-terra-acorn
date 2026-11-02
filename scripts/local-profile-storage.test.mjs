import test from "node:test";
import assert from "node:assert/strict";
import {
  createProfileStorage,
  profileDatabaseName,
  profileEventKey,
  PROFILE_PREFIX,
} from "../src/lib/local-profile-storage.ts";
import { readProfileRegistry } from "../src/lib/local-profiles.ts";
const aid = "p-11111111-1111-4111-8111-111111111111",
  bid = "p-22222222-2222-4222-8222-222222222222";
function memory() {
  const values = new Map();
  return {
    get length() {
      return values.size;
    },
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, String(v)),
    removeItem: (k) => values.delete(k),
    key: (i) => [...values.keys()][i] ?? null,
    clear: () => values.clear(),
    values,
  };
}
test("Default retains legacy keys in place and excludes all other profiles from enumeration", () => {
  const raw = memory();
  raw.setItem("reelcase.history.v1", "original");
  raw.setItem(PROFILE_PREFIX + aid + ":reelcase.history.v1", "other");
  const before = [...raw.values],
    a = createProfileStorage(() => raw, "default");
  assert.equal(a.getItem("reelcase.history.v1"), "original");
  assert.deepEqual([...raw.values], before);
  assert.equal(a.length, 1);
  assert.equal(a.key(0), "reelcase.history.v1");
  assert.equal(profileDatabaseName("reelcase", "default"), "reelcase");
});
test("profile storage cannot read, enumerate, overwrite or clear another profile", () => {
  const raw = memory(),
    a = createProfileStorage(() => raw, aid),
    b = createProfileStorage(() => raw, bid),
    d = createProfileStorage(() => raw, "default");
  a.setItem("reelcase.private-tags", "A");
  a.setItem("reelcase.signal.draft", "draft A");
  b.setItem("reelcase.private-tags", "B");
  d.setItem("reelcase.history.v1", "legacy");
  assert.equal(b.getItem("reelcase.signal.draft"), null);
  assert.equal(b.length, 1);
  assert.equal(a.length, 2);
  b.clear();
  assert.equal(a.getItem("reelcase.private-tags"), "A");
  assert.equal(a.getItem("reelcase.signal.draft"), "draft A");
  assert.equal(d.getItem("reelcase.history.v1"), "legacy");
  assert.throws(() => d.getItem(PROFILE_PREFIX + aid + ":reelcase.private-tags"), /Reserved/);
});
test("an old asynchronous writer keeps its original namespace after another profile is chosen", async () => {
  const raw = memory(),
    a = createProfileStorage(() => raw, aid);
  let release;
  const pending = new Promise((r) => (release = r)).then(() =>
    a.setItem("reelcase.resume.v1", "late A"),
  );
  const b = createProfileStorage(() => raw, bid);
  b.setItem("reelcase.resume.v1", "B");
  release();
  await pending;
  assert.equal(a.getItem("reelcase.resume.v1"), "late A");
  assert.equal(b.getItem("reelcase.resume.v1"), "B");
  assert.notEqual(profileDatabaseName("reelcase", aid), profileDatabaseName("reelcase", bid));
  assert.notEqual(
    profileDatabaseName("reelcase-prints", aid),
    profileDatabaseName("reelcase-prints", bid),
  );
});
test("storage transport drops foreign personal changes and translates own keys without changing auth events", () => {
  assert.equal(profileEventKey(PROFILE_PREFIX + aid + ":reelcase.restore-head.v1", bid), undefined);
  assert.equal(profileEventKey("reelcase.restore-head.v1", bid), undefined);
  assert.equal(
    profileEventKey(PROFILE_PREFIX + bid + ":reelcase.restore-head.v1", bid),
    "reelcase.restore-head.v1",
  );
  assert.equal(profileEventKey("better-auth:update", bid), "better-auth:update");
});
test("quota failure leaves an existing personal value intact", () => {
  const raw = memory(),
    p = createProfileStorage(() => raw, aid);
  p.setItem("reelcase.private-tags", "saved");
  const original = raw.setItem;
  raw.setItem = () => {
    throw new DOMException("Quota", "QuotaExceededError");
  };
  assert.throws(() => p.setItem("reelcase.private-tags", "new"));
  raw.setItem = original;
  assert.equal(p.getItem("reelcase.private-tags"), "saved");
});
test("enumeration stays fresh when another writer replaces keys at the same total size", () => {
  const raw = memory(),
    a = createProfileStorage(() => raw, aid);
  a.setItem("reelcase.old", "one");
  assert.equal(a.key(0), "reelcase.old");
  raw.removeItem(PROFILE_PREFIX + aid + ":reelcase.old");
  raw.setItem(PROFILE_PREFIX + aid + ":reelcase.new", "two");
  assert.equal(a.key(0), "reelcase.new");
  raw.removeItem(PROFILE_PREFIX + aid + ":reelcase.new");
  raw.setItem(PROFILE_PREFIX + bid + ":reelcase.foreign", "three");
  assert.equal(a.length, 0);
  assert.equal(a.key(0), null);
});
test("profile registry rejects future versions, duplicate IDs, duplicate labels and capacity overflow", () => {
  const row = { id: aid, name: "Private", createdAt: 1 };
  assert.equal(readProfileRegistry(undefined).profiles.length, 0);
  for (const raw of [
    { version: 2 },
    { version: 1, revision: 0, profiles: [row, row] },
    { version: 1, revision: 0, profiles: [row, { ...row, id: bid }] },
    { version: 1, revision: 0, profiles: Array(16).fill(row) },
    { version: 1, revision: 0, profiles: [null] },
    { version: 1, revision: 0, profiles: [{ ...row, name: null }] },
    { version: 1, revision: 0, profiles: [{ ...row, id: "p-" + "-".repeat(36) }] },
  ])
    assert.throws(() => readProfileRegistry(raw), /unsupported/);
});
