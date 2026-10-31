import type { FollowedChannel } from "./types";
export type YoutubeEvent = {
  id: string;
  title: string;
  state: "upcoming" | "live" | "completed" | "uncertain";
  observedAt: number;
  checkedAt?: number;
  scheduledAt?: number;
  previousScheduledAt?: number;
  wasLiveAt?: number;
  missingSince?: number;
  announcedAt?: number;
};
export function normalizeYoutubeEvents(raw: unknown): YoutubeEvent[] | undefined {
  if (!Array.isArray(raw)) return;
  const seen = new Set<string>();
  return raw.slice(0, 64).flatMap((r) => {
    if (
      !r ||
      !/^[\w-]{11}$/.test(r.id) ||
      seen.has(r.id) ||
      typeof r.title !== "string" ||
      !["upcoming", "live", "completed", "uncertain"].includes(r.state) ||
      !Number.isFinite(r.observedAt) ||
      r.observedAt <= 0
    )
      return [];
    seen.add(r.id);
    const event: YoutubeEvent = {
      id: r.id,
      title: r.title.slice(0, 512),
      state: r.state,
      observedAt: r.observedAt,
    };
    for (const field of [
      "checkedAt",
      "scheduledAt",
      "previousScheduledAt",
      "wasLiveAt",
      "missingSince",
      "announcedAt",
    ] as const)
      if (typeof r[field] === "number" && Number.isFinite(r[field]) && r[field] > 0)
        event[field] = r[field];
    return [event];
  });
}
export type UpcomingObservation = { id: string; title?: string; scheduledAt?: number };
/** A clock crossing is never a state transition. Only provider observations
 * make a broadcast live; complete absence after the existing ten-minute hold
 * completes a previously observed live event. Pre-live disappearance is uncertain. */
export function advanceYoutubeEvents(
  previous: readonly YoutubeEvent[],
  upcoming: readonly UpcomingObservation[],
  live: readonly { id: string; title?: string }[],
  complete: boolean,
  at: number,
): YoutubeEvent[] {
  const map = new Map((normalizeYoutubeEvents(previous) ?? []).map((e) => [e.id, e]));
  const observed = new Set<string>();
  for (const row of upcoming.slice(0, 64)) {
    observed.add(row.id);
    const old = map.get(row.id);
    map.set(row.id, {
      ...old,
      id: row.id,
      title: row.title || old?.title || row.id,
      state: old?.wasLiveAt ? "uncertain" : "upcoming",
      observedAt: at,
      checkedAt: at,
      scheduledAt: row.scheduledAt ?? old?.scheduledAt,
      previousScheduledAt:
        row.scheduledAt && old?.scheduledAt && row.scheduledAt !== old.scheduledAt
          ? old.scheduledAt
          : old?.previousScheduledAt,
      missingSince: undefined,
    });
  }
  for (const row of live.slice(0, 64)) {
    observed.add(row.id);
    const old = map.get(row.id);
    map.set(row.id, {
      ...old,
      id: row.id,
      title: row.title || old?.title || row.id,
      state: "live",
      observedAt: at,
      checkedAt: at,
      wasLiveAt: old?.wasLiveAt ?? at,
      missingSince: undefined,
      announcedAt: old?.announcedAt ?? at,
    });
  }
  for (const [id, old] of map)
    if (!observed.has(id) && old.state !== "completed") {
      // Partial listings retain evidence and report uncertainty, never completion.
      const missingSince = complete ? (old.missingSince ?? at) : undefined;
      map.set(id, {
        ...old,
        state:
          complete && old.wasLiveAt && missingSince !== undefined && at - missingSince >= 600_000
            ? "completed"
            : "uncertain",
        checkedAt: at,
        missingSince,
      });
    }
  return [...map.values()]
    .sort((a, b) => b.observedAt - a.observedAt || a.id.localeCompare(b.id))
    .slice(0, 64);
}
export function youtubeNearStart(channel: Pick<FollowedChannel, "youtubeEvents">, now: number) {
  return (
    channel.youtubeEvents?.some(
      (e) =>
        (e.state === "upcoming" || e.state === "uncertain") &&
        !e.wasLiveAt &&
        e.scheduledAt !== undefined &&
        e.scheduledAt - now <= 15 * 60_000 &&
        e.scheduledAt - now >= -30 * 60_000,
    ) ?? false
  );
}
export function youtubeLiveInterval(
  channel: FollowedChannel,
  now: number,
  liveMs: number,
  discoveryMs: number,
) {
  return channel.live || youtubeNearStart(channel, now) ? liveMs : discoveryMs;
}

/** The canonical card carries the receipt across channel renames, retries and
 * notification dismissal. This creates in-app alerts only when enabled. */
export function youtubeEventNotices(
  oldVideo: (video: import("./types").LibraryVideo) => import("./types").LibraryVideo | undefined,
  incoming: import("./types").LibraryVideo[],
  notices: import("./types").AppNotice[],
  enabled: boolean,
) {
  if (!enabled) return notices;
  const seen = new Set(notices.map((n) => n.id)),
    added: import("./types").AppNotice[] = [];
  for (const video of incoming) {
    const e = video.remote?.youtubeEvent;
    if (
      !e ||
      e.state !== "live" ||
      !e.announcedAt ||
      oldVideo(video)?.remote?.youtubeEvent?.announcedAt ||
      seen.has("youtube-live:" + e.id)
    )
      continue;
    seen.add("youtube-live:" + e.id);
    added.push({
      id: "youtube-live:" + e.id,
      at: e.announcedAt,
      read: false,
      kind: "youtube",
      title: (video.remote?.channelName || "YouTube creator") + " is live",
      body: e.title,
      videoId: video.id,
    });
  }
  return added.length ? [...added, ...notices].slice(0, 40) : notices;
}
