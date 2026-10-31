import assert from "node:assert/strict";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  writeFileSync,
  readFileSync,
  realpathSync,
  rmSync,
  existsSync,
} from "node:fs";
import { join, resolve, sep } from "node:path";
import { createHash } from "node:crypto";
const parent = realpathSync(resolve(".grok")),
  base = mkdtempSync(join(parent, "model-remote-http-")),
  program = join(base, "program"),
  approved = join(base, "approved");
mkdirSync(program);
mkdirSync(approved);
mkdirSync(join(program, "tools"));
for (const file of readdirSync("companion"))
  if (file.endsWith(".mjs")) copyFileSync(join("companion", file), join(program, file));
const tensor = Buffer.alloc(9 * 1024 ** 2, 3),
  header = Buffer.from(
    JSON.stringify({
      "model.diffusion_model.input_blocks.0.weight": {
        dtype: "F32",
        shape: [tensor.length / 4],
        data_offsets: [0, tensor.length],
      },
    }),
  ),
  prefix = Buffer.alloc(8);
prefix.writeBigUInt64LE(BigInt(header.length));
const bytes = Buffer.concat([prefix, header, tensor]);
writeFileSync(join(program, "fixture.weights"), bytes);
writeFileSync(
  join(program, "tools", process.platform === "win32" ? "rustdesk.exe" : "rustdesk"),
  "Not executable; native spawn is intercepted.",
);
writeFileSync(
  join(program, "entry.mjs"),
  "import cp from 'node:child_process';import fs from 'node:fs';import {createHash} from 'node:crypto';import {syncBuiltinESMExports} from 'node:module';import {EventEmitter} from 'node:events';const bytes=fs.readFileSync(new URL('./fixture.weights',import.meta.url)),sha=createHash('sha256').update(bytes).digest('hex');let fail=true,offset=0;const realNow=Date.now;Date.now=()=>realNow()+offset;cp.execFileSync=()=>{throw Error('Native discovery disabled');};cp.spawn=(file,args,options)=>{process.send({type:'spawn',args,shell:options.shell});const child=new EventEmitter();child.kill=()=>{setImmediate(()=>child.emit('exit',0));return true;};return child;};syncBuiltinESMExports();process.on('message',m=>{if(m==='allow')fail=false;if(m==='expire')offset+=31000;});globalThis.fetch=async(url,options)=>{if(url.includes('/api/')){process.send({type:'metadata'});return Response.json({sha:'a'.repeat(40),siblings:[{rfilename:'fixture.safetensors',size:bytes.length,lfs:{sha256:sha}}]});}const [start,end]=options.headers.Range.slice(6).split('-').map(Number);process.send({type:'range',start,end});if(fail&&start===4*1024**2){fail=false;throw Error('Controlled interruption');}return new Response(bytes.subarray(start,end+1),{status:206,headers:{'content-range':'bytes '+start+'-'+end+'/'+bytes.length,etag:'\"fixture\"'}});};await import('./reelcase-companion.mjs');",
);
const port = await new Promise((yes, no) => {
  const s = createServer();
  s.once("error", no);
  s.listen(0, "127.0.0.1", () => {
    const p = s.address().port;
    s.close(() => yes(p));
  });
});
let child,
  output = "",
  messages = [];
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
      REELCASE_COMPANION_PORT: String(port),
      REELCASE_APP_ORIGIN: "http://127.0.0.1:8080",
      RUSTDESK_PATH: "",
      YT_DLP_PATH: "",
      YOUTUBE_DL_PATH: "",
    },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  child.on("message", (m) => messages.push(m));
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
    child.once("exit", (code) => {
      clearTimeout(timer);
      no(Error("Companion exited " + code + " " + output));
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
    signal: AbortSignal.timeout(15000),
  });
