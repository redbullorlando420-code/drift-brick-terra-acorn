export const BACKUP_INSPECTION_EVENT = "reelcase:inspect-backup";
let pending: File | undefined;
/** One user-selected File reference; no parsing, import or persistent write at this entry point. */
export function queueBackupInspection(file: File) {
  pending = file;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(BACKUP_INSPECTION_EVENT));
}
export function takeBackupInspection() {
  const file = pending;
  pending = undefined;
  return file;
}
