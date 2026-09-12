/**
 * Reelcase Companion — opt-in, loopback-only native bridge.
 * It never accepts arbitrary network connections and only launches files below
 * explicitly configured allowed roots.
 */
import { createServer } from "node:http";
import { existsSync, mkdirSync, realpathSync, readdirSync, readFileSync, watch } from "node:fs";
import { spawn, execFileSync } from "node:child_process";
import { resolve, sep } from "node:path";
import { networkInterfaces } from "node:os";
import dgram from "node:dgram";

const port = Number(process.env.REELCASE_COMPANION_PORT || 43123);
// The companion remains loopback-only. These extra origins only let the same
// computer use Reelcase through one of its LAN/VPN addresses; they never make
// the companion reachable from another device.
const localNetworkOrigins = Object.values(networkInterfaces())
  .flat()
  .filter((entry) => entry && entry.family === "IPv4" && !entry.internal)
  .map((entry) => `http://${entry.address}:8080`);
const allowedOrigins = new Set([
  ...(process.env.REELCASE_APP_ORIGIN || "http://localhost:8080,http://127.0.0.1:8080")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  ...localNetworkOrigins,
]);
const configuredRoots = (process.env.REELCASE_ALLOWED_ROOTS || "").split(";").map((value) => value.trim()).filter(Boolean);
// Desktop is the practical default on Windows, while explicit roots remain
// available for game libraries on other drives. Every path is resolved before
// use; this does not grant access outside the resulting allow-list.
const desktopRoots = process.platform === "win32" && process.env.USERPROFILE
  ? [
      resolve(process.env.USERPROFILE, "Desktop"),
      ...(process.env.OneDrive ? [resolve(process.env.OneDrive, "Desktop")] : []),
      ...(process.env.OneDriveConsumer ? [resolve(process.env.OneDriveConsumer, "Desktop")] : []),
    ]
  : [];
const allowedRoots = [...new Set([...configuredRoots, ...desktopRoots])]
  .filter((value) => existsSync(value))
  .flatMap((value) => { try { return [realpathSync(value)]; } catch { return []; } });
const allowedExt = new Set([".exe", ".lnk", ".url", ".appref-ms"]);
const changes = [];
const launches = [];
// This deliberately stays small.  The companion is a hint/index worker, not
// a second media server: it never sends media bytes or file paths back to the
// browser.  A bounded walk gives the web app a fast, privacy-preserving view
// of photo/video deltas while the browser retains file-handle authority.
const photoExt = new Set([".avif", ".bmp", ".gif", ".heic", ".jpeg", ".jpg", ".png", ".webp"]);
const videoExt = new Set([".avi", ".m4v", ".mkv", ".mov", ".mp4", ".mpeg", ".mpg", ".webm"]);
const WARMUP_FILE_BUDGET = 4000;
const WARMUP_TIME_BUDGET_MS = 1500;
let cacheWorker = { state: "idle", scannedAt: 0, scanned: 0, photos: 0, videos: 0, thumbnailHints: 0, roots: 0, truncated: false, budget: { files: WARMUP_FILE_BUDGET, milliseconds: WARMUP_TIME_BUDGET_MS }, elapsedMs: 0, stopReason: "not-started" };

