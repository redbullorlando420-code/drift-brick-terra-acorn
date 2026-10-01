type SweepChannel = {
  id: string;
  kind: string;
  catalogCheckedAt?: number;
  catalogExhaustedAt?: number;
  lastProviderFailure?: { at: number };
};

export function youtubeSweepDue(lastRunAt: number, now: number, intervalMs: number): boolean {
  return !Number.isFinite(lastRunAt) || lastRunAt <= 0 || now - lastRunAt >= intervalMs;
}

/** Reserve recent-feed slots for empty sources without increasing background
 * request volume. Failed sources take a cooldown instead of pinning the queue. */
export function selectYoutubeCoverageRecovery<T extends SweepChannel & { lastCheckedAt?: number }>(channels: T[], counts: ReadonlyMap<string, number>, now: number, limit: number): T[] {
  return channels.filter(channel => channel.kind === "youtube" && !(counts.get(channel.id) ?? 0)
    && (!channel.lastProviderFailure || now - channel.lastProviderFailure.at >= 60 * 60_000))
    .sort((a, b) => (a.lastCheckedAt ?? 0) - (b.lastCheckedAt ?? 0) || a.id.localeCompare(b.id)).slice(0, limit);
}

/** Resume the least recently crawled creator first; completed archives rest a week. */
export function selectYoutubeSweepChannels<T extends SweepChannel>(
  channels: T[], now: number, count: number, exhaustedRecheckMs: number, options?: { recheckExhaustedWhenIdle?: boolean; includePlaylists?: boolean; includeExhausted?: boolean; videoCounts?: ReadonlyMap<string, number> },
): T[] {
  const youtube = channels
    .filter((channel) => channel.kind === "youtube" && (options?.includePlaylists || !channel.id.startsWith("ytpl:")))
    .filter((channel) => options?.includeExhausted || !channel.lastProviderFailure || now - channel.lastProviderFailure.at >= 60 * 60_000)
    .filter((channel) => options?.includeExhausted || !channel.catalogExhaustedAt || now - channel.catalogExhaustedAt >= exhaustedRecheckMs);
  const eligible = youtube.length ? youtube : options?.recheckExhaustedWhenIdle ? channels.filter((channel) => channel.kind === "youtube" && (options.includePlaylists || !channel.id.startsWith("ytpl:"))) : [];
  return eligible
    .sort((a, b) => {
      const aCount = options?.videoCounts?.get(a.id) ?? 0;
      const bCount = options?.videoCounts?.get(b.id) ?? 0;
      // Give thin catalogs a bounded head start. An absolute tier would let
      // permanently empty sources starve every deeper archive indefinitely.
      const boost = 24 * 60 * 60_000;
      const priority = (channel: T, videos: number) => Math.max(channel.catalogCheckedAt ?? 0, channel.lastProviderFailure?.at ?? 0)
        - (options?.videoCounts && videos < 100 ? boost : 0);
      return priority(a, aCount) - priority(b, bCount)
        || aCount - bCount || a.id.localeCompare(b.id);
    })
    .slice(0, count);
}

type LiveCheckChannel = { id: string; kind: string; liveCheckedAt?: number; live?: boolean };

/**
 * Keep known-live creators fresh while reserving half the batch to discover
 * new streams across a large follow list. Both groups rotate least-recently
 * checked first.
 */
export function selectYoutubeLiveChannels<T extends LiveCheckChannel>(channels: T[], count: number): T[] {
  const eligible = channels
    .filter((channel) => channel.kind === "youtube" && !channel.id.startsWith("ytpl:"))
    .sort((a, b) => (a.liveCheckedAt ?? 0) - (b.liveCheckedAt ?? 0) || a.id.localeCompare(b.id));
  const active = eligible.filter((channel) => channel.live);
  const discovery = eligible.filter((channel) => !channel.live);
  const activeSlots = Math.min(active.length, Math.ceil(Math.max(0, count) / 2));
  const selected = [...active.slice(0, activeSlots), ...discovery.slice(0, Math.max(0, count) - activeSlots)];
  if (selected.length < count) selected.push(...active.slice(activeSlots, activeSlots + count - selected.length));
  return selected;
}
