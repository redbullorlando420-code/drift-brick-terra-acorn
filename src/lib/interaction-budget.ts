export type InteractionKind = "navigation" | "search" | "rating" | "playback" | "queue";

type InteractionSample = { count: number; lastMs: number; worstMs: number; at: number };

const samples: Record<InteractionKind, InteractionSample> = {
  navigation: { count: 0, lastMs: 0, worstMs: 0, at: 0 },
  search: { count: 0, lastMs: 0, worstMs: 0, at: 0 },
  rating: { count: 0, lastMs: 0, worstMs: 0, at: 0 },
  playback: { count: 0, lastMs: 0, worstMs: 0, at: 0 },
  queue: { count: 0, lastMs: 0, worstMs: 0, at: 0 },
};
const lastStarted: Partial<Record<InteractionKind, number>> = {};

/** Records a local input-to-next-paint approximation without collecting media data. */
export function measureInteraction(kind: InteractionKind) {
  if (typeof window === "undefined" || typeof performance === "undefined") return;
  const now = performance.now();
  // A held key or repeated pointer event should not flood the diagnostic sample.
  if (now - (lastStarted[kind] ?? -Infinity) < 120) return;
  lastStarted[kind] = now;
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    const elapsed = Math.round(performance.now() - now);
    const sample = samples[kind];
    sample.count += 1;
    sample.lastMs = elapsed;
    sample.worstMs = Math.max(sample.worstMs, elapsed);
    sample.at = Date.now();
  }));
}

export function getInteractionBudgetSnapshot() {
  return Object.fromEntries(Object.entries(samples).map(([kind, sample]) => [kind, { ...sample }])) as Record<InteractionKind, InteractionSample>;
}
