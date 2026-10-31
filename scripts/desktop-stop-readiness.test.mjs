import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { resolve, join, sep } from "node:path";
import { ownedDesktopProcesses, windowsArguments, stopDesktop } from "./stop-desktop.mjs";
import { serveDesktopControl, requestDesktopControl } from "../companion/desktop-control.mjs";
import { featureReadiness } from "../src/lib/feature-readiness.ts";
const root = "E:\\Realhub test",
  created = "20261030120000.000001-240";
const row = (pid, script, args = "", extra = {}) => ({
  pid,
  parent: 1,
  created,
  command: '"C:\\Program Files\\nodejs\\node.exe" "' + script + '"' + (args ? " " + args : ""),
  ...extra,
});
const server = row(
  101,
  root + "\\node_modules\\vite\\bin\\vite.js",
  "dev --host 0.0.0.0 --port 8080",
);
const companion = row(102, root + "\\companion\\reelcase-companion.mjs");
test("process selection matches exact own Vite dev entry and Companion without eval/string/foreign-port matches", () => {
  const rows = [
    server,
    companion,
    row(103, root + " other\\companion\\reelcase-companion.mjs"),
    row(104, root + "\\node_modules\\vite\\bin\\vite.js", "preview --port 8080"),
    row(105, root + "\\node_modules\\vite\\bin\\vite.js", "dev --host 0.0.0.0 --port 8083"),
    row(106, "--eval", '"' + server.command + '"'),
    row(107, root + "\\scripts\\unrelated.mjs"),
    { ...server, pid: 108, created: "missing" },
  ];
  assert.deepEqual(
    ownedDesktopProcesses(rows, root).map((r) => r.pid),
    [101, 102],
  );
  assert.equal(
    ownedDesktopProcesses(
      [
        {
          ...server,
          command: server.command.replace("C:\\Program Files\\nodejs\\node.exe", "node"),
        },
      ],
      root,
    ).length,
    1,
  );
  assert.equal(
    ownedDesktopProcesses(
      [{ ...server, command: server.command.replace("vite\\bin", ".bin\\..\\vite\\bin") }],
      root,
    ).length,
    1,
  );
  assert.deepEqual(windowsArguments('node "unclosed'), []);
  assert.deepEqual(windowsArguments("node foo\nbar"), []);
});
test("legacy relative Companion needs a verified older launcher parent from this installation", () => {
  const launcher = row(10, root + "\\scripts\\start-desktop.mjs"),
    child = { ...companion, parent: 10, command: "node companion/reelcase-companion.mjs" };
  assert.equal(ownedDesktopProcesses([child], root).length, 0);
  assert.equal(ownedDesktopProcesses([launcher, child], root).length, 1);
  assert.equal(
    ownedDesktopProcesses([{ ...launcher, created: "20261030130000.000001-240" }, child], root)
      .length,
    0,
  );
});
test("read-only status and repeated stop never kill unknown processes", async () => {
  let rows = [server, companion, row(900, "E:\\Other\\companion\\reelcase-companion.mjs")],
    killed = [];
  const options = {
    root,
    inventory: async () => rows,
    control: async () => {
      throw Error("legacy");
    },
    kill: async (r) => {
      killed.push(r.pid);
      rows = rows.filter((v) => v.pid !== r.pid);
    },
    wait: async () => {},
  };
  assert.equal((await stopDesktop({ ...options, statusOnly: true })).services.length, 2);
  assert.equal(killed.length, 0);
  assert.equal((await stopDesktop(options)).ok, true);
  assert.deepEqual(killed, [101, 102]);
  assert.equal(rows[0].pid, 900);
  assert.equal((await stopDesktop(options)).nothingToStop, true);
  assert.deepEqual(killed, [101, 102]);
});
test("reused PID or changed command cannot inherit termination from an old observation", async () => {
  let calls = 0,
    kills = 0;
  const result = await stopDesktop({
    root,
    inventory: async () =>
      ++calls === 1
        ? [server]
        : [{ ...server, created: "20261030130000.000001-240", command: "node E:\\Other\\app.mjs" }],
    kill: async () => kills++,
    control: async () => {
      throw Error("none");
    },
    wait: async () => {},
  });
  assert.equal(kills, 0);
  assert.equal(result.ok, true);
});
test("new same-installation process remains running and is reported instead of killed", async () => {
  let calls = 0,
    kills = 0;
  const result = await stopDesktop({
    root,
    inventory: async () =>
      ++calls === 1 ? [server] : [{ ...server, created: "20261030130000.000001-240" }],
    kill: async () => kills++,
    control: async () => {
      throw Error("none");
    },
    wait: async () => {},
  });
  assert.equal(kills, 0);
  assert.equal(result.ok, false);
  assert.equal(result.remaining.length, 1);
});
test("verified Companion IPC cleanup runs before fallback and server termination", async () => {
  let rows = [server, companion],
    events = [];
  const result = await stopDesktop({
    root,
    inventory: async () => rows,
    control: async (_, service, message) => {
      events.push(message.action);
      if (message.action === "stop") rows = rows.filter((r) => r.pid !== 102);
      return { pid: 102, instance: "token" };
    },
    kill: async (r) => {
      events.push("kill-" + r.service);
      rows = [];
    },
    wait: async () => {},
  });
  assert.equal(result.ok, true);
  assert.deepEqual(events, ["status", "stop", "kill-Server"]);
  assert.equal(result.services.find((r) => r.service === "Companion").state, "stopped-or-replaced");
});
test("failed termination stays failed without looping/repeated kills", async () => {
  let kills = 0;
  const result = await stopDesktop({
    root,
    inventory: async () => [server],
    control: async () => {
      throw Error("none");
    },
    kill: async () => {
      kills++;
      throw Error("denied");
    },
    wait: async () => {},
  });
  assert.equal(result.ok, false);
  assert.equal(kills, 1);
  assert.equal(result.services[0].state, "stop-failed");
});
test("real local IPC rejects stale instance approvals and runs stop only once", async () => {
  const parent = resolve(".grok"),
    temp = await mkdtemp(join(parent, "desktop-pipe-unit-"));
  let close,
    stops = 0;
  try {
    await mkdir(join(temp, ".grok"));
    close = await serveDesktopControl({ root: temp, stop: () => stops++ });
    const status = await requestDesktopControl(temp, "companion", { action: "status" });
    await assert.rejects(
      requestDesktopControl(temp, "companion", {
        action: "stop",
        pid: status.pid,
        instance: "stale",
      }),
      /Incompatible/,
    );
    assert.equal(stops, 0);
    await requestDesktopControl(temp, "companion", {
      action: "stop",
      pid: status.pid,
      instance: status.instance,
    });
    await requestDesktopControl(temp, "companion", {
      action: "stop",
      pid: status.pid,
      instance: status.instance,
    });
    await new Promise((r) => setImmediate(r));
    assert.equal(stops, 1);
  } finally {
    close?.();
    const full = resolve(temp);
    assert(full.startsWith(parent + sep));
    await rm(full, { recursive: true, force: true });
  }
});
const health = {
  ok: true,
  service: "reelcase-companion",
  version: 19,
  protocol: { major: 1, minor: 0 },
  capabilities: ["studio-models", "remote-launch-safeguards", "youtube-downloads"],
};
const readiness = (snapshot) => featureReadiness({ hydrated: true, videos: 4, snapshot });
test("inventory separates implementation from setup and native verification without a probe", () => {
  const rows = readiness(null);
  assert.equal(rows.find((r) => r.id === "a1111").state, "unchecked");
  assert(rows.find((r) => r.id === "chat").evidence.includes("game control unconnected"));
  assert(rows.find((r) => r.id === "signal").evidence.includes("publishing"));
  assert(rows.every((r) => !r.evidence.includes("verified successfully")));
});
test("installed model, available downloader and RustDesk launcher never prove execution", () => {
  const rows = readiness({
    health,
    checkedAt: Date.now(),
    probes: {
      a1111: { ok: true, value: { connected: true, ready: true, models: ["one"] } },
      qwen: { ok: true, value: { connected: false, ready: true } },
      remote: {
        ok: true,
        value: { installed: true, sessionVerified: true, launcherRunning: true },
      },
      downloads: { ok: true, value: { configured: true } },
    },
  });
  assert.equal(rows.find((r) => r.id === "a1111").state, "ready");
  assert.equal(rows.find((r) => r.id === "qwen").state, "unconfigured");
  assert(rows.find((r) => r.id === "remote").evidence.includes("session unverified"));
  assert(rows.find((r) => r.id === "a1111").evidence.includes("generation unverified"));
  assert.equal(rows.find((r) => r.id === "downloads").state, "ready");
});
test("missing capabilities, failed probes, foreign and incompatible health remain visibly unsupported/unavailable", () => {
  let rows = readiness({ health: { ...health, capabilities: [] }, checkedAt: 1, probes: {} });
  assert.equal(rows.find((r) => r.id === "remote").state, "unsupported");
  rows = readiness({ health, checkedAt: 1, probes: { a1111: { ok: false } } });
  assert.equal(rows.find((r) => r.id === "a1111").state, "unavailable");
  rows = readiness({ health: { ...health, service: "other" }, checkedAt: 1, probes: {} });
  assert.equal(rows.find((r) => r.id === "remote").state, "unavailable");
  rows = readiness({
    health: { ...health, protocol: { major: 2, minor: 0 } },
    checkedAt: 1,
    probes: {},
  });
  assert.equal(rows.find((r) => r.id === "a1111").state, "unavailable");
});
