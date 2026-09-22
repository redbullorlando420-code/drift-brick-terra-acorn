/**
 * Reelcase Companion — opt-in, loopback-only native bridge.
 * It never accepts arbitrary network connections and only launches files below
 * explicitly configured allowed roots.
 */
import { createServer } from "node:http";
import { existsSync, mkdirSync, realpathSync, readdirSync, readFileSync, writeFileSync, unlinkSync, statSync, watch } from "node:fs";
import { spawn, execFileSync } from "node:child_process";
import { resolve, sep, dirname, basename, join } from "node:path";
import { networkInterfaces } from "node:os";
import dgram from "node:dgram";
import { createArtworkAudit } from "./artwork-audit.mjs";
const artworkAudit = createArtworkAudit();

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

function embeddedMediaText(value) {
  if (typeof value !== "string") return "";
  // Embedded tags are untrusted file metadata. Keep the reply compact and
  // display-safe; the browser gets values only for an explicit local preview.
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
}

function inspectMedia(rawPath) {
  const path = allowedPath(rawPath);
  const ext = path?.slice(path.lastIndexOf(".")).toLowerCase();
  if (!path || !ext || (!photoExt.has(ext) && !videoExt.has(ext))) return Promise.resolve({ requested: typeof rawPath === "string" ? rawPath : "", available: false, reason: "Not an approved local media file" });
  return new Promise((resolve) => {
    const child = spawn("ffprobe", ["-v", "error", "-show_entries", "format=duration,size:format_tags=title,artist,album,genre,date,comment:stream=codec_type,codec_name,width,height", "-of", "json", path], { windowsHide: true, stdio: ["ignore", "pipe", "ignore"] });
    let output = "";
    const timer = setTimeout(() => { try { child.kill(); } catch { /* already closed */ } }, 5_000);
    child.stdout.on("data", (chunk) => { output += String(chunk); if (output.length > 32_000) child.kill(); });
    child.on("error", () => { clearTimeout(timer); resolve({ requested: rawPath, available: true, inspected: false, reason: "ffprobe is not available in the Companion environment" }); });
    child.on("close", () => {
      clearTimeout(timer);
      try {
        const data = JSON.parse(output);
        const streams = Array.isArray(data.streams) ? data.streams.slice(0, 4).map((stream) => ({ type: stream.codec_type, codec: stream.codec_name, width: stream.width, height: stream.height })) : [];
        const formatTags = Object.fromEntries(
          Object.entries(data.format?.tags && typeof data.format.tags === "object" ? data.format.tags : {})
            .map(([key, value]) => [key.toLowerCase(), value]),
        );
        const tags = Object.fromEntries(
          ["title", "artist", "album", "genre", "date", "comment"].flatMap((key) => {
            const value = embeddedMediaText(formatTags[key]);
            return value ? [[key, value]] : [];
          }),
        );
        resolve({ requested: rawPath, available: true, inspected: true, duration: Number(data.format?.duration) || 0, bytes: Number(data.format?.size) || 0, streams, ...(Object.keys(tags).length ? { tags } : {}) });
      } catch { resolve({ requested: rawPath, available: true, inspected: false, reason: "No readable media metadata returned" }); }
    });
  });
}

const iconCache = new Map();
const ICON_CACHE_MAX = 120;
const siblingIconExt = [".png", ".ico", ".jpg", ".jpeg", ".webp"];

function allowedSiblingIcon(rawPath) {
  if (typeof rawPath !== "string" || !rawPath) return null;
  const candidate = resolve(rawPath);
  if (!existsSync(candidate)) return null;
  try {
    const entry = realpathSync(candidate);
    const suffix = entry.slice(entry.lastIndexOf(".")).toLowerCase();
    if (!siblingIconExt.includes(suffix)) return null;
    return allowedRoots.some((root) => entry === root || entry.startsWith(`${root}${sep}`)) ? entry : null;
  } catch { return null; }
}

function findSiblingIconPath(filePath) {
  const dir = dirname(filePath);
  const stem = basename(filePath).replace(/\.[^.]+$/, "");
  for (const ext of siblingIconExt) {
    const candidate = join(dir, `${stem}${ext}`);
    const allowed = allowedSiblingIcon(candidate);
    if (allowed) return allowed;
  }
  // Steam-style / folder art common neighbors
  for (const name of ["icon.png", "icon.ico", "game.png", "header.jpg", "library_600x900.jpg"]) {
    const candidate = join(dir, name);
    const allowed = allowedSiblingIcon(candidate);
    if (allowed) return allowed;
  }
  return null;
}

