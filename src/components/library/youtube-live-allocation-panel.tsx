import type { YoutubeLiveAllocation } from "@/lib/videos/youtube-live-allocation";
const reasons = {
  "discovery-debt": "Older or unchecked creators need discovery capacity.",
  "discovery-recovery": "Discovery has more recent failed attempts than successful observations.",
  "urgent-live": "Known-live observations are overdue; discovery still has a reserved share.",
  balanced: "Both classes have a normal due backlog.",
  "single-slot": "One slot goes to the oldest attempted class.",
  "one-class": "Only one class has eligible due creators.",
  clear: "No eligible creators are due.",
};
export function YoutubeLiveAllocationPanel({
  allocation,
}: {
  allocation: YoutubeLiveAllocation | undefined;
}) {
  if (!allocation) return null;
  return (
    <details className="mt-3">
      <summary className="min-h-11 cursor-pointer text-sm text-fg">
        Live allocation diagnostics
      </summary>
      <div
        className="space-y-3 text-xs leading-5 text-muted"
        role="region"
        aria-label="YouTube live allocation"
      >
        <p className="font-medium text-fg">
          Last automatic dispatch: {allocation.liveSlots} known-live · {allocation.discoverySlots}{" "}
          discovery · {new Date(allocation.at).toLocaleTimeString()}
        </p>
        <p>
          {reasons[allocation.reason]} Mixed batches of at least two reserve at least 25% for
          discovery; a large or old backlog normally receives 75%. This changes slots, not request
          concurrency.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["Known live", allocation.knownLive],
              ["Discovery", allocation.discovery],
            ] as const
          ).map(([label, stats]) => (
            <div key={label} className="rounded-md border border-border p-3">
              <p className="font-medium text-fg">{label}</p>
              <p>
                {stats.due.toLocaleString()} ready · {stats.unchecked.toLocaleString()} never
                verified
              </p>
              <p>
                Oldest due observation:{" "}
                {stats.oldestDueMs === undefined
                  ? "No previous observation"
                  : Math.ceil(stats.oldestDueMs / 60_000).toLocaleString() + " min ago"}
              </p>
              <p>
                {stats.successful5m.toLocaleString()} distinct creators observed successfully in 5
                min (
                {(stats.successful5m / 5).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                /min average) · {stats.failed5m.toLocaleString()} latest attempts failed
              </p>
            </div>
          ))}
        </div>
        <p>
          Snapshot at dispatch, not a completion estimate. Retry waits, provider cooldowns,
          visibility and manual pause gates still apply. Failed attempts rotate behind older
          attempts without pretending they succeeded.
        </p>
      </div>
    </details>
  );
}
