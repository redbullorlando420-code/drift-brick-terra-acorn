type PrivacyFolder = { id: string; adult?: boolean };
const snapshots = new WeakMap<readonly PrivacyFolder[], ReadonlySet<string>>();

/** Card selectors run on every store update. Share the immutable folder
 * snapshot's flags instead of searching hundreds of sources for each card. */
export function folderIsPrivate(folders: readonly PrivacyFolder[], id: string) {
  let privateIds = snapshots.get(folders);
  if (!privateIds) {
    privateIds = new Set(folders.filter(folder => folder.adult).map(folder => folder.id));
    snapshots.set(folders, privateIds);
  }
  return privateIds.has(id);
}
