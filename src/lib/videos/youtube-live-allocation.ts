import { youtubeLiveInterval, youtubeNearStart } from './youtube-events.ts';
import type { FollowedChannel } from "./types.ts";
import { selectLiveRefreshChannels } from "./live-refresh-selection.ts";

export type LiveAllocationClass = {
  due: number;
  unchecked: number;
  oldestDueMs?: number;
  successful5m: number;
  failed5m: number;
};
export type YoutubeLiveAllocation = {
  at: number;
  slots: number;
  liveSlots: number;
  discoverySlots: number;
  reason:
    | "discovery-debt"
    | "discovery-recovery"
    | "urgent-live"
    | "balanced"
    | "single-slot"
    | "one-class"
    | "clear";
  knownLive: LiveAllocationClass;
  discovery: LiveAllocationClass;
};
const attemptAt = (c: FollowedChannel) =>
  Math.max(c.liveCheckedAt ?? 0, c.lastLiveFailure?.at ?? 0);
const order = (a: FollowedChannel, b: FollowedChannel) =>
  attemptAt(a) - attemptAt(b) ||
  (a.liveCheckedAt ?? 0) - (b.liveCheckedAt ?? 0) ||
  a.id.localeCompare(b.id);

/** Bounded allocation, not additional concurrency. Failed attempts rotate too:
 * an eligible failing prefix cannot take every new short sweep. */
export function allocateYoutubeLive(
  channels: readonly FollowedChannel[],
  limit: number,
  now: number,
  knownLiveMs: number,
  discoveryMs: number,
  excluded?: ReadonlySet<string>,
) {
  const eligible = selectLiveRefreshChannels(channels, "youtube", channels.length, now);
  const due = eligible.filter(
    (c) =>
      !excluded?.has(c.id) &&
      (!c.liveCheckedAt || now - c.liveCheckedAt >= youtubeLiveInterval(c,now,knownLiveMs,discoveryMs)),
  );
  const live = due.filter((c) => c.live).sort(order),
    discovery = due.filter((c) => !c.live).sort(order);
  const metric = (rows: FollowedChannel[]): LiveAllocationClass => ({
    due: rows.length,
    unchecked: rows.filter((c) => !c.liveCheckedAt).length,
    oldestDueMs: rows.reduce<number | undefined>(
      (age, c) => (c.liveCheckedAt ? Math.max(age ?? 0, now - c.liveCheckedAt) : age),
      undefined,
    ),
    successful5m: 0,
    failed5m: 0,
  });
  const knownLive = metric(live),
    discoveryStats = metric(discovery);
  // These are latest distinct-creator observations, not an invented completion ETA.
  for (const c of channels)
    if (
      c.kind === "youtube" &&
      !c.importNeedsReview &&
      !c.id.startsWith("ytpl:") &&
      (c.channelId || /^yt:UC[\w-]{20,}$/.test(c.id))
    ) {
      const stats = c.live ? knownLive : discoveryStats;
      if (c.liveCheckedAt && c.liveCheckedAt <= now && now - c.liveCheckedAt < 300_000)
        stats.successful5m++;
      const failure = c.lastLiveFailure;
      if (
        failure &&
        failure.at >= (c.liveCheckedAt ?? 0) &&
        failure.at <= now &&
        now - failure.at < 300_000
      )
        stats.failed5m++;
    }
  const slots = Math.min(due.length, Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0);
  let reason: YoutubeLiveAllocation["reason"] = "clear",
    liveSlots = 0;
  if (slots) {
    if (!live.length || !discovery.length) {
      reason = "one-class";
      liveSlots = Math.min(slots, live.length);
    } else if (slots === 1) {
      reason = "single-slot";
      liveSlots = order(live[0], discovery[0]) < 0 ? 1 : 0;
    } else {
      const debt =
        discovery.length >= slots * 4 ||
        discoveryStats.unchecked > 0 ||
        (discoveryStats.oldestDueMs ?? 0) >= discoveryMs * 2;
      const struggling =
        discoveryStats.failed5m >= 8 && discoveryStats.failed5m > discoveryStats.successful5m;
      const urgent = (knownLive.oldestDueMs ?? 0) >= knownLiveMs * 1.5 || knownLive.unchecked > 0;
      reason = debt
        ? "discovery-debt"
        : struggling
          ? "discovery-recovery"
          : urgent
            ? "urgent-live"
            : "balanced";
      const share = debt || struggling ? 0.25 : urgent ? 0.75 : 0.5;
      liveSlots = Math.min(
        live.length,
        Math.ceil(slots * share),
        slots - Math.min(discovery.length, Math.max(1, Math.ceil(slots * 0.25))),
      );
    }
  }
  const discoverySlots=slots-liveSlots;
  // Near-start events borrow at most a quarter of discovery slots; the rest
  // retain oldest-attempt fairness even with thousands of scheduled creators.
  const near=discoverySlots>1?discovery.filter(c=>youtubeNearStart(c,now)).slice(0,Math.floor(discoverySlots/4)):[];
  const chosen=new Set(near.map(c=>c.id));
  const selected = [...live.slice(0, liveSlots), ...near,...discovery.filter(c=>!chosen.has(c.id)).slice(0,discoverySlots-near.length)];
  if (selected.length < slots)
    selected.push(...live.slice(liveSlots, liveSlots + slots - selected.length));
  const actualLive = selected.filter((c) => c.live).length;
  return {
    channels: selected,
    allocation: {
      at: now,
      slots,
      liveSlots: actualLive,
      discoverySlots: selected.length - actualLive,
      reason,
      knownLive,
      discovery: discoveryStats,
    } satisfies YoutubeLiveAllocation,
  };
}
