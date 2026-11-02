export async function mediaRecoveryStorageFixture(p) {
  const check = (value, message) => {
      if (!value) throw Error(message);
    },
    open = () =>
      new Promise((yes, no) => {
        const r = indexedDB.open("media-health-storage-fixture", 1);
        r.onupgradeneeded = () => {
          r.result.createObjectStore("activity");
          r.result.createObjectStore("remote-cache");
        };
        r.onsuccess = () => yes(r.result);
        r.onerror = () => no(r.error);
      });
  const read = async () => {
    const db = await open();
    try {
      return await new Promise((yes) => {
        const r = db.transaction("activity").objectStore("activity").get(p.MEDIA_HEALTH_KEY);
        r.onsuccess = () => yes(r.result);
      });
    } finally {
      db.close();
    }
  };
  const writer = p.createWriterLease(open, "health", { owner: "one", transport: false }),
    other = p.createWriterLease(open, "health", { owner: "two", transport: false }),
    a = p.createMediaHealthRepository(open, writer),
    b = p.createMediaHealthRepository(open, other);
  const video = {
      id: "fixture-clip",
      folderId: "tw:fixture",
      name: "Saved clip",
      path: "",
      size: 0,
      mime: "video/twitch",
      extension: "clip",
      addedAt: 1,
      remote: {
        kind: "twitch",
        videoId: "MissingClip",
        watchUrl: "https://clips.twitch.tv/MissingClip",
      },
    },
    observation = {
      video,
      private: false,
      basis: p.mediaBasis(video),
      status: "publicly-unavailable",
      at: 1,
      code: "public-null",
    };
  const rejects = async (fn, pattern) => {
    let failed;
    try {
      await fn();
    } catch (e) {
      failed = e;
    }
    check(
      failed && pattern.test(failed.message),
      "Expected failure " + pattern + ", got " + failed?.message,
    );
  };
  try {
    await a.observe(observation);
    const before = JSON.stringify(await read()),
      real = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if (this.name === "activity" && key === p.MEDIA_HEALTH_KEY)
        throw new DOMException("Fixture quota reached", "QuotaExceededError");
      return real.apply(this, arguments);
    };
    try {
      await rejects(() => a.choose(video.id, "hidden"), /quota/);
      await rejects(() => a.observe({ ...observation, at: 2, status: "unknown" }), /quota/);
    } finally {
      IDBObjectStore.prototype.put = real;
    }
    check(JSON.stringify(await read()) === before, "Failed recovery write changed saved data");
    await a.choose(video.id, "hidden", 3);
    await b.hydrate();
    check(
      b.getSnapshot().entries[video.id].choice === "hidden",
      "A second reader did not recover the choice",
    );
    let release, started;
    const ready = new Promise((yes) => (started = yes)),
      held = writer.run(async () => {
        started();
        await new Promise((yes) => (release = yes));
      });
    await ready;
    await rejects(() => b.observe({ ...observation, at: 4, status: "unknown" }), /Another app tab/);
    release();
    await held;
    await b.observe({ ...observation, at: 4, status: "unknown" });
    check(
      (await read()).entries[video.id].lastConfirmed === "publicly-unavailable",
      "A failed retry erased verified evidence",
    );
    await b.forget(video.id);
    check(!(await read()).entries[video.id], "Chosen diagnostic was not forgotten");
    const future = { version: 99, opaque: "keep-me" },
      db = await open();
    await new Promise((yes, no) => {
      const tx = db.transaction("activity", "readwrite");
      tx.objectStore("activity").put(future, p.MEDIA_HEALTH_KEY);
      tx.oncomplete = yes;
      tx.onabort = () => no(tx.error);
    });
    db.close();
    await rejects(() => a.observe(observation), /Unsupported/);
    check(
      JSON.stringify(await read()) === JSON.stringify(future),
      "A future ledger was overwritten",
    );
    return [
      "Quota failures preserve recovery observations and visibility choices atomically",
      "A second writer is refused while another owns the catalog lease; a reader sees committed choices",
      "Temporary retry keeps earlier public-unavailability evidence",
      "Future recovery ledgers are retained and block incompatible writes",
    ];
  } finally {
    writer.close();
    other.close();
  }
}
