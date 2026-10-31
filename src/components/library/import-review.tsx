import { pullsPaused, subscribePullControl } from "@/lib/pull-control";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cleanImportReview,
  emptyImportReview,
  importReviewRow,
  importReviewWindow,
  reviewedImportBatch,
  type ImportReviewState,
} from "@/lib/videos/import-review";
import type { FollowKind } from "@/lib/videos/types";
type Result = { failedQueries?: string[]; failedReasons?: Record<string, string> } | undefined;
const EMPTY_REVIEW = emptyImportReview();
const labels = {
  saved: "Already verified",
  ready: "Ready for explicit import",
  held: "Name held for review",
  excluded: "Excluded",
  failed: "Needs retry",
};
export function CreatorImportReview({
  kind,
  queries,
  resolved,
  value,
  onChange,
  onImport,
  busy,
}: {
  kind: FollowKind;
  queries: readonly string[];
  resolved: ReadonlySet<string>;
  value?: ImportReviewState;
  onChange: (state: ImportReviewState) => void;
  onImport: (items: Array<{ query: string; kind: FollowKind }>) => Promise<Result>;
  busy: boolean;
}) {
  const paused = useSyncExternalStore(subscribePullControl, pullsPaused, () => false);
  const state = value ?? EMPTY_REVIEW,
    [offset, setOffset] = useState(0),
    [message, setMessage] = useState(""),
    [working, setWorking] = useState(false);
  const importing = useRef(false);
  const box = useRef<HTMLDivElement>(null),
    latest = useRef(state),
    live = useRef(true);
  latest.current = state;
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  const settled = useDeferredValue(state.filter),
    rows = useMemo(
      () => queries.map((query) => importReviewRow(kind, query, state, resolved)),
      [queries, kind, state.choices, state.failures, resolved],
    );
  const filtered = useMemo(
    () =>
      rows.filter(
        (row) =>
          (state.status === "all" || row.status === state.status) &&
          (!settled || row.query.toLowerCase().includes(settled.toLowerCase())),
      ),
    [rows, state.status, settled],
  );
  const current = Math.max(
      0,
      filtered.findIndex((row) => row.key === state.focusKey),
    ),
    window = importReviewWindow(filtered.length, offset),
    visible = filtered.slice(window.start, window.end);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const top = current * 112;
    if (top < el.scrollTop || top + 112 > el.scrollTop + 448) {
      el.scrollTop = top;
      setOffset(top);
    }
  }, [current, filtered]);
  const toggle = (key: string) => {
    const row = rows.find((row) => row.key === key);
    if (!row || row.status === "saved" || busy || working) return;
    const failures = { ...state.failures };
    delete failures[key];
    onChange({
      ...state,
      choices: { ...state.choices, [key]: row.included ? "skip" : "include" },
      failures,
      focusKey: key,
    });
  };
  const batch = useMemo(
    () => reviewedImportBatch(kind, queries, state, resolved, state.status === "failed"),
    [kind, queries, state.choices, state.failures, resolved, state.status],
  );
  const run = async () => {
    if (!batch.length || importing.current || busy) return;
    importing.current = true;
    setWorking(true);
    try {
      setMessage(`Checking up to ${batch.length} reviewed entries…`);
      const result = await onImport(batch);
      if (!live.current) return;
      if (!result) {
        setMessage("The batch did not finish. Your choices remain saved; retry when ready.");
        return;
      }
      const failures = { ...latest.current.failures },
        choices = { ...latest.current.choices };
      for (const item of batch)
        delete failures[importReviewRow(kind, item.query, state, resolved).key];
      for (const query of result.failedQueries ?? []) {
        const key = importReviewRow(kind, query, state, resolved).key;
        Object.defineProperty(choices, key, {
          value: "failed",
          enumerable: true,
          writable: true,
          configurable: true,
        });
        Object.defineProperty(failures, key, {
          value: result.failedReasons?.[query] ?? "The provider could not verify this entry.",
          enumerable: true,
          writable: true,
          configurable: true,
        });
      }
      onChange({
        ...latest.current,
        choices,
        failures: cleanImportReview({ ...latest.current, failures })!.failures,
      });
      setMessage(
        "Batch finished. Only verified identities count as saved; unprocessed and unresolved entries remain for review.",
      );
    } catch {
      if (live.current)
        setMessage("The batch could not finish. Your choices remain saved; retry when ready.");
    } finally {
      importing.current = false;
      if (live.current) setWorking(false);
    }
  };
  return (
    <section
      className="mt-4 min-w-0 rounded-lg border border-border p-3"
      aria-label="Creator import review"
      data-import-review
    >
      <h3 className="font-medium text-fg">Review creator imports</h3>
      <p className="mt-2 text-xs leading-5 text-muted">
        {queries.length.toLocaleString()} unique entries. Exact links and handles are ready; plain
        YouTube names stay held until you include them. Matching still requires one unambiguous
        public identity. Each explicit batch checks at most 50 entries.
      </p>
      <Input
        className="mt-3 min-h-11"
        aria-label="Search import review"
        placeholder="Filter your import list"
        value={state.filter}
        maxLength={200}
        onChange={(e) => onChange({ ...state, filter: e.target.value })}
      />
      <select
        className="mt-2 min-h-11 max-w-full rounded-md border border-border bg-bg px-3 text-sm text-fg"
        aria-label="Import review status"
        value={state.status}
        onChange={(e) =>
          onChange({ ...state, status: e.target.value as ImportReviewState["status"] })
        }
      >
        {(["all", "ready", "held", "excluded", "saved", "failed"] as const).map((status) => (
          <option key={status} value={status}>
            {status === "all" ? "All entries" : labels[status]}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs text-muted">
        {filtered.length.toLocaleString()} matching · Arrow keys, Home/End to move · Space to
        include or exclude
      </p>
      <div
        ref={box}
        role="listbox"
        aria-label="Import review entries"
        aria-multiselectable="true"
        aria-activedescendant={
          filtered.length && current >= window.start && current < window.end
            ? `import-review-${kind}-${current}`
            : undefined
        }
        tabIndex={0}
        className="mt-2 h-112 max-h-112 overflow-y-auto rounded-md bg-bg/45 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onScroll={(e) => setOffset(e.currentTarget.scrollTop)}
        onKeyDown={(e) => {
          const base =
            current >= window.start && current < window.end
              ? current
              : Math.min(filtered.length - 1, Math.floor(offset / 112));
          let next = base;
          if (e.key === "ArrowDown") next = Math.min(filtered.length - 1, base + 1);
          else if (e.key === "ArrowUp") next = Math.max(0, base - 1);
          else if (e.key === "Home") next = 0;
          else if (e.key === "End") next = filtered.length - 1;
          else if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (filtered[base]) toggle(filtered[base].key);
            return;
          } else return;
          e.preventDefault();
          if (filtered[next]) onChange({ ...state, focusKey: filtered[next].key });
        }}
      >
        <div style={{ height: filtered.length * 112, position: "relative" }}>
          {visible.map((row, index) => {
            const position = window.start + index;
            return (
              <div
                key={row.key}
                id={`import-review-${kind}-${position}`}
                role="option"
                aria-selected={row.included || row.status === "saved"}
                aria-disabled={row.status === "saved" || busy || working}
                aria-posinset={position + 1}
                aria-setsize={filtered.length}
                data-import-review-row
                data-query={row.query}
                className={`absolute inset-x-0 flex h-28 min-w-0 cursor-pointer items-center gap-3 border-b border-border px-3 ${position === current ? "bg-elevated" : "hover:bg-elevated/50"}`}
                style={{ top: position * 112 }}
                onClick={() => toggle(row.key)}
              >
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-accent"
                >
                  {row.included || row.status === "saved" ? "✓" : "–"}
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 break-all text-sm text-fg">{row.query}</span>
                  <span className="mt-1 block truncate text-xs text-muted" title={row.reason}>
                    {row.reason ??
                      (row.status === "failed"
                        ? "Previous attempt failed. Explicit retry required."
                        : labels[row.status])}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {!filtered.length && <p className="mt-2 text-sm text-muted">No entries match this filter.</p>}
      <Button
        className="mt-3 min-h-11"
        disabled={busy || working || !batch.length}
        onClick={() => void run()}
      >
        {state.status === "failed" ? "Retry reviewed failures" : "Import next reviewed batch"}
      </Button>
      {working && paused && (
        <p role="status" className="mt-2 text-xs leading-5 text-accent">
          Import waiting: pulls are paused. Use Resume pulls in the top bar to continue this
          accepted batch.
        </p>
      )}
      {message && (
        <p role="status" className="mt-2 text-xs leading-5 text-muted">
          {message}
        </p>
      )}
    </section>
  );
}
