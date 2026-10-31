import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { createDownloadManager, youtubeWatchUrl } from "../companion/download-manager.mjs";
const id = "BaW_jenozKc";
test("failed admission retains all forty prior receipts in memory and on disk", (t) => {
  const f = fixture(t);
  const jobs = Array.from({ length: 40 }, (_, index) => ({
    id: `retained-${index}`, key: id, source: "youtube", status: "cancelled",
    title: `Retained ${index}`, detail: "Cancelled previously.",
  }));
  const prior = JSON.stringify({ version: 2, jobs });
  writeFileSync(f.manifest, prior);
  f.options.commitReceipt = () => { throw Error("ENOSPC fixture"); };
  const restored = f.create();
  assert.throws(() => restored.enqueue({ key: id, binary: "fixture" }), /receipts could not be saved/);
  assert.deepEqual(restored.list().map(job => job.id), jobs.map(job => job.id));
  assert.equal(readFileSync(f.manifest, "utf8"), prior);
  assert.equal(f.processes.length, 0);
});
function fixture(t, overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), "realhub-receipt-")),
    processes = [],
    managers = [];
  const options = {
    root,
    approveRoot: (path) => {
      try {
        const p = realpathSync(path);
        return p === root || p.startsWith(root + sep) ? p : null;
      } catch {
        return null;
      }
    },
    spawnProcess(binary, args) {
      const child = new EventEmitter();
      child.stdout = new PassThrough();
      child.stderr = new PassThrough();
      child.kill = () => true;
      processes.push({ child, binary, args });
      return child;
    },
    ...overrides,
  };
  const create = () => {
    const manager = createDownloadManager(options);
    managers.push(manager);
    return manager;
  };
  t.after(() => {
    managers.forEach((m) => m.shutdown());
    assert(realpathSync(root).startsWith(realpathSync(tmpdir()) + sep + "realhub-receipt-"));
    rmSync(root, { recursive: true, force: true });
  });
  const manager = create(),
    start = (key = id) =>
      manager.enqueue({
        key,
        url: youtubeWatchUrl(key),
        title: "Receipt fixture",
        binary: "fixture",
        engine: "yt-dlp",
      });
  return {
    root,
    options,
    processes,
    manager,
    create,
    start,
    manifest: join(root, ".realhub-downloads.json"),
  };
}
test("restart restores active and queued work as interrupted without starting anything; explicit resume retains ID and clears old browser consent", (t) => {
  const f = fixture(t);
  const first = f.manager.enqueue({
      key: id,
      url: youtubeWatchUrl(id),
      binary: "fixture",
      engine: "yt-dlp",
      browser: "chrome",
    }),
    second = f.start("12345678901");
  const restored = f.create();
  assert.equal(f.processes.length, 1);
  assert(restored.list().every((job) => job.status === "interrupted"));
  const resumed = restored.resume(first.id, { binary: "fixture", engine: "yt-dlp" });
  assert.equal(resumed.id, first.id);
  assert.equal(resumed.attempt, 2);
  assert.equal(resumed.browser, "none");
  assert(f.processes[1].args.includes("--continue"));
  assert(!f.processes[1].args.includes("--cookies-from-browser"));
  assert.equal(restored.resume(first.id, { binary: "fixture" }).id, first.id);
  assert.equal(f.processes.length, 2);
  restored.cancel(second.id);
  assert.equal(
    f
      .create()
      .list()
      .find((job) => job.id === second.id).status,
    "cancelled",
  );
});
test("completed receipt survives restart and a repeated enqueue/resume never starts another process without an explicit new-download request", (t) => {
  const f = fixture(t),
    job = f.start();
  writeFileSync(join(job.path, "video.mp4"), "completed fixture");
  f.processes[0].child.emit("close", 0);
  const restored = f.create(),
    count = f.processes.length;
  assert.equal(
    restored.enqueue({ key: id, url: youtubeWatchUrl(id), binary: "fixture" }).id,
    job.id,
  );
  assert.equal(restored.resume(job.id, { binary: "fixture" }).id, job.id);
  assert.equal(f.processes.length, count);
  const again = restored.enqueue({
    key: id,
    url: youtubeWatchUrl(id),
    binary: "fixture",
    forceNew: true,
  });
  assert.notEqual(again.id, job.id);
  assert.equal(f.processes.length, count + 1);
});
test("a failed receipt commit cannot start a downloader and leaves the prior manifest readable", (t) => {
  let writes = 0;
  const f = fixture(t, {
    writeReceipt(...args) {
      if (++writes > 1) throw Error("ENOSPC fixture");
      return writeFileSync(...args);
    },
  });
  const job = f.start();
  assert.equal(job.status, "error");
  assert.equal(f.processes.length, 0);
  assert.equal(f.manager.recovery().persistent, false);
  assert.match(f.manager.recovery().error, /receipts could not be saved/);
  const saved = JSON.parse(readFileSync(f.manifest));
  assert.equal(saved.version, 2);
  assert.equal(saved.jobs[0].status, "queued");
  assert.equal(f.create().list()[0].status, "interrupted");
  assert.equal(f.processes.length, 0);
});
test("future or malformed manifests are preserved and cannot be overwritten by a new operation", (t) => {
  const f = fixture(t),
    original = JSON.stringify({ version: 999, jobs: [] });
  writeFileSync(f.manifest, original);
  const restored = f.create();
  assert.throws(
    () => restored.enqueue({ key: id, url: youtubeWatchUrl(id), binary: "fixture" }),
    /unsupported version/,
  );
  assert.equal(readFileSync(f.manifest, "utf8"), original);
  assert.equal(f.processes.length, 0);
});
test("legacy receipt migration allowlists fields and does not expose URLs or injected credential headers", (t) => {
  const f = fixture(t),
    job = f.start();
  const saved = JSON.parse(readFileSync(f.manifest)).jobs[0];
  writeFileSync(
    f.manifest,
    JSON.stringify([
      { ...saved, headers: { Authorization: "CANARY-SECRET" }, cookie: "CANARY-COOKIE" },
    ]),
  );
  const restored = f.create(),
    publicText = JSON.stringify(restored.list());
  assert(!publicText.includes("CANARY"));
  assert(!publicText.includes("youtube.com"));
  assert.equal(restored.list()[0].id, job.id);
  assert.equal(restored.list()[0].status, "interrupted");
});
test("cancellation and timeout outcomes cannot be changed to complete by a late process exit", (t) => {
  const f = fixture(t),
    job = f.start();
  f.manager.cancel(job.id);
  writeFileSync(join(job.path, "video.mp4"), "late fixture");
  f.processes[0].child.emit("close", 0);
  assert.equal(f.manager.list()[0].status, "cancelled");
  assert.equal(f.create().list()[0].status, "cancelled");
});
test("receipt history remains bounded while partial files are retained and offline URLs cannot carry embedded credentials", (t) => {
  const f = fixture(t);
  for (let i = 0; i < 45; i++) {
    const job = f.start(String(i).padStart(11, "a"));
    f.manager.cancel(job.id);
    f.processes.at(-1).child.emit("close", null);
  }
  assert.equal(f.manager.list().length, 40);
  assert.equal(JSON.parse(readFileSync(f.manifest)).jobs.length, 40);
  assert.throws(
    () =>
      f.manager.enqueue({
        key: "offline",
        source: "offline",
        url: "https://user:password@example.org/video",
        binary: "fixture",
      }),
    /credentials/,
  );
});
