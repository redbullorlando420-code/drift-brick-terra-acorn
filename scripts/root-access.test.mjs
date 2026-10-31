import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  renameSync,
  symlinkSync,
  realpathSync,
  rmSync,
  unlinkSync,
} from "node:fs";
import { resolve, join, sep } from "node:path";
import { createRootAuthority } from "../companion/root-authority.mjs";
import { createDownloadManager } from "../companion/download-manager.mjs";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
const parent = realpathSync(resolve(".grok"));
function fixture(t) {
  const base = mkdtempSync(join(parent, "root-policy-")),
    root = join(base, "approved"),
    other = join(base, "other");
  mkdirSync(root);
  mkdirSync(other);
  const policyFile = join(base, "policy.json"),
    a = createRootAuthority([root, other], { policyFile, intervalMs: 10 });
  t.after(() => {
    a.close();
    assert(realpathSync(base).startsWith(parent + sep + "root-policy-"));
    rmSync(base, { recursive: true, force: true });
  });
  return { a, base, root, other, policyFile };
}
test("approved files remain usable while unapproved and traversal paths are denied", (t) => {
  const { a, root, base } = fixture(t);
  const f = join(root, "media.txt");
  writeFileSync(f, "saved");
  assert.equal(String(a.read(f)), "saved");
  a.write(f, "changed");
  assert.equal(String(a.read(f)), "changed");
  assert.equal(a.check(join(root, "..", "secret.txt")), null);
  assert.throws(() => a.write(join(base, "forbidden.txt"), "no"), /Folder access/);
  assert.equal(a.snapshot().pending, 0);
});
test("revocation aborts held work immediately, persists across restart and leaves other roots usable", async (t) => {
  const { a, root, other, policyFile } = fixture(t);
  const access = a.lease(root),
    row = a.snapshot().roots.find((r) => r.path === root);
  a.change(row.id, row.revision, false);
  assert(access.signal.aborted);
  assert.throws(() => access.assert(join(root, "later"), { write: true }));
  assert.equal(a.check(other), other);
  assert.equal(a.check(root), null);
  const next = createRootAuthority([root, other], { policyFile });
  t.after(() => next.close());
  assert.equal(next.check(root), null);
  assert.throws(() => a.change(row.id, row.revision, true), /changed/);
  access.release();
  assert.equal(a.snapshot().pending, 0);
});
test("renamed/replaced root identity cannot inherit permission at the same path", (t) => {
  const { a, root } = fixture(t),
    lease = a.lease(root);
  renameSync(root, root + "-moved");
  mkdirSync(root);
  assert.equal(a.check(root), null);
  assert(lease.signal.aborted);
  assert.equal(a.snapshot().roots.find((r) => r.path === root).state, "identity-changed");
  lease.release();
});
test("a retargeted directory junction is rejected before a delayed write or read", (t) => {
  const { a, root, base } = fixture(t),
    inside = join(root, "inside"),
    outside = join(base, "outside"),
    link = join(root, "link");
  mkdirSync(inside);
  mkdirSync(outside);
  writeFileSync(join(outside, "secret.txt"), "canary");
  symlinkSync(inside, link, "junction");
  const lease = a.lease(link);
  unlinkSync(link);
  symlinkSync(outside, link, "junction");
  assert.throws(() => lease.assert(join(link, "secret.txt")));
  assert.equal(a.check(join(link, "secret.txt")), null);
  assert.throws(() => a.write(join(link, "new.txt"), "no"));
  assert.equal(readFileSync(join(outside, "secret.txt"), "utf8"), "canary");
  lease.release();
});
test("new files check real ancestors and existing target links before committing", (t) => {
  const { a, root, base } = fixture(t),
    outside = join(base, "outside.txt");
  writeFileSync(outside, "preserve");
  const outsideDir = join(base, "outside-dir");
  mkdirSync(outsideDir);
  const moved = join(outsideDir, "outside.txt");
  renameSync(outside, moved);
  symlinkSync(outsideDir, join(root, "linked-dir"), "junction");
  assert.throws(() => a.write(join(root, "linked-dir", "outside.txt"), "no"));
  renameSync(moved, outside);
  assert.equal(readFileSync(outside, "utf8"), "preserve");
  const dir = a.ensureDirectory(join(root, "new", "nested"));
  a.write(join(dir, "normal.txt"), "ok");
  assert.equal(String(a.read(join(dir, "normal.txt"))), "ok");
});
test("revoked queued and active downloads cannot dispatch or report a late completion", (t) => {
  const { a, root } = fixture(t),
    children = [];
  const manager = createDownloadManager({
    root,
    rootAuthority: a,
    approveRoot: (p) => a.check(p),
    spawnProcess() {
      const child = new EventEmitter();
      child.stdout = new PassThrough();
      child.stderr = new PassThrough();
      child.killed = 0;
      child.kill = () => {
        child.killed++;
        return true;
      };
      children.push(child);
      return child;
    },
  });
  t.after(() => manager.shutdown());
  const first = manager.enqueue({ key: "BaW_jenozKc", binary: "fixture" }),
    second = manager.enqueue({ key: "abcdefghijk", binary: "fixture" });
  assert.equal(children.length, 1);
  writeFileSync(join(first.path, "partial.part"), "keep");
  const row = a.snapshot().roots.find((r) => r.path === root);
  a.change(row.id, row.revision, false);
  assert(children[0].killed);
  assert.equal(manager.list().find((j) => j.id === first.id).status, "interrupted");
  assert.equal(manager.list().find((j) => j.id === second.id).status, "interrupted");
  children[0].emit("close", 0);
  assert.equal(children.length, 1);
  assert.equal(manager.media(first.id), null);
  assert.equal(readFileSync(join(first.path, "partial.part"), "utf8"), "keep");
  assert.equal(a.snapshot().pending, 0);
});
test("folder replacement inside an approved root invalidates a held downloader lease", async (t) => {
  const { a, root } = fixture(t);
  let child;
  const manager = createDownloadManager({
    root,
    rootAuthority: a,
    approveRoot: (p) => a.check(p),
    spawnProcess() {
      child = new EventEmitter();
      child.stdout = new PassThrough();
      child.stderr = new PassThrough();
      child.kill = () => {
        child.killed = true;
        return true;
      };
      return child;
    },
  });
  t.after(() => manager.shutdown());
  const job = manager.enqueue({ key: "BaW_jenozKc", binary: "fixture" });
  renameSync(job.path, join(root, "old-folder"));
  mkdirSync(job.path);
  await new Promise((r) => setTimeout(r, 45));
  assert(child.killed);
  assert.equal(manager.list()[0].status, "interrupted");
  child.emit("close", 0);
});

