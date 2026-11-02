export async function identityReviewStorageFixture(p) {
  const check = (v, m) => {
      if (!v) throw Error(m);
    },
    open = () =>
      new Promise((yes, no) => {
        const r = indexedDB.open("identity-review-native-fixture", 1);
        r.onupgradeneeded = () => {
          r.result.createObjectStore("activity");
          r.result.createObjectStore("remote-cache");
        };
        r.onsuccess = () => yes(r.result);
        r.onerror = () => no(r.error);
      });
  const put = async (key, value) => {
    const db = await open();
    try {
      await new Promise((yes, no) => {
        const tx = db.transaction("activity", "readwrite");
        tx.objectStore("activity").put(value, key);
        tx.oncomplete = yes;
        tx.onabort = tx.onerror = () => no(tx.error);
      });
    } finally {
      db.close();
    }
  };
  const read = async (key) => {
    const db = await open();
    try {
      return await new Promise((yes, no) => {
        const r = db.transaction("activity").objectStore("activity").get(key);
        r.onsuccess = () => yes(r.result);
        r.onerror = () => no(r.error);
      });
    } finally {
      db.close();
    }
  };
  const writer = p.createWriterLease(open, "identity-review", { owner: "one", transport: false }),
    other = p.createWriterLease(open, "identity-review", { owner: "two", transport: false }),
    aliases = p.createTwitchAliasRepository(open, writer),
    reviews = p.createPackReviewRepository(open, writer);
  const source = {
    id: "tw:old",
    kind: "twitch",
    handle: "old",
    title: "Old creator",
    channelId: "123",
    twitchPullPolicy: { version: 1, clips: false, vods: true, priority: "high" },
  };
  await put("follows", { channels: [source], savedAt: 1 });
  await put("feedback", { ratings: { "tw:v:55": 5 }, notes: { "tw:v:55": "Kept" } });
  await put("preferences", { tags: { "tw:v:55": ["racing"] } });
  const evidence = { version: 1, userId: "123", from: "old", to: "renamed", checkedAt: Date.now() },
    changed = await aliases.apply(source, evidence);
  check(
    changed[0].id === "tw:old" && changed[0].handle === "renamed",
    "Canonical source survives verified rename",
  );
  check(
    (await read(p.TWITCH_ALIAS_JOURNAL)).entries.length === 1,
    "Alias journal and follow committed",
  );
  check((await read("feedback")).ratings["tw:v:55"] === 5, "Video ratings unchanged");
  check((await read("preferences")).tags["tw:v:55"][0] === "racing", "Tags unchanged");
  const original = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value, key) {
    if (key === p.TWITCH_ALIAS_JOURNAL)
      throw new DOMException("Controlled full storage", "QuotaExceededError");
    return original.call(this, value, key);
  };
  let failed = false;
  try {
    await aliases.apply(changed[0], { ...evidence, from: "renamed", to: "again" });
  } catch {
    failed = true;
  } finally {
    IDBObjectStore.prototype.put = original;
  }
  check(
    failed &&
      (await read("follows")).channels[0].handle === "renamed" &&
      (await read(p.TWITCH_ALIAS_JOURNAL)).entries.length === 1,
    "Quota abort preserves both old follow and journal",
  );
  const draft = {
    version: 1,
    id: "review-one",
    name: "Private fixture",
    at: Date.now(),
    fingerprint: "a".repeat(64),
    files: [["marks/ratings.json", { ratings: { v: 1 } }]],
    choices: {},
  };
  const first = await reviews.save(undefined, draft);
  check(first.revision === 1, "Review saved");
  const second = await reviews.save(first, { ...draft, choices: { field: "current" } });
  check(second.revision === 2, "Choices saved");
  failed = false;
  try {
    await reviews.save(first, { ...draft, choices: { field: "imported" } });
  } catch {
    failed = true;
  }
  check(
    failed && (await reviews.load()).choices.field === "current",
    "Stale review revision cannot overwrite choices",
  );
  IDBObjectStore.prototype.put = function (value, key) {
    if (key === p.PACK_REVIEW_KEY)
      throw new DOMException("Controlled full storage", "QuotaExceededError");
    return original.call(this, value, key);
  };
  failed = false;
  try {
    await reviews.save(second, draft);
  } catch {
    failed = true;
  } finally {
    IDBObjectStore.prototype.put = original;
  }
  check(failed && (await reviews.load()).revision === 2, "Quota preserves existing review");
  let release, started;
  const ready = new Promise((r) => (started = r)),
    hold = other.run(
      () =>
        new Promise((r) => {
          release = r;
          started();
        }),
      false,
    );
  await ready;
  failed = false;
  try {
    await aliases.apply(changed[0], { ...evidence, from: "renamed", to: "again" });
  } catch {
    failed = true;
  } finally {
    release();
    await hold;
  }
  check(failed, "Other tab writer fences alias change");
  await put(p.PACK_REVIEW_KEY, { version: 2, private: "retained" });
  failed = false;
  try {
    await reviews.load();
  } catch {
    failed = true;
  }
  check(
    failed && (await read(p.PACK_REVIEW_KEY)).private === "retained",
    "Future review fails closed without clearing",
  );
  writer.close();
  other.close();
  return [
    "Atomic alias journal/follow commit and quota abort",
    "Personal marks untouched",
    "Review revision CAS, quota recovery and future schema retention",
    "Cross-tab writer exclusion",
  ];
}
