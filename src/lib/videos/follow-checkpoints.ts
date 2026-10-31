import { normalizePlaylistWalk } from './youtube-playlist-walk.ts';
import { normalizeYoutubeEvents } from './youtube-events.ts';
import { normalizeTwitchPullPolicy } from './twitch-pull-policy.ts';
import { decodeTwitchArchiveCursor, encodeTwitchArchiveCursor } from './twitch-archive-cursor';
import { decodeTwitchClipCursor, encodeTwitchClipCursor } from './twitch-clip-cursor';
import type { FollowedChannel, TwitchPullDiagnostics } from './types';
import { normalizeTwitchClipDiagnostics } from './twitch-clip-coverage';
import { normalizeRecentPull } from './recent-pull';
import { normalizeTwitchRetry } from './twitch-retry';

const reasons = ['page-budget', 'entry-budget', 'exhausted', 'stalled', 'incomplete-page', 'challenge', 'provider-error', 'entry-limit'] as const;
export function normalizeTwitchPullDiagnostics(raw: unknown): TwitchPullDiagnostics | undefined {
  if (!raw || typeof raw !== 'object') return;
  const row = raw as Record<string, unknown>;
  const count = (key: string) => typeof row[key] === 'number' && Number.isSafeInteger(row[key]) && (row[key] as number) >= 0 && (row[key] as number) <= 1_000_000;
  if (typeof row.at !== 'number' || !Number.isFinite(row.at) || row.at <= 0 || !['pages', 'received', 'accepted', 'duplicates'].every(count) || !reasons.includes(row.stopReason as typeof reasons[number])) return;
  return { at: row.at, pages: row.pages as number, received: row.received as number, accepted: row.accepted as number, duplicates: row.duplicates as number,
    resumed: row.resumed === true, stopReason: row.stopReason as TwitchPullDiagnostics['stopReason'],
    ...(['ARCHIVE', 'HIGHLIGHT', 'UPLOAD'].includes(row.stage as string) ? { stage: row.stage as TwitchPullDiagnostics['stage'] } : {}),
    ...(typeof row.lastVideoId === 'string' && row.lastVideoId.length <= 128 ? { lastVideoId: row.lastVideoId } : {}),
    ...(typeof row.error === 'string' ? { error: row.error.slice(0, 240) } : {}),
  };
}

/** The same compact checkpoint contract is used by reloads and backup imports. */
export function normalizeFollowCheckpoints(row: Record<string, unknown>): Partial<FollowedChannel> {
  const out: Partial<FollowedChannel> = {};
  if(row.kind==='youtube'){const walk=normalizePlaylistWalk(row.playlistWalk),events=normalizeYoutubeEvents(row.youtubeEvents);if(walk)out.playlistWalk=walk;if(events)out.youtubeEvents=events;}
  const policy=normalizeTwitchPullPolicy(row.twitchPullPolicy); if(policy && row.kind==='twitch')out.twitchPullPolicy=policy;
  const clip = normalizeTwitchClipDiagnostics(row.twitchClipDiagnostics);
  if (clip) out.twitchClipDiagnostics = clip;
  const recentPull = normalizeRecentPull(row.recentPull); if (recentPull) out.recentPull = recentPull;
  for (const field of ['twitchArchiveRetry', 'twitchLiveRetry', 'twitchClipRetry', 'twitchClipRecentRetry'] as const) {
    const retry = normalizeTwitchRetry(row[field]); if (retry) out[field] = retry;
  }
  for (const field of ['twitchClipRecentAttemptedAt', 'twitchClipArchiveAttemptedAt', 'twitchArchiveCheckedAt', 'catalogCheckedAt', 'catalogExhaustedAt', 'twitchArchiveExhaustedAt', 'twitchClipExhaustedAt', 'twitchClipCheckedAt', 'twitchClipRecentCheckedAt'] as const) {
    const value = row[field]; if (typeof value === 'number' && Number.isFinite(value) && value > 0) out[field] = value;
  }
  if (typeof row.catalogCursor === 'string' && row.catalogCursor.length > 0 && row.catalogCursor.length <= 16_384) out.catalogCursor = row.catalogCursor;
  if (typeof row.twitchArchiveCursor === 'string' && row.twitchArchiveCursor.length <= 16_384) {
    const decoded = decodeTwitchArchiveCursor(row.twitchArchiveCursor);
    // Decoder deliberately falls back to the beginning for invalid input. Only
    // retain a valid encoded checkpoint in durable storage.
    try { const raw = JSON.parse(row.twitchArchiveCursor); if (raw?.v === 1 && raw.stage === decoded.stage && raw.after === decoded.after) out.twitchArchiveCursor = encodeTwitchArchiveCursor(decoded); } catch { /* invalid checkpoint */ }
  }
  if (typeof row.twitchClipCursor === 'string') out.twitchClipCursor = encodeTwitchClipCursor(decodeTwitchClipCursor(row.twitchClipCursor));
  if (typeof row.twitchArchiveLastVideoId === 'string' && row.twitchArchiveLastVideoId.length <= 128) out.twitchArchiveLastVideoId = row.twitchArchiveLastVideoId;
  const diagnostics = normalizeTwitchPullDiagnostics(row.twitchArchiveDiagnostics);
  if (diagnostics) out.twitchArchiveDiagnostics = diagnostics;
  if (row.lastClipFailure && typeof row.lastClipFailure === 'object' && typeof (row.lastClipFailure as Record<string,unknown>).message === 'string') out.lastClipFailure = row.lastClipFailure as FollowedChannel['lastClipFailure'];
  return out;
}

/** A newer local mirror can be ahead of IndexedDB after a partial write. Keep
 * every followed identity, but never let the larger stale list rewind it. */
export function mergeFollowRecovery(a: { channels: FollowedChannel[]; savedAt: number }, b: { channels: FollowedChannel[]; savedAt: number }): FollowedChannel[] {
  const primary = a.channels.length >= b.channels.length ? a : b;
  const secondary = primary === a ? b : a;
  const key = (row: FollowedChannel) => `${row.kind}:${row.id}`;
  const at = (row: FollowedChannel, snapshotAt: number) => snapshotAt || Math.max(row.lastCheckedAt ?? 0, row.catalogCheckedAt ?? 0, row.twitchArchiveDiagnostics?.at ?? 0);
  const out = [...primary.channels];
  const positions = new Map(out.map((row, index) => [key(row), index]));
  for (const row of secondary.channels) {
    const index = positions.get(key(row));
    if (index === undefined) { positions.set(key(row), out.length); out.push(row); }
    else if (at(row, secondary.savedAt) > at(out[index], primary.savedAt)) out[index] = row;
  }
  return out;
}
