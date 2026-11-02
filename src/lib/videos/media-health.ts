import type { LibraryVideo } from "./types";
import { deletionCard } from "./deletion-tombstones.ts";
import { twitchIdentity } from "./twitch-identity.ts";
export const MEDIA_HEALTH_KEY = "media-health:v1",
  MEDIA_HEALTH_LIMIT = 1024;
export type MediaStatus =
  | "available"
  | "publicly-unavailable"
  | "unknown"
  | "permission-needed"
  | "source-disconnected"
  | "missing-file"
  | "playback-error"
  | "content-mismatch";
export type MediaChoice = "review" | "bookmark" | "hidden";
export type MediaObservation = {
  video: LibraryVideo;
  private: boolean;
  basis: string;
  status: MediaStatus;
  at: number;
  code: string;
};
export type MediaHealthEntry = MediaObservation & {
  choice: MediaChoice;
  choiceAt: number;
  confirmedAt?: number;
  lastConfirmed?: "available" | "publicly-unavailable";
};
export type MediaHealthLedger = {
  version: 1;
  revision: number;
  entries: Record<string, MediaHealthEntry>;
};
export const emptyMediaHealth = (): MediaHealthLedger => ({ version: 1, revision: 0, entries: {} });
export function mediaBasis(video: LibraryVideo) {
  if (!video.remote) return "local:" + video.id;
  const id =
    video.remote.kind === "twitch" ? twitchIdentity(video.remote, video.extension) : undefined;
  return id && id.kind !== "live" ? "twitch:" + id.kind + ":" + id.value : undefined;
}
export function parseMediaHealth(raw: unknown): MediaHealthLedger {
  if (raw === undefined) return emptyMediaHealth();
  const r = raw as MediaHealthLedger;
  if (
    !r ||
    r.version !== 1 ||
    !Number.isSafeInteger(r.revision) ||
    r.revision < 0 ||
    !r.entries ||
    typeof r.entries !== "object" ||
    Array.isArray(r.entries) ||
    Object.keys(r.entries).length > MEDIA_HEALTH_LIMIT
  )
    throw Error("Unsupported media recovery record. Existing records were kept.");
  for (const [id, row] of Object.entries(r.entries)) {
    if (
      !row ||
      !row.video ||
      row.video.id !== id ||
      row.video.isSample ||
      typeof row.private !== "boolean" ||
      !mediaBasis(row.video) ||
      row.basis !== mediaBasis(row.video) ||
      ![
        "available",
        "publicly-unavailable",
        "unknown",
        "permission-needed",
        "source-disconnected",
        "missing-file",
        "playback-error",
        "content-mismatch",
      ].includes(row.status) ||
      !["review", "bookmark", "hidden"].includes(row.choice) ||
      ![row.at, row.choiceAt].every((n) => Number.isSafeInteger(n) && n >= 0) ||
      typeof row.code !== "string" ||
      row.code.length > 80 ||
      (row.confirmedAt !== undefined &&
        (!Number.isSafeInteger(row.confirmedAt) || row.confirmedAt < 0)) ||
      (row.lastConfirmed !== undefined &&
        !["available", "publicly-unavailable"].includes(row.lastConfirmed))
    )
      throw Error("Invalid media recovery entry. Existing records were kept.");
    deletionCard(row.video);
    if (
      row.video.remote &&
      row.status !== "available" &&
      row.status !== "publicly-unavailable" &&
      row.status !== "unknown" &&
      row.status !== "playback-error"
    )
      throw Error("Invalid remote media observation.");
  }
  if (JSON.stringify(r).length > 8 * 1024 * 1024)
    throw Error("Media recovery exceeds its storage budget. Existing records were kept.");
  return r;
}
export function observeMediaHealth(
  ledger: MediaHealthLedger,
  observation: MediaObservation,
): MediaHealthLedger {
  const old = ledger.entries[observation.video.id];
  if (old && old.basis !== observation.basis)
    throw Error("The media identity changed. Review the current title before updating recovery.");
  if (old && old.at > observation.at) return ledger;
  if (!old && Object.keys(ledger.entries).length >= MEDIA_HEALTH_LIMIT)
    throw Error("Media recovery is full. Existing bookmarks were kept.");
  const confirmed =
    observation.status === "available" || observation.status === "publicly-unavailable";
  const entry: MediaHealthEntry = {
    ...old,
    ...observation,
    private: old?.private || observation.private,
    video: deletionCard(
      old?.private || observation.private
        ? { ...observation.video, privateRetention: true }
        : observation.video,
    ),
    choice: old?.choice ?? "review",
    choiceAt: old?.choiceAt ?? 0,
    ...(confirmed
      ? {
          confirmedAt: observation.at,
          lastConfirmed: observation.status as "available" | "publicly-unavailable",
        }
      : {}),
  };
  return parseMediaHealth({
    ...ledger,
    revision: ledger.revision + 1,
    entries: { ...ledger.entries, [entry.video.id]: entry },
  });
}
export function mergeMediaHealth(
  current: MediaHealthLedger,
  incoming: MediaHealthLedger,
): MediaHealthLedger {
  let next = current;
  for (const row of Object.values(incoming.entries)) {
    next = observeMediaHealth(next, row);
    let entry = next.entries[row.video.id];
    if ((row.confirmedAt ?? -1) > (entry.confirmedAt ?? -1)) {
      entry = { ...entry, confirmedAt: row.confirmedAt, lastConfirmed: row.lastConfirmed };
      next = { ...next, entries: { ...next.entries, [row.video.id]: entry } };
    }
    if (row.private && !entry.private) {
      entry = { ...entry, private: true, video: { ...entry.video, privateRetention: true } };
      next = { ...next, entries: { ...next.entries, [row.video.id]: entry } };
    }
    if (row.choiceAt > entry.choiceAt)
      next = {
        ...next,
        entries: {
          ...next.entries,
          [row.video.id]: { ...entry, choice: row.choice, choiceAt: row.choiceAt },
        },
      };
  }
  return parseMediaHealth(next);
}
export function mediaStatusLabel(status: MediaStatus) {
  return {
    available: "Available at last check",
    "publicly-unavailable": "Not publicly available at last check",
    unknown: "Temporary error or unreadable response",
    "permission-needed": "Folder permission needed",
    "source-disconnected": "Source disconnected or unreadable",
    "missing-file": "File absent from the granted source",
    "playback-error": "Playback failed; availability unverified",
    "content-mismatch": "Different file contents; identity review needed",
  }[status];
}

let blockedReads = new Set<string>();
export function installMediaReadPolicy(ledger: MediaHealthLedger) {
  blockedReads = new Set(
    Object.values(ledger.entries)
      .filter((row) => row.status === "content-mismatch")
      .map((row) => row.video.id),
  );
}
export function mediaReadBlocked(id: string) {
  return blockedReads.has(id);
}
