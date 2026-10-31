import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { resolve, join, sep } from "node:path";
import { pathToFileURL } from "node:url";
import {
  stopDesktop,
  windowsInventory,
  ownedDesktopProcesses,
  desktopRoot,
} from "./stop-desktop.mjs";
assert.equal(
  process.platform,
  "win32",
  "This check uses real Windows process creation identities.",
);
const parent = resolve(".grok"),
  root = await mkdtemp(join(parent, "desktop-stop-")),
  children = [],
  checks = [];
let before;
async function start(script, args = []) {
  const child = spawn(process.execPath, [script, ...args], {
    stdio: ["ignore", "pipe", "pipe", "ipc"],
    windowsHide: true,
  });
  children.push(child);
  await Promise.race([
    once(child, "message"),
    once(child, "error").then(([error]) => {
      throw error;
    }),
    new Promise((_, reject) => {
      const timer = setTimeout(() => reject(Error("Fixture startup timed out")), 6000);
      timer.unref();
    }),
  ]);
  return child;
}
try {
  before = ownedDesktopProcesses(await windowsInventory(), desktopRoot);
  // Exercise spaces and non-ASCII command paths through ASCII-escaped WMI JSON.
  const installation = join(root, "Realhub café 私");
  await mkdir(join(installation, "companion"), { recursive: true });
  await mkdir(join(installation, "node_modules", "vite", "bin"), { recursive: true });
  const app = join(installation, "node_modules", "vite", "bin", "vite.js"),
    native = join(installation, "companion", "reelcase-companion.mjs"),
    other = join(root, "unrelated.mjs"),
    marker = join(root, "checkpoint.txt");
  await writeFile(app, "process.send('ready');setInterval(()=>{},1000);");
  await writeFile(other, "process.send('ready');setInterval(()=>{},1000);");
  await writeFile(
    native,
    "import {serveDesktopControl} from " +
      JSON.stringify(pathToFileURL(resolve("companion/desktop-control.mjs")).href) +
      ";import {writeFile} from 'node:fs/promises';await serveDesktopControl({root:" +
      JSON.stringify(installation) +
      ",stop:async()=>{await writeFile(" +
      JSON.stringify(marker) +
      ",'checkpoint preserved');process.exit(0);}});process.send('ready');setInterval(()=>{},1000);",
  );
  const server = await start(app, ["dev", "--host", "0.0.0.0", "--port", "8080"]),
    companion = await start(native),
    unrelated = await start(other);
  const states = await stopDesktop({ root: installation, statusOnly: true });
  assert.deepEqual(
    new Set(states.services.map((r) => r.service)),
    new Set(["Server", "Companion"]),
  );
  assert.equal(server.exitCode, null);
  assert.equal(companion.exitCode, null);
  checks.push(
    "Read-only status identifies both owned real processes, including a Unicode installation path.",
  );
  const result = await stopDesktop({ root: installation });
  assert.equal(result.ok, true);
  assert.equal(await readFile(marker, "utf8"), "checkpoint preserved");
  assert.equal(result.services.find((r) => r.service === "Companion").state, "stopped-or-replaced");
  process.kill(unrelated.pid, 0);
  checks.push(
    "Companion receives real named-pipe cleanup before exact server termination; an unrelated Node process survives.",
  );
  assert.equal((await stopDesktop({ root: installation })).nothingToStop, true);
  checks.push("Second click succeeds without additional termination.");
  const legacy = await start(native); // Same real process but prevent IPC lookup to exercise the older-service fallback.
  const forced = await stopDesktop({
    root: installation,
    control: async () => {
      throw Error("No legacy control");
    },
  });
  assert.equal(forced.ok, true);
  assert.equal(forced.services[0].forced, true);
  checks.push(
    "Older-service fallback terminates only the verified Companion identity and discloses the interruption.",
  );
  const after = ownedDesktopProcesses(await windowsInventory(), desktopRoot);
  assert.deepEqual(
    after.map((r) => r.pid),
    before.map((r) => r.pid),
  );
  checks.push("The actual running Realhub installation is unchanged.");
  const report = {
    ok: true,
    checks,
    scope:
      "Disposable Node service fixtures and real Windows WMI/named pipes. User server, media, engines and Companion were not stopped.",
  };
  await writeFile("screenshots/desktop-stop-windows.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill();
  }
  await new Promise((r) => setTimeout(r, 400));
  const full = resolve(root);
  assert(full.startsWith(parent + sep));
  await rm(full, { recursive: true, force: true });
}
