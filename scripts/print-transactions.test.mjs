import test from "node:test";
import assert from "node:assert/strict";
import { Readable, PassThrough } from "node:stream";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  realpathSync,
  rmSync,
  existsSync,
  renameSync,
  readdirSync,
} from "node:fs";
import { join, resolve, sep } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { createRootAuthority } from "../companion/root-authority.mjs";
import { createPrintTransactions } from "../companion/print-transactions.mjs";
import { glb } from "./fixtures/print-glb.mjs";
function fixture(t, extra = {}) {
  const parent = realpathSync(resolve(".grok")),
    base = mkdtempSync(join(parent, "print-transactions-")),
    root = join(base, "approved");
  mkdirSync(root);
  const authority = createRootAuthority([root]),
    receiptFile = join(base, "receipts.json"),
    managers = [];
  const create = () => {
      const manager = createPrintTransactions({
        authority,
        receiptFile,
        defaultDirectory: () => root,
        ...extra,
      });
      managers.push(manager);
      return manager;
    },
    manager = create(),
    bytes = glb(),
    prepare = (name = "copy.glb") =>
      manager.prepare({
        name,
        bytes: bytes.length,
        sha256: createHash("sha256").update(bytes).digest("hex"),
      });
  t.after(() => {
    managers.forEach((m) => m.shutdown());
    authority.close();
    assert(realpathSync(base).startsWith(parent + sep + "print-transactions-"));
    rmSync(base, { recursive: true, force: true });
  });
  return { root, base, authority, receiptFile, manager, create, bytes, prepare };
}
test("review does not create a model; exclusive atomic commit verifies bytes, hash and reload status", async (t) => {
  const f = fixture(t),
    row = f.prepare();
  assert.equal(row.status, "review");
  assert(!existsSync(row.path));
  const saved = await f.manager.commit(
    row.id,
    Readable.from([f.bytes.subarray(0, 13), f.bytes.subarray(13)]),
  );
  assert.equal(saved.status, "done");
  assert.deepEqual(readFileSync(row.path), f.bytes);
  assert(!readdirSync(f.root).some((n) => n.endsWith(".tmp")));
  assert.equal((await f.create().status(row.id)).status, "done");
  assert.equal((await f.manager.commit(row.id, Readable.from([f.bytes]))).id, row.id);
});
test("existing source or destination is never overwritten, including a concurrent destination race", async (t) => {
  let f;
  f = fixture(t, {
    linkFile(temp, target) {
      writeFileSync(target, "unrelated race");
      const error = Error("fixture conflict");
      error.code = "EEXIST";
      throw error;
    },
  });
  writeFileSync(join(f.root, "original.glb"), f.bytes);
  assert.throws(() => f.prepare("original.glb"), /already exists/);
  const row = f.prepare();
  await assert.rejects(f.manager.commit(row.id, Readable.from([f.bytes])), /save failed/);
  assert.equal(readFileSync(row.path, "utf8"), "unrelated race");
  assert.deepEqual(readFileSync(join(f.root, "original.glb")), f.bytes);
  assert.equal((await f.manager.status(row.id)).status, "error");
});
test("short, oversized, corrupt or mismatched uploads fail without a visible model", async (t) => {
  const f = fixture(t);
  for (const [name, bytes] of [
    ["short", f.bytes.subarray(0, 10)],
    ["oversize", Buffer.concat([f.bytes, Buffer.from("extra")])],
    ["mismatch", Buffer.alloc(f.bytes.length)],
  ]) {
    const row = f.prepare(name + ".glb");
    await assert.rejects(f.manager.commit(row.id, Readable.from([bytes])));
    assert(!existsSync(row.path));
  }
  const bytes = Buffer.alloc(20);
  bytes.writeUInt32LE(0x46546c67, 0);
  bytes.writeUInt32LE(2, 4);
  bytes.writeUInt32LE(20, 8);
  const invalid = f.manager.prepare({
    name: "invalid.glb",
    bytes: 20,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
  await assert.rejects(f.manager.commit(invalid.id, Readable.from([bytes])));
  assert(!existsSync(invalid.path));
});
test("write/link failure retains original and leaves the save unconfirmed", async (t) => {
  const f = fixture(t, {
      linkFile() {
        throw Error("ENOSPC fixture");
      },
    }),
    row = f.prepare();
  writeFileSync(join(f.root, "original.glb"), "keep original");
  await assert.rejects(f.manager.commit(row.id, Readable.from([f.bytes])), /original is unchanged/);
  assert.equal(readFileSync(join(f.root, "original.glb"), "utf8"), "keep original");
  assert(!existsSync(row.path));
  assert.equal((await f.manager.status(row.id)).status, "error");
});
test("root revocation interrupts a held stream and late bytes cannot commit it", async (t) => {
  const f = fixture(t),
    row = f.prepare(),
    stream = new PassThrough(),
    pending = f.manager.commit(row.id, stream);
  const rejected = assert.rejects(pending, /original is unchanged|draft/);
  stream.write(f.bytes.subarray(0, 12));
  await new Promise((yes) => setImmediate(yes));
  const root = f.authority.snapshot().roots[0];
  f.authority.change(root.id, root.revision, false);
  stream.end(f.bytes.subarray(12));
  await rejected;
  assert(!existsSync(row.path));
  assert.equal((await f.manager.status(row.id)).status, "interrupted");
});
test("a post-link receipt failure can be verified and recovered without uploading or replacing the file again", async (t) => {
  let writes = 0;
  const f = fixture(t, {
      saveReceipt(temp, file) {
        if (++writes === 4) throw Error("Receipt interruption fixture");
        renameSync(temp, file);
      },
    }),
    row = f.prepare();
  await assert.rejects(f.manager.commit(row.id, Readable.from([f.bytes])), /may have been written/);
  assert.deepEqual(readFileSync(row.path), f.bytes);
  assert.equal((await f.create().status(row.id)).status, "done");
  assert(!readdirSync(f.root).some((n) => n.endsWith(".tmp")));
});
test("interrupted review never replays, explicit cancel releases it and corruption does not erase history", async (t) => {
  const f = fixture(t),
    row = f.prepare(),
    restored = f.create();
  assert.equal((await restored.status(row.id)).status, "interrupted");
  assert(!existsSync(row.path));
  assert.equal(restored.cancel(row.id).status, "cancelled");
  writeFileSync(f.receiptFile, JSON.stringify({ version: 99, rows: [] }));
  const incompatible = f.create();
  assert.throws(
    () =>
      incompatible.prepare({
        name: "new.glb",
        bytes: f.bytes.length,
        sha256: createHash("sha256").update(f.bytes).digest("hex"),
      }),
    /unavailable/,
  );
  assert.equal(JSON.parse(readFileSync(f.receiptFile)).version, 99);
});
test("filename, size, path and pending budgets are enforced before output writes", (t) => {
  const f = fixture(t);
  for (const name of ["../escape.glb", "CON.glb", "wrong.stl", "/escape.glb", "bad\\name.glb"])
    assert.throws(() => f.prepare(name));
  for (let i = 0; i < 8; i++) f.prepare("pending-" + i + ".glb");
  assert.throws(() => f.prepare("over.glb"), /Too many/);
  assert.equal(readdirSync(f.root).length, 0);
});
test("history keeps forty receipts while retaining an in-flight reviewed save", (t) => {
  const f = fixture(t),
    row = f.prepare();
  f.manager.cancel(row.id);
  writeFileSync(
    f.receiptFile,
    JSON.stringify({
      version: 1,
      rows: Array.from({ length: 40 }, (_, i) => ({
        ...row,
        id: randomUUID(),
        status: "cancelled",
      })),
    }),
  );
  const restored = f.create();
  restored.prepare({
    name: "bounded.glb",
    bytes: f.bytes.length,
    sha256: createHash("sha256").update(f.bytes).digest("hex"),
  });
  assert.equal(JSON.parse(readFileSync(f.receiptFile)).rows.length, 40);
});

test("preexisting temporary collisions are preserved", async (t) => {
  const f = fixture(t),
    row = f.prepare(),
    temp = join(f.root, ".realhub-print-" + row.id + ".tmp");
  writeFileSync(temp, "unrelated");
  await assert.rejects(f.manager.commit(row.id, Readable.from([f.bytes])));
  assert.equal(readFileSync(temp, "utf8"), "unrelated");
  assert(!existsSync(row.path));
  f.manager.cancel(row.id);
  assert.equal(readFileSync(temp, "utf8"), "unrelated");
});
