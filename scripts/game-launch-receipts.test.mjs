import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  realpathSync,
  rmSync,
  unlinkSync,
} from "node:fs";
import { resolve, join, sep, basename } from "node:path";
import { createRootAuthority } from "../companion/root-authority.mjs";
import { createLaunchManager } from "../companion/launch-manager.mjs";
function fixture(t, extra = {}) {
  const parent = realpathSync(resolve(".grok")),
    base = mkdtempSync(join(parent, "launch-receipts-")),
    root = join(base, "approved");
  mkdirSync(root);
  const file = join(root, "A & B %.lnk");
  writeFileSync(file, "shortcut fixture only");
  const authority = createRootAuthority([root]),
    processes = [],
    managers = [];
  let time = 100000;
  const options = {
    authority,
    receiptFile: join(base, "launches.json"),
    platform: "win32",
    now: () => time,
    spawnProcess(binary, args, options) {
      const child = new EventEmitter();
      child.unref = () => {};
      child.kill = () => {
        child.killed = true;
        return true;
      };
      processes.push({ child, binary, args, options });
      return child;
    },
    ...extra,
  };
  const create = () => {
    const m = createLaunchManager(options);
    managers.push(m);
    return m;
  };
  const manager = create();
  t.after(() => {
    for (const m of managers) m.shutdown();
    authority.close();
    assert(realpathSync(base).startsWith(parent + sep + "launch-receipts-"));
    rmSync(base, { recursive: true, force: true });
  });
  return { base, root, file, authority, manager, create, processes, advance: () => (time += 9000) };
}
test("concurrent identical clicks share one literal Windows launcher request and receipt", async (t) => {
  const f = fixture(t),
    one = f.manager.launch(f.file),
    two = f.manager.launch(f.file);
  assert.equal(f.processes.length, 1);
  assert.equal(basename(f.processes[0].binary).toLowerCase(), "explorer.exe");
  assert.deepEqual(f.processes[0].args, [f.file]);
  assert.equal(f.processes[0].options.shell, false);
  f.processes[0].child.emit("spawn");
  const [a, b] = await Promise.all([one, two]);
  assert.equal(a.id, b.id);
  assert.equal(b.reused, true);
  assert.equal(a.status, "accepted");
  assert.equal(a.readiness, "unverified");
  assert.equal(f.authority.snapshot().pending, 0);
  assert.equal((await f.manager.launch(f.file)).id, a.id);
  assert.equal(f.processes.length, 1);
  assert.equal(f.create().history().receipts[0].id, a.id);
});
test("another game is independent; the short deduplication window expires for an explicit new request", async (t) => {
  const f = fixture(t),
    other = join(f.root, "Other.exe");
  writeFileSync(other, "fixture");
  const a = f.manager.launch(f.file),
    b = f.manager.launch(other);
  assert.equal(f.processes.length, 2);
  f.processes.forEach((p) => p.child.emit("spawn"));
  await Promise.all([a, b]);
  f.advance();
  const again = f.manager.launch(f.file);
  assert.equal(f.processes.length, 3);
  f.processes[2].child.emit("spawn");
  assert.equal((await again).reused, false);
});
test("missing, revoked, directory and unsupported shortcuts fail before native dispatch", async (t) => {
  const f = fixture(t);
  for (const value of [join(f.root, "missing.lnk"), f.root, "../evil.exe", f.file + "\n"])
    await assert.rejects(f.manager.launch(value));
  unlinkSync(f.file);
  await assert.rejects(f.manager.launch(f.file), /missing/);
  writeFileSync(f.file, "again");
  const row = f.authority.snapshot().roots[0];
  f.authority.change(row.id, row.revision, false);
  await assert.rejects(f.manager.launch(f.file), /approved/);
  assert.equal(f.processes.length, 0);
});
test("asynchronous launch failure is a reusable failure receipt and permits an appropriate retry", async (t) => {
  const f = fixture(t),
    start = f.manager.launch(f.file);
  f.processes[0].child.emit("error", new Error("sensitive native error"));
  const failed = await start;
  assert.equal(failed.status, "failed");
  assert.equal(failed.retryable, true);
  assert(!JSON.stringify(failed).includes("sensitive"));
  const again = f.manager.launch(f.file);
  assert.equal(f.processes.length, 2);
  f.processes[1].child.emit("spawn");
  await again;
  f.processes[1].child.emit("close", 1);
  assert.equal(f.manager.history().receipts[0].status, "failed");
});
test("pending revocation cancels dispatch observation and never promotes a late spawn to acceptance", async (t) => {
  const f = fixture(t),
    start = f.manager.launch(f.file),
    row = f.authority.snapshot().roots[0];
  f.authority.change(row.id, row.revision, false);
  assert.equal((await start).status, "failed");
  f.processes[0].child.emit("spawn");
  assert.equal(f.manager.history().receipts[0].status, "failed");
  assert(f.processes[0].child.killed);
});
test("restart keeps pending work interrupted without launching; malformed receipt storage fails closed", async (t) => {
  const f = fixture(t),
    start = f.manager.launch(f.file);
  const restored = f.create();
  assert.equal(restored.history().receipts[0].status, "interrupted");
  assert.equal(f.processes.length, 1);
  f.manager.shutdown();
  assert.equal((await start).status, "interrupted");
  writeFileSync(join(f.base, "launches.json"), JSON.stringify({ version: 999, receipts: [] }));
  await assert.rejects(f.create().launch(f.file), /cannot be saved/);
  assert.equal(JSON.parse(readFileSync(join(f.base, "launches.json"))).version, 999);
  assert.equal(f.processes.length, 1);
});
test("unsupported OS never invokes a Windows command and receipts remain bounded", async (t) => {
  const unsupported = fixture(t, { platform: "linux" });
  await assert.rejects(unsupported.manager.launch(unsupported.file), /Windows only/);
  assert.equal(unsupported.processes.length, 0);
  const f = fixture(t);
  const initial = f.manager.launch(f.file);
  f.processes[0].child.emit("error", new Error("fixture"));
  const row = await initial;
  writeFileSync(
    join(f.base, "launches.json"),
    JSON.stringify({
      version: 1,
      receipts: Array.from({ length: 55 }, (_, n) => ({
        ...row,
        id: String(n).padStart(8, "0") + "-0000-0000-0000-000000000000",
      })),
    }),
  );
  const restored = f.create();
  assert.equal(restored.history().receipts.length, 50);
  const started = restored.launch(f.file);
  f.processes[1].child.emit("error", new Error("fixture"));
  await started;
  assert.equal(restored.history().receipts.length, 50);
  assert.equal(JSON.parse(readFileSync(join(f.base, "launches.json"))).receipts.length, 50);
});

test('unobserved launch times out as interrupted and late native events cannot promote it',async t=>{const f=fixture(t,{timeoutMs:5}),start=f.manager.launch(f.file);await new Promise(yes=>setTimeout(yes,20));assert.equal((await start).status,'interrupted');assert(f.processes[0].child.killed);f.processes[0].child.emit('spawn');f.processes[0].child.emit('close',0);assert.equal(f.manager.history().receipts[0].status,'interrupted');});
