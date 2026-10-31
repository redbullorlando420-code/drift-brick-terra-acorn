export type TransferClass = "metadata" | "artwork" | "companion" | "embed" | "media";
type Counter = {
  requests: number;
  measuredRequests: number;
  transferBytes: number;
  unmeasuredRequests: number;
};
export function createTransferAccounting(origin: string) {
  const counters: Record<TransferClass, Counter> = Object.fromEntries(
    ["metadata", "artwork", "companion", "embed", "media"].map((kind) => [
      kind,
      { requests: 0, measuredRequests: 0, transferBytes: 0, unmeasuredRequests: 0 },
    ]),
  ) as Record<TransferClass, Counter>;
  let observed = 0;
  return {
    record(
      entry: Pick<
        PerformanceResourceTiming,
        "name" | "initiatorType" | "transferSize" | "encodedBodySize"
      >,
    ) {
      let url: URL;
      try {
        url = new URL(entry.name, origin);
      } catch {
        return;
      }
      if (!["http:", "https:"].includes(url.protocol)) return;
      const kind: TransferClass | undefined =
        entry.initiatorType === "iframe"
          ? "embed"
          : ["video", "audio"].includes(entry.initiatorType)
            ? "media"
            : url.origin === "http://127.0.0.1:43123"
              ? "companion"
              : ["img", "image"].includes(entry.initiatorType)
                ? "artwork"
                : ["fetch", "xmlhttprequest"].includes(entry.initiatorType) &&
                    url.origin === origin &&
                    url.pathname.startsWith("/_serverFn/")
                  ? "metadata"
                  : undefined;
      if (!kind) return;
      const row = counters[kind];
      observed++;
      row.requests++;
      const bytes = entry.transferSize;
      // Zero with no exposed body size is ambiguous (TAO, cache, cancellation).
      // Player documents do not measure their nested media requests.
      if (
        kind !== "embed" &&
        kind !== "media" &&
        Number.isSafeInteger(bytes) &&
        bytes >= 0 &&
        (bytes > 0 || entry.encodedBodySize > 0)
      ) {
        row.measuredRequests++;
        row.transferBytes += bytes;
      } else row.unmeasuredRequests++;
    },
    snapshot: () => ({
      observed,
      classes: Object.entries(counters).map(([kind, row]) => ({
        kind: kind as TransferClass,
        ...row,
      })),
    }),
  };
}
let ledger: ReturnType<typeof createTransferAccounting> | undefined,
  observer: PerformanceObserver | undefined;
let supported = false,
  owners = 0;
export function startTransferAccounting() {
  if (typeof window === "undefined") return () => {};
  owners++;
  if (!ledger) ledger = createTransferAccounting(location.origin);
  if (!observer && typeof PerformanceObserver !== "undefined") {
    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) ledger!.record(entry as PerformanceResourceTiming);
      });
      // Buffered once per observer lifetime. Re-mounts use only new observations.
      observer.observe({ type: "resource", buffered: !supported });
      supported = true;
    } catch {
      observer?.disconnect();
      observer = undefined;
    }
  }
  let ended = false;
  return () => {
    if (ended) return;
    ended = true;
    if (!--owners) {
      if (observer)
        for (const entry of observer.takeRecords())
          ledger!.record(entry as PerformanceResourceTiming);
      observer?.disconnect();
      observer = undefined;
    }
  };
}
export const transferAccountingSnapshot = () => ({
  supported,
  ...(ledger?.snapshot() ?? { observed: 0, classes: [] }),
});
import.meta.hot?.dispose(() => {
  observer?.disconnect();
  observer = undefined;
  owners = 0;
});