function dataUrlFromFile(filePath) {
  const bytes = readFileSync(filePath);
  if (bytes.length > 1_500_000) return null;
  const suffix = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  const mime = suffix === ".png" ? "image/png"
    : suffix === ".jpg" || suffix === ".jpeg" ? "image/jpeg"
    : suffix === ".webp" ? "image/webp"
    : suffix === ".ico" ? "image/x-icon"
    : "application/octet-stream";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

function extractAssociatedIconDataUrl(filePath) {
  if (process.platform !== "win32") return null;
  // PowerShell + System.Drawing extracts the shell-associated icon for .exe/.lnk.
  const script = [
    "Add-Type -AssemblyName System.Drawing",
    "$ErrorActionPreference = 'Stop'",
    `$p = '${filePath.replace(/'/g, "''")}'`,
    "$icon = [System.Drawing.Icon]::ExtractAssociatedIcon($p)",
    "if (-not $icon) { exit 2 }",
    "$bmp = $icon.ToBitmap()",
    "$ms = New-Object System.IO.MemoryStream",
    "$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)",
    "[Convert]::ToBase64String($ms.ToArray())",
  ].join("; ");
  try {
    const out = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
      encoding: "utf8",
      windowsHide: true,
      timeout: 8_000,
      maxBuffer: 2_000_000,
      stdio: ["ignore", "pipe", "ignore"],
    });
    const b64 = String(out).trim().replace(/\s+/g, "");
    if (!b64 || b64.length < 32 || b64.length > 1_800_000) return null;
    return `data:image/png;base64,${b64}`;
  } catch {
    return null;
  }
}