const data = async (path, body) => await (await request(path, body)).json();
const settled = async () => {
  for (let i = 0; i < 200; i++) {
    const state = await data("/studio/models");
    if (state.job?.state !== "running") return state;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw Error("Model did not settle");
};
try {
  await start();
  const health = await data("/health");
  assert.equal(health.version, 19);
  assert(
    health.capabilities.includes("model-transfer-recovery") &&
      health.capabilities.includes("remote-launch-safeguards"),
  );
  assert.equal(
    (await request("/remote/status", undefined, "https://untrusted.invalid")).status,
    403,
  );
  const policy = await data("/permissions");
  assert(
    (
      await data("/permissions/change", {
        scope: "model-transfers",
        revision: policy.revision,
        allowed: true,
      })
    ).ok,
  );
  assert(
    (
      await data("/studio/models/install", {
        url: "https://huggingface.co/test/model",
        file: "fixture.safetensors",
      })
    ).ok,
  );
  let state = await settled(),
    receipt = state.modelTransferRecovery.entries[0];
  assert.equal(receipt.received, 4 * 1024 ** 2);
  assert.equal(receipt.state, "interrupted");
  assert(
    !existsSync(
      join(program, "tools/stable-diffusion-webui/models/Stable-diffusion/fixture.safetensors"),
    ),
  );
  await stop();
  messages = [];
  await start();
  child.send("allow");
  state = await data("/studio/models");
  assert.equal(state.job, null);
  assert.equal(messages.filter((m) => m.type === "range").length, 0);
  const path = "/studio/models/transfers/" + receipt.id;
  assert((await data(path + "/review", {})).review.canResume);
  assert((await data(path + "/resume", {})).ok);
  state = await settled();
  assert.equal(state.job.state, "done");
  assert.equal(
    createHash("sha256")
      .update(
        readFileSync(
          join(program, "tools/stable-diffusion-webui/models/Stable-diffusion/fixture.safetensors"),
        ),
      )
      .digest("hex"),
    createHash("sha256").update(bytes).digest("hex"),
  );
  assert(
    messages.filter((m) => m.type === "range").every((m) => m.end - m.start + 1 <= 4 * 1024 ** 2),
  );
  const peer = "123456789",
    requester = "11111111-2222-3333-4444-555555555555";
  let approval = await data("/remote/arm", { peer, requester });
  assert(approval.ok);
  child.send("expire");
  await new Promise((r) => setTimeout(r, 30));
  assert(
    !(
      await data("/remote/connect", {
        peer,
        requester,
        token: approval.token,
        confirmation: "CONNECT " + peer,
      })
    ).ok,
  );
  assert.equal(messages.filter((m) => m.type === "spawn").length, 0);
  approval = await data("/remote/arm", { peer, requester });
  assert(
    !(
      await data("/remote/connect", {
        peer,
        requester,
        token: approval.token,
        confirmation: "CONNECT " + peer,
        unattended: true,
      })
    ).ok,
  );
  assert(
    (
      await data("/remote/connect", {
        peer,
        requester,
        token: approval.token,
        confirmation: "CONNECT " + peer,
      })
    ).ok,
  );
  let remote = await data("/remote/status");
  assert.equal(remote.sessionVerified, false);
  assert.equal(remote.launch.state, "launch-requested");
  assert.equal(messages.filter((m) => m.type === "spawn").length, 1);
  assert.deepEqual(messages.find((m) => m.type === "spawn").args, [
    "--connect",
    peer,
    "--no-server",
  ]);
  assert(
    !(
      await data("/remote/connect", {
        peer,
        requester,
        token: approval.token,
        confirmation: "CONNECT " + peer,
      })
    ).ok,
  );
  assert((await data("/remote/lock", {})).ok);
  for (let i = 0; i < 100; i++) {
    remote = await data("/remote/status");
    if (!remote.launcherRunning) break;
    await new Promise((r) => setTimeout(r, 10));
  }
  assert.equal(remote.launch.state, "launcher-exited");
  assert.equal(remote.launch.sessionVerified, false);
  assert(
    !JSON.stringify(remote).includes(peer) && !JSON.stringify(remote).includes(approval.token),
  );
  const result = {
    ok: true,
    checks: [
      "v19 origin/capability checks",
      "real checkpoint file survives process restart with no replay",
      "bounded resume yields checksum-identical full model",
      "expired and replayed approvals start no native process",
      "unattended fields rejected and exact password-free literal argv observed",
      "launcher stop/exit never marked a verified remote session",
    ],
    limitations:
      "Disposable copied Companion on actual Windows filesystem/HTTP. Hugging Face responses and native processes are controlled fixtures. No real weights, RustDesk executable, remote peer, account or installed service was invoked.",
  };
  writeFileSync(resolve("screenshots/model-remote-http.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await stop();
  assert(realpathSync(base).startsWith(parent + sep + "model-remote-http-"));
  rmSync(base, { recursive: true, force: true });
}
