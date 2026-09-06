/**
 * Reelcase Companion — opt-in, loopback-only native bridge.
 * It never accepts arbitrary network connections and only launches files below
 * explicitly configured allowed roots.
 */
import { createServer } from "node:http";
import { existsSync, realpathSync, readdirSync, watch } from "node:fs";
import { spawn } from "node:child_process";
import { resolve, sep } from "node:path";
import dgram from "node:dgram";

const port = Number(process.env.REELCASE_COMPANION_PORT || 43123);
const allowedOrigins = new Set((process.env.REELCASE_APP_ORIGIN || "http://localhost:8080,http://127.0.0.1:8080").split(",").map((value) => value.trim()));
const configuredRoots = (process.env.REELCASE_ALLOWED_ROOTS || "").split(";").map((value) => value.trim()).filter(Boolean);
// Desktop is the practical default on Windows, while explicit roots remain
// available for game libraries on other drives. Every path is resolved before
// use; this does not grant access outside the resulting allow-list.
const desktopRoot = process.platform === "win32" && process.env.USERPROFILE
  ? resolve(process.env.USERPROFILE, "Desktop")
  : "";
const allowedRoots = [...new Set([...configuredRoots, ...(desktopRoot ? [desktopRoot] : [])])]
  .filter((value) => existsSync(value))
  .flatMap((value) => { try { return [realpathSync(value)]; } catch { return []; } });
const allowedExt = new Set([".exe", ".lnk", ".url", ".appref-ms"]);
const changes = [];
for (const root of allowedRoots) {
  try {
    watch(root, { recursive: true }, (kind, file) => {
      changes.unshift({ kind, path: file || "", at: Date.now() });
      changes.splice(100);
    });
  } catch { /* a root may not support recursive watches */ }
}

function reply(res, status, body) {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}
function cors(req, res) {
  const origin = req.headers.origin;
  if (!origin || !allowedOrigins.has(origin)) return false;
  res.setHeader("access-control-allow-origin", origin);
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
  return true;
}
function allowedFile(rawPath) {
  if (typeof rawPath !== "string" || !rawPath) return null;
  const candidate = resolve(rawPath);
  if (!existsSync(candidate)) return null;
  const file = realpathSync(candidate);
  const suffix = file.slice(file.lastIndexOf(".")).toLowerCase();
  if (!allowedExt.has(suffix)) return null;
  return allowedRoots.some((root) => file === root || file.startsWith(`${root}${sep}`)) ? file : null;
}
function allowedPath(rawPath) {
  if (typeof rawPath !== "string" || !rawPath) return null;
  const candidate = resolve(rawPath);
  if (!existsSync(candidate)) return null;
  try {
    const entry = realpathSync(candidate);
    return allowedRoots.some((root) => entry === root || entry.startsWith(`${root}${sep}`)) ? entry : null;
  } catch { return null; }
}
function listApprovedShortcuts(limit = 250) {
  const found = [];
  const visit = (dir, depth) => {
    if (depth > 4 || found.length >= limit) return;
    let entries = [];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (found.length >= limit) return;
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) { visit(path, depth + 1); continue; }
      const suffix = entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase();
      if (allowedExt.has(suffix)) found.push({ name: entry.name, path });
    }
  };
  for (const root of allowedRoots) visit(root, 0);
  return found;
}
function discoverRoku() {
  return new Promise((resolve) => {
    const socket = dgram.createSocket("udp4");
    const devices = new Map();
    const query = ["M-SEARCH * HTTP/1.1", "HOST: 239.255.255.250:1900", "MAN: \"ssdp:discover\"", "MX: 1", "ST: roku:ecp", "", ""].join("\r\n");
    socket.on("message", (msg, peer) => {
      const text = msg.toString();
      if (!/roku/i.test(text)) return;
      const location = text.match(/^location:\s*(.+)$/im)?.[1]?.trim() || `http://${peer.address}:8060/`;
      devices.set(peer.address, { address: peer.address, location });
    });
    socket.bind(() => socket.send(query, 1900, "239.255.255.250"));
    setTimeout(() => { socket.close(); resolve([...devices.values()]); }, 1600);
  });
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") { cors(req, res); res.writeHead(204); res.end(); return; }
  if (!cors(req, res)) { reply(res, 403, { ok: false, error: "Untrusted origin" }); return; }
  if (req.method === "GET" && req.url === "/health") {
    reply(res, 200, { ok: true, service: "reelcase-companion", version: 4, roots: allowedRoots.length, desktopEnabled: desktopRoot ? allowedRoots.includes(realpathSync(desktopRoot)) : false, capabilities: ["launch", "shortcut-catalog", "file-health", "batch-verify", "folder-watch", "watch-status", "roku-ssdp-discovery"] });
    return;
  }
  if (req.method === "GET" && req.url === "/source-health") {
    reply(res, 200, { ok: true, roots: allowedRoots.map((path) => ({ path, available: existsSync(path) })), recentChanges: changes });
    return;
  }
  if (req.method === "GET" && req.url === "/watch-status") {
    reply(res, 200, { ok: true, watching: allowedRoots.map((path) => ({ path, active: existsSync(path) })), recentChanges: changes.slice(0, 30) });
    return;
  }
  if (req.method === "GET" && req.url?.startsWith("/shortcuts")) {
    const requested = Number(new URL(req.url, "http://127.0.0.1").searchParams.get("limit") ?? "250");
    const limit = Number.isFinite(requested) ? Math.max(1, Math.min(500, Math.floor(requested))) : 250;
    reply(res, 200, { ok: true, shortcuts: listApprovedShortcuts(limit) });
    return;
  }
  if (req.method === "GET" && req.url?.startsWith("/file-health")) {
    const rawPath = new URL(req.url, "http://127.0.0.1").searchParams.get("path") ?? "";
    const path = allowedPath(rawPath);
    reply(res, 200, { ok: true, available: Boolean(path), path: path ?? null });
    return;
  }
  if (req.method === "POST" && req.url === "/verify") {
    let text = "";
    for await (const chunk of req) text += chunk;
    let body; try { body = JSON.parse(text); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    const paths = Array.isArray(body.paths) ? body.paths.slice(0, 100) : [];
    const entries = paths.map((rawPath) => {
      const path = allowedPath(rawPath);
      return { requested: typeof rawPath === "string" ? rawPath : "", available: Boolean(path), path: path ?? null };
    });
    reply(res, 200, { ok: true, entries });
    return;
  }
  if (req.method === "GET" && req.url === "/roku/discover") {
    reply(res, 200, { ok: true, devices: await discoverRoku() });
    return;
  }
  if (req.method === "POST" && req.url === "/launch") {
    let text = "";
    for await (const chunk of req) text += chunk;
    let body; try { body = JSON.parse(text); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    const file = allowedFile(body.path);
    if (!file) { reply(res, 400, { ok: false, error: "File is missing, unsupported, or outside an allowed root" }); return; }
    try { spawn(file, [], { detached: true, stdio: "ignore", windowsHide: true }).unref(); reply(res, 200, { ok: true, path: file }); }
    catch { reply(res, 500, { ok: false, error: "The launcher could not be started" }); }
    return;
  }
  reply(res, 404, { ok: false, error: "Not found" });
});
server.listen(port, "127.0.0.1", () => console.log(`Reelcase Companion listening on http://127.0.0.1:${port}`));
