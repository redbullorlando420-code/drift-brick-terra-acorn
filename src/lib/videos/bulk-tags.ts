import type { VideoMetadataProvenance } from "./types";

export const BULK_TAG_KEY = "bulk-tag-receipt:v1";
export const BULK_TAG_LIMIT = 48;
export const BULK_TAG_BATCH = 6;
export type BulkMode = "add" | "remove";
export type TagSnapshot = { tags: string[]; manualAt: number; observedAt: number };
export type BulkTagTarget = { id: string; identity: string; title: string; before: TagSnapshot };
export type BulkTagEntry = BulkTagTarget & {
  after: TagSnapshot;
  source?: VideoMetadataProvenance["tags"][string];
};
export type BulkTagScope = {
  id: string;
  profileId: string;
  collectionRevision: number;
  mode: BulkMode;
  tag: string;
  total: number;
};
export type BulkTagReceipt = BulkTagScope & {
  version: 1;
  revision: number;
  entries: BulkTagEntry[];
};

export function normalizeBulkTag(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^keyword-/, "")
    .slice(0, 65);
}
export const validBulkTag = (tag: string) => /^[\p{L}\p{N}][\p{L}\p{N}_-]{0,63}$/u.test(tag);
export const sameTags = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((tag, index) => tag === b[index]);
export function tagSnapshot(tags: string[], provenance?: VideoMetadataProvenance): TagSnapshot {
  return { tags, manualAt: provenance?.manualTagsAt ?? 0, observedAt: provenance?.updatedAt ?? 0 };
}
export function changeBulkTags(tags: string[], mode: BulkMode, tag: string) {
  if (mode === "add") return tags.includes(tag) || tags.length >= 64 ? undefined : [...tags, tag];
  return tags.includes(tag) ? tags.filter((value) => value !== tag) : undefined;
}
/** Undo touches only the operation's tag, even if background metadata added others. */
export function reverseBulkTag(tags: string[], before: string[], tag: string) {
  if (!before.includes(tag)) return tags.filter(value => value !== tag);
  const oldIndex = before.indexOf(tag);
  const nextNeighbor = before.slice(oldIndex + 1).find(value => tags.includes(value));
  const at = nextNeighbor === undefined ? Math.min(oldIndex, tags.length) : tags.indexOf(nextNeighbor);
  return [...tags.slice(0, at), tag, ...tags.slice(at)];
}
const boundedString = (raw: unknown, max: number): raw is string =>
  typeof raw === "string" && raw.length <= max;
const clock = (value: unknown): value is number =>
  Number.isSafeInteger(value) && Number(value) >= 0;
const snapshot = (value: TagSnapshot | undefined) =>
  Boolean(
    value &&
    Array.isArray(value.tags) &&
    value.tags.length <= 64 &&
    value.tags.every((tag) => boundedString(tag, 512)) &&
    clock(value.manualAt) &&
    clock(value.observedAt),
  );
export function validBulkTarget(target: BulkTagTarget | undefined) {
  return Boolean(
    target &&
    target.id &&
    boundedString(target.id, 512) &&
    boundedString(target.identity, 1024) &&
    boundedString(target.title, 300) &&
    snapshot(target.before),
  );
}
export function validBulkScope(value: BulkTagScope, profileId: string) {
  return Boolean(
    value &&
    value.id &&
    boundedString(value.id, 96) &&
    value.profileId === profileId &&
    clock(value.collectionRevision) &&
    (value.mode === "add" || value.mode === "remove") &&
    typeof value.tag === "string" &&
    validBulkTag(value.tag) &&
    clock(value.total) &&
    value.total > 0 &&
    value.total <= BULK_TAG_LIMIT,
  );
}
export function readBulkTagReceipt(raw: unknown, profileId: string): BulkTagReceipt | undefined {
  if (raw === undefined) return;
  const value = raw as BulkTagReceipt;
  if (
    !validBulkScope(value, profileId) ||
    value.version !== 1 ||
    !clock(value.revision) ||
    !Array.isArray(value.entries) ||
    !value.entries.length ||
    value.entries.length > value.total ||
    !value.entries.every(
      (entry) =>
        validBulkTarget(entry) &&
        snapshot(entry.after) &&
        (entry.source === undefined || boundedString(entry.source, 64)),
    ) ||
    new Set(value.entries.map((entry) => entry.id)).size !== value.entries.length
  )
    throw Error("The bulk tag undo record could not be read. Existing tags were kept.");
  return value;
}
