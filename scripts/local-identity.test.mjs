import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, n) {
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});
const {
  emptyIdentities,
  readIdentityLedger,
  installIdentityLedger,
  identityAdmissionAllowed,
  identityForLocation,
  validLocalIdentityRef,
} = await import("../src/lib/videos/local-identity.ts");
const { destinationHasSignals } = await import("../src/lib/videos/identity-repository.ts");
const { sameFileFingerprint } = await import("../src/lib/videos/file-fingerprint.ts");
const { videoIsPrivate } = await import("../src/lib/videos/public-visibility.ts");
const proof = {
  version: 1,
  algorithm: "sha256",
  digest: "a".repeat(64),
  size: 4,
  lastModified: 1,
  at: 1,
};
const before = {
  id: "original",
  folderId: "old",
  name: "same.mp4",
  path: "same.mp4",
  size: 4,
  mime: "video/mp4",
  extension: "mp4",
  addedAt: 1,
};
const target = { ...before, id: "destination", folderId: "new", path: "renamed.mp4" };
const after = {
  ...before,
  folderId: target.folderId,
  path: target.path,
  localIdentity: {
    version: 1,
    canonicalId: before.id,
    targetId: target.id,
    proof,
    previousPaths: [before.path],
    revision: 1,
  },
};
const move = {
  id: "move:1",
  canonicalId: before.id,
  active: true,
  before,
  target,
  after,
  proof,
  private: false,
  at: 1,
};
const ledger = () => ({
  version: 1,
  revision: 1,
  fingerprints: { original: { video: after, proof, private: false } },
  moves: [move],
});
test("only a reviewed current content mapping enters an active alias", () => {
  const l = readIdentityLedger(ledger());
  installIdentityLedger(l);
  assert.equal(identityAdmissionAllowed(before), false);
  assert.equal(identityAdmissionAllowed(target), false);
  assert.equal(identityAdmissionAllowed(after), true);
  assert.equal(
    identityAdmissionAllowed({ ...after, localIdentity: { ...after.localIdentity, version: 2 } }),
    false,
  );
  assert.equal(
    identityAdmissionAllowed({ ...after, localIdentity: { ...after.localIdentity, revision: 2 } }),
    false,
  );
  assert.equal(identityAdmissionAllowed({ ...before, id: "unrelated" }), true);
  assert.equal(sameFileFingerprint(proof, { ...proof, digest: "b".repeat(64) }), false);
  assert.equal(identityForLocation(target.id).canonicalId, before.id);
});
test("undo reopens the raw destination while superseded locations remain fenced", () => {
  const nextTarget = { ...target, id: "third", folderId: "third" },
    nextAfter = {
      ...after,
      folderId: "third",
      localIdentity: { ...after.localIdentity, targetId: "third", revision: 2 },
    };
  const l = {
    ...ledger(),
    revision: 2,
    moves: [
      { ...move, id: "move:2", target: nextTarget, after: nextAfter, previousId: move.id },
      { ...move, active: false },
    ],
  };
  installIdentityLedger(readIdentityLedger(l));
  assert.equal(identityAdmissionAllowed(target), false);
  assert.equal(identityAdmissionAllowed(nextAfter), true);
  const restored = {
    ...before,
    localIdentity: { ...after.localIdentity, targetId: before.id, revision: 3 },
  };
  installIdentityLedger(
    readIdentityLedger({
      ...ledger(),
      revision: 3,
      fingerprints: { original: { video: restored, proof, private: false } },
      moves: [{ ...move, active: false, undoneAt: 3 }],
    }),
  );
  assert.equal(identityAdmissionAllowed(before), false);
  assert.equal(identityAdmissionAllowed(restored), true);
  assert.equal(identityAdmissionAllowed(target), true);
});
test("future, malformed, duplicate and over-budget history fails without normalization", () => {
  assert.deepEqual(readIdentityLedger(undefined), emptyIdentities());
  for (const raw of [
    { ...ledger(), version: 2 },
    { ...ledger(), moves: [move, move] },
    {
      ...ledger(),
      moves: [
        { ...move, after: { ...after, localIdentity: { ...after.localIdentity, version: 2 } } },
      ],
    },
    {
      ...ledger(),
      fingerprints: { original: { video: before, proof: { ...proof, size: 5 }, private: false } },
    },
  ])
    assert.throws(() => readIdentityLedger(raw));
  assert.equal(
    validLocalIdentityRef({ ...after.localIdentity, previousPaths: Array(13).fill("path") }),
    false,
  );
});
test("already-owned destinations require conflict review, including hidden and sparse signals", () => {
  for (const [key, value] of [
    ["primary", { favorites: [target.id] }],
    ["preferences", { hiddenVideoIds: [target.id] }],
    ["feedback", { ratings: { [target.id]: 5 } }],
    ["resume", { resumeProgress: { [target.path]: { t: 7, d: 12, at: 1 } } }],
    ["film-reviews", { versions: { [target.id]: { filmId: "one" } } }],
    ["anime-reviews", { episodes: { [target.id]: { series: "one" } } }],
    ["saved-edit:likes:" + target.id, { value: false }],
  ])
    assert.equal(destinationHasSignals(new Map([[key, value]]), target), true, key);
  assert.equal(
    destinationHasSignals(new Map([["feedback", { ratings: { unrelated: 5 } }]]), target),
    false,
  );
});
test("private recovery stays private even after its original folder disappears", () => {
  assert.equal(videoIsPrivate(new Set(), { ...before, privateRetention: true }), true);
  assert.equal(videoIsPrivate(new Set(), before), false);
});
test("inspection workers are bounded and release both slots on cancellation", async () => {
  const { fingerprintFile } = await import("../src/lib/videos/file-fingerprint.ts");
  const real = globalThis.Worker;
  let live = 0,
    terminated = 0;
  globalThis.Worker = class {
    constructor() {
      live++;
    }
    postMessage() {}
    terminate() {
      live--;
      terminated++;
    }
  };
  try {
    const file = new File(["abcd"], "same.mp4"),
      a = new AbortController(),
      b = new AbortController();
    const pa = assert.rejects(fingerprintFile(file, a.signal), /cancelled/),
      pb = assert.rejects(fingerprintFile(file, b.signal), /cancelled/);
    assert.equal(live, 2);
    await assert.rejects(
      fingerprintFile(file, new AbortController().signal),
      /Two file inspections/,
    );
    a.abort();
    b.abort();
    await Promise.all([pa, pb]);
    assert.equal(live, 0);
    assert.equal(terminated, 2);
    const c = new AbortController(),
      pc = assert.rejects(fingerprintFile(file, c.signal), /cancelled/);
    c.abort();
    await pc;
    assert.equal(live, 0);
  } finally {
    globalThis.Worker = real;
  }
});
