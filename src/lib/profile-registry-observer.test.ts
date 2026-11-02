import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createProfileRegistryObserver,
  PROFILE_REGISTRY_LOADING,
} from "./profile-registry-observer.ts";
import { validateProfileName } from "./local-profiles.ts";
const profile = (name: string) => [
  { id: "p-11111111-1111-4111-8111-111111111111", name, createdAt: 1 },
];
const settle = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
}

test("profile labels validate trimmed length, reserved names and control characters", () => {
  assert.equal(validateProfileName("  Family room  "), "Family room");
  assert.equal(validateProfileName("x".repeat(48)), "x".repeat(48));
  for (const value of ["", "  ", " DEFAULT ", "x".repeat(49), "Room\u0000label", "Two\nlines"])
    assert.throws(() => validateProfileName(value));
});
test("shared registry consumers open one subscription and reuse unchanged snapshots", async () => {
  let reads = 0,
    connects = 0,
    closes = 0,
    changed!: () => void,
    notices = 0;
  const store = createProfileRegistryObserver(
    async () => {
      reads++;
      return profile("Alpha");
    },
    (notify) => {
      connects++;
      changed = notify;
      return () => {
        closes++;
      };
    },
  );
  assert.equal(store.getSnapshot(), PROFILE_REGISTRY_LOADING);
  const a = store.subscribe(() => {
      notices++;
    }),
    b = store.subscribe(() => {
      notices++;
    });
  await settle();
  const snapshot = store.getSnapshot();
  assert.equal(reads, 1);
  assert.equal(connects, 1);
  assert.equal(notices, 2);
  changed();
  await settle();
  assert.equal(reads, 2);
  assert.equal(store.getSnapshot(), snapshot);
  assert.equal(notices, 2);
  a();
  assert.equal(closes, 0);
  b();
  assert.equal(closes, 1);
  assert.equal(store.getSnapshot(), PROFILE_REGISTRY_LOADING);
});
test("an invalidation burst coalesces and cannot publish stale profile names", async () => {
  const first = deferred<ReturnType<typeof profile>>();
  let reads = 0,
    changed!: () => void;
  const store = createProfileRegistryObserver(
    () => (++reads === 1 ? first.promise : Promise.resolve(profile("Renamed"))),
    (notify) => {
      changed = notify;
      return () => {};
    },
  );
  const off = store.subscribe(() => {});
  for (let i = 0; i < 1000; i++) changed();
  assert.equal(reads, 1);
  first.resolve(profile("Old"));
  await store.settled();
  assert.equal(reads, 2);
  assert.equal(store.getSnapshot().profiles[0].name, "Renamed");
  off();
});
test("registry failures expose unavailable names and recover after an explicit refresh", async () => {
  let fail = false;
  const store = createProfileRegistryObserver(
    async () => {
      if (fail) throw Error("Registry unavailable");
      return profile("Saved");
    },
    () => () => {},
  );
  const off = store.subscribe(() => {});
  await settle();
  fail = true;
  store.refresh();
  await settle();
  assert.equal(store.getSnapshot().status, "error");
  assert.equal(store.getSnapshot().profiles.length, 0);
  assert.equal(store.getSnapshot().error, "Registry unavailable");
  fail = false;
  store.refresh();
  await settle();
  assert.equal(store.getSnapshot().status, "ready");
  off();
});
test("a detached registry read cannot replace a new subscription’s snapshot", async () => {
  const first = deferred<ReturnType<typeof profile>>();
  let calls = 0;
  const store = createProfileRegistryObserver(
    () => (++calls === 1 ? first.promise : Promise.resolve(profile("Current"))),
    () => () => {},
  );
  const a = store.subscribe(() => {});
  a();
  const b = store.subscribe(() => {});
  await settle();
  first.resolve(profile("Stale"));
  await settle();
  assert.equal(store.getSnapshot().profiles[0].name, "Current");
  b();
});
test("registry refresh with no consumers does no background work", async () => {
  let calls = 0;
  const store = createProfileRegistryObserver(
    async () => {
      calls++;
      return profile("Alpha");
    },
    () => () => {},
  );
  store.refresh();
  await settle();
  assert.equal(calls, 0);
});