function resolveShortcutIcon(rawPath) {
  const file = allowedFile(rawPath);
  if (!file) return { ok: false, error: "Path is outside approved roots or not a shortcut/exe." };
  if (iconCache.has(file)) return { ok: true, path: file, iconData: iconCache.get(file), cached: true };
  let iconData = null;
  const sibling = findSiblingIconPath(file);
  if (sibling) iconData = dataUrlFromFile(sibling);
  if (!iconData) iconData = extractAssociatedIconDataUrl(file);
  if (!iconData) return { ok: true, path: file, iconData: null, note: "No sibling image or extractable icon." };
  iconCache.set(file, iconData);
  if (iconCache.size > ICON_CACHE_MAX) {
    const first = iconCache.keys().next().value;
    iconCache.delete(first);
  }
  return { ok: true, path: file, iconData, cached: false };
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


const printExt = new Set([".stl", ".obj", ".glb", ".gltf", ".3mf", ".gcode"]);
const offlineJobs = [];
let trayBadge = 0;
let trayProcess = null;

function resolveDataDir(folderName, envKey) {
  if (!allowedRoots.length) return null;
  const configured = typeof process.env[envKey] === "string" ? process.env[envKey].trim() : "";
  if (configured) {
    const candidate = resolve(configured);
    if (existsSync(candidate)) return underAllowedRoot(candidate);
    let cursor = candidate;
    for (let i = 0; i < 8; i += 1) {
      const parent = resolve(cursor, "..");
      if (parent === cursor) break;
      if (existsSync(parent) && underAllowedRoot(parent)) {
        try {
          mkdirSync(candidate, { recursive: true });
          return underAllowedRoot(candidate);
        } catch { return null; }
      }
      cursor = parent;
    }
    return null;
  }
  const fallback = resolve(allowedRoots[0], folderName);
  try {
    if (!existsSync(fallback)) mkdirSync(fallback, { recursive: true });
    return underAllowedRoot(fallback);
  } catch { return null; }
}

function resolveLibraryPackRoot() {
  return resolveDataDir("Reelcase Library Pack", "REELCASE_LIBRARY_PACK_DIR");
}

function resolveThumbCacheRoot() {
  return resolveDataDir(join("Reelcase Cache", "thumbs"), "REELCASE_THUMB_CACHE_DIR");
}

function resolvePrintsRoot() {
  return resolveDataDir("Reelcase Prints", "REELCASE_PRINTS_DIR");
}

function safeCacheKey(id) {
  return String(id || "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 180);
}

function discoverSteamEpicGames(limit = 250) {
  const found = [];
  const seen = new Set();
  const pushGame = (entry) => {
    if (!entry?.path || seen.has(entry.path) || found.length >= limit) return;
    seen.add(entry.path);
    found.push(entry);
  };
  const visitCommon = (commonDir, platform) => {
    if (!existsSync(commonDir) || !underAllowedRoot(commonDir)) return;
    let entries = [];
    try { entries = readdirSync(commonDir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (found.length >= limit) return;
      if (!entry.isDirectory()) continue;
      const gameDir = resolve(commonDir, entry.name);
      if (!underAllowedRoot(gameDir)) continue;
      let launchPath = null;
      let iconPath = null;
      try {
        const children = readdirSync(gameDir, { withFileTypes: true });
        for (const child of children) {
          const childPath = resolve(gameDir, child.name);
          const suffix = child.name.slice(child.name.lastIndexOf(".")).toLowerCase();
          if (!launchPath && child.isFile() && allowedExt.has(suffix)) launchPath = childPath;
          if (!iconPath && child.isFile() && siblingIconExt.includes(suffix) && /^(icon|game|header|cover|logo|library_600x900)/i.test(child.name.replace(/\.[^.]+$/, ""))) {
            iconPath = childPath;
          }
        }
        if (!iconPath) {
          for (const name of ["icon.png", "icon.ico", "game.png", "header.jpg", "library_600x900.jpg"]) {
            const candidate = join(gameDir, name);
            if (allowedSiblingIcon(candidate)) { iconPath = candidate; break; }
          }
        }
      } catch { /* unreadable game folder */ }
      pushGame({
        name: entry.name,
        path: launchPath || gameDir,
        folder: gameDir,
        platform,
        iconPath: iconPath || undefined,
      });
    }
  };
  const visitEpicRoot = (epicRoot) => {
    if (!existsSync(epicRoot) || !underAllowedRoot(epicRoot)) return;
    let entries = [];
    try { entries = readdirSync(epicRoot, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (found.length >= limit) return;
      if (!entry.isDirectory()) continue;
      if (/^(Launcher|Epic Games Launcher|DirectX|Redistributables)$/i.test(entry.name)) continue;
      const gameDir = resolve(epicRoot, entry.name);
      if (!underAllowedRoot(gameDir)) continue;
      let launchPath = null;
      try {
        const children = readdirSync(gameDir, { withFileTypes: true });
        for (const child of children) {
          if (!child.isFile()) continue;
          const suffix = child.name.slice(child.name.lastIndexOf(".")).toLowerCase();
          if (allowedExt.has(suffix)) { launchPath = resolve(gameDir, child.name); break; }
        }
      } catch { /* ignore */ }
      pushGame({
        name: entry.name,
        path: launchPath || gameDir,
        folder: gameDir,
        platform: "epic",
      });
    }
  };

  // Known relative layouts only — never walk the whole disk.
  const steamRelatives = [
    join("steamapps", "common"),
    join("Steam", "steamapps", "common"),
    join("Program Files (x86)", "Steam", "steamapps", "common"),
    join("Program Files", "Steam", "steamapps", "common"),
  ];
  const epicRelatives = [
    "Epic Games",
    join("Program Files", "Epic Games"),
    join("Epic Games", "Games"),
  ];
  for (const root of allowedRoots) {
    for (const rel of steamRelatives) {
      visitCommon(resolve(root, rel), "steam");
      if (found.length >= limit) return found;
    }
    // If the allowed root *is* steamapps/common (or its parent), still catalog.
    if (/steamapps[\\/]+common$/i.test(root)) visitCommon(root, "steam");
    for (const rel of epicRelatives) {
      visitEpicRoot(resolve(root, rel));
      if (found.length >= limit) return found;
    }
    if (/Epic Games$/i.test(basename(root))) visitEpicRoot(root);
  }
  return found;
}

function listPrintFiles(limit = 200) {
  const found = [];
  const roots = [...allowedRoots];
  const printsRoot = resolvePrintsRoot();
  if (printsRoot && !roots.includes(printsRoot)) roots.unshift(printsRoot);
  const visit = (dir, depth) => {
    if (depth > 5 || found.length >= limit) return;
    let entries = [];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (found.length >= limit) return;
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (/^(node_modules|\.git|Windows|System32)$/i.test(entry.name)) continue;
        visit(path, depth + 1);
        continue;
      }
      const suffix = entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase();
      if (!printExt.has(suffix)) continue;
      if (!underAllowedRoot(path)) continue;
      let size = 0;
      try { size = statSync(path).size; } catch { continue; }
      if (size <= 0 || size > 64 * 1024 * 1024) continue;
      found.push({ name: entry.name, path, size, suffix });
    }
  };
  for (const root of roots) visit(root, 0);
  return found;
}

function writeLibraryPackFiles(files) {
  const root = resolveLibraryPackRoot();
  if (!root) return { ok: false, error: "No approved library-pack folder. Set REELCASE_ALLOWED_ROOTS / REELCASE_LIBRARY_PACK_DIR." };
  if (!files || typeof files !== "object") return { ok: false, error: "Expected files map." };
  const written = [];
  for (const [relRaw, content] of Object.entries(files)) {
    const rel = String(relRaw || "").replace(/\\/g, "/").replace(/^\/+/, "");
    if (!rel || rel.includes("..") || rel.length > 240) continue;
    if (typeof content !== "string") continue;
    if (content.length > 8_000_000) continue;
    const target = resolve(root, rel);
    if (!target.startsWith(root + sep) && target !== root) continue;
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, "utf8");
    written.push(rel);
  }
  return { ok: true, root, written };
}

function readLibraryPackFiles() {
  const root = resolveLibraryPackRoot();
  if (!root || !existsSync(root)) return { ok: false, error: "Library pack folder missing.", files: {} };
  const files = {};
  const visit = (dir, relBase) => {
    let entries = [];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) { visit(path, rel); continue; }
      if (!/\.(csv|json|md|txt)$/i.test(entry.name)) continue;
      try {
        const text = readFileSync(path, "utf8");
        if (text.length <= 8_000_000) files[rel.replace(/\\/g, "/")] = text;
      } catch { /* skip */ }
    }
  };
  visit(root, "");
  return { ok: true, root, files };
}

