import {hiddenSourcePrivacy} from './hidden-source-privacy.ts';
export type AdultPullProvider = 'eporner' | 'redtube' | 'chaturbate' | 'myfreecams' | 'reddit' | 'booru' | 'redgifs';
export const ADULT_PULL_PROVIDERS: AdultPullProvider[] = ['eporner', 'redtube', 'chaturbate', 'myfreecams', 'reddit', 'booru', 'redgifs'];
const snapshots = new WeakMap<readonly { id: string; adult?: boolean }[], {revision:number;ids:Set<string>}>();
let latest: Set<string> | undefined;
/** Built-in provider privacy does not depend on a legacy folder flag. */
export function adultFolderIds(folders: readonly { id: string; adult?: boolean }[]) {
  const hidden=hiddenSourcePrivacy(),cached = snapshots.get(folders);
  if (cached?.revision===hidden.revision) return cached.ids;
  const ids = new Set([...ADULT_PULL_PROVIDERS.map(provider => `${provider}:discover`), ...folders.filter(folder => folder.adult).map(folder => folder.id),...hidden.ids]);
  // Names, counts and health change during pulls. Preserve the visibility
  // identity unless a source actually changes its privacy classification.
  const result = latest && latest.size === ids.size && [...ids].every(id => latest!.has(id)) ? latest : ids;
  latest = result; snapshots.set(folders, {revision:hidden.revision,ids:result}); return result;
}
