import test from "node:test";
import assert from "node:assert/strict";
import { waitForAccountWriter, checkpointAccountSwitch } from "./account-switch.ts";

function fixture() {
  let active = true,
    reads = 0;
  const listeners = new Set<() => void>();
  return {
    writer: {
      current: () => {
        reads++;
        return active;
      },
      subscribe: (callback: () => void) => {
        listeners.add(callback);
        return () => {
          listeners.delete(callback);
        };
      },
    },
    finish() {
      active = false;
      for (const notify of [...listeners]) notify();
    },
    listeners,
    get reads() {
      return reads;
    },
  };
}
test("account switching observes a finishing writer once and releases its listener without polling", async () => {
  const f = fixture(),
    pending = waitForAccountWriter(f.writer);
  assert.equal(f.listeners.size, 1);
  assert.equal(f.reads, 2);
  f.finish();
  await pending;
  assert.equal(f.listeners.size, 0);
  assert.equal(f.reads, 3);
  await waitForAccountWriter(f.writer);
  assert.equal(f.listeners.size, 0);
});
test("an account wait times out safely and releases the listener", async () => {
  const f = fixture();
  await assert.rejects(waitForAccountWriter(f.writer, 5), /current account was kept/);
  assert.equal(f.listeners.size, 0);
});
test("switching rechecks the complete checkpoint after a writer finishes before activating", async () => {
  const f = fixture(),
    calls: string[] = [];
  let attempts = 0;
  const pending = checkpointAccountSwitch(
    async () => {
      calls.push("checkpoint");
      if (!attempts++) throw Error("A catalog write is still finishing. Retry.");
    },
    async () => f.writer,
    async () => {
      calls.push("activate");
    },
  );
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(calls, ["checkpoint"]);
  f.finish();
  await pending;
  assert.deepEqual(calls, ["checkpoint", "checkpoint", "activate"]);
});
test("busy pulls, failed persistence and a newly busy checkpoint cannot activate another account", async () => {
  for (const message of ["Finish the current pull", "Storage quota exceeded"]) {
    let activated = false;
    await assert.rejects(
      checkpointAccountSwitch(
        async () => {
          throw Error(message);
        },
        async () => {
          throw Error("Must not observe unrelated failures");
        },
        async () => {
          activated = true;
        },
      ),
      new RegExp(message),
    );
    assert.equal(activated, false);
  }
  let calls = 0,
    activated = false;
  await assert.rejects(
    checkpointAccountSwitch(
      async () => {
        if (!calls++) throw Error("A catalog write is still finishing.");
        throw Error("Finish the current pull");
      },
      async () => ({ current: () => undefined, subscribe: () => () => {} }),
      async () => {
        activated = true;
      },
    ),
    /Finish the current pull/,
  );
  assert.equal(activated, false);
});