function putThumbCache(id, dataUrl) {
  const root = resolveThumbCacheRoot();
  if (!root) return { ok: false, error: "No approved thumb cache folder." };
  const key = safeCacheKey(id);
  if (!key) return { ok: false, error: "Missing thumb id." };
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image")) return { ok: false, error: "Expected data:image URL." };
  if (dataUrl.length > 2_500_000) return { ok: false, error: "Thumb too large." };
  const match = dataUrl.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!match) return { ok: false, error: "Invalid data URL." };
  const ext = match[1].includes("png") ? ".png" : match[1].includes("webp") ? ".webp" : match[1].includes("gif") ? ".gif" : ".jpg";
  const target = resolve(root, `${key}${ext}`);
  if (!target.startsWith(root + sep)) return { ok: false, error: "Path rejected." };
  writeFileSync(target, Buffer.from(match[2], "base64"));
  return { ok: true, path: target, id: key };
}

function getThumbCache(id) {
  const root = resolveThumbCacheRoot();
  if (!root) return { ok: false, error: "No approved thumb cache folder." };
  const key = safeCacheKey(id);
  if (!key) return { ok: false, error: "Missing thumb id." };
  for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".gif"]) {
    const target = resolve(root, `${key}${ext}`);
    if (!existsSync(target)) continue;
    if (!underAllowedRoot(target)) continue;
    try {
      const bytes = readFileSync(target);
      if (bytes.length > 2_000_000) continue;
      const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg";
      return { ok: true, id: key, dataUrl: `data:${mime};base64,${bytes.toString("base64")}` };
    } catch { /* try next */ }
  }
  return { ok: false, error: "Thumb not cached." };
}


