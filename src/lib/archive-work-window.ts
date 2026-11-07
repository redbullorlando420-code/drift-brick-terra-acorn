export type ArchiveWorkWindow = {
  version: 1;
  enabled: boolean;
  startMinute: number;
  endMinute: number;
  timeZone: string;
};
export const DEFAULT_ARCHIVE_WINDOW: Readonly<ArchiveWorkWindow> = Object.freeze({
  version: 1,
  enabled: false,
  startMinute: 60,
  endMinute: 360,
  timeZone: "UTC",
});
export function validArchiveWindow(raw: unknown): raw is ArchiveWorkWindow {
  const value = raw as ArchiveWorkWindow;
  if (
    !value ||
    value.version !== 1 ||
    typeof value.enabled !== "boolean" ||
    ![value.startMinute, value.endMinute].every((n) => Number.isInteger(n) && n >= 0 && n < 1440) ||
    value.startMinute === value.endMinute ||
    typeof value.timeZone !== "string" ||
    value.timeZone.length > 80
  )
    return false;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: value.timeZone }).format(0);
    return true;
  } catch {
    return false;
  }
}
export function normalizeArchiveWindow(raw: unknown): Readonly<ArchiveWorkWindow> {
  if (raw === undefined) return DEFAULT_ARCHIVE_WINDOW;
  if (validArchiveWindow(raw)) {
    if (
      Object.isFrozen(raw) &&
      Object.keys(raw).every((key) =>
        ["version", "enabled", "startMinute", "endMinute", "timeZone"].includes(key),
      )
    )
      return raw;
    return Object.freeze({
      version: 1,
      enabled: raw.enabled,
      startMinute: raw.startMinute,
      endMinute: raw.endMinute,
      timeZone: raw.timeZone,
    });
  }
  // A damaged enabled schedule must never silently authorize automatic work.
  return Object.freeze({ version: 1, enabled: true, startMinute: 0, endMinute: 0, timeZone: "" });
}
type WindowState = { open: boolean; valid: boolean; nextChangeAt: number };
const cache = new Map<string, { from: number; state: WindowState }>();
/** Daily wall-clock windows: both repeated DST hours apply; skipped minutes
 * have no real instants. Cache until the next actual boundary, without polling. */
export function archiveWindowState(
  window: Readonly<ArchiveWorkWindow> | undefined,
  now = Date.now(),
): WindowState {
  if (!window) return { open: true, valid: true, nextChangeAt: Infinity };
  const key = JSON.stringify(window),
    saved = cache.get(key);
  if (saved && now >= saved.from && now < saved.state.nextChangeAt) return saved.state;
  const valid = validArchiveWindow(window);
  if (!valid || !window.enabled) {
    const state = { open: valid && !window.enabled, valid, nextChangeAt: Infinity };
    if (cache.size >= 8) cache.delete(cache.keys().next().value!);
    cache.set(key, { from: now, state });
    return state;
  }
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: window.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const isOpen = (at: number) => {
    const time = formatter.format(at),
      minute = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
    return window.startMinute < window.endMinute
      ? minute >= window.startMinute && minute < window.endMinute
      : minute >= window.startMinute || minute < window.endMinute;
  };
  const open = isOpen(now);
  let nextChangeAt = Infinity;
  for (
    let at = Math.floor(now / 60000) * 60000 + 60000, end = at + 48 * 60 * 60000;
    at <= end;
    at += 60000
  )
    if (isOpen(at) !== open) {
      nextChangeAt = at;
      break;
    }
  const state = { open, valid: true, nextChangeAt };
  if (cache.size >= 8) cache.delete(cache.keys().next().value!);
  cache.set(key, { from: now, state });
  return state;
}
export const archiveNotBefore = (
  window: Readonly<ArchiveWorkWindow> | undefined,
  now = Date.now(),
) => {
  const state = archiveWindowState(window, now);
  return state.open ? 0 : state.nextChangeAt;
};
export const archiveClock = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
export function archiveWindowLabel(
  window: Readonly<ArchiveWorkWindow> | undefined,
  now = Date.now(),
) {
  const state = archiveWindowState(window, now);
  if (!state.valid)
    return "Archive schedule needs repair. Automatic catalog work is held; save valid hours or disable the schedule.";
  if (!window?.enabled) return "Automatic archive hours: unrestricted.";
  const span = `${archiveClock(window.startMinute)}–${archiveClock(window.endMinute)} ${window.timeZone}${window.startMinute > window.endMinute ? " (overnight)" : ""}`;
  return state.open
    ? `Archive window open · ${span}.`
    : `Paused by archive schedule · ${span}. Next opening: ${new Date(state.nextChangeAt).toLocaleString(undefined, { timeZone: window.timeZone })} ${window.timeZone}.`;
}
