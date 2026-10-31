import test from "node:test";
import assert from "node:assert/strict";
import { validWriterToken, WRITER_LEASE_MS } from "../src/lib/writer-lease.ts";
import {
  generateSignalPack,
  DEFAULT_SIGNAL_PROFILE,
  readSignalPack,
  exportSignalPack,
  composeOnX,
} from "../src/lib/stream-signal.ts";
import {
  nextSignalRevision,
  rebaseSignalEdit,
  readSignalProfileRevision,
} from "../src/lib/stream-signal-revisions.ts";
const initial = () =>
  generateSignalPack(DEFAULT_SIGNAL_PROFILE, "pack:1793400000000:fixture", 1793400000000);
test("lease tokens are bounded, versioned generations rather than timestamps used as ownership", () => {
  const token = {
    version: 1,
    scope: "catalog",
    owner: "tab:fixture",
    generation: 2,
    expiresAt: 1000,
    revision: 1,
  };
  assert(validWriterToken(token));
  for (const value of [
    { ...token, version: 2 },
    { ...token, generation: -1 },
    { ...token, generation: Infinity },
    { ...token, owner: "" },
    { ...token, scope: "x".repeat(1025) },
    { ...token, expiresAt: NaN },
    { ...token, dirty: 1 },
  ])
    assert(!validWriterToken(value));
  assert.equal(WRITER_LEASE_MS, 15000);
});
test("legacy packs migrate additively; pack and affected platform revisions advance together", () => {
  const pack = initial();
  delete pack.revision;
  delete pack.history;
  delete pack.draftRevisions;
  const first = nextSignalRevision(undefined, pack, 1);
  assert.equal(first.revision, 1);
  assert.deepEqual(first.draftRevisions, { x: 1, facebook: 1, instagram: 1, tiktok: 1 });
  const second = nextSignalRevision(
    first,
    { ...first, drafts: { ...first.drafts, x: "Changed X" } },
    2,
  );
  assert.equal(second.revision, 2);
  assert.equal(second.draftRevisions.x, 2);
  assert.equal(second.draftRevisions.facebook, 1);
  assert.equal(second.history.length, 1);
  assert.equal(second.history[0].text, first.drafts.x);
  assert.equal(second.history[0].platform, "x");
  assert.equal(nextSignalRevision(second, second), second);
  assert.equal(readSignalPack(pack).revision, 0);
});
test("conflict recovery reapplies only locally changed fields and preserves newer platform text and manual receipts", () => {
  const base = nextSignalRevision(undefined, initial());
  const current = nextSignalRevision(base, {
    ...base,
    drafts: { ...base.drafts, facebook: "New saved Facebook" },
    shared: { facebook: 123 },
  });
  const mine = { ...base, drafts: { ...base.drafts, x: "Local X" } };
  const rebased = rebaseSignalEdit(current, mine, base);
  assert.equal(rebased.drafts.x, "Local X");
  assert.equal(rebased.drafts.facebook, "New saved Facebook");
  assert.equal(rebased.shared.facebook, 123);
  assert.equal(rebased.profile.twitch, base.profile.twitch);
  assert.equal(rebased.profile.youtube, base.profile.youtube);
  assert.equal(nextSignalRevision(current, rebased).revision, 3);
});
test("manual checklist undo and restoring a prior edit are revisioned without publication claims", () => {
  const base = nextSignalRevision(undefined, initial());
  const marked = nextSignalRevision(base, { ...base, shared: { x: 123 } });
  const undone = nextSignalRevision(marked, { ...marked, shared: {} });
  assert.equal(undone.shared.x, undefined);
  assert.equal(undone.history.at(-1).shared, 123);
  const prior = undone.history.at(-1),
    restored = nextSignalRevision(undone, {
      ...undone,
      drafts: { ...undone.drafts, [prior.platform]: prior.text },
      shared: { ...undone.shared, [prior.platform]: prior.shared },
    });
  assert.equal(restored.shared.x, 123);
  const text = exportSignalPack(restored);
  assert(text.includes("manual notes"));
  const before = JSON.stringify(restored);
  composeOnX(restored.drafts.x);
  exportSignalPack(restored);
  assert.equal(JSON.stringify(restored), before);
});
test("history is bounded and schema corruption never silently truncates saved edit evidence", () => {
  let pack = nextSignalRevision(undefined, initial());
  for (let i = 0; i < 40; i++)
    pack = nextSignalRevision(pack, { ...pack, drafts: { ...pack.drafts, x: "Edit " + i } }, i);
  assert.equal(pack.history.length, 12);
  assert.equal(pack.history.at(-1).text, "Edit 38");
  assert.equal(pack.revision, 41);
  for (const patch of [
    { revision: -1 },
    { revision: NaN },
    { draftRevisions: { x: 999 } },
    { history: [{ revision: 2, at: 0, platform: "evil", text: "bad" }] },
    { history: Array(13).fill(pack.history[0]) },
  ])
    assert.throws(() => readSignalPack({ ...pack, ...patch }));
});
test("channel setup keeps legacy values and rejects future versioned records", () => {
  assert.equal(readSignalProfileRevision(DEFAULT_SIGNAL_PROFILE).revision, 0);
  assert.equal(
    readSignalProfileRevision({ version: 2, revision: 3, profile: DEFAULT_SIGNAL_PROFILE }).profile
      .creator,
    "notyoda",
  );
  assert.throws(() =>
    readSignalProfileRevision({ version: 9, revision: 1, profile: DEFAULT_SIGNAL_PROFILE }),
  );
});
