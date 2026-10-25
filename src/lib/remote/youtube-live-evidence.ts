import {
  pageJson,
  youtubeLiveData,
  youtubeLivePage,
  type YoutubeLiveObservation,
} from "./youtube-live.ts";

export type YoutubeLiveEvidence = {
  at: number;
  state: "live" | "absent" | "unknown";
  source: "streams" | "home" | "watch" | "unreadable";
  complete: boolean;
  reason:
    | "live-found"
    | "complete-streams"
    | "partial-streams"
    | "home-only"
    | "known-broadcasts"
    | "unreadable";
};
export type YoutubeLiveRead = {
  observations: YoutubeLiveObservation[];
  evidence: YoutubeLiveEvidence;
};
export class YoutubeLiveEvidenceError extends Error {
  evidence: YoutubeLiveEvidence;
  constructor(evidence: YoutubeLiveEvidence) {
    super(
      "YouTube could not confirm that this stream ended (" +
        evidence.reason +
        "). The last live observation was kept.",
    );
    this.name = "YoutubeLiveEvidenceError";
    this.evidence = evidence;
  }
}
export function isYoutubeStreamsTab(tab: any) {
  return (
    /\/streams(?:[?#]|$)/.test(tab?.endpoint?.commandMetadata?.webCommandMetadata?.url ?? "") ||
    tab?.title === "Live"
  );
}
function hasContinuation(root: unknown) {
  const stack: any[] = [root];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    if (
      node.continuationItemRenderer ||
      node.continuationItemViewModel ||
      node.continuationCommand ||
      node.nextContinuationData ||
      node.reloadContinuationData ||
      node.continuations?.length
    )
      return true;
    for (const value of Object.values(node))
      if (value && typeof value === "object") stack.push(value);
  }
  return false;
}
/** A readable Home shelf supplies positive evidence only. A Streams page with
 * unread continuations cannot establish absence, even when its first page is empty. */
export function youtubeCatalogLiveEvidence(
  page: any,
  channelId: string,
  at = Date.now(),
): YoutubeLiveRead {
  if (page?.metadata?.channelMetadataRenderer?.externalId !== channelId)
    throw Error("YouTube did not confirm the requested live creator.");
  const selected = page.contents?.twoColumnBrowseResultsRenderer?.tabs?.find(
    (row: any) => row.tabRenderer?.selected,
  )?.tabRenderer;
  const observations = youtubeLiveData(page, channelId);
  const streams = isYoutubeStreamsTab(selected);
  const complete = streams && !hasContinuation(selected.content) && observations.length < 64;
  return {
    observations,
    evidence: {
      at,
      state: observations.length ? "live" : complete ? "absent" : "unknown",
      source: streams ? "streams" : "home",
      complete,
      reason: complete
        ? observations.length
          ? "live-found"
          : "complete-streams"
        : streams
          ? "partial-streams"
          : "home-only",
    },
  };
}
/** A watch page can establish absence only for the exact known broadcast and
 * creator, with playable metadata and an explicit ended/not-live signal. */
export function youtubeWatchLiveEvidence(
  html: string,
  channelId: string,
  videoId: string,
  at = Date.now(),
): YoutubeLiveRead {
  const player = pageJson(html, "ytInitialPlayerResponse");
  const details = player?.videoDetails,
    live = player?.microformat?.playerMicroformatRenderer?.liveBroadcastDetails;
  const owned =
    details?.channelId === channelId &&
    details?.videoId === videoId &&
    /^[A-Za-z0-9_-]{11}$/.test(videoId);
  const readable = player?.playabilityStatus?.status === "OK";
  if (owned && readable && live?.isLiveNow === true) {
    const observed = youtubeLivePage(html, channelId);
    if (observed)
      return {
        observations: [observed],
        evidence: {
          at,
          state: "live",
          source: "watch",
          complete: true,
          reason: "known-broadcasts",
        },
      };
  }
  if (
    owned &&
    readable &&
    (live?.isLiveNow === false ||
      (typeof live?.endTimestamp === "string" &&
        Number.isFinite(Date.parse(live.endTimestamp)) &&
        Date.parse(live.endTimestamp) <= at))
  )
    return {
      observations: [],
      evidence: {
        at,
        state: "absent",
        source: "watch",
        complete: true,
        reason: "known-broadcasts",
      },
    };
  return {
    observations: [],
    evidence: { at, state: "unknown", source: "watch", complete: false, reason: "unreadable" },
  };
}
export function youtubeHtmlLiveEvidence(html: string, channelId: string, at = Date.now()) {
  const page = pageJson(html, "ytInitialData");
  if (!page)
    throw Error("YouTube returned an unreadable live page. The previous observation was kept.");
  return youtubeCatalogLiveEvidence(page, channelId, at);
}
export function normalizeYoutubeLiveEvidence(value: unknown): YoutubeLiveEvidence | undefined {
  if (!value || typeof value !== "object") return;
  const v = value as Record<string, unknown>;
  if (
    typeof v.at !== "number" ||
    !Number.isFinite(v.at) ||
    v.at <= 0 ||
    !["live", "absent", "unknown"].includes(String(v.state)) ||
    !["streams", "home", "watch", "unreadable"].includes(String(v.source)) ||
    typeof v.complete !== "boolean" ||
    ![
      "live-found",
      "complete-streams",
      "partial-streams",
      "home-only",
      "known-broadcasts",
      "unreadable",
    ].includes(String(v.reason))
  )
    return;
  if (v.state === "absent" && (!v.complete || !["streams", "watch"].includes(String(v.source))))
    return;
  return {
    at: v.at,
    state: v.state,
    source: v.source,
    complete: v.complete,
    reason: v.reason,
  } as YoutubeLiveEvidence;
}
export function youtubeEvidenceExplanation(evidence: YoutubeLiveEvidence) {
  if (evidence.reason === "partial-streams")
    return "YouTube returned only part of the Streams catalog. Missing broadcasts remain provisionally live.";
  if (evidence.reason === "home-only")
    return "Only the Home shelf was readable. It cannot confirm that a broadcast ended.";
  if (evidence.state === "unknown")
    return "The latest response did not confirm the broadcast state. The previous live observation is retained.";
  if (evidence.state === "absent")
    return evidence.source === "watch"
      ? "The exact known broadcasts were explicitly not live. The ten-minute hold applies."
      : "A complete Streams listing did not contain a live broadcast. The ten-minute hold applies.";
  return evidence.complete
    ? "Fresh live evidence was confirmed."
    : "Fresh live broadcasts were found; the listing could not rule out other broadcasts.";
}

/** At most two exact known broadcasts may supplement an incomplete listing.
 * This never walks a catalog continuation or probes ordinary offline creators. */
export async function completeKnownYoutubeEvidence(
  result: YoutubeLiveRead,
  knownIds: readonly string[],
  channelId: string,
  read: (id: string) => Promise<string>,
  now = Date.now,
): Promise<YoutubeLiveRead> {
  if (result.evidence.complete) return result;
  const known = [...new Set(knownIds.filter((id) => /^[A-Za-z0-9_-]{11}$/.test(id)))];
  const found = new Set(result.observations.map((row) => row.id));
  const missing = known.filter((id) => !found.has(id));
  if (!known.length || !missing.length || missing.length > 2) return result;
  const observations = [...result.observations];
  for (const id of missing) {
    let probe: YoutubeLiveRead;
    try {
      probe = youtubeWatchLiveEvidence(await read(id), channelId, id, now());
    } catch {
      return result;
    }
    if (!probe.evidence.complete) return result;
    observations.push(...probe.observations);
  }
  return {
    observations,
    evidence: {
      at: now(),
      state: observations.length ? "live" : "absent",
      source: missing.length ? "watch" : result.evidence.source,
      complete: true,
      reason: missing.length ? "known-broadcasts" : "live-found",
    },
  };
}
