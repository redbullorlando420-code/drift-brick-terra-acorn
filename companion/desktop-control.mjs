/** Local OS IPC only: no browser route, port scan, or remote shutdown endpoint. */
import net from "node:net";
import { createHash, randomUUID } from "node:crypto";
import { realpathSync } from "node:fs";
import { join } from "node:path";

export function controlAddress(root, service = "companion") {
  const key = createHash("sha256")
    .update(realpathSync(root).toLowerCase() + ":" + service)
    .digest("hex")
    .slice(0, 32);
  return process.platform === "win32"
    ? "\\\\.\\pipe\\realhub-" + key
    : join(root, ".grok", "control-" + key + ".sock");
}
export async function serveDesktopControl({ root, service = "companion", stop }) {
  const instance = randomUUID();
  let stopping = false;
  const server = net.createServer((socket) => {
    let input = "";
    socket.setEncoding("utf8");
    socket.setTimeout(2000, () => socket.destroy());
    socket.on("error", () => {});
    socket.on("data", (chunk) => {
      input += chunk;
      if (input.length > 2048) return socket.destroy();
      if (!input.includes("\n")) return;
      socket.removeAllListeners("data");
      try {
        const value = JSON.parse(input.trim());
        if (value.schema !== 1 || !["status", "stop"].includes(value.action))
          return socket.end('{"ok":false}\n');
        if (value.action === "stop" && (value.instance !== instance || value.pid !== process.pid))
          return socket.end('{"ok":false}\n');
        socket.end(
          JSON.stringify({
            ok: true,
            schema: 1,
            service,
            pid: process.pid,
            instance,
            stopping: stopping || value.action === "stop",
          }) + "\n",
          () => {
            if (value.action === "stop" && !stopping) {
              stopping = true;
              Promise.resolve()
                .then(stop)
                .catch((error) => console.error("Local shutdown failed:", error.message));
            }
          },
        );
      } catch {
        socket.end('{"ok":false}\n');
      }
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(controlAddress(root, service), resolve);
  });
  server.on("error", (error) => console.error("Desktop control unavailable:", error.message));
  server.unref();
  return () => server.close();
}
export function requestDesktopControl(root, service, request, timeout = 2500) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(controlAddress(root, service));
    let input = "";
    socket.setEncoding("utf8");
    socket.setTimeout(timeout, () => socket.destroy(new Error("Local control timed out.")));
    socket.on("error", reject);
    socket.on("connect", () => socket.write(JSON.stringify({ schema: 1, ...request }) + "\n"));
    socket.on("data", (chunk) => {
      input += chunk;
      if (input.length > 2048) socket.destroy(new Error("Unexpected local response."));
    });
    socket.on("end", () => {
      try {
        const value = JSON.parse(input);
        if (
          value.ok !== true ||
          value.schema !== 1 ||
          value.service !== service ||
          !Number.isSafeInteger(value.pid) ||
          typeof value.instance !== "string"
        )
          throw Error("Incompatible local control.");
        resolve(value);
      } catch (error) {
        reject(error);
      }
    });
  });
}
