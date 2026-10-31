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
const parent = realpathSync(resolve(".grok")),
  base = mkdtempSync(join(parent, "download-launch-http-")),
  program = join(base, "program"),
  approved = join(base, "approved"),
  downloads = join(approved, "downloads");
mkdirSync(program);
mkdirSync(downloads, { recursive: true });
for (const file of readdirSync("companion"))
  if (file.endsWith(".mjs")) copyFileSync(join("companion", file), join(program, file));
writeFileSync(
  join(program, "entry.mjs"),
  "import cp from 'node:child_process';import fs from 'node:fs';import {syncBuiltinESMExports} from 'node:module';import {EventEmitter} from 'node:events';import {PassThrough} from 'node:stream';\nlet free=8n*1024n**3n;const children=[];\ncp.execFileSync=(file,args)=>{if(file===process.env.YT_DLP_PATH&&args.includes('--version'))return '2026.10.01';throw Error('Fixture forbids executable discovery');};\ncp.spawn=(binary,args,options)=>{const child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();child.unref=()=>{};child.kill=()=>{setImmediate(()=>child.emit('close',null));return true;};const index=children.push({child,binary,args,options})-1;process.send({type:'spawn',index,binary,args,cwd:options.cwd});if(binary.toLowerCase().endsWith('explorer.exe'))setImmediate(()=>{child.emit('spawn');child.emit('close',0);});return child;};\nfs.statfsSync=()=>({bavail:free,bsize:1n});syncBuiltinESMExports();process.on('message',m=>{if(m.kind==='space'){free=BigInt(m.bytes);process.send({type:'ack',id:m.id});}});await import('./reelcase-companion.mjs');",
);
const binary = join(program, "fixture-tool.exe");
writeFileSync(
  binary,
  "Not an executable; version and spawn are intercepted in this disposable process.",
);
const game = join(approved, "Game & literal %.lnk"),
  other = join(approved, "Other.exe");
writeFileSync(game, "fixture");
writeFileSync(other, "fixture");
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
  sequence = 0;
