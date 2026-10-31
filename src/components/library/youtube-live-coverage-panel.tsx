import { YoutubeLiveAllocationPanel } from './youtube-live-allocation-panel';
import { useDeferredValue, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { youtubeLiveEstimate } from "@/lib/videos/youtube-live-throughput";
import type { YoutubeLiveProgress } from "@/lib/videos/youtube-quick-live";
import type { youtubeLiveCoverage } from "@/lib/videos/youtube-live-health";

const duration = (seconds: number) =>
  seconds < 60 ? "under 1 min" : Math.ceil(seconds / 60) + " min";
export function YoutubeLiveCoveragePanel({
  coverage,
  scan,
  now,
  retryAt,
  onCheck,
}: {
  coverage: ReturnType<typeof youtubeLiveCoverage>;
  scan: YoutubeLiveProgress | null;
  now: number;
  retryAt: number;
  onCheck: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("due"),
    [page, setPage] = useState(0);
  const search = useDeferredValue(query.trim().toLowerCase()),
    running = scan?.status === "running";
  const estimate = youtubeLiveEstimate(scan?.throughput, coverage.due, running, retryAt, now);
  const filtered = useMemo(() => {
    if (!open) return [];
    const order = new Map(coverage.dueIds.map((id, i) => [id, i]));
    return coverage.queue
      .filter(
        (row) =>
          (filter === "all" || filter === "unchecked"
            ? filter === "all" || row.neverChecked
            : row.status === filter) &&
          (!search ||
            (row.channel.title + " " + row.channel.handle).toLowerCase().includes(search)),
      )
      .sort((a, b) =>
        filter === "due"
          ? (order.get(a.channel.id) ?? Infinity) - (order.get(b.channel.id) ?? Infinity)
          : a.nextAt - b.nextAt || a.channel.id.localeCompare(b.channel.id),
      );
  }, [open, coverage.queue, coverage.dueIds, filter, search]);
  const pages = Math.max(1, Math.ceil(filtered.length / 20)),
    current = Math.min(page, pages - 1),
    rows = filtered.slice(current * 20, current * 20 + 20);
  return (
    <div className="mt-3 border-t border-border pt-3">
      <div
        aria-label="YouTube live throughput"
        data-throughput-state={estimate.state}
        className="text-xs leading-5 text-muted"
      >
        {estimate.state === "active" ? (
          <>
            <p className="font-medium text-fg">
              {estimate.perMinute?.toLocaleString()} successful creator checks / min
            </p>
            <p>
              Ready queue estimate: {duration(estimate.minSeconds!)}{duration(estimate.minSeconds!) !== duration(estimate.maxSeconds!) ? '–' + duration(estimate.maxSeconds!) : ''} at the recent pace. This is a range; new due creators
              and provider delays can change it.
            </p>
          </>
        ) : (
          <p>
            {estimate.state === "waiting"
              ? "Estimate waiting · YouTube has an active provider cooldown."
              : estimate.state === "stalled"
                ? "Estimate unavailable · successful results have stopped arriving."
                : estimate.state === "warming"
                  ? "Measuring successful results · an estimate needs at least two successful batches over one second."
                  : estimate.state === "clear"
                    ? "No creators are due right now."
                    : "Estimate unavailable · no live sweep is running."}
          </p>
        )}
        {coverage.cooling > 0 && (
          <p>
            {coverage.cooling.toLocaleString()} creator retry waits are excluded from the
            ready-queue estimate.
          </p>
        )}
      </div>
      <YoutubeLiveAllocationPanel allocation={scan?.allocation} />
      <details className="mt-3" onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary className="min-h-11 cursor-pointer text-sm text-fg">
          YouTube creator check queue · {coverage.due.toLocaleString()} ready ·{" "}
          {coverage.cooling.toLocaleString()} waiting
        </summary>
        {open && (
          <div className="pt-2" role="region" aria-label="YouTube creator check queue">
            <p className="mb-3 text-xs leading-5 text-muted">
              See each creator’s last successful observation, latest attempt and next check. Opening
              this list does not start checks. Failed attempts are counted separately from
              successful freshness.
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                className="min-w-0 flex-1"
                aria-label="Search live check creators"
                placeholder="Find a creator"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(0);
                }}
              />
              <select
                className="min-h-11 rounded-md border border-border bg-surface px-3 text-sm text-fg"
                aria-label="Live check queue filter"
                value={filter}
                onChange={(event) => {
                  setFilter(event.target.value);
                  setPage(0);
                }}
              >
                <option value="due">Ready now</option>
                <option value="waiting">Waiting to retry</option>
                <option value="fresh">Not due yet</option>
                <option value="unchecked">Never verified</option>
                <option value="all">All creators</option>
              </select>
            </div>
            <p className="my-3 text-xs text-muted">
              {filtered.length.toLocaleString()} creators · page {current + 1} of {pages}
            </p>
            {!rows.length ? (
              <p className="py-3 text-sm text-muted">No creators match this queue view.</p>
            ) : (
              <ul className="space-y-2">
                {rows.map((row) => (
                  <li
                    key={row.channel.id}
                    data-live-queue-row={row.channel.id}
                    className="rounded-md border border-border p-3 text-xs leading-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="min-w-0 break-words font-medium text-fg">
                        {row.channel.title || row.channel.handle}
                      </p>
                      <span className="rounded bg-surface px-2 py-1 text-muted">
                        {row.status === "due"
                          ? "Ready"
                          : row.status === "waiting"
                            ? "Waiting to retry"
                            : "Not due yet"}
                        {row.failed ? " · latest attempt failed" : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-muted">
                      Last success:{" "}
                      {row.lastSuccessAt
                        ? new Date(row.lastSuccessAt).toLocaleString()
                        : "Never verified"}
                    </p>
                    <p className="text-muted">
                      Latest attempt:{" "}
                      {row.lastAttemptAt
                        ? new Date(row.lastAttemptAt).toLocaleString()
                        : "Not attempted"}
                      {row.nextAt > now
                        ? " · Next eligible " + new Date(row.nextAt).toLocaleTimeString()
                        : ""}
                    </p>
                    {row.failed && (
                      <p className="mt-1 break-words text-muted">
                        {row.channel.lastLiveFailure?.message?.slice(0, 240)}
                      </p>
                    )}
                    <Button
                      className="mt-2"
                      variant="secondary"
                      disabled={running || retryAt > now || row.status === "waiting"}
                      onClick={() => void onCheck(row.channel.id)}
                    >
                      Check {row.channel.title || row.channel.handle}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" disabled={!current} onClick={() => setPage(current - 1)}>
                Previous creators
              </Button>
              <Button
                variant="secondary"
                disabled={current + 1 >= pages}
                onClick={() => setPage(current + 1)}
              >
                Next creators
              </Button>
            </div>
          </div>
        )}
      </details>
    </div>
  );
}
