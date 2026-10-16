export const ARTWORK_MODE_KEY = 'reelcase.artwork-mode';
let textFirst: boolean | undefined;
const listeners = new Set<() => void>();
let stopWatching: (() => void) | undefined;

/** A cached scalar shared by mounted cards; no per-card storage read or timer. */
export function getTextFirstArtwork() {
  if (typeof window === 'undefined') return false;
  if (textFirst === undefined) {
    try { textFirst = localStorage.getItem(ARTWORK_MODE_KEY) === 'text'; }
    catch { textFirst = false; }
  }
  return textFirst;
}
const paintMode = (value: boolean) => {
  if (typeof document !== 'undefined') document.documentElement.dataset.artworkMode = value ? 'text' : 'images';
};
export function setTextFirstArtwork(value: boolean) {
  const previous = getTextFirstArtwork();
  textFirst = value;
  try { localStorage.setItem(ARTWORK_MODE_KEY, value ? 'text' : 'images'); } catch { /* session choice still works */ }
  paintMode(value);
  if (previous !== value) for (const notify of listeners) notify();
}
/** One listener pair across every live card/control. Last unmount releases
 * it; the next subscription rereads changes made while nothing was mounted. */
export function subscribeArtworkMode(listener: () => void) {
  if (!listeners.size && typeof window !== 'undefined') {
    const refresh = () => {
      const previous = textFirst;
      textFirst = undefined;
      const next = getTextFirstArtwork();
      paintMode(next);
      if (previous !== next) for (const notify of listeners) notify();
    };
    const storage = (event: StorageEvent) => { if (event.key === ARTWORK_MODE_KEY || event.key === null) refresh(); };
    refresh();
    window.addEventListener('storage', storage);
    // Existing diagnostics actions and integrations can refresh preferences.
    window.addEventListener('reelcase:diagnostics-settings', refresh);
    stopWatching = () => { window.removeEventListener('storage', storage); window.removeEventListener('reelcase:diagnostics-settings', refresh); };
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) { stopWatching?.(); stopWatching = undefined; textFirst = undefined; }
  };
}
import.meta.hot?.dispose(() => { stopWatching?.(); listeners.clear(); textFirst = undefined; });