async function cacheRemoteThumb(id, url) {
  const root = resolveThumbCacheRoot();
  if (!root) return { ok: false, error: "No approved thumb cache folder." };
  const key = safeCacheKey(id);
  if (!key) return { ok: false, error: "Missing thumb id." };
  if (typeof url !== "string" || !/^https:\/\//i.test(url)) return { ok: false, error: "HTTPS image URL required." };
  if (url.length > 2_000) return { ok: false, error: "URL too long." };
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12_000),
      headers: { accept: "image/*,*/*;q=0.8", "user-agent": "ReelcaseCompanion/10" },
    });
    if (!response.ok) return { ok: false, error: `Upstream HTTP ${response.status}` };
    const mime = String(response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (mime && !mime.startsWith("image/")) return { ok: false, error: "Not an image response." };
    const buf = Buffer.from(await response.arrayBuffer());
    if (buf.length < 32 || buf.length > 2_000_000) return { ok: false, error: "Image size rejected." };
    const ext = mime.includes("png") ? ".png" : mime.includes("webp") ? ".webp" : mime.includes("gif") ? ".gif" : ".jpg";
    const target = resolve(root, `${key}${ext}`);
    if (!target.startsWith(root + sep)) return { ok: false, error: "Path rejected." };
    // Drop older extensions for the same id.
    for (const oldExt of [".jpg", ".jpeg", ".png", ".webp", ".gif"]) {
      const old = resolve(root, `${key}${oldExt}`);
      if (old !== target && existsSync(old)) {
        try { unlinkSync(old); } catch { /* ignore */ }
      }
    }
    writeFileSync(target, buf);
    return { ok: true, path: target, id: key, bytes: buf.length };
  } catch (error) {
    return { ok: false, error: error?.message || "Thumb fetch failed." };
  }
}

function readPrintFile(rawPath) {
  const path = allowedPath(rawPath);
  if (!path) return { ok: false, error: "Path outside approved roots." };
  const suffix = path.slice(path.lastIndexOf(".")).toLowerCase();
  if (!printExt.has(suffix)) return { ok: false, error: "Not a supported print format." };
  let size = 0;
  try { size = statSync(path).size; } catch { return { ok: false, error: "Unreadable file." }; }
  if (size <= 0 || size > 48 * 1024 * 1024) return { ok: false, error: "Print file too large (48MB cap)." };
  const bytes = readFileSync(path);
  return {
    ok: true,
    name: basename(path),
    path,
    size,
    mime: "application/octet-stream",
    dataBase64: bytes.toString("base64"),
  };
}

function savePrintFile(rawName, dataBase64, rawDir) {
  const printsRoot = resolvePrintsRoot();
  if (!printsRoot) return { ok: false, error: "No approved prints folder." };
  const name = basename(String(rawName || "")).replace(/[^\w.\- ()[\]]+/g, "_");
  if (!name || !printExt.has(name.slice(name.lastIndexOf(".")).toLowerCase())) {
    return { ok: false, error: "Unsupported print filename." };
  }
  if (typeof dataBase64 !== "string" || dataBase64.length < 8 || dataBase64.length > 70_000_000) {
    return { ok: false, error: "Invalid print payload." };
  }
  let dir = printsRoot;
  if (typeof rawDir === "string" && rawDir.trim()) {
    const candidate = allowedPath(rawDir.trim());
    if (!candidate) return { ok: false, error: "Target folder outside approved roots." };
    dir = candidate;
  }
  const target = resolve(dir, name);
  if (!underAllowedRoot(target) && !(existsSync(dirname(target)) && underAllowedRoot(dirname(target)))) {
    return { ok: false, error: "Target path rejected." };
  }
  const buf = Buffer.from(dataBase64, "base64");
  if (buf.length > 48 * 1024 * 1024) return { ok: false, error: "Print file too large." };
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, buf);
  return { ok: true, path: target, name, size: buf.length };
}

function setAutostart(enabled) {
  if (process.platform !== "win32") {
    return { ok: false, error: "Auto-start is implemented for Windows Companion only." };
  }
  const scriptPath = resolve(process.cwd(), "companion", "Start-Reelcase-Companion.cmd");
  const launch = existsSync(scriptPath) ? scriptPath : resolve(process.argv[1] || ".");
  const name = "ReelcaseCompanion";
  try {
    if (enabled) {
      execFileSync("reg", ["add", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", "/v", name, "/t", "REG_SZ", "/d", launch, "/f"], {
        windowsHide: true, stdio: ["ignore", "pipe", "ignore"], timeout: 4_000,
      });
    } else {
      execFileSync("reg", ["delete", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", "/v", name, "/f"], {
        windowsHide: true, stdio: ["ignore", "pipe", "ignore"], timeout: 4_000,
      });
    }
    return { ok: true, enabled: Boolean(enabled), launch };
  } catch (error) {
    return { ok: false, error: error?.message || "Could not update Windows auto-start." };
  }
}

