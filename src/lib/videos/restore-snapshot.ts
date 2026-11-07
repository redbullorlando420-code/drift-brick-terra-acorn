import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { yieldCatalogTask } from "../catalog-work";
export const RESTORE_LIMITS = { bytes: 128 * 1024 ** 2, rows: 200000, page: 32 } as const;
export const RESTORE_ACTIVITY_KEYS = [
  "preferences",
  "primary",
  "follows",
  "history",
  "resume",
  "marks",
  "shelves",
  "links",
  "feedback",
  "photos",
  "topic-aliases",
  "topic-bridges",
  "guide-preset",
  "film-reviews",
  "anime-reviews",
  "provider-viewing",
  "recommendation-exposure",
  "media-health:v1",
] as const;
export const RESTORE_PREFIXES = [
  "catalog-metadata:",
  "metadata-enrichment:",
  "saved-edit:",
] as const;
export const RESTORE_MIRRORS = [
  "reelcase.prefs.v4",
  "reelcase.prefs.v3",
  "reelcase.prefs.v2",
  "reelcase.prefs.v1",
  "reelcase.follows.v1",
  "reelcase.history.v1",
  "reelcase.resume.v1",
  "reelcase.marks.v1",
  "reelcase.shelves.v1",
  "reelcase.links.v1",
  "reelcase.media-feedback.v1",
  "reelcase.photos.v1",
  "reelcase.photo-meta.v1",
  "reelcase.follow-collections.v1",
  "reelcase.topic-aliases.v1",
  "reelcase.topic-bridges.v1",
  "reelcase.guide-preset.v1",
  "reelcase.film-reviews.v1",
  "reelcase.anime-reviews.v1",
  "reelcase.provider-viewing.v1",
  "reelcase.recommendation-exposure.v1",
  "reelcase.tag-edits.v1",
  "reelcase.tag-provenance-edits.v1",
  "reelcase.saved-edits.v1",
  "reelcase.history-pending.v1",
  "reelcase.catalog-edits.v1",
  "reelcase.resume-replay.v1",
] as const;
export type RestoreRow = { store: "activity" | "activity-journal"; key: string; value: unknown };
export type RestoreSnapshot = {
  version: 1;
  rows: RestoreRow[];
  mirrors: Record<string, string | null>;
};
export const restoreActivityKey = (key: string) =>
  (RESTORE_ACTIVITY_KEYS as readonly string[]).includes(key) ||
  RESTORE_PREFIXES.some((p) => key.startsWith(p));
/** Bounded cooperative hashing includes undefined values and exact types; no full-snapshot stringify. */
export async function verifyRestoreSnapshot(snapshot: RestoreSnapshot, signal?: AbortSignal) {
  if (snapshot.version !== 1 || snapshot.rows.length > RESTORE_LIMITS.rows)
    throw Error("Restore exceeds its personal-record budget.");
  const keys = new Set<string>();
  for (const r of snapshot.rows) {
    if (
      (r.store !== "activity" && r.store !== "activity-journal") ||
      typeof r.key !== "string" ||
      r.key.length > 4096 ||
      (r.store === "activity" && !restoreActivityKey(r.key)) ||
      keys.has(r.store + "|" + r.key)
    )
      throw Error("Invalid or duplicate restore row.");
    keys.add(r.store + "|" + r.key);
  }
  if (
    Object.keys(snapshot.mirrors).some(
      (k) =>
        !(RESTORE_MIRRORS as readonly string[]).includes(k) ||
        (snapshot.mirrors[k] !== null && typeof snapshot.mirrors[k] !== "string"),
    )
  )
    throw Error("Invalid restore mirror.");
  const hash = sha256.create(),
    encode = new TextEncoder();
  let bytes = 0,
    n = 0;
  const stack: unknown[] = [snapshot];
  while (stack.length) {
    signal?.throwIfAborted();
    const item = stack.pop();
    let token: string;
    if (item === null) token = "null;";
    else if (item === undefined) token = "undefined;";
    else if (typeof item === "string") token = "s" + JSON.stringify(item) + ";";
    else if (typeof item === "number") {
      if (!Number.isFinite(item)) throw Error("Invalid restore number.");
      token = "n" + item + ";";
    } else if (typeof item === "boolean") token = item ? "true;" : "false;";
    else if (Array.isArray(item)) {
      token = "a" + item.length + ";";
      for (let i = item.length - 1; i >= 0; i--) stack.push(item[i]);
    } else if (
      (item && typeof item === "object" && Object.getPrototypeOf(item) === Object.prototype) ||
      (item && typeof item === "object" && Object.getPrototypeOf(item) === null)
    ) {
      const row = item as Record<string, unknown>,
        names = Object.keys(row).sort();
      token = "o" + names.length + ";";
      for (let i = names.length - 1; i >= 0; i--) {
        stack.push(row[names[i]!]);
        stack.push(names[i]);
      }
    } else throw Error("Restore contains unsupported personal data.");
    const data = encode.encode(token);
    bytes += data.length;
    if (bytes > RESTORE_LIMITS.bytes || ++n > 8000000)
      throw Error(
        "This personal restore exceeds 128 MiB. Current data and the prior recovery slot were retained.",
      );
    hash.update(data);
    if (n % 256 === 0) await yieldCatalogTask();
  }
  return { hash: bytesToHex(hash.digest()), bytes, rows: snapshot.rows.length };
}
