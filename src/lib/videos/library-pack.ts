/**
 * Folder-oriented local export/import pack for follows, history, links, marks,
 * ratings/hearts, and Adult stats. Browsers download a zip that mirrors the
 * documented folder layout under public/import-templates/.
 */
import { zipSync, unzipSync, strToU8, strFromU8 } from "fflate";
import { buildAdultStatsSnapshot, adultStatsToCsv, type AdultStatsSnapshot } from "./adult-stats";
import {
  saveFollows,
  saveDurableHistory,
  saveDurableResume,
  saveDurableMarks,
  saveDurableShelves,
  saveDurableLinks,
  type SavedVideoLink,
  type DurableFeedback,
  saveDurablePhotos,
  loadDurablePhotosSync,
  type DurablePhotoSource,
  type DurablePhotoMeta,
} from "./persist";
import type { FollowedChannel, HistoryEntry, LibraryVideo, Folder } from "./types";
import { exportFeedback, importFeedback } from "@/lib/media-feedback";

export const LIBRARY_PACK_VERSION = 1;
export const LIBRARY_PACK_ROOT = "reelcase-library-pack";

export type LibraryPackMode = "merge" | "replace-follows";

export type LibraryPackBuildInput = {
  follows: FollowedChannel[];
  history: HistoryEntry[];
  links: SavedVideoLink[];
  favorites: string[];
  likes: string[];
  viewCounts: Record<string, number>;
  cameCounts: Record<string, number>;
  progress: Record<string, { t: number; d: number; at: number }>;
  resumeProgress: Record<string, { t: number; d: number; at: number }>;
  adultVideos?: LibraryVideo[];
  folders?: Folder[];
  tags?: Record<string, string[]>;
  adultStats?: AdultStatsSnapshot;
  photoSources?: DurablePhotoSource[];
  photoMeta?: Record<string, DurablePhotoMeta>;
  photoLikes?: string[];
};

export type LibraryPackImportResult = {
  followsAdded: number;
  historyMerged: number;
  linksMerged: number;
  marksMerged: number;
  shelvesMerged: number;
  feedbackMerged: boolean;
  filesRead: string[];
  warnings: string[];
  photosMerged: number;
};

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

function quoteCsv(value: string | number | boolean | undefined | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function rowsToCsv(rows: Array<Array<string | number | boolean | undefined | null>>) {
  return rows.map((row) => row.map(quoteCsv).join(",")).join("\n");
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
      continue;
    }
    if (ch === '"') { inQuotes = true; continue; }
    if (ch === ",") { row.push(cell); cell = ""; continue; }
    if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; continue; }
    if (ch === "\r") continue;
    cell += ch;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim().length));
}

function normalizeFollowRow(row: Record<string, unknown>): FollowedChannel | null {
  const kindRaw = String(row.kind ?? row.service ?? "").toLowerCase();
  const kind = kindRaw === "twitch" || kindRaw === "youtube" ? kindRaw : null;
  const handle = String(row.handle ?? row.channel ?? row.title ?? "").trim().replace(/^@/, "");
  const id = String(row.id ?? "").trim() || (kind && handle ? `${kind === "twitch" ? "tw" : "yt"}:${handle}` : "");
  const title = String(row.title ?? row.channel ?? handle).trim() || handle;
  if (!kind || !handle) return null;
  return {
    id,
    kind,
    handle,
    title,
    ...(typeof row.channelId === "string" && row.channelId ? { channelId: row.channelId } : {}),
    ...(typeof row.thumb === "string" && row.thumb ? { thumb: row.thumb } : {}),
  };
}

