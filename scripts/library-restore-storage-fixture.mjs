export async function libraryRestoreStorageFixture(p) {
  const check = (v, m) => {
      if (!v) throw Error(m);
    },
    expectFailure = async (fn, m) => {
      let failed = false;
      try {
        await fn();
      } catch {
        failed = true;
      }
      check(failed, m);
    };
  const open = () =>
    new Promise((yes, no) => {
      const r = indexedDB.open("restore-native-fixture", 1);
      r.onupgradeneeded = () => {
        r.result.createObjectStore("activity");
        r.result.createObjectStore("activity-journal", { keyPath: "key" });
        r.result.createObjectStore("remote-cache");
      };
      r.onsuccess = () => yes(r.result);
      r.onerror = () => no(r.error);
    });
  const put = async (store, key, value) => {
    const db = await open();
    try {
      await new Promise((yes, no) => {
        const tx = db.transaction(store, "readwrite"),
          s = tx.objectStore(store);
        if (s.keyPath) s.put(value);
        else s.put(value, key);
        tx.oncomplete = yes;
        tx.onabort = tx.onerror = () => no(tx.error);
      });
    } finally {
      db.close();
    }
  };
  const read = async (store, key) => {
    const db = await open();
    try {
      return await new Promise((yes, no) => {
        const r = db.transaction(store).objectStore(store).get(key);
        r.onsuccess = () => yes(r.result);
        r.onerror = () => no(r.error);
      });
    } finally {
      db.close();
    }
  };
  p.installRestoreEpoch(0);
  localStorage.removeItem(p.RESTORE_HEAD);
  localStorage.setItem("reelcase.follow-collections.v1", "[]");
  const before = {
    preferences: { tags: { v: ["old"] }, privateFolderIds: ["private-one"], adultPinHash: "pin" },
    feedback: { ratings: { v: 5 }, notes: { v: "old" } },
    follows: { channels: [{ id: "old" }] },
    resume: { resumeProgress: { v: { t: 20, d: 100, at: 1 } } },
  };
  for (const [key, value] of Object.entries(before)) await put("activity", key, value);
  await put("activity", "unrelated-tool", { keep: true });
  await put("activity-journal", "event", { key: "event", entry: { id: "v", at: 1 } });
  let writer = p.createWriterLease(open, "catalog", { owner: "restore-one", transport: false }),
    repo = p.createLibraryRestoreRepository(open, writer);
  const build = async (snapshot) => ({
    ...snapshot,
    rows: snapshot.rows.map((r) =>
      r.key === "feedback"
        ? { ...r, value: { ratings: { v: 1 }, notes: { v: "new" } } }
        : r.key === "preferences"
          ? { ...r, value: { tags: { v: ["new"] }, privateFolderIds: [], adultPinHash: null } }
          : r.key === "follows"
            ? { ...r, value: { channels: [{ id: "new" }] } }
            : r.key === "resume"
              ? { ...r, value: { resumeProgress: { v: { t: 80, d: 100, at: 2 } } } }
              : r,
    ),
    mirrors: { ...snapshot.mirrors, "reelcase.follow-collections.v1": '[{"id":"new"}]' },
  });
  await repo.prepare("First restore", { "rating:v": "imported" }, "a".repeat(64), build);
  check((await repo.state()).phase === "ready", "Ready persisted");
  check(
    (await read("activity", "feedback")).ratings.v === 5,
    "Staging did not change active ratings",
  );
  // Close/reopen the repository to simulate losing the preparing tab after verification.
  writer.close();
  writer = p.createWriterLease(open, "catalog", { owner: "restore-two", transport: false });
  repo = p.createLibraryRestoreRepository(open, writer);
  check((await repo.state()).phase === "ready", "Ready generation survives tab loss");
  const originalPut = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value, key) {
    if (key === "feedback" && value?.ratings?.v === 1)
      throw new DOMException("Controlled activation quota", "QuotaExceededError");
    return originalPut.call(this, value, key);
  };
  try {
    await expectFailure(() => repo.activate(), "Quota abort rejects activation");
  } finally {
    IDBObjectStore.prototype.put = originalPut;
  }
  check(
    (await read("activity", "feedback")).ratings.v === 5 &&
      (await read("activity", "follows")).channels[0].id === "old" &&
      (await repo.state()).epoch === 0,
    "Activation failure retains the complete old generation",
  );
  const set = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    if (key === "reelcase.follow-collections.v1" && value.includes("new"))
      throw new DOMException("Controlled mirror quota", "QuotaExceededError");
    return set.call(this, key, value);
  };
  try {
    await expectFailure(() => repo.activate(), "Mirror failure remains recoverable");
  } finally {
    Storage.prototype.setItem = set;
  }
  check(
    (await read("activity", "feedback")).ratings.v === 1 &&
      (await read("activity", "follows")).channels[0].id === "new" &&
      (await read("activity", "resume")).resumeProgress.v.t === 80 &&
      (await read("activity", "preferences")).tags.v[0] === "new",
    "Data switches together before mirror recovery",
  );
  check(!!(await repo.state()).mirror, "Committed mirror receipt retained");
  check(
    (await read("activity", "preferences")).adultPinHash === "pin",
    "Activation never weakens privacy",
  );
  await repo.repairMirrors();
  check(
    !(await repo.state()).mirror &&
      JSON.parse(localStorage.getItem("reelcase.follow-collections.v1"))[0].id === "new",
    "Mirror replay completes idempotently",
  );
  const staleWrite = async () => {
    const db = await open();
    try {
      await new Promise((yes, no) => {
        const tx = db.transaction(["activity", "remote-cache"], "readwrite");
        p.guardRestoreEpoch(tx, () =>
          tx.objectStore("activity").put({ ratings: { v: 0 } }, "feedback"),
        );
        tx.oncomplete = yes;
        tx.onabort = tx.onerror = () => no(tx.error ?? Error("Epoch fence"));
      });
    } finally {
      db.close();
    }
  };
  await expectFailure(staleWrite, "Old tab epoch cannot overwrite restored data");
  check(
    (await read("activity", "feedback")).ratings.v === 1,
    "Stale writes leave new generation intact",
  );
  p.installRestoreEpoch(1);
  const previous = (await repo.state()).previous;
  IDBObjectStore.prototype.put = function (value, key) {
    if (typeof key === "string" && key.includes(":before:"))
      throw new DOMException("Controlled staging quota", "QuotaExceededError");
    return originalPut.call(this, value, key);
  };
  try {
    await expectFailure(
      () => repo.prepare("Quota during staging", {}, "d".repeat(64), build),
      "Staging quota is reported",
    );
  } finally {
    IDBObjectStore.prototype.put = originalPut;
  }
  check(
    (await repo.state()).previous === previous &&
      (await read("activity", "feedback")).ratings.v === 1,
    "Staging quota retains the active generation and prior recovery slot",
  );
  await repo.discard();

  await put("activity", "preferences", {
    tags: { v: ["new"] },
    privateFolderIds: ["private-two"],
    adultPinHash: "new-pin",
  });
  await repo.activate(true);
  check(
    (await read("activity", "feedback")).ratings.v === 5 &&
      (await read("activity", "follows")).channels[0].id === "old" &&
      (await read("activity", "resume")).resumeProgress.v.t === 20,
    "Rollback restores all personal fields together",
  );
  const privacy = await read("activity", "preferences");
  check(
    privacy.privateFolderIds.includes("private-one") &&
      privacy.privateFolderIds.includes("private-two") &&
      privacy.adultPinHash === "new-pin",
    "Rollback preserves the privacy floor",
  );
  check(!(await repo.state()).previous, "Rollback consumes one recovery slot");
  check((await read("activity", "unrelated-tool")).keep, "Tool data stays outside restore scope");
  p.installRestoreEpoch(2);
  await expectFailure(
    () =>
      repo.prepare("Interrupted", {}, "b".repeat(64), async () => {
        throw Error("Controlled stop");
      }),
    "Interrupted preparation reported",
  );
  check(
    (await repo.state()).phase === "capturing" &&
      (await read("activity", "feedback")).ratings.v === 5,
    "Interrupted staging leaves complete active data",
  );
  await repo.discard();
  check((await repo.state()).phase === "idle", "Interrupted staging can be discarded");
  await repo.prepare("Tamper check", {}, "c".repeat(64), build);
  const id = (await repo.state()).pending,
    key = p.RESTORE_GENERATIONS + id + ":after:000000",
    page = await read("activity", key);
  page[0].value = { tampered: true };
  await put("activity", key, page);
  await expectFailure(() => repo.activate(), "Damaged staging fails verification");
  check(
    (await read("activity", "feedback")).ratings.v === 5,
    "Damaged staged data never activates",
  );
  await repo.discard();
  await put("remote-cache", p.RESTORE_CONTROL, { version: 2, preserve: true });
  await expectFailure(() => repo.state(), "Future restore state fails closed");
  check((await read("remote-cache", p.RESTORE_CONTROL)).preserve, "Future state retained");
  writer.close();
  return [
    "Ready-stage interruption and reopen",
    "Atomic activation quota rollback",
    "Committed mirror fault and replay",
    "Old-tab epoch rejection",
    "All-field rollback and privacy floor",
    "Unrelated tool records retained",
    "Interrupted staging discard and tamper detection",
    "Future schema retention",
  ];
}
