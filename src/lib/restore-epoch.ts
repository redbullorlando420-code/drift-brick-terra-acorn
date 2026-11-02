import {profileLocalStorage as localStorage} from "./local-profile-storage.ts";
export const RESTORE_CONTROL = "library-restore:v1";
export const RESTORE_HEAD = "reelcase.restore-head.v1";
export const RESTORE_EVENT = "reelcase:restore-state";
export type RestoreControl = {
  version: 1;
  epoch: number;
  phase: "idle" | "capturing" | "ready";
  pending?: string;
  previous?: string;
  mirror?: string;
  mirrorSide?: "before" | "after";
  name?: string;
  at: number;
};
let epoch: number | undefined,
  preparing = false,
  preparationError = "",
  cancelPreparation: (() => void) | undefined;
export function setRestoreCancellation(fn: (() => void) | undefined) {
  cancelPreparation = fn;
}
export function cancelRestorePreparation() {
  cancelPreparation?.();
}
export function restoreWritable() {
  try {
    assertRestoreWritable();
    return true;
  } catch {
    return false;
  }
}
export function restoreIsPreparing() {
  return preparing;
}
export function restorePreparationError() {
  return preparationError;
}
export function setRestorePreparing(value: boolean, error = "") {
  preparing = value;
  preparationError = error;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(RESTORE_EVENT));
}
export function readRestoreControl(raw: unknown): RestoreControl {
  if (raw === undefined) return { version: 1, epoch: 0, phase: "idle", at: 0 };
  const r = raw as RestoreControl;
  if (
    !r ||
    r.version !== 1 ||
    !Number.isSafeInteger(r.epoch) ||
    r.epoch < 0 ||
    !["idle", "capturing", "ready"].includes(r.phase) ||
    !Number.isSafeInteger(r.at) ||
    r.at < 0 ||
    ["pending", "previous", "mirror"].some(
      (k) =>
        r[k as keyof RestoreControl] !== undefined &&
        (typeof r[k as keyof RestoreControl] !== "string" ||
          String(r[k as keyof RestoreControl]).length > 128),
    ) ||
    (r.phase !== "idle" && !r.pending) ||
    (r.mirror && !["before", "after"].includes(r.mirrorSide ?? ""))
  )
    throw Error(
      "Unsupported restore state. Saved data was retained; this workspace cannot safely write until recovery is resolved.",
    );
  return r;
}
export function installRestoreEpoch(value: number) {
  epoch = value;
}
export function restoreEpoch() {
  return epoch;
}
export function publishRestoreHead(control: RestoreControl) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    RESTORE_HEAD,
    JSON.stringify({ epoch: control.epoch, blocked: control.phase !== "idle" || !!control.mirror }),
  );
  window.dispatchEvent(new Event(RESTORE_EVENT));
}
export function assertRestoreWritable() {
  if (typeof window === "undefined") return;
  const text = localStorage.getItem(RESTORE_HEAD);
  if (!text) return;
  const head = JSON.parse(text);
  if (head.blocked || epoch === undefined || head.epoch !== epoch)
    throw Error(
      "A library restore is pending or another tab restored this workspace. Reload before saving.",
    );
}
/** Every personal/catalog write checks the durable epoch in the same transaction.
 * Restore transactions opt in explicitly; a shared writer token alone never bypasses this fence. */
export function guardRestoreEpoch(
  tx: IDBTransaction,
  body: () => void,
  failed?: (e: unknown) => void,
  restore = false,
) {
  const r = tx.objectStore("remote-cache").get(RESTORE_CONTROL);
  r.onsuccess = () => {
    try {
      const control = readRestoreControl(r.result);
      if (
        !restore &&
        (control.phase !== "idle" || control.mirror || control.epoch !== (epoch ?? 0))
      )
        throw Error("The library generation changed or is being restored. Reload before saving.");
      body();
    } catch (e) {
      failed?.(e);
      try {
        tx.abort();
      } catch {
        /* already aborted */
      }
    }
  };
}
