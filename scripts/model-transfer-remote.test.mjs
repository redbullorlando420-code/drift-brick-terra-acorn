import {modelTransferRecovery} from '../src/lib/model-transfer-recovery.ts';
import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
  realpathSync,
  rmSync,
  appendFileSync,
  renameSync,
  statSync,
} from "node:fs";
import { join, resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { createStudioModels } from "../companion/studio-models.mjs";
import { createCreativeTools } from "../companion/creative-tools.mjs";
import { createModelTransfers, modelRange } from "../companion/model-transfers.mjs";
const MiB = 1024 ** 2,
  body = { url: "https://huggingface.co/test/model", file: "fixture.safetensors" };
function fixture(t) {
  const parent = realpathSync(resolve(".grok")),
    dir = mkdtempSync(join(parent, "model-remote-fixture-"));
  t.after(() => {
    assert(realpathSync(dir).startsWith(parent + sep + "model-remote-fixture-"));
    rmSync(dir, { recursive: true, force: true });
  });
  return dir;
}
function weights(size = 17 * MiB) {
  const tensor = Buffer.alloc(size, 3),
    header = Buffer.from(
      JSON.stringify({
        "model.diffusion_model.input_blocks.0.weight": {
          dtype: "F32",
          shape: [size / 4],
          data_offsets: [0, size],
        },
      }),
    ),
    prefix = Buffer.alloc(8);
  prefix.writeBigUInt64LE(BigInt(header.length));
  return Buffer.concat([prefix, header, tensor]);
}
function remote(bytes) {
  let fail = true,
    etag = '"first"',
    revision = "a".repeat(40),
    checksum = createHash("sha256").update(bytes).digest("hex"),
    calls = [];
  const fetchRemote = async (url, options) => {
    if (url.includes("/api/"))
      return Response.json({
        sha: revision,
        siblings: [
          { rfilename: "fixture.safetensors", size: bytes.length, lfs: { sha256: checksum } },
        ],
      });
    const [start, end] = options.headers.Range.slice(6).split("-").map(Number);
    calls.push({ start, end, ifRange: options.headers["If-Range"] });
    if (fail && start === 4 * MiB) {
      fail = false;
      throw Error("Controlled connection loss");
    }
    return new Response(bytes.subarray(start, end + 1), {
      status: 206,
      headers: { "content-range": "bytes " + start + "-" + end + "/" + bytes.length, etag },
    });
  };
  return {
    fetchRemote,
    calls,
    setFail: (value) => (fail = value),
    setEtag: (value) => (etag = value),
    setRevision: (value) => (revision = value),
    setChecksum: (value) => (checksum = value),
  };
}
async function settled(m) {
  for (let i = 0; i < 500; i++) {
    const state = await m.list();
    if (state.job?.state !== "running") return state;
    await new Promise((r) => setTimeout(r, 5));
  }
  throw Error("Fixture did not settle");
}
async function interrupted(t) {
  const dir = fixture(t),
    bytes = weights(),
    server = remote(bytes),
    manager = createStudioModels({ dir, fetchRemote: server.fetchRemote });
  await manager.action("/studio/models/install", "POST", body);
  const state = await settled(manager),
    receipt = state.modelTransferRecovery.entries[0];
  assert.equal(receipt.state, "interrupted");
  assert.equal(receipt.received, 4 * MiB);
  const folder = join(dir, "tools/stable-diffusion-webui/models/Stable-diffusion"),
    part = join(folder, ".realhub-model-" + receipt.id + ".partial");
  return { dir, bytes, server, manager, receipt, folder, part };
}
test("large model resumes after restart from a verified checkpoint with bounded ranges and exact output", async (t) => {
  const f = await interrupted(t),
    before = f.server.calls.length;
  f.manager.shutdown();
  const restored = createStudioModels({ dir: f.dir, fetchRemote: f.server.fetchRemote });
  assert.equal((await restored.list()).job, null);
  assert.equal(f.server.calls.length, before, "restart performs no network work");
  const result = await restored.action(
    "/studio/models/transfers/" + f.receipt.id + "/review",
    "POST",
  );
  assert(result.review.canResume);
  assert.equal(statSync(f.part).size, 4 * MiB, "review does not truncate or append");
  const start = f.server.calls.length;
  await restored.action("/studio/models/transfers/" + f.receipt.id + "/resume", "POST", {});
  const state = await settled(restored);
  assert.equal(state.job.state, "done");
  assert.equal(state.modelTransferRecovery.entries[0].state, "done");
  assert.deepEqual(readFileSync(join(f.folder, "fixture.safetensors")), f.bytes);
  assert(!existsSync(f.part));
  assert.equal(
    f.server.calls
      .slice(start)
      .filter((c) => c.start >= 4 * MiB)
      .reduce((n, c) => n + c.end - c.start + 1, 0),
    f.bytes.length - 4 * MiB,
  );
  assert(f.server.calls.every((c) => c.end - c.start + 1 <= 4 * MiB));
  assert(f.server.calls.slice(start).every((c) => c.ifRange === '"first"'));
  restored.shutdown();
});
test("extra uncommitted suffix is read-only during review then removed only when explicit resume starts", async (t) => {
  const f = await interrupted(t);
  appendFileSync(f.part, Buffer.alloc(MiB, 9));
  assert(
    (await f.manager.action("/studio/models/transfers/" + f.receipt.id + "/review", "POST")).review
      .canResume,
  );
  assert.equal(statSync(f.part).size, 5 * MiB);
  await f.manager.action("/studio/models/transfers/" + f.receipt.id + "/resume", "POST");
  assert.equal((await settled(f.manager)).job.state, "done");
  assert.deepEqual(readFileSync(join(f.folder, "fixture.safetensors")), f.bytes);
});
test("ETag, pinned revision and local partial changes cannot be silently resumed", async (t) => {
  const f = await interrupted(t);
  f.server.setEtag('"changed"');
  let review = (
    await f.manager.action("/studio/models/transfers/" + f.receipt.id + "/review", "POST")
  ).review;
  assert(review.restartRequired && !review.canResume);
  assert.equal(statSync(f.part).size, 4 * MiB);
  await f.manager.action("/studio/models/transfers/" + f.receipt.id + "/resume", "POST");
  assert.equal((await settled(f.manager)).job.state, "error");
  assert(!existsSync(join(f.folder, "fixture.safetensors")));
  f.server.setEtag('"first"');
  f.server.setRevision("b".repeat(40));
  review = (await f.manager.action("/studio/models/transfers/" + f.receipt.id + "/review", "POST"))
    .review;
  assert(review.restartRequired && !review.canResume);
});
test("modified or replaced partials are never adopted or deleted by cancellation", async (t) => {
  const f = await interrupted(t),
    copy = Buffer.from(readFileSync(f.part));
  copy[100] ^= 1;
  writeFileSync(f.part, copy);
  let review = (
    await f.manager.action("/studio/models/transfers/" + f.receipt.id + "/review", "POST")
  ).review;
  assert(!review.canResume && /contents changed/.test(review.issue));
  const original = join(f.folder, "kept-owned.partial");
  renameSync(f.part, original);
  writeFileSync(f.part, Buffer.alloc(4 * MiB, 7));
  review = (await f.manager.action("/studio/models/transfers/" + f.receipt.id + "/review", "POST"))
    .review;
  assert(!review.canResume);
  await f.manager.action("/studio/models/transfers/" + f.receipt.id + "/cancel", "POST");
  assert(existsSync(f.part));
  assert(existsSync(original));
});
test("cancelling a verified saved partial removes only its owned temporary data", async (t) => {
  const f = await interrupted(t);
  writeFileSync(join(f.folder, "my-model.safetensors"), "keep");
  await f.manager.action("/studio/models/transfers/" + f.receipt.id + "/cancel", "POST");
  assert(!existsSync(f.part));
  assert.equal(readFileSync(join(f.folder, "my-model.safetensors"), "utf8"), "keep");
  assert.equal((await f.manager.list()).modelTransferRecovery.entries[0].state, "cancelled");
});
test("fresh-transfer preview binds current publisher metadata and never overwrites an active verified model", async (t) => {
  const f = await interrupted(t),
    path = "/studio/models/transfers/" + f.receipt.id;
  f.server.setRevision("b".repeat(40));
  const preview = await f.manager.action(path + "/fresh-review", "POST");
  f.server.setRevision("c".repeat(40));
  await assert.rejects(
    f.manager.action(path + "/fresh", "POST", {
      confirmation: "START FRESH",
      fingerprint: preview.fingerprint,
    }),
    /changed after review/,
  );
  assert(existsSync(f.part));
  const fresh = await f.manager.action(path + "/fresh-review", "POST");
  writeFileSync(join(f.folder, "fixture.safetensors"), "my existing model");
  await f.manager.action(path + "/fresh", "POST", {
    confirmation: "START FRESH",
    fingerprint: fresh.fingerprint,
  });
  assert.equal((await settled(f.manager)).job.state, "error");
  assert.equal(readFileSync(join(f.folder, "fixture.safetensors"), "utf8"), "my existing model");
  assert(existsSync(f.part));
});
test("checksum failure never enables a model and preserves installed files", async (t) => {
  const dir = fixture(t),
    server = remote(weights(MiB));
  server.setFail(false);
  server.setChecksum("b".repeat(64));
  const manager = createStudioModels({ dir, fetchRemote: server.fetchRemote });
  await manager.action("/studio/models/install", "POST", body);
  const state = await settled(manager);
  assert.equal(state.job.state, "error");
  assert.match(state.job.note, /checksum/);
  assert.equal(state.models.length, 0);
  assert.deepEqual(
    readdirSync(join(dir, "tools/stable-diffusion-webui/models/Stable-diffusion")),
    [],
  );
  assert(
    !(
      await manager.action(
        "/studio/models/transfers/" + state.modelTransferRecovery.entries[0].id + "/review",
        "POST",
      )
    ).review.canResume,
  );
});
test("future journals and failed journal writes cannot start unrecorded model work", async (t) => {
  const dir = fixture(t),
    journal = join(dir, ".local-model-transfers.json");
  writeFileSync(journal, '{"version":99,"rows":[]}');
  const manager = createStudioModels({ dir, fetchRemote: remote(weights(MiB)).fetchRemote });
  assert((await manager.list()).modelTransferRecovery.error);
  await assert.rejects(manager.action("/studio/models/install", "POST", body), /receipts/);
  assert.equal(readFileSync(journal, "utf8"), '{"version":99,"rows":[]}');
  const dir2 = fixture(t),
    transfers = createModelTransfers({
      dir: dir2,
      folder: () => join(dir2, "models"),
      fetchRemote: () => {},
      inspect: () => {},
      validate: () => {},
      saveJournal: () => {
        throw Error("quota");
      },
    });
  await assert.rejects(
    transfers.prepare(
      {
        name: "fixture.safetensors",
        file: "fixture.safetensors",
        role: "checkpoints",
        bytes: 100,
        sha256: "a".repeat(64),
      },
      { repo: "test/model", revision: "b".repeat(40) },
    ),
    /quota/,
  );
  assert(!existsSync(join(dir2, "models")));
});
test("range reads reject insecure or foreign redirects, changed/missing validators and oversized responses", async () => {
  const signal = new AbortController().signal;
  for (const location of ["http://huggingface.co/a", "https://untrusted.invalid/model"])
    await assert.rejects(
      modelRange(
        async () => new Response(null, { status: 302, headers: { location } }),
        "https://huggingface.co/test/model",
        0,
        7,
        10,
        signal,
      ),
      /approved HTTPS/,
    );
  await assert.rejects(
    modelRange(
      async () =>
        new Response(Buffer.alloc(8), {
          status: 206,
          headers: { "content-range": "bytes 0-7/10" },
        }),
      "https://huggingface.co/test/model",
      0,
      7,
      10,
      signal,
      '"expected"',
    ),
    /identity changed/,
  );
  await assert.rejects(
    modelRange(
      async () =>
        new Response(Buffer.alloc(9), {
          status: 206,
          headers: { "content-range": "bytes 0-7/10", "content-length": "9" },
        }),
      "https://huggingface.co/test/model",
      0,
      7,
      10,
      signal,
    ),
    /byte budget/,
  );
});
test("page-scoped remote approvals expire, resist foreign invalidation, reject unattended arguments and expose no secrets", async (t) => {
  const dir = fixture(t);
  mkdirSync(join(dir, "tools"));
  writeFileSync(
    join(dir, "tools", process.platform === "win32" ? "rustdesk.exe" : "rustdesk"),
    "not executable",
  );
  let time = 100000,
    calls = [];
  const children = [],
    handle = createCreativeTools({
      dir,
      now: () => time,
      spawnProcess: (exe, args, options) => {
        calls.push({ exe, args, options });
        const child = new EventEmitter();
        child.kill = () => {
          child.killed = true;
          return true;
        };
        children.push(child);
        return child;
      },
    });
  const peer = "123456789",
    origin = "http://127.0.0.1:8080",
    requester =
      "a".repeat(8) + "-" + ["b".repeat(4), "c".repeat(4), "d".repeat(4), "e".repeat(12)].join("-"),
    other = "0".repeat(36);
  let approval = await handle("/remote/arm", "POST", { peer, requester }, origin);
  await assert.rejects(
    handle("/remote/arm", "POST", { peer, requester: other }, origin),
    /Another page/,
  );
  await assert.rejects(
    handle(
      "/remote/connect",
      "POST",
      { peer, requester: other, token: approval.token, confirmation: "CONNECT " + peer },
      origin,
    ),
    /Approval/,
  );
  assert((await handle("/remote/status", "GET")).armed);
  time += 30001;
  await assert.rejects(
    handle(
      "/remote/connect",
      "POST",
      { peer, requester, token: approval.token, confirmation: "CONNECT " + peer },
      origin,
    ),
    /expired/,
  );
  assert.equal(calls.length, 0);
  approval = await handle("/remote/arm", "POST", { peer, requester }, origin);
  await assert.rejects(
    handle(
      "/remote/connect",
      "POST",
      {
        peer,
        requester,
        token: approval.token,
        confirmation: "CONNECT " + peer,
        password: "CANARY",
      },
      origin,
    ),
    /unsupported/,
  );
  await handle(
    "/remote/connect",
    "POST",
    { peer, requester, token: approval.token, confirmation: "CONNECT " + peer },
    origin,
  );
  assert.deepEqual(calls[0].args, ["--connect", peer, "--no-server"]);
  assert.equal(calls[0].options.shell, false);
  let status = await handle("/remote/status", "GET");
  assert.equal(status.launch.state, "launch-requested");
  assert.equal(status.sessionVerified, false);
  const text = JSON.stringify(status);
  assert(
    !text.includes(peer) &&
      !text.includes(approval.token) &&
      !text.includes(requester) &&
      !text.includes("CANARY"),
  );
  await handle("/remote/lock","POST",{requester:other},origin);assert(!children[0].killed);assert.equal((await handle("/remote/status","GET")).launch.state,"launch-requested");
  await handle("/remote/lock", "POST", {requester}, origin);
  status = await handle("/remote/status", "GET");
  assert(status.launcherRunning);
  assert.equal(status.launch.state, "stop-requested");
  await assert.rejects(
    handle("/remote/arm", "POST", { peer, requester }, origin),
    /already active/,
  );
  children[0].emit("exit", 0);
  status = await handle("/remote/status", "GET");
  assert(!status.launcherRunning);
  assert.equal(status.launch.state, "launcher-exited");
  assert.equal(status.launch.sessionVerified, false);
  await handle.shutdown();
});

test("publication interruption is recovered by verifying the existing destination without re-downloading weights", async (t) => {
  const dir = fixture(t),
    bytes = weights(MiB),
    server = remote(bytes);
  server.setFail(false);
  const folder = () => join(dir, "models"),
    entry = {
      file: "fixture.safetensors",
      name: "fixture.safetensors",
      role: "checkpoints",
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    },
    metadata = { repo: "test/model", revision: "a".repeat(40), files: [entry] },
    journal = join(dir, ".local-model-transfers.json");
  let fail = true;
  const transfers = createModelTransfers({
    dir,
    folder,
    fetchRemote: server.fetchRemote,
    inspect: async () => metadata,
    validate: async () => true,
    saveJournal: (value) => {
      if (fail && value.rows[0].state === "done") {
        fail = false;
        throw Error("Lost completion receipt");
      }
      writeFileSync(journal, JSON.stringify(value));
    },
  });
  const row = await transfers.prepare(entry, metadata);
  await transfers.transfer(row, { received: 0, total: bytes.length }, new AbortController().signal);
  assert(existsSync(join(dir, "models/fixture.safetensors")));
  assert.equal(JSON.parse(readFileSync(journal, "utf8")).rows[0].state, "publishing");
  const restored = createModelTransfers({
      dir,
      folder,
      fetchRemote: server.fetchRemote,
      inspect: async () => metadata,
      validate: async () => true,
    }),
    before = server.calls.length,
    recovered = await restored.resumeEntry(row.id);
  await restored.transfer(
    recovered,
    { received: 0, total: bytes.length },
    new AbortController().signal,
    { resume: true },
  );
  assert.equal(restored.list().entries[0].state, "done");
  assert.deepEqual(readFileSync(join(dir, "models/fixture.safetensors")), bytes);
  assert(!existsSync(join(dir, "models/.realhub-model-" + row.id + ".partial")));
  assert(server.calls.slice(before).every((call) => call.start === 0 && call.end === 7));
});
test("receipt admission is bounded and cancelled empty receipts can be replaced without scanning storage", async (t) => {
  const dir = fixture(t),
    transfers = createModelTransfers({
      dir,
      folder: () => join(dir, "models"),
      fetchRemote: () => {},
      inspect: () => {},
      validate: () => {},
    }),
    metadata = { repo: "test/model", revision: "a".repeat(40) },
    entry = {
      file: "fixture.safetensors",
      name: "fixture.safetensors",
      role: "checkpoints",
      bytes: 100,
      sha256: "b".repeat(64),
    };
  for (let index = 0; index < 8; index++)
    await transfers.prepare(
      {
        ...entry,
        name: "fixture" + index + ".safetensors",
        file: "fixture" + index + ".safetensors",
      },
      metadata,
    );
  await assert.rejects(
    transfers.prepare({ ...entry, name: "ninth.safetensors" }, metadata),
    /Eight/,
  );
  assert.equal(transfers.list().entries.length, 8);
  await transfers.cancel(transfers.list().entries[0].id);
  await transfers.prepare({ ...entry, name: "replacement.safetensors" }, metadata);
  assert.equal(transfers.list().entries.length, 8);
  assert(!existsSync(join(dir, "models")));
});

test("concurrent partial reviews share a single native verification budget", async (t) => {
  const f = await interrupted(t),
    path = "/studio/models/transfers/" + f.receipt.id + "/review";
  const first = f.manager.action(path, "POST");
  await assert.rejects(f.manager.action(path, "POST"), /Pause or finish/);
  assert((await first).review.canResume);
});


test('future and malformed native receipt lists remain unavailable without crashing the browser consumer',()=>{assert.equal(modelTransferRecovery({version:2,maxEntries:8,entries:[]}),undefined);assert.equal(modelTransferRecovery({version:1,maxEntries:8,entries:[{id:{toString:{}}}]}),undefined);assert.deepEqual(modelTransferRecovery({version:1,maxEntries:8,entries:[]}),{version:1,maxEntries:8,entries:[]});});


test('an existing provenance sidecar is preserved when a new verified model is installed',async t=>{const dir=fixture(t),server=remote(weights(MiB));server.setFail(false);const folder=join(dir,'tools/stable-diffusion-webui/models/Stable-diffusion');mkdirSync(folder,{recursive:true});writeFileSync(join(folder,'fixture.safetensors.source.json'),'Keep my source notes');const manager=createStudioModels({dir,fetchRemote:server.fetchRemote});await manager.action('/studio/models/install','POST',body);assert.equal((await settled(manager)).job.state,'done');assert.equal(readFileSync(join(folder,'fixture.safetensors.source.json'),'utf8'),'Keep my source notes');assert(existsSync(join(folder,'fixture.safetensors')));});
