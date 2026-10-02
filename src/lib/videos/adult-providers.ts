export type AdultPullProvider = 'eporner' | 'redtube' | 'chaturbate' | 'myfreecams' | 'reddit' | 'booru' | 'redgifs';
export const ADULT_PULL_PROVIDERS: AdultPullProvider[] = ['eporner', 'redtube', 'chaturbate', 'myfreecams', 'reddit', 'booru', 'redgifs'];
const snapshots = new WeakMap<readonly { id: string; adult?: boolean }[], Set<string>>();
let latest: Set<string> | undefined;
/** Built-in provider privacy does not depend on a legacy folder flag. */
export function adultFolderIds(folders: readonly { id: string; adult?: boolean }[]) {
  const cached = snapshots.get(folders);
  if (cached) return cached;
  const ids = new Set([...ADULT_PULL_PROVIDERS.map(provider => `${provider}:discover`), ...folders.filter(folder => folder.adult).map(folder => folder.id)]);
  // Names, counts and health change during pulls. Preserve the visibility
  // identity unless a source actually changes its privacy classification.
  const result = latest && latest.size === ids.size && [...ids].every(id => latest!.has(id)) ? latest : ids;
  latest = result; snapshots.set(folders, result); return result;
}
