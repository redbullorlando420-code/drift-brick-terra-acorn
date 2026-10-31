import assert from "node:assert/strict";
import { createServer } from "node:net";
import { request as httpRequest } from "node:http";
import { spawn } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
  writeFileSync,
  readFileSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { resolve, join, sep } from "node:path";
const parent = realpathSync(resolve(".grok")),
  base = mkdtempSync(join(parent, "consent-http-")),
  program = join(base, "program"),
  approved = join(base, "approved");
mkdirSync(program);
mkdirSync(approved);
for (const file of readdirSync("companion"))
  if (file.endsWith(".mjs")) copyFileSync(join("companion", file), join(program, file));
const entry =
  "import cp from 'node:child_process';import fs from 'node:fs';import {syncBuiltinESMExports} from 'node:module';import {EventEmitter} from 'node:events';import {PassThrough} from 'node:stream';let release;cp.execFileSync=(file,args)=>{if(file===process.env.YT_DLP_PATH&&args.includes('--version'))return 'fixture';throw Error('No native discovery');};cp.spawn=()=>{const c=new EventEmitter();c.stdout=new PassThrough();c.stderr=new PassThrough();c.kill=()=>{process.send({type:'killed'});setImmediate(()=>c.emit('close',1));return true;};process.send({type:'spawn'});return c;};fs.statfsSync=()=>({bavail:8n*1024n**3n,bsize:1n});syncBuiltinESMExports();globalThis.fetch=async()=>{process.send({type:'metadata'});await new Promise(r=>release=r);return Response.json({sha:'a'.repeat(40),siblings:[]});};process.on('message',m=>{if(m==='release')release?.();});await import('./reelcase-companion.mjs');";
writeFileSync(join(program, "entry.mjs"), entry);
const binary = join(program, "fixture.exe");
writeFileSync(binary, "Not executable; child process calls are intercepted.");
const port = await new Promise((yes, no) => {
  const server = createServer();
  server.once("error", no);
  server.listen(0, "127.0.0.1", () => {
    const port = server.address().port;
    server.close(() => yes(port));
  });
});
let child,
  spawns = 0,
  kills = 0,
  metadata = 0,
  output = "";