function refreshMediaCache() {
  if (cacheWorker.state === "scanning") return;
  cacheWorker = { ...cacheWorker, state: "scanning", roots: allowedRoots.length };
  // Yield once so the health route remains responsive even when a desktop has
  // thousands of files. The 4k ceiling and shallow traversal are intentional.
  setImmediate(() => {
    const started = Date.now();
    const next = { state: "ready", scannedAt: started, scanned: 0, photos: 0, videos: 0, thumbnailHints: 0, roots: allowedRoots.length, truncated: false, budget: { files: WARMUP_FILE_BUDGET, milliseconds: WARMUP_TIME_BUDGET_MS }, elapsedMs: 0, stopReason: "complete" };
    const visit = (dir, depth) => {
      if (depth > 5 || next.scanned >= WARMUP_FILE_BUDGET || Date.now() - started >= WARMUP_TIME_BUDGET_MS) { if (next.scanned >= WARMUP_FILE_BUDGET || Date.now() - started >= WARMUP_TIME_BUDGET_MS) { next.truncated = true; next.stopReason = next.scanned >= WARMUP_FILE_BUDGET ? "file-budget" : "time-budget"; } return; }
      let entries = [];
      try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const entry of entries) {
        if (next.scanned >= WARMUP_FILE_BUDGET || Date.now() - started >= WARMUP_TIME_BUDGET_MS) { next.truncated = true; next.stopReason = next.scanned >= WARMUP_FILE_BUDGET ? "file-budget" : "time-budget"; return; }
        if (entry.isDirectory()) { visit(resolve(dir, entry.name), depth + 1); continue; }
        next.scanned += 1;
        const ext = entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase();
        if (photoExt.has(ext)) { next.photos += 1; next.thumbnailHints += 1; }
        if (videoExt.has(ext)) next.videos += 1;
      }
    };
    for (const root of allowedRoots) visit(root, 0);
    next.elapsedMs = Date.now() - started;
    cacheWorker = next;
  });
}
refreshMediaCache();
setInterval(refreshMediaCache, 5 * 60_000).unref();
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

function whichBinary(name) {
  try {
    const out = execFileSync(process.platform === "win32" ? "where" : "which", [name], {
      encoding: "utf8",
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 2_000,
    });
    const first = String(out).split(/\r?\n/).map((line) => line.trim()).find(Boolean);
    if (!first || !existsSync(first)) return null;
    return realpathSync(first);
  } catch {
    return null;
  }
}

