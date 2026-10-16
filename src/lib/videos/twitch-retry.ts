import type { FollowedChannel, ProviderFailure, TwitchRetryState } from './types';

export type TwitchRetryScope = 'archive' | 'live';
export function normalizeTwitchRetry(raw: unknown): TwitchRetryState | undefined {
  if (!raw || typeof raw !== 'object') return;
  const row = raw as Record<string, unknown>;
  if (!Number.isInteger(row.attempts) || Number(row.attempts) < 1 || Number(row.attempts) > 8
    || typeof row.retryAt !== 'number' || !Number.isFinite(row.retryAt) || row.retryAt <= 0) return;
  return { attempts: Number(row.attempts), retryAt: row.retryAt };
}

/** Durable, independent budgets. An explicit retry only changes its own scope. */
export function twitchRetryPatch(channel: Partial<FollowedChannel>, scope: TwitchRetryScope, failure?: ProviderFailure, now = Date.now()): Partial<FollowedChannel> {
  const key = scope === 'live' ? 'twitchLiveRetry' : 'twitchArchiveRetry';
  const failureKey = scope === 'live' ? 'lastLiveFailure' : 'lastProviderFailure';
  if (!failure) return { [key]: undefined, [failureKey]: undefined };
  const attempts = Math.min(8, (normalizeTwitchRetry(channel[key])?.attempts ?? 0) + 1);
  const retryAt = now + Math.min(300_000, 15_000 * 2 ** (attempts - 1));
  return { [key]: { attempts, retryAt }, [failureKey]: { ...failure, retryAt } };
}

/** Small enough to use in client-side creator controls and failure commits. */
export function classifyTwitchFailure(error: unknown, at = Date.now()): ProviderFailure {
  const message = (error instanceof Error ? error.message : String(error || 'Unknown provider failure')).replace(/\s+/g, ' ').trim().slice(0, 240);
  const common = { message, at };
  if (/metadata.*(?:budget|queue)|response budget/i.test(message)) return { ...common, kind: 'response-budget', recovery: 'The response exceeded the metadata budget. Accepted pages and saved positions remain available; retry this creator later.' };
  if (/\b429\b|rate.?limit|too many requests|retrying after/i.test(message)) return { ...common, kind: 'rate-limited', recovery: 'Wait until the recommended retry time, or explicitly retry this creator. Saved videos and positions are preserved.' };
  if (/integrity|challenge/i.test(message)) return { ...common, kind: 'integrity-challenge', recovery: 'Twitch requires a public integrity check. Accepted pages are saved; retry this creator later.' };
  if (/page.?limit|first.*100|public.*page|cursor.*(?:stall|advance)/i.test(message)) return { ...common, kind: 'public-page-limit', recovery: 'The public shelf stopped advancing. Keep the saved position and retry later; increasing the page size will not help.' };
  if (/json|parse|malformed|invalid response|unexpected token/i.test(message)) return { ...common, kind: 'malformed', recovery: 'Twitch returned an unreadable response. Saved videos remain available; retry after the provider recovers.' };
  if (/\b404\b|\b410\b|could not (?:find|resolve)|not found|unavailable|does not exist/i.test(message)) return { ...common, kind: 'unavailable', recovery: 'Check the creator link for a rename or unavailable channel. Keep saved videos while checking.' };
  return { ...common, kind: 'network-offline', recovery: 'Twitch could not be reached. Check the connection and retry later; saved videos remain available.' };
}