const start = async () => {
  child = spawn(process.execPath, [join(program, "entry.mjs")], {
    cwd: program,
    windowsHide: true,
    env: {
      ...process.env,
      PATH: "",
      USERPROFILE: join(base, "absent"),
      OneDrive: "",
      OneDriveConsumer: "",
      REELCASE_ALLOWED_ROOTS: approved,
      REELCASE_DOWNLOAD_DIR: approved,
      REELCASE_COMPANION_PORT: String(port),
      REELCASE_APP_ORIGIN: "http://127.0.0.1:8080",
      YT_DLP_PATH: binary,
      YOUTUBE_DL_PATH: "",
    },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  child.on("message", (m) => {
    if (m.type === "spawn") spawns++;
    if (m.type === "killed") kills++;
    if (m.type === "metadata") metadata++;
  });
  await new Promise((yes, no) => {
    const timer = setTimeout(() => no(Error(output)), 15000);
    const read = (d) => {
      output = (output + d).slice(-4000);
      if (output.includes("Companion listening")) {
        clearTimeout(timer);
        yes();
      }
    };
    child.stdout.on("data", read);
    child.stderr.on("data", read);
    child.once("exit", (c) => {
      clearTimeout(timer);
      no(Error("Service exited " + c + " " + output));
    });
  });
};
const stop = async () => {
  if (child && child.exitCode === null) {
    const ended = new Promise((r) => child.once("exit", r));
    child.kill();
    await Promise.race([ended, new Promise((r) => setTimeout(r, 6500))]);
    if (child.exitCode === null) {
      child.kill("SIGKILL");
      await ended;
    }
  }
  output = "";
};
const request = (path, body, origin = "http://127.0.0.1:8080") =>
  fetch("http://127.0.0.1:" + port + path, {
    method: body ? "POST" : "GET",
    headers: { origin, ...(body ? { "content-type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(10000),
  });
const data = async (path, body) => await (await request(path, body)).json();
const change = async (scope, allowed) => {
  const state = await data("/permissions");
  const next = await data("/permissions/change", { scope, revision: state.revision, allowed });
  assert(next.ok, JSON.stringify(next));
  return next;
};
const until = async (predicate) => {
  for (let i = 0; i < 150 && !predicate(); i++) await new Promise((r) => setTimeout(r, 10));
  assert(predicate());
};
try {
  await start();
  const health = await data("/health");
  assert.equal(health.version, 19);
  assert(health.capabilities.includes("capability-consent"));
  assert.equal((await request("/permissions", undefined, "https://untrusted.invalid")).status, 403);
  assert(!health.permissions.scopes["model-transfers"].allowed);
  const denied = await data("/studio/models/install", {
    url: "https://huggingface.co/test/model",
    file: "model.safetensors",
  });
  assert(!denied.ok);
  assert.equal(metadata, 0);
  assert.equal(spawns, 0);
  await change("model-transfers", true);
  const held = data("/studio/models/install", {
    url: "https://huggingface.co/test/model",
    file: "model.safetensors",
  });
  await until(() => metadata === 1);
  await change("model-transfers", false);
  await change("model-transfers", true);
  child.send("release");
  assert(!(await held).ok);
  assert.equal((await data("/studio/models")).job, null);
  const state = await data("/permissions"),
    stale = await data("/permissions/change", {
      scope: "model-transfers",
      revision: 0,
      allowed: false,
    });
  assert(!stale.ok);
  assert.equal((await data("/permissions")).revision, state.revision);
  const body = JSON.stringify({
    videoId: "BaW_jenozKc",
    useBrowserSession: true,
    browser: "chrome",
  });
  let finishBody;
  const bodyHeld = new Promise((yes, no) => {
    const req = httpRequest(
      {
        hostname: "127.0.0.1",
        port,
        path: "/youtube/downloads",
        method: "POST",
        headers: {
          origin: "http://127.0.0.1:8080",
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let text = "";
        res.on("data", (d) => (text += d));
        res.on("end", () => yes(JSON.parse(text)));
      },
    );
    req.on("error", no);
    req.write(body.slice(0, 8));
    finishBody = () => req.end(body.slice(8));
  });
  await new Promise((r) => setTimeout(r, 40));
  await change("provider-session", true);
  finishBody();
  const staleBody = await bodyHeld;
  assert(!staleBody.ok);
  assert.match(staleBody.error, /changed/);
  assert.equal(spawns, 0);
  const first = await data("/youtube/downloads", {
    videoId: "BaW_jenozKc",
    useBrowserSession: true,
    browser: "chrome",
  });
  assert(first.ok);
  await until(() => spawns === 1);
  await change("provider-session", false);
  await until(() => kills === 1);
  const jobs = (await data("/youtube/downloads")).jobs;
  assert.equal(jobs.find((j) => j.id === first.job.id).status, "interrupted");
  assert.equal(spawns, 1);
  const policyBefore = readFileSync(join(program, ".local-capability-consent.json"), "utf8");
  await stop();
  await start();
  assert(!(await data("/permissions")).scopes["provider-session"].allowed);
  assert.equal(readFileSync(join(program, ".local-capability-consent.json"), "utf8"), policyBefore);
  assert.equal(spawns, 1, "restart does not replay credential jobs");
  const result = {
    ok: true,
    checks: [
      "v18 explicit capability and origin gating",
      "default-denied model install performs no metadata or native work",
      "held model lookup cannot publish/start after revoke and regrant",
      "stale mutation and held request-body generations rejected",
      "revoking browser-session access stops affected native fixture job",
      "durable choices survive restart without replay",
    ],
    limitations:
      "Real copied-service HTTP and Windows filesystem; metadata and child processes are controlled fixtures. No real model, browser session, provider download or installed Companion was used.",
  };
  writeFileSync(resolve("screenshots/consent-setup-http.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await stop();
  assert(realpathSync(base).startsWith(parent + sep + "consent-http-"));
  rmSync(base, { recursive: true, force: true });
}
