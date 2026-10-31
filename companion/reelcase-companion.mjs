import {createCapabilityConsent} from './capability-consent.mjs';
import {serveDesktopControl} from './desktop-control.mjs';
import {platformContract,supportedCapabilities,platformActionIssue,configuredRootPaths} from './platform-contract.mjs';
import {createPrintTransactions,createNewPrintFile} from './print-transactions.mjs';
import {createLaunchManager} from './launch-manager.mjs';
import {approvedProcess} from './guarded-process.mjs';
import {createRootAuthority} from './root-authority.mjs';
import { createStudioModels } from './studio-models.mjs';
/**
 * Realhub Companion — opt-in, loopback-only native bridge.
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
import { fileURLToPath } from 'node:url';
import { randomUUID, createHash } from 'node:crypto';
import { createDownloadManager, youtubeWatchUrl, youtubeBrowserAuth } from './download-manager.mjs';
import { serveDownloadMedia } from './download-media.mjs';
import { createCreativeTools } from './creative-tools.mjs';
const artworkAudit = createArtworkAudit();
const companionDir = fileURLToPath(new URL('.', import.meta.url));
const permissions=createCapabilityConsent({file:join(companionDir,'.local-capability-consent.json')});
const studioModels = createStudioModels({ dir: companionDir, permissions });
const creativeTools = createCreativeTools({ dir: companionDir, models: studioModels });
let youtubeConfig = {};
try { youtubeConfig = JSON.parse(readFileSync(join(companionDir, '.local-youtube-dl.json'), 'utf8')); } catch { /* Optional operator-run setup. */ }

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
const configuredRoots = configuredRootPaths(process.env.REELCASE_ALLOWED_ROOTS,process.platform);
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
const rootAuthority = createRootAuthority([...configuredRoots,...desktopRoots,...(typeof youtubeConfig.downloadRoot === 'string' ? [youtubeConfig.downloadRoot] : [])],{policyFile:join(companionDir,'.local-root-policy.json')});
const allowedRoots = rootAuthority.activePaths();
rootAuthority.subscribe(()=>allowedRoots.splice(0,allowedRoots.length,...rootAuthority.activePaths()));
const allowedExt = new Set([".exe", ".lnk", ".url", ".appref-ms"]);
const changes = [];
const launchManager=createLaunchManager({authority:rootAuthority,receiptFile:join(companionDir,'.local-launch-receipts.json')});
// This deliberately stays small.  The companion is a hint/index worker, not
// a general media server: only completed downloader jobs have a media route.
// A bounded walk gives the web app a fast, privacy-preserving view
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
      if (!underAllowedRoot(dir)) return;
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
const rootWatchers=new Map();
function syncRootWatchers(){
 for(const [root,watcher]of rootWatchers)if(!underAllowedRoot(root)){watcher.close();rootWatchers.delete(root);}
 for(const root of allowedRoots)if(!rootWatchers.has(root)&&underAllowedRoot(root))try{rootWatchers.set(root,watch(root,{recursive:true},(kind,file)=>{if(!underAllowedRoot(root))return;changes.unshift({kind,path:file||'',at:Date.now()});changes.splice(100);}));}catch{}
}
syncRootWatchers();rootAuthority.subscribe(()=>{changes.length=0;syncRootWatchers();});

