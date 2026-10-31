import { yieldCatalogTask } from "./catalog-work.ts";

export type RankingKind = "youtube" | "twitch" | "preview";
type Sample = {
  kind: RankingKind;
  outcome: "complete" | "cancelled" | "failed";
  rows: number;
  slices: number;
  maxSliceMs: number;
  cpuMs: number;
  elapsedMs: number;
};
const samples: Sample[] = [];
let active = 0,
  deferred = 0,
  coalesced = 0;
export const RANKING_BUDGET = { settleMs: 80, sliceMs: 3, sliceRows: 256, samples: 32 } as const;
export const rankingBudgetSnapshot = () => ({
  active,
  deferred,
  coalesced,
  budget: RANKING_BUDGET,
  samples: samples.map((row) => ({ ...row })),
});

/** A pass records scalar timings only. Its owner cancels immediately when input
 * references/revisions change; no catalog, feedback or candidate graph is logged. */
export function createRankingPass(
  kind: RankingKind,
  signal: AbortSignal,
  now = () => performance.now(),
) {
  const started = now();
  let ended = false,
    rows = 0,
    slices = 0,
    maxSliceMs = 0,
    cpuMs = 0;
  active++;
  const finish = (outcome: Sample["outcome"] = "complete") => {
    if (ended) return;
    ended = true;
    active--;
    signal.removeEventListener("abort", cancelled);
    samples.push({
      kind,
      outcome,
      rows,
      slices,
      maxSliceMs,
      cpuMs,
      elapsedMs: Math.max(0, now() - started),
    });
    if (samples.length > RANKING_BUDGET.samples) samples.shift();
  };
  const cancelled = () => finish("cancelled");
  signal.addEventListener("abort", cancelled, { once: true });
  if (signal.aborted) cancelled();
  return {
    finish,
    async visit<T>(
      input: ArrayLike<T>,
      visit: (row: T, index: number) => void,
      turn = yieldCatalogTask,
    ) {
      for (let offset = 0; offset < input.length;) {
        signal.throwIfAborted();
        await turn();
        signal.throwIfAborted();
        const start = now(),
          end = Math.min(input.length, offset + RANKING_BUDGET.sliceRows);
        try {
          for (; offset < end;) {
            signal.throwIfAborted();
            visit(input[offset]!, offset);
            offset++;
            rows++;
            if (now() - start >= RANKING_BUDGET.sliceMs) break;
          }
        } finally {
          const duration = Math.max(0, now() - start);
          slices++;
          cpuMs += duration;
          maxSliceMs = Math.max(maxSliceMs, duration);
        }
      }
    },
  };
}

/** Delay worker creation/feedback reads, rather than just delaying publication.
 * Cleanup cancels an unstarted revision or disposes its running owner at once. */
export function scheduleRankingStart(
  kind: RankingKind,
  work: (pass: ReturnType<typeof createRankingPass>, signal: AbortSignal) => void | (() => void),
) {
  const controller = new AbortController();
  let cleanup: void | (() => void),
    pending = true,
    stopped = false;
  deferred++;
  const timer = setTimeout(() => {
    pending = false;
    deferred--;
    const pass = createRankingPass(kind, controller.signal);
    try {
      cleanup = work(pass, controller.signal);
    } catch (error) {
      pass.finish("failed");
      throw error;
    }
  }, RANKING_BUDGET.settleMs);
  return () => {
    if (stopped) return;
    stopped = true;
    if (pending) {
      pending = false;
      deferred--;
      coalesced++;
      clearTimeout(timer);
    }
    controller.abort();
    cleanup?.();
  };
}
