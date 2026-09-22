import type { FollowedChannel, LibraryVideo } from "./types";

export type CreatorCoverageResolution =
  | { status: "present"; channelName: string }
  | { status: "resolved"; channelName: string; evidence: "channel-id" | "source-id" }
  | { status: "ambiguous"; candidates: string[] }
  | { status: "unresolved" }
  | { status: "unsupported" };

type FollowEvidence = "channel-id" | "source-id";

function normalizedLabel(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function stableId(value: string | undefined) {
  return value?.trim() ?? "";
}

/**
 * Resolve a missing display name only when the card and a saved follow share
 * an exact provider-issued identifier. Titles, filenames, and loose handles
 * are intentionally excluded: a plausible creator guess is worse than a
 * visible coverage gap in a media library.
 */
export function resolveCreatorCoverage(video: LibraryVideo, follows: FollowedChannel[]): CreatorCoverageResolution {
  const remote = video.remote;
  const existingName = remote?.channelName?.trim();
  if (existingName) return { status: "present", channelName: existingName };
  if (!remote || (remote.kind !== "youtube" && remote.kind !== "twitch")) return { status: "unsupported" };

  const matchingFollows = follows.filter((follow) => follow.kind === remote.kind && follow.title.trim());
  const evidence: Array<{ title: string; kind: FollowEvidence }> = [];
  const channelId = stableId(remote.channelId);
  const sourceId = stableId(video.folderId);

  for (const follow of matchingFollows) {
    if (channelId && stableId(follow.channelId) === channelId) {
      evidence.push({ title: follow.title.trim(), kind: "channel-id" });
    }
    if (sourceId && stableId(follow.id) === sourceId) {
      evidence.push({ title: follow.title.trim(), kind: "source-id" });
    }
  }

  const names = new Map<string, { title: string; evidence: FollowEvidence }>();
  for (const candidate of evidence) {
    const key = normalizedLabel(candidate.title);
    if (key && !names.has(key)) names.set(key, { title: candidate.title, evidence: candidate.kind });
  }
  const candidates = [...names.values()].sort((left, right) => left.title.localeCompare(right.title));
  if (!candidates.length) return { status: "unresolved" };
  if (candidates.length > 1) return { status: "ambiguous", candidates: candidates.map((candidate) => candidate.title) };
  return { status: "resolved", channelName: candidates[0].title, evidence: candidates[0].evidence };
}
