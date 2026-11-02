export async function profileRegistryStorageFixture(p) {
  const check = (ok, message) => {
      if (!ok) throw Error(message);
    },
    name = "profile-registry-fixture-" + crypto.randomUUID();
  const open = () =>
    new Promise((yes, no) => {
      const r = indexedDB.open(name, 1);
      r.onupgradeneeded = () => r.result.createObjectStore("control");
      r.onsuccess = () => yes(r.result);
      r.onerror = () => no(r.error);
    });
  const raw = async () => {
    const db = await open();
    try {
      return await new Promise((yes, no) => {
        const r = db.transaction("control").objectStore("control").get("registry");
        r.onsuccess = () => yes(r.result);
        r.onerror = () => no(r.error);
      });
    } finally {
      db.close();
    }
  };
  const repo = p.createProfileRepository(open),
    other = p.createProfileRepository(open);
  localStorage.setItem("reelcase.history.v1", "default history");
  localStorage.setItem("reelcase.private-tags", "default private tags");
  const [a, b] = await Promise.all([repo.create("Alpha"), other.create("Beta")]);
  check(
    (await repo.list()).profiles.length === 2,
    "Concurrent profile creation cannot lose either entry",
  );
  let failed = false;
  try {
    await repo.create(" alpha ");
  } catch {
    failed = true;
  }
  check(failed && (await repo.list()).profiles.length === 2, "Duplicate labels are rejected");
  const oldPut = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value, key) {
    if (key === "registry")
      throw new DOMException("Controlled registry quota", "QuotaExceededError");
    return oldPut.call(this, value, key);
  };
  failed = false;
  try {
    await repo.create("Quota fixture");
  } catch {
    failed = true;
  } finally {
    IDBObjectStore.prototype.put = oldPut;
  }
  check(
    failed && (await repo.list()).profiles.length === 2,
    "Registry quota failure preserves earlier profiles",
  );
  const sa = p.createProfileStorage(() => localStorage, a.id),
    sb = p.createProfileStorage(() => localStorage, b.id);
  sa.setItem("reelcase.private-tags", "Alpha only");
  sa.setItem("reelcase.signal.draft", "Alpha draft");
  sb.setItem("reelcase.private-tags", "Beta only");
  check(
    sb.getItem("reelcase.signal.draft") === null && sb.length === 1,
    "Native Storage enumeration is profile-scoped",
  );
  let release;
  const late = new Promise((r) => (release = r)).then(() =>
    sa.setItem("reelcase.resume.v1", "late Alpha"),
  );
  sessionStorage.setItem(p.PROFILE_SELECTION_KEY, b.id);
  release();
  await late;
  check(
    sa.getItem("reelcase.resume.v1") === "late Alpha" && sb.getItem("reelcase.resume.v1") === null,
    "Changing session selection cannot redirect an older writer",
  );
  check(
    localStorage.getItem("reelcase.history.v1") === "default history" &&
      localStorage.getItem("reelcase.private-tags") === "default private tags",
    "Legacy Default personal keys remain byte-for-byte intact",
  );
  const events = [],
    renameRepo = p.createProfileRepository(open, (revision) => events.push(revision));
  const original = await renameRepo.list(),
    originalNames = (await indexedDB.databases()).map((row) => row.name).sort();
  const renamed = await renameRepo.rename(a.id, " Alpha renamed ");
  check(
    renamed.id === a.id && renamed.createdAt === a.createdAt && renamed.name === "Alpha renamed",
    "Rename preserves immutable profile identity",
  );
  check(
    (await renameRepo.list()).revision === original.revision + 1 && events.length === 1,
    "Rename announces only a committed revision",
  );
  await renameRepo.rename(a.id, "Alpha renamed");
  check(
    events.length === 1 && (await renameRepo.list()).revision === original.revision + 1,
    "No-op rename writes no revision or notification",
  );
  for (const [id, label] of [
    ["default", "New default"],
    [a.id, "Default"],
    [a.id, "BETA"],
    ["p-33333333-3333-4333-8333-333333333333", "Missing"],
  ]) {
    let rejected = false;
    try {
      await renameRepo.rename(id, label);
    } catch {
      rejected = true;
    }
    check(rejected, "Reserved, duplicate or missing rename rejected");
  }
  const beforeQuota = JSON.stringify(await raw());
  IDBObjectStore.prototype.put = function (value, key) {
    if (key === "registry") throw new DOMException("Controlled rename quota", "QuotaExceededError");
    return oldPut.call(this, value, key);
  };
  let rejected = false;
  try {
    await renameRepo.rename(a.id, "Quota rename");
  } catch {
    rejected = true;
  } finally {
    IDBObjectStore.prototype.put = oldPut;
  }
  check(
    rejected && JSON.stringify(await raw()) === beforeQuota && events.length === 1,
    "Failed rename keeps exact registry and emits no change",
  );
  IDBObjectStore.prototype.put = function (value, key) {
    const request = oldPut.call(this, value, key);
    if (key === "registry") request.onsuccess = () => this.transaction.abort();
    return request;
  };
  rejected = false;
  try {
    await renameRepo.rename(a.id, "Aborted rename");
  } catch {
    rejected = true;
  } finally {
    IDBObjectStore.prototype.put = oldPut;
  }
  check(
    rejected && JSON.stringify(await raw()) === beforeQuota && events.length === 1,
    "An asynchronous transaction abort preserves the committed name",
  );
  const race = await Promise.allSettled([
    renameRepo.rename(a.id, "Shared name"),
    renameRepo.rename(b.id, "shared NAME"),
  ]);
  check(
    race.filter((row) => row.status === "fulfilled").length === 1,
    "Concurrent colliding renames serialize and exactly one wins",
  );
  await Promise.all([
    renameRepo.rename(a.id, "Alpha final"),
    renameRepo.rename(a.id, "Alpha latest"),
  ]);
  const after = await renameRepo.list();
  check(
    after.profiles.find((row) => row.id === a.id).name === "Alpha latest" &&
      after.profiles.length === 2,
    "Concurrent same-ID renames retain one valid entry",
  );
  check(
    JSON.stringify((await indexedDB.databases()).map((row) => row.name).sort()) ===
      JSON.stringify(originalNames),
    "Renaming opens no additional profile databases",
  );
  check(
    sa.getItem("reelcase.private-tags") === "Alpha only" &&
      sa.getItem("reelcase.signal.draft") === "Alpha draft" &&
      sb.getItem("reelcase.private-tags") === "Beta only",
    "Renames preserve private tags and drafts in their original namespaces",
  );
  const db = await open();
  await new Promise((yes, no) => {
    const tx = db.transaction("control", "readwrite");
    tx.objectStore("control").put({ version: 2, privateData: "keep" }, "registry");
    tx.oncomplete = yes;
    tx.onerror = no;
  });
  db.close();
  failed = false;
  try {
    await repo.create("Future");
  } catch {
    failed = true;
  }
  check(failed && (await raw()).privateData === "keep", "Unsupported registry versions are kept");
  return [
    "Serialized registry creation",
    "Duplicate label rejection",
    "Registry quota rollback",
    "Native profile Storage separation",
    "Frozen late-writer routing",
    "Legacy Default preservation",
    "Future registry retention",
    "Atomic label-only rename with stable identity and no extra databases",
    "No-op rename avoids writes and notifications",
    "Reserved, duplicate and missing-profile rename rejection",
    "Rename quota and asynchronous transaction-abort rollback",
    "Concurrent colliding and same-ID rename serialization",
    "Private tags, drafts and legacy keys preserved across rename",
  ];
}
