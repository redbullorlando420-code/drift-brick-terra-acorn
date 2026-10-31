import { request as httpRequest } from "node:http";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import {
  mkdtempSync,
  readdirSync,
  copyFileSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  realpathSync,
  rmSync,
  existsSync,
  renameSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import { resolve, join, sep } from "node:path";
const parent = realpathSync(resolve(".grok")),
  root = mkdtempSync(join(parent, "companion-http-")),
  program = join(root, "program"),
  approved = join(root, "approved"),
  other = join(root, "other");
mkdirSync(program);
mkdirSync(approved);
mkdirSync(other);
const configured = join(root, "approved-link");
symlinkSync(approved, configured, "junction");
for (const file of readdirSync("companion"))
  if (file.endsWith(".mjs")) copyFileSync(join("companion", file), join(program, file));
writeFileSync(
  join(program, "test-entry.mjs"),
  "let release;const held=new Promise(r=>release=r);process.on('message',m=>{if(m==='release')release();});globalThis.fetch=async(url,init)=>{if(url!=='https://fixture.invalid/image')throw Error('Unexpected fixture network');process.send('held');await held;return new Response(new Uint8Array(64).fill(1),{headers:{'content-type':'image/png'}});};await import('./reelcase-companion.mjs');",
);
const port = await new Promise((yes, no) => {
  const server = createServer();
  server.once("error", no);
  server.listen(0, "127.0.0.1", () => {
    const p = server.address().port;
    server.close(() => yes(p));
  });
});
let child,
  output = "",
  held;
try {
  child = spawn(process.execPath, [join(program, "test-entry.mjs")], {
    cwd: program,
    windowsHide: true,
    env: {
      ...process.env,
      PATH: "",
      USERPROFILE: join(root, "no-desktop"),
      OneDrive: "",
      OneDriveConsumer: "",
      REELCASE_ALLOWED_ROOTS: configured + ";" + other,
      REELCASE_DOWNLOAD_DIR: join(approved, "downloads"),
      REELCASE_THUMB_CACHE_DIR: join(approved, "artwork"),
      REELCASE_COMPANION_PORT: String(port),
      REELCASE_APP_ORIGIN: "http://127.0.0.1:8080",
      YT_DLP_PATH: "",
      YOUTUBE_DL_PATH: "",
    },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  held = new Promise((yes) =>
    child.on("message", (m) => {
      if (m === "held") yes();
    }),
  );
  await new Promise((yes, no) => {
    const timer = setTimeout(() => no(Error("Isolated startup timeout: " + output)), 20000);
    const listen = (data) => {
      output = (output + data).slice(-4000);
      if (output.includes("Companion listening")) {
        clearTimeout(timer);
        yes();
      }
    };
    child.stdout.on("data", listen);
    child.stderr.on("data", listen);
    child.once("exit", (code) => {
      clearTimeout(timer);
      no(Error("Isolated service exited " + code + ": " + output));
    });
  });
  const request = (path, body, origin = "http://127.0.0.1:8080") =>
    fetch("http://127.0.0.1:" + port + path, {
      method: body ? "POST" : "GET",
      headers: { origin, ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(8000),
    });
  const status = await (await request("/roots/status")).json();
  assert(status.ok);
  assert.equal(status.active, 2);
  const own = status.roots.find((r) => r.path === configured);
  assert(own);
  assert.equal(
    (
      await request(
        "/roots/change",
        { id: own.id, revision: own.revision, enabled: false },
        "https://untrusted.invalid",
      )
    ).status,
    403,
  );
  const waiting = request("/thumbs/cache-url", {
    id: "yt:fixture",
    url: "https://fixture.invalid/image",
  });
  await held;
  const revoked = await (
    await request("/roots/change", { id: own.id, revision: own.revision, enabled: false })
  ).json();
  assert.equal(revoked.active, 1);
  child.send("release");
  const result = await (await waiting).json();
  assert.equal(result.ok, false);
  assert.equal(
    readdirSync(join(approved, "artwork")).length,
    0,
    "no delayed artwork written after root revoke",
  );
  assert.equal(
    (await request("/roots/change", { id: own.id, revision: own.revision, enabled: true })).status,
    400,
    "stale generation cannot restore access",
  );
  const now = revoked.roots.find((r) => r.id === own.id);
  const restored = await (
    await request("/roots/change", { id: now.id, revision: now.revision, enabled: true })
  ).json();
  assert.equal(restored.active, 2);
  const outside = join(root, "outside");
  mkdirSync(outside);
  writeFileSync(join(outside, "secret.json"), "preserve");
  const pack = join(approved, "pack");
  mkdirSync(pack);
  symlinkSync(outside, join(pack, "escape"), "junction");
  const denied = await request("/prints/save", {
    name: "test.stl",
    dir: join(pack, "escape"),
    dataBase64: Buffer.from("solid test\nendsolid test").toString("base64"),
  });
  assert.equal((await denied.json()).ok, false);
  assert.equal(readFileSync(join(outside, "secret.json"), "utf8"), "preserve");
  assert(!existsSync(join(outside, "test.stl")));
  const body = JSON.stringify({
    name: "stale.stl",
    dir: approved,
    dataBase64: Buffer.from("solid fixture\nendsolid fixture").toString("base64"),
  });
  let nativeRequest, ready;
  const headersReady = new Promise((yes) => (ready = yes));
  const lateResult = new Promise((yes, no) => {
    nativeRequest = httpRequest(
      {
        host: "127.0.0.1",
        port,
        path: "/prints/save",
        method: "POST",
        headers: {
          origin: "http://127.0.0.1:8080",
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
          expect: "100-continue",
        },
      },
      (response) => {
        let value = "";
        response.on("data", (part) => (value += part));
        response.on("end", () => yes({ status: response.statusCode, data: JSON.parse(value) }));
      },
    );
    nativeRequest.on("error", no);
    nativeRequest.on("continue", () => {
      nativeRequest.write(body.slice(0, 5));
      ready();
    });
    nativeRequest.flushHeaders();
  });
  await headersReady;
  let current = (await (await request("/roots/status")).json()).roots.find((r) => r.id === own.id);
  const again = await (
    await request("/roots/change", { id: current.id, revision: current.revision, enabled: false })
  ).json();
  current = again.roots.find((r) => r.id === own.id);
  await request("/roots/change", { id: current.id, revision: current.revision, enabled: true });
  nativeRequest.end(body.slice(5));
  const late = await lateResult;
  assert.equal(late.status, 403);
  assert.equal(late.data.ok, false);
  assert(!existsSync(join(approved, "stale.stl")));
  const fresh = await (
    await request("/prints/save", {
      name: "fresh.stl",
      dir: approved,
      dataBase64: Buffer.from("solid fresh\nendsolid fresh").toString("base64"),
    })
  ).json();
  assert.equal(fresh.ok, true);
  assert(existsSync(join(approved, "fresh.stl")));
  unlinkSync(configured);
  symlinkSync(other, configured, "junction");
  const changed = await (await request("/roots/status")).json();
  assert.equal(changed.roots.find((r) => r.id === own.id).state, "identity-changed");
  assert.equal(changed.active, 1);
  const final = await (await request("/health")).json();
  assert.equal(final.version, 19);
  assert(final.capabilities.includes("root-access"));
  assert.equal(final.roots, 1);
  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          "origin-gated folder controls list configured folders without scanning",
          "held real HTTP artwork write blocked after root revocation",
          "stale access generation rejected; explicit pinned reapproval works",
          "junction target outside roots cannot receive a print write",
          "replaced root loses approval and health reports the current root count",
          "held request body from an obsolete approval generation is denied after reapproval; a fresh approved save succeeds",
        ],
        scope:
          "Copied disposable Companion and workspace-only approved roots. Downloader/metadata native processes are simulated in unit tests; no real user service, provider session or files were used.",
      },
      null,
      2,
    ),
  );
} finally {
  if (child && child.exitCode === null) {
    const exited = new Promise((res) => child.once("exit", res));
    child.kill();
    await Promise.race([exited, new Promise((res) => setTimeout(res, 8000))]);
    if (child.exitCode === null) {
      child.kill("SIGKILL");
      await exited;
    }
  }
  assert(realpathSync(root).startsWith(parent + sep + "companion-http-"));
  rmSync(root, { recursive: true, force: true });
}
