import { parseProviderViewing } from "./provider-viewing.ts";
import { isTopicAliasLedger } from "./topic-aliases.ts";
import { isExposureLedger } from "./recommendation-exposure.ts";
import { isBridgeLedger } from "./topic-bridges.ts";
import { isGuidePreset } from "./guide-preset.ts";
import { parseFilmLedger } from "./film-review.ts";
import { parseAnimeReviews } from "./anime-review.ts";
import { isRejectionLedger } from "./recommendation-rejections.ts";
import { unzip, strFromU8 } from "fflate";
import { PACK_LIMITS, packHash, packObject, readPackStream, safePackKey } from "./pack-stream.ts";
import { yieldCatalogTask } from "../catalog-work.ts";

export type PackIssue = { location: string; message: string };
export type PackReport = {
  ok: boolean;
  format: string;
  version: number | null;
  bytes: number;
  records: number;
  duplicates: number;
  conflicts: number;
  changed: number;
  fingerprint: string;
  currentFollows: number;
  issues: PackIssue[];
  issueCount: number;
  warnings: string[];
  counts: Record<string, number>;
  sources: Record<string, number>;
  examples: PackIssue[];
};
export type PreparedPack = { files: Map<string, unknown>; report: PackReport };
export type PackCurrent = { files?: Map<string, unknown> };
const arrayFields: Record<string, string[]> = {
  "follows/youtube.json": ["channels"],
  "follows/twitch.json": ["channels"],
  "follows/collections.json": ["collections"],
  "history/history.json": ["entries"],
  "links/links.json": ["links"],
  "marks/shelves.json": ["favorites", "likes"],
  "photos/sources.json": ["sources"],
  "photos/likes.json": ["likes"],
};
const mapFields: Record<string, string[]> = {
  "marks/ratings.json": [
    "ratings",
    "ratingHistory",
    "notes",
    "creatorRatings",
    "creatorLikes",
    "creatorFavorites",
    "watchTime",
  ],
  "marks/tag-hearts.json": ["tagLikes", "tagHeartHistory"],
  "resume/resume.json": ["progress", "resumeProgress"],
  "photos/likes.json": ["meta"],
};
const rootMaps = new Set(["marks/view-counts.json", "marks/came-counts.json"]);
export const PACK_SIDECARS = new Set([
  "marks/topic-aliases.json",
  "marks/topic-bridges.json",
  "marks/guide-preset.json",
  "marks/recommendation-exposure.json",
  "marks/film-reviews.json",
  "marks/anime-reviews.json",
  "marks/provider-viewing.json",
  "marks/recommendation-rejections.json",
]);
const known = new Set([
  ...Object.keys(arrayFields),
  ...Object.keys(mapFields),
  ...rootMaps,
  ...PACK_SIDECARS,
]);
const aliases: Record<string, string> = {
  "youtube.json": "follows/youtube.json",
  "twitch.json": "follows/twitch.json",
  "history.json": "history/history.json",
  "links.json": "links/links.json",
  "ratings.json": "marks/ratings.json",
  "feedback.json": "marks/ratings.json",
  "shelves.json": "marks/shelves.json",
  "resume.json": "resume/resume.json",
  "view-counts.json": "marks/view-counts.json",
  "came-counts.json": "marks/came-counts.json",
  "tag-hearts.json": "marks/tag-hearts.json",
};
export function canonicalPackFile(name: string) {
  const normalized = name.replaceAll("\\", "/");
  if (normalized.startsWith("/") || normalized.split("/").includes("..")) return;
  for (const suffix of known)
    if (normalized === suffix || normalized.endsWith("/" + suffix)) return suffix;
  return aliases[normalized.split("/").at(-1) ?? ""];
}
function treeSafe(value: unknown, depth = 0): boolean {
  if (depth > 32) return false;
  if (
    value === null ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  )
    return true;
  if (typeof value === "string") return value.length <= 65536;
  if (Array.isArray(value))
    return value.length <= 10000 && value.every((v) => treeSafe(v, depth + 1));
  if (!packObject(value)) return false;
  return (
    Object.keys(value).length <= 10000 &&
    Object.entries(value).every(([k, v]) => safePackKey(k) && treeSafe(v, depth + 1))
  );
}
const id = (v: unknown) => typeof v === "string" && v.length > 0 && v.length <= 4096;
const finite = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0;
function validRecord(file: string, field: string, key: string, value: any) {
  if (!treeSafe(value)) return false;
  if (field === "channels")
    return (
      packObject(value) &&
      id(value.id) &&
      id(value.handle) &&
      typeof value.title === "string" &&
      ["youtube", "twitch"].includes(value.kind) &&
      value.kind === (file.includes("youtube") ? "youtube" : "twitch")
    );
  if (field === "entries")
    return (
      packObject(value) &&
      id(value.id) &&
      finite(value.at) &&
      ["position", "duration"].every((k) => value[k] === undefined || finite(value[k])) &&
      ["title", "url", "eventId", "poster"].every(
        (k) => value[k] === undefined || typeof value[k] === "string",
      ) &&
      (value.source === undefined || ["open", "progress", "watch-room"].includes(value.source))
    );
  if (field === "links") {
    try {
      const u = new URL(value?.url);
      return (
        packObject(value) &&
        id(value.id) &&
        ["https:", "http:"].includes(u.protocol) &&
        finite(value.savedAt) &&
        ["bookmark", "continue", "history"].includes(value.source)
      );
    } catch {
      return false;
    }
  }
  if (field === "collections")
    return (
      packObject(value) &&
      id(value.id) &&
      typeof value.name === "string" &&
      Array.isArray(value.followIds) &&
      value.followIds.every(id)
    );
  if (field === "sources")
    return (
      packObject(value) &&
      id(value.id) &&
      typeof value.name === "string" &&
      ["directory", "files"].includes(value.kind)
    );
  if (["favorites", "likes"].includes(field)) return id(value);
  if (field === "ratings" || field === "creatorRatings") return finite(value) && value <= 5;
  if (field === "notes") return typeof value === "string";
  if (["creatorLikes", "creatorFavorites", "tagLikes"].includes(field)) return value === true;
  if (field === "ratingHistory")
    return (
      packObject(value) && finite(value.rating) && value.rating <= 5 && finite(value.updatedAt)
    );
  if (field === "watchTime")
    return packObject(value) && finite(value.preview) && finite(value.fullscreen);
  if (["progress", "resumeProgress"].includes(field))
    return packObject(value) && finite(value.t) && finite(value.d) && finite(value.at);
  if (field === "meta") return packObject(value);
  if (rootMaps.has(file) || field === "tagHeartHistory") return finite(value);
  return false;
}
function recordIdentity(field: string, key: string, value: any) {
  if (field === "channels")
    return value.kind + ":" + (value.channelId || value.handle.toLowerCase());
  if (field === "entries")
    return value.eventId ?? `${value.id}:${value.at}:${value.source ?? "open"}`;
  if (["links", "sources", "collections"].includes(field)) return value.url ?? value.id;
  if (["favorites", "likes"].includes(field)) return value;
  return key;
}
export async function inspectPreparedPack(
  files: Map<string, unknown>,
  current: PackCurrent = {},
  options: {
    signal?: AbortSignal;
    turn?: () => Promise<void>;
    version?: number;
    format?: string;
    bytes?: number;
  } = {},
): Promise<PreparedPack> {
  const report: PackReport = {
    ok: false,
    format: options.format ?? "legacy files",
    version: options.version ?? 1,
    bytes: options.bytes ?? 0,
    records: 0,
    duplicates: 0,
    conflicts: 0,
    changed: 0,
    fingerprint: "",
    currentFollows: 0,
    issues: [],
    issueCount: 0,
    warnings: [],
    counts: {},
    sources: {},
    examples: [],
  };
  const tick = async () => {
    options.signal?.throwIfAborted();
    await (options.turn ?? yieldCatalogTask)();
  };
  let fingerprint = 2166136261;
  const hash = (value: unknown) => {
    fingerprint = packHash(new TextEncoder().encode(JSON.stringify(value)), fingerprint);
  };
  for (const file of ["follows/youtube.json", "follows/twitch.json"])
    for (const c of (current.files?.get(file) as any)?.channels ?? []) {
      report.currentFollows++;
      hash([c.kind, c.id, c.channelId, c.handle]);
      if (report.currentFollows % 128 === 0) await tick();
    }
  const problem = (location: string, message: string) => {
    report.issueCount++;
    if (report.issues.length < 50) report.issues.push({ location, message });
  };
  await tick();
  let budget = 0;
  for (const [file, raw] of files) {
    if (!known.has(file)) {
      problem(file, "Unsupported pack section.");
      continue;
    }
    if (PACK_SIDECARS.has(file)) {
      let valid = packObject(raw) && treeSafe(raw);
      try {
        if (file === "marks/recommendation-rejections.json")
          valid = valid && isRejectionLedger(raw);
        if (file === "marks/topic-aliases.json") valid = valid && isTopicAliasLedger(raw);
        if (file === "marks/recommendation-exposure.json") valid = valid && isExposureLedger(raw);
        if (file === "marks/topic-bridges.json") valid = valid && isBridgeLedger(raw);
        if (file === "marks/guide-preset.json") valid = valid && isGuidePreset(raw);
        if (file === "marks/film-reviews.json") parseFilmLedger(raw);
        if (file === "marks/anime-reviews.json") parseAnimeReviews(raw);
        if (file === "marks/provider-viewing.json") parseProviderViewing(raw);
      } catch {
        valid = false;
      }
      if (!valid) problem(file, "Malformed, future-version or oversized feature ledger.");
      else {
        const before = current.files?.get(file);
        hash([file, before ?? null]);
        if (JSON.stringify(before) !== JSON.stringify(raw)) {
          report.changed++;
          if (before !== undefined) {
            report.conflicts++;
            if (report.examples.length < 20)
              report.examples.push({
                location: file,
                message: "Existing feature review ledger differs from this backup.",
              });
          }
        }
        report.records++;
        report.counts[file] = 1;
      }
      continue;
    }
    const data = Array.isArray(raw) ? { [arrayFields[file]?.[0] ?? "entries"]: raw } : raw;
    if (!packObject(data)) {
      problem(file, "Expected a JSON object.");
      continue;
    }
    if (
      !rootMaps.has(file) &&
      data.version !== undefined &&
      (!Number.isInteger(data.version) ||
        data.version < 1 ||
        data.version > (file === "marks/ratings.json" ? 5 : 1))
    )
      problem(file + ":version", "Unsupported or future section version.");
    const fields = rootMaps.has(file)
      ? ["$"]
      : [...new Set([...(arrayFields[file] ?? []), ...(mapFields[file] ?? [])])];
    if (!rootMaps.has(file))
      for (const key of Object.keys(data))
        if (
          !fields.includes(key) &&
          !["exportedAt", "version"].includes(key) &&
          !(file === "marks/ratings.json" && key === "recommendationRejections")
        )
          problem(
            file + ":" + key,
            "Unsupported field; this import requires review by a compatible app version.",
          );
    let recognized = false;
    for (const field of fields) {
      const value = field === "$" ? data : data[field];
      if (value === undefined) continue;
      recognized = true;
      const array = arrayFields[file]?.includes(field),
        map = rootMaps.has(file) || mapFields[file]?.includes(field);
      if (array ? !Array.isArray(value) : map ? !packObject(value) : true) {
        problem(file + ":" + field, "Wrong record container shape.");
        continue;
      }
      const beforeRoot = current.files?.get(file) as any,
        before = field === "$" ? beforeRoot : beforeRoot?.[field];
      const oldArray = array && Array.isArray(before) ? new Map<string, unknown>() : null;
      if (oldArray) {
        let i = 0;
        for (const v of before) {
          oldArray.set(recordIdentity(field, String(i++), v), v);
          if (i % 128 === 0) await tick();
        }
      }
      const seen = new Set<string>();
      // Array iterators and map enumeration retain references to the staged
      // records; no second serialized library or example list is built.
      const entries: Iterable<[string, any]> = array
        ? ((value as any[]).entries() as any)
        : (function* () {
            for (const key in value)
              if (Object.hasOwn(value, key)) yield [key, value[key]] as [string, any];
          })();
      for (const [rawKey, item] of entries) {
        const key = String(rawKey),
          location = file + ":" + field + "[" + key + "]";
        if (!safePackKey(key) || !validRecord(file, field, key, item)) {
          problem(location, "Invalid record; no data will be applied.");
        } else {
          const identity = recordIdentity(field, key, item);
          const duplicate = seen.has(identity);
          if (duplicate) report.duplicates++;
          else seen.add(identity);
          const old = array ? oldArray?.get(identity) : before?.[key];
          const comparable =
            field === "channels" && old
              ? {
                  kind: old.kind,
                  id: old.id,
                  handle: old.handle,
                  title: old.title,
                  channelId: old.channelId,
                  twitchPullPolicy: old.twitchPullPolicy,
                }
              : old;
          hash([location, comparable ?? null]);
          const different =
            old === undefined ||
            JSON.stringify(comparable) !==
              JSON.stringify(
                field === "channels"
                  ? {
                      kind: item.kind,
                      id: item.id,
                      handle: item.handle,
                      title: item.title,
                      channelId: item.channelId,
                      twitchPullPolicy: item.twitchPullPolicy,
                    }
                  : item,
              );
          if (different) {
            report.changed++;
            if (old !== undefined) {
              report.conflicts++;
              if (report.examples.length < 20)
                report.examples.push({
                  location,
                  message: "Existing personal/source record differs from this backup.",
                });
            }
          }
          if (field === "channels" && !duplicate)
            report.sources[item.kind] = (report.sources[item.kind] ?? 0) + 1;
        }
        report.records++;
        report.counts[field === "$" ? file : file + ":" + field] =
          (report.counts[field === "$" ? file : file + ":" + field] ?? 0) + 1;
        if (report.records > PACK_LIMITS.records) {
          problem(file, "More than one million records.");
          break;
        }
        if (++budget >= 128) {
          budget = 0;
          await tick();
        }
      }
    }
    if (
      file === "marks/ratings.json" &&
      data.recommendationRejections !== undefined &&
      !isRejectionLedger(data.recommendationRejections)
    )
      problem(file + ":recommendationRejections", "Malformed recommendation rejection ledger.");
    if (!recognized) problem(file, "No supported records in this section.");
  }
  if (!files.size) problem("backup", "No supported backup records were found.");
  report.fingerprint = fingerprint.toString(16);
  report.ok = report.issueCount === 0;
  return { files, report };
}