function notifyTray(title, body) {
  if (process.platform !== "win32") return false;
  const safeTitle = String(title || "Reelcase").replace(/'/g, "''").slice(0, 60);
  const safeBody = String(body || "").replace(/'/g, "''").slice(0, 180);
  const script = [
    "Add-Type -AssemblyName System.Windows.Forms",
    "$n = New-Object System.Windows.Forms.NotifyIcon",
    "$n.Icon = [System.Drawing.SystemIcons]::Application",
    "$n.Visible = $true",
    `$n.ShowBalloonTip(4000, '${safeTitle}', '${safeBody}', [System.Windows.Forms.ToolTipIcon]::Info)`,
    "Start-Sleep -Milliseconds 4500",
    "$n.Dispose()",
  ].join("; ");
  try {
    spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {
      detached: true, stdio: "ignore", windowsHide: true,
    }).unref();
    return true;
  } catch { return false; }
}

function rememberJob(job) {
  offlineJobs.unshift({ ...job, at: Date.now() });
  offlineJobs.splice(40);
  if (job.status === "done" || job.status === "error") {
    trayBadge = Math.min(99, trayBadge + 1);
    notifyTray(
      job.status === "done" ? "Reelcase download ready" : "Reelcase download issue",
      job.detail || job.url || "",
    );
  }
}


const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") { cors(req, res); res.writeHead(204); res.end(); return; }
  if (!cors(req, res)) { reply(res, 403, { ok: false, error: "Untrusted origin" }); return; }
  if (req.method === "GET" && req.url === "/health") {
    reply(res, 200, { ok: true, service: "reelcase-companion", version: 10, roots: allowedRoots.length, desktopEnabled: desktopRoots.some((root) => { try { return allowedRoots.includes(realpathSync(root)); } catch { return false; } }), ytDlp: Boolean(ytDlpBinary), downloadRoot: downloadRoot || null, libraryPackRoot: resolveLibraryPackRoot(), thumbCacheRoot: resolveThumbCacheRoot(), printsRoot: resolvePrintsRoot(), trayBadge, capabilities: ["launch", "shortcut-catalog", "shortcut-icons", "file-health", "batch-verify", "folder-watch", "watch-status", "cache-status", "cache-warmup", "media-inspection", "roku-ssdp-discovery", "offline-save", "steam-epic-catalog", "library-pack-disk", "thumb-disk-cache", "thumb-cache-url", "prints-bridge", "tray-autostart", "job-badge"] });
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
  if (req.method === "GET" && req.url?.startsWith("/shortcut-icon")) {
    const rawPath = new URL(req.url, "http://127.0.0.1").searchParams.get("path") ?? "";
    const result = resolveShortcutIcon(rawPath);
    reply(res, result.ok ? 200 : 400, result);
    return;
  }
  if (req.method === "POST" && req.url === "/shortcut-icons") {
    let textBody = "";
    for await (const chunk of req) textBody += chunk;
    let body; try { body = JSON.parse(textBody); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    const paths = Array.isArray(body.paths) ? body.paths.slice(0, 40) : [];
    const icons = paths.map((rawPath) => {
      const result = resolveShortcutIcon(String(rawPath ?? ""));
      return { path: String(rawPath ?? ""), ok: Boolean(result.ok), iconData: result.iconData ?? null, note: result.note, error: result.error };
    });
    reply(res, 200, { ok: true, icons });
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
      const job = { id: `job-${Date.now()}`, status: "started", detail: `Download started into ${outDir}`, path: outDir, url };
      rememberJob(job);
      // Detached yt-dlp has no completion hook without wrapping — mark done shortly for tray badge UX.
      setTimeout(() => rememberJob({ ...job, status: "done", detail: `Offline save finished (check ${outDir})` }), 8_000);
      reply(res, 202, {
        ok: true,
        detail: job.detail,
        path: outDir,
        binary,
        url,
        jobId: job.id,
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
  if (req.method === "GET" && req.url?.startsWith("/games/steam-epic")) {
    const requested = Number(new URL(req.url, "http://127.0.0.1").searchParams.get("limit") ?? "250");
    const limit = Number.isFinite(requested) ? Math.max(1, Math.min(500, Math.floor(requested))) : 250;
    reply(res, 200, { ok: true, games: discoverSteamEpicGames(limit), note: "Known Steam/Epic install dirs under approved roots only — no broad disk scan." });
    return;
  }
  if (req.method === "POST" && req.url === "/library-pack/export") {
    let textBody = "";
    for await (const chunk of req) textBody += chunk;
    let body; try { body = JSON.parse(textBody); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    const result = writeLibraryPackFiles(body.files);
    reply(res, result.ok ? 200 : 400, result);
    return;
  }
  if (req.method === "GET" && req.url === "/library-pack/import") {
    reply(res, 200, readLibraryPackFiles());
    return;
  }
  if (req.method === "POST" && req.url === "/thumbs/put") {
    let textBody = "";
    for await (const chunk of req) textBody += chunk;
    let body; try { body = JSON.parse(textBody); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    reply(res, 200, putThumbCache(body.id, body.dataUrl));
    return;
  }
  if (req.method === "POST" && req.url === "/thumbs/cache-url") {
    let textBody = "";
    for await (const chunk of req) textBody += chunk;
    let body; try { body = JSON.parse(textBody); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    reply(res, 200, await cacheRemoteThumb(body.id, body.url));
    return;
  }
  if (req.method === "GET" && req.url === "/thumbs/audit") {
    const root = resolveThumbCacheRoot();
    if (!root) { reply(res, 200, { ok: false, error: "No approved thumb cache folder." }); return; }
    try { reply(res, 200, await artworkAudit.scan(root)); }
    catch { reply(res, 200, { ok: false, error: "Artwork cache could not be inspected." }); }
    return;
  }
  if (req.method === "GET" && req.url?.startsWith("/thumbs/get")) {
    const id = new URL(req.url, "http://127.0.0.1").searchParams.get("id") ?? "";
    const result = getThumbCache(id);
    // Count real disk lookups only; an unconfigured cache is unavailable, not a miss.
    if (result.ok || result.error === "Thumb not cached.") artworkAudit.record(id, result.ok);
    reply(res, result.ok ? 200 : 404, result);
    return;
  }
  if (req.method === "GET" && req.url?.startsWith("/prints/list")) {
    const requested = Number(new URL(req.url, "http://127.0.0.1").searchParams.get("limit") ?? "200");
    const limit = Number.isFinite(requested) ? Math.max(1, Math.min(400, Math.floor(requested))) : 200;
    reply(res, 200, { ok: true, prints: listPrintFiles(limit), printsRoot: resolvePrintsRoot() });
    return;
  }
  if (req.method === "GET" && req.url?.startsWith("/prints/file")) {
    const rawPath = new URL(req.url, "http://127.0.0.1").searchParams.get("path") ?? "";
    const result = readPrintFile(rawPath);
    reply(res, result.ok ? 200 : 400, result);
    return;
  }
  if (req.method === "POST" && req.url === "/prints/save") {
    let textBody = "";
    for await (const chunk of req) textBody += chunk;
    let body; try { body = JSON.parse(textBody); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    const result = savePrintFile(body.name, body.dataBase64, body.dir);
    reply(res, result.ok ? 200 : 400, result);
    return;
  }
  if (req.method === "GET" && req.url === "/jobs") {
    reply(res, 200, { ok: true, jobs: offlineJobs.slice(0, 20), trayBadge });
    return;
  }
  if (req.method === "POST" && req.url === "/jobs/ack") {
    trayBadge = 0;
    reply(res, 200, { ok: true, trayBadge: 0 });
    return;
  }
  if (req.method === "POST" && req.url === "/tray/autostart") {
    let textBody = "";
    for await (const chunk of req) textBody += chunk;
    let body; try { body = JSON.parse(textBody); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    reply(res, 200, setAutostart(Boolean(body.enabled)));
    return;
  }
  if (req.method === "POST" && req.url === "/tray/notify") {
    let textBody = "";
    for await (const chunk of req) textBody += chunk;
    let body; try { body = JSON.parse(textBody); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    const sent = notifyTray(body.title, body.body);
    reply(res, 200, { ok: sent, platform: process.platform });
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
