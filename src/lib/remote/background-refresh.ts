import { LIBRARY_LIMITS } from '../library-limits.ts';

export type RemoteRefreshLane = 'youtube-archive' | 'youtube-feed' | 'youtube-live' | 'twitch';
export type RemoteRefreshTurn = {
  lane: RemoteRefreshLane;
  lastAttemptAt: number;
  intervalMs: number;
  eligible: boolean;
  recovery?: boolean;
};

/** One owner picks the next due job. Busy/paused skips never consume a turn.
 * Archive recovery gets the first probe after a provider cooldown; otherwise
 * the oldest due lane wins so feed/live/Twitch jobs keep receiving turns.
 * Visible idle pages retain bounded archives and recent feeds. Healthy feeds
 * can keep adding uploads while deeper catalog requests are cooling down. */
export function nextRemoteRefresh(turns: readonly RemoteRefreshTurn[], now: number, active = true): RemoteRefreshLane | null {
  const due = turns.filter(turn => turn.eligible && (active || turn.lane === 'youtube-archive' || turn.lane === 'youtube-feed') && (!turn.lastAttemptAt || now - turn.lastAttemptAt >= turn.intervalMs));
  return due.find(turn => turn.recovery)?.lane ?? due.sort((a, b) =>
    (a.lastAttemptAt ? a.lastAttemptAt + a.intervalMs : 0) - (b.lastAttemptAt ? b.lastAttemptAt + b.intervalMs : 0)
  )[0]?.lane ?? null;
}

/** A bounded sweep adds several small creator responses without growing a
 * single response or outrunning a slow user-selected network gap. */
export function scheduledYoutubeSources(sourceLimit: number, requestGapMs: number) {
  return Math.max(1, Math.min(LIBRARY_LIMITS.youtubeScheduledRefreshChannels, sourceLimit, Math.floor(60_000 / Math.max(1, requestGapMs * 6))));
}

