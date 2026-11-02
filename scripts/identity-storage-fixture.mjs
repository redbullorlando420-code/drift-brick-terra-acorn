// Executed in an isolated browser database; all failures use real IDB transactions.
export async function identityStorageFixture(p) {
  const check = (condition, message) => {
    if (!condition) throw Error(message);
  };
  const open = () =>
    new Promise((yes, no) => {
      const r = indexedDB.open("identity-transaction-fixture", 1);
      r.onupgradeneeded = () => {
        r.result.createObjectStore("remote-cache");
        r.result.createObjectStore("activity");
        const v = r.result.createObjectStore("videos", { keyPath: "id" });
        v.createIndex("folderId", "folderId");
      };
      r.onsuccess = () => yes(r.result);
      r.onerror = () => no(r.error);
    });
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
  const put = async (store, key, value) => {
    const db = await open();
    try {
      await new Promise((yes, no) => {
        const tx = db.transaction(store, "readwrite");
        if (store === "videos") tx.objectStore(store).put(value);
        else tx.objectStore(store).put(value, key);
        tx.oncomplete = yes;
        tx.onabort = tx.onerror = () => no(tx.error);
      });
    } finally {
      db.close();
    }
  };
  const writer = p.createWriterLease(open, "identity-fixture", { transport: false }),
    repo = p.createIdentityRepository(open, writer),
    removals = p.createDeletionRepository(open, writer);
  const original = {
      id: "source",
      folderId: "old",
      name: "same.mp4",
      path: "old.mp4",
      mime: "video/mp4",
      extension: "mp4",
      size: 4,
      addedAt: 1,
    },
    target = { ...original, id: "target", folderId: "new", path: "new.mp4" },
    proof = {
      version: 1,
      algorithm: "sha256",
      digest: "a".repeat(64),
      size: 4,
      lastModified: 1,
      at: Date.now(),
    };
  const marks = {
    favorites: ["source"],
    tags: { source: ["owner"] },
    ratings: { source: 5, unrelated: 4 },
    history: [{ id: "source", at: 1 }],
    resumeProgress: { "id:source": { t: 2, d: 4, at: 1 } },
  };
  await put("videos", null, original);
  await put("videos", null, target);
  await put("activity", "primary", marks);
  await repo.record(original, proof, false);
  const reject = async (fn, match) => {
    let error;
    try {
      await fn();
    } catch (e) {
      error = e;
    }
    check(
      !!error && match.test(error.message),
      "Expected rejection " + match + ", got " + error?.message,
    );
  };
  const quota = async (key, fn) => {
    const real = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, k) {
      if (this.name === "remote-cache" && k === key)
        throw new DOMException("Fixture quota reached", "QuotaExceededError");
      return real.apply(this, arguments);
    };
    try {
      await reject(fn, /quota/i);
    } finally {
      IDBObjectStore.prototype.put = real;
    }
  };
  try {
    await quota(p.FILE_IDENTITIES_KEY, () => repo.move("source", target, proof, 1));
    check(
      (await read("videos", "source")).path === "old.mp4" && !!(await read("videos", "target")),
      "Failed move must roll back both catalog rows",
    );
    check(
      (await read("remote-cache", p.FILE_IDENTITIES_KEY)).revision === 1,
      "Failed move changed ledger",
    );
    await reject(
      () => repo.move("source", target, { ...proof, digest: "b".repeat(64) }, 1),
      /fingerprints/,
    );
    await reject(() => repo.move("source", target, proof, 0), /changed/);
    await put("activity", "feedback", { ratings: { target: 5 } });
    await reject(() => repo.move("source", target, proof, 1), /saved choices/);
    await put("activity", "feedback", {});
    let ledger = await repo.move("source", target, proof, 1);
    check(
      ledger.moves[0].active && !(await read("videos", "target")),
      "Move did not atomically alias destination",
    );
    const reopened = p.createIdentityRepository(open, writer);
    await reopened.hydrate();
    check(reopened.getSnapshot().moves[0].after.id === "source", "Reload changed canonical ID");
    const journal = p.createCatalogMutations(open, writer);
    await journal.write({ version: 1, kind: "local", rows: [original, target] });
    check(
      (await read("videos", "source")).path === "new.mp4" && !(await read("videos", "target")),
      "Delayed local journal revived an old mapping",
    );
    await quota(p.DELETIONS_KEY, () => removals.remove(ledger.moves[0].after, false));
    check(
      !!(await read("videos", "source")) && !(await read("remote-cache", p.DELETIONS_KEY)),
      "Failed removal changed rows or suppression",
    );
    await removals.remove(ledger.moves[0].after, false);
    await journal.write({ version: 1, kind: "local", rows: [ledger.moves[0].after] });
    check(!(await read("videos", "source")), "Deleted alias revived from journal");
    await quota(p.DELETIONS_KEY, () => removals.restore("source"));
    check(
      !(await read("videos", "source")) &&
        (await read("remote-cache", p.DELETIONS_KEY)).entries.length === 1,
      "Failed restore changed the chosen removal",
    );
    await removals.restore("source");
    check((await read("videos", "source")).path === "new.mp4", "Restore lost verified alias");
    await quota(p.FILE_IDENTITIES_KEY, () => repo.undo(ledger.moves[0].id, 2));
    check(
      (await read("videos", "source")).path === "new.mp4" && !(await read("videos", "target")),
      "Failed Undo partially changed mappings",
    );
    ledger = await repo.undo(ledger.moves[0].id, 2);
    check(
      (await read("videos", "source")).path === "old.mp4" && !!(await read("videos", "target")),
      "Undo failed to restore both mappings",
    );
    check(
      JSON.stringify(await read("activity", "primary")) === JSON.stringify(marks),
      "Identity workflow rewrote personal signals",
    );
    const future = { version: 99, opaque: "keep-me" };
    await put("remote-cache", p.FILE_IDENTITIES_KEY, future);
    await reject(() => repo.record(original, proof, false), /Unsupported/);
    check(
      JSON.stringify(await read("remote-cache", p.FILE_IDENTITIES_KEY)) === JSON.stringify(future),
      "Future ledger was overwritten",
    );
    return [
      "Quota failures roll back removal, restore, file move and Undo atomically",
      "Stale review, mismatched contents and already-owned destinations are rejected",
      "Delayed catalog journal cannot revive an old mapping or deliberately removed alias",
      "Reload and Undo preserve the canonical ID and byte-identical personal records",
      "Unsupported future identity records remain intact",
    ];
  } finally {
    writer.close();
  }
}
