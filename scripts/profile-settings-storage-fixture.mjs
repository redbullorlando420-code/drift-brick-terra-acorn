export async function profileSettingsStorageFixture(p) {
  const check = (ok, message) => {
    if (!ok) throw Error(message);
  };
  const snapshot = () =>
    JSON.stringify(
      Object.keys(localStorage)
        .sort()
        .map((key) => [key, localStorage.getItem(key)]),
    );
  const protectedValue = JSON.stringify({
    history: [{ id: "private-fixture", at: 1 }],
    tags: { private: ["keep"] },
    view: "grid",
  });
  localStorage.setItem("reelcase.prefs.v4", protectedValue);
  localStorage.setItem("better-auth.session", "fixture-auth-do-not-copy");
  const beforeNames = (await indexedDB.databases()).map((row) => row.name);
  const a = await p.createConfiguredLocalProfile("Configured fixture", {
    view: "list",
    hardwareAccel: false,
    performanceMode: "low-memory",
  });
  const prefix = p.PROFILE_PREFIX + a.id + ":",
    raw = JSON.parse(localStorage.getItem(prefix + "reelcase.prefs.v4"));
  check(
    JSON.stringify(raw) ===
      JSON.stringify({ view: "list", hardwareAccel: false, sourceId: "home" }),
    "Only selected settings seed the new namespace",
  );
  check(
    localStorage.getItem(prefix + "reelcase.performance-mode") === "low-memory",
    "Reviewed performance preset uses its existing scoped key",
  );
  check(
    localStorage.getItem("reelcase.prefs.v4") === protectedValue &&
      localStorage.getItem("better-auth.session") === "fixture-auth-do-not-copy",
    "Existing private preferences and authentication remain exact",
  );
  check(
    !Object.keys(raw).some((key) =>
      ["history", "tags", "adultPinHash", "follows", "token"].includes(key),
    ),
    "No personal or authentication fields copied",
  );
  check(
    (await indexedDB.databases()).every(
      (row) => beforeNames.includes(row.name) || row.name === p.PROFILE_REGISTRY_DB,
    ),
    "Configuration creates no personal or print databases",
  );
  let before = snapshot(),
    count = (await p.listLocalProfiles()).length,
    rejected = false;
  try {
    await p.createConfiguredLocalProfile("Configured fixture", { view: "grid" });
  } catch {
    rejected = true;
  }
  check(
    rejected && snapshot() === before && (await p.listLocalProfiles()).length === count,
    "Duplicate names cannot overwrite a configured profile",
  );
  const oldSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    if (key.startsWith(p.PROFILE_PREFIX) && key.endsWith(":reelcase.prefs.v4"))
      throw new DOMException("Controlled settings quota", "QuotaExceededError");
    return oldSet.call(this, key, value);
  };
  rejected = false;
  try {
    await p.createConfiguredLocalProfile("Quota fixture", { view: "list" });
  } catch {
    rejected = true;
  } finally {
    Storage.prototype.setItem = oldSet;
  }
  check(
    rejected && snapshot() === before && (await p.listLocalProfiles()).length === count,
    "Settings quota failure publishes no profile and keeps prior keys",
  );
  Storage.prototype.setItem = function (key, value) {
    if (key.startsWith(p.PROFILE_PREFIX) && key.endsWith(":reelcase.performance-mode"))
      throw new DOMException("Controlled second setting quota", "QuotaExceededError");
    return oldSet.call(this, key, value);
  };
  rejected = false;
  try {
    await p.createConfiguredLocalProfile("Partial settings fixture", {
      view: "list",
      performanceMode: "low-memory",
    });
  } catch {
    rejected = true;
  } finally {
    Storage.prototype.setItem = oldSet;
  }
  check(
    rejected && snapshot() === before && (await p.listLocalProfiles()).length === count,
    "A second settings write failure removes the first unpublished key",
  );
  const oldPut = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value, key) {
    if (this.transaction.db.name === p.PROFILE_REGISTRY_DB && key === "registry")
      throw new DOMException("Controlled registry quota", "QuotaExceededError");
    return oldPut.call(this, value, key);
  };
  rejected = false;
  try {
    await p.createConfiguredLocalProfile("Registry quota fixture", {
      view: "list",
      performanceMode: "low-memory",
    });
  } catch {
    rejected = true;
  } finally {
    IDBObjectStore.prototype.put = oldPut;
  }
  check(
    rejected && snapshot() === before && (await p.listLocalProfiles()).length === count,
    "Registry failure rolls back the unpublished settings key",
  );
  IDBObjectStore.prototype.put = function (value, key) {
    const request = oldPut.call(this, value, key);
    if (this.transaction.db.name === p.PROFILE_REGISTRY_DB && key === "registry")
      request.onsuccess = () => this.transaction.abort();
    return request;
  };
  rejected = false;
  try {
    await p.createConfiguredLocalProfile("Aborted settings fixture", {
      view: "list",
      performanceMode: "low-memory",
    });
  } catch {
    rejected = true;
  } finally {
    IDBObjectStore.prototype.put = oldPut;
  }
  check(
    rejected && snapshot() === before && (await p.listLocalProfiles()).length === count,
    "Asynchronous registry abort removes unpublished configuration",
  );
  const race = await Promise.allSettled([
    p.createConfiguredLocalProfile("One configured name", { view: "grid" }),
    p.createConfiguredLocalProfile("one CONFIGURED name", { view: "list" }),
  ]);
  check(
    race.filter((row) => row.status === "fulfilled").length === 1 &&
      (await p.listLocalProfiles()).length === count + 1,
    "Concurrent configuration creation serializes duplicate names",
  );
  before = snapshot();
  rejected = false;
  try {
    await p.createConfiguredLocalProfile("Invalid payload", { view: "grid", history: ["private"] });
  } catch {
    rejected = true;
  }
  check(rejected && snapshot() === before, "Unsupported settings reject before storage mutation");
  check(
    localStorage.getItem("reelcase.prefs.v4") === protectedValue,
    "Default data preserved across every failure and retry",
  );
  return [
    "New namespace contains selected settings only",
    "Default private preferences and authentication unchanged",
    "No personal databases created",
    "Duplicate destination preserves earlier configuration",
    "Local settings quota retains previous profiles",
    "Registry quota and asynchronous abort roll back unpublished settings",
    "Partial configuration quota clears all unpublished keys",
    "Concurrent configured profile names serialize",
    "Unsupported settings cannot mutate storage",
  ];
}
