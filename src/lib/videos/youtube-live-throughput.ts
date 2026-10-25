export type LiveThroughputSample = { at: number; successful: number; attempted: number };
export type LiveThroughput = {
  samples: LiveThroughputSample[];
  lastSuccessAt?: number;
  successfulBatches: number;
};
/** Volatile, bounded observations for one sweep. No storage, provider work or timers. */
export function createYoutubeLiveThroughput(ids: readonly string[], startedAt: number) {
  const expected = new Set(ids),
    attempted = new Set<string>();
  let successful = 0,
    successfulBatches = 0,
    lastSuccessAt: number | undefined;
  let samples: LiveThroughputSample[] = [{ at: startedAt, successful: 0, attempted: 0 }];
  return {
    record(batch: readonly string[], accepted: readonly string[], at: number) {
      const valid = new Set(accepted);
      let count = 0,
        success = 0;
      for (const id of batch)
        if (expected.has(id) && !attempted.has(id)) {
          attempted.add(id);
          count++;
          if (valid.has(id)) success++;
        }
      if (!count) return;
      successful += success;
      if (success) {
        lastSuccessAt = at;
        successfulBatches++;
      }
      samples = [
        ...samples,
        { at: Math.max(at, samples.at(-1)!.at), successful, attempted: attempted.size },
      ];
      while (samples.length > 33 || (samples.length > 2 && samples[1].at < at - 60_000))
        samples.shift();
    },
    snapshot(): LiveThroughput {
      return { samples: [...samples], lastSuccessAt, successfulBatches };
    },
  };
}
export type LiveEstimate = {
  state: "idle" | "warming" | "active" | "stalled" | "waiting" | "clear";
  perMinute?: number;
  minSeconds?: number;
  maxSeconds?: number;
};
export function youtubeLiveEstimate(
  window: LiveThroughput | undefined,
  ready: number,
  running: boolean,
  retryAt: number,
  now = Date.now(),
): LiveEstimate {
  if (retryAt > now) return { state: "waiting" };
  if (!ready) return { state: "clear" };
  if (!running) return { state: "idle" };
  if (!window || !window.lastSuccessAt) return { state: "warming" };
  if (now - window.lastSuccessAt > 30_000) return { state: "stalled" };
  const samples = window.samples,
    first = samples[0],
    last = samples.at(-1);
  if (!first || !last) return { state: "warming" };
  const span = last.at - first.at,
    success = last.successful - first.successful,
    attempted = last.attempted - first.attempted;
  const recent = samples.slice(-3),
    noProgress = recent.length === 3 && recent[0].successful === recent[2].successful;
  if (noProgress) return { state: "stalled" };
  if (
    span < 1000 ||
    success < 8 ||
    window.successfulBatches < 2 ||
    attempted < success ||
    success / Math.max(1, attempted) < 0.5
  )
    return { state: "warming" };
  const rate = success / (span / 1000);
  return {
    state: "active",
    perMinute: Math.round(rate * 60),
    minSeconds: Math.max(1, Math.ceil((ready / rate) * 0.75)),
    maxSeconds: Math.max(1, Math.ceil((ready / rate) * 1.5)),
  };
}
