import { useState, useSyncExternalStore } from "react";
import { pullDispatchTrace } from "@/lib/pull-dispatch-trace";

function DispatchRows() {
  const events = useSyncExternalStore(
    pullDispatchTrace.subscribe,
    pullDispatchTrace.snapshot,
    pullDispatchTrace.snapshot,
  );
  return (
    <div className="pt-2" role="region" aria-label="Pull dispatch trace">
      <p className="max-w-3xl text-xs leading-5 text-muted">
        Session only · last 64 transitions. These are app requests, including server work inside
        each request. Started does not mean a provider has replied. Live uses independent lanes;
        page changes defer only automatic requests that have not started. Accepted results still
        drain through pause and visibility gates.
      </p>
      {!events.length ? (
        <p className="mt-3 text-sm text-muted">No pull requests in this session yet.</p>
      ) : (
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {events
            .slice(-12)
            .reverse()
            .map((event, index) => (
              <li
                key={event.id + ":" + event.phase + ":" + index}
                className="rounded-md border border-border p-3 text-xs leading-5"
              >
                <p className="font-medium text-fg">
                  #{event.id} · {event.lane} · {event.operation}
                </p>
                <p className="text-muted">
                  {event.phase === "held"
                    ? "Response ready · waiting for UI"
                    : event.phase === "started"
                      ? "In flight"
                      : event.phase === "deferred"
                        ? "Deferred to active page"
                        : event.phase}{" "}
                  · {new Date(event.at).toLocaleTimeString()}
                  {event.phase === "started"
                    ? " · queued " + event.waitedMs.toLocaleString() + " ms"
                    : ""}
                </p>
              </li>
            ))}
        </ol>
      )}
      {events.length > 12 && (
        <p className="mt-2 text-xs text-muted">
          Showing the latest 12 transitions from the bounded session trace.
        </p>
      )}
    </div>
  );
}
export function PullDispatchPanel() {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="mt-4 border-t border-border pt-3"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="min-h-11 cursor-pointer text-sm text-fg">
        Pull dispatch diagnostics
      </summary>
      {open && <DispatchRows />}
    </details>
  );
}
