import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
  realpathSync,
  existsSync,
} from "node:fs";
import { join, resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { createCapabilityConsent } from "../companion/capability-consent.mjs";
import { createBrowserConsent, BROWSER_PERMISSION_KEY } from "../src/lib/capability-consent.ts";
import { emptySetup, parseSetup, setupReadiness } from "../src/lib/setup-readiness.ts";
import { createStudioModels } from "../companion/studio-models.mjs";
import { createDownloadManager } from "../companion/download-manager.mjs";
function fixture(t) {
  const parent = realpathSync(resolve(".grok")),
    base = mkdtempSync(join(parent, "consent-fixture-"));
  t.after(() => {
    assert(realpathSync(base).startsWith(parent + sep + "consent-fixture-"));
    rmSync(base, { recursive: true, force: true });
  });
  return base;
}
function memory() {
  const values = new Map();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}
const grant = (p, id, allowed = true) => p.change(id, p.snapshot().revision, allowed);
test("native permission grants persist; stale request generations and revoked leases never revive after regrant", (t) => {
  const base = fixture(t),
    file = join(base, "permissions.json"),
    p = createCapabilityConsent({ file });
  assert.throws(() => p.acquire("model-transfers"), /Permission required/);
  assert(!existsSync(file));
  grant(p, "model-transfers");
  const lease = p.acquire("model-transfers"),
    revision = p.snapshot().revision;
  grant(p, "provider-session");
  lease.assert();
  grant(p, "model-transfers", false);
  assert(lease.signal.aborted);
  grant(p, "model-transfers");
  assert.throws(lease.assert, /changed/);
  assert.throws(() => p.assertRevision(revision), /changed/);
  assert.throws(() => p.change("provider-session", 0, true), /Refresh/);
  const restored = createCapabilityConsent({ file });
  assert(restored.snapshot().scopes["model-transfers"].allowed);
  grant(restored, "provider-session", false);
  assert(!createCapabilityConsent({ file }).snapshot().scopes["provider-session"].allowed);
  p.close();
  restored.close();
});
test("corrupt/future native policy and failed saves grant nothing, preserve unrelated content, and bound leases", (t) => {
  const base = fixture(t),
    file = join(base, "permissions.json");
  writeFileSync(file, '{"version":99}');
  const p = createCapabilityConsent({ file });
  assert(p.snapshot().error);
  assert.throws(() => grant(p, "model-transfers"), /could not be read/);
  assert.throws(()=>grant(p,"model-transfers",false),/could not be read/);
  assert.equal(readFileSync(file, "utf8"), '{"version":99}');
  const q = createCapabilityConsent({
    save: () => {
      throw Error("disk");
    },
  });
  assert.throws(() => grant(q, "model-transfers"), /could not be saved/);
  assert.throws(() => q.acquire("model-transfers"), /required/);
  let fail = false;
  const failedRevoke = createCapabilityConsent({
    save: () => {
      if (fail) throw Error("disk");
    },
  });
  grant(failedRevoke, "model-transfers");
  const held = failedRevoke.acquire("model-transfers");
  fail = true;
  assert.throws(() => grant(failedRevoke, "model-transfers", false), /could not be saved/);
  assert(held.signal.aborted);
  assert.throws(() => grant(failedRevoke, "model-transfers"), /pending revocation/);
  assert.deepEqual(failedRevoke.snapshot().pendingRevocations, ["model-transfers"]);
  fail = false;
  grant(failedRevoke, "model-transfers", false);
  assert.deepEqual(failedRevoke.snapshot().pendingRevocations, []);
  const r = createCapabilityConsent({ save: () => {} });
  grant(r, "model-transfers");
  const leases = Array.from({ length: 128 }, () => r.acquire("model-transfers"));
  assert.throws(() => r.acquire("model-transfers"), /Too many/);
  leases[0].release();
  r.acquire("model-transfers");
  r.close();
});
test("browser permissions default off, persist only choices, discard stale results across tabs, and isolate scopes", () => {
  const storage = memory(),
    a = createBrowserConsent(storage),
    b = createBrowserConsent(storage);
  assert.throws(() => a.acquire("local-vision"));
  a.change("local-vision", true);
  const work = a.acquire("local-vision");
  b.load();
  b.change("draft-composer", true);
  work.assert();
  b.change("local-vision", false);
  b.change("local-vision", true);
  assert.throws(work.assert, /changed/);
  assert(work.signal.aborted);
  assert(createBrowserConsent(storage).load().scopes["draft-composer"].allowed);
  const payload = storage.values.get(BROWSER_PERMISSION_KEY);
  assert(payload.length < 512);
  assert(!/url|path|cookie|title|token|image/i.test(payload));
  storage.values.set("personal", "Keep my notes");
  storage.setItem = () => {
    throw Error("quota");
  };
  assert.throws(() => a.change("draft-composer", false), /could not be saved/);
  assert.equal(storage.values.get("personal"), "Keep my notes");
  assert.throws(() => a.acquire("local-vision"), /Allow/);
});
test("browser future, corrupt and oversized permission data never grants access", () => {
  for (const value of ['{"version":99}', "bad", "x".repeat(8193)]) {
    const storage = memory();
    storage.values.set(BROWSER_PERMISSION_KEY, value);
    const p = createBrowserConsent(storage);
    assert(p.load().error);
    assert.throws(() => p.acquire("draft-composer"));
    assert.throws(()=>p.change("draft-composer",true),/unreadable/);
    assert.equal(storage.values.get(BROWSER_PERMISSION_KEY), value);
  }
});
test("setup readiness is derived from real counts, keeps unknown integrations unverified and persists reviewed choices without actions", () => {
  assert.deepEqual(parseSetup("bad"), emptySetup());
  assert.deepEqual(
    parseSetup(JSON.stringify({ version: 2, dismissed: true, reviewed: ["library"] })),
    emptySetup(),
  );
  const choices = parseSetup(
    JSON.stringify({
      version: 1,
      dismissed: true,
      reviewed: ["library", "library", "fake", "permissions"],
    }),
  );
  assert.deepEqual(choices.reviewed, ["library", "permissions"]);
  assert(choices.dismissed);
  const empty = setupReadiness({
    hydrated: true,
    videos: 0,
    sources: 0,
    permissionReviewed: false,
    companion: null,
  });
  assert(empty.every((row) => !row.ready));
  assert.equal(empty[3].status, "Not checked on this device");
  const saved = setupReadiness({
    hydrated: true,
    videos: 100000,
    sources: 591,
    permissionReviewed: true,
    companion: { compatible: true, roots: 2 },
  });
  assert(saved.every((row) => row.ready));
  assert.match(saved[3].status, /approved folders/);
  const unconfigured = setupReadiness({
    hydrated: true,
    videos: 4,
    sources: 2,
    permissionReviewed: true,
    companion: { compatible: false, roots: 2 },
  });
  assert(!unconfigured[3].ready);
  assert(
    !setupReadiness({
      hydrated: false,
      videos: 2,
      sources: 2,
      permissionReviewed: false,
      companion: null,
    })[0].ready,
  );
});
const weights = () => {
  const header = Buffer.from(
      JSON.stringify({
        "model.diffusion_model.input_blocks.0.weight": {
          dtype: "F32",
          shape: [1],
          data_offsets: [0, 4],
        },
      }),
    ),
    prefix = Buffer.alloc(8);
  prefix.writeBigUInt64LE(BigInt(header.length));
  return Buffer.concat([prefix, header, Buffer.alloc(4)]);
};
async function settled(models) {
  for (let i = 0; i < 100; i++) {
    const state = await models.list();
    if (state.job?.state !== "running") return state;
    await new Promise((r) => setTimeout(r, 5));
  }
  throw Error("Transfer not settled");
}
test("revocation while model metadata is held prevents any transfer, including after immediate regrant", async (t) => {
  const dir = fixture(t),
    permissions = createCapabilityConsent({ save: () => {} });
  grant(permissions, "model-transfers");
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  const models = createStudioModels({
    dir,
    permissions,
    fetchRemote: async () => {
      await gate;
      return Response.json({ sha: "a".repeat(40), siblings: [] });
    },
  });
  const install = models.action("/studio/models/install", "POST", {
    url: "https://huggingface.co/test/model",
    file: "model.safetensors",
  });
  grant(permissions, "model-transfers", false);
  grant(permissions, "model-transfers");
  release();
  await assert.rejects(install);
  assert.equal((await models.list()).job, null);
  assert(!existsSync(join(dir, "tools")));
  permissions.close();
});
test("revocation during bounded model range fetch prevents publishing and preserves existing models", async (t) => {
  const dir = fixture(t),
    permissions = createCapabilityConsent({ save: () => {} });
  grant(permissions, "model-transfers");
  const bytes = weights(),
    sha = createHash("sha256").update(bytes).digest("hex");
  let release,
    held = false;
  const gate = new Promise((resolve) => (release = resolve));
  const models = createStudioModels({
    dir,
    permissions,
    fetchRemote: async (url, options) => {
      if (url.includes("/api/"))
        return Response.json({
          sha: "a".repeat(40),
          siblings: [{ rfilename: "new.safetensors", size: bytes.length, lfs: { sha256: sha } }],
        });
      const [start, end] = options.headers.Range.slice(6).split("-").map(Number);
      if (start === 0 && end === bytes.length - 1) {
        held = true;
        await gate;
      }
      return new Response(bytes.subarray(start, end + 1), {
        status: 206,
        headers: { "content-range": "bytes " + start + "-" + end + "/" + bytes.length },
      });
    },
  });
  const folder = join(dir, "tools/stable-diffusion-webui/models/Stable-diffusion");
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, "original.safetensors"), "personal");
  await models.action("/studio/models/install", "POST", {
    url: "https://huggingface.co/test/model",
    file: "new.safetensors",
  });
  for (let i = 0; !held && i < 100; i++) await new Promise((r) => setTimeout(r, 5));
  assert(held);
  grant(permissions, "model-transfers", false);
  release();
  assert.equal((await settled(models)).job.state, "cancelled");
  assert(!existsSync(join(folder, "new.safetensors")));
  assert.equal(readFileSync(join(folder, "original.safetensors"), "utf8"), "personal");
  permissions.close();
  models.shutdown();
});
test("revoking browser-session permission stops queued and running credential jobs but ordinary downloads remain usable", (t) => {
  const dir = fixture(t),
    permissions = createCapabilityConsent({ save: () => {} }),
    children = [];
  grant(permissions, "provider-session");
  const manager = createDownloadManager({
    root: dir,
    approveRoot: () => true,
    authorizeSession: () => permissions.acquire("provider-session"),
    space: () => ({ bavail: 10000000000n, bsize: 1n }),
    budget: { marginBytes: 1024, unknownBytes: 1024 },
    spawnProcess: () => {
      const child = new EventEmitter();
      child.stdout = new PassThrough();
      child.stderr = new PassThrough();
      child.kill = () => {
        child.killed = true;
      };
      children.push(child);
      return child;
    },
  });
  const first = manager.enqueue({
      key: "BaW_jenozKc",
      binary: "fixture",
      engine: "yt-dlp",
      browser: "chrome",
    }),
    second = manager.enqueue({
      key: "abcdefghijk",
      binary: "fixture",
      engine: "yt-dlp",
      browser: "firefox",
    });
  assert.equal(children.length, 1);
  grant(permissions, "provider-session", false);
  assert(children[0].killed);
  assert(
    manager
      .list()
      .filter((j) => [first.id, second.id].includes(j.id))
      .every((j) => j.status === "interrupted"),
  );
  assert.throws(
    () => manager.resume(second.id, { binary: "fixture", engine: "yt-dlp", browser: "chrome" }),
    /required/,
  );
  assert.equal(manager.list().find((j) => j.id === second.id).status, "interrupted");
  children[0].emit("close", 1);
  const normal = manager.enqueue({ key: "qwertyuiopa", binary: "fixture", engine: "yt-dlp" });
  assert.equal(normal.status, "running");
  assert.equal(children.length, 2);
  manager.shutdown();
  children[1].emit("close", 1);
  permissions.close();
});