function reply(res, status, body) {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}
function cors(req, res) {
  const origin = req.headers.origin;
  if (!origin || !allowedOrigins.has(origin)) return false;
  res.setHeader("access-control-allow-origin", origin);
  res.setHeader("access-control-allow-methods", "GET, HEAD, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, range");
  return true;
}
function allowedFile(rawPath) { const file=rootAuthority.check(rawPath);return file&&allowedExt.has(file.slice(file.lastIndexOf('.')).toLowerCase())?file:null;}
function allowedPath(rawPath) {return rootAuthority.check(rawPath);}

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
  const bundled = join(companionDir, 'tools', process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
  if (existsSync(bundled)) return realpathSync(bundled);
  return whichBinary(process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp")
    || (process.platform === "win32" ? whichBinary("yt-dlp") : null);
}

function resolveYoutubeDlBinary() {
  const configured = process.env.YOUTUBE_DL_PATH?.trim();
  for (const path of [configured, join(companionDir, 'tools', process.platform === 'win32' ? 'youtube-dl.exe' : 'youtube-dl')]) {
    try { if (path && existsSync(path)) return realpathSync(path); } catch { /* Try the next operator-configured location. */ }
  }
  return whichBinary(process.platform === 'win32' ? 'youtube-dl.exe' : 'youtube-dl');
}
const youtubeDlBinary = resolveYoutubeDlBinary();
let youtubeDlVersion = null;
if (youtubeDlBinary) try { youtubeDlVersion = execFileSync(youtubeDlBinary, ['--ignore-config', '--version'], { encoding: 'utf8', windowsHide: true, timeout: 5000 }).trim().slice(0, 80); } catch { /* Shown as unconfigured when the binary cannot run. */ }

function underAllowedRoot(candidate) {return rootAuthority.check(candidate);}

function resolveDownloadRoot(create = true) {
  if (!allowedRoots.length) return null;
  const configured = typeof process.env.REELCASE_DOWNLOAD_DIR === "string" ? process.env.REELCASE_DOWNLOAD_DIR.trim() : (typeof youtubeConfig.downloadRoot === 'string' ? youtubeConfig.downloadRoot : "");
  if (configured) {
    const candidate = resolve(configured);
    // Allow creating a new folder only when an ancestor already sits under an approved root.
    if (existsSync(candidate)) return underAllowedRoot(candidate);
    if (!create) return null;
    let cursor = candidate;
    for (let i = 0; i < 8; i += 1) {
      const parent = resolve(cursor, "..");
      if (parent === cursor) break;
      if (existsSync(parent) && underAllowedRoot(parent)) {
        try {
          rootAuthority.ensureDirectory(candidate);
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
    if (!existsSync(fallback)) { if (!create) return null; rootAuthority.ensureDirectory(fallback); }
    return underAllowedRoot(fallback);
  } catch {
    return null;
  }
}

const ytDlpBinary = resolveYtDlpBinary();
let ytDlpVersion = null;
if (ytDlpBinary) try { ytDlpVersion = execFileSync(ytDlpBinary, ['--ignore-config', '--version'], { encoding: 'utf8', windowsHide: true, timeout: 5000 }).trim().slice(0, 80); } catch { /* Shown as unconfigured. */ }
let downloadRoot = resolveDownloadRoot();

function embeddedMediaText(value) {
  if (typeof value !== "string") return "";
  // Embedded tags are untrusted file metadata. Keep the reply compact and
  // display-safe; the browser gets values only for an explicit local preview.
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
}

async function inspectMedia(rawPath) {
  const path = allowedPath(rawPath);
  const ext = path?.slice(path.lastIndexOf(".")).toLowerCase();
  if (!path || !ext || (!photoExt.has(ext) && !videoExt.has(ext))) return Promise.resolve({ requested: typeof rawPath === "string" ? rawPath : "", available: false, reason: "Not an approved local media file" });
  try {
    const output=await approvedProcess(rootAuthority,path,'ffprobe',['-v','error','-show_entries','format=duration,size:format_tags=title,artist,album,genre,date,comment:stream=codec_type,codec_name,width,height','-of','json',path]);
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
        return { requested: rawPath, available: true, inspected: true, duration: Number(data.format?.duration) || 0, bytes: Number(data.format?.size) || 0, streams, ...(Object.keys(tags).length ? { tags } : {}) };
  }catch(error){return {requested:rawPath,available:Boolean(allowedPath(rawPath)),inspected:false,reason:error.code==='ROOT_ACCESS_DENIED'?'Folder access changed.':'No readable metadata returned or ffprobe is unavailable.'};}
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
    return underAllowedRoot(entry);
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
  const bytes = rootAuthority.read(filePath);
  if (bytes.length > 1_500_000) return null;
  const suffix = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  const mime = suffix === ".png" ? "image/png"
    : suffix === ".jpg" || suffix === ".jpeg" ? "image/jpeg"
    : suffix === ".webp" ? "image/webp"
    : suffix === ".ico" ? "image/x-icon"
    : "application/octet-stream";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

async function extractAssociatedIconDataUrl(filePath) {
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
    const out = await approvedProcess(rootAuthority,filePath,'powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{timeoutMs:8000,maxBytes:2_000_000});
    const b64 = String(out).trim().replace(/\s+/g, "");
    if (!b64 || b64.length < 32 || b64.length > 1_800_000) return null;
    return `data:image/png;base64,${b64}`;
  } catch {
    return null;
  }
}

async function resolveShortcutIcon(rawPath) {
  const file = allowedFile(rawPath);
  if (!file) return { ok: false, error: "Path is outside approved roots or not a shortcut/exe." };
  if (iconCache.has(file)) return { ok: true, path: file, iconData: iconCache.get(file), cached: true };
  let iconData = null;
  const sibling = findSiblingIconPath(file);
  if (sibling) iconData = dataUrlFromFile(sibling);
  if (!iconData) iconData = await extractAssociatedIconDataUrl(file);
  if(!allowedFile(file))return {ok:false,error:"Folder access changed."};
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
    if (!underAllowedRoot(dir)) return;
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
          const match = rootAuthority.read(path, "utf8").match(/^URL\s*=\s*((?:https?|steam|epic|com\.epicgames\.launcher|xbox):\S+)/im);
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

function resolveDataDir(folderName, envKey, create = true) {
  if (!allowedRoots.length) return null;
  const configured = typeof process.env[envKey] === "string" ? process.env[envKey].trim() : "";
  if (configured) {
    const candidate = resolve(configured);
    if (existsSync(candidate)) return underAllowedRoot(candidate);
    if (!create) return null;
    let cursor = candidate;
    for (let i = 0; i < 8; i += 1) {
      const parent = resolve(cursor, "..");
      if (parent === cursor) break;
      if (existsSync(parent) && underAllowedRoot(parent)) {
        try {
          rootAuthority.ensureDirectory(candidate);
          return underAllowedRoot(candidate);
        } catch { return null; }
      }
      cursor = parent;
    }
    return null;
  }
  const fallback = resolve(allowedRoots[0], folderName);
  try {
    if (!existsSync(fallback)) {
      if (!create) return null;
      rootAuthority.ensureDirectory(fallback);
    }
    return underAllowedRoot(fallback);
  } catch { return null; }
}

function resolveLibraryPackRoot(create = true) {
  return resolveDataDir("Reelcase Library Pack", "REELCASE_LIBRARY_PACK_DIR", create);
}

function resolveThumbCacheRoot(create = true) {
  return resolveDataDir(join("Reelcase Cache", "thumbs"), "REELCASE_THUMB_CACHE_DIR", create);
}

function resolvePrintsRoot(create = true) {
  return resolveDataDir("Reelcase Prints", "REELCASE_PRINTS_DIR", create);
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
    if (!underAllowedRoot(dir)) return;
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
    rootAuthority.ensureDirectory(dirname(target));
    rootAuthority.write(target, content, "utf8");
    written.push(rel);
  }
  return { ok: true, root, written };
}

function readLibraryPackFiles() {
  const root = resolveLibraryPackRoot();
  if (!root || !existsSync(root)) return { ok: false, error: "Library pack folder missing.", files: {} };
  const files = {};let totalBytes=0;
  const visit = (dir, relBase, depth=0) => {
    if(depth>6||Object.keys(files).length>=128||totalBytes>=32*1024*1024)return;
    let entries = [];
    if (!underAllowedRoot(dir)) return;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) { visit(path, rel, depth+1); continue; }
      if (!/\.(csv|json|md|txt)$/i.test(entry.name)) continue;
      try {
        if(!underAllowedRoot(path)||statSync(path).size>8_000_000)continue;
        const text = rootAuthority.read(path, "utf8");totalBytes+=Buffer.byteLength(text);
        if(totalBytes>32*1024*1024)break;
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
  rootAuthority.write(target, Buffer.from(match[2], "base64"));
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
      const bytes = rootAuthority.read(target);
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
  const access=rootAuthority.lease(root);
  try {
    const response = await fetch(url, {
      signal: AbortSignal.any([AbortSignal.timeout(12_000),access.signal]),
      headers: { accept: "image/*,*/*;q=0.8", "user-agent": "RealhubCompanion/10" },
    });
    if (!response.ok) return { ok: false, error: `Upstream HTTP ${response.status}` };
    const mime = String(response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (mime && !mime.startsWith("image/")) return { ok: false, error: "Not an image response." };
    const chunks=[];let received=0;const reader=response.body?.getReader();if(!reader)throw Error("No image body.");try{for(;;){const part=await reader.read();access.assert();if(part.done)break;received+=part.value.length;if(received>2_000_000)throw Error("Image size rejected.");chunks.push(part.value);}}finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
    const buf = Buffer.concat(chunks);
    access.assert();
    if (buf.length < 32 || buf.length > 2_000_000) return { ok: false, error: "Image size rejected." };
    const ext = mime.includes("png") ? ".png" : mime.includes("webp") ? ".webp" : mime.includes("gif") ? ".gif" : ".jpg";
    const target = resolve(root, `${key}${ext}`);
    if (!target.startsWith(root + sep)) return { ok: false, error: "Path rejected." };
    // Drop older extensions for the same id.
    for (const oldExt of [".jpg", ".jpeg", ".png", ".webp", ".gif"]) {
      const old = resolve(root, `${key}${oldExt}`);
      if (old !== target && existsSync(old)) {
        try { access.assert(old); unlinkSync(old); } catch { /* ignore */ }
      }
    }
    rootAuthority.write(target, buf);
    return { ok: true, path: target, id: key, bytes: buf.length };
  } catch (error) {
    return { ok: false, error: error?.message || "Thumb fetch failed." };
  } finally {access.release();}
}

function readPrintFile(rawPath) {
  const path = allowedPath(rawPath);
  if (!path) return { ok: false, error: "Path outside approved roots." };
  const suffix = path.slice(path.lastIndexOf(".")).toLowerCase();
  if (!printExt.has(suffix)) return { ok: false, error: "Not a supported print format." };
  let size = 0;
  try { size = statSync(path).size; } catch { return { ok: false, error: "Unreadable file." }; }
  if (size <= 0 || size > 48 * 1024 * 1024) return { ok: false, error: "Print file too large (48MB cap)." };
  const bytes = rootAuthority.read(path);
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
  createNewPrintFile(rootAuthority,target,buf);
  return { ok: true, path: target, name, size: buf.length };
}

function setAutostart(enabled) {
  if (process.platform !== "win32") {
    return { ok: false, error: "Auto-start is implemented for Windows Companion only." };
  }
  const scriptPath = resolve(process.cwd(), "companion", "Start-Realhub-Companion.cmd");
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
  const safeTitle = String(title || "Realhub").replace(/'/g, "''").slice(0, 60);
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
      job.status === "done" ? "Realhub download ready" : "Realhub download issue",
      job.detail || job.url || "",
    );
  }
}

const printTransactions=createPrintTransactions({authority:rootAuthority,receiptFile:join(companionDir,'.local-print-transactions.json'),defaultDirectory:()=>resolvePrintsRoot(false)});
let downloads = createDownloadManager({ root: downloadRoot, approveRoot: underAllowedRoot, rootAuthority, authorizeSession:()=>permissions.acquire('provider-session'), onSettled: rememberJob });
rootAuthority.subscribe(()=>{if(!downloadRoot){const candidate=resolveDownloadRoot(false);if(candidate){downloadRoot=candidate;downloads=createDownloadManager({root:downloadRoot,approveRoot:underAllowedRoot,rootAuthority,authorizeSession:()=>permissions.acquire('provider-session'),onSettled:rememberJob});}}});
let stoppingDesktop = false;
async function shutdownDesktop() {
 if (stoppingDesktop) return;
 stoppingDesktop = true;
 permissions.close(); studioModels.shutdown(); downloads.shutdown(); launchManager.shutdown(); printTransactions.shutdown(); rootAuthority.close(); server.close();
 await Promise.race([creativeTools.shutdown(),new Promise(resolve=>setTimeout(resolve,5500))]); process.exit(0);
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, shutdownDesktop);
function youtubeDownloadState() {
  const folderReady = Boolean(downloadRoot && underAllowedRoot(downloadRoot));
  return { ok: true, configured: Boolean((ytDlpVersion || youtubeDlVersion) && folderReady),
    engine: ytDlpVersion ? 'yt-dlp' : 'youtube-dl', version: ytDlpVersion || youtubeDlVersion,
    browserAuth: Boolean(ytDlpVersion && folderReady), localPlayback: true, taskRecovery:true, diskPreflight:true, downloadBudget:downloads.budget(), recovery:downloads.recovery(),
    path: downloadRoot, jobs: downloads.list().filter(job => job.source === 'youtube'),
    needs: [!ytDlpVersion && 'Run Setup-YouTube-Downloads.cmd and restart Companion to enable yt-dlp browser sign-in.', !downloadRoot && 'Choose an approved download folder in Companion.'].filter(Boolean) };
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") { cors(req, res); res.writeHead(204); res.end(); return; }
  if (!cors(req, res)) { reply(res, 403, { ok: false, error: "Untrusted origin" }); return; }
  try {
  const localBodyLimit=req.url==='/prints/save'?72*1024*1024:req.url==='/library-pack/export'?32*1024*1024:4*1024*1024;
  const requestGeneration=rootAuthority.generation();
  const permissionRevision=permissions.snapshot().revision;
  const ensureRequestAccess=()=>rootAuthority.assertGeneration(requestGeneration);
  const platformIssue=platformActionIssue(req.url||'',process.platform);if(platformIssue){reply(res,501,{ok:false,error:platformIssue,code:'UNSUPPORTED_PLATFORM'});return;}
  if (req.method === 'GET' && req.url==='/permissions') { reply(res,200,{ok:true,...permissions.snapshot()});return; }
  if(req.method==='POST'&&req.url==='/permissions/change'){let text='';for await(const chunk of req){text+=chunk;if(text.length>2048)throw Error('Permission request too large.');}const body=JSON.parse(text);reply(res,200,{ok:true,...permissions.change(body.scope,body.revision,body.allowed)});return;}
  if (req.method === 'POST' && req.url?.startsWith('/studio/models/upload?')) { await studioModels.upload(req, res); return; }
  if (req.url?.startsWith('/studio/') || req.url?.startsWith('/remote/')) {
    try {
      let text = ''; if (req.method === 'POST') req.setEncoding('utf8'); if (req.method === 'POST') for await (const chunk of req) { text += chunk; if (text.length > 12000) throw new Error('Request too large.'); }
      if(req.url==='/studio/models/install'||/^\/studio\/models\/transfers\/.+\/(resume|fresh)$/.test(req.url??''))permissions.assertRevision(permissionRevision);
      const result = await creativeTools(req.url, req.method, text ? JSON.parse(text) : {}, req.headers.origin);
      reply(res, result ? 200 : 404, result || { ok: false, error: 'Action not found.' });
    } catch (cause) { reply(res, 400, { ok: false, error: cause.message || 'Local service failed.' }); }
    return;
  }
  if (req.method === "GET" && req.url === "/health") {
    const rootState=rootAuthority.snapshot();
    reply(res, 200, { ok: true, service: "reelcase-companion", version: 19, permissions:permissions.snapshot(), platform:platformContract(process.platform),protocol:{major:1,minor:0}, inspection:{schema:1,configurationRef:createHash('sha256').update(JSON.stringify({roots:allowedRoots,downloads:downloadRoot,artwork:process.env.REELCASE_THUMB_CACHE_DIR||null,prints:process.env.REELCASE_PRINTS_DIR||null,libraryPack:process.env.REELCASE_LIBRARY_PACK_DIR||null})).digest('hex'),tools:{ytDlp:ytDlpVersion,youtubeDl:youtubeDlVersion},destinations:{downloads:Boolean(downloadRoot&&underAllowedRoot(downloadRoot)),artwork:Boolean(resolveThumbCacheRoot(false)),prints:Boolean(resolvePrintsRoot(false)),libraryPack:Boolean(resolveLibraryPackRoot(false))}}, roots: allowedRoots.length, desktopEnabled: desktopRoots.some((root) => { try { return allowedRoots.includes(realpathSync(root)); } catch { return false; } }), youtubeDl: Boolean(youtubeDlVersion), ytDlp: Boolean(ytDlpBinary), downloadRoot: downloadRoot || null, libraryPackRoot: resolveLibraryPackRoot(false), thumbCacheRoot: resolveThumbCacheRoot(false), printsRoot: resolvePrintsRoot(false), trayBadge, rootAccess:{generation:rootState.generation,active:rootState.active}, capabilities: supportedCapabilities(["model-transfer-recovery", "remote-launch-safeguards", "capability-consent", "print-save-transaction", "platform-contract", "tray-notifications", "download-preflight", "launch-receipts", "root-access", "task-receipts", "artwork-audit", "studio-models", "qwen-image-2.1", "launch", "shortcut-catalog", "shortcut-icons", "file-health", "batch-verify", "folder-watch", "watch-status", "cache-status", "cache-warmup", "media-inspection", "roku-ssdp-discovery", "offline-save", "youtube-downloads", "steam-epic-catalog", "library-pack-disk", "thumb-disk-cache", "thumb-cache-url", "prints-bridge", "tray-autostart", "job-badge"],process.platform) });
    return;
  }
  if(req.method==='GET'&&req.url==='/prints/save-folders'){reply(res,200,{ok:true,folders:printTransactions.folders()});return;}
  if(req.method==='POST'&&req.url==='/prints/transactions/review'){let text='';for await(const chunk of req){text+=chunk;if(text.length>8192)throw Error('Print review is too large.');}ensureRequestAccess();reply(res,200,{ok:true,receipt:printTransactions.prepare(JSON.parse(text))});return;}
  const printAction=req.url?.match(/^\/prints\/transactions\/([a-f0-9-]{36})(?:\/(commit|cancel))?$/);
  if(printAction){const [,id,action]=printAction;if(req.method==='GET'&&!action){reply(res,200,{ok:true,receipt:await printTransactions.status(id)});return;}if(req.method==='POST'&&action==='commit'){ensureRequestAccess();const receipt=await printTransactions.commit(id,req);reply(res,200,{ok:true,receipt});return;}if(req.method==='POST'&&action==='cancel'){ensureRequestAccess();reply(res,200,{ok:true,receipt:printTransactions.cancel(id)});return;}reply(res,405,{ok:false,error:'Unsupported print save action.'});return;}
  if (req.method === 'GET' && req.url === '/tasks') { reply(res,200,{ok:true,jobs:downloads.list(),recovery:downloads.recovery()});return; }
  if (req.method === 'POST' && /^\/tasks\/[\w-]+\/(cancel|resume)$/.test(req.url??'')) {
    try { const [, , id, action]=req.url.split('/');const saved=downloads.list().find(job=>job.id===id);if(!saved)throw Error('Job receipt not found.');
      if(action==='cancel'){reply(res,200,{ok:true,job:downloads.cancel(id)});return;}
      const binary=saved.source==='youtube'?(ytDlpVersion?ytDlpBinary:youtubeDlBinary):ytDlpBinary;if(!binary)throw Error('Configure the appropriate downloader before resuming.');
      reply(res,200,{ok:true,job:downloads.resume(id,{binary,engine:saved.source==='youtube'&&!ytDlpVersion?'youtube-dl':'yt-dlp',browser:'none'})});
    }catch(error){reply(res,400,{ok:false,error:error.message||'Job recovery failed.'});}return;
  }
  if (req.method === 'GET' && req.url === '/youtube/downloads') { reply(res, 200, youtubeDownloadState()); return; }
  if ((req.method === 'GET' || req.method === 'HEAD') && /^\/youtube\/downloads\/[\w-]+\/media$/.test(req.url ?? '')) {
    serveDownloadMedia(req, res, downloads.media(req.url.split('/')[3]),{authority:rootAuthority}); return;
  }
  if (req.method === 'POST' && req.url?.startsWith('/youtube/downloads')) {
    try {
      const cancel = req.url.match(/^\/youtube\/downloads\/([\w-]+)\/cancel$/);
      const resume = req.url.match(/^\/youtube\/downloads\/([\w-]+)\/resume$/);
      if (cancel) { reply(res, 200, { ok: true, job: downloads.cancel(cancel[1]) }); return; }
      if (req.url !== '/youtube/downloads' && !resume) { reply(res, 404, { ok: false, error: 'Download action not found.' }); return; }
      let textBody = '';
      for await (const chunk of req) { textBody += chunk; if (textBody.length > 8192) { reply(res, 413, { ok: false, error: 'Download request is too large.' }); return; } }
      ensureRequestAccess();const body = JSON.parse(textBody), url = youtubeWatchUrl(body.videoId);
      const browser = youtubeBrowserAuth(body), state = youtubeDownloadState();if(browser!=='none')permissions.assertRevision(permissionRevision);
      if (!state.configured || browser !== 'none' && !state.browserAuth) { reply(res, 503, { ...state, ok: false, error: browser !== 'none' ? 'Browser sign-in needs yt-dlp and an approved download folder. Run Setup-YouTube-Downloads.cmd, then restart Companion.' : 'A YouTube downloader is not configured on this computer.' }); return; }
      if(resume){const saved=downloads.list().find(job=>job.id===resume[1]&&job.source==='youtube'&&job.key===body.videoId);if(!saved)throw Error('Download receipt does not match this video.');reply(res,202,{ok:true,job:downloads.resume(resume[1],{binary:ytDlpVersion?ytDlpBinary:youtubeDlBinary,engine:state.engine,browser})});return;}
      const job = downloads.enqueue({ key: body.videoId, url, title: body.title, forceNew:body.forceNew===true,
        binary: ytDlpVersion ? ytDlpBinary : youtubeDlBinary, engine: state.engine, browser, estimatedBytes:body.estimatedBytes });
      reply(res, 202, { ok: true, job });
    } catch (error) { reply(res, 400, { ok: false, error: error.message || 'Invalid download request.' }); }
    return;
  }
  if(req.method==='GET'&&req.url==='/roots/status'){reply(res,200,{ok:true,...rootAuthority.snapshot()});return;}
  if(req.method==='POST'&&req.url==='/roots/change'){let text='';for await(const chunk of req){text+=chunk;if(text.length>4096)throw Error('Request too large.');}const body=JSON.parse(text);const snapshot=rootAuthority.change(body.id,body.revision,body.enabled);reply(res,200,{ok:true,...snapshot});return;}
  if (req.method === "GET" && req.url === "/source-health") {
    rootAuthority.snapshot();
    reply(res, 200, { ok: true, roots: allowedRoots.map((path) => ({ path, available: existsSync(path) })), recentChanges: changes });
    return;
  }
  if (req.method === "GET" && req.url === "/watch-status") {
    rootAuthority.snapshot();
    reply(res, 200, { ok: true, watching: allowedRoots.map((path) => ({ path, active: rootWatchers.has(path) && Boolean(underAllowedRoot(path)) })), recentChanges: changes.slice(0, 30) });
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
  if (req.method === "GET" && (req.url === "/launch-history" || req.url==="/launch-receipts")) {
    reply(res, 200, { ok: true, ...launchManager.history(), launches:launchManager.history().receipts });
    return;
  }
  if (req.method === "GET" && req.url?.startsWith("/shortcut-icon")) {
    const rawPath = new URL(req.url, "http://127.0.0.1").searchParams.get("path") ?? "";
    const result = await resolveShortcutIcon(rawPath);
    reply(res, result.ok ? 200 : 400, result);
    return;
  }
  if (req.method === "POST" && req.url === "/shortcut-icons") {
    let textBody = "";
    for await (const chunk of req) {textBody += chunk;if(textBody.length>localBodyLimit){reply(res,413,{ok:false,error:"Request exceeds the local transfer budget."});return;}}
    ensureRequestAccess();
    let body; try { body = JSON.parse(textBody); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    const paths = Array.isArray(body.paths) ? body.paths.slice(0, 40) : [];
    const icons=[];for(const rawPath of paths){
      const result = await resolveShortcutIcon(String(rawPath ?? ""));
      icons.push({ path: String(rawPath ?? ""), ok: Boolean(result.ok), iconData: result.iconData ?? null, note: result.note, error: result.error });
    }
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
    for await (const chunk of req) {text += chunk;if(text.length>localBodyLimit){reply(res,413,{ok:false,error:"Request exceeds the local transfer budget."});return;}}
    ensureRequestAccess();
    ensureRequestAccess();let body; try { body = JSON.parse(text); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    const paths = Array.isArray(body.paths) ? body.paths.slice(0, 100) : [];
    reply(res, 200, { ok: true, shortcuts: paths.map((rawPath) => ({ requested: String(rawPath ?? ""), approved: Boolean(allowedFile(rawPath)) })) });
    return;
  }
  if (req.method === "POST" && req.url === "/verify") {
    let text = "";
    for await (const chunk of req) {text += chunk;if(text.length>localBodyLimit){reply(res,413,{ok:false,error:"Request exceeds the local transfer budget."});return;}}
    ensureRequestAccess();
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
    for await (const chunk of req) {text += chunk;if(text.length>localBodyLimit){reply(res,413,{ok:false,error:"Request exceeds the local transfer budget."});return;}}
    ensureRequestAccess();
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
    for await (const chunk of req) {text += chunk;if(text.length>localBodyLimit){reply(res,413,{ok:false,error:"Request exceeds the local transfer budget."});return;}}
    ensureRequestAccess();
    let body; try { body = JSON.parse(text); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    try {const receipt=await launchManager.launch(body.path);reply(res,receipt.status==='failed'?400:200,{ok:receipt.status==='accepted',receipt,error:receipt.status==='accepted'?undefined:receipt.detail});}
    catch(error){reply(res,400,{ok:false,error:error.message});}
    return;
  }
  if (req.method === "POST" && req.url === "/offline/save") {
    let text = "";
    for await (const chunk of req) {text += chunk;if(text.length>localBodyLimit){reply(res,413,{ok:false,error:"Request exceeds the local transfer budget."});return;}}
    ensureRequestAccess();
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
      const job = downloads.enqueue({ key: createHash('sha256').update(url).digest('hex').slice(0,64), url, title: 'Offline video', binary, source: 'offline', engine: 'yt-dlp' });
      rememberJob(job);
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
    for await (const chunk of req) {textBody += chunk;if(textBody.length>localBodyLimit){reply(res,413,{ok:false,error:"Request exceeds the local transfer budget."});return;}}
    ensureRequestAccess();
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
    for await (const chunk of req) {textBody += chunk;if(textBody.length>localBodyLimit){reply(res,413,{ok:false,error:"Request exceeds the local transfer budget."});return;}}
    ensureRequestAccess();
    let body; try { body = JSON.parse(textBody); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    reply(res, 200, putThumbCache(body.id, body.dataUrl));
    return;
  }
  if (req.method === "POST" && req.url === "/thumbs/cache-url") {
    let textBody = "";
    for await (const chunk of req) {textBody += chunk;if(textBody.length>localBodyLimit){reply(res,413,{ok:false,error:"Request exceeds the local transfer budget."});return;}}
    ensureRequestAccess();
    let body; try { body = JSON.parse(textBody); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    reply(res, 200, await cacheRemoteThumb(body.id, body.url));
    return;
  }
  if (req.method === "GET" && req.url === "/thumbs/audit") {
    const root = resolveThumbCacheRoot();
    if (!root) { reply(res, 200, { ok: false, error: "No approved thumb cache folder." }); return; }
    try { reply(res, 200, await artworkAudit.scan(root,{authority:rootAuthority})); }
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
    for await (const chunk of req) {textBody += chunk;if(textBody.length>localBodyLimit){reply(res,413,{ok:false,error:"Request exceeds the local transfer budget."});return;}}
    ensureRequestAccess();
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
    for await (const chunk of req) {textBody += chunk;if(textBody.length>localBodyLimit){reply(res,413,{ok:false,error:"Request exceeds the local transfer budget."});return;}}
    ensureRequestAccess();
    let body; try { body = JSON.parse(textBody); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    reply(res, 200, setAutostart(Boolean(body.enabled)));
    return;
  }
  if (req.method === "POST" && req.url === "/tray/notify") {
    let textBody = "";
    for await (const chunk of req) {textBody += chunk;if(textBody.length>localBodyLimit){reply(res,413,{ok:false,error:"Request exceeds the local transfer budget."});return;}}
    ensureRequestAccess();
    let body; try { body = JSON.parse(textBody); } catch { reply(res, 400, { ok: false, error: "Invalid request" }); return; }
    const sent = notifyTray(body.title, body.body);
    reply(res, 200, { ok: sent, platform: process.platform });
    return;
  }
  reply(res, 404, { ok: false, error: "Not found" });
  } catch(error) {if(!res.headersSent)reply(res,error?.code==='ROOT_ACCESS_DENIED'?403:error?.code==='ROOT_POLICY_SAVE'?503:400,{ok:false,error:['ROOT_ACCESS_DENIED','ROOT_POLICY_SAVE'].includes(error?.code)?error.message:'Local operation failed. Check folder access and retry.'});else res.destroy();}
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
        console.log(`Realhub Companion is already running on http://127.0.0.1:${port}`);
        process.exit(0);
      }
    } catch { /* The port is held by an unknown process; report that below. */ }
    console.error(`Port ${port} is already in use by another application. Choose REELCASE_COMPANION_PORT or close that application.`);
    process.exit(1);
  }
  console.error("Realhub Companion could not start:", error?.message || error);
  process.exit(1);
});
server.listen(port, "127.0.0.1", () => {
 console.log(`Realhub Companion listening on http://127.0.0.1:${port}`);
 if(process.platform==='win32' && port===43123) void serveDesktopControl({root:resolve(companionDir,'..'),stop:shutdownDesktop}).catch(error=>console.error('Desktop stop control unavailable:',error.message));
});