test("a failed policy save keeps revoked access blocked and cannot silently grant it back", (t) => {
  const { a, root, policyFile } = fixture(t);
  let row = a.snapshot().roots.find((r) => r.path === root);
  a.change(row.id, row.revision, false);
  renameSync(policyFile, policyFile + ".old");
  mkdirSync(policyFile);
  row = a.snapshot().roots.find((r) => r.path === root);
  assert.throws(() => a.change(row.id, row.revision, true), /could not be saved/);
  assert.equal(a.check(root), null);
  assert.equal(a.snapshot().persistent, false);
});

test("held native metadata output is discarded after revocation and its process is stopped", async (t) => {
  const { a, root } = fixture(t);
  const file = join(root, "media.mp4");
  writeFileSync(file, "fixture");
  const { approvedProcess } = await import("../companion/guarded-process.mjs");
  let child;
  const promise = approvedProcess(a, file, "fixture", [], {
    spawnProcess() {
      child = new EventEmitter();
      child.stdout = new PassThrough();
      child.kill = () => {
        child.killed = true;
        return true;
      };
      return child;
    },
  });
  const rejected = assert.rejects(promise, /Folder access/);
  const row = a.snapshot().roots.find((r) => r.path === root);
  a.change(row.id, row.revision, false);
  child.stdout.write("private metadata");
  child.emit("close", 0);
  await rejected;
  assert(child.killed);
  assert.equal(a.snapshot().pending, 0);
});

test("future or malformed persisted approval policies fail closed without granting any root", (t) => {
  const { root, policyFile } = fixture(t);
  for (const data of [
    { version: 99, disabled: [] },
    { version: 1, disabled: ["invalid-id"] },
    { version: 1, disabled: {} },
    { version: 1, disabled: Array(65).fill("a".repeat(24)) },
  ]) {
    writeFileSync(policyFile, JSON.stringify(data));
    const checked = createRootAuthority([root], { policyFile });
    assert.equal(checked.check(root), null);
    assert.equal(checked.snapshot().persistent, false);
    assert.equal(checked.snapshot().roots[0].state, "policy-unreadable");
    checked.close();
  }
});

test('approved native metadata completes normally; response overflow cannot retain native output',async t=>{const{a,root}=fixture(t);const file=join(root,'normal.mp4');writeFileSync(file,'fixture');const{approvedProcess}=await import('../companion/guarded-process.mjs');let child;const options={spawnProcess(){child=new EventEmitter();child.stdout=new PassThrough();child.kill=()=>{child.killed=true;return true};return child;}};const completed=approvedProcess(a,file,'fixture',[],options);child.stdout.write('valid metadata');child.emit('close',0);assert.equal(await completed,'valid metadata');assert.equal(a.snapshot().pending,0);const oversized=approvedProcess(a,file,'fixture',[],{...options,maxBytes:4});const rejected=assert.rejects(oversized,/exceeded/);child.stdout.write('too much output');await rejected;assert(child.killed);assert.equal(a.snapshot().pending,0);});

test('revocation closes a backpressured media stream without sending its pending remainder',async t=>{const{a,root}=fixture(t);const file=join(root,'movie.mp4');const bytes=Buffer.alloc(256*1024,1);writeFileSync(file,bytes);const{serveDownloadMedia}=await import('../companion/download-media.mjs');const{Writable}=await import('node:stream');let first,writes=0;const ready=new Promise(yes=>first=yes);const res=new Writable({write(chunk,encoding,done){writes++;first();}});res.setHeader=()=>{};res.writeHead=()=>{};res.on('error',()=>{});serveDownloadMedia({headers:{},method:'GET'},res,{path:file,size:bytes.length,mime:'video/mp4'},{authority:a});await ready;const row=a.snapshot().roots.find(r=>r.path===root);a.change(row.id,row.revision,false);await new Promise(yes=>setImmediate(yes));assert(res.destroyed);assert.equal(writes,1);assert.equal(a.snapshot().pending,0);});

test('closing the root owner rejects delayed requests and cannot create new file leases',t=>{const{a,root}=fixture(t);const before=a.generation();a.close();assert.equal(a.check(root),null);assert.throws(()=>a.assertGeneration(before),/Folder access/);assert.throws(()=>a.lease(root),/Folder access/);assert.throws(()=>a.write(join(root,'late.txt'),'no'),/Folder access/);assert.equal(a.snapshot().pending,0);});
