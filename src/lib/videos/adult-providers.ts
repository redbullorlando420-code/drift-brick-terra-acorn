export type AdultPullProvider = 'eporner' | 'redtube' | 'chaturbate' | 'myfreecams' | 'reddit' | 'booru' | 'redgifs';
export const ADULT_PULL_PROVIDERS: AdultPullProvider[] = ['eporner', 'redtube', 'chaturbate', 'myfreecams', 'reddit', 'booru', 'redgifs'];
/** Built-in provider privacy does not depend on a legacy folder flag. */
export function adultFolderIds(folders: readonly { id: string; adult?: boolean }[]) {
  return new Set([...ADULT_PULL_PROVIDERS.map(provider => `${provider}:discover`), ...folders.filter(folder => folder.adult).map(folder => folder.id)]);
}
