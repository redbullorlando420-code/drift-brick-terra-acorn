type SweepChannel = {
  id: string;
  kind: string;
  catalogCheckedAt?: number;
  catalogExhaustedAt?: number;
  lastProviderFailure?: { at: number; kind?: string; retryAt?: number; cooldownScope?: string };
  channelId?: string;
  importNeedsReview?: boolean;
};

function sourceReady(channel: SweepChannel, now: number) {
  const failure = channel.lastProviderFailure;
  if (!failure) return true;
  // Provider-wide rate limits already have an exact retry deadline. Applying
  // an additional one-hour missing-source hold prevents recovery after it.
  if (failure.kind === 'rate-limited') return now >= (failure.retryAt ?? failure.at + 5 * 60_000);
  return now - failure.at >= 60 * 60_000;
}

/** Feed checks rotate durably across confirmed creators. A catalog-only rate
 * limit must not suppress their independent RSS feeds; unresolved handles
 * cannot turn a lightweight check into another expensive HTML request. */
export function selectYoutubeFeedChannels<T extends SweepChannel & { lastCheckedAt?: number }>(channels: T[], counts: ReadonlyMap<string, number>, now: number, limit: number): T[] {
  const eligible = channels.filter(channel => channel.kind === 'youtube' && !channel.importNeedsReview && !channel.id.startsWith('ytpl:')
    && (channel.channelId || /^yt:UC[\w-]{20,}$/.test(channel.id))
    && (channel.lastProviderFailure?.kind === 'rate-limited' && channel.lastProviderFailure.cooldownScope === 'catalog' || sourceReady(channel, now)))
    .sort((a, b) => (a.lastCheckedAt ?? 0) - (b.lastCheckedAt ?? 0) || a.id.localeCompare(b.id));
  const empty = eligible.filter(channel => !(counts.get(channel.id) ?? 0)).slice(0, Math.ceil(limit / 2));
  const selected = new Set(empty.map(channel => channel.id));
  return [...empty, ...eligible.filter(channel => !selected.has(channel.id)).slice(0, Math.max(0, limit - empty.length))];
}

export function youtubeSweepDue(lastRunAt: number, now: number, intervalMs: number): boolean {
  return !Number.isFinite(lastRunAt) || lastRunAt <= 0 || now - lastRunAt >= intervalMs;
}

/** Reserve recent-feed slots for empty sources without increasing background
 * request volume. Failed sources take a cooldown instead of pinning the queue. */
export function selectYoutubeCoverageRecovery<T extends SweepChannel & { lastCheckedAt?: number }>(channels: T[], counts: ReadonlyMap<string, number>, now: number, limit: number): T[] {
  return channels.filter(channel => channel.kind === "youtube" && !channel.importNeedsReview && !(counts.get(channel.id) ?? 0)
    && sourceReady(channel, now))
    .sort((a, b) => (a.lastCheckedAt ?? 0) - (b.lastCheckedAt ?? 0) || a.id.localeCompare(b.id)).slice(0, limit);
}

/** Resume the least recently crawled creator first; completed archives rest a week. */
export function selectYoutubeSweepChannels<T extends SweepChannel>(
  channels: T[], now: number, count: number, exhaustedRecheckMs: number, options?: { recheckExhaustedWhenIdle?: boolean; includePlaylists?: boolean; includeExhausted?: boolean; videoCounts?: ReadonlyMap<string, number> },
): T[] {
  const youtube = channels
    .filter((channel) => channel.kind === "youtube" && !channel.importNeedsReview && (options?.includePlaylists || !channel.id.startsWith("ytpl:")))
    .filter((channel) => options?.includeExhausted || sourceReady(channel, now))
    .filter((channel) => options?.includeExhausted || !channel.catalogExhaustedAt || now - channel.catalogExhaustedAt >= exhaustedRecheckMs);
  const eligible = youtube.length ? youtube : options?.recheckExhaustedWhenIdle ? channels.filter((channel) => channel.kind === "youtube" && !channel.importNeedsReview && (options.includePlaylists || !channel.id.startsWith("ytpl:"))) : [];
  const sorted = eligible
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
    ;
  // Unresolved import stubs need recovery turns, but cannot consume a sweep
  // ahead of thousands of confirmed creators with unfinished archives.
  if (!options?.videoCounts) return sorted.slice(0, count);
  const confirmed = sorted.filter(channel => channel.channelId || /^yt:UC[\w-]{20,}$/.test(channel.id) || channel.id.startsWith('ytpl:') || (options.videoCounts!.get(channel.id) ?? 0) > 0);
  const confirmedIds = new Set(confirmed.map(channel => channel.id));
  const unresolved = sorted.filter(channel => !confirmedIds.has(channel.id));
  if (!confirmed.length) return unresolved.slice(0, count);
  const recoverySlots = count > 1 && unresolved.length ? Math.min(unresolved.length, Math.ceil(count / 8)) : 0;
  const selected = confirmed.slice(0, count - recoverySlots);
  return [...selected, ...unresolved.slice(0, Math.max(recoverySlots, count - selected.length))].slice(0, count);
}

type LiveCheckChannel = { id: string; kind: string; channelId?: string; liveCheckedAt?: number; live?: boolean };

/**
 * Keep known-live creators fresh while reserving half the batch to discover
 * new streams across a large follow list. Both groups rotate least-recently
 * checked first.
 */
export function selectYoutubeLiveChannels<T extends LiveCheckChannel>(channels: T[], count: number, confirmedOnly = false): T[] {
  const eligible = channels
    .filter((channel) => channel.kind === "youtube" && !(channel as SweepChannel).importNeedsReview && !channel.id.startsWith("ytpl:"))
    .filter(channel => !confirmedOnly || channel.channelId || /^yt:UC[\w-]{20,}$/.test(channel.id))
    .sort((a, b) => (a.liveCheckedAt ?? 0) - (b.liveCheckedAt ?? 0) || a.id.localeCompare(b.id));
  const active = eligible.filter((channel) => channel.live);
  const discovery = eligible.filter((channel) => !channel.live);
  const activeSlots = Math.min(active.length, Math.ceil(Math.max(0, count) / 2));
  const selected = [...active.slice(0, activeSlots), ...discovery.slice(0, Math.max(0, count) - activeSlots)];
  if (selected.length < count) selected.push(...active.slice(activeSlots, activeSlots + count - selected.length));
  return selected;
}
