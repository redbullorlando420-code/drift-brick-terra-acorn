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
} from "node:fs";
import { resolve, join, sep } from "node:path";
import { createHash } from "node:crypto";
import { glb } from "./fixtures/print-glb.mjs";
const parent = realpathSync(resolve(".grok")),
  base = mkdtempSync(join(parent, "print-platform-http-")),
  reports = [];
let child;
try {
  for (const os of ["win32", "linux", "darwin"]) {
    const program = join(base, os),
      approved = join(base, os + "-approved");
    mkdirSync(program);
    mkdirSync(approved);
    for (const file of readdirSync("companion"))
      if (file.endsWith(".mjs")) copyFileSync(join("companion", file), join(program, file));
    let source = readFileSync(join(program, "reelcase-companion.mjs"), "utf8");
    source = source
      .replace("platformContract(process.platform)", "platformContract(" + JSON.stringify(os) + ")")
      .replace('"job-badge"],process.platform)', '"job-badge"],' + JSON.stringify(os) + ")")
      .replace(
        "platformActionIssue(req.url||'',process.platform)",
        "platformActionIssue(req.url||''," + JSON.stringify(os) + ")",
      );
    writeFileSync(join(program, "reelcase-companion.mjs"), source);
    writeFileSync(
      join(program, "entry.mjs"),
      "import cp from 'node:child_process';import {syncBuiltinESMExports} from 'node:module';cp.execFileSync=()=>{throw Error('Executable discovery disabled in fixture');};cp.spawn=()=>{process.send('unexpected-native-spawn');throw Error('No native processes are allowed in this fixture');};syncBuiltinESMExports();globalThis.fetch=async()=>{throw Error('External network disabled in fixture');};await import('./reelcase-companion.mjs');",
    );
    const port = await new Promise((yes, no) => {
      const server = createServer();
      server.once("error", no);
      server.listen(0, "127.0.0.1", () => {
        const p = server.address().port;
        server.close(() => yes(p));
      });
    });
    let output = "",
      nativeSpawns = 0;
    const start = async () => {
      child = spawn(process.execPath, [join(program, "entry.mjs")], {
        cwd: program,
        windowsHide: true,
        env: {
          ...process.env,
          PATH: "",
          USERPROFILE: join(base, "no-desktop"),
          OneDrive: "",
          OneDriveConsumer: "",
          REELCASE_ALLOWED_ROOTS: approved,
          REELCASE_DOWNLOAD_DIR: approved,
          REELCASE_PRINTS_DIR: approved,
          REELCASE_COMPANION_PORT: String(port),
          REELCASE_APP_ORIGIN: "http://127.0.0.1:8080",
          YT_DLP_PATH: "",
          YOUTUBE_DL_PATH: "",
        },
        stdio: ["ignore", "pipe", "pipe", "ipc"],
      });
      child.on("message", (m) => {
        if (m === "unexpected-native-spawn") nativeSpawns++;
      });
      await new Promise((yes, no) => {
        const timer = setTimeout(() => no(Error("Service startup timed out: " + output)), 20000);
        const read = (data) => {
          output = (output + data).slice(-4000);
          if (output.includes("Companion listening")) {
            clearTimeout(timer);
            yes();
          }
        };
        child.stdout.on("data", read);
        child.stderr.on("data", read);
        child.once("exit", (code) => {
          clearTimeout(timer);
          no(Error("Service exited " + code + ": " + output));
        });
      });
    };
    const stop = async () => {
      if (child && child.exitCode === null) {
        const ended = new Promise((yes) => child.once("exit", yes));
        child.kill();
        await Promise.race([ended, new Promise((yes) => setTimeout(yes, 8000))]);
        if (child.exitCode === null) {
          child.kill("SIGKILL");
          await ended;
        }
      }
    };
    await start();
    const request = (path, body, origin = "http://127.0.0.1:8080", binary = false) =>
        fetch("http://127.0.0.1:" + port + path, {
          method: body ? "POST" : "GET",
          headers: {
            origin,
            ...(body ? { "content-type": binary ? "model/gltf-binary" : "application/json" } : {}),
          },
          body: body ? (binary ? body : JSON.stringify(body)) : undefined,
          signal: AbortSignal.timeout(8000),
        }),
      data = async (path, body) => await (await request(path, body)).json();
    const health = await data("/health");
    assert.equal(health.version, 19);
    assert.equal(health.platform.os, os);
    assert(health.capabilities.includes("print-save-transaction"));
    assert.equal(health.capabilities.includes("launch"), os === "win32");
    assert.equal(
      (await request("/prints/save-folders", undefined, "https://untrusted.invalid")).status,
      403,
    );
    assert((await data("/prints/save-folders")).folders.includes(approved));
    if (os !== "win32")
      for (const path of [
        "/launch",
        "/shortcuts",
        "/shortcut-icons",
        "/games/steam-epic",
        "/tray/autostart",
        "/tray/notify",
        "/studio/start",
        "/studio/qwen/start",
      ]) {
        const result = await request(path, {});
        assert.equal(result.status, 501, path);
        assert.equal((await result.json()).code, "UNSUPPORTED_PLATFORM");
      }
    const bytes = glb(),
      input = {
        name: "edited-copy.glb",
        bytes: bytes.length,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        dir: approved,
      };
    writeFileSync(join(approved, "original.glb"), bytes);
    const review = await data("/prints/transactions/review", input);
    assert(review.ok);
    assert(!existsSync(review.receipt.path));
    const saved = await (
      await request(
        "/prints/transactions/" + review.receipt.id + "/commit",
        bytes,
        "http://127.0.0.1:8080",
        true,
      )
    ).json();
    assert(saved.ok);
    assert.equal(saved.receipt.status, "done");
    assert.deepEqual(readFileSync(saved.receipt.path), bytes);
    assert.deepEqual(readFileSync(join(approved, "original.glb")), bytes);
    assert.equal(
      (await data("/prints/transactions/review", input)).ok,
      false,
      "existing destination is refused",
    );
    assert.equal(
      (
        await data("/prints/save", {
          name: "original.glb",
          dataBase64: Buffer.from("not original").toString("base64"),
          dir: approved,
        })
      ).ok,
      false,
    );
    assert.deepEqual(readFileSync(join(approved, "original.glb")), bytes);
    const pending = await data("/prints/transactions/review", {
      ...input,
      name: "not-yet-saved.glb",
    });
    assert(pending.ok);
    await stop();
    output = "";
    await start();
    const restored = await data("/prints/transactions/" + review.receipt.id);
    assert.equal(restored.receipt.status, "done");
    assert.equal(
      (await data("/prints/transactions/" + pending.receipt.id)).receipt.status,
      "interrupted",
    );
    assert(!existsSync(pending.receipt.path));
    await data("/prints/transactions/" + pending.receipt.id + "/cancel", {});
    assert.equal(nativeSpawns, 0);
    reports.push({
      os,
      ok: true,
      checks: [
        "origin gating",
        "platform capability filtering and guarded routes",
        "review creates no model",
        "streamed checksum-verified exclusive GLB commit",
        "legacy and edited paths preserve originals",
        "restart verifies completed copy and never replays pending save",
        "no native process spawned",
      ],
    });
    await stop();
    child = undefined;
  }
} finally {
  if (child && child.exitCode === null) {
    child.kill();
    await new Promise((yes) => child.once("exit", yes));
  }
  assert(realpathSync(base).startsWith(parent + sep + "print-platform-http-"));
  rmSync(base, { recursive: true, force: true });
}
console.log(
  JSON.stringify(
    {
      ok: true,
      reports,
      limitations:
        "Actual HTTP and filesystem checks ran on Windows using isolated copied services. Linux/macOS platform contracts and dispatch were simulated; their native filesystems, desktop apps and service managers were not tested. No real game, model engine, download or user service was started.",
    },
    null,
    2,
  ),
);
