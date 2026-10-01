import { ADULT_PULL_PROVIDERS, type AdultPullProvider } from './adult-providers.ts';
import type { AdultArchiveCursorMap } from './adult-archive-cursors.ts';

/** Fair rotation includes empty providers without allowing one unavailable
 * source to monopolize automatic discovery. Cooldowns preserve resume points. */
export function planAdultPull(cursors: AdultArchiveCursorMap, now: number, limit = 2): AdultPullProvider[] {
  return ADULT_PULL_PROVIDERS.filter(provider => (cursors[provider]?.retryAt ?? 0) <= now)
    .sort((a, b) => (cursors[a]?.updatedAt ?? 0) - (cursors[b]?.updatedAt ?? 0)
      || ADULT_PULL_PROVIDERS.indexOf(a) - ADULT_PULL_PROVIDERS.indexOf(b))
    .slice(0, Math.max(1, Math.min(ADULT_PULL_PROVIDERS.length, limit)));
}

export const REDDIT_SOURCE_STORAGE_KEY = 'reelcase.adult-reddit-sources.v1';
export type RedditSourceSetting = { subreddit: string; priority: 1 | 2 | 3; hidden?: boolean; favorite?: boolean };
export function readRedditSourceSettings(): RedditSourceSetting[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(REDDIT_SOURCE_STORAGE_KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    return raw.slice(0, 120).flatMap(item => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      const subreddit = String(row.subreddit ?? '').trim().replace(/^r\//i, '');
      if (!/^[a-z0-9_]{3,48}$/i.test(subreddit) || seen.has(subreddit.toLowerCase())) return [];
      seen.add(subreddit.toLowerCase());
      const priority = Number(row.priority);
      return [{ subreddit, priority: (priority >= 3 ? 3 : priority <= 1 ? 1 : 2) as 1 | 2 | 3, hidden: Boolean(row.hidden), favorite: Boolean(row.favorite) }];
    });
  } catch { return []; }
}

export function adultRedditPullSources(defaults: readonly string[]) {
  if (typeof localStorage === 'undefined') return undefined;
  try { if (localStorage.getItem(`${REDDIT_SOURCE_STORAGE_KEY}.enabled`) === 'false') return undefined; } catch { return undefined; }
  const sources = new Map<string, RedditSourceSetting>(defaults.map(subreddit => [subreddit.toLowerCase(), { subreddit, priority: 2 }]));
  for (const source of readRedditSourceSettings()) sources.set(source.subreddit.toLowerCase(), source);
  return [...sources.values()].filter(source => !source.hidden)
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.priority - a.priority || a.subreddit.localeCompare(b.subreddit));
}
