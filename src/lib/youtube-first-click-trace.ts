export type YoutubeFirstClickTrace = {
  startedAt: number;
  selectorMs?: number;
  selectorReadyMs?: number;
  catalogRows?: number;
  railReadyMs?: number;
  railCards?: number;
  artworkWaitMs?: number;
  artwork: "pending" | "loaded" | "deferred";
  provider: "idle" | "running" | "finished";
  /** Provider time overlapping the route open, not necessarily time spent waiting for it. */
  providerOverlapMs: number;
};

type ActiveTrace = YoutubeFirstClickTrace & { providerStartedAt?: number };
let current: ActiveTrace | null = null;
let revision = 0;
const listeners = new Set<() => void>();
const now = () => typeof performance === "undefined" ? Date.now() : performance.now();
const notify = () => { revision += 1; for (const listener of listeners) listener(); };

export const getYoutubeTraceRevision = () => revision;
export const subscribeYoutubeTrace = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

/** Local-only timing. No channel names, video IDs, or viewing events are retained. */
export function beginYoutubeFirstClick(providerBusy = false, at = now()) {
  current = {
    startedAt: at,
    artwork: "pending",
    provider: providerBusy ? "running" : "idle",
    providerOverlapMs: 0,
    ...(providerBusy ? { providerStartedAt: at } : {}),
  };
  notify();
}

export function markYoutubeSelectorReady(rows: number, workMs: number, at = now()) {
  if (!current || current.selectorReadyMs !== undefined) return;
  current.catalogRows = rows;
  current.selectorMs = Math.max(0, Math.round(workMs));
  current.selectorReadyMs = Math.max(0, Math.round(at - current.startedAt));
  notify();
}

export function markYoutubeProviderStart(at = now()) {
  if (!current || current.railReadyMs !== undefined || current.providerStartedAt !== undefined) return;
  current.provider = "running";
  current.providerStartedAt = at;
  notify();
}

export function markYoutubeProviderFinish(at = now()) {
  if (!current || current.providerStartedAt === undefined) return;
  const railAt = current.railReadyMs === undefined ? at : current.startedAt + current.railReadyMs;
  current.providerOverlapMs = Math.max(0, Math.round(Math.min(at, railAt) - current.providerStartedAt));
  current.provider = "finished";
  current.providerStartedAt = undefined;
  notify();
}

/** A text-first card is usable before its thumbnail finishes decoding. */
export function markYoutubeRailReady(cards: number, at = now()) {
  if (!current || current.railReadyMs !== undefined || cards <= 0) return false;
  current.railReadyMs = Math.max(0, Math.round(at - current.startedAt));
  current.railCards = cards;
  if (current.providerStartedAt !== undefined) {
    current.providerOverlapMs = Math.max(0, Math.round(at - current.providerStartedAt));
  }
  notify();
  return true;
}

export function markYoutubeArtworkReady(loaded: boolean, at = now()) {
  if (!current || current.railReadyMs === undefined || current.artwork !== "pending") return;
  current.artwork = loaded ? "loaded" : "deferred";
  current.artworkWaitMs = Math.max(0, Math.round(at - current.startedAt - current.railReadyMs));
  notify();
}

export function getYoutubeFirstClickTrace(): YoutubeFirstClickTrace | null {
  if (!current) return null;
  const { providerStartedAt: _providerStartedAt, ...snapshot } = current;
  return snapshot;
}
