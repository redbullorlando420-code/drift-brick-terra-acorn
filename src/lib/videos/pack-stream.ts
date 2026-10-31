import { sparseRecordScan } from "../sparse-record.ts";
/** Version 2 is a UTF-8 JSON-lines metadata pack. Each acknowledged write is
 * bounded; the final manifest detects truncation, reordering and corruption.
 * FNV-1a is a corruption checksum, not publisher authentication or encryption. */
export const PACK_LIMITS = {
  bytes: 128 * 1024 * 1024,
  line: 128 * 1024,
  rows: 128,
  records: 1_000_000,
  sections: 128,
} as const;
export type PackSection = {
  file: string;
  field: string;
  shape: "array" | "map" | "value";
  data: unknown;
};
export type PackWriteStats = {
  records: number;
  bytes: number;
  sections: number;
  maxChunkBytes: number;
  maxPendingWrites: number;
};
export const packHash = (bytes: Uint8Array, hash = 2166136261) => {
  for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619) >>> 0;
  return hash;
};
const encoder = new TextEncoder();
export function packObject(value: unknown): value is Record<string, any> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
  );
}
export function safePackKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 4096 &&
    !["__proto__", "constructor", "prototype"].includes(value)
  );
}
export async function writePackStream(
  sections: Iterable<PackSection>,
  write: (bytes: Uint8Array) => Promise<void>,
  options: {
    signal?: AbortSignal;
    turn?: () => Promise<void>;
    progress?: (stats: PackWriteStats) => void;
  } = {},
) {
  const stats: PackWriteStats = {
    records: 0,
    bytes: 0,
    sections: 0,
    maxChunkBytes: 0,
    maxPendingWrites: 0,
  };
  let hash = 2166136261;
  const send = async (value: unknown, manifest = false) => {
    options.signal?.throwIfAborted();
    const bytes = encoder.encode(JSON.stringify(value) + "\n");
    if (bytes.length > PACK_LIMITS.line)
      throw Error(
        "A backup record exceeds the 128 KiB line limit. No complete pack was published.",
      );
    if (stats.bytes + bytes.length > PACK_LIMITS.bytes)
      throw Error("Backup exceeds the 128 MiB download limit. Export a smaller selection.");
    if (!manifest) hash = packHash(bytes, hash);
    stats.bytes += bytes.length;
    stats.maxChunkBytes = Math.max(stats.maxChunkBytes, bytes.length);
    stats.maxPendingWrites = 1;
    await write(bytes);
    options.signal?.throwIfAborted();
  };
  await send({
    type: "header",
    format: "reelcase-library-stream",
    version: 2,
    exportedAt: new Date().toISOString(),
    checksum: "fnv1a32-utf8",
  });
  try {
    for (const section of sections) {
      if (++stats.sections > PACK_LIMITS.sections) throw Error("Too many backup sections.");
      await send({
        type: "section",
        file: section.file,
        field: section.field,
        shape: section.shape,
      });
      let values: unknown[] = [],
        keys: string[] = [],
        estimated = 100;
      const flush = async () => {
        if (!values.length) return;
        await send({ type: "chunk", values, ...(section.shape === "map" ? { keys } : {}) });
        values = [];
        keys = [];
        estimated = 100;
        await options.turn?.();
        options.progress?.({ ...stats });
      };
      const add = async (value: unknown, key?: string) => {
        options.signal?.throwIfAborted();
        // Estimate in UTF-8 before retaining a chunk. One record owns at most
        // one bounded scratch serialization, never a full-library string.
        const encoded = JSON.stringify(value);
        if (encoded === undefined) throw Error("Backup contains a non-JSON record.");
        const size =
          encoder.encode(encoded).length +
          (key ? encoder.encode(JSON.stringify(key)).length : 0) +
          2;
        if (size > PACK_LIMITS.line - 256)
          throw Error("A backup record is too large for streaming.");
        if (values.length >= PACK_LIMITS.rows || estimated + size > PACK_LIMITS.line - 256)
          await flush();
        if (++stats.records > PACK_LIMITS.records)
          throw Error("Backup exceeds one million records.");
        values.push(value);
        if (key !== undefined) keys.push(key);
        estimated += size;
      };
      if (section.shape === "array") {
        if (!Array.isArray(section.data)) throw Error("Backup array section is invalid.");
        for (const value of section.data) await add(value);
      } else if (section.shape === "map") {
        if (!packObject(section.data)) throw Error("Backup map section is invalid.");
        // for-in supports existing sparse record proxies without creating a
        // second catalog-sized Object.entries array.
        for (const entry of sparseRecordScan(section.data)) {
          if (!entry) continue;
          const [key, value] = entry;
          if (!safePackKey(key)) throw Error("Backup contains an unsupported record key.");
          await add(value, key);
        }
      } else await add(section.data);
      await flush();
    }
    const manifest = {
      type: "manifest",
      version: 2,
      complete: true,
      sections: stats.sections,
      records: stats.records,
      bytes: stats.bytes,
      checksum: hash.toString(16).padStart(8, "0"),
    };
    await send(manifest, true);
    return stats;
  } finally {
    /* Per-section scratch arrays leave scope on abort or failure. */
  }
}

