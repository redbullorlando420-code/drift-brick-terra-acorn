import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  realpathSync,
  existsSync,
  renameSync,
} from "node:fs";
import { join, sep, resolve } from "node:path";
import { createRootAuthority } from "../companion/root-authority.mjs";
import { createDownloadManager } from "../companion/download-manager.mjs";
import { downloadBudget } from "../companion/download-preflight.mjs";
const MiB = 1024 ** 2,
  id = "BaW_jenozKc";
function fixture(t) {
  const parent = realpathSync(resolve(".grok")),
    base = mkdtempSync(join(parent, "download-budget-")),
    root = join(base, "approved");
  mkdirSync(root);
  const authority = createRootAuthority([root]);
  let time=100000;
  let free = 8192 * MiB,
    unknown = false;
  const processes = [],
    managers = [];
  const options = {
    root,
    rootAuthority: authority,now:()=>time,
    approveRoot: (p) => authority.check(p),
    budget: { marginBytes: 64 * MiB, unknownBytes: 128 * MiB },
    space() {
      if (unknown) throw Error("Unavailable fixture");
      return { bavail: BigInt(free), bsize: 1n };
    },
    spawnProcess(binary, args, options) {
      const child = new EventEmitter();
      child.stdout = new PassThrough();
      child.stderr = new PassThrough();
      child.kill = () => {
        child.killed = true;
        return true;
      };
      processes.push({ child, args, options });
      return child;
    },
  };
  const create = () => {
    const manager = createDownloadManager(options);
    managers.push(manager);
    return manager;
  };
  const manager = create();
  t.after(() => {
    for (const m of managers) m.shutdown();
    authority.close();
    assert(realpathSync(base).startsWith(parent + sep + "download-budget-"));
    rmSync(base, { recursive: true, force: true });
  });
  return {
    root,
    base,
    authority,
    manager,
    create,
    processes,
    advance:()=>time+=6000,
    low: () => (free = 1),
    ready: () => (free = 8192 * MiB),
    unknown: () => (unknown = true),
    start: (key = id, extra = {}) => manager.enqueue({ key, binary: "fixture", ...extra }),
  };
}
test("low space pauses before creating an output folder or native process, and reload preserves the pause", (t) => {
  const f = fixture(t);
  f.low();
  const job = f.start();
  assert.equal(job.status, "paused");
  assert.equal(job.preflight.state, "low-space");
  assert.equal(f.processes.length, 0);
  assert(!existsSync(join(f.root, job.folderName)));
  assert.equal(f.create().list()[0].status, "paused");
  assert.equal(f.create().list()[0].preflight.state, "low-space");
  f.ready();
  const resumed = f.manager.resume(job.id, { binary: "fixture" });
  assert.equal(resumed.id, job.id);
  assert.equal(resumed.status, "running", resumed.detail);
  assert.equal(f.processes.length, 1);
});
test("verified partial files survive a low-space pause and resume with the same receipt and no-overwrite flags", (t) => {
  const f = fixture(t),
    job = f.start();
  const partial = join(job.path, "video.mp4.part");
  writeFileSync(partial, "verified partial");
  f.manager.cancel(job.id);
  f.processes[0].child.emit("close", null);
  f.low();
  assert.equal(f.manager.resume(job.id, { binary: "fixture" }).status, "paused");
  assert.equal(readFileSync(partial, "utf8"), "verified partial");
  assert.equal(f.processes.length, 1);
  f.ready();
  assert.equal(f.manager.resume(job.id, { binary: "fixture" }).status, "running");
  assert(f.processes[1].args.includes("--continue"));
  assert(f.processes[1].args.includes("--no-overwrites"));
  assert.equal(readFileSync(partial, "utf8"), "verified partial");
});
test("altered partials and legacy unowned files cannot be adopted; a fresh copy uses a separate destination", (t) => {
  const f = fixture(t),
    job = f.start(),
    partial = join(job.path, "video.mp4.part");
  writeFileSync(partial, "original");
  f.manager.cancel(job.id);
  f.processes[0].child.emit("close", null);
  writeFileSync(partial, "unrelated replacement");
  const refused = f.manager.resume(job.id, { binary: "fixture" });
  assert.equal(refused.status, "paused");
  assert.equal(refused.preflight.state, "files-unverified");
  assert.equal(f.processes.length, 1);
  const fresh = f.start(id, { forceNew: true });
  assert.notEqual(fresh.path, job.path);
  assert.equal(readFileSync(partial, "utf8"), "unrelated replacement");
  f.manager.cancel(fresh.id);
  f.processes[1].child.emit("close", null);
  const legacy = {
    id: "old-receipt",
    key: "12345678901",
    source: "youtube",
    status: "interrupted",
    path: join(f.root, "12345678901"),
  };
  mkdirSync(legacy.path);
  writeFileSync(join(legacy.path, "keep.part"), "unowned");
  writeFileSync(
    join(f.root, ".realhub-downloads.json"),
    JSON.stringify({ version: 2, jobs: [legacy] }),
  );
  assert.equal(f.create().resume(legacy.id, { binary: "fixture" }).status, "paused");
  assert.equal(readFileSync(join(legacy.path, "keep.part"), "utf8"), "unowned");
});
test("queued work rechecks disk space at dispatch instead of trusting its admission time", (t) => {
  const f = fixture(t);
  f.start();
  const second = f.start("12345678901");
  assert.equal(second.status, "queued");
  f.low();
  f.processes[0].child.emit("close", 1);
  const paused = f.manager.list().find((j) => j.id === second.id);
  assert.equal(paused.status, "paused");
  assert.equal(f.processes.length, 1);
});
test("unknown sizes and unavailable disk measurements stay explicit; invalid estimates cannot shrink the allowance", (t) => {
  const f = fixture(t),
    job = f.start(id, { estimatedBytes: -1 });
  assert.equal(job.preflight.estimateBytes, null);
  assert.equal(job.preflight.requiredBytes, 192 * MiB);
  f.manager.cancel(job.id);
  f.processes[0].child.emit("close", null);
  f.unknown();
  assert.equal(f.start("12345678901").preflight.state, "space-unknown");
  assert.equal(f.processes.length, 1);
  assert.deepEqual(
    downloadBudget({
      REELCASE_DOWNLOAD_MARGIN_MIB: "0",
      REELCASE_DOWNLOAD_ESTIMATE_MIB: "Infinity",
    }),
    { marginBytes: 512 * MiB, unknownBytes: 2048 * MiB },
  );
  assert.equal(downloadBudget({ REELCASE_DOWNLOAD_MARGIN_MIB: "64" }).marginBytes, 64 * MiB);
});
test("destination identity replacement and revoked roots cannot resume a pending download", (t) => {
  const f = fixture(t),
    job = f.start();
  writeFileSync(join(job.path, "video.part"), "keep");
  f.manager.cancel(job.id);
  f.processes[0].child.emit("close", null);
  renameSync(job.path, job.path + "-original");
  mkdirSync(job.path);
  writeFileSync(join(job.path, "unrelated.mp4"), "do not replace");
  assert.equal(f.manager.resume(job.id, { binary: "fixture" }).status, "paused");
  assert.equal(readFileSync(join(job.path, "unrelated.mp4"), "utf8"), "do not replace");
  const row = f.authority.snapshot().roots[0];
  f.authority.change(row.id, row.revision, false);
  assert.throws(() => f.manager.resume(job.id, { binary: "fixture" }), /approved download folder/);
  assert.equal(f.processes.length, 1);
});

test('active progress checks stop at the disk margin with bounded timing and preserve partials',t=>{const f=fixture(t),job=f.start(),partial=join(job.path,'active.part');writeFileSync(partial,'still here');f.low();f.processes[0].child.stdout.write('[download] 20%\n');assert.equal(f.manager.list()[0].status,'running');f.advance();f.processes[0].child.stdout.write('[download] 30%\n');assert.equal(f.manager.list()[0].status,'paused');assert(f.processes[0].child.killed);f.processes[0].child.emit('close',null);assert.equal(readFileSync(partial,'utf8'),'still here');});
