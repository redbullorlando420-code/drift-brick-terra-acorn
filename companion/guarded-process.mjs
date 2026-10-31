import { spawn } from "node:child_process";
/** Native metadata tools have no shell and receive only internally built args.
 * Their file lease stays active until close; revoked output is never admitted. */
export function approvedProcess(
  authority,
  path,
  binary,
  args,
  { timeoutMs = 5000, maxBytes = 32000, spawnProcess = spawn } = {},
) {
  const access = authority.lease(path);
  return new Promise((resolve, reject) => {
    let child,
      output = "",
      settled = false,
      timer;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      access.signal.removeEventListener("abort", abort);
      try {
        if (error) throw error;
        access.assert();
        resolve(output);
      } catch (e) {
        reject(e);
      } finally {
        access.release();
      }
    };
    const abort = () => {
      child?.kill();
      finish(access.signal.reason ?? Error("Folder access changed."));
    };
    try {
      access.assert();
      child = spawnProcess(binary, args, {
        windowsHide: true,
        shell: false,
        stdio: ["ignore", "pipe", "ignore"],
      });
      access.signal.addEventListener("abort", abort, { once: true });
      child.stdout?.on("data", (chunk) => {
        if (settled) return;
        try {
          access.assert();
          output += String(chunk);
          if (Buffer.byteLength(output) > maxBytes) {
            child.kill();
            finish(Error("Native metadata response exceeded its limit."));
          }
        } catch {
          abort();
        }
      });
      child.once("error", () => finish(Error("Native metadata tool is unavailable.")));
      child.once("close", (code) =>
        finish(code === 0 ? null : Error("Native metadata tool did not complete.")),
      );
      timer = setTimeout(() => {
        child.kill();
        finish(Error("Native metadata tool timed out."));
      }, timeoutMs);
      timer.unref?.();
    } catch (e) {
      finish(e);
    }
  });
}
