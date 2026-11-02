export async function sourceVisibilityStorageFixture(p) {
  const check = (ok, message) => {
      if (!ok) throw Error(message);
    },
    name = "source-recovery-fixture-" + crypto.randomUUID();
  const open = () =>
    new Promise((yes, no) => {
      const r = indexedDB.open(name, 1);
      r.onupgradeneeded = () => {
        for (const store of ["remote-cache", "activity", "videos", "directories"])
          r.result.createObjectStore(store);
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
        const t = db.transaction(store, "readwrite");
        t.objectStore(store).put(value, key);
        t.oncomplete = yes;
        t.onabort = t.onerror = () => no(t.error);
      });
    } finally {
      db.close();
    }
  };
  p.installRestoreEpoch(0);
  localStorage.removeItem(p.RESTORE_HEAD);
  await put("activity", "feedback", { ratings: { v: 5 }, notes: { v: "keep" } });
  await put("videos", "v", { id: "v", folderId: "dir:one" });
  await put("directories", "dir:one", { id: "dir:one", permission: "fixture" });
  const writer = p.createWriterLease(open, "catalog", { owner: "source-one", transport: false }),
    repo = p.createSourceVisibilityRepository(open, writer),
    folder = { id: "dir:one", name: "One", kind: "directory", videoCount: 1 };
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value, key) {
    if (key === p.SOURCE_VISIBILITY_KEY)
      throw new DOMException("Controlled visibility quota", "QuotaExceededError");
    return original.call(this, value, key);
  };
  let failed = false;
  try {
    await repo.hide(folder);
  } catch {
    failed = true;
  } finally {
    IDBObjectStore.prototype.put = original;
  }
  check(failed && !(await repo.load()).hidden.length, "Quota failure leaves source visible");
  await repo.hide(folder);
  check((await repo.load()).hidden.length === 1, "Hide survives a fresh read");
  check(
    (await read("activity", "feedback")).ratings.v === 5 &&
      (await read("directories", folder.id)).permission === "fixture" &&
      (await read("videos", "v")).id === "v",
    "Hide never changes catalog, grants or personal fields",
  );
  await repo.show(folder.id);
  check(!(await repo.load()).hidden.length, "Undo source hide has no expiry");
  await put("remote-cache", p.SOURCE_VISIBILITY_KEY, { version: 2, privateData: "keep" });
  failed = false;
  try {
    await repo.hide(folder);
  } catch {
    failed = true;
  }
  check(
    failed && (await read("remote-cache", p.SOURCE_VISIBILITY_KEY)).privateData === "keep",
    "Unknown versions are retained",
  );
  writer.close();
  return [
    "Source hide quota rollback",
    "Catalog, grant and personal records untouched",
    "Durable source hide and show",
    "Future source journal preserved",
  ];
}
