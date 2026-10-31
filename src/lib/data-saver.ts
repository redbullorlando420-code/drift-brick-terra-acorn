export const DATA_SAVER_KEY = "reelcase.data-saver.v1";
export type DataSaverMode = "adaptive" | "save-data";
let mode: DataSaverMode | undefined;
let sessionOnly = false;
const listeners = new Set<() => void>();
const read = (): DataSaverMode => {
  try {
    return localStorage.getItem(DATA_SAVER_KEY) === "save-data" ? "save-data" : "adaptive";
  } catch {
    return "adaptive";
  }
};
export const getDataSaverMode = (): DataSaverMode =>
  typeof window === "undefined" ? "adaptive" : (mode ??= read());
export const dataSaverActive = () =>
  getDataSaverMode() === "save-data" ||
  (typeof navigator !== "undefined" &&
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
      true);
export function setDataSaverMode(value: DataSaverMode) {
  mode = value === "save-data" ? value : "adaptive";
  try {
    localStorage.setItem(DATA_SAVER_KEY, mode);
    sessionOnly = false;
  } catch {
    sessionOnly = true;
  }
  for (const notify of listeners) notify();
}
let stop: (() => void) | undefined;
export function subscribeDataSaver(notify: () => void) {
  if (!listeners.size && typeof window !== "undefined") {
    if (!sessionOnly) mode = undefined;
    const storage = (event: StorageEvent) => {
      if (event.key === DATA_SAVER_KEY || event.key === null) {
        mode = undefined;
        for (const fn of listeners) fn();
      }
    };
    const change = () => {
      for (const fn of listeners) fn();
    };
    const connection = (navigator as Navigator & { connection?: EventTarget }).connection;
    window.addEventListener("storage", storage);
    connection?.addEventListener("change", change);
    stop = () => {
      window.removeEventListener("storage", storage);
      connection?.removeEventListener("change", change);
    };
  }
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
    if (!listeners.size) {
      stop?.();
      stop = undefined;
      if (!sessionOnly) mode = undefined;
    }
  };
}
import.meta.hot?.dispose(() => {
  stop?.();
  listeners.clear();
});
