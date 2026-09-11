export type FirstShelfTrace = {
  startedAt: number;
  firstShelfAt?: number;
  elapsedMs?: number;
  title?: string;
  cards?: number;
};

const startedAt = typeof performance === "undefined" ? Date.now() : performance.now();
let trace: FirstShelfTrace = { startedAt };

/** Records the first mounted shelf only. It is local diagnostics, not analytics. */
export function markFirstShelf(title: string, cards: number) {
  if (trace.firstShelfAt) return;
  const now = typeof performance === "undefined" ? Date.now() : performance.now();
  trace = { startedAt, firstShelfAt: now, elapsedMs: Math.round(now - startedAt), title, cards };
}

export function getFirstShelfTrace() { return trace; }
