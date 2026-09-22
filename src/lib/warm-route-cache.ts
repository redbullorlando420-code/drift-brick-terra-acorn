/**
 * A small, deterministic look-ahead for the shared Hub code boundary.
 *
 * Hub desks currently ship in one lazy module. Keeping the destination name
 * here makes the scheduling decision explainable and leaves room for later
 * per-desk splitting without changing the caller's interaction contract.
 */
const NEXT_LIKELY_HUB: Readonly<Record<string, string>> = {
  home: "anime",
  movies: "anime",
  anime: "genres",
  genres: "photos",
  youtube: "photos",
  twitch: "photos",
  live: "photos",
  favorites: "photos",
  continue: "photos",
  history: "photos",
  adults: "photos",
  "adult-fetishes": "photos",
  photos: "spotify",
  spotify: "prints",
  prints: "games",
  games: "shop",
  shop: "streaming",
  streaming: "watch-room",
  "watch-room": "connection",
  connection: "find-phone",
  "find-phone": "social",
  social: "assistant",
  assistant: "mission-plan",
  "mission-plan": "settings",
  settings: "stats",
};

export type WarmRouteHints = {
  visible: boolean;
  saveData?: boolean;
  effectiveType?: string;
  deviceMemory?: number;
  inputPending?: boolean;
};

/** Return one adjacent Hub destination, never a speculative set of routes. */
export function nextLikelyHub(sourceId: string): string | null {
  return NEXT_LIKELY_HUB[sourceId] ?? null;
}

/**
 * Warm code only when it is polite to do so. Unlike visible-image loading,
 * this background fetch has no user-visible priority and should not contend
 * with a weak connection, a low-memory device, or the current input frame.
 */
export function shouldWarmHubRoute(hints: WarmRouteHints): boolean {
  if (!hints.visible || hints.saveData || hints.inputPending) return false;
  if (typeof hints.deviceMemory === "number" && hints.deviceMemory <= 2) return false;
  return !/^(?:slow-2g|2g|3g)$/i.test(hints.effectiveType?.trim() ?? "");
}
