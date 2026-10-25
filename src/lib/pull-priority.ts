export type PullProvider = 'youtube' | 'twitch' | 'adults';

/** Explicit actions always run. Automatic archives yield to the page in use;
 * lightweight status reads retain their independent provider lanes. */
export function automaticPullMatchesPage(page: string, provider?: PullProvider) {
  if (page === 'live') return false;
  if (page === 'youtube' || page === 'twitch' || page === 'adults') return provider === page;
  return true;
}
