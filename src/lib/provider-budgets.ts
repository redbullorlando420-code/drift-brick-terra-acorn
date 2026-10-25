/** Metadata safeguards; media playback/downloads never use these readers.
 * Limits apply to each complete upstream page, not the accumulated archive. */
export const PROVIDER_BUDGETS = {
  responseBytes: 8 * 1024 * 1024,
  errorPrefixBytes: 64 * 1024,
  bodyTimeoutMs: 15_000,
  queuedRequests: 80,
  youtubeTransfers: 1,
  /** Two lightweight RSS bodies can complete independently of archive pages. */
  youtubeFeedTransfers: 2,
  youtubeLiveTransfers: 8,
  youtubeLiveWorkers: 8,
  youtubeLiveRequestGapMs: 80,
  twitchTransfers: 6,
  adultTransfers: 6,
  refreshWorkers: 3,
  liveWorkers: 2,
  archiveWorkers: 1,
  importWorkers: 6,
  importAttempts: 2,
  warmCacheRows: 250,
  warmCacheEntryBytes: 1024 * 1024,
  youtubeCacheBytes: 4 * 1024 * 1024,
  twitchCacheBytes: 4 * 1024 * 1024,
  adultCacheBytes: 12 * 1024 * 1024,
} as const;

export class ProviderBudgetError extends Error {
  readonly budget: 'bytes' | 'queue';
  constructor(budget: 'bytes' | 'queue', message: string) { super(message); this.budget = budget; this.name = 'ProviderBudgetError'; }
}