export async function* packLines(file: Blob, signal?: AbortSignal) {
  if (file.size > PACK_LIMITS.bytes) throw Error("Backup exceeds the 128 MiB inspection limit.");
  const reader = file.stream().getReader(),
    decoder = new TextDecoder("utf-8", { fatal: true });
  let pending = "",
    total = 0;
  try {
    for (;;) {
      signal?.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > PACK_LIMITS.bytes) throw Error("Backup exceeds the inspection limit.");
      pending += decoder.decode(value, { stream: true });
      for (let end; (end = pending.indexOf("\n")) >= 0;) {
        const line = pending.slice(0, end + 1);
        pending = pending.slice(end + 1);
        if (encoder.encode(line).length > PACK_LIMITS.line)
          throw Error("Backup line exceeds 128 KiB.");
        yield line;
      }
      if (pending.length > PACK_LIMITS.line) throw Error("Backup line exceeds 128 KiB.");
    }
    pending += decoder.decode();
    if (pending.length) throw Error("Backup is truncated: its final newline is missing.");
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function readPackStream(
  file: Blob,
  options: { signal?: AbortSignal; turn?: () => Promise<void> } = {},
) {
  const files = new Map<string, unknown>(),
    seen = new Set<string>();
  let header = false,
    complete = false,
    hash = 2166136261,
    bytes = 0,
    records = 0,
    sections = 0,
    lineNumber = 0;
  let active:
    | { file: string; field: string; shape: PackSection["shape"]; data: any; count: number }
    | undefined;
  for await (const line of packLines(file, options.signal)) {
    lineNumber++;
    if (complete) throw Error("Unexpected data after the final integrity manifest.");
    let row: any;
    try {
      row = JSON.parse(line);
    } catch {
      throw Error("Invalid JSON at backup line " + lineNumber);
    }
    if (!header) {
      if (
        row.type !== "header" ||
        row.format !== "reelcase-library-stream" ||
        row.version !== 2 ||
        row.checksum !== "fnv1a32-utf8"
      )
        throw Error("Unsupported or future backup version at line 1.");
      header = true;
    } else if (row.type === "section") {
      if (
        !safePackKey(row.file) ||
        row.file.length > 128 ||
        row.file.includes("..") ||
        row.file.includes("\\") ||
        row.file.startsWith("/") ||
        !safePackKey(row.field) ||
        !["array", "map", "value"].includes(row.shape) ||
        seen.has(row.file + "\0" + row.field)
      )
        throw Error("Invalid or duplicate section at line " + lineNumber);
      if (++sections > PACK_LIMITS.sections) throw Error("Too many backup sections.");
      seen.add(row.file + "\0" + row.field);
      const data =
        row.shape === "array" ? [] : row.shape === "map" ? Object.create(null) : undefined;
      if (row.field === "$") {
        if (files.has(row.file)) throw Error("Conflicting root section at line " + lineNumber);
        files.set(row.file, data);
      } else {
        if (seen.has(row.file + "\0$"))
          throw Error("Conflicting root section at line " + lineNumber);
        if (!files.has(row.file)) files.set(row.file, Object.create(null));
        (files.get(row.file) as Record<string, unknown>)[row.field] = data;
      }
      active = { file: row.file, field: row.field, shape: row.shape, data, count: 0 };
    } else if (row.type === "chunk") {
      if (
        !active ||
        !Array.isArray(row.values) ||
        !row.values.length ||
        row.values.length > PACK_LIMITS.rows
      )
        throw Error("Invalid record chunk at line " + lineNumber);
      if (
        active.shape === "map" &&
        (!Array.isArray(row.keys) || row.keys.length !== row.values.length)
      )
        throw Error("Invalid map keys at line " + lineNumber);
      for (let i = 0; i < row.values.length; i++) {
        if (++records > PACK_LIMITS.records) throw Error("Too many backup records.");
        const value = row.values[i];
        if (active.shape === "array") active.data.push(value);
        else if (active.shape === "map") {
          const key = row.keys[i];
          if (!safePackKey(key) || Object.hasOwn(active.data, key))
            throw Error("Duplicate/unsafe map key at line " + lineNumber);
          active.data[key] = value;
        } else {
          if (active.count) throw Error("Duplicate scalar at line " + lineNumber);
          active.data = value;
          if (active.field === "$") files.set(active.file, value);
          else (files.get(active.file) as Record<string, unknown>)[active.field] = value;
        }
        active.count++;
      }
      await options.turn?.();
    } else if (row.type === "manifest") {
      if (
        row.version !== 2 ||
        row.complete !== true ||
        row.records !== records ||
        row.sections !== sections ||
        row.bytes !== bytes ||
        row.checksum !== hash.toString(16).padStart(8, "0")
      )
        throw Error("Backup integrity manifest does not match its records.");
      complete = true;
      continue;
    } else throw Error("Unexpected record type at backup line " + lineNumber);
    hash = packHash(encoder.encode(line), hash);
    bytes += encoder.encode(line).length;
  }
  if (!complete) throw Error("Incomplete backup: final integrity manifest is missing.");
  return { files, records, version: 2, bytes };
}
