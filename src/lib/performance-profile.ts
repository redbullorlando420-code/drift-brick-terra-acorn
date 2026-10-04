import { LIBRARY_LIMITS } from './library-limits.ts';
export type PerformanceMode = 'adaptive' | 'low-memory';
export type DeviceBudgetHints = { cores?: number; memoryGiB?: number; saveData?: boolean };
export type PerformanceProfile = {
  lowMemory: boolean;
  reason: 'selected' | 'device' | 'standard';
  artworkBytes: number;
  artworkEntries: number;
  imageRequests: number;
  thumbnailWorkers: number;
  photoWorkers: number;
  gridMountCap: number;
  gridPageSize: number;
  railOverscan: number;
};
const MIB = 1024 * 1024;
const standard: PerformanceProfile = Object.freeze({ lowMemory: false, reason: 'standard', artworkBytes: 8 * MIB,
  artworkEntries: LIBRARY_LIMITS.memoryThumbEntries, imageRequests: 12, thumbnailWorkers: 4, photoWorkers: 12, gridMountCap: 108, gridPageSize: 24, railOverscan: 1 });
const constrained = (reason: 'selected' | 'device'): PerformanceProfile => Object.freeze({ lowMemory: true, reason,
  artworkBytes: 2 * MIB, artworkEntries: 72, imageRequests: 4, thumbnailWorkers: 1, photoWorkers: 2,
  gridMountCap: 36, gridPageSize: 24, railOverscan: 0 });
const selected = constrained('selected'), device = constrained('device');

/** Device memory is a coarse capability hint, never measured free RAM. Unknown
 * devices keep normal defaults; explicit low-memory mode also works on desktop. */
export function resolvePerformanceProfile(mode: PerformanceMode, hints: DeviceBudgetHints = {}): PerformanceProfile {
  if (mode === 'low-memory') return selected;
  const small = hints.saveData || Number.isFinite(hints.cores) && hints.cores! > 0 && hints.cores! <= 4
    || Number.isFinite(hints.memoryGiB) && hints.memoryGiB! > 0 && hints.memoryGiB! <= 2;
  return small ? device : standard;
}

export const PERFORMANCE_MODE_KEY = 'reelcase.performance-mode';
let savedMode: PerformanceMode | undefined;
const listeners = new Set<() => void>();
let stopStorage: (() => void) | undefined;
export function getPerformanceMode(): PerformanceMode {
  if (typeof window === 'undefined') return 'adaptive';
  if (!savedMode) {
    try { savedMode = localStorage.getItem(PERFORMANCE_MODE_KEY) === 'low-memory' ? 'low-memory' : 'adaptive'; }
    catch { savedMode = 'adaptive'; }
  }
  return savedMode;
}
export function getPerformanceProfile() {
  const nav = typeof navigator === 'undefined' ? undefined : navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return resolvePerformanceProfile(getPerformanceMode(), { cores: nav?.hardwareConcurrency, memoryGiB: nav?.deviceMemory, saveData: nav?.connection?.saveData });
}
export const getServerPerformanceProfile = () => standard;
export function setPerformanceMode(mode: PerformanceMode) {
  savedMode = mode;
  try { localStorage.setItem(PERFORMANCE_MODE_KEY, mode); } catch { /* session setting still applies */ }
  for (const listener of listeners) listener();
}
/** Only subscribed surfaces retain a shared cross-tab settings listener. */
export function subscribePerformanceProfile(listener: () => void) {
  if (!listeners.size && typeof window !== 'undefined') {
    // Settings may have changed in another tab while no surface was mounted.
    savedMode = undefined;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== PERFORMANCE_MODE_KEY && event.key !== null) return;
      savedMode = undefined;
      for (const notify of listeners) notify();
    };
    const onConnection = () => { for (const notify of listeners) notify(); };
    const connection = typeof navigator === 'undefined' ? undefined : (navigator as Navigator & { connection?: EventTarget }).connection;
    window.addEventListener('storage', onStorage);
    connection?.addEventListener('change', onConnection);
    stopStorage = () => { window.removeEventListener('storage', onStorage); connection?.removeEventListener('change', onConnection); };
  }
  listeners.add(listener);
  return () => { listeners.delete(listener); if (!listeners.size) { stopStorage?.(); stopStorage = undefined; } };
}
if (import.meta.hot) import.meta.hot.dispose(() => { stopStorage?.(); listeners.clear(); });