const spawned = [];
try {
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
      REELCASE_DOWNLOAD_DIR: downloads,
      REELCASE_DOWNLOAD_MARGIN_MIB: "64",
      REELCASE_DOWNLOAD_ESTIMATE_MIB: "128",
      REELCASE_COMPANION_PORT: String(port),
      REELCASE_APP_ORIGIN: "http://127.0.0.1:8080",
      YT_DLP_PATH: binary,
      YOUTUBE_DL_PATH: "",
    },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  child.on("message", (m) => {
    if (m.type === "spawn") spawned.push(m);
  });
  await new Promise((yes, no) => {
    const timer = setTimeout(() => no(Error("Startup timed out: " + output)), 20000);
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
  const request = (path, body, origin = "http://127.0.0.1:8080") =>
    fetch("http://127.0.0.1:" + port + path, {
      method: body ? "POST" : "GET",
      headers: { origin, ...(body ? { "content-type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(8000),
    });
  const data = async (path, body) => (await request(path, body)).json();
  const space = (bytes) =>
    new Promise((yes, no) => {
      const id = ++sequence,
        timer = setTimeout(() => no(Error("IPC timeout")), 5000),
        listen = (m) => {
          if (m.type === "ack" && m.id === id) {
            clearTimeout(timer);
            child.off("message", listen);
            yes();
          }
        };
      child.on("message", listen);
      child.send({ kind: "space", bytes: String(bytes), id });
    });
  const health = await data("/health");
  assert.equal(health.version, 19);
  assert(health.capabilities.includes("download-preflight"));
  assert(health.capabilities.includes("launch-receipts"));
  assert.equal((await data("/launch-receipts")).receipts.length, 0);
  assert.equal((await request("/launch", { path: game }, "https://untrusted.invalid")).status, 403);
  assert.equal(spawned.length, 0);
  const [a, b] = await Promise.all([
    data("/launch", { path: game }),
    data("/launch", { path: game }),
  ]);
  assert(a.ok && b.ok);
  assert.equal(a.receipt.id, b.receipt.id);
  assert.equal(spawned.filter((p) => p.binary.toLowerCase().endsWith("explorer.exe")).length, 1);
  assert.deepEqual(spawned[0].args, [game]);
  assert.equal(a.receipt.readiness, "unverified");
  await data("/launch", { path: other });
  assert.equal(spawned.filter((p) => p.binary.toLowerCase().endsWith("explorer.exe")).length, 2);
  assert.equal((await data("/launch-receipts")).receipts.length, 2);
  const roots = await data("/roots/status"),
    own = roots.roots[0];
  await data("/roots/change", { id: own.id, revision: own.revision, enabled: false });
  assert.equal((await data("/launch", { path: game })).ok, false);
  const revoked = (await data("/roots/status")).roots[0];
  await data("/roots/change", { id: revoked.id, revision: revoked.revision, enabled: true });
  await space(1);
  const input = { videoId: "BaW_jenozKc", title: "HTTP disk fixture" };
  let result = await data("/youtube/downloads", input),
    job = result.job;
  assert.equal(job.status, "paused");
  assert.equal(job.preflight.state, "low-space");
  assert(!existsSync(join(downloads, job.id)));
  assert.equal(spawned.filter((p) => p.binary === binary).length, 0);
  assert.equal((await data("/youtube/downloads")).downloadBudget.marginBytes, 64 * 1024 ** 2);
  await space(8 * 1024 ** 3);
  result = await data("/youtube/downloads/" + job.id + "/resume", input);
  job = result.job;
  assert.equal(job.status, "running");
  assert(realpathSync(job.path).startsWith(realpathSync(downloads) + sep));
  const partial = join(job.path, "video.mp4.part");
  writeFileSync(partial, "HTTP verified partial");
  await data("/youtube/downloads/" + job.id + "/cancel", {});
  await new Promise((yes) => setTimeout(yes, 40));
  await space(1);
  assert.equal(
    (await data("/youtube/downloads/" + job.id + "/resume", input)).job.status,
    "paused",
  );
  assert.equal(readFileSync(partial, "utf8"), "HTTP verified partial");
  await space(8 * 1024 ** 3);
  assert.equal(
    (await data("/youtube/downloads/" + job.id + "/resume", input)).job.status,
    "running",
  );
  assert.equal(spawned.filter((p) => p.binary === binary).length, 2);
  assert(spawned.at(-1).args.includes("--no-overwrites"));
  await data("/youtube/downloads/" + job.id + "/cancel", {});
  await new Promise((yes) => setTimeout(yes, 40));
  writeFileSync(partial, "Unrelated changed content");
  const blocked = (await data("/youtube/downloads/" + job.id + "/resume", input)).job;
  assert.equal(blocked.status, "paused");
  assert.equal(blocked.preflight.state, "files-unverified");
  const fresh = (await data("/youtube/downloads", { ...input, forceNew: true })).job;
  assert.equal(fresh.status, "running");
  assert.notEqual(fresh.path, job.path);
  assert.equal(readFileSync(partial, "utf8"), "Unrelated changed content");
  await data("/youtube/downloads/" + fresh.id + "/cancel", {});
  console.log(
    JSON.stringify(
      {
        ok: true,
        version: health.version,
        checks: [
          "origin-gated native HTTP routes",
          "literal shortcut arguments and one reusable double-click receipt",
          "independent launches and revoked shortcut denial",
          "low-space pause before output creation",
          "verified partial kept across low-space pause and explicit resume",
          "changed partial blocked and fresh destination isolated",
        ],
        limitations:
          "Disposable copied Companion with mocked OS spawn, tool version and disk measurements. No user game, downloader, provider session or installed service was invoked.",
      },
      null,
      2,
    ),
  );
} finally {
  if (child && child.exitCode === null) {
    const exited = new Promise((yes) => child.once("exit", yes));
    child.kill();
    await Promise.race([exited, new Promise((yes) => setTimeout(yes, 8000))]);
    if (child.exitCode === null) {
      child.kill("SIGKILL");
      await exited;
    }
  }
  assert(realpathSync(base).startsWith(parent + sep + "download-launch-http-"));
  rmSync(base, { recursive: true, force: true });
}
