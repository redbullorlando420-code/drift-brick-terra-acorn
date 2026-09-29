type SweepChannel = {
  id: string;
  kind: string;
  catalogCheckedAt?: number;
  catalogExhaustedAt?: number;
};

export function youtubeSweepDue(lastRunAt: number, now: number, intervalMs: number): boolean {
  return !Number.isFinite(lastRunAt) || lastRunAt <= 0 || now - lastRunAt >= intervalMs;
}

/** Resume the least recently crawled creator first; completed archives rest a week. */
export function selectYoutubeSweepChannels<T extends SweepChannel>(
  channels: T[], now: number, count: number, exhaustedRecheckMs: number, options?: { recheckExhaustedWhenIdle?: boolean; includePlaylists?: boolean; includeExhausted?: boolean },
): T[] {
  const youtube = channels
    .filter((channel) => channel.kind === "youtube" && (options?.includePlaylists || !channel.id.startsWith("ytpl:")))
    .filter((channel) => options?.includeExhausted || !channel.catalogExhaustedAt || now - channel.catalogExhaustedAt >= exhaustedRecheckMs);
  const eligible = youtube.length ? youtube : options?.recheckExhaustedWhenIdle ? channels.filter((channel) => channel.kind === "youtube" && (options.includePlaylists || !channel.id.startsWith("ytpl:"))) : [];
  return eligible
    .sort((a, b) => (a.catalogCheckedAt ?? 0) - (b.catalogCheckedAt ?? 0) || a.id.localeCompare(b.id))
    .slice(0, count);
}

type LiveCheckChannel = { id: string; kind: string; liveCheckedAt?: number };

/** The live poller has its own durable least-recently-checked rotation. */
export function selectYoutubeLiveChannels<T extends LiveCheckChannel>(channels: T[], count: number): T[] {
  return channels
    .filter((channel) => channel.kind === "youtube" && !channel.id.startsWith("ytpl:"))
    .sort((a, b) => (a.liveCheckedAt ?? 0) - (b.liveCheckedAt ?? 0) || a.id.localeCompare(b.id))
    .slice(0, count);
}