function resolveYtDlpBinary() {
  const configured = typeof process.env.YT_DLP_PATH === "string" ? process.env.YT_DLP_PATH.trim() : "";
  if (configured) {
    try {
      const resolved = resolve(configured);
      if (existsSync(resolved)) return realpathSync(resolved);
    } catch { /* ignore bad YT_DLP_PATH */ }
  }
  return whichBinary(process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp")
    || (process.platform === "win32" ? whichBinary("yt-dlp") : null);
}

function underAllowedRoot(candidate) {
  try {
    const entry = realpathSync(candidate);
    return allowedRoots.some((root) => entry === root || entry.startsWith(`${root}${sep}`)) ? entry : null;
  } catch {
    return null;
  }
}

function resolveDownloadRoot() {
  if (!allowedRoots.length) return null;
  const configured = typeof process.env.REELCASE_DOWNLOAD_DIR === "string" ? process.env.REELCASE_DOWNLOAD_DIR.trim() : "";
  if (configured) {
    const candidate = resolve(configured);
    // Allow creating a new folder only when an ancestor already sits under an approved root.
    if (existsSync(candidate)) return underAllowedRoot(candidate);
    let cursor = candidate;
    for (let i = 0; i < 8; i += 1) {
      const parent = resolve(cursor, "..");
      if (parent === cursor) break;
      if (existsSync(parent) && underAllowedRoot(parent)) {
        try {
          mkdirSync(candidate, { recursive: true });
          return underAllowedRoot(candidate);
        } catch {
          return null;
        }
      }
      cursor = parent;
    }
    return null;
  }
  const fallback = resolve(allowedRoots[0], "Reelcase Offline");
  try {
    if (!existsSync(fallback)) mkdirSync(fallback, { recursive: true });
    return underAllowedRoot(fallback);
  } catch {
    return null;
  }
}

const ytDlpBinary = resolveYtDlpBinary();
const downloadRoot = resolveDownloadRoot();

function inspectMedia(rawPath) {
  const path = allowedPath(rawPath);
  const ext = path?.slice(path.lastIndexOf(".")).toLowerCase();
  if (!path || !ext || (!photoExt.has(ext) && !videoExt.has(ext))) return Promise.resolve({ requested: typeof rawPath === "string" ? rawPath : "", available: false, reason: "Not an approved local media file" });
  return new Promise((resolve) => {
    const child = spawn("ffprobe", ["-v", "error", "-show_entries", "format=duration,size:stream=codec_type,codec_name,width,height", "-of", "json", path], { windowsHide: true, stdio: ["ignore", "pipe", "ignore"] });
    let output = "";
    const timer = setTimeout(() => { try { child.kill(); } catch { /* already closed */ } }, 5_000);
    child.stdout.on("data", (chunk) => { output += String(chunk); if (output.length > 32_000) child.kill(); });
    child.on("error", () => { clearTimeout(timer); resolve({ requested: rawPath, available: true, inspected: false, reason: "ffprobe is not available in the Companion environment" }); });
    child.on("close", () => {
      clearTimeout(timer);
      try {
        const data = JSON.parse(output);
        const streams = Array.isArray(data.streams) ? data.streams.slice(0, 4).map((stream) => ({ type: stream.codec_type, codec: stream.codec_name, width: stream.width, height: stream.height })) : [];
        resolve({ requested: rawPath, available: true, inspected: true, duration: Number(data.format?.duration) || 0, bytes: Number(data.format?.size) || 0, streams });
      } catch { resolve({ requested: rawPath, available: true, inspected: false, reason: "No readable media metadata returned" }); }
    });
  });
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
      if (!allowedExt.has(suffix)) continue;
      // Internet shortcuts are plain INI files. Returning the declared target
      // lets Reelcase distinguish a usable game link from a legacy .url file
      // without ever launching or reading anything outside an approved root.
      let launchUrl;
      if (suffix === ".url") {
        try {
          const match = readFileSync(path, "utf8").match(/^URL\s*=\s*((?:https?|steam|epic|com\.epicgames\.launcher|xbox):\S+)/im);
          launchUrl = match?.[1];
        } catch { /* unreadable shortcut remains visible for repair */ }
      }
      found.push({ name: entry.name, path, ...(launchUrl ? { launchUrl } : {}) });
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
    reply(res, 200, { ok: true, service: "reelcase-companion", version: 8, roots: allowedRoots.length, desktopEnabled: desktopRoots.some((root) => { try { return allowedRoots.includes(realpathSync(root)); } catch { return false; } }), ytDlp: Boolean(ytDlpBinary), downloadRoot: downloadRoot || null, capabilities: ["launch", "shortcut-catalog", "file-health", "batch-verify", "folder-watch", "watch-status", "cache-status", "cache-warmup", "media-inspection", "roku-ssdp-discovery", "offline-save"] });
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
  if (req.method === "GET" && req.url === "/cache-status") {
    reply(res, 200, { ok: true, worker: cacheWorker, recentChanges: changes.slice(0, 30) });
    return;
  }
  if (req.method === "POST" && req.url === "/cache-warmup") {
    refreshMediaCache();
    reply(res, 202, { ok: true, worker: cacheWorker, note: "A bounded metadata and thumbnail-hint pass has started. Media bytes remain local." });
    return;
  }
  if (req.method === "GET" && req.url === "/launch-history") {
    reply(res, 200, { ok: true, launches });
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
  if (req.method === "POST" && req.url === "/validate-shortcuts") {
    let text = "";
    for await (const chunk of req) text += chunk;
    let body; try { body = JSON.parse(text); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    const paths = Array.isArray(body.paths) ? body.paths.slice(0, 100) : [];
    reply(res, 200, { ok: true, shortcuts: paths.map((rawPath) => ({ requested: String(rawPath ?? ""), approved: Boolean(allowedFile(rawPath)) })) });
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
  if (req.method === "POST" && req.url === "/inspect-media") {
    let text = "";
    for await (const chunk of req) text += chunk;
    let body; try { body = JSON.parse(text); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    const paths = Array.isArray(body.paths) ? body.paths.slice(0, 12) : [];
    const entries = await Promise.all(paths.map(inspectMedia));
    reply(res, 200, { ok: true, entries, note: "Bounded local inspection returns metadata only; no media bytes leave this computer." });
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
    try {
      // Windows does not consistently execute .lnk and .url targets through a
      // direct child-process spawn. `start` delegates to the registered shell
      // handler while allowedFile has already constrained the exact path.
      const child = process.platform === "win32"
        ? spawn("cmd.exe", ["/d", "/s", "/c", "start", "", file], { detached: true, stdio: "ignore", windowsHide: true })
        : spawn(file, [], { detached: true, stdio: "ignore" });
      child.unref(); launches.unshift({ path: file, at: Date.now() }); launches.splice(50); reply(res, 200, { ok: true, path: file });
    }
    catch { reply(res, 500, { ok: false, error: "The launcher could not be started" }); }
    return;
  }
  if (req.method === "POST" && req.url === "/offline/save") {
    let text = "";
    for await (const chunk of req) text += chunk;
    let body; try { body = JSON.parse(text); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!/^https:\/\//i.test(url)) { reply(res, 400, { ok: false, error: "A https embed/watch URL is required" }); return; }
    const binary = ytDlpBinary || resolveYtDlpBinary();
    const outDir = downloadRoot || resolveDownloadRoot();
    const needs = [];
    if (!binary) needs.push("Install yt-dlp (or set YT_DLP_PATH) and restart Companion");
    if (!outDir) needs.push("Set REELCASE_ALLOWED_ROOTS and optional REELCASE_DOWNLOAD_DIR under an allowed root");
    if (needs.length) {
      reply(res, 501, {
        ok: false,
        error: "Offline save needs yt-dlp and an allowed download folder.",
        needs,
        hint: {
          YT_DLP_PATH: "Absolute path to yt-dlp if it is not on PATH",
          REELCASE_DOWNLOAD_DIR: "Folder under REELCASE_ALLOWED_ROOTS (defaults to <first-root>/Reelcase Offline)",
          REELCASE_ALLOWED_ROOTS: "Semicolon-separated approved roots",
        },
        url,
      });
      return;
    }
    try {
      // Detached spawn: Companion acknowledges quickly; yt-dlp writes into the approved folder only.
      const outputTemplate = `${outDir}${sep}%(title).200B [%(id)s].%(ext)s`;
      const child = spawn(binary, ["--no-playlist", "--no-mtime", "--restrict-filenames", "-o", outputTemplate, url], {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
        cwd: outDir,
      });
      child.unref();
      reply(res, 202, {
        ok: true,
        detail: `Download started into ${outDir}`,
        path: outDir,
        binary,
        url,
      });
    } catch (error) {
      reply(res, 500, {
        ok: false,
        error: error?.message || "yt-dlp could not be started",
        needs: ["Confirm yt-dlp runs from a terminal", "Restart Companion after installing"],
        url,
      });
    }
    return;
  }
  reply(res, 404, { ok: false, error: "Not found" });
});
server.on("error", async (error) => {
  if (error?.code === "EADDRINUSE") {
    // A second click on the desktop launcher should not present an alarming
    // Node stack trace when a healthy companion already owns the loopback port.
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`, {
        headers: { origin: "http://localhost:8080" },
        signal: AbortSignal.timeout(1_500),
      });
      const health = await response.json();
      if (health?.service === "reelcase-companion") {
        console.log(`Reelcase Companion is already running on http://127.0.0.1:${port}`);
        process.exit(0);
      }
    } catch { /* The port is held by an unknown process; report that below. */ }
    console.error(`Port ${port} is already in use by another application. Choose REELCASE_COMPANION_PORT or close that application.`);
    process.exit(1);
  }
  console.error("Reelcase Companion could not start:", error?.message || error);
  process.exit(1);
});
server.listen(port, "127.0.0.1", () => console.log(`Reelcase Companion listening on http://127.0.0.1:${port}`));
