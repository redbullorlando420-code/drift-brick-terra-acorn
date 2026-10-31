import { spawn } from "node:child_process";
import { statSync, readFileSync, writeFileSync, renameSync, unlinkSync } from "node:fs";
import { extname, basename, win32 } from "node:path";
import { createHash, randomUUID } from "node:crypto";
const suffixes = new Set([".exe", ".lnk", ".url", ".appref-ms"]);
const outcome = {
  pending: "Waiting for the local launcher.",
  accepted: "Launch request accepted. Game readiness is unverified.",
  failed: "The local launcher failed. Check the shortcut and retry.",
  interrupted:
    "Companion stopped before launch acceptance was recorded. Check the game before retrying.",
};
/** Receipts describe the OS launcher, never pretend it is the game process. */
export function createLaunchManager({
  authority,
  receiptFile,
  spawnProcess = spawn,
  platform = process.platform,
  now = Date.now,
  windowMs = 8000,
  timeoutMs = 4000,
}) {
  let receipts = [],
    persistent = true,
    closed = false;
  const inFlight = new Map();
  try {
    if (statSync(receiptFile).size > 256 * 1024) throw Error();
    const saved = JSON.parse(readFileSync(receiptFile, "utf8"));
    if (saved.version !== 1 || !Array.isArray(saved.receipts)) throw Error();
    receipts = saved.receipts
      .slice(0, 50)
      .filter(
        (r) =>
          r &&
          /^[a-f0-9-]{36}$/.test(r.id) &&
          typeof r.path === "string" &&
          r.path.length <= 4096 &&
          /^[a-f0-9]{64}$/.test(r.identity) &&
          Number.isSafeInteger(r.at) &&
          Object.hasOwn(outcome, r.status),
      )
      .map((r) => ({
        id: r.id,
        path: r.path,
        name: basename(r.path),
        identity: r.identity,
        at: r.at,
        updatedAt: Number.isSafeInteger(r.updatedAt) ? r.updatedAt : r.at,
        status: r.status === "pending" ? "interrupted" : r.status,
        launcherExit: r.launcherExit === 0 ? 0 : null,
        readiness: "unverified",
      }));
  } catch (e) {
    if (e.code !== "ENOENT") persistent = false;
  }
  const save = () => {
    if (!persistent) return false;
    const temp = receiptFile + "." + randomUUID() + ".tmp";
    try {
      writeFileSync(temp, JSON.stringify({ version: 1, receipts }), { flag: "wx" });
      renameSync(temp, receiptFile);
      return true;
    } catch {
      persistent = false;
      return false;
    } finally {
      try {
        unlinkSync(temp);
      } catch {}
    }
  };
  const expose = (r) => ({
    ...r,
    detail: outcome[r.status],
    retryable: r.status === "failed",
    persistent,
  });
  const inspect = (raw) => {
    if (closed) throw Error("Companion is stopping. Check your game before retrying.");
    if (platform !== "win32")
      throw Error(
        "Desktop shortcut launch is supported on Windows only. Browser games remain available.",
      );
    if (typeof raw !== "string" || raw.length > 4096 || /[\x00-\x1f]/.test(raw))
      throw Error("Choose an approved desktop shortcut.");
    const file = authority.check(raw);
    if (!file || !suffixes.has(extname(file).toLowerCase()))
      throw Error(
        "The shortcut is missing, unsupported or no longer approved. Refresh approved shortcuts.",
      );
    const access = authority.lease(file);
    try {
      const stat = statSync(file, { bigint: true });
      if (!stat.isFile()) throw Error();
      return {
        file,
        access,
        identity: createHash("sha256")
          .update(
            [file, stat.dev, stat.ino, stat.birthtimeNs, stat.size, stat.mtimeNs]
              .map(String)
              .join(":"),
          )
          .digest("hex"),
      };
    } catch {
      access.release();
      throw Error("The shortcut is unavailable. Refresh approved shortcuts.");
    }
  };
  return {
    history: () => ({ receipts: receipts.map(expose), persistent, windowMs }),
    async launch(raw) {
      const checked = inspect(raw),
        { file, access, identity } = checked;
      const pending = inFlight.get(identity);
      if (pending) {
        access.release();
        return { ...(await pending.promise), reused: true };
      }
      const previous = receipts.find(
        (r) =>
          r.identity === identity &&
          r.status === "accepted" &&
          now() - r.at >= 0 &&
          now() - r.at < windowMs,
      );
      if (previous) {
        access.release();
        return { ...expose(previous), reused: true };
      }
      if (inFlight.size >= 8) {
        access.release();
        throw Error("Too many launch requests. Wait for the local launcher.");
      }
      const row = {
        id: randomUUID(),
        path: file,
        name: basename(file),
        identity,
        at: now(),
        updatedAt: now(),
        status: "pending",
        launcherExit: null,
        readiness: "unverified",
      };
      receipts.unshift(row);
      receipts.splice(50);
      if (!save()) {
        receipts = receipts.filter((r) => r !== row);
        access.release();
        throw Error("Launch receipts cannot be saved. Check Companion storage before launching.");
      }
      let done,
        timer,
        child,
        settled = false;
      const promise = new Promise((resolve) => (done = resolve)),
        entry = {
          promise,
          stop: () => {
            finish("interrupted");
            child?.kill();
          },
        };
      const finish = (status) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        row.status = status;
        row.updatedAt = now();
        save();
        access.release();
        inFlight.delete(identity);
        done({ ...expose(row), reused: false });
      };
      inFlight.set(identity, entry);
      access.signal.addEventListener(
        "abort",
        () => {
          finish("failed");
          child?.kill();
        },
        { once: true },
      );
      try {
        access.assert();
        // Pass the canonical path as a literal argument to the registered Windows
        // desktop launcher. No cmd.exe, PowerShell, interpolation or user flags.
        child = spawnProcess(
          win32.join(process.env.SystemRoot || "C:\\Windows", "explorer.exe"),
          [file],
          {
            shell: false,
            windowsHide: true,
            detached: true,
            stdio: "ignore",
          },
        );
        child.once("error", () => {
          if (!settled) finish("failed");
          else if(row.status==="accepted") {
            row.status = "failed";
            row.updatedAt = now();
            save();
          }
        });
        child.once("spawn", () => {
          finish("accepted");
          child.unref?.();
        });
        child.once("close", (code) => {
          row.launcherExit = code === 0 ? 0 : null;
          if (!settled) finish(code === 0 ? "accepted" : "failed");
          else if(row.status==="accepted") {
            if (code !== 0) row.status = "failed";
            row.updatedAt = now();
            save();
          }
        });
        timer = setTimeout(() => {
          finish("interrupted");
          child.kill();
        }, timeoutMs);
        timer.unref?.();
      } catch {
        finish("failed");
      }
      return promise;
    },
    shutdown() {
      closed = true;
      for (const entry of [...inFlight.values()]) entry.stop();
    },
  };
}