function dedupeFollows(rows: FollowedChannel[]): FollowedChannel[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.kind}:${row.handle.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function engagementSummary(input: LibraryPackBuildInput) {
  const feedback = exportFeedback();
  const rated = Object.keys(feedback.ratings).filter((id) => (feedback.ratings[id] ?? 0) > 0).length;
  return {
    at: new Date().toISOString(),
    follows: input.follows.length,
    youtubeFollows: input.follows.filter((f) => f.kind === "youtube").length,
    twitchFollows: input.follows.filter((f) => f.kind === "twitch").length,
    historyEvents: input.history.length,
    savedLinks: input.links.length,
    favorites: input.favorites.length,
    likes: input.likes.length,
    photoSources: input.photoSources?.length ?? 0,
    photoLikes: input.photoLikes?.length ?? Object.values(input.photoMeta ?? {}).filter((row) => row.favorite).length,
    titlesWithViews: Object.keys(input.viewCounts).length,
    titlesWithCameMarks: Object.keys(input.cameCounts).length,
    totalCameMarks: Object.values(input.cameCounts).reduce((a, b) => a + b, 0),
    resumePointers: Object.keys(input.resumeProgress).length,
    ratedTitles: rated,
  };
}

export function packReadme(): string {
  return `# Reelcase library pack

Local-only backup / fill-in folder for YouTube & Twitch follows, watch history,
saved video links, continue-watching pointers, favorites/likes, Photos sources & likes, Adult marks,
ratings & tag hearts, and Adult stats snapshots.

No cloud. Nothing here uploads. Import **merges** by default so unrelated data
is not wiped.

## Folder layout

\`\`\`
${LIBRARY_PACK_ROOT}/
  README.md
  manifest.json
  follows/
    youtube.json
    twitch.json
    follows.csv
  history/
    history.json
    history.csv
  links/
    links.json
    links.csv
  marks/
    view-counts.json
    came-counts.json
    shelves.json
    ratings.json
    tag-hearts.json
  resume/
    resume.json
  stats/
    adult-stats.json
    adult-stats.csv
    engagement-summary.json
\`\`\`

## How to fill offline

1. Copy \`public/import-templates/\` (or an exported zip) to your PC.
2. Edit the JSON/CSV files in a spreadsheet or text editor.
3. Zip the folder back to \`${LIBRARY_PACK_ROOT}.zip\` (keep the same paths).
4. In Reelcase → **Settings** → **Import library pack**, choose the zip (or
   individual files). Confirm only if you want to replace all follows.

### follows/follows.csv
Columns: \`kind,handle,title,channelId,id\`
- \`kind\` must be \`youtube\` or \`twitch\`
- \`handle\` is the channel handle (no @ required)
- \`title\` is optional display name
- \`channelId\` optional provider id

### history/history.csv
Columns: \`id,at,url,title,position,duration,source,eventId\`
- \`at\` is epoch milliseconds
- \`url\` keeps a recoverable link if the catalog card was pruned

### links/links.csv
Columns: \`id,url,title,kind,savedAt,source\`
- \`source\` is \`history\`, \`bookmark\`, or \`continue\`

### marks/
- \`view-counts.json\` / \`came-counts.json\`: \`{ "video-id": 3 }\`
- \`shelves.json\`: \`{ "favorites": ["id"], "likes": ["id"] }\`
- \`ratings.json\`: \`{ "ratings": { "id": 5 }, "ratingHistory": { ... } }\`
- \`tag-hearts.json\`: \`{ "tagLikes": { "fetish-foo": true }, "tagHeartHistory": { ... } }\`

### resume/resume.json
\`{ "progress": { "id": { "t": 12, "d": 100, "at": 0 } }, "resumeProgress": { "https://...": { "t": 12, "d": 100, "at": 0 } } }\`

### stats/
Adult stats are snapshots for backup/analysis. Importing stats does not rebuild
the live Adult catalog; it is informational unless you also merge marks.

## Photos

- \`photos/sources.json\`: \`{ "sources": [{ "id", "name", "kind": "directory"|"files", "photoCount?", "lastCheckedAt?" }] }\`
- \`photos/likes.json\`: \`{ "likes": ["photo-id"], "meta": { "photo-id": { "favorite", "rating", "tags", "people", "album", "path" } } }\`

Photo media bytes stay on disk; the pack only stores source stubs and like/rating metadata.

## Durable stores (what Import writes)

| Pack file | IndexedDB key (\`activity\`) | localStorage mirror |
|---|---|---|
| follows/* | \`follows\` | \`reelcase.follows.v1\` |
| history/* | \`history\` | \`reelcase.history.v1\` |
| resume/* | \`resume\` | \`reelcase.resume.v1\` |
| marks/view+came | \`marks\` | \`reelcase.marks.v1\` |
| marks/shelves | \`shelves\` | \`reelcase.shelves.v1\` |
| links/* | \`links\` | \`reelcase.links.v1\` |
| marks/ratings+hearts | \`feedback\` | \`reelcase.media-feedback.v1\` |
| photos/* | \`photos\` | \`reelcase.photos.v1\` (+ legacy \`reelcase.photo-meta.v1\`) |

Thumb prune, Adult catalog caps, and prefs QuotaExceeded never clear these keys.
`;
}

export function buildLibraryPackFiles(input: LibraryPackBuildInput): Record<string, string> {
  const youtube = input.follows.filter((f) => f.kind === "youtube");
  const twitch = input.follows.filter((f) => f.kind === "twitch");
  const feedback = exportFeedback();
  const adultStats = input.adultStats
    ?? (input.adultVideos && input.folders && input.tags
      ? buildAdultStatsSnapshot(input.adultVideos, input.folders, input.tags, {
          favorites: Object.fromEntries(input.favorites.map((id) => [id, true as const])),
          likes: Object.fromEntries(input.likes.map((id) => [id, true as const])),
          cameCounts: input.cameCounts,
          viewCounts: input.viewCounts,
          ratingOf: (id) => feedback.ratings[id] ?? 0,
        })
      : undefined);

  const files: Record<string, string> = {
    [`${LIBRARY_PACK_ROOT}/README.md`]: packReadme(),
    [`${LIBRARY_PACK_ROOT}/manifest.json`]: JSON.stringify({
      version: LIBRARY_PACK_VERSION,
      exportedAt: new Date().toISOString(),
      note: "Reelcase local library pack. Metadata only — no media files.",
      counts: engagementSummary(input),
    }, null, 2),
    [`${LIBRARY_PACK_ROOT}/follows/youtube.json`]: JSON.stringify({ exportedAt: new Date().toISOString(), channels: youtube }, null, 2),
    [`${LIBRARY_PACK_ROOT}/follows/twitch.json`]: JSON.stringify({ exportedAt: new Date().toISOString(), channels: twitch }, null, 2),
    [`${LIBRARY_PACK_ROOT}/follows/follows.csv`]: rowsToCsv([
      ["kind", "handle", "title", "channelId", "id"],
      ...input.follows.map((f) => [f.kind, f.handle, f.title, f.channelId ?? "", f.id]),
    ]),
    [`${LIBRARY_PACK_ROOT}/history/history.json`]: JSON.stringify({ exportedAt: new Date().toISOString(), entries: input.history }, null, 2),
    [`${LIBRARY_PACK_ROOT}/history/history.csv`]: rowsToCsv([
      ["id", "at", "url", "title", "position", "duration", "source", "eventId"],
      ...input.history.map((h) => [h.id, h.at, h.url ?? "", h.title ?? "", h.position ?? "", h.duration ?? "", h.source ?? "", h.eventId ?? ""]),
    ]),
    [`${LIBRARY_PACK_ROOT}/links/links.json`]: JSON.stringify({ exportedAt: new Date().toISOString(), links: input.links }, null, 2),
    [`${LIBRARY_PACK_ROOT}/links/links.csv`]: rowsToCsv([
      ["id", "url", "title", "kind", "savedAt", "source"],
      ...input.links.map((l) => [l.id, l.url, l.title ?? "", l.kind ?? "", l.savedAt, l.source]),
    ]),
    [`${LIBRARY_PACK_ROOT}/marks/view-counts.json`]: JSON.stringify(input.viewCounts, null, 2),
    [`${LIBRARY_PACK_ROOT}/marks/came-counts.json`]: JSON.stringify(input.cameCounts, null, 2),
    [`${LIBRARY_PACK_ROOT}/marks/shelves.json`]: JSON.stringify({ favorites: input.favorites, likes: input.likes }, null, 2),
    [`${LIBRARY_PACK_ROOT}/marks/ratings.json`]: JSON.stringify({ ratings: feedback.ratings, ratingHistory: feedback.ratingHistory, notes: feedback.notes, creatorRatings: feedback.creatorRatings, creatorLikes: feedback.creatorLikes }, null, 2),
    [`${LIBRARY_PACK_ROOT}/marks/tag-hearts.json`]: JSON.stringify({ tagLikes: feedback.tagLikes, tagHeartHistory: feedback.tagHeartHistory }, null, 2),
    [`${LIBRARY_PACK_ROOT}/resume/resume.json`]: JSON.stringify({ progress: input.progress, resumeProgress: input.resumeProgress }, null, 2),
    [`${LIBRARY_PACK_ROOT}/stats/engagement-summary.json`]: JSON.stringify(engagementSummary(input), null, 2),
  };

  if (adultStats) {
    files[`${LIBRARY_PACK_ROOT}/stats/adult-stats.json`] = JSON.stringify(adultStats, null, 2);
    files[`${LIBRARY_PACK_ROOT}/stats/adult-stats.csv`] = adultStatsToCsv(adultStats);
  }

  return files;
}

export function downloadLibraryPackZip(input: LibraryPackBuildInput) {
  const files = buildLibraryPackFiles(input);
  const zipped = zipSync(
    Object.fromEntries(Object.entries(files).map(([name, body]) => [name, strToU8(body)])),
    { level: 6 },
  );
  const url = URL.createObjectURL(new Blob([zipped.buffer.slice(zipped.byteOffset, zipped.byteOffset + zipped.byteLength)], { type: "application/zip" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${LIBRARY_PACK_ROOT}-${stamp()}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}

function pathKey(name: string) {
  return name.replace(/\\/g, "/").replace(/^\/+/, "");
}

function fileEndsWith(name: string, suffix: string) {
  return pathKey(name).toLowerCase().endsWith(suffix.toLowerCase());
}

function readPackTextFiles(buffer: ArrayBuffer): Record<string, string> {
  const unzipped = unzipSync(new Uint8Array(buffer));
  const out: Record<string, string> = {};
  for (const [name, bytes] of Object.entries(unzipped)) {
    if (name.endsWith("/")) continue;
    out[pathKey(name)] = strFromU8(bytes);
  }
  return out;
}

function collectFollows(files: Record<string, string>): FollowedChannel[] {
  const rows: FollowedChannel[] = [];
  for (const [name, body] of Object.entries(files)) {
    if (fileEndsWith(name, "follows.csv") || /follows\/.*\.csv$/i.test(name)) {
      const table = parseCsv(body);
      const header = table[0]?.map((h) => h.trim().toLowerCase()) ?? [];
      for (const line of table.slice(1)) {
        const rec: Record<string, unknown> = {};
        header.forEach((key, i) => { rec[key] = line[i]; });
        const normalized = normalizeFollowRow(rec);
        if (normalized) rows.push(normalized);
      }
    }
    if (/follows\/.*\.json$/i.test(name) || fileEndsWith(name, "youtube.json") || fileEndsWith(name, "twitch.json") || fileEndsWith(name, "channels.json")) {
      try {
        const parsed = JSON.parse(body) as { channels?: unknown[] } | unknown[];
        const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed.channels) ? parsed.channels : [];
        for (const item of list) {
          if (!item || typeof item !== "object") continue;
          const normalized = normalizeFollowRow(item as Record<string, unknown>);
          if (normalized) rows.push(normalized);
        }
      } catch { /* skip malformed */ }
    }
  }
  return dedupeFollows(rows);
}

function collectHistory(files: Record<string, string>): HistoryEntry[] {
  const rows: HistoryEntry[] = [];
  for (const [name, body] of Object.entries(files)) {
    if (fileEndsWith(name, "history.json")) {
      try {
        const parsed = JSON.parse(body) as { entries?: HistoryEntry[] } | HistoryEntry[];
        const list = Array.isArray(parsed) ? parsed : parsed.entries ?? [];
        rows.push(...list);
      } catch { /* skip */ }
    }
    if (fileEndsWith(name, "history.csv")) {
      const table = parseCsv(body);
      const header = table[0]?.map((h) => h.trim().toLowerCase()) ?? [];
      for (const line of table.slice(1)) {
        const rec: Record<string, string> = {};
        header.forEach((key, i) => { rec[key] = line[i] ?? ""; });
        const id = rec.id?.trim();
        const at = Number(rec.at);
        if (!id || !Number.isFinite(at)) continue;
        rows.push({
          id,
          at,
          ...(rec.url ? { url: rec.url } : {}),
          ...(rec.title ? { title: rec.title } : {}),
          ...(rec.position ? { position: Number(rec.position) } : {}),
          ...(rec.duration ? { duration: Number(rec.duration) } : {}),
          ...(rec.source === "open" || rec.source === "progress" || rec.source === "watch-room" ? { source: rec.source } : {}),
          ...(rec.eventid ? { eventId: rec.eventid } : {}),
        });
      }
    }
  }
  return rows;
}

function collectLinks(files: Record<string, string>): SavedVideoLink[] {
  const rows: SavedVideoLink[] = [];
  for (const [name, body] of Object.entries(files)) {
    if (fileEndsWith(name, "links.json")) {
      try {
        const parsed = JSON.parse(body) as { links?: SavedVideoLink[] } | SavedVideoLink[];
        const list = Array.isArray(parsed) ? parsed : parsed.links ?? [];
        rows.push(...list);
      } catch { /* skip */ }
    }
    if (fileEndsWith(name, "links.csv")) {
      const table = parseCsv(body);
      const header = table[0]?.map((h) => h.trim().toLowerCase()) ?? [];
      for (const line of table.slice(1)) {
        const rec: Record<string, string> = {};
        header.forEach((key, i) => { rec[key] = line[i] ?? ""; });
        if (!rec.url || !rec.id) continue;
        const source = rec.source === "bookmark" || rec.source === "continue" ? rec.source : "history";
        rows.push({
          id: rec.id,
          url: rec.url,
          savedAt: Number(rec.savedat) || Date.now(),
          source,
          ...(rec.title ? { title: rec.title } : {}),
          ...(rec.kind ? { kind: rec.kind } : {}),
        });
      }
    }
  }
  return rows;
}

function asCountMap(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) out[id] = Math.floor(value);
  }
  return out;
}

export type LibraryPackApplyHooks = {
  getFollows: () => FollowedChannel[];
  setFollows: (follows: FollowedChannel[]) => void;
  getHistory: () => HistoryEntry[];
  setHistory: (history: HistoryEntry[]) => void;
  getViewCounts: () => Record<string, number>;
  getCameCounts: () => Record<string, number>;
  setMarks: (viewCounts: Record<string, number>, cameCounts: Record<string, number>) => void;
  getFavorites: () => string[];
  getLikes: () => string[];
  setShelves: (favorites: string[], likes: string[]) => void;
  getProgress: () => Record<string, { t: number; d: number; at: number }>;
  getResumeProgress: () => Record<string, { t: number; d: number; at: number }>;
  setResume: (progress: Record<string, { t: number; d: number; at: number }>, resumeProgress: Record<string, { t: number; d: number; at: number }>) => void;
  getLinks: () => SavedVideoLink[];
  setLinks: (links: SavedVideoLink[]) => void;
  getPhotoSources?: () => DurablePhotoSource[];
  setPhotoSources?: (sources: DurablePhotoSource[]) => void;
};

function mergeHistory(a: HistoryEntry[], b: HistoryEntry[]): HistoryEntry[] {
  const rows = new Map<string, HistoryEntry>();
  for (const entry of [...a, ...b]) {
    if (!entry?.id || !Number.isFinite(entry.at)) continue;
    const key = entry.eventId ?? `${entry.id}:${entry.at}:${entry.source ?? "open"}`;
    if (!rows.has(key)) rows.set(key, entry);
  }
  return [...rows.values()].sort((left, right) => right.at - left.at);
}

function mergeCounts(a: Record<string, number>, b: Record<string, number>) {
  const out = { ...a };
  for (const [id, value] of Object.entries(b)) out[id] = Math.max(out[id] ?? 0, value);
  return out;
}

/** Apply a zip or loose text map into durable stores via the provided hooks. */
export function applyLibraryPackFiles(
  files: Record<string, string>,
  hooks: LibraryPackApplyHooks,
  mode: LibraryPackMode = "merge",
): LibraryPackImportResult {
  const warnings: string[] = [];
  const filesRead = Object.keys(files);
  const incomingFollows = collectFollows(files);
  const incomingHistory = collectHistory(files);
  const incomingLinks = collectLinks(files);

  let followsAdded = 0;
  if (incomingFollows.length) {
    const current = hooks.getFollows();
    const next = mode === "replace-follows" ? dedupeFollows(incomingFollows) : dedupeFollows([...incomingFollows, ...current]);
    followsAdded = Math.max(0, next.length - current.length);
    hooks.setFollows(next);
    saveFollows(next);
  }

  let historyMerged = 0;
  if (incomingHistory.length) {
    const merged = mergeHistory(hooks.getHistory(), incomingHistory);
    historyMerged = Math.max(0, merged.length - hooks.getHistory().length);
    hooks.setHistory(merged);
    saveDurableHistory(merged);
  }

  let linksMerged = 0;
  if (incomingLinks.length) {
    const byUrl = new Map<string, SavedVideoLink>();
    for (const link of [...hooks.getLinks(), ...incomingLinks]) byUrl.set(link.url.toLowerCase(), link);
    const merged = [...byUrl.values()];
    linksMerged = Math.max(0, merged.length - hooks.getLinks().length);
    hooks.setLinks(merged);
    saveDurableLinks(merged);
  }

  let marksMerged = 0;
  let viewCounts = hooks.getViewCounts();
  let cameCounts = hooks.getCameCounts();
  for (const [name, body] of Object.entries(files)) {
    if (fileEndsWith(name, "view-counts.json")) {
      try {
        viewCounts = mergeCounts(viewCounts, asCountMap(JSON.parse(body)));
        marksMerged += 1;
      } catch { warnings.push(`Could not parse ${name}`); }
    }
    if (fileEndsWith(name, "came-counts.json")) {
      try {
        cameCounts = mergeCounts(cameCounts, asCountMap(JSON.parse(body)));
        marksMerged += 1;
      } catch { warnings.push(`Could not parse ${name}`); }
    }
  }
  if (marksMerged) {
    hooks.setMarks(viewCounts, cameCounts);
    saveDurableMarks(viewCounts, cameCounts);
  }

  let shelvesMerged = 0;
  for (const [name, body] of Object.entries(files)) {
    if (!fileEndsWith(name, "shelves.json")) continue;
    try {
      const parsed = JSON.parse(body) as { favorites?: string[]; likes?: string[] };
      const favorites = [...new Set([...hooks.getFavorites(), ...(parsed.favorites ?? [])])];
      const likes = [...new Set([...hooks.getLikes(), ...(parsed.likes ?? [])])];
      shelvesMerged = favorites.length + likes.length - hooks.getFavorites().length - hooks.getLikes().length;
      hooks.setShelves(favorites, likes);
      saveDurableShelves(favorites, likes);
    } catch { warnings.push(`Could not parse ${name}`); }
  }

  let feedbackMerged = false;
  let feedbackPartial: Partial<DurableFeedback> = {};
  for (const [name, body] of Object.entries(files)) {
    if (fileEndsWith(name, "ratings.json") || fileEndsWith(name, "tag-hearts.json") || fileEndsWith(name, "feedback.json")) {
      try {
        feedbackPartial = { ...feedbackPartial, ...JSON.parse(body) };
        feedbackMerged = true;
      } catch { warnings.push(`Could not parse ${name}`); }
    }
  }
  if (feedbackMerged) importFeedback(feedbackPartial);

  for (const [name, body] of Object.entries(files)) {
    if (!fileEndsWith(name, "resume.json")) continue;
    try {
      const parsed = JSON.parse(body) as {
        progress?: Record<string, { t: number; d: number; at: number }>;
        resumeProgress?: Record<string, { t: number; d: number; at: number }>;
      };
      const progress = { ...hooks.getProgress(), ...(parsed.progress ?? {}) };
      const resumeProgress = { ...hooks.getResumeProgress(), ...(parsed.resumeProgress ?? {}) };
      hooks.setResume(progress, resumeProgress);
      saveDurableResume(progress, resumeProgress);
    } catch { warnings.push(`Could not parse ${name}`); }
  }

  let photosMerged = 0;
  let incomingPhotoSources: DurablePhotoSource[] = [];
  let incomingPhotoMeta: Record<string, DurablePhotoMeta> = {};
  let incomingPhotoLikes: string[] = [];
  for (const [name, body] of Object.entries(files)) {
    if (fileEndsWith(name, "photos/sources.json") || /photos\/sources\.json$/i.test(name)) {
      try {
        const parsed = JSON.parse(body) as { sources?: DurablePhotoSource[] };
        incomingPhotoSources = [...incomingPhotoSources, ...(parsed.sources ?? [])];
      } catch { warnings.push(`Could not parse ${name}`); }
    }
    if (fileEndsWith(name, "photos/likes.json") || /photos\/likes\.json$/i.test(name)) {
      try {
        const parsed = JSON.parse(body) as { likes?: string[]; meta?: Record<string, DurablePhotoMeta> };
        incomingPhotoLikes = [...incomingPhotoLikes, ...(parsed.likes ?? [])];
        incomingPhotoMeta = { ...incomingPhotoMeta, ...(parsed.meta ?? {}) };
      } catch { warnings.push(`Could not parse ${name}`); }
    }
  }
  if (incomingPhotoSources.length || Object.keys(incomingPhotoMeta).length || incomingPhotoLikes.length) {
    const current = loadDurablePhotosSync();
    const byId = new Map([...(current?.sources ?? []), ...incomingPhotoSources].map((row) => [row.id, row]));
    const meta = { ...(current?.meta ?? {}), ...incomingPhotoMeta };
    for (const id of incomingPhotoLikes) meta[id] = { ...(meta[id] ?? {}), favorite: true };
    const likes = [...new Set([...(current?.likes ?? []), ...incomingPhotoLikes, ...Object.entries(meta).filter(([, row]) => row.favorite).map(([id]) => id)])];
    const sources = [...byId.values()];
    saveDurablePhotos({ sources, meta, likes });
    hooks.setPhotoSources?.(sources);
    photosMerged = sources.length + likes.length;
  }

  if (!incomingFollows.length && !incomingHistory.length && !incomingLinks.length && !marksMerged && !shelvesMerged && !feedbackMerged && !photosMerged) {
    warnings.push("No recognized pack files were found. Expect follows/, history/, links/, marks/, resume/, or photos/ paths.");
  }

  return { followsAdded, historyMerged, linksMerged, marksMerged, shelvesMerged, feedbackMerged, photosMerged, filesRead, warnings };
}

export async function importLibraryPackZip(
  file: File,
  hooks: LibraryPackApplyHooks,
  mode: LibraryPackMode = "merge",
): Promise<LibraryPackImportResult> {
  const buffer = await file.arrayBuffer();
  if (file.name.toLowerCase().endsWith(".zip") || file.type.includes("zip")) {
    return applyLibraryPackFiles(readPackTextFiles(buffer), hooks, mode);
  }
  // Single JSON/CSV drop: treat as one named file.
  const text = strFromU8(new Uint8Array(buffer));
  const fakeName = file.name || "import.json";
  return applyLibraryPackFiles({ [fakeName]: text }, hooks, mode);
}

/** Download only the README + empty templates as a starter zip. */
export function downloadLibraryPackTemplates() {
  const empty: LibraryPackBuildInput = {
    follows: [
      { id: "yt:example", kind: "youtube", handle: "example", title: "Example YouTube" },
      { id: "tw:example", kind: "twitch", handle: "example", title: "Example Twitch" },
    ],
    history: [],
    links: [],
    favorites: [],
    likes: [],
    viewCounts: {},
    cameCounts: {},
    progress: {},
    resumeProgress: {},
  };
  downloadLibraryPackZip(empty);
}