/** Legacy ZIP extraction checks declared expansion before retaining text. */
async function legacyZip(file: Blob, signal?: AbortSignal) {
  if (file.size > 32 * 1024 * 1024)
    throw Error("Legacy ZIP exceeds 32 MiB. Use a streaming pack for large exports.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  signal?.throwIfAborted();
  return new Promise<Record<string, string>>((resolve, reject) => {
    let size = 0,
      count = 0,
      invalid: string | undefined;
    const names = new Set<string>();
    const stop = unzip(
      bytes,
      {
        filter: (entry) => {
          if (names.has(entry.name)) {
            invalid = "Duplicate ZIP entry path.";
            return false;
          }
          names.add(entry.name);
          if (
            ++count > 128 ||
            entry.originalSize > 32 * 1024 * 1024 ||
            (size += entry.originalSize) > PACK_LIMITS.bytes
          ) {
            invalid = "ZIP expansion exceeds the inspection budget.";
            return false;
          }
          return !entry.name.endsWith("/");
        },
      },
      (error, entries) => {
        signal?.removeEventListener("abort", abort);
        if (error || invalid) {
          reject(error ?? Error(invalid));
          return;
        }
        const out: Record<string, string> = Object.create(null);
        for (const [name, data] of Object.entries(entries)) out[name] = strFromU8(data);
        resolve(out);
      },
    );
    const abort = () => {
      stop();
      reject(signal?.reason ?? new DOMException("Cancelled", "AbortError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
  });
}
export async function inspectLegacyFiles(
  raw: Record<string, string>,
  current: PackCurrent = {},
  options: { signal?: AbortSignal; turn?: () => Promise<void> } = {},
): Promise<PreparedPack> {
  const files = new Map<string, unknown>(),
    issues: PackIssue[] = [],
    warnings: string[] = [];
  let bytes = 0,
    fileCount = 0,
    version: number | null = 1;
  for (const [name, body] of Object.entries(raw)) {
    options.signal?.throwIfAborted();
    if (++fileCount > 128) {
      issues.push({ location: name, message: "More than 128 legacy pack files." });
      break;
    }
    const bodyBytes = new TextEncoder().encode(body).length;
    bytes += bodyBytes;
    if (bytes > PACK_LIMITS.bytes || bodyBytes > 32 * 1024 * 1024) {
      issues.push({ location: name, message: "Legacy JSON exceeds the inspection budget." });
      break;
    }
    if (name.endsWith("manifest.json")) {
      try {
        const m = JSON.parse(body);
        version = m.version;
        if (m.version !== 1) throw Error("Unsupported or future legacy pack version.");
      } catch (e) {
        issues.push({
          location: name,
          message: e instanceof Error ? e.message : "Malformed manifest.",
        });
      }
      continue;
    }
    if (/\.csv$/i.test(name)) {
      if (!/(?:follows|youtube|twitch|history|links)\.csv$/i.test(name)) continue;
      const lower = name.toLowerCase();
      const category = lower.endsWith("history.csv")
        ? "history"
        : lower.endsWith("links.csv")
          ? "links"
          : "follows";
      const allNames = Object.keys(raw);
      if (
        (category === "follows" &&
          allNames.some((n) => n.endsWith("youtube.json")) &&
          allNames.some((n) => n.endsWith("twitch.json"))) ||
        (category === "history" && allNames.some((n) => n.endsWith("history.json"))) ||
        (category === "links" && allNames.some((n) => n.endsWith("links.json")))
      )
        continue;
      try {
        let header: string[] | undefined,
          index = 0;
        for (const row of csvRows(body)) {
          if (!header) {
            header = row.map((k) => k.trim().toLowerCase());
            continue;
          }
          const entry: Record<string, any> = Object.create(null);
          for (let i = 0; i < header.length; i++) {
            if (!safePackKey(header[i])) throw Error("Unsafe CSV header.");
            entry[header[i]] = row[i] ?? "";
          }
          let file: string, field: string, value: any;
          if (category === "follows") {
            const kind = (
              entry.kind ||
              entry.service ||
              (lower.endsWith("youtube.csv")
                ? "youtube"
                : lower.endsWith("twitch.csv")
                  ? "twitch"
                  : "")
            ).toLowerCase();
            if (!["youtube", "twitch"].includes(kind))
              throw Error("CSV row " + (index + 2) + " needs youtube or twitch kind.");
            const handle = entry.handle || entry.channel || entry.title;
            file = "follows/" + kind + ".json";
            field = "channels";
            value = {
              id: entry.id || (kind === "youtube" ? "yt:" : "tw:") + handle,
              kind,
              handle,
              title: entry.title || handle,
              ...(entry.channelid ? { channelId: entry.channelid } : {}),
            };
          } else if (category === "history") {
            file = "history/history.json";
            field = "entries";
            value = {
              id: entry.id,
              at: Number(entry.at),
              ...(entry.title ? { title: entry.title } : {}),
              ...(entry.url ? { url: entry.url } : {}),
              ...(entry.source ? { source: entry.source } : {}),
              ...(entry.eventid ? { eventId: entry.eventid } : {}),
              ...(entry.position ? { position: Number(entry.position) } : {}),
              ...(entry.duration ? { duration: Number(entry.duration) } : {}),
            };
          } else {
            file = "links/links.json";
            field = "links";
            value = {
              id: entry.id,
              url: entry.url,
              savedAt: Number(entry.savedat),
              source: entry.source || "history",
              ...(entry.title ? { title: entry.title } : {}),
            };
          }
          if (!files.has(file)) files.set(file, { [field]: [] });
          (files.get(file) as any)[field].push(value);
          if (++index > PACK_LIMITS.records) throw Error("CSV exceeds one million records.");
          if (index % 128 === 0) {
            options.signal?.throwIfAborted();
            await (options.turn ?? yieldCatalogTask)();
          }
        }
        if (!header?.length) throw Error("CSV header is missing.");
      } catch (error) {
        issues.push({
          location: name,
          message: error instanceof Error ? error.message : "Malformed CSV.",
        });
      }
      continue;
    }
    const file = canonicalPackFile(name);
    if (!file) {
      if (!/README\.md$|\.csv$|\/stats\//i.test(name))
        warnings.push("Unrecognized file omitted: " + name.slice(0, 160));
      continue;
    }
    if (files.has(file)) {
      issues.push({ location: name, message: "Ambiguous duplicate section path." });
      continue;
    }
    try {
      files.set(file, JSON.parse(body));
    } catch {
      issues.push({ location: name, message: "Malformed or truncated JSON." });
    }
    await (options.turn ?? yieldCatalogTask)();
  }
  const result = await inspectPreparedPack(files, current, {
    ...options,
    bytes,
    version: version ?? 0,
    format: "legacy JSON / ZIP / CSV",
  });
  result.report.warnings.push(...warnings.slice(0, 20));
  result.report.issueCount += issues.length;
  result.report.issues.unshift(...issues.slice(0, 50));
  result.report.issues = result.report.issues.slice(0, 50);
  result.report.ok = !result.report.issueCount;
  return result;
}

function* csvRows(text: string): Generator<string[]> {
  let row: string[] = [],
    cell = "",
    quoted = false,
    closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
        closed = true;
      } else cell += c;
    } else if (c === '"') {
      if (cell || closed) throw Error("Unexpected CSV quote.");
      quoted = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
      closed = false;
    } else if (c === "\n") {
      row.push(cell);
      if (row.some(Boolean)) yield row;
      row = [];
      cell = "";
      closed = false;
    } else if (c !== "\r") {
      if (closed) throw Error("Unexpected characters after a quoted CSV cell.");
      cell += c;
    }
    if (cell.length > 65536 || row.length > 32)
      throw Error("CSV cell/header exceeds the inspection budget.");
  }
  if (quoted) throw Error("Truncated quoted CSV cell.");
  if (cell || row.length) {
    row.push(cell);
    yield row;
  }
}
export async function preflightPack(
  file: File,
  current: PackCurrent = {},
  options: { signal?: AbortSignal; turn?: () => Promise<void> } = {},
): Promise<PreparedPack> {
  try {
    if (file.size > PACK_LIMITS.bytes) throw Error("Backup exceeds 128 MiB.");
    if (file.name.toLowerCase().endsWith(".reelpack")) {
      const parsed = await readPackStream(file, {
        ...options,
        turn: options.turn ?? yieldCatalogTask,
      });
      return inspectPreparedPack(parsed.files, current, {
        ...options,
        version: 2,
        format: "streaming pack v2",
        bytes: file.size,
      });
    }
    if (
      !file.name.toLowerCase().endsWith(".zip") &&
      !file.type.includes("zip") &&
      file.size > 32 * 1024 * 1024
    )
      throw Error("Legacy text exceeds 32 MiB. Use a streaming pack for large exports.");
    const raw =
      file.name.toLowerCase().endsWith(".zip") || file.type.includes("zip")
        ? await legacyZip(file, options.signal)
        : { [file.name]: await file.text() };
    return inspectLegacyFiles(raw, current, options);
  } catch (error) {
    if (options.signal?.aborted) throw error;
    return {
      files: new Map(),
      report: {
        ok: false,
        format: "unreadable backup",
        version: null,
        bytes: file.size,
        records: 0,
        duplicates: 0,
        conflicts: 0,
        changed: 0,
        fingerprint: "",
        currentFollows: 0,
        issueCount: 1,
        issues: [
          {
            location: file.name,
            message: error instanceof Error ? error.message : "Backup could not be read.",
          },
        ],
        warnings: [],
        counts: {},
        sources: {},
        examples: [],
      },
    };
  }
}
