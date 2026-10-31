import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { win32, resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { requestDesktopControl } from "../companion/desktop-control.mjs";
const exec = promisify(execFile);
export const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Strict subset of Windows argv: reject flags/eval and unmatched quoting. */
export function windowsArguments(command) {
  if (typeof command !== "string" || command.length > 32768 || /[\r\n\0]/.test(command)) return [];
  const args = [];
  let index = 0;
  while (index < command.length) {
    while (/\s/.test(command[index] ?? "") && index < command.length) index++;
    if (index === command.length) break;
    let value = "",
      quoted = false;
    while (index < command.length) {
      const char = command[index++];
      if (char === '"') {
        quoted = !quoted;
        continue;
      }
      if (/\s/.test(char) && !quoted) break;
      value += char;
    }
    if (quoted) return [];
    args.push(value);
  }
  return args;
}
const pathKey = (path) => win32.normalize(path).toLowerCase();
export function ownedDesktopProcesses(rows, root) {
  const known = rows.filter(
    (row) =>
      Number.isSafeInteger(row.pid) &&
      row.pid > 0 &&
      typeof row.created === "string" &&
      /^\d{14}\.\d{6}[+-]\d{3}$/.test(row.created),
  );
  const main = (row) => {
    const args = windowsArguments(row.command);
    return args.length >= 2 &&
      ["node", "node.exe"].includes(win32.basename(args[0]).toLowerCase()) &&
      !args[1].startsWith("-")
      ? args
      : [];
  };
  const same = (value, relative) =>
    win32.isAbsolute(value ?? "") && pathKey(value) === pathKey(win32.join(root, relative));
  const launchers = known.filter((row) => same(main(row)[1], "scripts/start-desktop.mjs"));
  const result = [];
  for (const row of known) {
    const args = main(row);
    if (!args.length) continue;
    const parent = launchers.find(
      (parent) =>
        parent.pid === row.parent && parent.created.slice(0, 14) <= row.created.slice(0, 14),
    );
    const companion =
      same(args[1], "companion/reelcase-companion.mjs") ||
      (parent && args[1].replaceAll("\\", "/") === "companion/reelcase-companion.mjs");
    const server =
      same(args[1], "node_modules/vite/bin/vite.js") &&
      JSON.stringify(args.slice(2)) ===
        JSON.stringify(["dev", "--host", "0.0.0.0", "--port", "8080"]);
    if (companion && args.length === 2) result.push({ ...row, service: "Companion" });
    else if (server) result.push({ ...row, service: "Server" });
  }
  return result;
}
export async function windowsInventory() {
  const { stdout } = await exec(
    "cscript.exe",
    ["//NoLogo", join(desktopRoot, "scripts", "desktop-processes.vbs"), "list"],
    { windowsHide: true, timeout: 12000, maxBuffer: 2 * 1024 ** 2 },
  );
  return stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}
async function terminate(row) {
  await exec(
    "cscript.exe",
    [
      "//NoLogo",
      join(desktopRoot, "scripts", "desktop-processes.vbs"),
      "terminate",
      String(row.pid),
      row.created,
    ],
    { windowsHide: true, timeout: 6000 },
  );
}
export async function stopDesktop({
  root = desktopRoot,
  inventory = windowsInventory,
  kill = terminate,
  control = requestDesktopControl,
  wait = (ms) => new Promise((r) => setTimeout(r, ms)),
  grace = 7000,
  statusOnly = false,
} = {}) {
  const before = ownedDesktopProcesses(await inventory(), root),
    reports = [];
  if (statusOnly)
    return {
      ok: true,
      services: before.map(({ service, pid }) => ({ service, pid, state: "running" })),
    };
  // Request Companion cleanup before terminating the HTTP server. Root leases,
  // model/download checkpoints and owned native children use existing shutdown.
  let controlled;
  try {
    controlled = await control(root, "companion", { action: "status" });
    if (before.some((row) => row.service === "Companion" && row.pid === controlled.pid))
      await control(root, "companion", {
        action: "stop",
        pid: controlled.pid,
        instance: controlled.instance,
      });
    else controlled = undefined;
  } catch {
    controlled = undefined;
  }
  if (controlled) {
    const deadline = Date.now() + grace;
    while (Date.now() < deadline) {
      const rows = await inventory();
      if (
        !rows.some(
          (row) =>
            row.pid === controlled.pid &&
            before.some((old) => old.pid === row.pid && old.created === row.created),
        )
      )
        break;
      await wait(250);
    }
  }
  for (const initial of before) {
    const current = ownedDesktopProcesses(await inventory(), root).find(
      (row) =>
        row.pid === initial.pid &&
        row.created === initial.created &&
        row.command === initial.command,
    );
    if (!current) {
      reports.push({ service: initial.service, state: "stopped-or-replaced" });
      continue;
    }
    try {
      await kill(current);
      reports.push({
        service: initial.service,
        state: "stop-requested",
        forced: initial.service === "Companion",
      });
    } catch {
      reports.push({ service: initial.service, state: "stop-failed" });
    }
  }
  // Check the service processes, not whether an OS termination request returned.
  let remaining = [];
  for (let attempt = 0; attempt < 12; attempt++) {
    remaining = ownedDesktopProcesses(await inventory(), root);
    if (!remaining.length) break;
    await wait(250);
  }
  return {
    ok: remaining.length === 0,
    services: reports,
    remaining: remaining.map(({ service, pid }) => ({ service, pid })),
    nothingToStop: before.length === 0,
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.platform !== "win32")
      throw Error(
        "This desktop shortcut is for Windows. Use the original service console to stop services on other systems.",
      );
    const statusOnly = process.argv.includes("--status"),
      result = await stopDesktop({ statusOnly });
    console.log(
      statusOnly
        ? "Realhub service status"
        : result.ok
          ? "Verified Realhub services stopped."
          : "Some Realhub processes could not be stopped.",
    );
    if (result.nothingToStop)
      console.log(
        "No verified processes for this installation are running. Unidentified processes were left alone.",
      );
    for (const row of result.services)
      console.log(
        row.service +
          ": " +
          row.state +
          (row.forced ? " (forced; review interrupted jobs after restart)" : ""),
      );
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    console.error(
      "Could not verify the local services. Nothing unverified was stopped. " + error.message,
    );
    process.exitCode = 1;
  }
  if (!process.argv.includes("--no-wait") && process.stdin.isTTY) {
    if (process.exitCode || process.argv.includes("--status")) {
      console.log("Press Enter to close.");
      process.stdin.resume();
      process.stdin.once("data", () => process.stdin.pause());
    } else await new Promise((r) => setTimeout(r, 1400));
  }
}
