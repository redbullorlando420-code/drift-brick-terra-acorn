import type { Folder } from './types';
import type { DurablePhotoSource } from './persist';
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

/** Photo and video catalogs restore independently. A photo stub arriving first
 * must carry saved privacy before public catalog selectors can see the folder. */
export function restorePhotoFolders(current: Folder[], sources: DurablePhotoSource[], privateIds: ReadonlySet<string>) {
  const byId = new Map(current.map(folder => [folder.id, folder]));
  for (const source of sources) {
    const folder = byId.get(source.id);
    byId.set(source.id, folder ? { ...folder, name: source.name || folder.name, kind: source.kind,
      ...(source.photoCount != null ? { photoCount: source.photoCount } : {}),
      ...(source.lastCheckedAt != null ? { lastCheckedAt: source.lastCheckedAt } : {}) }
      : { id: source.id, name: source.name, kind: source.kind, videoCount: 0,
        photoCount: source.photoCount ?? 0, lastCheckedAt: source.lastCheckedAt,
        adult: privateIds.has(source.id), needsPermission: true, health: 'permission-needed' });
  }
  return [...byId.values()];
}
