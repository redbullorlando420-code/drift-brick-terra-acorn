import test from "node:test";
import assert from "node:assert/strict";
import { mergeMissionPlan } from "../src/lib/mission-plan.ts";
import { ALL_NEXT_LEVEL_MISSIONS } from "../src/lib/mission-roadmap.ts";
import { createProfileSwitchWork } from "../src/lib/profile-switch-work.ts";
import { countProfileKeys, measureProfileBudget } from "../src/lib/profile-storage-budget.ts";

test("revision 103 promotes only the profile workspace batch, once", () => {
  const ids = ["next-103", "next-104", "next-110"];
  const saved = ALL_NEXT_LEVEL_MISSIONS.map(row=>[...ids,"next-145"].includes(row.id)
    ? {...row,done:false,status:"blocked"} : {...row});
  saved.push({id:"custom",title:"Owner task",detail:"Keep this note",done:false,status:"in-progress"});
  const migrated=mergeMissionPlan(saved,ALL_NEXT_LEVEL_MISSIONS,102);
  assert.deepEqual(migrated.filter((row,index)=>row.done&&!saved[index]?.done).map(row=>row.id),ids);
  assert.equal(migrated.find(row=>row.id==="next-145").status,"blocked");
  assert.equal(migrated.find(row=>row.id==="custom").detail,"Keep this note");
  const reopened=migrated.map(row=>row.id==="next-104"?{...row,done:false,status:"in-progress"}:row);
  assert.equal(mergeMissionPlan(reopened,ALL_NEXT_LEVEL_MISSIONS,103).find(row=>row.id==="next-104").status,"in-progress");
});

test("a held native job names the blocker and leaves activation and draft writes untouched", async () => {
  const work = createProfileSwitchWork();
  let print = true,
    pending = true,
    writes = 0,
    switches = 0;
  const job = work.register({
    read: () =>
      print ? { label: "Print copy", state: "wait", detail: "Finish the save." } : undefined,
  });
  work.register({
    read: () =>
      pending ? { label: "Announcement", state: "save", detail: "Save this draft." } : undefined,
    checkpoint: async () => {
      writes++;
      pending = false;
    },
  });
  job.detach();
  assert.equal(work.inventory().length, 2);
  await assert.rejects(
    work.run(async () => {
      switches++;
    }),
    /Print copy: Finish the save/,
  );
  assert.deepEqual([writes, switches], [0, 0]);
  print = false;
  job.notify();
  await work.run(async () => {
    switches++;
  });
  assert.deepEqual([writes, switches], [1, 1]);
});
test("retry never repeats a completed checkpoint and a late job fences activation", async () => {
  const work = createProfileSwitchWork();
  let first = true,
    second = true,
    blocked = true,
    calls = 0,
    switches = 0;
  const state = (label) => ({ label, state: "save", detail: "Save." });
  work.register({
    read: () => (first ? state("Print draft") : undefined),
    checkpoint: () => {
      first = false;
      calls++;
    },
  });
  work.register({
    read: () => (second ? state("Stream draft") : undefined),
    checkpoint: () => {
      if (blocked) throw Error("quota");
      second = false;
    },
  });
  await assert.rejects(
    work.run(async () => {
      switches++;
    }),
    /Stream draft could not be saved/,
  );
  assert.deepEqual([calls, switches], [1, 0]);
  blocked = false;
  await work.run(async () => {
    const late = work.register({
      read: () => ({ label: "Image job", state: "wait", detail: "Wait." }),
    });
    assert.throws(work.assertIdle, /Image job/);
    late.detach();
  });
  assert.equal(calls, 1);
});
test("measurements count exact profile keys without reading any values", async () => {
  const id = "p-abcdefab-abcd-abcd-abcd-abcdefabcdef",
    names = [
      "reelcase.prefs.v4",
      "reelcase.a",
      "realhub.active-local-profile.v1",
      "site-auth",
      "realhub.profile.v1:" + id + ":reelcase.prefs.v4",
      "realhub.profile.v1:other:reelcase.a",
    ];
  const fake = {
    length: names.length,
    key: (index) => names[index],
    getItem: () => {
      throw Error("A private value was read");
    },
  };
  assert.equal(countProfileKeys(fake, "default"), 2);
  assert.equal(countProfileKeys(fake, id), 1);
  let opened = 0;
  const saved = Object.getOwnPropertyDescriptor(globalThis, "indexedDB");
  Object.defineProperty(globalThis, "indexedDB", {
    configurable: true,
    value: {
      open() {
        opened++;
      },
    },
  });
  try {
    const result = await measureProfileBudget(id);
    assert.equal(opened, 0);
    assert.equal(result.origin, undefined);
    assert.equal(result.artwork, undefined);
    assert.equal(result.metadataRecords, undefined);
    assert(result.issues.some((s) => s.includes("No missing database")));
  } finally {
    if (saved) Object.defineProperty(globalThis, "indexedDB", saved);
    else delete globalThis.indexedDB;
  }
});
